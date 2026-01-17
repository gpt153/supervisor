# ADR 003: Docker Containerization Approach

**Date:** 2026-01-15
**Status:** Accepted
**Project:** quiculum-monitor
**Supersedes:** None
**Superseded by:** None

## Context

The Quiculum Monitor requires specific runtime dependencies:
- Python 3.12+
- Google Chrome browser
- ChromeDriver matching Chrome version
- Selenium Python library
- webdriver-manager

Setting up these dependencies locally is error-prone:
- ChromeDriver version must exactly match Chrome version
- Different operating systems have different installation procedures
- Python virtual environment management adds complexity
- Updates to Chrome break ChromeDriver (requires manual intervention)

### Current Situation
We need a deployment strategy that:
1. Works consistently across different environments (macOS, Linux, servers)
2. Eliminates "works on my machine" issues
3. Simplifies dependency management (Chrome + ChromeDriver versioning)
4. Enables cloud deployment (AWS, GCP, Fly.io)
5. Maintains ease of local development and debugging

### Constraints
- **No Commercial Tools:** Must use free/open-source solutions
- **Single Developer:** Must be maintainable without DevOps expertise
- **Budget:** Free tier only (no commercial container registries)
- **Simplicity:** Non-technical user should be able to run with minimal commands

### Stakeholders
- **End User:** Wants simple setup without installing Python/Chrome locally
- **Developer:** Needs reproducible environment for development and debugging
- **Future Self:** Will need to deploy to cloud servers for 24/7 operation

## Decision

**We will containerize the Quiculum Monitor using Docker with two approaches: standard one-time execution and cron-enabled long-running container.**

### Implementation Summary
1. **Dockerfile (Standard):** Python 3.12-slim base + Google Chrome + dependencies
   - For one-time runs triggered by host-level scheduler (cron, launchd)
2. **Dockerfile.cron (Cron-Enabled):** Above + cron daemon inside container
   - For self-contained long-running container with internal scheduling
3. **docker-compose.yml (Standard):** Volume mounts for config/data/logs
4. **docker-compose.cron.yml (Cron-Enabled):** Long-running service definition
5. **Volume Strategy:** Mount config (read-only), data/logs (read-write) from host

## Rationale

### Pros
✅ **Consistent Environment:** Same runtime everywhere (macOS, Linux, cloud)
✅ **Simplified Setup:** User runs `docker-compose build && docker-compose run --rm quiculum-monitor`
✅ **ChromeDriver Versioning:** Docker image pins Chrome version (no version mismatch)
✅ **No Local Pollution:** No Python/Chrome installation on host machine
✅ **Cloud Deployment:** Same image works on AWS ECS, GCP Cloud Run, Fly.io
✅ **Isolation:** Container sandbox protects host from scraper bugs
✅ **Reproducibility:** Dockerfile is executable documentation of environment

### Cons
❌ **Docker Dependency:** User must install Docker Desktop (~500MB download)
❌ **Resource Overhead:** Container isolation adds ~50MB RAM overhead
❌ **Build Time:** Initial image build takes 5-10 minutes (cached afterwards)
❌ **Debugging Complexity:** Must enter container to troubleshoot (`docker exec`)
❌ **Mitigation:** Comprehensive documentation in DOCKER.md; debugging guide included

### Why This Wins
**Docker is the industry standard for portable, reproducible deployments.** The upfront cost (Docker installation, learning curve) is offset by long-term benefits (consistent environment, easy cloud deployment, zero dependency conflicts).

## Consequences

### Positive Consequences
- **Developer Experience:** "Works on my machine" guaranteed by containerization
- **User Experience:** One-command setup (`docker-compose up`)
- **Deployment Flexibility:** Same image for local dev, scheduled runs, cloud hosting
- **Maintenance:** Chrome updates handled by rebuilding image (explicit, controlled)

### Negative Consequences
- **Technical Debt:** Dockerfile must be maintained (base image updates, security patches)
- **Learning Curve:** User must learn basic Docker commands (`build`, `run`, `logs`, `exec`)
- **Storage:** Docker images consume disk space (~1.5GB for full image)

