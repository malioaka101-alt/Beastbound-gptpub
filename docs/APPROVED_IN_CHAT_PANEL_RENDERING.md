# Beastbound — Approved in-chat fantasy window rendering contract

**Current player correction: 15 November 2026.** The player rejected a neutral, generic bordered status card and instructed that the previously agreed Beastbound panels, not a merely functional substitute, be rendered in the campaign. This contract settles the conflicting shorthand in the older `FAST_TURNS.md`, `IN_CHAT_SYSTEM_HUD.md` and `ADAPTIVE_PANEL_ATLAS.md`. It is a **presentation-only** contract: original engine facts, saves, rules and player-known visibility remain authoritative.

## Non-negotiable visual identity

The default is the earlier approved **dark-fantasy, manhwa-inspired Beastbound system window** — the same artistic family as its full status, power, combat, profession, family and beast panels. It is *not* an ordinary product/business card, a neutral platform card, a plain white rectangle with a `◈ BEASTBOUND` label, a two-by-two statistics grid, a bare markdown table, an ASCII border or a dashboard of several generic tiles.

- **Surface:** deep ink, midnight indigo/blue-black, subtle layered shade; maintain good light/dark mode contrast without relying on the app's card background. The panel retains its identity in a light surrounding chat UI.
- **Frame:** fine antique-bronze/gold double-line/ornamental edge, small luminous corner accents and restrained engraved separator. It must visibly read as a fantasy *system window*, rather than a generic rounded rectangle. Use elegant angular cuts if available; still readable at phone width.
- **Type:** compact gold **BEASTBOUND** title/overline, clear prominent character/panel name, subtle tracked secondary labels, pale-silver facts and a deliberate hierarchy. Do not use a huge title, badge collection or fake glowing game achievements.
- **Distinctive symbol:** small ornamental diamond/runic mark for the *Beastbound interface*. **Actual personal power sigils** must remain unawakened/absent until derived from the character's earned original discipline anatomy; do not present the logo as an awakened power. Where verified, the sigil evolves individually and uniquely per `ADAPTIVE_PANEL_ATLAS.md`.
- **Resources:** short slim integrated tracks (one or two relevant visible resources, actual numerator/denominator) with restrained thematic accents. No ordinary 2×2 stat tiles. In ordinary safe conversation, show Stamina and only genuinely relevant other pools; Health appears on injury/conflict. No “Soul reserve” from merely beginning Soul *practice*.
- **World thread:** one source-known immediately relevant scene line or two, integrated in a darker inset or fine ruled band. Do not invent a quest from a household chore, force an encounter, write NPC hidden emotion or display fantasy effects the player has not earned.
- **Motion:** optional micro-glow or low-frequency light sweep on a thin frame; motion never mandatory, never used as proof of advancement. Respect `prefers-reduced-motion`; a static version must look *complete*.
- **Density:** narrow, phone-friendly, typically **identity + date/location + one/two resource tracks + one scene thread**. Keep the dark artistic skin while remaining fast and unobtrusive. This is not a license to display a huge cinematic panel every dialogue turn.

## Presentation pipeline (mandatory before composing a scene)

1. Read only needed verified game context: from the latest current save or prior confirmed result, use `panels.hudData(state)` / `hud` plus source-known scene; never transcribe historical example numbers. The runtime HUD includes read-only `presentation.skin='beastbound-ink-gold-manhwa-v1'`, `presentation.variant` and this contract path.
2. Narrate the world naturally first. **Choose the panel family** from what is happening: `core` ordinarily; `beast-encounter` during observed wild contact; `combat` when actually in battle; specialized power, family, organisation, technique, career and other contexts when requested or genuinely useful. The detailed panel family is in `ADAPTIVE_PANEL_ATLAS.md`. Do not force fixed game menus.
3. **Render the actual approved window**: if supported native in-chat composition can *visibly* provide the ink/gold fantasy frame and integrated tracks, use it. If generic native cards cannot express that design, prefer a **small display-only, self-contained in-chat styled visualization** (for example a compact AppBlock with HTML/CSS and no interactive controls). Do not add a new browser, website, external renderer, image download, game service, or paid plan. Keep styling compact/reusable; the source of actual values remains the engine, never JavaScript inside the panel.
4. If neither visual style is supported, use a legible *static dark-fantasy text-style status* with meaningful ornament and hierarchy. The 34-character boxed ASCII engine panel is **last resort only** or explicitly requested. Do not call a neutral white/grey platform card “the approved panel” merely because it has a border and `◈`.
5. Show real rolls inline with the narration and `Δ` only for confirmed mechanical changes. A display-only correction does not move time, roll dice, affect save state, change NPC choice or cause a checkpoint.

