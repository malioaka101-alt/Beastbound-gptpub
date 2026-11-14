'use strict';
const Preflight=require('./turn-preflight');
// Only records what the GM and player actually established in the narrative.
// The scene is never an engine witness of earnings, consent, power or completion.
function apply(s,req,day){
 Preflight.scene(req);
 if(req.scene!==undefined)s.chatRuntime.scene=req.scene;
 if(req.summary!==undefined&&req.summary.trim()){
  s.chatRuntime.journal ||= [];
  s.chatRuntime.journal.push({day,text:req.summary.trim()});
  s.chatRuntime.journal=s.chatRuntime.journal.slice(-30);
 }
}
module.exports={apply};
