# Beastbound — GM contextual difficulty adjudication

This is a supplement to the original Master Prompt §45, `reference/Beastbound_Table_Rules.md` and `docs/DYNAMIC_DIFFICULTY.md`. **The GM is responsible for the lived scene and its stakes; the original engine remains the authority for dice, earned progress, independent NPC decisions, real resources, and the saved world clock.** This feature lets the GM respond to context without letting an arbitrary freeform number decide the player's rewards.

## One actual task, four kinds of judgment

Before a consequential uncertain action, use the character's established abilities and the scene's genuine circumstances to decide:

- **Unopposed, ordinary or guaranteed:** say what happens naturally, with no roll. A mundane sourced local skill check can commit a one-use `routine` decision when its outcome/time needs recording. This does not grant items, training progress, wages, social consent, movement or supernatural abilities.
- **Impossible under the existing anatomy, material conditions or world rules:** do not roll. Describe why and what remains possible. An already prepared mundane local skill check may record `impossible`, consuming no minutes and no die. A supernatural feat without its required stage, an unwilling beast's consent, or inaccessible resources remain governed by their distinct original prerequisites, not this GM bridge.
- **Possible and uncertain:** ask the *original source owner* for the baseline and its already calculated situational factors; choose either that DC or a modest **scene-backed judgment** and let the original engine roll *exactly once*.
- **Unsupported objective consequences:** keep them unresolved. This adjudication cannot authorize nonexistent creatures, property, income, social contracts, source materials, knowledge, spells, technical systems, or off-screen NPC promises.

The GM does not need a die for ordinary prose. A natural 20 cannot make an impossible act possible; a natural 1 does not make a professional forget basic facts. These are direct Master Prompt §45 principles, not optional difficulty loopholes.

## Preview → assess → single original check

A source owner computes the actual baseline and existing factors before the roll.

| Source owner | Read-only baseline preview | Original resolution |
|---|---|---|
| Household work | `social.householdWorkDifficulty` | `social.householdWork` |
| Early stage/discipline training | `discipline.practiceDifficulty` | `discipline.practice` |
| Witnessed local terrain | `core.prepareSceneCheck` returns `baseDC` and original scene witness | `core.check` on that `checkId`; **or `core.localCheck`** to prepare and resolve atomically when no player decision intervenes |

Preview is an **optional convenience**, not another required network call for every action. When the original baseline is already known and source-verified, the GM can put the contextual ruling in the **same final action request**. No new tool calls are needed for ordinary dialogue.

### GM contextual adjustment

One optional object `gmContext` (household work or discipline practice), or `gmRuling` (an already prepared **ordinary local terrain check**), can contain:

```json
{
  "kind": "adjust",
  "adjustment": -2,
  "source": "scene",
  "quote": "the buckle sits loose when the leather bends",
  "reason": "The visibly loose fastening makes the ordinary fitting job more difficult than the standard workbench would suggest."
}
```

- The signed adjustment is a **modest −4 to +4**, never a chosen final DC. The engine recomputes the original baseline and all automatic factors, clamps to the corresponding owner-specific range, records the quote and reason with the original scene source hash, location and time, then rolls.
- `source` can be `scene`, `place` or `weather`. `quote` must be a sufficiently specific **verbatim continuous extract** from that already saved source. `reason` explains why that fact makes this specific task easier/harder. No made-up material, tool, cooperation, health state or opponent ability can be used as evidence. A GM is responsible for *genuine relevance*; textual matching alone does not prove the causal interpretation.
- Do not count facts twice. If `careful` already provides a slower-work adjustment, do **not** discount a second time simply for claiming to be careful. Stamina fatigue, pre-existing familiarity, aptitude, skill ranks and verified support must not be billed twice as generic GM circumstances.
- A quote, explanation and number must be supplied **before** the original roll. On the saved result, the engine includes `baseDC`, `netAdjustment`, each built-in factor, the GM-attested factor and the resulting final DC.
- Old and new user requests cannot include a `chosenDC`, `modifier`, `success`, `roll` or other free outcome. A new chat turn ID never permits rerolling a used original witness.
- All domain-specific costs and prerequisites remain unchanged; the DC adjustment is a difficulty judgment, **not** an independent improvement to rewards, participation, biological potential or consent. A genuinely easier DC still can fail; a harder one still can succeed if feasible.

### Routine or impossible: narrow committed no-roll option

For an **already source-witnessed ordinary local check** (`engine-local-scene` only), the same `core.check` request can use `gmRuling.kind: "routine"` or `"impossible"` with `source`, `quote` and `reason`, **without** an `adjustment`. The engine consumes the original `checkId` once and writes a traceable GM decision; it does not call the d20 roller.

- `routine`: succeeds *only within the narrow ordinary local method*; consumes its original physical task minutes; no experience reward or additional result.
- `impossible`: no roll and no elapsed work minutes; cannot be made possible by adding a high DC or a natural 20; no items or additional result.

**Never apply these no-roll modes to:** paid household work (which requires independent employee agreement and completed Crafting), Soul/Meridian/Arcane/Body/Rift practice (which requires earned checks to progress), habitat surveys, combat, beast/bond interactions, career recognition or other source-specific systems.

### No-roll example

```json
{
  "id": "example_contextual_local_0001",
  "campaign": "existing_campaign",
  "mode": "check",
  "checkId": "scene_00001",
  "gmRuling": {
    "kind": "routine",
    "source": "scene",
    "quote": "the flat and unobstructed courtyard path",
    "reason": "Ordinary footing on familiar dry ground has no actual uncertainty that requires a die."
  }
}
```

This example only works if that **exact quote already occurs in the current saved scene** and the `checkId` is a genuine prepared unused original local check at the same place. A missing source, stale location, used witness, mismatched check type or fabricated source is rejected before any roll.

## In-play presentation and continuity

The GM should narrate the full living scene naturally. For an important roll, a short mechanical line is enough:

`🎲 Work DC 12 − 2 (careful approach) + 2 (GM: obstructed bench) = DC 12; d20 13 + 1 = 14 → success`

That line is **illustrative**, not a live Maddoc result. Show only factors the character could know, and never turn the fantasy HUD into a debug table. The approved dark indigo/antique-gold styled panels remain **completely unchanged**.

The implementation is intentionally **owner-by-owner**. Existing household work and early practice now allow scene-quoted GM adjustments, and the original local terrain bridge allows pre-roll adjustment and no-roll handling. It does not grant a generic override over all advanced, contested, ecological or supernatural mechanics. Expand individual owners only with real evidence, original validations and full tests.

**Safeguards:** one original roll maximum, original RNG, original save and funds custody, no forced consent or paid work from a GM fiat, source quote and timestamp stored with original receipt, replay idempotent, no campaign migration, no retroactive changes to Maddoc's previous rolls, wages, Soul progress or the scene checkpoint.
