# Epic: Phase 3: Long-Term Architecture Improvements - Foundation for Scale

**Epic ID:** 008
**Created:** 2026-01-15
**Status:** Draft
**Complexity Level:** 3 (Large)

## Project Context

- **Project:** Health Agent (Odin-Health)
- **Repository:** https://github.com/gpt153/health-agent
- **Tech Stack:** Python + PydanticAI + PostgreSQL + python-telegram-bot + FastAPI
- **Related Epics:**
  - Epic 007 (Phase 2: Medium-Priority Fixes) - Should complete first for cleaner architecture
- **Workspace:** `/home/samuel/.archon/workspaces/health-agent/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/health-agent/`

## Business Context

### Problem Statement

The Health Agent codebase has significant architectural technical debt that will limit long-term scalability and maintainability:

1. **Dual Memory Systems** - Both file-based (markdown) and database (PostgreSQL) memory systems exist, creating data consistency challenges
2. **Tight Coupling** - Bot handlers directly call agent functions, making testing and changes difficult
3. **Insufficient Testing** - Only ~38 tests exist, far below the 80% coverage target for production systems
4. **No Resilience Patterns** - External API failures (OpenAI, Anthropic, USDA) cascade without circuit breakers
5. **Security Concerns** - Dynamic code execution via `exec()` needs hardening or replacement
6. **Performance Unknown** - No load testing or profiling has been done
7. **Limited Observability** - No metrics, tracing, or monitoring dashboard exists

These issues will become critical as user base grows and feature complexity increases.

### User Value

**For End Users:**
- **Reliability:** System remains responsive even when external services fail
- **Performance:** Fast responses even under high load (100+ concurrent users)
- **Data Integrity:** Single source of truth prevents inconsistent memory/tracking data
- **Security:** Hardened dynamic tools protect user data and system integrity

**For Development Team:**
- **Maintainability:** Service layer decoupling makes changes safer and faster
- **Debuggability:** Comprehensive test coverage catches bugs early
- **Observability:** Metrics and tracing enable quick problem diagnosis
- **Documentation:** Clear architecture docs enable new developers to contribute

**For Business:**
- **Scalability:** Optimized architecture supports growth without rewrites
- **Cost Efficiency:** Load testing prevents over-provisioning
- **Risk Reduction:** Circuit breakers and monitoring prevent outages
- **Compliance:** Audit logging and security hardening meet enterprise requirements

### Success Metrics

- **Memory System:** 0 files remaining in file-based system, 100% PostgreSQL
- **Test Coverage:** ≥80% coverage on critical paths (business logic, API endpoints)
- **Service Decoupling:** All bot handlers use service layer, no direct agent calls
- **Resilience:** Circuit breakers prevent cascade failures, <5% error rate under load
- **Security:** Dynamic tool sandbox prevents arbitrary code execution
- **Performance:** <200ms p95 response time at 100 concurrent users
- **Documentation:** API docs complete, architecture diagrams published
- **Observability:** Monitoring dashboard operational with key metrics

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [x] **Task 1:** Migrate fully to PostgreSQL memory system
  - Remove all file-based memory operations
  - Migrate existing file data to database
  - Delete `src/memory/file_manager.py` and related code
  - Update all references to use `mem0_manager.py` exclusively
  - Single source of truth for all user data
- [x] **Task 2:** Add comprehensive test coverage (→80%)
  - Unit tests for all business logic (service layer, agent, gamification)
  - Integration tests for all API endpoints
  - Integration tests for bot handlers
  - Error injection tests for failure scenarios
  - Database failure handling tests
  - Achieve 80% total coverage, 90% on critical paths
- [x] **Task 3:** Implement service layer architecture
  - Create `src/services/` directory with domain services
  - Move business logic from bot handlers to services
  - Define clear service interfaces
  - Add dependency injection for services
  - Decouple bot from agent via services
- [x] **Task 4:** Add circuit breaker for external APIs
  - Implement circuit breaker pattern for OpenAI API
  - Implement circuit breaker pattern for Anthropic API
  - Implement circuit breaker pattern for USDA nutrition API
  - Add fallback strategies for degraded mode
  - Configure thresholds (failure rate, timeout)

**SHOULD HAVE:**
- [x] **Task 5:** Security hardening for dynamic tools
  - Audit current `exec()` usage in `src/agent/dynamic_tools.py`
  - Implement sandboxed execution environment
  - Add comprehensive audit logging for all tool executions
  - Rate limiting on tool creation/execution
  - Runtime monitoring to detect suspicious tool behavior
  - Consider alternatives to `exec()` (template-based tools, AST manipulation)
- [x] **Task 6:** Performance optimization + load testing
  - Profile application to identify bottlenecks
  - Add query optimization (based on profiling results)
  - Tune database connection pool settings
  - Add Redis caching layer for hot data (user preferences, profiles)
  - Load test with Locust or k6 (target: 100 concurrent users)
  - Measure and document performance characteristics

**COULD HAVE:**
- [x] **Task 7:** Create comprehensive documentation
  - Architecture Decision Records (ADRs) for major choices
  - System architecture diagrams (component, data flow)
  - Full API documentation with examples
  - Deployment guide (Docker, cloud platforms)
  - Troubleshooting guide
  - Contributing guidelines
