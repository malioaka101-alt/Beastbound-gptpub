'use strict';
// World-wide renown and school-circulated arts are part of the original
// lived-in text-RPG Atlas, households, civic professions and simulation,
// not independent stat-blocks or inherited powers. All saves are disposable.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Atlas=require('../world/atlas'),Houses=require('../world/social-houses'),
 Lore=require('../world/renown-and-practice'),Realm=require('../world/simulation'),
 WorldPractice=require('../rules/world-practice'),Turn=require('../scripts/chat-turn');
const act=(s,op,params={})=>R.act(s,{system:'world',operation:op,params});
const structure=Lore.validate();
A.deepEqual(structure,{historicalLegacies:8,renowned:14,
 publicMethods:23,schoolTraditions:9,restrictedMethods:6,civicApplications:9});
A.equal(new Set(Lore.HISTORICAL_LEGACIES.map(x=>x.id)).size,8);
A.equal(new Set(Lore.SCHOOL_TRADITIONS.map(x=>x.id)).size,9);
for(const x of Lore.SCHOOL_TRADITIONS){
 const school=Atlas.I[x.institution],house=Houses.byId[x.house],
  common=Lore.M[x.common];
 A.ok(school&&house&&common,x.id+' must resolve to original world source');
 A.equal(school.polity,house.polity);
 A.ok(common.civilian.length>15);
 A.ok(common.combat.length>15);
 A.ok(x.civilian.length>30);
 A.ok(x.combat.length>30);
 A.ok(x.access.length>16);
 A.match(x.limit,/no |cannot |not |never |without |needs |requires/i);
}
for(const figure of Lore.HISTORICAL_LEGACIES){
 const country=Atlas.P[figure.polity],school=Atlas.I[figure.institution],
  house=Houses.byId[figure.house];
 A.equal(country.id,school.polity);
 A.equal(country.id,house.polity);
 A.ok(Atlas.history.some(x=>x.era===figure.era));
 A.ok(figure.dailyLegacy.length>16&&figure.combatLegacy.length>16);
 A.ok(!Object.hasOwn(figure,'rank'));
 A.ok(!Object.hasOwn(figure,'maxMana'));
}
for(const great of Lore.RENOWNED){
 const office=Atlas.I[great.institution],family=Houses.byId[great.house],
  region=Atlas.R[great.region];
 A.equal(office.polity,great.polity);
 A.equal(family.polity,great.polity);
 A.equal(region.polity,great.polity);
 A.ok(great.paths.length>=2&&great.publicService.length>24);
 A.ok(great.defenseUse.length>24);
 A.ok(Atlas.history.some(x=>x.era===great.era));
}
{
 const s=E.newGame({seed:982030,name:'Public School Inquirer',path:'undecided'});
 const before=E.exportGame(s),rng=s.rngState;
 const overview=act(s,'heritage',{type:'overview'});
 A.equal(overview.renowned.length,14);
 A.equal(overview.historicalLegends.length,8);
 A.equal(overview.institutionalTeachingTraditions.length,9);
 const school=act(s,'heritage',{type:'school',id:'marshglass_no_take'}).entries[0];
 A.equal(school.existingCommonFoundation.id,'origin_mapping');
 A.equal(school.organisation.name,'Lumenfall Annex');
 A.equal(school.associatedHouse.name,'Marshglass Lineage');
 A.equal(school.notPersonallyEarnedFromReading,true);
 A.equal(school.notAnInheritedSkill,true);
 A.equal(school.locallyVerifiedOperatingStatus,'active');
 const remote=act(s,'heritage',{type:'school',id:'sealwall_three_marks'}).entries[0];
 A.equal(remote.locallyVerifiedOperatingStatus,'current remote operating status unverified');
 A.equal(remote.existingCommonFoundation.id,'rift_anchor');
 const arcane=act(s,'heritage',{type:'common',id:'arcane_circles'}).entries[0];
 A.ok(arcane.identifiableSchoolTeachings.some(x=>x.id==='ember_return'));
 const famous=act(s,'heritage',{type:'renown',id:'pathlight_routes'}).entries[0];
 A.equal(famous.name,'Route Keepers');
 A.ok(famous.associatedSchoolTeachings.length===0||
  famous.associatedSchoolTeachings.every(x=>x.name.length>0));
 A.ok(famous.originalProfessionalWork.every(x=>x.site.length>0));
 const legend=act(s,'heritage',{type:'legend',id:'reef_concord_mediator'}).entries[0];
 A.equal(legend.noVerifiedPersonalPowerRank,true);
 A.ok(legend.chronology.includes('rescue'));
 const local=act(s,'heritage');
 A.ok(local.identifiedLocalSchoolTeachings.some(x=>x.id==='marshglass_no_take'));
 const inWorld=act(s,'realmStatus');
 A.ok(inWorld.locallyIdentifiedSchoolPractices.some(x=>x.name.includes('Marshglass')));
 A.equal(act(s,'realmOverview').institutionSpecificTeachings,9);
 A.equal(act(s,'realmOverview').civilianProfessionalApplications,9);
 const atlas=act(s,'atlas',{type:'institution',id:'lumenfall_annex'});
 A.ok(atlas.publiclyNamedSchoolTraditions.some(x=>x.name.includes('Marshglass')));
 A.equal(E.exportGame(s),before);
 A.equal(s.rngState,rng,'Published history cannot silently roll or change living world');
 for(const p of [
  {type:'school',id:'sealwall_three_marks',claimTechnique:'Realm Walking'},
  {type:'school',id:'school_of_dragon_emperor'},
  {type:'legend',id:'reef_concord_mediator',grantBloodline:true},
  {type:'common',id:'arcane_cooling',learnCircle:8},
  {type:'renown',id:'pathlight_routes',rank:9}
 ]){
  A.throws(()=>act(s,'heritage',p));
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
}
{
 const s=E.newGame({seed:982040,name:'Ordinary Clinic Auditor',
  background:'healer',path:'undecided'});
 R.unified.ensurePlayer(s);
 A.equal(E.dispatch(s,'travel academy').ok,true);
 s.player.attributes.int=30;s.player.skills.medicine.rank=5;
 const balm=s.player.inventory.healing_balm;
 const before=E.exportGame(s),rng=s.rngState;
 const job=act(s,'culturalPracticeStatus',{id:'lumenfall_clinic_quality'});
 A.equal(job.possibleWork[0].powerPath,'specialist');
 A.equal(job.possibleWork[0].relatedCommonMethod,'Verified Common Field Poultice');
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const worked=act(s,'culturalPractice',{id:'lumenfall_clinic_quality',
  minutes:60,approach:'Inspect the actual Lumenfall healing material records and sterile clinical preparation with real medicine knowledge'});
 A.equal(worked.success,true);
 A.equal(worked.noTechniqueLearned,true);
 A.equal(worked.noEmployingInstitutionAssigned,true);
 A.equal(worked.energySpent,0);
 A.equal(s.player.inventory.healing_balm,balm,
  'Auditing a healthcare craft never creates or consumes a claimed magic poultice');
 const record=s.table.realm.culturalPractice.reports.at(-1);
 A.equal(record.receipt.methodId,'field_poultice');
 A.equal(WorldPractice.verifyReport(record),true);
 A.equal(record.reviewedDay,null);
 R.world.advance(s,6);
 A.equal(record.reviewedDay,null,'Distant institution must receive actual transported work evidence');
 R.world.advance(s,6);
 A.ok(Number.isInteger(record.reviewedDay));
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.humanEvolution.stage,0);
}
{
 // A starting partner is part of the original engine save, with their own
 // remembered consent and welfare, not a named "beast" provided in inputs.
 const s=E.newGame({seed:982050,name:'Voluntary Signal Fieldworker',
  path:'partner',background:'fieldworker'});
 R.unified.ensurePlayer(s);
 s.player.attributes.wis=30;s.player.skills.beastcraft.rank=5;
 const original=E.exportGame(s),rng=s.rngState;
 const id=s.player.partnerIds[0],partner=s.beasts[id];
 A.ok(partner.consent&&partner.relationship==='mutual partner');
 A.equal(partner.owner,s.player.name);
 const job=act(s,'culturalPracticeStatus',{id:'crossing_mutual_signals'});
 A.equal(job.possibleWork[0].powerPath,'partnership');
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 for(const forged of [
  {id:'crossing_mutual_signals',minutes:60,
   approach:'Ask the willing partner which signals it prefers',beastConsent:true},
  {id:'crossing_mutual_signals',minutes:60,
   approach:'Ask the willing partner which signals it prefers',chosenPower:'Reef Lord'},
  {id:'crossing_mutual_signals',minutes:5,
   approach:'Ask the willing partner which signals it prefers'}
 ]){A.throws(()=>act(s,'culturalPractice',forged));
  A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);}
 partner.consent=false;
 const noConsent=E.exportGame(s);
 A.throws(()=>act(s,'culturalPractice',{id:'crossing_mutual_signals',minutes:60,
  approach:'Interpret this real companion’s gestures and check whether it chooses to participate'}),
  /willing|consent|mutual/);
 A.equal(E.exportGame(s),noConsent);
 partner.consent=true;partner.needs.hunger=90;
 A.throws(()=>act(s,'culturalPractice',{id:'crossing_mutual_signals',minutes:60,
  approach:'Interpret this real companion’s gestures and check whether it chooses to participate'}),
  /willing|consent|mutual/);
 partner.needs.hunger=10;
 const start=s.world.minutes;
 const r=act(s,'culturalPractice',{id:'crossing_mutual_signals',minutes:60,
  approach:'Offer a voluntary non-command exercise to my actual familiar companion, observe its independent signs and respect refusal'});
 A.equal(r.success,true);
 A.equal(r.staminaSpent,2);
 A.equal(r.noTechniqueLearned,true);
 A.equal(s.world.minutes,start+60);
 const record=s.table.realm.culturalPractice.reports.at(-1);
 A.equal(record.receipt.methodId,'reciprocal_signals');
 A.equal(WorldPractice.verifyReport(record),true);
 A.equal(s.player.partnerIds[0],id);
 A.equal(s.beasts[id].consent,true);
 A.equal(s.beasts[id].syncStage,1);
 A.equal(s.player.humanEvolution.stage,0);
 R.world.advance(s,6);
 A.equal(record.reviewedDay,null,
  'Reef Consistory cannot assess an overseas report instantly');
 R.world.advance(s,30);
 A.ok(Number.isInteger(record.reviewedDay));
 A.ok(record.reviewedDay>=31);
}
{
 const s=E.newGame({seed:982060,name:'No Imagined Partner',path:'undecided'});
 R.unified.ensurePlayer(s);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'culturalPractice',{id:'crossing_mutual_signals',minutes:60,
  approach:'I claim to communicate with a fictional beast that is not accompanying me'}),
  /mutual|partnership|consent/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=E.newGame({seed:982070,name:'Reusable Civic Evidence',path:'undecided'});
 R.unified.ensurePlayer(s);
 A.equal(E.dispatch(s,'travel academy').ok,true);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-connected-world-'));
 try{
  const file=Path.join(dir,'disposable-world.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const req={id:'academy_clinic_982070',mode:'rule',system:'world',
   operation:'culturalPractice',params:{id:'lumenfall_clinic_quality',
    minutes:60,approach:'Examine real clinic instruments and historically verified field preparation standards without inventing patients'}};
  const first=Turn.execute(file,req);
  A.equal(first.ok,true);A.equal(first.applied,true);
  A.equal(first.output.rules.noTechniqueLearned,true);
  const contents=FS.readFileSync(file,'utf8');
  const replay=Turn.execute(file,req);
  A.equal(replay.duplicate,true);A.equal(replay.applied,false);
  A.equal(FS.readFileSync(file,'utf8'),contents);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Connected setting: 6-continent history and legendary houses, live renowned offices, nine public school variants, separate common/private/personal techniques, real specialist and consent-based partnership work, world courier lag, independent review and private replay');
