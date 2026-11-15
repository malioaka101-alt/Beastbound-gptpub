# Beastbound — GM compliance gate (source-backed implementation)

**Standing source and presentation contract, 15 November 2026.** This is a permanent fast-turn guard, not another lore document and not a claim that a parser can judge every possible sentence. It is subordinate to the Unified Master Prompt, Table Rules, original engine authority and player-confirmed canon.

## Silent natural-scene decision

Before each gameplay reply, distinguish:

1. **Narrative / already-known information** — read the latest verified pickup or remembered reliable chat fact; narrate without an engine request, die, time advance or save write. Reproduce the player's exact words. Ordinary household scenes should breathe naturally; do not insert a breakfast gate, quest menu, forced job offer or compulsory next question in place of a requested conversation.
2. **GM-authored ordinary world events** — the GM may establish a plausible new neighbour, an uncontradicted person's arrival or departure, a knock answered, a mundane sighting, or ordinary dialogue as the story unfolds. Decide from geography, time, routines, player action, known history and independent motivations, **not** from the player's desired answer. Looking for Hedra does not summon Hedra; checking several homes does not guarantee a helpful neighbour. First distinguish a *newly authored, genuinely witnessed event* from a claim that the NPC was already at a place. An empty presence roster is not proof of an empty world. Maintain and checkpoint any important witnessed encounter in continuity; never silently overwrite a prior established location or shift.
3. **Engine-owned consequences and pre-existing claims** — when asserting a *previously established* person's presence for a source-owned mechanical action, private knowledge, individual consent, employment, payment, inventory custody, elapsed time, training result, injury, skill, physical travel or breakthrough, use the required original rule/witness and engine result. A new ordinary scene does not automatically confer a mechanical NPC-presence receipt, NPC assent, access to a private home, money, experience, discovery or secret. If a formal rule rejects an encounter lacking its required witness, retain the ordinary scene and resolve only the unsupported mechanical effect later; do not fake an assertion or call repeated waits until it turns true.
4. **Source-grounded narration** — a GM may freely portray ordinary gestures, unimportant sensations and personal speech when the established scene supports them; they do **not** imply a formal actor choice, access right, wage, hidden fact or mechanical reward. Use particular traits from known history, avoid generic scripted NPC lines and never speak for the player.
5. **Presentation** — the **actual** ink/indigo, antique-gold Beastbound fantasy window, or no panel if a plain spoken conversation needs none. Do not use the rejected neutral 2×2 card. When a window is shown, obtain values from the latest original result or `panels.hudData` and use `panels.inChatHtml(state)` as the **single reusable display-only source template**. If rendering needs a chat visualization, reproduce its HTML/CSS as display-only; a platform card is not an approved visual substitute.
6. **Save boundary** — don't overwrite verified state with speculative narration. Checkpoint only meaningful witnessed facts or when requested, and only claim success after actual GitHub acknowledgment.

## Executable additions

- `scripts/gm-compliance.js` has **read-only** `brief(s)` and `audit(s,{assertions,scene?})` helpers. They never roll, spend resources, advance a day, change family origins or cause NPC decisions.
- `world.gmComplianceStatus({npcId?})` returns an actionable, limited **player-safe scene brief**: true date, place, existing inventory-independent resource HUD, actual locally evidenced NPC presence, preserved family kinship/role distinction, source-sealed player-known narrative facts, latest pickup and panel skin. It does *not* list secret whereabouts or interpret absence as proof.
- `world.gmSceneAudit({assertions,scene?})` checks **explicit, typed** factual assertions and returns per-claim evidence verdicts, without a checkpoint. It never claims to have parsed unstructured fiction or detected all future mistakes.
- Optional `gmAssertions` on **supported authored rule/checkpoint/sequence requests** fail *before* the first dice roll when source proof is missing for an **already-existing, mechanically consequential claim**. Do not put an emerging GM-authored ordinary encounter through `npc-present` until the required actual original presence witness exists. `npc-present` is not a universal permission-to-narrate gate. This protects source claims entering a pickup scene and avoids re-rolling a rejected attempt. The guard accepts only:
  - `{type:'npc-present',npcId}` — a genuinely present actor at the current exact site, not just a registered identity
  - `{type:'npc-knows',npcId,factId}` — a source-sealed, individually attributed NPC knowledge fact, not public proximity or the GM's own knowledge
  - `{type:'relationship',npcId,kinship}` — specific original kinship or a player-confirmed source-sealed relationship, never the generic household-role label
  - `{type:'player-has-item',itemId}` — an actually owned inventory item, not merely something a character studied
  - `{type:'narrative-fact',factId}` — an active player-known narrative continuity witness
  - `{type:'spoken-exact',words}` — those exact user-authored spoken words appear in the proposed scene
  - `{type:'panel-skin',skin:'beastbound-ink-gold-manhwa-v1'}` — the actually approved skin

