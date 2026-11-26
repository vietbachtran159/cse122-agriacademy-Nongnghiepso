/* =========================================================
   main.js – Khung ứng dụng, phân quyền, tiện ích dùng chung
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;

  /* ---------- DOM helpers ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------- Định dạng ---------- */

  var VN_MONTH = ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
    "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"];
  var VN_DOW = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

  function toDate(value) {
    if (value instanceof Date) return value;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      var p = value.split("-").map(Number);
      return new Date(p[0], p[1] - 1, p[2]);
    }
    return new Date(value);
  }

  function formatDate(value, opts) {
    if (!value) return "—";
    var d = toDate(value);
    if (isNaN(d)) return "—";
    var o = opts || {};
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    if (o.short) return dd + "/" + mm;
    if (o.year === false) return dd + "/" + mm;
    return dd + "/" + mm + "/" + d.getFullYear();
  }

  function formatDateTime(value) {
    if (!value) return "—";
    var d = toDate(value);
    if (isNaN(d)) return "—";
    return formatDate(d) + " · " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function relativeTime(value) {
    var d = toDate(value);
    if (isNaN(d)) return "—";
    var diff = Date.now() - d.getTime();
    var mins = Math.round(diff / 60000);
    if (mins < 1) return "vừa xong";
    if (mins < 60) return mins + " phút trước";
    var hours = Math.round(mins / 60);
    if (hours < 24) return hours + " giờ trước";
    var days = Math.round(hours / 24);
    if (days < 7) return days + " ngày trước";
    return formatDate(d);
  }

  function isoDate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function initials(name) {
    var parts = String(name || "?").trim().split(/\s+/);
    return (parts[0][0] || "?" ) + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  }

  var PHASES = {
    "gieo": { label: "Gieo hạt", short: "Gieo", color: "var(--green-500)" },
    "cay": { label: "Cấy / trồng", short: "Cấy", color: "var(--green-600)" },
    "cham-soc": { label: "Chăm sóc", short: "Chăm sóc", color: "var(--amber-500)" },
    "bon-phan": { label: "Bón phân", short: "Bón phân", color: "var(--clay-600)" },
    "thu-hoach": { label: "Thu hoạch", short: "Thu hoạch", color: "var(--sky-600)" }
  };

  var ROLES = {
    guest: "Khách",
    student: "Sinh viên",
    teacher: "Giảng viên",
    admin: "Quản trị viên"
  };

  function phaseLabel(key) { return (PHASES[key] && PHASES[key].label) || key; }
  function roleLabel(key) { return ROLES[key] || key || "Khách"; }

  function badge(text, kind) {
    return '<span class="badge badge--' + (kind || "muted") + '">' + escapeHtml(text) + "</span>";
  }

  /* ---------- Toast ---------- */

  function toastRoot() {
    var root = $("#toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "toast-root";
      root.className = "toast-stack";
      root.setAttribute("role", "status");
      root.setAttribute("aria-live", "polite");
      document.body.appendChild(root);
    }
    return root;
  }

  var TOAST_ICON = { success: "✓", error: "✕", warn: "!", info: "i" };

  function toast(type, title, message, timeout) {
    var root = toastRoot();
    var node = document.createElement("div");
    node.className = "toast toast--" + (type || "info");
    node.innerHTML =
      '<span class="toast__ico">' + (TOAST_ICON[type] || "i") + "</span>" +
      "<div><strong>" + escapeHtml(title) + "</strong>" +
      (message ? "<p>" + escapeHtml(message) + "</p>" : "") +
      "</div>" +
      '<button class="toast__close" aria-label="Đóng thông báo">✕</button>';
    root.appendChild(node);

    function dismiss() {
      node.classList.add("is-out");
      setTimeout(function () { node.remove(); }, 220);
    }
    node.querySelector(".toast__close").addEventListener("click", dismiss);
    setTimeout(dismiss, timeout || 4200);
    return node;
  }

  /* ---------- Modal ---------- */

  function modalRoot() {
    var root = $("#modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      root.className = "modal-backdrop";
      root.hidden = true;
      document.body.appendChild(root);
    }
    return root;
  }

  function closeModal() {
    var root = modalRoot();
    root.hidden = true;
    root.innerHTML = "";
    document.body.style.overflow = "";
  }

  function openModal(opts) {
    var root = modalRoot();
    var wide = opts.wide ? " modal--wide" : "";
    root.innerHTML =
      '<div class="modal' + wide + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<div class="modal__head"><h2 id="modal-title">' + escapeHtml(opts.title || "") + "</h2>" +
      '<button class="modal__close" aria-label="Đóng">✕</button></div>' +
      '<div class="modal__body">' + (opts.body || "") + "</div>" +
      (opts.actions ? '<div class="modal__actions">' + opts.actions + "</div>" : "") +
      "</div>";
    root.hidden = false;
    document.body.style.overflow = "hidden";

    root.querySelector(".modal__close").addEventListener("click", closeModal);
    root.addEventListener("click", function (event) {
      if (event.target === root) closeModal();
    }, { once: true });
    document.addEventListener("keydown", function onEsc(event) {
      if (event.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", onEsc);
      }
    });
    return root.querySelector(".modal");
  }

  function confirmAction(opts) {
    return new Promise(function (resolve) {
      var actions =
        '<button class="btn btn--ghost" data-act="cancel">' + escapeHtml(opts.cancelText || "Hủy") + "</button>" +
        '<button class="btn ' + (opts.danger ? "btn--danger" : "btn--primary") + '" data-act="ok">' +
        escapeHtml(opts.confirmText || "Xác nhận") + "</button>";
      var modal = openModal({
        title: opts.title || "Xác nhận",
        body: '<p style="margin:0;color:var(--ink-500)">' + escapeHtml(opts.message || "") + "</p>",
        actions: actions
      });
      modal.querySelector('[data-act="cancel"]').addEventListener("click", function () {
        closeModal();
        resolve(false);
      });
      modal.querySelector('[data-act="ok"]').addEventListener("click", function () {
        closeModal();
        resolve(true);
      });
    });
  }

  /* ---------- Trạng thái rỗng ---------- */

  function emptyState(opts) {
    return '<div class="state">' +
      '<div class="state__icon">' + (opts.icon || "🌱") + "</div>" +
      "<h3>" + escapeHtml(opts.title || "Chưa có dữ liệu") + "</h3>" +
      "<p>" + escapeHtml(opts.text || "") + "</p>" +
      (opts.action || "") +
      "</div>";
  }

  /* ---------- Điều hướng theo vai trò ---------- */

  var NAV = {
    student: [
      { label: "Học tập", items: [
        { page: "student-dashboard", href: "student-dashboard.html", icon: "▦", text: "Tổng quan" },
        { page: "student-lesson-view", href: "student-lesson-view.html", icon: "▤", text: "Bài giảng" },
        { page: "student-season-calendar", href: "student-season-calendar.html", icon: "▥", text: "Lịch mùa vụ" },
        { page: "student-crop-journal", href: "student-crop-journal.html", icon: "✎", text: "Nhật ký cây trồng" },
        { page: "student-pest-diagnose", href: "student-pest-diagnose.html", icon: "◎", text: "Chẩn đoán sâu bệnh" },
        { page: "student-exercise-do", href: "student-exercise-do.html", icon: "✎", text: "Bài tập tình huống" }
      ] },
      { label: "Khám phá", items: [
        { page: "visitor-crop-library", href: "visitor-crop-library.html", icon: "❧", text: "Thư viện cây trồng" },
        { page: "visitor-season-guide", href: "visitor-season-guide.html", icon: "☀", text: "Hướng dẫn mùa vụ" }
      ] }
    ],
    teacher: [
      { label: "Giảng dạy", items: [
        { page: "teacher-dashboard", href: "teacher-dashboard.html", icon: "▦", text: "Tổng quan lớp" },
        { page: "teacher-lesson-manage", href: "teacher-lesson-manage.html", icon: "▤", text: "Quản lý bài giảng" },
        { page: "teacher-crop-manage", href: "teacher-crop-manage.html", icon: "❧", text: "Quản lý cây trồng" },
        { page: "teacher-exercise-build", href: "teacher-exercise-build.html", icon: "✎", text: "Xây dựng bài tập" },
        { page: "teacher-grading", href: "teacher-grading.html", icon: "✓", text: "Chấm bài" }
      ] },
      { label: "Khám phá", items: [
        { page: "visitor-crop-library", href: "visitor-crop-library.html", icon: "❧", text: "Thư viện cây trồng" },
        { page: "visitor-season-guide", href: "visitor-season-guide.html", icon: "☀", text: "Hướng dẫn mùa vụ" }
      ] }
    ],
    admin: [
      { label: "Quản trị", items: [
        { page: "admin-dashboard", href: "admin-dashboard.html", icon: "▦", text: "Tổng quan hệ thống" },
        { page: "admin-user-management", href: "admin-user-management.html", icon: "☷", text: "Người dùng" },
        { page: "admin-pest-management", href: "admin-pest-management.html", icon: "◎", text: "Thư viện sâu bệnh" }
      ] },
      { label: "Giảng dạy", items: [
        { page: "teacher-lesson-manage", href: "teacher-lesson-manage.html", icon: "▤", text: "Quản lý bài giảng" },
        { page: "teacher-grading", href: "teacher-grading.html", icon: "✓", text: "Chấm bài" }
      ] }
    ],
    guest: [
      { label: "Khám phá", items: [
        { page: "visitor-course-overview", href: "visitor-course-overview.html", icon: "▦", text: "Giới thiệu khóa học" },
        { page: "visitor-crop-library", href: "visitor-crop-library.html", icon: "❧", text: "Thư viện cây trồng" },
        { page: "visitor-season-guide", href: "visitor-season-guide.html", icon: "☀", text: "Hướng dẫn mùa vụ" }
      ] }
    ]
  };

  var ACCOUNT_ITEMS = [
    { page: "profile", href: "profile.html", icon: "☺", text: "Hồ sơ cá nhân" },
    { page: "settings", href: "settings.html", icon: "⚙", text: "Cài đặt" },
    { page: "notifications", href: "notifications.html", icon: "◔", text: "Thông báo" }
  ];

  var PAGE_FILES = {
    "student-dashboard": "student-dashboard.html",
    "student-lesson-view": "student-lesson-view.html",
    "student-season-calendar": "student-season-calendar.html",
    "student-crop-journal": "student-crop-journal.html",
    "student-pest-diagnose": "student-pest-diagnose.html",
    "student-exercise-do": "student-exercise-do.html",
    "teacher-dashboard": "teacher-dashboard.html",
    "teacher-lesson-manage": "teacher-lesson-manage.html",
    "teacher-crop-manage": "teacher-crop-manage.html",
    "teacher-exercise-build": "teacher-exercise-build.html",
    "teacher-grading": "teacher-grading.html",
    "admin-dashboard": "admin-dashboard.html",
    "admin-user-management": "admin-user-management.html",
    "admin-pest-management": "admin-pest-management.html",
    "visitor-course-overview": "visitor-course-overview.html",
    "visitor-crop-library": "visitor-crop-library.html",
    "visitor-season-guide": "visitor-season-guide.html",
    "profile": "profile.html",
    "settings": "settings.html",
    "notifications": "notifications.html"
  };

  function homeFor(role) {
    return {
      student: "student-dashboard.html",
      teacher: "teacher-dashboard.html",
      admin: "admin-dashboard.html"
    }[role] || "../index.html";
  }

  function allowedRoles() {
    return (document.body.dataset.role || "").split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  function switchRole(next) {
    API.setRole(next);
    var allowed = allowedRoles();
    var canStay = !allowed.length || allowed.indexOf("guest") >= 0 ||
      allowed.indexOf(next) >= 0 || next === "admin";
    var onErrorPage = document.body.dataset.page === "403";
    if (canStay && !onErrorPage) {
      location.reload();
    } else {
      location.href = homeFor(next);
    }
  }

  /* ---------- Khung giao diện ---------- */

  function renderTopbar(user) {
    var topbar = $("#topbar");
    if (!topbar) return;
    var unread = user ? API.notificationsFor(user.id).filter(function (n) { return !n.read; }).length : 0;
    var brandHref = user ? homeFor(user.role) : "../index.html";

    topbar.innerHTML =
      '<button class="icon-btn nav-toggle" id="nav-toggle" aria-label="Mở menu" aria-expanded="false" style="display:none">☰</button>' +
      '<a class="topbar__brand" href="' + brandHref + '">' +
      '<span class="brand-mark" aria-hidden="true">🌿</span><span class="brand-text">AgriAcademy</span></a>' +
      '<div class="topbar__search"><span class="icon" aria-hidden="true">⌕</span>' +
      '<label class="visually-hidden" for="global-search">Tìm kiếm cây trồng, sâu bệnh, bài giảng</label>' +
      '<input id="global-search" type="search" placeholder="Tìm cây trồng, sâu bệnh, bài giảng…" autocomplete="off"></div>' +
      '<div class="topbar__right">' +
      '<label class="role-switch"><span class="visually-hidden">Vai trò trải nghiệm</span>' +
      '<select id="role-switch" aria-label="Chọn vai trò trải nghiệm">' +
      ["guest", "student", "teacher", "admin"].map(function (key) {
        return '<option value="' + key + '"' + ((user ? user.role : "guest") === key ? " selected" : "") + ">" +
          escapeHtml(roleLabel(key)) + "</option>";
      }).join("") + "</select></label>" +
      (user ?
        '<a class="icon-btn" href="notifications.html" aria-label="Thông báo' + (unread ? " (" + unread + " chưa đọc)" : "") + '">◔' +
        (unread ? '<span class="dot"></span>' : "") + "</a>" +
        '<button class="topbar__user" id="user-chip" aria-haspopup="menu" aria-expanded="false">' +
        '<span class="avatar">' + escapeHtml(initials(user.name)) + "</span>" +
        '<span class="uname">' + escapeHtml(user.name) + "</span></button>"
        :
        ""
      ) +
      "</div>";

    var search = $("#global-search");
    if (search) {
      search.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        var q = search.value.trim();
        if (!q) return;
        location.href = "visitor-crop-library.html?q=" + encodeURIComponent(q);
      });
    }

    var roleSelect = $("#role-switch");
    if (roleSelect) {
      roleSelect.addEventListener("change", function () { switchRole(roleSelect.value); });
    }

    if (user) {
      var chip = $("#user-chip");
      var menu = document.createElement("div");
      menu.className = "user-menu";
      menu.hidden = true;
      menu.setAttribute("role", "menu");
      menu.innerHTML =
        '<div class="user-menu__head"><strong>' + escapeHtml(user.name) + "</strong><span>" +
        escapeHtml(user.email) + " · " + escapeHtml(roleLabel(user.role)) + "</span></div>" +
        ACCOUNT_ITEMS.map(function (item) {
          return '<a role="menuitem" href="' + item.href + '"><span aria-hidden="true">' + item.icon + "</span>" +
            escapeHtml(item.text) + "</a>";
        }).join("");

      document.body.appendChild(menu);

      chip.addEventListener("click", function (event) {
        event.stopPropagation();
        menu.hidden = !menu.hidden;
        chip.setAttribute("aria-expanded", String(!menu.hidden));
      });
      document.addEventListener("click", function () {
        menu.hidden = true;
        chip.setAttribute("aria-expanded", "false");
      });
      menu.addEventListener("click", function (event) { event.stopPropagation(); });
    }
  }

  function renderSidebar(user) {
    var sidebar = $("#sidebar");
    if (!sidebar) return;
    var role = user ? user.role : "guest";
    var groups = NAV[role] || NAV.guest;
    var activePage = document.body.dataset.page;

    var html = groups.map(function (group) {
      return '<div class="sidebar__label">' + escapeHtml(group.label) + "</div>" +
        '<nav class="side-nav" aria-label="' + escapeHtml(group.label) + '">' +
        group.items.map(function (item) {
          var active = item.page === activePage;
          return '<a href="' + item.href + '"' + (active ? ' class="is-active" aria-current="page"' : "") + ">" +
            '<span class="ico" aria-hidden="true">' + item.icon + "</span>" + escapeHtml(item.text) + "</a>";
        }).join("") + "</nav>";
    }).join("");

    if (user) {
      html += '<div class="sidebar__label">Tài khoản</div><nav class="side-nav" aria-label="Tài khoản">' +
        ACCOUNT_ITEMS.map(function (item) {
          var active = item.page === activePage;
          return '<a href="' + item.href + '"' + (active ? ' class="is-active" aria-current="page"' : "") + ">" +
            '<span class="ico" aria-hidden="true">' + item.icon + "</span>" + escapeHtml(item.text) + "</a>";
        }).join("") + "</nav>";
    }

    html += '<div class="sidebar__label">Bắt đầu</div><nav class="side-nav" aria-label="Bắt đầu">' +
      '<a href="../index.html"><span class="ico" aria-hidden="true">⌂</span>Trang chủ</a>' +
      '<a href="visitor-course-overview.html"><span class="ico" aria-hidden="true">◇</span>Giới thiệu khóa học</a></nav>';

    sidebar.innerHTML = html;
  }

  function renderFooter(user) {
    var foot = $("#foot");
    if (!foot) return;
    foot.innerHTML =
      "<span>AgriAcademy · CSE122 – BTL-31 · Đồ án môn học 2026</span>" +
      '<span><a href="../index.html">Trang chủ</a> · <a href="visitor-course-overview.html">Khóa học</a>' +
      (user ? ' · <a href="notifications.html">Thông báo</a>' : "") + "</span>";
  }

  function bindMobileNav() {
    var toggle = $("#nav-toggle");
    var sidebar = $("#sidebar");
    if (!toggle || !sidebar) return;

    var scrim = document.createElement("button");
    scrim.className = "scrim";
    scrim.id = "scrim";
    scrim.type = "button";
    scrim.setAttribute("aria-label", "Đóng menu");
    scrim.hidden = true;
    sidebar.parentNode.insertBefore(scrim, sidebar.nextSibling);

    function setOpen(open) {
      sidebar.classList.toggle("is-open", open);
      scrim.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", function () { setOpen(!sidebar.classList.contains("is-open")); });
    scrim.addEventListener("click", function () { setOpen(false); });
    sidebar.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
  }

  function guardPage(user) {
    var allowed = allowedRoles();
    if (!allowed.length || allowed.indexOf("guest") >= 0) return true;
    var here = location.pathname.split("/").pop() || "index.html";

    if (!user) {
      location.replace("../index.html");
      return false;
    }
    if (allowed.indexOf(user.role) < 0 && user.role !== "admin") {
      location.replace("403.html?from=" + encodeURIComponent(here));
      return false;
    }
    return true;
  }

  function bindRoleJumps() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("[data-role-jump]") : null;
      if (link) API.setRole(link.dataset.roleJump);
    });
  }

  function mountShell() {
    return API.ready().then(function () {
      var user = API.currentUser();
      if (!guardPage(user)) return null;
      renderTopbar(user);
      renderSidebar(user);
      renderFooter(user);
      bindMobileNav();
      document.dispatchEvent(new CustomEvent("agri:shell-ready", { detail: { user: user } }));
      return user;
    });
  }

  /* ---------- Form helpers ---------- */

  function setFieldError(fieldEl, message) {
    var wrap = fieldEl.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("has-error", !!message);
    var hint = wrap.querySelector(".field__error");
    if (hint) hint.textContent = message || "";
  }

  function clearErrors(form) {
    $$(".field.has-error", form).forEach(function (f) { f.classList.remove("has-error"); });
  }

  function formValues(form) {
    var values = {};
    $$("input[name], select[name], textarea[name]", form).forEach(function (input) {
      if (input.type === "checkbox") values[input.name] = input.checked;
      else if (input.type === "radio") {
        if (input.checked) values[input.name] = input.value;
      } else values[input.name] = input.value.trim();
    });
    return values;
  }

  function bindTabs(root) {
    var scope = root || document;
    $$('[data-tabs]', scope).forEach(function (wrap) {
      var tabs = $$(".tab", wrap);
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) {
            t.classList.toggle("is-active", t === tab);
            t.setAttribute("aria-selected", String(t === tab));
          });
          var target = tab.dataset.tab;
          $$("[data-tab-panel]", wrap.parentNode).forEach(function (panel) {
            panel.hidden = panel.dataset.tabPanel !== target;
          });
        });
      });
    });
  }

  /* ---------- Xuất ---------- */

  window.Agri = {
    $: $,
    $$: $$,
    esc: escapeHtml,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    relativeTime: relativeTime,
    isoDate: isoDate,
    initials: initials,
    PHASES: PHASES,
    phaseLabel: phaseLabel,
    roleLabel: roleLabel,
    badge: badge,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    confirm: confirmAction,
    emptyState: emptyState,
    homeFor: homeFor,
    setRole: switchRole,
    mountShell: mountShell,
    pageFiles: PAGE_FILES,
    setFieldError: setFieldError,
    clearErrors: clearErrors,
    formValues: formValues,
    bindTabs: bindTabs,
    toDate: toDate
  };

  document.addEventListener("DOMContentLoaded", function () {
    bindRoleJumps();
    if (document.body.dataset.shell === "none") return;
    mountShell();
  });
})();
