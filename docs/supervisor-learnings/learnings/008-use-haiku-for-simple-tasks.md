# Learning 008: Use Haiku for Simple Tasks to Optimize Costs

**Category:** cost-optimization, tool-usage
**Severity:** medium
**Date Discovered:** 2026-01-17
**Status:** active

---

## Problem

Supervisor was using Sonnet (default model) for ALL subagent spawns, including simple tasks like:
- Binary status checks (SCAR acknowledged or not)
- Status polling every 2 minutes
- Simple comment parsing (extract PR URL)
- Health checks (server up/down)

**Cost impact:** High-frequency simple tasks using expensive model = unnecessary costs.

**Example:**
Monitoring an issue for 1 hour = 30 checks × Sonnet cost = $0.45/hour
(With full codebase before epic sharding: $4.50/hour!)

---

## Root Cause

**Lack of awareness:**
- Task tool supports `model` parameter but wasn't documented in CLAUDE.md
- No guidance on when to use which model
- Default behavior = Sonnet for everything

**No cost optimization strategy:**
- Epic sharding reduced tokens by 90% ✅ (excellent!)
- But model selection not utilized ❌ (missed opportunity)

---

## Solution

**Strategic model selection based on task complexity:**

### Use Haiku for Simple Tasks
```python
Task(
  subagent_type="Bash",
  model="haiku",  # ← 60-70% cheaper than Sonnet!
  prompt="Verify SCAR acknowledged instruction on issue #42",
  description="Verify SCAR started"
)
```

