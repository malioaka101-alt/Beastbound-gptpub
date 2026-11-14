'use strict';
const fs=require('node:fs'),path=require('node:path');
const CP=require('node:child_process');
// A push contains the exact new immutable request paths. Target those paths
// instead of rescanning years of already-processed histories; a manual
// recovery dispatch (or unavailable git metadata) still scans all pending.
function changedRequests(){
 if(process.env.BB_CHANGED_ONLY!=='1')return null;
 try{
  const changes=CP.execFileSync('git',
   ['diff-tree','--no-commit-id','--name-only','-r','HEAD'],
   {cwd:path.resolve(__dirname,'..'),encoding:'utf8'}).split('\\n');
  const map=new Map();
  for(const item of changes){
   const m=item.match(/^requests\\/([a-z0-9][a-z0-9_-]{4,79})\\/([a-z0-9][a-z0-9_-]{4,79}\\.json)$/);
   if(!m)continue;
   if(!map.has(m[1]))map.set(m[1],[]);
   map.get(m[1]).push(m[2]);
  }
  return map.size?map:null;
 }catch{return null;}
}
const {execute,legalId}=require('./chat-turn.js');
const root=path.resolve(__dirname,'..');
const requestRoot=path.join(root,'requests');
let count=0,errors=0;
const changed=changedRequests();
if(fs.existsSync(requestRoot)) for(const campaign of (changed?[...changed.keys()]:fs.readdirSync(requestRoot)).sort()){
 if(!legalId(campaign))continue;
 const folder=path.join(requestRoot,campaign);
 if(!fs.statSync(folder).isDirectory())continue;
 const save=path.join(root,'saves',campaign+'.json');
 if(!fs.existsSync(save))continue;
 for(const file of (changed?changed.get(campaign):fs.readdirSync(folder)).filter(f=>f.endsWith('.json')).sort()){
  const id=file.slice(0,-5);if(!legalId(id))continue;
  const output=path.join(root,'results',campaign,id+'.json');
  if(fs.existsSync(output))continue;
  try{
   const req=JSON.parse(fs.readFileSync(path.join(folder,file),'utf8'));
   if(req.id!==id || req.campaign!==campaign)throw Error('Request identity and filename mismatch');
   const r=execute(save,req);
   fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(r,null,2)+'\n');
   count++;console.log(`${campaign}/${id}: ${r.ok?'ok':'refused'}`);
  }catch(error){
   errors++;
   fs.mkdirSync(path.dirname(output),{recursive:true});
   fs.writeFileSync(output,JSON.stringify({id,ok:false,applied:false,error:String(error.message||error).slice(0,220)},null,2)+'\n');
   console.error(`${campaign}/${id}: ${error.message}`);
  }
 }
}
console.log('Processed '+count+' request(s), '+errors+' errors.');