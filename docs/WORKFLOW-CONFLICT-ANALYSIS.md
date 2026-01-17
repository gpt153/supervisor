# Workflow Conflict Analysis & Resolution

**Date:** 2026-01-17
**Status:** CRITICAL - Two Conflicting Workflows Identified

---

## 🚨 Problem: Two Different Workflows

### Workflow A: BMAD Supervisor Workflow (Existing Documentation)

**Location:** `/home/samuel/supervisor/docs/bmad-workflow.md`, `scar-integration.md`

**How it works:**
1. Supervisor uses meta-commands: `/analyze`, `/create-epic`, `/plan-feature`
2. Supervisor creates epic in `.bmad/epics/001-feature.md`
3. Supervisor breaks epic into multiple GitHub issues
4. Supervisor posts epic content in each issue
5. Supervisor tags `@scar - Please implement...` (natural language)
6. Supervisor uses `/verify-scar-phase` and `/supervise-issue` commands
7. SCAR implements each issue separately in worktrees
8. Supervisor verifies each phase manually

**File Structure:**
```
/home/samuel/supervisor/consilio/
└── .bmad/
    ├── epics/001-user-auth.md          # Supervisor creates
    ├── workflow-status.yaml
    └── handoff-*.md

/home/samuel/.archon/worktrees/consilio/
├── issue-123/                          # SCAR works here
├── issue-124/
└── issue-125/
```

---

### Workflow B: SCAR PIV Loop (Actual SCAR Implementation)

**Location:** `/home/samuel/course/remote-coding-agent/`, SCAR codebase

**How it works:**
1. User comments: `@scar /command-invoke prime`
2. User comments: `@scar /command-invoke plan-feature-github "Feature description"`
3. SCAR creates plan in `.agents/plans/feature.md`
4. SCAR creates feature branch automatically
5. SCAR commits plan to branch, pushes to GitHub
6. User comments: `@scar /command-invoke execute-github .agents/plans/feature.md feature-branch`
7. SCAR implements, validates, creates PR automatically
8. User reviews PR, merges

**File Structure:**
```
/home/samuel/.archon/workspaces/consilio/
└── .agents/
    └── plans/user-auth.md              # SCAR creates

/home/samuel/.archon/worktrees/consilio/
└── feature-user-auth/                  # SCAR works here
```

---

## ⚠️ Key Conflicts

### 1. Who Creates the Plan?

**Workflow A (BMAD):**
- Supervisor creates epic in `.bmad/epics/`
- Epic is supervisor's planning artifact

**Workflow B (PIV Loop):**
- SCAR creates plan in `.agents/plans/`
- Plan is SCAR's planning artifact

**Conflict:** Two different planning documents in different locations.

---

### 2. Command Syntax

**Workflow A (BMAD):**
```markdown
@scar - Please implement following the epic specifications.

[Epic content]
```

**Workflow B (PIV Loop):**
```markdown
@scar /command-invoke prime
@scar /command-invoke plan-feature-github "Feature description"
@scar /command-invoke execute-github .agents/plans/x.md feature-x
```

**Conflict:** Completely different instruction syntax.

---

### 3. Issue Breakdown

**Workflow A (BMAD):**
- One epic → multiple GitHub issues
- Each issue = one task from epic
- SCAR works on issues in parallel (up to 10)

**Workflow B (PIV Loop):**
- One feature description → one plan → one feature branch
- Single workflow per feature
- One PR per feature

**Conflict:** Different granularity of work units.

---

### 4. Verification Commands

**Workflow A (BMAD):**
```bash
/verify-scar-phase consilio 123 2
/supervise-issue 123
/supervise
```

**Workflow B (PIV Loop):**
- SCAR validates automatically in `execute-github`
- No supervisor verification commands
- Optional `/command-invoke code-review` after PR

**Conflict:** Commands in Workflow A don't exist in SCAR codebase.

---

### 5. Supervisor Meta-Commands

**Workflow A (BMAD):**
```bash
/analyze "feature description"
/create-epic feature-name
/plan-feature "feature description"
```

**Workflow B (PIV Loop):**
- No supervisor meta-commands
- Supervisor creates epics manually or with subagents
- SCAR handles planning with `/command-invoke plan-feature-github`

**Conflict:** Two different planning systems.

---

## 🤔 Which Workflow Should We Use?

### Option 1: Use PIV Loop (SCAR-Native)

