'use strict';
// Real original encounter + independently generated human + two genuine
// personal choice streams; an authored disposable local discussion witness
// is not a predetermined agreement, contract or bond.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),R=require('../rules'),C=require('../rules/core'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Atlas=require('../world/atlas'),Person=require('../world/sapient-beast-persons'),
 Bridge=require('../rules/independent-sapient-proposal-discussions'),
 Foundation=require('../world/person-mechanical-foundations'),
 Arrangement=require('../rules/independent-sapient-arrangements'),Time=require('../rules/world');
const Pair=require('../rules/independent-original-bond-pair');
const Follow=require('../rules/independent-sapient-followup'),Presence=require('../world/person-presence');
const Route=require('../rules/independent-sapient-terrestrial-preflight'),TravelLaw=require('../rules/travel-shared-original-law');
A.deepEqual(TravelLaw.legSpec('crossing'),{minutes:75,stamina:4});
A.deepEqual(TravelLaw.legSpec('academy'),{minutes:75,stamina:4});
A.deepEqual(TravelLaw.legSpec('ruins'),{minutes:145,stamina:4});
const Interact=require('../rules/independent-original-bond-interactions'),Witness=require('../rules/bond-witness');
A.deepEqual(Witness.interactionSpec('gentle',16,0,true,0,3),{event:'gentle_treatment',minutes:15,dc:21,modifier:3});
const Bond=require('../rules/bonds'),Sync=require('../rules/bond-synchronisation');
const OriginalGrade=require('../rules/bond-grade'),
 IndependentGrade=require('../rules/independent-original-beast-grade-exam');
A.deepEqual(OriginalGrade.examSpec(3,16,0),{dc:18,modifier:3,feeTalons:1,feeScales:100,minutes:120,cooldownMinutes:8640});

A.deepEqual(Bond.contractSpec({grade:4,sapience:3,depth:'deep',will:2,contractLore:2,soulDB:3,soulPhase:3,usedCapacity:2}),{
 depth:'deep',load:4,capacity:7,usedCapacity:2,overCapacity:false,dc:20,modifier:7,stability:80,base:70,link:'10 km'});
A.equal(Bond.contractSpec({grade:9,sapience:3,depth:'covenant',will:0,usedCapacity:0}).overCapacity,true);
A.equal(Bond.syncReadiness(Bond.create({human:'h',beast:'b',start:'unfamiliar',sapience:3}),1).numericReady,false);
A.deepEqual(Sync.practiceSpec(1,16,1,35,2),{humanCost:3,fatigueCost:3,energyCost:0,minutes:30,dc:13,modifier:8});
A.deepEqual(Sync.practiceSpec(3,14,0,0,-1),{humanCost:5,fatigueCost:4,energyCost:2,minutes:40,dc:17,modifier:1});

const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
// Pure isolated original examination receipt-shape contract, not an
// earned examination or power in any game.
const isolatedBeast={species:'disposable_species',evolutionStage:'Base',individualGrade:'G3',
 gradeCalibration:{grade:3,worldMinute:80,source:'Disposable original prior individual calibration with provenance',
  species:'disposable_species',evolutionStage:'Base',individualGrade:'G3'},
 gradeExaminations:[{worldMinute:360,facility:'academy',outcome:'verified',
  check:{roll:18,dc:18,degree:'success'}}]};
const source='Individual Grade 3 verified at academy after d20 18 vs DC 18, against prior independent calibration: '+
 isolatedBeast.gradeCalibration.source;
const validExam={grade:3,worldMinute:360,origin:'observed-independent-grade-exam',
 facility:'academy',calibrationMinute:80,examCheck:{roll:18,dc:18},source,
 species:isolatedBeast.species,evolutionStage:isolatedBeast.evolutionStage,
 individualGrade:isolatedBeast.individualGrade};
A.equal(require('../rules/independent-original-bond-contract-law').gradeAt(isolatedBeast,validExam,360).grade,3);
A.equal(require('../rules/independent-original-bond-contract-law').gradeAt(isolatedBeast,{...validExam,source:'A fabricated Grade test'},360),null);
A.equal(require('../rules/independent-original-bond-contract-law').gradeAt({...isolatedBeast,gradeExaminations:[]},validExam,360),null);

const alternateSeed=process.env.BEASTBOUND_SAPIENT_SAMPLE_SEED;
const sampledSeed=alternateSeed===undefined?927801:Number(alternateSeed);
A.ok(Number.isSafeInteger(sampledSeed)&&sampledSeed>0&&sampledSeed<=4294967295);
const s=E.newGame({name:'Disposable independent sapient proposal',seed:sampledSeed,path:'undecided'});
A.equal(E.dispatch(s,'travel forest').ok,true);
let b=null;
for(let n=0;n<260&&!b;n++){
 A.equal(E.dispatch(s,'explore').ok,true);
 const candidate=s.beasts[s.encounter.beastId];
 if(E.SPECIES[candidate.species].intelligence==='sapient'&&!s.encounter.threat&&
  !/hostile|agitated|terrified|panicked|fleeing|desperate/i.test(candidate.mood)){
  const meet=R.act(s,{system:'social',operation:'meetSapientBeast',params:{}});
  if(meet.freelyEngaged){b=candidate;break;}
 }
 if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
}
A.ok(b,'Real independently willing sapient encounter required');
A.ok(b.sapientLife.contactReceipts?.length,'An actual encounter produces an enduring original contact receipt');
// Disposable numeric cognition observation only; no pair decision or trust is assigned.
b.sapience=3;
const w=Realm.ensure(s),roster=People.ensure(w),site=s.world.location,
 region=Atlas.R[Atlas.LOCATION_REGION[site]],day=Math.floor(s.world.minutes/1440),
 contact=b.sapientLife.history.find(x=>x.type==='personally-witnessed-contact'&&x.willingness);
