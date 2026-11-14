'use strict';
const assert=require('node:assert/strict');
const E=require('../engine');const Rules=require('../rules');
const Mythic=require('../world/mythic');const Realm=require('../world/simulation');const W=require('../rules/world');
const P=Rules.progress;const R=Rules.research;const C=Rules.core;
let assertions=0;const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);assertions++;};const ok=(v,msg)=>{assert.ok(v,msg);assertions++;};
const copy=s=>E.importGame(E.exportGame(s));
const initial=()=>E.newGame({name:'Canon Sandbox',seed:76012,background:'scholar',path:'meridian'});
// Fantasy foundation must be actual mapped, named, culturally connected sites.
eq(Mythic.validate(),{sites:14,traditions:6,realms:5});
for(const site of Mythic.SITES){
 ok(!!site.story&&!!site.magic&&!!site.danger);ok(site.secret!==site.story);
 ok(Mythic.publicLore({type:'site',id:site.id}).name===site.name);
 ok(!JSON.stringify(Mythic.publicLore({type:'site',id:site.id})).includes(site.secret));
}
for(const path of Mythic.REALMS){const p=Mythic.publicLore({type:'realm',id:path.id});ok(!!p.tradition&&!JSON.stringify(p).includes('secret'));}
for(const path of Mythic.TRADITIONS)ok(!!Mythic.publicLore({type:'tradition',id:path.id}).practice);
assert.throws(()=>Mythic.publicLore({type:'site',id:'unknown'}),/No publicly recorded/);assertions++;
const abc=initial(),rnd=abc.rngState;
const pure=Rules.act(abc,{system:'world',operation:'mythic',params:{type:'site',id:'mirrorrush_shrine'}});
ok(pure.publicHistory.includes('water')||pure.publicHistory.includes('Water'));
eq(abc.rngState,rnd);ok(!abc.table?.realm);
// Once the realm is running, mythic sites use their own deterministic environmental ticks.
const a=initial(),b=initial();W.advance(a,366);W.advance(b,366);
eq(a.table.realm.mythic,b.table.realm.mythic);
eq(a.rngState,b.rngState);
eq(Object.keys(a.table.realm.mythic).length,Mythic.SITES.length);
const history=JSON.stringify(a.table.realm);W.finalizeTime(a,480);eq(JSON.stringify(a.table.realm),history);
const seal=Realm.peek(a).mythic.mirrorrush_shrine.seal;ok(seal>=0&&seal<=100);
const source=Realm.publicStatus(a);ok(!JSON.stringify(source).includes('mythic')&&!JSON.stringify(source).includes('secret'));
// Evolution: source-backed readied, one-roll / multi-roll and consent safeguards.
function branch({seed=415,kind='rare',grade=4,years=0,conditions=null,sapience=1,consent=true,documented=false,potential=5,gradeCeiling=5}={}){
 const s=E.newGame({name:'Researcher',seed,path:'meridian'});
 s.beasts.fox={id:'fox',name:'Alba',sapience,consent,trust:79,syncStage:4,condition:100,level:30,evolutionStage:'Base'};
 s.player.partnerIds=['fox'];
 P.register(s,{beastId:'fox',branchId:'moonform',kind,name:'Silverveil Alba',grade,requiredYears:years,potential,gradeCeiling,documented,
  eventStats:{vigor:20,will:20,basis:'Signed witness profile for measured Alba at the clinic'},
  conditions:conditions||[{label:'Lunar catalyst',met:true,known:true}],specialConditionsMet:true,
  formProfile:{species:'silverveil_fox',formName:'Silverveil Alba',speciesGrade:'Rare',individualGrade:'Rare',size:'Small',
   anatomy:['Extended moonlight-responsive ears','New lattice of silver fur beneath the shoulder blades'],
   magicalOrgans:['Moonglass node'],abilities:[{name:'Veil Lantern',effect:'Dim silver field',cost:'3 Essence',limit:'Only at night',source:'Pre-established lunar evolution study'}],
   needs:{diet:'Fish and moon-fed herbs',habitat:'Moonlit wetlands',care:'Sheltered rest after resonance'},levelCap:65,maxHp:55,maxEnergy:40}});
 return {s,r:P.get(s,'fox/moonform')};
}
let z=branch();
ok(P.eventGate(z.s,z.r).eligible);
assert.throws(()=>P.evolutionEvent(z.s,z.r,{source:'Documented rite beside a moonlit sanctum',beastWilling:false}),/consent/);assertions++;
const sourceInput={source:'Observed the Moonveil catalyst rite at the sanctuary',beastWilling:true,care:{}};
const success=P.evolutionEvent(z.s,z.r,sourceInput);
eq(success.outcome,'evolved with bonus pending');eq(success.needed,2);eq(success.rolls.length,3);
ok(z.r.evolved);eq(z.s.beasts.fox.evolutionStage,'Silverveil Alba');eq(z.s.beasts.fox.species,'silverveil_fox');
ok(z.s.beasts.fox.techniques.includes('Veil Lantern'));ok(!success.requiresFormProfile);ok(success.noUnverifiedAbilitiesGranted);
const snap=copy(z.s);eq(snap.table.evolution['fox/moonform'].lastEvent.outcome,z.r.lastEvent.outcome);
assert.throws(()=>P.evolutionEvent(z.s,z.r,sourceInput),/closed or evolved/);assertions++;
// Unknown unmet conditions are sealed: success is impossible even with huge modifiers.
z=branch({grade:2,kind:'hidden',conditions:[{label:'Unrevealed soul condition',met:false,known:false}]});
const blocked=P.evolutionEvent(z.s,z.r,sourceInput);
eq(blocked.outcome,'stalled');ok(!z.r.evolved);ok(!JSON.stringify(blocked).includes('Unrevealed'));
ok(!JSON.stringify(blocked).includes('sealed requirement'));ok(z.r.stalledUntilDay>E.day(z.s));
assert.throws(()=>P.evolutionEvent(z.s,z.r,sourceInput),/later season/);assertions++;
// Stage ceilings cannot come from potential; genuine conditions still matter.
for(const kind of ['standard','environmental','dietary','bond-born']){
 const q=branch({kind,potential:2});eq(P.status(q.r).gate,true);
}
let special=branch({kind:'hidden',potential:2,grade:4,documented:true,
 conditions:[{label:'Fully mastered inherited skill',met:false,known:true}]});
