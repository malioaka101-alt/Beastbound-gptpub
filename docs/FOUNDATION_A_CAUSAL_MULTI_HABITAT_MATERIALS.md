# Finish Line A — one gathering mechanism across authentic local habitats

**User's standing instruction:** Beastbound must be a flexible living world, not a pile of one-off mini-games. This work extends the *existing* habitat survey → real Survival check → physical resource transfer → ecological consequences path, using true geography and finite world supplies. The player is not required to enrol in a trade, apprentice, pay an access fee or wait an arbitrary number of days.

## Evidence before resources

The original engine's **Whisperfen Wetlands** location explicitly describes floating reed islands; the authored Valedryn atlas lists Whisperfen's **reed islands** and a regional wetlands ecology. The same original local game describes **Ashwind Foothills** as a ridge with the **scent of ironbloom**; the authored atlas records **ironbloom** as an Ashwind regional trait. Both **marsh_reed** and **ironbloom** already exist as distinct physical `E.RESOURCES` inventory items. These are *source-grounded material sites*, not randomly assigned ore or a new hidden fauna discovery. No source licenses claims about either plant's special powers, chemical purity or rare Grade.

The existing `world/simulation.js` now owns a small, finite, separate stock for **each** established local source, seeded before any player exploration from the actual local forage. The old original `world.fenPressure` scale still governs **safe reed gathering**. The original region ecology now also responds to each extraction, including quality-sensitive independent sixday regrowth of at most a little material from real conditions. Every gathered unit leaves real local stock, enters the *existing shared internal* inventory planner, costs field Stamina and time, adds ecological pressure and is source-logged. Requesting to see a location or repeating an unsuccessful check never mints stock or rerolls a lucky find.

## One actual mechanic, different world facts

`rules/reed-harvest.js` provides the single **`gather({item,checkId})`** operation. The original `harvestReeds({checkId})` is a backwards-compatible wrapper for the same operation and still preserves the old `fenReedHarvests` and `fenReedHarvestAttempts` checkpoint fields. The shared `materialGatherAttempts` records source hashes, original Survival roll, location, item, work, stamina, local stock and ecological impact. The result uses **the original engine's source-verified personally observed and successfully interpreted habitat check**, including its archived hashes after narrative log rotation; no fresh resource dice are rolled by `gather`. The body and habitat must remain safe enough to work.

- **Whisperfen reeds**: 45 minutes, 4 Stamina, one actually available marsh reed, original fen-pressure increase plus direct local ecosystem disturbance.
- **Ashwind ironbloom**: 60 minutes, 5 Stamina, one actually available original ironbloom plant, stronger disturbance of the actual Ashwind regional ecosystem and limited physical patch stock.

These two cases are examples of **the same protected physical-gathering operation**. Future habitats/materials require genuine source-authored material presence and ecosystem evidence, not their own parser command or new resource mini-engine. The world can constrain or forbid harvesting where local rights, ownership, hazards or biology actually demand it; this prototype does not claim all land is freely harvestable.

## Normal play

From a genuinely present site, a player may **survey habitat signs → interpret habitat signs → gather reeds**, or **survey habitat signs → interpret habitat signs → harvest ironbloom**. Other natural verbs such as `collect` and `pick` resolve existing canonical item names through the same item-name matcher already used for voluntary feeding. Using the word `moss crystal`, `sun shard`, `origin sample` or any other resource **does not** establish a source; the engine refuses unsupported harvesting without spending resources or choosing an outcome. The original `craft field poultice` still uses its authentic recipe; obtaining ironbloom does **not** secretly teach a new recipe or grant a magical ability.

`tests/multi-habitat-material-gathering.test.js` runs disposable complete action journeys in both original habitats, checks genuine world source records, conservation of stocks, correct Stamina/time/pressure, unmodified player RNG between observed Survival check and later gathers, paid independent ecological regrowth, full no-mutation refusal for unsupported items and missing source, true file-backed turn-ID replay and legacy reed checkpoint compatibility. The old trade/gather/medicine/feeding tests also remain mandatory.

**Honest limits:** A full material-discovery ecology still needs real geological deposits, tools, seasonal vegetation and separate property rights, preservation and extraction safety. The source catalogue is deliberately small because the project must not pretend unsupported resources or rights exist; the **mechanism is generic**, and later source-verified material profiles can be added to it. No active Aerin checkpoint was changed.
