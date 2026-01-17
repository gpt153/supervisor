# Epic: Phase 2 High-Priority Refactoring - Function Complexity & Architecture

**Epic ID:** 007
**Created:** 2026-01-15
**Status:** Draft
**Complexity Level:** 2 (Medium)

## Project Context

- **Project:** health-agent
- **Repository:** https://github.com/gpt153/health-agent
- **Tech Stack:** Python, PydanticAI, PostgreSQL, python-telegram-bot, FastAPI
- **Related Epics:** Epic 006 (Phase 1: Quick Wins - should complete first)
- **Workspace:** `/home/samuel/.archon/workspaces/health-agent/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/health-agent/`

## Business Context

### Problem Statement

The Health Agent codebase has accumulated significant technical debt that impacts maintainability, testability, and development velocity. A comprehensive code review identified **51 functions exceeding 50 lines**, with the largest function being **303 lines** (handle_photo). The codebase also suffers from:

- Extreme function complexity making testing and debugging difficult
- Missing input validation allowing invalid data to reach the system
- No caching layer leading to unnecessary database load
- Inconsistent error handling that could hide bugs
- Monolithic modules (queries.py is 3,270 lines) making navigation difficult
- Bare except clauses that could mask critical errors
- Debugging artifacts (82 print statements) instead of proper logging

These issues slow down feature development, increase bug introduction risk, and make onboarding new developers challenging.

### User Value

While users don't directly see refactoring work, they benefit from:

- **Faster feature delivery** - Cleaner code means faster development
- **Fewer bugs** - Better structure reduces error introduction
- **Better performance** - Caching reduces response latency by 30%
- **More reliable service** - Monitoring catches issues before users experience them
- **Better error messages** - Improved error handling provides clearer feedback

### Success Metrics

- **Code Quality:** All functions <50 lines (currently 51 exceed this)
- **Performance:** API caching reduces database load by 30%
- **Reliability:** Zero bare except clauses (currently 5)
- **Testing:** Integration tests for all API endpoints (currently limited coverage)
- **Maintainability:** queries.py split into 5+ domain-specific modules
- **Observability:** Monitoring dashboard operational showing key metrics

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [x] Refactor handle_photo function (303 lines → ~40 lines)
- [x] Refactor handle_message function (160 lines → ~40 lines)
- [x] Refactor handle_reminder_completion function (158 lines → ~40 lines)
- [x] Fix all 5 bare except clauses with proper exception handling
- [x] Add input validation layer using Pydantic validators
- [x] Improve error handling consistency across codebase
- [x] Split queries.py into domain-specific modules

**SHOULD HAVE:**
- [x] Implement API result caching (Redis or in-memory)
- [x] Add integration tests for all API endpoints
- [x] Improve configuration validation using Pydantic Settings
- [x] Add basic monitoring (Sentry + Prometheus)

**COULD HAVE:**
- [ ] Refactor additional functions beyond top 3
- [ ] Advanced caching strategies (multi-tier, cache warming)
- [ ] Comprehensive monitoring dashboard with custom metrics
- [ ] Performance profiling and optimization

**WON'T HAVE (this iteration):**
- Full observability stack with distributed tracing - Deferred to Phase 3
- Load testing infrastructure - Deferred to Phase 3
- Service layer architecture refactor - Deferred to Phase 3
- Migration to PostgreSQL-only memory system - Deferred to Phase 3 (Epic TBD)
- Circuit breakers for external APIs - Deferred to Phase 3
- Full test coverage (80%+) - Phase 2 focuses on integration tests only

### Non-Functional Requirements

**Performance:**
- Response time: Maintain current performance (<500ms for API calls)
- Database load: Reduce by 30% through caching
- Cache hit rate: >70% for user preferences and profiles
- Cache TTL: 5 minutes for user data

**Code Quality:**
- Function length: <50 lines per function (target: 30-40 lines)
- Cyclomatic complexity: <10 per function
- Type hints: 100% coverage on refactored code
- Docstrings: All public functions must have docstrings
- No print statements (use logging)
- No bare except clauses

**Testing:**
- Integration tests: All API endpoints must have tests
- Test coverage: >60% for refactored modules
- Error scenarios: Test validation failures and edge cases
- Regression tests: Ensure refactoring doesn't break functionality

