# Individually persistent lives for newly generated starting relatives

**Foundation, 8 November 2026.** The source is the original Unified Master Prompt §§5, 34, 39–42, 44, 55–57, together with the current seeded campaign initializer and the existing independently evolving world.

A new character may have an ordinary family, an adopted/ward relationship, a distant historic-house birth branch, a famous family connection or no known named relatives at all. Family names are *personally known biographical evidence*, not a mechanism that creates cooperative NPCs, family magic, estates, legal titles, inheritance, instant access or guaranteed conversations.

## First integrated independent-life layer

- **Starting point:** after `scripts/new-campaign.js` has created the player's actual `player.family.members` and sourced homeland, `scripts/campaign-origins.js` attaches a separate world-owned register through `world/starting-kin.js`. Only a **new campaign** receives this register. Old saves never retroactively acquire invented named relatives.
- **Individual provenance:** each known relative has a distinct source-bound ID, name and relation, seed-independent personal RNG, original home region, personally held ordinary working funds, a limited private focus and an append-only hash-linked history of actual choices. No record is automatically an heir, government officer, teacher, current student or bonded partner.
- **Independent life:** during *genuine monthly world ticks* each living individual makes a private economy- and ecology-contextual attempt: small paid livelihood activity, local provision setbacks, or occasionally a paid move to an authored **adjacent** region in the same polity. These are the relative's circumstances, not the player's loot, dice, skills, influence, status or travelling permissions.
- **No double decisions:** the register refuses repeated month processing and retains a bounded rolling source ledger, including original founding data, individual action receipts and later receipt hashes. Verification rejects falsely edited people or events; a saved/reloaded campaign continues from its actual last step.
- **Constrained disclosure:** `world.knownRelativesStatus` returns only earlier personally known names, relationships and last-established *historical* home. It does not disclose an unobserved current address, funds, personality, private decision, physical presence or willingness. Calling it is read-only, including through the chat turn processor.

## Honest limits

This is a **first autonomous family foundation**, not a claim that all relatives are fully physically embodied NPCs with dialogue, travel routes, professions and social schedules. Independent private changes should later be made discoverable through source-supported letters, witnessed meetings, independent offers and in-person consent—but **do not invent those channels merely because a family member exists**. Names are not proof of encounter; the present `world/person-presence.js` roster does not automatically schedule starting relatives. Their private monthly decisions do not cause the player to receive coins, advantages, rank or news.

No named elder or house figure in `world/social-houses.js` is duplicated by generating a new identity for that chartered historic person. A player-related birth branch remains an ordinary *other* person with a link to that charter; the historic house's existing independent elder/relative, duty funds and public decisions continue under `world/family-members.js`. This avoids an imagined noble family hierarchy overriding existing governance.

The original Master Prompt expects far deeper personhood: real motives, skills, fears, memories, loyalties, mistakes, schedules, rights, migration and social relationships. Future work should build lawful source-verified contact, work, correspondence and kin-related events around these persisted people, and should make family and organisation histories relevant to circumstances without faking prerogatives. It must retain open-ended backgrounds and player freedom.

No campaign has been launched for this development. The Aerin trial remains deleted. The full integration test works with disposable generated characters only.
