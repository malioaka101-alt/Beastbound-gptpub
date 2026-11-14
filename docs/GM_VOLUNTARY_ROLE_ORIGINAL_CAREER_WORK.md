# Original professional work during a genuinely agreed volunteer role

## Existing source owners (no new profession/employment system)

Merged PR #136 already connects original `world/emergent-groups.js::proposeVoluntaryRole` to an actually joined member who independently accepts a temporary, limited responsibility at a real GM-established location. A role is not employment, a licence, control over a person or a promise to perform work.

The distinct missing link was **real work during the role**: the original `world/emergent-people.js::observeLocalWork` and `world/person-careers.js::work` produce their own independently decided work and source-authenticated career receipt, but the organisation had no durable evidence that this particular willing worker acted at the relevant site while the role was active.

## Source-owned bridge

`social.observeGroupRoleWork({groupId,roleId,npcId})` is a narrow adapter, not an independent work or training engine. A locally present founder must point to an **already agreed, unexpired role** held by an **actually joined GM-established person** at the exact witnessed site. That person needs their original scene-authored career duty, and the original presence system must verify their independent shift. A remote person, expired role, nonmember, invented building, jobless person or false assent is rejected **before** any original work happens.

The adapter calls the original `observeLocalWork` **once**. That source chooses whether the person works through the existing individual RNG, then runs the original professional `Careers.work` exactly once if freely willing. The same original clock advances by 30 minutes for work or eight minutes for a refusal. The original worker, not the organisation, owns any livelihood, professional accomplishment and genuine world effect. A refusal yields **no new group service record**.

For real witnessed work, a `world/emergent-groups.js` history entry **references** (without replaying or re-awarding) the original career receipt, the original player-witnessed work event, the source-sealed historical shift, the exact previously independently agreed role, and the original member-consent proof. It is validated against the existing person's original authored-duty `workProofHashes` and career source. The copied source survives rotation of the short personal scene journal and bounded career receipt journal; historical later voluntary departure or role expiry does not retroactively erase work the individual genuinely performed.

`social.groupRoleWorkStatus({groupId,roleId?})` returns only the original **player-witnessed professional outcome**, role/site and hashes to the actual local founder. It is truly read-only in the chat runner, with no save, roll or tick.

## Explicit limits

This proves **one independently chosen professional work activity at the site during an agreed volunteer term**, **not** that the specific organisation's proposed project was finished, that the worker had a paid employment contract, or that the group owns an office, laboratory, school, materials, land or tools. No separate academy progression, institutional salary, tuition, teaching licence, beast consent, extra XP, practice or rank is granted. In particular, a genuine career-success receipt and an independently agreed role do not imply a student learned anything.

Real construction, physical custody and legally held facilities remain original source-owned systems; a future bridge must supply their own proven ownership and labour, not treat a volunteer's name or an activity receipt as fabricated property.

Regression: `tests/gm-voluntary-role-original-professional-work.test.js` uses a disposable GM site, real independently accepted member and role, scene-authored existing work duty, original independent work and refusal, copied source after short-journal rotation, source tampering, original player money/RNG, exact replay and genuine read-only status. No existing campaign or save path is modified.