- [x] **Task 8:** Add observability stack (metrics, tracing)
  - Integrate Sentry for error tracking
  - Add Prometheus metrics (request rate, latency, errors)
  - Add OpenTelemetry distributed tracing
  - Create Grafana dashboard for key metrics
  - Log aggregation with structured logging
  - Alert rules for critical issues

**WON'T HAVE (this iteration):**
- OAuth integration for API authentication (defer to future epic)
- Multi-region database replication (defer to future epic)
- Real-time analytics dashboard for users (separate feature)
- Machine learning model optimization (separate performance epic)
- Mobile app development (separate project)

### Non-Functional Requirements

**Performance:**
- API response time: <200ms p50, <500ms p95, <1s p99
- Database query time: <50ms for simple queries, <200ms for complex
- Throughput: Handle 100 concurrent users with <5% error rate
- Connection pool: Tuned for production load (50-100 connections)

**Security:**
- Dynamic tool execution: Sandboxed, cannot access system resources
- Audit logging: All tool executions logged with user_id, timestamp, code
- API authentication: Rate limiting (10 req/min per user)
- Secrets management: No hardcoded keys, use environment variables

**Reliability:**
- Circuit breaker: Open after 5 consecutive failures, half-open after 30s
- Fallback strategies: Return cached data or graceful error messages
- Database resilience: Handle connection failures with retry (3 attempts)
- Error recovery: All external service calls have timeout (10s) and retry

**Scalability:**
- Stateless services: Enable horizontal scaling
- Database indexes: All high-traffic queries indexed
- Caching layer: Reduce database load by 40%
- Connection pooling: Prevent connection exhaustion

**Observability:**
- Metrics: Request rate, latency, error rate, database connections
- Tracing: End-to-end request tracing with OpenTelemetry
- Logging: Structured JSON logs with correlation IDs
- Alerting: PagerDuty/Slack alerts for critical issues

**Testing:**
- Unit test coverage: ≥80% on business logic
- Integration test coverage: 100% of API endpoints
- Load test: Passed at 100 concurrent users
- Security test: OWASP Top 10 validated

## Architecture

### Technical Approach

**Pattern:** Service-Oriented Architecture with Repository Pattern

**Core Principles:**
1. **Service Layer:** All business logic in domain services (`UserService`, `FoodService`, `GamificationService`)
2. **Repository Pattern:** Data access abstracted behind repositories
3. **Dependency Injection:** Services receive dependencies via constructor
4. **Circuit Breaker Pattern:** External API calls wrapped with resilience
5. **Observer Pattern:** Events for cross-cutting concerns (logging, metrics)

**State Management:**
- PostgreSQL as single source of truth
- Redis for caching (user preferences, profiles)
- In-memory circuit breaker state

**API Style:**
- RESTful endpoints for external access
- Internal service-to-service calls via direct function invocation

### Integration Points

**Database:**
- **Tables to modify:**
  - Remove file path references from `users` table
  - Ensure all memory data in `mem0_memories` table
  - Add indexes: `(user_id, timestamp)` on `food_entries`, `tracking_entries`
- **Migrations needed:**
  - `017_remove_file_memory.sql` - Drop file-related columns
  - `018_performance_indexes.sql` - Add composite indexes
  - `019_audit_logging.sql` - Add tool execution audit table

**External APIs:**
- **OpenAI (GPT-4 Vision):** Wrap with circuit breaker, 10s timeout
- **Anthropic (Claude):** Wrap with circuit breaker, 10s timeout
- **USDA Nutrition API:** Wrap with circuit breaker, 5s timeout
- **Fallback:** Use cached data or return friendly error messages

**Internal Services:**
- **Bot Layer:** Handlers in `src/bot.py`, `src/handlers/`
- **Service Layer:** New `src/services/` directory
- **Agent Layer:** `src/agent/` for AI conversations
- **Database Layer:** `src/db/queries.py` (to be split into repositories)

**New Dependencies:**
- `circuitbreaker` - Circuit breaker implementation
- `redis` - Caching layer
- `prometheus-client` - Metrics
- `opentelemetry-api`, `opentelemetry-sdk` - Distributed tracing
- `sentry-sdk` - Error tracking
- `locust` - Load testing

### Data Flow

**Before (Current - Tightly Coupled):**
```
User Message → Bot Handler → Agent Function → Database Query
                            ↓
                      File System (Memory)
```

**After (Service Layer - Decoupled):**
```
User Message → Bot Handler → Service Layer → Repository → Database
                                 ↓
                            Circuit Breaker → External API
                                 ↓
                            Cache Layer (Redis)
                                 ↓
                          Observability (Metrics, Tracing)
```

**Memory System Migration Flow:**
```
1. Read existing file-based memories
2. Transform to Mem0 format
3. Insert into PostgreSQL via mem0_manager
4. Verify data integrity
5. Remove file-based code
6. Delete memory files
```

**Circuit Breaker States:**
```
CLOSED (normal) → [5 failures] → OPEN (failing) → [30s timeout] → HALF_OPEN (testing) → [success] → CLOSED
                                                                                        → [failure] → OPEN
```

### Key Technical Decisions

**Decision 1: PostgreSQL over File-Based Memory** (ADR-008)
- **Rationale:** Single source of truth, ACID compliance, better querying
- **Trade-offs:** Requires migration, no human-readable files
- **Alternatives considered:** Hybrid approach (rejected due to complexity)

