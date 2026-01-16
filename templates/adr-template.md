# ADR XXX: [Decision Title]

**Date:** YYYY-MM-DD (Stockholm time)
**Status:** Proposed | Accepted | Superseded | Deprecated
**Project:** [project-name]
**Supersedes:** ADR-XXX (if applicable)
**Superseded by:** ADR-XXX (if applicable)

## Context

[What is the issue that we're seeing that is motivating this decision or change?]

[Describe the forces at play: business requirements, technical constraints, team capabilities, timeline pressures, etc.]

### Current Situation
[What's the status quo? What's not working?]

### Constraints
- Constraint 1: [e.g., "Must work on GCP Cloud Run"]
- Constraint 2: [e.g., "Budget limited to free tier"]
- Constraint 3: [e.g., "Single developer maintenance"]

### Stakeholders
- Who is affected: [Users, developers, operations, etc.]
- Who decides: [Decision maker]

## Decision

[What is the change that we're actually proposing or announcing?]

[State the decision clearly and concisely. Use imperative mood: "We will...", "The system shall..."]

### Implementation Summary
[High-level overview of how this will be implemented]

## Rationale

[Why did we choose this option over alternatives?]

### Pros
✅ **Benefit 1:** [Specific advantage]
✅ **Benefit 2:** [Specific advantage]
✅ **Benefit 3:** [Specific advantage]

### Cons
❌ **Drawback 1:** [Specific disadvantage]
❌ **Drawback 2:** [Specific disadvantage]
❌ **Mitigation:** [How we'll handle the drawbacks]

### Why This Wins
[The key reason(s) this option is best for our context]

## Consequences

### Positive Consequences
- **Developer Experience:** [Impact on development workflow]
- **User Experience:** [Impact on end users]
- **Performance:** [Performance implications]
- **Cost:** [Financial impact]

### Negative Consequences
- **Technical Debt:** [New debt introduced]
- **Learning Curve:** [Skills team needs to acquire]
- **Migration Effort:** [Work needed to transition]

### Neutral Consequences
- **Architecture Change:** [Structural changes that are neither good nor bad]
- **Team Process:** [Process adjustments needed]

## Alternatives Considered

### Alternative 1: [Name]
**Description:** [What this option would involve]

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

**Why Rejected:** [Specific reason this wasn't chosen]

### Alternative 2: [Name]
**Description:** [What this option would involve]

**Pros:**
- Pro 1

**Cons:**
- Con 1

**Why Rejected:** [Specific reason this wasn't chosen]

### Alternative 3: Do Nothing
**Description:** Keep current approach

**Pros:**
- No migration effort
- No new learning curve

**Cons:**
- Problem persists
- Technical debt grows

**Why Rejected:** [Specific reason status quo isn't acceptable]

## Implementation Plan

### Phase 1: Preparation
1. [ ] Task 1
2. [ ] Task 2
3. [ ] Task 3

### Phase 2: Execution
1. [ ] Task 1
2. [ ] Task 2
3. [ ] Task 3

### Phase 3: Validation
1. [ ] Task 1
2. [ ] Task 2
3. [ ] Task 3

### Rollback Plan
[How do we revert if this doesn't work?]

## Success Metrics

[How will we know if this was the right decision?]

**Quantitative Metrics:**
- Metric 1: [e.g., "API response time < 200ms"]
- Metric 2: [e.g., "Zero authentication failures"]

**Qualitative Metrics:**
- Metric 3: [e.g., "Developers find auth middleware easy to use"]
- Metric 4: [e.g., "Users report faster login experience"]

**Timeline:**
- Measure after: [X weeks/months]
- Target: [Specific goal]

## Review Date

**Next Review:** YYYY-MM-DD

**Triggers for Earlier Review:**
- Trigger 1: [e.g., "Performance degrades below 200ms"]
- Trigger 2: [e.g., "Alternative technology matures"]
- Trigger 3: [e.g., "Team feedback indicates problems"]

## References

- [Link to relevant documentation]
- [Link to GitHub issue or PR]
- [Link to external research or articles]
- [Link to related ADRs]

## Notes

[Any additional context, warnings, or information for future readers]

### Lessons Learned (Post-Implementation)
[To be filled in after implementation]

- What worked well:
- What didn't work:
- What we'd do differently:

---

**Template Version:** 1.0
**Template Source:** BMAD-inspired ADR template for SCAR supervisor
