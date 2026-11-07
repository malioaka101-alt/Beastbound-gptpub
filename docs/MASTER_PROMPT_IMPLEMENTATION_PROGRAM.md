# Beastbound — Master Prompt implementation programme

**Authority:** `reference/Beastbound_Realms_Unified_Master_Prompt.md` (all 57 sections); `reference/Beastbound_System_Additions.md`; `reference/Beastbound_Table_Rules.md`. Original instructions and established campaign facts prevail over a prototype or this programme.

**Purpose:** implement the **whole private text RPG**, not a simplified reimagining or a sequence of arbitrary power gates. This is an engineering plan, not a player-facing plot. Engineering milestones may overlap; a player may pursue any plausible life path at any time.

## Implementation standard — what counts as complete

A section is not marked complete just because a data field, broad lore paragraph or method name exists. For actionable rules, require (1) specific Master Prompt authority and credible in-world source, (2) real available context, (3) open-ended intent and honest choice, (4) independent NPC/beast/organisation conduct, (5) genuine engine-computed checks and costs without chosen dice, (6) meaningful world consequences and counterfactual refusal/failure paths, (7) persistence and replay-safe saved evidence, (8) player-known-only presentation, and (9) required disposable-save tests with the complete required private single-runner CI green. Narrative judgment stays with the GM; it is not claimed automatable.

**No invented restrictions:** no universal teacher fees, prerequisites, arbitrary cooldowns, fixed employment paths, compulsory partners, guaranteed bargains or scripted rewards. A specific consequence must arise from the actual world, a source mechanic or an established fictional fact. The mechanical actions built so far are examples, not an exhaustive list of valid player actions.

**No invented progression:** no making up rank, mastery, forms, beast consent, currency, rare loot, species knowledge or combat rolls when an executable source procedure or evidence is unavailable.

## Current foundation evidence reconciliation — 7 November 2026

**Finish Line A is not complete.** The 108 source-registered tests on last verified merged main PR #138 ran green, but this is a bounded engine suite, not proof of all 57 original canon sections. The actual private runner round-trip was attempted on a strictly separate disposable campaign: GitHub Actions run **42405401477** failed before any job step and created no result file. Do not claim live private checkpoint delivery is proven or attempt in-world narration from that status request. Aerin remains untouched.

Modern working source-backed resource work is wider than the oldest milestones below: native marsh reed **and** ironbloom gathering/returning, limited actual provisioner trade and optional person handoff, atomic inventory flow, original poultice at **both** Morrowfen Crossing infirmary and Lumenfall Annex clinic, and real bounded physical prototype build/repair all share earlier foundations. These are examples, not a complete universal manufacturing economy or a mandatory route through any one institution.

**Priority order now:** A1 open player intent resolved honestly through the existing GM+verified action pipeline; A2 genuinely contextual NPC dialogue and witnessed commitments; A3 private Actions end-to-end save/continue smoke verification (currently blocked before runner steps); A4 removal of demonstrable artificial hours/authority overlaps; A5 evidence reconciliation. Follow [the dated foundation audit](FOUNDATION_COMPLETENESS_AUDIT_2026-11-07.md), not earlier recommendations to add another supplier or material mini-game. PR #140 has provisional A1/A2/A4 code that **must not be called verified or merged** until the required run executes successfully. Complete cosmology, later cultivation stages, law, economy and species-scale simulation remain Finish Line B goals, not excuses to block normal mundane play.

## Connected implementation streams

