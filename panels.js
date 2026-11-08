'use strict';
// Beastbound Project-chat panels. Gallery-inspired 34-codepoint text boxes;
// every printed field is drawn from the active save and player-known facts.
const E = require('./engine.js');
const Realm = require('./world/simulation');
const WIDTH = 34, INNER = 30;
const cp = value => Array.from(String(value ?? ''));
const limit = (value, n=INNER) => {
  const c=cp(value); if(n<=0)return '';
  return c.length<=n?c.join(''):c.slice(0,n-1).join('')+'…';
};
const pad = (value,n=INNER) => {const s=limit(value,n);return s+' '.repeat(n-cp(s).length);};
const pair = (left,right) => {
  const r=limit(right,INNER),room=INNER-cp(r).length;
  if(room<2)return limit(r,INNER);
  return pad(limit(left,room-1),room)+r;
};
const top = label => {const x=limit('═ '+label+' ',32);return '╔'+x+'═'.repeat(32-cp(x).length)+'╗';};
const bottom = () => '╚'+'═'.repeat(32)+'╝';
const heavy = () => '╠'+'═'.repeat(32)+'╣';
const row = value => '║ '+pad(value)+' ║';
// Balanced section plates follow the user's Panel Gallery:
//   ╟─ GUILD NOTICE ────── unsigned ─╢
const section = (label,hint='') => {
  const right=hint?' '+limit(hint,12)+' ─':'';
  // Reserve a divider and shorten long labels before they collide with hints.
  const room=32-cp(right).length-2;
  const left='─ '+limit(String(label).toUpperCase(),Math.min(16,Math.max(1,room-3)))+' ';
  return '╟'+left+'─'.repeat(32-cp(left).length-cp(right).length)+right+'╢';
};
const bar = (v,max) => {
  const count=max>0 ? Math.max(0,Math.min(10,Math.round(10*v/max))):0;
  return '█'.repeat(count)+'░'.repeat(10-count);
};
const vital = (name,amount,max) => row(pair(String(name).padEnd(5,' ')+bar(amount,max),`${amount}/${max}`));
const daypart = hour => hour<6?'Night':hour<12?'Morning':hour<17?'Afternoon':hour<21?'Evening':'Night';
const MONTHS=['Deepfrost','Thawing','Seedwake','Nesting','Greentide','Highsun','Swelter','Harvestmoon','Migration','Leaffall','Longnight','Hearthmonth'];
const date = s => {
  const anchored=Realm.calendar(s).absoluteDate;
  if(anchored)return anchored.replace(/ AC$/,'').toUpperCase();
  const d=s.world?.date;
  if(d && Number.isInteger(d.month) && Number.isInteger(d.day) && d.month>=1&&d.month<=13 && d.day>=1 && d.day<=(d.month===13?5:30))return d.month===13?`CONCORD ${d.day}`:`${d.day} ${MONTHS[d.month-1].toUpperCase()}`;
  return `DAY ${E.day(s)}`;
};
const weather = s => String(s.world?.weather||'Fair').split(/[ ,]/)[0] || 'Fair';
const location = s => E.LOCATIONS[s.world.location]?.name || String(s.world.location||'Unknown place');
const time = s => E.clock(s).split(', ')[1]||'08:00';
const now = s => {
  if(s.chatRuntime?.focus?.length)return s.chatRuntime.focus.slice(0,2);
  if(s.battle)return [s.battle.playerCover?'Behind '+s.battle.playerCover.kind:'Combat underway'];
  if(s.encounter && s.beasts?.[s.encounter.beastId])return ['Wild '+s.beasts[s.encounter.beastId].name];
  if(s.world.location==='crossing'&&E.day(s)===1&&s.flags?.openingHook)return [s.flags.openingHook.includes('reed bank')?'Damaged reed-bank notice':s.flags.openingHook];
  return [];
};
const wound = s => s.table?.healthModel==='wounds-v1'?s.table.combatants?.player:null;
const woundRow = c => {
  const boxes=Array.isArray(c.boxes)?c.boxes:[3,2,1],w=c.wounds||[0,0,0];
  return 'Wounds L '+ '■'.repeat(Math.min(w[0],boxes[0]))+'□'.repeat(Math.max(0,boxes[0]-w[0]))+
    ' S '+ '■'.repeat(Math.min(w[1],boxes[1]))+'□'.repeat(Math.max(0,boxes[1]-w[1]))+
    ' C '+ '■'.repeat(Math.min(w[2],boxes[2]))+'□'.repeat(Math.max(0,boxes[2]-w[2]));
};
function addWounds(lines,s){
  const c=wound(s);
  if(c){if(c.wounds.some(x=>x>0))lines.push(row(woundRow(c)));
    if(c.status && c.status!=='ok')lines.push(row('Status: '+c.status));
  }else if(s.player.health<s.player.maxHealth)lines.push(row('Legacy HP '+s.player.health+'/'+s.player.maxHealth+' · review'));
  if(s.player.conditions?.length)lines.push(row('Condition: '+s.player.conditions.slice(0,2).join(', ')));
}
// Word-wrap long, player-known world news instead of swallowing its meaning
// behind a one-line ellipsis. Panels remain exactly 34 characters wide.
const wrapText=(text,prefix='')=>{
 const words=String(text??'').split(/\s+/).filter(Boolean),out=[];
 let current=prefix;
 for(const word of words){
  const firstWidth=cp(current).length;
  const space=firstWidth&&current.trim()&&!current.endsWith(' ')?' ':'';
  if(cp(current+space+word).length>INNER&&current.trim()){
   out.push(current);current='  '+word;
  }else current+=space+word;
 }
 if(current.trim())out.push(current);
 return out.map(x=>limit(x,INNER));
};
const detail = (lines,contents) => {
 for(const item of contents||[]){
  if(Array.isArray(item))lines.push(row(pair(item[0],item[1])));
  else if(item&&typeof item==='object'&&item.left!==undefined)lines.push(row(pair(item.left,item.right||'')));
  else lines.push(row(item));
 }
};
const close = lines => {
 lines.push(bottom());
 if(lines.some(l=>cp(l).length!==WIDTH))throw Error('Panel width failure');
 return lines.join('\n');
};
// One source-of-truth view model for the *native in-chat* everyday HUD.
// The fallback 34-column box is not the presentation API. Each real turn can
// return these small fields once; the GM does not rebuild CSS or reread files.
// Only active-save player-known facts are allowed; no hidden NPC intentions.
function characterData(state){
 const s=E.importGame(state),p=s.player,f=p.family||null,h=p.history||null;
 return {name:p.name,age:p.age,background:p.background,path:p.path,
  ...(p.gender?{gender:p.gender}:{}),
  ...(f?{family:{household:f.household,siblings:f.siblings,
   ties:f.ties,homeTrade:f.homeTrade,
   ...(Array.isArray(f.members)?{members:f.members.map(x=>({
    relation:x.relation,name:x.name
   }))}:{})}}:{}),
  ...(h?{knownHistory:{upbringing:h.upbringing,
   earlyWork:h.earlyWork,familySituation:h.familySituation}}:{})
 };
}
function hudData(state){
 const s=E.importGame(state),p=s.player,calendar=Realm.calendar(s),
  loc=location(s),hour=Number(time(s).slice(0,2)),
  resources=[{key:'stamina',label:'Stamina',current:p.stamina,max:p.maxStamina}];
 if(p.path==='meridian'||p.meridian?.stage>0||p.qi<p.maxQi)
  if(Number.isFinite(p.maxQi)&&p.maxQi>0)
   resources.push({key:'qi',label:'Qi',current:p.qi,max:p.maxQi});
 if(p.path==='arcane'||p.arcane?.circles>0)
  if(Number.isFinite(p.maxMana)&&p.maxMana>0)
   resources.push({key:'mana',label:'Mana',current:p.mana,max:p.maxMana});
 if(Number.isFinite(p.soul?.reserveMax)&&p.soul.reserveMax>0)
  resources.push({key:'soul',label:'Soul',current:p.soul.reserve,max:p.soul.reserveMax});
 const woundState=wound(s),wounds=woundState?.wounds||[];
 if(s.battle||s.encounter||wounds.some(x=>x>0)||
    (!woundState&&p.health<p.maxHealth))
  resources.unshift({key:'health',label:'Health',current:p.health,max:p.maxHealth});
 const conditions=[...(p.conditions||[]).map(x=>typeof x==='string'?x:x.type||'Condition')];
 if(woundState?.status&&woundState.status!=='ok')
  conditions.push(woundState.status);
 const partners=(p.partnerIds||[]).filter(id=>s.beasts?.[id])
  .slice(0,2).map(id=>({
   name:s.beasts[id].name,
   species:E.SPECIES[s.beasts[id].species]?.name||s.beasts[id].species,
   ...(Number.isFinite(s.beasts[id].energy)&&Number.isFinite(s.beasts[id].maxEnergy)?
    {energy:s.beasts[id].energy,maxEnergy:s.beasts[id].maxEnergy}:{})
  }));
 let focus=now(s).slice(0,2);
 let context=null;
 if(s.battle)context={kind:'combat',title:'In conflict',detail:'The active encounter has not ended'};
 else if(s.encounter&&s.beasts?.[s.encounter.beastId]){
  const b=s.beasts[s.encounter.beastId];
  context={kind:'beast',title:b.name,
   detail:s.encounter.observed&&s.encounter.observation?
    s.encounter.observation:'Nearby; its intentions are not established'};
 }else if(s.world.location==='crossing'){
  const known=Object.values(s.table?.publicFieldNotices?.notices||{})
   .filter(n=>n&&n.seenAtMinute<=s.world.minutes);
  if(known.length)context={kind:'known-public-notices',
   title:'Guild board',detail:known.length+' postings personally read'};
 }
 if(!focus.length&&context)focus=[context.title];
 return {name:p.name,identity:{age:p.age,background:p.background,path:p.path,
    ...(p.meridian?.discipline&&p.path==='meridian'?
       {discipline:p.meridian.discipline}:{})},
  date:{absolute:calendar.absoluteDate||null,
    label:calendar.absoluteDate||'Civil date unrecorded',
    known:!!calendar.absoluteDate,relativeDay:calendar.day,
    ...(calendar.weekday?{weekday:calendar.weekday}:{})},
  time:time(s),daypart:daypart(hour),location:loc,
  weather:s.world.weather||'Unknown',coins:p.coins,
  currency:E.money(p.coins),resources,conditions,partners,
  focus,context};
}
function core(state,extra=[]){
 const s=E.importGame(state),p=s.player;
 const lines=[top(p.name.split(/\s+/)[0].toUpperCase()+' · '+date(s)),row(`${time(s)} · ${daypart(Number(time(s).slice(0,2)))} · ${weather(s)}`),row(pair(location(s),E.money(p.coins)))];
 lines.push(vital('STA',p.stamina,p.maxStamina));
 if(p.maxQi>0)lines.push(vital('QI',p.qi,p.maxQi));
 if(p.arcane?.circles>0&&p.maxMana>0)lines.push(vital('MANA',p.mana,p.maxMana));
 if(p.soul?.reserveMax>0)lines.push(vital('SOUL',p.soul.reserve,p.soul.reserveMax));
 addWounds(lines,s);
 // Partner cards show known outward statistics, never hidden potential/evolution truth.
 for(const id of (p.partnerIds||[]).slice(0,2)){
  const b=s.beasts[id];if(!b)continue;
  lines.push(section(b.name));
  const species=E.SPECIES[b.species]?.name||b.species||'Partner beast';
  detail(lines,[[`${species}${b.level?' · L'+b.level:''}`,b.individualGrade||'']]);
  if(Number.isFinite(b.stamina)&&Number.isFinite(b.maxStamina))lines.push(vital('STA',b.stamina,b.maxStamina));
  else if(Number.isFinite(b.energy)&&Number.isFinite(b.maxEnergy))lines.push(vital('ESS',b.energy,b.maxEnergy));
  if(Number.isFinite(b.trust))lines.push(vital('TRUST',b.trust,100));
 }
 const focus=now(s);
 if(focus.length){lines.push(section('NOW'));for(const f of focus.slice(0,2))lines.push(row('◆ '+f));}
 if(s.encounter && !s.battle && s.beasts?.[s.encounter.beastId]){
  const b=s.beasts[s.encounter.beastId];
  lines.push(section('WILD BEAST'));
  lines.push(row('◆ '+b.name));
  if(s.encounter.observed&&s.encounter.observation)lines.push(row(s.encounter.observation));
 }
 for(const x of extra||[]){if(!x || !x.title)continue;lines.push(section(x.title,x.hint));detail(lines,x.rows);}
 return close(lines);
}
function panelMenu(s){
 const names=['Status','Character','Tamer','Quests','Bag','People','World','Journal'];
 if(Object.keys(s.researchProjects||{}).length)names.push('Research');
 for(const id of s.player.partnerIds||[])if(s.beasts[id])names.push(s.beasts[id].name);
 if(s.taming)names.push('Taming');if(s.store?.open)names.push('Store');
 const lines=[top('PANELS')];
 names.forEach(n=>lines.push(row(pair('◆ '+n,n.toLowerCase()))));
 lines.push('╟'+'─'.repeat(32)+'╢');lines.push(row('Type /panel and a name.'));
 return close(lines);
}
function full(state,name){
 const s=E.importGame(state),p=s.player;
 if(!name || name==='menu' || name==='panels')return panelMenu(s);
 const aliases={sheet:'character',hero:'character',char:'character',me:'character',inventory:'bag',npcs:'people',calendar:'world',news:'world',goals:'quests',career:'tamer',licence:'tamer'};
 const key=aliases[String(name).toLowerCase()]||String(name).toLowerCase();
 const partnerId=(p.partnerIds||[]).find(id=>s.beasts[id]?.name?.toLowerCase()===key);
 const standing=['status','character','tamer','quests','bag','people','world','journal','research'];
 if(!standing.includes(key)&&!partnerId)throw Error('Unknown panel: '+name);
 const lines=[top(key.toUpperCase()),row(pair(date(s),time(s))),row(pair(location(s),weather(s))),row(pair(`STA ${p.stamina}/${p.maxStamina}`,E.money(p.coins))),heavy()];
 const sec=(label,items,hint='')=>{if(items?.length){lines.push(section(label,hint));detail(lines,items);}};
 if(key==='status'){
  lines.push(row(p.name.toUpperCase()),row(`${p.background} · ${p.path}`),row('Purse '+E.money(p.coins)));
  lines.push(section('VITALS'));lines.push(vital('STA',p.stamina,p.maxStamina));
  if(p.maxQi>0)lines.push(vital('QI',p.qi,p.maxQi));
  if(p.arcane?.circles>0&&p.maxMana>0)lines.push(vital('MANA',p.mana,p.maxMana));
  const c=wound(s);if(c&&c.wounds.some(x=>x>0))sec('WOUNDS',[woundRow(c)]);
  if(p.conditions?.length)sec('CONDITIONS',p.conditions);
  const items=now(s).map(x=>'◆ '+x);sec('RIGHT NOW',items);
  const recent=(s.chatRuntime?.journal||[]).slice(-3).map(x=>'◆ '+x.text);sec('LATEST CHANGES',recent);
 }else if(key==='character'){
  lines.push(row(p.name.toUpperCase()),row(`${p.age} · ${p.background}`),row('Path: '+p.path));
  const profile=characterData(s);
  if(!Realm.calendar(s).absoluteDate)sec('CIVIL DATE',['Unrecorded in this older save']);
  if(profile.family){
   sec('FAMILY & ROOTS',[
    'Household: '+profile.family.household,
    'Siblings: '+profile.family.siblings,
    'Ties: '+profile.family.ties,
    'Home trade: '+profile.family.homeTrade
   ]);
   if(profile.family.members?.length)sec('KNOWN RELATIVES',
    profile.family.members.map(x=>'◆ '+x.name+' · '+x.relation));
  }
  if(profile.knownHistory)sec('KNOWN HISTORY',[
   ...wrapText(profile.knownHistory.upbringing),
   ...wrapText(profile.knownHistory.earlyWork)
  ]);
  const attrs=Object.entries(p.attributes||{});
  const pairs=[];for(let i=0;i<attrs.length;i+=2){const a=attrs[i],b=attrs[i+1];pairs.push(`${a[0].toUpperCase()} ${a[1]}`+(b?` │ ${b[0].toUpperCase()} ${b[1]}`:''));}
  sec('ATTRIBUTES',pairs);
  sec('SKILLS',Object.entries(p.skills||{}).map(([k,v])=>[k,('●'.repeat(Math.min(v.rank,5))+'○'.repeat(Math.max(0,5-v.rank)))+' +'+(v.rank*2)]));
  sec('POWERS',[`Meridian gates ${p.meridian?.gates?.length||0}/108`,`Arcane circles ${p.arcane?.circles||0}/9`, `Body cycles ${p.body?.cycles?.length||0}`]);
 }else if(key==='tamer'){
  sec('PARTNERS',(p.partnerIds||[]).map(id=>s.beasts[id]?'◆ '+s.beasts[id].name:null).filter(Boolean).length?(p.partnerIds||[]).map(id=>s.beasts[id]?'◆ '+s.beasts[id].name:null).filter(Boolean):['No bonded partner']);
  sec('STANDING',[['Local reputation',p.reputation?.local??0]]);
 }else if(key==='quests'){
  const q=Object.values(s.quests||{}).filter(x=>x.status==='active');
  sec('ACTIVE',q.length?q.map(x=>'◆ '+x.title):['No active contracts']);
  if(q.length)sec('PROGRESS',q.map(x=>[x.title,`${x.progress||0}/${x.target||'?'}`]));
 }else if(key==='bag'){
  sec('PURSE',['Purse '+E.money(p.coins)]);
  const bag=Object.entries(p.inventory||{}).filter(([,v])=>v>0).map(([item,n])=>['◆ '+item.replaceAll('_',' '),'×'+n]);
  sec('CARRIED',bag.length?bag:['Bag empty']);
 }else if(key==='people'){
  const names=Object.keys(s.npcMemory||{});sec('KNOWN PEOPLE',names.length?names.map(n=>'◆ '+n):['No names recorded']);
  const heard=(s.table?.npcConversations?.records||[]).slice(-3).reverse();
  if(heard.length)sec('CONVERSATIONS',heard.flatMap(x=>[
    '◆ '+x.name+' · Day '+x.day,
    ...wrapText(x.heard,'  ')
  ]));
  const sightings=(s.sightings||[]).filter(x=>x.playerKnown!==false).slice(-4).map(x=>'◆ '+(x.name||x.species||'Beast sighted'));
  const realmSights=(s.table?.realm?.knownSights||[]).slice(-4).map(x=>'◆ '+x.name);
  sec('BEASTS MET',[...sightings,...realmSights].slice(-6));
 }else if(key==='world'){
  const local=Realm.publicStatus(s),calendar=Realm.calendar(s);
  sec('TODAY',[['In-game day',date(s)],['Time',time(s)],...wrapText('Weather: '+(s.world.weather||'Fair')),...wrapText('Location: '+location(s))]);
  sec('LOCAL WORLD',[['Region',local.region],['Council',local.polity],['Rights',local.publicRights]]);
  sec('CULTURE',wrapText(local.culture));
  sec('INSTITUTIONS',local.knownInstitutions.slice(0,4).map(n=>'◆ '+n));
  const myths=Realm.mythicLore(s,{type:'site'}).sites;
  if(myths.length)sec('MYTHIC PLACES',myths.slice(0,3).map(x=>'◆ '+x.name));
  if(calendar.absoluteDate)sec('CALENDAR',[['Date',calendar.absoluteDate],['Season',calendar.season]]);
  const publicNotes=(s.log||[]).filter(x=>['world','notice'].includes(x.type)&&!x.hidden&&!x.sealed).slice(-3).map(x=>'◆ '+x.text);
  const notices=local.publicNews.slice(-3).map(x=>'◆ '+x.text);
  sec('PUBLIC NEWS',[...notices,...publicNotes].slice(-5).flatMap(x=>wrapText(x.startsWith('◆ ')?x.slice(2):x,x.startsWith('◆ ')?'◆ ':'')));
 }else if(key==='journal'){
  const entries=(s.chatRuntime?.journal?.length?s.chatRuntime.journal:(s.log||[]).filter(x=>['story','progress'].includes(x.type)&&!x.hidden&&!x.sealed)).slice(-8).reverse();
  sec('RECENT',entries.length?entries.map(x=>'◆ '+x.text):['No journal entries']);
 }else if(key==='research'){
  const projects=Object.values(s.researchProjects||{});
  sec('RESEARCH',projects.length?projects.map(x=>['◆ '+x.name,`${x.progress||0}/${x.track||'?'}`]):['No active projects']);
 }else if(partnerId){
  const b=s.beasts[partnerId],species=E.SPECIES[b.species]?.name||b.species||'Unknown';
  lines.push(row(b.name.toUpperCase()),row(species));
  sec('FORM',[['Level',b.level??'Unknown'],['Grade',b.individualGrade||'Unknown']]);
  sec('VITALS',[['Energy',`${b.energy??'?'}/${b.maxEnergy??'?'}`],['Condition',b.conditions?.map(c=>typeof c==='string'?c:c.type).join(', ')||'None observed']]);
  sec('BOND',[['Trust',b.trust??'Unknown'],['Sync',b.syncStage??0]]);
  if(b.needs?.hunger!==undefined)sec('NEEDS',[['Hunger',b.needs.hunger]]);
 }
 return close(lines);
}
module.exports={WIDTH,core,full,hudData,characterData,clip:limit,bar,pair,section,row,top};