# Consilio Epics

**Purpose:** Self-contained story files that provide complete implementation context for SCAR.

---

## What is an Epic?

An **epic** is a comprehensive feature specification that contains EVERYTHING needed to implement a feature:

- Business context (why this matters)
- User stories (what users need)
- Technical approach (how to implement)
- File structure (what to create/modify)
- Acceptance criteria (how to verify)
- Dependencies (what blocks/is blocked by this)

**Key Principle:** SCAR should be able to implement the feature using ONLY the epic file, without asking clarifying questions.

---

## Epic Structure

Each epic follows this template:

1. **Metadata** - ID, complexity level, status
2. **Business Context** - Problem statement, user value, success metrics
3. **Requirements (MoSCoW)** - Must/Should/Could/Won't have
4. **Architecture** - Technical approach, data flow, integration points
5. **Implementation Tasks** - Breakdown into GitHub issues
6. **Acceptance Criteria** - Feature-level and code quality checks
7. **Dependencies** - What blocks this, what this blocks
8. **Testing Strategy** - Unit, integration, E2E tests
9. **Notes** - Design decisions, limitations, future enhancements

---

## Complexity Levels

**Level 0 (Trivial):**
- Bug fixes, typos, minor text changes
- No epic needed → Create GitHub issue directly

**Level 1 (Simple):**
- Small features (< 5 files)
- Example: Add email validation to signup form
- Epic size: ~200 lines

**Level 2 (Medium):**
- Medium features (5-15 files)
- Example: User authentication system
- Epic size: ~500 lines

**Level 3 (Large):**
- Large features (15-30 files)
- Example: UX redesign with multiple components
- Epic size: ~1000 lines

**Level 4 (Enterprise):**
- Massive features (30+ files)
- Example: Multi-tenant architecture refactor
- Epic size: ~2000 lines

---

## How SCAR Uses Epics

1. **User creates epic** (via supervisor)
2. **Supervisor breaks epic into GitHub issues** (one per phase/task)
3. **SCAR reads epic URL** from GitHub issue description
4. **SCAR implements** following epic specifications
5. **SCAR reports progress** in GitHub issue comments
6. **Supervisor verifies** against acceptance criteria

**Critical:** Epic file is the single source of truth. SCAR should not need additional context.

---

## Epic Naming Convention

```
epic-[ID]-[feature-name].md
```

Examples:
- `epic-001-user-authentication.md`
- `epic-002-email-notifications.md`
- `epic-007-ux-redesign-case-switcher-dual-dashboard.md`

---

## Current Epics

### Epic 001: Project Setup
- **Status:** Completed
- **Description:** Initial project scaffolding, database setup, basic structure

### Epic 002: User Authentication
- **Status:** Completed
- **Description:** JWT-based authentication with signup/login

### Epic 003: Case Management
- **Status:** Completed
- **Description:** CRUD operations for foster care cases

### Epic 004: Email Integration
- **Status:** Completed
- **Description:** Email sync with Gmail API, threaded conversations

### Epic 005: AI Email Classification
- **Status:** In Progress
- **Description:** AI-powered email categorization and priority detection

### Epic 007: UX Redesign - Case Switcher + Dual Dashboard
- **Status:** Active
- **Description:** Multi-case management interface with badge indicators
- **Complexity:** Level 3 (Large)
- **Phases:** 6 implementation phases
- **Estimated Effort:** 3 weeks

---

## MoSCoW Prioritization

**Every epic uses MoSCoW to prevent scope creep:**

- **MUST HAVE:** Critical core functionality (non-negotiable)
- **SHOULD HAVE:** Important but not critical (valuable additions)
- **COULD HAVE:** Nice to have if time permits (optional enhancements)
- **WON'T HAVE:** Explicitly out of scope (deferred to v2 or decided against)

**Example:**
```markdown
**MUST HAVE:**
- [ ] Case switcher bar with badge indicators
- [ ] Main dashboard with aggregate view

**SHOULD HAVE:**
- [ ] Keyboard shortcuts for case switching
- [ ] Loading states and skeleton screens

**COULD HAVE:**
- [ ] Case pinning/favorites functionality
- [ ] Dark mode support

**WON'T HAVE (this iteration):**
- Real-time WebSocket updates (too complex for MVP)
- Advanced filtering (deferred to Epic 008)
```

---

## Dependencies

**Epics track dependencies explicitly:**

- **Blocked By:** What must be complete before starting this epic
- **Blocks:** What depends on this epic being complete
- **External Dependencies:** Third-party services, infrastructure needs

**Example:**
```markdown
**Blocked By:**
- Epic #005: AI classification must be complete

**Blocks:**
- Epic #008: Advanced filtering needs badge system
- Epic #009: Notifications need case context

**External Dependencies:**
- None
```

---

## Acceptance Criteria

**Every epic defines measurable success criteria:**

**Feature-Level:**
- Functional requirements met (all MUST HAVE items)
- Performance targets achieved (load times, response times)
- Accessibility standards met (WCAG 2.1 Level AA)

**Code Quality:**
- Type-safe (no `any` types)
- Tests pass (unit, integration, E2E)
- No console errors or warnings
- Build succeeds with zero TypeScript errors

**Documentation:**
- API endpoints documented
- Component props documented
- README updated (if needed)

---

## Testing Strategy

**Every epic includes comprehensive testing plan:**

1. **Unit Tests** - Component logic, utility functions
2. **Integration Tests** - API endpoints, database queries
3. **E2E Tests (Playwright)** - Critical user flows
4. **Manual Testing Checklist** - Real-world scenarios

---

## Creating a New Epic

1. **Use the template:** `/home/samuel/supervisor/templates/epic-template.md`
2. **Fill in all sections** (don't skip anything)
3. **Break into GitHub issues** (one per phase/task)
4. **Commit to planning repo** (`.bmad/epics/`)
5. **Reference epic URL in GitHub issues** (for SCAR)

---

## Best Practices

### DO:
✅ Write self-contained epics (SCAR needs no other context)
✅ Use MoSCoW to prevent scope creep
✅ Break into small GitHub issues (2-3 days each)
✅ Define measurable acceptance criteria
✅ Document design decisions (the WHY, not just the WHAT)

### DON'T:
❌ Assume SCAR has context outside the epic
❌ Skip MoSCoW prioritization (leads to scope creep)
❌ Create massive issues (SCAR struggles with >5 day tasks)
❌ Forget acceptance criteria (SCAR needs verification checklist)
❌ Mix multiple features in one epic (break into separate epics)

---

## References

- Epic Template: `/home/samuel/supervisor/templates/epic-template.md`
- BMAD Workflow: `/home/samuel/supervisor/docs/bmad-workflow.md`
- SCAR Integration: `/home/samuel/supervisor/docs/scar-integration.md`
- Epic Sharding: `/home/samuel/supervisor/docs/epic-sharding.md`
