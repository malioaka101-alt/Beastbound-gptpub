'use strict';
// Disposable character origins. Creation rolls are seed-reproducible, never
// runtime d20 rolls or a source of granted spells, titles, consent or rank.
const A=require('node:assert/strict');
const E=require('../engine');
const N=require('../scripts/new-campaign');
const O=require('../scripts/campaign-origins');
const Atlas=require('../world/atlas');
const Houses=require('../world/social-houses');
const Heritage=require('../world/renown-and-practice');
const Groups=require('../world/emergent-groups');
const Realm=require('../world/simulation');

function fresh(seed,opts={}){
 return N.create({seed,slug:'campaign_origin_fixture',...opts});
}
const observed=new Set(),regions=new Set(),worlds=new Set(),physiques=new Set(),appearances=new Set();
for(let seed=1;seed<=180;seed++){
 const a=fresh(seed),b=fresh(seed);
 A.deepEqual(a,b,'A random founding must reproduce the exact character and world');
 const s=E.importGame(E.exportGame(a.state));
 A.equal(s.player.name,a.summary.name);
 A.equal(s.campaign.origin.seed,seed);
 A.equal(s.campaign.origin.noUnearnedPowers,true);
 A.equal(s.campaign.origin.noAutomaticNPCConsent,true);
 A.equal(s.campaign.oldCampaignImported,false);
 A.ok(Atlas.R[s.player.startingContext.birthRegionId]);
 A.ok(E.LOCATIONS[s.world.location]);
 A.equal(s.world.location,s.campaign.startingLocation);
 A.equal(s.table.realm.ticks.sixdays,0);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.soul.phase,0);
 A.equal(s.player.rift.step,0);
 A.equal(s.player.origin.stableTraits.length,0);
 A.deepEqual(s.player.family.members,a.summary.family.members);
 A.ok(s.player.history.upbringing);
 A.ok(s.player.history.earlyWork);
 A.ok(!JSON.stringify(s).includes('Aerin Marsh'));
 observed.add(s.player.startingContext.originKind);
 regions.add(s.player.startingContext.birthRegionId);
 worlds.add(s.player.startingContext.continent);
 physiques.add(Object.values(s.player.attributes).join(','));
 appearances.add(s.player.appearance);
 A.ok(Object.values(s.player.attributes).every(x=>
  Number.isInteger(x)&&x>=8&&x<=17));
 A.equal(a.summary.appearance,s.player.appearance);
 A.equal(a.summary.attributes.str,s.player.attributes.str);
 A.equal(s.player.capabilityProfile.potential.soulDepth.assessments.length,0);
 if(s.player.startingContext.originKind==='renowned-family'){
  const h=Houses.byId[s.player.startingContext.connection.houseId];
  A.ok(Heritage.RENOWNED.some(x=>x.house===h.id));
  A.equal(s.player.family.house.noAutomaticPrivateMethod,true);
  A.equal(s.player.family.house.noAutomaticOffice,true);
 }
 if(s.player.startingContext.originKind==='new-organisation'){
  const id=s.player.startingContext.connection.groupId;
  const w=Realm.peek(s),g=Groups.lookup(w,id);
  A.ok(g,'Player-founded original organisations must exist in the actual world registry');
  A.equal(g.members,1);
  A.equal(g.funds,0);
  A.equal(g.founder.name,s.player.name);
  A.equal(g.witness.details.otherMembersConfirmed,false);
  A.equal(g.charter.politicalStatus,'informal, self-described; no official recognition');
 }
}
A.ok(observed.has('renowned-family'),'Rare famous-family births must be reachable');
A.ok(observed.has('historic-family'));
A.ok(observed.has('new-family'));
A.ok(observed.has('institution'));
A.ok(observed.has('new-organisation'));
A.ok(observed.has('independent'));
A.ok(observed.has('community'));
A.ok(observed.has('ordinary'));
A.ok(regions.size>=12,'Random homes must use the cross-continental source atlas');
A.ok(worlds.size>=5,'Founding history cannot remain confined to one country');
A.ok(physiques.size>=70,'Initial physical and mental attributes must meaningfully vary');
A.ok(appearances.size>=35,'Opening appearance is varied without fixed personality');

const heir=fresh(3245001,{originKind:'renowned-family',
 houseId:'openpeak',houseRelation:'birth-branch',
 path:'body',gender:'female'});