A.equal(People.siteFor(region.id),site);
// Disposable world demand fixture uses actual individual generator.
const eco=w.ecosystems[region.id],country=w.countries[region.polity];
Object.assign(eco,{quality:75,pressure:14,water:80,forage:80});
Object.assign(country,{prosperity:75,stability:80});
const demand=People.sourceDemand(w,region);
A.ok(demand);
let mutual=null,humanRefusal=0,beastRefusal=0,results=[],agreed=null,finalResults=[];
const pairCounts={recorded:0,declined:0};
for(let n=0;n<80;n++){
 const p=People._debug.make(w,roster,day,demand);p.shift=People.shift(p,day,w);
 const terms={beastId:b.id,id:'individual_proposal_'+n,kind:'voluntary habitat conversation',
  purpose:'An offer to explore possible cooperative habitat observations without committing either party.',
  humanDuty:'A proposed human contribution to be discussed before any real commitment or payment.',
  beastDuty:'A proposed contribution that the independent sapient individual may decline entirely.',
  protections:'Both parties retain ordinary welfare protections and the right not to participate.',
  termination:'Neither party is bound and each can end the discussion without a duty.',
  communication:'Supported local signs and clearly explained voluntary terms.',durationDays:7};
 C.event(s,'story',p.name+' considers the sapient person’s publicly offered habitat cooperation proposal in a locally witnessed conversation.',{
  origin:Bridge.WITNESS,actorId:p.actorId,beastId:b.id,location:site,
  minute:s.world.minutes,contactHash:hash(contact),terms,
  comprehension:'A concrete limited proposal was explained with visibly understood specific local signs.',
  communication:'Witnessed shared signs, not telepathy',
  noAssumedSharedLanguage:true,publicInvitationOnly:true});
 const req={actorId:p.actorId,beastId:b.id,witnessIndex:s.log.length-1},
  snapshot=E.exportGame(s),rng=s.rngState,clock=s.world.minutes,
  humanRng=p.rngState,beastRng=b.sapientLife.rngState;
 A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientProposalDiscussion',
  params:{...req,accepted:true}}),/never assigned consent/);
 A.equal(E.exportGame(s),snapshot);
 const result=R.act(s,{system:'bond',operation:'npcSapientProposalDiscussion',params:req}),
  receipt=p.originalSapientProposalDiscussions[0],q=receipt.source;
 A.equal(Bridge.verify(s,p),true);
 A.equal(q.humanChoice.rngBefore,humanRng);
 A.equal(q.humanChoice.rngAfter,p.rngState);
 A.equal(q.beastChoice?.rngBefore??beastRng,beastRng);
 A.equal(q.beastChoice?.rngAfter??beastRng,b.sapientLife.rngState);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,clock);
 A.equal(result.legalDutiesEstablished,false);
 A.equal(result.magicalBondEstablished,false);
 A.equal(s.table?.bondRecords?.[b.id],undefined);
 A.equal(s.player.partnerIds.includes(b.id),false);
 const saved=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientProposalDiscussion',params:req}),
  /do not reroll willingness|fresh, voluntary, comprehended proposal/);
 A.equal(E.exportGame(s),saved);
 const view=Foundation.gmDossier(w,p.actorId,s).earnedEvidence.beastRelationships;
 A.equal(view.verifiedPartners,null);
 A.equal(view.sourceVerifiedProposalDiscussions[0].observedOutcome,result.observedOutcome);
 results.push(result.observedOutcome);
 if(result.mutuallyInterested){
  mutual=p;
  const finalTerms={...terms,kind:'revocable voluntary habitat cooperation',
   purpose:'Both independent participants voluntarily agree to a bounded habitat observation undertaking.',
   humanDuty:'The human offers their own observation notes while retaining the right to withdraw.',
   beastDuty:'The sapient person offers its own observations on terms it freely accepts without compelled labour.',
   termination:'Either person can withdraw; material performance and unsettled duties require separate evidence.'};
  C.event(s,'story',p.name+' considers the separately explained final terms, safeguards and right to refuse.',{
   origin:Arrangement.WITNESS,actorId:p.actorId,beastId:b.id,location:site,
   minute:s.world.minutes,contactHash:hash(contact),proposalHash:receipt.seal,terms:finalTerms,
   comprehension:'The two separate individuals have understood the specific final voluntary terms and duties.',
   communication:'Actual locally witnessed shared signs',
   rightToRefuse:'Both retain their independent right to refuse now and withdraw later without compelled service.',
   noAssumedSharedLanguage:true,noMagicalPromise:true});
  const params={actorId:p.actorId,beastId:b.id,witnessIndex:s.log.length-1},
   before=E.exportGame(s);
  A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientArrangementAccept',
   params:{...params,accepted:true}}),/no assigned consent/);
  A.equal(E.exportGame(s),before);
  const resolved=R.act(s,{system:'bond',operation:'npcSapientArrangementAccept',params});
  const entry=p.originalSapientArrangements[0];
  A.equal(Arrangement.verify(s,p),true);
  A.equal(entry.source.proposalHash,receipt.seal);
  A.notEqual(entry.source.witnessHash,receipt.source.witnessHash);
  A.equal(resolved.mutuallyAccepted,entry.source.outcome==='accepted');
  A.equal(resolved.noMagicOwnershipOrCompelledService,true);
  A.equal(s.table?.bondRecords?.[b.id],undefined);
  finalResults.push(resolved.observedOutcome);
  const after=E.exportGame(s);
  A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientArrangementAccept',params}),
   /already received|Separate current informed final terms|Real co-present willing persons/);
  A.equal(E.exportGame(s),after);
  if(resolved.mutuallyAccepted){
   agreed={p,entry};
   // Explicit disposable authored prior measurements ONLY. Recognition is a
   // separate real bilateral decision, not assigned by the fixture.
   C.event(s,'story',p.name+' and the sapient individual consider retaining their separately measured pair calibration without a contract.',{
    origin:Pair.WITNESS,actorId:p.actorId,beastId:b.id,location:site,
    arrangementHash:entry.seal,arrangementRevision:entry.seal,contactHash:hash(contact),
    measuredSapience:b.sapience,measuredCompatibility:5,measuredResonance:4,
    actualPriorBioSpiritualCalibration:'Disposable measured pair-specific biological and spiritual compatibility assessment.',
    actualPriorEnergyCalibration:'Disposable measured pair-specific energy resonance assessment.',
    independentlyUnderstoodTerms:'Both independently comprehend that this is only a record of prior measurements.',
    rightToDeclineRecord:'Either individual may decline retaining the record without losing any previously accepted social terms.',
    noAssignedAffectionOrWillingness:true,noMagicalContract:true});
   const request={actorId:p.actorId,beastId:b.id,witnessIndex:s.log.length-1},
    savedPair=E.exportGame(s),pc=s.rngState,pr=p.rngState,br=b.sapientLife.rngState;
   A.throws(()=>R.act(s,{system:'bond',operation:'npcPairRecord',params:{...request,trust:100}}),/no assigned affinity or consent/);
   A.equal(E.exportGame(s),savedPair);
   const out=R.act(s,{system:'bond',operation:'npcPairRecord',params:request}),row=p.originalBondPairRecognitions[0];
   A.equal(Pair.verify(s,p),true);A.equal(s.rngState,pc);
   A.equal(row.source.humanChoice.rngBefore,pr);
   A.equal(row.source.beastChoice?.rngBefore??br,br);
   A.equal(out.recorded,row.source.accepted);A.equal(s.table?.bondRecords?.[b.id],undefined);
   A.equal(s.player.partnerIds.includes(b.id),false);
   A.equal(Arrangement.privateStatus(s,p)[0].status,'accepted');
   const beforeRoute=E.exportGame(s),beforeHuman=p.rngState,beforeBeast=b.sapientLife.rngState;
   A.equal(Route.routeStatus(s,p,b,site).reason,'not-one-original-linked-leg');
   A.equal(Route.routeStatus(s,p,b,'academy').reason,'not-one-original-linked-leg');
   A.equal(Route.routeStatus(s,p,b,'crossing').reason,'original-encounter-or-combat-unresolved');
   A.equal(E.exportGame(s),beforeRoute,'A private travel proposal preflight may not manufacture movement, route choice or old combat condition');
   A.equal(p.rngState,beforeHuman);A.equal(b.sapientLife.rngState,beforeBeast);
   if(out.recorded){
    const travel=E.importGame(E.exportGame(s)),tw=Realm.peek(travel),
     traveler=tw.emergentPeople.people[p.id],companion=travel.beasts[b.id];
    if(travel.encounter)A.equal(E.dispatch(travel,'leave').ok,true);
    require('../rules/unified').ensurePlayer(travel);
    travel.chatRuntime||={};
    const actualWitness=traveler.name+' is presently witnessed uninjured, unarmed and unarmoured at the actual forest location, without an imposed travel agreement.';
    travel.chatRuntime.scene=actualWitness;
    R.act(travel,{system:'health',operation:'linkWitnessedHuman',
     params:{npcId:traveler.actorId,witness:actualWitness}});
    const before=E.exportGame(travel),humanRng=traveler.rngState,
      beastRng=companion.sapientLife.rngState;
    const route=Route.routeStatus(travel,traveler,companion,'crossing');
    A.equal(route.proposalEligible,true,'Original adjacent forest–crossing exit is valid even across atlas region boundary');
    A.equal(route.from,'forest');A.equal(route.to,'crossing');
    A.equal(route.minutes,75);A.equal(route.stamina,4);A.equal(route.crossesRegion,true);
    A.equal(route.requiresIndependentlyVerifiedArrivalAndNewLocationProof,true);
    A.equal(Route.routeStatus(travel,traveler,companion,'academy').reason,'not-one-original-linked-leg');
    A.equal(E.exportGame(travel),before,'Actual route preflight is private and purely read-only');
    A.equal(traveler.rngState,humanRng);A.equal(companion.sapientLife.rngState,beastRng);
    console.log('INDEPENDENT ORIGINAL LINKED CROSS-REGION TRAVEL PREFLIGHT PASS '+JSON.stringify({
     from:route.from,to:route.to,minutes:route.minutes,stamina:route.stamina,
     noAssignedConsentOrMovement:true}));
   }


   // An actual recognised but unfamiliar pair cannot bypass earned
   // willingness by presenting a fresh magical offer or a caller outcome.
   const ss=E.importGame(E.exportGame(s)),sp=Realm.peek(ss).emergentPeople.people[p.id],sb=ss.beasts[b.id];
   const grade={grade:3,worldMinute:ss.world.minutes,species:sb.species,evolutionStage:sb.evolutionStage,
    individualGrade:sb.individualGrade,source:'Explicit disposable prior numeric individual assessment, not rarity or transformation.'};
   sb.contractGradeAssessment=grade;
   const ContractLaw=require('../rules/independent-original-bond-contract-law');
   A.deepEqual(ContractLaw.soulAt(ss,sp,ss.world.minutes),{phase:0,sourceSeal:null});
   const contractInput=ContractLaw.inputs(ss,sp,sb,ss.world.minutes,grade,'light',0);
   A.equal(contractInput,null,'An arbitrary numeric grade field cannot replace the original paid Grade exam');
   C.event(ss,'story',sp.name+' considers the exact separately explained magical terms without implying readiness to accept.',{
    origin:Interact.SEAL,actorId:sp.actorId,beastId:sb.id,pairSeal:row.seal,
    arrangementHash:entry.seal,arrangementRevision:entry.seal,contactHash:hash(contact),
    location:site,approach:'seal',depth:'light',gradeAssessmentHash:hash(grade),
    independentConcreteOpportunity:'Actual separately explained exact light magical connection offer without compelled service.',
    actualCommunication:'Original local comprehended form of communication.',
    unconditionalRightToRefuse:'Each independent person may refuse any magical contract.',
    noCompelledInteraction:true,independentlyUnderstood:true,noOwnershipOrForcedObedience:true,
    exactContractBenefits:'Finite link with no automatic learned ability or physical ownership.',
    exactContractObligations:'Both must be free to accept or refuse any proposed collaborative activity.',
    exactContractLimits:'Original measured light depth, not an unlimited command or storage mechanic.',
    independentWithdrawalTerms:'Either independently may withdraw from further continuation.'});
   const sr={actorId:sp.actorId,beastId:sb.id,witnessIndex:ss.log.length-1},sbefore=E.exportGame(ss);
   A.throws(()=>R.act(ss,{system:'bond',operation:'npcPairSeal',params:{...sr,sealed:true}}),/no outcome or affinity/);
   A.equal(E.exportGame(ss),sbefore);
   if(out.recorded){
    A.throws(()=>R.act(ss,{system:'bond',operation:'npcPairSeal',params:sr}),/willingness at least 50/);
    A.throws(()=>R.act(ss,{system:'bond',operation:'npcPairReview',params:sr}),/Current actual original magical contract/);
    A.throws(()=>R.act(ss,{system:'bond',operation:'npcSyncPractice',params:sr}),/Actual existing original independent magical contract/);
    A.throws(()=>R.act(ss,{system:'bond',operation:'npcSyncPractice',params:{...sr,targetStage:10}}),/no outcome or affinity/);
   }else A.throws(()=>R.act(ss,{system:'bond',operation:'npcPairSeal',params:sr}),/recognised pair/);
   A.equal(E.exportGame(ss),sbefore);A.equal(Interact.activeForBeast(ss,sb.id),null);
   const noMoney={actorId:sp.actorId,beastId:sb.id,witnessIndex:ss.log.length-1},gradeBefore=E.exportGame(ss);
   A.throws(()=>R.act(ss,{system:'bond',operation:'npcGradeExamine',params:{...noMoney,grade:9}}),
    /no selected grade, consent or success/);
   A.equal(E.exportGame(ss),gradeBefore);
   A.throws(()=>R.act(ss,{system:'bond',operation:'npcGradeExamine',params:noMoney}),
    /original examination facility, funds, verified pair/);
   A.equal(E.exportGame(ss),gradeBefore);
   // This is an isolated private assessment visibility fixture, NOT an
   // awarded examination. It must never leak through the player Grade pane.
   const oldGrade=sb.contractGradeAssessment,oldExams=sb.gradeExaminations;
   sb.contractGradeAssessment={...grade,origin:IndependentGrade.ORIGIN};
   sb.gradeExaminations=[{origin:IndependentGrade.ORIGIN,outcome:'verified',worldMinute:ss.world.minutes}];
   A.deepEqual(OriginalGrade.status(ss,{beastId:sb.id}),{assessed:false,examAttempts:0});
   sb.contractGradeAssessment=oldGrade;sb.gradeExaminations=oldExams;
   A.equal(IndependentGrade.verify(ss,sp),true);
   A.equal(IndependentGrade.paidSource(ss,sp,sb,{source:{origin:IndependentGrade.ORIGIN,accepted:true},seal:'forged'}),false);


   if(out.recorded){
    pairCounts.recorded++;
    A.equal(row.bond.compatibility,5);A.equal(row.bond.resonance,4);
    for(const k of ['trust','familiarity','affection','respect','loyalty','communication','coordination','willingness','syncStage','syncPoints'])
     A.equal(row.bond[k],0);
    A.equal(row.bond.contract,null);
    const v=Foundation.gmDossier(w,p.actorId,s).earnedEvidence.beastRelationships;
    A.equal(v.verifiedPartners,null);A.equal(v.sourceVerifiedUncommittedPairs.length,1);
    // A different disposable copy moves the ORIGINAL world by one real day.
    // The sapient person is never teleported or presumed available. The
    // new opportunity exists only if both source histories still show them
    // genuinely present and safe; both draw NEW private choices.
    const fs=E.importGame(E.exportGame(s)),first=fs.world.minutes;
    Time.advance(fs,1);
    const fw=Realm.peek(fs),fp=fw.emergentPeople.people[p.id],fb=fs.beasts[b.id],
     fday=Math.floor(fs.world.minutes/1440),
     fhere=Presence.resolve(fw,fp.actorId,site,fday,fs.world.minutes%1440);
    if(fhere?.presence&&fb.away===false&&fb.location===site&&fb.condition>=55&&
       Arrangement.privateStatus(fs,fp)[0].status==='accepted'){
     const scene=fp.name+' and '+fb.name+
       ' are both visibly present for a genuinely new, nonbinding local conversation in their established habitat.';
     fs.chatRuntime||={};fs.chatRuntime.scene=scene;
     C.event(fs,'story',scene,{origin:Follow.WITNESS,actorId:fp.actorId,beastId:fb.id,
      location:site,pairSeal:row.seal,arrangementHash:entry.seal,
      actualRenewedCoPresence:true,noAssignedBeastConsentOrOwnership:true,
      unconditionalRefusalAndCommunication:'Both individuals can refuse this entirely new conversation with no imposed obligation.',
      currentRealSharedActivity:'The previously known pair physically meet again during the actual next daily local opportunity.',
      contactStatus:'new-independent-choices'});
     const request={actorId:fp.actorId,beastId:fb.id,witnessIndex:fs.log.length-1},
      originalWorldRng=fs.rngState,prepared=E.exportGame(fs);
     A.throws(()=>R.act(fs,{system:'bond',operation:'npcSapientFollowupContact',params:{...request,accepted:true}}),
      /no chosen consent or outcome/);
     A.equal(E.exportGame(fs),prepared);
     const fresh=R.act(fs,{system:'bond',operation:'npcSapientFollowupContact',params:request}),
      recent=fp.originalSapientRenewedContacts[0],raw=fb.sapientLife.contactReceipts.at(-1);
     A.equal(Follow.verify(fs,fp),true);A.equal(Person.verify(fb),true);A.equal(Pair.verify(fs,fp),true);
     A.equal(fresh.newContact,raw.source.contact.willingness);
     A.equal(fs.world.minutes-first,1440+fresh.minutes);
     A.equal(fs.rngState,originalWorldRng);
     A.equal(raw.source.encounterHash,hash(raw.source.witness));
     A.equal(raw.source.contact.meetingHash,raw.source.witnessHash);
     A.equal(Person.contactProof(fb,raw.source.contact),true);
     const after=E.exportGame(fs);
     A.throws(()=>R.act(fs,{system:'bond',operation:'npcSapientFollowupContact',params:request}),
      /unused renewed contact day|fresh local follow-up scene|Genuine known/);
     A.equal(E.exportGame(fs),after);
     const fc=E.importGame(after),fpc=Realm.peek(fc).emergentPeople.people[p.id],
      fbc=fc.beasts[b.id];
     A.equal(Follow.verify(fc,fpc),true);
     fbc.sapientLife.contactReceipts.at(-1).source.contact.willingness=!fresh.newContact;
     fbc.sapientLife.contactReceipts.at(-1).seal=hash(fbc.sapientLife.contactReceipts.at(-1).source);
     fbc.sapientLife.contactHead=fbc.sapientLife.contactReceipts.at(-1).seal;
     A.equal(Person.verify(fbc),false,'Rehashed fake renewed assent cannot pass the original individual beast RNG');

     // A refused meeting cannot be recycled as consent. Advance at most
     // four additional REAL days before the first original civil sixday,
     // when the independent beast may depart on its own ecology tick.
     let tried=1,renewedYes=0,actualInteraction=null,actualInteractions=[];
     if(fresh.newContact)renewedYes++;
     for(let nextDay=fday+1;nextDay<=5;nextDay++){
      Time.advance(fs,1);
      const living=Realm.peek(fs),witnessedPerson=living.emergentPeople.people[p.id],
       nowDay=Math.floor(fs.world.minutes/1440),nowMinute=fs.world.minutes,
       presentAgain=Presence.resolve(living,witnessedPerson.actorId,site,nowDay,nowMinute%1440);
      if(!presentAgain?.presence||fb.away||fb.location!==site||fb.owner!==null||
       !Arrangement.safe(fb)||Arrangement.statusAt(entry,nowMinute)!=='accepted')break;
      const nextScene=witnessedPerson.name+' and '+fb.name+' independently encounter one another again in their real shared native habitat.';
      fs.chatRuntime||={};fs.chatRuntime.scene=nextScene;
      C.event(fs,'story',nextScene,{origin:Follow.WITNESS,actorId:witnessedPerson.actorId,
       beastId:fb.id,location:site,pairSeal:row.seal,arrangementHash:entry.seal,
       actualRenewedCoPresence:true,noAssignedBeastConsentOrOwnership:true,
       unconditionalRefusalAndCommunication:'These two separately living people may refuse new communication without any earlier agreement binding them.',
       currentRealSharedActivity:'The same independently scheduled human and non-departed beast actually meet at a later original world hour.',
       contactStatus:'new-independent-choices'});
      const freshRequest={actorId:witnessedPerson.actorId,beastId:fb.id,witnessIndex:fs.log.length-1},
       newContact=R.act(fs,{system:'bond',operation:'npcSapientFollowupContact',params:freshRequest});
      tried++;
      A.equal(Follow.verify(fs,witnessedPerson),true);
      A.equal(Person.verify(fb),true);
      if(!newContact.newContact)continue;
      renewedYes++;
      const latest=fb.sapientLife.history.filter(x=>x.type==='personally-witnessed-contact'&&x.willingness).at(-1);
      A.ok(latest&&fs.world.minutes-latest.minute<=60);
      const interactionScene=witnessedPerson.name+' approaches '+fb.name+' gently, and both are explicitly free to refuse this separate exchange.';
      fs.chatRuntime.scene=interactionScene;
      C.event(fs,'story',interactionScene,{origin:Interact.WITNESS,actorId:witnessedPerson.actorId,
       beastId:fb.id,pairSeal:row.seal,arrangementHash:entry.seal,
       arrangementRevision:entry.seal,contactHash:hash(latest),location:site,
       approach:'gentle',
       independentConcreteOpportunity:'This new actual conversation provides an unforced moment for genuine gentle treatment in the observed habitat.',
       actualCommunication:'The individual human and sapient beast are observed exchanging a fresh and separate non-coercive greeting.',
       unconditionalRightToRefuse:'Both participants retain the right to refuse this treatment without any forced continuation or obligation.',
       noCompelledInteraction:true});
      const beforeEvent=E.exportGame(fs),originalRng=fs.rngState,
       requestEvent={actorId:witnessedPerson.actorId,beastId:fb.id,witnessIndex:fs.log.length-1};
      A.throws(()=>R.act(fs,{system:'bond',operation:'npcPairInteract',
       params:{...requestEvent,affection:100}}),/no outcome or affinity/);
      A.equal(E.exportGame(fs),beforeEvent);
      const exchange=R.act(fs,{system:'bond',operation:'npcPairInteract',params:requestEvent}),
       actualReceipt=witnessedPerson.originalBondInteractions.at(-1).source;
      A.equal(Interact.verify(fs,witnessedPerson),true);
      A.equal(Follow.verify(fs,witnessedPerson),true);
      A.equal(fs.rngState,originalRng);
      A.equal(actualReceipt.event?.event??null,exchange.observedEvent);
      A.equal(actualReceipt.after.contract,null);
      A.equal(actualReceipt.after.syncStage,0);
      A.equal(fs.player.partnerIds.includes(fb.id),false);
      const lived=E.importGame(E.exportGame(fs)),
       savedPerson=Realm.peek(lived).emergentPeople.people[p.id];
      A.equal(Interact.verify(lived,savedPerson),true);
      A.equal(Follow.verify(lived,savedPerson),true);
      const observed={freshlyAccepted:true,humanInitiated:exchange.independentlyInitiated,
       receivedByBeast:exchange.accepted,checkSucceeded:exchange.successful,
       event:exchange.observedEvent??null,day:nowDay};
      actualInteraction||=observed;
      actualInteractions.push(observed);
      const rows=witnessedPerson.originalBondInteractions;
      if(rows.length>1){
       A.equal(rows.at(-1).source.previous,rows.at(-2).seal);
       A.deepEqual(rows.at(-1).source.before,rows.at(-2).source.after);
      }
     }
     console.log('INDEPENDENT EXTENDED REAL PAIR PROGRESSION '+JSON.stringify({
      actualDaysTried:tried,freelyRenewed:renewedYes,actualInteraction,
      actualInteractions,originalEarnedEventCount:actualInteractions.filter(x=>x.event!==null).length,
      noInferredContractOrSync:true}));
     console.log('INDEPENDENT RENEWED REAL SAPient CONTACT '+JSON.stringify({freelyAccepted:fresh.newContact,minute:recent.source.minute,actualDay:fday}));
    }else{
     A.equal(Follow.verify(fs,fp),true);
     console.log('INDEPENDENT RENEWED SAPient CONTACT NOT ASSUMED: individual not source-present on the actual next day');
    }
    // Branch a disposable copy: the other social fixtures retain their
    // original moment and personal RNGs. No favourable response assigned.
    const cs=E.importGame(E.exportGame(s)),cp=Realm.peek(cs).emergentPeople.people[p.id],cb=cs.beasts[b.id];
    C.event(cs,'story',cp.name+' offers a gentle voluntary conversation and gives the sapient person space to refuse.',{
     origin:Interact.WITNESS,actorId:cp.actorId,beastId:cb.id,pairSeal:row.seal,
     arrangementHash:entry.seal,arrangementRevision:entry.seal,contactHash:hash(contact),
     location:site,approach:'gentle',
     independentConcreteOpportunity:'Actual gentle approach to discuss shared observations without forcing any contact.',
     actualCommunication:'Previously witnessed local communication and opportunity to decline.',
     unconditionalRightToRefuse:'Both participants retain space to refuse without any coercion or obligation.',
     noCompelledInteraction:true});
    const iw=structuredClone(cs.log.at(-1)),drill={...iw.details,approach:'drill',
     actualJointTimingAndSignalDrill:'The proposed concrete safe timing and signal exercise requires both actual physical bodies.',noMagicOrSyncExercise:true};
    C.event(cs,'story',iw.text,drill);
    const badDrill={actorId:cp.actorId,beastId:cb.id,witnessIndex:cs.log.length-1},noBody=E.exportGame(cs);
    A.throws(()=>R.act(cs,{system:'bond',operation:'npcPairInteract',params:badDrill}),/actual original physical bodies/i);
    A.equal(E.exportGame(cs),noBody);
    C.event(cs,'story',iw.text,iw.details);
    const ir={actorId:cp.actorId,beastId:cb.id,witnessIndex:cs.log.length-1},isave=E.exportGame(cs),irng=cs.rngState;
    A.throws(()=>R.act(cs,{system:'bond',operation:'npcPairInteract',params:{...ir,event:'respected_refusal'}}),/no outcome or affinity/);
    A.equal(E.exportGame(cs),isave);
    const interaction=R.act(cs,{system:'bond',operation:'npcPairInteract',params:ir}),
     receipt=cp.originalBondInteractions[0],q=receipt.source;
    A.equal(Interact.verify(cs,cp),true);A.equal(Pair.verify(cs,cp),true);
    A.equal(cs.rngState,irng);A.equal(interaction.elapsedMinutes,15);
    A.equal(q.before.trust,0);A.equal(q.after.contract,null);A.equal(q.after.syncStage,0);
    const derived=structuredClone(q.before);
    if(q.event)Bond.applyEvent(derived,q.event.event,1);
    A.deepEqual(q.after,derived);
    if(q.event?.event==='respected_refusal'){A.equal(q.after.willingness,3);A.equal(q.check,null);}
    const after=E.exportGame(cs);
    const freshIdx=cs.log.findIndex(x=>hash(x)===q.witnessHash);
    if(freshIdx>=0){
     A.throws(()=>R.act(cs,{system:'bond',operation:'npcPairInteract',params:{...ir,witnessIndex:freshIdx}}),/unused independent pair day/);
     A.equal(E.exportGame(cs),after);
    }
    const ci=E.importGame(after),ic=Realm.peek(ci).emergentPeople.people[p.id];
    A.equal(Interact.verify(ci,ic),true);
    ic.originalBondInteractions[0].source.after.trust=100;
    ic.originalBondInteractions[0].seal=hash(ic.originalBondInteractions[0].source);
    A.equal(Interact.verify(ci,ic),false);
    console.log('INDEPENDENT ORIGINAL PAIR INTERACTION '+JSON.stringify({event:q.event?.event??null,accepted:interaction.accepted,success:interaction.successful}));

   }else{pairCounts.declined++;A.equal(row.bond,null);}
   const afterPair=E.exportGame(s);
   A.throws(()=>R.act(s,{system:'bond',operation:'npcPairRecord',params:request}),/no repeated decision|current voluntary arrangement required/);
   A.equal(E.exportGame(s),afterPair);
   const pairCopy=E.importGame(afterPair),pairP=Realm.peek(pairCopy).emergentPeople.people[p.id];
   A.equal(Pair.verify(pairCopy,pairP),true);
   const fake=pairP.originalBondPairRecognitions[0];
   if(fake.bond)fake.bond.trust=100;else{fake.source.accepted=true;fake.seal=hash(fake.source);}
   A.equal(Pair.verify(pairCopy,pairP),false,'Recognition never establishes manufactured affection or assent');
  }
 }
 if(result.observedOutcome==='human-declined')humanRefusal++;
 if(['beast-declined','beast-proposed-changes'].includes(result.observedOutcome))beastRefusal++;
 if(mutual&&humanRefusal&&beastRefusal&&agreed&&pairCounts.recorded&&pairCounts.declined)break;
}
A.ok(mutual,'At least one genuinely mutually interested disposable pair');
A.ok(humanRefusal>0,'A human must be free to refuse; beast draw not consumed');
A.ok(beastRefusal>0,'The sapient person may refuse or request alternatives');
A.ok(agreed,'Distinct natural participants should genuinely agree to final terms in this bounded sample');
A.ok(pairCounts.recorded>0&&pairCounts.declined>0,'Distinct pairs must genuinely accept and decline separately measured pair recognition');
console.log('INDEPENDENT ORIGINAL UNCOMMITTED PAIR RECORD PASS '+JSON.stringify(pairCounts));
const arrView=Foundation.gmDossier(w,agreed.p.actorId,s).earnedEvidence.beastRelationships;
A.equal(arrView.verifiedPartners,null);
A.equal(arrView.sourceVerifiedSocialArrangements[0].status,'accepted');
const save=E.exportGame(s),copy=E.importGame(save),cp=Realm.peek(copy).emergentPeople.people[mutual.id];
const acceptedPerson=Realm.peek(copy).emergentPeople.people[agreed.p.id];
A.equal(Arrangement.verify(copy,acceptedPerson),true);
const older=E.importGame(save),olderPerson=Realm.peek(older).emergentPeople.people[agreed.p.id],olderBeast=older.beasts[b.id];
// Isolated rolling-memory eviction fixture, NOT a new encounter, elapsed
// life event or retroactively assigned consent. Exact actual archive remains.
olderBeast.sapientLife.history=[];olderBeast.sapientLife.triedEncounters=[];
A.equal(Person.verify(olderBeast),true);
A.equal(Person.contactProof(olderBeast,contact),true);
A.equal(Arrangement.verify(older,olderPerson),true);
A.equal(Pair.verify(older,olderPerson),true);
const archived=olderBeast.sapientLife.contactReceipts.find(x=>x.source.encounterHash===contact.meetingHash);
archived.source.contact.willingness=false;archived.seal=hash(archived.source);olderBeast.sapientLife.contactHead=archived.seal;
A.equal(Person.verify(olderBeast),false,'A resealed falsified original first-contact decision is rejected');
const weeklyWorld=E.newGame({name:'Disposable sixday proof law',seed:87167}),
 week={pairSeal:'pure_law_fixture',day:5,approach:'drill'};
