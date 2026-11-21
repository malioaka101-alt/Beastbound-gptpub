'use strict';
// Original bounded Boundary Domain VIII uses ONE real original Arcane
// reservoir and ONE original physical custody ledger. No new energy pool.
const E=require('../engine'),Core=require('./core'),Combat=require('./combat'),
 Health=require('./unified'),World=require('./world'),PC=require('./rift-boundary-domain'),
 Walk=require('./independent-original-rift-realm-walking'),Local=require('./independent-original-rift-local-spatial'),
 Ext=require('./rift-shared-original-exterior-sense'),Law=require('./rift-shared-original-local-spatial-law'),
 Mana=require('./independent-arcane-external-mana'),Custody=require('./independent-material-custody'),
 Early=require('./independent-original-discipline-preparation'),
 Higher=require('./independent-original-higher-architectures'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Lives=require('../world/independent-person-lives'),
 Presence=require('../world/person-presence');
const ORIGIN='source-earned-independent-original-bounded-spatial-domain-v1',
 hash=Ext.digest,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
function prerequisite(s,p){
 const journey=Walk.privateStatus(s,p),local=Local.privateStatus(s,p);
 if(journey?.earnedStep!==7||local?.originalLocalPressureTolerance!==1)return null;
 const first=p.originalRiftRealmJourney.rows.find(x=>x.seal===journey.originalFirstEntrySeal);
 return first?{seal:first.seal,end:first.source.minute+first.source.actualMinutes}:null;
}
function witnessValid(s,p,q){
 const w=q.witness,d=w?.details;
 if(d?.actorId!==p.actorId||!w?.text?.includes(p.name)||
  w.day!==q.day+1||w.time!==E.clock({world:{minutes:q.minute}}))return false;
 try{return eq(PC.evidence({...s,world:{...s.world,location:'ruins'},log:[w]},0),w);}
 catch{return false;}
}
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+Core.naturalAdjustment(roll)-sp.dc;
 return {roll,modifier:sp.modifier,dc:sp.dc,margin,degree:Core.degree(margin),success:margin>=0};
}
function replay(s,p){
 const l=p?.originalRiftBoundaryDomains,base=prerequisite(s,p),
  w=Realm.peek(s),body=s.table?.combatants?.['npc_'+p?.id];
 if(!base||!body?.npcOrigin?.seal||!People.verify(w,p))return null;
 const state={strain:0,step:7,domains:[],first:null,lastEnd:base.end,lastDay:-1};
 if(l===undefined)return state;
 if(l.origin!==ORIGIN||l.walkSeal!==base.seal||!Array.isArray(l.rows)||!l.rows.length||l.rows.length>480)return null;
 const used=new Set(),ids=new Set(),debits=new Set();
 for(const row of l.rows){
  const q=row?.source,sh=q?.shift,d=q?.witness?.details;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.kind!=='domain'||
   q.actorId!==p.actorId||q.identityOriginHash!==p.originHash||q.foundationSeal!==p.mechanicalFoundation.seal||
   q.combatSeal!==body.npcOrigin.seal||q.walkSeal!==base.seal||q.site!=='ruins'||
   !int(q.minute,state.lastEnd,s.world.minutes)||!int(q.day,state.lastDay+1)||
   q.day!==Math.floor(q.minute/1440)||q.minute%1440<480||q.minute%1440+120>1080||
   Walk.awayDuring(p,q.minute,q.minute+q.actualMinutes)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.fromDay>q.day||sh.throughDay<q.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
   !witnessValid(s,p,q)||q.witnessHash!==hash(q.witness)||used.has(q.witnessHash)||ids.has(d.domainId)||
   state.domains.some(x=>x.segmentId===d.segmentId&&x.opened<=q.minute&&q.minute<x.expires)||
   q.pressure?.day!==q.day||q.pressure.worldSeed!==w.worldSeed||q.pressureHash!==hash(q.pressure)||
   q.risk!==Law.pressureAdjust(q.pressure)||state.strain>=24||q.strainBefore!==state.strain||
   q.stepBefore!==state.step||q.tolerance!==1||q.noPortalOrGlobalRewrite!==true||
   !int(q.rngBefore,1,4294967295)||q.personality!==p.personality||!int(q.fatigue,0,100)||
   q.chance!==Early.chance({personality:q.personality,fatigue:q.fatigue})||
   !int(q.staminaBefore,13)||!int(q.maxBefore,q.staminaBefore)||q.maxAfter!==q.maxBefore||
   !eq(q.woundsBefore,[0,0,0]))return null;
  const sp=PC.domainSpec(d.areaSquareMetres,state.strain,q.risk,1,p.mechanicalFoundation.baselineAttributes.int,0),
   rng={rngState:q.rngBefore};
  if(q.choice!==Core.die(rng,100)||q.accepted!==(q.choice<=q.chance))return null;
  const check=q.accepted?checkRecord(Core.die(rng,20),sp):null,wound=check?.degree==='severe failure';
  if(!eq(q.check,check)||q.rngAfter!==rng.rngState||
   q.actualMinutes!==(q.accepted?120:5)||q.minute+q.actualMinutes>s.world.minutes||
   q.staminaSpent!==(q.accepted?13:0)||q.staminaAfter!==q.staminaBefore-q.staminaSpent||
   q.manaSpent!==(q.accepted?18:0)||!eq(q.woundsAfter,wound?[1,0,0]:[0,0,0]))return null;
  if(q.accepted){
   if(debits.has(q.manaDebitSeal)||!Mana.proof(s,p,q.manaDebitSeal,q.manaOwner,q.witnessHash,q.minute)||
    !Custody.debitProof(s,p,q.materialDebitSeal,PC.MATERIALS,Mana.PURPOSE,q.witnessHash,q.minute))return null;
   debits.add(q.manaDebitSeal);ids.add(d.domainId);
  }else if(q.manaDebitSeal!==null||q.materialDebitSeal!==null||q.manaOwner!==null)return null;
  state.strain=Math.min(100,state.strain+(wound?8:0));
  if(check?.success){
   state.step=8;state.first||=row.seal;
   state.domains.push({id:d.domainId,segmentId:d.segmentId,mode:d.mode,area:d.areaSquareMetres,
    opened:q.minute+120,expires:q.minute+120+d.durationMinutes,sourceSeal:row.seal,nonTraversable:true});
  }
  if(q.strainAfter!==state.strain||q.stepAfter!==state.step)return null;
  used.add(q.witnessHash);state.lastDay=q.day;state.lastEnd=q.minute+q.actualMinutes;
 }
 // Every existing original Arcane payment belongs to exactly one successful
 // acceptance of a Domain procedure. Failure still paid, refusal never paid.
 for(const r of [p.originalArcaneCircleTwo,p.originalArcaneMatrix,p.originalArcaneHigherArchitecture])
  if(r?.sessions.some(x=>x.source.origin===Mana.ORIGIN&&!debits.has(x.seal)))return null;
 return state;
}
function verify(s,p){
 if(p?.originalRiftBoundaryDomains===undefined)return true;
 try{return replay(s,p)!==null;}catch{return false;}
}
function form(s,{actorId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,s.log.length-1))throw Error('Only the actual individual and fresh measured Domain witness are accepted');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  body=s.table?.combatants?.['npc_'+p?.id],life=w?.independentPersonLives?.people?.[p?.id],
  minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute%1440),witness=structuredClone(s.log[witnessIndex]);
 if(!p||!People.verify(w,p)||!life||!Lives.verifyEntry(w,life)||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established'||!present?.presence||site!=='ruins'||
  body?.npcOrigin?.location!==site||!Health.currentNpcWoundCondition(s,actorId)||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||s.battle||s.encounter||
  !s.chatRuntime?.scene?.includes(p.name))throw Error('Actual present uninjured original exterior individual required');
 const base=prerequisite(s,p),state=base&&replay(s,p),d=witness.details;
 if(!state||Walk.awayAt(p,minute))throw Error('Actual original Realm Walking VII, return and individual VI tolerance required');
 const l=p.originalRiftBoundaryDomains||{origin:ORIGIN,walkSeal:base.seal,rows:[]},
  pressure=Ext.snapshot(w,day),risk=Law.pressureAdjust(pressure);
 const q={origin:ORIGIN,kind:'domain',actorId,identityOriginHash:p.originHash,
  foundationSeal:p.mechanicalFoundation.seal,combatSeal:body.npcOrigin.seal,walkSeal:base.seal,
  site,minute,day,shift:structuredClone(present.presence),witness,witnessHash:hash(witness),
  pressure,pressureHash:hash(pressure),risk,tolerance:1,strainBefore:state.strain,stepBefore:state.step,
  noPortalOrGlobalRewrite:true};
 if(!witnessValid(s,p,q)||l.rows.length>=480||state.strain>=24||state.lastDay>=day||
  Higher.usedDay(p,day)||minute<state.lastEnd||minute%1440<480||minute%1440+120>1080||
  l.rows.some(x=>x.source.witnessHash===q.witnessHash||
   x.source.accepted&&x.source.witness.details.domainId===d.domainId)||
  state.domains.some(x=>x.segmentId===d.segmentId&&x.opened<=minute&&minute<x.expires))
  throw Error('Fresh actual bounded field geometry and safe unused original discipline day required');
 const sp=PC.domainSpec(d.areaSquareMetres,state.strain,risk,1,p.mechanicalFoundation.baselineAttributes.int,0),
  energy=Mana.current(s,p);
 if(body.stamina<sp.stamina||!energy||energy.mana<sp.mana||!Custody.canConsume(s,p,PC.MATERIALS))
  throw Error('Actual original 18 Mana, 13 Stamina and individually held construction materials required');
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),accepted=choice<=chance,
  staminaBefore=body.stamina,maxBefore=body.maxStamina,woundsBefore=[...body.wounds];
 let check=null,manaDebitSeal=null,manaOwner=null,materialDebitSeal=null;
 if(accepted){
  const debit=Mana.debit(s,p,witness);manaDebitSeal=debit.seal;manaOwner=debit.owner;
  materialDebitSeal=Custody.consume(s,p,PC.MATERIALS,Mana.PURPOSE,witness);
  const actual=Core.check(s,{modifier:sp.modifier,dc:sp.dc,independentRngOwner:p,privateDisplay:true,
   label:p.name+' original bounded Boundary Domain VIII'});
  check=checkRecord(actual.roll,sp);body.stamina-=sp.stamina;
  if(check.degree==='severe failure')Combat.harm(s,body,2);
 }
 Object.assign(q,{rngBefore,rngAfter:p.rngState,personality:p.personality,fatigue:p.fatigue,chance,choice,accepted,check,
  actualMinutes:accepted?120:5,staminaBefore,staminaSpent:accepted?13:0,staminaAfter:body.stamina,
  maxBefore,maxAfter:body.maxStamina,woundsBefore,woundsAfter:[...body.wounds],manaSpent:accepted?18:0,
  manaDebitSeal,manaOwner,materialDebitSeal,strainAfter:Math.min(100,state.strain+(check?.degree==='severe failure'?8:0)),
  stepAfter:check?.success?8:state.step});
 l.rows.push({source:q,seal:hash(q)});p.originalRiftBoundaryDomains=l;
 E.advance(s,q.actualMinutes);World.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('Original independent bounded Domain and reciprocal resource sources failed replay');
 return {actorId,independentlyAccepted:accepted,success:!!check?.success,elapsedMinutes:q.actualMinutes,noPortalOrGlobalRewrite:true};
}
function privateStatus(s,p){
 if(!p?.originalRiftBoundaryDomains)return null;
 const state=replay(s,p);if(!state)throw Error('Original independent Boundary Domain source altered');
 return {privateToGM:true,earnedStep:state.step,strain:state.strain,firstDomainSeal:state.first,
  activeDomains:state.domains.filter(x=>x.opened<=s.world.minutes&&s.world.minutes<x.expires),
  noPortalOrGlobalRewrite:true};
}
module.exports={ORIGIN,verify,form,privateStatus};
