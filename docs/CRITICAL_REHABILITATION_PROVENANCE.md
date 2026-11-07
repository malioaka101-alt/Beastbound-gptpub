# Verified nonlethal Critical wound care and rehabilitation — first limited full recovery route

**Authority and limitations:** Beastbound's Master Prompt §49 requires lasting wounds, appropriate healing, time, cost, and understandable stakes. The supplemental table's `critical_care(...)` example establishes specialist treatment as distinct from `stabilise`, `first_aid` and rest, but **does not prescribe the treatment duration, prices, success probability or Dr Vael's trauma-surgery ability**. The numeric course below is an explicit **provisional Lumenfall local house ruling** for **one safely observed, nonlethal Critical wound**. It is not a universal cure for mortal, maimed, bleeding, poisoned, rift-contaminated, soul-traumatised or transformed patients.

## Route A: patient rescued from a genuine on-site nonlethal knock-out

The playable pathway is downstream of the actual fully source-witnessed `health.physicianRescue` from PR #62. It requires:

- A named original `combat.exchange` nonlethal knock-out saved with an intact original event hash, day, opponent, dangerous-location record and independently recorded safe departure. Falsely claiming that a predator departed does not qualify.
- A real onsite Dr Vael intervention at the already authored Lumenfall Annex clinic, including the saved doctor receipt, unchanged wound boxes, source-authenticated original nonlethal defeat and the subsequent **four-hour actual supervised observation** event.
- The same patient, one existing Critical wound and no conflicting health model, active danger or fabricated movement. The patient must still be `incapacitated` under observation within one real day of the prior emergency attendance. Further prolonged delay must be adjudicated separately.
- No active beast partners awaiting 24 days of unsupported care. A viable future partner-provisioning arrangement is not automatically created.

An injury unsupported by either the original external-rescue route or the new strictly witnessed *conscious field-survivor referral* below has **not** been medically cleared. Mortal injuries, magical damage and invented statuses never become legitimate cases.

## Route B: consciously survived field Critical wound and genuine clinical referral

This later expansion makes the protocol usable for a player actually wounded in an existing dangerous wildlife habitat who **survives the Critical Vigor save**, then withdraws by legitimate `combat.exchange` rather than inventing battlefield escape, and follows the existing path to Lumenfall Annex. The combat resolver itself now records a Critical-hit witness *only* for a genuine canonical wound attack against the player from the current independently assessed combatant. It includes the original wound severity, successful Vigor check, attacker ID, real habitat location, world minute and an exact immutable log event.

`health.criticalReferral` accepts **only empty parameters** at the actual Lumenfall clinic during an 08:00–17:00 consultation window, for a conscious character with exactly one Critical wound and an original matching Critical-hit event no more than one in-world day old. It verifies the original event, source-attributed opponent and unchanged wound boxes, rather than accepting a claimed diagnosis. Dr Vael takes **15 real minutes** to examine the genuinely injured patient and records a patient- and wound-specific referral linked by SHA-256 to *both* the original attack and the new consultation scene. No wounds are healed or medicine consumed by the consultation.

The same `health.criticalCare` then accepts this source-verified unused referral, without claiming that an external rescue or unconscious period occurred. It spends the same actual 60 Talons and the same **18+6 days** of documented non-surgical care and rehabilitation. The patient still experiences the genuine temporary +1 post-Critical fatigue penalty and a later 12-day follow-up. The initial field attack cannot be resubmitted to mint a second course after a completed episode; its referral is marked spent in the save.

The user cannot type a fictional enemy, degree, hospital arrival, doctor's competence, successful Vigor result, wound location, price or healing outcome. This does not unlock treatment for an **unconscious wilderness victim**, who still needs separately supported rescue/evacuation. It is a genuine ordinary-play route for **conscious** survivors only; direct transit still follows the original connected geography, and recent evidence remains mandatory. If a player stayed in the field too long or had undocumented Critical injuries, this narrow referral does not silently backdate history.

`tests/conscious-critical-referral.test.js` tests an independently resolved Critical strike, honest Vigor save, successful withdrawal, forest→crossing→academy travel, witnessed 15-minute consultation, original battle/consult hashes, payment and 18+6-day treatment, and permanent rejection of forged/replayed referrals in disposable saves.

## Stage 1 — `health.criticalCare`

