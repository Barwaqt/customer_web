import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
for(const stale of [false,true])test(`deployment ${stale?'rejects a stale served revision':'builds and restarts the expected revision'}`,()=>{
 const root=mkdtempSync(join(tmpdir(),'barwaqt-web-deploy-'));
 try{
  const app=join(root,'app'),bin=join(root,'bin'),release=join(root,'release'),log=join(root,'calls');
  for(const dir of [app,bin,release])mkdirSync(dir);
  const archive=join(root,'release.tar.gz'),revision='a'.repeat(40);
  assert.equal(spawnSync('tar',['-czf',archive,'-C',release,'.']).status,0);
  for(const name of ['npm','node','pm2','rsync','curl','sleep'])writeFileSync(join(bin,name),`#!/bin/bash
name=\${0##*/}
printf '%s\\n' "$name $*" >> "$TEST_LOG"
if [[ "$name" = npm && "$*" = 'run build' ]]; then mkdir -p .next/static; fi
if [[ "$name" = curl && "$*" = *api/deployment* ]]; then printf '%s' "$TEST_SERVED"; fi
`,{mode:0o700});
  let script=readFileSync(new URL('../scripts/deploy.sh',import.meta.url),'utf8');
  script=script.replace('app_dir=/var/www/barwaqt.com',`app_dir='${app}'`).replace('/var/www/.barwaqt-web-build.XXXXXXXX',root+'/build.XXXXXXXX');
  script=script.replace(/if \[\[ -s "\$HOME\/\.nvm\/nvm.sh" \]\]; then[\s\S]*?\nfi\n/,'');
  const result=spawnSync('bash',['-s','--',archive,'barwaqt-customer','3000',revision],{input:script,encoding:'utf8',env:{...process.env,PATH:bin+':'+process.env.PATH,TEST_LOG:log,TEST_SERVED:stale?'old':revision}});
  const calls=readFileSync(log,'utf8').split('\n');
  assert.ok(calls.indexOf('npm run build')>=0);
  const restart=calls.indexOf('pm2 startOrRestart ecosystem.config.cjs --only barwaqt-customer --update-env');
  assert.ok(restart>calls.indexOf('npm run build'));
  assert.ok(calls.some(c=>c.startsWith('rsync -ac --delete --exclude=static/')));
  assert.equal(result.status,stale?1:0,result.stderr);
  assert.equal(calls.includes('pm2 save'),!stale);
  if(!stale)assert.equal(readFileSync(join(app,'.deployed-revision'),'utf8').trim(),revision);
 }finally{rmSync(root,{recursive:true,force:true});}
});
