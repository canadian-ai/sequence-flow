import type { JourneySlide } from "./journey-player"

const styles = `:host{display:block;color:#111;font:14px/1.5 system-ui,sans-serif}.frame{border:1px solid #999;background:#fff}.head,.foot{padding:16px}.head{border-bottom:1px solid #999}.foot{display:flex;justify-content:space-between;align-items:center;gap:12px;border-top:1px solid #999}.title{margin:0 0 4px;font:700 22px Georgia,serif}.caption{margin:0;color:#666}.chart{margin:0;min-height:240px;overflow:auto;padding:20px;white-space:pre;font:12px/1.7 ui-monospace,monospace}button{border:1px solid #999;background:transparent;padding:7px 10px;color:inherit;cursor:pointer}:host([theme=dark]){color:#eee}:host([theme=dark]) .frame{background:#222}`

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement

export class SequenceFlowJourneyElement extends HTMLElementBase {
  static observedAttributes = ["slides", "theme"]
  private index = 0
  private slides: JourneySlide[] = []

  connectedCallback() { this.load(); this.render() }
  attributeChangedCallback() { if (this.isConnected) { this.load(); this.render() } }

  private load() {
    const source = this.getAttribute("slides") || this.querySelector('script[type="application/json"]')?.textContent || "[]"
    try { const value = JSON.parse(source); this.slides = Array.isArray(value) ? value : value.slides ?? [] } catch { this.slides = [] }
    this.index = Math.min(this.index, Math.max(0, this.slides.length - 1))
  }

  private render() {
    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" })
    root.replaceChildren()
    const style = document.createElement("style"); style.textContent = styles
    const frame = document.createElement("section"); frame.className = "frame"; frame.setAttribute("aria-label", "Sequence Flow journey")
    const slide = this.slides[this.index]
    if (!slide) { frame.textContent = "Add journey slides with the slides attribute or a nested application/json script."; root.append(style, frame); return }
    const head=document.createElement("header");head.className="head"
    const title=document.createElement("h2");title.className="title";title.textContent=slide.title||`Step ${this.index+1}`
    const caption=document.createElement("p");caption.className="caption";caption.textContent=slide.caption||""
    const chart=document.createElement("pre");chart.className="chart";chart.textContent=slide.chart.trim()
    const foot=document.createElement("footer");foot.className="foot"
    const count=document.createElement("span");count.textContent=`Step ${this.index+1} of ${this.slides.length}`
    const controls=document.createElement("div")
    const prev=document.createElement("button");prev.textContent="Previous";prev.disabled=this.index===0;prev.onclick=()=>{this.index--;this.render()}
    const next=document.createElement("button");next.textContent="Next";next.disabled=this.index===this.slides.length-1;next.onclick=()=>{this.index++;this.render()}
    controls.append(prev,next);head.append(title,caption);foot.append(count,controls);frame.append(head,chart,foot);root.append(style,frame)
  }
}

export function registerSequenceFlowJourney(tagName = "sequence-flow-journey") {
  if (typeof customElements !== "undefined" && !customElements.get(tagName)) customElements.define(tagName, SequenceFlowJourneyElement)
}
