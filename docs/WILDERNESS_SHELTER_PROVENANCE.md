# Witnessed wilderness shelter for full-night rest

The Master Prompt §50 and Table Rules Part 3 require equipment, shelter and field conditions to be genuine world facts. `health.sleep` restores a **full night** of exertion and one Light-wound step. It is not a free mechanism to claim a campsite after reaching a dangerous region.

## The protected routine

In settled locations, the existing urban sleep adjudication remains available. In wilderness, the player must choose a **previously observed site** by `shelterId`. A prior saved `table.sleepShelters[shelterId]` record must have the same ID, a named site, exact **current location**, a dated and independently witnessed source (18+ characters), `knownToPlayer:true`, `safe:true` and a finite `validUntilMinute` no more than one sixday after inspection. The current minute cannot precede the inspection, and the site's verified safety window must cover **the full requested 8–12 in-world hours**. An expired, unknown, unsafe, unvisited, mismatched or improperly sourced campsite fails **before** the game creates a combatant record, recovers a single point or advances time.

`health.shelterStatus` reports only safe, presently known local sites with at least eight hours of verified shelter time remaining. It does not invent new campsites or disclose unknown locations. This is read-only in the private turn runner.

The old request fields `shelterVerified:true` and `shelterSource:'I declare it safe'` are invalid. The quote or information in a request can identify a previously recorded shelter, but **cannot create its safety evidence**. Protected `health.sleep` accepts only `hours` and `shelterId`. In a wild region, the legacy generic `rest` text action without a sourced site intentionally fails closed; the GM must use the protected rule with the established ID.

## Limits

The existence, safe condition, expiry and source of a campsite still require independent GM/world observation and checkpoint authoring. There is **no universal camp-establishing, foraging, cooking, weather protection, night-watch, ambush or multiple-bed allocation system** yet. The route establishes only that a safe place was previously witnessed and remained sound for the interval. It does not claim guaranteed safety outside that explicitly observed window, supply automatic food or conceal ecological threats.

All regression tests use disposable synthetic `sleepShelters` records; real campaign saves and world records are untouched.