1. **Cosmology, geography, causal history and living world (1–5, 11, 34, 44, 55):** strengthen existing seeded world and time ticks into local travel, known seasonal conditions, credible movement, independent news and measurable societal change. Avoid player-driven world creation by looking at a notice.
2. **Independent beasts and partnerships (6–16, 43):** ecological individual and family life, species-informed behavior, sapient societies and languages, noncoercive welfare, earned technique and evolution, rights and contract remedies.
3. **Human cultivation and transformation (17–31, 48):** complete each distinct independent discipline and stages beyond the first; keep human evolution separate from power ranks; implement trait physiological consequences, reversible and irreversible forms, injury/cost/recovery, no beast ownership prerequisite.
4. **Civil society and professional life (32–39, 42, 47):** autonomous individuals, real employers and budgets, bounded wages from legitimate currency accounts, public and private agreements, civic law, qualifications, dynamic petitions, diverse opportunities and consequences.
5. **Freeform play and consequences (40–41, 45–50):** scene-grounded natural intent, environmental interactions, contested tactics, movement, lawful craft/medical care, provenance-bound materials, risk and failure, no arbitrary menus.
6. **Continuity and presentation (51–54, 56–57):** credible player knowledge, dated relationships/promises, editable but audited checkpoints, concise boxed scenes, tests that keep data from one campaign out of another.

## Working integration spine

**Independent changing world → source-backed scene and information → player's unconstrained intent → NPC/beast independent decision → genuine engine resolution → timed world tick → dated witnessed consequence → safe checkpoint → relevant player-known display.**

This programme is measured by evidence and useful play, not by PR count or a fictitious completion percentage. Changes must be grouped into coherent PRs; full test/merge in the same pass when the fresh workflow allows it. Never touch current campaign saves during engine development.

## Playable open-country shelter and genuine overnight world ticks

A player can now search actual forest, fen and upland terrain for a resting site through a meaningful honest Survival check, in response to the local geography and saved weather. Success creates a temporary source-hashed campsite that can support genuine full-night rest; failed searches spend real time and effort, not an invented safety guarantee. Ordinary dialogue-level campsite inspection remains a free, player-known query. Independently simulated sixday/month ticks now continue when sleep crosses midnight, rather than freezing the world. This is a bounded playable §§5,11,44–45,49,51 integration; advanced weather, camp construction and rift hazards remain distinct gaps. See docs/PLAYABLE_WILDERNESS_SHELTER.md.

## New milestone — source-verified Soul Perception of living people

Phase I Soul Perception (§22) now supports a genuinely present recently met person in addition to one's own spirit and independently encountered beasts. Source-verified physical conversation, independent NPC availability and genuine d20 / Soul Reserve resolution prevent unseen-person creation or mindreading. This is the **existing distinct Soul discipline**, not another universal power meter or artificial calendar gate. See `docs/SOUL_PHASE_ONE_LIVING_PERSON_SENSE.md`.

## Autonomous guild crews: actual later fieldwork and habitat consequences

A legitimate issued report can now lead to a funded, separately scheduled Naturalists field visit on a **later** world sixday. The same original source-backed guild inbox authorises one small resource expenditure, and an independently resolved crew can find the site already recovered, be cancelled, fail to stabilise it or complete a modest measured intervention. Real local ecological pressure and habitat quality may change by one unit each when a crew actually succeeds, never through simply reading or submitting a bulletin. Later news travels through established release rules and does not reveal private plans. See `docs/INDEPENDENT_GUILD_FIELDWORK.md`. This is bounded progress in §§5, 11, 35, 44 and 47, not full ecological engineering, finance or employment.

## Crafting is governed by actual supplies, not arbitrary daily attempts

The source-backed Lumenfall poultice now permits repeat **new** crafting batches on the same day if the character actually has additional reagents, stamina, a clean workspace and time. Every d20, consumption and outcome remains genuine, preserved in a new append-only attempt history without deleting earlier daily checkpoint entries. This corrects an artificial one-attempt-per-day gate while retaining the fixed prototype recipe as one example of the far larger §50 crafting world. See `docs/CRAFTING_WITH_REAL_SUPPLIES.md`.

## Playable fieldwork-to-medicine journey

