# Guardian allowance follow-through — ordinary Beastbound family life

Original Master Prompt §45 and Table Rules govern GM naturalism. A child helping a parent or guardian is **not automatically an employee completing a commercial contract**, and family pocket money should not be held indefinitely because a first practical check failed. The engine owns real money, the original check and world history. The GM narrates the parent as a person with intentions, memory and financial constraints, not a quest-board adjudicator.

## Existing agreement, correction and one payment

When an original voluntary household-work offer was **accepted** by the actual source-authenticated guardian, they offered a small, traceable amount (usually 1–2 Talons from their own purse). If the original Crafting check failed, that inspection remains a real failure; it established that the first sorting needed correction, not that the parent could never give their child the offered money.

The source owner `social.settleGuardianAllowance` permits a **single** follow-through for an existing accepted-but-unpaid guardian offer only when all evidence agrees:

1. The same real guardian is personally witnessed at the recorded family home on the same in-world day.
2. The original signed household receipt was accepted, its original Crafting check failed, and the promised 1–2 Talons remain unpaid. No second job can be accepted from the same parent merely to reroll a failed check.
3. The saved GM-authored scene **actually describes a physical recheck** of the original task and names the guardian. The GM cites a verbatim phrase from that saved scene (at least 24 characters), which the engine compares to the task and recheck description. A fabricated claim of correction or unrelated wording is rejected.
4. The character has also genuinely spent time on this follow-through: currently, the narrow source-backed bridge requires at least 90 minutes of separate verified **part-time independent practice** overlapping the later household recheck, at the same home and after the original shift. The engine verifies its original event hash. Merely practising Soul somewhere else does not prove that a harness was corrected.
5. The guardian has enough of their **actual remaining funds** to cover the original offered amount. The same amount is transferred from guardian to child; it is never minted, awarded by a guild, or determined by a new performance roll.
6. A signed one-time allowance receipt links the original failed work check, the additional actual time, the saved GM scene quotation, the guardian and child money balances and the settled amount. A repeat request—even under another turn ID—fails.

This is a deliberately **narrow correction** for source-backed dual-activity household follow-through. It does not turn all Soul sessions into paid work or all ordinary family help into wages. Other family allowance gifts, corrections without part-time practice and more varied household circumstances require their own suitable authentic evidence and rule owner; do not fake practice or spend time simply to force this operation.

## GM presentation

The GM should describe the guardian naturally: they check the changed straps, recognise effort, and offer the small allowance they themselves proposed. No corporate boss, employment contract, "shift accepted" rhetoric or invented skill achievement is needed. The original failure and the later corrected effort both remain part of the character's lived experience.

Once the **matching engine result** is confirmed and GitHub has committed the save, the GM may narrate the coins changing hands and show the exact verified delta. Until then, do not claim coins have changed. There is no additional Crafting roll, no extra Soul practice, no new task, no second stamina cost and no implied additional time in this immediate review action.

### Exact original request

```json
{
  "id": "unique_guardian_allowance_id",
  "campaign": "selected_existing_campaign",
  "mode": "rule",
  "system": "social",
  "operation": "settleGuardianAllowance",
  "params": {
    "npcId": "origin-kin:kin_1",
    "sourceQuote": "slowly re-examined the previously sorted harnesses"
  }
}
```

The example requires its quoted words to already appear **verbatim** in the saved GM scene; it cannot invent the parent, work receipt, practice event, funds or review. The original paid-work check is **not rewritten**, and an unpaid first attempt does not earn retroactive Crafting success or extra experience.

The new rule is one specific resolution of the family realism principle, not a universal job or gift engine. Future source-specific family interactions should avoid interpreting every parental reward as a business transaction.
