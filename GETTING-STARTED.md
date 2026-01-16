# Getting Started - Complete Walkthrough

**Created:** 2026-01-15 (Stockholm time)
**Purpose:** Step-by-step guide for working with existing projects and starting new ones

---

## 📂 Scenario 1: Working on Existing Project (Consilio)

### Initial Setup

**1. Open Claude Code in planning workspace:**
```bash
cd /home/samuel/supervisor/consilio
# Start Claude Code here
```

**2. Say this to supervisor:**
```
"I want to work on Consilio. Please:
1. Research the existing codebase
2. Read any existing PRD or documentation
3. Understand what's already implemented
4. Help me plan the next features"
```

### What Supervisor Does Automatically

**Step 1: Reads planning workspace**
```
Supervisor reads:
- /home/samuel/supervisor/consilio/.bmad/project-brief.md
- /home/samuel/supervisor/consilio/.bmad/workflow-status.yaml
- /home/samuel/supervisor/consilio/.bmad/prd/* (if any exist)
- /home/samuel/supervisor/consilio/.bmad/epics/* (if any exist)
```

**Step 2: Researches implementation codebase**
```
Supervisor spawns research subagent:
"Research Consilio codebase

Working directory: /home/samuel/.archon/workspaces/consilio/

Tasks:
1. Read CLAUDE.md (implementation guide with tech stack)
2. Read package.json (dependencies, scripts)
3. Read README.md (if exists)
4. Scan directory structure (backend/, frontend/, etc.)
5. Check for existing PRD/docs
6. List implemented features
7. Identify missing features
8. Note any technical debt

Return: Comprehensive codebase summary"
```

**Step 3: Checks for existing PRD/documentation**
```
Supervisor checks:
- /home/samuel/.archon/workspaces/consilio/PRD.md
- /home/samuel/.archon/workspaces/consilio/docs/
- /home/samuel/.archon/workspaces/consilio/.agents/
- Any markdown files in root

If found:
→ Reads them
→ Summarizes for you
→ Asks: "I found existing PRD. Should I:
  1) Use it as-is
  2) Update it
  3) Create new version in planning workspace"
```

**Step 4: Creates or updates project-brief**
```
If project-brief.md is template:
→ Supervisor fills it out based on codebase research
→ Asks for your confirmation/edits

If project-brief.md already filled:
→ Supervisor reads it
→ Checks if it matches current codebase
→ Suggests updates if needed
```

**Step 5: Reports findings**
```
Supervisor presents:
"📊 Consilio Codebase Analysis

Tech Stack:
- Backend: Node.js + TypeScript + Express
- Database: PostgreSQL with Row-Level Security
- Frontend: React + TypeScript + TailwindCSS
- Auth: Custom JWT implementation

Implemented Features:
✅ User authentication (JWT)
✅ Email routing system
✅ Document editor
✅ Case management (partial)

Missing Features (from PRD):
❌ Email viewer
❌ Document version control
❌ Advanced search

Current Status: 65% complete

Next recommended features to plan:
1. Email viewer (completes email system)
2. Document version control (high priority)
3. Advanced search (enhances usability)

What would you like to work on next?"
```

### Example Conversation Flow

**You:**
```
cd /home/samuel/supervisor/consilio
# Start Claude Code

"I want to work on Consilio. Research the codebase and help me plan next features."
```

**Supervisor:**
```
Researching Consilio codebase...

[Spawns research subagent that reads implementation workspace]

📊 Codebase Analysis Complete

Found existing PRD: /home/samuel/.archon/workspaces/consilio/PRD.md (64KB)

Tech Stack:
- Node.js + TypeScript + PostgreSQL
- React frontend with TailwindCSS
- Row-Level Security for multi-tenancy

Implemented (65%):
✅ Authentication & user management
✅ Email routing (Gmail + custom domains)
✅ Document editor (TipTap)
✅ Organization management

Partially Implemented (25%):
🟡 Case management (UI only, no backend)
🟡 Document viewer (no version control)

Missing from PRD (10%):
❌ Email viewer
❌ Advanced search
❌ Notification system
❌ Reporting/analytics

Current Issues:
- Issue #61: Document version control (open, no progress)
- Issue #58: Email viewer implementation (open, SCAR working)

Next Steps:
1. Should I copy the existing PRD to planning workspace?
2. Which feature would you like to plan next?
3. Should I check on existing issues (#58, #61)?
```

