# Beastbound — faster, safe private-chat turns (v1.0)

**Non-negotiable knowledge check, no extra tools:** Follow [NPC Knowledge and Family Continuity](NPC_KNOWLEDGE_FAMILY_CONTINUITY.md) before every NPC line. Use already loaded confirmed facts; **never save time by giving NPCs knowledge of scenes they did not witness**, inventing unverified present friends, or misreading household guardian status as an aunt/mother relationship. Maddoc's Hedra is player-confirmed **mother** (source role `guardian`); Bram/Tessa whereabouts and private knowledge are not confirmed by the arrival at Mossgate. This gate is instantaneous in narrative-only turns: no per-dialogue GitHub query.

**2026-11-14 implementation supplement:** For the new bounded sequential turn protocol, in-action pickup scenes, preflight scripts, verified local Node candidate runner and original source-funded ordinary family work, consult [FAST_TURN_UPGRADE.md](FAST_TURN_UPGRADE.md). The original one-roll, save-lease, NPC autonomy and living-world safeguards remain in force. A multi-action sequence is only available for the explicitly supported source-owned operations; a local checkout is never assumed to exist without verification.

**Visual correction (15 November 2026):** the player explicitly rejected the neutral/ordinary boxed card used while resuming Maddoc. The mandatory rendering source is [APPROVED_IN_CHAT_PANEL_RENDERING.md](APPROVED_IN_CHAT_PANEL_RENDERING.md). Fast gameplay must keep the approved **dark ink/antique-gold fantasy window**; a generic native card, 2×2 status grid or undifferentiated platform border is not an acceptable shortcut. Compact means fewer rows, not fewer fantasy design cues. A small display-only styled in-chat visualization is appropriate when native elements cannot deliver the design; never fall back to plain grey/white just to avoid a compact CSS layer.

**Play remains inside the private ChatGPT Project. No site, hosting, plugin or paid tier required.** Faster does not mean unverified dice, fabricated outcomes or unsaved changes.

**GM adjudication extension (15 November 2026):** follow [GM Contextual Difficulty](GM_CONTEXTUAL_DIFFICULTY.md). Read-only original baseline previews are available for household work and early discipline practice; they are **optional** when the verified baseline is already available. A sourced GM adjustment goes inside the **one eventual engine action** and is recorded before the single die, not through a second speculative roll. Pure dialogue, obvious physical facts, guaranteed mundane acts and impossibilities need no invented d20. Specialist source owners, costs, independent actors and saved continuity remain authoritative. The approved fantasy panel design stays unchanged.

**Guardian family allowance continuity:** an originally agreed small allowance may be settled by the guardian's source-witnessed final review through `social.settleGuardianAllowance` when its original receipt, physical recheck, verified concurrent effort and actual guardian funds satisfy [guardian follow-through](GUARDIAN_ALLOWANCE_FOLLOWTHROUGH.md). It is **one mechanical request**, no second check, no rerolled work, no additional time or needless follow-up checkpoint. Do not narrate received money until that exact request is verified.

**Ordinary encounter clarification:** A roster is evidence of an existing recorded NPC's co-presence, not a complete census of all ordinary people a GM may introduce. Use plausible independent routines to adjudicate search, knocking, conversations and newly witnessed appearances. Searching does not summon a target; empty lists do not empty the village. Preserve existing identity and schedule constraints and checkpoint meaningful new facts. Never route normal dialogue through `world.wait` in a loop to see whether an NPC materializes; use the engine once for actual elapsed time or source-owned outcomes, including formal consent, work, money, training and travel. An elapsed-time result proves no NPC sighting by itself.

## Minimal GitHub round trips — November 2026 optimization

A real 15 November chat-turn workflow completed from GitHub event creation to workflow completion in about **12 seconds**; its original engine execution took less than one second. The measured overhead was Actions scheduling, checkout/setup and Git operations, not skill checks or world simulation. Never promise this as a fixed turnaround time.

