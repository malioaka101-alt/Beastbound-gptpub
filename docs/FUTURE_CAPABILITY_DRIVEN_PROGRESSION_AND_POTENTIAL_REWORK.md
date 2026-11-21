# Future plan — capability-driven progression, grouped potential and original constitutions

**Status:** SAVED DESIGN BACKLOG, **NOT IMPLEMENTED**.  
**Priority / dependency:** resume **only after** Unified Living Character System issue #177 / draft PR #188 is source-integrated, regression-tested and accepted. This document makes **no change** to current power mechanics, rules authority, save data, character generation, NPC progression, time, or existing play.  
**Date captured:** 20 November 2026.  
**Authority:** the Beastbound Master Prompt and actual separate original source owners prevail until this proposed rework is explicitly approved and implemented. The user’s subsequent clarification to the lifetime wording is captured below.

## 1. Core vision — a lifelong pursuit is not a lifetime time gate

- **Life-encompassing, not time-locked:** cultivation, beast development, martial study and supernatural disciplines become profoundly ingrained in individual work, identity, rivalries, family life, choices, profession and history. They can be lifelong endeavours because people keep practising and exploring, **not** because a rigid age, time-in-stage, number-of-days, session-count or decades-long threshold is mandatory.
- **Ability, not elapsed time, governs advancement:** a practitioner progresses only when they actually **demonstrate, build and sustain** the requisite structural, technical, mental, biological, social (where relevant), and energetic capabilities. Once the genuine requirements are met, an exceptionally competent person may advance rapidly or even complete a high-stage requirement in one exceptional *genuine* attempt. Others may take years, pursue side routes or never reach it.
- **True extreme prodigies:** high potential, resources, sound training, prior experience, personal insight, inherited constitutions and family/clan support may compound dramatically, including advanced stages at unusually young ages. Youth neither guarantees nor prohibits power.
- **Challenge remains real:** no rank or spell by declaration, no guaranteed breakthrough, no free wound recovery, no automatic new technique, no unlimited mana, no forced beast partnership, no shortcut around physical capacity or original environmental/material evidence.
- **No universal progression ladder:** Meridian, Arcane, Soul, Body, Rift, Beast-Origin, beast species/evolution, human evolution, willing bond synchronisation, technique mastery and specialist crafts each keep **distinct** physics, requirements, meaningful consequences and validation. This is not a shared "XP to next level" rule.
- **No arbitrary potential ceilings:** lower potential can slow, complicate or change routes without mathematically blocking any legally attainable stage solely due to a random aptitude rating. Unusual discoveries and methods remain possible.

## 2. Separate innate potential, inheritance/constitution and earned capability

Do **not** conflate:
1. **Potential:** correlated innate aptitude and developmental response, including comprehension, efficiency, precision, structural affinity, adaptation, genuine breakthrough aptitude and compatibility.
2. **Constitution / bloodline / inherited technique:** actual physical, energetic, spiritual or origin-pattern structure and separately sourced hereditary, rare, naturally occurring or acquired features, vulnerabilities and exchange conditions. Inheriting a technique is not acquiring its mastery.
3. **Developed capability:** what the individual has really learned, demonstrated, survived, constructed, stabilised, combined and can currently perform, with resource costs, contextual limitations and credible eyewitness/source evidence.
4. **Opportunity and support:** family knowledge, resources, heritage archives, teachers (optional), access to real sites, laboratory tools, time to practise, safety, social standing, opportunities and cultural conditions.

High potential can strongly increase the speed/quality of *real* development; it is not a permission slip for unearned skill. High inherited power without understanding may be difficult or dangerous. Great developed mastery can exceed mediocre inherited advantage.

## 3. Replace independent latent draws with correlated potential GROUPS

Current implementation: `rules/character.js` and `rules/potential-mechanics.js` have fourteen **independently** seeded 1–9 dimensions, currently bounded to modest bonuses, while independently generated NPCs possess corresponding GM-private potential. That can yield incoherent extremes if new fine-grained efficiency/control/perception attributes are added.

**Design proposal:** deterministic, replayable, seeded hierarchical generation: first sample broad domain groups, then derive correlated subpotentials, then apply separately sourced constitutions / inheritance / rare anomalies. Do not create 25 unrelated random attributes or mechanically unusable "prodigies" by default.

### Proposed six core groups and existing 14-key mapping

