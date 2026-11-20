'use strict';
// The ORIGINAL living Meridian Web's physical and energy formulas, extracted
// from rules/meridian-living-anatomy.js. Both characters use these; no new
// web stages, free branches, learned techniques or redundant rank ladders.
const SEGMENTS=Object.freeze({extraordinary:8,major:36,minor:72});
const int=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
function required(segments,load){
 if(!int(segments,1,12)||!int(load,1,9))
  throw Error('Original anatomical segment count and pressure load needed');
 return Math.max(2,Math.ceil(segments/3)+load-2);
}
function pressure({load,segments,flawed=0,seaPurity,minutes=120}={}){
 if(!int(load,1,9)||!int(segments,1,12)||
  !int(flawed,0,24)||!int(seaPurity,1,9)||
  !int(minutes,15,480))
  throw Error('Actual Meridian route anatomy, prior Gates and Qi pressure required');
 return {
  qiSpent:2+load,
  staminaSpent:Math.ceil(minutes/120)+Math.ceil(load/3),
  dc:13+load+Math.ceil(segments/4)+2*flawed,
  modifierPurity:seaPurity>=5?1:0,
  earnedOnlyOnSuccess:true,
  routeTarget:required(segments,load),
  originalSource:'rules/meridian-living-anatomy.js:work'};
}
function integration({routes,extraordinary,stability,minutes=90}={}){
 if(!int(routes,1,100)||!int(extraordinary,1,8)||
  !int(stability,60,100)||!int(minutes,30,480))
  throw Error('A physically integrated, stable Meridian Web is required');
 return {qiSpent:8+extraordinary,
  staminaSpent:Math.ceil(minutes/90)+2,
  dc:19+Math.ceil(routes/4),
  modifierStability:Math.floor(stability/25)-2,
  originalSource:'rules/meridian-living-anatomy.js:completeWeb'};
}
// The original Stage V spanning graph must contain actual healed routes
// connected by shared, individually opened Gates, with at least one
// Extraordinary, Major and Minor segment; a title is never proof.
function spanning(routes,stability){
 if(!Array.isArray(routes)||routes.length<1)
  return {ready:false,reason:'No actual individual route integrated'};
 const types=new Set(),visited=new Set(),stack=[0];
 for(const route of routes){
  if(!route||route.integrity<route.required||
   route.injuries?.some(x=>!x.healed))
   return {ready:false,reason:'An original mapped route is incomplete or has unresolved pressure injury'};
  for(const seg of route.segments||[]){
   if(!Object.hasOwn(SEGMENTS,seg.kind)||
    !int(seg.number,1,SEGMENTS[seg.kind]))
    return {ready:false,reason:'No evidenced source of this human Meridian segment'};
   types.add(seg.kind);
  }
 }
 if(Object.keys(SEGMENTS).some(k=>!types.has(k)))
  return {ready:false,reason:'No demonstrated Extraordinary, Major and Minor branch circulation together'};
 visited.add(0);
 while(stack.length){
  const from=routes[stack.pop()];
  for(let i=0;i<routes.length;i++){
   if(visited.has(i))continue;
   if((routes[i].gates||[]).some(n=>(from.gates||[]).includes(n))){
    visited.add(i);stack.push(i);
   }
  }
 }
 if(visited.size!==routes.length)
  return {ready:false,reason:'The separately mapped routes have no physically connected Gate-to-Gate web'};
 if(!int(stability,60,100))
  return {ready:false,reason:'Real Meridian Stability is insufficient to integrate this pressured living web'};
 const segments=new Set(routes.flatMap(x=>x.segments
  .filter(y=>y.kind==='extraordinary').map(y=>y.number)));
 return {ready:true,extraordinary:segments.size};
}
module.exports={SEGMENTS,required,pressure,integration,spanning};
