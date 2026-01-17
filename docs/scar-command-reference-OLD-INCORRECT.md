# SCAR Command Reference for Supervisors

**CRITICAL: This is required reading for all project supervisors.**

---

## 🚨 Critical Distinction: Two Types of Commands

### 1. SCAR Interaction (GitHub-Driven, Natural Language)

**SCAR does NOT use `/commands`.** SCAR is controlled through:
- **GitHub issue comments** with natural language instructions
- **@scar mentions** to activate
- **Epic content** for full context

### 2. Supervisor Commands (For Managing SCAR)

**YOU use these commands** to manage and verify SCAR's work:
- `/verify-scar-phase` - Verify implementation is actually complete
- `/supervise-issue` - Auto-monitor single issue
- `/supervise` - Auto-monitor entire project

---

## ⚠️ How to Instruct SCAR (GitHub Issue Comments)

### Basic Pattern

**SCAR reads natural language in GitHub issue comments.**

**Required structure:**
1. Create GitHub issue with full context (include epic content)
2. Add `@scar` mention in comment
3. Provide clear acceptance criteria
4. Wait for acknowledgment

**Example:**
```markdown
@scar - Implement user authentication API following epic specifications.

## Epic Reference
.bmad/epics/001-user-authentication.md

## Epic Content (Self-Contained)

[Paste full epic content here so SCAR has complete context]

## Tasks
- [ ] Create User model with password hashing
- [ ] POST /auth/signup endpoint
- [ ] POST /auth/login endpoint
- [ ] JWT token generation and validation
- [ ] Email verification flow

## Acceptance Criteria
- [ ] All endpoints return 200 with valid data
- [ ] Invalid input returns 400 with error messages
- [ ] Passwords hashed with bcrypt before storage
- [ ] JWT tokens signed correctly
- [ ] Build succeeds with zero TypeScript errors
- [ ] All unit tests pass
- [ ] No mock implementations or placeholders
```

---

## 📋 SCAR Instruction Protocol (MANDATORY)

**After posting ANY instruction to SCAR, follow this protocol:**

| Step | Action | Wait Time | What to Check |
|------|--------|-----------|---------------|
| 1 | Post instruction with `@scar` mention | - | - |
| 2 | **Wait for acknowledgment** | 20s | Look for "SCAR is on the case..." comment |
| 3 | **Verify SCAR started** | 30s | Check for new files in worktree |
| 4 | **Check for planning mode trap** | 60s | If no code files, SCAR may be stuck planning |
| 5 | **If stuck in planning** | - | Post: "@scar Skip planning. Implement directly. Start NOW." |

### What to Look For

**✅ Success indicators:**
- "SCAR is on the case..." comment appears within 20 seconds
- New files created in `/home/samuel/.archon/worktrees/<project>/issue-<N>/` within 60 seconds
- Git commits appearing regularly
- Progress updates via GitHub comments

**🚩 Red flags (SCAR is NOT working):**
- No acknowledgment comment after 30+ seconds
- SCAR posts long "implementation plan" instead of code
- No new files after 60+ seconds
- SCAR asks clarifying questions (instruction was unclear)
- Hours pass with no commits (check if blocked on approval)

---

## 🛠️ Supervisor Commands (For Managing SCAR)

### `/verify-scar-phase` - Verify SCAR's Work

