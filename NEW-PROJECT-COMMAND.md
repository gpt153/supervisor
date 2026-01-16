# /new-project Command - Complete Automation

**The easiest way to start a new project from scratch**

---

## 🎯 What It Does

**You say ONE command. Supervisor does EVERYTHING.**

```bash
cd /home/samuel/supervisor
# Start Claude Code

"/new-project hitster-game"
```

**Supervisor automatically:**
1. Asks you questions (tech stack, features, timeline)
2. Creates GitHub repos (planning + implementation)
3. Sets up planning workspace
4. Sets up implementation workspace with proper structure
5. Creates implementation CLAUDE.md with coding standards
6. Initializes Git repos and pushes to GitHub
7. Creates initial planning artifacts (PRD, epics, ADRs)
8. Creates Archon MCP project for tracking
9. Ready to instruct SCAR in ~2 minutes!

**You just answer questions. No manual commands needed.**

---

## 📝 Example Session

### You Start

```bash
cd /home/samuel/supervisor
# Start Claude Code

User: "/new-project hitster-game"
```

### Supervisor Responds

```
Creating new project: hitster-game...

Spawning project setup specialist...

Tell me about hitster-game. What does it do? Who is it for?
```

### You Answer

```
User: "A music guessing game. Players guess song years. For party entertainment."
```

### Supervisor Asks

```
What tech stack? I can set up:
1. Node.js (TypeScript + Express/Fastify)
2. Python (FastAPI or Flask)
3. Next.js (React + TypeScript)
4. Python CLI (Rich or Typer)
5. Other (tell me what)

Which one?
```

### You Answer

```
User: "Next.js"
```

### Supervisor Asks

```
Does it need a database?
1. PostgreSQL (production-ready)
2. SQLite (simple, local)
3. No database (API only, stateless)
4. Other (MongoDB, Redis, etc.)

Which one?
```

### You Answer

```
User: "PostgreSQL"
```

### Supervisor Asks

```
What are the 3-5 core features for MVP? (Just bullet points)
```

### You Answer

```
User: "
- Song library with years
- Guess interface
- Score tracking
- Multiplayer support
- Leaderboards
"
```

### Supervisor Asks

```
When do you want MVP ready?
- 1 week?
- 2 weeks?
- 1 month?
```

### You Answer

```
User: "2 weeks"
```

### Supervisor Asks

```
Should the repos be:
1. Public (open source)
2. Private (personal/commercial)

Which one?
```

### You Answer

```
User: "Public"
```

### Supervisor Works (Automatically)

```
Perfect! Setting up hitster-game with Next.js + PostgreSQL...

✅ Planning workspace created
   /home/samuel/supervisor/hitster-game/

✅ GitHub repos created
   https://github.com/gpt153/hitster-game-planning (public)
   https://github.com/gpt153/hitster-game (public)

✅ Planning workspace pushed to GitHub

✅ Implementation workspace created
   /home/samuel/.archon/workspaces/hitster-game/
   - Next.js structure initialized
   - PostgreSQL configured
   - TypeScript + Tailwind CSS
   - Testing setup (Jest + React Testing Library)

✅ Implementation CLAUDE.md created
   - Coding standards for Next.js
   - TypeScript strict mode
   - PostgreSQL best practices
   - Security guidelines

✅ Implementation workspace pushed to GitHub

✅ Project brief filled
   Vision: Party music guessing game
   Tech: Next.js + TypeScript + PostgreSQL
   MVP: 5 core features in 2 weeks

✅ PRD created
   /home/samuel/supervisor/hitster-game/.bmad/prd/hitster-game-mvp.md

✅ 5 MVP epics created:
   001-project-foundation.md (4h)
   002-song-library.md (8h)
   003-guess-interface.md (6h)
   004-multiplayer-support.md (12h)
   005-leaderboards.md (6h)

✅ ADRs created:
   001-nextjs-vs-react.md (chose Next.js for SSR)
   002-postgresql-schema.md (database design)
   003-realtime-architecture.md (WebSockets for multiplayer)

✅ Archon MCP project created
   - "Hitster Game MVP"
   - 5 tasks tracked

✅ Planning artifacts committed and pushed

🎉 Project hitster-game ready!

Total setup time: 2 minutes

Ready to start! Which epic should I send to SCAR first?

Recommended order:
1. Epic 001: Project foundation (Next.js setup, database schema)
2. Epic 002: Song library (data model, seeding)
3. Epic 003: Guess interface (core game mechanics)
4. Epic 004: Multiplayer support (WebSockets, rooms)
5. Epic 005: Leaderboards (scoring, rankings)

Say "Start epic 001" to begin.
```

### You Continue

```
User: "Start epic 001"
```

### Supervisor Instructs SCAR

