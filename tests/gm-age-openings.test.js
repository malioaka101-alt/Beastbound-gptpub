'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),N=require('../scripts/new-campaign'),Age=require('../scripts/age-lived-history');
const Turn=require('../scripts/chat-turn'),R=require('../rules'),Places=require('../world/lived-places');
const child=N.create({seed:70103,slug:'gm_only_age_child',mode:'gm',age:7,originKind:'ordinary',homeRegion:'morrowfen_basin'});
A.equal(child.state.player.age,7);
A.equal(child.state.player.path,'undecided');
A.equal(child.state.player.coins,0);
A.equal(child.state.player.maxHealth,48);
A.equal(child.state.player.maxStamina,36);
A.equal(child.state.campaign.openingState,'awaiting-gm');
A.equal(child.state.chatRuntime.scene,null);
A.deepEqual(child.state.chatRuntime.focus,[]);
A.equal(child.state.flags.openingHook,undefined);
A.equal(Age.verify(child.state.player.livedYears),true);
A.equal(child.state.player.livedYears.phase,'childhood');
A.equal(N.OPENINGS,undefined);
const birthday=E.importGame(E.exportGame(child.state));
const days=birthday.player.livedYears.nextBirthdayInDays;
A.ok(Number.isInteger(days)&&days>=1&&days<=365);
if(days>1)E.advance(birthday,(days-1)*1440);
A.equal(Age.sync(birthday).changed,false);
A.equal(birthday.player.age,7);
E.advance(birthday,1440);
A.equal(Age.sync(birthday).to,8);
A.equal(Age.sync(birthday).changed,false);
A.equal(birthday.player.meridian.stage,0);
A.equal(birthday.player.arcane.circles,0);
A.deepEqual(child,N.create({seed:70103,slug:'gm_only_age_child',mode:'gm',age:7,originKind:'ordinary',homeRegion:'morrowfen_basin'}));
const baby=N.create({seed:70104,slug:'gm_newborn_case',mode:'gm',age:0});
A.equal(baby.state.player.age,0);
A.throws(()=>N.create({seed:70105,slug:'gm_bad_age',mode:'gm',age:121}),/Age/);
const opening={place:{placeId:'child_glen_home',name:'Glenwake Hamlet',regionId:'morrowfen_basin',
 kind:'riverside village',sceneType:'settlement',description:'At the village well, neighbours hang flood ribbons from oak poles while animals feed along the lower banks.',
 culture:'People share flood warnings, but households disagree about work and rights.',
 families:[{name:'Glenwake Millers',context:'Known locally for tending mill stones, not proven present or friendly.'}]},
 scene:'At the well beside the hill path, a cracked wooden bucket lies in the grass. The village is busy with small errands. Nothing compels the character to act.',
 focus:'A morning in the village',weather:'fresh morning air',hour:9,minute:5};
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gm-age-opening-'));
try{
 const file=Path.join(dir,'state.json');
 FS.writeFileSync(file,E.exportGame(child.state)+'\n');
 const before=FS.readFileSync(file,'utf8');
 const pending=Turn.execute(file,{id:'gm_age_status_pending_001',mode:'status'});
 A.equal(pending.openingPending,true);
 A.equal(pending.hud,undefined);
 A.equal(FS.readFileSync(file,'utf8'),before);
 A.throws(()=>Turn.execute(file,{id:'gm_age_act_pending_001',mode:'act',action:'look'}),/no playable opening yet/);
 A.equal(FS.readFileSync(file,'utf8'),before);
 const result=Turn.execute(file,{id:'gm_age_opening_001',mode:'rule',system:'world',operation:'authorOpening',params:opening});
 A.equal(result.ok,true);A.equal(result.applied,true);A.equal(result.output.rules.opened,true);
 const state=E.importGame(FS.readFileSync(file,'utf8'));
 A.equal(state.world.location,opening.place.placeId);
 A.equal(state.campaign.openingState,'authored');
 A.equal(state.chatRuntime.scene,opening.scene);
 A.equal(state.player.coins,0);
 A.ok(Places.get(state,opening.place.placeId));
 const saved=FS.readFileSync(file,'utf8');
 A.equal(Turn.execute(file,{id:'gm_age_opening_001',mode:'rule',system:'world',operation:'authorOpening',params:opening}).duplicate,true);
 A.equal(FS.readFileSync(file,'utf8'),saved);
 A.equal(Turn.execute(file,{id:'gm_age_look_001',mode:'act',action:'look'}).output.scene.name,opening.place.name);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
const adult=N.create({seed:70111,slug:'gm_adult_life_case',mode:'gm',age:43,homeRegion:'forge_basin',
 originKind:'new-organisation',groupName:'Lantern Weavers',role:'self-employed lantern repairer',
 gmOpening:{place:{placeId:'adult_lantern_shop',name:'Lantern Shop',regionId:'forge_basin',
 kind:'workshop',sceneType:'settlement',description:'A narrow brick workshop holds lanterns in various states of repair.'},
 scene:'The day begins among unfinished repairs and a bundle of unpaid invoices. Clients continue their ordinary lives elsewhere.',
 focus:'Pending ordinary repairs',weather:'dry autumn breeze',hour:7,minute:25}});
A.equal(adult.state.campaign.openingState,'authored');
A.equal(adult.state.player.age,43);
A.equal(adult.state.player.history.ownOccupation,'self-employed lantern repairer');
A.equal(adult.state.player.livedYears.phase,'established-adulthood');
A.ok(adult.state.player.coins>=20);
A.equal(adult.state.player.arcane.circles,0);
A.equal(adult.state.world.location,'adult_lantern_shop');
const senior=N.create({seed:70122,slug:'gm_later_life_case',mode:'gm',age:82});
A.equal(senior.state.player.livedYears.phase,'later-life');
A.ok(senior.state.player.family.members.every(x=>!['guardian','second guardian','older relative'].includes(x.relation)));
console.log('Age-only and GM-authored campaigns: no prewritten opening, life-stage continuity, unique saved scenes and independent real places.');
