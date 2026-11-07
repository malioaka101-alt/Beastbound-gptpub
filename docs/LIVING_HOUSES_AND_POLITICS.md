# Beastbound social fabric — households, clans, great houses and kingdoms (first playable layer)

**Later verified governance correction:** `world/government-offices.js` authors **24 named public officeholders with different actual constitutional processes**. `world.governmentStatus` exposes the current local public office without leaking hidden world numbers. The old engine's mechanical announcement of a succession every 180 months was **not a real succession** and has been replaced by a legally cautious court review retaining the same monarch. Council/republic/appointed mandate outcomes can actually replace or retain an officeholder, with independently recorded date and public notice. A house elder does not inherit the sovereign role simply because of their surname, and no royal ability or legitimacy is a character power-system rank. Read `docs/PUBLIC_GOVERNMENT_AND_SUCCESSION.md` for original versus newly authored canon and remaining limitations.


**Later positive civic recognition route:** A family can also respond to an actual ecological service record, not just an unsourced public letter. The engine now accepts `social.submitReport({houseId,checkId})` only for a genuinely completed, successful `world.habitatSurvey` / `core.check` whose source-hashed event and exact location genuinely align with a local household's public duties. After an actual sixday, the family may accept or decline the report independently; a later on-site `social.collect` can award **+1 earned civic regard**, capped at 4 per family, and **never** nobility, kinship, training or a special bloodline. See `docs/FAMILY_CIVIC_RECOGNITION.md`.


## Canon versus new regional world authoring

The **original Unified Master Prompt** §1, §4–5, §§12 and 24, §§32–36 and §§39, 42, 44, 47, 54–57 establishes that Beastbound must be a large, independent civilisation: multiple countries and social hierarchies, ordinary families, noble and merchant houses, great clans, orders, kingdoms, commoners and nonhuman citizens. Ruling families can have inheritance, lawful privileges, inherited constitutions and beast-lineage histories, but **an inherited name is not a confirmed activated power**. Officials, families, sects, states, guilds and individuals hold distinct authority; player choice never guarantees consent, titles, teachers, marriages or inheritance.

**Previous coded canon:** `world/atlas.js` already contains **24 independent polities**, their different governments (monarchies, republics, confederations, sultanate, nonhuman nations), 48 institutions, and 6 immediately reachable regional locations, all originally authored for the broader Beastbound atlas. `world/simulation.js` tracks their regional prosperity, legitimacy, diplomatic relations, politics and economy. The Master Prompt establishes the *required structures* but not every specific state or surname. **Do not mistake new authored names for passages verbatim in the Master Prompt.** Historical family names of Jory's unrelated campaign are not imported into Aerin's world.

**This expansion newly authors 28 households across all 24 existing polities** in `world/social-houses.js`, anchored to their actual established languages, geography, governments, rights and economy. Four are *local Reedmarch* families. Others include a court dynasty in Asterwyn, a princely line in Sunforge, nonhuman reef and Old Tracks kin, a self-governing community federation, merchant families, specialist research families and independent highland households. These are **not all hereditary nobles**.

Each house has its own public elder, separately identified related or chosen-kin person, the exact relation, livelihood and social authority, public duty, material dispute, a family or learned tradition, and explicit constraints on office/membership. Their claimed special constitutions are **public traditions or rumours**, not confirmed Origin Pattern expression, a free bloodline, a new technique or innate right to bond intelligent beasts. A player may belong to an ordinary family and acquire public standing by actions; they are **not** silently assigned aristocratic descent or an outstanding inheritance. Kinship, invitation, a legal office, economic influence and supernatural awakening are deliberately separate records.

## Diverse real-world relationships

- A public elder may handle money without a hereditary council vote. A ruler may be appointed, elected, crowned or contested under the nation's **actual** political institutions.
- A great house may have retainers, estate privileges and old oaths, but owes help when floods damage the river, faces an independent succession issue, and might refuse an outsider's advances.
- A clan may be a working rescue network or a kin federation, not necessarily a martial secret society. Family members can disagree and pursue individual careers, including ordinary trade and medicine.
- Beast polities and intelligent beast families retain autonomy and lawful consent; no human marriage, contract, child or lineage is assumed to create ownership.
- Academies and clans can offer tutelage in return for money, reciprocal service, sponsorship, goodwill, or genuine knowledge, **not mandatory universal tuition or a ranked class lock**.

## What is mechanically live now

The new autonomous house state is seeded inside `table.realm.houses` (when a realm is already loaded or newly created). **Each actual world month**, all 28 house influence and public-pressure records respond to the host polity's real stability and treasury. Each four-month interval, a household makes a modest public announcement about its **already-authored** civic obligation. This uses the same real off-screen calendar and public-news ledger as the pre-existing world. No hidden dynastic marriage, new heir, automatic revolution, always-friendly clan, unearned magical awakening, council appointment or family wealth transfer happens from those clocks.

