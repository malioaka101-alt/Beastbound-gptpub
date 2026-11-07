'use strict';
// Tests use only disposable saves. User campaigns and research truth remain
// untouched. Research facts and independent testers predate playable actions.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),Crypto=require('node:crypto');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
function fresh(seed=93411,kind='method'){
 const s=E.newGame({seed,name:'Research Evidence Fixture',path:'undecided'});
 s.player.attributes.int=30;s.player.attributes.wis=30;
 s.player.skills.research={rank:5,xp:0};
 s.player.coins=250;s.player.insightPoints=10;
 s.table||={};s.table.researchPlans={
  ledger:{id:'ledger',source:'Signed and witnessed original research brief by an independent academic',
   worldMinute:s.world.minutes,rediscoverySource:'Archival river survey with cited and observed records',
   parameters:{id:'ledger',title:'Estuary Research',kind,skill:'research',
    grade:1,novelty:'variant',truth:{feasibility:'possible',
     requirements:['Specimen provenance fixed before fieldwork'],
     acceptedHypotheses:['Confirmed specimen marker']}}}
 };
 return s;
}
const call=(s,operation,params={id:'ledger'})=>R.act(s,{system:'research',operation,params});
{
 const s=fresh(),raw=E.exportGame(s),rng=s.rngState;
 for(const p of [
  {id:'ledger',truth:{feasibility:'possible'}},
  {id:'ledger',leadRank:7},{id:'ledger',grade:1},
  {id:'ledger',dc:2},{id:'phantom'}
 ])A.throws(()=>call(s,'start',p),/Unverified research|precommitted project truth/);
 A.equal(E.exportGame(s),raw);A.equal(s.rngState,rng);
 const started=call(s,'start');
 A.equal(started.precommitted,true);
 A.equal(started.dc,13);A.equal(started.track,15);
 A.equal(s.table.research.ledger.leadRank,5);
 A.equal(s.table.research.ledger.sourceResearchPlan,s.table.researchPlans.ledger.source);
 const seeded=E.exportGame(s);
 A.throws(()=>call(s,'start'),/precommitted project truth/);
 A.equal(E.exportGame(s),seeded);
}
{
 const s=fresh(93412);
 call(s,'start');
 const saved=E.exportGame(s),rng=s.rngState;
 for(const params of [
  {id:'ledger',modifier:99},{id:'ledger',sourceValid:true}
 ])A.throws(()=>call(s,'survey',params),/Unverified research/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
 const res=call(s,'survey');
 A.equal(typeof res.degree,'string');A.equal(res.elapsedMinutes,120);
 A.throws(()=>call(s,'week',{id:'ledger',modifier:100}),/Unverified research/);
 A.throws(()=>call(s,'week',{id:'ledger',mentor:3}),/Unverified research/);
 A.throws(()=>call(s,'week',{id:'ledger',facility:2}),/Unverified research/);
 const before=s.player.coins,now=s.world.minutes;
 const w=call(s,'week',{id:'ledger',partTime:false});
 A.ok(w.points>=-1&&w.points<=3);A.equal(w.coinsSpent,.5);
 A.equal(s.player.coins,before-.5);A.equal(s.world.minutes,now+8640);
 A.throws(()=>call(s,'hypothesis',{id:'ledger',hypothesis:'Claim',modifier:70}),/Unverified research/);
 A.throws(()=>call(s,'proof',{id:'ledger',testerAtTier:true}),/Unverified research/);
}
{
 const s=fresh(93413),initial=E.exportGame(s);
 call(s,'start');call(s,'survey');
 // Existing logged scene check is not self-authenticating as fieldwork.
 R.core.check(s,{modifier:20,dc:12,label:'Physical estuary sample taken'});
 const idx=s.log.length-1;
 A.throws(()=>call(s,'fieldwork',{id:'ledger',eventIndex:idx,relevance:'I say it counts'}),/Unverified research/);
 const checkpoint=E.exportGame(s),rng=s.rngState;
 A.throws(()=>call(s,'fieldwork',{id:'ledger',eventIndex:idx}),/unused, specifically sourced scene evidence/);
 A.equal(E.exportGame(s),checkpoint);A.equal(s.rngState,rng);
 const ev=s.log[idx],digest=Crypto.createHash('sha256').update(JSON.stringify(ev)).digest('hex');
 s.table.researchFieldEvidence={ledger:{[String(idx)]:{
  projectId:'ledger',eventIndex:idx,eventHash:digest,
  worldMinute:s.world.minutes,source:'Independent field notebook linking actual estuary sample to project',
  relevance:'This observed sample specifically tests the planned specimen marker'}}};
 const applied=call(s,'fieldwork',{id:'ledger',eventIndex:idx});
 A.equal(applied.authenticated,true);A.equal(applied.noNewRoll,true);
 A.equal(s.table.researchFieldEvidence.ledger[String(idx)].used,true);
 A.equal(s.table.researchFieldEventsUsed[digest],'ledger');
 const after=E.exportGame(s);
 A.throws(()=>call(s,'fieldwork',{id:'ledger',eventIndex:idx}),/unused, specifically sourced scene evidence/);
 A.equal(E.exportGame(s),after);
}
{
 const temp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-research-provenance-'));
 try{
  const file=Path.join(temp,'save.json'),s=fresh(93414);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const invalid={id:'research_fake_truth_001',mode:'rule',system:'research',operation:'start',
   params:{id:'ledger',grade:9,truth:{feasibility:'possible',requirements:['Invented']}}};
  A.throws(()=>Turn.execute(file,invalid),/Unverified research/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const started={id:'research_start_00001',mode:'rule',system:'research',
   operation:'start',params:{id:'ledger'}};
  const r=Turn.execute(file,started);
  A.equal(r.applied,true);A.equal(r.output.rules.precommitted,true);
  A.equal(Turn.execute(file,started).duplicate,true);
  const survey={id:'research_survey_00001',mode:'rule',system:'research',
   operation:'survey',params:{id:'ledger'}};
  A.equal(Turn.execute(file,survey).applied,true);
  let state=E.importGame(FS.readFileSync(file,'utf8'));
  A.ok(state.table.research.ledger.surveyed);
  // Progress is earned by repeated genuine research weeks using the
  // character's own recorded ability and no request-supplied bonus.
  let count=0;
  while(state.table.research.ledger.progress<state.table.research.ledger.track){
   if(++count>20)throw Error('Source-bound research fixture did not finish with real weeks');
   const q=Turn.execute(file,{id:'research_week_'+String(count).padStart(5,'0'),
    mode:'rule',system:'research',operation:'week',params:{id:'ledger'}});
   A.equal(q.applied,true);
   state=E.importGame(FS.readFileSync(file,'utf8'));
  }
  A.ok(count>=5);A.ok(state.table.research.ledger.weeks===count);
  const proof={id:'research_proof_00001',mode:'rule',system:'research',
   operation:'proof',params:{id:'ledger'}};
  const proved=Turn.execute(file,proof);
  A.equal(proved.applied,true);A.equal(proved.output.rules.outcome,'proven');
  state=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(state.table.research.ledger.status,'proven');
  const beforeReplication=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'research_rep_fake_001',mode:'rule',
   system:'research',operation:'replication',params:{id:'ledger',testerId:'Unobserved'} }),
   /documented independent replication/);
  A.equal(FS.readFileSync(file,'utf8'),beforeReplication);
  state.table.researchReplicators={ledger:{
   'River Scholar':{testerId:'River Scholar',skillRank:5,abilityScore:30,
    worldMinute:state.world.minutes,source:'Independent witnessed replication by a named professional'},
   'Coastal Scholar':{testerId:'Coastal Scholar',skillRank:5,abilityScore:30,
    worldMinute:state.world.minutes,source:'Separate independently witnessed laboratory validation'}
  }};
  FS.writeFileSync(file,E.exportGame(state)+'\n');
  for(const [index,who] of ['River Scholar','Coastal Scholar'].entries()){
   const request={id:'research_replication_'+String(index+1).padStart(5,'0'),
    mode:'rule',system:'research',operation:'replication',
    params:{id:'ledger',testerId:who}};
   const result=Turn.execute(file,request);
   A.equal(result.applied,true);A.equal(result.output.rules.externallyReplicated,true);
   A.equal(Turn.execute(file,request).duplicate,true);
  }
  const final=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(final.table.research.ledger.status,'recognised');
  A.equal(final.table.research.ledger.replications,2);
  A.equal(final.table.researchReplicators.ledger['River Scholar'].used,true);
  A.equal(final.table.researchReplicators.ledger['Coastal Scholar'].used,true);
 }finally{FS.rmSync(temp,{force:true,recursive:true});}
}
{
 const s=fresh(93415,'evolution');
 call(s,'start');
 A.throws(()=>call(s,'mythLead',{id:'ledger',sourceId:'marsh_ledger',
  modifier:80,source:'Invented relic'}),/Unverified research/);
 const before=E.exportGame(s);
 A.throws(()=>call(s,'mythLead',{id:'ledger',sourceId:'marsh_ledger'}),
  /already encountered named source/);
 A.equal(E.exportGame(s),before);
 s.table.researchMythSources={ledger:{marsh_ledger:{
  sourceId:'marsh_ledger',location:s.world.location,sourceKind:'temple record',
  worldMinute:s.world.minutes,source:'Source-dated observed ancient marsh laboratory ledger',dc:15}}};
 const lead=call(s,'mythLead',{id:'ledger',sourceId:'marsh_ledger'});
 A.equal(lead.authenticated,true);A.equal(s.table.researchMythSources.ledger.marsh_ledger.used,true);
 A.throws(()=>call(s,'mythLead',{id:'ledger',sourceId:'marsh_ledger'}),/already encountered named source/);
}
console.log('Research source-truth and measured-ability lifecycle tests passed');
