---
id: 001
date: 2026-01-15
category: context-management
tags: [subagent, handoff, token-budget, context]
severity: high
projects-affected: [all]
---

# Problem: Subagent Lost Context During Epic Implementation

## Symptoms

- Subagent spawned to implement a user story re-reads epic files
- Asks clarifying questions already answered in epic context
- Burns 20k-50k tokens re-discovering requirements
- Implementation doesn't match epic specifications

## Context

Supervisor spawns subagent (usually SCAR) to implement a user story without providing the epic context in the spawn prompt.

## Root Cause

When using Task tool to spawn subagents, the subagent starts with a fresh context. It doesn't automatically have access to:
- Epic requirements from epic-XXX.md
- Architectural decisions from epic-context.yaml
- User story acceptance criteria
- Related epic discussions

## Solution

**Pattern:** Include Epic Context in Subagent Spawn

Always read and include epic-context.yaml (or relevant epic file sections) in the Task tool prompt:

```markdown
Task tool with prompt:
"Implementing User Story: [story-name]

**Epic Context:**
[paste relevant sections from epic-context.yaml or epic-XXX.md]

**User Story:**
Title: [story title]
Acceptance Criteria:
- Criterion 1
- Criterion 2

**Technical Context:**
- Architecture: [relevant arch notes]
- Dependencies: [dependencies]
- Integration points: [integration details]

**Task:**
Implement this user story according to the epic context and acceptance criteria above.

Working directory: [directory]
"
```

**Key steps:**
1. Read epic-context.yaml before spawning subagent
2. Extract relevant sections (don't paste entire epic for token efficiency)
3. Include in Task tool prompt
4. Provide specific task instructions

## Prevention

1. **Update subagent spawn templates** - Add "Epic Context" section to all task spawns
2. **Add to CLAUDE.md** - "Before spawning subagent for user story, read epic-context.yaml"
3. **Create helper pattern** - Standardize context inclusion

Example CLAUDE.md addition:
```markdown
### Before Spawning SCAR for User Story:

1. Read epic-context.yaml
2. Extract: architecture, constraints, integration points
3. Include in Task prompt under "Epic Context" heading
4. Add user story acceptance criteria
```

## Code/Config Examples

### Before (problematic)
```
Task tool prompt:
"Implement user story US-001: Add authentication
Working directory: /path/to/project/"
```

Result: Subagent has no context about:
- Which auth method (JWT, session, OAuth)?
- Integration with existing user system?
- Error handling patterns?
- API structure?

### After (fixed)
```
Task tool prompt:
"Implementing User Story US-001: Add authentication

**Epic Context (from epic-003.md):**
- Architecture: REST API using Express + JWT
- Auth strategy: JWT with refresh tokens
- User system: Existing users table in PostgreSQL
- Error handling: Standard error middleware pattern
- Integration: All /api/* routes need auth middleware

**User Story US-001:**
Title: Add JWT authentication system
Acceptance Criteria:
- POST /api/auth/login returns JWT token
- Middleware validates token on protected routes
- Refresh token rotation implemented
- Error responses follow standard format

**Task:**
Implement according to epic architecture and acceptance criteria.
Working directory: /path/to/project/"
```

Result: Subagent has all context needed, no re-reading, correct implementation.

## Related Learnings

- #003 (epic-context-optimization) - How to extract minimal context
- #015 (token-budget-management) - General token optimization

## Impact

- **Time saved:** 30-60 minutes per user story
- **Tokens saved:** 20k-50k tokens per spawn
- **Quality:** Higher alignment with epic requirements
- **Projects benefiting:** All projects using BMAD workflow

## Notes

- Don't paste entire epic (wastes tokens) - extract relevant sections
- For simple stories, brief context is sufficient
- For complex stories with many integration points, more detail needed
- Balance context completeness with token efficiency

---

**Documented by:** Root Supervisor
**Verified by:** Multiple project implementations