**Default connector pattern for a consequential turn:** (1) write one unique immutable `requests/<campaign>/<id>.json` with the intended action, optional truthful pickup scene, and any already-established GM contextual DC judgment; (2) retrieve **only** the exact `results/<campaign>/<id>.json` when ready. The persisted result already contains `ok`, `applied`, `revision`, original dice/events, `clock`, `hud` and `stateHash`. This result is a remote GitHub-acknowledged document committed together with its matching save in the workflow. Avoid opening Actions run lists, job lists, full saves or additional status endpoints *as a default* after a successful result. Those are troubleshooting and resumed-session tools, not required hops on every turn. A matching result must be verified before claiming any mechanics.

When the exact result does not yet exist, do not create a new turn ID, retry the roll, or submit a duplicate request; use restrained direct-result retries, not rapid multi-endpoint polling. Recover a stalled workflow by checking the relevant run only when needed. A 404 on the not-yet-committed result is not itself a failed roll.

**One-step mundane terrain checks:** when the GM has an actual supported, witnessed local footing/reading task, use `core.localCheck` with `params:{intent,method}` and any legitimate pre-roll `gmRuling`. The original `prepareSceneCheck` and `check` owner functions run sequentially **inside one verified engine turn**, not as two separate GitHub request/workflow cycles. It spends the same genuine time, consumes the same original single die if uncertain, preserves source hash, and retains no-roll handling for established routine/impossible physical tasks. Do not extend it to combat, ecology, social consent, powers or other unimplemented source owners. The older two-turn prepare/check flow remains supported when separate in-world decisions actually intervene.

**Repository-side gain:** the chat-turn workflow attempts to push the verified result/save immediately; only if remote main has advanced does it fall back to the existing `git pull --rebase` conflict path. This avoids one unnecessary remote round trip on ordinary uncontended turns while preserving exactly-once dice, original save and conflict safeguards. Does not modify panels, rolls, GM freedom, ecology or campaign state.

**Optional larger fast path:** local Node 22 can avoid the remote Actions job only if a complete, current source checkout and latest campaign save are available with independently verified GitHub source and save hashes. This sandbox has Node but no complete checked-out source, and direct clone/download is unavailable here; do not pretend it is ready. A complete up-to-date repository archive supplied to the Project could allow the already implemented verified local runner, but refresh and verify it after source changes. Even that path must obtain a GitHub-acknowledged save write before presenting outcomes as saved.

## Live-play speed priority — current instruction (7 November 2026)

**Goal: short, responsive in-chat turns while retaining honest source-backed outcomes.** The in-chat GM should not use the GitHub turn processor for ordinary prose or for rereading information already present in the latest verified save/result. Read the authoritative Project instructions, Table Rules and latest campaign save **together in one parallel connector batch** where required, rather than serial calls and repeated full-document analysis. Reuse those already-verified instructions within this chat unless they change. After an applied turn, use the returned verified mechanical output immediately; don't redundantly query the same status.

**Three turn classes:**

1. **Prose / player-known inspection (fastest):** speak naturally as GM using the currently verified scene and already known board, inventory, journal or public facts. Do not create GitHub requests, roll, spend time, grant items, imply an NPC's consent or advance the world merely to repeat known information. A new observation that changes the witnessed ledger (such as *first* reading previously unknown official field notices) is instead a real engine action.
2. **Real mechanical change:** execute **one unique request** through the verified local Node runner only when its complete current source and save are actually available; otherwise use the working GitHub request → Actions → result processor once. Confirm the corresponding result/save before stating a roll, decision, cost or clock delta. Avoid repeated run polling and needless extra status requests; fetch the specific result and current save in one parallel batch once the run has finished. No speculative provisional narration or rerolls.
3. **Session / checkpoint / reset:** checkpoint only where meaningful, on `/save` or at a genuine pickup boundary, not every paragraph. **Earlier campaigns were ended and their live runtime data removed on 14 November 2026.** A different independent Maddoc campaign was subsequently started and its current saved checkpoint was verified at `saves/bb_20261114_1dtmtp9.json` on 15 November. Resume only from a newly verified active save and the player's selected character.

**Presentation budget:** Let each scene take the prose it genuinely needs: specific physical experience, distinctive human dialogue, motivations, culture and subtext. **No hard sentence count or mechanical quest-menu framing.** A brief glance may take a paragraph; an actual charged conversation can take longer. Speed comes from fewer tool round trips, no duplicated information, and a **small, attractive, consistent fantasy status plate** (name, place/time, useful resources, one focus)—not from flattening people into status labels, objectives or reward cards. Show actual terms in a notice when naturally relevant, but do not invent named petitioners, cash promises or other unverified facts. Never sacrifice a meaningful character moment for a terse log; compress interface, not the fiction.