**You:**
```
"Yes, copy the PRD. Then check on issue #58. After that, let's plan document version control."
```

**Supervisor:**
```
✅ Copied PRD to .bmad/prd/consilio-v1.md

Checking issue #58 (Email viewer)...
- Opened 5 days ago
- SCAR acknowledged (last update: 3 days ago)
- Status: "Working on email list component"
- Files created: 4 components, 2 API endpoints
- Progress: ~40% complete
- ⚠️ No update in 3 days - might be stuck

Actions:
1. I'll post a status check comment to SCAR
2. Meanwhile, let's plan document version control

Planning document version control...
[Spawns meta-orchestrator subagent]

Searching Archon RAG for version control patterns...
Found 7 relevant docs + 4 code examples

Creating epic...
✅ Epic created: .bmad/epics/001-document-version-control.md
✅ ADR created: .bmad/adr/003-git-style-versioning.md

GitHub issue created: #62
Waiting for SCAR acknowledgment...
✅ SCAR acknowledged: "Starting document version control implementation"

Summary:
- Issue #58: Checking with SCAR (might need help)
- Issue #62: SCAR starting now (document version control)

I'll monitor both issues and report progress.
```

**You:**
```
"Great, keep me updated every few hours."
```

**Supervisor:**
```
✅ Will do. I'll check progress on #58 and #62 every 2 hours and report.

Created Archon MCP tasks:
- "Monitor issue #58 (Email viewer)" - status: doing
- "Monitor issue #62 (Document version control)" - status: doing
- "Plan next feature after version control" - status: todo

You can ask "What's the status?" anytime and I'll give you a full update.
```

---

## 🆕 Scenario 2: Starting Completely New Project (No Repo Exists)

**When you have NOTHING yet - just an idea.**

### Complete Step-by-Step Process

#### Step 1: Run init script (creates planning workspace)

```bash
cd /home/samuel/supervisor
./init-project.sh health-agent https://github.com/gpt153/health-agent-planning.git
```

**This creates planning workspace:**
```
/home/samuel/supervisor/health-agent/
├── CLAUDE.md (supervisor role)
├── .bmad/ (planning structure)
└── .git/ (initialized)
```

#### Step 2: Set up planning repo remote

```bash
cd /home/samuel/supervisor/health-agent
git remote add origin https://github.com/gpt153/health-agent-planning.git
git push -u origin main
```

**Note:** Create the repo on GitHub first if it doesn't exist:
```bash
gh repo create gpt153/health-agent-planning --public --description "Planning workspace for Health Agent"
```

#### Step 3: Create implementation GitHub repo

```bash
# This is where SCAR will work
gh repo create gpt153/health-agent --public --description "Telegram bot for health tracking"
```

**Now you have two repos:**
- `health-agent-planning` - Planning artifacts (epics, ADRs, PRDs)
- `health-agent` - Implementation code (SCAR works here)

#### Step 4: Create and initialize implementation workspace

```bash
# Create workspace directory
mkdir -p /home/samuel/.archon/workspaces/health-agent
cd /home/samuel/.archon/workspaces/health-agent

# Initialize Git
git init
git checkout -b main

# Create basic structure
mkdir -p src tests docs

# Create README.md
cat > README.md << 'EOF'
# Health Agent

Telegram bot for personal health tracking.

## Tech Stack
- Python 3.11+
- python-telegram-bot
- SQLite
- matplotlib (for charts)

## Setup
```bash
pip install -r requirements.txt
python src/bot.py
```
EOF

# Create requirements.txt
cat > requirements.txt << 'EOF'
python-telegram-bot==20.7
matplotlib==3.8.2
python-dotenv==1.0.0
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/

# Environment
.env
.env.local

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
EOF

# Create .env.example
cat > .env.example << 'EOF'
TELEGRAM_BOT_TOKEN=your_token_here
DATABASE_PATH=./health_data.db
EOF
```

