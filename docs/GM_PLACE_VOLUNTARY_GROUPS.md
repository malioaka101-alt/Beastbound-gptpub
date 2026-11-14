# GM-founded places and genuine voluntary associations

The source-owned world location registry already establishes physical places through an immutable original founding witness. The original person-presence system already recognises individually witnessed living citizens and schedules them in those places. The group system already supports self-declared voluntary organisations, independent invitations, and optional practical work, but its first-party entrypoints still required a fixed Atlas location.

This narrowly connects those **existing systems** without adding an NPC agreement script, organisation engine, academy catalogue, character rank or separate schedule.

## What the same original operations can now do

- **Found** a voluntary association in an actually established GM-created place. `social.formGroup` uses the original lived-place region instead of requiring an Atlas location ID, retains all original founding time and charter limitations, and starts with one consenting founder and no invented income.
- **Invite** a personally present, independently established individual there. The original `social.inviteGroupMember` resolves their real source-verified local presence; the existing individual-group agency makes exactly one decision. The recorded acceptance, deferral or refusal includes the founding source reference of a GM place when applicable. The group consent adapter revalidates that origin across save replay and independent world ticks.
- **Offer** a real existing member an optional open-ended group task there. `social.groupTaskRequest` uses the existing place's original region, original membership and independent choice. It records an authentic offer and the unforced decision; **it does not perform or pay for any work**.
- **Inspect** the actual local association and its private founding/membership records while physically at the GM-founded location. Read-only status has no new dice or time cost.

The place witness is a SHA-256-bound copy of the original **already verified** GM founding source, not a place the caller can insert into an invitation. Older canonical site records are accepted unchanged and cannot be given a fake GM-place witness.

## Limits deliberately left in place

A group called an academy is not automatically an accredited teaching institution. There is no instant classroom, staff salary, student acceptance, lesson, material production, legal authority, curriculum, beast bond, learned ability or completed contract. Those require appropriate original owner systems and actual witnessed events.

Not every original group operation has been extended to a GM-created site: source-bound priority votes, coordination mandates and other operations with their own fixed-Atlas integrity requirements remain gated until separately verified. This PR only claims the working **founding → independent person membership → optional task offer** path at a GM site, plus read-only group visibility.

## Acceptance

`tests/gm-place-voluntary-groups.test.js` creates a disposable GM-established hall, introduces an independent citizen through the actual living-person owner, founds an association, draws real individual membership and optional work decisions, verifies founding hashes and original group receipts, tests read-only local views, exact replay, unchanged player rolls/money/bonds, and rejects source tampering. The existing broad regression batches must also pass without modifying an active campaign save.