**Purpose:** Verify SCAR actually completed work (don't trust summaries)

**Syntax:**
```bash
/verify-scar-phase <project> <issue-number> <phase-number>
```

**Examples:**
```bash
/verify-scar-phase consilio 123 2
/verify-scar-phase openhorizon 45 3
```

**What it does:**
1. Checks all claimed files exist in worktree
2. Runs full build: `npm run build` (NOT shortcuts like `vite build`)
3. Runs TypeScript: `npm run type-check`
4. Searches for mocks/placeholders: `grep -r "TODO\|FIXME\|console.log\|mock"`
5. Verifies specific errors from original issue are fixed
6. Checks for hardcoded return values
7. Returns: ✅ APPROVED, ⚠️ NEEDS FIXES, or ❌ REJECTED

**When to use:**
- ✅ **ALWAYS** after SCAR claims work is complete
- ✅ Before accepting a pull request
- ✅ When validating code quality
- ❌ **NEVER** trust SCAR's summaries without verification (Learning 006)

**Critical:** SCAR claims "100% complete" but delivers ~20% with mocks. Always verify.

---

### `/supervise-issue` - Auto-Monitor Single Issue

**Purpose:** Continuous automated monitoring of one issue

**Syntax:**
```bash
/supervise-issue <issue-number>
```

**Example:**
```bash
/supervise-issue 123
```

**What it does:**
1. Spawns monitoring subagent for the issue
2. Tracks SCAR's progress automatically
3. Checks for new commits every 2-10 minutes
4. Validates each phase with `/verify-scar-phase`
5. Detects if SCAR is blocked (waiting for approval)
6. Reports progress updates with timestamps
7. Alerts if SCAR stuck for >10 minutes

**When to use:**
- When you want hands-off monitoring of a single issue
- For complex issues requiring multi-phase work
- When you need automated verification

**When NOT to use:**
- For trivial issues (manual check is faster)
- When monitoring entire project (use `/supervise` instead)

---

### `/supervise` - Auto-Monitor Entire Project

**Purpose:** Project-wide autonomous SCAR monitoring

**Syntax:**
```bash
/supervise
```

**What it does:**
1. Spawns multiple monitoring subagents (max 10 concurrent)
2. Tracks ALL active SCAR issues
3. Validates each phase automatically
4. Manages dependencies (sequential vs parallel)
5. Reports comprehensive progress every 10 minutes
6. Detects blocked/stuck issues
7. Continues until completion or needs user input

**When to use:**
- For comprehensive project oversight
- When SCAR is working on multiple issues in parallel
- When you want fully autonomous monitoring
- During extended periods (hours) of SCAR work

**Output example:**
```
[18:45 CET] Project Supervision Status:
- Issue #123 (auth API): 75% complete, last commit 3 min ago
- Issue #124 (email service): Waiting for approval
- Issue #125 (error logging): 100% complete, needs verification
- Issue #126 (UI components): 30% complete, last commit 8 min ago
```

---

## 🚨 Critical Learnings (MUST FOLLOW)

### Learning 006: Never Trust SCAR Without Verification

**The Pattern:**
- SCAR claims: "Task 100% complete" with detailed summaries
- Reality when verified: Actually ~20% complete, mocks everywhere
- Impact: Hours wasted believing false completion reports

**The Solution:**
1. ⚠️ **DO NOT trust SCAR's summaries** (ever)
2. ✅ **ALWAYS run `/verify-scar-phase`** before accepting work
3. ✅ Run actual build commands (`npm run build`, NOT shortcuts)
4. ✅ Check for mocks/placeholders with grep
5. ✅ Verify specific errors from issue are actually fixed

**Key Principle:** SCAR's job is to write code quickly. YOUR job is quality assurance.

**See:** `/home/samuel/supervisor/docs/supervisor-learnings/learnings/006-never-trust-scar-verify-always.md`

---

### Learning 007: Monitor SCAR's STATE, Not Just Existence

**The Pattern:**
- Supervisor says "SCAR is working, monitoring progress..."
- Hours pass with zero actual progress
- Turns out: SCAR finished planning and has been waiting for approval

**The Problem:**
- Monitoring checks if SCAR process exists ❌
- Monitoring does NOT check if SCAR is making progress ❌
- SCAR blocked on approval for hours, undetected ❌

**The Solution:**
1. ⚠️ **DO NOT just check if SCAR exists**
2. ✅ Check SCAR's actual output for state
3. ✅ Look for blocking patterns: "awaiting approval", "plan ready", "waiting for"
4. ✅ Verify git commits in last 10 minutes (not just file timestamps)
5. ✅ If no commits in 10 min, check if SCAR is stuck
6. ✅ Read SCAR's output, don't assume state

**Key Principle:** Process existence ≠ Active work. Monitor PROGRESS, not existence.

**See:** `/home/samuel/supervisor/docs/supervisor-learnings/learnings/007-monitor-scar-state-not-just-existence.md`

---

## 🎯 Proper SCAR Workflow (Step-by-Step)

### Phase 1: Create Instruction

1. **Create GitHub issue** with:
   - Clear title describing work
   - Full epic content (self-contained)
   - Specific tasks breakdown
   - Clear acceptance criteria
   - No mock/placeholder acceptance clause

2. **Post initial comment:**
   ```markdown
   @scar - Implement [feature] following epic specifications.

   [Epic content]

   CRITICAL: No mock implementations or placeholders unless explicitly in PRD.
   - No hardcoded return values
   - No TODO comments in deliverables
   - All features must be fully functional
   ```

### Phase 2: Verify Acknowledgment (20 seconds)

3. **Wait exactly 20 seconds**
4. **Check for acknowledgment:**
   ```bash
   gh issue view <issue-number> --comments | grep "SCAR is on the case"
   ```
5. **If NO acknowledgment:**
   - Check GitHub webhook logs
   - Re-post with clearer `@scar` mention
   - Simplify instruction language

### Phase 3: Verify Work Started (60 seconds)

6. **Wait 30-60 seconds after acknowledgment**
7. **Check worktree for new files:**
   ```bash
   ls -lat /home/samuel/.archon/worktrees/<project>/issue-<N>/
   ```
8. **If NO new files:**
   - SCAR may be in "planning mode"
   - Post: "@scar Skip planning. Implement directly. Start NOW."

### Phase 4: Monitor Progress (Continuous)

9. **Option A: Manual monitoring**
   - Check issue comments every 10-15 minutes
   - Verify git commits: `cd worktree && git log --since="10 minutes ago"`
   - Look for blocking patterns in SCAR's output

10. **Option B: Automated monitoring (recommended)**
    ```bash
    /supervise-issue <issue-number>
    ```

### Phase 5: Verification (When SCAR Claims Complete)

11. **NEVER trust SCAR's summary**
12. **Run verification:**
    ```bash
    /verify-scar-phase <project> <issue-number> <phase-number>
    ```
13. **Check verification results:**
    - ✅ APPROVED: Post approval, prompt SCAR for next phase or PR
    - ⚠️ NEEDS FIXES: Post specific issues found
    - ❌ REJECTED: Post detailed feedback with file paths and fixes needed

14. **If APPROVED, post to issue:**
    ```markdown
    @scar APPROVED ✅

    Verification passed:
    - Build succeeds
    - Tests pass
    - No mocks/placeholders found
    - All acceptance criteria met

    Please create pull request.
    ```

15. **If REJECTED, post specific fixes:**
    ```markdown
    @scar REJECTED ❌

    Issues found:
    1. Build fails with 12 TypeScript errors in src/auth/controller.ts
    2. Mock implementation found: `return []` in getUserById() (line 45)
    3. TODO comment in production code: src/auth/service.ts:89
    4. Unit tests failing: "should hash password" (expected behavior not implemented)

    Please fix these issues and resubmit.
    ```

---

## 📊 SCAR State Monitoring Checklist

**When checking SCAR's status, verify:**

- [ ] **Read SCAR's latest output** (not just monitoring summary)
- [ ] **Check git commits in last 10 minutes**
  ```bash
  cd /home/samuel/.archon/worktrees/<project>/issue-<N>
  git log --since="10 minutes ago" --oneline
  ```
- [ ] **Look for blocking patterns in output:**
  - "awaiting approval"
  - "plan ready"
  - "ready for review"
  - "waiting for"
  - Questions posed to user
- [ ] **Verify file modifications are recent:**
  ```bash
  find . -type f -mmin -10
  ```
- [ ] **Check build status** (if build-related issue)
- [ ] **If NO activity for 10+ minutes:**
  - Read SCAR's full output
  - Determine what SCAR needs (approval, input, error resolution)
  - Provide it or notify user immediately

---

## ⚠️ Common Mistakes to Avoid

### ❌ MISTAKE: Trusting SCAR's Summaries

**Wrong:**
```
SCAR: "Implementation 100% complete. All tests pass. Build succeeds."
Supervisor: "Great! Marking as done."
```

**Right:**
```
SCAR: "Implementation 100% complete..."
Supervisor: "Running verification..."
Supervisor: [Spawns /verify-scar-phase]
Supervisor: "Verification shows 22 TypeScript errors. REJECTED."
```

---

### ❌ MISTAKE: Saying "Plan and Execute" Without Supervision

**Wrong:**
```
Supervisor: "@scar Plan and execute issue #141"
[Walks away for 3 hours]
User: "What's the status?"
Supervisor: "SCAR is working..."
User: [Checks] "SCAR has been waiting for approval for 3 hours!"
```

**Right:**
```
Supervisor: "@scar Create implementation plan for issue #141"
[Waits for plan]
SCAR: "Plan ready"
Supervisor: [Reviews plan]
Supervisor: "@scar Plan approved. Execute implementation."
[Monitors execution with /supervise-issue]
```

---

### ❌ MISTAKE: Not Using Args with Commands

**Wrong:**
```bash
# This won't work - missing required args
/verify-scar-phase
```

**Right:**
```bash
# All args provided
/verify-scar-phase consilio 123 2
```

**Command args explained:**
- `/verify-scar-phase <project> <issue-number> <phase-number>`
  - `<project>`: Project name (e.g., "consilio", "openhorizon")
  - `<issue-number>`: GitHub issue number (e.g., "123")
  - `<phase-number>`: Phase being verified (e.g., "2")

---

### ❌ MISTAKE: Not Checking for Mocks/Placeholders

**Wrong:**
```bash
# Only checking build, missing mocks
npm run build
# "Build passes, looks good!"
```

**Right:**
```bash
# Check build AND scan for mocks
npm run build
grep -r "TODO\|FIXME\|console.log\|mock\|return \[\]" src/
# "Found 5 TODO comments and 3 hardcoded returns - REJECTED"
```

---

## 🎯 Quick Reference Card

### When SCAR Claims "Complete"

```
1. ⚠️  DO NOT trust summary
2. ✅  Run /verify-scar-phase <project> <issue> <phase>
3. ✅  Check verification results
4. ✅  Post APPROVED or REJECTED with specifics
5. ✅  Update workflow-status.yaml
```

### When SCAR is "Working"

```
1. ⚠️  DO NOT assume it's making progress
2. ✅  Check git commits in last 10 min
3. ✅  Look for blocking patterns in output
4. ✅  Verify file modifications are recent
5. ✅  If no activity, check if stuck/blocked
```

### When Creating SCAR Instruction

```
1. ✅  Include full epic content
2. ✅  Add @scar mention
3. ✅  Wait 20s for acknowledgment
4. ✅  Verify worktree files created (60s)
5. ✅  Start monitoring (/supervise-issue)
```

---

## 📚 Related Documentation

**CRITICAL - Read these:**
- `/home/samuel/supervisor/docs/scar-integration.md` - Full SCAR integration guide
- `/home/samuel/supervisor/docs/supervisor-learnings/learnings/006-never-trust-scar-verify-always.md`
- `/home/samuel/supervisor/docs/supervisor-learnings/learnings/007-monitor-scar-state-not-just-existence.md`

**Additional resources:**
- `/home/samuel/supervisor/docs/supervisor-learnings/QUICK_REFERENCE.md` - All learnings index
- `/home/samuel/supervisor/templates/` - Epic, ADR, PRD templates

---

## 🚨 Emergency Troubleshooting

### SCAR Not Acknowledging

**Symptoms:** No "SCAR is on the case..." comment after 30+ seconds

**Solutions:**
1. Check GitHub webhook configuration
2. Re-post with explicit `@scar` mention at beginning of comment
3. Simplify instruction language
4. Check if SCAR is already working on max issues (10 concurrent limit)

---

### SCAR Stuck in Planning Mode

**Symptoms:** Long planning comment, no code files after 60+ seconds

**Solutions:**
1. Post new comment: "@scar Skip planning. Implement directly. Start NOW."
2. Be more specific in instruction (less for SCAR to "plan")
3. Include epic content directly in issue (eliminates planning need)

---

### SCAR Blocked on Approval

**Symptoms:** No commits in 10+ minutes, last output says "awaiting approval"

**Solutions:**
1. Read SCAR's plan/output
2. If plan is good: "@scar Plan approved. Proceed with implementation."
3. If plan needs changes: Provide specific feedback
4. Update monitoring to catch this faster (use `/supervise`)

---

### Build Fails But SCAR Claims Success

**Symptoms:** SCAR says "build succeeds" but actual build fails

**Solutions:**
1. SCAR may have run wrong build command (e.g., `vite build` instead of `npm run build`)
2. Post: "@scar Please run the ACTUAL build command: npm run build"
3. Include build command in acceptance criteria explicitly
4. Always run `/verify-scar-phase` to catch this

---

## 📋 Summary: Commands at a Glance

| Command | Who Uses It | Purpose | Args Required |
|---------|-------------|---------|---------------|
| `@scar [instruction]` | Supervisor → SCAR | Instruct SCAR to do work | Natural language |
| `/verify-scar-phase` | Supervisor | Verify SCAR's work | `<project> <issue> <phase>` |
| `/supervise-issue` | Supervisor | Auto-monitor one issue | `<issue-number>` |
| `/supervise` | Supervisor | Auto-monitor project | None |

---

**Remember:**
1. SCAR is GitHub-driven (not slash-command driven)
2. Always verify SCAR's work (never trust summaries)
3. Monitor SCAR's progress/state (not just existence)
4. Use supervisor commands with proper args
5. Check supervisor-learnings before complex operations

**For detailed instructions, always check `/home/samuel/supervisor/docs/`**
