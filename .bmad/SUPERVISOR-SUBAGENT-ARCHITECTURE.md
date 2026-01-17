# Supervisor Subagent Architecture - Complete Map

**Date:** 2026-01-17
**Purpose:** Map ALL recurring supervisor tasks and ensure each has a dedicated subagent
**Principle:** Supervisor orchestrates, subagents execute. Context conservation is CRITICAL.

---

## Current State Analysis

### ✅ Subagents that EXIST

**In Implementation Workspaces** (`/home/samuel/.archon/workspaces/{project}/.claude/commands/supervision/`):
1. ✅ `scar-monitor.md` - Monitor single issue (2-min polling loop)
2. ✅ `supervise-issue.md` - Full supervision of single issue
3. ✅ `supervise.md` - Multi-issue supervision (project-wide)
4. ✅ `build-scar-instruction.md` - Format SCAR commands
5. ✅ `prime-supervisor.md` - Load project context
6. ✅ `ui-test-supervise.md` - UI testing supervision
7. ✅ `ui-regression-test.md` - Regression testing
8. ✅ `ui-fix-retest-monitor.md` - Fix and retest loop

**In Supervisor Planning** (`/home/samuel/supervisor/.claude/commands/`):
1. ✅ `analyze.md` - Feature analysis (Analyst role)
2. ✅ `create-epic.md` - Epic creation (PM role)
3. ✅ `create-adr.md` - Architecture decisions (Architect role)
4. ✅ `plan-feature.md` - Meta-orchestrator for planning
5. ✅ `new-project.md` - Project setup
6. ✅ `ui-workflow.md` - UI design workflow

### ❌ Critical GAP: Supervision Subagents Missing from Supervisor Planning

**The problem:**
- Implementation workspaces HAVE supervision subagents
- Supervisor planning workspace DOESN'T
- Supervisor CLAUDE.md says "spawn verification subagent" but NOT "spawn supervision subagent"

**Result:**
- Supervisor tries to monitor SCAR itself (runs out of context)
- Supervisor forgets to check every 2 minutes
- NO autonomous supervision loop

---

## ALL Recurring Supervisor Tasks (Comprehensive Map)

### Category 1: PLANNING Tasks (Already have subagents ✅)

| Task | Subagent | Location | Status |
|------|----------|----------|--------|
| Analyze feature request | `analyze.md` | supervisor/.claude/commands/ | ✅ EXISTS |
| Create epic | `create-epic.md` | supervisor/.claude/commands/ | ✅ EXISTS |
| Create ADR | `create-adr.md` | supervisor/.claude/commands/ | ✅ EXISTS |
| Meta-orchestration | `plan-feature.md` | supervisor/.claude/commands/ | ✅ EXISTS |
| New project setup | `new-project.md` | supervisor/.claude/commands/ | ✅ EXISTS |
| UI workflow | `ui-workflow.md` | supervisor/.claude/commands/ | ✅ EXISTS |

### Category 2: SUPERVISION Tasks (MISSING from supervisor planning ❌)

| Task | Subagent Needed | Currently Exists | Action Required |
|------|----------------|------------------|-----------------|
| **Monitor single SCAR issue** | `supervise-issue.md` | Only in impl workspaces | ⚠️ COPY to supervisor/.claude/commands/supervision/ |
| **Monitor SCAR progress loop** | `scar-monitor.md` | Only in impl workspaces | ⚠️ COPY to supervisor/.claude/commands/supervision/ |
| **Multi-issue supervision** | `supervise.md` | Only in impl workspaces | ⚠️ COPY to supervisor/.claude/commands/supervision/ |
| **Build SCAR instruction** | `build-scar-instruction.md` | Only in impl workspaces | ⚠️ COPY to supervisor/.claude/commands/supervision/ |
| **Prime supervisor context** | `prime-supervisor.md` | Only in impl workspaces | ⚠️ COPY to supervisor/.claude/commands/supervision/ |
| **Verify SCAR's work** | `verify-scar-phase.md` | ❌ DOESN'T EXIST | 🆕 CREATE |
| **Check SCAR acknowledgment** | `verify-scar-start.md` | ❌ DOESN'T EXIST | 🆕 CREATE |
| **Unblock SCAR (approval)** | `approve-scar-plan.md` | ❌ DOESN'T EXIST | 🆕 CREATE |
| **Handle SCAR questions** | `scar-qa-handler.md` | ❌ DOESN'T EXIST | 🆕 CREATE |

