# Supervisor System Architecture

**Visual guide to how everything fits together**

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (You)                               │
│  "Add user authentication to Consilio"                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPERVISOR (Planning Layer)                         │
│         /home/samuel/supervisor/consilio/                        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Analyst    │→ │      PM      │→ │  Architect   │          │
│  │  /analyze    │  │ /create-epic │  │ /create-adr  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  Feature Request       Epic File          ADR File              │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                            ▼                                     │
│                   GitHub Issue Created                           │
│                   (with epic attached)                           │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SCAR PLATFORM (Implementation Layer)             │
│         /home/samuel/.archon/workspaces/consilio/                │
│                                                                   │
│  1. Read Epic (self-contained context)                           │
│  2. Create Worktree Branch                                       │
│  3. Implement Code                                               │
│  4. Run Tests                                                    │
│  5. Create Pull Request                                          │
│                                                                   │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPERVISOR (Validation)                             │
│                                                                   │
│  /verify-scar-phase consilio 123 2                               │
│  ✅ Files exist                                                  │
│  ✅ Build succeeds                                               │
│  ✅ Tests pass                                                   │
│  ✅ No mocks in production                                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Physical File Layout

```
PLANNING (Supervisor)                    IMPLEMENTATION (SCAR)
━━━━━━━━━━━━━━━━━━━━━                    ━━━━━━━━━━━━━━━━━━━━━

/home/samuel/supervisor/                 /home/samuel/.archon/
├── consilio/                            ├── workspaces/consilio/
│   ├── .git/ → planning repo            │   ├── .git/ → code repo
│   ├── CLAUDE.md (supervisor)           │   ├── CLAUDE.md (scar)
│   └── .bmad/                           │   ├── src/
│       ├── project-brief.md             │   ├── tests/
│       ├── workflow-status.yaml         │   └── package.json
│       ├── epics/                       │
│       │   └── 001-auth.md              └── worktrees/consilio/
│       ├── adr/                             └── issue-123/
│       │   └── 001-jwt.md                       └── src/ (changes)
│       ├── prd/
│       └── architecture/
│
├── scar/                                ├── workspaces/scar/
│   └── .bmad/                           │   └── src/
│
└── health-agent/                        └── workspaces/health-agent/
    └── .bmad/                               └── src/
```

---

## Agent Role Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     /plan-feature                             │
│              (Meta-Orchestrator Command)                      │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
    ┌────────────────┐
    │    ANALYST     │  Systematic Requirements Discovery
    │   /analyze     │
    └────────┬───────┘
             │
             ├─ Level 0: Bug fix        → GitHub Issue (skip planning)
             ├─ Level 1: Small feature  → Create Epic
             ├─ Level 2: Medium feature → Create Epic + ADR
             └─ Level 3-4: Large        → Create PRD + Epics + ADRs
             │
             ▼
    ┌────────────────┐
    │  PRODUCT MGR   │  Epic Sharding
    │  /create-epic  │  MoSCoW Prioritization
    │  /create-prd   │  Task Breakdown
    └────────┬───────┘
             │
             ├─ Self-contained epic file
             ├─ Complete context
             └─ GitHub issue tasks
             │
             ▼
    ┌────────────────┐
    │   ARCHITECT    │  Technical Decisions
    │  /create-adr   │  ADR Documentation
    │  /design-arch  │  System Design
    └────────┬───────┘
             │
             ├─ Architecture Decision Records
             ├─ WHY not just WHAT
             └─ Alternatives analyzed
             │
             ▼
    ┌────────────────┐
    │ SCRUM MASTER   │  Progress Tracking
    │ workflow.yaml  │  Epic Status
    └────────┬───────┘
             │
             ├─ Phase tracking
             ├─ Issue status
             └─ Decision log
             │
             ▼
    ┌────────────────┐
    │   HANDOFF TO   │
    │     SCAR       │
    └────────────────┘
```

---

## Epic Sharding Concept

```
WITHOUT SHARDING (Old Way)               WITH SHARDING (BMAD Way)
━━━━━━━━━━━━━━━━━━━━                    ━━━━━━━━━━━━━━━━━━━━

┌─────────────────────┐                 ┌─────────────────────┐
│   ENTIRE CODEBASE   │                 │   EPIC FILE ONLY    │
│                     │                 │                     │
│  - 1000+ files      │                 │  - Project context  │
│  - 50,000+ lines    │                 │  - Requirements     │
│  - Multiple patterns│                 │  - Tech approach    │
│  - All features     │                 │  - Task breakdown   │
│                     │                 │  - Acceptance       │
│  AI gets confused   │                 │                     │
│  Context overload   │                 │  AI stays focused   │
│  Hallucinations     │                 │  No confusion       │
│  Pattern mixing     │                 │  Clear scope        │
│                     │                 │                     │
│  ⚠️ 200K+ tokens    │                 │  ✅ 5K tokens       │
└─────────────────────┘                 └─────────────────────┘
                                                 │
                                                 ▼
                                        90% token reduction
