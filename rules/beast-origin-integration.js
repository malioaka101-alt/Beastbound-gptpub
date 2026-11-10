'use strict';
// Master §24 integration 3–8, on the SAME individually mapped Origin source.
// Source authorisation and witnesses are GM-established real-world facts,
// never player-supplied outcomes. No species ability or human stage is free.
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 U=require('./unified'),Combat=require('./combat'),
 Lineage=require('./beast-origin-lineage');
const ORIGIN='source-earned-human-origin-integration-v1',
 AUTH='gm-attested-origin-material-rights-v1',
 STAGE='witnessed-human-origin-integration-stage-v1',
 CARE='witnessed-human-origin-rejection-care-v1',
 USE='witnessed-human-origin-footing-expression-v1';
const STEPS=Object.freeze({
 3:'Trait Seeding',4:'Rejection Window',5:'Stabilisation',
 6:'Expression',7:'Adaptation',8:'Personal Evolution'
});
const RULES=Object.freeze({
 3:{dc:16,attribute:'con',skill:'medicine',minimum:30,cost:3},
 4:{dc:18,attribute:'con',skill:'medicine',minimum:90,cost:3},
 5:{dc:17,attribute:'wis',skill:'medicine',minimum:60,cost:2},
 6:{dc:17,attribute:'dex',skill:'survival',minimum:30,cost:2},
 7:{dc:18,attribute:'con',skill:'survival',minimum:60,cost:3},
 8:{dc:19,attribute:'wis',skill:'research',minimum:90,cost:3}
});
const hash=Lineage.hash,integer=(x,a=0,b=1000000000)=>
 Number.isInteger(x)&&x>=a&&x<=b;
