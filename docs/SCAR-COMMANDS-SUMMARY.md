# SCAR Commands & Centralized Supervisor System - Summary

**Created:** 2026-01-17
**Purpose:** Inform all project supervisors about SCAR commands and centralized instruction system

---

## 🎯 What Was Done

### 1. Created Comprehensive SCAR Command Reference

**File:** `/home/samuel/supervisor/docs/scar-command-reference.md`

**Contains:**
- ✅ Complete explanation of how SCAR works (GitHub-driven, not /command-driven)
- ✅ How to properly instruct SCAR with `@scar` in GitHub issues
- ✅ SCAR instruction protocol (mandatory 20s acknowledgment check)
- ✅ All supervisor commands: `/verify-scar-phase`, `/supervise-issue`, `/supervise`
- ✅ Proper usage with args (project, issue-number, phase-number)
- ✅ When to use each command
- ✅ Complete workflow examples
- ✅ Critical learnings 006 & 007 integration
- ✅ Red flags and troubleshooting
- ✅ Quick reference cards

**Key Insights:**
- SCAR does NOT use `/commands` - it reads natural language from GitHub issue comments
- Supervisors use `/verify-scar-phase`, `/supervise-issue`, `/supervise` to manage SCAR
- Always use args: `/verify-scar-phase consilio 123 2` (not just `/verify-scar-phase`)
- Must wait 20s for SCAR acknowledgment after posting instruction
- Must verify SCAR's work (never trust summaries)

---

### 2. Created Centralized Supervisor System

**File:** `/home/samuel/supervisor/docs/CENTRALIZED-SUPERVISOR-SYSTEM.md`

**How it works:**
1. **All supervisor behavior** is defined in `/home/samuel/supervisor/docs/`
2. **Project CLAUDE.md files** are thin wrappers that reference shared docs
3. **Update once** → applies to all projects (current and future)
4. **Active supervisors** can reload with "Reload your instructions"

**Benefits:**
- ✅ Single source of truth
- ✅ Easy updates (edit one file, not 4+)
- ✅ Active supervisors can reload on demand
- ✅ Version controlled in git
- ✅ Consistency across all projects

---

### 3. Updated Key Files

**Updated:**
- `/home/samuel/supervisor/CLAUDE.md` - Added references to new docs
- `/home/samuel/supervisor/templates/CLAUDE-project-template.md` - Updated for new projects

**What changed:**
- Added SCAR command reference as REQUIRED READING
- Added centralized system documentation reference
- Renumbered documentation list to include new items
- Made SCAR command reference the #1 critical doc to read before SCAR interaction

---

## 📋 How Supervisors Should Use This

### For Project Supervisors

**Before ANY SCAR interaction, read:**
```bash
cat /home/samuel/supervisor/docs/scar-command-reference.md
```

**Key sections:**
1. How to instruct SCAR (GitHub-driven with @scar)
2. SCAR instruction protocol (20s acknowledgment check)
3. Supervisor commands (/verify-scar-phase, /supervise-issue, /supervise)
4. Critical learnings 006 & 007
5. Proper workflow step-by-step

### For Active Supervisors (Already Running)

**User can say:**
```
"Reload your instructions"
```

**Supervisor will:**
1. Re-read project CLAUDE.md
2. Re-read all shared docs in /home/samuel/supervisor/docs/
3. Apply new behavior immediately
4. Confirm: "Instructions reloaded. Now following updated protocols."

---

## 🚀 Quick Start: Using SCAR Commands

### When Creating Issue for SCAR

```markdown
@scar - Implement user authentication API following epic specifications.

## Epic Reference
.bmad/epics/001-user-authentication.md

[Include full epic content here]

## Tasks
- [ ] Create User model
- [ ] POST /auth/signup endpoint
- [ ] POST /auth/login endpoint

## Acceptance Criteria
- [ ] Build passes (npm run build)
- [ ] Tests pass (npm test)
- [ ] No mocks or placeholders

CRITICAL: No mock implementations unless in PRD.
```

**Then:**
1. Wait 20s for "SCAR is on the case..." comment
2. Check worktree files created within 60s
3. Start monitoring: `/supervise-issue 123`

### When Verifying SCAR's Work

```bash
# ALWAYS verify before accepting
/verify-scar-phase consilio 123 2

# Returns: APPROVED, NEEDS FIXES, or REJECTED
```

### When Monitoring Progress

```bash
# Single issue
/supervise-issue 123

# Entire project
/supervise
```

