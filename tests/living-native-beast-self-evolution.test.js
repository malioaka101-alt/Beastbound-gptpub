'use strict';
const A=require('node:assert/strict'),E=require('../engine'),R=require('../rules'),
 C=require('../rules/core'),W=require('../rules/world'),Atlas=require('../world/atlas'),
 M=require('../rules/independent-original-beast-maturity'),
 P=require('../rules/progress'),N=require('../rules/independent-original-native-evolution');
const counts={accepted:0,refused:0,formed:0,failed:0};
for(let seed=841001;seed<841061;seed++){
 const s=E.newGame({name:'Disposable native self transformation',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 let b=null;
 for(let j=0;j<30;j++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const candidate=s.beasts[s.encounter.beastId];
  if(!s.encounter.threat&&E.SPECIES[candidate.species].intelligence!=='sapient'&&
   !(Number.isInteger(candidate.sapience)&&candidate.sapience>=3)&&
   !/terrified|panicked|hostile|fleeing/i.test(candidate.mood)){b=candidate;break;}
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 if(!b)continue;
 R.act(s,{system:'world',operation:'watchWildBeast',params:{}});
 if(!s.encounter||b.away===true)continue;
 const regionId=Atlas.LOCATION_REGION[s.world.location],branchId='disposable_self_rite_test',
  key=b.id+'/'+branchId,description='A test-only GM assessment of the actual native individual, finite future anatomical possibilities, and ordinary maturation. No transformation is established.';
 R.act(s,{system:'evolution',operation:'authorBranch',params:{
  beastId:b.id,branchId,source:description,incompatibleWith:[],
  ecology:{regionId,minForage:0,minWater:0,minQuality:0,maxPressure:100,
   riteEnergy:1,riteCondition:0,basis:description},
  parameters:{beastId:b.id,branchId,name:'Measured possible native form',kind:'normal',
   grade:1,requiredYears:1,potential:3,gradeCeiling:1,documented:true,specialConditionsMet:false,
   conditions:[{label:'Separate actual final transformation requirement',met:true,known:true}],
   formProfile:{species:b.species,formName:'Possible native form',
    speciesGrade:'G1 test form',individualGrade:'G1 test individual',size:'Small',
    anatomy:['Measured possible skeletal development','Measured possible muscular development'],
    magicalOrgans:[],abilities:[],needs:{diet:'Original compatible food',habitat:'Original compatible range',care:'Individually assessed care'},
    levelCap:20,maxHp:b.maxHp,maxEnergy:b.maxEnergy},
   eventStats:{basis:description,vigor:3,will:2}}
 }});
 R.act(s,{system:'evolution',operation:'register',params:{beastId:b.id,branchId}});
 C.event(s,'story',description,{origin:M.WITNESS,beastId:b.id,branchId,
  location:b.location,observedIndividualBiology:description,noTransformationOrConsent:true});
 const params={key,witnessIndex:s.log.length-1},before=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'evolution',operation:'npcMaturityEnroll',params:{...params,years:1}}),/freshly witnessed individual/);
 A.equal(E.exportGame(s),before);
 const enrolled=R.act(s,{system:'evolution',operation:'npcMaturityEnroll',params}),
  branch=P.get(s,key),life=b.individualLife;
 A.equal(enrolled.noMaturityGranted,true);A.equal(branch.years,0);A.equal(M.verify(s,branch,b),true);
 A.equal(b.evolutionStage,'Base');A.equal(b.consent,false);
 A.equal(E.dispatch(s,'leave').ok,true);

 // Disposable authored numeric cognition measurement (not consent or
 // an actual in-game assessment). No assignment of behavioural result.
 b.sapience=1;
 const originalLife=life.sourceHash,originalRng=s.rngState,inv=structuredClone(s.player.inventory),beforeEnergy=b.energy,beforeCondition=b.condition;
 C.event(s,'story',b.name+' approaches its own measured biological opportunity independently, with no externally supplied material or handler.',{
  origin:N.WITNESS,beastId:b.id,branchId,species:b.species,form:b.evolutionStage,
  targetForm:branch.formProfile.formName,location:b.location,measuredSapience:b.sapience,
  selfInitiatedOpportunity:true,noExternalHandlerOrCatalyst:true,observedBehaviour:description,
  physiologicalOpportunity:description,independentLimit:description});
 const req={key,witnessIndex:s.log.length-1},pre=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'evolution',operation:'npcNativeRite',params:{...req,accepted:true}}),/fresh self-rite witness/);
 A.equal(E.exportGame(s),pre);
 A.throws(()=>P.nativeEvolutionEvent(s,branch,description,life),/genuine independently chosen/);
 A.equal(E.exportGame(s),pre);
 // Exact individual branch has a known, non-time condition already
 // established by the disposable branch author. Zero progress does not
 // improve the original early-rite difficulty.
 const out=R.act(s,{system:'evolution',operation:'npcNativeRite',params:req});
 const q=branch.nativeSelfRite.rows[0].source;
 A.equal(out.independentlyAccepted,q.accepted);
 A.equal(s.rngState,originalRng);A.deepEqual(s.player.inventory,inv);
 A.equal(life.sourceHash,originalLife);A.equal(b.owner,null);A.equal(b.consent,false);
 A.equal(s.player.partnerIds.includes(b.id),false);
 A.equal(N.verify(s,branch,b),true);A.equal(M.verify(s,branch,b),true);
 if(q.accepted){
  counts.accepted++;A.equal(q.result.dc,14);A.equal(q.result.rolls.length,1);
  A.equal(b.energy,beforeEnergy-1);A.equal(q.ecologicalReceipt.energySpent,1);
  A.equal(b.condition,beforeCondition-(q.result.complication?.condition==='illness'?20:0));
  if(branch.evolved){counts.formed++;A.equal(b.evolutionStage,branch.formProfile.formName);A.equal(b.species,branch.formProfile.species);}
  else{counts.failed++;A.equal(b.evolutionStage,'Base');}
 }else{counts.refused++;A.equal(q.result,null);A.equal(b.energy,beforeEnergy);A.equal(b.evolutionStage,'Base');}
 const saved=E.exportGame(s),copy=E.importGame(saved),rb=P.get(copy,key),cb=copy.beasts[b.id];
 A.equal(N.verify(copy,rb,cb),true);A.equal(M.verify(copy,rb,cb),true);
 if(branch.evolved){
  W.advance(copy,12);
  A.equal(N.verify(copy,rb,cb),true);A.equal(cb.individualLife.sourceHash,originalLife);
  A.equal(cb.evolutionStage,branch.formProfile.formName);
 }
 const corrupt=E.importGame(saved),r=P.get(corrupt,key),row=r.nativeSelfRite.rows[0];
 row.source.after.energy++;row.seal=require('node:crypto').createHash('sha256').update(JSON.stringify(row.source)).digest('hex');
 r.nativeSelfRite.head=row.seal;
 A.equal(N.verify(corrupt,r,corrupt.beasts[b.id]),false);
 if(counts.accepted&&counts.refused&&counts.formed&&counts.failed)break;
}
A.ok(counts.accepted&&counts.refused&&counts.formed&&counts.failed,'Actual independent sample must have refusal, success and failed original native rites');
console.log('INDEPENDENT NATIVE SAME-SPECIES EVOLUTION PASS '+JSON.stringify(counts));
