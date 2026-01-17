# Model Selection Strategy: Optimizing Claude Model Usage

**Version:** 1.0
**Last Updated:** 2026-01-17
**Status:** Active

---

## Overview

The supervisor system can use different Claude models strategically to optimize cost and performance:
- **Claude Haiku** - Fast, cheap, simple tasks
- **Claude Sonnet** - Complex thinking, planning, architecture
- **Claude Opus** - Reserved for novel/critical decisions (future use)

**Key insight:** Use the right model for the task complexity.

---

## Model Capabilities & Costs

### Claude Haiku (Fast & Economical)
**Best for:**
- Binary decisions (yes/no, exists/doesn't exist)
- Status polling (check if done, read comments)
- Simple parsing (extract PR URL, read JSON)
- Routine verification (acknowledgment checks)

**Characteristics:**
- ⚡ Fast response time (~1-2s)
- 💰 60-70% cheaper than Sonnet
- 🎯 Accurate for well-defined tasks
- ⚠️ Limited complex reasoning

**Cost:** ~$0.25 per million input tokens, ~$1.25 per million output tokens

### Claude Sonnet 4.5 (Balanced - Current Default)
**Best for:**
- Strategic planning and decision-making
- Code analysis and architecture
- Complex multi-step workflows
- Plan evaluation and approval
- Comprehensive verification

**Characteristics:**
- 🧠 Strong reasoning capabilities
- ⚖️ Balanced cost vs performance
- 🎯 Handles ambiguity well
- ✅ Current supervisor default

**Cost:** ~$3.00 per million input tokens, ~$15.00 per million output tokens

### Claude Opus 4.5 (Most Capable - Reserved)
**Best for:**
- Novel problem solving
- Critical architectural decisions
- Highly complex multi-file refactoring
- Security-critical evaluations

**Characteristics:**
- 🚀 Best reasoning and analysis
- 💎 Highest cost
- 🔬 Research-level thinking
- ⏰ Slower response time

**Cost:** ~$15.00 per million input tokens, ~$75.00 per million output tokens

---

## Task-to-Model Mapping

### Haiku Tasks (Simple, Fast, Cheap)

#### Verification & Monitoring
- ✅ **verify-scar-start.md** - Check if SCAR acknowledged (binary)
- ✅ **Status polling** - Every 2min check for completion signals
- ✅ **Comment parsing** - Extract PR URLs, branch names from comments
- ✅ **File existence checks** - Verify worktree paths exist
- ✅ **Health checks** - SCAR server status, webhook status

#### Routing & Handoff
- ✅ **Context handoff reading** - Read handoff doc, spawn next agent
- ✅ **Simple routing** - Determine which subagent to spawn
- ✅ **Log parsing** - Extract status from log files

#### Data Extraction
- ✅ **GitHub API calls** - Fetch issue comments, PR status
- ✅ **JSON parsing** - Read workflow-status.yaml, extract fields
- ✅ **Pattern matching** - Find keywords in text (grep-like operations)

**Token estimate:** 3-5K per task
**Frequency:** High (every 2min for monitoring)
**Cost impact:** Massive savings (60-70% cheaper × high frequency)

### Sonnet Tasks (Complex, Strategic)

#### Planning & Architecture
- ✅ **analyze.md** - Codebase analysis and research
- ✅ **create-epic.md** - Strategic feature planning
- ✅ **create-adr.md** - Architectural decision records
- ✅ **plan-feature.md** - Full feature orchestration

#### Supervision & Orchestration
- ✅ **supervise-issue.md** - Full issue lifecycle management
- ✅ **approve-scar-plan.md** - Plan evaluation and validation
- ✅ **verify-scar-phase.md** - Comprehensive build/test verification

#### Complex Decision-Making
- ✅ **Error recovery** - Diagnose failures, determine fix strategy
- ✅ **Conflict resolution** - Handle merge conflicts, test failures
- ✅ **Resource allocation** - Decide parallelization strategy
- ✅ **Quality assessment** - Code review, pattern compliance

**Token estimate:** 15-30K per task
**Frequency:** Lower (per epic, per issue)
**Cost impact:** Higher cost but necessary for quality

### Opus Tasks (Reserved - Future Use)

#### Novel Problem Solving
- ⚠️ **New technology integration** - First-time framework setup
- ⚠️ **Complex refactoring** - Multi-repo architectural changes
- ⚠️ **Security audits** - Critical vulnerability assessment
- ⚠️ **Performance optimization** - Deep algorithmic improvements

**Token estimate:** 30-50K+ per task
**Frequency:** Rare (major milestones only)
**Cost impact:** Very high, but justified for critical work

---

## Implementation Guide

### How to Specify Model

When spawning subagents with Task tool, use the `model` parameter:

```python
# Haiku for simple tasks
Task(
  subagent_type="Bash",
  model="haiku",  # ← Specify model
  prompt="Check if SCAR acknowledged instruction on issue #42",
  description="Verify SCAR started"
)

# Sonnet (default) for complex tasks
Task(
  subagent_type="general-purpose",
  # No model param = defaults to Sonnet
  prompt="Supervise issue #42 through completion",
  description="Supervise issue #42"
)

# Opus for critical tasks (future)
Task(
  subagent_type="Plan",
  model="opus",  # ← Reserved for critical decisions
  prompt="Design multi-service authentication architecture",
  description="Plan auth architecture"
)
```

### Decision Flowchart

```
┌─────────────────────────────────┐
│ Need to spawn subagent?         │
└────────┬────────────────────────┘
         │
         ▼
    ┌────────────────────────────┐
    │ Is task well-defined       │
    │ with binary/simple output? │
    └────┬───────────────┬────────┘
         │ YES           │ NO
         ▼               ▼
    ┌────────┐      ┌────────────┐
    │ HAIKU  │      │ Is it       │
    │        │      │ strategic   │
    │ Fast   │      │ planning or │
    │ Cheap  │      │ complex?    │
    └────────┘      └──┬───────┬──┘
                       │ YES   │ NO
                       ▼       ▼
                  ┌────────┐ ┌────────┐
                  │ SONNET │ │ HAIKU  │
                  │        │ │ or     │
                  │ Complex│ │ SONNET │
                  └────────┘ └────────┘
```

---

## Cost Optimization Strategies

### Already Built In (Epic Sharding)
Your system has 90% token reduction through epic sharding:
- Without sharding: 50K+ tokens (entire codebase)
- With sharding: 2-5K tokens (focused epic)
- **Savings:** 90% reduction = 10x more features per budget

### Model Selection (New Optimization)
Additional 60-70% cost savings on frequent tasks:
- Monitoring runs every 2min
- Status checks run constantly
- Using Haiku instead of Sonnet = 60-70% cheaper
- **Savings:** Massive on high-frequency operations

### Combined Effect
```
Without optimization:
  Task: Monitor issue #42
  Model: Sonnet
  Tokens: 50K (full codebase) × $3/M input = $0.15 per check
  Frequency: Every 2min = 30 checks/hour
  Cost: $4.50/hour monitoring

With epic sharding only:
  Task: Monitor issue #42
  Model: Sonnet
  Tokens: 5K (epic only) × $3/M input = $0.015 per check
  Frequency: Every 2min = 30 checks/hour
  Cost: $0.45/hour monitoring (90% savings)

With epic sharding + Haiku:
  Task: Monitor issue #42
  Model: Haiku
  Tokens: 5K (epic only) × $0.25/M input = $0.00125 per check
  Frequency: Every 2min = 30 checks/hour
  Cost: $0.0375/hour monitoring (99% savings vs original!)
```

**Result:** Nearly free monitoring while preserving Sonnet for complex work.

---

## Migration Strategy

### Phase 1: Update Simple Monitoring (Immediate)
**Target tasks:**
- verify-scar-start.md spawns
- Status polling loops
- Simple health checks

**Implementation:**
1. Update CLAUDE.md with model selection guidance ✅ (Done)
2. Update supervision protocol to use Haiku for simple tasks
3. Test with single issue monitoring
4. Verify cost savings in usage reports

**Expected savings:** 60-70% on monitoring costs

### Phase 2: Audit All Subagent Spawns (Week 1)
**Process:**
1. List all places where Task tool is called
2. Categorize each by complexity
3. Add `model="haiku"` for simple tasks
4. Document decision rationale

**Expected savings:** 40-50% overall cost reduction

### Phase 3: Dynamic Model Selection (Future)
**Vision:**
1. Implement complexity scoring
2. Auto-select model based on task
3. Track quality vs cost metrics
4. ML-based optimization

**Expected savings:** 50-60% with maintained quality

---

## Monitoring & Validation

### Track These Metrics

**Cost Metrics:**
- Total token usage by model (Haiku vs Sonnet vs Opus)
- Cost per task type
- Cost per project
- Monthly trend analysis

**Quality Metrics:**
- Task success rate by model
- False positive rate (incorrect decisions)
- Need for retries by model
- User escalations by model

**Performance Metrics:**
- Response time by model
- Task completion time
- Blocking time reduced

### Success Criteria

**Haiku tasks should achieve:**
- ✅ 95%+ accuracy on binary decisions
- ✅ <5% retry rate
- ✅ <2s response time
- ✅ 60-70% cost savings vs Sonnet

**Sonnet tasks should maintain:**
- ✅ High quality planning and analysis
- ✅ <10% user escalation rate
- ✅ Architectural consistency
- ✅ Code pattern compliance

**Red flags (switch back to Sonnet):**
- ❌ High retry rate (>10%)
- ❌ Frequent errors requiring human intervention
- ❌ Quality degradation (user complaints)
- ❌ Missed critical issues

---

## Examples

### Example 1: Monitoring Issue #42

**Before (Sonnet only):**
```python
# Supervisor spawns monitoring
Task(
  subagent_type="general-purpose",
  # Defaults to Sonnet
  prompt="Monitor issue #42 for completion signals...",
  description="Monitor issue #42"
)
```
**Cost:** ~$0.045 per 2min check = $1.35/hour

**After (Haiku for monitoring):**
```python
# Supervisor spawns monitoring
Task(
  subagent_type="Bash",
  model="haiku",  # ← Fast & cheap for simple checks
  prompt="Monitor issue #42 for completion signals...",
  description="Monitor issue #42"
)
```
**Cost:** ~$0.00375 per 2min check = $0.1125/hour (92% savings!)

### Example 2: Verify SCAR Start

**Before (Sonnet):**
```python
Task(
  subagent_type="Bash",
  prompt="Verify SCAR acknowledged instruction on issue #42...",
  description="Verify SCAR started"
)
```
**Cost:** ~$0.015 per check

**After (Haiku):**
```python
Task(
  subagent_type="Bash",
  model="haiku",  # ← Binary check = perfect for Haiku
  prompt="Verify SCAR acknowledged instruction on issue #42...",
  description="Verify SCAR started"
)
```
**Cost:** ~$0.00125 per check (92% savings)

### Example 3: Plan Evaluation (Keep Sonnet)

```python
# This needs complex reasoning - use Sonnet
Task(
  subagent_type="general-purpose",
  # No model param = defaults to Sonnet (correct!)
  prompt="Evaluate SCAR's implementation plan for security concerns...",
  description="Approve SCAR plan"
)
```
**Cost:** ~$0.30 per evaluation (higher but necessary)

---

## SCAR Limitation

**IMPORTANT:** SCAR currently CANNOT use different models.

**Why:**
- SCAR uses Claude Agent SDK v0.1.57
- SDK doesn't expose model selection parameter
- All SCAR instances use same model (likely Sonnet/Opus)

**Future:**
- Monitor SDK releases for model parameter support
- File location: `/home/samuel/scar/package.json`
- GitHub: anthropics/claude-agent-sdk

**Workaround:**
- Optimize supervisor-side operations (monitoring, verification)
- Let SCAR use best model for implementation
- Focus Haiku savings on supervisor workflows

---

## Best Practices

### DO:
✅ Use Haiku for frequent, simple tasks (monitoring, status checks)
✅ Use Sonnet for complex planning and decision-making
✅ Reserve Opus for critical architectural decisions
✅ Monitor cost vs quality metrics
✅ Document model choice rationale
✅ Test Haiku tasks thoroughly before production use

### DON'T:
❌ Use Haiku for complex reasoning or planning
❌ Use Opus for routine tasks
❌ Skip quality validation when switching to Haiku
❌ Optimize cost at expense of reliability
❌ Use Haiku for security-critical decisions
❌ Assume Haiku can handle ambiguous requirements

---

## Quick Reference

| Task Type | Model | Why | Example |
|-----------|-------|-----|---------|
| SCAR start verification | Haiku | Binary check | "Did SCAR acknowledge?" |
| Status polling | Haiku | Simple parsing | "Extract PR URL from comment" |
| Health checks | Haiku | Binary response | "Is SCAR server up?" |
| Context handoff | Haiku | Simple routing | "Read handoff, spawn next agent" |
| Issue supervision | Sonnet | Complex orchestration | "Manage full issue lifecycle" |
| Plan approval | Sonnet | Security evaluation | "Validate plan has no risks" |
| Build verification | Sonnet | Comprehensive testing | "Run all tests, check quality" |
| Epic creation | Sonnet | Strategic planning | "Design feature breakdown" |
| ADR creation | Sonnet | Architectural thinking | "Document design decisions" |
| Novel architecture | Opus | Deep reasoning | "Design multi-service auth" |

---

## Related Documentation

- **SCAR Integration:** `/home/samuel/supervisor/docs/scar-integration.md`
- **Epic Sharding:** `/home/samuel/supervisor/docs/epic-sharding.md`
- **Subagent Patterns:** `/home/samuel/supervisor/docs/subagent-patterns.md`
- **Context Management:** `/home/samuel/supervisor/docs/supervisor-learnings/learnings/001-subagent-context-handoff.md`

---

**Model selection is a powerful optimization tool - use it wisely to balance cost and quality.**
