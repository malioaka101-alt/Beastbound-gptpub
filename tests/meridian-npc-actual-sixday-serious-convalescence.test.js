'use strict';
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Atlas=require('../world/atlas'),
 Lives=require('../world/independent-person-lives'),
 Combat=require('../rules/combat'),World=require('../rules/world'),
 Unified=require('../rules/unified'),
 Recovery=require('../world/independent-serious-convalescence');
function rngNext(n){n>>>=0;n^=n<<13;n^=n>>>17;n^=n<<5;return(n>>>0)||0x91e10da5;}
const s=E.newGame({seed:9141002,name:'Disposable sixday patient'}),
 w=Realm.ensure(s),list=People.ensure(w),
 region=Atlas.regions.find(x=>E.LOCATIONS[People.siteFor(x.id)]?.biome==='settlement');
A.ok(region);
Object.assign(w.ecosystems[region.id],{quality:78,pressure:16,water:78,forage:81});
Object.assign(w.countries[region.polity],{prosperity:79,stability:83});
const demand=People.sourceDemand(w,region);A.ok(demand);
let p=null;
for(let i=0;i<180;i++){
 const c=People._debug.make(w,list,0,demand);
 const base={curious:71,steady:82,independent:68,reserved:77}[c.personality];
 const chance=Math.min(94,base+(c.fatigue>=50?9:0));
 if(c.mechanicalFoundation.baselineAttributes.con>=8&&
  1+Math.floor(rngNext(c.rngState)/4294967296*100)<=chance){p=c;break;}
}
A.ok(p,'An authentic willing safe-shelter patient must be generated');
p.shift=People.shift(p,0,w);
s.world.location=People.siteFor(p.regionId);s.chatRuntime||={};
const witness=p.name+' is an uninjured, unarmed, unarmoured adult in this inhabited settlement.';
s.chatRuntime.scene='The independent person is visibly present: '+witness;
Lives.enroll(s,{actorId:p.actorId,interests:['meridian'],
 motivation:'Personal interest in genuine Meridian preparation without automatic power',witness});
const linked=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
 params:{npcId:p.actorId,witness}});
A.equal(linked.created,true);
const body=Combat.get(s,linked.id),start=s.world.minutes;
E.advance(s,16*60+30-start);World.finalizeTime(s,start);
const shelter=p.name+' voluntarily settles into a personally witnessed safe room for sleep for eight continuous hours.';
s.chatRuntime.scene='The choice and lodging are physically witnessed: '+shelter;
const night=Rules.act(s,{system:'health',operation:'witnessedNpcNightSleep',
 params:{actorId:p.actorId,witness:shelter}});
A.equal(night.freelyAccepted,true);
A.equal(Unified.verifyNpcNightHistory(s,p.actorId),true);
const harm=Combat.harm(s,body,3);A.match(harm.result,/Serious/);
A.equal(body.wounds[1],1);A.equal(body.wounds[2],0);
const playerBefore=JSON.stringify(s.player),minute=s.world.minutes,cash=p.cashScales;
A.equal(Recovery.verify(s,p),true);
E.advance(s,6*1440);World.finalizeTime(s,minute);
const nights=p.originalOffscreenCombatNights||[];
const cured=p.originalSeriousConvalescence||[];
A.ok(nights.length>=6,'Six personally chosen original rest days needed');
A.equal(cured.length,1,'One properly rested sixday heals one original Serious wound');
A.equal(cured[0].source.originalSixNights.length,6);
A.equal(cured[0].source.before.wounds[1],1);
A.equal(cured[0].source.after.wounds[1],0);
A.deepEqual(body.wounds,[0,0,0]);
A.equal(s.world.minutes,minute+6*1440,'No added week of game time');
A.equal(p.cashScales,cash,'Rest is not invented paid surgery');
A.equal(Recovery.verify(s,p),true);
A.equal(Unified.verifyNpcNightHistory(s,p.actorId),true);
A.deepEqual(s.player,JSON.parse(playerBefore),'No modification to the player');
const saved=E.exportGame(s),loaded=E.importGame(saved);
const same=Realm.peek(loaded).emergentPeople.people[p.id];
A.equal(Recovery.verify(loaded,same),true);
const fake=E.importGame(saved);
const tampered=Realm.peek(fake).emergentPeople.people[p.id];
tampered.originalSeriousConvalescence[0].source.after.wounds[1]=2;
A.equal(Recovery.verify(fake,tampered),false);
console.log('REAL source-based sixday Serious rest PASS: six genuinely chosen safe nights, canonical Combat week, no fee/extra time/Critical heal, save replay and tamper check');
