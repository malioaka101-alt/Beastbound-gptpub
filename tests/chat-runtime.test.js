'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'), os=require('node:os'),path=require('node:path');
const E=require('../engine.js'),P=require('../panels.js'),R=require('../scripts/chat-turn.js');
const Scene=require('./scene-witness-fixture');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'bb-chat-'));
const save=path.join(temp,'save.json');
const seed=()=>fs.writeFileSync(save,E.exportGame(E.newGame({name:'Aerin Marsh',seed:1355150487,path:'meridian'}))+'\n');
try{
 seed();let s=E.importGame(fs.readFileSync(save,'utf8'));
 const p=P.core(s);assert(p.split('\n').every(l=>Array.from(l).length===34));
 assert(p.includes('08:00'));assert(p.includes('STA'));assert(p.includes('QI'));
 for(const panel of ['status','character','bag','quests','people','world','journal','tamer','research'])assert(P.full(s,panel).split('\n').every(l=>Array.from(l).length===34));
 const baseline=fs.readFileSync(save,'utf8'),pre=E.importGame(baseline);
 for(const [query,needle] of [
  ['look','Morrowfen Crossing'],['who is here','Morrowfen Crossing'],
  ['routes','Morrowfen Crossing'],['help','travel'],
  ['inventory','Known inventory information'],
  ['status','Known status information'],['journal','Known journal information']
 ]){
  const out=R.execute(save,{id:'read_'+query.replaceAll(' ','_')+'_001',
   mode:'act',action:query});
  assert.equal(out.ok,true);assert.equal(out.applied,false);
  assert.match(out.message,new RegExp(needle));
  assert.equal(fs.readFileSync(save,'utf8'),baseline);
  assert.equal(out.stateHash,R.hash(baseline));
  if(query==='look'){
   assert(out.output.scene.exits.some(x=>x.id==='fen'));
   assert(out.output.scene.nearbyPeople.some(x=>x.name==='Elira Moss'));
   assert.equal(out.output.scene.nearbyCreature,null);
   assert.equal(out.output.scene.focus.length,0);
  }
  if(query==='help'){
   assert(!out.message.includes('foraging and dialogue'));
   assert.match(out.message,/generic forage/);
  }
 }
 assert.equal(pre.log.length,E.importGame(fs.readFileSync(save,'utf8')).log.length);
 let r=R.execute(save,{id:'turn_0001',mode:'status'});assert.equal(r.applied,false);
 r=R.execute(save,{id:'turn_0002',mode:'act',action:'travel fen'});assert.equal(r.ok,true);assert.equal(r.applied,true);
 const digest=r.stateHash,now=E.importGame(fs.readFileSync(save,'utf8'));assert.equal(now.world.location,'fen');
 const fenLook=R.execute(save,{id:'fen_look_00001',mode:'act',action:'surroundings'});
 assert.equal(fenLook.applied,false);
 assert.equal(fenLook.output.scene.location,'fen');
 assert.equal(fenLook.output.scene.exits.length,E.LOCATIONS.fen.exits.length);
 assert.equal(R.hash(fs.readFileSync(save,'utf8')),digest);
 const conflict=R.execute(save,{id:'turn_0002',mode:'act',action:'travel forest'});assert.equal(conflict.ok,false);assert.equal(conflict.applied,false);assert.match(conflict.error,/already used/);
 const dup=R.execute(save,{id:'turn_0002',mode:'act',action:'travel fen'});assert.equal(dup.duplicate,true);assert.equal(dup.applied,false);
 assert.equal(R.hash(fs.readFileSync(save,'utf8')),digest);
 const bad=R.execute(save,{id:'turn_0003',mode:'act',action:'travel ruins',expectedHash:'wrong'});assert.equal(bad.ok,false);assert.equal(bad.applied,false);
 const observed=E.importGame(fs.readFileSync(save,'utf8'));
 Scene.record(observed,'reed_survey_0001',{skill:'survival',attribute:'wis',dc:14,
  minutes:15,label:'Survey reed bank'});
 fs.writeFileSync(save,E.exportGame(observed)+'\n');
 const ch=R.execute(save,{id:'turn_0004',mode:'check',checkId:'reed_survey_0001'});assert.equal(ch.ok,true);assert(ch.output.check.roll>=1 && ch.output.check.roll<=20);assert(ch.events.some(x=>x.type==='roll'));
 const t=E.importGame(fs.readFileSync(save,'utf8'));assert(t.world.minutes>now.world.minutes);assert.equal(t.chatRuntime.revision,2);
 const cp=R.execute(save,{id:'turn_0005',mode:'checkpoint',scene:'At the damaged eastern reed bank',summary:'Read the tracks, evidence recorded.',focus:['Tracks near the river']});assert(cp.ok);assert(cp.panel.includes('Tracks near the river'));
 // A remote/unqualified craft cannot roll or consume supplies at the fen.
 // The source-backed recipe is tested separately at both verified clean medical workspaces.
 const craftBefore=fs.readFileSync(save,'utf8');
 for(const action of ['craft field_poultice','CRAFT   field poultice','craft']){
   assert.throws(()=>R.execute(save,{id:'craft_guard_0001',mode:'act',action}),/real clean infirmary or academy clinic|Unsupported crafting recipe/);
   assert.equal(fs.readFileSync(save,'utf8'),craftBefore,'rejected crafting must not change save or RNG');
 }
 const err=R.execute(save,{id:'turn_0006',mode:'act',action:'invent free legendary dragon'});assert.equal(err.ok,true);assert.equal(err.applied,false);assert.equal(err.output.gmAdjudication.status,'unresolved');assert.equal(err.output.gmAdjudication.noOutcomeClaimed,true);
 assert.equal(E.importGame(fs.readFileSync(save,'utf8')).chatRuntime.revision,3);
 assert.throws(()=>R.execute(save,{id:'illegal/path',mode:'act',action:'rest'}));
 console.log('Chat-turn runtime tests passed (34-wide panels, checks, idempotent state, revision and stale-write protection)');
}finally{fs.rmSync(temp,{recursive:true,force:true});}