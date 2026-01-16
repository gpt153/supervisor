# Autonomous Supervisor - Complete Guide

**Created:** 2026-01-15 (Stockholm time)
**Purpose:** Explain autonomous behavior and when to use what

---

## 🎯 Core Principle: You Just Talk, Supervisor Does Everything

**YOU (the user):**
- Say things in natural language
- "Plan feature: user authentication"
- "Check progress on issue 123"
- "Is SCAR done yet?"
- "Test the login feature"

**SUPERVISOR (autonomous AI):**
- Automatically understands what you want
- Executes the right workflow
- Uses the right tools
- Reports back with results

**YOU NEVER NEED TO KNOW:**
- Which subagent to spawn
- Which MCP tool to use
- How to verify SCAR's work
- When to run tests

---

## 🤖 What Supervisor Does Automatically

### 1. Planning Features

**You say:** "Plan feature: user authentication"

**Supervisor automatically:**
1. Analyzes complexity (0-4)
2. Searches Archon RAG for similar patterns
3. Spawns meta-orchestrator subagent
4. Subagent creates epic + ADRs + feature request
5. Creates Archon MCP project to track work
6. Commits to planning repo
7. Creates GitHub issue with @scar mention
8. Waits 20 seconds
9. Verifies SCAR acknowledged
10. Reports: "✅ Epic created, SCAR working on it"

**You don't need to say:**
- "spawn subagent"
- "create epic"
- "verify SCAR"
- "check acknowledgment"

### 2. Checking Progress

**You say:** "How's issue 123 going?" OR "Is SCAR done yet?"

**Supervisor automatically:**
1. Reads GitHub issue comments
2. Checks SCAR's latest update
3. Looks at worktree for file changes
4. Calculates progress percentage
5. Estimates completion time
6. Reports: "SCAR is 60% done. Created 3 files. ETA: 2 hours"

### 3. Validating Work

**You say:** "Is the work good?" OR "Verify issue 123"

**Supervisor automatically:**
1. Spawns verification subagent
2. Subagent checks:
   - All files exist
   - Build succeeds
   - Tests pass
   - No mocks in production code
3. If APPROVED:
   - Posts "@scar APPROVED ✅ Create PR" to issue
   - Reports to you: "✅ All checks passed!"
4. If REJECTED:
   - Posts detailed feedback to GitHub
   - Reports to you: "❌ Found 3 issues: [details]"

### 4. Testing Features

**You say:** "Test the login feature" OR "Does the UI work?"

**Supervisor automatically:**
1. Finds relevant worktree
2. Spawns Playwright test subagent
3. Subagent runs E2E tests
4. Captures screenshots if failures
5. Reports: "✅ All 15 tests passed" or "❌ 2 failures: [details]"

### 5. Getting Status

**You say:** "What's the status of Consilio?" OR "Show me progress"

**Supervisor automatically:**
1. Reads workflow-status.yaml
2. Checks Archon MCP for tasks
3. Lists all epics with status
4. Reports: "5 epics: 2 done, 2 in progress (auth 80%, email 40%), 1 blocked"

---

## 🗄️ Archon MCP Integration

**Supervisor uses Archon MCP automatically for:**

### Task Tracking

**When you say:** "Plan feature: authentication"

**Supervisor creates Archon tasks:**
- "Research JWT libraries" (status: todo)
- "Create epic" (status: todo)
- "Instruct SCAR" (status: todo)
- "Verify implementation" (status: todo)
- "Test authentication" (status: todo)

**As work progresses, supervisor updates:**
- Epic created → mark "Create epic" as done
- SCAR starts → mark "Instruct SCAR" as done
- SCAR finishes → mark "Verify implementation" as in_progress
- Verification passes → mark as done, start "Test authentication"

**You can always ask:** "What tasks are left?" and supervisor checks Archon MCP.

### Knowledge Search

**When creating epics, supervisor automatically:**
1. Searches Archon RAG for similar features
2. Finds code examples
3. Uses best practices in epic
4. You get better quality epics without asking

**Example:**
```
You: "Plan feature: JWT authentication"
→ Supervisor searches RAG: "JWT authentication patterns"
→ Finds 5 relevant docs + 3 code examples
→ Uses them to create comprehensive epic
→ You get production-ready specifications
```

### Decision Documentation

**When ADR is created, supervisor automatically:**
1. Stores it in Archon MCP as document
2. Makes it searchable for future reference
3. Links it to related tasks

**Benefit:** Later you can ask "Why did we choose JWT?" and supervisor finds the ADR.

---

## 🎯 Proactive Behaviors

