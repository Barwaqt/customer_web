/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(fetch){const context=vm.createContext({fetch,AbortSignal,setTimeout:()=>0});const code=ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../app/lib/session-refresh.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;function module(){context.exports={};vm.runInContext('{'+code+'}',context);return context.exports;}return [module(),module()];}
test('auth and commerce share one rotation for concurrent and late requests',async()=>{let calls=0;const tokens={accessToken:'new',refreshToken:'rotated',expiresIn:900};const [auth,commerce]=load(async()=>{calls++;await new Promise(r=>setImmediate(r));return {ok:true,status:200,json:async()=>({data:tokens})};});const values=await Promise.all([auth.refreshSession('api','old'),commerce.refreshSession('api','old')]);assert.equal(calls,1);assert.equal(values[0],tokens);assert.equal(values[1],tokens);assert.equal(await auth.refreshSession('api','old'),tokens);assert.equal(calls,1);});
test('temporary refresh failures can retry without invalidating the session',async()=>{let calls=0;const [auth]=load(async()=>{calls++;return calls===1?{ok:false,status:503}:{ok:true,status:200,json:async()=>({data:{accessToken:'ok'}})};});await assert.rejects(auth.refreshSession('api','old'));assert.equal((await auth.refreshSession('api','old')).accessToken,'ok');assert.equal(calls,2);});
test('invalid refresh tokens are explicitly rejected',async()=>{const [auth]=load(async()=>({ok:false,status:401}));assert.equal(await auth.refreshSession('api','bad'),null);});
