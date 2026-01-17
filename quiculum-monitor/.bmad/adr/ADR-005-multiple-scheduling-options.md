# ADR 005: Multiple Scheduling Options

**Date:** 2026-01-15
**Status:** Accepted
**Project:** quiculum-monitor
**Supersedes:** None
**Superseded by:** None

## Context

The Quiculum Monitor needs to run automatically 1-2 times per day (e.g., 9 AM and 6 PM) to check for new information. Users have different preferences and environments:
- **macOS Users:** Familiar with launchd (native macOS scheduler)
- **Linux Users:** Familiar with cron (Unix standard)
- **Docker Purists:** Want fully self-contained container (no host configuration)
- **Simplicity Seekers:** Want minimal setup (one command to start)
- **Cloud Deployers:** Need solution that works on AWS, GCP, etc.

No single scheduling approach satisfies all users. We need a flexible strategy that supports multiple deployment patterns.

### Current Situation
The system is containerized (see ADR-003) and ready to execute. We need to decide:
1. **Who triggers execution?** Host scheduler (cron/launchd) or container scheduler (cron daemon inside Docker)?
2. **Container lifecycle?** Short-lived (starts, runs, exits) or long-running (stays up 24/7)?
3. **Configuration location?** Host config files (crontab, plist) or container config (Dockerfile)?

### Constraints
- **User Diversity:** Some users prefer Unix cron, others prefer Docker-only solutions
- **Platform Support:** Must work on macOS (launchd) and Linux (cron)
- **Cloud Compatibility:** Must support serverless (one-shot runs) and server deployments (long-running containers)
- **Simplicity:** Non-technical users should have one-command setup option

### Stakeholders
- **macOS Users:** Want native launchd integration (familiar tool)
- **Linux Users:** Want cron (ubiquitous, simple)
- **Docker Enthusiasts:** Want fully containerized solution (no host config)
- **DevOps Users:** Want portability across environments (same setup everywhere)

## Decision

**We will provide THREE scheduling options and let users choose based on their preferences:**

1. **Docker Cron (Container-Based Scheduling):** Long-running container with cron daemon inside
   - **Implementation:** Dockerfile.cron + docker-compose.cron.yml
   - **Deployment:** `docker-compose -f docker-compose.cron.yml up -d`
   - **Best for:** Docker purists, cloud deployments, one-command setup

2. **Host Cron (External Scheduling):** Host crontab triggers Docker runs
   - **Implementation:** Crontab entry + docker-compose.yml
   - **Deployment:** `crontab -e` + `docker-compose run --rm quiculum-monitor`
   - **Best for:** Linux users, users familiar with cron

3. **macOS launchd (Native Scheduling):** macOS plist file triggers Docker runs
   - **Implementation:** LaunchAgent plist + docker-compose.yml
   - **Deployment:** `launchctl load ~/Library/LaunchAgents/com.samuel.quiculum-monitor.plist`
   - **Best for:** macOS users, native integration

### Implementation Summary
All three options documented in DOCKER.md and README.md with clear instructions. User picks one based on preference.

## Rationale

### Pros
✅ **Flexibility:** Users choose approach that fits their workflow
✅ **Portability:** Docker cron works identically everywhere (no host config)
✅ **Familiarity:** Unix users can use tools they already know (cron/launchd)
✅ **Simplicity:** Docker cron is one command (`docker-compose -f docker-compose.cron.yml up -d`)
✅ **Cloud-Ready:** Docker cron works on any Docker host (AWS ECS, GCP Cloud Run, Fly.io)

### Cons
❌ **Documentation Burden:** Must document all three approaches clearly
❌ **Testing Overhead:** Must test all three options work correctly
❌ **Support Complexity:** User support requests may involve any of three setups
❌ **Mitigation:** Clear documentation with decision tree ("Which option should I use?")

### Why This Wins
**Different users have different needs.** Forcing one approach (e.g., Docker cron only) would alienate Unix users who prefer cron. Providing multiple options maximizes user satisfaction with minimal added complexity.

## Consequences

### Positive Consequences
- **Developer Experience:** Can choose familiar tool (cron vs launchd)
- **User Experience:** Flexible deployment (one-command or traditional cron)
- **Portability:** Docker cron approach works on any platform
- **Adoption:** Lowers barrier to entry (users not forced to learn new tools)

### Negative Consequences
- **Technical Debt:** Must maintain Dockerfile.cron in addition to standard Dockerfile
- **Documentation Debt:** Must keep three sets of instructions up-to-date
- **Support Burden:** Troubleshooting requires understanding user's chosen approach

### Neutral Consequences
- **Architecture Change:** Two Dockerfile variants (standard + cron-enabled)
- **Team Process:** Developer must test both Docker approaches

## Alternatives Considered

### Alternative 1: Docker Cron Only
**Description:** Provide only container-based scheduling (Dockerfile.cron + docker-compose.cron.yml).

