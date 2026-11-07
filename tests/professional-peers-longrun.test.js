'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),Crypto=require('node:crypto'),
 E=require('../engine.js'),W=require('../rules/world'),
 Realm=require('../world/simulation'),Peer=require('../world/professional-peers'),
 Turn=require('../scripts/chat-turn.js');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const newPerson=seed=>E.newGame({seed,name:'World Relationships Long Run Test',path:'undecided'});
{
 const a=newPerson(705101),b=newPerson(705101);
 W.advance(a,1460);W.advance(b,1460);
 A.deepEqual(a.table.realm,b.table.realm);
 const t=a.table.realm.professionalPeers;
 A.ok(t);A.equal(Object.keys(t.pairs).length,24);
 A.ok(t.counter>0,'Real later NPC achievement should create possible peer reactions');
 A.ok(t.records.some(x=>['work-invitation','independent-review-started','no-engagement'].includes(x.kind)),
  'Published work must generate independent peer choices');
 for(const pair of Object.values(t.pairs)){
  A.ok(pair.trust>=0&&pair.trust<=5);
  A.ok(pair.contrast>=0&&pair.contrast<=5);
  A.equal(pair.people.length,2);
  if(pair.pending)A.ok(['awaiting_reply','checking'].includes(pair.pending.stage));
 }
 for(const r of t.records){
  const body={id:r.id,day:r.day,polity:r.polity,
   firstId:r.firstId,firstName:r.firstName,secondId:r.secondId,
   secondName:r.secondName,kind:r.kind,source:r.source,details:r.details};
  A.equal(r.hash,sha(body));
  A.equal(r.source,Peer.SOURCE);
  if(r.notice)A.equal(r.releaseDay,r.day+8);
 }
 A.equal(a.player.family,null);
 A.equal(a.player.arcane.circles,0);
 A.equal(a.table.meridianTechniques,undefined);
 const old=E.exportGame(a),random=a.rngState;
 A.equal(Realm.publicPeers(a).verifiedPeerWork.every(x=>
  x.people.length===2&&!!x.notice),true);
 A.equal(E.exportGame(a),old);
 A.equal(a.rngState,random);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-peer-networks-'));
 try{
  const file=Path.join(dir,'person.json'),s=newPerson(705102);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const read={id:'real_peer_network_0001',mode:'rule',
   system:'world',operation:'peersStatus',params:{}};
  const r=Turn.execute(file,read);
  A.equal(r.applied,false);
  A.deepEqual(r.output.rules.verifiedPeerWork,[]);
  A.equal(FS.readFileSync(file,'utf8'),before);
  A.throws(()=>Turn.execute(file,{id:'forged_peer_intimacy_0001',
   mode:'rule',system:'world',operation:'peersStatus',
   params:{giveMeRoyalMarriage:true}}),/accepts no hidden personal intentions/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  A.equal(Turn.execute(file,read).applied,false);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Long-term real NPC collaborations and alternatives develop independently; read-only peer reports never alter saved campaigns or reveal personal secrets');
