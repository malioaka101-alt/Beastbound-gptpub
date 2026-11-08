'use strict';
// The GM creates metaphysics, stories, sites and revelations. This registry
// preserves them *inside the existing world simulation*. It is not a separate
// narrator, spell source, encounter generator, divine scheduler or travel graph.
// §3 + §18 + §25 + §27 of the original Beastbound Unified Master Prompt.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),Mythic=require('./mythic');
const SOURCE='gm-authored-cosmology-v1';
const hash=v=>Crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const slug=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,63}$/.test(x);
const phrase=(x,min=3,max=500)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=max;
const allowed=(p,required,optional=[])=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(x=>![...required,...optional].includes(x))||
  required.some(k=>!Object.hasOwn(p,k)))
  throw Error('A cosmology operation accepts only witnessed GM-established fields, not an awarded blessing or transit outcome');
};
const CATEGORIES=['physical','spirit','elemental','liminal','divine','other'];
const VIS=['public','gm-only'];
const KINDS=['law','tradition','hypothesis','disputed'];
const EXEMPLARS=Object.freeze([
 {id:'riftglass_wardline',name:'Riftglass exterior wardline',planeId:'liminal',
  siteId:'riftglass_vault',description:'Surveyors attest to wardstones and spatial pressure, not a safely traversable doorway.'},
 {id:'aurora_ancestor_approach',name:'Ancestor Gate approach',planeId:'spirit',
  siteId:'aurora_ancestor_gate',description:'The public tradition warns that crossing the gate without a real anchor is forbidden.'},
 {id:'ashglass_labyrinth_approach',name:'Ashglass labyrinth approach',planeId:'liminal',
  siteId:'ashglass_deep',description:'Old reports speak of changing geometry; neither an open route nor a reliable return is established.'}
]);
function founding(d){return {source:SOURCE,recordedMinute:0,...d};}
function canonicalPlanes(){return Object.fromEntries(Mythic.REALMS.map((r,i)=>{
 const record=founding({id:r.id,name:r.name,category:CATEGORIES[i],
  description:r.public,visibility:'public',publicTradition:true});
 return [r.id,{...record,originHash:hash(record),facts:[]}];
}));}
function canonicalBoundaries(){return Object.fromEntries(EXEMPLARS.map(x=>{
 const record=founding({...x,visibility:'public',hypothetical:true,
  siteType:'mythic',noProvenPassage:true});
 return [x.id,{...record,originHash:hash(record),observations:[]}];
}));}
function seed(){return {version:1,source:SOURCE,planes:canonicalPlanes(),
 boundaries:canonicalBoundaries(),builtFrom:'Existing Mythic.REALMS and Mythic.SITES; no new realm laws or actual travel awarded'};}
