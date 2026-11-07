'use strict';
// Persistent, independent professional growth; not a shortcut around separate
// cultivation disciplines. Training is real, high-tier breakthroughs are not
// granted until there is a valid discipline-specific event.
const A=require('./atlas'),P=require('../rules/progress'),B=require('./bestiary');
const GIVEN=['Elien','Sova','Tallis','Iri','Maelin','Vessa','Ruhan','Ordan','Kesh','Iven','Nara','Zerin','Vey','Thalen','Issa','Meri','Caer','Ansel','Tova','Rima','Yar','Silas','Meir','Kora','Helian','Fenna','Jasen','Liri','Daim','Solwen'];
const FAMILY=['of Highwater','Reedhand','Brightroot','Coilstone','Ashbridge','Skybridge','Wellkeeper','Oathwell','Duskmark','Stonepath','Coldstream','Greenway','of Many Tracks','Sailglass','Starward','Tidewatch'];
const paths=['meridian','arcane','soul','body','rift','specialist','independent'];
const TRAINING={
 meridian:[[40,12,'Foundation Tempering'],[72,13,'Meridian Awakening'],[3,13,'Gate Opening (one lower gate)']],
 arcane:[[40,12,'Core Seeding'],[100,12,'Circle I'],[150,14,'Circle II'],[200,16,'Circle III']],
 soul:[[100,12,'Soul Phase I'],[130,14,'Soul Phase II'],[200,16,'Soul Phase III']],
 body:[[150,12,'Body Cycle I'],[150,14,'Body Cycle II'],[200,16,'Body Cycle III']],
 rift:[[50,12,'Rift Sense'],[85,14,'Anchor Marking'],[120,16,'Fold Step']],
 specialist:[[40,12,'Specialist Rank I'],[80,14,'Specialist Rank II'],[120,16,'Specialist Rank III']],
 independent:[[60,13,'Secular Practice Foundation'],[120,15,'Advanced Practice Methods']]
};
function seedNotables(){const a={};for(let i=0;i<A.polities.length;i++){
 const polity=A.polities[i];for(let slot=0;slot<2;slot++){
  const id=`${polity.id}_${slot?'field':'civic'}`,seed=B.hash(id),path=paths[(i+slot*3)%paths.length];
  const prefix=polity.culture==='beastcourt'||polity.culture==='reef'?'Speaker ':'';
  a[id]={id,name:prefix+GIVEN[seed%GIVEN.length]+' '+FAMILY[(seed>>>5)%FAMILY.length],polity:polity.id,institution:slot===0?polity.leadInstitution:
   A.institutions.find(x=>x.polity===polity.id&&x.id!==polity.leadInstitution)?.id||polity.leadInstitution,
   public:false,origin:`${polity.name} professional network`,profession:slot===0?'civic representative':'field specialist',
   professional:{rank:1,pp:0,masteryTrial:false},discipline:{path,stage:0,trainingPoints:0,ready:false,trainingMonths:0,
    next:TRAINING[path][0][2],capacity:TRAINING[path][0][0],dc:TRAINING[path][0][1]},
   injuryMonths:0,mentoring:slot===0?'public-service practice':'institutional instruction',
   memory:[],life:{ageBand:['young adult','adult','middle-aged'][seed%3],community:'local institutions',goal:slot===0?'protect public service':'improve field expertise'}};
 }}return a;}
function update(w,day,random,emit){
 for(const n of Object.values(w.notables||{})){
  const independent=n.independentPracticeId&&w.agentInitiatives?.entrants?.[n.independentPracticeId];
  const institution=independent||w.institutions[n.institution],host=w.countries[n.polity];
  if(n.injuryMonths){n.injuryMonths--;continue;}
  if(!institution||institution.status==='suspended'){n.discipline.trainingMonths++;continue;}
  const prof=n.professional,mod=2*prof.rank+2+(institution.capacity>60?2:0);
  const d=n.discipline;
  // Five sixday weeks per 30-day month, but only 2–4 sustained training
  // weeks after civic and practical responsibilities.
  const weeks=2+(institution.capacity>55?1:0)+(host.stability>55?1:0);
  if(prof.rank<3){
   // An institution's resources do not prove a higher-rank teacher exists.
   // Professional work still builds independently earned competence; actual
   // instruction may improve it later when an individual source is witnessed.
   const pp=P.trainingPP({currentRank:prof.rank,
    partTime:weeks<3,comprehension:3});
   const r=P.addPracticePoints(prof,pp);
   if(r.advancements.length){n.memory.push({day,event:`${n.profession} advances to skill rank ${prof.rank}`});
    if(n.public)emit({day,region:n.polity,subject:n.id,text:`${n.name} receives recognition for growing professional expertise.`,channel:'guild report',releaseDay:day+7});}
  }
  // Source-aligned expected-rate points for study only; no instant
  // metamorphosis, Gate 36/72/108, Circle ignition or evolution.
  if(!d.ready){
   const rate=P.expectedRate(mod,d.dc),gain=Math.round(rate*weeks*10)/10;
   d.trainingPoints=Math.min(d.capacity,Math.round((d.trainingPoints+gain)*10)/10);
   d.trainingMonths++;
   if(d.trainingPoints>=d.capacity){d.ready=true;
    n.memory.push({day,event:`Prepared for ${d.next}; the real discipline-specific milestone still needs its own verified event (guidance may help, but is not compulsory)`});
    if(n.public)emit({day,region:n.polity,subject:n.id,text:`${n.name} completes preparatory study toward ${d.next}; the actual trial remains ahead.`,channel:'academy dispatch',releaseDay:day+8});
   }
  }
  if(n.memory.length>15)n.memory.splice(0,n.memory.length-15);
 }
}
function publicKnown(s,notables){const known=new Set(Object.keys(s.npcMemory||{}).map(x=>x.toLowerCase()));
 return Object.values(notables||{}).filter(n=>n.public||known.has(n.name.toLowerCase())).map(n=>({id:n.id,name:n.name,community:A.P[n.polity].name,role:n.profession,
  discipline:n.discipline.path,training:n.discipline.ready?'preparing for a documented trial':'active study',
  skillRank:n.professional.rank}));}
function reveal(w,{id,source,channel}={}){const n=w.notables?.[id];if(!n)throw Error('Unknown background professional');
 if(typeof source!=='string'||source.length<10||!['witnessed','letter','guild notice','public bulletin'].includes(channel))throw Error('NPC knowledge requires a credible source');
 n.public=true;return {known:true,id:n.id,name:n.name,profession:n.profession,source,channel};}
module.exports={seedNotables,update,publicKnown,reveal,TRAINING};