'use strict';
const P=require('./progress');
function view(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>k!=='key')||typeof p.key!=='string')
  throw Error('Public evolution status accepts only an established branch key');
 // A guessed, registered but still secret branch must be indistinguishable
 // from an entirely nonexistent branch to the player's query.
 const branch=s.table?.evolution?.[p.key],seen=s.table?.evolutionDiscoveries?.[p.key];
 if(!branch||!seen||seen.revealedToPlayer!==true||
    seen.key!==p.key||seen.beastId!==branch.beastId||
    seen.species!==s.beasts?.[branch.beastId]?.species||
    seen.evolutionStage!==s.beasts?.[branch.beastId]?.evolutionStage||
    !Number.isInteger(seen.worldMinute)||seen.worldMinute<0||
    seen.worldMinute>s.world.minutes||
    typeof seen.source!=='string'||seen.source.trim().length<18)
  return {known:false};
 return {known:true,...P.publicStatus(branch),requiresEventRoll:true};
}
module.exports={view};
