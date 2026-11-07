# Self-taught basic techniques — the world is not a paid academy menu

The Beastbound Master Prompt §§19, 20–21 and 48 provide separate, genuine anatomical power systems, training, resources, teachers, risks and effort. They **do not decree that every technique is taught only by a particular master, school, or fixed fee.** A person who genuinely owns an awakened body and appropriate knowledge may also experiment, develop a method through personal effort, find a manual, join a school, inherit an art, or study under a mentor. Any specific route must arise from the real world rather than an invented source.

Previous patches correctly proved three *basic named formulas* as playable—Arcane Spark, Arcane Ward and Meridian Qi Strike—but unfortunately represented **one optional paid course** as an absolute gateway. This correction keeps that valid course and adds an authentic **`route:"independent"`** for each basic formula.

## What independent study actually requires

The player's existing real anatomy and power progression remain necessary:

| Known basic technique | Physiology that must actually exist | No-tuition self-study | Combat cost and effect |
|---|---|---|---|
| Arcane Spark | Recorded Mana Core + First Circle, genuine geometry and dated milestones | 12 real in-world days, one fixed DC14 Intelligence/Arcana practical, 2 actual Mana in experiments | Original DC12 cast, 2 Mana and 6 nonlethal strike damage |
| Arcane Ward | The same genuine Arcane architecture (but separate learning from Spark) | 12 days, fixed DC14 Intelligence/Arcana, 2 actual Mana in experiments | Original DC12 cast, 2 Mana and a short 3-step M0 Ward |
| Meridian Qi Strike | Actual 12 mapped Primary Meridians and source-dated Lower Gate 1, Stage III | 12 days, fixed DC15 Wisdom/Cultivation, 3 actual Qi in experiments | One proper combat attack spending 3 Qi for 8 nonlethal damage |

The world records the actual location, date, observed underlying anatomy, real energy spent, fixed formula and time in an **engine-authored witness event** before any roll. The player cannot supply a teacher, magical manual, bonus, lower DC, costs, invented location or passing examination. One real technique examination decides success or failure and awards only the originally earned capped Practice Points. The result is stored as `table.selfTaughtBasic` with actual event/check hashes, linked to the same canonical `arcaneTechniques` or `meridianTechniques` record consumed by combat. A failed attempt consumes the full time and energy and grants **no technique**, with an additional one-Stamina fatigue consequence after a severe failed self-experiment. Another attempt still requires a separate subsequent period. **Actual guided courses remain supported**, with their original per-school fees and tuition; the engine does not erase previously earned instruction.

An independent practitioner may start in any already-authored physically reachable location **as long as no immediate battle/encounter is unresolved**. Training in an actual settlement does not require an invented teacher or academy enrolment and charges no **tuition**. A 12-day isolated wilderness study needs **12 actual Clean Rations**, consumed before study, rather than pretending a player can simply sit in an exposed ruin with no food for two sixdays. Long-term shelter, sickness, interrupted expeditions and the local lodging economy are still incomplete; this food requirement is a first real subsistence guard, not a guaranteed magically safe campsite. Players with beast partners need independently arranged care instead of skipping twelve days of animal needs. A patient with Critical wounds or incapacitation must first address them. Other real wounds can affect the examination using the actual wound-combat penalty, rather than being an arbitrary blanket ban on study.

## Correct way to use these rules

The existing operations `arcane.sparkStudy`, `arcane.wardStudy` and `meridian.qiStrikeStudy` each accept `{"route":"independent"}` **in addition** to their existing paid/structured calls with `{}`. Their read-only status views now show the alternative's duration, difficulty and no-tuition terms. After a *genuine successful self-study*, combat works through exactly the existing operations:

- `combat.exchange` with `{"intent":"cast","techniqueId":"arcane_spark"}`.
- `combat.exchange` with `{"intent":"ward","techniqueId":"arcane_ward"}`.
- `combat.exchange` with `{"intent":"technique","techniqueId":"qi_strike"}`.

All combat effects, resource costs, enemy agency, sound magical geometry, honest dice and physical wounds are unchanged. An old academy-trained spell still works without migration, and a self-taught record must be supported by an actual exam event **and its hash**, not an arbitrary `known:true` or a fictional instruction receipt.

## What is still open

This is a **first useful independent discovery mechanism for three low-complexity pre-authored patterns**, not a generic promise to spontaneously rediscover every advanced, unique or secret technique. Different mentors, family inheritance, sect recruitment, apprentice barter, genuine manuals and NPC-specific relationships remain legitimate narrative possibilities but still need more world simulation and evidence-led rules to mechanically grant non-basic techniques. Basic self-study **does not** bypass advanced Gate/Stage/Circle/evolution milestones or replace human-beast power parity.

The GM must recognise the player's chosen learning approach before resolving a mechanic. Do not force players to sign up with Professor Sera or pay the Lumenfall Annex just because that was the first coded tutorial. Treat its terms as **one local offer**, not cosmic law.

`tests/self-taught-basic-techniques.test.js` tests each source-backed route for honest success and failure, fully preserved free-to-study funds, actual energy use and twelve days of world activity, remote food requirements, original source event hashes, fabrication and replay defences, real opponent combat and backward compatibility with the old courses. The whole previous suite remains mandatory. No existing live campaign save is changed.
