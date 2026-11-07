'use strict';
// Independent behavioural regression vectors from uploaded bb_selftest.py and
// published Table Rules; tests never import or run Python source in production.
const A=require('node:assert/strict');
const E=require('../engine.js'),R=require('../rules'),Combat=require('../rules/combat');
const one=seed=>E.newGame({name:'Test',seed});
for(const [margin,word] of [[10,'exceptional'],[-5,'failure'],[-10,'severe failure']])A.equal(R.core.degree(margin),word);
for(const [value,t,expected] of [[6,7,1],[12,7,3],[22,7,5]])A.equal(Combat.severity(value,t),expected);
const s=one(17),c=Combat.makeCombatant({name:'Dummy',toughness:7,defense:14,vigor:2,stamina:10});
for(let i=0;i<3;i++)Combat.harm(s,c,3);
A.deepEqual(c.wounds,[0,2,1]);A.equal(Combat.penalty(c),4);
const m=Combat.contestForce(s,{a:{modifier:0,magnitude:3},b:{modifier:10,magnitude:0}});
A.deepEqual({winner:m.winner,rolled:m.rolled},{winner:'a',rolled:false});
A.equal(Combat.contestForce(s,{a:{modifier:20,magnitude:0},b:{modifier:5,magnitude:2}}).winner,'b');
const wrd=Combat.makeCombatant({name:'Ward',toughness:5,defense:1,ward:{steps:12,magnitude:2}});
const combat=one(900000);Combat.register(combat,{id:'ward',name:'Ward',toughness:5,defense:1,ward:{steps:12,magnitude:2}});
const hit=Combat.attack(combat,{targetId:'ward',modifier:30,damage:20,brace:false});
A.equal(hit.hit,true);A.equal(hit.severity,0);A.equal(Combat.get(combat,'ward').wounds.reduce((a,b)=>a+b,0),0);
A.equal(wrd.ward.steps,12); // stat fixture independent of recorded encounter
// Critical and fizzle never roll again from the same invocation.
const na=one(91);for(let i=0;i<100;i++){const r=R.core.check(na,{modifier:0,dc:15});A.equal(r.total,r.roll+r.naturalBonus);if(r.roll===20)A.equal(r.naturalBonus,5);if(r.roll===1)A.equal(r.naturalBonus,-5);}
// Reference bond-start and contract/synchronisation vectors.
const Bond=R.bonds;
const sorrel=Bond.create({human:'Reference Handler',beast:'Reference Beast',start:'won_by_trust',years:1,sapience:1});
for(const [field,want] of Object.entries({trust:33,familiarity:25,affection:21,respect:24,loyalty:15,communication:15,coordination:6,sharedExperience:4,willingness:53}))A.equal(sorrel[field],want,field);
A.equal(Bond.contractLoad(3,1,'standard'),2);
A.equal(Bond.contractLoad(3,3,'deep'),4);
const gentle=Bond.create({human:'H',beast:'B',sapience:2,start:'won_by_trust'});
A.equal(Bond.seal(one(995000),gentle,{grade:1,will:4,beastWilling:true}).sealed,false);
A.equal(Bond.communicationCap(1,{beastHandlingRank:3,contractDepth:'standard'}),80);
Bond.applyEvent(gentle,'respected_refusal');A.equal(gentle.willingness,53);
const tooYoung=Bond.syncReadiness(gentle,2);A.equal(tooYoung.numericReady,false);A.equal(tooYoung.externallyVerified,false);
// Representative derived statistic and spell/technique budgets from the reference self-test.
const Build=R.build;
for(const [a,size,hide,evasion,level,grade,attackAttr,weaponBonus,expected] of [
  [{might:2,agility:3,vigor:2,wits:3},'Medium',1,1,12,2,'agility',0,[7,14,7,5]],
  [{might:4,agility:3,vigor:4,wits:3},'Large',1,1,24,3,'agility',0,[10,13,9,7]],
  [{might:5,agility:4,vigor:5,wits:4},'Large',2,1,40,4,'agility',1,[12,14,12,8]],
  [{agility:3,vigor:1,wits:2},'Small',1,1,12,2,'agility',0,[5,15,7,3]],
  [{might:4,agility:0,vigor:4},'Large',2,0,14,2,'might',0,[11,9,8,7]],
  [{might:7,agility:4,vigor:7,wits:5},'Gargantuan',4,0,85,6,'agility',2,[18,10,14,13]]
]){
 const z=Build.beastStats(a,size,hide,evasion,level,grade,{attackAttr,weaponBonus});
 A.deepEqual([z.toughness,z.defense,z.attack,z.damage],expected);
}
const wrenProfile=Build.meridianProfile(2,{meridians:12});
const wren=Build.humanStats({agility:2,vigor:1,attunement:1,wits:2,presence:1},{skills:{Melee:1,Awareness:2},armourT:1,bonuses:wrenProfile.bonuses});
A.deepEqual([wren.stamina,wren.toughness,wren.defense,wren.initiative,wren.bondCapacity,wren.soulStability,wrenProfile.qi,wrenProfile.flow,wrenProfile.recovery],
 [11,6,13,4,2,10,16,2,5]);