A fully connected ordinary chat path now connects personally witnessed open-habitat observation → the one precommitted honest Survival check → sustainable local common reed harvesting with real pressure → existing Lumenfall laboratory poultice crafting with source ingredients and a separate genuine Crafting check. Natural phrases do not grant loot, choose dice, bypass expiry, invent a recipe, or hide the actual resource consumption. This is a bounded playable §§11,35,44–45,49–50,51 improvement, *not* a complete crafting/economy or resource-provenance solution. See `docs/FIELDWORK_TO_MEDICINE_JOURNEY.md`.

## World-origin opportunities and autonomous guild follow-up

The Naturalists Guild now publishes ecological fieldwork independently from actual world creation and sixday ticks; board-reading is **learning about** existing requests, not creating them. Original survey signs and the actual d20 result survive narrative-log rotation as hash-verified evidence. Filing submits a real report to the guild's offscreen inbox; a later independent world tick may allocate actual abstract staff/funds to a follow-up inspection if the report is interpretable, ecology warrants it and the active institution can afford it. These are limited connected §§5, 11, 35, 44–45, 47 and 51 foundations, not guaranteed cash, repairs, contracts or a complete quest system. See `docs/INDEPENDENT_GUILD_FIELDWORK.md`.

## New milestone — earned Body I force expressed in physical combat

A genuine, independently earned Muscle-Tendon Cycle I can now apply its previously established **M1 natural force** through source-verified Strength-based mundane attacks in real wound combat. Its effect is bounded by actual physique, existing item magnitude and one honest attack roll. Invalid body-stage claims grant no extra force and do not block ordinary weapon actions. This connects §§23, 29, 45–46 without creating new powers, teachers, universal delays or higher Body cycles. See `docs/BODY_CYCLE_ONE_PHYSICAL_FORCE.md`.

## New milestone — earned Second Circle used in real combat

An actual Second Arcane Circle can now coordinate the two **separately learned** formulas Ward and Spark in one real wound-model exchange with two honest casting checks, combined Mana cost, original one-minute Ward expiry and the independently committed opponent plan. Durable original study evidence survives bounded narrative-log rotation for newly earned techniques. This is one bounded playable path from §§21, 45–46 and 51, **not** full advanced magic or a requirement to join a school. See `docs/ARCANE_SECOND_CIRCLE_DUAL_COMBAT.md`.

## Current milestone: source-backed public field opportunities (Master Prompt §§5, 11, 33, 35, 41, 44–45, 47, 51, 54)

The first `rules/public-field-opportunities.js` route connects existing independently simulated Copperwood and Whisperfen conditions to an actual Naturalists Guild bulletin at its real Morrowfen Crossing registrar. It supports personally witnessed public requests, optional following/ignoring, finite world-time windows, original genuine field survey reports (including inconclusive results), replay-proof single filing and **no fabricated prizes**. Reading and filing cost actual time. The world can change and old requests expire even when ignored. This is **not** a universal quest issuer, contract/reputation system, institutional payroll or a guarantee of agreement. The full §47 and §35 remain partial until real diverse stakeholders and funded opportunities exist.

## Authoritative section ledger — baseline, not a claim of completion

These are the existing manifest's pre-existing implementation labels, *not percentages* or newly inferred full parity. A section is open until its remaining gap has been closed with verification.

