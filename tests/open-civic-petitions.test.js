'use strict';
// A citizen can express unverified concerns without a family or faction.
// Only real independent council actions create public docket records.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),Realm=require('../world/simulation'),
 Civic=require('../world/civic-petitions'),W=require('../rules/world'),
 Turn=require('../scripts/chat-turn.js');
const civic=(s,op,params={})=>R.act(s,{system:'social',operation:op,params});
const fresh=(seed=40211)=>E.newGame({seed,name:'Free Ordinary Petitioner',path:'undecided'});
const topic='Please review whether the ferry route and wetland sanctuary access are being kept open fairly to working residents.';
{
 const s=fresh(),before=E.exportGame(s),rng=s.rngState;
 const status=civic(s,'petitionStatus');
 A.equal(status.petitions.length,0);
 A.equal(status.currentPolity,'Reedmarch Compact');
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 for(const p of [
  {statement:'too short'},
  {statement:'Please abolish money.',assent:true},
  {statement:'\u0000Please grant royal rights in the realm'},
  {statement:6},
  {statement:'x'.repeat(1001)}
 ]){
  A.throws(()=>civic(s,'petition',p),/accepts only|readable civic concern/);
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
 A.throws(()=>civic(s,'petitionStatus',{royalSecrets:true}),/read-only and takes no requests/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=fresh(40212),money=s.player.coins,start=s.world.minutes,rng=s.rngState;
 const filing=civic(s,'petition',{statement:topic});
 A.equal(filing.filed,true);
 A.equal(filing.noRoll,true);
 A.equal(filing.feeTalons,0);
 A.equal(filing.noGuaranteedHearing,true);
 A.equal(filing.claimVerified,false);
 A.equal(filing.playerCoinsUnchanged,true);
 A.equal(filing.playerRNGUnchanged,true);
 A.equal(s.player.coins,money);A.equal(s.rngState,rng);
 A.equal(s.world.minutes,start+12);
 const receipt=s.table.civicPetitions.records[0];
 A.equal(receipt.state,'submitted');
 A.equal(receipt.source,Civic.SOURCE);
 A.equal(Civic.sourceCheck(s,receipt),true);
 A.equal(civic(s,'petitionStatus').petitions[0].decision,null);
 const copied=E.exportGame(s);
 A.throws(()=>civic(s,'petition',{statement:topic}),/identical petition was already filed this sixday/);
 A.equal(E.exportGame(s),copied);
 const next=civic(s,'petition',{statement:'I ask the March Council to consider making public meetings accessible to independent students without noble patronage.'});
 A.equal(next.filed,true);
 A.notEqual(next.petitionId,filing.petitionId);
 A.equal(s.table.civicPetitions.records.length,2);
 A.equal(s.player.coins,money);
 A.equal(s.rngState,rng);
}
{
 const s=fresh(40213);const petition=civic(s,'petition',{statement:topic});
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>civic(s,'pickupPetition',{petitionId:petition.petitionId}),/independently returned March Council response/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const tick=W.advance(s,6);
 A.ok(tick.sixdayTicks.length>=1);
 const rec=s.table.civicPetitions.records[0];
 A.equal(rec.state,'at_counter');
 A.ok(['docketed','deferred','declined'].includes(rec.decision));
 A.equal(rec.response,Civic.TEXT[rec.decision]);
 A.equal(rec.reviewSource,Civic.REVIEW);
 A.equal(rec.responseDay>=rec.nextReviewDay,true);
 A.equal(s.table.realm.civicPetitionReviews.length,1);
 A.equal(s.table.realm.civicPetitionReviews[0].petitionEventHash,rec.eventHash);
 A.equal(civic(s,'petitionStatus').petitions[0].decision,null);
 A.equal(civic(s,'petitionStatus').petitions[0].response,null);
 A.equal(civic(s,'petitionStatus').petitions[0].receiptState,'reply ready for in-person pickup');
 const balance=s.player.coins,dayBefore=s.world.minutes;
 const reply=civic(s,'pickupPetition',{petitionId:petition.petitionId});
 A.equal(reply.received,true);
 A.equal(reply.decision,rec.decision);
 A.equal(reply.publicDocket,rec.decision==='docketed');
 A.equal(reply.noSocialRank,true);A.equal(reply.noInheritedPower,true);
 A.equal(reply.didNotChangeLaw,true);
 A.equal(s.world.minutes,dayBefore+8);
 A.equal(s.player.coins,balance);
 A.equal(s.player.family,null);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.table.meridianTechniques,undefined);
 A.equal(civic(s,'petitionStatus').petitions[0].decision,rec.decision);
 const final=E.exportGame(s);
 A.throws(()=>civic(s,'pickupPetition',{petitionId:petition.petitionId}),/independently returned March Council response/);
 A.equal(E.exportGame(s),final);
}
{
 const s=fresh(40214);
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const before=E.exportGame(s);
 A.throws(()=>civic(s,'petition',{statement:topic}),/public correspondence counter is at Morrowfen Crossing/);
 A.equal(E.exportGame(s),before);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 s.world.minutes=23*60;
 const late=E.exportGame(s);
 A.throws(()=>civic(s,'petition',{statement:topic}),/public daytime registry hours/);
 A.equal(E.exportGame(s),late);
}
{
 let docketed=false,declined=false,deferred=false;
 for(let i=1;i<=120;i++){
  const s=fresh((i*2654435761)>>>0);
  const mailed=civic(s,'petition',{statement:topic});
  W.advance(s,6);
  const reviewed=s.table.civicPetitions.records[0];
  const d=reviewed.decision;
  docketed||=d==='docketed';declined||=d==='declined';deferred||=d==='deferred';
  A.equal(s.table.realm.civicPetitionReviews.length,1);
  A.equal(civic(s,'petitionStatus').petitions[0].decision,null);
  if(d==='docketed'){
   A.equal(s.table.realm.governance.reedmarch.publicDockets.length,1);
   A.equal(s.table.realm.governance.reedmarch.publicDockets[0].petitionId,mailed.petitionId);
   A.ok(s.table.realm.chronicle.some(x=>x.subject==='council-docket:'+mailed.petitionId));
  }else{
   A.equal(s.table.realm.governance.reedmarch.publicDockets?.length||0,0);
  }
  civic(s,'pickupPetition',{petitionId:mailed.petitionId});
  if(docketed&&declined&&deferred)break;
 }
 A.equal(docketed,true,'real petitions can reach the public docket');
 A.equal(deferred,true,'independent council may defer requests');
 A.equal(declined,true,'independent council can refuse docketing without punishments');
}
{
 const s=fresh(40215),r=civic(s,'petition',{statement:topic});
 W.advance(s,6);
 const letter=s.table.civicPetitions.records[0];
 letter.eventHash='fabricated_hash';
 const altered=E.exportGame(s),rng=s.rngState;
 A.throws(()=>civic(s,'pickupPetition',{petitionId:r.petitionId}),/independently returned March Council response/);
 A.equal(E.exportGame(s),altered);A.equal(s.rngState,rng);
}
{
 const s=fresh(40216),r=civic(s,'petition',{statement:'I claim—without proof—that I am a crown heir. Please record that I requested a hearing; it is only my allegation.'});
 W.advance(s,6);
 A.equal(s.table.realm.governance.asterwyn.holder,'Queen Orelia Asterwyn');
 A.equal(s.player.family,null);
 A.equal(s.table?.meridianTechniques,undefined);
 A.equal(civic(s,'pickupPetition',{petitionId:r.petitionId}).noInheritedPower,true);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-open-civic-'));
 try{
  const file=Path.join(dir,'person.json'),s=fresh(40217);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const old=FS.readFileSync(file,'utf8');
  const read=Turn.execute(file,{id:'civic_read_000001',mode:'rule',
   system:'social',operation:'petitionStatus',params:{}});
  A.equal(read.applied,false);
  A.equal(read.output.rules.petitions.length,0);
  A.equal(FS.readFileSync(file,'utf8'),old);
  const action={id:'civic_open_000001',mode:'rule',system:'social',
   operation:'petition',params:{statement:topic}};
  const result=Turn.execute(file,action);
  A.equal(result.applied,true);
  A.equal(result.output.rules.filed,true);
  A.equal(Turn.execute(file,action).duplicate,true);
  const stored=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(stored.table.civicPetitions.records.length,1);
  A.equal(stored.table.civicPetitions.records[0].statement,topic);
  A.equal(stored.player.coins,s.player.coins);
  const snapshot=FS.readFileSync(file,'utf8');
  const visible=Turn.execute(file,{id:'civic_read_000002',mode:'rule',
   system:'social',operation:'petitionStatus',params:{}});
  A.equal(visible.applied,false);
  A.equal(visible.output.rules.petitions.length,1);
  A.equal(FS.readFileSync(file,'utf8'),snapshot);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Ordinary residents can file freeform civic petitions without patronage, money or invented royal powers; the council independently reviews and returns responses');
