'use strict';
// Preserve the SAME earned-PP ledger used by engine skill progression.
// Never add a second PP/XP currency or award a second practice from a
// replayed / unsupported check. Call only after the real single roll.
const E=require('../engine.js'),C=require('./core');
function award(s,{skill,check,risky=true}={}){
 if(typeof skill!=='string'||!check||typeof check.success!=='boolean'||
    typeof risky!=='boolean')
  throw Error('A genuine resolved skill check with a recorded risk flag is required');
 const v=s.player?.skills?.[skill];
 if(!v)throw Error('Practice requires an existing earned character skill');
 const originalRank=C.int(v.rank,'recorded practice skill rank',0,5);
 C.int(v.xp,'recorded existing skill Practice Points',0,10000000);
 if(v.ppPeriod!==undefined)C.int(v.ppPeriod,'recorded sixday PP period',0,1000000);
 if(v.ppThisSixday!==undefined)C.int(v.ppThisSixday,'recorded PP earned in this period (reporting only)',0,10000000);
 const period=Math.floor((E.day(s)-1)/6);
 const previous=v.ppPeriod===period?(v.ppThisSixday??0):0;
 if(risky)E.skillGain(s,skill,check.success?2:1);
 return {practiceSkill:skill,ppAwarded:risky?v.ppThisSixday-previous:0,
  skillRankBefore:originalRank,skillRankAfter:v.rank,
  noExtraRoll:true};
}
module.exports={award};
