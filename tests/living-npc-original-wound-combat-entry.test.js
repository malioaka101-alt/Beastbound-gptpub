'use strict';
// A real, physically present NPC enters the EXISTING human wound combat owner.
// Only disposable engine worlds; no Maddoc save or invented supernatural rank.
const A=require('node:assert/strict'),
 E=require('../engine.js'),Rules=require('../rules'),
 R=require('../world/simulation'),P=require('../world/emergent-people'),
 Atlas=require('../world/atlas'),Build=require('../rules/build'),
 Combat=require('../rules/combat'),H=require('../rules/unified');
const s=E.newGame({seed:882114,name:'Disposable NPC Wound Combat'}),
 w=R.ensure(s),t=P.ensure(w),
 region=Atlas.regions.find(x=>P.siteFor(x.id)),
 eco=w.ecosystems[region.id],host=w.countries[region.polity];
eco.quality=75;eco.pressure=15;eco.water=75;eco.forage=80;
host.prosperity=75;host.stability=78;
const d=P.sourceDemand(w,region);
A.ok(d,'Causally warranted human requires original world demand');
let p=null;
for(let i=0;i<25;i++){
 const candidate=P._debug.make(w,t,0,d);
 if(candidate.mechanicalFoundation?.baselineAttributes.con>=7){p=candidate;break;}
}
A.ok(p,'A source-derived legal original Vigor/Stamina baseline exists');
const attrs=p.mechanicalFoundation.baselineAttributes,
 a=k=>Math.floor((attrs[k]-10)/2),
 derived=Build.humanStats({vigor:a('con'),agility:a('dex'),
  wits:a('wis'),will:a('wis'),might:a('str')},
  {skills:{Melee:0},size:'Medium'});
A.ok(derived.stamina>=0);
p.shift=P.shift(p,0,w);
A.ok(p.shift,'Original source-owned physical working presence');
s.world.location=P.siteFor(p.regionId);
s.world.minutes=10*60;
s.chatRuntime||={};
const witness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+
 s.world.location+', directly witnessed in this present physical scene.';
s.chatRuntime.scene='A witnessed village moment. '+witness;
const request={npcId:p.actorId,witness},input={system:'health',
 operation:'linkWitnessedHuman',params:request},
 original=E.exportGame(s),originalRng=s.rngState,originalClock=s.world.minutes;
for(const params of [
 {...request,toughness:99},
 {...request,stage:9},
 {...request,acceptance:true}
]){
 A.throws(()=>Rules.act(s,{...input,params}),/no stat selection/);
 A.equal(E.exportGame(s),original);
}
A.throws(()=>Rules.act(s,{...input,params:{
 ...request,witness:witness+' Invented only after the scene'}}),
 /current scene/);
A.equal(E.exportGame(s),original);
const created=Rules.act(s,input),id='npc_'+p.id;
A.equal(created.created,true);
A.equal(created.id,id);
A.equal(created.npcId,p.actorId);
A.equal(created.noRoll,true);
A.equal(created.noUnverifiedPowerOrGear,true);
const c=Combat.get(s,id);
A.equal(c.toughness,derived.toughness);
A.equal(c.defense,derived.defense);
A.equal(c.vigor,a('con'));
A.equal(c.will,a('wis'));
A.equal(c.maxStamina,derived.stamina);
A.equal(c.stamina,derived.stamina);
A.deepEqual(c.boxes,derived.boxes);
A.deepEqual(c.wounds,[0,0,0]);
A.equal(c.offM,0);A.equal(c.durM,0);
A.equal(c.sapience,null);
A.equal(c.npcOrigin.actorId,p.actorId);
A.equal(c.npcOrigin.individualOriginHash,p.originHash);
A.equal(c.npcOrigin.foundationSeal,p.mechanicalFoundation.seal);
A.equal(c.npcOrigin.originalShiftHash,p.shift.hash);
A.equal(c.npcOrigin.noInferredCombatRankTechniqueOrEquipment,true);
A.equal(s.table.healthModel,H.MODEL);
A.equal(s.rngState,originalRng,'NPC registry cannot roll new stats');
A.equal(s.world.minutes,originalClock,'NPC registry cannot advance time');
A.deepEqual(p.knownTechniques,[]);
A.deepEqual(p.practicedDisciplines,[]);
A.equal(s.player.meridian.stage,0);
A.equal(s.player.arcane.circles,0);
A.equal(s.player.coins,JSON.parse(original).player.coins);
const status=Rules.act(s,{system:'combat',operation:'status',params:{id}});
A.equal(status.combatant.name,p.name);
A.equal(Object.hasOwn(status.combatant,'toughness'),false,
 'The existing player-visible combat status must not reveal private NPC numbers');
// One actual original wound-model blow in an isolated engine fixture. This
// checks wound ownership; the public arbitrary-attack operation stays closed.
const impact=Combat.attack(s,{targetId:id,modifier:25,damage:15,
 brace:false,nonlethal:true});
A.equal(impact.hit,true);
A.ok(c.wounds.some(n=>n>0)||c.status!=='ok');
const woundState=structuredClone(c.wounds),woundedStatus=c.status;
const after=E.exportGame(s),rngAfter=s.rngState;
const repeat=Rules.act(s,input);
A.equal(repeat.created,false,'No reroll, relinking or healing an already identified person');
A.deepEqual(Combat.get(s,id).wounds,woundState);
A.equal(Combat.get(s,id).status,woundedStatus);
A.equal(s.rngState,rngAfter);
A.equal(E.exportGame(s),after,'A repeated physical read must not rewrite history');
const replay=E.importGame(after);
A.deepEqual(Combat.get(replay,id),c,'True original wound state survives full engine save replay');
A.equal(replay.table.healthModel,H.MODEL);
const player=H.ensurePlayer(replay);
A.equal(player.created,true);
A.deepEqual(Combat.get(replay,id),c,'Building the original player health record leaves NPC wounds unchanged');
for(const kind of ['recovering','relocated']){
 const clone=E.importGame(original),cw=R.peek(clone),cp=cw.emergentPeople.people[p.id];
 cp.status=kind;
 A.throws(()=>Rules.act(clone,input),/recovery or workplace injury/);
}
const injured=E.importGame(original),iw=R.peek(injured),ip=iw.emergentPeople.people[p.id];
ip.career.safetyIncidents.push({sourceHash:'unresolved_old_workplace_injury'});
A.throws(()=>Rules.act(injured,input),
 /Original source-sealed|Unresolved age|original living/,
 'An unresolved original workplace incident cannot be assumed clean');
const absent=E.importGame(original);
absent.world.location='crossing';
if(s.world.location!=='crossing')
 A.throws(()=>Rules.act(absent,input),/physical presence|scene/,
  'A distant person may not materialize in wound combat');
const legacy=E.importGame(original),lp=R.peek(legacy).emergentPeople.people[p.id];
lp.birthSource.mechanicalFoundationVersion=0;
A.throws(()=>Rules.act(legacy,input),/Original source-sealed/,
 'The original legacy birth source cannot gain a retroactive physical build');
console.log('Original NPC physical entry: exact existing human formulas, genuine current actor presence, original combat damage, no stat-selected ranks, no repeat-heal, source gates and save replay PASS');