**Supervisor doesn't wait for you to ask - it proactively:**

### 1. Verifies SCAR Acknowledgment

**After creating GitHub issue:**
- Waits exactly 20 seconds
- Checks for "SCAR is on the case..." comment
- If missing: Alerts you + re-posts issue
- If found: Reports "✅ SCAR acknowledged"

**You never waste hours waiting for SCAR that never started!**

### 2. Validates When SCAR Claims Done

**When SCAR posts "Implementation complete":**
- Immediately spawns verification subagent
- Runs comprehensive checks
- Reports results to you
- Posts approval/rejection to GitHub

**You don't need to remember to verify!**

### 3. Monitors Progress

**Every 2 hours while SCAR works:**
- Checks for new comments
- Checks worktree for changes
- Reports progress to you

**You stay informed without asking!**

### 4. Warns About Context

**When context reaches 60% (120K/200K tokens):**
- Alerts you: "Context at 60%, will handoff at 80%"
- Starts preparing handoff document

**At 80%:**
- Creates complete handoff document
- Saves to `.bmad/handoff-*.md`
- Informs you to start new session

**No context loss, no repeated work!**

### 5. Searches Best Practices

**When creating epics:**
- Automatically searches Archon RAG
- Finds similar patterns
- Uses proven approaches
- You get better quality without asking

### 6. Answers SCAR's Questions

**When SCAR asks in GitHub issue:**
- Reads epic to check if answer is there
- If yes: Quotes relevant section
- If no: Asks you for clarification

**Only bothers you when truly needed!**

### 7. Posts Validation Feedback

**When validation fails:**
- Immediately posts detailed feedback
- Includes file paths and line numbers
- Suggests fixes based on epic specs

**SCAR knows exactly what to fix!**

---

## 🔀 Decision Trees

**How supervisor decides what to do:**

### Request Classification

```
You say: "Plan feature: X"
→ Supervisor thinks: "Planning workflow"
→ Detects complexity
→ Spawns appropriate subagent
→ Creates epic + GitHub issue

You say: "Check issue 123"
→ Supervisor thinks: "Status check"
→ Reads GitHub comments
→ Checks worktree files
→ Reports progress

You say: "Verify issue 123"
→ Supervisor thinks: "Validation workflow"
→ Spawns verification subagent
→ Reports results

You say: "How should we do X?"
→ Supervisor thinks: "Research workflow"
→ Searches Archon RAG
→ Summarizes findings
```

### Tool Selection

```
Need to run tests?
→ Task tool (Bash subagent)

Need to test UI?
→ Task tool (Playwright)

Need to verify SCAR's work?
→ /verify-scar-phase subagent

Need to track tasks?
→ Archon MCP

Need best practices?
→ Archon RAG

Need to create epics?
→ Task tool (meta-orchestrator)

Need SCAR status?
→ Bash (gh issue view)
```

### When to Spawn Subagents

```
Complex task (>10 steps)?
→ Spawn subagent

Reading multiple files?
→ Spawn subagent

Running commands?
→ Spawn subagent

Simple 1-2 file read?
→ Use Read tool directly

Simple status check?
→ Use Bash directly
```

**Default: Spawn subagent (conserves context)**

---

## 📋 Natural Language Examples

**Here are things you can say, and what supervisor does:**

### Planning
- "Plan feature: user authentication" → Full planning workflow
- "Add JWT to the API" → Creates epic + GitHub issue
- "Implement email verification" → Planning + SCAR instruction
- "Fix the login bug" → Simple GitHub issue (no epic needed)

### Monitoring
- "Check issue 123" → Progress report
- "Is SCAR done yet?" → Status + ETA
- "What's SCAR working on?" → Current issue status
- "How's Consilio going?" → Project overview

### Validation
- "Verify issue 123" → Comprehensive validation
- "Is the work good?" → Validation + feedback
- "Test the authentication" → Spawns test subagent
- "Does the UI work?" → Playwright E2E tests

### Research
- "How should we implement JWT?" → RAG search + summary
- "What's the best practice for X?" → Knowledge search
- "Show me code examples for Y" → Code example search
- "Why did we choose Z?" → Finds ADR

### Status
- "Show me all tasks" → Archon MCP task list
- "What's left to do?" → Pending tasks
- "What epics are done?" → Epic completion status
- "What's blocking progress?" → Blocked issues/tasks

---

## ✅ Benefits for You

### You Don't Need to Know

