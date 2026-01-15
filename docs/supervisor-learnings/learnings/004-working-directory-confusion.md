---
id: 004
date: 2026-01-15
category: project-setup
tags: [directory, context, navigation, claude-md]
severity: high
projects-affected: [all]
---

# Problem: Operating from Wrong Directory (Root vs Project)

## Symptoms

- Trying to do project-specific work from root supervisor directory
- Reading root CLAUDE.md when project-specific CLAUDE.md should be used
- Creating planning artifacts in wrong location
- Spawning subagents with wrong working directory
- Confusion about which CLAUDE.md instructions apply

## Context

The supervisor system has a **root directory** (`/home/samuel/supervisor/`) and **project directories** (`/home/samuel/supervisor/[project-name]/`).

Each level has different responsibilities and its own CLAUDE.md:

**Root directory (`/home/samuel/supervisor/`):**
- Create new projects
- Cross-project status
- List all projects
- Manage learning system

**Project directory (`/home/samuel/supervisor/[project-name]/`):**
- Plan features
- Create epics
- Manage project-specific work
- Spawn SCAR for implementation

## Root Cause

Not clearly distinguishing between root-level operations and project-level operations. Reading/following the wrong CLAUDE.md instructions.

## Solution

**Pattern:** Identify Context Before Acting

**Step 1: Determine current context**
```bash
pwd
# Returns: /home/samuel/supervisor/ → ROOT CONTEXT
# Returns: /home/samuel/supervisor/consilio/ → PROJECT CONTEXT
```

**Step 2: Match operation to context**

If in **ROOT** context (`/home/samuel/supervisor/`):
- Can: Create new projects, list projects, cross-project status
- Cannot: Plan features, create epics (project-specific)
- CLAUDE.md: `/home/samuel/supervisor/CLAUDE.md`

If in **PROJECT** context (`/home/samuel/supervisor/[project]/`):
- Can: Plan features, create epics, manage project workflow
- Cannot: Create new projects (root-level)
- CLAUDE.md: `/home/samuel/supervisor/[project]/CLAUDE.md`

**Step 3: If operation doesn't match context**

Option A: Spawn subagent in correct directory
```markdown
Task tool with prompt:
"Working directory: /home/samuel/supervisor/consilio/

Task: Plan feature X for Consilio project

Follow instructions in /home/samuel/supervisor/consilio/CLAUDE.md"
```

Option B: Inform user to switch context
```markdown
"For Consilio-specific work, you need to be in the project directory.

Current: /home/samuel/supervisor/ (root)
Needed: /home/samuel/supervisor/consilio/ (project)

Would you like me to spawn a subagent to work in the project directory?"
```

## Prevention

1. **Always check `pwd` first** - Know which context you're in
2. **Read correct CLAUDE.md** - Root or project-specific
3. **Explicit working directory in subagent spawns** - Always specify
4. **Clear user communication** - Tell user which context you're operating in

Example pattern for any supervisor:
```markdown
## Context Check Pattern

**Before any major operation:**

1. Check working directory: `pwd`
2. Determine context:
   - /home/samuel/supervisor/ → ROOT (use root CLAUDE.md)
   - /home/samuel/supervisor/[project]/ → PROJECT (use project CLAUDE.md)
3. Verify operation matches context
4. If mismatch: spawn subagent in correct directory OR inform user
```

## Code/Config Examples

### Before (problematic)
```markdown
User: "Plan a new feature for Consilio"

Supervisor: "Let me create an epic..."
[Creates epic in /home/samuel/supervisor/ - WRONG!]
[Uses root CLAUDE.md instructions - WRONG!]
```

### After (fixed)
```markdown
User: "Plan a new feature for Consilio"

Supervisor: [Checks pwd: /home/samuel/supervisor/]

Supervisor: "You're asking for Consilio-specific work, but we're in the root directory.

I'll spawn a subagent in the Consilio project directory to handle this."

[Spawns Task tool with:
  prompt: "Working in Consilio project...
           Follow /home/samuel/supervisor/consilio/CLAUDE.md
           Task: Plan new feature..."
  working_directory: /home/samuel/supervisor/consilio/]
```

**Alternative (if already in project directory):**
```markdown
User: "Plan a new feature for Consilio"

Supervisor: [Checks pwd: /home/samuel/supervisor/consilio/]

Supervisor: "✅ In Consilio project directory.
Let me read the project CLAUDE.md and start planning..."

[Reads /home/samuel/supervisor/consilio/CLAUDE.md]
[Follows project-specific instructions]
```

## Quick Reference

| Operation | Context | Directory | CLAUDE.md |
|-----------|---------|-----------|-----------|
| Create new project | ROOT | `/home/samuel/supervisor/` | Root CLAUDE.md |
| List all projects | ROOT | `/home/samuel/supervisor/` | Root CLAUDE.md |
| Cross-project status | ROOT | `/home/samuel/supervisor/` | Root CLAUDE.md |
| Plan feature | PROJECT | `/home/samuel/supervisor/[project]/` | Project CLAUDE.md |
| Create epic | PROJECT | `/home/samuel/supervisor/[project]/` | Project CLAUDE.md |
| Spawn SCAR | PROJECT | `/home/samuel/supervisor/[project]/` | Project CLAUDE.md |

## Related Learnings

- #001 (subagent-context-handoff) - Include working directory in spawns
- #005 (claude-md-hierarchy) - Understanding CLAUDE.md structure

## Impact

- **Prevents:** Artifacts in wrong locations, incorrect workflows
- **Ensures:** Correct instructions followed for context
- **Clarity:** User understands which context operations happen in
- **Projects benefiting:** All projects

## Notes

- Some operations make sense in either context (e.g., checking learning system)
- When in doubt, check which CLAUDE.md you should be following
- Always specify working directory explicitly in subagent spawns
- Root CLAUDE.md has instructions for spawning project-specific subagents
- Project CLAUDE.md has instructions for project-specific workflows

---

**Documented by:** Root Supervisor
**Verified by:** Multi-project setup patterns
