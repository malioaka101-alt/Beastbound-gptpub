#!/usr/bin/env node
'use strict';
// Private local entry point. All consequential requests use one protected turn
// executor. Historic engine.dispatch() remains available only to isolated tests.
const fs=require('node:fs'),path=require('node:path');
const E=require('./engine.js'),Panels=require('./panels.js'),Turn=require('./scripts/chat-turn.js');
const New=require('./scripts/new-campaign.js');
const args=process.argv.slice(2),mode=args[0]||'hud';
const flag=(k,def='')=>{const i=args.indexOf('--'+k);return i<0?def:args[i+1];};
const save=path.resolve(flag('save','campaign.json'));
const read=()=>E.importGame(fs.readFileSync(save,'utf8'));
try{
 if(mode==='new'||mode==='random'){
  if(fs.existsSync(save))throw Error('Never replace an existing campaign; use a distinct save path and campaign ID');
  const seed=flag('seed')?Number(flag('seed')):New.secureSeed();
  const slug=flag('campaign')||path.basename(save,'.json');
  const {state,summary}=New.create({seed,slug});
  fs.mkdirSync(path.dirname(save),{recursive:true});
  fs.writeFileSync(save,E.exportGame(state)+'\n',{flag:'wx'});
  console.log(JSON.stringify({ok:true,save,summary},null,2));
 }else if(mode==='act'||mode==='rule'||mode==='check'||mode==='checkpoint'||mode==='status'){
  const id=flag('id');const file=flag('request');
  if(mode!=='status'&&!id&&!file)throw Error('A stable --id or --request JSON file is mandatory to prevent duplicate rolls');
  const req=file?JSON.parse(fs.readFileSync(path.resolve(file),'utf8')):{id:id||'status_local_00001',mode,
   ...(mode==='act'?{action:flag('action')}:{})};
  if(req.mode!==mode)throw Error('Request mode does not match CLI mode');
  console.log(JSON.stringify(Turn.execute(save,req),null,2));
 }else if(mode==='hud')console.log(Panels.core(read())); // plain-text fallback only
 else if(mode==='recap')console.log(E.recap(read()));
 else throw Error('Modes: new, random, act, rule, check, checkpoint, status, hud, recap');
}catch(e){console.error(e.message);process.exitCode=1;}