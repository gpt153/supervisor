# RCA: Supervisor Autonomy Failure

**Date:** 2026-01-17
**Issue:** Supervisors say "I'm monitoring SCAR" but don't actually work autonomously. User returns hours later to find SCAR was blocked the entire time.
**Impact:** Countless hours wasted with zero progress
**Severity:** CRITICAL - Breaks entire workflow

---

## Problem Statement

**User Experience:**
1. User: "Plan feature X"
2. Supervisor: "Creating epic, posting to SCAR, monitoring progress"
3. User leaves, comes back hours later
4. User: "What's the status?"
5. Supervisor checks and discovers: "Oh... SCAR has been blocked waiting for approval for 3 hours"

**Pattern:** Supervisors passively "monitor" but don't actively "supervise"

---

## Root Causes

### 1. **INSTRUCTION MISMATCH: Descriptive vs Prescriptive**

**Current instructions say WHAT to check:**
```markdown
Every 2 minutes while SCAR is working:
  - Check issue for new comments
  - Check SCAR's actual output for blocking patterns
  - Look for: "awaiting approval", "plan ready", "waiting for"
```

**Missing: WHAT TO DO when you find it:**
```markdown
❌ NO ACTION SPECIFIED
```

**Supervisors interpret this as:**
- "Monitor" = Watch and report
- NOT "Monitor" = Watch and fix

### 2. **NO EXPLICIT ACTION LOOPS**

**Current:**
```markdown
3. Every 2 minutes while SCAR is working:
   - Check issue for new comments
```

**Problem:** "Every 2 minutes" is passive instruction. Supervisor:
- Checks once
- Thinks "I checked"
- Stops

**Missing:**
```markdown
LOOP until complete:
  Check issue
  IF blocked THEN unblock
  IF complete THEN verify
  WAIT 2 minutes
END LOOP
```

### 3. **COMMAND CONFUSION**

**From research:**
- Supervision docs use: `@scar /command-invoke execute`
- User mentions: `@scar /invoke-command execute`
- Actual format: Need to verify which is correct

**Supervisor uncertainty:**
- "Should I use `/command-invoke` or `/invoke-command`?"
- "What's the difference between `execute` and `execute-github`?"
- "When do I use `plan-feature` vs `plan-feature-github`?"

### 4. **NO SCAR COMMAND REFERENCE**

**Current state:**
- Instructions mention @scar commands
- But don't document ALL available commands
- No clear mapping of situation → command

**Supervisor doesn't know:**
- Full list of `/command-invoke` options
- When to use each command
- What arguments each command expects
- How to verify SCAR received command correctly

### 5. **PASSIVE "PROACTIVE BEHAVIORS" SECTION**

**Current location:** Middle of 800-line CLAUDE.md

**Current language:**
```markdown
## 🎯 Proactive Behaviors (Do These Automatically)

2. When SCAR posts "Implementation complete":
   - NEVER trust the summary without verification
   - Immediately spawn build verification subagent
```

**Problems:**
- Buried in huge file
- Says "do these automatically" but doesn't enforce it
- Supervisor can skip/forget

### 6. **INCONSISTENT INSTRUCTIONS ACROSS PROJECTS**

**Old template (supervisor-service/CLAUDE.md):**
- "Every 2 hours while SCAR is working"
- No Learning 006/007 integration
- No explicit command usage

**New template (consilio/health-agent/CLAUDE.md):**
- "Every 2 minutes"
- Has Learning 006/007
- Still missing action loops

**Result:** Some projects never got critical updates

### 7. **MISSING IF/THEN DECISION TREES**

**Current:**
```markdown
Look for: "awaiting approval", "plan ready", "waiting for"
```

**Missing explicit branching:**
```
IF SCAR output contains "awaiting approval"
  THEN:
    Read SCAR's plan
    IF plan reasonable:
      → Post: @scar /command-invoke execute {plan-file} {branch-name}
    ELSE:
      → Ask user for approval
ELSE IF no commits in 10 minutes
  THEN:
    Read SCAR's output
    Determine if blocked or stuck
    Take corrective action
```

---

## Evidence

### From User's Description

> "oh i didn't check every 2 minutes"

**Meaning:** Supervisor either:
- Checked once, stopped (no loop enforcement)
- OR interpreted "every 2 min" as suggestion not command

> "i forgot that i need to @mention scar when it's finished planning"

**Meaning:** Supervisor:
- Detected SCAR finished planning
- Didn't know next action was to @mention with execute command
- Missing IF/THEN mapping

### From Learning 007

**Title:** "Monitor SCAR's State, Not Just Existence"

**Problem identified:**
- Supervisors check if SCAR process exists
- Don't check if SCAR is making progress
- Don't detect blocking patterns

**This exact issue has been documented but not fixed in instructions**

### From SCAR Supervision Commands

**Found in:** `/home/samuel/.archon/workspaces/consilio/.claude/commands/supervision/`

**What exists:**
- `supervise-issue.md` - Complete supervision workflow
- `build-scar-instruction.md` - Command formatting guide
- Explicit 20s acknowledgment check
- Polling loop every 2 minutes
- Verification protocol

**Problem:** These exist as COMMANDS but not in CLAUDE.md as MANDATORY BEHAVIORS

---

## SCAR PIV Loop (Discovered)

From `/home/samuel/course/agentic-coding-course/module_10/.claude/commands/core_piv_loop/`:

**P**rime: Load project context
- Analyze structure
- Read documentation
- Understand current state

**I**(Plan): Create implementation plan
- `/command-invoke plan-feature-github`
- Research codebase
- Generate `.agents/plans/{feature}.md`
- **STOPS and waits for approval**

