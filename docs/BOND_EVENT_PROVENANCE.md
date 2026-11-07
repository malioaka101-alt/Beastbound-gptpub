# Bond event provenance — guarded private turn routes

**Authority:** The original Master Prompt §§13–16, later source additions and the Table Rules outrank this operational note. A relationship is remembered history between independently willing people or beasts, not a repeatable button that produces Trust.

## Enforced in the Project chat runner

The pure helpers in `rules/bonds.js` remain for reference formulas and disposable tests. In `mode:"rule"`, `bond.event`, `bond.care`, and `bond.stability` now require **a prior, persistent, witnessed incident** at `state.table.bondEvidence[id]`. Requests cannot create evidence. A caller's fresh narrative `source` string in the *same* request is not proof.

A valid record has:
- a unique `id` matching the request's `evidenceId`;
- `beastId`, `kind` (`event`, `care`, or `stability`) and an exact `event` or `needs` matching what is being applied;
- `source`: a specific, previously recorded, player-known observation or account (18+ characters);
- `worldMinute`: the actual witnessed in-campaign minute, not a future time.

Care requires `startMinute` and `endMinute` at least six in-world days apart; contract `honoured_month` and `month_apart` require at least 30 days. Other weekly stability events require a sixday interval. No interval may extend into the future. Repeated or overlapping care periods for one beast are invalid. Evidence is marked used in the **same atomic saved turn** as its effects. Event `times` must equal 1.

A completed contract dissolution also updates the partner roster and the beast's recorded relationship state. Wound, evolution, and other private action resolution are unaffected.

## Additional contract-sealing provenance gate

A new contract may only use the precommitted `beast.contractGradeAssessment` record: numeric `grade` (1–9), `source` (specific signed/observed examination), `worldMinute`, and exactly matching `species`, `evolutionStage` and `individualGrade`. A later form change invalidates that assessment. **A descriptive species/individual rarity label such as "Common" or "Rare" is never silently converted into an invented numeric Grade.** There is not yet an automated examination operation to create these records. A missing grade must block sealing without consuming a die.

The live contract modifier now derives `contractLore` from an actually saved `skills.contractLore.rank ×2` if such a skill is earned and recorded, otherwise zero. The Soul discipline bonus uses the actually earned Soul Phase and the existing `soulProfile` formula. Direct caller-supplied larger grade, lore or Soul bonuses are rejected. Until a genuine sourced benefit exists, extra contract-stability `bonuses` are zero. This is a safeguard, **not** a claim that contract examination, apprenticeship or qualification subsystems have been completed.

## Independently calibrated individual Grade examinations — first verified route

A new `bond.gradeExamine` rule operation can complete a **real in-world examination** for a present, freely cooperative S0–S1 individual in the existing `crossing` or `academy` examination locations. A separate, sealed `beast.gradeCalibration` must **already exist** with numeric Grade I–IX, named independent source, recorded minute and matching current species, evolution form and individual rarity label. **Neither the player nor the operation can supply the Grade or choose the examination result.** Merely having `speciesGrade:'Common'` or `individualGrade:'Rare'` is explicitly insufficient. This is a source-backed revelation of an independently pre-established numeric rating, **not** a universal rarity-to-Grade calculation.

An eligible examination costs **1 Talon**, takes **120 in-world minutes** and uses a single saved-stat Wisdom/Beastcraft check against `DC 12 + 2×calibrated Grade`. A failed check records an inconclusive attempt, not a fabricated Grade, and prevents another attempt until a sixday passes. Success writes a `contractGradeAssessment` record with the source calibration, measured Grade, check, location, current form and world minute. It becomes usable by the existing strict `bond.seal` Grade gate. `bond.gradeStatus` is read-only and shows the assessment only when its current form and rarity are still matched. Grade uncertainty stays hidden before a genuine successful exam.

**This is deliberately limited:** beast-specific independent calibration and examination facilities must be established separately by the GM/world records, and a present beast must permit noninvasive evaluation. S2 guardian/sapient examination consent and Grades for uncalibrated individuals **are not inferred or implemented**. The facility/fee/DC are bounded provisional assessment rules, not a claim to reproduce any absent reference Python module. No legacy campaign save receives fabricated grades or credentials.

## Sealing requires previously witnessed agreement to the actual terms

A contract request's `beastWilling`, `guardianConsent`, and `informedConsent` flags are **claims**, not facts established by typing them. The live `bond.seal` route now requires a pre-existing `beast.contractConsentEvidence` record with `beastId`, `sapience`, `species`, `evolutionStage`, `depth`, `worldMinute`, an identified `source`, and explicit Boolean values for those three forms of consent. It must match the actual beast's current sapience and form, not be marked used or be dated after the current scene. Any caller-supplied flags must match the saved evidence.