---

## 🔄 How to Update ALL Supervisors

**Scenario:** You discover a new SCAR pattern or behavior.

**Steps:**
1. Edit `/home/samuel/supervisor/docs/scar-command-reference.md`
2. Add new pattern or update existing section
3. Commit: `git commit -m "Update: SCAR command reference with new pattern"`
4. Push: `git push`
5. Tell active supervisors: User says "Reload your instructions"

**Result:** All supervisors (current and future) use updated behavior.

---

## 📊 File Organization

```
/home/samuel/supervisor/docs/
├── scar-command-reference.md           # 🆕 Complete SCAR command guide
├── CENTRALIZED-SUPERVISOR-SYSTEM.md    # 🆕 How to update all supervisors
├── SCAR-COMMANDS-SUMMARY.md            # 🆕 This file
├── scar-integration.md                 # SCAR integration guide
├── role-and-responsibilities.md        # Core supervisor role
├── bmad-workflow.md                    # BMAD methodology
├── subagent-patterns.md                # Context conservation
├── context-handoff.md                  # Automatic handoff
├── epic-sharding.md                    # Token reduction
└── supervisor-learnings/               # Learning system
    ├── README.md
    ├── QUICK_REFERENCE.md
    └── learnings/
        ├── 006-never-trust-scar-verify-always.md
        └── 007-monitor-scar-state-not-just-existence.md
```

---

## ⚠️ Critical Reminders

### For All Supervisors

**ALWAYS:**
- ✅ Read scar-command-reference.md before SCAR interaction
- ✅ Use @scar in GitHub issues (not /commands)
- ✅ Wait 20s for SCAR acknowledgment
- ✅ Verify SCAR's work with /verify-scar-phase (never trust summaries)
- ✅ Monitor SCAR's state (progress), not existence
- ✅ Use args with supervisor commands: `/verify-scar-phase consilio 123 2`

**NEVER:**
- ❌ Trust SCAR's "100% complete" claims without verification
- ❌ Assume SCAR is making progress without checking commits
- ❌ Use supervisor commands without required args
- ❌ Accept mocks/placeholders in production code
- ❌ Skip the 20s acknowledgment check

---

## 🎯 Next Steps

### For You (System Administrator)

1. ✅ Review new documentation to ensure completeness
2. ✅ Tell active supervisors to reload instructions
3. ✅ Create new learnings as patterns discovered
4. ✅ Update shared docs when workflows improve

### For Project Supervisors

1. ✅ Read `/home/samuel/supervisor/docs/scar-command-reference.md`
2. ✅ Follow SCAR instruction protocol (20s acknowledgment)
3. ✅ Use /verify-scar-phase before accepting work
4. ✅ Monitor SCAR's state with /supervise-issue or /supervise
5. ✅ Document new learnings in supervisor-learnings/

---

## 📚 Additional Resources

**Documentation:**
- Full SCAR command reference: `/home/samuel/supervisor/docs/scar-command-reference.md`
- Centralized system guide: `/home/samuel/supervisor/docs/CENTRALIZED-SUPERVISOR-SYSTEM.md`
- Learning 006 (verification): `/home/samuel/supervisor/docs/supervisor-learnings/learnings/006-never-trust-scar-verify-always.md`
- Learning 007 (state monitoring): `/home/samuel/supervisor/docs/supervisor-learnings/learnings/007-monitor-scar-state-not-just-existence.md`

**Templates:**
- Project CLAUDE.md: `/home/samuel/supervisor/templates/CLAUDE-project-template.md`
- Epic template: `/home/samuel/supervisor/templates/epic-template.md`
- ADR template: `/home/samuel/supervisor/templates/adr-template.md`

---

## 📝 Summary

**What supervisors now know:**
1. SCAR is GitHub-driven (use `@scar` in issue comments)
2. Supervisor commands: `/verify-scar-phase`, `/supervise-issue`, `/supervise`
3. Always use args with commands
4. Always verify SCAR's work (never trust summaries)
5. Always monitor SCAR's state (check actual progress)

**How to update all supervisors:**
1. Edit shared docs in `/home/samuel/supervisor/docs/`
2. Commit and push
3. Tell active supervisors: "Reload your instructions"

**Result:** All supervisors (current and future) follow consistent, up-to-date behavior from centralized documentation.

---

**Created:** 2026-01-17
**Version:** 1.0
**Applies to:** All supervisor instances (root and project-level)
