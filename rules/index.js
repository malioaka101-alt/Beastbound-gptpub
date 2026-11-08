'use strict';
const C=require('./core'), B=require('./build'), P=require('./progress'), R=require('./research'), W=require('./world'), BD=require('./bonds'), Combat=require('./combat');
const E=require('../engine.js'), Unified=require('./unified'), Encounter=require('./encounter'), Agendas=require('./agendas');
const Realm=require('../world/simulation');
const Character=require('./character');
const Disciplines=require('./disciplines');
const PowerOverview=require('./power-overview');
const Spark=require('./arcane-spark');
const ArcaneWard=require('./arcane-ward');
const DualArcane=require('./arcane-dual-channel');
const QiStrike=require('./meridian-qi-strike');
const BondWitness=require('./bond-witness');
const BondCare=require('./bond-care');
const BondConsent=require('./bond-consent');
const BondGrade=require('./bond-grade');
const BeastAgency=require('./beast-agency');
const EvolutionGuard=require('./evolution-guard');
const EvolutionBypasses=require('./evolution-bypasses');
const EvolutionEventGuard=require('./evolution-event-guard');
const EvolutionObservations=require('./evolution-observations');
const EvolutionDisclosure=require('./evolution-disclosure');
const ResearchGuard=require('./research-guard');
const HabitatFieldwork=require('./research-habitat-fieldwork');
const CombatProvenance=require('./combat-provenance');
const Equipment=require('./equipment');
const LegacyInjury=require('./legacy-injury-migration');
const SceneCheck=require('./scene-check');
const HabitatSurvey=require('./habitat-survey');
const WildernessCamp=require('./wilderness-camp');
const FieldOpportunities=require('./public-field-opportunities');
const Wildlife=require('./wildlife-observation');
const ReedHarvest=require('./reed-harvest');
const TimePassage=require('./time-passage');
const CivilCalendar=require('./civil-calendar-evidence');
const FieldCompetition=require('./field-competition');
const FirstContact=require('./first-contact');
const ClinicCare=require('./clinic-care');
const PhysicianRescue=require('./physician-rescue');
const CriticalRehabilitation=require('./critical-rehabilitation');
const ConsciousCriticalReferral=require('./conscious-critical-referral');
const FieldCrafting=require('./field-crafting');
const NPCConversations=require('./npc-conversations');
const MaterialHandoffs=require('./material-handoffs');
const SocialFabric=require('./social-fabric');
const SocialService=require('./social-service');
const CivicPetitions=require('./civic-petitions');
const PublicHearings=require('./public-hearings');
const Mediation=require('./voluntary-mediation');
const EmergentGroups=require('./emergent-groups');
const GroupInvitations=require('./group-invitations');
const Senses=require('./first-stage-senses');
const RiftAnchors=require('./rift-anchors');
const OriginFoundations=require('./beast-origin-foundations');
const SoulThreads=require('./soul-threading');
const PersonPresence=require('../world/person-presence');
const WildLives=require('../world/wild-lives');
const Creation=require('./creation-design');
const CreationPrototype=require('./creation-prototype');
const RankDepth=require('./rank-depth');
const Lifepath=require('./mastery-lifepath');
const EmergentPeople=require('../world/emergent-people');
const SapientBeasts=require('../world/sapient-beast-persons');
// Bond events are historical claims, not free-repeatable resource operations.
// They can only consume an already-recorded witnessed incident in the save.
// Evidence authoring is deliberately NOT exposed by the rule request API.
function bondEvidence(s,params,kind,value){
 const id=params.evidenceId;
 if(typeof id!=='string'||!/^[a-z0-9][a-z0-9_-]{4,79}$/.test(id))
  throw Error('A previously recorded witnessed bond evidence ID is required');
 const evidence=s.table?.bondEvidence?.[id];
 if(!evidence||evidence.used||evidence.beastId!==params.beastId||
    evidence.kind!==kind||evidence[kind==='care'?'needs':'event']!==value)
  throw Error('No unused matching witnessed bond evidence in the saved ledger');
 if(typeof evidence.source!=='string'||evidence.source.trim().length<18)
  throw Error('Bond event requires recorded concrete observation and source');
 const now=s.world.minutes;
 C.int(evidence.worldMinute,'witnessed event minute',0);
 if(evidence.worldMinute>now)throw Error('Witnessed bond event is dated in the future');
 if(kind==='care'||(kind==='stability'&&['honoured_month','month_apart','fracture_week','over_capacity_week'].includes(value))){
  C.int(evidence.startMinute,'period start minute',0);
  C.int(evidence.endMinute,'period end minute',0);
  const required=(kind==='stability'&&['honoured_month','month_apart'].includes(value)?30:6)*1440;
  if(evidence.endMinute-evidence.startMinute<required||evidence.endMinute>now||
     evidence.worldMinute!==evidence.endMinute)
   throw Error('Recorded bond care or stability period has not actually elapsed');
 }
 if(kind==='care'){
  const previous=s.table?.bondCareEnd?.[params.beastId];
  if(previous!==undefined&&evidence.startMinute<previous)
   throw Error('Bond care evidence overlaps a previously counted sixday');
 }
 return evidence;
}
function spendBondEvidence(s,params,evidence,kind){
 evidence.used=true;
 evidence.usedAtMinute=s.world.minutes;
 if(kind==='care'){
  s.table.bondCareEnd||={};
  s.table.bondCareEnd[params.beastId]=evidence.endMinute;
 }
}
function dissolveBond(s,beastId,b){
 b.contract=null;
 s.player.partnerIds=(s.player.partnerIds||[]).filter(x=>x!==beastId);
 const beast=s.beasts?.[beastId];
 if(beast){beast.relationship='former partner';beast.consent=false;}
}
// A compact GM-facing *view* over existing witnessed interactions.
// No new personality, trust, consent, reputation, relationship or memory
// system. Every entry is already player-known through its original rule.
function knownPersonContext(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==1||typeof p.npcId!=='string'||
    !/^[a-z0-9][a-z0-9:_-]{1,100}$/.test(p.npcId))
  throw Error('A person context request names only a real person ID, not a chosen disposition, promise or hidden fact');
 const id=p.npcId,w=Realm.peek(s),person=PersonPresence.identity(w,id),
  current=PersonPresence.localStatus(s,w).people
   .some(x=>x.npcId===id);
 const conversations=[
  ...NPCConversations.status(s,{}).knownConversations.filter(x=>x.npcId===id)
   .map(x=>({day:x.day,location:x.location,
    ...(x.asked?{question:x.asked}:{}),
    heard:x.heard,answerKind:x.answerKind||'authored-public-topic',
    source:x.source})),
  ...EmergentPeople.heardStatus(s,w).knownPeople.filter(x=>x.npcId===id)
   .map(x=>({day:x.day,location:x.lastMetAt,
    ...(x.asked?{question:x.asked}:{}),
    heard:x.heard,answerKind:x.answerKind||'witnessed-person-response',
    source:'personally-witnessed-local-conversation'}))
 ];
 const handoffs=MaterialHandoffs.status(s,{}).knownHandoffs
   .filter(x=>x.npcId===id).map(x=>({
    day:x.day,location:x.location,item:x.item,
    accepted:x.accepted,quantityMoved:x.quantityMoved,
    witnessHash:x.witnessHash
   }));
 const workOffers=EmergentPeople.localWorkOffersStatus(s,{npcId:id})
   .knownWorkOffers.map(x=>({
    offerId:x.offerId,day:x.day,location:x.location,purpose:x.purpose,
    accepted:x.accepted,state:x.state,completedWork:x.completedWork
   }));
 const assistedWork=EmergentPeople.assistanceStatus(s,{npcId:id})
   .personallyAssistedWork.map(x=>({
    day:x.day,location:x.site,agreed:x.agreed,
    skill:x.skill,ownResult:x.ownResult,
    ...(x.observed?{observed:x.observed}:{})
   }));
 const witnessedWork=EmergentPeople.witnessedWorkStatus(s,{npcId:id})
   .personallyWitnessedWork.map(x=>({
    day:x.day,location:x.site,observed:x.observed
   }));
 const personallyKnown=conversations.length+handoffs.length+
  workOffers.length+assistedWork.length+witnessedWork.length>0;
 if(!person||(!current&&!personallyKnown))
  return {known:false,presentHere:false,
   note:'No known or locally witnessed person with this identity. Do not reveal a remote private life or assume contact.'};
 return {known:true,npcId:id,name:person.name,
  profession:person.profession,presentHere:current,
  conversations:conversations.slice(-25),
  handoffs:handoffs.slice(-25),
  workOffers:workOffers.slice(-25),
  assistedWork:assistedWork.slice(-25),
  witnessedWork:witnessedWork.slice(-25),
  note:'Only prior player-witnessed exchanges and currently visible identity. Culture and occupation do not determine beliefs, hidden motives, trust or consent. An accepted item is not an agreement; an old work offer is not a new promise.'};
}
function act(s,{system,operation,params={}}={}){
 if(!params||typeof params!=='object'||Array.isArray(params))throw Error('Invalid rule parameters');
 switch(`${system}.${operation}`){
  case 'core.check':return {check:SceneCheck.perform(s,params)};
  case 'core.prepareSceneCheck':return SceneCheck.prepare(s,params);
  case 'character.initialize':return {profileCreated:!!Character.ensure(s),attributesPreserved:true};
  case 'character.status':return Character.publicStatus(s);
  case 'character.assessPotential':return Character.assess(s,params);
  case 'discipline.status':return Disciplines.status(s);
  case 'power.status':return PowerOverview.read(s);
  case 'origin.researchStatus':return OriginFoundations.status(s);
  case 'origin.mapPattern':return OriginFoundations.mapPattern(s,params);
  case 'origin.screenCompatibility':return OriginFoundations.screening(s,params);
  case 'arcane.sparkStudy':return Spark.learn(s,params);
  case 'arcane.sparkStatus':return Spark.status(s,params);
  case 'arcane.wardStudy':return ArcaneWard.study(s,params);
  case 'arcane.wardStatus':return ArcaneWard.status(s,params);
  case 'arcane.dualChannelStatus':return DualArcane.status(s,params);
  case 'arcane.circleWork':return Disciplines.arcaneCircleWork(s,params);
  case 'arcane.matrixStatus':return Disciplines.matrixStatus(s);
  case 'arcane.matrixWork':return Disciplines.matrixWork(s,params);
  case 'meridian.qiStrikeStudy':return QiStrike.learn(s,params);
  case 'meridian.qiStrikeStatus':return QiStrike.status(s,params);
  case 'discipline.practice':return Disciplines.practice(s,params);
  case 'discipline.breakthrough':return Disciplines.breakthrough(s,params);
  case 'body.organStatus':return Disciplines.organStatus(s);
  case 'body.organWork':return Disciplines.organWork(s,params);
  case 'meridian.gatePractice':return Disciplines.gatePractice(s,params);
  case 'meridian.seaStatus':return Disciplines.seaStatus(s);
  case 'meridian.seaWork':return Disciplines.seaWork(s,params);
  case 'core.opposed':throw Error('Direct opposed rolls are not playable without independently witnessed participants, fixed skills and a precommitted contest');
  case 'core.contestForce':throw Error('Direct force contests are not playable without sourced combatants, established magnitudes and scene prerequisites');
  case 'combat.begin':return CombatProvenance.begin(s,params);
  case 'combat.sceneStatus':return Encounter.sceneStatus(s,params);
  case 'combat.exchange':return Encounter.exchange(s,params);
  case 'combat.register':throw Error('Raw combatant registration is not a playable action; only an established assessed encounter may register participants');
  case 'health.ensurePlayer':return Unified.ensurePlayer(s);
  case 'health.migrateLegacy':return LegacyInjury.migrate(s,params);
  case 'health.linkBeast':throw Error('Beast combatant measurements must come from the current saved individual combat assessment via combat.begin');
  case 'health.status':return Unified.status(s);
  case 'health.clinicIntake':return ClinicCare.intake(s,params);
  case 'health.clinicRecover':return ClinicCare.recover(s,params);
  case 'health.clinicStatus':return ClinicCare.status(s,params);
  case 'health.physicianRescue':return PhysicianRescue.attend(s,params);
  case 'health.rescueStatus':return PhysicianRescue.status(s,params);
  case 'health.criticalReferral':return ConsciousCriticalReferral.prepare(s,params);
  case 'health.criticalStatus':return CriticalRehabilitation.status(s,params);
  case 'health.criticalCare':return CriticalRehabilitation.criticalCare(s,params);
  case 'health.criticalRehab':return CriticalRehabilitation.rehabilitation(s,params);
  case 'health.criticalFollowup':return CriticalRehabilitation.followup(s,params);
  case 'health.findShelter':return WildernessCamp.find(s,params);
  case 'health.shelterStatus':return Unified.shelterStatus(s);
  case 'health.sleep':return Unified.sleep(s,params);
  case 'health.balm':return Unified.balm(s);
  case 'creation.evaluate':return Creation.evaluate(s,params);
  case 'creation.draft':return Creation.draft(s,params);
  case 'creation.status':return Creation.status(s,params);
  case 'creation.prototype':return CreationPrototype.build(s,params);
  case 'creation.calibrate':return CreationPrototype.calibrate(s,params);
  case 'creation.measure':return CreationPrototype.measure(s,params);
  case 'creation.prototypeStatus':return CreationPrototype.status(s,params);
  case 'rankings.detail':return RankDepth.status(s,params);
  case 'rankings.practice':return Lifepath.practice(s,params);
  case 'rankings.bridge':return Lifepath.bridge(s,params);
  case 'creation.repair':return CreationPrototype.repair(s,params);
  case 'craft.fieldPoultice':return FieldCrafting.craft(s,params);
  case 'craft.status':return FieldCrafting.status(s,params);
  case 'gear.offers':return Equipment.offers(s,params);
  case 'gear.inquire':return Equipment.inquire(s,params);
  case 'gear.purchase':return Equipment.purchase(s,params);
  case 'gear.equip':return Equipment.equip(s,params);
  case 'gear.unequip':return Equipment.unequip(s,params);
  case 'gear.status':return Equipment.status(s,params);
  case 'economy.spend':return Unified.spend(s,params);
  case 'combat.attack':
   if(params.castingDC!=null||params.manaCost!=null)
    throw Error('Spell attacks require verified learned abilities, Circle geometry, costs and casting prerequisites');
   throw Error('Direct attack calculations are not playable combat actions; use verified combat.exchange with established weapon or technique evidence');
  case 'combat.newRound':throw Error('Round advancement is controlled by the verified combat.exchange, not a direct free action');
  case 'combat.recover':throw Error('Direct combat recovery is not a legal encounter action; a sourced in-round recovery route is not yet implemented');
  case 'combat.rest':throw Error('Direct wound rest is disabled; use source-verified healing and real elapsed rest time');
  case 'combat.status':return {combatant:params.id==='player'?Combat.publicCombatant(Combat.get(s,'player')):Combat.observedCombatant(Combat.get(s,params.id))};
  case 'core.castAttack':throw Error('Raw spell attack calculations are not playable spells. The private chat casting route requires source-verified learned abilities, geometry, costs and prerequisites');
  case 'core.wardHit':throw Error('Direct Ward depletion without a resolved attack is not a playable Project operation; use the wound combat resolver');
  case 'soul.perceptionStatus':return Senses.soulStatus(s,params);
  case 'soul.threadStatus':return SoulThreads.status(s);
  case 'soul.threadWork':return SoulThreads.work(s,params);
  case 'soul.perceive':return Senses.perceive(s,params);
  case 'rift.senseStatus':return Senses.riftStatus(s,params);
  case 'rift.sense':return Senses.senseRift(s,params);
  case 'rift.anchorStatus':return RiftAnchors.status(s);
  case 'rift.anchorWork':return RiftAnchors.mark(s,params);
  case 'rift.orient':return RiftAnchors.orient(s,params);
  case 'world.realmInit':return {world:Realm.ensure(s).version,...Realm.synopsis(s)};
  case 'world.realmStatus':return Realm.publicStatus(s);
  case 'world.governmentStatus':return Realm.publicGovernment(s,params);
  case 'world.realmOverview':return Realm.synopsis(s);
  case 'world.atlas':return Realm.publicAtlas(s,params);
  case 'world.calendar':return Realm.calendar(s);
  case 'world.setCalendar':return CivilCalendar.anchor(s,params);
  case 'world.news':return Realm.publicNews(s,params);
  case 'world.market':return Realm.publicEconomy(s,params);
  case 'world.harvestReeds':return ReedHarvest.harvest(s,params);
  case 'world.gatherMaterial':return ReedHarvest.gather(s,params);
  case 'world.replantMaterial':return ReedHarvest.replant(s,params);
  case 'world.plantingStatus':return ReedHarvest.plantingStatus(s,params);
  case 'world.habitatSurvey':return HabitatSurvey.prepare(s,params);
  case 'world.habitatSurveyStatus':return HabitatSurvey.status(s,params);
  case 'opportunity.board':return FieldOpportunities.board(s,params);
  case 'opportunity.status':return FieldOpportunities.publicStatus(s,params);
  case 'opportunity.interest':return FieldOpportunities.interest(s,params);
  case 'opportunity.file':return FieldOpportunities.file(s,params);
  case 'world.observe':return Wildlife.observe(s,params);
  case 'world.watchWildBeast':return WildLives.watch(s,params);
  case 'world.giveWildSpace':return WildLives.giveSpace(s,params);
  case 'world.offerWildFood':return WildLives.offerFood(s,params);
  case 'world.wildBehaviourStatus':return WildLives.status(s,params);
  case 'world.wildMemoriesStatus':return WildLives.memories(s,params);
  case 'world.seekKnownWildBeast':return WildLives.track(s,params);
  case 'world.sightingStatus':return Wildlife.status(s,params);
  case 'world.species':return Realm.knownTaxon(s,params);
  case 'world.mythic':return Realm.mythicLore(s,params);
  case 'world.professionals':return Realm.publicProfessionals(s);
  case 'world.initiativesStatus':return Realm.publicInitiatives(s,params);
  case 'world.diffusionStatus':return Realm.publicDiffusion(s,params);
  case 'world.ambitionsStatus':return Realm.publicAmbitions(s,params);
  case 'world.peersStatus':return Realm.publicPeers(s,params);
  case 'world.familyMembersStatus':return Realm.publicFamilyMembers(s,params);
  case 'world.revealProfessional':return Realm.revealProfessional(s,params);
  case 'world.publishNews':return Realm.revealNews(s,params);
  case 'competition.notice':return FieldCompetition.notice(s,params);
  case 'competition.status':return FieldCompetition.status(s,params);
  case 'competition.fieldAssessment':return FieldCompetition.fieldAssessment(s,params);
  case 'npc.converse':return NPCConversations.converse(s,params);
  case 'npc.status':return NPCConversations.status(s,params);
  case 'social.materialHandoff':return MaterialHandoffs.offer(s,params);
  case 'social.materialHandoffsStatus':return MaterialHandoffs.status(s,params);
  case 'social.status':return SocialFabric.status(s,params);
  case 'social.groupsStatus':return EmergentGroups.status(s,params);
  case 'social.groupMembersStatus':return GroupInvitations.status(s,params);
  case 'social.personContext':return knownPersonContext(s,params);
  case 'social.localPeopleStatus':{
   if(!params||typeof params!=='object'||Array.isArray(params)||
      Object.keys(params).length)throw Error('Real local people status is read-only and accepts no invented individual or presence');
   return PersonPresence.localStatus(s,Realm.peek(s));
  }
  case 'social.observeLocalPersonWork':return EmergentPeople.observeLocalWork(s,params);
  case 'social.assistLocalPersonWork':return EmergentPeople.assistLocalWork(s,params);
  case 'social.proposeLocalWork':return EmergentPeople.proposeLocalWork(s,params);
  case 'social.withdrawLocalWork':return EmergentPeople.withdrawLocalWork(s,params);
  case 'social.localWorkOffersStatus':return EmergentPeople.localWorkOffersStatus(s,params);
  case 'social.assistedWorkStatus':return EmergentPeople.assistanceStatus(s,params);
  case 'social.witnessedPersonWorkStatus':return EmergentPeople.witnessedWorkStatus(s,params);
  case 'social.meetSapientBeast':return SapientBeasts.meet(s,params);
  case 'social.sapientBeastMemoriesStatus':return SapientBeasts.witnessedStatus(s,params);
  case 'social.speakLocalPerson':return EmergentPeople.meet(s,params);
  case 'social.metPeopleStatus':{
   if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).length)throw Error('Personal emergent meetings status is read-only and accepts no remote private facts');
   return EmergentPeople.heardStatus(s,Realm.peek(s));
  }
  case 'social.inviteGroupMember':return GroupInvitations.invitation(s,params);
  case 'social.formGroup':return EmergentGroups.form(s,params);
  case 'social.groupContribute':return EmergentGroups.contribute(s,params);
  case 'social.inquire':return SocialFabric.inquire(s,params);
  case 'social.request':return SocialFabric.request(s,params);
  case 'social.collect':return SocialFabric.collect(s,params);
  case 'social.submitReport':return SocialService.submit(s,params);
  case 'social.petition':return CivicPetitions.submit(s,params);
  case 'social.petitionStatus':return CivicPetitions.status(s,params);
  case 'social.pickupPetition':return CivicPetitions.collect(s,params);
  case 'social.hearingStatus':return PublicHearings.status(s,params);
  case 'social.hearing':return PublicHearings.testify(s,params);
  case 'social.mediationStatus':return Mediation.view(s,params);
  case 'social.mediationOffer':return Mediation.propose(s,params);
  case 'social.mediationWithdraw':return Mediation.withdraw(s,params);
  case 'social.mediationBook':return Mediation.book(s,params);
  case 'social.mediationMeet':return Mediation.meet(s,params);
  case 'world.agendaRegister':return Agendas.register(s,params);
  case 'world.agendaReveal':return Agendas.reveal(s,params);
  case 'world.agendaStatus':return {agendas:Agendas.publicStatus(s)};
  case 'world.advance':return TimePassage.passage(s,params);
  case 'world.wait':return TimePassage.wait(s,params);
  case 'research.start':return ResearchGuard.start(s,params);
  case 'research.survey':return ResearchGuard.survey(s,params);
  case 'research.week':return ResearchGuard.week(s,params);
  case 'research.fieldwork':return ResearchGuard.fieldwork(s,params);
  case 'research.habitatFieldwork':return HabitatFieldwork.record(s,params);
  case 'research.hypothesis':return ResearchGuard.hypothesis(s,params);
  case 'research.proof':return ResearchGuard.proof(s,params);
  case 'research.replication':return ResearchGuard.replication(s,params);
  case 'research.status':return {project:R.publicCard(R.get(s,params.id))};
  case 'evolution.register':return EvolutionGuard.record(s,params);
  case 'evolution.advance':return EvolutionGuard.advance(s,params);
  case 'evolution.ripening':return EvolutionBypasses.ripening(s,params);
  case 'evolution.patternEcho':return EvolutionBypasses.patternEcho(s,params);
  case 'evolution.crucible':return EvolutionObservations.crucible(s,params);
  case 'evolution.signs':return EvolutionObservations.signs(s,params);
  case 'evolution.event':return EvolutionEventGuard.event(s,params);
  case 'research.mythLead':return ResearchGuard.mythLead(s,params);
  case 'evolution.status':return EvolutionDisclosure.view(s,params);
  case 'evolution.eligibility':return EvolutionDisclosure.view(s,params);
  case 'bond.encounterRegister':return FirstContact.register(s,params);
  case 'bond.register':{
   const beast=s.beasts?.[params.beastId];
   if(!beast)throw Error('No recorded beast for initial relationship history');
   const start=params.start??'unfamiliar',years=params.years??0;
   C.int(years,'recorded relationship years',0,100);
   const tags=beast.personalityTags??[];
   if(!Array.isArray(tags)||tags.length>5||tags.some(x=>typeof x!=='string'))
    throw Error('Recorded beast personality tags are invalid');
   if(params.personality!==undefined&&JSON.stringify(params.personality)!==JSON.stringify(tags))
    throw Error('Bond personality tags must match the saved beast record');
   // Past intimacy is not acquired by specifying a backstory in this request.
   // A non-neutral starting profile requires precommitted historical evidence.
   let history=null;
   if(start!=='unfamiliar'||years>0){
    history=beast.bondHistoryAssessment;
    if(!history||history.used||history.beastId!==params.beastId||
       history.start!==start||history.years!==years||
       history.sapience!==beast.sapience||history.species!==beast.species||
       history.evolutionStage!==beast.evolutionStage||
       !Number.isInteger(history.worldMinute)||history.worldMinute<0||
       history.worldMinute>s.world.minutes||typeof history.source!=='string'||
       history.source.trim().length<18)
     throw Error('A source-recorded pre-existing bond history is required for years or starting trust');
   }
   const result=BD.register(s,{beastId:params.beastId,start,years,personality:tags});
   if(history)history.used=true;
   return {...result,historicalSource:history?.source||null};
  }
  case 'bond.gradeExamine':return BondGrade.assessment(s,params);
  case 'bond.gradeStatus':return BondGrade.status(s,params);
  case 'bond.consentOffer':return BondConsent.offer(s,params);
  case 'bond.consentStatus':return BondConsent.status(s,params);
  case 'bond.careAttend':return BondCare.attend(s,params);
  case 'bond.careReview':return BondCare.review(s,params);
  case 'bond.careStatus':return BondCare.status(s,params);
  case 'bond.interact':return BondWitness.interact(s,params);
  case 'bond.evidenceStatus':{
   if(!s.beasts?.[params.beastId])throw Error('Unknown beast for witnessed evidence');
   const pending=Object.entries(s.table?.bondEvidence||{}).filter(([id,e])=>
    e.beastId===params.beastId&&e.origin==='resolved-bond-interaction'&&!e.used)
    .map(([evidenceId,e])=>({evidenceId,event:e.event,worldMinute:e.worldMinute,source:e.source})).slice(-20);
   return {pending};
  }
  case 'bond.event':{
   if(params.times!==undefined&&params.times!==1)throw Error('Bond incidents cannot be multiplied; record each actual incident independently');
   const b=BD.fromSave(s,params.beastId),proof=bondEvidence(s,params,'event',params.event);
   const out=BD.applyEvent(b,params.event,1);
   spendBondEvidence(s,params,proof,'event');
   return {...out,evidenceId:params.evidenceId};
  }
  case 'bond.care':{
   const b=BD.fromSave(s,params.beastId),proof=bondEvidence(s,params,'care',params.needs);
   const out=BD.weeklyCare(b,params.needs);
   spendBondEvidence(s,params,proof,'care');
   if(out.contract?.state==='dissolved')dissolveBond(s,params.beastId,b);
   return {...out,evidenceId:params.evidenceId};
  }
  case 'bond.willingness':{
   // Beast Handling is a separate competency, not an arbitrary caller bonus.
   // Legacy saves without a verified Beast Handling skill use rank 0.
   const rank=C.int(s.player.skills?.beastHandling?.rank??0,'recorded Beast Handling rank',0,5);
   if(params.handlerRank!==undefined&&params.handlerRank!==rank)
    throw Error('Handler rank must match the saved Beast Handling qualification');
   return BD.willingness(s,BD.fromSave(s,params.beastId),{...params,handlerRank:rank});
  }
  case 'bond.seal':{
   // Capacity is a property of the saved handler and *all* active contracts,
   // not numbers a caller may provide to make a seal appear eligible.
   const records=s.table?.bondRecords||{},existingPartners=s.player.partnerIds||[];
   if(existingPartners.some(id=>id!==params.beastId&&!records[id]?.contract))
    throw Error('Existing partnership has no reconciled contract load; adjudicate before sealing another');
   const usedCapacity=Object.entries(records).filter(([id,b])=>id!==params.beastId&&b.contract)
    .reduce((total,[id,b])=>total+C.int(b.contract.load,'existing contract load for '+id,1,10),0);
   const will=Unified.playerProfile(s).will,soulPhase=s.player.soul?.phase||0;
   // Species rarity labels such as Common/Rare are NOT numeric Grades I–IX.
   // Binding load needs a specific precommitted assessed individual grade.
   const beast=s.beasts?.[params.beastId],assessment=beast?.contractGradeAssessment;
   if(!beast||!assessment||!Number.isInteger(assessment.grade)||assessment.grade<1||assessment.grade>9||
      typeof assessment.source!=='string'||assessment.source.trim().length<18||
      !Number.isInteger(assessment.worldMinute)||assessment.worldMinute<0||
      assessment.worldMinute>s.world.minutes||typeof beast.species!=='string'||
      assessment.species!==beast.species||assessment.evolutionStage!==beast.evolutionStage||
      assessment.individualGrade!==beast.individualGrade)
    throw Error('A current source-recorded numeric individual beast Grade assessment is required for a contract');
   const grade=assessment.grade;
   // Only an actually trained Contract Lore skill is a skill bonus. The
   // current starter's Beastcraft/Diplomacy ranks are not interchangeable.
   const loreRank=C.int(s.player.skills?.contractLore?.rank??0,'recorded Contract Lore rank',0,5);
   const contractLore=loreRank*2,soulDB=B.soulProfile(soulPhase,{will}).disciplineBonus;
   // No permanent contract stability bonus is earnable in the present runner.
   const bonuses=0;
   if(params.usedCapacity!==undefined&&params.usedCapacity!==usedCapacity)throw Error('Used bond capacity must match saved contracts');
   if(params.will!==undefined&&params.will!==will)throw Error('Will must match the recorded character profile');
   if(params.soulPhase!==undefined&&params.soulPhase!==soulPhase)throw Error('Soul Phase must match actual earned progression');
   if(params.grade!==undefined&&params.grade!==grade)throw Error('Contract Grade must match the recorded individual beast assessment');
   if(params.contractLore!==undefined&&params.contractLore!==contractLore)throw Error('Contract Lore bonus must match recorded learning');
   if(params.soulDB!==undefined&&params.soulDB!==soulDB)throw Error('Soul discipline bonus must match the actual earned Soul Phase');
   if(params.bonuses!==undefined&&params.bonuses!==bonuses)throw Error('No unverified contract stability bonuses may be applied');
   // An offered contract does not prove that a beast or guardian agreed.
   // Consent for these particular terms must already be witnessed in the save.
   const bond=BD.fromSave(s,params.beastId),depth=params.depth||'standard';
   const proof=beast.contractConsentEvidence;
   if(!proof||proof.used||proof.beastId!==params.beastId||
      !Number.isInteger(beast.sapience)||bond.sapience!==beast.sapience||
      proof.sapience!==beast.sapience||proof.depth!==depth||
      proof.species!==beast.species||proof.evolutionStage!==beast.evolutionStage||
      !Number.isInteger(proof.worldMinute)||proof.worldMinute<0||
      proof.worldMinute>s.world.minutes||typeof proof.source!=='string'||
      proof.source.trim().length<18||
      !['beastWilling','guardianConsent','informedConsent'].every(k=>typeof proof[k]==='boolean'))
    throw Error('Current witnessed consent for this beast, sapience and contract terms must be recorded before sealing');
   if(proof.origin==='resolved-voluntary-animal-contract-offer'){
    if(!BeastAgency.evaluate(s,beast,bond,'light_contract').possible)
     throw Error('The beast has independently withdrawn or is not well enough to renew this agreement');
    if(s.world.minutes-proof.worldMinute>6*1440||
       bond.fractured||beast.away===true||
       (beast.location&&beast.location!==s.world.location)||
       (s.encounter?.beastId!==params.beastId&&!s.player.partnerIds?.includes(params.beastId))||
       ['captured','forced','coerced','imprisoned'].includes(String(beast.relationship||'').toLowerCase())||
       /hostile|agitated|terrified|panicked|fearful/i.test(String(beast.mood||'')))
     throw Error('The witnessed animal agreement has expired or the beast is no longer freely willing and present');
   }
   const agreed={beastWilling:proof.beastWilling,guardianConsent:proof.guardianConsent,
    informedConsent:proof.informedConsent};
   for(const key of Object.keys(agreed))if(params[key]!==undefined&&params[key]!==agreed[key])
    throw Error('Caller-supplied '+key+' disagrees with recorded contract consent');
   const consent=BD.consentGuard(bond,agreed);
   if(!consent.eligible)return {sealed:false,reason:consent.reason};
   const x=BD.seal(s,bond,{...params,grade,usedCapacity,will,soulPhase,contractLore,soulDB,bonuses,...agreed});
   if(x.sealed){
    proof.used=true;proof.sealedAtMinute=s.world.minutes;
    s.player.partnerIds ||= [];
    if(!s.player.partnerIds.includes(params.beastId))s.player.partnerIds.push(params.beastId);
    beast.consent=true;beast.relationship='reciprocal partner';beast.bondId=params.beastId;
   }
   return x;
  }
  case 'bond.stability':{
   const b=BD.fromSave(s,params.beastId),proof=bondEvidence(s,params,'stability',params.event);
   const result=BD.adjustStability(b,params.event);
   spendBondEvidence(s,params,proof,'stability');
   if(result.state==='dissolved')dissolveBond(s,params.beastId,b);
   return {...result,evidenceId:params.evidenceId};
  }
  case 'bond.status':return BD.publicBond(BD.fromSave(s,params.beastId));
  case 'bond.syncReadiness':return BD.syncReadiness(BD.fromSave(s,params.beastId),params.stage);
  case 'bond.consent':{const b=s.beasts[params.beastId];return BD.consentGuard(b,params);}
  default:throw Error(`Unsupported rule operation: ${system}.${operation}`);
 }
}
module.exports={act,disciplines:Disciplines,character:Character,core:C,build:B,progress:P,research:R,world:W,realm:Realm,bonds:BD,combat:Combat,unified:Unified,encounter:Encounter,agendas:Agendas};