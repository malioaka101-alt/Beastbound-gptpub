'use strict';
// Verified *local* Node 22 fast path. It NEVER pushes, updates a live save or
// treats an unverified local checkout as the authoritative GitHub source.
// A caller must compare live remote HEAD and save blob SHA before and after
// this command and upload the candidate with a GitHub blob-SHA lease.
const FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Crypto=require('node:crypto'),CP=require('node:child_process');
const Turn=require('./chat-turn'),Preflight=require('./turn-preflight');
const SHA=/^[a-f0-9]{40}$/i;
const digest=x=>Crypto.createHash('sha256').update(x).digest('hex');
const call=(cwd,...args)=>CP.execFileSync('git',args,{cwd,encoding:'utf8'}).trim();
function verify({root,sourceHead,savePath,saveBlobSha,saveHash}){
 if(process.version.split('.')[0].slice(1)!=='22')
  throw Error('Verified local turns require Node 22');
 if(!SHA.test(sourceHead)||!SHA.test(saveBlobSha)||
    !/^[a-f0-9]{64}$/i.test(saveHash))
  throw Error('Explicit verified GitHub source head, save blob and raw SHA-256 are required');
 if(call(root,'rev-parse','HEAD')!==sourceHead)
  throw Error('Local engine commit differs from the separately verified GitHub source head');
 const dirty=call(root,'status','--porcelain','--untracked-files=all','--',
  'engine.js','panels.js','rules','world','scripts');
 if(dirty)throw Error('The local engine source is modified or untracked; no local mechanics are trusted');
 const relative=Path.relative(root,savePath).replace(/\\/g,'/');
 if(!/^saves\/[a-z0-9][a-z0-9_-]{4,79}\.json$/.test(relative))
  throw Error('Local input must be an existing selected campaign save under saves/');
 const bytes=FS.readFileSync(savePath);
 if(digest(bytes)!==saveHash||
    call(root,'hash-object',savePath)!==saveBlobSha)
  throw Error('Local save differs from the original verified GitHub save');
 return {verifiedHead:sourceHead,originalSaveSha256:saveHash,
  originalGitHubBlobSha:saveBlobSha};
}
function main(args=process.argv.slice(2)){
 const opts={};
 for(let i=0;i<args.length;i+=2){
  if(!args[i]?.startsWith('--')||args[i+1]===undefined)
   throw Error('Expected --save PATH --request PATH --out PATH --source-head SHA --save-blob SHA --save-sha256 HASH');
  opts[args[i].slice(2)]=args[i+1];
 }
 const needed=['save','request','out','source-head','save-blob','save-sha256'];
 if(Object.keys(opts).some(x=>!needed.includes(x))||
    needed.some(x=>typeof opts[x]!=='string'||!opts[x]))
  throw Error('A verified local turn needs all six explicit arguments');
 const root=Path.resolve(__dirname,'..'),savePath=Path.resolve(opts.save),
  out=Path.resolve(opts.out);
 if(out.startsWith(root+Path.sep)||out===savePath||FS.existsSync(out))
  throw Error('Candidate save must be a fresh path outside the repository');
 const source=verify({root,sourceHead:opts['source-head'],savePath,
  saveBlobSha:opts['save-blob'],saveHash:opts['save-sha256']});
 const req=JSON.parse(FS.readFileSync(opts.request,'utf8'));
 Preflight.validate(req);
 const campaign=Path.basename(savePath,'.json');
 if(req.campaign!==campaign)
  throw Error('Request campaign and verified selected save must match');
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-verified-local-'));
 try{
  const candidate=Path.join(dir,'candidate.json');
  FS.copyFileSync(savePath,candidate);
  // Exact one original engine resolution on a disposable save copy.
  const result=Turn.execute(candidate,req);
  if(!result.ok||!result.applied)
   return {ok:result.ok,applied:false,source,turn:result,
    note:'No candidate was written; no GitHub save changed'};
  const after=FS.readFileSync(candidate);
  FS.writeFileSync(out,after,{flag:'wx'});
  return {ok:true,applied:true,source,candidatePath:out,
   candidateSha256:digest(after),turn:result,
   note:'Candidate only. Reconfirm remote source and unchanged original blob, then upload to GitHub with original blob SHA. Never reroll on a rejected lease.'};
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
module.exports={verify,main};
if(require.main===module){
 try{console.log(JSON.stringify(main(),null,2));}
 catch(err){console.error(String(err.stack||err));process.exitCode=1;}
}
