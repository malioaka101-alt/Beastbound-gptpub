# Original GM-authored wild individuals → measured mechanics

## Why this bridge exists

`world/bestiary.js::bioAuthor`, `world/ecological-webs.js::authorPopulation` and `world/gm-wild-individuals.js::witnessed/watch/sixday` already establish true biological source, actual local species abundance and an **independently living unique wild individual** in the one canonical `s.beasts`. An initial sighting deliberately has **no numeric grade, cognition, health measurement, combat statistics, powers, encounter or consent**.

The original `rules/combat-provenance.js` and `rules/encounter.js` require a proven individual combat profile and actual encounter before resolving any fight. This connection supplies the specific missing source handoff; it does not add another creature, wound model or combat dice stream.

## Source-owned handoff

- `world.gmWildCharacterise`: only after a genuine recent, local, non-withdrawn individual watch, and a recorded original GM scene with the animal's identifier and exact witness. The GM establishes **specific measured anatomy, cognition, welfare and bounded combat capability** with their independently documented source. The original `Combat.makeCombatant` and `combat-agency.verify` validate bounded measurements and independent behaviour. An immutable source hash, the original live species biology hash, first visual sighting and actual individual watch are kept inside that **same beast record**.
- `world.gmWildEngage`: a **separate** actual approach to the still-local, source-measured wild animal. It may withdraw or remain by its **existing individual wildlife RNG**, not player-chosen favour, and cannot repeat the same watched encounter to fish for outcomes. The new current `s.encounter` has no made-up precise separation, aggression, contact, affection or partnership.
- `combat.begin` and `combat.exchange`: existing source and wound rules verify the same original individual assessment, then apply the same original attack, independent tactical choice, stamina, wounds and time. `rules/encounter.js` uses original `world/lived-places.js` to resolve an actual GM-established site, rather than requiring a hard-coded Atlas site.
- Existing `bond.register` may remember an actual identified creature once cognition is established, but that is **not an offer or consent**. The existing consent/care/Grade/contract systems keep their independent prerequisites. Existing `rules/bond-care.js` may resolve **verified species biology** for a pre-authored individual care plan while retaining its original narrow food, supply and shelter limits.

## Strict limits

The recorded profile does not create an ability, Grade, Evolution, legal personhood, informed consent, dietary plan or bond. The non-sapient `gmWildEngage` route is **not** a sapient-person interview; a sapient species still needs properly sourced personal-language and legal interactions. A battle itself still requires legitimate encounter circumstances and never starts because a player requests a dangerous fight in fiction alone.

Specifically, the GM must provide **credible actual measurements and individual source**, not merely an impressive beast name, rarity label or a desired attack. Unknown or non-observed physiology remains unknown, and future alterations require appropriate new legitimate source mechanics rather than silent rewrites of the sealed first measurement.

`tests/gm-wild-mechanical-handoff.test.js` verifies species/population → actual sighting/watch → source-measured individual → independent encounter → original bond-history and wound-combat route, with replay/forgery checks and no invented progression. Other original tests continue to guard initial unmeasured wild lives. **No live save, request or result is modified.**