**Pros:**
- ✅ Matches actual SCAR implementation
- ✅ Fully automated (branch creation, PR creation)
- ✅ Single feature = single workflow
- ✅ Less supervisor overhead

**Cons:**
- ❌ Can't leverage parallel issue execution (SCAR's 10 concurrent limit)
- ❌ Loses BMAD epic structure
- ❌ Supervisor becomes less involved in planning
- ❌ Existing `/analyze`, `/create-epic` commands not used

**When to use:**
- Single-feature development
- Small to medium features
- When you want SCAR to handle everything

---

### Option 2: Use BMAD + Adapt SCAR Syntax

**Hybrid approach:**

1. **Supervisor creates epic** (BMAD)
   ```bash
   # Supervisor uses existing meta-commands
   /analyze "user authentication"
   /create-epic user-authentication
   ```

2. **Supervisor posts epic to GitHub issue** with corrected SCAR syntax
   ```markdown
   Title: [Epic-001] User Authentication

   Body:
   Implement user authentication per epic-001.

   **Epic Reference:** .bmad/epics/001-user-authentication.md

   ## Epic Content
   [Paste full epic here]

   ## SCAR Instructions

   @scar /command-invoke prime

   After prime, if you want SCAR to create its own plan:
   @scar /command-invoke plan-feature-github "Implement user authentication per epic-001"

   OR if you want to direct SCAR without its planning:
   [Provide detailed task breakdown from epic]
   @scar - Implement tasks 1-5 from epic above
   ```

3. **Choose SCAR mode:**
   - **Autonomous:** Let SCAR use `plan-feature-github` (creates `.agents/plans/`)
   - **Directed:** Give SCAR specific tasks from epic

**Pros:**
- ✅ Keeps BMAD planning structure
- ✅ Uses correct SCAR syntax
- ✅ Flexible (autonomous or directed)
- ✅ Leverages supervisor planning + SCAR execution

**Cons:**
- ❌ Potentially duplicate planning (epic + SCAR plan)
- ❌ More complex workflow
- ❌ Need to decide mode per feature

---

### Option 3: BMAD for Planning, Direct Instructions for SCAR

**Simpler hybrid:**

1. **Supervisor creates epic** using BMAD meta-commands
2. **Supervisor breaks epic into GitHub issues** (one per task)
3. **Each issue gets direct instructions** (no `/command-invoke plan-feature-github`)
   ```markdown
   Title: Task 1: Create User Model

   Body:
   Implement User model per epic-001.

   **Epic Reference:** .bmad/epics/001-user-authentication.md

   ## Task Details
   [Specific task from epic]

   ## Instructions
   @scar - Implement this task following the epic specifications above.
   Start immediately without planning phase.
   ```

4. **SCAR implements directly** (no plan-feature-github step)
5. **Supervisor verifies** by spawning verification subagents

**Pros:**
- ✅ Keeps BMAD structure
- ✅ Allows parallel execution (multiple issues)
- ✅ Supervisor controls breakdown
- ✅ No duplicate planning

**Cons:**
- ❌ Not using SCAR's PIV loop
- ❌ Need to verify `@scar - Implement...` syntax actually works
- ❌ May not leverage SCAR's autonomous planning

---

## 📋 Recommendation: Hybrid Workflow (Option 2 Variant)

**Use BMAD for supervisor planning + SCAR PIV for execution**

### Phase 1: Supervisor Planning (BMAD)

```bash
# Supervisor uses meta-commands
/analyze "user authentication"
/create-epic user-authentication
# Creates: .bmad/epics/001-user-authentication.md
```

### Phase 2: Issue Creation

**For small/medium epics (1-3 tasks):**
```markdown
# Create ONE GitHub issue with epic

Title: [Epic-001] User Authentication

Body:
Implement user authentication per epic-001.

**Epic Location:** .bmad/epics/001-user-authentication.md

## Epic Content
[Paste full epic content]

## SCAR Workflow

@scar /command-invoke prime

# After prime completes, ask SCAR to plan:
@scar /command-invoke plan-feature-github "Implement user authentication with JWT tokens, login/logout endpoints, password hashing per epic-001 specifications"

# After SCAR creates plan, execute:
@scar /command-invoke execute-github .agents/plans/epic-001-user-auth.md feature-epic-001-user-auth
```

**For large epics (4+ independent tasks):**
```markdown
# Break into multiple GitHub issues

Issue #123: Task 1 - User Model
@scar - Implement User model per epic-001 task 1. [Task details]

Issue #124: Task 2 - Auth Endpoints
@scar - Implement auth endpoints per epic-001 task 2. [Task details]

# SCAR works on both in parallel
```

