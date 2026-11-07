# Voluntary civilian work and player-earned assistance — first connected foundation

**Source:** Unified Master Prompt §§31–32, 35, 39, 42, 44–45, 47–48; Beastbound Table Rules §§3.2–3.8. These require meaningful ordinary life, independent professions, individual consent, real time, honest skill checks and persistent consequences. An NPC's profession, known location or job title alone does not create a contract.

## Verified scene path

An actually present, independently generated civilian may be asked for practical assistance through `social.assistLocalPersonWork({npcId})` or a natural-language turn such as `help <present name> with work`, `assist <present name> with work`, or `work alongside <present name>`. The individual must have an independently scheduled current local shift. Their personal RNG, existing fatigue and temperament decide whether to accept; **a player cannot supply acceptance, wages, task success or dice**.

A refusal takes five actual minutes, is remembered, and creates no check or relationship reward. On agreement, the player spends 40 minutes and four actual Stamina on an appropriate ordinary task. The player makes one genuine check using their own Wisdom/Survival, Charisma/Diplomacy or Intelligence/Crafting, depending on the actual independently established practical need and current local ecological/civic difficulty. Their result grants bounded earned Practice Points through the **existing** PP ledger, not a duplicate XP or new guild rank.

The other person still resolves their own profession through `world/person-careers.js`, with independent personal aptitude, career history and RNG. Successfully completed player support grants at most +2 to that person's **one genuine** work attempt. A failed support check cannot invent competence, and neither person is compelled to succeed. Actual work may incrementally affect ecological pressure, habitat quality or community conditions through the already existing career resolver. The source-linked cooperative work receipt preserves the helper's check-event hash, support degree, independent work receipt, individual origin and witnessed local shift.

No currency is minted. There is no authorised employer wage/price or signed employment contract in this route, and no unsolicited promotion, licence, magical technique, teacher, kinship or automatic relationship progression. This is **voluntary short-term practical cooperation**, not a universal employment system or a restriction on other natural-world jobs that require contextual GM adjudication.

Each individual shift's same help attempt is remembered so new turn IDs cannot repeatedly reroll the same offered task. That is not a universal mandatory cooldown or a claim the character cannot work at other opportunities. Only player-witnessed public outcomes appear through the read-only `social.assistedWorkStatus({npcId?})`. No private aptitude or unseen career state is exposed.

## What is and is not complete

This builds a connected path through local person presence → actor's independent consent → player check and genuine effort → independent NPC practical work → bounded real world impact → persistent player/NPC histories and safe checkpoint replay. It adds no new citizen roster or artificial teacher system. Civilian wages, contracts, negotiated rates, tool and material provenance, other employer types, joint large projects and full careers remain incomplete and must be implemented with actual witnesses before they can award resources.

`tests/emergent-careers.test.js` covers real generated civilian shifts, acceptance/refusal, forged parameter rejection, PP and Stamina, separate RNG streams, valid personal career receipts, no invented compensation, and disposable file-backed replay. The complete four-shard CI gate is required before merging. No campaign save is inspected or changed.
