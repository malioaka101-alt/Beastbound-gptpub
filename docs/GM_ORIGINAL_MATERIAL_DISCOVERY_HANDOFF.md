# GM-authored physical discoveries → original property and invention systems

## What this implements

Beastbound already has **one original physical inventory** (\`s.player.inventory\` and \`rules/unified.js::planItems/applyItems\`), source-attested player property (\`rules/material-handoffs.js::attestAsset\`), one original d20 (\`rules/core.js::check\`), and freeform \`creation.draft/evaluate\` dossiers. A previously unrecognised *visible variant* of an already owned resource lacked a durable, usable and accountable identity in the original creation evaluator. Merely adding \`materialRecords[id].verified=true\` was not source evidence.

The specific new bridge \`rules/material-discovery.js\` observes **an already existing** one-unit physical asset: the player has the original item and a previously source-attested owned-material observation. Its original visible variant name must actually occur in the current GM scene. The original appraiser's Crafting/Intelligence and a single ordinary d20 resolve whether the identity is established.

**On success**, exactly one unit of the original known item is transferred from the original player inventory into a sealed source-verified, one-unit reservation in the **existing** \`s.table.materialRecords\` referenced by \`creation-design.js\`. The result is a *real conserved sample* with a GM-authored physical identity, not a new item type minted into \`E.RESOURCES\`. One historical original owner witness, one original check event, time, stamina, location, and before/after stock amounts are retained for later source verification. The material has no automatic quality Grade, rare rarity, price, newly manufactured recipe or supernatural effect.

**On failure**, the original d20, time and stamina are recorded but no named material identity or stock movement is created. An unchanged original source asset cannot be appraised repeatedly for favorable dice.

## Supported operations

- \`social.documentOwnedMaterial({ownerId:"player",item,quantity:1,description})\`: the preexisting original property observer, for one truly held known item. It does **not** create the item or assert its variant.
- \`creation.appraiseSourcedMaterial({assetId,materialId,name,visibleBasis})\`: attested physical item and visible original scene, exactly one original appraisal; a successful result reserves one existing unit.
- \`creation.materialStatus({materialId?})\`: player-known observations, original source, still physically reserved unit and status. Read-only; does not change a save.
- \`creation.releaseSourcedMaterial({materialId})\`: releases one still-reserved physical sample to **the exact original resource key**, once, through the same original inventory transfer with a durable return receipt and real five-minute handling.

\`creation.evaluate\` and incomplete drafts now distinguish truly sourced held variants from merely named fictional materials. A sample with its own ID can satisfy a proposed **material-identity and physically held quantity** precondition. It does **not** allow execution of any formula or design without its separately source-proved physical or magical mechanism. Releasing the sample makes its current quantity zero, while keeping the historical discovery source. If any material record or original asset is altered, the evaluator refuses rather than trusting a bare \`verified\` flag.

## Explicit non-goals

- Do not infer that a novel geological element, biological organism or supernatural property exists just because an ordinary ration/reed had an unusual visible trait. The appraisal identifies an observed physical variant **of existing source-owned stock**.
- No discovery creates wilderness deposits, vendor stock, hidden lore, a laboratory, equipment, a recipe, an original technique, cultivation advancement, market price or legal patent.
- Nonstackable unique objects continue to be owned by \`creation-prototype\`/\`equipment\` and observed through original \`material-handoffs\`; they are not secretly counted as generic inventory.
- Novel substances without an existing physical source, crafted transformations, actual laboratory assays, third-party property, new market quotations and particular novel energy effects remain open-ended possibilities needing distinct future source evidence.
- \`scripts/chat-turn.js\` distinguishes \`creation.materialStatus\` as a true read-only query. No active campaign save is edited.

## Regression

\`tests/gm-original-material-discovery.test.js\` covers one real pre-owned physical sample, witnessed GM name, original skill check, one-unit debit, isolated typed source receipt, design evaluation before/after recognition, source-tamper failure, exact release, failed independent appraisal and replay safety. It uses only a disposable new test state.

This is the same philosophy as \`docs/SYSTEM_CONNECTION_AUDIT.md\`: the original property and physical-work systems own resources; the GM owns worlds and plausible discoveries; only independently proven effects may enter the existing mechanics.
