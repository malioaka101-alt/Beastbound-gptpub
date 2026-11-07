# Private Actions minute-budget policy — Beastbound

This is a **private** text RPG. Keep every test while reducing duplicate and parallel billed work.

## Changes
- `.github/workflows/engine-tests.yml` runs the same 97-test inventory on pull requests and manual dispatch only. It no longer reruns automatically when code is merged into `main`.
- One Ubuntu runner executes the complete suite with check name `test`, preserving the required status check. Stop on the first failed test to conserve minutes; passing CI must still run all 97.
- Superseded checks for the same PR/ref are cancelled automatically (spent minutes cannot be refunded).
- Whenever feasible, run meaningful Node tests locally before opening a PR. Group related engine changes on one development branch before the first pull request.
- Private gameplay remains in the separate on-demand turn workflow whenever a direct Node engine is unavailable; don't rerun all engine tests on game turns.
- **Always** wait for the required CI result before merging engine code. Preserve disposable-save testing and never alter active campaign saves during foundation development.

## Limits
The saved workflow doesn't show the user's billing dashboard. These changes aim to save billable private Actions minutes but do not certify an account's exact remaining allowance. Serial full-suite checks have greater wall-clock latency than four parallel jobs, but avoid multiple runners being rounded for billing separately. The user controls repository visibility; these changes **do not** make the repository public.
