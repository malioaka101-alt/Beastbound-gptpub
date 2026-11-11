# Foundation #18 — actual published foreign courier history, not invented treaties

**Authority:** original 57-section Beastbound Unified Master Prompt §34, Table Rules world realism and source-verified news, the original `world/simulation.js` independent monthly geopolitical decisions, actual public announcements and original `world/government-offices.js` historical public office mandates. This slice creates no additional relationship change, government, minister, individual decision, money, postal network or treaty. It does **not** prescribe a restricted menu of diplomatic issues.

## Why this is a foundation connection

Already original world months have a chance to change **real existing Atlas polity-pair relations**, using their independent ongoing pressure, war exhaustion, economic conditions and original world RNG. Such events already emit a real foreign courier bulletin with original text, channel, international scope, dated source and **14-day publication delay**. The original global `w.chronicle` holds only its latest 200 records; older real public foreign-policy events can be displaced by later news. The separate original diplomatic transition audit preserves authentic past status shifts, but not necessarily a copy of the *actual public announcement* once the brief chronicle has rotated. Neither an undelivered foreign note nor an erased short journal should be arbitrarily treated as player knowledge.

## What is actually copied

When and ONLY when the original existing `tickMonth` changes a real bilateral relation and emits its existing single foreign-courier event, an optional `publicCourier` evidence receipt is kept **on the same actual original `w.diplomacy[key].diplomaticAudit.transitions[]` row**. The receipt includes the actual event returned from that same original `event(w,...)`, its original transition hash, date, exact public text, channel, original international subject, exact existing delayed `releaseDay`, and a tamper-evident record hash. `verifyOriginalForeignCourier` rejects changed original text, invented signatures, moved release dates, mismatched pairs, rehashed counterfeits, or an announcement whose original transition is not the exact existing world event. The original diplomatic audit validates that optional receipt on every source check. This does not re-run the diplomacy dice or emit the bulletin twice.

The original event text is unchanged. A status change is **not** an official signed treaty, a named envoy's consent, a legal accession, foreign land grant, state expropriation or proof that either civic officeholder personally negotiated it. PR #72's genuine historical offices remain an internal verified record, not hidden facts automatically disclosed through the courier.

## Player knowledge without omniscience

A strictly read-only `world.foreignCourierHistory({limit?: number})` action reads only original authentic courier notices **whose original release day has actually passed on the player's local world clock**. It is available through the existing private chat-turn runner without time, randomness or a checkpoint write. It returns only the original published text, day, release day, historical source hash and a nonbinding-diplomacy warning. It does not disclose secret tension, foreign treasuries, hidden war plans or historical individual officeholders. The actual existing `world.news({channel:'courier'})` still shows recent real bulletins through the short global journal. `foreignCourierHistory` keeps only actually archived original published notices when that short journal later rotates.

Older saves remain honest: historical diplomatic rows with no `publicCourier` evidence stay source-valid but are **not** silently backfilled with invented past notices, reconstructed couriers or guessed delivery dates. Those earlier records can still be seen through the old short `world.news` if the actual notice is present there.

## Verification and what is still missing

`tests/original-diplomatic-courier-public-provenance.test.js` uses a disposable real original world and original monthly transitions, real fourteen-day release, exact original notice identity and hash, the already existing courier news, a simulated ordinary short-journal prune in the disposable test, real historical office source validity, genuine checkpoint import/export, read-only original chat-turn action, original player RNG continuity, forged-source rejection even after recalculated outer hashes and earlier-save no-backfill. It is FIRST in a full **189-group** regression that retains all 188 previously verified groups.

**Draft until exact-head complete 189/189 GitHub Actions success and merge.** This is still a narrow slice of #18; the checklist remains **17/25**. True individually authorised diplomatic negotiation, two-sided consent to any binding treaties, actual external government laws and property stewardship and more open-ended organically arising rival institutions remain incomplete. No active campaign `saves/`, `requests/` or `results/` have been changed; never import campaign facts between characters.


**Rebase revision (11 November 2026):** Built on fully verified PR #75, now 190 prior groups. The genuine bilateral contact bulletin is independent of an original foreign *status-change* bulletin, and is not duplicated or silently turned into a historic treaty announcement. Full 191-group regression pending. The older branch's case-sensitive assertion is corrected; no active save files modified.
