# Power systems: source-correct interpretation for private Beastbound play

This note clarifies, and does **not replace**, `reference/Beastbound_Realms_Unified_Master_Prompt.md` §§7–10 and §§16–31, plus `reference/Beastbound_System_Additions.md` (00b §4, 04 §§6.6–6.8). In any disagreement those original sources and explicit later revisions take priority. Treat this as GM presentation/continuity guidance, not an engine feature announcement.

## Separate ledgers: never one universal power number

1. **Human discipline** is a *practiced specialty* with its own infrastructure and breakthrough rules, not a character class or Beast Grade. A starting profile's `path:partner` is an emphasis, not an exclusion of other study.
2. **Human evolution** is permanent bodily/soul/Origin Pattern change. It is distinct from a discipline's stage, technique rank or a currently held reservoir. Baseline → Awakened → Refined → Transformed → Ascendant → Transcendent → individualized higher forms. Never auto-evolve someone for earning a stage.
3. **Technique mastery** is a skill of applying a learned ability, with its own practice, costs, limitations and risk; a high stage does not grant arbitrary named techniques.
4. **Inherited/acquired traits** are separate from discipline progression: bloodlines, constitutions, biological integrations, relics and other sources. Trace them through Origin Pattern, real capacity and risks.
5. **Beast development** has independent species grade, individual grade, level, evolution stage, multi-axis potential and technique mastery. A Level 2 fox is not Grade II, and a registered Grade says nothing certain about a hidden branch.
6. **Partnership/synchronisation** is a bilateral ten-stage shared practice based on trust, communication, energetic resonance, physical/spiritual compatibility, technical coordination and *mutual consent*. Even Stage 1 Basic Coordination requires no supernatural shared abilities. It is not human cultivation or beast level; shared stages 9–10 cannot be farmed or forced.
7. **Attributes and ordinary skills** are baseline measurements, not magically unlocked skills or potential. The prototype uses STR/DEX/CON/INT/WIS/CHA and rank-0–5 skills; the Master Prompt also requires multidimensional physical, energetic, mental and spiritual capability and potential profiles. Do not equate simple attribute scores with completed potential examinations or invent a single potential grade. Do not expose sealed potential.

## The independent human systems

- **Meridian:** physical 12 Primary + 8 Extraordinary + 36 Major Branch + 72 Minor Branch Networks; 108 Gates in three bands; 3 Dantian; stages I–IX from Foundation Tempering to Transcendent Constitution. Gate *count and quality* both matter. An unawakened `stage:0` has not completed Stage I or opened Gate 1.
- **Arcane:** build and maintain a real Mana Core/Circle architecture; up to nine Circles, each with geometry, integrity, capacity, spells and construction risks. Mana in a save is not a license to cast First-Circle spells.
- **Soul:** seven named phases from Soul Perception through Living Soul Architecture; distinct from Soul Engineering and contract ethics. Baseline phase 0 is not Phase I.
- **Body:** seven physical refinement cycles; anatomical change and injury trade-offs matter. No universal Qi requirement.
- **Beast-Origin:** Pattern Mapping → Compatibility → Seeding → Rejection → Stabilisation → Expression → Adaptation → personal Evolution. Capacity and sourcing/consent matter. This is not automatic beast ability copying.
- **Rift:** Rift Sense → Anchor Marking → Fold Step → Boundary Weaving → Pocket Architecture → Rift Adaptation → Realm Walking → Boundary Domain; spatial knowledge and real risk, not generic teleport magic.
- Specialist crafts, runes, formations, healing, alchemy and sacred traditions have their own standards; divine power is not universal.

System combinations may conflict structurally. A practitioner can study more than one, but must earn every independent breakthrough, resource and technique. A d20 check never authorizes an impossible, unlearned magical effect.

## Corrected evolution reading

The later additions define evolution as **Vael-driven Origin Pattern magic grown from biology**. Research, myths, rites, catalysts, environmental life, mastery and a creature's choices help uncover a **pre-established** branch. Age/time clauses are **Maturity**, accelerated up to ×10 under the stated specific conditions; other prerequisites, individual potential, costs and consent do not vanish. The genuine multi-check Evolution Event can Stall, fail or harm; success must apply a documented actual form/anatomy/ability record, never an invented bonus or automatically selected graphic. A common creature can have extraordinary *unknown* branches without secretly being guaranteed legendary evolution.

## Save-to-panel interpretation

Use only the currently verified campaign data. Display **attributes**, **learned skills**, **separate discipline progression**, **human evolution** and **partnership** as distinct sections. Show `0` tracks as **not yet awakened/constructed/refined**; `stamina`, `Qi`, `mana` are measured resources only. Avoid listing sealed potential, evolution conditions and NPC thoughts. Do not let an attractive panel imply a power that the engine has not granted.

**Implementation limit:** JS currently has partial tools/ledgers for several paths but not fully playable breakthrough, failure and form-transformation sequences for all of them. Source rules guide adjudication; never silently grant missing mechanics or call partial code complete. Real rolls still require verified engine results.

## Verified v1.1 procedures and explicit limits (updated)

The private JavaScript runner now implements **seeded multidomain capability records and provisional institutional examinations** (`rules/character.js`), **source-sized first-stage discipline tracks** with actual weeks, fee, check, Insight, setback/recovery and wound consequences (`rules/disciplines.js`), **separate Source-verified Arcane/Soul capacity calculators** (`rules/build.js`), and **per-gate Meridian training with quality and source milestone guards**. The historical prototype's `train X` commands are now rejected in private chat rather than allowed to race a player through ranks. The old `bridge.js act` path is also locked behind the safe, idempotent turn executor.

**Evolution Event correction:** A successful form now needs a fully validated `formProfile` (species and individual grade, anatomical changes, size, magical organs, every new ability's effect/cost/limit/source, habitat/diet/care, level cap and energy/body maxima) and *precommitted sourced* Vigor/Will scores. Only then is the event allowed to roll and atomically apply the entire form. A spectacular presentation can show only its confirmed form details; forms still require genuine per-species authoring. This is not a completed global bestiary.

**Current Ivar:** initially unawakened in all individual cultivation systems; `path:partner` identifies focus only. Character capability profile can be initialized once without a random roll, advancing time or editing his starting attributes, but **potential remains unassessed**. His Nacre relationship is Stage 1 Basic Coordination, not a magical synchronisation power.

**Coverage truth:** The full, section-by-section audit is `docs/SOURCE_TO_ENGINE_AUDIT_V11.md`. Independent advanced rites, multi-axis dynamic potential training, high-order fusion and human transformation still require distinct tested implementations; do not call them complete.