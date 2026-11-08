# Campaign initialisation: born into the same living world

**Foundation: 8 November 2026.** Source: original Beastbound Master Prompt §§39–41, 54–57, alongside the existing Atlas, renowned history, social houses, institutions, professional life, independent organisations and executable JavaScript engine. This is an **initialisation capability**, not a new universal power, profession or relationship ladder. The text RPG remains in private ChatGPT Project conversations; the GitHub source repository is public. **No campaign is active** and Aerin's ended trial is not imported.

## A beginning belongs to the world

A campaign begins **only when the player requests a new game**. The GM offers natural freeform creation or a complete random start, without demanding a lengthy questionnaire or a beast choice. A unique slug and a nonzero seed establish one new save, source record and opening; existing checkpoints are never overwritten.

The existing scripts/new-campaign.js entry point now supports random and guided mode. Random mode varies name, gender, age, original regional upbringing, historical/social ties, ordinary background, early power interest and playable starting scene. Guided mode starts conservatively with an undecided path; the player can describe a name, occupation, birth region, goals, interests and family or institutional circumstances in their own words. Named supported overrides apply only to the dimensions they name. Options do **not** restrict what fiction can later be attempted.

The seeded history can include ordinary kin, a newly generated named working household, a genuine historical house or *renowned* junior branch, wardship or adoption, roots near an actual existing institution, a community-rooted or independent upbringing, or a new one-founder working association. These are examples of plausible lived backgrounds, **not the only kinds of people the GM can portray**.

Historic houses come from world/social-houses.js; famous associations are genuinely attested in world/renown-and-practice.js; regions, climates, civic rights, cultures and institutions come from world/atlas.js. New informal starting organisations use the **existing** world/emergent-groups.js ledger rather than a new fictional organisation database. The original engine still supplies attributes, supported mechanical preparation, actual partner records and the single world clock.

## No ancestry shortcuts

Descent, adoption, public reputation, legal office, current institution membership, restricted training, assessed physiology and personally earned powers remain different things. A random character **can be born into Openpeak, Marshglass, Starlens, Emberhand or another historic, renowned family** without automatically becoming the house head, inheriting magical affinity, learning a protected art, receiving an office or gaining treasury access. An extraordinary famous ancestor is not a player ability. A human is not biologically descended from a different nonhuman species, although a genuinely established ward or adoption is possible. Source-verified independent beast consent and individual cultivation remain necessary.

Named starting relatives now also have a **separate, individually seeded living-world ledger** under world/origin-relatives.js. Each individual keeps their own source-linked identity, ordinary resources, fatigue, independently chosen sixday activity, and occasional witnessed local visit. They are **not automatically physically present or willing to speak**. For relatives whose family homeland lies outside the six currently playable Reedmarch sites, the ledger remains persistent but does not conjure them into the player's opening scene or reveal private location or thoughts. A physically present relative can accept or decline a player-authored question; only responses supported by their own established family history, ordinary trade, observed weather or local routes can be stated as verified. Repeated questions do not reroll consent, and conversations award no money, tuition, techniques, affection or authority. Ordinary pre-game age and origin are not proof of adult status or special legal rights.

The player's read-only family status displays the names and relationship already known to the character and only personally witnessed conversation, never the separate relatives' savings, fatigue, private schedules or next decisions. The first version does not simulate fully resolved distant homes, marriages, inheritance trials or live family reunion travel; those remain future extensions with actual geography, individual autonomy and evidence.

Institutional upbringing may mean a former pupil, relative of an employee or nearby supplier; it does not mean current employment, admission or an automatically cooperative teacher.

A newly player-founded starting association is supported as a pre-game randomly assigned or chosen fact. It begins with **one actual founder**, zero guaranteed funds, no registered consenting members beyond the founder, no legal title and no inherited powers. The existing world group and house ledger records its local charter and persists it across saves. The player is never made to announce a founding during live play without actually choosing to.

## Geography, chronology and boundaries

The actual executable travel graph currently contains **six linked Reedmarch scenes**. A character may originate in any plausible authored continent, but a remote upbringing is **pre-game history**, not a teleportation route or a claim that distant services are physically accessible on turn one. The current playable scene must be a real supported Morrowfen, forest, fen, hills, Lumenfall or Riftglass site. Expanded continental travel remains a separate source-backed foundation task.

The opening civil date is anchored once and the new campaign's world tick count starts at zero. Character potential remains sealed until a genuine assessment. The distinct Meridian, Arcane, Soul, Body, Rift, Beast-Origin and partnership routes remain separate. Choosing an interest is not the same as earning a discipline stage. The existing limited consensual companion option, if selected or rolled, represents a particular pre-existing story and never coerces any other creature.

The native character panel exposes *player-known* homeland, family/organisation/institution context, occupational history, relatives and voluntarily provided goals. It never presents secret genealogy, future NPC decisions, unmeasured bloodline talents or fantasy trophies for a surname.

## Calling the existing initializer

The supported Node interface is scripts/new-campaign.js. Call its create function with a fresh seed, campaign slug, mode (random or guided) and any desired named choices. Its CLI remains exclusive-create:

    node scripts/new-campaign.js /path/to/new-save.json my_new_campaign [seed] [options.json]

If omitted, a cryptographic nonzero seed is generated and recorded. The optional JSON choices file can specify name, age, gender, pronouns, background, role, goal, path, homeRegion, startLocation, originKind, houseId, houseRelation, institutionId, groupName, groupKind or groupPurpose. All concrete historical references must resolve to existing Atlas/house/institution entries. The two supported nonhuman houses require an appropriately established ward or adoptive tie for a human, never biological descent.

Examples: a random renowned Openpeak birth branch; a guided shipwright raised in Kareth who begins at the established Morrowfen scene; or a newly declared one-founder local field-study association. Each is subject to the real engine's resource, NPC knowledge, travel, ecology and progression rules.

The regression suite verifies deterministic random and guided starts, varied regions and origins, famous house links, separately evolving named relatives, source-verified local presence and conversation memory, newly generated households, organisations recorded in the actual world, honest read-only panels, saved state continuity and rejection of unearned powers and invalid history. It does **not** claim full simulation of every distant family member, universal regional travel or the full 57-section Master Prompt parity.
