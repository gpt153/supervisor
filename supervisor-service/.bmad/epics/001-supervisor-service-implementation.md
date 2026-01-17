# Epic: Supervisor Service Implementation

**Epic ID:** 001
**Created:** 2026-01-17
**Status:** Draft
**Complexity Level:** 4

## Project Context

- **Project:** supervisor-service
- **Repository:** [To be created - gpt153/supervisor-service]
- **Tech Stack:** Node.js, TypeScript, PostgreSQL, @anthropic-ai/claude-agent-sdk, Express.js
- **Related Epics:** None (foundational epic)
- **Workspace:** `/home/samuel/supervisor/supervisor-service/`
- **Implementation:** Node.js service running as systemd daemon

## Business Context

### Problem Statement

Currently, supervising multiple projects requires manual SSH access to a VM and terminal-based interaction with Claude Code. This approach:
- Only works from devices with SSH access
- Requires terminal expertise
- Cannot be used on mobile devices
- Lacks visual feedback and dashboards
- Makes parallel work on multiple projects difficult
- Doesn't enable automated verification when SCAR completes tasks

Users need a persistent, multi-platform supervisor system that:
- Runs 24/7 and maintains context across restarts
- Can be accessed from web browsers, mobile apps, and desktop applications
- Automatically monitors SCAR's work and verifies completion
- Manages independent supervisor instances for each project
- Provides programmatic access via APIs and MCP servers

### User Value

This service enables:
- **Cross-platform access:** Work on projects from phone, tablet, laptop, or desktop
- **Persistent supervision:** Supervisors run continuously, monitoring and verifying SCAR's work
- **Parallel project management:** Switch between projects without losing context
- **Automated verification:** Immediate feedback when SCAR claims tasks complete
- **Beautiful interfaces:** Integration with Claude.ai Projects for polished UI
- **Mobile-first workflow:** Voice commands and mobile-optimized interactions

### Success Metrics

- All projects accessible via Claude.ai Projects (web, mobile, desktop)
- Sub-minute response time for status checks
- 90%+ of daily interactions occur via Claude.ai (not terminal)
- Zero context mixing between different project supervisors
- Automated verification triggers within 30 seconds of SCAR completion
- Support for 5+ simultaneous project supervisors

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE (Phase 1 - Core Service):**
- [ ] ProjectManager class using @anthropic-ai/claude-agent-sdk
- [ ] Session persistence in PostgreSQL database
- [ ] Resume existing Claude Code sessions after service restart
- [ ] Send commands to project supervisors programmatically
- [ ] Stream responses from Claude Code instances
- [ ] Configure MCP servers for each project instance
- [ ] Working directory isolation per project
- [ ] Environment variable management (API keys, tokens)
- [ ] Basic logging and error handling

**MUST HAVE (Phase 2 - GitHub Webhooks):**
- [ ] GitHub webhook endpoint receiver
- [ ] Event parsing and project identification
- [ ] Auto-trigger verification when SCAR posts "complete"
- [ ] Post verification results back to GitHub issues
- [ ] Webhook signature validation
- [ ] Event queue for async processing

**MUST HAVE (Phase 3 - MCP Server):**
- [ ] MCP server implementation for Claude.ai Projects
- [ ] Planning file operations (read/write/list)
- [ ] Git operations (status, commit, push)
- [ ] GitHub API integration (issues, comments, status)
- [ ] SCAR monitoring tools (progress, worktree status)
- [ ] Verification tools (build, test, mock detection)
- [ ] Shared knowledge access (learnings, templates)

**SHOULD HAVE:**
- [ ] Health check endpoint for monitoring
- [ ] Metrics collection (request counts, response times)
- [ ] Graceful shutdown handling
- [ ] Rate limiting for API endpoints
- [ ] Request/response logging
- [ ] Error notification system (email/Slack)

