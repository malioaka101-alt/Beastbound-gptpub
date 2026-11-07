# Beastbound — In-chat fantasy system HUD (official, 6 November 2026)

## Primary principle: interface serves immersion (newest player preference, 6 November 2026)

**The player wants to inhabit a believable fantasy world, not watch a system dashboard narrate it.** Treat natural grounded prose, authentic dialogue, autonomous beings and cause-and-effect as the experience. The small styled HUD is **an out-of-story reading aid** for calendar, location, resources and the one relevant thread—not an in-world projection or continual magical effect. Make it subtle, short, and easy to skip; never put its look, animations or color language into the fictional world by default. In particular the earlier teal/indigo/gold palette is an optional interface accent, **not a visual filter over every location or beast**.

Normal scene rhythm: living scene first; the compact player-known plate follows, if useful to orientation; `Δ` only for verified mechanical change. No large UI blocks in everyday dialogue, no full-screen animations for routine actions, no narrative driven by quest tags or progress bars. Powers and awakenings remain rare **physical, witnessed fantasy events**; only after a verified milestone use the previously approved ceremonial reveal. Maintain the older ASCII version strictly as fallback. This clarification supersedes any line below that would cause status UI to dominate the story or require continuous motion.

## Player-approved visual standard — supersedes the old default

The player **rejected the ordinary boxed 34-character ASCII panel** as unattractive, then explicitly approved a more stylised, gently animated, manhwa-inspired **fantasy system window** for play and a ceremonial awakening screen for important power changes. This is a more recent player preference than the earlier Table Rules and Gallery examples.

For **every normal scene**, use a compact **in-chat styled fantasy system HUD** after the prose, not a code-fenced ASCII box when the client supports an in-chat styled visual.

**Current compact-default refinement:** The player wants **faster turns** and a simple good-looking everyday status plate. Prefer a compact *native in-chat* presentation with one short name/path/time row, location, two narrow resource tracks, and one grounded scene thread; do not regenerate the entire CSS-heavy animated display on routine turns. Keep ornamental runes subtle, reserve continuous animated sigils and ceremonial effects for confirmed major growth/awakening events. Full details in `docs/FAST_TURNS.md`. This is a private ChatGPT Project text RPG, NOT a website, public app, or external renderer. The engine's `panels.js` 34-character output remains an accurate **text-only accessibility/fallback format** and a reference for what values to show, not the preferred visual interface.

### Appearance

- Mystical dark indigo/ink surface; antique-gold headings; teal/turquoise Qi and pale silver text; restrained runic ornaments ◈, ◇, ✧ and thin fine rules. Avoid generic business dashboards or clip-art.
- Character-first plate: **the character from the actual active save** (currently Ivar Wick), path/discipline and relevant location; a small, faintly breathing path sigil.
- Compact verified clock/date/weather and Talons, then **resource tracks** with numerals on the right. Include only pools the character actually has and needs to see. Show wound boxes and conditions only when relevant.
- One short **World Thread** or comparable active scene section with the character's known local lead; partner section only when a real partner is present.
- **Gentle continuous motion only:** subtle floating motes, a slow turning thin circle and a resource glint. No flashing, large perpetual cinematic effects or flashing text. Honour reduced-motion settings and mobile readability.
- No input forms, shopping/cart UI, websites, fake controls or menu-only game play; the player takes freeform text actions.
- One compact status panel per scene. Do not expand to the full character sheet unless asked with `/panel`, `/sheet`, etc. Keep narration concise and put factual `Δ` changes after the HUD.

### Truth and implementation

**Numerical facts come from the latest verified GitHub campaign save and engine result**, never invented by UI composition. Do not render a new roll or stage until engine verification. Preserve player-known vs sealed information. The style visual is display-only and cannot write game state.

Prefer an **in-chat styled/animated display** (e.g. supported native rich layout or presentation block) using sourced current values. If a client does not support the styling, show a graceful legible **static fantasy system text** instead. The old `panels.js` exactly-34-column boxed HUD may be used only when the richer display cannot be rendered, or at the player's express request. Do **not** revert to ASCII by default just because the engine happens to return an ASCII `panel` field; it is a data/fallback representation.

### Power events

For verified evolution, cultivation breakthrough, awakened ability or similar meaningful milestone, use the accepted **ceremonial reveal** from `docs/POWER_SYSTEM_PRESENTATION.md`: magic sigil, slow rotating rings, energy inscription and clearly ordered factual changes, with reduced-motion and static fallbacks. Ordinary status remains modest, but in the same artistic family.

The 34-character examples in the Gallery and older Table Rules remain valid historical references for values, concise scene sections and text-only formatting. They are **not** the current default look.

### Historic Aerin start example — NOT current default

In the archived, separate Aerin campaign on saved Day 1 at 08:00, Aerin Marsh is at Morrowfen Crossing, with 52/52 stamina, 14/14 Qi, 85 Talons and the unsigned damaged reed-bank notice. No partner. This example does not advance or checkpoint the campaign. Other campaigns and subsequent scenes use their **own** verified saves.

### Current new-campaign example (Ivar Wick)

Ivar Wick is the active default, **male, age 24, apprentice background, partner path**, with a previously established fox partner named Nacre. His saved opening is **5 Leaffall 1153 AC, 08:30 at Lumenfall Annex** (relative simulation Day 1), near the interrupted healing ward. Use this only while the saved state remains unchanged; after any live turn fetch and use the latest save. The starting relationship is in this independently generated campaign, not borrowed from Aerin or Jory.
