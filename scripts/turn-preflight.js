'use strict';
// Pure request validation, safe to run before the GitHub write as well as in the engine.
// This does not calculate mechanics, author NPC consent or change a campaign.
const ID=/^[a-z0-9][a-z0-9_-]{4,79}$/;
const SAFE_SEQUENCE=new Set([
 'discipline.practice','health.sleep','world.wait','social.householdWork'
]);
function scene(req){
 if(req.scene!==undefined &&
   (typeof req.scene!=='string'||!req.scene.trim()||req.scene.length>450))
  throw Error('Scene must be a genuine short pickup point (1–450 characters)');
 if(req.summary!==undefined &&
    (typeof req.summary!=='string'||req.summary.length>400))
  throw Error('Summary must be at most 400 characters');
 if(req.focus!==undefined &&
    (!Array.isArray(req.focus)||req.focus.length>2||
     req.focus.some(x=>typeof x!=='string'||x.length>80)))
  throw Error('Focus needs at most two short strings');
}
function validate(req){
 if(!req||typeof req!=='object'||Array.isArray(req)||!ID.test(req.id))
  throw Error('Invalid stable turn id');
 if(!['act','check','checkpoint','status','rule','sequence'].includes(req.mode))
  throw Error('Unsupported mode');
 scene(req);
 if(req.mode==='status' && (req.scene!==undefined||req.summary!==undefined))
  throw Error('Read-only status cannot change the pickup scene');
 if(req.mode==='checkpoint'&&req.scene===undefined)
  throw Error('A checkpoint needs its actual pickup scene');
 if(req.mode!=='sequence')return req;
 const allowed=new Set(['id','campaign','mode','steps','expectedHash','scene','summary','focus']);
 if(Object.keys(req).some(x=>!allowed.has(x)))
  throw Error('A sequence cannot select dice, outcomes, bonus time or arbitrary rules');
 if(req.id.length>66)throw Error('Sequence turn ID is too long to derive stable substep IDs');
 if(!Array.isArray(req.steps)||req.steps.length<2||req.steps.length>6)
  throw Error('A sequence needs two to six original bounded actions');
 for(let i=0;i<req.steps.length;i++){
  const step=req.steps[i];
  if(!step||typeof step!=='object'||Array.isArray(step)||
     step.mode!=='rule'||typeof step.system!=='string'||
     typeof step.operation!=='string'||!SAFE_SEQUENCE.has(step.system+'.'+step.operation)||
     !step.params||typeof step.params!=='object'||Array.isArray(step.params)||
     Object.keys(step).some(k=>!['mode','system','operation','params'].includes(k)))
    throw Error('Sequence step '+(i+1)+' is not a supported source-owned routine action');
 }
 return req;
}
module.exports={validate,scene,SAFE_SEQUENCE};
if(require.main===module){
 const fs=require('node:fs'),path=process.argv[2];
 if(!path)throw Error('Usage: node scripts/turn-preflight.js request.json');
 validate(JSON.parse(fs.readFileSync(path,'utf8')));
 console.log('Valid Beastbound turn shape (mechanics, source facts and save staleness checked at execution)');
}