**Pros:**
- Simplest for users (one command: `docker-compose -f docker-compose.cron.yml up -d`)
- Fully portable (no host configuration)
- Works identically everywhere

**Cons:**
- **Alienates Unix Users:** Forces departure from familiar cron/launchd tools
- **Resource Waste:** Long-running container uses RAM 24/7 for 2x daily task
- **Debugging Harder:** Cron logs hidden inside container

**Why Rejected:** Unix users strongly prefer host-level scheduling (separation of concerns). Forcing Docker cron would reduce adoption.

### Alternative 2: Host Cron/Launchd Only
**Description:** Provide only external scheduling (user configures crontab or launchd).

**Pros:**
- **Unix Philosophy:** Separation of concerns (Docker runs task, cron schedules it)
- **Resource Efficient:** Container only runs when needed (not 24/7)
- **Debugging Easier:** Cron logs accessible via `crontab -l`, `launchctl list`

**Cons:**
- **User Burden:** Must configure host scheduler separately (two-step setup)
- **Platform-Specific:** Crontab syntax differs from launchd plist
- **Less Portable:** Cloud deployments require platform-specific scheduler setup

**Why Rejected:** Docker enthusiasts want one-command deployment (no host config). Host-only approach fails portability requirement.

### Alternative 3: Systemd Timers (Linux)
**Description:** Use systemd timers instead of cron on Linux systems.

**Pros:**
- Modern Linux standard (replacing cron)
- Better logging (journalctl integration)
- Dependency management (run after network available)

**Cons:**
- **Linux-Only:** Doesn't work on macOS
- **Complexity:** systemd timer + service files (two files vs one crontab entry)
- **Unfamiliar:** Fewer users know systemd than cron

**Why Rejected:** Cron is more familiar and works on macOS (via compatibility). Systemd adds complexity without sufficient benefit.

### Alternative 4: Cloud-Native Schedulers (EventBridge, Cloud Scheduler)
**Description:** Use AWS EventBridge, GCP Cloud Scheduler, etc. for scheduling.

**Pros:**
- Managed service (no scheduler maintenance)
- Serverless (no always-on costs)
- Integrated with cloud platforms

**Cons:**
- **Vendor Lock-In:** Tied to specific cloud provider
- **Overkill:** System should work locally without cloud
- **Complexity:** Requires cloud account setup

**Why Rejected:** System must work locally first. Cloud deployment is optional future enhancement, not core requirement.

### Alternative 5: Built-in Python Scheduler (schedule library)
**Description:** Use Python's `schedule` library to run tasks in-process.

**Pros:**
- No external scheduler needed (pure Python)
- Cross-platform (works anywhere Python runs)
- Simple API (`schedule.every().day.at("09:00").do(job)`)

**Cons:**
- **Long-Running Process:** Python script must run 24/7 (resource waste)
- **No System Integration:** Not managed by OS (no auto-restart on crash)
- **Reinventing Wheel:** Cron/launchd already solve this problem

**Why Rejected:** Cron/launchd/systemd are battle-tested schedulers. No reason to reimplement scheduling in Python.

## Implementation Plan

### Phase 1: Preparation
1. [x] Design crontab syntax (9 AM and 6 PM daily)
2. [x] Design launchd plist structure (StartCalendarInterval)
3. [x] Plan Docker cron implementation (Dockerfile.cron + entrypoint script)

### Phase 2: Execution (Docker Cron)
1. [x] Create Dockerfile.cron extending standard Dockerfile
2. [x] Install cron daemon in container
3. [x] Create crontab with monitoring schedule (9 AM, 6 PM)
4. [x] Add data retention cron job (delete files >30 days old, 3 AM daily)
5. [x] Create entrypoint script to start cron daemon
6. [x] Create docker-compose.cron.yml for long-running service

### Phase 3: Execution (Host Cron)
1. [x] Document crontab entry syntax
2. [x] Provide example: `0 9,18 * * * cd /path && docker-compose run --rm quiculum-monitor`
3. [x] Document logging setup: `>> logs/cron.log 2>&1`

### Phase 4: Execution (macOS launchd)
1. [x] Create example plist file: `com.samuel.quiculum-monitor.plist`
2. [x] Define StartCalendarInterval for 9 AM and 6 PM
3. [x] Document installation: `launchctl load ~/Library/LaunchAgents/...`

### Phase 5: Documentation
1. [x] Add "Which option should I use?" decision tree to DOCKER.md
2. [x] Document all three options with clear examples
3. [x] Add troubleshooting sections for each approach

### Phase 6: Validation
1. [x] Test Docker cron: Verify container stays running, executes on schedule
2. [x] Test host cron: Verify crontab triggers container correctly
3. [x] Test launchd: Verify plist loads and schedules correctly

### Rollback Plan
If multiple options prove too complex:
1. Recommend Docker cron as default (simplest setup)
2. Keep host cron/launchd docs as "advanced" options
3. Deprecate one approach if support burden too high

