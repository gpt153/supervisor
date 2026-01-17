# Repository Consolidation - 2026-01-17

**Decision:** Consolidate all project planning repos into single supervisor repo

## What Changed

### Before (Multiple Repos)
```
gpt153/supervisor-planning     → Meta-supervisor tracking
gpt153/consilio-planning       → Consilio planning
gpt153/openhorizon-planning    → OpenHorizon planning
gpt153/health-agent-planning   → Health Agent planning
gpt153/odin-planning           → Odin planning
gpt153/quiculum-monitor-planning → Quiculum Monitor planning

Total: 6 separate planning repositories
```

### After (Single Repo)
```
gpt153/supervisor → ALL planning in one repo
├── .bmad/                 → Meta-supervisor tracking
├── consilio/              → Consilio planning
├── openhorizon/           → OpenHorizon planning
├── health-agent/          → Health Agent planning
├── odin/                  → Odin planning
├── quiculum-monitor/      → Quiculum Monitor planning
├── docs/                  → Shared documentation
└── templates/             → Shared templates

Total: 1 planning repository
```

### Implementation Repos (Unchanged)
```
gpt153/consilio            → Consilio code + issues
gpt153/openhorizon.cc      → OpenHorizon code + issues
gpt153/health-agent        → Health Agent code + issues
gpt153/odin                → Odin code + issues

(Future: quiculum-monitor implementation repo when needed)
```

## Why This Change?

### Original Concern
**Question:** "Planning issues would mix with implementation issues if we consolidate"

**Answer:** This concern was incorrect!
- Implementation issues always live in implementation repos (gpt153/consilio, etc.)
- Planning repos are just document storage (epics, ADRs, workflow tracking)
- No issue mixing occurs because issues are in separate repos

### Benefits of Single Repo

1. **Simplicity**
   - One repo to clone/backup instead of six
   - One place for all planning work
   - Easier onboarding (clone once, get everything)

2. **Cross-Project Learning**
   - Easier to reference learnings across projects
   - Shared templates naturally in same repo
   - Can see all planning evolution in one git history
   - Natural fit with centralized docs system

3. **Operational Efficiency**
   - One repo to maintain
   - Single backup strategy
   - Easier to update shared docs (one commit updates all)
   - Simpler CI/CD for validation

4. **Consistency**
   - All projects follow same structure (enforced naturally)
   - Shared templates ensure uniformity
   - Easier to track meta-supervisor improvements

5. **Better Architecture**
   - Meta-supervisor managing all projects → single repo reflects this
   - Centralized documentation → single repo makes sense
   - Planning vs implementation clearly separated

### Minor Trade-offs Accepted

1. **Git History Mixing**
   - All project planning commits interleaved
   - Can filter with `git log -- consilio/` if needed
   - Not a real problem in practice

2. **Can't Version Projects Independently**
   - Can't tag "consilio-planning-v1.0" separately
   - Can use conventional commits for clarity instead
   - Not a significant issue

3. **All-or-Nothing Access**
   - Can't grant access to just one project's planning
   - Not relevant for solo developer
   - If needed later, can split out

## Migration Process

### 1. Backup All Repos
```bash
# Committed all pending changes in each project repo
# Pushed to remotes (consilio-planning, openhorizon-planning, etc.)
```

### 2. Remove Nested Git Repos
```bash
# Removed .git directories from project subfolders
rm -rf consilio/.git openhorizon/.git health-agent/.git odin/.git quiculum-monitor/.git

# Removed from git index as submodules
git rm --cached consilio openhorizon health-agent odin quiculum-monitor

# Added back as regular directories
git add consilio/ openhorizon/ health-agent/ odin/ quiculum-monitor/
```

### 3. Rename Supervisor Repo
```bash
# Renamed gpt153/supervisor-planning → gpt153/supervisor
gh repo rename supervisor --repo gpt153/supervisor-planning --yes

# Updated remote
git remote set-url planning https://github.com/gpt153/supervisor.git
git remote rename planning origin
```

### 4. Commit Consolidated Structure
```bash
git commit -m "feat: Consolidate all project planning repos into single supervisor repo"
git push origin main
```

### 5. Update Documentation
```bash
# Updated:
# - CLAUDE.md (root supervisor instructions)
# - README.md (architecture, setup guide)
# - (Future: GETTING-STARTED.md, docs/CENTRALIZED-SUPERVISOR-SYSTEM.md)

git commit -m "docs: Update documentation to reflect single-repo architecture"
git push origin main
```