## Core window anatomy

This is a **layout schema**, not fictional state or a literal ASCII panel:

- Crown: **◇ BEASTBOUND · SYSTEM RECORD** in antique gold, fine light line/rune at edge.
- Identity band: **character name** prominent; actual age/path/discipline if meaningful; an ornamental neutral symbol until a verified personal sigil exists.
- World band: **true weekday and date · time** followed by **true location · weather**, quiet and narrow.
- Vital band: a labelled, slim **STA** track, actual numbers right aligned; add only genuinely relevant verified resources/conditions. Purse is concise in the identity or world band, not a large separate square.
- Scene band: **◈ CURRENT THREAD** or an analogous thematic label with *one authentic immediate situation*.
- Fine footer: optional restrained inscription; **do not** show “LEVEL UP,” future branches, phantom objectives, empty headings or marketing copy.

A mundane ten-year-old who has merely studied a power system still receives a **beautiful but unawakened** fantasy panel. No magical sigil, gate, circle, class, partner or reserve is granted by the look. A calm chores scene can display just Stamina, money and the immediate concern.

## Specialized panel consistency

Every specialized panel is a variation of the **same visual family**, not a plain grey table:

- **Combat tactical:** dark crimson/gold accents inside the original frame; actual wound boxes, cover, stamina and known combatant information only. Do not disclose hidden enemy HP or pre-roll results.
- **Beast / taming / partnership:** ecological/lineage accent; distinct living beast agency and actual observed species/grade/needs, never an assumed bond.
- **Powers / advancement:** independent Meridian, Arcane, Soul, Body, Rift, Beast-Origin and Human Evolution anatomical motifs and earned personal sigils; no shared generic “power level”. The large ceremonial reveal appears **only** for a confirmed milestone, then returns to a smaller normal panel.
- **Skills, techniques, profession, family, clan, organisations and civic ties:** use the same gold-ink window with scene-appropriate subheads, visibly verified records and unknown/absent fields. Never turn a family name into nobility or one-off employment into permanent membership.
- **World, people, journal, inventory and research:** same skin, but show only the requested player-known facts; looking at UI is read-only.

For data visibility and implemented/only-designed special panels, refer to `ADAPTIVE_PANEL_ATLAS.md`. For rare evolution/awakening choreography, refer to `POWER_SYSTEM_PRESENTATION.md`.

## Regression and maintenance acceptance

- `panels.hudData` must continue to produce the **same read-only, real player-known facts**, with a versioned presentation hint that dispatches the right visual family. The hint may never grant power, consent, inventory, rewards, RNG or calendar ticks.
- `tests/dynamic-hud-identity.test.js` checks that the skin and core/encounter/combat variants are present and stable on seeded saves, and that obtaining panels does not alter the save.
- A passing JS regression only confirms the **data contract**; it cannot prove the ChatGPT client actually displayed gold ink correctly. The GM must apply this visual rendering contract in the chat. **Appearance is verified by the player's on-screen experience**, not by an engine test.
- If speed or native UI limitations recur, shorten *content or decoration*, **not** the identifiable fantasy visual family. Do not silently substitute the previously rejected generic card.
