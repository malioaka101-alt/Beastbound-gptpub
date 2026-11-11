'use strict';
// Independent civic review on the existing real world-sixday clock.
// A citizen's own allegations are NOT verified facts, new law, a royal order
// or evidence of anyone's guilt or bloodline.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 Gov=require('./government-offices');
const hash=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
const SOURCE='Citizen-authored civic concern filed at the Morrowfen Crossing March Council public counter';
const REVIEW='Independent March Council response to a witnessed public petition';
const TEXT=Object.freeze({
 docketed:'The March Council registers the citizen petition for public consideration; no allegation has been verified and no law or benefit has been granted.',
 deferred:'The March Council acknowledges the submission but defers review under its present workload; the concern remains a claim, not an established finding.',
 declined:'The March Council declines to place the submission on its current public agenda; the resident remains free to pursue lawful independent avenues.'
});
function sourceCheck(s,r){
 const ev=s.log?.[r.eventIndex];
 return ev?.type==='story'&&ev.details?.origin==='public-citizen-petition'&&
   ev.details?.petitionId===r.petitionId&&
   ev.details?.polity==='reedmarch'&&
   ev.details?.location==='crossing'&&
   ev.details?.statement===r.statement&&
   ev.details?.minutes===12&&
   ev.details?.source===SOURCE&&
   hash(ev)===r.eventHash;
}
function review(s,w,day,random,emit){
 const letters=s.table?.civicPetitions?.records;
 if(!Array.isArray(letters)||!letters.length)return 0;
 const civ=Gov.ensure(w).reedmarch,host=w.countries?.reedmarch,
   council=w.institutions?.marsh_council;
 if(!civ||!host||!council||council.status!=='active')return 0;
 if(typeof random!=='function')throw Error('Public council decisions must arise from the actual independent world RNG');
 w.civicPetitionReviews||=[];
 civ.publicDockets||=[];
 let processed=0;
 for(const r of letters){
  if(r.state!=='submitted'||!Number.isInteger(r.nextReviewDay)||day<r.nextReviewDay)continue;
  if(!sourceCheck(s,r)||r.source!==SOURCE||
    !Number.isInteger(r.postedAtMinute)||day<Math.floor(r.postedAtMinute/1440)+6)
   continue;
  if(w.civicPetitionReviews.some(x=>x.petitionId===r.petitionId))
   continue;
  const chance=.20+(council.capacity>=55?.17:0)+
    (host.stability>=45?.1:0)+(host.legitimacy>=55?.12:0);
  const draw=random();
  if(!(Number.isFinite(draw)&&draw>=0&&draw<1))
   throw Error('Independent civic review requires a real bounded world draw');
  const decision=draw<chance?'docketed':
    draw>.90?'declined':'deferred';
  r.state='at_counter';r.decision=decision;r.responseDay=day;
  r.response=TEXT[decision];r.reviewSource=REVIEW;
  w.civicPetitionReviews.push({
   petitionId:r.petitionId,decision,day,petitionEventHash:r.eventHash,
   source:REVIEW
  });
  if(w.civicPetitionReviews.length>150)w.civicPetitionReviews.shift();
  if(decision==='docketed'){
   civ.publicDockets.push({petitionId:r.petitionId,day,
    status:'registered_for_public_consideration',
    petitionEventHash:r.eventHash,source:REVIEW});
   if(civ.publicDockets.length>60)civ.publicDockets.shift();
   if(typeof emit==='function')emit({
    day,region:'reedmarch',subject:'council-docket:'+r.petitionId,
    text:'The March Council announces that a resident petition has entered its public docket. The claims have not been verified; no policy has yet been enacted.',
    channel:'public notice',releaseDay:day+2,severity:'routine'
   });
  }
  Gov.attestOriginalCivicProcedure(s,w,{kind:'citizen_petition',witnessId:r.petitionId});
  processed++;
 }
 return processed;
}
module.exports={SOURCE,REVIEW,TEXT,hash,sourceCheck,review};