**Technical details handled automatically:**
- ❌ Which subagent to spawn
- ❌ Which MCP tool to use
- ❌ How to verify SCAR's work
- ❌ When to run tests
- ❌ How to check SCAR acknowledgment
- ❌ Where worktrees are located
- ❌ How to search for best practices

**You just say what you want in plain English!**

### Supervisor is Always Ahead

**Proactive behaviors:**
- ✅ Verifies SCAR acknowledgment automatically
- ✅ Validates work when SCAR claims done
- ✅ Monitors progress every 2 hours
- ✅ Warns about context usage
- ✅ Searches best practices when planning
- ✅ Answers SCAR's questions from epic
- ✅ Posts detailed feedback when validation fails

**You don't need to remember anything!**

### Context Conservation

**Subagent usage:**
- 90% context savings (subagents use their own tokens)
- Automatic handoff at 80%
- Multiple subagents work in parallel
- You get more work done per session

**You can plan multiple features in one conversation!**

### Quality Assurance

**Automatic validation:**
- Every SCAR implementation is verified
- Tests run automatically
- No mocks in production code
- Build must succeed
- All requirements checked

**You get production-quality code!**

---

## 🚀 Quick Start Examples

### Example 1: Plan Your First Feature

**You:** "Plan feature: user authentication with JWT"

**Supervisor does (automatically):**
```
1. Analyzing complexity... Level 2 (medium feature)
2. Searching Archon RAG for JWT patterns...
3. Found 5 relevant docs, using best practices
4. Spawning meta-orchestrator subagent...
5. ✅ Epic created: .bmad/epics/001-user-auth.md
6. ✅ ADR created: .bmad/adr/002-jwt-auth.md
7. ✅ GitHub issue created: #123
8. Waiting 20s for SCAR acknowledgment...
9. ✅ SCAR acknowledged: "Starting implementation"
10. Monitoring progress...

Next steps:
- SCAR is implementing authentication
- I'll check progress every 2 hours
- I'll validate automatically when SCAR finishes
- You'll get notified of any issues

Current status: In progress (ETA: 4 hours)
```

**You just said one sentence. Supervisor handled everything.**

### Example 2: Check Progress

**You:** "How's issue 123 going?"

**Supervisor reports:**
```
Checking issue #123...

SCAR's latest update (45 min ago):
- "Created backend/auth/jwt.ts (234 lines)"
- "Added unit tests (15 tests, all passing)"
- "Working on integration tests now"

Files in worktree:
- backend/auth/jwt.ts ✅
- backend/auth/jwt.test.ts ✅
- backend/middleware/authenticate.ts (in progress)

Progress: 60% complete
ETA: 2 hours

Status: On track ✅
```

**You got comprehensive update without technical knowledge.**

### Example 3: Validate Work

**You:** "Is the authentication work good?"

**Supervisor validates:**
```
Spawning verification subagent for issue #123...

Checking files... ✅
Running build... ✅
Running tests... ✅ (47/47 passed)
Checking for mocks... ✅ (none found)
Verifying requirements...
  ✅ MUST: JWT generation
  ✅ MUST: Token validation
  ✅ MUST: Refresh token flow
  ✅ SHOULD: Rate limiting
  ✅ SHOULD: Token blacklist

Result: APPROVED ✅

Posted to GitHub: "@scar APPROVED ✅ Create PR"

All checks passed! SCAR can now create pull request.
```

**You got complete quality assurance automatically.**

---

## 📊 Comparison: Before vs After

### Before (Manual)

**You had to:**
1. Know which subagent to spawn
2. Remember to verify SCAR acknowledgment
3. Manually check progress
4. Remember to run tests
5. Know where worktrees are
6. Understand validation protocol
7. Search for best practices yourself
8. Track context usage manually

**Result:** Overwhelming, easy to miss steps

### After (Autonomous)

**You just say:**
1. "Plan feature: X"
2. "Check progress"
3. "Verify the work"

**Supervisor does:**
- Everything automatically
- Proactively monitors
- Validates comprehensively
- Conserves context
- Uses best practices
- Tracks everything

**Result:** Simple, reliable, comprehensive

---

## ✅ Key Takeaways

1. **You speak natural language** - Supervisor understands intent
2. **Supervisor is autonomous** - Handles all technical details
3. **Proactive behavior** - Doesn't wait to be asked
4. **Archon MCP integrated** - Task tracking and knowledge search
5. **Context conservation** - Subagents save 90% tokens
6. **Quality assurance** - Automatic validation and testing
7. **Always informed** - Regular progress updates

**You focus on what to build. Supervisor handles how to build it.**

---

**The supervisor is your autonomous project manager, QA lead, and architect - all in one.** 🚀
