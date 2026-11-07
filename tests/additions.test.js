'use strict';
const assert=require('node:assert/strict');
const E=require('../engine.js');
const D=(s,c)=>E.dispatch(s,c);
function game(seed=256,path='partner'){return E.newGame({seed,name:'Test Researcher',background:'scholar',path});}
{
 const a=E.randomCharacter(1355150487),b=E.randomCharacter(1355150487);
 assert.deepEqual(a,b);assert.ok(a.family.household);assert(Number.isInteger(a.family.siblings));
 const s=E.newGame(a);assert.deepEqual(s.player.family,a.family);
 assert.equal(E.money(12.34),'12 T 3 F 4 S');
 assert.equal(E.money(0),'0 S');
 assert.equal(E.money(.5),'5 F');
 const old=E.newGame({name:'Prior Campaign',seed:34});
 old.engineVersion='0.2.0';delete old.researchProjects;delete old.documentedBranches;delete old.npcKnowledge;delete old.player.family;delete old.player.insightPoints;
 assert.equal(E.importGame(JSON.stringify(old)).player.name,old.player.name,'v0.2 save migrates');
 assert.deepEqual(E.importGame(E.exportGame(s)),s,'full v0.3 save round-trip');
}
{
 const s=game();const b=s.beasts[s.player.partnerIds[0]];
 assert.equal(E.branchesFor(s,b).length,3,'common and hidden routes exist separately');
 assert(!D(s,'branches').message.includes('Dreamreed'),'hidden route is not announced as catalogued');
 const hidden=E.branchesFor(s,b).find(x=>x.to==='dreamreed');assert.equal(hidden.requiredMaturity,2);
 assert.equal(hidden.unknownUnmet,true,'unknown conditions cannot be bypassed by raw stats');
 b.level=6;b.trust=80;b.syncStage=3;b.potential.evolution=90;
 s.documentedBranches['fenfox>dreamreed']=true;
 assert(D(s,'branches').message.includes('Dreamreed Fox'));
 const before=hidden.maturity;
 D(s,'travel academy');D(s,'rest');D(s,'rest');D(s,'rest');const after=E.branchesFor(s,b).find(x=>x.to==='dreamreed').maturity;
 assert(after>before,'world travel accrues real maturity');
 s.player.inventory.ripening_fruit=1;
 const r=D(s,'ripening');assert(r.ok,r.message);
 assert(E.branchesFor(s,b).find(x=>x.to==='dreamreed').maturity>=1);
 assert.equal(D(s,'ripening').ok,false,'max one ripening per season');
 assert.equal(s.player.inventory.ripening_fruit,undefined);
 const copy=E.importGame(E.exportGame(s));assert.deepEqual(copy,s,'ripening state survives export');
}
{
 let s=game(121,'undecided');
 assert.equal(D(s,'research start Murrain screen | method | 2 | variant').ok,true);
 const p=s.researchProjects.murrain_screen;
 assert.equal(p.dc,15);assert.equal(p.track,20);assert.equal(p.ipRequired,0);
 assert.equal(D(s,'research week murrain_screen').ok,false,'must survey first');
 assert.equal(D(s,'research survey murrain_screen').ok,true);
 const purse=s.player.coins,minute=s.world.minutes;
 assert.equal(D(s,'research week murrain_screen').ok,true);
 assert.equal(s.player.coins,purse-1,'Grade II costs 1 Talon per sixday');
 assert.equal(s.world.minutes,minute+6*1440,'research week advances six days');
 assert.equal(p.weeks,1);
 assert.equal(D(s,'research fieldwork murrain_screen').ok,false,'cannot farm fieldwork without real sightings');
 assert.equal(D(s,'research proof murrain_screen').ok,false,'cannot prove incomplete track');
 assert.equal(D(s,'research start New technique | technique | 3 | novel').ok,false,'novel requires Trained rank');
 s.player.skills.cultivation.rank=2;
 assert.equal(D(s,'research start New technique | technique | 3 | novel').ok,true);
 assert.equal(s.researchProjects.new_technique.dc,19);
 assert.equal(s.researchProjects.new_technique.track,35);
 assert.equal(s.researchProjects.new_technique.ipRequired,1);
 assert.equal(D(s,'research start New framework | discipline | 5 | breakthrough').ok,false,'breakthrough requires Expert rank');
 s.player.skills.research.rank=4;
 assert.equal(D(s,'research start New framework | discipline | 5 | breakthrough').ok,true);
 assert.equal(s.researchProjects.new_framework.dc,26);
 assert.equal(s.researchProjects.new_framework.track,65);
}
{
 const s=game(202);
 assert.equal(D(s,'research start Dreamreed Fox | evolution | 3 | rediscovery').ok,false,'rediscovery requires a credible source');
 s.world.location='ruins';
 assert.equal(D(s,'research start Dreamreed Fox | evolution | 3 | rediscovery').ok,true);
 const p=s.researchProjects.dreamreed_fox;
 assert.equal(p.track,20);assert.equal(p.dc,16);
 assert.equal(p.sealed.feasibility!==undefined,true,'feasibility is fixed at start');
 assert.equal(D(s,'research survey dreamreed_fox').ok,true);
}
{
 const s=game(339,'undecided');
 assert.equal(D(s,'knows Elira').ok,true);
 assert(D(s,'knows Elira').message.includes('no player-specific facts'));
 assert.equal(D(s,'talk Elira').ok,true);
 assert(D(s,'knows Elira').message.includes('direct conversation'));
 assert(E.coreHud(s).includes('╔'),'core panel is generated from live state');
 assert(E.recap(s).includes('SCENE:'),'recap contains pickup scene');
}
{
 const s=game(1000);
 s.player.inventory.ripening_fruit=1;
 const p=s.beasts[s.player.partnerIds[0]];
 const before=E.exportGame(s);
 assert.equal(D(s,'ripening').ok,true);
 assert.notEqual(E.exportGame(s),before,'meaningful action updates state');
 const other=game(1000);other.player.inventory.ripening_fruit=1;D(other,'ripening');
 assert.deepEqual(other,s,'seed + identical action sequence produces identical results');
}
console.log('✓ additions: research costs/tracks, consent, Maturity, family, knowledge, save upgrades, deterministic replay');