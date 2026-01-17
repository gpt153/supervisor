# Epic: Production Readiness & Testing

**Epic ID:** 003
**Created:** 2026-01-15
**Updated:** 2026-01-17
**Status:** Active
**Complexity Level:** 2

## Project Context

- **Project:** openhorizon
- **Repository:** https://github.com/gpt153/openhorizon.cc
- **Tech Stack:** Next.js 16, React 19, TypeScript, Fastify, Playwright, Vitest, PostgreSQL, Cloud Run
- **Related Epics:** Blocked by Epic #001 (API Timeouts - ✅ DEPLOYED), Epic #002 (Authentication - ✅ DEPLOYED)
- **Workspace:** `/home/samuel/.archon/workspaces/openhorizon.cc/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/openhorizon.cc/`

## Business Context

### Problem Statement
Epic 001 (API Timeouts) and Epic 002 (Authentication) are now **DEPLOYED to production**, completing 98% of OpenHorizon's core functionality. However, **E2E test failures during Epic 001 revealed critical infrastructure gaps** that must be addressed before relying on the platform for real Erasmus+ applications in February 2026:

**Specific Test Infrastructure Issues Identified:**
- **9 out of 11 E2E tests failed** during Epic 001 deployment validation
- **Missing test database seeding:** Projects and phases don't exist for tests to operate on
- **No authentication setup for tests:** Tests can't log in or access protected routes
- **No fixtures for creating test data:** Each test must manually create all prerequisite data
- **Test failures do NOT indicate implementation bugs** - Epic 001 functionality works in production (verified at app.openhorizon.cc)

**Production Readiness Gaps:**
- Unknown production stability under realistic usage patterns
- No production monitoring to detect or respond to issues
- Incomplete documentation for user onboarding and disaster recovery
- No backup and recovery procedures tested

**Critical Context:** Samuel will use OpenHorizon to plan 3-5 real Erasmus+ projects starting February 2026. Each project represents €15,000-€30,000 in grant funding. **Production failures could result in missed application deadlines** and significant financial loss. The final 2% is about **confidence and reliability**, not features.

### User Value
Users need to:
- Trust that their project data is safe and won't be lost
- Experience consistent performance without crashes or freezes
- Complete application workflows without encountering bugs
- Receive responsive support when issues occur
- Successfully submit Erasmus+ applications with confidence

Production readiness ensures OpenHorizon meets professional standards expected by organizations submitting real grant applications worth €20,000-€60,000.

### Success Metrics
- Metric 1: E2E test coverage >80% for critical user journeys
- Metric 2: Zero P0 (critical) bugs in production during beta period
- Metric 3: System uptime >99.5% during February 2026
- Metric 4: User-reported bug rate <2% of completed application workflows
- Metric 5: All 3-5 beta organizations successfully submit applications

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Fix E2E test infrastructure (database seeding, test fixtures, authentication setup) - **CRITICAL: Blocks all other testing**
- [ ] Fix all existing E2E tests from Epic 001 (9/11 failed due to infrastructure gaps, not code bugs)
- [ ] Validate all critical user flows end-to-end (seed → elaboration → project → programme → budget → vendor search → export)
- [ ] Production deployment verification (smoke tests on live environment at app.openhorizon.cc)
- [ ] Basic monitoring and alerting (error rates, response times, Inngest job failures)
- [ ] Database backup and recovery procedures (automated backups, tested restoration)
- [ ] User onboarding documentation (getting started guide, feature walkthrough)

**SHOULD HAVE:**
- [ ] Add performance monitoring (track page load times, API latency)
- [ ] Implement automated backup verification
- [ ] Create user onboarding flow with tooltips/guides
- [ ] Add usage analytics to understand user behavior
- [ ] Set up error tracking (Sentry or similar)
- [ ] Create admin dashboard for monitoring system health

**COULD HAVE:**
- [ ] Add feature flags for gradual rollout
- [ ] Implement A/B testing framework
- [ ] Add user feedback widget
- [ ] Create changelog/release notes system

**WON'T HAVE (this iteration):**
- Chaos engineering / fault injection testing - Deferred to post-launch
- Multi-region deployment - Single region sufficient for MVP
- CDN for static assets - Cloud Run serves adequately for beta
- Advanced observability (distributed tracing) - Basic logging sufficient for now

### Non-Functional Requirements

**Reliability:**
- Availability: 99.5% uptime during February 2026
- Data durability: Zero data loss (database backups + point-in-time recovery)
- Failure recovery: Automatic restarts for crashed services
- Error handling: All errors logged with sufficient context for debugging

**Performance:**
- Page load time: < 2 seconds (p95)
- API response time: < 500ms (p95)
- AI generation time: < 30 seconds for project generation
- Database query time: < 100ms (p95)
- Document export time: < 5 seconds for PDF generation

