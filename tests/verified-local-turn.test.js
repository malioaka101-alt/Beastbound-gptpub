'use strict';
// A local checkout alone is not a trusted game engine. Verify the exact
// source revision, source cleanliness, raw save, and original GitHub blob,
// then create a candidate without changing the selected save.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),CP=require('node:child_process'),
 E=require('../engine'),New=require('../scripts/new-campaign'),
 Local=require('../scripts/verified-local-turn'),
 Prepare=require('../scripts/prepare-turn-request');
const root=Path.resolve(__dirname,'..');
const git=(...args)=>CP.execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const head=git('rev-parse','HEAD'),save=Path.join(root,'saves','verified_local_fixture_001.json');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-local-fast-'));
try{
 A.equal(FS.existsSync(save),false);
 const game=New.create({seed:903118,slug:'verified_local_fixture_001',mode:'guided'}).state;
 FS.writeFileSync(save,E.exportGame(game)+'\n',{flag:'wx'});
 const original=FS.readFileSync(save,'utf8'),hash=require('../scripts/chat-turn').hash(original),
  blob=git('hash-object',save),draft=Path.join(dir,'draft.json'),out=Path.join(dir,'candidate.json');
 const request={id:'local_verified_work_903118',campaign:'verified_local_fixture_001',
  mode:'rule',system:'world',operation:'wait',params:{minutes:12},
  scene:'A newly recorded local scene after twelve real engine minutes.'};
 FS.writeFileSync(draft,JSON.stringify(request));
 const prepared=Prepare.prepare(save,draft);
 A.equal(prepared.expectedHash,hash);
 const proof={root,sourceHead:head,savePath:save,saveBlobSha:blob,saveHash:hash};
 A.deepEqual(Local.verify(proof).verifiedHead,head);
 A.throws(()=>Local.verify({...proof,sourceHead:'0'.repeat(40)}),/engine commit differs/);
 A.throws(()=>Local.verify({...proof,saveHash:'0'.repeat(64)}),/differs/);
 const next=Local.main(['--save',save,'--request',draft,'--out',out,
  '--source-head',head,'--save-blob',blob,'--save-sha256',hash]);
 A.equal(next.ok,true);
 A.equal(next.applied,true);
 A.equal(FS.readFileSync(save,'utf8'),original,
  'Local computation cannot silently overwrite the selected GitHub-owned save');
 A.equal(E.importGame(FS.readFileSync(out,'utf8')).world.minutes,game.world.minutes+12);
 A.equal(E.importGame(FS.readFileSync(out,'utf8')).chatRuntime.scene,request.scene);
 A.throws(()=>Local.main(['--save',save,'--request',draft,'--out',out,
  '--source-head',head,'--save-blob',blob,'--save-sha256',hash]),/fresh path/);
 const old=Prepare.prepare(save,draft);
 A.equal(old.expectedHash,hash);
 FS.writeFileSync(draft,JSON.stringify({...request,expectedHash:'0'.repeat(64)}));
 A.throws(()=>Prepare.prepare(save,draft),/stale/);
}finally{FS.rmSync(dir,{recursive:true,force:true});FS.rmSync(save,{force:true});}
console.log('Verified local Node: exact source, source cleanliness, original save blob/hash, one candidate and no unauthorised live-save mutation');