### Category 3: VALIDATION Tasks (Partially covered)

| Task | Subagent Needed | Currently Exists | Action Required |
|------|----------------|------------------|-----------------|
| **Verify SCAR implementation** | `verify-scar-phase.md` | ⚠️ Referenced but missing | 🆕 CREATE comprehensive version |
| **Run build validation** | `build-validator.md` | ❌ NO | 🆕 CREATE |
| **Run test suite** | `test-runner.md` | ❌ NO | 🆕 CREATE |
| **UI testing** | `ui-test-supervise.md` | Only in impl workspaces | ⚠️ COPY |
| **Regression testing** | `ui-regression-test.md` | Only in impl workspaces | ⚠️ COPY |

### Category 4: STATUS REPORTING Tasks (Missing)

| Task | Subagent Needed | Currently Exists | Action Required |
|------|----------------|------------------|-----------------|
| **Check all issues status** | `check-issues-status.md` | ❌ NO | 🆕 CREATE |
| **Generate progress report** | `generate-report.md` | ❌ NO | 🆕 CREATE |
| **Check SCAR health** | `check-scar-health.md` | ❌ NO | 🆕 CREATE |
| **Track epic completion** | `track-epic.md` | ❌ NO | 🆕 CREATE |

### Category 5: ERROR HANDLING Tasks (Missing)

| Task | Subagent Needed | Currently Exists | Action Required |
|------|----------------|------------------|-----------------|
| **Diagnose SCAR failure** | `diagnose-scar-failure.md` | ❌ NO | 🆕 CREATE |
| **Retry SCAR command** | `retry-scar-command.md` | ❌ NO | 🆕 CREATE |
| **Fix webhook issues** | `fix-webhook.md` | ❌ NO | 🆕 CREATE |

---

## Priority: CRITICAL Supervision Subagents

These are ABSOLUTELY NECESSARY for autonomous operation:

### 1. `supervise-issue.md` (HIGHEST PRIORITY)

**Purpose:** Autonomous supervision of single GitHub issue from start to completion

**Spawned by:** Supervisor when user says "plan feature X" or "fix bug Y"

**What it does:**
```
1. Post SCAR instruction to GitHub issue
2. Verify SCAR acknowledgment (20s, 3 retries)
3. LOOP every 2 minutes:
   - Check for SCAR updates
   - Detect completion signals
   - Detect blocking patterns ("awaiting approval")
   - IF blocked: Unblock automatically
   - IF complete: Trigger verification
4. Report final status to supervisor
```

