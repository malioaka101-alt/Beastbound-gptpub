# Source-witnessed GM people enter their original professions

## Why this is a real integration gap

Beastbound already has persistent GM-introduced people in `world/emergent-people.js`, plus independently earned professional work in `world/person-careers.js`. A newly introduced person's original independent life and profession are genuine, but their own source-owned career deliberately refuses to invent a suitable work template until the GM has established one. Until this bridge, the source owner offered `Careers.authorDuty` internally but gameplay had no direct way to record the actual GM-observed duty.

**Do not create a separate employment/training simulator.** These three rule operations expose precisely the original career owner for an already registered GM person:

- `social.authorWitnessedPersonDuty` accepts `npcId`, `id`, `role`, `method`, `goal`, `domain`, and an **exact original scene quotation** in `witness`. The actual existing actor must be visibly present and personally introduced in the recorded current scene. The same `world/person-careers.js::authorDuty` records the source hash and known working role. No `effect`, employer, wages, stat, chance, consent or other outcome can be supplied. The original career restricts methods and domains and applies its established ecology/civic/trade limits when the worker **later actually works**.
- `social.witnessedPersonDutiesStatus` reads the original public known-role descriptions and actual recorded work count with **no turn, hidden aptitude, skill rank or resource change**. A nonexistent/unverified GM worker is not listed.
- `social.retireWitnessedPersonDuty` carries an existing duty ID and genuinely witnessed later scene quotation in `reason` to original `Careers.retireDuty`. The initial source stays intact; retiring availability does not claim termination wages, owner decisions or a performed dismissal.

An authoring operation is **optional source registration**, not a mandatory action for ordinary conversation or natural GM narration. Record one when new NPC work must actually participate in the existing career mechanics.

## What this actually unlocks

After the GM genuinely establishes a travelling teacher's practical note-taking duty, a beast-handler's field-survey duty, or a workshop worker's ordinary craft duty, the **original** worker may independently choose that available work. The original career's own fatigue, chance, skill rank, work roll, earned practice, finite world effects, finances, independent RNG, and original work receipts stay authoritative. A `social.observeLocalPersonWork` witness can report a real attempt or a real refusal, with existing time and public-observation semantics.

This is **not** an academy appointment, paid student enrolment, formal teaching qualification, exclusive contract, automatic teaching, advanced supernatural skill, licence, free funding, or guaranteed success. A later operational academy requires actual physical facilities, independent staff agreements, validated resources and legitimate teaching methods from their respective original source owners.

## Regression

`tests/gm-person-career-work-bridge.test.js` creates a disposable GM-introduced citizen, rejects fabricated powers and unsupported scene evidence, registers one original career duty, verifies no time/coin/player-roll change, executes one original independent professional work receipt with real source-linked skill gain or failure, tests real observed willingness/refusal, prevents forged career history, and proves exact GitHub-turn replay plus later sourced retirement. Active campaign saves remain untouched.
