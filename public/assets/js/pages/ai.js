const tools = [
  ['LangFlow', 'langflow.png', 'Visual no-code builder for LangChain pipelines.'],
  ['Phidata', 'phidata.png', 'Agentic AI framework with memory & tool use.'],
  ['Nvidia NIM', 'nvidia.png', 'GPU inference microservices for production AI.'],
  ['Gemini', 'gemini.png', 'Google multimodal AI for text, code & reasoning.'],
  ['Ollama', 'ollama.png', 'Run open-source LLMs locally in one command.'],
  ['Groq', 'groq.png', 'Ultra-low latency LLM inference via LPU chips.'],
  ['OpenAI', 'openai.png', 'GPT APIs for text, vision & function calling.'],
  ['GitHub Copilot', 'github-copilot.png', 'AI pair programmer for IDE code completions.']
];
document.getElementById('tools-grid').innerHTML = tools.map(t =>
  `<div class="glass card at rv"><div class="ltile"><img src="assets/img/logos/ai/${t[1]}" alt="${t[0]}" loading="lazy"></div><div><strong>${t[0]}</strong><span>${t[2]}</span></div></div>`).join('');

const projects = [
  { id: 'a', c: '#7c5cff', icon: 'fa-file-lines', repo: 'AIPoweredApacheLogsAnalyzer',
    title: 'AI-Powered Apache Logs Analyzer', sub: 'Transforms raw Apache logs into structured insights, dashboards, and concise AI summaries.',
    tags: ['Python 3.10+', 'Streamlit', 'HuggingFace', 'OpenAI'],
    flow: [['Raw Logs', 'Ingests streaming or rotated Apache logs; supports tailing and batching.'], ['Parser', 'Parses common log formats into structured events; extracts status, URL, latency.'], ['AI Summary', 'AI produces concise summaries and Q&A from recent entries (Gemini or HF).']],
    highlights: 'Real-time stream · AI Q&A (latest 50) · Exports · Neon UI',
    problem: 'Converts noisy raw Apache logs into actionable insights quickly, reducing time-to-diagnosis for web incidents.',
    adv: ['Fast, real-time visibility into traffic and errors', 'AI summaries accelerate incident triage', 'Exportable reports for audits and postmortems'],
    sample: `AIPoweredApacheLogsAnalyzer/
├─ app.py
├─ parsers/
│  ├─ apache.py
│  └─ common.py
├─ ai/
│  ├─ summarize.py
│  └─ prompts/
├─ static/
├─ templates/
├─ requirements.txt
└─ README.md

Dependencies (requirements.txt snippet):
streamlit==1.24.0
pandas==2.1.0
transformers==4.31.0
openai==0.28.0

Tech: Python 3.10+, Streamlit, HuggingFace/OpenAI integrations, Docker-ready

Quickstart:
pip install -r requirements.txt
streamlit run app.py` },
  { id: 'd', c: '#22d3ee', icon: 'fa-film', repo: 'AgenticAI-GeminiAPI-VideoSummarizer',
    title: 'AgenticAI Gemini Video Summarizer', sub: "Upload any video and receive an instant AI-generated summary powered by Google Gemini's multimodal API.",
    tags: ['Python', 'Gemini API', 'Agentic AI', 'Streamlit'],
    flow: [['Video Input', 'Accepts video file uploads for multimodal AI processing.'], ['Gemini API', 'Sends video frames and audio to Gemini multimodal API for deep comprehension.'], ['AI Summary', 'Outputs a structured, concise summary with key topics and insights.']],
    highlights: 'Multimodal video understanding · Gemini API · Agentic pipeline · Instant summaries',
    problem: "Eliminates the need to watch hours of video content — Gemini's multimodal API extracts key insights in seconds.",
    adv: ["Leverages Gemini's native video understanding for high-accuracy summaries", 'Agentic design enables multi-step reasoning over video content', 'Simple Streamlit UI — no complex setup required'],
    sample: `AgenticAI-GeminiAPI-VideoSummarizer/
├─ app.py
├─ agent/
│  ├─ video_agent.py
│  └─ prompts.py
├─ utils/
│  └─ gemini_client.py
├─ requirements.txt
└─ README.md

Dependencies (requirements.txt snippet):
streamlit
google-generativeai
python-dotenv

Tech: Python, Google Gemini API (multimodal), Streamlit, Agentic AI pipeline

Quickstart:
pip install -r requirements.txt
# Set GEMINI_API_KEY in .env
streamlit run app.py` },
  { id: 'b', c: '#fb923c', icon: 'fa-memory', repo: 'LogsHeapAnalyzer',
    title: 'LogsHeapAnalyzer', sub: 'Analyze JVM heap dumps and GC logs to detect leaks, GC storms, and retention issues.',
    tags: ['Python 3.10+', 'JVM / jmap', 'Streamlit', 'Matplotlib'],
    flow: [['Heap/GC Logs', 'Heap dumps and GC logs captured from the JVM.'], ['Memory Model', 'Parses GC logs and heap dumps into timelines and heatmaps.'], ['AI RCA', 'AI synthesizes probable root causes from GC patterns and object growth.']],
    highlights: 'GC heatmaps · Object timelines · AI root-cause · Correlation with logs',
    problem: 'Detects memory leaks and GC pathologies that are hard to reproduce, shortening mean-time-to-resolution for memory issues.',
    adv: ['Visual GC heatmaps make anomalies obvious', 'Object timelines reveal retention sources', 'AI root-cause reports reduce manual forensics'],
    sample: `LogsHeapAnalyzer/
├─ analyzer.py
├─ parsers/
│  ├─ gc_parser.py
│  └─ heap_parser.py
├─ ui/
│  └─ streamlit_app.py
├─ samples/
├─ requirements.txt
└─ README.md

Dependencies (requirements.txt snippet):
numpy==1.26.0
pandas==2.1.0
streamlit==1.24.0
pyheapy==0.1.0

Tech: Python 3.10+, JVM heap/GC tooling (jmap/jcmd), Streamlit, Matplotlib/Plotly

Quickstart:
# capture heap using JDK tools (example):
# jmap -dump:live,format=b,file=heap.hprof <pid>
pip install -r requirements.txt
streamlit run ui/streamlit_app.py` },
  { id: 'c', c: '#34d399', icon: 'fa-chart-line', repo: 'DeltaPerf-AI',
    title: 'DeltaPerf-AI', sub: 'Unified performance intelligence combining logs, metrics, and heap analysis for multi-angle AI insights.',
    tags: ['Python 3.10+', 'Prometheus', 'scikit-learn', 'Streamlit'],
    flow: [['Logs + Metrics', 'Logs and time-series metrics from multiple sources.'], ['Correlation', 'Correlates time-series and events to find deltas and anomalies.'], ['AI', 'AI summarizes the timeline and issues a concise verdict and suggested fixes.']],
    highlights: 'Correlation engine · AI timeline narration · Deployment deltas · Dashboards',
    problem: 'Bridges siloed telemetry (logs, metrics, heap) so teams can quickly understand performance regressions across deployments.',
    adv: ['Cross-source correlation surfaces root causes faster', 'AI-narrated timelines speed stakeholder communication', 'Designed for production dashboards and regressions tracking'],
    sample: `DeltaPerf-AI/
├─ services/
│  ├─ ingest.py
│  └─ correlator.py
├─ dashboards/
├─ model/
│  └─ drift_detector.py
├─ requirements.txt
└─ README.md

Dependencies (requirements.txt snippet):
pandas==2.1.0
scikit-learn==1.3.2
prometheus-client==0.16.0
streamlit==1.24.0
sqlalchemy==2.1.0

Tech: Python 3.10+, Prometheus metrics, Streamlit dashboards, Docker, scikit-learn (anomaly scoring)

Quickstart:
pip install -r requirements.txt
python services/ingest.py --config config.yml` }
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
document.getElementById('proj-grid').innerHTML = projects.map(p => `
  <article class="glass card proj rv" style="--c:${p.c}" aria-label="${p.title}">
    <div class="ph"><div class="ico"><i class="fas ${p.icon}"></i></div>
      <div><h3>${p.title}<span class="badge">AI</span></h3><p class="sub">${p.sub}</p><div class="tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div></div></div>
    <div class="pb">
      <div class="flow">${p.flow.map((n, i) => (i ? '<i class="fas fa-arrow-right"></i>' : '') + `<span class="node" tabindex="0" data-tip="${n[1].replace(/"/g, '&quot;')}">${n[0]}</span>`).join('')}</div>
      <div class="row"><b>Highlights:</b> <span>${p.highlights}</span></div>
      <div class="row"><b>Problem it solves:</b> <span>${p.problem}</span></div>
      <div class="row"><b>Advantages:</b><ul>${p.adv.map(a => `<li>${a}</li>`).join('')}</ul></div>
    </div>
    <div class="pf">
      <div class="acts">
        <button class="btn line sm" data-t="${p.id}" aria-haspopup="dialog"><i class="fas fa-circle-info"></i> More details</button>
        <a class="btn line sm" href="https://github.com/Abhisheksinghpawar/${p.repo}" target="_blank" rel="noopener"><i class="fab fa-github"></i> View code</a>
        <a class="btn dl sm" href="https://github.com/Abhisheksinghpawar/${p.repo}/archive/refs/heads/main.zip" target="_blank" rel="noopener"><i class="fas fa-download"></i> Download</a>
      </div>
    </div>
  </article>`).join('');

const modal = document.getElementById('modal'), mtitle = document.getElementById('mtitle'), msample = document.getElementById('msample');
document.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => {
  const p = projects.find(x => x.id === b.dataset.t);
  mtitle.textContent = p.title; msample.textContent = p.sample; modal.classList.add('open');
}));
const closeModal = () => modal.classList.remove('open');
document.getElementById('mclose').onclick = closeModal;
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
aiReveal();
