'use strict';
/* File 19 §1.2 and file 18 §7: only formulae actually supplied. */
const {int}=require('./core');
function researchGrade(system,tier){
 const tops={meridian:9,arcane:9,soul:7,body:7,runes:7,formations:7,alchemy:7,weapon:7,elemental:7,healing:7,rift:8,sync:10,regard:10,skill:5};
 const top=tops[system];if(!top)throw Error('Unknown system');int(tier,'tier',1,top);
 return Math.min(9,Math.ceil(tier*9/top));
}
function effectGrade(magnitude,{trivial=false}={}){int(magnitude,'Magnitude',0,7);return trivial&&magnitude===0?1:magnitude+2;}
function spellCasting({complexity,specialised=false,prepared=false}){int(complexity,'complexity',0,40);const cp=Math.max(0,complexity-(specialised?1:0));return {complexity:cp,castingDC:10+cp,castingBonus:(specialised?1:0)+(prepared?2:0)};}
function deviceMagnitude(materialGrade){int(materialGrade,'material grade',1,9);return Math.max(0,materialGrade-2);}

// Derived profile calculators: stat vectors, spell budgets and evolution measures.
const SIZE={Tiny:[2,1,1,-2,2,2],Small:[3,1,1,-1,1,3],Medium:[3,2,1,0,0,5],
 Large:[4,2,1,1,-1,7],Huge:[4,3,2,2,-2,9],Gargantuan:[5,4,2,3,-4,11],Colossal:[6,5,3,4,-6,13]};
const gradeM=g=>[null,0,0,1,2,3,4,5,6,7][int(g,'grade',1,9)];
const attr=(a,k)=>Number(a?.[k]||0);
function instinctRank(level){int(level,'level',1,200);return level>=70?5:level>=40?4:level>=20?3:level>=10?2:1;}
function beastStats(attrs,size,hide,evasion,level,grade,{attackAttr='agility',weaponBonus=0,mastery=0}={}){
 const z=SIZE[size];if(!z)throw Error('Unknown size');
 const rank=instinctRank(level),v=attr(attrs,'vigor');
 return {toughness:4+v+hide+z[3],defense:10+attr(attrs,'agility')+evasion+z[4],
   stamina:6+2*v,initiative:attr(attrs,'agility')+attr(attrs,'wits'),
   attack:attr(attrs,attackAttr)+2*rank+mastery,damage:z[5]+weaponBonus,
   boxes:z.slice(0,3),offM:gradeM(grade),durM:gradeM(grade),instinctRank:rank};
}
function humanStats(attrs,{skills={},armourT=0,shield=0,heavyArmourDefPenalty=0,bonuses={},soulPhase=0,size='Medium'}={}){
 const z=SIZE[size];if(!z)throw Error('Unknown size');
 const dodge=Math.max(skills.Acrobatics||0,skills.Melee||0);
 return {stamina:6+2*attr(attrs,'vigor')+(bonuses.stamina||0),
 toughness:4+attr(attrs,'vigor')+armourT+(bonuses.toughness||0),
 defense:10+attr(attrs,'agility')+dodge+shield+z[4]-heavyArmourDefPenalty,
 initiative:attr(attrs,'agility')+attr(attrs,'wits'),
 bondCapacity:Math.max(1,2+attr(attrs,'will')+soulPhase),
 soulStability:10+2*attr(attrs,'will')+(bonuses.ss||0),
 boxes:z.slice(0,3).map((value,i)=>value+(bonuses[['light','serious','critical'][i]]||0))};
}
function meridianProfile(stage,{meridians=12,gatesP=0,gatesS=0,gatesF=0,purityExtra=0,seaRings=0,extraordinary=0,webComplete=false,intentDepth=0}={}){
 int(stage,'Meridian stage',1,9);
 const opened=gatesP+gatesS+gatesF,counted=gatesP+gatesS,kidney=(stage>=3||meridians>=8)?1:0;
 const r={stage,qi:0,flow:0,recovery:0,bonuses:{stamina:2},reinforcement:null,burst:null};
 if(stage===1)return r;
 if(stage>2||meridians>=4)r.bonuses.stamina++;
 if(stage===2){r.qi=4+meridians;r.flow=2;r.recovery=4+(meridians>=8?1:0);return r;}
 const gates=stage===3?opened:108;
 const countedGood=stage===3?counted:Math.max(counted,108-gatesF);
 r.qi=16+Math.floor(countedGood/2)+gatesP;
 r.flow=[[12,3],[36,4],[54,5],[72,6],[90,7],[108,8]].reduce((n,[need,flow])=>gates>=need?flow:n,2);
 r.flow=Math.max(2,r.flow-Math.floor(gatesF/3));
 r.recovery=4+Math.floor(gates/18)+kidney;
 if(gates>=36){r.bonuses.toughness=1;r.bonuses.stamina+=2;r.reinforcement={magnitude:1,cost:3};}
 if(gates>=108){r.bonuses.light=1;r.reinforcement={magnitude:2,cost:6};}
 if(stage===3)return r;
 r.qi=2*r.qi+10*seaRings;r.flow=10+Math.floor(seaRings/2)-Math.floor(gatesF/3);r.recovery=15+2*seaRings+kidney;
 r.bonuses.toughness++;r.burst={magnitude:3,cost:12};
 if(stage===4)return r;
 r.qi+=5*extraordinary;
 if(extraordinary>=4)r.reinforcement={magnitude:3,cost:10};
 if(webComplete||stage>=6){r.flow=14;r.recovery=30;r.bonuses.serious=1;r.bonuses.toughness++;r.bonuses.wpr=1;r.reinforcement={magnitude:3,cost:10};}
 if(stage===5)return r;
 r.qi+=10*intentDepth;r.flow=16;r.recovery=35;
 if(intentDepth>=3)r.burst={magnitude:4,cost:20};
 if(stage===6)return r;
 r.qi+=60;r.flow=20;r.recovery=45;r.reinforcement={magnitude:4,cost:15};r.burst={magnitude:5,cost:30};r.bonuses.critical=1;
 if(stage===7)return r;
 r.qi+=100;r.flow=25;r.recovery=60;r.reinforcement={magnitude:5,cost:22};
 if(stage===8)return r;
 r.qi+=150;r.flow=30;r.recovery=80;r.burst={magnitude:6,cost:60};return r;
}
// Verified source-derived Arcane and Soul capacity vectors; capability to
// store a resource does not automatically teach a Circle spell or Soul art.
const ARCANE_BASE=[[5,0,0,2,0,1,0,1,0],[10,5,1,3,1,2,0,2,1],[20,5,2,5,2,4,1,3,1],
 [30,5,3,7,3,6,1,4,2],[45,5,4,10,4,8,2,5,2],[60,6,5,13,5,10,2,6,3],
 [80,7,6,17,6,12,3,7,3],[110,8,8,22,7,15,3,8,4],[150,9,10,30,8,18,4,10,5],[200,10,12,40,10,22,5,12,6]];
