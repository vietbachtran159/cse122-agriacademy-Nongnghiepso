/* =========================================================
   grading.js – Giảng viên chấm bài nộp
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;
  var LETTERS = ["A", "B", "C", "D", "E"];

  var state = { user: null, focus: null };

  document.addEventListener("agri:shell-ready", function (event) {
    if (document.body.dataset.page !== "teacher-grading") return;
    state.user = event.detail.user;
    if (!state.user) return;
    state.focus = new URLSearchParams(location.search).get("sub");
    init();
  });

  function init() {
    var exercises = API.list("exercises");
    A.$("#grading-exercise").insertAdjacentHTML("beforeend", exercises.map(function (ex) {
      return '<option value="' + ex.id + '">' + A.esc(ex.title) + "</option>";
    }).join(""));

    A.$("#grading-status").addEventListener("change", render);
    A.$("#grading-exercise").addEventListener("change", render);
    A.$("#grading-search").addEventListener("input", render);

    render();
  }

  function render() {
    var statusFilter = A.$("#grading-status").value;
    var exFilter = A.$("#grading-exercise").value;
    var keyword = (A.$("#grading-search").value || "").trim().toLowerCase();

    var rows = API.list("submissions").map(function (sub) {
      return {
        sub: sub,
        student: API.find("users", sub.userId),
        exercise: API.find("exercises", sub.exerciseId)
      };
    }).filter(function (item) {
      if (!item.student || !item.exercise) return false;
      if (statusFilter && item.sub.status !== statusFilter) return false;
      if (exFilter && item.sub.exerciseId !== exFilter) return false;
      if (keyword) {
        var hay = (item.student.name + " " + item.exercise.title + " " + (item.student.studentCode || "")).toLowerCase();
        if (hay.indexOf(keyword) < 0) return false;
      }
      return true;
    }).sort(function (a, b) {
      if (a.sub.status !== b.sub.status) return a.sub.status === "pending" ? -1 : 1;
      return new Date(b.sub.submittedAt) - new Date(a.sub.submittedAt);
    });

    var all = API.list("submissions");
    var pending = all.filter(function (s) { return s.status === "pending"; }).length;
    var graded = all.filter(function (s) { return s.status === "graded"; });
    var avg = graded.length
      ? (graded.reduce(function (sum, s) { return sum + (s.score || 0); }, 0) / graded.length).toFixed(1)
      : "—";

    A.$("#grading-stats").innerHTML =
      kpi(all.length, "Tổng bài nộp") +
      kpi(pending, "Chờ chấm") +
      kpi(graded.length, "Đã chấm") +
      kpi(avg, "Điểm trung bình");

    A.$("#grading-count").textContent = rows.length + " bài";

    var host = A.$("#grading-list");
    if (!rows.length) {
      host.innerHTML = A.emptyState({
        icon: "✓",
        title: statusFilter === "pending" ? "Không có bài chờ chấm" : "Không có bài nộp phù hợp",
        text: "Thay đổi bộ lọc hoặc chờ sinh viên nộp bài mới."
      });
      return;
    }

    host.innerHTML = rows.map(function (item) {
      var sub = item.sub;
      var ex = item.exercise;
      var isFocus = state.focus === sub.id;
      var answers = ex.steps.map(function (step, i) {
        var picked = sub.answers[i];
        var ok = picked === step.answer;
        return '<div class="answer-line ' + (ok ? "ok" : "no") + '">' +
          '<span class="idx">' + (i + 1) + "</span>" +
          "<span><strong>" + (picked === undefined ? "—" : LETTERS[picked]) + ".</strong> " +
          A.esc(picked === undefined ? "Bỏ trống" : step.options[picked]) +
          (ok ? ' <span class="muted small">(đúng)</span>' : ' <span class="muted small">(đáp án ' +
            LETTERS[step.answer] + ")</span>") + "</span></div>";
      }).join("");

      var gradedBlock = sub.status === "graded"
        ? '<div class="callout"><span class="ico">★</span><span><strong>Điểm: ' + sub.score + "/10</strong>" +
          (sub.feedback ? " · " + A.esc(sub.feedback) : "") + "<br><span class=\"small muted\">Chấm lúc " +
          A.formatDateTime(sub.gradedAt) + "</span></span></div>" +
          '<button class="btn btn--ghost btn--sm" type="button" data-edit-grade="' + sub.id + '">Sửa điểm / phản hồi</button>'
        : '<div class="grade-form" data-grade-form="' + sub.id + '">' +
          '<div class="field"><label for="score-' + sub.id + '">Điểm (0–10)</label>' +
          '<input class="input" id="score-' + sub.id + '" type="number" min="0" max="10" step="0.5" value="8"></div>' +
          '<div class="field grow"><label for="fb-' + sub.id + '">Nhận xét</label>' +
          '<input class="input" id="fb-' + sub.id + '" placeholder="Góp ý cho sinh viên…"></div>' +
          '<button class="btn btn--primary btn--sm" type="button" data-grade="' + sub.id + '">Chấm điểm</button></div>';

      return '<article class="submission-card' + (isFocus ? ' style="border-color:var(--green-500);box-shadow:var(--shadow-sm)"' : "") + '" id="sub-' + sub.id + '">' +
        '<div class="submission-card__head"><div><h4>' + A.esc(item.student.name) + "</h4>" +
        '<span class="who">' + A.esc(item.student.studentCode || item.student.email) + " · " +
        A.esc(ex.title) + "</span></div>" +
        (sub.status === "pending" ? A.badge("Chờ chấm", "warning") : A.badge("Đã chấm", "success")) + "</div>" +
        '<div class="small muted">Nộp lúc ' + A.formatDateTime(sub.submittedAt) + " · " + ex.steps.length + " bước</div>" +
        '<div class="answer-summary">' + answers + "</div>" +
        gradedBlock +
        "</article>";
    }).join("");

    A.$$("[data-grade]", host).forEach(function (btn) {
      btn.addEventListener("click", function () { grade(btn.dataset.grade); });
    });
    A.$$("[data-edit-grade]", host).forEach(function (btn) {
      btn.addEventListener("click", function () { openEditGrade(btn.dataset.editGrade); });
    });

    if (state.focus) {
      var node = A.$("#sub-" + state.focus);
      if (node) node.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function kpi(value, label) {
    return '<div class="kpi"><b>' + value + "</b><span>" + label + "</span></div>";
  }

  function grade(subId) {
    var form = A.$('[data-grade-form="' + subId + '"]');
    var scoreInput = form.querySelector("input[type=number]");
    var feedbackInput = form.querySelector("input:not([type=number])");
    var score = Number(scoreInput.value);

    if (scoreInput.value === "" || isNaN(score) || score < 0 || score > 10) {
      A.toast("error", "Điểm không hợp lệ", "Nhập điểm từ 0 đến 10.");
      scoreInput.focus();
      return;
    }

    saveGrade(subId, score, feedbackInput.value.trim());
  }

  function saveGrade(subId, score, feedback) {
    var sub = API.find("submissions", subId);
    var student = API.find("users", sub.userId);
    var ex = API.find("exercises", sub.exerciseId);

    API.update("submissions", subId, {
      score: score,
      feedback: feedback,
      status: "graded",
      gradedAt: API.nowISO()
    });

    API.insert("notifications", {
      userId: sub.userId,
      title: "Bài tập đã được chấm",
      body: "\"" + (ex ? ex.title : "Bài tập") + "\" đạt " + score + "/10." + (feedback ? " Nhận xét: " + feedback : ""),
      type: "success",
      read: false,
      createdAt: API.nowISO()
    });

    if (student) API.logActivity(state.user.name + " chấm bài cho " + student.name + " (" + score + "/10)");
    A.toast("success", "Đã lưu điểm", (student ? student.name : "Sinh viên") + " · " + score + "/10");
    state.focus = null;
    render();
  }

  function openEditGrade(subId) {
    var sub = API.find("submissions", subId);
    var student = API.find("users", sub.userId);
    var body =
      '<div class="form-grid"><div class="field"><label for="eg-score">Điểm (0–10)</label>' +
      '<input class="input" id="eg-score" type="number" min="0" max="10" step="0.5" value="' + sub.score + '"></div>' +
      '<div class="field full"><label for="eg-fb">Nhận xét</label>' +
      '<textarea class="textarea" id="eg-fb" rows="3">' + A.esc(sub.feedback || "") + "</textarea></div></div>";

    var actions = '<button class="btn btn--ghost" type="button" data-act="cancel">Hủy</button>' +
      '<button class="btn btn--primary" type="button" data-act="save">Cập nhật</button>';

    var modal = A.openModal({
      title: "Sửa điểm · " + (student ? student.name : ""),
      body: body, actions: actions
    });
    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", function () {
      var value = Number(modal.querySelector("#eg-score").value);
      if (isNaN(value) || value < 0 || value > 10) {
        A.toast("error", "Điểm không hợp lệ", "Nhập điểm từ 0 đến 10.");
        return;
      }
      A.closeModal();
      saveGrade(subId, value, modal.querySelector("#eg-fb").value.trim());
    });
  }
})();
