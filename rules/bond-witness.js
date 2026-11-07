'use strict';
// Natural, witnessed beast interaction. Only an independently resolved response
// can mint bond evidence; a caller cannot choose event, roll, DC or outcome.
const E=require('../engine.js'),C=require('./core'),Bond=require('./bonds'),Agency=require('./beast-agency');

const INTERACTIONS={
 gentle:{event:'gentle_treatment',minutes:15,baseDC:12,description:'approach without pressure'},
 play:{event:'play',minutes:20,baseDC:14,description:'accept an invitation to play'}
};
function interact(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!['beastId','approach'].includes(k)))
  throw Error('Use only beastId and a witnessed approach; arbitrary event outcomes are forbidden');
 const method=INTERACTIONS[p.approach];
 if(!method)throw Error('Approach must be gentle or play');
 const id=p.beastId,beast=s.beasts?.[id];
 if(typeof id!=='string'||!beast)throw Error('Unknown beast for witnessed interaction');
 const record=Bond.fromSave(s,id);
 if(record.fractured)throw Error('Fractured relationship needs distinct restorative adjudication');
 if(!Number.isInteger(beast.sapience)||beast.sapience!==record.sapience)
  throw Error('Beast sapience and recorded bond must agree before interacting');
 if(s.battle)throw Error('Cannot stage a friendly interaction during active combat');
 const present=s.encounter?.beastId===id||s.player.partnerIds?.includes(id);
 if(!present||beast.away===true||
    (beast.location&&beast.location!==s.world.location))
  throw Error('Beast must be independently established as present in the current scene');
 s.table||={};s.table.bondWitnessActivity||={};
 const currentDay=Math.floor(s.world.minutes/1440);
 if(s.table.bondWitnessActivity[id]===currentDay)
  throw Error('A witnessed relationship interaction was already attempted with this beast today');
 // One response per beast per day, regardless of success. This prevents
 // repeated social attempts until the dice finally favour the player.
 const decision=Agency.evaluate(s,beast,record,p.approach);
 if(!decision.possible){
  Agency.remember(s,beast);
  s.table.bondWitnessActivity[id]=currentDay;
  E.advance(s,method.minutes);
  const msg=beast.name+' declines the approach; the player respects the refusal.';
  C.event(s,'beast',msg,{beastId:id,approach:p.approach,success:false,
   witnessedRefusal:true,elapsedMinutes:method.minutes});
  return {approach:p.approach,accepted:false,check:null,rollMade:false,
   elapsedMinutes:method.minutes,evidenceId:null,message:msg};
 }
 const cha=C.int(s.player.attributes.cha,'Charisma attribute',1,30);
 const rank=C.int(s.player.skills.beastcraft?.rank??0,'Beastcraft rank',0,5);
 const mood=String(beast.mood||'');
 const cautious=/wary|uneasy|agitated|fear|hostile|territorial/i.test(mood);
 const dc=method.baseDC+(cautious?4:0)+(record.willingness<20?3:0)+(beast.sapience>=3?2:0);
 const modifier=Math.floor((cha-10)/2)+2*rank;
 const result=C.check(s,{modifier,dc,label:'Voluntary beast interaction: '+p.approach});
 Agency.remember(s,beast);
 s.table.bondWitnessActivity[id]=currentDay;
 E.advance(s,method.minutes);
 const msg=result.success?
  beast.name+' willingly chose to '+method.description+'.':
  beast.name+' declined the '+method.description+'; distance was respected.';
 C.event(s,'beast',msg,{beastId:id,approach:p.approach,success:result.success,
   check:{roll:result.roll,total:result.total,dc:result.dc,degree:result.degree}});
 if(!result.success)return {approach:p.approach,accepted:false,check:result,
   elapsedMinutes:method.minutes,evidenceId:null,message:msg};
 s.table.bondEvidence||={};
 s.table.bondWitnessSerial=C.int(s.table.bondWitnessSerial??0,'bond witness serial',0,1000000000);
 let evidenceId;
 do{
  s.table.bondWitnessSerial++;
  evidenceId='bond_witness_'+String(s.table.bondWitnessSerial).padStart(6,'0');
 }while(Object.hasOwn(s.table.bondEvidence,evidenceId));
 const source='Observed '+beast.name+' voluntarily '+method.description+
   ' at '+s.world.location+'; verified d20 '+result.roll+' vs DC '+dc+'.';
 s.table.bondEvidence[evidenceId]={beastId:id,kind:'event',event:method.event,
   worldMinute:s.world.minutes,source,origin:'resolved-bond-interaction',
   check:{roll:result.roll,dc:result.dc,success:true},approach:p.approach};
 return {approach:p.approach,accepted:true,check:result,
   elapsedMinutes:method.minutes,evidenceId,event:method.event,message:msg};
}
module.exports={interact};
