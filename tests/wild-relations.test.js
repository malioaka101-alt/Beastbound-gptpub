'use strict';
// Disposable game fixtures only. Real autonomous world ticks, no live saves.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 Social=require('../world/wild-relations');
const rule=(s,op,p={})=>R.act(s,{system:'world',operation:op,params:p});
function witnessed(seed,desired=['fenfox','fenfox']){
 const s=E.newGame({name:'Witnessed Wildlife Neighbours',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const ids=[];
 for(let k=0;k<150 && ids.length<desired.length;k++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const id=s.encounter.beastId,b=s.beasts[id];
  const species=E.SPECIES[b.species];
  if(b.species===desired[ids.length]&&!s.encounter.threat&&
    species.intelligence!=='sapient'&&
    !/fleeing|terrified|hostile|panicked/i.test(b.mood)){
   const result=rule(s,'watchWildBeast');
   A.equal(result.watched,true);
   ids.push(id);
  }
  if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.equal(ids.length,desired.length,'fixture found genuine independently generated species matches');
 return {s,ids,animals:ids.map(id=>s.beasts[id])};
}
{
 const x=E.newGame({name:'Unwitnessed Ecology',seed:818100}),
  original=E.exportGame(x),rng=x.rngState;
 A.deepEqual(Social.sixday(x,6),{meetings:0});
 A.equal(E.exportGame(x),original);
 A.equal(x.rngState,rng);
 A.throws(()=>Social.sixday(x,6.5),/real completed sixday/);
}
{
 const {s,ids,animals}=witnessed(818101,['fenfox','stonehare']);
 const initial=Object.keys(s.beasts).length;
 W.advance(s,30);
 const ledger=s.table.realm.wildRelations||{};
 A.equal(Object.keys(ledger).length,0,
  'different species must not inherit automatic social compatibility');
 for(const b of animals){
  A.ok(b.individualLife.daysSinceFirstWitness>=0);
  A.equal(b.age,'young adult','an unknown birth year must not be invented');
  A.equal(b.sex,'unrecorded','reproductive roles cannot be guessed');
 }
 A.equal(Object.keys(s.beasts).length,initial,
  'social proximity does not manufacture offspring');
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.table?.bondRecords?.[ids[0]],undefined);
}
{
 let example=null,sawContact=false,sawIndependentResult=false;
 for(let seed=818200;seed<818222;seed++){
  const x=witnessed(seed),{s,ids,animals}=x;
  const initialCount=Object.keys(s.beasts).length,originalRng=s.rngState;
  const before=E.exportGame(s),copy=E.importGame(before);
  W.advance(s,30);W.advance(copy,30);
  A.deepEqual(s.table.realm.wildRelations||{},copy.table.realm.wildRelations||{},
   'same world and witnessed lives produce the same independent histories');
  A.deepEqual(animals.map(b=>b.individualLife),
   ids.map(id=>copy.beasts[id].individualLife),
   'individual social memories and world time are persistently replayable');
  A.equal(Object.keys(s.beasts).length,initialCount,
   'social contacts never silently create infants or family trees');
  A.equal(s.player.partnerIds.length,0);
  A.equal(s.table?.bondRecords?.[ids[0]],undefined);
  A.equal(s.table?.bondRecords?.[ids[1]],undefined);
  A.ok(animals.every(b=>b.age==='young adult'&&b.sex==='unrecorded'));
  A.ok(animals.every(b=>b.individualLife.daysSinceFirstWitness>=0));
  const links=Object.values(s.table.realm.wildRelations||{});
  if(!links.length)continue;
  example=x;sawContact=true;
  for(const link of links){
   A.equal(link.rule,Social.RULE);
   A.equal(link.beastIds.length,2);
   A.deepEqual(link.beastIds,ids.slice().sort());
   A.ok(link.meetings>=1);
   A.equal(link.history.length<=18,true);
   A.ok(link.history.every(h=>h.observed===false&&h.noBirth===true&&
    h.noAssumedKinship===true));
   A.ok(['coexistence','avoidance','resource-competition','parallel-foraging']
    .includes(link.relation));
   const ordered=link.beastIds.map(id=>s.beasts[id]);
   Social._debug.validatePair(s.table.realm,link,...ordered);
   sawIndependentResult=true;
  }
  const publicJournal=JSON.stringify(rule(s,'wildMemoriesStatus'));
  A.ok(!publicJournal.includes('wildRelations'));
  A.ok(!publicJournal.includes('resource-competition'));
  A.ok(!publicJournal.includes('parallel-foraging'));
  A.ok(!publicJournal.includes('coexistence'));
  A.equal(s.rngState,copy.rngState,'same external time, same legacy RNG');
  break;
 }
 A.equal(sawContact,true,'genuine same-species neighbours sometimes meet');
 A.equal(sawIndependentResult,true);
 A.ok(example);
}
{
 const {s,ids,animals}=witnessed(818303);
 const w=R.realm.ensure(s),day=Math.floor(s.world.minutes/1440)+1,
  first=animals[0],second=animals[1],rng=s.rngState;
 const key=Social._debug.pairKey(first,second);
 // Prove a ledger must be tied to both original individuals, not an
 // editable claim of kinship supplied after the fact.
 const record={rule:Social.RULE,key,beastIds:ids.slice().sort(),
  sourceHashes:['f'.repeat(64),'e'.repeat(64)],
  firstDay:day,lastDay:day,relation:'coexistence',meetings:1,history:[]};
 A.throws(()=>Social._debug.validatePair(w,record,
   ...[first,second].sort((a,b)=>a.id.localeCompare(b.id))),
  /Unverified independent wildlife relationship record/);
 A.equal(s.rngState,rng);
}
{
 // Species, location, sapience and current player contact all affect whether
 // off-screen association is even eligible.
 const {s,ids,animals}=witnessed(818304);
 const [a,b]=animals;
 A.equal(Social._debug.alive(s,a),false,'an animal must be away from the current scene');
 a.away=true;b.away=true;
 A.equal(Social._debug.alive(s,a),true);
 const oldLoc=b.location;b.location='hills';
 A.equal(Social._debug.alive(s,b),false,
  'an incompatible habitat cannot host this species');
 b.location=oldLoc;b.owner='keeper';
 A.equal(Social._debug.alive(s,b),false,'owned animals are not forcibly socially assigned');
 b.owner=null;b.sapience=3;
 A.equal(Social._debug.alive(s,b),false,'sapient beast people require their own social simulation');
 A.equal(s.player.partnerIds.length,0);
 A.equal(ids.length,2);
}
console.log('Real wild neighbours form independent, private, dated ecological relationships while preserving individuality, unknown ages, separate power systems and no invented births');
