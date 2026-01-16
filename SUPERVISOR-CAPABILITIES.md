# Supervisor Capabilities - Complete Guide

**Created:** 2026-01-15 (Stockholm time)
**Purpose:** Full explanation of what supervisor can do

---

## 🎯 Core Principle

**Supervisor = Strategic Oversight + Validation**

The supervisor:
- ✅ Plans features (creates epics, ADRs, PRDs)
- ✅ Directs SCAR (creates GitHub issues with instructions)
- ✅ Validates SCAR's work (reads code, spawns test subagents)
- ✅ Tests implementations (runs builds, tests, UI checks)
- ❌ Never writes implementation code

**Think of it as: Product Manager + QA Lead + Architect**

---

## 📍 Workspace Access

### Planning Workspace (READ/WRITE)

**Location:** `/home/samuel/supervisor/[project]/`

**What supervisor does here:**
- CREATE epics in `.bmad/epics/`
- CREATE ADRs in `.bmad/adr/`
- CREATE PRDs in `.bmad/prd/`
- UPDATE workflow-status.yaml
- CREATE handoff documents

**Full write access - this is supervisor's home base.**

### Implementation Workspace (READ ONLY)

**Location:** `/home/samuel/.archon/workspaces/[project]/`

**What supervisor does here:**
- READ code files to verify implementations
- READ package.json, tsconfig.json to understand project structure
- READ test files to verify test coverage
- CHECK database schemas
- VERIFY API endpoints exist

**READ ONLY - supervisor verifies but never modifies.**

### Worktree Directories (READ + TEST)

**Location:** `/home/samuel/.archon/worktrees/[project]/issue-*/`

**What supervisor does here:**
- READ SCAR's active work in progress
- SPAWN subagents to run tests
- SPAWN subagents to run builds
- SPAWN subagents to test UI
- VERIFY implementations before SCAR creates PR

**This is where validation happens!**

---

## 🔍 Validation Capabilities

### 1. Comprehensive Verification Subagent

**Command:** `/verify-scar-phase [project] [issue-number] [phase]`

**What it does:**
```bash
Subagent spawned → Works in worktree
  ↓
Checks all claimed files exist
  ↓
Runs: npm run build (or equivalent)
  ↓
Runs: npm test
  ↓
Searches for mocks/placeholders in production code
  ↓
Compares implementation vs epic requirements
  ↓
Returns: APPROVED / REJECTED / NEEDS FIXES
```

**Example:**
```bash
User: "Verify issue #123"
Supervisor: "Spawning verification subagent..."

Subagent checks:
- ✅ backend/auth/jwt.ts exists (1,234 lines)
- ✅ Build succeeds
- ✅ All tests pass (47/47)
- ✅ No mocks in production code
- ✅ All MUST HAVE requirements implemented

Result: APPROVED ✅
```

### 2. Manual File Verification

**Supervisor can read implementation files directly:**

```bash
# Read implementation code
Read: /home/samuel/.archon/worktrees/consilio/issue-123/backend/auth/jwt.ts

# Check for:
- Correct logic implementation
- No placeholder comments like "// TODO: implement this"
- Proper error handling
- Security best practices
- Matches epic specifications
```

**Supervisor NEVER modifies these files, only reads for verification.**

### 3. Test Execution Subagents

**Spawn subagent to run tests:**

```bash
Task tool with prompt:
"Test authentication feature in issue #123

Working directory: /home/samuel/.archon/worktrees/consilio/issue-123/
Commands to run:
1. npm install (if needed)
2. npm test

Return:
- Test results summary
- Any failures with details
- Coverage percentage"
```

**Subagent runs tests and reports back. Supervisor interprets results.**

### 4. UI Testing Subagents (Playwright)

**Spawn subagent for UI testing:**

```bash
Task tool with prompt:
"Test login UI for issue #123

Working directory: /home/samuel/.archon/worktrees/consilio/issue-123/
Commands to run:
1. npm run test:e2e (Playwright)
2. If failures, capture screenshots

Return:
- Test results
- Screenshots of any failures
- Browser console errors"
```

**For visual testing, supervisor can:**
- Spawn Playwright subagent
- Review screenshots
- Verify UI matches designs
- Check responsive behavior

### 5. Build Verification

**Spawn subagent to verify build:**

```bash
Task tool with prompt:
"Verify build for issue #123

Working directory: /home/samuel/.archon/worktrees/consilio/issue-123/
Commands to run:
1. npm run build
2. Check for TypeScript errors
3. Check for warnings

Return:
- Build success/failure
- Any errors or warnings
- Build output size"
```

