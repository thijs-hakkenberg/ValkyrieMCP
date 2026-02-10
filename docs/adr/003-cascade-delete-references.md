# ADR-003: Cascade Delete for Component References

## Status

Accepted

## Context

Scenario components reference each other via space-separated name lists in fields like `event1`..`event6`, `add`, `remove`, and `monster`. For example:

```ini
[EventStart]
event1=EventExplore
add=TileTownSquare TokenSearch1
```

When a component is deleted, dangling references would cause validation errors or runtime failures in Valkyrie.

Options considered:
1. **No cascade**: Delete the component, leave dangling references. Let validation catch them.
2. **Cascade delete**: Delete the component AND remove its name from all reference fields in other components.
3. **Block delete**: Refuse to delete if referenced by other components.

## Decision

Cascade delete: when `model.delete(name)` is called, it removes the component and scans all other components' reference fields, removing the deleted name from space-separated lists.

## Rationale

- **Consistency**: The model stays internally consistent after every operation. No intermediate "broken" state.
- **AI-friendly**: An AI agent making rapid changes doesn't need to manually patch every referencing component. The cascade handles it.
- **Reversible via upsert**: If the deletion was unintended, the component can be re-created with `upsert` and references re-added. The cascade only removes the specific name, not the entire field value.
- **Matches Valkyrie editor behavior**: The Valkyrie editor cleans up references when components are removed.

## Consequences

- `delete()` returns the list of components that had references cleaned, giving the caller visibility into what changed.
- Reference fields are identified by a hardcoded list (`event1`..`event6`, `add`, `remove`, `monster`). New reference field types would require updating this list.
- Space-separated parsing means component names cannot contain spaces (which is already true in Valkyrie's format).
