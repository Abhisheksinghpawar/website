// footer year + nav close on click
document.getElementById('yr').textContent = new Date().getFullYear();
document.querySelectorAll('#links a').forEach(a => a.addEventListener('click', () => document.getElementById('links').classList.remove('open')));

// duplicate marquee for seamless loop
const track = document.getElementById('track');
track.innerHTML += track.innerHTML;

// rotating role text
// scroll progress bar
addEventListener('scroll', () => { const h = document.documentElement; document.getElementById('progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%'; }, { passive: true });

// rotating hero word
const words = ['fast', 'reliable', 'scalable', 'resilient']; let wi = 0;
// The headline wraps differently per word ("fast" vs "resilient"); reserve the tallest height so the
// buttons below never jump (this was the page's biggest layout-shift source).
function lockHeroHeight() {
  const h1 = document.querySelector('.hero h1'), el = document.getElementById('word');
  if (!h1 || !el) return;
  const current = el.textContent;
  h1.style.minHeight = '';
  let tallest = 0;
  words.forEach(w => { el.textContent = w; tallest = Math.max(tallest, h1.offsetHeight); });
  el.textContent = current;
  h1.style.minHeight = tallest + 'px';
}
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(lockHeroHeight);
let lockTimer; addEventListener('resize', () => { clearTimeout(lockTimer); lockTimer = setTimeout(lockHeroHeight, 150); });

// switch word every 2 seconds (0.3 s cross-fade); skipped for visitors who prefer reduced motion
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => { const el = document.getElementById('word'); el.style.opacity = 0; setTimeout(() => { wi = (wi + 1) % words.length; el.textContent = words[wi]; el.style.opacity = 1; }, 300); }, 2000);
}

// testimonials: auto-rotate every 3s, pause on hover
const qi = [...document.querySelectorAll('.q-item')], qd = [...document.querySelectorAll('#qd button')];
let qn = 0, qt, qHover = false;
function showQ(n) {
  qn = n; qi.forEach((q, i) => q.classList.toggle('on', i === n));
  qd.forEach((d, i) => { d.classList.remove('on'); void d.offsetWidth; d.classList.toggle('on', i === n); });
  clearTimeout(qt); qt = setTimeout(() => qHover ? showQ(qn) : showQ((qn + 1) % qi.length), 3000);
}
qd.forEach((d, i) => d.onclick = () => showQ(i));
const qbox = document.getElementById('quotes');
qbox.addEventListener('mouseenter', () => qHover = true);
qbox.addEventListener('mouseleave', () => qHover = false);
showQ(0);

const roles = ['> performance_engineer --years 8', '> jmeter | grafana | python', '> ai.analyze(page.metrics)', '> make it faster'];
let ri = 0, ci = 0, del = false;
(function type(){
  const el = document.getElementById('roles'), s = roles[ri];
  el.textContent = s.slice(0, ci);
  if (!del && ci === s.length) { del = true; return setTimeout(type, 1600); }
  if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
  ci += del ? -1 : 1;
  setTimeout(type, del ? 25 : 55);
})();

// scroll reveal + count-up
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
document.querySelectorAll('[data-count]').forEach(el => {
  const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
  (function step(t){ const p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(step); })(t0);
});