A private handwritten notebook **is not proved by a spell theory record**. Its owner should be recorded in the story continuity source or a custody owner before making a mechanically consequential claim. The narrative correction that Maddoc has Soul notes, Tessa Meridian and Bram Arcane remains canon; this guard refuses to reinterpret a studied subject as physical possession.

The original individual NPC/family/household/wildlife owners **still decide and record** source-owned interactions, movements, jobs, contracts, promises, skills or compensation. The GM authors ordinary conversations and incidental social contact, without treating an introductory scene as a transaction. For example, a verified `npc-present` assertion does not mean `npc-consents`, `npc-agrees-to-pay`, `npc-knows-all` or `npc-is-happy`. There is intentionally no generic assertion type that guesses those things.

## Practical encounter adjudication

- **Search:** establish the actual search area and opportunities. An encounter is possible, not guaranteed, and its result depends on the independent routines already known plus reasonable GM judgement for untracked ordinary people. Do not preselect a helpful answer or a parent's location because the player asks. No arbitrary run of unanswered doors solely because `localPeopleStatus` is empty.
- **Existing named person:** preserve any verified whereabouts, dates, schedules, obligations, prior witnessed presence/absence and consequences. Where their current whereabouts truly are unknown, the GM can choose a plausible ordinary scene appearance only if it does not conflict with those facts. Once witnessed, keep the new fact consistent; checkpoint it at a meaningful boundary. Never reinterpret an off-screen unknown as confirmed absence or guaranteed availability.
- **New ordinary resident:** ground their home, identity, purpose and ability to respond in the actual locality. A new person is not automatically a merchant, source-owned contract actor or trusted informer. No retroactive knowledge of other people's plans; an honest 'I don't know' is a legitimate response.
- **Time and mechanics:** narrate first within existing confirmed clock context; if minutes actually pass, send a single appropriate `world.wait` or real source action and use its verified output. An elapsed-time-only result proves minutes elapsed, **not** that every visited house was empty or that anyone was encountered. A formal NPC action still needs its own legitimate engine witness; ordinary dialogue does not need an engine roll.

## Known limitations; do not overclaim

This integration cannot automatically inspect every free-form ChatGPT sentence. Dialogue-only turns remain **chat-native** for speed and use the silent judgment gate above. `gmAssertions` is optional and type-restricted; if omitted, the engine cannot certify arbitrary prose. The read-only scene audit is useful when a consequential claim is uncertain or when a source-backed checkpoint needs proof. Passing these tests does not prove a rendered ChatGPT client panel is visually correct; the narrator must use the approved family.

Test the permanent regressions in `tests/gm-compliance-guard.test.js` along with preexisting HUD, NPC, kinship, scene-continuity and fast-turn tests. Tests include the real Maddoc checkpoint **read-only**, checking that Hedra is his mother, a relative isn't automatically physically present at 07:00, notes custody isn't invented, secret knowledge isn't shared, exact dialogue survives, and a rejected claim does not consume dice or modify a save.

**Never edit or migrate an active campaign merely to install this guard.**