The existing `consentGuard` then enforces willingness for S0–S1, guardian assent **and** willingness for S2, and informed voluntary assent for S3+. If the evidence says a party refused, no roll occurs. A fully successful and saved contract consumes the evidence; a failed roll does not silently count consent as a completed contract. Contract depth cannot be enlarged after an agreement without fresh consent.

**This does not manufacture consent.** No automated freeform-scene consent-capture operation exists yet; a GM must establish and checkpoint the actual dialogue/behaviour beforehand. A beast's generic `consent: true` or a starter partnership is not by itself evidence of agreement to a new specific set of contract terms.

## Engine-resolved animal consent: limited light contracts

The verified `bond.consentOffer` operation can now witness an **S0–S1 beast's voluntary response** to a *light* care-and-travel contract that preserves its right to refuse. It requires the same known individual physically present (a current encounter or accompanying partner), a matching bond record, and pre-existing Trust (30+), Respect (20+) and Willingness (50+). Fear, captivity, a fractured relationship or an active fight blocks negotiation. A beast is not forced into agreement by a natural 20 when those prerequisites fail.

An attempt takes **30 in-world minutes** and uses a single engine-resolved check derived from saved Charisma and Beastcraft and the bond's existing status. Refusal is honoured and recorded, without positive trust or consent; another attempt must wait at least one full sixday. An accepted offer creates `beast.contractConsentEvidence` for that **specific light depth** with independently resolved witness notes, time, current form, explicit S0–S1 willingness and explicit false guardian/informed flags. The caller cannot provide the outcome or change the consent flags. An unspent accepted offer cannot be rolled repeatedly. `bond.consentStatus` displays only the observed result, without saving or revealing hidden preferences.

The existing `bond.seal` operation still separately requires a genuinely assessed numeric individual beast Grade, earned contract abilities, load capacity, and a successful sealing check. A witnessed S0–S1 agreement must be **no more than sixdays old**, and the beast must remain present, free and comfortable at sealing; an old consent record does not create an irrevocable entitlement. Sealing consumes the record only on success.

**Scope:** S2 guardian approval and S3+ informed consent, deeper contract clauses and lawful representation are not implemented by this operation. They still require independently established evidence and a proper legal/dialogue model. This limited provisional adjudication does not claim full contract rights or independent NPC simulation parity.

## Starting records cannot invent years of friendship

The private `bond.register` route now defaults to a **neutral unfamiliar** history with no pre-awarded Trust, Willingness or Affection. The source-reference calculation still supports named past relationship origins, but the live runner requires a previously saved `beast.bondHistoryAssessment` for any non-neutral `start` or `years > 0`. Its `beastId`, species, evolution form, sapience, start, years, dated source and world minute must match the actual recorded beast and request.

The request cannot also add unverified personality traits; any `personalityTags` must already be recorded for that beast. A qualifying history record is consumed by successful registration, and a given beast cannot be registered twice. No older save is silently converted into an arbitrary 70-point Trust profile.

Neutral/unfamiliar is **a relationship starting point**, not a finding about a beast's hidden compatibility or supernatural potential. Training, bonds, trust and synchronisation still require their own witnessed achievements.

## Individual animal agency — independent refusal before any persuasion roll

A conservative `rules/beast-agency.js` gate now evaluates an individual animal's **own observable needs, comfort, previously recorded boundaries and stable predisposition** before `bond.interact`, `bond.consentOffer` or `bond.gradeExamine` can roll. An exhausted, hungry, badly injured, frightened, coerced or explicitly refusing beast cannot be persuaded to play, accept a contract or undergo an examination merely with a high Charisma modifier or natural 20. A present, safe animal may also decline particular activities based on a per-individual inclination; relationship history can increase comfort but does not erase the individual. A previously witnessed `agencyBoundaries` record has explicit source, time and avoided activities, and must be precommitted through authenticated GM/world evidence, **never inserted as an action bonus**.

For beasts without a sourced disposition, a provisional individual inclination is derived deterministically from the saved campaign seed and beast identity, optionally reflecting already established personality tags. Its calculation never consumes or rerolls the game RNG. The inclination is **saved only when an actual valid interaction or assessment is committed**; merely validating or rejecting an invalid request cannot create hidden character facts. No internal predisposition, exact need statistic or secret source is exposed as the player's thoughts or as a guaranteed ability to control another individual. An independent refusal spends the real attempted-interaction time and counts against normal daily/sixday limits, but makes no die roll, grants no positive event evidence and carries no automatic relationship reward.

At seal time, the runner rechecks current bodily welfare, freedom and individual boundaries for agreements witnessed by `bond.consentOffer`. A formerly willing animal can decline or become unwell after agreeing, without the old proof automatically becoming binding. Non-invasive Grade examinations likewise cannot proceed when the beast refuses.

**Limits:** This is a bounded individual-decision and welfare safety layer, not a full self-directed creature agent with private long-term goals, territorial ecology, breeding, languages or independently scheduled journeys. It does not claim that a creature's entire personality can be inferred from a seeded disposition.

