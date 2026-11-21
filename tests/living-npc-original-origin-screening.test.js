'use strict';
// Authored disposable exact trait-source observations, no assigned accept,
// roll, donor right, compatibility, integration or stable trait.
const A=require('node:assert/strict'),E=require('../engine'),R=require('../rules'),
 Core=require('../rules/core'),Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Atlas=require('../world/atlas'),Combat=require('../rules/combat'),
 Foundation=require('../world/person-mechanical-foundations'),
 Lineage=require('../rules/beast-origin-lineage'),NPC=require('../rules/independent-original-origin-research'),
 Potential=require('../rules/potential-mechanics');
const hash=Lineage.hash;
const World=require('../rules/world'),Presence=require('../world/person-presence');
const b=E.HUMAN_ORIGIN_BASELINE;
A.deepEqual(b,{capacity:3,load:0,evolutionStage:0,evolutionStability:100,soulStability:95});
const unmodified={origin:{capacity:b.capacity,load:0,stableTraits:[]},
 evolutionStability:100,soulStability:95,externalThroughput:false};
A.deepEqual(Lineage.screeningRisks('physical',{integrationLoad:4,energyMode:'metabolic'},unmodified,{}),
 ['Original human biological Origin capacity is already insufficient']);
A.deepEqual(Lineage.screeningRisks('energetic',{integrationLoad:1,energyMode:'external'},unmodified,{}),
 ['No established external magical or meridian energy throughput']);
