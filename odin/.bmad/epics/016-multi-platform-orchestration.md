# Epic: Multi-Platform Orchestration with Claude Agent SDK

**Epic ID:** 016
**Created:** 2026-01-17
**Status:** Draft
**Complexity Level:** 4

## Project Context

- **Project:** Odin
- **Repository:** https://github.com/gpt153/odin
- **Tech Stack:** Python 3.11+ (MCP services), Node.js 20+ (orchestration), TypeScript, PostgreSQL, Redis, FastAPI
- **Related Epics:**
  - Blocks: Epic 017-019 (Voice Interface, Web Dashboard, Mobile Access)
  - Depends on: Epic 001 (Project Foundation), Epic 007 (Family Context Engine)
- **Workspace:** `/home/samuel/.archon/workspaces/odin/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/odin/`

## Business Context

### Problem Statement

Odin's vision is to be a JARVIS-like AI assistant accessible from anywhere - voice, phone, web, desktop. Currently, the MCP-only architecture means each platform interaction is independent with no shared context. A conversation started on desktop cannot continue on mobile. Voice interactions would require rebuilding all AI logic. This fundamentally breaks the "unified intelligence" promise of the JARVIS experience.

Without multi-platform orchestration, Odin remains a collection of disconnected tools rather than a cohesive, omnipresent assistant.

### User Value

**JARVIS Experience Unlocked:**
- Start a conversation on desktop, continue it in the car via voice
- Ask about family schedules from any device and get consistent, context-aware responses
- Odin remembers all interactions regardless of platform used
- Single source of truth for all personal information and context

**Real-World Scenario:**
```
Morning (Desktop):
"Schedule dentist appointment for Emma next Tuesday 3pm"

Afternoon (Voice in car):
"What's my afternoon schedule?"
→ Odin responds: "Emma's dentist at 3pm, then grocery shopping"
   (Same session, has full context from morning)

Evening (Phone):
"Did I book that appointment?"
→ Odin: "Yes, Emma's dentist is Tuesday 3pm at SmileClinic"
   (Continuity across all three platforms)
```

### Success Metrics

- **Multi-Platform Continuity:** 95%+ session context preservation across platform switches
- **Response Latency:** <500ms for platform routing overhead
- **Session Persistence:** Resume conversations from days ago with full context
- **Platform Availability:** 99.5%+ uptime for orchestration service
- **User Satisfaction:** Seamless experience rated as "feels like talking to same person" in user testing

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Node.js orchestration service managing Claude Code sessions
- [ ] Session persistence in PostgreSQL with user/platform mapping
- [ ] Telegram adapter for mobile text access
- [ ] Integration with all existing Python MCP servers (no changes to MCP code)
- [ ] Session resumption across platforms (same conversation continues)
- [ ] Real-time message streaming to all platform adapters
- [ ] Error handling and graceful degradation per platform
- [ ] Health monitoring for orchestration service

**SHOULD HAVE:**
- [ ] Voice adapter with STT/TTS integration (foundational for Phase 6)
- [ ] Web dashboard for conversation history and configuration
- [ ] Session context summaries for quick resume
- [ ] Platform-specific formatting (voice vs text vs web)
- [ ] Rate limiting per user/platform
- [ ] Basic analytics (messages per platform, session duration)

**COULD HAVE:**
- [ ] Multi-device synchronization (typing indicators, read receipts)
- [ ] Platform preference learning (auto-route based on time/location)
- [ ] Proactive notifications across platforms
- [ ] Session branching (fork conversation for different contexts)

**WON'T HAVE (this iteration):**
- WhatsApp integration (future platform)
- Mobile native app (web-first approach)
- Multi-user support (single user focus maintained)
- Cloud deployment (local-only for privacy)

### Non-Functional Requirements

**Performance:**
- Platform message routing: <100ms overhead
- Session lookup from database: <50ms
- Claude Code response streaming: <200ms first token
- Concurrent platform connections: Support 5+ simultaneous platforms per user

**Security:**
- All platform communications over TLS/WSS
- Session IDs cryptographically secure (UUID v4)
- No sensitive data logged in orchestration layer
- Platform authentication tokens encrypted at rest

**Reliability:**
- Orchestration service 99.5%+ uptime
- Automatic session recovery after service restart
- Graceful handling of Claude Code session failures
- Platform adapter circuit breakers (fail one, not all)

**Scalability:**
- Designed for single user, but architecture supports multi-user
- Session storage optimized for 1000+ historical sessions
- Platform adapters can run in separate processes if needed

