import { describe, expect, it, vi } from "vitest"
import handler from "../services/journey-publisher/worker"

function fixture() {
  const values=new Map<string,string>();
  const env={
    JOURNEYS: {
      get: async (key:string)=>values.get(key)??null,
      put: async (key:string,value:string,opts:{expirationTtl:number})=>{expect(opts.expirationTtl).toBeGreaterThanOrEqual(3600);values.set(key,value)},
      delete: async (key:string)=>{values.delete(key)},
    },
    PUBLISH_LIMIT:{limit:async()=>({success:true})}
  };
  const options={headers:{"Origin":"https://sequence-flow.canadian-ai.app","Accept":"application/json, text/event-stream","Content-Type":"application/json","CF-Connecting-IP":"127.0.0.1"}};
  return {values,env,options,call:(route:string,init:RequestInit={})=>(handler as any).fetch(new Request("https://example.test"+route,{...init,headers:{...options.headers,...(init.headers||{})}}),env)};
}
const example={title:"Example",slides:[{id:"start",chart:"sequenceDiagram\n  A->>B: Hello"}]};
describe("free HTTP/MCP journey publisher",()=>{
  it("publishes free URL with TTL, reads without exposing deletion token and revokes",async()=>{
    const {call,values}=fixture();
    const publish=await call("/v1/journeys",{method:"POST",body:JSON.stringify({...example,expiresIn:"1h"})});
    expect(publish.status).toBe(201);
    const data=await publish.json();
    expect(data.free).toBe(true);expect(data.url).toContain("?slug=");
    expect(values.size).toBe(1);
    const get=await call("/v1/journeys/"+data.slug);
    const json=await get.json();
    expect(json.title).toBe("Example");expect(json).not.toHaveProperty("deleteTokenHash");
    const removed=await call("/v1/journeys/"+data.slug,{method:"DELETE",headers:{Authorization:"Bearer "+data.deleteToken}});
    expect(removed.status).toBe(200);expect(values.size).toBe(0);
  });
  it("does not accept publishing from arbitrary browser origins",async()=>{
    const {call}=fixture();
    const res=await call("/v1/journeys",{method:"POST",headers:{Origin:"https://attacker.test"},body:JSON.stringify(example)});
    expect(res.status).toBe(403);
  });
  it("allows trusted MCP browser preflight but not cross-origin browser publishing",async()=>{
    const {call}=fixture();
    const options=await call("/mcp",{method:"OPTIONS",headers:{Origin:"https://chatgpt.com"}});
    expect(options.status).toBe(204);
    expect(options.headers.get("Access-Control-Allow-Origin")).toBe("https://chatgpt.com");
    const post=await call("/v1/journeys",{method:"POST",headers:{Origin:"https://chatgpt.com"},body:JSON.stringify(example)});
    expect(post.status).toBe(403);
  });
  it("rejects unsupported diagram types and overly long content",async()=>{
    const {call}=fixture();
    const invalid=await call("/v1/journeys",{method:"POST",body:JSON.stringify({...example,slides:[{id:"start",chart:"flowchart TB\n A-->B"}]})});
    expect(invalid.status).toBe(400);
    const large=await call("/v1/journeys",{method:"POST",body:JSON.stringify({...example,description:"a".repeat(30000)})});
    expect(large.status).toBe(400);
  });
  it("supports the MCP handshake, discovery, free publishing and revocation",async()=>{
    const {call}=fixture();
    const rpc=(id:number,method:string,params:any={})=>call("/mcp",{method:"POST",body:JSON.stringify({jsonrpc:"2.0",id,method,params})});
    const init=await (await rpc(1,"initialize",{protocolVersion:"2025-11-25"})).json();
    expect(init.result.capabilities.tools).toBeDefined();
    const listed=await (await rpc(2,"tools/list")).json();
    expect(listed.result.tools.map((t:any)=>t.name)).toContain("publish_journey");
    const result=await (await rpc(3,"tools/call",{name:"publish_journey",arguments:example})).json();
    const published=JSON.parse(result.result.content[0].text);
    expect(published.free).toBe(true);
    const removed=await (await rpc(4,"tools/call",{name:"revoke_journey",arguments:{slug:published.slug,deleteToken:published.deleteToken}})).json();
    expect(JSON.parse(removed.result.content[0].text).revoked).toBe(true);
  });
  it("honors rate limiter",async()=>{
    const {env,call}=fixture();
    env.PUBLISH_LIMIT.limit=async()=>({success:false});
    const res=await call("/v1/journeys",{method:"POST",body:JSON.stringify(example)});
    expect(res.status).toBe(429);
  });
});
