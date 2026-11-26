/* =========================================================
   season-calendar.js – Lịch mùa vụ tương tác (kéo–thả dời giai đoạn)
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;
  var PHASE_ORDER = ["gieo", "cay", "cham-soc", "bon-phan", "thu-hoach"];

  var state = {
    user: null,
    seasons: [],
    season: null,
    month: startOfMonth(new Date())
  };

  document.addEventListener("agri:shell-ready", function (event) {
    if (document.body.dataset.page !== "student-season-calendar") return;
    state.user = event.detail.user;
    if (!state.user) return;
    init();
  });

  function init() {
    state.seasons = API.where("seasons", function (s) { return s.ownerId === state.user.id; });
    var requested = new URLSearchParams(location.search).get("season");
    state.season = state.seasons.find(function (s) { return s.id === requested; }) || state.seasons[0] || null;

    var select = A.$("#season-select");
    select.innerHTML = state.seasons.length
      ? state.seasons.map(function (s) {
        var crop = API.find("crops", s.cropId);
        return '<option value="' + s.id + '">' + A.esc(crop ? crop.name : "Mùa vụ") + " · " + A.esc(s.region) + "</option>";
      }).join("")
      : '<option value="">Chưa có mùa vụ</option>';
    if (state.season) select.value = state.season.id;

    select.addEventListener("change", function () {
      state.season = state.seasons.find(function (s) { return s.id === select.value; }) || null;
      if (state.season) state.month = startOfMonth(A.toDate(state.season.start));
      renderAll();
    });

    A.$("#cal-prev").addEventListener("click", function () { shiftMonth(-1); });
    A.$("#cal-next").addEventListener("click", function () { shiftMonth(1); });
    A.$("#cal-today").addEventListener("click", function () {
      state.month = startOfMonth(new Date());
      renderAll();
    });
    A.$("#season-add").addEventListener("click", openCreateSeason);
    A.$("#season-delete").addEventListener("click", deleteSeason);

    renderLegend();
    renderAll();
  }

  function shiftMonth(delta) {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + delta, 1);
    renderAll();
  }

  function renderAll() {
    var hasSeason = !!state.season;
    A.$("#season-delete").disabled = !hasSeason;
    renderMonth();
    renderPhaseEditor();
    renderAgenda();
  }

  /* ---------- Lịch tháng ---------- */

  function renderMonth() {
    var root = A.$("#cal-root");
    var label = A.$("#cal-label");
    var m = state.month;
    label.textContent = "Tháng " + (m.getMonth() + 1) + ", " + m.getFullYear();

    if (!state.season) {
      root.innerHTML = A.emptyState({
        icon: "🗓",
        title: "Bạn chưa có mùa vụ nào",
        text: "Tạo mùa vụ đầu tiên để xem và kéo–thả các giai đoạn gieo trồng, chăm sóc, thu hoạch.",
        action: '<button class="btn btn--primary" type="button" id="empty-create">Tạo mùa vụ</button>'
      });
      var btn = A.$("#empty-create");
      if (btn) btn.addEventListener("click", openCreateSeason);
      return;
    }

    var phases = state.season.phases || [];
    var first = new Date(m.getFullYear(), m.getMonth(), 1);
    var offset = (first.getDay() + 6) % 7;
    var gridStart = addDays(first, -offset);
    var todayISO = A.isoDate(new Date());

    var html = '<div class="calendar__dow">' +
      ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(function (d) { return "<span>" + d + "</span>"; }).join("") +
      '</div><div class="calendar__grid">';

    for (var i = 0; i < 42; i++) {
      var day = addDays(gridStart, i);
      var iso = A.isoDate(day);
      var classes = ["day"];
      if (day.getMonth() !== m.getMonth()) classes.push("day--out");
      if (iso === todayISO) classes.push("day--today");
      if ([0, 6].indexOf(day.getDay()) >= 0) classes.push("day--weekend");

      var chips = phases.map(function (phase, index) {
        if (iso < phase.from || iso > phase.to) return "";
        var startOfPhase = iso === phase.from;
        return '<div class="phase-chip" draggable="true" data-index="' + index + '" data-phase="' + phase.phase + '" ' +
          'title="' + A.esc(A.phaseLabel(phase.phase) + ": " + A.formatDate(phase.from) + " – " + A.formatDate(phase.to)) + '">' +
          '<span class="handle" aria-hidden="true">⠿</span>' +
          '<span class="range">' + (startOfPhase ? A.formatDate(phase.from, { short: true }) + " · " : "") + "</span>" +
          A.esc(A.PHASES[phase.phase] ? A.PHASES[phase.phase].short : phase.phase) +
          "</div>";
      }).join("");

      html += '<div class="' + classes.join(" ") + '" data-date="' + iso + '">' +
        '<span class="day__num">' + day.getDate() + "</span>" +
        '<div class="day__badges">' + chips + "</div></div>";
    }

    html += "</div>";
    root.innerHTML = html;
    bindDrag(root);
  }

  function bindDrag(root) {
    A.$$(".phase-chip", root).forEach(function (chip) {
      chip.addEventListener("dragstart", function (event) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", chip.dataset.index);
        chip.classList.add("is-dragging");
      });
      chip.addEventListener("dragend", function () {
        chip.classList.remove("is-dragging");
        A.$$(".day.is-drop-target", root).forEach(function (d) { d.classList.remove("is-drop-target"); });
      });
      chip.addEventListener("click", function (event) {
        event.stopPropagation();
        openPhaseModal(Number(chip.dataset.index));
      });
    });

    A.$$(".day", root).forEach(function (cell) {
      cell.addEventListener("dragover", function (event) {
        event.preventDefault();
        cell.classList.add("is-drop-target");
      });
      cell.addEventListener("dragleave", function () { cell.classList.remove("is-drop-target"); });
      cell.addEventListener("drop", function (event) {
        event.preventDefault();
        cell.classList.remove("is-drop-target");
        var index = Number(event.dataTransfer.getData("text/plain"));
        if (isNaN(index)) return;
        movePhase(index, cell.dataset.date);
      });
    });
  }

  function movePhase(index, targetISO) {
    var season = state.season;
    var phase = season.phases[index];
    if (!phase) return;
    if (phase.from === targetISO) return;

    var duration = daysBetween(phase.from, phase.to);
    var newPhase = { phase: phase.phase, from: targetISO, to: addDaysISO(targetISO, duration) };

    var phases = season.phases.map(function (p, i) { return i === index ? newPhase : p; });
    API.update("seasons", season.id, { phases: phases });
    state.season = API.find("seasons", season.id);

    A.toast("success", "Đã dời giai đoạn",
      A.phaseLabel(newPhase.phase) + ": " + A.formatDate(newPhase.from) + " – " + A.formatDate(newPhase.to) +
      " (" + (duration + 1) + " ngày)");
    API.logActivity(state.user.name + " dời giai đoạn " + A.phaseLabel(newPhase.phase) + " của " +
      cropName() + " sang " + A.formatDate(newPhase.from));

    renderAll();
  }

  /* ---------- Bảng giai đoạn ---------- */

  function renderPhaseEditor() {
    var host = A.$("#phase-editor");
    if (!state.season) { host.innerHTML = '<p class="small muted">Chưa có dữ liệu.</p>'; return; }

    host.innerHTML = state.season.phases.map(function (phase, index) {
      return '<div class="row" data-index="' + index + '">' +
        '<span class="name">' + A.esc(A.phaseLabel(phase.phase)) + "</span>" +
        '<input type="date" data-field="from" value="' + phase.from + '" aria-label="Ngày bắt đầu ' + A.esc(A.phaseLabel(phase.phase)) + '">' +
        '<span class="muted small">→</span>' +
        '<input type="date" data-field="to" value="' + phase.to + '" aria-label="Ngày kết thúc ' + A.esc(A.phaseLabel(phase.phase)) + '">' +
        "</div>";
    }).join("");

    A.$$("input[type=date]", host).forEach(function (input) {
      input.addEventListener("change", function () {
        var row = input.closest(".row");
        var index = Number(row.dataset.index);
        var fromEl = row.querySelector('[data-field="from"]');
        var toEl = row.querySelector('[data-field="to"]');
        if (!fromEl.value || !toEl.value) {
          A.toast("error", "Ngày không hợp lệ", "Cần nhập đủ ngày bắt đầu và kết thúc.");
          return;
        }
        if (fromEl.value > toEl.value) {
          A.toast("error", "Khoảng thời gian sai", "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
          fromEl.value = state.season.phases[index].from;
          toEl.value = state.season.phases[index].to;
          return;
        }
        var phases = state.season.phases.map(function (p, i) {
          return i === index ? { phase: p.phase, from: fromEl.value, to: toEl.value } : p;
        });
        API.update("seasons", state.season.id, { phases: phases });
        state.season = API.find("seasons", state.season.id);
        A.toast("success", "Đã cập nhật giai đoạn", A.phaseLabel(phases[index].phase) + " · " +
          A.formatDate(fromEl.value) + " – " + A.formatDate(toEl.value));
        renderMonth();
        renderAgenda();
      });
    });
  }

  function renderAgenda() {
    var host = A.$("#cal-agenda");
    if (!state.season) { host.innerHTML = ""; return; }

    var m = state.month;
    var mStart = A.isoDate(new Date(m.getFullYear(), m.getMonth(), 1));
    var mEnd = A.isoDate(new Date(m.getFullYear(), m.getMonth() + 1, 0));
    var items = state.season.phases.filter(function (p) { return p.from <= mEnd && p.to >= mStart; });

    if (!items.length) {
      host.innerHTML = '<p class="small muted" style="margin:0">Tháng này chưa có giai đoạn nào. Kéo một giai đoạn vào lịch để sắp xếp.</p>';
      return;
    }

    host.innerHTML = items.sort(function (a, b) { return a.from < b.from ? -1 : 1; }).map(function (p) {
      return '<div class="agenda__item" data-phase="' + p.phase + '"><span class="bar"></span><div>' +
        "<strong>" + A.esc(A.phaseLabel(p.phase)) + "</strong>" +
        "<span>" + A.formatDate(p.from) + " – " + A.formatDate(p.to) + " · " + (daysBetween(p.from, p.to) + 1) + " ngày</span></div></div>";
    }).join("");
  }

  function renderLegend() {
    A.$("#cal-legend").innerHTML = PHASE_ORDER.map(function (key) {
      return '<span class="item"><span class="swatch" style="background:' + A.PHASES[key].color + '"></span>' +
        A.esc(A.PHASES[key].label) + "</span>";
    }).join("") + '<span class="item muted">Kéo nhãn giai đoạn vào một ngày để dời lịch · bấm nhãn để sửa ngày</span>';
  }

  /* ---------- Modal ---------- */

  function openPhaseModal(index) {
    var phase = state.season.phases[index];
    if (!phase) return;

    var body =
      '<div class="form-grid"><div class="field"><label for="pm-from">Bắt đầu</label>' +
      '<input class="input" id="pm-from" type="date" value="' + phase.from + '"></div>' +
      '<div class="field"><label for="pm-to">Kết thúc</label>' +
      '<input class="input" id="pm-to" type="date" value="' + phase.to + '"></div></div>' +
      '<p class="field__hint mt-1">Giai đoạn <strong>' + A.esc(A.phaseLabel(phase.phase)) + "</strong> của " +
      A.esc(cropName()) + ". Bạn cũng có thể kéo nhãn trên lịch để dời lịch nhanh.</p>";

    var actions = '<button class="btn btn--ghost" data-act="cancel" type="button">Hủy</button>' +
      '<button class="btn btn--primary" data-act="save" type="button">Lưu thay đổi</button>';

    var modal = A.openModal({ title: "Sửa giai đoạn: " + A.phaseLabel(phase.phase), body: body, actions: actions });
    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", function () {
      var from = modal.querySelector("#pm-from").value;
      var to = modal.querySelector("#pm-to").value;
      if (!from || !to || from > to) {
        A.toast("error", "Ngày không hợp lệ", "Kiểm tra lại khoảng thời gian của giai đoạn.");
        return;
      }
      var phases = state.season.phases.map(function (p, i) {
        return i === index ? { phase: p.phase, from: from, to: to } : p;
      });
      API.update("seasons", state.season.id, { phases: phases });
      state.season = API.find("seasons", state.season.id);
      A.closeModal();
      A.toast("success", "Đã lưu giai đoạn", A.phaseLabel(phase.phase) + " · " + A.formatDate(from) + " – " + A.formatDate(to));
      renderAll();
    });
  }

  function openCreateSeason() {
    var crops = API.list("crops");
    var body =
      '<div class="form-grid"><div class="field full"><label for="cs-crop">Cây trồng</label>' +
      '<select class="select" id="cs-crop">' + crops.map(function (c) {
        return '<option value="' + c.id + '">' + A.esc(c.name) + " · " + A.esc(c.region) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field full"><label for="cs-start">Ngày bắt đầu gieo/trồng</label>' +
      '<input class="input" id="cs-start" type="date" value="' + A.isoDate(new Date()) + '"></div></div>' +
      '<p class="field__hint mt-1">Hệ thống tạo sẵn 4 giai đoạn gợi ý; bạn có thể kéo–thả hoặc sửa ngày sau khi tạo.</p>';

    var actions = '<button class="btn btn--ghost" data-act="cancel" type="button">Hủy</button>' +
      '<button class="btn btn--primary" data-act="save" type="button">Tạo mùa vụ</button>';

    var modal = A.openModal({ title: "Thêm mùa vụ mới", body: body, actions: actions });
    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", function () {
      var cropId = modal.querySelector("#cs-crop").value;
      var start = modal.querySelector("#cs-start").value;
      if (!start) {
        A.toast("error", "Thiếu ngày bắt đầu", "Chọn ngày bắt đầu gieo/trồng.");
        return;
      }
      var crop = API.find("crops", cropId);
      var season = API.insert("seasons", {
        cropId: cropId,
        region: crop ? crop.region : "",
        start: start,
        ownerId: state.user.id,
        phases: [
          { phase: "gieo", from: start, to: addDaysISO(start, 12) },
          { phase: "cham-soc", from: addDaysISO(start, 14), to: addDaysISO(start, 90) },
          { phase: "bon-phan", from: addDaysISO(start, 30), to: addDaysISO(start, 50) },
          { phase: "thu-hoach", from: addDaysISO(start, 110), to: addDaysISO(start, 130) }
        ]
      });
      API.logActivity(state.user.name + " tạo mùa vụ " + (crop ? crop.name : "") + " bắt đầu " + A.formatDate(start));
      A.closeModal();
      A.toast("success", "Đã tạo mùa vụ", (crop ? crop.name : "Mùa vụ") + " · bắt đầu " + A.formatDate(start));
      location.reload();
    });
  }

  function deleteSeason() {
    if (!state.season) return;
    A.confirm({
      title: "Xóa mùa vụ?",
      message: "Mùa vụ " + cropName() + " và toàn bộ lịch giai đoạn sẽ bị xóa khỏi tài khoản của bạn. Nhật ký cây trồng liên quan vẫn được giữ.",
      confirmText: "Xóa mùa vụ",
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      API.remove("seasons", state.season.id);
      A.toast("success", "Đã xóa mùa vụ", cropName() + " đã được gỡ khỏi lịch.");
      setTimeout(function () { location.reload(); }, 500);
    });
  }

  /* ---------- Tiện ích ---------- */

  function cropName() {
    var crop = state.season && API.find("crops", state.season.cropId);
    return crop ? crop.name : "Mùa vụ";
  }

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function addDays(d, n) {
    var copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    copy.setDate(copy.getDate() + n);
    return copy;
  }

  function addDaysISO(iso, n) {
    return A.isoDate(addDays(A.toDate(iso), n));
  }

  function daysBetween(aISO, bISO) {
    return Math.round((A.toDate(bISO) - A.toDate(aISO)) / 86400000);
  }
})();
