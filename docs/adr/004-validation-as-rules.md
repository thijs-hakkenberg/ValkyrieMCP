# ADR-004: Validation as Composable Rules

## Status

Accepted

## Context

Scenarios need to be validated for correctness before building. Validation covers many concerns: field presence, cross-references, event graph structure, localization completeness, and format constraints. We needed a validation architecture that is extensible and testable.

Options considered:
1. **Monolithic validator**: One function that checks everything.
2. **Rule-based**: Independent rule functions, each returning `ValidationResult[]`, composed by an orchestrator.
3. **Schema-based**: Define a JSON schema for each component type and validate against it.

## Decision

Rule-based validation. Each rule is an independent function `(model: ScenarioModel) => ValidationResult[]`. The orchestrator (`validateScenario`) runs all rules and aggregates results.

## Rationale

- **Testability**: Each rule has its own test file with focused test cases. Rules can be tested in isolation without building a full scenario.
- **Extensibility**: Adding a new rule is one new file + one import in the orchestrator. No modification to existing rules.
- **Granularity**: Results carry `severity` (error/warning), `rule` name, `component`, and `field`. The caller can filter by severity or rule.
- **Independence**: Rules don't depend on each other. They all read from the same `ScenarioModel` and can run in any order.

## Current Rules

| Rule | Checks | Severity |
|------|--------|----------|
| unique-names | Duplicate component names | error |
| required-fields | Tile `side`, event `buttons` when displayed | error |
| cross-references | Broken refs in event/add/remove/monster fields | error |
| event-graph | Missing `EventStart` trigger, unreachable/dead-end events | error/warning |
| localization-completeness | Missing quest.name, component text/button keys | warning |
| format-rules | Format version range, type=MoM, tile rotation values | error/warning |

## Consequences

- Each rule scans the full component list independently. For very large scenarios this means redundant iteration, but scenario sizes (< 200 components) make this negligible.
- The rule interface is simple but limited to read-only analysis. Rules cannot fix issues; that's the caller's responsibility.
- Built-in game content (Monster*, Audio*, TileSide*) is exempted in cross-reference checks via a prefix allowlist.
