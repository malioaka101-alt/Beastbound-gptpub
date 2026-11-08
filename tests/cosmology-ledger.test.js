'use strict';
// The GM authors realms and metaphysics. The engine retains sourced facts,
// does not expose GM-only secrets and never invents portals, blessings,
// resurrection, transit, powers or independent NPC decisions.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Engine=require('../engine'),New=require('../scripts/new-campaign'),Rules=require('../rules');
const World=require('../world/simulation'),Mythic=require('../world/mythic');
const Cosmos=require('../world/cosmology-ledger'),Turn=require('../scripts/chat-turn');
const Place=require('../world/lived-places');
const create=(seed=890123)=>New.create({seed,slug:'cosmology_fixture_001',
 mode:'gm',age:27,gmOpening:{locationId:'ruins',
 scene:'A survey slate rests outside the Riftglass wardline. Two independent wardens inspect old bolts without permitting anyone to enter the sealed observatory.',
 focus:'Public survey outside the wardline',weather:'dry wind',hour:9,minute:20}}).state;
const s=create();
const original=Engine.exportGame(s),rng=s.rngState,coins=s.player.coins;
const empty=Rules.act(s,{system:'world',operation:'cosmologyStatus',params:{}});
A.equal(empty.planes.length,Mythic.REALMS.length);
A.equal(empty.publicBoundaries.length,Cosmos.EXEMPLARS.length);
A.ok(empty.planes.every(x=>x.publicTradition===true));
A.ok(empty.planes.some(x=>x.name==='The Spirit Veil'));
A.ok(empty.planes.some(x=>x.name==='The Far Courts'));
A.ok(empty.publicBoundaries.every(x=>x.noProvenPassage===true));
A.equal(Engine.exportGame(s),original);
A.equal(s.rngState,rng);
A.equal(Object.keys(World.peek(s).mythic).length,Mythic.SITES.length,
 'Cosmology expands the existing realm model, without rewriting site tick records');
A.equal(Cosmos.validate(World.peek(s).cosmology,s),true);
const old=Engine.importGame(Engine.exportGame(s));
delete old.table.realm.cosmology;
const preOld=Engine.exportGame(old);
A.equal(Rules.act(old,{system:'world',operation:'cosmologyStatus',params:{}}).planes.length,5);
A.equal(Engine.exportGame(old),preOld,'Old saves remain read-only until a real authored event');
const hidden={planeId:'silent_reach_01',name:'The Silent Reach',category:'other',
 description:'A GM-established inaccessible deep realm whose true coordinates remain sealed.',
 visibility:'gm-only'};
const made=Rules.act(s,{system:'world',operation:'cosmologyAuthorPlane',params:hidden});
A.equal(made.recorded,true);A.equal(made.playerKnown,false);
A.equal(s.player.coins,coins);A.equal(s.world.location,'ruins');
A.equal(Rules.act(s,{system:'world',operation:'cosmologyStatus',params:{}}).planes.length,5);
A.equal(Rules.act(s,{system:'world',operation:'cosmologyStatus',
 params:{planeId:hidden.planeId}}).known,false);
A.ok(!s.log.some(e=>e.text.includes('Silent Reach')),
 'A sealed cosmology does not become player-known through event logs');
A.throws(()=>Rules.act(s,{system:'world',operation:'cosmologyAuthorPlane',params:hidden}),/already established/);
A.throws(()=>Rules.act(s,{system:'world',operation:'cosmologyAuthorPlane',
 params:{...hidden,freeSpell:'automatic'}}),/only witnessed/);
const trueLaw=Rules.act(s,{system:'world',operation:'cosmologyRecordFact',
 params:{planeId:hidden.planeId,domain:'soul-boundaries',kind:'law',
  statement:'Soul impressions cannot make a living visitor physically present without a separately established mechanism.',
  basis:'GM-established underlying realm behaviour consistent with the originating world and Soul discipline.',
  visibility:'gm-only'}});
A.equal(trueLaw.recorded,true);
A.ok(!s.log.some(e=>e.text.includes('Soul impressions')),
 'GM-only realm law never enters the public chronicle');
