# Epic: Authentication System Stability

**Epic ID:** 002
**Created:** 2026-01-16
**Status:** Ready
**Complexity Level:** 1

## Project Context

- **Project:** OpenHorizon
- **Repository:** https://github.com/gpt153/openhorizon.cc
- **Tech Stack:** Next.js 16, React 19, TypeScript, Clerk Authentication, PostgreSQL (Supabase), Prisma
- **Related Epics:** Blocks Epic 003 (Production Readiness)
- **Workspace:** `/home/samuel/.archon/workspaces/openhorizon.cc/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/openhorizon.cc/`

## Business Context

### Problem Statement

Authentication is currently completely disabled in production to avoid Clerk integration errors. The middleware has been stripped to a no-op function with the comment "AUTH COMPLETELY DISABLED FOR MVP TESTING" to bypass Clerk key validation issues. This blocks proper user management, organization isolation, and secure access control.

Users cannot properly sign up, log in, or access protected features. While this allowed rapid MVP testing, it's now a critical blocker for production readiness and real-world usage planned for February 2026.

### User Value

- Users can securely sign up and log in to OpenHorizon
- Organizations can properly isolate their project data
- Protected routes ensure only authenticated users access sensitive features
- Proper user management enables team collaboration
- System meets security standards for handling Erasmus+ grant application data

### Success Metrics

- Sign-up flow completes without errors (target: 100% success rate)
- Login flow completes without errors (target: 100% success rate)
- Clerk authentication middleware properly protects routes
- Zero 500 errors on auth endpoints in production
- Users can access application immediately after registration

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Clerk integration properly configured with valid API keys
- [ ] Middleware re-enabled to protect authenticated routes
- [ ] Sign-up endpoint functional (no 500 errors)
- [ ] Login endpoint functional (no 500 errors)
- [ ] User can register, verify email, and access dashboard
- [ ] Organization creation works on first user sign-up
- [ ] Multi-tenant data isolation enforced via Clerk organizationId

**SHOULD HAVE:**
- [ ] Proper error messages for auth failures (user-friendly, not technical errors)
- [ ] Loading states during auth operations
- [ ] Redirect logic after successful login
- [ ] Logout functionality works correctly
- [ ] Session persistence across page refreshes

**COULD HAVE:**
- [ ] Social login providers (Google, GitHub) if Clerk supports
- [ ] Custom sign-up fields (organization name during registration)
- [ ] Email verification reminder system