**Decision 2: Service Layer over Direct Agent Calls** (ADR-009)
- **Rationale:** Decoupling enables testing, reuse, and maintainability
- **Trade-offs:** Adds indirection layer, initial refactoring effort
- **Alternatives considered:** Keep current architecture (rejected due to tech debt)

**Decision 3: Circuit Breaker over Simple Retry** (ADR-010)
- **Rationale:** Prevents cascade failures, faster failure detection
- **Trade-offs:** Complexity in implementation, state management
- **Alternatives considered:** Exponential backoff only (insufficient for production)

**Decision 4: Sandboxed Execution over Removing Dynamic Tools** (ADR-011)
- **Rationale:** Preserve feature while improving security
- **Trade-offs:** Complexity, performance overhead
- **Alternatives considered:** Remove exec() entirely (too restrictive for users)

**Decision 5: OpenTelemetry over Custom Tracing** (ADR-012)
- **Rationale:** Industry standard, vendor-neutral, rich ecosystem
- **Trade-offs:** Learning curve, dependency size
- **Alternatives considered:** Custom logging (rejected due to reinventing wheel)

### Files to Create/Modify

```
src/
├── services/                          # NEW - Service layer
│   ├── __init__.py
│   ├── user_service.py                # NEW - User operations
│   ├── food_service.py                # NEW - Food tracking operations
│   ├── gamification_service.py        # NEW - XP, achievements, streaks
│   ├── reminder_service.py            # NEW - Reminder management
│   ├── conversation_service.py        # NEW - Chat history
│   └── base_service.py                # NEW - Base class with common patterns
├── repositories/                      # NEW - Data access layer
│   ├── __init__.py
│   ├── user_repository.py             # NEW - User CRUD
│   ├── food_repository.py             # NEW - Food entry CRUD
│   ├── gamification_repository.py     # NEW - Gamification CRUD
│   └── base_repository.py             # NEW - Base repository pattern
├── resilience/                        # NEW - Resilience patterns
│   ├── __init__.py
│   ├── circuit_breaker.py             # NEW - Circuit breaker implementation
│   ├── retry.py                       # NEW - Retry with backoff
│   └── fallback.py                    # NEW - Fallback strategies
├── observability/                     # NEW - Monitoring
│   ├── __init__.py
│   ├── metrics.py                     # NEW - Prometheus metrics
│   ├── tracing.py                     # NEW - OpenTelemetry setup
│   └── structured_logging.py          # NEW - JSON logging with correlation IDs
├── bot.py                             # MODIFY - Use service layer
├── handlers/
│   ├── food.py                        # MODIFY - Use FoodService
│   ├── reminders.py                   # MODIFY - Use ReminderService
│   ├── onboarding.py                  # MODIFY - Use UserService
│   └── gamification.py                # MODIFY - Use GamificationService
├── agent/
│   ├── __init__.py                    # MODIFY - Decouple from bot
│   └── dynamic_tools.py               # MODIFY - Add sandboxing + audit logging
├── memory/
│   ├── file_manager.py                # DELETE - Remove file-based memory
│   └── mem0_manager.py                # MODIFY - Add migration utilities
├── db/
│   ├── queries.py                     # SPLIT - Into repositories
│   └── migrations/
│       ├── 017_remove_file_memory.sql # NEW - Drop file columns
│       ├── 018_performance_indexes.sql# NEW - Composite indexes
│       └── 019_audit_logging.sql      # NEW - Tool execution audit table
├── config.py                          # MODIFY - Add Redis, observability config
└── cache/                             # NEW - Caching layer
    ├── __init__.py
    ├── redis_cache.py                 # NEW - Redis integration
    └── cache_manager.py               # NEW - Cache abstraction

tests/
├── unit/                              # NEW - Unit tests
│   ├── services/
│   │   ├── test_user_service.py       # NEW
│   │   ├── test_food_service.py       # NEW
│   │   └── test_gamification_service.py # NEW
│   ├── repositories/
│   │   ├── test_user_repository.py    # NEW
│   │   └── test_food_repository.py    # NEW
│   └── agent/
│       └── test_dynamic_tools.py      # NEW - Sandbox security tests
├── integration/                       # NEW - Integration tests
│   ├── test_api_endpoints.py          # NEW - All FastAPI endpoints
│   ├── test_bot_handlers.py           # NEW - Telegram handlers
│   ├── test_database.py               # NEW - Database operations
│   └── test_external_apis.py          # NEW - Circuit breaker tests
└── load/                              # NEW - Load tests
    └── locustfile.py                  # NEW - Load test scenarios

docs/
├── architecture/
│   ├── ADR-008-postgresql-memory.md   # NEW
│   ├── ADR-009-service-layer.md       # NEW
│   ├── ADR-010-circuit-breaker.md     # NEW
│   ├── ADR-011-tool-sandboxing.md     # NEW
│   ├── ADR-012-opentelemetry.md       # NEW
│   ├── system-architecture.md         # NEW - Component diagrams
│   └── data-flow.md                   # NEW - Data flow diagrams
├── api/
│   └── endpoints.md                   # NEW - Full API documentation
├── deployment/
│   └── production-guide.md            # NEW - Deployment instructions
└── troubleshooting.md                 # NEW - Common issues

monitoring/
├── grafana/
│   └── dashboards/
│       └── health-agent.json          # NEW - Grafana dashboard
└── prometheus/
    └── rules.yml                      # NEW - Alert rules

requirements.txt                       # MODIFY - Add new dependencies
docker-compose.yml                     # MODIFY - Add Redis, Grafana, Prometheus
.env.example                           # MODIFY - Add Redis, Sentry config
```

