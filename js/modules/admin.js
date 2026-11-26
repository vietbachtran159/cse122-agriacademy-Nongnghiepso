/* =========================================================
   admin.js – Quản trị viên: người dùng & thư viện sâu bệnh
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;

  var state = { user: null };

  document.addEventListener("agri:shell-ready", function (event) {
    var page = document.body.dataset.page;
    state.user = event.detail.user;
    if (!state.user) return;
    if (page === "admin-user-management") initUsers();
    if (page === "admin-pest-management") initPests();
  });

  /* =====================================================
     NGƯỜI DÙNG
     ===================================================== */

  function initUsers() {
    A.$("#user-role").addEventListener("change", renderUsers);
    A.$("#user-status").addEventListener("change", renderUsers);
    A.$("#user-search").addEventListener("input", renderUsers);
    A.$("#user-add").addEventListener("click", function () { openUserEditor(null); });
    renderUsers();
  }

  function roleBadge(role) {
    var map = { student: ["success", "Sinh viên"], teacher: ["info", "Giảng viên"], admin: ["warning", "Quản trị viên"] };
    var conf = map[role] || ["muted", role];
    return A.badge(conf[1], conf[0]);
  }

  function renderUsers() {
    var users = API.list("users");
    var roleFilter = A.$("#user-role").value;
    var statusFilter = A.$("#user-status").value;
    var keyword = (A.$("#user-search").value || "").trim().toLowerCase();

    A.$("#user-stats").innerHTML =
      stat(users.length, "Tổng tài khoản") +
      stat(users.filter(function (u) { return u.role === "student"; }).length, "Sinh viên") +
      stat(users.filter(function (u) { return u.role === "teacher"; }).length, "Giảng viên") +
      stat(users.filter(function (u) { return u.active === false; }).length, "Đang khóa");

    var rows = users.filter(function (u) {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter === "active" && u.active === false) return false;
      if (statusFilter === "locked" && u.active !== false) return false;
      if (keyword) {
        var hay = (u.name + " " + u.email + " " + (u.studentCode || "") + " " + (u.class || "")).toLowerCase();
        if (hay.indexOf(keyword) < 0) return false;
      }
      return true;
    }).sort(function (a, b) {
      var order = { admin: 0, teacher: 1, student: 2 };
      return (order[a.role] || 3) - (order[b.role] || 3);
    });

    A.$("#user-count").textContent = rows.length + " tài khoản";
    var host = A.$("#user-list");

    if (!rows.length) {
      host.innerHTML = '<tr><td colspan="6">' + A.emptyState({
        icon: "☷", title: "Không có tài khoản phù hợp", text: "Thử từ khóa khác hoặc bỏ bộ lọc."
      }) + "</td></tr>";
      return;
    }

    host.innerHTML = rows.map(function (u) {
      var isSelf = u.id === state.user.id;
      var status = u.active === false ? A.badge("Đang khóa", "danger") : A.badge("Hoạt động", "success");
      return "<tr>" +
        '<td><div class="flex" style="gap:10px;align-items:center"><span class="avatar">' + A.esc(A.initials(u.name)) + "</span>" +
        '<div><div class="cell-main">' + A.esc(u.name) + (isSelf ? ' <span class="small muted">(bạn)</span>' : "") + "</div>" +
        '<div class="cell-sub">' + A.esc(u.email) + "</div></div></div></td>" +
        "<td>" + roleBadge(u.role) + "</td>" +
        '<td class="small">' + A.esc(u.class || "—") + "</td>" +
        "<td>" + status + "</td>" +
        '<td class="small num">' + A.formatDate(u.createdAt) + "</td>" +
        '<td><div class="actions">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-edit="' + u.id + '">Sửa</button>' +
        (isSelf ? "" :
          '<button class="btn btn--ghost btn--sm" type="button" data-lock="' + u.id + '">' +
          (u.active === false ? "Mở khóa" : "Khóa") + "</button>" +
          '<button class="btn btn--danger btn--sm" type="button" data-del="' + u.id + '">Xóa</button>') +
        "</div></td></tr>";
    }).join("");

    A.$$("[data-edit]", host).forEach(function (b) {
      b.addEventListener("click", function () { openUserEditor(b.dataset.edit); });
    });
    A.$$("[data-lock]", host).forEach(function (b) {
      b.addEventListener("click", function () { toggleLock(b.dataset.lock); });
    });
    A.$$("[data-del]", host).forEach(function (b) {
      b.addEventListener("click", function () { deleteUser(b.dataset.del); });
    });
  }

  function stat(value, label) {
    return '<div class="stat"><div><div class="stat__num">' + value + '</div><div class="stat__label">' + label + "</div></div></div>";
  }

  function toggleLock(id) {
    var user = API.find("users", id);
    var lock = user.active !== false;
    API.update("users", id, { active: !lock });
    API.logActivity("Quản trị viên " + (lock ? "khóa" : "mở khóa") + " tài khoản " + user.name);
    A.toast(lock ? "warn" : "success", lock ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản", user.name);
    renderUsers();
  }

  function deleteUser(id) {
    var user = API.find("users", id);
    A.confirm({
      title: "Xóa tài khoản?",
      message: user.name + " (" + user.email + ") sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác.",
      confirmText: "Xóa tài khoản", danger: true
    }).then(function (ok) {
      if (!ok) return;
      API.remove("users", id);
      API.logActivity("Quản trị viên xóa tài khoản " + user.name);
      A.toast("success", "Đã xóa tài khoản", user.name);
      renderUsers();
    });
  }

  function openUserEditor(id) {
    var user = id ? API.find("users", id) : null;
    var body =
      '<form id="user-form" novalidate><div class="form-grid">' +
      '<div class="field"><label for="u-name">Họ tên <span class="req">*</span></label>' +
      '<input class="input" id="u-name" value="' + A.esc(user ? user.name : "") + '"></div>' +
      '<div class="field"><label for="u-email">Email <span class="req">*</span></label>' +
      '<input class="input" id="u-email" type="email" value="' + A.esc(user ? user.email : "") + '"></div>' +
      '<div class="field"><label for="u-role">Vai trò</label><select class="select" id="u-role">' +
      ["student", "teacher", "admin"].map(function (r) {
        return '<option value="' + r + '"' + (user && user.role === r ? " selected" : "") + ">" +
          A.roleLabel(r) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label for="u-class">Lớp / đơn vị</label>' +
      '<input class="input" id="u-class" value="' + A.esc(user ? user.class : "") + '"></div>' +
      '<div class="field"><label for="u-code">Mã sinh viên</label>' +
      '<input class="input" id="u-code" value="' + A.esc(user ? user.studentCode : "") + '"></div>' +
      '<div class="field"><label for="u-phone">Điện thoại</label>' +
      '<input class="input" id="u-phone" value="' + A.esc(user ? user.phone : "") + '"></div>' +
      "</div></form>";

    var actions = '<button class="btn btn--ghost" type="button" data-act="cancel">Hủy</button>' +
      '<button class="btn btn--primary" type="button" data-act="save">' + (user ? "Lưu thay đổi" : "Tạo tài khoản") + "</button>";

    var modal = A.openModal({ title: user ? "Sửa tài khoản" : "Thêm tài khoản", body: body, actions: actions });
    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", function () {
      var name = modal.querySelector("#u-name").value.trim();
      var email = modal.querySelector("#u-email").value.trim().toLowerCase();
      if (name.length < 3) { A.toast("error", "Tên chưa hợp lệ", "Họ tên tối thiểu 3 ký tự."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { A.toast("error", "Email chưa hợp lệ", "Kiểm tra lại địa chỉ email."); return; }

      var duplicate = API.where("users", function (u) {
        return u.email.toLowerCase() === email && u.id !== (user ? user.id : "");
      }).length;
      if (duplicate) { A.toast("error", "Email đã tồn tại", "Mỗi tài khoản cần một email riêng."); return; }

      var payload = {
        name: name,
        email: email,
        role: modal.querySelector("#u-role").value,
        class: modal.querySelector("#u-class").value.trim(),
        studentCode: modal.querySelector("#u-code").value.trim(),
        phone: modal.querySelector("#u-phone").value.trim()
      };

      if (user) {
        API.update("users", user.id, payload);
        A.toast("success", "Đã cập nhật tài khoản", name);
      } else {
        payload.active = true;
        payload.completedLessons = [];
        payload.createdAt = API.nowISO();
        API.insert("users", payload);
        API.logActivity("Quản trị viên tạo tài khoản " + name + " (" + A.roleLabel(payload.role) + ")");
        A.toast("success", "Đã tạo tài khoản", name + " · " + A.roleLabel(payload.role));
      }
      A.closeModal();
      renderUsers();
    });
  }

  /* =====================================================
     SÂU BỆNH
     ===================================================== */

  function initPests() {
    var crops = API.list("crops");
    A.$("#pest-crop").insertAdjacentHTML("beforeend", crops.map(function (c) {
      return '<option value="' + c.id + '">' + A.esc(c.name) + "</option>";
    }).join(""));

    A.$("#pest-status").addEventListener("change", renderPests);
    A.$("#pest-crop").addEventListener("change", renderPests);
    A.$("#pest-search").addEventListener("input", renderPests);
    A.$("#pest-add").addEventListener("click", function () { openPestEditor(null); });
    renderPests();
  }

  function statusBadge(status) {
    return {
      approved: A.badge("Đã duyệt", "success"),
      pending: A.badge("Chờ duyệt", "warning"),
      rejected: A.badge("Bị từ chối", "danger")
    }[status] || A.badge("Không rõ", "muted");
  }

  function renderPests() {
    var pests = API.list("pests");
    var statusFilter = A.$("#pest-status").value;
    var cropFilter = A.$("#pest-crop").value;
    var keyword = (A.$("#pest-search").value || "").trim().toLowerCase();

    A.$("#pest-stats").innerHTML =
      stat(pests.length, "Tổng hồ sơ") +
      stat(pests.filter(function (p) { return p.status === "approved"; }).length, "Đã duyệt") +
      stat(pests.filter(function (p) { return p.status === "pending"; }).length, "Chờ duyệt") +
      stat(pests.filter(function (p) { return p.status === "rejected"; }).length, "Bị từ chối");

    var rows = pests.filter(function (p) {
      if (statusFilter && p.status !== statusFilter) return false;
      if (cropFilter && p.cropId !== cropFilter) return false;
      if (keyword) {
        var hay = (p.name + " " + p.symptoms.join(" ") + " " + p.remedy).toLowerCase();
        if (hay.indexOf(keyword) < 0) return false;
      }
      return true;
    });

    A.$("#pest-count").textContent = rows.length + " hồ sơ";
    var host = A.$("#pest-list");

    if (!rows.length) {
      host.innerHTML = '<tr><td colspan="6">' + A.emptyState({
        icon: "◎", title: "Không có hồ sơ phù hợp", text: "Thử bộ lọc khác hoặc thêm hồ sơ sâu bệnh mới."
      }) + "</td></tr>";
      return;
    }

    host.innerHTML = rows.map(function (p) {
      var crop = API.find("crops", p.cropId);
      return "<tr>" +
        '<td><div class="cell-main">' + A.esc(p.name) + "</div>" +
        '<div class="cell-sub">' + A.esc(p.symptoms.join(" · ")) + "</div></td>" +
        '<td class="small">' + A.esc(crop ? crop.name : "—") + "</td>" +
        "<td>" + A.badge("Mức " + p.harmLevel,
          p.harmLevel === "cao" ? "danger" : p.harmLevel === "trung bình" ? "warning" : "success") + "</td>" +
        "<td>" + statusBadge(p.status) +
        (p.status === "rejected" && p.rejectReason ? '<div class="small muted">Lý do: ' + A.esc(p.rejectReason) + "</div>" : "") +
        "</td>" +
        '<td class="small" style="max-width:220px">' + A.esc(p.remedy) + "</td>" +
        '<td><div class="actions">' +
        (p.status !== "approved" ? '<button class="btn btn--primary btn--sm" type="button" data-ok="' + p.id + '">Duyệt</button>' : "") +
        (p.status !== "rejected" ? '<button class="btn btn--ghost btn--sm" type="button" data-no="' + p.id + '">Từ chối</button>' : "") +
        '<button class="btn btn--ghost btn--sm" type="button" data-edit="' + p.id + '">Sửa</button>' +
        '<button class="btn btn--danger btn--sm" type="button" data-del="' + p.id + '">Xóa</button>' +
        "</div></td></tr>";
    }).join("");

    A.$$("[data-ok]", host).forEach(function (b) {
      b.addEventListener("click", function () { setStatus(b.dataset.ok, "approved"); });
    });
    A.$$("[data-no]", host).forEach(function (b) {
      b.addEventListener("click", function () { setStatus(b.dataset.no, "rejected"); });
    });
    A.$$("[data-edit]", host).forEach(function (b) {
      b.addEventListener("click", function () { openPestEditor(b.dataset.edit); });
    });
    A.$$("[data-del]", host).forEach(function (b) {
      b.addEventListener("click", function () { deletePest(b.dataset.del); });
    });
  }

  function setStatus(id, status) {
    if (status === "rejected") { openRejectReason(id); return; }
    var pest = API.find("pests", id);
    API.update("pests", id, { status: status, rejectReason: "" });
    API.logActivity("Quản trị viên duyệt hồ sơ \"" + pest.name + "\"");
    A.toast("success", "Đã duyệt hồ sơ", pest.name);
    renderPests();
  }

  function openRejectReason(id) {
    var pest = API.find("pests", id);
    var body = '<form id="reject-form" novalidate>' +
      '<p class="small muted">Hồ sơ <strong>' + A.esc(pest.name) + "</strong> sẽ bị ẩn khỏi chẩn đoán. Ghi lý do để giảng viên chỉnh sửa và gửi lại.</p>" +
      '<div class="field"><label for="p-reject">Lý do từ chối <span class="req">*</span></label>' +
      '<textarea class="textarea" id="p-reject" rows="3" placeholder="Ví dụ: triệu chứng trùng với hồ sơ đã có, thiếu hướng xử lý…">' +
      A.esc(pest.rejectReason || "") + "</textarea></div></form>";
    var actions = '<button class="btn btn--ghost" type="button" data-act="cancel">Hủy</button>' +
      '<button class="btn btn--danger" type="button" data-act="save">Từ chối hồ sơ</button>';

    var modal = A.openModal({ title: "Từ chối hồ sơ sâu bệnh", body: body, actions: actions });
    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", function () {
      var reason = modal.querySelector("#p-reject").value.trim();
      if (!reason) {
        A.toast("error", "Thiếu lý do", "Nhập lý do từ chối để giảng viên biết cần sửa gì.");
        modal.querySelector("#p-reject").focus();
        return;
      }
      API.update("pests", id, { status: "rejected", rejectReason: reason });
      API.logActivity("Quản trị viên từ chối hồ sơ \"" + pest.name + "\"");
      A.toast("warn", "Đã từ chối hồ sơ", pest.name + " · " + reason);
      A.closeModal();
      renderPests();
    });
  }

  function deletePest(id) {
    var pest = API.find("pests", id);
    A.confirm({
      title: "Xóa hồ sơ sâu bệnh?",
      message: "\"" + pest.name + "\" sẽ bị gỡ khỏi thư viện. Các chẩn đoán đã lưu vẫn được giữ.",
      confirmText: "Xóa hồ sơ", danger: true
    }).then(function (ok) {
      if (!ok) return;
      API.remove("pests", id);
      A.toast("success", "Đã xóa hồ sơ", pest.name);
      renderPests();
    });
  }

  function openPestEditor(id) {
    var pest = id ? API.find("pests", id) : null;
    var crops = API.list("crops");

    var body =
      '<form id="pest-form" novalidate><div class="form-grid">' +
      '<div class="field"><label for="p-name">Tên sâu bệnh <span class="req">*</span></label>' +
      '<input class="input" id="p-name" value="' + A.esc(pest ? pest.name : "") + '"></div>' +
      '<div class="field"><label for="p-crop">Cây trồng</label><select class="select" id="p-crop">' +
      crops.map(function (c) {
        return '<option value="' + c.id + '"' + (pest && pest.cropId === c.id ? " selected" : "") + ">" + A.esc(c.name) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label for="p-harm">Mức gây hại</label><select class="select" id="p-harm">' +
      ["thấp", "trung bình", "cao"].map(function (h) {
        return '<option' + (pest && pest.harmLevel === h ? " selected" : "") + ">" + h + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label for="p-status">Trạng thái</label><select class="select" id="p-status">' +
      '<option value="pending"' + (pest && pest.status === "pending" ? " selected" : "") + ">Chờ duyệt</option>" +
      '<option value="approved"' + (pest && pest.status === "approved" ? " selected" : "") + ">Đã duyệt</option>" +
      '<option value="rejected"' + (pest && pest.status === "rejected" ? " selected" : "") + ">Bị từ chối</option></select></div>" +
      '<div class="field full"><label for="p-symptoms">Triệu chứng (cách nhau bằng dấu phẩy) <span class="req">*</span></label>' +
      '<input class="input" id="p-symptoms" value="' + A.esc(pest ? pest.symptoms.join(", ") : "") + '" placeholder="lá quăn, đốm nâu, thân rỗng"></div>' +
      '<div class="field full"><label for="p-remedy">Hướng xử lý</label>' +
      '<textarea class="textarea" id="p-remedy" rows="3">' + A.esc(pest ? pest.remedy : "") + "</textarea></div>" +
      "</div></form>";

    var actions = '<button class="btn btn--ghost" type="button" data-act="cancel">Hủy</button>' +
      '<button class="btn btn--primary" type="button" data-act="save">' + (pest ? "Lưu hồ sơ" : "Thêm hồ sơ") + "</button>";

    var modal = A.openModal({ title: pest ? "Sửa hồ sơ sâu bệnh" : "Thêm hồ sơ sâu bệnh", body: body, actions: actions });
    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", function () {
      var name = modal.querySelector("#p-name").value.trim();
      var symptoms = modal.querySelector("#p-symptoms").value.split(",")
        .map(function (s) { return s.trim(); })
        .filter(Boolean);

      if (!name) { A.toast("error", "Thiếu tên sâu bệnh", "Nhập tên sâu bệnh cần quản lý."); return; }
      if (!symptoms.length) { A.toast("error", "Thiếu triệu chứng", "Nhập ít nhất một triệu chứng nhận diện."); return; }

      var payload = {
        name: name,
        cropId: modal.querySelector("#p-crop").value,
        harmLevel: modal.querySelector("#p-harm").value,
        symptoms: symptoms,
        remedy: modal.querySelector("#p-remedy").value.trim(),
        status: modal.querySelector("#p-status").value
      };

      if (pest) {
        API.update("pests", pest.id, payload);
        A.toast("success", "Đã lưu hồ sơ", name);
      } else {
        API.insert("pests", payload);
        API.logActivity("Quản trị viên thêm hồ sơ sâu bệnh \"" + name + "\"");
        A.toast("success", "Đã thêm hồ sơ", name + " · " + symptoms.length + " triệu chứng");
      }
      A.closeModal();
      renderPests();
    });
  }
})();
