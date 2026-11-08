# Beastbound — trial closed, power-system foundation work

**Decision (8 November 2026):** The player explicitly ended the Aerin trial, requested a complete campaign reset and returned the project to foundation development. There is **no active campaign**. The latest tree removes `saves/aerin_marsh.json` and its trial's request/result files. Older commits will of course remain in ordinary Git history; they are not the current checkpoint. Other independent development and disposable verification saves have not been treated as Aerin or overwritten.

## Power-system principles from the original unified Master Prompt

- **Separate measurements:** Meridian *stage* is not Cultivation *skill rank*. Opened Gate count, Gate quality, Qi reserves, Soul phase, Arcane Circle number/geometry, Body refinement cycle, Rift step, Origin Pattern phase/load, human evolutionary stage, beast grade/level and sync stage have different physical meanings. The source explicitly forbids one universal strength ladder.
- **Nine Meridian stages (I–IX):** Foundation Tempering; Meridian Awakening; 108 Gate Opening; Dantian Sea Formation; Meridian Web Integration; Living Intent Embodiment; Physique-Meridian Integration; Living Domain; Transcendent Constitution. Preparatory **stage 0 is NOT Stage I**. The original 108 Gates mark genuine anatomical transitions.
- **Nine Arcane Circles:** Core Ignition, Dual Channeling, Matrix Formation, Dynamic Architecture, Field Projection, Living Lattice, Astral Architecture, Law Interpretation, World Circuit. An unignited starter Mana pool is NOT a Core.
- **Seven Soul phases** and **seven Body cycles** are genuinely independent; the latter are tissue-based. Rift Practice has eight named steps and Origin integration has a separate eight-part evidence/compatibility/trait process. Human evolutionary stage is independent of these.
- **Freedom:** any credible teacher, expert, manual, site, self-directed experiment or independent practice can matter based on actual circumstances. Do not invent compulsory fees, high-rank teaching requirements, fixed calendar waiting gates, automatic teacher consent or universal generic progression from player requests. Real consequences remain sourced and engine-tested; failure cannot be converted into an invented success.

## Implemented in this iteration

1. New **read-only power overview** (`rules/power-overview.js`, operation `power.status`) returns distinct canonical stage labels, skill rank, actual earned training track, source-backed structural progress, named advanced stages not yet implemented, and separate human evolution/Origin. It explicitly distinguishes historical preparatory counts from verified active training and does not falsely promote a legacy Mana reserve into a Mana Core.
2. Added a **Power** view to the existing text-only `panels.js` panel menu. It pulls from the same overview as the engine, not duplicate guessed stage and rank labels. The native ChatGPT panel may style those fields but must keep them exact.
3. Implemented **Body Refinement Cycle II — Bone-Marrow** as an actual second early advancement in `rules/disciplines.js`. A legitimately completed Muscle-Tendon Cycle unlocks the distinct Bone-Marrow/recovery training methods, source-backed training progress and a real d20 breakthrough. Only a success permanently completes Cycle II, raising the current wound model's **Toughness by 1 and Serious wound capacity by 1**. It is *not* a beast level or Meridian stage; no automatic Organs Cycle or speculative further powers are granted.
4. Added independent disposable regression coverage for stage/rank distinctions, no unearned first stage, source-specific Cycle II methods, actual practice stamina/time/roll, non-automatic breakthrough, exact success-only anatomical change, and read-only /panel power.

## Remaining power foundations, in descending usefulness

**A. Mechanical depth in genuine early play.** After Body Cycle II, the next legitimate steps are first-class Cycle III/IV tissue changes (organs and nerves), Soul Threading after verified Soul Perception, Rift Anchor Marking after actual Rift Sense, and honest Arcane Circle III matrix revision after verified two-Circle architecture. Each needs its own anatomy, sources, safeguards, practice and effects—not a generic "+1 rank" loop.

**B. Meridian Stage IV.** The existing engine supports the 108-Gate program up to physical Stage III. Dantian Sea Formation needs a real post-Gate physiology record with density, purity, capacity, recovery, pressure and failure handling, and structural evidence for the 36/72/108 transitions. It cannot be implemented as a bare stage+1 or arbitrary Qi number.

**C. Origin Pattern and multiple disciplines.** Implement the source's eight integration steps with evidence, material provenance, compatibility assessment, biological load and rejection. Cross-system effects must be earned and cannot silently stack incompatible cores, domains or traits. Keep human evolution separate from discipline ranks.

**D. Longer and ordinary-life practice.** The GM may judge months of sustained activity as one story, but the engine must still settle actual practice, setbacks, food and upkeep, independent NPC/ecological events and research evidence without fabricated results. Do not restrict natural life to arbitrary sixday course blocks.

The full original source is `reference/Beastbound_Realms_Unified_Master_Prompt.md` §§17–29; the user's Master Prompt and established Table Rules remain authoritative. This is foundational work, **not a claim of complete power-system source parity**.
