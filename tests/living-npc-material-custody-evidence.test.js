'use strict';
// Stage 2B.2: original custody, actual consent and current material holdings.
// This entirely disposable fixture never reads or writes a campaign save.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 Atlas=require('../world/atlas'),People=require('../world/emergent-people'),
 H=require('../rules/material-handoffs'),
 Foundations=require('../world/person-mechanical-foundations');

function fixture(seed){
 const s=E.newGame({seed,name:'Disposable Material Witness',
  background:'fieldworker',path:'undecided'});
 const w=Realm.ensure(s),t=People.ensure(w),
  reg=Atlas.R.morrowfen_basin,polity=Atlas.P[reg.polity],
  eco=w.ecosystems[reg.id],host=w.countries[reg.polity];
 const d={kind:'livelihood-work',regionId:reg.id,
  polity:reg.polity,language:polity.language,good:'grain',
  localName:reg.name,evidence:{
   regionalGoods:reg.goods.slice(),regionBiome:reg.biome,
   ecological:{quality:eco.quality,pressure:eco.pressure,
    water:eco.water,forage:eco.forage},
   civic:{stability:host.stability,prosperity:host.prosperity}}};
 const person=People._debug.make(w,t,0,d);
 person.shift=People.shift(person,0);
 s.world.minutes=8*60;
 A.equal(People.verify(w,person),true);
 A.equal(People.presence(w,person.actorId,'crossing',0),true);
 return {s,w,person};
}
let accepted;
for(let seed=910321;seed<910361;seed++){
 const f=fixture(seed),id=f.person.actorId;
 const before=Foundations.earnedEvidence(f.w,id);
 A.equal(before.physicalMaterialCustody.known,false);
 A.equal(before.physicalMaterialCustody.verifiedCurrentMaterials,null,
  'No material account is UNKNOWN rather than an empty backpack');
 const change=Rules.act(f.s,{system:'social',operation:'materialHandoff',
  params:{npcId:id,item:'marsh_reed',quantity:2}});
 if(change.accepted){accepted={...f,change};break;}
}
A.ok(accepted,'The original individual choices include a real voluntary acceptance');
const {s,w,person,change}=accepted,id=person.actorId;
const account=w.materialCustody.accounts[id],held=account.held.marsh_reed;
A.equal(held,2);
A.equal(change.quantityMoved,2);
A.doesNotThrow(()=>H.validateAccount(account,id));
const original=E.exportGame(s),rng=s.rngState,minute=s.world.minutes;
const entry=H.privateHoldingEvidence(w,id);
A.equal(entry.known,true);
A.equal(entry.privateToGM,true);
A.deepEqual(entry.verifiedCurrentMaterials.map(x=>({item:x.item,quantity:x.quantity})),
 [{item:'marsh_reed',quantity:2}]);
A.equal(entry.verifiedCurrentMaterials[0].fullAcquisitionChain,true);
A.equal(entry.verifiedCurrentMaterials[0].sourceHash,account.history.at(-1).hash);
A.equal(entry.noEquipmentOrCombatInference,true);
A.equal(entry.earlierUnverifiedItemTypes,0);
const dossier=Foundations.gmDossier(w,id);
A.deepEqual(dossier.earnedEvidence.physicalMaterialCustody,entry);
A.equal(dossier.earnedEvidence.equipment.verifiedItems,null);
A.equal(dossier.earnedEvidence.originalPowerMilestones.meridian.stage,null);
A.equal(dossier.earnedEvidence.originalPowerMilestones.arcane.circles,null);
A.deepEqual(dossier.earnedEvidence.verifiedLearnedTechniques,[]);
const afterRead=E.exportGame(s);
A.equal(afterRead,original,'A private custody audit is pure');
A.equal(s.rngState,rng);
A.equal(s.world.minutes,minute);
const publicView=H.status(s,{});
A.equal(Object.hasOwn(publicView,'verifiedCurrentMaterials'),false);
A.equal(JSON.stringify(publicView).includes('fullAcquisitionChain'),false);
A.equal(JSON.stringify(publicView).includes('privateToGM'),false);
const replay=E.importGame(original);
A.deepEqual(Foundations.gmDossier(Realm.peek(replay),id).earnedEvidence.physicalMaterialCustody,
 entry,'Original verified personal custody survives save replay');
const forged=E.importGame(original),fw=Realm.peek(forged);
fw.materialCustody.accounts[id].held.marsh_reed=3;
A.throws(()=>Foundations.gmDossier(fw,id),
 /balance disagrees|contradicts original custody proof/,
 'A forged current stock count cannot be presented as an earned good');
const unknown=E.importGame(original),uw=Realm.peek(unknown);
uw.materialCustody.accounts[id].held.ironbloom=4;
const partial=Foundations.gmDossier(uw,id).earnedEvidence.physicalMaterialCustody;
A.equal(partial.earlierUnverifiedItemTypes,1,
 'Legacy unproven quantities are not silently made authenticated');
A.equal(partial.verifiedCurrentMaterials.some(x=>x.item==='ironbloom'),false);
A.deepEqual(partial.verifiedCurrentMaterials,entry.verifiedCurrentMaterials);
A.equal(E.exportGame(s),original,'No live save was altered by test clones');
console.log('Living NPC Stage 2B.2: source-owned materials, agency, private current stock, unknown legacy goods, replay and tamper PASS');
