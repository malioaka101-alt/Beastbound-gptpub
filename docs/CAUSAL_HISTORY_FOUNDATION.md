# Living historical causality — GM-established history, persistent world consequences

**Foundation checklist item #02.** Original Beastbound Unified Master Prompt §4, with §5 on the independent living world and §55 on coherent beginnings. This is a source-backed extension to the **existing** Atlas, historical legacies, world simulation and public context. No campaign has been created.

## The two simultaneous truths

**What really happened** is established by the GM, in continuity with the original prompt and all saved earlier facts. It is a *historical event*, not a random challenge the player must roll to make history exist. An actual event can have several concrete earlier `causes`, a credible era/period, an attested primary account, and a location or original organisation in the already established world. Later, the GM can add a genuinely new event **caused by previous real history**. The engine persists the facts and rejects circular causes, time-inverted dates and silently rewritten events.

**What people believe happened** is separately recorded. An institution, dynasty, scholar, witness, religion or beast community can preserve its own account and disagree with another account. The engine stores their names and explanations under the real event without replacing the truth, forcing agreement or inferring hidden personal motives. The GM may also establish facts or interpretations marked `gm-only`. A later public event can genuinely have a secret historical cause, but reading the public chronology must not disclose that hidden cause ID.

The **present-day influence** of a verified event is another append-only source-backed record, linked to an actual polity, region, culture, existing house, institution or mythic site. It explains a connection between past and present: why a guild charter exists, why a river crossing has passage rights, why a family maintains a rescue refuge, or how a border dispute began. It does **not** automatically seize treasury funds, transfer a public office, declare an NPC loyal, grant skills or adjust legal ownership. Those mechanical changes must use the legitimate current world-state rules and established individual sources. A historical influence can be supplemented or superseded by an explicitly linked later influence; the previous record is not destroyed.

## Reuse and first examples

This is a narrow `world/causal-history.js` extension to `world/simulation.js` at `realm.causalHistory`; it does not run its own country, NPC, history-generator or future-time tick. The core remains the existing `world/atlas.js` eras and actual `world/renown-and-practice.js` famous historical people. The original five eras become five source-linked examples. Three already-supported effects demonstrate integration:

- **Estuary Wars → Seven Estuary Treaty → passage rights:** the established Morrowfen Basin region now exposes its public historical influence in the existing `world.atlas({type:'region',id:'morrowfen_basin'})` view.
- **Ash Years → fallen empire and guild republics:** Cinder Free's current polity overview exposes the historical institutional reorganisation already described in the Atlas.
- **Longwinter Covenant → migration and nonhuman winter refuge:** Whitewake's real polity context retains an original beast-person refuge obligation.

These examples assert only what was already in the Atlas, not undocumented names, invented military victories, new property titles or unearned power. Any later region, dynasty, guild or historical incident can be GM-authored and referenced by a unique ID, rather than expanding a static prewritten history catalogue.

## Rule operations

Use the existing private `Rules.act(state,{system:'world',operation:'...',params:{...}})` bridge. `world.historyStatus({eventId?})` and `world.historyStatus({targetType,targetId})` are **read-only**. `world.historyRecordEvent` creates an immutable event with era, period, account, basis, optional approximate year, real scope and existing cause IDs. `world.historyInterpret` appends accountable competing testimony. `world.historyEffect` appends a source-grounded material/social/institutional historical influence, with `precededBy` when a later fact modifies an established impact.

The world state and source seals are kept in normal campaign saves. The private request processor handles read-only history without advancing a turn or rewriting saves. Any consequential event must use the **actual** rule for its outcome; history authoring is not a substitute for an independently resolved battle, council vote, alliance, contract, animal migration or government change.

## What remains outside this first foundation

No engine currently synthesises a century of actual wars, births, migration and geological changes. There is no mandatory era generator or pre-play roll for becoming a dynasty leader. A sourced historical cause can be connected to present world facts, but does not physically change those facts merely by claiming them. Full genealogy, border adjustments, law, evolving species distributions, and NPC personal attitudes will connect as the later checklist items (#03–#25) extend their own existing mechanics. **The GM continues to make creative decisions, including what matters and how different people remember it.**

**Verification:** The `tests/causal-history.test.js` regression checks five original eras, public links in existing Atlas view, hidden causes, distinct public interpretations, immutable causality, proper save reload, and the real private idempotent turn processor. Do not tick #02 on the checklist or merge until GitHub confirms the full suite. See `docs/MASTER_PROMPT_DEPTH_CHECKLIST.md`.