function arcaneProfile(circles,{density=1,vigor=0,will=0,ignited=true}={}){
 int(circles,'Arcane Circles',0,9);int(density,'Core density',0,100);
 if(circles===0&&!ignited)return {mana:0,channels:0,spellsLicensed:false};
 const [base,mult,channels,intake,load,maxComplexity,maxMagnitude,prepared,disciplineBonus]=ARCANE_BASE[circles];
 return {circles,mana:base+mult*density,channels,intake,loadTolerance:vigor+will+load,
  maxComplexity,maxMagnitude,prepared,disciplineBonus,spellsLicensed:false};
}
const SOUL_BASE=[[0,0,0,0,0],[5,1,2,10,1],[10,1,4,20,1],[18,2,6,50,2],[30,2,9,100,3],
 [45,3,12,300,3],[65,3,16,1000,4],[90,4,20,5000,5]];
function soulProfile(phase,{will=0}={}){
 int(phase,'Soul phase',0,7);int(will,'Will modifier',-10,20);
 const [base,per,stability,range,disciplineBonus]=SOUL_BASE[phase];
 return {phase,soulReserve:phase?base+per*will:0,stabilityBonus:stability,perceptionRangeMetres:range,
  disciplineBonus,canUseLearnedArts:phase>0};
}
const spellFamilyBase={strike:0,ward:1,bind:2,shape:1,move:1,sense:1,veil:2,mend_light:3,mend_serious:6,alter:3,link:1,utility:0};
const spellRange={touch:0,self:0,close:1,medium:2,long:3,extreme:5};
const spellArea={single:0,'3m':2,'10m':4,'25m':6,'100m':9};
const spellDuration={instant:0,round:0,'1min':1,'10min':2,'1hour':3,'1day':5,permanent:8};
const magComplexity=[0,2,4,7,10,14,18],magMana=[0,2,5,10,18,30,50];
const circleLimit=[1,2,4,6,8,10,12,15,18,22],circleMag=[0,0,1,1,2,2,3,3,4,5];
function spellCost({family,damage=null,rng='touch',area='single',duration='instant',magnitude=0,conditions=0,stunned=false,extraTargets=0,speed='standard',analogueTier=1,specialised=false,worldCircuit=false}={}){
 if(!Object.hasOwn(spellRange,rng)||!Object.hasOwn(spellArea,area)||!Object.hasOwn(spellDuration,duration))throw Error('Invalid spell range/area/duration');
 int(magnitude,'Magnitude',0,6);int(conditions,'conditions',0,10);int(extraTargets,'additional targets',0,100);
 const modifier={standard:0,swift:2,extended:-1,ritual:-3}[speed];if(modifier===undefined)throw Error('Invalid spell speed');
 if(!Object.hasOwn(spellFamilyBase,family)&&family!=='analogue')throw Error('Unknown spell family');
 let complexity=family==='analogue'?analogueTier+1:spellFamilyBase[family];
 if(family==='strike')complexity+=Math.max(0,Math.floor(((damage??4)-4)/2));
 complexity+=spellRange[rng]+spellArea[area]+spellDuration[duration]+magComplexity[magnitude]+conditions+(stunned?3:0)+Math.min(extraTargets,3)+modifier;
 if(specialised)complexity=Math.max(1,complexity-1);
 const ritual=speed==='ritual'||duration==='permanent';
 let mana=complexity+magMana[magnitude];
 if(family==='analogue')mana=Math.floor(mana*1.5+.5);
 mana=Math.max(1,mana);
 let minimumCircle=null;
 for(let c=0;c<=9;c++){
   const maxC=circleLimit[c]+(ritual?4:0)+(c===9&&worldCircuit?10:0);
   const ritualM={3:2,7:4,8:5}[c]??circleMag[c];
   const maxM=c===9&&worldCircuit?6:ritual?ritualM:circleMag[c];
   if(complexity<=maxC&&magnitude<=maxM){minimumCircle=c;break;}
 }
 return {complexity,mana,load:Math.ceil(complexity/2),castingDC:10+complexity,minCircle:minimumCircle,ritual};
}
const qiRange={touch:0,engaged:0,close:1,medium:2,long:4};
const qiArea={single:0,'3m':3,'10m':6};
function qiTechniqueCost({damage=6,rng='touch',area='single',projectionM=0,riders=0,stunned=false}={}){
 if(!Object.hasOwn(qiRange,rng)||!Object.hasOwn(qiArea,area))throw Error('Invalid technique range/area');
 int(projectionM,'projection M',0,5);
 return 1+Math.ceil(Math.max(0,damage-6)/2)+qiRange[rng]+qiArea[area]+[0,2,5,9,14,20][projectionM]+2*riders+(stunned?4:0);
}
const evoStages=['Baseline','Awakened','Refined','Transformed','Ascendant','Transcendent','Higher Evolved'];
const evoWeights={arcane:[0,1,2,3,5,7,10,14,19,25],soul:[0,1,2,3,5,8,12,17],body:[0,2,5,9,14,20,28,38]};
function evolutionWeight({meridianStage=0,gates=0,webComplete=false,arcaneCircles=0,soulPhase=0,bodyCycles=0,lineageTraits=[],bloodlineAwakened=false,riftRank=0,elementalRank=0,sync9=false}={}){
 let meridian=0;
 if(meridianStage===2)meridian=1;
 else if(meridianStage===3)meridian=gates>=108?4:gates>=72?3:gates>=36?2:1;
 else if(meridianStage>=4)meridian=meridianStage===5&&!webComplete?6:{4:6,5:9,6:12,7:17,8:22,9:28}[meridianStage];
 const parts={meridian,arcane:evoWeights.arcane[arcaneCircles],soul:evoWeights.soul[soulPhase],body:evoWeights.body[bodyCycles],
 lineage:lineageTraits.reduce((n,x)=>n+({nascent:0,expressed:1,adapted:2,evolved:4}[x]??0),0)+(bloodlineAwakened?2:0),
 rift:riftRank>=8?8:riftRank>=6?5:0,elemental:({5:4,6:7,7:10}[elementalRank]??0),sync:sync9?3:0};
 const total=Object.values(parts).reduce((n,x)=>n+x,0);
 let eligibleStage='Baseline';for(const [name,min] of [['Awakened',2],['Refined',6],['Transformed',12],['Ascendant',20],['Transcendent',32],['Higher Evolved',45]])if(total>=min)eligibleStage=name;
 return {parts,total,eligibleStage};
}
function integrationCapacity(potential,bodyCycles=0,stage='Baseline'){
 if(!evoStages.includes(stage))throw Error('Invalid evolution stage');
 return 3+potential+Math.floor(bodyCycles/2)+evoStages.indexOf(stage);
}
function rejectionDC(load,sourceGrade,compatibility){return 10+2*load+sourceGrade-compatibility;}
module.exports={researchGrade,effectGrade,spellCasting,deviceMagnitude,instinctRank,beastStats,humanStats,meridianProfile,arcaneProfile,soulProfile,spellCost,qiTechniqueCost,evolutionWeight,integrationCapacity,rejectionDC};