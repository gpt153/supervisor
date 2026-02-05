# Epic Breakdown: Supervisor-Service Implementation

**Version:** 1.0
**Date:** 2026-01-18
**Related:** PRD-supervisor-service.md, TECHNICAL-SPEC-supervisor-service.md
**Total Epics:** 12
**Estimated Total Time:** 6-8 weeks (traditional) → **2-3 weeks with AI agents**

---

## Epic Overview

| Epic ID | Name | Priority | Dependencies | Est. Time | Complexity |
|---------|------|----------|--------------|-----------|------------|
| EPIC-001 | Database Foundation | P0 | None | 2-4 hours | Simple |
| EPIC-002 | Core MCP Server | P0 | EPIC-001 | 4-6 hours | Medium |
| EPIC-003 | Secrets Management | P0 | EPIC-001, EPIC-002 | 8-12 hours | Medium |
| EPIC-004 | Port Allocation System | P0 | EPIC-001, EPIC-002 | 6-8 hours | Medium |
| EPIC-005 | Cloudflare Integration | P1 | EPIC-003, EPIC-004 | 8-10 hours | Complex |
| EPIC-006 | GCloud Integration | P1 | EPIC-003 | 10-14 hours | Complex |
| EPIC-007 | Task Timing & Estimation | P1 | EPIC-001, EPIC-002 | 6-8 hours | Medium |
| EPIC-008 | Instruction Management | P1 | EPIC-002 | 6-8 hours | Medium |
| EPIC-009 | Learning System Integration | P2 | EPIC-007 | 4-6 hours | Medium |
| EPIC-010 | PIV Loop Implementation | P1 | EPIC-007, EPIC-008 | 12-16 hours | Complex |
| EPIC-011 | Multi-Project MCP Endpoints | P2 | EPIC-002 | 4-6 hours | Medium |
| EPIC-012 | Automatic Secret Detection | P2 | EPIC-003 | 3-4 hours | Simple |

**Total estimated: 73-102 hours = 2-3 weeks with parallel execution**

---

## EPIC-001: Database Foundation

### Description
Set up PostgreSQL database schema for all supervisor-service features. Create migrations for secrets, ports, timing, and RAG knowledge base.

### Acceptance Criteria
- [ ] PostgreSQL database created
- [ ] pgvector extension installed
- [ ] pgcrypto extension installed
- [ ] Migration system configured (node-pg-migrate or similar)
- [ ] 5 migration files created and tested:
  - 001_initial_schema.sql
  - 002_secrets_management.sql
  - 003_port_allocation.sql
  - 004_task_timing.sql
  - 005_learnings_index.sql
- [ ] All tables created with proper indexes
- [ ] Rollback tested (can revert migrations)
- [ ] Seed data added for development

### Tasks
1. Install PostgreSQL extensions (pgvector, pgcrypto)
2. Set up migration framework
3. Create secrets_management schema
4. Create port_allocation schema
5. Create task_timing schema
6. Create knowledge_chunks schema (RAG)
7. Add indexes for performance
8. Create seed data script
9. Test migrations (up and down)
10. Document schema in README

### Dependencies
- None (foundation epic)

### Estimated Time
- Sequential: 4 hours
- With 2 agents in parallel: 2-3 hours

### Complexity
- Simple (standard database setup)

---

## EPIC-002: Core MCP Server

### Description
Build the MCP server infrastructure with multi-endpoint support. Create base server that can handle multiple project endpoints and tool routing.

### Acceptance Criteria
- [ ] MCP server running on port 8080
- [ ] Health check endpoint (`/health`)
- [ ] Single endpoint working (`/mcp/meta`)
- [ ] Tool routing implemented
- [ ] Error handling and logging
- [ ] TypeScript types for all tools
- [ ] Server starts via systemd
- [ ] Graceful shutdown
- [ ] Request/response logging
- [ ] CORS configured (if needed)

### Tasks
1. Set up Express/Fastify server
2. Implement MCP protocol handler
3. Create tool routing system
4. Add health check endpoint
5. Implement logging (Winston or Pino)
6. Add error handling middleware
7. Create systemd service file
8. Add graceful shutdown
9. Write basic integration tests
10. Document API endpoints

