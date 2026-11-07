'use strict';
// Reallaboratory craft tests run only on disposable fresh engine states/saves.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),
 Crypto=require('node:crypto');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
const craft=(s,operation,params={})=>R.act(s,{system:'craft',operation,params});
function workbench(seed=66810){
 const s=E.newGame({name:'Real Field Poultice Craft Test',seed,background:'fieldworker'});
 A.equal(E.dispatch(s,'travel academy').ok,true);
 A.equal(s.player.inventory.marsh_reed,2);
 return s;
}
{
 const s=E.newGame({name:'No Imaginary Craft',seed:66811});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const raw=E.exportGame(s),rng=s.rngState;
 A.throws(()=>craft(s,'fieldPoultice',{dc:1,outcome:'instant legendary serum'}),/accepts no chosen/);
 A.throws(()=>craft(s,'fieldPoultice'),/real clean infirmary or academy clinic/);
 A.equal(E.exportGame(s),raw);A.equal(s.rngState,rng);
 const known=craft(s,'status');
 A.equal(known.workspaceAvailable,false);
 A.equal(known.supplies.marsh_reed,0);
 A.equal(E.exportGame(s),raw);
}
{
 const s=workbench(),initial=E.exportGame(s),rng=s.rngState;
 A.deepEqual(craft(s,'status').requirements,{marsh_reed:2,clean_rations:1});
 A.equal(craft(s,'status').workspaceAvailable,true);
 s.player.inventory.marsh_reed=1;
 const shortage=E.exportGame(s);
 A.throws(()=>craft(s,'fieldPoultice'),/requires 2 Marsh Reed and 1 Clean Rations/);
 A.equal(E.exportGame(s),shortage);A.equal(s.rngState,rng);
 s.player.inventory.marsh_reed=2;
 s.encounter={beastId:'wild'};
 A.throws(()=>craft(s,'fieldPoultice'),/active danger/);
 s.encounter=null;
 const c=E.exportGame(s);
 A.equal(c,initial);
 A.equal(s.rngState,rng);
}
{
 let win=false,loss=false;
 // Spread deterministic fixture seeds across the full 32-bit RNG space;
 // sequential small seeds cluster similar opening dice in the xorshift stream.
 for(let i=1;i<=100;i++){
  const seed=(i*2654435761)>>>0;
  const s=workbench(seed),before=s.world.minutes,sta=s.player.stamina,
    materials={...s.player.inventory},oldPP=s.player.skills.crafting.xp;
  const outcome=craft(s,'fieldPoultice');
  A.equal(outcome.recipe,'field_poultice');
  A.equal(outcome.worksite,'Lumenfall Annex');
  A.equal(outcome.check.dc,12);
  A.equal(outcome.check.success,outcome.succeeded);
  A.equal(outcome.noExtraRoll,true);
  A.equal(outcome.elapsedMinutes,70);
  A.equal(outcome.staminaSpent,3);
  A.equal(s.world.minutes,before+70);
  A.equal(s.player.stamina,sta-3);
  A.equal(s.player.inventory.marsh_reed||0,materials.marsh_reed-2);
  A.equal(s.player.inventory.clean_rations||0,materials.clean_rations-1);
  A.equal(s.player.inventory.healing_balm,materials.healing_balm+(outcome.succeeded?1:0));
  A.equal(s.player.skills.crafting.xp,oldPP+(outcome.succeeded?2:1));
  const entry=Object.values(s.table.fieldCraftDaily)[0];
  A.equal(entry.success,outcome.succeeded);
  A.equal(entry.source.includes('Original fixed field_poultice recipe'),true);
  A.equal(digest(s.log[entry.witnessIndex]),entry.witnessHash);
  A.equal(digest(s.log[entry.rollIndex]),entry.rollHash);
  A.equal(s.log[entry.rollIndex].type,'roll');
  A.equal(craft(s,'status').preparedToday,true);
  const done=E.exportGame(s),rng=s.rngState;
  A.throws(()=>craft(s,'fieldPoultice'),/requires 2 Marsh Reed and 1 Clean Rations/);
  A.equal(E.exportGame(s),done);A.equal(s.rngState,rng);
  if(outcome.succeeded)win=true;else loss=true;
  if(win&&loss)break;
 }
 A.equal(win,true);A.equal(loss,true);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-real-poultice-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(workbench(66812))+'\n');
  const prior=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'invalid_recipe_0001',mode:'act',
   action:'craft crystal dragon serum'}),/Unsupported crafting recipe/);
  A.equal(FS.readFileSync(file,'utf8'),prior);
  A.throws(()=>Turn.execute(file,{id:'craft_fake_0001',mode:'rule',system:'craft',
   operation:'fieldPoultice',params:{quantity:100,free:true}}),/accepts no chosen/);
  A.equal(FS.readFileSync(file,'utf8'),prior);
  const first={id:'craft_real_00001',mode:'act',action:'CRAFT   field poultice'};
  const made=Turn.execute(file,first);
  A.equal(made.applied,true);
  A.equal(made.output.craft.recipe,'field_poultice');
  A.equal(Turn.execute(file,first).duplicate,true);
  const saved=FS.readFileSync(file,'utf8'),state=E.importGame(saved);
  A.equal(Object.values(state.table.fieldCraftDaily).length,1);
  A.equal(state.player.inventory.marsh_reed||0,0);
  const view=Turn.execute(file,{id:'craft_view_00001',mode:'rule',
   system:'craft',operation:'status',params:{}});
  A.equal(view.applied,false);
  A.equal(view.output.rules.workspaceAvailable,true);
  A.equal(view.output.rules.preparedToday,true);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  A.throws(()=>Turn.execute(file,{...first,id:'craft_repeat_00001'}),
   /requires 2 Marsh Reed and 1 Clean Rations/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}

