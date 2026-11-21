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
A.deepEqual(Lineage.mappingSpec(3,121,16,1,2),{dc:18,stamina:2,modifier:7});
A.deepEqual(Lineage.mappingSpec(10,60,12,0,-1),{dc:19,stamina:1,modifier:0});
let accepted=0,declined=0,success=0;
for(let n=0;n<16;n++){
 const s=E.newGame({name:'Disposable real Origin study',seed:927510+n*37}),
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
 s.chatRuntime.scene=p.name+' considers a bounded locally observed examination of that exact mechanism.';
 Core.event(s,'story',s.chatRuntime.scene,{origin:Lineage.MAP,sourceId:id,
  actorId:p.actorId,location:s.world.location,measuredIndividualResponse:description,independentFailureLimit:description});
 const params={actorId:p.actorId,sourceId:id,witnessIndex:s.log.length-1,minutes:90},
  snapshot=E.exportGame(s),before=body.stamina,playerRng=s.rngState,playerOrigin=structuredClone(s.player.origin),personalRng=p.rngState;
 A.throws(()=>R.act(s,{system:'origin',operation:'npcLineageMap',params:{...params,mapped:true}}),/duration only/);
 A.equal(E.exportGame(s),snapshot);
 const result=R.act(s,{system:'origin',operation:'npcLineageMap',params}),
  row=p.originalOriginPatternResearch.sessions[0],a=row.source;
 A.equal(NPC.verify(s,p),true);A.equal(a.rngBefore,personalRng);A.equal(a.rngAfter,p.rngState);
 A.equal(s.rngState,playerRng);A.deepEqual(s.player.origin,playerOrigin);
 A.equal(body.stamina,before-a.staminaSpent);A.equal(result.independentlyAccepted,a.accepted);
 A.deepEqual(p.knownTechniques,[]);
 A.equal(result.noRightsTransferOrClinicalCompatibilityOrTrait,true);
 if(a.accepted){
  accepted++;
  A.equal(a.check.dc,16);A.equal(a.staminaSpent,1);
  A.equal(a.check.modifier,Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2)+Potential.bonus(a.aptitude));
  if(a.check.success)success++;
 }else{declined++;A.equal(a.check,null);A.equal(a.staminaSpent,0);}
 const saved=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'origin',operation:'npcLineageMap',params}),/fresh|present original adult/);
 A.equal(E.exportGame(s),saved);
 const copy=E.importGame(saved),cp=Realm.peek(copy).emergentPeople.people[p.id];
 A.equal(NPC.verify(copy,cp),true);
 const status=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
 A.equal(status.originalOriginPatternResearch.patterns[0].progress,a.progressAfter);
 const bad=cp.originalOriginPatternResearch.sessions[0];
 bad.source.progressAfter=bad.source.progressAfter===3?2:3;bad.seal=hash(bad.source);
 A.equal(NPC.verify(copy,cp),false,'Resealed fabricated mapping progress is rejected');
 if(accepted&&declined&&success)break;
}
A.ok(accepted&&declined&&success,'Bounded native sample must demonstrate paid mapping, refusal and earned progress');
console.log('INDEPENDENT EXACT ORIGIN MAPPING PASS '+JSON.stringify({accepted,declined,success,noRightsOrTrait:true}));
