'use strict';
// #07: Disposable source-witnessed beast cities, no campaign saves.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 C=require('../rules/core'),Time=require('../rules/world'),
 Civ=require('../world/beast-civic-life'),Persons=require('../world/sapient-beast-persons'),
 Turn=require('../scripts/chat-turn');
const op=(s,k,p={})=>R.act(s,{system:'world',operation:k,params:p});
const charter={polityId:'reef_cantons',institutionId:'reef_listening_court',
 name:'Listening Current Assembly',kind:'consensual reef tribunal',
 mandate:'Arbitrate access to living reef nurseries and tidal passage without compelling participation.',
 language:'Chimecode with negotiated water-sign translation',
 medium:'Underwater pulse and bioluminescent motion cues',
 rules:'Public hearings require testimony and acknowledged consent from individual participants.',
 source:'Original independent reef-canton civil charter established in witnessed community tradition.',
 visibility:'public'};
function fresh(seed=990501){
 return E.newGame({name:'Beast Civic Disposable Fixture',seed,path:'undecided'});
}
function discover(s,minimum=2){
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const found=[];
 for(let i=0;i<350&&found.length<minimum;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId],def=E.SPECIES[b.species];
  if(def.intelligence==='sapient'&&!s.encounter.threat&&
   !/hostile|agitated|panicked|terrified|fleeing/i.test(b.mood)){
   R.act(s,{system:'social',operation:'meetSapientBeast',params:{}});
   A.equal(Persons.verify(b),true);
   found.push(b);
  }
  if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.equal(found.length,minimum,'Actual original sapient witnesses must be available');
 return found;
}
function enterAtoll(s){
 op(s,'establishPlace',{placeId:'reef_commons_room',name:'Listening-Current Chamber',
  regionId:'living_atoll',
  description:'A sunken open meeting chamber within the actual inhabited Living Atoll reef, reached after a documented journey.',
  kind:'communal chamber',sceneType:'structure'});
 const res=op(s,'travelTo',{destinationId:'reef_commons_room',minutes:180,
  journey:'The witnessed sea crossing and safe descent reach the established reef communal chamber after a completed passage.',
  uncontested:true});
 A.equal(res.arrived,true);
}
{
 const s=fresh(990502),initial=E.exportGame(s),rng=s.rngState;
 A.deepEqual(op(s,'beastCivicStatus').known,[]);
 A.throws(()=>op(s,'beastCivicAuthorInstitution',{
  ...charter,polityId:'reedmarch'}),/autonomous recognised beast polity/);
 A.equal(E.exportGame(s),initial);
 A.equal(op(s,'beastCivicAuthorInstitution',charter).established,true);
 A.equal(s.rngState,rng,'Authorship is not an encounter or a dice roll');
 A.deepEqual(op(s,'beastCivicStatus').known,[],
  'Remote civic institutions cannot become player-known by reading a hidden save');
 const c=s.table.realm.countries.reef_cantons.beastCivic;
 A.equal(Object.keys(c.institutions).length,1);
 A.equal(Object.keys(s.beasts).length,0);
 A.equal(Civ._debug.journal(c.institutions[charter.institutionId]),true);
 A.throws(()=>op(s,'beastCivicAuthorInstitution',charter),/already established/);
 A.equal(op(s,'beastCivicAuthorInstitution',{
  ...charter,institutionId:'depth_ward',name:'Deep-Current Wardens',
  language:'Distinct non-verbal bioluminescent calling sequences',
  medium:'Submerged light and fin pressure',
  visibility:'gm-only'}).established,true);
 const before=E.exportGame(s);
 A.deepEqual(op(s,'beastCivicStatus').known,[]);
 A.equal(E.exportGame(s),before);
}
{
 const s=fresh(990503),residents=discover(s),ids=residents.map(x=>x.id);
 const individualOriginal=ids.map(id=>s.beasts[id].level);
 const peopleBefore=Object.keys(s.beasts).length;
 A.equal(op(s,'beastCivicAuthorInstitution',charter).established,true);
 const secrecy={...charter,institutionId:'private_tides',
  name:'Reserved Coral Safety Chamber',visibility:'gm-only'};
 A.equal(op(s,'beastCivicAuthorInstitution',secrecy).established,true);
 enterAtoll(s);
 for(const beast of residents){
  // Fixture: after their independently verified prior contact, both
  // independently arrive at the witnessed public civic meeting.
  C.event(s,'story','The independent beast person travels to the open reef chamber for a public hearing.',
   {origin:'witnessed-independent-beast-journey-fixture',
    beastId:beast.id,arrivedAt:s.world.location});
  beast.location=s.world.location;beast.away=false;
 }
 const view=op(s,'beastCivicStatus');
 A.equal(view.polity,'Reef Cantons');
 A.deepEqual(view.known.map(x=>x.id),['reef_listening_court']);
 A.deepEqual(view.households,[]);
 const original=E.exportGame(s),originalRng=s.rngState;
 A.throws(()=>op(s,'beastCivicProceeding',{polityId:'reef_cantons',
  institutionId:charter.institutionId,eventIndex:0}),/personally witnessed original source/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,originalRng);
 C.event(s,'story','The living reef court listens to two free persons who accept a public review of sanctuary access.',{
  origin:Civ.SESSION,polityId:'reef_cantons',institutionId:charter.institutionId,
  location:s.world.location,topic:'Safeguard the shared spawning corridors',
  result:'The assembly records a hearing and an independently accepted mandate to study local water risks.',
  basis:'The two actual named free persons were witnessed participating without forced bond or imposed office.',
  participants:ids,visibility:'public',
  office:{title:'Voluntary Tide Listener',holderId:ids[0],holderAgreed:true,
   acceptanceBasis:'A separately witnessed personal agreement to serve a limited advisory listening term.'}});
 const ix=s.log.length-1;
 A.equal(op(s,'beastCivicProceeding',{polityId:'reef_cantons',
  institutionId:charter.institutionId,eventIndex:ix}).recorded,true);
 A.throws(()=>op(s,'beastCivicProceeding',{polityId:'reef_cantons',
  institutionId:charter.institutionId,eventIndex:ix}),/cannot be recorded twice/);
 const after=op(s,'beastCivicStatus');
 A.equal(after.known[0].publicProceedings.length,1);
 A.equal(after.known[0].publicProceedings[0].topic,'Safeguard the shared spawning corridors');
 A.equal(after.known[0].publicOffices[0].title,'Voluntary Tide Listener');
 A.equal(after.known[0].publicOffices[0].witnessedAcceptance,true);
 A.equal(JSON.stringify(after).includes('privateCompetence'),false,
  'A known office does not expose private aptitude or compel future duty');
 C.event(s,'story','A mutually acknowledged compact is heard in the reef civic chamber by the actual participating delegates.',{
  origin:Civ.SESSION,polityId:'reef_cantons',institutionId:charter.institutionId,
  location:s.world.location,topic:'Reef and island sanctuary passage',
  result:'A bilateral conditional passage understanding is documented without changing border control.',
  basis:'Independent human and reef polities each ratified the same attached source terms in this original hearing.',
  participants:ids,visibility:'gm-only',
  treaty:{polities:['reef_cantons','tide_assembly'],
   acceptedBy:['reef_cantons','tide_assembly'],
   terms:'Each participating polity separately recognises the agreed protected crossing corridor, subject to its own law.'}});
 A.equal(op(s,'beastCivicProceeding',{polityId:'reef_cantons',
  institutionId:charter.institutionId,eventIndex:s.log.length-1}).recorded,true);
 A.equal(op(s,'beastCivicStatus').known[0].publicProceedings.length,1,
  'Private ratification scenes are not automatically disclosed');
 const trade=Object.values(s.table.realm.diplomacy).find(d=>
  d.a==='reef_cantons'&&d.b==='tide_assembly'||d.b==='reef_cantons'&&d.a==='tide_assembly');
 A.equal(trade.civicTreaties.length,1);
 A.ok(trade.civicTreaties[0].seal);
 C.event(s,'story','Two free sapient residents each clearly choose a shared non-ownership home in the established reef chambers.',{
  origin:Civ.HOME,polityId:'reef_cantons',location:s.world.location,
  householdId:'reef_shaded_home',name:'Shaded Water Household',
  visibility:'public',
  individualChoices:ids.map(beastId=>({beastId,accepted:true,
   basis:'The individual independently and personally agrees to share shelter without transfer of personhood.'}))});
 A.equal(op(s,'beastCivicHousehold',{polityId:'reef_cantons',
  householdId:'reef_shaded_home',eventIndex:s.log.length-1}).recorded,true);
 A.equal(op(s,'beastCivicStatus').households[0].residents,2);
 A.throws(()=>op(s,'beastCivicHousehold',{polityId:'reef_cantons',
  householdId:'reef_shaded_home',eventIndex:s.log.length-1}),/already has a specific history/);
 A.equal(Object.keys(s.beasts).length,peopleBefore);
 A.deepEqual(ids.map(id=>s.beasts[id].level),individualOriginal);
 A.equal(s.player.partnerIds.length,0);
 A.equal(Object.keys(s.table?.bondRecords||{}).length,0);
 const beforeMonth=E.exportGame(s),parallel=E.importGame(beforeMonth);
 s.table.realm.countries.reef_cantons.stability=0;
 parallel.table.realm.countries.reef_cantons.stability=0;
 Time.advance(s,32);Time.advance(parallel,32);
 A.deepEqual(s.table.realm.countries.reef_cantons.beastCivic,
  parallel.table.realm.countries.reef_cantons.beastCivic,
  'The same existing world clock must run autonomous polity reviews deterministically');
 A.equal(s.table.realm.countries.reef_cantons.beastCivic.institutions.reef_listening_court.currentlyNeedsReview,true);
 A.equal(Civ._debug.journal(s.table.realm.countries.reef_cantons.beastCivic.institutions.reef_listening_court),true);
 const copied=E.importGame(E.exportGame(s));
 A.equal(Civ._debug.journal(copied.table.realm.countries.reef_cantons.beastCivic.institutions.reef_listening_court),true);
 const forged=E.importGame(E.exportGame(s));
 forged.table.realm.countries.reef_cantons.beastCivic.institutions.reef_listening_court.origin.mandate='False charter';
 A.throws(()=>Civ._debug.verifyInstitution(forged.table.realm,'reef_cantons','reef_listening_court'),/were changed/);
}
{
 const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-beast-civic-'));
 try{
  const s=fresh(990504),save=Path.join(tmp,'save.json');
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const before=FS.readFileSync(save,'utf8');
  const author={id:'civic_charter_00001',mode:'rule',system:'world',
   operation:'beastCivicAuthorInstitution',params:charter};
  A.equal(Turn.execute(save,author).applied,true);
  const once=FS.readFileSync(save,'utf8');
  A.equal(Turn.execute(save,author).duplicate,true);
  A.equal(FS.readFileSync(save,'utf8'),once);
  const read={id:'civic_status_00001',mode:'rule',system:'world',
   operation:'beastCivicStatus',params:{}};
  A.equal(Turn.execute(save,read).applied,false);
  A.equal(FS.readFileSync(save,'utf8'),once);
  const imported=E.importGame(once);
  A.equal(Civ._debug.verifyInstitution(imported.table.realm,'reef_cantons','reef_listening_court').origin.language,charter.language);
  A.notEqual(before,once);
 }finally{FS.rmSync(tmp,{recursive:true,force:true});}
}
console.log('Intelligent beast polities: open original cultural charters; real sapient persons in witnessed hearings, offices, reciprocal diplomacy and voluntary households; private local disclosure, independent pressure review, tamper checks and exact turn replay.');
