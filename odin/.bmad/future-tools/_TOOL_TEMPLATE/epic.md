# Epic: [Tool Name]

**Epic ID:** tool-XXX-[name]
**Created:** [Date]
**Status:** Planned (Not in Active Build)
**Complexity Level:** [1-5]

---

**⚠️ IMPORTANT:** This is a **future planning artifact**. It will NOT be built until:
1. You move this file to `.bmad/epics/` and renumber it
2. You create a GitHub issue in gpt153/odin
3. You tell the supervisor to build it

---

## Project Context

- **Project:** Odin
- **Repository:** https://github.com/gpt153/odin
- **Tech Stack:** [Python/Node.js/TypeScript/etc.]
- **Related Epics:**
  - Depends on: [Epic XXX]
  - Blocks: [Epic YYY]
- **Integration Points:** [Which existing systems does this integrate with?]

## Business Context

### Problem Statement

[What problem does this tool solve? Why is it needed?]

### User Value

[What value does the user get from this tool?]

**Real-World Scenario:**
```
[Example of how user would use this tool in daily life]
```

### Success Metrics

- [Measurable outcome 1]
- [Measurable outcome 2]
- [Measurable outcome 3]

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

**SHOULD HAVE:**
- [ ] Requirement 4
- [ ] Requirement 5

**COULD HAVE:**
- [ ] Nice-to-have feature 1
- [ ] Nice-to-have feature 2

**WON'T HAVE (this iteration):**
- Feature to defer
- Feature to defer

### Non-Functional Requirements

**Performance:**
- [Latency, throughput, etc.]

**Security:**
- [Auth, privacy, encryption]

**Reliability:**
- [Uptime, error handling]

## Architecture

### Technical Approach

[High-level description of how this will be built]

### Integration Points

[How does this integrate with existing Odin components?]

### Data Flow

```
[ASCII diagram or description of data flow]
```

### Files to Create/Modify

```
odin/
├── src/
│   └── odin/
│       └── tools/
│           └── [tool-name]/
│               ├── __init__.py
│               ├── service.py
│               └── models.py
└── tests/
    └── test_tools/
        └── test_[tool-name].py
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue 1: [Task Name]**
- Subtask A
- Subtask B
- **Acceptance:** [What success looks like]

**Issue 2: [Task Name]**
- Subtask A
- Subtask B
- **Acceptance:** [What success looks like]

### Estimated Effort

- **Phase 1:** X hours
- **Phase 2:** Y hours
- **Total:** Z hours (~N weeks)

## Acceptance Criteria

### Feature-Level Acceptance:

- [ ] Can do X
- [ ] Can do Y
- [ ] Performance meets requirements
- [ ] All tests pass

### Code Quality:

- [ ] Type-safe (mypy/TypeScript)
- [ ] No security vulnerabilities
- [ ] Comprehensive error handling
- [ ] Unit tests for all core modules

### Documentation:

- [ ] User guide created
- [ ] API documentation
- [ ] Architecture diagram

## Dependencies

### Blocked By:
- [Epic/Issue that must complete first]

### Blocks:
- [Epic/Issue waiting on this]

### External Dependencies:
- [APIs, libraries, services needed]

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How to mitigate] |
| [Risk 2] | High/Med/Low | High/Med/Low | [How to mitigate] |

## Testing Strategy

### Unit Tests
- [What to test]

### Integration Tests
- [What to test]

### E2E Tests
- [Scenario 1]
- [Scenario 2]

## Notes

### Design Decisions

**Why [Decision]?**
- [Rationale]

### Known Limitations

- [Limitation 1]
- [Limitation 2]

### Future Enhancements

- [Enhancement 1]
- [Enhancement 2]

---

**Epic Status:** Planned (Not Active)
**Next Action:** Review and refine planning, promote to active build when ready
