/* =========================================================
   dashboard.js – Tổng quan cho sinh viên, giảng viên, quản trị viên
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;

  document.addEventListener("agri:shell-ready", function (event) {
    var page = document.body.dataset.page;
    var user = event.detail.user;
    if (!user) return;
    if (page === "student-dashboard") initStudent(user);
    if (page === "teacher-dashboard") initTeacher(user);
    if (page === "admin-dashboard") initAdmin(user);
  });

  function stat(icon, tone, num, label, extra) {
    return '<div class="stat ' + (tone ? "stat--" + tone : "") + '">' +
      '<span class="stat__icon" aria-hidden="true">' + icon + "</span>" +
      "<div><div class=\"stat__num\">" + num + '</div><div class="stat__label">' + label + "</div>" +
      (extra || "") + "</div></div>";
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 11) return "Chào buổi sáng";
    if (h < 14) return "Chào buổi trưa";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }

  /* ================= SINH VIÊN ================= */

  function initStudent(user) {
    var lessons = API.where("lessons", function (l) { return l.status === "published"; });
    var done = (API.find("users", user.id) || {}).completedLessons || [];
    var journals = API.where("cropJournals", function (j) { return j.userId === user.id; });
    var mySubs = API.where("submissions", function (s) { return s.userId === user.id; });
    var pending = mySubs.filter(function (s) { return s.status === "pending"; });
    var graded = mySubs.filter(function (s) { return s.status === "graded"; });
    var avg = graded.length
      ? (graded.reduce(function (sum, s) { return sum + (s.score || 0); }, 0) / graded.length).toFixed(1)
      : "—";

    var h1 = A.$("#dash-greeting");
    if (h1) h1.textContent = greeting() + ", " + user.name.split(" ").slice(-1)[0] + "!";

    A.$("#student-stats").innerHTML =
      stat("▤", "", done.length + "/" + lessons.length, "Bài giảng đã học") +
      stat("✎", "amber", journals.length, "Bản ghi nhật ký") +
      stat("✎", "sky", pending.length, "Bài tập chờ chấm") +
      stat("★", "clay", avg, "Điểm trung bình (thang 10)");

    // Bài học tiếp theo
    var next = lessons.find(function (l) { return done.indexOf(l.id) < 0; }) || lessons[0];
    var host = A.$("#continue-lesson");
    if (host && next) {
      var percent = lessons.length ? Math.round((done.length / lessons.length) * 100) : 0;
      host.innerHTML =
        '<div class="flex-between"><span class="tag">' + A.esc(next.topic) + "</span>" +
        '<span class="small muted">' + next.durationMin + " phút</span></div>" +
        '<h3 class="mt-1 mb-0" style="font-size:1.05rem">' + A.esc(next.title) + "</h3>" +
        '<p class="small muted" style="margin:6px 0 12px">' + A.esc(next.summary) + "</p>" +
        '<div class="progress mb-1"><span style="width:' + percent + '%"></span></div>' +
        '<p class="small muted" style="margin:0 0 12px">Tiến độ khóa học ' + done.length + "/" + lessons.length + " bài (" + percent + "%)</p>" +
        '<a class="btn btn--primary btn--block" href="student-lesson-view.html?lesson=' + next.id + '">' +
        (done.length ? "Học tiếp" : "Bắt đầu học") + "</a>";
    }

    renderUpcomingPhases(user);

    var recent = journals.sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 4);
    var jHost = A.$("#recent-journal");
    if (jHost) {
      jHost.innerHTML = recent.length
        ? recent.map(function (j) {
          var crop = API.find("crops", j.cropId);
          return '<div class="list-row"><span class="ico" aria-hidden="true">✎</span>' +
            '<span class="grow"><strong>' + A.esc(j.activity) + "</strong><span>" +
            A.esc(crop ? crop.name : "") + " · " + A.formatDate(j.date) + "</span></span></div>";
        }).join("") + '<a class="btn btn--link btn--sm mt-1" href="student-crop-journal.html">Xem toàn bộ nhật ký →</a>'
        : A.emptyState({
          icon: "✎", title: "Chưa có bản ghi",
          text: "Ghi lại hoạt động chăm sóc đầu tiên của bạn.",
          action: '<a class="btn btn--primary btn--sm" href="student-crop-journal.html">Ghi nhật ký</a>'
        });
    }

    var todoHost = A.$("#todo-exercises");
    if (todoHost) {
      var submittedIds = mySubs.map(function (s) { return s.exerciseId; });
      var todo = API.where("exercises", function (e) {
        return e.status === "published" && submittedIds.indexOf(e.id) < 0;
      });
      todoHost.innerHTML = todo.length
        ? todo.slice(0, 3).map(function (e) {
          return '<div class="list-row"><span class="ico" aria-hidden="true">✎</span>' +
            '<span class="grow"><strong>' + A.esc(e.title) + "</strong><span>" + e.steps.length + " bước · " +
            A.esc(e.level) + "</span></span>" +
            '<a class="btn btn--ghost btn--sm" href="student-exercise-do.html?id=' + e.id + '">Làm</a></div>';
        }).join("")
        : '<div class="state" style="padding:24px"><div class="state__icon">✓</div><h3>Đã hoàn thành tất cả bài tập</h3>' +
          "<p>Hiện không còn bài tập nào cần làm.</p></div>";
    }
  }

  function renderUpcomingPhases(user) {
    var host = A.$("#upcoming-phases");
    if (!host) return;
    var seasons = API.where("seasons", function (s) { return s.ownerId === user.id; });
    var today = A.isoDate(new Date());
    var items = [];

    seasons.forEach(function (season) {
      var crop = API.find("crops", season.cropId);
      season.phases.forEach(function (phase) {
        var days = Math.round((A.toDate(phase.from) - A.toDate(today)) / 86400000);
        var ongoing = today >= phase.from && today <= phase.to;
        if (ongoing || days >= 0) {
          items.push({ season: season, phase: phase, crop: crop, days: days, ongoing: ongoing });
        }
      });
    });

    items.sort(function (a, b) {
      if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1;
      return a.days - b.days;
    });

    if (!items.length) {
      host.innerHTML = A.emptyState({
        icon: "🗓", title: "Chưa có giai đoạn sắp tới",
        text: "Tạo mùa vụ mới hoặc cập nhật lịch để nhận nhắc việc.",
        action: '<a class="btn btn--ghost btn--sm" href="student-season-calendar.html">Mở lịch mùa vụ</a>'
      });
      return;
    }

    host.innerHTML = items.slice(0, 4).map(function (item) {
      var status = item.ongoing
        ? '<span class="badge badge--warning">Đang diễn ra</span>'
        : '<span class="badge badge--muted">' + (item.days === 0 ? "Hôm nay" : item.days + " ngày nữa") + "</span>";
      return '<div class="list-row"><span class="ico" aria-hidden="true">' +
        (item.phase.phase === "thu-hoach" ? "☀" : "❧") + "</span>" +
        '<span class="grow"><strong>' + A.esc(A.phaseLabel(item.phase.phase)) + " · " + A.esc(item.crop ? item.crop.name : "") +
        "</strong><span>" + A.formatDate(item.phase.from) + " – " + A.formatDate(item.phase.to) + "</span></span>" +
        status + "</div>";
    }).join("");
  }

  /* ================= GIẢNG VIÊN ================= */

  function initTeacher(user) {
    var lessons = API.list("lessons");
    var publishedLessons = lessons.filter(function (l) { return l.status === "published"; });
    var students = API.where("users", function (u) { return u.role === "student"; });
    var submissions = API.list("submissions");
    var pending = submissions.filter(function (s) { return s.status === "pending"; });

    A.$("#teacher-stats").innerHTML =
      stat("▤", "", publishedLessons.length + "/" + lessons.length, "Bài giảng xuất bản") +
      stat("☷", "sky", students.length, "Sinh viên trong lớp") +
      stat("✓", "amber", pending.length, "Bài nộp chờ chấm") +
      stat("❧", "clay", API.list("crops").length, "Cây trồng trong thư viện");

    var queue = A.$("#grading-queue");
    if (queue) {
      queue.innerHTML = pending.length
        ? pending.slice(0, 5).map(function (s) {
          var ex = API.find("exercises", s.exerciseId);
          var sv = API.find("users", s.userId);
          return '<div class="list-row"><span class="ico" aria-hidden="true">✎</span>' +
            '<span class="grow"><strong>' + A.esc(ex ? ex.title : "Bài tập") + "</strong><span>" +
            A.esc(sv ? sv.name : "") + " · nộp " + A.relativeTime(s.submittedAt) + "</span></span>" +
            '<a class="btn btn--primary btn--sm" href="teacher-grading.html?sub=' + s.id + '">Chấm</a></div>';
        }).join("") + '<a class="btn btn--link btn--sm mt-1" href="teacher-grading.html">Mở trang chấm bài →</a>'
        : '<div class="state" style="padding:26px"><div class="state__icon">✓</div><h3>Không còn bài chờ chấm</h3>' +
          "<p>Tất cả bài nộp đã được phản hồi.</p></div>";
    }

    var progressHost = A.$("#class-progress");
    if (progressHost) {
      progressHost.innerHTML = students.filter(function (s) { return s.active !== false; }).map(function (sv) {
        var done = (sv.completedLessons || []).length;
        var percent = publishedLessons.length ? Math.round(done / publishedLessons.length * 100) : 0;
        return '<div style="margin-bottom:14px"><div class="flex-between" style="margin-bottom:5px">' +
          '<span class="small strong">' + A.esc(sv.name) + '</span><span class="small muted">' +
          done + "/" + publishedLessons.length + " bài</span></div>" +
          '<div class="progress"><span style="width:' + percent + '%"></span></div></div>';
      }).join("") || '<p class="small muted">Chưa có sinh viên.</p>';
    }

    var act = A.$("#teacher-activity");
    if (act) {
      act.innerHTML = API.list("activities").slice(0, 6).map(function (a) {
        return "<li>" + A.esc(a.text) + '<span class="when">' + A.relativeTime(a.at) + "</span></li>";
      }).join("");
    }
  }

  /* ================= QUẢN TRỊ ================= */

  function initAdmin(user) {
    var users = API.list("users");
    var students = users.filter(function (u) { return u.role === "student"; });
    var teachers = users.filter(function (u) { return u.role === "teacher"; });
    var pests = API.list("pests");
    var pending = pests.filter(function (p) { return p.status === "pending"; });

    A.$("#admin-stats").innerHTML =
      stat("☷", "", users.length, "Tài khoản hệ thống") +
      stat("☺", "sky", students.length, "Sinh viên") +
      stat("◈", "amber", teachers.length, "Giảng viên") +
      stat("◎", "clay", pending.length, "Hồ sơ sâu bệnh chờ duyệt");

    var host = A.$("#pending-pests");
    if (host) {
      host.innerHTML = pending.length
        ? pending.map(function (p) {
          var crop = API.find("crops", p.cropId);
          return '<div class="pending-card" data-pest="' + p.id + '">' +
            "<h4>" + A.esc(p.name) + "</h4>" +
            '<span class="meta">🌱 ' + A.esc(crop ? crop.name : "") + " · mức " + A.esc(p.harmLevel) + "</span>" +
            '<p class="small" style="margin:0">Triệu chứng: ' + p.symptoms.map(function (s) { return A.esc(s); }).join(", ") + "</p>" +
            '<div class="btn-row"><button class="btn btn--primary btn--sm" type="button" data-approve="' + p.id + '">Duyệt</button>' +
            '<button class="btn btn--danger btn--sm" type="button" data-reject="' + p.id + '">Từ chối</button></div></div>';
        }).join("")
        : '<div class="state" style="padding:26px"><div class="state__icon">✓</div><h3>Không có hồ sơ chờ duyệt</h3>' +
          "<p>Thư viện sâu bệnh đã được kiểm duyệt đầy đủ.</p></div>";

      A.$$("[data-approve]", host).forEach(function (btn) {
        btn.addEventListener("click", function () { reviewPest(btn.dataset.approve, "approved"); });
      });
      A.$$("[data-reject]", host).forEach(function (btn) {
        btn.addEventListener("click", function () { reviewPest(btn.dataset.reject, "rejected"); });
      });
    }

    var roleHost = A.$("#admin-users-summary");
    if (roleHost) {
      var roles = [
        { key: "student", label: "Sinh viên", tone: "success" },
        { key: "teacher", label: "Giảng viên", tone: "info" },
        { key: "admin", label: "Quản trị viên", tone: "warning" }
      ];
      roleHost.innerHTML = roles.map(function (r) {
        var count = users.filter(function (u) { return u.role === r.key; }).length;
        var locked = users.filter(function (u) { return u.role === r.key && u.active === false; }).length;
        return '<div class="list-row"><span class="ico">☺</span><span class="grow"><strong>' + r.label +
          "</strong><span>" + count + " tài khoản" + (locked ? " · " + locked + " đang khóa" : "") + "</span></span>" +
          A.badge(count ? "Hoạt động" : "Trống", r.tone) + "</div>";
      }).join("") + '<a class="btn btn--link btn--sm mt-1" href="admin-user-management.html">Quản lý người dùng →</a>';
    }

    var act = A.$("#admin-activity");
    if (act) {
      act.innerHTML = API.list("activities").slice(0, 6).map(function (a) {
        return "<li>" + A.esc(a.text) + '<span class="when">' + A.relativeTime(a.at) + "</span></li>";
      }).join("");
    }

    var sys = A.$("#system-info");
    if (sys) {
      var db = API.data();
      var totalRows = API.COLLECTIONS.reduce(function (sum, name) { return sum + (db[name] || []).length; }, 0);
      sys.innerHTML =
        '<div class="list-row"><span class="ico">▤</span><span class="grow"><strong>Nguồn dữ liệu</strong>' +
        "<span>db.json · localStorage (mock API)</span></span>" + A.badge("Sẵn sàng", "success") + "</div>" +
        '<div class="list-row"><span class="ico">☷</span><span class="grow"><strong>Tổng bản ghi</strong>' +
        "<span>" + API.COLLECTIONS.length + " bộ sưu tập</span></span><span class=\"strong\">" + totalRows + "</span></div>" +
        '<div class="list-row"><span class="ico">✓</span><span class="grow"><strong>Bài nộp chờ chấm</strong>' +
        "<span>Toàn hệ thống</span></span><span class=\"strong\">" +
        API.where("submissions", function (s) { return s.status === "pending"; }).length + "</span></div>";
    }
  }

  function reviewPest(id, status) {
    var pest = API.find("pests", id);
    if (!pest) return;
    var label = status === "approved" ? "duyệt" : "từ chối";
    A.confirm({
      title: (status === "approved" ? "Duyệt" : "Từ chối") + " hồ sơ sâu bệnh?",
      message: "\"" + pest.name + "\" sẽ " + (status === "approved"
        ? "xuất hiện trong thư viện và dùng được khi chẩn đoán."
        : "bị ẩn khỏi thư viện và không dùng khi chẩn đoán."),
      confirmText: status === "approved" ? "Duyệt hồ sơ" : "Từ chối",
      danger: status !== "approved"
    }).then(function (ok) {
      if (!ok) return;
      API.update("pests", id, { status: status });
      API.logActivity("Quản trị viên " + label + " hồ sơ sâu bệnh \"" + pest.name + "\"");
      A.toast(status === "approved" ? "success" : "warn",
        status === "approved" ? "Đã duyệt hồ sơ" : "Đã từ chối hồ sơ", pest.name);
      initAdmin(API.currentUser());
    });
  }
})();