for(const [p,qi] of [
 [{stage:3,gatesP:4,gatesS:32},38],
 [{stage:3,gatesP:10,gatesS:62},62],
 [{stage:3,gatesP:12,gatesS:96},82]])A.equal(Build.meridianProfile(p.stage,p).qi,qi);
A.equal(Build.meridianProfile(3,{gatesS:36}).flow,4);
A.equal(Build.meridianProfile(3,{gatesS:108}).reinforcement.magnitude,2);
A.equal(Build.meridianProfile(4,{gatesS:108}).burst.magnitude,3);
A.equal(Build.meridianProfile(5,{gatesS:108,seaRings:3,extraordinary:8,webComplete:true}).reinforcement.magnitude,3);
for(const [name,p,expected] of [
 ['Spark',{family:'strike',damage:4},[0,1,0,0]],
 ['Ember Dart',{family:'strike',damage:6,rng:'close'},[2,2,1,1]],
 ['Frost Snare',{family:'bind',rng:'close',conditions:1},[4,4,2,2]],
 ['Kinetic Shove',{family:'move',rng:'close',magnitude:1},[4,6,2,2]],
 ['Arc Lance',{family:'strike',damage:6,rng:'close',magnitude:1},[4,6,2,2]],
 ['Ward II',{family:'ward',duration:'1min',magnitude:1},[4,6,2,2]],
 ['Mending Touch',{family:'mend_light'},[3,3,2,2]],
 ['Glide',{family:'move',duration:'10min'},[3,3,2,2]],
 ['Seeing Thread',{family:'sense',rng:'medium',duration:'10min'},[5,5,3,3]],
 ['Fogbank',{family:'shape',area:'10m',duration:'1min'},[6,6,3,3]],
 ['Heat Siphon',{family:'analogue',analogueTier:2,rng:'close',conditions:1},[5,8,3,3]],
 ['Fireburst',{family:'strike',damage:8,rng:'medium',area:'3m',magnitude:1},[8,10,4,4]],
 ['Stone Lance',{family:'strike',damage:8,rng:'medium',magnitude:2},[8,13,4,4]],
 ['Ward IV',{family:'ward',duration:'1min',magnitude:2},[6,11,3,4]],
 ['Siege Lance',{family:'strike',damage:8,rng:'medium',magnitude:3},[11,21,6,6]],
 ['Bastion Ward',{family:'ward',duration:'1min',magnitude:3},[9,19,5,6]],
 ['Starfall Rite',{family:'strike',damage:12,rng:'extreme',area:'100m',magnitude:6,speed:'ritual',worldCircuit:true},[33,83,17,9]]
]){
 const x=Build.spellCost(p);A.deepEqual([x.complexity,x.mana,x.load,x.minCircle],expected,name);
}
for(const [params,want] of [
 [{damage:7,riders:1},4],[{damage:6,rng:'medium',projectionM:1},5],
 [{damage:4,riders:1},3],[{area:'3m',riders:1},6],
 [{damage:8,rng:'long',projectionM:2},11]])A.equal(Build.qiTechniqueCost(params),want);
