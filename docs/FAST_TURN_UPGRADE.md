# Beastbound — safe fast-turn implementation

This document describes the **real source-supported** fast-turn entrypoints. It does not override the Master Prompt, Table Rules, original discipline systems, NPC autonomy, beast welfare, or the selected campaign's saved checkpoint.

## 1. Process: fewer round trips and verified requests

- **Speech and player-known inspection** stay chat-native, with no die, clock tick or GitHub request. Reuse loaded original rules and exact most recently confirmed save/result.
- **Genuine actions** use the original engine once. Never submit a second unique turn just because the first result has not appeared. Read the matching confirmed result; it already includes the state, original roll/events and HUD.
- **Pickup scenes may be recorded with the actual action** using optional \`scene\` (1–450 characters) and \`summary\` (up to 400 characters) in its rule/action/check request. This avoids a needless extra checkpoint for ordinary turns. An inline scene describes only witnessed facts, not mechanical evidence of wages, consent, power or work completion. A read-only status cannot change the scene.
- **Preflight** when a complete local source and save exist: \`node scripts/prepare-turn-request.js saves/<campaign>.json /tmp/draft.json /tmp/prepared.json\`. It validates request shape, campaign selection, stable unique ID against the local save's ledger and the **raw original save SHA-256**, then writes an immutable candidate request. Or validate a draft alone with \`node scripts/turn-preflight.js /tmp/draft.json\`.
- Avoid fetching the same full 250KB save again when a verified result already establishes the new state. Do not poll multiple unrelated workflow endpoints to see whether the result exists. Reserve separate \`checkpoint\` for explicit /save, genuine session pickups or meaningful multi-turn changes.

## 2. Source-owned bounded multi-action sequence

Request \`mode:"sequence"\` processes 2–6 **verified original rules** in order, in **one** engine execution and **one final committed save**. A sequence consumes the same RNG stream, original checks, stamina, calendar time, off-screen world ticks and source-specific conditions as separate turns. It is NOT a simulation shortcut, chosen DC or guaranteed progression.

\`\`\`json
{
  "id": "example_training_night_001",
  "campaign": "selected_campaign",
  "mode": "sequence",
  "steps": [
    {"mode":"rule","system":"discipline","operation":"practice",
     "params":{"system":"soul","method":"self-awareness","minutes":129}},
    {"mode":"rule","system":"health","operation":"sleep",
     "params":{"hours":11}}
  ],
  "scene": "The morning after the verified training and actual night of sleep.",
  "summary": "Player practised and slept only if the original rules confirmed both.",
  "focus": ["Next morning"]
}
\`\`\`

Allowed original operations initially: \`discipline.practice\`, \`health.sleep\`, \`world.wait\`, \`social.householdWork\`. Unsupported freeform actions, choosing checks/rolls, nested sequences, arbitrary evolution or unknown combat branches are rejected rather than silently executed.

Execution uses a disposable save copy, processing each original subturn at most once. An actual complication, serious outcome, encounter, independent employer refusal or a rejected precondition **stops** remaining steps. Verified earlier steps persist as a single *partial* sequence receipt; later steps never happen. The requested final scene/focus is applied **only if all steps complete**. A full replay of the same parent turn ID returns the original saved substep results and rolls without rerunning them. Any stale \`expectedHash\` fails before an action is attempted. Any rejected first step leaves the save unchanged.

Do not include an employer offer and future payment as if the NPC were bound to agree. An independent work operation is resolved once by its owner; dependent plans must obey the outcome.

## 3. Source- and save-verified local Node 22 fast path

The source-backed command is \`scripts/verified-local-turn.js\`. It is **not** a remote service or another gameplay engine. It can only be used when the *complete, accurate* GitHub checkout and latest GitHub-selected save are genuinely present in the execution environment.

\`\`\`bash
node scripts/verified-local-turn.js \
  --save saves/selected_campaign.json \
  --request /tmp/prepared.json \
  --out /tmp/beastbound-candidate.json \
  --source-head <verified GitHub main SHA> \
  --save-blob <verified GitHub contents blob SHA> \
  --save-sha256 <SHA256 of the raw original save bytes>
\`\`\`

The wrapper checks Node 22, the exact local source commit, tracked/untracked executable source cleanliness, selected campaign and original save blob/hash. It runs \`scripts/chat-turn.js\` once on a **temporary copy** and exports a *candidate* only. It never updates \`saves/\`, does not push, never claims a remote commit or rerolls on a conflict.

**To finish persistence**: separately reconfirm that GitHub's original save blob and source head still match; upload the exact candidate contents to the existing \`saves/<campaign>.json\` using GitHub's update-file **original blob SHA lease**. Only a successful GitHub acknowledgement establishes a saved turn. If the lease fails, preserve the original result/candidate for reconciliation. Never re-execute the same RNG-consuming turn to avoid a stale SHA. If a complete checkout or exact remote verification isn't available, use the existing GitHub Actions request→result path.

## 4. Independent source-funded household work

\`social.householdWork\` provides one **bounded ordinary family-chore** operation, not a universal job board or an automatic path to wealth. The task is freeform practical household maintenance. It requires:

- An actual source-authored local family home and known family member **personally witnessed in the saved pickup scene** (kinship alone cannot summon them).
- A genuinely active person with actual tracked funds, a safe ordinary daytime shift, enough player stamina and no unresolved threat.
- The person's **own** RNG, practical fatigue and available money determine whether the proposed work is accepted; the caller cannot submit \`accepted\`, \`paidTalons\`, \`dc\`, duration or a success.
- If they decline: five real minutes, no pay, no work roll. If they agree: 120 real minutes, two Stamina, the original Crafting check vs DC12 and at most two Talons from **that employer's actual funds** on verified success. A failed job earns no wages; a consent refusal earns none. One consideration per relative per day.
- An immutable witnessed receipt records employer source, original check (if any), independent employer RNG, time, before/after payer funds, player Talons and stamina. \`social.householdWorkStatus\` is read-only. No automatic employer rank, legal status, technique, family permission, beast assent or additional material stock is created.

Illustration (only after the family member is genuinely present):
\`\`\`json
{"id":"example_kin_chore_001","campaign":"selected_campaign","mode":"rule",
 "system":"social","operation":"householdWork",
 "params":{"npcId":"origin-kin:kin_1",
           "purpose":"Clean and sort the damaged working harnesses for this family member"}}
\`\`\`

The earlier Maddoc harness scene used \`world.wait\`, which **explicitly does not certify paid work or credit wages**. This new operation cannot convert the earlier elapsed time into a retroactive check or grant the previously discussed two Talons by fiat. Any later payment needs its original real source and transaction.

## Safety and regression

\`tests/fast-turn-transactions.test.js\`, \`tests/household-work-verified.test.js\`, and \`tests/verified-local-turn.test.js\` test one-roll replay, partial stops, source and save leases, real conservation, independent refusal, source-bound presence, read-only status and ordinary scene write compatibility. Existing single-action requests and old save formats remain supported. Run the complete three-batch GitHub engine CI and final integration before merging.

No campaign \`saves/\`, \`requests/\`, or \`results/\` are part of this implementation.
