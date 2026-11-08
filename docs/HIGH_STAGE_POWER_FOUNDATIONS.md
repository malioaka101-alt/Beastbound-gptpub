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

## Third distinct power path — Body Refinement Cycle III, Organ Cycle (this PR)

The original Master Prompt §23 describes **organ-level supernatural physiology**, independent of Qi storage or Mana Circle architecture. The heart, lungs, liver, kidneys and supporting systems must actually adapt; writing "Cycle III" or possessing a large Stamina pool is not a transformation.

The new `body.organStatus` and `body.organWork` implement a bounded anatomical training slice through the established protected rules runner. Work first validates saved Cycle I and II histories, their actual physical wound-model constitution and current safety. Ordinary individual-organ conditioning and integrated organ work are both real routes; meaningful integrated success must cover the heart, lungs, liver and kidneys, while other organs are part of the systemic response rather than an overlooked extra stage. **Exceptional, successful whole-body conditioning may complete multiple structures in one true attempt.** No invented school fee, mandatory tutor or minimum age/calendar/number of sessions is imposed.

Each attempted 15–480-minute session consumes real Stamina and resolves an engine-owned Constitution/Survival check at the current stage. Success makes recorded anatomical progress, failure costs effort, and severe failure can cause an actual wound. Completion grants an earned **+2 Stamina capacity, +1 Toughness and one extra Critical wound box**, without changing Qi, Mana, Soul, Rift, beast relationships or human evolution. An original saved organ-history receipt is required before the existing legal **combat Recover** action gains +1 additional Stamina, bounded by the normal maximum and the same action-use limit. A forged `cycles: ['Organ Cycle']` entry produces no enhancement.

A full physiological remodel is not identical to an instantly healed injury, protection from every poison, or an evolved constitution. The tested Organ Cycle does not grant automatic supernatural respiration, environmental immunity, permanent high-organ regenerations, medical training or the later Nerve–Sense/Blood-Essence cycles. Such abilities need separately witnessed mechanisms and counterplay. The original prompt allows different schools and cycle ordering; this initial playable pathway is one verified route after the existing first two cycles, **not** a ban on other biologically supported progression orders adjudicated by a GM.

`tests/body-organ-cycle-three.test.js` uses disposable bodies with source-dated prior cycle history, real new work rolls, an earned physical change, actual combat Recover, forged/no-evidence refusal, severe possible injury and turn-ID replay. All older body/health/combat tests remain mandatory.

## Fourth independent advanced development — Soul Phase II, Soul Threading

The original Master Prompt §22 treats soul as **consciousness, identity, memory, spiritual stability and soul–body resonance**. Phase II links the practitioner's own mind, soul and body; it is neither biological Organ Cycle nor Arcane Circle construction. Successful Soul Threading strengthens concentration and identity anchoring, not the ability to read secrets, own another soul, force contracts or raise the dead.

The new `soul.threadStatus` and `soul.threadWork` use existing Phase I Soul Perception's dated breakthrough and personally established Soul reservoir as prerequisites. Independent mind, body and resonance exercises or genuine integrated whole-self work can earn 2 points of integrity on each link; integrative work must be earned and cannot be bypassed by writing a bigger Phase number. Exceptional real outcomes can integrate multiple links at once; **no mandatory tutor, price, minimum age, calendar interval or set count of sessions** is imposed. Sessions actually consume 2 Soul reserve, real stamina and 15–480 minutes, and resolve one protected Cultivation/Wisdom check. Severe spiritual backlash can lower stability and cause a real wound.

Only the verified integrated outcome grants Phase II, records mind/body/resonance links and Soul-thread integrity, and upgrades the canonical Soul reserve capacity and bounded perception range **without refilling energy for free**. The original Phase I ability remains available. It now receives an authentic **+2 concentration modifier on its existing Soul Perception check** only when Soul Phase II is fully proven; the check still consumes the original energy and time, and still requires a real current player-known local scene. This is a present, useful spiritual effect with a check and cost, not an automatic ability to see unseen beasts, infer souls, learn names or force a partnership.

`tests/soul-phase-two-threading.test.js` checks dated Phase I history, both individual and integrative routes, true risk, costs, earned capacity, actual perception use, forged proof/bonus refusal and file-backed turn-ID replay. It runs alongside all older Soul perception, partnership and combat regressions.

Later Soul Phases III–VII remain unimplemented: resonance lattices, consensual contracts and spiritual tools, Soul Forge, Inner Sanctuary, bounded Soul Domain and living soul architecture will require their own structural evidence, legal/ethical obligations, countermeasures, resource constraints and real uses. No system should acquire those powers merely by reaching Phase II.

## Fifth independent power path — Rift II, Anchor Marking (this PR)

**Canon basis:** Master Prompt §25 requires spatial reference points that genuinely help orient practitioners in abnormal dimensional pressure. Rift Sense (Step I) detects locally measurable boundary weakness. Anchor Marking (Step II) fixes a reliably observed *reference*; it is **not** Fold Step, teleportation, map-making by omniscience, entry into the sealed Riftglass vault or a protected-site permit.