// ---- live performance metrics + AI analysis (same Worker as index.html) ----
const WORKER_URL = window.SITE_CONFIG.workerUrl;
const metrics = [];
let lcpMs = null;
try { new PerformanceObserver(l => { const e = l.getEntries(); lcpMs = e[e.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}

const fmt = ms => ms >= 1000 ? (ms / 1000).toFixed(2) + ' s' : Math.round(ms) + ' ms';

window.addEventListener('load', () => {
  metrics.push({ title: 'Page Load Time', value: fmt(performance.now()), note: 'From navigation to load event' });
  const nav = performance.getEntriesByType('navigation')[0];
  if (nav) {
    metrics.push({ title: 'TTFB', value: nav.responseStart.toFixed(0) + ' ms', note: 'Time to First Byte' });
    metrics.push({ title: 'DOM Ready', value: nav.domContentLoadedEventEnd.toFixed(0) + ' ms', note: 'DOMContentLoaded' });
  }
  const conn = navigator.connection;
  if (conn) {
    metrics.push({ title: 'Connection Type', value: conn.effectiveType || 'Unknown', note: 'Reported by browser' });
    metrics.push({ title: 'Estimated Bandwidth', value: conn.downlink + ' Mbps', note: 'Browser estimate' });
  }
  const t0 = performance.now(), img = new Image();
  const done = ok => {
    metrics.push({ title: 'Host Ping', value: ok ? fmt(performance.now() - t0) : 'N/A', note: ok ? 'Simulated via favicon fetch' : 'Ping failed' });
    if (lcpMs !== null) metrics.push({ title: 'LCP', value: lcpMs.toFixed(0) + ' ms', note: 'Largest Contentful Paint' });
    renderMetrics(); analyze('ai-analysis-text'); analyze('nvidia-analysis-text', 'nvidia');
  };
  img.onload = () => done(true);
  img.onerror = () => done(false);
  img.src = 'https://www.google.com/favicon.ico?' + Date.now();
});

const INFO = {
  'Page Load Time': 'Total time from starting navigation until the browser fires the load event, meaning the page and its images, scripts and styles have finished loading.',
  'TTFB': 'Time To First Byte: how long the browser waits after requesting this page until the first byte of the response arrives. It reflects network latency plus server (or CDN) response time.',
  'DOM Ready': 'When the HTML has been fully parsed and the DOM is built (DOMContentLoaded). The page structure is ready, though images may still be loading.',
  'Connection Type': "The browser's estimate of your network quality (4g, 3g, etc.) based on recently observed speed and latency, not the actual radio technology.",
  'Estimated Bandwidth': "The browser's estimate of your current download speed in megabits per second, derived from recent network activity.",
  'Host Ping': 'Round-trip time to fetch a tiny file from an external host. It is a rough approximation of network latency, not a true ICMP ping.',
  'LCP': 'Largest Contentful Paint: when the biggest visible element (hero image or text block) finishes rendering. A Core Web Vital; under 2.5 s is considered good.'
};
let openInfo = null;
function renderMetrics() {
  const short = { 'Page Load Time': 'Load', 'Estimated Bandwidth': 'Bandwidth', 'Connection Type': 'Network' };
  document.getElementById('metrics-grid').innerHTML = metrics.map(m =>
    `<div class="m"><small>${short[m.title] || m.title}</small><b>${m.value}</b>` +
    `<button class="info" type="button" aria-label="What is ${m.title}?" data-k="${m.title}"><i class="fas fa-info"></i></button></div>`).join('');
  document.querySelectorAll('.m .info').forEach(b => b.addEventListener('click', () => showInfo(b.dataset.k)));
}
function showInfo(k) {
  const box = document.getElementById('metric-explain');
  openInfo = openInfo === k ? null : k;
  box.hidden = !openInfo;
  if (openInfo) box.innerHTML = `<b>${k}</b> — ${INFO[k] || ''}`;
  document.querySelectorAll('.m .info').forEach(b => b.classList.toggle('on', b.dataset.k === openInfo));
}

async function analyze(id, provider) {
  const el = document.getElementById(id);
  try {
    const res = await fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(provider ? { metrics, provider } : { metrics }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Worker returned ' + res.status);
    el.textContent = data.verdict || 'No analysis returned.';
  } catch (err) {
    // never show raw errors to visitors; the Worker logs the details
    el.textContent = 'Analysis is temporarily unavailable. Please try again later.';
    console.warn('AI analysis failed:', err.message);
  }
  el.classList.remove('shimmer');
}

// ---- popup that points visitors at the featured project: after a few seconds, never again for 3 days once dismissed/clicked ----
(function featuredPromo() {
  const el = document.getElementById('promo');
  if (!el) return;
  const KEY = 'promo-featured-seen';
  const remember = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* private mode */ } };
  let seen = 0;
  try { seen = Number(localStorage.getItem(KEY)) || 0; } catch (e) { /* private mode */ }
  if (Date.now() - seen < 3 * 864e5) return;
  const close = () => { remember(); el.classList.remove('show'); setTimeout(() => { el.hidden = true; }, 400); };
  document.getElementById('promo-x').addEventListener('click', close);
  el.querySelector('.go').addEventListener('click', remember);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !el.hidden) close(); });
  setTimeout(() => { el.hidden = false; requestAnimationFrame(() => el.classList.add('show')); }, 4000);
})();