| Group (tentative title) | Actual current keys (preserve them) | Future associated derived aptitudes |
|---|---|---|
| Meridian Potential | `meridianBreadth`, `gateStability` | circulation efficiency, route precision, pressure tolerance, anatomical stability |
| Arcane Potential | `manaCoreArchitecture`, `elementalAffinity` | mana efficiency, Circle geometry insight, precision, formula stability, casting adaptability |
| Soul Potential | `soulDepth`, `soulResilience` | inner identity control, interference resistance, self-resonance stability |
| Physique & Evolution Potential | `physicalAdaptation`, `evolutionaryPlasticity`, `traitIntegration` | injury adaptation, biological efficiency, mutation tolerance and integrated physique |
| Bloodline & Beast Potential | `bloodlineExpression`, `lineageCompatibility`, `synchronisation` | inherited compatibility, species trait integration and bilateral coordination aptitude |
| Comprehension & Mastery Potential | `comprehension`, `techniqueCreativity` | understanding, technical innovation, rate of insight, precision of learned applications |

**Rift needs distinct recognition:** it currently uses `evolutionaryPlasticity` and `comprehension` in the actual code, but Rift Sense, Anchor Marking and spatial stability are not interchangeable with evolution. In this rework specify an explicitly *cross-group* Rift aptitude (Comprehension + appropriate physical/spiritual/perceptual compatibility + independently measured exposure), OR a genuinely justified specialist Rift group; do **not** silently erase or reroll existing Rift eligibility. Likewise test whether beast-origin, specialist professions or unusual non-human species need clearly documented specialist subprofiles without a universal rank ladder.

**Controlled local variation:** ordinary subpotentials typically vary by about ±1 on the 1–9 scale around the group; rare ±2+ variance can represent meaningful specialisation, but dramatic contradictory outcomes require a real constitution/bloodline/biological anomaly, not uncontrolled unrelated dice. The numeric examples are illustrative, **not fixed implementation values**.

**Group-level specialisation:** high Arcane + high Comprehension supports exceptional formula architecture; Meridian + Comprehension supports technique innovation; Soul + Comprehension supports controlled inner resonance; Physique + Beast supports safer beast DNA adaptation; Beast + relevant combat discipline supports meaningful (consensual) synchronised combat; bloodline ability + comprehension + compatible constitution supports control of inherited techniques. Different groups may be high or low independently: a great mage need not be a great Meridian practitioner.

**Generation requirements:** deterministic seeded, verifiable origin; defined distributions, inheritance correlation, bounds and rarity; identical saved data yield identical outcomes regardless of how often read; no extra random draws to display or inspect; prevent rerolls and arbitrary chosen powers; respect GM-only knowledge of unknown NPC latent groups and potential. Not every group must be strong, no forced symmetrical characters.

## 4. Potential must affect the WHOLE process, not only a +2 check

For each original power source, design how potential affects **earned** outcomes:
- *Comprehension:* quality of insight, conceptual problem-solving, ability to design or recognise valid structures/formulae, response to novel knowledge.
- *Resource/effort efficiency:* honest reduction in Mana, Qi, Soul reserve, fatigue, wasted catalysts and trial cost where physically justified; never below grounded minimum or free power.
- *Structural aptitude:* stability, defect rate, pattern integrity, architecture formation, resistance to deviation.
- *Precision/control:* complexity actually sustainable, interference control, safe simultaneous patterns, reliable technique quality.
- *Physical/spiritual adaptation:* biological rejection, wound risk, burden, strain, recovery *only where original medicine permits*, soul identity preservation.
- *Breakthrough aptitude:* concrete ability to complete authentic requirements earlier and respond to real checks; no fixed training-day lock, guaranteed outcome or ability by age.
- *Inherited compatibility:* synergy or conflict with distinct bloodline/constitution and real environmental conditions.

Avoid a flat stack of universally additive bonuses or one "prodigy" stat. Define meaningful non-linear synergy and realistic tradeoffs, but test for runaway chains, invincible elites, impossible low-potential characters or mathematically broken hybrids. Actual difficult demonstrable tasks remain the test.

## 5. Rare constitutions, bloodline families and inherited techniques (ORIGINAL Beastbound creations)

Inspiration for the **design categories** comes from exceptional perception/efficiency, severe constitutional exchanges and inherited unique techniques; **do not import copyrighted fictional powers**, simply use distinct original Beastbound anatomy, physics, names, costs and social consequences.

