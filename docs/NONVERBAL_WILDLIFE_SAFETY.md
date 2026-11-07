# Nonverbal wildlife safety and independent disengagement (7 November 2026)

**Foundation scope:** Original Unified Master Prompt §§7, 11–16, 43, 45–46, 49 and the Table Rules' player freedom, ecological plausibility, honest checks and independent beast agency. No universal spoken-language, teacher, fee, level, relationship, skill-rank or elapsed-day requirement to *attempt* an ordinary respectful gesture.

## Playable natural action

`give beast space`, `give animal space`, `back away slowly`, `yield space` or `lower my posture` can be authored in a Project chat turn. The private runner uses the existing situation:
- **Wilderness encounter:** `world.giveWildSpace({})` requires a current, actual, original engine-witnessed, present and unowned local *non-sapient* wildlife encounter. A threatening or wary animal is eligible. A two-minute ordinary gesture lets that individual independently withdraw, ease an immediate warning or maintain its boundary. Its already verified life RNG and ecological conditions determine the answer; the global combat dice stream is not used. Repeating the unchanged gesture spends real time but cannot reroll the animal's earlier response. No identification, Bond evidence, consent, affection, rank, item or supernatural effect is awarded.
- **Active wound-model fight:** `combat.exchange({intent:'yield_space'})` uses the existing independently committed enemy plan and previously established withdrawal DC. If the opponent is already committed to **retreat**, it leaves on its own. If it is holding position, an honest Wisdom + Beastcraft check may allow careful disengagement. If it is committed to **attack**, it still attacks; posture alone cannot compel another creature to stop. No requirement that either participant speaks the other's language, and no player-selected enemy plan, damage or DC.
- **Scene glance:** the current encounter's visibly threatening display may be reported without disclosing hidden temperament, motives or private beast statistics.

A sapient beast is a person and must use an independently source-supported encounter/communication path; this bounded animal-life procedure must not be mistaken for a full sapient conversation. Bonding, feeding, safe capture, physical restraint, complex negotiations, independent pursuit, full spatial tactics and outcomes for many other freeform gestures remain only partially implemented. The playable command is a first general safety route, not an exclusive menu of permissible behavior.

## Verification

`tests/wild-lives.test.js` and `tests/combat-agency.test.js` cover independently generated current encounters, threat states, refusal, independent attack/hold/retreat, forged parameter rejection, state integrity and disposable file-backed chat-turn replay. The complete sharded engine regression workflow remains mandatory. Live campaign saves are not fixtures.
