'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const Agency=require('../rules/beast-agency');
function fresh(seed=62021){
 const s=E.newGame({name:'Beast Agency Fixture',seed,path:'undecided'});
 s.player.attributes.cha=30;s.player.attributes.wis=30;
 s.player.skills.beastcraft.rank=5;s.player.skills.contractLore={rank:5,xp:0};
 s.beasts.fox={id:'fox',name:'River Fox',sapience:1,species:'fenfox',
  evolutionStage:'Base',individualGrade:'Common',mood:'relaxed',
  relationship:'wild',location:'crossing',needs:{hunger:10,fatigue:0},condition:100,
  personalityTags:['affiliative'],contractGradeAssessment:{
   grade:1,worldMinute:s.world.minutes,species:'fenfox',evolutionStage:'Base',
   individualGrade:'Common',source:'Independently recorded Grade I animal examination in the crossing'
  }};
 s.encounter={beastId:'fox',observed:true,approaches:0,threat:false};
 R.bonds.register(s,{beastId:'fox',start:'unfamiliar'});
 const b=R.bonds.fromSave(s,'fox');b.trust=85;b.respect=75;b.willingness=85;
 return s;
}
const run=(s,op,params)=>R.act(s,{system:'bond',operation:op,params});
// Established boundaries veto a positive check without consuming any dice.
{
 const s=fresh(),b=s.beasts.fox,rng=s.rngState,minutes=s.world.minutes;
 b.agencyBoundaries={avoid:['play'],worldMinute:0,
  source:'Observed recurring voluntary rejection of play near the marsh bridge'};
 const r=run(s,'interact',{beastId:'fox',approach:'play'});
 A.equal(r.accepted,false);A.equal(r.rollMade,false);A.equal(r.check,null);
 A.equal(r.evidenceId,null);A.equal(s.rngState,rng);
 A.equal(s.world.minutes,minutes+20);
 A.equal(Object.keys(s.table.bondEvidence||{}).length,0);
 A.throws(()=>run(s,'interact',{beastId:'fox',approach:'gentle'}),/already attempted/);
}
// Real need and injury records outrank Charisma. No mind-reading: the
// returned refusal is observable, not a private numeric profile.
{
 const s=fresh(62022);
 s.beasts.fox.needs.hunger=95;
 const rng=s.rngState;
 const r=run(s,'interact',{beastId:'fox',approach:'gentle'});
 A.equal(r.accepted,false);A.equal(r.rollMade,false);
 A.equal(s.rngState,rng);A.equal(r.evidenceId,null);
}
// Independent dispositions are derived from saved identity rather than from
// the player's chosen action or dice. A fixed temperament can reject even
// an extremely persuasive character's proposal.
{
 const s=fresh(62023);
 delete s.beasts.fox.personalityTags;
 s.beasts.fox.agencyProfile={disposition:'independent',origin:'individual-behaviour-v1'};
 const b=R.bonds.fromSave(s,'fox');
 b.trust=65;b.respect=75;b.willingness=85;
 const rng=s.rngState,minutes=s.world.minutes;
 const offer=run(s,'consentOffer',{beastId:'fox',depth:'light'});
 A.equal(offer.offered,true);A.equal(offer.accepted,false);A.equal(offer.rollMade,false);
 A.equal(offer.check,null);A.equal(s.rngState,rng);
 A.equal(s.world.minutes,minutes+30);
 A.equal(s.beasts.fox.contractConsentEvidence.beastWilling,false);
 A.throws(()=>run(s,'consentOffer',{beastId:'fox',depth:'light'}),/sixdays/);
}
// A seeded individual inclination is stable across the same disposable
// checkpoint and does not consume the combat/skill RNG stream.
{
 const a=fresh(62024),b=fresh(62024);
 delete a.beasts.fox.personalityTags;delete b.beasts.fox.personalityTags;
 const beforeA=a.rngState,beforeB=b.rngState;
 const first=Agency.profile(a,a.beasts.fox),second=Agency.profile(b,b.beasts.fox);
 A.deepEqual(first,second);
 Agency.evaluate(a,a.beasts.fox,R.bonds.fromSave(a,'fox'),'gentle');
 Agency.evaluate(b,b.beasts.fox,R.bonds.fromSave(b,'fox'),'play');
 A.equal(a.beasts.fox.agencyProfile,undefined);
 A.equal(b.beasts.fox.agencyProfile,undefined);
 A.equal(a.rngState,beforeA);A.equal(b.rngState,beforeB);
}
// A witnessed agreement loses its force when the animal's real condition
// deteriorates, even if all numeric seal modifiers would be favourable.
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-agency-seal-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(62025);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const r=Turn.execute(file,{id:'agency_offer_00001',mode:'rule',system:'bond',
   operation:'consentOffer',params:{beastId:'fox',depth:'light'}});
  A.equal(r.applied,true);A.equal(r.output.rules.accepted,true);
  const changed=E.importGame(FS.readFileSync(file,'utf8'));
  changed.beasts.fox.needs.fatigue=91;
  FS.writeFileSync(file,E.exportGame(changed)+'\n');
  const snapshot=FS.readFileSync(file,'utf8'),rng=changed.rngState;
  A.throws(()=>Turn.execute(file,{id:'agency_seal_00001',mode:'rule',system:'bond',
   operation:'seal',params:{beastId:'fox',depth:'light'}}),/independently withdrawn|not well enough/);
  A.equal(FS.readFileSync(file,'utf8'),snapshot);
  A.equal(E.importGame(snapshot).rngState,rng);
  A.equal(E.importGame(snapshot).table.bondRecords.fox.contract,null);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// Examination consent is independently meaningful too: a documented refusal
// prevents paid assessment, rolls and the creation of an unearned Grade.
{
 const s=fresh(62026),rng=s.rngState,minutes=s.world.minutes,coins=s.player.coins;
 delete s.beasts.fox.contractGradeAssessment;
 s.beasts.fox.agencyBoundaries={avoid:['grade_exam'],worldMinute:0,
  source:'Repeatedly witnessed discomfort during noninvasive evaluation'};
 A.throws(()=>run(s,'gradeExamine',{beastId:'fox'}),/independently declines examination/);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,minutes);
 A.equal(s.player.coins,coins);
 A.equal(s.beasts.fox.contractGradeAssessment,undefined);
}
console.log('Independent beast agency and welfare refusal tests passed');
