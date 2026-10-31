// Stateless free journey publishing for the Sequence Flow editor and MCP clients.
// No customer artifacts or billing state are stored in this public source file.
const TTL = { "1h": 3600, "24h": 86400, "7d": 604800 };
const API_ORIGIN = "https://sequence-flow.canadian-ai.app";
const PUBLIC_BASE = "https://sequence-flow.canadian-ai.app/journey?slug=";
const ACCEPTED_ORIGINS = new Set([API_ORIGIN, "https://chatgpt.com", "https://chat.openai.com", "https://claude.ai", "https://claude.com"]);
const SUPPORTED_PROTOCOLS = new Set(["2025-03-26", "2025-11-25", "2026-07-28"]);
const MAX_REQUEST_BYTES = 32000;
const MAX_JOURNEY_BYTES = 25000;
const TOOL_NAME = "publish_journey";

const toolSchema = {
  type: "object", additionalProperties: false, required: ["title", "slides"],
  properties: {
    title: { type: "string", maxLength: 160, description: "Public journey title." },
    description: { type: "string", maxLength: 2000 },
    slides: { type: "array", minItems: 1, maxItems: 20,
      items: { type: "object", additionalProperties: false, required: ["id", "chart"],
        properties: {
          id: { type: "string", pattern: "^[a-zA-Z0-9_-]{1,80}$" },
          title: { type: "string", maxLength: 160 },
          caption: { type: "string", maxLength: 4000 },
          chart: { type: "string", maxLength: 12000, description: "Mermaid sequenceDiagram source" },
          messageCaptions: { type: "array", maxItems: 100, items: { type: "string", maxLength: 1000 } },
        },
      },
    },
    expiresIn: { type: "string", enum: ["1h", "24h", "7d"], default: "24h" },
  },
};

const tools = [
  { name: TOOL_NAME, title: "Publish free temporary journey",
    description: "Publish a PUBLIC, non-confidential Mermaid journey for free. No CAI credits or subscription needed. Returns a short URL and expiration. Anyone with the URL can view it; never publish secrets or customer-private information. Links expire after 1 hour, 24 hours or 7 days.",
    inputSchema: toolSchema,
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: true, readOnlyHint: false },
  },
  { name: "revoke_journey", title: "Revoke published journey",
    description: "Remove a published temporary journey using the private deletion token returned by publish_journey. Never share deletion tokens in public content.",
    inputSchema: { type: "object", required: ["slug", "deleteToken"], additionalProperties: false,
      properties: { slug: { type: "string" }, deleteToken: { type: "string" } },
    },
    annotations: { destructiveHint: true, readOnlyHint: false },
  },
];

