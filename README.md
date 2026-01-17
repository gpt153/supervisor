# Supervisor - Autonomous Planning & Orchestration System

**BMAD-inspired strategic planning and validation for SCAR implementation workflows**

---

## 🎯 Quick Start

### Creating New Project (Easiest Way)
```bash
cd /home/samuel/supervisor
# Start Claude Code

"/new-project hitster-game"
```

**Supervisor automatically:**
- Asks questions (tech stack, features, timeline)
- Creates GitHub repos
- Sets up workspaces
- Creates CLAUDE.md files
- Initializes planning artifacts
- Ready to start in ~2 minutes!

### Working on Existing Project
```bash
cd /home/samuel/supervisor/consilio
# Start Claude Code

"Research the codebase and help me plan next features"
```

### Starting New Project (Manual Method)
```bash
cd /home/samuel/supervisor
./init-project.sh my-project https://github.com/user/my-project-planning.git

cd my-project
# Start Claude Code

"New project: [description]. Help me plan."
```

**→ See [GETTING-STARTED.md](./GETTING-STARTED.md) for complete walkthrough**

---

## 🔄 Supervisor Meta-Project (BMAD Self-Tracking)

**The supervisor system now tracks its own improvements using BMAD!**

### Why?
Instead of ad-hoc changes, we now systematically track supervisor improvements:
- **Workflow tracking:** `.bmad/workflow-status.yaml` tracks meta-project progress
- **GitHub issues:** [supervisor-planning](https://github.com/gpt153/supervisor-planning) repository
- **Epic planning:** Documented improvements in `.bmad/epics/`
- **Metrics:** Measuring supervisor effectiveness over time

### What Changed?
- **Before:** 6 separate repos (consilio-planning, openhorizon-planning, etc.)
- **After:** Single `gpt153/supervisor` repo containing all project planning folders
- **Benefits:** Simpler maintenance, easier cross-project learning, natural fit with centralized docs

### Active Meta-Epics
1. **Epic 001:** BMAD Integration (in progress) - [Issues](https://github.com/gpt153/supervisor/issues)
2. **Epic 002:** Learning System Enhancement (draft)
3. **Epic 003:** SCAR Integration Improvements (draft)
4. **Epic 004:** Automated Supervisor Updates (draft)

### Check Status
```bash
cat /home/samuel/supervisor/.bmad/workflow-status.yaml
```

**Learn more:** See `.bmad/epics/` for detailed improvement plans
**Old planning repos:** Archived (not deleted) for historical reference

---

## 🤖 What is Supervisor?

**An autonomous AI assistant that handles strategic planning, SCAR orchestration, and validation.**

### You Say Natural Language
- "Plan feature: user authentication"
- "Check progress on issue 123"
- "Is the work good?"
- "Test the UI"

### Supervisor Handles Everything
- Researches codebase automatically
- Creates epics and ADRs
- Instructs SCAR via GitHub issues
- Validates implementations
- Runs tests
- Monitors progress
- Reports status

**You focus on WHAT to build. Supervisor handles HOW.**

---

## 📊 Division of Labor

### Supervisor (This System)
**Strategic Oversight + Validation**
- ✅ Codebase research (reads implementation workspace)
- ✅ Requirements analysis (spawns analyst subagent)
- ✅ Epic sharding (self-contained stories)
- ✅ Architecture Decision Records (ADRs)
- ✅ SCAR instruction (GitHub issues with @scar)
- ✅ Progress monitoring (checks every 2 hours)
- ✅ Implementation validation (spawns test subagents)
- ✅ Multi-project context isolation
- ✅ Archon MCP integration (task tracking + RAG search)

### SCAR Platform
**Implementation Worker**
- ✅ Code implementation (95% autonomous)
- ✅ GitHub issue management (reads epics from URLs)
- ✅ Parallel execution (5 issues simultaneously)
- ✅ PR creation and merging
- ✅ Updates progress via comments

**Complete separation. No context mixing.**

---

## 📂 Directory Structure

```
/home/samuel/supervisor/
│
├── 📖 GETTING-STARTED.md         # ⭐ START HERE - Complete walkthrough
├── 📖 README.md                  # This file
├── 📖 AUTONOMOUS-SUPERVISOR.md   # How autonomous behavior works
├── 📖 SUPERVISOR-CAPABILITIES.md # Full validation capabilities
├── 📖 CORRECT-ARCHITECTURE.md    # Architecture explanation
├── 📖 FINAL-SETUP.md             # Complete setup summary
│
├── docs/                         # ⭐ Shared documentation (single source of truth)
│   ├── role-and-responsibilities.md
│   ├── scar-integration.md
│   ├── bmad-workflow.md
│   ├── subagent-patterns.md
│   ├── context-handoff.md
│   └── epic-sharding.md
│
├── templates/                    # BMAD file templates
│   ├── epic-template.md
│   ├── adr-template.md
│   ├── prd-template.md
│   ├── feature-request.md
│   ├── project-brief.md
│   ├── workflow-status.yaml
│   └── architecture-overview.md
│
├── .claude/commands/             # Subagent roles
│   ├── analyze.md                # Analyst subagent
│   ├── create-epic.md            # PM subagent
│   ├── create-adr.md             # Architect subagent
│   └── plan-feature.md           # Meta-orchestrator
│
├── consilio/                     # ⭐ Project 1 planning workspace
│   ├── CLAUDE.md                 # Supervisor role (autonomous)
│   └── .bmad/                    # Planning artifacts
│       ├── project-brief.md
│       ├── workflow-status.yaml
│       ├── epics/
│       ├── adr/
│       └── prd/
│
├── openhorizon/                  # ⭐ Project 2 planning workspace
│   └── [same structure as consilio]
│
├── health-agent/                 # ⭐ Project 3 planning workspace
│   └── [same structure as consilio]
│
├── odin/                         # ⭐ Project 4 planning workspace
│   └── [same structure as consilio]
│
├── quiculum-monitor/             # ⭐ Project 5 planning workspace
│   └── [same structure as consilio]
│
├── CLAUDE-PROJECT.md             # Template for new projects
└── init-project.sh               # Script to create new projects

**Single Git Repository:**
- All project planning in one repo: https://github.com/gpt153/supervisor
- Each project folder tracked in single repo (no nested .git)
- Simpler maintenance, easier cross-project learning

**Implementation workspaces (separate repos):**
/home/samuel/.archon/workspaces/consilio/      # SCAR works here → gpt153/consilio
/home/samuel/.archon/workspaces/openhorizon.cc/ # SCAR works here → gpt153/openhorizon.cc
/home/samuel/.archon/workspaces/health-agent/   # SCAR works here → gpt153/health-agent
```

---

## 🔑 Key Features

### 1. Autonomous Behavior
- **You:** "Plan feature: authentication"
- **Supervisor:** Automatically creates epic, instructs SCAR, monitors progress
- **You:** Don't need to know technical details

### 2. Complete Separation
- **Planning:** `/home/samuel/supervisor/[project]/` (supervisor workspace)
- **Implementation:** `/home/samuel/.archon/workspaces/[project]/` (SCAR workspace)
- **Validation:** `/home/samuel/.archon/worktrees/[project]/issue-*/` (supervisor reads/tests)

### 3. Full Validation
- Reads implementation code
- Spawns test subagents (unit, integration, E2E, UI)
- Verifies builds succeed
- Checks for mocks/placeholders
- Comprehensive reporting

### 4. Archon MCP Integration
- Task tracking (creates tasks automatically)
- RAG search (finds best practices when creating epics)
- Document storage (ADRs searchable)
- Progress monitoring

### 5. Proactive Monitoring
- Verifies SCAR acknowledgment (20s after posting)
- Checks progress every 2 hours
- Validates automatically when SCAR claims done
- Warns at 60% context, handoff at 80%

### 6. Context Conservation
- Subagent-based architecture (90% savings)
- Meta-orchestrator spawns specialist subagents
- Automatic handoff at 80% threshold
- Zero context loss

---
    │       ├── prd/
    │       ├── epics/
    │       ├── adr/
    │       └── architecture/
    ├── scar/
    └── health-agent/
```

## BMAD Components Implemented

### ✅ Stolen from BMAD

1. **21 Specialized Agents** → Implemented as command roles (Analyst, PM, Architect, etc.)
2. **Scale-Adaptive Intelligence** → Complexity levels 0-4 auto-detected
3. **Epic Sharding** → Self-contained story files (90% token reduction)
4. **Four-Phase Workflow** → Analysis → Planning → Architecture → Implementation
5. **MoSCoW Prioritization** → Must/Should/Could/Won't requirements
6. **Documentation-as-Source-of-Truth** → PRDs, epics, ADRs drive implementation
7. **Architecture Decision Records** → WHY decisions made, not just WHAT
8. **Just-in-Time Documentation** → Create as needed, not upfront
9. **Persistent Documentation** → Update in place, never regenerate
10. **Workflow Status Tracking** → YAML-based phase tracking

### ❌ Not Needed (SCAR Already Provides)

- **Dev Agent** → SCAR is better (95% autonomous vs 60-70%)
- **Scrum Master** → Supervisor already tracks progress
- **Test Architect** → `/verify-scar-phase` handles validation

## Available Commands

### Analysis Phase

**`/analyze <feature-description>`**
- Analyst agent role
- Systematic requirements gathering
- Complexity detection (Level 0-4)
- Output: Feature request document

### Planning Phase

**`/create-epic <feature-name>`**
- PM agent role
- Self-contained epic files
- MoSCoW prioritization
- Task breakdown
- Output: Epic file (`.bmad/epics/NNN-feature.md`)

**`/create-prd <feature-name>`**
- PM agent role (enterprise features)
- Comprehensive Product Requirements Document
- Multiple user stories
- Epic breakdown
- Output: PRD + multiple epics

### Architecture Phase

**`/create-adr <decision-title>`**
- Architect agent role
- Decision documentation
- Alternatives analysis
- Trade-offs captured
- Output: ADR file (`.bmad/adr/NNN-decision.md`)

**`/design-architecture <scope>`**
- Architect agent role
- System design documents
- Component breakdown
- Data flow diagrams
- Output: Architecture docs

### Orchestration

**`/plan-feature <feature-description>`**
- Meta-orchestrator
- Runs full workflow: Analyze → Plan → Architect → Prepare
- Automatically selects complexity-appropriate workflow
- Creates GitHub issues ready for SCAR

### Integration with SCAR

**After planning:**
```bash
# Create GitHub issues from epic
gh issue create --title "..." --body "See epic: .bmad/epics/001-feature.md"

# Start SCAR supervision
/supervise-issue 123

# Or supervise entire project
/supervise
```

## Workflow Tracks

### Quick Flow (Level 0-1)

**Level 0:** Bug fix, typo
```
User Request → GitHub Issue → SCAR
Duration: 5 minutes
Documents: None
```

**Level 1:** Small feature (30 min - 2 hours)
```
User Request → Analyze → Create Epic → GitHub Issues → SCAR
Duration: 30 minutes planning
Documents: Epic only
```

### Standard Flow (Level 2)

**Medium feature (2-4 hours implementation)**
```
User Request → Analyze → Create Epic → Create ADR (if needed) →
GitHub Issues → SCAR
Duration: 1-2 hours planning
Documents: Epic + ADR(s)
```

### Enterprise Flow (Level 3-4)

**Level 3:** Large feature (1-3 days)
```
User Request → Analyze → Create PRD → Create Epics → Create ADRs →
GitHub Issues → SCAR
Duration: 2-4 hours planning
Documents: PRD + Multiple epics + ADRs
```

**Level 4:** Enterprise/compliance (weeks)
```
User Request → Analyze → Create PRD → Design Architecture →
Create Epics → Create ADRs → Test Strategy → GitHub Issues → SCAR
Duration: 4-8 hours planning
Documents: Complete suite
```

## Key Concepts

### Epic Sharding

**Problem:** Giving AI entire codebase causes context overload and hallucinations.

**Solution:** Self-contained epic files with complete context.

**Benefits:**
- 90% token reduction
- No context mixing
- Clear handoff to SCAR
- Easy validation

**Epic file includes:**
- Project context (repo, tech stack)
- Business context (problem, value)
- Complete requirements (MoSCoW)
- Technical approach (patterns, decisions)
- Task breakdown (GitHub issues)
- Acceptance criteria (validation)

### MoSCoW Prioritization

Always use when defining requirements:

- **MUST HAVE:** Core functionality, non-negotiable
- **SHOULD HAVE:** Important but not critical
- **COULD HAVE:** Nice to have if time permits
- **WON'T HAVE:** Explicitly out of scope (prevents scope creep)

### Architecture Decision Records (ADRs)

Document WHY decisions were made:

- **Context:** What forces are at play?
- **Decision:** What are we doing?
- **Rationale:** Why this option?
- **Consequences:** What happens as a result?
- **Alternatives:** What else was considered?

**Benefits:**
- Prevent re-litigating decisions
- Onboard new contributors
- Understand historical context
- Make reversals explicit

### Workflow Status Tracking

YAML file tracks:
- Current phase
- Completed phases
- Active epics
- GitHub issues
- Decision log

**Benefits:**
- Always know where you are
- Clear next steps
- Progress visibility
- Context for resumption

## Multi-Project Isolation

Each project gets its own subdirectory:

```
supervisor/ (single git repo: gpt153/supervisor)
├── consilio/       # Project 1 planning
│   └── .bmad/
├── openhorizon/    # Project 2 planning
│   └── .bmad/
├── health-agent/   # Project 3 planning
│   └── .bmad/
├── odin/           # Project 4 planning
│   └── .bmad/
└── quiculum-monitor/  # Project 5 planning
    └── .bmad/
```

**Physical directory separation prevents:**
- Context mixing
- Pattern bleed
- Decision confusion

**Single Git repo benefits:**
- All planning in one place
- Version control for all decisions
- Simpler backup (one repo)
- Shared history and cross-project learnings
- Natural fit with centralized docs system

**Implementation repos remain separate:**
- Each project has its own implementation repo
- Issues tracked in implementation repos
- Clear separation: planning vs code

## Setup New Project

```bash
# Create project directory in supervisor repo
cd /home/samuel/supervisor
mkdir -p my-project/.bmad/{epics,adr,prd,architecture,discussions}

# Copy or symlink supervisor instructions
cp CLAUDE-PROJECT.md my-project/CLAUDE.md
# Or symlink: ln -s ../CLAUDE-PROJECT.md my-project/CLAUDE.md

# Copy templates
cp templates/project-brief.md my-project/.bmad/
cp templates/workflow-status.yaml my-project/.bmad/

# Edit project brief
vim my-project/.bmad/project-brief.md

# Create implementation repo on GitHub
gh repo create gpt153/my-project --public --description "Implementation for my-project"

# Commit to supervisor repo (single planning repo)
git add my-project/
git commit -m "feat: Add my-project planning workspace"
git push origin main

# Create implementation workspace (for SCAR)
mkdir -p /home/samuel/.archon/workspaces/my-project
cd /home/samuel/.archon/workspaces/my-project
git init
git remote add origin https://github.com/gpt153/my-project.git
```

**Note:** All project planning lives in the single `gpt153/supervisor` repo. Implementation code lives in separate project-specific repos.

## Integration with SCAR Platform

### Handoff Flow

1. **Planning (Supervisor):**
   - Create epic with complete context
   - Document technical decisions (ADRs)
   - Update workflow status

2. **Implementation (SCAR):**
   - Read epic file (self-contained)
   - Implement in isolated worktree
   - Create PR referencing epic

3. **Validation (Supervisor):**
   - `/verify-scar-phase` checks implementation
   - Verify files exist
   - Run build/tests
   - Check for mocks/placeholders

4. **Completion (Supervisor):**
   - Update workflow status
   - Mark epic complete
   - Move to next epic

### Supervisor Monitoring

```bash
# Monitor single issue
/supervise-issue 123

# Monitor entire project (all issues)
/supervise

# Verify specific phase
/verify-scar-phase consilio 123 2
```

## Best Practices

### Planning
1. **Always start with analysis** - Understand before planning
2. **Use MoSCoW for all requirements** - Prevent scope creep
3. **Create ADRs for major decisions** - Document WHY
4. **Break into small tasks** - 30 min to 4 hours per issue
5. **Self-contained epics** - All context in one place

### Implementation
1. **Hand off to SCAR** - Don't implement yourself
2. **Monitor progress** - Use supervisor commands
3. **Validate early** - Check phases as completed
4. **Update workflow status** - Keep YAML current

### Documentation
1. **Just-in-time** - Create docs as needed
2. **Update, don't regenerate** - Preserve history
3. **Link documents** - Connect epics, ADRs, PRDs
4. **Version control** - Commit planning artifacts

## Complexity Assessment Guide

**Level 0 (5 min):** Typo, obvious bug fix
- No analysis needed
- Direct to GitHub issue

**Level 1 (30 min - 2 hours):** Small feature
- Brief analysis
- Single epic file
- 1-3 GitHub issues

**Level 2 (2-4 hours):** Medium feature
- Full analysis
- Epic file
- 1-2 ADRs
- 3-6 GitHub issues

**Level 3 (1-3 days):** Large feature
- Comprehensive analysis
- PRD
- Multiple epics
- Multiple ADRs
- 10+ GitHub issues

**Level 4 (weeks):** Enterprise feature
- Full BMAD methodology
- PRD + architecture docs
- Epic suite
- Complete ADR set
- Test strategy
- 50+ GitHub issues

## Documentation Standards

### File Naming

**Epics:**
```
001-user-authentication.md
002-payment-integration.md
003-admin-dashboard.md
```

**ADRs:**
```
001-postgresql-for-database.md
002-jwt-authentication.md
003-react-context-over-redux.md
```

**PRDs:**
```
user-authentication.md
payment-system.md
admin-features.md
```

### Markdown Style

- Use `#` for h1, `##` for h2, etc.
- Use `**bold**` for emphasis
- Use code blocks with language tags
- Use tables for comparisons
- Use checkboxes for requirements

### YAML Style

- 2-space indentation
- ISO 8601 dates with timezone
- Lowercase keys
- Use `null` for empty values

## Git Workflow

```bash
# Daily commits
git add .bmad/
git commit -m "feat(planning): Add authentication epic"

# After major milestones
git push

# Tag releases
git tag -a v1.0-planning -m "Authentication planning complete"
git push --tags
```

## Success Metrics

You're successful when:

✅ Features clearly defined before implementation starts
✅ No context mixing between projects
✅ Decisions documented with rationale
✅ SCAR receives complete context (epic files)
✅ Implementation validated before marking complete
✅ User understands progress at all times
✅ Planning time < 20% of implementation time
✅ SCAR requires < 5% clarification requests

## References

- **BMAD Method:** https://github.com/bmad-code-org/BMAD-METHOD
- **BMAD Documentation:** https://docs.bmad-method.org
- **SCAR Platform:** https://github.com/gpt153/scar
- **Autonomous Supervision:** `/home/samuel/scar/docs/autonomous-supervision.md`

---

**Created:** 2026-01-15 (Stockholm time)
**Maintained by:** Samuel (gpt153)
**Version:** 1.0
