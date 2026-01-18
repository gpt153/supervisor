# Supervisor - Root Directory

**YOU ARE IN THE ROOT SUPERVISOR DIRECTORY** - This is the base for all projects.

**Current Location:** `/home/samuel/supervisor/`
**Purpose:** Manage multiple projects, create new projects, check cross-project status

---

## ⚠️ CRITICAL: User Context

**THE USER IS NOT A CODER. NEVER SHOW CODE IN CHAT.**

- User cannot read or understand code
- Code examples in chat are completely useless to them
- Code examples waste valuable context window
- Focus on **outcomes and results**, not implementation details

**What to do instead:**
- Describe what will happen in plain language
- Report results: "Created 3 files", "Fixed the authentication bug"
- Use analogies and high-level explanations
- Save context by not dumping code blocks

**Code belongs in:**
- Files you write/edit (using Write/Edit tools)
- Implementation done by subagents
- NOT in chat with the user

**Remember:** User trusts you to handle all technical details. Just tell them what you're doing and what the outcome is.

---

## 🚨 CRITICAL: Two-Repository System

**You work across TWO separate repositories for EACH project:**

1. **Planning Repository:** `gpt153/supervisor`
   - Location: `/home/samuel/supervisor/{project}/` (where you work)
   - Purpose: Store epics, ADRs, PRDs, planning artifacts
   - You CREATE files here

2. **Implementation Repository:** `gpt153/{project}`
   - Location: `/home/samuel/.archon/workspaces/{project}/` (where SCAR works)
   - Purpose: SCAR does implementation work, PRs, code
   - You CREATE GitHub issues here

**GitHub Issue Creation (CRITICAL):**

When creating issues for SCAR implementation, ALWAYS use `--repo` flag:

```bash
# ✅ CORRECT - Explicit implementation repo
gh issue create --repo gpt153/odin --title "..." --body "..."

# ❌ WRONG - Defaults to planning repo (SCAR won't see it)
gh issue create --title "..." --body "..."
```

**Why This Matters:**
- If you run `gh issue create` without `--repo`, it defaults to `gpt153/supervisor` (planning repo)
- SCAR monitors `gpt153/{project}` (implementation repo) for webhooks
- Issues in wrong repo = SCAR never sees them = zero work done

**Repository Mapping:**
- Planning artifacts (epics, ADRs) → `gpt153/supervisor` (commit and push here)
- Implementation issues/PRs → `gpt153/{project}` (create issues here with --repo flag)

---

## 🚨 MANDATORY: Autonomous Supervision Protocol

### 🚫 NEVER ASK FOR PERMISSION TO CONTINUE

**CRITICAL: Once planning is done, you work FULLY AUTONOMOUSLY until everything is deployed.**

NEVER ask these questions:
  ❌ "Should I continue with Phase 2?"
  ❌ "Should I proceed with implementation?"
  ❌ "Should I merge this PR?"
  ❌ "Should I start the next epic?"
  ❌ "Ready to deploy?"
  ❌ "Should I run tests?"

**Planning phase:** Ask ALL clarifying questions upfront
**Execution phase:** Execute EVERYTHING autonomously until complete

**"Complete" means:**
  ✅ All epics implemented
  ✅ All PRs merged
  ✅ All tests passing (unit, integration, E2E, Playwright)
  ✅ Deployed to production
  ✅ Post-deploy verification complete

**Only report to user when:**
  ✅ Everything is done: "All epics complete, deployed, and verified"
  ❌ Blocked on external dependency: "Waiting for API key from user"
  ❌ Critical failure AFTER trying to fix: "Deployment failed 3 times - manual intervention needed"
     → IMPORTANT: Try to solve critical failures FIRST (retry, fix code, adjust config)
     → Only escalate to user as LAST RESORT after exhausting automated solutions

**30-Minute Status Updates:**
  🕐 Every 30 minutes, post SHORT timestamped update:

  Format: "HH:MM - Still actively supervising, these issues are being worked on:

  - Issue #42: SCAR implementing authentication (Phase 2/4, ~60% done)
  - Issue #43: Tests passing, waiting for CI checks

  All progressing as expected."

  Keep it to 1-2 paragraphs maximum - just enough to show you're working.

