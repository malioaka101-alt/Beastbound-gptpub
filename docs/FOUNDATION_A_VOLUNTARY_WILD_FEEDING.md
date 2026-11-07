# Finish Line A — actual food, voluntary wild-animal feeding, independent outcomes

**Source:** Original Unified Master Prompt §§5, 7, 11–13, 15–16 and §50, including ecological nutrition, persistent individuals and species-appropriate independent choice. This connects existing player commerce, witnessed animal encounters, individual animal-life simulation, inventory and conservative partner-care diets. It is a bounded *natural action*, **not a taming shortcut**.

## Real player action

A player with actually carried **clean rations** may say **"offer food"**, **"feed"** or **"offer rations"** to an actually witnessed, present, calm, unowned **omnivorous wild animal**. A player may explicitly **"offer marsh reeds"** to a truly present wild **herbivore**, using actual reeds from the original resource chain. The item is the player's explicit choice, not guessed from a hidden species ID. The existing `bond-care.js` diet compatibility list is reused unchanged and shared, rather than defining another feeding economy. Other foods and more specialised diets still need genuine species-specific evidence.

`world.offerWildFood({item})` requires the authentic individual animal's original local encounter, real habitat, actual inventory, verified bodily condition and absence of immediate danger. It uses the existing **individual wild animal's private random stream** and stable personality, actual hunger and local ecology to resolve an unforced observable reaction: **eats, ignores, or leaves**. A genuinely eaten portion is removed from the player's bag, and recorded biological hunger decreases; an ignored or avoided portion remains owned. Each first genuine offer spends eight in-world minutes. A repeat of the **identical** offer with no changed material circumstances cannot fish for a fresh favourable animal outcome, consume another item or burn another decision. Where the animal, environment or welfare changes, a genuinely new attempt may have a different response; there is no blanket one-per-day or training-session gate.

This operation awards **zero trust, respect, partnership, affection, relationship points, Grade, Beastcraft skill, consent, technique, power or rare resource**. Sapient people/beasts require their own person-aware approach; frightened, threatened, fleeing or captive creatures are not considered consenting to this kind of approach. Injured wild animals need appropriate veterinary assessment, not generic feed as a cure. No player request may set the creature's mood, hunger, species, chance, roll or result.

## Mechanism and continuity

`world/wild-lives.js` reuses its existing verified engine encounter, persistent `individualLife` source hash, independent RNG, witnessed behaviour and memory. The voluntary response is appended as a separately source-hashed *observation*, while the visible response enters the existing world event log. Ordinary natural text routes through `scripts/chat-turn.js` and the existing protected `Rules.act` operation. The former legacy `offer food` attack on animal agency is no longer used. Exactly repeated private turn IDs replay their original committed response without a second choice or payment.

The test `tests/voluntary-wild-food-offer.test.js` constructs actual independent encounters from original exploration seeds, including a personally purchased ration from existing Orrin Vale, and a real harvested reed for an actual habitat herbivore. It verifies independent eating and refusal, species food incompatibility, inventory/hunger conservation, no player RNG use, no invented bond and immutable duplicate results. It uses only disposable saves and joins the required full engine regression suite.

## Honest boundaries

This is **not** a universal diet engine, veterinary practice, portable feeding station, social agreement, bait/trap/capture method, trading mechanism or complete long-term hunger simulation. Other valid creative attempts can be ruled in context as the world and source support them. The existing first-contact and later mutual partnership systems remain independent. Aerin's campaign checkpoint is not modified during development.
