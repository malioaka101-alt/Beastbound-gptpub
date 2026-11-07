# Witnessed sustainable marsh-reed harvesting

The Master Prompt's ecology is independent and scarce; a generic `forage` command should never be an unlimited source of magical crystals, high-value shards or arbitrary materials. The old prototype may still calculate standalone reference vectors, but its `forage` and `gather` commands are now retired from **private-chat gameplay**.

## Supported positive workflow

1. Visit the actual Whisperfen (`fen`) with no open encounter. Use `world.habitatSurvey`, then resolve its source-recorded `checkId` with `mode:'check'`. The habitat observation consumes real time/Stamina and the one true Survival check against its fixed environmental challenge.
2. Only if the witnessed wetland check succeeds and remains current (within one in-world day) may the user request `world.harvestReeds` with **only the same `checkId`**.
3. The harvest consumes another 45 real minutes and four Stamina, yields exactly **one common `marsh_reed`**, raises local fen habitat pressure by one, and records the link to the survey scene and actual item grant. No second roll, advantage, extra yield or new specimen is supplied.
4. Each successful survey may support harvesting **once**, and the player may harvest this wetland category at most once per in-world day. When fen disturbance reaches the existing high-pressure band (7 or above), extraction is blocked. The action also refuses unresolved encounters, unsafe location, insufficient Stamina and seriously injured gatherers.

This narrow feature deliberately does **not** grant `moss_crystal`, `sun_shard`, `ironbloom`, `ripening_fruit`, `origin_sample`, special medicines, species Grade, hidden evolution ecology or free professional income. Harvestable flora other than common visible reeds requires its own observed habitat, ecology/season, scarcity, supply and risk model. Success at reading traces is not proof of a rare mineral deposit.

The location, common marsh reed material and ordinary Survival check correspond to the existing authored Whisperfen and resource vocabulary. The pressure cutoff and one/day sustainability limit are conservative implementation protections, **not a complete canonical per-species plant or ecological depletion system**.

See `rules/reed-harvest.js`, `rules/habitat-survey.js`, and `tests/reed-harvest.test.js`; all file-backed tests use disposable saves and do not change campaign checkpoints.
