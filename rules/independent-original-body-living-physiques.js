'use strict';
// Source-backed individual Blood V, Adaptive VI and Evolved VII work.
// Original V and VI can develop after Organ III in either order. VII needs
// the actual earned IV, V and VI proofs. Forming VI or VII does NOT start
// an adaptive transformation, grant upkeep, free tissue abilities or traits.
const Crypto=require('node:crypto'),E=require('../engine'),Core=require('./core'),
 Combat=require('./combat'),World=require('./world'),Health=require('./unified'),
 PC=require('./body-living-physiques'),Law=require('./body-shared-original-living-physique'),
 Three=require('./independent-original-body-organ-cycle-three'),
 Four=require('./independent-original-body-nerve-sense-four'),
 Early=require('./independent-original-discipline-preparation'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Presence=require('../world/person-presence'),
 Places=require('../world/lived-places');
const ORIGIN='source-earned-independent-witnessed-living-physique-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b,
 text=(v,min=25)=>typeof v==='string'&&v.trim().length>=min&&v.length<=900,
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const prior=p=>p?.originalBodyOrganCycleThree?.completed?
 p.originalBodyOrganCycleThree.originalCycleThreeSourceHash:null;
const kindOf=w=>({[PC.MAP]:'map',[PC.WORK]:'work',[PC.CARE]:'care',
 [PC.FORM]:'form',[PC.REPEAT]:'repeat',[PC.TISSUE]:'tissue-map',
 [PC.TISSUE_WORK]:'tissue-work',[PC.TISSUE_CARE]:'tissue-care'})[w?.details?.origin];
function witnessValid(w,p,cycle,kind,site,minute){
 const d=w?.details,sp=Law.SPEC[cycle];
 if(!sp||w?.type!=='story'||!text(w.text,16)||!w.text.includes(p.name)||
  w.day!==Math.floor(minute/1440)+1||w.time!==E.clock({world:{minutes:minute}})||
  d?.actorId!==p.actorId||d.location!==site||d.cycle!==cycle||kindOf(w)!==kind)
  return false;
 if(kind==='map')return typeof d.designId==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(d.designId)&&
  ['method','actualTissues','metabolicSupport','failureLimit','reversion',
   'independentCountertest',...sp.sources].every(k=>text(d[k]));
 if(kind==='tissue-map')return /^[a-z][a-z0-9_-]{2,75}$/.test(d.tissueId||'')&&
  ['tissue','realFunction','metabolicTradeoff','failureLimit','observedTissue','independentCountertest'].every(k=>text(d[k]));
 if(kind==='tissue-work'||kind==='tissue-care')return /^[a-z][a-z0-9_-]{2,75}$/.test(d.tissueId||'')&&
  ['observedResponse','physicalLimit'].every(k=>text(d[k]));
 if(kind==='work'||kind==='care')
  return ['observedBodyResponse','physicalLimit'].every(k=>text(d[k]));
 if(kind==='form')return ['integratedFunction','failureCounter','metabolicTradeoff'].every(k=>text(d[k]));
 return kind==='repeat'&&['observedWholeBodyResponse','independentFailureLimit',
  'metabolicDemand','targetedTissues'].every(k=>text(d[k]));
}
function support(p,cycles,cycle,day){
 if(cycle!==7)return null;
 const n=p.originalBodyNerveSenseFour,
  win=n?.sessions?.find(x=>x.seal===n.completionSourceHash);
 if(!n?.completed||!win||win.source.day>=day||
  !cycles[5]?.completed||!cycles[6]?.completed)return null;
 return {nerve:n.completionSourceHash,blood:cycles[5].formationSourceHash,
  adaptive:cycles[6].formationSourceHash};
}
const tissueKind=k=>['tissue-map','tissue-work','tissue-care'].includes(k);
const mapKind=k=>k==='map'||k==='tissue-map';
const individualTissue=(r,w)=>r?.tissues?.find(t=>t.id===w?.details?.tissueId);
function eligible(cycles,cycle,kind,w){
 const r=cycles[cycle];if(kind==='map')return !r;
 if(!r)return false;
 if(tissueKind(kind)){const t=individualTissue(r,w);
  return kind==='tissue-map'?!t&&(r.tissues?.length||0)<180:
   !!t&&(kind==='tissue-work'?t.strain<5:t.strain>0);}
 if(kind==='work')return !r.completed&&r.points<Law.GOAL&&r.strain<5;
 if(kind==='care')return r.strain>0;
 if(kind==='form')return !r.completed&&Law.ready(r.points,r.strain);
 return kind==='repeat'&&r.completed&&r.strain<=2;
}
function blank(){return {points:0,strain:0,completed:false,formationSourceHash:null,mapSourceHash:null};}
function state(r){return r?structuredClone(r):null;}
function decisionSpec(p,cycle,kind,strain){
 return mapKind(kind)?{dc:null,cost:0,modifier:0}:
  Law.checkSpec(cycle,kind==='tissue-work'?'work':kind==='tissue-care'?'care':kind,
   p.mechanicalFoundation.baselineAttributes.con,0,strain);
}
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+Core.naturalAdjustment(roll)-sp.dc;
 return {roll,modifier:sp.modifier,dc:sp.dc,margin,degree:Core.degree(margin),success:margin>=0};
}
function update(r,kind,check){
 let injury=false,gain=0;
 if(kind==='work'){
  const n=Law.workState(r.points,r.strain,check);
  r.points=n.points;r.strain=n.strain;injury=n.strainAdded>0;
 }else if(kind==='care')r.strain=Law.repaired(r.strain,check);
 else if(kind==='repeat'){
  if(check.degree==='severe failure'){r.strain=Math.min(100,r.strain+3);injury=true;}
 }else if(kind==='form'&&check.success)r.completed=true;
 return {injury};
}
// Individual tissue work is deliberately uncapped, unlike the six-point
// whole-body cycle. It cannot complete a cycle or grant its capacity.
function mapTissue(r,w,seal){
 const d=w.details,t={id:d.tissueId,tissue:d.tissue.trim(),realFunction:d.realFunction.trim(),
  metabolicTradeoff:d.metabolicTradeoff.trim(),failureLimit:d.failureLimit.trim(),
  mapSourceHash:seal,points:0,strain:0};
 (r.tissues||=[]).push(t);
}
function updateTissue(t,kind,check){
 if(kind==='tissue-care'){t.strain=Law.repaired(t.strain,check);return false;}
 if(check.success)t.points+=Core.progress(check.degree);
 if(check.degree==='severe failure'){t.strain=Math.min(100,t.strain+3);return true;}
 return false;
}
const tissueView=t=>t?{id:t.id,points:t.points,strain:t.strain,mapSourceHash:t.mapSourceHash}:null;
// Exclude receipt seals when comparing pre/post mechanical values; the
// winning receipt itself is separately referenced and checked.
function publicState(r){
 if(!r)return null;
 return {points:r.points,strain:r.strain,completed:r.completed};
}
function verify(s,p){
 const r=p?.originalBodyLivingPhysiques;if(r===undefined)return true;
 const organ=prior(p),body=s.table?.combatants?.['npc_'+p.id],
  w=Realm.peek(s),life=w?.independentPersonLives?.people?.[p.id];
 if(!organ||!Three.verify(s,p)||!Four.verify(s,p)||!Early.verify(s,p)||
  !body?.npcOrigin?.seal||!life||!Lives.verifyEntry(w,life)||!Health.currentNpcWoundCondition(s,p.actorId)||
  !r||r.origin!==ORIGIN||r.organSourceHash!==organ||
  !Array.isArray(r.sessions)||!r.sessions.length||r.sessions.length>480)return false;
 const sim={},used=new Set();let lastDay=p.originalBodyOrganCycleThree.lastAttemptDay,lastEnd=0;
 for(const row of r.sessions){
  const q=row?.source,cycle=q?.cycle,sp=Law.SPEC[cycle],sh=q?.shift;
  if(!q||!sp||q.origin!==ORIGIN||row.seal!==hash(q)||
   q.actorId!==p.actorId||q.identityOriginHash!==p.originHash||
   q.foundationSeal!==p.mechanicalFoundation.seal||q.combatSeal!==body.npcOrigin.seal||
   q.organSourceHash!==organ||!int(q.day)||q.day<=lastDay||
   p.originalBodyNerveSenseFour?.sessions.some(x=>x.source.day===q.day)||
   !int(q.minute,lastEnd,s.world.minutes)||Math.floor(q.minute/1440)!==q.day||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.scheduledAtDay!==sh.fromDay||sh.throughDay-sh.fromDay!==5||
   sh.fromDay>q.day||sh.throughDay<q.day||
   q.witnessHash!==hash(q.witness)||used.has(q.witnessHash)||
   !witnessValid(q.witness,p,cycle,q.kind,q.site,q.minute)||
   !eligible(sim,cycle,q.kind,q.witness)||!eq(q.before,publicState(sim[cycle]))||
   (tissueKind(q.kind)&&!eq(q.tissueBefore,tissueView(individualTissue(sim[cycle],q.witness))))||
   !eq(q.supportingProof,support(p,sim,cycle,q.day))||
   (cycle===7&&!q.supportingProof)||
   q.mapSourceHash!==(sim[cycle]?.mapSourceHash??null)||
   q.originalFormationProof!==(q.kind==='repeat'?sim[cycle].formationSourceHash:null)||
   !int(q.rngBefore,1,4294967295)||q.personality!==p.personality||
   q.chance!==Early.chance({personality:q.personality,fatigue:q.fatigue})||
   !int(q.staminaBefore,1)||!int(q.maxBefore,q.staminaBefore)||!eq(q.woundsBefore,[0,0,0])||
   q.noNewSpeciesTraitOrAdaptiveExpressionOrTechnique!==true)return false;
  const rr={rngState:q.rngBefore},map=mapKind(q.kind),tissue=tissueKind(q.kind);
  if(q.choice!==Core.die(rr,100)||q.accepted!==(q.choice<=q.chance)||
   (map?q.plannedMinutes!==0:!int(q.plannedMinutes,['form','repeat'].includes(q.kind)?30:15,480))||
   q.minute%1440<480||q.minute%1440+Math.max(5,q.plannedMinutes)>1080)return false;
  const mode=decisionSpec(p,cycle,q.kind,(tissue?individualTissue(sim[cycle],q.witness)?.strain:sim[cycle]?.strain)||0);
  let check=null,spent=0,injury=false,gain=0;
  if(q.accepted){
   if(q.kind==='map'){sim[cycle]=blank();sim[cycle].mapSourceHash=row.seal;}
   else if(q.kind==='tissue-map')mapTissue(sim[cycle],q.witness,row.seal);
   else{
    spent=mode.cost;check=checkRecord(Core.die(rr,20),mode);
    injury=tissue?updateTissue(individualTissue(sim[cycle],q.witness),q.kind,check):update(sim[cycle],q.kind,check).injury;
    if(q.kind==='form'&&check.success){gain=sp.bonus;sim[cycle].formationSourceHash=row.seal;}
   }
  }
  if(q.actualMinutes!==(q.accepted?q.plannedMinutes:5)||q.minute+q.actualMinutes>s.world.minutes||
   !eq(q.check,check)||q.rngAfter!==rr.rngState||q.staminaSpent!==spent||
   q.staminaBefore<spent||q.staminaAfter!==q.staminaBefore-spent||
   q.maxAfter!==q.maxBefore+gain||!eq(q.woundsAfter,injury?[1,0,0]:[0,0,0])||
   !eq(q.after,publicState(sim[cycle]))||
   (tissue&&!eq(q.tissueAfter,q.kind==='tissue-map'&&q.accepted?
    {...tissueView(individualTissue(sim[cycle],q.witness)),mapSourceHash:null}:
    tissueView(individualTissue(sim[cycle],q.witness)))))return false;
  used.add(q.witnessHash);lastDay=q.day;lastEnd=q.minute+q.actualMinutes;
 }
 return eq(r.cycles,sim)&&r.lastAttemptDay===lastDay&&expressionVerify(s,p,r,body);
}
// Temporary expression is a distinct action, not another refinement day.
// Formation and current strain are read from the original historical ledger.
const EXPRESSION='source-witnessed-independent-adaptive-expression-v1';
function expressionState(rows,minute){
 let active=null,ready=0,last=null;
 for(const row of rows||[]){
  const q=row.source;
  if(!q.accepted)continue;
  if(q.kind==='assume'){
   active=q.check.success?row:null;ready=q.cooldownUntil;last=row;
  }else{active=null;ready=q.cooldownUntil;}
 }
 return {active:!!active&&minute>=active.source.activeFrom&&minute<active.source.activeUntil,
  activationSeal:active?.seal??null,expiresAtMinute:active?.source.activeUntil??null,
  nextAvailableAtMinute:ready,cooldownRemaining:Math.max(0,ready-minute),
  mentalEffects:Law.ADAPTIVE_MENTAL,noAutomaticResistanceOrImmunity:true};
}
function expressionWitness(w,p,kind,site,minute){
 const d=w?.details;
 return w?.type==='story'&&text(w.text,16)&&w.text.includes(p.name)&&
  w.day===Math.floor(minute/1440)+1&&w.time===E.clock({world:{minutes:minute}})&&
  d?.actorId===p.actorId&&d.location===site&&d.cycle===6&&
  d.origin===(kind==='assume'?PC.ASSUME:PC.RELEASE)&&
  (kind==='assume'?text(d.environmentObserved)&&text(d.safeReversionCounter)&&int(d.safeMinutes,1,1000000):
   text(d.observedReturn)&&text(d.independentFailureLimit));
}
function historicalAdaptive(r,minute){
 const prior=r.sessions.filter(x=>x.source.cycle===6&&
  x.source.minute+x.source.actualMinutes<=minute);
 const win=prior.find(x=>x.source.kind==='form'&&x.source.accepted&&x.source.check?.success);
 if(!win)return null;
 return {formationSeal:win.seal,strain:prior.at(-1).source.after.strain};
}
function expressionVerify(s,p,r,body){
 const rows=r.expressions;if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>480)return false;
 const used=new Set(r.sessions.map(x=>x.source.witnessHash)),history=[];
 let end=0;
 for(const row of rows){
  const q=row?.source,sh=q?.shift;
  if(!q||row.seal!==hash(q)||q.origin!==EXPRESSION||
   q.actorId!==p.actorId||q.identityOriginHash!==p.originHash||
   q.combatSeal!==body.npcOrigin.seal||!['assume','release'].includes(q.kind)||
   !int(q.minute,end,s.world.minutes-1)||q.day!==Math.floor(q.minute/1440)||
   r.sessions.some(x=>x.source.minute<q.minute+1&&x.source.minute+x.source.actualMinutes>q.minute)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.fromDay>q.day||sh.throughDay<q.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
   !expressionWitness(q.witness,p,q.kind,q.site,q.minute)||q.witnessHash!==hash(q.witness)||used.has(q.witnessHash)||
   !int(q.rngBefore,1,4294967295)||q.personality!==p.personality||
   !int(q.fatigue,0,100)||q.chance!==Early.chance({personality:q.personality,fatigue:q.fatigue})||
   !int(q.staminaBefore,1)||!int(q.maxBefore,q.staminaBefore)||q.maxAfter!==q.maxBefore||
   !eq(q.woundsBefore,[0,0,0])||q.mentalEffects!==Law.ADAPTIVE_MENTAL||
   q.noAutomaticResistanceOrAbility!==true)return false;
  const old=expressionState(history,q.minute),earned=historicalAdaptive(r,q.minute);
  if(!earned||!eq(earned,q.earned)||q.kind==='assume'&&(old.active||old.cooldownRemaining)||
   q.kind==='release'&&(!old.active||q.activationSeal!==old.activationSeal))return false;
  const roll={rngState:q.rngBefore};
  if(q.choice!==Core.die(roll,100)||q.accepted!==(q.choice<=q.chance))return false;
  let check=null,spent=0,injury=false,window=null;
  if(q.kind==='assume'){
   if(q.duration!==q.witness.details.safeMinutes||q.activationSeal!==null)return false;
   const mode=Law.adaptiveSpec(q.duration,p.mechanicalFoundation.baselineAttributes.con,0,earned.strain);
   if(q.staminaBefore<mode.cost)return false;
   if(q.accepted){
    check=checkRecord(Core.die(roll,20),mode);spent=mode.cost;
    injury=check.degree==='severe failure';window=Law.adaptiveWindow(q.minute,q.duration,check.success);
   }
  }else{
   if(q.duration!==null)return false;
   if(q.accepted)window={activeFrom:null,activeUntil:null,cooldownUntil:Law.releaseCooldown(q.minute)};
  }
  if(!eq(q.check,check)||q.rngAfter!==roll.rngState||q.staminaSpent!==spent||
   q.staminaAfter!==q.staminaBefore-spent||!eq(q.woundsAfter,injury?[1,0,0]:[0,0,0])||
   q.activeFrom!==(window?.activeFrom??null)||q.activeUntil!==(window?.activeUntil??null)||
   q.cooldownUntil!==(window?.cooldownUntil??null))return false;
  used.add(q.witnessHash);history.push(row);end=q.minute+1;
 }
 return true;
}
function expression(s,{actorId,witnessIndex,minutes,...extra}={},kind){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,s.log.length-1))throw Error('Original independent adaptive expression accepts actorId, witnessIndex and measured duration only');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  body=s.table?.combatants?.['npc_'+p?.id],r=p?.originalBodyLivingPhysiques,
  start=s.world.minutes,day=Math.floor(start/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,start%1440),
  witness=structuredClone(s.log[witnessIndex]),earned=r&&historicalAdaptive(r,start);
 if(!p||!People.verify(w,p)||p.status!=='active'||!earned||!verify(s,p)||
  !present?.presence||body?.npcOrigin?.location!==site||!Places.location(s)||
  s.battle||s.encounter||body.status!=='ok'||body.stamina<1||body.wounds.some(x=>x!==0)||
  !s.chatRuntime?.scene?.includes(p.name)||!expressionWitness(witness,p,kind,site,start)||
  (kind==='assume'?minutes!==witness.details.safeMinutes:minutes!==undefined))
  throw Error('Actual present uninjured adult with verified Adaptive VI and fresh measured original witness required');
 const rows=r.expressions||[],witnessHash=hash(witness),old=expressionState(rows,start);
 if(rows.length>=480||[...rows,...r.sessions].some(x=>x.source.witnessHash===witnessHash)||
  r.sessions.some(x=>x.source.minute<start+1&&x.source.minute+x.source.actualMinutes>start)||
  (kind==='assume'?(old.active||old.cooldownRemaining):!old.active))
  throw Error('Original adaptive expression is active, recovering, unavailable or witness already used');
 const mode=kind==='assume'?Law.adaptiveSpec(minutes,p.mechanicalFoundation.baselineAttributes.con,0,earned.strain):null;
 if(mode&&body.stamina<mode.cost)throw Error('Actual available Combat Stamina required for measured adaptive duration');
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),accepted=choice<=chance,
  staminaBefore=body.stamina,maxBefore=body.maxStamina,woundsBefore=[...body.wounds];
 let check=null,spent=0,window=null;
 if(accepted&&mode){
  const roll=Core.check(s,{modifier:mode.modifier,dc:mode.dc,independentRngOwner:p,
   privateDisplay:true,label:p.name+' original witnessed adaptive expression'});
  check=checkRecord(roll.roll,mode);spent=mode.cost;body.stamina-=spent;
  if(check.degree==='severe failure')Combat.harm(s,body,2);
  window=Law.adaptiveWindow(start,minutes,check.success);
 }else if(accepted)window={activeFrom:null,activeUntil:null,cooldownUntil:Law.releaseCooldown(start)};
 const source={origin:EXPRESSION,kind,actorId,identityOriginHash:p.originHash,combatSeal:body.npcOrigin.seal,
  minute:start,day,site,shift:structuredClone(present.presence),witness,witnessHash,earned,
  duration:kind==='assume'?minutes:null,activationSeal:kind==='release'?old.activationSeal:null,
  rngBefore,rngAfter:p.rngState,personality:p.personality,fatigue:p.fatigue,chance,choice,accepted,check,
  staminaBefore,staminaSpent:spent,staminaAfter:body.stamina,maxBefore,maxAfter:body.maxStamina,
  woundsBefore,woundsAfter:[...body.wounds],activeFrom:window?.activeFrom??null,
  activeUntil:window?.activeUntil??null,cooldownUntil:window?.cooldownUntil??null,
  mentalEffects:Law.ADAPTIVE_MENTAL,noAutomaticResistanceOrAbility:true};
 r.expressions=[...rows,{source,seal:hash(source)}];
 E.advance(s,1);World.finalizeTime(s,start);
 if(!verify(s,p))throw Error('Original independent adaptation failed historical replay');
 return {actorId,independentlyAccepted:accepted,formed:kind==='assume'&&!!check?.success,
  released:kind==='release'&&accepted,elapsedMinutes:1,...expressionState(r.expressions,s.world.minutes)};
}
function work(s,{actorId,witnessIndex,minutes,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,s.log.length-1))throw Error('Original witnessed physique accepts actorId, witnessIndex and minutes only');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  body=s.table?.combatants?.['npc_'+p?.id],life=w?.independentPersonLives?.people?.[p?.id],
  start=s.world.minutes,day=Math.floor(start/1440),minute=start%1440,site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute),
  wit=structuredClone(s.log[witnessIndex]),cycle=wit?.details?.cycle,kind=kindOf(wit);
 if(!p||!People.verify(w,p)||!life||!Lives.verifyEntry(w,life)||!life.interests.includes('body')||
  p.status!=='active'||p.ageBand!=='adult, exact birthday not established'||
  !prior(p)||!Three.verify(s,p)||!Four.verify(s,p)||!verify(s,p)||
  !present?.presence||body?.npcOrigin?.location!==site||
  !Places.location(s)||s.battle||s.encounter||!Health.currentNpcWoundCondition(s,actorId)||
  body.status!=='ok'||body.stamina<1||body.wounds.some(x=>x!==0)||
  !s.chatRuntime?.scene?.includes(p.name))
  throw Error('Actual present original Organ III adult, consistent uninjured body and independent individual witness required');
 const r=p.originalBodyLivingPhysiques||{origin:ORIGIN,organSourceHash:prior(p),
  cycles:{},sessions:[],lastAttemptDay:-1},
  map=mapKind(kind),rec=r.cycles[cycle],proof=support(p,r.cycles,cycle,day),
  tissue=tissueKind(kind),individual=individualTissue(rec,wit),
  planned=map?0:minutes??(['form','repeat'].includes(kind)?90:60);
 if(r.lastAttemptDay>=day||p.originalBodyOrganCycleThree.lastAttemptDay>=day||
  p.originalBodyNerveSenseFour?.lastAttemptDay>=day||p.meridianTraining?.lastAttemptDay>=day||
  Object.values(p.originalEarlyDisciplinePreparation||{}).some(x=>x.lastAttemptDay>=day)||
  r.sessions.length>=480)throw Error('Another original personal discipline decision already occupies this day');
 if(!witnessValid(wit,p,cycle,kind,site,start)||!eligible(r.cycles,cycle,kind,wit)||
  (cycle===7&&!proof)||r.sessions.some(x=>x.source.witnessHash===hash(wit))||
  (map?minutes!==undefined&&minutes!==0:!int(planned,['form','repeat'].includes(kind)?30:15,480))||
  minute<480||minute+Math.max(5,planned)>1080)
  throw Error('Fresh authentic individual tissue/function witness and original stage prerequisites required; VII requires earned IV, V and VI');
 const mode=decisionSpec(p,cycle,kind,(tissue?individual?.strain:rec?.strain)||0);
 if(body.stamina<mode.cost)throw Error('Original physiology procedure requires actual available Combat Stamina');
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),accepted=choice<=chance,
  before=publicState(rec),tissueBefore=tissueView(individual),staminaBefore=body.stamina,maxBefore=body.maxStamina,woundsBefore=[...body.wounds],
  mapSourceHash=rec?.mapSourceHash??null,
  originalFormationProof=kind==='repeat'?rec.formationSourceHash:null;
 let check=null,spent=0;
 if(accepted){
  if(kind==='map')r.cycles[cycle]=blank();
  else if(kind==='tissue-map')mapTissue(rec,wit,null);
  else{
   const roll=Core.check(s,{modifier:mode.modifier,dc:mode.dc,
    independentRngOwner:p,privateDisplay:true,label:p.name+' original '+Law.SPEC[cycle].name+' '+kind});
   check=checkRecord(roll.roll,mode);spent=mode.cost;body.stamina-=spent;
   const injury=tissue?updateTissue(individual,kind,check):update(rec,kind,check).injury;
   if(injury)Combat.harm(s,body,2);
   if(kind==='form'&&check.success)body.maxStamina+=Law.SPEC[cycle].bonus;
  }
 }
 const q={origin:ORIGIN,actorId,identityOriginHash:p.originHash,
  foundationSeal:p.mechanicalFoundation.seal,combatSeal:body.npcOrigin.seal,
  organSourceHash:r.organSourceHash,cycle,kind,site,shift:structuredClone(present.presence),
  supportingProof:proof,mapSourceHash,originalFormationProof,witness:wit,witnessHash:hash(wit),
  day,minute:start,plannedMinutes:planned,actualMinutes:accepted?planned:5,
  rngBefore,rngAfter:p.rngState,personality:p.personality,fatigue:p.fatigue,
  chance,choice,accepted,check,before,after:publicState(r.cycles[cycle]),
  ...(tissue?{tissueBefore,tissueAfter:tissueView(individualTissue(rec,wit))}:{}),
  staminaBefore,staminaSpent:spent,staminaAfter:body.stamina,maxBefore,maxAfter:body.maxStamina,
  woundsBefore,woundsAfter:[...body.wounds],noNewSpeciesTraitOrAdaptiveExpressionOrTechnique:true};
 const seal=hash(q);
 if(accepted&&kind==='map')r.cycles[cycle].mapSourceHash=seal;
 if(accepted&&kind==='tissue-map')individualTissue(rec,wit).mapSourceHash=seal;
 if(accepted&&kind==='form'&&check.success)rec.formationSourceHash=seal;
 r.sessions.push({source:q,seal});r.lastAttemptDay=day;p.originalBodyLivingPhysiques=r;
 E.advance(s,q.actualMinutes);World.finalizeTime(s,start);
 if(!verify(s,p))throw Error('Original independent individual physique evidence failed replay');
 return {actorId,cycle,observedAction:kind,independentlyAccepted:accepted,
  formed:r.cycles[cycle]?.completed===true,elapsedMinutes:q.actualMinutes,
  noNewSpeciesTraitOrAdaptiveExpressionOrTechnique:true};
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Original individual Body physique evidence altered');
 const r=p.originalBodyLivingPhysiques;
 return {privateToGM:true,cycles:Object.entries(r?.cycles||{}).map(([k,v])=>({
  cycle:Number(k),name:Law.SPEC[k].name,points:v.points,strain:v.strain,completed:v.completed,
  formationSourceHash:v.formationSourceHash,sourceVerifiedCapacityGain:v.completed?Law.SPEC[k].bonus:0,
  individuallyObservedTissues:(v.tissues||[]).map(t=>({id:t.id,tissue:t.tissue,observedFunction:t.realFunction,
   practicePoints:t.points,strain:t.strain,sourceHash:t.mapSourceHash,noAutomaticAbility:true}))})),
  witnessedDecisions:r?.sessions.length||0,
  ...(r?.cycles?.[6]?.completed?{currentAdaptiveExpression:expressionState(r.expressions,s.world.minutes)}:{}),
  noEvolvedUpkeepEstablished:true};
}
module.exports={ORIGIN,EXPRESSION,verify,work,privateStatus,
 assume:(s,p)=>expression(s,p,'assume'),release:(s,p)=>expression(s,p,'release')};
