'use strict';
// Extended assessment; disposable GM-authored self-endogenous SOURCE and
// rights only. No assigned consent to procedures, mastery, traits, checks,
// successful compatibility, clinical recovery or evolutionary progression.
const A=require('node:assert/strict'),E=require('../engine'),R=require('../rules'),Core=require('../rules/core'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Atlas=require('../world/atlas'),Combat=require('../rules/combat'),
 World=require('../rules/world'),Presence=require('../world/person-presence'),
 Lineage=require('../rules/beast-origin-lineage'),Research=require('../rules/independent-original-origin-research'),
 Integration=require('../rules/independent-original-origin-integration'),PC=require('../rules/beast-origin-integration'),
 Higher=require('../rules/independent-original-higher-architectures');
const hash=Lineage.hash,b=E.HUMAN_ORIGIN_BASELINE;
const totals={maps:0,screened:0,fullyCompatible:0,seeded:0,completed:0,careAttempts:0,restAccepted:0,restRefused:0};
const reports=[];
for(let n=0;n<12;n++){
 const s=E.newGame({name:'Disposable real Origin study',seed:941100+n*47}),
  w=Realm.ensure(s),roster=People.ensure(w),
  region=Atlas.regions.find(x=>E.LOCATIONS[People.siteFor(x.id)]?.biome==='settlement'),
  eco=w.ecosystems[region.id],country=w.countries[region.polity];
 Object.assign(eco,{quality:75,pressure:14,water:80,forage:80});
 Object.assign(country,{prosperity:75,stability:80});
 const demand=People.sourceDemand(w,region);A.ok(demand);
 const p=People._debug.make(w,roster,0,demand);p.shift=People.shift(p,0,w);
 s.world.location=People.siteFor(p.regionId);s.world.minutes=600;s.chatRuntime||={};
 const initial=p.name+' is an uninjured, unarmed, unarmoured adult here at '+s.world.location+', directly witnessed and conscious.';
 s.chatRuntime.scene=initial;
 Lives.enroll(s,{actorId:p.actorId,interests:['academic','craft'],motivation:'An independent wish to study the exact observed origin pattern of their own original metabolic tissue and its possible human expression',witness:initial});
 const linked=R.act(s,{system:'health',operation:'linkWitnessedHuman',params:{npcId:p.actorId,witness:initial}});
 const body=Combat.get(s,linked.id),id='disposable_individual_origin';
 const description='A distinctly observed existing original tissue mechanism, its actual metabolic function, and its finite physical limits are recorded in a disposable test source.';
 Core.event(s,'story',p.name+' observes a separately documented candidate Origin mechanism.',{
  origin:Lineage.SOURCE,sourceId:id,actorId:p.actorId,location:s.world.location});
 const observation=structuredClone(s.log.at(-1)),q={origin:Lineage.SOURCE,sourceId:id,
  traitName:'Measured individual tissue candidate',route:'origin-cultivation',
  exactObservedMechanism:description,originalBiology:description,magicalRequirements:description,
  spiritualRequirements:description,metabolicLimits:description,conflictLimit:description,
  integrationLoad:1,energyMode:'metabolic',humanExpression:description,independentAdaptationLimit:description,effectAdapter:'local-footing',rights:{mode:'authenticated-self-research',verified:true,originalProvenance:description},
  observation,observationHash:hash(observation),minute:s.world.minutes,location:s.world.location};
 s.table.originTraitSources||={};s.table.originTraitSources[id]={origin:Lineage.SOURCE,source:q,seal:hash(q)};
 A.equal(Lineage.gmSource(s,id,p.actorId).z.seal,hash(q));
 A.throws(()=>Lineage.gmSource(s,id),/different individual/);

 Lineage.archive(s,observation);
 Core.event(s,'story',p.name+' is the independently evidenced subject and holder of this existing self-endogenous source.',{
  origin:PC.AUTH,actorId:p.actorId,sourceId:id,mode:'self-endogenous',location:s.world.location,
  verifiedSourceRights:description,observedOriginalMaterialIdentity:description});
 const authWitness=structuredClone(s.log.at(-1));Lineage.archive(s,authWitness);
 const auth={origin:PC.AUTH,sourceId:id,lineageSeal:hash(q),mode:'self-endogenous',
  material:{mode:'endogenous',sourceIdentity:description},minute:s.world.minutes,
  location:s.world.location,witness:authWitness,witnessHash:hash(authWitness)};
 s.table.originLineageAuthorisations||={};
 s.table.originLineageAuthorisations[id]={origin:PC.AUTH,source:auth,seal:hash(auth)};
 A.equal(PC.authorisation(s,id,hash(q),q,p.actorId).seal,hash(auth));
 const site=s.world.location,clinical={observedUnmodifiedOriginAndEvolution:true,independentBaselineMeasurement:description,
  measuredHumanOriginCapacity:b.capacity,measuredHumanOriginLoad:b.load,
  measuredEvolutionStage:b.evolutionStage,measuredEvolutionStability:b.evolutionStability,
  measuredSoulStability:b.soulStability,measuredStableHumanOriginTraits:[]};
 const report={seed:s.seed,mapped:false,screenAttempts:{},promising:[],stageAttempts:{},refused:0,restAccepted:0,restRefused:0,last:null};
 function present(){return !!Presence.resolve(Realm.peek(s),p.actorId,site,Math.floor(s.world.minutes/1440),s.world.minutes%1440)?.presence;}
 function advanceTo(target){const old=s.world.minutes;if(target>old){E.advance(s,target-old);World.finalizeTime(s,old);}}
 function observe(origin,detail={}){
  s.chatRuntime.scene=p.name+' considers an individually measured original clinical procedure in this explicitly disposable scene.';
  Core.event(s,'story',s.chatRuntime.scene,{origin,actorId:p.actorId,sourceId:id,location:site,
   measuredIndividualResponse:description,independentFailureLimit:description,
   observedHumanMechanism:description,observedMetabolicCost:description,
   independentIndividualEndogenousRights:description,actualSelfOwnedMechanism:true,...detail});
  return {actorId:p.actorId,sourceId:id,witnessIndex:s.log.length-1,minutes:90};
 }
 const startDay=Math.floor(s.world.minutes/1440);
 for(let day=startDay;day<startDay+120;day++){
  advanceTo(day*1440+600);
  if(p.status!=='active'||body.status!=='ok')break;
  if(present()&&body.wounds.every(x=>x===0)&&body.stamina>=3&&!Higher.usedDay(p,day)){
   const research=Research.privateStatus(s,p)?.patterns?.find(x=>x.sourceId===id);
   const integ=Integration.privateStatus(s,p);
   if(!research?.personallyMapped){
    const out=R.act(s,{system:'origin',operation:'npcLineageMap',params:observe(Lineage.MAP)});
    if(out.mapped&&!report.mapped){report.mapped=true;totals.maps++;}
    if(!out.independentlyAccepted)report.refused++;
   }else if(!integ){
    const axis=Lineage.AXES.find(k=>research.compatibilityResults?.[k]!=='promising');
    if(axis){
     const out=R.act(s,{system:'origin',operation:'npcLineageScreen',params:{...observe(Lineage.SCREEN,{axis,...clinical}),axis}});
     report.screenAttempts[axis]=(report.screenAttempts[axis]||0)+1;
     const row=p.originalOriginPatternResearch.sessions.at(-1).source;
     if(!out.independentlyAccepted)report.refused++;
     if(row.result==='promising'&&!report.promising.includes(axis))report.promising.push(axis);
     totals.screened++;
    }else {
     const proof=Research.integrationProof(s,p,id);A.ok(proof);
     if(!report.compatible){report.compatible=true;totals.fullyCompatible++;}
     const before=body.stamina,pcOrigin=structuredClone(s.player.origin);
     const out=R.act(s,{system:'origin',operation:'npcIntegrationStage',params:observe(PC.STAGE,{step:3})});
     const row=p.originalOriginIntegrations.rows.at(-1).source;
     A.equal(Integration.verify(s,p),true);A.equal(body.stamina,before-row.staminaSpent);
     A.deepEqual(s.player.origin,pcOrigin);A.equal(row.after.load,row.check?.success?1:0);
     report.stageAttempts[3]=(report.stageAttempts[3]||0)+1;
     if(row.check?.success)totals.seeded++;
     if(!out.independentlyAccepted)report.refused++;
    }
   }else if(integ.next<=8||integ.strain>0){
    const step=integ.strain>=5||integ.next===9?'care':integ.next,
     params=observe(PC.STAGE,{step}),before=body.stamina;
    const op=step==='care'?'npcIntegrationCare':'npcIntegrationStage';
    const out=R.act(s,{system:'origin',operation:op,params}),row=p.originalOriginIntegrations.rows.at(-1).source;
    A.equal(Integration.verify(s,p),true);
    A.equal(row.step,step);A.equal(row.staminaSpent,out.independentlyAccepted?(step==='care'?2:PC.RULES[step].cost):0);
    A.equal(body.stamina,before-row.staminaSpent);
    if(step===3&&row.check?.success)totals.seeded++;
    if(step==='care')totals.careAttempts++;else report.stageAttempts[step]=(report.stageAttempts[step]||0)+1;
    if(!out.independentlyAccepted)report.refused++;
    if(step===8&&row.check?.success){totals.completed++;break;}
   }
  }
  // Real evening opportunity; an independent refusal remains refusal.
  // Original Combat completedNight owns all wound and Stamina recovery.
  if(body.stamina<body.maxStamina||body.wounds.some(x=>x>0)){
   advanceTo(day*1440+960);
   if(present()&&body.status==='ok'&&(p.originalOvernightRestDecisions||[]).length<90&&
    !p.originalOvernightRestDecisions?.some(x=>x.source.day===day)){
    const witness=p.name+' is physically here and considers sleeping in an actually prepared safe settlement room with a bed.';
    s.chatRuntime.scene=witness;
    const out=R.act(s,{system:'health',operation:'witnessedNpcNightSleep',params:{actorId:p.actorId,witness}});
    if(out.freelyAccepted){report.restAccepted++;totals.restAccepted++;}
    else {report.restRefused++;totals.restRefused++;}
   }
  }
 }
 if(p.originalOriginPatternResearch)A.equal(Research.verify(s,p),true);
 if(p.originalOriginIntegrations){
  report.last=Integration.privateStatus(s,p);
  const save=E.exportGame(s),copy=E.importGame(save),person=Realm.peek(copy).emergentPeople.people[p.id];
  A.equal(Integration.verify(copy,person),true);
  const row=person.originalOriginIntegrations.rows.at(-1);
  row.source.after.load+=1;row.seal=hash(row.source);
  A.equal(Integration.verify(copy,person),false,'A resealed fabricated load cannot pass the original integration source');
 }
 reports.push(report);
 if(totals.completed&&totals.careAttempts)break;
}
A.ok(totals.maps>0,'Longitudinal test must genuinely complete an individual map');
A.ok(totals.screened>0,'Longitudinal test must genuinely exercise a clinical axis');
console.log('INDEPENDENT ORIGIN ENDOGENOUS LONGITUDINAL ASSESSMENT '+JSON.stringify({totals,reports}));