A.throws(()=>Rules.act(s,{system:'world',operation:'cosmologyRecordFact',
 params:{planeId:hidden.planeId,domain:'soul-boundaries',kind:'law',
 statement:'Visitors are not automatic ghosts or gods just for looking inside.',
 basis:'A law authored privately before any player discovery.',visibility:'public'}}),/sealed plane/);
const account={planeId:'spirit',domain:'afterlife-beliefs',kind:'disputed',
 statement:'The riverfolk tell different stories about whether a remembered voice is the deceased or a Vael echo.',
 basis:'Existing River Memory traditions and disputed surviving public testimony.',
 visibility:'public'};
const story=Rules.act(s,{system:'world',operation:'cosmologyRecordFact',params:account});
A.equal(story.playerKnown,true);
A.equal(Rules.act(s,{system:'world',operation:'cosmologyRecordFact',params:account}).alreadyRecorded,true);
A.ok(Rules.act(s,{system:'world',operation:'cosmologyStatus',
 params:{planeId:'spirit'}}).plane.facts.some(f=>f.kind==='disputed'));
const otherFact=Rules.act(s,{system:'world',operation:'cosmologyRecordFact',
 params:{planeId:'liminal',domain:'boundary-shear',kind:'hypothesis',
  statement:'Some scholars suspect that high-pressure rift exposure bends local light without permitting transit.',
  basis:'The publicly observed Riftglass anomalies and competing survey theories.',
  visibility:'public'}});
A.equal(otherFact.recorded,true);
const myth=Rules.act(s,{system:'world',operation:'cosmologyBoundaryStatus',
 params:{boundaryId:'riftglass_wardline'}});
A.equal(myth.known,true);A.equal(myth.boundaryOpenProven,false);
A.equal(myth.entryPermitted,false);
A.equal(myth.actorHasSafeRoute,false);
A.equal(myth.observation,null);
A.equal(myth.site,'Riftglass Lantern Vault');
A.throws(()=>Rules.act(s,{system:'world',operation:'cosmologyObserveBoundary',
 params:{boundaryId:'riftglass_wardline',observed:'open',
 account:'I claim the ward is open and have safely crossed.'}}),/visible phenomenon/);
const signs=Rules.act(s,{system:'world',operation:'cosmologyObserveBoundary',
 params:{boundaryId:'riftglass_wardline',observed:'unverified',
 account:'The wardstones are visible from the outside, but no open threshold or safe route is observed.'}});
A.equal(signs.observed,true);
const later=Rules.act(s,{system:'world',operation:'cosmologyBoundaryStatus',
 params:{boundaryId:'riftglass_wardline'}});
A.equal(later.observation.observed,'unverified');
A.equal(later.entryPermitted,false);
const sealedCopy=Engine.importGame(Engine.exportGame(s));
sealedCopy.table.realm.mythic.riftglass_vault.phase='unstable';
A.throws(()=>Rules.act(sealedCopy,{system:'world',operation:'cosmologyObserveBoundary',
 params:{boundaryId:'riftglass_wardline',observed:'quiet',
 account:'The dangerous ward is completely calm even though independent conditions say otherwise.'}}),/cannot be described as quiet/);
A.equal(s.table.realm.mythic.riftglass_vault.phase,'quiet');
const newPhysicalPlace={placeId:'whispered_stone_niche',
 name:'Whispered Stone Niche',regionId:'riftglass',
 kind:'rift-adjacent rocky niche',sceneType:'wilderness',
 description:'A narrow rock niche in the foothills contains a ring of weathered stones above the outpost boundary.',
 culture:'Nearby workers avoid walking beneath the pale stone arch during unstable pressure.'};
Place.establish(s,newPhysicalPlace);
const custom=Rules.act(s,{system:'world',operation:'cosmologyAuthorBoundary',
 params:{boundaryId:'stone_niche_threshold',name:'Stone Niche Threshold',
 planeId:hidden.planeId,siteId:newPhysicalPlace.placeId,
 description:'A very faint inward resonance is heard beneath the stones; whether it leads anywhere is unknown.',
 visibility:'gm-only'}});
