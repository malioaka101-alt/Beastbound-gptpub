'use strict';
// The original legacy player route already takes 75 minutes per adjacent
// leg, except 145 minutes for a destination in the ruins; 4 Stamina.
// Pure law shared for future independent terrestrial trip witnesses.
// This does NOT create a route, consent, traveler, or free movement.
function legSpec(destination){
 if(typeof destination!=='string'||!destination)throw Error('Original destination required');
 return {minutes:destination==='ruins'?145:75,stamina:4};
}
module.exports={legSpec};
