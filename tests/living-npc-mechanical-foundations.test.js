'use strict';
// Regression: an invented clan-elder test character gets a source-verified,
// private mechanical baseline, WITHOUT invented earned power or biography.
// This disposable test does not use or change Maddoc's existing campaign.
const A=require('node:assert/strict');
const Engine=require('../engine');
const New=require('../scripts/new-campaign');
const Opening=require('../scripts/gm-campaign-opening');
const Rules=require('../rules');
const Realm=require('../world/simulation');
const People=require('../world/emergent-people');
const Foundations=require('../world/person-mechanical-foundations');

const created=New.create({seed:12678111,slug:'disposable_npc_clan_elder',
 mode:'guided',homeRegion:'morrowfen_basin',age:10});
const s=created.state;
const witness='Elder Varna Reedfell is standing beside a cart and speaking to a nearby handler in the witnessed yard scene.';
Opening.apply(s,{place:{placeId:'disposable_clan_yard',
 name:'Orchard Cart Yard',regionId:s.campaign.origin.birthRegionId,
 description:'A worked public cart yard beside an established orchard lane.',
 kind:'working yard',sceneType:'settlement',
 culture:'Working families maintain their own separate customs and institutions.'},
 scene:witness,focus:'Meet a travelling elder without assuming her history',
 weather:'Cool and clear',hour:9,minute:10});
const p={name:'Elder Varna Reedfell',
 profession:'Travelling clan elder and mediator',
 purpose:'Negotiate practical crossing access with local households without overruling their individual choices.',
 personality:'Direct, warm on her own terms, impatient with bluster, occasionally unexpectedly funny.',
 background:'An older traveller with attendants whose clan, actual magic and personal history have yet to be source-confirmed.',
 witness};
const before=Engine.exportGame(s),minutes=s.world.minutes,rollSeed=s.rngState,coins=s.player.coins;
A.throws(()=>Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:{...p,str:20}}),/GM individual needs/,
 'Player/GM may not inject chosen statistics into witnessed person registration');
const joined=Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',params:p});
A.equal(joined.registered,true);
A.equal(s.world.minutes,minutes,'An identity does not advance the clock');
A.equal(s.rngState,rollSeed,'NPC baseline may not consume the player RNG');
A.equal(s.player.coins,coins,'No player money or rewards');
const w=Realm.peek(s),actor=w.emergentPeople.people[joined.npcId.slice(9)];
A.equal(People.verify(w,actor),true,'Fully sealed identity and foundation');
A.equal(Foundations.verify(w,actor),true,'Original source-bound baseline');
const externalDraft=Foundations.build(w,actor);
externalDraft.baselineAttributes.str=999;
externalDraft.unassessedPotential.meridianBreadth=999;
A.equal(Foundations.verify(w,actor),true,
 'Changing a returned foundation copy must not corrupt the cached expected source');
A.equal(Foundations.build(w,actor).baselineAttributes.str,
 actor.mechanicalFoundation.baselineAttributes.str,
 'Recomputed/cached profile remains the actual original source');

A.equal(actor.birthSource.mechanicalFoundationVersion,1);
A.equal(actor.cashScales,0);
A.equal(actor.career.competenceRank,0);
A.deepEqual(actor.practicedDisciplines,[],'A title does not confer magic stages');
A.deepEqual(actor.knownTechniques,[],'A title does not confer techniques');
A.equal(actor.mechanicalFoundation.noEarnedTechniqueOrBeastBond,true);
for(const key of Foundations.ATTRIBUTES){
 A.ok(Number.isInteger(actor.mechanicalFoundation.baselineAttributes[key])&&
  actor.mechanicalFoundation.baselineAttributes[key]>=3&&
  actor.mechanicalFoundation.baselineAttributes[key]<=18,key+' is a real seeded attribute');
}
A.equal(Object.keys(actor.mechanicalFoundation.unassessedPotential).length,
 Foundations.POTENTIAL.length,'Every original potential axis seeded, never assessed by a free roll');
const dossier=Foundations.gmDossier(w,joined.npcId);
A.equal(dossier.privateToGM,true);
A.equal(dossier.actualCultivationAndCombatProfile.includes('Original earned source'),true);
A.equal(dossier.ageBand,'not established','Age must not be fabricated from role alone');
A.equal(dossier.professionCompetence,0);
A.equal(Foundations.gmDossier(w,'emergent:person_99999').known,false);
const publicView=Rules.act(s,{system:'social',operation:'witnessedPeopleStatus',
 params:{npcId:joined.npcId}});
A.equal(publicView.people[0].name,p.name);
A.equal(Object.hasOwn(publicView.people[0],'baselineAttributes'),false,
 'Player-facing status does not leak sealed GM stats');
A.equal(Object.hasOwn(publicView.people[0],'latentPotential'),false,
 'Player-facing status does not leak private potential');
const saved=Engine.exportGame(s),restored=Engine.importGame(saved);
const rw=Realm.peek(restored),rp=rw.emergentPeople.people[actor.id];
A.equal(People.verify(rw,rp),true,'A save roundtrip preserves proven identity');
A.deepEqual(Foundations.gmDossier(rw,joined.npcId).baselineAttributes,
 dossier.baselineAttributes,'A saved baseline cannot be rerolled');
const modified=Engine.importGame(saved),mw=Realm.peek(modified);
mw.emergentPeople.people[actor.id].mechanicalFoundation.baselineAttributes.str=99;
A.equal(People.verify(mw,mw.emergentPeople.people[actor.id]),false,
 'Attribute tampering invalidates the individual');
const stripped=Engine.importGame(saved),sw=Realm.peek(stripped);
delete sw.emergentPeople.people[actor.id].mechanicalFoundation;
A.equal(People.verify(sw,sw.emergentPeople.people[actor.id]),false,
 'A new required profile cannot silently disappear');
const notable=Object.values(rw.notables)[0];
const notableView=Foundations.gmDossier(rw,'notable:'+notable.id);
A.equal(notableView.kind,'established-notable');
A.equal(notableView.originalDiscipline.path,notable.discipline.path);
A.equal(notableView.baselineAttributes,null,'Old notables do not receive retroactive arbitrary stats');
A.equal(before!==saved,true,'The only save change comes from the actual witnessed person');
console.log('Living NPC mechanical foundation: sourced individual baseline, original notable bridging, no magic awards, privacy, no rerolls, save replay, tamper detection PASS');
