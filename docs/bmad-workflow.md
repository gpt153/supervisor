# BMAD-Inspired Workflow

## Scale-Adaptive Intelligence (Auto-Detected)

**Level 0** - Bug fixes, typos (5 min)
- Skip analysis/planning, create issue directly

**Level 1** - Small features (30 min)
- Quick Flow: Brief epic file + 1-2 GitHub issues

**Level 2** - Medium features (2-4 hours)
- Standard Flow: Full epic with ADR + 3-6 issues

**Level 3** - Large features (1-3 days)
- Full BMAD: PRD + multiple epics + architecture doc

**Level 4** - Enterprise/compliance (weeks)
- Complete methodology: PRD + architecture + epic suite + test strategy

## Four Development Phases

```
1. ANALYSIS (Analyst Subagent)
   - Spawn analyst subagent
   - Systematic requirements gathering
   - Output: Enhanced project-brief.md OR feature-request.md
   - Complexity level detected

2. PLANNING (PM Subagent)
   - Spawn PM subagent for epic creation
   - PRD for Level 3-4 features
   - Output: .bmad/prd/feature-name.md, .bmad/epics/*.md

3. ARCHITECTURE (Architect Subagent)
   - Spawn architect subagent for ADRs
   - Technical decisions documented
   - Output: .bmad/architecture/*.md, .bmad/adr/*.md

4. IMPLEMENTATION (SCAR + Supervision)
   - Create GitHub issues from epic task breakdown
   - Attach epic content to issue
   - Tag @scar with clear instructions
   - Spawn supervision: /supervise-issue N
   - Validate with /verify-scar-phase
```

## Documentation Hierarchy

```
.bmad/
├── project-brief.md           # Project vision, goals, stakeholders
├── workflow-status.yaml       # Current phase, completed phases
├── prd/                       # Product Requirements Documents
├── architecture/              # System design documents
├── epics/                     # Self-contained story files (FOR SCAR)
├── adr/                       # Architecture Decision Records
├── discussions/               # Design discussions (optional)
└── handoff-*.md              # Context handoff documents
```

## MoSCoW Prioritization

Always use when defining requirements:

- **MUST HAVE:** Core functionality, non-negotiable
- **SHOULD HAVE:** Important but not critical
- **COULD HAVE:** Nice to have if time permits
- **WON'T HAVE:** Explicitly out of scope (prevents scope creep)

Example:
```
MUST HAVE:
- [ ] User can sign up with email/password
- [ ] User can log in and receive JWT token

SHOULD HAVE:
- [ ] Password strength validation
- [ ] Password reset via email

COULD HAVE:
- [ ] Social login (Google, GitHub)

WON'T HAVE (this iteration):
- OAuth provider integration (deferred to v2)
```

## Architecture Decision Records (ADRs)

Document WHY decisions were made:

**Template:** `/home/samuel/supervisor/templates/adr-template.md`

**Key sections:**
- **Context:** What forces are at play?
- **Decision:** What are we doing?
- **Rationale:** Why this option wins (pros/cons)
- **Consequences:** What happens as a result?
- **Alternatives:** What else was considered and why rejected?

**When to create ADRs:**
- Database choice (PostgreSQL vs MongoDB)
- Authentication method (JWT vs sessions)
- State management (Redux vs Context API)
- Deployment platform (GCP vs AWS)
- API style (REST vs GraphQL)

**Link ADRs in epics:**
```markdown
## Key Technical Decisions
- Decision 1: JWT authentication (see ADR-002)
- Decision 2: PostgreSQL database (see ADR-001)
```

SCAR can read ADRs to understand technical context.

## Workflow Status Tracking

**File:** `.bmad/workflow-status.yaml`

**Tracks:**
- Current phase (analysis/planning/architecture/implementation)
- Completed phases with timestamps
- Active epics and GitHub issues
- Decision log (quick ADR references)
- Progress metrics

**Update after:**
- Completing any phase
- Creating epic/ADR
- Starting/completing GitHub issues
- Making architectural decisions

**Example:**
```yaml
project: consilio
current_phase: implementation
complexity_level: 2
current_epic: 001-user-authentication

phases:
  analysis:
    status: completed
    completed_at: 2026-01-15T10:30:00+01:00
    outputs:
      - feature-requests/user-authentication.md

  planning:
    status: completed
    outputs:
      - epics/001-user-authentication.md

  implementation:
    status: in_progress
    github_issues:
      - number: 123
        status: in_progress
        epic: 001-user-authentication
```
