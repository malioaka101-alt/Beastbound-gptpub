'use strict';
// A witnessed GM place and original self-declared association can offer ONLY
// a founder's existing attested, finite physical belongings as POSSIBLE group
// resources, with no new building, custody, item stock, staff pay or NPC assent.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),R=require('../rules'),
 New=require('../scripts/new-campaign'),Opening=require('../scripts/gm-campaign-opening'),
 G=require('../world/emergent-groups'),Assets=require('../rules/material-handoffs'),
 Agency=require('../world/group-member-agency'),Turn=require('../scripts/chat-turn'),
 Places=require('../world/lived-places'),Careers=require('../world/person-careers');
const s=New.create({seed:429137,slug:'gm_owned_facility_resource_test',
 mode:'guided',background:'fieldworker',homeRegion:'morrowfen_basin',age:26}).state;
const siteId='cedar_river_notice_hall',npcName='Mira Fenwick',
 witness='Mira Fenwick is here arranging personally witnessed river-mapping notes beside the wooden threshold of the hall.';
Opening.apply(s,{place:{placeId:siteId,name:'Cedar River Notice Hall',
 regionId:s.campaign.origin.birthRegionId,kind:'ordinary communal riverside hall',
 sceneType:'structure',
 description:'A real timber-built public notice room by the river with worn floorboards and an open window toward the ferry.',
 culture:'Residents discuss crossings here, though no family or association automatically owns or controls the hall.'},
 scene:witness+' There is no evidence that the local association owns the room or equipment.',
 focus:'Inspect actual shared-notes equipment',weather:'Clear breezy morning',
 hour:10,minute:0});
const act=(operation,params={},state=s)=>R.act(state,{system:'social',operation,params});
const f=act('formGroup',{name:'Cedar River Observers',
 kind:'voluntary locally founded notes association',
 purpose:'Compare carefully observed flood measurements without coercing anyone or asserting private property ownership over local facilities.'});
const e=G.lookup(s.table.realm,f.id),w=s.table.realm;
A.ok(e);
const initial=act('groupResourceSiteStatus',{groupId:e.id});
A.equal(initial.placeId,siteId);
A.equal(initial.siteSceneType,'structure');
A.deepEqual(initial.knownExistingLocationFacilityKinds,[]);
A.deepEqual(initial.witnessedOriginalResourceOffers,[]);
A.equal(initial.facilitiesNotAssignedToGroup,true);
const savedBeforeOffer=E.exportGame(s),preAssetCount=s.player.inventory.marsh_reed;
A.equal(preAssetCount,2,'Original fieldworker background owns exactly two actual reeds');
A.throws(()=>act('offerGroupOwnedResource',{groupId:e.id,assetId:'physical_asset_invented',
 purpose:'Let our group use this claimed private tool in our real hall.'}),
 /actually attested|owned material/);
A.equal(E.exportGame(s),savedBeforeOffer);
const observed=act('documentOwnedMaterial',{ownerId:'player',
 item:'marsh_reed',quantity:2,
 description:'Two really owned dry marsh reeds carried personally for riverbank observation markers, not property of the hall or group.'});
A.equal(observed.documented,true);
const audit=Assets.verifyAssetAttestations(s);
A.equal(audit,true);
const noCoins=s.player.coins,noRng=s.rngState,noTime=s.world.minutes,
 groupMoney=e.funds;
const offer=act('offerGroupOwnedResource',{groupId:e.id,assetId:observed.id,
 purpose:'Allow the volunteers to ask me to use these two physically held reeds for genuine riverbank mapping observations.'});
