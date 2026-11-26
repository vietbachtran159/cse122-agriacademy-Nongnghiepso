/* =========================================================
   manage.js – Giảng viên: quản lý bài giảng, cây trồng, bài tập
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;
  var LETTERS = ["A", "B", "C", "D"];

  document.addEventListener("agri:shell-ready", function (event) {
    var page = document.body.dataset.page;
    if (!event.detail.user) return;
    if (page === "teacher-lesson-manage") initLessonManage();
    if (page === "teacher-crop-manage") initCropManage();
    if (page === "teacher-exercise-build") initExerciseBuild();
  });

  /* =====================================================
     BÀI GIẢNG
     ===================================================== */

  function initLessonManage() {
    var search = A.$("#lesson-search");
    var status = A.$("#lesson-status");
    search.addEventListener("input", renderLessons);
    status.addEventListener("change", renderLessons);
    A.$("#lesson-add").addEventListener("click", function () { openLessonEditor(null); });
    renderLessons();
  }

  function renderLessons() {
    var host = A.$("#lesson-manage-list");
    var keyword = (A.$("#lesson-search").value || "").trim().toLowerCase();
    var statusFilter = A.$("#lesson-status").value;

    var rows = API.list("lessons").sort(function (a, b) { return (a.order || 0) - (b.order || 0); })
      .filter(function (l) {
        if (statusFilter && l.status !== statusFilter) return false;
        if (!keyword) return true;
        return (l.title + " " + l.topic + " " + l.summary).toLowerCase().indexOf(keyword) >= 0;
      });

    A.$("#lesson-count").textContent = rows.length + " bài giảng";

    if (!rows.length) {
      host.innerHTML = A.emptyState({
        icon: "▤", title: "Không có bài giảng phù hợp",
        text: "Thử bộ lọc khác hoặc tạo bài giảng mới.",
        action: '<button class="btn btn--primary btn--sm" type="button" id="lesson-empty-add">Thêm bài giảng</button>'
      });
      A.$("#lesson-empty-add").addEventListener("click", function () { openLessonEditor(null); });
      return;
    }

    host.innerHTML = rows.map(function (lesson) {
      var badge = lesson.status === "published" ? A.badge("Đã xuất bản", "success") : A.badge("Bản nháp", "muted");
      return '<div class="manage-row">' +
        '<span class="order-badge">' + (lesson.order || "–") + "</span>" +
        '<div class="info"><strong>' + A.esc(lesson.title) + "</strong>" +
        "<span>" + A.esc(lesson.topic) + " · " + lesson.durationMin + " phút · cập nhật " + A.formatDate(lesson.updatedAt) + "</span></div>" +
        badge +
        '<div class="row-actions">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-edit="' + lesson.id + '">Sửa</button>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-toggle="' + lesson.id + '">' +
        (lesson.status === "published" ? "Ẩn" : "Xuất bản") + "</button>" +
        '<button class="btn btn--danger btn--sm" type="button" data-del="' + lesson.id + '">Xóa</button>' +
        "</div></div>";
    }).join("");

    A.$$("[data-edit]", host).forEach(function (b) {
      b.addEventListener("click", function () { openLessonEditor(b.dataset.edit); });
    });
    A.$$("[data-toggle]", host).forEach(function (b) {
      b.addEventListener("click", function () { toggleLesson(b.dataset.toggle); });
    });
    A.$$("[data-del]", host).forEach(function (b) {
      b.addEventListener("click", function () { deleteLesson(b.dataset.del); });
    });
  }

  function toggleLesson(id) {
    var lesson = API.find("lessons", id);
    var nextStatus = lesson.status === "published" ? "draft" : "published";
    API.update("lessons", id, { status: nextStatus, updatedAt: API.nowISO() });
    A.toast(nextStatus === "published" ? "success" : "info",
      nextStatus === "published" ? "Đã xuất bản bài giảng" : "Đã chuyển về bản nháp", lesson.title);
    API.logActivity("ThS. Phạm Thu Hà " + (nextStatus === "published" ? "xuất bản" : "ẩn") + " bài giảng \"" + lesson.title + "\"");
    renderLessons();
  }

  function deleteLesson(id) {
    var lesson = API.find("lessons", id);
    A.confirm({
      title: "Xóa bài giảng?",
      message: "\"" + lesson.title + "\" sẽ bị xóa khỏi hệ thống. Sinh viên sẽ không còn thấy bài này.",
      confirmText: "Xóa bài giảng", danger: true
    }).then(function (ok) {
      if (!ok) return;
      API.remove("lessons", id);
      A.toast("success", "Đã xóa bài giảng", lesson.title);
      renderLessons();
    });
  }

  function openLessonEditor(id) {
    var lesson = id ? API.find("lessons", id) : null;
    var body =
      '<form id="lesson-form" novalidate><div class="form-grid">' +
      '<div class="field full"><label for="l-title">Tiêu đề <span class="req">*</span></label>' +
      '<input class="input" id="l-title" maxlength="120" value="' + A.esc(lesson ? lesson.title : "") + '"></div>' +
      '<div class="field"><label for="l-topic">Chủ đề</label>' +
      '<select class="select" id="l-topic">' +
      ["Trồng trọt", "Sâu bệnh", "Chăn nuôi", "Đất & phân bón"].map(function (t) {
        return "<option" + (lesson && lesson.topic === t ? " selected" : "") + ">" + t + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label for="l-duration">Thời lượng (phút)</label>' +
      '<input class="input" id="l-duration" type="number" min="5" max="120" value="' + (lesson ? lesson.durationMin : 20) + '"></div>' +
      '<div class="field"><label for="l-order">Thứ tự</label>' +
      '<input class="input" id="l-order" type="number" min="1" max="99" value="' +
      (lesson ? lesson.order : API.list("lessons").length + 1) + '"></div>' +
      '<div class="field"><label for="l-status">Trạng thái</label>' +
      '<select class="select" id="l-status"><option value="draft"' + (lesson && lesson.status === "draft" ? " selected" : "") +
      '>Bản nháp</option><option value="published"' + (lesson && lesson.status === "published" ? " selected" : "") +
      ">Xuất bản</option></select></div>" +
      '<div class="field full"><label for="l-summary">Tóm tắt</label>' +
      '<textarea class="textarea" id="l-summary" rows="2" maxlength="240">' + A.esc(lesson ? lesson.summary : "") + "</textarea></div>" +
      '<div class="field full"><label for="l-content">Nội dung (hỗ trợ HTML cơ bản)</label>' +
      '<textarea class="textarea" id="l-content" rows="9" style="min-height:200px">' + A.esc(lesson ? lesson.content : "") + "</textarea>" +
      '<span class="field__hint">Dùng &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;… để chia mục bài giảng.</span></div>' +
      "</div></form>";

    var actions = '<button class="btn btn--ghost" type="button" data-act="cancel">Hủy</button>' +
      '<button class="btn btn--primary" type="button" data-act="save">' + (lesson ? "Lưu thay đổi" : "Tạo bài giảng") + "</button>";

    var modal = A.openModal({ title: lesson ? "Sửa bài giảng" : "Thêm bài giảng", body: body, actions: actions, wide: true });
    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", function () {
      var form = modal.querySelector("#lesson-form");
      A.clearErrors(form);
      var title = modal.querySelector("#l-title").value.trim();
      if (!title) { A.setFieldError(modal.querySelector("#l-title"), "Nhập tiêu đề bài giảng."); return; }
      var content = modal.querySelector("#l-content").value.trim();
      if (!content) { A.setFieldError(modal.querySelector("#l-content"), "Nhập nội dung bài giảng."); return; }

      var payload = {
        title: title,
        topic: modal.querySelector("#l-topic").value,
        durationMin: Number(modal.querySelector("#l-duration").value) || 20,
        order: Number(modal.querySelector("#l-order").value) || 1,
        status: modal.querySelector("#l-status").value,
        summary: modal.querySelector("#l-summary").value.trim(),
        content: content,
        updatedAt: API.nowISO()
      };

      if (lesson) {
        API.update("lessons", lesson.id, payload);
        A.toast("success", "Đã cập nhật bài giảng", title);
      } else {
        payload.createdBy = "u4";
        API.insert("lessons", payload);
        A.toast("success", "Đã tạo bài giảng", title + (payload.status === "draft" ? " (bản nháp)" : ""));
        API.logActivity("ThS. Phạm Thu Hà tạo bài giảng \"" + title + "\"");
      }
      A.closeModal();
      renderLessons();
    });
  }

  /* =====================================================
     CÂY TRỒNG
     ===================================================== */

  function initCropManage() {
    A.$("#crop-search").addEventListener("input", renderCrops);
    A.$("#crop-add").addEventListener("click", function () { openCropEditor(null); });
    renderCrops();
  }

  function renderCrops() {
    var host = A.$("#crop-manage-list");
    var keyword = (A.$("#crop-search").value || "").trim().toLowerCase();
    var rows = API.list("crops").filter(function (c) {
      if (!keyword) return true;
      return (c.name + " " + c.region + " " + c.season + " " + c.scientificName).toLowerCase().indexOf(keyword) >= 0;
    });

    A.$("#crop-count").textContent = rows.length + " cây trồng";

    if (!rows.length) {
      host.innerHTML = A.emptyState({
        icon: "❧", title: "Không có cây trồng phù hợp",
        text: "Thêm cây trồng mới vào thư viện để sinh viên tra cứu.",
        action: '<button class="btn btn--primary btn--sm" type="button" id="crop-empty-add">Thêm cây trồng</button>'
      });
      A.$("#crop-empty-add").addEventListener("click", function () { openCropEditor(null); });
      return;
    }

    host.innerHTML = rows.map(function (crop) {
      return '<div class="manage-row">' +
        '<span class="order-badge">❧</span>' +
        '<div class="info"><strong>' + A.esc(crop.name) + "</strong>" +
        "<span>" + A.esc(crop.region) + " · " + A.esc(crop.season) + " · " + (crop.careStep || []).length + " bước chăm sóc</span></div>" +
        '<div class="row-actions">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-edit="' + crop.id + '">Sửa</button>' +
        '<button class="btn btn--danger btn--sm" type="button" data-del="' + crop.id + '">Xóa</button>' +
        "</div></div>";
    }).join("");

    A.$$("[data-edit]", host).forEach(function (b) {
      b.addEventListener("click", function () { openCropEditor(b.dataset.edit); });
    });
    A.$$("[data-del]", host).forEach(function (b) {
      b.addEventListener("click", function () { deleteCrop(b.dataset.del); });
    });
  }

  function stepRow(step) {
    return '<div class="phase-editor" data-crop-step style="margin-bottom:8px"><div class="row" style="grid-template-columns:1fr 2fr auto">' +
      '<input class="input" data-step-title placeholder="Tên bước" value="' + A.esc(step ? step.title : "") + '">' +
      '<input class="input" data-step-detail placeholder="Chi tiết thực hiện" value="' + A.esc(step ? step.detail : "") + '">' +
      '<button class="btn btn--ghost btn--sm" type="button" data-remove-step aria-label="Xóa bước">✕</button>' +
      "</div></div>";
  }

  function openCropEditor(id) {
    var crop = id ? API.find("crops", id) : null;
    var steps = crop ? crop.careStep.slice() : [{ title: "", detail: "" }];

    var body =
      '<form id="crop-form" novalidate><div class="form-grid">' +
      '<div class="field"><label for="c-name">Tên cây <span class="req">*</span></label>' +
      '<input class="input" id="c-name" value="' + A.esc(crop ? crop.name : "") + '"></div>' +
      '<div class="field"><label for="c-sci">Tên khoa học</label>' +
      '<input class="input" id="c-sci" value="' + A.esc(crop ? crop.scientificName : "") + '"></div>' +
      '<div class="field"><label for="c-region">Vùng miền <span class="req">*</span></label>' +
      '<input class="input" id="c-region" value="' + A.esc(crop ? crop.region : "") + '" placeholder="Đồng bằng sông Hồng"></div>' +
      '<div class="field"><label for="c-season">Mùa vụ</label>' +
      '<input class="input" id="c-season" value="' + A.esc(crop ? crop.season : "Đông–Xuân") + '"></div>' +
      '<div class="field full"><label for="c-note">Ghi chú</label>' +
      '<textarea class="textarea" id="c-note" rows="2">' + A.esc(crop ? crop.note : "") + "</textarea></div>" +
      "</div><h3 class=\"mt-2\">Quy trình chăm sóc <span class=\"req\">*</span></h3>" +
      '<div id="c-steps">' + steps.map(stepRow).join("") + "</div>" +
      '<button class="btn btn--ghost btn--sm" type="button" id="c-add-step">+ Thêm bước</button></form>';

    var actions = '<button class="btn btn--ghost" type="button" data-act="cancel">Hủy</button>' +
      '<button class="btn btn--primary" type="button" data-act="save">' + (crop ? "Lưu thay đổi" : "Thêm cây trồng") + "</button>";

    var modal = A.openModal({ title: crop ? "Sửa cây trồng: " + crop.name : "Thêm cây trồng", body: body, actions: actions, wide: true });

    function bindStepRemovers() {
      A.$$("[data-remove-step]", modal).forEach(function (btn) {
        btn.onclick = function () {
          var rows = A.$$("[data-crop-step]", modal);
          if (rows.length <= 1) { A.toast("warn", "Cần ít nhất một bước", "Quy trình chăm sóc không được để trống."); return; }
          btn.closest("[data-crop-step]").remove();
        };
      });
    }
    bindStepRemovers();

    modal.querySelector("#c-add-step").addEventListener("click", function () {
      modal.querySelector("#c-steps").insertAdjacentHTML("beforeend", stepRow(null));
      bindStepRemovers();
    });

    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", function () {
      var form = modal.querySelector("#crop-form");
      A.clearErrors(form);
      var name = modal.querySelector("#c-name").value.trim();
      var region = modal.querySelector("#c-region").value.trim();
      if (!name) { A.setFieldError(modal.querySelector("#c-name"), "Nhập tên cây trồng."); return; }
      if (!region) { A.setFieldError(modal.querySelector("#c-region"), "Nhập vùng miền."); return; }

      var careStep = A.$$("#c-steps > div", modal).map(function (row, index) {
        return {
          step: index + 1,
          title: row.querySelector("[data-step-title]").value.trim(),
          detail: row.querySelector("[data-step-detail]").value.trim()
        };
      }).filter(function (s) { return s.title; });

      if (!careStep.length) { A.toast("error", "Thiếu quy trình chăm sóc", "Nhập ít nhất một bước có tên."); return; }

      var payload = {
        name: name,
        scientificName: modal.querySelector("#c-sci").value.trim(),
        region: region,
        season: modal.querySelector("#c-season").value.trim() || "Quanh năm",
        note: modal.querySelector("#c-note").value.trim(),
        careStep: careStep,
        status: "approved"
      };

      if (crop) {
        API.update("crops", crop.id, payload);
        A.toast("success", "Đã cập nhật cây trồng", name);
      } else {
        API.insert("crops", payload);
        A.toast("success", "Đã thêm cây trồng", name);
        API.logActivity("ThS. Phạm Thu Hà thêm cây trồng \"" + name + "\" vào thư viện");
      }
      A.closeModal();
      renderCrops();
    });
  }

  function deleteCrop(id) {
    var crop = API.find("crops", id);
    if (!crop) return;
    var used = API.where("seasons", function (s) { return s.cropId === id; }).length;
    A.confirm({
      title: "Xóa cây trồng?",
      message: "\"" + crop.name + "\" sẽ bị gỡ khỏi thư viện." +
        (used ? " Có " + used + " mùa vụ đang tham chiếu tới cây này – lịch của sinh viên có thể bị ảnh hưởng." : ""),
      confirmText: "Xóa cây trồng", danger: true
    }).then(function (ok) {
      if (!ok) return;
      API.remove("crops", id);
      A.toast("success", "Đã xóa cây trồng", crop.name);
      renderCrops();
    });
  }

  /* =====================================================
     BÀI TẬP
     ===================================================== */

  function initExerciseBuild() {
    A.$("#exercise-add").addEventListener("click", function () { openExerciseEditor(null); });
    renderExercises();
  }

  function renderExercises() {
    var host = A.$("#exercise-build-list");
    var rows = API.list("exercises");
    A.$("#exercise-count").textContent = rows.length + " bài tập";

    if (!rows.length) {
      host.innerHTML = A.emptyState({
        icon: "✎", title: "Chưa có bài tập",
        text: "Tạo bài tập tình huống nhiều bước kèm lời giải để sinh viên luyện chẩn đoán.",
        action: '<button class="btn btn--primary btn--sm" type="button" id="ex-empty-add">Tạo bài tập</button>'
      });
      A.$("#ex-empty-add").addEventListener("click", function () { openExerciseEditor(null); });
      return;
    }

    host.innerHTML = rows.map(function (ex) {
      var crop = API.find("crops", ex.cropId);
      var subs = API.where("submissions", function (s) { return s.exerciseId === ex.id; });
      var pending = subs.filter(function (s) { return s.status === "pending"; }).length;
      return '<div class="manage-row">' +
        '<span class="order-badge">' + ex.steps.length + "</span>" +
        '<div class="info"><strong>' + A.esc(ex.title) + "</strong>" +
        "<span>" + A.esc(crop ? crop.name : "") + " · " + A.esc(ex.level) + " · " + ex.steps.length + " bước · " +
        subs.length + " lượt nộp" + (pending ? " (" + pending + " chờ chấm)" : "") + "</span></div>" +
        (ex.status === "published" ? A.badge("Đang mở", "success") : A.badge("Tạm ẩn", "muted")) +
        '<div class="row-actions">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-edit="' + ex.id + '">Sửa</button>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-toggle="' + ex.id + '">' +
        (ex.status === "published" ? "Ẩn" : "Mở") + "</button>" +
        '<button class="btn btn--danger btn--sm" type="button" data-del="' + ex.id + '">Xóa</button>' +
        "</div></div>";
    }).join("");

    A.$$("[data-edit]", host).forEach(function (b) {
      b.addEventListener("click", function () { openExerciseEditor(b.dataset.edit); });
    });
    A.$$("[data-toggle]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var ex = API.find("exercises", b.dataset.toggle);
        var next = ex.status === "published" ? "draft" : "published";
        API.update("exercises", ex.id, { status: next });
        A.toast(next === "published" ? "success" : "info",
          next === "published" ? "Đã mở bài tập" : "Đã tạm ẩn bài tập", ex.title);
        renderExercises();
      });
    });
    A.$$("[data-del]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var ex = API.find("exercises", b.dataset.del);
        A.confirm({
          title: "Xóa bài tập?",
          message: "\"" + ex.title + "\" cùng các bài nộp liên quan sẽ bị gỡ.",
          confirmText: "Xóa", danger: true
        }).then(function (ok) {
          if (!ok) return;
          API.where("submissions", function (s) { return s.exerciseId === ex.id; })
            .forEach(function (s) { API.remove("submissions", s.id); });
          API.remove("exercises", ex.id);
          A.toast("success", "Đã xóa bài tập", ex.title);
          renderExercises();
        });
      });
    });
  }

  function stepBlock(step, index) {
    var s = step || { q: "", options: ["", "", "", ""], answer: 0, explain: "" };
    var options = s.options.slice();
    while (options.length < 4) options.push("");

    return '<div class="card card--soft ex-step" data-step-block style="margin-bottom:14px">' +
      '<div class="flex-between mb-1"><strong>Bước <span data-step-no>' + (index + 1) + "</span></strong>" +
      '<button class="btn btn--link btn--sm" type="button" data-remove-block style="color:var(--red-600)">Xóa bước</button></div>' +
      '<div class="field"><label>Câu hỏi</label><input class="input" data-q value="' + A.esc(s.q) + '"></div>' +
      '<div class="form-grid mt-1" style="gap:10px">' +
      options.slice(0, 4).map(function (opt, i) {
        return '<div class="field"><label>Đáp án ' + LETTERS[i] + '</label>' +
          '<input class="input" data-opt="' + i + '" value="' + A.esc(opt) + '"></div>';
      }).join("") + "</div>" +
      '<div class="form-grid mt-1" style="gap:10px">' +
      '<div class="field"><label>Đáp án đúng</label><select class="select" data-answer>' +
      LETTERS.map(function (l, i) {
        return '<option value="' + i + '"' + (s.answer === i ? " selected" : "") + ">" + l + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label>Giải thích</label><input class="input" data-explain value="' + A.esc(s.explain) + '"></div>' +
      "</div></div>";
  }

  function openExerciseEditor(id) {
    var ex = id ? API.find("exercises", id) : null;
    var crops = API.list("crops");
    var steps = ex ? ex.steps : [null];

    var body =
      '<form id="ex-form" novalidate><div class="form-grid">' +
      '<div class="field full"><label for="ex-title">Tên bài tập <span class="req">*</span></label>' +
      '<input class="input" id="ex-title" value="' + A.esc(ex ? ex.title : "") + '"></div>' +
      '<div class="field"><label for="ex-crop">Cây trồng</label><select class="select" id="ex-crop">' +
      crops.map(function (c) {
        return '<option value="' + c.id + '"' + (ex && ex.cropId === c.id ? " selected" : "") + ">" + A.esc(c.name) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label for="ex-level">Mức độ</label><select class="select" id="ex-level">' +
      ["Cơ bản", "Trung bình", "Nâng cao"].map(function (l) {
        return "<option" + (ex && ex.level === l ? " selected" : "") + ">" + l + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label for="ex-status">Trạng thái</label><select class="select" id="ex-status">' +
      '<option value="draft"' + (ex && ex.status === "draft" ? " selected" : "") + ">Tạm ẩn</option>" +
      '<option value="published"' + (ex && ex.status === "published" ? " selected" : "") + ">Đang mở</option></select></div>" +
      "</div><h3 class=\"mt-2\">Các bước tình huống</h3>" +
      '<div id="ex-steps">' + steps.map(stepBlock).join("") + "</div>" +
      '<button class="btn btn--ghost btn--sm" type="button" id="ex-add-step">+ Thêm bước</button></form>';

    var actions = '<button class="btn btn--ghost" type="button" data-act="cancel">Hủy</button>' +
      '<button class="btn btn--primary" type="button" data-act="save">' + (ex ? "Lưu bài tập" : "Tạo bài tập") + "</button>";

    var modal = A.openModal({ title: ex ? "Sửa bài tập" : "Tạo bài tập mới", body: body, actions: actions, wide: true });

    function renumber() {
      A.$$("[data-step-block]", modal).forEach(function (block, i) {
        block.querySelector("[data-step-no]").textContent = i + 1;
      });
    }

    function bindRemovers() {
      A.$$("[data-remove-block]", modal).forEach(function (btn) {
        btn.onclick = function () {
          var blocks = A.$$("[data-step-block]", modal);
          if (blocks.length <= 1) { A.toast("warn", "Cần ít nhất một bước", "Bài tập phải có tối thiểu một câu hỏi."); return; }
          btn.closest("[data-step-block]").remove();
          renumber();
        };
      });
    }
    bindRemovers();

    modal.querySelector("#ex-add-step").addEventListener("click", function () {
      var host = modal.querySelector("#ex-steps");
      host.insertAdjacentHTML("beforeend", stepBlock(null, A.$$("[data-step-block]", modal).length));
      bindRemovers();
    });

    modal.querySelector('[data-act="cancel"]').addEventListener("click", A.closeModal);
    modal.querySelector('[data-act="save"]').addEventListener("click", function () {
      var title = modal.querySelector("#ex-title").value.trim();
      if (!title) { A.toast("error", "Thiếu tên bài tập", "Nhập tên bài tập tình huống."); return; }

      var blocks = A.$$("[data-step-block]", modal);
      var newSteps = [];
      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        var q = b.querySelector("[data-q]").value.trim();
        var opts = [0, 1, 2, 3].map(function (k) { return b.querySelector('[data-opt="' + k + '"]').value.trim(); });
        var explain = b.querySelector("[data-explain]").value.trim();
        if (!q) { A.toast("error", "Bước " + (i + 1) + " thiếu câu hỏi", "Nhập nội dung câu hỏi cho từng bước."); return; }
        if (opts.some(function (o) { return !o; })) {
          A.toast("error", "Bước " + (i + 1) + " thiếu đáp án", "Điền đủ 4 lựa chọn A–D.");
          return;
        }
        newSteps.push({ q: q, options: opts, answer: Number(b.querySelector("[data-answer]").value), explain: explain });
      }

      var payload = {
        title: title,
        cropId: modal.querySelector("#ex-crop").value,
        level: modal.querySelector("#ex-level").value,
        status: modal.querySelector("#ex-status").value,
        steps: newSteps
      };

      if (ex) {
        API.update("exercises", ex.id, payload);
        A.toast("success", "Đã lưu bài tập", title);
      } else {
        API.insert("exercises", payload);
        A.toast("success", "Đã tạo bài tập", title + " · " + newSteps.length + " bước");
        API.logActivity("ThS. Phạm Thu Hà tạo bài tập \"" + title + "\"");
      }
      A.closeModal();
      renderExercises();
    });
  }
})();
