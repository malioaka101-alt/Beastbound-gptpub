'use strict';
// If an independently scheduled person is genuinely established as present
// beyond the canonical public 08-18 shift, ordinary handoffs use that person
// rather than a second universal time-of-day rule. No invented night shift.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),Presence=require('../world/person-presence');
function witnessed(){
 for(let seed=50501;seed<50650;seed++){
  const s=E.newGame({name:'Genuine Independent Evening Contact',
   seed,background:'fieldworker'});
  const world=R.realm.ensure(s);
  const shift=Object.values(world.personPresence.roster)
   .find(x=>x.location==='crossing');
  if(shift)return {s,shift};
 }
 throw Error('Could not find original independently scheduled local contact');
}
const {s,shift}=witnessed();
R.world.advance(s,shift.fromDay);
E.advance(s,12*60);
const now=s.world.minutes%1440;
A.equal(now,20*60);
const people=Presence.localStatus(s,R.realm.peek(s)).people;
A.ok(people.some(x=>x.npcId===shift.npcId),
 'The real original duty record establishes this nonstandard actual presence');
A.ok(!people.some(x=>x.npcId==='otto'),
 'Canon daytime merchant does not become perpetually available at night');
const before=E.exportGame(s),items=s.player.inventory.clean_rations,
 time=s.world.minutes,rng=s.rngState;
A.throws(()=>R.act(s,{system:'social',operation:'materialHandoff',
 params:{npcId:'otto',item:'clean_rations'}}),/not independently established as present/);
A.equal(E.exportGame(s),before);
const outcome=R.act(s,{system:'social',operation:'materialHandoff',
 params:{npcId:shift.npcId,item:'clean_rations'}});
A.equal(outcome.offered,true);
A.ok(typeof outcome.accepted==='boolean');
A.equal(s.player.inventory.clean_rations,items-(outcome.accepted?1:0));
A.equal(s.world.minutes,time+6);
A.equal(s.rngState,rng);
A.equal(s.table.realm.materialCustody.accounts[shift.npcId].history.length,1);
A.equal(outcome.noAutomaticRelationship,true);
const after=E.exportGame(s);
if(!outcome.accepted){
 // With no changed holdings or independent presence, a refusal cannot be
 // fished for another answer on the person's original world-owned RNG.
 const repeat=R.act(s,{system:'social',operation:'materialHandoff',
  params:{npcId:shift.npcId,item:'clean_rations'}});
 A.equal(repeat.repeated,true);A.equal(E.exportGame(s),after);
}
A.equal(s.table.realm.materialCustody.accounts[shift.npcId].history.length,1);
console.log('Real individual co-presence permits voluntary goods without an invented universal day-only rule');
