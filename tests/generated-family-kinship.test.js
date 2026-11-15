'use strict';
// Regression: a named family connection and a legal/household responsibility
// are independent, sealed pre-game facts. Never regenerate older saves.
const A=require('node:assert/strict');
const Crypto=require('node:crypto');
const Engine=require('../engine');
const New=require('../scripts/new-campaign');
const Kin=require('../world/origin-relatives');
const Realm=require('../world/simulation');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fresh=(seed,age)=>New.create({seed,slug:'family_kinship_fixture',
 mode:'guided',age,originKind:'ordinary',homeRegion:'morrowfen_basin',
 startLocation:'crossing'}).state;
let parentFamily=0,grandparentFamily=0,fosterFamily=0,adultRelatives=0,siblings=0;
for(const age of [10,37,70]){
 for(let seed=1;seed<=70;seed++){
  const s=fresh(seed,age),repeated=fresh(seed,age);
  A.deepEqual(s,repeated,'An identical seed must create identical kinship and NPC sources');
  const saved=Engine.importGame(Engine.exportGame(s));
  const relatives=saved.player.family.members,kin=Kin.ensure(Realm.peek(saved));
  A.deepEqual(relatives,s.player.family.members,'Actual kinship must survive save/reload');
  A.equal(Object.keys(kin.people).length,relatives.length);
  const context=saved.player.startingContext.knownHouseholdMembers;
  A.deepEqual(context,relatives.map(m=>({name:m.name,relation:m.relation,
   kinship:m.kinship,householdRole:m.householdRole})));
  const shown=Kin.status(saved).relatives;
  A.equal(new Set(relatives.map(m=>m.name)).size,relatives.length);
  for(const [i,m] of relatives.entries()){
   A.equal(typeof m.kinship,'string');
   A.ok(m.kinship.length>=3&&m.kinship!=='guardian'&&m.kinship!=='second guardian');
   A.equal(m.householdRole,m.relation);
   const actor=kin.people['kin_'+(i+1)];
   A.equal(Kin.verify(Realm.peek(saved),actor),true);
   A.equal(actor.kinship,m.kinship);
   A.equal(actor.householdRole,m.householdRole);
   A.equal(actor.source.kinship,m.kinship);
   A.equal(actor.source.householdRole,m.householdRole);
   A.equal(shown[i].relation,m.kinship,'Status must say mother/aunt/etc, not only guardian');
   A.equal(shown[i].householdRole,m.relation);
   A.equal(Kin.identity(Realm.peek(saved),actor.actorId).kinship,m.kinship);
   if(/mother|father|parent/.test(m.kinship))parentFamily++;
   if(/grandmother|grandfather|grandparent/.test(m.kinship))grandparentFamily++;
   if(/foster/.test(m.kinship))fosterFamily++;
   if(m.householdRole==='sibling')siblings++;
   if(age>=55&&/adult |younger /.test(m.kinship))adultRelatives++;
  }
  if(relatives.length)A.match(saved.player.history.familySituation,/known family ties:/);
  if(age<16)A.notEqual(saved.player.family.household,'independent household',
   'A ten-year-old must not be generated living alone as an independent adult');
  if(age>=55)A.ok(relatives.filter(m=>m.householdRole==='guardian').length===0,
   'An older adult must not acquire living childhood guardians by default');
 }
}
A.ok(parentFamily>0&&grandparentFamily>0&&fosterFamily>0);
A.ok(adultRelatives>0&&siblings>0);
// Signed NPC proofs reject changing kinship in one place while leaving the
// founding evidence intact. The family status rejects mismatched copies.
{
 const s=fresh(500014,10),w=Realm.peek(s);
 A.ok(s.player.family.members.length);
 const p=w.originKin.people.kin_1;
 p.source.kinship='an invented aunt';
 A.equal(Kin.verify(w,p),false);
}
{
 const s=fresh(500015,10),member=s.player.family.members[0];
 A.ok(member);
 member.kinship='an invented uncle';
 A.throws(()=>Kin.status(s),/no longer matches their saved individual origin/);
}
// A legacy save has only the historical generic 'guardian' relation.
// It must keep working without inventing kinship or rewriting old source seals.
{
 const legacy=fresh(500016,10),w=Realm.peek(legacy);
 for(const [i,m] of legacy.player.family.members.entries()){
  delete m.kinship;delete m.householdRole;
  for(const x of [legacy.player.startingContext.knownHouseholdMembers[i],
                  legacy.campaign.origin.knownHouseholdMembers[i]]){
   delete x.kinship;delete x.householdRole;
  }
  const p=w.originKin.people['kin_'+(i+1)];
  delete p.kinship;delete p.householdRole;
  delete p.source.kinship;delete p.source.householdRole;
  p.sourceHash=sha(p.source);
  if(p.shift){
   p.shift.sourceHash=p.sourceHash;
   const {hash,...body}=p.shift;
   p.shift.hash=sha(body);
  }
  A.equal(Kin.verify(w,p),true);
 }
 const reloaded=Engine.importGame(Engine.exportGame(legacy));
 const relatives=Kin.status(reloaded).relatives;
 A.equal(relatives.length,legacy.player.family.members.length);
 for(const m of relatives){
  A.equal(m.kinship,null,'No specific legacy relationship may be guessed');
  A.equal(m.relation,m.householdRole);
 }
}
// A player-confirmed statement can be shown alongside, but may not
// mutate, the original source-proven NPC family identity.
{
 const Scene=require('../scripts/scene-continuity');
 let s;
 for(let seed=1;seed<=100;seed++){
  const candidate=fresh(600000+seed,10);
  if(candidate.player.family.members[0]?.kinship==='mother'){
   s=candidate;break;
  }
 }
 A.ok(s,'A mother household is a reachable seeded starting relationship');
 const p=Realm.peek(s).originKin.people.kin_1,before=p.sourceHash;
 const fact=s.player.family.members[0].name+' is my mother.';
 const statement=s.player.family.members[0].name+
  ' is the player character’s mother by explicit player confirmation.';
 Scene.apply(s,{id:'confirmed_family_kinship_001',mode:'checkpoint',
  scene:'The player confirms: '+fact,
  continuity:[{id:'confirmed_mother_relation',action:'record',
   subject:{kind:'person',id:p.actorId},category:'family-relationship',
   statement,witness:fact,visibility:'player-known'}]});
 A.equal(Kin.status(s).relatives[0].confirmedRelationship,statement);
 A.equal(p.sourceHash,before,'Clarification cannot rewrite source-sealed ancestry');
 A.equal(Kin.verify(Realm.peek(s),p),true);
}
console.log('Seeded family kinship: specific named ties, independent household roles, source integrity, older-save compatibility and age-coherent families');
