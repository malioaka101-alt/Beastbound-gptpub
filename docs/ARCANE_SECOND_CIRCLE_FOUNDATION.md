# Foundation integration: earned Second Arcane Circle without copying spells

**Status (7 November 2026):** One playable early higher-tier Arcane architecture vertical slice, integrated into the existing `rules/disciplines.js`, `rules/index.js`, `rules/build.js` profile and private `scripts/chat-turn.js` checkpoint flow. This is **not** a universal Circle II–IX framework or a completion of Arcane spellcasting.

## Canon and why this changes the engine

Unified Master Prompt §21 distinguishes a Mana Core, individually constructed Mana Circles, their geometry, stability, load, intake, channels, formula complexity and ambient magical interference. **Second Circle — Dual Channeling** requires a genuine redesign of existing First Circle architecture, permitting a second stable channel. The original Circle's resources alone cannot mint a Second Circle. The Circle count does not automatically teach a new spell.

The project follows the current user directive: develop actual foundations rather than a school-and-fee treadmill. No generic teacher, tuition, sixday count, age gate, prescribed instructor or test-provided success flag is necessary for this early Arcane redesign. A concise genuine design can be attempted in a physically suitable existing scene where the player is capable of working. Real effects beyond the demonstrable capacity still require separately earned source-verified techniques.

## Implemented real player operation

`arcane.circleWork({design,minutes?,route?})` is a protected **one-attempt** operation. `design` is a freeform original description of how the practitioner proposes to branch the earned First Circle's Mana routing, `minutes` is actual effort (15–480, default 180), and the currently sourced route is `independent`. A design's impressive wording is not a mechanical success. The route does not assume a paid academy or guaranteed teacher. The current engine does not impersonate a witnessed outside instructor.

Before any roll or expenditure, it checks:
- Actually **source-dated successful Core and First Circle milestones** retained in `table.disciplineTraining.arcane.history`.
- Geometry consistent with that first milestone and the `Build.arcaneProfile(1)` channels, structured capacity and complexity; it does not accept a fabricated Second Circle number.
- Current room, ordinary health/encounter readiness, stable Core and two genuinely available Mana.
- Existing recorded partial revision must match the original geometry. Calls cannot supply a DC, rank, spell, output, success, or extra state.

An engine-owned d20 Arcana check determines earned *structural integration*. A normal success contributes two points, strong success three, exceptional four. Four proven structural points create Circle II, so an exceptional person can succeed from one real work attempt—there is **no mandatory duration, number of practice sessions or tuition**. Genuine failed attempts spend Mana and time but award no integration. Severe failures can damage Core stability and cause the ordinary wound-model harm; this is consequence, not an arbitrary time gate.

On confirmed completion:
- The Arcane Circle becomes **II**; `Build.arcaneProfile(2)` provides the actual two-channel structure, Mana architecture and its bound on formula complexity.
- A separate persistent `table.arcaneArchitecture.circle2` witness remembers the original First Circle geometry and actual proposed integration.
- The personal maximum Mana capacity can expand to match the actual source profile, without refilling spent Mana. The saved Original First Circle geometry remains as the ancestral anchor.
- Existing Meridian/Qi, Soul, Body, Rift stages, partner bonds, Rank depth and species Grades are untouched.
- **No new spell, casting licence, simultaneous-casting technique, teleportation, innate beast power, Arcane Field or higher Circle is granted automatically.** The Second Circle adds structural *capacity*, not an invented executed ability.

## Regression and historical ability continuity

`tests/arcane-second-circle.test.js` exercises invalid and forged requests refusing before any roll or save mutation, source-anatomy verification, successful/failed individual checks, actual Mana and time, Circle profile changes, no copied spell, private checkpoint reload, and stable-turn idempotency. It additionally learns an earlier basic Arcane technique through the real self-taught path and verifies that its original source evidence and use remain valid after advancing to Circle II.

The compatibility adjustment in `rules/self-taught-basic-techniques.js` makes a previously learned spell retain the **Circle at which it was acquired**. A change in today's Circle count is not evidence that an earned First Circle formula was never learned. Its original study witness, record and spell budget must still verify; the new Circle cannot rewrite them.

## Still missing: only genuine playable gaps

Second Circle's *actual simultaneous channelled spell use* still needs a fully verified technique/exchange procedure; this initial slice is the structure and recorded biological magical capacity. Circles III–IX need their distinct anatomical and formulae consequences, with worked proof and risks; do not rebrand this first success as completion. The early `discipline.practice` and `discipline.breakthrough` routines still have legacy fixed sixday courses and conventional optional establishments: make those routes genuinely flexible in a **separate audited compatibility pass**, never by loosening unsupported higher power.

All test fixtures are disposable. `saves/aerin_marsh.json` is deliberately unchanged; no player's magic was added, no actual in-world roll occurred for Aerin.
