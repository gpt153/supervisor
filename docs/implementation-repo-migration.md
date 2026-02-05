# Implementation Repo Migration Strategy

**Date:** 2026-01-18
**Question:** Can we clone implementation repos into planning dirs?

**Answer:** YES! This is the single-repo-per-project approach.

---

## Proposed Directory Structure

### Before (Current - Dual Repo)

```
Planning:
/home/samuel/supervisor/
├── consilio/           # Planning artifacts only
│   └── .bmad/
│       ├── epics/
│       ├── adr/
│       └── PRD.md

Implementation:
/home/samuel/.archon/workspaces/
└── consilio/           # Code only (SCAR's workspace)
    ├── src/
    ├── tests/
    └── package.json
```

**Problems:**
- Two directories to track
- Confusing which is which
- Must use `--repo` flag for GitHub issues
- Context switching

### After (Proposed - Single Repo)

```
/home/samuel/supervisor/
└── consilio/           # Everything in one place
    ├── src/            # Code
    ├── tests/          # Tests
    ├── docs/
    │   └── planning/   # Planning artifacts moved here
    │       ├── epics/
    │       ├── adr/
    │       └── PRD.md
    ├── .agents/
    │   └── plans/      # PIV plans
    ├── CLAUDE.md       # Supervisor instructions
    ├── package.json
    └── README.md
```

**Benefits:**
- ✅ Single directory per project
- ✅ Everything version controlled together
- ✅ No `--repo` flag confusion
- ✅ Standard industry practice
- ✅ Easier for non-coder to understand

---

## Migration Plan

### Phase 1: Clone Repos (Safe, Non-Destructive)

**For each project:**

```bash
# Clone implementation repo into supervisor directory
cd /home/samuel/supervisor/
git clone https://github.com/gpt153/consilio.git consilio

# Now you have:
# /home/samuel/supervisor/consilio/ (full repo)
# /home/samuel/.archon/workspaces/consilio/ (SCAR's workspace - keep for now)
```

### Phase 2: Move Planning Artifacts

**For each project:**

```bash
cd /home/samuel/supervisor/consilio

# Create planning directory
mkdir -p docs/planning

# Move existing planning artifacts
mv /home/samuel/supervisor/consilio-old/.bmad/epics docs/planning/epics
mv /home/samuel/supervisor/consilio-old/.bmad/adr docs/planning/adr
mv /home/samuel/supervisor/consilio-old/.bmad/PRD.md docs/planning/
mv /home/samuel/supervisor/consilio-old/.bmad/project-brief.md docs/planning/

# Create .agents directory for PIV plans
mkdir -p .agents/plans

# Commit to repo
git add docs/planning .agents
git commit -m "Add planning artifacts to repo"
git push
```

### Phase 3: Update Supervisor Instructions

**Create/update CLAUDE.md in each project:**

```bash
cd /home/samuel/supervisor/consilio

# Copy supervisor instructions
cp /home/samuel/supervisor/consilio-old/CLAUDE.md ./CLAUDE.md

# Update paths in CLAUDE.md
sed -i 's|/home/samuel/supervisor/consilio|/home/samuel/supervisor/consilio|g' CLAUDE.md
sed -i 's|.bmad/epics|docs/planning/epics|g' CLAUDE.md
sed -i 's|.bmad/adr|docs/planning/adr|g' CLAUDE.md

# Commit
git add CLAUDE.md
git commit -m "Add supervisor instructions"
git push
```

### Phase 4: Keep SCAR Workspace Intact (For Now)

**Don't touch .archon/workspaces yet:**

```bash
# Keep these for reference and migration period
/home/samuel/.archon/workspaces/consilio/  # SCAR's workspace
/home/samuel/.archon/worktrees/consilio/   # SCAR's worktrees

# supervisor-service will work in new location
/home/samuel/supervisor/consilio/          # New unified location
```

**Why keep both:**
- Safe migration (can compare old vs new)
- SCAR can finish in-progress work
- Reference for any edge cases
- Easy rollback if needed

### Phase 5: Update supervisor-service Config

**Point supervisor-service to new locations:**

```yaml
# .config/projects.yaml

projects:
  consilio:
    path: /home/samuel/supervisor/consilio  # Updated path
    repo: https://github.com/gpt153/consilio
    planning_dir: docs/planning              # New planning location
    piv_plans_dir: .agents/plans
    mcp_endpoint: /mcp/consilio
```

### Phase 6: Test New Structure

**Verify everything works:**