## Implementation Tasks

### Breakdown into GitHub Issues

#### Issue #1: Migrate fully to PostgreSQL memory system
**Estimated Time:** 16 hours
**Priority:** MUST HAVE
**Complexity:** High

**Subtasks:**
1. Audit all file-based memory operations in codebase
2. Write migration script to convert file memories to PostgreSQL format
3. Test migration script on development data
4. Update all code references to use `mem0_manager.py` exclusively
5. Remove file path columns from `users` table (migration 017)
6. Delete `src/memory/file_manager.py` and related files
7. Verify no file system operations remain
8. Run full integration test suite
9. Document new memory system architecture

**Acceptance Criteria:**
- [ ] Migration script successfully converts all file memories to database
- [ ] Zero references to `file_manager.py` in codebase (verified with grep)
- [ ] All memory operations use `mem0_manager.py`
- [ ] File-based memory code deleted
- [ ] All tests pass
- [ ] Memory retrieval works identically to before
- [ ] Documentation updated with new architecture

**Files to Create/Modify:**
- `src/memory/migrate_to_postgres.py` (new migration script)
- `src/db/migrations/017_remove_file_memory.sql` (drop columns)
- `src/memory/file_manager.py` (delete)
- `src/bot.py` (update references)
- `src/agent/__init__.py` (update references)
- `docs/architecture/ADR-008-postgresql-memory.md` (new)

---

#### Issue #2: Add comprehensive test coverage (→80%)
**Estimated Time:** 20 hours
**Priority:** MUST HAVE
**Complexity:** High

**Subtasks:**
1. Set up pytest configuration with coverage reporting
2. Write unit tests for all service layer functions (when created)
3. Write unit tests for agent business logic
4. Write unit tests for gamification calculations
5. Write integration tests for all FastAPI endpoints
6. Write integration tests for bot handlers
7. Write error injection tests (database failures, API failures)
8. Configure CI pipeline to enforce 80% coverage threshold
9. Document testing strategy and conventions

**Acceptance Criteria:**
- [ ] Overall test coverage ≥80%
- [ ] Critical path coverage ≥90% (business logic, API endpoints)
- [ ] All unit tests pass in <30 seconds
- [ ] All integration tests pass in <2 minutes
- [ ] Error injection tests verify failure handling
- [ ] CI pipeline fails if coverage drops below 80%
- [ ] Testing documentation complete

**Files to Create/Modify:**
- `tests/unit/services/test_user_service.py` (new)
- `tests/unit/services/test_food_service.py` (new)
- `tests/unit/services/test_gamification_service.py` (new)
- `tests/unit/agent/test_business_logic.py` (new)
- `tests/integration/test_api_endpoints.py` (new)
- `tests/integration/test_bot_handlers.py` (new)
- `tests/integration/test_error_injection.py` (new)
- `pytest.ini` (modify)
- `.github/workflows/ci.yml` (modify - add coverage check)
- `docs/testing-strategy.md` (new)

---

#### Issue #3: Implement service layer architecture
**Estimated Time:** 16 hours
**Priority:** MUST HAVE
**Complexity:** High

**Subtasks:**
1. Create `src/services/` directory structure
2. Design service interfaces (UserService, FoodService, etc.)
3. Implement BaseService with common patterns
4. Move business logic from bot handlers to services
5. Move business logic from agent to services (where appropriate)
6. Implement dependency injection for services
7. Update bot handlers to use services instead of direct calls
8. Update agent to use services for data operations
9. Write unit tests for each service
10. Document service layer architecture

**Acceptance Criteria:**
- [ ] All bot handlers use service layer (no direct agent calls)
- [ ] Services have clear, documented interfaces
- [ ] Dependency injection working (services receive dependencies)
- [ ] Business logic extracted from handlers (handlers are thin)
- [ ] All service functions have unit tests
- [ ] No circular dependencies between layers
- [ ] Architecture documentation complete with diagrams

**Files to Create/Modify:**
- `src/services/__init__.py` (new)
- `src/services/base_service.py` (new)
- `src/services/user_service.py` (new)
- `src/services/food_service.py` (new)
- `src/services/gamification_service.py` (new)
- `src/services/reminder_service.py` (new)
- `src/services/conversation_service.py` (new)
- `src/bot.py` (modify - inject services)
- `src/handlers/food.py` (modify - use FoodService)
- `src/handlers/reminders.py` (modify - use ReminderService)
- `src/handlers/onboarding.py` (modify - use UserService)
- `src/agent/__init__.py` (modify - use services)
- `docs/architecture/ADR-009-service-layer.md` (new)
- `docs/architecture/system-architecture.md` (new)

---

#### Issue #4: Add circuit breaker for external APIs
**Estimated Time:** 8 hours
**Priority:** MUST HAVE
**Complexity:** Medium

**Subtasks:**
1. Install `circuitbreaker` library or implement custom pattern
2. Create circuit breaker wrapper for OpenAI API calls
3. Create circuit breaker wrapper for Anthropic API calls
4. Create circuit breaker wrapper for USDA nutrition API
5. Configure thresholds (5 failures = open, 30s timeout)
6. Implement fallback strategies (cached data, friendly errors)
7. Add monitoring for circuit breaker state changes
8. Write integration tests for circuit breaker behavior
9. Load test to verify resilience under failure

