'use strict';
// #18: original publicly released foreign courier notices retain their
// authentic evidence after ordinary world news rotates. No second courier,
// extra diplomatic roll, new signed treaty or early private state leak.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 Crypto=require('node:crypto'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 W=require('../rules/world'),R=require('../rules'),
 Turn=require('../scripts/chat-turn.js');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const s=E.newGame({seed:997936,name:'Disposable Verified Foreign Courier History',path:'undecided'}),
 w=Realm.ensure(s),pair=Object.entries(w.diplomacy).find(([key,d])=>
 (Atlas.P[d.a].rival===d.b||Atlas.P[d.b].rival===d.a)&&
 d.status==='strained'&&d.cooldown===0);
A.ok(pair,'Original existing independent rivals must actually exist');
const [key,d]=pair,startingCoins=s.player.coins,
 startingClock=structuredClone(s);
A.deepEqual(R.act(s,{system:'world',operation:'foreignCourierHistory',params:{limit:8}}).knownOriginalReports,[]);
A.throws(()=>R.act(s,{system:'world',operation:'foreignCourierHistory',params:{showSecretTension:true}}),
 /Only the original public courier history limit/);
d.tension=100; // Disposable pressure fixture, not forced by the player.
W.advance(s,30);
E.advance(startingClock,30*1440);
A.equal(d.status,'war');
A.equal(s.rngState,startingClock.rngState);
A.equal(s.player.coins,startingCoins);
A.equal(Realm.verifyDiplomaticAudit(d,key),true);
A.equal(Realm.verifyDiplomaticOfficeContexts(w,key),true);
const event=d.diplomaticAudit.transitions[0],published=event.publicCourier;
A.ok(published,'A genuine originally emitted foreign notice must be source-copied');
A.equal(published.source.origin,Realm.ORIGINAL_FOREIGN_COURIER);
A.equal(published.source.originalTransitionHash,event.hash);
A.equal(published.source.originalNoticeHash,hash(published.source.originalNotice));
A.equal(published.source.originalNotice.releaseDay,event.day+14);
A.equal(published.source.originalNotice.channel,'foreign courier');
A.equal(published.source.noNewWorldEventOrRandomDraw,true);
A.equal(published.source.noTreatyOrEnvoyConsent,true);
A.equal(Realm.verifyOriginalForeignCourier(event,key),true);
const original=structuredClone(published.source.originalNotice);
const looked=R.act(s,{system:'world',operation:'foreignCourierHistory',params:{limit:20}});
A.equal(looked.knownOriginalReports.some(x=>x.originalPublicationHash===published.source.originalNoticeHash),false,
 'Undelivered foreign news is never player-known merely because two real offices were involved');
A.equal(Realm.publicNews(s,{channel:'courier',limit:20}).items.some(x=>x.text===original.text),false);
W.advance(s,14);
A.equal(s.player.coins,startingCoins);
const known=R.act(s,{system:'world',operation:'foreignCourierHistory',params:{limit:20}});
const entry=known.knownOriginalReports.find(x=>x.originalPublicationHash===published.source.originalNoticeHash);
A.ok(entry,'Only the original actual 14-day public courier release may become known');
A.equal(entry.day,event.day);
A.equal(entry.releaseDay,event.day+14);
A.equal(entry.text,original.text);
A.equal(entry.noSignedTreatyOrEnvoyInferred,true);
A.equal(Realm.publicNews(s,{channel:'courier',limit:20}).items.some(x=>x.text===original.text),true);
A.equal('afterTension' in entry,false);
A.equal('incumbent' in entry,false);
A.equal('treasury' in entry,false);
// The ordinary 200-entry public news journal can rotate. Its eviction is
// not a retroactive erasure of the actually published original report.
const oldLength=w.chronicle.length;
w.chronicle=w.chronicle.filter(x=>!(
 x.subject===key&&x.day===event.day&&x.text===original.text&&
 x.channel==='foreign courier'));
A.ok(w.chronicle.length<oldLength);
A.equal(Realm.publicNews(s,{channel:'courier',limit:20}).items.some(x=>x.text===original.text),false);
A.equal(R.act(s,{system:'world',operation:'foreignCourierHistory',params:{limit:20}})
 .knownOriginalReports.some(x=>x.originalPublicationHash===published.source.originalNoticeHash),true);
A.equal(Realm.verifyDiplomaticAudit(d,key),true);
const saved=E.exportGame(s),clone=E.importGame(saved);
A.equal(E.exportGame(clone),saved);
A.deepEqual(R.act(clone,{system:'world',operation:'foreignCourierHistory',params:{limit:20}}),
 R.act(s,{system:'world',operation:'foreignCourierHistory',params:{limit:20}}));
const unchanged=E.exportGame(s),rng=s.rngState;
R.act(s,{system:'world',operation:'foreignCourierHistory',params:{limit:10}});
A.equal(E.exportGame(s),unchanged);
A.equal(s.rngState,rng);
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-foreign-original-courier-'));
try{
 const file=Path.join(dir,'save.json'),before=saved+'\n';
 FS.writeFileSync(file,before);
 const read=Turn.execute(file,{id:'original_foreign_courier_001',
  mode:'rule',system:'world',operation:'foreignCourierHistory',
  params:{limit:8}});
 A.equal(read.applied,false);
 A.equal(read.output.rules.channel,'foreign courier');
 A.ok(read.output.rules.knownOriginalReports.some(x=>
  x.originalPublicationHash===published.source.originalNoticeHash));
 A.equal(FS.readFileSync(file,'utf8'),before);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
// Recomputing an outer receipt hash cannot forge the EXACT historical
// original published news text or turn a changed relation into a treaty.
const beforeAlter=structuredClone(event.publicCourier);
event.publicCourier.source.originalNotice.text='A fabricated signed sovereign treaty and appointed envoy.';
event.publicCourier.source.originalNoticeHash=hash(event.publicCourier.source.originalNotice);
event.publicCourier.hash=hash(event.publicCourier.source);
A.equal(Realm.verifyOriginalForeignCourier(event,key),false);
A.equal(Realm.verifyDiplomaticAudit(d,key),false);
A.throws(()=>R.act(s,{system:'world',operation:'foreignCourierHistory',params:{}}),
 /unverified interstate|historical civic office/);
event.publicCourier=beforeAlter;
A.equal(Realm.verifyDiplomaticAudit(d,key),true);
// Old real saves did not copy their historic courier publication into
// durable source evidence. They retain their known transition, but no
// retroactively invented public notices are introduced by this feature.
const older=E.importGame(saved),prior=older.table.realm.diplomacy[key];
delete prior.diplomaticAudit.transitions[0].publicCourier;
A.equal(Realm.verifyDiplomaticAudit(prior,key),true);
A.equal(R.act(older,{system:'world',operation:'foreignCourierHistory',params:{limit:20}})
 .knownOriginalReports.some(x=>x.originalPublicationHash===published.source.originalNoticeHash),false);
console.log('Original foreign courier history: independent status and original notice source, genuine fourteen-day release, durable news beyond short journal, no extra roll/treaty/hidden offices, read-only game turns and save parity, forged notice rejection and honest old-save unknowns');