**V**(Execute): Execute plan
- `/command-invoke execute-github {plan}.md {branch}`
- Implement code
- Run tests
- Create PR
- **STOPS and waits for approval**

**CRITICAL INSIGHT:** SCAR has built-in approval gates. Supervisor MUST:
1. Detect when SCAR waiting
2. Approve automatically (if plan reasonable)
3. Or escalate to user (if plan needs review)

---

## SCAR Commands (Discovered)

From implementation workspace commands:

### Available Commands

```markdown
@scar /command-invoke plan-feature-github "{description}"
```
- Creates implementation plan
- Outputs to `.agents/plans/{feature}.md`
- Waits for approval before executing

```markdown
@scar /command-invoke execute-github .agents/plans/{plan}.md feature-{branch}
```
- Executes existing plan
- Creates feature branch
- Implements all tasks
- Runs validation
- Creates PR

```markdown
@scar /command-invoke fix-issue {number}
```
- Bug fix workflow
- RCA → Fix → Test → PR
- Single command, auto-execute

```markdown
@scar /command-invoke rca
```
- Root cause analysis only
- No implementation
- Documents findings

### Missing from Supervisor Instructions

**Supervisors don't have:**
- Complete command reference
- When to use each command
- What to expect from each command
- How to verify SCAR started correctly

---

## Why SCAR Often Doesn't Start

### From Supervision Commands

**SCAR should acknowledge within 20 seconds:**
```
SCAR is on the case... 🚀
```

**If no acknowledgment:**
1. Wait 40s, check again (Retry 1)
2. Wait 60s, check again (Retry 2)
3. After 3 failures → Escalate

**Common reasons for no-start:**
1. **Wrong command format**
   - Used `/invoke-command` instead of `/command-invoke`
   - Missing `@scar` mention
   - Syntax error in command

2. **Missing context**
   - `/command-invoke execute` without plan file path
   - `/command-invoke plan` without description

3. **GitHub webhook issues**
   - Webhook not configured
   - SCAR server down
   - Delivery failure

4. **Supervisor doesn't retry**
   - Posts command once
   - Assumes SCAR got it
   - Doesn't verify acknowledgment

**What supervisor SHOULD do (but doesn't):**
```bash
Post @scar command
Wait 20s
IF no acknowledgment:
  Retry with same command
  Wait 40s
  IF no acknowledgment:
    Retry with simpler phrasing
    Wait 60s
    IF no acknowledgment:
      SOLVE THE ISSUE (don't message user)
      Check webhook logs
      Verify SCAR server status
      Try alternative notification method
```

---

## Solution Design (BMAD Approach)

### Level 0: Simple Enhancement (Current attempt)

**What we tried:**
- Added "Proactive Behaviors" section
- Documented Learning 006/007
- Added verification checklist

**Why it failed:**
- Still descriptive, not prescriptive
- No enforcement mechanism
- Easy to skip/forget

### Level 1-2: Systematic Redesign (NEEDED)

**Approach:** Rebuild from ground up using BMAD principles

**Core principles:**
1. **Explicit loops** - NOT "every 2 minutes" BUT "LOOP until complete"
2. **IF/THEN trees** - Every decision explicitly mapped
3. **Command reference** - Complete SCAR command documentation
4. **Action-first** - Not "monitor" but "supervise and fix"
5. **Enforcement** - Instructions as executable algorithm

### Architecture Decision

**Current problem:** Instructions are documentation

**Solution:** Instructions as executable workflows

**New structure:**
```markdown
# SUPERVISOR CLAUDE.md

## 🚨 CRITICAL: Autonomous Behavior Contract

When user says "plan feature X":

YOU MUST execute this EXACT workflow:
  [Explicit algorithm]
  [No room for interpretation]
  [Every decision mapped]

IF you deviate from this workflow:
  → You are not following instructions
  → Fix immediately

## 📋 SCAR Command Reference (REQUIRED READING)

Complete command documentation with:
  - Syntax
  - Arguments
  - Expected behavior
  - When to use
  - Error handling

## 🔁 Supervision Loops (MANDATORY)

[Explicit loop implementations]
[IF/THEN decision trees]
[Action specifications]
```

---

## Next Steps

1. **Create comprehensive SCAR command reference**
   - Document ALL `/command-invoke` commands
   - Syntax, arguments, expected behavior
   - Mandatory reading for supervisors

2. **Redesign CLAUDE.md with explicit algorithms**
   - Replace descriptions with executable workflows
   - IF/THEN trees for every decision
   - Explicit LOOP structures

3. **Front-load critical behaviors**
   - Move all autonomous behaviors to TOP
   - Make them contracts, not suggestions
   - Clear violation consequences

4. **Update all project CLAUDE.md files**
   - Apply new template to ALL projects
   - Mark old templates as OUTDATED
   - Force supervisors to request updates

5. **Add SCAR startup verification**
   - Explicit 20s check
   - 3-retry protocol
   - Automatic troubleshooting

6. **Test with real scenarios**
   - Monitor supervisor behavior
   - Verify autonomous operation
   - Iterate based on failures

---

## Success Metrics

**Before:**
- Supervisor says "monitoring"
- User returns hours later
- SCAR was blocked the entire time
- Zero progress

**After:**
- Supervisor runs autonomous loop
- Detects SCAR blocked within 2 minutes
- Unblocks automatically (or escalates immediately)
- Continuous progress OR immediate user notification

---

## Document Status

- ✅ Root cause analysis complete
- ✅ Evidence compiled
- ✅ Solution approach designed
- ⏳ Implementation pending

**Next:** Create new supervisor instruction template
