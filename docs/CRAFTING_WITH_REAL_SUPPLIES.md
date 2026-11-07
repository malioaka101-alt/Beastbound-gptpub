# Realistic repeatable common medicine crafting

**Master Prompt authority:** §§35,44–45,49–51. Players may act again whenever reality permits: a recipe does not gain a universal once-per-day limit merely because the prototype originally used a convenient historical ledger key.

## One real attempt, every time

The previously implemented field poultice still requires its original **two owned marsh reeds, one ration, actual clean Morrowfen Crossing infirmary work surface **or** Lumenfall Annex clinic-laboratory, adequate stamina and genuinely learned fixed ordinary recipe**. Each attempt consumes **70 minutes, 3 stamina and both materials** and resolves the same original **one Crafting d20**, with success or lost materials determined by the real roll.

A practitioner who still has enough genuine ingredients and available stamina can make **another new attempt on the same day**, not reroll the first attempt without consequence. No general teacher, tuition fee, training rank, sixday wait, magical voucher or invented shortcut is required. An absent supply, unsuitable/unsafe setting, active encounter or full healing-balm inventory fails **before** spending any material or rolling.

## Accurate original evidence and historical checkpoints

Every modern attempt is appended to `table.fieldCraftAttempts`, including start/completion minutes, actual clean-worksite source witness, original immutable casting/check record, both hash-matched archived source events, consumed materials, original d20 and final outcome. The older `table.fieldCraftDaily[day]` continues to store the **first original historical attempt** and is never overwritten by later attempts, so previously saved campaigns remain compatible. The status display continues to answer `preparedToday` for legacy clients while explicitly reporting `attemptsToday` and `dailyLimit:false`; `preparedToday` is descriptive, not a restriction.

A subsequent attempt can succeed or fail independently because it represents **new ingredients, work and exposure**, not a second die for the same already resolved batch. Only one actual output balm is possible per successful attempt. Storage capacity is checked before any dice, materials or time are spent.

The full modern supply chain is still bounded: this change does **not** grant field camping a magical sterile bench, grant access to unestablished private facilities, create unheard recipes, invent rare reagents or allow free medicine for incapacitating injuries. Other plausible crafting methods can be fairly adjudicated when their tools, knowledge and circumstances are genuinely established. Larger Master Prompt crafting, item quality, durability, world market supply and provenance of every ingredient remain unfinished.

`tests/field-crafting.test.js` verifies separate genuine d20 attempts, distinct source witnesses, real consumed materials and time, old-save first-attempt preservation, full-bag preflight and two idempotent file-backed natural-language crafting turns in disposable saves. The complete regression inventory remains a required green CI gate; no active campaign save is modified.
