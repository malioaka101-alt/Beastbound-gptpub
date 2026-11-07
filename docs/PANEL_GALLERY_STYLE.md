# Beastbound — Gallery-style Project-chat panels

> **Updated user preference (6 November 2026):** The player approved the newly styled, subtly animated **fantasy system HUD** for regular play. See `docs/IN_CHAT_SYSTEM_HUD.md`. The exact 34-column gallery box described below is now a **text-only fallback/reference**, not the routine in-chat presentation. The original panel gallery retains its value as a data and layout reference; it is not the current default visual.

The player-supplied **Beastbound Panel Gallery** is the visual reference, while `reference/Beastbound_Table_Rules.md` remains authoritative for panel rules. The examples from Jory Larkin and the illustrative Wren/Sorrel profiles are **not campaign facts for Aerin Marsh**.

## Scene layout

- **Fallback text-only mode:** exactly 34 Unicode codepoints across each line, including borders, using boxed text in a code fence. In styled in-chat mode, use the approved fantasy system window instead; do not generate an image or deploy a website.
- Header: first name and **recorded campaign date**, or `DAY n` until a calendar date has actually been established for that campaign.
- Clock, time of day, observable weather, place, purse. Resource bars are 10 blocks, values on the right.
- Show wound boxes only when wounded; conditions only when present; Mana and Soul only when used by that character.
- A bonded-beast section appears only for a known partner, with player-known information; no sealed evolution requirements, potential, secret NPC motives or hidden morale numbers.
- `NOW` carries at most two grounded threads, and is omitted if there is no meaningful focus.
- Context sections (`WILD BEAST`, `RESEARCH`, `FIGHT`, `TAMING`, `EVOLUTION`, etc.) appear only if a current scene warrants them, **after** the relevant prose reveal.
- `Δ` change summaries appear below the boxed panel as prose, not inside the panel.
- Ordinary scenes use one compact core panel. Expanded information is reserved for `/panel` and `/panel <name>`.

## Implementation

`panels.js` exports `core(state, extra)`, `full(state, name)`, helpers and `WIDTH=34`. Optional `extra` sections accept `{title,hint,rows}` with rows as text, `[left,right]`, or `{left,right}`. Pair rows right-align labels; free text is clipped if necessary. Never pass GM-sealed information through this interface.

The gallery-style `/panel` menu lists only panels supported by the current save. Standing views include `status`, `character`, `tamer`, `quests`, `bag`, `people`, `world` and `journal`; `research` and partnered-beast cards appear as relevant. Full views have a heavy divider below their shared header.

The legacy v0.3 player attribute names remain visible as actually saved (STR, DEX, CON, INT, WIS, CHA); they must not be silently relabelled into eight Python-character attributes. Old HP is explicitly tagged as unreviewed when its value differs from full health and the new wound model has not yet been established.

Run `node tests/panel-gallery.test.js` as well as the existing tests before changing a style primitive. These tests verify exact width, gallery-style vitals, conditional wounds, scene sections, menu, expanded panels and isolation from unrelated campaign illustrations.
## Ceremonial system-event presentation

The accepted dramatic growth/awakening treatment is now official in [`POWER_SYSTEM_PRESENTATION.md`](POWER_SYSTEM_PRESENTATION.md): a restrained animated sigil and energy sequence in ChatGPT when supported, with accessible reduced-motion and static fallbacks. It is reserved for **real, verified** milestones and never changes a save by itself. The regular 34-character gallery HUD remains the ordinary scene display.