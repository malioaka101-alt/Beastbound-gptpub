'use strict';
// #177: source parity for the REAL individual who completed the first
// Muscle–Tendon Cycle; never title, occupation or unverified journal gain.
// The disposable source-replayed training fixture is shared with its actual
// original independent rite test. Current stage itself is not simulated.
const A=require('node:assert/strict'),
 E=require('../engine.js'),Rules=require('../rules'),
 Realm=require('../world/simulation'),Combat=require('../rules/combat'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Body=require('../rules/independent-original-body-combat'),
 PC=require('../rules/player-combat-action'),
 {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const {s,p,c}=fixture('body','breakthrough',972800);
const actorId=p.actorId,combatantId='npc_'+p.id,
 originalAttributes=structuredClone(p.mechanicalFoundation.baselineAttributes),
 action=(attribute,offM=0)=>({attribute,attackBonus:1,offM,
  damage:4,kind:'mundane',canNonlethal:true,
  id:'ordinary_source_approved_training_staff'});
const before=E.exportGame(s);
const oldStr=Body.profile(s,{actorId,combatantId,action:action('str')});
A.equal(oldStr.modifier,
 Math.floor((originalAttributes.str-10)/2)+1);
A.equal(oldStr.offM,0);
A.equal(oldStr.privateEarnedBodyForceM,0);
A.equal(E.exportGame(s),before,'Untrained read must not roll, mint or spend');
const rite=Rules.act(s,{system:'discipline',
 operation:'npcOriginalFirstMilestone',params:{actorId,system:'body'}});
A.equal(rite.observedOutcome,'breakthrough');
A.equal(Early.verify(s,p),true);
A.equal(c.offM,1);
const stage=p.originalFirstPowerMilestones.body;
A.equal(stage.naturalStrengthIncrease,1);
A.equal(stage.maxStaminaAfter,c.maxStamina);
const after=E.exportGame(s),rng=s.rngState,privateRng=p.rngState;
const str=Body.profile(s,{actorId,combatantId,action:action('str')});
A.equal(str.modifier,
 Math.floor((originalAttributes.str+1-10)/2)+1,
 'One original earned Strength improvement, not a fictional skill rank');
A.equal(str.offM,1,'First original Muscle-Tendon Cycle is M1 physical force');
A.equal(str.privateEarnedBodyForceM,1);
A.equal(str.extraDice,0);
A.equal(str.noWeaponScaleStacking,true);
A.equal(str.originalSource,'rules/player-combat-action.js:profile');
const dex=Body.profile(s,{actorId,combatantId,action:action('dex')});
A.equal(dex.modifier,Math.floor((originalAttributes.dex-10)/2)+1,
 'Body force never upgrades an Agility/Dexterity action');
A.equal(dex.offM,0,'M1 force applies only to real Strength attacks');
A.equal(dex.privateEarnedBodyForceM,0);
const strongerWeapon=Body.profile(s,{actorId,combatantId,action:action('str',2)});
A.equal(strongerWeapon.offM,2,'Magnitude is source max(M2 weapon,M1 body), not M3');
A.equal(s.rngState,rng,'No extra combat RNG is ever consumed by source profile');
A.equal(p.rngState,privateRng,'No extra personal decision or training attempt');
A.equal(E.exportGame(s),after,'Original combat profile must be a read-only projection');
A.deepEqual(p.mechanicalFoundation.baselineAttributes,originalAttributes,
 'Original birth attributes must never be rewritten as earned Strength');
A.equal(s.player.body?.cycles?.includes('Muscle-Tendon Cycle')||false,false,
 'A separate independent human achievement never upgrades the player');
const original=E.importGame(before),
 originalPerson=Realm.peek(original).emergentPeople.people[p.id];
A.equal(Early.verify(original,originalPerson),true);
A.equal(Body.profile(original,{actorId,combatantId,action:action('str')}).offM,0,
 'The same individual before their actual rite has no supernatural force');
const replay=E.importGame(after),
 replayPerson=Realm.peek(replay).emergentPeople.people[p.id],
 replayProfile=Body.profile(replay,{actorId,combatantId,action:action('str')});
A.equal(Early.verify(replay,replayPerson),true);
A.deepEqual(replayProfile,str);
const forged=E.importGame(after),
 fake=Realm.peek(forged).emergentPeople.people[p.id];
fake.originalFirstPowerMilestones.body.naturalStrengthIncrease=4;
A.equal(Early.verify(forged,fake),false);
A.throws(()=>Body.profile(forged,{actorId,combatantId,action:action('str')}),
 /original earned independent Body Cycle combat evidence is not replayable/);
const alteredBody=E.importGame(after),altered=Combat.get(alteredBody,combatantId);
altered.maxStamina+=8;
A.throws(()=>Body.profile(alteredBody,{actorId,combatantId,action:action('str')}),
 /original earned independent Body Cycle combat evidence is not replayable/);
A.throws(()=>Body.profile(s,{actorId:'emergent:person_9000000',
 combatantId,action:action('str')}),/Original independent Body weapon profile requires/);
A.equal(typeof PC.profile,'function',
 'Original player action source is reused; no duplicate source-authored PC progression');
console.log('Original independent Body force combat PASS: genuinely earned first-cycle +1 current Strength, M1 force only on Strength attacks, M2 never stacks, one original combat owner, tamper and save proof, no extra dice or PC power');