**Honest limitations:** The active `Beastbound-gptpub` GitHub repository is **public**; the game conversation is private. GitHub Actions startup is a real cost for a first-time state-changing board reading and cannot be skipped by falsely pretending to have run the engine. A Node executable without the **verified complete repository source** does not make local mechanics available. For genuinely consequential turns, correctness and confirmed persistence take priority over speed.

## Preferred path when an executable Node 22 environment exists

1. Read the latest `docs/PROJECT_CHAT_INSTRUCTIONS.md`, `reference/Beastbound_Table_Rules.md`, `docs/IN_CHAT_SYSTEM_HUD.md`, and the **selected campaign save** from the active public GitHub repository. Reuse the local game source only after verifying it matches the current GitHub source/blob hashes. Do not mix campaigns.
2. For an action needing a check or a change, create **one unique** turn request with a stable ID and optional `expectedHash`, and execute `scripts/chat-turn.js` **once** against a local copy of the fetched save. The engine records exact dice, time, stamina, politics and other consequences. It produces a new, complete save in the local copy.
3. Verify `ok` and `applied`, then use GitHub's `update_file` on `saves/<campaign>.json` with the **original blob SHA** and the resulting exact local file content. GitHub acknowledgement is required before claiming the turn was checkpointed. A stale-SHA error is a conflict: **never reroll** and never overwrite an unseen newer save. Reconcile or explain the limitation. A rejected/unchanged action needs no write.
4. Narrate only the confirmed output, then display the **compact native in-chat fantasy status plate** (see below). Do not paste the engine's old 34-column ASCII panel except as a text-only fallback. Keep the Delta line factual.
5. For freeform, dialogue-only exchanges, **do not make a tool call** unless the talk changes state or requires checkpointing. Do not silently advance clock; checkpoint the pickup scene before switching chats.

Because tool round trips, GitHub Actions startup and large repeated UI code are costly, this path uses a single local Node resolution plus one GitHub save update, instead of writing an Actions request and polling a result. It is **available only when** the live conversation has an accessible, verified Node environment. Repository access alone does not provide Node execution.

## Fallback path when Node cannot run

Write exactly one `requests/<campaign>/<unique-id>.json` to the active public repository and fetch its `results/<campaign>/<unique-id>.json` after the private turn workflow runs. Never submit two pending requests to one campaign, and never roll again because the workflow was slow. The workflow no longer runs the complete test suite for every player request: dedicated code-change CI owns regression checks. The engine still validates input, state transitions and duplicate IDs.

## Fast default everyday panel

**Use the actual approved small dark-fantasy system window, not a generic status card.** Native compact presentation is welcome only when it can visibly provide the ink/antique-gold, subtly runic frame; otherwise use a lightweight, display-only styled in-chat window. Avoid *large* repeated animated/CSS-heavy AppBlocks, but do not ban the modest styling needed for the previously approved visual identity. The ceremonial animation remains reserved for **verified** cultivation, evolution and awakening milestones.

Required composition: a **dark ink/indigo system window framed with thin antique-gold ornamental/runic detail**, a refined `◇ BEASTBOUND` crown, character name/path and real in-world clock/date, compact location/weather, one or two slim integrated source-backed resource tracks, and a short genuine scene thread. **Never** arrange values in ordinary 2×2 platform tiles and call that the fantasy HUD. No invisible NPC stats, no fake quest acceptance, no button-menu choices. When compatible, use native chat UI layout primitives; keep styling restrained and responsive. In reduced-motion or plain-text environments use a small unboxed textual status line, not a giant ASCII rectangle.

## New independent campaign

Use `scripts/new-campaign.js`, which consumes **one** seed and derives a male character's background/path/family with `engine.randomCharacter()` and `engine.newGame()`, then selects one of five already playable non-Morrowfen opening locations. It establishes wounds and the Living Realms state at the relative opening Day 1, **and anchors an actual seeded civil calendar date** before play begins; the world clock then advances named days and months normally. Every start has a unique save and date provenance. **It does not delete or overwrite** a different campaign. No previous campaign save remains in the live `saves/` directory; never revive a retired campaign.
## Reusable scene-compliance gate (15 November 2026)

