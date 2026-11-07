# Beastbound Living World engine — private chat contract (v0.8)

The world is **fiction first**. The player says what Aerin does. The GM interprets the act, checks established facts and chooses the supported engine call; the actual engine result is checked before narration. The player does not need JSON commands. Dialogue without a check is freeform. `/save` checkpoints only after GitHub confirms a write.

## Data and privacy

Static authored world: `world/atlas.js`. Demand-generated fauna: `world/bestiary.js`. Persistent politics/economy/biomes: `world/simulation.js`. Each campaign has its own `save.table.realm` with deterministic independent seed, sixday/month tick counts, region and country indices, institution finances, migration indicator populations, diplomatic relations, dated news and player-known species observations. **No external API or public server**; the private repo and Actions workflow are sufficient. GM sealed events are stored separately and are not in public player panels. GitHub repository owners can inspect files if they choose; that is not a cryptographic secret store.

## Rule operations

Call `mode:"rule", system:"world"` with one of:

- **Read only:** `realmStatus` (local world view), `realmOverview` (system counts, not hidden stats), `atlas` (`{type:"polity"|"continent"|"region"|"institution"|"culture"|"festival",id}`), `calendar`, `news` (`{channel:"local"|"courier"|"public bulletin"}`), `market` (`{polity?}`), `species` (`{id}`; only after a sourced sighting), `agendaStatus` (older established story clocks).
- **Changes:** `realmInit` creates the world state once; `observe` (`{minutes,source}`) records an actual player field observation in the current biome and advances time; `setCalendar` (`{date:{year,month,day},source}`) **only** after a sourced in-world date is established; `publishNews` (`{text,region,channel,source,originDay,lag}`) records verified world reporting, never manufactures truth; `advance` continues the underlying day/sixday/month simulator.

Examples, *NOT* real Aerin actions:

```json
{"id":"example_world_status_01","campaign":"sandbox","mode":"rule","system":"world","operation":"realmStatus"}
```

```json
{"id":"example_field_survey_01","campaign":"sandbox","mode":"rule","system":"world","operation":"observe","params":{"source":"Observed wetland shoreline during a declared field survey","minutes":40}}
```

Public read-only calls do **not** change or initialise the save. An `observe` event is not a bond, combat encounter or invented evolutionary branch. The 34-column HUD remains the default presentation; `docs/POWER_SYSTEM_PRESENTATION.md` defines ceremonial animation for **verified** power events.

## Cadence and causality

`rules/world.js::finalizeTime` runs once per save turn when game time crosses a boundary. Sixday ticks update country resources, academy budgets and ecological population indicators; months update trade volumes, price indices, diplomacy, succession and migration. All mutations are inside the single serialized campaign save, so replays use the turn-id ledger and expected-hash guards. Do not tick independently in narration or pre-roll possible futures. On old campaigns whose date is unanchored, maintain `Day N` and preserve prior events instead of backfilling invented history.

Distant developments reach a character only through published reports, couriers and delays. Public world descriptions show laws, cultures and geography, not private war strength or hidden goals. Full world debug records are for tests and GM consistency, never a default player panel. Relevant local events may be shown as a small contextual section; normal sixday changes must not turn into a wall of notifications.

## Limits

The simulation is **regional/coarse**, not physical 1:1 modelling of every inhabitant or all species, and its authored atlas is only the first deep layer of a large setting. International travel and calendars are not automatically inferred from an unanchored Aerin start. A generated species cannot gain extraordinary abilities merely because a procedural slot exists. The ancient hidden cosmology and fully worked legal, career, war, magic and diplomatic systems remain to be developed with consistent reference rules.

**Background professional development:** `world/notables.js` advances 48 independent professionals' credible skill-PP and discipline training alongside monthly updates. `world.professionals` returns only people already public/known; `world.revealProfessional` requires a verified source and valid in-world channel. Readiness for a Meridian/Arcane/Soul/Body/Rift trial is **not** a supernatural breakthrough without a source-backed check. The exact personal relations of an already established NPC like Elira Moss still outrank these generated background profiles.