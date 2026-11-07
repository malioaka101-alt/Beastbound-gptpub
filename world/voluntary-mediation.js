'use strict';
// Private Beastbound: voluntary household mediation, not a binding royal
// judgement or a generic player-controlled NPC persuasion result.
const Crypto=require('node:crypto');
const Houses=require('./social-houses'),Hearings=require('./public-hearings'),
 Gov=require('./government-offices');
const SOURCE='A resident freely proposes voluntary dialogue after a witnessed March Council mediation invitation';
const REPLY_SOURCE='Independent personal replies from the public elders of the two disputing households';
const BOOK_SOURCE='A civic clerk records a booked public mediation after both invited elders consented';
const SESSION_SOURCE='Witnessed public mediation with two consenting named household elders';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function hearingProof(s,w,id){
 const h=s.table?.publicHearings?.records?.find(x=>x.hearingId===id);
 const world=w?.publicHearingReviews?.find(x=>x.hearingId===id);
 const dock=w?.governance?.reedmarch?.publicHearingDockets?.find(x=>x.hearingId===id);
 const i=Hearings.ISSUES[h?.issueId];
 if(!h||!i||i.houseIds.length!==2||!Hearings.sourceCheck(s,h)||
  h.state!=='reviewed'||h.disposition!=='mediation_invite'||
  !Number.isInteger(h.releaseDay)||h.releaseDay>Math.floor(s.world.minutes/1440)||
  world?.source!==Hearings.REVIEW||world.disposition!=='mediation_invite'||
  world.sourceEventHash!==h.eventHash||world.issueId!==h.issueId||
  dock?.sourceEventHash!==h.eventHash||dock.issueId!==h.issueId||
  dock.disposition!=='mediation_invite'||dock.releaseDay!==h.releaseDay)
  throw Error('A genuinely witnessed, published, and independently invited local family mediation hearing is necessary');
 return {h,i};
}
function offerProof(s,w,r){
 const {h,i}=hearingProof(s,w,r.hearingId);
 const e=s.log?.[r.eventIndex];
 if(r.source!==SOURCE||r.issueId!==h.issueId||
   !Number.isInteger(r.requestedMinute)||r.requestedMinute<0||
   !Number.isInteger(r.nextReplyDay)||
   r.nextReplyDay!==Math.floor(r.requestedMinute/1440)+6||
   e?.type!=='story'||e.details?.origin!=='registered-voluntary-mediation-offer'||
   e.details?.mediationId!==r.mediationId||
   e.details?.hearingId!==r.hearingId||e.details?.issueId!==r.issueId||
   e.details?.proposal!==r.proposal||e.details?.minutes!==12||
   e.details?.requestedMinute!==r.requestedMinute||
   e.details?.source!==SOURCE||e.details?.location!=='crossing'||
   e.details?.hearingWitnessHash!==h.eventHash||
   e.details?.invitedElders?.join('|')!==i.houseIds.map(id=>Houses.byId[id].elder).join('|')||
   hash(e)!==r.eventHash)
  throw Error('The mediation offer is not grounded in its original witnessed hearing and resident proposal');
 return {h,i};
}
function review(s,w,day,draw,emit){
 const offers=s.table?.voluntaryMediation?.offers;
 if(!Array.isArray(offers)||!offers.length)return 0;
 if(typeof draw!=='function')throw Error('Household dialogue must use independent real world uncertainty');
 const gov=Gov.ensure(w).reedmarch,host=w.countries?.reedmarch;
 if(!gov||!host)return 0;
 w.mediationReplies||=[];
 let n=0;
 for(const r of offers){
  if(r.state!=='requested'||day<r.nextReplyDay||
    w.mediationReplies.some(x=>x.mediationId===r.mediationId))continue;
  let refs;
  try{refs=offerProof(s,w,r);}catch(_){continue;}
  if(!refs.i.houseIds.every(id=>Houses.byId[id]&&w.houses?.[id]))continue;
  const replies=refs.i.houseIds.map(houseId=>{
   const h=Houses.byId[houseId],v=w.houses[houseId];
   const x=draw();
   if(!Number.isFinite(x)||x<0||x>=1)
    throw Error('An independent elder must make a real bounded decision');
   const acceptChance=Math.min(.72,.26+v.publicPressure/230+
      (host.legitimacy>=55?.12:0));
   const decision=x<acceptChance?'willing':
    x<Math.min(.91,acceptChance+.24)?'seeks_revision':'declines';
   const reply=decision==='willing'?
    h.elder+' volunteers to attend a future public discussion of '+h.duty+
    ', without promising concessions or binding the wider household.':
    decision==='seeks_revision'?
    h.elder+' asks for a more precise written proposal about '+h.dispute+
    ' before deciding whether to meet.':
    h.elder+' declines this invitation for now, citing the existing '+h.dispute+
    ' dispute. No permanent grievance is implied.';
   return {houseId,elder:h.elder,decision,reply};
  });
  const allWilling=replies.every(x=>x.decision==='willing');
  r.state='answered';r.replyDay=day;r.releaseDay=day+2;
  r.individualReplies=replies;r.replySource=REPLY_SOURCE;
  r.meetingPossible=allWilling;
  w.mediationReplies.push({mediationId:r.mediationId,hearingId:r.hearingId,
   day,releaseDay:day+2,eventHash:r.eventHash,
   replies:replies.map(x=>({houseId:x.houseId,elder:x.elder,decision:x.decision})),
   source:REPLY_SOURCE});
  if(w.mediationReplies.length>120)w.mediationReplies.shift();
  if(typeof emit==='function')emit({
   day,region:'reedmarch',subject:'mediation-reply:'+r.mediationId,
   text:allWilling?
    'Two household elders agree to consider attending voluntary public mediation; no terms or obligations are yet accepted.':
    'The public council receives separate responses to an invited family discussion; a meeting is not yet agreed.',
   channel:'public notice',releaseDay:day+2,severity:'routine'
  });
  n++;
 }
 return n;
}
function replyProof(s,w,r){
 offerProof(s,w,r);
 const response=w.mediationReplies?.find(x=>x.mediationId===r.mediationId);
 const h=Hearings.ISSUES[r.issueId];
 if(!response||response.source!==REPLY_SOURCE||
   response.eventHash!==r.eventHash||response.hearingId!==r.hearingId||
   response.day!==r.replyDay||response.releaseDay!==r.releaseDay||
   r.replySource!==REPLY_SOURCE||
   !Number.isInteger(r.releaseDay)||r.releaseDay>Math.floor(s.world.minutes/1440)||
   !Array.isArray(r.individualReplies)||r.individualReplies.length!==2||
   !Array.isArray(response.replies)||response.replies.length!==2)
  throw Error('No independently witnessed and published family reply supports mediation');
 for(let i=0;i<2;i++){
  const a=r.individualReplies[i],b=response.replies[i],house=Houses.byId[h.houseIds[i]];
  if(a.houseId!==house.id||b.houseId!==house.id||
   a.elder!==house.elder||b.elder!==house.elder||
   a.decision!==b.decision||
   !['willing','seeks_revision','declines'].includes(a.decision))
   throw Error('Individual family elder consent cannot be forged or inferred from lineage');
 }
 if(r.meetingPossible!==r.individualReplies.every(x=>x.decision==='willing'))
  throw Error('A meeting cannot be scheduled without every individual elder consenting');
 return response;
}
function sessionDraw(w,houseId,draw){
 const v=w.houses?.[houseId];
 if(!v)throw Error('The independent house is no longer represented in its own real world');
 const x=draw();
 if(!Number.isFinite(x)||x<0||x>=1)
  throw Error('Actual independent personal deliberation requires a bounded world draw');
 const chance=Math.min(.75,.24+v.publicPressure/300);
 return x<chance?'supports_joint_inspection':
  x<Math.min(.93,chance+.33)?'asks_for_more_detail':'will_not_commit';
}
module.exports={SOURCE,REPLY_SOURCE,BOOK_SOURCE,SESSION_SOURCE,hash,hearingProof,offerProof,replyProof,review,sessionDraw};