### Dependencies
- EPIC-001 (needs database connection)

### Estimated Time
- Sequential: 6 hours
- With 2 agents: 3-4 hours

### Complexity
- Medium (MCP protocol + server setup)

---

## EPIC-003: Secrets Management

### Description
Implement complete secrets management system with AES-256-GCM encryption, hierarchical key paths, and MCP tools for storing/retrieving secrets.

### Acceptance Criteria
- [ ] SecretsManager class implemented
- [ ] AES-256-GCM encryption/decryption working
- [ ] Encryption key loaded from environment
- [ ] MCP tools exposed:
  - mcp__meta__get_secret
  - mcp__meta__set_secret
  - mcp__meta__list_secrets
  - mcp__meta__delete_secret
- [ ] Hierarchical key paths working (meta/project/service)
- [ ] Audit trail (access tracking)
- [ ] Secrets never logged or exposed
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests (store, retrieve, update, delete)
- [ ] Documentation and examples

### Tasks
1. Create SecretsManager class
2. Implement AES-256-GCM encryption
3. Implement decryption with auth tag verification
4. Add key path parsing logic
5. Create database queries (CRUD)
6. Implement access tracking
7. Add MCP tool definitions
8. Implement tool handlers
9. Add error handling (key not found, encryption errors)
10. Write unit tests
11. Write integration tests
12. Document usage patterns

### Dependencies
- EPIC-001 (database schema)
- EPIC-002 (MCP server)

### Estimated Time
- Sequential: 12 hours
- With 3 agents: 4-5 hours

### Complexity
- Medium (encryption + key management)

---

## EPIC-004: Port Allocation System

### Description
Implement port allocation with guaranteed conflict prevention via port ranges. Each project gets 100 ports, shared services get 1000 ports.

### Acceptance Criteria
- [ ] PortManager class implemented
- [ ] Port range allocation working (100 per project)
- [ ] Shared services range (9000-9999)
- [ ] MCP tools exposed:
  - mcp__meta__get_port
  - mcp__meta__allocate_port
  - mcp__meta__list_ports
  - mcp__meta__audit_ports
  - mcp__meta__port_summary
- [ ] Database enforces ranges (CHECK constraints)
- [ ] Automatic next-port-in-range allocation
- [ ] Cloudflare hostname linking
- [ ] Port verification (health check)
- [ ] Audit function (find conflicts)
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests (allocate, list, audit)

### Tasks
1. Create PortManager class
2. Implement getOrAllocate() method
3. Implement port range validation
4. Add next-available-port algorithm
5. Create database queries
6. Implement port verification (net module)
7. Add audit function
8. Implement MCP tool definitions
9. Implement tool handlers
10. Write unit tests
11. Write integration tests
12. Document port ranges per project

### Dependencies
- EPIC-001 (database schema)
- EPIC-002 (MCP server)

### Estimated Time
- Sequential: 8 hours
- With 2 agents: 4-5 hours

### Complexity
- Medium (range allocation + validation)

---

## EPIC-005: Cloudflare Integration

### Description
Implement Cloudflare API integration for automatic DNS management and tunnel route syncing. Zero manual Cloudflare dashboard usage.

### Acceptance Criteria
- [ ] CloudflareManager class implemented
- [ ] DNS record creation (CNAME, A records)
- [ ] DNS record deletion
- [ ] DNS record listing
- [ ] Tunnel ingress sync
- [ ] /etc/cloudflared/config.yml generation
- [ ] Cloudflared restart after config update
- [ ] Multi-domain support (153.se, openhorizon.cc)
- [ ] MCP tools exposed:
  - mcp__meta__create_cname
  - mcp__meta__create_a_record
  - mcp__meta__delete_dns_record
  - mcp__meta__list_dns_records
  - mcp__meta__sync_tunnel
- [ ] Integration with PortManager (auto-sync)
- [ ] Cloudflare API token from secrets
- [ ] Error handling (rate limits, invalid domains)
- [ ] Unit tests
- [ ] Integration tests (create, update, delete, sync)

