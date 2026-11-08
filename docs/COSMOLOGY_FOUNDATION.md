# Cosmology as GM-authored world law, not a fixed realm menu

**Foundation item 01 of `docs/MASTER_PROMPT_DEPTH_CHECKLIST.md`.** The original Unified Master Prompt §§3, 18, 25, 27 and 55 requires a coherent mortal world, spiritual/soul domains, divine traditions, rift-connected places, energy relationships, independent gods, credible boundaries and lawful afterlife rules. This first foundation **does not claim complete cosmological parity**. The GM must construct actual coherent cosmological answers as play demands; the engine stores their persistent truth and consequences. The original prompt explicitly allows some of the universe to remain an unrevealed mystery.

## Existing systems extended, not replaced

- `world/mythic.js` already contains five **publicly taught** realms, six local religious traditions and fourteen authored mythic sites with independently ticking world pressure and seals. They remain canon; the new code neither rerolls them nor changes their physical site data.
- `world/simulation.js` now creates `realm.cosmology`, a **per-campaign persistent ledger**. `world/cosmology-ledger.js` is a narrow extension using those very same `Mythic.REALMS`, `Mythic.SITES`, saved `LivedPlaces`, current world minute and normal source/event/checkpoint machinery. It is **not** an independent realm simulator, a free magic system, an NPC generator, a source of random divine intervention or a story engine.
- Five existing realm descriptions are entered as **public metaphysical teachings**, not mechanically verified visits or permanent objective cosmic laws. At start the three example threshold records are Riftglass exterior wardline → Rift Between, Ancestor Gate approach → Spirit Veil, and Ashglass labyrinth approach → Rift Between. All three have `noProvenPassage:true`. Their existing historical public stories remain source data, including uncertainty and danger; the GM may add entirely different planes, thresholds and interpretations.
- When the GM establishes a further realm, the engine records its ID, category, name, description, public/GM-only visibility, founding world time and sealed origin. No preset limit on actual world identity, theological school or plane classification is imposed beyond small current storage bounds and basic validation.
- A `law`, `tradition`, `hypothesis` or `disputed` interpretation becomes a distinct, append-only fact with its own `domain`, supporting contextual account, world time, public/private scope and integrity seal. The GM can preserve competing faiths and a different underlying reality without inadvertently revealing or flattening either. Changing understanding is a **new fact or observed development**, never silent rewriting.
- A boundary record links a real existing mythic site or an actually saved GM-authored physical place to one established realm. Personal observations require local physical presence in the correct region/actual place, a narrated witnessed sign, the real world clock, and no unresolved encounter. An independently unstable Mythic ward **cannot be declared quiet** to bypass danger. This is a genuine mechanical source guard, not a new permission die.
- Read-only status exposes **only known descriptions, public facts and previously witnessed observations**, not private metaphysical laws, secret plane names, dynamic hidden ward variables, real access rights or privileged divine knowledge. All thresholds explicitly return `entryPermitted:false` and `boundaryOpenProven:false` until a real future crossing mechanic exists. Observations may be stale as independent time and pressure pass.

## GM-to-engine operations

All operations are actual `Rules.act(s,{system:'world',operation:'...',params:{...}})` requests and can be submitted through the saved request processor. Status operations are strictly read-only:

| Operation | What it does |
| --- | --- |
| `cosmologyStatus({planeId?})` | Publicly known existing realms and accounts, without a save mutation |
| `cosmologyAuthorPlane({planeId,name,category,description,visibility?})` | Establish one GM-authored plane, no opening or rewards |
| `cosmologyRecordFact({planeId,domain,kind,statement,basis,visibility?})` | Record public knowledge or private underlying laws, append-only |
| `cosmologyAuthorBoundary({boundaryId,name,planeId,siteId,description,visibility?})` | Record a physically referenced potential threshold; cannot declare it safe |
| `cosmologyObserveBoundary({boundaryId,observed,account})` | Record real local witnessed signs, bounded by independently changing mythic conditions |
| `cosmologyBoundaryStatus({boundaryId})` | Read last player-known signs without claiming an open gate or current safety |

Example authored in prose by the GM, rather than filled by the engine:

```js
Rules.act(state,{system:'world',operation:'cosmologyRecordFact',params:{
  planeId:'spirit',
  domain:'river-death-beliefs',
  kind:'disputed',
  statement:'Riverfolk priests disagree whether a voice in a flooded shrine is an ancestor or an energy imprint.',
  basis:'Public River Memory accounts and conflicting temple testimony',
  visibility:'public'
}});
```

That is *not* a proof of resurrection or a fabricated independent soul. When the GM later establishes what is actually happening, they can record the underlying `kind:'law'` privately or a witnessed public discovery. The engine keeps both coherent; the player learns only what they could know.

The GM may introduce a new threshold by recording a **new physical place first**, then an independently sourced `cosmologyAuthorBoundary` linking that location to a declared realm. No automatic new port, transport vehicle, bond, special weapon, treasure, divine favour, spatial dislocation or future consent results from creating a record.

## Boundaries and deliberate incomplete work

The current prototype **does not** resolve afterlife destinations, summon a deity, physically move actors between planes, invoke divine authority, assign environmental effects to a new realm, auto-create a creature there, give Rift walking or award the player a new power. These require actual compatible systems and GM-causal world facts. `rift.sense` and `rift.anchorWork` already have their own earned source requirements, and are **not** replaced by this registry; later #15 must reuse the established site/law records.

A descriptive private law is a real continuity constraint the GM must consistently apply, **not** a new numerical rule unless it gets a source-tested mechanical implementation. For the first foundation the engine concretely enforces linked-location observation, known site state, non-silent past facts, confidentiality, unique records and non-traversability.

**Next:** after verifying/checkpointing #01, proceed sequentially to **#02 historical causality**, extending existing world chronicles, rival accounts, institutions and their past deeds rather than introducing an independent random history generator. Follow `docs/MASTER_PROMPT_DEPTH_CHECKLIST.md`. No campaign is started by this foundation.