| § | Master Prompt subject | Current manifest classification | Outstanding gap |
|---:|---|---|---|
| 1 | The premise: a civilisation shaped by beastkind | partial | Magical ecology, beast citizens and everyday crafts have examples, but not scene-complete society. |
| 2 | World scale and geography | partial | Six continents and 29 biomes exist; detailed travel times, settlements and logistics are incomplete. |
| 3 | Cosmology and planes | partial | Realm teachings exist; actual planar law, divine limits, afterlife and entry rules are not implemented. |
| 4 | History and historical causality | partial | Source-dated rulers, competing archives, historical events and relic provenance incomplete. |
| 5 | World state and simulation | coarse tested | Sixday/month state is deterministic and persistent; not a simulation of individual citizens or armies. |
| 6 | A bestiary capable of supporting hundreds of thousands of species | procedural foundation | Hundreds of thousands of addressable slots are not authored species histories or automatically safe encounter profiles. |
| 7 | Individual beast records | partial | Individual partner records exist; anatomy, ecology, sapience and wound models differ among records. |
| 8 | Beast grades, levels and potential | partial | Level/grade/potential have separate fields; species-specific caps and progression not generally completed. |
| 9 | Beast abilities and techniques | partial | Spell/Qi cost calculators work; verified ability/technique catalogues, learning and cooldowns incomplete. |
| 10 | Beast evolution | tested event, partial ecosystem | Pre-authored evolution form is now mandatory for actual success; branching research, biological consequences and downstream ecology still need per-species content. |
| 11 | Beast ecology | coarse tested | Habitat and migration modeled regionally, not detailed trophic/reproductive individual histories. |
| 12 | Beast intelligence and society | partial | Rights and nonhuman polities are modeled; individual cultures/languages and autonomous beast courts not fully enacted. |
| 13 | Taming is not one universal process | partial | Voluntary consent/approach gates exist; diverse species-specific taming social protocols incomplete. |
| 14 | Bond mechanics | tested foundation | Many bond dimensions, events and fractures work; persistent long-term behavioral agency still GM-led. |
| 15 | Contracts and rights | partial | Consent/load safeguards implemented; contracts, rights enforcement, case law and remedies still partial. |
| 16 | Partnership and synchronisation | partial | Ten-stage numeric readiness and consent are modeled; all joint techniques, feedback and true shared evolution are not. |
| 17 | Humans are evolving supernatural organisms | partial | Human abilities, evolution, mastery and traits now explicitly separated; full transformation not operational. |
| 18 | Shared supernatural origin: the Origin Pattern | conceptual only | Shared Origin Pattern is canonical but has no complete biological simulation across humans and species. |
| 19 | Power-system architecture | early routes tested | No universal power ladder; early path milestones executable; multidiscipline interference beyond first stages remains open. |
| 20 | Meridian Cultivation and Meridian Evolution | early progression tested | Foundation/Awakening/Gate 1–108 practice scaffolding; Stage IV–IX breakthrough rites and many deviation treatments incomplete. |
| 21 | Arcane Circle Architecture | early progression tested | Core seeding and First Circle rites distinguish capacity and geometry; Circles II–IX construction and spell learning incomplete. |
| 22 | Soul Cultivation and Soul Engineering | first phase tested | First Soul Perception rite works; Phase II–VII and Soul Engineering ethics/mechanics incomplete. |
| 23 | Body Refinement and Physique Evolution | first cycle tested | Muscle-Tendon first cycle works; later tissue/organ cycles and injury trade-offs need source-specific rules. |
| 24 | Beast-Origin and Lineage Arts | calculators only | Integration load and rejection DC formulas exist; full eight-phase trait integration with safeguards not available in private runner. |
| 25 | Rift Practice | first step tested | Rift Sense training works; anchors, spatial transit and domain effects are not tested systems. |
| 26 | Specialist disciplines | partial | Craft, research, and distinct professions exist; not all specialist techniques and tools are executable. |
| 27 | Sacred and divine traditions | world lore only | Cultures and shrines exist; divine beings and binding blessing limits are not mechanically verified. |
| 28 | Human evolutionary stages | stage ledger only | Human evolution is distinct from discipline ranks but individual transformation crises/effects are not operational. |
| 29 | Human attributes and multidimensional potential | seeded profile tested | Four detailed current capability domains and sealed independent potential dimensions; deeper clinical protocols and earned change remain partial. |
| 30 | Human evolutionary forms and transformation | not implemented | No unified duration/cost/injury/reversion pipeline for physical human transformation states. |
| 31 | Independent humanity and beast-rejecting philosophies | narrative and social | Independent secular/anti-beast philosophy exists in lore; full career equivalence and legal conflict not complete. |
| 32 | Beast-related professions | partial | Professions represented; full qualifications, wages, apprenticeships and competency proofs missing. |
| 33 | Guilds, academies, sects and organisations | regional simulation | 48 institutions with changing conditions, not complete curricula, access decisions or NPC leadership. |
| 34 | Kingdoms, empires and noble families | coarse simulation | 24 states and diplomacy/clocks; real military logistics, dynastic genealogy and peace-process logic missing. |
| 35 | Economy and resource systems | partial | Regional indices and Scales ledger work; household property, contracts, individual prices and trade credit missing. |
| 36 | Laws and social systems | partial | Regional rights and consent rules; procedural court trials and punishments unavailable. |
| 37 | Competition culture | prototype | Events and contests exist in legacy prototype; judges, calendar and promotion/licence systems incomplete. |
| 38 | Separate ranking systems | partial | Independent score registers and Concord arithmetic; full qualification and ranking governance partial. |
| 39 | The player is a person, not the centre of the world | GM-led | Player freedom/civic presence are narration rules; NPC motivations not inferred mechanically. |
| 40 | Character creation | tested independent start | Seeded male starts, backgrounds, family and date; universal demographic variability and examinations incomplete. |
| 41 | Natural language and player personality | GM-led | Natural language actions require careful interpretation; no autonomous prose engine can validate every choice. |
| 42 | NPC individuality | partial | Autonomous professional progression and agendas; full long-term personal goals and dialogue memory partial. |
| 43 | Beast personalities and communication | partial | Sapience/consent and bonds exist; full autonomous language/culture and beast interaction history incomplete. |
| 44 | Time and daily life | tested calendar | World ticks and public calendar work; day-to-day occupations/travel schedules remain scene-dependent. |
| 45 | Actions and resolution | tested check core | d20 degrees, natural adjustments and skill rank work; GM still decides feasibility and contextual DC. |
| 46 | Combat | partial combat | Wounds, Ward and contested exchange tested; movement, spell legality, terrain and complete tactics partial. |
| 47 | Quests, contracts and opportunities | partial | A source-backed Naturalists Guild public fieldwork bulletin is now executable with genuine regional ecology, witnessed surveys, filing, expiry and optional player interest; diverse independent issuers, employer-funded rewards, negotiations, deadlines with off-screen stakeholder decisions and many other opportunity types remain unimplemented. |
| 48 | Training and progression | early paths tested | Training tracks and first power milestones now verified; specialisations, later paths and population careers partial. |
| 49 | Injuries, health and recovery | tested wound core | Wound recovery and migrating legacy health validated; surgery/critical lasting injuries incomplete. |
| 50 | Inventory, equipment and crafting | partial | Spending and inventory exist; gear provenance, provenance-bound crafting/artefact failure incomplete. |
| 51 | Continuity ledger | tested save protocol | Turn IDs, journal/pickup work; detailed conversational knowledge and every ongoing agreement not automated. |
| 52 | Status interface | presentation tested | Compact player-known display; UI is client-authored, engine cannot guarantee animation/rendering across platforms. |
| 53 | Narrative style | GM-led | Naturalistic prose is a human-facing GM rule, not mechanistically testable. |
| 54 | Player freedom | GM-led | Freeform choice and no forced menus enforced narratively, not by simulated-world AI. |
| 55 | Build the world before beginning | partial | Atlas/world generated prior to play but many local settlements, mysteries and citizens not authored. |
| 56 | Character creation and opening | tested start | Independent seeded campaign, scene, date, companion/family possible; professional power enrolment not fully integrated. |
| 57 | Final governing principles | GM governance | Final governing principles require ongoing human GM judgement and truthful incomplete declarations. |

## Testing and merge policy

The entire 97-file regression inventory remains mandatory; add focused source-backed tests to existing relevant suites. Exercise disposal saves only, including failure and replay. Merge after fresh passing checks, verify the merged modules on `main`, and identify remaining gaps honestly.
