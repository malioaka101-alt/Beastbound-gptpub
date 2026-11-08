'use strict';
// Canon §22 Phase II — Soul Threading: reinforce one's own mind/soul/body
// connections through actual earned work. Distinct from Meridian Gates,
// spell Circles and organ remodelling. No mind-reading, soul extraction,
// forced bonds or free spiritual attacks.
const Crypto=require('node:crypto');
const E=require('../engine'),C=require('./core'),W=require('./world'),
 U=require('./unified'),Combat=require('./combat'),Build=require('./build');
const ORIGIN='earned-soul-threading-phase-ii-v1';
const LINKS=Object.freeze(['mind','body','resonance']);
const FOCI=Object.freeze([...LINKS,'integrated']);
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const empty=()=>({mind:0,body:0,resonance:0});
const ability=p=>Math.floor(((p.attributes?.wis??10)-10)/2)+2*(p.skills?.cultivation?.rank||0);
function originalPerception(s){
 const p=s.player,so=p?.soul,history=s.table?.disciplineTraining?.soul?.history||[];
 const witness=history.find(x=>x?.target==='phase1'&&
  x.change==='Phase I Soul Perception; first stable perception');
 const foundation=Build.soulProfile(1,{will:0});
 if(!so||so.phase!==1||!witness||!Number.isInteger(witness.day)||
    witness.day<1||witness.day>E.day(s)||
    !Number.isInteger(so.stability)||so.stability<1||so.stability>100||
    !Number.isInteger(so.maxReserve)||so.maxReserve<1||so.maxReserve>1000||
    so.perceptionRange!==foundation.perceptionRangeMetres||
    !Number.isInteger(so.reserve)||so.reserve<0||so.reserve>so.maxReserve)
  throw Error('Soul Threading requires genuinely earned and internally consistent Phase I Soul Perception');
 return {witness,foundation};
}
function safety(s){
 if(!E.LOCATIONS[s.world?.location])throw Error('Soul Threading requires a genuine present location');
 if(s.battle||s.encounter)throw Error('Unresolved immediate danger prevents protected soul-body thread practice');
 if(s.table?.combatants?.player?.status &&
    s.table.combatants.player.status!=='ok')
  throw Error('An incapacitated person cannot attempt independent spiritual restructuring');
}
function earned(s){
 const p=s.player,so=p?.soul,h=s.table?.disciplineTraining?.soul?.history||[],
  work=s.table?.soulThreadWork,proof=so?.threadProof,
  last=work?.attempts?.at(-1),
  finish=h.find(x=>x?.target==='phase2'&&
    x.change==='Phase II Soul Threading; mind, soul and body connections stabilised');
 if(!so||so.phase<2||!proof||!work?.completed||
    !Array.isArray(work.attempts)||!work.attempts.length||
    !finish||finish.witnessSource!==ORIGIN||
    !Number.isInteger(finish.day)||finish.day<1||finish.day>E.day(s)||
    proof.source!==ORIGIN||
    proof.workHash!==digest(work.attempts)||
    proof.completedMinute>s.world.minutes||
    !Number.isInteger(proof.completedMinute)||
    proof.completedMinute<last.minute+last.minutes)
  throw Error('Soul Threading needs saved, witnessed, completed Phase II structural evidence');
 const reconstructed=empty();
 let integrated=false;
 for(const t of work.attempts){
  if(!t||!FOCI.includes(t.focus)||
    !Number.isInteger(t.minute)||t.minute<0||t.minute>s.world.minutes||
    !Number.isInteger(t.minutes)||t.minutes<15||t.minutes>480||
    t.reserveSpent!==2||!Number.isInteger(t.staminaSpent)||t.staminaSpent<1||
    !['success','strong','exceptional','setback','failure','severe failure'].includes(t.degree)||
    t.earned!==(t.degree==='exceptional'?3:
       t.degree==='strong'?2:t.degree==='success'?1:0))
   throw Error('Soul Threading evidence is incomplete or inconsistent');
  if(t.earned){
   if(t.focus==='integrated'){
    integrated=true;
    for(const link of LINKS)reconstructed[link]=Math.min(2,
      reconstructed[link]+(t.degree==='exceptional'?2:1));
   }else reconstructed[t.focus]=Math.min(2,reconstructed[t.focus]+t.earned);
  }
 }
 if(!integrated||LINKS.some(k=>reconstructed[k]!==2)||
    LINKS.some(k=>so.threadLinks?.[k]!==reconstructed[k])||
    LINKS.some(k=>proof.links?.[k]!==reconstructed[k])||
    !Number.isInteger(so.threadIntegrity)||so.threadIntegrity<40||
    so.threadIntegrity>100||so.threadIntegrity!==proof.integrity)
  throw Error('Soul Phase II is not a completed and witnessed integrated thread architecture');
 // The Phase I historical witness must survive. Later Phase II changes
 // capacity but do not revise the source record, Phase I date or identity.
 if(!h.some(x=>x?.target==='phase1'&&
    x.change==='Phase I Soul Perception; first stable perception'&&
    Number.isInteger(x.day)&&x.day>=1&&x.day<=finish.day))
  throw Error('Phase II requires the original earned Phase I perception history');
 const profile=Build.soulProfile(2,{will:0});
 if(!Number.isInteger(so.maxReserve)||so.maxReserve<profile.soulReserve||
    so.maxReserve!==proof.maxReserve||
    so.perceptionRange!==profile.perceptionRangeMetres||
    so.perceptionRange!==proof.perceptionRange||
    !Number.isInteger(so.reserve)||so.reserve<0||
    so.reserve>so.maxReserve) 
  throw Error('Saved Phase II soul capacity does not match the actual earned structure');
 return {phase:2,integrity:so.threadIntegrity,links:{...reconstructed},
  concentrationBonus:2,source:ORIGIN,noMindreading:true};
}
function status(s){
 if(s.player?.soul?.phase>=2){
  try{return {earned:true,...earned(s),noUnearnedArts:true};}
  catch(e){return {earned:false,ready:false,reason:e.message};}
 }
 let ready=true,reason=null;
 try{originalPerception(s);safety(s);}catch(e){ready=false;reason=e.message;}
 const state=s.table?.soulThreadWork;
 return {earned:false,ready,links:{...empty(),...(state?.links||{})},
  requiredPerLink:2,integratedWorkRequired:true,
  availableFoci:[...FOCI],
  independent:true,minimumMinutes:15,maximumMinutes:480,
  noCompulsoryTeacher:true,noMinimumCalendarDays:true,
  ...(reason?{reason}:{}),
  note:'Soul Threading reinforces the practitioner’s own living mind/soul/body links, never another being’s private thoughts'};
}
function work(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>!['focus','minutes','approach'].includes(k)))
  throw Error('Soul Threading accepts real focus, effort and a descriptive approach, not chosen DC, rank, spell, target or success');
 const {focus='integrated',minutes=120,approach}=params;
 if(!FOCI.includes(focus))throw Error('A real mind, body, resonance or integrated thread focus is needed');
 C.int(minutes,'Soul Threading minutes',15,480);
 if(approach!==undefined&&
    (typeof approach!=='string'||approach.trim().length<8||approach.length>240))
  throw Error('Describe genuine inner thread work, not an awarded Soul power');
 originalPerception(s);safety(s);
 const so=s.player.soul,prior=s.table?.soulThreadWork,
  fatigue=Math.ceil(minutes/120);
 if(prior&&(prior.completed||!prior.links||!Array.isArray(prior.attempts)||
    prior.attempts.length>500||typeof prior.integrated!=='boolean'||
    LINKS.some(k=>!Number.isInteger(prior.links[k])||
      prior.links[k]<0||prior.links[k]>2)))
  throw Error('A saved earlier soul-thread attempt must be reconciled before further work');
 if(so.reserve<2||s.player.stamina<fatigue)
  throw Error('Soul Threading needs two actual Soul reserve and available Stamina');
 const ledger=prior||{links:empty(),integrated:false,attempts:[],completed:false};
 const start=s.world.minutes;
 so.reserve-=2;s.player.stamina-=fatigue;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:ability(s.player),dc:16,
  label:'Soul Phase II — '+focus+' threading'});
 const gain=check.progress;
 if(gain){
  if(focus==='integrated'){
   ledger.integrated=true;
   for(const k of LINKS)ledger.links[k]=Math.min(2,
    ledger.links[k]+(check.degree==='exceptional'?2:1));
  }else ledger.links[focus]=Math.min(2,ledger.links[focus]+gain);
 }
 let backlash=null;
 if(check.degree==='severe failure'){
  backlash='identity resonance backlash';
  so.stability=Math.max(1,so.stability-6);
  U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 const attempt={minute:start,minutes,focus,
  degree:check.degree,roll:check.roll,earned:gain,
  reserveSpent:2,staminaSpent:fatigue,location:s.world.location,
  ...(approach?{approach:approach.trim()}:{}),
  source:'Personal Soul Threading, existing earned Phase I perception at '+E.LOCATIONS[s.world.location].name};
 ledger.attempts.push(attempt);
 s.table||={};s.table.soulThreadWork=ledger;
 let formed=false;
 if(ledger.integrated&&LINKS.every(k=>ledger.links[k]>=2)){
  const next=Build.soulProfile(2,{
   will:Math.floor(((s.player.attributes?.wis??10)-10)/2)});
  const integrity=Math.max(40,Math.min(100,65+Math.max(0,check.margin)*2));
  so.phase=2;so.maxReserve=next.soulReserve;
  so.reserve=Math.min(so.reserve,so.maxReserve);
  so.perceptionRange=next.perceptionRangeMetres;
  so.threadLinks={...ledger.links};so.threadIntegrity=integrity;
  so.threadProof={source:ORIGIN,links:{...ledger.links},
   integrity,maxReserve:so.maxReserve,
   perceptionRange:so.perceptionRange,
   completedMinute:start+minutes,
   workHash:digest(ledger.attempts),
   mindreading:false,noAutomaticContract:true};
  s.table.disciplineTraining.soul.history.push({
   day:E.day(s),target:'phase2',quality:check.degree,
   change:'Phase II Soul Threading; mind, soul and body connections stabilised',
   witnessSource:ORIGIN});
  ledger.completed=true;formed=true;
 }
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 C.event(s,'progress',formed?
  'Phase II Soul Threading has stabilised the practitioner’s own mind, soul and body links.':
  backlash?'Identity and resonance strain interrupt self-threading.':
  'Soul Threading practice develops controlled inner links.',{
   origin:ORIGIN,originalCheck:check,attempt,
   links:{...ledger.links},integrated:ledger.integrated,formed,
   reserveSpent:2,staminaSpent:fatigue,backlash,
   ...(formed?{phase:2,integrity:so.threadIntegrity,
    noOtherPersonsRead:true,noAutomaticSoulArts:true}: {})
  });
 return {system:'soul',target:'phase2',focus,check,
  earned:gain,links:{...ledger.links},formed,
  reserveSpent:2,staminaSpent:fatigue,minutes,backlash,
  independent:true,feeTalons:0,noNewMindreading:true,
  ...(formed?{threadIntegrity:so.threadIntegrity,
   perceptionRangeMetres:so.perceptionRange}: {})};
}
module.exports={ORIGIN,LINKS,FOCI,status,work,earned};
