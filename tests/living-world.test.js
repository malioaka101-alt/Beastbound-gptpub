'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const E=require('../engine'),R=require('../rules'),W=require('../rules/world'),A=require('../world/atlas'),B=require('../world/bestiary'),S=require('../world/simulation');
const Turn=require('../scripts/chat-turn');
const Passage=require('./time-passage-fixture');
let assertions=0;const eq=(x,y,msg)=>{assert.deepEqual(x,y,msg);assertions++;};
const ok=(x,msg)=>{assert.ok(x,msg);assertions++;};
const names=(arr)=>arr.map(x=>x.id);
// Source requirements: linked continents and cultures; no Jory campaign imports.
eq(A.continents.length,6);eq(A.polities.length,24);eq(A.institutions.length,48);eq(A.regions.length,29);eq(A.tradeRoutes.length,19);
for(const collection of [A.continents,A.polities,A.institutions,A.regions])eq(new Set(names(collection)).size,collection.length);
for(const p of A.polities){ok(A.safeLookup('continent',p.continent));ok(A.safeLookup('culture',p.culture));ok(A.safeLookup('institution',p.leadInstitution));ok(A.safeLookup('polity',p.ally));ok(A.safeLookup('polity',p.rival));}
for(const r of A.regions){ok(A.safeLookup('polity',r.polity));for(const n of r.neighbors||[])ok(A.safeLookup('region',n),'Undocumented neighbour '+n);}
for(const i of A.institutions)ok(A.safeLookup('polity',i.polity));
for(const route of A.tradeRoutes){ok(A.safeLookup('polity',route.a));ok(A.safeLookup('polity',route.b));}
eq(A.LOCATION_REGION.crossing,'morrowfen_basin');eq(A.R.whisperfen.biome,'wetland');
const atlasText=JSON.stringify(A.ATLAS||A);
ok(!/Jory Larkin|Wren Ashby|Sorrel|Greywold|North gate post/.test(atlasText));
// Demand-generated forms have unique stable identifiers and credible local habitats.
eq(B.verify(),{groups:26,speciesSlots:239616,regionalFormSlots:718848});
let seen=new Set();
for(const g of B.GROUPS){
 eq(g.habitats.length,4);eq(g.morphs.length,6);eq(g.strategies.length,8);
 for(let r=0;r<4;r++)for(let j=0;j<4;j++){
  const id=`tx:${g.id}:${r}:${j*9}:${j*13}:0`,t=B.lookup(id);
  eq(t.id,id);eq(t.biome,[g.habitats[r]]);ok(t.role.includes(g.role));ok(t.mechanism.includes(g.mechanism));
  ok(t.taxonomy.family===g.family);seen.add(id);
 }
}
eq(seen.size,26*4*4);
for(const biome of new Set(A.regions.map(x=>x.biome))){
 const c=B.localCandidates(biome);ok(c.length>0,'No ecological clade for '+biome);
 for(let k=0;k<25;k++){
  const x=B.sample(biome,k*271+10);eq(x.biome,[biome]);ok(['common','uncommon','rare'].includes(x.rarity));
  eq(B.lookup(x.id),x);ok(Array.isArray(x.knownEvolutionBranches)&&!x.knownEvolutionBranches.length);
 }
}
const authored=B.lookup('authored:fenfox');eq(authored.name,'Lanternfen Fox');ok(authored.canonical);
assert.throws(()=>B.lookup('tx:reedfox:4:0:0:0'),/Invalid/);assertions++;
assert.throws(()=>B.lookup('tx:reedfox:0:36:0:0'),/outside/);assertions++;
// Calendar has 360 working days + five Concord Days, then resets on year 2.
eq(W.calendarTicks(0,365).sixdays.length,60);eq(W.calendarTicks(0,365).months.length,12);
eq(W.calendarTicks(360,5),{sixdays:[],months:[]});
eq(W.calendarTicks(365,30),{sixdays:[371,377,383,389,395],months:[395]});
eq(W.dateText(W.addDate({year:1147,month:12,day:30},1)),'Concord Day 1 1147 AC');
eq(W.dateText(W.addDate({year:1147,month:13,day:5},1)),'1 Deepfrost 1148 AC');
const virgin=E.newGame({name:'No Date',seed:17});eq(S.calendar(virgin).absoluteDate,null);
eq(S.synopsis(virgin).backgroundProfessionals,48);ok(!virgin.table?.realm,'Read-only synopsis must not initialise save');
// World tick uses its own RNG and never changes player's dice state.
const rngState=virgin.rngState;S.tick(virgin,[6,12,18,24,30],[30]);eq(virgin.rngState,rngState);
eq(virgin.table.realm.ticks,{sixdays:5,months:1});eq(virgin.table.realm.countries.reedmarch.regime,'council');
const serialized=E.exportGame(virgin);const loaded=E.importGame(serialized);eq(loaded.table.realm,virgin.table.realm);
const savedWorld=JSON.stringify(loaded.table.realm);eq(S.tick(loaded,[6,12,18,24,30],[30]).sixdays,0);eq(JSON.stringify(loaded.table.realm),savedWorld);
const status=S.publicStatus(loaded);eq(status.region,'Morrowfen Basin');eq(status.polity,'Reedmarch Compact');
ok(status.knownInstitutions.includes('Naturalists Guild'));
const panel=require('../panels').full(loaded,'world');
ok(panel.includes('Reedmarch Compact'));ok(panel.includes('Naturalists Guild'));
ok(panel.split('\n').every(x=>Array.from(x).length===34));
const publicText=JSON.stringify(status);ok(!/rngState|military|treasury|tension|sealedChronicle|warExhaustion|Iri Stonepath/.test(publicText));
eq(S.publicProfessionals(loaded).people.length,0);
const known=S.revealProfessional(loaded,{id:'reedmarch_civic',channel:'guild notice',source:'Introduced at the public guild hall'});
ok(known.known);eq(S.publicProfessionals(loaded).people.length,1);ok(!JSON.stringify(S.publicProfessionals(loaded)).includes('trainingPoints'));
assert.throws(()=>S.revealProfessional(loaded,{id:'reedmarch_field',source:'unfounded',channel:'witnessed'}),/credible source/);assertions++;
const p=S.publicAtlas(loaded,{type:'polity',id:'reedmarch'});eq(p.capital,'Morrowfen Crossing');eq(p.rights,'river sanctuary charter');
const ins=S.publicAtlas(loaded,{type:'institution',id:'lumenfall_annex'});eq(ins.name,'Lumenfall Annex');
const before=JSON.stringify(loaded);S.publicNews(loaded);S.publicEconomy(loaded);S.publicAtlas(loaded,{type:'region',id:'whisperfen'});eq(JSON.stringify(loaded),before);
// News from across the sea cannot appear locally before a courier arrives.
const message='The distant basin council has closed the eastern salt passage.';
S.revealNews(loaded,{text:message,region:'sahri_wells',channel:'courier',source:'Signed foreign trade dispatch',lag:10});
ok(!JSON.stringify(S.publicNews(loaded,{channel:'courier'})).includes(message));
W.advance(loaded,11);
ok(JSON.stringify(S.publicNews(loaded,{channel:'courier'})).includes(message));
ok(!JSON.stringify(S.publicNews(loaded,{channel:'local'})).includes(message));
// A real field survey establishes source-attributed, biome-compatible sightings.
const l1=E.newGame({name:'Field notes',seed:10023});const l2=E.newGame({name:'Field notes',seed:10023});
const v1=S.observe(l1,{minutes:40,source:'A direct witnessed observation from the guild field route'});
const v2=S.observe(l2,{minutes:40,source:'A direct witnessed observation from the guild field route'});
eq(v1,v2);eq(l1.table.realm.knownSights.length,1);eq(l1.world.minutes,520);
eq(S.knownTaxon(l1,{id:v1.id}).knownEvolutionBranches,[]);
assert.throws(()=>S.knownTaxon(l1,{id:'tx:moonmoth:0:0:0:0'}),/has not been identified/);assertions++;
// A sourced anchor is a one-way historical commitment, never Jory's implied date.
const anchored=E.newGame({name:'Dated Test',seed:99});
S.anchorCalendar(anchored,{date:{year:1234,month:9,day:3},source:'Guild calendar checked against three dated records'});
eq(S.calendar(anchored).absoluteDate,'3 Migration 1234 AC');
assert.throws(()=>S.anchorCalendar(anchored,{date:{year:1147,month:9,day:3},source:'Another record'}),/already anchored/);assertions++;
// Game integration: a read-only status doesn't mutate checkpoint, while sixdays
// from an actual player action commit exactly once across save/reload.
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bb-realm-')),file=path.join(dir,'sandbox.json');
try{
 const ar=E.importGame(fs.readFileSync(path.join(__dirname,'../saves/aerin_marsh.json'),'utf8'));
 const original=E.exportGame(ar);fs.writeFileSync(file,original+'\n');
 const beforeFile=fs.readFileSync(file,'utf8');
 const query=Turn.execute(file,{id:'realm_query_001',mode:'rule',system:'world',operation:'realmStatus'});
 eq(query.applied,false);eq(query.output.rules.region,'Morrowfen Basin');eq(fs.readFileSync(file,'utf8'),beforeFile);
 const init=Turn.execute(file,{id:'realm_init_0001',mode:'rule',system:'world',operation:'realmInit'});
 ok(init.applied);eq(init.output.rules.continents,6);
 const stored=E.importGame(fs.readFileSync(file,'utf8'));ok(stored.table.realm);
 const baseline=fs.readFileSync(file,'utf8');
 assert.throws(()=>Turn.execute(file,{id:'realm_free_skip_0001',mode:'rule',
  system:'world',operation:'advance',params:{days:30}}),/only a precommitted passageId/);assertions++;
 eq(fs.readFileSync(file,'utf8'),baseline);
 // World calendar reference: five DISTINCT, pre-observed supplied local
 // sixdays, not a free request to skip a month of obligations.
 stored.player.inventory.clean_rations=30;fs.writeFileSync(file,E.exportGame(stored)+'\n');
 let last=null;
 for(let i=0;i<5;i++){
  const scene=E.importGame(fs.readFileSync(file,'utf8'));
  Passage.record(scene,'realm_wait_000'+i,6);
  fs.writeFileSync(file,E.exportGame(scene)+'\n');
  last={id:'realm_advance_000'+i,mode:'rule',
   system:'world',operation:'advance',params:{passageId:'realm_wait_000'+i}};
  const next=Turn.execute(file,last);
  eq(next.applied,true);eq(next.output.rules.elapsedDays,6);
  eq(next.output.rules.worldSimulation.sixdays,1);
 }
 const migrated=E.importGame(fs.readFileSync(file,'utf8'));
 eq(migrated.table.realm.ticks.sixdays,5);eq(migrated.table.realm.ticks.months,1);
 eq(migrated.player.inventory.clean_rations,undefined);
 const checkpoint=fs.readFileSync(file,'utf8');
 const again=Turn.execute(file,last);
 eq(again.duplicate,true);eq(fs.readFileSync(file,'utf8'),checkpoint);
 const wrong=Turn.execute(file,{...last,params:{days:90}});
 eq(wrong.applied,false);eq(fs.readFileSync(file,'utf8'),checkpoint);
 eq(E.exportGame(E.importGame(fs.readFileSync(path.join(__dirname,'../saves/aerin_marsh.json'),'utf8'))),original);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
// Long-run stress: wars, ceasefires, regular mandates, trade, institution
// rises/falls and habitat indicators must be stable, bounded and reproducible.
for(const seed of [5,99]){
 const a=E.newGame({seed}),b=E.newGame({seed});W.advance(a,3650);W.advance(b,3650);
 eq(a.table.realm,b.table.realm);
 const z=a.table.realm;eq(z.ticks.sixdays,600);eq(z.ticks.months,120);
 ok(z.counters.wars>0);ok(z.counters.peaceTreaties>0);ok(z.counters.changesOfGovernment>0);
 ok(z.counters.closures>0);ok(z.counters.reopenings>0);ok(z.counters.ecosystemWarnings>0);
 ok(z.chronicle.length<=200);ok(z.sealedChronicle.length<=200);
 for(const n of Object.values(z.countries))for(const key of ['stability','prosperity','legitimacy','treasury','military'])ok(n[key]>=0&&n[key]<=100);
 for(const n of Object.values(z.institutions))ok(['active','suspended'].includes(n.status));
 for(const n of Object.values(z.ecosystems)){
  ok(n.pressure>=0&&n.pressure<=100);ok(n.quality>=0&&n.quality<=100);
  for(const k of Object.values(n.indicators))ok(k.population>=0&&k.population<=200);
 }
 for(const n of Object.values(z.notables)){
  ok(n.professional.rank<=3,'A skill rank-4 trial must never be granted off-screen without verification');
  ok(n.discipline.stage===0,'Power breakthroughs cannot be rolled by generic elapsed-time advancement');
 }
}
console.log('Living Realms tests passed — '+assertions+' assertions across taxonomy, 365-day calendar, local ecology, policy, hidden knowledge, deterministic replay and long-run simulation');