## Architecture

### Technical Approach

**Pattern:** Hybrid architecture combining Python MCP services with Node.js orchestration layer

**Core Components:**
1. **Node.js Orchestration Service** - Manages Claude Code sessions using `@anthropic-ai/claude-agent-sdk`
2. **Platform Adapters** - Thin I/O layers (Telegram, Voice, Web) that route to orchestration
3. **Python MCP Servers** - Existing tools (email, tasks, search) - NO CHANGES
4. **Session Store** - PostgreSQL database tracking user sessions per platform

**Why This Architecture:**
- SCAR (sister project) proves this pattern works in production
- Claude Agent SDK provides session management out of the box
- Separates intelligence (Claude Code) from I/O (platform adapters)
- Future-proof: adding new platforms is just another adapter

### Integration Points

**Database:**
- New table: `claude_sessions` (user_id, platform, session_id, context_summary)
- Existing tables: No changes (orchestration layer is additive)

**External Services:**
- Telegram Bot API (for mobile text access)
- OpenAI/Deepgram (STT for voice)
- Chatterbox/OpenAI (TTS for voice)

**Internal Services:**
- Python MCP servers (connected via stdio/http to Claude Code)
- Redis (session caching for fast lookup)

### Data Flow

```
User Input (Any Platform)
        ↓
Platform Adapter (Telegram/Voice/Web)
        ↓
Node.js Orchestrator
    ├─→ Lookup/Create Session (PostgreSQL)
    ├─→ Configure MCP Servers
    └─→ Query Claude Code (Agent SDK)
            ↓
        Claude Code Session
            ├─→ Reasoning & Decision Making
            ├─→ Tool Calls to Python MCPs
            └─→ Generate Response
                ↓
        Stream Response Back
            ↓
Platform Adapter (format for platform)
        ↓
User Sees Response
```

### Key Technical Decisions

- **Decision 1:** Use Node.js + Agent SDK instead of pure Python
  - Rationale: Agent SDK only available in Node.js, proven by SCAR
  - Alternative considered: Custom Python session management (rejected - reinventing wheel)

- **Decision 2:** Keep Python MCP servers unchanged
  - Rationale: MCP servers are tools, orchestration is separate concern
  - Benefit: No migration needed, existing code continues to work

- **Decision 3:** Session persistence in PostgreSQL (not Redis)
  - Rationale: Sessions are critical data requiring durability
  - Redis used only for caching, PostgreSQL is source of truth

- **Decision 4:** Platform adapters as thin I/O layers
  - Rationale: All intelligence in Claude Code, adapters just handle transport
  - Benefit: Easy to add new platforms, minimal duplicate logic

### Files to Create/Modify

```
odin/
├── orchestrator/                    # NEW - Node.js orchestration service
│   ├── package.json                # Dependencies (Agent SDK, Telegraf, etc)
│   ├── tsconfig.json               # TypeScript configuration
│   ├── src/
│   │   ├── index.ts                # Service entry point
│   │   ├── orchestrator.ts         # Core session management
│   │   ├── adapters/
│   │   │   ├── telegram.ts         # Telegram bot adapter
│   │   │   ├── voice.ts            # Voice WebSocket adapter
│   │   │   └── web.ts              # Web dashboard adapter
│   │   ├── database/
│   │   │   ├── client.ts           # PostgreSQL connection
│   │   │   └── sessions.ts         # Session CRUD operations
│   │   └── utils/
│   │       ├── logger.ts           # Structured logging
│   │       └── config.ts           # Environment configuration
│   └── tests/
│       ├── orchestrator.test.ts    # Unit tests
│       └── integration/            # Integration test suite
│
├── database/
│   └── migrations/
│       └── 016_claude_sessions.sql # NEW - Session persistence table
│
├── docker/
│   ├── docker-compose.yml          # MODIFY - Add orchestrator service
│   └── orchestrator.Dockerfile     # NEW - Node.js service container
│
└── docs/
    └── architecture/
        └── multi-platform-orchestration.md  # NEW - Architecture doc
```

## Implementation Tasks

### Breakdown into GitHub Issues

#### Phase 1: Core Orchestration (Foundation)

**Issue #105: Setup Node.js orchestration service structure**
- Initialize Node.js/TypeScript project in `orchestrator/`
- Install dependencies: `@anthropic-ai/claude-agent-sdk`, `pg`, `redis`
- Configure TypeScript with strict mode
- Setup ESLint, Prettier for code quality
- Create basic server entry point
- **Acceptance:** `npm run build` succeeds, basic HTTP server responds to health check

