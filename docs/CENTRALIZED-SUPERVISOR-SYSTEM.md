# Centralized Supervisor Instruction System

**Purpose:** Make changes to supervisor behavior from ONE place that affects ALL project supervisors.

---

## 🎯 The Problem

Previously:
- Each project has its own CLAUDE.md file
- To update all supervisors, you'd need to edit 4+ files
- Active supervisor sessions don't see updates until restart
- Instructions get out of sync across projects

---

## ✅ The Solution: Shared Documentation System

**All project supervisors now read shared documentation from:**

```
/home/samuel/supervisor/docs/
```

**Project-specific CLAUDE.md files are THIN wrappers** that:
1. Contain only project-specific context (project name, repos, etc.)
2. Reference shared documentation for all behavior
3. Tell supervisors to "read docs before operations"

---

## 📂 Centralized Documentation Structure

```
/home/samuel/supervisor/docs/
├── role-and-responsibilities.md      # Core supervisor role
├── scar-integration.md                # SCAR integration guide
├── scar-command-reference.md          # 🆕 SCAR commands (detailed)
├── bmad-workflow.md                   # BMAD methodology
├── subagent-patterns.md               # Context conservation
├── context-handoff.md                 # Automatic handoff
├── epic-sharding.md                   # Token reduction
├── ui-design-tools.md                 # UI mockup generation
├── ui-design-quick-reference.md       # UI tools quick ref
├── supervisor-learnings/              # Learning system
│   ├── README.md                      # How to use learnings
│   ├── QUICK_REFERENCE.md             # All learnings index
│   ├── _learning-template.md          # Template for new learnings
│   └── learnings/                     # Individual learnings
│       ├── 001-*.md
│       ├── 006-never-trust-scar-verify-always.md   # CRITICAL
│       └── 007-monitor-scar-state-not-just-existence.md  # CRITICAL
└── CENTRALIZED-SUPERVISOR-SYSTEM.md   # 🆕 This file
```

**Change once → applies to all projects**

---

## 🔧 How It Works

### 1. Project CLAUDE.md Files (Thin Wrappers)

**Each project's CLAUDE.md contains ONLY:**

```markdown
# Supervisor Role - [PROJECT_NAME]

**YOU ARE THE SUPERVISOR** for [PROJECT_NAME]. You plan, guide, track, and orchestrate.

**Project Context:**
- **Project Name:** [PROJECT_NAME]
- **Planning Directory:** /home/samuel/supervisor/[PROJECT_NAME]/
- **Implementation Directory:** /home/samuel/.archon/workspaces/[PROJECT_NAME]/
- **Planning Repo:** https://github.com/gpt153/[PROJECT_NAME]-planning
- **Implementation Repo:** https://github.com/gpt153/[PROJECT_NAME]

**Tech Stack:**
- [Tech stack details]

**Current Phase:**
- [Phase description]

---

## 📚 CORE INSTRUCTIONS (Read These FIRST)

**ALL behavior and workflows are defined in shared documentation:**

**Located in:** `/home/samuel/supervisor/docs/`

**CRITICAL - Read before ANY operation:**

1. **role-and-responsibilities.md** - Your core role and what you do
2. **scar-command-reference.md** - 🆕 How to use SCAR commands properly
3. **scar-integration.md** - SCAR integration and verification
4. **bmad-workflow.md** - Planning methodology
5. **subagent-patterns.md** - When to spawn subagents
6. **context-handoff.md** - Handoff at 80% context
7. **supervisor-learnings/** - Collective learning system

**Before starting complex operations, ALWAYS check:**
```bash
# Search learnings for solutions
grep -ri "your problem" /home/samuel/supervisor/docs/supervisor-learnings/learnings/

# Check SCAR command reference
cat /home/samuel/supervisor/docs/scar-command-reference.md
```

**CRITICAL LEARNINGS (Read FIRST):**
- `006-never-trust-scar-verify-always.md` - SCAR claims 100% = actually 20%
- `007-monitor-scar-state-not-just-existence.md` - Check progress, not existence

---

[Rest of CLAUDE.md contains only project-specific details]
```

### 2. Updating ALL Supervisors

**To change behavior for ALL supervisors:**

**Option A: Update shared docs (recommended)**
```bash
# Edit the shared doc
vim /home/samuel/supervisor/docs/scar-command-reference.md

# Or create new learning
cp /home/samuel/supervisor/docs/supervisor-learnings/_learning-template.md \
   /home/samuel/supervisor/docs/supervisor-learnings/learnings/008-new-learning.md

# Commit changes
git add docs/
git commit -m "Update: SCAR command reference with new patterns"
git push

# Tell active supervisors to reload (see Option C below)
```