function headers(request) {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": ACCEPTED_ORIGINS.has(origin) ? origin : API_ORIGIN,
    "Access-Control-Allow-Headers": "Authorization, Content-Type, MCP-Protocol-Version, Mcp-Method, Mcp-Name",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function reply(request, value, status=200, extra={}) {
  return new Response(JSON.stringify(value), { status, headers: {
    ...headers(request), "Content-Type": "application/json; charset=utf-8", ...extra,
  }});
}
function failure(request, message, status=400) {
  return reply(request, { error: message }, status);
}
function requireString(value, max, field) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error("Invalid " + field);
  return value.trim();
}
function makeArtifact(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("A journey object is required");
  const title = requireString(input.title, 160, "title");
  const description = input.description === undefined ? undefined : String(input.description);
  if (description !== undefined && description.length > 2000) throw new Error("Description too long");
  if (!Array.isArray(input.slides) || input.slides.length < 1 || input.slides.length > 20) throw new Error("Journey must have 1–20 slides");
  const ids = new Set();
  const slides = input.slides.map((slide) => {
    if (!slide || typeof slide !== "object" || Array.isArray(slide)) throw new Error("Invalid slide");
    const id = requireString(slide.id, 80, "slide id");
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id)) throw new Error("Slide IDs must be unique and URL-safe");
    ids.add(id);
    const chart = requireString(slide.chart, 12000, "Mermaid chart");
    if (!/^sequenceDiagram(?:\s|$)/.test(chart)) throw new Error("Each slide must contain a Mermaid sequenceDiagram");
    if (slide.title !== undefined && (typeof slide.title !== "string" || slide.title.length > 160)) throw new Error("Invalid slide title");
    if (slide.caption !== undefined && (typeof slide.caption !== "string" || slide.caption.length > 4000)) throw new Error("Invalid slide caption");
    if (slide.messageCaptions !== undefined && (!Array.isArray(slide.messageCaptions) ||
      slide.messageCaptions.length > 100 ||
      slide.messageCaptions.some((v) => typeof v !== "string" || v.length > 1000))) throw new Error("Invalid message captions");
    return { id, ...(slide.title !== undefined ? { title: slide.title } : {}),
      ...(slide.caption !== undefined ? { caption: slide.caption } : {}),
      chart, ...(slide.messageCaptions !== undefined ? { messageCaptions: slide.messageCaptions } : {}) };
  });
  const artifact = { title, ...(description !== undefined ? { description } : {}), slides };
  if (new TextEncoder().encode(JSON.stringify(artifact)).length > MAX_JOURNEY_BYTES) throw new Error("Journey exceeds 25 KB");
  return artifact;
}
function randomToken(bytes=24) {
  const v = new Uint8Array(bytes);
  crypto.getRandomValues(v);
  return Array.from(v, x => x.toString(16).padStart(2, "0")).join("");
}
async function digest(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, "0")).join("");
}
async function checkPublishLimit(request, env) {
  if (!env.PUBLISH_LIMIT) throw new Error("Publishing is temporarily unavailable");
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const result = await env.PUBLISH_LIMIT.limit({ key: "pub:" + ip });
  if (!result.success) throw new Error("Publishing rate limit reached. Please try later.");
}
async function publish(input, request, env) {
  const artifact = makeArtifact(input);
  const expiresIn = input.expiresIn ?? "24h";
  if (!Object.prototype.hasOwnProperty.call(TTL, expiresIn)) throw new Error("expiresIn must be 1h, 24h or 7d");
  await checkPublishLimit(request, env);
  const slug = randomToken(12);
  const deleteToken = randomToken(32);
  const expiresAt = new Date(Date.now() + TTL[expiresIn] * 1000).toISOString();
  const stored = { ...artifact, expiresAt, deleteTokenHash: await digest(deleteToken) };
  await env.JOURNEYS.put(slug, JSON.stringify(stored), { expirationTtl: TTL[expiresIn] });
  return { url: PUBLIC_BASE + slug, slug, expiresAt, expiresIn, deleteToken, free: true };
}
async function revoke(slug, token, env) {
  if (typeof slug !== "string" || !/^[a-f0-9]{24}$/.test(slug) ||
      typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw new Error("Invalid journey or deletion token");
  const existing = await env.JOURNEYS.get(slug);
  if (!existing) throw new Error("Journey not found or expired");
  const value = JSON.parse(existing);
  if (!value.deleteTokenHash || value.deleteTokenHash !== await digest(token)) throw new Error("Invalid deletion token");
  await env.JOURNEYS.delete(slug);
  return { revoked: true, slug };
}
function mcpResult(id, result) { return { jsonrpc: "2.0", id, result }; }
function mcpError(id, code, message) { return { jsonrpc: "2.0", id, error: { code, message } }; }
function toolResult(value, failed=false) {
  return { content: [{ type:"text", text: typeof value === "string" ? value : JSON.stringify(value) }], isError: failed };
}
async function readJson(request) {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > MAX_REQUEST_BYTES) throw new Error("Request body too large");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_REQUEST_BYTES) throw new Error("Request body too large");
  try { return JSON.parse(raw); } catch { throw new Error("Invalid JSON"); }
}
async function handleMcp(request, env) {
  if (request.method === "GET") return failure(request, "GET SSE streams are not supported by this stateless MCP server", 405);
  if (request.method !== "POST") return failure(request, "Method not allowed", 405);
  if (!request.headers.get("Accept")?.includes("application/json") &&
      !request.headers.get("Accept")?.includes("text/event-stream")) return failure(request, "MCP requires Accept: application/json, text/event-stream", 406);
  let body;
  try { body = await readJson(request); } catch(e) { return reply(request, mcpError(null, -32700, e.message), 400); }
  if (!body || body.jsonrpc !== "2.0" || typeof body.method !== "string" || Array.isArray(body)) {
    return reply(request, mcpError(body?.id ?? null, -32600, "Invalid JSON-RPC request"), 400);
  }
  if (body.id === undefined) return new Response(null, {status:202,headers:headers(request)});
  const version = request.headers.get("MCP-Protocol-Version");
  if (version && !SUPPORTED_PROTOCOLS.has(version)) return failure(request, "Unsupported MCP protocol version", 400);
  if (version === "2026-07-28" && (
      request.headers.get("Mcp-Method") !== body.method ||
      (body.method === "tools/call" && request.headers.get("Mcp-Name") !== body.params?.name)
    )) return failure(request, "MCP method headers do not match body", 400);

  if (body.method === "initialize") {
    const selected = SUPPORTED_PROTOCOLS.has(body.params?.protocolVersion) ? body.params.protocolVersion : "2025-11-25";
    return reply(request, mcpResult(body.id, {
      protocolVersion:selected,capabilities:{tools:{listChanged:false}},
      serverInfo:{name:"sequence-flow-journeys",version:"1.0.0"},
      instructions:"Free public short-lived journey publishing. No payment or CAI credits. Never submit private, personal, or secret content.",
    }));
  }
  if (body.method === "ping") return reply(request,mcpResult(body.id,{}));
  if (body.method === "tools/list") return reply(request,mcpResult(body.id,{tools}));
  if (body.method === "tools/call") {
    try {
      const name = body.params?.name;
      const args = body.params?.arguments || {};
      if (name === TOOL_NAME) return reply(request,mcpResult(body.id,toolResult(await publish(args,request,env))));
      if (name === "revoke_journey") return reply(request,mcpResult(body.id,toolResult(await revoke(args.slug,args.deleteToken,env))));
      return reply(request,mcpError(body.id,-32602,"Unknown tool"),400);
    } catch(e) { return reply(request,mcpResult(body.id,toolResult(e.message, true))); }
  }
  return reply(request,mcpError(body.id,-32601,"Method not found"),404);
}
async function handle(request,env) {
  const url=new URL(request.url);
  const origin=request.headers.get("Origin");
  if (origin && !ACCEPTED_ORIGINS.has(origin)) return failure(request,"Forbidden origin",403);
  if (request.method==="OPTIONS") {
    if (!ACCEPTED_ORIGINS.has(origin)) return failure(request,"Forbidden origin",403);
    return new Response(null,{status:204,headers:headers(request)});
  }
  if (url.pathname==="/mcp") return handleMcp(request,env);
  if (url.pathname==="/health" && request.method==="GET") return reply(request,{ok:true,service:"sequence-flow-journeys"});
  if (url.pathname==="/v1/journeys" && request.method==="POST") {
    if (origin!==API_ORIGIN) return failure(request,"Publishing from browsers requires the Sequence Flow origin",403);
    try { return reply(request,await publish(await readJson(request),request,env),201); }
    catch(e) {return failure(request,e.message,/rate limit/i.test(e.message)?429:400);}
  }
  if (url.pathname.startsWith("/v1/journeys/")) {
    const slug=url.pathname.slice("/v1/journeys/".length);
    if (!/^[a-z0-9-]{1,64}$/.test(slug)) return failure(request,"Not found",404);
    if (request.method==="GET") {
      const raw=await env.JOURNEYS.get(slug);
      if (!raw) return failure(request,"Not found",404);
      const value=JSON.parse(raw);
      if (value.expiresAt && Date.parse(value.expiresAt)<=Date.now()) return failure(request,"Expired",404);
      const {deleteTokenHash, ...publicValue}=value;
      return reply(request,publicValue);
    }
    if (request.method==="DELETE") {
      if (origin!==API_ORIGIN) return failure(request,"Forbidden origin",403);
      try {return reply(request,await revoke(slug,(request.headers.get("Authorization")||"").replace(/^Bearer /i,""),env));}
      catch(e){return failure(request,e.message,403);}
    }
  }
  return failure(request,"Not found",404);
}
export default { fetch:handle };
