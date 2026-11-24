// GCUH Student Portal — demo front-end logic (no backend, no real student data fetched)
(function () {
  "use strict";

  var DEMO_EMAIL = "bscs.2025.073@student.gcuh.edu.pk";
  var DEFAULT_PASSWORD = "gcuh1234";
  var SESSION_KEY = "gcuh_session";
  var PASSWORD_KEY = "gcuh_password";

  // ---------- Demo data ----------
  var COURSES = [
    { code: "CS-241",  title: "Computer Networks",                     ch: 3, type: "Theory", teacher: "Sir Mazhar Basheer Arain" },
    { code: "CS-241L", title: "Computer Networks Lab",                 ch: 1, type: "Lab",    teacher: "Sir Mazhar Basheer Arain" },
    { code: "CS-232",  title: "Computer Organization & Assembly Language", ch: 3, type: "Theory", teacher: "Sir Akhtar" },
    { code: "CS-232L", title: "COAL Lab",                              ch: 1, type: "Lab",    teacher: "Sir Akhtar" },
    { code: "CS-242",  title: "Operating Systems",                     ch: 3, type: "Theory", teacher: "—" },
    { code: "CS-243",  title: "Database Management Systems",           ch: 3, type: "Theory", teacher: "—" },
    { code: "CS-243L", title: "Database Management Systems Lab",       ch: 1, type: "Lab",    teacher: "—" },
    { code: "CS-244",  title: "Theory of Automata",                    ch: 3, type: "Theory", teacher: "—" },
    { code: "CS-245",  title: "Professional Practices",                ch: 1, type: "Theory", teacher: "—" }
  ];

  // Attendance tuned so overall = 181/206 = 88%; COAL is below 75% (highlighted)
  var ATTENDANCE = [
    { course: "Computer Networks",        held: 30, att: 28 },
    { course: "Computer Networks Lab",    held: 14, att: 13 },
    { course: "COAL",                     held: 30, att: 22 },
    { course: "COAL Lab",                 held: 14, att: 12 },
    { course: "Operating Systems",        held: 30, att: 27 },
    { course: "Database Management Systems", held: 30, att: 28 },
    { course: "DBMS Lab",                 held: 14, att: 13 },
    { course: "Theory of Automata",       held: 30, att: 26 },
    { course: "Professional Practices",   held: 14, att: 12 }
  ];

  var MARKS_THEORY = [
    { course: "Computer Networks",        quiz: 8, assign: 9, mid: 24, fin: 38 },
    { course: "COAL",                     quiz: 7, assign: 8, mid: 21, fin: 34 },
    { course: "Operating Systems",        quiz: 8, assign: 9, mid: 25, fin: 40 },
    { course: "Database Management Systems", quiz: 9, assign: 9, mid: 26, fin: 42 },
    { course: "Theory of Automata",       quiz: 7, assign: 8, mid: 22, fin: 36 }
  ];

  var MARKS_LAB = [
    { course: "Computer Networks Lab", lab: 35, viva: 17, fin: 34 },
    { course: "COAL Lab",              lab: 33, viva: 15, fin: 32 },
    { course: "DBMS Lab",              lab: 36, viva: 18, fin: 35 }
  ];

  // REAL figures from Saad's verified marks certificates — semester summary only
  var TRANSCRIPT = [
    { sem: "Semester 1", gpa: "2.52", obtained: 646,  total: 900,  pct: "71.78%", ch: 18, qp: "45.36" },
    { sem: "Semester 2", gpa: "3.11", obtained: 613,  total: 800,  pct: "76.63%", ch: 17, qp: "52.84" },
    { sem: "Semester 3", gpa: "3.53", obtained: 813,  total: 1000, pct: "81.30%", ch: 19, qp: "67.03" }
  ];

  var SLOTS = ["2:00–3:00", "3:00–4:00", "4:00–5:00", "5:00–6:00", "6:00–7:00"];
  var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  // Labs occupy two consecutive hour slots; stored with their start slot
  var TIMETABLE = {
    Monday:    { "2:00–3:00": "Computer Networks", "3:00–4:00": "Operating Systems", "4:00–5:00": "COAL", "5:00–6:00": "DBMS", "6:00–7:00": "Theory of Automata" },
    Tuesday:   { "2:00–3:00": "DBMS", "3:00–4:00": "Computer Networks", "4:00–5:00": "Operating Systems", "5:00–6:00": "COAL", "6:00–7:00": "Professional Practices" },
    Wednesday: { "2:00–3:00": "Computer Networks Lab (2 hrs)", "4:00–5:00": "Theory of Automata", "5:00–6:00": "Operating Systems", "6:00–7:00": "DBMS" },
    Thursday:  { "2:00–3:00": "COAL Lab (2 hrs)", "4:00–5:00": "Computer Networks", "5:00–6:00": "COAL", "6:00–7:00": "Theory of Automata" },
    Friday:    { "2:00–3:00": "DBMS Lab (2 hrs)", "4:00–5:00": "Operating Systems", "5:00–6:00": "Computer Networks", "6:00–7:00": "—" }
  };

  var CHALLANS = [
    { no: "GCUH-2026-0041", sem: "4th Semester", due: "15 Nov 2026", amount: "Rs 45,000", status: "Unpaid" },
    { no: "GCUH-2026-0032", sem: "3rd Semester", due: "10 Aug 2026", amount: "Rs 42,500", status: "Paid" },
    { no: "GCUH-2026-0021", sem: "2nd Semester", due: "12 Mar 2026", amount: "Rs 42,500", status: "Paid" },
    { no: "GCUH-2026-0010", sem: "1st Semester", due: "15 Oct 2025", amount: "Rs 40,000", status: "Paid" }
  ];

  var PAGES = ["dashboard", "courses", "attendance", "marks", "transcript", "timetable", "challan", "profile", "change-password"];

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function storedPassword() { return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD; }
  function isLoggedIn() { return localStorage.getItem(SESSION_KEY) === "1"; }

  // ---------- Renderers ----------
  function renderCourses() {
    $("coursesBody").innerHTML = COURSES.map(function (c) {
      return "<tr><td>" + esc(c.code) + "</td><td>" + esc(c.title) + "</td><td>" + c.ch + "</td><td>" + esc(c.type) + "</td><td>" + esc(c.teacher) + "</td></tr>";
    }).join("");
  }

  function renderAttendance() {
    $("attendanceBody").innerHTML = ATTENDANCE.map(function (a) {
      var pct = Math.round(a.att / a.held * 100);
      var low = pct < 75;
      var status = low
        ? '<span class="badge badge-low">Below 75%</span>'
        : '<span class="badge badge-good">Good</span>';
      return "<tr" + (low ? ' class="low"' : "") + "><td>" + esc(a.course) + "</td><td>" + a.held + "</td><td>" + a.att + "</td><td>" + pct + "%</td><td>" + status + "</td></tr>";
    }).join("");
  }

  function renderMarks() {
    $("marksTheoryBody").innerHTML = MARKS_THEORY.map(function (m) {
      var total = m.quiz + m.assign + m.mid + m.fin;
      return "<tr><td>" + esc(m.course) + "</td><td>" + m.quiz + "</td><td>" + m.assign + "</td><td>" + m.mid + "</td><td>" + m.fin + "</td><td><strong>" + total + "</strong></td></tr>";
    }).join("");
    $("marksLabBody").innerHTML = MARKS_LAB.map(function (m) {
      var total = m.lab + m.viva + m.fin;
      return "<tr><td>" + esc(m.course) + "</td><td>" + m.lab + "</td><td>" + m.viva + "</td><td>" + m.fin + "</td><td><strong>" + total + "</strong></td></tr>";
    }).join("");
  }

  function renderTranscript() {
    $("transcriptBody").innerHTML = TRANSCRIPT.map(function (t) {
      return "<tr><td>" + esc(t.sem) + "</td><td><strong>" + t.gpa + "</strong></td><td>" + t.obtained + "</td><td>" + t.total + "</td><td>" + t.pct + "</td><td>" + t.ch + "</td><td>" + t.qp + "</td></tr>";
    }).join("");
  }

  function renderTimetable() {
    var html = "";
    SLOTS.forEach(function (slot, i) {
      html += "<tr><td>" + slot + " PM</td>";
      DAYS.forEach(function (day) {
        // A 2-hour lab shown at its start slot spans this row and the next
        if (i > 0) {
          var prev = TIMETABLE[day][SLOTS[i - 1]];
          if (prev && prev.indexOf("(2 hrs)") !== -1) { return; }
        }
        var cell = TIMETABLE[day][slot];
        if (cell && cell.indexOf("(2 hrs)") !== -1) {
          html += '<td rowspan="2">' + esc(cell) + "</td>";
        } else {
          html += "<td>" + esc(cell || "—") + "</td>";
        }
      });
      html += "</tr>";
    });
    $("timetableBody").innerHTML = html;
  }

  function renderChallans() {
    $("challanBody").innerHTML = CHALLANS.map(function (c) {
      var badge = c.status === "Paid"
        ? '<span class="badge badge-paid">Paid</span>'
        : '<span class="badge badge-unpaid">Unpaid</span>';
      return "<tr><td>" + esc(c.no) + "</td><td>" + esc(c.sem) + "</td><td>" + esc(c.due) + "</td><td>" + esc(c.amount) + "</td><td>" + badge + "</td></tr>";
    }).join("");
  }

  function renderToday() {
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var today = dayNames[new Date().getDay()];
    var list = $("todayClasses");
    if (!TIMETABLE[today]) {
      list.innerHTML = "<li>No classes today (" + today + "). Enjoy your weekend.</li>";
      return;
    }
    var items = [];
    SLOTS.forEach(function (slot) {
      var cell = TIMETABLE[today][slot];
      if (cell && cell !== "—") { items.push("<li><strong>" + slot + " PM</strong> — " + esc(cell) + "</li>"); }
    });
    list.innerHTML = "<li><strong>" + today + "</strong></li>" + items.join("");
  }

  function renderAll() {
    renderCourses();
    renderAttendance();
    renderMarks();
    renderTranscript();
    renderTimetable();
    renderChallans();
    renderToday();
  }

  // ---------- Views & routing ----------
  function showLogin() {
    $("loginView").hidden = false;
    $("portalView").hidden = true;
  }
  function showPortal() {
    $("loginView").hidden = true;
    $("portalView").hidden = false;
  }

  function route() {
    if (!isLoggedIn()) { showLogin(); return; }
    showPortal();
    var page = (location.hash || "#/dashboard").replace("#/", "");
    if (PAGES.indexOf(page) === -1) { page = "dashboard"; }
    PAGES.forEach(function (p) { $("page-" + p).hidden = (p !== page); });
    document.querySelectorAll(".sidebar a[data-page]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-page") === page);
    });
    $("sidebar").classList.remove("open");
    window.scrollTo(0, 0);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    location.hash = "#/dashboard";
    showLogin();
  }

  // ---------- Events ----------
  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("loginEmail").value.trim().toLowerCase();
    var pw = $("loginPassword").value;
    var err = $("loginError");
    if (email === DEMO_EMAIL && pw === storedPassword()) {
      err.hidden = true;
      localStorage.setItem(SESSION_KEY, "1");
      route();
    } else {
      err.textContent = "Invalid email or password. Please use the demo credentials shown below.";
      err.hidden = false;
    }
  });

  $("forgotLink").addEventListener("click", function (e) {
    e.preventDefault();
    $("forgotHint").hidden = false;
  });

  $("changePwForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $("changePwMsg");
    var cur = $("currentPw").value;
    var nw = $("newPw").value;
    var cf = $("confirmPw").value;
    msg.hidden = false;
    msg.className = "hint error";
    if (cur !== storedPassword()) { msg.textContent = "Current password is incorrect."; return; }
    if (nw.length < 6) { msg.textContent = "New password must be at least 6 characters."; return; }
    if (nw !== cf) { msg.textContent = "New password and confirmation do not match."; return; }
    localStorage.setItem(PASSWORD_KEY, nw);
    msg.className = "hint success";
    msg.textContent = "Password changed successfully. Use your new password at the next login.";
    $("currentPw").value = ""; $("newPw").value = ""; $("confirmPw").value = "";
  });

  $("logoutBtn").addEventListener("click", logout);
  $("sidebarLogout").addEventListener("click", function (e) { e.preventDefault(); logout(); });
  $("hamburger").addEventListener("click", function () { $("sidebar").classList.toggle("open"); });

  window.addEventListener("hashchange", route);

  // ---------- Init ----------
  renderAll();
  route();
})();
