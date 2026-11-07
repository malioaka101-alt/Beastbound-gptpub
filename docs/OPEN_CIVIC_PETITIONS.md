# Civic access without noble patronage — ordinary residents may petition the March Council

**More positive ordinary civic participation:** The public March Council now also has source-scoped **Workday 4 hearings** in Morrowfen Crossing. The player can speak freely about an existing documented family dispute (`river_crossings`, `reedbed_access`) or any other concern (`general_business`) with `social.hearing`, without first getting a petition accepted or joining a powerful family. Supporting a wetland issue with a genuine earlier habitat survey is optional. Conflicting household public charter responsibilities are shown without invented individual presence, and the council plus families respond independently on later real world ticks; only their actual published procedural responses are visible. No automatic judgment, law, office or nobility follows. See `docs/OPEN_PUBLIC_HEARINGS.md`.


The Unified Master Prompt §§33–36 and §§39, 42, 47 and 54 requires politically independent settlements, guilds, nobles, working households, councils, legal rights, public affairs and meaningful freedom. A citizen must not be forced to marry into a special family, join a sect, bribe a noble or gain high cultivation rank just to express a public concern. This expands the existing **Reedmarch Compact** and already-authored **March Council** (`marsh_council`) rather than replacing the world's political map.

## New local public access

A **small public council correspondence counter in Morrowfen Crossing** is newly authored here as a reasonable extension of its existing settlement and its existing March Council. It is **not** a verbatim original Master Prompt location and is not a guarantee that all world kingdoms use the same forms or hours.

Any able visitor in the actual settlement, during daytime public hours and without an unresolved battle, can submit **their own freely phrased petition** using:

`{"mode":"rule","system":"social","operation":"petition","params":{"statement":"Please consider making the wetland refuge crossings more accessible to river workers."}}`

There are no royalty, reputation, guild sponsorship, family, money, prerequisite fieldwork or Arcane/Meridian qualifications. The petition must simply be readable, within a reasonable record length and genuinely filed in person, spending **12 real minutes** and zero compulsory tuition. **Different concerns are permitted on the same day**: the narrow guard prevents re-filing the *identical* statement within the same real sixday, not ordinary civil discussion or different issues. The statement is explicitly the citizen's **unverified claim or request**, not a declaration that its alleged facts have been proven. An assertion of a royal birthright does not conjure genealogy, an heir, a contract or a new monarch.

A witnessed local event stores the **original full statement, place, date, 12 minutes, source and event hash** before any independent decision. Neither the player nor the GM can choose an approval, court verdict, royal decree, special bloodline, elected official, hidden witness or council opinion. The first human player freedom is to articulate any lawful concern; the engine does not impose only four prewritten story-choice buttons.

## Independent political response and known information

After **at least one genuine sixday of in-world time**, the existing March Council independently reviews the filing using its real active institutional capacity, the Reedmarch government’s real public stability and legitimacy, and the **independent world simulation RNG**, never the player's attack RNG. It may:

- **Docket the submission** for public consideration — the council announces this fact through normal local news after its standard publication delay, but it makes *no factual finding*, *no new law*, and no promise of victory at a future hearing.
- **Defer** the submission under its own workload.
- **Decline** to place it on the current public agenda. This alone does not create an automatic feud, imprisonment or lasting retaliation.

The independent review is preserved in the world's private `civicPetitionReviews` and, where genuinely docketed, the public `governance.reedmarch.publicDockets`. Neither creates a false legal finding or leaked private proof.

`social.petitionStatus({})` is **strictly read-only** and allows the character to review their own sent receipts, preserving their exact words. A decision is not shown as personally received until the player actually revisits Morrowfen Crossing and collects it with `social.pickupPetition({petitionId})`, taking **8 real minutes**. Collection verifies the original witness, registration hash, actual dated world review and matching public docket record where relevant before displaying the reply. The independent decision is not a fabricated personal invitation to the council chamber or an appointment with a king.

There is no payment, free nobility, PvP control, direct policy decree, inheritance, Mana/Qi technique, guild rank, or pressure to undertake politics at all. This is a **first positive channel for ordinary political voice**, not a fully playable court hearing or universal petition system across all 24 states. Other countries and their real institutions have their own legal processes; do not automatically transplant the March Council's desk everywhere. Free-form conversations, collective petitions, unions, public protests, representatives, actual hearings and policy implementation remain future source-attested work.

## Verification

`tests/open-civic-petitions.test.js` verifies unrestricted readable resident statements; multiple distinct issues; one-use identical filing protection; real local source/date/time, hash and unchanged finances; independent outcomes on the actual sixday simulation; properly sealed responses before in-person pickup; public dockets for only accepted items; zero law, family, money, rank or power from merely filing; fabricated and premature receipts rejected; the player's title claims remain *claims*; file-backed idempotency and pure read-only status. The full existing project test suite remains mandatory. No live saves are edited.