Develop a **large original taxonomy**, not just four sample traits:
- natural anatomical constitutions, hereditary bloodlines, acquired/personal transformations, restrictions and compensating advantages, awakened traits, beast-derived physiology, rare mutations, clan-preserved technique libraries and separately earned specialist techniques;
- documented inheritance probabilities, lineages, activation/personal discovery conditions, compatibility, distinct risks, counters, training methods, actual measurable effects and inheritance gaps;
- clan resources may profoundly amplify exceptional individuals, but weak descendants and extraordinarily capable outsiders remain possible;
- inherited ownership of a technique ≠ being able to use its most advanced application; high group aptitude and genuine learned mastery matter;
- lawful human/beast origin rights, voluntary consent and conservation of actual biological materials remain mandatory.

**Original candidate seeds, not yet canonical abilities:**
1. **Thousand-Current Meridian Constitution:** multiple distinct concurrent Qi routes; rapid structural understanding possible but interference, pressure and organ load can be catastrophic.
2. **Prismatic Core Inheritance:** hereditary separated/recombined Mana patterns and unusually precise formula decomposition; requires sufficient comprehension and compatible true Circle geometry.
3. **Silent Furnace Physique:** severe restriction on standard Mana/Qi channels in exchange for extraordinary tissue adaptation and strain conversion; not an automatic combat victory.
4. **Sovereign Soul Weave:** unusual capacity for independently bounded self-resonance structures with identity collapse/interference risks.

Create many other original constitutions, mutations and family powers before calling this catalogue complete. Treat rare "prodigy" combinations as lore-significant and mechanically possible without requiring or guaranteeing a special heritage.

## 6. Each source system's competence-based advancement

- **Meridian:** true anatomical circulation, 108 individual Gate integrity/quality, physical tolerance, Dantian sea, living web, intent, physique, domain and constitution; high potential can legitimately accelerate *real* gates, but never auto-opens them or erases damaged physiology.
- **Arcane:** actual Mana Core, distinct Circles, geometry, channel stability, architecture, learned formulae, load and spell complexity. Efficient inherited architect can build high Circles early if truly capable; no free spell grants.
- **Soul:** personally stabilised mind/body/resonance threads, Lattice and higher structures, genuine identity boundaries, interference costs, ethical consent. No mind-reading or soul binding simply from stage.
- **Body:** measured tissue, organ, neural and biological transformations with real functional strength/recovery, wounds, strain and trade-offs; not just a Qi-style track.
- **Rift:** measured original spatial witnesses, actual stable anchors, controlled folds and boundary effects; high insight cannot invent spatial measurements or secret routes.
- **Beast-Origin:** source rights, DNA/Origin Pattern compatibility, real trait seeding, rejection, stabilisation, adaptation and personal human evolution; potential influences actual biology but doesn't copy a beast's ability for free.
- **Beast species/evolution:** individually source-defined forms/conditions and the beast's own potential, energy, habitat, physiology, consent where relevant, learned technique and real advancement, not a generic XP bar.
- **Partnership:** two **independent** beings, their relationship, trust, demonstrated coordination and mutual consent. Exceptional compatibility can enable rapid genuine synchronisation but cannot force a partnership.
- **Technique and specialist mastery:** difficulty determined by actual ability to execute, resource costs, proof, refinement, repetition where useful and contextual opportunity; no compulsory tutor or minimum year count.
- **Human evolution:** separate permanent Origin Pattern transition, never an automatic side effect of any discipline stage.

## 7. Social, demographic and living-world consequences

- Ordinary, highly trained and extraordinary people coexist without predetermined age brackets; a rare teenager may legitimately be powerful if they have actually developed those capabilities.
- Families, schools, guilds, clans, employers, armies, states, criminal groups and independent NPC peers react to **verified deeds and demonstrated capacity**, not simply age or a public title. Access/resources enable different development paths.
- Cultivation may be lifelong because it influences profession, family identity, pressure to improve, relationships, competition and civic obligation; it need not take a lifetime to get "advanced".
- All NPCs follow the same **system-specific original mechanics** and private evidence requirements; no PC-only perks, fake off-screen power, or fabricated historical breakthroughs.

## 8. Combat rework assessment and likely redesign (new user-directed future scope)

**User addition:** The potential/progression overhaul may also require the combat system to be reworked. Treat combat as a **first-class part of the future design**, not a balancing afterthought. The exact scale of replacement will be determined by a source-owner audit and prototype; do **not** prematurely discard the present combat engine.

