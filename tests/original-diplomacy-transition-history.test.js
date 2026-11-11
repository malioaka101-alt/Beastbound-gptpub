'use strict';
// #18 retain only *genuine* original world-month political transitions.
// No extra diplomatic RNG, fictional signed ministers, forced alliances,
// free trade routes, new public ranks or fabricated older wars.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 W=require('../rules/world');
const s=E.newGame({seed:997802,name:'Original Interpolity Record Test',path:'undecided'}),
 w=Realm.ensure(s);
const found=Object.entries(w.diplomacy).find(([key,d])=>
 (Atlas.P[d.a].rival===d.b||Atlas.P[d.b].rival===d.a)&&
 d.status==='strained'&&d.cooldown===0);
A.ok(found,'A genuine atlas-authored rivalry must actually exist');
const [key,d]=found;
A.equal(Realm.verifyDiplomaticAudit(d,key),true);
const initial=Realm.diplomaticTransitionHistory(w,key);
A.equal(initial.transitions.length,0);
A.equal(initial.anchor.status,'strained');
A.equal(initial.anchor.a,d.a);
A.equal(initial.anchor.b,d.b);
const originalPlayer=s.rngState,originalCoins=s.player.coins;
const startWars=w.counters.wars,startPeace=w.counters.peaceTreaties;
d.tension=100; // Disposable pressure fixture, never a GM-forced diplomatic vote.
W.advance(s,30); // Original actual independent world months and actual government/economy.
A.equal(d.status,'war','Original independent rival state must enter a real armed conflict');
A.equal(w.counters.wars,startWars+1);
A.equal(Realm.verifyDiplomaticAudit(d,key),true);
let view=Realm.diplomaticTransitionHistory(w,key);
A.equal(view.transitions.length,1);
A.equal(view.transitions[0].from,'strained');
A.equal(view.transitions[0].to,'war');
const entry=d.diplomaticAudit.transitions[0];
A.equal(entry.source.origin,Realm.DIPLOMATIC_SOURCE);
A.ok(entry.source.rivals);
A.equal(entry.source.warfare,false);
A.ok(Number.isInteger(entry.source.noise));
A.equal(d.diplomaticAudit.anchor.status,'strained');
A.equal(s.rngState,originalPlayer,
 'The original sovereign world month must not consume player combat dice');
A.equal(s.player.coins,originalCoins,
 'Foreign politics must not mint or confiscate unrelated player money');
const beforeTruce=w.counters.peaceTreaties;
d.tension=0; // Disposable exhaustion fixture, original monthly logic still adjudicates.
W.advance(s,30);
A.equal(d.status,'truce');
A.equal(d.cooldown,48);
A.equal(w.counters.peaceTreaties,beforeTruce+1);
A.equal(Realm.verifyDiplomaticAudit(d,key),true);
view=Realm.diplomaticTransitionHistory(w,key);
A.equal(view.transitions.length,2);
A.equal(view.transitions[1].from,'war');
A.equal(view.transitions[1].to,'truce');
A.equal(view.transitions[1].noInventedSignedTreaty,true);
A.equal(view.transitions[1].noNamedMinisterConsentInferred,true);
A.equal(view.transitions[1].sourceHash,
 d.diplomaticAudit.transitions[1].hash);
const snapshot=E.exportGame(s),copy=E.importGame(snapshot),
 copied=copy.table.realm.diplomacy[key];
A.equal(Realm.verifyDiplomaticAudit(copied,key),true);
A.deepEqual(Realm.diplomaticTransitionHistory(copy.table.realm,key),view);
A.equal(E.exportGame(copy),snapshot);
const changed=d.diplomaticAudit.transitions[1],oldHash=changed.hash;
changed.source.noise=99;
A.equal(Realm.verifyDiplomaticAudit(d,key),false,
 'The original independent world noise cannot be overwritten by a diplomatic claim');
A.equal(changed.hash,oldHash);
changed.source.noise=copied.diplomaticAudit.transitions[1].source.noise;
A.equal(Realm.verifyDiplomaticAudit(d,key),true);
// Legacy game history did not record exact previous diplomatic exchanges.
const older=E.importGame(snapshot),oldPair=older.table.realm.diplomacy[key],
 known=oldPair.status;
delete oldPair.diplomaticAudit;
const afterImport=Realm.diplomaticTransitionHistory(older.table.realm,key);
A.equal(afterImport.anchor.status,known);
A.equal(afterImport.transitions.length,0);
A.ok(afterImport.anchor.note.includes('prior individual decisions are not evidenced'));
A.equal(Realm.verifyDiplomaticAudit(oldPair,key),true);
A.ok(w.counters.wars>=startWars+1);
A.ok(w.counters.peaceTreaties>=startPeace+1);
console.log('Original diplomatic transition archive: independent existing world-month conflict/ceasefire, original source random-state proof, unchanged player economy, no invented diplomatic assent, enduring save history, safe earlier-save audit anchor');
