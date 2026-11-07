> **Current power-system audit (v1.1):** `docs/SOURCE_TO_ENGINE_AUDIT_V11.md` is the honest section-by-section (all 57 Master Prompt sections + later additions) mechanical coverage ledger. `rules/character.js` supplies a four-domain seeded capability sheet and separately assessed potential; `rules/disciplines.js` supplies time/cost/risk-backed early discipline training and 108-Gate progression; `rules/progress.js` requires validated complete form profiles before successful beast evolution. Legacy shortcuts are blocked in private turns. **Full high-tier power and civilisation parity is not yet implemented.** Ivar's separate save is protected, and play remains in private Project chats.

# Beastbound Realms — PRIVATE ChatGPT Project RPG

**This is a private text RPG played inside the Beastbound ChatGPT Project. It is not a public website or a game to publish.**

The ChatGPT conversation is the play interface: write actions and dialogue naturally. ChatGPT narrates the world and interprets intent; the tested JavaScript engine (`engine.js`) resolves numerical actions, progression, world ticks and saves. The private GitHub repository holds rules and campaign checkpoints between chat sessions.

## Private chat execution (no public hosting)

Read `reference/Beastbound_Table_Rules.md` for 34-character panels, NPC knowledge, scene style, honest dice and world continuity. The original authoritative rules take precedence when a digest differs.

**New in the private chat runtime:** `panels.js` makes exactly 34-character status panels; `scripts/chat-turn.js` applies a single idempotent turn and saves a checkpoint; `scripts/process-pending.js` plus a private GitHub Actions workflow can run a turn when the chat itself cannot execute JavaScript. Everything remains in this **private** repository. The optional Actions workflow is subject to free-tier minutes, and it's not instantaneous. See `docs/CHAT_EXECUTION.md`.

## Play inside a Project chat

1. Open the **Beastbound** ChatGPT Project.
2. Say **"Resume Aerin Marsh from the private GitHub save"** or begin a new campaign.
3. The GM reads `docs/PROJECT_CHAT_INSTRUCTIONS.md`, loads `saves/aerin_marsh.json` and runs the engine through the available code-execution environment.
4. You respond in natural language. Rolls and state changes are computed by the engine, not improvised.
5. At a checkpoint, the GM updates the private GitHub save, preserving the previous history through Git commits.

The repository connection lets ChatGPT **read and write files**, but GitHub does not execute the engine on its own. A chat needs an available execution tool for verified turns. Do **not** claim a turn, save sync or dice roll happened unless a tool confirms it. If code execution is unavailable, use the written rules transparently and keep a ledger until execution resumes.

## Files

- `engine.js`: deterministic JavaScript game rules and state transitions.
- `bridge.js`: Node.js CLI for command-based state updates.
- `saves/aerin_marsh.json`: initial random campaign checkpoint (seed 1355150487, no beast partner).
- `reference/`: unified master prompt and compiled house-rule additions; the Jory Larkin examples **do not** become Aerin's campaign history.
- `docs/PROJECT_CHAT_INSTRUCTIONS.md`: run, resume, narrate and checkpoint in chats.
- `tests/smoke.test.js` and GitHub Actions: engine checks only.
- `index.html`: optional **local diagnostic interface**, not a hosted website.

## Chat-first unification v0.7

This is a **private, natural-language text RPG**, not an online game or software product. The first authority is `reference/Beastbound_Realms_Unified_Master_Prompt.md`, then the Table Rules and established facts in each separate campaign. The original supplied Python files are behavioural references only; **the repo contains independently implemented JavaScript**, not the Python originals.

**One consistent health model during chat play:** `rules/unified.js` gives new combat a **Light / Serious / Critical / Mortal wound track**, stamina, bracing, Wards and recovery. The original v0.3 HP numbers are retained for historical save compatibility, **not** a second pool that can also take damage or heal. Clean old saves can be migrated without changing gameplay; an already-injured legacy save requires an explicit recorded severity ruling, not guesswork. `rules/encounter.js` uses pre-declared independent beast intent, supports fighting, holding ground, withdrawing or de-escalating and only accepts established beast-stat provenance. The old HP attack/heal/invite routes are blocked through the protected chat runner.