**Why:** capability-driven rapid progression, vastly stronger potential synergies, rare constitutions, clan techniques and extraordinary beast/human physiology will only be credible if *fighting* reflects actual mastery, specialised control and power differences. A high-stage prodigy should not merely receive a larger flat attack bonus; neither should a uniquely trained weaker fighter be automatically worthless. Avoid turning combat into purely numerical advantage or a scripted guaranteed victory.

### Combat pillars to audit and redesign where necessary

1. **Demonstrated combat skill vs innate talent:** potential changes how a person *learns, perceives, adapts, executes and sustains* combat techniques; actual trained technique, decision-making, real experience, position and ability decide their current repertoire and fighting effectiveness. Inherited power alone does not teach combat judgement.
2. **Meaningful power disparity and plausible interaction:** high-stage practitioners, specialised beasts and apex constitutions can have genuinely extraordinary force, range, speed, resilience, control and environmental effects. Account for overwhelming mismatches without a simplistic level-based auto-win. Tactical counters, favourable conditions and genuine specialised expertise can remain relevant if the original physics permit.
3. **Distinct martial styles and systems:** Meridian Qi reinforcement/bursts, Arcane geometry and cast load, Soul stability and identity resistance, Body tissue and sensory adaptation, Rift measured local geometry, Beast-Origin traits and beast-specific bodies require different action/counter/cost rules. Do not flatten them into universal ranks, one damage curve or arbitrary cross-system equivalence.
4. **Technique sophistication, timing and control:** incorporate genuine preparation, interruption, reaction, perception, prediction, simultaneous technique handling, feints, spacing, line of effect, obstacles, environmental context, tactical intent, and the ability to execute a technique under pressure. Strong comprehension may allow quicker adaptation but not unearned knowledge or future sight.
5. **Explicit resource conservation:** Qi, Mana, Soul reserve, Stamina, physical strain, wounds, tissue injury and spatial instability must pay their actual costs. Efficiency inheritances can be exceptionally strong but their limits, overload conditions, drawbacks and failure consequences must be defined. No infinite attacks, instant recovery, or extra actions from a title.
6. **Constitutions and inherited techniques:** original rare features should fundamentally change combat possibilities and tradeoffs—e.g., pattern perception, multiple energy flows, tissue-reinforcement exchange, strain tolerance or unusual counters—not just +N damage. Inherited compatibility, training and genuine ability determine usable applications; equivalent families need not fight alike.
7. **Human–beast equivalence and partnership:** beast dimensions, species organs, evolution paths, intelligence, senses and genuine biological attributes count. Humans must have plausible ways to interact with dangerous beasts without erasing beast threat. True paired coordination, combined techniques and voluntary consent matter; non-tamers retain meaningful independent routes. No automatic commanded cooperation.
8. **Defense, injuries and stakes:** retain source-owned wound boxes, defense, toughness, fatigue and serious consequences unless a **versioned, explicitly approved** replacement is shown more coherent. Resolve attack penetration, protection, avoidance, partial defenses, resistance, fatigue, incapacitation and recovery without free heals, invulnerable characters or implausible one-hit outcomes for peers.
9. **NPC intelligence and independent fighting:** combat choices need coherent personality, experience, profession, objectives, morale, self-preservation, willingness to retreat and situational knowledge. No omniscience, hidden GM exploitation, scripted player losses or superior enemy dice; same source-verifiable physical rules for PCs, NPCs and beasts, with fair asymmetries of anatomy and training.
10. **Scale and performance:** individual duels, multi-party beast fights, tournaments, squad actions and exceptional high-stage conflicts should remain legible and mechanically resolvable without a prohibitive turn count or a host of nearly identical repetitive checks. Clear narration should accurately explain why moves succeed or fail.
11. **Fair competition and world consequences:** military doctrine, guild rankings, arena structures, training schools, rare-family politics and realistic public recognition must reflect genuine demonstrated combat capability; an early-advanced prodigy cannot automatically inherit impeccable battlecraft.

### Suggested future combat evaluation process (after #177)

