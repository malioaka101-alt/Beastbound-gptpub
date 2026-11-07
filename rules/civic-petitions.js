'use strict';
// Direct citizen access to the March Council; no noble title, kinship,
// wealth, accredited guild standing or player-authored successful result.
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 Health=require('./unified'),A=require('../world/atlas'),
 Civic=require('../world/civic-petitions'),Realm=require('../world/simulation');
const OPEN=8*60,CLOSE=18*60,POST=12,PICKUP=8;
function counter(s,mins){
 if(s.world?.location!=='crossing'||!E.LOCATIONS.crossing||
    A.LOCATION_REGION.crossing!=='morrowfen_basin'||
    A.R.morrowfen_basin.polity!=='reedmarch'||
    A.I.marsh_council?.type!=='civil council')
  throw Error('The currently established March Council public correspondence counter is at Morrowfen Crossing');
 if(s.encounter||s.battle)
  throw Error('An active encounter is not a quiet public council appointment');
 const combatant=s.table?.combatants?.player;
 if(combatant&&combatant.status!=='ok')
  throw Error('An incapacitated citizen cannot file a normal unsupervised council petition');
 const m=s.world.minutes%1440;
 if(m<OPEN||m+mins>CLOSE)
  throw Error('The civil counter operates during the existing public daytime registry hours');
 return A.I.marsh_council;
}
function validateOnly(p,kind){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length!==1||
    !Object.hasOwn(p,kind))
  throw Error('Public citizen correspondence accepts only the resident statement or an actual issued petitionId, never a favourable ruling or royal title');
}
function readLedger(s){
 const entries=s.table?.civicPetitions?.records||[];
 if(!Array.isArray(entries))throw Error('The saved citizen correspondence registry is invalid');
 return entries;
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Civic petition status is read-only and takes no requests');
 return {currentPolity:A.P[A.R[A.LOCATION_REGION[s.world.location]]?.polity]?.name||null,
  petitions:readLedger(s).slice(-30).map(r=>({
   petitionId:r.petitionId,postedDay:Math.floor(r.postedAtMinute/1440)+1,
   statement:r.statement,receiptState:r.state==='at_counter'?
    'reply ready for in-person pickup':r.state,
   decision:r.state==='collected'?r.decision:null,
   response:r.state==='collected'?r.response:null
  })),
  rule:'An ordinary resident may petition without kinship, tuition, prestige or a pledged patron. The council does not automatically agree, grant office or verify allegations.'};
}
function submit(s,p={}){
 validateOnly(p,'statement');
 if(typeof p.statement!=='string'||p.statement.trim().length<15||
    p.statement.length>1000||/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(p.statement))
  throw Error('A resident must actually express a readable civic concern of 15–1000 characters');
 counter(s,POST);
 const existing=readLedger(s),start=s.world.minutes,
  statement=p.statement.trim();
 if(existing.some(r=>r.statement===statement&&Number.isInteger(r.postedAtMinute)&&
   start-r.postedAtMinute<6*1440))
  throw Error('This identical petition was already filed this sixday; other genuine civic concerns remain open');
 const petitionId='public_petition_'+start;
 if(existing.some(r=>r.petitionId===petitionId))
  throw Error('An actual unique civic petition already exists at this time');
 const balance=s.player.coins,rng=s.rngState;
 E.advance(s,POST);W.finalizeTime(s,start);Health.sync(s,{source:'legacy'});
 C.event(s,'story','A resident files a public petition for ordinary March Council review; no reported claim is thereby established.',{
  origin:'public-citizen-petition',petitionId,
  polity:'reedmarch',location:'crossing',minutes:POST,
  statement,source:Civic.SOURCE
 });
 const ev=s.log.at(-1),eventHash=Civic.hash(ev);
 s.table||={};s.table.civicPetitions||={records:[]};
 const records=s.table.civicPetitions.records;
 if(!Array.isArray(records))throw Error('The civic petition ledger is invalid');
 records.push({petitionId,statement,state:'submitted',
  postedAtMinute:start,nextReviewDay:Math.floor(start/1440)+6,
  eventIndex:s.log.length-1,eventHash,source:Civic.SOURCE});
 if(records.length>100)records.shift();
 return {filed:true,petitionId,minutes:POST,feeTalons:0,
  noRoll:true,noGuaranteedHearing:true,noGuaranteedRank:true,
  claimVerified:false,playerCoinsUnchanged:s.player.coins===balance,
  playerRNGUnchanged:s.rngState===rng,
  note:'Actual council deliberation is independent, after genuine world time'};
}
function collect(s,p={}){
 validateOnly(p,'petitionId');
 if(typeof p.petitionId!=='string'||!/^public_petition_[0-9]{1,20}$/.test(p.petitionId))
  throw Error('A real previously issued civic petitionId is necessary to pick up a reply');
 counter(s,PICKUP);
 const r=readLedger(s).find(x=>x.petitionId===p.petitionId);
 const w=Realm.peek(s),review=w.civicPetitionReviews?.find(x=>x.petitionId===p.petitionId);
 if(!r||r.state!=='at_counter'||!['docketed','deferred','declined'].includes(r.decision)||
   r.response!==Civic.TEXT[r.decision]||r.reviewSource!==Civic.REVIEW||
   !Number.isInteger(r.responseDay)||r.responseDay<r.nextReviewDay||
   !Civic.sourceCheck(s,r)||
   !review||review.source!==Civic.REVIEW||
   review.petitionEventHash!==r.eventHash||review.decision!==r.decision||
   review.day!==r.responseDay)
  throw Error('Only a genuinely independently returned March Council response may be collected');
 if(r.decision==='docketed'&&
   !w.governance?.reedmarch?.publicDockets?.some(x=>x.petitionId===r.petitionId&&
    x.petitionEventHash===r.eventHash&&x.day===r.responseDay&&
    x.status==='registered_for_public_consideration'))
  throw Error('The council’s claimed public docket lacks its actual procedural record');
 const old=s.world.minutes;
 E.advance(s,PICKUP);W.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 r.state='collected';r.collectedAtMinute=s.world.minutes;
 C.event(s,'story','The council counter gives the citizen its genuine independent public petition reply.',{
  origin:'received-independent-council-response',petitionId:r.petitionId,
  decision:r.decision,reviewDay:r.responseDay
 });
 return {received:true,petitionId:r.petitionId,
  decision:r.decision,response:r.response,minutes:PICKUP,
  publicDocket:r.decision==='docketed',
  didNotChangeLaw:true,noSocialRank:true,noInheritedPower:true,
  noAutomaticAudience:true};
}
module.exports={submit,status,collect};