A.equal(heir.state.player.family.house.id,'openpeak');
A.equal(heir.state.player.family.house.relation,'birth-branch');
A.match(heir.state.player.name,/Openpeak$/);
A.equal(heir.state.player.body.cycles.length,0);
A.equal(heir.state.player.meridian.stage,0);
A.equal(heir.state.player.skills.cultivation.rank,0);
A.equal(heir.state.player.capabilityProfile.potential.meridianBreadth.assessments.length,0);
A.ok(heir.state.player.family.members.length>=0);

const maker=fresh(3245002,{mode:'guided',name:'Dara Alton',age:37,
 gender:'nonbinary',pronouns:'they/them',originKind:'new-family',
 homeRegion:'forge_basin',background:'shipwright',path:'rift',
 role:'independent hull repairer',goal:'learn safer emergency routes',
 startLocation:'crossing'});
A.equal(maker.state.player.name,'Dara Alton');
A.equal(maker.state.player.age,37);
A.equal(maker.state.player.gender,'nonbinary');
A.equal(maker.state.player.pronouns,'they/them');
A.equal(maker.state.player.background,'shipwright');
A.equal(maker.state.player.rift.step,0);
A.equal(maker.state.player.startingContext.birthRegionId,'forge_basin');
A.equal(maker.state.player.startingContext.travelBeforePlay,true);
A.equal(maker.state.player.history.ownOccupation,'independent hull repairer');
A.equal(maker.state.player.history.personalGoal,'learn safer emergency routes');
A.equal(maker.state.player.family.familyIdentity.noHereditaryRank,true);
A.equal(maker.state.world.location,'crossing');
A.equal(maker.state.player.partnerIds.length,0);

const scholar=fresh(3245003,{originKind:'institution',institutionId:'forge_university',
 homeRegion:'forge_basin',background:'scholar',path:'arcane'});
A.equal(scholar.state.player.startingContext.connection.institutionId,'forge_university');
A.equal(scholar.state.player.startingContext.connection.noEnrolment,true);
A.equal(scholar.state.player.arcane.circles,0);
A.equal(scholar.state.player.arcane.coreStability,90);
A.equal(scholar.state.player.partnerIds.length,0);

const org=fresh(3245004,{originKind:'new-organisation',
 groupName:'Canal Field Scholars',groupKind:'working circle',
 groupPurpose:'Compare real ferry observations without coercing beasts',
 startLocation:'crossing',mode:'guided'});
const groupId=org.state.player.startingContext.connection.groupId;
const w=Realm.peek(org.state),g=Groups.lookup(w,groupId);
A.ok(g);A.equal(g.charter.name,'Canal Field Scholars');
A.equal(g.charter.duty,'Compare real ferry observations without coercing beasts');
A.equal(g.verifiedMembers,1);
A.equal(g.charter.authorityRule,'no government or legal house office follows from this founding');
A.equal(g.charter.heritage,'unverified; no supernatural or hereditary trait established');
A.equal(w.houses[groupId].influence,1);
A.equal(org.state.player.meridian.stage,0);
A.equal(org.state.player.arcane.circles,0);
const after=E.importGame(E.exportGame(org.state));
A.ok(Groups.lookup(Realm.peek(after),groupId),'Founding survives a real save/reload');
A.equal(after.campaign.origin.connection.groupId,groupId);

const ward=fresh(3245005,{originKind:'historic-family',houseId:'manytracks',
 houseRelation:'ward'});
A.equal(ward.state.player.family.house.id,'manytracks');
A.equal(ward.state.player.family.house.relation,'ward');
A.equal(ward.state.player.humanEvolution.stage,0);
A.throws(()=>fresh(3245005,{originKind:'historic-family',
 houseId:'manytracks',houseRelation:'birth-branch'}),/lineage|historical/i);
A.throws(()=>fresh(3245005,{originKind:'renowned-family',
 houseId:'goldbough'}),/lineage|Historical|house/i);
A.throws(()=>fresh(3245005,{originKind:'institution',
 institutionId:'missing_academy'}),/institution/i);
A.throws(()=>fresh(3245005,{originKind:'renowned-family',
 houseId:'openpeak',homeRegion:'forge_basin'}),/homeland|polity/i);
A.throws(()=>fresh(3245005,{originKind:'new-organisation',
 groupName:'A'}),/Group name/i);
A.throws(()=>fresh(3245005,{age:-4}),/age/i);
A.throws(()=>fresh(3245005,{startLocation:'unreachable_realm'}),/location/i);
A.throws(()=>fresh(3245005,{path:'automatic_godhood'}),/path/i);
A.throws(()=>fresh(3245005,{originKind:'anything'}),/origin kind/i);

console.log('Campaign origins: deterministic random/guided starts across atlas, renowned house births, genuine new families, professions and institutions, source-valid local associations, original-save continuity and no false powers');