```bash
# Test reading planning files
cd /home/samuel/supervisor/consilio
cat docs/planning/epics/epic-001.md  # Should work

# Test Git operations
git status
git log

# Test supervisor can access
# (via supervisor-service MCP)
```

---

## Final Directory Structure (All Projects)

```
/home/samuel/supervisor/
├── docs/                       # Shared documentation
│   ├── role-and-responsibilities.md
│   ├── bmad-workflow.md
│   └── ...
├── templates/                  # BMAD templates
├── .ui-services/              # UI workflow services
├── .claude/commands/          # Shared subagent commands
│
├── consilio/                  # Consilio project (FULL REPO)
│   ├── src/
│   ├── tests/
│   ├── docs/
│   │   └── planning/          # Planning artifacts
│   │       ├── epics/
│   │       ├── adr/
│   │       └── PRD.md
│   ├── .agents/
│   │   └── plans/             # PIV plans
│   ├── CLAUDE.md              # Project supervisor
│   └── package.json
│
├── odin/                      # Odin project (FULL REPO)
│   ├── src/
│   ├── docs/planning/
│   ├── .agents/plans/
│   └── CLAUDE.md
│
├── health-agent/              # Health-Agent project (FULL REPO)
│   ├── src/
│   ├── docs/planning/
│   ├── .agents/plans/
│   └── CLAUDE.md
│
└── openhorizon/               # OpenHorizon project (FULL REPO)
    ├── src/
    ├── docs/planning/
    ├── .agents/plans/
    └── CLAUDE.md

# Keep for migration period (eventually delete)
/home/samuel/.archon/
└── workspaces/
    ├── consilio/              # Old SCAR workspace
    ├── odin/
    ├── health-agent/
    └── openhorizon/
```

---

## Advantages of New Structure

### For User (Non-Coder)

**Simple mental model:**
- One directory = one project
- Everything in one place
- Just `cd consilio` to work on Consilio

**No confusion:**
- No "which repo am I in?"
- No "planning or implementation?"
- No `--repo` flag needed

### For Supervisor

**Easier operations:**
```bash
# Read epic
/home/samuel/supervisor/consilio/docs/planning/epics/epic-001.md

# Read code
/home/samuel/supervisor/consilio/src/components/Dashboard.tsx

# Create PIV plan
/home/samuel/supervisor/consilio/.agents/plans/dark-mode.md

# Run tests
cd /home/samuel/supervisor/consilio && npm test

# All in same directory!
```

### For Git

**Better version control:**
- Planning and code versioned together
- Can see what changed in same commit
- PRs can include planning updates
- History shows full context

### For Collaboration

**Industry standard:**
- Most repos have `docs/` folder
- Contributors expect this structure
- README in root explains both code and planning
- Easier to open source

---

## Migration Timeline

### Week 1: Clone Repos
- Clone all 5 implementation repos into supervisor/
- Don't touch anything else yet
- Verify clones are complete

### Week 2: Move Planning Artifacts
- Move epics, ADRs, PRDs into docs/planning/
- Create .agents/plans/ directories
- Update CLAUDE.md files
- Commit and push

### Week 3: Update supervisor-service
- Point to new paths in config
- Test reading planning files
- Test spawning agents in new locations
- Verify everything works

### Week 4: Test with One Project
- Choose pilot (Odin recommended)
- Complete one full feature in new structure
- Validate workflow end-to-end
- Fix any issues

### Week 5+: Migrate Others
- Migrate remaining projects one by one
- Keep .archon/workspaces as backup
- Eventually delete .archon/workspaces when confident

---

## Rollback Plan (If Needed)

**If new structure doesn't work:**

```bash
# supervisor-service can point back to old locations
# Change config:
projects:
  consilio:
    path: /home/samuel/.archon/workspaces/consilio  # Old location
    planning_dir: /home/samuel/supervisor/consilio/.bmad  # Old planning

# Nothing lost, easy to revert
```

---

## Recommendation

**Yes, clone implementation repos into planning dirs!**

**Do it:**
- ✅ Industry standard structure
- ✅ Simpler for non-coder
- ✅ One directory per project
- ✅ No dual-repo confusion

**Keep .archon/workspaces during migration:**
- Safe rollback option
- Reference for comparison
- SCAR can finish in-progress work
- Delete after 1-2 months when confident

**Start with:**
1. Clone one repo (Odin) into supervisor/odin/
2. Move planning artifacts
3. Test with supervisor-service
4. Validate workflow
5. Repeat for other projects

**This is the right direction!** 👍
