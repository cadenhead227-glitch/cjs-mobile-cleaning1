import {cookies} from 'next/headers';
import {authSettings,sessionCookie,verifyOwnerSession} from '@/lib/owner-auth';
import {failure,json,sameOrigin,limitRequest,readJson} from '@/lib/server';
export async function POST(req:Request){try{sameOrigin(req);const store=await cookies();
 if(req.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')){store.delete(sessionCookie);return Response.redirect(new URL('/owner',req.url),303);}
 await limitRequest(req,'login',10);const p=await readJson(req,3000),s=authSettings();if(!s)return json({error:'Owner login is not configured yet.'},503);
 if(typeof p.email!=='string'||p.email.toLowerCase()!==s.owner||typeof p.password!=='string'||p.password.length>256)return json({error:'Unable to sign in with those details.'},401);
 const r=await fetch(s.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:s.key,'Content-Type':'application/json'},body:JSON.stringify({email:p.email,password:p.password}),cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!r.ok)return json({error:'Unable to sign in with those details.'},401);const session=await r.json();
 if(typeof session.access_token!=='string'||!await verifyOwnerSession(session.access_token))return json({error:'Owner access only.'},403);
 store.set(sessionCookie,session.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production'||new URL(req.url).protocol==='https:',sameSite:'lax',path:'/',maxAge:Math.min(Number(session.expires_in)||3600,3600)});
 return json({ok:true});
}catch(e){return failure(e,503);}}