#### Step 5: Create implementation CLAUDE.md

```bash
cd /home/samuel/.archon/workspaces/health-agent

cat > CLAUDE.md << 'EOF'
# Health Agent - Implementation Guide

**Repository:** https://github.com/gpt153/health-agent
**Workspace:** /home/samuel/.archon/workspaces/health-agent
**Planning Repo:** https://github.com/gpt153/health-agent-planning

---

## Tech Stack

**Language:** Python 3.11+
**Framework:** python-telegram-bot (polling mode)
**Database:** SQLite
**Charts:** matplotlib

---

## Critical Rules

1. **Type Hints Required**
   - All functions must have type hints
   - Use `from typing import ...` for complex types
   - No `Any` without justification

2. **Error Handling**
   - Wrap all Telegram handlers in try/except
   - Log errors with full context
   - Send user-friendly error messages

3. **Database**
   - Use context managers for connections
   - Parameterized queries only (prevent SQL injection)
   - Close connections properly

4. **Environment Variables**
   - All secrets in .env (NEVER commit .env)
   - Use python-dotenv for loading
   - Validate required vars on startup

5. **Testing**
   - Unit tests for business logic
   - Mock Telegram API calls
   - Test coverage >70%

---

## Project Structure

```
health-agent/
├── src/
│   ├── bot.py              # Main entry point
│   ├── handlers/           # Telegram command handlers
│   ├── services/           # Business logic
│   ├── db/                 # Database operations
│   └── utils/              # Helper functions
├── tests/
│   ├── test_handlers.py
│   └── test_services.py
├── docs/                   # Implementation docs
├── requirements.txt
├── .env.example
└── README.md
```

---

## Coding Standards

**Style:**
- Follow PEP 8
- Use Black for formatting
- Use pylint for linting
- Max line length: 100 characters

**Functions:**
```python
def track_weight(user_id: int, weight: float, date: datetime) -> bool:
    """
    Track user's weight measurement.

    Args:
        user_id: Telegram user ID
        weight: Weight in kg
        date: Measurement date

    Returns:
        True if saved successfully, False otherwise
    """
    try:
        # Implementation
        return True
    except Exception as e:
        logger.error(f"Failed to track weight: {e}", exc_info=True)
        return False
```

**Database:**
```python
import sqlite3
from contextlib import closing

def get_user_data(user_id: int) -> dict:
    with closing(sqlite3.connect('health.db')) as conn:
        with closing(conn.cursor()) as cursor:
            cursor.execute(
                "SELECT * FROM users WHERE telegram_id = ?",
                (user_id,)
            )
            return cursor.fetchone()
```

---

## Epic References

When implementing features, SCAR reads epics from:
https://github.com/gpt153/health-agent-planning/blob/main/.bmad/epics/

Example:
- Epic 001: Bot foundation
- Epic 002: Weight tracking
- Epic 003: Sleep logging

---

## Testing

**Run tests:**
```bash
pytest tests/ -v --cov=src
```

**Required:**
- All handlers must be tested
- Business logic 100% coverage
- Database operations mocked

---

## Security

**NEVER commit:**
- .env file
- Database files (*.db, *.sqlite)
- API tokens/secrets

**Always:**
- Validate user input
- Sanitize database queries
- Rate limit commands
- Log security events

---

**Ready for SCAR to implement features following these guidelines.**
EOF
```

#### Step 6: Commit and push implementation workspace

```bash
cd /home/samuel/.archon/workspaces/health-agent

git add .
git commit -m "feat: Initialize Health Agent project structure"
git remote add origin https://github.com/gpt153/health-agent.git
git push -u origin main
```

#### Step 7: Start planning with supervisor

```bash
cd /home/samuel/supervisor/health-agent
# Start Claude Code here

"I'm starting Health Agent - a Telegram bot for health tracking.

Project setup complete:
- Planning repo: https://github.com/gpt153/health-agent-planning
- Implementation repo: https://github.com/gpt153/health-agent
- Tech stack: Python + python-telegram-bot + SQLite

Please help me:
1. Fill out project brief
2. Create initial PRD
3. Plan MVP features (weight tracking, sleep logging)
4. Create epics for SCAR"
```