**WON'T HAVE (this iteration):**
- Password reset flow (can defer to Clerk's built-in system)
- Two-factor authentication (not critical for MVP)
- Role-based permissions within organizations (basic auth sufficient for now)

### Non-Functional Requirements

**Security:**
- Clerk webhook signature verification for user events
- HTTPS-only in production
- Secure session token storage (httpOnly cookies)
- Organization-scoped data access enforced at database level

**Performance:**
- Authentication check latency < 100ms
- No cold start delays for auth middleware
- Minimal impact on page load times

**Reliability:**
- 99.9% uptime for auth endpoints
- Graceful degradation if Clerk service temporarily unavailable
- Clear error messages for configuration issues

## Architecture

### Technical Approach

**Pattern:** Clerk-managed authentication with Next.js middleware
**Integration:** Clerk Next.js SDK with built-in middleware patterns
**Organization Model:** Clerk organizations for multi-tenant isolation

### Current State Analysis

**File:** `/home/samuel/.archon/workspaces/openhorizon.cc/app/src/middleware.ts`

Current middleware is completely disabled:
```typescript
// AUTH COMPLETELY DISABLED FOR MVP TESTING
// Clerk middleware removed to avoid key validation errors

export function middleware(request: NextRequest) {
  // No-op middleware - all routes accessible without authentication
  return NextResponse.next()
}
```

**Sign-up page exists:** `/home/samuel/.archon/workspaces/openhorizon.cc/app/src/app/sign-up/[[...sign-up]]/page.tsx`
- Uses Clerk's `<SignUp />` component
- Basic implementation present

**Environment variables:** Missing or incorrect Clerk API keys (`.env.example` shows only `RESEND_API_KEY`)

### Root Cause Hypothesis

Based on codebase research:

1. **Missing/Invalid Clerk API Keys**: Environment variables `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` not configured
2. **Middleware Configuration**: Middleware was disabled to bypass errors rather than fixing root cause
3. **Webhook Setup**: Clerk webhooks may not be configured for user.created events
4. **Organization Creation**: First user sign-up may not automatically create organization

### Investigation Steps

1. **Verify Clerk Dashboard Configuration**
   - Check if OpenHorizon app exists in Clerk dashboard
   - Verify API keys are generated and valid
   - Check allowed domains/redirect URLs
   - Review webhook endpoints configuration

2. **Check Environment Variables**
   - Audit `.env.local` for required Clerk variables
   - Verify keys match Clerk dashboard
   - Check if keys are properly loaded in production (Cloud Run)

3. **Test Clerk Middleware**
   - Re-enable Clerk's `clerkMiddleware()` helper
   - Test locally with valid keys
   - Identify specific error that caused original disable

4. **Review Sign-up Flow**
   - Test registration endpoint with valid keys
   - Check if user record created in Clerk
   - Verify organization creation logic
   - Test redirect after successful sign-up

5. **Check Webhook Integration**
   - Verify webhook secret configured
   - Check if webhook endpoint exists (`/api/webhooks/clerk`)
   - Test webhook signature verification
   - Confirm user.created event triggers database record

### Integration Points

**Clerk Dashboard:**
- App configuration and API keys
- Webhook configuration
- Allowed domains and redirect URLs

**Database (Supabase PostgreSQL):**
- No separate User table (Clerk manages users)
- Organization table references Clerk organizationId
- Multi-tenant isolation via organizationId foreign keys

**Next.js Application:**
- Middleware protects routes
- API routes use `auth()` helper for auth checks
- Frontend uses `useAuth()`, `useUser()` hooks

### Files to Create/Modify

```
app/
├── src/
│   ├── middleware.ts                 # MODIFY - Re-enable Clerk middleware
│   ├── app/
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── clerk/
│   │   │           └── route.ts      # CREATE - Webhook handler for user events
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx          # VERIFY - Ensure proper configuration
│   │   └── sign-in/
│   │       └── [[...sign-in]]/
│   │           └── page.tsx          # VERIFY - Ensure proper configuration
│   └── lib/
│       └── clerk-utils.ts            # CREATE - Helper functions for Clerk operations
├── .env.local                         # MODIFY - Add Clerk API keys
└── .env.example                       # MODIFY - Document required Clerk variables
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue #XX: Configure Clerk API Keys and Environment Variables**
- Obtain API keys from Clerk dashboard
- Add keys to `.env.local` (development)
- Configure keys in Cloud Run environment (production)
- Update `.env.example` with required variables
- Acceptance: `process.env.CLERK_SECRET_KEY` loads correctly

**Issue #XX: Re-enable Clerk Middleware**
- Replace no-op middleware with `clerkMiddleware()`
- Configure protected routes pattern
- Test locally with valid credentials
- Verify unauthenticated users redirect to sign-in
- Acceptance: Middleware runs without errors, protects `/dashboard`, `/projects`, `/seeds`

**Issue #XX: Create Clerk Webhook Handler**
- Create `/api/webhooks/clerk/route.ts`
- Implement signature verification using `@clerk/nextjs`
- Handle `user.created` event (create organization if first user)
- Handle `organization.created`, `organizationMembership.created` events
- Add error logging for failed webhook processing
- Acceptance: Webhook receives events, signature verified, database updated

**Issue #XX: Test Sign-up Flow End-to-End**
- Manual test: Register new user with email
- Verify email verification email sent
- Complete verification and access dashboard
- Verify organization created in database
- Test with multiple users joining same organization
- Acceptance: Full sign-up flow completes without errors

**Issue #XX: Test Sign-in Flow End-to-End**
- Manual test: Sign in with registered credentials
- Verify redirect to dashboard after login
- Test "remember me" functionality
- Test logout and session clearing
- Acceptance: Login/logout cycle works correctly

**Issue #XX: Add Error Handling and User Feedback**
- Add loading states to sign-up/sign-in pages
- Display user-friendly error messages for auth failures
- Add toast notifications for successful login
- Handle edge cases (email already exists, invalid password)
- Acceptance: Users see clear feedback for all auth states

**Issue #XX: E2E Tests for Authentication**
- Playwright test: Sign up new user
- Playwright test: Sign in existing user
- Playwright test: Access protected route without auth (redirects)
- Playwright test: Access protected route with auth (allowed)
- Playwright test: Logout clears session
- Acceptance: All auth E2E tests pass

### Estimated Effort

- Clerk configuration: 1 hour
- Middleware re-enablement: 1 hour
- Webhook handler: 2 hours
- End-to-end testing: 2 hours
- Error handling polish: 1 hour
- E2E test suite: 2 hours
- **Total: 9 hours (1-2 days)**

## Acceptance Criteria

### Feature-Level Acceptance

- [ ] User can visit `/sign-up` and register with email/password
- [ ] Email verification email sent successfully
- [ ] User can complete verification and access dashboard
- [ ] User can visit `/sign-in` and log in with credentials
- [ ] Protected routes (`/dashboard`, `/projects`, `/seeds`) require authentication
- [ ] Unauthenticated users redirect to `/sign-in`
- [ ] User can log out and session clears correctly
- [ ] Organization created automatically on first user sign-up
- [ ] Multiple users can join same organization
- [ ] Clerk webhook receives and processes user events
- [ ] Zero 500 errors on sign-up endpoint
- [ ] Zero 500 errors on sign-in endpoint

### Code Quality

- [ ] Clerk API keys properly loaded from environment
- [ ] Webhook signature verification implemented
- [ ] Error handling covers all edge cases
- [ ] No hardcoded secrets in codebase
- [ ] Middleware configuration uses Clerk best practices
- [ ] TypeScript types match Clerk SDK types

### Testing

- [ ] Manual test: Full sign-up flow works
- [ ] Manual test: Full sign-in flow works
- [ ] Manual test: Protected route enforcement works
- [ ] Playwright E2E tests pass for all auth flows
- [ ] Test with valid credentials (success case)
- [ ] Test with invalid credentials (error case)
- [ ] Test webhook handler with sample events

### Documentation

- [ ] `.env.example` documents all Clerk variables
- [ ] README updated with Clerk setup instructions
- [ ] Webhook endpoint documented in API docs
- [ ] ADR created if alternative auth approaches considered

## Dependencies

**Blocked By:**
- None (can proceed immediately)

**Blocks:**
- Epic #003: Production Readiness & Testing (can't test without auth)

**External Dependencies:**
- Clerk account and app configured
- Clerk API keys generated
- Webhook endpoint accessible from Clerk servers (production only)

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Clerk API keys don't exist | Medium | High | Check Clerk dashboard, create new app if needed |
| Webhook signature verification fails | Medium | Medium | Use Clerk's built-in verification helper, test with sample events |
| Organization logic breaks multi-tenancy | Low | High | Test with multiple users/orgs, verify database queries include organizationId filter |
| Email verification delays testing | Medium | Low | Use Clerk test mode for development, disable email verification temporarily |

## Testing Strategy

### Manual Testing Checklist

**Sign-up Flow:**
- [ ] Navigate to `/sign-up`
- [ ] Enter valid email and password
- [ ] Submit form (no 500 error)
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Redirect to dashboard
- [ ] Verify organization created in database

**Sign-in Flow:**
- [ ] Navigate to `/sign-in`
- [ ] Enter registered email and password
- [ ] Submit form (no errors)
- [ ] Redirect to dashboard
- [ ] Verify session persists on refresh

**Protected Routes:**
- [ ] Visit `/dashboard` without auth → redirects to `/sign-in`
- [ ] Visit `/projects` without auth → redirects to `/sign-in`
- [ ] Visit `/seeds` without auth → redirects to `/sign-in`
- [ ] Log in, then visit protected routes → access granted

**Logout:**
- [ ] Click logout button
- [ ] Session cleared
- [ ] Redirect to home or sign-in page
- [ ] Attempt to access protected route → redirects to `/sign-in`

### E2E Test Scenarios

```typescript
// Example Playwright test structure

test.describe('Authentication', () => {
  test('sign up new user', async ({ page }) => {
    await page.goto('/sign-up')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')
    // Expect redirect or success message
    await expect(page).toHaveURL(/dashboard/)
  })

  test('sign in existing user', async ({ page }) => {
    await page.goto('/sign-in')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/)
  })

  test('protected route redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/sign-in/)
  })
})
```

## Notes

### Design Decisions

**Why Clerk over Custom Auth?**
- Already integrated in codebase (dependency exists)
- Built-in multi-tenant organization support
- Reduces maintenance burden (security updates handled by Clerk)
- Professional authentication UX out of the box
- Webhook system for extensibility

**Why Re-enable Middleware (Not Defer)?**
- Authentication is foundational for production
- Multi-tenant data isolation requires auth enforcement
- February 2026 deadline needs working system
- Deferring increases technical debt

### Known Limitations

- Relies on third-party service (Clerk) for critical functionality
- Email verification required (can delay onboarding)
- Limited customization of auth UI without upgrading Clerk plan
- Webhook delivery not guaranteed (need to handle missed events)

### Future Enhancements

- Social login providers (Google, GitHub)
- Single Sign-On (SSO) for enterprise customers
- Two-factor authentication for sensitive operations
- Custom user profile fields
- Advanced role-based permissions within organizations
- Magic link passwordless authentication

### References

- Clerk Next.js Documentation: https://clerk.com/docs/quickstarts/nextjs
- Clerk Webhooks Guide: https://clerk.com/docs/integrations/webhooks
- Clerk Organizations: https://clerk.com/docs/organizations/overview
- ADR (to be created): Clerk vs Custom Auth decision