- Map all current canonical combat owners and interactions, including `rules/combat.js`, power-specific technique owners, body/physiology bonuses, player equipment, NPC Combat records, beast actions, arena rules and injury/recovery. Identify which mechanics *actually* need redesign versus safe adaptation.
- Produce an explicit combat model and sample transcripts before code changes: an ordinary novice vs trained peer, a true high-stage prodigy vs several weaker enemies, a constitution-limited powerhouse, a technique specialist exploiting an authentic counter, an independently fighting beast and a freely cooperating human–beast team.
- Test power gaps, speed/precision, multiple simultaneous effects, defenses and skill depth across all individual power systems. Use genuine resources, wounds, line-of-effect, witnesses and historical mastery; test rare inheritances and no-special-heritage experts alike.
- Protect existing saves and source seals through versioned migration / separate combat implementation PRs. Record old semantics in baseline tests, never silently reinterpret historical damage or learned abilities.
- Run source-verification, replay/forgery, balance, AI decision quality, interoperability, scaling and full consolidated regression before accepting any combat replacement.

**Decision status:** Combat redesign is **in scope for future investigation and likely modification**, but *exact replacement rules, damage formulae, initiative systems and balance constants are not yet approved*. Design these alongside grouped potential, progression and inheritances rather than independently.

## 9. Implementation order AFTER #177 — staged, source-compatible rework

