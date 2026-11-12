'use strict';
// One original medicinal recipe, now executable at either of the original
// verified clean medical facilities using shared physical work. No invented
// medicines or caller-selected quality, method, DC or ingredient shortcuts.
const E=require('../engine.js'),C=require('./core'),H=require('./unified'),
 Practice=require('./earned-practice'),Work=require('./physical-work'),
 Production=require('./physical-production-ledger');
const DAY=1440,MINUTES=70,STAMINA=3,ITEM='field_poultice',DC=12;
function only(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Verified field poultice crafting accepts no chosen ingredients, DC, time, quality or result');
}
function cleanWorkplace(s){
 const loc=E.LOCATIONS[s.world?.location],site=s.world?.location;
 const academy=site==='academy'&&loc?.name==='Lumenfall Annex'&&
  loc.facilities?.includes('academy')&&loc.facilities?.includes('clinic');
 const crossing=site==='crossing'&&loc?.name==='Morrowfen Crossing'&&
  loc.facilities?.includes('infirmary');
 return !!(academy||crossing);
}
function scene(s){
 const loc=E.LOCATIONS[s.world?.location];
 if(!cleanWorkplace(s))
  throw Error('A real clean infirmary or academy clinic preparation workplace is required');
 if(s.battle||s.encounter)
  throw Error('Finish an active danger before preparing medicines on a clean bench');
 const c=s.table?.combatants?.player;
 if(s.player.health!==s.player.maxHealth||
    (c&&(c.status!=='ok'||c.wounds?.[1]>0||c.wounds?.[2]>0)))
  throw Error('Serious, Critical or incapacitating injuries require proper care before medicinal preparation');
 const stam=C.int(s.player.stamina,'real crafting stamina',0,100000);
 if(stam<STAMINA+2)throw Error('Insufficient actual Stamina for careful medicinal work');
 if(!E.RESOURCES.marsh_reed||!E.RESOURCES.clean_rations||
    !E.RESOURCES.healing_balm)
  throw Error('The original known poultice ingredients and result must remain defined');
 return loc;
}
// A fixed recipe is a genuine material/time task, not a once-per-day magic
// gate. Preserve old per-day first-attempt evidence and append all modern
// attempts without overwriting a historical successful or failed result.
function craftCount(s,day){
 const historical=s.table?.fieldCraftDaily?.[String(day)];
 const attempts=s.table?.fieldCraftAttempts;
 if(attempts!==undefined&&!Array.isArray(attempts))
  throw Error('Invalid persisted field-craft attempt ledger');
 const current=(attempts||[]).filter(a=>a?.day===day);
 return current.length+(historical&&!current.some(a=>a.witnessHash===historical.witnessHash)?1:0);
}
function status(s,p={}){
 only(p);
 const loc=E.LOCATIONS[s.world?.location];
 const here=cleanWorkplace(s);
 const day=Math.floor(s.world.minutes/DAY);
 const inv=s.player?.inventory||{};
 return {recipe:ITEM,known:true,workspaceAvailable:!!here,
  requirements:{marsh_reed:2,clean_rations:1},
  preparedToday:craftCount(s,day)>0,
  attemptsToday:craftCount(s,day),
  dailyLimit:false,
  materialsAndTimeDetermineFutureAttempts:true,
  supplies:{marsh_reed:inv.marsh_reed||0,clean_rations:inv.clean_rations||0},
  knownResult:'One standard healing balm only after an honest successful Crafting check'};
}
function craft(s,p={}){
 only(p);
 const loc=scene(s),day=Math.floor(s.world.minutes/DAY);
 if(!Production.verify(s))throw Error('Prior genuine production work history needs reconciliation before crafting');
 const previousAttempts=craftCount(s,day);
 if(s.table?.fieldCraftDaily!==undefined&&
    (!s.table.fieldCraftDaily||typeof s.table.fieldCraftDaily!=='object'||
     Array.isArray(s.table.fieldCraftDaily)))
  throw Error('Invalid existing field craft daily history');
 const inv=s.player.inventory||{};
 for(const [k,quantity] of [['marsh_reed',2],['clean_rations',1]]){
  C.int(inv[k]??0,'recorded '+k+' stock',0,100000);
  if((inv[k]||0)<quantity)throw Error('A real laboratory poultice requires 2 Marsh Reed and 1 Clean Rations');
 }
 // A full output bag is an invalid action before the first material or die
 // moves; the two-input recipe is one atomic physical work transaction.
 const oldStock=C.int(inv.healing_balm||0,'previous healing balm stock',0,100000);
 if(oldStock>=100000)throw Error('Healing balm inventory capacity reached');
 const int=C.int(s.player.attributes?.int,'existing Intelligence score',1,30);
 const rank=C.int(s.player.skills?.crafting?.rank,'earned Crafting skill rank',0,5);
 const academy=s.world.location==='academy';
 const context=academy?
  'A clean Lumenfall laboratory bench and the known reed-and-rations poultice recipe are prepared.':
  'A clean Morrowfen Crossing infirmary work surface is prepared for the known reed-and-rations poultice.';
 const work=Work.plan(s,{inputs:{marsh_reed:2,clean_rations:1},
  stamina:STAMINA,minimumRemaining:2,minutes:MINUTES,dc:DC,
  modifier:Math.floor((int-10)/2)+2*rank,
  label:academy?'Field poultice preparation at Lumenfall teaching laboratory':
   'Field poultice preparation at Morrowfen Crossing infirmary',
  event:{type:'world',text:context,details:{
   origin:'verified-common-poultice-workbench',
   location:s.world.location,recipe:ITEM,inputs:{marsh_reed:2,clean_rations:1},
   output:'healing_balm',dc:DC,minutes:MINUTES}}});
 const result=Work.perform(s,work);
 const {check,witnessIndex,witnessHash,rollIndex,rollHash,
  originalWorkbench,originalRoll}=result;
 const old=result.startedAtMinute;
 const succeeded=check.success;
 if(succeeded)H.applyItems(s,H.planItems(s,{healing_balm:1}));
 s.table||={};s.table.fieldCraftDaily||={};
 s.table.fieldCraftAttempts||=[];
 const history={
  recipe:ITEM,site:s.world.location,source:academy?
   'Original fixed field_poultice recipe and authored Lumenfall medical laboratories':
   'Original fixed field_poultice recipe and established Morrowfen Crossing infirmary',
  day,attemptNumberToday:previousAttempts+1,
  preparedMinute:old,finishedMinute:s.world.minutes,
  witnessIndex,witnessHash,rollIndex,rollHash,
  // The original source events persist after narrative log rotation.
  originalWorkbench,originalRoll,
  success:succeeded,usedMaterials:{marsh_reed:2,clean_rations:1},
  output:succeeded?{healing_balm:1}:{},check:{roll:check.roll,dc:check.dc,margin:check.margin}
 };
 s.table.fieldCraftAttempts.push(history);
 const made=Production.record(s,{kind:'field',index:s.table.fieldCraftAttempts.length-1});
 // Older saves used exactly one record per day. Never rewrite their first
 // original attempt; new independently paid attempts retain their own ledger.
 if(!s.table.fieldCraftDaily[String(day)])
  s.table.fieldCraftDaily[String(day)]={...history};
 C.event(s,'progress',succeeded?
  'The verified laboratory poultice stabilises into one ordinary healing balm.':
  'The prepared poultice separates and is unsafe; its real materials are lost.',{
    recipe:ITEM,success:succeeded,sourceWitnessHash:witnessHash,
    checkEventHash:rollHash,elapsedMinutes:MINUTES
  });
 const practice=Practice.award(s,{skill:'crafting',check,risky:true});
 return {...practice,recipe:ITEM,succeeded,quality:succeeded?'standard':'unsafe',
  output:succeeded?{healing_balm:1}:{},usedMaterials:{marsh_reed:2,clean_rations:1},
  elapsedMinutes:MINUTES,staminaSpent:STAMINA,worksite:loc.name,
  attemptNumberToday:previousAttempts+1,check,noExtraRoll:true,
  materialProductionHash:made.sourceHash,noExtraProductionOutput:true};
}
module.exports={craft,status};