// Multiple *real* attempts may be made when a practitioner has actually
// sufficient consumable materials, stamina and an available clean bench.
// No arbitrary daily cooldown, guaranteed result, teacher or rank gate.
{
 const s=workbench(66820),start=s.world.minutes,stamina=s.player.stamina,
  day=String(Math.floor(start/1440));
 // Extra consumable stocks are an explicit synthetic test setup; actual
 // campaigns must obtain supplies from their own existing sources.
 s.player.inventory.marsh_reed=4;
 s.player.inventory.clean_rations=2;
 const first=craft(s,'fieldPoultice');
 A.equal(first.attemptNumberToday,1);
 A.equal(craft(s,'status').attemptsToday,1);
 const legacyFirst=JSON.stringify(s.table.fieldCraftDaily[day]);
 const second=craft(s,'fieldPoultice');
 A.equal(second.attemptNumberToday,2);
 A.equal(craft(s,'status').preparedToday,true);
 A.equal(craft(s,'status').attemptsToday,2);
 A.equal(craft(s,'status').dailyLimit,false);
 A.equal(s.world.minutes,start+140);
 A.equal(s.player.stamina,stamina-6);
 A.equal(s.table.fieldCraftAttempts.length,2);
 A.equal(JSON.stringify(s.table.fieldCraftDaily[day]),legacyFirst,
  'A later genuinely paid attempt must not erase the original first entry');
 A.ok(s.table.fieldCraftAttempts.every((x,i)=>x.attemptNumberToday===i+1));
 A.ok(s.table.fieldCraftAttempts.every(x=>x.originalWorkbench&&
  digest(x.originalWorkbench)===x.witnessHash&&
  x.originalRoll&&digest(x.originalRoll)===x.rollHash));
 A.notEqual(s.table.fieldCraftAttempts[0].rollHash,s.table.fieldCraftAttempts[1].rollHash);
 A.equal(s.player.inventory.marsh_reed||0,0);
 A.equal(s.player.inventory.clean_rations||0,0);
 A.equal(s.player.inventory.healing_balm,1+
  (first.succeeded?1:0)+(second.succeeded?1:0));
 const final=E.exportGame(s),rng=s.rngState;
 A.throws(()=>craft(s,'fieldPoultice'),/requires 2 Marsh Reed and 1 Clean Rations/);
 A.equal(E.exportGame(s),final);A.equal(s.rngState,rng);
 for(let i=0;i<103;i++)R.core.event(s,'story','Ordinary days of unrelated narration '+i);
 A.ok(s.table.fieldCraftAttempts.every(x=>digest(x.originalRoll)===x.rollHash));
 A.ok(s.table.fieldCraftAttempts.every(x=>digest(x.originalWorkbench)===x.witnessHash));
}
{
 const s=workbench(66821);
 const day=String(Math.floor(s.world.minutes/1440));
 const first=craft(s,'fieldPoultice');
 const originalFirst=JSON.stringify(s.table.fieldCraftDaily[day]);
 delete s.table.fieldCraftAttempts; // Historical checkpoint schema.
 s.player.inventory.marsh_reed=2;s.player.inventory.clean_rations=1;
 const second=craft(s,'fieldPoultice');
 A.equal(second.attemptNumberToday,2);
 A.equal(s.table.fieldCraftAttempts.length,1);
 A.equal(JSON.stringify(s.table.fieldCraftDaily[day]),originalFirst);
 A.equal(E.importGame(E.exportGame(s)).table.fieldCraftAttempts[0].attemptNumberToday,2);
}
{
 const s=workbench(66822),start=E.exportGame(s),rng=s.rngState;
 s.player.inventory.healing_balm=100000;
 const maxed=E.exportGame(s);
 A.throws(()=>craft(s,'fieldPoultice'),/inventory capacity reached/);
 A.equal(E.exportGame(s),maxed);
 A.equal(s.rngState,rng);
 A.notEqual(start,maxed);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-independent-repeat-craft-'));
 try{
  const file=Path.join(dir,'save.json'),s=workbench(66823);
  s.player.inventory.marsh_reed=4;s.player.inventory.clean_rations=2;
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const first={id:'independent_poultice_00001',mode:'act',action:'craft field poultice'};
  const a=Turn.execute(file,first);A.equal(a.applied,true);
  A.equal(a.output.craft.attemptNumberToday,1);
  A.equal(Turn.execute(file,first).duplicate,true);
  const second={id:'independent_poultice_00002',mode:'act',action:'craft field poultice'};
  const b=Turn.execute(file,second);A.equal(b.applied,true);
  A.equal(b.output.craft.attemptNumberToday,2);
  A.equal(Turn.execute(file,second).duplicate,true);
  const saved=FS.readFileSync(file,'utf8'),loaded=E.importGame(saved);
  A.equal(loaded.table.fieldCraftAttempts.length,2);
  A.equal(loaded.player.inventory.marsh_reed||0,0);
  A.equal(loaded.world.minutes,s.world.minutes+140);
  A.equal(loaded.player.inventory.healing_balm,1+
   (a.output.craft.succeeded?1:0)+(b.output.craft.succeeded?1:0));
  A.notEqual(before,saved);
  A.throws(()=>Turn.execute(file,{...first,id:'independent_poultice_00003'}),
   /requires 2 Marsh Reed and 1 Clean Rations/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}


{
 // Both authored clean medical facilities use the SAME genuine recipe and
 // physical work engine. A town infirmary is not an artificial school gate.
 const s=E.newGame({name:'Public Infirmary Poultice',seed:66814,
  background:'fieldworker'});
 const before=s.world.minutes,rng=s.rngState,stamina=s.player.stamina,
  items={...s.player.inventory},state=E.exportGame(s);
 const viewed=craft(s,'status');
 A.equal(viewed.workspaceAvailable,true);
 A.equal(E.exportGame(s),state,'Checking a nearby verified clean workplace is read-only');
 const medicine=craft(s,'fieldPoultice');
 A.equal(medicine.worksite,'Morrowfen Crossing');
 A.equal(medicine.elapsedMinutes,70);A.equal(medicine.staminaSpent,3);
 A.equal(s.world.minutes,before+70);
 A.equal(s.player.stamina,stamina-3);
 A.equal(s.player.inventory.marsh_reed||0,items.marsh_reed-2);
 A.equal(s.player.inventory.clean_rations,items.clean_rations-1);
 A.equal(s.player.inventory.healing_balm,
  items.healing_balm+(medicine.succeeded?1:0));
 A.equal(s.table.fieldCraftAttempts.length,1);
 A.equal(s.table.fieldCraftAttempts[0].site,'crossing');
 A.match(s.table.fieldCraftAttempts[0].source,/infirmary/);
 A.ok(s.table.fieldCraftAttempts[0].witnessHash.length===64);
 A.ok(s.table.fieldCraftAttempts[0].rollHash.length===64);
 A.notEqual(s.rngState,rng,'Only the original real Crafting die is drawn');
}

console.log('Verified first common poultice recipe consumes real materials and resolves one honest skill check');
