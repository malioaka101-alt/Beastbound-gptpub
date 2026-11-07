'use strict';
// The resident writes freely. Two already-known independent family elders
// must personally volunteer to attend; even attending does not mean signing.
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 Health=require('./unified'),Atlas=require('../world/atlas'),
 Realm=require('../world/simulation'),Houses=require('../world/social-houses'),
 HearingRule=require('./public-hearings'),Med=require('../world/voluntary-mediation');
const POST=12,BOOK=10,MEET=45,MAX_AGE=30*1440;
function fields(p,names,required=names){
 if(!p||typeof p!=='object'||Array.isArray(p)||
   Object.keys(p).some(x=>!names.includes(x))||
   required.some(x=>!Object.hasOwn(p,x)))
  throw Error('Mediation accepts only an actual issued hearing/invitation, the player’s own words, and an optional genuine preferred sitting day');
}
function speech(s,label,min=12,max=1400){
 if(typeof s!=='string'||s.trim().length<min||s.length>max||
   /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(s))
  throw Error(label+' must be a readable '+min+'–'+max+' character resident statement');
 return s.trim();
}
function counter(s,mins,{session=false}={}){
 if(s.world?.location!=='crossing'||
    Atlas.LOCATION_REGION.crossing!=='morrowfen_basin'||
    Atlas.I.marsh_council?.type!=='civil council')
  throw Error('The known public mediation desk exists at Morrowfen Crossing');
 if(s.battle||s.encounter)
  throw Error('An unresolved battle or animal encounter cannot become quiet voluntary dialogue');
 const c=s.table?.combatants?.player;
 if(c&&c.status!=='ok')
  throw Error('An incapacitated person cannot conduct this unsupported public appointment');
 const m=s.world.minutes%1440;
 if(m<(session?600:480)||m+mins>(session?960:1080))
  throw Error('Mediation correspondence requires daytime hours; a session requires a documented 10:00–16:00 sitting');
 if(session&&HearingRule.workday(s,Math.floor(s.world.minutes/1440))!==4)
  throw Error('The documented public mediation sitting uses the actual Workday 4 calendar');
 const w=Realm.peek(s);
 if(w.institutions?.marsh_council?.status!=='active')
  throw Error('No active March Council clerk can witness or facilitate the current meeting');
 return w;
}
function ledger(s){
 const r=s.table?.voluntaryMediation?.offers||[];
 if(!Array.isArray(r))throw Error('The saved household mediation record cannot be interpreted');
 return r;
}
function checked(s,id){
 const a=ledger(s).find(x=>x.mediationId===id);
 if(!a)throw Error('An actual previously filed mediation invitation is required');
 return a;
}
function view(s,p={}){
 fields(p,[],[]);
 const now=Math.floor(s.world.minutes/1440),here=s.world.location==='crossing',
  w=Realm.peek(s);
 const items=ledger(s).slice(-30).map(r=>{
  let visible=false;
  if((r.state==='answered'||r.state==='scheduled'||r.state==='met')&&
    here&&r.releaseDay<=now){
   try{Med.replyProof(s,w,r);visible=true;}catch(_){}
  }
  if(r.state==='met'){
   try{sessionProof(s,w,r);visible=true;}catch(_){visible=false;}
  }// Only a real personally witnessed session is known anywhere.
  if(r.state==='withdrawn')visible=here&&r.releaseDay<=now; // Earlier private replies remain sealed if never published.
  return {mediationId:r.mediationId,hearingId:r.hearingId,issueId:r.issueId,
   proposal:r.proposal,
   stage:r.state==='withdrawn'?'withdrawn by the resident':
    visible?r.state:'awaiting independent household replies',
   publicReplies:visible?r.individualReplies:null,
   meetingPossible:visible?r.meetingPossible:null,
   meetingDay:visible?r.meetingDay??null:null,
   meetingTime:visible&&r.meetingDay!==undefined?'10:00–16:00':null,
   completedMeeting:visible&&r.state==='met'?r.session?.responses:null,
   jointInspectionOnlyProposed:visible&&r.state==='met'?
    r.session?.jointInspectionProposed===true:null};
 });
 return {polity:'Reedmarch Compact',venue:'Morrowfen Crossing public March Council',
  offers:items,noAutomaticAgreement:true,
  note:'Both named elders choose independently. Their willingness to meet is not a promise to accept the resident’s proposals or to bind their households.'};
}
function propose(s,p={}){
 fields(p,['hearingId','proposal']);
 const proposal=speech(p.proposal,'Voluntary household mediation proposal',18,1400);
 if(typeof p.hearingId!=='string')
  throw Error('A previously issued hearingId is required');
 const w=counter(s,POST),{h,i}=Med.hearingProof(s,w,p.hearingId);
 const now=s.world.minutes,rows=ledger(s);
 const older=rows.filter(x=>x.hearingId===p.hearingId);
 if(older.some(x=>x.state==='requested'||x.state==='scheduled'))
  throw Error('An earlier mediation request or booked meeting must receive real independent consideration first');
 if(older.some(x=>x.state==='answered'&&
   Number.isInteger(x.replyDay)&&now<(x.replyDay+6)*1440))
  throw Error('A separate sixday of reflection is required before proposing new terms to the same households');
 if(older.some(x=>x.state==='met'&&
   Number.isInteger(x.session?.metAtMinute)&&now-x.session.metAtMinute<6*1440))
  throw Error('A separate sixday is required after an actual meeting before a new mediation invitation');
 if(older.some(x=>x.state==='withdrawn'&&
  Number.isInteger(x.requestedMinute)&&now-x.requestedMinute<6*1440))
  throw Error('A fresh invitation cannot immediately farm elder responses after withdrawing an earlier request');
 const mediationId='mediation_'+p.hearingId+'_'+now;
 if(rows.some(x=>x.mediationId===mediationId))
  throw Error('This exact mediation record already exists');
 const members=i.houseIds.map(id=>Houses.byId[id]?.elder);
 if(members.some(x=>!x))throw Error('An invented noble representative cannot be asked to mediate');
 E.advance(s,POST);W.finalizeTime(s,now);Health.sync(s,{source:'legacy'});
 C.event(s,'story','A resident files an invitation to voluntary family dialogue after an independently issued council hearing.',{
  origin:'registered-voluntary-mediation-offer',source:Med.SOURCE,
  mediationId,hearingId:h.hearingId,issueId:h.issueId,proposal,
  invitedElders:members,hearingWitnessHash:h.eventHash,
  requestedMinute:now,location:'crossing',minutes:POST
 });
 const eventIndex=s.log.length-1,eventHash=Med.hash(s.log[eventIndex]);
 s.table||={};s.table.voluntaryMediation||={offers:[]};
 const dest=s.table.voluntaryMediation.offers;
 if(!Array.isArray(dest))throw Error('Existing mediation invitations cannot be overwritten');
 dest.push({mediationId,hearingId:h.hearingId,issueId:h.issueId,
   proposal,source:Med.SOURCE,requestedMinute:now,
   nextReplyDay:Math.floor(now/1440)+6,
   eventIndex,eventHash,state:'requested'});
 if(dest.length>80)dest.splice(0,dest.length-80);
 return {invited:true,mediationId,hearingId:h.hearingId,issueId:h.issueId,
  proposal,publicElders:members,minutes:POST,tuition:0,
  noGuaranteedAttendance:true,noGuaranteedSettlement:true,
  noGrantedBloodline:true,noGrantedOffice:true};
}
function withdraw(s,p={}){
 fields(p,['mediationId']);
 if(typeof p.mediationId!=='string')throw Error('A real issued mediationId is necessary to withdraw');
 counter(s,8);
 const r=checked(s,p.mediationId),now=s.world.minutes;
 if(!['requested','answered','scheduled'].includes(r.state))
  throw Error('Only an existing unfinished citizen mediation invitation can be withdrawn');
 const w=Realm.peek(s);
 Med.offerProof(s,w,r);
 // A player can retract their own invitation, not erase another person's
 // past voluntary reply, or fabricate a household's reasons for declining.
 const previousState=r.state;
 E.advance(s,8);W.finalizeTime(s,now);Health.sync(s,{source:'legacy'});
 C.event(s,'story','A resident withdraws their own proposed mediation and any future public booking without speaking for either household.',{
  origin:'resident-withdrew-voluntary-mediation',mediationId:r.mediationId,
  originalOfferHash:r.eventHash,previousState,source:'Real resident-initiated retraction at the March Council desk',
  location:'crossing',minutes:8
 });
 r.state='withdrawn';r.withdrawnMinute=now;
 r.withdrawalIndex=s.log.length-1;r.withdrawalHash=Med.hash(s.log[r.withdrawalIndex]);
 return {withdrawn:true,mediationId:r.mediationId,minutes:8,
  independentRepliesRemainHistorical:true,
  noFamilyDisgrace:true,noRankOrPowerChange:true};
}
function book(s,p={}){
 fields(p,['mediationId','preferredDay'],['mediationId']);
 if(typeof p.mediationId!=='string')throw Error('A known mediationId is required');
 const w=counter(s,BOOK),r=checked(s,p.mediationId),now=Math.floor(s.world.minutes/1440);
 if(r.state!=='answered')throw Error('Both independent family replies must be received before a public mediation is booked');
 Med.replyProof(s,w,r);
 if(!r.meetingPossible||r.individualReplies.some(x=>x.decision!=='willing'))
  throw Error('Every invited elder must actually volunteer to attend a formal mediation');
 if(now-r.replyDay>30)throw Error('Old attendance willingness must be reconfirmed after thirty days');
 let day;
 if(p.preferredDay!==undefined){
  if(!Number.isInteger(p.preferredDay)||p.preferredDay<now+2||
   p.preferredDay>now+30||HearingRule.workday(s,p.preferredDay)!==4)
   throw Error('A preferred meeting day must be a real Workday 4, two to thirty days ahead');
  day=p.preferredDay;
 }else{
  for(let d=now+2;d<=now+30;d++)
   if(HearingRule.workday(s,d)===4){day=d;break;}
  if(day===undefined)throw Error('There is no accessible valid council sitting within thirty days');
 }
 const start=s.world.minutes;
 E.advance(s,BOOK);W.finalizeTime(s,start);Health.sync(s,{source:'legacy'});
 C.event(s,'story','The March Council registers a future public conversation with the two individually consenting family elders.',{
  origin:'booked-consensual-public-mediation',mediationId:r.mediationId,
  issueId:r.issueId,meetingDay:day,
  replyDay:r.replyDay,bookedMinute:start,
  elderNames:r.individualReplies.map(x=>x.elder),
  originalOfferHash:r.eventHash,location:'crossing',source:Med.BOOK_SOURCE,
  minutes:BOOK
 });
 r.bookingIndex=s.log.length-1;r.bookingHash=Med.hash(s.log[r.bookingIndex]);
 r.bookedMinute=start;r.meetingDay=day;r.state='scheduled';
 return {booked:true,mediationId:r.mediationId,
  scheduledDay:day+1,session:'Workday 4, 10:00–16:00',
  attendees:r.individualReplies.map(x=>x.elder),
  minutes:BOOK,noForcedContract:true,noAutomaticRank:true};
}
function bookingProof(s,w,r){
 Med.replyProof(s,w,r);
 const e=s.log?.[r.bookingIndex];
 if(!r.meetingPossible||!Number.isInteger(r.meetingDay)||
   r.meetingDay<=Math.floor(r.bookedMinute/1440)||
   HearingRule.workday(s,r.meetingDay)!==4||
   e?.type!=='story'||e.details?.origin!=='booked-consensual-public-mediation'||
   e.details?.mediationId!==r.mediationId||e.details?.issueId!==r.issueId||
   e.details?.meetingDay!==r.meetingDay||e.details?.replyDay!==r.replyDay||
   e.details?.bookedMinute!==r.bookedMinute||
   e.details?.originalOfferHash!==r.eventHash||
   e.details?.elderNames?.join('|')!==r.individualReplies.map(x=>x.elder).join('|')||
   e.details?.location!=='crossing'||e.details?.source!==Med.BOOK_SOURCE||
   e.details?.minutes!==BOOK||
   Med.hash(e)!==r.bookingHash)
  throw Error('The registered meeting lacks real advance booking and two personal consent records');
}
function sessionProof(s,w,r){
 bookingProof(s,w,r);
 const session=r.session,e=s.log?.[session?.eventIndex];
 if(!session||r.state!=='met'||
  !Number.isInteger(session.metAtMinute)||session.metAtMinute<0||
  Math.floor(session.metAtMinute/1440)!==r.meetingDay||
  !Array.isArray(session.responses)||session.responses.length!==2||
  session.jointInspectionProposed!==session.responses.every(x=>x.decision==='supports_joint_inspection')||
  e?.type!=='story'||e.details?.origin!=='witnessed-voluntary-family-mediation'||
  e.details?.mediationId!==r.mediationId||e.details?.issueId!==r.issueId||
  e.details?.statement!==session.statement||e.details?.minutes!==MEET||
  e.details?.metAtMinute!==session.metAtMinute||
  e.details?.source!==Med.SESSION_SOURCE||e.details?.location!=='crossing'||
  e.details?.bookingEventHash!==r.bookingHash||
  e.details?.jointInspectionProposed!==session.jointInspectionProposed||
  JSON.stringify(e.details?.responses)!==JSON.stringify(session.responses)||
  e.details?.attendees?.join('|')!==session.responses.map(x=>x.elder).join('|')||
  e.details?.decisions?.join('|')!==session.responses.map(x=>x.decision).join('|')||
  Med.hash(e)!==session.eventHash)
  throw Error('No unmodified actually witnessed session supports this claimed mediation outcome');
 for(let i=0;i<2;i++){
  const q=session.responses[i],delegate=r.individualReplies[i],house=Houses.byId[delegate.houseId];
  if(!house||q.houseId!==house.id||q.elder!==delegate.elder||
    !['supports_joint_inspection','asks_for_more_detail','will_not_commit'].includes(q.decision))
   throw Error('A witnessed mediation cannot substitute or invent an unconsenting family elder');
 }
 if(session.jointInspectionProposed&&
   !w.civicJointInspections?.some(x=>
     x.mediationId===r.mediationId&&x.issueId===r.issueId&&
     x.sessionEventHash===session.eventHash&&
     x.stage==='voluntary_joint_site_inspection_proposed'&&
     x.performed===false&&x.legallyBinding===false))
  throw Error('The purported joint field visit has no consent-based public proposal record');
 return session;
}
function meet(s,p={}){
 fields(p,['mediationId','statement']);
 const words=speech(p.statement,'The player’s actual mediation statement',12,1400);
 if(typeof p.mediationId!=='string')throw Error('A known mediationId is necessary');
 const w=counter(s,MEET,{session:true}),r=checked(s,p.mediationId),
  now=Math.floor(s.world.minutes/1440);
 if(r.state!=='scheduled'||now!==r.meetingDay)
  throw Error('This person-to-person mediation must occur on its actually booked public sitting day');
 bookingProof(s,w,r);
 // A real session gives each present elder a genuinely independent decision
 // on a limited joint field inspection, not acceptance of all free-text terms.
 const houseIds=r.individualReplies.map(x=>x.houseId);
 if(!houseIds.every(id=>w.houses?.[id]))
  throw Error('The actual named local households must still exist and act independently');
 const started=s.world.minutes;
 const responses=houseIds.map(id=>{
  const h=Houses.byId[id],decision=Med.sessionDraw(w,id,()=>Realm.worldDraw(s));
  const text=decision==='supports_joint_inspection'?
   h.elder+' volunteers to consider a joint nonbinding site inspection relevant to '+h.duty+'.':
   decision==='asks_for_more_detail'?
   h.elder+' requests a clearer account of '+h.dispute+' before offering further practical commitments.':
   h.elder+' declines to commit to a joint inspection today, without ending future discussion.';
  return {houseId:id,elder:h.elder,decision,text};
 });
 const joint=responses.every(x=>x.decision==='supports_joint_inspection');
 E.advance(s,MEET);W.finalizeTime(s,started);Health.sync(s,{source:'legacy'});
 C.event(s,'story','A real mediated public discussion is witnessed with the two consenting elders and the citizen’s own actual words.',{
  origin:'witnessed-voluntary-family-mediation',
  mediationId:r.mediationId,issueId:r.issueId,statement:words,
  metAtMinute:started,attendees:responses.map(x=>x.elder),
  decisions:responses.map(x=>x.decision),
  responses:responses.map(x=>({...x})),
  jointInspectionProposed:joint,
  bookingEventHash:r.bookingHash,source:Med.SESSION_SOURCE,
  location:'crossing',minutes:MEET
 });
 const eventIndex=s.log.length-1,eventHash=Med.hash(s.log[eventIndex]);
 r.session={metAtMinute:started,statement:words,responses,
  jointInspectionProposed:joint,eventIndex,eventHash};
 r.state='met';
 if(joint){
  w.civicJointInspections||=[];
  w.civicJointInspections.push({
   mediationId:r.mediationId,issueId:r.issueId,day:now,
   stage:'voluntary_joint_site_inspection_proposed',
   participants:responses.map(x=>x.elder),sessionEventHash:eventHash,
   performed:false,legallyBinding:false
  });
 }
 return {met:true,mediationId:r.mediationId,
   namedParticipants:responses.map(x=>x.elder),
   freelySpoken:words,independentReplies:responses,
   jointInspectionProposed:joint,
   signedAgreement:false,inspectionPerformed:false,
   enactedLaw:false,familyMembership:false,
   minutes:MEET,feeTalons:0};
}
module.exports={view,propose,withdraw,book,meet,bookingProof,sessionProof};