```

---

## Complexity-Based Workflow Selection

```
USER REQUEST → Analyze → Detect Complexity → Select Workflow

┌────────────────────────────────────────────────────────────────┐
│ Level 0: Bug Fix (5 min)                                       │
│ ━━━━━━━━━━━━━━━━━━━━━                                          │
│ Request → GitHub Issue → SCAR                                  │
│ No planning docs needed                                        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Level 1: Small Feature (30 min planning)                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                          │
│ Request → Analyze → Epic → GitHub Issues → SCAR               │
│ Documents: Epic only                                           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Level 2: Medium Feature (1-2 hours planning)                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                      │
│ Request → Analyze → Epic → ADR → GitHub Issues → SCAR         │
│ Documents: Epic + ADRs                                         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Level 3: Large Feature (2-4 hours planning)                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                       │
│ Request → Analyze → PRD → Epics → ADRs → Issues → SCAR        │
│ Documents: PRD + Multiple Epics + ADRs                         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Level 4: Enterprise Feature (4-8 hours planning)               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                 │
│ Request → Analyze → PRD → Architecture → Epics → ADRs →       │
│ Test Strategy → Issues → SCAR                                 │
│ Documents: Complete BMAD suite                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Multi-Project Isolation

```
BROWSER TABS (Fast Switching)            PHYSICAL ISOLATION
━━━━━━━━━━━━━━━━━━━━━━━━                ━━━━━━━━━━━━━━━━━━

┌──────────────────────┐                ┌──────────────────────┐
│  Tab 1: Consilio     │────────────────│ /supervisor/consilio/│
│  Planning auth       │                │ .bmad/epics/         │
└──────────────────────┘                └──────────────────────┘

┌──────────────────────┐                ┌──────────────────────┐
│  Tab 2: SCAR         │────────────────│ /supervisor/scar/    │
│  Planning features   │                │ .bmad/epics/         │
└──────────────────────┘                └──────────────────────┘

┌──────────────────────┐                ┌──────────────────────┐
│  Tab 3: Health Agent │────────────────│ /supervisor/health/  │
│  Planning tracking   │                │ .bmad/epics/         │
└──────────────────────┘                └──────────────────────┘

        ▲                                         │
        │                                         │
        │                                         ▼
   Fast switching                      Zero context mixing
   No CLI needed                       Impossible to confuse
```

---

## MoSCoW Prioritization Example

```
FEATURE: User Authentication

┌────────────────────────────────────────────────────────────┐
│ MUST HAVE (Non-negotiable)                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━                                │
│ ✓ Email/password signup                                    │
│ ✓ Email/password login                                     │
│ ✓ JWT token generation                                     │
│ ✓ Password hashing (bcrypt)                                │
│ ✓ Protected route middleware                               │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ SHOULD HAVE (Important, high priority)                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                        │
│ ○ Password strength validation                             │
│ ○ Password reset via email                                 │
│ ○ Remember me functionality                                │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ COULD HAVE (Nice to have)                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━                                 │
│ ◇ Social login (Google, GitHub)                            │
│ ◇ Two-factor authentication                                │
│ ◇ Session management dashboard                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ WON'T HAVE (Explicitly out of scope)                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                        │
│ ✗ OAuth provider integration (deferred to v2)              │
│ ✗ Biometric authentication (mobile only)                   │
│ ✗ LDAP integration (enterprise feature)                    │
└────────────────────────────────────────────────────────────┘

Benefits:
- Clear priorities
- Prevents scope creep
- Explicit about what's NOT included
- Can launch with MUST + SHOULD
```

---

## ADR (Architecture Decision Record) Example