**For meaningful, efficient chat play:** `scripts/chat-turn.js` is the only authoritative turn entry point; the Node CLI `bridge.js` now uses it. Supported checks calculate attribute modifier + skill rank ×2; progression uses source-backed PP ranks and explicit trials, with a newly proposed **4 PP/sixday anti-spam house ruling** (not in the uploaded source). Every meaningful change advances the world's off-screen sixday/month agenda ledger, with only plausible witnessed facts shown. Duplicate IDs never reroll, and changed requests using an old ID are rejected. Panels auto-fit 34 characters.

- [Unified text-RPG turn operations and migration](docs/UNIFIED_CHAT_RUNNER.md)
- [Full canon-to-mechanics audit and recommendations](docs/MECHANICS_AUDIT.md)
- [Python/JS behavioural reference comparison and limits](docs/JS_TRANSLATION.md)

**Boundaries:** This unifies new combat via the **Project chat runner**, not every older browser/debug command. Old HP injuries are not blindly converted; detailed legal, ecological, high-stage discipline, lasting injury and evolutionary-crisis subsystems still need work. Jory Larkin's historical facts and NPCs are **not** imported into Aerin's save.

## Engine command reference

```bash
node tests/smoke.test.js
node bridge.js hud --save saves/aerin_marsh.json
node tests/chat-runtime.test.js
node bridge.js recap --save saves/aerin_marsh.json
node bridge.js act --save /tmp/disposable.json --id travel_00001 --action "travel fen"
```

**Never publish** this repository, reference documents or campaign saves. The website-deployment workflow has been removed, and the repository remains **private**. No hosting, subscription or GitHub Pages is required.

## Compatibility

The historical save is **v0.3** and the protected JS Project-chat runner is **v0.7**. This is not a complete line-by-line Python port. The compiled additions describe further systems, some still requiring Game Master adjudication. Do not invent a Python save converter or claim perfect rules parity.
## Living Realms v0.8 — persistent world simulation

The private Project-chat runner now supports six continents, 24 politically active states, 48 world institutions, 29 mapped ecological regions, 19 trade routes, and a coherent **demand-generated** species taxonomy with 239,616 base-species slots / 718,848 possible regional forms. World time advances independent polities, institutional budgets, trade markets, migration and habitats through the same idempotent save executor. The NPCs and beasts around Aerin are **not** all generated at once, and background causes are never rolled merely to tie everything back to the player. See [`docs/LIVING_WORLD_BIBLE.md`](docs/LIVING_WORLD_BIBLE.md), [`docs/LIVING_WORLD_ENGINE.md`](docs/LIVING_WORLD_ENGINE.md), and [`docs/POWER_SYSTEM_PRESENTATION.md`](docs/POWER_SYSTEM_PRESENTATION.md). Animation is an optional **in-chat visual treatment** for verified events, not a public app or webpage. None of these additions modifies the existing Aerin checkpoint.
## High fantasy and revised evolution: canon audit v0.9

The [original-prompt crosswalk](docs/FANTASY_CANON_AUDIT.md) compares Master Prompt §§1–57 against actual implementation and remaining gaps. `world/mythic.js` adds culturally and ecologically grounded spirit realms, divine traditions, dragon refuges, magical ruins and sacred locations with persistent hidden site conditions; not an unrelated generic quest list. Later user-approved additions **revise evolution** into Origin Pattern magic grown from biology, with Maturity acceleration, myth research, soul-glow signs, Crucible experience and an actual consent-based Evolution Event. The official animated awakening is a **verified presentation**, not a random bonus or an automatic JS animation.

Large bestiary figures remain **generative capacity**, not claims of hand-authored creatures. The setting is still **partial**, not the complete 57-section master simulation; see crosswalk before asserting a power or species exists in play. Keep this RPG entirely in private ChatGPT Project chats.