**Option B: Update project template (for new projects)**
```bash
# Edit template that new projects use
vim /home/samuel/supervisor/templates/CLAUDE-project-template.md

# Update references to shared docs
# New projects will get updated version automatically
```

**Option C: Tell active supervisors to reload**
```bash
# When supervisor is active in a session, user can say:
"Reload your instructions"

# Supervisor will:
1. Re-read /home/samuel/supervisor/[PROJECT_NAME]/CLAUDE.md
2. Re-read all shared docs in /home/samuel/supervisor/docs/
3. Apply new behavior immediately
```

---

## 🎯 Example: Adding New SCAR Command

**Scenario:** You discover a new SCAR command or pattern.

**Old way (inefficient):**
1. Edit consilio/CLAUDE.md
2. Edit openhorizon/CLAUDE.md
3. Edit health-agent/CLAUDE.md
4. Edit quiculum-monitor/CLAUDE.md
5. Hope you didn't miss any projects
6. Active supervisors don't see changes

**New way (centralized):**
1. Edit `/home/samuel/supervisor/docs/scar-command-reference.md`
2. Done! All current and future projects benefit
3. Tell active supervisors: "Reload your instructions"

---

## 📋 What Goes Where?

### Shared Docs (`/home/samuel/supervisor/docs/`)

**Put here:**
- ✅ Core supervisor behaviors
- ✅ SCAR interaction protocols
- ✅ BMAD workflow patterns
- ✅ Verification checklists
- ✅ Tool usage guidelines
- ✅ Context conservation rules
- ✅ Learnings from all projects

**Examples:**
- "Always verify SCAR's work before accepting"
- "Monitor SCAR's state, not just existence"
- "How to use /verify-scar-phase command"
- "When to spawn subagents"

### Project CLAUDE.md (`/home/samuel/supervisor/[PROJECT]/CLAUDE.md`)

**Put here:**
- ✅ Project name and repos
- ✅ Tech stack details
- ✅ Current phase information
- ✅ Project-specific quirks
- ✅ References to shared docs

**Examples:**
- "Project: Consilio"
- "Tech stack: Node.js + TypeScript + React"
- "Current phase: MVP implementation"
- "Shared docs: /home/samuel/supervisor/docs/"

---

## 🔄 Reloading Active Supervisors

### Method 1: User Command (Recommended)

**User says:**
```
"Reload your instructions"
```

**Supervisor automatically:**
1. Re-reads current CLAUDE.md
2. Re-reads all shared docs
3. Applies new behavior immediately
4. Confirms: "Instructions reloaded. Now following updated protocols."

---

### Method 2: Explicit File Reference

**User says:**
```
"Read the updated SCAR command reference"
```

**Supervisor:**
```bash
Read /home/samuel/supervisor/docs/scar-command-reference.md
```

---

### Method 3: Proactive Reload Reminder

**In project CLAUDE.md, add reminder:**
```markdown
## 🔄 Before Each Session

**ALWAYS start by checking for updates:**
1. Check if shared docs have changed: `git log -1 --oneline docs/`
2. If changed, re-read relevant docs
3. Apply new protocols immediately
```

---

## 🚨 Critical: Keep Learnings Updated

**When you discover a new pattern or problem:**

1. **Document immediately:**
   ```bash
   # Get next ID
   NEXT_ID=$(printf "%03d" $(($(ls -1 /home/samuel/supervisor/docs/supervisor-learnings/learnings/*.md | wc -l) + 1)))

   # Create from template
   cp /home/samuel/supervisor/docs/supervisor-learnings/_learning-template.md \
      /home/samuel/supervisor/docs/supervisor-learnings/learnings/${NEXT_ID}-problem-name.md

   # Edit with findings
   vim /home/samuel/supervisor/docs/supervisor-learnings/learnings/${NEXT_ID}-problem-name.md
   ```

2. **Update index:**
   ```bash
   # Update index.yaml with new learning
   vim /home/samuel/supervisor/docs/supervisor-learnings/index.yaml
   ```

3. **Commit and push:**
   ```bash
   git add docs/supervisor-learnings/
   git commit -m "Learning ${NEXT_ID}: [Short description]"
   git push
   ```

4. **Tell active supervisors:**
   ```
   User: "New learning added. Reload instructions."
   ```

**All projects benefit immediately!**

---

## 📊 Benefits of Centralized System

### Before (Decentralized)

**Problems:**
- ❌ 4+ CLAUDE.md files to update for behavior change
- ❌ Instructions get out of sync
- ❌ Active supervisors miss updates
- ❌ Hard to track which version each project uses
- ❌ Copy-paste errors when updating

### After (Centralized)

**Improvements:**
- ✅ Single source of truth for all behavior
- ✅ Update once, applies everywhere
- ✅ Active supervisors can reload on demand
- ✅ Version controlled in git
- ✅ Easier to maintain consistency