### What Supervisor Does

**Supervisor responds:**
```
Great! I see you've set up both repos. Let me help you plan.

Reading implementation workspace...
✅ Found CLAUDE.md with Python + Telegram bot stack
✅ Basic project structure in place
✅ Ready for feature development

Quick questions for project brief:

1. **Target Users**: Who will use this?
   - Personal use only?
   - Public bot for everyone?

2. **MVP Features**: Confirm priorities?
   - Weight tracking (MUST HAVE)
   - Sleep logging (MUST HAVE)
   - Exercise tracking (SHOULD HAVE?)
   - Mood tracking (COULD HAVE?)
   - Custom metrics (WON'T HAVE for MVP?)

3. **Timeline**: When do you want MVP?
   - 1 week?
   - 2 weeks?

4. **Success Metrics**: How to measure success?
   - Daily active users?
   - Data points tracked?
   - User retention?
```

**You answer:**
```
"Personal use for now. MVP in 2 weeks: weight and sleep tracking only. Success = I use it daily."
```

**Supervisor creates:**
```
Excellent! Creating planning artifacts...

Searching Archon RAG for Telegram bot patterns...
Found:
- "python-telegram-bot best practices"
- "SQLite schema for health tracking"
- "matplotlib chart generation examples"

✅ Filled project-brief.md:
   Vision: Personal health tracking via Telegram
   Tech: Python + python-telegram-bot + SQLite
   MVP: Weight + sleep tracking in 2 weeks

✅ Created PRD: .bmad/prd/health-agent-mvp.md (7.2KB)
   - Problem statement
   - User personas (you!)
   - MVP features (MoSCoW)
   - Technical architecture
   - Success metrics

✅ Created 3 MVP epics:
   001-bot-foundation.md (4h)
   002-weight-tracking.md (8h)
   003-sleep-logging.md (8h)

✅ Created ADRs:
   001-sqlite-vs-postgres.md (chose SQLite)
   002-polling-vs-webhooks.md (chose polling for simplicity)

✅ Created Archon MCP project:
   - "Health Agent MVP"
   - 3 tasks created (one per epic)
   - Status: todo

Committed to planning repo ✅
Pushed to GitHub ✅

Ready to start! Which epic should I send to SCAR first?

Recommended order:
1. Epic 001: Bot foundation (sets up structure)
2. Epic 002: Weight tracking (core feature)
3. Epic 003: Sleep logging (extends pattern)

Say "Start epic 001" to begin.
```

**You:**
```
"Start epic 001"
```

**Supervisor:**
```
Creating GitHub issue for Epic 001: Bot foundation...

Issue created: gpt153/health-agent#1
Title: "Bot Foundation - Command handlers and database setup"
Body:
  Epic URL: https://github.com/gpt153/health-agent-planning/blob/main/.bmad/epics/001-bot-foundation.md

  @scar - Implement bot foundation following epic specifications.

  Acceptance Criteria:
  - [ ] Bot connects to Telegram
  - [ ] /start command works
  - [ ] SQLite database initialized
  - [ ] User registration working
  - [ ] Error handling in place
  - [ ] Type hints on all functions
  - [ ] Tests passing

Waiting for SCAR acknowledgment...
[20 seconds pass]

✅ SCAR acknowledged: "Starting bot foundation implementation"

Monitoring progress...
I'll check every 2 hours and report back.

Archon MCP task updated: "Epic 001" → status: doing
```

---

### Complete Checklist for New Project

**Setup (Manual):**
- ✅ Run init script: `./init-project.sh [name] [planning-repo-url]`
- ✅ Create planning GitHub repo
- ✅ Push planning workspace to GitHub
- ✅ Create implementation GitHub repo
- ✅ Create implementation workspace directory
- ✅ Initialize Git in implementation workspace
- ✅ Create basic project structure (src/, tests/, docs/)
- ✅ Create README.md, .gitignore, .env.example
- ✅ Create requirements.txt / package.json
- ✅ Create implementation CLAUDE.md (coding standards)
- ✅ Commit and push to implementation repo

