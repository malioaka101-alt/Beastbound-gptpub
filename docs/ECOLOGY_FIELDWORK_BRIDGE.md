# Habitat survey to independently scoped ecology research fieldwork

This is the first bounded bridge from a genuinely **engine-generated ordinary observation** into the original Research framework, without a second dice roll, free research hypothesis or GM-authored success retroactively attached to a scene.

## Player and GM workflow

1. The game must already contain a **source-dated** `table.researchPlans[projectId]` with a valid sealed independent research truth, `parameters.kind:'ecology'`, recorded grade/novelty, and `habitatFieldworkScope`. The scope must have been independently established *before* the physical field observation. It names the project, exact authored site and biome, exact observable `subject` from the supported terrain survey, a dated independent source and a specific `relevance` explaining how this **physical terrain measurement** bears on the research question. It cannot claim that a specific hidden species, mystical resource, numeric Grade or secret evolution condition is proven by observing ordinary ground signs.
2. Start and survey that project with the existing protected `research.start` and `research.survey` actions. All genuine grade, cost, learned rank and sealed truth checks remain in place.
3. Travel to the precisely pre-scoped habitat. Use `world.habitatSurvey` and the returned `checkId`, then resolve `mode:'check'`. This spends the actual observation time and Stamina and makes **one real Survival roll** against the pre-existing local ecological challenge. The completed `table.habitatSurveyFindings[checkId]` now records the **exact roll log index and SHA-256 digest** as well as the earlier observed scene hash, location and result.
4. In the **same sixday**, submit `research.habitatFieldwork` with **only** `{id:projectId,checkId}`. It confirms that the research plan really predated the observed scene, the scope matches the specific geographical cue, and the roll, original environment, resolved result, research project and log all agree. It reuses the original roll's margin for **0/1/2/3** normal research points, adding **no further check, extra scene time, materials or claim of independent proof**. A failed observation legitimately awards zero.
5. The existing original research fieldwork limit of **two intervals per sixday** applies. A roll cannot support a second research project or another interval by changing turn IDs. The used roll digest and project-bound record are saved. The research milestone system may reveal clues only from the pre-existing **sealed project truth**, not from the incidental terrain observation.

This does **not** create research plans from arbitrary chat requests, discover secret species, provide lab equipment or independent scientific reviewers, lift proof requirements, or grant techniques, rare materials, evolution progress or a new chance to reroll.

## Mechanics and evidence

The protected bridge is implemented in `rules/research-habitat-fieldwork.js`; the generic `research.fieldwork` route remains stricter and unchanged for other research-scene types. There is no new d20: both research routes reuse a previous witnessed check according to the source fieldwork rule (System Additions Part 19 §3.5).

Regressions: `tests/research-habitat-fieldwork.test.js`, using disposable in-memory and file-backed saves. Existing campaign saves are not edited.
