# Source-verified open-country campsites and overnight world time

**Master Prompt authority:** §§5, 11, 44–45, 49, 51. The private Table Rules require a changing world, honest source-grounded checks, injured people remaining capable where physically plausible, survival without invented safe locations, and continuity across checkpoints.

## Real wilderness camping

At actually accessible **forest, fen or foothill** scenes, a character may **look for a safe campsite**, **find shelter** or use `health.findShelter({})`. This is not a menu gate: a GM can adjudicate other physically grounded ways to construct a tent, request shelter from a willing person, use an owned home, reach a refuge, or investigate unfamiliar environments with their own source evidence. The current executable path is simply a common independently achievable way to rest outdoors.

The engine derives the candidate physical terrain from the actual authored local biome: a woodland root hollow, a raised dry reedbank, or a wind-shadow scree ledge. The actual saved weather is relevant to the difficulty—fog and wet weather affect finding ground, more serious weather raises the challenge. The player cannot choose a DC, favourable weather, outcome, guaranteed campsite, rank, time or supply grant. One legitimate risky Wisdom + Survival check costs **45 minutes and three actual Stamina**, regardless of success. The existing capped-by-actual-achievement Practice Points calculation is reused; no new experience currency or universal fixed waiting period is added.

On success, the observed suitable site is stored in the existing `table.sleepShelters` ledger with its local name, verified biome and terrain, original actual Survival roll, original logged world observation, stable hashes and finite **18-hour** use window. `health.shelterStatus({})` and read-only natural `campsites` show only currently usable personally known sites. The existing `health.sleep({hours:8,shelterId})` validates the same genuine source proof before a full night. A natural `sleep` / `rest` action chooses a currently verified sole site; if several exist, the player can choose an actual site ID. No personal camp automatically protects beasts, changes territorial rights, grants new items, cures serious injury or overrides an ongoing animal encounter. A failed search may be retried as genuine new time-and-stamina effort, not rerolling the same check without consequence.

**Older GM-witnessed camp records** keep their original validation and remain compatible; newly issued `fieldcamp_` records cannot claim that legacy privilege to bypass original proof.

## Independent overnight time

The prior health sleep action advanced the legacy clock and recovered resources but did not call the independently simulated world tick after midnight. It now also applies the existing `rules/world.finalizeTime` on actual elapsed hours. A full night crossing a sixday boundary therefore advances the actual organisations, individual lives and ecological simulation, as well as any monthly tick; the same day cannot double-tick. This does not create a new schedule or force the player to sleep.

## Current limits

This is a **bounded nature-travel and shelter** foundation, not full weather dynamics, permanent camp building, floodwater physics, intelligent camping companions, food/temperature systems, river crossings, property rights, full injury care or universal ability to camp anywhere. Rift-contaminated outposts and unfamiliar settlement structures need independent specific source observations; this prototype does not declare them safe. Overnight time advancement is real even where the actual weather model remains coarse.

Regression coverage in `tests/wilderness-shelter.test.js` includes preflight failure without state change, real success and failure rolls, actual regional terrain and weather, witness tampering, ordinary old shelters, overnight sixday transition, cost, supported natural language and idempotent file-backed replay. The entire existing 97-test suite remains mandatory under the minute-efficient private single-runner CI. No live campaign save is modified during development.
