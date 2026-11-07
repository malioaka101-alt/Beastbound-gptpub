'use strict';
// Original Beastbound social geography, not a borrowed anime/manhwa cast.
// These newly-authored households belong to the EXISTING 24-state atlas.
// Membership, family descent, formal office, public influence, ancestry claims
// and actual supernatural power are deliberately DIFFERENT things.
const Atlas=require('./atlas');
const Crypto=require('node:crypto');
const Emergent=require('./emergent-groups');
const RAW=[
 // polity, id, name, type, public elder, publicly acknowledged relation,
 // relation, livelihood/authority, civic obligation, public dispute, tradition
 ['reedmarch','reedward','Reedward Ferry Kin','commoner lineage','Mara Reedward','Toven Reedward','daughter','canal passage and ferry craft','maintain refuge crossings for residents and unbonded beasts','ferry tariffs against open passage','river-engineering custom, no declared innate power'],
 ['reedmarch','fenwake','House Fenwake','landed house','Ilyen Fenwake','Saren Fenwake','nephew','canal locks and embankment land','fund flood repair and uphold the sanctuary charter','canal toll income against sanctuary access','recorded water-bound oath, not a verified inherited element'],
 ['reedmarch','marshglass','Marshglass Lineage','specialist family','Veyna Marshglass','Orin Marshglass','younger sibling','pattern diagnostics and laboratory apprenticeships','publish safe noninvasive lineage research','family confidentiality against open medical access','rare sensitivity claimed in an old register, clinically unproven'],
 ['reedmarch','reedcouncil','Reed Clan Families','clan federation','Tamis Reedhand','Evara Reedhand','cousin','reed beds, eel substitutes and netting','protect fisheries and common wetland use','commercial leases against shared harvest','generational reed craft, not a hereditary noble title'],
 ['asterwyn','goldbough','House Goldbough','court dynasty','Lady Mirenne Goldbough','Karel Goldbough','adult child','court administration and orchard estates','maintain roads and grain relief under crown law','court precedence against rural obligations','historic orchard cultivation patronage, no automatic bloodline ability'],
 ['asterwyn','briarhall','Briarhall Great House','great house','Edras Briarhall','Selene Briarhall','niece','orchard hospitals and medicinal acreage','honour public aid clauses in ancestral leases','healer access against private lineage records','registered medicinal constitution claims not individually diagnosed'],
 ['crownspine','stonepath','Stonepath Rescue Clan','rescue clan','Harric Stonepath','Ilen Stonepath','adult child','pass ropes and avalanche shelters','rescue travellers before resolving toll disputes','quarry traffic endangering cliff nests','high-altitude body craft, learned rather than automatically inherited'],
 ['saltleague','sailglass','Sailglass Merchant Family','merchant house','Irian Sailglass','Mavren Sailglass','cousin','harbour warehouses and trade letters','uphold multilingual trade arbitration','insurance debt and shipping access','traditional storm navigation, no intrinsic spell'],
 ['sahri_wells','firstcup','First Cup Custodian Kin','elected service kin','Nessa Firstcup','Aver Firstcup','sibling','well surveys and water accounts','share safe drinking water regardless of rank','well maintenance against powerful caravan merchants','trained water recognition; no innate rights to aquifers'],
 ['red_sultanate','redbanner','House Redbanner','court house','Samira Redbanner','Isran Redbanner','adult child','desert patrol supply and customs','respect restricted wild capture law','military quotas against caravan welfare','historic heat-ward exercise methods, not automatic magic'],
 ['stair_guilds','pathlight','Pathlight Caravan Clan','caravan clan','Zoran Pathlight','Miri Pathlight','cousin','route beacon repair and animal-safe freight','repay rescue debts across border crossings','escort costs against open public roads','Waystar route memory tradition'],
 ['pearl_bight','greenbloom','Greenbloom Orchard Family','landed cooperative','Ashet Greenbloom','Yara Greenbloom','adult child','pollinator orchards and medicine','preserve local forest and migrating pollinators','private acreage against sanctuary corridors','rare floral resonance is a claim requiring examination'],
 ['whitewake','icewake','Icewake Sea Clan','maritime clan','Ragna Icewake','Torva Icewake','sibling','boat construction and winter refuge','keep ice escape houses open even to strangers','fishing pressure against nonhuman sea treaties','cold acclimation taught through family training'],
 ['icehollow','starlens','Starlens Archivist Line','scholarly lineage','Malen Starlens','Iri Starlens','apprentice descendant','auroral archives and lenses','protect the migration sky records','scholarly secrecy against public warning','possible sky-sense ancestry without verified expression'],
 ['winter_court','boughroot','Boughroot Commons Families','forest households','Elda Boughroot','Tern Boughroot','adult child','winter forage and shared cabins','respect den routes and common timber','harvest demand against animal refuge','winter route skill passed through teaching'],
 ['frostmarch','coldgate','Coldgate Service House','frontier house','Derris Coldgate','Hale Coldgate','nephew','fortress supply and emergency permits','publish emergency ration accounts','military readiness against household displacement','no established supernatural inheritance'],
 ['cinder_free','emberhand','Emberhand Foundry Kin','artisan clan','Varek Emberhand','Nira Emberhand','adult child','basalt forge shifts and glass','maintain safe workshops and equal labour training','master patents against worker health','heat-tolerant working methods with documented injuries'],
 ['terrace_union','skybridge','Skybridge Terrace Households','communal lineage','Ema Skybridge','Ruan Skybridge','cousin','cliff gardens and suspended paths','protect glider aerie access','garden expansion against cliff sanctuaries','windrope and balance techniques, not levitation by surname'],
 ['ashglass_march','sealwarden','Sealwarden Frontier Line','specialist family','Kira Sealwarden','Idren Sealwarden','adult child','rift seals and evacuation records','keep refuge keys and evacuation maps available','research secrecy against public safety','reported boundary-sense trait, unsafe to assume active'],
 ['sunforge','goldflame','House Goldflame','princely house','Teren Goldflame','Calis Goldflame','cousin','solar-ore permits and weapon workshops','honour restrictions on strategic species','mine priority against protected habitat','reputed solar affinity, not a certified ability'],
 ['tide_assembly','tidecord','Tidecord Harbour Family','mariner kin','Lura Tidecord','Elven Tidecord','sibling','inter-island signal boats','honour sea-envoy seating and rescue accords','harbour fees against reef rights','current-reading craft learned with nonhuman teachers'],
 ['reef_cantons','shellsong','Shellsong Reef Kin','nonhuman lineage','Speaker Seel Shellsong','Speaker Iva Shellsong','descendant','reef signal gardens and coastal treaties','defend consent and autonomous reef territory','surface trawling against living reef boundaries','species-specific inherited biology, not human cultivation'],
 ['storm_peaks','rainspire','Rainspire Storm House','freehold family','Solven Rainspire','Tavira Rainspire','adult child','storm harbours and shelter ledges','maintain flying-beast rescue corridors','shipping schedules against nesting seasons','unconfirmed family storm-sense tales'],
 ['blackcurrent','deepwake','Deepwake Exchange Family','merchant house','Alin Deepwake','Isol Deepwake','cousin','harbour auctions and shipbuilding','keep arbitration and bonded labour contracts visible','secret contracts against labour reform','no verified special constitution'],
 ['grassroad','longtrail','Longtrail Pasture Kin','pastoral clan','Arven Longtrail','Tova Longtrail','sibling','herd-road coordination and grassland camps','negotiate passage with sapient herd elders','fences against seasonal grazing routes','trained animal signalling, not automatic bonding'],
 ['skyvillage','openpeak','Openpeak Scholar Households','independent family','Jerin Openpeak','Lia Openpeak','adult child','highland teaching and rescue bridges','keep independent students eligible for service','teaching privilege against free practice','family discipline manuals remain private, not auto-granted'],
 ['iron_citadel','redwall','Redwall Officer House','military house','Kaern Redwall','Mela Redwall','nephew','fort logistics and ore contracts','obey civil protections under security law','resource requisition against pasture rights','martial instruction traditions, no inherited combat bonus'],
 ['old_tracks','manytracks','Many Tracks Kin-Council','nonhuman kin council','Speaker Urra','Speaker Nem','chosen kin','living shelters and cross-species arbitration','defend voluntary agreement across species','border intrusion against personhood treaties','multiple species lineages; no assumption of blood relation']
];
const houses=RAW.map(([polity,id,name,kind,elder,relative,relation,role,duty,dispute,heritage])=>{
 if(!Atlas.P[polity])throw Error('House must belong to an actual existing state');
 return Object.freeze({
  id,polity,name,kind,elder,relative,relation,
  role,duty,dispute,heritage,
  politicalStatus:kind==='court dynasty'||kind==='princely house'?'court-affiliated':
   ['great house','landed house','frontier house','military house','court house'].includes(kind)?'landed or titled':'non-titled or autonomous',
  membershipRule:'kinship or actual agreement, never surname alone',
  authorityRule:'formal office requires a separately established appointment, not mere descent',
  source:'New Beastbound regional household authoring linked to existing world/atlas.js political charter'
 });
});
const byId=Object.freeze(Object.fromEntries(houses.map(h=>[h.id,h])));
// The authored households are SEEDS, not an exhaustive world family list.
function catalog(w,{publicOnly=false,day=Infinity}={}){
 return [...houses,...Emergent.all(w,{publishedOnly:publicOnly,day}).map(x=>x.charter)];
}
function lookup(w,id,options){return byId[id]||Emergent.lookup(w,id,options)?.charter||null;}