**Acceptance Criteria:**
- [ ] All external API calls wrapped with circuit breaker
- [ ] Circuit opens after 5 consecutive failures
- [ ] Circuit half-opens after 30s timeout
- [ ] Fallback strategies return cached data or friendly errors
- [ ] Metrics track circuit breaker state changes
- [ ] Integration tests verify failure scenarios
- [ ] Load test passes with API failures injected
- [ ] No cascade failures when external services are down

**Files to Create/Modify:**
- `src/resilience/__init__.py` (new)
- `src/resilience/circuit_breaker.py` (new)
- `src/resilience/retry.py` (new)
- `src/resilience/fallback.py` (new)
- `src/agent/__init__.py` (modify - wrap OpenAI calls)
- `src/agent/nutrition_moderator.py` (modify - wrap Anthropic calls)
- `src/utils/nutrition_validation.py` (modify - wrap USDA calls)
- `tests/integration/test_external_apis.py` (new)
- `docs/architecture/ADR-010-circuit-breaker.md` (new)
- `requirements.txt` (modify - add circuitbreaker)

---

#### Issue #5: Security hardening for dynamic tools
**Estimated Time:** 12 hours
**Priority:** SHOULD HAVE
**Complexity:** High

**Subtasks:**
1. Audit current `exec()` usage in `src/agent/dynamic_tools.py`
2. Research sandboxing libraries (RestrictedPython, PyPy sandboxing)
3. Implement sandboxed execution environment
4. Create audit logging table (migration 019)
5. Log all tool executions (user_id, timestamp, code, result)
6. Add rate limiting on tool creation (5/hour per user)
7. Add rate limiting on tool execution (20/hour per user)
8. Add runtime monitoring to detect suspicious patterns
9. Write security tests (attempt to escape sandbox)
10. Consider alternative approaches (template-based tools)
11. Document security model and limitations

**Acceptance Criteria:**
- [ ] Dynamic tools run in sandboxed environment
- [ ] Sandbox prevents file system access (except data directory)
- [ ] Sandbox prevents network access
- [ ] Sandbox prevents subprocess execution
- [ ] All tool executions logged to audit table
- [ ] Rate limiting enforced on tool creation/execution
- [ ] Security tests verify sandbox cannot be escaped
- [ ] Runtime monitoring alerts on suspicious patterns
- [ ] Security documentation complete

**Files to Create/Modify:**
- `src/agent/dynamic_tools.py` (modify - add sandboxing)
- `src/agent/tool_sandbox.py` (new - sandboxing implementation)
- `src/agent/tool_audit.py` (new - audit logging)
- `src/db/migrations/019_audit_logging.sql` (new)
- `tests/unit/agent/test_dynamic_tools.py` (new - security tests)
- `docs/architecture/ADR-011-tool-sandboxing.md` (new)
- `docs/security-model.md` (new)
- `requirements.txt` (modify - add RestrictedPython)

---

#### Issue #6: Performance optimization + load testing
**Estimated Time:** 16 hours
**Priority:** SHOULD HAVE
**Complexity:** Medium-High

**Subtasks:**
1. Set up profiling tools (cProfile, py-spy)
2. Profile application under realistic load
3. Identify top 10 bottlenecks
4. Optimize slow database queries (add indexes, rewrite queries)
5. Create migration 018 with performance indexes
6. Tune database connection pool (test 50-100 connections)
7. Install and configure Redis for caching
8. Implement cache layer for hot data (user preferences, profiles)
9. Set cache TTLs (5 minutes for preferences, 1 hour for profiles)
10. Write Locust load test scenarios
11. Run load test at 100 concurrent users
12. Measure p50, p95, p99 latency under load
13. Document performance characteristics

**Acceptance Criteria:**
- [ ] Profiling completed, bottlenecks identified
- [ ] Top 10 bottlenecks optimized or mitigated
- [ ] Performance indexes added (migration 018)
- [ ] Database connection pool tuned for production
- [ ] Redis caching layer operational
- [ ] Cache hit rate >60% for hot data
- [ ] Load test passes at 100 concurrent users
- [ ] p95 latency <500ms under load
- [ ] Error rate <5% under load
- [ ] Performance documentation complete with baselines

**Files to Create/Modify:**
- `src/cache/__init__.py` (new)
- `src/cache/redis_cache.py` (new)
- `src/cache/cache_manager.py` (new)
- `src/db/migrations/018_performance_indexes.sql` (new)
- `src/config.py` (modify - add Redis config)
- `src/services/user_service.py` (modify - add caching)
- `src/services/food_service.py` (modify - add caching)
- `tests/load/locustfile.py` (new)
- `docker-compose.yml` (modify - add Redis)
- `docs/performance-optimization.md` (new)
- `requirements.txt` (modify - add redis, locust)

---

#### Issue #7: Create comprehensive documentation
**Estimated Time:** 12 hours
**Priority:** COULD HAVE
**Complexity:** Medium

