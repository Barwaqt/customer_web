import {refreshSession} from '../../../lib/session-refresh';
import {NextRequest,NextResponse} from 'next/server';
import {cookies} from 'next/headers';
const portal:string='customer';
const base=(process.env.API_URL||'http://localhost:4000/api/v1').replace(/\/$/,'');
// Nginx forwards the public Host and X-Forwarded-Proto, so the origin this
// deployment is actually served from is accepted even though the upstream
// request targets 127.0.0.1. A foreign Origin still cannot match.
function sameOrigin(req:NextRequest){
 const header=req.headers.get('origin');
 if(!header||header==='null')return false;
 let given:string;try{given=new URL(header).origin;}catch{return false;}
 const url=new URL(req.url);
 const host=req.headers.get('host')||url.host;
 const proto=(req.headers.get('x-forwarded-proto')||url.protocol.replace(':','')).split(',')[0].trim();
 const configured=process.env.APP_ORIGIN||(process.env.NODE_ENV==='production'?'https://barwaqt.com':url.origin);
 return [configured,`${proto}://${host}`].some(value=>{try{return new URL(value).origin===given;}catch{return false;}});
}
async function proxy(req:NextRequest,ctx:{params:Promise<{path:string[]}>}){
 const {path}=await ctx.params;
 if(path.some(p=>!p||p==='.'||p==='..'||!/^[a-zA-Z0-9_-]+$/.test(p)))return NextResponse.json({error:{message:'Invalid path'}},{status:400});
 const route='/'+path.join('/');
 const allowed=portal==='customer'?['catalog','customer','orders','notifications']:['catalog','vendor','orders','notifications'];
 if(!allowed.includes(path[0]))return NextResponse.json({error:{message:'Route not found'}},{status:404});
 if(req.method!=='GET'&&!sameOrigin(req))return NextResponse.json({error:{message:'Invalid request origin'}},{status:403});
 const jar=await cookies();const prefix=`barwaqt_${portal}`;let access=jar.get(prefix+'_access')?.value;
 const opts={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/'};
 async function refresh(){const token=jar.get(prefix+'_refresh')?.value;if(!token)return false;const data=await refreshSession(base,token);if(!data){jar.delete(prefix+'_access');jar.delete(prefix+'_refresh');return false;}access=data.accessToken;jar.set(prefix+'_access',data.accessToken,{...opts,maxAge:data.expiresIn});jar.set(prefix+'_refresh',data.refreshToken,{...opts,maxAge:30*86400});return true;}
 try{const publicRequest=path[0]==='catalog'&&(req.method==='GET'||(route==='/catalog/searches'&&req.method==='POST'));if(!publicRequest&&!access&&!await refresh())return NextResponse.json({error:{message:'Please sign in to continue'}},{status:401});
 const body=['GET','HEAD'].includes(req.method)?undefined:await req.text();
 const send=()=>fetch(base+route+req.nextUrl.search,{method:req.method,headers:{'Content-Type':'application/json',...(!publicRequest&&access?{Authorization:`Bearer ${access}`} : {}),...(req.headers.get('idempotency-key')?{'Idempotency-Key':req.headers.get('idempotency-key')!}:{})},body:body||undefined,cache:'no-store',signal:AbortSignal.timeout(20000)});
 let r=await send();if(!publicRequest&&r.status===401&&await refresh())r=await send();
 if(r.status===204)return new NextResponse(null,{status:204});
 const text=await r.text();let json;try{json=JSON.parse(text);}catch{json={error:{message:r.status===429?'Too many requests. Please wait and retry.':'The API returned an unexpected response'}};}
 return NextResponse.json(json,{status:r.status,headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:{message:'Unable to reach Barwaqt. Please retry.'}},{status:503});}
}
export const GET=proxy;export const POST=proxy;export const PUT=proxy;export const PATCH=proxy;export const DELETE=proxy;
