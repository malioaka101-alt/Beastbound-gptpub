'use strict';
// The original creation.draft dossier becomes the single source for an
// actually practised, character-shaped expression; no universal "Bankai"
// grant, no auto new spell, no fabricated beast form or human evolution.
// All state is disposable and all checks are owned by the existing engine.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 Creation=require('../rules/creation-design'),
 Senses=require('../rules/first-stage-senses'),
 SoulThread=require('../rules/soul-threading'),
 Turn=require('../scripts/chat-turn.js');
const act=(s,system,operation,params={})=>R.act(s,{system,operation,params});
const design=(name,medium='technique',functionName='sense')=>({
 title:name,purpose:'Develop a precise personal manifestation from actually earned self-resonance and carefully measured bodily experience, never unknown creatures or other people’s thoughts.',
 system:'soul',medium,function:functionName,magnitude:0,
 range:'self',area:'single',duration:'instant',
 novelty:'variant',materials:[]
});
function earnedSoul(seed=940003,name='Disposable Reed Soul',background='healer'){
 const s=E.newGame({seed,name,path:'undecided',background});
 R.unified.ensurePlayer(s);
 s.player.attributes.wis=30;s.player.skills.cultivation.rank=5;
 // Use the original Stage I training and honest transition; no client
 // supplied Phase-I witness or direct stage-number edit.
 let attempts=0;
 while(act(s,'discipline','status').systems.soul.progress<
  act(s,'discipline','status').systems.soul.required){
  A.ok(++attempts<90,'Actual Soul I foundational practice must be reachable');
  act(s,'discipline','practice',{
   system:'soul',method:attempts%2?'self-awareness':'resonance',
   minutes:15,route:'independent'});
 }
 const breakthrough=act(s,'discipline','breakthrough',
  {system:'soul',route:'independent'});
 A.equal(breakthrough.outcome,'breakthrough');
 A.equal(s.player.soul.phase,1);
 // The already implemented Soul II code owns the threading checks,
 // structural consequences and original proof in the same character.
 attempts=0;
 while(s.player.soul.phase===1){
  A.ok(++attempts<15,'Independent Phase II threading must succeed with actual ability');
  if(s.player.soul.reserve<2)act(s,'health','sleep',{hours:8});
  act(s,'soul','threadWork',{focus:'integrated',minutes:15,
   approach:'Interlace my existing mind, body and individually witnessed soul resonance without affecting others'});
 }
 A.equal(SoulThread.earned(s).phase,2);
 A.equal(act(s,'soul','perceive').performed,true);
 return s;
}
{
 const raw=E.newGame({seed:940001,name:'No Source',path:'undecided'});
 const p=design('Untrained Starfield');
 const draft=act(raw,'creation','draft',p);
 A.equal(draft.recorded,true);
 const old=E.exportGame(raw),rng=raw.rngState;
 A.throws(()=>act(raw,'creation','personalDevelop',{
  id:draft.id,minutes:15,approach:'Connect the perception pattern to genuine Soul Threading'}),/Soul Threading|genuinely|Phase II/);
 A.equal(E.exportGame(raw),old);A.equal(raw.rngState,rng);
 A.throws(()=>act(raw,'creation','personalUse',{id:draft.id}),/authentic completed/);
 A.equal(E.exportGame(raw),old);
}
{
 const s=earnedSoul(), before=s.player.soul.reserve;
 const plan=design('Stillwater Thread / My Own Echo');
 const prepared=act(s,'creation','draft',plan);
 A.equal(prepared.recorded,true);
 A.equal(prepared.noTechniqueLearned,true);
 const id=prepared.id,original=E.exportGame(s),rng=s.rngState;
 const early=act(s,'creation','personalStatus',{id});
 A.equal(early.expressions.length,1);
 A.equal(early.expressions[0].started,false);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 for(const params of [
  {id,minutes:15,approach:'I win',guaranteed:true},
  {id,minutes:0,approach:'Carefully align my inner rhythm and attention'},
  {id,minutes:15,approach:'Be a legend'},
  {id,minutes:15,approach:'Carefully align my inner rhythm and attention',dc:2},
  {id:'design_999',minutes:15,approach:'Carefully align my inner rhythm and attention'}
 ]){
  A.throws(()=>act(s,'creation','personalDevelop',params));
  A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 }
 let learned=null,used=0;
 for(let i=0;i<8&&!learned;i++){
  if(s.player.soul.reserve<1)act(s,'health','sleep',{hours:8});
  const oldMinutes=s.world.minutes,oldStamina=s.player.stamina,
   oldSoul=s.player.soul.reserve;
  const r=act(s,'creation','personalDevelop',{
   id,minutes:15,approach:'Adapt the inner soul-thread alignment to the exact personal sensitivity learned through my own practice'});
  A.ok(Number.isInteger(r.check.roll));
  A.equal(r.energySpent,1);
  A.equal(r.staminaSpent,1);
  A.equal(r.elapsedMinutes,15);
  A.equal(s.world.minutes,oldMinutes+15);
  A.equal(s.player.stamina,oldStamina-1);
  A.equal(s.player.soul.reserve,oldSoul-1);
  A.equal(r.noInventedPower,true);
  used++;if(r.developed)learned=r;
 }
 A.ok(learned,'An earned genuine phase and well-developed skill produce a real character-specific variation');
 A.equal(learned.usableAdapter,'soul-perception-personal-precision');
 A.equal(learned.characterBasis.character,'Disposable Reed Soul');
 A.equal(learned.characterBasis.background,'healer');
 A.ok(learned.characterBasis.personallyEarnedHistory.some(x=>
  x.earned.includes('Soul Threading')));
 A.ok(learned.characterBasis.trainedSpecialties.some(x=>
  x.skill==='cultivation'&&x.rank===5));
 A.equal(learned.characterBasis.milestone,'Soul Threading');
 A.equal(learned.characterBasis.source.kind,'soul-threading');
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.origin.phase,0);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.arcane.circles,0);
 const status=act(s,'creation','personalStatus',{id});
 A.equal(status.expressions.length,1);
 A.equal(status.expressions[0].completed,true);
 A.equal(status.expressions[0].usableAdapter,'soul-perception-personal-precision');
 A.equal(act(s,'creation','status',{id}).designs.length,1);
 const checkpoint=E.importGame(E.exportGame(s));
 A.equal(Creation.earnedPersonal(checkpoint,id).developmentCompleted,true);
 const noDup=E.exportGame(s),oldRng=s.rngState;
 A.throws(()=>act(s,'creation','personalDevelop',{id,minutes:15,
  approach:'Continue my personally earned pattern alignment'}),/same previously witnessed|Continue the same/);
 A.equal(E.exportGame(s),noDup);A.equal(s.rngState,oldRng);
 // The new signature is not an extra free action. It deliberately invokes
 // ONE original Soul Perception check, at +1 bounded personal precision,
 // costing 3 Soul and one extra physical Stamina.
 const beforeUse={time:s.world.minutes,energy:s.player.soul.reserve,
  stamina:s.player.stamina};
 if(beforeUse.energy<3)act(s,'health','sleep',{hours:8});
 const start=s.world.minutes,energy=s.player.soul.reserve,
  stamina=s.player.stamina;
 const out=act(s,'creation','personalUse',{id});
 A.equal(out.performed,true);
 A.equal(out.energySpent,3);
 A.equal(out.personalExpressionBonus,1);
 A.equal(out.personalExtraStaminaSpent,1);
 A.equal(out.expression.id,id);
 A.equal(out.expression.name,plan.title);
 A.equal(out.check.modifier,
  Math.floor((s.player.attributes.wis-10)/2)+2*s.player.skills.cultivation.rank+2+1);
 A.equal(s.player.soul.reserve,energy-3);
 A.equal(s.player.stamina,stamina-1);
 A.equal(s.world.minutes,start+Senses.SOUL_MINUTES);
 A.equal(out.noNamesRead,true);
 A.equal(out.noBeastMindRead,true);
 A.equal(out.noUnseenCreaturesInvented,true);
 A.equal(out.noAutomaticPartnership,true);
 const unstaged=E.exportGame(s),noRoll=s.rngState;
 A.throws(()=>act(s,'creation','personalUse',{id,modifier:99}),/only an already earned/);
 A.equal(E.exportGame(s),unstaged);A.equal(s.rngState,noRoll);
 const forged=E.importGame(E.exportGame(s));
 forged.table.creationDesigns.records[id].personalDevelopment.attempts[0].earned=9;
 A.throws(()=>Creation.earnedPersonal(forged,id),/authentic completed|original skill checks|genuinely/);
 // A second character's actual history and skill profile gives a distinct
 // source-derived identity even when both choose the same concept name.
 const other=earnedSoul(940004,'Individual Stone Soul','scholar');
 const otherDraft=act(other,'creation','draft',plan);
 const otherResult=act(other,'creation','personalDevelop',{
  id:otherDraft.id,minutes:15,
  approach:'Root the identical proposal in my own previously earned knowledge and soul-thread geometry'});
 A.equal(otherResult.characterBasis.character,'Individual Stone Soul');
 A.equal(otherResult.characterBasis.background,'scholar');
 A.notEqual(otherResult.characterBasis.sourceHash,
  learned.characterBasis.sourceHash,
  'Different people have different original earned provenance');
 A.notDeepEqual(otherResult.characterBasis,
  learned.characterBasis);
}
{
 // An impressive-looking proposed transformation can be personally
 // investigated, but the existing Source does not yet establish its
 // activation fuel, actual anatomy, transformation state or counterplay.
 const s=earnedSoul(940008,'Aspect Researcher','healer');
 const proposal=design('Veiled Reed Aspect','aspect-form','shape');
 proposal.duration='round';
 const pre=act(s,'creation','evaluate',proposal);
 A.ok(pre.gaps.some(x=>x.includes('activation fuel')));
 const d=act(s,'creation','draft',proposal);
 let completed=null;
 for(let i=0;i<9&&!completed;i++){
  if(s.player.soul.reserve<1)act(s,'health','sleep',{hours:8});
  const r=act(s,'creation','personalDevelop',{
   id:d.id,minutes:15,
   approach:'Test how my recorded Soul Threading physiology could sustain a partial form without invented organs'});
  completed=r.developed?r:null;
 }
 A.ok(completed,'Legitimate experimental development is possible without a finished form');
 A.equal(completed.usableAdapter,null);
 const noForm=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'creation','personalUse',{id:d.id}),
  /no established runnable effect/);
 A.equal(E.exportGame(s),noForm);A.equal(s.rngState,rng);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.origin.phase,0);
 A.equal(s.player.soul.phase,2);
}
{
 const s=earnedSoul(940009,'Turn Receipt Soul','healer');
 const d=act(s,'creation','draft',design('Personal Harmony Sense'));
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-personal-creation-'));
 try{
  const save=Path.join(dir,'disposable-soul.json');
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const request={id:'personal_creation_940009',mode:'rule',system:'creation',
   operation:'personalDevelop',params:{id:d.id,minutes:15,
    approach:'Learn a personal echo of my actually developed living soul-body rhythm'}};
  const first=Turn.execute(save,request);
  A.equal(first.ok,true);A.equal(first.applied,true);
  A.ok(Number.isInteger(first.output.rules.check.roll));
  const saved=FS.readFileSync(save,'utf8');
  const duplicate=Turn.execute(save,request);
  A.equal(duplicate.duplicate,true);A.equal(duplicate.applied,false);
  A.equal(FS.readFileSync(save,'utf8'),saved);
  A.equal(E.importGame(saved).world.minutes,s.world.minutes+15);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Existing creation dossier: own character soul/body/skills/history derived signature, real development and no free forms; one bounded earned Soul Perception use and original turn replay');
