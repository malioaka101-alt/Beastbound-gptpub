'use strict';
// Country offices are public civic facts, not automatic family titles.
// No active saves altered. Events use the real independent world calendar.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),Atlas=require('../world/atlas'),Gov=require('../world/government-offices'),
 Houses=require('../world/social-houses'),Realm=require('../world/simulation'),
 W=require('../rules/world'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const country=(s,p={})=>R.act(s,{system:'world',operation:'governmentStatus',params:p});
const fresh=(seed=413401)=>E.newGame({seed,name:'Ordinary Political Resident',path:'undecided'});
{
 A.equal(Atlas.polities.length,24);A.equal(Gov.charters.length,24);
 A.equal(Object.keys(Gov.seed()).length,24);
 A.equal(new Set(Gov.charters.map(c=>c.id)).size,24);
 A.equal(Gov.royalID('asterwyn'),true);
 A.equal(Gov.royalID('red_sultanate'),true);
 A.equal(Gov.royalID('sunforge'),true);
 A.equal(Gov.royalID('reedmarch'),false);
 A.equal(Gov.terms('monarchy'),null);
 A.equal(Gov.terms('republic'),48);
 A.equal(Gov.terms('council'),60);
 for(const c of Gov.charters){
  const home=Atlas.P[c.id],h=Houses.byId[c.houseId];
  A.ok(home);A.ok(h);A.equal(h.polity,c.id);
  A.equal(c.government,home.government);
  A.ok(c.governingBody.length>8);
  A.ok(c.governingBodySource.includes('Existing named civic institution')||
   c.governingBodySource.includes('New public civic institution'));
  if(c.id==='reedmarch'){
   A.equal(c.governingBody,'March Council');
   A.notEqual(c.governingBody,'Naturalists Guild');
  }
  if(c.id==='asterwyn'){
   A.equal(c.governingBody,'Hearth-Court');
   A.notEqual(c.governingBody,'Orchard College');
  }
  A.ok(c.title.length>8&&c.first.length>5&&c.independent.length>5);
  A.notEqual(c.relativeCandidate,c.first);
  A.notEqual(c.relativeCandidate,c.independent);
  A.ok(c.basis.includes(home.name));
  A.ok(['hereditary sovereignty','appointed mandate','consensual assembly mandate',
   'elected or chartered mandate'].includes(c.style));
 }
}
{
 const s=fresh(),before=E.exportGame(s),rng=s.rngState;
 const r=country(s);
 A.equal(r.polity,'Reedmarch Compact');
 A.equal(r.office,'March Council Speaker');
 A.equal(r.officeholder,'Iria Highwater');
 A.equal(r.legalProcess,'consensual assembly mandate');
 A.equal(r.publicMandates,0);
 A.equal(r.status,'in_office');
 A.equal(r.knownAnnouncements.length,0);
 A.ok(r.governingBody.includes('Council'));
 A.ok(!JSON.stringify(r).includes('householdInfluence'));
 A.equal(Realm.publicStatus(s).civicOffice.officeholder,r.officeholder);
 A.throws(()=>country(s,{officeholder:'ME',royalRank:999}),/accepts no forged ruler/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const atlas=Realm.publicAtlas(s,{type:'polity',id:'asterwyn'});
 A.equal(atlas.government,'monarchy');
 A.equal(atlas.name,'Asterwyn Crown');
}
{
 const s=fresh(413405),w=Realm.ensure(s);
 const holder=w.governance.asterwyn.holder,initial=w.counters.changesOfGovernment,events=[];
 A.throws(()=>Gov.transition(w,'asterwyn',5400,{random:()=>.99,emit:x=>events.push(x)}),
  /hereditary sovereign may not be replaced/);
 const rec=Gov.review(w,'asterwyn',5400,x=>events.push(x));
 A.equal(rec.changed,false);A.equal(rec.officeholder,holder);
 A.equal(w.governance.asterwyn.courtReviews,1);
 A.equal(w.governance.asterwyn.holder,holder);
 A.equal(w.counters.changesOfGovernment,initial);
 A.equal(events.length,1);
 A.match(events[0].text,/No death, abdication, heir or succession is confirmed/);
 A.equal(events[0].region,'asterwyn');
 const crisis=Gov.crisisReview(w,'asterwyn',5440,x=>events.push(x));
 A.equal(crisis.changed,false);A.equal(w.governance.asterwyn.holder,holder);
 A.equal(w.governance.asterwyn.status,'court_review');
 A.equal(w.counters.changesOfGovernment,initial);
 w.countries.asterwyn.stability=30;w.countries.asterwyn.legitimacy=30;
 A.equal(Gov.recover(w,'asterwyn',5441,()=>{}),false);
 w.countries.asterwyn.stability=70;w.countries.asterwyn.legitimacy=70;
 A.equal(Gov.recover(w,'asterwyn',5442,x=>events.push(x)),true);
 A.equal(w.governance.asterwyn.status,'in_office');
 A.equal(w.governance.asterwyn.holder,holder);
 A.equal(w.counters.changesOfGovernment,initial);
}
{
 const s=fresh(413406),w=Realm.ensure(s);
 const record=w.governance.reedmarch,counters=w.counters.changesOfGovernment;
 w.countries.reedmarch.stability=75;w.countries.reedmarch.legitimacy=77;
 const notices=[];
 const reelect=Gov.transition(w,'reedmarch',1800,{random:()=>0,emit:x=>notices.push(x)});
 A.equal(reelect.changed,false);
 A.equal(record.holder,'Iria Highwater');
 A.equal(record.mandateNumber,1);
 A.equal(w.counters.changesOfGovernment,counters);
 const choose=Gov.transition(w,'reedmarch',1830,{random:()=>.99,emit:x=>notices.push(x)});
 A.equal(choose.changed,true);
 A.equal(choose.officeholder,'Nessa Towbank');
 A.equal(record.holder,'Nessa Towbank');
 A.equal(record.mandateNumber,2);
 A.equal(w.counters.changesOfGovernment,counters+1);
 A.equal(record.lastChangeDay,1830);
 A.equal(notices.length,2);
 A.ok(notices.every(x=>x.region==='reedmarch'&&x.channel==='official proclamation'));
 A.equal(Gov.report(w,'reedmarch').officeholder,'Nessa Towbank');
 A.equal(Gov.report(w,'reedmarch').knownAnnouncements.length,2);
 A.equal(Gov.report(w,'reedmarch').publicMandates,2);
 A.equal(s.player.meridian.gates.length,0);
 A.equal(s.table?.meridianTechniques,undefined);
}
{
 const s=fresh(413407),w=Realm.ensure(s),a=Houses.byId[Gov.byId.reedmarch.houseId];
 w.houses[a.id].influence=90;
 w.countries.reedmarch.stability=20;
 w.countries.reedmarch.legitimacy=18;
 const mark=w.counters.changesOfGovernment;
 const replacement=Gov.transition(w,'reedmarch',500,{crisis:true,random:()=>.60,emit:()=>{}});
 A.equal(replacement.changed,true);
 A.equal(replacement.officeholder,a.relative);
 A.equal(w.governance.reedmarch.status,'interim');
 A.equal(w.counters.changesOfGovernment,mark+1);
 A.equal(s.player.family,null);
 A.equal(s.player.rankings?.fieldwork,0);
 A.equal(s.player.arcane.circles,0);
}
{
 const s=fresh(413408),w=Realm.ensure(s),oldMonth=w.ticks.months;
 // The actual country simulation drives legal renewals; a fixed local
 // calendar never automatically creates a new king after fifteen years.
 // Real years contain five Concord Days outside the twelve work-months.
 W.advance(s,30*62);
 A.ok(w.ticks.months>=60);
 A.ok(w.governance.reedmarch.mandateNumber>=1);
 A.ok(w.governance.asterwyn.mandateNumber===0);
 A.ok(w.governance.red_sultanate.mandateNumber===0);
 A.ok(w.governance.sunforge.mandateNumber===0);
 A.ok(w.ticks.months>oldMonth);
 A.ok(w.counters.changesOfGovernment>=0);
 A.ok(w.governance.reedmarch.recentPublic.length>0);
 const s2=E.importGame(E.exportGame(s));
 A.deepEqual(country(s2),country(s));
}
{
 const s=fresh(413409),w=Realm.ensure(s);
 W.advance(s,35);
 delete w.governance;
 const original=E.exportGame(s),rng=s.rngState;
 A.equal(country(s).officeholder,'Iria Highwater');
 A.equal(E.exportGame(s),original);
 A.equal(s.rngState,rng);
 W.advance(s,30);
 A.match(w.governance.asterwyn.source,/First reconstructed present-day public office register/);
 A.equal(w.governance.asterwyn.holder,'Queen Orelia Asterwyn');
 A.equal(w.governance.asterwyn.mandateNumber,0);
 A.equal(s.player.family,null);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-governance-office-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(413412);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const untouched=FS.readFileSync(file,'utf8');
  const response=Turn.execute(file,{id:'public_leadership_0001',
   mode:'rule',system:'world',operation:'governmentStatus',params:{}});
  A.equal(response.applied,false);
  A.equal(response.output.rules.officeholder,'Iria Highwater');
  A.equal(FS.readFileSync(file,'utf8'),untouched);
  A.throws(()=>Turn.execute(file,{id:'fake_king_0001',mode:'rule',
   system:'world',operation:'governmentStatus',params:{king:'me'}}),/accepts no forged ruler/);
  A.equal(FS.readFileSync(file,'utf8'),untouched);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Twenty-four distinct public governments, real electoral mandates, royal non-succession reviews, independent civic leaders and read-only historical provenance');
