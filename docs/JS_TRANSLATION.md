# Beastbound — Independent JavaScript Rule Port, unified chat mechanics v0.7

**Private ChatGPT Project RPG. No website, public hosting or subscription required.**

## What the supplied Python files establish

The original `bb_core.py`, `bb_build.py`, `bb_progress.py`, `bb_bonds.py`, `bb_research.py`, `bb_world.py`, `bb_state.py` and `bb_selftest.py` were uploaded **in chat as references, not to be copied**. Their actual source can now be examined and their numerical self-test run. These Python modules are **not** in this private GitHub repository and have not been copied into JavaScript line-for-line. The independent JS code implements the documented game behaviour, with its own API and state handling.

`python bb_selftest.py --fast` on the uploaded files passed the sections it could load: core, progress, build, bonds, world and state. `bb_bench.py` was **not** uploaded, so combat benchmark statistics were skipped. A full Python chat runner (`turn.py`) was also **not** uploaded.

## Implemented in JavaScript

| Component | Verified behaviour | State / caveat |
| --- | --- | --- |
| `rules/core.js` | d20 checks (+5 natural 20 / −5 natural 1), degrees, opposed rolls, assistance, attacks' casting checks, mana fizzles and one-roll idempotency | Own seeded RNG; **same rules, not identical Python RNG sequences**. |
| `rules/combat.js` | Injury severity, Strain, Light/Serious/Critical/Mortal wound overflow, wound penalties, critical/morale checks, Magnitude contests, Ward absorption, bracing, nonlethal harm, round resets and recovery | Runs on explicit `state.table.combatants` records; **does not silently replace legacy HP**. Full duel/arena rules and lasting-injury tables remain unported. |
| `rules/build.js` | Beast and human stat lines, Meridian derived stats, full documented spell budget and circle eligibility, Qi technique costs, research Grade, evolution Weight / capacity / rejection DC | Pure calculators; a caller must first establish valid in-world attributes, materials and learned abilities. |
| `rules/progress.js` | Progress-per-week expected rates (natural ±5), skill PP progression, Insight-assisted breakthroughs; established Maturity, Ripening and Pattern Echo mechanics | High-gate cultivation, self-experiment failure tables and final evolution event remain separate and incomplete. |
| `rules/bonds.js` | Background relationship dimensions and annual growth, personality-specific bond events, weekly care/fracture, communication limits, contract Load/Capacity/Stability, willingness and numeric Sync prerequisites | Contract sealing enforces additional S2 guardianship/S3 informed-consent requirements from Table Rules; Synchronicity's special milestone prerequisites still need in-world verification. |
| `rules/world.js` | 365-day Aldmere date and Concord Days, coins, Concord Rating, 6-day ticks; existing Aerin-specific world effects retained | **Do not import Jory's starting clocks or NPCs.** Aerin's original save has no absolute 1147 AC date; conversion isn't automatic. |
| `rules/research.js` | Fixed sealed truth, project grades, surveys, research weeks, recorded fieldwork, hypotheses, proofs and validation | Certain complication outcomes need distinct injuries/legal/economy subsystems. Jory-only research facts are never imported. |

## Testing performed

1. The supplied Python self-test passed (`bb_bench` unavailable).
2. Existing JavaScript suites (`tests/engine.test.js`, `tests/additions.test.js`, `tests/chat-runtime.test.js`, `tests/python-translation.test.js`) passed with the new code.
3. New `tests/python-reference.test.js` covers the Python self-test's known benchmark vectors plus real private JSON turn execution, duplicate-turn replay prevention and consent gating, with no Python dependency.
4. **520 independent deterministic cross-language test vectors** were generated and compared *locally* using the user's reference Python files: 120 spell budgets, 100 beast stat blocks, 100 Meridian profiles, 100 bond starts, 60 training rates, and 40 calendar dates. All 520 matched **after correcting the higher-stage Meridian wound-penalty-reduction bonus**. The Python-generated vectors and files are not committed into GitHub.

The repository CI runs only the native JS tests and can run on GitHub Free private Actions within the account's normal limits.

## Private chat API

The connected GitHub App writes a unique request to `requests/<campaign>/<turnid>.json`. The GitHub Actions runner applies it via `scripts/chat-turn.js` and commits `results/<campaign>/<turnid>.json` plus the save. Never narrate numeric success until the committed result is retrieved. The runner rejects duplicate IDs, stale hashes and unsupported operations.

Examples (illustrative **only**, not events in Aerin's game):

```json
{"id":"example_combat_register_001","campaign":"sandbox","mode":"rule","system":"combat","operation":"register","params":{"id":"dummy","name":"Training Dummy","toughness":7,"defense":14}}
```

```json
{"id":"example_bond_status_0001","campaign":"sandbox","mode":"rule","system":"bond","operation":"status","params":{"beastId":"fox_id"}}
```

Supported additional rule operations include `combat.attack`, `combat.newRound`, `combat.recover`, `combat.rest`, `core.contestForce`, `bond.register`, `bond.event`, `bond.care`, `bond.willingness`, `bond.seal`, `bond.stability`, `bond.syncReadiness` and the original `research.*`, `evolution.*`, `core.*`, `world.*` routes. To avoid unearned progress or invented NPC facts, a Game Master must supply parameters supported by **known** fictional circumstances.

## Remaining technical boundaries

- **Legacy v0.3 HP and source-backed wound records coexist in saved JSON**, but in **Project chat v0.7** all new combat and treatment must use the authoritative wound model. Clean old HP records can be migrated without introducing injuries; injured legacy saves require a documented migration ruling. Old HP becomes read-only historical context. The HTML debug prototype does **not** have this integrated authority and must not be used for authoritative combat. Never apply both models to the same event.
- The JavaScript engine is **not** a full Python program rewrite. `rules/encounter.js`, `rules/unified.js`, and `rules/agendas.js` additionally implement chat-first wound exchanges, scoped recovery and independent precommitted world agendas with player-knowledge boundaries. Full healing and lasting injuries, arena wards, initiative/duels, gate advancement, caster load, world faction/price indices, Sync feedback, research complication consequences and evolutionary crisis tables still need work before mechanical parity.
- Player-visible outputs may reveal only what that player could know. The initial Python reference included a **Jory-only** world and examples; none of those facts have been imported into Aerin's save.
- Original literary Master Prompt and campaign facts outrank prototype code. Unknown/hidden conditions cannot be fabricated after a roll.
- Do not commit the uploaded Python references to GitHub without a new, explicit request from the user.

## Run regression checks

```sh
node tests/engine.test.js
node tests/additions.test.js
node tests/chat-runtime.test.js
node tests/python-translation.test.js
node tests/python-reference.test.js
```

Use disposable in-memory or temporary-file campaigns for tests; **never** test by advancing `saves/aerin_marsh.json`.
## Living Realms v0.8 addition

`world/atlas.js` supplies newly authored continental cultures, states, institutions and trade relations consistent with the original Master Prompt. `world/bestiary.js` supplies stable ecological taxonomy with 239,616 species identifiers and 718,848 regional forms. `world/simulation.js` is a separately seeded, persistent regional simulation of politics, trade, public institutions, migration and ecological pressure. The core private runner applies new world ticks through `rules/world.js` on long actions, without altering established player dice or campaign history. **Not** individual simulation of every person, authored species or cosmological truth; source rules still take precedence. See `docs/LIVING_WORLD_BIBLE.md` and `docs/LIVING_WORLD_ENGINE.md`.