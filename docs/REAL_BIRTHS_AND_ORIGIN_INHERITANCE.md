# Actual wild births and shared human/beast inheritance — 7 November 2026

## Authority and design

The Unified Master Prompt §§7, 8, 10–12, 17–18 and 34 calls for deep animal and human heredity: **biology, inherited constitutions, Origin Patterns, magical organs and bloodlines may pass down across generations**. A powerful ancestor can confer meaningful bodily and power-system *advantages*. They do not automatically bestow their independently trained stages, mastery, learned techniques, experiences, contracts, institutional office, property or political command. A child has its own possibilities and choices; inherited advantage can be substantial, dormant, exceptional or imperfect.

The original Table Rules §3.9 explicitly forbid using chronological age or generational waiting as an artificial barrier to evolution. The separate Maturity readiness and its accelerants/bypasses remain intact. Natural biological development and engineered power transformation are not the same variable.

## First playable beast generation loop

`world/wild-generations.js` adds the initial **source-backed reproduction** for two internally coherent, authored mammalian species with live young: Lanternfen Fox (Vulpiridae; 42-day gestation), and Flint-Ear Hare (Leporidae; 36-day gestation). Those are the first implemented biological examples, *not a limit on what species, reproductive modes or life cycles may exist*. Other species will need their own documented anatomy, seasonality and biology instead of a universal mating recipe.

A conception is possible only after **two independently existing, physically co-located, appropriate, source-verified individual animals** have actually met during a real off-screen sixday world tick, where the animal social ecology recorded a suitable voluntary coexistence or foraging episode. Independent individual reproductive roles, welfare, remembered parentage, local forage/water/habitat stress and chance all affect the outcome; a player cannot request or select a pregnancy. It is not guaranteed merely because the animals meet. Gestation has a persistent source-bounded ancestry and due day; live birth depends on continuing real conditions and a later natural viability decision.

A successful birth creates **individual children**, not an abstract population counter: unique persisted IDs, real birth dates, recorded *two-parent ancestry*, developmental needs, inherited potential, stable lineage, a private Origin Pattern and distinct temperaments as their own lives unfold. Natural infancy and juvenile maturation update actual body size/HP/energy and independently preserved health proportions. Births and relationships remain off-screen until legitimately witnessed, so the player cannot see an unseen litter through a status panel or claim its ancestry as personally known. During normal exploration a genuine unobserved, free youngster already occupying that habitat may be independently encountered. It is not summoned, already tamed or instantly identifiable as anyone's child.

**Off-screen continuation does not depend on being watched:** a born individual can live, roam, feed, mature, and establish contact with another real animal without any player sighting. Existing witnessed wild adults keep their broad known age designation, **not a fabricated exact birthdate**. A child's actual date *is* known mechanically because the world simulated its birth; that does not mean the character knows it.

## Heredity for beasts *and* humans

`world/origin-heredity.js` defines the **shared biological source-bound Origin Pattern inheritance model**, separate from `Level`, `Grade`, `Evolution Stage`, `Sync`, mastered arts, trained human disciplines and social authority. Two properly recorded biological parents may pass on:

- **Body and physiology:** resilience, energy conduction, natural recovery and sensory potential. Exceptional parental constitutions can give the child noticeably better innate reserves; newborn HP and energy are materially affected, and physical growth preserves the same individual inherited differences.
- **Power-system predispositions:** Meridian, Arcane, Soul, Body, Origin and Rift *aptitudes*, not the achieved phase, gates, circles, learnt rituals or magical organs magically borrowed from an unrelated being.
- **Bloodline signal:** a sourced ancestral lineage with varying expression strength. A signal can be naturally expressed or dormant, can skip a child, and can combine with environmental and individual development without guaranteeing the parent's fate.
- **Variation and inheritance from both actual biological parents:** stronger parental Origin Patterns generally raise inherited capacity, but children differ even within a single litter or family.

The biological resolver accepts `kind:'beast'` for actual generated newborn wildlife and also supports `kind:'human'` **when a sourced human birth and two actual biological parent records exist**. The initial human household charters establish known social relationships, some chosen kin, and **unproven ancestral claims**; they are NOT evidence that a named child inherited a particular mutation. The current engine does **not** yet generate human births or mechanically assign human inheritances to the 28 pre-authored families; that requires genuine sourced natal and genealogy records. Human profiles in the regression suite are *synthetic fixtures*, not real campaign family facts. The shared model enables that later human implementation without creating false descent or magically privileging a surname now.

### Very powerful ancestors and transmission

Stable heritable constitutions and profoundly altered ancestral Origin Patterns can in principle give exceptional offspring a large advantage. **A parent's achieved level or personally learned technique is not itself inheritable**: those belong to training, memory, institutions, mentorship, permissions, and possibly chosen family/clan instruction, all subject to access and the people's real decisions. A family can teach skills or retain libraries as a separate cultural inheritance. A true heritable transformed organ or bloodline needs actual recorded stabilisation as part of the parent profile; that future integration is not assumed to exist merely because someone attained a high rank.

## Current limits and tests

Two initial mammalian reproductive profiles, no universal reproduction, no casual births for sapient persons, no forced pairing, no instant child-to-adult spell unlock, no automatic beneficial mutations, no infinite species census, no guaranteed descendants, no inherited official powers or unexplained riches. The existing world runs independently of the player. Birth histories and parental Origin Patterns remain private until learned by actual means.

Mandatory `tests/wild-generations.test.js` and `tests/origin-heredity.test.js` verify two-parent source history, species-specific gestation, natural newborn individuality, meaningful inherited advantages, reproduction uncertainty, biological age, generation continuity without player witness, ancestry privacy, independent ordinary young encounters, honest save replay, and absence of copy-pasted learned stages. Neither test edits a real campaign save. Full private CI must pass before merging.
