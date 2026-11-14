'use strict';
// Authentic GM site -> original voluntary association -> original time/funds
// and independent monthly reviewed WORK, without free facility or payroll.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),R=require('../rules'),
 New=require('../scripts/new-campaign'),Opening=require('../scripts/gm-campaign-opening'),
 W=require('../rules/world'),Places=require('../world/lived-places'),
 G=require('../world/emergent-groups'),Turn=require('../scripts/chat-turn');
const s=New.create({seed:428198,slug:'gm_site_original_group_operations_test',
 mode:'guided',homeRegion:'morrowfen_basin',age:24}).state;
const placeId='river_records_hall';
Opening.apply(s,{place:{placeId,name:'River Records Hall',
 regionId:s.campaign.origin.birthRegionId,
 kind:'ordinary lived riverside hall',sceneType:'settlement',
 description:'A maintained occupied hall beside the ferry crossing, with a communal bench and an ordinary rainproof roof.',
 culture:'Residents tell different accounts of earlier floods; the hall does not confer exclusive property or school credentials.'},
 scene:'The living River Records Hall stands beside the river crossing. Visitors compare old crossing notes, without promising permission to use any equipment.',
 focus:'A real place for voluntary shared work',weather:'Damp clear morning',
 hour:10,minute:0});
const act=(state,operation,params={})=>R.act(state,{system:'social',operation,params});
const created=act(s,'formGroup',{name:'Riverside Observers Circle',
 kind:'self-declared voluntary record-keeping association',
 purpose:'Try to document real local river crossings and flood records without asserting wages, exclusive premises or government recognition.'});
const e=G.lookup(s.table.realm,created.id);
A.ok(e&&created.formed);
A.equal(e.funds,0);
A.equal(e.members,1);
A.deepEqual(act(s,'groupSiteWorkStatus',{groupId:created.id}).knownSiteActivity,[],
 'A named venue and one-person declaration cannot produce facility or accomplished work');
const coins=s.player.coins,rng=s.rngState,worldMinutes=s.world.minutes;
A.throws(()=>act(s,'groupSiteWorkStatus',{groupId:'not_a_real_group'}),
 /founder|locally known|association/);
A.equal(s.player.coins,coins);
const performed=act(s,'groupContribute',{groupId:created.id,
 activity:'I spend the afternoon recording actual wet riverbank observations and checking old ferry crossing notes, without claiming the hall belongs to our group.',
 coins:5});
A.equal(performed.workRecorded,true);
A.equal(performed.verifiedResult,false);
A.equal(performed.spentCoins,5);
A.equal(e.funds,5);
A.equal(s.player.coins,coins-5);
A.equal(s.rngState,rng);
A.equal(s.world.minutes,worldMinutes+45);
A.equal(e.activity.length,1);
const firstWork=e.activity[0],details=firstWork.witness.details,
 site=Places.get(s,placeId);
A.equal(details.location,placeId);
A.equal(details.siteMinute,s.world.minutes);
A.equal(details.placeProof.foundingHash,site.foundingHash);
A.deepEqual(act(s,'groupSiteWorkStatus',{groupId:created.id}).knownSiteActivity,[],
 'Attempting work is not the independent monthly review or completed construction');
A.equal(G.validate(e,s.table.realm),true);
W.advance(s,30);
const record=e.siteWork?.[0],ledger=e.treasuryAudit;
A.ok(record,'The original monthly world review must preserve real site use');
A.equal(e.activity.length,0);
A.equal(e.siteWork.length,1);
A.ok(['verified-limited-community-work','unverified-community-effort']
 .includes(record.source.originalResult));
A.equal(record.source.originalResult,
 record.source.review.kind,'No player-authored favourable success is accepted');
A.equal(record.source.attemptHash,firstWork.hash);
A.equal(record.source.attempt.witness.details.location,placeId);
A.equal(record.source.placeProof.foundingHash,site.foundingHash);
A.equal(record.source.review.details.originalActionHashes.includes(firstWork.hash),true);
A.equal(record.source.noSeparateWorkRoll,true);
A.equal(record.source.noNewCashOrConstruction,true);
A.equal(record.source.noPropertyOrTeachingRights,true);
A.equal(G.verifySiteWork(e,record,s.table.realm),true);
A.equal(G.validate(e,s.table.realm),true);
A.ok(ledger&&G.verifyTreasuryAudit(e));
const costReceipts=ledger.receipts.filter(x=>
 x.kind==='original-independent-work-cost'&&
 x.source.proof.originalReviewHash===record.source.reviewHash);
