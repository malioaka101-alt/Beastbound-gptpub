'use strict';
// The small in-chat HUD must derive from current save, never a manually
// duplicated old Aerin/Ivar dashboard or invented civil/relative facts.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine'),P=require('../panels'),
 New=require('../scripts/new-campaign'),
 Turn=require('../scripts/chat-turn'),
 World=require('../rules/world'),Realm=require('../world/simulation');
{
 const legacy=E.importGame(require('../saves/aerin_marsh.json'));
 const hud=P.hudData(legacy),identity=P.characterData(legacy);
 A.equal(hud.name,'Aerin Marsh');
 A.equal(hud.identity.age,36);
 A.equal(hud.identity.background,'fieldworker');
 A.equal(hud.date.known,false);
 A.equal(hud.date.absolute,null);
 A.equal(hud.date.label,'Civil date unrecorded');
 A.equal(hud.date.relativeDay,1);
 A.equal(hud.time,'08:05');
 A.equal(hud.location,'Morrowfen Crossing');
 A.equal(hud.currency,E.money(legacy.player.coins));
 A.equal(hud.resources.find(x=>x.key==='stamina').current,52);
 A.equal(hud.resources.find(x=>x.key==='qi').current,14);
 A.equal(hud.context.kind,'known-public-notices');
 A.equal(hud.context.detail,'2 postings personally read');
 A.equal(identity.family.household,'single guardian');
 A.equal(identity.family.siblings,2);
 A.equal(identity.family.homeTrade,'guild clerks');
 A.equal(identity.family.ties,'estranged');
 A.equal(identity.family.members,undefined,
  'Do not invent named relatives for the old trial campaign');
 A.equal(identity.knownHistory,undefined);
 A.match(P.full(legacy,'character'),/FAMILY & ROOTS/);
 A.match(P.full(legacy,'character'),/Unrecorded in this older save/);
 A.ok(!JSON.stringify(hud).includes('rngState'));
 A.ok(!JSON.stringify(hud).includes('privateGoals'));
 A.ok(!JSON.stringify(hud).includes('personality'));
 A.deepEqual(P.hudData(legacy),P.hudData(E.exportGame(legacy)));
}
{
 const used=new Set(),families=new Set(),dates=new Set();
 for(let seed=1;seed<=100;seed++){
  const x=New.create({seed,slug:'hud_identity_001'});
  const y=New.create({seed,slug:'hud_identity_001'});
  A.deepEqual(x,y,'A seeded character must be reproducible without consuming game dice');
  const s=x.state,p=s.player,hud=P.hudData(s),
   profile=P.characterData(s),calendar=Realm.calendar(s);
  used.add(p.name);families.add(p.name.split(' ').at(-1));
  dates.add(calendar.absoluteDate);
  A.equal(hud.name,p.name);
  A.equal(hud.date.known,true);
  A.equal(hud.date.absolute,calendar.absoluteDate);
  A.equal(hud.date.label,calendar.absoluteDate);
  A.equal(hud.date.relativeDay,1);
  A.equal(hud.identity.age,p.age);
  A.equal(hud.identity.background,p.background);
  A.equal(hud.identity.path,p.path);
  A.equal(hud.location,E.LOCATIONS[s.world.location].name);
  A.equal(hud.currency,E.money(p.coins));
  A.equal(profile.family.household,p.family.household);
  A.equal(profile.family.siblings,p.family.siblings);
  A.equal(profile.family.homeTrade,p.family.homeTrade);
  A.ok(profile.family.members);
  A.equal(profile.family.members.filter(x=>x.relation==='sibling').length,
   p.family.siblings);
  A.ok(profile.family.members.every(x=>x.name.endsWith(
   p.name.split(' ').at(-1))));
  A.equal(new Set(profile.family.members.map(x=>x.name)).size,
   profile.family.members.length,'All personally known family members need distinct names');
  A.ok(profile.knownHistory.upbringing.length>30);
  A.ok(profile.knownHistory.earlyWork.length>30);
  A.equal(x.summary.family.household,p.family.household);
  A.equal(x.summary.history.earlyWork,profile.knownHistory.earlyWork);
  A.ok(!p.name.includes('Marsh'));
  A.equal(s.campaign.oldCampaignImported,false);
  A.ok(!JSON.stringify(x).includes('Aerin Marsh'));
  A.equal(hud.context?.kind==='known-public-notices',false);
  const record=P.full(s,'character');
  A.match(record,/FAMILY & ROOTS/);
  A.match(record,/KNOWN HISTORY/);
  for(const line of record.split('\n'))A.equal([...line].length,34);
  const next=E.importGame(E.exportGame(s));
  World.advance(next,1);
  const tomorrow=P.hudData(next);
  A.equal(tomorrow.date.absolute,Realm.calendar(next).absoluteDate);
  A.equal(tomorrow.date.relativeDay,2);
  A.notEqual(tomorrow.date.absolute,hud.date.absolute);
 }
 A.ok(used.size>=70,'More than a handful of place-like names must exist');
 A.ok(families.size>=20,'Family names should be varied');
 A.ok(dates.size>40,'Campaign starting dates should vary');
}
{
 const s=New.create({seed:9281621,slug:'hud_dynamic_001'}).state;
 const hud=P.hudData(s),before=E.exportGame(s),rng=s.rngState;
 A.ok(hud.focus.length>0);
 A.equal(hud.context?.kind==='known-public-notices',false);
 A.equal(s.rngState,rng);
 A.equal(E.exportGame(s),before,'HUD lookup must be read-only');
 const sight=E.importGame(before);
 sight.encounter={beastId:'observed_one',threat:false,distanceMetres:10};
 sight.beasts.observed_one={id:'observed_one',name:'Passing Hare',
  species:'stonehare',owner:null,energy:6,maxEnergy:13,relationship:'wild'};
 const view=P.hudData(sight);
 A.equal(view.context.kind,'beast');
 A.equal(view.context.title,'Passing Hare');
 A.ok(!JSON.stringify(view).includes('relationship'));
 A.ok(!JSON.stringify(view).includes('owner'));
 A.ok(!JSON.stringify(view).includes('potential'));
 // Health and conditions appear only when relevant to play.
 const injured=E.importGame(before);
 injured.table.healthModel='wounds-v1';
 injured.table.combatants={player:{wounds:[1,0,0],status:'ok'}};
 A.ok(P.hudData(injured).resources.some(x=>x.key==='health'));
 A.ok(!P.hudData(s).resources.some(x=>x.key==='health'));
}
{
 const x=New.create({seed:5618742,slug:'hud_fileturn_001'});
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-dynamic-hud-')),
  path=Path.join(dir,'save.json');
 try{
  FS.writeFileSync(path,E.exportGame(x.state)+'\n');
  const before=FS.readFileSync(path,'utf8');
  const status=Turn.execute(path,{id:'hud_read_only_001',mode:'status'});
  A.equal(status.ok,true);A.equal(status.applied,false);
  A.equal(status.hud.date.absolute,Realm.calendar(x.state).absoluteDate);
  A.equal(status.hud.name,x.state.player.name);
  A.equal(FS.readFileSync(path,'utf8'),before);
  const look=Turn.execute(path,{id:'hud_look_001',mode:'act',action:'look'});
  A.equal(look.ok,true);A.equal(look.applied,false);
  A.equal(look.hud.date.absolute,status.hud.date.absolute);
  A.equal(FS.readFileSync(path,'utf8'),before);
  const wait=Turn.execute(path,{id:'hud_next_day_001',mode:'rule',
   system:'world',operation:'wait',params:{minutes:1440}});
  A.equal(wait.ok,true);A.equal(wait.applied,true);
  const loaded=E.importGame(FS.readFileSync(path,'utf8'));
  A.equal(wait.hud.date.absolute,Realm.calendar(loaded).absoluteDate);
  A.equal(wait.hud.date.relativeDay,2);
  A.equal(wait.hud.name,loaded.player.name);
  A.equal(Turn.execute(path,{id:'hud_next_day_001',mode:'rule',
   system:'world',operation:'wait',params:{minutes:1440}}).recovered,true);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Dynamic HUD and identity passed: older unknown civil date is honest; 100 new seeded personal/family histories, true date, situational sections and file-backed current state');
