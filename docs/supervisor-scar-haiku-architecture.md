# Supervisor-Heavy Planning + SCAR Haiku Execution Architecture

**Status:** Proposed - Not Yet Implemented
**Date:** 2026-01-18
**Context:** Running out of Sonnet tokens, need cost-effective implementation strategy

---

## Problem Statement

**Current Token Usage:**
- Sonnet tokens exhausted in max subscription
- Haiku tokens remain available
- SCAR currently uses Sonnet for planning + implementation
- Need to shift heavy thinking from SCAR to Supervisor

---

## Proposed Architecture

### Current (Sonnet-Heavy)

1. Supervisor creates basic issue with epic description
2. SCAR reads issue → does own analysis → plans approach → implements
3. SCAR burns Sonnet tokens on thinking + implementation

### Proposed (Supervisor-Heavy, Haiku-Execution)

1. **Supervisor does ALL heavy thinking upfront:**
   - Analyzes target codebase thoroughly
   - Designs exact implementation approach
   - Creates detailed step-by-step instructions
   - Specifies files, functions, test cases

2. **Creates prescriptive GitHub issue:**
   - File-by-file breakdown
   - Specific function signatures
   - Integration points with existing code
   - Exact test cases
   - Edge cases and error handling
   - Code snippets showing approach

3. **SCAR executes with Haiku:**
   - Reads detailed plan
   - Follows prescriptive instructions
   - Minimal autonomous thinking
   - Maximum precise execution

---

## Benefits

✅ **Token Economics:** Sonnet only for planning (once), Haiku for implementation (ongoing)
✅ **Cost Savings:** Haiku is ~60-70% cheaper than Sonnet
✅ **Predictability:** SCAR follows detailed plan (less variance)
✅ **Quality:** Supervisor designs approach with full context
✅ **Faster Execution:** SCAR spends less time thinking, more doing

---

## Tradeoffs

⚠️ **Longer Planning:** Supervisor needs to research codebase thoroughly before creating issues
⚠️ **Less SCAR Autonomy:** SCAR becomes more prescriptive executor
⚠️ **Upfront Work:** Need detailed understanding before starting implementation

---

## Implementation Requirements

### 1. Enhanced Epic Creation Workflow

**Modify:** `/home/samuel/supervisor/.claude/commands/create-epic.md`

**Add phases:**
- Codebase analysis (read existing implementation)
- Identify exact files to modify
- Design specific implementation approach
- Create implementation blueprint

### 2. New GitHub Issue Template

**Instead of:**
```
Implement authentication system

See epic-001.md for details.
```

**Create:**
```
Implement authentication system

## Implementation Blueprint

### Files to Modify
1. `src/auth/auth.ts` - Create new AuthService class
2. `src/middleware/auth-middleware.ts` - Add JWT validation
3. `src/types/auth.types.ts` - Add User and Token interfaces

### Detailed Implementation

#### src/auth/auth.ts
Create AuthService class with these methods:
- `async login(email: string, password: string): Promise<AuthToken>`
- `async validateToken(token: string): Promise<User>`
- `async refreshToken(refreshToken: string): Promise<AuthToken>`

Integration points:
- Import bcrypt for password hashing
- Import jsonwebtoken for JWT creation
- Connect to UserRepository (already exists at src/db/user-repo.ts)

Error handling:
- Throw InvalidCredentialsError on bad password
- Throw TokenExpiredError on expired token
- Throw UserNotFoundError if email doesn't exist

#### src/middleware/auth-middleware.ts
Create middleware function:
```typescript
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Extract token from Authorization header
  // Call AuthService.validateToken()
  // Attach user to req.user
  // Call next() or return 401
}
```

### Tests Required
- Unit tests for AuthService (src/auth/auth.test.ts)
- Integration tests for auth endpoints (src/api/auth.integration.test.ts)
- Middleware tests (src/middleware/auth-middleware.test.ts)

### Edge Cases
- Handle missing Authorization header
- Handle malformed tokens
- Handle database connection errors during login
```

### 3. SCAR Configuration

**Modify SCAR to:**
- Use Haiku model by default
- Follow prescriptive plans closely
- Ask clarifying questions if plan unclear (instead of making assumptions)

### 4. Supervisor Workflow Changes

**create-epic.md must:**
1. Spawn `analyze.md` agent to research codebase
2. Read analyze results
3. Design detailed implementation approach
4. Generate prescriptive GitHub issue body
5. Create issue with detailed blueprint
6. Spawn supervise-issue.md

---

## Testing Plan

1. **Select one existing epic** (e.g., Authentication epic)
2. **Supervisor creates detailed issue** following new template
3. **SCAR implements with Haiku** following detailed plan
4. **Compare results:**
   - Implementation time
   - Token usage (Sonnet vs Haiku)
   - Code quality
   - Number of iterations needed
5. **Iterate on template** based on results

---

## Success Metrics

- ✅ SCAR completes implementation with Haiku (minimal Sonnet usage)
- ✅ Token cost reduced by >60%
- ✅ Implementation matches plan (high fidelity)
- ✅ Fewer back-and-forth iterations
- ✅ Code quality maintained or improved

---

## Next Steps

1. Update `create-epic.md` with enhanced codebase analysis
2. Create detailed issue template
3. Test with one epic
4. Measure results
5. Refine approach
6. Roll out to all epics

---

## Open Questions

- How detailed should the blueprint be? (Risk: over-specifying implementation)
- Should SCAR still do planning phase with Haiku? Or skip straight to implementation?
- What happens when SCAR encounters unexpected issues? (Escalate to Supervisor?)
- Should we version-control these detailed blueprints separately from epics?

---

## Related Documents

- `/home/samuel/supervisor/docs/bmad-workflow.md` - BMAD methodology
- `/home/samuel/supervisor/docs/scar-integration.md` - Current SCAR setup
- `/home/samuel/supervisor/.claude/commands/create-epic.md` - Epic creation workflow
- `/home/samuel/supervisor/docs/model-selection-strategy.md` - Model usage guidelines
