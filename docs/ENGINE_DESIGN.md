# Beastbound executable rules and architecture

**Scope:** v0.1 executable rules and extension contracts, subordinate to the Unified Master Prompt. This file is not an alternate world canon.

## 1. Core architecture

`engine.js` exports pure data definitions and state-transforming functions. The top-level save object contains a schema version, RNG seed/state, world clock, world indicators, player, individual beasts, quest ledger, encounter and combat objects, event log and flags. Every action takes the current state, validates prerequisites, determines results and records consequences. `bridge.js` persists the JSON after each action. Offline `index.html` uses the same simulation kernel as a direct script, so browser and command-line play have the same rules.

The deterministic xorshift32 random number generator stores its state in each save. Dice checks record the underlying d20 roll, attribute modifier, proficiency rank, context modifier, total, DC, margin and degree. Replaying the same sequence with the same seed yields the same state.

**General action check:** `d20 + floor((attribute - 10)/2) + trained skill rank + explicitly supplied context modifier`, compared to a documented difficulty. Discipline and technique modifiers may be added through the context modifier **only where explicit conditions warrant** them. Outcome margins: +10 exceptional, +5 strong, >=0 success, -1 to -4 setback, -5 to -9 failure, <=-10 severe failure. The prototype does not treat natural 20 as an exception to impossibility.

## 2. Meridian anatomy and the gates

The full canonical anatomy is 12 primary channels, 8 extraordinary channels, 36 major branches, 72 minor networks, 108 distinct gates and 3 Dantian centres. State stores the nine named Meridian developmental stages, actual gate records and quality, foundation/awareness progress, stability and reservoir progress. Foundations must be tempered, 12 primaries consciously awakened and gate practice completed before gates open. Every successful gate is saved as `{number, quality, scarred}`; forced failures reduce stability/health. The three gate bands are 1-36 lower, 37-72 middle and 73-108 high. Dantian Sea Formation is a distinct stage after completing the 108 gates in this early ruleset.

*Limit:* anatomical pathways of all 108 gates are not yet individually authored, and specialised techniques for high stages still need expansion. The current gate-opening model supplies an actual numerical structure and risk, not just a decorative `47/108` display.

## 3. Other human disciplines

- **Arcane Circle Architecture:** 0-9 Circles, individual core stability, geometry and insight. Training at Lumenfall Annex costs 90 minutes/stamina, makes a d20 intellectual skill check and constructs a Circle only at the required insight and stability threshold. The First Circle is required for spellcasting. Constructing a Circle does **not** open a Meridian Gate.
- **Soul disciplines:** track one of seven named phases after uninitiated; training at Lumenfall uses its own insight and stability.
- **Body Refinement:** seven tissue-wide cycles trained in sequence; finishing a cycle increases potential biological durability, not Arcane Circle number.
- **Rift practice:** requires site exposure and measured study; stages use distinct research insight.
- **Beast-Origin:** an eight-stage explicit sequence (mapping, testing, seeding, rejection window, stabilisation, expression, adaptation, personal evolution). Requires documented ethical material, clinical location, load capacity and rejection monitoring; a failed check can cause strain without immediate progression.
- **Human evolution:** separate physiological state, stage, stability and acquired traits. The prototype supports two clinical transitions with real prerequisites and materials. No automatic evolution occurs simply because a rank changes.

## 4. Beasts and ecology

An individual creature record is distinct from its species definition. Specimen record tracks species key, age, mood, health, energy, trust, respect, communication, coordination, compatibility, potential dimensions, grade, level, lineage, evolution, needs, injuries, techniques, relationship, consent, history and habitat exposure. The authored bestiary contains ten starter forms with niches and environmental distributions. Spawns use each location's biome-valid species list, not random global draws.

`proceduralSpecies(key)` produces a **provisional deterministic taxonomy hypothesis**, not an instantly complete invented animal. Lineage-appropriate habitat, diet, niche and affinities remain constrained, and new entries must be researched/approved before becoming playable species. A complete on-demand bestiary would require evolution branches, organs, behaviours, population maps, scientific records and more than this MVP.

## 5. Partnership and beast evolution

Wild encounters have separate approaches: observe, offer food, approach, leave, or confront. Raising trust does not automatically create consent, and the contract offer checks respect, trust, intelligence-specific communication and a negotiation roll. The first established partnership has *Basic Coordination* only if chosen as a pre-existing relationship; newly formed partnerships start with no synchronisation stage. Shared training raises **both** companions' development and measures trust, communication, energy resonance, technical coordination and willingness. The ten synchronisation phases remain separate from all cultivation ranks.

