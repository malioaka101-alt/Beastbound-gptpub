# Original turn outcome recovery after a missing result file

The private GitHub Actions processor handles one stable request ID through `scripts/chat-turn.js`, the canonical game engine, and a persisted campaign save. A process can be interrupted **after** the save is atomically replaced but **before** `results/<campaign>/<id>.json` is written. The old replay path correctly refused to roll twice, but could only show a generic duplicate receipt, leaving the original d20 outcome and narrative result unavailable.

## Completed bounded repair

For each **state-changing** private turn, `chatRuntime.applied[id].receipt` now stores the original player-facing `output`, permitted event excerpt (including the original die), original clock, message if present and original success flag **in the same save file** as the applied marker. Replaying the identical request after a missing result file supplies `recovered:true`, `originalRevision`, and the original fields without consuming RNG, time, materials or a new world tick. A fresh current HUD and current `stateHash` are returned separately; a historical receipt is never passed off as a current character panel. A turn-ID collision with different request input remains refused.

Legacy saves containing applied IDs but no archived receipt still safely refuse to reroll; they cannot reconstruct old missing mechanical details retroactively. Read-only look/status actions do not create receipts or save revisions. This is recovery of already resolved turns, **not** new Beastbound ability, free action, additional roll, gameplay progression or permission to edit the active Aerin checkpoint.

## Verification and boundaries

`tests/private-turn-receipt.test.js` performs a real original fen habitat Survey and d20 interpretation on a disposable campaign, destroys the only hypothetical external result, and requests the same ID again. It tests identical saved roll/evidence, no new RNG or time change, historical recovery after a later valid checkpoint, request-hash collision rejection, legacy checkpoint fallback and read-only observation. The test is included in the required private engine regression workflow.

The archive is part of each save; it increases save size over a long campaign, and external result files are still useful for immediate retrieval. A full transactional GitHub repository update across two different files remains impossible, so the receipt intentionally closes only the **saved turn / missing result** gap. The original Master Prompt, established campaign continuity, individual agency and idempotent dice rules remain authoritative.
