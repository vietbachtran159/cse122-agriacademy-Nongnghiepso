/* =========================================================
   pest-diagnose.js – Chẩn đoán sâu bệnh theo triệu chứng
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;

  var state = { user: null, cropId: null, selected: [], lastResult: null };

  document.addEventListener("agri:shell-ready", function (event) {
    if (document.body.dataset.page !== "student-pest-diagnose") return;
    state.user = event.detail.user;
    if (!state.user) return;
    init();
  });

  function init() {
    var crops = API.list("crops");
    var select = A.$("#diag-crop");
    select.innerHTML = crops.map(function (c) {
      return '<option value="' + c.id + '">' + A.esc(c.name) + " · " + A.esc(c.region) + "</option>";
    }).join("");

    var preset = new URLSearchParams(location.search).get("crop");
    if (preset && crops.some(function (c) { return c.id === preset; })) select.value = preset;
    state.cropId = select.value;

    select.addEventListener("change", function () {
      state.cropId = select.value;
      state.selected = [];
      renderSymptoms();
      renderResult(null);
    });

    A.$("#diag-run").addEventListener("click", runDiagnosis);
    A.$("#diag-reset").addEventListener("click", function () {
      state.selected = [];
      A.$("#diag-desc").value = "";
      renderSymptoms();
      renderResult(null);
    });

    renderSymptoms();
    renderHistory();
  }

  function pestsForCrop() {
    return API.where("pests", function (p) {
      return p.cropId === state.cropId && p.status === "approved";
    });
  }

  function renderSymptoms() {
    var host = A.$("#diag-symptoms");
    var pests = pestsForCrop();
    var symptoms = [];
    pests.forEach(function (p) {
      p.symptoms.forEach(function (s) {
        if (symptoms.indexOf(s) < 0) symptoms.push(s);
      });
    });
    symptoms.sort();

    if (!symptoms.length) {
      host.innerHTML = A.emptyState({
        icon: "🌿",
        title: "Chưa có dữ liệu sâu bệnh cho cây này",
        text: "Thư viện sâu bệnh chưa cập nhật hồ sơ cho cây trồng đã chọn. Thử chọn cây khác."
      });
      return;
    }

    host.innerHTML = symptoms.map(function (s, index) {
      return '<label class="symptom-toggle" data-symptom="' + A.esc(s) + '">' +
        '<input type="checkbox" value="' + A.esc(s) + '" id="sym-' + index + '">' +
        "<span>" + A.esc(s) + "</span></label>";
    }).join("");

    A.$$("input[type=checkbox]", host).forEach(function (input) {
      input.addEventListener("change", function () {
        var label = input.closest(".symptom-toggle");
        label.classList.toggle("is-on", input.checked);
        state.selected = A.$$("input[type=checkbox]:checked", host).map(function (i) { return i.value; });
        A.$("#diag-count").textContent = state.selected.length + " triệu chứng đã chọn";
      });
    });

    A.$("#diag-count").textContent = "0 triệu chứng đã chọn";
  }

  function runDiagnosis() {
    var desc = (A.$("#diag-desc").value || "").trim().toLowerCase();
    var pests = pestsForCrop();

    if (!state.selected.length && !desc) {
      A.toast("warn", "Chưa có dữ liệu chẩn đoán", "Chọn ít nhất một triệu chứng hoặc mô tả tình trạng cây.");
      renderResult({ error: "empty" });
      return;
    }

    var keywords = desc.split(/[\s,.;]+/).filter(function (w) { return w.length >= 3; });

    var scored = pests.map(function (pest) {
      var matched = pest.symptoms.filter(function (s) {
        return state.selected.indexOf(s) >= 0;
      });
      var textHit = keywords.some(function (w) {
        var hay = (pest.name + " " + pest.symptoms.join(" ") + " " + pest.remedy).toLowerCase();
        return hay.indexOf(w) >= 0;
      });
      var base = pest.symptoms.length ? matched.length / pest.symptoms.length : 0;
      var score = Math.min(1, base * 0.85 + (textHit ? 0.3 : 0) + (matched.length ? 0.05 : 0));
      return {
        pest: pest,
        matched: matched,
        score: Math.round(score * 100)
      };
    }).filter(function (item) { return item.matched.length > 0 || (desc && item.score > 30); })
      .sort(function (a, b) { return b.score - a.score; });

    renderResult({ list: scored, desc: desc });
  }

  function renderResult(result) {
    var host = A.$("#diag-result");

    if (!result) {
      state.lastResult = null;
      host.innerHTML = '<div class="state" style="border-style:solid">' +
        '<div class="state__icon">◎</div><h3>Kết quả chẩn đoán</h3>' +
        "<p>Chọn triệu chứng quan sát được rồi bấm <strong>Chẩn đoán</strong>. Hệ thống so khớp với hồ sơ sâu bệnh đã được duyệt.</p></div>";
      return;
    }

    if (result.error === "empty") {
      host.innerHTML = '<div class="state" style="border-style:solid">' +
        '<div class="state__icon state__icon--warn">!</div><h3>Chưa đủ dữ liệu</h3>' +
        "<p>Hãy tích ít nhất một triệu chứng trên lá, thân hoặc quả để bắt đầu so khớp.</p></div>";
      return;
    }

    if (!result.list.length) {
      host.innerHTML = '<div class="state" style="border-style:solid">' +
        '<div class="state__icon state__icon--warn">?</div><h3>Chưa khớp hồ sơ nào</h3>' +
        "<p>Các triệu chứng đã chọn chưa trùng với hồ sơ sâu bệnh nào của cây này. Thử mô tả chi tiết hơn " +
        "hoặc chụp ảnh gửi giảng viên để được hỗ trợ.</p>" +
        '<button class="btn btn--ghost" type="button" id="diag-ask-teacher">Gửi câu hỏi cho giảng viên</button></div>';
      var ask = A.$("#diag-ask-teacher");
      if (ask) ask.addEventListener("click", askTeacher);
      return;
    }

    state.lastResult = result.list[0];

    host.innerHTML = result.list.slice(0, 3).map(function (item, index) {
      var pest = item.pest;
      var best = index === 0 ? " is-best" : "";
      return '<div class="result-card' + best + '">' +
        '<div class="result-card__top"><h3>' + (index === 0 ? "🏆 " : "") + A.esc(pest.name) + "</h3>" +
        A.badge("Mức " + pest.harmLevel, pest.harmLevel === "cao" ? "danger" : pest.harmLevel === "trung bình" ? "warning" : "success") +
        "</div>" +
        '<div class="match-score">Khớp ' + item.matched.length + "/" + pest.symptoms.length + " triệu chứng · " + item.score + "%</div>" +
        '<div class="match-bar"><span style="width:' + item.score + '%"></span></div>' +
        '<div class="small muted mt-1">Triệu chứng trùng: ' + item.matched.map(function (s) {
          return "<em>" + A.esc(s) + "</em>";
        }).join(", ") + "</div>" +
        '<div class="remedy"><strong>Hướng xử lý: </strong>' + A.esc(pest.remedy) + "</div>" +
        "</div>";
    }).join("") +
      '<div class="btn-row mt-2"><button class="btn btn--primary btn--sm" type="button" id="diag-save">Lưu kết quả chẩn đoán</button>' +
      '<a class="btn btn--ghost btn--sm" href="student-crop-journal.html">Ghi vào nhật ký</a></div>';

    A.$("#diag-save").addEventListener("click", saveDiagnosis);
    renderHistory();
  }

  function saveDiagnosis() {
    if (!state.lastResult) return;
    var top = state.lastResult;
    var existing = API.where("diagnoses", function (d) {
      return d.userId === state.user.id && d.cropId === state.cropId &&
        d.pestId === top.pest.id && A.isoDate(A.toDate(d.createdAt)) === A.isoDate(new Date());
    })[0];

    if (existing) {
      A.toast("info", "Đã lưu trước đó", "Kết quả " + top.pest.name + " hôm nay đã có trong lịch sử chẩn đoán.");
      return;
    }

    API.insert("diagnoses", {
      userId: state.user.id,
      cropId: state.cropId,
      symptoms: state.selected.slice(),
      pestId: top.pest.id,
      confidence: top.score,
      createdAt: API.nowISO()
    });
    API.logActivity(state.user.name + " chẩn đoán " + top.pest.name + " trên " + cropName());
    A.toast("success", "Đã lưu chẩn đoán", top.pest.name + " · độ khớp " + top.score + "%");
    renderHistory();
  }

  function renderHistory() {
    var host = A.$("#diagnose-history");
    if (!host) return;
    var rows = API.where("diagnoses", function (d) { return d.userId === state.user.id; })
      .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })
      .slice(0, 5);

    if (!rows.length) {
      host.innerHTML = '<p class="small muted" style="margin:0">Chưa có lần chẩn đoán nào được lưu.</p>';
      return;
    }

    host.innerHTML = rows.map(function (d) {
      var crop = API.find("crops", d.cropId);
      var pest = API.find("pests", d.pestId);
      return '<div class="list-row"><span class="ico" aria-hidden="true">◎</span>' +
        '<span class="grow"><strong>' + A.esc(pest ? pest.name : "Không rõ") + "</strong>" +
        "<span>" + A.esc(crop ? crop.name : "") + " · khớp " + d.confidence + "%</span></span>" +
        "<time>" + A.formatDate(d.createdAt) + "</time></div>";
    }).join("");
  }

  function askTeacher() {
    API.insert("notifications", {
      userId: "u4",
      title: "Sinh viên cần hỗ trợ chẩn đoán",
      body: state.user.name + " chưa khớp được hồ sơ sâu bệnh cho cây " + cropName() + ". Triệu chứng: " +
        (state.selected.join(", ") || (A.$("#diag-desc").value || "chưa mô tả")),
      type: "warning",
      read: false,
      createdAt: API.nowISO()
    });
    A.toast("success", "Đã gửi câu hỏi", "Giảng viên sẽ nhận được thông báo kèm triệu chứng bạn mô tả.");
  }

  function cropName() {
    var crop = API.find("crops", state.cropId);
    return crop ? crop.name : "cây trồng";
  }
})();