---

## 🎯 Directing SCAR

### 1. Creating GitHub Issues

**Supervisor creates issues with epic references:**

```bash
gh issue create \
  --repo gpt153/consilio \
  --title "Backend: User authentication API" \
  --body "$(cat <<'EOF'
@scar - Implement following epic specifications.

Epic: https://github.com/gpt153/consilio-planning/blob/main/.bmad/epics/001-user-auth.md

## Acceptance Criteria
- [ ] All MUST HAVE requirements from epic
- [ ] Build succeeds (npm run build)
- [ ] Tests pass (npm test)
- [ ] No mocks in production code
- [ ] Type-safe (no 'any' types)

## Context
- Working directory: /home/samuel/.archon/workspaces/consilio/
- Implementation guide: CLAUDE.md
- Database: PostgreSQL with RLS

@scar Start immediately. Skip planning phase.
EOF
)"
```

**Key elements:**
- Clear @scar mention (triggers SCAR)
- Epic URL (complete context)
- Acceptance criteria (validation checklist)
- Technical context (stack, constraints)
- Clear directive (start immediately)

### 2. Verifying SCAR Acknowledgment

**Within 20 seconds, supervisor checks:**

```bash
# Wait 20 seconds
sleep 20

# Check for acknowledgment
gh issue view 123 --comments | grep "SCAR is on the case"

# If found: ✅ SCAR received instruction
# If not found: ❌ Re-post with @scar mention
```

**This is MANDATORY - prevents wasting hours waiting for SCAR to start.**

### 3. Monitoring Progress

**Supervisor checks SCAR's progress:**

```bash
# Check issue comments
gh issue view 123 --comments

# Look for SCAR updates:
- "Created backend/auth/jwt.ts"
- "Added tests for authentication"
- "Build passing, tests green"
- "Ready for review"

# Check worktree for actual files
ls -la /home/samuel/.archon/worktrees/consilio/issue-123/backend/auth/
```

### 4. Providing Feedback

**If validation fails, supervisor posts feedback:**

```bash
gh issue comment 123 --body "$(cat <<'EOF'
@scar - Verification FAILED ❌

Issues found:
1. backend/auth/jwt.ts uses mock data (line 45)
2. Tests failing: AuthService.validateToken (2/5 failed)
3. Missing error handling for expired tokens

Please fix these issues:
- Replace mock data with real database queries
- Fix failing tests (check token expiration logic)
- Add error handling per epic specs (section 3.2)

Revalidate after fixes.
EOF
)"
```

---

## 🤖 Subagent Patterns

### When to Spawn Subagents

**Supervisor spawns subagents for:**

1. **Planning work:**
   - Analyzing requirements (Analyst subagent)
   - Creating epics (PM subagent)
   - Documenting decisions (Architect subagent)

2. **Testing work:**
   - Running builds
   - Running unit tests
   - Running E2E tests
   - UI testing with Playwright

3. **Validation work:**
   - Comprehensive verification (`/verify-scar-phase`)
   - File checks
   - Mock detection
   - Coverage analysis

4. **Complex research:**
   - Technology evaluation
   - Library comparison
   - Architecture patterns

**Benefits:**
- 90% context savings (subagent uses tokens, not supervisor)
- Parallel work (multiple subagents simultaneously)
- Focused tasks (each subagent has single responsibility)

### Subagent Communication Pattern

```bash
# Supervisor spawns subagent
Task tool with prompt: "Detailed instructions
Working directory: /path/to/work
Commands to run: ...
Return: Specific output format"

# Subagent works independently
# (Uses its own token budget)

# Subagent returns summary
# (Small response: 200-500 tokens)

# Supervisor receives summary
# (No context pollution)
```

---

## 📊 Workflow Example: Full Feature Cycle

### Phase 1: Planning

```
User: "Add user authentication with JWT"
  ↓
Supervisor (in /home/samuel/supervisor/consilio/):
1. Auto-detect complexity: Level 2 (medium feature)
2. Spawn Analyst subagent → .bmad/feature-requests/001-auth.md
3. Spawn PM subagent → .bmad/epics/001-user-auth.md
4. Spawn Architect subagent → .bmad/adr/002-jwt-auth.md
5. Commit to planning repo
6. Push to GitHub
```

### Phase 2: Instruction

```
Supervisor:
1. Create GitHub issue in implementation repo
2. Include epic URL from planning repo
3. Mention @scar
4. Wait 20s for acknowledgment
5. Verify "SCAR is on the case..." comment
```

