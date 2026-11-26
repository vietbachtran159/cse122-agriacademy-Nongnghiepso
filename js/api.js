/* =========================================================
   api.js – Mock API (localStorage + db.json, chuẩn JSON Server)
   Dùng được cả khi mở qua http(s) và khi mở trực tiếp file://
   ========================================================= */
(function () {
  "use strict";

  var scriptUrl = document.currentScript ? document.currentScript.src : location.href;
  var DB_URL = new URL("../db.json", scriptUrl).href;

  var DB_KEY = "agriacademy.db.v1";
  var ROLE_KEY = "agriacademy.role.v1";
  var ROLES = ["guest", "student", "teacher", "admin"];
  var DEFAULT_ROLE = "student";
  var DEMO_ACCOUNT = { student: "u1", teacher: "u4", admin: "u5" };
  var COLLECTIONS = [
    "users", "crops", "seasons", "lessons", "cropJournals",
    "pests", "exercises", "submissions", "diagnoses",
    "notifications", "activities"
  ];

  var db = null;
  var readyPromise = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function uid(prefix) {
    return (prefix || "x") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ---------- Chuẩn hoá & nạp dữ liệu ---------- */

  function normalize(raw) {
    var out = {};
    COLLECTIONS.forEach(function (name) {
      out[name] = Array.isArray(raw[name]) ? raw[name] : [];
    });
    // Bỏ trường mật khẩu còn sót từ phiên bản có đăng nhập
    out.users.forEach(function (user) { delete user.password; });
    out.meta = raw.meta || { version: 1, seededAt: nowISO() };
    return out;
  }

  function mergeSeed(stored, seed) {
    // Bổ sung bản ghi mới từ db.json mà không ghi đè dữ liệu người dùng đã tạo
    var merged = normalize(stored);
    COLLECTIONS.forEach(function (name) {
      var existing = merged[name];
      var seedRows = seed[name] || [];
      seedRows.forEach(function (row) {
        var found = existing.some(function (r) { return String(r.id) === String(row.id); });
        if (!found) existing.push(clone(row));
      });
      if (!existing.length) merged[name] = clone(seedRows);
    });
    merged.meta = Object.assign({}, seed.meta || {}, stored.meta || {});
    return merged;
  }

  function readStored() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function persist() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (err) {
      console.warn("[AgriAPI] Không ghi được localStorage:", err);
    }
    document.dispatchEvent(new CustomEvent("agri:change"));
  }

  function seedFromGlobal() {
    return window.AGRI_SEED ? normalize(clone(window.AGRI_SEED)) : null;
  }

  function bootstrap() {
    var stored = readStored();
    var seed = seedFromGlobal();
    try {
      localStorage.removeItem("agriacademy.session.v1");
    } catch (err) { /* bỏ qua */ }

    if (stored) {
      db = seed ? mergeSeed(stored, seed) : normalize(stored);
      persist();
      return Promise.resolve(db);
    }

    if (seed) {
      db = seed;
      persist();
      return Promise.resolve(db);
    }

    return fetch(DB_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (json) {
        db = normalize(json);
        persist();
        return db;
      })
      .catch(function (err) {
        console.warn("[AgriAPI] Không tải được db.json:", err && err.message);
        db = normalize({});
        return db;
      });
  }

  function ready() {
    if (!readyPromise) readyPromise = bootstrap();
    return readyPromise;
  }

  function data() {
    if (!db) throw new Error("AgriAPI chưa sẵn sàng – hãy await API.ready()");
    return db;
  }

  /* ---------- CRUD ---------- */

  function list(collection, filter) {
    var rows = data()[collection] || [];
    return (filter ? rows.filter(filter) : rows).map(clone);
  }

  function find(collection, id) {
    var row = (data()[collection] || []).find(function (r) { return String(r.id) === String(id); });
    return row ? clone(row) : null;
  }

  function where(collection, predicate) {
    return (data()[collection] || []).filter(predicate).map(clone);
  }

  function insert(collection, record) {
    if (!COLLECTIONS.includes(collection)) throw new Error("Bộ sưu tập không hợp lệ: " + collection);
    var idPrefix = collection === "cropJournals" ? "j" : collection.slice(0, 1);
    var row = Object.assign({}, record);
    row.id = record.id || uid(idPrefix);
    data()[collection].unshift(row);
    persist();
    return clone(row);
  }

  function update(collection, id, patch) {
    var rows = data()[collection] || [];
    var index = rows.findIndex(function (r) { return String(r.id) === String(id); });
    if (index < 0) throw new Error("Không tìm thấy bản ghi " + id + " trong " + collection);
    rows[index] = Object.assign({}, rows[index], clone(patch), { id: rows[index].id });
    persist();
    return clone(rows[index]);
  }

  function remove(collection, id) {
    var rows = data()[collection] || [];
    var index = rows.findIndex(function (r) { return String(r.id) === String(id); });
    if (index < 0) return false;
    rows.splice(index, 1);
    persist();
    return true;
  }

  function logActivity(text) {
    insert("activities", { text: text, at: nowISO() });
  }

  function reset() {
    localStorage.removeItem(DB_KEY);
    db = null;
    readyPromise = null;
    return ready();
  }

  /* ---------- Vai trò trải nghiệm ---------- */

  function role() {
    try {
      var stored = localStorage.getItem(ROLE_KEY);
      return ROLES.indexOf(stored) >= 0 ? stored : DEFAULT_ROLE;
    } catch (err) {
      return DEFAULT_ROLE;
    }
  }

  function setRole(next) {
    var value = ROLES.indexOf(next) >= 0 ? next : DEFAULT_ROLE;
    try {
      localStorage.setItem(ROLE_KEY, value);
    } catch (err) { /* bỏ qua */ }
    return value;
  }

  function currentUser() {
    var wanted = role();
    if (wanted === "guest") return null;
    var preferred = find("users", DEMO_ACCOUNT[wanted]);
    if (preferred && preferred.role === wanted && preferred.active !== false) return preferred;
    var sameRole = where("users", function (u) { return u.role === wanted && u.active !== false; });
    if (sameRole.length) return sameRole[0];
    return where("users", function (u) { return u.active !== false; })[0] || null;
  }

  function notificationsFor(userId, includeGlobal) {
    return where("notifications", function (n) {
      return n.userId === userId || (includeGlobal !== false && n.userId === null);
    }).sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  }

  window.AgriAPI = {
    ready: ready,
    data: data,
    list: list,
    find: find,
    where: where,
    insert: insert,
    update: update,
    remove: remove,
    reset: reset,
    role: role,
    setRole: setRole,
    currentUser: currentUser,
    notificationsFor: notificationsFor,
    logActivity: logActivity,
    uid: uid,
    nowISO: nowISO,
    clone: clone,
    COLLECTIONS: COLLECTIONS
  };
})();