A.equal(offer.offered,true);
A.equal(offer.notTransferred,true);
A.equal(offer.notBuildingOrGroupOwned,true);
A.equal(s.player.inventory.marsh_reed,preAssetCount);
A.equal(s.player.coins,noCoins);
A.equal(e.funds,groupMoney);
A.equal(s.rngState,noRng);
A.equal(s.world.minutes,noTime);
A.ok(G.verifyResourceOffer(e,e.resourceOffers[0],w));
A.equal(G.validate(e,w),true);
const r=act('groupResourceSiteStatus',{groupId:e.id});
A.equal(r.witnessedOriginalResourceOffers.length,1);
A.equal(r.witnessedOriginalResourceOffers[0].physicallyAvailableHereNow,true);
A.equal(r.witnessedOriginalResourceOffers[0].noPropertyTransfer,true);
A.equal(r.witnessedOriginalResourceOffers[0].notInstalledOrGroupOwned,true);
A.deepEqual(r.independentSiteResponsibilities,[],'A group declaration cannot hire workers');
A.throws(()=>act('offerGroupOwnedResource',{groupId:e.id,assetId:observed.id,
 purpose:'Try reoffering the same reed in this room without independent physical change.'}),
 /already offered/);
A.equal(e.resourceOffers.length,1);
// The original independent GM person and member agency already own all
// acceptance/decline decisions; this new bridge does not override them.
const introduced=act('introduceWitnessedPerson',{
 name:npcName,profession:'Independent river crossing recorder',
 purpose:'Maintain independently observed river crossing conditions and choose personal obligations without coercion.',
 personality:'Patient but sceptical of undocumented claims.',
 background:'A travelling recorder working for their own ordinary living, not employed by any declared association.',
 witness:'A resident personally witnessed Mira Fenwick here reviewing flood measurements without promising any agreement.'});
const npcId=introduced.npcId;
const seedChoice=predicate=>{
 for(let i=1;i<100000;i++){const st={rngState:i};if(predicate(Agency.draw(st)))return i;}
 throw Error('No independent group-agency seed for this test branch');
};
Agency.ensure(w).rngState=seedChoice(x=>x<.001);
const joined=act('inviteGroupMember',{groupId:e.id,npcId,
 proposal:'Please consider freely joining our association for local river notes. You can leave or refuse tasks without penalty.'});
A.equal(joined.decision,'accepted');
Agency.ensure(w).rngState=seedChoice(x=>x<.001);
const day=Math.floor(s.world.minutes/1440);
const role=act('offerGroupResponsibility',{groupId:e.id,npcId,
 title:'Volunteer river-records steward',
 scope:'If you wish and are available, help review personally observed river records without demanding any wages, title, custody or power over the people in this hall.',
 untilDay:day+4});
A.equal(role.agreed,true);
const viewed=act('groupResourceSiteStatus',{groupId:e.id});
A.equal(viewed.independentSiteResponsibilities.length,1);
A.equal(viewed.independentSiteResponsibilities[0].status,'voluntarily-serving');
A.equal(viewed.independentSiteResponsibilities[0].noAutomaticPay,true);
A.equal(viewed.witnessedOriginalResourceOffers[0].physicallyAvailableHereNow,true);
A.equal(e.funds,groupMoney,'Volunteer member assent does not create a salary or fund asset');
A.equal(s.player.inventory.marsh_reed,preAssetCount);
const stored=E.exportGame(s),copy=E.importGame(stored),
 copyGroup=G.lookup(copy.table.realm,e.id);
A.equal(G.verifyResourceOffer(copyGroup,copyGroup.resourceOffers[0],copy.table.realm),true);
A.equal(G.validate(copyGroup,copy.table.realm),true);
A.equal(Assets.verifyAssetAttestations(copy),true);
A.equal(act('groupResourceSiteStatus',{groupId:e.id},copy).knownExistingLocationFacilityKinds.length,0);
// A depleted stock is not reconstituted by an old description.
copy.player.inventory.marsh_reed=1;
const depleted=act('groupResourceSiteStatus',{groupId:e.id},copy);
A.equal(depleted.witnessedOriginalResourceOffers[0].physicallyAvailableHereNow,false);
A.equal(copyGroup.resourceOffers[0].ending,null);
A.equal(Assets.verifyAssetAttestations(copy),true);
copy.player.inventory.marsh_reed=2;
copy.world.location='crossing';
A.equal(act('groupResourceSiteStatus',{groupId:e.id,placeId:siteId},copy)
 .witnessedOriginalResourceOffers[0].physicallyAvailableHereNow,false,
 'An owner elsewhere cannot silently leave their carried goods installed');
