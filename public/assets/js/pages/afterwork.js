// Quote + fact of the day, via the same Cloudflare Worker (API Ninjas proxy) as LiveTiles.html
const WORKER_URL = window.SITE_CONFIG.workerUrl;
async function ninjas(endpoint) {
  const res = await fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'ninjas', endpoint }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Service unavailable');
  return data;
}
function put(id, text) { const el = document.getElementById(id); el.textContent = text; el.classList.remove('shimmer'); }
ninjas('quotes').then(d => {
  if (Array.isArray(d) && d.length) { put('quote-text', '“' + d[0].quote + '”'); document.getElementById('quote-by').textContent = d[0].author ? '— ' + d[0].author : ''; }
  else put('quote-text', 'No quotes found.');
}).catch(() => put('quote-text', 'Today\'s quote is unavailable right now. Please check back later.'));
ninjas('facts').then(d => {
  if (Array.isArray(d) && d.length) put('fact-text', d[0].fact);
  else put('fact-text', 'No facts found.');
}).catch(() => put('fact-text', 'Today\'s fact is unavailable right now.'));