## First verified evidence-authoring route: witnessed social interactions

The protected `bond.interact` rule operation now lets an established, physically present beast respond to `approach:'gentle'` or `approach:'play'`. The character must have an existing bond record (which may be neutral) and the beast must be either the active encounter or a recorded accompanying partner; explicit absence or a different location blocks the attempt. It is not available during combat or for a fractured relationship requiring separate repair.

The engine derives the roll modifier from saved Charisma and Beastcraft, and a bounded resistance DC from visible mood, sapience and current relationship willingness. The roll **determines the beast's reaction** rather than letting the caller choose it. Each attempt spends 15 or 20 in-world minutes and counts toward a strict one-attempt-per-beast-per-day limit, including refusals. An accepted gentle approach produces evidence for `gentle_treatment`; accepted play produces `play`. Refusal produces a logged observable outcome but **no positive evidence**, power, or trust.

The accepted response mints a uniquely identified `table.bondEvidence` entry with `origin:'resolved-bond-interaction'`, a real check, observed source, current minute, exact beast ID and exact event. No relationship point is granted yet. The subsequent `bond.event` operation consumes that evidence once; the private turn runner's stable ID prevents rerolls or duplicate applications. `bond.evidenceStatus` is read-only and lists outstanding witnessed records for a known beast without exposing hidden stats. The original bond formulas are still available for isolated source-reference tests.

**This is a conservative local adjudication for simple social interaction, not a claim that the entire ten-stage relationship and animal-behaviour model is complete.** Specific interaction DCs and time costs are bounded engine procedures, not copied from a missing canonical beast-handling module.

## Verified sixday care receipts — limited initial profile

The protected `bond.careAttend` action records an **actual daily care session**, not the player's assertion that care happened. For an accompanying, healthy, **unevolved Lanternfen Fox** (`fenfox`, Base form), it retains the limited provisional default of one `clean_rations` item per day at established shelter/water locations `crossing` or `academy`. **Other individuals and species need a previously recorded `beast.welfareCarePlan`**: exact species, evolution form, actual diet, source-dated observation or qualified husbandry source (18+ characters), daily food item/quantity (1–10), and allowed established shelter locations. The present supported food categories are intentionally narrow: `clean_rations` for recorded omnivores and `marsh_reed` for recorded herbivores *only when an individual plan independently verifies its suitability and quantity*. This does not assert that marsh reed is appropriate for all herbivores, or create any nutritional facts for unassessed creatures. Nectar-feeders, predators needing meat and other diets remain unsupported until compatible food and plans exist.

A day of attention costs **30 in-world minutes** and consumes the exact planned quantity from inventory; no free feeding, no automatic trust or welfare benefit. Each attendance record fixes that individual's species/form, food item, amount, care-plan source and shelter. The review refuses a plan changed mid-sixday, checks six actual daily receipts, and totals the correct number of food units. Invalid/underfunded attempts create no new ledger or consumed food. Independent, sourced behavioural boundaries can also prevent routine handling. The ration/shelter pairing and daily time are conservative transitional table rulings, not proof of a comprehensive species-specific veterinary or husbandry subsystem.

The player must actually perform `bond.careAttend` on each of **six consecutive in-game days**. A missed day resets the streak, not the elapsed calendar. After the sixth day **and** the end of the entire sixday span, `bond.careReview` may mint one one-use `bondEvidence` entry with `kind:'care'`, `needs:'met'`, actual start/end minutes and six daily dated attendance receipts. Merely calling `world.advance`, narrating care, or submitting `needs:'met'` does not mint evidence. The review does not itself increase Trust. Apply `bond.care` later with the returned `evidenceId` to use the existing source-backed weekly-care formula once; the shared `bondCareEnd` ledger prevents re-counting overlapping spans. `bond.careStatus` reports recorded sessions without mutating the save.

This limited path cannot certify welfare for an unsupported species or unverified individual plan, prove a contract was honoured for a month, or replace self-directed ecology, veterinary treatment, seasonal foraging and individual dietary monitoring.

## Still missing evidence-creation pipelines

There is **not yet a verified automated rule operation that authors arbitrary GM-narrated incidents, care for unsupported species, monthly contract stability, independently calibrated examinations for beasts without Grade references, historical relationship assessments or S2+/complex negotiated consent records from observed freeform scenes**. These cases must still be precommitted through a sourced GM checkpoint or remain blocked. Do not fabricate event records from asserted feelings, assume sixdays of care occurred, or reroll a failed/unknown interaction. No historical campaign saves are backfilled.

`bond.willingness` now reads only an actually recorded `beastHandling` skill rank when present. Current prototype saves lack that separate skill; their modifier is 0, not an invented conversion from Beastcraft.

**Future work:** source-backed bond initialisation (including past years), verified beast grade and contract qualification ledgers, actual precommitted event recording from natural chat actions, autonomous beast choices, and independently earned synchronisation stages.