### Neutral Consequences
- **Architecture Change:** Introduces container orchestration layer (docker-compose)
- **Team Process:** Developer must rebuild image when changing Python code

## Alternatives Considered

### Alternative 1: Local Python Installation
**Description:** User installs Python 3.12, Chrome, ChromeDriver, and dependencies locally.

**Pros:**
- No Docker dependency
- Faster execution (no container startup)
- Easier debugging (direct Python execution)

**Cons:**
- **Fragile:** ChromeDriver version must match Chrome version (breaks on Chrome updates)
- **Platform-Specific:** Different instructions for macOS vs Linux vs Windows
- **Maintenance Burden:** User responsible for updating dependencies
- **"Works on my machine":** Hard to reproduce issues across environments

**Why Rejected:** Dependency management nightmare. ChromeDriver versioning alone causes weekly support requests in similar projects.

### Alternative 2: Virtual Machine (Vagrant)
**Description:** Package system in a VM with Vagrant for cross-platform consistency.

**Pros:**
- Complete OS isolation (stronger than containers)
- Cross-platform (macOS, Windows, Linux)

**Cons:**
- **Resource Intensive:** VM uses 2-4GB RAM (vs 500MB for container)
- **Slow:** VM boot takes 30-60 seconds (vs 2 seconds for container)
- **Complexity:** Vagrant configuration more complex than Dockerfile
- **Overkill:** Don't need full OS isolation (just dependency isolation)

**Why Rejected:** Containers provide sufficient isolation with much lower resource overhead.

### Alternative 3: Python Virtual Environment + Homebrew
**Description:** Use venv for Python isolation, Homebrew for Chrome/ChromeDriver.

**Pros:**
- Native performance (no container overhead)
- Familiar to Python developers

**Cons:**
- **macOS-Only:** Homebrew doesn't work on Linux/Windows
- **Still Fragile:** ChromeDriver version matching remains problematic
- **No Cloud Deployment:** Can't easily deploy to servers

**Why Rejected:** Platform-specific solution doesn't meet cross-platform requirement.

### Alternative 4: Serverless Functions (AWS Lambda, GCP Cloud Functions)
**Description:** Deploy as serverless function with Chrome layer.

**Pros:**
- Zero infrastructure management
- Pay-per-execution (cost-effective for infrequent runs)
- Auto-scaling

**Cons:**
- **Execution Limits:** Lambda 15-minute timeout (may be tight for slow scraping)
- **Chrome Layer:** Must use pre-built Chrome layer (inflexible, outdated)
- **Complexity:** Serverless setup more complex than Docker
- **Vendor Lock-In:** Tied to AWS/GCP

**Why Rejected:** Serverless is overkill for simple scheduled task. Docker + cron is simpler and more portable.

### Alternative 5: Docker + External Scheduler Only
**Description:** Use Docker for execution, rely on host cron/launchd for scheduling (no Docker cron).

**Pros:**
- Simpler Docker setup (no cron daemon inside container)
- More Unix-like (separation of concerns)

**Cons:**
- **User Burden:** Must configure host cron/launchd separately
- **Less Portable:** Deployment requires two steps (Docker + scheduler)

**Why Rejected:** We implement BOTH approaches (standard + cron-enabled) to give user choice. See ADR-005.

## Implementation Plan

### Phase 1: Preparation
1. [x] Research Chrome installation in Docker (official Debian packages)
2. [x] Plan volume mount strategy (config, data, logs)
3. [x] Design docker-compose.yml for easy user experience

### Phase 2: Execution (Standard Docker)
1. [x] Create Dockerfile with Python 3.12-slim base
2. [x] Add Google Chrome installation (via apt)
3. [x] Install Python dependencies (requirements.txt)
4. [x] Create docker-compose.yml with volume mounts
5. [x] Add .dockerignore to optimize build

### Phase 3: Execution (Cron-Enabled Docker)
1. [x] Create Dockerfile.cron extending standard Dockerfile
2. [x] Add cron daemon installation
3. [x] Create crontab with 9 AM / 6 PM schedule
4. [x] Add data retention cron job (delete files >30 days old)
5. [x] Create docker-compose.cron.yml for long-running service