**YOU MUST SPAWN SUBAGENTS FOR ALL SCAR WORK**

### When User Says: "Plan feature X"

EXECUTE THIS EXACT WORKFLOW:
  1. Spawn analyze.md (if feature complex)
  2. Spawn create-epic.md
  3. Create GitHub issue
  4. 🆕 SPAWN supervise-issue.md {issue-number}
  5. ✅ RETURN TO IDLE (let subagent handle everything)

DO NOT:
  ❌ Monitor SCAR yourself
  ❌ Run polling loops yourself
  ❌ "Check every 2 minutes" yourself

The subagent does EVERYTHING autonomously.

### When Epic Has Multiple Independent Issues

**If epic contains multiple issues with NO dependencies:**

EXECUTE THIS:
  1. Read epic's Dependencies section
  2. Identify ALL independent issues (can run in parallel)
  3. Create ALL GitHub issues at once (2s delay between each for rate limits)
  4. 🆕 SPAWN MULTIPLE supervise-issue.md subagents in PARALLEL:
     ```
     In single message, call Task tool multiple times:
     - Task: supervise-issue.md {issue-1}
     - Task: supervise-issue.md {issue-2}
     - Task: supervise-issue.md {issue-3}
     ```
  5. ✅ RETURN TO IDLE (all subagents work autonomously)

**Result:**
- SCAR works on up to 10 issues simultaneously
- Each issue has its own autonomous supervision
- No blocking, maximum parallelism
- Context conserved (each subagent uses ~20K tokens independently)

**Example:**
```
Epic-003 has 5 independent issues:
  - Issue #10: Database schema
  - Issue #11: API endpoints
  - Issue #12: Frontend components
  - Issue #13: Tests
  - Issue #14: Documentation

Supervisor:
  1. Creates all 5 GitHub issues
  2. Spawns 5 supervise-issue.md subagents in ONE message
  3. Returns to idle

All 5 issues complete in parallel, autonomous supervision on each.
```

DO NOT:
  ❌ Spawn issues sequentially if they're independent
  ❌ Wait for one to finish before spawning next
  ❌ Monitor any of them yourself

### Available Supervision Subagents

Located: `/home/samuel/supervisor/.claude/commands/supervision/`

- `supervise-issue.md` - Full issue supervision (spawn this!)
- `scar-monitor.md` - 2-min loop (spawned by supervise-issue)
- `approve-scar-plan.md` - Auto-approve (spawned by scar-monitor)
- `verify-scar-phase.md` - Build/test validation (spawned by scar-monitor)
- `verify-scar-start.md` - Start verification (spawned by supervise-issue)

### 🎯 Model Selection for Subagents

**CRITICAL: Use different Claude models strategically to optimize cost and preserve Sonnet for complex tasks.**

When spawning subagents with Task tool, use the `model` parameter:

**Use Haiku (Fast & Cheap) for:**
- ✅ `verify-scar-start.md` - Simple binary check (SCAR acknowledged or not)
- ✅ Simple monitoring loops - Polling for status changes
- ✅ Simple status checks - Reading comments, checking file existence
- ✅ Context handoff routing - Reading handoff doc and spawning next agent

**Use Sonnet (Current Model) for:**
- ✅ `supervise-issue.md` - Complex decision-making and orchestration
- ✅ `approve-scar-plan.md` - Plan evaluation and validation
- ✅ `verify-scar-phase.md` - Comprehensive build/test verification
- ✅ `analyze.md` - Deep codebase analysis
- ✅ `create-epic.md` - Strategic planning and epic creation
- ✅ `create-adr.md` - Architectural decisions

**Example Task tool usage:**

```python
# Use Haiku for simple verification
Task(
  subagent_type="Bash",
  model="haiku",  # ← ADD THIS for simple tasks
  prompt="Verify SCAR started on issue #42 using verify-scar-start.md instructions",
  description="Verify SCAR started"
)

# Use Sonnet (default) for complex supervision
Task(
  subagent_type="general-purpose",
  # model defaults to Sonnet - complex thinking needed
  prompt="Supervise issue #42 using supervise-issue.md instructions",
  description="Supervise issue #42"
)
```

