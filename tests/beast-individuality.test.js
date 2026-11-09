'use strict';
// #05 disposable original-beast encounters, not campaign fixtures.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),Rules=require('../rules'),
 Time=require('../rules/world'),Individual=require('../world/beast-individuality'),
 Learn=require('../world/beast-ecological-learning'),
 Sapient=require('../world/sapient-beast-persons'),
 Turn=require('../scripts/chat-turn');
const op=(s,operation,params={})=>Rules.act(s,{system:'world',operation,params});
function animal(seed=949002){
 const s=E.newGame({name:'Independent Ecology Source',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 for(let i=0;i<90;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId],sp=E.SPECIES[b.species];
  if(!s.encounter.threat&&sp.intelligence!=='sapient'&&
   !(Number.isInteger(b.sapience)&&b.sapience>=3)&&
   !/terrified|panicked|hostile|fleeing/i.test(b.mood))return {s,b};
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 throw Error('No original, peaceful independently observed wild animal');
}
function sapient(seed=963202){
 const s=E.newGame({name:'Sapient Evidence Source',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 for(let i=0;i<150;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId],sp=E.SPECIES[b.species];
  if(sp.intelligence==='sapient'&&!s.encounter.threat&&
    !/hostile|agitated|panicked|terrified|fleeing/i.test(b.mood))return {s,b};
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 throw Error('No original peaceful, sapient beast encounter');
}
const {s,b}=animal();
const coin=s.player.coins,baseline=JSON.stringify(b.techniques),
 level=b.level,grade=b.individualGrade,playerDice=s.rngState;
A.throws(()=>op(s,'beastTechniqueRecord',{beastId:b.id}),/requires|source|field|unique/i);
A.throws(()=>op(s,'beastIndividualObserve',{beastId:b.id,
 category:'distinct-voice',description:'Its call has an irregular echo in the thicket.',
 basis:'No original individual behaviour has yet been watched.'}),/observed individual action/);
const observed=op(s,'watchWildBeast');
A.equal(observed.watched,true);
A.equal(Individual.verify(b),true);
const note={beastId:b.id,category:'visible-movement',
 description:'Its particular watchful turn and pause distinguish this forest animal from others.',
 basis:'A documented direct behavioural watch of this exact individual in the forest.',
 visibility:'gm-only'};
A.equal(op(s,'beastIndividualObserve',note).recorded,true);
A.throws(()=>op(s,'beastIndividualObserve',note),/already recorded/);
const hidden=op(s,'beastIndividualStatus',{beastId:b.id});
A.equal(hidden.known,true);A.deepEqual(hidden.observations,[]);
A.deepEqual(hidden.techniques,[]);
const old=E.exportGame(s);
A.deepEqual(op(s,'beastIndividualStatus',{beastId:b.id}),hidden);
A.equal(E.exportGame(s),old,'Read-only personal history should not alter an engine save');
if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
Time.advance(s,360);
A.equal(Individual.verify(b),true);
const successes=b.individualLife.ecologicalLearning?.receipts.filter(x=>x.source.success)||[];
A.ok(successes.length,'Independent actual ecological achievements must exist');
const proof=successes[0];
const tech={beastId:b.id,methodId:'forest-thread-step',
 name:'Threadstep Forage',
 principle:'This particular beast follows narrow low-cover feeding paths learned by repetition.',
 activation:'Chosen when independently searching for forest food.',
 limit:'Only supports an already successful ordinary forage without gaining stealth or battle damage.',
 counter:'Broken trails and habitat loss disrupt the movement.',
 environment:'Real accessible suitable wooded foraging cover.',
 application:proof.source.skill,energyCost:2,cooldownDays:6,receiptHash:proof.hash,
 visibility:'gm-only'};
A.equal(op(s,'beastTechniqueRecord',tech).recorded,true);
A.equal(Individual.verify(b),true);
A.throws(()=>op(s,'beastTechniqueRecord',tech),/already learned/);
A.throws(()=>op(s,'beastTechniqueRecord',{...tech,methodId:'free-soul-power',
 receiptHash:'a'.repeat(64)}),/verified successful individual field action/);
const noReveal=op(s,'beastIndividualStatus',{beastId:b.id});
A.equal(noReveal.techniques.length,0,'A secretly developed technique cannot leak remotely');
A.equal(JSON.stringify(b.techniques),baseline,
 'Individual ecological technique never becomes an unearned species combat attack');
A.equal(b.level,level);A.equal(b.individualGrade,grade);
A.equal(s.player.coins,coin);A.equal(s.rngState,playerDice,
 'Independent long time does not spend player dice');
const beforeMore=E.exportGame(s),parallel=E.importGame(beforeMore);
Time.advance(s,240);Time.advance(parallel,240);
A.deepEqual(s.beasts[b.id],parallel.beasts[b.id]);
A.equal(Individual.verify(b),true);
const uses=b.individualLife.individuality.entries.filter(x=>x.source.type==='express');
A.ok(uses.every(x=>x.source.beforeEnergy-x.source.afterEnergy===x.source.energyCost));
A.ok(uses.every(x=>x.source.benefit===2));
A.equal(JSON.stringify(b.techniques),baseline);
A.equal(b.level,level);A.equal(b.individualGrade,grade);
if(uses.length)A.ok(uses.every(x=>x.source.day>=0));
const more=b.individualLife.ecologicalLearning.receipts.filter(x=>
 x.source.success&&x.source.skill===proof.source.skill&&x.hash!==proof.hash);
if(more.length){
 A.equal(op(s,'beastTechniqueDevelop',{beastId:b.id,
  methodId:tech.methodId,receiptHash:more[0].hash}).recorded,true);
 A.throws(()=>op(s,'beastTechniqueDevelop',{beastId:b.id,
  methodId:tech.methodId,receiptHash:more[0].hash}),/cannot strengthen|twice/);
}
const clone=E.importGame(E.exportGame(s));
A.equal(Individual.verify(clone.beasts[b.id]),true);
const tampered=E.importGame(E.exportGame(s));
tampered.beasts[b.id].individualLife.individuality.entries[0].source.description='False memory';
A.equal(Individual.verify(tampered.beasts[b.id]),false);
const wrong=E.importGame(E.exportGame(s));
wrong.beasts[b.id].individualLife.individuality.entries.find(x=>x.source.type==='learn')
 .source.energyCost=0;
A.equal(Individual.verify(wrong.beasts[b.id]),false);
const {s:personS,b:person}=sapient();
A.equal(Rules.act(personS,{system:'social',operation:'meetSapientBeast',params:{}}).encountered,true);
A.equal(Sapient.verify(person),true);
A.equal(op(personS,'beastIndividualObserve',{beastId:person.id,
 category:'first-contact',description:'This individual responded to the contact without promising any future cooperation.',
 basis:'A witnessed autonomous response from an actual independently encountered sapient person.',
 visibility:'gm-only'}).recorded,true);
A.equal(Individual.verify(person),true);
A.throws(()=>op(personS,'beastTechniqueRecord',{
 ...tech,beastId:person.id}),/wild ecological learning cannot|field action is required|wild ecological/i);
A.deepEqual(op(personS,'beastIndividualStatus',{beastId:person.id}).observations,[]);
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-individual-'));
try{
 const path=Path.join(dir,'save.json'),fixture=animal(949002);
 op(fixture.s,'watchWildBeast');
 const id=fixture.b.id;
 FS.writeFileSync(path,E.exportGame(fixture.s)+'\n');
 const snap=FS.readFileSync(path,'utf8');
 const read=Turn.execute(path,{id:'indiv_read_0001',mode:'rule',
  system:'world',operation:'beastIndividualStatus',params:{beastId:id}});
 A.equal(read.applied,false);A.equal(FS.readFileSync(path,'utf8'),snap);
 const req={id:'indiv_note_0001',mode:'rule',system:'world',
  operation:'beastIndividualObserve',
  params:{...note,beastId:id}};
 A.equal(Turn.execute(path,req).applied,true);
 const saved=FS.readFileSync(path,'utf8');
 A.equal(Turn.execute(path,req).duplicate,true);
 A.equal(FS.readFileSync(path,'utf8'),saved);
 A.equal(Individual.verify(E.importGame(saved).beasts[id]),true);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Individuality: original beast witness, open GM-authored traits, earned animal-specific techniques, energy cost and cooldown, autonomous expression, independent beast persons, no secret leak or free combat powers, tamper rejection and exact saved-turn replay.');
