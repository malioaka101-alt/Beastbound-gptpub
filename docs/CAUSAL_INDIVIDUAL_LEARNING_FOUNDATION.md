# Foundation: Causally sourced individual learning (7 November 2026)

**Status:** Private, reusable engine primitive and regression fixture, not a public chat operation or a complete simulated education system. No active save was edited.

## Canon and design constraints

The Unified Master Prompt §§12, 19, 42–43, 48 supports independent people of human and sapient beast kinds, possible cultural exchange, and personally earned mastery. The standing Foundation-First World Architecture requires new individuals, communities, institutions and traditions to emerge **from real events**, not from a complete pre-authored directory. The player's clarified progression rule bans required teachers, tuition or calendar waits as generic advancement gates. Real effort, resources, health, comprehension, agency and the *particular discipline's canon* remain relevant.

## Implemented proof bridge

`world/causal-learning.js` connects `world/earned-individual-practice.js` to **how someone actually encountered knowledge**.

- `provenDemonstration` checks an alleged source actor's identity, valid private practice ledger and a retained **successful** original work receipt. A profession label, bloodline, hidden script or claimed rank is not a demonstration. The source's ability is never copied to the learner.
- `make` and `verify` maintain an identity-bound, append-only rolling audit for a particular learner, with the last 24 learning attempts and a hash/count anchor for earlier attempts.
- `resolve` accepts an open, contextual `route` label. An NPC, a sapient beast or another individually identified being may learn through a voluntary demonstration, ordinary public observation, actual records, mutual work, or direct experimentation. **These are possibilities, not required steps or a closed menu.** A reliable source may be an individual's retained practice receipt or an externally authenticated record; independent experiments need no external source.
- A **trusted world adapter** must authorise a genuine event and check contextual realities: the actual source event, time, place, communication and understanding, access rights, agency and consent where necessary, available tools and materials, anatomy and energetic compatibility, risk and a real independent learner check. A supplied event hash is not permission. **Never expose that validator or `resolve` directly as a player-controlled success command.**
- Only `Practice.record` evaluates the learner's own rolled activity, challenge, aptitude and method. A failed attempt records no proficiency. A successful attempt can earn practical competence in the learner's own domain; it never awards a spell, cultivation stage, origin integration, evolved form, licence, contract, title or borrowed professional rank. Other canonical advancement rules remain in charge.
- The source is not mutated. Both the practice ledger and the linked learning trace are updated together only after all local checks pass. Duplicate attempts and altered retained receipts are rejected. Both records must be persisted and verified again by the owning world adapter after checkpoint reload.

## Boundaries still unfinished

This first vertical slice **does not** create a global tutor network, a village, a teacher registry, a shared spoken language, a set of generic magical recipes, off-screen contact, a mandatory lesson price or new player skills. No tick or age produces knowledge. It also does not supply the *specific* trusted contact/consent/document/technique adapters, independent NPC-to-NPC scene logistics, group education, upbringing, cultural transmission, language acquisition or power-system breakthroughs. Those should be added **when sourced actual actors and events exist**, with species-specific communication and capacity.

Retired source practice receipts cannot be retroactively reconstructed from an anchor alone; durable archival attestations require another foundation. The hash chain is a consistency audit, not a cryptographic protection against an adversary allowed to rewrite every saved object. Already established institutional international publication/adoption remains separate in `world/knowledge-diffusion.js`.

Acceptance checks: `tests/causal-learning.test.js` exercises validated and refused access, teacher evidence, source tampering, independent self-teaching, failed checks, read/reload, duplicate attempts, and bounded history. Do not infer **in-world** player progress until a real adapter runs and its save is verified.
