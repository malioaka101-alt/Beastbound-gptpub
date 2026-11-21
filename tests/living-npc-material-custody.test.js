'use strict';
// Disposable native actors: no chosen acceptance, no seeded NPC inventory.
const A=require('node:assert/strict'),E=require('../engine'),R=require('../rules'),
 Core=require('../rules/core'),Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Atlas=require('../world/atlas'),Custody=require('../rules/independent-material-custody'),
 Foundation=require('../world/person-mechanical-foundations'),
 Law=require('../rules/body-shared-original-living-physique'),PC=require('../rules/body-living-physiques'),
 Crypto=require('node:crypto');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
A.deepEqual(Law.sustainSpec(16,1,3),{dc:18,cost:2,modifier:4});
A.equal(Law.sustainedUntil(100,60,120,true),280);
A.equal(Law.sustainedUntil(100,60,120,false),null);
let accepted=0,declined=0;
for(let n=0;n<32;n++){
 const s=E.newGame({name:'Disposable independent material transfer',seed:965250+n*31}),
  w=Realm.ensure(s),roster=People.ensure(w),
  region=Atlas.regions.find(x=>People.siteFor(x.id));
 Object.assign(w.ecosystems[region.id],{quality:75,pressure:14,water:80,forage:80});
 Object.assign(w.countries[region.polity],{prosperity:75,stability:80});
 const d=People.sourceDemand(w,region);A.ok(d);
 const p=People._debug.make(w,roster,0,d);p.shift=People.shift(p,0,w);
 s.world.location=People.siteFor(p.regionId);s.world.minutes=600;s.chatRuntime||={};
 const personalWitness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+s.world.location+', directly witnessed and conscious.';
 s.chatRuntime.scene=personalWitness;
 R.act(s,{system:'health',operation:'linkWitnessedHuman',params:{npcId:p.actorId,witness:personalWitness}});
 s.chatRuntime.scene=p.name+' considers one actual clean ration offered by the player, without any obligation.';
 A.deepEqual(Custody.held(s,p),{});
 A.equal(Custody.canConsume(s,p,{clean_rations:1}),false);
 Core.event(s,'story',s.chatRuntime.scene,{origin:Custody.OFFER,actorId:p.actorId,location:s.world.location,items:{clean_rations:1}});
 const params={actorId:p.actorId,witnessIndex:s.log.length-1},before=E.exportGame(s),rng=s.rngState,
  playerBefore=s.player.inventory.clean_rations,personalRng=p.rngState;
 A.throws(()=>R.act(s,{system:'material',operation:'offerToPerson',params:{...params,accepted:true}}),/witnessed real material offer/);
 A.equal(E.exportGame(s),before);
 const out=R.act(s,{system:'material',operation:'offerToPerson',params}),
  q=p.originalMaterialCustody.rows[0].source;
 A.equal(q.rngBefore,personalRng);A.equal(s.rngState,rng);
 A.equal(q.accepted,out.accepted);A.equal(Custody.verify(s,p),true);
 A.equal(s.player.inventory.clean_rations,playerBefore-(out.accepted?1:0));
 A.deepEqual(Custody.held(s,p),out.accepted?{clean_rations:1}:{});
 A.equal(out.noObligationOrConsentToOtherAct,true);
 if(out.accepted)accepted++;else declined++;
 const view=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
 A.deepEqual(view.originalOwnedMaterials,Custody.held(s,p));
 const saved=E.exportGame(s),copy=E.importGame(saved),cp=Realm.peek(copy).emergentPeople.people[p.id];
 A.equal(Custody.verify(copy,cp),true);
 const row=cp.originalMaterialCustody.rows[0];
 row.source.after={clean_rations:21};row.seal=hash(row.source);
 A.equal(Custody.verify(copy,cp),false,'Resealed fabricated stock fails conservation');
 A.throws(()=>R.act(s,{system:'material',operation:'offerToPerson',params}),/fresh witnessed|already answered/);
 A.equal(E.exportGame(s),saved);
 // Neither a successful gift nor a named profession grants an earned Body VII.
 A.throws(()=>R.act(s,{system:'body',operation:'npcLivingPhysiqueWork',params}),/original Organ III|witness/);
 A.equal(E.exportGame(s),saved);
 if(accepted&&declined)break;
}
A.ok(accepted&&declined);
console.log('INDEPENDENT MATERIAL CUSTODY PASS '+JSON.stringify({accepted,declined,actualConservation:true,noGeneratedStock:true}));
