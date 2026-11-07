# Earned household standing through real civic work

This expands the first living Beastbound family layer in `docs/LIVING_HOUSES_AND_POLITICS.md`. The player's position in society should come from relationships, choices, qualifications, real work and circumstances. An offer to serve a house is **not** a guaranteed appointment, bloodline, inherited ability, marriage or property transfer.

## First genuinely useful social-service opportunity

A character who actually completes a **successful** `world.habitatSurvey` followed by the *single original witnessed* `core.check` in the relevant Reedmarch environment can present the result to a local family that has a directly relevant public obligation. Current genuinely supported matches:

- **House Fenwake** — Copperwood forest or Whisperfen wetland terrain reports, relevant to sanctuary access and flood-control stewardship.
- **Reed Clan Families** — Whisperfen habitat reports, relevant to the reed-bed harvest and preservation dispute.
- **Reedward Ferry Kin** — Whisperfen wetland observations, relevant to real public crossings and river safety.

A general habitat survey is **not** automatically relevant to medical trait diagnostics, a crown succession, sealed family medical research or a distant kingdom's domestic laws. Other opportunities must have a genuine reason.

The player must first genuinely examine that family's public charter at **Morrowfen Crossing** using `social.inquire`. During the existing registrar's daytime hours, a new `social.submitReport({houseId,checkId})` then spends **12 real minutes** lodging the original report. The engine validates the original terrain challenge, dated habitat, unmodified specific field check, successful original Survival roll, authentic scene and roll hashes, and public duty compatibility. It can reject fabricated success, old/missing results, invented lineage, caller-specified bonuses, duplicate reports, or a second submission to harvest free standing.

The family is **independent**. On an actual next sixday tick, its current public pressure and world RNG determine whether it acknowledges the work or declines to count it as qualifying service. The answer is held in the guild register until the character personally collects it with `social.collect({letterId})`. Only then, if the original report is intact and the independent family decision was acceptance, the character gains a **small bounded +1 civic regard** with that *specific* family (maximum 4). A refusal grants no regard, but does not retroactively erase the real fieldwork or cause an arbitrary personal feud.

`social.status` exposes the player's **earned** regard only for houses they actually researched and respects still-uncollected replies. This personal regard records one family having acknowledged helpful work. It does **not** imply membership, kinship, authority to spend family property, an appointment, a romance, automatic employer patronage, a discount on training, a hereditary gift or any supernatural power.

## Natural social mobility, not a patronage quest chain

A good social simulation supports ordinary craft and public service as much as heroic duels. The player's real deeds can change an institution's assessment without converting all families into friendly quest vendors. Some will value accurate ecological work; others may prioritise inheritance disputes, cash flow, defence or closed-family traditions. Players can seek apprenticeships, challenge laws, protect endangered species, negotiate fair work, join or refuse houses, befriend individual people, marry with consent, establish a new family or work entirely independently. Those other paths remain future gameplay and cannot be pretended to succeed from this one narrow fieldwork receipt.

The Master Prompt §§34, 36, 39, 42, 47 and 54 govern social agency and player freedom. Courtly clans, contested lineages and social ascent are **generic fantasy and manhwa inspirations**, not imported cast, proprietary lore or forced cultivation classes.

`tests/earned-family-service.test.js` verifies genuine fieldwork through source-attested terrain and a real check, relevant/fake/duplicate report rejection, after-sixday independent acceptance and refusal, in-person mail pickup, bounded social acknowledgement, no money/ability/rank unlock, immutable save IDs and pure read-only social status. No existing campaign save is modified.