function seed(){
 const out={};
 for(const h of houses)out[h.id]={
  influence:32+(h.name.length*7)%35,publicPressure:22+(h.id.length*11)%41,
  projectProgress:0,cycles:0,lastChangeDay:0,
  publicMilestones:[],lastUpdated:0
 };
 return out;
}
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
function month(w,day,emit){
 w.houses||=seed();
 for(const h of houses){
  const a=w.houses[h.id]||(w.houses[h.id]=seed()[h.id]),
   host=w.countries[h.polity];
  if(!host)continue;
  const stable=host.stability>=50,rich=host.treasury>=45,
   upheaval=host.stability<35||host.treasury<25;
  const old=a.influence;
  a.influence=clamp(a.influence+(stable?1:-1)+(rich?1:0)-(upheaval?2:0));
  a.publicPressure=clamp(a.publicPressure+(upheaval?3:stable?-1:1));
  a.projectProgress++;
  a.lastUpdated=day;
  // A whole family remains an actor over time; one monthly increment never
  // creates an automatic enthronement, magical inheritance or free contract.
  if(a.projectProgress>=4){
   const previousReportDay=a.lastChangeDay;
   a.projectProgress=0;a.cycles++;a.lastChangeDay=day;
   // A periodic influence or revenue rise is not a completed family deed.
   // Check the durable original signed work receipt, even after rolling
   // reports have been trimmed over long campaigns.
   const proof=w.familyMembers?.houses?.[h.id]?.latestVerifiedDuty;
   const witnessed=proof?.witness;
   const verified=!!(proof&&witnessed&&
    proof.day>previousReportDay&&proof.day<=day&&
    witnessed.day===proof.day&&witnessed.id===proof.id&&
    witnessed.houseId===h.id&&witnessed.kind==='verified-family-duty'&&
    witnessed.details?.passed===true&&
    proof.hash===Crypto.createHash('sha256')
     .update(JSON.stringify(witnessed)).digest('hex'));
   const outcome=verified?
    'reports documented practical progress toward its public duty':
    a.publicPressure>66?'requests a public hearing on its unresolved duty':
      'renews a public appeal for help with its established duty';
   const detail={day,outcome,cycle:a.cycles};
   a.publicMilestones.push(detail);
   if(a.publicMilestones.length>12)a.publicMilestones.shift();
   if(typeof emit==='function')emit({
    day,region:h.polity,subject:'house:'+h.id,
    text:h.name+' '+outcome+': '+h.duty+'.',
    channel:'public notice',releaseDay:day+3,severity:'routine'
   });
  }
 }
}
function deliver(s,w,day,random){
 const ledger=s.table?.socialFabric,letters=ledger?.letters;
 if(!Array.isArray(letters)||!letters.length)return 0;
 let replied=0;
 for(const letter of letters){
  if(letter.state!=='sent'||day<letter.nextReplyDay)continue;
  const h=lookup(w,letter.houseId),standing=w.houses?.[letter.houseId];
  if(Emergent.lookup(w,letter.houseId)?.origin==='player-declaration')continue;
  if(!h||!standing||!Number.isInteger(letter.postedAtMinute)||
     !['Witnessed local guild registrar correspondence about a known public household',
       'Witnessed noninvasive field report submitted to a chartered local household'].includes(letter.source))
   continue;
  // The family acts off-screen; the player does not decide what it says.
  const coin=random(),pressure=standing.publicPressure,influence=standing.influence;
  let answer;
  if(letter.purpose==='field_report'){
   // A good report may be valued or rejected. It is a household decision,
   // not player-selected reputation or a hidden second fieldwork roll.
   const worthy=letter.source==='Witnessed noninvasive field report submitted to a chartered local household'&&
      ['success','strong','exceptional'].includes(letter.degree)&&
      ['fenwake','reedcouncil','reedward'].includes(h.id);
   const accept=worthy&&coin>=0.30+(standing.publicPressure<30?0.15:0);
   letter.review=accept?'accepted':'declined';
   answer=accept?
     'The household acknowledges the documented ecological field report as a useful public contribution, without offering kinship, office or teaching.':
     'The household records the ecological report but does not recognize it as qualifying civic service at present.';
  }else if(letter.purpose==='request_history'){
   answer=h.source===Emergent.SOURCE_PLAYER||h.source===Emergent.SOURCE_NPC?
    'Only the actual published association origin and its named consenting founder are known. Other individuals’ kinship, inheritance, special power and claimed membership are not certified by this public notice.':
    coin>=0.22?'The family acknowledges the request for public genealogy and directs the inquirer to its filed charter; private origins and alleged abilities require consent and independent evidence.':
    'The family archive cannot provide a public copy this season; it does not disclose its private genealogy.';
  }else if(letter.purpose==='offer_service'){
   answer=pressure>=40&&coin>=0.3?
    'The household records the offer and asks for verifiable civic work relevant to its stated obligations, without promising employment or membership.':
    'The household has no documented opening and declines the work offer without prejudice.';
  }else if(letter.purpose==='request_audience'){
   answer=influence>=45&&coin>=0.65?
    'The family acknowledges the approach and suggests seeking an ordinary public hearing; no private audience has been agreed.':
    'The family declines a private introduction at present; public council channels remain open.';
  }else continue;
  letter.state='held_at_registry';
  letter.response=answer;
  letter.responseDay=day;
  letter.houseCycle=standing.cycles;
  letter.responseOrigin='Independent world-sixday household correspondence';
  replied++;
 }
 return replied;
}
module.exports={houses,byId,catalog,lookup,seed,month,deliver};