**Issue #106: Implement session management core**
- Create database schema for `claude_sessions` table
- Implement session CRUD operations (create, get, update, list)
- Add session caching layer with Redis
- Write unit tests for session operations
- **Acceptance:** Can create session, retrieve by user+platform, cache hit rate >80%

**Issue #107: Integrate Claude Agent SDK**
- Implement `OdinOrchestrator` class using Agent SDK
- Configure MCP server connections (odin-mcp-core, quiculum-mcp)
- Handle session creation and resumption
- Stream responses from Claude Code
- Error handling for Claude API failures
- **Acceptance:** Can send message, get response, resume previous session

**Issue #108: Add structured logging and monitoring**
- Implement Winston logger with JSON output
- Add request tracing (correlation IDs)
- Metrics collection (response times, session counts)
- Health check endpoint (`/health`)
- **Acceptance:** All operations logged, metrics exposed at `/metrics`

#### Phase 2: Telegram Adapter (Proof of Concept)

**Issue #109: Create Telegram bot adapter**
- Initialize Telegraf bot framework
- Handle text messages from users
- Route messages to orchestrator
- Stream responses back to Telegram
- Error handling and user-friendly error messages
- **Acceptance:** Can send message via Telegram, receive Claude response

**Issue #110: Implement session persistence for Telegram**
- Map Telegram user ID to database sessions
- Handle new vs returning users
- Session timeout logic (close after 24h inactivity)
- **Acceptance:** Can start conversation, close app, resume later with context

**Issue #111: Add Telegram-specific formatting**
- Format code blocks as Telegram code snippets
- Handle long messages (split if needed)
- Add typing indicators while processing
- Support inline buttons for confirmations
- **Acceptance:** Responses formatted correctly, supports markdown

**Issue #112: Test cross-platform continuity (Desktop → Telegram)**
- Integration test: conversation started in Claude Code desktop
- Continue conversation via Telegram
- Verify context is maintained
- Measure session resume latency
- **Acceptance:** Desktop context available in Telegram, <100ms resume time

#### Phase 3: Voice Adapter (Foundational)

**Issue #113: Setup WebSocket server for voice streaming**
- Implement WebSocket endpoint for voice connections
- Handle binary audio data streaming
- Connection lifecycle management (connect, disconnect, timeout)
- **Acceptance:** Can establish WebSocket connection, receive audio chunks

**Issue #114: Integrate Speech-to-Text (STT)**
- Evaluate STT options (OpenAI Whisper, Deepgram)
- Implement audio buffering and VAD (voice activity detection)
- Convert audio chunks to text
- Handle multiple languages (Swedish/English)
- **Acceptance:** Audio stream → accurate text transcription <2s latency

**Issue #115: Integrate Text-to-Speech (TTS)**
- Evaluate TTS options (Chatterbox, OpenAI, ElevenLabs)
- Generate audio from Claude responses
- Stream audio back over WebSocket
- Support voice selection and speed control
- **Acceptance:** Text → natural-sounding audio, streaming playback

**Issue #116: Build voice adapter routing**
- Connect STT → Orchestrator → TTS pipeline
- Handle interruptions (user speaks while Claude talking)
- Add push-to-talk vs continuous listening modes
- Conversation state management
- **Acceptance:** Full voice conversation loop working, feels responsive

**Issue #117: Optimize voice latency**
- Parallel STT/TTS processing where possible
- Streaming TTS (start playing before complete)
- Audio buffering strategies
- Measure end-to-end latency
- **Acceptance:** <3s from user stops speaking to hearing response start

#### Phase 4: Web Dashboard (User Interface)

**Issue #118: Create web dashboard React app**
- Initialize React app with TypeScript
- Setup Tailwind CSS for styling
- Create basic layout (sidebar, chat area)
- WebSocket connection to orchestrator
- **Acceptance:** Web app loads, shows chat interface

**Issue #119: Implement chat interface**
- Message list with user/assistant messages
- Input field with send button
- Real-time message streaming display
- Markdown rendering for Claude responses
- **Acceptance:** Can send/receive messages, see conversation history

**Issue #120: Add session management UI**
- Session list sidebar (all user sessions)
- Create new session button
- Switch between sessions
- Delete/archive old sessions
- **Acceptance:** Can manage multiple conversation threads

