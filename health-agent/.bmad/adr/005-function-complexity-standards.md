# ADR 005: Function Complexity Standards and Refactoring Guidelines

**Date:** 2026-01-15 (Stockholm time)
**Status:** Accepted
**Project:** health-agent
**Supersedes:** N/A
**Superseded by:** N/A

## Context

Code review of the Health Agent implementation (Issue #2 - CODEBASE_REVIEW.md) revealed severe function complexity issues that threaten maintainability, testability, and developer velocity.

### Current Situation

**Extreme Function Complexity:**
- 51 functions exceed 50 lines (53.7% of codebase)
- Largest function: 303 lines (`handle_reminder_completion`)
- Other critical violations:
  - `handle_photo`: 115 lines
  - `handle_message`: 112 lines
  - `_generate_weekly_summary`: 86 lines
  - `_collect_weekly_data`: 73 lines

**Impact:**
- Testing requires mocking entire workflows (brittle tests)
- Understanding code requires reading 300+ line functions
- Debugging is difficult (many responsibilities in one function)
- Code reuse is impossible (logic trapped in monoliths)
- Violations of Single Responsibility Principle throughout

### Constraints

- **Must maintain functionality:** Refactoring cannot break existing features
- **Must be testable:** Every function must be unit-testable in isolation
- **Must be maintainable:** Code must be understandable by future developers
- **Single developer:** Standards must be enforceable via automated tooling
- **Timeline:** Phase 2 refactoring allocated 30 hours (Epic 007)

### Stakeholders

- **Who is affected:** Current developer, SCAR (implementation agent), future maintainers
- **Who decides:** Supervisor (planning agent) based on industry best practices

## Decision

We will adopt strict function complexity standards enforced via linting and code review:

**Hard Limits:**
1. **Maximum 50 lines per function** (excluding blank lines, comments)
2. **Maximum 3 levels of nesting** (if/for/while depth)
3. **Maximum 5 parameters** (use dataclasses/TypedDict for more)
4. **Single Responsibility Principle** (one clear purpose per function)

**Refactoring Requirements:**
- Extract complex logic into named helper functions
- Use descriptive function names that reveal intent
- Keep business logic separate from infrastructure code
- Prefer composition over monolithic functions

### Implementation Summary

**Phase 2 (Epic 007):**
1. Refactor 3 largest functions immediately:
   - `handle_reminder_completion` (303 lines → ~8 functions)
   - `handle_photo` (115 lines → ~4 functions)
   - `handle_message` (112 lines → ~4 functions)

2. Add linting enforcement:
   - `pylint` max-lines-per-function: 50
   - `mccabe` complexity score: 10
   - `radon` cyclomatic complexity: < 10

3. Update code review checklist:
   - Verify function length < 50 lines
   - Check nesting depth < 3 levels
   - Confirm SRP adherence

## Rationale

### Pros

✅ **Testability:** Small functions = simple unit tests (no complex mocking)
✅ **Readability:** 30-line functions are understandable at a glance
✅ **Debuggability:** Isolated logic means clear stack traces
✅ **Reusability:** Extracted helpers can be used across codebase
✅ **Maintainability:** Future changes affect small, focused functions
✅ **Code Review:** Easier to review 10 small functions than 1 monolith

### Cons

❌ **More Functions:** 51 large functions become ~150 smaller functions
❌ **Refactoring Effort:** 30 hours allocated for Phase 2
❌ **Learning Curve:** Developers must learn to extract logic proactively
❌ **Mitigation:** Automated linting enforces standards, code review catches violations

### Why This Wins

**The 50-line limit is industry standard** (Google, Microsoft, clean code literature). Current 303-line functions are 6x over best practices. Small, focused functions are the foundation of testable, maintainable Python code.

## Consequences

### Positive Consequences

- **Developer Experience:** New features easier to add (clear insertion points)
- **User Experience:** Fewer bugs due to better testability
- **Performance:** No impact (Python function calls are cheap)
- **Cost:** Zero (refactoring time already allocated)
- **Testing:** Each function testable in isolation (no integration tests needed)
- **Debugging:** Clear function names reveal what went wrong

### Negative Consequences

- **Technical Debt:** 30 hours refactoring debt (paid in Phase 2)
- **Learning Curve:** Developers must internalize SRP, extraction patterns
- **Migration Effort:** 51 functions require refactoring (prioritized by size)
- **File Count:** More files/modules (but better organized)

### Neutral Consequences

- **Architecture Change:** Move from monolithic handlers to composed pipelines
- **Team Process:** Code review now includes complexity checks
- **Documentation:** Function names become self-documenting

## Alternatives Considered

### Alternative 1: Keep Current Structure

**Description:** Accept 303-line functions, no refactoring

**Pros:**
- Zero migration effort
- No learning curve
- Existing code works

**Cons:**
- Unmaintainable codebase (already proven in review)
- Testing requires full integration setup
- Bug fixes take 2x-5x longer
- New features require understanding entire 300-line flow

**Why Rejected:** Technical debt is already severe. Problem will worsen as codebase grows. Violates professional engineering standards.

### Alternative 2: 100-Line Limit

**Description:** Less aggressive limit (100 lines instead of 50)

**Pros:**
- Less refactoring effort (~15 hours instead of 30)
- Fewer functions to manage

**Cons:**
- 100-line functions still hard to test
- Doesn't solve core SRP violations
- Still 2x industry standard

**Why Rejected:** 100 lines is still too large for unit testing. Need clean break with past practices.

### Alternative 3: Aggressive Microfunction Approach (<20 lines)

**Description:** Extreme granularity, every function < 20 lines

**Pros:**
- Maximum testability
- Ultra-clear responsibilities

**Cons:**
- Too fragmented (lose narrative flow)
- Function call overhead (minimal but exists)
- Over-engineering (diminishing returns)

**Why Rejected:** 50-line limit is optimal balance between granularity and coherence. Industry standard for good reason.

## Implementation Plan

### Phase 1: Preparation (Completed in Issue #2)

- [x] Audit codebase for complexity violations
- [x] Identify top 3 offenders (handle_reminder_completion, handle_photo, handle_message)
- [x] Document standards in ADR 005

### Phase 2: Execution (Epic 007 - Issue #55)

1. **Refactor `handle_reminder_completion` (303 → ~40 lines)**
   - Extract reward calculation logic
   - Extract streak update logic
   - Extract response generation logic
   - Extract database operations

2. **Refactor `handle_photo` (115 → ~30 lines)**
   - Extract vision API call
   - Extract nutrition parsing
   - Extract database save logic

3. **Refactor `handle_message` (112 → ~30 lines)**
   - Extract command routing
   - Extract conversation handling
   - Extract state management

4. **Add Linting Enforcement**
   - Update `pylintrc`: max-lines-per-function = 50
   - Add `mccabe` complexity checks
   - Configure CI to fail on violations

5. **Update Code Review Checklist**
   - Add complexity checks
   - Document extraction patterns

### Phase 3: Validation

1. **Run Full Test Suite:** Verify refactoring didn't break functionality
2. **Check Linting:** Ensure all functions pass complexity checks
3. **Manual Testing:** Test reminder completion, photo upload, message handling
4. **Performance Test:** Verify no regressions (though none expected)

### Rollback Plan

If refactoring introduces critical bugs:
1. Revert Git commits (each function refactored in separate commit)
2. Fix issues in separate PR
3. Reapply refactoring with fixes

**Risk:** Low (unit tests validate each extraction step)

## Success Metrics

**Quantitative Metrics:**
- **Function Count <50 lines:** 100% (currently 46.3%)
- **Largest Function:** <50 lines (currently 303 lines)
- **Test Coverage:** Maintain >90% (currently ~85%)
- **Cyclomatic Complexity:** All functions <10 (measurable via radon)

**Qualitative Metrics:**
- **Code Review Speed:** Faster PR reviews (smaller diffs)
- **Bug Fix Time:** Reduced time to fix bugs (isolated logic)
- **New Feature Velocity:** Faster feature additions (clear insertion points)

**Timeline:**
- Measure after: Phase 2 completion (Epic 007)
- Target: Zero functions >50 lines, zero complexity violations

## Review Date

**Next Review:** 2026-02-15 (1 month after Phase 2 completion)

**Triggers for Earlier Review:**
- Linting rules prove too strict (excessive false positives)
- Developers struggle with extraction patterns
- Performance degrades (unlikely but monitor)
- Alternative standards emerge (unlikely - 50 lines is universal)

## References

- **CODEBASE_REVIEW.md:** `.bmad/CODEBASE_REVIEW.md` (Issue #2)
- **Epic 007:** Phase 2 Code Quality Refactoring (Issue #55)
- **GitHub Issue:** #2 (Codebase Review)
- **GitHub Issue:** #55 (Phase 2 Refactoring)
- **Industry Standard:** Clean Code (Robert Martin) - "Functions should be small"
- **Google Style Guide:** Functions should "do one thing well"

## Notes

**Why 50 Lines:**
- Industry consensus (Google, Microsoft, AWS, clean code literature)
- Fits on single screen (no scrolling needed)
- Human working memory limit (~7±2 chunks)
- Optimal for code review (reviewers can grasp function at once)

**Enforcement Strategy:**
- Automated linting (primary enforcement)
- Code review checklist (secondary verification)
- Pre-commit hooks (prevent violations from reaching CI)

**Future Work:**
- After Phase 2: Refactor remaining 48 functions >50 lines
- Add complexity budget to each epic (prevent new violations)
- Document extraction patterns for common scenarios (handlers, database ops, etc.)

### Lessons Learned (Post-Implementation)

**To be filled in after Phase 2 completion (Epic 007):**

- What worked well:
- What didn't work:
- What we'd do differently:

---

**Template Version:** 1.0
**Template Source:** BMAD-inspired ADR template for SCAR supervisor