**Planning (Supervisor Helps):**
- ✅ Fill project-brief.md (supervisor asks questions)
- ✅ Create PRD (supervisor writes based on answers)
- ✅ Create MVP epics (supervisor creates 3-5 epics)
- ✅ Create ADRs (supervisor documents decisions)
- ✅ Create Archon MCP project (supervisor tracks tasks)

**Implementation (Supervisor + SCAR):**
- ✅ Create GitHub issues (supervisor, one per epic)
- ✅ Verify SCAR acknowledgment (supervisor)
- ✅ Monitor progress (supervisor, every 2 hours)
- ✅ Validate implementations (supervisor)

---

## 🔄 Alternative: Using init-project.sh for Planning Only

### Method 1: Using init-project.sh (Recommended)

**Step 1: Run init script**
```bash
cd /home/samuel/supervisor
./init-project.sh health-agent https://github.com/gpt153/health-agent-planning.git
```

**What this creates:**
```
/home/samuel/supervisor/health-agent/
├── CLAUDE.md (supervisor role + autonomous behavior)
├── .bmad/
│   ├── project-brief.md (template - needs filling)
│   ├── workflow-status.yaml (ready to use)
│   ├── epics/
│   ├── adr/
│   ├── prd/
│   ├── architecture/
│   ├── discussions/
│   └── feature-requests/
├── .gitignore
└── .git/ (initialized, initial commit made)

Status: Planning workspace ready ✅
```

**Step 2: Set up Git remote**
```bash
cd /home/samuel/supervisor/health-agent
git remote add origin https://github.com/gpt153/health-agent-planning.git
git push -u origin main
```

**Step 3: Create implementation workspace**
```bash
cd /home/samuel/.archon/workspaces
mkdir health-agent
cd health-agent

# If starting from template/boilerplate:
git clone https://github.com/your-org/template.git .

# Or initialize from scratch:
npm init -y
git init
```

**Step 4: Create implementation CLAUDE.md**
```bash
cd /home/samuel/.archon/workspaces/health-agent
vim CLAUDE.md

# Add implementation guide:
# - Tech stack (Node.js, Python, etc.)
# - Coding standards
# - Database schema
# - API patterns
# - Testing requirements
```

**Step 5: Start planning with supervisor**
```bash
cd /home/samuel/supervisor/health-agent
# Start Claude Code here

"I'm starting a new project called Health Agent. It's a Telegram bot for tracking health metrics. Please help me:
1. Fill out the project brief
2. Research best practices
3. Create initial PRD
4. Plan the MVP"
```

### What Supervisor Does for New Project

**Supervisor automatically:**

**1. Asks clarifying questions**
```
"I'll help you set up Health Agent. Let me ask a few questions:

Project Vision:
- What problem does it solve?
- Who are the users?
- What's the core functionality?

Tech Stack:
- Any preferences? (I see Python is common for Telegram bots)
- Database needed? (SQLite for simple, PostgreSQL for production)
- Hosting? (Cloud Run, Railway, VPS)

MVP Scope:
- What features are MUST HAVE for launch?
- What can wait for v2?
- Timeline constraints?

I'll use your answers to:
1. Fill out project-brief.md
2. Search Archon RAG for similar projects
3. Create initial architecture design
4. Plan MVP epics"
```

**2. Searches for best practices**
```
Searching Archon RAG...

Found similar projects:
- "PydanticAI Telegram bot" (health-agent-builder)
- "Telegram bot with python-telegram-bot library"
- "Health tracking with SQLite"

Code examples:
- Telegram bot setup with python-telegram-bot
- SQLite schema for health metrics
- Chart generation with matplotlib

Using these patterns for your project...
```

**3. Fills out project-brief.md**
```
Based on your answers, I've filled out project-brief.md:

Vision: Personal health tracking via Telegram
Primary Goal: Track weight, sleep, exercise via simple chat commands
Tech Stack: Python + python-telegram-bot + SQLite + matplotlib
MVP Features: Weight tracking, sleep logging, weekly charts
Timeline: 2 weeks for MVP

Does this look correct? I can adjust any section.
```