**Context usage:** ~5-10K tokens (vs supervisor's 80K+)

**Current status:** EXISTS in impl workspace, MISSING from supervisor planning

**Action:** COPY and adapt to supervisor planning workspace

---

### 2. `scar-monitor.md` (HIGH PRIORITY)

**Purpose:** Lightweight monitoring loop (spawned by supervise-issue)

**Spawned by:** `supervise-issue.md` after posting instruction

**What it does:**
```
LOOP until completion:
  Wait 2 minutes
  Check issue comments
  Detect signals (completion, error, activity)
  Log progress
  Report if blocked or complete
END LOOP
```

**Context usage:** ~2-3K tokens (minimal, pure monitoring)

**Current status:** EXISTS in impl workspace, MISSING from supervisor planning

**Action:** COPY to supervisor planning workspace

---

### 3. `approve-scar-plan.md` (HIGH PRIORITY - NEW)

**Purpose:** Handle SCAR plan approval automatically

**Spawned by:** `scar-monitor.md` when detects "awaiting approval"

**What it does:**
```
1. Read SCAR's plan from GitHub issue or .agents/plans/
2. Validate plan:
   - Follows project patterns?
   - No security issues?
   - Reasonable scope?
3. IF plan reasonable:
   → Post: @scar /command-invoke execute-github {plan}.md feature-{branch}
4. ELSE IF needs review:
   → Report to supervisor with concerns
   → Supervisor escalates to user
5. Return to monitoring loop
```

**Context usage:** ~8K tokens

**Current status:** ❌ DOESN'T EXIST

**Action:** 🆕 CREATE

---

### 4. `verify-scar-phase.md` (HIGH PRIORITY - ENHANCE)

**Purpose:** Comprehensive verification of SCAR's implementation

**Spawned by:** `supervise-issue.md` when SCAR signals completion

**What it does:**
```
1. Identify worktree path: /home/samuel/.archon/worktrees/{project}/issue-{N}/
2. Run build: npm run build (or equivalent)
3. Check for errors (MUST be 0)
4. Run tests: npm test
5. Search for mocks/placeholders
6. Validate acceptance criteria
7. Return: APPROVED / REJECTED / NEEDS_FIXES
```

**Context usage:** ~10K tokens

**Current status:** ⚠️ Referenced in docs but actual implementation missing

**Action:** 🆕 CREATE comprehensive version

---

### 5. `verify-scar-start.md` (MEDIUM PRIORITY - NEW)

**Purpose:** Verify SCAR acknowledged and started working

**Spawned by:** `supervise-issue.md` after posting instruction

**What it does:**
```
1. Wait 20 seconds
2. Check for "SCAR is on the case..." comment
3. IF found: ✅ Return success
4. IF NOT found:
   - Retry 1: Wait 40s, check again
   - Retry 2: Wait 60s, check again
   - Retry 3: Diagnose issue
     - Check webhook logs
     - Verify SCAR server health
     - Check command syntax
   - Return diagnostic results
```

**Context usage:** ~3K tokens

**Current status:** ❌ DOESN'T EXIST (logic exists in scar-monitor but should be separate)

**Action:** 🆕 CREATE

---

## Subagent Spawning Protocol (How Supervisor Uses Them)

### Scenario: User says "Plan feature: Add notifications"

**OLD WAY (Current - WRONG):**
```
Supervisor:
  1. Analyze feature ✅ (spawns analyze.md)
  2. Create epic ✅ (spawns create-epic.md)
  3. Post to GitHub issue ✅
  4. @mention SCAR with command ✅
  5. ❌ START MONITORING LOOP ITSELF
  6. ❌ Runs out of context or forgets to check
  7. ❌ User returns hours later, SCAR was blocked
```

**NEW WAY (Correct - with subagents):**
```
Supervisor:
  1. Analyze feature ✅ (spawns analyze.md)
  2. Create epic ✅ (spawns create-epic.md)
  3. Post to GitHub issue ✅
  4. 🆕 SPAWN supervise-issue.md #{issue-number}
  5. ✅ Returns to idle, conserves context

supervise-issue subagent:
  1. @mention SCAR with /command-invoke plan-feature-github
  2. SPAWN verify-scar-start.md
  3. IF SCAR started ✅:
     → SPAWN scar-monitor.md (2-min loop)
  4. IF SCAR not started ❌:
     → SPAWN diagnose-scar-failure.md
     → Report to supervisor with fix

scar-monitor subagent:
  LOOP every 2 minutes:
    - Check issue comments
    - IF "awaiting approval":
      → SPAWN approve-scar-plan.md
    - IF "complete":
      → SPAWN verify-scar-phase.md
    - CONTINUE until done

approve-scar-plan subagent:
  1. Read plan
  2. Validate
  3. Post @scar /command-invoke execute-github
  4. Return to monitoring

verify-scar-phase subagent:
  1. cd worktree
  2. npm run build
  3. npm test
  4. Check for mocks
  5. Return: APPROVED/REJECTED

supervise-issue subagent:
  - Receives verification result
  - IF APPROVED: Post approval, close supervision
  - IF REJECTED: Post issues, continue monitoring
  - Reports final status to supervisor

Supervisor:
  - Receives final report
  - Tells user: "✅ Feature complete and verified"
  - Context usage: <20K tokens total!
```

---

## Implementation Plan

### Phase 1: Copy Existing Subagents (IMMEDIATE)

```bash
# Create supervision directory in supervisor planning
mkdir -p /home/samuel/supervisor/.claude/commands/supervision/

# Copy from implementation workspace
cp /home/samuel/.archon/workspaces/consilio/.claude/commands/supervision/supervise-issue.md \
   /home/samuel/supervisor/.claude/commands/supervision/

cp /home/samuel/.archon/workspaces/consilio/.claude/commands/supervision/scar-monitor.md \
   /home/samuel/supervisor/.claude/commands/supervision/

cp /home/samuel/.archon/workspaces/consilio/.claude/commands/supervision/supervise.md \
   /home/samuel/supervisor/.claude/commands/supervision/

cp /home/samuel/.archon/workspaces/consilio/.claude/commands/supervision/build-scar-instruction.md \
   /home/samuel/supervisor/.claude/commands/supervision/

cp /home/samuel/.archon/workspaces/consilio/.claude/commands/supervision/prime-supervisor.md \
   /home/samuel/supervisor/.claude/commands/supervision/
```

### Phase 2: Create Missing Critical Subagents

**Priority order:**
1. 🆕 `approve-scar-plan.md` - Auto-approve plans
2. 🆕 `verify-scar-phase.md` - Comprehensive verification
3. 🆕 `verify-scar-start.md` - Start verification
4. 🆕 `check-scar-health.md` - Health check
5. 🆕 `diagnose-scar-failure.md` - Failure diagnosis

### Phase 3: Update CLAUDE.md (CRITICAL)

**Add to TOP of every project CLAUDE.md:**

```markdown
## 🚨 MANDATORY: Subagent Spawning Protocol

**YOU MUST SPAWN SUBAGENTS. NEVER RUN LOOPS YOURSELF.**

### When User Says: "Plan feature X"

YOU MUST:
  1. Spawn analyze.md if needed
  2. Spawn create-epic.md
  3. Create GitHub issue
  4. 🆕 SPAWN supervise-issue.md {issue-number}
  5. ✅ RETURN TO IDLE

DO NOT:
  ❌ Monitor SCAR yourself
  ❌ Run polling loops
  ❌ Track progress manually

The subagent handles EVERYTHING. You just spawn it.

### When User Says: "Check progress on issue #X"

YOU MUST:
  1. Read issue comments (quick check)
  2. Report current state from last comment
  3. ✅ DONE

DO NOT:
  ❌ Spawn monitoring subagent (already running)
  ❌ Re-monitor (subagent is doing it)

### When User Says: "Verify issue #X"

YOU MUST:
  1. 🆕 SPAWN verify-scar-phase.md {project} {issue-number} {phase}
  2. Wait for result
  3. Report to user
  4. ✅ DONE
```

### Phase 4: Test and Iterate

1. Test with real feature: "Plan feature: Add notifications"
2. Monitor supervisor behavior
3. Verify subagent spawning
4. Confirm autonomous operation
5. Fix any gaps

---

## Success Metrics

**Before:**
- Supervisor runs 200 tool calls monitoring SCAR
- Context window: 150K/200K tokens
- Supervisor forgets to check
- Hours wasted

**After:**
- Supervisor runs 5 tool calls (spawn subagent, receive report)
- Context window: <20K tokens
- Subagent NEVER forgets (it's a loop)
- Continuous autonomous supervision

---

## File Structure (After Implementation)

```
/home/samuel/supervisor/
└── .claude/
    └── commands/
        ├── analyze.md                        # ✅ EXISTS
        ├── create-epic.md                    # ✅ EXISTS
        ├── create-adr.md                     # ✅ EXISTS
        ├── plan-feature.md                   # ✅ EXISTS
        ├── new-project.md                    # ✅ EXISTS
        ├── ui-workflow.md                    # ✅ EXISTS
        └── supervision/                      # 🆕 NEW DIRECTORY
            ├── supervise-issue.md            # ⚠️ COPY from impl workspace
            ├── scar-monitor.md               # ⚠️ COPY from impl workspace
            ├── supervise.md                  # ⚠️ COPY from impl workspace
            ├── build-scar-instruction.md     # ⚠️ COPY from impl workspace
            ├── prime-supervisor.md           # ⚠️ COPY from impl workspace
            ├── approve-scar-plan.md          # 🆕 CREATE
            ├── verify-scar-phase.md          # 🆕 CREATE
            ├── verify-scar-start.md          # 🆕 CREATE
            ├── check-scar-health.md          # 🆕 CREATE
            └── diagnose-scar-failure.md      # 🆕 CREATE
```

---

## Next Steps

1. ✅ Create supervision directory
2. ⚠️ Copy existing subagents from impl workspace
3. 🆕 Create 5 missing critical subagents
4. 📝 Update ALL project CLAUDE.md files with spawning protocol
5. ✅ Test with real scenario
6. 📊 Measure context savings
7. 🔄 Iterate based on results

---

**Status:** Architecture designed, ready for implementation