A.equal(costReceipts.length,record.source.sharedOriginalCost>0?1:0,
 'Real operating costs remain in original group treasury, not a new wallet');
if(costReceipts.length)
 A.equal(costReceipts[0].source.amount,record.source.sharedOriginalCost);
A.equal(s.player.coins,coins-5,
 'Later group operations must not mint personal money');
// The existing 30-day simulation may legitimately consume unrelated
// player RNG for its original ecology/events. The site receipt itself
// inherits the ONE original independent group review without a new roll.
A.equal(record.source.review.details.decisionDraw>=0,true);
A.equal(record.source.noSeparateWorkRoll,true);
const view=act(s,'groupSiteWorkStatus',{groupId:created.id});
A.equal(view.groupId,created.id);
A.equal(view.knownSiteActivity.length,1);
A.equal(view.knownSiteActivity[0].originalActionHash,firstWork.hash);
A.equal(view.knownSiteActivity[0].noLegalRightToSiteOrFacilities,true);
A.equal(view.knownSiteActivity[0].noExtraMoneyOrTrainingAward,true);
A.deepEqual(act(s,'groupSiteWorkStatus',{groupId:created.id,
 placeId:'different_founded_place'}).knownSiteActivity,[]);
const saved=E.exportGame(s),restored=E.importGame(saved),
 old=e.siteWork[0],fromSave=G.lookup(restored.table.realm,created.id);
A.ok(fromSave&&fromSave.siteWork.length===1);
A.equal(G.verifySiteWork(fromSave,fromSave.siteWork[0],restored.table.realm),true);
// Original short group history may eventually rotate; retained original
// receipt still carries the genuine independent world review and site.
const pruned=E.importGame(saved);
pruned.table.realm.emergentGroups.history=[];
A.equal(G.validate(G.lookup(pruned.table.realm,created.id),pruned.table.realm),true);
A.equal(G.siteWorkStatus(pruned.table.realm,created.id).knownSiteActivity.length,1);
for(const kind of ['place','review','event','world']){
 const altered=E.importGame(saved),w=altered.table.realm,
  g=w.emergentGroups.entries[created.id],row=g.siteWork[0];
 if(kind==='place')row.source.placeProof.founding.name='Counterfeit construction hall';
 if(kind==='review')row.source.review.details.actualFundsSpent=999;
 if(kind==='event')row.source.attempt.witness.details.activity='Unperformed made-up work';
 if(kind==='world')w.livedPlaces.places[placeId].foundingHash='f'.repeat(64);
 A.equal(G.validate(g,w),false,kind+' alteration must break source verification');
 A.equal(G.lookup(w,created.id),null,
  'Altered site or work source must never be treated as genuine operations');
}
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-real-site-operations-'));
try{
 const file=Path.join(tmp,'save.json');FS.writeFileSync(file,saved+'\n');
 const before=FS.readFileSync(file,'utf8');
 const query={id:'gm_site_operations_view_428198',mode:'rule',system:'social',
  operation:'groupSiteWorkStatus',params:{groupId:created.id}};
 const result=Turn.execute(file,query);
 A.equal(result.ok,true);
 A.equal(result.applied,false);
 A.equal(result.output.rules.knownSiteActivity.length,1);
 A.equal(FS.readFileSync(file,'utf8'),before);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
// Canonical Atlas sites remain accepted without a GM founding source.
const legacy=E.newGame({name:'Existing Canonical Worker',seed:428199});
const canon=act(legacy,'formGroup',{name:'Crossing Field Notes',
 kind:'informal local volunteer circle',
 purpose:'Record known crossing changes and contribute ordinary time without claiming other people or property.'});
const canonicalStart=legacy.world.minutes;
act(legacy,'groupContribute',{groupId:canon.id,
 activity:'I record the existing crossing repairs in my own time, without assuming access to any privately owned equipment.',
 coins:0});
W.advance(legacy,30);
const original=G.lookup(legacy.table.realm,canon.id);
A.ok(original&&original.siteWork?.length===1);
A.equal(original.siteWork[0].source.placeProof,undefined);
A.equal(G.validate(original,legacy.table.realm),true);
A.ok(legacy.world.minutes>canonicalStart);
console.log('Existing group review at real GM/canonical location preserves one original work result and shared audited expense after save/log rotation; no extra roll, property, salary, academy, equipment or training grant');
