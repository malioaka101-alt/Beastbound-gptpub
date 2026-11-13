'use strict';
// #20: real local laws require an ACTUAL authored sovereign charter
// competence and a previously witnessed civic proceeding with two real,
// independently approving sapient persons. A charter or allegation alone
// creates no law, punishment, contract, ownership or official verdict.
// Disposable original-world fixtures; no active campaign state changed.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),R=require('../rules'),Core=require('../rules/core'),
 Time=require('../rules/world'),Civic=require('../world/beast-civic-life'),
 Realm=require('../world/simulation'),Persons=require('../world/sapient-beast-persons');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const op=(s,operation,params={})=>R.act(s,{system:'world',operation,params});
const legalCompetence={
 authoritySource:'The independently established Reef Cantons communal charter authorises this assembly to enact only local nursery and navigation rules after witnessed voluntary council deliberation.',
 procedure:'Two or more actual independently consenting council members must personally support each published local rule, with every present member choosing their own recorded position.',
 scope:'Local nursery protection, public passage and living-water care within the original Reef Cantons.',
 minimumNoticeDays:2};
const charter={polityId:'reef_cantons',institutionId:'reef_free_civic_council',
 name:'Reef Free Civic Council',kind:'independent civic council',
 mandate:'Make voluntary and publicly witnessed local rules for life in the original Reef Cantons within the limited source-backed charter.',
 language:'Water-sign and individual, independently negotiated sound-cues',
 medium:'Witnessed fin positions and shared luminous gestures',
 rules:'Only genuinely attending free participants can accept a public rule, with no imposed magical bond, custody or presumed understanding.',
 source:'The original reef polity establishes its public local rulemaking competence; it does not govern other sovereign polities or coerce any sapient person.',
 legalCompetence,visibility:'public'};
