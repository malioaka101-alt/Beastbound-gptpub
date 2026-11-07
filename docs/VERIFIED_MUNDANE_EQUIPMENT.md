# Verified mundane equipment: merchant quotes, actual payment and equipped use

## Scope and canon

The unified Master Prompt **§50 Inventory, equipment and crafting** requires possessions, currency, equipment quality and compatibility to remain real world facts, not arbitrary values in a chat request. `rules/player-combat-action.js` already prevents claiming free weapon damage or an unlearned technique. This limited workflow connects those checks to an **actual paid weapon acquisition** without inventing a complete merchant/economy subsystem.

## Source-authorised transaction

A merchant must independently establish `table.merchantOffers[offerId]` **before** the player purchases: a publicly witnessed merchant identity, real current location, source description, posted quote time and expiration (within one sixday), unit price in **Scales**, remaining stock, exact mundane weapon item, and an independently appraised `action` record binding item, attribute, damage, Offense M, attack bonus and nonlethal capability. The playable `gear.purchase` operation accepts **only `offerId`**. It cannot set a zero price, claim new stock, replace learned combat actions, choose a magic effect or buy a weapon not seen in the current merchant's offer.

The transaction checks remaining stock, unique equipment identity, current world time, local presence and funds **before** spending anything. On success it takes a real 10 in-world minutes, deducts the exact quoted Scales through the finance ledger, decrements merchant stock, records a single sale, adds the real item to inventory and registers **the previously appraised mundane action unchanged**. Repeated turn IDs are idempotent. A second distinct attempt cannot purchase a sold-out item or double-claim the registered action.

`gear.offers` shows only *publicly known, previously recorded local offers*, with their stock and advertised Scales prices, and `gear.status` shows genuinely owned, verified mundane equipment. Both are read-only. A regional market index is **not a binding merchant quote**.

`gear.equip` requires actual inventory ownership of a previously recorded mundane action, spends one in-world minute, and cannot be performed in an active combat round. `gear.unequip` also takes one minute and cannot bypass combat timing. Neither operation invents attack strength. With the item equipped, the already tested `combat.exchange` route derives its attack modifier from the recorded STR/DEX attribute, earned Combat rank and the previously appraised weapon; damage and magnitude remain unchanged. The attack can select only known mundane actions and permitted nonlethal use.

## Still unfinished

There is **no trustworthy automated world-to-offer authoring pipeline yet**. Absence of a witnessed vendor quotation means `gear.purchase` fails closed, not that all towns have a universal stock of free weapons. There is no universal equipment catalogue, crafting, durability wear, armour manufacturing, barter, haggling, owner trade, weapon skill learning, forged magical artefacts, or inventory weight/slots. A seller's claimed source is precommitted world evidence, not a magical verification certificate. Wider legal and ecological consequences of rare weapons remain to be implemented.

Integration: `tests/gear-transactions.test.js` uses **disposable synthetic stock only**, testing the full quote → payment → inventory → equip → combat path without editing a campaign checkpoint.