**Maintainability:**
- Module size: No file >1000 lines
- Clear separation: One domain per file
- Consistent patterns: Standardize error handling approach
- Documentation: Docstrings explain WHY, not just WHAT

## Architecture

### Technical Approach

**Pattern:** Extract Method refactoring combined with domain-driven module organization

**Key Strategies:**

1. **Function Refactoring:**
   - Break large functions into single-responsibility functions
   - Use descriptive names that explain intent
   - Maximum 40 lines per function (ideally 20-30)
   - Extract validation, processing, and side effects into separate functions

2. **Input Validation:**
   - Create centralized validation utilities using Pydantic
   - Validate at entry points (handlers, API endpoints)
   - Clear error messages for validation failures
   - Type-safe validation with custom validators

3. **Error Handling:**
   - Replace bare except with specific exception types
   - Always log caught exceptions with context
   - Use custom exception classes for domain errors
   - Return meaningful error messages to users

4. **Caching Strategy:**
   - In-memory caching with TTL (5 minutes)
   - Cache user preferences, profiles, and frequently accessed data
   - Invalidate cache on updates
   - Consider Redis for production if needed

5. **Module Organization:**
   - Split by domain (user, food, gamification, tracking, reminders)
   - Clear interfaces between modules
   - Minimize cross-module dependencies
   - Use dependency injection where appropriate

6. **Monitoring:**
   - Sentry for error tracking and alerting
   - Prometheus for metrics (request counts, latency, errors)
   - Custom metrics for business logic (cache hit rate, validation failures)
   - Simple Grafana dashboard for visualization

### Integration Points

- **Database:** No schema changes required, only query organization
- **Cache Layer:** Add caching wrapper around database queries
- **Monitoring:** Integrate Sentry SDK and Prometheus client
- **Testing:** Pytest with async support for integration tests

### Data Flow

```
User Request → Input Validation → [Cache Check] → Business Logic → [Cache Update] → Database → Response
                      ↓                                                ↓
                Error Handling                              Monitoring/Metrics
```

**Refactored handle_photo flow:**
```
handle_photo()
  → validate_photo_input()       # Check user_id, photo exists, context
  → analyze_photo_vision()       # Vision AI analysis
  → process_nutrition_data()     # Extract nutrition info
  → save_food_entry()            # Database insert
  → handle_gamification()        # Award XP, check achievements
  → notify_user()                # Send Telegram response
```

### Key Technical Decisions

- **Decision 1:** Use in-memory caching initially (Redis deferred to Phase 3)
  - Rationale: Simpler implementation, sufficient for current scale
  - Trade-off: Single-server limitation, no persistence

- **Decision 2:** Split queries.py by domain rather than by operation type
  - Rationale: Aligns with business domains, easier to find related queries
  - Alternative considered: Split by CRUD operations (rejected - less intuitive)

- **Decision 3:** Use Pydantic validators for input validation
  - Rationale: Type-safe, integrates with FastAPI, reusable
  - Alternative considered: Manual validation (rejected - error-prone)

- **Decision 4:** Start with Sentry free tier for monitoring
  - Rationale: Quick to implement, sufficient for early-stage monitoring
  - Can upgrade to paid tier or self-hosted Prometheus later

### Files to Create/Modify