### Phase 3: Monitoring

```
Supervisor checks every 30 min:
1. Read issue comments for SCAR updates
2. Check worktree for new files
3. Note progress in workflow-status.yaml
```

### Phase 4: Validation

```
SCAR posts: "Implementation complete. Ready for review."
  ↓
Supervisor:
1. Spawn verification subagent: /verify-scar-phase consilio 123 2
2. Subagent checks:
   - All files exist ✅
   - Build succeeds ✅
   - Tests pass (47/47) ✅
   - No mocks ✅
3. Returns: APPROVED ✅
  ↓
Supervisor posts: "@scar APPROVED ✅ Create PR"
```

### Phase 5: PR Review

```
SCAR creates PR #45
  ↓
Supervisor:
1. Read PR diff (gh pr diff 45)
2. Check for:
   - Code quality
   - Test coverage
   - Security issues
   - Matches epic specs
3. If issues found:
   - Post review comments
   - Request changes
4. If approved:
   - Post: "LGTM ✅"
   - SCAR merges PR
```

### Phase 6: Completion

```
Supervisor:
1. Update workflow-status.yaml:
   - Mark epic completed
   - Record completion date
   - Update metrics
2. Close issue #123
3. Archive epic to completed/
```

---

## 🔧 Tool Usage

### Reading Files

**Supervisor frequently reads:**
```bash
# Implementation code (verification)
Read: /home/samuel/.archon/worktrees/consilio/issue-123/backend/auth/jwt.ts

# Test files (coverage check)
Read: /home/samuel/.archon/worktrees/consilio/issue-123/backend/auth/jwt.test.ts

# Configuration (project setup)
Read: /home/samuel/.archon/workspaces/consilio/package.json

# Epic specs (reference)
Read: /home/samuel/supervisor/consilio/.bmad/epics/001-user-auth.md
```

### Running Commands (via Bash or Subagents)

**Direct commands:**
```bash
# Check issue status
gh issue view 123

# Check worktree files
ls -la /home/samuel/.archon/worktrees/consilio/issue-123/

# Commit planning artifacts
cd /home/samuel/supervisor/consilio && git add .bmad/ && git commit -m "feat: Add auth epic"
```

**Via subagents (recommended for heavy work):**
```bash
# Tests, builds, complex operations
Task tool with prompt: "Run tests in issue-123..."
```

### GitHub Operations

**Supervisor uses gh CLI extensively:**
```bash
# Create issues
gh issue create --repo gpt153/consilio --title "..." --body "..."

# Comment on issues
gh issue comment 123 --body "..."

# View issues
gh issue view 123 --comments

# Check PR status
gh pr view 45
gh pr diff 45

# Check CI status
gh pr checks 45
```

---

## ✅ Success Indicators

**Supervisor succeeds when:**

1. **Planning is clear:**
   - Epics are self-contained (all context included)
   - Requirements use MoSCoW prioritization
   - Decisions documented in ADRs

2. **SCAR receives good instructions:**
   - Epic provides complete context
   - Acceptance criteria are testable
   - Technical constraints specified
   - SCAR asks <5% clarification questions

3. **Validation is thorough:**
   - All implementations verified before merge
   - Tests run and passing
   - No mocks in production code
   - UI tested (if applicable)

4. **Context is preserved:**
   - Token usage stays <80%
   - Handoffs are seamless
   - No repeated work
   - Progress tracked continuously

5. **User is informed:**
   - Regular progress updates
   - Clear status at any time
   - Blockers communicated immediately
   - Decisions explained (not just announced)

---

## 🚀 Key Capabilities Summary

**What Supervisor CAN do:**
- ✅ Plan features (epics, ADRs, PRDs)
- ✅ Direct SCAR (GitHub issues)
- ✅ Read implementation code (verification)
- ✅ Spawn test subagents (unit, integration, E2E, UI)
- ✅ Run builds (via subagents)
- ✅ Verify implementations (comprehensive checks)
- ✅ Monitor progress (issue comments, worktrees)
- ✅ Provide feedback (comments on issues/PRs)
- ✅ Manage context (handoffs, subagents)

**What Supervisor CANNOT do:**
- ❌ Write implementation code
- ❌ Modify SCAR's files directly
- ❌ Merge PRs (SCAR does this after approval)
- ❌ Deploy to production (requires user approval)

---

**The supervisor is strategic oversight + validation, not implementation. It directs, verifies, and ensures quality, but SCAR writes the code.**