**Subtasks:**
1. Write ADR-008 (PostgreSQL memory decision)
2. Write ADR-009 (Service layer decision)
3. Write ADR-010 (Circuit breaker decision)
4. Write ADR-011 (Tool sandboxing decision)
5. Write ADR-012 (OpenTelemetry decision)
6. Create system architecture diagram (components, layers)
7. Create data flow diagrams (memory, API, bot handlers)
8. Write full API documentation with examples
9. Document all environment variables in .env.example
10. Write deployment guide (Docker, cloud platforms)
11. Write troubleshooting guide (common issues, solutions)
12. Write contributing guidelines (code style, testing)
13. Update README with architecture overview

**Acceptance Criteria:**
- [ ] 5 ADRs written with rationale, alternatives, trade-offs
- [ ] System architecture diagram published
- [ ] Data flow diagrams published
- [ ] All API endpoints documented with examples
- [ ] All environment variables explained in .env.example
- [ ] Deployment guide covers Docker and cloud platforms
- [ ] Troubleshooting guide has 10+ common issues
- [ ] Contributing guidelines complete
- [ ] README updated with architecture section

**Files to Create/Modify:**
- `docs/architecture/ADR-008-postgresql-memory.md` (new)
- `docs/architecture/ADR-009-service-layer.md` (new)
- `docs/architecture/ADR-010-circuit-breaker.md` (new)
- `docs/architecture/ADR-011-tool-sandboxing.md` (new)
- `docs/architecture/ADR-012-opentelemetry.md` (new)
- `docs/architecture/system-architecture.md` (new)
- `docs/architecture/data-flow.md` (new)
- `docs/api/endpoints.md` (new)
- `docs/deployment/production-guide.md` (new)
- `docs/troubleshooting.md` (new)
- `docs/contributing.md` (new)
- `.env.example` (modify - add comments)
- `README.md` (modify - add architecture section)

---

#### Issue #8: Add observability stack (metrics, tracing)
**Estimated Time:** 12 hours
**Priority:** COULD HAVE
**Complexity:** Medium-High

**Subtasks:**
1. Install Sentry SDK for error tracking
2. Configure Sentry with project DSN
3. Test Sentry error capture and alerting
4. Install prometheus-client for metrics
5. Add custom metrics (request rate, latency, errors)
6. Add database connection pool metrics
7. Install OpenTelemetry SDK for tracing
8. Configure tracing for API requests
9. Configure tracing for bot handlers
10. Add correlation IDs to all logs
11. Create Grafana dashboard with key metrics
12. Configure Prometheus alert rules
13. Set up log aggregation (structured JSON logs)
14. Document observability stack

**Acceptance Criteria:**
- [ ] Sentry captures all unhandled exceptions
- [ ] Prometheus metrics endpoint operational (/metrics)
- [ ] Custom metrics track request rate, latency, errors
- [ ] OpenTelemetry traces end-to-end requests
- [ ] Correlation IDs link logs, traces, metrics
- [ ] Grafana dashboard shows key metrics in real-time
- [ ] Alert rules configured for critical issues
- [ ] Structured JSON logs with context (user_id, request_id)
- [ ] Observability documentation complete

**Files to Create/Modify:**
- `src/observability/__init__.py` (new)
- `src/observability/metrics.py` (new - Prometheus setup)
- `src/observability/tracing.py` (new - OpenTelemetry setup)
- `src/observability/structured_logging.py` (new)
- `src/api/server.py` (modify - add metrics middleware)
- `src/bot.py` (modify - add tracing)
- `src/config.py` (modify - add Sentry, Prometheus config)
- `monitoring/grafana/dashboards/health-agent.json` (new)
- `monitoring/prometheus/rules.yml` (new)
- `docker-compose.yml` (modify - add Grafana, Prometheus)
- `.env.example` (modify - add Sentry DSN)
- `docs/observability.md` (new)
- `requirements.txt` (modify - add sentry-sdk, prometheus-client, opentelemetry)

---

### Estimated Effort

**Total Estimated Time:** 112 hours (2-3 months for 1 developer)

**Breakdown by Task:**
- Task 1 (Memory Migration): 16 hours (14%)
- Task 2 (Test Coverage): 20 hours (18%)
- Task 3 (Service Layer): 16 hours (14%)
- Task 4 (Circuit Breaker): 8 hours (7%)
- Task 5 (Tool Security): 12 hours (11%)
- Task 6 (Performance): 16 hours (14%)
- Task 7 (Documentation): 12 hours (11%)
- Task 8 (Observability): 12 hours (11%)

**Breakdown by Priority:**
- MUST HAVE: 60 hours (54%)
- SHOULD HAVE: 28 hours (25%)
- COULD HAVE: 24 hours (21%)

**Recommended Sequencing:**
1. **Week 1-2:** Task 1 (Memory) + Task 3 (Service Layer) - Foundation
2. **Week 3-4:** Task 2 (Testing) - Verify changes
3. **Week 5:** Task 4 (Circuit Breaker) + Task 5 (Security) - Resilience
4. **Week 6-7:** Task 6 (Performance) - Optimization
5. **Week 8:** Task 7 (Documentation) + Task 8 (Observability) - Polish

## Acceptance Criteria

### Feature-Level Acceptance

**Memory System:**
- [ ] Zero file-based memory operations remain in codebase
- [ ] All memory data stored in PostgreSQL `mem0_memories` table
- [ ] Memory retrieval performance equivalent or better than file-based
- [ ] Data migration completed with 100% accuracy

