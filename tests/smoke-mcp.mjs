// Public, non-confidential integration test. Never log the private deletion token.
const endpoint = "https://sequence-flow-journeys.icy-dream-7fdb.workers.dev/mcp";
const api = "https://sequence-flow-journeys.icy-dream-7fdb.workers.dev/v1/journeys/";
async function rpc(id,method,params={}) {
  const response = await fetch(endpoint,{
    method:"POST",
    headers:{"Content-Type":"application/json","Accept":"application/json, text/event-stream","MCP-Protocol-Version":"2025-11-25"},
    body:JSON.stringify({jsonrpc:"2.0",id,method,params}),
  });
  if(!response.ok)throw new Error("MCP "+method+" returned HTTP "+response.status);
  const data=await response.json();
  if(data.error)throw new Error("MCP "+method+" failed: "+data.error.message);
  return data.result;
}
async function main(){
  const initialized=await rpc(1,"initialize",{protocolVersion:"2025-11-25",capabilities:{},clientInfo:{name:"ci-smoke",version:"1.0"}});
  if(!initialized.capabilities?.tools)throw new Error("tools capability missing");
  const discovered=await rpc(2,"tools/list");
  if(!discovered.tools.some(tool=>tool.name==="publish_journey"))throw new Error("publish_journey not discovered");
  const output=await rpc(3,"tools/call",{name:"publish_journey",arguments:{
    title:"Integration smoke test",expiresIn:"1h",
    slides:[{id:"first",title:"First",chart:"sequenceDiagram\n  A->>B: Hello"}]
  }});
  if(output.isError)throw new Error("Publishing failed: "+output.content[0].text);
  const published=JSON.parse(output.content[0].text);
  if(!published.free || !published.url?.startsWith("https://sequence-flow.canadian-ai.app/journey?slug=") ||
     !published.deleteToken || !published.expiresAt)throw new Error("Unexpected publishing result");
  let readOk=false;
  for(let attempt=0;attempt<5;attempt++){
    const read=await fetch(api+published.slug);
    if(read.ok){
      const doc=await read.json();
      if(doc.title!=="Integration smoke test" || doc.deleteTokenHash)throw new Error("Invalid public read response");
      readOk=true;break;
    }
    await new Promise(resolve=>setTimeout(resolve,1500));
  }
  if(!readOk)throw new Error("Published journey was not readable");
  const revoked=await rpc(4,"tools/call",{name:"revoke_journey",arguments:{slug:published.slug,deleteToken:published.deleteToken}});
  if(revoked.isError || !JSON.parse(revoked.content[0].text).revoked)throw new Error("Revocation failed");
  console.log("Success: MCP discovery, free publication, read and revocation");
}
await main();