**Security:**
- Vulnerability scanning: Zero high/critical vulnerabilities (npm audit)
- Dependency updates: All critical security patches applied
- Data encryption: At rest (database) and in transit (HTTPS)
- Access control: Role-based permissions properly enforced
- Audit logging: All sensitive operations logged

**Scalability:**
- Concurrent users: Support 50+ simultaneous users
- Database connections: Properly pooled and managed
- Background jobs: Queue system handles spikes gracefully
- Storage: Sufficient capacity for 500+ projects

## Architecture

### Technical Approach
**Pattern:** Comprehensive testing pyramid (unit → integration → E2E) + production monitoring + incident response
**Testing Stack:** Vitest (unit/integration), Playwright (E2E), manual testing checklist
**Monitoring Stack:** Cloud Run logs, database metrics, error tracking, uptime monitoring

### Integration Points
- **Testing:** Playwright tests against staging environment (oh.153.se)
- **Monitoring:** Cloud Run metrics + custom logging + error tracking service
- **Database:** Verify migrations, indexes, backup schedule
- **Deployment:** Validate Docker builds, environment variables, service configuration

### Data Flow (Testing)
```
Local development
  ↓
Unit tests (Vitest) - validate business logic
  ↓
Integration tests (Vitest) - validate API + DB
  ↓
E2E tests (Playwright) - validate user journeys
  ↓
Staging deployment (oh.153.se)
  ↓
Manual testing with beta users
  ↓
Production deployment
  ↓
Continuous monitoring
```

