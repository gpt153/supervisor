# Meta-Supervisor: Cross-Project Resource Allocation

**Status:** Proposed Architecture
**Date:** 2026-01-18
**Purpose:** Prevent VM resource exhaustion when multiple projects build in parallel

---

## Problem Statement

**Current Risk:**
- User has 5+ active projects
- Each project supervisor can spawn up to 10 subagents
- If all projects build simultaneously: 50+ agents = VM crash
- No coordination between project supervisors

**Need:**
- Central resource management
- Dynamic allocation of "implementation slots"
- VM health monitoring
- Intelligent scheduling across projects

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Meta-Supervisor (Root)                     │
│  Location: /home/samuel/supervisor/ (CLAUDE.md)             │
│                                                              │
│  Responsibilities:                                           │
│  - Monitor VM resources (CPU, RAM, disk, load)              │
│  - Manage global implementation slot pool                   │
│  - Allocate slots to project supervisors on request         │
│  - Kill runaway processes if VM degraded                    │
│  - Report cross-project status                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Consilio   │   │ OpenHorizon │   │   Odin      │
│  Supervisor │   │  Supervisor │   │  Supervisor │
│             │   │             │   │             │
│  Requests:  │   │  Requests:  │   │  Requests:  │
│  5 slots    │   │  3 slots    │   │  2 slots    │
│             │   │             │   │             │
│  Allocated: │   │  Allocated: │   │  Allocated: │
│  5 slots ✅ │   │  3 slots ✅ │   │  2 slots ✅ │
└─────────────┘   └─────────────┘   └─────────────┘
       │                  │                 │
       ▼                  ▼                 ▼
   5 PIV agents      3 PIV agents      2 PIV agents

Total: 10/20 slots used (10 remaining)
```

---

## Implementation

### 1. Global Slot Pool

**File:** `/home/samuel/supervisor/.resource-manager/slots.yaml`

```yaml
# Global configuration
max_slots: 20  # Total implementation agents allowed
slot_allocation:
  consilio: 0
  openhorizon: 0
  health-agent: 0
  odin: 0
  quiculum-monitor: 0

# VM thresholds (when to reduce slots)
vm_limits:
  max_cpu_percent: 85
  max_memory_percent: 90
  max_load_average: 16.0  # For 8-core VM

# Current VM state (updated every 30sec)
vm_state:
  cpu_percent: 45.2
  memory_percent: 62.1
  load_average: 4.3
  disk_usage_percent: 58
  health: "healthy"  # healthy | degraded | critical
```

### 2. Slot Request Protocol

**Project Supervisor wants to build 5 features:**

```bash
# 1. Request slots from Meta-Supervisor
supervisor-request-slots consilio 5

# Meta-Supervisor checks:
# - Current slot usage (10/20 used)
# - VM health (healthy)
# - Priority (FIFO or weighted)

# 2. Allocate slots
# Updates slots.yaml:
#   consilio: 5

# 3. Project supervisor spawns agents
# Spawns 5 PIV subagents in parallel

# 4. On completion, release slots
supervisor-release-slots consilio 5

# Updates slots.yaml:
#   consilio: 0
```

### 3. VM Health Monitoring

**Meta-Supervisor runs continuous monitoring loop:**

```bash
# Script: /home/samuel/supervisor/.resource-manager/monitor-vm.sh

#!/bin/bash
while true; do
  # Get VM metrics
  CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  MEM=$(free | grep Mem | awk '{print ($3/$2) * 100}')
  LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
  DISK=$(df / | tail -1 | awk '{print $5}' | tr -d '%')

  # Update slots.yaml with current state
  yq eval ".vm_state.cpu_percent = $CPU" -i slots.yaml
  yq eval ".vm_state.memory_percent = $MEM" -i slots.yaml
  yq eval ".vm_state.load_average = $LOAD" -i slots.yaml
  yq eval ".vm_state.disk_usage_percent = $DISK" -i slots.yaml

  # Determine health
  if (( $(echo "$CPU > 85" | bc -l) )) || (( $(echo "$MEM > 90" | bc -l) )); then
    yq eval '.vm_state.health = "degraded"' -i slots.yaml
    # Trigger slot reduction
    reduce-slots-emergency
  elif (( $(echo "$LOAD > 16" | bc -l) )); then
    yq eval '.vm_state.health = "critical"' -i slots.yaml
    # Kill lowest priority agents
    kill-low-priority-agents
  else
    yq eval '.vm_state.health = "healthy"' -i slots.yaml
  fi

  sleep 30
done
```

### 4. Intelligent Scheduling Strategies

**Strategy A: First-Come-First-Served (Simple)**
```
Consilio requests 8 slots
→ Allocate 8 (if available)

OpenHorizon requests 10 slots
→ Only 12 available
→ Allocate 10 (2 slots remaining)

Odin requests 5 slots
→ Only 2 available
→ Queue request, notify user: "Waiting for slots (3 agents ahead)"
```

**Strategy B: Fair Share (Balanced)**
```
3 projects request slots simultaneously:
- Consilio: wants 10
- OpenHorizon: wants 8
- Odin: wants 6

Total requested: 24
Total available: 20

