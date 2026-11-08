# Beastbound — Time belongs to the scene, not a stopwatch

**Latest player direction, 7 November 2026:** ChatGPT is the GM and must judge how long the player's intended action reasonably takes, using the actual circumstances. Do not have players negotiate exact minute costs, follow a mandatory schedule, or be forced into preset 6-hour/6-day blocks. Normal life and sustained research can take **weeks to months**. This is the *original Master Prompt §44*: seconds for urgent action, minutes for interactions, hours for work and travel, days/weeks for projects, months/years for sustained development. The Table Rules already say routine time flows in prose until a situation deserves attention. This instruction supersedes the previous strict timing assumptions in this file and early prototype durations as GM defaults.

## One world clock, GM-directed scale

The GM makes a grounded judgment from **what the player is trying, how they are going about it, how capable and equipped they are, the physical setting, help or hindrances, access to facilities, and their established routine.** Durations are not fixed per phrase or per button. Two conversations need not both last 12 minutes; two researchers may need very different amounts of time. The GM can say a short exchange takes moments, a difficult repair takes most of the afternoon, or a long project spans successive months.

A quick look, re-reading known information, or ordinary give-and-take inside an ongoing scene normally costs no extra mechanical time. There is no automatic charge per ChatGPT message. When an *actual existing rule* resolves a meaningful scene with its own elapsed time, that confirmed result remains the saved authority—do not deduct another GM-estimated duration. Where that fixed duration conflicts with the real fiction, identify a concrete future rule interface to improve; don't silently rewrite the result.

The underlying `s.world.minutes` is **the only clock**. `engine.advance` applies original daily changes as time passes. `rules/world.finalizeTime` processes source-owned sixday and month developments once, with an idempotent event ledger. NPC agendas and beast ecology change independently. The GM gives players only the changes they could actually observe, hear or learn.

## Flexible time between meaningful events

The existing `world.wait({minutes})` (a mechanical request from the GM, **not** a menu for the player) now records a GM-judged interval from a few moments to **weeks or months in one operation** where ordinary life at an established settlement is plausible. It may cross midnight, sixdays and months; no 360-minute stop. The code uses a one-year-per-request *technical processing guard*, not a story gate. Larger periods can be divided at significant developments and continued. It **does not** itself award research evidence, wages, mastery, reputation, healing, supplies, automatic permission or NPC loyalty. The same existing check/save/idempotency process verifies each substantial change.

**This is not a magical unattended skip.** Before moving weeks or months, the GM must consider the actual conditions: housing, meals, finances, obligations, work, injury, animal partners and their welfare, weather, public schedules, politics, ecological developments and research access. The passage operation intentionally returns `lifeNeedsNotCertified:true`: it handles clock and world ticks **only**. It must never be narrated as proof that upkeep was paid, research completed, companions received care, a person survived an unsafe situation, or a catastrophe did not occur. Use actual established receipts and existing health, trade, craft, research, employment and animal-care rules for those outcomes. If those circumstances cannot be established or a genuine event intervenes, stop the interval at that point instead of declaring that months went smoothly. A stable daily routine can be abbreviated in prose rather than played as repetitive accounting, but cannot mint unearned income or conceal known unpaid costs.

For example, if a player spends six weeks conducting a documented research project, the GM may portray the accumulating daily texture and skip unremarkable days **while actual research procedures settle progress, setbacks, expenditure and discoveries**. The *weeks* are not a free skill grant; the GM chooses how far the next narrated segment reaches, depending on progress and interruptions. A player who says "I keep living and working here" similarly should not need to supply the exact number of minutes, but their livelihood needs a genuinely established source and any consequential obligations remain in view.

## Protected boundaries

- An active combat or beast encounter cannot be turned into an uneventful skip.
- A person who is incapacitated, dying, knocked out or dead cannot be declared to have acted normally without genuine intervention.
- Ordinary safe-settlement passage does not claim to model wilderness danger, long travel, hospital care, or missing shelter. Those require their own real circumstances and rules, not a fictional 'time visa'.
- A duplicate turn never advances time twice or rerolls. A stale checkpoint is rejected. Advancing across calendar boundaries must process sixday/month independent developments **once**.
- Do not impose the existing `world.advance({passageId})` provisioned-downtime fixture on all life, social, research or travel time. It represents a particular sourced kind of stay, not an absolute rule that every week requires a signed registrar's approval.

## Current trial

Aerin's last verified trial checkpoint remains **Day 1, 08:05 at Morrowfen Crossing** after the first reading of the public board. The repeat-board fix removes only *future unnecessary reread charges*, not the already saved first five minutes. The player requested a complete fresh campaign reset **after** the trial, not now.

**Guiding principle:** I decide credible duration as GM. The engine ensures time, facts and material consequences stay real. Neither a rigid stopwatch nor an unexplained free reward should govern the world.
