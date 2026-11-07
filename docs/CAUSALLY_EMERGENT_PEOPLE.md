# Causally emergent people — the first open-ended individual-person runtime

**Standing design authority:** `docs/FOUNDATION_FIRST_WORLD_ARCHITECTURE.md`, the original Unified Master Prompt and `reference/Beastbound_Table_Rules.md`. The purpose is to generate, maintain, grow and encounter a world as play unfolds—not to hand-populate another static NPC directory. All campaign saves remain untouched by this engineering change.

## From world needs to real new individuals

`world/emergent-people.js` adds a **generic source-backed person ledger** inside the persistent private `realm` save. As real sixday world ticks advance, economic and ecological needs of **any already supported simulated region** can trigger a new person with a source-bound stable identity and individual choices, even where the player has never been.

A person emerges through a recorded source of local demand: degraded habitat, shortage of resources, pressure on everyday civic services, or real livelihood and trade opportunities. The cause is recorded against the actual region, polity, local language and trade goods. A person's profession and purpose are **composed from that region's observed resources and need**, not selected from a fixed list of 48 named individuals. Names use language- and region-dependent sound patterns and a geographical byname, **not an invented genetic surname or automatically granted clan membership**.

The worker's saved record includes a permanent ID, source hash, first emergence day and region, profession, local language, resources, fatigue, independently seeded temperament, personal purpose, current location, real changes in work or recovery and a private chronological history. A different real ecological/economic situation generates different lives. Work, changing local stability and habitat stress can alter an individual's finances, tiredness, willingness to appear, and voluntary movement to geographically connected, viable regions. This does not award unverified magical stages, mastered technique, property rights, employer authority or familial status.

**No maximum person count exists.** Arrival probabilities fall when relevant local work is already well supplied, but can still generate fresh meaningful individuals later, in a way that scales with actual economic conditions. This is a simulation of **individually significant agents**, not a finished census of everyone alive. It initially operates in the authored atlas's simulated regions, but does not imply that all possible regions, cultures, professions, or people are enumerated. Adding new real regions or opportunities should extend the mechanism rather than require another long NPC roster.

## Real local presence and player agency

`world/person-presence.js` now treats these new people alongside the initial five authored NPCs and 48 named notables. A generated person appears in `social.localPeopleStatus({})` **only when their own currently recorded work presence places them at the player's genuine site on that day**. People in an unvisited region can continue to exist and act without a playable local scene. Nobody can be retroactively placed nearby by claiming their name or membership.

The private chat can call `social.speakLocalPerson({npcId,question})`, or use a natural `talk to NAME` / `talk to NAME about QUESTION` action, when a newly generated individual is genuinely at hand. One short witnessed professional conversation takes 14 real in-world minutes and yields a limited independently determined response, including a right to defer. It **does not** grant social loyalty, secret technique, a free tutor, public office, inherited status, verified personal secret or a contract. Further dialogue can develop naturally under the Table Rules without forcing each sentence through a repeated roll.

`social.metPeopleStatus({})` is strictly read-only and contains only the character's own genuinely witnessed conversations, not the person's hidden life, location after leaving, finances or family secrets. People may also freely accept, decline or consider invitations to a genuinely founded player group, through the **existing** voluntary `social.inviteGroupMember` system. Their decision and the proof of a real local conversation are recorded in the actual group membership ledger.

## What remains unfinished

This is **the first general generated-person runtime**, not a complete world/census/personality simulator or a universal dialogue engine. It does not yet simulate actual human births, legally established parentage, hereditary constitutions of real new human children, full careers, fatal illness, independent households or relationships between arbitrary emerging persons. The shared human/beast biological Origin Pattern model from `world/origin-heredity.js` must only be used after actual biological parents and a real source-backed birth exist; a surname, existing charter or invented noble claim is insufficient.

All new people retain a separate independent life even when unseen. Further work should make this generator composable with human births/households, education and acquired clan techniques, employment, institutions and legal systems; that is more useful than manually naming the next fifty background NPCs.

### Regression

`tests/emergent-people.test.js` is mandatory in the private GitHub Actions engine workflow. It checks causally generated individuals outside the player's presence, variable professions and stable unique identities, no invented genetic kinship or ranks, independent work and mobility, checkpoint replay, actual connected travel, presence and refusal gates, witnessed conversations and knowledge privacy, voluntarily sourced group membership, and duplicate file-backed turn safety. No active campaign save is edited.
