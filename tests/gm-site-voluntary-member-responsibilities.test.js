'use strict';
// Original GM-founded place + independently accepted association membership
// -> original autonomous member practical responsibility, NOT staff payroll,
// forced work, facilities, training or a new rank ladder.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),R=require('../rules'),
 New=require('../scripts/new-campaign'),Opening=require('../scripts/gm-campaign-opening'),
 Places=require('../world/lived-places'),People=require('../world/emergent-people'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency'),
 Turn=require('../scripts/chat-turn'),World=require('../rules/world');
const s=New.create({seed:842115,slug:'gm_site_voluntary_staff_roles_test',
 mode:'guided',homeRegion:'morrowfen_basin',age:26}).state;
const siteId='river_lantern_hall';
Opening.apply(s,{place:{placeId:siteId,name:'River Lantern Hall',
 regionId:s.campaign.origin.birthRegionId,
 description:'A real riverside public hall with a roof, seating and a shared desk beside the ferry approach.',
 kind:'ordinary local community hall',sceneType:'settlement',
 culture:'Residents may use the hall informally, but no public ownership, paid job or credential is implied.'},
 scene:'Talia Meadow is at River Lantern Hall, checking old ferry notes and speaking with the player beside the public desk.',
 focus:'Voluntary river observation roles',weather:'Light mist',
 hour:10,minute:0});
const act=(state,operation,params={})=>R.act(state,{system:'social',operation,params});
const npc=act(s,'introduceWitnessedPerson',{
 name:'Talia Meadow',profession:'Independent river and ferry surveyor',
 purpose:'Keep practical records of flooding and changing ferry crossings while retaining a freely chosen working life.',
 personality:'Calm, independent, cautious about institutional promises.',
 background:'An experienced field note keeper who may choose to share work with local neighbours without binding herself to contracts.',
 witness:'The player and GM both witness Talia Meadow studying ferry notes and comparing practical river observations at the public desk.'});
const formed=act(s,'formGroup',{
 name:'River Lantern Field Study Circle',
 kind:'informal voluntary local study group',
 purpose:'Compare authentic river notes and observe practical training without claiming any licence, property or compulsory teacher.'});
const groupId=formed.id, w=s.table.realm;
const group=G.lookup(w,groupId);
A.equal(group.funds,0);A.equal(group.members,1);
A.equal(act(s,'groupResponsibilitiesStatus',{groupId}).responsibilities.length,0);
A.throws(()=>act(s,'offerGroupResponsibility',{
 groupId,npcId:npc.npcId,title:'Field notes steward',
 scope:'Check independently recorded river crossing notes and offer practical guidance to consenting visitors.',
 untilDay:4}),/freely joined member|real local founder/);
const low=(()=>{
 for(let i=1;i<100000;i++){const t={rngState:i};if(Agency.draw(t)<.015)return i;}
 throw Error('Test fixture cannot exercise independent choice low seed');
})();
const high=(()=>{
 for(let i=1;i<100000;i++){const t={rngState:i};if(Agency.draw(t)>.97)return i;}
 throw Error('Test fixture cannot exercise independent choice high seed');
})();
Agency.ensure(w).rngState=low;
const invite=act(s,'inviteGroupMember',{
 groupId,npcId:npc.npcId,
 proposal:'Would you voluntarily join our river observations group, keeping your own work and being free to leave?'});
A.equal(invite.joined,true);
A.equal(invite.decision,'accepted');
A.equal(group.members,2);
const originalSite=Places.originalSiteProof(s),firstMoney=s.player.coins;
A.equal(originalSite.placeId,siteId);
const beforeRole=E.exportGame(s),firstMinute=s.world.minutes,firstRng=s.rngState;
const role={groupId,npcId:npc.npcId,title:'Voluntary river notes steward',
 scope:'Keep original river crossing notes available to willing visitors, explain previously observed conditions and never guarantee skill gains or employment.',
 untilDay:4};
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-member-original-role-'));
try{
 const file=Path.join(tmp,'campaign.json');FS.writeFileSync(file,beforeRole+'\n');
 const request={id:'gm_site_orig_role_842115',mode:'rule',system:'social',
  operation:'offerGroupResponsibility',params:role};
 const response=Turn.execute(file,request);
 A.equal(response.ok,true);A.equal(response.applied,true);
 A.equal(response.output.rules.originalMemberResponsibilityOwner,true);
 A.equal(response.output.rules.agreed,true,
  'Fixture controls only the independent world RNG seed, never the gameplay API outcome');
 A.equal(response.output.rules.actualMinutes,18);
 A.equal(response.output.rules.noAutomaticEmployment,true);
 A.equal(response.output.rules.noNewResourcesOrFacility,true);
 const saved=FS.readFileSync(file,'utf8'),real=E.importGame(saved),
  wr=real.table.realm,gr=G.lookup(wr,groupId);
 A.ok(gr&&gr.internalRoles.length===1);
 const entry=gr.internalRoles[0],q=entry.source;
 A.equal(G.validate(gr,wr),true);
 A.equal(entry.agreed,true);
 A.equal(q.place,siteId);
 A.equal(q.regionId,originalSite.regionId);
 A.equal(q.placeProof.foundingHash,originalSite.foundingHash);
 A.equal(q.siteMinute,firstMinute+18);
 A.equal(q.requestingFounder,real.player.name);
 A.equal(q.memberConsentHash,gr.additionalMembers[0].hash);
 A.equal(q.agreed,q.draw<q.agreeChance);
 A.equal(q.noNewWorkResult,undefined);
 A.equal(gr.taskServices.length,0);
 A.equal(gr.siteWork.length,0);
 A.equal(gr.funds,0);
 A.equal(real.player.coins,firstMoney);
 A.equal(real.rngState,firstRng);
 A.equal(real.world.minutes,firstMinute+18);
 A.equal(Turn.execute(file,request).duplicate,true);
 A.equal(FS.readFileSync(file,'utf8'),saved,'A replay must not re-decide personal consent');
 const readReq={id:'gm_site_orig_roles_read_842115',mode:'rule',
  system:'social',operation:'groupResponsibilitiesStatus',
  params:{groupId}};
 const view=Turn.execute(file,readReq);
 A.equal(view.applied,false);
 A.equal(view.output.rules.responsibilities.length,1);
 A.equal(view.output.rules.responsibilities[0].status,'voluntarily-serving');
 A.equal(view.output.rules.responsibilities[0].noAutomaticPay,true);
 A.equal(FS.readFileSync(file,'utf8'),saved,
  'Reading volunteer responsibility history cannot consume time or a turn');
 const clone=E.importGame(saved),cw=clone.table.realm;
 Agency.ensure(cw).rngState=high;
 const declined=act(clone,'offerGroupResponsibility',{...role,
  title:'Independent visitor records reviewer'});
 A.equal(declined.agreed,false);
 A.equal(declined.status,'declined');
 A.equal(G.lookup(cw,groupId).internalRoles.length,2);
 A.equal(G.validate(G.lookup(cw,groupId),cw),true);
 A.equal(clone.player.coins,firstMoney);
 A.equal(clone.rngState,firstRng);
 for(const kind of ['placeProof','region','member','worldSite','consent']){
  const damaged=E.importGame(saved),dw=damaged.table.realm,
   dg=dw.emergentGroups.entries[groupId],dr=dg.internalRoles[0];
  if(kind==='placeProof')dr.source.placeProof.founding.name='Counterfeit site';
  if(kind==='region')dr.source.regionId='imaginary_region';
  if(kind==='member')dr.memberConsentHash='f'.repeat(64);
  if(kind==='worldSite')dw.livedPlaces.places[siteId].foundingHash='f'.repeat(64);
  if(kind==='consent')dr.source.agreed=false;
  A.equal(G.validate(dg,dw),false,kind+' must invalidate the originally recorded response');
  A.equal(G.lookup(dw,groupId),null);
 }
 World.advance(real,5);
 const ended=act(real,'groupResponsibilitiesStatus',{groupId});
 A.equal(ended.responsibilities[0].status==='term-ended'||
  ended.responsibilities[0].status==='ended-after-independent-departure',true);
 A.equal(ended.responsibilities[0].noCompulsoryCooperation,true);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
// Existing canonical Atlas places retain original role eligibility.
const canon=E.newGame({name:'Ordinary Original Founder',seed:842116});
A.equal(Places.verifiedSiteRegion(canon.world.location,null),
 Places.location(canon).regionId);
console.log('Original independent group roles at GM/canonical places: genuine presence, prior consent, own RNG, distinct acceptance and refusal, bounded term, no wages/facilities/work/powers, source tampering rejected, exact turn replay and read-only status.');
