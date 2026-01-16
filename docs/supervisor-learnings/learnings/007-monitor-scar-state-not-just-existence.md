# Learning 007: Monitor SCAR's State, Not Just Existence

**Date:** 2026-01-16
**Severity:** CRITICAL
**Category:** scar-integration
**Tags:** monitoring, scar-state, stuck-workflows, approval-blocks
**Projects Affected:** All projects using SCAR

---

## Problem

**Supervisor says:** "SCAR is working, I'm monitoring it..."

**User comes back hours later:** "What's the status?"

**Supervisor checks:** "Oh... SCAR has been stuck waiting for approval for 3 hours"

**Impact:** Hours of wasted time with zero progress despite "active monitoring"

---

## Symptoms

### The Pattern

1. Supervisor tells SCAR to "plan and execute" a task
2. Supervisor says "I'm monitoring SCAR's progress"
3. Supervisor spawns monitoring subagent (checks every 2 minutes)
4. User returns hours later expecting progress
5. Turns out: SCAR finished planning in first 10 minutes
6. SCAR has been **waiting for approval** for hours
7. Monitoring subagent checked 90 times but never noticed

### What User Sees

```
User: "Give me an update on SCAR's progress"
Supervisor: "SCAR is working on the implementation..."

[User checks manually]

User: "SCAR has been stuck waiting for approval for 3 hours!"
Supervisor: "Oh... let me check..."
Supervisor: "You're right, SCAR completed planning and needs approval to continue"
```

**User reports:** "I have lost countless hours now because supervisor has said that SCAR is working and will continue monitoring. When I come back later and tell it give me update it just restates the same thing."

---

## Root Cause

### Monitoring Subagent Checks Wrong Thing

**What monitoring subagent checks:**
- ✅ SCAR process exists
- ✅ No error messages
- ✅ Files were modified (timestamps)
- ✅ Git commits exist

**What monitoring subagent DOESN'T check:**
- ❌ Is SCAR waiting for input?
- ❌ Is SCAR blocked on approval?
- ❌ Has SCAR made progress in last 10 minutes?
- ❌ What state is SCAR in? (planning, executing, waiting)

### The "Plan and Execute" Trap

When supervisor tells SCAR to "plan and execute":

```
Supervisor → SCAR: "Plan and execute issue #123"

SCAR does:
1. ✅ Read issue
2. ✅ Create plan
3. ✅ Write plan to file
4. 🛑 "Plan ready, awaiting approval before implementation"
5. [WAITS FOREVER]

Monitoring subagent sees:
- Process running: ✅
- Files modified: ✅
- No errors: ✅
- Conclusion: "SCAR is working!" ❌ WRONG
```

**Reality:** SCAR finished work and is idle, but supervisor thinks it's actively working.

---

## Solution

### Monitor SCAR's STATE, Not Just Existence

**ALWAYS check:**

1. **What state is SCAR in?**
   - Planning? Executing? Waiting? Idle?

2. **Is SCAR making progress?**
   - Has code changed in last 10 minutes?
   - Are new commits appearing?
   - Is SCAR asking questions or outputting logs?

3. **Is SCAR blocked?**
   - Waiting for approval?
   - Waiting for user input?
   - Stuck on error?

### Correct Monitoring Pattern

**Option 1: Check SCAR's actual output**
```bash
# Get SCAR's last output (not monitoring subagent's summary)
# Check if SCAR is waiting for input

If last output contains:
- "awaiting approval"
- "ready for review"
- "plan complete"
- "waiting for"
→ SCAR is BLOCKED, notify user immediately
```

**Option 2: Verify progress, not existence**
```bash
# Check if code actually changed in last 10 minutes
cd /path/to/worktree
RECENT_CHANGES=$(git log --since="10 minutes ago" --oneline | wc -l)

if [ $RECENT_CHANGES -eq 0 ]; then
  echo "⚠️ SCAR hasn't committed anything in 10 minutes"
  echo "Checking if SCAR is stuck..."
  # Read SCAR's output to see if waiting for approval
fi
```

**Option 3: Ask SCAR directly**
```bash
# Ping SCAR to verify it's actively working
# If SCAR responds with "waiting for approval" → blocked
# If SCAR responds with progress update → working
# If SCAR doesn't respond → stuck/crashed
```

---

## Correct Workflow

### Before (WRONG)

```
Supervisor: "SCAR, plan and execute issue #141"
SCAR: [Plans, then waits for approval]
Supervisor: "Spawning monitoring subagent..."
Monitoring: [Checks every 2 min, sees process exists, reports "working"]
Supervisor: "SCAR is working, I'll continue monitoring..."

[3 hours pass]

User: "What's the status?"
Supervisor: "SCAR is working on it..."
User: "Can you check?"
Supervisor: [Finally looks at SCAR's output]
Supervisor: "Oh... SCAR finished planning 3 hours ago and needs approval"
```

### After (CORRECT)

```
Supervisor: "SCAR, plan and execute issue #141"
SCAR: [Plans, then waits for approval]
Supervisor: "Spawning monitoring subagent..."
Monitoring: [Checks SCAR's output, sees "awaiting approval"]
Monitoring: "⚠️ SCAR completed planning and is waiting for approval"
Supervisor: [Reads plan, approves if good]
Supervisor: "SCAR, plan approved. Proceed with implementation."
SCAR: [Continues executing]

[OR if supervisor needs user input:]

Monitoring: "⚠️ SCAR stuck waiting for approval"
Supervisor → User: "SCAR finished planning. Review needed before continuing."
```

---

