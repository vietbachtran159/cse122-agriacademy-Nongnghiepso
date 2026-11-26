/* =========================================================
   account.js – Hồ sơ, cài đặt, thông báo
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;
  var PREFS_KEY = "agriacademy.prefs.v1";

  var state = { user: null };

  document.addEventListener("agri:shell-ready", function (event) {
    var page = document.body.dataset.page;
    state.user = event.detail.user;
    if (!state.user) return;
    if (page === "profile") initProfile();
    if (page === "settings") initSettings();
    if (page === "notifications") initNotifications();
  });

  function prefs() {
    try {
      return Object.assign({ exercise: true, season: true, summary: false },
        JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"));
    } catch (err) {
      return { exercise: true, season: true, summary: false };
    }
  }

  /* ================= HỒ SƠ ================= */

  function initProfile() {
    var user = API.find("users", state.user.id);
    A.$("#profile-name").textContent = user.name;
    A.$("#profile-role").textContent = A.roleLabel(user.role) + (user.class ? " · " + user.class : "");
    A.$("#profile-email").textContent = user.email;
    A.$("#profile-avatar").textContent = A.initials(user.name);
    A.$("#profile-code").textContent = user.studentCode || "—";
    A.$("#profile-phone").textContent = user.phone || "—";
    A.$("#profile-joined").textContent = A.formatDate(user.createdAt);

    var form = A.$("#profile-form");
    form.querySelector('[name="name"]').value = user.name;
    form.querySelector('[name="class"]').value = user.class || "";
    form.querySelector('[name="phone"]').value = user.phone || "";
    form.querySelector('[name="studentCode"]').value = user.studentCode || "";
    var emailField = form.querySelector("#p-email");
    if (emailField) emailField.value = user.email;

    var lessonsDone = (user.completedLessons || []).length;
    var journals = API.where("cropJournals", function (j) { return j.userId === user.id; }).length;
    var graded = API.where("submissions", function (s) {
      return s.userId === user.id && s.status === "graded";
    });
    var avg = graded.length
      ? (graded.reduce(function (sum, s) { return sum + (s.score || 0); }, 0) / graded.length).toFixed(1)
      : "—";

    var stats = A.$("#profile-stats");
    if (user.role === "student") {
      stats.innerHTML = stat(lessonsDone, "Bài giảng đã học") + stat(journals, "Bản ghi nhật ký") +
        stat(graded.length, "Bài đã chấm") + stat(avg, "Điểm trung bình");
    } else if (user.role === "teacher") {
      stats.innerHTML = stat(API.list("lessons").length, "Bài giảng phụ trách") +
        stat(API.list("submissions").filter(function (s) { return s.status === "graded"; }).length, "Bài đã chấm") +
        stat(API.list("crops").length, "Cây trồng trong thư viện");
    } else {
      stats.innerHTML = stat(API.list("users").length, "Tài khoản hệ thống") +
        stat(API.list("pests").length, "Hồ sơ sâu bệnh") +
        stat(API.list("activities").length, "Hoạt động ghi nhận");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      A.clearErrors(form);
      var v = A.formValues(form);
      if (!v.name || v.name.length < 3) {
        A.setFieldError(form.querySelector('[name="name"]'), "Họ tên tối thiểu 3 ký tự.");
        return;
      }
      API.update("users", user.id, {
        name: v.name,
        class: v.class,
        phone: v.phone,
        studentCode: v.studentCode
      });
      API.logActivity(v.name + " cập nhật hồ sơ cá nhân");
      A.toast("success", "Đã lưu hồ sơ", "Thông tin cá nhân của bạn đã được cập nhật.");
      setTimeout(function () { location.reload(); }, 700);
    });
  }

  function stat(value, label) {
    return '<div class="stat"><div><div class="stat__num">' + value + '</div><div class="stat__label">' + label + "</div></div></div>";
  }

  /* ================= CÀI ĐẶT ================= */

  function initSettings() {
    var current = prefs();
    ["exercise", "season", "summary"].forEach(function (key) {
      var input = A.$("#pref-" + key);
      if (!input) return;
      input.checked = !!current[key];
      input.addEventListener("change", function () {
        var next = prefs();
        next[key] = input.checked;
        try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch (err) { /* bỏ qua */ }
        A.toast("success", "Đã lưu tùy chọn", "Tùy chọn thông báo được áp dụng ngay.");
      });
    });

    var roleSelect = A.$("#settings-role");
    if (roleSelect) {
      roleSelect.value = API.role();
      roleSelect.addEventListener("change", function () { A.setRole(roleSelect.value); });
    }

    var resetBtn = A.$("#reset-demo");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        A.confirm({
          title: "Khôi phục dữ liệu mẫu?",
          message: "Toàn bộ thay đổi bạn tạo (nhật ký, mùa vụ, bài nộp, tài khoản mới) sẽ bị xóa và nạp lại db.json gốc.",
          confirmText: "Khôi phục dữ liệu", danger: true
        }).then(function (ok) {
          if (!ok) return;
          API.reset().then(function () {
            A.toast("success", "Đã khôi phục", "Dữ liệu mẫu đã được nạp lại.");
            setTimeout(function () { location.reload(); }, 700);
          });
        });
      });
    }
  }

  /* ================= THÔNG BÁO ================= */

  function initNotifications() {
    var unreadOnly = false;
    var filter = A.$("#notif-filter");
    filter.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-filter]");
      if (!btn) return;
      unreadOnly = btn.dataset.filter === "unread";
      A.$$("[data-filter]", filter).forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      render();
    });

    A.$("#notif-mark-all").addEventListener("click", function () {
      API.notificationsFor(state.user.id).forEach(function (n) {
        if (!n.read) API.update("notifications", n.id, { read: true });
      });
      A.toast("success", "Đã đánh dấu tất cả", "Mọi thông báo được chuyển sang trạng thái đã đọc.");
      render();
      refreshTopbarDot();
    });

    render();

    function render() {
      var rows = API.notificationsFor(state.user.id)
        .filter(function (n) { return !unreadOnly || !n.read; });

      var unread = API.notificationsFor(state.user.id).filter(function (n) { return !n.read; }).length;
      A.$("#notif-count").textContent = unread ? unread + " chưa đọc" : "Đã đọc tất cả";
      A.$("#notif-count").className = unread ? "badge badge--warning" : "badge badge--success";

      var host = A.$("#notif-list");
      if (!rows.length) {
        host.innerHTML = A.emptyState({
          icon: "◔",
          title: unreadOnly ? "Không có thông báo chưa đọc" : "Chưa có thông báo",
          text: "Các cập nhật về bài giảng, lịch mùa vụ và bài chấm sẽ xuất hiện tại đây."
        });
        return;
      }

      host.innerHTML = rows.map(function (n) {
        var icon = n.type === "warning" ? "!" : n.type === "success" ? "✓" : "i";
        return '<article class="notif' + (n.read ? "" : " is-unread") + ' notif--' + A.esc(n.type || "info") + '">' +
          '<span class="notif__ico" aria-hidden="true">' + icon + "</span>" +
          '<div class="notif__body"><div class="notif__title">' + A.esc(n.title) + "</div>" +
          '<p class="notif__text">' + A.esc(n.body) + "</p>" +
          '<span class="notif__time">' + A.relativeTime(n.createdAt) + "</span></div>" +
          '<div class="notif__actions">' +
          (n.read ? "" : '<button class="btn btn--link btn--sm" type="button" data-read="' + n.id + '">Đã đọc</button>') +
          "</div></article>";
      }).join("");

      A.$$("[data-read]", host).forEach(function (btn) {
        btn.addEventListener("click", function () {
          API.update("notifications", btn.dataset.read, { read: true });
          render();
          refreshTopbarDot();
        });
      });
    }
  }

  function refreshTopbarDot() {
    var unread = API.notificationsFor(state.user.id).filter(function (n) { return !n.read; }).length;
    var bell = A.$('.topbar__right .icon-btn[href="notifications.html"]');
    if (!bell) return;
    var dot = bell.querySelector(".dot");
    if (unread && !dot) {
      var span = document.createElement("span");
      span.className = "dot";
      bell.appendChild(span);
    } else if (!unread && dot) {
      dot.remove();
    }
  }
})();