### Key Technical Decisions
- **Decision 1:** Use Playwright (not Cypress) for E2E tests due to better TypeScript support and parallel execution (see ADR-008)
- **Decision 2:** Test against staging environment (not production) to avoid polluting real user data (see ADR-008)
- **Decision 3:** Manual testing required for complex AI-generated content (automated tests can't validate semantic quality) (see ADR-008)

### Files to Create/Modify
```
app/
├── tests/
│   ├── e2e/
│   │   ├── seed-creation.spec.ts         # NEW - Test seed brainstorming
│   │   ├── seed-elaboration.spec.ts      # NEW - Test conversational elaboration
│   │   ├── project-generation.spec.ts    # NEW - Test seed → project conversion
│   │   ├── programme-builder.spec.ts     # NEW - Test multi-day programme creation
│   │   ├── budget-planning.spec.ts       # NEW - Test vendor searches + budget calc
│   │   ├── document-export.spec.ts       # NEW - Test PDF/DOCX generation
│   │   └── multi-tenant.spec.ts          # NEW - Test org data isolation
│   ├── integration/
│   │   ├── auth.test.ts                  # ADD - Clerk integration tests
│   │   ├── database.test.ts              # ADD - Prisma CRUD tests
│   │   └── ai-agents.test.ts             # ADD - LangChain agent tests
│   └── playwright.config.ts              # REVIEW - Verify configuration
├── src/
│   ├── app/
│   │   ├── error.tsx                     # IMPROVE - Global error boundary
│   │   └── layout.tsx                    # IMPROVE - Add error boundary
│   └── lib/
│       └── monitoring.ts                 # NEW - Logging/monitoring utilities
├── docs/
│   ├── runbook.md                        # NEW - Operational procedures
│   ├── testing-guide.md                  # NEW - Testing documentation
│   └── troubleshooting.md                # NEW - Common issues + solutions
└── scripts/
    ├── verify-migrations.sh              # NEW - Check DB schema vs. Prisma
    └── load-test.sh                      # NEW - Load testing script

project-pipeline/
└── frontend/
    └── tests/
        └── e2e/
            └── pipeline-workflow.spec.ts # NEW - Test project pipeline
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue #127: Test Infrastructure - Database Seeding & Fixtures**
- Create test data seed functions (users, organizations, projects, seeds, phases)
- Add Playwright global setup to seed test database before tests
- Add global teardown to clean up test data after tests
- Create reusable fixtures (sample seeds, elaborated projects, programmes)
- Add authentication helpers for E2E tests (login, get auth token)
- Acceptance: Tests can create realistic data, authentication works in E2E context

**Issue #128: Fix E2E Tests - All Existing Tests Pass**
- Fix 9/11 failed tests from Epic 001 (authentication setup, missing data)
- Update seed-flow.spec.ts with proper fixtures
- Update project-flow.spec.ts with database seeding
- Update vendor-search tests with background job polling
- Verify auth flows (signup, login, protected routes)
- Acceptance: All 11 existing E2E tests pass + auth tests pass (100% green)

**Issue #129: E2E Tests - Complete User Flows**
- Test full seed → elaboration → project flow (happy path)
- Test programme builder creation and editing
- Test budget calculator accuracy (verify Erasmus+ unit costs)
- Test vendor search background jobs (food, accommodation)
- Test document export (PDF, DOCX generation)
- Test multi-tenant isolation (verify org-based data separation)
- Acceptance: All critical user flows validated end-to-end

**Issue #130: Production Smoke Tests - Deployment Validation**
- Create smoke test script that runs against production URL (app.openhorizon.cc)
- Verify homepage loads (HTTP 200)
- Verify authentication endpoints work (signup/login)
- Verify protected routes require auth (redirect to login)
- Verify database connectivity (simple query test)
- Verify Inngest webhook endpoint responds (health check)
- Acceptance: Smoke tests can run post-deploy, catch critical failures

**Issue #131: Monitoring & Alerting - Error Tracking**
- Integrate Sentry for error tracking (Next.js + Fastify)
- Configure source maps for readable stack traces
- Set up error alerts (email/Slack on critical errors)
- Add custom error contexts (user ID, organization ID, request details)
- Create error dashboard (Sentry or Google Cloud Monitoring)
- Acceptance: Errors logged to Sentry, alerts trigger on critical issues

**Issue #132: Monitoring & Alerting - Metrics & Observability**
- Track key metrics (request count, latency p50/p95/p99)
- Track business metrics (projects created, searches completed, exports generated)
- Track Inngest job metrics (completion rate, duration, failure rate)
- Set up alerts for anomalies (error rate >1%, job failure rate >10%)
- Create monitoring dashboard (Google Cloud Monitoring or Grafana)
- Acceptance: Metrics visible, alerts configured, dashboard accessible

**Issue #133: Database Backup & Recovery**
- Verify Supabase automated backups enabled (daily backups, 7-day retention)
- Create backup restoration script (Supabase CLI-based restore)
- Document backup restoration procedure in RUNBOOK.md
- Test backup restoration (restore to test environment, verify data integrity)
- Add backup monitoring (alert if backup fails)
- Acceptance: Backups automated, restoration tested, procedure documented

**Issue #134: Performance Testing - Load Validation**
- Install K6 for load testing
- Create load test scenario (simulate 50 concurrent users)
- Test critical endpoints (project creation, vendor search, document export)
- Identify performance bottlenecks (slow queries, inefficient API calls)
- Optimize if needed (database indexes, caching)
- Acceptance: System handles 50 concurrent users, p95 latency <1s

**Issue #135: Security Audit - Vulnerability Scanning**
- Run npm audit fix (resolve all high/critical vulnerabilities)
- Verify authentication works correctly (no unauthorized access)
- Test multi-tenant isolation (users cannot access other orgs' data)
- Review environment variable usage (no secrets in code)
- Scan for common vulnerabilities (SQL injection, XSS, CSRF)
- Acceptance: Zero high/critical vulnerabilities, auth/isolation verified

**Issue #136: Documentation - User Onboarding**
- Create ONBOARDING.md (getting started guide)
- Document key features (seed management, elaboration, project creation, vendor search)
- Add screenshots/videos of core workflows
- Create troubleshooting section (common issues and fixes)
- Update README.md with quick start instructions
- Acceptance: New user can onboard using documentation alone

**Issue #137: Documentation - Disaster Recovery Runbook**
- Create RUNBOOK.md (disaster recovery procedures)
- Document backup restoration procedure (step-by-step)
- Document common failure scenarios (database down, Cloud Run crash, API timeout)
- Document recovery steps for each scenario
- Document monitoring access (Sentry, Google Cloud Monitoring)
- Acceptance: On-call engineer can recover from common failures using runbook

**Issue #138: Final Production Validation - Real-World Test**
- Plan 1 complete Erasmus+ project using production system (end-to-end)
- Validate all features work (seed → elaboration → project → programme → budget → vendor search → export)
- Measure time savings vs. manual planning (target: <6 hours vs. 40-60 hours manual)
- Document any issues found (bugs, UX friction, missing features)
- Fix critical issues before declaring production-ready
- Acceptance: Complete real project successfully, zero critical failures


### Estimated Effort
- Test infrastructure (seeding, fixtures): 6 hours
- Fix existing E2E tests: 4 hours
- New E2E tests (complete flows): 6 hours
- Production smoke tests: 2 hours
- Monitoring integration (Sentry): 3 hours
- Metrics & observability: 4 hours
- Backup & recovery: 4 hours
- Performance testing: 4 hours
- Security audit: 3 hours
- User documentation: 4 hours
- Runbook documentation: 3 hours
- Final validation (real project): 6 hours
- Total: 49 hours (~6-7 days)

## Acceptance Criteria

**Feature-Level Acceptance:**
- [ ] All E2E tests pass (seed, elaboration, project, programme, budget, export)
- [ ] Multi-tenant isolation verified (no data leaks)
- [ ] Production database migrations verified and applied
- [ ] Load testing passed (50 concurrent users)
- [ ] Security audit completed (zero high/critical vulnerabilities)
- [ ] Monitoring and logging operational
- [ ] Error tracking service integrated
- [ ] Runbook documented and reviewed
- [ ] User onboarding flow implemented
- [ ] All builds succeed with zero TypeScript errors
- [ ] No console errors in production

**Code Quality:**
- [ ] E2E tests have clear descriptions and good coverage
- [ ] Error boundaries handle all error scenarios
- [ ] Logging does not expose sensitive data
- [ ] Tests are deterministic (no flaky tests)

**Performance:**
- [ ] Page load time < 2 seconds (p95)
- [ ] API response time < 500ms (p95)
- [ ] Load test confirms system scales to 50+ users

**Documentation:**
- [ ] Runbook complete (deploy, rollback, troubleshoot)
- [ ] Testing guide complete (how to run tests locally)
- [ ] Troubleshooting guide complete (common issues + solutions)
- [ ] ADR-008: Testing Strategy documented

## Dependencies

**Blocked By:**
- Epic #001: Fix API Timeouts (✅ DEPLOYED 2026-01-16) - Background job system live
- Epic #002: Authentication Stability (✅ DEPLOYED 2026-01-16) - Clerk authentication working

**Blocks:**
- None (final epic before production launch)

**External Dependencies:**
- Staging environment (oh.153.se) must be accessible
- Production database access (for migration verification)
- Error tracking service account (Sentry or equivalent)
- Load testing infrastructure (can use local machine or CI)

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| E2E tests are flaky due to AI non-determinism | High | Medium | Use mock responses for AI in tests; test against consistent seed data |
| Load testing reveals performance bottlenecks | Medium | High | Identify bottlenecks early; optimize database queries; add caching |
| Production database schema out of sync | Low | Critical | Run migration verification immediately; test migrations on staging first |
| Beta users discover critical bugs during testing | Medium | High | Reserve 1 week buffer before deadline for bug fixes; prioritize ruthlessly |
| Onboarding flow too complex, users confused | Medium | Medium | User testing with 1-2 friendly users first; iterate on feedback |

## Testing Strategy

### Unit Tests (Vitest)
- Business logic functions (budget calculations, date formatting)
- Utility functions (data transformations, validators)
- React hooks (custom hooks isolated from components)

### Integration Tests (Vitest)
- tRPC procedures (API + database)
- Clerk authentication flow (mock Clerk API)
- Prisma database operations (use test database)
- LangChain agent logic (mock LLM responses)
- Inngest functions (background jobs)

### E2E Tests (Playwright)
- Complete user journeys (seed → project → document export)
- Multi-tenant scenarios (multiple users, multiple orgs)
- Error handling (network failures, API timeouts)
- Authentication flows (signup, login, logout)
- Document generation (verify PDF/DOCX output)

### Load Tests
- Use `k6` or `artillery` to simulate 50 concurrent users
- Test scenarios: seed creation, project generation, document export
- Measure: throughput, latency (p50/p95/p99), error rate
- Monitor: database connections, memory usage, CPU usage

### Manual Testing Checklist
- [ ] Complete full application workflow (seed → document) as new user
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on different screen sizes (desktop, tablet, mobile)
- [ ] Test slow network conditions (throttle to 3G)
- [ ] Test with ad blockers enabled
- [ ] Test with screen reader (basic accessibility)
- [ ] Review generated documents for formatting quality
- [ ] Test multi-user collaboration (two users in same org)
- [ ] Verify email notifications work (if applicable)
- [ ] Test error scenarios (invalid input, API failures)

## Notes

### Design Decisions
**Why Playwright over Cypress?**
Playwright offers better TypeScript support, faster parallel execution, and more reliable auto-waiting. It's actively maintained by Microsoft and has excellent documentation.

**Why staging environment for E2E tests?**
Testing against production would pollute real user data and risk breaking live services. Staging provides production-like environment for safe testing.

**Why manual testing still required?**
AI-generated content (project descriptions, learning objectives) requires human evaluation for semantic quality. Automated tests verify technical correctness but not educational value.

### Known Limitations
- E2E tests may be slower than unit tests (trade-off for coverage)
- AI non-determinism makes some tests harder to write (use mocks where possible)
- Load testing on local machine may not reflect production performance accurately
- Manual testing requires significant time investment from beta users

### Future Enhancements
- Implement visual regression testing (screenshot comparison)
- Add contract testing for API endpoints
- Implement mutation testing to verify test quality
- Add chaos engineering (fault injection) for resilience testing
- Implement canary deployments for safer releases
- Add performance budgets (fail builds if metrics regress)

### References
- ADR-008: Testing Strategy (to be created)
- Playwright documentation: https://playwright.dev
- Vitest documentation: https://vitest.dev
- k6 load testing: https://k6.io/docs
- Google Cloud Run best practices: https://cloud.google.com/run/docs/best-practices
