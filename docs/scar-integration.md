# SCAR Platform Integration

## Understanding SCAR

SCAR (Remote Agentic Coding Platform) is your implementation worker:
- **95% autonomous** - Runs 4-6 hours unattended
- **Parallel execution** - Handles 10 issues simultaneously
- **GitHub-driven** - Controlled via issue comments
- **Worktree-based** - Each issue gets isolated branch
- **Validation-ready** - `/verify-scar-phase` checks implementation

## SCAR File Locations

**Workspace (Main Branch):**
```
/home/samuel/.archon/workspaces/<project>/
├── src/          # Merged code (main branch)
├── CLAUDE.md     # SCAR instructions
└── package.json
```

**Worktree (Issue Branch):**
```
/home/samuel/.archon/worktrees/<project>/issue-123/
├── src/          # SCAR's work in progress
└── [changes for issue #123]
```

**CRITICAL:** Always verify files in **worktree**, not workspace!

## Parallel vs Sequential Issue Creation

**SCAR can handle 10 issues simultaneously.** Maximize throughput by creating independent issues in parallel.

**Strategy:**
1. **Read epic's Dependencies section** - Identifies which issues block others
2. **Identify parallel-safe issues** - No dependencies = can run simultaneously
3. **Create independent issues immediately** - All at once (with 2s delays for GitHub rate limits)
4. **Tag @scar on all** - SCAR will pick them all up and work in parallel
5. **Create dependent issues later** - Only after prerequisite issues complete

**Example Epic Breakdown:**

```markdown
## Dependencies

**No Dependencies (Parallel Safe):**
- Issue A: Add login form UI
- Issue B: Create database schema
- Issue C: Set up email service
- Issue D: Add error logging

**Has Dependencies (Sequential):**
- Issue E: Implement login endpoint (needs B: database schema)
- Issue F: Add password reset (needs C: email service, E: login endpoint)
```

**Correct approach:**
```bash
# Create A, B, C, D immediately (all independent)
gh issue create --title "Issue A" --body "..." && sleep 2
gh issue create --title "Issue B" --body "..." && sleep 2
gh issue create --title "Issue C" --body "..." && sleep 2
gh issue create --title "Issue D" --body "..." && sleep 2

# SCAR now working on 4 issues in parallel

# Wait for B to complete, then create E
# Wait for C and E to complete, then create F
```

**Result:** 4 issues done simultaneously instead of 4× sequential time.

**Benefits:**
- ✅ SCAR works on up to 10 issues at once
- ✅ Independent work completes faster
- ✅ Dependencies still respected
- ✅ Better resource utilization

---

## How to Instruct SCAR Effectively

**Epic-Based Instruction (Recommended):**

When creating GitHub issue, attach epic file content:

```markdown
# Issue Title: Backend - User authentication API

Implement authentication endpoints as specified in epic.

**Epic Reference:** .bmad/epics/001-user-authentication.md

## Epic Context (Self-Contained)

[Paste full epic content here so SCAR has complete context]

## Tasks
- [ ] POST /auth/signup endpoint
- [ ] POST /auth/login endpoint
- [ ] JWT token generation
- [ ] Password hashing (bcrypt)

## Acceptance Criteria
- [ ] Endpoints return 200 with valid data
- [ ] Invalid input returns 400 with errors
- [ ] Passwords hashed before storage
- [ ] JWT tokens signed correctly
- [ ] All unit tests pass
- [ ] Build succeeds with zero TypeScript errors

@scar - Please implement following the epic specifications.
```

**Why This Works:**
- ✅ Epic provides complete context (self-contained)
- ✅ SCAR doesn't need to search codebase
- ✅ Clear acceptance criteria for validation
- ✅ Technical decisions already documented (ADRs linked in epic)

## SCAR Instruction Protocol (MANDATORY)

**After posting ANY instruction to SCAR:**

1. **Wait 20 seconds** for acknowledgment
2. **Check for "SCAR is on the case..." comment**
3. **If NO acknowledgment:**
   - Check GitHub webhook logs
   - Re-post with @scar mention
   - Use simpler language
4. **Wait 30 seconds** for work to start
5. **Verify file creation:**
   ```bash
   find /home/samuel/.archon/worktrees/<project>/issue-<N>/ -type f -newer <ref>
   ```
6. **If NO activity:**
   - SCAR may be in "planning mode"
   - Re-post: "Skip planning. Implement directly. Start NOW."

**Red Flags:**
- 🚩 No acknowledgment after 30+ seconds
- 🚩 SCAR posts long "plan" instead of code
- 🚩 No new files after 60+ seconds
- 🚩 SCAR asks clarifying questions (unclear instruction)

**Success Indicators:**
- ✅ "SCAR is on the case..." appears within 20s
- ✅ New files in worktree within 60s
- ✅ Progress updates as files created

## Verification Protocol

**Use the subagent (context-efficient):**

```bash
/verify-scar-phase <project> <issue-number> <phase-number>

# Example:
/verify-scar-phase consilio 123 2
```

**What it checks:**
- All claimed files exist in worktree
- Build succeeds (`npm run build`)
- TypeScript passes (`npm run type-check`)
- No mocks in production code
- Real code lines (not empty files)
- Acceptance criteria met

**Returns:**
- ✅ **APPROVED** - Phase complete, proceed
- ⚠️ **NEEDS FIXES** - Issues found (specific list)
- ❌ **REJECTED** - Critical problems

**After verification:**
- If APPROVED: Post approval, prompt SCAR for next phase
- If REJECTED: Post specific fixes needed
- Update workflow-status.yaml

## Supervision Commands

**Supervise single issue:**
```bash
/supervise-issue 123
```

**Supervise entire project:**
```bash
/supervise
```

**What supervision does:**
- Spawns monitoring subagents (max 10 concurrent)
- Tracks SCAR progress automatically
- Validates each phase with `/verify-scar-phase`
- Manages dependencies (sequential vs parallel)
- Reports progress every 10 minutes
- Continues until completion or needs input