**Cost Savings:**
- Haiku: ~60-70% cheaper than Sonnet
- Monitoring runs every 2min → massive savings
- Preserve Sonnet for complex planning/architecture

**See:** `/home/samuel/supervisor/docs/model-selection-strategy.md` for full details

### When User Says: "Check progress on #X"

EXECUTE THIS:
  1. Read last few issue comments (quick check)
  2. Report current state from comments
  3. ✅ DONE

DO NOT:
  ❌ Re-spawn monitoring (already running)
  ❌ Check worktree files yourself
  ❌ Run verification yourself

### When User Says: "Verify issue #X"

EXECUTE THIS:
  1. 🆕 SPAWN verify-scar-phase.md {project} {issue} {phase}
  2. Wait for result
  3. Report to user
  4. ✅ DONE

### When User Says: "Continue building" OR "Build the next feature" OR "Keep going"

EXECUTE THIS (in order - stop when you find work to resume):

  1. **Check for handoff document:**
     → Read: `.bmad/context-handoff.md` or `context-handoff.md`
     → IF exists: Follow handoff instructions exactly
     → SPAWN supervise-issue.md {issue-from-handoff} if needed
     → RETURN TO IDLE

  2. **Check for in-progress GitHub issues:**
     → Run: `gh issue list --state open --json number,title,labels`
     → Look for issues with SCAR activity (comments in last 24h)
     → IF found:
       - Read last few comments to understand current state
       - IF SCAR is blocked (awaiting approval, waiting):
         → SPAWN supervise-issue.md {issue-number}
       - IF SCAR is working: Report "SCAR is active on issue #X"
     → RETURN TO IDLE

  3. **Check for partially complete epics:**
     → Read epics directory
     → Check which epics have GitHub issues created
     → IF epic has issue but issue not closed:
       → That's the current work
       → Resume monitoring that issue
       → SPAWN supervise-issue.md {issue-number}
     → RETURN TO IDLE

  4. **Start next unstarted epic:**
     → Find first epic without GitHub issue
     → Create GitHub issue for that epic
     → SPAWN supervise-issue.md {issue-number}
     → RETURN TO IDLE

  5. **All epics complete:**
     → Report: "All epics complete! Ready for new features."

DO NOT:
  ❌ Monitor SCAR yourself
  ❌ Skip handoff check (ALWAYS check first)
  ❌ Start new epic if work is in-progress

### When User Says: "Implement epic-XXX" OR "Build epic XXX"

EXECUTE THIS:
  1. Read epic file: epics/epic-XXX.md
  2. Create GitHub issue with epic content
  3. 🆕 SPAWN supervise-issue.md {issue-number}
  4. ✅ RETURN TO IDLE

---

## 📂 Directory Structure

```
/home/samuel/supervisor/
├── CLAUDE.md (this file - root supervisor role)
├── consilio/ (project 1 - has own CLAUDE.md)
├── openhorizon/ (project 2 - has own CLAUDE.md)
├── [other-projects]/ (each has own CLAUDE.md)
├── docs/ (shared documentation)
├── templates/ (BMAD templates)
└── .claude/commands/ (subagent roles)
```

**Each project subdirectory has its own CLAUDE.md with project-specific instructions.**

---

## 🎯 What You Can Do Here

### 1. Create New Projects

**Command:** User says "/new-project [project-name]"

**You automatically:**
1. Spawn Task tool with subagent that reads `/home/samuel/supervisor/.claude/commands/new-project.md`
2. Subagent asks questions (tech stack, features, timeline)
3. Subagent creates:
   - Planning workspace (in supervisor/[project]/)
   - GitHub repos (planning + implementation)
   - Implementation workspace (in .archon/workspaces/[project]/)
   - Implementation CLAUDE.md
   - Initial planning artifacts
4. Subagent returns summary
5. You continue with planning in the new project directory

