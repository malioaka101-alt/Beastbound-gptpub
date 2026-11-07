# Open-ended world entities: existing names are seeds, never the full population

## Principle

Beastbound's 28 original regional household examples, 48 background professionals, 24 known polities and 48 initial institutions are **starting records**, not a claim that these are the only people, families, clans, sects, workshops, schools, guilds, kin-councils or organisations that may ever exist. The Master Prompt and the [Living World Change Charter](LIVING_WORLD_CHANGE_CHARTER.md) demand a growing, evolving world whose actors can form, change, compete, decline and disappear on credible historical grounds. **Do not prepopulate every person or permanently constrain the world to what the initial prototype knows.**

The new `world/emergent-groups.js` demonstrates a shared *runtime registry and source-evidence contract*. Its stored entries are **world state in the campaign save**, not new hard-coded atlas constants. `world/social-houses.js` now offers `catalog(w)` and `lookup(w,id)` that return both the familiar 28 starting charters and additional actually recorded world entities. Other systems must use the same idea for later individuals, families, businesses, places, powers, institutions and polity histories: **source-grounded registration, stable IDs, type-appropriate components, independent time updates, and public visibility only as actually warranted**. A group should not need to be inserted into source-code arrays just to be allowed to exist.

The *GM* can portray plausible unnamed/unrecorded people and family groups freely in scenes, subject to established world facts; the engine must not falsely claim mechanical recognition, membership, supernatural capabilities or accomplishments until witnessed and saved. Incomplete engineering is never a rule that the world **cannot** contain such entities.

## What is implemented now

### 1. A player can found a group in their own words, without special birth

`social.formGroup({name,kind,purpose})` creates a **self-declared informal organisation** with freeform name, kind and purpose at the real player's current location. The kind is not a short list of approved categories. It could describe an ordinary family circle, kin community, trade guild, travelling school, scholarly association, new clan venture, or something other than these examples.

- One actual witnessed, consenting **founder** is recorded: the player. Other people's consent, relatives, marriages, members, bloodline abilities, titles, lands, patents and government approval are **not presumed**.
- This action takes **25 genuine minutes**, requires no mandatory school, tutor, wealthy patron, guild fee, noble surname or formal civil registry, and can cross midnight with normal world time passage.
- The organisation is *informal/self-declared*. A player may describe political aspirations, but saying "royal house" or "great clan" in a name does not confer those legal positions.
- The exact declaration and founding identity, location and date are preserved as an original event witness with a source-binding hash, even when the player log later trims older unrelated messages.
- The founder can initiate `social.groupContribute({groupId,activity,coins?})` using their own words and **45 genuine minutes**. Monetary contribution is **optional**, deducted from existing actual character funds only when chosen. The attempted work is remembered as attempted, **not automatically a completed invention, new follower, law, class, building or legal title**. On later real monthly world ticks, bounded independent circumstances may verify a modest local service result, or the effort may fail. The association persists, can become inactive if neglected and can re-engage. A group's existence and history are not removed merely because the world stops paying its maintenance.
- `social.groupsStatus({})` is strictly **read-only** and shows groups in the current region that are actually known or publicly announced, and the founder's own local group even before notice publication. A local public notice takes two in-world days to circulate. `social.status` also includes dynamic local publicly known charters as well as original households.

### 2. NPC-founded organisations enter exactly the same registry

The previously implemented independent vocational research system can actually create funded breakaway teaching circles when an existing named professional completes multiple successful trials, real workers voluntarily transfer and actual dues are raised. On the same real **world-month tick**, `emergent-groups` checks this original **verified historical worker transfer** and registers the new group in the shared living registry. No extra family, bloodline, wealth, members or professional success is invented by the registry. The vocational group's **actual members and funds remain owned by its original independent institution ledger**; the registry **references**, not duplicates, them.

An NPC-funded workshop may therefore show up in the same public local organisation discovery as older families, while still functioning as a workers' collective rather than suddenly having a noble elder, an invented heir or a second imaginary relative. It can continue rising, losing members, suspending operations and recovering according to the original vocational simulation. A newly created freeform player association has its own modest independent service/funding lifecycle. These are examples of **different components on the same registry**, not a one-size-fits-all "family class".

