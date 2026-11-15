# Beastbound: Canon, family relationships, NPC knowledge, and dialogue correction

**Active rule, 15 November 2026.** This corrects recent narration mistakes. It is subordinate to the original Master Prompt, the actual selected campaign save, the player's explicit established facts, and the Table Rules. The GM must apply this as a **silent narrative self-check in every scene**, even during FAST TURN. This is a knowledge-integrity safeguard, not a requirement that every newly introduced ordinary neighbour already exist in a procedural roster. No GitHub query is required for each line: use the already-loaded verified context.

## Four separate kinds of information

1. **World truth** — facts recorded by original source authorities, established user/player choices and witnessed story continuity. The GM knows this layer but may not rewrite an original roll, clock, relationship proof, earned power or resource by retelling it.
2. **Player-character knowledge** — what the player character actually witnessed, was told, studied or could ordinarily know from upbringing. The GM must not reveal hidden world truth merely because it is available in the engine.
3. **Each individual NPC or beast's knowledge** — that person's **own** experiences, actual presence, direct messages, common local knowledge, access to particular records, and plausible inference. An NPC does **not** inherit the GM's narrative, the player character's conversations elsewhere, the save's private notes, or another NPC's knowledge.
4. **Unknown/unresolved** — an actor's location, private intent, recent off-screen actions, skill improvements, confidential money, private conversations, relationships, or discoveries not yet established. The GM may create plausible ordinary scene detail within its remit but must **not present these as already witnessed outcomes**, source-proven facts, learned secrets, formal rewards, relationships, abilities or consent. If an already registered actor's presence is required by a source-owned **mechanical** action, obtain its original presence authority. The GM may establish a *new ordinary encounter* consistent with the established world and record significant witnessed facts, without pretending that narration retroactively creates that engine witness. Absence of evidence is not evidence that someone is absent; the player's search does not summon its target.

Before putting a private fact into dialogue, the GM must privately answer: **Exactly how could this particular speaker have learned this fact before this line?** Valid channels: they were there; the player or a known intermediary told them; it is genuine public knowledge; or the person plainly **asks/guesses without asserting it as fact**. No channel => do not put the claim in the dialogue. Even an innocent-seeming question such as *"Did your mother pay you for the harnesses?"* leaks knowledge of both the private job and the allowance.

## Specific family ties in new character creation

New campaigns generate **both** a `kinship` (mother, father, aunt, grandfather, adoptive parent, foster parent, sibling, adult relative, and so on, as appropriate to the seeded household) and a separate `householdRole` (guardian, second guardian, sibling or another recorded family responsibility). These details are copied into the player's family, starting origin, personal history and individually source-sealed NPC origin, and the family-status view shows the specific kinship first. No name alone is evidence of parentage, bloodline, legal inheritance, present consent, a living former guardian, or a guaranteed shared residence.

For compatibility, `family.members[].relation` and the original NPC `relation` still store the legacy household-role identifier; **do not interpret that legacy identifier as the precise kinship**. In a newly generated character use `kinship` for normal dialogue and `householdRole` for household mechanics. In older saves, `kinship` may be absent; **do not seed it retroactively or rewrite signed origin actors**. An explicit player-confirmed relationship in the narrative continuity register overrides the generic role for that campaign. Maddoc's existing confirmed mother relationship is preserved exactly without rerolling Nessa's unknown kinship.

## Family relation vs household role

A saved **guardian** or **second guardian** label identifies a responsibility/household role, not a claim that the person is an aunt, uncle, biological parent, foster parent, employer, or any other more-specific relationship. A later *explicit player correction of an ordinary relationship* is **campaign canon**; record it using the original `scripts/scene-continuity.js` witness/continuity facility rather than rewriting source-hashed independent origin records.

For **Maddoc Maddren** specifically:
- **Hedra Maddren is Maddoc's mother**, as explicitly clarified by the player; the original source-generated `guardian` role remains mechanically correct. No additional biological or adoption assertion is inferred.
- **Nessa Maddren is Maddoc's father**, confirmed by the player in later source-sealed campaign continuity; `second guardian` remains his original household responsibility. The saved campaign continuity is authoritative over this historical rule file.
- The **original guardian allowance** was actually settled (Maddoc 2 Talons); this does not become information known to Bram or Tessa unless one of them genuinely learns it.
- **Bram and Tessa** are established acquaintances/friends from earlier scenes. Maddoc's arrival at **Mossgate Common at 15:12** did **not** confirm either friend's current presence, new morning activities, study achievements or access to Maddoc's private family events. Do not convert "I hope to meet them" into a confirmed reunion or off-screen report just because the destination was reached.

## Correcting a mistaken GM scene

A narrated statement unsupported by the original evidence is **not** a retrospective canon event. Explicitly correct it as GM, without forcing the player to say lines they did not say, pretending the NPC secretly learned something, inventing an intermediary messenger, or making a second travel/work/roll to undo narrative text.

For current Maddoc's Mossgate pickup:
- **Verified:** 15:12, Mossgate Common, completed 42-minute walk from Maddren Homestead, 2 Talons, Stamina 33/36, Soul self-awareness 2/100, no new roll or friend-presence confirmation.
- **Player-established canon:** Hedra is his mother. The ledger's generic guardian role is **not** a contradiction.
- **Not established:** Bram or Tessa physically at Mossgate today, their individual activities since the previous meeting, or either knowing about the harnesses, allowance or Soul practice. The earlier purported dialogue that asserted those things is **superseded** and does not establish memories or knowledge.
- **Correct next scene:** describe only the known common and Maddoc seeking his friends. If their genuine whereabouts/activities matter, resolve independently and narrate only what becomes established; otherwise keep their discovery open. No omniscient recap delivered through their mouths.

## Short silent GM speech gate — every NPC turn

**Identity** (is the speaker's exact relationship confirmed, or just a general role?) → **Presence** (has this person actually been established in this scene; does movement merely establish the player?) → **Knowledge source** (did this speaker witness, hear, publicly learn, or explicitly speculate?) → **Individual agency** (would they plausibly say it, given their own goals and awareness?) → **Consequences** (does this line secretly award a resource, progress, consent, relationship change or discovery that needs real owner authority?)

If any step fails, **rewrite the NPC's words naturally**, not with exposition about what the NPC is forbidden to know. This guard is independent of dice, doesn't require a tool call for dialogue already sourced, and never supersedes independent minds or the original engine.

## Persistence mechanism

Use the existing `chatRuntime.continuity` signed narrative fact register, not arbitrary new save keys or overwriting origin hash proofs. `mode:"checkpoint"` with `scene`/`summary` and `continuity:[...]` records a player-confirmed relationship with its source witness. A relation record is **story/identity context only**, not a new character, money transfer, parentage test, NPC knowledge share, or time tick. Original request IDs and save revisions still replay safely.

When existing narrative fact is corrected, **revise** the prior active continuity ID with its original `priorSeal` rather than silently overwriting it. Important corrections should be placed near the top of the live Project instructions and picked up on every new session; do not bury them in an old recap.
