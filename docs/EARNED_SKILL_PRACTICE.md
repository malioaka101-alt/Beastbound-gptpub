# Earned skill Practice Points from witnessed actions

A successfully resolved, genuinely witnessed scene check can now advance the **same original skill Practice Point ledger** used by the legacy engine. This restores earned character growth to the new source-verified ordinary gameplay routes without granting a second training currency, arbitrary PP or a second d20.

## Scope

- `mode:'check'` / `core.check` awards ordinary practice **after** one valid recorded and consumed witnessed scene, to its **actual precommitted skill**. The saved `risky` flag controls whether incidental practice applies at all. The caller cannot change the skill, time, DC, risk or result after seeing the die.
- Natural `world.observe` awards practice to real **Beastcraft** after the one honest, non-invasive identification roll of an independently encountered wild beast, even when identification fails. This never grants contract consent, species Grade, abilities or evolution lore.
- A successful risky check grants **2 PP** and a failed risky check grants **1 PP**, through the original `Engine.skillGain` function. An automatically safe/non-risky check grants zero. The original global per-skill **4 PP per sixday incidental-play cap** remains in force.
- The saved `player.skills[skill].xp` remains the legacy name for this actual PP balance (see existing `engine.js` comments and rank thresholds). There is **no new separate PP counter** for the protected runtime; the `ppPeriod` and `ppThisSixday` fields already enforce the cap across legacy and newly verified actions.
- Rank 1–5 thresholds remain **10/25/50/100/200 PP** for each next rank as implemented. Rank 4 cannot unlock without a real Mastery Trial and rank 5 without a Grand Trial. Neither an excellent d20 nor repeated harmless scenes can bypass them.

The engine awards practice only after the already verified single roll; it does **not** roll a second time, create an extra practice action, change older saved skill balances, or award PP for absent/dead/unverified animals.

`rules/earned-practice.js` is an internal, testable helper, not a direct public free-PP rule operation. The one authoritative implementation of skill growth remains `Engine.skillGain`, now shared with guarded scene checks and wildlife observation.

Regressions: `tests/earned-practice.test.js` (disposable saves only). Higher discipline breakthroughs, professional training weeks, earned specialist techniques and a unified treatment of all historical skill-training sources remain separate development gaps.
