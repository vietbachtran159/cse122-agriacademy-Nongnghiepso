/* =========================================================
   exercise.js – Bài tập tình huống từng bước (sinh viên)
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;
  var LETTERS = ["A", "B", "C", "D", "E"];

  var state = {
    user: null,
    exercise: null,
    step: 0,
    answers: [],
    checked: false,
    submitted: false
  };

  document.addEventListener("agri:shell-ready", function (event) {
    if (document.body.dataset.page !== "student-exercise-do") return;
    state.user = event.detail.user;
    if (!state.user) return;
    init();
  });

  function init() {
    renderPicker();
    var back = A.$("#back-to-list-top");
    if (back) back.addEventListener("click", showPicker);
    var id = new URLSearchParams(location.search).get("id");
    if (id) startExercise(id);
  }

  function showPicker() {
    A.$("#exercise-player").hidden = true;
    A.$("#exercise-picker").hidden = false;
    history.replaceState(null, "", "student-exercise-do.html");
    renderPicker();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exercises() {
    return API.where("exercises", function (e) { return e.status === "published"; });
  }

  function mySubmissions() {
    return API.where("submissions", function (s) { return s.userId === state.user.id; })
      .sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); });
  }

  /* ---------- Danh sách bài tập ---------- */

  function renderPicker() {
    var host = A.$("#exercise-list");
    var rows = exercises();
    var subs = mySubmissions();

    if (!rows.length) {
      host.innerHTML = A.emptyState({ icon: "✎", title: "Chưa có bài tập", text: "Giảng viên chưa xuất bản bài tập tình huống nào." });
      return;
    }

    host.innerHTML = rows.map(function (ex) {
      var crop = API.find("crops", ex.cropId);
      var sub = subs.find(function (s) { return s.exerciseId === ex.id; });
      var status = sub
        ? (sub.status === "graded"
          ? A.badge("Đã chấm · " + sub.score + "/10", "success")
          : A.badge("Chờ chấm", "warning"))
        : A.badge("Chưa làm", "muted");
      return '<article class="card"><div class="flex-between mb-1">' +
        '<span class="tag tag--sky">' + A.esc(ex.level || "Cơ bản") + "</span>" + status + "</div>" +
        "<h3 style=\"font-size:1rem\">" + A.esc(ex.title) + "</h3>" +
        '<p class="small muted" style="margin:0 0 12px">🌱 ' + A.esc(crop ? crop.name : "Cây trồng") + " · " +
        ex.steps.length + " bước · có giải thích từng bước</p>" +
        '<button class="btn ' + (sub ? "btn--ghost" : "btn--primary") + ' btn--sm" type="button" data-start="' + ex.id + '">' +
        (sub ? "Xem lại bài làm" : "Bắt đầu làm bài") + "</button></article>";
    }).join("");

    A.$$("[data-start]", host).forEach(function (btn) {
      btn.addEventListener("click", function () { startExercise(btn.dataset.start); });
    });

    renderHistory();
  }

  function renderHistory() {
    var host = A.$("#exercise-history");
    if (!host) return;
    var subs = mySubmissions();
    if (!subs.length) {
      host.innerHTML = '<p class="small muted" style="margin:0">Chưa có bài nộp nào.</p>';
      return;
    }
    host.innerHTML = subs.slice(0, 6).map(function (s) {
      var ex = API.find("exercises", s.exerciseId);
      var tone = s.status === "graded" ? "success" : "warning";
      return '<div class="list-row"><span class="ico" aria-hidden="true">✎</span>' +
        '<span class="grow"><strong>' + A.esc(ex ? ex.title : "Bài tập") + "</strong>" +
        "<span>Nộp " + A.formatDateTime(s.submittedAt) + (s.status === "graded" ? " · " + s.score + "/10" : " · chờ chấm") + "</span></span>" +
        '<span class="badge badge--' + tone + '">' + (s.status === "graded" ? "Đã chấm" : "Chờ chấm") + "</span></div>";
    }).join("");
  }

  /* ---------- Làm bài ---------- */

  function startExercise(id) {
    var ex = API.find("exercises", id);
    if (!ex) { A.toast("error", "Không tìm thấy bài tập", "Bài tập có thể đã bị gỡ."); return; }

    state.exercise = ex;
    state.step = 0;
    state.answers = [];
    state.checked = false;
    state.submitted = false;

    var existing = mySubmissions().find(function (s) { return s.exerciseId === ex.id; });
    if (existing) {
      state.answers = existing.answers.slice();
      state.submitted = true;
    }

    A.$("#exercise-picker").hidden = true;
    A.$("#exercise-player").hidden = false;
    A.$("#player-title").textContent = ex.title;
    A.$("#player-crop").textContent = (API.find("crops", ex.cropId) || {}).name || "";
    history.replaceState(null, "", "?id=" + ex.id);

    if (state.submitted) renderSubmitted(existing);
    else renderStep();
    A.$("#exercise-player").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderStep() {
    var ex = state.exercise;
    var s = ex.steps[state.step];
    var total = ex.steps.length;

    A.$("#exercise-progress").innerHTML = ex.steps.map(function (_, i) {
      var cls = i < state.step ? "is-done" : i === state.step ? "is-current" : "";
      return '<span class="seg ' + cls + '"></span>';
    }).join("");

    A.$("#exercise-body").innerHTML =
      '<div class="question-card">' +
      '<span class="q-count">Bước ' + (state.step + 1) + "/" + total + "</span>" +
      "<h2>" + A.esc(s.q) + "</h2>" +
      '<div class="options" role="radiogroup" aria-label="Lựa chọn đáp án">' +
      s.options.map(function (opt, i) {
        return '<label class="option" data-opt="' + i + '">' +
          '<input type="radio" name="answer" value="' + i + '"' + (state.answers[state.step] === i ? " checked" : "") + ">" +
          '<span class="letter">' + LETTERS[i] + "</span><span>" + A.esc(opt) + "</span></label>";
      }).join("") + "</div>" +
      '<div id="step-feedback"></div>' +
      '<div class="exercise-foot"><span class="small muted">Trả lời đúng được tính khi bạn nộp bài cho giảng viên chấm.</span>' +
      '<button class="btn btn--primary" type="button" id="step-next" disabled>' +
      (state.step === total - 1 ? "Xem tổng kết" : "Câu tiếp") + "</button></div></div>";

    var options = A.$$(".option", A.$("#exercise-body"));
    options.forEach(function (label) {
      label.addEventListener("click", function () {
        if (state.checked) return;
        options.forEach(function (o) { o.classList.remove("is-picked"); });
        label.classList.add("is-picked");
        state.answers[state.step] = Number(label.dataset.opt);
        A.$("#step-next").disabled = false;
      });
    });

    var next = A.$("#step-next");
    next.disabled = state.answers[state.step] === undefined;
    next.addEventListener("click", function () {
      if (!state.checked) {
        state.checked = true;
        revealAnswer();
        next.textContent = state.step === total - 1 ? "Xem tổng kết" : "Câu tiếp";
        return;
      }
      state.checked = false;
      if (state.step < total - 1) {
        state.step += 1;
        renderStep();
      } else {
        showSummary();
      }
    });
  }

  function revealAnswer() {
    var s = state.exercise.steps[state.step];
    var picked = state.answers[state.step];
    var correct = picked === s.answer;

    A.$$(".option", A.$("#exercise-body")).forEach(function (label, i) {
      label.classList.add("is-locked");
      var input = label.querySelector("input");
      input.disabled = true;
      if (i === s.answer) label.classList.add("is-right");
      if (i === picked && !correct) label.classList.add("is-wrong");
    });

    A.$("#step-feedback").innerHTML = '<div class="feedback ' + (correct ? "feedback--ok" : "feedback--bad") + '">' +
      "<strong>" + (correct ? "✓ Chính xác!" : "✕ Chưa đúng.") + "</strong> " + A.esc(s.explain) + "</div>";
  }

  function showSummary() {
    var ex = state.exercise;
    var correct = ex.steps.filter(function (s, i) { return s.answer === state.answers[i]; }).length;

    A.$("#exercise-progress").innerHTML = ex.steps.map(function () { return '<span class="seg is-done"></span>'; }).join("");

    A.$("#exercise-body").innerHTML =
      '<div class="result-hero"><div class="score-big">' + correct + "<small>/" + ex.steps.length + "</small></div>" +
      "<h2>Hoàn thành các bước</h2>" +
      "<p>Đáp án đúng theo lời giải: " + correct + "/" + ex.steps.length + " bước. Nộp bài để giảng viên chấm điểm và góp ý.</p></div>" +
      reviewHtml(ex) +
      '<div class="btn-row mt-2"><button class="btn btn--primary" type="button" id="submit-exercise">Nộp bài cho giảng viên</button>' +
      '<button class="btn btn--ghost" type="button" id="restart-exercise">Làm lại</button></div>';

    A.$("#submit-exercise").addEventListener("click", submit);
    A.$("#restart-exercise").addEventListener("click", function () {
      state.step = 0;
      state.answers = [];
      state.checked = false;
      renderStep();
    });
  }

  function reviewHtml(ex) {
    return '<div class="review-list">' + ex.steps.map(function (s, i) {
      var picked = state.answers[i];
      var ok = picked === s.answer;
      return '<div class="review-item"><div class="q">Bước ' + (i + 1) + ": " + A.esc(s.q) + "</div>" +
        '<div class="ans-row"><span class="' + (ok ? "ok" : "no") + '">Bạn chọn: ' +
        LETTERS[picked] + ". " + A.esc(s.options[picked]) + "</span>" +
        '<span class="ok">Đáp án: ' + LETTERS[s.answer] + ". " + A.esc(s.options[s.answer]) + "</span></div>" +
        '<div class="why">' + A.esc(s.explain) + "</div></div>";
    }).join("") + "</div>";
  }

  function submit() {
    var ex = state.exercise;
    var existing = mySubmissions().find(function (s) { return s.exerciseId === ex.id; });
    if (existing) { renderSubmitted(existing); return; }

    var sub = API.insert("submissions", {
      exerciseId: ex.id,
      userId: state.user.id,
      answers: state.answers.slice(),
      score: null,
      status: "pending",
      feedback: "",
      submittedAt: API.nowISO(),
      gradedAt: null
    });

    API.insert("notifications", {
      userId: "u4",
      title: "Bài nộp mới cần chấm",
      body: state.user.name + " vừa nộp \"" + ex.title + "\".",
      type: "warning",
      read: false,
      createdAt: API.nowISO()
    });
    API.logActivity(state.user.name + " nộp bài tập " + ex.title);

    A.toast("success", "Đã nộp bài", "Bài làm đang ở trạng thái chờ giảng viên chấm.");
    state.submitted = true;
    renderSubmitted(sub);
    renderPicker();
  }

  function renderSubmitted(sub) {
    var ex = state.exercise;
    var tone = sub.status === "graded" ? "success" : "warning";
    var title = sub.status === "graded" ? "Bài đã được chấm" : "Đã nộp – đang chờ chấm";

    A.$("#exercise-progress").innerHTML = ex.steps.map(function () { return '<span class="seg is-done"></span>'; }).join("");

    A.$("#exercise-body").innerHTML =
      '<div class="result-hero"><div class="score-big">' +
      (sub.status === "graded" ? sub.score + "<small>/10</small>" : "⏳") + "</div>" +
      "<h2>" + title + "</h2>" +
      "<p>Nộp lúc " + A.formatDateTime(sub.submittedAt) +
      (sub.status === "graded" ? " · chấm lúc " + A.formatDateTime(sub.gradedAt) : "") + "</p>" +
      '<span class="badge badge--' + tone + '" style="margin-top:8px">' +
      (sub.status === "graded" ? "Đã chấm" : "Chờ chấm") + "</span></div>" +
      (sub.feedback ? '<div class="callout mt-2"><span class="ico" aria-hidden="true">✎</span><span><strong>Nhận xét của giảng viên:</strong> ' +
        A.esc(sub.feedback) + "</span></div>" : "") +
      reviewHtml(ex) +
      '<div class="btn-row mt-2"><button class="btn btn--ghost" type="button" id="back-to-list">Danh sách bài tập</button>' +
      '<a class="btn btn--primary" href="student-dashboard.html">Về tổng quan</a></div>';

    A.$("#back-to-list").addEventListener("click", showPicker);
  }
})();
