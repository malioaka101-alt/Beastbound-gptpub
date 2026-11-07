# Earned Soul Phase I — recognition of personally witnessed nearby living signatures

**Authority:** Unified Master Prompt §22 (Soul Perception), §§19, 45 and 51, and Table Rules §3.5 (character-known information), §3.9 (measurements are distinct) and the prohibition on invented outcomes. This is a bounded **power capability**, not an NPC census or a new recruitment system.

## Original playable ability

A genuine Phase I Soul Perception breakthrough already permits sensing the practitioner's own living spiritual structure and the signal of an authentically encountered nearby beast, using **2 Soul reserve**, **6 real minutes** and **one existing Cultivation + Wisdom d20 check**. It cannot infer a mind, species, identity, contracts, magical grades, emotional secrets or remote location. The existing animal focus remains separately proven and usable only with an actual witnessed local encounter.

This pass adds the missing **living-person** connection. If the practitioner has just personally conversed with a real canonical resident or an independently generated, currently present civilian **in the same actual scene**, the original conversation event and hash, source-backed shift/presence, person identity and day/time are checked. The verified direct in-person meeting supports immediate close physical proximity within Soul Perception's first-stage range. A brief ten-minute freshness window is the limit of the *contact evidence*, **not** a training cooldown or claim that an unseen person ceased to exist. Newer real sight, meeting or location evidence may support other actions through their own valid sources.

The Soul check is the same actual one used for wild-life sensing, with DC 14 when another source-witnessed living presence is nearby and DC 12 for self-only sensing. The output can confirm **another living signature** when that roll succeeds. It does **not** identify an anonymous signature, reveal a hidden name, read thoughts, create a relationship, override refusal, open a new power, or claim that someone farther away is within range. A name found in a public list without actual in-person conversation is *not* proximity evidence.

The existing operation is `soul.perceive({})`; natural chat requests such as `sense nearby life` or `sense souls around me` use the same protected procedure. Caller-supplied person ID, DC, answer or chosen success are rejected before spending energy or rolling. Logs and a personal attempt ledger retain the authentic check, the original conversation-event hash if any, world minute, location and resource cost. A no-source scene remains self-only. Independent individual lives are never updated or controlled just because the practitioner senses them.

## Deliberate limits

The current world lacks a universally precise map of every person's metre-level position. Therefore this Phase I improvement only acts on **recent actual in-person meetings** plus current independently verified presence, not every named person in the local settlement and not unobserved beings. A more complete sensory geometry/line-of-effect system, consensual soul care, Phase II–VII soul disciplines and specialised Soul Engineering remain unimplemented. The ten-minute evidence horizon is conservative and does not prohibit a player from speaking to or directly observing someone at any other time.

## Verification

`tests/earned-senses.test.js` adds synthetic disposable-save coverage for a real earned Soul phase, a canonical local NPC, a genuinely independently generated present worker, source-event forgery, an expired conversation witness and saved private chat-turn replay. Existing beast observation and Rift Sense remain unchanged. All 97 regression files must pass the single required private `test` workflow before merging. Active campaign saves are never used as fixtures.