function peek(s){return s.table?.realm?.cosmology||null;}
function registry(s){return peek(s)||seed();}
function ensure(s){
 const w=require('./simulation').ensure(s);
 if(!w.cosmology)w.cosmology=seed();
 validate(w.cosmology,s);
 return w.cosmology;
}
function verifyOrigin(r){
 const {originHash,facts,observations,...original}=r;
 return originHash===hash(original)&&original.source===SOURCE&&
  Number.isInteger(original.recordedMinute)&&original.recordedMinute>=0;
}
function verifyFact(f,planeId){
 if(!f||f.planeId!==planeId||f.source!==SOURCE||
  !KINDS.includes(f.kind)||!VIS.includes(f.visibility)||
  !slug(f.domain)||!phrase(f.statement,12,700)||
  !phrase(f.basis,12,500)||!Number.isInteger(f.recordedMinute)||
  f.recordedMinute<0)return false;
 const {seal,...body}=f;
 return seal===hash(body);
}
function verifyObservation(o,id){
 if(!o||o.boundaryId!==id||o.source!==SOURCE||
  !['unverified','quiet','surging','unstable','sealed'].includes(o.observed)||
  !slug(o.locationId)||!phrase(o.account,16,600)||
  !Number.isInteger(o.recordedMinute)||o.recordedMinute<0)return false;
 const {seal,...body}=o;return seal===hash(body);
}
function validate(v,s=null){
 if(!v||v.version!==1||v.source!==SOURCE||
  !v.planes||!v.boundaries||Array.isArray(v.planes)||
  Array.isArray(v.boundaries))throw Error('Invalid persistent cosmological world ledger');
 for(const [id,p] of Object.entries(v.planes)){
  if(!slug(id)||p.id!==id||!verifyOrigin(p)||
   !phrase(p.name,3,100)||!phrase(p.description,15,900)||
   !slug(p.category)||!VIS.includes(p.visibility)||
   !Array.isArray(p.facts)||p.facts.length>200||
   p.facts.some(x=>!verifyFact(x,id)))
   throw Error('Saved plane has lost its original GM account or coherent facts');
 }
 for(const [id,b] of Object.entries(v.boundaries)){
  if(!slug(id)||b.id!==id||!verifyOrigin(b)||
   !v.planes[b.planeId]||!phrase(b.name,3,120)||
   !phrase(b.description,16,900)||!VIS.includes(b.visibility)||
   !['mythic','lived-place'].includes(b.siteType)||
   (b.siteType==='mythic'&&!Mythic.SITES.some(x=>x.id===b.siteId))||
   (b.siteType==='lived-place'&&s&&!require('./lived-places').get(s,b.siteId))||
   !Array.isArray(b.observations)||b.observations.length>100||
   b.observations.some(x=>!verifyObservation(x,id)))
   throw Error('Saved plane boundary has lost its founding source or observed history');
 }
 return true;
}
function publicPlane(p){
 if(p.visibility==='gm-only')return null;
 return {id:p.id,name:p.name,category:p.category,description:p.description,
  publicTradition:p.publicTradition===true,
  facts:p.facts.filter(f=>f.visibility==='public').map(f=>({
   domain:f.domain,kind:f.kind,statement:f.statement,basis:f.basis,
   recordedMinute:f.recordedMinute})),
  warning:'Tradition and hypothesis are not physical proof, legal authority, entry rights or an awarded power'};
}
function status(s,p={}){
 allowed(p,[],['planeId']);
 const v=registry(s);validate(v,s);
 if(p.planeId!==undefined){
  if(typeof p.planeId!=='string')throw Error('A plane ID must be a real established cosmological record');
  const plane=v.planes[p.planeId];
  if(!plane||plane.visibility==='gm-only')
   return {known:false,note:'No player-known description establishes that plane'};
  return {known:true,plane:publicPlane(plane)};
 }
 return {planes:Object.values(v.planes).map(publicPlane).filter(Boolean),
  publicBoundaries:Object.values(v.boundaries).filter(b=>b.visibility==='public')
   .map(b=>({id:b.id,name:b.name,planeId:b.planeId,siteId:b.siteId,
    noProvenPassage:true})),
  note:'Public cosmological accounts are not proof of actual access, afterlife, divine intervention or supernatural powers.'};
}
function authorPlane(s,p={}){
 allowed(p,['planeId','name','category','description'],['visibility']);
 if(!slug(p.planeId)||!phrase(p.name,3,100)||
  !slug(p.category)||!phrase(p.description,15,900)||
  !VIS.includes(p.visibility||'public'))
  throw Error('A GM-established plane needs a distinct ID, nature and source-grounded description');
 const v=ensure(s);
 if(v.planes[p.planeId])throw Error('This plane is already established and cannot be silently rewritten');
 const origin=founding({id:p.planeId,name:p.name.trim(),category:p.category,
  description:p.description.trim(),visibility:p.visibility||'public',
  publicTradition:false,recordedMinute:s.world.minutes});
 v.planes[p.planeId]={...origin,originHash:hash(origin),facts:[]};
 if(origin.visibility==='public')
  require('../rules/core').event(s,'world','A cosmological world account was established: '+origin.name+'.',
   {source:SOURCE,planeId:p.planeId,noPortalOpened:true,noDivineFavour:true});
 return {recorded:true,planeId:p.planeId,playerKnown:origin.visibility==='public'};
}
function recordFact(s,p={}){
 allowed(p,['planeId','domain','kind','statement','basis'],['visibility']);
 if(!slug(p.domain)||!KINDS.includes(p.kind)||!phrase(p.statement,12,700)||
  !phrase(p.basis,12,500)||!VIS.includes(p.visibility||'gm-only'))
  throw Error('GM cosmological facts must distinguish an actual established law from belief, hypothesis and disputed account');
 const v=ensure(s),plane=v.planes[p.planeId];
 if(!plane)throw Error('A fact cannot name an unestablished plane');
 if(p.visibility==='public'&&plane.visibility==='gm-only')
  throw Error('A sealed plane cannot leak its identity through a public report');
 const source={source:SOURCE,planeId:p.planeId,domain:p.domain,
  kind:p.kind,statement:p.statement.trim(),basis:p.basis.trim(),
  visibility:p.visibility||'gm-only',recordedMinute:s.world.minutes};
 const seal=hash(source);
 if(plane.facts.some(f=>f.seal===seal))return {alreadyRecorded:true,mutated:false};
 if(plane.facts.length>=200)throw Error('Cosmological record requires an archive before further additions');
 plane.facts.push({...source,seal});
 if(source.visibility==='public')
  require('../rules/core').event(s,'world','An account about '+plane.name+' has been documented.',{
   source:SOURCE,planeId:plane.id,domain:source.domain,kind:source.kind,
   factSeal:seal,noPowerGranted:true});
 return {recorded:true,planeId:plane.id,kind:source.kind,
  playerKnown:source.visibility==='public',noInstantMagic:true};
}
function authorBoundary(s,p={}){
 allowed(p,['boundaryId','name','planeId','siteId','description'],['visibility']);
 if(!slug(p.boundaryId)||!phrase(p.name,3,120)||
  !phrase(p.description,16,900)||!VIS.includes(p.visibility||'public'))
  throw Error('A boundary is an authored local phenomenon, not a free portal');
 const v=ensure(s),plane=v.planes[p.planeId];
 if(!plane)throw Error('The linked realm must already have an established identity');
 const mythic=Mythic.SITES.find(x=>x.id===p.siteId);
 const lived=require('./lived-places').get(s,p.siteId);
 if(!mythic&&!lived)throw Error('Boundary needs an actual preexisting mythic site or a GM-established physical place');
 if(v.boundaries[p.boundaryId])throw Error('Boundary already exists; append observations rather than rewriting it');
 if(p.visibility==='public'&&plane.visibility==='gm-only')
  throw Error('Cannot disclose the real identity of an undiscovered sealed plane');
 const origin=founding({id:p.boundaryId,name:p.name.trim(),planeId:p.planeId,
  siteId:p.siteId,siteType:mythic?'mythic':'lived-place',
  description:p.description.trim(),visibility:p.visibility||'public',
  hypothetical:true,noProvenPassage:true,recordedMinute:s.world.minutes});
 v.boundaries[p.boundaryId]={...origin,originHash:hash(origin),observations:[]};
 if(origin.visibility==='public')
  require('../rules/core').event(s,'world','A realm-boundary site has been recorded: '+origin.name+'.',
   {source:SOURCE,boundaryId:p.boundaryId,planeId:p.planeId,noFreeTransit:true});
 return {recorded:true,boundaryId:p.boundaryId,noPassageCreated:true};
}
function observeBoundary(s,p={}){
 allowed(p,['boundaryId','observed','account']);
 if(!['unverified','quiet','surging','unstable','sealed'].includes(p.observed)||
  !phrase(p.account,16,600))
  throw Error('Boundary observation must describe an actual visible phenomenon, not a chosen success or safe passage');
 const v=ensure(s),b=v.boundaries[p.boundaryId];
 if(!b)throw Error('There is no established boundary of that identity');
 const site=Mythic.SITES.find(x=>x.id===b.siteId);
 const loc=require('./lived-places').location(s);
 const here=loc?.regionId;
 if(site){
  if(site.region!==here)throw Error('An actual boundary cannot be personally witnessed across a distant region');
 }else if(b.siteId!==s.world.location){
  throw Error('A GM-created threshold can be observed only at its real established local place');
 }
 if(s.battle||s.encounter)throw Error('An unresolved dangerous encounter cannot be skipped by declaring a calm boundary');
 // Actual Mythic.SITES have independent, mutable seal and charge values.
 // The observation may describe GM-known signs, but cannot edit them or
 // override a known unstable phase by simply choosing "quiet".
 if(site&&p.observed==='quiet'&&
  ['unstable','surging'].includes(require('./simulation').peek(s).mythic?.[site.id]?.phase))
  throw Error('A visibly unstable boundary cannot be described as quiet against the independent world state');
 const o={source:SOURCE,boundaryId:b.id,
  observed:p.observed,account:p.account.trim(),locationId:s.world.location,
  recordedMinute:s.world.minutes};
 const seal=hash(o);
 if(b.observations.some(x=>x.seal===seal))return {alreadyRecorded:true,mutated:false};
 if(b.observations.length>=100)throw Error('Boundary observation record is full; archive before adding more');
 b.observations.push({...o,seal});
 if(b.visibility==='public')
  require('../rules/core').event(s,'world','The realm-boundary signs at '+b.name+' were observed.',
   {source:SOURCE,boundaryId:b.id,observationSeal:seal,noPassageGranted:true});
 return {observed:true,boundaryId:b.id,worldMinute:s.world.minutes,
  neverAutoCrosses:true,noBlessing:true,noUnverifiedRewards:true};
}
function boundaryStatus(s,p={}){
 allowed(p,['boundaryId']);
 const v=registry(s);validate(v,s);
 const b=v.boundaries[p.boundaryId];
 if(!b||b.visibility==='gm-only')
  return {known:false,noPassageEstablished:true};
 const latest=b.observations.at(-1),site=Mythic.SITES.find(x=>x.id===b.siteId);
 return {known:true,id:b.id,name:b.name,planeId:b.planeId,
  site:site?.name||require('./lived-places').get(s,b.siteId)?.name,
  description:b.description,localRegion:site?.region||require('./lived-places').get(s,b.siteId)?.regionId,
  observation:latest?{observed:latest.observed,account:latest.account,
   worldMinute:latest.recordedMinute,notNecessarilyCurrent:true}:null,
  boundaryOpenProven:false,entryPermitted:false,
  actorHasSafeRoute:false,divineGuarantee:false,
  note:'A remembered sign is not a safe, currently open passage. Independent ward state, real anchors, protection, legal access and an actual transit procedure must be resolved separately.'};
}
module.exports={SOURCE,EXEMPLARS,seed,peek,ensure,validate,status,authorPlane,recordFact,authorBoundary,observeBoundary,boundaryStatus};