**Perfect for:**
- ✅ Binary checks (yes/no, exists/doesn't exist)
- ✅ Status polling (every 2min loops)
- ✅ Simple parsing (extract URL, read JSON)
- ✅ Health checks
- ✅ File existence verification
- ✅ Comment reading (no complex analysis)

### Keep Sonnet for Complex Tasks
```python
Task(
  subagent_type="general-purpose",
  # Defaults to Sonnet - complex thinking needed
  prompt="Supervise issue #42 through completion",
  description="Supervise issue #42"
)
```

**Use for:**
- ✅ Strategic planning (analyze.md, create-epic.md)
- ✅ Decision-making (approve-scar-plan.md)
- ✅ Comprehensive validation (verify-scar-phase.md)
- ✅ Error diagnosis
- ✅ Code quality assessment

---

## Impact

**Cost savings:**

**Before (Sonnet for everything):**
- Monitoring: $0.45/hour per issue
- 5 parallel issues: $2.25/hour
- 8-hour workday: $18/day
- Monthly: ~$540

**After (Haiku for simple tasks):**
- Monitoring: $0.04/hour per issue (91% savings!)
- 5 parallel issues: $0.20/hour
- 8-hour workday: $1.60/day
- Monthly: ~$48

**Total savings: $492/month (91% cost reduction on monitoring)**

Combined with epic sharding:
- Original cost (no optimizations): $45/hour = $10,800/month
- Epic sharding only: $4.50/hour = $1,080/month (90% savings)
- Epic + Haiku: $0.40/hour = **$96/month** (99% savings vs original!)

---

## Implementation

### Updated Files

1. **CLAUDE.md** - Added model selection guidance
2. **docs/model-selection-strategy.md** - Comprehensive strategy document
3. **docs/model-selection-quick-ref.md** - Quick reference card
4. **supervise-issue.md** - Added model selection note

### Key Guidance Added to CLAUDE.md

```markdown
### 🎯 Model Selection for Subagents

**Use Haiku (Fast & Cheap) for:**
- ✅ verify-scar-start.md - Binary check
- ✅ Simple monitoring loops
- ✅ Status checks
- ✅ Context handoff routing

**Use Sonnet (Default) for:**
- ✅ supervise-issue.md - Complex orchestration
- ✅ approve-scar-plan.md - Plan evaluation
- ✅ verify-scar-phase.md - Comprehensive validation
- ✅ analyze.md, create-epic.md, create-adr.md
```

---

## How to Apply

**When spawning ANY subagent, ask:**

1. **Is this task well-defined with simple output?**
   - Binary decision (yes/no, exists/doesn't)?
   - Simple extraction (get URL, read JSON)?
   - Status check (done/not done)?

   → **YES**: Add `model="haiku"`

2. **Does this require complex reasoning?**
   - Multi-step decision-making?
   - Quality assessment?
   - Strategic planning?

   → **YES**: Use default (Sonnet)

3. **Is this critical or security-sensitive?**
   - Architecture decisions?
   - Security validation?
   - Novel problem solving?

   → **YES**: Use Sonnet (or Opus for very critical)

**When in doubt, use Sonnet (default).** Cost of wrong model > cost of Sonnet.

---

## Specific Examples

### ✅ GOOD: Haiku for Simple Verification

```python
# Verify SCAR started (binary check)
Task(
  subagent_type="Bash",
  model="haiku",  # Perfect for binary checks!
  prompt="Check if SCAR acknowledged on issue #42 using verify-scar-start.md",
  description="Verify SCAR started"
)
```

**Why:** Binary question - "Did SCAR respond?" → Yes or No
**Savings:** ~$0.0135 per check vs Sonnet
**Frequency:** Once per issue start
**Total savings:** Moderate (not high-frequency)

### ✅ GOOD: Haiku for Status Polling

```python
# Monitor for completion (every 2min)
Task(
  subagent_type="Bash",
  model="haiku",  # High-frequency = max savings!
  prompt="Check issue #42 comments for completion signals",
  description="Poll issue status"
)
```

**Why:** Simple parsing - "Does comment contain 'PR created'?" → Yes or No
**Savings:** ~$0.0135 per check × 30 checks/hour = $0.405/hour saved
**Frequency:** Every 2min (high!)
**Total savings:** HIGH (this is where Haiku shines)

### ✅ GOOD: Sonnet for Complex Supervision

```python
# Supervise full issue lifecycle
Task(
  subagent_type="general-purpose",
  # No model param = Sonnet (correct!)
  prompt="Supervise issue #42 using supervise-issue.md instructions",
  description="Supervise issue #42"
)
```

**Why:** Complex orchestration - decisions, error handling, multi-step workflow
**Cost:** Higher, but necessary for quality
**Frequency:** Once per issue
**Quality:** Critical - don't compromise

### ❌ BAD: Haiku for Plan Approval

```python
# DON'T DO THIS
Task(
  subagent_type="general-purpose",
  model="haiku",  # ❌ WRONG - security checks need Sonnet!
  prompt="Evaluate SCAR's plan for security concerns",
  description="Approve plan"
)
```

**Why wrong:** Security evaluation requires complex reasoning
**Risk:** Might miss security issues
**Fix:** Remove model param (use Sonnet default)

---

## Monitoring Success

**Track these metrics:**

1. **Cost per project/month**
   - Monitor Haiku vs Sonnet usage ratio
   - Target: 60-70% Haiku for monitoring/simple tasks

2. **Task success rate by model**
   - Haiku should achieve 95%+ accuracy on simple tasks
   - If <90%, review which tasks using Haiku

3. **Retry rates**
   - Haiku tasks should have <5% retry rate
   - If >10%, task may be too complex for Haiku

4. **User escalations**
   - Monitor if Haiku errors cause user issues
   - Red flag if escalations increase after Haiku adoption

**Success criteria:**
- ✅ 60-70% cost reduction on monitoring tasks
- ✅ 95%+ accuracy on Haiku tasks
- ✅ <5% retry rate for Haiku
- ✅ No increase in user escalations

---

## Related Learnings

- **Learning 001:** Subagent Context Handoff - Use subagents to save context
- **Learning 003:** Use Specialized Tools - More efficient than bash
- **Epic Sharding:** 90% token reduction (combines with model selection for max savings)

---

## Quick Reference

**See:** `/home/samuel/supervisor/docs/model-selection-quick-ref.md`

**Decision tree:**
```
Simple/binary task?
  → YES: model="haiku"
  → NO: Complex reasoning needed?
         → YES: Sonnet (default)
         → NO: model="haiku"
```

---

## Key Takeaway

**Use the right model for the task complexity:**
- Haiku = Fast, cheap, perfect for simple tasks (60-70% savings)
- Sonnet = Complex thinking, current default (use for planning/decisions)
- Opus = Reserved for critical architecture (future use)

**Combined with epic sharding: 99% cost reduction vs unoptimized baseline!**

**Always balance cost vs quality - when in doubt, use Sonnet.**
