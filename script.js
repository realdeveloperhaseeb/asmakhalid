/* ============================================================
   Asma Khalid — portfolio interactions
   Built by developerstudio.org
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar scroll state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");

    // scroll progress
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    const bar = document.getElementById("scrollProgress");
    if (bar) bar.style.width = (scrolled * 100).toFixed(2) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("open");
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        toggle.classList.remove("open");
        links.classList.remove("open");
      })
    );
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const delay = e.target.dataset.delay || 0;
            e.target.style.transitionDelay = delay + "ms";
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".stat__num[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || "";
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !prefersReduced) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCounter(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count + (c.dataset.suffix || "")));
  }

  /* ---------- Cursor glow ---------- */
  const cursor = document.getElementById("cursorGlow");
  if (cursor && window.matchMedia("(pointer: fine)").matches) {
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });
    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  } else if (cursor) {
    cursor.style.display = "none";
  }

  /* ---------- 3D tilt ---------- */
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt").forEach((el) => {
      const strength = 10;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-6px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav__links a");
  if ("IntersectionObserver" in window) {
    const sio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute("id");
            navAnchors.forEach((a) =>
              a.classList.toggle("active", a.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach((s) => sio.observe(s));
  }

  /* ---------- Copy-to-clipboard (IBAN etc.) ---------- */
  document.querySelectorAll(".pay-copy").forEach((b) => {
    b.addEventListener("click", async () => {
      const text = b.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(text);
        const prev = b.textContent;
        b.textContent = "Copied";
        setTimeout(() => (b.textContent = prev), 1500);
      } catch (e) {
        /* clipboard unavailable — ignore */
      }
    });
  });

  /* ---------- Booking form (FormSubmit) ---------- */
  const joinForm = document.getElementById("joinForm");
  if (joinForm) {
    const status = document.getElementById("joinStatus");
    const btn = joinForm.querySelector(".join-form__btn");
    const label = joinForm.querySelector(".join-form__btn-label");
    const ENDPOINT = "https://formsubmit.co/ajax/asmakay27@gmail.com";

    joinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!joinForm.checkValidity()) {
        joinForm.reportValidity();
        return;
      }
      status.textContent = "";
      status.className = "join-form__status";
      btn.disabled = true;
      const prevLabel = label ? label.textContent : "";
      if (label) label.textContent = "Sending…";

      try {
        const data = Object.fromEntries(new FormData(joinForm).entries());
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && String(json.success) === "true") {
          status.textContent = "✓ Received! Please wait — our team will review and get back to you.";
          status.classList.add("ok");
          joinForm.reset();
        } else {
          const msg = (json && json.message) || "";
          if (/web server|HTML files/i.test(msg)) {
            throw new Error("This form only works on the live website — not a local file preview.");
          }
          throw new Error(msg || "failed");
        }
      } catch (err) {
        const m = err && err.message;
        status.textContent =
          m && m !== "failed" && m !== "Failed to fetch"
            ? m
            : "Something went wrong. Please email asmakay27@gmail.com directly.";
        status.classList.add("err");
      } finally {
        btn.disabled = false;
        if (label) label.textContent = prevLabel || "Submit & Confirm";
      }
    });
  }
})();

/* ============================================================
   Source-view deterrents (casual protection only).
   NOTE: front-end code is always retrievable by determined users;
   this only discourages right-click / view-source / devtools.
   ============================================================ */
(function () {
  "use strict";

  // Disable right-click / long-press context menu
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // Prevent dragging images out of the page
  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") e.preventDefault();
  });

  // Block common view-source / devtools keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    const key = (e.key || "").toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const blocked =
      e.key === "F12" ||
      (ctrl && key === "u") ||                       // view source
      (ctrl && key === "s") ||                       // save page
      (ctrl && e.shiftKey && (key === "i" || key === "j" || key === "c")); // devtools
    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });
})();
