# Finish Line A — practical natural-language use of existing creative work

**Standing principle:** A player describes an action naturally; the world decides what can actually happen. The named examples and technical request vocabulary are *not* the boundaries of allowable intentions. Never create a separate recipe engine or a catalogue of pre-scripted capabilities when an existing physical simulation already supports the task.

## Practical gameplay

The private file-backed runner now routes the following human-friendly intentions into the **same protected, pre-existing mechanics**, without any shortcut to a favourable check:

- **“inspect designs”**, **“review my designs”** or **“my inventions”**: read-only, player-recorded design dossiers from `creation.status`, including unproved ideas and genuine prototype state
- **“inspect prototypes”**, **“my instruments”**: read-only actual owned tool states from `creation.prototypeStatus`, with no invented item list or extra time
- **“build design_1”**, **“assemble design_1”**, **“make [exact saved design title]”** or **“craft [exact saved design title]”**: the original `creation.prototype` procedure for a genuinely sealed design, with authentic physical mechanism, materials, workshop, original Crafting die, real time and failure consequences
- **“calibrate design_1”**, **“test design_1”**: independently perform actual local calibration through `creation.calibrate` on a genuine owned prototype
- **“measure design_1”** or **“measure [exact saved design title]”**: use the bounded real instrument under `creation.measure`; only a physically observable approximate local water category is known, never hidden ecological numbers or supernatural insight
- **“repair design_1”** or **“repair water_indicator_design_1”**: use original `creation.repair`, with the verified owned instrument, actual worn condition, real replacement materials, risk, physical work and recorded durability; successful repair requires recalibration before further measurements
- **“apply healing balm”**, **“use healing balm”**: the existing `health.balm` action, which treats only a real Light wound with a genuinely owned healing item; never restores old HP or cures serious illness.

The existing ordinary `craft field poultice` remains its own verified known recipe at an actual clean medical facility. The new phrasing selects *only a genuine saved plan or tool*. A player can write different invention titles and purposes through the already supported `creation.draft`, but **the original limited physical prototype adapter is still the only one operational**: it covers the source-grounded reed surface-water indicator, **not** every design, material or power a player can imagine. A proposed ward, soul-sensor or magical machine remains an unproved concept without an appropriate mechanism, independent research and implementation. This change does not silently convert invention paperwork into a device.

## Source and safety

Selection accepts a saved **exact design ID**, a genuine **owned prototype ID**, or an exact **recorded design title**. If two authentic designs share a title, the player is asked to name the precise design ID; the engine never chooses the more favourable existing check or prior success. Validation remains with the existing source-sealed creation dossier, owned prototype provenance, item conservation and original on-device work rules. A natural action cannot set the tool’s Grade, DC, costs, materials, roll, output, target location or success.

Every action uses its original safe checkpoint and independent world elapsed time; an identical private turn ID returns the original result without another die or material transfer. Inspections are genuinely read-only and do not advance the world.

`tests/natural-creative-work.test.js` covers an entirely disposable genuinely recorded invention, human-friendly read-only inspection, real construction success **and failure**, original local calibration, bounded physical measurement, genuine source-witnessed reed replacement, ordinary worn-tool repair, duplicate replay, refusal of invented/ambiguous designs, unsupported mechanisms and Light-wound healing balm use. The full regression inventory remains mandatory. The active Aerin campaign save is never edited.

**Next reusable opportunities:** Let newly established materials and genuine physical knowledge inform additional bounded mechanisms through these same work, design and inventory systems. Expand functional scope only when there is a credible, testable physical behaviour; do not invent a separate crafting command for each proposed tool or impose universal tuition gates.
