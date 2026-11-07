'use strict';
// Private chat runtime compatibility layer. A single wound record is authoritative
// for all NEW combat; historical HP totals are preserved as legacy context only.
const E=require('../engine.js');
const C=require('./core');
const B=require('./build');
const Combat=require('./combat');
const W=require('./world');
const MODEL='wounds-v1';
const abil=(p,k)=>Math.floor(((p.attributes?.[k]??10)-10)/2);
const isInjured=c=>c.wounds.some(n=>n>0)||c.status!=='ok';
function state(s){ const t=s.table||(s.table={});t.combatants||={};return t; }
function playerProfile(s){
 const p=s.player,combatRank=Math.min(5,p.skills?.combat?.rank||0);
 const attrs={vigor:abil(p,'con'),agility:abil(p,'dex'),wits:abil(p,'wis'),will:abil(p,'wis'),might:abil(p,'str')};
 const derived=B.humanStats(attrs,{skills:{Melee:combatRank},soulPhase:p.soul?.phase||0});
 // The old starting stamina is preserved: changing it would rewrite the campaign.
 return {name:p.name,toughness:derived.toughness,defense:derived.defense,vigor:attrs.vigor,will:attrs.will,
   stamina:p.stamina,boxes:derived.boxes,wpr:0};
}
function ensurePlayer(s){
 const t=state(s);if(t.combatants.player){
   if(t.healthModel && t.healthModel!==MODEL)throw Error('Incompatible combat model');
   t.healthModel=MODEL;return {created:false,combatant:Combat.publicCombatant(t.combatants.player)};
 }
 const p=s.player;
 if(!Number.isInteger(p.health)||!Number.isInteger(p.maxHealth)||p.maxHealth<=0||p.health<0||p.health>p.maxHealth)throw Error('Legacy health is invalid');
 if(p.health!==p.maxHealth)throw Error('Legacy HP injury has no honest automatic wound conversion; record an adjudicated migration before combat');
 if(s.battle)throw Error('Legacy HP battle already underway; resolve or adjudicate it before switching models');
 const c=Combat.makeCombatant(playerProfile(s));
 t.combatants.player=c;t.healthModel=MODEL;t.legacyHealth={current:p.health,max:p.maxHealth};
 return {created:true,combatant:Combat.publicCombatant(c)};
}
function migrateLegacy(s,{wounds,reason}={}){
 const t=state(s),p=s.player;
 if(t.combatants.player)throw Error('Wound model already exists');
 if(!Array.isArray(wounds)||wounds.length!==3||wounds.some(x=>!Number.isInteger(x)||x<0))throw Error('Wound boxes [Light, Serious, Critical] required');
 if(typeof reason!=='string'||reason.trim().length<12||reason.length>300)throw Error('Migration requires a documented, player-visible ruling');
 const c=Combat.makeCombatant(playerProfile(s));
 if(wounds.some((n,i)=>n>c.boxes[i]))throw Error('Migration exceeds wound box capacities');
 c.wounds=[...wounds];t.combatants.player=c;t.healthModel=MODEL;
 t.legacyHealth={current:p.health,max:p.maxHealth,adjudication:reason};
 C.event(s,'ruling','Legacy injury was reconciled to wound boxes by an explicit GM ruling: '+reason,{wounds});
 return {migrated:true,wounds:[...wounds],legacyHealth:t.legacyHealth};
}
function ensureBeast(s,{beastId,toughness,defense,vigor=0,will=0,stamina,boxes,offM=0,durM=0,sapience=null}={}){
 if(typeof beastId!=='string'||!s.beasts?.[beastId])throw Error('Beast must exist in the campaign');
 const b=s.beasts[beastId],id='beast:'+beastId,t=state(s);
 if(t.combatants[id])return {created:false,id,combatant:Combat.publicCombatant(t.combatants[id])};
 // Species data in the legacy prototype lacks wound-relevant size, hide and traits.
 // Require GM-verified derived stats rather than guessing from a rarity label.
 if(toughness===undefined||defense===undefined||stamina===undefined)throw Error('Verified beast combat profile required; do not guess size, hide, T or Defense');
 if(b.hp!==undefined&&b.maxHp!==undefined&&b.hp!==b.maxHp)throw Error('Legacy beast HP injury requires explicit adjudication before wound conversion');
 if(b.sapience!==undefined && Number.isInteger(b.sapience) && sapience!==b.sapience)throw Error('Sapience conflicts with established beast record');
 const c=Combat.makeCombatant({name:b.name,toughness,defense,vigor,will,stamina,boxes,offM,durM,sapience});
 t.combatants[id]=c;b.combatId=id;b.combatModel=MODEL;
 return {created:true,id,combatant:Combat.observedCombatant(c)};
}
function sync(s,{source='wounds'}={}){
 const c=s.table?.combatants?.player;
 if(!c)return {synced:false};
 if(source==='legacy'){
   // Travel and world updates change legacy stamina, which becomes the wound pool.
   c.stamina=Math.min(c.maxStamina,Math.max(0,s.player.stamina));
 }else if(source==='wounds')s.player.stamina=c.stamina;
 else throw Error('Unknown stamina sync direction');
 if(s.table.healthModel!==MODEL)throw Error('Conflicting health models');
 return {synced:true,stamina:s.player.stamina,wounds:[...c.wounds],status:c.status};
}
function status(s){
 const c=s.table?.combatants?.player;
 if(!c)return {model:'legacy-hp',legacyHp:s.player.health,maxHp:s.player.maxHealth,requiresMigration:s.player.health!==s.player.maxHealth};
 const d=Combat.publicCombatant(c);
 return {model:MODEL,...d,legacyHp:'historical only',needsTreatment:isInjured(c)};
}
const SHELTER_LIFETIME=6*1440;
function verifiedShelter(s,id,hours){
 if(typeof id!=='string'||!/^[a-z][a-z0-9_-]{3,60}$/.test(id))
  throw Error('Wild-country sleep requires an existing source-recorded shelter ID');
 const site=s.table?.sleepShelters?.[id],now=s.world.minutes;
 if(!site||site.id!==id||site.location!==s.world.location||
    site.knownToPlayer!==true||site.safe!==true||
    typeof site.name!=='string'||site.name.trim().length<3||
    typeof site.source!=='string'||site.source.trim().length<18||
    !Number.isInteger(site.worldMinute)||site.worldMinute<0||site.worldMinute>now||
    !Number.isInteger(site.validUntilMinute)||
    site.validUntilMinute<=site.worldMinute||
    site.validUntilMinute-site.worldMinute>SHELTER_LIFETIME||
    site.validUntilMinute<now+hours*60)
  throw Error('A current witnessed, truly sheltered and secure campsite for the full sleep interval is required');
 // New engine-scouted field camps must preserve their actual roll and
 // observed terrain source. Legacy GM-authored sites remain compatible.
 if(/^fieldcamp_/.test(id))
  require('./wilderness-camp').valid(s,site);
 return site;
}
function shelterStatus(s){
 const loc=E.LOCATIONS[s.world.location];
 if(loc?.biome==='settlement')return {settlementShelter:true,available:[]};
 const found=[];
 for(const [id,site] of Object.entries(s.table?.sleepShelters||{})){
  try{
   const verified=verifiedShelter(s,id,8);
   found.push({shelterId:id,name:verified.name,validUntilMinute:verified.validUntilMinute});
  }catch{}
 }
 return {settlementShelter:false,available:found.slice(0,20)};
}
function sleep(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>!['hours','shelterId'].includes(k)))
  throw Error('Shelter safety is a saved world fact, not caller-supplied shelterVerified or shelterSource');
 const {hours=8,shelterId}=params;
 // Only a full night unlocks night-scale resources, wound recovery and
 // another genuine encounter Recover use. Short rests need separate rules.
 C.int(hours,'sleep hours',8,12);if(s.battle||s.encounter)throw Error('Cannot sleep during an unresolved encounter');
 const loc=E.LOCATIONS[s.world.location];
 if(loc?.biome!=='settlement')verifiedShelter(s,shelterId,hours);
 else if(shelterId!==undefined)throw Error('A wilderness shelter ID does not apply to normal settlement sleep');
 ensurePlayer(s);const c=s.table.combatants.player;
 if(['dying','dead','incapacitated'].includes(c.status))throw Error('A seriously injured person needs treatment, not unattended sleep');
 const before=E.day(s),beforeMinute=s.world.minutes;
 E.advance(s,hours*60);
 // Overnight recovery also advances independent world ticks, ecology and
 // organisations; the older rest path skipped this important causal step.
 require('./world').finalizeTime(s,beforeMinute);
 // Rest restores exertion and energy, but does not magically erase Serious/Critical injuries.
 c.stamina=c.maxStamina;s.player.stamina=c.stamina;
 c.recoverUses=0;c.firstAided=false;
 s.player.qi=Math.min(s.player.maxQi,s.player.qi+10);
 s.player.mana=Math.min(s.player.maxMana,s.player.mana+12);
 // The genuine Phase I Soul reservoir recovers slowly through real night
 // rest. An unawakened soul receives no free supernatural reservoir.
 if(s.player.soul?.phase>=1&&
    Number.isInteger(s.player.soul.maxReserve)&&
    s.player.soul.maxReserve>0&&
    Number.isInteger(s.player.soul.reserve)&&
    s.player.soul.reserve>=0&&
    s.player.soul.reserve<=s.player.soul.maxReserve)
   s.player.soul.reserve=Math.min(s.player.soul.maxReserve,
    s.player.soul.reserve+3);
 // A full sleep interval is one night of Light-wound recovery, at most one.
 c.wounds[0]=Math.max(0,c.wounds[0]-1);
 return {sleptHours:hours,dayBefore:before,dayAfter:E.day(s),wounds:[...c.wounds],stamina:c.stamina,qi:s.player.qi,mana:s.player.mana};
}
function balm(s){
 if(s.battle)throw Error('Treat wounds after securing the immediate danger');
 ensurePlayer(s);const c=s.table.combatants.player;
 if(!s.player.inventory?.healing_balm)throw Error('No healing balm in the bag');
 if(c.wounds[0]===0)throw Error('No Light wound that this balm can treat; advanced injuries require proper medical care');
 applyItems(s,planItems(s,{healing_balm:-1}));
 E.advance(s,10);c.wounds[0]--;
 C.event(s,'injury','A healing balm treats one Light wound, without restoring old HP.',{remaining:[...c.wounds]});
 return {treated:'Light wound',wounds:[...c.wounds],used:'healing_balm'};
}
function validate(s){
 const t=s.table;
 if(!t?.combatants?.player)return;
 const c=t.combatants.player;
 if(t.healthModel!==MODEL)throw Error('Combat health model corruption');
 if(s.player.health!==t.legacyHealth?.current||s.player.maxHealth!==t.legacyHealth?.max)
   throw Error('Legacy HP changed during wound-model play; refusing conflicting damage or healing');
 if(s.player.stamina!==c.stamina)throw Error('Player stamina diverged from canonical wound record');
 for(const k of ['wounds','boxes'])if(!Array.isArray(c[k])||c[k].length!==3)throw Error('Invalid combat record '+k);
}
// One internal physical material-transfer path shared by commerce, fieldwork,
// crafting, healing and beast care. Scene/source/consent checks stay with each
// activity: callers cannot obtain arbitrary resources merely by naming them.
// Plans verify ALL resource deltas before any of them can change inventory.
const ITEM_CAPACITY=100000,liveItemPlans=new WeakSet();
function planItems(s,deltas){
 if(!deltas||typeof deltas!=='object'||Array.isArray(deltas)||
    Object.getPrototypeOf(deltas)!==Object.prototype)
  throw Error('Physical item movements need an internally established item-to-quantity plan');
 const keys=Object.keys(deltas);
 if(!keys.length||keys.length>20)
  throw Error('Physical material movements require a bounded nonempty item list');
 const current=s.player?.inventory;
 if(current!==undefined&&
    (!current||typeof current!=='object'||Array.isArray(current)))
  throw Error('Existing inventory needs reconciliation');
 const entries=[];
 for(const item of keys){
  if(!Object.hasOwn(E.RESOURCES,item))
   throw Error('Only source-defined physical resources may enter shared material movements');
  const delta=deltas[item];
  if(!Number.isInteger(delta)||delta===0||
     delta< -ITEM_CAPACITY||delta>ITEM_CAPACITY)
   throw Error('A real nonzero whole-item material delta is required');
  const before=C.int(current?.[item]??0,'actual '+item+' stock',0,ITEM_CAPACITY);
  const after=before+delta;
  if(after<0)throw Error('Insufficient genuinely owned '+item+' for this action');
  if(after>ITEM_CAPACITY)throw Error('Actual '+item+' storage capacity would be exceeded');
  entries.push(Object.freeze({item,delta,before,after}));
 }
 const plan=Object.freeze({entries:Object.freeze(entries)});
 liveItemPlans.add(plan);
 return plan;
}
function applyItems(s,plan){
 if(!plan||!liveItemPlans.has(plan))
  throw Error('Only a freshly verified internal physical material plan may be applied');
 // Validate every planned stock again. A stale or tampered draft can never
 // partially consume one resource then fail to deliver another.
 for(const e of plan.entries)
  if(C.int(s.player.inventory?.[e.item]??0,'actual '+e.item+' stock',0,ITEM_CAPACITY)!==e.before)
   throw Error('Saved material stock changed after its original verification');
 const bag=s.player.inventory||(s.player.inventory={});
 for(const e of plan.entries){
  if(e.after===0)delete bag[e.item];
  else bag[e.item]=e.after;
 }
 liveItemPlans.delete(plan);
 return Object.fromEntries(plan.entries.map(e=>[e.item,e.delta]));
}
function spend(s,{scales,reason}={}){
 C.int(scales,'Scales',0,100000000);
 if(typeof reason!=='string'||reason.trim().length<3)throw Error('Transaction reason required');
 const current=Math.round(s.player.coins*100);
 if(scales>current)throw Error('Insufficient funds');
 const remain=current-scales;
 s.player.coins=remain/100;
 s.table ||= {};s.table.finances ||= {unit:'scales',entries:[]};
 s.table.finances.entries.push({day:E.day(s),change:-scales,reason:reason.slice(0,100)});
 s.table.finances.entries=s.table.finances.entries.slice(-100);
 return {spentScales:scales,balanceScales:remain};
}
module.exports={MODEL,playerProfile,ensurePlayer,migrateLegacy,ensureBeast,sync,status,sleep,shelterStatus,balm,validate,spend,planItems,applyItems};