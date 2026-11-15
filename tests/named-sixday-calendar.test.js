'use strict';
const A=require('node:assert/strict'),E=require('../engine'),
 W=require('../rules/world'),P=require('../panels'),
 New=require('../scripts/new-campaign'),Realm=require('../world/simulation');
const names=['Dawnday','Rootday','Forgeday','Wayday','Marketday','Hearthday'];
for(let m=1;m<=12;m++){
 for(let day=1;day<=30;day++){
  A.equal(W.dateWeekday({year:1156,month:m,day}),names[(day-1)%6],
   'Each named day must repeat every six days through all thirty-day months');
 }
}
for(let i=1;i<=5;i++)
 A.equal(W.dateWeekday({year:1156,month:13,day:i}),'Concord Day',
  'Concord festival dates retain their original civic designation');
A.deepEqual(names.map((_,i)=>W.dateWeekday({year:1156,month:4,day:i+1})),names);
A.equal(W.dateWeekday({year:1156,month:4,day:2}),'Rootday',
 'Maddoc’s current 2 Nesting should have a distinctive day name');
A.equal(W.dateWeekday(W.addDate({year:1156,month:4,day:30},1)),'Dawnday');
A.deepEqual(W.calendarTicks(0,6,{date:{year:1156,month:4,day:1},
 source:'test original almanac',atCompletedDay:0}).sixdays,[6],
 'Changing displayed day names must not change world sixday tick boundaries');
A.deepEqual(W.calendarTicks(0,30,{date:{year:1156,month:4,day:1},
 source:'test original almanac',atCompletedDay:0}).months,[30],
 'Monthly simulation boundaries must be unmodified');
const s=New.create({seed:22007,slug:'sixday_names_display'}).state;
const before=E.exportGame(s),calendar=Realm.calendar(s),hud=P.hudData(s);
A.equal(hud.date.weekday,calendar.weekday);
A.ok(names.includes(hud.date.weekday)||hud.date.weekday==='Concord Day');
A.match(P.inChatHtml(s),new RegExp(hud.date.weekday));
A.equal(E.exportGame(s),before,'Status and panel calendar reading is read-only');
console.log('Six distinctly named Aldmere days, Concord festivals, original sixday ticks, HUD, and save immutability passed.');
