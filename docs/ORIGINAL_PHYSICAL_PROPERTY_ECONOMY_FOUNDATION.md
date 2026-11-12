# Foundation #19 — Property begins with actual physical custody

**Master Prompt basis:** §§35 and 50 require plausible ownership, land, labour, materials, services, wages, prices, scarcity, quality, provenance, regional supply/demand and physically grounded crafting. This is the **first connected source-backed property slice**, not completion of the deeper economy.

## Why this is part of the Game Master, not a new shop or world-generation menu

The GM can describe any appropriate ordinary physical asset, work context and local custom in natural language, grounded in the actual scene and the world. This slice links a freely worded description to items someone **already physically owns**. It does not fix a list of types of organisations, cultures, shops or livelihoods. The existing catalogue only restricts *physical items that the current engine can actually verify*: it does not limit possible future GM-authored assets or invent a special currency.

The authoritative stock remains in the **original** inventory, existing voluntary person material-custody receipts and the existing merchant's inventory. The same source-grounded owner and item can be observed at their original location and registered in `s.table.materialAssetAttestations` with the original quantity, date, description, owner identity, original custody source and exact source hash. This is an observed asset description, **not an official title, a property-rights adjudication, a price or a compulsory transfer**.

Use `social.documentOwnedMaterial` only with `ownerId`, `item`, `quantity` and a freeform `description`. The mechanism does not allow changing the original owner, asserting a magically better item, attaching arbitrary legal rights, adjusting stock, manufacturing an object or selecting another person's consent. `social.ownedMaterialHistory` reads the player's source-known observations. A person who accepted one real item may later consume it on the original independent world tick, while the historical ownership record remains; their **current private holdings are not disclosed**. A merchant can genuinely sell an attested lot: the recorded historical item does not replenish the original physical stock or reveal a distant merchant's current private account.

`tests/economy-existing-owned-material-assets.test.js` checks original player stock, merchant stock during a real paid purchase, one authentic independently accepted NPC handoff, future independent consumption, exact save reload, source-based forged-quantity rejection, no extra coin or item minting, and repeat/invalid input protection. Existing three-batch full regression plus final integrated gate applies. Tests are **pending**.

## Still missing before #19 can be accepted

This first slice is intentionally conservative. #19 needs GM-authored assets beyond the existing item types with legitimately supported land, tools, buildings, stock, use rights and separate possession/title disputes; actual physically conserved production chains with processes, by-products, waste, maintenance and finite inputs; variable regional demand and supply with known provenance; ordinary independently agreed wages, loans, credit and contracts; and responsive trade routes, scarcity, transport and ecological/cultural conditions. These must use real already-established workers, goods, owners, currencies and existing world ticks and **must not make every skill or business require fees, licences, a named office or an abstract permission menu**.

## #18 remains open but deliberately set aside

Organisational and political depth remains **OPEN** rather than being declared complete. The existing accepted changes and original 198/198 green merged regression are preserved. An unfinished draft on `foundation/independent-original-diplomatic-envoy-appointments-20261112` remains **unmerged** and must not be adopted as canon or constrict the world. Later #18 work must represent real ideological differences, beliefs, cultural and species-specific philosophies, magical/power-system realities, governance, social movements, legitimacy, moral disagreements, independent people and dynamic nonhuman institutions. Politics cannot be reduced to a universal fixed rank list, a single preselected envoy or simple relation-score rolls.

**Status:** 17/25 foundation items accepted, #18 paused OPEN, #19 active OPEN. Do not alter active campaign `saves/`, `requests/` or `results/`; never import Jory campaign facts into Aerin's game.
