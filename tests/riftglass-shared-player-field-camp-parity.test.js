'use strict';
// The new independently surveyed Riftglass exterior wardstone refuge reuses
// ORIGINAL PC wilderness camp physics, never an invented NPC-only low DC.
const A=require('node:assert/strict'),
 Camp=require('../rules/wilderness-camp'),
 Field=require('../rules/independent-riftglass-field-refuge');
A.equal(Camp.SITES.ruins.dc,20);
A.match(Camp.SITES.ruins.description,/exterior wardstone/);
A.equal(Camp.STAMINA,3);
A.equal(Camp.MINUTES,45);
A.equal(Camp.weatherPenalty('Fair'),0);
A.equal(Camp.weatherPenalty('Mist'),1);
A.equal(Camp.weatherPenalty('Gale'),3);
for(const weather of ['Fair','Mist','Gale','heavy rain']){
 A.equal(Field.costWeather(weather),
  Camp.SITES.ruins.dc+Camp.weatherPenalty(weather));
}
A.equal(Field.DURATION,18*60);
A.equal(Field.REST_AT-Field.SCOUT_AT,60);
A.ok(Field.REST_AT-Field.SCOUT_AT>=Camp.MINUTES);
A.equal(Field.verify({table:{}},{originalRiftglassFieldRest:undefined}),true);
A.equal(Field.verify({table:{}},{originalRiftglassFieldRest:{
 origin:Field.ORIGIN,attempts:[{seal:'0'}]}}),false,
 'No fabricated campsite is accepted simply because a source label exists');
// Original player on-site Survival field-camp safety, malformed provenance,
// storm invalidation and the original Rift Anchor II safety must still pass.
require('./wilderness-shelter.test.js');
require('./rift-anchor-marking.test.js');
console.log('Original player + independent Riftglass Survival wardstone refuge parity and bounded timing PASS');
