# PR #137 — a real institution's founder-owned resources at a witnessed site

**Original source owners:** physical asset attestations and current stock in `rules/material-handoffs.js`; real voluntary groups, signed membership/role decisions, and already reviewed site work in `world/emergent-groups.js`; original lived places in `world/lived-places.js`; one real actor and world clock in `engine.js`.

This is a small reuse of those existing authorities, following merged #135 (actual group activity at GM places) and #136 (independently accepted practical volunteer responsibilities at places). It is not a building-construction simulator, automatic staffing engine, second item ledger or replacement for the canonical world's organisations.

## Supported transitions

- A real founder who is **actually present at a source-established site**, has already documented **genuinely personally owned goods** through `social.documentOwnedMaterial`, and **still has sufficient physically owned quantity** may state an open-ended practical use intention with `social.offerGroupOwnedResource({groupId,assetId,purpose})`. This attaches an immutable evidence copy to that original group's ledger and preserves the original asset attestation ID, its verified physical owner root, original founding-site witness and the founder's actual event.
- All items **remain in their original owner's inventory**. There is no transfer, placement, building upgrade, access licence, guaranteed usage by another person, fee, institutional title, public authority or invented stock. A person deciding to offer a tool does not compel another participant to use it.
- `social.groupResourceSiteStatus({groupId,placeId?})` checks the complete original asset journal again, source-validates the original group, verifies real physical custody against the original owner provider, and reports `physicallyAvailableHereNow` only when the **unwithdrawn** asset's owner is at the precise original site and still holds the required amount. When they move away, lose or consume the goods, it becomes unavailable—without overwriting history. GM-authored structure descriptions and canonical Atlas facility labels are explicitly **not** assigned to the group as property.
- The same read-only response composes the existing **independent voluntary responsibilities** originating from that exact place, plus the original independently reviewed site work. These responsibilities have their own acceptance, expiry and departure semantics; they are not employees, wages, tuition, teaching qualifications or promises of completed work.
- The original owner may withdraw the voluntary resource availability using `social.withdrawGroupResourceOffer({groupId,offerId,reason})`. Withdrawal retains the original offer as historical evidence and **moves no item or money**.
- Older group saves without resource-use records remain untouched and valid. Both canonical Atlas locations and source-verified GM places are supported; invented sites or counterfeit founding hashes do not qualify.

## Engine boundaries

Actual consent to join, time-limited volunteer responsibilities and independent work remain in their **original** owners. Physical objects remain in their **original** inventories and custody sources. Facility construction, land rights, equipment loans involving actual transfer to somebody else, formal employment, wages, working laboratories, real teaching, accreditation and student progression require their own genuine supported source and are not quietly assumed here.

The original Master Prompt's diverse social norms and the GM's unrestricted narration remain intact. A game may feature a formal academy, workshop, library or private lodge, but a name does not automatically create a staffed/functional mechanically verified school.

The disposable end-to-end regression `tests/gm-institution-original-physical-resource-use.test.js` covers an authored hall, genuine fieldworker inventory, original attestation, volunteer role/independent choice, physical stock depletion and absence, withdrawal, tamper rejection, unchanged money and RNG, saved reload/read-only status, and a canonical Atlas site with pre-existing facilities. No active saves, requests or gameplay outcomes are modified.
