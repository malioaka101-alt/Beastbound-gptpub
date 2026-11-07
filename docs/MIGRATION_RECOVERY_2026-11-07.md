# Beastbound recovery snapshot — 7 November 2026

## Which repository is now active

- **Active public development and future chat-turn repository:** `malioaka101-alt/Beastbound-gptpub`.
- **Original preserved private source:** `malioaka101-alt/beastsbound-gpt`. Keep it as an independent historical backup; do not write future live turns there.
- The public snapshot branch `backup/private-main-snapshot-20261107` points to commit `8d853d3bf5c2851ab243cc7a30ba97d68e4cb9dd`. That commit contains the exact 335 original files from private source `main` commit `bbb410d6b5dc3efeb15edff75d0eeaf0a54b4921`.
- Both commits have the exact same root **Git tree hash**: `792ab32275ed6c71246afd1305c5a38210f52a9c`. This certifies identical path names, modes and file bytes at the migration checkpoint.
- The first public import temporarily disabled automatic private-turn processing while copying old request files, then restored the original workflow in a second commit that changed only the workflow. No original request was newly submitted to trigger turn processing.

## Unmerged development retained, without importing private history

- Original private [PR #140](https://github.com/malioaka101-alt/beastsbound-gpt/pull/140), head `8c30c9e230fa834ff9b9e20af3cc0aa960022762`, was ported as public [draft PR #1](https://github.com/malioaka101-alt/Beastbound-gptpub/pull/1), branch `foundation/open-intent-source-dialogue-20261107`, initial migrated commit `1816143d3534dd3004a698d21bde964fead3e004`. All 17 changed file contents matched the private PR at the migration checkpoint.
- Original private [PR #139](https://github.com/malioaka101-alt/beastsbound-gpt/pull/139), head `a51d4da616c824ecbb93d8ef3d311c706c5c9597`, was ported as public [draft PR #2](https://github.com/malioaka101-alt/Beastbound-gptpub/pull/2), branch `audit/foundation-completeness-20261107`, initial migrated commit `4975dc583cab2d155b0a6bb68310b82dffcd4584`. All 5 changed file contents matched.
- Those new public development branches start from the original public `main` snapshot, retaining the two later audit request/save files present in private source `main`. They are not merged and should only be promoted after successful verification.

## Live Aerin checkpoint: immutable recovery evidence

- File: `saves/aerin_marsh.json`.
- Original Git blob SHA: `72b1535307fba37e19d26122ba4eb80b46cea31c`.
- At the migration snapshot: **Day 1, 08:00**, Morrowfen Crossing (`crossing`), **85 Talons**.
- RNG state: `616240188`; save schema version: `1`; engine version: `0.3.0`.
- This is **not** permission to replay a past turn, regenerate dice, or overwrite a progressed campaign. A future restore must first compare the live save and only restore the old snapshot on explicit user instruction.

## Recovery and safety procedure

1. Locate the immutable public snapshot branch `backup/private-main-snapshot-20261107`, its commit, and the private original for independent verification.
2. Compare the affected current paths with the snapshot via Git diff before applying any repair. For a bad newly edited file, restore only the affected file(s); do not silently roll back later legitimate saves.
3. Keep draft PRs separate; do not merge unverified mechanics just to run gameplay.
4. The historical request `requests/foundation_runner_audit_20261107/audit_status_20261107_001.json` was unprocessed at migration (no matching `results/` file). It is a **disposable audit campaign**, not Aerin. Because the turn worker scans all pending files, a later explicit dispatch or new request can cause this old audit result to be written; do not interpret that as Aerin progression.
5. Public Actions use the repository's standard hosted-runner allowance policy, but **a successful full engine regression** and a real disposable request/result/checkpoint roundtrip are still required before code is promoted.

This record is documentation only; creating it must not modify any game save, request or result.
