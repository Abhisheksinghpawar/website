// Shared behaviour for the AI-theme pages (progress bar, nav, reveal-on-scroll, marquee loop, footer year).
(function () {
  const $$ = s => [...document.querySelectorAll(s)];

  const y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();

  const bar = document.getElementById('progress');
  if (bar) addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }, { passive: true });

  $$('#links a').forEach(a => a.addEventListener('click', () => document.getElementById('links').classList.remove('open')));

  // duplicate marquee content for a seamless loop
  $$('.track').forEach(t => { t.innerHTML += t.innerHTML; });

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .1 });
  window.aiReveal = (root = document) => [...root.querySelectorAll('.rv:not(.in)')].forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el);
  });
  window.aiReveal();
})();
