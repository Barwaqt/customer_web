/* eslint-disable @typescript-eslint/no-require-imports -- Node regression harness loads the TypeScript route with mocked Next.js dependencies. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app/api/auth/[action]/route.ts'),'utf8');
function harness(data){
 const calls=[],cookies=[];
 const exports={};
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,process:{env:{}},URL,AbortSignal,require(name){
  if(name==='../../../lib/session-refresh')return {refreshSession:async()=>null};
  if(name==='next/server')return {NextResponse:{json:(body,options)=>({body,...options})}};
  if(name==='next/headers')return {cookies:async()=>({get:()=>undefined,set:(...args)=>cookies.push(args),delete:()=>{}})};
  throw Error(name);
 },fetch:async(url,options)=>{calls.push({url,...options});return {ok:true,status:200,text:async()=>JSON.stringify({data})};}});
 return {calls,cookies,post:(action,body)=>exports.POST({method:'POST',url:'http://localhost:3000/api/auth/'+action,headers:new Headers({origin:'http://localhost:3000'}),json:async()=>body},{params:Promise.resolve({action})})};
}
for(const [action,body] of [['resend-verification',{email:'customer@example.test'}]]){
 test(action+' forwards to the backend',async()=>{
  const h=harness({message:'Success'});const result=await h.post(action,body);
  assert.equal(result.status,200);assert.equal(h.calls[0].url,'http://localhost:4000/api/v1/auth/'+action);
  assert.deepEqual(JSON.parse(h.calls[0].body),body);assert.equal(h.cookies.length,0);
 });
}
test('verify-email forwards the code and signs the customer in',async()=>{
 const data={message:'Email verified. You are signed in.',email:'customer@example.test',accessToken:'access',refreshToken:'refresh',expiresIn:900,user:{id:'customer-1',email:'customer@example.test',role:'CUSTOMER'}};
 const h=harness(data);const result=await h.post('verify-email',{code:'482913'});
 assert.equal(result.status,200);assert.equal(h.calls[0].url,'http://localhost:4000/api/v1/auth/verify-email');
 assert.deepEqual(JSON.parse(h.calls[0].body),{code:'482913'});
 assert.deepEqual(h.cookies.map(c=>c[0]),['barwaqt_customer_access','barwaqt_customer_refresh']);
 assert.equal(result.body.data.user.email,'customer@example.test');assert.equal(result.body.data.message,data.message);
});
test('signup preserves verification response without creating login cookies',async()=>{
 const data={message:'Check your email',email:'customer@example.test',verificationSent:true};
 const h=harness(data);const result=await h.post('register',{email:data.email});
 assert.equal(result.status,200);assert.equal(JSON.stringify(result.body.data),JSON.stringify(data));assert.equal(h.cookies.length,0);
});
test('unknown auth actions remain blocked',async()=>{
 const h=harness({});assert.equal((await h.post('unknown',{})).status,404);assert.equal(h.calls.length,0);
});
