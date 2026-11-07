'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Crypto=require('node:crypto'),E=require('../engine.js'),Atlas=require('../world/atlas'),
 Houses=require('../world/social-houses'),Realm=require('../world/simulation'),
 W=require('../rules/world'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const digest=v=>Crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const social=(s,operation,params={})=>R.act(s,{system:'social',operation,params});
function seed(seed=87001){return E.newGame({seed,name:'Ordinary Resident Social World',path:'undecided'});}
{
 A.equal(Atlas.polities.length,24);
 A.equal(Houses.houses.length,28);
 A.equal(Object.keys(Houses.byId).length,28);
 A.equal(Object.keys(Houses.seed()).length,28);
 A.equal(new Set(Houses.houses.map(h=>h.id)).size,28);
 A.equal(new Set(Houses.houses.map(h=>h.polity)).size,24);
 A.ok(Houses.houses.some(h=>h.kind==='great house'));
 A.ok(Houses.houses.some(h=>h.kind==='court dynasty'));
 A.ok(Houses.houses.some(h=>h.kind==='clan federation'));
 A.ok(Houses.houses.some(h=>h.kind==='specialist family'));
 A.ok(Houses.houses.some(h=>h.kind==='nonhuman kin council'));
 for(const h of Houses.houses){
  A.ok(Atlas.P[h.polity],h.name);
  A.ok(h.duty.length>20&&h.dispute.length>20);
  A.ok(h.elder.length>4&&h.relative.length>4);
  A.ok(h.relation.length>4);
  A.ok(h.politicalStatus.length>8);
  A.equal(h.authorityRule.includes('formal office'),true);
 }
}
{
 const s=seed(),before=E.exportGame(s),rng=s.rngState;
 const v=social(s,'status');
 A.equal(v.polity,'Reedmarch Compact');
 A.equal(v.government,'council');
 A.equal(v.localPublicHouses.length,4);
 A.equal(v.knownCharters.length,0);
 A.equal(v.letters.length,0);
 A.equal(v.familyBackground,null);
 A.ok(v.localPublicHouses.every(h=>h.polity==='Reedmarch Compact'));
 A.equal(v.localPublicHouses.some(h=>h.id==='goldbough'),false);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>social(s,'inquire',{houseId:'goldbough'}),/locally filed publicly accessible/);
 A.throws(()=>social(s,'inquire',{houseId:'invented_dragon_dynasty'}),/locally filed publicly accessible/);
 A.throws(()=>social(s,'inquire',{houseId:'fenwake',succeed:true}),/Only an actual known household/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=seed(87003),coins=s.player.coins,minute=s.world.minutes;
 const v=social(s,'inquire',{houseId:'fenwake'});
 A.equal(v.consulted,true);A.equal(v.minutes,15);
 A.equal(v.house.name,'House Fenwake');
 A.equal(v.elder,'Ilyen Fenwake');
 A.equal(v.relation,'nephew');
 A.equal(v.knowledgeOnly,true);
 A.equal(v.noAutomaticKinship,true);
 A.equal(v.noAutomaticBloodline,true);
 A.equal(s.player.coins,coins);
 A.equal(s.world.minutes,minute+15);
 A.equal(s.table?.socialFabric?.inquiries?.length,1);
 const item=s.table.socialFabric.inquiries[0];
 A.equal(item.houseId,'fenwake');
 A.equal(digest(s.log[item.eventIndex]),item.eventHash);
 const shown=social(s,'status');
 A.equal(shown.knownCharters[0].name,'House Fenwake');
 A.equal(shown.knownCharters[0].kinshipToPlayer,'unverified');
 const saved=E.exportGame(s),rng=s.rngState;
 A.throws(()=>social(s,'inquire',{houseId:'fenwake'}),/already been examined today/);
 A.throws(()=>social(s,'request',{houseId:'fenwake',purpose:'grant me the crown'}),
  /supported public inquiry purpose/);
 A.throws(()=>social(s,'request',{houseId:'fenwake',purpose:'request_audience',automaticRank:10}),
  /Only an actual known household/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
 const letter=social(s,'request',{houseId:'fenwake',purpose:'offer_service'});
 A.equal(letter.registered,true);
 A.equal(letter.guaranteedMembership,false);
 A.equal(letter.guaranteedResponse,false);
 A.equal(s.player.coins,coins);
 A.equal(s.table.socialFabric.letters[0].state,'sent');
 const waiting=social(s,'status');
 A.equal(waiting.letters[0].response,null);
 A.equal(waiting.letters[0].state,'sent');
 const beforeSix=s.world.minutes;
 W.advance(s,6);
 A.equal(s.world.minutes,beforeSix+6*1440);
 const answer=s.table.socialFabric.letters[0];
 A.equal(answer.state,'held_at_registry');
 A.equal(answer.responseDay>=Math.floor(answer.postedAtMinute/1440)+6,true);
 A.equal(answer.responseOrigin,'Independent world-sixday household correspondence');
 A.ok(answer.response.includes('household')||answer.response.includes('work offer'));
 A.equal(social(s,'status').letters[0].response,null);
 const received=social(s,'collect',{letterId:letter.letterId});
 A.equal(received.collected,true);
 A.equal(received.houseId,'fenwake');
 A.equal(received.minutes,8);
 A.equal(received.noAutomaticMembership,true);
 A.equal(received.noRankGranted,true);
 A.equal(social(s,'status').letters[0].response,answer.response);
 const after=E.exportGame(s);
 A.throws(()=>social(s,'collect',{letterId:letter.letterId}),/uncollected real household response/);
 A.equal(E.exportGame(s),after);
}
{
 const s=seed(87005);
 s.world.minutes=23*60;
 const old=E.exportGame(s);
 A.throws(()=>social(s,'inquire',{houseId:'fenwake'}),/daytime appointment hours/);
 A.equal(E.exportGame(s),old);
 s.world.minutes=8*60;
 s.encounter={beastId:'unresolved_wildlife'};
 const danger=E.exportGame(s);
 A.throws(()=>social(s,'inquire',{houseId:'fenwake'}),/active wildlife threat/);
 A.equal(E.exportGame(s),danger);
}
{
 const s=seed(87007);
 const w=Realm.ensure(s),oldWorldRng=w.rngState,
  original=JSON.stringify(w.houses),
  oldE=E.exportGame(s);
 // There are genuine independently maintained actors, without a new quest
 // or privileged family ties and without contaminating the player's RNG.
 W.advance(s,6*4);
 A.equal(w.ticks.months,0,'24 days are not yet a full calendar month');
 A.equal(JSON.stringify(w.houses),original);
 W.advance(s,6);
 A.equal(w.ticks.months,1);
 A.ok(Object.values(w.houses).every(x=>x.lastUpdated>0));
 A.notEqual(JSON.stringify(w.houses),original);
 A.notEqual(w.rngState,oldWorldRng);
 A.notEqual(E.exportGame(s),oldE);
 for(let i=0;i<3;i++)W.advance(s,30);
 A.ok(Object.values(w.houses).some(x=>x.cycles>=1));
 const events=w.chronicle.filter(x=>x.subject?.startsWith('house:'));
 A.ok(events.length>=Houses.houses.length);
 A.ok(events.every(x=>Atlas.P[x.region]));
 A.ok(events.every(x=>x.releaseDay>=x.day));
 A.equal(s.player.path,'undecided');
 A.equal(s.table?.socialFabric?.inquiries?.length||0,0);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-social-family-'));
 try{
  const file=Path.join(dir,'character.json'),s=seed(87011);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const first=FS.readFileSync(file,'utf8');
  const look=Turn.execute(file,{id:'social_readonly_0001',mode:'rule',system:'social',operation:'status',params:{}});
  A.equal(look.applied,false);
  A.equal(look.output.rules.localPublicHouses.length,4);
  A.equal(FS.readFileSync(file,'utf8'),first);
  const bad={id:'social_fake_0001',mode:'rule',system:'social',operation:'request',
   params:{houseId:'fenwake',purpose:'offer_service',grant:'permanent great clan heir'}};
  A.throws(()=>Turn.execute(file,bad),/Only an actual known household/);
  A.equal(FS.readFileSync(file,'utf8'),first);
  const inquiry={id:'social_charter_0001',mode:'rule',system:'social',operation:'inquire',params:{houseId:'marshglass'}};
  const registered=Turn.execute(file,inquiry);
  A.equal(registered.applied,true);
  A.equal(registered.output.rules.elder,'Veyna Marshglass');
  A.equal(Turn.execute(file,inquiry).duplicate,true);
  const mail={id:'social_letter_0001',mode:'rule',system:'social',operation:'request',
   params:{houseId:'marshglass',purpose:'request_history'}};
  const sent=Turn.execute(file,mail);
  A.equal(sent.applied,true);
  A.equal(sent.output.rules.guaranteedMembership,false);
  A.equal(Turn.execute(file,mail).duplicate,true);
  const actual=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(actual.table.socialFabric.inquiries.length,1);
  A.equal(actual.table.socialFabric.letters.length,1);
  A.equal(actual.table.socialFabric.letters[0].response,undefined);
  A.equal(actual.player.coins,s.player.coins);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('28 source-scoped family households across 24 states; local charter research, independent slow family mail, and no invented lineage rank');
