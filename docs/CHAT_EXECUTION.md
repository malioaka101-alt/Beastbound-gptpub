# Beastbound private ChatGPT Project execution — technical specification

**No website. No public hosting. No subscription.** The repository is a *private* game-state and engine store. The text RPG takes place in ChatGPT Project chats. The repo contains the rules, the real JavaScript kernel, saves, and an optional private Actions turn runner.

## How it works

- Read: GitHub connector loads `saves/aerin_marsh.json`, `reference/Beastbound_Table_Rules.md`, and any required rules. The Table Rules are a supplementary digest; the original source files win if they conflict.
- Live code available: run `node scripts/chat-turn.js saves/aerin_marsh.json request.json` in the chat's code-execution environment, then push the updated JSON with an existing blob SHA guard through the GitHub connector.
- Live code **not** available: create a *private* GitHub request file `requests/aerin_marsh/<unique_id>.json`. The `Private Beastbound Chat Turns` workflow uses the same engine and updates `results/aerin_marsh/<unique_id>.json` and `saves/aerin_marsh.json`. Fetch the result before narrating the mechanical outcome. GitHub Actions on private repositories is subject to GitHub's free-tier usage allowances; it is not instant.
- No tool call needed for inconsequential dialogue. Use `checkpoint` before changing chats or after ~12–15 turns to preserve the pickup point and factual notes.
- Read the current saved file just before scheduling a turn. Request `expectedHash` is optional but recommended; it is the SHA-256 digest of the *raw* save bytes, not the GitHub blob SHA.

## Example request (non-destructive)

Save as `requests/aerin_marsh/resume_0001.json` on **main**:

```json
{"id":"resume_0001","campaign":"aerin_marsh","mode":"status"}
```

The workflow generates the corresponding JSON result without changing Aerin's character state. Until the result file appears, do not state that a turn happened.

## Action examples: safe and source-grounded

The example requests below are **templates**, not permission to alter any live campaign without the player's actual in-world choice.

Read-only observation of the actual local scene (location, established nearby people, linked routes, and current encounter) does not tick world time, roll dice or alter the save:

```json
{"id":"scene_0001","campaign":"aerin_marsh","mode":"act","action":"look"}
```

Inspect the supported progression routes without changing a character:

```json
{"id":"power_0001","campaign":"aerin_marsh","mode":"rule","system":"discipline","operation":"status","params":{}}
```

An actual conversation with a named present NPC can be attempted as a natural action, with the person's **genuinely established** public reply. Asking about a subject cannot invent further knowledge or consent:

```json
{"id":"talk_0001","campaign":"aerin_marsh","mode":"act","action":"talk to Elira Moss about the reed bank"}
```

A checkpoint records a **true, already established** scene. The sample below is illustrative; never write this scene or dialogue to a campaign unless it really occurred:

```json
{"id":"save_0001","campaign":"aerin_marsh","mode":"checkpoint","scene":"At the eastern reed bank, by the broken mooring post","focus":["Investigate broken reed bank"],"summary":"Spoke to Elira; no contract signed yet."}
```

**No caller-supplied skill, attribute, DC, result or time on a free check.** A playable `mode:"check"` request contains only the `checkId` of an actual **previously witnessed and precommitted scene challenge** in `table.sceneChecks`. The protected engine determines its true difficulty and skill before rolling. The older `quest accept <id>` and `quest submit <id>` prototype shortcuts remain retired; they cannot create money, authority or career progress. Other ordinary actions (travel, wildlife observation, rest, healing, craft, research, bonds, evolution) must follow their already tested distinct operations, prerequisites and world consequences. No GitHub process automatically interprets unrestricted prose or creates missing events; the narrator can describe plausible actions but must not invent numerical outcomes.

See `docs/UNIFIED_CHAT_RUNNER.md` for v0.7 supported wound combat, safe sleep, healing, canonical check bonuses, off-screen agendas, and stable turn IDs. The Node CLI now requires `--id` for each `act` command. Legacy HP combat is unavailable through the private chat turn runner.

## Safety and correctness

- Requests are JSON data only; no supplied text is executed as shell code.
- The runner validates campaign names, IDs, modes and check values. It tracks stable turn IDs and revisions to avoid repeat rolls. The `expectedHash` guard prevents replaying stale actions.
- Each processed request generates a private result; state is serialized and saved together. GitHub commits provide historical checkpoints. A failed run is **not** a saved turn.
- `panels.js` generates the 34-column, code-block-compatible core and expanded panels; it uses player-visible state, not sealed research truth.
- Show **only actually recorded** Soul Reserve, Qi, Mana, health, inventory and time; do not fabricate numerical pools or infer private actor attributes. Use the established civil calendar only when a real dated anchor exists; otherwise display the current Day N and recorded clock.
- Saved data and engine scripts stay in the private repository. Private GitHub repo content is still visible to its collaborators: for strictly GM-only secrets, separate authorised storage is required.
- The existing engine is a partial **JavaScript prototype**. The original `bb_*.py` source modules were supplied in chat as **behavioural references**, not to be copied. The `turn.py` CLI and `bb_bench.py` benchmark module were not supplied. Several mechanics are now independently implemented in `rules/` and compared against reference vectors; clean old HP saves now support a tested, reversible-in-history wound migration in **Project chat**; injured old saves require explicit adjudication, never a guessed conversion. Legacy browser/HP actions are not yet unified.
- GitHub Actions jobs can fail, be delayed or exhaust included minutes. The local Node runner remains the fallback; do not imply automatic seamless execution.

## Playing style

Follow `reference/Beastbound_Table_Rules.md`: short immersive narration, inline **verified** rolls, the current in-chat fantasy HUD when supported (34-character plain-text panels are fallback), immediately relevant information only, and a concise factual delta line. No menus or player-character mindreading. NPCs know only what they can plausibly learn. In-world institutions, ecology, economy, laws and time continue independently of the protagonist.