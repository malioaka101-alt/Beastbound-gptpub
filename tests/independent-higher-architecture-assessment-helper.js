'use strict';
// Only invoked after the SAME independent actor genuinely forms III. These
// are explicitly authored test-only observation opportunities, not actual
// clinical discovery or preassigned design success. Original decisions,
// checks, energy, wounds, capacity and rest still belong to the engine.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),R=require('../rules'),Core=require('../rules/core'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Presence=require('../world/person-presence'),
 Build=require('../rules/build'),Foundation=require('../world/person-mechanical-foundations'),
 Cosmology=require('../world/cosmology-ledger'),
 Dynamic=require('../rules/arcane-dynamic-architecture'),Arcane=require('../rules/arcane-higher-circles'),
 Soul=require('../rules/soul-higher-architecture'),Higher=require('../rules/independent-original-higher-architectures'),
 Law=require('../rules/higher-architecture-shared-original-law');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const description='The individual original bounded structure is physically observed and tested in this explicitly disposable source witness; its actual independent outcome remains unresolved.';
function eventDetails(s,p,system,stage,kind){
 const owner=system==='soul'?Soul:stage===4?Dynamic:Arcane;
 const origin=kind==='map'?owner.MAP:kind==='practice'?owner.PRACTICE:kind==='repair'?owner.REPAIR:owner.TEST||owner.BREAKTHROUGH;
 const d={origin,actorId:p.actorId,location:s.world.location,[system==='arcane'?'circle':'phase']:stage};
 const fields=(names)=>Object.fromEntries(names.map(k=>[k,description]));
 if(system==='arcane'&&stage===4){
  if(kind==='map')return {...d,existingChannels:3,...fields(['design','channelInteraction','interference','safety','observedChannelResponse','knownCountertest'])};
  return {...d,...fields(kind==='practice'?['channelTest','failureLimit']:kind==='repair'?['actualDamage','method']:['changedDuringCasting','interferenceCounter'])};
 }
 if(system==='arcane'){
  const sp=Arcane.SPEC[stage];
  if(kind==='map'){
   const details={...d,kind:sp.kind,existingChannels:Build.arcaneProfile(stage-1).channels,
    ...fields(['design','channelModel','interference','safety','countertest',...sp.sourceFields])};
   if(stage===8){
    const reg=Cosmology.peek(s)||Cosmology.seed();let ref=null;
    for(const [planeId,plane] of Object.entries(reg.planes)){
     const f=plane.facts?.find(x=>x.kind==='law');
     if(f){ref={planeId,domain:f.domain};break;}
    }
    if(!ref)return null;
    const law=Arcane.originalLaw(s,ref);
    if(!law)return null;
    Object.assign(details,{lawRef:ref,lawSeal:law.seal});
   }
   return details;
  }
  return {...d,...fields(kind==='practice'?['measuredResponse','resistance']:kind==='repair'?['examinedFailure','restorativeGeometry']:['independentCountertest','limitObserved'])};
 }
 const sp=Soul.SPEC[stage];
 if(kind==='map')return {...d,kind:sp.kind,...fields(['design','identityBoundary','ethicalLimit','interference','repairMethod','countertest',...sp.sources]),
  ...(stage===4?{nonSentient:true}:stage===6?{measuredRangeMetres:1}:stage===7?{selfMaintenance:description}:{})};
 return {...d,...fields(kind==='practice'?['observedResponse','independentBoundary']:kind==='repair'?['diagnosis','recoveryMethod']:['actualFunction','failureLimit','identityPreservation'])};
}
function assess(s,p,system,days=180){
 A.ok(system==='arcane'?p.originalArcaneMatrix?.completed:p.originalSoulLatticeThree?.formed,
  'Original genuine Third architecture required, no fixture-created predecessor');
 const key=system==='arcane'?'originalArcaneHigherArchitecture':'originalSoulHigherArchitecture',
  body=s.table.combatants['npc_'+p.id],site=s.world.location,
  counts={map:0,practice:0,repair:0,form:0,refused:0,formed:0};
 for(let i=0;i<days;i++){
  const t=s.world.minutes,target=(Math.floor(t/1440)+1)*1440+600;
  E.advance(s,target-t);World.finalizeTime(s,t);
  const day=Math.floor(s.world.minutes/1440);
  if(body.status!=='ok'||body.wounds.some(x=>x!==0)||body.stamina<1||
   !Presence.resolve(Realm.peek(s),p.actorId,site,day,600)||Higher.usedDay(p,day))continue;
  const view=Higher.privateStatus(s,p,system),
   stage=(view?.earnedStage??3)+1;
  if(stage>(system==='arcane'?9:7))break;
  const rec=view?.stages.find(x=>x.stage===stage);
  const kind=!rec?'map':rec.strain>=5||rec.points===6&&rec.strain>2?'repair':rec.points===6?'form':'practice';
  const energy=view?.currentEnergy??(system==='arcane'?p.originalArcaneMatrix.manaRemaining:p.originalSoulLatticeThree.reserveRemaining),
   stability=view?.stability??(system==='arcane'?p.originalArcaneMatrix.coreStability:p.originalSoulLatticeThree.soulStability),
   limit=system==='soul'?40:stage===4?45:35,
   minutes=kind==='form'?90:60,attrs=p.mechanicalFoundation.baselineAttributes;
  if(stability<limit&&(kind!=='repair'||system==='arcane'&&stage===4))continue;
  const spec=kind==='map'?{energy:0,stamina:0}:
   system==='arcane'?stage===4?Law.arcaneFourth(kind,minutes,attrs.int,0,stability):
    Law.arcaneHigher(Arcane.SPEC[stage],kind,minutes,attrs.int,0,stability):
    Law.soulHigher(Soul.SPEC[stage],kind,minutes,attrs.wis,0,stability);
  if(energy<spec.energy||body.stamina<spec.stamina)continue;
  const d=eventDetails(s,p,system,stage,kind);
  if(!d)continue;
  s.chatRuntime.scene=p.name+' is present for an independently witnessed original '+system+' structural procedure.';
  Core.event(s,'story',s.chatRuntime.scene,d);
  const result=R.act(s,{system,operation:'npcHigherWork',
   params:{actorId:p.actorId,witnessIndex:s.log.length-1,...(kind==='map'?{}:{minutes})}});
  A.equal(Higher.verify(s,p,system),true);
  const row=p[key].sessions.filter(x=>x.source.origin===Higher.ORIGIN).at(-1),q=row.source;
  A.equal(result.independentlyAccepted,q.accepted);
  if(!q.accepted){counts.refused++;A.equal(q.energySpent,0);A.equal(q.staminaSpent,0);continue;}
  counts[kind]++;
  A.equal(q.energySpent,spec.energy);A.equal(q.staminaSpent,spec.stamina);
  A.equal(q.after.energy,q.before.energy-spec.energy);
  if(kind!=='map')A.equal(q.check.dc,spec.dc);
  if(result.formed){counts.formed++;A.equal(q.after.stage,stage);}
  else A.equal(q.after.stage,q.before.stage);
  A.deepEqual(p.knownTechniques,[]);
 }
 if(p[key]){
  const status=Higher.privateStatus(s,p,system),d=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
  A.equal(system==='arcane'?d.originalPowerMilestones.arcane.circles:d.originalPowerMilestones.soul.phase,status.earnedStage);
  const saved=E.exportGame(s),copy=E.importGame(saved),cp=Realm.peek(copy).emergentPeople.people[p.id];
  A.equal(Higher.verify(copy,cp,system),true);
  const r=cp[key].sessions.find(x=>x.source.origin===Higher.ORIGIN);
  r.source.predecessor='0'.repeat(64);r.seal=hash(r.source);
  A.equal(Higher.verify(copy,cp,system),false,'Resealed false predecessor must fail original architecture verification');
 }
 return {counts,status:Higher.privateStatus(s,p,system)};
}
module.exports={assess};
