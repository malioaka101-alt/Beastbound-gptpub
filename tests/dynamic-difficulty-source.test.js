'use strict';
// Source-bound dynamic difficulty regression. Disposable worlds only.
const A=require('node:assert/strict');
const E=require('../engine'),R=require('../rules');
const D=require('../rules/dynamic-difficulty');
const New=require('../scripts/new-campaign'),Realm=require('../world/simulation');
function character(){
 const s=E.newGame({seed:775201,name:'Difficulty Fixture',path:'soul'});
 R.unified.ensurePlayer(s);
 return s;
}
{
 const s=character(),person={actorId:'origin-kin:kin_1'};
 const standard=D.householdWork(s,{person});
 const careful=D.householdWork(s,{person,approach:'careful'});
 const rushed=D.householdWork(s,{person,approach:'rushed'});
 A.equal(standard.dc,12);
 A.equal(standard.minutes,120);
 A.equal(careful.dc,10);
 A.equal(careful.minutes,180);
 A.equal(careful.staminaCost,3);
 A.equal(rushed.dc,14);
 A.equal(rushed.minutes,60);
 A.equal(rushed.staminaCost,2);
 A.throws(()=>D.householdWork(s,{person,approach:'magic-easy'}),/Unsupported/);
 const tired=structuredClone(s);
 tired.player.stamina=Math.floor(tired.player.maxStamina/3);
 A.equal(D.householdWork(tired,{person}).dc,14);
 tired.player.stamina=0;
 A.equal(D.householdWork(tired,{person}).dc,15);
 A.equal(D.householdWork(tired,{person,approach:'careful'}).dc,13);
}
{
 const s=character();
 const blank={methods:{},sessionMinutes:0};
 const dc=D.disciplinePractice(s,{system:'soul',method:'self-awareness',
  record:blank,baseDC:12,short:true,independent:true});
 A.equal(dc.dc,14,'Existing early independent practice base difficulty retained');
 A.equal(dc.factors.filter(x=>x.id==='independent-or-brief-route').length,1,
  'Short independent sessions cannot stack the same +2 surcharge');
 A.equal(D.disciplinePractice(s,{system:'soul',method:'self-awareness',
  record:{methods:{'self-awareness':2},sessionMinutes:240},
  baseDC:12,short:true,independent:true}).dc,13,
  'Real continuing method familiarity changes resistance');
 A.equal(D.disciplinePractice(s,{system:'soul',method:'self-awareness',
  record:{methods:{'self-awareness':6},sessionMinutes:960},
  baseDC:12,short:true,independent:true}).dc,12);
 A.equal(D.disciplinePractice(s,{system:'soul',method:'identity-ward',
  record:{methods:{'self-awareness':9},sessionMinutes:1200},
  baseDC:12,short:true,independent:true}).dc,14,
  'Experience from a different method must not transfer as an automatic discount');
 const drained=structuredClone(s);
 drained.player.stamina=1;
 A.equal(D.disciplinePractice(drained,{system:'soul',method:'self-awareness',
  record:blank,baseDC:12,short:true,independent:true}).dc,17);
 const x=R.act(s,{system:'discipline',operation:'practice',
  params:{system:'soul',method:'self-awareness',minutes:120,partTime:true}});
 A.equal(x.difficulty.baseDC,12);
 A.equal(x.difficulty.dc,14);
 A.equal(x.check.dc,x.difficulty.dc);
 A.equal(x.elapsedMinutes,120);
 A.equal(x.difficulty.sourceBound,true);
}
function householdFixture(seed){
 let s,person;
 for(let candidate=seed;candidate<seed+60;candidate++){
  s=New.create({seed:candidate,slug:'dynamic_dc_household_fixture',mode:'guided',
   age:10,homeRegion:'morrowfen_basin',originKind:'ordinary',
   startLocation:'crossing'}).state;
  person=Realm.ensure(s).originKin?.people?.kin_1;
  if(person)break;
 }
 A.ok(person,'A genuinely generated seeded household relative exists');
 R.act(s,{system:'world',operation:'establishPlace',params:{
  placeId:'dynamic_work_cottage',name:'Dynamic Work Cottage',
  regionId:s.campaign.origin.birthRegionId,kind:'family cottage',
  sceneType:'settlement',
  description:'A source-established family workbench for actual ordinary sorting and fitting work.',
  culture:'A family home with ordinary consensual tasks and practical lessons.'
 }});
 s.world.location='dynamic_work_cottage';
 s.chatRuntime.scene='At the family cottage, '+person.name+
  ' is actually present and independently considers ordinary family chores.';
 return {s,person};
}
for(const approach of ['standard','careful','rushed']){
 const {s,person}=householdFixture(775400+['standard','careful','rushed'].indexOf(approach));
 const start=s.world.minutes,sta=s.player.stamina;
 const args={npcId:person.actorId,
  purpose:'Sort the existing family harnesses and check each ordinary buckle',
  approach};
 const before=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'social',operation:'householdWork',
  params:{...args,chosenDC:2}}),/witnessed family member/);
 A.equal(E.exportGame(s),before,'Caller-selected DC rejected without change');
 const output=R.act(s,{system:'social',operation:'householdWork',params:args});
 A.equal(output.approach,approach);
 const receipt=s.table.householdWork.records.at(-1).proof;
 A.equal(receipt.approach,approach);
 A.equal(receipt.paidTalons,output.paidTalons);
 if(output.accepted){
  const expected=D.WORK_APPROACHES[approach];
  A.equal(output.difficulty.dc,12+expected.dc);
  A.equal(output.check.dc,output.difficulty.dc);
  A.equal(s.world.minutes,start+expected.minutes);
  A.equal(s.player.stamina,sta-expected.stamina);
  A.deepEqual(receipt.difficulty,output.difficulty);
 }else{
  A.equal(s.world.minutes,start+5);
  A.equal(s.player.stamina,sta);
  A.equal(output.paidTalons,0);
 }
}
console.log('Source-owned dynamic DC: real work-time tradeoffs, stamina, earned method familiarity, original checks and no caller DC');
