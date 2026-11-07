# Finish Line A — Natural equipment and assessed combat actions (foundation slice)

**Authority:** original Unified Master Prompt §§41, 45–46, 50–51 and Table Rules; the existing protected `gear.*`, `combat.begin` and `combat.exchange` operations. This is **connection of existing systems**, not a new marketplace, a weapon skill ladder, or a combat rewrite.

## Everyday player intent now connects to genuine systems

- `browse market`, `what is for sale`, `merchant offers`: a **read-only** view of **previously witnessed local** item quotes; zero quotes is not a statement that all merchants have ceased to exist.
- `my equipment`, `equipment`: read-only record of genuinely owned, appraised mundane weapons.
- `buy <offer ID>`, `buy <unambiguous quoted item>`: purchase through the existing local real quotation at its authentic price and remaining stock. Multiple known quotes for an item must be disambiguated; no fake universal prices, item stock or seller responses.
- `equip <owned item>`, `draw <owned item>`, `put away weapon`: existing equipped-item verification, real minutes and the normal active-combat restriction.
- `fight`/ `start combat`: now open the **existing wound-model encounter only when an actually present opponent already has its separately source-recorded individual combat profile**. No default enemy statistics or hostility are invented.
- `attack`, `strike nonlethally with <equipped item>`, `defend`, `retreat`, `take cover`, `recover in combat`, `parley`: route through the existing one-opponent-independent-plan combat exchange. A strike uses only the **actually equipped** mundane action; no input chooses damage, success, modified dice or enemy intent. Retreat from a still-unengaged creature reuses the existing independent nonverbal safety action.

The private chat runner intercepts older `buy` and `fight` legacy shortcuts: neither may mint source-free provisions or start the retired HP combat merely because the player typed a familiar command. Unsupported intentions remain for real GM adjudication; this example does not declare other purchases, weapons or social responses impossible in the world.

## Proven operation and outstanding blockers

`tests/natural-equipment-combat-bridge.test.js` constructs **disposable and explicitly source-attested** merchant and animal records and then exercises real file-backed natural commands end to end: read-only offers → actual 250-Scale paid single-item purchase → equip → previously appraised wild opponent → real attack roll / independent opponent plan → replay-safe historical result. Separate disposable scenes verify defense and attempted withdrawal, preflight refusal of invented weapons/stock, and preservation of existing saved RNG and currency on rejection. The new test is included in the required complete suite.

**Current limitations:** Existing Aerin has **no recorded live merchant offers**, and this change does **not** invent any for her; the available-world-to-merchant-offer authoring process is still missing. Actual combat also requires individually source-backed foe capabilities, and the normal combat and advanced-technique limitations remain. The larger requirement of arbitrary natural-language intent with safe contextual GM adjudication is not solved by these phrases alone.

**Checkpoint protection:** No real campaign state, rolls or progress are changed by this development change.
