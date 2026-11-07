# Deepened ranking framework without cross-system power conversion

**Design clarification, 7 November 2026:** The player asked to extend all the rankings while continuing genuine creation mechanics. The authoritative original Unified Master Prompt defines the **major tier counts** and does not treat them as one ladder. This extension increases the number of **meaningful qualifications and mastery degrees within a tier**, not by silently inventing a Tenth Arcane Circle, an unlimited specialist licence, or a beast Grade X that would rewrite canon and invalidate capability limits. In-world traditions may discover genuinely novel specialist branches; they are not treated as automatic numeric superiority.

## Professional qualifications have additional depth

A practitioner's earned general skill remains **0 Untrained, 1 Novice, 2 Trained, 3 Expert, 4 Master, 5 Grandmaster**. Within *any* rank, achievement can be described with **Initially demonstrated → Practised → Refined** degrees, earned through independently witnessed relevant work—not simply purchased, claimed, or granted for a birthday. The additional degree **does not replace** the hard-won next skill rank, licensing tests, institutional credentials, ethical approval, reputation, recognised inventions, commissions or an individual's actual competence in a different profession. A master physician, a master construction engineer and a master handler may each be excellent at entirely different things.

Initial concrete earning coverage: the `creation.prototype` operation records a genuine, successful, source-bound physical Crafting trial. `rankings.detail({})` reports supported direct evidence and qualifying within-rank development. No sourced attempts means **not established**, even if a character has a profession title. More professions must gain their own source-verified work records as their mechanisms become playable; the engine must not hand out mastery depth for a decorative NPC description. The same extensible structure is intended for independent NPC careers and institutions, not a fixed catalogue of who may become a master.

Tamer/handler **licences Copper, Bronze, Silver, Gold**, guild accreditation, professional permits and contracts remain **separate legal-social standings**. They cannot simply be manufactured by training in an unrelated skill; more cultures may use credible alternate qualifications. The original skill caps and legal procedures remain authoritative.

## All power pathways gain an explicit *within-stage* vocabulary

These are **quality distinctions within the existing canonical stages**, not universally exchangeable numeric bonuses. Each needs distinct in-world practice, risk and proof:

| Independent system | Canonical milestones | Possible quality degrees inside a milestone |
|---|---|---|
| Meridian | Stages I–IX; 108 independently meaningful Gates | Initial circulation → Stable circulation → Refined integration |
| Arcane | Circles 1–9 | Circle formed → Geometry stabilised → Formula integration refined |
| Soul | Phases I–VII | Initial spiritual control → Stable inner pattern → Refined spiritual practice |
| Body | 7 independently developed refinement cycles | Cycle consolidated → Conditioned application → Integrated physique control |
| Rift | 8 practice steps | Initial spatial control → Stable boundary application → Refined anchor precision |
| Beast-Origin / Lineage | 8 integration procedures | Initial trait control → Stable compatibility → Integrated personal expression |
| Human evolution | Baseline through Higher Evolved Existence | Newly changed form → Stable constitution → Refined adaptation |
| Human–beast synchronisation | 10 reciprocal stages | Tentative mutual coordination → Stable reciprocal coordination → Fluent shared practice |
| Specialised supernatural disciplines | 7 ranks for runes, formations, alchemy, weapon, elemental, and healing | Initiating → Established → Refined |

**Current honesty:** The read-only `rankings.detail` gives truthful **current recorded canonical tier and potential within-tier degrees**. Most power-stage qualities are **unassessed**, because advanced stage-specific practice and its confirmation procedures are not yet built. A training session for a past stage does not certify mastery of the next one, and no number of generic work attempts creates a new Circle, Gate, partner stage or evolution. Grade I–IX for **individual beasts**, **species** and **research/effect items** stays separate; material craftsmanship quality, assessment confidence, potential, biological age, Level and Rank should not be collapsed into an imaginary Grade X.

## Implications for original creation

Invention success depends on a relevant *field-specific capability*, knowledge and demonstrable actual engineering. A finer professional title cannot bypass real materials, the power system's anatomy, energetic budget, grades, or actual field tests; conversely a highly advanced cultivator is not automatically an excellent mason or physician.

The first **real civilian prototype adapter** in `rules/creation-prototype.js` makes a bounded reed surface-water indicator from a **source-sealed personal design**. It requires an actual accessible outdoor water site, two real Marsh Reeds, 85 in-world minutes, 4 Stamina and one honest Crafting check. Failure destroys the inputs; success yields a real owned, **uncalibrated** prototype in a source-bound ledger, **not** a magic spell, certified reusable invention or guaranteed licence. Local calibration costs 15 minutes and 2 Stamina, can fail, and wears the instrument. After successful calibration, local use costs 8 minutes and 1 Stamina, is limited by durability, and only reports a rough **scarce/moderate/abundant or inconclusive surface-water category** grounded in that site's actual ecology. It reveals neither exact remote statistics, drinkability, secret souls, teleport destinations, nor any personally unknown politics. No chosen DC, material grade, outcome, magical effect, free rank or instant bond is accepted.

These first field-adapter details are **an example of the generic design → experiment → material outcome → calibration → limited service mechanism**, not a restriction that only water tools can ever exist. New technologies, medical instruments, agricultural practices, social or contract tools, magical artifacts, family knowledge, spells and techniques will need their own actual tested mechanisms, resources, failure modes, social adoption and independent lore. This remains foundation-first rather than a giant recipe list.

## Mandatory engineering evidence

`tests/rank-depth-prototypes.test.js` checks all canonical stage counts, within-tier source criteria, non-combat invention intent, sealed scope and material source, genuinely successful **and unsuccessful** construction on real rolls, bodily and material cost, calibration accuracy limits and wear, no invented spell/technique, and file-backed one-turn idempotence. No active campaign save is changed.
