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

const STYLE = `*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 ui-sans-serif,system-ui,sans-serif}
.shell{max-width:1180px;margin:auto;padding:24px}
.eyebrow{font:12px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.top,.controls{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.frame{margin-top:16px;border:1px solid var(--line);background:var(--card)}
.copy{padding:22px 24px;border-bottom:1px solid var(--line)}
h1{font:700 clamp(26px,4vw,44px)/1.05 Georgia,serif;margin:6px 0}
.caption{color:var(--muted);max-width:72ch;margin:0}
.stage-wrap{height:520px;position:relative;overflow:hidden;border-bottom:1px solid var(--line)}
.stage{width:100%;height:100%;position:relative;overflow:hidden;cursor:grab;user-select:none;background-color:var(--bg);background-image:radial-gradient(var(--line) 1px,transparent 1px);background-size:22px 22px}
.stage.drag{cursor:grabbing}
.canvas{position:absolute;transform-origin:0 0}
.zoom{position:absolute;left:12px;bottom:12px;display:grid;gap:1px;border:1px solid var(--line);overflow:hidden;background:var(--line)}
.zoom button{width:34px;height:34px;border:0;background:var(--card);color:var(--fg);font:13px ui-monospace,monospace;cursor:pointer}
.zoom button:hover{background:var(--bg)}
.grp{position:absolute;border:1px dashed var(--line);background:var(--grp);border-radius:10px;z-index:0}
.grp-label{position:absolute;left:8px;top:-11px;padding:2px 8px;background:var(--card);color:var(--muted);font:11px/1.4 ui-monospace,monospace;border:1px solid var(--line);white-space:nowrap}
.ll{position:absolute;width:0;border-left:1px dashed var(--line);z-index:1}
.actor{position:absolute;width:132px;height:52px;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 12px;text-align:center;border:1px solid var(--line);background:var(--card);font:600 13px ui-sans-serif,system-ui,sans-serif;z-index:5}
.act{position:absolute;width:10px;border:1px solid var(--accent);background:color-mix(in oklab,var(--accent) 18%,transparent);z-index:3}
.note{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;min-height:44px;padding:8px 12px;border:1px solid var(--line);background:var(--bg);color:var(--muted);font:11px/1.35 ui-sans-serif,system-ui,sans-serif;z-index:6}
svg.edges{position:absolute;left:0;top:0;overflow:visible;z-index:4;pointer-events:none}
.msg-line{stroke:var(--accent);stroke-width:1.5;fill:none}
.msg-label{position:absolute;transform:translate(-50%,-50%);z-index:8;background:var(--accent);color:var(--accent-fg);padding:3px 8px;font:600 11px ui-sans-serif,system-ui,sans-serif;white-space:nowrap}
.controls{padding:14px 16px}
.steps{display:flex;gap:6px;flex-wrap:wrap}
.dot{width:26px;height:4px;border:0;background:var(--line);padding:0;cursor:pointer}
.dot[aria-current=true]{background:var(--accent)}
.btns{display:flex;gap:8px}
button.action{border:1px solid var(--line);background:transparent;color:inherit;padding:9px 13px;cursor:pointer;font:12px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.06em}
button.action:hover{background:var(--bg)}
button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadein{to{opacity:1}}
.anim-rise{opacity:0;animation:rise .45s ease forwards}
.anim-fade{opacity:0;animation:fadein .5s ease forwards}
@media (max-width:760px){.stage-wrap{height:440px}}
@media (prefers-reduced-motion:reduce){.anim-rise,.anim-fade{animation:none;opacity:1}}`

