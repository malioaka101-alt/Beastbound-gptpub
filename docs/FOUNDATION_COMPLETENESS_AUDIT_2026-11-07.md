# Beastbound — Foundation-completeness audit
**7 November 2026 · Private project · Evidence snapshot: main at `00fd11debc4850357f5c78775641fc55ab4397b8`**

## Verdict and scope

**Finish Line A (a coherently playable, reusable foundation): INCOMPLETE, but substantial working paths are verified.** The urgent gap is not a missing gift, barter, crafting, merchant, or plant sub-engine. It is the gap between **freeform player intention and safe, source-verified mechanical adjudication** plus proof that private play truly continues safely across checkpoint and sessions. Stop inventing new daily-life subsystems to compensate for these integration gaps.

**Finish Line B (complete implementation of all 57 Master Prompt sections): far beyond A.** The existing `docs/SOURCE_PARITY_MANIFEST.json` has 57 sections, **none explicitly classified as complete**. A status such as `partial`, `first phase tested`, `GM-led` or `procedural foundation` is not a failure to create another subsystem. It is a reason to state what the game really supports and avoid claims of higher powers or simulated world depth.

**Authoritative basis:** `reference/Beastbound_Realms_Unified_Master_Prompt.md` §§1–57, particularly §§5,13–16,19–25,39–54; `reference/Beastbound_Table_Rules.md` and the newer `docs/IN_CHAT_SYSTEM_HUD.md`; `docs/MASTER_PROMPT_IMPLEMENTATION_PROGRAM.md`; current code/test/workflow, not prototype claims or implementation-document wishlists. The original Master Prompt and the actual player instruction to favour freedom over artificial requirements outrank the prototype and this audit. Keep Aerin's actual saved facts separate from other campaigns.

**Verification basis:** 108 distinct test-file invocations currently registered in `.github/workflows/engine-tests.yml`, last complete successful premerge run **42402268476**, head `58569b66bd1d3da6857a37a24b27a8dc95b6f394`, merged as `00fd11d` in PR #138. This confirms the tested bounded paths, **not** general Master Prompt parity or real private workflow delivery after GitHub commits a turn. Aerin's current save SHA is `72b1535307fba37e19d26122ba4eb80b46cea31c`, Day 1 08:00 Morrowfen Crossing, 85 Talons, chat revision 0. Development must not change it.

## What genuinely works now (no rebuilding needed)

| Foundation | Source-backed verification | Honest limit |
|---|---|---|
| Character, scene, travel and survival | `engine.js`; `scripts/chat-turn.js`; `tests/chat-runtime.test.js`, `tests/wilderness-shelter.test.js` | Only an established local route or procedure is executable; no universal traversable world |
| One trustworthy numeric resolution core | `rules/core.js` natural d20, margins and event log; `rules/scene-check.js`; `tests/scene-check-provenance.test.js` | A generic unfamiliar action cannot simply name its own DC or produce its own legitimate precommitted challenge |
| Safe private local turns and source-proven persistence | `scripts/chat-turn.js` read-only cases, stable IDs, exact-request hashing, archived results; `tests/private-turn-receipt.test.js`, `tests/chat-runner-contract.test.js` | Repository-action execution and a cross-chat pickup have not been established by the listed *unit tests* alone |
| Living world and time | `world/simulation.js`, `world/person-presence.js`, `rules/world.js`; `tests/living-world.test.js`, `tests/time-passage.test.js` | Sixday/month abstractions and coarse public schedules, not every person's hourly life or all local events |
| Independent wild beasts and some mutual relationships | `world/wild-lives.js`, `rules/bonds.js`, consent/agency tests | Species-specific communication, long-term welfare, full societies and evolved capabilities are only partially enacted |
| Basic wound combat, treatment and retreat | `rules/combat.js`, clinic/rescue/critical/cover tests | Full terrain movement, reach, spatial choice, broader techniques and nonlethal outcomes remain partial |
| Distinct early human power paths | `rules/disciplines.js`, Arcane Ward/Spark & Second Circle, Meridian early Gates, Soul Perception, Body I, Rift Sense and their regression tests | Advanced stages, Origin integration, human transformation and many noncombat effects are **not** playable merely because lore exists |
| Physical resources, materials and work | `rules/unified.js` atomic item plans; `rules/physical-work.js`; `world/simulation.js`; actual local trade, native gathering/replanting, poultice, invention, repair and handoff tests | A small set of genuine sources, medical recipes, real stock and facilities; not a universal catalogue, craft-anything or all-purpose economy |
| Local opportunities, independent organisations and people | `rules/public-field-opportunities.js`, `world/guild-fieldwork.js`, `world/emergent-people.js`, `rules/npc-conversations.js`, social regression tests | True ongoing contracts, family law, detailed personal conversation, careers and extensive funding consequences are partial |
| Presentation | `panels.js` produces validated fallback ASCII HUD; updated `docs/IN_CHAT_SYSTEM_HUD.md` specifies a shorter native in-chat styled HUD | The fallback JS panel is not itself the approved native rich HUD and cannot guarantee animation on every ChatGPT client |

