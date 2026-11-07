# First learned First-Circle defensive Ward

**Later correction — power-system freedom:** The Lumenfall Ward course below is **one structured option**, not universal canon. A real earned First Circle also permits `arcane.wardStudy` with `{"route":"independent"}`: twelve genuine days, no mandatory tuition, DC14 Arcana, consumed real Mana and a real environmental source, with twelve actual rations if isolated in the wilderness. It still grants no free automatic Ward. See `docs/INDEPENDENT_BASIC_TECHNIQUES.md`. The earlier statement that a specific academy lesson is mandatory is superseded.


This work adds the **second** distinctly taught Arcane technique. Existing `Arcane Spark` is a nonlethal *attack*. The new `Arcane Ward` is a **small self-defensive field**, with no damage or new offense. An existing Mana Core and an actual earned First Circle grant *capacity*, not automatic knowledge of either spell.

## Original sources and clearly bounded local rulings

- The source's spell budget includes a `ward` family, duration, range, magnitude, cost, Complexity and min Circle; its combat engine already implements a ward as **steps of shield + Ward Magnitude**, with **whole-hit absorption** until it collapses. The System Additions explicitly describe the one-roll non-attack cast and partial Mana consumption on a setback.
- `Build.spellCost({family:"ward",rng:"self",area:"single",duration:"1min",magnitude:0,conditions:0,extraTargets:0,speed:"standard"})` yields **Complexity 2, Mana 2, Load 1, casting DC 12, minimum Circle 1**. No free fourth-Circle warding capacity or high-Magnitude barrier is permitted.
- The first **small M0, 3-step Ward** and 6-day **Lumenfall independent academy study** (4 Talons and a fixed DC12 Intelligence/Arcana practical) are transparent **provisional local implementation rulings**. The original source did *not* assign 3 steps to this first formula, identify a specific Ward teacher, or licence a universal sixday spell curriculum. The Academy is an established location, not a fictional instructor.

## Earn a real formula

`arcane.wardStudy` accepts only `params:{}`, at the actual Lumenfall Annex academy, after both independently recorded dated **Mana Core** and **First Circle** breakthroughs and real Circle geometry. Existing `arcane-spark` sourced `curriculum` validates these actual milestones without requiring the player to learn Spark first. This is a *separate* technique.

It requires a currently medically fit student, enough real funds, a safe academy workspace and no unsupported sixday unattended beast-partner care. Before any lesson roll the engine persists the fixed lesson source, study fee and build-derived spell budget, then spends **six real in-world days** and **four Talons** and makes one actual Arcana practical check. It awards capped original PP only from that original check. Success persists a unique technique with date, geometry, full formula, original study success and scene/check hashes. Failure permanently consumes the course time/funds, gives no spell and requires another separately justified interval before a future try. `arcane.wardStatus` is a true read-only view.

## Wound combat: one defensive round, genuine danger

During a **verified active wound-model battle**, use:

`mode:"rule", system:"combat", operation:"exchange", params:{"intent":"ward","techniqueId":"arcane_ward"}`

The spell profile checks real learning, original tuition, Circle, current Mana and unchanged original budget **before combat dice**, and an actual checked Ward can be raised only if the player has no other active shield. It is a **normal combat action**: the independent hostile foe still chooses attack, hold or retreat. One actual **non-attack Arcana casting die** is rolled against casting DC 12 and no extra roll is granted to chase success. On success the engine spends **2 Mana** and raises a **3-step M0** shield. If the enemy attacks, `Combat.attack` applies its already verified **whole-hit Ward absorption** logic; even the attack that exhausts the shield is blocked. A setback costs **1 Mana**, failure costs **2 Mana**, and severe failure costs **2 Mana plus one real Stamina from controlled backlash** (this stamina consequence is a bounded local adjudication; no special damage is invented).

The original *one-minute* duration ends at the end of that combat exchange—using the world's existing one minute per exchange. Unused Ward steps expire; they cannot be stored, traded, stacked or carried to another encounter. Raising this Ward does not automatically win combat, create an external rescuer, prevent magical or mental dangers not covered by the existing Ward resolver, or add a permanent defense modifier. No Swift reaction Ward is authorised (the source supports it later with separate complexity/proficiency rules).

Neither a bare Circle, a free high-level `ward` record, arbitrary self-target "invulnerability" nor player-specified Mana cost/step value creates this spell. No `arcane.wardCast` direct bypass is exposed: live use goes exclusively through the source-protected `combat.exchange` with independent enemy response.

## Tests and limitations

`tests/arcane-ward.test.js` verifies built spell-budget numbers, real successful and failed tuition, source scene/check hashes, immutable spent cost/time, no free ability from a Circle, false/forged technique failures, insufficient Mana, honest cast/fizzle, independent enemy actions, actual incoming-hit absorption, **hard expiry after 1 minute**, and file-backed turn replay. CI requires all previous engine suites as well.

Other defensive schools, longer wards, high-Magnitude shields, load management across maintained spells, spell licenses, fourth-Circle Ward, Swift reaction casting and reconfiguration of spell formulas still require dedicated canon-checked mechanics. No active campaign save is edited.