0. **Do NOT merge this planning file into #188** or modify current character source logic before #177 acceptance.
1. Audit every existing power/potential/constitution/progression/**combat** owner and special-case inherited source; create a source-to-feature matrix, baseline fixtures for PC and NPC, compatibility and rollback plan.
2. Ratify grouped potential schema, correlation, deterministic seeded source, rarity and derivation rules with exact treatment of Rift and species/nonhuman differences.
3. Add **versioned migration** from actual immutable v1 `capabilityProfile.potential` and private NPC `mechanicalFoundation.unassessedPotential`: preserve old scores and all assessment history; do **not** secretly regenerate or "repair" existing people to fit new groups. For legacy people derive a **non-destructive inferred group summary** and maintain truthful existing subpotentials, or use an explicit approved new-generation-only schema. Define which approach is used before shipping.
4. Implement original potential effects on **existing source owners**, one system at a time, with explicit independent exercise of real capability and no mandatory calendar/sessions. Recheck special environmental, materials and beast-consent prerequisites.
5. Implement original constitution/lineage/inheritance sources, mutations, tradeoffs and unique learned techniques with source seals, traceable lineages, rarity distribution, explicit learning/activation and risk, NPC autonomy and GM privacy.
6. Prototype combat-system integration and its required revisions against the new power disparities, potential effects, rare constitutions, NPC choices and original wound/resource laws. Keep source owners and migration strategy explicit; preserve existing combat until a replacement passes acceptance.
7. Regenerate **only newly created characters** under the new grouping algorithm; exercise prodigies, ordinary individuals, low-potential success, incompatible inheritance, unusual non-tamers, unusually young advanced characters, extraordinary NPCs and beasts.
8. Full original and new regression: no invented roll/time/technique/advancement, no save corruption, no universal rank ladder, stable real previous characters, coherent mechanics across PC and NPC, performance at world scale. Keep new rework in its own PR and accept only after #177.

## 10. Acceptance tests to write for this proposed rework

- Individual attributes correlate within groups but permit specialisation; all fourteen present keys remain valid or explicitly/versioned migrated.
- Repeated seeded generation is deterministic; integrity seals and privacy survive save/import/export.
- Rare legitimate constitutions may deliberately override typical correlations **with witnessed coherent physics**, not arbitrary nonsense.
- Highly gifted, well-supported characters can attain high stages quickly **without calendar gating**, provided every specific earned requirement is genuinely met; lower-potential individuals remain capable through other difficult routes.
- Potentials affect actual comprehension/efficiency/architecture/precision/innovation/biological response, not just d20 modifiers, without unlimited compounding.
- Bloodline owners do not automatically master inherited techniques; limitations have meaningful reciprocal effects and counters.
- No forged off-screen NPC ability or player presence; individual witnesses, resources, actual Combat conditions and consent are honored.
- Combat in asymmetric prodigy, average, high-stage, non-tamer and human–beast fights exhibits real capability differences, grounded counters, original resource/wound consequences and no universal auto-wins. NPC combat decisions remain independently source-honest and historically compatible.
- Existing campaign characters, facts and previous outcomes remain unchanged unless user explicitly approves migration.

## 11. Existing intermediate milestones and nine mastery degrees — deferred integration and redesign (21 November 2026)

**Explicit user scope decision:** Integrate and revise these existing systems as part of **future rework #189**, NOT the current Unified Living Character #177 / PR #188. Do not extend #177's acceptance requirements to include all mastery degrees or bridge milestones. Preserve the original implementation until the rework is approved and separately undertaken.

### Existing source baseline (not new proposals)
- `docs/LIFELONG_MASTERY_AND_MIDDLE_STAGES.md` (7 November 2026), `rules/mastery-lifepath.js`, `tests/lifelong-mastery.test.js` and the original rankings practice/bridge/detail routes retain nine within-stage mastery degrees: Awareness, Reliable basics, Repeatability, Applied fluency, Stabilised practice, Adaptation, Integrated control, Independent innovation, Peak mastery. Current nominal 90 earned points per degree, escalating challenge, demonstrated successful method diversity, exceptional x2/x3 aptitude factors, distinct bridge trial; **not elapsed-time/age/sessions gates**.
- Three distinct middle milestones per original ladder, with canonical major stages unchanged:
  - Meridian (after III/V/VII): Gate-Weave Consolidation, Living Circulation Synthesis, Constitutional Resonance.
  - Arcane (III/V/VII): Circle-Lattice Stabilisation, Field-Matrix Coherence, Astral Circuit Synthesis.
  - Soul (II/IV/V): Spirit-Thread Tempering, Inner Pattern Consolidation, Sanctuary Resonance Integration.
  - Body (II/IV/V): Marrow-Tissue Harmonisation, Sense-Organ Integration, Blood-Essence Consolidation.
  - Rift (III/V/VI): Anchored Fold Stabilisation, Boundary-Space Integration, Realm-Pressure Harmonisation.
  - Origin (II/IV/VI): Lineage Acceptance Trials, Trait-Pattern Consolidation, Ancestral Expression Synthesis.
  - Human evolution (II/IV/V): Awakened Constitution Stabilisation, Transformed Form Integration, Ascendant Adaptation Synthesis.
  - Pair Sync (III/VI/VIII): Reciprocal Pattern Alignment, Paired Manifestation Refinement, Shared Evolution Readiness.
  - Specialist (II/IV/V): School Technique Integration, Independent Method Synthesis, Original Discipline Architecture.
  - General professional ranks (1/3/4): Independent Foundations, Applied Judgement, Integrated Masterwork.
  - Preserve distinct beast individual development studies and material quality verification milestones (not automatic Grade, Level, evolution or magical upgrades).
- **Known integration gap at current audit:** `mastery-lifepath.js:stage` only qualifies supernatural paths at original first-stage milestones. The original advanced discipline owners have since grown, but are not uniformly connected to advanced mastery eligibility. Mastery practice and records are still primarily player-owned (`s.player`, `s.table.lifelongMastery`); NPC daily progression and dossiers do not yet execute these degrees or bridges. A listed milestone is not an actually earned advancement.

### Rework deliverables
1. Audit original major-stage source prerequisites and all nine internal mastery degrees plus every interstitial milestone. Preserve the separate identities, earned history and canonical numbering of each path; do not turn unique disciplines into an interchangeable XP ladder.
2. Integrate mastery eligibility with authenticated **actual** advanced-stage source owners for PCs, NPCs and applicable independent beasts/pairs/specialists. Move to actor-specific records and real relevant ability/application evidence, private independent decisions and skill. No rerolls, imaginary advanced ranks, or compulsory partnership.
3. Rework the current 90-point/depth and ×1–3 learning rules together with grouped potential, constitutions, rare inherited techniques, actual insight, opportunity and performance. Exact new requirements remain to be designed. Let authentic exceptional capability advance rapidly; no calendar, minimum age or session quota. Preserve meaningful mastery breadth without forcing repetitive grind.
4. Give each degree and bridge a mechanically meaningful, source-specific distinction in proficiency, control, efficiency, technique, integration and applicable combat or professional performance. Decide in the redesign which bridge is a separate achievement versus prerequisite; do not silently impose new compulsory rank gates on old saves. Major stage, internal mastery, individual grade, power output and learned arts remain distinct. Mastery alone cannot grant an unearned new major stage, beast evolution or technique.
5. Verify PC/NPC parity, individual variation at the same major rank, genuinely earned bridge advancement, extraordinary aptitude and lower-potential success paths, actual combat interactions, two-party consent, save migration without rerolling, performance, private knowledge and full regression. Preserve all existing earned records and clearly version any change to their meaning.

**Ordering:** Include this audit in §9 step 1 and the implementation alongside steps 4–6; finish before accepting the future rework. No change to current mastery or #177 mechanics is authorised by this planning addition.

**Deferred by user instruction. Return now to Unified Living Character #177 / PR #188.**
