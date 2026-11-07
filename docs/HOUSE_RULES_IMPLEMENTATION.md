# Beastbound v0.3 — source additions integration matrix

Authoritative materials:

1. `Beastbound_Realms_Unified_Master_Prompt.md` — setting and independent progression systems.
2. `Beastbound_System_Additions.md` (compiled 4 November 2026) — later house rules, scene style, research, Maturity and campaign rulings. They supplement but do not silently rewrite established continuity.
3. An active campaign's own save and rulings — applies **only to that campaign**.

## Implemented as executable JavaScript

| Source area | Implemented in `engine.js` | Limit |
| --- | --- | --- |
| Random start / standing preferences | Seeded identity, age, background, path, family household, siblings, ties and trade | Unspecified family relations are prototypes, not Jory's canon relatives. |
| Research §3 | Start, numerical Grade I–IX/novelty DC and track, rank prerequisites, survey, Preparation, materials cost, Research Week d20, points, 25/50/75% clues, fieldwork, hypothesis, Proof, replication, Fame | Simplified procedural truth and requirements; professional licensure, IP/copyright sales, labs and group research are not fully simulated. |
| Research §4–5 | Evidence gate for rediscovery, subject consent requirements, severe-failure complications, risk and source logs | Not a full legal/economic simulator; sensitive research must be reviewed by GM. |
| Evolution §6.6 | Independent Maturity years, daily accrual, ×1–×10 multiplier, Ripening once per season with Vigor test, one Pattern Echo per evolutionary stage | Prototype resource/site analogues. Bloodline head start and Crucibles are not fully automated. |
| Evolution §6.7–6.8 | Branch records, documented/hidden routes, potential checks, unmet requirements, consent, spectacle and evolution event record | Dreamreed Fox is an **original prototype example**, not asserted to be previously established canon. The wider bestiary and legendary branch catalogue are not complete. |
| Lean play (00) | `bridge.js hud`, `bridge.js recap`, `bridge.js knows`, JSON saves and deterministic command actions | GitHub synchronisation and transparent Python CLI compatibility require further integration. |
| NPC knowledge | Player-specific witnessed conversation is recorded; `knows <name>` reveals available recorded provenance | GM must still reason about public knowledge and unstored NPC behaviour. |
| Trade | Price values in Talons; formatter shows Talons/Fangs/Scales | Existing v0.2 currency numerics are interpreted as Talons, to preserve buying power. This is a prototype currency choice. |
| Continuity | Import legacy schema-v1 JSON without deleting old fields; seed and action sequence preserve dice | Separate Python `bb_state` saves and the Jory Larkin checkpoint are not the same format. |

## Requires the narrative Game Master rather than code

The `00b` and `00c` literary scene style; Jory-specific voice cards; the complete Aldmere calendar, culture and geography; the case-by-case ethical/legal review; independent NPC goals and relationship nuance; **sealed scientific truth** and the decision whether a research hypothesis truly matches it; the full evolution crisis and genetic models; God's agency; custom canon branches; multi-disciplinary designs and fixed individual histories.

The full compiled additions describe a **separate Python engine** (`bb_core.py`, `bb_progress.py`, `bb_research.py`, `turn.py`, etc.). Those source modules and their self-tests were not supplied with the additions, and cannot be represented as tested merely because the guide lists their APIs. The v0.3 JavaScript implementation is a compatible *prototype subset*, not a parity port of every source function. Do not pass a Python save into this JavaScript engine without a deliberate conversion.

## Important security and deployment boundaries

A fully client-side browser game cannot keep hidden research truth truly secret from a technically knowledgeable player: the save is inspectable. An authenticated server that owns sealed world facts is required for adversarial secret-keeping or live shared saves.

Do not publish a player's campaign JSON, `Beastbound_System_Additions.md` (includes specific Jory Larkin details), or other project-only documents in a public GitHub Pages site without explicit review. The *GitHub starter package* contains public-safe code and this integration matrix, **not** private campaign saves or the compiled source file.