### 3. Genuine local social interaction stays possible

The original 28 charters remain unchanged. Where the game's existing Morrowfen public correspondence channel is physically present, a newly announced group may be consulted and approached as a public association. Its self-declared origin is identified accurately; the registry does **not** pretend its members have proven genealogy, that its founding claim has been licensed by the Crown, or that a private audience was approved.

A one-person founding is not automatically forced through the older family subsystem's **two-person, consent-based household deliberation logic**. That deliberately remains reserved for two genuinely named, consenting individuals until new members can be proved. World systems should support optional components instead of inventing the extra people necessary to fill an array.

## Pluggable source and individual consent adapters for future entities

The foundation also exports **trusted server-side adapters**, intentionally *not* unrestricted player requests:

- `registerOriginAdapter(origin, verifier)` and `registerFromEvidence(world, data)` let a later genuinely authored NPC, adoption, research, migration or political event found a **new type of entity** without changing an exhaustive set of charter IDs or allowed founding origins. A separately registered verifier must check that event's actual witness, founder and any claimed consenting members; **unknown origins fail closed**.
- `registerMemberConsentAdapter(origin, verifier)` and `admitMemberFromEvidence(world, groupId, personEvidence)` allow a group originally founded by one character to **gain separately verified people later**. The original founder is not permanently forced to remain solitary, and people cannot be named as a member merely because a player claims they joined. The adapter verifies the actual independent person's consent before member records and counts change.
- These two interfaces are **backend hooks for future independently implemented scene/relationship modules**, not currently a public NPC-invitation dialog, legal adoption ruling or proof that an unobserved person has agreed. The regression uses disposable source-witness fixtures to demonstrate extensibility; it does not announce new fictional NPC relationships in a live campaign.

The registry is open to many kinds of social and institutional origins but deliberately never accepts evidence-free extra heirs, automatic ancestry, free supernatural powers or public government authority. Individual organisations may have their own lifecycle adapters; not every entity is required to be a two-person aristocratic family.

## What must remain open for future implementation

This patch is **a foundation, not a completed general ontology of Beastbound**. In particular, it still needs:

- Source-grounded **individual member invitations and independent acceptance/refusal**, with relationships that may later become family, chosen kin, professional partnerships or none of those. Do not require every family to have precisely two people. An organisation could have one, a household of twelve, several branches or hundreds of staff, without every anonymous worker being a named relative.
- An extensible **person, ancestry, residence, discovery and life-event registry**. People may be born, travel, be adopted, found new lineages, split from a clan, or be known publicly only when encountered; no compulsory prefabricated kin list.
- An extensible **legal body and property system**. Forming a self-declared club is different from owning land, applying for business recognition, inheriting estates, becoming an officially acknowledged house or taking political office. The relevant laws and consent differ by culture and polity; there must be *multiple possible paths* rather than a generic mandatory guild fee or teacher.
- General **institution and faction systems** capable of receiving new societies, research organisations, trade companies, temples, sects, political councils and future polities without copying a static archetype. They need resource, participation, governance, opposition and independent progression/decline components that suit their actual structure.
- Similar registries for **novel techniques, magic, beast cultures, species, settlements, evolving power paths and discoveries**. New advances must have meaningful source/evidence, limits, costs and safety; don't pretend formulas for a prototype's first named spells exhaust all future possibilities.

**The world is bigger than any list.** Content should often be authored during play as events warrant, not all generated at campaign creation. The prototype's limitations should be documented as implementation gaps, never turned into arbitrary fictional prohibitions.

## Evidence and safe saving

`tests/emergent-groups.test.js` verifies open-ended freeform group kinds, accurate founding claims, no phantom relatives, optional and actual money/time expenditure, real later independent outcomes, name and stable-ID persistence after log trimming, NPC worker circles entering the same public index, preserved canonical houses, real Morrowfen public enquiries, provenance-tampering refusal, no automatic magic/nobility and idempotent private file-backed chat operations. The mandatory full engine suite still runs. **No live campaign save is edited**.
