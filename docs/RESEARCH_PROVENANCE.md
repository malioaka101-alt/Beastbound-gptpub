# Protected research provenance — live private-chat rules

The Master Prompt and compiled System Additions Part 19 are authoritative. The JavaScript `rules/research.js` formulas are **reference calculations**, not evidence that a researcher earned a rank or discovered a secret. This document describes the limited verified **private-chat route** supplied by `rules/research-guard.js`. It does not imply that every research field, institution, profession or prototype Python system is implemented.

## What must exist before an action

- `research.start` accepts **only `{id}`** and requires an independently established, source-dated `table.researchPlans[id]` with a sealed `parameters.truth`, grade, novelty, project kind, skill, title, scope and fixed requirements. The normal DC and track are calculated from grade and novelty, never supplied as a lower value in the request or plan. Lead rank comes from the player's saved skill. The plan is consumed by genuine project registration; it does not teach that skill.
- `research.survey` uses the recorded skill/attribute modifier, requires appropriate prior rediscovery source when relevant, makes the actual check and spends two in-world hours.
- `research.week` spends a real sixday and grade-dependent material cost; only the recorded skill/attribute modifier and earned preparation count. Mentors, facilities, assistants and accelerated resource bonuses are disabled until their own witnessed/paid support records exist. A part-time selection is allowed, without arbitrary extras.
- `research.fieldwork` consumes a specifically source-dated `researchFieldEvidence[id][eventIndex]` record matching the actual log event's SHA-256 digest and exact research question. One scene check cannot be freely relabelled or counted across multiple projects. Fieldwork **does not reroll** the underlying scene.
- `research.hypothesis` accepts a hypothesis text but not an invented modifier or accepted-answer list. Comparison is against the **sealed**, precommitted research truth.
- `research.proof` accepts only a project ID and optional actual extra earned Insight. Beyond-tier theory proof requires an independently established, named tester at the right tier; no request Boolean can impersonate one.
- `research.replication` requires an actual externally named, source-dated tester with established skill and ability. It uses that person's recorded modifier, consumes actual laboratory materials and the one-use external test opportunity, and awards recognition only when the original source formula's conditions pass.
- `research.mythLead` requires a previously visited/observed named source with a dated location and independent difficulty. Beastlore/Faith & Cosmology and Wisdom from the **saved** character determine the check. Source text and +100 modifiers cannot be submitted as free evidence.

## First playable source-authored research fieldwork bridge

For a pre-existing verified `kind:'ecology'` project only, an independent source-dated `researchPlans[id].habitatFieldworkScope` may precommit a concrete physical terrain question to one of the already authored local habitats. After `world.habitatSurvey` and the real `mode:'check'` resolve that exact terrain observation, the protected `research.habitatFieldwork({id,checkId})` route verifies the whole scene-to-roll-to-project chain and credits the recorded check's margin under System Additions Part 19 §3.5 **without a second roll**. The original at-most-two-per-sixday limit applies, and one rolled scene is usable for only one project. This creates honest ordinary research progress **only** when a real project scope predated the observed terrain. It neither authors sealed research truth nor asserts any undiscovered organism or hidden biological property; see `docs/ECOLOGY_FIELDWORK_BRIDGE.md`.

## Boundaries

All precommitted facts above must come from independently established **GM/world** evidence and saved ledgers, not from a player assertion in a chat request. Ordinary research actions cannot mint such sealed truths, independent sources or authenticated external personnel themselves. Older unverified prototype projects must be explicitly reconciled rather than silently accepted as established scientific truth. Real quests, laboratories, funding, institutions, publications, patents and all higher-tier research systems still require further work.

Tests: `tests/research-provenance.test.js` (disposable file-backed workflow) and `tests/python-translation.test.js` (legacy integration fixture only). No actual campaign save is edited by these tests.
