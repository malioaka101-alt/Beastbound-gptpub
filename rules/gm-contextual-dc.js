'use strict';
// GM discretion never substitutes for a source-owned action, actual costs,
// consent, original task scale or an authentic die. This is a PRE-ROLL,
// witnessed narrative adjudication, not a caller-set "I want DC 2" shortcut.
const Crypto=require('node:crypto');
const Difficulty=require('./dynamic-difficulty');
const Places=require('../world/lived-places');
const sha=x=>Crypto.createHash('sha256').update(x).digest('hex');
const ALLOWED=new Set(['adjust','routine','impossible']);
function sourceText(s,source){
 switch(source){
  case 'scene':return s.chatRuntime?.scene||'';
  case 'place':return Places.location(s,s.world?.location)?.description||'';
  case 'weather':return s.world?.weather||'';
  default:throw Error('GM context must cite a saved scene, established place or actual weather');
 }
}
function witness(s,input,{allowNoRoll=false}={}){
 if(!input||typeof input!=='object'||Array.isArray(input)||
    Object.keys(input).some(k=>!['kind','adjustment','source','quote','reason'].includes(k))||
    !ALLOWED.has(input.kind)||!['scene','place','weather'].includes(input.source)||
    typeof input.quote!=='string'||input.quote.trim().length<14||input.quote.length>200||
    typeof input.reason!=='string'||input.reason.trim().length<24||input.reason.length>280)
  throw Error('GM contextual ruling needs a real scene quote and specific pre-roll explanation, never a chosen DC or outcome');
 if(input.kind==='adjust'){
  if(!Number.isInteger(input.adjustment)||input.adjustment===0||
     Math.abs(input.adjustment)>5)
   throw Error('GM may change the original owner DC by at most five points, not choose a final DC');
 }else if(!allowNoRoll||input.adjustment!==undefined)
  throw Error('No-roll adjudication is only allowed for actually witnessed mundane checks, with no numeric adjustment');
 const text=sourceText(s,input.source);
 if(!text||!text.toLowerCase().includes(input.quote.trim().toLowerCase()))
  throw Error('GM difficulty evidence must quote the original saved scene, location or weather verbatim');
 const normalizedReason=input.reason.trim().toLowerCase();
 if(/\b(?:guarantee(?:d)?\s+(?:pay|money|reward|rank|growth)|grant\s+(?:talons|loot|skill|power)|override\s+(?:consent|bond)|free\s+(?:rank|ability))\b/i.test(normalizedReason))
  throw Error('GM judgment cannot invent rewards, consent or power progression');
 return {kind:input.kind,adjustment:input.kind==='adjust'?input.adjustment:0,
   source:input.source,quote:input.quote.trim(),reason:input.reason.trim(),
   originalSourceHash:sha(text),location:s.world.location,worldMinute:s.world.minutes,
   witnessed:true,preRoll:true,gmAuthority:'scene-context-only'};
}
function adjust(s,difficulty,gmContext,{owner,min=5,max=35}={}){
 if(gmContext===undefined)return difficulty;
 const evidence=witness(s,gmContext);
 if(evidence.kind!=='adjust')throw Error('This source owner requires an honest original roll; no automatic rewards or training');
 const factor={id:'gm-witnessed-context',delta:evidence.adjustment,
  evidence:'GM observed '+evidence.source+' "'+evidence.quote+'": '+evidence.reason,
  sourceHash:evidence.originalSourceHash};
 const originalFactors=difficulty.factors||[];
 if(originalFactors.some(x=>x.id==='gm-witnessed-context'))
  throw Error('One GM contextual assessment per original check');
 const result=Difficulty.finish(difficulty.baseDC,[...originalFactors,factor],{min,max});
 return {...difficulty,...result,gmContext:evidence,
  adjudicatedOwner:owner||'source-specific-rule',
  note:'Original owner baseline + actual situation + one GM witnessed pre-roll adjustment; never a chosen final DC'};
}
function noRoll(s,gmContext){
 if(gmContext===undefined)return null;
 const e=witness(s,gmContext,{allowNoRoll:true});
 return e.kind==='adjust'?e:e;
}
module.exports={sourceText,witness,adjust,noRoll};
