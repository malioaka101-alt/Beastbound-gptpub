'use strict';
// Original Body Cycle II: 180 legitimate Bone/Marrow/recovery points,
// source-owned independent rite DC19 and +1 Toughness/+1 Serious wound box.
// No universal growth ladder, combat technique, free healing or new limbs.
const Disc=require('./disciplines');
const METHODS=Object.freeze(['bone','marrow','recovery']);
const required=()=>Disc.KEYS.body.tracks.cycle2[0];
const baseDC=()=>Disc.KEYS.body.tracks.cycle2[1];
const riteDC=()=>baseDC()+2+3;
const toughGain=1,seriousBoxGain=1;
module.exports=Object.freeze({METHODS,required,baseDC,riteDC,
 toughGain,seriousBoxGain});
