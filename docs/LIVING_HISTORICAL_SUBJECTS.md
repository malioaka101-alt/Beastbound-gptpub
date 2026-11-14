# Living historical subjects: use existing identities in original causal history

Beastbound's `world/causal-history.js` already preserves independently authored events, causes, interpretations and reported lasting influences. Before this integration, an event's subject and an influence's target were limited to original Atlas entities: regions, polities, institutions, houses, cultures and mythic sites. A GM-authored place, personally witnessed individual, or real voluntary association could be recorded elsewhere in the **same save**, yet could not be referenced as an actual historical subject.

This change makes the **original history module** resolve three additional categories from their existing source-owning records:

- `place`: a genuinely founded GM location in `world/lived-places.js`, validated against its original immutable founding source.
- `person`: a genuinely registered independent lived citizen, addressed by the original `emergent:person_<number>` ID and validated through `world/emergent-people.js`, including previously integrated GM-witnessed people.
- `group`: a genuinely founded voluntary association, addressed by its original group ID and validated through `world/emergent-groups.js`.

An event `scopeType`/`scopeId` or an effect `targetType`/`targetId` now accepts these **existing identity refs**. The original signed history entry stores the subject's original founding hash (`scopeOriginHash` or `targetOriginHash`) without minting a second identity or copying mutable working state. Reading and validating later history confirms the actual original source still exists and matches the saved reference. Existing Atlas historical records, years, causes, visibility, contradictory accounts, current-context effects, and replay receipts remain owned by the same history engine.

**Boundary:** the historically mentioned person retains their own goals, profession and independent schedule. The historically mentioned group is still a voluntary association, not a chartered academy, legal institution or government. A historical claim about ownership, consent, pay, teaching, law, an ability or construction is **context**, not the separately evidenced effect. It cannot award mechanics. Ordinary player-known history inspection is read-only; a GM-only historical event remains hidden.

Cross-system proof: `tests/history-living-entities.test.js` establishes all three subjects from their existing founding rules, writes one original historical event and three influences, verifies immutable source hashes, subjects and player-known history, rejects forged subject IDs and false Academy/Atlas institutional status, checks tampering, retains older Atlas history, and exercises original save/replay with no phantom gain or duplicated dice.

This remains a narrow connection, not a new general world-history API, NPC interaction script, institution certification, or second simulation.
