'use strict';
// Potential is natural aptitude, not rank permission or fate. No dice are
// consumed merely by inspecting a player's seeded own profile.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),Potential=require('../rules/potential-mechanics');
function fresh(seed){
 const s=E.newGame({seed,name:'Potential Mechanics Fixture',path:'undecided'});
 R.unified.ensurePlayer(s);s.world.location='crossing';return s;
}
{
 const s=fresh(914001),before=E.exportGame(s),rng=s.rngState;
 const own=R.act(s,{system:'character',operation:'status',params:{}});
 A.equal(Object.keys(own.potential).length,14);
 for(const dim of Potential.DIMENSIONS){
  const p=own.potential[dim],stored=s.player.capabilityProfile.potential[dim].latent;
  A.equal(p.score,stored);A.equal(p.maximum,9);
  A.equal(p.neverLimitsStage,true);
  A.equal(p.trainingModifier,Potential.bonus(stored));
  A.equal(p.rating,Potential.BANDS[stored-1]);
 }
 A.equal(own.potentialCapsStages,false);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 A.deepEqual([1,2,3,4,5,6,7,8,9].map(Potential.bonus),
  [-1,-1,0,0,1,1,2,2,2]);
 const s=fresh(914002);
 A.equal(Potential.discipline(s,'soul','phase1','identity-ward').dimension,'soulResilience');
 A.equal(Potential.discipline(s,'soul','phase1','self-awareness').dimension,'soulDepth');
 A.equal(Potential.discipline(s,'arcane','core','core-geometry').dimension,'manaCoreArchitecture');
 A.equal(Potential.discipline(s,'meridian','gates',null).dimension,'gateStability');
 A.equal(Potential.originAxis(s,'physical').dimension,'lineageCompatibility');
 A.equal(Potential.originStep(s,8).dimension,'bloodlineExpression');
}
{
 const a=fresh(914003),b=fresh(914003);
 a.player.capabilityProfile.potential.soulDepth.latent=1;
 b.player.capabilityProfile.potential.soulDepth.latent=9;
 const beforeA=a.world.minutes,beforeB=b.world.minutes;
 const pa=R.act(a,{system:'discipline',operation:'practice',
  params:{system:'soul',method:'self-awareness',minutes:15}});
 const pb=R.act(b,{system:'discipline',operation:'practice',
  params:{system:'soul',method:'self-awareness',minutes:15}});
 A.equal(pa.check.roll,pb.check.roll,'aptitude never rerolls dice');
 A.equal(pb.check.modifier-pa.check.modifier,3);
 A.equal(pa.check.dc,pb.check.dc);
 A.equal(pa.potentialAptitude.modifier,-1);
 A.equal(pb.potentialAptitude.modifier,2);
 A.equal(a.world.minutes,beforeA+15);A.equal(b.world.minutes,beforeB+15);
 A.equal(a.player.soul.phase,0);A.equal(b.player.soul.phase,0);
 A.equal(pa.progress>=0,true);A.equal(pb.progress>=0,true);
}
{
 // No aptitude value may be a stage-gating condition. Earned work, real
 // multiple methods, checks and anatomy remain mandatory at every score.
 const s=fresh(914004);
 s.player.capabilityProfile.potential.soulDepth.latent=1;
 const x=R.act(s,{system:'discipline',operation:'status',params:{}});
 A.equal(x.systems.soul.potentialAptitude.modifier,-1);
 A.equal(x.systems.soul.potentialCannotBlockStage,true);
 A.equal(x.systems.soul.independentAvailableAtCurrentSite,true);
 const p=R.act(s,{system:'discipline',operation:'practice',
  params:{system:'soul',method:'self-awareness',minutes:15}});
 A.equal(p.potentialAptitude.noStageCap,true);
 const saved=E.importGame(E.exportGame(s));
 A.equal(saved.player.capabilityProfile.potential.soulDepth.latent,1);
}
console.log('Personal potential affects real discipline practice but never gates a stage');