These are **reusable foundation components**, not ten obligations to design one subsystem per activity. The large test suite validates concrete behaviours, including refusal/failure. It does not validate every context in the Master Prompt.

## Actual Finish Line A blockers — fix in this order

### A1 · Critical: freeform intent → credible general adjudication → verified consequence

The Master Prompt §§41,45,54 explicitly allow reasonable unlisted actions and say to roll only when uncertain. In the private `scripts/chat-turn.js`, `mode:'act'` still compares many exact phrase lists/regular expressions, then falls through to **`E.dispatch(s,req.action)`** (`engine.js`). The legacy dispatch's unmatched-action case returns `I could not map …`, explicitly pointing players back to the chat narrator. Thus the engine can execute many *known* paths but **cannot, by itself, resolve a novel reasonable action through the already existing mechanical core**. More named-item and named-person parser branches are not an adequate cure.

`rules/scene-check.js` rightly prevents players choosing their own DC, skill, roll or result, but currently accepts only an **already sourced** scene check ID. It lacks an existing general safe handoff for the GM to source, witness, commit and resolve an unforeseen feasible task against local world facts. Do **not** expose raw `C.check` with player-supplied power/skill/DC or fabricate a challenge simply because the user asked. Keep feasibility with the GM, precommit the specific witnessed context and true available stakes, and execute the applicable existing rule/check. Trivial tasks need no roll; impossible tasks stay impossible; existing dedicated rules still take precedence.

**Next engineering deliverable:** one *narrow integration repair* in the existing runner/check path, with a credible source-first GM adjudication contract and tests for several genuinely different, previously unlisted actions (one no-roll, one genuine uncertain mundane check, one NPC-dependent choice, one impossible/refused case). Reuse existing `sceneChecks`, `core.check`, time, resource and world evidence; **do not** create a new universal action engine, skill tree, or arbitrary editing permission. A mechanical consequence must be engine-confirmed before narration.

### A2 · Critical: believable conversations and continuity of promises

The named-NPC `talk to <person> about <topic>` route in `scripts/chat-turn.js` currently returns the person's *already authored public statement*, explicitly warning that the specific question has **not automatically been answered**. That is an honest safeguard, but it leaves genuine open-ended questions, negotiation, explanations and reactions without a natural path from GM/NPC voice to appropriately saved consequences. A freeform RPG cannot rely on static public statements for all interaction; nor may the GM assert hidden intentions, consent or a completed contract.

**Next deliverable:** reuse `rules/npc-conversations.js`, actually witnessed individual presence/agency and the existing checkpoint journal to handle source-consistent question-and-answer, refusal and uncommitted proposals. Save material witnessed commitments **only when actually made**. The GM may improvise nonmechanical dialogue within established knowledge and personality; when a consequential choice or check is required, resolve it by the protected engine. This should **not** become a second friendship meter or one dialogue subsystem per profession.

### A3 · High: demonstrate the real private runner end to end, not just simulated turns

