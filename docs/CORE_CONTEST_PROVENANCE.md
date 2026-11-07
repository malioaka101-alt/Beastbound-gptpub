# No unsourced opposed contest rolls

A private Project chat request must not run `core.opposed` or `core.contestForce` with arbitrary player- and opponent-chosen bonuses, numerical magnitudes or advantage. Those two low-level operations are **not playable** routes.

Their underlying `rules/core.js::opposed` and `rules/combat.js::contestForce` are preserved for reference vectors and future source-authenticated skill and combat procedures. A legitimate opposed contest still needs independently established participants, learned ranks, valid equipment, physical magnitude, arena and timing, with the one-and-only appropriate roll handled by a dedicated verified action.

Use `combat.exchange` for currently supported wound-model combat, and `mode:'check'` with a precommitted witnessed challenge for currently supported individual field tests. Do not inject a fake opponent, guarantee a skill outcome or reroll a contested action through these reference helpers.

Regression coverage: `tests/core-contest-guard.test.js` on disposable files only. No historical campaign save or die outcome is altered.
