# Epic: Authentication System Stability

**Epic ID:** 002
**Created:** 2026-01-15
**Status:** Draft
**Complexity Level:** 1

## Project Context

- **Project:** openhorizon
- **Repository:** https://github.com/gpt153/openhorizon.cc
- **Tech Stack:** Next.js 16, React 19, TypeScript, Clerk Authentication, tRPC, PostgreSQL
- **Related Epics:** Blocks Epic #003 (Production Readiness)
- **Workspace:** `/home/samuel/.archon/workspaces/openhorizon.cc/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/openhorizon.cc/`

## Business Context

### Problem Statement
The user registration endpoint is returning 500 Internal Server Error responses, preventing new users from signing up for OpenHorizon. This completely blocks user acquisition and beta testing, which is critical for the February 2026 production deadline. Without the ability to onboard new users, we cannot validate the platform with real Erasmus+ organizations.

### User Value
Users need to:
- Create accounts to start using OpenHorizon
- Log in reliably without unexpected errors
- Access their organizations and projects
- Trust that the authentication system is stable and secure

Currently, new users encounter a broken signup flow, creating a negative first impression and preventing any platform adoption.

### Success Metrics
- Metric 1: User registration success rate increases from ~0% (failing) to 99.9%
- Metric 2: Authentication endpoint latency < 300ms (p95)
- Metric 3: Zero authentication-related support requests from users
- Metric 4: Successful onboarding of 3-5 beta users in January 2026

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Debug and fix 500 error on registration endpoint
- [ ] Verify Clerk integration configuration (API keys, webhooks)
- [ ] Ensure user records properly created in database on signup
- [ ] Verify organization assignment on first signup
- [ ] Test login flow after registration (end-to-end)
- [ ] Add comprehensive error logging for authentication failures

**SHOULD HAVE:**
- [ ] Implement retry logic for transient Clerk API failures
- [ ] Add health check endpoint for Clerk integration status
- [ ] Improve error messages shown to users (avoid generic "Something went wrong")
- [ ] Add monitoring/alerts for authentication failure spikes

**COULD HAVE:**
- [ ] Add rate limiting to prevent abuse of signup endpoint
- [ ] Implement email verification flow (if not already present)
- [ ] Add user session analytics (track login frequency, session duration)

**WON'T HAVE (this iteration):**
- OAuth provider integrations (Google, GitHub) - Deferred to Phase 2
- Two-factor authentication - Not required for MVP
- Magic link passwordless login - Out of scope for initial launch

### Non-Functional Requirements

**Reliability:**
- Availability: 99.9% uptime for authentication endpoints
- Error recovery: Graceful handling of Clerk API outages with user-friendly messages
- Data consistency: User + organization records always in sync

**Performance:**
- Response time: Registration < 1 second (p95)
- Response time: Login < 300ms (p95)
- Token validation: < 50ms

**Security:**
- Password handling: Delegated to Clerk (no plaintext passwords in our DB)
- Session management: Clerk JWT tokens with appropriate expiry
- CSRF protection: Enabled on all authentication endpoints
- Rate limiting: Max 5 failed login attempts per 15 minutes per IP

**Observability:**
- Logging: All authentication events logged (signup, login, logout, failures)
- Monitoring: Track success rates, latency, error types
- Alerts: Notify if authentication success rate drops below 95%

## Architecture

### Technical Approach
**Pattern:** Clerk-managed authentication with Next.js middleware for route protection
**State Management:** Clerk React hooks (`useUser`, `useAuth`) + React Query for organization data
**API Style:** tRPC procedures for user/organization management, Clerk handles auth

### Integration Points
- **Clerk:** Primary authentication provider (signup, login, session management)
- **Database:** User and UserOrganizationMembership tables synchronized with Clerk user records
- **Middleware:** Next.js middleware validates Clerk JWT on protected routes
- **tRPC Context:** User ID extracted from Clerk session, passed to all procedures

### Data Flow
```
User submits signup form
  ↓
Frontend: Clerk signup component
  ↓
Clerk API: Create user account
  ↓
Clerk webhook: Notify OpenHorizon of new user (user.created event)
  ↓
Backend: Create User record in database
  ↓
Backend: Create Organization (if first user) or prompt to join existing
  ↓
Backend: Create UserOrganizationMembership record
  ↓
Redirect to dashboard with active session
```

