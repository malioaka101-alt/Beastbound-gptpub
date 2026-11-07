# Individually witnessed voluntary work offers — a private RPG foundation

**Original authorities:** Unified Master Prompt §§32, 35–36, 39, 42, 44–45 and 47–48, plus the Table Rules' honest checks, individual NPC agency, persistent consequences and informed consent. This builds on the merged `docs/PLAYER_COOPERATIVE_WORK_FOUNDATION.md` without inventing a separate workforce, a new XP pool or a compulsory career/teacher.

## Player-to-person proposal

At a true local, individually scheduled civilian work shift, `social.proposeLocalWork({npcId,purpose})` or the natural utterance `offer to help <present person's name> with <practical purpose>` offers **one bounded practical collaboration**. The player writes a meaningful purpose; this is what they propose, not proof the other person has agreed to carry out those exact words or has a funded job to pay them. The actual person independently decides, using existing disposition, fatigue, career and own RNG. The witnessed response takes eight genuine minutes and persists with a hash of the original event, the actual individual's origin, their active shift and the offered terms.

A refusal is a refusal, not an opening to force acceptance by resubmitting the same request. An accepted current-shift offer may be honoured using `social.assistLocalPersonWork({npcId,offerId})` or `do agreed work with <present person's name>`. The agreement is checked against the **same real individual**, independently scheduled shift and witnessed acceptance. A successful work scene uses the existing system's **two independent outcomes**: the player's real relevant skill check and the independent civilian's personally resolved practical career work. The previously accepted offer does **not** reroll NPC consent. It is then marked completed with the worker's genuine work-receipt hash.

The player may withdraw an unfulfilled offer through `social.withdrawLocalWork({offerId})` or `withdraw work offer <id>` at any time, without a forced penalty. Withdrawal is the player's change of intention; if the other person is absent, it does **not** pretend that a message reached them. Changes of shift, injury, refusal or changed circumstances can make an accepted offer no longer actionable; no permanent hold on the NPC is created.

`social.localWorkOffersStatus({npcId?})` is read-only and shows only **personally witnessed** offers, decisions and completions, not confidential salaries, NPC aptitude, future rosters or undisclosed intentions. All meaningful changes use source-backed event hashes and stable file-backed turn IDs. A single shift/unchanged proposal cannot be repeatedly rerolled. This is a bounded anti-replay property, **not** a law forbidding other real work or renegotiation when circumstances materially change.

## Honest economic boundary

The regional world currently exposes institutional **abstract budget points**, civilian **abstract livelihood resources** and player **Talons**. They are not interchangeable balances. We do not reinterpret an institution's budget as spendable Talons, mint an employer's cash, fabricate a salary, or imply that the offer includes a signed employment contract, permanent consent, guild title or payment. The unverified funding, employer authority, local wage schedule, currency accounting, actual job posting and enforceable terms remain outstanding foundations. This system establishes the personal agreement, fulfilment, refusal, cancellation and work consequences before money is introduced.

## Coverage and remaining work

The connected path is: independently present worker → proposal in the player's words → worker's own decision → persisted witnessed terms → fulfilment or free withdrawal → both actors' independently resolved effort and source-linked outcomes → retained records and replay-safe checkpoint. Current bounded work remains ordinary civilian cooperation only; broader employment, independent counteroffers, remote scheduling, paid work, materials and legal protections must retain the original world logic and are not claimed completed.

Regression assertions are grouped with prior career tests in `tests/emergent-careers.test.js`, covering acceptance, refusal, withdrawal, forged pay/consent claims, precommitted source witness, no duplicated rolls and disposable file-backed chat turns. No active campaign save is a test fixture.
