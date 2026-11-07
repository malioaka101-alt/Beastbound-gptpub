# First witnessed local NPC conversation and memory route

The original Master Prompt and Table Rules require characters to have professions, knowledge boundaries and lasting memories. The prototype `engine.js::talk` fell back to **any** local NPC when a supplied name did not match, and repeated a canned topic without a source-identified meeting ledger. The private chat's new `npc.converse` route instead establishes *a small genuine first layer* of conversation with the five already authored local human professionals.

## Positive gameplay

- In the Project chat, write **`talk to Elira Moss`** or **`talk Orrin Vale`** (other unique prefix matches of at least four characters work). Names must resolve to exactly one existing canonical NPC. A nonexistent, remote or ambiguous person is not silently replaced with the first person at the site.
- `npc.converse` accepts **only** `{ "npcId": "<existing_key>" }`. The person must be physically at the current location, in the currently supported daytime 08:00–18:00 conversation window, and no active combat or beast encounter may interrupt. One actual professional conversation costs 12 in-world minutes. No extra dice, false ranks, promised money, secret agendas, contracts or favourable statements are minted.
- The character says only their **pre-authored, public professional topic**; no guessed NPC inner thoughts, secret personal goals, private institutional records or invented relationship benefits appear. This very first route is intentionally narrow: further freeform speaking can be narrated naturally in chat, but mechanical promises, admissions, detailed hearsay and legal commitments need separate witnessed authoring rules.
- Each actual meeting records an engine-witnessed story event with the canonical NPC identity and site, and a SHA-256 event hash in an append-only `table.npcConversations.records` ledger. `npcMemory` increments once per valid day, and `npcKnowledge[name]` retains the actual heard topic with direct conversational provenance. Duplicate chat-turn IDs do not replay; the same person on the same day cannot be repeatedly used to mint fresh mechanical meetings.
- `npc.status` with empty params reads **only the player's witnessed conversations**, without mutating a save or revealing as-yet-unmet NPCs or private goals. The full People panel shows recent actual words and named speakers with the same 34-column presentation contract.

The recorded meeting is **not** a declaration that the NPC agreed to help, likes the player, is available at every hour, can be drafted into combat, or has changed their independent career goals. The authored locations and opening times are a conservative limited simulation, *not* a complete daily NPC schedule. Five prototype professionals do not replace hundreds of thousands of distinct citizens or a full dialogue intelligence engine.

## Tests

`tests/npc-conversations.test.js` verifies real dialogue in disposable file-backed saves, identity/location/day limits, forged quote and nonlocal NPC rejection, stable RNG, honest 12-minute time cost, persistent player-known facts, duplicate-turn protection, read-only status, and unchanged bytes for invalid attempts. No real campaign save or legacy offline dialogue was rewritten.