const five=Array.from({length:5},(_,day)=>({seal:'isolated_'+day,source:{pairSeal:week.pairSeal,day,approach:'drill',check:{success:true}}}));
A.deepEqual(Interact.completedTrainingSixday(weeklyWorld,week,five),five.map(x=>x.seal));
A.deepEqual(Interact.completedTrainingSixday(weeklyWorld,week,five.slice(1)),[]);
A.deepEqual(Interact.completedTrainingSixday(weeklyWorld,{...week,day:6},five),[]);
// Isolated counting-law rows convey no actual progress to any actor.
A.equal(Object.keys(weeklyWorld.table?.realm?.emergentPeople?.people||{}).length,0);

const bad=E.importGame(save),bp=Realm.peek(bad).emergentPeople.people[agreed.p.id],
 fake=bp.originalSapientArrangements[0];
fake.source.humanChoice.accepted=false;fake.seal=hash(fake.source);
A.equal(Arrangement.verify(bad,bp),false,'Rehashed false human assent cannot create a cooperative arrangement');
const expired=E.importGame(save);
Time.advance(expired,8);
A.equal(Arrangement.privateStatus(expired,Realm.peek(expired).emergentPeople.people[agreed.p.id])[0].status,'expired');
const welfare=E.importGame(save),wp=Realm.peek(welfare).emergentPeople.people[agreed.p.id];
welfare.beasts[b.id].condition=34;
// Real original sixday welfare owner (disposable condition fixture).
Arrangement.sixday(welfare,[Math.floor(welfare.world.minutes/1440)]);
A.equal(Arrangement.privateStatus(welfare,wp)[0].status,'paused');
A.equal(Arrangement.verify(welfare,wp),true);
// Disposable recovery fixture: not an in-game medical treatment or consent.
welfare.beasts[b.id].condition=copy.beasts[b.id].condition;
const wr=wp.originalSapientArrangements[0],wb=welfare.beasts[b.id],
 reviewRng=wp.rngState,reviewBeastRng=wb.sapientLife.rngState,
 reviewWorldRng=welfare.rngState,reviewMinute=welfare.world.minutes;