const RUNTIME = `(()=>{
const data=JSON.parse(document.getElementById('journey-data').textContent),slides=data.slides;
const ACTOR_W=132,ACTOR_H=52,MARGIN_X=40,MARGIN_TOP=24,BOX_LABEL_H=26,FIRST=44,SELF_H=46,NOTE_H=44,BOTTOM_GAP=20,COL_GAP=200,MSG_GAP=54;
const $=id=>document.getElementById(id);
let i=0,timer=null,playing=true;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const arrows=[['-->>','dashed','filled'],['->>','solid','filled'],['--x','dashed','cross'],['-x','solid','cross'],['--)','dashed','open'],['-)','solid','open'],['-->','dashed','none'],['->','solid','none']];
function strip(line){const k=line.indexOf('%%');return (k<0?line:line.slice(0,k)).trim();}
function parse(input){
const participants=[],byId=new Map(),boxes=[],events=[];let box=null,idx=0;
const ensure=(raw,actor)=>{const id=raw.trim();let p=byId.get(id);if(!p){p={id:id,label:id,actor:!!actor};byId.set(id,p);participants.push(p);if(box)box.ids.push(id);}return p;};
input.split(/\\r?\\n/).forEach(raw=>{
const line=strip(raw);if(!line)return;const low=line.toLowerCase();if(low==='sequencediagram')return;
if(low.indexOf('box ')===0||low==='box'){box={id:'box'+boxes.length,label:line.slice(3).trim(),ids:[]};boxes.push(box);return;}
if(low==='end'){box=null;return;}
if(/^(loop|alt|else|opt|par|and|critical|option|break|rect|autonumber)\\b/i.test(line))return;
let m=line.match(/^(participant|actor)\\s+(.+)$/i);
if(m){const actor=m[1].toLowerCase()==='actor',body=m[2].trim(),as=body.match(/^(.+?)\\s+as\\s+(.+)$/i);if(as){const p=ensure(as[1],actor);p.label=as[2].trim();p.actor=actor;}else{const p=ensure(body,actor);p.actor=actor;}return;}
m=line.match(/^note\\s+(right of|left of|over)\\s+(.+?)\\s*:\\s*(.+)$/i);
if(m){const pl=m[1].toLowerCase().charAt(0)==='r'?'right':m[1].toLowerCase().charAt(0)==='l'?'left':'over';const ids=m[2].split(',').map(s=>s.trim()).filter(Boolean);ids.forEach(id=>ensure(id));events.push({kind:'note',index:idx++,placement:pl,ids:ids,text:m[3].trim()});return;}
m=line.match(/^(activate|deactivate)\\s+(.+)$/i);
if(m){const id=m[2].trim();ensure(id);events.push({kind:m[1].toLowerCase(),index:idx++,pid:id});return;}
let found=null;for(let a=0;a<arrows.length;a++){const at=line.indexOf(arrows[a][0]);if(at>=0&&(!found||at<found.at))found={token:arrows[a][0],line:arrows[a][1],head:arrows[a][2],at:at};}
if(found){const from=line.slice(0,found.at).trim();let after=line.slice(found.at+found.token.length),text='';const c=after.indexOf(':');if(c>=0){text=after.slice(c+1).trim();after=after.slice(0,c);}let target=after.trim(),actT=false,deS=false;if(target.charAt(0)==='+'){actT=true;target=target.slice(1).trim();}else if(target.charAt(0)==='-'){deS=true;target=target.slice(1).trim();}if(from&&target){ensure(from);ensure(target);events.push({kind:'message',index:idx++,from:from,to:target,text:text,line:found.line,head:found.head,self:from===target,actT:actT,deS:deS});}}
});
return {participants:participants,boxes:boxes,events:events};
}
function layout(model){
const index=new Map(model.participants.map((p,n)=>[p.id,n]));
const xOf=id=>MARGIN_X+ACTOR_W/2+(index.get(id)||0)*COL_GAP;
const hasBoxes=model.boxes.length>0,headY=MARGIN_TOP+(hasBoxes?BOX_LABEL_H:0),llTop=headY+ACTOR_H;
const messages=[],notes=[],acts=[],stacks={};let y=llTop+FIRST;
const push=(pid,start)=>{(stacks[pid]=stacks[pid]||[]).push({start:start,depth:stacks[pid].length});};
const pop=(pid,end)=>{const s=stacks[pid]&&stacks[pid].pop();if(s)acts.push({pid:pid,top:s.start,height:Math.max(end-s.start,18),depth:s.depth});};
model.events.forEach(ev=>{
if(ev.kind==='message'){const my=y,y2=ev.self?my+SELF_H:my;messages.push(Object.assign({},ev,{y1:my,y2:y2}));if(ev.actT)push(ev.to,my);if(ev.deS)pop(ev.from,y2);y=(ev.self?y2:my)+MSG_GAP;}
else if(ev.kind==='note'){const xs=ev.ids.map(xOf);let nx,nw;if(ev.placement==='over'){const mn=Math.min.apply(null,xs),mx=Math.max.apply(null,xs);nw=ev.ids.length>1?mx-mn+ACTOR_W:150;nx=(mn+mx)/2-nw/2;}else if(ev.placement==='right'){nx=xOf(ev.ids[0])+16;nw=150;}else{nw=150;nx=xOf(ev.ids[0])-16-nw;}notes.push(Object.assign({},ev,{x:nx,y:y,width:nw}));y+=NOTE_H+20;}
else if(ev.kind==='activate')push(ev.pid,y);else if(ev.kind==='deactivate')pop(ev.pid,y);
});
Object.keys(stacks).forEach(pid=>{while(stacks[pid]&&stacks[pid].length)pop(pid,y);});
const bottomHeadY=y+BOTTOM_GAP,llHeight=bottomHeadY-llTop,height=bottomHeadY+ACTOR_H+MARGIN_TOP;
const last=model.participants.length?model.participants[model.participants.length-1].id:'';const width=xOf(last)+ACTOR_W/2+MARGIN_X;
return {xOf:xOf,headY:headY,llTop:llTop,bottomHeadY:bottomHeadY,llHeight:llHeight,height:height,width:width,messages:messages,notes:notes,acts:acts};
}
function el(tag,cls,styles,text){const d=document.createElement(tag);d.className=cls;if(styles)Object.assign(d.style,styles);if(text)d.textContent=text;return d;}
const canvas=$('canvas'),stage=$('stage');
let view={scale:1,tx:0,ty:0},graph={width:800,height:500};
function apply(){canvas.style.transform='translate('+view.tx+'px,'+view.ty+'px) scale('+view.scale+')';}
function fit(){const r=stage.getBoundingClientRect(),pad=26;const scale=Math.min((r.width-pad*2)/graph.width,(r.height-pad*2)/graph.height,1.3);view.scale=Math.max(.2,scale);view.tx=(r.width-graph.width*view.scale)/2;view.ty=(r.height-graph.height*view.scale)/2;apply();}
function zoom(f){const r=stage.getBoundingClientRect(),cx=r.width/2,cy=r.height/2,old=view.scale;view.scale=Math.max(.2,Math.min(2,old*f));view.tx=cx-(cx-view.tx)*(view.scale/old);view.ty=cy-(cy-view.ty)*(view.scale/old);apply();}
function renderDiagram(chart){
canvas.innerHTML='';
const model=parse(chart);
if(!model.participants.length)return;
graph=layout(model);
canvas.style.width=graph.width+'px';canvas.style.height=graph.height+'px';
const order=new Map(model.participants.map((p,n)=>[p.id,n]));
const delay=id=>reduce?0:(order.get(id)||0)*70;
model.boxes.forEach(b=>{
if(!b.ids.length)return;const xs=b.ids.map(graph.xOf),left=Math.min.apply(null,xs)-ACTOR_W/2-14,right=Math.max.apply(null,xs)+ACTOR_W/2+14;
const g=el('div','grp',{left:left+'px',top:MARGIN_TOP+'px',width:(right-left)+'px',height:(graph.height-MARGIN_TOP*1.5)+'px'});
if(b.label)g.appendChild(el('span','grp-label',null,b.label));canvas.appendChild(g);
});
model.participants.forEach(p=>{
const x=graph.xOf(p.id);
canvas.appendChild(el('div','ll',{left:x+'px',top:graph.llTop+'px',height:graph.llHeight+'px'}));
[graph.headY,graph.bottomHeadY].forEach(yy=>{canvas.appendChild(el('div','actor anim-rise',{left:(x-ACTOR_W/2)+'px',top:yy+'px',animationDelay:delay(p.id)+'ms'},(p.actor?'\u25EF  ':'')+p.label));});
});
graph.acts.forEach(a=>{const x=graph.xOf(a.pid)-5+a.depth*4;canvas.appendChild(el('div','act',{left:x+'px',top:a.top+'px',height:a.height+'px'}));});
graph.notes.forEach(n=>{canvas.appendChild(el('div','note anim-rise',{left:n.x+'px',top:n.y+'px',width:n.width+'px',animationDelay:(reduce?0:120+n.index*60)+'ms'},n.text));});
const NS='http://www.w3.org/2000/svg';
const svg=document.createElementNS(NS,'svg');svg.setAttribute('class','edges');svg.setAttribute('width',graph.width);svg.setAttribute('height',graph.height);
svg.innerHTML='<defs><marker id="filled" markerWidth="12" markerHeight="12" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L9,4 L0,8 z" fill="var(--accent)"/></marker><marker id="open" markerWidth="12" markerHeight="12" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L9,4 L0,8" fill="none" stroke="var(--accent)" stroke-width="1.5"/></marker><marker id="cross" markerWidth="12" markerHeight="12" refX="6" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L7,7 M7,1 L1,7" fill="none" stroke="var(--accent)" stroke-width="1.6"/></marker></defs>';
canvas.appendChild(svg);
graph.messages.forEach((m,n)=>{
const x1=graph.xOf(m.from),x2=graph.xOf(m.to);
const d=m.self?'M '+x1+' '+m.y1+' C '+(x1+62)+' '+m.y1+', '+(x1+62)+' '+m.y2+', '+x1+' '+m.y2:'M '+x1+' '+m.y1+' L '+x2+' '+m.y2;
const path=document.createElementNS(NS,'path');path.setAttribute('d',d);path.setAttribute('class','msg-line anim-fade');
if(m.line==='dashed')path.setAttribute('stroke-dasharray','6 4');
if(m.head!=='none')path.setAttribute('marker-end','url(#'+m.head+')');
if(!reduce)path.style.animationDelay=(120+n*90)+'ms';
svg.appendChild(path);
if(m.text){const lx=m.self?x1+62:(x1+x2)/2,ly=m.self?(m.y1+m.y2)/2:m.y1;canvas.appendChild(el('div','msg-label anim-fade',{left:lx+'px',top:ly+'px',animationDelay:(reduce?0:160+n*90)+'ms'},m.text));}
});
fit();
}
function renderStep(){
const s=slides[i];
$('title').textContent=s.title||data.title;
$('caption').textContent=s.caption||'';
$('count').textContent='Step '+(i+1)+' of '+slides.length;
const st=$('steps');st.innerHTML='';
slides.forEach((_,n)=>{const b=document.createElement('button');b.className='dot';b.setAttribute('aria-label','Go to step '+(n+1));b.setAttribute('aria-current',String(n===i));b.onclick=()=>{i=n;renderStep();};st.appendChild(b);});
$('live').textContent='Showing '+(s.title||'step '+(i+1));
renderDiagram(s.chart);
}
function setPlaying(v){playing=v;$('play').textContent=v?'Pause':'Play';if(timer){clearInterval(timer);timer=null;}if(v)timer=setInterval(()=>{i=(i+1)%slides.length;renderStep();},4200);}
$('prev').onclick=()=>{i=(i-1+slides.length)%slides.length;renderStep();};
$('next').onclick=()=>{i=(i+1)%slides.length;renderStep();};
$('play').onclick=()=>setPlaying(!playing);
$('theme').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';};
$('zoomIn').onclick=()=>zoom(1.2);$('zoomOut').onclick=()=>zoom(1/1.2);$('fit').onclick=fit;
let drag=null;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('.zoom'))return;drag={x:e.clientX,y:e.clientY,tx:view.tx,ty:view.ty};stage.classList.add('drag');stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(!drag)return;view.tx=drag.tx+e.clientX-drag.x;view.ty=drag.ty+e.clientY-drag.y;apply();});
stage.addEventListener('pointerup',()=>{drag=null;stage.classList.remove('drag');});
stage.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();zoom(e.deltaY<0?1.08:1/1.08);}},{passive:false});
addEventListener('resize',fit);
addEventListener('keydown',e=>{if(e.key==='ArrowRight')$('next').click();if(e.key==='ArrowLeft')$('prev').click();if(e.key===' '){e.preventDefault();$('play').click();}});
renderStep();
setPlaying(!reduce);
})();`

