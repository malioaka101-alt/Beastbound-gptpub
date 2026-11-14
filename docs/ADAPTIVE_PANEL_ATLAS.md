# Beastbound — Adaptive Panel Atlas and Personal Power Sigils (14 November 2026)

**Player-approved direction:** The living world must support beautiful native in-chat fantasy panels for personal powers, techniques, professions, combat, households, clans, family legacies, membership and player-founded organisations. A store panel is only one possible economic form, never the substitute for any of those social systems. This is a presentation/authoring specification, not a claim that all detailed panels are implemented in `panels.js` today.

## Authority and interaction model

- Source order remains the original Unified Master Prompt, established campaign facts, Table Rules, source-owned verified mechanics and later explicit player visual preferences. This file extends `IN_CHAT_SYSTEM_HUD.md` and `POWER_SYSTEM_PRESENTATION.md` without changing mechanics, inventing source states, granting membership, renown, ranks, techniques or rights.
- Normal scene: prose first, one concise native in-chat HUD if useful, confirmed rolls inline and factual delta for changed mechanics. Specific specialised panels open on requested inspection or a relevant scene, never dump every panel every turn. Native lightweight chat primitives rather than screenshots, website, CSS-heavy AppBlocks or 34-character ASCII except as a fallback.
- Read-only displays can reuse the latest verified save, result and established witnessed facts; opening a panel never ticks the clock. Obtain missing true values from the canonical source owner only when necessary. Never expose unknown NPC motives, sealed abilities, offscreen events, unearned future branches or secret lineage potential.
- A panel visualises verified events; it cannot originate events. If a mechanical adapter, datum or individual power symbol is not authored/implemented yet, show a clearly distinguished unknown/not recorded field rather than a simulated fact. No UI button creates an action by itself; the player is free to act naturally in chat.

## Personal, living sigil grammar

One static icon per discipline is not enough. Every person's sigil is an identity-bearing **derived rendering** with three layers, without becoming an independent mechanic:

1. **Discipline skeleton**: the distinct power anatomy — Meridian: mapped channels/gates and flow; Arcane: core and geometrically constructed Circles; Soul: living threads and coherent resonance; Body: refining organic/forged structural layers; Rift: offset boundaries/anchors; Beast-Origin: paired hereditary-pattern strands and stable integrated traits; Human Evolution: altered individual phenotype; Bond/Sync: *two separate* living signatures, never one possessed creature.
2. **Earned structural change**: openings, connections, ring complexity, anchored geometry, trait branches, refinement marks, stable expressions and verified stage transitions **only** when source-backed. Stage 0 is preparatory rather than awakened. These are NOT the same generic ladder: a Meridian gate cannot become an Arcane Circle or a beast grade.
3. **Personal expression**: geometry, branching, material motif, alignment and line accents represent **recorded** self-invented methods, elements, learned techniques, witnessed character traits, anatomical adaptations and genuinely established bond resonance. Two equal-stage practitioners can have different personal marks. Do not read private genetic potential, default background path, a surname, user preferences or unconfirmed technique names as a free special power.

Symbol evolution rules: base unawakened motif → verified first awakening anatomy → verified branching practice → mature unique signature → rare verified transformative form. These are **visual examples, not milestone thresholds**; each original discipline has its own actual source stages, and a player may diverge or discover unusual paths naturally. No cosmetic sigil progression awards a stage, unlocks combat effects, replaces a skill record or selects a future branch. Render the latest confirmed historical sigil state; preserve it across chat turns; update only after proven changes. The user may request a large read-only personal sigil view. Use restrained thin lines/glow, legibility without color, and avoid animation except subtle milestone or ceremonial reveals.

## Complete panel family — dynamic, contextual and inspectable

