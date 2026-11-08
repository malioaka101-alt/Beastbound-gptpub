'use strict';
// Text RPG world continuity: existing Atlas states, houses, sacred sites and
// source-backed disciplines, rather than disconnected legendary-stat cards.
// All characters, work, dice and reputational aftermath are disposable.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 Atlas=require('../world/atlas'),Houses=require('../world/social-houses'),
 Mythic=require('../world/mythic'),Realm=require('../world/simulation'),
 Lore=require('../world/renown-and-practice'),P=require('../rules/world-practice'),
 Turn=require('../scripts/chat-turn');
const act=(s,system,operation,params={})=>R.act(s,{system,operation,params});
const allRules=FS.readFileSync(Path.join(__dirname,'../rules/index.js'),'utf8');
const methods=Lore.PUBLIC_METHODS;
A.deepEqual(Lore.validate(),{
 historicalLegacies:5,renowned:11,publicMethods:19,restrictedMethods:6,civicApplications:7});
A.equal(new Set(methods.map(x=>x.id)).size,methods.length);
for(const path of ['meridian','arcane','soul','body','rift','beast-origin',
 'partnership','specialist','mundane']){
 A.ok(methods.some(x=>x.path===path),'Common civilian life covers '+path);
}
for(const m of methods){
 A.ok(Atlas.I[m.institution],m.id+' has an actual world-based school or profession');
 A.ok(m.civilian.length>18,'Not just combat: '+m.id);
 A.ok(m.combat.length>18,'Combat distinction: '+m.id);
 if(m.actualRule)A.ok(allRules.includes("case '"+m.actualRule+"'"),
  'Never advertise a runnable world technique disconnected from the actual engine: '+m.actualRule);
}
for(const x of Lore.RENOWNED){
 A.ok(Atlas.P[x.polity]);
 A.equal(Atlas.I[x.institution].polity,x.polity);
 A.equal(Houses.byId[x.house].polity,x.polity);
 A.equal(Atlas.R[x.region].polity,x.polity);
 A.ok(Atlas.history.some(y=>y.era===x.era));
 if(x.site)A.ok(Mythic.SITES.some(y=>y.id===x.site&&y.public));
}
for(const x of Lore.HISTORICAL_LEGACIES){
 A.ok(Atlas.history.some(e=>e.era===x.era));
 A.ok(x.status.includes('historical')||x.status.includes('memorial')||
  x.status.includes('ancient'));
}
for(const x of Lore.RESTRICTED_METHODS){
 A.ok(Houses.byId[x.house]);
 A.ok(Atlas.I[x.institution]);
 A.match(x.boundary,/no |cannot |not /i);
}
const base=()=>E.newGame({seed:882181,name:'Morrowfen Civic Researcher',
 path:'undecided',background:'fieldworker'});
{
 const s=base(),before=E.exportGame(s),rng=s.rngState;
 const overview=act(s,'world','heritage',{type:'overview'});
 A.equal(overview.renowned.length,11);
 A.equal(overview.historicalLegends.length,5);
 A.ok(overview.eraSummaries.some(x=>x.era==='Ash Years'));
 const local=act(s,'world','heritage');
 A.equal(local.polity,Atlas.P.reedmarch.name);
 A.ok(local.localKnownLegacies.some(x=>x.name===Atlas.I.lumenfall_annex.name));
 A.ok(local.localProfessionalWork.some(x=>x.id==='ferry_route_survey'));
 A.ok(act(s,'world','heritage',{type:'common',id:'arcane_spark'}).
  entries[0].publicKnowledgeDoesNotTeachIt);
 const legend=act(s,'world','heritage',{type:'legend',id:'ash_years_sorin'}).entries[0];
 A.equal(legend.era,'Ash Years');
 A.equal(legend.noVerifiedPersonalPowerRank,true);
 A.ok(legend.establishedHistoricalContext.includes('volcanic empire'));
 A.equal(act(s,'world','heritage',{type:'restricted',id:'marshglass_private'}).
  entries[0].privateFormula,'not supplied by public history');
 const famous=act(s,'world','heritage',{type:'renown',id:'reef_speakers'}).entries[0];
 A.equal(famous.relatedPublicSite.name,Mythic.publicLore({type:'site',id:'reef_remembrance'}).name);
 A.equal(famous.regionalInfluenceNotCombatPower,true);
 const old=act(s,'world','atlas',{type:'institution',id:'forge_university'});
 A.ok(old.publiclyKnownMethods.some(x=>x.name==='Arcane Spark'));
 A.ok(old.publicRenown.some(x=>x.publiclyAssociatedFamily==='Emberhand Foundry Kin'));
 A.equal(old.membershipOrTeachingNotGranted,true);
 const w=act(s,'world','realmOverview');
 A.ok(w.renownedPublicInstitutions.some(x=>x.name==='Lumenfall Annex'));
 A.ok(w.sharedLocalMethods.every(x=>x.knowledgeIsNotMastery));
 const work=act(s,'world','culturalPracticeStatus');
 A.ok(work.possibleWork.some(x=>x.id==='ferry_route_survey'));
 A.deepEqual(work.knownPersonalReports,[]);
 A.equal(E.exportGame(s),before,'Public legend, Atlas, family, method and local readiness must be read-only');
 A.equal(s.rngState,rng);
 for(const params of [
  {type:'legend',id:'nonexistent_king'},
  {type:'secret',id:'riftglass_vault'},
  {type:'common',id:'arcane_spark',guaranteedSpell:true},
  {type:'restricted',id:'sealwarden_maps',secretFormula:true},
  {type:'overview',id:'fake_imperial_charter'},
  {type:'renown',path:'divine-ultimate'}
 ]){
  A.throws(()=>act(s,'world','heritage',params));
  A.equal(E.exportGame(s),before);
  A.equal(s.rngState,rng);
 }
}
{
 const s=base();R.unified.ensurePlayer(s);
 s.player.attributes.int=30;s.player.skills.research.rank=5;
 const raw=E.exportGame(s),rng=s.rngState;
 for(const args of [
  {id:'ferry_route_survey',minutes:0,approach:'Carefully check actual ferry measurements and the canal charter'},
  {id:'ferry_route_survey',minutes:60,approach:'I win'},
  {id:'ferry_route_survey',minutes:60,approach:'Carefully check actual ferry measurements',guaranteed:true},
  {id:'unknown_world_power',minutes:60,approach:'Carefully check actual ferry measurements and canal safety'},
  {id:'riftglass_anchor_audit',minutes:60,approach:'Carefully check actual spatial pressure and original anchors'}
 ]){
  A.throws(()=>act(s,'world','culturalPractice',args));
  A.equal(E.exportGame(s),raw);
  A.equal(s.rngState,rng,'Wrong remote site or invented task never rolls');
 }
 const first=act(s,'world','culturalPractice',{
  id:'ferry_route_survey',minutes:60,
  approach:'Inspect the existing ferry crossing, sound the real towpath and compare the public passage ledger with the observed bank'});
 A.ok(Number.isInteger(first.check.roll));
 A.equal(first.check.dc,13);
 A.equal(first.staminaSpent,2);
 A.equal(first.energySpent,0);
 A.equal(first.noFreeProfessionalRank,true);
 A.equal(first.noTechniqueLearned,true);
 A.equal(first.noEmployingInstitutionAssigned,true);
 A.equal(s.world.minutes,E.importGame(raw).world.minutes+60);
 A.equal(s.player.stamina,E.importGame(raw).player.stamina-2);
 const evidence=s.table.realm.culturalPractice.reports.at(-1);
 A.equal(P.verifyReport(evidence),true);
 A.equal(evidence.receipt.methodId,'public_field_survey');
 A.equal(evidence.receipt.originalRollEvent.details.roll,first.check.roll);
 A.equal(first.success,first.check.success);
 const status=act(s,'world','culturalPracticeStatus');
 A.equal(status.knownPersonalReports.length,1);
 A.equal(status.knownPersonalReports[0].success,first.success);
 const changed=E.importGame(E.exportGame(s));
 changed.table.realm.culturalPractice.reports[0].receipt.check.roll=20;
 A.equal(P.verifyReport(changed.table.realm.culturalPractice.reports[0]),false);
 const forgedSource=E.importGame(E.exportGame(s));
 forgedSource.table.realm.culturalPractice.reports[0].receipt.sourceProofHash='invented magic';
 A.equal(P.verifyReport(forgedSource.table.realm.culturalPractice.reports[0]),false);
 const beforeReputation=s.table.realm.institutions.naturalists_guild.reputation;
 // Public reports affect world culture only through real elapsed dates,
 // regional bulletin access and the institution's own contingent response.
 R.world.advance(s,6);
 const report=s.table.realm.culturalPractice.reports[0];
 A.ok(report.reviewedDay>=6);
 A.ok(typeof report.response==='string'&&report.response.length>10);
 A.ok(s.table.realm.institutions.naturalists_guild.reputation>=beforeReputation-2);
 const news=act(s,'world','news',{channel:'local',limit:20});
 if(first.success)
  A.ok(news.items.some(x=>x.text.includes('ferry and water-rights survey')),
    'A real report becomes local public news only after publishing time');
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.humanEvolution.stage,0);
}
{
 // Simple stage numbers, powerful surnames and educational reputation
 // cannot bypass the original independent structures and sources.
 const sources=[
  ['reedbank_qi_flow','meridian',p=>{p.meridian.stage=4;}],
  ['lumenfall_arcane_audit','arcane',p=>{p.arcane.circles=3;p.arcane.coreIgnited=true;}],
  ['lumenfall_soul_triage','soul',p=>{p.soul.phase=2;}],
  ['ashwind_body_rescue','body',p=>{p.body.cycles=['Muscle-Tendon Cycle','Bone-Marrow Cycle','Organ Cycle'];}],
  ['riftglass_anchor_audit','rift',p=>{p.rift.step=2;}],
  ['whisperfen_ecology_review','origin',p=>{p.origin.phase=7;}]
 ];
 for(let i=0;i<sources.length;i++){
  const [id,system,edit]=sources[i];
  const job=Lore.J[id],s=E.newGame({seed:882300+i,name:'Not-Apex '+system,path:system});
  R.unified.ensurePlayer(s);
  s.world.location=job.location;edit(s.player);
  const before=E.exportGame(s),rng=s.rngState;
  A.throws(()=>act(s,'world','culturalPractice',{
   id,minutes:job.minutes,
   approach:'Inspect the local actual professional workplace using only earned abilities'}),
  /Gate|Circle|Soul|Organ|Rift|beast-pattern|source|original|prerequisite|verified|witness|phase|body|matrix|history|mapped/i);
  A.equal(E.exportGame(s),before,'Stage labels cannot invent profession-relevant anatomy '+id);
  A.equal(s.rngState,rng);
 }
}
{
 // Actually earned Body Organ III is usable for a physical professional
 // rescue exercise in a preexisting dangerous landscape. It is NOT a
 // combat attack, universal transformation or made-up rescue victim.
 const s=E.newGame({seed:882480,name:'Cliff Rescue Physiologist',path:'body'});
 R.unified.ensurePlayer(s);
 const p=s.player,c=s.table.combatants.player;
 p.body.cycles=['Muscle-Tendon Cycle','Bone-Marrow Cycle'];
 p.attributes.con=30;p.skills.survival.rank=5;
 p.maxStamina+=2;p.stamina+=2;c.maxStamina+=2;c.stamina+=2;
 c.toughness+=1;c.boxes[1]+=1;
 s.table.disciplineTraining||={};s.table.disciplineTraining.body={
  target:null,points:0,methods:{},weeks:0,cooldownUntil:0,complications:[],
  history:[
   {day:1,target:'cycle1',quality:'strong',change:'Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force'},
   {day:1,target:'cycle2',quality:'strong',change:'Completed Cycle II Bone-Marrow refinement; +1 Toughness, +1 Serious wound box'}
  ]};
 let earned=false;
 for(let i=0;i<12&&!earned;i++){
  if(p.stamina<5)act(s,'health','sleep',{hours:8});
  earned=act(s,'body','organWork',{focus:'integrated',minutes:15,
   approach:'Carefully integrate actual heart, lungs, liver, kidneys and the breathing required for work'}).completed;
 }
 A.equal(earned,true);
 if(p.stamina<6)act(s,'health','sleep',{hours:8});
 s.world.location='hills';
 const before=s.world.minutes,sta=p.stamina;
 const performed=act(s,'world','culturalPractice',{
  id:'ashwind_body_rescue',minutes:90,
  approach:'Check my genuine full-body refined tissue against the actual uphill load, safe breath and existing rockfall hazard'});
 A.equal(performed.noTechniqueLearned,true);
 A.equal(performed.energySpent,0);
 A.equal(performed.staminaSpent,3);
 A.equal(s.world.minutes,before+90);
 A.equal(p.stamina,sta-3);
 A.equal(s.table.realm.culturalPractice.reports.at(-1).receipt.jobId,'ashwind_body_rescue');
 A.equal(p.body.cycles.length,3);
 A.equal(p.meridian.stage,0);
 A.equal(p.arcane.circles,0);
 A.equal(p.humanEvolution.stage,0);
}
{
 // Unique request IDs only resolve once through the actual private runner.
 const s=base(),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-heritage-practice-'));
 R.unified.ensurePlayer(s);
 try{
  const file=Path.join(dir,'disposable.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const request={id:'culture_882181_noncombat',mode:'rule',
   system:'world',operation:'culturalPractice',
   params:{id:'ferry_route_survey',minutes:60,
    approach:'I inspect actual ferry route markers and check the public embankment safely'}};
  const first=Turn.execute(file,request);
  A.equal(first.ok,true);A.equal(first.applied,true);
  A.ok(Number.isInteger(first.output.rules.check.roll));
  const saved=FS.readFileSync(file,'utf8');
  const repeat=Turn.execute(file,request);
  A.equal(repeat.duplicate,true);A.equal(repeat.applied,false);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Published world renown uses actual 24-state Atlas, 28 existing family identities, mythic sites, public/private path methods and real work; independent institution reviews, no stage/house/guild powers or free profession rank');
