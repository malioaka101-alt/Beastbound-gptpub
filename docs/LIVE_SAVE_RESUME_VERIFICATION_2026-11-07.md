# Live Beastbound Actions save-and-resume verification — 7 November 2026

## Result: PASS (actual public-repository GitHub Actions workflow)

**Repository:** `malioaka101-alt/Beastbound-gptpub`, `main`.
**Disposable campaign:** `runner_roundtrip_20261107a`, character `Roundtrip Save Resume Fixture`.
**Real workflow:** `.github/workflows/private-chat-turns.yml` using `scripts/process-pending.js` and the real `scripts/chat-turn.js`. No active player command was generated or executed.
**Original private repository:** remained untouched.

This is a repository-backed, cross-request save/resume test using the real GitHub Actions runner and repository commits. It proves that a fresh status request can retrieve the prior saved pickup and original roll receipt. It does **not** claim that a separate ChatGPT conversation was opened, or that every possible gameplay situation is mechanically implemented.

## Verified sequence

1. **Initial status (read-only):** [run #42416771817](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42416771817), request `rt_01_status_20261107a`. A true `results/` file was committed. `ok:true`, `applied:false`; time 08:00, Crossing, save/RNG unchanged. The same initial batch also finished the previously pending read-only `foundation_runner_audit_20261107` request, without changing that campaign.
2. **Real travel:** [run #42416822888](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42416822888), `rt_02_travel_20261107a`. Source-linked `travel fen`, `expectedHash` from previous result. `applied:true`, revision 1; 08:00 → 09:15, Crossing → Fen; Stamina 52 → 48; RNG unchanged.
3. **Source-bound check preparation:** [run #42416863622](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42416863622), `rt_03_survey_20261107a`. Real `world.habitatSurvey` created unused, sourced one-use `checkId:"habitat_fen_00000"`, spent 20 minutes and 2 Stamina; revision 2, no early roll.
4. **One original check/roll:** [run #42416903435](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42416903435), `rt_04_check_20261107a`. `mode:"check"` passed only the verified check ID and prior save hash. Original result: **d20 11 +5 = 16 vs DC 12, success**; 15 minutes; revision 3. Stored check was marked `used:true`; RNG advanced to `2324254599`.
5. **Actual checkpoint:** [run #42416969790](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42416969790), `rt_05_checkpoint_20261107a`. Committed true, previously established wetland scene, limited focus and original outcome summary; revision 4. At save: Day 1 **09:50**, Fen, Stamina **46**, RNG `2324254599`.
6. **Fresh save pickup:** [run #42417020117](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42417020117), `rt_06_resume_20261107a`. New `mode:"status"` request read the checkpoint through GitHub and retrieved exactly the saved `SCENE:`, in-world journal and revision 4. `applied:false` and save blob stayed unchanged.
7. **Stale checkpoint rejection:** [run #42417096924](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42417096924), `rt_07_stale_20261107a`. Deliberately incorrect `expectedHash` with an action was returned as `ok:false, applied:false, error:"Stale checkpoint; reload before processing this turn"`; save/RNG/revision unchanged.
8. **Interrupted result-write replay:** Deleted only the disposable `results/runner_roundtrip_20261107a/rt_04_check_20261107a.json` result after verifying the original Git blob SHA `df1d5f2777cc139aa4f77fc30fb3f40da112f13e`. Issued a separate harmless status request `rt_08_replay_trigger_20261107a` to trigger [run #42417172083](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42417172083). The real processor recreated that result with `duplicate:true`, `recovered:true`, `originalRevision:3`, `applied:false`, and **the original d20 11, total 16, check ID habitat_fen_00000**. It did not reroll. The separately submitted status request also succeeded without mutating the save.

All eight cited workflow runs completed **successfully**.

## Final immutable comparison anchors

- Disposable save: `saves/runner_roundtrip_20261107a.json` — Git blob `68a77e82f2518ec73f619ed809fb7a6072afc021`, original roll archived in `chatRuntime.applied.rt_04_check_20261107a.receipt`, revision **4**, position **fen**, time **590** minutes, Stamina **46**, RNG **2324254599**. This blob SHA remained unchanged across resume, stale rejection and replay.
- Live Aerin save: `saves/aerin_marsh.json` — Git blob `72b1535307fba37e19d26122ba4eb80b46cea31c`, **unchanged** (Day 1, 08:00, Crossing).
- Earlier disposable audit save: `saves/foundation_runner_audit_20261107.json` — Git blob `5d009dd6a4f4dcf8a8d8dc6c3197814aea0377a0`, **unchanged**.
- Original check result can be recovered from Git history even after the controlled deletion. The recreated result now resides normally at the same path; recovery metadata is intentionally different because the original already-applied turn is replayed without resaving it.
- The separate [111-test regression suite](https://github.com/malioaka101-alt/Beastbound-gptpub/actions/runs/42415249455) passed on the fully merged foundation work prior to this live test.

## Foundation conclusion and limits

**Audit A3: PASSED for a live GitHub Actions request → genuine engine consequence → committed result/save → checkpoint → later request pickup → original-roll recovery → stale rejection → unaffected other campaigns.** The implementation remains the existing JS core and workflow; no fake time, dice, NPC consent, or resources were credited by the test. Distinguish this bounded verified infrastructure from uncompleted full freeform adjudication, unseen beast ecology, higher-tier power integration and the remaining Master Prompt scope. The original migration snapshot remains available at branch `backup/private-main-snapshot-20261107`.
