# Beastbound — GM compliance gate (source-backed implementation)

**Standing source and presentation contract, 15 November 2026.** This is a permanent fast-turn guard, not another lore document and not a claim that a parser can judge every possible sentence. It is subordinate to the Unified Master Prompt, Table Rules, original engine authority and player-confirmed canon.

## Silent natural-scene decision

Before each gameplay reply, distinguish:

1. **Narrative / already-known information** — read the latest verified pickup or remembered reliable chat fact; narrate without an engine request, die, time advance or save write. Reproduce the player's exact words. Ordinary household scenes should breathe naturally; do not insert a breakfast gate, quest menu, forced job offer or compulsory next question in place of a requested conversation.
2. **New objective claim** — actor presence at a specific site, personal secret knowledge, individual consent, employment, payment, inventory custody, time, training result, injury, skill, physical travel, breakthrough: obtain original source proof before asserting the outcome. A related person or hometown does not alone establish a current location; a career label does not determine a specific task. Unknown is neither present nor absent.
3. **Source-grounded narration** — a GM may freely portray ordinary gestures, unimportant sensations and personal speech when the established scene supports them; they do **not** imply a formal actor choice, access right, wage, hidden fact or mechanical reward. Use particular traits from known history, avoid generic scripted NPC lines and never speak for the player.
4. **Presentation** — the **actual** ink/indigo, antique-gold Beastbound fantasy window, or no panel if a plain spoken conversation needs none. Do not use the rejected neutral 2×2 card. When a window is shown, obtain values from the latest original result or `panels.hudData` and use `panels.inChatHtml(state)` as the **single reusable display-only source template**. If rendering needs a chat visualization, reproduce its HTML/CSS as display-only; a platform card is not an approved visual substitute.
5. **Save boundary** — don't overwrite verified state with speculative narration. Checkpoint only meaningful witnessed facts or when requested, and only claim success after actual GitHub acknowledgment.

## Executable additions

- `scripts/gm-compliance.js` has **read-only** `brief(s)` and `audit(s,{assertions,scene?})` helpers. They never roll, spend resources, advance a day, change family origins or cause NPC decisions.
- `world.gmComplianceStatus({npcId?})` returns an actionable, limited **player-safe scene brief**: true date, place, existing inventory-independent resource HUD, actual locally evidenced NPC presence, preserved family kinship/role distinction, source-sealed player-known narrative facts, latest pickup and panel skin. It does *not* list secret whereabouts or interpret absence as proof.
- `world.gmSceneAudit({assertions,scene?})` checks **explicit, typed** factual assertions and returns per-claim evidence verdicts, without a checkpoint. It never claims to have parsed unstructured fiction or detected all future mistakes.
- Optional `gmAssertions` on **supported authored rule/checkpoint/sequence requests** fail *before* the first dice roll when source proof is missing. This protects source claims entering a pickup scene and avoids re-rolling a rejected attempt. The guard accepts only:
  - `{type:'npc-present',npcId}` — a genuinely present actor at the current exact site, not just a registered identity
  - `{type:'npc-knows',npcId,factId}` — a source-sealed, individually attributed NPC knowledge fact, not public proximity or the GM's own knowledge
  - `{type:'relationship',npcId,kinship}` — specific original kinship or a player-confirmed source-sealed relationship, never the generic household-role label
  - `{type:'player-has-item',itemId}` — an actually owned inventory item, not merely something a character studied
  - `{type:'narrative-fact',factId}` — an active player-known narrative continuity witness
  - `{type:'spoken-exact',words}` — those exact user-authored spoken words appear in the proposed scene
  - `{type:'panel-skin',skin:'beastbound-ink-gold-manhwa-v1'}` — the actually approved skin

A private handwritten notebook **is not proved by a spell theory record**. Its owner should be recorded in the story continuity source or a custody owner before making a mechanically consequential claim. The narrative correction that Maddoc has Soul notes, Tessa Meridian and Bram Arcane remains canon; this guard refuses to reinterpret a studied subject as physical possession.

The original individual NPC/family/household/wildlife owners **still decide and record** any interaction, movement, job, contract, promise, skill or compensation. For example, a verified `npc-present` assertion does not mean `npc-consents`, `npc-agrees-to-pay`, `npc-knows-all` or `npc-is-happy`. There is intentionally no generic assertion type that guesses those things.

## Known limitations; do not overclaim

This integration cannot automatically inspect every free-form ChatGPT sentence. Dialogue-only turns remain **chat-native** for speed and use the silent judgment gate above. `gmAssertions` is optional and type-restricted; if omitted, the engine cannot certify arbitrary prose. The read-only scene audit is useful when a consequential claim is uncertain or when a source-backed checkpoint needs proof. Passing these tests does not prove a rendered ChatGPT client panel is visually correct; the narrator must use the approved family.

Test the permanent regressions in `tests/gm-compliance-guard.test.js` along with preexisting HUD, NPC, kinship, scene-continuity and fast-turn tests. Tests include the real Maddoc checkpoint **read-only**, checking that Hedra is his mother, a relative isn't automatically physically present at 07:00, notes custody isn't invented, secret knowledge isn't shared, exact dialogue survives, and a rejected claim does not consume dice or modify a save.

**Never edit or migrate an active campaign merely to install this guard.**
