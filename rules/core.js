'use strict';
// Beastbound resolution primitives. Independent JavaScript implementation of the
// published rules; no Python modules are imported or committed.
const E=require('../engine.js');
const int=(n,name,min=-Infinity,max=Infinity)=>{if(!Number.isInteger(n)||n<min||n>max)throw Error(`${name} must be an integer in [${min},${max}]`);return n;};
function die(s,sides=20){
  int(sides,'sides',2,1000);
  let x=s.rngState>>>0;
  x^=x<<13; x^=x>>>17; x^=x<<5;
  s.rngState=(x>>>0)||2463534242;
  return 1+Math.floor((s.rngState/4294967296)*sides);
}
function degree(margin,risky=true){
  return margin>=10?'exceptional':margin>=5?'strong':margin>=0?'success':
    margin>=-4?'setback':margin>=-9?'failure':risky?'severe failure':'failure';
}
const progress=d=>({exceptional:3,strong:2,success:1}[d]||0);
const naturalAdjustment=r=>r===20?5:r===1?-5:0;
function event(s,type,message,details){
  s.log.push({day:E.day(s),time:E.clock(s),type,text:message,details:details||null});
  if(s.log.length>90)s.log=s.log.slice(-90);
}
function roll(s,adv=0){
  int(adv,'advantage',-1,1);
  const dice=adv?[die(s),die(s)]:[die(s)];
  return {dice,kept:adv===1?Math.max(...dice):adv===-1?Math.min(...dice):dice[0]};
}
function check(s,{modifier=0,dc=15,label='Check',risky=true,adv=0,takeTime=false}={}){
  int(modifier,'modifier',-100,100);int(dc,'DC',2,100);
  const rolled=takeTime?{dice:[15],kept:15}:roll(s,adv);
  const naturalBonus=takeTime?0:naturalAdjustment(rolled.kept);
  const total=rolled.kept+modifier+naturalBonus, margin=total-dc;
  const result={dice:rolled.dice,roll:rolled.kept,modifier,dc,total,margin,
    degree:degree(margin,risky),success:margin>=0,progress:progress(degree(margin,risky)),naturalBonus};
  const display=rolled.dice.length===1?String(rolled.kept):`[${rolled.dice.join(', ')}]→${rolled.kept}`;
  const signed=(n)=>n>=0?`+${n}`:String(n);
  const nat=naturalBonus?` (${rolled.kept===20?'natural 20':'natural 1'} ${signed(naturalBonus)})`:'';
  event(s,'roll',`🎲 ${String(label).slice(0,90)}: d20 ${display} ${signed(modifier)}${nat} = ${total} vs DC ${dc} → ${result.degree} (${signed(margin)})`,result);
  return result;
}
function opposed(s,a,b){
  const ma=int(a?.modifier,'first modifier',-100,100),mb=int(b?.modifier,'second modifier',-100,100);
  const ra=roll(s,a?.adv||0),rb=roll(s,b?.adv||0);
  const left={roll:ra.kept,dice:ra.dice,modifier:ma,naturalBonus:naturalAdjustment(ra.kept)};
  const right={roll:rb.kept,dice:rb.dice,modifier:mb,naturalBonus:naturalAdjustment(rb.kept)};
  left.total=left.roll+left.modifier+left.naturalBonus;
  right.total=right.roll+right.modifier+right.naturalBonus;
  const winner=left.total>right.total?'a':'b',tie=left.total===right.total;
  const result={a:left,b:right,winner,tie,margin:Math.abs(left.total-right.total)};
  event(s,'roll',`🎲 ${a.label||'A'} ${left.total} vs ${b.label||'B'} ${right.total} → ${winner==='a'?'first':'second'} wins${tie?' (tie to defender)':''}`,result);
  return result;
}
function assist(helperDegrees){
  if(!Array.isArray(helperDegrees))throw Error('Helper degrees array required');
  return Math.min(4,helperDegrees.reduce((n,r)=>n+(r==='strong'||r==='exceptional'?3:r==='success'?2:0),0));
}
function assistChecks(s,helperMods){
  if(!Array.isArray(helperMods)||helperMods.length>10)throw Error('Up to ten helper modifiers required');
  return {bonus:assist(helperMods.map((modifier,i)=>check(s,{modifier,dc:10,label:`Assist ${i+1}`}).degree))};
}
function castAttack(s,p){
  const complexity=int(p.complexity,'complexity',0,40),manaCost=int(p.manaCost,'manaCost',0,10000),defense=int(p.defense,'defense',1,60);
  const base=int(p.modifier,'modifier',-40,80);
  const cp=Math.max(0,complexity-(p.specialised?1:0));
  const bonus=base+(p.specialised?1:0)+(p.prepared?2:0);
  if(s.player.mana<manaCost)throw Error('Insufficient Mana');
  const kept=die(s),total=kept+bonus,castTotal=total+naturalAdjustment(kept);
  const castingDC=10+cp,castingMargin=castTotal-castingDC;
  const casting=degree(castingMargin);
  if(castingMargin<0){
    const spent=casting==='setback'?Math.floor(manaCost/2):manaCost;s.player.mana-=spent;
    const result={roll:kept,castingDC,castTotal,castMargin:castingMargin,casting,hit:false,fizzle:true,manaSpent:spent,backlash:casting==='severe failure'};
    event(s,'roll',`🎲 Attack spell: d20 ${kept} +${bonus} = ${total} vs casting DC ${castingDC} → ${casting}; ${spent} Mana lost`,result);
    return result;
  }
  s.player.mana-=manaCost;
  const hit=kept===20||kept!==1&&total>=defense;
  const result={roll:kept,castingDC,castTotal,casting,attackTotal:total,defense,hit,fizzle:false,manaSpent:manaCost,extraSeverity:kept===20?1:0,damagePending:hit};
  event(s,'roll',`🎲 Attack spell: d20 ${kept} +${bonus} = ${total} vs casting DC ${castingDC} and Def ${defense} → ${hit?'hit':'miss'}`,result);
  return result;
}
function wardHit(target,severity){
  int(severity,'severity',0,100);if(!target.ward||target.ward.steps<=0)return {absorbed:false,remaining:0};
  target.ward.steps=Math.max(0,target.ward.steps-severity);
  return {absorbed:true,remaining:target.ward.steps,collapsed:target.ward.steps===0};
}
module.exports={int,die,roll,degree,progress,naturalAdjustment,event,check,opposed,assist,assistChecks,castAttack,wardHit};