**Issue #121: Build configuration panel**
- Platform connection status (Telegram, Voice, Web)
- MCP server health indicators
- User preferences (voice, language)
- Session settings (timeout, context length)
- **Acceptance:** All settings visible and editable

#### Phase 5: Testing & Deployment

**Issue #122: Write integration tests**
- Test all platform adapters (Telegram, Voice, Web)
- Multi-platform session continuity tests
- Failure scenarios (MCP down, Claude API error)
- Load testing (multiple concurrent sessions)
- **Acceptance:** 90%+ test coverage, all critical paths tested

**Issue #123: Create Docker deployment setup**
- Dockerfile for orchestrator service
- Update docker-compose.yml (add orchestrator, Redis)
- Environment variable configuration
- Health checks and auto-restart policies
- **Acceptance:** `docker-compose up` starts all services successfully

**Issue #124: Write deployment documentation**
- Architecture diagram (visual)
- Setup instructions (dependencies, env vars)
- Platform adapter configuration guides
- Troubleshooting common issues
- **Acceptance:** New developer can deploy Odin following docs

**Issue #125: Performance optimization**
- Profile session lookup queries (add indexes)
- Optimize Redis caching strategy
- Reduce Claude Code session startup time
- Minimize platform routing overhead
- **Acceptance:** <100ms platform overhead, <50ms session lookup

### Estimated Effort

