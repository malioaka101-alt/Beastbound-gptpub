'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),Path=require('node:path');
const E=require('../engine'),Rules=require('../rules'),Realm=require('../world/simulation'),
  Places=require('../world/lived-places'),Settlements=require('../world/settlement-foundations'),
  Presence=require('../world/person-presence'),Turn=require('../scripts/chat-turn');
const PLACE={placeId:'appleshade_hamlet',name:'Appleshade Hamlet',regionId:'orchard_vales',
 kind:'orchard hamlet',sceneType:'settlement',
 description:'A small orchard hamlet with a public green, reading house, training yard, fenced beast-handling pens, water trough and cottage lane.',
 culture:'Asterwyn orchard families share rights of way, repair the public water channels and care for working beasts.'};
function make(seed=701910){
 const s=E.newGame({seed,name:'Settlement Fixture'});
 s.chatRuntime={revision:0,applied:{},focus:[]};
 return s;
}
function populate(seed=701910){
 const s=make(seed),playerRng=s.rngState,coins=s.player.coins;
 Rules.act(s,{system:'world',operation:'establishPlace',params:PLACE});
 A.equal(s.player.coins,coins);
 A.equal(s.rngState,playerRng,'Settlement founding cannot consume player dice');
 const r=Settlements.get(s,PLACE.placeId);
 A.ok(r&&Settlements.verify(Places.get(s,PLACE.placeId),r));
 return s;
}
{
 const one=populate(),two=populate();
 A.equal(E.exportGame(one),E.exportGame(two),'The foundation is reproducible for an identical world and original place');
 const r=Settlements.get(one,PLACE.placeId),whole=r.whole;
 A.ok(whole.households.length>=20);
 A.ok(whole.residents.length>=40);
 A.equal(whole.townPlan.dwellings.length,whole.households.length);
 A.ok(whole.townPlan.sites.length>=10);
 A.ok(whole.civic.polity.includes('Asterwyn'));
 A.equal(whole.environmentalContext.biome,'forest');
 A.ok(whole.residents.every(x=>x.actorId.startsWith('settlement:appleshade_hamlet:')));
 A.equal(new Set(whole.residents.map(x=>x.actorId)).size,whole.residents.length);
 for(const h of whole.households){
  A.ok(h.memberIds.length>=2);
  A.ok(h.memberIds.every(id=>whole.residents.some(p=>p.id===id&&p.householdId===h.id)));
 }
 const known=Rules.act(one,{system:'world',operation:'settlementStatus',params:{placeId:PLACE.placeId}});
 A.equal(known.founded,true);
 A.ok(!JSON.stringify(known).includes(whole.residents[0].name),
  'Private resident roster must not leak into the public status');
 A.ok(!JSON.stringify(known).includes('household_1'));
 A.equal(Rules.act(one,{system:'world',operation:'foundSettlement',params:{placeId:PLACE.placeId}}).alreadyFounded,true);
 const beforeView=E.exportGame(one);
 Rules.act(one,{system:'world',operation:'settlementStatus',params:{placeId:PLACE.placeId}});
 A.equal(E.exportGame(one),beforeView,'Viewing a town cannot mutate the game');
 A.equal(Presence.localStatus(one,Realm.peek(one)).people.some(x=>x.npcId.startsWith('settlement:')),false,
  'Residents are not teleported to a different current settlement');
 const arrived=Rules.act(one,{system:'world',operation:'travelTo',params:{
  destinationId:PLACE.placeId,minutes:19,
  journey:'An ordinary verified lane passes between the crossing and the newly authored hamlet.',
  means:'walking',uncontested:true}});
 A.ok(arrived.arrived);
 A.equal(Presence.localStatus(one,Realm.peek(one)).people.filter(x=>x.npcId.startsWith('settlement:')).length,0,
  'Village arrival is not proof of standing in every house or workshop');
 A.throws(()=>Rules.act(one,{system:'world',operation:'visitSettlementSite',params:{siteId:'handling_pens'}}),/not an accessible/);
 A.equal(Rules.act(one,{system:'world',operation:'visitSettlementSite',params:{siteId:'market_lane'}}).arrived,true);
 A.throws(()=>Rules.act(one,{system:'world',operation:'visitSettlementSite',params:{siteId:'storage'}}),/not an accessible/);
 A.throws(()=>Rules.act(one,{system:'world',operation:'visitSettlementSite',params:{siteId:'made_up_shed'}}),/not an accessible/);
 const current=E.exportGame(one);
 Rules.act(one,{system:'world',operation:'settlementStatus',params:{placeId:PLACE.placeId}});
 A.equal(E.exportGame(one),current);
 // Daytime observation only of co-present people in the specific saved site.
 Rules.act(one,{system:'world',operation:'wait',params:{minutes:49}});
 const walked=Rules.act(one,{system:'world',operation:'visitSettlementSite',params:{siteId:'reading_house'}});
 A.equal(walked.arrived,true);
 const people=Presence.localStatus(one,Realm.peek(one)).people.filter(x=>x.npcId.startsWith('settlement:'));
 A.ok(people.length>0,'Children and researchers have independently existing daytime routines');
 const beforeWords=one.player.coins;
 const spoken=Rules.act(one,{system:'social',operation:'speakSettlementResident',
  params:{npcId:people[0].npcId,question:'Have you seen Bram or Tessa today?'}});
 A.ok(typeof spoken.heard==='string'&&spoken.heard.length>5);
 A.equal(one.player.coins,beforeWords);
 A.ok(!/Bram is |Tessa is |I saw Bram|I saw Tessa/.test(spoken.heard));
 A.throws(()=>Rules.act(one,{system:'social',operation:'speakSettlementResident',
  params:{npcId:'settlement:appleshade_hamlet:resident_999_99',question:'Do you work here?'}}),/genuinely present/);
 const round=E.importGame(E.exportGame(one));
 A.deepEqual(Settlements.get(round,PLACE.placeId),Settlements.get(one,PLACE.placeId),
  'Settlement remains identical across checkpoint/reload');
 const earlier=round.world.minutes;
 E.advance(round,6*1440);
 Rules.world.finalizeTime(round,earlier);
 A.ok(Settlements.get(round,PLACE.placeId).live.history.length>=1,
  'The village has its own independent changes during a real world sixday');
 A.ok(Settlements.verify(Places.get(round,PLACE.placeId),Settlements.get(round,PLACE.placeId)));
 const beforeOffscreen=E.exportGame(round);
 const later=E.importGame(beforeOffscreen);
 A.deepEqual(Settlements.get(later,PLACE.placeId),Settlements.get(round,PLACE.placeId));
 const saved=E.exportGame(later);
 Rules.act(later,{system:'world',operation:'travelTo',params:{destinationId:'crossing',
  minutes:19,journey:'The known quiet orchard lane leads back to the original crossing.',
  means:'walking',uncontested:true}});
 A.equal(later.chatRuntime.settlementSite,undefined);
 const forged=E.importGame(saved);
 Settlements.get(forged,PLACE.placeId).whole.households[0].name='Changed without source';
 A.throws(()=>Settlements.get(forged,PLACE.placeId),/source-sealed/);
}
{
 const s=make(701911);
 Rules.act(s,{system:'world',operation:'establishPlace',params:{
  placeId:'shingle_house',name:'Shingle House',regionId:'orchard_vales',
  kind:'private dwelling',sceneType:'settlement',
  description:'One small private dwelling beside the orchard road.',culture:'Ordinary family residence.'}});
 A.equal(Settlements.peek(s)?.records?.shingle_house,undefined,
  'A single household is not a whole invented village');
 A.throws(()=>Rules.act(s,{system:'world',operation:'foundSettlement',
  params:{placeId:'shingle_house'}}),/has not been established as a whole/);
}
{
 const dir=require('node:os').tmpdir(),name=Path.join(dir,'bb-settlement-foundation-'+process.pid+'.json');
 try {
  const s=populate(701912),save=E.exportGame(s)+'\n';
  FS.writeFileSync(name,save,{flag:'wx'});
  const peek=Turn.execute(name,{id:'settlement_readonly_701912',mode:'rule',
   system:'world',operation:'settlementStatus',params:{placeId:PLACE.placeId}});
  A.equal(peek.applied,false);A.equal(FS.readFileSync(name,'utf8'),save);
  const clone=E.importGame(FS.readFileSync(name,'utf8'));
  A.equal(Settlements.get(clone,PLACE.placeId).whole.name,'Appleshade Hamlet');
 }finally{if(FS.existsSync(name))FS.unlinkSync(name);}
}
// Preserve the original Maddoc checkpoint, and establish its preexisting whole
// hamlet inside a disposable clone. No retroactive sighting, family change,
// work reward, date alteration or private NPC knowledge is permitted.
const canonical=Path.join(__dirname,'..','saves','bb_20261114_1dtmtp9.json');
if(FS.existsSync(canonical)){
 const original=FS.readFileSync(canonical,'utf8');
 const s=E.importGame(original),player=JSON.stringify(s.player),location=s.world.location,
   minutes=s.world.minutes,roll=s.rngState;
 const found=Rules.act(s,{system:'world',operation:'foundSettlement',
   params:{placeId:'mossgate_common'}});
 A.ok(found.founded||found.alreadyFounded);
 const moss=Settlements.get(s,'mossgate_common');
 A.equal(moss.whole.name,'Mossgate');
 A.ok(moss.whole.townPlan.sites.some(x=>x.id==='reading_house'));
 A.ok(moss.whole.townPlan.sites.some(x=>x.id==='handling_pens'&&x.access==='restricted'));
 A.equal(s.world.location,location);A.equal(s.world.minutes,minutes);
 A.equal(s.rngState,roll);A.equal(JSON.stringify(s.player),player);
 A.equal(FS.readFileSync(canonical,'utf8'),original);
}
console.log('Settlement foundation: whole physical plan, persistent residents, witnessed local access, independent schedules, sixday life, legacy sites and private knowledge PASS');
