'use strict';
// Actual process-pending.js file contract on an isolated disposable repository
// layout. Runs the same Node processor with its real original Turn.execute.
// No active campaign, GitHub request or real save gets written by this test.
// This is NOT proof that GitHub Actions will launch and commit results.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),CP=require('node:child_process'),
 E=require('../engine.js'),Turn=require('../scripts/chat-turn.js');
const temp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-private-pipeline-fixture-'));
const campaign='private_runner_disposable_001',other='other_disposable_campaign';
const root=Path.resolve(__dirname,'..'),saved=Path.join(temp,'saves',campaign+'.json'),
 requestDir=Path.join(temp,'requests',campaign),
 resultDir=Path.join(temp,'results',campaign),
 sourceProcessor=Path.join(root,'scripts','process-pending.js'),
 processFile=Path.join(temp,'scripts','process-pending.js'),
 otherSave=Path.join(temp,'saves',other+'.json');
const saveText=()=>FS.readFileSync(saved,'utf8'),
 game=()=>E.importGame(saveText()),
 result=id=>JSON.parse(FS.readFileSync(Path.join(resultDir,id+'.json'),'utf8'));
const request=(id,body)=>{
 const req={id,campaign,...body};
 FS.writeFileSync(Path.join(requestDir,id+'.json'),JSON.stringify(req,null,2)+'\n');
 return req;
};
const run=()=>CP.execFileSync(process.execPath,[processFile],{encoding:'utf8'});
try{
 for(const folder of ['scripts','saves','requests/'+campaign,'results/'+campaign])
  FS.mkdirSync(Path.join(temp,folder),{recursive:true});
 // A real processor has only one relative sibling dependency. Point that
 // temporary shim to the current repository's actual Turn.execute module.
 FS.copyFileSync(sourceProcessor,processFile);
 FS.writeFileSync(Path.join(temp,'scripts','chat-turn.js'),
  'module.exports=require('+JSON.stringify(require.resolve('../scripts/chat-turn.js'))+');\n');
 const fresh=()=>E.newGame({seed:975011,name:'Verified Disposable Pipeline',background:'fieldworker'});
 const initial=fresh();
 FS.writeFileSync(saved,E.exportGame(initial)+'\n');
 FS.writeFileSync(otherSave,E.exportGame(E.newGame({
  seed:975012,name:'Other Unaffected Campaign',background:'fieldworker'}))+'\n');
 const untouchedOther=FS.readFileSync(otherSave,'utf8');
 const initialSave=saveText(),playerRng=initial.rngState;

 request('private_pipe_status_001',{mode:'status'});
 A.match(run(),/Processed 1 request\(s\), 0 errors/);
 A.equal(result('private_pipe_status_001').ok,true);
 A.equal(result('private_pipe_status_001').applied,false);
 A.equal(saveText(),initialSave);
 A.equal(run().includes('Processed 0 request(s), 0 errors'),true);
 A.equal(saveText(),initialSave);
 A.equal(game().rngState,playerRng);

 request('private_pipe_travel_001',{mode:'act',action:'travel fen'});
 A.match(run(),/Processed 1 request\(s\), 0 errors/);
 const travelled=result('private_pipe_travel_001');
 A.equal(travelled.applied,true);
 A.equal(travelled.ok,true);
 A.equal(game().world.location,'fen');
 A.equal(game().chatRuntime.revision,1);
 A.equal(game().rngState,playerRng);

 // Crash window: the original request has already been atomically saved,
 // but its result file was never written by the worker.
 const surveyReq=request('private_pipe_survey_001',{
  mode:'rule',system:'world',operation:'habitatSurvey',params:{}});
 const original=Turn.execute(saved,surveyReq);
 A.equal(original.applied,true);A.equal(original.output.rules.prepared,true);
 A.equal(FS.existsSync(Path.join(resultDir,surveyReq.id+'.json')),false);
 const afterOriginal=saveText(),originalRng=game().rngState;
 A.match(run(),/Processed 1 request\(s\), 0 errors/);
 const recovered=result(surveyReq.id);
 A.equal(recovered.duplicate,true);A.equal(recovered.recovered,true);
 A.equal(recovered.applied,false);
 A.deepEqual(recovered.output,original.output);
 A.equal(saveText(),afterOriginal);
 A.equal(game().rngState,originalRng);

 const checkId=original.output.rules.checkId;
 request('private_pipe_check_001',{mode:'check',checkId});
 A.match(run(),/Processed 1 request\(s\), 0 errors/);
 const check=result('private_pipe_check_001');
 A.equal(check.ok,true);A.equal(check.applied,true);
 A.ok(check.output.check.roll>=1&&check.output.check.roll<=20);
 A.equal(game().table.sceneChecks[checkId].used,true);
 const checkRng=game().rngState,afterCheck=saveText();
 A.match(run(),/Processed 0 request\(s\), 0 errors/);
 A.equal(game().rngState,checkRng);
 A.equal(saveText(),afterCheck);

 request('private_pipe_pickup_001',{
  mode:'checkpoint',scene:'The authentic fen survey is complete and its original roll is recorded.',
  summary:'Restore this exact verified fen pickup scene without generating a new die.'});
 A.match(run(),/Processed 1 request\(s\), 0 errors/);
 const checkpoint=result('private_pipe_pickup_001');
 A.equal(checkpoint.applied,true);
 A.equal(game().chatRuntime.revision,4);
 A.match(game().chatRuntime.scene,/original roll is recorded/);
 const revived=E.importGame(E.exportGame(game()));
 A.equal(revived.table.sceneChecks[checkId].used,true);
 A.equal(revived.chatRuntime.scene,game().chatRuntime.scene);
 A.equal(revived.chatRuntime.applied['private_pipe_check_001'].receipt.output.check.roll,
  check.output.check.roll);

 // A stale client cannot mutate a newer checkpoint, even when the
 // request file is correctly addressed and processed by the real worker.
 const stale=saveText(),staleRng=game().rngState;
 request('private_pipe_stale_001',{mode:'act',action:'rest',
  expectedHash:'an-incorrect-older-save-hash'});
 A.match(run(),/Processed 1 request\(s\), 0 errors/);
 const rejected=result('private_pipe_stale_001');
 A.equal(rejected.ok,false);A.equal(rejected.applied,false);
 A.match(rejected.error,/Stale checkpoint/);
 A.equal(saveText(),stale);A.equal(game().rngState,staleRng);

 // The processor also writes an honest bounded error result for a request
 // whose filename and declared request ID disagree. No campaign mutation.
 request('private_pipe_invalid_001',{mode:'act',action:'rest',
  id:'a-different-id'});
 A.match(run(),/Processed 0 request\(s\), 1 errors/);
 A.equal(result('private_pipe_invalid_001').ok,false);
 A.match(result('private_pipe_invalid_001').error,/identity and filename mismatch/);
 A.equal(saveText(),stale);
 A.equal(FS.readFileSync(otherSave,'utf8'),untouchedOther,
  'One disposable campaign never changes another');
}finally{FS.rmSync(temp,{recursive:true,force:true});}
console.log('Actual local private request processor conserves saves, original dice, checkpoint pickup and duplicate recovery');