copy.world.location=siteId;
// Withdrawal changes only the owner's availability choice.
const withdraw=act('withdrawGroupResourceOffer',{groupId:e.id,offerId:offer.id,
 reason:'I need both reeds for my own upcoming independent survey duties.'},copy);
A.equal(withdraw.withdrawn,true);
A.equal(copy.player.inventory.marsh_reed,2);
A.equal(copyGroup.resourceOffers[0].ending.source.origin,G.RESOURCE_WITHDRAWAL);
A.equal(act('groupResourceSiteStatus',{groupId:e.id},copy)
 .witnessedOriginalResourceOffers[0].physicallyAvailableHereNow,false);
A.equal(G.validate(copyGroup,copy.table.realm),true);
// Tampering with founding, source asset, intent, or withdrawal cannot
// produce a legitimate organisation resource.
for(const kind of ['place','asset','intent','ending']){
 const bad=E.importGame(E.exportGame(copy)),bw=bad.table.realm,
  entry=bw.emergentGroups.entries[e.id],row=entry.resourceOffers[0];
 if(kind==='place')bw.livedPlaces.places[siteId].foundingHash='f'.repeat(64);
 if(kind==='asset')row.source.asset.source.quantity=999;
 if(kind==='intent')row.source.purpose='Falsely exclusive owner of the hall';
 if(kind==='ending')row.ending.source.minute=-5;
 A.equal(G.validate(entry,bw),false,kind+' tampering must be rejected');
 A.equal(G.lookup(bw,e.id),null);
}
{
 const bad=E.importGame(stored);
 bad.table.materialAssetAttestations[0].quantity=999;
 A.equal(Assets.verifyAssetAttestations(bad),false);
 A.throws(()=>act('groupResourceSiteStatus',{groupId:e.id},bad),
 /alteration|journal|physical/);
}
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-group-resource-site-'));
try{
 const file=Path.join(tmp,'save.json');FS.writeFileSync(file,stored+'\n');
 const before=FS.readFileSync(file,'utf8');
 const query={id:'gm_group_resource_read_429137',mode:'rule',system:'social',
  operation:'groupResourceSiteStatus',params:{groupId:e.id}};
 const result=Turn.execute(file,query);
 A.equal(result.ok,true);
 A.equal(result.applied,false);
 A.equal(result.output.rules.witnessedOriginalResourceOffers.length,1);
 A.equal(FS.readFileSync(file,'utf8'),before);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
// A canonical site is valid, but its built facilities remain not group property.
const canon=E.newGame({seed:429138,name:'Canonical Resource Owner',background:'fieldworker'});
const cgroup=act('formGroup',{name:'Crossing Field Inventory Circle',
 kind:'voluntary observation circle',
 purpose:'Observe genuine physical market activity and share personally held supplies without owning the public guild.'},canon);
const casset=act('documentOwnedMaterial',{ownerId:'player',item:'marsh_reed',quantity:1,
 description:'A genuinely carried marsh reed personally owned by the fieldworker for physical observations.'},canon);
const coff=act('offerGroupOwnedResource',{groupId:cgroup.id,assetId:casset.id,
 purpose:'Make my one actual reed available at the crossing without claiming public guild ownership.'},canon);
A.equal(coff.offered,true);
const cstatus=act('groupResourceSiteStatus',{groupId:cgroup.id},canon);
A.equal(cstatus.witnessedOriginalResourceOffers.length,1);
A.equal(cstatus.witnessedOriginalResourceOffers[0].physicallyAvailableHereNow,true);
A.ok(cstatus.knownExistingLocationFacilityKinds.includes('guild'));
A.equal(cstatus.facilitiesNotAssignedToGroup,true);
A.equal(canon.player.inventory.marsh_reed,2);
console.log('Verified original material and local volunteer responsibility may be referenced by group site; original owner, stock, presence, independent consent and separate wages/skills remain authoritative');
