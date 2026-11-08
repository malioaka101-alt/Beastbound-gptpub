'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const E=require('../engine'),S=require('../world/simulation'),W=require('../rules/world');
const N=require('../scripts/new-campaign');
const R=require('../scripts/chat-turn');
const Scene=require('./scene-witness-fixture');
for(let seed=1;seed<=100;seed++){
 const o=N.create({seed,slug:'test_campaign_001'}),b=N.create({seed,slug:'test_campaign_001'});
 assert.deepEqual(o,b);
 const s=E.importGame(E.exportGame(o.state));
 assert(['male','female','nonbinary'].includes(s.player.gender)&&s.player.name===o.summary.name);
 assert(E.LOCATIONS[s.world.location] && s.campaign.openingState==='awaiting-gm');
 assert.deepEqual(s.flags.visited,{});
 assert(s.table.healthModel==='wounds-v1');
 assert(s.table.realm.countries && Object.keys(s.table.realm.countries).length===24);
 assert(s.table.realm.ticks.sixdays===0);
 const fixedDate=N.startingDate(seed);
 assert.deepEqual(s.table.realm.calendarAnchor.date,fixedDate);
 assert.equal(s.table.realm.calendarAnchor.atCompletedDay,0);
 assert.equal(s.campaign.startDate.year,fixedDate.year);
 assert.equal(S.calendar(s).absoluteDate,W.dateText(fixedDate));
 assert.equal(o.summary.date,W.dateText(fixedDate));
 const next=E.importGame(E.exportGame(s));
 W.advance(next,1);
 assert.equal(S.calendar(next).absoluteDate,W.dateText(W.addDate(fixedDate,1)));
 assert.equal(next.world.minutes,s.world.minutes+1440);

 assert(s.campaign.oldCampaignImported===false);
 assert(!JSON.stringify(s).includes('Aerin Marsh'));
 assert.equal(s.player.family.household,o.state.player.family.household);
 assert(s.chatRuntime.focus.length===0);
 assert.equal(s.chatRuntime.scene,null);
 assert(S.publicStatus(s).region);
}
// Ivar's recorded seed must reproduce exactly the approved start date.
assert.deepEqual(N.startingDate(2926136976),{year:1153,month:10,day:5});
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'beastbound-new-'));
try{
 const file=path.join(dir,'new.json');const one=N.create({seed:73287126,slug:'test_campaign_001'});
 Scene.record(one.state,'new_scene_observed_01',{skill:'survival',attribute:'wis',dc:12,
  minutes:15,label:'Test field check',risky:false});
 fs.writeFileSync(file,E.exportGame(one.state)+'\n');
 const r=R.execute(file,{id:'new_test_scene_0001',mode:'check',checkId:'new_scene_observed_01'});
 assert(r.ok&&r.applied&&Number.isInteger(r.output.check.roll));
 const x=E.importGame(fs.readFileSync(file,'utf8'));assert.equal(x.chatRuntime.revision,1);
 assert.equal(x.table.realm.version,1);
 const twice=R.execute(file,{id:'new_test_scene_0001',mode:'check',checkId:'new_scene_observed_01'});
 assert(twice.duplicate && !twice.applied);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
console.log('New campaign tests passed: 100 deterministic rolls, independent starts, wound and realm init, real turn and replay safety');