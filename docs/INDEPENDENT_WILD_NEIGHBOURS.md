# Independent wild neighbours and social ecology — 7 November 2026

## Canon and purpose

The original Unified Master Prompt §§7–12, 13–16 and 43 requires beast individuals with persistent social relationships, meaningful ecology, distinct needs, a genuine life outside the player, and strict separation between biological evolution, Grades, Levels, partnership and species lineage. The Table Rules insist that time and age never become an arbitrary evolution wall: *Maturity* is a separate mechanism, with proper accelerants and bypasses. This is the next **limited implemented step** following observed individual animal life and genuine re-encounters.

Previously, one witnessed wild animal could independently forage, rest, roam, decline attention and later be searched for, but it did not interact with other individual beasts. The new `world/wild-relations.js` gives **real, previously witnessed, unowned and physically co-located non-sapient wildlife** their first off-screen social interactions. Animals can avoid a neighbour, compete for resources, forage alongside each other or tolerate coexistence. None of those relationships is a romance, mating, kinship, ownership, human-beast bond or guaranteed affection.

## What mechanically happens

During each **genuine sixday world tick**, after both animals have advanced their personal independent habitat routines, the engine groups eligible wildlife in actual species-compatible, connected playable habitats. Animals of the same species in a real shared habitat have a chance to interact; mere simultaneous population listing cannot force them together. The algorithm rotates potential neighbours and allows a bounded number of meaningful contacts per animal per sixday rather than imposing a maximum population size or permanent roster. Independent dispositions and local water, forage, quality and pressure influence whether animals keep their distance, coexist or compete. Animals with inadequate condition, those engaged by the player, owned/partner animals and sapient persons are not pressed into an ordinary wild-animal social process.

The outcomes persist privately as pair-specific `realm.wildRelations` records bound to both original witnessed individual source hashes, the current habitat, day and actual reaction. Each individual remembers the encounter in its own dated `individualLife.history`. Shared foraging modestly reduces hunger; competition raises fatigue. No source-free injury, death, territory annexation, newborn, species conversion, new ability, XP, Grade, Evolution Stage, Soul phase, contract or player reward is created. Both animals remain independently free to move or reject future contact; later interactions can alter their current relationship.

**Information discipline:** These are genuinely off-screen lives. Raw histories and private pair decisions are not available from `world.wildMemoriesStatus`, ordinary public world panels or rumour unless a future real local witness, evidence or disclosure establishes that the player learned them.

The engine also preserves **elapsed days since a genuinely first witnessed animal** within its private `individualLife` record. This is **not** its total biological age: the prototype begins with a broad 'young adult' field and has no verified birth year. We do not falsely assign exact age, reproductive type, breeding partner, age-dependent lifespan or a forced Maturity cap.

## Freedom and remaining coverage

This slice handles same-species non-sapient **already witnessed** wildlife. Other species absolutely exist and may interact naturally, but source-backed predator-prey dynamics, symbiosis, season-specific reproduction, pregnancies, egg clutches, offspring kinship, territorial societies, real birth dates, mortality and deep aging need additional biological profiles and source-evidenced procedures. No category list here is a limit on the world or the player's possible actions. Nothing forces a hunter, breeder, tamer, combatant, group membership, trainer or prescribed faction on the character.

This does **not** implement complete reproduction, animal generations or all 57 Master Prompt sections. The existing written world history outranks this prototype. No campaign saves are changed by development tests.

Regression: `tests/wild-relations.test.js` with mandatory private GitHub Actions CI. Tests verify real individually witnessed pairs, isolated species and habitats, independent reactions and physical consequences, private source-bound date history, reproducible world ticks and checkpoint reload, no invented biological age/sex/offspring, and no bond, Grade, Level or evolution shortcuts.
