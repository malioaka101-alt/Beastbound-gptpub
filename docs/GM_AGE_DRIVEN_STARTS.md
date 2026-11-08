# Campaign beginnings belong to the GM, not an opening-scene list

**Foundation revision, 8 November 2026.** Source: the original Beastbound Master Prompt §§39–42, 54–57, plus the user's explicit choice to let the GM create almost all starting circumstances. No character or campaign is active.

## Player input and lifelong freedom

The player can begin with **only an age**, or leave even that to the GM. Other details can be freely suggested, but **there is no compulsory creation form**, role menu, prescribed story hook, fixed first scene, required beast partner, class or starting location. The GM chooses and narrates a distinctive beginning appropriate to the already established world and the person's lived history. The player's personality, dialogue, decisions and future interests remain their own.

The earlier six **prewritten opening vignettes** have been deleted from `scripts/new-campaign.js`. Their named locations remain real parts of the world, not required opening choices. A GM can instead create a wholly new settlement, workplace, household or other real location during play through `world/lived-places.js`. No destination needs a predefined port or travel-menu edge; ordinary movement and consequences use the real clock and established context. See `docs/GM_CREATED_PLACES_AND_TRAVEL.md`.

**Age reflects a life's past, not a character class or permanent restriction.** A young child may have household ties, friends, education, needs, ordinary interests and open-ended options without invented adult qualifications. An adult may have already worked for decades, changed trades, accumulated modest earnings, started an informal organisation, formed family relationships, or become responsible for others. A later-life character need not be retired or incapable. The engine records seeded age-appropriate background, prior ordinary work and source-linked financial history; it does not predetermine destiny or silently make a child a licensed surgeon. **Birthdays follow the existing civil world clock:** a child can grow into adolescence and adulthood as time genuinely passes, without automatic class selection, employment, social rank or powers.

A high-status adult beginning is possible when the GM establishes a **credible source-grounded pre-game history** consistent with existing offices, family charters, actual members, individual consent and law. The GM may choose an entrepreneur, a clan leader, a worker, a scholar or something entirely different. **Being connected to a historical house does not automatically displace its named leader**, grant legal office, compel relatives to support the player, provide a treasury, unlock restricted training or inherit supernatural power. A small new self-founded organisation can exist in the existing world group registry with only its founder; real personnel and resources still require valid origins. There is no universal role template or prescribed career ladder.

## GM decides the pre-existing facts; the engine does the bookkeeping

**No roll, class, age-tier permission check or dedicated `start as leader` mechanic is needed to author an established life.** The GM determines a coherent starting person in context. A forty-six-year-old might already lead a family business because the GM established how they reached that position *before the first played turn*. That is their actual biography, not an uncertain action for the player to attempt again at character creation. An equally plausible adult may have no job, may be dependent on others, may own a significant workshop or may still be a student; age supplies context rather than a fixed occupation or wealth bracket. A young character can inherit complicated family obligations without automatically gaining the powers or independent consent of other people.

The engine's job is to **represent the actual household members, social links, prior decisions, work, finances, relevant assets, group membership and obligations in the same persistent world state**, reusing existing family/group/world records. If the GM asserts a leadership role but the current prototype has no suitable way to register that group's existing members and authority, the missing part is a **general persistent world-recording capability**, **not** a random leadership-access roll. Do not confuse a descriptive biography field with completed group ownership, property title, earned qualifications, individual consent or automatic powers. Add the necessary general records as real facts of the opening world and let those people remain independent afterward.

The `scripts/age-lived-history.js` seeded occupation list is just a *fallback for a GM who has not already authored a life*. An explicitly GM-authored `role`, `lifeHistory` or `lifeCircumstance` overrides that fallback. Avoid locking future storytelling into the examples or inventing professional accomplishments that contradict the supplied history. Pre-game choices should become established initial conditions, while **new actions and disputes during play** use actual mechanical resolution.

## Mechanical handoff

Use the pre-existing `scripts/new-campaign.js` with `{seed,slug,mode:'gm',age?,...otherGMAuthoredOrigin}`. The seed generates the character's ordinary initial mechanical foundation and one lived-years record without spending in-game dice. The player should not have to select those internal fields. The GM should provide a unique **`gmOpening`**, either in the same create call or later through `world.authorOpening`. This opening is the GM's actual prose and establishes an actual location, observed weather, time of day and scene focus.

For an existing real site:

```js
gmOpening: {
  locationId: 'crossing',
  scene: 'A fully authored, ordinary in-world opening of the GM’s choosing, appropriate to this specific character’s earlier life.',
  focus: 'An unfolding local situation',
  weather: 'clear autumn air',
  hour: 9, minute: 20
}
```

For a newly introduced place, use `place:{placeId,name,regionId,description,kind?,sceneType?,culture?,notables?,families?,organisations?}` **instead of** `locationId`. The place must belong to an established Atlas region. The GM provides the prose; the engine records only established facts, not invented nearby NPC availability, automatic resource ownership or new player powers.

If no `gmOpening` is supplied, `create` leaves the campaign marked **`openingState:'awaiting-gm'`**, with no scene, focus, hook or playable startingLocation. A legacy canonical location remains internally as a *technical save-validity staging site* only; it is **not** a claim about where the player lives or begins. **Never narrate it to the player.** A genuine `mode:'gm'` campaign cannot take gameplay actions until the GM commits `world.authorOpening`; attempts to reroll an existing opening are rejected. Compatibility fixtures using `random` or `guided` must not be mistaken for finished GM scenes.

The world origin generator remains capable of historic ancestry, renowned non-automatic family relations, diverse working households, institutions, ordinary community ties and newly declared one-founder associations. The separate `scripts/age-lived-history.js` writes pre-game age and ordinary experience, not a class. It uses plausible ordinary funds and limited work proficiency **only where the history supports the skill**; no automatic supernatural ability, noble office, NPC agreement, inherited estate, partner sync, licence or promotion.

A separate campaign's previous checkpoint is never copied, overwritten or used as another character's opening. Source and independent-world state survive the save. Age and pre-game standing are just the start of a life, which continues through the player's free choices and other people's independent lives.

## Known limitations

The current JavaScript engine is still a prototype. Local fieldwork, government, group membership, social agreements and long careers have source-tested slices, **not universal enactment of every possible past title, estate, apprenticeship or infant/child-specific medical and social subsystem**. If the GM chooses a complex established adult situation, the provenance, obligations, third-party decisions and connected mechanics must be made consistent with the world rather than claimed complete because one sentence appears in the history. An unfamiliar consequential action should remain honestly unresolved until a valid source-based mechanism exists.

**Design rule:** create history in order to make the world feel lived in, not to force the player to complete a scripted biography.
