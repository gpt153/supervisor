# Modular Documentation Structure

**Created:** 2026-01-15 (Stockholm time)
**Design:** Lean project CLAUDE.md files that reference shared documentation

---

## Architecture Benefits

### ✅ Single Source of Truth

**All detailed documentation in `/home/samuel/supervisor/docs/`:**
- Update once → applies to all projects
- No need to propagate changes
- Consistent across all projects

### ✅ Lean Project Files

**Each project's CLAUDE.md is ~3KB (vs 20KB monolithic):**
- Quick to read
- Easy to navigate
- References detailed docs
- Project-specific context minimal

### ✅ Easy Maintenance

**To update any feature:**
1. Edit file in `/home/samuel/supervisor/docs/`
2. Done! All projects get the update automatically
3. No propagation needed

---

## Directory Structure

```
/home/samuel/supervisor/
│
├── CLAUDE.md                          # Original (now deprecated, use CLAUDE-PROJECT.md)
├── CLAUDE-PROJECT.md                  # Template for new projects (3KB)
├── README.md                          # Usage guide
├── ARCHITECTURE.md                    # Visual diagrams
├── IMPLEMENTATION-SUMMARY.md          # Initial implementation docs
├── FINAL-SUMMARY.md                   # Complete overview
├── MODULAR-STRUCTURE.md               # This file
├── init-project.sh                    # Project initialization script
│
├── docs/                              # ⭐ SHARED DOCUMENTATION (update here!)
│   ├── role-and-responsibilities.md   # What supervisor does
│   ├── scar-integration.md            # SCAR knowledge & patterns
│   ├── bmad-workflow.md               # BMAD methodology
│   ├── subagent-patterns.md           # Context conservation
│   ├── context-handoff.md             # Automatic handoff at 80%
│   └── epic-sharding.md               # 90% token reduction
│
├── templates/                         # File templates (7 files)
│   ├── epic-template.md
│   ├── adr-template.md
│   ├── prd-template.md
│   ├── architecture-overview.md
│   ├── feature-request.md
│   ├── project-brief.md
│   └── workflow-status.yaml
│
├── .claude/commands/                  # Subagent roles (4 files)
│   ├── analyze.md
│   ├── create-epic.md
│   ├── create-adr.md
│   └── plan-feature.md
│
├── consilio/                          # ⭐ PROJECT 1
│   ├── .git/                          # Own Git repo
│   ├── CLAUDE.md                      # Lean file (references ../docs/)
│   ├── .gitignore
│   └── .bmad/
│       ├── project-brief.md
│       ├── workflow-status.yaml
│       ├── epics/
│       ├── adr/
│       ├── prd/
│       ├── architecture/
│       ├── discussions/
│       └── feature-requests/
│
├── openhorizon/                       # ⭐ PROJECT 2
│   ├── .git/                          # Own Git repo
│   ├── CLAUDE.md                      # Lean file (references ../docs/)
│   ├── .gitignore
│   └── .bmad/
│       ├── project-brief.md
│       ├── workflow-status.yaml
│       ├── epics/
│       ├── adr/
│       ├── prd/
│       ├── architecture/
│       ├── discussions/
│       └── feature-requests/
│
└── [future-projects]/                 # Add more as needed
    ├── .git/
    ├── CLAUDE.md (copy from CLAUDE-PROJECT.md)
    └── .bmad/
```

---

## How It Works

### Project-Specific CLAUDE.md

**Each project has a lean CLAUDE.md (~3KB):**

```markdown
# Supervisor Role - Project Planning & Orchestration

## Quick Reference
- Your role, working directory, etc.

## Core Documentation (Read These)
1. [role-and-responsibilities.md](../docs/role-and-responsibilities.md)
2. [scar-integration.md](../docs/scar-integration.md)
3. [bmad-workflow.md](../docs/bmad-workflow.md)
4. [subagent-patterns.md](../docs/subagent-patterns.md)
5. [context-handoff.md](../docs/context-handoff.md)
6. [epic-sharding.md](../docs/epic-sharding.md)

## Critical Rules
[10 must-follow rules]

## Quick Commands
[Common operations]
```

