'use strict';
// #14 first vertical slice: original GM source identity and actual specific
// human compatibility evidence, not reused habitat findings or free traits.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),R=require('../rules'),C=require('../rules/core'),
 Lineage=require('../rules/beast-origin-lineage');
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const act=(s,operation,params={})=>R.act(s,{system:'origin',operation,params});
function source(s,sourceId,route){
 C.event(s,'story','A qualified in-world source independently establishes the specific Origin Pattern with anatomical and ethical records.',{
  origin:Lineage.SOURCE,sourceId,location:s.world.location,
  sourceStudy:'An independent bodily and magical investigation distinguishes this trait from an ecological sighting'});
 const observation=structuredClone(s.log.at(-1));
 const q={origin:Lineage.SOURCE,sourceId,route,
  traitName:'Individually studied original respiratory tissue',
  exactObservedMechanism:'A measurable individual respiratory tissue mechanism can only be described by actual biological investigation.',
  originalBiology:'Original human lungs and blood must physically tolerate any proposed adaptation without fictional free organs.',
  magicalRequirements:'Actual recorded magical transport requirements remain unproven until physical examination and testing.',
  spiritualRequirements:'The real original soul and independent identity remain intact throughout non-invasive investigation.',
  metabolicLimits:'Genuine human oxygen and nutrition needs and actual tissue injury constrain the theoretical adaptation.',
  conflictLimit:'Other integrated bodily traits may consume overlapping physical or energetic capacity independently.',
  integrationLoad:1,
  rights:{mode:'unresolved',verified:false,
   originalProvenance:'The examined concept has no demonstrated material ownership or independent donor consent yet.'},
  minute:s.world.minutes,location:s.world.location,observation,
  observationHash:digest(observation)};
 s.table.originTraitSources||={};
 s.table.originTraitSources[sourceId]={origin:Lineage.SOURCE,source:q,seal:digest(q)};
}
function witness(s,sourceId,origin,more={}){
 C.event(s,'story','An independently witnessed individual Origin Pattern investigation takes place in a real controlled physical location.',{
  origin,sourceId,location:s.world.location,
  measuredIndividualResponse:'A genuinely observed local human respiratory response is documented without claiming a borrowed animal ability.',
  independentFailureLimit:'Ordinary fatigue, loss of oxygen and original body injury interrupt the individual bodily response.',
  ...more});
 return s.log.length-1;
}
function recovery(s,min){
 let loops=0;while(s.player.stamina<min){
  A.ok(loops++<12,'Time and ordinary rest must cover real research expenditure');
  R.act(s,{system:'health',operation:'sleep',params:{hours:8}});
  if(s.player.stamina<min)R.act(s,{system:'world',operation:'wait',params:{minutes:960}});
 }
}
{
 const s=E.newGame({seed:140014,name:'Original Lineage Research Test',path:'origin'});
 R.unified.ensurePlayer(s);s.world.location='academy';
 s.player.attributes.int=30;s.player.attributes.wis=30;
 for(const skill of ['research','medicine','arcana','cultivation'])s.player.skills[skill].rank=5;
 const beforeLegacy=structuredClone(s.player.origin),
  beforeEvolution=structuredClone(s.player.humanEvolution);
 const empty=act(s,'lineageStatus');
 A.deepEqual(empty.individualSources,[]);
 A.throws(()=>act(s,'lineageMap',{sourceId:'no_original_source',minutes:15}),
  /source|witness|registered/i);
 source(s,'measured_lineage_one','ancestral');
 const first=act(s,'lineageStatus');
 A.deepEqual(first.individualSources,[],'The GM original source is not itself a free mapped trait');
 const event=witness(s,'measured_lineage_one',Lineage.MAP);
 const before=s.world.minutes,sta=s.player.stamina,rng=s.rngState;
 const start=act(s,'lineageMap',{sourceId:'measured_lineage_one',witnessIndex:event,minutes:15});
 A.equal(start.seeded,false);
 A.equal(start.noTraitOrEvolutionGranted,true);
 A.equal(s.world.minutes,before+15);
 A.equal(s.player.stamina,sta-1);
 A.equal(Lineage.verify(s),true);
 const cloned=E.exportGame(s),rollState=s.rngState;
 A.throws(()=>act(s,'lineageMap',{sourceId:'measured_lineage_one',witnessIndex:event,minutes:15}),
  /rerolled|already complete/);
 A.equal(E.exportGame(s),cloned);
 A.equal(s.rngState,rollState);
 let tries=0;
 while(!act(s,'lineageStatus').individualSources[0].mapped){
  A.ok(tries++<10,'A strong individual practitioner should complete real mapping');
  recovery(s,1);
  const evidence=witness(s,'measured_lineage_one',Lineage.MAP);
  act(s,'lineageMap',{sourceId:'measured_lineage_one',witnessIndex:evidence,minutes:15});
 }
 A.equal(act(s,'lineageStatus').individualSources[0].mapped,true);
 const axes={};
 for(const axis of Lineage.AXES){
  const target=axis==='energetic'?'caution':'promising';
  let assessed,attempts=0;
  do{
   A.ok(attempts++<8,'Fresh independently observed physical trials must eventually resolve a genuine individual compatibility axis');
   recovery(s,1);
   const i=witness(s,'measured_lineage_one',Lineage.SCREEN,{axis,
    measuredExistingTraitInteractions:'The examiner independently checks the present baseline human physiology and all existing confirmed personal lineages.'});
   const minutesBefore=s.world.minutes,staminaBefore=s.player.stamina;
   assessed=act(s,'lineageScreen',{sourceId:'measured_lineage_one',axis,witnessIndex:i,minutes:15});
   A.equal(assessed.screeningOnly,true);
   A.equal(assessed.noNewTrait,true);
   A.equal(assessed.seedingApproved,false);
   A.equal(s.world.minutes,minutesBefore+15);
   A.equal(s.player.stamina,staminaBefore-1);
   A.equal(Lineage.verify(s),true);
  }while(assessed.result!==target);
  axes[axis]=assessed.result;
 }
 A.equal(axes.physical,'promising');
 A.equal(axes.energetic,'caution','A real missing circulation channel is only a contextual caution');
 A.equal(axes.spiritual,'promising');
 A.equal(axes['trait-conflict'],'promising');
 A.deepEqual(s.player.origin,beforeLegacy,'Original integration load and candidate stay untouched by purely sourced research');
 A.deepEqual(s.player.humanEvolution,beforeEvolution,'Neither phase nor trait appears through a concept dossier');
 const status=act(s,'lineageStatus');
 A.equal(status.individualSources[0].compatibility.length,4);
 A.equal(status.individualSources[0].seedingApproved,false);
 A.equal(status.individualSources[0].rightsDocumented,false);
 const saved=E.importGame(E.exportGame(s));
 A.equal(Lineage.verify(saved),true,'Full save/import keeps exact witnessed original research');
 saved.table.originLineageStudies.measured_lineage_one.mapping[0].source.progressAfter+=2;
 A.equal(Lineage.verify(saved),false,'Claimed fake research must fail integrity checks');
 const altered=E.importGame(E.exportGame(s));
 altered.table.originTraitSources.measured_lineage_one.source.rights.verified=true;
 A.equal(Lineage.verify(altered),false,'Ownership or consent cannot be silently rewritten');
 const alteredCheck=E.importGame(E.exportGame(s));
 alteredCheck.table.originLineageStudies.measured_lineage_one.screens.physical[0].source.check.margin+=999;
 A.equal(Lineage.verify(alteredCheck),false,'Original dice margin proof must be preserved');
 const snapshot=E.exportGame(s),rs=s.rngState;
 const read=act(s,'lineageStatus');
 A.equal(read.individualSources.length,1);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rs);
 A.notEqual(rng,s.rngState,'Real research used the actual engine RNG');
}
console.log('Origin #14 first slice: individually witnessed GM source, original trait mapping, four real compatibility axes and no seeding');