`scripts/chat-turn.js` keeps idempotent turn receipts; `scripts/process-pending.js` consumes private `requests/<campaign>/<id>.json`; `.github/workflows/private-chat-turns.yml` runs the private Actions executor, committing `saves/` and `results/` after a successful Git rebase. Local test fixtures validate exact-ID replay and the crash-before-result receipt fallback, but the CI inventory by itself does **not prove** that a real cross-chat `status → action → saved result → pickup → checkpoint → same-ID replay` completes correctly through GitHub Actions.

**Next deliverable:** use **a disposable campaign/save**, not Aerin, to exercise one genuine source-authenticated action and full runner round-trip on the private workflow, with a real result file, save/revision, follow-up context, duplicate-ID recovery, stale hash refusal and unaffected other-campaign save. Be explicit about what the actual GitHub workflow confirms; never invent an outcome while waiting or promise background work. If cost or workflow delay makes repeated GitHub integration impractical, run one targeted smoke test and retain the existing unit coverage.

### A4 · High: guard against needless artificial restrictions and overlapping authorities

The newly tested `rules/material-handoffs.js` requires **08:00–18:00 for every human recipient**, even though `world/person-presence.js` has an actual co-presence/shift source. That universal hour rule is overly broad for a realistic world (a person may genuinely be available outside public market hours). Replace such restrictions with **real presence, availability, safety and contextual consent**, without permitting a gift to remotely summon a person. This is a focused inconsistency repair, **not** a need for barter or employment systems.

More generally, the repository contains overlapping social, relationship, activity and knowledge adapters and legacy/protected action paths; the recent duplicate PR #137 was closed in favour of the tested PR #138 to avoid two competing individual-material-custody schemas. Audit existing authority and source proof before making another wrapper. A small new module is warranted only when a real existing player journey is otherwise blocked and source-specific stakes justify it.

### A5 · Moderate: close presentation and source-status drift

`docs/SOURCE_PARITY_MANIFEST.json` is a conservative **baseline** across 57 canon sections, not continuously updated with all recently verified integrations; e.g. §50's description remains centred on the original laboratory recipe despite later working Crossing infirmary, multi-source gathering, replanting and physical-work reuse. `docs/MASTER_PROMPT_IMPLEMENTATION_PROGRAM.md` similarly contains older milestone text. This makes it too easy for later development to mistake an implemented slice for missing work—or a bounded example for complete parity.

**Next deliverable:** reconcile only the *changed evidence and remaining gap* fields for current working slices, then keep a concise single prioritised **Finish Line A blocker list** instead of continually appending overlapping development updates. Do not silently promote any of the 57 sections to fully complete, and do not rewrite authoritative lore or old checkpoint records. For regular scenes, follow the current small native in-chat HUD guidance; `panels.js` is a fallback, not a request to build a public UI.

## Important but NOT Finish Line A blockers

- §§3,18,24,27,28,30: complete cosmology, Origin-pattern physics, full Beast-Origin lineage integration, divine rites, human evolution and transformation. **Must remain honest gaps**, not rapidly invented generic implementations.
- §§6–16: hundreds of thousands of complete authored species and all life stages, languages, consent rituals, ecologies, rights, evolved forms and synchronisation techniques. The current procedural breadth is a source for future credible encounters, not an automatic complete bestiary.
- §§19–25: full higher Arcane Circles, Meridian IV–IX, Soul/Body/Rift, cross-disciplinary interference and techniques. Keep distinct and earned. Only grow a path when one concrete player choice needs it, and ensure abilities have true costs and real uses.
- §§32–38,47,50: complete professions, lifelong wages, property rights, courts, all ranks/competitions, complete market exchange and all recipes. The GM may adjudicate ordinary negotiations using existing person/currency/item facts without coding one simulation per profession or object.
- Fully automatic player personality inference, dynamic dialogue generation and every stylistic detail. Those remain **GM responsibilities**, not mandatory databases.

## Four disposable-world acceptance journeys for Finish Line A