**Testing:**
- [ ] Overall test coverage ≥80%
- [ ] Critical path coverage ≥90%
- [ ] All tests pass in CI pipeline
- [ ] Error injection tests verify failure handling

**Service Layer:**
- [ ] All bot handlers use service layer
- [ ] No direct agent calls from handlers
- [ ] Services have clear interfaces with type hints
- [ ] Dependency injection working

**Resilience:**
- [ ] Circuit breakers protect all external APIs
- [ ] Circuit opens after 5 failures, closes after recovery
- [ ] Fallback strategies provide graceful degradation
- [ ] No cascade failures during load testing

**Security:**
- [ ] Dynamic tools run in sandbox
- [ ] Audit logging captures all tool executions
- [ ] Rate limiting enforced
- [ ] Security tests pass (no sandbox escapes)

**Performance:**
- [ ] p95 latency <500ms at 100 concurrent users
- [ ] Error rate <5% under load
- [ ] Cache hit rate >60%
- [ ] Database queries optimized (indexes added)

**Documentation:**
- [ ] 5 ADRs published
- [ ] Architecture diagrams complete
- [ ] API documentation complete
- [ ] Deployment guide complete

**Observability:**
- [ ] Sentry captures errors
- [ ] Prometheus metrics exposed
- [ ] OpenTelemetry traces requests
- [ ] Grafana dashboard operational

### Code Quality

**Type Safety:**
- [ ] All new functions have complete type hints
- [ ] No `any` types in new code
- [ ] mypy passes with strict mode

**Testing:**
- [ ] All new code has unit tests
- [ ] All new API endpoints have integration tests
- [ ] All error paths tested

**Documentation:**
- [ ] All new functions have docstrings
- [ ] All ADRs document rationale
- [ ] All configuration options explained

**Security:**
- [ ] No security vulnerabilities (bandit passes)
- [ ] No secrets in code or git history
- [ ] Audit logging for sensitive operations

**Performance:**
- [ ] No N+1 queries introduced
- [ ] Database indexes on new query patterns
- [ ] Caching for expensive operations

### System Validation

**Before Marking Complete:**
- [ ] All 8 tasks completed and merged
- [ ] Full regression test suite passes
- [ ] Load test passes at 100 concurrent users
- [ ] Security audit passes
- [ ] Performance benchmarks meet targets
- [ ] All documentation reviewed and published
- [ ] Monitoring dashboard operational
- [ ] Deployment guide tested on staging environment

## Dependencies

### Blocked By

**Epic 007 (Phase 2: Medium-Priority Fixes):**
- Completing Epic 007 first will provide cleaner foundation for architecture changes
- Refactored handler functions will be easier to migrate to service layer
- Fixed error handling will make resilience patterns easier to implement
- **Recommended:** Complete Epic 007 before starting Epic 008

### Blocks

**Future Epics:**
- **Multi-Tenant Support:** Service layer and database optimizations are prerequisites
- **Real-Time Analytics:** Observability stack must be in place
- **Mobile App Backend:** API documentation and service layer required
- **Enterprise Features:** Audit logging and security hardening needed

### External Dependencies

**New Python Packages:**
- `circuitbreaker` - Circuit breaker implementation
- `redis` - Caching layer
- `prometheus-client` - Metrics
- `opentelemetry-api`, `opentelemetry-sdk` - Distributed tracing
- `sentry-sdk` - Error tracking
- `locust` - Load testing
- `RestrictedPython` - Tool sandboxing (or alternative)

**Infrastructure:**
- Redis instance (caching)
- Sentry project (error tracking)
- Grafana instance (monitoring)
- Prometheus instance (metrics)

**Tools:**
- Load testing framework (Locust)
- Profiling tools (cProfile, py-spy)

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Memory migration loses data** | Medium | Critical | Extensive testing on copies, rollback plan, backup before migration |
| **Service layer adds too much complexity** | Medium | High | Start with simple services, iterate based on feedback, clear interfaces |
| **Performance degrades with new layers** | Medium | Medium | Profile before/after, optimize hot paths, add caching strategically |
| **Circuit breaker false positives** | Low | Medium | Tune thresholds based on monitoring, allow configuration |
| **Sandbox escape vulnerability** | Low | High | Security audit, multiple sandbox layers, runtime monitoring |
| **Load testing reveals critical bottleneck** | Medium | High | Profile first, optimize before load testing, budget extra time |
| **Team unfamiliar with observability tools** | High | Low | Start simple, add training resources, document patterns |
| **Redis dependency adds operational complexity** | Medium | Medium | Docker Compose for dev, managed Redis for prod, fallback to DB cache |

## Testing Strategy

### Unit Tests

**Service Layer:**
- Test all business logic in isolation
- Mock database and external APIs
- Verify error handling (invalid inputs, edge cases)
- Test caching behavior (hit, miss, invalidation)

**Repositories:**
- Test CRUD operations
- Verify query correctness
- Test transaction handling

**Circuit Breaker:**
- Test state transitions (closed → open → half-open → closed)
- Verify failure counting
- Test timeout behavior

**Tool Sandbox:**
- Test sandbox prevents file access
- Test sandbox prevents network access
- Test sandbox prevents subprocess execution
- Attempt sandbox escape attacks

### Integration Tests

**API Endpoints:**
- Test all endpoints with valid inputs
- Test all endpoints with invalid inputs
- Verify authentication and authorization
- Test error responses (400, 401, 500)