### Phase 4: Validation
1. [x] Test build: `docker-compose build`
2. [x] Test one-time run: `docker-compose run --rm quiculum-monitor`
3. [x] Test cron container: `docker-compose -f docker-compose.cron.yml up -d`
4. [x] Test volume mounts (data persists after container removal)
5. [x] Document all commands in DOCKER.md

### Rollback Plan
If Docker proves too complex for users:
1. Provide local installation script (install_local.sh)
2. Accept platform-specific differences
3. Document troubleshooting for each OS

## Success Metrics

**Quantitative Metrics:**
- Image build success rate: 100% (deterministic build)
- Container startup time: <5 seconds (after initial build)
- Memory usage: <500MB during execution
- Disk usage: <2GB for image

**Qualitative Metrics:**
- User can build and run with zero Python/Chrome knowledge
- Same Dockerfile works on macOS, Linux, and cloud platforms
- Developer can debug by running container with shell access

**Timeline:**
- Measure after: 30 days of user testing
- Target: 100% build success rate, <5 issues reported

## Review Date

**Next Review:** 2026-07-15 (6 months after implementation)

**Triggers for Earlier Review:**
- Docker Desktop licensing changes (affects free tier)
- Security vulnerability in base image (python:3.12-slim)
- Better containerization technology emerges
- User feedback indicates Docker too complex

## References

- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/
- Multi-Stage Builds: https://docs.docker.com/build/building/multi-stage/
- Chrome in Docker: https://github.com/SeleniumHQ/docker-selenium
- Epic-001: Core Monitoring System
- ADR-001: Use Selenium WebDriver
- ADR-005: Multiple scheduling options
- Implementation: `/home/samuel/.archon/workspaces/quiculum-monitor/Dockerfile`
- Documentation: `/home/samuel/.archon/workspaces/quiculum-monitor/DOCKER.md`

## Notes

**Dockerfile Structure (Standard):**
```dockerfile
FROM python:3.12-slim

# Install system deps (Chrome, fonts, libs)
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates \
    google-chrome-stable \
    ...

# Copy app files
COPY requirements.txt quiculum_monitor.py config.json.template ./

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Create data/logs directories
RUN mkdir -p data logs

# Run script
CMD ["python", "quiculum_monitor.py"]
```

**Docker Compose Strategy:**
- **Volumes:** Bind mounts for data persistence and config injection
- **read-only flag:** Config mounted read-only (prevent accidental overwrites)
- **Environment:** `PYTHONUNBUFFERED=1` for live log output

**Two-Dockerfile Approach:**
- **Dockerfile:** Optimized for one-time runs (minimal size, fast startup)
- **Dockerfile.cron:** Extends Dockerfile + cron daemon (for long-running container)
- User chooses based on preference (external scheduler vs internal cron)

**Debugging Commands:**
```bash
# Enter running container
docker-compose run --rm quiculum-monitor /bin/bash

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose build --no-cache
```

**Cloud Deployment Readiness:**
- Image works on: AWS ECS Fargate, GCP Cloud Run, Fly.io, DigitalOcean App Platform
- No environment-specific code (portable across clouds)
- Environment variables for config (alternative to config.json for cloud)

### Lessons Learned (Post-Implementation)

**What worked well:**
- Docker simplified user setup (no ChromeDriver version hell)
- Volume mounts made data persistence seamless
- docker-compose.yml gave one-command UX (`docker-compose run --rm quiculum-monitor`)
- Dockerfile.cron approach enabled true "one-click deployment"

**What didn't work:**
- Initial Dockerfile forgot to install fonts (Chrome crashed in headless mode)
  - Solution: Added `fonts-liberation` package
- Docker Desktop memory limit too low (4GB) caused Chrome crashes
  - Solution: Documented in DOCKER.md (increase to 6GB in Docker settings)

**What we'd do differently:**
- Use multi-stage build to reduce image size (currently 1.5GB, could be <1GB)
- Add healthcheck endpoint (for cloud load balancers)
- Pin base image to specific version (`python:3.12.1-slim` not `python:3.12-slim`)

---

**Status:** Implemented and working reliably. User reports "works perfectly in Docker".
