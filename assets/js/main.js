/* Main JS (sin dependencias)
   - Menú móvil
   - Reveal on scroll
   - Lightbox
   - WhatsApp form
   - Canvas particles
   - PWA service worker
*/

(function () {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

  // Año footer
  const y = $("#y");
  if (y) y.textContent = new Date().getFullYear();

  // Menú móvil
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Cerrar al dar click en un link
    $$("#navLinks a").forEach(a => a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }));
  }

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("is-in");
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach(el => io.observe(el));

  // Lightbox
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbClose = $("#lbClose");

  function openLb(src) {
    if (!lb || !lbImg) return;
    lbImg.src = src;
    if (typeof lb.showModal === "function") lb.showModal();
    else lb.setAttribute("open", "true");
  }
  function closeLb() {
    if (!lb) return;
    lb.close?.();
    lb.removeAttribute("open");
  }

  $$(".gitem").forEach(btn => {
    btn.addEventListener("click", () => {
      const full = btn.getAttribute("data-full");
      const crop = btn.getAttribute("data-crop");
      if (full && crop) {
        // truco simple: añade un parámetro para variar el cache y simular otra toma
        openLb(full + "?v=" + crop);
      } else if (full) {
        openLb(full);
      }
    });
  });

  lbClose?.addEventListener("click", closeLb);
  lb?.addEventListener("click", (e) => {
    if (e.target === lb) closeLb();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb?.open) closeLb();
  });

  // WhatsApp
  const waForm = $("#waForm");
  if (waForm) {
    waForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(waForm);
      const nombre = (fd.get("nombre") || "").toString().trim();
      const mensaje = (fd.get("mensaje") || "").toString().trim();

      const base = "Hola" + (nombre ? ", soy " + nombre : "") + ".";
      const body = (mensaje ? "\n\n" + mensaje : "\n\nMe gustaría información, por favor.");
      const text = encodeURIComponent(base + body);

      // +52 831 898 9580
      const url = "https://wa.me/528318989580?text=" + text;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  // Canvas particles
  const canvas = document.getElementById("fx");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    let w = 0, h = 0;
    let particles = [];
    const N = 70;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function seed() {
      particles = Array.from({ length: N }).map(() => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(1.2, 2.4),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.12, 0.12),
        a: rand(0.10, 0.26)
      }));
    }

    let t0 = performance.now();
    function tick(t) {
      const dt = Math.min(32, t - t0);
      t0 = t;

      ctx.clearRect(0, 0, w, h);

      // suave glow
      const g = ctx.createRadialGradient(w * 0.2, h * 0.1, 0, w * 0.2, h * 0.1, Math.max(w, h) * 0.7);
      g.addColorStop(0, "rgba(98,196,143,0.10)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // partículas
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(98,196,143," + p.a.toFixed(3) + ")";
        ctx.fill();
      }

      // líneas cercanas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const alpha = 0.10 * (1 - d2 / (140 * 140));
            ctx.strokeStyle = "rgba(98,196,143," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(tick);
    }

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const shouldAnimate = !(reduce && reduce.matches);

    resize();
    seed();
    if (shouldAnimate) requestAnimationFrame(tick);

    window.addEventListener("resize", () => { resize(); seed(); });
  }

  // Service worker (PWA)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
