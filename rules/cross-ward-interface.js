'use strict';
// Original Master §§19,26: the FIRST practical individual Qi–Mana hybrid
// effect. This is a separately tested interface for an ALREADY LEARNED Ward.
// It cannot learn/cast Ward, produce free Mana, increase ward magnitude,
// stack arbitrary supports, introduce a second roll or imply universal hybrid
// compatibility. Source evidence and a single authentic coherent field
// precede the bounded one-use adjustment.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Cross=require('./cross-discipline-coherence');
const SOURCE='personally-measured-meridian-supported-arcane-ward-v1',
 WITNESS='gm-witnessed-meridian-to-existing-ward-countertest-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(n,a=0,b=1000000000)=>Number.isInteger(n)&&n>=a&&n<=b;
const prose=(x,min=25)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=900;
const only=(p,k)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>k.includes(x));
const DC=14,QI=1,MANA=1,STA=1,MINUTES=10,EFFECT_MINUTES=40;
function ledger(s){return s.table?.crossDiscipline?.wardInterface||null;}
function rollValid(a){
 const c=a.check,e=a.rollEvent;
 return !!(c&&e?.type==='roll'&&a.rollEventHash===hash(e)&&
  hash(e.details)===hash(c)&&integer(a.roll,1,20)&&
  c.roll===a.roll&&c.modifier===a.modifier&&c.dc===a.dc&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===c.roll+c.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
function verify(s){
 const l=ledger(s);
 if(!l)return true;
 if(l.origin!==SOURCE||!Array.isArray(l.calibrations)||
  !Array.isArray(l.uses)||!l.calibrations.length||
  !Cross.verify(s))return false;
 const all=s.table?.crossDiscipline?.qiMana?.trials||[];
 const recs=new Map(),witnesses=new Set();let last=-1;
 for(const receipt of l.calibrations){
  const a=receipt?.source,w=a?.witness,d=w?.details;
  const prior=all.find(t=>t.seal===a?.coherenceSeal)?.source;
  if(receipt?.origin!==SOURCE||receipt.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='already-learned-ward-interface'||
   a.location!==d?.location||!integer(a.minute,last,s.world.minutes)||
   a.minutes!==MINUTES||a.minute+MINUTES>s.world.minutes||
   a.techniqueId!=='arcane_ward'||a.qiSpent!==QI||
   a.manaSpent!==MANA||a.staminaSpent!==STA||
   !integer(a.wisdomScore,1,30)||!integer(a.intScore,1,30)||
   !integer(a.cultivationRank,0,5)||!integer(a.arcanaRank,0,5)||
   a.modifier!==Math.floor((Math.min(a.wisdomScore,a.intScore)-10)/2)+
    2*Math.min(a.cultivationRank,a.arcanaRank)||
   a.dc!==DC||!rollValid(a)||a.success!==a.check.success||
   a.backlash!==(a.check.degree==='severe failure')||
   a.wardGeometry!==d?.measuredWardGeometry||
   !prior?.fieldEmerged||!prior.success||
   prior.observedMode!=='coherent'||
   prior.activeUntil<a.minute+MINUTES||
   a.activeUntil!==(a.success?
    Math.min(prior.activeUntil,a.minute+MINUTES+EFFECT_MINUTES):null)||
   !w||w.type!=='story'||a.witnessHash!==hash(w)||
   d.origin!==WITNESS||d.techniqueId!==a.techniqueId||
   d.coherenceSeal!==a.coherenceSeal||
   !prose(d.originalWardFormula)||!prose(d.originalMeridianDistribution)||
   !prose(d.independentWardOnlyBaseline)||
   !prose(d.independentAdversePhaseCountertest)||
   !prose(d.realSourceEnergyCost)||!prose(d.tissueAndCoreLimit)||
   !prose(d.singleCastingOnlyLimit)||
   d.oneRealWardRollOnly!==true||
   d.noNewWardFormula!==true||d.noAddedWardMagnitude!==true||
   witnesses.has(a.witnessHash))
   return false;
  witnesses.add(a.witnessHash);
  recs.set(receipt.seal,a);last=a.minute+MINUTES;
 }
 const used=new Set();
 for(const receipt of l.uses){
  const a=receipt?.source,x=recs.get(a?.calibrationSeal),e=a?.wardEvent;
  if(receipt?.origin!==SOURCE||receipt.seal!==hash(a)||
   a?.origin!==SOURCE||a.kind!=='single-actual-ward-cast-use'||
   !x?.success||used.has(a.calibrationSeal)||
   !integer(a.minute,x.minute+MINUTES,x.activeUntil-1)||
   a.minute>s.world.minutes||
   a.bonus!==1||
   e?.type!=='combat'||a.wardEventHash!==hash(e)||
   e.details?.origin!=='verified-one-minute-arcane-ward'||
   e.details?.techniqueId!=='arcane_ward'||
   e.details?.hybridWardSupport?.source!==SOURCE||
   e.details.hybridWardSupport.calibrationSeal!==a.calibrationSeal||
   e.details.hybridWardSupport.bonus!==1||
   e.details.check?.modifier!==a.wardRollModifier||
   e.details.check?.roll!==a.wardRoll||
   e.details.check?.dc!==a.wardDC||
   !integer(a.wardRoll,1,20))
   return false;
  used.add(a.calibrationSeal);
 }
 return true;
}
function currentCoherence(s){
 if(!Cross.verify(s))throw Error('Original separately earned Qi–Mana energy history is inconsistent');
 const now=s.world.minutes;
 return (s.table?.crossDiscipline?.qiMana?.trials||[]).filter(x=>
  x.source?.fieldEmerged&&x.source.success&&
  x.source.minute+30<=now&&x.source.activeUntil>now).at(-1)||null;
}
function status(s){
 if(!verify(s))throw Error('Previously observed Meridian–Ward interface has lost original evidence');
 const l=ledger(s),now=s.world.minutes,used=new Set((l?.uses||[]).map(x=>x.source.calibrationSeal));
 return {calibrated:(l?.calibrations||[]).length,
  alreadyAppliedWardCasts:l?.uses.length||0,
  activeReady:(l?.calibrations||[]).filter(x=>
   x.source.success&&!used.has(x.seal)&&
   now>=x.source.minute+MINUTES&&now<x.source.activeUntil).map(x=>({
    calibrationSeal:x.seal,
    expiresAtWorldMinute:x.source.activeUntil,
    actualTechnique:'arcane_ward',oneCastingOnly:true,bonus:1})),
  note:'Requires an actually learned Ward and a separate individual Qi-to-Ward countertest. This does not cast a spell, give extra Mana, increase Ward steps or add a die'};
}
function calibrate(s,p={}){
 if(!only(p,['witnessIndex'])||
  !integer(p.witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Only a fresh independently witnessed original Qi-to-Ward countertest is accepted');
 if(s.battle||s.encounter||
  s.table?.combatants?.player?.status!=='ok'||
  s.world?.planeId&&s.world.planeId!=='mortal')
  throw Error('A safe actual physical scene is required for individual human Qi-to-Ward calibration');
 const coherence=currentCoherence(s);
 if(!coherence||coherence.source.activeUntil<s.world.minutes+MINUTES)
  throw Error('The independently earned coherent Qi–Mana field must remain physically active through calibration');
 // Validate a genuinely learned existing formula through its own system.
 const Ward=require('./arcane-ward'),ward=Ward.profile(s,'arcane_ward');
 if(!verify(s))throw Error('Earlier personally measured hybrid Ward sources were altered');
 const w=s.log[p.witnessIndex],d=w?.details;
 if(w?.type!=='story'||!prose(w.text)||d?.origin!==WITNESS||
  d.location!==s.world.location||d.techniqueId!=='arcane_ward'||
  d.coherenceSeal!==coherence.seal||
  d.measuredWardGeometry!==s.player.arcane.geometry||
  !prose(d.originalWardFormula)||!prose(d.originalMeridianDistribution)||
  !prose(d.independentWardOnlyBaseline)||
  !prose(d.independentAdversePhaseCountertest)||
  !prose(d.realSourceEnergyCost)||!prose(d.tissueAndCoreLimit)||
  !prose(d.singleCastingOnlyLimit)||
  d.oneRealWardRollOnly!==true||
  d.noNewWardFormula!==true||d.noAddedWardMagnitude!==true)
  throw Error('The measured learned Ward, coherent Meridian distribution and adverse-phase countertest must actually be witnessed first');
 const h=hash(w),l=ledger(s);
 if(l?.calibrations.some(x=>x.source.witnessHash===h))
  throw Error('An original Ward stabilisation experiment cannot reroll the same source evidence');
 if(s.player.qi<QI||s.player.mana<MANA+ward.manaCost||
  s.player.stamina<STA||s.table.combatants.player.stamina<STA)
  throw Error('Actual independent Qi, Mana for calibration and a later real Ward, and living Stamina are required');
 const wisdom=C.int(s.player.attributes.wis,'living Wisdom',1,30),
  intelligence=C.int(s.player.attributes.int,'living Intelligence',1,30),
  cultivation=C.int(s.player.skills.cultivation.rank,'earned Cultivation',0,5),
  arcana=C.int(s.player.skills.arcana.rank,'earned Arcana',0,5),
  modifier=Math.floor((Math.min(wisdom,intelligence)-10)/2)+
   2*Math.min(cultivation,arcana),
  now=s.world.minutes,check=C.check(s,{modifier,dc:DC,
   label:'Original independent Qi circulation to learned Ward stabilisation'}),
  event=structuredClone(s.log.at(-1)),
  backlash=check.degree==='severe failure',
  activeUntil=check.success?
   Math.min(coherence.source.activeUntil,now+MINUTES+EFFECT_MINUTES):null;
 if(backlash){Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
 s.player.qi-=QI;s.player.mana-=MANA;
 s.player.stamina-=STA;s.table.combatants.player.stamina=s.player.stamina;
 const a={origin:SOURCE,kind:'already-learned-ward-interface',
  location:s.world.location,minute:now,minutes:MINUTES,
  techniqueId:'arcane_ward',wardGeometry:d.measuredWardGeometry,
  coherenceSeal:coherence.seal,witness:structuredClone(w),witnessHash:h,
  wisdomScore:wisdom,intScore:intelligence,
  cultivationRank:cultivation,arcanaRank:arcana,modifier,
  dc:DC,qiSpent:QI,manaSpent:MANA,staminaSpent:STA,
  roll:check.roll,check:structuredClone(check),rollEvent:event,
  rollEventHash:hash(event),success:check.success,backlash,activeUntil};
 const receipt={origin:SOURCE,source:a,seal:hash(a)};
 s.table.crossDiscipline||={};
 const record=l||{origin:SOURCE,calibrations:[],uses:[]};
 record.calibrations.push(receipt);
 s.table.crossDiscipline.wardInterface=record;
 E.advance(s,MINUTES);W.finalizeTime(s,now);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original physical Qi-to-Ward experiment receipt does not verify');
 return {attempted:true,success:check.success,check,
  calibrationSeal:receipt.seal,activeUntil,
  qiSpent:QI,manaSpent:MANA,staminaSpent:STA,minutes:MINUTES,
  oneSubsequentWardCastingOnly:true,
  noNewWardFormula:true,noExtraRoll:true};
}
function support(s){
 if(!ledger(s))return {bonus:0,sourceSeal:null};
 if(!verify(s))throw Error('Actual saved hybrid Ward source was corrupted');
 const now=s.world.minutes,l=ledger(s),
  used=new Set(l.uses.map(x=>x.source.calibrationSeal));
 const result=l.calibrations.filter(x=>x.source.success&&
  !used.has(x.seal)&&
  now>=x.source.minute+MINUTES&&now<x.source.activeUntil).at(-1);
 return result?{bonus:1,sourceSeal:result.seal}:{bonus:0,sourceSeal:null};
}
function consume(s,seal,check){
 if(!seal)return;
 if(!verify(s))throw Error('Real original Qi-to-Ward source must verify before use');
 const x=ledger(s)?.calibrations.find(a=>a.seal===seal);
 if(!x?.source.success||s.world.minutes>=x.source.activeUntil||
  ledger(s).uses.some(y=>y.source.calibrationSeal===seal))
  throw Error('Only one actual Ward casting can consume an unexpired individual Qi-to-Ward calibration');
 const event=structuredClone(s.log.at(-1));
 if(event?.type!=='combat'||event.details?.origin!=='verified-one-minute-arcane-ward'||
  event.details?.hybridWardSupport?.calibrationSeal!==seal||
  event.details?.check?.roll!==check.roll)
  throw Error('The actual original Ward must have already been cast and witnessed');
 const a={origin:SOURCE,kind:'single-actual-ward-cast-use',
  calibrationSeal:seal,minute:s.world.minutes,bonus:1,
  wardRoll:check.roll,wardRollModifier:check.modifier,wardDC:check.dc,
  wardEvent:event,wardEventHash:hash(event)};
 ledger(s).uses.push({origin:SOURCE,source:a,seal:hash(a)});
 if(!verify(s))throw Error('Original one-use Ward stabilisation receipt did not reconcile');
}
module.exports={SOURCE,WITNESS,status,verify,calibrate,support,consume};
