# Witnessed local professional presence — first expansion beyond five dialogue NPCs

## Why this is needed

Beastbound's starting roster of five engine-local people is **not a population limit**, and a list of 48 known professionals across the world is **not proof that those people stand beside the player**. Group membership must come from a genuine personal offer to a real, available individual, followed by an independent choice. Never manufacture a convenient noble relative, heir, free expert, partner, master or automatic recruit. The player can remain independent and create any plausible group in their own words.

## Implemented vertical slice

`world/person-presence.js` now creates a persistent **independent professional duty roster** for named world notables at actual currently supported engine locations in their own polity. The roster uses its own saved world RNG, actual named person's profession and established institution, a real local location, a limited day window, and a hash of the original schedule. An absent, injured or unsponsored professional cannot appear through a public directory request; an institution that is suspended cannot currently host that appointment. Not everyone has a public-facing duty every month.

On first world construction and genuine subsequent world-month ticks, schedules are computed **without input from the player**. The five pre-established local NPCs remain present at their existing authored locations. Other known notables can now appear only when the world itself assigned their limited duty window to a place the game actually supports. Current available engine sites are in Reedmarch, so most of the wider world's notable people cannot yet be met by the player's present travel routes. This is honest **mechanical coverage**, not a fictional population cap or a restriction on what future regions can contain. As new playable localities are built and existing named professionals gain properly sourced itineraries, the same code can schedule those people without adding another allowed NPC ID list.

`social.localPeopleStatus({})` reports only people physically evidenced in the current location **on the present date**, never hidden remote whereabouts or a guarantee that anyone will accept an invitation. It is read-only, does not advance time, consume player RNG or write the campaign save. It does not purport to grant private knowledge or create people.

`social.inviteGroupMember({groupId,npcId,proposal})` now accepts the `npcId` of either an authored local NPC or a professionally rostered present individual. The 18-minute personal exchange requires the person to remain available for the full scene. Real, sourced attendance is persisted in the original reply witness; existing independent accept/consider/decline, meaningful limits on re-approaches, nonexclusive membership, later voluntary practical work and departures all still apply. The NPC's actual profession and goals influence their decision, **without guaranteed allegiance, rank, legal office, romance, family biology, automatic apprenticeship or inherited power**.

## Preservation and outstanding work

No actual game save, especially Aerin's independent campaign, is touched by this development. The system still needs fully open person generation (births, adoptions, migration, new professions), cross-border travel scenes, dynamic NPC friendships and careers, independent intelligent-beast meetings, ordinary freeform dialogue with these additional visiting professionals, legal group recognition varying by polity, and character-appropriate lifespan and major historical change. Those are **not already implemented** just because a person can appear or give voluntary assent.

Regression coverage in `tests/person-presence.test.js` verifies source-based schedules, same-scene day windows, freedom from forged presence/forced consent, persistence after long time advances, legitimate member identity, unchanged power/legal status, and strictly read-only private-file chat status. The original five characters' tests and the full game-engine suite remain mandatory. This is a private ChatGPT Project engine; no public website or deployment is needed.
