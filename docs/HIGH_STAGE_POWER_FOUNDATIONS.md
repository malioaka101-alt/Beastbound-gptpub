# Beastbound — High-stage power foundations (8 November 2026)

## Authority and scope

The original `reference/Beastbound_Realms_Unified_Master_Prompt.md` §§17–29 is authoritative. This is an engineering progress note, not an alternative rulebook. The player's explicit standing corrections remain: **no universal class/rank conversion, mandatory teacher, arbitrary tuition, age threshold, calendar gate or predetermined number of training sessions**. Physical/energetic compatibility, individually demonstrated competence, true source access, living-world consequences and honest dice continue to matter. An extraordinary practitioner may make a breakthrough unusually rapidly, but no character receives high stages by merely declaring one.

There is no active playable campaign. The old Aerin trial was ended and reset on 8 November. All feature tests use disposable characters.

## First advanced path — Meridian Stage IV, Dantian Sea Formation

The source separates 108 progressively opened Gates (Stage III) from the establishment of a **stable internal Qi sea** (Stage IV). The existing engine already records individual Gate quality and the 36/72/108 anatomical transitions, as well as the two prior rites. The new `meridian.seaStatus` and `meridian.seaWork` connect those foundations.

A Stage IV attempt requires a genuine recorded Stage III, 108 matching ordered Gate and physiological records, all three recorded structural transitions, original Stage I and II history and viable current stability, without an unresolved fight. The current narrow prototype permits independent compression, circulation, stabilisation or integrated work, with freeform *descriptive* approach and optional genuinely witnessed theory guidance; this set is a tested interface, not a rule that forbids all other plausible methods in the world.

Each actual session spends existing Qi, stamina and 15–480 minutes, then resolves one original engine-owned check affected by the character's Wisdom/Cultivation, physical foundation, Gate quality and observed theory. Failed attempts still cost resources; severe failures can cause a wound and reduce Meridian stability. An exceptional first attempt can complete the structural transition immediately if the person genuinely meets the challenge. There is no compulsory school, paid tutor, age gate or fixed waiting period.

Only a **successful stored outcome** creates a first Dantian Sea ring and records density, purity and stability. The original `rules/build.js` Stage IV profile determines the resulting **structural** Qi capacity, flow and recovery. New storage is **not** filled with free Qi. High-tier technique effects, burst/projection in combat, healing, human evolution or additional Sea rings are not automatically learned. Source-backed future techniques must be developed with routes, costs, risks and witnessed use.

## Second advanced discipline — Arcane Third Circle, Matrix Formation (on this development branch)

The original Master Prompt §21 defines Arcane progression as **Mana Core and Circle geometry**, not Meridian physiology. Its Third Circle is a real *three-part resonance matrix* capable of supporting compound spells, chaining and self-correcting formulae **once those formulae are genuinely learned and verified**. It cannot be awarded by holding 24 Mana, writing "Circle III" in the action or declaring a mage level.

The added `arcane.matrixStatus` and `arcane.matrixWork` reuse the existing Arcane progression and world-clock framework but have **different prerequisites and effects from Dantian Sea Formation**:

- The original earned Mana Core and First Circle history, First Circle geometry, actual completed Second Circle revision and **recorded dual-channel source witness** must be consistent. A forged `circles:2` number is not evidence.
- Independent third-layer matrix work describes three-Circle resonant geometry and may emphasise resonance, cross-coupling, formula feedback or integrated design. These are available verified practice focuses, not a universal ban on other credible in-world approaches.
- A real 15–480-minute attempt spends **4 Mana** and appropriate **Stamina**, then performs one original engine Arcana/Intelligence check, adjusted by actual Core stability and optional already witnessed theory. Failure costs real resources; severe feedback can damage the Core and the practitioner.
- Only earned integrity 6/6 from authentic successful checks can construct Circle III; an exceptional check may finish it in a single genuine attempt. On success the original `Build.arcaneProfile(3)` governs the new three-channel geometry's capacity, intake, complexity and load; the saved **matrix integrity** remains distinct from Core stability and First Circle geometry.
- Forming the matrix grants **no automatically invented compound spell, elemental spell, Arcane Field, beast organ or human evolution**. It must also **preserve a previously earned Second Circle dual-channel capability**, provided the mage genuinely knows each component spell.

`tests/arcane-third-circle-matrix.test.js` exercises the original Second Circle path before Circle III work, no fake stage input, real resource costs, structural record, original dual casting provenance, saved receipt replay and unaffected independent disciplines. Full CI is required before merge.

## Equal detail without identical progression — acceptance standard for every power path

