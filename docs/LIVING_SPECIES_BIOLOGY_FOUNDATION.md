# Living species biology and expandable taxonomy — foundation #03

**Authority:** Original Unified Master Prompt §§6–9 and §18. This extends the existing `world/bestiary.js` catalogue, `world/wild-generations.js` physiology and `world/simulation.js` habitat/ecology. It is **not** a second species generator or a fixed list of allowed creatures.

## GM authors; existing engine measures and preserves

The GM authors a taxon or a biologically distinct variant when its presence becomes meaningful in the world. Biological records can connect a new GM species to an existing canonical or procedural taxon, or establish a new lineage with no known parent. The GM provides actual anatomy, functional magical organs, ancestry, lifecycle, diet, role, affinities, habitats and biological limitations. **No system rolls for permission to create a coherent species**, chooses a creature's personality, invents a battle ability, assumes a habitat means a guaranteed encounter or awards inherited human powers.

Each `speciesBiologyAuthor` entry stores an immutable source-hashed founding record in the **existing `realm.speciesBiology` state**, alongside the existing Atlas ecology. It captures:

- Structured but extensible kingdom → phylum → class → order → family → genus → species taxonomy (not a constrained catalogue of names), lineage/parent identity and meaningful variant differences
- Body plan, organs and their *functions, limitations and energy source*, Origin Pattern description and stated affinity
- Named actual habitat regions, ecological role, diet, optional known realm affinity, and habitat suitability against actual regional water/forage/quality/pressure
- Reproductive mode; *known or unknown* gestation/development/lifespan days; applicable environmental needs; optional measured developmental stage from genuine chronological age
- Public versus GM-only records; append-only source-attributed field reports, with original identity and older discoveries preserved

The existing bestiary still supplies a large procedural taxonomic **address space** but its generated labels are not proof that hundreds of thousands of genuinely researched species exist. Species grade, individual grade, level, evolutionary stage and potential remain separate from this taxonomic record (Master Prompt §8). Rarity is **not** a proxy for fighting strength. A new species does not gain a numerical combat profile simply because a magical organ was described.

## Starting biological examples, not limits

**Existing Fenfox (`authored:fenfox`).** Its known Vulpiridae family, existing Marshlight/mist ability and existing actual wild-reproduction profile are joined by a small mammalian body-plan account and mist-gland limitations. The engine reads the actual established **42-day gestation, 180-day juvenile and 365-day adult thresholds**, plus habitat needs and verified local environmental state. No new fox has been spawned or bred.

**Existing Flint-Ear Hare (`authored:stonehare`).** The known Leporidae family, earth-aligned movement ability and real reproductive ecology are connected to a coherent hare morphology. The inherited reference remains the existing `world/wild-generations.js` profile, including its **36-day gestation, 145-day juvenile and 280-day adult thresholds**; no instantaneous evolution is granted.

**Example GM-created Reedglass Pollenmoth (`gm:reedglass_pollenmoth`), in the integration test.** The GM creates an additional nectar-feeding Luminopteridae taxon related to the existing Glasswing Skimmer, with coherent wings, an ecological purpose, egg lifecycle and explicit limits on the prismatic structure. The test then authors a distinct forest-edge variant. Those taxa are *demonstrations of how new species enter the world*, not global preset canon fixtures or a mandatory recipe. They are **not auto-inserted into creature spawns or the player's party**.

## Integration with existing systems

- `world/bestiary.js` still owns all taxonomic lookup. New `gm:` identities are **per-campaign** saved biology, not globally inserted into `engine.SPECIES`. A public GM-authored identity can be read through `Bestiary.lookup(id,{state})`; undisclosed species are not leaked by that lookup.
- `world/simulation.js` seeds biology inside the already created `realm` and extends `world.species` *only if the player already has a genuine identified sighting*. Public specialist biology is not itself a sighting. The saved regional ecology powers habitat evaluation; an otherwise plausible species is not automatically present in every suitable region.
- `world/wild-generations.js` remains the verified birth and ancestry engine for the two originally supported mammal taxa. The new anatomy record references those physiological inputs, but **does not turn all authored reproduction profiles into automatic births**. Other species must get appropriately verified actual off-screen conception and birth handling later (#04) if needed.
- `rules/index.js` exposes `world.speciesBiologyStatus({speciesId?})`, `world.speciesBiologyAuthor({...})`, `world.speciesBiologyNote({...})`, `world.speciesBiologyAge({speciesId,ageDays})`, and `world.speciesBiologyFit({speciesId,regionId})`. Status, age and fit are read-only within the private file-backed request processor.
- `speciesBiologyNote` adds a fact *about* species biology with a source, context, observation time and public/GM-only visibility. It cannot silently rewrite the existing ancestor, native organ, reproduction model or a physical animal's individual actions.
- The GM can author a new coherent lineage with another body plan, reproductive mode, or realm habitat. Additional scientific understanding or a new regional radiation becomes another explicit fact or lineage record rather than silently changing the previously observed species.

## Not yet supported

A detailed biological profile **does not create an individual beast**, add it to the old six-site spawn tables, grant learned techniques, establish involuntary bonds, automatically cause pregnancies, award an evolution branch, change human Origin Pattern compatibility or override a wildlife individual's independent decision. Complete natural reproduction and off-screen lifetimes for every authored species remain **#04**, and deep individual personalities, techniques and branching evolution belong to **#05–#06**. If the GM establishes the first real animal of a new species during play, the engine still needs a sourced encounter or individual-life path instead of silently treating a biological catalogue entry as an encounter.

**Verification:** `tests/species-biology.test.js` tests real existing mammal profile coherence, new taxa and variant ancestry, environmental fit against *actual* ecology, developmental ages, public/private scientific knowledge, append-only source integrity, no spawned pets or magical rewards, old-save compatibility and exact idempotent saved turns. Mark item #03 complete only after the entire GitHub Actions regression suite passes.
