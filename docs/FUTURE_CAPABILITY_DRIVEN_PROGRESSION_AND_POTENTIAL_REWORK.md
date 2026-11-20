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

## 8. Implementation order AFTER #177 — staged, source-compatible rework

0. **Do NOT merge this planning file into #188** or modify current character source logic before #177 acceptance.
1. Audit every existing power/potential/constitution/progression owner and special-case inherited source; create a source-to-feature matrix, baseline fixtures for PC and NPC, compatibility and rollback plan.
2. Ratify grouped potential schema, correlation, deterministic seeded source, rarity and derivation rules with exact treatment of Rift and species/nonhuman differences.
3. Add **versioned migration** from actual immutable v1 `capabilityProfile.potential` and private NPC `mechanicalFoundation.unassessedPotential`: preserve old scores and all assessment history; do **not** secretly regenerate or "repair" existing people to fit new groups. For legacy people derive a **non-destructive inferred group summary** and maintain truthful existing subpotentials, or use an explicit approved new-generation-only schema. Define which approach is used before shipping.
4. Implement original potential effects on **existing source owners**, one system at a time, with explicit independent exercise of real capability and no mandatory calendar/sessions. Recheck special environmental, materials and beast-consent prerequisites.
5. Implement original constitution/lineage/inheritance sources, mutations, tradeoffs and unique learned techniques with source seals, traceable lineages, rarity distribution, explicit learning/activation and risk, NPC autonomy and GM privacy.
6. Regenerate **only newly created characters** under the new grouping algorithm; exercise prodigies, ordinary individuals, low-potential success, incompatible inheritance, unusual non-tamers, unusually young advanced characters, extraordinary NPCs and beasts.
7. Full original and new regression: no invented roll/time/technique/advancement, no save corruption, no universal rank ladder, stable real previous characters, coherent mechanics across PC and NPC, performance at world scale. Keep new rework in its own PR and accept only after #177.

## 9. Acceptance tests to write for this proposed rework

- Individual attributes correlate within groups but permit specialisation; all fourteen present keys remain valid or explicitly/versioned migrated.
- Repeated seeded generation is deterministic; integrity seals and privacy survive save/import/export.
- Rare legitimate constitutions may deliberately override typical correlations **with witnessed coherent physics**, not arbitrary nonsense.
- Highly gifted, well-supported characters can attain high stages quickly **without calendar gating**, provided every specific earned requirement is genuinely met; lower-potential individuals remain capable through other difficult routes.
- Potentials affect actual comprehension/efficiency/architecture/precision/innovation/biological response, not just d20 modifiers, without unlimited compounding.
- Bloodline owners do not automatically master inherited techniques; limitations have meaningful reciprocal effects and counters.
- No forged off-screen NPC ability or player presence; individual witnesses, resources, actual Combat conditions and consent are honored.
- Existing campaign characters, facts and previous outcomes remain unchanged unless user explicitly approves migration.

**Deferred by user instruction. Return now to Unified Living Character #177 / PR #188.**
