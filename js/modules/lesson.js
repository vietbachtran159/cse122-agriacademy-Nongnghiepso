/* =========================================================
   lesson.js – Bài giảng dành cho sinh viên
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;

  var state = { user: null, lessonId: null };

  document.addEventListener("agri:shell-ready", function (event) {
    if (document.body.dataset.page !== "student-lesson-view") return;
    state.user = event.detail.user;
    if (!state.user) return;
    init();
  });

  function published() {
    return API.where("lessons", function (l) { return l.status === "published"; })
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }

  function init() {
    var lessons = published();
    if (!lessons.length) {
      A.$("#lesson-list").innerHTML = A.emptyState({ icon: "▤", title: "Chưa có bài giảng", text: "Giảng viên chưa xuất bản bài giảng nào." });
      A.$("#lesson-content").innerHTML = "";
      return;
    }

    var requested = new URLSearchParams(location.search).get("lesson");
    state.lessonId = lessons.some(function (l) { return l.id === requested; }) ? requested : lessons[0].id;

    renderList();
    renderLesson();
  }

  function completedIds() {
    var user = API.find("users", state.user.id);
    return (user && user.completedLessons) || [];
  }

  function renderList() {
    var done = completedIds();
    var host = A.$("#lesson-list");
    host.innerHTML = published().map(function (lesson) {
      var active = lesson.id === state.lessonId;
      return '<a href="?lesson=' + lesson.id + '" data-lesson="' + lesson.id + '"' + (active ? ' class="is-active"' : "") + ">" +
        '<span class="ico" aria-hidden="true">▤</span><span>' + A.esc(lesson.title) + "</span>" +
        (done.indexOf(lesson.id) >= 0 ? '<span class="state-mini">✓</span>' : "") + "</a>";
    }).join("");

    A.$$("[data-lesson]", host).forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        state.lessonId = link.dataset.lesson;
        history.replaceState(null, "", "?lesson=" + state.lessonId);
        renderList();
        renderLesson();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function renderLesson() {
    var lessons = published();
    var index = lessons.findIndex(function (l) { return l.id === state.lessonId; });
    var lesson = lessons[index];
    var done = completedIds();
    var isDone = done.indexOf(lesson.id) >= 0;

    A.$("#lesson-title").textContent = lesson.title;
    A.$("#lesson-summary").textContent = lesson.summary;
    A.$("#lesson-topic").textContent = lesson.topic;
    A.$("#lesson-duration").textContent = lesson.durationMin + " phút";
    A.$("#lesson-updated").textContent = A.formatDate(lesson.updatedAt);
    A.$("#lesson-body").innerHTML = lesson.content;

    var btn = A.$("#mark-done");
    btn.classList.toggle("btn--primary", !isDone);
    btn.classList.toggle("btn--ghost", isDone);
    btn.innerHTML = isDone ? "✓ Đã học (bấm để bỏ đánh dấu)" : "Đánh dấu đã học";
    btn.disabled = false;
    btn.onclick = function () { toggleDone(lesson); };

    var prev = A.$("#lesson-prev");
    var next = A.$("#lesson-next");
    prev.disabled = index <= 0;
    next.disabled = index >= lessons.length - 1;
    prev.onclick = function () { if (index > 0) go(lessons[index - 1].id); };
    next.onclick = function () { if (index < lessons.length - 1) go(lessons[index + 1].id); };

    var percent = Math.round((done.length / lessons.length) * 100);
    A.$("#lesson-progress-bar").style.width = percent + "%";
    A.$("#lesson-progress-text").textContent = done.length + "/" + lessons.length + " bài đã học";
    A.$("#lesson-progress-percent").textContent = percent + "%";

    var related = A.$("#related-exercises");
    if (related) {
      var exs = API.where("exercises", function (e) {
        return e.status === "published" && e.cropId === "c1";
      });
      related.innerHTML = exs.length
        ? exs.slice(0, 3).map(function (e) {
          return '<a class="list-row" href="student-exercise-do.html?id=' + e.id + '">' +
            '<span class="ico" aria-hidden="true">✎</span><span class="grow"><strong>' + A.esc(e.title) +
            "</strong><span>" + e.steps.length + " bước · " + A.esc(e.level) + "</span></span></a>";
        }).join("")
        : '<p class="small muted" style="margin:0">Chưa có bài tập cho chủ đề này.</p>';
    }
  }

  function go(id) {
    state.lessonId = id;
    history.replaceState(null, "", "?lesson=" + id);
    renderList();
    renderLesson();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleDone(lesson) {
    var user = API.find("users", state.user.id);
    var done = (user.completedLessons || []).slice();
    var at = done.indexOf(lesson.id);

    if (at >= 0) {
      done.splice(at, 1);
      A.toast("info", "Đã bỏ đánh dấu", lesson.title);
    } else {
      done.push(lesson.id);
      A.toast("success", "Đã hoàn thành bài học", lesson.title);
      API.logActivity(state.user.name + " hoàn thành bài giảng " + lesson.title);
    }

    API.update("users", state.user.id, { completedLessons: done });
    renderList();
    renderLesson();
  }
})();
