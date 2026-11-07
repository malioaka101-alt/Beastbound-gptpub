'use strict';
// Multi-axis current capabilities and independent, GM-sealed potential. Master §§17–19, 29.
// No universal class/rank, no automatic magical unlock and no dice consumed during creation.
const crypto=require('node:crypto');
const Core=require('./core');
const Engine=require('../engine');
const World=require('./world');
const FACETS=Object.freeze({
 physical:{strength:'str',speed:'dex',agility:'dex',endurance:'con',durability:'con',reflexes:'dex',coordination:'dex',recovery:'con'},
 energetic:{capacity:'con',purity:'wis',pressureTolerance:'con',circulation:'wis',control:'wis',recovery:'con',conversionEfficiency:'int',energyPerception:'wis'},
 mental:{intelligence:'int',concentration:'wis',learningSpeed:'int',creativity:'int',tacticalReasoning:'wis',memory:'int'},
 spiritual:{willpower:'wis',soulStability:'wis',resonanceSensitivity:'wis',identityIntegrity:'cha',spiritualResistance:'con'}
});
const POTENTIAL=Object.freeze({
 meridianBreadth:'meridian',gateStability:'meridian',manaCoreArchitecture:'arcana',soulDepth:'research',soulResilience:'medicine',
 physicalAdaptation:'survival',evolutionaryPlasticity:'research',elementalAffinity:'arcana',bloodlineExpression:'medicine',
 lineageCompatibility:'beastcraft',traitIntegration:'medicine',synchronisation:'beastcraft',comprehension:'research',techniqueCreativity:'research'
});
const SCORE_MIN=1,SCORE_MAX=20;
const cap=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
function hashN(s,label){const seed=(s.campaign?.startSeed??s.seed)>>>0;const tag=String(s.player.name||'Unknown');const d=crypto.createHash('sha256').update(`bb-capability-v1|${seed}|${tag}|${label}`).digest();return d.readUInt32BE(0);}
function make(s){
 if(!s||!s.player||!s.player.attributes)throw Error('Player and original six attributes required');
 const domains={};
 for(const [name,fields] of Object.entries(FACETS)){
  domains[name]={};
  for(const [facet,base] of Object.entries(fields)){
   const v=s.player.attributes[base];Core.int(v,'Base '+base,SCORE_MIN,SCORE_MAX);
   domains[name][facet]={current:cap(v+(hashN(s,'facet:'+name+':'+facet)%5)-2,SCORE_MIN,SCORE_MAX),trained:0};
  }
 }
 const potential={};
 for(const key of Object.keys(POTENTIAL))potential[key]={latent:1+(hashN(s,'potential:'+key)%9),assessments:[]};
 return {version:1,source:'Independent seeded character-creation profile; not an ability unlock',domains,potential,assessmentsMade:0};
}
function ensure(s){if(!s.player.capabilityProfile)s.player.capabilityProfile=make(s);validate(s.player.capabilityProfile);return s.player.capabilityProfile;}
function validate(x){
 if(!x||x.version!==1)throw Error('Unsupported character capability profile');
 for(const [domain,fields] of Object.entries(FACETS))for(const name of Object.keys(fields)){
  const v=x.domains?.[domain]?.[name];if(!v)throw Error('Missing '+domain+'/'+name);
  Core.int(v.current,domain+' '+name,1,20);Core.int(v.trained,domain+' '+name+' trained',0,20);
 }
 for(const k of Object.keys(POTENTIAL)){
  const p=x.potential?.[k];if(!p||!Array.isArray(p.assessments)||p.assessments.length>20)throw Error('Missing/invalid potential '+k);
  Core.int(p.latent,k+' sealed potential',1,9);
 }
 return true;
}
function publicStatus(s){
 const x=s.player.capabilityProfile||make(s);validate(x);const domains={};
 for(const [domain,fields] of Object.entries(x.domains))domains[domain]=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.current]));
 const potential=Object.fromEntries(Object.entries(x.potential).map(([key,v])=>[key,v.assessments.length?{
  state:'provisionally assessed',latest:v.assessments.at(-1).reading,confidence:v.assessments.at(-1).confidence,source:v.assessments.at(-1).source
 }:{state:'unassessed'}]));
 return {attributes:{...s.player.attributes},domains,potential,source:'In-world capability profile; unmeasured potential is not zero and is never automatically disclosed'};
}
const BANDS=['limited','limited','developing','developing','promising','promising','strong','exceptional','exceptional'];
function assess(s,{dimension,source,facility,minutes=120}={}){
 if(!Object.hasOwn(POTENTIAL,dimension))throw Error('Unknown potential dimension');
 if(typeof source!=='string'||source.trim().length<18)throw Error('A named examination/source is required');
 if(typeof facility!=='string'||facility.trim().length<5)throw Error('Named facility required');
 Core.int(minutes,'Exam minutes',60,480);
 // An academy assessment needs a currently accessible academy or actual clinic;
 // remote requests cannot claim to have performed a medical or magical exam.
 if(!['academy','crossing'].includes(s.world.location))throw Error('No established qualified assessment site in the current scene');
 const x=ensure(s),p=x.potential[dimension];
 if(p.assessments.some(a=>a.source===source.trim()))throw Error('This recorded examination was already used for this dimension');
 if(s.player.coins<1)throw Error('One Talon examination fee is required');
 const rank=s.player.skills?.[POTENTIAL[dimension]]?.rank||0;
 const attribute=['meridianBreadth','gateStability','soulDepth','soulResilience','synchronisation'].includes(dimension)?'wis':'int';
 const mod=Math.floor((s.player.attributes[attribute]-10)/2)+2*rank;
 s.player.coins-=1;
 const check=Core.check(s,{modifier:mod,dc:15,label:`${dimension} examination at ${facility}`,risky:false});
 Engine.advance(s,minutes);World.finalizeTime(s,s.world.minutes-minutes);
 let reading='inconclusive',confidence='none';
 if(check.success){reading=BANDS[p.latent-1];confidence=check.degree==='exceptional'?'high':check.degree==='strong'?'moderate':'provisional';}
 const entry={source:source.trim().slice(0,120),facility:facility.trim().slice(0,80),day:Engine.day(s),reading,confidence};
 p.assessments.push(entry);x.assessmentsMade++;
 return {dimension,reading,confidence,source:entry.source,minutes,feeTalons:1,check,notAUniversalRank:true};
}
module.exports={FACETS,POTENTIAL,make,ensure,validate,publicStatus,assess};