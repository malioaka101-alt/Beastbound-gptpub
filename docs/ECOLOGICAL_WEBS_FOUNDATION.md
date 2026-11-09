# Regional ecological webs — foundation #04

**Canon:** Unified Master Prompt §§2, 5, 6–11, 18 and verified species biology #03. **Existing owners:** world/simulation.js regional ecosystems (forage, water, quality, pressure, population indices and migration), world/wild-lives.js and world/wild-generations.js (real individuals and source-backed reproduction). The new world/ecological-webs.js is a source-checking and tick adapter over each existing regional ecosystem, **not** a separate world simulation, narrator or clock.

## Starting examples, not a fixed roster

Two **pre-existing authored species** share the real Copperwood habitat: Lanternfen Fox and Flint-Ear Hare. A regional abundance indicator for each and two simple GM-established food relationships illustrate the mechanism. Indicators are not precise animal headcounts, newborns, individual spawn tables or fixed predator victories.

The GM establishes a coherent species through #03, then records an evidenced population with the existing rule dispatcher operation world.ecologyAuthorPopulation. Documented local populations can be linked using world.ecologyAuthorLink with the current supported impact examples preys-on, feeds-on-forage and pollinates-habitat. These are not the only imaginable ecological relations: new types should extend this connected system only when play genuinely needs them.

Real regional habitat drives survival. Recorded mature and sufficiently understood reproductive cycles can support modest growth; pollution, shortage and actual species pressure can drive declines. An established pollinator can help actual regional forage under suitable conditions. Existing monthly neighbouring-region links transfer only already recorded abundance between regions with authentic populations and suitable conditions. World sixdays and months are the **only** clocks. None of this consumes player dice.

## Source evidence and privacy

- A founding record contains species, region, starting index, carrying-index bound, source, date and public versus GM-only visibility, sealed against silent rewriting.
- Independent changes append source-linked dated receipts. Archived checkpoints keep long-running ecological histories maintainable.
- Relationships have separate immutable source receipts and do not claim any specific individual animal hunted, bred or agreed to cooperate.
- The read-only world.ecologyStatus shows published population evidence only in the character's current physical region. Remote, unpublished and GM-only information does not leak.
- Legacy saves without the new ecology field remain compatible. Additional records are append-only through the existing protected turn mechanism, including exact request ID deduplication.

**Boundaries:** Species suitability does not prove physical presence. A population indicator cannot create an individual beast, force a hunt, earn powers, alter learned techniques, produce a pregnancy, establish a bond or grant money. Existing independent wild lives and consent remain authoritative. Detailed age pyramids, competition, disease, regional collapse, birth of every new species, seaborne migration and invasive-species dynamics remain further extensions when genuinely necessary.

## Verification

The full regression inventory starts with tests/ecological-webs.test.js. It checks initial real ecology; GM-authored insects and pollination; source-checked food webs; habitat-driven changes and conserved migration; read-only visibility; no free beasts, money or player dice; long-lived source histories, save/reload and protected turn replay. Mark checklist item #04 only after full GitHub Actions CI succeeds on the **exact latest PR head**.
