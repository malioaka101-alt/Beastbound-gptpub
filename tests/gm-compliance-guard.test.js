'use strict';
// Disposable fixtures. The real Maddoc checkpoint, if present, is read ONLY.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),Rules=require('../rules'),
 GM=require('../scripts/gm-compliance'),Panels=require('../panels'),
 Turn=require('../scripts/chat-turn'),Continuity=require('../scripts/scene-continuity');
const game=()=>E.newGame({name:'Continuity Witness',seed:461893});
const s=game(),old=E.exportGame(s),hud=Panels.hudData(s);
{
 const brief=GM.brief(s),view=Rules.act(s,{system:'world',operation:'gmComplianceStatus',params:{}});
 A.deepEqual(view,brief,'One read-only source of truth for GM context');
 A.equal(brief.panel.skin,GM.SKIN);
 A.equal(brief.location,s.world.location);
 A.equal(brief.player.name,s.player.name);
 A.equal(brief.knownFamily.length,0,'A new engine-only save cannot invent a family');
 A.equal(E.exportGame(s),old,'GM briefing never moves clock, hidden lives or dice');
 const real=GM.audit(s,{assertions:[
  {type:'npc-present',npcId:'elira'},
  {type:'panel-skin',skin:'beastbound-ink-gold-manhwa-v1'},
  {type:'spoken-exact',words:'Time for work again'}
 ],scene:'Maddoc says: "Time for work again" while approaching the public counter.'});
 A.equal(real.clear,true,'A genuinely anchored current NPC and exact player speech are acceptable');
 A.equal(GM.audit(s,{assertions:[
  {type:'panel-skin',skin:'generic-grey-card'}
 ]}).clear,false);
 A.equal(GM.audit(s,{assertions:[
  {type:'player-has-item',itemId:'meridian_notes'}
 ]}).clear,false,'Theory reading is not notebook custody');
 A.equal(GM.audit(s,{assertions:[
  {type:'npc-knows',npcId:'elira',factId:'private_family_allowance'}
 ]}).clear,false,'NPC proximity never grants confidential knowledge');
 A.equal(GM.audit(s,{assertions:[
  {type:'spoken-exact',words:'Time for work again'}
 ],scene:'He goes to work.'}).clear,false,'Never paraphrase quoted player speech');
 A.throws(()=>GM.validateAssertions([{type:'npc-present',npcId:'elira',consent:true}]),
  /Unsupported or untyped/,'The GM cannot choose NPC consent');
 A.equal(E.exportGame(s),old);
}
{
 const scene='At the guild counter, Elira says aloud that she read the latest public charter notice.';
 const witness='Elira says aloud that she read the latest public charter notice';
 const result=Continuity.apply(s,{id:'gm_source_witness_461893',mode:'checkpoint',
  scene,summary:'The player personally witnessed Elira discuss the public charter notice.',
  continuity:[{id:'elira_sourced_charter_knowledge',action:'record',
   subject:{kind:'person',id:'elira'},category:'npc-knowledge',
   statement:'Elira personally read the publicly posted charter notice.',
   witness,visibility:'player-known'}]});
 A.equal(result.recorded,1);
 A.equal(GM.audit(s,{assertions:[
  {type:'npc-knows',npcId:'elira',factId:'elira_sourced_charter_knowledge'}
 ]}).clear,true);
 A.equal(GM.audit(s,{assertions:[
  {type:'npc-knows',npcId:'otto',factId:'elira_sourced_charter_knowledge'}
 ]}).clear,false,'One actor does not inherit another actor’s knowledge');
}
{
 const html=Panels.inChatHtml(s);
 A.match(html,/◇ BEASTBOUND/);
 A.match(html,/background:radial-gradient/);
 A.match(html,/#0b1120/);
 A.match(html,/border:1px solid #b1915c/);
 A.match(html,/prefers-reduced-motion/);
 A.ok(!/generic-grey-card|#fff;/.test(html));
 A.equal(html.includes(s.player.name),true);
 A.equal(html.includes('undefined'),false);
 const dubious=game();dubious.player.name='Maddoc <script>alert(1)</script>';
 const rendered=Panels.inChatHtml(dubious);
 A.ok(rendered.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
 A.ok(!rendered.includes('<script>alert'));
 const before=E.exportGame(s);
 Panels.inChatHtml(s);A.equal(E.exportGame(s),before,'Approved fantasy renderer is entirely display-only');
 A.throws(()=>require('../ui/beastbound-window').render({...hud,presentation:{skin:'grey'}}),/Approved source-backed/);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gm-compliance-'));
 const file=Path.join(dir,'save.json');
 try{
  const state=game(),initial=E.exportGame(state)+'\n';
  FS.writeFileSync(file,initial);
  const falseClaim={id:'gm_unverified_presence_461893',mode:'checkpoint',
   scene:'A distant notable has appeared here without any local witness.',
   gmAssertions:[{type:'npc-present',npcId:'notable:remote_scholar'}]};
  A.throws(()=>Turn.execute(file,falseClaim),/GM compliance gate rejected/);
  A.equal(FS.readFileSync(file,'utf8'),initial,'Failed claim does not corrupt a checkpoint');
  const falseRoll={id:'gm_no_dice_461893',mode:'rule',
   system:'discipline',operation:'practice',
   params:{system:'soul',method:'self-awareness',minutes:30},
   scene:'This describes a practice attempt but asserts unsupported possession.',
   gmAssertions:[{type:'player-has-item',itemId:'arcane_notes'}]};
  A.throws(()=>Turn.execute(file,falseRoll),/GM compliance gate rejected/,
   'Unsupported narration must fail before any original roll');
  A.equal(FS.readFileSync(file,'utf8'),initial);
  const spoken='Time for work again';
  const verified={id:'gm_player_speech_461893',mode:'checkpoint',
   scene:'The player character says: "'+spoken+'".',
   gmAssertions:[{type:'spoken-exact',words:spoken},
    {type:'panel-skin',skin:GM.SKIN}]};
  const applied=Turn.execute(file,verified);
  A.equal(applied.ok,true);A.equal(applied.applied,true);
  A.equal(applied.clock,E.clock(state));
  A.equal(E.importGame(FS.readFileSync(file,'utf8')).world.minutes,state.world.minutes);
  A.equal(Turn.execute(file,verified).duplicate,true,'A replay never executes a second time');
  const readBefore=FS.readFileSync(file,'utf8');
  const audit=Turn.execute(file,{id:'gm_review_only_461893',mode:'rule',
   system:'world',operation:'gmSceneAudit',params:{assertions:[
    {type:'npc-knows',npcId:'elira',factId:'imagined_secret'}]}});
  A.equal(audit.ok,true);A.equal(audit.applied,false);
  A.equal(audit.output.rules.clear,false);
  A.equal(FS.readFileSync(file,'utf8'),readBefore);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
const live=Path.join(__dirname,'..','saves','bb_20261114_1dtmtp9.json');
if(FS.existsSync(live)){
 const original=FS.readFileSync(live,'utf8'),m=E.importGame(original);
 const snapshot=GM.brief(m);
 const hedra=snapshot.knownFamily.find(x=>x.name==='Hedra Maddren');
 A.ok(hedra,'A real named family member must not disappear from the briefing');
 A.match(hedra.confirmedRelationship||'',/mother/i,
  'The player-confirmed mother relationship overrides generic guardian role');
 A.equal(GM.audit(m,{assertions:[{type:'relationship',npcId:hedra.npcId,
  kinship:'mother'}]}).clear,true);
 A.equal(GM.audit(m,{assertions:[{type:'relationship',npcId:hedra.npcId,
  kinship:'aunt'}]}).clear,false);
 A.equal(GM.audit(m,{assertions:[{type:'npc-present',npcId:hedra.npcId}]}).clear,
  false,'A relative is not automatically present at the start of the day');
 A.equal(GM.audit(m,{assertions:[{type:'player-has-item',itemId:'meridian_notes'}]}).clear,false);
 A.equal(GM.audit(m,{assertions:[{type:'npc-knows',npcId:hedra.npcId,
  factId:'bram_s_private_secrets'}]}).clear,false);
 A.equal(FS.readFileSync(live,'utf8'),original,'The live campaign is never edited by compliance tests');
}
console.log('GM compliance: non-mutating source brief, NPC presence and secret-knowledge proof, verified mother relation, notebook custody, exact player speech, fail-closed pre-roll audit and real ink-gold HUD PASS');
