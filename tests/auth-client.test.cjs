/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(status,body){const exports={};const source=fs.readFileSync(require('node:path').join(__dirname,'../app/components/auth-client.ts'),'utf8');vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,fetch:async()=>({ok:status<400,status,text:async()=>body})});return exports;}
test('Nginx HTML errors produce a safe retry message, not a JSON syntax error',async()=>{const {authRequest,AuthError}=load(502,'<html><h1>502 Bad Gateway</h1></html>');await assert.rejects(authRequest('login',{}),e=>e instanceof AuthError&&e.status===502&&e.message.includes('temporarily unavailable'));});
test('HTML rate limiting is reported correctly',async()=>{const {authRequest}=load(429,'<html>Too many requests</html>');await assert.rejects(authRequest('login',{}),e=>e.status===429&&e.message.includes('Too many'));});
test('API credential errors retain their message and status',async()=>{const {authRequest}=load(401,JSON.stringify({error:{message:'Invalid credentials'}}));await assert.rejects(authRequest('login',{}),e=>e.status===401&&e.message==='Invalid credentials');});
test('successful authentication returns user data',async()=>{const {authRequest}=load(200,JSON.stringify({data:{user:{id:'customer'}}}));assert.equal((await authRequest('login',{})).user.id,'customer');});