- **Phase 1 (Core Orchestration):** 40 hours (Issues #105-108)
- **Phase 2 (Telegram Adapter):** 24 hours (Issues #109-112)
- **Phase 3 (Voice Adapter):** 32 hours (Issues #113-117)
- **Phase 4 (Web Dashboard):** 24 hours (Issues #118-121)
- **Phase 5 (Testing & Deployment):** 20 hours (Issues #122-125)
- **Total:** 140 hours (~3.5 weeks full-time, 6-8 weeks part-time)

## Acceptance Criteria

### Feature-Level Acceptance:

- [ ] Can start conversation on desktop Claude Code, continue on Telegram with full context
- [ ] Voice interface works end-to-end (speech in → Claude response → speech out)
- [ ] Web dashboard shows all sessions and allows management
- [ ] Session persistence survives service restarts
- [ ] All three platforms (Telegram, Voice, Web) work simultaneously
- [ ] Python MCP servers integrate without code changes
- [ ] Error on one platform doesn't crash others (circuit breaker works)
- [ ] Session lookup <50ms, platform routing <100ms overhead
- [ ] All integration tests pass (90%+ coverage)
- [ ] Docker Compose deployment works on fresh VM

### Code Quality:

- [ ] Type-safe TypeScript (strict mode, no `any`)
- [ ] Python MCP code unchanged (additive architecture)
- [ ] No secrets in code or logs
- [ ] Comprehensive error handling (no uncaught exceptions)
- [ ] Unit tests for all core modules (orchestrator, session management)
- [ ] Integration tests for all platform adapters

### Documentation:

- [ ] Architecture diagram created and committed
- [ ] Setup guide for orchestration service
- [ ] Platform adapter configuration documented
- [ ] Troubleshooting guide for common issues
- [ ] API documentation for orchestrator endpoints

## Dependencies

### Blocked By:
- Epic #001: Project Foundation (PostgreSQL, Redis must be set up)
- Epic #007: Family Context Engine (MCP servers must be operational)

### Blocks:
- Epic #017: Advanced Voice Features (needs Phase 3 foundation)
- Epic #018: Web Dashboard Enhancements (needs Phase 4 foundation)
- Epic #019: Mobile Native App (needs orchestration layer)

### External Dependencies:
- Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) - CRITICAL
- Telegram Bot API (rate limits: 30 msg/sec)
- STT/TTS services (API costs, latency considerations)
- Node.js 20+ runtime (LTS version required)

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Agent SDK breaking changes | Medium | High | Pin exact version, monitor changelog, test upgrades in staging |
| Claude API rate limits | Medium | High | Implement request queuing, exponential backoff, user quotas |
| Voice latency >5s | High | Medium | Optimize STT/TTS pipeline, use streaming, consider local models |
| Session database growth | Medium | Medium | Implement archival strategy (>30 days), session size limits |
| Platform adapter complexity | Low | Medium | Keep adapters thin (<200 lines), comprehensive testing |
| Python/Node.js integration issues | Low | High | Use proven MCP stdio/http protocols, extensive integration tests |
| Multi-platform sync bugs | High | High | Conservative session locking, thorough concurrency testing |

## Testing Strategy

### Unit Tests

**Orchestration Core:**
- Session CRUD operations (create, get, update, delete)
- Session caching (Redis hit/miss scenarios)
- Agent SDK integration (mocked responses)
- Error handling (network failures, API errors)

**Platform Adapters:**
- Message formatting (text, code, markdown)
- Connection lifecycle (connect, disconnect, timeout)
- Error recovery (retry logic, circuit breakers)

### Integration Tests

**Multi-Platform Flow:**
- Desktop → Telegram session continuity
- Telegram → Voice session continuity
- Voice → Web session continuity
- All platforms accessing same session simultaneously

**MCP Integration:**
- Orchestrator correctly connects to Python MCPs
- Tool calls work through orchestration layer
- MCP failures handled gracefully

**Database Operations:**
- Session persistence across service restarts
- Concurrent session access (multiple platforms)
- Session cleanup (old/inactive sessions)

### E2E Tests

**Scenario 1: Daily JARVIS Usage**
- Morning: Ask about schedule via desktop
- Afternoon: Continue via voice in car
- Evening: Review via web dashboard
- Verify: All interactions in same session, context preserved

**Scenario 2: Family Context Across Platforms**
- Create task for child via Telegram
- Check task status via voice
- Mark complete via web
- Verify: Task state consistent across all platforms

**Scenario 3: Service Resilience**
- Start conversation via web
- Restart orchestration service
- Resume conversation via Telegram
- Verify: Session recovered, context maintained

### Manual Testing Checklist

- [ ] Send Telegram message, receive Claude response
- [ ] Voice: Speak command, hear natural response
- [ ] Web: Chat interface feels responsive
- [ ] Switch platforms mid-conversation (context preserved)
- [ ] Service restart doesn't lose active sessions
- [ ] Multiple platforms connected simultaneously (no conflicts)
- [ ] Error messages are user-friendly (no stack traces)
- [ ] Voice latency feels acceptable (<3s end-to-end)
- [ ] Session list shows correct platform icons
- [ ] Configuration changes take effect without restart

## Notes

### Design Decisions

**Why Node.js instead of pure Python?**
- Claude Agent SDK only available in Node.js
- SCAR proves this hybrid architecture works in production
- Node.js excels at I/O-heavy operations (WebSocket, streaming)
- Keeps Python for data processing (where it excels)

**Why not modify existing MCP servers?**
- Orchestration is a separate concern from tools
- Keeps architecture modular (replace orchestrator without touching MCPs)
- Future platforms get same tools automatically
- Reduces risk (no changes to working code)

**Why PostgreSQL for sessions instead of just Redis?**
- Sessions are critical data requiring durability
- Need to query session history (last 30 days, by platform)
- Redis is cache, not source of truth
- Audit trail for debugging

### Known Limitations

- **Single User Focus:** Architecture supports multi-user, but not tested/optimized for it
- **Local Only:** No cloud deployment (privacy constraint)
- **Voice Quality:** Dependent on STT/TTS service quality (not under our control)
- **Platform Limits:** Telegram rate limits (30 msg/sec), may need throttling
- **Session Size:** Large contexts (>100k tokens) may hit Claude limits

### Future Enhancements

**Additional Platforms:**
- WhatsApp adapter (uses Telegram pattern)
- SMS gateway (for basic text access)
- Discord bot (community/family server access)
- Slack integration (work context)

**Advanced Features:**
- Proactive notifications (Odin initiates conversation)
- Multi-device sync (typing indicators, read receipts)
- Session branching (fork for different contexts)
- Platform preference learning (auto-route based on time/location)
- Voice biometrics (identify family members by voice)

**Performance Optimizations:**
- Local STT/TTS models (reduce latency, no API costs)
- Session pre-warming (anticipate next interaction)
- Intelligent caching (common queries)
- Distributed orchestration (multi-node for HA)

### References

- **Analysis:** `/home/samuel/supervisor/odin/research/claude-agent-sdk-architecture-analysis.md`
- **SCAR Implementation:** Reference for orchestration patterns
- **Claude Agent SDK Docs:** https://github.com/anthropics/claude-code-sdk (official docs)
- **Project Vision:** `.bmad/project-brief.md` (JARVIS-like experience)
- **MCP Specification:** https://modelcontextprotocol.io/

---

**Epic Status:** Ready for implementation
**Next Action:** Break into GitHub issues #105-125, begin Phase 1
**Estimated Completion:** 6-8 weeks (part-time development)