Each major source-authored power path should eventually have six distinct, tested components: (1) required **anatomical, spiritual, spatial, symbolic or evolutionary structure**, (2) honestly obtained prerequisites and individually recorded advancement, (3) personal ways to practice including self-directed routes, (4) real risks, setbacks and resource/clock consequences, (5) at least one **usable** earned capability with its own costs, counters and limitations, and (6) consistent saved history, source provenance, player-known-only HUD and duplicate-turn protection.

These criteria do **not** mean the same DC, number of successes, teacher, currency cost, age, stages or training clock across every path. Arcane Circle III and Meridian Stage IV already show why this distinction matters. Structural advancement and useful techniques remain different achievements, so **one new milestone is not complete playability for an entire discipline**.

The follow-on development sequence must respect the original required physical principles:

- **Meridian V–IX:** connect genuinely differentiated Primary, Extraordinary and Branch routes before any responsive Meridian Web; later living intent, evolving physique, bounded living domain and individual transcendent constitution require separately learned expression and counters.
- **Arcane IV–IX:** dynamic spell editing, projected fields, living nervous-system lattices, astral architecture, locally understood law models and prepared world circuits each require unique architecture, environmental resistance, and overload consequences.
- **Soul II–VII:** soul-body threading, resonance lattices, consent-compatible spiritual crafts, internal sanctuaries, bounded soul domains and living soul architecture must track identity integrity, consent and non-resurrection limits.
- **Body III–VII:** organ transformation, nerve-sense integration, blood-essence, adaptive organs and a unique permanent physiology need actual tissue-wide change and meaningful injuries without compulsory Qi or Mana stages.
- **Rift II–VIII:** authenticated spatial anchors and measurements must precede real Fold Steps, boundary work, pocket construction, environmental adaptation, Realm Walking and costly bounded spatial domains.
- **Beast-Origin:** Pattern Mapping, Compatibility Testing, Trait Seeding, Rejection, Stabilisation, Expression, Adaptation and Personal Evolution require source rights, structural compatibility, integration load and informed consent whenever relevant. Borrowed beast essence is not automatic spell reproduction.
- **Human evolution, partners and specialist crafts:** permanent Origin Pattern transformations, bilateral beast synchronisation and runes/formation/alchemical technique mastery each have their own original canon; never count them as Meridian Gates, Arcane Circles or character skill ranks.

## Distinct future advanced work — NOT implemented by this milestone

| Independent discipline | Source-defined higher path | Next evidence-backed engineering slice |
|---|---|---|
| **Meridian** | V Meridian Web Integration; VI Living Intent; VII Physique–Meridian Integration; VIII Living Domain; IX Transcendent Constitution | Verified Primary/Extraordinary/Branch web integration and one real bounded Stage IV projection or reinforcement use before any Stage V+ grant |
| **Arcane** | III Matrix Formation (this PR); IV Dynamic Architecture; V Field Projection; VI Living Lattice; VII Astral Architecture; VIII Law Interpretation; IX World Circuit | Next: source-backed compound spell formula and use of the earned III matrix, then independently built dynamic IV geometry |
| **Soul** | II Soul Threading through VII Living Soul Architecture | Source-backed soul-body threading, identity stability and specific consent-bound applications; never spontaneous mindreading or resurrection |
| **Body** | III Organ; IV Nerve-Sense; V Blood-Essence; VI Adaptive Physique; VII Evolved Physique | Tissue-specific organ and nervous-system work after genuinely completed first two cycles, with physiological consequences |
| **Rift** | II Anchor Marking through VIII Boundary Domain | Actual environmental anchors and mapped spatial measurements before displacement, storage or domain work |
| **Beast-Origin** | Mapping through Personal Evolution (eight source procedures) | Individual sourced trait, anatomy/consent, compatibility and rejection before any acquired biological organ |
| **Human evolution** | Awakened, Refined, Transformed, Ascendant, Transcendent, Higher Evolved | Separate earned biological transformation evidence — never a stage automatically inherited from a discipline |
| **Human–beast Sync** | Ten reciprocal stages | Individual partner choice, trust, understanding and authentic shared work, never unilateral power transfer |

The three *additional* middle development milestones requested by the player remain individual systems' intermediate achievements, not new numbered canonical Circles/Gates/Cycles. See `docs/LIFELONG_MASTERY_AND_MIDDLE_STAGES.md`.

## Verification and limits

`tests/meridian-stage-four-sea.test.js` exercises earlier anatomy records, an actually rolled 108th Gate, source-consistent Stage IV work, resource accounting, structural capacity without free learned effects, bad inputs, save persistence and stable private turn replay. The complete regression suite must pass before merge.

**Not yet complete:** exact Stage IV Sea-ring growth beyond the first ring; playable projection, recovery, pressure counters, high-stage NPC practitioners, Stage V–IX meridian work, greater Arcane Circles, Soul/Body/Rift/Origin higher architecture or real human constitutional evolution. The `build` calculators are structural references, not authority to grant skills or ranks.
