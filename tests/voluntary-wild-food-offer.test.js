'use strict';
// Real stocked food + authentic wild encounter + independent animal reaction.
// Never touch an active campaign; all states and files below are disposable.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-free-wild-food-'));
const file=Path.join(dir,'wild.json');
const write=s=>FS.writeFileSync(file,E.exportGame(s)+'\n');
const read=()=>FS.readFileSync(file,'utf8');
const load=()=>E.importGame(read());
const act=(id,action)=>Turn.execute(file,{id,mode:'act',action});
function tradeAndEncounter(seed){
 const s=E.newGame({seed,name:'Voluntary Wildlife Fixture',path:'undecided'});
 const quoted=R.act(s,{system:'gear',operation:'inquire',params:{npcId:'otto'}});
 R.act(s,{system:'gear',operation:'purchase',params:{offerId:quoted.offerId}});
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'explore').ok,true);
 return s;
}
function realFenFox(response){
 for(let seed=73101;seed<73501;seed++){
  const s=tradeAndEncounter(seed),id=s.encounter?.beastId,b=s.beasts[id];
  if(b?.species!=='fenfox'||s.encounter.threat===true)continue;
  const result=R.act(s,{system:'world',operation:'offerWildFood',
    params:{item:'clean_rations'}});
  if(result.response===response)return seed;
 }
 throw Error('No independently generated Lanternfen Fox chose '+response+' in the tested seeded range');
}
function authenticHerbivore(){
 for(let seed=74000;seed<74500;seed++){
  const s=E.newGame({seed,name:'Source-Recorded Grazer Feeding Fixture'});
  A.equal(E.dispatch(s,'travel fen').ok,true);
  s.player.attributes.wis=30;s.player.skills.survival.rank=5;
  const prepared=R.act(s,{system:'world',operation:'habitatSurvey',params:{}});
  const chk=R.act(s,{system:'core',operation:'check',
   params:{checkId:prepared.checkId}}).check;
  A.equal(chk.success,true);
  R.act(s,{system:'world',operation:'harvestReeds',params:{checkId:prepared.checkId}});
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter?.beastId];
  if(b?.species==='mirehorn'&&s.encounter.threat!==true)return s;
 }
 throw Error('No actually encountered Mirehorn Grazer in the seeded range');
}
try{
 const empty=E.newGame({seed:73100,name:'No Beasts Summoned'});
 write(empty);const untouched=read(),rng=load().rngState;
 A.throws(()=>act('wild_no_encounter_0001','offer food'),
  /truly witnessed, present, unowned local animal/);
 A.equal(read(),untouched);A.equal(load().rngState,rng);
 A.throws(()=>R.act(load(),{system:'world',operation:'offerWildFood',
   params:{item:'clean_rations',accept:true,trust:100}}),
  /exactly one genuinely owned food item/);

 const yes=realFenFox('eaten');write(E.newGame({seed:yes,name:'Voluntary Wildlife Fixture',path:'undecided'}));
 const quote=act('offer_meal_source_quote_001','ask orrin about supplies');
 A.equal(quote.output.gear.quoted,true);
 const bought=act('offer_meal_source_buy_0001','buy clean rations');
 A.equal(bought.output.gear.purchased,true);
 A.equal(bought.output.gear.paidScales,quote.output.gear.priceScales);
 A.equal(act('offer_meal_walk_fen_0001','travel fen').ok,true);
 const explored=act('offer_meal_real_enc_0001','explore');
 A.equal(explored.ok,true);
 let before=load(),beast=before.beasts[before.encounter.beastId];
 A.equal(beast.species,'fenfox');
 A.equal(before.encounter.threat,false);
 const startFood=before.player.inventory.clean_rations,
  originalTrust=beast.trust,originalRespect=beast.respect,
  playerRng=before.rngState,initialHunger=beast.needs.hunger;
 const first=act('offer_meal_real_choice_001','offer clean rations to beast');
 A.equal(first.applied,true);
 A.equal(first.output.wildlife.response,'eaten');
 A.equal(first.output.wildlife.foodConsumed,1);
 A.equal(first.output.wildlife.noBondAward,true);
 const after=load(),fox=after.beasts[beast.id];
 A.equal(after.player.inventory.clean_rations,startFood-1);
 A.equal(fox.needs.hunger,Math.max(0,initialHunger-20));
 A.equal(fox.trust,originalTrust);A.equal(fox.respect,originalRespect);
 A.equal(after.player.partnerIds.length,0);
 A.equal(after.table?.bondRecords?.[beast.id],undefined);
 A.equal(after.rngState,playerRng);
 A.equal(after.world.minutes,before.world.minutes+8);
 A.equal(fox.individualLife.witnessed.at(-1).foodConsumed,1);
 A.equal(fox.individualLife.witnessed.at(-1).noAutomaticTrust,true);
 const afterSaved=read(),afterWildRng=fox.individualLife.rngState;
 const repeated=act('offer_meal_real_choice_001','offer clean rations to beast');
 A.equal(repeated.duplicate,true);A.equal(repeated.recovered,true);
 A.deepEqual(repeated.output,first.output);
 A.equal(read(),afterSaved);
 A.equal(load().beasts[beast.id].individualLife.rngState,afterWildRng);

 // An ordinary animal may also decline an eligible item outright. Its
 // independent decision is not a Charisma check chosen by the player.
 const no=realFenFox('ignored');
 write(E.newGame({seed:no,name:'Voluntary Wildlife Fixture',path:'undecided'}));
 act('decline_quoted_00001','ask orrin about supplies');
 act('decline_bought_00001','buy clean rations');
 act('decline_walk_00001','travel fen');
 act('decline_meet_00001','explore');
 before=load();beast=before.beasts[before.encounter.beastId];
 const declined=act('decline_food_00001','offer food');
 A.equal(declined.output.wildlife.response,'ignored');
 A.equal(declined.output.wildlife.accepted,false);
 A.equal(declined.output.wildlife.foodConsumed,0);
 A.equal(load().player.inventory.clean_rations,before.player.inventory.clean_rations);
 A.equal(load().beasts[beast.id].trust,beast.trust);
 const unchanged=load(),wildRng=unchanged.beasts[beast.id].individualLife.rngState;
 const declinedAgain=act('decline_food_second_001','offer rations');
 A.equal(declinedAgain.output.wildlife.repeated,true);
 A.equal(declinedAgain.output.wildlife.noExtraDecision,true);
 A.equal(load().world.minutes,unchanged.world.minutes);
 A.equal(load().beasts[beast.id].individualLife.rngState,wildRng);
 A.equal(load().player.inventory.clean_rations,unchanged.player.inventory.clean_rations);

 // The second already authored food is actual common fen reeds, eaten only
 // by a genuinely encountered herbivore. Source-traced harvesting first.
 const grazer=authenticHerbivore();
 write(grazer);const grazerStart=read();
 A.throws(()=>act('grazer_wrong_food_001','offer rations'),
  /no source-established safe wild-food use/);
 A.throws(()=>R.act(load(),{system:'world',operation:'offerWildFood',
  params:{item:'legendary_elixir'}}),
  /no source-established safe wild-food use/);
 A.equal(read(),grazerStart);
 const offered=act('grazer_real_reeds_0001','offer marsh reeds to beast');
 A.equal(offered.applied,true);
 A.ok(['eaten','ignored','departed'].includes(offered.output.wildlife.response));
 A.equal(offered.output.wildlife.noBondAward,true);
 const fed=load();
 A.equal(fed.player.inventory.marsh_reed||0,
  grazer.player.inventory.marsh_reed-(offered.output.wildlife.accepted?1:0));
 A.equal(fed.rngState,grazer.rngState);
 A.equal(fed.player.partnerIds.length,0);
 A.equal(fed.table?.bondRecords?.[grazer.encounter.beastId],undefined);

 // A false item or a missing bag item never spends world time or RNG.
 const bad=read();
 const absent=load();absent.player.inventory.marsh_reed=0;write(absent);
 const noReeds=read();const noRng=load().rngState;
 A.throws(()=>act('offer_absent_reeds_001','offer marsh reeds'),
  /actually carried|truly witnessed/);
 A.equal(read(),noReeds);A.equal(load().rngState,noRng);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Real stock and authentic diet feed independent wild animals without compelled affection or rerolls');
