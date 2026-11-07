# Witnessed civil calendar anchoring

The private playable `world.setCalendar` operation is **not** permission to choose a year, month, season or source. A change in the absolute date can otherwise fake a summer Ripening interval, backdate a rite or alter independent festival and sixday calculations.

A legitimate one-time anchor requires a previously saved `table.calendarEvidence[evidenceId]` with `origin:'witnessed-civil-register'`, the actual settlement location and current game minute, an independently recorded council/official register, source and concrete full date in the canonical Aldmere 12×30+5 calendar. Its earlier story/world/progress witness must contain `details.calendarEvidenceId` and match the saved scene hash. The player request contains **only the evidence ID**. No date, era, source, bonus or witness can be minted through the request.

A successful anchor uses the dated record exactly, stores the authoritative date and source once, consumes the witness, and leaves the current world minute/RNG unchanged. An already anchored campaign, a non-settlement scene, a future-dated, malformed or mismatching proof must fail closed. Creating a new campaign through its independently seeded calendar is a different, pre-existing procedure.

The pure `world/simulation.js::anchorCalendar` remains available in isolated reference tests and original new-campaign initialization; it is not a direct free live route. Verified seasonal evolution procedures now rely on an honestly acquired calendar or a new-campaign fixed start, not on a user-selected favourable month.
