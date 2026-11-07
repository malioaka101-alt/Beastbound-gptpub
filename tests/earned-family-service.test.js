'use strict';
// Social recognition is one independent reaction to authentic environmental
// work, not an instant noble title, a rank bonus or a fictional NPC favour.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),W=require('../rules/world'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const act=(s,sys,op,params={})=>R.act(s,{system:sys,operation:op,params});
function survey(seed,site='fen'){
 const s=E.newGame({name:'Ordinary Verified Civic Fieldworker',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel '+site).ok,true);
 const pre=act(s,'world','habitatSurvey');
 const check=act(s,'core','check',{checkId:pre.checkId}).check;
 A.equal(check.verifiedSceneCheck,pre.checkId);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 return {s,checkId:pre.checkId,success:check.success};
}
function ready(seedStart=68100,site='fen'){
 for(let seed=seedStart;seed<seedStart+100;seed++){
  const test=survey((seed*2654435761)>>>0,site);
  if(test.success)return test;
 }
 throw Error('No genuinely successful deterministic habitat survey');
}
{
 const {s,checkId}=ready();
 const original=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'social','submitReport',{houseId:'fenwake',checkId}),/recent actually witnessed charter/);
 A.throws(()=>act(s,'social','submitReport',{houseId:'marshglass',checkId}),/named local households with a genuinely relevant/);
 A.throws(()=>act(s,'social','submitReport',{houseId:'fenwake',checkId,grant:'great clan heir'}),/accepts only an actual local houseId/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 act(s,'social','inquire',{houseId:'fenwake'});
 const snap=E.exportGame(s),prior=s.rngState;
 const rv=act(s,'social','submitReport',{houseId:'fenwake',checkId});
 A.equal(rv.submitted,true);
 A.equal(rv.evidenceCheckId,checkId);
 A.equal(rv.recognitionNotGuaranteed,true);
 A.equal(rv.socialStandingGained,0);
 A.equal(rv.tuitionOrPayment,0);
 A.equal(s.table.socialFabric.reportsUsed[checkId],rv.letterId);
 A.equal(s.table.socialFabric.letters.at(-1).purpose,'field_report');
 A.equal(s.table.socialFabric.letters.at(-1).evidenceCheckId,checkId);
 A.equal(s.table.socialFabric.letters.at(-1).state,'sent');
 A.equal(act(s,'social','status').earnedCivicRegard.fenwake,undefined);
 A.throws(()=>act(s,'social','submitReport',{houseId:'fenwake',checkId}),/within thirty in-world days/);
 const before=E.exportGame(s);
 A.throws(()=>act(s,'social','collect',{letterId:rv.letterId}),/independently delivered/);
 A.equal(E.exportGame(s),before);
 W.advance(s,6);
 const doc=s.table.socialFabric.letters.at(-1);
 A.equal(doc.state,'held_at_registry');
 A.ok(['accepted','declined'].includes(doc.review));
 A.equal(act(s,'social','status').letters.at(-1).response,null);
 const oldCoins=s.player.coins,priorRank=s.player.skills.survival.rank;
 const resp=act(s,'social','collect',{letterId:rv.letterId});
 A.equal(resp.collected,true);
 A.equal(resp.recognizedService,doc.review==='accepted');
 A.equal(resp.civicRegardGained,doc.review==='accepted'?1:0);
 A.equal(s.player.coins,oldCoins);
 A.equal(s.player.skills.survival.rank,priorRank);
 A.equal(s.table?.socialFabric?.civicRegard?.fenwake||0,resp.civicRegardGained);
 A.ok(/ecological (?:field )?report/.test(resp.response));
 A.equal(act(s,'social','status').earnedCivicRegard.fenwake,resp.civicRegardGained||undefined);
 A.equal(s.player.meridian.gates.length,0);
 A.equal(s.table?.meridianTechniques,undefined);
 A.equal(E.exportGame(s)!==snap,true);
}
{
 const {s,checkId}=ready(68220);
 act(s,'social','inquire',{houseId:'reedcouncil'});
 s.table.habitatSurveyFindings[checkId].rollEventHash='forged_success';
 const old=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'social','submitReport',{houseId:'reedcouncil',checkId}),/cannot be reconstructed/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
}
{
 const {s,checkId}=ready(68330,'forest');
 act(s,'social','inquire',{houseId:'reedcouncil'});
 const old=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'social','submitReport',{houseId:'reedcouncil',checkId}),/real successful relevant habitat field survey/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
}
{
 const {s,checkId}=ready(68440);
 act(s,'social','inquire',{houseId:'fenwake'});
 const r=act(s,'social','submitReport',{houseId:'fenwake',checkId});
 const after=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'social','submitReport',{houseId:'reedward',checkId}),/recent actually witnessed charter|already been offered/);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,rng);
 W.advance(s,6);
 const letter=s.table.socialFabric.letters.at(-1);
 letter.evidenceRollHash='forged';
 const altered=E.exportGame(s);
 A.throws(()=>act(s,'social','collect',{letterId:r.letterId}),/authentic public fieldwork report|no longer matches/);
 A.equal(E.exportGame(s),altered);
}
{
 let accepted=false,declined=false;
 for(let seed=68500;seed<68640;seed++){
  const {s,checkId,success}=survey((seed*2654435761)>>>0);
  if(!success)continue;
  act(s,'social','inquire',{houseId:'fenwake'});
  const p=act(s,'social','submitReport',{houseId:'fenwake',checkId});
  W.advance(s,6);
  const h=s.table.socialFabric.letters.at(-1);
  if(h.review==='accepted')accepted=true;
  if(h.review==='declined')declined=true;
  const r=act(s,'social','collect',{letterId:p.letterId});
  A.equal(r.civicRegardGained,h.review==='accepted'?1:0);
  if(accepted&&declined)break;
 }
 A.equal(accepted,true,'Independent household decisions should sometimes recognise real work');
 A.equal(declined,true,'Independent households must be able to decline a genuine completed report');
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-family-civic-service-'));
 try{
  const {s,checkId}=ready(68660);
  act(s,'social','inquire',{houseId:'fenwake'});
  const file=Path.join(dir,'save.json');FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const req={id:'social_verified_service_0001',mode:'rule',system:'social',
   operation:'submitReport',params:{houseId:'fenwake',checkId}};
  const result=Turn.execute(file,req);
  A.equal(result.applied,true);A.equal(result.output.rules.submitted,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const withLetter=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(withLetter.table.socialFabric.reportsUsed[checkId],result.output.rules.letterId);
  A.equal(withLetter.table.socialFabric.letters.at(-1).state,'sent');
  A.notEqual(before,FS.readFileSync(file,'utf8'));
  const status=Turn.execute(file,{id:'social_service_status_0001',
   mode:'rule',system:'social',operation:'status',params:{}});
  A.equal(status.applied,false);A.equal(status.output.rules.letters.at(-1).response,null);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Authenticated completed ecological fieldwork may earn independent local family regard, never free hereditary power or noble titles');