A.equal(Build.evolutionWeight({meridianStage:5,gates:108,webComplete:true,bodyCycles:2}).total,14);
A.equal(Build.integrationCapacity(3,2,'Refined'),9);
A.equal(Build.rejectionDC(4,5,4),19);
// Exact progression-rate table from 01a reference self-test.
for(const [modifier,targets] of [
 [6,[1.8,1.5,1.2,.9,.7,.5,.3,.2,.1,.05,.05]],
 [10,[2.3,2.1,1.8,1.5,1.2,.9,.7,.5,.3,.2,.1]],
 [14,[2.7,2.5,2.3,2.1,1.8,1.5,1.2,.9,.7,.5,.3]]]){
 for(let i=0;i<targets.length;i++)A.ok(Math.abs(R.progress.expectedRate(modifier,10+2*i)-targets[i])<.0001);
}
A.equal(Math.round((36*(3/R.progress.expectedRate(10,13)+5/R.progress.expectedRate(10,16)+8/R.progress.expectedRate(10,19))/48)*10)/10,9.4);
A.equal(R.progress.trainingPP({currentRank:3,teacherRank:4}),2);
A.equal(R.progress.xpToNext(1,'Fast'),8); // Python ties-to-even at 7.5 -> 8
A.equal(R.progress.xpToNext(3,'Fast'),22); // 22.5 -> 22
const World=R.world;
A.equal(World.dateText(World.addDate({year:1147,month:9,day:3},30)),'3 Leaffall 1147 AC');
A.equal(World.dateText(World.addDate({year:1147,month:12,day:30},1)),'Concord Day 1 1147 AC');
A.equal(World.dateText(World.addDate({year:1147,month:13,day:5},1)),'1 Deepfrost 1148 AC');
A.equal(World.coinText(1234),'12T 3F 4S');A.equal(World.concordRating(1000,1000,1,{ratedResults:0}),1020);
A.equal(World.concordTier(1450),'Gold');
// Private turn runner integration and idempotency on an in-memory disposable save.
const FS=require('node:fs'),OS=require('node:os'),PATH=require('node:path');
const Turn=require('../scripts/chat-turn.js');
const tmp=FS.mkdtempSync(PATH.join(OS.tmpdir(),'bb-ref-'));
const tmpSave=PATH.join(tmp,'test.json');
try{
 const state=one(900000);
 // Synthetic, precommitted grade evidence is confined to this disposable
 // fixture; the Project engine cannot invent a numeric Grade from "Common".
 state.beasts.sample={id:'sample',name:'Sample Beast',species:'fenfox',evolutionStage:'Base',
  individualGrade:'Common',sapience:2,contractGradeAssessment:{
   grade:2,species:'fenfox',evolutionStage:'Base',individualGrade:'Common',
   source:'Signed individual Grade II assessment by licensed registrar',worldMinute:state.world.minutes
  },contractConsentEvidence:{
   beastId:'sample',sapience:2,depth:'standard',species:'fenfox',evolutionStage:'Base',
   worldMinute:state.world.minutes,source:'Witnessed animal willingness pending guardian approval',
   beastWilling:true,guardianConsent:false,informedConsent:false
  },bondHistoryAssessment:{
   beastId:'sample',sapience:2,species:'fenfox',evolutionStage:'Base',
   start:'won_by_trust',years:0,worldMinute:state.world.minutes,
   source:'Pre-committed record of past mutual trust from witnessed care'
  }};
 state.player.attributes.wis=20;
 state.player.skills.contractLore={rank:5,xp:0};
 FS.writeFileSync(tmpSave,E.exportGame(state)+'\n');
 const exec=(id,system,operation,params)=>Turn.execute(tmpSave,{id,mode:'rule',system,operation,params});
 // The old raw combat calculations remain mathematical reference vectors,
 // but are no longer playable turns that mutate a campaign with arbitrary damage.
 const referenceGame=E.importGame(FS.readFileSync(tmpSave,'utf8'));
 Combat.register(referenceGame,{id:'dummy',name:'Training dummy',toughness:5,
  defense:1,ward:{steps:10,magnitude:2}});
 const expectedHit=Combat.attack(referenceGame,{targetId:'dummy',modifier:50,damage:15,brace:false});
 A.equal(expectedHit.hit,true);
 const snap=FS.readFileSync(tmpSave,'utf8');
 A.throws(()=>exec('ref_combat_register_001','combat','register',{
  id:'dummy',name:'Training dummy',toughness:5,defense:1}),/Raw combatant registration/);
 A.throws(()=>exec('ref_combat_hit_001','combat','attack',{
  targetId:'player',modifier:50,damage:15,brace:false}),/Direct attack calculations/);
 A.equal(FS.readFileSync(tmpSave,'utf8'),snap);
 let got=exec('ref_bond_register_001','bond','register',{beastId:'sample',start:'won_by_trust'});
 A.equal(got.applied,true);
 // The test state contains separately committed Grade II evidence and a
 // trained Contract Lore skill. The rule caller cannot invent either.
 const ref=exec('ref_bond_seal_001','bond','seal',{beastId:'sample',grade:2,beastWilling:true,guardianConsent:false});
 A.equal(ref.output.rules.sealed,false);
 A.equal(E.importGame(FS.readFileSync(tmpSave,'utf8')).player.partnerIds.includes('sample'),false);
 // Fixture adjudication: the lawful guardian later explicitly agrees to
 // this particular contract. The caller alone cannot set this consent.
 const withConsent=E.importGame(FS.readFileSync(tmpSave,'utf8'));
 withConsent.beasts.sample.contractConsentEvidence.guardianConsent=true;
 withConsent.beasts.sample.contractConsentEvidence.source='Witnessed direct assent of the protected beast and lawful guardian';
 FS.writeFileSync(tmpSave,E.exportGame(withConsent)+'\n');
 got=exec('ref_bond_seal_002','bond','seal',{beastId:'sample',grade:2,contractLore:10,beastWilling:true,guardianConsent:true});
 A.equal(got.output.rules.sealed,true);
 A.equal(E.importGame(FS.readFileSync(tmpSave,'utf8')).player.partnerIds.includes('sample'),true);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}

