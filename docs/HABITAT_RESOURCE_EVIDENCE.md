# Resource integrity — original terrain and honest Survival dice

**Beastbound Master Prompt §§11, 35, 45, 50–51.** Existing natural gathering must be as real as the wilderness and character's actual abilities. A source-authored terrain cue by itself is not a rare find, and a mutable saved boolean is not an engine-owned success.

## Verified original habitat evidence

`rules/habitat-survey.js` now offers a **read-only internal provenance verification helper**, rather than a second skill ladder. It checks the existing personally witnessed, one-use scene challenge against the established biome, terrain cue and challenge parameters, then verifies the original single engine-owned Survival roll, including its natural-roll adjustment, true total, margin, result and degree.

An archive of the original source scene and roll remains valid after the 90-line narrative log rotates, but its original saved content hashes must still match. Older saves without separately archived events remain compatible **if** their actual original scene and dice evidence still exist; there is no made-up replacement proof.

The common `world.harvestReeds` action now requires this verified original record before adding an actual `marsh_reed` to inventory. It persists the source roll hash and original Survival die alongside the existing wetland location, resource quantity and disturbance. This does not draw another die, choose a higher yield, mine magical ores, create grades, infer an animal species, or grant a new skill or power. The separate actual time and stamina costs and credible fen disturbance limits remain.

This is a foundation for trustworthy resource provenance, not completion of every Master Prompt material, harvesting method, market price or equipment durability rule. Saved material counts from existing legitimate backgrounds or prior checkpoints are not retroactively accused of cheating just because those characters have no recent wilderness survey record; they are not being rewritten by this change.

Tests: `tests/habitat-survey.test.js` verifies that ordinary saved evidence remains valid beyond narrative-log rotation, that real successful interpreted fieldwork can supply common materials without new rolls, that forged original terrain/dice/check statuses cannot create inventory, and that older saves without an archive fail conservatively when their actual proof disappears. No live campaign save is modified; the complete 97-test private CI remains required.
