# Unified living character mechanics — staged integration (18 November 2026)

## Goal and source authority
Every individually consequential Beastbound person (including elder, clan leader, ordinary handler, scholar, cultivator or ruler) must possess a persistent, causally explainable mechanical identity. Reuse the existing **living** modules; do not introduce a universal NPC level or GM-selected combat/rank shortcuts. The unabridged Master Prompt and the original distinct power-system source owners are authoritative, including the six core attributes, original potential facets, profession advancement and the Meridian / Arcane / Soul / Body / Rift / Beast-Origin / human evolution / willing beast partnership separation.

This work began when a deliberately fabricated non-canonical travelling clan elder could be portrayed in dialogue but had no source-backed mechanical profile. **The testing scene is not Maddoc's canon**. Never import the fabricated elder, her attendants, clan, beast, powers, or invented local facts into Maddoc's real campaign.

## Existing source owners — DO NOT rebuild

- `world/emergent-people.js`: individually witnessed GM people and causally emerging people; source-sealed identity, life RNG, career, presence, encounters.
- `world/independent-person-lives.js`: their independent daily interests, study, ordinary practice, relationships, fatigue, choices, focus changes. Its familiarities are explicitly **not** supernatural advancement.
- `world/notables.js`: existing 48 named professionals, earned professional practice ranks and **preparatory** system-specific study toward verified milestone events. An uncompleted trial is not a breakthrough.
- `world/agent-initiatives.js`, `world/adaptive-ambitions.js`, `world/person-presence.js`: autonomous work, priorities, schedules and local presence.
- `rules/character.js`: original player six-attribute and multidimensional potential definitions. Use consistent scales but keep private NPC potential hidden unless legitimately discovered.
- Original `rules/` discipline modules own actual stages, anatomy, abilities, techniques, costs, consent, injury, elemental effects and event results. A new NPC title, occupation or family never grants them for free.

## Phase 1 — implemented on feature branch

`world/person-mechanical-foundations.js` gives each **new** `emergent:person_N` a deterministic, independently seeded six-attribute natural baseline and 14 original latent potential dimensions. Each profile binds to the person's actual sealed birth identity and world seed. No player RNG, clock, wages, magic, equipment, techniques, combat stats or beast consent are spent or awarded.

`world/emergent-people.js` attaches this foundation during BOTH causal emergence and source-witnessed GM introduction. `mechanicalFoundationVersion:1` in the original birth source makes the new foundation mandatory during verification; deletion or alteration is rejected. **Older saved people are not silently backfilled** or treated as invalid. Their history and provenance remain intact.

`gmDossier(w, actorId)` is an **internal GM-only** read-only bridge: for newly created independent actors it displays those sealed baseline traits alongside the real career rank and actual earned discipline/technique arrays; for older established notables it displays **only** their existing professional and discipline-preparation fields. Missing facts stay unknown. There is deliberately NO ordinary player-facing rule action exposing an NPC's private potential, aptitude or unknown rank.

`tests/living-npc-mechanical-foundations.test.js` creates a **disposable** clan elder in an isolated generated test world; rejects GM-selected scores, asserts identity and profile integrity, privacy, original ranks unawarded, player economy/RNG/time unchanged, deterministic save roundtrip, tamper rejection and a legacy-notables read-only bridge. Original regression suite remains authoritative; PR CI must pass before main merge.

**Phase 1 does NOT complete full NPC builds.** Natural baseline scores are *not* final current combat attributes (age, wounds, physique, training and equipment affect those), and no actual discipline rank or beast has been fabricated for the elder. The capability to display an NPC's current complete combat profile requires source-specific work in later phases.

## Next work — in source order

1. **Audit all original NPC sources and save shapes.** Inventory player character, notable, emergent, origin-relative, professional-peer and independent sapient-being records; differentiate individuals vs abstract groups. Existing named actors require non-destructive legacy migration (original witness, no retrospective achievements or unearned levels). Check the actual original Master Prompt's power anatomies, not prototypes alone.
2. **Establish an earned NPC capability ledger** tied to each actor's original identity and genuine dated training/experiences. Map exact original discipline-specific milestones, capacity, physical needs, verified signature acts and constraints. Do not reuse a single stage scale or convert preparation/technical familiarity into real breakthroughs.
3. **Link the original rules owners** for actual NPC use: Meridian gates, Arcane core/circles, Soul phases, Body refinement, Rift discipline, human evolutionary changes, beast-derived integration, beast partnership/synchronisation, and exceptional specialist paths. Establish each original source witness, costs and bodily prerequisites before a rank/ability exists; any unavailable owner remains unresolved rather than fake.
4. **Complete current capability, combat and condition** with real body, age/life stage, wound, fatigue, gear and action authority, without assuming a person is mechanically weak/strong because of social office. Verify actual opposition resolution exactly once, source outcomes only; player/NPC dice must not reroll or silently share streams.
5. **Bridge professional expertise, affiliations, clans and household identities** through existing consent, groups, work, resources, and locality. A clan elder's title can be observed while their clan identity, influence, treasury, family and power are unverified.
6. **Source-backed independent advancement** connects day/sixday activities to validated specific earned events, including stagnation, changes of focus, injury and recovery. Do not rewrite past achievements, invent teacher requirements or make every NPC advance automatically.
7. **GM-only/private discovery + player-facing knowledge projection:** show the player only their actual observations, heard reputation and earned assessment. The internal profile never appears in a public scene or ordinary status unless a credible original channel reveals a specific fact.
8. **Regression and property tests:** new ordinary worker, childhood friend, clan elder, powerless administrator, master in multiple distinct disciplines, sapient being, beast partner with voluntary bond, legacy NPC, hostile actor and source-tampering. Protect Maddoc's saved checkpoint, older hashes, world time, NPC consent, rank advancement and replay.

## GM behavioural contract

When introducing an ordinary new person, narrate naturally and record a witnessed identity when appropriate. **Do not pretend the introduction alone supplies earned magic or a clan genealogy**. When the plot requires a powered NPC to use a real discipline, inspect source-owned capabilities first. If no evidence exists, establish the legitimate cause/owner of the capability, not a chosen stat block in prose. Distinguish *GM-private world facts*, *Maddoc's knowledge*, and *individual speaker knowledge*. Keep varied age-appropriate dialogue and natural conversational momentum, including Maddoc's witty, fiery, curious, thoughtful ten-year-old voice, without forcing player input after every trivial remark. Never use any temporary test NPC as an actual witnessed world event.

## Campaign safety / status

Target repository: `malioaka101-alt/Beastbound-gptpub` (connected GitHub). Active real campaign: `saves/bb_20261114_1dtmtp9.json`, Maddoc Maddren. Its last verified save scene is Rootday 08:30 at Thistlebell Yard; more recent GM narration has him speaking with an older unnamed storage-shed worker while looking for mother Hedra and father Nessa. None of the fabricated clan-elder test scene is canonical. Do NOT write to the save to develop this module.

At handoff, inspect current feature branch, PR and CI before continuing: `feat/living-character-foundation-20261118`; verify the branch's latest SHA and whether it was merged into main. Only report a merge or green test after GitHub confirms it.