export function createStandaloneJourneyHtml(slides: JourneySlide[], options: JourneyHtmlOptions = {}) {
  const title = options.title ?? slides[0]?.title ?? "Sequence Flow journey"
  const payload = safeJson({ title, slides })
  const dark = options.theme === "dark"
  return `<!doctype html>
<html lang="en" data-theme="${dark ? "dark" : "light"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title.replace(/[<>&"]/g, "")}</title>
<style>:root{color-scheme:light;--bg:#f7f7f5;--fg:#141414;--card:#fff;--line:#d8d8d2;--muted:#6b6b66;--accent:#b33a22;--accent-fg:#fff;--grp:rgba(179,58,34,.05)}html[data-theme=dark]{color-scheme:dark;--bg:#171717;--fg:#f1f1ee;--card:#1f1f1f;--line:#3a3a38;--muted:#a5a5a0;--accent:#ed7459;--accent-fg:#1b1b1b;--grp:rgba(237,116,89,.08)}
${STYLE}</style></head>
<body><main class="shell"><div class="top"><span class="eyebrow">Sequence Flow / exported journey</span><button class="action" id="theme">Theme</button></div><section class="frame" aria-label="Journey player"><div class="copy"><span class="eyebrow" id="count"></span><h1 id="title"></h1><p class="caption" id="caption"></p></div><div class="stage-wrap"><div class="stage" id="stage"><div class="canvas" id="canvas"></div><div class="zoom" aria-label="Canvas controls"><button id="zoomIn" title="Zoom in">+</button><button id="zoomOut" title="Zoom out">&minus;</button><button id="fit" title="Fit view">Fit</button></div></div></div><div class="controls"><div class="steps" id="steps"></div><div class="btns"><button class="action" id="prev">Prev</button><button class="action" id="play">Play</button><button class="action" id="next">Next</button></div></div></section><p class="sr" aria-live="polite" id="live"></p></main>
<script type="application/json" id="journey-data">${payload}</script><script>${RUNTIME}</script></body></html>`
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