### 6. Archive Old Planning Repos
```bash
# Archived (not deleted) for historical reference
gh repo archive gpt153/consilio-planning --yes
gh repo archive gpt153/openhorizon-planning --yes
gh repo archive gpt153/health-agent-planning --yes
gh repo archive gpt153/odin-planning --yes
gh repo archive gpt153/quiculum-monitor-planning --yes
```

## Results

### GitHub Repos (After)
- **gpt153/supervisor** (active) - All planning
- gpt153/consilio-planning (archived) - Historical reference
- gpt153/openhorizon-planning (archived) - Historical reference
- gpt153/health-agent-planning (archived) - Historical reference
- gpt153/odin-planning (archived) - Historical reference
- gpt153/quiculum-monitor-planning (archived) - Historical reference
- **gpt153/consilio** (active) - Implementation
- **gpt153/openhorizon.cc** (active) - Implementation
- **gpt153/health-agent** (active) - Implementation
- **gpt153/odin** (active) - Implementation

### File Structure
```
/home/samuel/supervisor/  (git repo: gpt153/supervisor)
├── .bmad/                # Meta-supervisor BMAD tracking
│   ├── epics/            # Supervisor improvement epics
│   └── workflow-status.yaml
├── docs/                 # Shared documentation (centralized)
├── templates/            # Shared templates
├── consilio/             # Consilio planning (no .git)
│   └── .bmad/
├── openhorizon/          # OpenHorizon planning (no .git)
│   └── .bmad/
├── health-agent/         # Health Agent planning (no .git)
│   └── .bmad/
├── odin/                 # Odin planning (no .git)
│   └── .bmad/
├── quiculum-monitor/     # Quiculum Monitor planning (no .git)
│   └── .bmad/
└── README.md

Implementation workspaces (separate):
/home/samuel/.archon/workspaces/consilio/      (git: gpt153/consilio)
/home/samuel/.archon/workspaces/openhorizon.cc/ (git: gpt153/openhorizon.cc)
/home/samuel/.archon/workspaces/health-agent/   (git: gpt153/health-agent)
/home/samuel/.archon/workspaces/odin/           (git: gpt153/odin)
```

### Issue Tracking (Unchanged)
- **Implementation issues:** In implementation repos
  - Consilio features/bugs → gpt153/consilio/issues
  - OpenHorizon features/bugs → gpt153/openhorizon.cc/issues
  - Health Agent features/bugs → gpt153/health-agent/issues

- **Supervisor improvement issues:** gpt153/supervisor/issues
  - Meta-project tracking
  - Supervisor enhancements
  - Documentation improvements

- **No issue mixing** - Implementation and planning issues in separate repos

## Future Workflow

### Creating New Project
```bash
# 1. Create project folder in supervisor repo
cd /home/samuel/supervisor
mkdir -p new-project/.bmad/{epics,adr,prd}
cp templates/* new-project/.bmad/
cp CLAUDE-PROJECT.md new-project/CLAUDE.md

# 2. Create implementation repo on GitHub
gh repo create gpt153/new-project --public

# 3. Commit to supervisor repo
git add new-project/
git commit -m "feat: Add new-project planning workspace"
git push origin main

# 4. Set up implementation workspace for SCAR
mkdir -p /home/samuel/.archon/workspaces/new-project
cd /home/samuel/.archon/workspaces/new-project
git init
git remote add origin https://github.com/gpt153/new-project.git
```

### Daily Workflow
```bash
# Work on any project planning
cd /home/samuel/supervisor
# Edit files in consilio/, openhorizon/, etc.

# Commit all planning changes to single repo
git add .
git commit -m "feat(consilio): Add epic 008 for authentication"
git push origin main

# Work on implementation (SCAR does this)
cd /home/samuel/.archon/workspaces/consilio
# SCAR works here, commits to gpt153/consilio
```

## Success Criteria

- ✅ All planning consolidated into gpt153/supervisor
- ✅ Old repos archived (not deleted) for historical reference
- ✅ Documentation updated to reflect new structure
- ✅ Implementation repos unchanged
- ✅ No data loss (all git history preserved)
- ✅ Simpler maintenance going forward

## References

- Original discussion: User question about single vs multiple repos
- Analysis: Pros and cons documented in conversation
- Decision: Single repo for all planning, separate implementation repos
- GitHub repo: https://github.com/gpt153/supervisor

---

**Completed:** 2026-01-17
**Performed by:** Root Supervisor (Claude Sonnet 4.5)
**Approved by:** User
