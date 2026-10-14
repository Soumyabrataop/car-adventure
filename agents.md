# Agent Instructions

## Plan

Before changing code:

1. Inspect the relevant files, existing scripts, and nearby usage patterns.
2. Identify the smallest code path that controls the requested behavior.
3. State the expected behavior, the likely root cause or implementation point, and one focused way to validate it.
4. Keep the plan scoped to the request. Do not refactor unrelated code.

For larger changes, split the work into small, testable steps and call out assumptions or unresolved decisions.

## Implementation

- Prefer existing project patterns, dependencies, and abstractions.
- Make the smallest change that fully addresses the request.
- Preserve public APIs and unrelated user changes.
- Use clear names and keep comments limited to non-obvious logic.
- Add or update focused tests when behavior changes.
- Update the README or other documentation when setup or usage changes.

## Validation

After each substantive edit:

1. Run the narrowest relevant test, typecheck, lint, or build command.
2. Fix failures in the touched area before widening the scope.
3. Before finishing, run the project’s available validation commands and report anything that could not be run.

If no automated checks exist, perform a focused manual check and document it.

## Handoff

The final response should briefly summarize:

- What changed and where.
- Validation performed and its result.
- Any remaining limitations, assumptions, or follow-up work.