**4. Creates initial PRD**
```
Creating PRD in .bmad/prd/health-agent-mvp.md...

Sections:
1. Problem Statement
2. User Personas (health-conscious individuals)
3. MVP Features (MoSCoW prioritized)
4. Technical Architecture
5. Success Metrics
6. Launch Plan

✅ PRD created (8.5KB)

Next: Should I create epics for MVP features?
```

**5. Plans MVP epics**
```
Creating MVP epics...

Epic 1: Telegram Bot Foundation
- Bot setup, command handlers, user registration
- Complexity: Level 1 (simple)
- ETA: 4 hours

Epic 2: Weight Tracking
- Log weight, view history, weekly charts
- Complexity: Level 2 (medium)
- ETA: 8 hours

Epic 3: Sleep Logging
- Log sleep hours, quality, trends
- Complexity: Level 2 (medium)
- ETA: 8 hours

Total MVP effort: ~20 hours (SCAR time)

Created:
✅ .bmad/epics/001-bot-foundation.md
✅ .bmad/epics/002-weight-tracking.md
✅ .bmad/epics/003-sleep-logging.md
✅ .bmad/adr/001-sqlite-vs-postgres.md

Ready to create GitHub issues and start SCAR?
```

**You:**
```
"Yes, start with epic 1 (bot foundation)."
```

**Supervisor:**
```
Creating GitHub issue for epic 1...

⚠️ Wait - I don't see an implementation repo yet.

Please create:
1. GitHub repo: https://github.com/gpt153/health-agent
2. Clone to: /home/samuel/.archon/workspaces/health-agent/
3. Add implementation CLAUDE.md (tech stack guide)

Then I can create GitHub issues and instruct SCAR.

Would you like me to guide you through setting up the implementation repo?
```

### Complete New Project Checklist

**Planning Workspace (Done by init script):**
- ✅ /home/samuel/supervisor/[project]/ created
- ✅ CLAUDE.md (supervisor role)
- ✅ .bmad/ structure
- ✅ Git initialized
- ⚠️ project-brief.md (needs filling - supervisor helps)

**Implementation Workspace (You + Supervisor):**
- ⬜ Create GitHub repo
- ⬜ Clone to /home/samuel/.archon/workspaces/[project]/
- ⬜ Create CLAUDE.md (implementation guide)
- ⬜ Initialize project (npm init, python setup, etc.)
- ⬜ First commit

**Planning Phase (Supervisor):**
- ⬜ Fill project-brief.md (supervisor asks questions)
- ⬜ Search Archon RAG for patterns
- ⬜ Create PRD
- ⬜ Create MVP epics
- ⬜ Create ADRs for key decisions

**Implementation Phase (SCAR):**
- ⬜ Create GitHub issues (supervisor)
- ⬜ Verify SCAR acknowledgment (supervisor)
- ⬜ Monitor progress (supervisor)
- ⬜ Validate implementations (supervisor)

---

## 🔄 Typical Workflow Patterns

### Pattern 1: Planning New Feature on Existing Project

```bash
# 1. Navigate to planning workspace
cd /home/samuel/supervisor/consilio

# 2. Start Claude Code

# 3. Say:
"Plan feature: email notifications when new case assigned"

# Supervisor automatically:
# - Searches Archon RAG for notification patterns
# - Spawns meta-orchestrator subagent
# - Creates epic + ADRs
# - Creates GitHub issue
# - Verifies SCAR acknowledgment
# - Monitors progress
```

### Pattern 2: Checking Multiple Issues

```bash
cd /home/samuel/supervisor/consilio

"What's the status of all open issues?"

# Supervisor automatically:
# - Lists all open issues with SCAR
# - Checks last update time for each
# - Reports progress percentages
# - Flags any stuck issues
# - Suggests which ones to check on
```

### Pattern 3: Weekly Planning Session

```bash
cd /home/samuel/supervisor/consilio

"Show me project status and let's plan this week's work"

# Supervisor automatically:
# - Reads workflow-status.yaml
# - Checks Archon MCP tasks
# - Lists completed vs pending epics
# - Suggests next priorities
# - Asks what you want to focus on
# - Creates epics for chosen features
# - Creates GitHub issues
# - Tracks everything in Archon MCP
```

