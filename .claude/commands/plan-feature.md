# Plan Feature Command - Orchestration Meta-Command

You are orchestrating the **complete BMAD planning workflow** for a feature from analysis to implementation handoff.

## Your Mission

Guide the user through systematic feature planning using BMAD methodology, automatically invoking the right agents (Analyst, PM, Architect) in the right order.

## Context

- **Working Directory:** `/home/samuel/supervisor/[project]/`
- **User Input:** $ARGUMENTS (feature description)
- **Workflow:** Analysis → Planning → Architecture → Implementation Prep

## Planning Workflow

### Step 1: Analysis Phase (Analyst Agent)

**Invoke:** `/analyze $ARGUMENTS`

**What happens:**
- Analyst asks systematic questions
- Clarifies requirements
- Assesses complexity (Level 0-4)
- Creates feature request document
- Detects planning track (quick-flow, standard, enterprise)

**Output:**
- `.bmad/feature-requests/[feature-name].md`
- `.bmad/workflow-status.yaml` (updated with complexity level)

**Next step depends on complexity:**
- Level 0: Skip to GitHub issue creation
- Level 1: Proceed to epic creation
- Level 2+: Proceed to PRD or epic (user choice)

### Step 2: Planning Phase (PM Agent)

**For Level 1-2 (Quick/Standard Flow):**

**Invoke:** `/create-epic $FEATURE_NAME`

**What happens:**
- PM reads feature request
- Creates self-contained epic file
- Uses MoSCoW prioritization
- Breaks down into implementation tasks
- Defines acceptance criteria

**Output:**
- `.bmad/epics/NNN-feature-name.md`
- `.bmad/workflow-status.yaml` (updated)

**For Level 3-4 (Enterprise Flow):**

**Invoke:** `/create-prd $FEATURE_NAME`

**What happens:**
- PM creates comprehensive PRD
- Multiple user stories
- Detailed requirements (MoSCoW)
- Epic breakdown (multiple epics)
- Testing strategy

**Output:**
- `.bmad/prd/feature-name.md`
- `.bmad/epics/NNN-part-1.md`
- `.bmad/epics/NNN+1-part-2.md`
- etc.

### Step 3: Architecture Phase (Architect Agent)

**If technical decisions needed:**

**Invoke:** `/create-adr $DECISION_TITLE`

**What happens:**
- Architect analyzes options
- Documents decision rationale
- Captures trade-offs
- Links to epic/PRD

**Output:**
- `.bmad/adr/NNN-decision-title.md`
- Updated epic with ADR reference

**If system design needed (Level 3-4):**

**Invoke:** `/design-architecture $SCOPE`

**What happens:**
- Architect creates architecture document
- System diagrams
- Component breakdown
- Data flow
- Integration points

**Output:**
- `.bmad/architecture/overview.md`
- `.bmad/architecture/database-schema.md`
- `.bmad/architecture/api-specification.md`

### Step 4: Implementation Preparation

**GitHub Issue Creation:**

For each implementation task in the epic:
1. Create GitHub issue
2. Reference epic file in description
3. Add acceptance criteria
4. Label appropriately (backend, frontend, tests, docs)
5. Assign to SCAR

**Example:**
```bash
gh issue create \
  --title "Backend: User authentication API" \
  --body "Implement auth endpoints as specified in epic 001-user-auth.md

Epic Reference: .bmad/epics/001-user-auth.md

Tasks:
- [ ] POST /auth/signup endpoint
- [ ] POST /auth/login endpoint
- [ ] JWT token generation
- [ ] Password hashing (bcrypt)

Acceptance Criteria:
- [ ] Endpoints return 200 with valid data
- [ ] Invalid input returns 400 with errors
- [ ] Passwords hashed before storage
- [ ] JWT tokens signed correctly
- [ ] All unit tests pass

SCAR: Please implement this following the epic specifications."
```

**Supervisor Monitoring:**

After issues created:
```bash
/supervise-issue [issue-number]
```

This spawns a monitoring subagent that:
- Tracks SCAR's progress
- Validates implementation with `/verify-scar-phase`
- Reports back to supervisor

## Complexity-Based Workflow Paths

### Level 0: Trivial (Bug Fix, Typo)

```
User Request → [Analyze] → GitHub Issue → SCAR
```

**Duration:** 5 minutes
**Documents:** None (just GitHub issue)

### Level 1: Small Feature

```
User Request → [Analyze] → [Create Epic] → GitHub Issues → SCAR
```

**Duration:** 30 minutes planning
**Documents:** Epic file only

### Level 2: Medium Feature

```
User Request → [Analyze] → [Create Epic] → [Create ADR (if needed)] →
GitHub Issues → SCAR
```

**Duration:** 1-2 hours planning
**Documents:** Epic + ADR(s)

### Level 3: Large Feature

```
User Request → [Analyze] → [Create PRD] → [Create Epics] →
[Create ADRs] → GitHub Issues → SCAR
```

**Duration:** 2-4 hours planning
**Documents:** PRD + Multiple Epics + ADRs

### Level 4: Enterprise Feature

```
User Request → [Analyze] → [Create PRD] → [Design Architecture] →
[Create Epics] → [Create ADRs] → GitHub Issues → SCAR
```