Allocate proportionally:
- Consilio: 8 slots (10/24 * 20)
- OpenHorizon: 7 slots (8/24 * 20)
- Odin: 5 slots (6/24 * 20)
```

**Strategy C: Priority-Based (User Defined)**
```yaml
# User sets priorities in supervisor/config.yaml
project_priorities:
  consilio: 10      # Highest priority (production app)
  openhorizon: 8    # High priority
  health-agent: 5   # Medium
  odin: 5           # Medium
  quiculum-monitor: 3  # Low (experimental)

# Allocation favors higher priority projects
```

### 5. User-Facing Commands

**Meta-Supervisor provides these commands:**

```bash
# Show resource usage across all projects
/resource-status

Output:
📊 VM Resource Status

🖥️  VM Health: Healthy
   CPU: 45.2% (of 85% limit)
   RAM: 62.1% (of 90% limit)
   Load: 4.3 (of 16.0 limit)
   Disk: 58%

🎯 Implementation Slots: 10/20 used

Active Projects:
   Consilio:     5 agents (Features: Auth, Dashboard, API, Tests, Deploy)
   OpenHorizon:  3 agents (Features: Landing, Contact, Blog)
   Odin:         2 agents (Features: Parser, Validator)

Queued Projects:
   Health-Agent: Waiting for 4 slots

Estimated completion: 15 minutes


# Check specific project
/resource-status consilio

Output:
📊 Consilio Resource Usage

Allocated Slots: 5/20 (25%)

Active Agents:
   1. Feature/auth - 60% complete (Phase 3/4)
   2. Feature/dashboard - 80% complete (Phase 4/4)
   3. Feature/api - 40% complete (Phase 2/4)
   4. Feature/tests - 90% complete (Running validations)
   5. Feature/deploy - 20% complete (Phase 1/4)

ETA: 12 minutes


# Force kill all agents for a project (emergency)
/resource-kill consilio

Output:
⚠️  Killing all Consilio agents...
   5 agents terminated
   5 slots released

Reason: User requested


# Adjust global slot limit
/resource-set-max 30

Output:
✅ Max slots increased: 20 → 30
   10 additional slots available
   Queued projects can now proceed
```

---

## Decision Tree: When to Use Resource Manager

### Use Resource Manager If:

✅ **Multiple active projects** (3+ projects building simultaneously)
✅ **Limited VM resources** (8-16 GB RAM, 4-8 CPU cores)
✅ **High parallelism** (each project wants 5+ agents)
✅ **Production VM** (can't afford crashes)
✅ **Multiple users** (different people building different projects)

### Skip Resource Manager If:

❌ **Single project focus** (only work on one project at a time)
❌ **Powerful VM** (64+ GB RAM, 16+ cores)
❌ **Low parallelism** (1-2 agents per project max)
❌ **Development only** (OK if VM crashes occasionally)

---

## Your VM Specs

**Check your current VM:**
```bash
# CPU cores
nproc
# Output: 8 (example)

# RAM
free -h
# Output: Total: 16Gi

# Current load
uptime
# Output: load average: 2.3, 1.8, 1.5
```

**Recommended slot limits based on VM size:**

| VM Size | CPU Cores | RAM | Max Slots | Max per Project |
|---------|-----------|-----|-----------|-----------------|
| Small   | 2-4       | 4-8 GB | 5-8 | 2-3 |
| Medium  | 4-8       | 8-16 GB | 10-15 | 3-5 |
| Large   | 8-16      | 16-32 GB | 20-30 | 5-10 |
| XLarge  | 16+       | 32+ GB | 40-50 | 10-15 |

---

## Implementation Phases

### Phase 1: Basic Resource Manager (MVP)
- Global `slots.yaml` file
- Simple FIFO allocation
- Manual slot requests
- Basic VM monitoring

### Phase 2: Automated Allocation
- Project supervisors auto-request slots
- Auto-release on completion
- Health-based slot reduction

### Phase 3: Advanced Features
- Priority-based allocation
- Predictive scheduling (estimate completion times)
- Auto-scaling (increase slots when VM healthy)
- Per-project resource usage history

---

## Answer: Is This Overkill?

**For your use case: NO, this is necessary!**

**Why:**
- ✅ You have 5+ active projects
- ✅ You want maximum parallelism (10+ agents)
- ✅ VM resources are finite
- ✅ You're a non-coder (can't manually debug VM crashes)

**The resource manager ensures:**
- ✅ VM never crashes from too many agents
- ✅ Fair allocation across projects
- ✅ Visibility into what's running where
- ✅ Automatic recovery from resource exhaustion

**Complexity level:** Medium
- Simple version (Phase 1): ~2-3 days to implement
- Full version (Phase 3): ~1-2 weeks

**Recommendation:** Start with Phase 1 (basic resource manager), add automation later as needed.

---

**Next Steps:**

1. Check your VM specs (CPU, RAM)
2. Decide on max_slots limit
3. Choose allocation strategy (FIFO vs Fair Share vs Priority)
4. Implement Phase 1 MVP
5. Test with 2-3 projects building in parallel
6. Add automation (Phase 2) based on results
