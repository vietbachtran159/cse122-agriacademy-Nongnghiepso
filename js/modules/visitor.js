/* =========================================================
   visitor.js – Trang khách: giới thiệu khóa học, thư viện cây trồng,
   hướng dẫn mùa vụ
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;

  var GLYPHS = {
    "Lúa": "🌾", "Ngô": "🌽", "Cà chua": "🍅", "Cải bắp": "🥬",
    "Cam": "🍊", "Chè": "🍵", "Dưa hấu": "🍉"
  };

  var PHASE_TIPS = {
    "gieo": "Chọn giống sạch bệnh, xử lý hạt trước khi gieo, giữ ẩm ổn định cho hạt nảy mầm.",
    "cay": "Cấy/trồng đúng mật độ, tưới đẫm sau trồng và che nắng 2–3 ngày đầu.",
    "cham-soc": "Làm cỏ, tỉa nhánh, theo dõi sâu bệnh 2 lần/tuần và ghi nhật ký.",
    "bon-phan": "Bón đúng công thức, chia nhỏ nhiều đợt, tránh bón sát gốc khi trời nắng.",
    "thu-hoach": "Thu đúng độ chín, phân loại quả/hạt ngay tại ruộng, bảo quản khô ráo."
  };

  document.addEventListener("agri:shell-ready", function () {
    var page = document.body.dataset.page;
    if (page === "visitor-course-overview") initOverview();
    if (page === "visitor-crop-library") initLibrary();
    if (page === "visitor-season-guide") initGuide();
  });

  function glyph(crop) {
    return GLYPHS[crop.name] || "🌱";
  }

  /* ---------- Giới thiệu khóa học ---------- */

  function initOverview() {
    var lessons = API.where("lessons", function (l) { return l.status === "published"; });
    var crops = API.list("crops");
    var pests = API.where("pests", function (p) { return p.status === "approved"; });
    var exercises = API.where("exercises", function (e) { return e.status === "published"; });

    A.$$("[data-count]").forEach(function (node) {
      var key = node.dataset.count;
      var value = { lessons: lessons.length, crops: crops.length, pests: pests.length, exercises: exercises.length }[key];
      if (typeof value === "number") node.textContent = value;
    });

    var preview = A.$("#overview-lessons");
    if (preview) {
      preview.innerHTML = lessons.slice(0, 4).map(function (lesson) {
        return '<li class="list-row"><span class="ico" aria-hidden="true">▤</span>' +
          '<span class="grow"><strong>' + A.esc(lesson.title) + "</strong><span>" +
          A.esc(lesson.topic) + " · " + lesson.durationMin + " phút</span></span>" +
          '<span class="badge badge--success">Công khai</span></li>';
      }).join("");
    }

    var cropStrip = A.$("#overview-crops");
    if (cropStrip) {
      cropStrip.innerHTML = crops.slice(0, 7).map(function (crop) {
        return '<a class="pill" href="visitor-crop-library.html?crop=' + encodeURIComponent(crop.id) + '">' +
          '<span aria-hidden="true">' + glyph(crop) + "</span>" + A.esc(crop.name) + "</a>";
      }).join("");
    }
  }

  /* ---------- Thư viện cây trồng ---------- */

  function initLibrary() {
    var grid = A.$("#crop-grid");
    if (!grid) return;

    var crops = API.list("crops");
    var q = new URLSearchParams(location.search);

    var searchInput = A.$("#lib-search");
    var regionSelect = A.$("#lib-region");
    var seasonSelect = A.$("#lib-season");

    if (searchInput && q.get("q")) searchInput.value = q.get("q");

    var regions = uniq(crops.map(function (c) { return c.region; }));
    var seasons = uniq(crops.map(function (c) { return c.season; }));
    if (regionSelect) {
      regionSelect.insertAdjacentHTML("beforeend", regions.map(function (r) {
        return '<option value="' + A.esc(r) + '">' + A.esc(r) + "</option>";
      }).join(""));
    }
    if (seasonSelect) {
      seasonSelect.insertAdjacentHTML("beforeend", seasons.map(function (s) {
        return '<option value="' + A.esc(s) + '">' + A.esc(s) + "</option>";
      }).join(""));
    }

    var focusCrop = q.get("crop");

    function currentList() {
      var keyword = (searchInput && searchInput.value || "").trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : "";
      var season = seasonSelect ? seasonSelect.value : "";
      return crops.filter(function (crop) {
        var haystack = [crop.name, crop.scientificName, crop.region, crop.season, crop.note].join(" ").toLowerCase();
        if (keyword && haystack.indexOf(keyword) < 0) return false;
        if (region && crop.region !== region) return false;
        if (season && crop.season !== season) return false;
        return true;
      });
    }

    function render() {
      var rows = currentList();
      var count = A.$("#lib-count");
      if (count) count.textContent = rows.length + " loại cây trồng";

      if (!rows.length) {
        grid.innerHTML = A.emptyState({
          icon: "🔍",
          title: "Không tìm thấy cây trồng phù hợp",
          text: "Thử từ khóa khác hoặc xóa bộ lọc vùng miền, mùa vụ.",
          action: '<button class="btn btn--ghost" type="button" id="lib-clear">Xóa bộ lọc</button>'
        });
        var clear = A.$("#lib-clear");
        if (clear) clear.addEventListener("click", resetFilters);
        return;
      }

      grid.innerHTML = rows.map(function (crop) {
        var pests = API.where("pests", function (p) {
          return p.cropId === crop.id && p.status === "approved";
        });
        return '<article class="crop-card">' +
          '<div class="crop-card__art"><span class="glyph" aria-hidden="true">' + glyph(crop) + "</span>" +
          '<span class="badge badge--plain" style="background:rgba(255,255,255,.7)">' + A.esc(crop.season) + "</span></div>" +
          '<div class="crop-card__body"><h3>' + A.esc(crop.name) + "</h3>" +
          '<p class="sci">' + A.esc(crop.scientificName) + "</p>" +
          '<div class="crop-card__meta"><span>📍 <b>' + A.esc(crop.region) + "</b></span>" +
          "<span>◎ " + pests.length + " sâu bệnh thường gặp</span></div>" +
          "<p class=\"small muted\" style=\"margin:2px 0 8px\">" + A.esc(crop.note) + "</p>" +
          '<button class="btn btn--ghost btn--sm" type="button" data-crop="' + crop.id + '">Xem quy trình chăm sóc</button>' +
          "</div></article>";
      }).join("");

      A.$$("[data-crop]", grid).forEach(function (btn) {
        btn.addEventListener("click", function () { openCrop(btn.dataset.crop); });
      });
    }

    function resetFilters() {
      if (searchInput) searchInput.value = "";
      if (regionSelect) regionSelect.value = "";
      if (seasonSelect) seasonSelect.value = "";
      render();
    }

    if (searchInput) searchInput.addEventListener("input", render);
    if (regionSelect) regionSelect.addEventListener("change", render);
    if (seasonSelect) seasonSelect.addEventListener("change", render);

    var resetBtn = A.$("#lib-reset");
    if (resetBtn) resetBtn.addEventListener("click", resetFilters);

    render();
    if (focusCrop) openCrop(focusCrop);

    function openCrop(cropId) {
      var crop = API.find("crops", cropId);
      if (!crop) return;
      var pests = API.where("pests", function (p) {
        return p.cropId === crop.id && p.status === "approved";
      });
      var steps = (crop.careStep || []).slice().sort(function (a, b) { return a.step - b.step; });

      var body =
        '<p class="small muted" style="margin-top:0">' + A.esc(crop.scientificName) + " · " +
        A.esc(crop.region) + " · " + A.esc(crop.season) + "</p>" +
        "<p>" + A.esc(crop.note) + "</p>" +
        '<h3 class="mt-2">Quy trình chăm sóc</h3>' +
        '<ol class="care-steps">' + steps.map(function (s) {
          return "<li><div><strong>" + A.esc(s.title) + "</strong><span>" + A.esc(s.detail) + "</span></div></li>";
        }).join("") + "</ol>" +
        (pests.length ? '<h3 class="mt-2">Sâu bệnh thường gặp</h3><div class="tag-list">' +
          pests.map(function (p) {
            return '<span class="tag tag--clay">' + A.esc(p.name) + " · mức " + A.esc(p.harmLevel) + "</span>";
          }).join("") + "</div>" : "");

      var actions = '<button class="btn btn--ghost" type="button" data-close>Đóng</button>' +
        '<a class="btn btn--primary" href="student-pest-diagnose.html?crop=' + crop.id + '" data-role-jump="student">Chẩn đoán sâu bệnh</a>';

      var modal = A.openModal({
        title: glyph(crop) + " " + crop.name,
        body: body,
        actions: actions,
        wide: false
      });
      modal.querySelector("[data-close]").addEventListener("click", A.closeModal);
    }
  }

  /* ---------- Hướng dẫn mùa vụ ---------- */

  function initGuide() {
    var select = A.$("#guide-crop");
    if (!select) return;

    var crops = API.list("crops");
    var seasons = API.list("seasons");
    var params = new URLSearchParams(location.search);

    select.innerHTML = crops.map(function (crop) {
      return '<option value="' + crop.id + '">' + A.esc(crop.name) + "</option>";
    }).join("");

    var initial = params.get("crop");
    if (initial && crops.some(function (c) { return c.id === initial; })) select.value = initial;

    function render() {
      var crop = API.find("crops", select.value);
      var season = seasons.find(function (s) { return s.cropId === select.value; });
      var host = A.$("#guide-detail");

      if (!crop) {
        host.innerHTML = A.emptyState({ title: "Chọn một loại cây trồng", text: "Hệ thống sẽ hiển thị khung mùa vụ tương ứng." });
        return;
      }

      if (!season) {
        host.innerHTML = A.emptyState({
          icon: "🗓",
          title: "Chưa có khung mùa vụ mẫu",
          text: "Loại cây này chưa được cập nhật lịch mùa vụ. Xem quy trình chăm sóc trong thư viện cây trồng.",
          action: '<a class="btn btn--ghost" href="visitor-crop-library.html?crop=' + crop.id + '">Xem thư viện</a>'
        });
        return;
      }

      var phases = season.phases.slice().sort(function (a, b) { return new Date(a.from) - new Date(b.from); });
      var startBound = phases.reduce(function (min, p) { return p.from < min ? p.from : min; }, phases[0].from);
      var endBound = phases.reduce(function (max, p) { return p.to > max ? p.to : max; }, phases[0].to);
      var months = monthRange(startBound, endBound);

      host.innerHTML =
        '<div class="flex-between mb-2"><div><h2 class="mb-0">' + A.esc(crop.name) + " · " + A.esc(season.region) + "</h2>" +
        '<p class="small muted" style="margin:2px 0 0">Khung thời gian ' + A.formatDate(startBound) + " – " + A.formatDate(endBound) +
        " · " + phases.length + " giai đoạn</p></div>" +
        '<a class="btn btn--ghost btn--sm" href="student-season-calendar.html?crop=' + crop.id + '" data-role-jump="student">Mở lịch tương tác</a></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Giai đoạn</th><th>Từ ngày</th><th>Đến ngày</th><th>Việc cần làm</th></tr></thead><tbody>' +
        phases.map(function (p) {
          return "<tr><td>" + A.badge(A.phaseLabel(p.phase), "success") + "</td><td class=\"num\">" +
            A.formatDate(p.from) + '</td><td class="num">' + A.formatDate(p.to) + "</td><td class=\"small\">" +
            A.esc(PHASE_TIPS[p.phase] || "") + "</td></tr>";
        }).join("") + "</tbody></table></div>" +
        '<h3 class="mt-2">Phân bổ theo tháng</h3>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Giai đoạn</th>' +
        months.map(function (m) { return '<th class="num">T' + m.month + "</th>"; }).join("") + "</tr></thead><tbody>" +
        phases.map(function (p) {
          return "<tr><td>" + A.esc(A.phaseLabel(p.phase)) + "</td>" + months.map(function (m) {
            var covered = monthCovered(p, m.year, m.month);
            return '<td class="text-center">' + (covered ? '<span class="tag">●</span>' : '<span class="muted">·</span>') + "</td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>" +
        '<div class="callout mt-2"><span class="ico" aria-hidden="true">i</span><span>Lịch mùa vụ là khung tham khảo theo vùng miền. ' +
        "Sinh viên có thể dời từng giai đoạn trong Lịch mùa vụ để khớp điều kiện thực tế của ruộng/vườn.</span></div>";
    }

    select.addEventListener("change", render);
    render();
  }

  /* ---------- Tiện ích ---------- */

  function uniq(arr) {
    return arr.filter(function (v, i) { return arr.indexOf(v) === i; });
  }

  function monthRange(fromISO, toISO) {
    var from = A.toDate(fromISO);
    var to = A.toDate(toISO);
    var list = [];
    var cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    while (cursor <= to && list.length < 18) {
      list.push({ month: cursor.getMonth() + 1, year: cursor.getFullYear() });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return list;
  }

  function monthCovered(phase, year, month) {
    var pFrom = A.toDate(phase.from);
    var pTo = A.toDate(phase.to);
    var mFrom = new Date(year, month - 1, 1);
    var mTo = new Date(year, month, 0, 23, 59);
    return pFrom <= mTo && pTo >= mFrom;
  }
})();