| Panel | Visible grounded fields | Source discipline / restrictions |
|---|---|---|
| Everyday HUD | name, place and calendar, relevant current resources, nearby partner or immediate focus | `panels.hudData`, current verified scene/save |
| Character / Status | biography, attributes, skills, wounds, conditions, money, earned path | `panels.characterData`, `player`, authentic wound model |
| Power overview / individual power panel | distinct attained discipline stages, source anatomical marks, learned prerequisites, personal sigil | `rules/power-overview.js`, source-owned discipline states |
| Combat tactical | current player wound boxes, stamina, positioning/cover, equipped weapon, known opposition/terrain, earned usable techniques, relevant encounter status | actual `table.combatants`, `battle`/`encounter`, `rules/combat.js` and combat adapters; never invent enemy statistics, initiative or rolls |
| Techniques & abilities | separately recorded usable martial, arcane, meridian, soul, rift, body, origin and partner techniques; costs, real prerequisites, mastery/effects where verified, school/source and usability | validated technique ledgers, rules/source owner; unlearned designs are not learned skills |
| General and specialised skills | skill ranks, earned experience/provenance, specialist mastery, methods actually demonstrated; independent of anatomical stage | `player.skills`, earned-practice, specialist family source owners |
| Profession & career | actual role(s), work history, specialisations, acquired qualifications/licences if earned, genuine current commissions/employment, recorded achievements | `player.background` is not a current signed job; actual profession/work ledger and relevant independent `world/person-careers.js` where appropriate |
| Tamer / Bond | known partners, consents, synchronisation, witnessed rapport and partnership roles | beast records and `rules/bond-*`; a number does not compel consent |
| Beast identity / evolution | known name, family/species, actual form and grade, needs, condition, earned techniques, observed evolution signals | actual beast ledger; no hidden potential or future secret forms |
| Encounter / taming | witnessed behaviour, actual proximity, current independent contact and consent status | encounter/first-contact/agency; unknown shown as unknown |
| Research / crafting | authentic hypotheses, evidence, authorised designs, actual materials, progress and demonstrated outcomes | research, production and craft source owners |
| Inventory / market / owned shop | genuinely owned materials, funds, witnessed offers, verified shop stock, workers and obligations | inventory and scarcity source; owned store not assumed |
| Contracts / competitions / rankings | accepted actual obligations, published event, validated entry/result and rank, legitimate rewards | source-backed public competition/field-work; never generate contract by displaying it |
| People / social relationships | known individuals, player-witnessed interactions, declared commitments, observed public roles | independent actors and witness records; no secret feelings |
| World / travel / journal | date/place, known routes, personally heard public updates and durable pickup details | simulation, witnessed notices, calendar and journal |
| Organisation memberships | one card per **genuinely joined** guild, association, sect, trade league, civic body or other locally-authored institution; individual's actual role, status, obligations, rights, contacts, known decisions | Atlas institutions, actual witnessed membership and permissions; being nearby, employed for one task or born in a polity proves no membership |
| Player-founded/led organisation | unique charter/purpose, genuine founding evidence, independent members, accepted duties/roles, actual budget/treasury, active initiatives, internal dissent, relationships with other groups | `world/emergent-groups.js`, `rules/group-invitations.js`, independent member agency and treasury/office source records; founding does not grant government or command over members |
| Family & household | personal household structure, individually known relatives, descent or chosen kin as truly established, household livelihood/resources and personal ties | `player.family`, authored `world/social-houses.js`, `world/emergent-households.js` and genuine relative records; never conflate household with noble title |
| Clan / house / lineage | actual affiliation and genealogy, local customs, recognized charter/standing, internal roles, family disputes, obligations and proven lineage traits if any | canonical house/clan sources, kin history and actual recognition; family name or ancestry claim alone never proves a bloodline power, inherited office or membership |
| Alliances / politics / civic ties | actual recognised agreements, local offices, witnessed public deliberation, factions and public consequences | government/office/diplomacy sources; independent members and jurisdictions |
| Milestones / ceremonial reveals | previous → newly verified state, cost, actual technique or anatomy change, follow-on condition | original immutable engine receipt only; distinct motif for each system |

Panel categories are **not** a forced gameplay menu; users may name an earned skill, actual family, beast, group, institution or technique conversationally. Real source entities may be many and organically generated, not limited to a fixed sample list.

## Dynamic panel rules by situation

- Ordinary conversation: normal compact HUD or no redundant expanded sheet.
- Combat starts (only on verified encounter): compact combat overlay replaces nonessential location/purse detail. Show player wound-track and earned readily usable abilities, partner actions/consent only if actually available; never fabricate enemy health. Show rolls and deltas from one engine result.
- Technique used or practised: show a focused skill/technique row with source, energy/cost, relevant original check and actual effect if performed. Distinguish profession, specialist skill and supernatural technique.
- Joining a clan/guild/group or receiving an office: show a membership or organisation context panel only after the original source witnesses that relationship. Joining, founding, owning, employment and political appointment remain different facts.
- Family encounter/inheritance: household sheet reflects known family facts and independently made decisions; it must not turn every clan into a noble house or guarantee hereditary powers.
- Rare verified breakthrough: ceremonial reveal with distinct personal sigil and actual change, then return to quiet everyday HUD.

## Present implementation and explicit future boundary

At the time of this specification, `panels.js` has nine standing full categories (`status`, `character`, `power`, `tamer`, `quests`, `bag`, `people`, `world`, `journal`) plus conditional `research`, individual named beast, `taming` and `store` menu references. Native ChatGPT presentation can represent contextual combat, career, skills, family and group views where source facts already exist, but **these are not all separately implemented as `panels.full()` named routes yet**. This document is the accepted visual/data contract for subsequent code-backed adapters, not proof of new executable routes.

Source-owner additions should be small read-only projections (not parallel progression engines): retrieve original verified data, trim to player-known context, give true unknowns, and leave all mutations to the original owner. Tests for later implementation must cover stale-state privacy, zero RNG/time use, independent agency, duplicate safety, save compatibility and correct distinction of stages, positions and affiliations.

**Current independently saved example:** Ivar Wick, age 24, apprentice and partner path, has an extended farming household with one sibling and complicated ties. He has a recorded mutual fox partner Nacre, skills Survival/Beastcraft/Diplomacy Rank 1, but the save does not grant him a named current employer, a personal guild or clan membership, an owned organisation or store, a specialist supernatural technique, or an active battle. Nacre's own Glimmer Veil technique is **hers**, not Ivar's. Show blanks/known absence rather than inventing people, achievements, inherited essence or organisation finances.
