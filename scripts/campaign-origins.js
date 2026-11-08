'use strict';
// Campaign founding facts are rolled ONCE from the campaign seed. This is not
// advancement, an NPC consent engine, a magical bloodline generator, or a
// replacement for the existing independently living realm.
const Crypto=require('node:crypto');
const Atlas=require('../world/atlas');
const Houses=require('../world/social-houses');
const Heritage=require('../world/renown-and-practice');
const Groups=require('../world/emergent-groups');
const Realm=require('../world/simulation');
const OriginRelatives=require('../world/origin-relatives');
const Engine=require('../engine');

const KINDS=Object.freeze([
 'ordinary','new-family','historic-family','renowned-family',
 'institution','new-organisation','community','independent'
]);
const NONHUMAN_HOUSES=new Set(['shellsong','manytracks']);
const RENOWNED_HOUSES=new Set(Heritage.RENOWNED.map(r=>r.house));
const GROUP_WORDS=Object.freeze({
 apprentice:['Workshop Circle','Repair Fellowship','Makers Cooperative'],
 fieldworker:['Route Fellowship','Fieldworkers Circle','Habitat Stewards'],
 scholar:['Open Study Circle','Record Keepers','Survey Fellowship'],
 healer:['Care Cooperative','Aid Fellowship','Clinic Stewards']
});
function number(seed,tag){
 const u=(Number(seed)>>>0);
 if(!u)throw Error('A nonzero campaign seed is required for founding history');
 return Crypto.createHash('sha256').update('beastbound-opening-origin-v1|'+u+'|'+tag).digest().readUInt32BE(0);
}
function pick(seed,label,items){
 if(!items.length)throw Error('No real candidates for the selected origin');
 return items[number(seed,label)%items.length];
}
function textField(value,label,max=120){
 if(typeof value!=='string'||value.trim().length<2||value.trim().length>max)
  throw Error(label+' must be a meaningful short piece of character history');
 return value.trim();
}
function kind(seed,requested,mode){
 if(requested!==undefined){
  if(!KINDS.includes(requested))throw Error('Unknown origin kind: '+requested);
  return requested;
 }
 if(mode==='guided')return 'ordinary';
 const n=number(seed,'kind')%100;
 return n<34?'ordinary':n<51?'new-family':
  n<64?'historic-family':n<72?'renowned-family':
  n<84?'institution':n<91?'new-organisation':
  n<97?'community':'independent';
}
function candidateRegions(polity){return Atlas.regions.filter(r=>r.polity===polity);}
function surnameFromHouse(h){
 const name=h.elder.split(/\s+/).at(-1);
 return name.replace(/[^A-Za-z'-]/g,'');
}
function resurname(original,surname){
 return original.trim().split(/\s+/).slice(0,-1).join(' ')+' '+surname;
}
function prepare(seed,base,identity,options={},startLocation='crossing'){
 if(!options||typeof options!=='object'||Array.isArray(options))
  throw Error('Starting choices must be a plain options object');
 const authoredRegion=options.gmOpening?.place?.regionId;
 if(!Engine.LOCATIONS[startLocation]&&!(authoredRegion&&Atlas.R[authoredRegion]&&
   options.gmOpening.place.placeId===startLocation))
  throw Error('Opening must be an existing site or a GM-authored place in the real world');
 const mode=options.mode??'random';
 if(!['random','guided','gm'].includes(mode))throw Error('Start mode must be random, guided or GM-authored');
 const implied=options.originKind??(options.houseId?
   (RENOWNED_HOUSES.has(options.houseId)?'renowned-family':'historic-family'):
   options.institutionId?'institution':options.groupName?'new-organisation':undefined);
 let originKind=kind(seed,implied,mode);
 const available=Atlas.regions.filter(r=>r.polity!=='reef_cantons'&&r.polity!=='old_tracks');
 let region=options.homeRegion?
  Atlas.R[options.homeRegion]:pick(seed,'home-region',available);
 if(!region)throw Error('The chosen homeland must exist in the established world atlas');
 if(options.homeRegion&&implied===undefined){
  const houses=Houses.houses.filter(h=>h.polity===region.polity&&
   !NONHUMAN_HOUSES.has(h.id));
  const renowned=houses.some(h=>RENOWNED_HOUSES.has(h.id));
  if((originKind==='renowned-family'&&!renowned)||
    (originKind==='historic-family'&&!houses.length))
   originKind='new-family';
 }
 const f=structuredClone(identity.family),history=structuredClone(identity.history);
 let name=identity.name,connection=null,createdGroup=null;
 if(originKind==='historic-family'||originKind==='renowned-family'){
  if(options.institutionId||options.groupName)
   throw Error('House lineage and institutional/group origins are distinct starting options');
  const pool=Houses.houses.filter(h=>!NONHUMAN_HOUSES.has(h.id)&&
    (!options.homeRegion||h.polity===region.polity)&&
    (originKind!=='renowned-family'||RENOWNED_HOUSES.has(h.id)));
  const h=options.houseId?Houses.byId[options.houseId]:
    pick(seed,'historical-house',pool);
  if(!h||(NONHUMAN_HOUSES.has(h.id)&&!['ward','adopted'].includes(options.houseRelation))||
    (originKind==='renowned-family'&&!RENOWNED_HOUSES.has(h.id)))
   throw Error('Historical human birth lineage must be an existing suitable house');
  if(options.homeRegion&&region.polity!==h.polity)
   throw Error('A house homeland override must remain within the established house polity');
  region=pick(seed,'house-region:'+h.id,candidateRegions(h.polity));
  const relation=options.houseRelation||
   pick(seed,'kin-relation',['birth-branch','birth-branch','birth-branch',
    'distant-kin','adopted','ward']);
  if(!['birth-branch','distant-kin','adopted','ward'].includes(relation))
   throw Error('Unknown family connection; character creation cannot create a formal title');
  if(relation==='birth-branch'){
   const surname=surnameFromHouse(h);
   name=resurname(name,surname);
   for(const m of f.members)if(m.relation!=='sibling'||relation==='birth-branch')
    m.name=resurname(m.name,surname);
  }
  f.homeTrade=h.role;
  f.house={id:h.id,name:h.name,kind:h.kind,polity:h.polity,relation,
   knownPublicDuty:h.duty,knownPublicDispute:h.dispute,
   noAutomaticOffice:true,noAutomaticPrivateMethod:true};
  history.upbringing='Raised within or alongside '+h.name+
   ', a real '+h.kind+' with responsibilities in '+h.role+'.';
  history.familySituation=f.household+'; '+f.ties+'; '+relation+
   ' of '+h.name+'.';
  connection={kind:originKind,houseId:h.id,houseName:h.name,
   relation,renowned:RENOWNED_HOUSES.has(h.id),
   source:'Existing authored regional house, not a historical technique or title award'};
 }else if(originKind==='institution'){
  const i=options.institutionId?Atlas.I[options.institutionId]:
   pick(seed,'institution',Atlas.institutions.filter(x=>
    (!options.homeRegion||x.polity===region.polity)&&
    x.polity!=='reef_cantons'&&x.polity!=='old_tracks'));
  if(!i)throw Error('Choose a genuine institution from the world atlas');
  if(options.homeRegion&&region.polity!==i.polity)
   throw Error('Institutional home region must be within its actual polity');
  region=pick(seed,'institution-region:'+i.id,candidateRegions(i.polity));
  const link=pick(seed,'institution-link',[
   'relative employed nearby','raised in a service household',
   'former introductory student','local supplier household']);
  connection={kind:'institution',institutionId:i.id,
   institutionName:i.name,relation:link,polity:i.polity,
   noEnrolment:true,noAppointment:true,noAccessToRestrictedMethods:true};
  history.upbringing='Family life intersected with '+i.name+
   ' through a '+link+'. Its ordinary civic purpose is '+i.specialty+'.';
  history.familySituation=f.household+'; '+f.ties+'; '+link+
   ' (not current employment or membership).';
 }else if(originKind==='new-family'){
  const local=Atlas.P[region.polity];
  f.familyIdentity={name:name.split(' ').at(-1)+' household',
   firstGenerationKnown:true,regionId:region.id,
   communityDuty:pick(seed,'family-work',[f.homeTrade,local.craft,
    'shared shelter upkeep','ordinary local provisions']),
   noHereditaryRank:true};
  history.upbringing='A locally established, newly authored '+f.household+
   ' supported itself through '+f.familyIdentity.communityDuty+
   ' in '+region.name+'.';
  history.familySituation=f.household+'; '+f.ties+
   '; no named dynasty, royal title or innate inherited power.';
  connection={kind:'new-family',familyName:f.familyIdentity.name,
   regionId:region.id,source:'Seeded original household relationships'};
 }else if(originKind==='new-organisation'){
  // An organisation only starts with this character as its own founder.
  // Other people can join later, through independently verified consent.
  const category=pick(seed,'organisation-kind',
    GROUP_WORDS[base.background]||GROUP_WORDS.apprentice);
  const groupName=options.groupName?
   textField(options.groupName,'Group name',80):
   (name.split(' ').at(-1)+' '+category);
  const purpose=options.groupPurpose?
   textField(options.groupPurpose,'Group purpose',220):
   'Coordinate independent '+base.background+' work and responsible '+
    (region.goods[0]||'local')+' stewardship';
  const groupKind=options.groupKind?
   textField(options.groupKind,'Group kind',70):category.toLowerCase();
  createdGroup={id:'origin_'+String(options.slug||'campaign').replace(/[^a-z0-9_-]/g,''),
   name:groupName,kind:groupKind,purpose};
  connection={kind:'new-organisation',name:groupName,
   role:'sole founding member of a locally declared informal association',
   noOtherMemberConsent:true,noOfficialLicence:true};
  history.upbringing='An ordinary '+f.homeTrade+
   ' background preceded a modest independent working association.';
  history.familySituation=f.household+'; '+f.ties+
   '; starting organisation has no established other members.';
 }else if(originKind==='community'){
  const pol=Atlas.P[region.polity];
  connection={kind:'community',regionId:region.id,
   polity:region.polity,culture:pol.culture,
   obligation:pol.rights,notAnOffice:true};
  history.upbringing='Known among the working communities of '+
   region.name+', where '+pol.customs;
 }else if(originKind==='independent'){
  f.household='independent household';
  connection={kind:'independent',regionId:region.id,
   ordinaryIndependence:true,notSocialIsolation:true};
  history.familySituation='Lives independently; existing family relations are not erased by independence.';
  history.upbringing='An independently supported life in '+region.name+
   ' shaped by local work and obligations.';
 }else{
  connection={kind:'ordinary',regionId:region.id,
   homeTrade:f.homeTrade,notAChosenOne:true};
  history.upbringing='An ordinary '+f.homeTrade+' household in '+region.name+
   '; '+Atlas.P[region.polity].customs;
 }
 if(!history.earlyWork)history.earlyWork='Early work and study in '+base.background+'; no invented professional qualification or supernatural rank.';
 if(options.goal!==undefined)history.personalGoal=textField(options.goal,'Personal goal',240);
 if(options.role!==undefined)history.ownOccupation=textField(options.role,'Occupation',100);
 const startRegion=Atlas.R[authoredRegion||Atlas.LOCATION_REGION[startLocation]];
 const context={version:1,seed:(Number(seed)>>>0),originKind,
  birthRegionId:region.id,birthRegionName:region.name,
  homePolity:region.polity,continent:region.continent,
  openingRegionId:options.gmOpening?startRegion.id:null,
  openingSite:options.gmOpening?startLocation:null,
  travelBeforePlay:options.gmOpening?region.polity!==startRegion.polity:false,
  connection,knownHouseholdMembers:f.members.map(m=>({name:m.name,relation:m.relation})),
  worldSource:'Authored Atlas and social-house history, or a seeded modest beginning',
  explicitOptions:Object.keys(options).filter(k=>!['slug'].includes(k)).sort(),
  noUnearnedPowers:true,noAutomaticNPCConsent:true,noAutomaticOffice:true};
 return {name,family:f,history,context,createdGroup};
}
function install(s,planned){
 if(!s?.campaign||!s.player||!planned?.context)
  throw Error('Only a newly initialised genuine campaign can install its own origin');
 s.player.family=structuredClone(planned.family);
 s.player.history=structuredClone(planned.history);
 s.player.startingContext=structuredClone(planned.context);
 s.campaign.origin=structuredClone(planned.context);
 if(planned.createdGroup){
  const group=planned.createdGroup,day=0;
  const event={day:0,time:'Before the first played scene',type:'story',
   text:'Before the first played scene, '+s.player.name+
    ' had declared the modest '+group.name+' working association.',
   details:{origin:'informal-player-group-founding',id:group.id,
    name:group.name,kind:group.kind,purpose:group.purpose,
    polity:planned.context.homePolity,
    founder:s.player.name,otherMembersConfirmed:false}};
  // This is a rolled, pre-game fact that the user asked to generate,
  // not an unconsented decision imposed during live play.
  const made=Groups.createPlayer(Realm.peek(s),{...group,
   founder:s.player.name,place:planned.context.birthRegionId,day,event});
  s.log.push(event);
  s.campaign.origin.connection.groupId=made.id;
  s.player.startingContext.connection.groupId=made.id;
 }
 OriginRelatives.install(s,Realm.peek(s));
 return s.player.startingContext;
}
module.exports={KINDS,NONHUMAN_HOUSES,prepare,install,number};
