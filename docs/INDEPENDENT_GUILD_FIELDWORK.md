# A living guild issues fieldwork without waiting for the player

**Source:** Beastbound Unified Master Prompt §§5, 11, 35, 44–45, 47, 51; Table Rules on real world time, independent organisations, honest dice, witnessed facts, and player-known information.

## Independent world issuance

The Naturalists Guild now publishes limited public forest and fen habitat fieldwork at **the world's initial date and again on each actual sixday boundary**. The world authored notice is stored in `world.guildFieldwork` state with an original ecological snapshot, the real issuing guild, region, dates, purpose and an immutable content hash. The simulation publishes using genuinely recorded ecology and the guild's *active* status, before any character reads the board.

A character's `opportunity.board` / `quest board` action **only copies already-issued public terms into player-known witnessed records** and costs five real minutes. The reading action doesn't select the regional ecological condition, invent a new job, produce a roll, or guarantee a contract. If the real institution has no current notice, the board is empty rather than convenient. Existing player-known legacy notices retain their old personal witness; they aren't retroactively attributed to world notices that didn't exist in their original save.

The published notice's dates and natural conditions persist even as the world changes and the notice expires. A change in actual guild funding/status can prevent new postings. Ignoring a request does not freeze or reveal the world.

## Authentic field report, later world response

Real `world.habitatSurvey` and `core.check` already require a local observed challenge, a genuine skill result, terrain, available stamina and elapsed time. Their original **actual observation and resolved roll events are now retained as separately hash-matched evidence**, so the short 90-line narrative log may rotate without destroying legitimate old work. New tests confirm reusing the original result, including inconclusive checks, and rejecting altered copies. No second die is rolled merely to satisfy the guild.

Filing a valid report at Morrowfen Crossing during the registrar's real shift records the original personal receipt **and delivers a source-authenticated report to the institution's private inbox**. That is not a cash transaction, paid employment, guaranteed rank or automatic favourable NPC reaction.

On the next actual sixday tick the guild examines previously received reports *independently*. Only if the report was interpretable, the real habitat remains under measurable stress, the institution is active and has actual abstract funds and operational capacity can it allocate a small field inspection. This consumes one actual abstract guild budget and capacity point and creates a sealed original assignment with the source report, site and allocation. Other reports are reviewed without authorising an inspection.

**A separate, later sixday visit now actually occurs** for scheduled crews. The simulation checks the guild is still able to dispatch staff and re-measures the actual habitat after other ecological changes. Staff may be cancelled if their guild has become inactive, find that no repair is needed, survey without successful stabilisation, or perform a single small physical stewardship measure at an affected margin. Site tractability uses the world's *own* independent RNG, not the player's dice or a caller-selected outcome. A successful bounded intervention reduces real local pressure by at most one and increases quality by at most one, consuming the **previously allocated** budget and capacity; it cannot change entire species populations, water, forage or distant regions by fiat. A failed, cancelled or no-need visit changes none of those measures. Original assignments and completed outcomes have separate source hashes and reject falsified outcomes or repeated resolution.

The initial approval and the eventual visit both produce relevant **delayed** public news, not immediate telepathic updates to the player's journal. Neither guarantees player currency, skill rank, ecology repair, a continuing job, private NPC favour or a guaranteed journey. Existing previously approved but unscheduled legacy reports remain valid historical records; they are not retroactively treated as crews that secretly visited.

## Safety and partial parity

These are limited public fieldwork opportunities, **not the complete §47**. Private commissions, guild negotiation, dynamic rewards from legitimate Talon accounts, real contracts, petitions from other issuers, stakeholder disputes, competition opportunities and much wider economy/ecology consequences remain needed. Only the known original source and actual observed evidence can progress this path. No universal teacher, fee, animal partnership, age gate or character role is imposed.

Full disposable-save tests in `tests/habitat-survey.test.js` cover offscreen issuance, unknown notices staying private, independent seasonal republication, world-source tamper rejection, scene-log rotation, valid guild inbox delivery, separately scheduled later visits, success/failure/cancellation, small bounded ecology changes, independent staff decisions, resource constraints, immutable source results, no extra player dice, no invented pay and replay. No active campaign save is modified.
