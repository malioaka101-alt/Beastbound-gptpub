'use strict';
const A=require('node:assert/strict'),E=require('../engine'),R=require('../rules'),
 C=require('../rules/core'),W=require('../rules/world'),Atlas=require('../world/atlas'),
 Wild=require('../world/wild-lives'),M=require('../rules/independent-original-beast-maturity'),
 P=require('../rules/progress');
let result=null;
for(let seed=831001;seed<831030;seed++){
 const s=E.newGame({name:'Disposable native beast maturation',seed,path:'undecided'});
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
 const regionId=Atlas.LOCATION_REGION[s.world.location],branchId='disposable_maturation_test',
  key=b.id+'/'+branchId,description='A test-only GM assessment of the actual native individual, finite future anatomical possibilities, and ordinary maturation. No transformation is established.';
 R.act(s,{system:'evolution',operation:'authorBranch',params:{
  beastId:b.id,branchId,source:description,incompatibleWith:[],
  ecology:{regionId,minForage:0,minWater:0,minQuality:0,maxPressure:100,
   riteEnergy:1,riteCondition:0,basis:description},
  parameters:{beastId:b.id,branchId,name:'Measured possible native form',kind:'normal',
   grade:1,requiredYears:1,potential:3,gradeCeiling:1,documented:true,specialConditionsMet:false,
   conditions:[{label:'Separate actual final transformation requirement',met:false,known:true}],
   formProfile:{species:b.species,formName:'Possible native form',
    speciesGrade:'G1 test form',individualGrade:'G1 test individual',size:'Small',
    anatomy:['Measured possible skeletal development','Measured possible muscular development'],
    magicalOrgans:[],abilities:[],needs:{diet:'Original compatible food',habitat:'Original compatible range',care:'Individually assessed care'},
    levelCap:20,maxHp:b.maxHp,maxEnergy:b.maxEnergy},
   eventStats:{basis:description,vigor:0,will:0}}
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
 const saved=E.exportGame(s),clone=E.importGame(saved);
 W.advance(s,36);W.advance(clone,36);
 const copy=clone.beasts[b.id],copied=P.get(clone,key);
 A.ok(branch.independentMaturity.rows.length>0);
 A.equal(M.verify(s,branch,b),true);A.equal(M.verify(clone,copied,copy),true);
 A.deepEqual(branch.independentMaturity,copied.independentMaturity);
 const total=branch.independentMaturity.rows.reduce((a,b)=>a+b.source.days,0);
 A.ok(total>0&&total<=36);
 A.ok(Math.abs(branch.years-total*2/365)<1e-12);
 A.equal(b.evolutionStage,'Base');A.equal(b.consent,false);A.equal(b.owner,null);
 A.equal(s.player.partnerIds.length,0);A.equal(P.status(branch).ready,false);
 const now=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'evolution',operation:'advance',params:{key,days:6}}),/original wildlife life ticks/);
 A.equal(E.exportGame(s),now);
 W.finalizeTime(s,s.world.minutes);A.equal(E.exportGame(s),now);
 const corrupt=E.importGame(now),r=P.get(corrupt,key);
 r.years+=.5;A.equal(M.verify(corrupt,r,corrupt.beasts[b.id]),false);
 const row=copied.independentMaturity.rows[0];
 row.source.after+=.2;row.seal=require('node:crypto').createHash('sha256').update(JSON.stringify(row.source)).digest('hex');
 A.equal(M.verify(clone,copied,copy),false);
 result={completedIntervals:branch.independentMaturity.rows.length,elapsedDays:total,maturity:branch.years,noEvolutionOrConsent:true};
 break;
}
A.ok(result,'An actual witnessed native independent beast must complete world-owned Maturity intervals');
console.log('INDEPENDENT NATIVE BEAST MATURITY PASS '+JSON.stringify(result));