**Duration:** 4-8 hours planning
**Documents:** PRD + Architecture + Multiple Epics + ADRs + Test Strategy

## Automatic Workflow Selection

Based on detected complexity:

```typescript
if (complexityLevel === 0) {
  return "quick-flow-minimal";  // Just GitHub issue
}

if (complexityLevel === 1) {
  return "quick-flow";  // Analyze → Epic → Issues
}

if (complexityLevel === 2) {
  return "standard";  // Analyze → Epic → ADRs → Issues
}

if (complexityLevel >= 3) {
  return "enterprise";  // Full BMAD methodology
}
```

## User Interaction Points

Throughout the workflow, ask user:

**After Analysis:**
"I've analyzed this as a Level $LEVEL feature. Does this complexity assessment seem right?"

**After Epic Creation:**
"Here's the epic draft. Do the requirements look complete?"

**Before ADR Creation:**
"I've identified a technical decision: $DECISION. Should I create an ADR for this?"

**Before Architecture Doc:**
"This feature needs system design documentation. Should I create architecture docs?"

**After Planning Complete:**
"Planning complete! Ready to create GitHub issues and hand off to SCAR?"

## Workflow Status Tracking

The `/plan-feature` command automatically updates `.bmad/workflow-status.yaml` through each phase:

```yaml
project: [project-name]
current_phase: analysis | planning | architecture | implementation
complexity_level: [detected level]
planning_track: quick-flow | standard | enterprise

phases:
  analysis:
    status: completed
    completed_at: [timestamp]
    outputs: [...]

  planning:
    status: completed
    completed_at: [timestamp]
    outputs: [...]

  architecture:
    status: completed | skipped
    outputs: [...]

  implementation:
    status: pending
    github_issues: []
```

## Parallel vs Sequential Planning

**Sequential (Default):**
```
Analyze → Plan → Architect → Implement
```
Each phase waits for previous to complete.

**Parallel (Advanced):**
If user is working on multiple features:
```
Feature A: Analyze | Plan | Architect | Implement
Feature B:           Analyze | Plan | Architect | Implement
Feature C:                     Analyze | Plan | Architect
```

Each feature has its own epic and workflow status.
Physical isolation via separate epic files prevents context mixing.

## Integration with SCAR Supervisor

After planning complete:

1. **Create GitHub issues** from epic task breakdown
2. **Tag SCAR** with epic reference
3. **Start supervision:**
   ```bash
   /supervise-issue 123
   ```
4. **Monitor progress:**
   - Supervisor spawns monitoring subagents
   - Validates with `/verify-scar-phase`
   - Reports status to user

## Critical Rules

1. **Follow complexity-based workflow** - Don't over-plan simple features
2. **Get user approval** at phase transitions
3. **Update workflow status** after each phase
4. **Create self-contained epics** - All context in one place
5. **Document decisions** - ADRs for major choices
6. **Break into small issues** - 30 min to 4 hours each
7. **Clear acceptance criteria** - Both feature and issue level
8. **Validate before handoff** - Epic is complete before creating issues

## Example Full Workflow

**User Request:**
"Add user authentication to the app"

**Step 1: Analyze (Analyst Agent)**
```
Analyst: "Let me ask some questions about authentication...
- Email/password or social login?
- What user data needs to be stored?
- Any password requirements?
- Session duration?"

User answers questions.

Analyst: "This is a Level 2 feature (medium complexity).
I'll create a feature request and move to planning."

Output: .bmad/feature-requests/user-authentication.md
Complexity: Level 2
```

**Step 2: Create Epic (PM Agent)**
```
PM: "Creating epic for user authentication...
- MUST HAVE: Email/password signup/login
- SHOULD HAVE: Password reset
- COULD HAVE: Social login
- WON'T HAVE: Two-factor auth (v2)

Breaking down into tasks:
1. Backend: Users table migration
2. Backend: Auth API endpoints
3. Frontend: Login/signup forms
4. Tests: E2E auth flow
5. Docs: API documentation

Output: .bmad/epics/001-user-authentication.md
```

**Step 3: Create ADR (Architect Agent)**
```
Architect: "Detected technical decision: JWT vs sessions.
Creating ADR...

Decision: Use JWT with 1-hour expiry
Rationale: Stateless, scales horizontally, simpler than sessions
Alternatives considered: Sessions (rejected - requires shared state)

Output: .bmad/adr/001-jwt-authentication.md
Updated epic to reference ADR-001
```

**Step 4: Create GitHub Issues**
```
Created issues:
#42: Backend - Users table migration
#43: Backend - Authentication API endpoints
#44: Frontend - Login form component
#45: Frontend - Signup form component
#46: Tests - E2E authentication flow
#47: Docs - Authentication API documentation

All issues reference epic: .bmad/epics/001-user-authentication.md
```

**Step 5: Start Supervision**
```
Supervisor: "Starting supervision of issues #42-#47...
Spawning 6 monitoring subagents...
SCAR will implement based on epic specifications.
I'll validate each phase and report progress."
```

---

**Role:** Meta-Orchestrator (BMAD-inspired)
**Workflow:** End-to-end planning automation
**Outputs:** Feature request → Epic(s) → ADR(s) → GitHub issues
**Next Phase:** SCAR implementation with supervisor monitoring
