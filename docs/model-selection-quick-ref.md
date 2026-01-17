# Model Selection Quick Reference

**Quick guide for choosing Claude model when spawning subagents**

---

## When to Use Each Model

### 🟢 HAIKU (Fast & Cheap - 60-70% savings)

**Use for simple, well-defined tasks:**

```
✅ Binary checks (yes/no, exists/doesn't exist)
✅ Status polling (every 2min loops)
✅ Simple parsing (extract URL, read JSON)
✅ Health checks (server up/down)
✅ File existence checks
✅ Comment reading (no analysis)
✅ Log parsing (extract status)
```

**Spawn example:**
```python
Task(
  subagent_type="Bash",
  model="haiku",  # ← Add this!
  prompt="Check if SCAR acknowledged on issue #42",
  description="Verify SCAR started"
)
```

### 🟡 SONNET (Default - Complex Thinking)

**Use for strategic and complex tasks:**

```
✅ Planning & architecture (analyze.md, create-epic.md)
✅ Decision-making (approve-scar-plan.md)
✅ Comprehensive validation (verify-scar-phase.md)
✅ Error diagnosis and recovery
✅ Code quality assessment
✅ Multi-step orchestration (supervise-issue.md)
```

**Spawn example:**
```python
Task(
  subagent_type="general-purpose",
  # No model param = defaults to Sonnet
  prompt="Supervise issue #42 through completion",
  description="Supervise issue #42"
)
```

### 🔴 OPUS (Reserved - Critical Only)

**Reserve for novel/critical decisions:**

```
⚠️ Novel problem solving
⚠️ Critical architectural changes
⚠️ Security audits
⚠️ Multi-repo refactoring
```

**Spawn example:**
```python
Task(
  subagent_type="Plan",
  model="opus",  # ← Only for critical tasks
  prompt="Design multi-service auth architecture",
  description="Plan auth architecture"
)
```

---

## Decision Tree

```
Is task binary/simple? (yes/no, exists/doesn't, read & extract)
  ├─ YES → HAIKU
  └─ NO → Is it strategic planning or complex analysis?
           ├─ YES → SONNET
           └─ NO → Is it simple parsing/checking?
                    ├─ YES → HAIKU
                    └─ NO → SONNET (default)
```

---

## Specific Commands

| Command | Model | Reason |
|---------|-------|--------|
| `verify-scar-start.md` | **Haiku** | Binary: Did SCAR respond? |
| `supervise-issue.md` | **Sonnet** | Complex orchestration |
| `approve-scar-plan.md` | **Sonnet** | Security & quality checks |
| `verify-scar-phase.md` | **Sonnet** | Comprehensive validation |
| `analyze.md` | **Sonnet** | Codebase analysis |
| `create-epic.md` | **Sonnet** | Strategic planning |
| `create-adr.md` | **Sonnet** | Architecture decisions |
| Status polling | **Haiku** | Simple comment reading |
| Health checks | **Haiku** | Binary server status |
| Context handoff | **Haiku** | Read doc, spawn next |

---

## Cost Impact

**Example: Monitoring issue #42 for 1 hour**

| Approach | Model | Cost/hour | Savings |
|----------|-------|-----------|---------|
| No optimization | Sonnet | $4.50 | - |
| Epic sharding only | Sonnet | $0.45 | 90% |
| Epic + Haiku | Haiku | $0.04 | 99% |

**Use Haiku for high-frequency tasks to maximize savings!**

---

## Red Flags (Don't Use Haiku)

❌ Security-critical decisions
❌ Complex multi-step reasoning
❌ Ambiguous requirements
❌ Quality assessment
❌ Error diagnosis
❌ Plan evaluation

**When in doubt, use Sonnet (default).**

---

**Full documentation:** `/home/samuel/supervisor/docs/model-selection-strategy.md`
