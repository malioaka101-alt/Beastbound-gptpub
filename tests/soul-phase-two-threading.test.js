'use strict';
// The original §22 Phase II is spiritual self-structure, not physical organ
// refinement, mind-reading, a Meridian level or free beast synchronisation.
// Every state is disposable; no real player history or saved turn is altered.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),R=require('../rules'),
 Build=require('../rules/build'),Thread=require('../rules/soul-threading'),
 Senses=require('../rules/first-stage-senses'),
 Power=require('../rules/power-overview'),Turn=require('../scripts/chat-turn');
function first(seed=516731){
 const s=E.newGame({seed,name:'Disposable Soul Threader',
  path:'undecided',background:'healer'});
 R.unified.ensurePlayer(s);
 s.world.location='academy';
 s.player.attributes.wis=20;s.player.skills.cultivation.rank=5;
 s.player.soul.phase=1;
 const profile=Build.soulProfile(1,{
  will:Math.floor((s.player.attributes.wis-10)/2)});
 s.player.soul.maxReserve=profile.soulReserve;
 s.player.soul.reserve=profile.soulReserve;
 s.player.soul.perceptionRange=profile.perceptionRangeMetres;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.soul={
  target:null,points:0,weeks:0,methods:{},
  cooldownUntil:0,complications:[],history:[
   {day:1,target:'phase1',quality:'strong',
    change:'Phase I Soul Perception; first stable perception'}
  ]};
 return s;
}
const work=(s,p)=>R.act(s,{system:'soul',operation:'threadWork',params:p});
{
 const s=first(),before=E.exportGame(s),rng=s.rngState;
 const st=R.act(s,{system:'soul',operation:'threadStatus',params:{}});
 A.equal(st.ready,true);A.equal(st.earned,false);
 A.deepEqual(st.links,{mind:0,body:0,resonance:0});
 A.equal(st.requiredPerLink,2);
 A.equal(R.act(s,{system:'discipline',operation:'status',params:{}})
  .systems.soul.target,'Phase II — Soul Threading');
 A.equal(R.act(s,{system:'discipline',operation:'status',params:{}})
  .systems.soul.threadWork.reserveSpentPerAttempt,2);
 A.equal(Power.read(s).soul.threading.ready,true);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 for(const params of [
  {focus:'integrated',minutes:15,awardedPhase:7},
  {focus:'mind',minutes:0},{focus:'telepathy',minutes:15},
  {focus:'integrated',approach:'win'},
  {focus:'integrated',soulOfAnotherPerson:'steal'},
  {focus:'integrated',claimedDC:2}
 ]){
  A.throws(()=>work(s,params));
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
 const missing=first(516732);
 delete missing.table.disciplineTraining.soul.history[0].change;
 const absent=E.exportGame(missing);
 A.throws(()=>work(missing,{focus:'integrated'}),/genuinely earned/);
 A.equal(E.exportGame(missing),absent);
}
{
 const s=first(516733),p=s.player,profile1=Build.soulProfile(1,{will:5});
 const initial={reserve:p.soul.reserve,maxReserve:p.soul.maxReserve,
  stamina:p.stamina,minutes:s.world.minutes};
 let completed=false,spent=0,minutes=0,stamina=0,latest=null;
 for(let i=0;i<10&&!completed;i++){
  const duration=i===0?15:60,start=s.world.minutes,
   oldReserve=p.soul.reserve,oldStamina=p.stamina;
  latest=work(s,{focus:'integrated',minutes:duration,
   approach:'Coordinate individual identity, bodily awareness and spiritual resonance without influencing anyone else'});
  A.equal(latest.feeTalons,0);
  A.equal(latest.reserveSpent,2);
  A.equal(latest.staminaSpent,Math.ceil(duration/120));
  A.ok(Number.isInteger(latest.check.roll));
  A.equal(latest.check.dc,16);
  A.equal(p.soul.reserve,oldReserve-2);
  A.equal(p.stamina,oldStamina-Math.ceil(duration/120));
  A.equal(s.world.minutes,start+duration);
  spent+=2;stamina+=Math.ceil(duration/120);minutes+=duration;
  completed=latest.formed;
 }
 A.equal(completed,true,'Genuinely successful distinct spiritual work should complete Phase II');
 A.equal(p.soul.phase,2);
 A.deepEqual(p.soul.threadLinks,{mind:2,body:2,resonance:2});
 A.ok(p.soul.threadIntegrity>=40);
 A.equal(p.soul.maxReserve,Build.soulProfile(2,{will:5}).soulReserve);
 A.equal(p.soul.perceptionRange,Build.soulProfile(2,{will:5}).perceptionRangeMetres);
 A.equal(p.soul.reserve,initial.reserve-spent,
  'Earned Phase II must not conjure a free full Soul reservoir');
 A.equal(p.stamina,initial.stamina-stamina);
 A.equal(s.world.minutes,initial.minutes+minutes);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.deepEqual(s.player.body.cycles,[]);
 A.equal(s.player.rift.step,0);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(Thread.earned(s).concentrationBonus,2);
 A.equal(Thread.status(s).earned,true);
 A.equal(Power.read(s).soul.phaseName,'Phase II — Soul Threading');
 A.equal(Power.read(s).soul.threading.earned,true);
 const checkpoint=E.importGame(E.exportGame(s));
 A.deepEqual(checkpoint.player.soul.threadProof,p.soul.threadProof);
 A.deepEqual(Thread.earned(checkpoint).links,p.soul.threadLinks);
 const old=E.exportGame(s),rng=s.rngState;
 A.throws(()=>work(s,{focus:'integrated'}),/genuinely earned/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 // Use the genuinely earned threads in an actual original Soul Perception
 // check. This increases concentration, not the list of hidden entities.
 const beforeReserve=p.soul.reserve,checkStart=s.world.minutes;
 const perception=Senses.perceive(s,{});
 A.equal(perception.threadConcentrationBonus,2);
 A.equal(perception.check.modifier,Math.floor((p.attributes.wis-10)/2)+2*5+2);
 A.equal(perception.energySpent,2);
 A.equal(p.soul.reserve,beforeReserve-2);
 A.equal(s.world.minutes,checkStart+Senses.SOUL_MINUTES);
 A.equal(perception.noNamesRead,true);
 A.equal(perception.noBeastMindRead,true);
 A.equal(perception.noUnseenCreaturesInvented,true);
 const counterfeit=E.importGame(E.exportGame(checkpoint));
 counterfeit.player.soul.threadProof.integrity=999;
 A.throws(()=>Thread.earned(counterfeit),/not a completed|not a|incomplete|stable|Soul Phase II/);
 const wronglyClaimed=Senses.perceive(counterfeit,{});
 A.equal(wronglyClaimed.threadConcentrationBonus,0,
  'Edited Phase II labels/evidence cannot award the verified concentration bonus');
 const oldSoul=first(516735);
 const status=Senses.soulStatus(oldSoul,{});
 A.equal(status.threadVerified,false);
 const normal=Senses.perceive(oldSoul,{});
 A.equal(normal.threadConcentrationBonus,0);
}
{
 let observed=false;
 for(let seed=990010;seed<990090&&!observed;seed++){
  const s=first(seed);
  s.rngState=(Math.imul(seed,2654435761)>>>0)||1;
  s.player.attributes.wis=10;s.player.skills.cultivation.rank=0;
  const r=work(s,{focus:'mind',minutes:15});
  if(r.check.degree==='severe failure'){
   observed=true;
   A.equal(r.backlash,'identity resonance backlash');
   A.ok(s.player.soul.stability<95);
   A.ok(s.table.combatants.player.wounds.some(n=>n>0));
   A.equal(s.player.soul.phase,1);
  }
 }
 A.equal(observed,true,'Spiritual instability is a genuine risk, not a fake harmless description');
}
{
 const s=first(516736),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-soul2-'));
 try{
  const path=Path.join(dir,'test-soul.json');
  FS.writeFileSync(path,E.exportGame(s)+'\n');
  const req={id:'soul_2_516736',mode:'rule',
   system:'soul',operation:'threadWork',
   params:{focus:'integrated',minutes:15}};
  const one=Turn.execute(path,req);
  A.equal(one.ok,true);A.equal(one.applied,true);
  A.ok(Number.isInteger(one.output.rules.check.roll));
  const written=FS.readFileSync(path,'utf8');
  const two=Turn.execute(path,req);
  A.equal(two.duplicate,true);A.equal(two.applied,false);
  A.equal(FS.readFileSync(path,'utf8'),written);
  A.equal(E.importGame(written).world.minutes,s.world.minutes+15);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Soul Phase II: source-earned mind/soul/body threads, original costs and risk, distinct concentration benefit in real perception, no mindreading, original turn replay');
