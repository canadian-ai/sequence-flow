import type { JourneySlide } from "./journey-player"

export interface JourneyHtmlOptions {
  title?: string
  theme?: "light" | "dark"
}

const safeJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")

export function sanitizeJourneyFilename(title = "sequence-flow-journey") {
  const filename = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return `${filename || "sequence-flow-journey"}.html`
}

export function createStandaloneJourneyHtml(slides: JourneySlide[], options: JourneyHtmlOptions = {}) {
  const title = options.title ?? slides[0]?.title ?? "Sequence Flow journey"
  const payload = safeJson({ title, slides })
  const dark = options.theme === "dark"
  return `<!doctype html>
<html lang="en" data-theme="${dark ? "dark" : "light"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title.replace(/[<>&"]/g, "")}</title>
<style>:root{color-scheme:light;--bg:#f7f7f5;--fg:#111;--card:#fff;--line:#aaa;--muted:#666;--accent:#b33a22}html[data-theme=dark]{color-scheme:dark;--bg:#171717;--fg:#f1f1ee;--card:#202020;--line:#555;--muted:#aaa;--accent:#ed7459}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 ui-sans-serif,system-ui,sans-serif}.shell{max-width:1100px;margin:auto;padding:24px}.eyebrow,button{font:12px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em}.top,.controls{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.frame{margin-top:18px;border:1px solid var(--line);background:var(--card)}.copy{padding:24px;border-bottom:1px solid var(--line)}h1{font:700 clamp(28px,5vw,56px)/1.05 Georgia,serif;margin:8px 0}h2{font:700 22px/1.2 Georgia,serif;margin:0 0 8px}.diagram{overflow:auto;padding:28px;min-height:310px}.actors{display:flex;justify-content:space-around;gap:24px;min-width:620px}.actor{min-width:120px;text-align:center;border:1px solid var(--line);padding:10px;font:12px ui-monospace,monospace}.source{white-space:pre;min-width:620px;margin:18px 0 0;border-left:2px solid var(--accent);padding:14px 18px;color:var(--muted);font:13px/1.8 ui-monospace,monospace}.controls{padding:14px}.steps{display:flex;gap:6px}.dot{width:24px;height:4px;border:0;background:var(--line);padding:0}.dot[aria-current=true]{background:var(--accent)}button.action{border:1px solid var(--line);background:transparent;color:inherit;padding:9px 12px;cursor:pointer}button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.caption{color:var(--muted);max-width:70ch}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}</style></head>
<body><main class="shell"><div class="top"><span class="eyebrow">Sequence Flow / exported journey</span><button class="action" id="theme">Theme</button></div><section class="frame" aria-label="Journey player"><div class="copy"><span class="eyebrow" id="count"></span><h1 id="title"></h1><p class="caption" id="caption"></p></div><div class="diagram"><div class="actors" id="actors"></div><pre class="source" id="chart"></pre></div><div class="controls"><div class="steps" id="steps"></div><div><button class="action" id="prev">Previous</button> <button class="action" id="play">Play</button> <button class="action" id="next">Next</button></div></div></section><p class="sr" aria-live="polite" id="live"></p></main>
<script type="application/json" id="journey-data">${payload}</script><script>(()=>{const data=JSON.parse(document.getElementById('journey-data').textContent),slides=data.slides;let i=0,t=null;const $=id=>document.getElementById(id);function actors(chart){const matches=[...chart.matchAll(/^\\s*(?:participant|actor)\\s+(\\w+)(?:\\s+as\\s+(.+))?$/gm)];return matches.map(m=>m[2]||m[1])}function render(){const s=slides[i];$('title').textContent=s.title||data.title;$('caption').textContent=s.caption||'';$('count').textContent='Step '+(i+1)+' of '+slides.length;$('chart').textContent=s.chart.trim();$('actors').replaceChildren(...actors(s.chart).map(x=>{const e=document.createElement('div');e.className='actor';e.textContent=x;return e}));$('steps').replaceChildren(...slides.map((_,n)=>{const b=document.createElement('button');b.className='dot';b.setAttribute('aria-label','Go to step '+(n+1));b.setAttribute('aria-current',String(n===i));b.onclick=()=>{i=n;stop();render()};return b}));$('prev').disabled=i===0;$('next').disabled=i===slides.length-1;$('live').textContent='Showing '+(s.title||'step '+(i+1))}function stop(){if(t)clearInterval(t);t=null;$('play').textContent='Play'}$('prev').onclick=()=>{i=Math.max(0,i-1);stop();render()};$('next').onclick=()=>{i=Math.min(slides.length-1,i+1);stop();render()};$('play').onclick=()=>{if(t){stop();return}$('play').textContent='Pause';t=setInterval(()=>{i=(i+1)%slides.length;render()},4500)};$('theme').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark'};addEventListener('keydown',e=>{if(e.key==='ArrowRight')$('next').click();if(e.key==='ArrowLeft')$('prev').click();if(e.key===' '){e.preventDefault();$('play').click()}});render()})()</script></body></html>`
}

export function downloadJourneyHtml(slides: JourneySlide[], options: JourneyHtmlOptions = {}) {
  const blob = new Blob([createStandaloneJourneyHtml(slides, options)], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = sanitizeJourneyFilename(options.title ?? slides[0]?.title)
  anchor.click()
  URL.revokeObjectURL(url)
}
