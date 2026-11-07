'use strict';
// Shared Origin Pattern mechanics work for both humans and beasts only when
// a real two-parent biological source has been independently established.
// These tests demonstrate the human resolver with controlled source fixtures;
// the engine does NOT yet pretend the 28 family charters imply births.
const A=require('node:assert/strict'),H=require('../world/origin-heredity');
const make=(id,v,idBlood='ancestral-river-pattern')=>({
 id,originSourceHash:H.hash({id,proof:'verified biological origin fixture'}),
 physical:Object.fromEntries(H.PHYSICAL.map(k=>[k,v])),
 systemAptitude:Object.fromEntries(H.SYSTEMS.map(k=>[k,v])),
 bloodline:{id:idBlood,strength:v,expression:v>=75?'expressed':'dormant'}
});
const parents=[make('human_parent_a',96),make('human_parent_b',92)];
const source=n=>({origin:'recorded-human-birth-v1',
 childId:'human_child_'+n,parentIds:parents.map(p=>p.id),
 sourceHashes:parents.map(p=>p.originSourceHash),
 birthWitnessHash:H.hash({day:100,birth:n,parents:parents.map(p=>p.id)})});
{
 const src=source('first'),before=JSON.stringify(parents),
  child=H.inherit({kind:'human',source:src,parents});
 A.equal(child.kind,'human');
 A.equal(child.origin,'source-bound-Origin-inheritance-v1');
 A.equal(child.birthSourceHash,H.hash(src));
 A.deepEqual(child.parentIds,src.parentIds);
 A.ok(H.PHYSICAL.every(x=>child.physical[x]>=65),
  'exceptional parental constitutions can be genuinely advantageous');
 A.ok(H.SYSTEMS.every(x=>child.systemAptitude[x]>=65),
  'high parental magical predispositions can produce meaningful inherited advantages');
 A.equal(child.bloodline.id,'ancestral-river-pattern');
 A.ok(['dormant','expressed'].includes(child.bloodline.expression));
 A.ok(!('techniques' in child)&&!('ranks' in child)&&!('titles' in child)&&
  !('offices' in child)&&!('assets' in child));
 A.equal(JSON.stringify(parents),before);
 A.deepEqual(H.inherit({kind:'human',source:src,parents:parents.slice().reverse()}),
  child,'source-verified parent order is independent of caller order');
 const brother=H.inherit({kind:'human',source:source('second'),parents});
 A.notDeepEqual(brother.physical,child.physical,
  'siblings share bloodlines but are not automatically biological copies');
}
{
 const weak=[make('human_parent_a',24),make('human_parent_b',30)];
 const weakChild=H.inherit({kind:'human',source:source('first'),parents:weak});
 A.ok(H.PHYSICAL.some(x=>weakChild.physical[x]<
  H.inherit({kind:'human',source:source('first'),parents}) .physical[x]),
  'inheritance responds to actual parent traits rather than free universal powers');
}
{
 const valid=source('third');
 for(const forged of [
  {...valid,parentIds:['human_parent_a','stranger']},
  {...valid,sourceHashes:['f'.repeat(64),valid.sourceHashes[1]]},
  {...valid,origin:'charter-surname-bonus'},
  {...valid,parentIds:['human_parent_a','human_parent_a']}
 ]){
  A.throws(()=>H.inherit({kind:'human',source:forged,parents}),
   /Origin inheritance requires|Offspring cannot claim/);
 }
 A.throws(()=>H.inherit({kind:'human',source:valid,
  parents:[make('human_parent_a',150),parents[1]]}),
  /Invalid inherited/);
 A.throws(()=>H.inherit({kind:'human',source:valid,
  parents:[{...parents[0],bloodline:{id:'fake',strength:900,expression:'expressed'}},parents[1]]}),
  /real parental bloodline/);
}
{
 const beastParents=[make('beast_parent_a',93,'lineage:marshlight'),
  make('beast_parent_b',88,'lineage:marshlight')];
 const source={origin:'independent-mammal-birth-v1',beastId:'beast_123',
  parentIds:beastParents.map(p=>p.id),
  sourceHashes:beastParents.map(p=>p.originSourceHash)};
 const inherited=H.inherit({kind:'beast',source,parents:beastParents});
 A.equal(inherited.kind,'beast');
 A.equal(inherited.bloodline.id,'lineage:marshlight');
 A.ok(inherited.physical.resilience>60);
 A.ok(inherited.systemAptitude.origin>60);
 A.equal(Object.hasOwn(inherited,'earnedEvolutionStage'),false);
}
console.log('Shared human/beast Origin Pattern heredity inherits strong physical and power-system predispositions, variable bloodlines, never free mastery or invented genealogy');
