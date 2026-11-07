# Source-bound generic scene checks

The private-chat `mode:'check'` and `system:'core', operation:'check'` **are not free rolls**. A user cannot choose a low DC, high situational modifier, an unearned skill, a risk toggle or arbitrary elapsed time.

A legitimate check starts with an independently established `table.sceneChecks[checkId]` record. The record must name the known local scene, actor attribute and earned skill, the previously witnessed challenge DC (5–30), a documented situational modifier (−5 to +5), actual required time (1–1440 minutes), whether the activity is risky, and a concrete source. It must bind one specific earlier story/world/beast/progress log event through its SHA-256 event digest, matching `details.checkId`. The challenge must be no older than one day and in the same physical location. A raw check cannot replace the encounter/combat action economy.

The player supplies **only** `checkId`. The engine derives the character's actual modifier from recorded attribute and skill rank, rolls honestly, records the roll, advances the exact activity time, and permanently consumes the source evidence and witnessed event. Attempts to reuse the same scene with a different check ID, reroll after a bad result, or edit the difficulty at execution fail closed without persisting a save.

The generic `Core.check` mathematical helper remains usable in **isolated reference tests** and by already verified specialised systems; it is not a second playable skill check path. The scene creation workflow is still **GM/world-authored and precommitted**: player input does not fabricate challenges or give the model authority to insert a favourable record. Routine natural actions continue through their existing specialised engine operations.

The disposable test helper `tests/scene-witness-fixture.js` is for verification only and must never be exposed as a live authoring command.
