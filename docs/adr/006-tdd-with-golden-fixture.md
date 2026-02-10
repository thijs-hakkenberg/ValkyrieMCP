# ADR-006: TDD with Golden Fixture Testing

## Status

Accepted

## Context

The MCP server must correctly parse, model, and re-serialize Valkyrie scenarios. We needed a testing strategy that gives confidence in format fidelity and catches regressions.

Options considered:
1. **Unit tests only**: Test each function in isolation with synthetic data.
2. **Golden fixture**: Use a real, complete scenario as a reference and verify round-trip fidelity.
3. **Snapshot testing**: Auto-capture output and diff against stored snapshots.

## Decision

Use TDD (test-driven development) with both unit tests and golden fixture tests. The ExoticMaterial scenario (a complete, community-authored MoM scenario with 60+ events, 8 tiles, 20+ tokens, and 10 languages) serves as the golden reference.

## Rationale

- **Real-world coverage**: Synthetic test data can miss edge cases. ExoticMaterial exercises complex event chains, space-separated reference lists, quoted localization values, operations with `=` in values, and all component types.
- **Round-trip verification**: The golden test loads ExoticMaterial, saves it to a temp directory, reloads it, and verifies semantic equality (same components, same data, same localization). This catches serialization bugs that unit tests might miss.
- **Validation baseline**: ExoticMaterial validates with 0 errors, providing a regression test for the validation rules.
- **TDD structure**: Tests were written first as specifications, then minimal implementations to pass. This produced focused, well-tested modules.

## Test Breakdown

| Category | Test Files | Tests |
|----------|-----------|-------|
| IO layer | 4 | 46 |
| Model | 2 | 44 |
| Validation | 7 | 59 |
| Tools | 6 | 55 |
| Server | 1 | 2 |
| Golden + Integration | 2 | 15 |
| **Total** | **22** | **217** |

## Consequences

- The ExoticMaterial fixture adds ~2,600 lines of test data to the repository, but provides irreplaceable real-world coverage.
- Golden tests are sensitive to changes in serialization format (e.g., field ordering, whitespace). The comparison is semantic (data equality), not byte-for-byte, to allow for acceptable format differences like comment headers.
- Adding new component types or fields should be accompanied by fixture data that exercises them.