### Pattern 4: Cross-Project Status

```bash
# Check all projects from supervisor root
cd /home/samuel/supervisor

"Give me status on all projects: Consilio, OpenHorizon, Health-Agent"

# Supervisor automatically:
# - Reads each project's workflow-status.yaml
# - Checks GitHub issues for each
# - Summarizes progress
# - Flags any blockers
# - Suggests what needs attention
```

---

## 🎯 First Session Examples

### Example 1: Existing Project (Consilio)

**Terminal:**
```bash
cd /home/samuel/supervisor/consilio
# Start Claude Code
```

**You say:**
```
"Hi! I want to work on Consilio. Please research the codebase and tell me what's been done and what needs doing."
```

**Supervisor responds:**
```
Researching Consilio...

[2 minutes later]

📊 Consilio Analysis Complete

Project: Social care case management system
Status: 65% implemented
Last update: 5 days ago (issue #58 - email viewer)

Completed Features (✅ Production ready):
- User authentication with JWT
- Organization management with RLS
- Email routing (Gmail + custom domains)
- Document editor with TipTap
- Basic case management UI

In Progress (🟡 SCAR working):
- Issue #58: Email viewer (40% done, 3 days since update)

Planned but Not Started (⬜ Epic created):
- Issue #61: Document version control (waiting for #58)

Missing from Original Vision:
- Advanced search across cases
- Email notification system
- Reporting and analytics
- Case assignment workflow

Recommendations:
1. Check on issue #58 (might be stuck)
2. Plan document version control next
3. Consider email notifications (enhances UX)

What would you like to do?
```

**You:**
```
"Check on issue #58, then let's plan document version control."
```

**Supervisor:**
```
Checking issue #58...

Last SCAR update: 3 days ago
Status: "Implementing email list component"
Files created: 4 React components, 2 API endpoints
Progress: ~40%

⚠️ No activity for 3 days - possibly stuck

Actions taken:
1. Posted comment: "@scar Status check - are you blocked? Please update."
2. Will wait 1 hour for response

Meanwhile, planning document version control...

Searching Archon RAG for version control patterns...
Found: Git-style versioning, document diffing, rollback strategies

Creating epic...
✅ Epic: .bmad/epics/002-document-version-control.md
✅ ADR: .bmad/adr/004-git-style-doc-versioning.md

Ready to create GitHub issue when SCAR finishes #58.
Should I wait, or start #62 in parallel?
```

### Example 2: New Project (Health Agent)

**Terminal:**
```bash
cd /home/samuel/supervisor
./init-project.sh health-agent https://github.com/gpt153/health-agent-planning.git

cd health-agent
# Start Claude Code
```

**You say:**
```
"I'm starting a new project - a Telegram bot for personal health tracking. Help me plan it."
```

**Supervisor responds:**
```
Exciting! Let's plan Health Agent.

Quick questions to get started:

1. **Core Features**: What health metrics to track?
   - Weight? ✅/❌
   - Sleep? ✅/❌
   - Exercise? ✅/❌
   - Mood? ✅/❌
   - Custom metrics? ✅/❌

2. **Tech Stack Preference**:
   - Python (common for Telegram bots)
   - Node.js (you're familiar with)
   - Your choice?

3. **Data Storage**:
   - SQLite (simple, local)
   - PostgreSQL (production-ready)
   - Your preference?

4. **MVP Timeline**:
   - 1 week?
   - 2 weeks?
   - 1 month?

Once you answer, I'll:
1. Search Archon RAG for similar projects
2. Fill out project-brief.md
3. Create initial PRD
4. Plan MVP epics
5. Set up Archon MCP tracking

What are your answers?
```

**You:**
```
"Track weight and sleep only for MVP. Python with SQLite. 2 week timeline."
```

