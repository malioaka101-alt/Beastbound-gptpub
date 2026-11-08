# Beastbound: the GM authors places as play discovers them

**Living-world foundation, 8 November 2026.** This adapts the existing public engine to the user's clarified design. The game remains a **private natural-language ChatGPT text RPG**. The original Master Prompt (§§2, 5, 39–45, 54–57), already witnessed campaign facts and Table Rules govern the world. No new campaign has been started.

## Where the world lives

The Master Prompt asks for a coherent background of continents, regions, cultures and institutions **before** play; it does **not** require every hamlet, shop, camp, district or building to be individually listed or traversable at creation. The current `world/atlas.js` is the broad civilisational foundation. **The Game Master creates local places, scene prose, culture, atmosphere, people and history as the story naturally encounters them.** The engine's duty is to preserve these facts in the actual save and apply the existing clock, resources, source rules, NPC autonomy and consequences.

The GM should write vivid and distinctive introductions. The engine must not write those scenes, randomly spawn a notable person or claim an individual's cooperation merely because their name appears in a settlement description. There is no requirement to prebuild a route graph, port, road, shop, faction headquarters, weather hazard or professional guild for every new place.

## Source-bound engine bridge

`world/lived-places.js` adds a per-campaign, source-sealed `table.realm.livedPlaces` registry. The existing six named Reedmarch sites and the world Atlas remain canonical. Each newly introduced site has:

- `placeId` (stable slug), `name`, `regionId` (an existing Atlas region), optional `kind`, `sceneType` (`settlement`, `wilderness`, `structure` or `unknown`) and `culture`, and a GM-authored `description`. A locally established settlement can use ordinary settlement time/rest rules without being confused with the region's underlying biome.
- Optional `notables`, `families`, and `organisations` references as `[{name,context}]`. These are *known narrative facts*, **not simulated nearby NPCs, confirmed memberships, legal offices, goods, money or automatic permission**.
- A sealed founding record and an append-only context-note ledger. The GM can add a witnessed reference or change of circumstances instead of rewriting or erasing earlier established descriptions.

GM adjudication calls:

```js
Rules.act(s, {system:'world',operation:'establishPlace',params:{
  placeId:'reedbank_mill',
  name:'Reedbank Mill',
  regionId:'morrowfen_basin',
  kind:'riverside workplace',
  sceneType:'settlement',
  description:'A mill and adjoining dwellings stand above the old seasonal flood line.',
  culture:'Millworkers post water-level notices and argue over safe beast passages.',
  notables:[{name:'Hesta Venn',context:'Known locally as a ledger keeper; present whereabouts unconfirmed.'}],
  families:[{name:'Venn household',context:'A known millworking family, not evidence of noble office.'}],
  organisations:[{name:'Millworkers circle',context:'A mentioned informal association; members have not been independently witnessed.'}]
}});
```

This operation records **the GM's established facts**; it is not a player power to declare that a stranger agreed, a distant organisation granted access, or a rare creature exists within arm's reach.

`world.recordPlaceNote({placeId,category,name,context})` appends player-known details, including noted people, households, organisations, landmarks and observed history. `world.placeStatus({placeId?})` reads only established facts without advancing time or changing a save. The saved current location, HUD, status, recap and scene description use dynamic places without treating them as one of the six legacy sites. Canonical location-specific merchants, quests, safeties and NPC working hours **do not automatically carry over**.

## Travel is a mechanical consequence of the narrated journey

A player can ask to travel **anywhere they plausibly can**. They do not need to name a hardcoded exit. The GM describes or establishes the journey in the actual world, accounts for geography and immediate risks, and decides reasonable time. If the destination is new, establish it first. Then use:

```js
Rules.act(s, {system:'world',operation:'travelTo',params:{
  destinationId:'reedbank_mill',
  minutes:125,
  journey:'The established raised towpath leads from the crossing to the mill, with no unresolved hazard along this stretch.',
  means:'walking',
  uncontested:true
}});
```

This consumes **actual existing world minutes**, moves the saved location, ticks the independent calendar/world simulation and preserves the route in the world record. There is no default mandatory port, invented ferry ticket, distant NPC summon, random success, new teleport or prescribed fixed duration. The GM can use existing transport, a vehicle, an animal, a ship, a safe path or any other *actually established* means, with realistic duration.

**Critical boundary:** `uncontested:true` means the GM has already determined that no unresolved obstacle requires a distinct roll or subsystem. **Travel itself does not resolve dangers, supply food, pay fares, heal injuries, provide beast care, claim other people's help, grant skills or guarantee safe long-term survival.** If the fictional journey depends on real uncertainty, legal permission, payment, provisions, sleeping arrangements or reciprocal beast partnership, address that with existing mechanics and witnessed facts before declaring it completed. A time span is not a free-life-sustaining shortcut.

Travel through source-established regions can now be implemented through context and elapsed time without prematurely writing every port and roadway into `engine.js`. The older fixed-exit method remains compatible for its six already supported site-to-site journeys.

## Scope and next steps

This is a **first safe persistence/travel bridge**, not the final simulation of journeys, procedural settlement NPCs, generated family genealogies or every profession's local access. New locations are not assigned fake shop stocks or NPC presences. If later play introduces a real marketplace, profession, public institution or independent household, attach it to the existing individual/group/source model when there is an appropriate fact to justify doing so.

**The priority is interconnected living-world continuity, not prebuilding more map tiles.** A place can grow in detail with a campaign and the GM remains responsible for grounded prose, cultures, individual people and scenes.
