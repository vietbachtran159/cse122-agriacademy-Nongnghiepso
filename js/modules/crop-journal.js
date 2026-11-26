/* =========================================================
   crop-journal.js – Nhật ký cây trồng (CRUD)
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;

  var state = { user: null };

  document.addEventListener("agri:shell-ready", function (event) {
    if (document.body.dataset.page !== "student-crop-journal") return;
    state.user = event.detail.user;
    if (!state.user) return;
    init();
  });

  function init() {
    var crops = API.list("crops");
    var cropSelect = A.$("#journal-crop");
    var search = A.$("#journal-search");

    cropSelect.insertAdjacentHTML("beforeend", crops.map(function (c) {
      return '<option value="' + c.id + '">' + A.esc(c.name) + "</option>";
    }).join(""));

    cropSelect.addEventListener("change", render);
    search.addEventListener("input", render);
    A.$("#journal-add").addEventListener("click", function () { openEditor(null); });
    A.$("#journal-today").addEventListener("click", function () { openEditor(null, true); });

    render();
  }

  function mine() {
    return API.where("cropJournals", function (j) { return j.userId === state.user.id; })
      .sort(function (a, b) { return (a.date === b.date) ? (b.createdAt || "").localeCompare(a.createdAt || "") : (a.date < b.date ? 1 : -1); });
  }

  function render() {
    var host = A.$("#journal-list");
    var keyword = (A.$("#journal-search").value || "").trim().toLowerCase();
    var cropFilter = A.$("#journal-crop").value;

    var rows = mine().filter(function (row) {
      if (cropFilter && row.cropId !== cropFilter) return false;
      if (!keyword) return true;
      var crop = API.find("crops", row.cropId);
      var haystack = [row.activity, row.note, row.weather, crop ? crop.name : ""].join(" ").toLowerCase();
      return haystack.indexOf(keyword) >= 0;
    });

    A.$("#journal-count").textContent = rows.length + " bản ghi";

    var total = mine();
    var thisMonth = total.filter(function (j) {
      var d = A.toDate(j.date);
      var now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    var distinctCrops = total.filter(function (j, i, arr) {
      return arr.findIndex(function (x) { return x.cropId === j.cropId; }) === i;
    });
    var stats = A.$("#journal-stats");
    if (stats) {
      stats.innerHTML =
        kpi(total.length, "tổng bản ghi") +
        kpi(thisMonth.length, "trong tháng này") +
        kpi(distinctCrops.length, "cây trồng theo dõi");
    }

    if (!rows.length) {
      host.innerHTML = A.emptyState({
        icon: "✎",
        title: keyword || cropFilter ? "Không có bản ghi phù hợp" : "Nhật ký còn trống",
        text: keyword || cropFilter
          ? "Thử từ khóa khác hoặc bỏ bộ lọc cây trồng."
          : "Ghi lại việc đã làm sau mỗi lần thăm ruộng: bón phân, phun thuốc, tỉa nhánh…",
        action: '<button class="btn btn--primary" type="button" id="journal-empty-add">Ghi bản ghi đầu tiên</button>'
      });
      var add = A.$("#journal-empty-add");
      if (add) add.addEventListener("click", function () { openEditor(null); });
      return;
    }

    var html = "";
    var lastMonth = "";
    rows.forEach(function (row) {
      var d = A.toDate(row.date);
      var monthKey = d.getFullYear() + "-" + (d.getMonth() + 1);
      if (monthKey !== lastMonth) {
        lastMonth = monthKey;
        html += '<p class="journal-group-label">Tháng ' + (d.getMonth() + 1) + ", " + d.getFullYear() + "</p>";
      }
      var crop = API.find("crops", row.cropId);
      var monthShort = ["Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6", "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"][d.getMonth()];

      html += '<article class="journal-item">' +
        '<div class="when"><b>' + d.getDate() + "</b><span>" + monthShort + "</span></div>" +
        "<div><h4>" + A.esc(row.activity) + "</h4>" +
        '<div class="crop-line">🌱 ' + A.esc(crop ? crop.name : "Cây trồng") + " · " + A.formatDate(row.date) + "</div>" +
        "<p>" + A.esc(row.note) + "</p>" +
        (row.weather ? '<span class="wx">☁ Thời tiết: ' + A.esc(row.weather) + "</span>" : "") + "</div>" +
        '<div class="row-actions">' +
        '<button class="btn btn--link btn--sm" type="button" data-edit="' + row.id + '">Sửa</button>' +
        '<button class="btn btn--link btn--sm" type="button" data-del="' + row.id + '" style="color:var(--red-600)">Xóa</button>' +
        "</div></article>";
    });
    host.innerHTML = html;

    A.$$("[data-edit]", host).forEach(function (btn) {
      btn.addEventListener("click", function () { openEditor(btn.dataset.edit); });
    });
    A.$$("[data-del]", host).forEach(function (btn) {
      btn.addEventListener("click", function () { removeEntry(btn.dataset.del); });
    });
  }

  function kpi(value, label) {
    return '<div class="kpi"><b>' + value + "</b><span>" + label + "</span></div>";
  }

  function openEditor(id, today) {
    var entry = id ? API.find("cropJournals", id) : null;
    var crops = API.list("crops");

    var body =
      '<form id="journal-form" novalidate><div class="form-grid">' +
      '<div class="field"><label for="j-crop">Cây trồng <span class="req">*</span></label>' +
      '<select class="select" id="j-crop" name="cropId">' + crops.map(function (c) {
        return '<option value="' + c.id + '"' + (entry && entry.cropId === c.id ? " selected" : "") + ">" + A.esc(c.name) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label for="j-date">Ngày thực hiện <span class="req">*</span></label>' +
      '<input class="input" id="j-date" name="date" type="date" value="' + (entry ? entry.date : today ? A.isoDate(new Date()) : A.isoDate(new Date())) + '"></div>' +
      '<div class="field full"><label for="j-activity">Hoạt động <span class="req">*</span></label>' +
      '<input class="input" id="j-activity" name="activity" maxlength="80" placeholder="Ví dụ: Bón thúc đẻ nhánh" value="' +
      A.esc(entry ? entry.activity : "") + '"></div>' +
      '<div class="field full"><label for="j-note">Chi tiết</label>' +
      '<textarea class="textarea" id="j-note" name="note" placeholder="Liều lượng, diện tích, tình trạng cây…">' +
      A.esc(entry ? entry.note : "") + "</textarea></div>" +
      '<div class="field full"><label for="j-weather">Thời tiết</label>' +
      '<input class="input" id="j-weather" name="weather" maxlength="50" placeholder="Nắng nhẹ, 24°C" value="' +
      A.esc(entry ? entry.weather : "") + '"></div></div></form>';

    var actions = '<button class="btn btn--ghost" type="button" data-act="cancel">Hủy</button>' +
      '<button class="btn btn--primary" type="button" data-act="save">' + (entry ? "Lưu thay đổi" : "Thêm bản ghi") + "</button>";

    var modal = A.openModal({ title: entry ? "Sửa bản ghi nhật ký" : "Ghi nhật ký cây trồng", body: body, actions: actions });
    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", save);

    function save() {
      var form = modal.querySelector("#journal-form");
      A.clearErrors(form);
      var v = A.formValues(form);
      var valid = true;
      if (!v.activity) { A.setFieldError(modal.querySelector("#j-activity"), "Nhập hoạt động đã thực hiện."); valid = false; }
      if (!v.date) { A.setFieldError(modal.querySelector("#j-date"), "Chọn ngày thực hiện."); valid = false; }
      if (!valid) return;

      var season = API.where("seasons", function (s) {
        return s.ownerId === state.user.id && s.cropId === v.cropId;
      })[0];

      var payload = {
        userId: state.user.id,
        cropId: v.cropId,
        seasonId: season ? season.id : null,
        date: v.date,
        activity: v.activity,
        note: v.note,
        weather: v.weather
      };

      if (entry) {
        API.update("cropJournals", entry.id, payload);
        A.toast("success", "Đã cập nhật nhật ký", v.activity + " · " + A.formatDate(v.date));
      } else {
        payload.createdAt = API.nowISO();
        API.insert("cropJournals", payload);
        A.toast("success", "Đã thêm bản ghi", v.activity + " · " + A.formatDate(v.date));
        var crop = API.find("crops", v.cropId);
        API.logActivity(state.user.name + " ghi nhật ký " + v.activity + " cho " + (crop ? crop.name : "cây trồng"));
      }

      A.closeModal();
      render();
    }
  }

  function removeEntry(id) {
    var entry = API.find("cropJournals", id);
    if (!entry) return;
    A.confirm({
      title: "Xóa bản ghi?",
      message: "Bản ghi \"" + entry.activity + "\" ngày " + A.formatDate(entry.date) + " sẽ bị xóa vĩnh viễn.",
      confirmText: "Xóa",
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      API.remove("cropJournals", id);
      A.toast("success", "Đã xóa bản ghi", entry.activity);
      render();
    });
  }
})();
