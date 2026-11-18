# Living bestiary: on-demand species and returning individual beasts

This is a supplement to the original Master Prompt §§6–7 and 11–16 and the Table Rules, **not a fixed creature list**. Do not transplant another campaign's fauna into Maddoc's current scene. The complete taxonomy is never materialised or dumped at campaign start.

## Three separate facts

1. **Species taxonomy:** `world/bestiary.js` contains expandable parametric taxon families (`tx:...`) plus authored prototype forms (`authored:...`) and genuinely GM-founded species (`gm:...`). The latter must use original `world.speciesBiologyAuthor` and compatible `world.ecologyAuthorPopulation`, not pretend a name proves anatomy, evolution, rarity, strength, sapience or occurrence.
2. **Individual identity:** each actually witnessed field organism has a unique `beast_...` in the original campaign `s.beasts` registry. First-sighted generated taxa are individually source-sealed as `generatedWild` with `Unclassified` mechanics, no fabricated combat profile, Grade, learned technique, contract, consent, owned resources or guaranteed evolved form. A generated taxonomic description is not evidence that Maddoc knows a creature's private biology.
3. **Encounters and ecology:** current compatible outdoor region, actual saved habitat pressure/quality/food/water, real sightings, autonomous individual choices and recorded local whereabouts determine potential contact. A player search never summons an individual or provides an impossible remote locator.

## When the GM naturally introduces new fauna

A free-form intention such as *look for unfamiliar beasts*, *look for beasts*, *search for wildlife*, or *survey local wildlife* maps to `world.fieldTaxonSighting`, which takes **no caller-specified ID, probability, Grade or outcome**. The original `world/simulation.observe` draws either a suitable canonical source or an on-demand generated `tx:...` taxon. If a generative taxon corresponds to a physically plausible local sighting, it is first instantiated **once** as a sealed uncharacterised individual in the **existing** beast ledger. Later field surveys may re-sight that same individual, decided by its persistent personal RNG. The observation costs original source-owned time. A town square without an actual natural habitat is not a free wildlife spawn.

An uncatalogued animal that genuinely needs a completely novel, not-yet-parametric species can still be introduced by the GM through existing witnessed biology + regional population + `world.gmWildWitness`. It remains uncharacterised until proper original observations support specialist assessment. **Never force a fully written bestiary before play**; flesh out the necessary biological facts as meaningful observations or research demand them, and never pretend their unimplemented numerical effects have already happened.

## Existing species is not the same as an existing beast

The encounter selector distinguishes three valid world results:
- **First recorded species sighting:** sample a new `tx:...` taxon from the region-compatible expandable bestiary, establish a unique uncharacterised beast and retain the species ID in the player-known sighting ledger.
- **Another individual of an already witnessed local species:** preferentially select an established regional taxon and create a **new beast ID** with independent biology still unmeasured. Recurring species should be more common than endless never-before-seen species.
- **The same individual again:** reuse an actual saved beast ID only if it remains eligible under place, time, ecology, condition and independent agency. No cloning, teleportation or guaranteed response.

Canonical prototype species and completely novel `gm:...` families remain compatible with their own source owners. A generated encounter record is evidence of this particular animal being witnessed, not the literal moment at which that species began existing across the realm.

## Returning creatures

- Normal `explore` has a bounded chance of meeting an individually witnessed **existing** original-engine wild creature only after at least one genuine off-screen sixday of independent life, if it is still at a compatible site, free, well enough and not currently in an active encounter. Repeated exploration on the same day does not automatically resummon it. Its own saved RNG independently decides whether it remains visible. Otherwise existing wild births or first-time engine individuals can appear.
- Field-taxonomy observations can naturally re-sight an earlier `generatedWild` animal, retaining its ID and source before creating a new one.
- `world.seekKnownWildBeast` and supported natural `track beast <beastId>` attempts can search for remembered individuals (including generated sightings), with genuine time, Stamina, check, autonomy and possible failure. They never reveal hidden movements. An uncharacterised new beast remains a **distant sighting only**, not eligible for automatic combat, bond or power expression.

Existing wild animals continue private habitat routines during the actual world sixday cadence, not during dialogue-only turns. Generated animals currently have **coarse noncombat routines**, not fabricated detailed physiology or unrestricted migration. Detailed breeding, magical techniques, rich society and evolution must be added through their true species-specific source owners, not made up from a taxonomy label.

## Persistence, visibility and testing

Source-backed `beast_...` IDs and the specific `tx:...` IDs survive export/import. Witnessed public memories are separate from private current locations, motivations, ancestry and future encounters. `tests/living-bestiary-natural-encounters.test.js` covers first-time generated taxa, authentic individuals, natural same-ID returns, independent world days, rejection of player-chosen species and clean save/reload. Every consequential turn still requires one original engine result committed through the Project's existing GitHub workflow. Never mutate a live save merely to test new fauna.
