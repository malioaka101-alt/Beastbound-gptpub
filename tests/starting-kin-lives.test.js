'use strict';
// All fixtures are disposable new characters, never an active save.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),New=require('../scripts/new-campaign'),
 Realm=require('../world/simulation'),Kin=require('../world/starting-kin'),
 Rules=require('../rules'),World=require('../rules/world'),
 Turn=require('../scripts/chat-turn');

const fresh=(seed,options={})=>New.create({
 seed,slug:'starting_kin_life_fixture',...options}).state;
for(let seed=1;seed<=72;seed++){
 const s=fresh(seed),t=Realm.peek(s).startingKin;
 A.ok(t,'New characters have a source-bound kinship record, even if alone');
 A.equal(t.source.hero,s.player.name);
 A.equal(t.source.regionId,s.player.startingContext.birthRegionId);
 A.deepEqual(t.source.knownMembers.map(x=>({
  relation:x.relation,name:x.name})),s.player.family.members);
 A.equal(Kin.verify(Realm.peek(s)),true);
 const copy=E.importGame(E.exportGame(s));
 A.deepEqual(copy,s,'Fresh family histories survive the existing save schema');
 A.deepEqual(fresh(seed),s,'Creating a fresh character reuses its original seed outcome');
 const before=E.exportGame(s),rng=s.rngState;
 const view=Rules.act(s,{system:'world',operation:'knownRelativesStatus',
  params:{}});
 A.equal(view.lifeLedgerAvailable,true);
 A.deepEqual(view.members.map(x=>x.name),
  s.player.family.members.map(x=>x.name));
 A.ok(!JSON.stringify(view).includes('personalFunds'));
 A.ok(!JSON.stringify(view).includes('rngState'));
 A.ok(!JSON.stringify(view).includes('focus'));
 A.ok(!JSON.stringify(view).includes('currentRegionId'));
 A.equal(s.rngState,rng);
 A.equal(E.exportGame(s),before,'Family inspection must not tick world or spend dice');
 A.throws(()=>Rules.act(s,{system:'world',operation:'knownRelativesStatus',
  params:{revealPrivate:true}}),/read-only/);
}
{
 const s=fresh(500011,{mode:'guided',originKind:'renowned-family',
  houseId:'openpeak',houseRelation:'birth-branch'});
 const w=Realm.peek(s),n=Object.keys(w.startingKin.people).length;
 A.ok(n>0,'Real named relatives need individually lived histories');
 A.equal(w.startingKin.source.houseId,'openpeak');
 const playerBefore={coins:s.player.coins,stamina:s.player.stamina,
  rngState:s.rngState,meridian:s.player.meridian.stage,
  arcane:s.player.arcane.circles,partnerIds:s.player.partnerIds.length};
 const home=s.player.startingContext.birthRegionId;
 const out=Kin.month(w,30);
 A.equal(out.actions,n);
 A.equal(w.startingKin.lastMonthDay,30);
 A.equal(Kin.verify(w),true);
 for(const p of Object.values(w.startingKin.people)){
  A.equal(p.history.length,2);
  A.equal(p.history[1].source.day,30);
  A.equal(p.history[1].source.before.regionId,home);
  A.equal(p.headHash,p.history.at(-1).hash);
  A.ok(p.personalFunds>=0&&p.personalFunds<=60);
  A.equal(p.birthRegionId,home);
  A.notEqual(p.name,s.player.name,'PC and kin are not one simulated actor');
 }
 A.deepEqual({coins:s.player.coins,stamina:s.player.stamina,
  rngState:s.rngState,meridian:s.player.meridian.stage,
  arcane:s.player.arcane.circles,partnerIds:s.player.partnerIds.length},
  playerBefore,'Offscreen independent relatives must not grant PC rewards or manipulate PC RNG');
 const copy=E.importGame(E.exportGame(s)),rec=copy.table.realm.startingKin;
 A.equal(Kin.verify(copy.table.realm),true);
 const before=E.exportGame(copy);
 A.equal(Kin.month(rec?copy.table.realm:w,30).actions,0,
  'The same month must never roll twice after save/reload');
 A.equal(E.exportGame(copy),before);
 const damaged=structuredClone(rec);
 damaged.people[Object.keys(damaged.people)[0]].history.at(-1).source.roll=99;
 A.equal(Kin.verify({...copy.table.realm,startingKin:damaged}),false,
  'Forged individual decisions must fail source receipt verification');
}
{
 const s=fresh(500012,{originKind:'new-organisation',homeRegion:'forge_basin'});
 const w=Realm.peek(s),initial=E.exportGame(s);
 const view=Kin.known(s,w);
 A.equal(view.lifeLedgerAvailable,true);
 A.ok(view.members.every(m=>m.lastEstablishedHome==='Forge Basin'));
 A.equal(E.exportGame(s),initial,'Offscreen address is not an observed visit');
 World.advance(s,30);
 A.equal(Realm.peek(s).startingKin.lastMonthDay,30);
 A.ok(Realm.peek(s).ticks.months>=1);
 A.equal(Kin.verify(Realm.peek(s)),true);
 A.equal(s.player.startingContext.birthRegionId,'forge_basin');
 A.equal(s.table.realm.ticks.months,1);
 const snap=E.importGame(E.exportGame(s));
 A.equal(Kin.verify(Realm.peek(snap)),true);
 A.equal(Rules.act(snap,{system:'world',operation:'knownRelativesStatus'})
  .members.length,snap.player.family.members.length);
}
{
 const s=fresh(500013),temp=FS.mkdtempSync(
  Path.join(OS.tmpdir(),'bb-kin-readonly-'));
 try{
  const file=Path.join(temp,'disposable.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const result=Turn.execute(file,{id:'source_kin_readonly_0001',
   mode:'rule',system:'world',operation:'knownRelativesStatus',params:{}});
  A.equal(result.ok,true);
  A.equal(result.applied,false);
  A.ok(result.output.rules?.lifeLedgerAvailable);
  A.equal(FS.readFileSync(file,'utf8'),original);
 }finally{FS.rmSync(temp,{recursive:true,force:true});}
}
{
 const s=E.newGame({name:'Old Format Test',seed:1931});
 const w=Realm.ensure(s),before=E.exportGame(s);
 A.equal(Kin.verify(w),true);
 A.equal(Kin.month(w,30).actions,0);
 A.equal(E.exportGame(s),before,'Old saves receive no invented relatives');
 A.equal(Kin.known(s,w).lifeLedgerAvailable,false);
}
console.log('Starting kin foundation: distinct saved people, known facts only, independent monthly decisions, real world time, no reroll, source integrity, pure inspection and no unearned skills/title/funds');