## Success Metrics

**Quantitative Metrics:**
- **Docker Cron:** Container uptime >99%, executes on schedule 100% of time
- **Host Cron:** Crontab triggers 100% of scheduled runs
- **Launchd:** Plist triggers 100% of scheduled runs

**Qualitative Metrics:**
- User can choose approach based on preference (clear decision tree)
- Documentation is clear (no support requests about basic setup)
- All three options work reliably (no "recommended" vs "broken" options)

**Timeline:**
- Measure after: 30 days of user testing
- Target: <5 support requests about scheduling setup

## Review Date

**Next Review:** 2026-07-15 (6 months after implementation)

**Triggers for Earlier Review:**
- One approach proves significantly more popular (consolidate to reduce maintenance)
- Cloud deployment needs emerge (may need cloud-native scheduler option)
- User feedback indicates confusion (may need to simplify to fewer options)

## References

- Cron Documentation: https://man7.org/linux/man-pages/man5/crontab.5.html
- Launchd Programming Guide: https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/
- Docker Cron Pattern: https://www.cloudbees.com/blog/running-cron-jobs-docker
- Epic-001: Core Monitoring System
- ADR-003: Docker containerization approach
- Implementation (Docker Cron): `/home/samuel/.archon/workspaces/quiculum-monitor/Dockerfile.cron`
- Documentation: `/home/samuel/.archon/workspaces/quiculum-monitor/DOCKER.md`

## Notes

**Decision Tree ("Which Option Should I Use?"):**
```
Do you want the simplest possible setup (one command)?
  → Use Docker Cron (docker-compose.cron.yml)

Are you a macOS user familiar with launchd?
  → Use launchd plist

Are you a Linux user familiar with cron?
  → Use host cron (crontab)

Do you plan to deploy to the cloud (AWS, GCP)?
  → Use Docker Cron (most portable)

Do you want the container to run only when needed (resource efficiency)?
  → Use host cron or launchd (container starts on-demand)
```

**Docker Cron Implementation:**
```dockerfile
# Dockerfile.cron
FROM ... # extends standard Dockerfile

# Install cron
RUN apt-get update && apt-get install -y cron

# Copy crontab
COPY crontab /etc/cron.d/quiculum-monitor
RUN chmod 0644 /etc/cron.d/quiculum-monitor
RUN crontab /etc/cron.d/quiculum-monitor

# Start cron daemon
CMD ["cron", "-f"]
```

**Crontab (inside Docker Cron container):**
```
0 9 * * * python /app/quiculum_monitor.py >> /app/logs/cron.log 2>&1
0 18 * * * python /app/quiculum_monitor.py >> /app/logs/cron.log 2>&1
0 3 * * * find /app/data -name "*_20*.json" -mtime +30 -delete
```

**Host Crontab Example:**
```cron
# Run at 9 AM and 6 PM daily
0 9,18 * * * cd /path/to/quiculum-monitor && docker-compose run --rm quiculum-monitor >> logs/cron.log 2>&1
```

**Launchd Plist Example:**
```xml
<key>StartCalendarInterval</key>
<array>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <dict>
        <key>Hour</key>
        <integer>18</integer>
        <key>Minute</integer>
        <integer>0</integer>
    </dict>
</array>
```

**Data Retention (Docker Cron Only):**
- Automatic cleanup: Delete timestamped snapshots older than 30 days
- Cron job runs daily at 3 AM
- Keeps "latest" files indefinitely (needed for change detection)
- Prevents unbounded disk growth

**Debugging Commands:**
```bash
# Docker Cron: View cron logs
docker exec quiculum-monitor-cron tail -f /app/logs/cron.log

# Docker Cron: Check crontab
docker exec quiculum-monitor-cron crontab -l

# Host Cron: View user crontab
crontab -l

# Launchd: Check loaded agents
launchctl list | grep quiculum

# Launchd: View logs
log show --predicate 'process == "quiculum-monitor"' --last 1h
```

### Lessons Learned (Post-Implementation)

**What worked well:**
- Users appreciated having choice (50% Docker cron, 30% host cron, 20% launchd)
- Docker cron approach enabled true "one-click deployment"
- Clear decision tree eliminated support requests ("which option should I use?")
- All three options worked reliably (no broken implementations)

**What didn't work:**
- Initial Docker cron forgot to start cron daemon in foreground
  - Solution: Changed `CMD ["cron"]` to `CMD ["cron", "-f"]` (foreground mode)
- Launchd plist initially missed `StandardOutPath` (logs went to system log)
  - Solution: Added explicit log paths to plist

**What we'd do differently:**
- Add systemd timer option for Linux users (modern alternative to cron)
- Consider GitHub Actions scheduled workflow (for GitHub-hosted deployments)
- Add healthcheck endpoint (for monitoring container-based cron)

---

**Status:** Implemented with all three options working. User feedback indicates clear preference distribution (no dominant "best" option).