### Tasks
1. Create CloudflareManager class
2. Implement DNS record creation
3. Implement DNS record updates
4. Implement DNS record deletion
5. Implement DNS record listing
6. Add domain detection logic
7. Implement tunnel ingress sync
8. Add YAML config generation
9. Add cloudflared restart logic
10. Integrate with PortManager
11. Implement MCP tools
12. Add error handling (rate limits)
13. Write unit tests
14. Write integration tests
15. Document usage patterns

### Dependencies
- EPIC-003 (secrets for API token)
- EPIC-004 (port allocations to sync)

### Estimated Time
- Sequential: 10 hours
- With 3 agents: 4-5 hours

### Complexity
- Complex (API integration + tunnel management)

---

## EPIC-006: GCloud Integration

### Description
Implement Google Cloud integration for VM management, health monitoring, and automatic scaling. Full access to multiple GCloud accounts.

### Acceptance Criteria
- [ ] GCloudManager class implemented
- [ ] VM operations (get, start, stop, resize, create, delete)
- [ ] VM listing (by zone, by project)
- [ ] Health monitoring (CPU, memory, disk)
- [ ] Historical metrics (last 60 min, 24 hours)
- [ ] Automatic scaling logic
- [ ] Multi-account support (2+ accounts)
- [ ] Service account keys from secrets
- [ ] MCP tools exposed:
  - mcp__meta__gcloud_get_vm
  - mcp__meta__gcloud_start_vm
  - mcp__meta__gcloud_stop_vm
  - mcp__meta__gcloud_resize_vm
  - mcp__meta__gcloud_vm_health
  - mcp__meta__gcloud_list_vms
  - mcp__meta__gcloud_create_vm
  - mcp__meta__gcloud_delete_vm
- [ ] Wait-for-status logic (VM starts/stops)
- [ ] Cron job for hourly health monitoring
- [ ] Auto-scale on high CPU (> 80% for 2 hours)
- [ ] Unit tests
- [ ] Integration tests (VM operations)

### Tasks
1. Create GCloudManager class
2. Implement authentication (service accounts)
3. Add addProject() method
4. Implement getVM() method
5. Implement start/stop/resize VM methods
6. Implement create/delete VM methods
7. Implement VM listing
8. Add health monitoring (CPU, memory, disk)
9. Implement wait-for-status logic
10. Add automatic scaling logic
11. Set up hourly cron job
12. Implement MCP tools
13. Add error handling
14. Write unit tests
15. Write integration tests
16. Document service account setup

### Dependencies
- EPIC-003 (secrets for service account keys)

### Estimated Time
- Sequential: 14 hours
- With 4 agents: 4-5 hours

### Complexity
- Complex (GCloud APIs + multiple accounts)

---

## EPIC-007: Task Timing & Estimation

### Description
Implement comprehensive task timing system with historical data storage, data-driven estimation, and parallelism tracking.

### Acceptance Criteria
- [ ] TaskTimer class implemented
- [ ] Task execution tracking (start, complete)
- [ ] Parallel execution tracking
- [ ] Estimation based on similar tasks (text search)
- [ ] Confidence intervals (95%)
- [ ] Aggregate statistics (per task type)
- [ ] MCP tools exposed:
  - mcp__meta__estimate_task
  - mcp__meta__start_task_timer
  - mcp__meta__complete_task_timer
  - mcp__meta__get_task_stats
- [ ] Automatic integration with supervisor workflow
- [ ] Dashboard/reporting function
- [ ] Historical data retention (unlimited)
- [ ] Query performance optimized (indexes)
- [ ] Unit tests
- [ ] Integration tests (estimate, time, complete)

### Tasks
1. Create TaskTimer class
2. Implement startTask() method
3. Implement completeTask() method
4. Add estimation algorithm (text search + stats)
5. Implement confidence interval calculation
6. Add parallel execution tracking
7. Implement aggregate stats update
8. Create MCP tool definitions
9. Implement tool handlers
10. Add automatic supervisor integration
11. Create dashboard/stats functions
12. Optimize database queries
13. Write unit tests
14. Write integration tests
15. Document usage patterns