**Bot Handlers:**
- Test message handling flow
- Test command handling
- Test error handling
- Test context preservation

**Database:**
- Test migrations run successfully
- Test rollback procedures
- Verify data integrity after migration

**External APIs:**
- Test circuit breaker behavior with API failures
- Test fallback strategies
- Test retry logic

### Load Tests

**Scenarios:**
- 100 concurrent users sending messages
- 50 concurrent users uploading food photos
- 100 concurrent API requests
- Mixed workload (bot + API)

**Metrics to Measure:**
- Request rate (req/s)
- Latency (p50, p95, p99)
- Error rate (%)
- Database connection pool usage
- Cache hit rate
- Memory usage
- CPU usage

**Failure Injection:**
- Database connection failures
- External API timeouts
- Redis unavailable
- High latency responses

### Manual Testing Checklist

**Memory System:**
- [ ] Create memory via bot command
- [ ] Retrieve memory in conversation
- [ ] Verify no file system writes
- [ ] Check database contains memory data

**Service Layer:**
- [ ] Send message via Telegram bot
- [ ] Verify handler calls service
- [ ] Verify service calls repository
- [ ] Check response returned correctly

**Circuit Breaker:**
- [ ] Trigger 5 API failures
- [ ] Verify circuit opens
- [ ] Wait 30 seconds
- [ ] Verify circuit half-opens
- [ ] Send successful request
- [ ] Verify circuit closes

**Tool Sandbox:**
- [ ] Create dynamic tool
- [ ] Execute tool
- [ ] Verify execution logged
- [ ] Attempt to access file system (should fail)
- [ ] Attempt to make network request (should fail)

**Performance:**
- [ ] Run load test at 100 users
- [ ] Verify p95 latency <500ms
- [ ] Verify error rate <5%
- [ ] Check cache hit rate >60%

**Observability:**
- [ ] Generate error, verify Sentry capture
- [ ] Check Prometheus metrics endpoint
- [ ] View Grafana dashboard
- [ ] Verify logs have correlation IDs
- [ ] Trigger alert, verify notification

## Notes

### Design Decisions

**Why PostgreSQL for Memory?**
- Single source of truth eliminates consistency issues
- ACID compliance ensures data integrity
- Superior querying (filtering, sorting, pagination)
- Vector similarity search with pgvector
- Better for multi-tenant future architecture

**Why Service Layer?**
- Decouples bot handlers from agent logic
- Enables testing in isolation
- Allows code reuse (API and bot use same services)
- Simplifies error handling and validation
- Follows clean architecture principles

**Why Circuit Breaker?**
- Prevents cascade failures (external API down → entire system down)
- Faster failure detection (don't wait for timeouts)
- Graceful degradation (return cached data or friendly errors)
- Production-grade resilience pattern

**Why Sandboxing Instead of Removing Dynamic Tools?**
- Preserves valuable user feature (custom tools)
- Security improvements make feature production-ready
- Audit logging provides accountability
- Rate limiting prevents abuse
- Runtime monitoring adds defense-in-depth

**Why OpenTelemetry?**
- Industry standard for observability
- Vendor-neutral (can switch backends)
- Rich ecosystem and integrations
- Future-proof as adoption grows

### Known Limitations

**Memory Migration:**
- One-time migration, cannot run twice
- Downtime required during migration (recommend maintenance window)
- File-based memories deleted after migration (backup recommended)

**Service Layer:**
- Adds indirection (slight complexity increase)
- Initial learning curve for team
- May require refactoring if requirements change

**Circuit Breaker:**
- False positives possible (transient failures triggering circuit)
- State management adds complexity
- Configuration tuning required per API

**Tool Sandbox:**
- Performance overhead (~10-20ms per execution)
- Some legitimate use cases may be blocked
- Not 100% escape-proof (defense-in-depth required)

**Observability:**
- Operational overhead (Grafana, Prometheus, Sentry)
- Storage costs for metrics and traces
- Learning curve for team

### Future Enhancements

**Beyond This Epic:**
- **Multi-Tenant Architecture:** Separate data per organization
- **Advanced Caching:** Multi-level cache (L1: memory, L2: Redis, L3: DB)
- **Distributed Tracing:** Cross-service tracing with Jaeger/Zipkin
- **Automated Scaling:** Kubernetes HPA based on metrics
- **Blue-Green Deployments:** Zero-downtime deployments
- **Feature Flags:** Toggle features without code changes
- **A/B Testing Framework:** Test variations in production
- **Real-Time Analytics:** WebSocket for live dashboard updates
- **Machine Learning Ops:** Model versioning, A/B testing, monitoring

### References

- **Codebase Review:** `.bmad/CODEBASE_REVIEW.md` (sections 2, 4, 5, 6)
- **Epic Template:** `/home/samuel/supervisor/templates/epic-template.md`
- **BMAD Workflow:** `/home/samuel/supervisor/docs/bmad-workflow.md`
- **Service Layer Pattern:** [Microsoft Architecture Guide](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-application-layer-implementation-web-api)
- **Circuit Breaker Pattern:** [Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)
- **OpenTelemetry:** [Official Docs](https://opentelemetry.io/docs/)
- **RestrictedPython:** [GitHub](https://github.com/zopefoundation/RestrictedPython)

---

**End of Epic 008**
