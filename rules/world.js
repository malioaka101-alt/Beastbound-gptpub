'use strict';
const E=require('../engine.js');const {int}=require('./core');
const Realm=require('../world/simulation');const Agendas=require('./agendas');
function calendarTicks(startCompleted,days,anchor=null){int(startCompleted,'start day',0,100000);int(days,'days',0,10000);const sixdays=[],months=[];
 for(let d=startCompleted+1;d<=startCompleted+days;d++){
  // The interval that just ended is the PREVIOUS date; the tick runs at
  // its midnight boundary. Concord Days do not complete a work sixday.
  let monthDay,festival=false;
  if(anchor){
   const delta=d-1-anchor.atCompletedDay;
   if(delta<0)throw Error('Calendar anchor postdates an earlier simulated tick');
   const previous=addDate(anchor.date,delta);
   monthDay=previous.day;festival=previous.month===13;
  }else{const cycleDay=((d-1)%365)+1;monthDay=cycleDay>360?cycleDay-360:((cycleDay-1)%30)+1;festival=cycleDay>360;}
  if(!festival&&monthDay%6===0)sixdays.push(d);
  if(!festival&&monthDay===30)months.push(d);
 }
 return {sixdays,months};}
function finalizeTime(s,oldMinutes){
 int(oldMinutes,'previous minutes',0,1000000000);
 const before=Math.floor(oldMinutes/1440),after=Math.floor(s.world.minutes/1440);
 if(after<=before)return {sixdayTicks:[],monthTicks:[],publicAgendas:[]};
 const ticks=calendarTicks(before,after-before,s.table?.realm?.calendarAnchor||null);
 const t=s.table||(s.table={});t.calendar||={sixdays:[],months:[]};
 const oldWeeks=new Set(t.calendar.sixdays),oldMonths=new Set(t.calendar.months);
 const weeks=ticks.sixdays.filter(n=>!oldWeeks.has(n)),months=ticks.months.filter(n=>!oldMonths.has(n));
 t.calendar.sixdays.push(...weeks);t.calendar.months.push(...months);
 const agendas=Agendas.tick(s,weeks,months);
 const realm=Realm.tick(s,weeks,months);
 return {sixdayTicks:weeks,monthTicks:months,publicAgendas:agendas.visible,worldSimulation:{sixdays:realm.sixdays,months:realm.months,localNews:realm.publicNotices}};
}
function advance(s,days){int(days,'days',0,10000);const oldMinutes=s.world.minutes;E.advance(s,days*1440);
 const ticks=finalizeTime(s,oldMinutes);
 return {elapsedDays:days,newDay:E.day(s),...ticks};}
function money(scales){int(scales,'scales',0,100000000);const talons=Math.floor(scales/100),fangs=Math.floor(scales%100/10),rest=scales%10;return `${talons}T ${fangs}F ${rest}S`;}

// The Aldmere calendar is a 360-day twelve-month cycle plus five Concord Days;
// date arithmetic is intentionally separate from Aerin's legacy day counter.
const MONTHS=['Deepfrost','Thawing','Seedwake','Nesting','Greentide','Highsun','Swelter','Harvestmoon','Migration','Leaffall','Longnight','Hearthmonth'];
function validateDate({year,month,day}){
 int(year,'year',1,100000);int(month,'month',1,13);int(day,'day',1,month===13?5:30);
}
function addDate(date,days){
 validateDate(date);int(days,'days',0,365000);
 const d={year:date.year,month:date.month,day:date.day};
 for(let i=0;i<days;i++){
  d.day++;
  if(d.day>(d.month===13?5:30)){
   d.day=1;d.month++;
   if(d.month===14){d.month=1;d.year++;}
  }
 }
 return d;
}
function dateText(date){validateDate(date);
 return `${date.month===13?'Concord Day '+date.day:date.day+' '+MONTHS[date.month-1]} ${date.year} AC`;
}
function dateWeekday(date){
 validateDate(date);
 if(date.month===13)return 'Concord Day';
 return (date.day%6===0)?'Hearthday':`Workday ${1+(date.day-1)%6}`;
}
function coinText(scales){
 if(!Number.isInteger(scales))throw Error('Money must be integer scales');
 const sign=scales<0?'-':'',amount=Math.abs(scales),t=Math.floor(amount/100),f=Math.floor(amount%100/10),s=amount%10;
 return sign+([t?`${t}T`:'',f?`${f}F`:'',s?`${s}S`:''].filter(Boolean).join(' ')||'0S');
}
function concordRating(rating,opponent,score,{ratedResults=99,k=null}={}){
 if(![0,.5,1].includes(score))throw Error('Score must be win, draw or loss');
 const factor=k||((ratedResults<10)?40:rating>=1800?10:20);
 const expectation=1/(1+10**((opponent-rating)/400));
 return Math.round((rating+factor*(score-expectation))*10)/10;
}
function concordTier(r){
 for(const [limit,tier] of [[1000,'Iron'],[1200,'Bronze'],[1400,'Silver'],[1600,'Gold'],[1800,'Platinum'],[2000,'Laureate']])
  if(r<limit)return tier;
 return 'Paragon';
}
module.exports={calendarTicks,finalizeTime,advance,money,addDate,dateText,dateWeekday,coinText,concordRating,concordTier,realm:Realm};