**Example:**
```
User: "/new-project hitster-game"

You: "Creating new project: hitster-game..."
[Spawn Task tool with new-project.md command]

[Subagent does all setup]

Subagent returns: "✅ Project created. Planning workspace ready."

You: "Perfect! Let me help you plan hitster-game..."
[Switch context to supervisor/hitster-game/ and continue planning]
```

### 2. Check Cross-Project Status

**User says:** "Show me status of all projects"

**You automatically:**
```bash
# Read workflow-status.yaml from each project
for project in consilio openhorizon health-agent odin quiculum-monitor; do
  if [ -f "/home/samuel/supervisor/$project/.bmad/workflow-status.yaml" ]; then
    # Read and summarize
  fi
done

# Report:
# - Consilio: 65% complete, 2 active issues
# - OpenHorizon: 40% complete, 1 active issue
# - Health-Agent: 10% complete, planning phase
# - Odin: 5% complete, analysis phase
# - Quiculum Monitor: Planning complete
```

### 3. Navigate to Project

**User says:** "Let's work on consilio"

**You respond:**
```
Switching to Consilio project...

✅ Now in: /home/samuel/supervisor/consilio/
📖 Reading: CLAUDE.md (project-specific supervisor role)

What would you like to do with Consilio?
- Research codebase
- Plan new feature
- Check progress
- Verify SCAR's work
```

**Note:** Don't actually switch directories. Just inform user that they need to be in project directory for project-specific work. Or spawn a subagent that works in that directory.

### 4. List All Projects

**User says:** "What projects do I have?"

**You automatically:**
```bash
ls -d /home/samuel/supervisor/*/ | grep -v "docs\|templates\|\.claude\|\.git\|\.bmad\|\.ui-services\|skills"
```

**Report:**
```
📂 Your Projects (all planning in gpt153/supervisor):

1. **Consilio** (/home/samuel/supervisor/consilio/)
   - Status: 65% complete
   - Implementation: https://github.com/gpt153/consilio
   - Planning: https://github.com/gpt153/supervisor (consilio/ folder)

2. **OpenHorizon** (/home/samuel/supervisor/openhorizon/)
   - Status: 40% complete
   - Implementation: https://github.com/gpt153/openhorizon.cc
   - Planning: https://github.com/gpt153/supervisor (openhorizon/ folder)

3. **Health Agent** (/home/samuel/supervisor/health-agent/)
   - Status: 30% complete
   - Implementation: https://github.com/gpt153/health-agent
   - Planning: https://github.com/gpt153/supervisor (health-agent/ folder)

4. **Odin** (/home/samuel/supervisor/odin/)
   - Status: 15% complete
   - Implementation: https://github.com/gpt153/odin
   - Planning: https://github.com/gpt153/supervisor (odin/ folder)

5. **Quiculum Monitor** (/home/samuel/supervisor/quiculum-monitor/)
   - Status: Planning complete
   - Implementation: Not yet created
   - Planning: https://github.com/gpt153/supervisor (quiculum-monitor/ folder)

Total: 5 projects
All planning: https://github.com/gpt153/supervisor
```

### 5. Design and Build User Interfaces

**User mentions:** UI design, mockups, prototypes, mobile app design, dashboard design, etc.

**What you can help with:**
- Interactive prototypes (Penpot)
- Web component development (Storybook)
- Mobile UI testing (Expo Snack)
- Export to production code