**COULD HAVE (Phase 4 - Optional Adapters):**
- [ ] Telegram bot adapter (reuse SCAR's pattern)
- [ ] Simple web dashboard UI
- [ ] Mobile push notifications
- [ ] Slack integration
- [ ] REST API for custom clients

**WON'T HAVE (this iteration):**
- Custom React dashboard (deferred to Phase 4+)
- Advanced analytics and reporting
- Multi-user authentication (single-user system)
- Cloud deployment (runs on existing VM)

### Non-Functional Requirements

**Performance:**
- Response time: < 1 second for status checks
- Claude Code session resume: < 5 seconds
- Webhook processing: < 30 seconds from event to verification start
- Support 10+ concurrent Claude Code sessions

**Security:**
- Environment-based secrets management (no hardcoded credentials)
- GitHub webhook signature validation
- MCP server access restricted to localhost or authorized clients
- Secure storage of Claude API keys and GitHub tokens

**Reliability:**
- Session state survives service restarts
- Automatic recovery from Claude Code crashes
- Database connection pooling and retry logic
- Graceful degradation when GitHub API is down

**Scalability:**
- Stateless design (except session storage)
- Horizontal scaling possible with shared PostgreSQL
- Database indexes on session queries
- Connection pooling for Claude Code instances

## Architecture

### Technical Approach

**Pattern:** Service-oriented architecture with persistent Claude Code managers

**Core Components:**
1. **ProjectManager:** Manages one project's Claude Code instance
2. **SessionStore:** PostgreSQL-backed session persistence
3. **WebhookHandler:** Processes GitHub events
4. **MCPServer:** Exposes tools to Claude.ai Projects
5. **Orchestrator:** Coordinates managers and handles routing

**Technology Choices:**
- **@anthropic-ai/claude-agent-sdk:** Programmatic Claude Code control (proven by SCAR)
- **PostgreSQL:** Session and state persistence
- **Express.js:** HTTP server for webhooks and APIs
- **TypeScript:** Type safety and developer experience

### Integration Points

**Database:**
- `supervisor_sessions` table: Stores Claude session IDs and metadata
- `webhook_events` table: Event queue for async processing
- `verification_results` table: Historical verification outcomes

**External APIs:**
- Claude API: Via @anthropic-ai/claude-agent-sdk
- GitHub API: Via Octokit (issue management, webhook validation)
- MCP Protocol: Via @modelcontextprotocol/sdk

**Internal Services:**
- Planning workspaces: `/home/samuel/supervisor/[project]/`
- Implementation workspaces: `/home/samuel/.archon/workspaces/[project]/`
- Shared documentation: `/home/samuel/supervisor/docs/`

### Data Flow

```
┌─────────────────────────────────────────────┐
│  Access Layer                               │
│  • Claude.ai Projects (MCP)                 │
│  • GitHub Webhooks                          │
│  • Optional: Telegram, Web UI              │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  Supervisor Service (Node.js)               │
│  ┌─────────────────────────────────────┐   │
│  │  Orchestrator                       │   │
│  │  • Routes requests to ProjectManager│   │
│  │  • Manages session lifecycle        │   │
│  └─────────────────────────────────────┘   │
│                   ↓                         │
│  ┌─────────────────────────────────────┐   │
│  │  ProjectManager (per project)       │   │
│  │  • cwd: /supervisor/[project]/      │   │
│  │  • Claude session: abc123           │   │
│  │  • MCP servers: GitHub, Archon      │   │
│  └─────────────────────────────────────┘   │
│                   ↓                         │
│  ┌─────────────────────────────────────┐   │
│  │  SessionStore (PostgreSQL)          │   │
│  │  • session_id, project, metadata    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  Claude Code Instances (via SDK)            │
│  • Spawned/resumed per project              │
│  • Independent contexts                     │
│  • Full CLAUDE.md instructions              │
└─────────────────────────────────────────────┘
```

### Key Technical Decisions

- **Decision 1:** Use @anthropic-ai/claude-agent-sdk (same as SCAR) - Proven in production, handles session management, MCP configuration
- **Decision 2:** PostgreSQL for session storage - Mature, reliable, supports JSONB for flexible metadata
- **Decision 3:** Systemd service deployment - Simple, reliable, auto-restart on failure
- **Decision 4:** MCP server for Claude.ai Projects - Standard protocol, native integration
- **Decision 5:** One ProjectManager per project - Clean isolation, no context mixing

### Database Schema

```sql
-- Session storage
CREATE TABLE supervisor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name VARCHAR(255) NOT NULL UNIQUE,
  claude_session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  INDEX idx_project_name (project_name),
  INDEX idx_last_active (last_active)
);

-- Webhook event queue
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  project_name VARCHAR(255),
  issue_number INTEGER,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_processed (processed, created_at),
  INDEX idx_project_issue (project_name, issue_number)
);

-- Verification results history
CREATE TABLE verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name VARCHAR(255) NOT NULL,
  issue_number INTEGER NOT NULL,
  status VARCHAR(50), -- 'passed', 'failed', 'partial'
  build_success BOOLEAN,
  tests_passed BOOLEAN,
  mocks_detected BOOLEAN,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_project_issue (project_name, issue_number),
  INDEX idx_status (status, created_at)
);
```

### File Structure

```
supervisor-service/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── src/
│   ├── index.ts                    # Entry point, starts service
│   ├── config.ts                   # Environment config
│   ├── managers/
│   │   └── project-manager.ts      # ProjectManager class
│   ├── storage/
│   │   └── session-store.ts        # PostgreSQL session storage
│   ├── webhooks/
│   │   ├── handler.ts              # GitHub webhook processing
│   │   └── validator.ts            # Signature validation
│   ├── mcp/
│   │   ├── server.ts               # MCP server implementation
│   │   └── tools/
│   │       ├── planning.ts         # File operations
│   │       ├── github.ts           # GitHub operations
│   │       ├── verification.ts     # Build/test tools
│   │       └── knowledge.ts        # Learnings/docs access
│   ├── adapters/                   # Phase 4 (optional)
│   │   ├── telegram.ts
│   │   └── web-api.ts
│   └── utils/
│       ├── logger.ts               # Logging utility
│       └── errors.ts               # Error handling
├── db/
│   ├── migrations/
│   │   ├── 001_sessions.sql
│   │   ├── 002_webhook_events.sql
│   │   └── 003_verification_results.sql
│   └── seed.sql                    # Initial project setup
├── tests/
│   ├── unit/
│   │   ├── project-manager.test.ts
│   │   └── session-store.test.ts
│   └── integration/
│       ├── webhook-flow.test.ts
│       └── mcp-tools.test.ts
└── scripts/
    ├── setup-db.sh                 # Database initialization
    └── deploy-systemd.sh           # Systemd service setup
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Phase 1: Core Service (Issues #1-6)**

**Issue #1: Project setup and dependencies**
- Initialize TypeScript project
- Install dependencies: @anthropic-ai/claude-agent-sdk, pg, express, dotenv
- Configure tsconfig.json
- Create .env.example
- Acceptance: `npm install` succeeds, TypeScript compiles

**Issue #2: Database schema and migrations**
- Create PostgreSQL database
- Write migration for supervisor_sessions table
- Create SessionStore class with basic CRUD
- Acceptance: Migrations run successfully, can create/read sessions

**Issue #3: ProjectManager core implementation**
- Implement ProjectManager class
- sendCommand() method using claude-agent-sdk
- Session creation and resume logic
- Working directory configuration
- Acceptance: Can send command to one project, session persists across restarts

**Issue #4: MCP server configuration for projects**
- Configure GitHub MCP server in ProjectManager
- Configure Archon MCP server (optional)
- Permission mode: bypassPermissions
- Acceptance: Claude Code instances have GitHub API access

**Issue #5: Orchestrator and project registry**
- Create Orchestrator class
- Initialize ProjectManager instances for all projects
- Route commands to correct manager
- Acceptance: Multiple projects can be managed independently

**Issue #6: Basic HTTP server and health check**
- Express.js server setup
- Health check endpoint (/health)
- Basic error handling
- Logging setup
- Acceptance: Service starts, health check returns 200

---

**Phase 2: GitHub Webhooks (Issues #7-10)**

**Issue #7: Webhook endpoint and signature validation**
- POST /webhooks/github endpoint
- GitHub webhook signature validation
- Event parsing
- Acceptance: Webhook receives events, validates signatures

**Issue #8: Event processing and project identification**
- Parse GitHub event payload
- Identify project from repository name
- Extract issue number and event type
- Queue events in database
- Acceptance: Events stored in webhook_events table

**Issue #9: Auto-trigger verification on SCAR completion**
- Detect "Implementation complete" comments
- Trigger supervisor verification via ProjectManager
- Async processing (don't block webhook response)
- Acceptance: SCAR completion triggers verification within 30 seconds

**Issue #10: Post verification results to GitHub**
- Format verification results as GitHub comment
- Use Octokit to post comment
- Handle API rate limits
- Store results in verification_results table
- Acceptance: Verification results appear as comments on issues

---

**Phase 3: MCP Server (Issues #11-17)**

**Issue #11: MCP server foundation**
- Install @modelcontextprotocol/sdk
- Create MCP server boilerplate
- Tool registration system
- Acceptance: MCP server starts, Claude.ai can connect

**Issue #12: Planning file operations tools**
- supervisor.read_planning_file(project, path)
- supervisor.write_epic(project, epic_number, content)
- supervisor.write_adr(project, adr_number, content)
- supervisor.list_planning_files(project, pattern)
- Acceptance: Can read/write planning files via MCP

**Issue #13: Git operations tools**
- supervisor.git_status(project)
- supervisor.git_commit(project, message, files)
- supervisor.git_push(project)
- Acceptance: Can manage git from Claude.ai Projects

**Issue #14: GitHub API tools**
- supervisor.create_github_issue(repo, title, body, labels)
- supervisor.get_issue_status(repo, issue_number)
- supervisor.post_issue_comment(repo, issue_number, comment)
- supervisor.list_project_issues(repo, state)
- Acceptance: Full GitHub issue management via MCP

**Issue #15: SCAR monitoring tools**
- supervisor.check_scar_progress(project, issue_number)
- supervisor.get_scar_worktree(project, issue_number)
- supervisor.verify_scar_implementation(project, issue_number)
- Acceptance: Real-time SCAR progress visible in Claude.ai

**Issue #16: Verification tools**
- supervisor.run_build(project, worktree_path)
- supervisor.run_tests(project, worktree_path)
- supervisor.check_for_mocks(project, worktree_path)
- supervisor.get_build_errors(project, worktree_path)
- Acceptance: Complete verification workflow via MCP

**Issue #17: Knowledge base tools**
- supervisor.search_learnings(query, category)
- supervisor.get_template(template_name)
- supervisor.search_docs(query)
- Acceptance: Shared knowledge accessible from all projects

---

**Phase 4: Optional Adapters (Issues #18-20)**

**Issue #18: Telegram bot adapter**
- Copy SCAR's Telegram adapter pattern
- Connect to Orchestrator
- Message routing and streaming
- Acceptance: Can control supervisor via Telegram

**Issue #19: Simple web dashboard**
- Static HTML/CSS/JS dashboard
- Display all project statuses
- Recent activity feed
- Progress charts
- Acceptance: Visual overview at http://localhost:8080/dashboard

**Issue #20: Web API for custom clients**
- POST /api/projects/:project/command
- GET /api/projects/:project/status
- GET /api/projects
- Authentication (API key)
- Acceptance: RESTful API for custom integrations

### Estimated Effort

- **Phase 1 (Core Service):** 20-25 hours
- **Phase 2 (GitHub Webhooks):** 12-15 hours
- **Phase 3 (MCP Server):** 25-30 hours
- **Phase 4 (Optional Adapters):** 15-20 hours
- **Testing & Documentation:** 10-15 hours
- **Total:** 82-105 hours (~2-3 weeks full-time)

## Acceptance Criteria

### Phase 1 Completion:
- [ ] Service runs as systemd daemon
- [ ] Can send commands to any project programmatically
- [ ] Sessions persist across service restarts
- [ ] Multiple projects have independent contexts
- [ ] No context mixing between projects
- [ ] Health check endpoint works
- [ ] Logs show session creation and resume

### Phase 2 Completion:
- [ ] GitHub webhooks received and validated
- [ ] SCAR completion triggers automatic verification
- [ ] Verification results posted back to GitHub
- [ ] Webhook processing completes within 30 seconds
- [ ] Event queue prevents duplicate processing

### Phase 3 Completion:
- [ ] Claude.ai Project can connect via MCP
- [ ] All planning operations work (read/write files)
- [ ] All GitHub operations work (issues, comments)
- [ ] All verification operations work (build, test, mocks)
- [ ] Shared knowledge accessible
- [ ] Git operations work (status, commit, push)

### Phase 4 Completion (Optional):
- [ ] Telegram bot responds to messages
- [ ] Web dashboard shows all project statuses
- [ ] REST API handles custom client requests

### Overall Quality:
- [ ] TypeScript compiles with zero errors
- [ ] All unit tests pass (>80% coverage)
- [ ] All integration tests pass
- [ ] No mocks in production code
- [ ] Environment variables documented
- [ ] README with setup instructions
- [ ] Database migrations reversible
- [ ] Graceful shutdown implemented
- [ ] Error notifications working

## Dependencies

**Blocked By:**
- None (foundational project)

**Blocks:**
- Creation of Claude.ai Projects for each supervisor project
- Mobile-first workflow implementation
- Automated verification system

**External Dependencies:**
- PostgreSQL database (already available on VM)
- Claude API access (@anthropic-ai/claude-agent-sdk)
- GitHub API token for webhooks and issue management
- Node.js 18+ runtime

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Claude SDK API changes | Medium | High | Pin to specific version, monitor releases |
| Session management complexity | Medium | High | Use SCAR's proven pattern, extensive testing |
| PostgreSQL connection issues | Low | Medium | Connection pooling, retry logic |
| GitHub webhook rate limits | Low | Medium | Queue events, respect rate limits |
| Claude Code instance crashes | Medium | Medium | Auto-restart, error logging |
| MCP protocol compatibility | Low | High | Follow official SDK, test with Claude.ai |
| Cost of multiple persistent sessions | Medium | Medium | Sessions auto-pause when idle (SDK feature) |

## Testing Strategy

### Unit Tests

**ProjectManager:**
- Session creation and resume
- Command sending and response streaming
- Error handling (invalid project, API failures)

**SessionStore:**
- CRUD operations
- Concurrent access handling
- Database connection failures

**WebhookHandler:**
- Event parsing
- Signature validation
- Project identification

### Integration Tests

**Webhook Flow:**
- Receive webhook → queue event → process → verify → post result

**MCP Tools:**
- Each tool tested end-to-end
- File operations on real planning workspace
- Git operations with test repository

**Multi-Project Isolation:**
- Create two managers, verify no context mixing
- Parallel command execution

### E2E Tests

**Complete Workflows:**
1. Create epic via MCP → generates GitHub issue → SCAR starts → webhook triggers → verification runs → results posted
2. Check status via Claude.ai → MCP calls get_scar_progress → streams live updates
3. Service restart → sessions resume → no context lost

### Manual Testing Checklist

**Phase 1:**
- [ ] Start service with systemd
- [ ] Send command to consilio project
- [ ] Check session saved in database
- [ ] Restart service
- [ ] Send another command (should resume session)
- [ ] Verify independent contexts for multiple projects

**Phase 2:**
- [ ] Create test GitHub webhook
- [ ] Post "Implementation complete" comment from SCAR
- [ ] Verify webhook received
- [ ] Check verification triggered
- [ ] See results posted to GitHub

**Phase 3:**
- [ ] Connect Claude.ai Project to MCP server
- [ ] Create epic using MCP tool
- [ ] Check file appears in planning workspace
- [ ] Create GitHub issue using MCP tool
- [ ] Verify issue created in repository

**Phase 4:**
- [ ] Send Telegram message to bot
- [ ] Receive response in Telegram
- [ ] Open web dashboard
- [ ] See all project statuses

## Notes

### Design Decisions

**Why @anthropic-ai/claude-agent-sdk?**
- Proven in production by SCAR
- Handles session persistence automatically
- Supports MCP server configuration
- Streaming response support
- Working directory control
- Simpler than reimplementing Claude Code spawning

**Why PostgreSQL instead of SQLite?**
- Better concurrency support
- Production-ready at scale
- JSONB support for flexible metadata
- Already available on VM

**Why systemd instead of Docker?**
- Simpler deployment on existing VM
- Auto-restart on failure
- Standard Linux service management
- No additional dependencies

**Why MCP server over REST API for Claude.ai?**
- Native Claude.ai Projects integration
- Standard protocol
- Better tool discovery
- Streaming support

### Known Limitations

**Session Management:**
- One session per project (not per user)
- Single-user system (no multi-tenancy)
- Sessions don't automatically expire

**Webhook Processing:**
- Async processing may delay verification by seconds
- No retry logic for failed verifications (Phase 1)

**MCP Server:**
- Localhost only (no remote access without tunnel)
- No authentication in Phase 3

### Future Enhancements

**Session Management:**
- Session expiration and cleanup
- Session analytics (usage patterns)
- Multi-user support (different users, different sessions)

**Verification:**
- Configurable verification steps per project
- Machine learning-based mock detection
- Performance benchmarking during verification

**Monitoring:**
- Prometheus metrics export
- Grafana dashboards
- Alert thresholds for failures

**Adapters:**
- Discord bot
- Slack bot
- SMS notifications
- Email digests

**Dashboard:**
- Real-time WebSocket updates
- Historical trend charts
- Custom views per project
- Mobile-responsive design

### References

- SCAR Architecture: `/home/samuel/supervisor/docs/SCAR-ARCHITECTURE-AND-SUPERVISOR-INTEGRATION.md`
- First Principles Analysis: `/home/samuel/supervisor/docs/FIRST-PRINCIPLES-ANALYSIS-2026-01-17.md`
- Claude Agent SDK: https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk
- MCP Protocol: https://modelcontextprotocol.io/
- Supervisor Learning 006: Never trust SCAR, verify always
- Supervisor Learning 007: Monitor SCAR state, not just existence
