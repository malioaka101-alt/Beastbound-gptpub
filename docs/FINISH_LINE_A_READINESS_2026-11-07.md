# Beastbound — Finish Line A readiness review

**Evidence date:** 7 November 2026. **Active source:** public `malioaka101-alt/Beastbound-gptpub` at verified pre-review `main` commit `cf58cc4bdfbe10e51eb75c383f19dbfc343c5f1e`. The text game itself remains in private ChatGPT Project conversations. This is a current review, not a replacement for the original Master Prompt or Table Rules.

## Verdict

**READY for a carefully GM-led early playable campaign, but NOT feature-complete or ready to resolve every unfamiliar numerical consequence.** Verified engine actions can be played now without inventing results. The GM, not a parser, owns interpretation, voice, pacing, personal culture, risk, feasibility and free dialogue. The engine owns real numbers, time, independently determined choices, resource transfers, achievements, rolls and persisted results.

The original Master Prompt §§41, 42, 45, 51 and 54 requires genuine player freedom and NPC individuality; this review does **not** certify complete parity with all 57 sections. The `docs/SOURCE_PARITY_MANIFEST.json` intentionally retains partial/GM-led statuses.

## Verified foundations (distinct kinds of evidence)

| Foundation | Verified evidence | Explicit limit |
|---|---|---|
| A1. Open interpretation and bounded mechanical handoff | `tests/open-ended-intent-and-contextual-dialogue.test.js`; authenticated terrain `core.prepareSceneCheck` → `core.check`; real disposable Actions runs [42419833938](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42419833938) and [42419882130](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42419882130) | Only source-supported terrain footing/reading has the general scene-check preparation; unfamiliar combat, magic, bargains, travel and other consequences still require their genuine relevant rule, or a nonmechanical GM narration without fabricated effects |
| A2. People and meaningful social outcomes | `tests/ordinary-life-npc-journey.test.js` in successful [112/112 run 42421287765](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42421287765); existing `world/emergent-people.js`, `rules/npc-conversations.js`, `social.personContext` | Work offer acceptance/refusal and witnessed history are protected; the engine does not write fully nuanced free dialogue, decide every life event, grant automatic trust, or implement every legal promise |
| Independent beasts and ecology | `tests/exploration-beast-journey.test.js` in successful [113/113 run 42422519596](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42422519596); existing wild-lives, sapient personhood, memory, offscreen ticks | Proven individual wildlife choices and historical searches are not a complete language system, species lifecycle, society or automatic bond |
| A3. Real saved turns, checkpoint, resumed state | `docs/LIVE_SAVE_RESUME_VERIFICATION_2026-11-07.md` (eight real public Actions runs); original-roll recovery and stale refusal; restored identical original d20 receipt | This is a real cross-request/repository pickup, not a separately launched ChatGPT chat or universal guarantee against GitHub service failures |
| A4. No redundant compulsory restrictions | `tests/actual-presence-not-universal-hours.test.js`, `tests/flexible-discipline-practice.test.js`, source-based local work and witnessed NPC consent | Real site safety, source evidence, availability, biological limits and time/resources still apply |
| Practice, power use and common physical work | `tests/earned-senses.test.js` covers earned Phase I perception → real nearby-life use; `tests/flexible-discipline-practice.test.js` covers optional brief independent work; `tests/shared-physical-work-journeys.test.js` covers real gathering, clinic craft, invention and repair | These are separate proven slices, **not** a single zero-to-master heroic progression playthrough. First-stage power use is real, higher stages and broad applications remain incomplete |
| A5. Accurate current state | This current file plus the updated source-parity manifest and `docs/CHAT_EXECUTION.md`; complete regression suite [113/113 run 42422519596](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42422519596) | Status documents are evidence indexes, not additional mechanics, completion certificates or invented in-world facts |

## Remaining Finish Line A integration risks — prioritise when seen in genuine play

1. **Unfamiliar consequential acts** not supported by a sourced existing rule must remain honestly unresolved until a lawful consequence is available; the GM may describe trivially certain nonmechanical actions without a roll. **Do not add a universal arbitrary DC or action creator.** Repair a real missing handoff only if an actual playable journey proves the gap.
2. **Consequential social promises beyond protected offers/handoffs** remain contextual, source-specific. The GM can portray conversation naturally but may not assert unseen agreement, money, relationship scores, titles or automatic ongoing obligations.
3. **Mixed power/ordinary-life vertical slice** is backed by separate regression tests, not a single user-level story from untrained civilian to mastered technique and long career. If a real play journey needs this, write one disposable test using the existing operations, not another skill or work engine.
4. **Public repo privacy:** the repository is public even though actual gameplay happens in private Project chats. Files under `saves/`, `requests/`, `results/` and documentation committed here may be readable by anyone. Never put passwords, personal private secrets or undisclosed sensitive user facts into that repository. Do not mislabel public GitHub storage as private.

## Practical acceptance for starting play

- Load the active character save and current Project/Table Rules before a scene. **Aerin's baseline** remains `saves/aerin_marsh.json` blob `72b1535307fba37e19d26122ba4eb80b46cea31c` (Day 1, 08:00, Crossing); do not substitute Jory's campaign.
- The GM narrates short, natural, player-known scenes, genuinely individual NPCs and independent wildlife. Player speech, emotion and decisions belong to the player.
- Use the working source-protected action for time, resources, challenges, combat, progression, voluntary choices and saves. Never narrate unverified numerical outcomes. The separate real Actions request/result workflow has been verified on disposable saves; verify each live requested result before claiming success.
- On a new genuine limitation, record the specific attempted action, current known scene, missing mechanical consequence, and minimal existing component to repair. **Do not turn routine roleplay into new software projects.**

**Readiness decision:** The early, source-supported foundations can support actual GM-led play now. New foundation PRs should be justified by a demonstrated play blocker or an explicit requested canon capability, not by counting more systems.
