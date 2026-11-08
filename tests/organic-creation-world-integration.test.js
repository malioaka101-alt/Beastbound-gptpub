'use strict';
// Disposable, real modules only. No trial campaign or player checkpoint edited.
// Design -> sealed plan -> real research -> replicated publication -> live
// institutional decision, plus original work -> earned local mundane method,
// and independent co-presence -> voluntary chosen-family household.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),
 W=require('../rules/world'),Realm=require('../world/simulation'),
 Atlas=require('../world/atlas'),Careers=require('../world/person-careers'),
 People=require('../world/emergent-people'),
 Contacts=require('../world/independent-contacts'),
 Innovations=require('../world/independent-innovations'),
 Homes=require('../world/emergent-households'),
 Turn=require('../scripts/chat-turn.js');
const fresh=seed=>E.newGame({seed,name:'Organic Creation Integration Fixture',
 path:'undecided',background:'fieldworker'});
const rule=(s,system,operation,params={})=>
 R.act(s,{system,operation,params});
const spec=()=>({title:'Field Reed Water Witness',
 purpose:'Measure local surface water using a hand-built reed gauge and physically check the limits of its readings.',
 medium:'tool',system:'mundane',function:'sense',target:'surface_water',
 magnitude:0,range:'touch',area:'single',duration:'1min',novelty:'variant',
 materials:[{id:'marsh_reed',quantity:2}]});
{
 const s=fresh(7852001);
 s.world.location='crossing';s.player.attributes.int=30;
 s.player.skills.research={rank:5,xp:0};s.player.coins=300;
 s.player.insightPoints=6;
 const initial=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'research','prepareDesign',{designId:'design_1'}),
  /original recorded design|authenticated/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 const draft=rule(s,'creation','draft',spec());
 const beforePlan=s.world.minutes,rollBefore=s.rngState;
 const plan=rule(s,'research','prepareDesign',{designId:draft.id});
 A.equal(plan.id,'study_design_1');
 A.equal(plan.sourceBound,true);
 A.equal(s.world.minutes,beforePlan,'Planning records existing evidence, not time');
 A.equal(s.rngState,rollBefore,'A research plan is not a lucky invention roll');
 const duplicate=rule(s,'research','prepareDesign',{designId:draft.id});
 A.equal(duplicate.alreadyPrepared,true);
 const list=rule(s,'research','designPlansStatus');
 A.equal(list.plans.length,1);
 const sealed=s.table.researchPlans[plan.id];
 A.ok(sealed.sourceHash.length===64);
 const afterPlan=E.exportGame(s);
 A.throws(()=>rule(s,'research','start',{id:plan.id,truth:{feasibility:'possible'}}),
  /Unverified research/);
 A.equal(E.exportGame(s),afterPlan);
 const first=rule(s,'research','start',{id:plan.id});
 A.equal(first.dc,13);A.equal(first.track,15);
 A.equal(s.table.research[plan.id].status,'proposed');
 rule(s,'research','survey',{id:plan.id});
 let loops=0;
 while(s.table.research[plan.id].progress<s.table.research[plan.id].track){
  if(++loops>19)throw Error('Authentic recorded research did not finish in fixture bounds');
  rule(s,'research','week',{id:plan.id});
 }
 const outcome=rule(s,'research','proof',{id:plan.id});
 A.equal(outcome.outcome,'proven','Strong source-backed researcher has no fake proof shortcut');
 for(const who of ['River Scholar','Coastal Scholar']){
  s.table.researchReplicators||={};
  s.table.researchReplicators[plan.id]||={};
  s.table.researchReplicators[plan.id][who]={
   testerId:who,skillRank:5,abilityScore:30,
   worldMinute:s.world.minutes,
   source:'Previously witnessed independently qualified replication by '+who};
  const checked=rule(s,'research','replication',{id:plan.id,testerId:who});
  A.equal(checked.externallyReplicated,true);
 }
 A.equal(s.table.research[plan.id].status,'recognised');
 A.equal(s.table.research[plan.id].replications,2);
 const evalResult=rule(s,'creation','evaluate',{...spec(),researchId:plan.id});
 A.equal(evalResult.prerequisites.matchingReplicatedEvidence,true);
 A.equal(evalResult.noItemCreated,true,'Research cannot conjure the designed instrument');
 A.equal(evalResult.noTechniqueLearned,true);
 const ledgerBefore=E.exportGame(s);
 A.equal(rule(s,'world','localResearchStatus').publishedLocalResearch.length,0);
 A.equal(E.exportGame(s),ledgerBefore,'World research is a read-only view');
 const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-organic-research-'));
 try{
  const file=Path.join(tmp,'disposable.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const request={id:'organic_publication_20261108_001',mode:'rule',
   system:'research',operation:'publish',params:{id:plan.id}};
  const published=Turn.execute(file,request);
  A.equal(published.ok,true);A.equal(published.applied,true);
  A.equal(published.output.rules.publicationSubmitted,true);
  const saved=FS.readFileSync(file,'utf8');
  const again=Turn.execute(file,request);
  A.equal(again.duplicate,true);
  A.equal(FS.readFileSync(file,'utf8'),saved,'Publication cannot be repeated to reroll reviews');
  const state=E.importGame(saved),w=Realm.peek(state);
  const pub=Object.values(w.researchPublications.records)[0];
  A.equal(pub.reviewStatus,'awaiting-review');
  A.ok(pub.sourceHash);
  const before=E.exportGame(state);
  A.equal(rule(state,'world','localResearchStatus').publishedLocalResearch.length,0,
   'Research cannot enter public knowledge before courier release');
  A.equal(E.exportGame(state),before);
  // Ordinary elapsed world time, not a scripted approval request, leads
  // to an independent review and genuinely changes institutional budget.
  const start=state.world.minutes;
  E.advance(state,18*1440);W.finalizeTime(state,start);
  const reviewed=Realm.peek(state).researchPublications.records[pub.id];
  A.ok(['endorsed-for-study','not-adopted'].includes(reviewed.reviewStatus));
  A.ok(Number.isInteger(reviewed.practicalTrial.roll));
  A.equal(reviewed.practicalTrial.before.funds-
   reviewed.practicalTrial.after.funds,2);
  const publicRow=rule(state,'world','localResearchStatus').publishedLocalResearch[0];
  A.equal(publicRow.id,pub.id);
  A.ok(publicRow.status);
  A.equal(state.player.meridian.stage,0);
  A.equal(state.player.arcane.circles,0);
  A.equal(state.player.humanEvolution.stage,0);
 }finally{FS.rmSync(tmp,{recursive:true,force:true});}
}
// Original source-backed NPC work, not a prewritten world method directory.
{
 const s=fresh(7852002),w=Realm.ensure(s),t=People.ensure(w);
 const reg=Atlas.R.morrowfen_basin;
 const d=People.sourceDemand(w,reg);
 A.ok(d,'An authentic local material or livelihood demand should be available');
 const p=People._debug.make(w,t,0,d);
 p.funds=80;
 let created=null,attempted=0;
 for(let i=1;i<=150;i++){
  const day=i*6;
  People._debug.live(w,p,day);
  const result=Innovations.consider(w,day,()=>{});
  attempted+=result.trials;
  created=Object.values(w.independentInnovations.records).
   find(x=>x.status==='tested')||null;
  if(created)break;
 }
 A.ok(attempted>0,'Individuals can conduct research only after genuine distinct work checks');
 A.ok(created,'An independently progressing worker eventually verified one limited method');
 A.equal(Innovations.valid(w,created),true);
 A.equal(Innovations.workBonus(w,p,created.source.method).bonus,1);
 A.equal(p.career.knownTechniques.length,0,'A useful method is not a free arcane art');
 A.equal(p.career.recognizedLicence,null);
 // Work receipts are bounded; the founding evidence survives their rotation.
 for(let i=151;i<=200;i++)People._debug.live(w,p,i*6);
 A.equal(Innovations.valid(w,created),true);
 A.equal(Innovations.workBonus(w,p,created.source.method).bonus,1);
 // Public knowledge only comes through actual location and release date.
 s.world.location='crossing';
 E.advance(s,(created.releaseDay+7)*1440);
 const view=rule(s,'world','localInnovationsStatus');
 A.ok(view.localPracticalMethods.some(x=>x.id===created.id));
 const raw=E.exportGame(s);
 A.throws(()=>rule(s,'world','localInnovationsStatus',{create:true}),
  /read-only/);
 A.equal(E.exportGame(s),raw);
}
// Creation of a family *household* is neither imposed by a family roster
// nor inferred from a single conversation. Distinct real people must act.
{
 const s=fresh(7852003),w=Realm.ensure(s),t=People.ensure(w),
  reg=Atlas.R.morrowfen_basin,d=People.sourceDemand(w,reg);
 A.ok(d);
 const a=People._debug.make(w,t,0,d),b=People._debug.make(w,t,0,d);
 a.funds=60;b.funds=60;
 let home=null;
 for(let i=1;i<=300;i++){
  const day=i*6;
  People._debug.live(w,a,day);
  People._debug.live(w,b,day);
  Contacts.sixday(w,day);
  Homes.sixday(w,day,()=>{});
  home=Object.values(w.emergentHouseholds.households)[0];
  if(home)break;
 }
 A.ok(home,'Independent sustained contacts should be capable of creating an actual household');
 A.equal(Homes.valid(w,home),true);
 A.equal(a.family,home.id);A.equal(b.family,home.id);
 A.equal(home.source.nonBiologicalKinship,true);
 A.equal(home.source.noMarriageAssumed,true);
 const source=structuredClone(home.source);
 Homes.sixday(w,home.source.foundedDay,()=>{throw Error('Duplicate!');});
 A.deepEqual(home.source,source,'A duplicate world tick cannot create a second family');
 const before=home.commonFunds;
 Homes.month(w,home.source.foundedDay+30);
 A.ok(home.commonFunds>=before-1,'A household has actual bounded common provisions');
 E.advance(s,(home.source.foundedDay+7)*1440);
 const local=rule(s,'world','localHouseholdsStatus');
 A.equal(local.localEstablishedHouseholds[0].id,home.id);
 A.equal(local.localEstablishedHouseholds[0].noInheritedPowers,true);
 const snap=E.exportGame(s);
 rule(s,'world','localHouseholdsStatus');
 A.equal(E.exportGame(s),snap,'Reading a household does not create children or tick the world');
}
console.log('Organic world creation bridge: verified design research and public institution decisions, real NPC-earned methods, autonomous chosen-family households, long-run replay and read-only views');
