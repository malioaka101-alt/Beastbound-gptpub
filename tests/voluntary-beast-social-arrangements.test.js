'use strict';
// #08 disposable real source-bound individual relationships, no campaign save.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),C=require('../rules/core'),
 Time=require('../rules/world'),Social=require('../rules/beast-social-arrangements'),
 Person=require('../world/sapient-beast-persons'),
 Turn=require('../scripts/chat-turn');
const op=(s,k,p={})=>R.act(s,{system:'bond',operation:k,params:p});
const sample=(b,id,kind='voluntary shared research')=>({
 beastId:b.id,id,kind,
 purpose:'A voluntary individually negotiated short-term undertaking to protect a living habitat.',
 humanDuty:'The human undertakes to arrange safe passage and document the separate needs of each participant.',
 beastDuty:'The intelligent independent beast may contribute only tasks it understands and has personally accepted.',
 protections:'Both remain free persons or independently protected living beings with a continuing right to refuse.',
 termination:'Either participant may withdraw, and unresolved payments or harm require separate honest adjudication.',
 communication:'Direct previously witnessed gesture and explained local signs without presumed telepathy.',
 durationDays:7
});
function evidence(s,b,draft){
 C.event(s,'story','The existing beast hears or sees a supported explanation of precisely these terms and replies as an autonomous individual.',{
  origin:Social.DISCUSSION,beastId:b.id,arrangementId:draft.id,
  termHash:draft.originHash,location:s.world.location,
  comprehension:'The concrete voluntary terms were carefully explained and visibly understood in this witnessed local conversation.',
  communication:'Direct witnessed movement and clear shared signs'});
 return s.log.length-1;
}
function discoverSapient(seed=927801){
 const s=E.newGame({name:'Voluntary Sapient Source',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const history=[];
 let accepted=null;
 for(let i=0;i<260&&!accepted;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId],def=E.SPECIES[b.species];
  if(def.intelligence==='sapient'&&!s.encounter.threat&&
     !/hostile|agitated|terrified|panicked|fleeing/i.test(b.mood)){
   const meeting=R.act(s,{system:'social',operation:'meetSapientBeast',params:{}});
   A.equal(Person.verify(b),true);
   if(meeting.freelyEngaged){
    const p=sample(b,'individual_service_'+i,'rescue and voluntary habitat survey');
    const draft=op(s,'socialDraft',p);
    A.equal(draft.noConsentOrServiceEstablished,true);
    const before=E.exportGame(s);
    A.equal(op(s,'socialStatus',{beastId:b.id}).arrangements[0].status,'proposed');
    A.equal(E.exportGame(s),before);
    A.throws(()=>op(s,'socialNegotiate',{beastId:b.id,id:p.id,witnessIndex:0}),
     /personally witnessed local exchange|specific terms/);
    const outcome=op(s,'socialNegotiate',{beastId:b.id,id:p.id,witnessIndex:evidence(s,b,draft)}).outcome;
    history.push({id:b.id,proposalId:p.id,outcome});
    if(outcome==='accepted')accepted={s,b,p,history};
    else{
     A.ok(['declined','countered'].includes(outcome));
     A.equal(op(s,'socialStatus',{beastId:b.id}).arrangements[0].status,outcome);
    }
   }
  }
  if(s.encounter&&!accepted)A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.ok(accepted,'The independent individuals in disposable encounters must have a genuine accepted proposal');
 return accepted;
}
{
 const {s,b,p,history}=discoverSapient();
 A.ok(history.length>0);
 A.equal(s.player.partnerIds.includes(b.id),false);
 A.equal(s.table?.bondRecords?.[b.id],undefined,
  'A negotiated social undertaking cannot secretly create a magical bond');
 const social=op(s,'socialStatus',{beastId:b.id});
 A.equal(social.arrangements[0].status,'accepted');
 A.equal(social.noPartnerOrContractSealGranted,true);
 A.equal(social.arrangements[0].humanDuty,p.humanDuty);
 A.equal(social.arrangements[0].beastDuty,p.beastDuty);
 A.equal(b.socialArrangements.entries[p.id].startMinute,s.world.minutes);
 A.equal(b.socialArrangements.entries[p.id].endMinute,s.world.minutes+7*1440);
 A.equal(Social.verify(s,b),true);
 A.equal(op(s,'socialDraft',{...p,id:'future_friendship_01',
  kind:'friendship without service'}).drafted,true);
 const afterDraft=E.exportGame(s),double=E.importGame(afterDraft);
 A.throws(()=>op(s,'socialDraft',{...p,id:'future_friendship_01',
  kind:'friendship without service'}),/already exists/);
 A.equal(E.exportGame(s),afterDraft);
 A.equal(op(s,'socialEnd',{beastId:b.id,id:p.id,
  reason:'The human respectfully withdraws without claiming the beast must remain.'}).status,'revoked');
 A.equal(op(s,'socialStatus',{beastId:b.id}).arrangements[0].status,'revoked');
 A.equal(b.socialArrangements.entries[p.id].status,'revoked');
 A.equal(s.player.partnerIds.length,0);
 A.equal(Social.verify(s,b),true);
 A.equal(double.beasts[b.id].socialArrangements.entries[p.id].status,'accepted');
 const changed=E.importGame(afterDraft);
 changed.beasts[b.id].socialArrangements.entries[p.id].source.beastDuty='Forced service';
 A.equal(Social.verify(changed,changed.beasts[b.id]),false);
 const signatureTampered=E.importGame(afterDraft);
 signatureTampered.beasts[b.id].socialArrangements.entries[p.id].endMinute=5;
 A.equal(Social.verify(signatureTampered,signatureTampered.beasts[b.id]),false);
 const pending=E.importGame(afterDraft);
 const now=pending.world.minutes;
 Time.advance(pending,8);
 A.equal(pending.beasts[b.id].socialArrangements.entries[p.id].status,'expired');
 A.equal(Social.verify(pending,pending.beasts[b.id]),true);
 A.equal(pending.world.minutes,now+8*1440);
 const parallel=E.importGame(afterDraft);
 Time.advance(parallel,8);
 A.deepEqual(pending.beasts[b.id].socialArrangements,parallel.beasts[b.id].socialArrangements);
 const strained=E.importGame(afterDraft),animal=strained.beasts[b.id];
 animal.condition=34;
 Time.advance(strained,6);
 A.equal(animal.socialArrangements.entries[p.id].status,'paused');
 A.equal(op(strained,'socialStatus',{beastId:b.id}).arrangements[0].status,'performance-not-confirmed',
  'The human never gets an omniscient notice of remote welfare or availability');
 A.equal(Social.verify(strained,animal),true);
 const disputed=E.importGame(afterDraft),citizen=disputed.beasts[b.id];
 C.event(disputed,'story','The local meeting records a witnessed contested duty without a court verdict.',{
  origin:Social.DISPUTE,beastId:b.id,arrangementId:p.id,
  location:disputed.world.location,
  claim:'The individual publicly disputes a claimed service and asks for an impartial hearing without compelled labour.'});
 const ix=disputed.log.length-1;
 A.equal(op(disputed,'socialDispute',{beastId:b.id,id:p.id,witnessIndex:ix}).claimOnly,true);
 A.throws(()=>op(disputed,'socialDispute',{beastId:b.id,id:p.id,witnessIndex:ix}),
  /same witnessed dispute/);
 A.equal(op(disputed,'socialStatus',{beastId:b.id}).arrangements[0].status,'disputed');
 A.equal(Social.verify(disputed,citizen),true);
 const tamper=E.importGame(E.exportGame(disputed));
 tamper.beasts[b.id].socialArrangements.entries[p.id].events.at(-1).source.details.reason='fabricated';
 A.equal(Social.verify(tamper,tamper.beasts[b.id]),false);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-diverse-ties-'));
 try{
  const path=Path.join(dir,'save.json');
  FS.writeFileSync(path,E.exportGame(afterDraft?double:s)+'\n');
  const q={...sample(double.beasts[b.id],'future_rescue_02'),
   kind:'emergency aid and consented short-term rescue care'};
  const call={id:'social_draft_00001',mode:'rule',system:'bond',
   operation:'socialDraft',params:q};
  A.equal(Turn.execute(path,call).applied,true);
  const saved=FS.readFileSync(path,'utf8');
  A.equal(Turn.execute(path,call).duplicate,true);
  A.equal(FS.readFileSync(path,'utf8'),saved);
  const view={id:'social_view_00001',mode:'rule',system:'bond',
   operation:'socialStatus',params:{beastId:b.id}};
  A.equal(Turn.execute(path,view).applied,false);
  A.equal(FS.readFileSync(path,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // A non-sapient wild individual may willingly engage without being treated
 // as a legally bound service provider or transferable property.
 const s=E.newGame({name:'Animal Friendship Source',seed:920022,path:'undecided'});
 s.player.attributes.cha=30;s.player.skills.beastcraft.rank=5;
 A.equal(E.dispatch(s,'travel forest').ok,true);
 let found=null;
 for(let i=0;i<150&&!found;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId],sp=E.SPECIES[b.species];
  if(sp.intelligence!=='sapient'&&b.sapience<=1&&!s.encounter.threat&&
   !/hostile|panicked|terrified|agitated|fleeing/i.test(b.mood)){
   op(s,'register',{beastId:b.id,start:'unfamiliar'});
   const contact=op(s,'interact',{beastId:b.id,approach:'gentle'});
   if(contact.accepted)found=b;
  }
  if(s.encounter&&!found)A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.ok(found,'Real voluntary animal contact must actually succeed');
 const p=sample(found,'forest_welfare_01','care and friendly recognition');
 const d=op(s,'socialDraft',p),ix=evidence(s,found,d);
 const result=op(s,'socialNegotiate',{beastId:found.id,id:p.id,witnessIndex:ix});
 A.ok(['contact-only','declined'].includes(result.outcome));
 A.equal(result.activeLegalDuties,false);
 A.equal(s.player.partnerIds.includes(found.id),false);
 A.equal(R.bonds.fromSave(s,found.id).contract,null);
 A.equal(Social.verify(s,found),true);
 const status=op(s,'socialStatus',{beastId:found.id}).arrangements[0];
 A.equal(status.beastDuty,'No enforceable animal labour or legal obligation');
}
console.log('Source-witnessed beast-human ties: original independently met sapient personhood and autonomous consent, open-ended rescue/service/friendship terms, no magic link or forced animal labour, refusal/counteroffer, status privacy, withdrawal, challenges, real sixday expiry and welfare, tamper detection and exact turn replay.');