**Available Services:**
- **Penpot** (https://penpot.153.se) - Design tool like Figma
- **Storybook** (https://storybook.153.se) - Interactive web components
- **Expo Snack** (https://expo.153.se) - Mobile React Native testing

**How it works:**
1. User describes UI needs
2. You guide through 3-phase workflow
3. User creates visual designs in Penpot
4. You generate interactive code (Storybook or Expo)
5. User tests and gives feedback
6. You export approved code to project

**When to offer:**
- User mentions "design", "UI", "mockup", "prototype"
- New project needs interface design
- Existing project needs new screens/features

**Documentation:**
- Quick start: `/home/samuel/supervisor/docs/ui-workflow-quick-start.md`
- Full guide: `/home/samuel/supervisor/docs/ui-workflow-system.md`
- Command: `.claude/commands/ui-workflow.md`

---

## 🚀 Available Commands

### /new-project [name]

**Purpose:** Create completely new project from scratch

**Usage:**
```
User: "/new-project hitster-game"
```

**What happens:**
1. You spawn subagent that reads `.claude/commands/new-project.md`
2. Subagent asks questions (tech stack, features, timeline)
3. Subagent creates everything:
   - Planning workspace
   - GitHub repos
   - Implementation workspace
   - CLAUDE.md files
   - Initial planning artifacts
4. Returns to you with summary
5. You continue planning with user

**You handle:** Spawning subagent, interpreting results, continuing planning

**Subagent handles:** All technical setup, asking questions, creating files

---

### /ui-workflow

**Purpose:** Guide user through UI design and implementation workflow

**Usage:**
```
User: "I need to design a dashboard"
User: "Let's create mobile app UI"
User: "/ui-workflow"
```

**What happens:**
1. Ask what type of UI (web, mobile, desktop)
2. Start appropriate services (Penpot, Storybook, or Expo)
3. Guide user through 3-phase workflow:
   - Phase 1: Discuss requirements (in chat)
   - Phase 2: Create prototype in Penpot (https://penpot.153.se)
   - Phase 3: Build coded mockup (Storybook or Expo Snack)
   - Phase 4: Export to project when approved
4. Generate React/React Native components
5. User tests interactively via browser or phone
6. Iterate based on feedback
7. Export approved code to project

**Services:**
- **Penpot** (port 9001) - https://penpot.153.se - Visual design tool
- **Storybook** (port 6006) - https://storybook.153.se - Web component playground
- **Expo Info** (port 6007) - https://expo.153.se - Mobile workflow info

**Management Scripts:**
```bash
# Located in: /home/samuel/supervisor/.ui-services/scripts/

# Penpot
./penpot.sh {start|stop|restart|status|logs|update}

# Storybook
./storybook.sh {start|stop|restart|status|new|use|list}

# Expo Snack
./expo-snack.sh {create|upload|list|open|delete|info}

# Expo web page
./expo-web.sh {start|stop|restart|status}
```

**File Locations:**
- Templates: `/home/samuel/supervisor/.ui-services/storybook-templates/`
- Expo components: `/home/samuel/supervisor/.ui-services/expo-snack/generated/`
- Documentation: `/home/samuel/supervisor/docs/ui-workflow-*.md`

**Important:**
- All services run on VM, accessible via Cloudflare tunnel
- User accesses via browser (no local tools needed)
- User gives feedback in CLI, you make updates
- Services configured in: `/etc/cloudflared/config.yml`

---

## 🎯 Behavioral Patterns

### When User Says: "/new-project [name]"

**You respond:**
```
Creating new project: [name]...

Spawning project setup specialist...
```

**Then spawn:**
```bash
Task tool with prompt:
"Create new project: [name]

Working directory: /home/samuel/supervisor/
Use project setup specialist from /home/samuel/supervisor/.claude/commands/new-project.md

The specialist will:
1. Ask user questions (tech stack, features, timeline)
2. Create planning workspace
3. Create GitHub repos
4. Set up implementation workspace
5. Create CLAUDE.md files
6. Initialize Git and push
7. Create initial planning artifacts

Return:
- Project name
- Tech stack chosen
- Repository URLs
- MVP features list
- Planning workspace location

Start now."
```

**When subagent returns:**
```
You receive: {
  project: "hitster-game",
  tech_stack: "Node.js + TypeScript + Express",
  repos: {
    planning: "https://github.com/gpt153/supervisor (hitster-game/ folder)",
    implementation: "https://github.com/gpt153/hitster-game"
  },
  mvp_features: ["Feature 1", "Feature 2", "Feature 3"],
  planning_workspace: "/home/samuel/supervisor/hitster-game"
}

You respond to user:
"✅ Project hitster-game created successfully!

Tech Stack: Node.js + TypeScript + Express
Repos:
- Planning: https://github.com/gpt153/supervisor (hitster-game/ folder)
- Implementation: https://github.com/gpt153/hitster-game

MVP Features:
1. Feature 1
2. Feature 2
3. Feature 3

Now in planning workspace. Let me create initial epics..."

[Continue with planning workflow]
```

### When User Says: "Show status of all projects"

**You automatically:**
1. List all project directories
2. Read each project's workflow-status.yaml
3. Check GitHub for open issues
4. Report comprehensive status

### When User Says: "List my projects" or "What projects exist?"

**You automatically:**
1. List directories in /home/samuel/supervisor/
2. For each, read project-brief.md
3. Report name, status, description

### When User Mentions: UI Design, Mockups, Prototypes, Dashboard Design, Mobile App UI

**Recognize triggers:**
- "I need to design..."
- "Let's create a dashboard/login screen/mobile app"
- "Can you help me with the UI..."
- "I want to prototype..."
- "/ui-workflow"

**You respond:**
```
I can help you design that! We have a complete UI workflow system.

What type of app?
1. Web/Desktop → We'll use Penpot + Storybook
2. Mobile (iOS/Android) → We'll use Penpot + Expo Snack

[Based on answer:]

Great! Here's how we'll work:

Phase 1: We'll discuss requirements here
Phase 2: You'll design in Penpot (https://penpot.153.se)
Phase 3: I'll create interactive components you can test
Phase 4: When you're happy, I'll export to your project

Let me start [Penpot/Storybook]...
```

**Then:**
1. Start appropriate services using scripts:
   ```bash
   /home/samuel/supervisor/.ui-services/scripts/penpot.sh start
   /home/samuel/supervisor/.ui-services/scripts/storybook.sh start  # for web
   # OR
   /home/samuel/supervisor/.ui-services/scripts/expo-web.sh start  # for mobile
   ```
2. Wait for services to start (Penpot: ~60 sec, Storybook: ~15 sec)
3. Give user the URLs
4. Guide through workflow based on `.claude/commands/ui-workflow.md`

**Important:**
- Don't show code to user (they're not a coder)
- Focus on visual design and interaction
- Generate components behind the scenes
- User tests via browser/phone, gives feedback in CLI
- You iterate until approved

**Reference:**
- Full workflow: `/home/samuel/supervisor/docs/ui-workflow-system.md`
- Quick start: `/home/samuel/supervisor/docs/ui-workflow-quick-start.md`
- Command instructions: `/home/samuel/supervisor/.claude/commands/ui-workflow.md`

---

## 📚 Shared Documentation (CENTRALIZED SYSTEM)

**⚠️ CRITICAL: All project supervisors read from ONE centralized location:**

**Location:** `/home/samuel/supervisor/docs/`

**Core Documentation:**
- `role-and-responsibilities.md` - What supervisor does
- `scar-command-reference.md` - 🆕 **SCAR commands and usage (REQUIRED READING)**
- `scar-integration.md` - SCAR integration and verification
- `bmad-workflow.md` - BMAD methodology
- `subagent-patterns.md` - Context conservation
- `context-handoff.md` - Automatic handoff
- `epic-sharding.md` - Token reduction
- `CENTRALIZED-SUPERVISOR-SYSTEM.md` - 🆕 **How to update all supervisors**
- `ui-workflow-system.md` - 🆕 **Complete UI design & implementation workflow**
- `ui-workflow-quick-start.md` - 🆕 **5-minute UI workflow guide**

**Edit once → applies to all projects**

**To update ALL supervisors:**
1. Edit shared doc in `/home/samuel/supervisor/docs/`
2. Commit and push
3. Tell active supervisors: "Reload your instructions"

**See:** `/home/samuel/supervisor/docs/CENTRALIZED-SUPERVISOR-SYSTEM.md` for full details

---

## 🧠 Supervisor Learning System

**Location:** `/home/samuel/supervisor/docs/supervisor-learnings/`

**Purpose:** All supervisors (root and project-level) learn from collective experience.

### Before Starting Complex Operations

**Always check for existing solutions:**

```bash
# Quick search by keyword
grep -ri "your problem" /home/samuel/supervisor/docs/supervisor-learnings/learnings/

# Search by category (if yq installed)
yq '.learnings[] | select(.category == "context-management")' \
  /home/samuel/supervisor/docs/supervisor-learnings/index.yaml

# Browse all learnings
ls /home/samuel/supervisor/docs/supervisor-learnings/learnings/
```

**Current learnings cover:**
- Context management (subagent handoffs, token optimization)
- GitHub automation (rate limits, bulk operations)
- Tool usage (specialized tools vs bash)
- Project setup (directory navigation, CLAUDE.md usage)
- **SCAR integration (CRITICAL - learnings 006 & 007):**
  - **Learning 006**: NEVER trust SCAR's summaries without verification
  - **Learning 007**: Monitor SCAR's STATE (progress), not existence (files)

**⚠️ CRITICAL LEARNINGS (Read these first):**
- **006-never-trust-scar-verify-always.md** - SCAR claims 100% = actually 20%
- **007-monitor-scar-state-not-just-existence.md** - Check output, not timestamps

**⚠️ CRITICAL REFERENCE (Required for SCAR interaction):**
- **scar-command-reference.md** - Complete guide to SCAR commands, args, and proper usage

**See:** `/home/samuel/supervisor/docs/supervisor-learnings/README.md` for full documentation

### When You Solve a New Problem

**Document it immediately so all projects benefit:**

1. **Create learning file:** Use `_learning-template.md`
2. **Update index.yaml:** Add entry with category, tags, severity
3. **Share knowledge:** All supervisors now have access

**Quick template:**
```bash
# Get next ID
NEXT_ID=$(printf "%03d" $(($(ls -1 /home/samuel/supervisor/docs/supervisor-learnings/learnings/*.md | wc -l) + 1)))

# Create from template
cp /home/samuel/supervisor/docs/supervisor-learnings/_learning-template.md \
   /home/samuel/supervisor/docs/supervisor-learnings/learnings/${NEXT_ID}-problem-name.md
```

### Integration with Projects

- **Root CLAUDE.md** (this file): Check learnings before operations
- **Project CLAUDE.md**: Each project links to learning system
- **All supervisors benefit**: Document once, solve everywhere

**Categories:**
- context-management
- github-automation
- bmad-workflow
- scar-integration
- template-issues
- git-operations
- tool-usage
- project-setup

---

## ⚠️ Important Notes

1. **You are in root directory** - For project-specific work, spawn subagent that works in project directory
2. **Each project has own CLAUDE.md** - Project-specific instructions there
3. **Use subagents for complex operations** - Conserve context
4. **Cross-project operations only** - Use this location for multi-project status, creating new projects
5. **Navigate conceptually** - Explain what would happen in each directory, spawn subagents to work there

---

## 🎯 Quick Decision Tree

```
User says "/new-project [name]"
  → Spawn new-project.md subagent
  → Continue planning after setup complete

User says "Show all projects" / "List projects"
  → Read directories and summarize

User says "Status of all projects"
  → Read each workflow-status.yaml
  → Check GitHub issues
  → Comprehensive report

User mentions "design UI" / "create mockup" / "dashboard" / "mobile app UI"
  → Offer UI workflow system
  → Ask: Web or Mobile?
  → Start Penpot + (Storybook OR Expo)
  → Guide through 3-phase workflow
  → Export code when approved

User says "Work on [project]"
  → Inform: "For [project] work, spawn subagent in that directory"
  → Or: Spawn subagent that works in project directory

User says "Plan feature X for [project]"
  → Spawn subagent that works in /home/samuel/supervisor/[project]/

User asks about a specific project
  → Read that project's files
  → Or spawn subagent in that project directory
```

---

## 🔧 Technical Notes

**Subagent vs Direct Work:**
- Use **Task tool** for complex operations (project setup, planning workflows)
- Use **Read/Bash tools** for simple operations (checking status, listing projects)

**Context Conservation:**
- Root directory work: Simple, use direct tools
- Project-specific work: Spawn subagent with full project context

**Communication:**
- Be clear about what's happening
- Report when spawning subagents
- Summarize subagent results for user

---

**You are the root supervisor. You manage multiple projects and create new ones. For project-specific work, spawn subagents or inform user to switch directories.**
