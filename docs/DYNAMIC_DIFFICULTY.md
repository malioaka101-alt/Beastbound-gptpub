# Source-bound dynamic difficulty — Beastbound first live implementation

**Canonical authority:** the original `reference/Beastbound_Realms_Unified_Master_Prompt.md` §45 establishes the d20 formula and illustrative DC scale. Difficulty is the resistance of the *actual task* under its *actual conditions*, not an arbitrary GM number, a player-selected challenge, a source of free rewards, or a universal progression ladder. Existing profession, discipline, social autonomy, anatomy, ecology and time rules still own their actions.

## Difficulty is decided before the die

1. **Feasibility:** automatic ordinary facts need no check. A genuinely impossible act cannot be made possible by a natural 20. Keep unimplemented or materially unknown original mechanisms unresolved rather than creating a DC for them.
2. **Source-owned task and baseline:** the original relevant rule chooses whether the action is possible and its starting DC (or the authentic opponent/resistance). This baseline is **not** supplied as a number by the player or inferred from optimistic prose.
3. **Actual approach and circumstances:** only conditions whose effects can be traced to original saved physiology, verified world context, costs and actual prior receipts may affect resistance. An approach must have an executable tradeoff (for example, more work time) rather than an unsupported claim of care, expertise or an invisible tool.
4. **Personal capability:** attributes, skill ranks, potential, source-witnessed guidance, special physiology and equipment **usually belong in the roll modifier**, not a second DC discount. Do not double count them.
5. **Resolve once:** calculate and record the DC and its component evidence before the original d20 check. The core `rules/core.js` computes degrees and original dice unchanged. A roll remains the same across replay.
6. **Display honestly:** show `baseDC`, the signed situational factors and `dc` when consequential. Visible factors must be true and character-known. Hidden uncertainties are not a reason to reveal sealed information.

The Master Prompt's general task scale remains: 5 very easy under pressure, 10 routine trained, 15 challenging professional, 20 expert, 25 master, 30 exceptional supernatural and 35+ extraordinary capability. The values are *guidelines* for authentic different challenges, not permission to overwrite already established source stages or specialist resistance.

## Implemented owners — v1

The owner computes `{baseDC, dc, netAdjustment, factors, capApplied, sourceBound}`. Each factor supplies a stable ID, a signed integer delta and an actual source-grounded reason. The engine refuses arbitrary incoming `dc`, `modifier`, `accepted`, `pay` or `success` fields.

### Ordinary paid household work

Original household work is still a **consensual** request to a source-authenticated, physically present relative with their own money. The independent acceptance roll happens first; the Crafting check still decides whether paid work is complete, and one request per relative per day remains in place. The normal base DC is 12.

| Source-based factor | DC change | Actual cost/evidence |
|---|---:|---|
| Standard approach | +0 | 120 minutes, 2 Stamina |
| Careful approach | −2 | 180 minutes, 3 Stamina |
| Rushed approach | +2 | 60 minutes, 2 Stamina |
| Below half current Stamina | +2 | Actual recorded Stamina divided by maximum, evaluated before work |
| Below one-quarter current Stamina | +3 *instead of* +2 | Actual recorded Stamina; no stacking of fatigue bands |
| At least one authentic previous accepted shift with this same relative in the past 30 days | −1 | Immutable original household work receipt; no free NPC approval |
| At least three such genuine shifts | −2 *instead of* −1 | Independent original receipts, each with actual time and a checked attempt |

Household work DC is bounded to 8–18 in this initial implementation. The approach can be selected from the player's actual natural-language intent (`careful`, `standard`, `rushed`) when submitting `social.householdWork`. Its name cannot select a difficulty or a payment. Verified familiarity is **relative-specific**, not automatically skill rank, special technique, guaranteed wages or a previously unseen tool. The receipts include the full DC decision and paid costs. A declined job has no Crafting roll or paid labour.

The current one-consideration-per-family-member-per-day rule is **unchanged**. This patch does **not** retroactively reopen Maddoc's already checked Hedra job or pay him two Talons. The separate design question of correcting a failed job within the same working day needs its own evidence-backed continuation rule before being enacted.

### Early cultivation practice — Soul, Meridian, Arcane, Body and Rift

The original discipline and stage choose the base DC and allowed method. A short or independent session adds the existing +2 **once**, even when both descriptions apply. Previous training on the **current stage and method**, already written in the discipline ledger, can ease continued practical self-correction:

| Source-based factor | DC change | Evidence |
|---|---:|---|
| Short or independent session | +2 | Existing original route restriction |
| At least two recorded same-method sessions **and** at least 240 actual short-session minutes on the current training stage | −1 | Original method and elapsed-session ledger |
| At least six recorded same-method sessions **and** at least 960 actual short-session minutes | −2 *instead of* −1 | Same original ledger |
| Below half Stamina | +2 | Original recorded current and maximum Stamina |
| Below one-quarter Stamina | +3 *instead of* +2 | Original stamina ledger |

Practice DC remains within 5–35 for the currently supported early training stages. The learning discount does **not** change stage, grant Soul reserves, advance the underlying training track, grant rank, bypass an anatomical requirement, establish a tutor, or select a more favourable die. Skill and aptitude modifiers remain independent of this resistance calculation. Part-time practice continues to scale earned progress, not to substitute for an additional DC reduction.

For Maddoc, the saved Soul self-awareness record includes 2 method sessions and 369 verified session minutes, so **a future attempt** could receive the −1 familiarity factor, subject to actual current conditions. This does not change any previous result or guarantee future progress.

## Boundaries and next integration areas

This is **not** a single generalized DC over every power system. Combat, beasts and bonding, evasion, origin evolution, first-time research, competitions, specialist craft, social negotiations, ecological challenges and the original scene-check sources retain their current distinct owner-selected difficulties until each has genuine factors, proof and tests.

Upcoming owner-by-owner integration should consider authentic outdoor weather, visible footing and terrain, verified actual tools/material grades, real preparation with spent resources/time, help and hindrance from independently willing actors, opponent behaviours, injuries, exhaustion, familiarity with exact task families, quality tradeoffs and genuine quality inspection. These should be mapped to *specific witnessed mechanical sources*, not passed as freeform `+3 for good plan` numbers.

Where no relevant source-bound factor is available, DC stays at its owner-authored baseline. That is more fair than inventing an adjustment.

**Player presentation:** keep the approved dark ink/antique-gold fantasy windows unmodified; relevant dice appear inline with source-based DC factors, not as an oversized debug panel.

**Safety:** every changed mechanical roll must still execute through exactly one original chat turn, preserve source RNG, remain idempotent on replay, and commit an accurate campaign save only after GitHub acknowledges the action. Existing campaign saves, including Maddoc's, are **not migrated or modified** by this code change.
