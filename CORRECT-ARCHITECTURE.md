# Correct Architecture - Complete Separation!

**Created:** 2026-01-15 (Stockholm time)
**Principle:** COMPLETE separation between planning and implementation

---

## ✅ The Principle

**Two completely separate locations:**

1. **Planning workspace** - `/home/samuel/supervisor/[project]/`
   - YOU work here as SUPERVISOR
   - Planning only (epics, ADRs, PRDs)
   - NO implementation code

2. **Implementation workspace** - `/home/samuel/.archon/workspaces/[project]/`
   - SCAR works here
   - Implementation code only
   - NO planning artifacts

**Why separate?**
- ✅ NO context mixing between supervisor and SCAR roles
- ✅ Clear separation of concerns
- ✅ Each has its own CLAUDE.md with different instructions
- ✅ Easier to manage (you never accidentally read implementation code when planning)

---

## 📂 Directory Structure

### Planning Workspace (Supervisor)

```
/home/samuel/supervisor/consilio/
├── CLAUDE.md                      # Supervisor role and instructions
├── .bmad/                         # Planning artifacts
│   ├── project-brief.md           # Vision, goals, constraints
│   ├── workflow-status.yaml       # Phase tracking
│   ├── epics/                     # Self-contained story files
│   │   ├── 001-user-auth.md
│   │   └── 002-email-routing.md
│   ├── adr/                       # Architecture decision records
│   │   ├── 001-jwt-auth.md
│   │   └── 002-postgres-rls.md
│   ├── prd/                       # Product requirements
│   ├── architecture/              # System design docs
│   ├── discussions/               # Design discussions
│   └── feature-requests/          # User feature requests
└── .git/                          # Planning repo (separate from implementation)
```

**Same structure for:**
- `/home/samuel/supervisor/openhorizon/`
- `/home/samuel/supervisor/health-agent/` (when created)
- `/home/samuel/supervisor/[any-project]/`

### Implementation Workspace (SCAR)

```
/home/samuel/.archon/workspaces/consilio/
├── CLAUDE.md                      # SCAR implementation guide
├── backend/                       # Code
├── frontend/                      # Code
├── package.json
├── tsconfig.json
└── .git/                          # Implementation repo
```

**Existing workspaces:**
- `/home/samuel/.archon/workspaces/consilio/`
- `/home/samuel/.archon/workspaces/openhorizon.cc/`
- `/home/samuel/.archon/workspaces/health-agent/`
- etc.

### Shared Documentation (All Projects)

```
/home/samuel/supervisor/docs/
├── role-and-responsibilities.md   # What supervisor does
├── scar-integration.md            # How to work with SCAR
├── bmad-workflow.md               # BMAD methodology
├── subagent-patterns.md           # Context conservation
├── context-handoff.md             # Automatic handoff at 80%
└── epic-sharding.md               # 90% token reduction
```

---

## 🎯 How It Works

### When Planning (You as Supervisor)

**Start Claude Code in planning workspace:**
```bash
cd /home/samuel/supervisor/consilio
```

**Session loads:**
1. Reads `CLAUDE.md` (supervisor role)
2. References shared docs in `../docs/*.md`
3. You have access to `.bmad/` directory for creating artifacts

**Workflow:**
```
User: "Plan feature: user authentication"
  ↓
Supervisor detects complexity level (0-4)
  ↓
Spawns Analyst subagent → .bmad/feature-requests/001-user-auth.md
  ↓
Spawns PM subagent → .bmad/epics/001-user-auth.md
  ↓
Spawns Architect subagent → .bmad/adr/002-jwt-auth.md
  ↓
Creates GitHub issue with epic content
  ↓
Verifies SCAR acknowledgment (20s)
```

### When Implementing (SCAR)

**SCAR receives GitHub issue:**
```bash
@scar - Implement following epic specifications.

Epic: https://github.com/gpt153/consilio-planning/blob/main/.bmad/epics/001-user-auth.md

Acceptance Criteria:
- [ ] All MUST HAVE requirements from epic
- [ ] Build succeeds
- [ ] Tests pass
```

**SCAR's workflow:**
1. Clones implementation repo to worktree
2. Reads CLAUDE.md (implementation guide with tech stack)
3. Fetches epic from planning repo URL
4. Implements code
5. Creates PR

**SCAR never touches planning workspace!**

---

## 🔗 How They Connect

**Via GitHub issues:**

1. Supervisor creates epic in planning workspace: `/home/samuel/supervisor/consilio/.bmad/epics/001-user-auth.md`

2. Supervisor commits and pushes to planning repo: `https://github.com/gpt153/consilio-planning`

3. Supervisor creates GitHub issue in implementation repo:
   ```markdown
   @scar - Implement authentication feature

   Epic: https://github.com/gpt153/consilio-planning/blob/main/.bmad/epics/001-user-auth.md
   ```

4. SCAR reads:
   - Implementation CLAUDE.md from `/home/samuel/.archon/workspaces/consilio/CLAUDE.md`
   - Epic from GitHub URL (planning repo)

5. SCAR implements in `/home/samuel/.archon/worktrees/consilio/issue-123/`

6. SCAR creates PR in implementation repo

**Complete separation. No context mixing.**

---

## 📋 Two CLAUDE.md Files

### Planning CLAUDE.md (Supervisor reads this)

