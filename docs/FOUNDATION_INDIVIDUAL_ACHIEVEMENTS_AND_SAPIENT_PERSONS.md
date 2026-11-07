# Foundation: independently earned accomplishments, across kinds of persons

**Authority:** Original Unified Master Prompt §§7–12, 18–19, 31–33, Table Rules §§3.5/3.8/3.9, and the player's standing clarification: **Beastbound must establish systems that let a living world grow during play; it must not pre-map the planet, hand-author everyone's fate, or introduce mandatory calendar time for advancement.**

## A single foundational ability: evidence of real accomplishments

The source-bound, domain-neutral reducer `world/earned-individual-practice.js` provides the first reusable record for learning by **actual independently verified actions**. An adapter binds the individual to a real identity and origin, chooses meaningful problem-specific skill domains (not a universal ranked list), supplies the individual's real aptitudes and **genuine resolved work evidence**, and asks the reducer to update **private practical competence**. Its rolling save receipts reproduce the exact work checks and earned scores, detect changed rolls/points and survive checkpoint reload. A long career's old receipts fold into a verifiable summary without requiring an endless world-wide archive.

The reducer explicitly **does not know** whether the actor is human, avian, reptilian, sapient beast or another real person type. It also **does not know** a profession title, school, clan membership, technique, physical Grade, Arcane Circle or moral alignment. Those are not magic keys that grant competence; future adapters may support them only after actually sourced anatomy, resources, knowledge, education, social choices or achievements.

There are five *descriptive evidence-depth bands* inside any adapter-selected skill; these are **not canonical Levels, beast Grades, cultivator stages, skill licences or a new universal power system**. Actual aptitude, the challenge, demonstrated practice and the outcome determine learning. Higher depth increases the technical challenge of learning more from trivial work. Multiple genuinely recorded methods remain distinct. **No calendar days, birthday, minimum sessions, age-gate, mandatory mentor, caste or predetermined mastery period appears in the reducer.** Waiting without action grants nothing; an exceptionally capable learner can improve rapidly if a genuinely difficult accomplishment warrants it.

**Important boundary:** This is a private engine reducer, **not** a player-accessible `grantAchievement` command. The caller must first have a real individual, an independent check and a source-verified task. The module intentionally cannot authorize skills on its own, generate physical mechanisms, reveal inaccessible secrets, manufacture materials, or establish a legal qualification. A future player/NPC/partner/species learning adapter must validate its action, resources, result and consent before using it.

## Sapient beast persons: first adapter, no invented civilisation

`world/sapient-beast-persons.js` is the first personhood-aware nonhuman adapter. It activates **only** when an individual of an already-defined sapient species actually appears through the existing local encounter engine (or has real independently established S3+ status). It verifies the original creature's species, saved encounter details, local habitat and the encounter's actual log record. **Nothing is populated across the world merely because the calendar advances.**

The new `social.meetSapientBeast({})` is a genuine local, no-target-selection scene. A safe and presently independent sapient person may **accept or decline** further interaction according to their own stable disposition and well-being, without player-chosen rolls, mind-reading, prescribed speech, forced names, information about remote homes, contracts or friendship. A voiced pattern or visible gesture is **not** evidence of a mutually known language. The person remains free to leave and is not made the player's partner. Repeating the same source encounter cannot reroll the individual's decision.

`social.sapientBeastMemoriesStatus({})` is a **read-only** record of only what the player really witnessed. It does not reveal the person's private work, aptitude, intent, stage or whereabouts. Source-bound private histories survive saves and are never copied into player-known registers without new real contact.

Once genuinely established and no longer held in an active encounter, an independently living person may make their **own** decisions during later world ticks: rest, attend to personal survival, observe habitat or attempt ordinary physical resource/shelter care where ecology allows. This is not a new adult class directory or a species-level personality template. When a person chooses a real task, their own RNG, individual cognitive/physical potential, real local habitat and the problem's difficulty produce an independently logged outcome. Real work can earn **bounded evidence of practical environmental judgement or resource care**; effective self-care can address the person's actual fatigue. Those specific acts do not teach the player, authorize an existing beast magic technique, create a new material, open a Meridian Gate, award a human degree, become guild authority, evolve a body, claim a clan, or fabricate ancestry.

The sixday is **only a scheduling opportunity for genuinely selected independent activity**, not an experience increment. The resulting proof is time-stamped for causality but has **no time-served requirement or calendar multiplier**. There are no rewards for silence, rest, refusing a meeting or merely surviving another week. Personal refusal, unhealthy conditions and local scarcity remain real constraints.

## Future growth without pre-mapping the world

The reusable reducer can next serve:
- Human and nonhuman education, self-study, apprenticeships, original research and practical crafts with actual evidence, aptitude, knowledge and materials.
- Individually adapted species-specific bodily and magical techniques, with consequences bounded by anatomy, resources and the real power system—not “technique-name cheat codes.”
- Family and clan teaching of social knowledge and methods where **genuine access, trust and consent** exist; hereditary biological potential is a **separate** mechanism following real parentage, and does not magically transfer learnt techniques or titles.
- Independent species communities, economies, politics and collective traditions as particular persons actually establish relationships, settlements, institutions and conflicts during play.

**Not implemented here:** a complete census of sapient populations; all languages or civilisations; general sapient births/lineages; species-specific manufacturing; arbitrary technique invention; full NPC-to-NPC teaching; battle art progression; general independent spell breakthroughs. Those must be built from individual actions and substantive constraints. No campaign-specific facts or invented organisations, villages or families are introduced.

Mandatory tests: `tests/individual-earned-evidence.test.js` and `tests/sapient-beast-personhood.test.js`. Active campaign saves stay untouched.
