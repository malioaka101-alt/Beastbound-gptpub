# Beastbound — In-chat fantasy system HUD (official, 6 November 2026)


## Active-game state (14 November 2026)

**All previous campaigns were explicitly ended and their tracked live gameplay records deleted. No active/default campaign exists.** No former character, partnership, calendar or numeric values may be treated as current. Only display a real character panel after explicit new campaign creation and a newly verified save.

## Expanded panel atlas and personal sigils — latest player direction (14 November 2026)

The player approved the gallery's core aesthetic but requested **power-system symbols that visibly and uniquely evolve as the individual advances**, together with **proper dedicated combat, profession, specialised skills, techniques/abilities, affiliations, player-founded organisations, families, households, clans and lineages**. These are not optional store add-ons. Read the comprehensive visual and data-source contract at [Adaptive Panel Atlas and Personal Power Sigils](ADAPTIVE_PANEL_ATLAS.md) when preparing these panels; render only the relevant small contextual view during ordinary play. A personal sigil may grow only with **verified original earned anatomy, stage or specialisation** and must not imply an unearned power, inherited right, NPC agreement or secret potential. The atlas marks which named panels currently exist in the fallback engine and which are designs for native chat or future read-only adapters; do not pretend unsupported routes have been implemented.

## Primary principle: interface serves immersion (newest player preference, 6 November 2026)

**The player wants to inhabit a believable fantasy world, not watch a system dashboard narrate it.** Treat natural grounded prose, authentic dialogue, autonomous beings and cause-and-effect as the experience. The small styled HUD is **an out-of-story reading aid** for calendar, location, resources and the one relevant thread—not an in-world projection or continual magical effect. Make it subtle, short, and easy to skip; never put its look, animations or color language into the fictional world by default. In particular the earlier teal/indigo/gold palette is an optional interface accent, **not a visual filter over every location or beast**.

Normal scene rhythm: living scene first; the compact player-known plate follows, if useful to orientation; `Δ` only for verified mechanical change. No large UI blocks in everyday dialogue, no full-screen animations for routine actions, no narrative driven by quest tags or progress bars. Powers and awakenings remain rare **physical, witnessed fantasy events**; only after a verified milestone use the previously approved ceremonial reveal. Maintain the older ASCII version strictly as fallback. This clarification supersedes any line below that would cause status UI to dominate the story or require continuous motion.

## Everyday adaptive HUD v2 — new source-backed data flow (8 November 2026)

**One dynamic HUD, not a handcrafted panel per turn.** The engine's `panels.hudData(savedState)` returns a small **structured, player-known view model** directly from the actual campaign save. `scripts/chat-turn.js` now includes `hud` beside the original historical `panel` fallback on status, inspection, read-only and applied turns. The Project GM should use **one native, responsive in-chat fantasy-styled layout** with this data (no repeated CSS-heavy AppBlock), usually a small dark/antique gold plate. Show the scene in natural prose first; the interface should never supplant the scene. `panels.characterData(savedState)` is the source for a detailed character/family view or new-character introduction.

**The core everyday display should give:**

- Real **name**, age/background in a small identity subtitle and relevant discipline if established; the path is not a class menu.
- **Actual civil calendar date** (day, month, year AC) and weekday when anchored in the save, plus live hour, place and weather. If an older campaign has no established civil date, show *“Civil date unrecorded · Day N”*—never invent a season/year or silently anchor it. Aerin's Day 1 08:05 trial has no absolute date. Newly generated independent campaigns are already anchored at creation and must show their real saved date, not only “Day 1”.
- **Relevant resources:** Stamina always, Qi when the Meridian path is active/used, Mana when Arcane is relevant, Soul when actually earned, Health when conflict/injury makes it consequential, plus any currently verified conditions. The money/purse is available in compact form. No automatically displayed unused magical pools.
- **A scene-sensitive detail** chosen from verified current activity: an immediate threat, a personally observed beast, genuine known guild notices, an active focus or a bonded partner. This selection must not leak hidden goals, unseen future action, private NPC secrets, RNG state or assume a contract. Avoid generic quest tracking when the person is simply living or speaking.
- Small enough to scan on a phone; no forms, useless badges, fixed menu of “quest objectives”, empty decorative rows, or bulky character tables. Display an expanded profile only on request or at a fitting opening moment.

**Character information is meaningful but not invented.** The current legacy Aerin save truly records age 36, a fieldworker background, Meridian Foundation Student, a single-guardian household, two siblings, estranged ties and a guild-clerk household trade. It **does not** contain a civil date, relatives' names or a detailed childhood. Her expanded profile can show the established facts, but must not create personal history or identify family members retroactively. The newer `scripts/new-campaign.js` generator produces a deterministic and more varied name independent of opening location, visible names/relations for known household members, a short pre-game history tied to actual background and family trade, and a civil date at creation. This is foundational personal context, **not** hidden personality or future social agreement.

**Technical data contract:** `hudData` is read-only and must never consume RNG or advance the clock. Its fields are `name`, `identity`, `date` (`absolute`, `label`, `known`, `relativeDay`, optional `weekday`), `time`, `daypart`, `location`, `weather`, `currency`, `resources`, `conditions`, `partners`, `focus`, and optional `context`. Present existing values directly in the native chat panel, in concise typographic order. No second template engine, browser service, account, public deployment or fake interactive controls.

## Player-approved visual standard — supersedes the old default

The player **rejected the ordinary boxed 34-character ASCII panel** as unattractive, then explicitly approved a more stylised, gently animated, manhwa-inspired **fantasy system window** for play and a ceremonial awakening screen for important power changes. This is a more recent player preference than the earlier Table Rules and Gallery examples.

For **every normal scene**, use a compact **in-chat styled fantasy system HUD** after the prose, not a code-fenced ASCII box when the client supports an in-chat styled visual.

**Current compact-default refinement:** The player wants **faster turns** and a simple good-looking everyday status plate. Prefer a compact *native in-chat* presentation with one short name/path/time row, location, two narrow resource tracks, and one grounded scene thread; do not regenerate the entire CSS-heavy animated display on routine turns. Keep ornamental runes subtle, reserve continuous animated sigils and ceremonial effects for confirmed major growth/awakening events. Full details in `docs/FAST_TURNS.md`. This is a private ChatGPT Project text RPG, NOT a website, public app, or external renderer. The engine's `panels.js` 34-character output remains an accurate **text-only accessibility/fallback format** and a reference for what values to show, not the preferred visual interface.

### Appearance

- Mystical dark indigo/ink surface; antique-gold headings; teal/turquoise Qi and pale silver text; restrained runic ornaments ◈, ◇, ✧ and thin fine rules. Avoid generic business dashboards or clip-art.
- Character-first plate: **the character from a verified newly authorised save**, path/discipline and relevant location; a small, faintly breathing path sigil.
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

### Historical examples retired

Past named-character panels are retired and are not eligible as current saves, companions or narrative pickup scenes. Future panel demonstrations must use visibly hypothetical examples or a newly created, explicitly authorised campaign with verified source data.
