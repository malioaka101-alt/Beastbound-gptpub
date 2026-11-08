'use strict';
// Open-ended ordinary methods from the real work of independently generated
// people. Their *verified* individual careers supply the material evidence.
// A distinct funded trial is necessary; no spontaneous power or mastery rank.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 Careers=require('./person-careers'),People=require('./emergent-people');
const ORIGIN='earned-independent-person-practical-innovation-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const COST=2;
const clamp=(x,min=0,max=100)=>Math.max(min,Math.min(max,x));
function ensure(w){
 w.independentInnovations||={version:1,records:{},lastSixday:-1};
 const t=w.independentInnovations;
 if(t.version!==1||!t.records||typeof t.records!=='object'||
  Array.isArray(t.records)||!Number.isInteger(t.lastSixday))
  throw Error('Independent practical technique archive is invalid');
 return t;
}
function records(w,p){
 if(!People.verify(w,p)||!Careers.verify(p))
  throw Error('Inventions require a genuinely individual professional history');
 return (p.career?.workReceipts||[]).filter(r=>
  r?.origin===Careers.WORK&&
  r.sourceHash===hash(r.source)&&
  r.source?.personId===p.id&&
  r.source?.personOriginHash===p.originHash&&
  r.source?.outcome?.success===true&&
  r.source.task?.regionId===p.regionId&&
  Number.isInteger(r.source.day));
}
function valid(w,r){
 if(!r||r.origin!==ORIGIN||r.sourceHash!==hash(r.source)||
  r.source.origin!==ORIGIN||r.source.id!==r.id||
  r.id!=='method_'+r.source.personId+'_'+r.source.method||
  !['tested','reworking'].includes(r.status)||
  !Array.isArray(r.attempts)||r.attempts.length<1||
  r.attempts.some(x=>x.hash!==hash(x.source)||
   x.source?.origin!==ORIGIN||x.source.personId!==r.source.personId||
   x.source.method!==r.source.method)||
  r.status==='tested'&&!r.attempts.at(-1).source.passed)return false;
 const p=w.emergentPeople?.people?.[r.source.personId];
 if(!p||p.actorId!==r.source.actorId||
   p.originHash!==r.source.personOriginHash||
   !People.verify(w,p)||!Careers.verify(p)||
   !Atlas.R[r.source.regionId]||
   r.source.polity!==Atlas.R[r.source.regionId].polity||
   r.source.firstTrialDay<p.birthSource.day)return false;
 // Original source-work witnesses have immutable content; the first
 // three proofs must actually be part of the person's sealed career.
 const proofs=r.source.originalWorkProofs;
 return Array.isArray(proofs)&&proofs.length===3&&
  new Set(proofs.map(x=>x.source.day)).size===3&&proofs.every(x=>
  x.sourceHash===hash(x.source)&&
  x.source?.origin===Careers.WORK&&
  x.source?.personId===p.id&&
  x.source?.personOriginHash===p.originHash&&
  x.source?.task?.method===r.source.method&&
  x.source?.outcome?.success===true&&
  x.source?.day<=r.source.firstTrialDay);
}
function workBonus(w,p,method){
 const r=w.independentInnovations?.records?.['method_'+p.id+'_'+method];
 if(!r)return {bonus:0,methodId:null};
 if(!valid(w,r))throw Error('An unverified technique cannot improve real professional skill');
 // A narrow proven method improves its creator's work at home; another
 // person does not instantly learn it by reading a title or sharing a roof.
 return r.status==='tested'&&r.source.regionId===p.regionId?
  {bonus:1,methodId:r.id}:{bonus:0,methodId:null};
}
function consider(w,day,emit){
 const t=ensure(w);
 if(t.lastSixday>=day)return {trials:0,created:0,duplicate:true};
 let trials=0,created=0;
 for(const p of Object.values(w.emergentPeople?.people||{})){
  if(!p||p.status!=='active'||p.lastTickDay!==day||
   !p.career||p.funds<COST||p.fatigue>83)continue;
  const rows=records(w,p);
  const methods=[...new Set(rows.map(x=>x.source.task.method))];
  for(const method of methods){
   const eligible=rows.filter(x=>x.source.task.method===method),
    unique=[...new Map(eligible.map(x=>[x.source.day,x])).values()];
   if(unique.length<3||p.career.competenceRank<1)continue;
   const id='method_'+p.id+'_'+method,old=t.records[id];
   if(old){
    if(!valid(w,old))throw Error('A recorded independent method has false origin evidence');
    if(old.status==='tested'||old.attempts.length>=3)continue;
    // Retrying a failed technical trial needs TWO further real successful
    // work days, not another call or the same preselected good roll.
    const last=old.attempts.at(-1).source;
    if(unique.filter(r=>r.source.day>last.day).length<2)continue;
   }
   const task=unique.at(-1).source.task;
   if(task.regionId!==p.regionId||task.polity!==p.polity)continue;
   const roll=1+Math.floor(Careers._debug.draw(p)*20),
    modifier=p.career.competenceRank*2+
     Math.floor((p.career.aptitude-5)/2)-
     (p.fatigue>60?2:0),
    dc=14+(task.context.pressure>70?2:0),
    passed=roll===20||(roll!==1&&roll+modifier>=dc),
    before=p.funds;
   p.funds=clamp(p.funds-COST);
   const receiptSource={origin:ORIGIN,id,personId:p.id,method,
    day,roll,modifier,dc,passed,cost:COST,
    fundsBefore:before,fundsAfter:p.funds,
    workReceiptHashes:unique.slice(-3).map(x=>x.sourceHash),
    competenceRank:p.career.competenceRank,regionId:p.regionId};
   const attempt={source:receiptSource,hash:hash(receiptSource)};
   trials++;
   if(old){
    old.attempts.push(attempt);old.status=passed?'tested':'reworking';
    if(passed)created++;
   }else{
    const source={origin:ORIGIN,id,personId:p.id,actorId:p.actorId,
     personOriginHash:p.originHash,
     originPersonDay:p.birthSource.day,polity:p.polity,
     regionId:p.regionId,firstTrialDay:day,method,
     title:p.name.split(' of ')[0]+'’s '+method.replace(/-/g,' ')+
      ' field practice',
     purpose:task.goal,domain:task.domain,
     originalWorkProofs:unique.slice(0,3).map(x=>({
      source:structuredClone(x.source),sourceHash:x.sourceHash}))};
    const r={id,origin:ORIGIN,source,sourceHash:hash(source),
     attempts:[attempt],status:passed?'tested':'reworking',
     releaseDay:passed?day+6:null};
    t.records[id]=r;if(passed)created++;
   }
   const row=t.records[id];
   if(passed){
    row.releaseDay=day+6;
    if(typeof emit==='function')emit({day,region:p.polity,
     subject:'earned-method:'+id,channel:'local vocational notice',
     publiclyKnown:true,releaseDay:row.releaseDay,
     text:p.name+' reports a successfully tested local '+
      method.replace(/-/g,' ')+' practice from repeated real work. '+
      'It is a limited practical method, not a supernatural power, formal licence or inherited family art.',
     severity:'routine'});
   }
   break; // A person's sixday has room for one separately funded trial.
  }
 }
 t.lastSixday=day;
 return {trials,created,duplicate:false};
}
function visible(s,w){
 const pol=Atlas.R[Atlas.LOCATION_REGION[s.world.location]]?.polity,
  day=Math.floor(s.world.minutes/1440),out=[];
 for(const r of Object.values(w.independentInnovations?.records||{})){
  if(!valid(w,r))throw Error('Public methods must have actual individual professional origins');
  if(r.status!=='tested'||r.releaseDay>day||
   r.source.polity!==pol)continue;
  out.push({id:r.id,name:r.source.title,
   maker:w.emergentPeople.people[r.source.personId].name,
   field:r.source.domain,purpose:r.source.purpose,
   testedAtDay:r.attempts.at(-1).source.day,
   publishedAtDay:r.releaseDay,
   ordinaryTechniqueOnly:true,noAutomaticLearning:true});
 }
 return {localPracticalMethods:out.slice(-25),
  note:'Independent people create these limited methods after repeated verified work and a separately funded trial. Hearing the title gives no technique, rank, family access or magic.'};
}
module.exports={ORIGIN,ensure,valid,consider,workBonus,visible};
