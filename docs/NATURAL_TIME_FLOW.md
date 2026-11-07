# Beastbound — Natural time flow at the table

**Purpose:** Keep a believable world clock without making every sentence or glance a separate stopwatch action. This guides **GM presentation** and uses **existing** minute, daily, sixday/month and calendar ledgers. It does not invent a second clock or change established campaign dates. The original Master Prompt §44 and Table Rules remain authoritative.

## One clock; three practical scales

- **Moment / conversation:** A player can look again at something they already read, answer an NPC, reconsider a choice or inspect the existing scene without being charged for every message. A first, source-witnessed event may record a meaningful elapsed interval. Keep natural dialogue flowing rather than posting a minute-by-minute receipt or forcing an exact dialogue menu. If an actual social rule needs a time cost or independent decision, its confirmed engine result remains authoritative.
- **Action / scene:** Travel, professional work, demanding study, purchases, field surveys, crafting and genuinely consequential negotiations consume the actual duration and resources from their verified rule **once**. Narrative may move across uneventful moments, but a skipped interval does not grant speculative progress or NPC consent.
- **Day / longer life:** Sleep, healing, keeping a job, training, journeys, weather, public services, feeding companions and longer downtime have real constraints. Daily processes occur on crossings; sixday and monthly world developments are processed once by the existing world finalizer. A period can be narrated fluidly until something needs the player's attention, with actual time and world changes recorded behind the scene. Never compress months into an unearned reward or bypass injury, partner care, food, deadlines or independent world developments.

## Two immediate mechanical improvements

1. **Re-read already witnessed unchanged guild postings:** `opportunity.board` now returns the same player-known notices with `minutes:0`, `alreadyKnown:true`, and no fresh scene/tick/turn revision. First-time authentic public notices still use their existing real five-minute board reading and are saved as witnessed evidence; new postings, when independently published, are actual new information.
2. **Spend an ordinary period waiting:** `world.wait({minutes})` offers **1–360 elapsed minutes** in an established safe **settlement** when no encounter or battle is active. The engine advances only the existing world clock and its appropriate processing; it cannot grant income, training, healing, tools, consent, discoveries or survival through a threatening scene. Waiting across midnight is intentionally refused: actual sleep, shelter or longer provisioned downtime takes over. The GM translates a natural request such as "I'll sit by the canal until noon" into a single elapsed interval based on the **verified** current time, without presenting a list of technical commands.

Why the safety distinction? Arbitrary `world.advance({days:365})` would silently skip rations, treatment, jobs, deadlines, animal welfare and other living events. The existing `world.advance({passageId})` remains the only protected provisioned **multi-day** route in this prototype. Safe short waiting should not require a fake government permission slip; genuinely long or dangerous passages still need evidence.

## Code's real division of work

The underlying **`s.world.minutes`** is the single elapsed-world-time value. `engine.advance` advances it and applies daily change at midnight. `rules/world.finalizeTime` observes an already-elapsed interval and **does not itself advance the clock**; it performs independent sixday/month processing with saved deduplication. `scripts/chat-turn.js` calls the finalizer at the end of a changing turn even if a specialized rule already called it; that is safe only because the original tick ledger prevents a second application. The new regression test explicitly checks this double-finalization safety and the same-roll/duplicate/request preservation through the actual file-backed turn processor.

## Still intentionally imperfect

Authored dialogue and some work procedures currently have fixed time costs (initial dialogue 12–14 minutes, 6-minute follow-ups, others vary), which are **approximate mechanical scene durations, not actual times for each spoken sentence**. They may need specific tuning if real play makes them feel implausible. Do **not** adjust all durations indiscriminately, replace every action with a generic wait, or silently falsify time to make a fast response. Address a demonstrable mismatch in the original rule rather than adding another time subsystem.

Aerin's current verified trial save is at **Day 1, 08:05 in Morrowfen Crossing** after genuinely reading two published field notices; this review does not undo or reroll that first five-minute action. The complete campaign reset remains reserved for the user's explicit end of this trial.