Follow [GM Compliance Gate](GM_COMPLIANCE_GATE.md). Ordinary chat and known facts stay tool-free; do not inject fake NPC presence, retroactive secrets, invented note custody or a breakfast/work menu. Exact player dialogue should appear in quotes. When an original source-backed fact requires an engine request, optional `gmAssertions` can reject unsupported provenance before dice. A read-only `world.gmComplianceStatus` is available when source context is uncertain and `world.gmSceneAudit` can check typed claims without mutating game state. Approved panel HTML is generated from `panels.inChatHtml(state)`, never recoded as a generic grey HUD.

## Power checks after the v1.1 source audit

Do not call `engine.dispatch('train meridian')` or the old `bridge.js act` directly; the protected `scripts/chat-turn.js` rejects prototype automatic cultivation/evolution. Use `mode:"rule"` operations: `character.status`, `character.initialize` (one-time profile migration), `character.assessPotential`, `discipline.status`, `discipline.practice`, `discipline.breakthrough`, `meridian.gatePractice`, and the strictly validated `evolution.event`. Because high stages are not yet implemented, treat them as research/roleplay goals, not a free upgrade. The signed GitHub checkpoint must still be verified before advancing gameplay.

## Implementation extension — source-owned fast turns (14 November 2026)

The following routes supplement, rather than replace, the original scene, economy, consent, calendar, training and world-tick owners.

- **Preflight:** scripts/turn-preflight.js validates the request shape before GitHub submission. It catches unsafe IDs, scenes and sequences, but cannot know or predetermine a roll, agreement or consequence.
- **Atomic pickup:** a consequential action can include a truthful scene (up to 450 characters), summary (up to 400) and two focus strings. The scene is saved together with the actual action, avoiding immediate extra checkpoints. Never write unverified success into a future pickup scene. Ordinary dialogue remains chat-native.
- **Bounded sequences:** mode "sequence" accepts two to six original mode "rule" steps: discipline.practice, health.sleep, world.wait and social.householdWork. Each source owner resolves its original checks, resources, world ticks and independent choices once in order. The sequence persists in one outer save write; complications, dangerous failures, declined work or incapacity stop later steps, without erasing completed original actions. The proposed final scene is saved only if the whole sequence completes.
- **Household paid work:** social.householdWork({npcId,purpose}) handles real home chores with independently established relatives and their own funds. The family member decides about helping or employing the player; an original Crafting check governs completion. Actual wages transfer only from available real employer funds after completed accepted work. Refusal, no funds, failed work and replays never create money. It is not a retroactive payment for a previously free world.wait scene. social.householdWorkStatus is read-only.
- **Incremental request scans:** on push, GitHub Actions processes newly changed request files rather than scanning years of past results; manual workflow_dispatch still scans all pending requests for recovery.
- **Verified local Node path:** scripts/verified-local-turn.js requires a complete clean Node 22 Git checkout and independently confirmed live source commit, original save GitHub blob SHA and raw save SHA-256. It runs one original turn on a disposable candidate and does not push to GitHub. The caller must recheck the remote source and save before uploading the candidate with the original save blob SHA as a lease. Do not reroll on a stale lease. If a full verified local source is unavailable, use the existing GitHub Actions route.

Illustrative format only (not a playable campaign command):

~~~json
{
  "id": "new_unique_example_sequence_0001",
  "campaign": "new_independent_campaign",
  "mode": "sequence",
  "steps": [
    {"mode":"rule","system":"discipline","operation":"practice",
     "params":{"system":"soul","method":"self-awareness","minutes":120}},
    {"mode":"rule","system":"health","operation":"sleep","params":{"hours":10}}
  ],
  "scene": "At home in the morning after a completed evening training and safe sleep.",
  "focus": ["Morning household plans"]
}
~~~

This adapter is not a universal story planner. Genuine new-world actions, NPC contracts, beast encounters, advanced training, and novel research continue using their own supported source or remain unresolved. Use the saved civil weekday label (Dawnday, Rootday, Forgeday, Wayday, Marketday, Hearthday, or Concord Day during the intercalary festival) in the approved HUD instead of relative Day N when the calendar already provides an anchored weekday.
