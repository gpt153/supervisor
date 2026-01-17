# Epic: Fix API Timeout Issues (Food/Accommodation Agents)

**Epic ID:** 001
**Created:** 2026-01-15
**Status:** Draft
**Complexity Level:** 2

## Project Context

- **Project:** openhorizon
- **Repository:** https://github.com/gpt153/openhorizon.cc
- **Tech Stack:** Next.js 16, React 19, TypeScript, Fastify 5, LangChain, Anthropic Claude, Inngest, PostgreSQL
- **Related Epics:** Blocks Epic #003 (Production Readiness)
- **Workspace:** `/home/samuel/.archon/workspaces/openhorizon.cc/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/openhorizon.cc/`

## Business Context

### Problem Statement
Food and Accommodation AI agents are hitting the 30-second Cloud Run timeout limit during vendor searches, **blocking the core value proposition of OpenHorizon: informed financial decision-making**. Without working vendor search:
- Cannot find cost-effective accommodation/food options
- Cannot compare pricing to optimize project margins
- Cannot make informed decisions about project viability
- Cannot choose between break-even (community) vs. profitable (income) projects

The budget calculator shows the **grant amount** (Erasmus+ income), but without vendor searches, **estimated costs** remain unknown. This blocks the Profit Dashboard from showing true project economics.

**Critical for February 2026:** Samuel needs to plan 3-5 real Erasmus+ projects. Without vendor data, impossible to know which projects are financially viable.

### User Value
Working vendor search enables:
- **Financial visibility:** See real accommodation/food costs vs. grant amount
- **Margin optimization:** Find budget options for higher-profit projects, or premium options for break-even community projects
- **Informed decisions:** Choose which projects to pursue based on true economics
- **Time savings:** AI agents search Booking.com, caterers, etc. in minutes vs. hours of manual research

**Example:** Project in Stockholm shows €20,000 grant. Vendor search finds accommodation at €80/night (good margin) vs. €150/night (break-even). This data drives decision to accept or modify project.

### Success Metrics
- Metric 1: Food/Accommodation/Travel agent searches complete successfully 99%+ of the time
- Metric 2: Average search completion time < 20 seconds (user willing to wait for quality results)
- Metric 3: Search results provide actionable pricing data (€/night, €/meal) for margin calculations
- Metric 4: Profit Dashboard shows accurate estimated costs based on vendor search data
- Metric 5: Samuel successfully uses vendor data to plan 3-5 real projects by February 2026

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Convert Food agent to Inngest background job with polling/webhook updates
- [ ] Convert Accommodation agent to Inngest background job with polling/webhook updates
- [ ] Implement frontend polling mechanism to check job status
- [ ] Display progress indicators to users during search (e.g., "Searching for accommodations... 45%")
- [ ] Handle job failures gracefully with user-friendly error messages
- [ ] Preserve existing search functionality (same inputs, same output format)

**SHOULD HAVE:**
- [ ] Implement search result caching (database) for common destinations (Stockholm, Berlin, Barcelona, etc.) - avoid redundant AI calls, instant results for repeated searches
- [ ] Add manual retry mechanism for failed searches
- [ ] Log detailed error information for debugging timeout root causes and vendor search quality
- [ ] Add Travel agent background job (flights/buses) - currently not implemented, needed for complete margin analysis

**COULD HAVE:**
- [ ] Partial result streaming (show results as they arrive rather than all at once)
- [ ] Search result prefetching for popular destinations
- [ ] User-configurable search depth (quick vs. thorough search modes)

**WON'T HAVE (this iteration):**
- Real-time collaboration on budget searches - Single-user focused (Samuel), deferred if expanding user base
- Multiple vendor comparison matrix - Focus on top 3-5 options per category with pros/cons analysis
- Integration with live booking APIs - Out of scope, user books manually based on AI recommendations
- Automatic price monitoring - One-time search only, user manually re-searches if needed

### Non-Functional Requirements

**Performance:**
- Response time: Initial job submission < 500ms
- Job completion: 80% of searches complete within 20 seconds
- Timeout handling: Jobs that exceed 60 seconds should fail gracefully with partial results