Evolution requires an actual authored branch, species level, trust, consent, acceptable fatigue, the specific regional habitat, an exact consumable material and an uncertain stability check. Evolution changes organs/ability category as represented by the new species form and does not merely add a number.

## 6. Combat

Combat enters from an actual beast encounter. Every round records a terrain type, range band, guard/defence, player stamina/energy cost, dice roll, damage and enemy response. Actions include attack, defend, de-escalate, retreat, Qi strike and Arcane spark. An allied creature **chooses** to assist only if a current willing partner with energy and manageable fatigue is available. A seriously wounded wild beast may flee. Player defeat creates rescue costs, time loss and injury, not an automatic game-over. This is an initial tactical kernel, not yet a full grid/formation battle engine; ability resistances, initiative, spatial cover and arena law need further authored content.

## 7. World, economy and institutions

Time advances on travel, training, foraging, meetings, rest, contests and encounters. Each new day adjusts the market index, wetlands pressure, character recovery and deadline checks. Periodically the March Council, reed-clan negotiations and Naturalists Guild respond to ecological conditions. NPCs have authored professions, individual demeanour and aspirations; they are not yet autonomous long-term decision trees.

Three starter contracts carry explicit stakeholders, rewards, objectives, deadlines and progress checks. Four competition categories maintain **separate scores**: fieldwork, Meridian precision, Arcane architecture and reciprocal partnership. Exams check eligibility, entry fee, specific skill, difficulty, awards and verifiable qualifications. Competition scores are not absolute combat power ranks.

## 8. Commands and the natural language layer

The offline command parser maps a bounded set of deterministic commands to engine functions. It cannot understand unrestricted roleplay; a ChatGPT-based narrator can *translate* natural phrasing into existing commands and narrate output, but execution must be real and verified to count as the software engine running. Unsupported actions should not be pretended to have been processed by `engine.js`.

## 9. Extension contracts for future builds

To extend the engine without breaking compatibility:

1. Add new species definitions with habitat, niche, trait mechanisms, lineage, individual-grade rules, ability costs, weaknesses, and authored evolution branches.
2. Give each human discipline its own progression thresholds, failure conditions, curricula and high-stage techniques. Never use a single universal level to gate every system.
3. Add new regions as an adjacency graph, biome spawn sets, faction controls, economy links, travel constraints and quest consequences.
4. Add combat objects for positions, line of sight, status durations, resistances, initiative, multi-party AI, retreat/surrender and tournament safety protocols.
5. Introduce migrations, supply chains, NPC schedules, politics, reputation and professional rankings as saved state transitions rather than epilogues.
6. Version the save schema, write explicit migrations, test all new invariants and ensure old save games are not silently rewritten.
7. Keep the player's direct agency and beast consent intact even if the quest writer would prefer a particular plot outcome.
8. Keep UI status windows short in normal conversation. A full detailed status may be requested explicitly.

## 10. Test plan

`node tests/engine.test.js` currently checks deterministic replay, JSON saves, no forced beast, gate/circle independence, training restrictions, guild registration, travel adjacency, encounter/observation consent, partner training, competitions, origin capacity constraints, procedural taxon structure and invalid-save rejection. Next release should add property-based tests for every evolution branch, ecological depletion, more complex combat and faction economies.

## v0.3 additive architecture (4 November 2026)

The executable extension now adds a *seeded family record*, a separate `researchProjects` collection with Grade I–IX research formulae, non-repeatable survey/fieldwork tracking, Research Week costs, a deterministic feasibility classification, independent Proof and replication, `documentedBranches`, independent beast `branchMaturity` and a source-based Maturity rate, one ripening treatment per season, and a form-limited Pattern Echo rite. New `npcKnowledge` stores direct provenance separately from general town lore. `coreHud` and `recap` are generated from authoritative JSON state for chat narration and reproducible resume. A sample hidden Dreamreed Fox branch exercises research + Maturity gating, and is labelled original prototype lore rather than established canon.

**Important:** These algorithms implement only the subset described in `HOUSE_RULES_IMPLEMENTATION.md`. The uploaded compiled additions refer to separate Python files that were not attached; no Python parity or Jory save compatibility is implied. Exact adjudication of real scientific truth, NPC secrecy, divine agency and full town/law/culture remains with the Game Master. Client-side saves are inspectable; secret knowledge needs an authenticated server if players must not see it. JSON `schemaVersion` remains 1 for back-compat with existing v0.2 saves, and import upgrades missing added fields.