C.event(welfare,'story',wp.name+' and the sapient person consider whether to continue their original voluntary arrangement after the welfare pause.',{
 origin:Arrangement.REVIEW,actorId:wp.actorId,beastId:b.id,location:site,
 minute:reviewMinute,contactHash:hash(contact),proposalHash:wr.source.proposalHash,
 arrangementHash:wr.seal,terms:wr.source.terms,
 comprehension:'Both separate people understood the unchanged terms and the option to end the arrangement.',
 communication:'Actually witnessed shared local signs',
 rightToRefuse:'Each individual can independently refuse further cooperation without compelled service.',
 noAssumedSharedLanguage:true,noMagicalPromise:true});
const reviewParams={actorId:wp.actorId,beastId:b.id,witnessIndex:welfare.log.length-1},
 beforeReview=E.exportGame(welfare);
A.throws(()=>R.act(welfare,{system:'bond',operation:'npcSapientArrangementReview',
 params:{...reviewParams,accepted:true}}),/no assigned consent/);
A.equal(E.exportGame(welfare),beforeReview);
const reviewed=R.act(welfare,{system:'bond',operation:'npcSapientArrangementReview',params:reviewParams}),
 rv=wr.events.at(-1).source;
A.equal(rv.kind,'review');A.equal(rv.previous,wr.events[0].seal);
A.equal(rv.humanChoice.rngBefore,reviewRng);
A.equal(rv.humanChoice.rngAfter,wp.rngState);
A.equal(rv.beastChoice?.rngBefore??reviewBeastRng,reviewBeastRng);
A.equal(rv.beastChoice?.rngAfter??reviewBeastRng,wb.sapientLife.rngState);
A.equal(welfare.rngState,reviewWorldRng);A.equal(welfare.world.minutes,reviewMinute);
A.equal(reviewed.mutuallyAccepted,rv.outcome==='resumed');
A.ok(['resumed','paused','withdrawn-by-human','withdrawn-by-beast'].includes(rv.outcome));
A.equal(Arrangement.privateStatus(welfare,wp)[0].status,rv.outcome==='resumed'?'accepted':rv.outcome);
A.equal(Arrangement.verify(welfare,wp),true);
A.equal(welfare.table?.bondRecords?.[b.id],undefined);
A.equal(welfare.player.partnerIds.includes(b.id),false);
const reviewedSave=E.exportGame(welfare);
A.throws(()=>R.act(welfare,{system:'bond',operation:'npcSapientArrangementReview',params:reviewParams}),
 /open same-terms arrangement and unused review day|Separate current informed final terms|Real co-present willing persons/);