At **Morrowfen Crossing**, during the actual Guild registrar's daytime hours, the player can inspect a known local public household charter with `social.inquire({houseId:"fenwake"})`. This consumes **15 real minutes**, records a source-hashed public charter witness and reveals specific public kin names, roles, dispute and heritage claims. One charter examination per day per house; the local first supported site is the existing Guild registrar, not a conjured noble court.

After an actual charter inquiry, `social.request({houseId:"fenwake",purpose:"offer_service"})` takes **12 real minutes** to register one letter with the guild. Other supported intents are `request_history` and `request_audience`; these are legal categories, not a limit on what the player may *say* naturally in conversation. The caller cannot author a reply, claim a familial relationship, choose a noble title, set a lucky die or invent a hidden manual. The **independent household** responds only after the next genuine sixday world clock (or later, depending on actual campaign scheduling). The household's circumstances and the independent world RNG influence its reply: polite refusal, public records guidance, request for verifiable work, or a direction to ordinary civic hearings. **None of these is a promised private audience or family induction.** The reply is held at the registrar's office; it cannot be read remotely in a wilderness scene. `social.collect({letterId})` requires a later real in-person eight-minute pickup. This gives the character genuine independent social contacts, without a railroaded quest.

`social.status({})` is **read-only**. It reveals existing local publicly posted house names, the player's *already recorded* ordinary family background (if present), the houses whose charters they really read, and correspondence they've actually sent/collected. Hidden internal family statistics, rival budgets, unpublished plans and replies the player has not yet collected remain undisclosed. The social ledger does **not** rewrite the real campaign's `player.family` field. There is no assumption the player is related to the first named house sharing their surname.

### Example request sequence

```json
{"id":"house_profile_0001","mode":"rule","system":"social","operation":"status","params":{}}
{"id":"house_read_0001","mode":"rule","system":"social","operation":"inquire","params":{"houseId":"reedward"}}
{"id":"house_letter_0001","mode":"rule","system":"social","operation":"request","params":{"houseId":"reedward","purpose":"offer_service"}}
```

After the world has really advanced to an appropriate sixday, revisit Morrowfen Crossing during the registrar's daytime hours:

```json
{"id":"house_mail_0001","mode":"rule","system":"social","operation":"collect","params":{"letterId":"<actual-issued-letter-id>"}}
```

This is an **initial local playable vertical slice**, not the whole civilisation. The player is free to refuse the contact, investigate distant clans, serve a rival council, pursue commoner careers, start an independent family, make friends, marry consenting adults or build a house in the future. Those paths are not automatically mechanically completed by this first implementation.

## Inspiration, not copied canon

The user's suggestion to consider anime, manhwa and fantasy tropes is valuable for **structural inspiration**: Murim and xianxia stories commonly use sects, martial clans, family styles, contested inheritance, apprenticeships and independent cultivation; fantasy court and romance-fantasy stories often use rival houses, succession disputes, family obligations, diplomacy and political marriage. Kin networks may share property, institutions and ritual responsibilities; this also has documented real historical counterparts. Beastbound should use those broad patterns to build original, plural cultures and freely acting characters—not import a manga's cast, copy its named special bloodlines, or force every person into a universal rank/sect ladder.

Useful external **research context** (these are not Beastbound canon): Oxford's *Family and Lineage in Late Imperial China* (https://academic.oup.com/edited-volume/61799/chapter-abstract/546311371) for lineages and shared obligations; Morgan Yu Hao's 2026 *Cultivation games and cosmotechnics* (https://journals.sagepub.com/doi/10.1177/20594364251364733) for genre frameworks; and the *Manhwa Tropes Explained* overview (https://comistitch.com/blog/manhwa-tropes-explained/) for the Murim and sect vocabulary. The original local world remains authored by Beastbound rather than copied from any of these.

## Next major social features

1. **Families as actual households:** multiple independent individuals, ageing, births/adoptions/deaths, realistic guardian and family records, property and consensual unions; inheritance disputes where law and kinship permit, not automatic player entitlement.
2. **Social agency and opportunities:** live careers/qualification, guild and sect applications with independently decided accept/decline conditions, paid/bartered/voluntary teaching, actual public hearings, favours, contracts, obligations and lasting relationships; prevent spammy reputation farming.
3. **Dynastic history and politics:** named ruling officials and genuine succession procedures linked to the 24 different governments, courts, trade networks, war, taxation, alliances, treaties and changing legitimacy.
4. **Special families and beast lineages:** clinical evidence, hereditary dormancy, compatibility, exceptional constitutions and extraordinary costs with *no automatic named-family buff*; intelligent beast kin/polities with equal agency and rights.
5. **Exposure and knowledge:** rumours, archives, journalism, personal experience and private family secrets need separate provenance; no reveal of world-secret plots in a public status panel.

Regression suite: `tests/social-houses.test.js` verifies all 24 country associations and 28 individually documented households, independent changing sixday/monthly state, legal citizen correspondence, delayed non-guaranteed reply, knowledge visibility, no invented fame/relationship/lineage, save idempotence and protected action inputs. No active campaign save is changed.
