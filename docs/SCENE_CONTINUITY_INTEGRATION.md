# Durable scene continuity — GM narration without extra mechanical gates

Beastbound's actual GM establishes what happens in dialogue and the surrounding world. This small adapter preserves important **already narrated** details in the **existing checkpoint save** so that the short 30-entry scene journal need not carry every relevant fact forever. It does not narrate reactions for the GM, change world-time or dice, author NPC assent, create a character, establish hidden statistics, or decide whether a promise has legal force.

## Use when there is something worth remembering

Ordinary dialogue and routine scene descriptions stay in the chat and use **no engine call**. At an already meaningful checkpoint or an already consequential turn with a witnessed scene/summary, the GM may add an optional `continuity` array of up to eight durable, sourced notes. This is not an instruction to checkpoint every conversation. The `witness` is a verbatim excerpt from the same request's `scene` or `summary`, which anchors the entry to what was actually narrated.

For example, at a **genuine pickup checkpoint** after a conversation:

```json
{
  "id": "river_proverb_checkpoint_001",
  "mode": "checkpoint",
  "scene": "A traveller recites the old bridge proverb at Morrowfen Crossing.",
  "summary": "The traveller recites the old bridge proverb; no terms or reward were agreed.",
  "continuity": [{
    "id": "morrowfen_bridge_proverb",
    "action": "record",
    "subject": {"kind": "place", "id": "crossing"},
    "category": "oral tradition",
    "statement": "The traveller recited a local bridge proverb.",
    "witness": "The traveller recites the old bridge proverb",
    "visibility": "player-known"
  }]
}
```

The returned `continuity.entries[0].head` is the exact source seal. A later `revise` or `retire` cites that seal in `priorSeal` and supplies a later genuine scene witness. Neither earlier entry nor its source is overwritten; the full revision history remains under the same stable fact ID. A previously retired fact cannot be silently reactivated as a new identity. The saved `world.sceneContinuityStatus` view reports player-known entries only, with both old and current statements, and does not change the game clock or save. GM-only facts are excluded from that player-facing view. A GM-only note must quote a separate optional `gmWitness` field in the **same** checkpoint request, not the public `scene` or `summary`. That private evidence is preserved only in its saved source note and is not copied into the pickup journal or public receipt. The player-facing turn response reports only a generic private-recorded marker.

Subjects may point to the real player, an existing person, beast, place or group, or the world. When the GM has described someone not yet registered as a mechanically recognised person, use `{ "kind": "narrative", "id": "stable_subject_slug" }`: that is a **story reference**, not a fabricated actor, presence, appointment, permission or inventory. The original established individual/organisation modules remain authoritative for real identities and world ticks.

## Non-mechanical boundary

A story note can faithfully retain *what someone said*, *what was observed*, *a reported promise*, or *how an account later changed*. It cannot itself prove that the person was present, independently accepted a contract, owns a good, has a particular ability, earned a skill, completed work, suffered a wound or received money. Those changes continue to require their original source-owning rules. Visibility is an immutable property of each note, not a shortcut for giving the player secret information. **GM-only is player-facing output filtering, not confidential storage:** the currently connected source repository is public, so do not place personal secrets or anything requiring actual confidentiality in saved GM notes.

This bridge adds no separate narrative RNG, simulated social reaction, mandatory conversation menu, actor registration, score, or duplicate time progression. It deliberately addresses the specific continuity gap without reopening the merged NPC and wild-beast foundations.