The first source-backed reference site is the **already existing public exterior wardline at Riftglass Outpost**. The current prototype does not fabricate new spatial anomalies at ordinary towns, allow caller-selected coordinates, or interpret any saved map coordinate as permission to traverse a seal. This is a bounded initial site integration, not a canonical claim that all future Rift anchor work must occur at this one site.

`rift.anchorStatus` reads actual prerequisite evidence: genuinely earned Step I Rift Sense, the original safety restrictions and a **successful Riftglass exterior observation** with its saved boundary sample and original event hashes. A mere high Arcana skill or Rift rank number cannot replace field measurement.

`rift.anchorWork` records genuine bearing, spatial resonance and reference stability, with the choice of focused or integrated physical-spatial approaches. Each component must reach 2/2 integrity from actual checks; integrated work must occur. A real exceptional result can complete the reference promptly, without compulsory tutors, tuition, a minimum number of days or age/rank gates. Each 15–480-minute attempt consumes existing Stamina, uses the real spatial environment's risk for the engine's Arcana/Intelligence DC, and can inflict actual shear-related wounds and accumulated spatial strain. A successful outcome installs exactly one exterior anchor with its genuine observation reference, individual integrity and source digest, and sets earned Step II. The safe exterior reference reveals no protected vault plans.

**Usable, earned ability:** `rift.orient` spends 1 real Stamina and 10 minutes on a new engine-owned check at the genuinely marked site. A successful orientation stores a **one-use 60-minute local bearing**, tied to its original earned anchor and the exact current independently simulated boundary snapshot. The next `rift.sense` at that same unchanged site may consume the bearing for a **+2 orientation modifier on the original Rift Sense check**, without changing its energy/time cost, access rights or player-known-only observation. The bonus is lost after use, expiry, departure, changed boundary conditions or invalid saved history. This is preparation and better stability assessment, **not** a playable Fold Step or blanket immunity to involuntary displacement.

`tests/rift-anchor-marking.test.js` starts with actual individual early Rift training and first-stage field sensing, then exercises complete Step II structural work, danger, true resource/time costs, forged record rejection, public status, actual oriented Rift Sense and private turn-ID replay. No active campaign save is touched.

**Not implemented here:** Rift III Fold Step, spatial boundary-weaving, Pocket Architecture, Rift Adaptation, Realm Walking, Boundary Domain, and a general displacement resolver that can actually apply an anchor as a rescue counter. Those require separate precise position, line-of-effect, source permissions, energy, hazards and counters. Future genuine locations can receive legitimate measured anchor definitions when their physical sources exist.

## Distinct future advanced work — NOT implemented by this milestone

| Independent discipline | Source-defined higher path | Next evidence-backed engineering slice |
|---|---|---|
| **Meridian** | V Meridian Web Integration; VI Living Intent; VII Physique–Meridian Integration; VIII Living Domain; IX Transcendent Constitution | Verified Primary/Extraordinary/Branch web integration and one real bounded Stage IV projection or reinforcement use before any Stage V+ grant |
| **Arcane** | III Matrix Formation (this PR); IV Dynamic Architecture; V Field Projection; VI Living Lattice; VII Astral Architecture; VIII Law Interpretation; IX World Circuit | Next: source-backed compound spell formula and use of the earned III matrix, then independently built dynamic IV geometry |
| **Soul** | II Soul Threading (this PR) through VII Living Soul Architecture | Next: real resonance lattice and consent-bound spiritual applications, without mindreading or resurrection |
| **Body** | III Organ (this PR); IV Nerve-Sense; V Blood-Essence; VI Adaptive Physique; VII Evolved Physique | Next: authentic Nerve-Sense organ-link work and situational uses of earned organs, without assuming fixed ordering across every school |
| **Rift** | II Anchor Marking (this PR); III Fold Step through VIII Boundary Domain | Next: actual measured line-of-effect and voluntary short displacement after genuine anchors, with counters and the first displacement-safety resolver |
| **Beast-Origin** | Mapping through Personal Evolution (eight source procedures) | Individual sourced trait, anatomy/consent, compatibility and rejection before any acquired biological organ |
| **Human evolution** | Awakened, Refined, Transformed, Ascendant, Transcendent, Higher Evolved | Separate earned biological transformation evidence — never a stage automatically inherited from a discipline |
| **Human–beast Sync** | Ten reciprocal stages | Individual partner choice, trust, understanding and authentic shared work, never unilateral power transfer |

The three *additional* middle development milestones requested by the player remain individual systems' intermediate achievements, not new numbered canonical Circles/Gates/Cycles. See `docs/LIFELONG_MASTERY_AND_MIDDLE_STAGES.md`.

## Verification and limits

`tests/meridian-stage-four-sea.test.js` exercises earlier anatomy records, an actually rolled 108th Gate, source-consistent Stage IV work, resource accounting, structural capacity without free learned effects, bad inputs, save persistence and stable private turn replay. The complete regression suite must pass before merge.

**Not yet complete:** exact Stage IV Sea-ring growth beyond the first ring; playable projection, recovery, pressure counters, high-stage NPC practitioners, Stage V–IX meridian work, greater Arcane Circles, Soul/Body/Rift/Origin higher architecture or real human constitutional evolution. The `build` calculators are structural references, not authority to grant skills or ranks.
