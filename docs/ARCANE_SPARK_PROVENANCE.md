# First genuinely learned Arcane combat technique: Arcane Spark

**Later correction — power-system freedom:** The paid Lumenfall Spark course below is **one available tutorial, not a universal prerequisite**. After genuinely earning a Mana Core and First Circle, a practitioner can instead use `arcane.sparkStudy` with `{"route":"independent"}` for a real twelve-day, no-tuition DC14 self-experiment that spends actual Mana and has no guaranteed success. The source is the character's actual Circle and real existing world site; remote training requires twelve real rations. See `docs/INDEPENDENT_BASIC_TECHNIQUES.md`. Any earlier sentence saying the named academy is the *only* possible source of Spark applies solely to the legacy assisted route.


This adds the first positive **Arcane technique** that can actually be learned and used in the private Beastbound wound-combat engine. It is deliberately **not** an automatic bonus from achieving a First Circle, a universal caster rank or a way to invent spells by saying their names.

## Authority and fixed local syllabus

The original engine prototypes the action **`arcane spark`** behind a First-Circle prerequisite. The separate canonical Beastbound System Additions specify the more careful Arcane architecture: Mana Core, constructed Circle geometry, complexity, spell families, load, range, Mana cost, a casting DC and **one attack die for both casting and hitting**. The new implementation follows those detailed budgets instead of using the old prototype's free damage roll or HP attack path.

The first playable formula is intentionally a **small, standard nonlethal close-range Arcane strike**:

- Family `strike`, fixed damage **6**, range **close**, one target, instantaneous, magnitude 0, speed standard, no specialisation or extra riders.
- `Build.spellCost` derives Complexity **2**, Mana cost **2**, Load **1**, casting DC **12** and minimum Circle **1**. These numbers come from the existing budget equations, not user-selected combat bonuses. The technique does not learn extra range, permanent effects or elemental damage.
- The **six-day independent academy Spark lesson**, provision of laboratory materials for **4 Talons**, fixed **DC 12 Intelligence/Arcana** practical evaluation and the learning record are **limited local table rulings**. The named Lumenfall Annex exists as an academy; it does *not* establish a specific Arcane professor, automatically owned manual or universal arcane licence. This is an explicitly bounded self-study curriculum based on the *already pre-authored* Spark pattern, not fabricated NPC instruction.

## Earn it through real power progression

`arcane.sparkStudy` (empty params) is usable only at the actual Lumenfall Annex academy under safe conditions and with no unsupported sixday partner-care skip. The saved character must already have an **actually earned and dated Mana Core milestone** and a **successfully constructed First Circle milestone**, with a real geometry and current Circle. Merely having 24 Mana or setting the current `circles` number is not proof of a learned technique. Old prototype `arcane spark` commands remain retired.

The lesson commits an authoritative academy setting, the exact source syllabus, fee, time and spell profile **before** rolling. It spends 4 real Talons and **six in-world days** including off-screen world ticks, and makes **one honest Arcana check**. The successful lesson creates `table.arcaneTechniques.arcane_spark` with the actual roll/scene hashes, date, constructed Circle geometry and exact immutable formula. Failure consumes the money and time without granting the technique; a repeated course must be genuinely later and separately funded. Original per-sixday Arcana Practice Points are awarded only by the actual lesson check and remain capped through the existing `earned-practice` mechanism. `arcane.sparkStatus` is a read-only view of the one supported formula and the character's own learned state.

## Use it in genuine wound combat

After real combat begins against an individually assessed beast, the only supported spell attack request is:

`mode:"rule", system:"combat", operation:"exchange", params:{"intent":"cast","techniqueId":"arcane_spark"}`

The private runner and the combat resolver reject additional `damage`, `manaCost`, `castingDC`, `enemyPlan`, `element`, `offM` or quality fields. The engine checks the recorded successful lesson, unchanged technique/geometry, current First Circle, load capacity and actual **2 Mana** before any combat dice. The pre-existing `Combat.attack` resolver uses a **single** die against the formula's casting DC **and** the actual enemy's Defense. If the casting check fizzles, the original spell budget's setback/failure Mana rules apply; an ordinary hit or miss expends the proper cost. Successful attacks resolve **nonlethal wounds**, not legacy HP, with the enemy's original anatomy, defenses, reactions, wounds and independently chosen behaviour. The real enemy is not forced to hold still while casting, and a cast uses a full round. No arbitrary Arcane Spark use outside the current encounter is authorised.

The technical distinction matters: a First Circle increases *capacity*; the teaching record independently proves *technique mastery*. It does not automatically increase Circle, progress toward evolution, grant every basic spell, produce a mana regeneration potion, cast a healing spell, or turn spell attacks into a new currency.

## Remaining gaps and tests

This is the first **one** learned technique. Later Circles, learned wards/binds, spell specialisation, laboratory manuals, rune and formation licensing, Channel load across multiple simultaneously maintained spells, environmental risks, elemental adaptation and general technique mastery still need source-scoped procedures.

`tests/arcane-spark.test.js` uses disposable finished-milestone fixtures, real independently generated Arcana lessons with success/failure, actual linked academy→crossing→forest travel, individually assessed hostile combat, authentic one-die casting/Mana consumption, fake-claim rejections, file-backed immutable turn IDs and read-only status. The full engine test suite must pass before merging. No existing campaign checkpoint is changed.
