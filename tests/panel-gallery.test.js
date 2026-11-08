'use strict';
const assert=require('node:assert/strict');
const E=require('../engine.js'),P=require('../panels.js');
// Synthetic legacy-format character: no player campaign checkpoint dependency.
const clean=E.newGame({seed:47731,name:'Fixture Tester',background:'fieldworker',path:'meridian',randomStart:true});
clean.flags.openingHook='A damp field notice asks for volunteers to survey a damaged reed bank. Nobody has signed it yet.';
const is34=p=>{for(const line of p.split('\n'))assert.equal(Array.from(line).length,34,JSON.stringify(line));};
// Exact-width visual regression: match the balanced section framing
// in the user's gallery, including the small trailing dash.
assert.equal(P.section('GUILD NOTICE','unsigned'),'╟─ GUILD NOTICE ────── unsigned ─╢');
assert.equal(P.section('MIRAGE FOX KIT','settling'),'╟─ MIRAGE FOX KIT ──── settling ─╢');
assert.equal(P.section('NOW'),'╟─ NOW ──────────────────────────╢');
is34(['╔═ FIXTURE · DAY 1 ══════════════╗',P.section('EVOLUTIONARY BRANCH','unconfirmed'),'╚════════════════════════════════╝'].join('\n'));
const core=P.core(clean);
is34(core);assert.match(core,/FIXTURE · DAY 1/);assert.match(core,/STA  ██████████/);assert.match(core,/Morrowfen Crossing/);
assert.match(core,/Damaged reed-bank notice/);assert.doesNotMatch(core,/Sorrel|JORY|WREN/);
assert.equal(core.split('\n').filter(x=>x.includes('╟─ NOW')).length,1);
for(const name of ['menu','status','character','tamer','quests','bag','people','world','journal','research'])is34(P.full(clean,name));
assert.match(P.full(clean,'menu'),/Type \/panel and a name/);
assert.match(P.full(clean,'character'),/●●○○○/);
assert.match(P.full(clean,'status'),/╠═/);
const woundState=E.importGame(clean);woundState.table={healthModel:'wounds-v1',combatants:{player:{wounds:[1,0,0],boxes:[3,2,1],status:'ok'}}};
is34(P.core(woundState));assert.match(P.core(woundState),/Wounds L ■□□ S □□ C □/);
const extras=P.core(clean,[{title:'FIELD REPORT',hint:'open',rows:[['Weather','Cool'],['Status','Unclaimed'],'◆ Survey eastern bank']}]);
is34(extras);assert.match(extras,/FIELD REPORT/);
const partner=E.importGame(clean);partner.beasts.sample={id:'sample',name:'Reedling',species:'fenfox',level:2,individualGrade:'Common',energy:9,maxEnergy:12,trust:38};partner.player.partnerIds=['sample'];
is34(P.core(partner));is34(P.full(partner,'Reedling'));assert.match(P.core(partner),/REEDLING/);assert.match(P.full(partner,'menu'),/Reedling/);
console.log('Gallery panels passed: 34 columns, visible-only cards, conditional sections and full views');