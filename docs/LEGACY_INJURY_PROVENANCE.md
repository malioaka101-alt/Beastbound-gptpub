# Legacy injury migration provenance

This route is for historical HP saves that already record injury but do not yet have a wound-model combatant.

The playable `health.migrateLegacy` operation accepts no caller-selected wound pattern or justification. Before invoking it, the GM must have independently established `table.legacyWoundAdjudication` with origin `prior-independent-injury-ruling`, exact player HP and max HP, a timestamp no later than the current game minute, source, named adjudicator, reason, and nonzero Light/Serious/Critical wound boxes.

The verified migration preserves historic HP, applies the committed wound boxes and consumes the adjudication once. Stale, fabricated, zero-wound or anatomically impossible records are rejected. For an uninjured legacy save use `health.ensurePlayer`. The underlying `rules/unified.js` conversion helper remains for isolated calculation tests, not unsourced in-world migrations. No real save should be automatically reconciled.

Test coverage: `tests/legacy-injury-migration.test.js` on disposable saves only.
