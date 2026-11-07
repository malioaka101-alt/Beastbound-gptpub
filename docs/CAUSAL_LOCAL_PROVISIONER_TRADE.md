# Finish Line A — causal local provisioner, real quotations and stocked purchases

**Master Prompt authority:** commerce and resources §§35, 44–45 and inventory §50; natural freeform action §41, original world simulation §5 and checkpoint §51. **One genuinely playable local example, not an exhaustive town, vendor class, or universal price list.**

## Real world facts before the player asks

The existing Morrowfen Crossing already has a market, local regional grain/feed, the independently simulated Reedmarch economy and an original named beast provisioner **Orrin Vale** (`Engine.NPCS.otto`). The original engine already defines **clean rations** and their nominal cost; it does *not* establish a weapon merchant with infinite stock. We therefore reuse this genuine, mundane food source instead of inventing a quartermaster.

The existing `world/simulation.js` realm seeds a small, **physically finite** clean-ration stock from Morrowfen Basin's recorded forage and grain/feed economy. It separately preserves Orrin's merchant float, historical original supply context and later actual sales. The provisional merchant stock is *world-owned, not created by inspecting a shop*. This beginning regional goods model remains simplified; it is not an exact simulation of farms, granaries, wages or grain purchases.

On later **actual sixday world ticks**, the provisioner attempts a modest two-unit maximum wholesale replenishment against existing grain-market conditions, ecological supply and *his own remaining capital*, paying 500 Scales per real replenished ration. Funds and stock change together; if supply or money fails, no new stock is generated. No player visits, quests or idle character progression create supplies. Existing saved realms without the new field adopt a conservative current-state seed on their first relevant authoritative world access; past transactions are not invented.

## What an in-world player may now do

At the original daytime Morrowfen Crossing scene, a character may **"ask Orrin about supplies"** (or comparable phrases). `gear.inquire({npcId:'otto'})` verifies his actually present work shift, calm scene, the original market and the independently tracked stock before it records a five-minute in-person quoted price. The quotation uses the already authored ration value and current simulated regional grain index. The seller never becomes a compulsory teacher, employer or legal contracting gate.

**"Browse market"** remains read-only. It exposes only offers already personally heard—not a secretly generated universal market inventory. **"Buy clean rations"** or `buy <witnessed offer ID>` then uses the existing `gear.purchase` rule with real money, original price, one owned food unit, a ten-minute purchase, finite seller stock and credited seller funds. Multiple separate purchases are allowed while genuine supply exists; there is no arbitrary daily shopping limit. Replayed turn IDs cannot spend twice.

The source-authenticated quote contains an immutable price/source proof. An edited saved quote price is rejected rather than used; an expired/remote quote is not valid. New consultations can quote newly replenished stock when the merchant is again physically available. Out-of-stock and after-hours requests are honestly refused, without rerolling or overwriting the last verified checkpoint.

## Honest limits and safe development

- The one currently live commerce journey is **the existing provisioner's clean rations**, not a general shop stock generator or weapon appraiser. Equipment purchases still require genuine separately witnessed martial supplier evidence.
- No on-demand arrival, automatic seller consent to unusual contracts, bargains, arbitrary craft goods, rare materials, currencies or magical supplies is introduced.
- Later world economy will need additional independent supply chains, seasonal food logistics, proprietor decisions and physical transfer, but they can reuse the same stock/quote/currency pathway.
- No player progress, rations, coins, rolls, extra NPCs or material stock was written into the original Aerin save during development. `tests/live-provisioner-trade.test.js` uses only disposable original-source-correct saves and guards sold-out stock, original quote proof, true time/currency and world-tick resupply. All project tests are required to remain green.
