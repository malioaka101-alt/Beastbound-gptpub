# Foundation #18 — actual foreign relations and material trade-route consequences

**Authority:** Original Beastbound 57-section Unified Master Prompt §§33–36: independent polities, real organisational cause and effect, shared routes, local laws, supply, and regional politics. GM-authored context is unrestricted by a mandatory faction/route menu. Only authentic mechanically decided facts may enter a campaign save. Current Table Rules separate publicly received news from secret actual world state.

## Already independent world: use the same calculations, not another economy

The original `world/simulation.js::tickMonth` already resolves each configured corridor's actual **risk, shipping flow and disruption** from a real world RNG sequence: weather (`noise(0,10)`), risk shift (`noise(-5,5)`) and shipping flow shift (`noise(-9,9)`). A real existing diplomatic pair's prior `war` or `strained` status affects the route; no relation invents no diplomatic pressure. The resulting goods flow already affects original markets. One original merchant bulletin is emitted when disruption changes and becomes public only after **six actual elapsed days**. A diplomatic status change later in the same monthly tick first affects this earlier route calculation on the **next month**; retroactively updating trade based on later events would be false.

This patch does not create new routes, merchant cargo, trade contracts, treasury balances, taxes, tariffs, legal rights, passage permits, sanctions, international negotiations, foreign representatives, treaties or NPC member decisions. It does not create an extra market or shipping roll. No one is automatically assigned guilt for a weather-driven closure. An original tense relation may influence risk while an original war disrupts travel, but neither proves a specific treaty or official's consent.

## Narrow original route-event evidence

The same already existing `w.routes[routeId]` may now retain optional `originalChanges` entries **only if its original monthly disruption boolean actually changes**. Each source includes:
- the original route ID, two actual atlas polities, existing mode and capacity;
- real original world day and month, prior risk, risk and flow after the independently resolved event, disruption before/after;
- precisely the **three original world RNG draws**, with RNG before/after, replayable through the existing xorshift;
- the *historically correct* original diplomatic status at the route calculation (the most recent archived status transition **before** this world's monthly trade calculation, never the status decided later that same day), original diplomacy source hash where available, and whether original war/strain pressure applied;
- an exact copy of the existing original merchant notice, same original date, locality, text and six-day public release.

`verifyOriginalRouteChange` reconstructs the actual numerical risk/flow result from original source, original atlas route, the dated existing diplomatic archive and the three replayed world choices. `verifyOriginalRouteHistory` checks unique ordered changes, continuity of true disruption/reopening status and the original current route status. A forged weather roll, changing original diplomatic relation, invented alternate route or unrecorded foreign war is rejected. There is no new world RNG draw for the archival write.

Older saves that lack `originalChanges` remain valid and have **no fabricated earlier route history**. Only future genuine original changes can be recorded.

## Existing local route intelligence, never secret cartography

The existing world rule processor exposes read-only `world.tradeRouteHistory({routeId})`. It accepts only one genuinely known original atlas trade-route ID, with at least one endpoint in the character's current real polity. It shows **only the original merchant bulletin** after its existing `releaseDay=day+6`, not private risk, exact flow, commercial profitability, hidden current foreign status or unnamed political motives. It never writes a campaign or advances the world. A distant trade route, invented ID, chosen outcome, force-trade request or secret financial field is rejected.

The history survives the original short `w.chronicle` news buffer pruning without rewriting the originally published notice. Campaign knowledge remains geographically and temporally restricted.

## Acceptance test and remaining gaps

`tests/trade-original-interstate-corridor-history.test.js` uses disposable original worlds, saturates only initial corridor risks as a **test fixture** and requires actual original monthly weather/route randomness to independently close a real local corridor, then original later monthly trade rolls to reopen after risk changes. Tests original risk/flow, exact random replay, historical diplomacy, six-day news timing, readonly chat-turn, forged inputs and hash recomputation, save export/import, no money or extra player RNG, and old-save missing-event honesty. The new test runs FIRST inside the full **189-group** original suite and preserves every verified previous group.

**This branch is DRAFT, 189-group exact-head full CI UNVERIFIED, and cannot be merged until GitHub reports success. Foundation count stays 17/25, #18 unchecked.**

This is not a comprehensive diplomatic or trade-contract foundation. Real independent consenting negotiators, treaty instruments signed by actual authorised people, enforceable local property rights, tariffs or tolls supported by lawful governments, government fiscal custody, cross-polity law and freeform independent institutional disputes still require their own original-source-backed work.
