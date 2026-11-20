'use strict';
// Source parity: original player Anchor II shares immutable law; an NPC's
// successful exterior *measurement* must still precede any anchor work.
const A=require('node:assert/strict'),Player=require('../rules/rift-anchors'),
 Law=require('../rules/rift-shared-original-anchor-law'),
 Sense=require('../rules/rift-shared-original-exterior-sense'),
 NPC=require('../rules/independent-original-rift-exterior-anchor-two');
A.deepEqual(Player.AXES,Law.AXES);
A.deepEqual(Player.FOCI,Law.FOCI);
A.equal(Player.SITE,Law.SITE);
A.equal(Law.staminaCost(120),3);
A.equal(Law.staminaCost(180),4);
for(const [phase,dc] of [['quiet',18],['surging',20],['unstable',22]]){
 const snapshot={siteId:Sense.SITE_ID,phase,charge:25,seal:77,
  ecosystemPressure:23,worldSeed:18,day:1};
 A.equal(Law.dc(snapshot),dc);
}
A.deepEqual(Law.grow({bearing:0,resonance:0,stability:0},false,
 'integrated','strong'),{
 axes:{bearing:1,resonance:1,stability:1},integrated:true,earned:2});
A.equal(Law.formed({bearing:2,resonance:2,stability:2},true),true);
A.equal(Law.formed({bearing:2,resonance:2,stability:2},false),false);
A.equal(Law.strainAfter(8,'severe failure',false),16);
A.equal(Law.strainAfter(8,'success',true),6);
A.equal(Law.integrity(0,0),60);
A.equal(NPC.verify({table:{}},{originalRiftExteriorAnchor:undefined}),true);
A.equal(NPC.verify({table:{}},{originalRiftExteriorAnchor:{completed:true}}),false);
A.throws(()=>NPC.privateStatus({table:{}},{
 originalRiftExteriorAnchor:{completed:true}
}),/Independent original Rift Anchor proof was altered/);
A.match(Player.mark.toString(),/AnchorLaw.grow/);
A.match(Player.mark.toString(),/AnchorLaw.dc/);
console.log('Original player/independent Rift Anchor Step II source law and forged stage blocking PASS');
