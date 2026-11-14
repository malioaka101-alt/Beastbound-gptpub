# Genuine group staff responsibilities at GM-created sites

## Confirmed missing source connection

Beastbound already had independent, limited voluntary organisational responsibilities in `world/emergent-groups.js::proposeVoluntaryRole`, including real individual membership, on-site presence, an independently decided yes/no, original agency RNG, dated role terms, immutable source hashes, and automatic status after a member's departure. Before this change the original owner could only accept hardcoded Atlas locations and was not exposed through the playable chat rules. The existence of a hall, academy or institute by name did **not** give it actual working staff.

This patch connects that already existing responsibility owner to player-led voluntary groups at the same existing canonical **or** established GM-authored site; it does **not** create a separate staff simulator or change the outcome distribution.

## Source-owned chat operations

- `social.offerGroupResponsibility`: `{groupId,npcId,title,scope,untilDay}`. Only the real founder of the player-founded original group may personally ask an **independently consenting current member** who is physically present at the actual scene and remains for the full original 18-minute conversation. An active encounter or incapacity stops it. The founder can choose only the **proposed practical title, scope and expiry**, never a decision, salary, legal authority, success, rank or future duty performance. The existing group owner uses `world/group-member-agency.js` **once** to decide whether that person agrees. The original 18 minutes and world-clock finalisation remain authoritative.
- `social.groupResponsibilitiesStatus`: read-only private status for the real local founder, reading `world/emergent-groups.js::voluntaryRoleStatus`. A person's independent refusal remains a refusal; an accepted responsibility expires after the actual term or ends with independent membership departure. Inspection cannot claim employment, wages, legal status, actual work, qualification, teacher competence or exclusive use of premises.
- `world/lived-places.js::originalSiteProof` and `verifiedSiteRegion` preserve the originally founded GM site as part of the **same existing** original role proof. The current living-place founding source must still exist and match in the saved world. The canonical location path accepts historical original role records without fabricating new site founding records.

Existing `world/emergent-groups.js` voluntary role history is reused. No new occupation categories, hierarchical titles, asset records, buildings, fees, staff salaries, study ranks or dice are introduced. `world/person-careers.js` still owns any actual professional work and earned practice; `world/emergent-groups.js::month` and its original treasury audit still own any actual organisational work and cost. An institution cannot declare a classroom built, employed teacher hired, staff pay owed, or teaching completed merely by recording a willing voluntary member.

## Regression

`tests/gm-site-voluntary-member-responsibilities.test.js` demonstrates a disposable witnessed GM hall, a physically introduced autonomous person, original voluntary group membership, original independent acceptance and refusal of practical roles, own-member RNG rather than player d20, source tamper rejection, no extra money/property/work, term expiry, exact turn replay and genuinely read-only status. No existing campaigns are touched.

**Further facilities scope:** A verifiable *owned facility or group-held physical item* still needs evidence from the original construction, material custody, property and finite economics systems. GM-authored scenery and an accepted voluntary responsibility are not ownership or building completion. This PR deliberately does not invent that evidence.