The named physician (not an unconscious patient's action) accepts **only `params:{}`**. The engine validates either the original rescued knock-out **or** an authentic in-person conscious-survivor referral, current wound boxes, doctor, clinic and money **before spending any funds or drawing outcomes**. It then commits a saved protocol bound to the genuine original injury source and its appropriate real medical witness; the existing paid inpatient option is explicitly set at **60 Talons for the 18-day intensive stay and following six-day rehabilitation**.

The world advances **18 real in-game days** with its genuine civic/calendar ticks and off-screen agendas. Non-surgical intensive care resolves **one** verified nonlethal Critical wound, using this explicitly limited local medical protocol—not a claimed universal surgery spell, an invented healing technique or a second favourable roll. Serious wounds recover at one per sixday, consistent with the original wound-rest scale; Light wounds have ordinary nights to close. The character remains `rehabilitating`, unable to take independent conscious actions yet. The engine preserves old HP as legacy history and retains the irreversible clinical and financial record.

This is not guaranteed care for every previously injured NPC; it is a named on-site clinician caring for a prior properly observed patient over a substantial time period. The existing world may legitimately change during those weeks; there is no freeze-frame to protect earlier quests.

## Stage 2 — `health.criticalRehab`

The same source-authenticated clinical record, unchanged post-intensive wounds and the `rehabilitating` status are verified. The next **six full days** of physical rehabilitation pass under Dr Vael's supervision. No further fee is charged (included in the prequoted course). After successful non-surgical recuperation the patient can resume normal conscious play, with:

- Canonical status `ok`; no illegal instant resurrection.
- All remaining Light wounds closed and one additional Serious wound recovered by the earned sixday.
- A persistent **`post_critical_fatigue`** condition and **+1 real wound/action penalty** in the existing wound-combat `Combat.penalty` maths, including reduced attack effectiveness. This is a temporary functional consequence rather than a fabricated missing limb or permanent ability loss.
- A dated discharge and 12-day follow-up window. The original Critical injury remains present in the clinical history despite healing.

While still `rehabilitating`, the runner forbids normal movement, combat, crafting, rolls, trades and training. Read-only medical status, external care and pending clinician rehabilitation are allowed. After discharge the character may resume play, but their limitation remains until further actual elapsed time and examination.

## Stage 3 — `health.criticalFollowup`

After **12 actual additional in-world days** have passed, a return during Dr Vael's real **08:00–17:00** appointment hours at Lumenfall Annex takes 15 further minutes. This requires an authentic discharge hash, unchanged patient identity and present clinic, status `ok`, and a real lingering fatigue restriction. It removes the temporary combat penalty, keeps the documented history of the critical injury and records exactly one witnessed medical follow-up.

The 12 days are **not free**, off-screen elapsed days or an automatic manufactured date: play may continue with the fatigue penalty, or ordinary verified rest/downtime can advance time under its own separate rules. No unsupported `world.advance({days:12})` request becomes legal. The permanent clinical ledger is never wiped by rehabilitation.

## Allowed request sequence

1. Either a genuine on-site nonlethal defeat → source-witnessed `health.physicianRescue`; **or** a consciously survived Critical hit during real `combat.exchange`, lawful withdrawal/travel to the real Lumenfall clinic, and witnessed `health.criticalReferral`.
2. `mode:"rule", system:"health", operation:"criticalCare", params:{}` → 60-Talon paid 18-day medically supervised non-surgical convalescence.
3. `mode:"rule", system:"health", operation:"criticalRehab", params:{}` → six real days of physical therapy, discharge as conscious but fatigued.
4. At least 12 more world days later, a 15-minute `health.criticalFollowup` at the actual clinic completes recovery. `health.criticalStatus` is read-only at every stage.

All three operations reject caller-authored rescuer identities, doctor qualifications, rolled medical successes, changed injuries, fictional emergency transfer, future timestamps, invented medicines, instant full healing and reusing the same treatment receipts.

**Not yet covered:** Wilderness evacuation, mortal life support, surgery, complex healing arts, hospital staffing and supplies for all settlements, debt/charity, unpredictable infections, guardian/partner inpatient provisioning, consent of S2+ patients, traumatic scarring in particular anatomical locations, and Critical injuries outside these two narrow, authenticated local clinic routes. This is one complete *local* recovery route, not finished Beastbound medicine.

The new regression suite `tests/critical-rehabilitation.test.js` is run by GitHub Actions with all existing private engine tests; all scenarios are disposable and do not change an active campaign save.
