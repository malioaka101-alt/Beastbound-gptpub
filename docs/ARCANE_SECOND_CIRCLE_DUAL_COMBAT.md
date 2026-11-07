# Second Arcane Circle — earned dual-channel combat

**Source authority:** Unified Master Prompt §21 (Second Circle — Dual Channeling), §19 (independent power systems), §45 (honest source-gated checks), §46 (tactical combat), §49 (real wounds), and the Table Rules' restrictions on invented abilities and dice.

## Real playable consequence of Second Circle

The already existing `arcane.circleWork` must first have **truly constructed** the Second Arcane Circle, not merely raised a numeric circle counter. This implementation validates the original First Circle history, the dated genuine Second Circle revision attempts, earned quality and work points, the structural integration witness, geometry, two current channels, capacity and Core stability.

**Separately earned spells:** Having Circle II does *not* teach Arcane Spark or Arcane Ward. A practitioner must have previously learned each actual source-backed technique through the currently supported independent self-study or Lumenfall course. There is **no additional tuition, teacher, calendar or guild clearance required to use an already learned formula**.

During an actual wound-model fight, `combat.exchange({intent:'dual_cast'})` or a genuine player action such as `cast arcane spark while warding` routes both spells through the earned channels **in one exchange**. The existing independently committed opponent plan remains the only opponent decision that exchange. Both original spell resolvers roll honestly: Ward forms or fizzles with its original cost/possible backlash; Spark resolves its original casting DC, weapon defense and nonlethal wound effect without free damage. Combined upfront Mana availability must cover both real spells; actual spent Mana reflects each original resolver, including partial failure costs. Ward absorbs a real incoming attack if it was formed, then expires after its established one-minute duration. Neither spell can stack a currently active Ward. Collapse, critical injuries, retreat and rescue consequences remain the actual wound-model combat rules.

This is a **bounded Second Circle integration**, not automatic spell chaining from Circle III, multiple free attacks, free instants, defensive invulnerability, fabricated spells or a universal Arcane combo engine. Higher Circle techniques, advanced multitarget spells, full spatial manoeuvres and longer-duration Ward research remain unimplemented, as in the Master Prompt parity audit.

Self-taught basic spell study now preserves a hash-matched copy of its original successful observation and casting check in the earned-technique ledger, so finite narrative scene-log rotation does not erase a genuinely learned Arcane or Meridian technique. Old saves still work while their original log evidence exists; a legacy record without surviving originals cannot manufacture a replacement proof.

The read-only `arcane.dualChannelStatus({})` and natural `dual casting status` show only whether the player's genuine structure and component spells are currently usable, their combined cost and the presence of a real fight. They neither reveal enemy plans nor consume dice/time.

## Safety and verification

`tests/arcane-second-circle.test.js` uses only independently earned disposable student fixtures, genuine learning checks and actual derived Second Circle construction. It checks preflight rejection of absent or forged construction, externally chosen outcomes/DC/techniques, insufficient combined Mana and an already-active Ward; one opponent plan, actual two casting rolls, independent enemy action, one-minute Ward expiry, verified Mana spending and replay-safe file-backed natural-language turns. All 97 regression files must pass the required private single-runner `test` check before merge. No live campaign save is a fixture.