**Reliability:**
- Availability: 99.5% uptime for background job system
- Failure recovery: Automatic retry up to 3 times with exponential backoff
- Data consistency: All search results persisted to database before returning to user

**Security:**
- Authorization: Only organization members can access their project's search results
- Data isolation: Multi-tenant job results properly isolated by organizationId
- API key protection: LangChain API keys never exposed in job metadata

**Scalability:**
- Concurrent jobs: Support 50+ simultaneous search jobs
- Queue management: Inngest handles job queueing automatically
- Database: Proper indexing on job_id and organizationId for fast lookups

## Architecture

### Technical Approach
**Pattern:** Event-driven background job processing with polling-based frontend updates
**State Management:** React Query for polling job status, Zustand for local UI state
**API Style:** tRPC procedures for job submission + status checks, Inngest for job execution

### Integration Points
- **Database:** Add `search_jobs` table to track job status, results, errors
- **Inngest:** Register new functions `food-agent-search` and `accommodation-agent-search`
- **LangChain:** Existing AI agents (no changes to search logic)
- **Frontend:** Modify budget planning UI to poll job status instead of synchronous API call

### Data Flow
```
User triggers search
  ↓
Frontend: tRPC call to submitFoodSearch()
  ↓
Backend: Create job record in DB + trigger Inngest function
  ↓
Return job_id immediately (< 500ms)
  ↓
Frontend: Poll getJobStatus(job_id) every 2 seconds
  ↓
Inngest: Execute AI agent search in background
  ↓
Inngest: Update job record with status (pending → processing → completed/failed)
  ↓
Inngest: Store results in DB
  ↓
Frontend: Detect completed status in poll response
  ↓
Frontend: Display results to user
```

### Key Technical Decisions
- **Decision 1:** Use Inngest (not custom queue) because it's already integrated and handles retries/failures (see ADR-002)
- **Decision 2:** Polling (not WebSockets) for status updates to avoid connection management complexity in Cloud Run (see ADR-006)
- **Decision 3:** Store results in PostgreSQL (not Redis) for persistence and multi-tenant isolation (see ADR-003)

