import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {state,context} from './state.mjs';
process.env.NODE_ENV='production';
process.env.DATABASE_URL='postgres://synthetic:synthetic@localhost/test';
process.env.SUPABASE_URL='https://synthetic.supabase.co';process.env.SUPABASE_PUBLISHABLE_KEY='sb_publishable_synthetic';process.env.SUPABASE_SECRET_KEY='sb_secret_synthetic';process.env.OWNER_EMAIL='owner@example.test';process.env.SITE_ORIGIN='http://127.0.0.1:8787';
const directory=await mkdtemp(join(tmpdir(),'cjs-postgres-'));state.database=new PGlite(directory);
const storage=new Map(),base=process.env.SITE_ORIGIN,originalFetch=globalThis.fetch;let lastWrites=[];
try{
 await state.database.exec('CREATE ROLE anon;CREATE ROLE authenticated;');await state.database.exec(await readFile('supabase/SETUP.sql','utf8'));await state.database.exec('SET ROLE anon');await assert.rejects(()=>state.database.query('SELECT * FROM bookings'),/permission denied/);await state.database.exec('RESET ROLE');
 const routes={};for(const name of ['public','book','owner','upload','photo','session'])routes['/api/'+name]=await import('../app/api/'+name+'/route.ts');
 globalThis.fetch=async(input,init)=>{
  const url=new URL(typeof input==='string'?input:input.url);
  if(url.origin===base){const request=new Request(url,init);const store={cookie:request.headers.get('cookie')||'',writes:[]};const result=await context.run(store,()=>routes[url.pathname][request.method](request));lastWrites=store.writes;return result;}
  if(url.origin===process.env.SUPABASE_URL){const request=new Request(url,init);
   if(url.pathname==='/auth/v1/token'){const body=await request.json();return body.email==='owner@example.test'&&body.password==='synthetic-password'?Response.json({access_token:'valid-owner-token',expires_in:3600}):Response.json({error:'invalid'}, {status:400});}
   if(url.pathname==='/auth/v1/user'){const valid=request.headers.get('authorization')==='Bearer valid-owner-token';return valid?Response.json({id:'synthetic-owner',email:'owner@example.test',email_confirmed_at:'2026-01-01'}):Response.json({error:'invalid'},{status:401});}
   const key=url.pathname.split('/storage/v1/object/')[1];if(key){if(request.headers.get('apikey')!=='sb_secret_synthetic'||request.headers.has('authorization'))return new Response(null,{status:403});if(request.method==='POST'){storage.set(key,{body:await request.arrayBuffer(),type:request.headers.get('content-type')});return Response.json({ok:true});}const object=storage.get(key);return object?new Response(object.body,{headers:{'Content-Type':object.type}}):new Response(null,{status:404});}
  }
  throw Error('External network disabled in tests: '+url.origin);
 };
 const login=await fetch(base+'/api/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'owner@example.test',password:'synthetic-password'})});assert.equal(login.status,200);assert.equal(lastWrites[0].options.httpOnly,true);assert.equal(lastWrites[0].options.sameSite,'lax');assert.equal(lastWrites[0].options.secure,true);assert.equal(lastWrites[0].options.maxAge,3600);
 const badLogin=await fetch(base+'/api/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'other@example.test',password:'synthetic-password'})});assert.equal(badLogin.status,401);
 const logout=await fetch(base+'/api/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded',Cookie:'cjs_owner_session=valid-owner-token'},body:'action=logout'});assert.equal(logout.status,303);assert.equal(lastWrites[0].deleted,true);
 await import('./verify-booking.mjs');
 const held=(await state.database.query("SELECT b.id,s.start,s.\"end\" FROM bookings b JOIN slots s ON s.id=b.slot_id WHERE b.status='booked' LIMIT 1")).rows[0];assert.ok(held);
 const conflictStart=new Date(Date.parse(held.start)+1800000).toISOString(),conflictEnd=new Date(Date.parse(held.end)+1800000).toISOString();
 await state.database.query('INSERT INTO slots(id,start,"end",buffer,enabled) VALUES ($1,$2,$3,0,1)',['conflicting-option',conflictStart,conflictEnd]);
 await assert.rejects(()=>state.database.query("INSERT INTO bookings(id,slot_id,name,email,phone,zip,vehicle,condition,price,upload_hash,created_at) SELECT 'direct-conflict','conflicting-option',name,email,phone,zip,vehicle,condition,price,upload_hash,created_at FROM bookings WHERE id=$1",[held.id]),/overlapping_reservations|exclusion/);
 const rows=await state.database.query('SELECT count(*)::int AS n FROM bookings');await state.database.close();state.database=new PGlite(directory);const restored=await state.database.query('SELECT count(*)::int AS n FROM bookings');assert.equal(restored.rows[0].n,rows.rows[0].n);
 console.log('PASS: PostgreSQL schema, exclusion constraint, API scheduling races, transactional owner changes, Supabase auth contract/cookie protections, private storage contract, and persistence across engine restart.');
}finally{globalThis.fetch=originalFetch;await state.database.close();await rm(directory,{recursive:true,force:true});}