special.r.specialConditionsMet=true;
eq(P.status(special.r).gate,true,'Potential cannot close a branch');
eq(P.status(special.r).ready,false,'An actual unmet known route condition still blocks it');
special.r.conditions[0].met=true;
eq(P.status(special.r).ready,true,'Genuine completion makes the branch ready');
// Low potential now raises the real evolution check instead of prohibiting it.
z=branch();z.r.potential=2;z.r.gradeCeiling=2;const prior=z.s.rngState;
const lowPotential=P.evolutionEvent(z.s,z.r,sourceInput);
ok(lowPotential.rolls.length===3);
ok(z.s.rngState!==prior,'Eligible low-potential beast gets the real roll');
eq(lowPotential.dc,24,'Bounded adaptation strain raises difficulty');
// S2 requires guardian agreement; S3 must personally consent, even if beast.consent=true.
z=branch({sapience:2});assert.throws(()=>P.evolutionEvent(z.s,z.r,sourceInput),/consent/);assertions++;
z=branch({sapience:3});assert.throws(()=>P.evolutionEvent(z.s,z.r,sourceInput),/consent/);assertions++;
const informed=P.evolutionEvent(z.s,z.r,{...sourceInput,informedConsent:true});ok(informed.outcome.startsWith('evolved'));
// Verified Crucible consumes recorded evidence once, without a new roll.
z=branch({years:10});C.event(z.s,'story','Alba defended a hatchling against an actual dangerous flood.',{beastId:'fox'});
const ix=z.s.log.length-1,rng=z.s.rngState;
const c=P.crucible(z.s,z.r,{eventIndex:ix,years:2,source:'The documented flood and defended hatchling'});
eq(c.years,2);eq(z.s.rngState,rng);eq(c.noNewRoll,true);
assert.throws(()=>P.crucible(z.s,z.r,{eventIndex:ix,years:1,source:'The documented flood and defended hatchling'}),/already supported/);assertions++;
// Recognising signs does not expose unknown branch conditions.
z=branch({conditions:[{label:'Undocumented sanctum',met:false,known:false}]});
const sign=P.recogniseSigns(z.s,z.r,{modifier:12,source:'Witnessed pale silver feathers rising during a rite'});
ok(typeof sign.recognised==='boolean');ok(!JSON.stringify(sign).includes('Undocumented'));
// Myth trails: the sealed research truth is established before the check.
const research=initial();research.player.skills.research.rank=3;research.player.coins=100;
R.start(research,{id:'mythpath',title:'The Silverveil Route',kind:'evolution',skill:'research',grade:2,novelty:'rediscovery',leadRank:3,
 truth:{feasibility:'possible',requirements:['Moon-washed stone','An oath willingly kept'],acceptedHypotheses:['silver stones remember moon']}});
const rproj=R.get(research,'mythpath');
const first=R.mythLead(research,{id:'mythpath',sourceId:'moon_ledger',sourceKind:'temple record',source:'Verified record copied from the old riverside sanctuary',modifier:50,dc:15});
eq(first.preparation,3);eq(first.clues.length,2);
assert.throws(()=>R.mythLead(research,{id:'mythpath',sourceId:'moon_ledger',sourceKind:'temple record',source:'Same old riverside sanctuary ledger',modifier:0}),/already been surveyed/);assertions++;
const publicProject=R.publicCard(rproj);ok(!Object.hasOwn(publicProject,'truth'));ok(!Object.hasOwn(publicProject,'sealedFalseLeads'));
const bad=R.mythLead(research,{id:'mythpath',sourceId:'bad_tale',sourceKind:'myth',source:'An unreliable merchant told a detailed but vague legend',modifier:-60});
ok(!Object.hasOwn(bad,'hasSealedFalseLead'));ok(!JSON.stringify(R.publicCard(rproj)).includes('sealedFalseLead'));
console.log('Fantasy canon & Evolution house-rule tests passed: '+assertions+' assertions');