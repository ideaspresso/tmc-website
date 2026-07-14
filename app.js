/* =========================================================
   The Meditation Community — interactions
   ========================================================= */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Nav scrolled state ---------- */
  const nav = $("#nav");
  const onScrollNav = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------- Scroll reveal ---------- */
  const revs = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revs.forEach((r) => io.observe(r));
    // Safety net: reveal anything already in the viewport shortly after load,
    // in case IO is flaky in the host environment.
    const sweep = () => {
      const vh = window.innerHeight || 800;
      revs.forEach((r) => {
        const t = r.getBoundingClientRect().top;
        if (t < vh * 0.95) r.classList.add("in");
      });
    };
    window.addEventListener("load", () => setTimeout(sweep, 200));
    setTimeout(sweep, 1200);
  } else {
    revs.forEach((r) => r.classList.add("in"));
  }

  /* ---------- Parallax clouds ---------- */
  const clouds = $$(".cloud");
  if (!reduce && clouds.length) {
    let ticking = false;
    const move = () => {
      const y = window.scrollY;
      clouds.forEach((c) => {
        const s = parseFloat(c.dataset.speed || "0.2");
        c.style.transform = `translate3d(${Math.sin(y * 0.002 + s * 10) * 8}px, ${y * s}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(move); ticking = true; } }, { passive: true });
    move();
  }

  /* ---------- Count-up stats ---------- */
  const counted = new WeakSet();
  const fmt = (n, dec) => {
    if (dec) return n.toFixed(dec);
    if (n >= 1000) return Math.round(n).toLocaleString("en-US");
    return Math.round(n).toString();
  };
  const runCount = (el) => {
    if (counted.has(el)) return; counted.add(el);
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = fmt(target, dec) + suffix; return; }
    const dur = 1500; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e, dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) runCount(e.target); }), { threshold: 0.6 });
    $$("[data-count]").forEach((el) => cio.observe(el));
  } else {
    $$("[data-count]").forEach(runCount);
  }

  /* ---------- Hero ambient breath word ---------- */
  const heroWord = $("#heroBreathWord");
  if (heroWord && !reduce) {
    const words = ["Breathe in", "Hold", "Breathe out", "Rest"];
    let i = 0;
    setInterval(() => { i = (i + 1) % words.length; heroWord.style.opacity = 0;
      setTimeout(() => { heroWord.textContent = words[i]; heroWord.style.opacity = 1; }, 350);
    }, 2600);
    heroWord.style.transition = "opacity .35s ease";
  }

  /* ---------- FAQ accordion ---------- */
  $$(".faq-item").forEach((item) => {
    const q = $(".faq-q", item);
    const a = $(".faq-a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".faq-item").forEach((o) => { o.classList.remove("open"); $(".faq-a", o).style.maxHeight = null; });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---------- Pricing toggle ---------- */
  const toggle = $("#pricingToggle");
  if (toggle) {
    const knob = $("#priceKnob");
    const btns = $$("button", toggle);
    const plans = $("#plans");
    const plusBilling = $("#plusBilling");
    const place = (btn) => { knob.style.left = btn.offsetLeft + "px"; knob.style.width = btn.offsetWidth + "px"; };
    const setMode = (btn) => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      place(btn);
      const annual = btn.dataset.mode === "annual";
      plans.classList.toggle("show-annual", annual);
      if (plusBilling) plusBilling.textContent = annual ? "Billed annually · 14-day free trial" : "Billed monthly · 14-day free trial";
    };
    btns.forEach((b) => b.addEventListener("click", () => setMode(b)));
    const placeActive = () => place($("button.active", toggle) || btns[0]);
    requestAnimationFrame(placeActive);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeActive);
    if ("IntersectionObserver" in window) {
      const tio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) placeActive(); }), { threshold: 0.2 });
      tio.observe(toggle);
    }
    window.addEventListener("load", placeActive);
    window.addEventListener("resize", placeActive);
  }

  /* ---------- Sticky mobile CTA ---------- */
  const sticky = $("#stickyCta");
  if (sticky) {
    const heroH = () => (document.querySelector(".hero") || {}).offsetHeight || 600;
    const pricing = $("#pricing");
    const onScrollSticky = () => {
      const y = window.scrollY;
      const nearPricing = pricing && Math.abs(pricing.getBoundingClientRect().top) < window.innerHeight * 0.6 && pricing.getBoundingClientRect().bottom > 0;
      sticky.classList.toggle("show", y > heroH() * 0.9 && !nearPricing);
    };
    window.addEventListener("scroll", onScrollSticky, { passive: true });
    onScrollSticky();
  }

  /* ====================================================
     SIGNATURE: Breathe-along guided session
     ==================================================== */
  const orb = $("#breathOrb");
  const glow = $("#breathGlow");
  const phaseEl = $("#breathPhase");
  const countEl = $("#breathCount");
  const timerEl = $("#breathTimer");
  const startBtn = $("#breathStart");
  const prog = $("#breathProg");
  const patternWrap = $("#breathPattern");

  if (orb && startBtn) {
    const R = 160;
    const CIRC = 2 * Math.PI * R;
    prog.style.strokeDasharray = CIRC;
    prog.style.strokeDashoffset = CIRC;

    const PATTERNS = {
      box:   { label: "Box breathing · 4 seconds each", steps: [["Breathe in", 4, "in"], ["Hold", 4, "hold"], ["Breathe out", 4, "out"], ["Hold", 4, "hold"]] },
      relax: { label: "Relaxing breath · 4-7-8",        steps: [["Breathe in", 4, "in"], ["Hold", 7, "hold"], ["Breathe out", 8, "out"]] },
      calm:  { label: "Calming breath · 5-5",           steps: [["Breathe in", 5, "in"], ["Breathe out", 5, "out"]] }
    };
    let patKey = "box";
    let running = false;
    let raf = null, stepTimer = null, sessionTimer = null;
    const SESSION = 60; // seconds

    // pattern picker
    if (patternWrap) {
      $$("button", patternWrap).forEach((b) => {
        b.addEventListener("click", () => {
          $$("button", patternWrap).forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
          patKey = b.dataset.pat;
          if (!running) countEl.textContent = PATTERNS[patKey].label;
        });
      });
    }

    const setOrb = (cls, dur) => {
      orb.style.transitionDuration = dur + "ms";
      glow.style.transitionDuration = dur + "ms";
      orb.classList.remove("in", "out");
      glow.classList.remove("in", "out");
      if (cls === "in") { orb.classList.add("in"); glow.classList.add("in"); }
      else if (cls === "out") { orb.classList.add("out"); glow.classList.add("out"); }
    };

    const reset = () => {
      running = false;
      cancelAnimationFrame(raf); clearTimeout(stepTimer); clearInterval(sessionTimer);
      orb.style.transitionDuration = "1200ms";
      setOrb("out", 1200);
      prog.style.strokeDashoffset = CIRC;
      phaseEl.textContent = "Ready when you are";
      countEl.textContent = PATTERNS[patKey].label;
      timerEl.textContent = "1:00";
      startBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg> Begin';
    };

    const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

    const start = () => {
      running = true;
      const steps = PATTERNS[patKey].steps;
      let si = 0;
      let remaining = SESSION;
      startBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg> Stop';
      countEl.textContent = PATTERNS[patKey].label;

      // session countdown
      sessionTimer = setInterval(() => {
        remaining -= 1;
        timerEl.textContent = mmss(Math.max(0, remaining));
        if (remaining <= 0) {
          clearInterval(sessionTimer); clearTimeout(stepTimer); cancelAnimationFrame(raf);
          running = false;
          setOrb("out", 2000);
          phaseEl.textContent = "Beautifully done.";
          countEl.textContent = "That is one minute calmer. Imagine it daily.";
          timerEl.textContent = "✓";
          startBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg> Again';
          setTimeout(() => { if (!running) { phaseEl.textContent = "Ready when you are"; } }, 5000);
        }
      }, 1000);

      const runStep = () => {
        if (!running) return;
        const [label, dur, kind] = steps[si];
        phaseEl.textContent = label;
        setOrb(kind === "in" ? "in" : kind === "out" ? "out" : null, dur * 1000);

        // ring progress for this step
        const t0 = performance.now();
        const animate = (t) => {
          if (!running) return;
          const p = Math.min(1, (t - t0) / (dur * 1000));
          prog.style.strokeDashoffset = CIRC * (1 - p);
          if (p < 1) raf = requestAnimationFrame(animate);
        };
        prog.style.strokeDashoffset = CIRC;
        raf = requestAnimationFrame(animate);

        stepTimer = setTimeout(() => { si = (si + 1) % steps.length; runStep(); }, dur * 1000);
      };
      runStep();
    };

    startBtn.addEventListener("click", () => { running ? reset() : start(); });

    // "Try a 1-min breath" in hero scrolls here and auto-starts
    const tryBtn = $("#tryBreath");
    if (tryBtn) {
      tryBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById("breathe");
        const top = target.getBoundingClientRect().top + window.scrollY - 20;
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
        setTimeout(() => { if (!running) start(); }, reduce ? 0 : 900);
      });
    }
  }
  /* ====================================================
     Teacher bio modal
     ==================================================== */
  const grid = $("#teachersGrid");
  const modal = $("#teacherModal");
  if (grid && modal) {
    const cards = $$(".teacher", grid);
    let idx = 0;
    const tmPhoto = $("#tmPhoto"), tmRole = $("#tmRole"), tmName = $("#tmName"), tmCred = $("#tmCred"), tmText = $("#tmText");
    const fill = (i) => {
      idx = (i + cards.length) % cards.length;
      const c = cards[idx];
      tmPhoto.src = c.dataset.img; tmPhoto.alt = c.dataset.name || "";
      tmRole.textContent = c.dataset.role || "";
      tmName.textContent = c.dataset.name || "";
      const cred = c.dataset.cred || "";
      tmCred.textContent = cred; tmCred.style.display = cred ? "block" : "none";
      const bio = $(".t-bio-data", c);
      tmText.innerHTML = bio ? bio.innerHTML : "";
    };
    const open = (i) => { fill(i); modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; };
    const close = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
    cards.forEach((c, i) => c.addEventListener("click", () => open(i)));
    $("#tmClose").addEventListener("click", close);
    $("#tmPrev").addEventListener("click", () => fill(idx - 1));
    $("#tmNext").addEventListener("click", () => fill(idx + 1));
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") fill(idx - 1);
      else if (e.key === "ArrowRight") fill(idx + 1);
    });
  }

  /* ====================================================
     Scroll progress bar
     ==================================================== */
  const sp = $("#scrollProg");
  if (sp) {
    const upd = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      sp.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  /* ====================================================
     Magnetic buttons (light cursor pull)
     ==================================================== */
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

  /* ====================================================
     Hero mouse parallax (orb stage)
     ==================================================== */
  const heroEl = $(".hero");
  const orbStage = $(".orb-stage");
  if (heroEl && orbStage && !reduce && window.matchMedia("(pointer:fine)").matches) {
    let frame = false;
    heroEl.addEventListener("mousemove", (e) => {
      if (frame) return; frame = true;
      requestAnimationFrame(() => {
        const r = heroEl.getBoundingClientRect();
        const px = e.clientX / r.width - 0.5;
        const py = e.clientY / r.height - 0.5;
        orbStage.style.transform = `translate(${px * 26}px, ${py * 18}px)`;
        frame = false;
      });
    });
    heroEl.addEventListener("mouseleave", () => { orbStage.style.transform = ""; });
  }
})();


/* ===================== Netlify forms (AJAX submit) ===================== */
document.querySelectorAll('form.mc-form').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var success = form.querySelector('.form-success');
    var data = new URLSearchParams(new FormData(form)).toString();
    if (btn) { btn.disabled = true; btn.textContent = 'Sending\u2026'; }
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data
    }).catch(function () {}).finally(function () {
      form.querySelectorAll('.field-row, .field, button[type="submit"]').forEach(function (el) { el.style.display = 'none'; });
      if (success) success.hidden = false;
    });
  });
});