const prose=(s,n=25)=>typeof s==='string'&&s.trim().length>=n&&s.length<=900;
const validId=s=>typeof s==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(s);
const own=(p,k)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>k.includes(x));
function authorisation(s,id,seal,q){
 const rec=s.table?.originLineageAuthorisations?.[id],a=rec?.source,
  w=a?.witness,d=w?.details;
 if(!rec||rec.origin!==AUTH||rec.seal!==hash(a)||
  a.origin!==AUTH||a.sourceId!==id||a.lineageSeal!==seal||
  !['self-endogenous','informed-donation','licensed-held-relic',
   'verified-self-synthesis'].includes(a.mode)||
  !['endogenous','inventory'].includes(a.material?.mode)||
  !prose(a.material?.sourceIdentity)||
  !integer(a.minute,q.minute,s.world.minutes)||
  w?.type!=='story'||a.witnessHash!==hash(w)||
  d?.origin!==AUTH||d.sourceId!==id||d.mode!==a.mode||
  d?.location!==a.location||!prose(d?.verifiedSourceRights)||
  !prose(d?.observedOriginalMaterialIdentity)||
  (a.mode==='informed-donation'&&
   (d?.donorConsent!==true||!prose(d?.individualDonorConsent)))||
  (a.mode==='licensed-held-relic'&&
   !prose(d?.holderLicence))||
  (a.material.mode==='endogenous'&&
   !['self-endogenous','verified-self-synthesis'].includes(a.mode))||
  (a.material.mode==='inventory'&&
   (!validId(a.material.item)||!Object.hasOwn(E.RESOURCES,a.material.item)||
    !integer(a.material.quantity,1,20)||d?.item!==a.material.item||
    d?.quantity!==a.material.quantity))||
  (a.mode==='self-endogenous'&&q.route!=='ancestral'&&
   q.route!=='origin-cultivation')||
  (a.mode==='verified-self-synthesis'&&q.route!=='synthetic-trait'&&
   q.route!=='origin-cultivation'))
  throw Error('An independent ethically authenticated, identity-matched source, human ownership or informed donor right is required');
 return rec;
}
function context(s,id,{allowCompleted=false}={}){
 if(!validId(id))throw Error('An original named individual lineage source is required');
 if(!Lineage.verify(s))throw Error('Earlier original lineage source or receipts fail integrity');
 const {z,q}=Lineage.gmSource(s,id),r=Lineage.records(s)[id];
 if(!r?.complete||!r.mapping.length)
  throw Error('The actual individual trait must first be personally mapped');
 if(!['metabolic','arcane','meridian','soul','hybrid'].includes(q.energyMode)||
  !['local-footing'].includes(q.effectAdapter)||
  !prose(q.humanExpression)||!prose(q.independentAdaptationLimit))
  throw Error('This individual trait lacks a verifiable supported human biological effect and energy route');
 if(!Lineage.AXES.every(x=>r.results[x]==='promising'||
  (x==='energetic'&&q.energyMode==='metabolic'&&r.results[x]==='caution')))
  throw Error('Source-specific human bodily, energetic, spiritual and conflict compatibility must be resolved before seeding');
 const auth=authorisation(s,id,z.seal,q),integr=r.integration;
 if(integr?.complete&&!allowCompleted)
  throw Error('The same original human-adapted trait has already completed its personal evolution');
 if(!E.LOCATIONS[s.world?.location]||s.battle||s.encounter||
  s.table?.combatants?.player?.status!=='ok')
  throw Error('Origin integration requires a real present safe physical scene and living original body');
 return {z,q,r,auth,integr};
}
function stageWitness(s,index,id,step){
 if(!integer(index,0,s.log.length-1))
  throw Error('An original source-witnessed physiological trial is required');
 const w=s.log[index],d=w?.details;
 if(w?.type!=='story'||!prose(w.text,16)||
  d?.origin!==STAGE||d.sourceId!==id||
  d.step!==step||d.location!==s.world.location||
  !prose(d.measuredIndividualResponse)||
  !prose(d.independentFailureLimit)||
  !prose(d.observedHumanMechanism)||
  !prose(d.observedMetabolicCost))
  throw Error('The actual individual human biological stage, independent failure, and metabolic load must be witnessed before a new check');
 return structuredClone(w);
}
function verifiedRoll(a,rule,q){
 if(!a||a.rollEvent?.type!=='roll'||a.rollEventHash!==hash(a.rollEvent)||
  hash(a.rollEvent.details)!==hash(a.check)||
  !integer(a.roll,1,20)||a.roll!==a.check?.roll||
  a.check.dc!==rule.dc+Math.min(4,q.integrationLoad)||
  a.check.modifier!==a.attributeModifier+2*a.skillRank||
  !integer(a.attributeScore,1,30)||!integer(a.skillRank,0,5)||
  a.attributeModifier!==Math.floor((a.attributeScore-10)/2)||
  a.check.naturalBonus!==C.naturalAdjustment(a.roll)||
  a.check.total!==a.roll+a.check.modifier+a.check.naturalBonus||
  a.check.margin!==a.check.total-a.check.dc||
  a.check.degree!==C.degree(a.check.margin,true)||
  a.check.success!==(a.check.margin>=0)||
  a.check.progress!==C.progress(a.check.degree))
  return false;
 return true;
}
function verifyRecord(s,r,q,seal){
 const t=r.integration;
 if(!t)return true;
 const auth=s.table?.originLineageAuthorisations?.[r.sourceId];
 if(t.origin!==ORIGIN||t.sourceSeal!==seal||
  t.authorisationSeal!==auth?.seal||
  !Array.isArray(t.attempts)||t.attempts.length===0||
  !integer(t.next,3,9)||t.complete!==(t.next===9)||
  !integer(t.strain,0,100)||
  !integer(t.reservedLoad,0,q.integrationLoad)||
  !Array.isArray(t.uses??[]))
  return false;
 try{authorisation(s,r.sourceId,seal,q)}catch{return false}
 let next=3,last=q.minute,strain=0,reserved=0;
 const witnesses=new Set();
 for(const item of t.attempts){
  const a=item?.source,rule=RULES[next];
  if(!a||item.origin!==ORIGIN||item.seal!==hash(a))return false;
  if(a.kind==='care'){
   if(a.origin!==ORIGIN||a.sourceId!==r.sourceId||
    !integer(a.minute,last,s.world.minutes)||
    !integer(a.minutes,45,480)||a.minute+a.minutes>s.world.minutes||
    a.staminaSpent!==2||a.strainBefore!==strain||strain<=0||
    !verifiedRoll(a,{dc:15},{integrationLoad:0})||
    a.strainAfter!==(a.check.success?Math.max(0,strain-2):strain)||
    !a.witness||a.witnessHash!==hash(a.witness)||
    a.witness.details?.origin!==CARE||
    a.witness.details?.sourceId!==r.sourceId||
    !prose(a.witness.details?.measuredIndividualResponse)||
    !prose(a.witness.details?.independentFailureLimit)||
    !prose(a.witness.details?.observedHumanMechanism)||
    !prose(a.witness.details?.observedMetabolicCost)||
    witnesses.has(a.witnessHash))return false;
   witnesses.add(a.witnessHash);
   strain=a.strainAfter;last=a.minute+a.minutes;
   continue;
  }
  if(!rule||a.origin!==ORIGIN||
   a.kind!=='stage'||a.step!==next||a.sourceId!==r.sourceId||
   !integer(a.minute,last,s.world.minutes)||
   !integer(a.minutes,rule.minimum,480)||
   a.minute+a.minutes>s.world.minutes||
   a.staminaSpent!==rule.cost||
   !verifiedRoll(a,rule,q)||
   !a.witness||a.witnessHash!==hash(a.witness)||
   a.witness.type!=='story'||
   a.witness.details?.origin!==STAGE||
   a.witness.details?.sourceId!==r.sourceId||
   a.witness.details?.step!==next||
   !prose(a.witness.details?.measuredIndividualResponse)||
   !prose(a.witness.details?.independentFailureLimit)||
   !prose(a.witness.details?.observedHumanMechanism)||
   !prose(a.witness.details?.observedMetabolicCost)||
   witnesses.has(a.witnessHash)||
   a.success!==a.check.success||
   a.strainBefore!==strain||
   a.strainAdded!==(a.step===4&&!a.success?3:
    a.check.degree==='severe failure'?3:0)||
   a.strainAfter!==Math.min(100,strain+a.strainAdded)||
   a.wounded!==(a.strainAdded>0)||
   a.rejectionBefore<0||
   a.rejectionAfter!==Math.min(100,a.rejectionBefore+
    (a.step===4&&!a.success?10:
     a.check.degree==='severe failure'?5:0))||
   a.loadAdded!==(a.step===3&&a.success?q.integrationLoad:0)||
   a.loadAfter!==a.loadBefore+a.loadAdded||
   !integer(a.loadBefore,0,100)||
   a.material?.mode!==(next===3?
    auth.source.material.mode:'none')||
   (next===3&&a.material.mode==='inventory'&&(
    a.material.item!==auth.source.material.item||
    a.material.quantity!==auth.source.material.quantity||
    !integer(a.material.before,a.material.quantity,1000000)||
    a.material.after!==a.material.before-a.material.quantity))||
   (next===3&&a.material.mode==='endogenous'&&
    a.material.originIdentityHash!==auth.seal)||
   (next!==3&&a.material.mode!=='none'))
   return false;
  witnesses.add(a.witnessHash);strain=a.strainAfter;
  reserved+=a.loadAdded;
  last=a.minute+a.minutes;
  if(a.success)next++;
 }
 if(t.next!==next||t.complete!==(next===9)||
  t.strain!==strain||t.reservedLoad!==reserved||
  (t.complete&&!s.player.origin.stableTraits.includes('human_origin_'+r.sourceId)))
  return false;
 const seenChecks=new Set();
 for(const receipt of t.uses||[]){
  const a=receipt?.source,sc=s.table?.sceneChecks?.[a?.checkId];
  if(receipt?.origin!==ORIGIN||!a||receipt.seal!==hash(a)||
   a.origin!==ORIGIN||a.kind!=='human-footing-expression'||
   a.sourceId!==r.sourceId||q.effectAdapter!=='local-footing'||
   !integer(a.minute,q.minute,s.world.minutes)||
   a.minute<a.sceneMinute||a.location!==a.witness?.details?.location||
   !a.witness||a.witnessHash!==hash(a.witness)||
   a.witness.details?.origin!==USE||
   a.witness.details?.sourceId!==r.sourceId||
   a.witness.details?.checkId!==a.checkId||
   !prose(a.witness.details?.observedFunction)||
   !prose(a.witness.details?.independentFailureLimit)||
   !sc||sc.checkId!==a.checkId||
   sc.origin!=='engine-local-scene'||
   sc.method!=='footing'||sc.location!==a.location||
   sc.worldMinute!==a.sceneMinute||
   sc.eventHash!==a.sceneEventHash||
   witnesses.has(a.witnessHash)||seenChecks.has(a.checkId))
   return false;
  witnesses.add(a.witnessHash);seenChecks.add(a.checkId);
  if(receipt.used===null){
   if(sc.used)return false;
  }else{
   const u=receipt.used;
   if(!u||!sc.used||u.checkId!==a.checkId||
    u.minute!==sc.checkedAtMinute||u.staminaSpent!==1||
    !integer(u.minute,a.minute,s.world.minutes)||
    u.rollEvent?.type!=='roll'||
    u.rollEventHash!==hash(u.rollEvent)||
    hash(u.rollEvent.details)!==hash(u.check)||
    u.check.modifier!==u.baseModifier+1||
    !integer(u.baseModifier,-100,100))
    return false;
  }
 }
 // The Origin resource is shared; other source-earned traits may also use
 // capacity. At a minimum, all still retained receipts must fit it.
 const total=Object.values(Lineage.records(s)).reduce((n,v)=>
  n+(v?.integration?.reservedLoad||0),0);
 if(s.player.origin.load<total||
  s.player.origin.load>s.player.origin.capacity)
  return false;
 return true;
}
function status(s){
 if(!Lineage.verify(s))throw Error('Original individual lineage proofs or integration ledger are inconsistent');
 return Object.entries(Lineage.records(s)).map(([id,r])=>({
  sourceId:id,phase:r.integration?.next||3,
  phaseName:STEPS[r.integration?.next]||'Personally evolved human expression',
  completed:!!r.integration?.complete,
  stagedAttempts:r.integration?.attempts?.length||0,
  earnedLoad:r.integration?.reservedLoad||0,
  physiologicalStrain:r.integration?.strain||0,
  onlyVerifiedIndividualSource:true,
  noAutomaticHumanStage:true
 }));
}
function stage(s,p={}){
 if(!own(p,['sourceId','witnessIndex','minutes'])||!validId(p.sourceId))
  throw Error('An existing individual Origin source and separately witnessed actual biological work are required');
 const {z,q,r,auth}=context(s,p.sourceId),t=r.integration;
 const step=t?.next||3,rule=RULES[step];
 if(!rule)throw Error('An individually evolved Origin trait cannot repeat the same completed stage');
 const minutes=p.minutes??Math.max(90,rule.minimum);
 if(!integer(minutes,rule.minimum,480))
  throw Error('Actual stage-specific clinical observation time is required');
 if(t?.strain>=5)
  throw Error('Observed human Origin tissue overload needs genuine treatment and recovery');
 if(step===4&&s.world.minutes<(t.attempts.find(a=>a.source.step===3&&a.source.success)?.source.minute||0)+90)
  throw Error('The original rejection window needs actual elapsed biological observation time');
 const observed=stageWitness(s,p.witnessIndex,p.sourceId,step),wHash=hash(observed);
 if(t?.attempts.some(a=>a.source.witnessHash===wHash)||
  r.mapping.some(a=>a.source.witnessHash===wHash)||
  Object.values(r.screens).flat().some(a=>a.source.witnessHash===wHash))
  throw Error('This biological stage experiment already consumed its original witness');
 const o=s.player.origin,ruleResource=s.player;
 if(!o||!integer(o.capacity,0,100)||!integer(o.load,0,100)||
  !Array.isArray(o.stableTraits)||o.load>o.capacity)
  throw Error('The original human Origin capacity and traits need reconciliation');
 if(step===3&&(o.candidate||o.load+q.integrationLoad>o.capacity))
  throw Error('An existing human Origin candidate or actual biological load prevents seeding a new trait');
 if(step>3&&o.candidate!==p.sourceId)
  throw Error('Only the original source-seeded human candidate can undergo its own rejection, adaptation and expression');
 const staminaSpent=rule.cost,now=s.world.minutes;
 if(!integer(ruleResource.stamina,staminaSpent,100000)||
  !integer(s.table.combatants.player.stamina,staminaSpent,100000))
  throw Error('Existing actual human Stamina cannot support this individual body experiment');
 let plan=null,material={mode:'none'};
 if(step===3){
  if(auth.source.material.mode==='inventory'){
   const {item,quantity}=auth.source.material;
   plan=U.planItems(s,{[item]:-quantity});
   const before=s.player.inventory?.[item]||0;
   material={mode:'inventory',item,quantity,before,after:before-quantity};
  }else material={mode:'endogenous',originIdentityHash:auth.seal};
 }
 const attr=C.int(ruleResource.attributes?.[rule.attribute],
  'original '+rule.attribute,1,30),
 rank=C.int(ruleResource.skills?.[rule.skill]?.rank??0,
  'original '+rule.skill,0,5),mod=Math.floor((attr-10)/2);
 const loadBefore=o.load,rejectionBefore=o.rejectionRisk||0,strainBefore=t?.strain||0;
 const check=C.check(s,{modifier:mod+2*rank,
  dc:rule.dc+Math.min(4,q.integrationLoad),
  label:'Human Origin '+STEPS[step]+' — '+q.traitName.slice(0,24)});
 const rollEvent=structuredClone(s.log.at(-1));
 if(plan)U.applyItems(s,plan);
 const strainAdded=step===4&&!check.success?3:
  check.degree==='severe failure'?3:0;
 const riskAdded=step===4&&!check.success?10:
  check.degree==='severe failure'?5:0;
 if(strainAdded){
  Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});
 }
 const success=check.success,loadAdded=step===3&&success?q.integrationLoad:0;
 if(loadAdded){
  o.load+=loadAdded;o.phase=3;o.candidate=p.sourceId;
 }
 o.rejectionRisk=Math.min(100,rejectionBefore+riskAdded);
 if(success&&step===8){
  const stable='human_origin_'+p.sourceId;
  if(o.stableTraits.includes(stable))throw Error('Stable human Origin trait cannot be awarded twice');
  o.stableTraits.push(stable);
  o.phase=0;o.candidate=null;
  // The expression is a stable *human* trait, not a beast's ability list or
  // an automatic Human Evolution stage. The same Origin load stays occupied.
 }
 if(success&&step>3&&step<8)o.phase=step;
 ruleResource.stamina-=staminaSpent;
 s.table.combatants.player.stamina=ruleResource.stamina;
 const src={origin:ORIGIN,kind:'stage',sourceId:p.sourceId,
  step,minute:now,minutes,staminaSpent,attributeScore:attr,
  attributeModifier:mod,skillRank:rank,
  witness:observed,witnessHash:wHash,check:structuredClone(check),
  rollEvent,rollEventHash:hash(rollEvent),roll:check.roll,success,
  strainBefore,strainAdded,strainAfter:Math.min(100,strainBefore+strainAdded),
  wounded:strainAdded>0,rejectionBefore,
  rejectionAfter:o.rejectionRisk,loadBefore,loadAdded,loadAfter:o.load,
  material};
 const integ=t||{origin:ORIGIN,sourceSeal:z.seal,
  authorisationSeal:auth.seal,attempts:[],next:3,complete:false,
  strain:0,reservedLoad:0,uses:[]};
 integ.attempts.push({origin:ORIGIN,source:src,seal:hash(src)});
 integ.strain=src.strainAfter;integ.reservedLoad+=loadAdded;
 if(success)integ.next++;
 integ.complete=integ.next===9;r.integration=integ;
 E.advance(s,minutes);W.finalizeTime(s,now);U.sync(s,{source:'legacy'});
 if(!Lineage.verify(s))
  throw Error('The original human biological progression or verified source is inconsistent');
 return {sourceId:p.sourceId,stage:step,name:STEPS[step],
  attempted:true,succeeded:success,check,staminaSpent,minutes,
  originalLoadReserved:integ.reservedLoad,
  actualMaterial:material,injury:strainAdded>0,
  strain:integ.strain,rejectionRisk:o.rejectionRisk,
  nextStage:integ.next,personallyHumanEvolved:integ.complete,
  grantedBeastAbility:false,automaticEvolutionStage:false};
}
// The rejection ledger retains strain until ordinary clinically witnessed
// care succeeds. This never heals an existing combat wound automatically.
function care(s,p={}){
 if(!own(p,['sourceId','witnessIndex','minutes'])||
  !validId(p.sourceId)||!integer(p.minutes??60,45,480))
  throw Error('Actual individual Origin strain needs clinical observation and time');
 const {r,integr}=context(s,p.sourceId,{allowCompleted:true});
 if(!integr?.strain)throw Error('There is no recorded current lineage rejection strain to treat');
 const w=stageWitness(s,p.witnessIndex,p.sourceId,'care'),h=hash(w);
 if(integr.attempts.some(x=>x.source.witnessHash===h))
  throw Error('A biological clinical treatment cannot reroll the same observed source');
 const minutes=p.minutes??60,staminaSpent=2,pchar=s.player;
 if(!integer(pchar.stamina,2,100000)||!integer(s.table.combatants.player.stamina,2,100000))
  throw Error('Current original Stamina cannot support this clinical treatment');
 const minute=s.world.minutes,attributeScore=C.int(pchar.attributes?.wis,'earned Wis',1,30),
  skillRank=C.int(pchar.skills?.medicine?.rank??0,'earned Medicine',0,5),
  attributeModifier=Math.floor((attributeScore-10)/2);
 const check=C.check(s,{modifier:attributeModifier+2*skillRank,dc:15,
  label:'Observed original lineage pressure care'});
 const event=structuredClone(s.log.at(-1)),before=integr.strain;
 integr.strain=check.success?Math.max(0,integr.strain-2):integr.strain;
 const src={origin:ORIGIN,kind:'care',sourceId:p.sourceId,
  minute,minutes,staminaSpent,witness:w,witnessHash:h,
  attributeScore,attributeModifier,skillRank,
  check:structuredClone(check),rollEvent:event,
  rollEventHash:hash(event),roll:check.roll,
  strainBefore:before,strainAfter:integr.strain};
 integr.attempts.push({origin:ORIGIN,source:src,seal:hash(src)});
 pchar.stamina-=staminaSpent;s.table.combatants.player.stamina=pchar.stamina;
 E.advance(s,minutes);W.finalizeTime(s,minute);U.sync(s,{source:'legacy'});
 if(!Lineage.verify(s))throw Error('Actual clinical source or retained Origin strain receipts failed verification');
 return {attempted:true,treated:check.success,check,
  strain:integr.strain,staminaSpent,minutes,
  existingWoundsStillRequireTheirRealMedicalTreatment:true};
}
function useWitness(s,index,sourceId,checkId){
 if(!integer(index,0,s.log.length-1))
  throw Error('The existing local task requires a previous original human expression witness');
 const w=s.log[index],d=w?.details;
 if(w?.type!=='story'||!prose(w.text,16)||
  d?.origin!==USE||d.sourceId!==sourceId||
  d.location!==s.world.location||d.checkId!==checkId||
  !prose(d.observedFunction)||!prose(d.independentFailureLimit))
  throw Error('The original trained human Origin trait must show individual footing functionality and a physical limit in the real scene');
 return structuredClone(w);
}
function prepareFooting(s,p={}){
 if(!own(p,['sourceId','checkId','witnessIndex'])||
  !validId(p.sourceId)||typeof p.checkId!=='string')
  throw Error('An earned personal human Origin trait and real prepared footing task are required');
 const {r,q}=context(s,p.sourceId,{allowCompleted:true}),
  integ=r.integration,sc=s.table?.sceneChecks?.[p.checkId];
 if(!integ||integ.next<=6||q.effectAdapter!=='local-footing'||
  integ.strain>=5||
  !sc||sc.used||sc.origin!=='engine-local-scene'||
  sc.method!=='footing'||sc.location!==s.world.location||
  !integer(sc.worldMinute,0,s.world.minutes)||
  s.world.minutes-sc.worldMinute>1440)
  throw Error('A personally expressed and healthy human Origin trait needs an original prepared footing check');
 if(Object.values(Lineage.records(s)).some(x=>
  (x.integration?.uses||[]).some(a=>a.source.checkId===p.checkId)))
  throw Error('Two Origin expressions cannot stack on an original footing check');
 if(require('./body-living-physiques').sceneSupport(s,p.checkId).bonus)
  throw Error('Original body and human Origin footing sources cannot stack on one physical check');
 const w=useWitness(s,p.witnessIndex,p.sourceId,p.checkId),h=hash(w);
 if(integ.uses?.some(a=>a.source.witnessHash===h)||
  integ.attempts.some(a=>a.source.witnessHash===h))
  throw Error('This individual human physical action witness was already spent');
 if(!integer(s.player.stamina,1,100000)||
  !integer(s.table.combatants.player.stamina,1,100000))
  throw Error('The real bodily action requires one original Stamina');
 const a={origin:ORIGIN,kind:'human-footing-expression',sourceId:p.sourceId,
  checkId:p.checkId,minute:s.world.minutes,sceneMinute:sc.worldMinute,
  sceneEventHash:sc.eventHash,location:s.world.location,
  witness:w,witnessHash:h};
 integ.uses||=[];integ.uses.push({origin:ORIGIN,source:a,seal:hash(a),used:null});
 if(!Lineage.verify(s))throw Error('Human Origin physical action proof failed verification');
 return {prepared:true,checkId:p.checkId,sourceId:p.sourceId,
  noRollYet:true,physicalSupport:1,staminaOnUse:1,noAutomaticBeastSense:true};
}
function sceneSupport(s,checkId){
 if(!Lineage.verify(s))throw Error('Source-earned human Origin physiology is inconsistent');
 const uses=Object.values(Lineage.records(s)).flatMap(r=>r.integration?.uses||[]),
 found=uses.filter(x=>x.source.checkId===checkId);
 if(found.length>1)throw Error('Different Origin trait sources cannot stack on a terrain action');
 if(!found.length)return {bonus:0};
 const a=found[0],sc=s.table?.sceneChecks?.[checkId];
 if(a.used!==null||!sc||sc.used||sc.method!=='footing'||
  sc.location!==s.world.location||
  !integer(s.player.stamina,1,100000)||
  !integer(s.table?.combatants?.player?.stamina,1,100000))
  throw Error('This source-bound human Origin action cannot be resolved again');
 return {bonus:1,sourceId:a.source.sourceId};
}
function recordUse(s,checkId,check,baseModifier){
 const uses=Object.values(Lineage.records(s)).flatMap(r=>r.integration?.uses||[]),
 found=uses.filter(x=>x.source.checkId===checkId);
 if(found.length!==1||found[0].used!==null)
  throw Error('One currently committed individual original human Origin source is required');
 const a=found[0],sc=s.table?.sceneChecks?.[checkId],
  rollEvent=structuredClone(s.log.at(-1));
 if(!sc?.used||sc.checkedAtMinute!==s.world.minutes||
  check.modifier!==baseModifier+1||
  rollEvent.type!=='roll'||rollEvent.details?.roll!==check.roll||
  !integer(s.player.stamina,1,100000))
  throw Error('The original one-use physical roll does not match the personal Origin cost and proof');
 a.used={checkId,minute:s.world.minutes,staminaSpent:1,
  baseModifier,check:structuredClone(check),rollEvent,
  rollEventHash:hash(rollEvent)};
 s.player.stamina-=1;s.table.combatants.player.stamina=s.player.stamina;
 if(!Lineage.verify(s))throw Error('Individual human Origin use receipt does not verify');
 return {sourceId:a.source.sourceId,staminaSpent:1,
  physicalModifier:1,fromOriginalEarnedHumanLineage:true};
}
module.exports={ORIGIN,AUTH,STAGE,CARE,USE,STEPS,RULES,
 authorisation,context,verifyRecord,status,stage,care,
 prepareFooting,sceneSupport,recordUse};
