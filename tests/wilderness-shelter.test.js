'use strict';
// A claim of "verified shelter" is not a campsite. The GM/world must have
// separately observed and saved the actual local sleeping site beforehand.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),H=require('../rules/unified'),Turn=require('../scripts/chat-turn.js');
function fixture(seed=81721){
 const s=E.newGame({name:'Wilderness Rest Fixture',seed,path:'undecided'});
 s.world.location='fen';s.table||={};
 s.table.sleepShelters={dry_bank_01:{
  id:'dry_bank_01',name:'Reedland Surveyors dry campsite',
  location:'fen',knownToPlayer:true,safe:true,
  worldMinute:s.world.minutes,validUntilMinute:s.world.minutes+960,
  source:'Previously observed reedbank dry ground and signed field survey for this campsite'
 }};
 return s;
}
{
 const s=fixture(),initial=E.exportGame(s),rng=s.rngState;
 for(const params of [
  {hours:8,shelterVerified:true,shelterSource:'I assert this campsite is safe'},
  {hours:8,shelterId:'dry_bank_01',safe:true},
  {hours:8,shelterId:'missing_site_01'},
  {hours:1,shelterId:'dry_bank_01'}
 ])A.throws(()=>H.sleep(s,params),/saved world fact|source-recorded shelter|witnessed, truly sheltered|sleep hours must be an integer/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 const view=R.act(s,{system:'health',operation:'shelterStatus',params:{}});
 A.equal(view.settlementShelter,false);
 A.deepEqual(view.available.map(x=>x.shelterId),['dry_bank_01']);
}
{
 const s=fixture(81722);
 s.table.sleepShelters.dry_bank_01.safe=false;
 let before=E.exportGame(s);
 A.throws(()=>H.sleep(s,{hours:8,shelterId:'dry_bank_01'}),/witnessed, truly sheltered/);
 A.equal(E.exportGame(s),before);
 s.table.sleepShelters.dry_bank_01.safe=true;
 s.table.sleepShelters.dry_bank_01.location='ruins';
 before=E.exportGame(s);
 A.throws(()=>H.sleep(s,{hours:8,shelterId:'dry_bank_01'}),/witnessed, truly sheltered/);
 A.equal(E.exportGame(s),before);
 s.table.sleepShelters.dry_bank_01.location='fen';
 s.table.sleepShelters.dry_bank_01.worldMinute=s.world.minutes+5;
 A.throws(()=>H.sleep(s,{hours:8,shelterId:'dry_bank_01'}),/witnessed, truly sheltered/);
 s.table.sleepShelters.dry_bank_01.worldMinute=s.world.minutes;
 s.table.sleepShelters.dry_bank_01.validUntilMinute=s.world.minutes+470;
 A.throws(()=>H.sleep(s,{hours:8,shelterId:'dry_bank_01'}),/witnessed, truly sheltered/);
 s.table.sleepShelters.dry_bank_01.validUntilMinute=s.world.minutes+960;
 s.table.sleepShelters.dry_bank_01.knownToPlayer=false;
 A.deepEqual(H.shelterStatus(s).available,[]);
 A.throws(()=>H.sleep(s,{hours:8,shelterId:'dry_bank_01'}),/witnessed, truly sheltered/);
}
{
 const temp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-wilderness-sleep-'));
 try{
  const filename=Path.join(temp,'save.json'),s=fixture(81723);
  FS.writeFileSync(filename,E.exportGame(s)+'\n');
  const original=FS.readFileSync(filename,'utf8');
  const statusReq={id:'shelter_known_status_01',mode:'rule',system:'health',operation:'shelterStatus',params:{}};
  const view=Turn.execute(filename,statusReq);
  A.equal(view.applied,false);A.equal(view.output.rules.available[0].name,'Reedland Surveyors dry campsite');
  A.equal(FS.readFileSync(filename,'utf8'),original);
  A.throws(()=>Turn.execute(filename,{id:'shelter_spoof_00001',
   mode:'rule',system:'health',operation:'sleep',params:{hours:8,shelterVerified:true,
    shelterSource:'This statement creates a safe camp'}}),/saved world fact/);
  A.equal(FS.readFileSync(filename,'utf8'),original);
  const req={id:'shelter_verified_sleep_01',mode:'rule',system:'health',
   operation:'sleep',params:{hours:8,shelterId:'dry_bank_01'}};
  const rested=Turn.execute(filename,req);
  A.equal(rested.applied,true);
  A.equal(rested.output.rules.sleptHours,8);
  A.equal(Turn.execute(filename,req).duplicate,true);
  const loaded=E.importGame(FS.readFileSync(filename,'utf8'));
  A.equal(loaded.world.minutes,s.world.minutes+480);
  A.equal(loaded.table.sleepShelters.dry_bank_01.source,
   s.table.sleepShelters.dry_bank_01.source);
  const saved=FS.readFileSync(filename,'utf8');
  A.throws(()=>Turn.execute(filename,{...req,id:'shelter_second_spoof_01',
    params:{hours:8,shelterId:'other_bank_01'}}),/witnessed, truly sheltered/);
  A.equal(FS.readFileSync(filename,'utf8'),saved);
 }finally{FS.rmSync(temp,{recursive:true,force:true});}
}

// Master Prompt §§5, 44–45 and 49: a character can discover a genuine
// open-country campsite with one honest skill check and actual work, rather
// than needing a GM to insert a campsite into the saved state.
const findCamp=(s,p={})=>R.act(s,{system:'health',operation:'findShelter',params:p});
function campTraveller(seed=83100,loc='fen'){
 const s=E.newGame({name:'Unassisted Wilderness Rest',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel '+loc).ok,true);
 return s;
}
function campWithResult(wanted,lo=83100){
 for(let i=0;i<128;i++){
  // Consecutive low-valued xorshift seeds can share nearly identical
  // opening rolls. Spread the source seeds across the full 32-bit space
  // without selecting, changing or rerolling any particular game's die.
  const seed=(Math.imul((lo+i)>>>0,0x9e3779b1)>>>0)||1;
  const s=campTraveller(seed),result=findCamp(s);
  if(result.found===wanted)return {s,result,seed};
 }
 throw Error('At least one actual independently rolled '+wanted+
  ' camp-scouring result should exist among disposable seeds');
}
{
 const s=E.newGame({name:'Shelter Cannot Be Commanded',seed:83200});
 const initial=E.exportGame(s),rng=s.rngState;
 A.throws(()=>findCamp(s),/requires actual nearby open woodland/);
 A.throws(()=>findCamp(s,{dc:2,safe:true}),/cannot choose its safety/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 A.equal(H.shelterStatus(s).settlementShelter,true);
}
{
 const s=campTraveller(83201),initial=E.exportGame(s),rng=s.rngState;
 for(const p of [{dc:5},{shelterId:'fieldcamp_fen_1'},
  {safe:true},{name:'I choose invulnerability'}])
  A.throws(()=>findCamp(s,p),/cannot choose its safety/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 s.encounter={beastId:'unresolved'};
 A.throws(()=>findCamp(s),/present encounter or battle/);
 s.encounter=null;
 s.player.stamina=2;
 A.throws(()=>findCamp(s),/Insufficient real stamina/);
 s.player.stamina=E.importGame(initial).player.stamina;
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
}
{
 const {s,result}=campWithResult(false);
 A.equal(result.searched,true);A.equal(result.found,false);
 A.equal(result.shelterId,null);
 A.equal(result.elapsedMinutes,45);A.equal(result.staminaSpent,3);
 A.equal(H.shelterStatus(s).available.length,0);
 A.ok(result.roll>=1&&result.roll<=20);
 A.equal(s.table?.sleepShelters?.[result.shelterId],undefined);
 A.equal(s.player.inventory.healing_balm,1);
}
{
 const {s,result}=campWithResult(true,83300);
 const site=s.table.sleepShelters[result.shelterId],time=s.world.minutes,
  before=E.exportGame(s);
 A.equal(result.found,true);
 A.equal(site.origin,'actually-scouted-wilderness-rest-site-v1');
 A.equal(site.sourceEvent.details.shelterId,result.shelterId);
 A.equal(site.rollEvent.details.roll,result.roll);
 A.equal(site.safe,true);
 A.equal(site.location,'fen');
 A.ok(site.validUntilMinute>=time+12*60);
 A.equal(H.shelterStatus(s).available[0].shelterId,result.shelterId);
 const tired=s.player.stamina;
 const rested=H.sleep(s,{hours:8,shelterId:result.shelterId});
 A.equal(rested.sleptHours,8);
 A.equal(s.world.minutes,time+480);
 A.ok(s.player.stamina>=tired);
 A.equal(s.table.sleepShelters[result.shelterId].origin,site.origin);
 A.equal(E.importGame(E.exportGame(s)).table.sleepShelters[result.shelterId].rollHash,
  site.rollHash);
 A.notEqual(E.exportGame(s),before);
}
{
 const {s,result}=campWithResult(true,83400);
 const rec=s.table.sleepShelters[result.shelterId];
 rec.rollEvent.details.roll=rec.rollEvent.details.roll===20?19:20;
 const snapshot=E.exportGame(s),rng=s.rngState;
 A.deepEqual(H.shelterStatus(s).available,[]);
 A.throws(()=>H.sleep(s,{hours:8,shelterId:result.shelterId}),
  /original authentic successful terrain and Survival witnesses/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rng);
}
{
 const {s,result}=campWithResult(true,83500);
 const rec=s.table.sleepShelters[result.shelterId];
 delete rec.origin;
 const snapshot=E.exportGame(s),rng=s.rngState;
 A.deepEqual(H.shelterStatus(s).available,[]);
 A.throws(()=>H.sleep(s,{hours:8,shelterId:result.shelterId}),
  /original authentic successful terrain and Survival witnesses/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rng);
}
{
 // Begin on an actual late sixth workday. Do not assume any particular
 // dice result: select a successful real attempt from disposable seeds.
 let successful=null;
 for(let i=0;i<128&&!successful;i++){
  const seed=(Math.imul((83600+i)>>>0,0x9e3779b1)>>>0)||1;
  const s=campTraveller(seed),started=s.world.minutes;
  R.world.advance(s,5);
  const prior=s.world.minutes;E.advance(s,12*60);
  require('../rules/world').finalizeTime(s,prior);
  const camp=findCamp(s);
  if(camp.found)successful={s,camp,started};
 }
 A.ok(successful,'A real survival search must sometimes locate a night shelter');
 const {s,camp,started}=successful;
 const before=s.world.minutes,tickBefore=R.world.realm.peek(s).ticks.sixdays;
 A.equal(tickBefore,0);
 const restful=H.sleep(s,{hours:8,shelterId:camp.shelterId});
 A.equal(restful.sleptHours,8);
 A.equal(s.world.minutes,before+480);
 A.equal(R.world.realm.peek(s).ticks.sixdays,tickBefore+1,
  'Overnight recovery advances living institutions, ecology and real NPC sixdays');
 A.ok(s.table.calendar.sixdays.includes(6));
 A.ok(s.world.minutes>started);
}

{
 const {s,result,seed}=campWithResult(true,83700);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-scouted-shelter-'));
 try{
  const file=Path.join(dir,'save.json'),initial=E.exportGame(s);
  // Use a new unscouted character for the complete natural-language turn
  // and its replay; avoid writing fixtures into any live campaign.
  const fresh=campTraveller(seed);
  FS.writeFileSync(file,E.exportGame(fresh)+'\n');
  const req={id:'camp_find_0001',mode:'act',action:'look for a safe campsite'};
  const first=Turn.execute(file,req);
  A.equal(first.applied,true);A.equal(first.output.camp.found,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const postFind=FS.readFileSync(file,'utf8');
  const known=Turn.execute(file,{id:'camp_known_0001',mode:'act',action:'campsites'});
  A.equal(known.applied,false);
  A.equal(known.output.shelter.available.length,1);
  A.equal(FS.readFileSync(file,'utf8'),postFind);
  const sleep={id:'camp_sleep_0001',mode:'act',action:'sleep'};
  const r=Turn.execute(file,sleep);
  A.equal(r.applied,true);
  A.equal(r.output.health.sleptHours,8);
  A.equal(Turn.execute(file,sleep).duplicate,true);
  const loaded=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(loaded.world.minutes,fresh.world.minutes+45+480);
  A.equal(loaded.table.sleepShelters[first.output.camp.shelterId].safe,true);
  A.notEqual(E.exportGame(loaded),initial);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}


// The campsite reflects the *actual* local sky, not a permanent magical
// guarantee. An independently established later severe storm requires new
// assessment; ordinary changes do not fabricate a fresh hazard roll.
{
 const {s,result}=campWithResult(true,83800);
 A.equal(H.shelterStatus(s).available[0].shelterId,result.shelterId);
 const safeWeather=s.world.weather;
 s.world.weather='violent flood and gale with heavy downpour';
 const before=E.exportGame(s),rng=s.rngState;
 A.deepEqual(H.shelterStatus(s).available,[]);
 A.throws(()=>H.sleep(s,{hours:8,shelterId:result.shelterId}),
  /newly documented severe weather event/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 s.world.weather=safeWeather;
 A.equal(H.shelterStatus(s).available[0].shelterId,result.shelterId);
}

console.log('Verified wilderness overnight shelter evidence and no forged campsite tests passed');