### Dependencies
- EPIC-001 (database schema)
- EPIC-002 (MCP server)

### Estimated Time
- Sequential: 8 hours
- With 3 agents: 3-4 hours

### Complexity
- Medium (statistics + database queries)

---

## EPIC-008: Instruction Management

### Description
Implement layered instruction system with core/meta/project-specific instructions and auto-assembly of CLAUDE.md files.

### Acceptance Criteria
- [ ] InstructionAssembler class implemented
- [ ] Core instructions directory (.supervisor-core/)
- [ ] Meta-specific instructions (.supervisor-meta/)
- [ ] Project-specific instructions (.claude-specific/)
- [ ] Auto-assembly of CLAUDE.md from layers
- [ ] One-command update-all functionality
- [ ] MCP tools exposed:
  - mcp__meta__regenerate_supervisor
  - mcp__meta__update_core_instruction
  - mcp__meta__adapt_local_claude
- [ ] Preserve project-specific sections
- [ ] AdaptLocalClaude agent implemented
- [ ] Automatic triggers (epic complete, PR merge, monthly)
- [ ] Git commit on instruction changes
- [ ] Unit tests
- [ ] Integration tests (assemble, update, regenerate)

### Tasks
1. Create InstructionAssembler class
2. Create core instruction files
3. Create meta-specific instruction files
4. Implement assembly logic
5. Add preserve-manual-sections logic
6. Create AdaptLocalClaude class
7. Implement codebase analysis
8. Add pattern recognition (tech stack, naming, etc.)
9. Implement automatic triggers (event listeners)
10. Add MCP tool definitions
11. Implement tool handlers
12. Write unit tests
13. Write integration tests
14. Document instruction layering

### Dependencies
- EPIC-002 (MCP server)

### Estimated Time
- Sequential: 8 hours
- With 3 agents: 3-4 hours

### Complexity
- Medium (file manipulation + pattern recognition)

---

## EPIC-009: Learning System Integration

### Description
Integrate supervisor learnings with RAG system for automatic learning checks before task planning.

### Acceptance Criteria
- [ ] LearningsIndex class implemented
- [ ] RAG indexing of .md learning files
- [ ] Semantic search for relevant learnings
- [ ] Automatic learning check in supervisor workflow
- [ ] Learning impact tracking
- [ ] MCP tools exposed:
  - mcp__meta__search_learnings
  - mcp__meta__index_learning
- [ ] Auto-index on learning creation
- [ ] Hybrid storage (.md + RAG)
- [ ] Learning impact metrics
- [ ] Unit tests
- [ ] Integration tests (index, search, apply)

### Tasks
1. Create LearningsIndex class
2. Implement RAG indexing
3. Add semantic search
4. Integrate with LocalRAG
5. Add auto-index on file change (file watcher)
6. Implement supervisor workflow integration
7. Add learning impact tracking
8. Create MCP tool definitions
9. Implement tool handlers
10. Write unit tests
11. Write integration tests
12. Document usage patterns

### Dependencies
- EPIC-007 (timing data for impact metrics)

### Estimated Time
- Sequential: 6 hours
- With 2 agents: 3-4 hours

### Complexity
- Medium (RAG integration)

---

## EPIC-010: PIV Loop Implementation

### Description
Implement Plan → Implement → Validate loop with three phases (Prime, Plan, Execute) using adapted Cole Medin methodology.

### Acceptance Criteria
- [ ] PrimePhase class implemented (research)
- [ ] PlanPhase class implemented (design)
- [ ] ExecutePhase class implemented (build)
- [ ] Context document generation
- [ ] Prescriptive plan creation
- [ ] Validation commands
- [ ] Feature branch creation
- [ ] PR creation and linking
- [ ] Integration with task timing
- [ ] Integration with learning system
- [ ] Model selection (Sonnet plan, Haiku execute)
- [ ] MCP tools for manual invocation (optional)
- [ ] Unit tests
- [ ] Integration tests (full PIV cycle)
- [ ] Documentation and examples

