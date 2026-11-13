'use strict';
// #20: published local rights are real jurisdictional SOURCE CONTEXT,
// not caller-invented penalties, beast property or a universal charter.
// This disposable test connects original polity, citizen and sapient-person
// witnesses without touching a campaign or manufacturing an offence.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),World=require('../rules/world'),
 Polities=require('../world/atlas'),
 Gov=require('../world/government-offices'),
 Persons=require('../world/sapient-beast-persons'),
 Civic=require('../world/civic-petitions');
const read=(s,p={})=>R.act(s,{system:'world',operation:'localRightsContext',params:p});
const op=(s,k,p={})=>R.act(s,{system:'world',operation:k,params:p});
const fresh=seed=>E.newGame({seed,name:'Disposable Protected Standing',path:'undecided'});
const petitionText='I ask the existing March Council to examine whether residents and independent intelligent beasts can access protected wetland routes, without treating the allegation as an established offence.';
{
 const s=fresh(995901),before=E.exportGame(s),rng=s.rngState,
  original=read(s);
 A.equal(original.polityId,'reedmarch');
 A.equal(original.regionId,'morrowfen_basin');
 A.equal(original.originalPublishedRights,Polities.P.reedmarch.rights);
 A.equal(original.governingBody,Gov.byId.reedmarch.governingBody);
 A.equal(original.noUniversalRule,true);
 A.equal(original.noOffenceFinding,true);
 A.equal(original.noAutomaticRemedyOrSeizure,true);
 A.equal(original.noCompelledBeastConsent,true);
 A.equal(original.claimOrSubject,null);
 A.equal(s.world.location,'crossing');
 A.equal(E.exportGame(s),before);
 A.equal(s.rngState,rng);
 for(const p of [
  {polityId:'reef_cantons'},
  {law:'universal compulsory bond'},
  {beastId:'phantom'},
  {petitionId:'invented_order'},
  {beastId:'phantom',petitionId:'invented_order'},
  {verdict:true}
 ]){
  A.throws(()=>read(s,p),/only one|one original|original locally filed|actually encountered|source/);
  A.equal(E.exportGame(s),before);
 }
 // The resident alone writes the same original civic complaint. It does
 // not automatically establish that anyone committed a violation.
 const filed=R.act(s,{system:'social',operation:'petition',
  params:{statement:petitionText}});
 A.equal(filed.filed,true);
 const row=s.table.civicPetitions.records.find(x=>x.petitionId===filed.petitionId);
 A.equal(Civic.sourceCheck(s,row),true);
 const linked=read(s,{petitionId:filed.petitionId});
 A.equal(linked.polityId,'reedmarch');
 A.equal(linked.claimOrSubject.originalFilingHash,row.eventHash);
 A.equal(linked.claimOrSubject.allegationProven,false);
 A.equal(linked.claimOrSubject.knownCouncilDecision,null);
 A.equal(linked.claimOrSubject.noBindingOffenceOrLegalRemedy,true);
 const pre=E.exportGame(s);
 A.deepEqual(read(s,{petitionId:filed.petitionId}),linked);
 A.equal(E.exportGame(s),pre);
 World.advance(s,6);
 A.equal(row.state,'at_counter');
 A.equal(read(s,{petitionId:filed.petitionId}).claimOrSubject.knownCouncilDecision,null,
  'a sealed council response is not public before the resident collects it');
 A.equal(E.exportGame(E.importGame(E.exportGame(s))),E.exportGame(s));
 // Human polity rights never become the law of a different established
 // autonomous beast polity merely because a petitioner asks.
 op(s,'establishPlace',{
  placeId:'legal_reef_commons',
  name:'Legal Reef Commons',
  regionId:'living_atoll',
  description:'A witnessed inhabited reef commons of the Reef Cantons with an identifiable local public civic charter.',
  kind:'communal chamber',sceneType:'structure'
 });
 const trip=op(s,'travelTo',{destinationId:'legal_reef_commons',
  minutes:180,
  journey:'The documented journey crosses the known waters and reaches a genuine local reef community under its own polity.',
  uncontested:true});
 A.equal(trip.arrived,true);
 const reef=read(s),saved=E.exportGame(s);
 A.equal(reef.polityId,'reef_cantons');
 A.equal(reef.regionId,'living_atoll');
 A.equal(reef.originalPublishedRights,Polities.P.reef_cantons.rights);
 A.notEqual(reef.originalPublishedRights,original.originalPublishedRights);
 A.equal(reef.noUniversalRule,true);
 A.throws(()=>read(s,{petitionId:filed.petitionId}),
  /original locally filed civic allegation|foreign office/);
 A.equal(E.exportGame(s),saved);
}
{
 // The person is first met through genuine original world encounters.
 // A species label or unencountered remote beast is not a legal witness.
 let present=null;
 for(let seed=963202;seed<963222&&!present;seed++){
  const s=fresh(seed);
  A.equal(E.dispatch(s,'travel forest').ok,true);
  for(let i=0;i<150;i++){
   A.equal(E.dispatch(s,'explore').ok,true);
   const b=s.beasts[s.encounter.beastId],
    species=E.SPECIES[b.species];
   if(species.intelligence==='sapient'&&!s.encounter.threat&&
      !/hostile|agitated|panicked|terrified|fleeing/i.test(b.mood)){
    const witnessed=R.act(s,{system:'social',operation:'meetSapientBeast',
     params:{}});
    if(witnessed.freelyEngaged&&b.away!==true&&
       b.location===s.world.location){
     A.equal(Persons.verify(b),true);
     present={s,b};
    }
    break;
   }
   A.equal(E.dispatch(s,'leave').ok,true);
  }
 }
 A.ok(present,'a genuinely willing present sapient individual must be met in disposable original source fixtures');
 const {s,b}=present,before=E.exportGame(s),rng=s.rngState;
 const view=read(s,{beastId:b.id});
 A.equal(view.polityId,'reedmarch');
 A.equal(view.claimOrSubject.kind,'personally-witnessed-sapient-person');
 A.equal(view.claimOrSubject.witnessedSourceHash,b.sapientLife.sourceHash);
 A.equal(view.claimOrSubject.notPropertyBySpecies,true);
 A.equal(view.claimOrSubject.noAssumedContract,true);
 A.equal(view.claimOrSubject.localPersonhoodOrProtectionMustFollowActualCharter,true);
 A.equal(view.noOffenceFinding,true);
 A.equal(E.exportGame(s),before);
 A.equal(s.rngState,rng);
 A.throws(()=>read(s,{beastId:'imaginary_sapient_person'}),/actually encountered/);
 A.equal(E.exportGame(s),before);
 A.equal(E.dispatch(s,'leave').ok,true);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 A.throws(()=>read(s,{beastId:b.id}),/presently witnessed|actually encountered/);
 const after=E.exportGame(s);
 A.equal(E.exportGame(E.importGame(after)),after);
}
console.log('Foundation #20: two original unlike local rights charters, genuine resident allegation without automatic finding or disclosed reply, actual independent sapient individual standing without property or consent claim, tamper rejection, read-only source, save continuity PASS');