**Location:** `/home/samuel/supervisor/consilio/CLAUDE.md`

**Purpose:** Define supervisor role for this project

**Contains:**
- Your responsibilities (planning, orchestration, validation)
- References to shared docs in `../docs/`
- Quick commands for planning workflow
- SCAR instruction patterns
- Critical rules

**Who reads it:** You when planning features

### Implementation CLAUDE.md (SCAR reads this)

**Location:** `/home/samuel/.archon/workspaces/consilio/CLAUDE.md`

**Purpose:** Define implementation guidelines

**Contains:**
- Technical stack (Node.js, TypeScript, PostgreSQL)
- Coding standards (no `any`, strict types)
- Database schemas
- API patterns
- Security requirements
- Testing requirements

**Who reads it:** SCAR when implementing features

**Key difference:**
- Planning CLAUDE.md = "WHAT to build and WHY"
- Implementation CLAUDE.md = "HOW to build it"

---

## 🚀 Usage Examples

### Example 1: Plan New Feature

```bash
# Terminal 1: Start planning session
cd /home/samuel/supervisor/consilio

# In Claude Code:
User: "Plan feature: user authentication with JWT"

Supervisor:
1. Spawns Analyst subagent → creates feature request
2. Spawns PM subagent → creates epic with MoSCoW priorities
3. Spawns Architect subagent → creates ADR for JWT decision
4. Commits artifacts to planning repo
5. Pushes to GitHub (consilio-planning repo)
6. Creates GitHub issue in implementation repo
7. Verifies SCAR acknowledgment
```

### Example 2: SCAR Implements

```bash
# SCAR sees GitHub issue #123
# Automatic workflow:

1. Clone implementation repo to worktree
2. Read CLAUDE.md (implementation guide)
3. Fetch epic from planning repo URL
4. Implement backend/auth/jwt.ts
5. Implement tests
6. Create PR
7. Comment progress on issue
```

### Example 3: Supervisor Validates

```bash
# In planning workspace
cd /home/samuel/supervisor/consilio

# Spawn verification subagent
/verify-scar-phase consilio 123 2

# Subagent:
1. Checks worktree for files
2. Runs build
3. Runs tests
4. Searches for mocks
5. Returns APPROVED / REJECTED / NEEDS FIXES
```

---

## ✅ Current Status

**Planning workspaces (created):**
- `/home/samuel/supervisor/consilio/` ✅
  - Git initialized
  - .bmad/ structure created
  - CLAUDE.md with supervisor role
  - project-brief.md with correct paths

- `/home/samuel/supervisor/openhorizon/` ✅
  - Git initialized
  - .bmad/ structure created
  - CLAUDE.md with supervisor role
  - project-brief.md with correct paths

**Implementation workspaces (already exist):**
- `/home/samuel/.archon/workspaces/consilio/` ✅
  - Has CLAUDE.md with implementation guide
  - Has backend/ and frontend/ code
  - Git initialized

- `/home/samuel/.archon/workspaces/openhorizon.cc/` ✅
  - Has CLAUDE.md with implementation guide
  - Has app/ and project-pipeline/ code
  - Git initialized

**Shared documentation:**
- `/home/samuel/supervisor/docs/` ✅
  - 6 detailed guides (26.1KB)
  - Single source of truth for all projects

---

## 🔧 For Future Projects

**Adding a new project:**

```bash
# 1. Create planning workspace
cd /home/samuel/supervisor
./init-project.sh new-project https://github.com/gpt153/new-project-planning.git

# This creates:
# - /home/samuel/supervisor/new-project/
# - .bmad/ structure
# - CLAUDE.md (supervisor role)
# - Git initialized

# 2. If implementation workspace doesn't exist yet:
cd /home/samuel/.archon/workspaces
mkdir new-project
cd new-project

# Create implementation CLAUDE.md
vim CLAUDE.md  # Add tech stack, coding standards, etc.

# Initialize project
npm init -y
git init
git add .
git commit -m "feat: Initialize project"
```

---

## 📊 Benefits

### For You
✅ **Zero context mixing** - Planning and implementation completely separate
✅ **Clear roles** - You know which workspace to use for what
✅ **Easy updates** - Edit shared docs once, applies everywhere
✅ **No confusion** - Two distinct CLAUDE.md files with different purposes

### For AI
✅ **Clear instructions** - Different CLAUDE.md for different roles
✅ **Context conservation** - Load only what's needed
✅ **Subagent patterns** - 90% context savings
✅ **Automatic handoff** - At 80% threshold

### For Workflow
✅ **Physical isolation** - Separate Git repos for planning vs implementation
✅ **Version control** - Planning artifacts versioned separately
✅ **Scalable** - Add 100 projects with same structure
✅ **Traceable** - Clear history of planning decisions

---

## 🎯 The Key Insight

**Different workspaces = Different contexts = No mixing!**

When you're in `/home/samuel/supervisor/consilio/`, you're ONLY planning.
When SCAR is in `/home/samuel/.archon/workspaces/consilio/`, it's ONLY implementing.

**They connect via:**
- GitHub issues (handoff point)
- Epic URLs (planning repo → implementation issue)
- Validation commands (`/verify-scar-phase`)

**But they NEVER work in the same directory!**

---

**Complete separation. Clear roles. Zero confusion. Ready to build!** 🚀
