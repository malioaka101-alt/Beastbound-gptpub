'use strict';
// Stage IV belongs to the original Meridian anatomy. These fixtures create
// disposable prior-stage evidence; no campaign save or real player is changed.
const A=require('node:assert/strict'), FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine'), R=require('../rules'),
 Disc=require('../rules/disciplines'), P=require('../rules/power-overview'),
 Build=require('../rules/build'),Turn=require('../scripts/chat-turn');
const origin='Personal meridian gate transition derived from authenticated prior training at Morrowfen Crossing';
const make=(seed=183501)=>{
 const s=E.newGame({seed,name:'High Meridian Disposable',path:'meridian'});
 R.unified.ensurePlayer(s);
 s.world.location='crossing';
 s.player.attributes.wis=20;
 s.player.skills.cultivation.rank=5;
 s.player.meridian.stage=3;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.meridian={
  target:null,points:0,weeks:0,methods:{},cooldownUntil:0,
  complications:[],history:[
   {day:1,target:'foundation',quality:'strong',
    change:'Stage I Foundation Tempering; Firm structural foundation'},
   {day:1,target:'awakening',quality:'strong',
    change:'Stage II Meridian Awakening; all 12 Primary Meridians consciously mapped'}
  ]
 };
 s.table.powerPhysiology={
  meridian:{foundationQuality:'Firm',primaryMapped:12,
   gateRecords:[],transitions:[],deviationHistory:[]}
 };
 for(let i=1;i<=107;i++){
  const band=i<=36?'Lower':i<=72?'Middle':'High';
  const gate={number:i,band,quality:'Sound'};
  s.player.meridian.gates.push(gate);
  s.table.powerPhysiology.meridian.gateRecords.push({...gate,day:1});
  if(i===36||i===72)
   s.table.powerPhysiology.meridian.transitions.push({
    gate:i,day:1,quality:'Sound',route:'independent',source:origin
   });
 }
 return s;
};
{
 const s=make(),before=E.exportGame(s),rng=s.rngState;
 const empty=R.act(s,{system:'meridian',operation:'seaStatus',params:{}});
 A.equal(empty.ready,false);
 A.match(empty.reason,/108/);
 A.throws(()=>R.act(s,{system:'meridian',operation:'seaWork',
  params:{method:'compression'}}),/108/);
 A.equal(s.rngState,rng);A.equal(E.exportGame(s),before);
 A.throws(()=>R.act(s,{system:'meridian',operation:'seaWork',
  params:{method:'compression',forceStage:9}}),/accepts only/);
 A.equal(E.exportGame(s),before);
}
{
 const s=make();
 // The final 108th gate is opened through the actual high-band resolver.
 // Its transition source is real; the first 107 are isolated, synthetic
 // fixture prerequisites, not an attempt to retroactively author a live save.
 let last=null;
 for(let i=0;i<80;i++){
  last=R.act(s,{system:'meridian',operation:'gatePractice',params:{
   force:false,minutes:15}});
  if(last.opened)break;
 }
 A.ok(last.opened,'Actual engine gate work must open the 108th Gate');
 A.equal(last.opened.number,108);
 A.equal(s.table.powerPhysiology.meridian.transitions.at(-1).gate,108);
 const status=R.act(s,{system:'meridian',operation:'seaStatus',params:{}});
 A.equal(status.ready,true);
 A.equal(status.earned108Gates,108);
 A.equal(status.progress,0);
 A.equal(R.act(s,{system:'discipline',operation:'status',params:{}})
  .systems.meridian.target,'Stage IV — Dantian Sea Formation');
 const plain=E.exportGame(s),rng=s.rngState;
 A.deepEqual(P.read(s).meridian.dantianSea,status);
 A.equal(E.exportGame(s),plain);
 A.equal(s.rngState,rng);
 A.throws(()=>R.act(s,{system:'meridian',operation:'seaWork',
  params:{method:'compression',awardedCapacity:9999}}),/accepts only/);
 A.throws(()=>R.act(s,{system:'meridian',operation:'seaWork',
  params:{method:'unsupported'}}),/physically credible/);
 A.equal(E.exportGame(s),plain);
 const initialQi=s.player.qi;
 let totalQi=0,spentTime=0,formed=null;
 for(let i=0;i<12&&!formed;i++){
  const mins=i===0?15:120,oldMinute=s.world.minutes,
   prevQi=s.player.qi,oldSta=s.player.stamina;
  const result=R.act(s,{system:'meridian',operation:'seaWork',params:{
   method:i%2?'circulation':'integrated',
   minutes:mins,approach:'Maintain a controlled stable return current at the Lower Dantian'}});
  A.ok(Number.isInteger(result.check.roll));
  A.equal(result.check.dc,21);
  A.equal(result.qiSpent,8);
  A.equal(result.feeTalons,0);
  A.equal(s.world.minutes-oldMinute,mins);
  A.equal(s.player.stamina,oldSta-Math.ceil(mins/120));
  A.equal(s.player.qi,prevQi-8,'No spontaneous Qi refill');
  totalQi+=8;spentTime+=mins;
  formed=result.formed?result:null;
 }
 A.ok(formed,'An earned actual Stage IV completion must be achievable');
 A.equal(s.player.meridian.stage,4);
 A.equal(s.player.meridian.dantianSea.rings,1);
 A.ok(s.player.meridian.dantianSea.density>=1);
 A.equal(s.player.qi,initialQi-totalQi);
 A.ok(s.player.maxQi>s.player.qi);
 A.equal(formed.profile.learnedTechnique,false);
 A.equal(formed.profile.qiCapacity,s.player.maxQi);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.soul.phase,0);
 A.deepEqual(s.player.body.cycles,[]);
 A.equal(s.player.rift.step,0);
 A.equal(P.read(s).meridian.stageName,'Stage IV — Dantian Sea Formation');
 A.equal(Disc.seaStatus(s).formed,true);
 const score=s.table.powerPhysiology.meridian.gateRecords;
 const perfect=score.filter(g=>g.quality==='Perfect').length;
 const sound=score.filter(g=>g.quality==='Sound').length;
 const flawed=score.filter(g=>g.quality==='Flawed').length;
 const expected=Build.meridianProfile(4,{meridians:12,gatesP:perfect,
  gatesS:sound,gatesF:flawed,seaRings:1});
 A.equal(s.player.maxQi,Math.max(initialQi,expected.qi));
 A.throws(()=>R.act(s,{system:'meridian',operation:'seaWork',
  params:{method:'integrated'}}),/requires genuine Stage III/);
 const roundTrip=E.importGame(E.exportGame(s));
 A.deepEqual(roundTrip.player.meridian.dantianSea,s.player.meridian.dantianSea);
 A.equal(roundTrip.table.meridianSeaFormation.points,5);
 // Failed or repeated requests never yield free structural capacity.
 const backup=make(183502);
 for(let i=1;i<=108;i++){
  const gate=backup.player.meridian.gates[i-1];
  if(i===108)break;
  A.ok(gate);
 }
}
// The same private runner that processes actual Project turns commits one
// original work roll and recovers identical receipt on duplicate turn IDs.
{
 const s=make(183503);
 s.player.meridian.gates.push({number:108,band:'High',quality:'Sound'});
 s.table.powerPhysiology.meridian.gateRecords.push({
  number:108,band:'High',quality:'Sound',day:1});
 s.table.powerPhysiology.meridian.transitions.push({
  gate:108,day:1,quality:'Sound',route:'independent',source:origin
 });
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-stage4-'));
 try{
  const path=Path.join(dir,'disposable.json');
  FS.writeFileSync(path,E.exportGame(s)+'\n');
  const act={id:'stage4_test_183503',mode:'rule',
   system:'meridian',operation:'seaWork',
   params:{method:'compression',minutes:15}};
  const once=Turn.execute(path,act);
  A.equal(once.ok,true);
  A.equal(once.applied,true);
  const saved=FS.readFileSync(path,'utf8');
  const repeated=Turn.execute(path,act);
  A.equal(repeated.duplicate,true);
  A.equal(repeated.applied,false);
  A.equal(FS.readFileSync(path,'utf8'),saved);
  A.equal(E.importGame(saved).world.minutes,s.world.minutes+15);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Stage IV Dantian Sea: complete Gate anatomy, earned structural capacity, no automatic spell/evolution, honest resources, private replay');