### Tasks
1. Create PrimePhase class
2. Implement codebase analysis
3. Add local RAG search
4. Implement context document generation
5. Create PlanPhase class
6. Add solution design logic
7. Implement task breakdown
8. Add validation command generation
9. Create ExecutePhase class
10. Implement prescriptive execution
11. Add validation running
12. Integrate with Git (feature branch, commits)
13. Add PR creation
14. Integrate timing and learning
15. Write unit tests
16. Write integration tests
17. Document PIV loop workflow

### Dependencies
- EPIC-007 (task timing)
- EPIC-008 (instructions)

### Estimated Time
- Sequential: 16 hours
- With 4 agents: 5-6 hours

### Complexity
- Complex (multi-phase workflow + Git integration)

---

## EPIC-011: Multi-Project MCP Endpoints

### Description
Extend MCP server to support multiple project-specific endpoints (/mcp/consilio, /mcp/openhorizon, etc.) with context isolation.

### Acceptance Criteria
- [ ] Dynamic endpoint creation
- [ ] Project context isolation
- [ ] Tool scoping (project-specific tools only visible in that endpoint)
- [ ] ProjectContextManager class implemented
- [ ] Configuration system for projects
- [ ] MCP endpoints:
  - /mcp/meta (always present)
  - /mcp/consilio
  - /mcp/openhorizon
  - /mcp/{project} (dynamic)
- [ ] Project detection from endpoint path
- [ ] No context mixing between projects
- [ ] Unit tests
- [ ] Integration tests (multi-endpoint requests)

### Tasks
1. Create ProjectContextManager class
2. Implement dynamic endpoint registration
3. Add project configuration system
4. Implement tool scoping logic
5. Add project detection from path
6. Create ProjectEndpoint class
7. Add context isolation
8. Update MCP server to support multi-endpoint
9. Write unit tests
10. Write integration tests
11. Document project configuration

### Dependencies
- EPIC-002 (MCP server)

### Estimated Time
- Sequential: 6 hours
- With 2 agents: 3-4 hours

### Complexity
- Medium (routing + context isolation)

---

## EPIC-012: Automatic Secret Detection

### Description
Implement automatic API key/secret detection in user messages with auto-storage to secrets system.

### Acceptance Criteria
- [ ] AutoSecretDetector class implemented
- [ ] Pattern recognition for common APIs (Anthropic, OpenAI, Stripe, etc.)
- [ ] Context-based detection (from question)
- [ ] Automatic key path generation
- [ ] Integration with supervisor conversation flow
- [ ] Secrets never shown in logs
- [ ] Confirmation message to user
- [ ] API key creation (Google, Stripe, GitHub)
- [ ] Fallback to user input (Anthropic, OpenAI)
- [ ] MCP tools:
  - mcp__meta__create_api_key (for supported providers)
- [ ] Unit tests (pattern matching)
- [ ] Integration tests (detect, store, confirm)

### Tasks
1. Create AutoSecretDetector class
2. Add regex patterns for common APIs
3. Implement context-based detection
4. Add key path generation logic
5. Create APIKeyManager class
6. Implement Google API key creation
7. Implement Stripe restricted key creation
8. Implement GitHub token creation
9. Add fallback to user input
10. Integrate with supervisor conversation
11. Add secret redaction in logs
12. Write unit tests
13. Write integration tests
14. Document supported providers

### Dependencies
- EPIC-003 (secrets management)

### Estimated Time
- Sequential: 4 hours
- With 2 agents: 2-3 hours

### Complexity
- Simple (pattern matching + API integration)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Epics:** EPIC-001, EPIC-002
**Goal:** Database and MCP server ready
**Parallel agents:** 2
**Estimated time:** 1 week

```
Day 1-2: EPIC-001 (Database Foundation)
Day 3-5: EPIC-002 (Core MCP Server)
Day 5: Integration testing
```

### Phase 2: Core Infrastructure (Week 2)

**Epics:** EPIC-003, EPIC-004, EPIC-007
**Goal:** Secrets, ports, and timing working
**Parallel agents:** 3
**Estimated time:** 1 week

