'use strict';
// Single reusable, presentation-only Beastbound in-chat fantasy window.
// Accepts verified HUD data from panels.hudData; no gameplay mutation, code
// execution, external assets, hidden NPC records or generic dashboard tiles.
const SKIN='beastbound-ink-gold-manhwa-v1';
const escape=x=>String(x??'').replace(/[&<>"']/g,ch=>
 ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function resource(x){
 if(!x||typeof x.key!=='string'||typeof x.label!=='string'||
   !Number.isFinite(x.current)||!Number.isFinite(x.max)||x.max<=0)
  throw Error('Only verified finite stamina/energy amounts may be displayed');
 const width=Math.max(0,Math.min(100,(x.current/x.max)*100)).toFixed(2);
 return '<div class="bbw-stat"><span>'+escape(x.label.toUpperCase())+
  '</span><b>'+escape(x.current)+' / '+escape(x.max)+'</b></div>'+
  '<div class="bbw-meter" aria-hidden="true"><i style="width:'+width+
  '%"></i></div>';
}
const CSS=`<style>
.bbw{--ink:#0b1120;--indigo:#18263c;--gold:#d7b47d;--bronze:#94754c;
 box-sizing:border-box;max-width:550px;width:100%;position:relative;
 padding:18px 22px 14px;color:#e9e2d6;
 background:radial-gradient(ellipse at 88% -12%,#324361 0%,transparent 58%),
 linear-gradient(135deg,#182439 0%,#0a1020 82%);
 border:1px solid #b1915c;border-radius:7px;
 box-shadow:inset 0 0 0 3px #101829,inset 0 0 0 4px #695536,0 5px 22px #0003;
 font:14px/1.4 Georgia,serif}
.bbw:before{content:"";position:absolute;inset:9px;
 border:1px solid #b69a6047;pointer-events:none}
.bbw-crown{color:#e1bd82;display:flex;justify-content:space-between;gap:9px;
 font:600 10px/1.3 system-ui,sans-serif;letter-spacing:1.5px}
.bbw-crown span+span{font-size:9px;color:#bca88a}
.bbw-etch{height:1px;margin:13px 0;
 background:linear-gradient(90deg,transparent,#b89a66 12%,#c6a46d 50%,#b89a66 88%,transparent)}
.bbw-name{color:#f5eada;font:700 23px/1.16 Georgia,serif}
.bbw-date{margin-top:7px;color:#d7bd8a;letter-spacing:.8px;
 font:600 11px/1.4 system-ui,sans-serif}
.bbw-place{margin-top:4px;color:#b5c3d4;font:12px/1.5 system-ui,sans-serif}
.bbw-stat{display:flex;justify-content:space-between;gap:14px;
 margin-top:13px;color:#c4cddd;font:600 11px/1.3 system-ui,sans-serif;
 letter-spacing:.5px}.bbw-stat b{color:#f2ddaf;white-space:nowrap}
.bbw-meter{height:5px;border-radius:8px;margin-top:7px;background:#29394e;overflow:hidden}
.bbw-meter i{display:block;height:100%;
 background:linear-gradient(90deg,#9c774a,#edd3a2)}
.bbw-stat:nth-of-type(odd)+.bbw-meter i{background:linear-gradient(90deg,#7b82ba,#c1c1ee)}
.bbw-coin{margin-top:11px;color:#c9ae82;font:600 11px/1.3 system-ui,sans-serif}
.bbw-label{color:#d6b67e;font:600 10px/1.4 system-ui,sans-serif;
 letter-spacing:1.3px}.bbw-thread{font:13px/1.5 Georgia,serif;color:#dfe4ef;
 margin-top:7px}.bbw-foot{text-align:center;margin-top:14px;color:#ae905c;
 font-size:11px;letter-spacing:3px}
@media (prefers-reduced-motion:reduce){.bbw,.bbw *{animation:none!important;transition:none!important}}
</style>`;
function render(hud){
 if(!hud||hud.presentation?.skin!==SKIN||
  !hud.name||!hud.date||!hud.time||!hud.location||
  !Array.isArray(hud.resources)||!hud.resources.length)
  throw Error('Approved source-backed Beastbound HUD data is required');
 const text=(hud.focus||[]).filter(x=>typeof x==='string').slice(0,1).join('');
 const world=[hud.date.weekday,hud.date.label,hud.time].filter(Boolean).join(' · ');
 const resourceParts=hud.resources.filter(x=>['stamina','health','qi','mana','soul'].includes(x.key))
  .slice(0,2).map(resource).join('');
 if(!resourceParts)throw Error('A Beastbound window needs its real vital data');
 return '<div class="bbw" role="group" aria-label="Beastbound system record">'+
  '<div class="bbw-crown"><span>◇ BEASTBOUND</span><span>✧ SYSTEM RECORD</span></div>'+
  '<div class="bbw-etch"></div>'+
  '<div class="bbw-name">'+escape(hud.name)+'</div>'+
  '<div class="bbw-date">'+escape(world)+'</div>'+
  '<div class="bbw-place">'+escape(hud.location)+' · '+escape(hud.daypart||'')+'</div>'+
  resourceParts+
  '<div class="bbw-coin">◈ PURSE · '+escape(hud.currency)+'</div>'+
  (text?'<div class="bbw-etch"></div><div class="bbw-label">✧ CURRENT THREAD</div>'+
   '<div class="bbw-thread">'+escape(text)+'</div>':'')+
  '<div class="bbw-foot">◇ ─────── ✧ ─────── ◇</div></div>'+CSS;
}
module.exports={SKIN,render};
