# Engine-generated habitat survey: first playable witnessed scene check

Beastbound's Master Prompt requires ecology to remain an independent part of the world, and checks to reflect the character's **actual learned ability**, not a requested difficulty. The protected `core.check` runner previously required a prior scene record but ordinary wilderness gameplay could not create one without manual evidence editing.

## Supported sequence

1. Travel to an already authored, open local habitat (currently Copperwood forest, Whisperfen wetlands, Ashwind hills or Riftglass ruins). `world.habitatSurvey` accepts **no parameters**. With no open encounter and enough Stamina, it spends 20 real in-world minutes and two Stamina examining the actual habitat, then records a specific observable terrain cue and issues one `checkId`. The fixed provisional Survival DC comes from the existing local fieldwork/foraging difficulty baseline: **12 in ordinary forest, fen and hills; 17 in the ruins**. The user cannot choose this DC, the sample, a species, source text or a bonus.
2. `world.habitatSurveyStatus` is a read-only way to retrieve the pending visible check ID. It does not roll, grant clues or alter the save.
3. Request the *same witnessed check ID* with `mode:'check',checkId:...` or protected `core.check`. The engine validates the original scene hash, physical location, age, fixed ecological cue and unmodified difficulty; derives the actual Wisdom + earned Survival modifier; then rolls **once**, consumes the witnessed chance, and spends another 15 minutes. It stores the observed interpretation (or inconclusive result) in `table.habitatSurveyFindings[checkId]`.
4. A given habitat can only be prepared once per **in-world day**, with no second pending preparation while a recent attempt is unresolved. Different chat turn IDs do not create rerolls. Traveling away invalidates the prepared local opportunity.

## What this does NOT establish

This survey describes observable ground signs, not a guaranteed individual beast encounter, named species, rare Grade, evolution branch, contract opportunity, loot, herb harvest, daily skill PP, verified research hypothesis, trained discipline, shelter, or safe time passage. A successful Survey check shows that the visible terrain evidence was interpreted, not that an undiscovered animal or secret power was identified. World ecology, weather hazards, ecological depletion, broader survival tasks, specialized species research and true foraging still require properly sourced rules.

The four provisional local DCs are implementation baselines already present in the legacy fieldwork model, **not a claim that the entire Master Prompt has a universal ecology-survey DC table**. This workflow deliberately offers a useful grounded ordinary action while continuing to fail closed on unsupported rewards.

Files: `rules/habitat-survey.js`, `rules/scene-check.js`, `tests/habitat-survey.test.js`. All tests use disposable state; no actual campaign checkpoint is edited.