```
Day 1-3: EPIC-003 (Secrets)
Day 2-4: EPIC-004 (Ports)
Day 3-5: EPIC-007 (Timing)
Day 5: Integration testing
```

### Phase 3: External Integrations (Week 3)

**Epics:** EPIC-005, EPIC-006
**Goal:** Cloudflare and GCloud automated
**Parallel agents:** 4
**Estimated time:** 1 week

```
Day 1-3: EPIC-005 (Cloudflare)
Day 1-4: EPIC-006 (GCloud)
Day 4-5: Integration testing
```

### Phase 4: Intelligence (Week 4)

**Epics:** EPIC-008, EPIC-009, EPIC-010
**Goal:** Instructions, learning, PIV loop
**Parallel agents:** 4
**Estimated time:** 1 week

```
Day 1-2: EPIC-008 (Instructions)
Day 2-3: EPIC-009 (Learning)
Day 1-5: EPIC-010 (PIV Loop)
Day 5: Integration testing
```

### Phase 5: Polish (Week 5)

**Epics:** EPIC-011, EPIC-012
**Goal:** Multi-project + auto-secrets
**Parallel agents:** 2
**Estimated time:** 3 days

```
Day 1-2: EPIC-011 (Multi-endpoint)
Day 2-3: EPIC-012 (Auto-secrets)
Day 3: Integration testing
```

### Phase 6: Testing & Deployment (Week 6)

**Goal:** End-to-end testing, documentation, production deployment
**Estimated time:** 1 week

```
Day 1-2: End-to-end testing
Day 3-4: Performance testing
Day 4-5: Documentation
Day 5: Production deployment
```

---

## Total Estimates

### Traditional Development (Human)
- **Sequential:** 73-102 hours = 9-13 days = **2-3 weeks**
- **With traditional team:** 4-6 weeks (communication overhead, meetings, etc.)
- **Industry standard:** 8-12 weeks for a project this size

### AI Agent Development
- **With parallelism:** Each phase 1 week = **6 weeks total**
- **With aggressive parallelism:** **3-4 weeks**
- **With Opus planning + Haiku execution:** Cost-efficient

### Cost Estimate

**All Sonnet:**
- ~500K tokens per epic avg
- 12 epics × 500K = 6M tokens
- Input: 6M × $3/1M = $18
- Output: 2M × $15/1M = $30
- Total: ~$48

**Optimized (Sonnet plan, Haiku execute):**
- Planning: 2M tokens × $3/1M = $6
- Execution: 4M tokens × $0.25/1M = $1
- Total: ~$7
- **Savings: 85%**

---

## Dependencies Graph

```
EPIC-001 (Database)
    ├─── EPIC-002 (MCP Server)
    │       ├─── EPIC-003 (Secrets)
    │       │       ├─── EPIC-005 (Cloudflare)
    │       │       ├─── EPIC-006 (GCloud)
    │       │       └─── EPIC-012 (Auto-secrets)
    │       ├─── EPIC-004 (Ports)
    │       │       └─── EPIC-005 (Cloudflare)
    │       ├─── EPIC-007 (Timing)
    │       │       ├─── EPIC-009 (Learning)
    │       │       └─── EPIC-010 (PIV Loop)
    │       ├─── EPIC-008 (Instructions)
    │       │       └─── EPIC-010 (PIV Loop)
    │       └─── EPIC-011 (Multi-endpoint)
```

---

## Success Criteria (Overall)

**System is complete when:**
1. ✅ All 12 epics implemented and tested
2. ✅ User can deploy service via natural language
3. ✅ Zero manual Cloudflare/GCloud work
4. ✅ Port conflicts impossible (guaranteed)
5. ✅ Estimates accurate (90% within 20%)
6. ✅ Multi-project tabs working (no context mixing)
7. ✅ Instructions auto-update (one command)
8. ✅ Learning system improves over time
9. ✅ PIV loop completes features end-to-end
10. ✅ Production deployment successful

**Ready to start implementation!**

---

**END OF EPIC BREAKDOWN**

**Next:** Begin implementation with EPIC-001
