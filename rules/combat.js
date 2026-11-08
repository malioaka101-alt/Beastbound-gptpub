'use strict';
// Wound-track combat for private Beastbound turns. Input is a combatant record,
// not a replacement for the original campaign's HP/STAMINA schema.
const C=require('./core');
const W=require('./world');
const severities=['no effect','Strain','Light','Serious','Critical','Mortal'];
function severity(damage,toughness){
  C.int(damage,'damage',0,100000);C.int(toughness,'toughness',0,100000);
  return damage<toughness?1:Math.min(5,2+Math.floor((damage-toughness)/5));
}
function makeCombatant(p={}){
  if(typeof p.name!=='string'||!p.name.trim())throw Error('Combatant name required');
  const tough=C.int(p.toughness,'toughness',0,100),def=C.int(p.defense,'defense',1,100);
  const vigor=C.int(p.vigor??0,'vigor',-10,50),will=C.int(p.will??0,'will',-10,50);
  const maxStamina=C.int(p.stamina??6+2*vigor,'stamina',0,10000);
  const boxes=p.boxes||[3,2,1];
  if(!Array.isArray(boxes)||boxes.length!==3||boxes.some(x=>!Number.isInteger(x)||x<1||x>20))throw Error('Expected [Light,Serious,Critical] wound boxes');
  const sapience=p.sapience??null;
  if(sapience!==null)C.int(sapience,'sapience',0,5);
  return {
    name:p.name.slice(0,100),toughness:tough,defense:def,vigor,will,stamina:maxStamina,maxStamina,
    boxes:[...boxes],wounds:[0,0,0],offM:C.int(p.offM??0,'offM',0,10),durM:C.int(p.durM??0,'durM',0,10),
    sapience,moraleExempt:!!p.moraleExempt,moraleChecked:false,
    braceCost:C.int(p.braceCost??3,'brace cost',0,20),wpr:C.int(p.wpr??0,'wound penalty reduction',0,10),
    ward:p.ward?{steps:C.int(p.ward.steps,'ward steps',0,100),magnitude:C.int(p.ward.magnitude??0,'ward M',0,10)}:null,
    status:'ok',dyingRounds:null,conditions:[],reactionUsed:false,pressing:false
  };
}
function penalty(c){
  const [l,s,cr]=c.wounds;
  const rehabilitation=c.lingeringPenalty||0;
  C.int(rehabilitation,'witnessed post-critical recovery penalty',0,1);
  return Math.max(0,s+2*cr+(l>=c.boxes[0]?1:0)+rehabilitation-(c.wpr||0));
}
function harm(s,c,steps,{nonlethal=false}={}){
  C.int(steps,'severity steps',0,100);
  if(steps===0)return {result:'no effect',status:c.status};
  if(steps>=7&&!nonlethal){c.status='dead';return {result:'killed outright',status:c.status};}
  if(steps===1){
    if(c.stamina>0){c.stamina--;return {result:'Strain',staminaLost:1,status:c.status};}
    steps=2;
  }
  let i=Math.min(5,steps)-2;
  while(i<3 && c.wounds[i]>=c.boxes[i])i++;
  if(i>=3){
    c.status=nonlethal?'knocked_out':'dying';
    c.dyingRounds=nonlethal?null:Math.max(1,3+c.vigor);
    return {result:nonlethal?'knocked out':'Mortal wound',status:c.status,dyingRounds:c.dyingRounds};
  }
  c.wounds[i]++;
  let result={result:`${severities[i+2]} wound`,status:c.status,wounds:[...c.wounds]};
  if(c.status==='ok' && c.wounds[2]>=c.boxes[2]){
    const save=C.check(s,{modifier:c.vigor-penalty(c),dc:14,label:`${c.name} critical Vigor save`});
    if(!save.success)c.status=nonlethal?'knocked_out':'incapacitated';
    result.criticalSave=save;
  }
  if(c.status==='ok'&&c.sapience!==null&&c.sapience<=2&&!c.moraleExempt&&!c.moraleChecked&&(c.wounds[1]>0||c.wounds[2]>0)){
    c.moraleChecked=true;
    const check=C.check(s,{modifier:c.will,dc:12,label:`${c.name} morale`});
    if(!check.success)c.status='fled';
    result.moraleSave=check;
  }
  result.status=c.status;
  return result;
}
function register(s,{id,...p}){
  if(typeof id!=='string'||!/^[a-z][\w-]{1,50}$/.test(id))throw Error('Invalid combatant id');
  const c=(s.table ||= {}).combatants ||= {};
  if(c[id])throw Error('Combatant already registered');
  c[id]=makeCombatant(p);
  return {id,registered:true,status:c[id].status};
}
function get(s,id){const c=s.table?.combatants?.[id];if(!c)throw Error('Combatant not found');return c;}
function attack(s,{targetId,attackerId,modifier,damage,offM=0,adv=0,flank=false,press=false,charge=false,calledShot=false,activeDefense=false,coverBonus=0,brace='auto',nonlethal=false,castingDC=null,manaCost=null,arena=false}={}){
  if(arena)throw Error('Arena wards not ported yet: use non-arena combat only');
  const c=get(s,targetId),att=attackerId?get(s,attackerId):null;
  if(c.status!=='ok')throw Error('Combatant no longer able to fight');
  if(att && att.status!=='ok')throw Error('Attacker cannot act while incapacitated, fleeing or dying');
  if(brace!==true&&brace!==false&&brace!=='auto')throw Error('Invalid bracing option');
  C.int(modifier,'attack modifier',-50,100);C.int(damage,'damage',0,200);C.int(offM,'offense magnitude',0,10);
  C.int(coverBonus,'verified environmental cover bonus',0,2);
  if(castingDC!==null){
    C.int(castingDC,'casting DC',2,100); C.int(manaCost,'Mana cost',0,1000);
    if(attackerId && attackerId!=='player')throw Error('Beast and non-player spell resource pools are not yet supported by this resolver');
    if(s.player.mana<manaCost)throw Error('Insufficient Mana');
  }
  const extra=(flank?2:0)+(press?2:0)+(charge?2:0)-(calledShot?4:0)-(att?penalty(att):0);
  if(att&&(press||charge))att.pressing=true;
  const {dice,kept}=C.roll(s,adv);
  const total=kept+modifier+extra;
  const defense=c.defense+(activeDefense?3:0)+coverBonus-(c.pressing?2:0);
  if(activeDefense)c.reactionUsed=true;
  // Attack spells must clear the casting threshold on THIS roll; no second die.
  if(castingDC!==null && total+C.naturalAdjustment(kept)<castingDC){
    const margin=total+C.naturalAdjustment(kept)-castingDC;
    const fizzle=C.degree(margin),spent=fizzle==='setback'?Math.floor(manaCost/2):manaCost;
    s.player.mana-=spent;
    const result={hit:false,fizzle,backlash:margin<=-10,manaSpent:spent,roll:kept,total,castingDC,defense};
    C.event(s,'roll',`🎲 Attack spell ${kept} ${modifier+extra>=0?'+':''}${modifier+extra} = ${total} vs casting DC ${castingDC} → ${result.fizzle}`,result);
    return result;
  }
  if(castingDC!==null)s.player.mana-=manaCost;
  if(kept===1 || (kept!==20&&total<defense)){
    const result={hit:false,roll:kept,total,defense,...(castingDC!==null?{manaSpent:manaCost}: {})};
    C.event(s,'roll',`⚔️ ${c.name}: d20 ${kept} → miss vs Def ${defense}`,result);
    return result;
  }
  const margin=Math.max(0,total-defense);
  const damageTotal=damage+margin+(charge?2:0);
  const durability=Math.max(0,c.durM-(calledShot?2:0));
  const hasWard=!!c.ward&&c.ward.steps>0;
  const effectiveDurability=Math.max(durability,hasWard?c.ward.magnitude:0);
  let steps=severity(damageTotal,c.toughness)+offM-effectiveDurability+(kept===20?1:0)-(nonlethal?1:0);
  let ward=null,braced=false,wound=null;
  if(hasWard&&steps>0){
    c.ward.steps=Math.max(0,c.ward.steps-steps);
    ward={absorbed:true,remaining:c.ward.steps,collapsed:c.ward.steps===0};
    steps=0; // exhausting a Ward still absorbs the final whole hit
  }
  if(steps>=2 && !c.reactionUsed && c.stamina>=c.braceCost && (brace===true||brace==='auto'&&steps>=3)){
    c.reactionUsed=true;c.stamina-=c.braceCost;steps--;braced=true;
  }
  wound=harm(s,c,Math.max(0,steps),{nonlethal});
  const result={hit:true,roll:kept,dice,total,defense,margin,damageTotal,severity:Math.max(0,steps),ward,braced,wound,status:c.status,...(castingDC!==null?{manaSpent:manaCost}: {})};
  // Source-bind a genuinely survived Critical injury before the player later
  // travels to a real clinic. No raw attack or caller-authored injury qualifies.
  if(targetId==='player'&&c===s.table?.combatants?.player&&
     attackerId===s.battle?.enemyId&&s.battle?.mode==='wounds-v1'&&
     wound?.result==='Critical wound'&&c.status==='ok'&&
     wound.criticalSave?.success===true&&c.wounds[2]===1)
   result.criticalWitness={
    origin:'verified-conscious-critical-combat-hit',targetId:'player',
    enemyId:attackerId,location:s.world.location,
    worldMinute:s.world.minutes,
    source:'Real wound combat exchange with independently profiled opponent and successful Critical Vigor save'
   };
  C.event(s,'combat',`⚔️ ${c.name}: d20 ${kept}, damage ${damageTotal} vs T${c.toughness} → ${ward?'Ward absorbed':wound.result}`,result);
  return result;
}
function contestForce(s,{a,b}={}){
  if(!a||!b)throw Error('Two combatants required');
  C.int(a.magnitude,'A magnitude',0,20);C.int(b.magnitude,'B magnitude',0,20);
  C.int(a.modifier,'A modifier',-100,100);C.int(b.modifier,'B modifier',-100,100);
  const diff=a.magnitude-b.magnitude;
  if(diff>=3 || (diff===2&&!b.leverage))return {winner:'a',gap:diff,rolled:false};
  if(diff<=-3 || (diff===-2&&!a.leverage))return {winner:'b',gap:diff,rolled:false};
  const pair=C.opposed(s,{modifier:a.modifier,adv:diff===1?1:diff===-2?-1:0,label:a.label||'A'},
    {modifier:b.modifier,adv:diff===-1?1:diff===2?-1:0,label:b.label||'B'});
  return {...pair,gap:diff,rolled:true};
}
function newRound(s,{ids=null}={}){
 const combatants=s.table?.combatants||{};
 const targets=ids??Object.keys(combatants);
 if(!Array.isArray(targets)||targets.some(id=>!Object.hasOwn(combatants,id)))throw Error('Unknown combatant in round');
 const fallen=[];
 for(const id of targets){
  const c=combatants[id];
  c.reactionUsed=false;c.pressing=false;
  if(c.status==='dying'){
   c.dyingRounds--;
   if(c.dyingRounds<=0){c.status='dead';fallen.push(id);}
  }
 }
 return {roundAdvanced:true,fallen};
}
function recover(s,{id,enduranceTrained=false}={}){
 const c=get(s,id),limit=enduranceTrained?2:1;
 if(c.status!=='ok')throw Error('Cannot recover while out of the fight');
 c.recoverUses ||= 0;
 if(c.recoverUses>=limit)return {gained:0,uses:c.recoverUses};
 c.recoverUses++;
 const old=c.stamina;
 // Poor Vigor can prevent recovery, but never makes the Recover action
 // *consume* Stamina or drive the wound-model pool below zero.
 // Earned physiological adaptation improves one existing legal Recover action.
 // It does not grant an extra turn, remove an injury or change beast actions.
 let organBonus=0;
 if(id==='player'&&s.player?.body?.cycles?.includes('Organ Cycle')){
  try{require('./disciplines').organEarned(s);organBonus=1;}
  catch{} // An edited cycle label is not proof of adapted organs.
 }
 c.stamina=Math.min(c.maxStamina,c.stamina+Math.max(0,2+c.vigor+organBonus));
 return {gained:c.stamina-old,uses:c.recoverUses};
}
function rest(s,{id,nights=0,weeks=0}={}){
 const c=get(s,id);
 C.int(nights,'nights',0,365);C.int(weeks,'weeks',0,52);
 c.wounds[0]=Math.max(0,c.wounds[0]-nights);
 if(nights){c.stamina=c.maxStamina;c.firstAided=false;c.recoverUses=0;}
 c.wounds[1]=Math.max(0,c.wounds[1]-weeks);
 if(weeks)c.wounds[0]=0;
 if(['incapacitated','knocked_out'].includes(c.status)&&c.wounds[2]===0)c.status='ok';
 const elapsed=nights+6*weeks;
 if(elapsed)W.advance(s,elapsed);
 return {wounds:[...c.wounds],stamina:c.stamina,status:c.status,daysPassed:elapsed};
}
function publicCombatant(c){
  return {name:c.name,stamina:c.stamina,maxStamina:c.maxStamina,wounds:[...c.wounds],status:c.status};
}
// A non-player's mechanical profile is GM-only. A human can infer injury
// through observable behaviour, not exact boxes, stamina or resistances.
function observedCombatant(c){
 const [light,serious,critical]=c.wounds;
 const condition=c.status!=='ok'?c.status:
   critical?'gravely wounded':serious?'visibly hurt':light?'minor visible wounds':
   c.stamina<c.maxStamina/3?'badly winded':'no obvious wound';
 return {name:c.name,condition};
}
module.exports={severity,makeCombatant,penalty,harm,register,get,attack,contestForce,newRound,recover,rest,publicCombatant,observedCombatant};