**When AI reads CLAUDE.md:**
1. Gets project-specific context (working directory)
2. References shared docs via relative paths (`../docs/`)
3. Reads only what's needed (on-demand)
4. All projects use same documentation

### Shared Documentation

**All detailed docs in `/home/samuel/supervisor/docs/`:**

**role-and-responsibilities.md:**
- What supervisor does
- Communication style
- Multi-project isolation

**scar-integration.md:**
- How SCAR works
- Epic-based instruction
- Verification protocol
- Supervision commands

**bmad-workflow.md:**
- Scale-adaptive intelligence
- Four-phase workflow
- MoSCoW prioritization
- ADR system

**subagent-patterns.md:**
- Why subagents (90% context savings)
- How to spawn subagents
- Available subagents

**context-handoff.md:**
- Automatic handoff at 80%
- Handoff procedure
- Resuming from handoff

**epic-sharding.md:**
- What epics contain
- 90% token reduction
- How SCAR uses epics

---

## Maintenance Workflow

### To Update Any Feature

**Example: Update SCAR instruction protocol**

**Old way (propagate to all projects):**
```bash
# Edit consilio/CLAUDE.md
vim /home/samuel/supervisor/consilio/CLAUDE.md

# Copy to openhorizon
cp /home/samuel/supervisor/consilio/CLAUDE.md \
   /home/samuel/supervisor/openhorizon/CLAUDE.md

# Copy to scar
cp /home/samuel/supervisor/consilio/CLAUDE.md \
   /home/samuel/supervisor/scar/CLAUDE.md

# Copy to health-agent
# ... etc for all projects
```

**New way (edit once):**
```bash
# Edit shared doc
vim /home/samuel/supervisor/docs/scar-integration.md

# Done! All projects automatically get the update
# No propagation needed
```

### To Add New Feature Documentation

**Example: Add "multi-agent collaboration" doc**

```bash
# 1. Create new doc
vim /home/samuel/supervisor/docs/multi-agent-collaboration.md

# 2. Add reference to CLAUDE-PROJECT.md template
vim /home/samuel/supervisor/CLAUDE-PROJECT.md
# Add: 7. [multi-agent-collaboration.md](../docs/multi-agent-collaboration.md)

# 3. Update existing projects (one-time)
cp /home/samuel/supervisor/CLAUDE-PROJECT.md \
   /home/samuel/supervisor/consilio/CLAUDE.md

cp /home/samuel/supervisor/CLAUDE-PROJECT.md \
   /home/samuel/supervisor/openhorizon/CLAUDE.md

# Future projects automatically get the new reference
```

### To Create New Project

```bash
# Use init script (automatically uses CLAUDE-PROJECT.md)
cd /home/samuel/supervisor
./init-project.sh new-project https://github.com/gpt153/new-project-planning.git

# Or manually:
mkdir -p new-project/.bmad/{epics,adr,prd,architecture,discussions,feature-requests}
cp CLAUDE-PROJECT.md new-project/CLAUDE.md
cp templates/project-brief.md new-project/.bmad/
cp templates/workflow-status.yaml new-project/.bmad/
# Edit project-specific files
cd new-project && git init && git add . && git commit -m "feat: Initialize planning"
```

---

## File Sizes

### Before (Monolithic)

```
consilio/CLAUDE.md:      20KB (everything inline)
openhorizon/CLAUDE.md:   20KB (duplicate content)
scar/CLAUDE.md:          20KB (duplicate content)
Total:                   60KB (mostly duplicates)
```

### After (Modular)