A.equal(E.exportGame(welfare),reviewedSave);
const reviewCopy=E.importGame(reviewedSave),
 reviewPerson=Realm.peek(reviewCopy).emergentPeople.people[agreed.p.id];
A.equal(Arrangement.verify(reviewCopy,reviewPerson),true);
const re=reviewPerson.originalSapientArrangements[0].events.at(-1);
re.source.humanChoice.accepted=!re.source.humanChoice.accepted;re.seal=hash(re.source);
A.equal(Arrangement.verify(reviewCopy,reviewPerson),false,'Rehashed false continuation assent rejected');
console.log('INDEPENDENT SAPIENT CONTINUATION REVIEW '+JSON.stringify({outcome:rv.outcome,mutual:reviewed.mutuallyAccepted,noBond:true}));
console.log('INDEPENDENT SAPient FINAL TERMS PASS '+JSON.stringify({finalResults,accepted:true,expiry:true,welfarePause:true}));
A.equal(Bridge.verify(copy,cp),true);
const forged=cp.originalSapientProposalDiscussions[0];
forged.source.beastChoice.rngAfter=1;forged.seal=hash(forged.source);
A.equal(Bridge.verify(copy,cp),false,'Rehashed fake beast decision is not genuine willingness');
console.log('INDEPENDENT HUMAN–SAPIENT PROPOSAL DISCUSSION PASS '+JSON.stringify({results,humanRefusal,beastRefusal,mutual:true,noBond:true}));
