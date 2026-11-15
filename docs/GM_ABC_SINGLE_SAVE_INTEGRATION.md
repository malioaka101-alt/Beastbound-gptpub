# GM field integration: 3A, 3B and 3C in one real world

This is a **disposable regression fixture**, not a new campaign, scripted player's destiny or a second game engine. It has no runtime file under `saves/`, `requests/` or `results/`.

`tests/gm-abc-single-world-integration.test.js` creates one in-memory character, one canonical forest ecology and one continuous original clock. The GM describes an ordinary natural field setting in which independently observable wildlife, a physical item and a voluntary field educator all exist. Unlike stand-alone unit tests, the mechanics must coexist **in the same exported/imported original save**.

## Real cross-system evidence checked

- **3C:** one genuine player-held source-attested ration is identified through the original appraisal check, conserved as one reserved variant unit in the existing item ledger and returned once to its exact original item type. No new material is minted, and no magical effect or commodity price is proved.
- **3A:** GM source-backed biology and a regional population establish the origin of one genuinely observed individual. The original wildlife decision source, individual biophysical record and independent chance to withdraw remain intact; no combat wins, consent, rank or bond is invented.
- **3B:** a separately witnessed independent local professional must freely enter a study circle and accept a voluntary duty. The original person-career mechanism must actually succeed before the player uses the **original** professional practice check. No parallel teacher roll, learner advancement guarantee, service wage or qualification is inferred.
- **Shared invariants:** the player and actor remain in one real saved location and timeline, the character's currency and inventory preserve their legitimate original sources, the animal remains unbonded, and the group's actual career receipts, material identity and beast ecology survive normal engine export and import.

The fixture sets deterministic seeds **inside the disposable test only** so the branches of already existing independent RNG are reproducible. This is not an invitation for the GM to choose a live character's dice, animals' decisions or another person's consent. Game narration remains independent of the implementation detail; no NPC voice or character psychology is encoded by this test.

## Limits

This test is a bounded interaction test, **not** proof that every new beast, medicine, school, occupation, magical invention, culture, illness or political circumstance has an executable route. Existing subsystem-specific tests and the full three-shard regression gate remain required for the actual code. During real play, the GM continues to narrate ordinary life and investigate new possibilities freely, while only verified effects are applied by source-owning mechanics.
