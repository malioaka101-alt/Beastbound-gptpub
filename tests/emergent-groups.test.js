'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Crypto=require('node:crypto'),E=require('../engine.js'),R=require('../rules'),
 W=require('../rules/world'),C=require('../rules/core'),Realm=require('../world/simulation'),
 Houses=require('../world/social-houses'),F=require('../world/family-members'),
 G=require('../world/emergent-groups'),Turn=require('../scripts/chat-turn.js');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fresh=(seed=967101)=>E.newGame({seed,name:'Unaffiliated Freely Organising Founder',path:'undecided'});
const act=(s,op,params={})=>R.act(s,{system:'social',operation:op,params});
const names={name:'Free Reed Watch',kind:'independent kin and wetland skills collective',
 purpose:'Offer ordinary residents open access to practical wetland crossing knowledge and shared safe routes.'};
{
 const s=fresh(),old=E.exportGame(s),rng=s.rngState;
 A.equal(Houses.houses.length,28);
 A.equal(Houses.catalog(Realm.peek(s)).length,28);
 A.equal(act(s,'groupsStatus').groups.length,0);
 A.equal(act(s,'status').localPublicHouses.length,4);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 const bad={...names,royalPrivilege:true};
 A.throws(()=>act(s,'formGroup',bad),/accepts only the real founder/);
 A.equal(E.exportGame(s),old);
 const coins=s.player.coins,started=s.world.minutes;
 const formed=act(s,'formGroup',names);
 A.equal(formed.formed,true);A.equal(formed.minutes,25);
 A.equal(formed.knownConsentingMembers,1);
 A.equal(formed.noNobleRank,true);
 A.equal(formed.noInventedMembers,true);
 A.equal(formed.noInheritedPower,true);
 A.equal(s.player.coins,coins);
 A.equal(s.world.minutes-started,25);
 const w=s.table.realm,entry=G.lookup(w,formed.id);
 A.ok(entry);A.equal(entry.charter.kind,names.kind);
 A.equal(entry.charter.duty,names.purpose);
 A.equal(entry.charter.elder,s.player.name);
 A.equal(entry.charter.relative,null);
 A.equal(entry.charter.relation,null);
 A.equal(entry.charter.politicalStatus.includes('no official recognition'),true);
 A.equal(entry.members,1);A.equal(entry.verifiedMembers,1);
 A.equal(entry.origin,'player-declaration');
 A.equal(entry.originHash,sha(entry.witness));
 A.equal(entry.witness.details.otherMembersConfirmed,false);
 A.equal(entry.funds,0);
 A.equal(s.player.family,null,'An association is not automatic biological family or title');
 A.equal(G.validate(entry),true);
 A.equal(Houses.lookup(w,formed.id).name,names.name);
 A.equal(Houses.catalog(w).length,29);
 A.equal(act(s,'groupsStatus').groups.length,1,'The founder knows their own declaration');
 A.equal(act(s,'groupsStatus').groups[0].publiclyAnnounced,false);
 A.equal(act(s,'status').localPublicHouses.length,4,'Other residents cannot read an unreleased public notice');
 A.equal(F.ensure(w).houses[formed.id],undefined,
  'Never invent a second named consenting person merely to fit the old two-person family subsystem');
 W.advance(s,2);
 A.equal(act(s,'status').localPublicHouses.length,5,'New public local groups join the same real social catalogue');
 A.equal(act(s,'groupsStatus').groups[0].publiclyAnnounced,true);
 const charter=act(s,'inquire',{houseId:formed.id});
 A.equal(charter.consulted,true);
 A.equal(charter.house.kind,names.kind);
 A.equal(charter.relative,null);
 A.equal(charter.relation,null);
 A.ok(charter.source.includes('self-declared'));
 A.equal(charter.noAutomaticKinship,true);
 const beforeSelfMail=E.exportGame(s),rngBeforeSelfMail=s.rngState;
 A.throws(()=>act(s,'request',{houseId:formed.id,purpose:'request_history'}),
  /cannot manufacture an independent reply from yourself/);
 A.equal(E.exportGame(s),beforeSelfMail);
 A.equal(s.rngState,rngBeforeSelfMail);
 A.equal(s.player.family,null);
 // A second differently described association can be founded without a
 // list of approved types or an artificial universal one-clan limit.
 const next=act(s,'formGroup',{
  name:'Experimental Wetland Ledger Studio',
  kind:'informal public cooperative laboratory',
  purpose:'Study inexpensive, ethically sourced noninvasive ferry records with willing neighbours.'});
 A.notEqual(next.id,formed.id);
 A.equal(G.all(w).length,2);
 A.equal(Houses.houses.length,28,'The canonical seed list remains unchanged');
}
{
 const s=fresh(967102),initial=s.player.coins;
 const f=act(s,'formGroup',names);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'groupContribute',{groupId:f.id,activity:'Actual wetland fieldwork',coins:initial+1}),
  /does not own the proposed real funds/);
 A.throws(()=>act(s,'groupContribute',{groupId:f.id,activity:'Actual wetland fieldwork',coins:1,grantedMembers:200}),
  /accepts only the real founder/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const event=act(s,'groupContribute',{groupId:f.id,
  activity:'I try to repair the route markers and produce reusable safe-crossing notes.',coins:5});
 A.equal(event.workRecorded,true);
 A.equal(event.actualMinutes,45);
 A.equal(event.spentCoins,5);
 A.equal(event.verifiedResult,false,'The founder cannot specify a successful outcome');
 A.equal(s.player.coins,initial-5);
 const w=s.table.realm,e=G.lookup(w,f.id);
 A.equal(e.funds,5);
 A.equal(e.activity.length,1);
 A.equal(e.activity[0].hash,sha(e.activity[0].witness));
 A.equal(e.members,1);
 const previousHash=e.originHash,playerDice=s.rngState;
 W.advance(s,30);
 A.equal(e.activity.length,0,'Actual work is reviewed once, not replayed every month');
 A.equal(e.workSessions,1);
 A.equal(e.completedEfforts+e.failedEfforts,1);
 A.equal(e.members,1,'Doing something exceptional cannot manufacture a spouse or a famous following');
 A.equal(e.originHash,previousHash);
 A.equal(e.funds>=0,true);
 A.equal(s.player.coins,initial-5);
 A.equal(e.verifiedMembers,1);
 A.equal(w.governance.asterwyn.holder,'Queen Orelia Asterwyn');
 const outcome=w.emergentGroups.history.filter(x=>x.groupId===f.id);
 A.ok(outcome.some(x=>x.kind==='formed'));
 A.ok(outcome.some(x=>['verified-limited-community-work','unverified-community-effort'].includes(x.kind)));
 A.ok(outcome.every(x=>x.hash===sha({id:x.id,day:x.day,groupId:x.groupId,polity:x.polity,
  kind:x.kind,originHash:x.originHash,details:x.details})));
 A.ok(s.rngState!==playerDice,'Normal world passage can affect game state; group progress uses separate independent world RNG');
 const preserved=E.exportGame(s),rng2=s.rngState;
 A.equal(act(s,'groupsStatus').groups[0].memberCount,1);
 A.equal(E.exportGame(s),preserved);A.equal(s.rngState,rng2);
 // Short player event journals prune naturally; original founding evidence
 // must remain attached to the entity itself, not vanish from the world.
 for(let i=0;i<100;i++)C.event(s,'story','Unrelated ordinary report '+i,{unrelated:true});
 A.equal(G.validate(e),true);
 A.equal(G.lookup(w,f.id).originHash,previousHash);
}
{
 const s=fresh(967103),f=act(s,'formGroup',names),w=s.table.realm,e=G.lookup(w,f.id);
 e.witness.details.otherMembersConfirmed=true;
 A.equal(G.validate(e),false);
 A.equal(G.lookup(w,f.id),null);
 A.equal(act(s,'groupsStatus').groups.length,0);
 A.equal(act(s,'status').localPublicHouses.length,4);
}
{
 // The independent world already genuinely creates certain professional
 // breakaways after multiple verified local studies and voluntary worker
 // transfers. These are *not* extra canned noble families.
 let sample=null;
 for(let i=0;i<8&&!sample;i++){
  const s=fresh((967110+i*17)>>>0);
  W.advance(s,2190);
  const w=s.table.realm,outs=Object.values(w.agentInitiatives?.entrants||{});
  if(outs.length)sample={s,w,outs};
 }
 A.ok(sample,'At least one organically founded independent worker circle must arise across real deterministic histories');
 for(const o of sample.outs){
  const e=G.lookup(sample.w,o.id);
  A.ok(e,'Already existing NPC founder groups join the common registry');
  A.equal(e.origin,'worker-spinoff');
  A.equal(e.founder.actorId,o.founderId);
  A.equal(e.charter.kind,'independent vocational collective');
  A.equal(e.members,o.members);
  A.equal(e.funds,o.funds);
  A.equal(e.originHash,sha(e.witness));
  A.equal(e.charter.relative,null);
  A.equal(Houses.lookup(sample.w,o.id).name,o.name);
 }
 A.ok(Houses.catalog(sample.w).length>28);
 A.equal(Object.keys(F.ensure(sample.w).houses).length,28,
  'Anonymous workers are not invented as named relatives with biological descent');
}
{
 // OTHER future game modules can introduce their own origin evidence,
 // e.g. a real new household established by an independently recorded
 // person, without inserting it into the original 28-house static list.
 const s=fresh(967151),w=Realm.ensure(s),actor=w.notables.reedmarch_field;
 const origin='npc_independent_kin_camp';
 const verify=(entry,event)=>event.type==='story'&&
  event.details?.origin==='independently-attested-group-camp'&&
  event.details?.id===entry.id&&event.details?.polity===entry.polity&&
  event.details?.founderId===entry.founder.actorId&&
  event.details?.singleFounderConfirmed===true&&
  event.details?.name===entry.charter.name;
 G.registerOriginAdapter(origin,verify);
 const id='witnessed_new_household_01';
 const exact={id,polity:'reedmarch',name:'River Lantern Homes',
  kind:'new self-governing refuge household',
  purpose:'Maintain refuge shelters for travellers and respect independent beast visitors',
  founderName:actor.name,founderId:actor.id,
  foundedDay:0,releaseDay:2,origin};
 A.throws(()=>G.registerFromEvidence(w,{...exact,witness:{
  type:'story',details:{origin:'claimed-but-unwitnessed'}}}),/Unverified original scene/);
 A.equal(G.all(w).length,0);
 C.event(s,'story','An established independent local worker declares a new household project without an invented heir.',{
  origin:'independently-attested-group-camp',id,polity:'reedmarch',
  founderId:actor.id,singleFounderConfirmed:true,name:exact.name
 });
 const witness=structuredClone(s.log.at(-1));
 const e=G.registerFromEvidence(w,{...exact,witness});
 A.equal(G.validate(e),true);
 A.equal(e.members,1);
 A.equal(e.charter.relative,null);
 A.equal(G.lookup(w,id).charter.name,exact.name);
 A.equal(Houses.catalog(w).length,29);
 A.equal(F.ensure(w).houses[id],undefined);
 A.equal(G.visible(s,w).groups.length,0,'No premature public disclosure of a new unknown origin');
 W.advance(s,2);
 A.ok(G.visible(s,w).groups.some(x=>x.id===id));
 A.equal(G.lookup(w,id).originHash,sha(witness));
 A.equal(e.charter.politicalStatus.includes('unverified'),true);
}
{
 // Consent adapters can add a newly met *person*, later, without forcing
 // the original founder to remain solitary forever. The invitation scene
 // itself will be a future player-facing NPC conversation action; tests
 // simulate only the original separately witnessed confirmation.
 const s=fresh(967152),id=act(s,'formGroup',names).id,
  w=s.table.realm,actor=w.notables.reedmarch_field;
 const orig='npc_individual_membership_assent';
 G.registerMemberConsentAdapter(orig,(entry,m,witness)=>
  witness.type==='story'&&
  witness.details?.origin==='independently-witnessed-personal-assent'&&
  witness.details?.groupId===entry.id&&
  witness.details?.actorId===m.actorId&&
  witness.details?.actorName===m.name&&
  witness.details?.consentGiven===true);
 const forged={type:'story',details:{
  origin:'independently-witnessed-personal-assent',groupId:id,
  actorId:actor.id,actorName:actor.name,consentGiven:false}};
 A.throws(()=>G.admitMemberFromEvidence(w,id,{
  actorId:actor.id,name:actor.name,origin:orig,witness:forged}),
  /No genuine personally witnessed acceptance/);
 A.equal(G.lookup(w,id).members,1);
 C.event(s,'story',actor.name+' independently assents to a narrowly described practical membership.',{
  origin:'independently-witnessed-personal-assent',groupId:id,
  actorId:actor.id,actorName:actor.name,consentGiven:true
 });
 const witness=structuredClone(s.log.at(-1)),
  joined=G.admitMemberFromEvidence(w,id,{
   actorId:actor.id,name:actor.name,origin:orig,witness});
 A.equal(joined.joined,true);
 A.equal(joined.verifiedMembers,2);
 A.equal(joined.noInferredKinship,true);
 A.equal(G.lookup(w,id).members,2);
 A.equal(G.validate(G.lookup(w,id)),true);
 A.equal(act(s,'groupsStatus').groups[0].memberCount,2);
 A.throws(()=>G.admitMemberFromEvidence(w,id,{
  actorId:actor.id,name:actor.name,origin:orig,witness}),
  /independently consenting new participant/);
 A.equal(s.player.family,null);
 A.equal(F.ensure(w).houses[id],undefined,
  'Two consenting members of a free society still do not automatically constitute hereditary kin');
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-open-group-foundation-'));
 try{
  const save=Path.join(dir,'test.json'),s=fresh(967201);
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const baseline=FS.readFileSync(save,'utf8'),
   read={id:'groups_read_only_0001',mode:'rule',system:'social',operation:'groupsStatus',params:{}};
  A.equal(Turn.execute(save,read).applied,false);
  A.equal(FS.readFileSync(save,'utf8'),baseline);
  const cmd={id:'found_new_group_0001',mode:'rule',system:'social',operation:'formGroup',params:names};
  const outcome=Turn.execute(save,cmd);
  A.equal(outcome.applied,true);
  A.equal(outcome.output.rules.formed,true);
  A.equal(Turn.execute(save,cmd).duplicate,true);
  const found=E.importGame(FS.readFileSync(save,'utf8'));
  const id=outcome.output.rules.id;
  A.equal(G.lookup(found.table.realm,id).members,1);
  A.equal(found.player.coins,s.player.coins);
  const funds={id:'group_actual_work_0001',mode:'rule',system:'social',
   operation:'groupContribute',params:{
    groupId:id,activity:'I spend time documenting a shared public route safety note.',coins:3}};
  const work=Turn.execute(save,funds);
  A.equal(work.applied,true);
  A.equal(work.output.rules.verifiedResult,false);
  A.equal(Turn.execute(save,funds).duplicate,true);
  const final=E.importGame(FS.readFileSync(save,'utf8'));
  A.equal(G.lookup(final.table.realm,id).funds,3);
  A.equal(final.player.coins,s.player.coins-3);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Open evolving group foundation: flexible kinds, truthful solo origins, non-guaranteed independent work, new NPC worker circles, public enquiry and private replay');