### Phase 3: Verification

**Option A: Trust SCAR's validation** (execute-github runs tests automatically)

**Option B: Spawn verification subagent**
```bash
# Supervisor spawns Task tool subagent
Task tool with prompt:
"Verify SCAR's implementation in worktree.
Working directory: /home/samuel/.archon/worktrees/consilio/feature-epic-001-user-auth
Run build, tests, check for mocks.
Return: APPROVED or REJECTED"
```

---

## 🔧 Required Documentation Updates

### 1. Update `scar-integration.md`

**Remove:**
- References to `/verify-scar-phase` and `/supervise-issue` commands
- Natural language `@scar - Implement...` syntax

**Add:**
- Correct `/command-invoke` syntax
- When to use PIV loop vs direct instructions
- Hybrid workflow explanation

### 2. Update `scar-command-reference.md`

**Add section:**
- "Integration with BMAD Supervisor Workflow"
- When supervisor creates epic, how to use it with SCAR
- Epic + PIV Loop hybrid approach

### 3. Update `bmad-workflow.md`

**Update Implementation phase:**
```markdown
4. IMPLEMENTATION (SCAR + Supervision)

   **Option A: SCAR PIV Loop (Small/Medium Features)**
   - Create GitHub issue with epic content
   - Use: @scar /command-invoke prime
   - Use: @scar /command-invoke plan-feature-github "description"
   - Use: @scar /command-invoke execute-github <plan> <branch>

   **Option B: Multi-Issue Parallel (Large Epics)**
   - Break epic into multiple GitHub issues
   - Each issue: @scar - Implement task [N] per epic
   - SCAR works on multiple issues in parallel
   - Supervisor verifies each with spawned subagents
```

### 4. Create `WORKFLOW-DECISION-GUIDE.md`

Help supervisors decide which workflow to use:
- Feature size → PIV Loop or Multi-Issue
- Complexity → Autonomous or Directed
- Verification → Trust SCAR or Spawn Subagent

---

## ✅ Proposed Unified Workflow

### Small/Medium Features (1-3 tasks, <4 hours)

```
1. Supervisor: /analyze "feature"
2. Supervisor: /create-epic feature-name
3. Supervisor: Create single GitHub issue with epic
4. Supervisor: @scar /command-invoke prime
5. Supervisor: @scar /command-invoke plan-feature-github "description"
6. SCAR: Creates plan, branch, commits
7. Supervisor: @scar /command-invoke execute-github <plan> <branch>
8. SCAR: Implements, validates, creates PR
9. Supervisor: Review PR, merge
```

### Large Features (4+ tasks, days/weeks)

```
1. Supervisor: /analyze "feature"
2. Supervisor: /create-epic feature-name
3. Supervisor: Break epic into tasks with dependencies
4. Supervisor: Create GitHub issues for independent tasks
5. Supervisor: Post epic content + direct instructions to each
6. SCAR: Works on multiple issues in parallel (up to 10)
7. Supervisor: Spawn verification subagents per issue
8. Supervisor: Approve completed issues
9. Supervisor: Create dependent issues as blockers complete
10. Supervisor: Merge all when complete
```

---

## 🎯 Action Items

**To resolve conflicts:**

1. ✅ **Decide on unified workflow** - Use hybrid approach above
2. ⬜ **Update scar-integration.md** - Remove non-existent commands
3. ⬜ **Update bmad-workflow.md** - Add PIV loop integration
4. ⬜ **Update scar-command-reference.md** - Add BMAD integration section
5. ⬜ **Create workflow decision guide** - Help choose approach
6. ⬜ **Test both workflows** - Verify they work as documented
7. ⬜ **Update project templates** - Reflect unified workflow

---

## 📝 Summary

**Problem:**
- Two conflicting workflows documented
- BMAD workflow uses non-existent SCAR commands
- PIV loop bypasses supervisor planning

**Solution:**
- Use BMAD for supervisor planning (epics, ADRs)
- Use SCAR PIV loop for execution
- Choose granularity based on feature size
- Hybrid approach leverages both strengths

**Next Steps:**
- Get user confirmation on approach
- Update all documentation
- Create decision guide
- Test unified workflow

---

**Location:** `/home/samuel/supervisor/docs/WORKFLOW-CONFLICT-ANALYSIS.md`
**Created:** 2026-01-17
**Status:** AWAITING USER DECISION
