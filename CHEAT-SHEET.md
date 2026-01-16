# Supervisor Cheat Sheet

**Quick reference for common operations**

---

## 🚀 Starting Completely New Project

### Method 1: Using /new-project Command (Easiest)

```bash
cd /home/samuel/supervisor
# Start Claude Code

"/new-project my-project"

# Supervisor asks questions, then automatically:
# - Creates GitHub repos
# - Sets up workspaces
# - Creates CLAUDE.md files
# - Initializes planning
# - Ready in ~2 minutes!
```

### Method 2: Manual Setup

```bash
# 1. Init planning workspace
cd /home/samuel/supervisor
./init-project.sh my-project https://github.com/gpt153/my-project-planning.git

# 2. Create GitHub repos
gh repo create gpt153/my-project-planning --public
gh repo create gpt153/my-project --public

# 3. Push planning workspace
cd /home/samuel/supervisor/my-project
git remote add origin https://github.com/gpt153/my-project-planning.git
git push -u origin main

# 4. Create implementation workspace
mkdir -p /home/samuel/.archon/workspaces/my-project
cd /home/samuel/.archon/workspaces/my-project
git init && git checkout -b main
mkdir -p src tests docs
touch README.md .gitignore .env.example

# 5. Create CLAUDE.md (tech stack, coding standards)
vim CLAUDE.md

# 6. Commit and push
git add . && git commit -m "feat: Initialize"
git remote add origin https://github.com/gpt153/my-project.git
git push -u origin main

# 7. Start planning
cd /home/samuel/supervisor/my-project
# Claude Code: "New project: [description]. Help me plan."
```

---

## 📂 Working on Existing Project

```bash
cd /home/samuel/supervisor/consilio
# Claude Code: "Research codebase and help me plan next features"
```

---

## ⚡ Slash Commands

**From /home/samuel/supervisor/ (root):**
- `/new-project [name]` - Create completely new project (automated)
- Examples:
  - `/new-project hitster-game`
  - `/new-project health-tracker`
  - `/new-project api-gateway`

**From project directory:**
- `/verify-scar-phase [project] [issue] [phase]` - Comprehensive validation
- Examples:
  - `/verify-scar-phase consilio 123 2`
  - `/verify-scar-phase openhorizon.cc 45 3`

---

## 🎯 Common Natural Language Commands

**From root (/home/samuel/supervisor/):**
- "List all projects"
- "Show status of all projects"
- "What projects do I have?"

**Planning:**
- "Plan feature: user authentication"
- "Add email notifications"
- "Fix the login bug"

**Monitoring:**
- "Check issue 123"
- "Is SCAR done yet?"
- "What's the status of Consilio?"
- "Show all open issues"

**Validation:**
- "Verify issue 123"
- "Is the work good?"
- "Test the authentication"
- "Does the UI work?"

**Research:**
- "How should we implement JWT?"
- "What's the best practice for X?"
- "Show me code examples for Y"

---

## 📍 Directory Locations

**Planning workspaces:**
- `/home/samuel/supervisor/consilio/`
- `/home/samuel/supervisor/openhorizon/`
- `/home/samuel/supervisor/health-agent/`
- `/home/samuel/supervisor/quiculum-monitor/`
- `/home/samuel/supervisor/[project]/`

**Implementation workspaces:**
- `/home/samuel/.archon/workspaces/consilio/`
- `/home/samuel/.archon/workspaces/openhorizon.cc/`
- `/home/samuel/.archon/workspaces/health-agent/`
- `/home/samuel/.archon/workspaces/quiculum-monitor/`
- `/home/samuel/.archon/workspaces/[project]/`

**Worktrees (SCAR's active work):**
- `/home/samuel/.archon/worktrees/[project]/issue-*/`

**Shared documentation:**
- `/home/samuel/supervisor/docs/`

---

## 🔑 Key Concepts

**Supervisor = Strategic oversight**
- Plans features (creates epics, ADRs, PRDs)
- Directs SCAR (creates GitHub issues)
- Validates implementations (reads code, runs tests)
- Monitors progress (checks every 2 hours)

**SCAR = Implementation worker**
- Reads epics from GitHub URLs
- Implements code in worktrees
- Creates PRs
- Updates progress via comments

**Separation:**
- Planning: `/supervisor/[project]/` (supervisor works here)
- Implementation: `/workspaces/[project]/` (SCAR works here)
- Validation: `/worktrees/[project]/issue-*/` (supervisor reads/tests here)

---

## 🤖 What Supervisor Does Automatically

**When you say "Plan feature X":**
1. Detects complexity (0-4)
2. Searches Archon RAG for patterns
3. Spawns subagents to create epic + ADRs
4. Creates GitHub issue with @scar
5. Waits 20s for SCAR acknowledgment
6. Monitors progress every 2 hours

**When SCAR says "Implementation complete":**
1. Spawns verification subagent automatically
2. Runs build, tests, checks for mocks
3. Posts APPROVED or detailed feedback
4. Reports results to you

**Proactive behaviors:**
- ✅ Verifies SCAR acknowledgment (20s)
- ✅ Checks progress every 2 hours
- ✅ Validates when SCAR claims done
- ✅ Warns at 60% context
- ✅ Handoff at 80% context
- ✅ Searches best practices when planning

---

## 📚 Documentation

**Read these for full details:**
- `GETTING-STARTED.md` - Complete walkthrough
- `AUTONOMOUS-SUPERVISOR.md` - How autonomous behavior works
- `SUPERVISOR-CAPABILITIES.md` - Full validation capabilities
- `CORRECT-ARCHITECTURE.md` - Architecture explanation
- `README.md` - Overview

---

## ⚡ Emergency Commands

**SCAR not responding after 20s?**
```bash
# Check GitHub webhook logs
# Re-post issue with clearer @scar mention
```

**Context approaching 80%?**
```bash
# Supervisor warns automatically
# Creates handoff document
# Start new session: "Resume from handoff"
```

**SCAR stuck on issue?**
```bash
cd /home/samuel/supervisor/[project]
# Say: "Check issue 123, SCAR might be stuck"
# Supervisor posts status check comment
```

**Need to test manually?**
```bash
cd /home/samuel/.archon/worktrees/[project]/issue-123/
npm test  # or pytest, etc.
```

---

**Keep this handy for quick reference!** 📌
