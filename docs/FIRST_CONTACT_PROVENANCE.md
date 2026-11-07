# Witnessed animal first contact — narrow Lanternfen Fox route

The first real wildlife encounter can now connect to **neutral** animal relationship history without inventing prior friendship, ownership, a contract, species Grade, mysterious powers or chosen sapience.

## Verified subject and identity

`engine.js::explore` now commits the actual individual beast ID, local species, location and observed first mood to the existing independently generated encounter log event. A player still must discover a real locally spawned animal. `world.observe` must then resolve one genuinely witnessed identification check and store its actual roll event, location, time, subject and SHA-256 roll hash. An inconclusive identification or threatening wildlife encounter does not become permission to approach.

`bond.encounterRegister` accepts **only `beastId`** and verifies all of the following before touching the relationship ledger: the same active individual encounter, its real local spawn/habitat evidence, intact original generated encounter event, a recent successful `world.observe` identifying the subject, its authentic previous roll/event hash, its recorded species and form, safe presence, and no existing bond or conflicting sapience assessment. Unsourced older encounter records and manually chosen species/relationship claims fail safely.

**Only the pre-authored unevolved Lanternfen Fox is currently supported.** Its `animal-cunning` species entry provides a deliberately provisional **S1 animal-welfare handling classification**. This is a conservative species-specific local ruling, **not a general `intelligence`→sapience conversion**, an official cognitive examination, a retrospective assertion about old saves, or authorization to classify S2–S5 sapient persons. An evolved fox, a new taxon, or an individual with a different established sapience record must be assessed separately. A genuine formal contradictory examination must be reconciled, never automatically overwritten.

The operation creates the existing `bond.register(...start:'unfamiliar',years:0)` neutral record and persists `beast.sapienceAssessment`, with **zero Trust, Affection, Willingness, Respect, partnership, contract, coins, PP or training** added. The independent animal's behaviour remains to be resolved later.

## Player-natural approach

After this or another independently legitimate current bond record exists, the private `mode:'act'` phrases `approach` and `approach slowly` use the **existing** `bond.interact` rule with `approach:'gentle'` and the actually present `s.encounter.beastId`; the player does **not** submit a species, DC, favourable outcome or guessed beast ID. The independent welfare/agency veto runs before any possible Charisma/Beastcraft roll, a refusal is respected, and every attempt costs the established 15 minutes and counts toward the single attempt per individual per day. A successful willing response only mints a one-use witnessed `gentle_treatment` bond-evidence ID. To actually update the relationship, consume that evidence separately with the established guarded `bond.event` rule.

`befriend`, `feed`, `offer food`, `offer rations` and prototype unlimited trust boosts remain retired. No other beast species receives this provisional classification. A natural greeting is not a tamed companion.

## Testing and canon boundary

`tests/first-contact.test.js` creates actual random local wildlife via the engine in disposable saves, retains only a genuinely identified eligible animal, checks rejection of fabricated IDs/proof, verifies neutral first-contact state and exact replay, and checks that one natural gentle approach uses real animal choice, cannot be repeated the same day, grants no direct Trust or contract and does not change unrelated campaign checkpoints.

This is a **positive integration route for one known low-sapience species**, not yet a complete taxonomy, veterinary, social dialogue, animal consent, contract, education, species examination or NPC memory system. The original Master Prompt's autonomy, reciprocity, consent and separate ranking/power ledgers remain governing.
