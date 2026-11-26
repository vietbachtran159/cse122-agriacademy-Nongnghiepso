/* =========================================================
   landing.js – Trang giới thiệu (index.html)
   ========================================================= */
(function () {
  "use strict";

  var API = window.AgriAPI;
  var A = window.Agri;

  function boot() {
    var year = A.$("#landing-year");
    if (year) year.textContent = new Date().getFullYear();

    var user = API.currentUser();
    if (user) {
      var cta = A.$("#landing-primary-cta");
      if (cta) {
        cta.textContent = "Vào lớp học";
        cta.href = "pages/" + A.homeFor(user.role);
        cta.dataset.roleJump = user.role;
      }
    }

    var lessons = API.where("lessons", function (l) { return l.status === "published"; }).length;
    var crops = API.list("crops").length;
    var pests = API.where("pests", function (p) { return p.status === "approved"; }).length;
    var setCount = function (key, value) {
      A.$$('[data-landing-count="' + key + '"]').forEach(function (node) { node.textContent = value; });
    };
    setCount("lessons", lessons);
    setCount("crops", crops);
    setCount("pests", pests);

    var months = A.$("#landing-cal-months");
    if (months) {
      months.innerHTML = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(function (d) {
        return "<span>" + d + "</span>";
      }).join("") + Array.apply(null, Array(28)).map(function (_, i) {
        var cls = "";
        if (i >= 4 && i <= 9) cls = "p";
        if (i >= 12 && i <= 15) cls = "b";
        if (i >= 20 && i <= 24) cls = "h";
        return '<i class="' + cls + '">' + (i + 1) + "</i>";
      }).join("");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    API.ready().then(boot);
  });
})();