```
Creating GitHub issue for Epic 001...

Issue created: gpt153/hitster-game#1
Title: "Project Foundation - Next.js + PostgreSQL setup"

Epic URL: https://github.com/gpt153/hitster-game-planning/blob/main/.bmad/epics/001-project-foundation.md

@scar - Implement project foundation following epic specifications.

Acceptance Criteria:
- [ ] Next.js app initialized with App Router
- [ ] PostgreSQL database configured
- [ ] Prisma ORM setup with migrations
- [ ] Authentication placeholder
- [ ] Basic UI layout
- [ ] Tests passing

Waiting for SCAR acknowledgment...
[20 seconds]

✅ SCAR acknowledged: "Starting project foundation implementation"

Monitoring progress...
I'll check every 2 hours and report back.

Archon MCP task updated: "Epic 001" → status: doing
```

---

## ⏱️ Timeline

**Total time from nothing to SCAR working:**
- Questions: ~2 minutes
- Automated setup: ~2 minutes
- Planning: ~2 minutes
- **Total: ~6 minutes**

**Compare to manual:**
- Manual setup: ~30 minutes
- Manual planning: ~15 minutes
- **Manual total: ~45 minutes**

**Saved: ~40 minutes per project**

---

## 🎯 What Gets Created

### Planning Workspace
```
/home/samuel/supervisor/hitster-game/
├── CLAUDE.md (supervisor role)
├── .bmad/
│   ├── project-brief.md (filled with your answers)
│   ├── workflow-status.yaml (tracking setup)
│   ├── prd/
│   │   └── hitster-game-mvp.md (complete PRD)
│   ├── epics/
│   │   ├── 001-project-foundation.md
│   │   ├── 002-song-library.md
│   │   ├── 003-guess-interface.md
│   │   ├── 004-multiplayer-support.md
│   │   └── 005-leaderboards.md
│   └── adr/
│       ├── 001-nextjs-vs-react.md
│       ├── 002-postgresql-schema.md
│       └── 003-realtime-architecture.md
└── .git/ (pushed to GitHub)
```

### Implementation Workspace
```
/home/samuel/.archon/workspaces/hitster-game/
├── CLAUDE.md (implementation guide)
├── app/ (Next.js App Router)
├── components/
├── lib/
├── prisma/
├── tests/
├── package.json (all deps installed)
├── tsconfig.json (strict TypeScript)
├── .env.example (with required vars)
├── README.md (setup instructions)
└── .git/ (pushed to GitHub)
```

### GitHub Repos
- **hitster-game-planning** - Planning artifacts (public)
- **hitster-game** - Implementation code (public)

### Archon MCP
- **Project:** "Hitster Game MVP"
- **Tasks:** 5 (one per epic)
- **Status:** Tracked automatically

---

## 🔧 Tech Stack Support

**Supervisor can set up:**

### Node.js + TypeScript
- Express or Fastify
- PostgreSQL or SQLite
- Jest + Vitest
- ESLint + Prettier

### Python
- FastAPI or Flask
- PostgreSQL or SQLite
- Pytest
- Black + Pylint

### Next.js
- App Router or Pages Router
- PostgreSQL or SQLite
- Jest + React Testing Library
- Tailwind CSS

### Python CLI
- Rich or Typer
- SQLite
- Pytest

**Custom stacks:** Tell supervisor and it adapts!

---

## 💡 Tips

**Tech stack choice:**
- **Next.js:** Full-stack web apps with React
- **Node.js:** APIs, microservices, real-time apps
- **Python:** ML/AI, data processing, scientific computing
- **Python CLI:** Command-line tools, scripts

**Database choice:**
- **PostgreSQL:** Production apps, complex queries, >100 users
- **SQLite:** Personal projects, prototypes, <100 users
- **No database:** Stateless APIs, proxies, converters

**Timeline:**
- **1 week:** Simple CRUD, 3-4 features
- **2 weeks:** Standard app, 5-7 features
- **1 month:** Complex app, 10+ features

**MVP features:**
- Keep it small (3-5 core features)
- Focus on unique value proposition
- Skip polish for MVP
- Save "nice to have" for v2

---

## 🚀 Quick Start

**Just run:**
```bash
cd /home/samuel/supervisor
# Start Claude Code

"/new-project [your-project-name]"

# Answer questions
# Wait 6 minutes
# Start building!
```

---

## 📚 What Happens Behind the Scenes

**Supervisor spawns a subagent that:**

1. Runs `init-project.sh`
2. Creates GitHub repos with `gh repo create`
3. Creates implementation workspace structure
4. Writes implementation CLAUDE.md with tech-specific standards
5. Initializes Git and pushes
6. Fills project-brief.md with your answers
7. Searches Archon RAG for similar projects
8. Creates PRD based on best practices
9. Creates 3-5 MVP epics
10. Creates ADRs for key decisions
11. Creates Archon MCP project
12. Commits and pushes everything
13. Returns summary to you
14. Ready to instruct SCAR

**You see:**
- Questions (your input needed)
- Progress updates (✅ checkmarks)
- Final summary (repos, features, epics)

**You don't see:**
- Bash commands being run
- File contents being written
- Git operations happening
- GitHub API calls

**It just works!**

---

**The /new-project command makes starting new projects effortless. One command, a few questions, and you're ready to build.** 🚀