```
Shared Docs:
  docs/role-and-responsibilities.md:  3KB
  docs/scar-integration.md:           4KB
  docs/bmad-workflow.md:              4KB
  docs/subagent-patterns.md:          4KB
  docs/context-handoff.md:            4KB
  docs/epic-sharding.md:              4KB
  Total:                             23KB (single copy)

Project Files:
  consilio/CLAUDE.md:                 3KB (references only)
  openhorizon/CLAUDE.md:              3KB (references only)
  scar/CLAUDE.md:                     3KB (references only)
  Total:                              9KB (lean)

Grand Total:                         32KB (vs 60KB before)
```

**Benefits:**
- 47% less duplication
- Faster AI reads (3KB vs 20KB per project)
- Easier maintenance (edit once)
- Consistent across projects

---

## Update Examples

### Example 1: Update SCAR Verification Protocol

**File to edit:** `/home/samuel/supervisor/docs/scar-integration.md`

**Change:**
```markdown
# Before
/verify-scar-phase <project> <issue> <phase>

# After
/verify-scar-phase <project> <issue> <phase> --strict
# (New --strict flag added for stricter validation)
```

**Result:** All projects (consilio, openhorizon, future projects) automatically use new protocol. No propagation needed.

### Example 2: Add New ADR Best Practice

**File to edit:** `/home/samuel/supervisor/docs/bmad-workflow.md`

**Add to ADR section:**
```markdown
### ADR Review Schedule
- Review all ADRs quarterly
- Mark superseded decisions
- Update consequences based on learnings
```

**Result:** All projects immediately have access to new best practice.

### Example 3: Update Context Handoff Threshold

**File to edit:** `/home/samuel/supervisor/docs/context-handoff.md`

**Change:**
```markdown
# Before
Trigger at 80% (160K/200K tokens)

# After
Trigger at 75% (150K/200K tokens)
# (More conservative for complex projects)
```

**Result:** All projects use new threshold. Consistent behavior everywhere.

---

## Benefits Summary

### For Maintenance

✅ **Edit once** - Changes apply to all projects
✅ **No propagation** - No need to update multiple files
✅ **Consistent** - All projects always in sync
✅ **Version control** - Single history for each doc

### For AI

✅ **Faster reads** - 3KB vs 20KB per project
✅ **On-demand** - Read only needed docs
✅ **Clear references** - Easy to find details
✅ **Context conservation** - Less memory per project

### For You

✅ **Easier updates** - One file to edit
✅ **Less duplication** - 47% reduction
✅ **Clearer organization** - Docs grouped by topic
✅ **Scalable** - Add 10 projects, same maintenance

---

## Current Projects

### Consilio
- **Planning:** `/home/samuel/supervisor/consilio/`
- **Implementation:** `/home/samuel/.archon/workspaces/consilio/`
- **Git:** https://github.com/gpt153/consilio-planning
- **Status:** Initialized

### OpenHorizon
- **Planning:** `/home/samuel/supervisor/openhorizon/`
- **Implementation:** `/home/samuel/.archon/workspaces/openhorizon.cc/`
- **Git:** https://github.com/gpt153/openhorizon-planning
- **Status:** Initialized

### Add More Projects

```bash
cd /home/samuel/supervisor
./init-project.sh health-agent https://github.com/gpt153/health-agent-planning.git
./init-project.sh scar https://github.com/gpt153/scar-planning.git
# Automatically uses CLAUDE-PROJECT.md template
```

---

## Migration Notes

**If you have existing projects with old monolithic CLAUDE.md:**

```bash
# 1. Backup current CLAUDE.md
cp consilio/CLAUDE.md consilio/CLAUDE.md.backup

# 2. Replace with lean version
cp CLAUDE-PROJECT.md consilio/CLAUDE.md

# 3. Verify references work
cd consilio
# Check that ../docs/*.md files exist and are readable

# 4. Commit
git add CLAUDE.md
git commit -m "refactor: Switch to modular documentation structure"
```

---

**Perfect architecture for multi-project supervision with minimal maintenance overhead!**