### Key Technical Decisions
- **Decision 1:** Use Clerk (not custom auth) for faster development and better security (see ADR-007)
- **Decision 2:** Sync user data to database via webhooks (not on-demand) for reliability (see ADR-007)
- **Decision 3:** JWT tokens (not sessions) for stateless authentication in Cloud Run (see ADR-007)

### Files to Create/Modify
```
app/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── webhooks/
│   │           └── clerk/
│   │               └── route.ts           # REVIEW - Verify webhook handling
│   ├── middleware.ts                      # REVIEW - Verify Clerk middleware config
│   ├── server/
│   │   └── routers/
│   │       ├── users.ts                   # REVIEW - User CRUD operations
│   │       └── organizations.ts           # REVIEW - Org membership logic
│   └── lib/
│       └── clerk.ts                       # REVIEW - Clerk client config
├── .env.local                             # VERIFY - Clerk API keys set correctly
└── .env.production                        # VERIFY - Production Clerk keys

tests/
└── auth.test.ts                           # ADD - Authentication E2E tests
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue #1: Debug - Investigate 500 error root cause**
- Enable detailed error logging in registration endpoint
- Reproduce error locally or in staging
- Check Clerk dashboard for failed API calls
- Check database logs for failed inserts
- Identify exact error message and stack trace
- Acceptance: Root cause identified and documented

**Issue #2: Backend - Fix identified registration issue**
- Apply fix based on root cause (could be: missing env var, webhook config, database constraint, API version mismatch)
- Add error handling to prevent 500 errors (return 400/422 for user errors)
- Add validation for required fields before Clerk API call
- Acceptance: Registration succeeds locally and in staging

**Issue #3: Backend - Verify Clerk webhook configuration**
- Check webhook URL is correctly set in Clerk dashboard
- Verify webhook secret is in environment variables
- Test webhook signature validation
- Ensure `user.created`, `user.updated`, `user.deleted` events are handled
- Add logging for all webhook events
- Acceptance: Webhooks fire successfully and create DB records

**Issue #4: Backend - Improve error handling and logging**
- Wrap all Clerk API calls in try-catch with detailed error logging
- Log user ID, organization ID, timestamp for all auth events
- Add Sentry or similar for error tracking (if not already present)
- Return user-friendly error messages (not raw exceptions)
- Acceptance: All errors logged with sufficient context for debugging

**Issue #5: Backend - Add health check for Clerk integration**
- Create `/api/health/clerk` endpoint
- Check Clerk API reachability
- Check webhook configuration status
- Return 200 if healthy, 503 if degraded
- Acceptance: Health check returns correct status

**Issue #6: Tests - E2E authentication flow**
- Playwright test: Sign up new user → verify dashboard access
- Playwright test: Log in existing user → verify session persists
- Playwright test: Access protected route without auth → verify redirect
- Playwright test: Invalid credentials → verify error message
- Integration test: Clerk webhook → verify DB record creation
- Acceptance: All tests pass

**Issue #7: Monitoring - Add authentication metrics**
- Track signup success rate (target: >99%)
- Track login success rate (target: >99%)
- Track authentication latency (p50, p95, p99)
- Add alert for success rate < 95%
- Acceptance: Metrics visible in monitoring dashboard

**Issue #8: Documentation - Update environment setup guide**
- Document required Clerk environment variables
- Document webhook configuration steps
- Add troubleshooting section for common auth issues
- Acceptance: README has clear Clerk setup instructions

### Estimated Effort
- Debug & root cause analysis: 2 hours
- Fix implementation: 2 hours
- Webhook verification: 1 hour
- Error handling improvements: 2 hours
- Health check endpoint: 1 hour
- E2E tests: 3 hours
- Monitoring setup: 2 hours
- Documentation: 1 hour
- Total: 14 hours (~2 days)

## Acceptance Criteria

**Feature-Level Acceptance:**
- [ ] Users can sign up successfully without 500 errors
- [ ] Users can log in successfully after signup
- [ ] Protected routes require authentication
- [ ] Logout works correctly
- [ ] Organization assignment happens on first signup
- [ ] User records properly synced between Clerk and database
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass (Playwright)
- [ ] Build succeeds with zero TypeScript errors
- [ ] No console errors in browser

**Code Quality:**
- [ ] All Clerk API calls have proper error handling
- [ ] No hardcoded secrets (use environment variables)
- [ ] Type-safe user and auth types
- [ ] Webhook signature validation enabled

**Security:**
- [ ] Clerk webhook signature verified
- [ ] No sensitive data logged (passwords, tokens)
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints (if not present, add to Should Have)

**Performance:**
- [ ] Registration completes in < 1 second
- [ ] Login completes in < 300ms
- [ ] Health check responds in < 100ms

**Documentation:**
- [ ] Environment variables documented in README
- [ ] Clerk webhook setup documented
- [ ] Troubleshooting guide for auth issues
- [ ] ADR-007: Authentication Strategy (to be created)

## Dependencies

**Blocked By:**
- None (can start immediately)

**Blocks:**
- Epic #003: Production Readiness & Testing (critical bug must be fixed first)

**External Dependencies:**
- Clerk service must be operational
- Clerk API keys must be valid for production
- Webhook endpoint must be publicly accessible (Cloud Run URL)

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Root cause is complex Clerk integration issue | Medium | High | Reach out to Clerk support if needed; consider fallback to simpler auth if insurmountable |
| Webhooks fail in production due to firewall/CORS | Low | High | Test webhooks in production-like environment; add webhook retry mechanism |
| Environment variables missing in production | Low | Critical | Audit all required env vars; add startup validation that checks for required keys |
| Database sync issues (Clerk vs. our DB out of sync) | Medium | Medium | Add reconciliation script to detect mismatches; implement idempotent webhook handlers |

## Testing Strategy

### Unit Tests
- User creation logic
- Organization assignment logic
- Webhook payload parsing and validation
- Error handling branches

### Integration Tests
- Clerk webhook → database record creation
- User signup → organization creation
- User signup → join existing organization
- Webhook idempotency (duplicate events handled correctly)

### E2E Tests (Playwright)
- Complete signup journey (form → success → dashboard)
- Complete login journey (form → success → dashboard)
- Protected route access without auth (redirect to login)
- Logout and verify session cleared
- Invalid credentials show appropriate error

### Manual Testing Checklist
- [ ] Sign up with valid email → verify dashboard access
- [ ] Sign up with existing email → verify error message
- [ ] Log in with correct credentials → verify success
- [ ] Log in with wrong password → verify error message
- [ ] Access /dashboard without login → verify redirect to /sign-in
- [ ] Check Clerk dashboard for newly created user
- [ ] Check database for User and UserOrganizationMembership records
- [ ] Trigger webhook manually from Clerk dashboard → verify DB update
- [ ] Log out → verify session cleared → cannot access protected routes

## Notes

### Design Decisions
**Why Clerk instead of custom authentication?**
Building secure authentication from scratch is time-consuming and error-prone. Clerk provides enterprise-grade security, handles edge cases (password reset, email verification), and allows faster development. For a solo developer with a tight deadline, this is the pragmatic choice.

**Why webhooks for user sync?**
Webhooks ensure our database stays in sync with Clerk even if our API is temporarily down. They provide a reliable, event-driven integration that doesn't depend on users immediately accessing our platform after signup.

**Why not cache user data client-side?**
Security. User data should always be fetched from the server with a valid session. Caching could lead to stale data or security vulnerabilities if not carefully managed.

### Known Limitations
- Dependent on Clerk service availability (external SaaS dependency)
- Webhook delivery can have delays (typically <1 second, but not guaranteed)
- No offline authentication support (requires internet connection)

### Future Enhancements
- Add OAuth providers (Google, GitHub, Microsoft) for easier signup
- Implement two-factor authentication (2FA) for high-security organizations
- Add magic link passwordless login
- Implement session analytics (track login patterns, detect suspicious activity)
- Add admin tools for managing user accounts (suspend, delete, role changes)

### References
- ADR-007: Authentication Strategy (Clerk) - to be created
- Clerk documentation: https://clerk.com/docs
- Clerk webhook reference: https://clerk.com/docs/integrations/webhooks
- Next.js middleware docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
