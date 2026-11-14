# Beastbound — Random Life: existing world and compatible new additions

**Player direction: 14 November 2026.** For Random Life, the player chooses **starting age only**. Gender, name, appearance, birthplace, family, social circumstances, ordinary attributes and other unspecified details are random or seeded. No gender is fixed. Age informs lived experience without granting free ranks, licences or relationships.

## Source ownership and new creation

- The original fresh-campaign creator is scripts/new-campaign.js, using engine.randomCharacter(), lived-years and scripts/campaign-origins.js.
- Existing social origins include original historical or renowned houses and institutions, new families, independent lives and new informal organisations. The original emergent-groups owner holds founded groups and origin-relatives manages independent named kin.
- The new scripts/random-life-world-additions.js seeds an **existing or newly generated** modest local place inside a real Atlas region. Created places persist through the existing world/lived-places.js registry with explicit pre-game provenance. They are actual addressable campaign places but do not force the first scene or summon anyone.
- A local everyday working custom is added. When the ecology supports it, a regional field-guide reference selects a species form from the original demand-generated bestiary. That is **not** an animal encounter, contract, witnessed living beast, new power or proved evolution.
- Additions are seed-reproducible, source-sealed and recorded in both the campaign origin and the player starting context. They belong to **that campaign's saved world**. They do not overwrite the global Atlas, other campaigns or retired character histories.

## Boundaries and future expansion

This generation is not a closed list of all imaginable households, places, local customs, species, histories, techniques or careers. The GM can create additional consistent new material through existing specialist source owners during a story. A family may have a history or a disputed heritage claim without the player automatically receiving a bloodline technique or power. New original species biology still requires its actual ecology, ancestry and biological support in the existing species-biology subsystem.

New relatives retain independent wills. A family surname is not a title, a new settlement is not guaranteed safe transport, and a field-guide entry is not an animal spawn. No new lineage power, unverified estate, item, cash, statutory authority, partner or NPC consent follows from the expansion.

## Session operation

Ask only for **starting age**. If the player has given it, do not ask for gender or other random fields. Generate one fresh unique seed and slug; never overwrite a save. A new campaign must be explicitly authorised by the player, created by the genuine engine, supplied with an original GM-authored opening and persisted through acknowledged GitHub writes. A slow response is not permission to reroll or revive old campaigns. Guided starts do not silently create random-world additions.

Live actions still use the original engine and fast-turn rules. Random-world additions are **starting history, not an in-world action, free reward or time change**.

## Tests

tests/random-life-world-additions.test.js uses disposable fixtures to verify deterministic creation, existing-vs-new localities, regional ecology, age retention, gender diversity, original save round-trips, no forced opening, no duplicate generation, no unearned powers and guided-start compatibility. No test edits saves/, requests/ or results/.
