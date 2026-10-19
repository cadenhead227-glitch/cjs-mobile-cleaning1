import assert from 'node:assert/strict';
import{spawn}from'node:child_process';
const port=19327,origin='http://127.0.0.1:'+port;
const env={...process.env,SITE_ORIGIN:origin,NEXT_TELEMETRY_DISABLED:'1'};for(const key of ['DATABASE_URL','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_ANON_KEY','SUPABASE_SECRET_KEY','SUPABASE_SERVICE_ROLE_KEY','OWNER_EMAIL'])delete env[key];
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env,stdio:['ignore','pipe','pipe']});let output='';for(const stream of[child.stdout,child.stderr])stream.on('data',x=>{output+=x;});
try{let ready=false;for(let i=0;i<80;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}assert.ok(ready,output.slice(-1000));
for(const path of['/','/exterior-cleaning','/pricing','/about','/service-area','/book','/results','/privacy','/service-policies','/guides','/owner','/robots.txt','/sitemap.xml','/favicon.svg','/manifest.webmanifest','/caden-washing-640.webp']){const response=await fetch(origin+path);assert.equal(response.status,200,path);if(path==='/'){const html=await response.text();assert.ok(html.includes('CJ’s Mobile Cleaning'));assert.ok(html.includes('/caden-washing-960.webp'));assert.ok(!html.includes('JC’s Mobile Detailing'));assert.equal(response.headers.get('x-frame-options'),'DENY');}if(path==='/sitemap.xml')assert.ok((await response.text()).includes(origin+'/pricing'));}
assert.equal((await fetch(origin+'/api/owner')).status,403);assert.equal((await fetch(origin+'/api/owner',{headers:{'oai-authenticated-user-email':'owner@example.test','cf-access-jwt-assertion':'forged'}})).status,403);
console.log('PASS: production Next server public routes, metadata, hero image, security headers, and anonymous/forged owner rejection.');
}finally{child.kill('SIGTERM');await new Promise(r=>child.on('exit',r));}
