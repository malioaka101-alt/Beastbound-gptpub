'use strict';
// #18 one REAL interrupted route, two genuine independent public
// administrations decide whether to explore contact. Not a meeting,
// envoy, signature, legal treaty, money or reopened route.
const A=require('node:assert/strict'),E=require('../engine.js'),
 W=require('../rules/world'),Rules=require('../rules'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 Gov=require('../world/government-offices'),Crypto=require('node:crypto'),
 FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),
 Turn=require('../scripts/chat-turn.js');
const seal=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const action=(s,pairKey,extra={})=>Rules.act(s,{
 system:'world',operation:'bilateralContactHistory',
 params:{pairKey,...extra}});
function scenario(wantMutual){
 for(let seed=998300;seed<998440;seed++){
  const s=E.newGame({seed,name:'Disposable Two-Government Contact',path:'undecided'}),
   w=Realm.ensure(s),clock=structuredClone(s),coins=s.player.coins;
  // Pressure fixture ONLY, not an invented route outcome: the real
  // original weather & trade draws still independently close/reopen.
  for(const route of Atlas.tradeRoutes)
   if(route.a==='reedmarch'||route.b==='reedmarch')
    w.routes[route.id].risk=100;
  W.advance(s,30);E.advance(clock,30*1440);
  A.equal(s.rngState,clock.rngState);
  A.equal(s.player.coins,coins);
  const found=Object.entries(w.diplomacy).flatMap(([key,d])=>
   (d.contactAttempts||[]).filter(row=>
    (d.a==='reedmarch'||d.b==='reedmarch')&&
    row.bothWilling===wantMutual).map(row=>({key,d,row})));
  if(found.length)return {s,w,clock,coins,...found[0]};
 }
 throw Error('No real original independent bilateral '+(wantMutual?'mutual':'declined')+' contact decision found in disposable tested original seeds');
}
{
 const {s,w,clock,coins,key,d,row}=scenario(true),q=row.source;
 A.equal(q.origin,Realm.BILATERAL_CONTACT);
 A.equal(q.bothWilling,true);
 A.equal(q.willingA,true);
 A.equal(q.willingB,true);
 A.ok(q.choiceA<q.chanceA);
 A.ok(q.choiceB<q.chanceB);
 A.equal(q.officeA.incumbent,w.governance[d.a].holder);
 A.equal(q.officeB.incumbent,w.governance[d.b].holder);
 A.equal(q.officeA.noRepresentativeConsentAsserted,true);
 A.equal(q.officeB.noRepresentativeConsentAsserted,true);
 A.equal(q.noTreatyOrRepresentation,true);
 A.equal(q.noTradeOrWorldRandomChanged,true);
 A.equal(q.noLegalPermissionOrFiscalTransfer,true);
 A.equal(row.sourceHash,seal(q));
 A.equal(Realm.verifyBilateralContacts(w,key),true);
 const route=Atlas.tradeRoutes.find(r=>r.id===q.routeId);
 A.ok(route);A.equal(w.routes[route.id].disrupted,true);
 const changed=w.routes[route.id].originalChanges.find(x=>x.id===q.routeChangeId);
 A.equal(changed.sourceHash,q.originalRouteSourceHash);
 A.equal(changed.disrupted,true);
 A.equal(q.originalRouteDay,changed.day);
 A.equal(q.originalPublicBulletin.releaseDay,q.day+14);
 A.ok(!/signed|concluded|appointed envoy|has met|binding pact/i.test(q.originalPublicBulletin.text));
 A.equal(action(s,key).publiclyAnnouncedMutualContact.length,0,
  'A private mutual approach is NOT public before its actual foreign courier release');
 const before=E.exportGame(s),rand=s.rngState;
 A.throws(()=>action(s,key,{forceTreaty:true}),/Only a genuine local diplomatic pair/);
 A.throws(()=>action(s,'imagined-external-kingdom'),/foreign hidden government/);
 A.equal(E.exportGame(s),before);
 A.equal(s.rngState,rand);
 W.advance(s,14);E.advance(clock,14*1440);
 A.equal(s.rngState,clock.rngState);
 const view=action(s,key),published=view.publiclyAnnouncedMutualContact;
 A.equal(published.length,1);
 A.equal(published[0].notice,q.originalPublicBulletin.text);
 A.equal(published[0].sourceHash,row.sourceHash);
 A.equal(published[0].noSignedTreaty,true);
 A.equal(published[0].noEnvoyOrActualMeetingInferred,true);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-bilateral-test-'));
 try{
  const file=Path.join(dir,'state.json'),serialized=E.exportGame(s)+'\n';
  FS.writeFileSync(file,serialized);
  const resp=Turn.execute(file,{id:'bilateral_public_read_0001',
   mode:'rule',system:'world',operation:'bilateralContactHistory',
   params:{pairKey:key}});
  A.equal(resp.applied,false);
  A.equal(resp.output.rules.publiclyAnnouncedMutualContact.length,1);
  A.equal(FS.readFileSync(file,'utf8'),serialized);
  A.throws(()=>Turn.execute(file,{id:'bilateral_forge_treaty_0001',
   mode:'rule',system:'world',operation:'bilateralContactHistory',
   params:{pairKey:key,signNow:true}}),
  /Only a genuine local diplomatic pair/);
  A.equal(FS.readFileSync(file,'utf8'),serialized);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
 const snapshot=E.exportGame(s),copy=E.importGame(snapshot);
 A.equal(E.exportGame(copy),snapshot);
 A.equal(Realm.verifyBilateralContacts(copy.table.realm,key),true);
 A.deepEqual(action(copy,key),view);
 // Rewriting even a recomputed copy hash cannot change a genuine
 // original sovereign officeholder's historical identity.
 const hash=row.sourceHash,realIncumbent=q.officeA.incumbent;
 q.officeA.incumbent='Fabricated treaty minister or war author';
 row.sourceHash=seal(q);
 A.equal(Realm.verifyBilateralContacts(w,key),false);
 q.officeA.incumbent=realIncumbent;row.sourceHash=hash;
 A.equal(Realm.verifyBilateralContacts(w,key),true);
 const oldChoiceB=q.choiceB;
 q.choiceB=.999999;row.sourceHash=seal(q);
 A.equal(Realm.verifyBilateralContacts(w,key),false);
 q.choiceB=oldChoiceB;row.sourceHash=hash;
 A.equal(Realm.verifyBilateralContacts(w,key),true);
 const beforeCount=d.contactAttempts.length;
 W.advance(s,16);E.advance(clock,16*1440);
 A.equal(s.rngState,clock.rngState);
 A.equal(d.contactAttempts.filter(x=>x.source.routeChangeId===q.routeChangeId).length,1,
  'An original changed trade corridor never authorizes a repeated independent choice on the same disruption');
 A.ok(d.contactAttempts.length>=beforeCount);
 A.equal(s.player.coins,coins);
 A.equal(Realm.verifyBilateralContacts(w,key),true);
}
{
 const {s,w,clock,coins,key,d,row}=scenario(false);
 const q=row.source;
 A.equal(q.bothWilling,false);
 A.equal(q.willingA&&q.willingB,false);
 A.equal(q.originalPublicBulletin,null);
 A.equal(Realm.verifyBilateralContacts(w,key),true);
 A.equal(action(s,key).publiclyAnnouncedMutualContact.length,0);
 const before=w.chronicle.filter(x=>
  x.subject===key&&/willingness to explore practical contact/i.test(x.text)).length;
 A.equal(before,0,
  'The world must not publicly reveal hidden separate governmental refusals');
 W.advance(s,14);E.advance(clock,14*1440);
 A.equal(action(s,key).publiclyAnnouncedMutualContact.length,0);
 A.equal(s.rngState,clock.rngState);
 A.equal(s.player.coins,coins);
 A.equal(Realm.verifyBilateralContacts(w,key),true);
 const snap=E.exportGame(s),restored=E.importGame(snap);
 A.equal(E.exportGame(restored),snap);
 A.equal(Realm.verifyBilateralContacts(restored.table.realm,key),true);
 // The absence of recorded future contacts in older games is not
 // permission to fabricate a positive agreement or previous refusal.
 const older=E.importGame(snap),p=older.table.realm.diplomacy[key];
 delete p.contactAttempts;delete p.contactRngState;
 A.equal(Realm.verifyBilateralContacts(older.table.realm,key),true);
 A.equal(action(older,key).publiclyAnnouncedMutualContact.length,0);
}
// The public history has a genuine local jurisdiction boundary.
{
 const {s,key}=scenario(true),actual=s.world.location;
 s.world.location='unverified_remote_jurisdiction';
 const fixture=JSON.stringify(s);
 A.throws(()=>action(s,key),/foreign hidden government/);
 A.equal(JSON.stringify(s),fixture);
 s.world.location=actual;
}
console.log('Actual independent bilateral world diplomacy: one original disrupted trade corridor, separately chosen governmental willingness/refusal with source replay and historic offices, genuine delayed public notices, no automatic treaty/meeting/reopening, no reused proposal or player-world RNG, persistent private outcomes and verified readonly boundary');
