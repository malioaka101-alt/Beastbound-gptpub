'use strict';
// Original Beastbound Master Prompt §45: DC is the resistance of a witnessed
// task, not a player-entered number.  This module adjusts source-owned base
// difficulties using real committed costs and records. It NEVER rolls dice,
// chooses wages, invents tools, or upgrades a rank.
const Crypto=require('node:crypto');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
function fatigue(s){
 const current=s.player?.stamina,max=s.player?.maxStamina;
 if(!Number.isInteger(current)||!Number.isInteger(max)||max<=0||
    current<0||current>max)throw Error('Dynamic difficulty needs genuine current Stamina');
 if(current*4<max)return 3; // less than one quarter
 if(current*2<max)return 2; // less than half
 return 0;
}
function finish(baseDC,factors,{min=5,max=35}={}){
 if(!Number.isInteger(baseDC)||baseDC<2||baseDC>100)
  throw Error('Dynamic difficulty needs a legitimate owner-authored base DC');
 if(!Array.isArray(factors)||factors.some(f=>
   !f||typeof f.id!=='string'||!Number.isInteger(f.delta)||
   f.delta < -4||f.delta>4||typeof f.evidence!=='string'||
   f.evidence.length<10))
  throw Error('Difficulty adjustments require bounded source evidence');
 const raw=baseDC+factors.reduce((v,f)=>v+f.delta,0);
 const dc=clamp(raw,min,max);
 return {baseDC,dc,netAdjustment:dc-baseDC,factors,
   capApplied:raw!==dc,sourceBound:true,
   note:'DC is selected by the source owner and paid-for circumstances, not by a caller-selected DC or arbitrary narrative bonus'};
}
const WORK_APPROACHES=Object.freeze({
 standard:Object.freeze({minutes:120,stamina:2,dc:0}),
 careful:Object.freeze({minutes:180,stamina:3,dc:-2}),
 rushed:Object.freeze({minutes:60,stamina:2,dc:2})
});
function householdWork(s,{person,approach='standard'}={}){
 const route=WORK_APPROACHES[approach];
 if(!route)throw Error('Unsupported household work approach');
 if(typeof person?.actorId!=='string'||!person.actorId.startsWith('origin-kin:'))
  throw Error('Household difficulty requires an actual witnessed relative');
 const factors=[];
 if(route.dc)factors.push({id:'work-method',delta:route.dc,
  evidence:approach==='careful'?
   'Careful approach spends 180 genuine minutes and 3 Stamina, not a free description':
   'Rushed approach takes 60 genuine minutes with less opportunity to inspect work'});
 const tired=fatigue(s);
 if(tired)factors.push({id:'real-fatigue',delta:tired,
  evidence:'Current recorded Stamina is '+s.player.stamina+'/'+s.player.maxStamina});
 // A household is not a proof of ownership of specialist equipment or
 // professional tutoring. Prior actual paid/unpaid shifts can provide bounded
 // practical familiarity, independent of Crafting rank or requested wording.
 const nowDay=Math.floor(s.world.minutes/1440);
 const records=(s.table?.householdWork?.records||[]).filter(x=>{
  const p=x?.proof;
  return x?.origin==='witnessed-voluntary-household-work-v1'&&
   p?.origin===x.origin&&x.hash===hash(p)&&
   p.actorId===person.actorId&&p.accepted===true&&
   Number.isInteger(p.day)&&p.day<nowDay&&p.day>=nowDay-30&&
   Number.isInteger(p.endMinute)&&Number.isInteger(p.startMinute)&&
   p.endMinute-p.startMinute>=60&&
   p.originalCheck&&typeof p.originalCheck.success==='boolean';
 });
 const familiarity=records.length>=3?-2:records.length>=1?-1:0;
 if(familiarity)factors.push({id:'verified-work-familiarity',
  delta:familiarity,evidence:records.length+
  ' prior independently accepted shift(s) with this relative, proved by signed original household-work receipts'});
 return {...finish(12,factors,{min:8,max:18}),approach,
   minutes:route.minutes,staminaCost:route.stamina};
}
function disciplinePractice(s,{system,method,record,baseDC,independent=false,short=false}={}){
 if(typeof system!=='string'||!system||
    typeof method!=='string'||!method||!record||
    typeof record!=='object'||!Number.isInteger(baseDC)||
    typeof independent!=='boolean'||typeof short!=='boolean')
  throw Error('Discipline practice difficulty needs an actual stage, method and training record');
 const factors=[];
 if(independent||short)factors.push({id:'independent-or-brief-route',delta:2,
  evidence:'Original discipline rule: independent or brief personal sessions add +2 DC'});
 // Practice does not automatically grant skill ranks or power. Existing
 // owner-written, sustained method records can lower the *difficulty* of
 // continuing the same target; stage transitions start a fresh record.
 const count=record.methods?.[method]||0;
 const minutes=record.sessionMinutes||0;
 const familiarity=count>=6&&minutes>=960?-2:
  count>=2&&minutes>=240?-1:0;
 if(familiarity)factors.push({id:'earned-method-familiarity',delta:familiarity,
  evidence:count+' recorded '+system+' '+method+
   ' session(s) and '+minutes+' total actual practice minutes on this training target'});
 const tired=fatigue(s);
 if(tired)factors.push({id:'real-fatigue',delta:tired,
  evidence:'Current recorded Stamina is '+s.player.stamina+'/'+s.player.maxStamina});
 return finish(baseDC,factors,{min:5,max:35});
}
module.exports={finish,fatigue,householdWork,disciplinePractice,WORK_APPROACHES};
