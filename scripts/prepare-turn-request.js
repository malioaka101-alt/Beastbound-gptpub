'use strict';
// Optional local preflight for a ChatGPT-generated draft before submitting it.
// No engine execution, no dice, no save mutation, no GitHub write.
const FS=require('node:fs'),Crypto=require('node:crypto'),Path=require('node:path');
const Preflight=require('./turn-preflight');
const hash=bytes=>Crypto.createHash('sha256').update(bytes).digest('hex');
function prepare(savePath,draftPath){
 const bytes=FS.readFileSync(savePath);
 const req=JSON.parse(FS.readFileSync(draftPath,'utf8'));
 Preflight.validate(req);
 if(Path.basename(savePath)!==req.campaign+'.json')
  throw Error('Draft campaign does not match the selected verified save');
 const state=JSON.parse(bytes);
 if(state.chatRuntime?.applied?.[req.id])
  throw Error('This immutable turn ID already exists in the saved original ledger');
 const current=hash(bytes);
 if(req.expectedHash&&req.expectedHash!==current)
  throw Error('Draft expectedHash is stale for the selected original save');
 if(req.mode==='status')throw Error('Read-only player-known status normally needs no GitHub turn');
 return {...req,expectedHash:current};
}
module.exports={prepare};
if(require.main===module){
 const [save,draft,out]=process.argv.slice(2);
 if(!save||!draft||!out)
  throw Error('Usage: node scripts/prepare-turn-request.js saves/<campaign>.json draft.json /tmp/prepared.json');
 if(FS.existsSync(out))throw Error('Prepared requests are immutable: choose a fresh output path');
 FS.writeFileSync(out,JSON.stringify(prepare(save,draft),null,2)+'\n',{flag:'wx'});
 console.log('Validated and bound to exact original save SHA-256. Submit once; no roll performed.');
}