1. **Natural freedom:** in one source-known scene, attempt several reasonable unlisted actions with different stakes. The GM has lawful freeform interpretation; a real uncertain consequence uses an authenticated one-use check; trivial and impossible outcomes do not burn dice. An NPC can refuse without a generic relationship bonus.
2. **Independent beings:** encounter a beast or person, witness its actual availability, approach/observe/converse/leave through different supported channels; character actions do not override independent choices, species consent, or private knowledge.
3. **Mixed progression and ordinary work:** from a new non-chosen-one character, complete one self-directed early power effort, express the earned benefit in a **real use** (not only a profile number), and complete one source-backed ordinary material/work journey with actual time, resources, and credible failure.
4. **Real continuity:** execute and checkpoint a source-verified private action from a disposable save; retrieve real `results/` from the private Actions runner; resume with identical inventory/time/world witness; replay same ID with **no reroll**; verify Aerin and any other campaign untouched. Finish with complete 108-test CI still green.

The acceptance tests should use varied scenarios, not only hardcoded Aerin market and first fen observations. An attempt failing for physically justified reasons is **correct gameplay**; an ordinary plausible attempt failing solely because the parser lacks its phrase is an integration blocker. Tests must prove both.

## Execution update — 7 November 2026 (current, supersedes older planned work)

**A1 / A2:** Source-first open-intent and contextual canonical NPC continuation are implemented **only on unmerged PR #140**. The test workflow run [42405265987](https://github.com/malioaka101-alt/beastsbound-gpt/actions/runs/42405265987) failed before exposing any job steps or logs; it cannot establish a code regression, but it also cannot provide a successful full engine verification. Do not treat the code as live until verified and merged.

**A3:** An isolated disposable save `saves/foundation_runner_audit_20261107.json` was created on main without modifying `saves/aerin_marsh.json`; a read-only `mode:"status"` request `requests/foundation_runner_audit_20261107/audit_status_20261107_001.json` triggered the actual Private Beastbound Chat Turns workflow run [42405401477](https://github.com/malioaka101-alt/beastsbound-gpt/actions/runs/42405401477). GitHub reported `failure` with **zero job steps**, and `results/foundation_runner_audit_20261107/audit_status_20261107_001.json` did not exist when checked. No actual engine result, roll, saved progression, replay, checkpoint or cross-chat continuity has therefore been verified by this attempt. The blocked request is **disposable only**, not an active player turn; do not claim its result or narrate it.

**A4:** Source-based co-presence replacing the gift-clock duplication is also present on unmerged PR #140, with a separate real evening local person regression. The old main branch rule stays authoritative until a successful suite and merge.

**A5:** The `docs/SOURCE_PARITY_MANIFEST.json` and `docs/MASTER_PROMPT_IMPLEMENTATION_PROGRAM.md` on this **documentation-only** PR reconcile actual tested native ecology, material work, local NPC records, parity gaps and the A3 workflow failure. All 57 canon sections remain partial/limited/GM-led as previously classified; no advanced powers or social systems were falsely promoted to complete. This documentation PR's required tests also could not start (run [42403659996](https://github.com/malioaka101-alt/beastsbound-gpt/actions/runs/42403659996) failed twice with no reported steps and no job log). Leave both PRs unmerged without a verifiable successful gate.

**Current blocker is GitHub Actions execution/observability, not evidence of a failed game roll.** Restore a running full test job and a disposable private-turn result before marking all A-priorities complete. The last verified *completed green* engine regression remains [42402268476](https://github.com/malioaka101-alt/beastsbound-gpt/actions/runs/42402268476), from merged PR #138. Aerin's original save SHA remains `72b1535307fba37e19d26122ba4eb80b46cea31c`.

## Stop / go rule

**Do not start a new supplier, barter exchange, material type, handoff type, custom craft, profession, gift, NPC family/social proof registry or extra mini-game merely to progress the development log.** Repair A1–A4 in that order. Only introduce a new small engine operation when an actual cross-system journey cannot be adjudicated safely through an existing one. Protect old saves, source authority, single original rolls, independent persons/beasts and player-known-only knowledge. When the four acceptance journeys pass and the runner round-trip is verified, label **Finish Line A** a playable bounded foundation; keep Finish Line B's richer universe open without pretending it is already implemented.
