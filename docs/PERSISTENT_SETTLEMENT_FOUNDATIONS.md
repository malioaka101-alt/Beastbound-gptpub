# Beastbound — persistent whole-settlement foundations (15 November 2026)

## Standing distinction: created world versus discovered world

When the GM introduces a **real hamlet, village, town or city**, the *whole settlement foundation is created at that moment*, not only the two streets on which the player happens to walk. This implements the foundation-first directive in `FOUNDATION_FIRST_WORLD_ARCHITECTURE.md` without trying to pre-generate the entire continent or converting single homes and yards into towns. The previously built `world/lived-places.js` travel bridge alone was insufficient; it stored a description, but no complete locality.

`world/settlement-foundations.js` now creates a deterministic, sealed, saved record from the original established place, its regional Atlas ecology, polity, original place founding proof and world seed. The settlement includes:

- A coherent **district and physical site graph**: common, reading facility, practical training yard, beast-handling space, market lane, workshops, stores, homes, water/drainage and connecting ways. Each recorded home belongs to a particular household; fenced/restricted sites are not public just because they exist.
- A **whole initial household roster** (21–33 independently identified households) with individual resident identities, names, household roles, distinct occupations or learner status, temperaments, practical concerns and everyday site routines. Household kinship is not automatically an inherited magical ability, rank, noble title or a transfer of property.
- Original **local culture, resource economy, civic context and rights** anchored to the real regional polity, resources, ecological dangers and livelihood needs. This establishes that a town has farms, records and work beyond the protagonist's camera; it does not grant an always-open shop with free stock, wages, magical instruction, licences or public power.
- **Independent, source-linked world change** at the original sixday cadence: local water, roads and work pressure evolve under actual regional forage, ecological quality and polity prosperity. These decisions do not use the player's dice, create unearned loot, or force NPC attendance. Individuals' ordinary daily locations follow stable character and date-based routines and can choose to stay home.

The physical foundation and resident roster are **not an omniscient player directory**. `world.settlementStatus({placeId})` is read-only and reveals only previously introduced or genuinely visited public landmarks, and co-present people at the currently visited site. No private homes, personal schedules or household census are exposed merely because they are stored in the save.

`world.visitSettlementSite({siteId})` is an actual local journey: it validates public/supervised access, consumes engine time, updates the current intra-settlement site and permits witnessing only the people physically there. `social.speakSettlementResident({npcId,question})` checks presence, leaves the resident independent to speak or decline, advances the original clock once and preserves the actual observed answer. Nobody is automatically known to have met Bram or Tessa, read Maddoc's private Soul notes, or learned of Hedra's allowance.

Ordinary `world.establishPlace` automatically invokes the new foundation for places honestly identified as a **whole** hamlet/village/town/city through their name or kind. Individual homes and working yards still use their existing place identity and never generate a false municipality. For a *previously established* town, `world.foundSettlement({placeId})` fills the missing full foundation exactly once, using the original place founding time/proof. This does not retcon established landmarks or history, consume the player's in-world clock, teleport people, make hidden NPCs appear, or rewrite family relationships. The old `world.placeStatus` remains backward-compatible.

### Mossgate migration

The old saved `mossgate_common` is a **hamlet common**, not the whole of Mossgate. Its original reading house, training yard, public well, orchard lanes and protected beast pens are retained as witnessed facts. `world.foundSettlement({placeId:'mossgate_common'})` adds the rest of the full persistent hamlet record, including households, independent residents and districts, without changing Maddoc's location, money, stamina, date, journal or unconfirmed friends' whereabouts.

Run that operation against the exact live Maddoc save after merging and validating the engine. Keep the previous campaign file intact until the matching GitHub Actions result confirms a new save revision. Do not claim the migration occurred merely because this document or code exists.

### Engineering boundary

This is a **full initial local foundation and persistence contract**, not a claim that every conceivable profession, interpersonal agreement, inheritance, shop inventory, beast relationship, individual lifecycle or national law has already acquired a complete mechanical adapter. The broader independent career, emergence, supply, institution, ecology and law systems remain authoritative in their own domains. Future deeper local economic or family interactions must reference actual resident IDs and witnessed source decisions, not conjure a merchant or relation for a convenient scene.

The founding schema is append-only and source-hashed. Test `tests/settlement-foundations.test.js` alongside existing lived-place, world simulation and NPC-continuity regressions. Existing campaign saves lacking this ledger must remain loadable, and view operations must be read-only.