function newWorld(seed){return E.newGame({name:'Disposable Local Civic Law',seed,path:'undecided'});}
function discover(s){
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const found=[];
 for(let i=0;i<450&&found.length<2;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId],spec=E.SPECIES[b.species];
  if(spec.intelligence==='sapient'&&!s.encounter.threat&&
   !/hostile|agitated|panicked|terrified|fleeing/i.test(b.mood)){
   const choice=R.act(s,{system:'social',operation:'meetSapientBeast',params:{}});
   A.equal(Persons.verify(b),true);
   if(choice.freelyEngaged)found.push(b);
  }
  if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.equal(found.length,2,'two actual individually willing sapient people must be encountered, not authored into the fixture');
 return found;
}
function scene(s,ids,original){
 Core.event(s,'story','Independent reef assembly members are individually witnessed discussing a local civic article without compelling any person or beast.',{
  origin:Civic.SESSION,polityId:charter.polityId,
  institutionId:charter.institutionId,location:s.world.location,
  topic:'Public local reef protection and independent passage terms',
  result:'The named participating free members personally record their distinct local civic positions in the original assembly.',
  basis:'This previously chartered real reef council records independently witnessed assent and dissent at a personally attended deliberation.',
  participants:ids,visibility:'public',
  ...(original?{enactment:original}:{})});
 return s.log.length-1;
}
function rule(s,ids,id,conduct){
 const day=Math.floor(s.world.minutes/1440);
 return {id,jurisdictionRegionId:'living_atoll',
  conductRule:conduct,
  rightsAndLimits:'No person is owned by species, and navigation restrictions must not compel consent or partnership from any individual.',
  permittedRemedy:'A competent local council may order review of an observed obstruction and invite safe restoration without assuming fault or transferring goods.',
  appealProcess:'Any affected individual may challenge the observation and request a later separately witnessed review under this council charter.',
  effectiveDay:day+2,originalProcedure:legalCompetence.procedure,
  ratifications:ids.map(beastId=>({beastId,assented:true,
   basis:'This person separately and freely supports the specific article after directly witnessing the complete proposed local wording.'}))};
}
{
 // A GM-authored charter describes possible scope; it is NOT an
 // enactment, even when its text discusses political power.
 const s=newWorld(990502);
 A.equal(op(s,'beastCivicAuthorInstitution',charter).established,true);
 const i=s.table.realm.countries.reef_cantons.beastCivic.institutions[charter.institutionId];
 A.equal(Civic._debug.verifyInstitution(s.table.realm,'reef_cantons',i.id),i);
 A.equal(i.sessions.length,0);
 A.equal(op(s,'beastCivicStatus').known.length,0,
  'remote local rules and private people are not knowledge');
 const before=E.exportGame(s);
 A.throws(()=>op(s,'beastCivicAuthorInstitution',{
  ...charter,institutionId:'fake_secret_legislature',
  visibility:'gm-only'}),/needs original civic mandate/);
 A.equal(E.exportGame(s),before,'an unseen covert group cannot automatically enact a public penal law');
}
{
 const s=newWorld(990503),beasts=discover(s),ids=beasts.map(x=>x.id),
  oldRanks=beasts.map(b=>b.level),
  oldOwners=beasts.map(b=>b.owner),
  initialPartners=[...s.player.partnerIds],
  w=Realm.ensure(s);
 A.equal(op(s,'beastCivicAuthorInstitution',charter).established,true);
 op(s,'establishPlace',{placeId:'reef_law_meeting_room',
  name:'Independent Reef Law Assembly',
  regionId:'living_atoll',
  description:'A physically reached, original public reef assembly where independent sapient members may speak or decline without surrendering their autonomy.',
  kind:'communal chamber',sceneType:'structure'});
 const trip=op(s,'travelTo',{destinationId:'reef_law_meeting_room',
  minutes:180,journey:'The witnessed original sea crossing reaches an existing freely attended reef civic meeting space without creating government authority.',
  uncontested:true});
 A.equal(trip.arrived,true);
 for(const b of beasts){
  Core.event(s,'story','A real independently engaged person voluntarily attends the public reef discussion.',{
   origin:'witnessed-independent-beast-journey-fixture',beastId:b.id,
   arrivedAt:s.world.location});
  b.location=s.world.location;b.away=false;
 }
 const inst=w.countries.reef_cantons.beastCivic.institutions[charter.institutionId],
  coins=s.player.coins,beforePlayerRng=s.rngState,first=rule(s,ids,
   'nursery_tide_protection','Avoid blocking a publicly identified nursery waterway during an independently witnessed seasonal migration.');
 const fakeFirst={...first,ratifications:first.ratifications.map((v,i)=>({
  ...v,assented:i!==1}))};
 let index=scene(s,ids,fakeFirst),untouched=E.exportGame(s);
 A.throws(()=>op(s,'beastCivicProceeding',{
  polityId:charter.polityId,institutionId:charter.institutionId,eventIndex:index
 }),/two independent consenting ratifiers/);
 A.equal(E.exportGame(s),untouched);
 // An unrelated public debate does not enact ANY rules.
 index=scene(s,ids,null);
 A.equal(op(s,'beastCivicProceeding',{
  polityId:charter.polityId,institutionId:charter.institutionId,eventIndex:index
 }).recorded,true);
 A.equal(inst.sessions.length,1);
 index=scene(s,ids,first);
 const passed=op(s,'beastCivicProceeding',{
  polityId:charter.polityId,institutionId:charter.institutionId,eventIndex:index});
 A.equal(passed.witnessedLocalRuleId,first.id);
 A.equal(passed.noAutomaticOffenceOrEnforcement,true);
 A.equal(inst.sessions.length,2);
 A.throws(()=>op(s,'beastCivicProceeding',{
  polityId:charter.polityId,institutionId:charter.institutionId,eventIndex:index
 }),/cannot be recorded twice/);
 const second=rule(s,ids,'free_current_access',
  'Do not obstruct an independently established public rescue passage without a separately justified local safety hearing.');
 index=scene(s,ids,second);
 A.equal(op(s,'beastCivicProceeding',{polityId:charter.polityId,
  institutionId:charter.institutionId,eventIndex:index}).witnessedLocalRuleId,
  second.id);
 A.equal(Civic._debug.verifyInstitution(w,charter.polityId,charter.institutionId),inst);
 let view=op(s,'beastCivicStatus').known.find(x=>x.id===charter.institutionId);
 A.equal(view.publicLocalRules.length,0,
  'an enacted provision cannot bind anyone before the source-authored public notice delay');
 A.equal(s.player.coins,coins);
 A.equal(s.rngState,beforePlayerRng,'recording a witnessed vote cannot roll another private choice');
 A.deepEqual(beasts.map(b=>b.owner),oldOwners);
 A.deepEqual(beasts.map(b=>b.level),oldRanks);
 A.deepEqual(s.player.partnerIds,initialPartners);
 Time.advance(s,2);
 view=op(s,'beastCivicStatus').known.find(x=>x.id===charter.institutionId);
 A.deepEqual(view.publicLocalRules.map(x=>x.instrumentId),[first.id,second.id]);
 A.equal(view.publicLocalRules[0].conductRule,first.conductRule);
 A.equal(view.publicLocalRules[0].rightsAndLimits,first.rightsAndLimits);
 A.equal(view.publicLocalRules[0].appealProcess,first.appealProcess);
 A.equal(view.publicLocalRules[0].noAutomaticConvictionOrPropertyTransfer,true);
 A.equal(view.publicLocalRules[1].jurisdictionRegionId,'living_atoll');
 A.equal(s.player.coins,coins);
 A.deepEqual(s.player.partnerIds,initialPartners);
 A.deepEqual(beasts.map(b=>b.owner),oldOwners);
 const saved=E.exportGame(s),snapshot=E.importGame(saved);
 A.equal(E.exportGame(snapshot),saved);
 A.deepEqual(op(snapshot,'beastCivicStatus'),op(s,'beastCivicStatus'));
 A.equal(Civic._debug.verifyInstitution(snapshot.table.realm,
  charter.polityId,charter.institutionId).sessions.length,3);
 // A forged legal text cannot be made authentic by merely recalculating
 // its receipt seal: it must STILL match the original witnessed event.
 const receipt=inst.sessions[1],original=structuredClone(receipt);
 receipt.source.details.enactment.conductRule='A forged local rule demands compulsory magical capture.';
 receipt.seal=hash(receipt.source);
 A.throws(()=>Civic._debug.verifyInstitution(w,charter.polityId,
  charter.institutionId),/Institutional origin, witnessed law/);
 inst.sessions[1]=original;
 A.equal(Civic._debug.verifyInstitution(w,charter.polityId,charter.institutionId),inst);
 // Inventing a duplicate law ID, foreign territory, or retroactive date
 // inside a NEW witnessed scene does not create a legal rule.
 for(const altered of [
  {...second,id:first.id},
  {...second,id:'foreign_court_rule',jurisdictionRegionId:'morrowfen_basin'},
  {...second,id:'retroactive_penalty',effectiveDay:0},
  {...second,id:'forced_vote',ratifications:second.ratifications.map(x=>({...x,assented:false}))}
 ]){
  const i=scene(s,ids,altered),before=E.exportGame(s);
  A.throws(()=>op(s,'beastCivicProceeding',{polityId:charter.polityId,
   institutionId:charter.institutionId,eventIndex:i}),
   /competent charter|two independent consenting ratifiers/);
  A.equal(E.exportGame(s),before);
 }
 A.equal(op(s,'beastCivicStatus').known[0].publicLocalRules.length,2);
 A.equal(E.exportGame(E.importGame(E.exportGame(s))),E.exportGame(s));
}
console.log('Foundation #20: source-authored independent beast-polity legal competence, genuine two-person ratified local conduct articles and bounded remedy/appeal text, distinct unlike laws, delayed public notice, never a conviction/ownership transfer, old charter compatibility, forged/cross-border/retroactive cases rejected, no second roll and original-save replay PASS');