A.deepEqual(Lineage.screeningRisks('energetic',{integrationLoad:1,energyMode:'metabolic'},unmodified,{}),[]);
A.deepEqual(Lineage.screeningSpec(1,121,16,1,2,['risk']),{dc:17,stamina:2,modifier:7});
A.equal(Lineage.screenResult({success:true},['risk']),'caution');
A.equal(Lineage.screenResult({success:true},[]),'promising');
A.equal(Lineage.screenResult({success:false},[]),'inconclusive');
const counts={mapped:0,accepted:0,refused:0,promising:0,attemptsByAxis:{}};
for(let n=0;n<96;n++){
 const s=E.newGame({name:'Disposable real Origin study',seed:937510+n*37}),
  w=Realm.ensure(s),roster=People.ensure(w),
  region=Atlas.regions.find(x=>People.siteFor(x.id)),
  eco=w.ecosystems[region.id],country=w.countries[region.polity];
 Object.assign(eco,{quality:75,pressure:14,water:80,forage:80});
 Object.assign(country,{prosperity:75,stability:80});
 const demand=People.sourceDemand(w,region);A.ok(demand);
 const p=People._debug.make(w,roster,0,demand);p.shift=People.shift(p,0,w);
 s.world.location=People.siteFor(p.regionId);s.world.minutes=600;s.chatRuntime||={};
 const initial=p.name+' is an uninjured, unarmed, unarmoured adult here at '+s.world.location+', directly witnessed and conscious.';
 s.chatRuntime.scene=initial;
 Lives.enroll(s,{actorId:p.actorId,interests:['academic','craft'],motivation:'An independent wish to study the exact observed origin pattern without assuming tissue rights',witness:initial});
 const linked=R.act(s,{system:'health',operation:'linkWitnessedHuman',params:{npcId:p.actorId,witness:initial}});
 const body=Combat.get(s,linked.id),id='disposable_individual_origin';
 const description='A distinctly observed existing original tissue mechanism, its actual metabolic function, and its finite physical limits are recorded in a disposable test source.';
 Core.event(s,'story',p.name+' observes a separately documented candidate Origin mechanism.',{
  origin:Lineage.SOURCE,sourceId:id,actorId:p.actorId,location:s.world.location});
 const observation=structuredClone(s.log.at(-1)),q={origin:Lineage.SOURCE,sourceId:id,
  traitName:'Measured individual tissue candidate',route:'origin-cultivation',
  exactObservedMechanism:description,originalBiology:description,magicalRequirements:description,
  spiritualRequirements:description,metabolicLimits:description,conflictLimit:description,
  integrationLoad:1,energyMode:'metabolic',rights:{mode:'unresolved',verified:false,originalProvenance:description},
  observation,observationHash:hash(observation),minute:s.world.minutes,location:s.world.location};
 s.table.originTraitSources||={};s.table.originTraitSources[id]={origin:Lineage.SOURCE,source:q,seal:hash(q)};
 A.equal(Lineage.gmSource(s,id,p.actorId).z.seal,hash(q));
 A.throws(()=>Lineage.gmSource(s,id),/different individual/);

 if(body.stamina<3)continue;
 const site=s.world.location;
 function observe(origin,detail={}){
  s.chatRuntime.scene=p.name+' considers a distinctly measured original individual clinical procedure.';
  Core.event(s,'story',s.chatRuntime.scene,{origin,sourceId:id,actorId:p.actorId,location:site,
   measuredIndividualResponse:description,independentFailureLimit:description,...detail});
  return {actorId:p.actorId,sourceId:id,witnessIndex:s.log.length-1,minutes:90};
 }
 const clinical={observedUnmodifiedOriginAndEvolution:true,independentBaselineMeasurement:description,
  measuredHumanOriginCapacity:b.capacity,measuredHumanOriginLoad:b.load,
  measuredEvolutionStage:b.evolutionStage,measuredEvolutionStability:b.evolutionStability,
  measuredSoulStability:b.soulStability,measuredStableHumanOriginTraits:[]};
 const premature={...observe(Lineage.SCREEN,{axis:'physical',...clinical}),axis:'physical'},
  pre=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'origin',operation:'npcLineageScreen',params:premature}),/completed original mapping/);
 A.equal(E.exportGame(s),pre);
 function nextDay(){
  const old=s.world.minutes,next=(Math.floor(old/1440)+1)*1440+600;
  E.advance(s,next-old);World.finalizeTime(s,old);
  return !!Presence.resolve(Realm.peek(s),p.actorId,site,Math.floor(next/1440),600)?.presence&&
   p.status==='active'&&body.status==='ok'&&body.wounds.every(x=>x===0)&&body.stamina>=1;
 }
 let map=null;
 // No assumption that one check can produce three mapping points. Allow the
 // same person repeated days of actual research and naturally occurring rest.
 for(let day=0;day<24;day++){
  if(day&&!nextDay())break;
  map=R.act(s,{system:'origin',operation:'npcLineageMap',params:observe(Lineage.MAP)});
  if(map.mapped)break;
 }
 if(!map?.mapped)continue;
 counts.mapped++;
 for(const axis of Lineage.AXES){
  if(!nextDay())break;
  // Incorrect clinical values are not a supplied modifier or an acceptable
  // baseline: the source adapter reads original anatomy and exact evidence.
  const fake={...observe(Lineage.SCREEN,{axis,...clinical,measuredHumanOriginCapacity:99}),axis},
   snap=E.exportGame(s);
  A.throws(()=>R.act(s,{system:'origin',operation:'npcLineageScreen',params:fake}),/exact source-verified Soul condition/);
  A.equal(E.exportGame(s),snap);
  const params={...observe(Lineage.SCREEN,{axis,...clinical}),axis},
   saved=E.exportGame(s),before=body.stamina,pcRng=s.rngState,pcOrigin=structuredClone(s.player.origin);
  A.throws(()=>R.act(s,{system:'origin',operation:'npcLineageScreen',params:{...params,result:'promising'}}),/duration only/);
  A.equal(E.exportGame(s),saved);
  const result=R.act(s,{system:'origin',operation:'npcLineageScreen',params}),row=p.originalOriginPatternResearch.sessions.at(-1),
   receipt=row.source;
  A.equal(NPC.verify(s,p),true);A.equal(result.seedingApproved,false);A.equal(result.noNewTrait,true);
  A.equal(s.rngState,pcRng);A.deepEqual(s.player.origin,pcOrigin);
  A.equal(body.stamina,before-receipt.staminaSpent);
  A.deepEqual(receipt.risks,[]);
  counts.attemptsByAxis[axis]=(counts.attemptsByAxis[axis]||0)+1;
  if(receipt.accepted){
   counts.accepted++;if(receipt.result==='promising')counts.promising++;
   A.equal(receipt.check.dc,16);A.equal(receipt.staminaSpent,1);
   const attribute=Lineage.METHODS[axis][0],score=p.mechanicalFoundation.unassessedPotential[Potential.ORIGIN_AXES[axis]];
   A.equal(receipt.check.modifier,Math.floor((p.mechanicalFoundation.baselineAttributes[attribute]-10)/2)+Potential.bonus(score));
  }else{counts.refused++;A.equal(receipt.result,'declined');A.equal(receipt.staminaSpent,0);}
  const cp=E.importGame(E.exportGame(s)),person=Realm.peek(cp).emergentPeople.people[p.id];
  A.equal(NPC.verify(cp,person),true);
  const bad=person.originalOriginPatternResearch.sessions.at(-1);
  bad.source.result=receipt.result==='promising'?'caution':'promising';bad.seal=hash(bad.source);
  A.equal(NPC.verify(cp,person),false,'Resealed altered clinical outcome cannot authorise seeding');
 }
 if(counts.accepted&&counts.refused&&Lineage.AXES.every(k=>counts.attemptsByAxis[k]>0))break;
}
A.ok(counts.mapped&&counts.accepted&&counts.refused&&Lineage.AXES.every(k=>counts.attemptsByAxis[k]>0),
 'Bounded source-born sample must genuinely complete mapping and exercise all independent clinical axes');
console.log('INDEPENDENT EXACT ORIGIN CLINICAL SCREENING PASS '+JSON.stringify(counts));