```
src/
├── bot.py                        # MODIFY - Refactor handle_photo, handle_message
├── handlers/
│   └── reminders.py              # MODIFY - Refactor handle_reminder_completion
├── db/
│   └── queries/                  # NEW DIRECTORY
│       ├── __init__.py           # NEW - Export all query functions
│       ├── user.py               # NEW - User CRUD and queries
│       ├── food.py               # NEW - Food entries and nutrition
│       ├── gamification.py       # NEW - XP, achievements, streaks
│       ├── tracking.py           # NEW - Dynamic tracking categories
│       └── reminders.py          # NEW - Reminder queries
├── utils/
│   ├── validation.py             # NEW - Input validation utilities
│   ├── cache.py                  # NEW - Caching layer
│   └── monitoring.py             # NEW - Metrics and monitoring helpers
├── config.py                     # MODIFY - Use Pydantic Settings
└── api/
    └── routes.py                 # MODIFY - Add validation, caching

tests/
├── integration/                  # NEW DIRECTORY
│   ├── test_api_chat.py          # NEW - Chat endpoint tests
│   ├── test_api_health.py        # NEW - Health check tests
│   └── test_api_tracking.py     # NEW - Tracking endpoints tests
└── unit/
    ├── test_validation.py        # NEW - Validation layer tests
    └── test_cache.py             # NEW - Cache layer tests

.env                              # MODIFY - Add Sentry DSN, monitoring config
requirements.txt                  # MODIFY - Add sentry-sdk, prometheus-client
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue 1: Refactor handle_photo function (303 → ~40 lines)**
- **Location:** `src/bot.py:902`
- **Current:** Single 303-line function with deeply nested logic
- **Target:** ~40 lines orchestrating 6 helper functions
- **Subtasks:**
  1. Create `validate_photo_input(user_id, photo, context)` - Verify inputs valid
  2. Create `analyze_photo_vision(photo_bytes)` - Call vision AI
  3. Create `process_nutrition_data(analysis_result)` - Extract nutrition info
  4. Create `save_food_entry(user_id, nutrition_data)` - Database insert
  5. Create `handle_gamification(user_id, entry_type)` - Award XP, achievements
  6. Create `notify_user(context, result)` - Send Telegram response
  7. Refactor `handle_photo()` to call these functions
  8. Add unit tests for each helper function
  9. Add integration test for full flow
- **Acceptance:**
  - handle_photo <50 lines
  - All helper functions <40 lines
  - Tests pass
  - Photo analysis still works correctly
  - Gamification triggers properly
- **Estimated Effort:** 4 hours

**Issue 2: Refactor handle_message function (160 → ~40 lines)**
- **Location:** `src/bot.py:706`
- **Current:** 160 lines handling multiple message types
- **Target:** ~40 lines with extracted routing logic
- **Subtasks:**
  1. Create `route_message(message_type)` - Determine handler
  2. Create `validate_message_input(message)` - Check message validity
  3. Create `extract_message_context(message)` - Parse context
  4. Create `format_response(result)` - Format Telegram response
  5. Refactor `handle_message()` to use helpers
  6. Add tests for each helper
- **Acceptance:**
  - handle_message <50 lines
  - All message types still handled correctly
  - Tests pass
- **Estimated Effort:** 3 hours

**Issue 3: Refactor handle_reminder_completion (158 → ~40 lines)**
- **Location:** `src/handlers/reminders.py:15`
- **Current:** 158 lines handling completion flow
- **Target:** ~40 lines with clear separation of concerns
- **Subtasks:**
  1. Create `validate_reminder_completion(user_id, reminder_id)` - Check valid
  2. Create `process_completion(reminder)` - Mark complete, calculate streak
  3. Create `award_completion_rewards(user_id, reminder)` - Gamification
  4. Create `send_completion_notification(user_id, result)` - User feedback
  5. Refactor `handle_reminder_completion()` to orchestrate
  6. Add tests
- **Acceptance:**
  - handle_reminder_completion <50 lines
  - Reminders still complete correctly
  - Streaks calculated properly
  - XP awarded correctly
  - Tests pass
- **Estimated Effort:** 3 hours

**Issue 4: Add input validation layer**
- **Location:** NEW `src/utils/validation.py`
- **Create Pydantic validators for:**
  - Message length (<4000 characters)
  - Nutrition values (no negative calories, valid ranges)
  - Dates (no future dates for entries)
  - Reminder frequency (valid intervals)
  - User IDs (positive integers)
  - API keys (valid format)
- **Apply validation to:**
  - All bot handlers
  - All API endpoints
  - Database inserts
- **Acceptance:**
  - Validation utilities created
  - Applied to all entry points
  - Clear error messages on validation failure
  - Tests for validation logic
- **Estimated Effort:** 3 hours

**Issue 5: Implement API result caching**
- **Location:** NEW `src/utils/cache.py`
- **Cache targets:**
  - User preferences (5-minute TTL)
  - User profiles (5-minute TTL)
  - Tracking categories (15-minute TTL)
  - Reminder schedules (10-minute TTL)
- **Implementation:**
  - In-memory cache with TTL expiry
  - Cache key generation from query parameters
  - Cache invalidation on updates
  - Cache hit/miss metrics
- **Acceptance:**
  - Cache layer implemented
  - Applied to high-frequency queries
  - Database load reduced by 30%
  - Cache hit rate >70%
  - Tests verify cache behavior
- **Estimated Effort:** 3 hours

**Issue 6: Improve error handling consistency**
- **Location:** Multiple files
- **Fix 5 bare except clauses:**
  1. `src/bot.py:157` - File writing error
  2. `src/handlers/onboarding.py:643` - Onboarding flow
  3. `src/agent/__init__.py:2681` - Agent execution
  4. `src/utils/timezone_helper.py:111` - Timezone conversion
  5. `src/memory/system_prompt.py:117` - Prompt generation
- **Standardization:**
  - Create custom exception classes (ValidationError, DatabaseError, etc.)
  - Replace bare except with specific exception types
  - Add logging to all exception handlers
  - Document exception behavior in docstrings
- **Acceptance:**
  - Zero bare except clauses
  - All exceptions logged with context
  - Custom exception classes defined
  - Error handling documentation complete
- **Estimated Effort:** 4 hours

**Issue 7: Split queries.py by domain (3,270 lines → 5+ files)**
- **Location:** `src/db/queries.py` → `src/db/queries/` directory
- **Split into:**
  1. `queries/user.py` (~600 lines) - User CRUD, preferences, profiles
  2. `queries/food.py` (~700 lines) - Food entries, nutrition data
  3. `queries/gamification.py` (~800 lines) - XP, achievements, streaks, challenges
  4. `queries/tracking.py` (~500 lines) - Dynamic tracking categories and entries
  5. `queries/reminders.py` (~400 lines) - Reminder CRUD and scheduling
  6. `queries/__init__.py` - Export all functions for backward compatibility
- **Process:**
  1. Create queries/ directory
  2. Split functions by domain
  3. Update imports throughout codebase
  4. Verify all tests still pass
- **Acceptance:**
  - queries.py split into 5+ domain files
  - Each file <1000 lines
  - All imports updated
  - Tests pass
  - Backward compatibility maintained
- **Estimated Effort:** 4 hours

**Issue 8: Add integration tests for API endpoints**
- **Location:** NEW `tests/integration/`
- **Test all endpoints in `src/api/routes.py`:**
  - POST /api/v1/chat - Chat message handling
  - POST /api/v1/track - Tracking entry creation
  - GET /api/v1/user/{user_id} - User profile retrieval
  - GET /api/v1/health - Health check
- **Test scenarios:**
  - Successful requests with valid data
  - Validation errors (invalid input)
  - Authentication errors (invalid API key)
  - Database errors (connection failure)
  - Edge cases (empty input, extreme values)
- **Acceptance:**
  - Integration tests for all endpoints
  - All success scenarios covered
  - All error scenarios covered
  - Tests use async pytest
  - Tests pass in CI/CD
- **Estimated Effort:** 4 hours

**Issue 9: Improve configuration validation**
- **Location:** `src/config.py`
- **Current:** Manual environment variable loading
- **Target:** Pydantic Settings with validation
- **Changes:**
  1. Create `Settings` class inheriting from `BaseSettings`
  2. Add field validators (URL format, port ranges, required fields)
  3. Add startup validation that fails fast on invalid config
  4. Type hints for all config fields
  5. Default values for optional fields
- **Example:**
  ```python
  class Settings(BaseSettings):
      telegram_bot_token: str = Field(..., min_length=1)
      database_url: PostgresDsn
      api_port: int = Field(default=8080, ge=1, le=65535)
      sentry_dsn: Optional[str] = None

      class Config:
          env_file = ".env"
  ```
- **Acceptance:**
  - Pydantic Settings implemented
  - All config validated at startup
  - Invalid config fails with clear error
  - Type-safe config access throughout code
- **Estimated Effort:** 2 hours

**Issue 10: Add monitoring basics (Sentry + Prometheus)**
- **Location:** NEW `src/utils/monitoring.py`
- **Sentry Integration:**
  - Install sentry-sdk
  - Initialize with DSN from config
  - Capture exceptions automatically
  - Add custom context (user_id, request_id)
  - Test error reporting
- **Prometheus Metrics:**
  - Install prometheus-client
  - Add metrics:
    - Request count by endpoint
    - Request latency histogram
    - Error count by type
    - Cache hit/miss ratio
    - Active users gauge
  - Expose /metrics endpoint
- **Simple Dashboard:**
  - Document Prometheus queries
  - Create basic Grafana dashboard JSON (optional)
  - Add alerts for critical metrics
- **Acceptance:**
  - Sentry captures errors with context
  - Prometheus metrics exposed at /metrics
  - Metrics documented
  - Monitoring validates through test errors
- **Estimated Effort:** 3 hours

### Estimated Effort

- **Function Refactoring:** 10 hours (Issues 1-3)
- **Validation & Error Handling:** 7 hours (Issues 4, 6)
- **Architecture Improvements:** 8 hours (Issues 5, 7)
- **Testing & Monitoring:** 9 hours (Issues 8-10)
- **Total:** 30 hours

**Breakdown by Phase:**
- **Week 1 (10h):** Issues 1-3 (function refactoring)
- **Week 2 (10h):** Issues 4, 6, 9 (validation, error handling, config)
- **Week 3 (10h):** Issues 5, 7, 8, 10 (caching, module split, tests, monitoring)

## Acceptance Criteria

### Feature-Level Acceptance:

- [x] All functions <50 lines (target: 30-40 lines average)
- [x] handle_photo reduced from 303 → ~40 lines
- [x] handle_message reduced from 160 → ~40 lines
- [x] handle_reminder_completion reduced from 158 → ~40 lines
- [x] queries.py (3,270 lines) split into 5+ domain-specific modules (<1000 lines each)
- [x] Input validation layer operational on all entry points
- [x] API caching reduces database load by 30% (measured via query logs)
- [x] Integration tests for all API endpoints pass
- [x] Zero bare except clauses (currently 5)
- [x] Monitoring dashboard operational (Sentry + Prometheus)
- [x] Configuration validation using Pydantic Settings
- [x] Cache hit rate >70% for user data

### Code Quality:

- [x] Type hints on all refactored code (mypy --strict passes)
- [x] All public functions have docstrings (Google format)
- [x] No print statements (use logger.info/debug/warning/error)
- [x] Consistent error handling (specific exception types, logging)
- [x] No magic numbers (use constants or config)
- [x] No commented code (clean git history)
- [x] Black formatting applied (88 char limit)
- [x] All imports used (no unused imports via ruff)

### Testing:

- [x] Unit tests for all extracted helper functions
- [x] Integration tests for all API endpoints (success + error cases)
- [x] Regression tests verify existing functionality unchanged
- [x] Test coverage >60% for refactored modules
- [x] All tests pass in CI/CD pipeline
- [x] Validation tests cover edge cases (negative values, future dates, etc.)

### Documentation:

- [x] All functions have docstrings (description, args, returns, raises)
- [x] Monitoring setup documented (Sentry DSN, Prometheus queries)
- [x] Cache behavior documented (TTL, invalidation strategy)
- [x] Error handling patterns documented
- [x] Module organization documented (which domain in which file)

### Performance:

- [x] API response times maintained (<500ms p95)
- [x] Database query count reduced by 30% (via caching)
- [x] Cache hit rate >70% after warmup period
- [x] No performance regression on existing features

## Dependencies

**Blocked By:**
- Epic 006 (Phase 1: Quick Wins) should complete first for cleaner baseline
  - Reason: Phase 1 fixes print statements and basic issues that would interfere with refactoring

**Blocks:**
- Epic 008 (Phase 3: Long-term improvements) - Service layer architecture
- Future performance optimization epics benefit from cleaner codebase

**External Dependencies:**
- None (all libraries already in requirements.txt or standard additions)

**Internal Dependencies:**
- No schema changes required (queries.py split is code-only)
- No API contract changes (validation is internal)
- Caching is transparent to callers

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Refactoring breaks existing functionality | Medium | High | Write regression tests before refactoring, test thoroughly after each change |
| Cache introduces stale data bugs | Medium | Medium | Short TTL (5 min), clear invalidation strategy, monitor cache-related errors |
| Performance regression from extra validation | Low | Medium | Profile validation code, optimize hot paths if needed |
| Module split breaks imports | Low | High | Maintain backward compatibility in __init__.py, update imports incrementally |
| Monitoring overhead impacts performance | Low | Low | Use async Sentry, minimal Prometheus metrics initially |
| Team unfamiliar with new patterns | Medium | Medium | Document patterns clearly, add code examples, conduct code review |

## Testing Strategy

### Unit Tests

**Functions to test:**
- All extracted helpers from handle_photo, handle_message, handle_reminder_completion
- Validation utilities (test valid and invalid inputs)
- Cache layer (test hit, miss, expiry, invalidation)
- Configuration validation (test valid and invalid config)

**Approach:**
- Pytest with fixtures for common test data
- Mock database calls
- Test success paths and error paths
- Test edge cases (empty input, extreme values, boundary conditions)

### Integration Tests

**API endpoints:**
- POST /api/v1/chat (valid message, invalid message, auth error)
- POST /api/v1/track (valid tracking entry, validation error)
- GET /api/v1/user/{user_id} (existing user, non-existent user)
- GET /api/v1/health (database up, database down)

**Approach:**
- Use test database with known fixture data
- Test full request → response cycle
- Verify database state changes
- Test error scenarios (invalid input, missing auth, etc.)

### Regression Tests

**Critical flows to verify:**
- Photo analysis and food entry creation
- Message handling and responses
- Reminder completion and streak calculation
- Gamification (XP, achievements, challenges)
- Onboarding flow

**Approach:**
- Run existing test suite after each refactoring step
- Add new tests if coverage gaps found
- Manual testing of Telegram bot functionality

### Manual Testing Checklist

- [ ] Send photo to bot, verify food entry created correctly
- [ ] Send text message, verify appropriate response
- [ ] Complete reminder, verify streak updates
- [ ] Trigger validation error (negative calories), verify clear error message
- [ ] Check Sentry dashboard for captured errors
- [ ] Check Prometheus /metrics endpoint for metrics
- [ ] Verify cache hit rate in logs
- [ ] Test with invalid config, verify startup fails gracefully

## Notes

### Design Decisions

**Why refactor these 3 functions first?**
- handle_photo (303 lines) is the largest and most complex
- handle_message (160 lines) is high-traffic (every user message)
- handle_reminder_completion (158 lines) has complex logic (streaks, gamification)
- These 3 cover the most critical user flows

**Why in-memory cache instead of Redis?**
- Simpler to implement and deploy
- Sufficient for current scale (single-server deployment)
- Can migrate to Redis in Phase 3 if needed
- No additional infrastructure dependency

**Why Pydantic for validation?**
- Already used for models (consistent with codebase)
- Type-safe validation
- Clear error messages
- Reusable validators

**Why split queries.py by domain?**
- Aligns with business domains (user, food, gamification, etc.)
- Easier to find related queries
- Natural module boundaries
- Alternative (split by CRUD operations) rejected as less intuitive

**Why Sentry over custom error tracking?**
- Quick to implement (< 1 hour)
- Rich error context automatically captured
- Free tier sufficient for early-stage project
- Can self-host later if needed

### Known Limitations

**What this epic doesn't cover:**
- Full test coverage (80%+) - Only integration tests for API endpoints
- Load testing - Performance testing deferred to Phase 3
- Service layer architecture - Major refactor deferred to Phase 3
- Migration to PostgreSQL-only memory - File system still used
- Circuit breakers for external APIs - Resilience deferred to Phase 3
- Advanced caching (multi-tier, cache warming) - Basic caching only

**Why these limitations?**
- Phase 2 focuses on high-priority, high-impact improvements
- Full architectural refactor (service layer) is Phase 3 scope
- Load testing requires refactoring to be complete first
- Balance effort vs. impact (diminishing returns on deeper refactoring now)

### Future Enhancements

**Phase 3 candidates:**
- Full observability stack (distributed tracing, log aggregation)
- Service layer architecture (decouple bot from agent)
- Migration to PostgreSQL-only memory system
- Circuit breakers and retry logic for external APIs
- Advanced caching strategies (multi-tier, cache warming)
- Load testing and performance optimization
- Full test coverage (80%+ coverage)

**Long-term considerations:**
- Consider microservices if scale demands it
- Evaluate GraphQL for API if complex queries emerge
- Consider event-driven architecture for gamification

### References

- **Code Review:** `.bmad/CODEBASE_REVIEW.md` (comprehensive analysis)
- **Phase 1 Epic:** Epic 006 (Quick Wins - precursor to this epic)
- **Template:** `/home/samuel/supervisor/templates/epic-template.md`
- **Best Practices:**
  - [Refactoring: Improving the Design of Existing Code](https://refactoring.com/)
  - [PEP 8 - Style Guide for Python Code](https://peps.python.org/pep-0008/)
  - [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)

---

**Epic Owner:** Supervisor
**Assigned to:** SCAR (implementation agent)
**Review:** Supervisor will validate each phase completion
**Timeline:** 3 weeks (10 hours per week)
