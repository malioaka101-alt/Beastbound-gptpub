'use strict';
// Actual generated wildlife, real local scenes, independent behavioural choices.
// Tests never read or modify a live campaign save.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 W=require('../rules/world'),World=require('../world/wild-lives'),
 Turn=require('../scripts/chat-turn.js');
const fresh=seed=>E.newGame({name:'Independent Wild Individual Test',seed,path:'undecided'});
const rule=(s,op,p={})=>R.act(s,{system:'world',operation:op,params:p});
function meet(seed,place='forest'){
 const s=fresh(seed);
 A.equal(E.dispatch(s,'travel '+place).ok,true);
 for(let i=0;i<45;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId],species=E.SPECIES[b.species];
  if(!s.encounter.threat&&species.intelligence!=='sapient'&&
    !(Number.isInteger(b.sapience)&&b.sapience>=3)&&
    !/terrified|panicked|hostile|fleeing/i.test(b.mood))return s;
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 throw Error('No genuinely generated peaceful wild animal');
}
{
 const s=fresh(811000),before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'watchWildBeast'),/truly witnessed, present, unowned/);
 A.deepEqual(rule(s,'wildBehaviourStatus'),
  {activeEncounter:false,visibleBehaviour:null,
  note:'A currently present witnessed animal is required; remote animal locations and hidden routines are not displayed.'});
 for(const p of [{beastId:'phantom'},{forceFriendly:true},{outcome:'automatic ally'}])
  A.throws(()=>rule(s,'watchWildBeast',p),/independently determined/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=meet(811001),id=s.encounter.beastId,b=s.beasts[id];
 const original=s.log.find(x=>x.type==='encounter'&&x.details?.beastId===id);
 A.ok(original);A.equal(original.details.origin,'engine-local-wildlife-encounter');
 A.equal(original.details.distanceMetres,s.encounter.distanceMetres);
 const before=E.exportGame(s),read=rule(s,'wildBehaviourStatus');
 A.equal(read.activeEncounter,true);A.equal(read.beastId,id);
 A.equal(read.lastObservedActivity,null);
 A.equal(read.knownDistanceMetres,s.encounter.distanceMetres);
 A.equal(E.exportGame(s),before);
 const rng=s.rngState,minutes=s.world.minutes,coins=s.player.coins;
 const result=rule(s,'watchWildBeast');
 A.equal(result.watched,true);A.equal(result.beastId,id);
 A.equal(result.minutes,12);A.equal(result.noExtraPlayerRoll,true);
 A.ok(['withdraw','forage','rest','reposition','survey'].includes(result.observedAction));
 A.equal(s.world.minutes,minutes+12);
 A.equal(s.rngState,rng);
 A.equal(s.player.coins,coins);
 A.equal(b.owner,null);A.equal(b.consent,false);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.table?.bondRecords?.[id],undefined);
 A.equal(b.individualGrade,s.beasts[id].individualGrade);
 A.equal(b.evolutionStage,'Base');
 A.equal(b.individualLife.source.origin,'engine-local-wildlife-encounter');
 A.equal(b.individualLife.source.beastId,id);
 A.equal(b.individualLife.sourceHash,World._debug.hash(b.individualLife.source));
 A.equal(b.individualLife.witnessed.length,1);
 A.equal(b.individualLife.history.length,1);
 A.equal(b.location,'forest');
 if(result.encounterContinues){
  A.equal(rule(s,'wildBehaviourStatus').lastObservedActivity.description,result.message);
  const after=E.exportGame(s),nextRng=s.rngState;
  A.throws(()=>rule(s,'watchWildBeast'),/real interval/);
  A.equal(E.exportGame(s),after);A.equal(s.rngState,nextRng);
 }else{
  A.equal(s.encounter,null);
  A.equal(b.away,true);
  A.equal(rule(s,'wildBehaviourStatus').activeEncounter,false);
 }
}
{
 const s=meet(811002),id=s.encounter.beastId;
 s.encounter.distanceMetres=200;
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'watchWildBeast'),/distance must match the original/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=meet(811003),id=s.encounter.beastId,b=s.beasts[id];
 s.encounter.threat=true;
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'watchWildBeast'),/dangerous or fleeing/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 s.encounter.threat=false;
 b.owner='outsider';
 const restricted=E.exportGame(s);
 A.throws(()=>rule(s,'watchWildBeast'),/unowned local animal/);
 A.equal(E.exportGame(s),restricted);
}
{
 const s=meet(811004),id=s.encounter.beastId,b=s.beasts[id];
 const watched=rule(s,'watchWildBeast');
 if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
 const initial=E.exportGame(s),clone=E.importGame(initial);
 W.advance(s,30);W.advance(clone,30);
 A.deepEqual(s.beasts[id],clone.beasts[id]);
 const life=s.beasts[id].individualLife;
 A.ok(life.history.some(x=>x.type==='offscreen-sixday'));
 A.ok(life.history.filter(x=>x.type==='offscreen-sixday').length>=4);
 A.equal(s.beasts[id].away,true);
 A.equal(life.source.beastId,id);
 A.equal(s.player.partnerIds.length,0);
 A.equal(rule(s,'wildBehaviourStatus').activeEncounter,false);
 A.equal(rule(s,'wildBehaviourStatus').visibleBehaviour,null);
 A.ok(watched.noGuaranteedRelationship);
 for(const e of life.history.filter(x=>x.type==='offscreen-sixday')){
  A.ok(['ordinary-territorial-life','independently-foraged','sheltered-and-rested',
   'relocated-to-adjacent-compatible-habitat','roamed-through-existing-habitat-link']
   .includes(e.action));
 }
}
{
 // Genuine habitat stress creates opportunities for movement, not magical
 // transfer to any biome or compulsory extinction. A real recorded individual
 // can decline interaction and later change its home while the player is away.
 let observedStress=false,observedMovement=false;
 for(let seed=811101;seed<811140;seed++){
  const s=meet(seed),id=s.encounter.beastId,b=s.beasts[id];
  const world=R.realm.ensure(s);
  const eco=world.ecosystems.copperwood;
  eco.forage=8;eco.water=10;eco.pressure=98;eco.quality=12;
  const response=rule(s,'watchWildBeast');
  if(response.observedAction==='withdraw')observedStress=true;
  if(s.encounter)E.dispatch(s,'leave');
  W.advance(s,30);
  const moves=b.individualLife.history.filter(x=>
   x.type==='offscreen-sixday'&&/relocated|roamed/.test(x.action));
  if(moves.length)observedMovement=true;
  const available=E.LOCATIONS[b.location];
  A.ok(available?.spawns.includes(b.species));
  A.ok(b.condition>=0&&b.condition<=100);
  A.equal(s.player.partnerIds.length,0);
  A.equal(b.owner,null);
  if(observedStress&&observedMovement)break;
 }
 A.equal(observedStress,true,'Real habitat pressure can make animals depart');
 A.equal(observedMovement,true,'A tracked animal can roam on an actual connected, species-compatible habitat route');
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-wild-lives-'));
 try{
  const s=meet(811205),file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const read={id:'wildlife_status_0001',mode:'rule',system:'world',
   operation:'wildBehaviourStatus',params:{}};
  const view=Turn.execute(file,read);
  A.equal(view.applied,false);A.equal(view.output.rules.activeEncounter,true);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const bad={id:'wildlife_fake_0001',mode:'rule',system:'world',
   operation:'watchWildBeast',params:{chooseMood:'friendly'}};
  A.throws(()=>Turn.execute(file,bad),/independently determined/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const req={id:'wildlife_watch_0001',mode:'rule',system:'world',
   operation:'watchWildBeast',params:{}};
  const watched=Turn.execute(file,req);
  A.equal(watched.applied,true);
  A.equal(watched.output.rules.watched,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const after=FS.readFileSync(file,'utf8'),next=E.importGame(after);
  A.equal(next.beasts[s.encounter.beastId].individualLife.witnessed.length,1);
  A.equal(next.world.minutes,s.world.minutes+12);
  A.equal(next.player.partnerIds.length,0);
  A.equal(next.table?.bondRecords?.[s.encounter.beastId],undefined);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}

// Genuine threatening wildlife must permit a cautious nonverbal safety choice,
// not require speech, a successful identification check, or a forced bond.
function meetThreat(seed){
 const s=fresh(seed);
 A.equal(E.dispatch(s,'travel forest').ok,true);
 for(let i=0;i<65;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const beast=s.beasts[s.encounter.beastId];
  if(s.encounter.threat&&!(Number.isInteger(beast.sapience)&&beast.sapience>=3)&&
     E.SPECIES[beast.species].intelligence!=='sapient')return s;
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 throw Error('Expected at least one genuinely threatening non-sapient wildlife encounter');
}
{
 const s=meetThreat(811350),id=s.encounter.beastId,b=s.beasts[id];
 const view=rule(s,'wildBehaviourStatus');
 A.equal(view.activeEncounter,true);
 A.equal(view.lastSpaceGivingResponse,null);
 const before=E.exportGame(s),rng=s.rngState;
 for(const invalid of [{beastId:id},{forceDepart:true},{roll:20},{response:'eased'}]){
  A.throws(()=>rule(s,'giveWildSpace',invalid),/independently determined/);
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
 A.throws(()=>rule(s,'watchWildBeast'),/dangerous or fleeing/);
 const minute=s.world.minutes,coins=s.player.coins;
 const x=rule(s,'giveWildSpace');
 A.equal(x.gesture,'give_space');A.equal(x.minutes,2);
 A.ok(['hold','eased','withdraw'].includes(x.response));
 A.equal(s.world.minutes,minute+2);A.equal(s.player.coins,coins);
 A.equal(s.player.partnerIds.length,0);A.equal(b.consent,false);
 A.equal(s.table?.bondRecords?.[id],undefined);
 A.equal(s.beasts[id].evolutionStage,'Base');
 A.equal(b.individualLife.history.at(-1).type,'personally-witnessed-space-giving');
 if(x.response==='withdraw'){
  A.equal(s.encounter,null);A.equal(b.away,true);
 }else{
  A.equal(s.encounter.beastId,id);
  A.equal(s.encounter.threat,x.response!=='eased');
  A.equal(rule(s,'wildBehaviourStatus').lastSpaceGivingResponse,x.response);
  const animalRng=b.individualLife.rngState,stamina=s.player.stamina;
  const y=rule(s,'giveWildSpace');
  A.equal(y.response,'unchanged');A.equal(y.firstResponse,false);
  A.equal(b.individualLife.rngState,animalRng);
  A.equal(s.player.stamina,stamina);
  A.equal(s.player.partnerIds.length,0);
 }
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-nonverbal-wild-'));
 try{
  const s=meetThreat(811351),file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const raw=FS.readFileSync(file,'utf8');
  const bad={id:'wild_signal_invalid_001',mode:'rule',
   system:'world',operation:'giveWildSpace',params:{depart:true}};
  A.throws(()=>Turn.execute(file,bad),/independently determined/);
  A.equal(FS.readFileSync(file,'utf8'),raw);
  const request={id:'wild_signal_actual_001',mode:'act',action:'give beast space'};
  const out=Turn.execute(file,request);
  A.equal(out.applied,true);
  A.equal(out.output.wildlife.gesture,'give_space');
  A.equal(Turn.execute(file,request).duplicate,true);
  const saved=FS.readFileSync(file,'utf8'),next=E.importGame(saved);
  A.equal(next.world.minutes,s.world.minutes+2);
  A.equal(next.player.partnerIds.length,0);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{force:true,recursive:true});}
}

console.log('Individual wild beasts autonomously forage, rest, withdraw and roam under actual habitat conditions; visible encounters are noncoercive, source-backed and replay-safe');
