# Epic Sharding (90% Token Reduction)

## The Problem

**Giving SCAR entire codebase causes:**
- Context overload (50K+ tokens)
- Pattern mixing (AI confuses different parts)
- Hallucinations (makes up non-existent APIs)
- Slow responses (processing overhead)

## The Solution: Epic Sharding

**Self-contained epic files** that provide complete context in 2-5KB.

**Benefits:**
- 90% token reduction (5K vs 50K+)
- SCAR reads ONLY the epic (focused context)
- No codebase search needed
- Clear handoff to SCAR
- Easy validation (all requirements in one place)

## What an Epic Contains

**Complete project context:**
1. **Project Identity**
   - Repository URL
   - Tech stack
   - Architecture patterns
   - Related epics

2. **Business Context**
   - Problem statement
   - User value
   - Success metrics

3. **Complete Requirements**
   - Functional requirements (MoSCoW)
   - Non-functional requirements (performance, security, accessibility)
   - Acceptance criteria (validation checklist)

4. **Technical Approach**
   - Architectural pattern to use
   - Files to create/modify (specific paths)
   - Key technical decisions (ADR links)
   - Data flow overview

5. **Implementation Tasks**
   - Breakdown into GitHub issues
   - Each issue = 30 min to 4 hours
   - Dependencies identified

6. **Acceptance Criteria**
   - Feature-level validation
   - Code quality checks
   - Testing requirements
   - Documentation needs

## Epic File Structure

**Template:** `/home/samuel/supervisor/templates/epic-template.md`

**Key sections SCAR needs:**

```markdown
# Epic: User Authentication

## Project Context
- **Project:** consilio
- **Repository:** https://github.com/gpt153/consilio
- **Tech Stack:** Node.js 20, TypeScript, Express, PostgreSQL 18
- **Related Epics:** None (foundational)
- **Workspace:** /home/samuel/.archon/workspaces/consilio/

## Business Context
### Problem Statement
Users need secure authentication to access protected features.

### User Value
- Secure account creation
- Persistent sessions
- Access control

### Success Metrics
- 100% of users can sign up
- < 200ms authentication response time
- Zero security vulnerabilities

## Requirements

### Functional Requirements (MoSCoW)
**MUST HAVE:**
- [ ] User can sign up with email/password
- [ ] User can log in and receive JWT token
- [ ] Protected routes require authentication

**SHOULD HAVE:**
- [ ] Password strength validation
- [ ] Password reset via email

**COULD HAVE:**
- [ ] Social login (Google, GitHub)

**WON'T HAVE (this iteration):**
- OAuth provider integration (deferred to v2)

### Non-Functional Requirements
- Performance: < 200ms API response time
- Security: JWT with 1-hour expiry, bcrypt hashing
- Accessibility: WCAG 2.1 Level AA for login forms

## Architecture

### Technical Approach
- **Pattern:** Repository pattern for data access
- **Authentication:** JWT tokens (see ADR-002)
- **Database:** PostgreSQL users table (see ADR-001)

### Key Decisions
- **Decision 1:** JWT authentication (see ADR-002)
  - Rationale: Stateless, scales horizontally
- **Decision 2:** bcrypt for password hashing
  - Rationale: Industry standard, secure

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
```

## Implementation Tasks

### Issue Breakdown

**Issue #123: Backend - Users table migration**
- Create users table with email, password_hash, created_at
- Add indexes on email (unique)
- Acceptance: Migration runs successfully

**Issue #124: Backend - Authentication API**
- POST /auth/signup endpoint
- POST /auth/login endpoint
- JWT token generation
- Password hashing (bcrypt)
- Acceptance: Endpoints return 200, tests pass

**Issue #125: Frontend - Login form**
- Login page component
- Form validation
- API integration
- Error handling
- Acceptance: User can log in and see dashboard

## Acceptance Criteria

**Feature-Level:**
- [ ] User can sign up with email/password
- [ ] User can log in and receive JWT token
- [ ] Protected routes redirect to login when unauthenticated
- [ ] All unit tests pass
- [ ] Build succeeds with zero TypeScript errors
- [ ] No security vulnerabilities (npm audit clean)
- [ ] Lighthouse accessibility score > 90

**Code Quality:**
- [ ] Type-safe (no `any` types without justification)
- [ ] No mocks in production code
- [ ] Tests cover critical paths (>80% coverage)
```

## How SCAR Uses the Epic

1. **Reads epic file** (complete context in 2-5KB)
2. **Understands requirements** (MoSCoW prioritization)
3. **Follows technical approach** (patterns, ADR links)
4. **Creates specified files** (exact paths provided)
5. **Validates against acceptance criteria** (checklist)

**SCAR never needs to:**
- ❌ Search the entire codebase
- ❌ Guess which files to create
- ❌ Figure out technical approach
- ❌ Ask clarifying questions

## Epic Naming Convention

```
.bmad/epics/NNN-feature-name.md

NNN = Sequential number (001, 002, 003, ...)
feature-name = Kebab-case description
```

**Examples:**
- `001-user-authentication.md`
- `002-payment-integration.md`
- `003-admin-dashboard.md`

## Epic Lifecycle

1. **Created** - PM subagent creates epic during planning
2. **Referenced** - Attached to GitHub issue for SCAR
3. **Updated** - Modified if requirements change (never regenerate)
4. **Linked** - Other epics reference dependencies
5. **Archived** - Marked complete in workflow-status.yaml

## Token Comparison

**Without epic sharding (old way):**
```
Entire codebase context: 50,000+ tokens
SCAR processes everything
Confuses patterns between features
Hallucinates non-existent APIs
```

**With epic sharding (BMAD way):**
```
Single epic file: 2,000-5,000 tokens
SCAR processes only relevant context
Focused implementation
No hallucinations
```

**90% token reduction = 10x more features SCAR can handle!**
