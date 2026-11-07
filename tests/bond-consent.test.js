'use strict';
const A=require('node:assert/strict'), FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'), R=require('../rules'), Turn=require('../scripts/chat-turn.js');
function fresh(seed=82001,{sapience=1,ready=true}={}){
 const s=E.newGame({name:'Contract Consent Fixture',seed,path:'undecided'});
 s.player.attributes.cha=30;
 s.player.attributes.wis=30;
 s.player.skills.beastcraft.rank=5;
 s.player.skills.contractLore={rank:5,xp:0};
 s.beasts.fox={id:'fox',name:'Copper Fox',species:'fenfox',evolutionStage:'Base',
  individualGrade:'Common',sapience,mood:'attentive',location:'crossing',
  needs:{hunger:10,fatigue:0},condition:100,personalityTags:['affiliative'],
  relationship:'wild',contractGradeAssessment:{
   grade:1,species:'fenfox',evolutionStage:'Base',individualGrade:'Common',
   worldMinute:s.world.minutes,source:'Licensed individual Grade I examination before negotiation'
  }};
 s.encounter={beastId:'fox',observed:true,approaches:0,threat:false};
 R.bonds.register(s,{beastId:'fox',start:'unfamiliar'});
 const b=R.bonds.fromSave(s,'fox');
 b.trust=ready?65:20;b.willingness=ready?70:15;b.respect=ready?60:10;
 return s;
}
const call=(s,op,params={beastId:'fox',depth:'light'})=>R.act(s,{system:'bond',operation:op,params});
{
 const s=fresh(82001),before=E.exportGame(s),rng=s.rngState;
 for(const params of [
  {beastId:'fox',depth:'light',beastWilling:true},
  {beastId:'fox',depth:'light',result:'success'},
  {beastId:'fox',depth:'deep'},
  {beastId:'missing',depth:'light'}
 ])A.throws(()=>call(s,'consentOffer',params),/Only beastId|light contracts|Unknown beast/);
 A.equal(E.exportGame(s),before);
 A.equal(s.rngState,rng);
 const s2=fresh(82002,{sapience:2});
 A.throws(()=>call(s2,'consentOffer'),/S2 guardian consent/);
 A.equal(s2.rngState,s2.seed);
 const s3=fresh(82003,{sapience:3});
 A.throws(()=>call(s3,'consentOffer'),/S3\+ informed negotiation/);
 A.equal(s3.rngState,s3.seed);
}
{
 const s=fresh(82004,{ready:false}),rng=s.rngState,minute=s.world.minutes;
 const r=call(s,'consentOffer');
 A.equal(r.offered,false);
 A.equal(r.rollMade,false);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,minute);
 A.equal(s.beasts.fox.contractConsentEvidence,undefined);
 s.beasts.fox.relationship='captured';
 const c=call(s,'consentOffer');A.equal(c.offered,false);
 s.beasts.fox.relationship='wild';s.beasts.fox.location='fen';
 A.throws(()=>call(s,'consentOffer'),/not present/);
 A.equal(s.rngState,rng);
}
{
 const s=fresh(82005),before=s.world.minutes;
 s.player.attributes.cha=1;s.player.skills.beastcraft.rank=0;
 s.rngState=1; // first d20=1; not a replay or a chosen roll in the game
 const refused=call(s,'consentOffer');
 A.equal(refused.offered,true);A.equal(refused.accepted,false);
 A.equal(refused.check.roll,1);
 A.equal(s.world.minutes,before+30);
 A.equal(s.beasts.fox.contractConsentEvidence.beastWilling,false);
 A.equal(s.beasts.fox.contractConsentEvidence.informedConsent,false);
 A.equal(s.beasts.fox.contractConsentEvidence.guardianConsent,false);
 A.throws(()=>call(s,'consentOffer'),/sixdays/);
 s.beasts.fox.mood='agitated';
 const later=s.rngState;E.advance(s,6*1440);A.equal(s.rngState!==later,true);
 A.equal(call(s,'consentOffer').offered,false); // still independently distressed
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-consent-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(82006);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const req={id:'animal_offer_00001',mode:'rule',system:'bond',operation:'consentOffer',
   params:{beastId:'fox',depth:'light'}};
  const r=Turn.execute(file,req);
  A.equal(r.applied,true);
  A.equal(r.output.rules.offered,true);
  A.equal(r.output.rules.accepted,true);
  A.ok(r.output.rules.check.roll>=1&&r.output.rules.check.roll<=20);
  const state=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(state.world.minutes,s.world.minutes+30);
  A.equal(state.beasts.fox.contractConsentEvidence.beastWilling,true);
  A.equal(state.beasts.fox.contractConsentEvidence.depth,'light');
  A.equal(state.beasts.fox.contractConsentEvidence.guardianConsent,false);
  A.equal(state.beasts.fox.contractConsentEvidence.informedConsent,false);
  A.ok(state.beasts.fox.contractConsentEvidence.source.includes('Witnessed voluntary'));
  A.equal(state.table.bondRecords.fox.contract,null);
  A.equal(Turn.execute(file,req).duplicate,true);
  const snapshot=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...req,id:'animal_offer_00002'}),/unspent witnessed/);
  A.equal(FS.readFileSync(file,'utf8'),snapshot);
  const view=Turn.execute(file,{id:'animal_status_00001',mode:'rule',system:'bond',operation:'consentStatus',params:{beastId:'fox'}});
  A.equal(view.applied,false);A.equal(view.output.rules.accepted,true);
  A.equal(FS.readFileSync(file,'utf8'),snapshot);
  const illegalSeal={id:'animal_seal_fake_01',mode:'rule',system:'bond',operation:'seal',
   params:{beastId:'fox',depth:'deep',beastWilling:true}};
  A.throws(()=>Turn.execute(file,illegalSeal),/witnessed consent/);
  A.equal(FS.readFileSync(file,'utf8'),snapshot);
  const seal={id:'animal_seal_00001',mode:'rule',system:'bond',operation:'seal',
   params:{beastId:'fox',depth:'light'}};
  const sealed=Turn.execute(file,seal);
  A.equal(sealed.applied,true);
  A.equal(sealed.output.rules.sealed,true);
  const after=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(after.beasts.fox.contractConsentEvidence.used,true);
  A.deepEqual(after.player.partnerIds,['fox']);
  A.equal(after.table.bondRecords.fox.contract.depth,'light');
  A.equal(Turn.execute(file,seal).duplicate,true);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// Consent can be withdrawn by circumstance; a historical acceptance is not
// permanent authorisation for a contract long after the witnessed encounter.
{
 const s=fresh(82007);
 const accepted=call(s,'consentOffer');
 A.equal(accepted.accepted,true);
 const seal=()=>call(s,'seal',{beastId:'fox',depth:'light'});
 const rng=s.rngState;
 s.beasts.fox.away=true;
 A.throws(seal,/expired or the beast is no longer freely willing|independently withdrawn/);
 A.equal(s.rngState,rng);
 s.beasts.fox.away=false;
 s.beasts.fox.relationship='captured';
 A.throws(seal,/expired or the beast is no longer freely willing|independently withdrawn/);
 A.equal(s.rngState,rng);
 s.beasts.fox.relationship='wild';
 E.advance(s,6*1440+1);
 const afterClockRng=s.rngState;
 A.throws(seal,/expired or the beast is no longer freely willing|independently withdrawn/);
 A.equal(s.rngState,afterClockRng);
 A.equal(R.bonds.fromSave(s,'fox').contract,null);
}
console.log('Witnessed S0–S1 animal consent tests passed');
