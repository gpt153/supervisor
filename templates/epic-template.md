# Epic: [Feature Name]

**Epic ID:** XXX
**Created:** YYYY-MM-DD
**Status:** Draft | Active | In Progress | Completed | Cancelled
**Complexity Level:** 0 | 1 | 2 | 3 | 4

## Project Context

- **Project:** [project-name]
- **Repository:** [GitHub URL]
- **Tech Stack:** [Node.js, TypeScript, React, PostgreSQL, etc.]
- **Related Epics:** [dependencies, if any]
- **Workspace:** `/home/samuel/.archon/workspaces/[project]/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/[project]/`

## Business Context

### Problem Statement
[What problem does this feature solve? Why do users need this?]

### User Value
[What value does this provide? How does it improve the user experience?]

### Success Metrics
[How will we measure if this feature is successful?]
- Metric 1: [e.g., "User sign-up conversion increases by 20%"]
- Metric 2: [e.g., "Authentication latency < 200ms"]

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Requirement 1 - [Critical core functionality]
- [ ] Requirement 2 - [Non-negotiable feature]

**SHOULD HAVE:**
- [ ] Requirement 3 - [Important but not critical]
- [ ] Requirement 4 - [Valuable addition]

**COULD HAVE:**
- [ ] Requirement 5 - [Nice to have if time permits]

**WON'T HAVE (this iteration):**
- Feature X - [Explicitly out of scope, deferred to v2]
- Feature Y - [Decided against, see ADR-XXX]

### Non-Functional Requirements

**Performance:**
- Response time: [e.g., "< 200ms for API calls"]
- Throughput: [e.g., "Handle 1000 concurrent users"]

**Security:**
- Authentication: [e.g., "JWT with 1-hour expiry"]
- Authorization: [e.g., "Role-based access control"]
- Data protection: [e.g., "Encrypt sensitive fields at rest"]

**Accessibility:**
- Standards: [e.g., "WCAG 2.1 Level AA compliance"]
- Keyboard navigation: [Required]
- Screen reader support: [Required]

**Scalability:**
- [e.g., "Database indexes on query fields"]
- [e.g., "Stateless API for horizontal scaling"]

## Architecture

### Technical Approach
**Pattern:** [e.g., "Repository pattern for data access"]
**State Management:** [e.g., "React Context API"]
**API Style:** [e.g., "RESTful endpoints"]

### Integration Points
- **Database:** [Tables, migrations needed]
- **External APIs:** [Third-party services]
- **Internal Services:** [Microservices, modules]

### Data Flow
```
[Brief description or ASCII diagram]
User Input → Frontend Validation → API Request →
Backend Processing → Database Query → Response
```

### Key Technical Decisions
- **Decision 1:** [Choice made] (see ADR-XXX)
- **Decision 2:** [Choice made] (see ADR-XXX)

### Files to Create/Modify
```
src/
├── api/
│   ├── auth.ts           # NEW - Authentication endpoints
│   └── middleware/
│       └── auth.ts       # NEW - JWT validation middleware
├── db/
│   ├── queries/
│   │   └── users.ts      # NEW - User CRUD operations
│   └── migrations/
│       └── 008_users.sql # NEW - Users table schema
├── types/
│   └── auth.ts           # NEW - Auth types
└── utils/
    └── jwt.ts            # NEW - JWT utilities

tests/
└── auth.test.ts          # NEW - Auth tests
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue #XX: Backend - User table migration**
- Create users table schema
- Add email/password fields
- Create indexes
- Acceptance: Migration runs successfully

**Issue #XX: Backend - Authentication API**
- `/auth/signup` endpoint
- `/auth/login` endpoint
- JWT token generation
- Password hashing (bcrypt)
- Acceptance: All endpoints return 200 with valid data

**Issue #XX: Frontend - Login form**
- Login page component
- Form validation
- API integration
- Error handling
- Acceptance: User can log in and see dashboard

**Issue #XX: Tests - E2E authentication flow**
- Playwright tests for signup/login
- Token storage validation
- Protected route access
- Acceptance: All tests pass

**Issue #XX: Documentation**
- API endpoint documentation
- Authentication flow diagram
- Environment variables guide
- Acceptance: README updated

### Estimated Effort
- Backend: [X hours]
- Frontend: [X hours]
- Tests: [X hours]
- Total: [X hours]

## Acceptance Criteria

**Feature-Level Acceptance:**
- [ ] User can sign up with email/password
- [ ] User can log in and receive JWT token
- [ ] Protected routes require authentication
- [ ] Invalid credentials show error message
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Build succeeds with zero TypeScript errors
- [ ] No console errors in browser
- [ ] Lighthouse accessibility score > 90

**Code Quality:**
- [ ] Type-safe (no `any` types)
- [ ] No security vulnerabilities (npm audit)
- [ ] No mocks in production code
- [ ] Tests cover critical paths (>80% coverage)

**Documentation:**
- [ ] API endpoints documented
- [ ] Environment variables listed in README
- [ ] Architecture decision recorded (if applicable)

## Dependencies

**Blocked By:**
- Epic #XXX: Database setup must be complete

**Blocks:**
- Epic #XXX: User profile feature needs authentication
- Epic #XXX: Admin dashboard requires auth middleware

**External Dependencies:**
- None | [Third-party service setup needed]

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Password reset complexity | Medium | High | Start with simple email-based reset |
| OAuth integration delays | Low | Medium | Implement email/password first |

## Testing Strategy

### Unit Tests
- JWT token generation/validation
- Password hashing
- Input validation

### Integration Tests
- Signup flow (API + database)
- Login flow (API + database)
- Token refresh

### E2E Tests
- Complete user signup journey
- Complete user login journey
- Protected route access

### Manual Testing Checklist
- [ ] Sign up with valid email/password
- [ ] Sign up with invalid email (shows error)
- [ ] Login with correct credentials
- [ ] Login with wrong password (shows error)
- [ ] Access protected route without token (redirects)
- [ ] Token expires after 1 hour (re-login required)

## Notes

### Design Decisions
[Why did we choose this approach? What alternatives were considered?]

### Known Limitations
[What doesn't this feature do? What's deliberately out of scope?]

### Future Enhancements
[What could we add later?]
- OAuth providers (Google, GitHub)
- Two-factor authentication
- Passwordless login (magic links)

### References
- ADR-XXX: JWT vs Session authentication
- PRD: [Link to PRD document]
- Architecture doc: [Link to architecture doc]