// A spell must pay Mana for each legal cast, including fizzles (one roll only).
const fizzled=one(900000);
fizzled.player.mana=40;
Combat.register(fizzled,{id:'spell_dummy',name:'Spell Dummy',toughness:7,defense:1});
const spellResult=Combat.attack(fizzled,{targetId:'spell_dummy',modifier:11,damage:4,castingDC:21,manaCost:13});
A.equal(spellResult.fizzle,'setback');
A.equal(spellResult.manaSpent,6);A.equal(fizzled.player.mana,34);
A.throws(()=>Combat.attack(fizzled,{targetId:'spell_dummy',modifier:11,damage:4,castingDC:21}),/Mana cost/);
const patient=one(42);
Combat.register(patient,{id:'patient',name:'Patient',toughness:6,defense:10});
Combat.get(patient,'patient').wounds=[1,1,0];
const before=patient.world.minutes;
Combat.rest(patient,{id:'patient',nights:1,weeks:1});
A.equal(patient.world.minutes-before,7*1440);
A.deepEqual(Combat.get(patient,'patient').wounds,[0,0,0]);
const broken=Bond.create({human:'H',beast:'B',start:'captured'});
Bond.weeklyCare(broken,'neglected');A.equal(broken.fractured,false);
Bond.weeklyCare(broken,'neglected');A.equal(broken.fractured,true);
console.log('Python-source reference tests passed: natural rolls, wounds, Wards, stats, costs, bonds, progression, calendar and live-turn replay');