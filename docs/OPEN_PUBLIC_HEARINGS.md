# Open March Council hearings: real citizens, actual household interests, optional evidence

**Follow-on playable voluntary negotiation:** A published, genuine `mediation_invite` from a source-hashed March Council hearing enables a resident to propose arbitrary own-word practical terms through `social.mediationOffer`. Both relevant family elders answer separately on real sixday world time; either can decline. If both volunteer, `social.mediationBook` schedules an actual available Workday-4 public meeting and `social.mediationMeet` records the resident's words plus independent bounded elder replies. The only proposed cooperation implemented is a **possible nonbinding joint site inspection**, not a verified accomplished visit, enacted law, general written contract, property transfer or established alliance. No family influence is compulsory to make the request. Source and limits: `docs/VOLUNTARY_FAMILY_MEDIATION.md`.


## Source boundary and local authored schedule

The Unified Master Prompt §34 establishes **real governments, great clans, commoners, private families, law, public duties and political disagreement**. The Table Rules require player freedom and independent NPC agendas. The original source does **not** dictate the specific hearing day, topic list, or exact procedural powers of every council. This patch therefore introduces a narrow, clearly **new Reedmarch local civic schedule** for the already authored `marsh_council`, not a universal law applied to every kingdom.

The existing Morrowfen Crossing March Council hears residents in a public session on **Workday 4 of each sixday**, **10:00–16:00** (the actual anchored calendar, including the five Concord Days, governs dates). Public testimony takes **35 real in-world minutes**, and the Council must be genuinely active, at the real site, without an unresolved combat encounter. There is **no mandatory noble invitation, Guild licence, family membership, wealth, cultivation level, petition approval or fee** to speak. Other days and times remain open for existing public petitions; a hearing appointment follows the published local calendar rather than a mysterious quest unlock.

The player may address **general business in their own freely written words**, without pretending it is already true. Two specifically documented issues draw directly on the original regional household charter expansion, with exactly their **publicly filed interests**, not secrets or invented face-to-face attendance:

- `river_crossings`: **House Fenwake** has canal land, toll income, flood duties and sanctuary commitments. **Reedward Ferry Kin** has practical river crossing responsibilities and a publicly filed tariff dispute. These are conflicting institutional stakes, *not* proof one family is evil.
- `reedbed_access`: **Reed Clan Families** protect shared reedbed use against commercial leases; **House Fenwake** must balance canal infrastructure, land claims and sanctuary access.
- `general_business`: Any other honest civic testimony, without assigning a made-up legal expertise or position to a family not actually connected to the topic.

`social.hearingStatus({})` is strictly read-only: published sitting time, public issues, publicly declared family stakes, and the player's own actually recorded testimony. It reveals **no undisclosed clan secrets, live political influence scores, private household deliberations or unpublished council decision**. The player does not have to approach any noble household at all.

## An actual positive scene action

At the public session, use e.g.:

```json
{"id":"any_unique_turn_id","mode":"rule","system":"social","operation":"hearing","params":{"issueId":"river_crossings","testimony":"The ferry should be safe and affordable for ordinary travellers, and the sanctuary paths should stay open."}}
```

The engine witnesses and saves the actual **freeform statement**, location, date/time, official sitting, two families' publicly documented interests, named current council office and original event hash **before** any independent review. This is a recorded opportunity to speak, **not** a persuasion roll requiring elite qualifications or a guarantee that the speaker's claim is true. A resident can address different issues in the same sitting. The same resident cannot repeatedly re-file the *same issue in the same hearing session* to fish for approvals; they can return to later real public sittings.

### Optional genuine evidence, not a forced quest

A character who has genuinely interpreted a relevant **Whisperfen habitat survey** by completing `world.habitatSurvey` and its precommitted `core.check` can additionally supply `checkId`. The engine reconstructs the **real prior terrain witness and successful Survival roll**, checks location and original scene/roll hashes, and links that record as independent supporting ecological evidence. False success, fabricated reports, arbitrary skill boosts or irrelevant unrelated surveys are rejected. **No evidence is required to exercise the right to speak.** A genuine survey can make a council records inquiry more likely but never guarantee a verdict or establish guilt, noble inheritance, magical affinity or a new law.

The household public positions are **written charter claims read into the public hearing**; the engine does *not* invent that particular elders, family children or off-screen beast representatives happened to be physically present.

## Independent family and council agency

After **at least six actually elapsed world days**, on the next true sixday world tick, the independent March Council and the two relevant households review the testimony. The families can request inspection of public records or urge delay **on their own**, using separate world simulation random draws and their existing family pressures. The council independently decides to:

- **Request an open records review**, which starts a *procedural inquiry*, not a finding of corruption or court judgment.
- **Invite parties to voluntary mediation**, not forcing any household to accept, appear or make concessions.
- **Defer the subject**, leaving existing law and the concern unresolved.

The council's decision is recorded in the actual `table.realm.publicHearingReviews` and government's public hearing docket, with a local public notice **after a two-day publication delay**. The player's `social.hearingStatus` reveals that decision and the filed family responses **only when the notice has actually been published and the character is at the local site**. Outside Reedmarch and before release, the result remains sealed as an unobserved world action. This is an early procedural slice, not a complete court trial, elected legislative debate or automatic enforcement of a new policy.

Important **remaining work**: procedural records reviews should lead to genuinely researched documents; mediation invites need individual consenting representatives and credible time/location; hearings should eventually span more settlements and the twenty-four governments with their distinct laws; family inheritance, marriage, adoption, sect influence and offices still need actual person-level simulation. Do not overstate the current feature as complete nationwide political agency.

## Regression coverage

`tests/public-hearings.test.js` exercises real Workday-4 attendance, no qualifications or fees, freely authored testimony, family positions grounded in original charters, multiple issues per session, preservation of the original ecological survey and roll hashes, false and irrelevant evidence refusal, council and household independent responses, proper sixday and publication delays, no invented law/ability/rank, corrupted statement fail-closed, and real file-backed idempotent private chat turns. The existing full engine CI suite remains mandatory. **No active campaign save is changed.**
