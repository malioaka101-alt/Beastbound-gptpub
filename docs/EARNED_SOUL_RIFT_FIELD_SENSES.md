# Earned first-stage Soul Perception and Rift Sense (7 November 2026)

## Why this is a gameplay feature, not a universal power ladder

The original Unified Master Prompt §§19, 22 and 25 keep **Soul Cultivation, Rift Practice, Meridian, Arcane, Body Refinement, beast evolution and synchronisation independent**. Previously `discipline.breakthrough` could award Soul Phase I or Rift Step I, but these early-earned senses had no fully exercised **playable field use**. The following are two modest, bounded Stage I actions, **not** the advanced Soul Engineering, true telepathy, Rift Anchor, Fold Step, Soul Domain, hidden bloodline discovery or completed higher-rank progression. No paid teacher, guild membership, beast contract, inherited family or universal class is required.

### Soul Phase I: living-pattern perception

After actual earned `discipline.practice` and `discipline.breakthrough` history, `soul.perceive({})` allows a **6-minute** concentration and **2-point Soul reserve** expenditure. The real character's Wisdom and Cultivation determine one genuine DC 12 check for self-sense or DC 14 when the engine itself has previously placed an independently encountered non-threatening living beast **within the earned Soul perception range**. No input can choose a beast, result, soul value, distance or difficulty; a failed perception costs energy and time but cannot establish a signal. The starting Phase I range comes from the already canonical `rules/build.js` profile (10 metres).

Newly generated real wildlife encounters now include a **source-witnessed, independently sampled physical distance of 2–17 metres**, without player-set coordinates. An encounter across the woodland or at an unmeasured legacy distance **does not become a close-range spiritual target**. The technique senses one's own pattern, and at most a limited living signature of a genuinely encountered nearby individual, not their name, thoughts, fear, hidden grade, species, powers, soul secrets, consent, or right to be captured.

**Practical, bounded payoff:** a successful and source-verified nearby living signature can provide **+1 to one regular noninvasive Beastcraft wildlife-observation roll** if the same actual animal remains present and the attempt occurs within 60 in-world minutes. `world.observe` still performs its own ordinary real check, using the focus as a situational bonus only. The focus is consumed once even on failed identification; the observation still cannot guarantee species ID, reveal Grade/evolution secrets or award a bond. Altering a witness hash or passing invented role information blocks the aid. The first-stage sense does not award automatic experience from repeated meditation.

An ordinary full night's safe rest restores **at most 3 earned Soul reserve** (capped at its established maximum). An unawakened character does not gain a free reserve. Rest retains all wound and camp safety requirements from the existing system; it never heals severe soul damage without a dedicated source.

`soul.perceptionStatus({})` reports only earned personal range, Soul reserve and known attempt count, read-only.

### Rift Step I: exterior boundary pressure

After a real earned Rift Step I breakthrough, `rift.sense({})` is a **12-minute** locally constrained study at the actual Riftglass Outpost exterior boundary, costing **2 Stamina** and making a documented Arcana/Intelligence check. Its DC (13–17) and resulting broad observation are derived from the **actual persistent existing Riftglass vault seal/charge and surrounding ecological strain**, never selected by the caller. A failed check can only return an inconclusive report; a successful check reports a broad exterior pressure state. No exact hidden seal numbers, pocket-realm secrets, permission to enter the vault, invented map, blink, teleportation, combat bonus or new arcane rank follow. A different location without physically recorded rift conditions fails closed. `rift.senseStatus({})` reports only previously earned and personally witnessed readings, not fresh hidden clocks, and never writes a save.

### Continuity, open world and limits

These are *usable first-stage expressions*, not the complete advanced cultivation program. The **world still moves on its real clock**, unrelated independent NPCs and beasts make their own decisions, and the player can ignore or pursue any discipline. No artificial paid master or prescribed organisation is needed. Other genuine known rift sites will require actual playable travel and measured pressure rather than pretending that a public map grants instant access. A person's Soul Perception does not bypass consent or the separate personality, body, anatomy, animal welfare and Origin Pattern systems.

`tests/earned-senses.test.js` exercises genuine sixday practice and breakthrough into both skills, ordinary use, refusal of caller-forged outcomes, source-backed distance, limited normal Beastcraft synergy, edited-evidence rejection, actual physical cost and time, privacy, rested reserve recovery, foreign-site refusal, read-only status, and file-backed idempotence. Every test uses **disposable** state. No active campaign checkpoint is edited. Full private-repository CI is mandatory before merge.
