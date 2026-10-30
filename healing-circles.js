/* =========================================================
   The Meditation Community — Healing Circles page
   ========================================================= */

// HEALING CIRCLE SETTINGS — if the Zoom meeting changes, update these AND healing-circle.ics
const HEALING_CIRCLE = {
  joinUrl: "https://zoom.us/j/93398960175?pwd=bdaETnl8lTpfs9qkQMuaYRbX9heXYO.1",
  meetingId: "933 9896 0175",
  passcode: "951766",
  timeZone: "Australia/Melbourne",
  startHour: 20, startMinute: 0,   // 8.00 in the evening, Melbourne time
  durationMinutes: 40,
  lastDate: "2029-10-01",          // final occurrence of the recurring Zoom meeting
  membersUrl: "https://www.skool.com/themeditationcommunity/about"
};

(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav scrolled state (shared with homepage) ---------- */
  const nav = $("#nav");
  if (nav) {
    const onScrollNav = () => nav.classList.toggle("scrolled", window.scrollY > 24);
    onScrollNav();
    window.addEventListener("scroll", onScrollNav, { passive: true });
  }

  /* ---------- Mobile nav menu (shared with homepage) ---------- */
  const navBurger = $("#navBurger");
  const navMobile = $("#navMobileMenu");
  if (nav && navBurger && navMobile) {
    const closeMenu = () => {
      nav.classList.remove("menu-open");
      navMobile.hidden = true;
      navBurger.setAttribute("aria-expanded", "false");
    };
    const openMenu = () => {
      nav.classList.add("menu-open");
      navMobile.hidden = false;
      navBurger.setAttribute("aria-expanded", "true");
    };
    navBurger.addEventListener("click", () => {
      if (nav.classList.contains("menu-open")) closeMenu(); else openMenu();
    });
    $$("a", navMobile).forEach((a) => a.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => { if (window.innerWidth > 1040) closeMenu(); });
  }

  /* ---------- Scroll reveal (shared with homepage) ---------- */
  const revs = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revs.forEach((r) => io.observe(r));
    const sweep = () => {
      const vh = window.innerHeight || 800;
      revs.forEach((r) => { if (r.getBoundingClientRect().top < vh * 0.95) r.classList.add("in"); });
    };
    window.addEventListener("load", () => setTimeout(sweep, 200));
    setTimeout(sweep, 1200);
  } else {
    revs.forEach((r) => r.classList.add("in"));
  }

  /* ---------- Scroll progress bar ---------- */
  const sp = $("#scrollProg");
  if (sp) {
    const upd = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      sp.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    $$("[data-magnetic]").forEach((b) => {
      const s = 0.22;
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        b.style.transform = `translate(${mx * s}px, ${(my * s) - 3}px)`;
      });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    });
  }

  /* =====================================================
     Next-circle date logic
     ===================================================== */
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // Melbourne wall-clock "now" using Intl.DateTimeFormat (no library)
  function melbourneNowParts() {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: HEALING_CIRCLE.timeZone, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
    });
    const p = dtf.formatToParts(new Date()).reduce((a, x) => { a[x.type] = x.value; return a; }, {});
    return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour, minute: +p.minute };
  }

  // Civil calendar day-of-week is timezone independent — find the first Monday of a given month.
  function firstMondayOfMonth(year, month) {
    for (let d = 1; d <= 7; d++) {
      if (new Date(Date.UTC(year, month - 1, d)).getUTCDay() === 1) return d;
    }
    return 1;
  }

  function dateNum(y, m, d) { return y * 10000 + m * 100 + d; }

  // Next occurrence (civil Melbourne date), or null once past lastDate.
  function findNextCircle() {
    const now = melbourneNowParts();
    const [ly, lm, ld] = HEALING_CIRCLE.lastDate.split("-").map(Number);
    const lastNum = dateNum(ly, lm, ld);
    const nowNum = dateNum(now.year, now.month, now.day);
    const endMinutes = HEALING_CIRCLE.startHour * 60 + HEALING_CIRCLE.startMinute + HEALING_CIRCLE.durationMinutes;
    const nowMinutes = now.hour * 60 + now.minute;

    let y = now.year, m = now.month;
    for (let i = 0; i < 48; i++) {
      const day = firstMondayOfMonth(y, m);
      const candidateNum = dateNum(y, m, day);
      if (candidateNum > lastNum) return null;
      const stillUpcoming = candidateNum > nowNum || (candidateNum === nowNum && nowMinutes <= endMinutes);
      if (stillUpcoming) return { year: y, month: m, day: day };
      m++; if (m > 12) { m = 1; y++; }
    }
    return null;
  }

  // Compute the offset (minutes) such that Melbourne local time = UTC + offset, at a given instant.
  function tzOffsetMinutes(date, timeZone) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    const p = dtf.formatToParts(date).reduce((a, x) => { a[x.type] = x.value; return a; }, {});
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    return (asUTC - date.getTime()) / 60000;
  }

  // Convert a Melbourne wall-clock date/time into an absolute UTC Date, without a library.
  function melbourneWallTimeToUTC(year, month, day, hour, minute) {
    const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
    let offset = tzOffsetMinutes(new Date(guess), HEALING_CIRCLE.timeZone);
    let utcMillis = guess - offset * 60000;
    const offset2 = tzOffsetMinutes(new Date(utcMillis), HEALING_CIRCLE.timeZone);
    if (offset2 !== offset) utcMillis = guess - offset2 * 60000;
    return new Date(utcMillis);
  }

  function pad2(n) { return String(n).padStart(2, "0"); }

  // "8.00pm" style 12-hour clock text.
  function clockText(hour, minute) {
    const h12 = ((hour + 11) % 12) + 1;
    const mm = minute === 0 ? "00" : pad2(minute);
    const ampm = hour < 12 ? "am" : "pm";
    return `${h12}.${mm}${ampm}`;
  }

  // "8.00pm to 8.40pm" — the Melbourne/Sydney start and end time of every circle.
  function melbourneTimeRangeText() {
    const endMinutesTotal = HEALING_CIRCLE.startHour * 60 + HEALING_CIRCLE.startMinute + HEALING_CIRCLE.durationMinutes;
    const endHour = Math.floor(endMinutesTotal / 60) % 24;
    const endMinute = endMinutesTotal % 60;
    return `${clockText(HEALING_CIRCLE.startHour, HEALING_CIRCLE.startMinute)} to ${clockText(endHour, endMinute)}`;
  }

  function buildDateText(next) {
    if (!next) return "";
    return `Monday ${next.day} ${MONTHS[next.month - 1]}`;
  }

  function buildDateTimeText(next) {
    const d = buildDateText(next);
    return d ? `${d}, ${melbourneTimeRangeText()}` : "";
  }

  function buildNextCircleText(next) {
    const dt = buildDateTimeText(next);
    return dt ? `Next circle: ${dt}` : "";
  }

  function buildLocalTimeText(next) {
    if (!next) return "";
    const startUTC = melbourneWallTimeToUTC(next.year, next.month, next.day, HEALING_CIRCLE.startHour, HEALING_CIRCLE.startMinute);
    const melbourneOffset = tzOffsetMinutes(startUTC, HEALING_CIRCLE.timeZone);
    const visitorOffset = -startUTC.getTimezoneOffset();
    if (visitorOffset === melbourneOffset) return "";
    const fmt = new Intl.DateTimeFormat(undefined, {
      weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit"
    });
    return `That is ${fmt.format(startUTC)} where you are.`;
  }

  function renderNextCircle(el, next) {
    if (!el) return;
    if (!next) { el.textContent = ""; return; }
    const local = buildLocalTimeText(next);
    el.innerHTML = buildNextCircleText(next) + (local ? `<span class="hc-local">${local}</span>` : "");
  }

  // Hero details card: date/time and visitor-local-time go in separate elements.
  function renderNextCircleCard(dateEl, localEl, next) {
    if (!dateEl) return;
    dateEl.textContent = buildDateTimeText(next);
    if (localEl) {
      const local = buildLocalTimeText(next);
      localEl.textContent = local;
      localEl.hidden = !local;
    }
  }

  const nextCircle = findNextCircle();
  renderNextCircleCard($("#hcNextCircleHero"), $("#hcNextCircleHeroLocal"), nextCircle);
  renderNextCircle($("#hcNextCirclePanel"), nextCircle);

  $$("[data-scroll-register]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = $("#register");
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
    });
  });

  /* =====================================================
     Google Calendar link
     ===================================================== */
  function buildGoogleCalendarLink(next) {
    if (!next) return "#";
    const start = `${next.year}${pad2(next.month)}${pad2(next.day)}T${pad2(HEALING_CIRCLE.startHour)}${pad2(HEALING_CIRCLE.startMinute)}00`;
    const endMinutesTotal = HEALING_CIRCLE.startHour * 60 + HEALING_CIRCLE.startMinute + HEALING_CIRCLE.durationMinutes;
    const endHour = Math.floor(endMinutesTotal / 60), endMinute = endMinutesTotal % 60;
    const end = `${next.year}${pad2(next.month)}${pad2(next.day)}T${pad2(endHour)}${pad2(endMinute)}00`;

    const details = `Join on Zoom: ${HEALING_CIRCLE.joinUrl}\nMeeting ID: ${HEALING_CIRCLE.meetingId}\nPasscode: ${HEALING_CIRCLE.passcode}\n\nMore information: https://themeditationcommunity.org/healing-circles`;

    const params = [
      ["action", "TEMPLATE"],
      ["text", "Free Healing Circle — The Meditation Community"],
      ["dates", `${start}/${end}`],
      ["ctz", HEALING_CIRCLE.timeZone],
      ["recur", "RRULE:FREQ=MONTHLY;BYDAY=1MO;UNTIL=20291002T000000Z"],
      ["location", HEALING_CIRCLE.joinUrl],
      ["details", details]
    ];
    const query = params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `https://calendar.google.com/calendar/render?${query}`;
  }

  /* =====================================================
     Registration form + joining panel
     ===================================================== */
  const STORAGE_KEY = "tmc-healing-circle-registered";
  const formWrap = $("#hcFormWrap");
  const panelWrap = $("#hcPanelWrap");
  const form = $("#healingCircleForm");
  const panelHeading = $("#hcPanelHeading");

  function readStoredName() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (err) { return null; }
  }
  function storeName(name) {
    try { window.localStorage.setItem(STORAGE_KEY, name); } catch (err) { /* ignore */ }
  }
  function clearStoredName() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
  }

  function revealPanel(firstName, focusHeading) {
    const name = firstName || "friend";
    $("#hcFirstName").textContent = name;
    $("#hcZoomBtn").href = HEALING_CIRCLE.joinUrl;
    $("#hcMeetingId").textContent = HEALING_CIRCLE.meetingId;
    $("#hcPasscode").textContent = HEALING_CIRCLE.passcode;
    $("#hcGoogleCalBtn").href = buildGoogleCalendarLink(nextCircle);
    if (formWrap) formWrap.hidden = true;
    if (panelWrap) panelWrap.hidden = false;
    if (focusHeading && panelHeading) panelHeading.focus();
  }

  function showForm() {
    if (formWrap) formWrap.hidden = false;
    if (panelWrap) panelWrap.hidden = true;
    clearStoredName();
  }

  const storedName = readStoredName();
  if (storedName) {
    revealPanel(storedName, false);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const firstName = $("#hcFirstNameInput").value.trim();
      const data = new URLSearchParams(new FormData(form)).toString();
      const errorEl = $(".form-error", form);
      if (errorEl) errorEl.hidden = true;

      storeName(firstName);

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data
      }).then((res) => {
        if (!res.ok) throw new Error("Form submission failed: " + res.status);
        revealPanel(firstName, true);
      }).catch((err) => {
        console.error("Healing Circle registration could not be sent:", err);
        // Nobody in need should be blocked — reveal the joining details regardless.
        revealPanel(firstName, true);
      });
    });
  }

  const notYouBtn = $("#hcNotYouBtn");
  if (notYouBtn) notYouBtn.addEventListener("click", showForm);
})();
