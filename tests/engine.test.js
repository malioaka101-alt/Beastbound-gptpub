const assert=require('node:assert/strict');
const E=require('../engine.js');
function cmd(s,text){return E.dispatch(s,text)}
function run(){
 const rolled=E.randomCharacter(1254367);
 assert.deepEqual(rolled,E.randomCharacter(1254367),'random character reproduces same seed');
 assert(['apprentice','fieldworker','scholar','healer'].includes(rolled.background));
 assert(['undecided','meridian','arcane','origin','partner'].includes(rolled.path));
 let randomStart=E.newGame(rolled);
 assert.equal(randomStart.player.name,rolled.name);
 assert.equal(randomStart.player.age,rolled.age);
 assert.equal(typeof randomStart.flags.openingHook,'string');
 assert.deepEqual(randomStart,E.newGame(rolled),'random opening is deterministic');
 let s=E.newGame({name:'Tester',path:'undecided',seed:12345});
 assert.equal(s.player.partnerIds.length,0,'no forced pet');
 assert.equal(s.player.meridian.gates.length,0,'not granted opened gates');
 assert.equal(s.player.arcane.circles,0,'not granted constructed Circles');
 assert.equal(cmd(s,'arcane spark').ok,false,'no magic without circle or combat');
 assert.equal(cmd(s,'evolve').ok,false,'cannot evolve nonexistent beast');
 assert.equal(cmd(s,'travel ruins').ok,false,'route adjacency enforced');
 assert.equal(cmd(s,'quest accept wetland_census').ok,true,'guild quest registration');
 assert.equal(s.quests.wetland_census.status,'active');
 assert.equal(cmd(s,'travel forest').ok,true);
 assert.equal(cmd(s,'explore').ok,true);
 const b=s.beasts[s.encounter.beastId];assert(b);
 assert.equal(cmd(s,'invite').ok,false,'trust gate prevents coercive easy contract');
 assert.equal(cmd(s,'observe').ok,true);
 assert.equal(cmd(s,'leave').ok,true);
 assert.equal(s.encounter,null);
 assert.equal(cmd(s,'forage').ok,true);
 const exported=E.exportGame(s);const restored=E.importGame(exported);
 assert.deepEqual(restored,s,'JSON saves preserve entire state');
 assert.equal(E.exportGame(restored),exported,'save round trip deterministic');
 const a=E.newGame({seed:100,name:'A'}),bb=E.newGame({seed:100,name:'A'});
 for(const op of ['travel fen','explore','observe','approach','leave','forage','travel crossing','rest']){assert.equal(cmd(a,op).ok,cmd(bb,op).ok);}
 assert.deepEqual(a,bb,'deterministic seed and command replay');
 let p=E.newGame({name:'Pair',path:'partner',seed:999});const companion=p.beasts[p.player.partnerIds[0]];
 assert.equal(companion.consent,true);assert.equal(companion.relationship,'mutual partner');
 assert.equal(companion.syncStage,1);
 assert.equal(cmd(p,'compete partnership_trials').ok,true,'partner may enter consensual trial');
 assert.equal(p.player.competitionRecord.length,1);
 assert.equal(cmd(p,'train beast').ok,true);
 assert(companion.syncPractice>0);
 assert.equal(cmd(p,'evolve').ok,false,'evolution not granted from bond rank');
 assert.equal(cmd(p,'travel fen').ok,true);
 let m=E.newGame({path:'meridian',seed:123});for(let i=0;i<28;i++){if(i%5===4)cmd(m,'rest');cmd(m,'train meridian');}
 assert(m.player.meridian.stage>=2,'independent meridian stages train');
 assert(m.player.meridian.gates.length<=108);
 assert.equal(m.player.arcane.circles,0,'meridian training never changes Arcane Circle');
 let arc=E.newGame({path:'arcane',seed:987});assert.equal(cmd(arc,'train arcane').ok,false,'specialist facility required');
 cmd(arc,'travel academy');for(let i=0;i<15;i++){if(i%5===4)cmd(arc,'rest');cmd(arc,'train arcane');}
 assert(arc.player.arcane.circles>=1,'First Circle requires engineering practice');
 assert.equal(arc.player.meridian.gates.length,0,'Arcane circles do not unlock meridian gates');
 assert.equal(cmd(arc,'compete circle_exhibition').ok,true);
 assert.notEqual(arc.player.rankings.arcane,undefined);
 let origin=E.newGame({path:'origin',seed:72});assert.equal(cmd(origin,'train origin').ok,false,'clinic access required');
 cmd(origin,'buy sample');cmd(origin,'travel academy');for(let i=0;i<22;i++){if(i%5===4)cmd(origin,'rest');cmd(origin,'train origin');}
 assert(origin.player.origin.load<=origin.player.origin.capacity,'integration load never exceeds capacity');
 for(let i=0;i<700;i++){const entry=E.proceduralSpecies(i*37);assert(entry.ecology.diet);assert(entry.habitat);assert(entry.taxonomy.family);}
 assert.throws(()=>E.importGame(JSON.stringify({...s,player:{...s.player,meridian:{...s.player.meridian,gates:Array(109).fill({})}}})),/progression/);
 let c=E.newGame({seed:57});assert.equal(cmd(c,'competitions').ok,true);assert.equal(cmd(c,'craft field_poultice').ok,false);
 console.log('✓ 26+ mechanics, progression, deterministic replay, consent, save and taxonomy assertions passed');
}
run();