**Supervisor:**
```
Perfect! Let me set everything up...

Searching Archon RAG...
- Found: "PydanticAI Telegram bot patterns"
- Found: "python-telegram-bot examples"
- Found: "SQLite health tracking schema"

✅ Filled project-brief.md:
   Vision: Simple health tracking via Telegram
   MVP: Weight + sleep tracking with weekly charts
   Tech: Python + python-telegram-bot + SQLite
   Timeline: 2 weeks

✅ Created PRD: .bmad/prd/health-agent-mvp.md (6.8KB)
   - Problem statement
   - User personas
   - MVP features (MoSCoW)
   - Success metrics

✅ Created 3 MVP epics:
   1. Bot foundation (4h)
   2. Weight tracking (8h)
   3. Sleep logging (8h)

✅ Created ADRs:
   - SQLite vs PostgreSQL (chose SQLite for MVP)
   - python-telegram-bot vs other libraries

Next steps:
1. Create implementation repo: github.com/gpt153/health-agent
2. Clone to: /home/samuel/.archon/workspaces/health-agent/
3. Create implementation CLAUDE.md (Python coding standards)
4. Then I'll create GitHub issues and start SCAR

Ready to proceed?
```

---

## 📚 Key Takeaways

### For Existing Projects
1. **Open in planning workspace**: `cd /home/samuel/supervisor/[project]`
2. **Say**: "Research the codebase and help me plan"
3. **Supervisor automatically**: Researches, summarizes, suggests next steps
4. **You decide**: Which features to work on
5. **Supervisor executes**: Creates epics, instructs SCAR, monitors

### For New Projects
1. **Run init script**: `./init-project.sh [name] [git-url]`
2. **Create implementation workspace**: Clone/init in `/home/samuel/.archon/workspaces/[project]/`
3. **Open planning workspace**: `cd /home/samuel/supervisor/[project]`
4. **Say**: "New project: [description]. Help me plan."
5. **Answer supervisor's questions**: Tech stack, features, timeline
6. **Supervisor creates**: PRD, epics, ADRs, Archon MCP tracking
7. **Supervisor instructs SCAR**: Creates GitHub issues, monitors progress

### Universal Pattern
**You speak naturally → Supervisor handles technical details → You stay informed**

---

**You're now ready to work on existing projects and start new ones!** 🚀

---

## 📋 Quick Reference: Complete New Project Commands

**Copy-paste these commands for a new Python project:**

```bash
# 1. Create planning workspace
cd /home/samuel/supervisor
./init-project.sh my-project https://github.com/gpt153/my-project-planning.git

# 2. Create GitHub repos
gh repo create gpt153/my-project-planning --public --description "Planning workspace"
gh repo create gpt153/my-project --public --description "Implementation"

# 3. Push planning workspace
cd /home/samuel/supervisor/my-project
git remote add origin https://github.com/gpt153/my-project-planning.git
git push -u origin main

# 4. Create implementation workspace
mkdir -p /home/samuel/.archon/workspaces/my-project
cd /home/samuel/.archon/workspaces/my-project
git init && git checkout -b main

# 5. Create basic structure
mkdir -p src tests docs
touch README.md .gitignore .env.example requirements.txt

# 6. Create implementation CLAUDE.md (tech stack, coding standards)
vim CLAUDE.md
# Add: tech stack, coding rules, project structure, etc.

# 7. Commit and push
git add . && git commit -m "feat: Initialize project"
git remote add origin https://github.com/gpt153/my-project.git
git push -u origin main

# 8. Start planning
cd /home/samuel/supervisor/my-project
# Start Claude Code
# Say: "New project: [description]. Help me plan MVP."
```

**For Node.js project, replace step 5 with:**
```bash
mkdir -p src tests docs
npm init -y
touch README.md .gitignore .env.example
```

---

## 🎯 Most Common Commands

**Working on existing project:**
```bash
cd /home/samuel/supervisor/consilio
# Claude: "Research codebase and plan next features"
```

**Check all projects:**
```bash
cd /home/samuel/supervisor
# Claude: "Show status of all projects: consilio, openhorizon"
```

**Verify SCAR's work:**
```bash
cd /home/samuel/supervisor/consilio
# Claude: "Verify issue 123"
```

**Start new feature:**
```bash
cd /home/samuel/supervisor/consilio
# Claude: "Plan feature: email notifications"
```

---

**You're now ready to work on existing projects and start new ones!** 🚀