```
┌────────────────────────────────────────────────────────────┐
│ ADR 002: JWT Authentication                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━                              │
│                                                             │
│ CONTEXT:                                                    │
│ Need authentication for API endpoints.                     │
│ Must scale horizontally.                                   │
│ Solo developer maintenance.                                │
│                                                             │
│ DECISION:                                                   │
│ Use JWT tokens with 1-hour expiry + refresh tokens         │
│                                                             │
│ ALTERNATIVES CONSIDERED:                                    │
│ 1. Sessions (rejected - requires shared state)             │
│ 2. API keys (rejected - not user-specific)                 │
│ 3. OAuth only (rejected - overkill for MVP)                │
│                                                             │
│ RATIONALE:                                                  │
│ ✅ Stateless (scales horizontally)                         │
│ ✅ Standard approach (good ecosystem)                      │
│ ✅ Simple to implement                                     │
│ ❌ Token storage risk (mitigated: short expiry)           │
│                                                             │
│ CONSEQUENCES:                                               │
│ + No session storage needed                                │
│ + Can add more API servers easily                          │
│ - Need to implement token refresh                          │
│ - Must handle token expiry in frontend                     │
└────────────────────────────────────────────────────────────┘

Future readers know:
- WHY JWT was chosen
- What alternatives were considered
- What trade-offs were made
- When to revisit this decision
```

---

## Workflow Status Tracking Example

```yaml
# .bmad/workflow-status.yaml

project: consilio
current_phase: implementation
complexity_level: 2
current_epic: 001-user-authentication

phases:
  analysis:
    status: completed
    started_at: 2026-01-15T10:00:00+01:00
    completed_at: 2026-01-15T10:30:00+01:00
    agent: analyst
    outputs:
      - feature-requests/user-authentication.md

  planning:
    status: completed
    started_at: 2026-01-15T10:30:00+01:00
    completed_at: 2026-01-15T11:15:00+01:00
    agent: pm
    outputs:
      - epics/001-user-authentication.md

  architecture:
    status: completed
    started_at: 2026-01-15T11:15:00+01:00
    completed_at: 2026-01-15T11:45:00+01:00
    agent: architect
    outputs:
      - adr/002-jwt-authentication.md

  implementation:
    status: in_progress
    started_at: 2026-01-15T12:00:00+01:00
    agent: scar
    github_issues:
      - number: 42
        title: "Backend: Users table migration"
        status: done
      - number: 43
        title: "Backend: Auth API endpoints"
        status: in_progress
      - number: 44
        title: "Frontend: Login form"
        status: open

# Always know:
# - Where you are
# - What's been completed
# - What's next
# - Who's working on what
```

---

## Templates Provided

```
/home/samuel/supervisor/templates/

📄 epic-template.md
   - Self-contained story file
   - Project context
   - Business context
   - Requirements (MoSCoW)
   - Technical approach
   - Task breakdown
   - Acceptance criteria

📄 adr-template.md
   - Context (forces at play)
   - Decision (what we're doing)
   - Rationale (why this wins)
   - Consequences (what happens)
   - Alternatives (what else considered)
   - Implementation plan
   - Success metrics

📄 prd-template.md
   - Executive summary
   - Problem statement
   - User stories
   - Requirements (MoSCoW)
   - UX flows
   - Technical considerations
   - Epic breakdown
   - Testing strategy

📄 architecture-overview.md
   - System context
   - Component breakdown
   - Data architecture
   - API design
   - Security architecture
   - Deployment architecture

📄 feature-request.md
   - Quick feature capture
   - Problem/need
   - Priority
   - Complexity (assessed later)

📄 project-brief.md
   - Vision
   - Goals
   - Stakeholders
   - Scope
   - Technical context
   - Constraints

📄 workflow-status.yaml
   - Current phase
   - Phase history
   - Epic status
   - Issue tracking
   - Decision log
```

---

## Quick Start

```bash
# 1. Initialize project
cd /home/samuel/supervisor
./init-project.sh consilio https://github.com/gpt153/consilio-planning.git

# 2. Start planning
cd consilio
/analyze "Add user authentication"

# 3. Follow workflow
/create-epic user-authentication
/create-adr jwt-authentication

# 4. Create GitHub issues
gh issue create --title "Backend: Auth API" --body "See epic: .bmad/epics/001-auth.md"

# 5. Start SCAR supervision
/supervise-issue 42

# 6. Validate when done
/verify-scar-phase consilio 42 2
```

---

## System Benefits Summary

✅ **90% token reduction** - Epic sharding prevents context overload
✅ **Zero context mixing** - Physical project isolation
✅ **Decision memory** - ADRs capture WHY not just WHAT
✅ **Systematic planning** - Analyst asks right questions
✅ **Clear priorities** - MoSCoW prevents scope creep
✅ **Progress visibility** - Workflow YAML tracks everything
✅ **SCAR integration** - Seamless handoff with complete context
✅ **Multi-project support** - Work on 3+ projects simultaneously
✅ **Scale-adaptive** - Complexity-appropriate workflows
✅ **Just-in-time docs** - Create only what's needed

---

**Complete BMAD methodology integrated with SCAR platform.**
**Ready to use. Fully documented. Thoroughly tested design.**
