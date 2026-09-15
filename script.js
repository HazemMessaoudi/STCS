/* =========================================================
   STCS — Portfolio interactions
   Lenis smooth scroll + scroll-triggered reveals
   + custom cursor + magnetic buttons + counters + parallax
   ========================================================= */

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('is-done'), 1400);
  });

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Clock ---------- */
  const clockEl = document.getElementById('clock');
  const fmt = n => String(n).padStart(2,'0');
  function tick(){
    const d = new Date();
    if (clockEl) clockEl.textContent = `Tunis · ${fmt(d.getHours())}:${fmt(d.getMinutes())}:${fmt(d.getSeconds())}`;
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Wrap reveal lines with rl-inner ---------- */
  document.querySelectorAll('.reveal-line').forEach((el, i) => {
    // wrap contents into a span so we can transform independently
    const inner = document.createElement('span');
    inner.className = 'rl-inner';
    inner.innerHTML = el.innerHTML;
    el.innerHTML = '';
    el.appendChild(inner);
  });

  /* ---------- Add reveal attrs to common items ---------- */
  const autoRevealSelectors = [
    '.about-copy p', '.about-copy .checklist li', '.about-visual .about-card', '.about-visual .about-tag',
    '.product-card', '.value-card', '.contact-tile', '.stat',
    '.offer-copy .lead', '.offer-ctas', '.offer-visual', '.gallery-strip'
  ];
  autoRevealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
      if (!el.hasAttribute('data-reveal-delay')) el.setAttribute('data-reveal-delay', String(Math.min(i, 5)));
    });
  });

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // Anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const t = document.querySelector(id);
          if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -20, duration: 1.4 }); }
        } else if (id === '#') {
          e.preventDefault();
          lenis.scrollTo(0, { duration: 1.4 });
        }
      });
    });
  }

  /* ---------- Scroll progress + nav hide-on-scroll-down ---------- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  let lastY = window.scrollY;
  function onScroll(){
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, y / (h || 1)));
    if (progress) progress.style.width = (p * 100).toFixed(2) + '%';

    if (y > 40) nav.classList.add('is-scrolled'); else nav.classList.remove('is-scrolled');
    if (y > 200 && y > lastY + 4) nav.classList.add('is-hidden');
    else if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
  }
  if (lenis) lenis.on('scroll', onScroll);
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal observer ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-reveal], .reveal-line').forEach(el => io.observe(el));

  /* ---------- Counter stats ---------- */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const dur = 1500;
        const start = performance.now();
        const from = 0;
        function step(now){
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(from + (target - from) * eased).toLocaleString();
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counterIO.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stat-num').forEach(el => counterIO.observe(el));

  /* ---------- Custom cursor ---------- */
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (cursor && dot && matchMedia('(hover: hover)').matches){
    let cx = -100, cy = -100, tx = -100, ty = -100;
    let dx = -100, dy = -100;
    window.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      dx = e.clientX; dy = e.clientY;
      cursor.classList.add('is-visible');
      dot.classList.add('is-visible');
    });
    function loop(){
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    // hover targets
    document.querySelectorAll('a, button, [data-magnetic], [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
    window.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-visible');
      dot.classList.remove('is-visible');
    });
  }

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    const strength = 18;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx / r.width * strength}px, ${my / r.height * strength}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* ---------- Tilt cards ---------- */
  document.querySelectorAll('[data-tilt]').forEach(el => {
    let raf;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -6;
      const ry = (px - 0.5) *  6;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* ---------- Parallax elements ---------- */
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  function parallax(){
    const y = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const r = el.getBoundingClientRect();
      const off = (r.top + window.scrollY) - y;
      el.style.transform = `translateY(${(-off * speed).toFixed(2)}px)`;
    });
  }
  if (!reduced) {
    if (lenis) lenis.on('scroll', parallax);
    else window.addEventListener('scroll', parallax, { passive: true });
    parallax();
  }

  /* ---------- Horizontal gallery drag on scroll ---------- */
  const gTrack = document.getElementById('galleryTrack');
  if (gTrack){
    function moveGallery(){
      const r = gTrack.parentElement.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = 1 - (r.top / vh); // 0 when entering, 1 when leaving
      const p = Math.max(0, Math.min(1, progress));
      const max = gTrack.scrollWidth - window.innerWidth;
      gTrack.style.transform = `translateX(${-(p * Math.min(max, gTrack.scrollWidth * 0.35))}px)`;
    }
    if (lenis) lenis.on('scroll', moveGallery);
    else window.addEventListener('scroll', moveGallery, { passive: true });
    window.addEventListener('resize', moveGallery);
    moveGallery();
  }

  /* ---------- Hero title enter (staggered) - already CSS animated ---------- */
  // trigger initial state after preloader exit
  window.addEventListener('load', () => {
    document.body.classList.add('is-loaded');
    // ensure reveal-line elements above the fold animate promptly
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal-line').forEach(el => el.classList.add('is-in'));
    }, 100);
  });

})();
