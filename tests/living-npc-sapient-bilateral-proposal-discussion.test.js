'use strict';
// Real original encounter + independently generated human + two genuine
// personal choice streams; an authored disposable local discussion witness
// is not a predetermined agreement, contract or bond.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),R=require('../rules'),C=require('../rules/core'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Atlas=require('../world/atlas'),Person=require('../world/sapient-beast-persons'),
 Bridge=require('../rules/independent-sapient-proposal-discussions'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const s=E.newGame({name:'Disposable independent sapient proposal',seed:927801,path:'undecided'});
A.equal(E.dispatch(s,'travel forest').ok,true);
let b=null;
for(let n=0;n<260&&!b;n++){
 A.equal(E.dispatch(s,'explore').ok,true);
 const candidate=s.beasts[s.encounter.beastId];
 if(E.SPECIES[candidate.species].intelligence==='sapient'&&!s.encounter.threat&&
  !/hostile|agitated|terrified|panicked|fleeing|desperate/i.test(candidate.mood)){
  const meet=R.act(s,{system:'social',operation:'meetSapientBeast',params:{}});
  if(meet.freelyEngaged){b=candidate;break;}
 }
 if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
}
A.ok(b,'Real independently willing sapient encounter required');
const w=Realm.ensure(s),roster=People.ensure(w),site=s.world.location,
 region=Atlas.R[Atlas.LOCATION_REGION[site]],day=Math.floor(s.world.minutes/1440),
 contact=b.sapientLife.history.find(x=>x.type==='personally-witnessed-contact'&&x.willingness);
A.equal(People.siteFor(region.id),site);
// Disposable world demand fixture uses actual individual generator.
const eco=w.ecosystems[region.id],country=w.countries[region.polity];
Object.assign(eco,{quality:75,pressure:14,water:80,forage:80});
Object.assign(country,{prosperity:75,stability:80});
const demand=People.sourceDemand(w,region);
A.ok(demand);
let mutual=null,humanRefusal=0,beastRefusal=0,results=[];
for(let n=0;n<20;n++){
 const p=People._debug.make(w,roster,day,demand);p.shift=People.shift(p,day,w);
 const terms={beastId:b.id,id:'individual_proposal_'+n,kind:'voluntary habitat conversation',
  purpose:'An offer to explore possible cooperative habitat observations without committing either party.',
  humanDuty:'A proposed human contribution to be discussed before any real commitment or payment.',
  beastDuty:'A proposed contribution that the independent sapient individual may decline entirely.',
  protections:'Both parties retain ordinary welfare protections and the right not to participate.',
  termination:'Neither party is bound and each can end the discussion without a duty.',
  communication:'Supported local signs and clearly explained voluntary terms.',durationDays:7};
 C.event(s,'story',p.name+' considers the sapient person’s publicly offered habitat cooperation proposal in a locally witnessed conversation.',{
  origin:Bridge.WITNESS,actorId:p.actorId,beastId:b.id,location:site,
  minute:s.world.minutes,contactHash:hash(contact),terms,
  comprehension:'A concrete limited proposal was explained with visibly understood specific local signs.',
  communication:'Witnessed shared signs, not telepathy',
  noAssumedSharedLanguage:true,publicInvitationOnly:true});
 const req={actorId:p.actorId,beastId:b.id,witnessIndex:s.log.length-1},
  snapshot=E.exportGame(s),rng=s.rngState,clock=s.world.minutes,
  humanRng=p.rngState,beastRng=b.sapientLife.rngState;
 A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientProposalDiscussion',
  params:{...req,accepted:true}}),/never assigned consent/);
 A.equal(E.exportGame(s),snapshot);
 const result=R.act(s,{system:'bond',operation:'npcSapientProposalDiscussion',params:req}),
  receipt=p.originalSapientProposalDiscussions[0],q=receipt.source;
 A.equal(Bridge.verify(s,p),true);
 A.equal(q.humanChoice.rngBefore,humanRng);
 A.equal(q.humanChoice.rngAfter,p.rngState);
 A.equal(q.beastChoice?.rngBefore??beastRng,beastRng);
 A.equal(q.beastChoice?.rngAfter??beastRng,b.sapientLife.rngState);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,clock);
 A.equal(result.legalDutiesEstablished,false);
 A.equal(result.magicalBondEstablished,false);
 A.equal(s.table?.bondRecords?.[b.id],undefined);
 A.equal(s.player.partnerIds.includes(b.id),false);
 const saved=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientProposalDiscussion',params:req}),
  /do not reroll willingness/);
 A.equal(E.exportGame(s),saved);
 const view=Foundation.gmDossier(w,p.actorId,s).earnedEvidence.beastRelationships;
 A.equal(view.verifiedPartners,null);
 A.equal(view.sourceVerifiedProposalDiscussions[0].observedOutcome,result.observedOutcome);
 results.push(result.observedOutcome);
 if(result.mutuallyInterested)mutual=p;
 if(result.observedOutcome==='human-declined')humanRefusal++;
 if(['beast-declined','beast-proposed-changes'].includes(result.observedOutcome))beastRefusal++;
 if(mutual&&humanRefusal&&beastRefusal)break;
}
A.ok(mutual,'At least one genuinely mutually interested disposable pair');
A.ok(humanRefusal>0,'A human must be free to refuse; beast draw not consumed');
A.ok(beastRefusal>0,'The sapient person may refuse or request alternatives');
const save=E.exportGame(s),copy=E.importGame(save),cp=Realm.peek(copy).emergentPeople.people[mutual.id];
A.equal(Bridge.verify(copy,cp),true);
const forged=cp.originalSapientProposalDiscussions[0];
forged.source.beastChoice.rngAfter=1;forged.seal=hash(forged.source);
A.equal(Bridge.verify(copy,cp),false,'Rehashed fake beast decision is not genuine willingness');
console.log('INDEPENDENT HUMAN–SAPIENT PROPOSAL DISCUSSION PASS '+JSON.stringify({results,humanRefusal,beastRefusal,mutual:true,noBond:true}));