### Files to Create/Modify
```
app/
├── src/
│   ├── inngest/
│   │   └── functions/
│   │       ├── food-agent-search.ts          # NEW - Background job for Food agent
│   │       └── accommodation-agent-search.ts # NEW - Background job for Accommodation agent
│   ├── server/
│   │   └── routers/
│   │       └── pipeline/
│   │           ├── food.ts                   # MODIFY - Add submitSearch + getJobStatus
│   │           └── accommodation.ts          # MODIFY - Add submitSearch + getJobStatus
│   ├── lib/
│   │   └── hooks/
│   │       └── useSearchJob.ts               # NEW - React Query hook for polling
│   └── components/
│       └── pipeline/
│           ├── FoodSearchPanel.tsx           # MODIFY - Add polling UI
│           └── AccommodationSearchPanel.tsx  # MODIFY - Add polling UI
├── prisma/
│   └── schema.prisma                         # MODIFY - Add SearchJob model
└── package.json                              # Check Inngest version

project-pipeline/backend/
└── src/
    └── ai/
        ├── FoodAgent.ts                      # REVIEW - Verify timeout handling
        └── AccommodationAgent.ts             # REVIEW - Verify timeout handling
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue #1: Database - Add SearchJob model**
- Create `SearchJob` model in Prisma schema with fields: id, type (FOOD|ACCOMMODATION), status (PENDING|PROCESSING|COMPLETED|FAILED), organizationId, projectId, searchParams (JSON), results (JSON), error, createdAt, updatedAt
- Add database migration
- Add indexes on (organizationId, status) and (id, organizationId)
- Acceptance: Migration runs successfully, indexes exist

**Issue #2: Backend - Create Inngest functions for Food agent**
- Create `inngest/functions/food-agent-search.ts`
- Move existing Food agent search logic into Inngest function
- Update job status in database (pending → processing → completed/failed)
- Handle errors and store in job record
- Implement retry logic (3 attempts with exponential backoff)
- Acceptance: Function executes successfully, updates DB correctly

**Issue #3: Backend - Create Inngest functions for Accommodation agent**
- Create `inngest/functions/accommodation-agent-search.ts`
- Move existing Accommodation agent search logic into Inngest function
- Update job status in database (pending → processing → completed/failed)
- Handle errors and store in job record
- Implement retry logic (3 attempts with exponential backoff)
- Acceptance: Function executes successfully, updates DB correctly

**Issue #4: Backend - Add tRPC procedures for job management**
- Add `submitFoodSearch()` procedure that creates job + triggers Inngest
- Add `submitAccommodationSearch()` procedure that creates job + triggers Inngest
- Add `getJobStatus(jobId)` procedure that returns job record with results
- Add authorization checks (organizationId match)
- Acceptance: All procedures work with proper auth

**Issue #5: Frontend - Create useSearchJob hook**
- Create React Query hook for polling job status
- Poll every 2 seconds while status is PENDING or PROCESSING
- Stop polling when status is COMPLETED or FAILED
- Return job status, results, error, loading state
- Acceptance: Hook correctly polls and stops at completion

**Issue #6: Frontend - Update FoodSearchPanel component**
- Replace synchronous API call with job submission
- Add polling UI with progress indicator ("Searching for food options...")
- Display results when job completes
- Show error message if job fails with retry button
- Acceptance: Users see smooth polling experience, no timeouts

**Issue #7: Frontend - Update AccommodationSearchPanel component**
- Replace synchronous API call with job submission
- Add polling UI with progress indicator ("Searching for accommodations...")
- Display results when job completes
- Show error message if job fails with retry button
- Acceptance: Users see smooth polling experience, no timeouts

**Issue #8: Tests - E2E job flow validation**
- Playwright test for Food agent background job
- Playwright test for Accommodation agent background job
- Test polling UI behavior (loading → results)
- Test error handling (simulate job failure)
- Test multi-tenant isolation (verify users can't access other orgs' jobs)
- Acceptance: All tests pass

**Issue #9: Monitoring - Add job observability**
- Add logging for job creation, processing, completion/failure
- Add metrics for job duration, success rate
- Add alerts for high failure rate (>10% failures)
- Acceptance: Jobs visible in logs, metrics tracked

### Estimated Effort
- Backend (DB + Inngest functions): 8 hours
- Backend (tRPC procedures): 4 hours
- Frontend (hook + components): 6 hours
- Tests (E2E + integration): 4 hours
- Monitoring & logging: 2 hours
- Testing & debugging: 4 hours
- Total: 28 hours (~3-4 days)

## Acceptance Criteria

**Feature-Level Acceptance:**
- [ ] Food agent searches complete successfully without timeouts
- [ ] Accommodation agent searches complete successfully without timeouts
- [ ] Users see progress indicators during searches
- [ ] Failed searches show clear error messages with retry option
- [ ] Search results format unchanged (backward compatible)
- [ ] Multi-tenant isolation verified (users can't see other orgs' results)
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass (Playwright)
- [ ] Build succeeds with zero TypeScript errors
- [ ] No console errors in browser

**Code Quality:**
- [ ] Type-safe (no `any` types)
- [ ] No security vulnerabilities (npm audit)
- [ ] No mocks in production code
- [ ] Job retry logic tested
- [ ] Error boundaries handle job failures gracefully

**Performance:**
- [ ] Job submission responds in < 500ms
- [ ] 80%+ of searches complete within 20 seconds
- [ ] Polling interval appropriate (not excessive)
- [ ] Database indexes improve query performance

**Documentation:**
- [ ] Inngest functions documented with JSDoc
- [ ] tRPC procedures documented
- [ ] Frontend components have clear prop types
- [ ] Architecture decision recorded (ADR-006: Background jobs for AI agents)

## Dependencies

**Blocked By:**
- None (can start immediately)

**Blocks:**
- Epic #003: Production Readiness & Testing (critical bug must be fixed first)

**External Dependencies:**
- Inngest service must be running and configured
- Database connection must support additional `search_jobs` table
- Cloud Run must allow Inngest webhook calls

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI agents still timeout even in background jobs | Medium | High | Implement 60-second timeout in Inngest with partial results fallback; investigate caching common searches |
| Polling creates excessive database load | Low | Medium | Add database indexes on job_id; use React Query's staleTime to reduce poll frequency |
| Users confused by async workflow (expect instant results) | Medium | Medium | Clear UX with progress indicators; add estimated time remaining ("Usually takes 15-20 seconds") |
| Job failures not properly logged | Low | High | Add comprehensive error logging in Inngest functions; set up alerts for high failure rates |
| Multi-tenant isolation bugs | Low | Critical | Thorough testing of organizationId checks; add integration tests for cross-org access attempts |

## Testing Strategy

### Unit Tests
- SearchJob database model CRUD operations
- tRPC procedure authorization checks
- Job status transitions (pending → processing → completed/failed)
- Error handling in Inngest functions

### Integration Tests
- End-to-end job flow: submission → processing → completion
- Database updates during job lifecycle
- Multi-tenant isolation (verify organizationId filtering)
- Retry logic (simulate transient failures)

### E2E Tests (Playwright)
- User triggers Food agent search → sees loading → sees results
- User triggers Accommodation agent search → sees loading → sees results
- Failed search shows error message with retry button
- Multiple users can search simultaneously without conflicts

### Manual Testing Checklist
- [ ] Trigger Food agent search, verify no timeout (completes successfully)
- [ ] Trigger Accommodation agent search, verify no timeout (completes successfully)
- [ ] Check polling UI shows progress indicator
- [ ] Verify results display correctly after job completes
- [ ] Simulate job failure (e.g., invalid API key), verify error message
- [ ] Click retry button after failure, verify job re-submits
- [ ] Test with slow network (throttle to 3G), verify polling still works
- [ ] Verify multi-user scenario (two users in different orgs search simultaneously)
- [ ] Check database for job records, verify cleanup of old jobs (if applicable)

## Notes

### Design Decisions
**Why background jobs instead of increasing timeout?**
Cloud Run's 30-second HTTP timeout is a hard limit for synchronous requests. Background jobs allow arbitrarily long processing times and provide better UX through progress indicators.

**Why polling instead of WebSockets?**
Cloud Run doesn't maintain persistent connections well (cold starts, scaling). Polling with React Query is simpler, more reliable, and has acceptable latency (2-second poll interval).

**Why Inngest instead of custom queue?**
Inngest is already integrated, provides built-in retry logic, error handling, and monitoring. No need to build custom infrastructure.

### Known Limitations
- Search results are not streamed in real-time; users wait for entire search to complete (acceptable - quality results worth the wait)
- Polling creates some database load (mitigated by indexes and reasonable poll interval)
- Search results tied to specific search parameters (date, participant count); changing parameters requires new search
- No automatic price tracking over time (user manually re-searches if planning months in advance)

### Key Value for Samuel's Use Case
- **Repeat destinations benefit hugely:** First search Stockholm accommodation takes 30s, subsequent projects instant (cached)
- **Financial decision support:** Vendor data feeds directly into Profit Dashboard margin calculations
- **Time savings:** 30 seconds AI search vs. 2-3 hours manual research per destination
- **Quality results:** AI provides pros/cons analysis, not just links - actionable recommendations

### Future Enhancements
- Implement result caching (Redis or database) to avoid redundant AI calls for popular destinations
- Add search result streaming (partial results as they arrive)
- Prefetch common searches (e.g., major European cities) to improve perceived performance
- Add analytics on search patterns to optimize caching strategy
- Implement GraphQL subscriptions instead of polling for real-time updates

### References
- ADR-002: AI Architecture (LangChain + Anthropic Claude)
- ADR-003: Multi-tenancy (organization-based isolation)
- ADR-006: Background Jobs for AI Agents (to be created)
- Inngest documentation: https://www.inngest.com/docs
- Cloud Run timeout limits: https://cloud.google.com/run/docs/configuring/request-timeout