A.equal(custom.recorded,true);
A.equal(Rules.act(s,{system:'world',operation:'cosmologyBoundaryStatus',
 params:{boundaryId:'stone_niche_threshold'}}).known,false);
A.throws(()=>Rules.act(s,{system:'world',operation:'cosmologyObserveBoundary',
 params:{boundaryId:'stone_niche_threshold',observed:'quiet',
 account:'The rock niche shows no visible shear or instability.'}}),/only at its real established local place/);
const beforeJourney=s.world.minutes;
const travel=Rules.act(s,{system:'world',operation:'travelTo',params:{
 destinationId:newPhysicalPlace.placeId,minutes:55,
 journey:'The surveyed track from Riftglass Outpost to the stone niche is uneventful and lies within the same observed foothills.',
 uncontested:true,means:'walking'}});
A.equal(travel.arrived,true);
A.equal(s.world.minutes,beforeJourney+55);
A.equal(s.player.coins,coins);
const observation=Rules.act(s,{system:'world',operation:'cosmologyObserveBoundary',
 params:{boundaryId:'stone_niche_threshold',observed:'quiet',
 account:'The pale stone is still to the senses on this visit, although there is no witnessed doorway.'}});
A.equal(observation.observed,true);
A.equal(Rules.act(s,{system:'world',operation:'cosmologyBoundaryStatus',
 params:{boundaryId:'stone_niche_threshold'}}).known,false);
const saved=Engine.importGame(Engine.exportGame(s));
A.equal(Cosmos.validate(saved.table.realm.cosmology,saved),true);
A.equal(saved.table.realm.cosmology.boundaries.stone_niche_threshold.observations.length,1);
const tampered=Engine.importGame(Engine.exportGame(s));
tampered.table.realm.cosmology.planes.spirit.facts[0].statement='Falsified divine command';
A.throws(()=>Cosmos.status(tampered,{}),/coherent facts/);
const forged=Engine.importGame(Engine.exportGame(s));
forged.table.realm.cosmology.boundaries.stone_niche_threshold.description='A guaranteed free gate';
A.throws(()=>Cosmos.boundaryStatus(forged,{boundaryId:'riftglass_wardline'}),/founding source/);
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-cosmos-ledger-'));
try{
 const file=Path.join(dir,'campaign.json'),fixture=create(890124);
 FS.writeFileSync(file,Engine.exportGame(fixture)+'\n');
 const beforeRead=FS.readFileSync(file,'utf8');
 const q={id:'cosmos_view_001',mode:'rule',
  system:'world',operation:'cosmologyStatus',params:{}};
 const first=Turn.execute(file,q);
 A.equal(first.ok,true);A.equal(first.applied,false);
 A.equal(FS.readFileSync(file,'utf8'),beforeRead);
 const createPlane={id:'cosmos_author_001',mode:'rule',system:'world',
  operation:'cosmologyAuthorPlane',params:{planeId:'windfold_expanse',
   name:'Windfold Expanse',category:'liminal',
   description:'A newly GM-authored region of unsettled elemental echoes with no known mortal approach.',
   visibility:'public'}};
 const a=Turn.execute(file,createPlane);
 A.equal(a.applied,true);
 const during=FS.readFileSync(file,'utf8');
 const repeated=Turn.execute(file,createPlane);
 A.equal(repeated.duplicate,true);A.equal(FS.readFileSync(file,'utf8'),during);
 const bound=Turn.execute(file,{id:'cosmos_boundary_001',mode:'rule',
  system:'world',operation:'cosmologyBoundaryStatus',
  params:{boundaryId:'riftglass_wardline'}});
 A.equal(bound.applied,false);
 A.equal(bound.output.rules.entryPermitted,false);
 const carried=Engine.importGame(during);
 A.equal(carried.table.realm.cosmology.planes.windfold_expanse.name,'Windfold Expanse');
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Cosmology: Mythic-linked expandable planes, GM-authored private/public laws, physical thresholds, authentic local observations and original world ticks persist without free portals, blessings or hidden lore leaks.');