---

## 🎯 Update Workflow Examples

### Example 1: SCAR Command Discovery

**Scenario:** You discover SCAR has a new command pattern.

**Steps:**
1. Edit `/home/samuel/supervisor/docs/scar-command-reference.md`
2. Add new command under appropriate section
3. Commit: `git commit -m "Add new SCAR command pattern"`
4. If supervisors are active: User says "Reload SCAR command reference"

**Result:** All supervisors (current and future) now know the new pattern.

---

### Example 2: Critical Learning

**Scenario:** You discover SCAR is creating mocks instead of real implementations.

**Steps:**
1. Create learning file:
   ```bash
   cp /home/samuel/supervisor/docs/supervisor-learnings/_learning-template.md \
      /home/samuel/supervisor/docs/supervisor-learnings/learnings/008-scar-mock-trap.md
   ```
2. Document the problem, solution, and prevention
3. Update index.yaml with category and tags
4. Commit: `git commit -m "Learning 008: SCAR mock implementations trap"`
5. Tell active supervisors: "New critical learning added. Reload instructions."

**Result:** All supervisors now check for mocks before accepting SCAR's work.

---

### Example 3: Workflow Improvement

**Scenario:** You find a better way to verify SCAR's work.

**Steps:**
1. Edit `/home/samuel/supervisor/docs/scar-integration.md`
2. Update verification protocol section
3. Add example to `/home/samuel/supervisor/docs/scar-command-reference.md`
4. Commit: `git commit -m "Improve SCAR verification workflow"`
5. Active supervisors reload on next session or when told

**Result:** All supervisors use improved verification immediately.

---

## 🛠️ Maintenance Tasks

### Weekly

- [ ] Review new learnings created
- [ ] Check if any patterns should be promoted to shared docs
- [ ] Update QUICK_REFERENCE.md if needed

### Monthly

- [ ] Review all shared docs for outdated info
- [ ] Check if project CLAUDE.md files need updates
- [ ] Verify template is up to date

### As Needed

- [ ] When new SCAR behavior discovered → Update scar-command-reference.md
- [ ] When new problem solved → Create learning
- [ ] When workflow improved → Update relevant shared doc
- [ ] When active supervisor needs update → User says "Reload instructions"

---

## 📚 File Organization Best Practices

### Shared Docs Naming Convention

**Format:** `[category]-[topic].md`

**Examples:**
- `scar-command-reference.md` - SCAR category, command reference topic
- `bmad-workflow.md` - BMAD category, workflow topic
- `ui-design-tools.md` - UI category, design tools topic

### Learning Files Naming Convention

**Format:** `[ID]-[short-description].md`

**Examples:**
- `006-never-trust-scar-verify-always.md`
- `007-monitor-scar-state-not-just-existence.md`
- `008-scar-mock-trap.md`

---

## 🚀 Migration Checklist (For Existing Projects)

**To migrate existing projects to centralized system:**

- [ ] Back up current project CLAUDE.md
- [ ] Create new CLAUDE.md using template
- [ ] Keep only project-specific info
- [ ] Add references to shared docs
- [ ] Add "reload instructions" section
- [ ] Test with active supervisor session
- [ ] Verify shared docs are loaded correctly
- [ ] Remove duplicated content from project CLAUDE.md

---

## 📖 Quick Reference: Common Updates

| What Changed | File to Edit | Affected Projects |
|--------------|--------------|-------------------|
| SCAR command behavior | `scar-command-reference.md` | All |
| Verification protocol | `scar-integration.md` | All |
| Workflow pattern | `bmad-workflow.md` | All |
| New learning | `supervisor-learnings/learnings/` | All |
| Project-specific | `[PROJECT]/CLAUDE.md` | One |
| Template for new projects | `templates/CLAUDE-project-template.md` | Future |

---

## ✅ Summary

**Centralized system provides:**
1. **Single source of truth** - All behavior in `/home/samuel/supervisor/docs/`
2. **Easy updates** - Edit once, applies everywhere
3. **Active reloading** - User can tell supervisor to reload instructions
4. **Version control** - Git tracks all changes
5. **Consistency** - All supervisors follow same protocols
6. **Maintainability** - No copy-paste errors

**To update all supervisors:**
1. Edit shared doc in `/home/samuel/supervisor/docs/`
2. Commit and push
3. If supervisors active: User says "Reload your instructions"

**Result:** All supervisors (current and future) use updated behavior immediately.

---

**Location of this guide:** `/home/samuel/supervisor/docs/CENTRALIZED-SUPERVISOR-SYSTEM.md`

**Next steps:**
1. Update project CLAUDE.md files to reference shared docs
2. Create new learnings as problems discovered
3. Use "Reload instructions" when supervisors need updates