## Monitoring Checklist

**When monitoring SCAR, check these EVERY time:**

- [ ] **Read SCAR's latest output** (not just monitoring summary)
- [ ] **Verify SCAR is actively working** (code changes in last 10 min)
- [ ] **Check for blocking patterns:**
  - [ ] "awaiting approval"
  - [ ] "plan ready"
  - [ ] "ready for review"
  - [ ] "waiting for"
  - [ ] Questions posed to user
- [ ] **Verify git activity:**
  - [ ] New commits appearing regularly
  - [ ] File modifications recent (< 10 min ago)
- [ ] **Check build status** (if applicable)
  - [ ] Is SCAR fixing errors or stuck on same error?

**If ANY blocking pattern detected:**
1. Read SCAR's full output
2. Determine what SCAR needs (approval, input, error resolution)
3. Either provide it yourself or notify user immediately

---

## Prevention

### 1. Never Say "Plan and Execute" Without Supervision

**Instead of:**
```
Supervisor: "SCAR, plan and execute issue #141"
[Walks away]
```

**Do this:**
```
Supervisor: "SCAR, create implementation plan for issue #141"
[Wait for plan]
SCAR: "Plan ready"
Supervisor: [Reviews plan]
Supervisor: "Plan approved. Execute implementation."
[Now monitor execution specifically]
```

### 2. Set Approval Expectations Upfront

**Tell SCAR explicitly:**
```
SCAR: If you need approval at any point, state clearly:
"🛑 BLOCKED: Waiting for approval on [specific item]"

Do NOT silently wait. Make blocking status obvious.
```

### 3. Monitoring Subagent Must Check State

**Update monitoring subagent instructions:**
```
Your job is NOT to verify SCAR exists.
Your job is to verify SCAR is MAKING PROGRESS.

Every check must include:
1. Read SCAR's latest output (last 50 lines)
2. Check git log (last 10 minutes)
3. Identify if SCAR is:
   - Actively working (commits, code changes)
   - Blocked (waiting for approval/input)
   - Stuck (no progress, no blocking message)
4. Report ACTUAL state, not assumptions

If SCAR is blocked or stuck:
- Notify supervisor IMMEDIATELY
- Do NOT report "SCAR is working"
```

### 4. User Reports Take Priority

**When user says "check if SCAR is actually working":**
- This means monitoring has failed
- Stop trusting monitoring reports
- Manually verify SCAR's state
- Fix monitoring process before continuing

---

## Red Flags

**Patterns that indicate monitoring is broken:**

1. **Repetitive Status Reports**
   - Supervisor says same thing multiple times
   - "SCAR is working on implementation..." (said 5 times)
   - No specific progress details

2. **No Recent Commits**
   - SCAR "working" for 1+ hours
   - But no git commits in last 30 minutes
   - Likely stuck or blocked

3. **User Has to Ask for Verification**
   - User: "Can you check if SCAR is actually working?"
   - This means you failed to monitor properly
   - Should have caught this yourself

4. **Time Discrepancy**
   - "SCAR has been working for 2 hours"
   - But only 10 minutes of actual work visible
   - Gap = stuck time you didn't notice

---

## Key Principles

### 1. Process Existence ≠ Active Work

Just because SCAR is running doesn't mean SCAR is working.

### 2. "Checking Every 2 Minutes" Is Useless

If you check the wrong thing 90 times, you still get wrong answers 90 times.

### 3. Read Output, Don't Assume State

SCAR's actual output tells you the truth. Your assumptions don't.

### 4. Block Detection Is Core Responsibility

If SCAR sits idle for 3 hours waiting for approval, that's supervisor failure.

---

## Automation

**Create a smart SCAR state checker:**

```bash
#!/bin/bash
# check-scar-state.sh

WORKTREE="/home/samuel/.archon/worktrees/consilio/issue-${ISSUE_NUM}"

cd "$WORKTREE"

echo "=== SCAR State Check ==="

# Check recent commits
RECENT_COMMITS=$(git log --since="10 minutes ago" --oneline | wc -l)
echo "Recent commits (last 10 min): $RECENT_COMMITS"

# Check file modifications
RECENT_MODS=$(find . -type f -mmin -10 | wc -l)
echo "Files modified (last 10 min): $RECENT_MODS"

# Check for blocking patterns in output
# (This requires access to SCAR's output stream)
if grep -q "awaiting approval" scar-output.log 2>/dev/null; then
  echo "⚠️ BLOCKED: SCAR is waiting for approval"
  exit 1
fi

if [ $RECENT_COMMITS -eq 0 ] && [ $RECENT_MODS -eq 0 ]; then
  echo "⚠️ WARNING: No activity in last 10 minutes"
  echo "SCAR may be stuck or blocked"
  exit 2
fi

echo "✅ SCAR appears to be actively working"
```

---

## Related Learnings

- Learning 005: SCAR idle time after completion
- Learning 006: Never trust SCAR's summaries

---

## Impact

**Time waste per incident:** 2-4 hours of zero progress

**Frequency:** Happens repeatedly across all projects

**Fix time:** 2 minutes if caught immediately

**Prevention time:** 5 minutes to set up proper monitoring

---

## Notes

- This issue is distinct from Learning 005 (which is about SCAR finishing and not notifying)
- This is about SCAR getting blocked mid-workflow and monitoring not detecting it
- The core problem is monitoring EXISTENCE instead of monitoring PROGRESS
- User has explicitly reported this pattern multiple times: "countless hours lost"

---

**Remember: If you can't prove SCAR is making progress, assume it's stuck until verified.**
