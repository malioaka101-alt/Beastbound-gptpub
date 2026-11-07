# First learned Meridian combat technique: Gate-One Qi Strike

**Later correction — power-system freedom:** Professor Sera's three-Talon Lumenfall course is **a local teaching offer, not an absolute law of Meridian cultivation**. After opening a genuine source-recorded Lower Gate 1, a practitioner can try `meridian.qiStrikeStudy` with `{"route":"independent"}` for twelve actual days of practical Qi experiments, DC15 Cultivation, zero mandatory tuition and three real Qi consumed. Outside a settled area twelve genuine rations are required. A failed experiment teaches no Qi Strike. The original technique's three-Qi combat cost and anatomical restrictions remain unchanged. See `docs/INDEPENDENT_BASIC_TECHNIQUES.md`. Earlier source notes about mandatory Professor Sera instruction describe only the original assisted option.


Beastbound's Meridian system has its own numerically precise architecture: 12 Primary Meridians, 8 Extraordinary Routes, 36 Major Branches, 72 Minor Branch Networks, and 108 Gates. Opening a Gate does **not** automatically teach a named martial technique; training and source provenance remain independent from the physical meridian state.

## Original source and narrow teaching rule

The legacy engine already names a basic **`qi strike`** gated behind at least one Meridian opening. The detailed source additions specify a real Qi technique-cost budget via `Build.qiTechniqueCost`. The playable replacement selects one **fixed, nonlethal, close-range, single-target first-gate reinforcement strike**:

- Source-derived `Build.qiTechniqueCost({damage:8,rng:"close",area:"single",projectionM:0,riders:0})` = **3 real Qi**.
- Damage **8**, Offense Magnitude 0, no extra effects, no free projection, no automatic bonus damage, no magical element.
- One honest weapon-style attack die through the existing wound-combat resolver; not an additional unverified roll, not the original HP prototype and not a spell with an Arcane casting DC.

The original named NPC **Professor Sera** is a pre-authored Meridian anatomist who works at the actual **Lumenfall Annex Academy**. Her basic first-gate instruction provides a credible source anchor. The fixed **three-Talon laboratory course, six in-world days and DC 13 Wisdom/Cultivation practical demonstration** are **explicit provisional local study rulings**, not an assertion that the Master Prompt pre-licensed this particular syllabus or guaranteed a learned technique simply by arriving at her workplace.

## Genuine separate anatomy prerequisites

The new `meridian.qiStrikeStudy` accepts **no parameters**. The character must already have reached actual Stage III (first-gate stage) after mapping all **12 Primary Meridians** and opening **Lower Gate 1**. The rule checks:

- One real gate-entry in `player.meridian.gates`, exactly number 1 in the Lower band.
- An independently recorded matching gate in `table.powerPhysiology.meridian.gateRecords` with source-dated quality and day, plus the twelve mapped primaries.
- Actual academy and Professor Sera presence; no active combat/animal encounter, unresolved serious injury or unpaid sixday beast care.
- A real 3-Talon course fee and six legitimate in-world days, including off-screen agendas and ordinary recovery effects.

The fixed source, original gate, course and 3-Qi attack budget are logged **before** the practice die. One honest Cultivation check decides whether the technique is actually learned; failure costs the same course time and money. Successful study stores the specific teaching date, teacher, original gate number and quality, cost, damage, source hashes and first ability record in `table.meridianTechniques.qi_strike`. Original per-sixday Cultivation PP are awarded by the existing capped practice ledger. The player may repeat a genuinely failed course only after a separate full sixday preparation interval. `meridian.qiStrikeStatus` reads this verified learned record without modifying the save.

Neither an arbitrary Stage number, inherited ability, another beast's Grade, a pool of generic Qi nor the Gate opening itself grants permission to use Qi Strike. No 108-Gate completion, Stage IV breakthrough, specialization, Qi healing art or other techniques are inferred.

## One real combat action

Within a truly assessed live wound-combat encounter, use:

`mode:"rule", system:"combat", operation:"exchange", params:{"intent":"technique","techniqueId":"qi_strike"}`

The engine validates both the **genuine source-attested Gate** and the previously learned form, plus available Qi **before combat dice**. The entire **three-Qi** cost is deducted once when executing the technique. The character then attacks with one genuinely resolved Wisdom + two times the earned Cultivation rank, subject to ordinary real wound penalties, against the actual foe's independent Defense, Toughness, ability, reactions and morale. An enemy still decides independently whether to attack, hold or retreat in the same combat exchange. The player cannot supply extra damage, a source claim, a friendly outcome, selected enemy action, elemental riders, reduced Qi cost or an invented named technique.

**Key distinction from Arcane Spark:** Qi Strike is Meridian-based, uses the character's real **Qi**, actual First-Gate anatomy and separate Cultivation, **not Mana/Circles**. It has no Arcane casting check/fizzle mechanism. Arcane Spark's individual learned requirements remain separate, and neither discipline's progress grants abilities in the other.

## Testing and remaining features

`tests/meridian-qi-strike.test.js` uses *disposable* source-calibrated Stage II fixtures, opens actual Gate 1 using the **real** `meridian.gatePractice` dice/quality records, then tests both honest lesson pass/fail, 3-Talon and sixday resource/time costs, source witness hashes, no free ability from anatomy, no replay/forged profile or Qi-cost overrides, valid combat against an individually assessed opponent following linked world routes, and file-backed private turn replay.

Further Meridian techniques (Qi circulation, long-range projection, healing, specialised weapons, high-Gate pressure control, original source Gate 36/72/108 transition rites, Dantian Sea and later Stages IV–IX) remain unfinished. This is deliberately the **first** verified positive technique, not a claim that the complete Meridian system is done.
