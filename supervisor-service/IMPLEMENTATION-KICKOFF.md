# Supervisor Service - Implementation Kickoff

**Date:** 2026-01-17
**Status:** Ready for SCAR Implementation
**Estimated Duration:** 2-3 weeks

---

## 🎯 Project Overview

**What:** Persistent Claude Code supervisor service that manages multiple project supervisors using Claude Agent SDK

**Why:** Enable multi-platform (web/mobile/desktop) access to supervisors with 24/7 persistent monitoring and automated verification

**How:** Node.js service with Claude Agent SDK (same technology SCAR uses)

---

## ✅ Planning Complete

### Created Artifacts

**Planning Workspace:**
- `/home/samuel/supervisor/supervisor-service/`
  - Epic 001: Comprehensive 4-phase implementation plan
  - Project brief: Complete project overview
  - Workflow status: Progress tracking configured

**GitHub Repositories:**
- Planning: https://github.com/gpt153/supervisor (supervisor-service/ folder)
- Implementation: https://github.com/gpt153/supervisor-service

**Implementation Workspace:**
- `/home/samuel/.archon/workspaces/supervisor-service/` (ready for SCAR)

### GitHub Issues Created

**20 issues across 4 phases:**

**Phase 1: Core Service (Issues #1-6)**
1. Project setup and dependencies
2. Database schema and migrations
3. ProjectManager core implementation
4. MCP server configuration for projects
5. Orchestrator and project registry
6. Basic HTTP server and health check

**Phase 2: GitHub Webhooks (Issues #7-10)**
7. Webhook endpoint and signature validation
8. Event processing and project identification
9. Auto-trigger verification on SCAR completion
10. Post verification results to GitHub

**Phase 3: MCP Server (Issues #11-17)**
11. MCP server foundation
12. Planning file operations tools
13. Git operations tools
14. GitHub API tools
15. SCAR monitoring tools
16. Verification tools
17. Knowledge base tools

**Phase 4: Optional Adapters (Issues #18-20)**
18. Telegram bot adapter (optional)
19. Simple web dashboard (optional)
20. REST API for custom clients (optional)

**All issues:** https://github.com/gpt153/supervisor-service/issues

---

## 📋 Implementation Plan

### Phase 1: Core Service (Week 1)
**Goal:** Basic supervisor service that can manage Claude Code sessions

**Deliverables:**
- ProjectManager class using Claude Agent SDK
- PostgreSQL session storage
- Session persistence across restarts
- HTTP server with health checks

**Test:** Can send commands to Consilio supervisor and resume session

---

### Phase 2: GitHub Webhooks (Week 1-2)
**Goal:** Automated verification triggered by SCAR

**Deliverables:**
- Webhook endpoint with security
- Auto-detect SCAR "complete" comments
- Trigger verification automatically
- Post results to GitHub

**Test:** SCAR completes → auto-verify → results posted (while you're offline)

---

### Phase 3: MCP Server (Week 2-3)
**Goal:** Claude.ai Projects integration

**Deliverables:**
- MCP server exposing supervisor tools
- Planning file operations
- GitHub API integration
- SCAR monitoring
- Verification tools

**Test:** Control supervisor from Claude.ai Project on mobile

---

### Phase 4: Optional Adapters (Week 3)
**Goal:** Additional interfaces

**Deliverables:**
- Telegram bot (optional)
- Web dashboard (optional)
- REST API (optional)

**Test:** Multiple ways to interact with supervisors

---

## 🏗️ Technical Architecture

### Technology Stack

**Runtime:**
- Node.js 20+
- TypeScript (strict mode)

**Core Dependencies:**
- `@anthropic-ai/claude-agent-sdk` - Claude Code control
- `pg` - PostgreSQL client
- `express` - HTTP server
- `@modelcontextprotocol/sdk` - MCP server

**Database:**
- PostgreSQL 14+ (persistent session storage)

**Deployment:**
- Systemd service on VM
- 24/7 operation
- Auto-restart on failure

### Database Schema

**supervisor_sessions:**
```sql
CREATE TABLE supervisor_sessions (
  id UUID PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  claude_session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

**webhook_events:**
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  project_name VARCHAR(255),
  issue_number INTEGER,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**verification_results:**
```sql
CREATE TABLE verification_results (
  id UUID PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  issue_number INTEGER NOT NULL,
  result VARCHAR(50) NOT NULL,
  details JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### File Structure

```
supervisor-service/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── managers/
│   │   └── ProjectManager.ts    # Claude SDK wrapper
│   ├── storage/
│   │   └── SessionStore.ts      # Database operations
│   ├── webhooks/
│   │   ├── handler.ts           # Webhook processing
│   │   └── validator.ts         # Signature validation
│   ├── mcp/
│   │   ├── server.ts            # MCP server
│   │   ├── tools/
│   │   │   ├── planning.ts      # Planning file ops
│   │   │   ├── git.ts           # Git operations
│   │   │   ├── github.ts        # GitHub API
│   │   │   ├── scar.ts          # SCAR monitoring
│   │   │   ├── verification.ts  # Build/test verification
│   │   │   └── knowledge.ts     # Learning system
│   ├── adapters/
│   │   ├── telegram.ts          # Telegram bot
│   │   └── web.ts               # Web dashboard
│   └── types/
│       └── index.ts             # Type definitions
├── migrations/
│   ├── 001_create_sessions.sql
│   ├── 002_create_webhooks.sql
│   └── 003_create_verifications.sql
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔧 Configuration

### Environment Variables (.env.example)

```env
# Claude credentials
CLAUDE_API_KEY=sk-ant-...
# Or OAuth token
CLAUDE_CODE_OAUTH_TOKEN=...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/supervisor

# GitHub (for webhooks and MCP)
GITHUB_TOKEN=ghp_...
WEBHOOK_SECRET=your_webhook_secret_here

# Optional: Archon MCP
ARCHON_MCP_URL=http://localhost:8051/mcp
ARCHON_TOKEN=...

# Server
PORT=8080
```

### Systemd Service

```ini
# /etc/systemd/system/supervisor-service.service
[Unit]
Description=Supervisor Service
After=network.target postgresql.service

[Service]
Type=simple
User=samuel
WorkingDirectory=/home/samuel/.archon/workspaces/supervisor-service
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
EnvironmentFile=/home/samuel/.archon/workspaces/supervisor-service/.env

[Install]
WantedBy=multi-user.target
```

---

## 📊 Success Metrics

**After Phase 1:**
- ✅ Can send commands to project supervisors programmatically
- ✅ Sessions persist across service restarts
- ✅ Multiple projects running independently

**After Phase 2:**
- ✅ Auto-verification when SCAR completes (no manual checking)
- ✅ Verification results posted to GitHub automatically
- ✅ Works while you're offline

**After Phase 3:**
- ✅ Can control supervisors from Claude.ai Projects
- ✅ Works on mobile/web/desktop seamlessly
- ✅ No more SSH terminal required for daily work

**After Phase 4:**
- ✅ Multiple interface options (Telegram, web, API)
- ✅ Visual dashboard for project overview
- ✅ Mobile-first workflow with notifications

---

## 🚀 Next Steps

### SCAR Implementation

**Automatic:**
- SCAR will pick up issues #1-6 (Phase 1) first
- Issues have all dependencies and acceptance criteria
- Reference epic for complete context

**Monitoring:**
You can monitor progress at:
- GitHub Issues: https://github.com/gpt153/supervisor-service/issues
- Workflow Status: /home/samuel/supervisor/supervisor-service/.bmad/workflow-status.yaml

### Your Role

**During Implementation:**
- SCAR will work autonomously on issues
- Supervisor will verify SCAR's work (using current system)
- You'll be notified when phases complete

**After Implementation:**
- Test the service manually
- Configure environment variables
- Deploy as systemd service
- Set up GitHub webhooks
- Create first Claude.ai Project integration

---

## 📚 Reference Documentation

**Planning:**
- Epic 001: `/home/samuel/supervisor/supervisor-service/.bmad/epics/001-supervisor-service-implementation.md`
- Project Brief: `/home/samuel/supervisor/supervisor-service/.bmad/project-brief.md`
- Workflow Status: `/home/samuel/supervisor/supervisor-service/.bmad/workflow-status.yaml`

**Architecture:**
- SCAR Architecture Analysis: `/home/samuel/supervisor/docs/SCAR-ARCHITECTURE-AND-SUPERVISOR-INTEGRATION.md`
- First Principles Analysis: `/home/samuel/supervisor/docs/FIRST-PRINCIPLES-ANALYSIS-2026-01-17.md`

**GitHub:**
- Planning Repo: https://github.com/gpt153/supervisor (supervisor-service folder)
- Implementation Repo: https://github.com/gpt153/supervisor-service
- Issues: https://github.com/gpt153/supervisor-service/issues

---

## 💡 What This Enables

**Multi-Platform Supervision:**
- Open Claude.ai on phone → plan Consilio feature
- Close phone, SCAR implements
- Supervisor auto-verifies (while you're in meeting)
- Open laptop later → see results

**Parallel Project Work:**
- Browser Tab 1: Claude.ai Project "Consilio"
- Browser Tab 2: Claude.ai Project "OpenHorizon"
- Browser Tab 3: Claude.ai Project "Health Agent"
- No context switching, all independent

**Persistent Intelligence:**
- Not just dumb scripts - full Claude decision-making
- Follows CLAUDE.md instructions
- Uses learnings (#006, #007)
- Adapts to situations

**24/7 Operation:**
- Service runs continuously
- Monitors GitHub for SCAR updates
- Verifies implementations automatically
- Results waiting when you check back

---

**Status:** 🟢 Ready for SCAR implementation

**Timeline:** 2-3 weeks estimated

**Next Milestone:** Phase 1 complete (basic service operational)
