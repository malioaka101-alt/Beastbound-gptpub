# Safe, provisioned local downtime

The playable `world.advance` route no longer accepts `days`. The pure `rules/world.js::advance` remains available for offline simulation and world-ecology tests, not as permission to skip years in a live campaign.

To pass time without a specific scene, the GM must **already** have established `table.timePassages[passageId]` for the character’s exact present local clock and settlement. The plan must contain a concrete prior witness (`story`, `world` or `progress` log event with matching `details.passageId` and SHA-256 event digest), the actual source and purpose, a bounded span **1–6 days**, and a real requirement of **one `clean_rations` per day**. The player requests only the previously established `passageId`.

This provisional route is allowed only in an established settlement, with sufficient real rations and no unresolved beast encounter or fight, unresolved injuries or active accompanying beast partners. Longer off-screen spans, wilderness camps, partner care, unverified lodging, heavy injury, advanced recovery and paid institutional study require their own witnessed procedures. Source text and an ID in a request cannot create a valid plan. A correct passage consumes actual food and the unique witness once, advances all independent world and agenda ticks for the elapsed days, and grants **no earned skill, researched power, salary or story outcome** simply for waiting. Reused IDs or scene hashes cannot cause a second passage.

This is deliberately narrow. It does not automatically adjudicate NPC meetings, beast feeding, faction obligations, medical care, interrupted rests, or commercial lodging. The simulation can be stepped freely in isolated non-game tests with the pure world helper; a live campaign cannot use that helper to invent a time jump.

See `tests/time-passage.test.js` for file-backed anti-replay coverage and `tests/time-passage-fixture.js` for disposable test setup only.
