'use strict';
// GM-first material identities attach to an ALREADY physically owned unit.
// Reuses the original material-asset attestation, common inventory transfer,
// canonical d20 and world clock. Not a new substance generator or craft recipe.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 Items=require('./unified'),Assets=require('./material-handoffs'),
 Places=require('../world/lived-places');
const ORIGIN='original-physical-material-identity-appraisal-v1';
const RELEASE='original-identified-physical-material-return-v1';
const MINUTES=45,RETURN_MINUTES=5,STAMINA=2,DC=12;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const text=(x,lo,hi)=>typeof x==='string'&&x.trim()===x&&
 x.length>=lo&&x.length<=hi&&!/[\u0000-\u001f]/.test(x);
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_]{3,60}$/.test(x);
const own=x=>x&&typeof x==='object'&&!Array.isArray(x);

function asset(s,assetId){
 if(!Assets.verifyAssetAttestations(s))
  throw Error('Original physical property provenance needs reconciliation');
 const a=(s.table?.materialAssetAttestations||[]).find(x=>x.id===assetId);
 if(!a||a.source?.ownerId!=='player'||a.source.item!==a.item||
    a.source.quantity<1||!Object.hasOwn(E.RESOURCES,a.item)||
    a.hash!==hash(a.source))
  throw Error('Appraisal needs one genuinely held source-attested original material, not an invented object or remote merchant stock');
 return a;
}
function checkEvent(e,minute){
 const d=e?.details;
 return !!(e&&e.type==='roll'&&typeof e.text==='string'&&
  e.text.includes('Appraise actual physical material identity')&&
  e.day===E.day({world:{minutes:minute}})&&
  e.time===E.clock({world:{minutes:minute}})&&
  d&&Array.isArray(d.dice)&&d.dice.length===1&&
  Number.isInteger(d.roll)&&d.roll>=1&&d.roll<=20&&d.dice[0]===d.roll&&
  Number.isInteger(d.modifier)&&d.modifier>=-100&&d.modifier<=100&&
  d.dc===DC&&d.naturalBonus===C.naturalAdjustment(d.roll)&&
  d.total===d.roll+d.modifier+d.naturalBonus&&
  d.margin===d.total-DC&&d.degree===C.degree(d.margin)&&
  d.success===(d.margin>=0)&&d.progress===C.progress(d.degree));
}
function attemptValid(s,a){
 const q=a?.source,original=q?.originalAsset;
 if(!q||a.sourceHash!==hash(q)||a.assetId!==q.assetId||
    a.materialId!==q.materialId||a.success!==q.success||
    q.origin!==ORIGIN||!id(q.materialId)||
    Object.hasOwn(E.RESOURCES,q.materialId)||
    !text(q.name,4,100)||!text(q.visibleBasis,30,600)||
    !text(q.originalScene,25,1800)||!q.originalScene.toLowerCase().includes(q.name.toLowerCase())||
    q.character!==s.player?.name||!Places.location(s,q.location)||
    !Number.isInteger(q.startMinute)||q.startMinute<0||
    q.finishMinute-q.startMinute!==MINUTES||
    q.finishMinute>s.world.minutes||
    q.staminaSpent!==STAMINA||
    !Number.isInteger(q.stockBefore)||q.stockBefore<1||q.stockBefore>100000||
    q.stockAfter!==q.stockBefore-(q.success?1:0)||
    q.identifiedUnits!==(q.success?1:0)||
    !original||hash(original.source)!==original.hash||
    original.id!==q.assetId||original.item!==q.item||
    original.source?.ownerId!=='player'||
    !Object.hasOwn(E.RESOURCES,q.item)||
    q.assetHash!==original.hash||
    !checkEvent(q.originalCheck,q.startMinute)||
    q.checkHash!==hash(q.originalCheck)||
    q.success!==q.originalCheck.details.success)return false;
 try{
  const a0=asset(s,q.assetId);
  if(a0.hash!==q.assetHash||JSON.stringify(a0)!==JSON.stringify(original))
   return false;
 }catch{return false;}
 return true;
}
function recordValid(s,r){
 const q=r?.source;
 if(!r||r.origin!==ORIGIN||r.id!==q?.materialId||
    r.sourceHash!==hash(q)||r.assetId!==q.assetId||
    r.item!==q.item||!r.verified||r.name!==q.name||
    q.success!==true||
    !['reserved','released'].includes(r.status)||
    !attemptValid(s,{source:q,sourceHash:r.sourceHash,
      assetId:r.assetId,materialId:r.id,success:true}))
  return false;
 if(r.status==='reserved')return r.release===null;
 const e=r.release,src=e?.source;
 return !!(src&&e.sourceHash===hash(src)&&
   src.origin===RELEASE&&src.materialId===r.id&&
   src.originalSourceHash===r.sourceHash&&src.item===r.item&&
   src.character===q.character&&
   Number.isInteger(src.minute)&&src.minute>=q.finishMinute&&
   src.minute<=s.world.minutes&&
   src.quantity===1&&src.noNewMaterial===true);
}
function verify(s){
 const attempts=s.table?.materialAppraisalAttempts||{},
  records=s.table?.materialRecords||{};
 if(!own(attempts)||!own(records)||
    Object.keys(attempts).length>1000||
    Object.keys(records).length>1000)return false;
 const used=new Set();
 for(const [assetId,a] of Object.entries(attempts)){
  if(assetId!==a?.assetId||used.has(assetId)||!attemptValid(s,a))
   return false;
  used.add(assetId);
  const r=records[a.materialId];
  if(a.success?!r||!recordValid(s,r):!!r)return false;
 }
 for(const [mid,r] of Object.entries(records)){
  if(mid!==r?.id||!recordValid(s,r)||
     !attempts[r.assetId]?.success||
     attempts[r.assetId].materialId!==mid||
     attempts[r.assetId].sourceHash!==r.sourceHash)return false;
 }
 return true;
}
function count(s,materialId){
 if(!id(materialId))return 0;
 const r=s.table?.materialRecords?.[materialId];
 if(!r)return 0;
 if(!verify(s))throw Error('Sourced material identities and inventory reservations require reconciliation');
 return r.status==='reserved'?1:0;
}
function verified(s,materialId){
 const r=s.table?.materialRecords?.[materialId];
 if(!r)return false;
 if(!verify(s))throw Error('An apparent GM material cannot substitute for an authentic physical specimen');
 return r.verified===true;
}
function appraise(s,p={}){
 const accepted=['assetId','materialId','name','visibleBasis'];
 if(!own(p)||Object.keys(p).sort().join('|')!==accepted.sort().join('|')||
    typeof p.assetId!=='string'||!id(p.materialId)||
    Object.hasOwn(E.RESOURCES,p.materialId)||
    !text(p.name,4,100)||!text(p.visibleBasis,30,600))
  throw Error('Appraise an identified actually owned physical sample by its existing asset and observed named variant; no chosen grade, bonus, quantity or property');
 if(s.battle||s.encounter||s.table?.combatants?.player?.status&&
    s.table.combatants.player.status!=='ok')
  throw Error('Physical appraisal requires a safe conscious work session');
 const scene=s.chatRuntime?.scene,site=Places.location(s);
 if(!site||!text(scene,25,1800)||
    !scene.toLowerCase().includes(p.name.toLowerCase()))
  throw Error('The named physical distinction must already be visible in the actual local GM scene');
 if(!verify(s))throw Error('Original material sources were altered');
 if(s.table?.materialAppraisalAttempts?.[p.assetId]||
    s.table?.materialRecords?.[p.materialId])
  throw Error('A material sample cannot be appraised twice or relabelled to fish for a different independent result');
 const a=asset(s,p.assetId);
 const before=C.int(s.player.inventory?.[a.item]??0,'real physical sample stock',0,100000);
 if(before<1)throw Error('An actual currently owned original item must be present for appraisal');
 if(C.int(s.player.stamina,'actual appraisal stamina',0,100000)<STAMINA+1)
  throw Error('Insufficient real physical effort for an appraisal');
 const skill=C.int(s.player.skills?.crafting?.rank??0,'earned ordinary Crafting skill',0,5),
  intel=C.int(s.player.attributes?.int,'recorded Intelligence',1,30),
  modifier=Math.floor((intel-10)/2)+skill*2;
 // Preflight the finite original inventory debit even though no sample is
 // segregated unless the one original check succeeds.
 const reserve=Items.planItems(s,{[a.item]:-1});
 const start=s.world.minutes,roll=C.check(s,{
  modifier,dc:DC,label:'Appraise actual physical material identity'});
 const originalCheck=structuredClone(s.log.at(-1)),passed=roll.success;
 if(passed)Items.applyItems(s,reserve);
 s.player.stamina-=STAMINA;
 E.advance(s,MINUTES);W.finalizeTime(s,start);Items.sync(s,{source:'legacy'});
 const source={origin:ORIGIN,assetId:a.id,assetHash:a.hash,
  originalAsset:structuredClone(a),materialId:p.materialId,
  item:a.item,name:p.name,visibleBasis:p.visibleBasis,
  character:s.player.name,originalScene:scene,location:site.id,
  startMinute:start,finishMinute:s.world.minutes,
  staminaSpent:STAMINA,stockBefore:before,
  stockAfter:before-(passed?1:0),identifiedUnits:passed?1:0,
  originalCheck,checkHash:hash(originalCheck),success:passed};
 const entry={assetId:a.id,materialId:p.materialId,success:passed,
  source,sourceHash:hash(source)};
 s.table||={};s.table.materialAppraisalAttempts||={};
 s.table.materialAppraisalAttempts[a.id]=entry;
 if(passed){
  s.table.materialRecords||={};
  s.table.materialRecords[p.materialId]={
   id:p.materialId,origin:ORIGIN,assetId:a.id,item:a.item,
   name:p.name,source,sourceHash:entry.sourceHash,
   status:'reserved',release:null,verified:true};
 }
 if(!verify(s))throw Error('The original source and material stock cannot be reconciled');
 C.event(s,'research',passed?
  'The physically held variant is identified and reserved as a distinct sample.':
  'The attempted identification remains inconclusive; no new material identity is established.',{
   origin:ORIGIN,assetId:a.id,materialId:p.materialId,
   item:a.item,originalCheckHash:source.checkHash,
   result:passed?'identified':'inconclusive',
   noNewPhysicalStock:true,noGradeOrMagic:true,noRecipeOrPower:true});
 return {appraised:true,identified:passed,materialId:p.materialId,
  sourceItem:a.item,reservedUnits:passed?1:0,
  elapsedMinutes:MINUTES,staminaSpent:STAMINA,check:roll,
  noNewStock:true,noVerifiedSpecialAbility:true,
  noCraftingRecipeOrPrice:true};
}
function release(s,p={}){
 if(!own(p)||Object.keys(p).join('|')!=='materialId'||!id(p.materialId))
  throw Error('Return a real identified reserved material without choosing a substitute or quantity');
 if(s.battle||s.encounter)throw Error('An unresolved encounter prevents careful physical material reclassification');
 if(!verify(s))throw Error('The original physical sample cannot be reconciled');
 const r=s.table?.materialRecords?.[p.materialId];
 if(!r||r.status!=='reserved')
  throw Error('Only one still-reserved source-verified sample can return to ordinary physical stock');
 const restore=Items.planItems(s,{[r.item]:1}),start=s.world.minutes;
 Items.applyItems(s,restore);
 r.status='released';
 const source={origin:RELEASE,materialId:r.id,originalSourceHash:r.sourceHash,
  item:r.item,character:s.player.name,minute:start,quantity:1,
  noNewMaterial:true};
 r.release={source,sourceHash:hash(source)};
 E.advance(s,RETURN_MINUTES);W.finalizeTime(s,start);Items.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Returning a real sample must conserve the original one unit');
 C.event(s,'world','The retained variant is returned to ordinary inventory under its source material type.',{
  origin:RELEASE,materialId:r.id,originalSourceHash:r.sourceHash,
  item:r.item,quantity:1,noNewResource:true});
 return {materialId:r.id,released:true,item:r.item,quantityReturned:1,
  elapsedMinutes:RETURN_MINUTES,notAnExtraGather:true,
  noPriceTechniqueOrMagicalBenefit:true};
}
function status(s,p={}){
 if(!own(p)||Object.keys(p).some(x=>x!=='materialId')||
    p.materialId!==undefined&&!id(p.materialId))
  throw Error('Material status is read-only and accepts only a previously named known sample');
 if(!verify(s))throw Error('Original material discovery ledger needs reconciliation');
 const all=Object.values(s.table?.materialRecords||{}),
  selected=all.filter(r=>p.materialId===undefined||r.id===p.materialId);
 return {samples:selected.slice(-40).map(r=>({
   id:r.id,name:r.name,basePhysicalItem:r.item,
   observedVisibleBasis:r.source.visibleBasis,
   originalPropertyAssetId:r.assetId,
   currentStatus:r.status,physicallyHeldUnits:r.status==='reserved'?1:0,
   sourceHash:r.sourceHash,hasUnverifiedMagicOrMaterialGrade:false,
   noAutomaticRecipeOrPrice:true})),
  failedAppraisals:Object.values(s.table?.materialAppraisalAttempts||{})
   .filter(x=>!x.success).length,
  note:'Authenticated variant identity and one conserved physical unit; no novel item is minted and no effect, rarity, grade, price, recipe or spell is proven.'};
}
module.exports={ORIGIN,RELEASE,MINUTES,appraise,release,status,verified,count,verify};
