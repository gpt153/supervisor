# BMAD Analysis: Optimal System Architecture for Non-Coder User

**Date:** 2026-01-18
**Status:** Discussion / Planning Phase
**Context:** Rethinking entire Supervisor + SCAR architecture from first principles

---

## Background

**Current System:**
- Supervisor (local Claude instance) does planning → creates GitHub issues
- SCAR (remote Claude instance) picks up issues via webhook → implements code
- Supervisor monitors SCAR's progress via GitHub comments
- Two separate Claude instances, two repositories (planning + implementation)

**Original Inspiration:**
- **Cole Medin's Remote Coding Agent:** PIV Loop (Plan → Implement → Validate)
- Designed for coders who understand technical concepts
- User interacts via Telegram/GitHub → AI codes in background
- Excellent codebase analysis and one-pass implementation methodology

**Critical User Constraint:**
- **User is NOT a coder**
- Cannot read code, debug errors, or review PRs
- Needs plain-language explanations and results
- Uses Claude Desktop/Browser/App as primary UI

---

## Mission

Design the **optimal autonomous software development system** for a non-coder user that:

1. ✅ Maintains excellent planning quality (BMAD methodology)
2. ✅ Enables fully autonomous implementation (no user intervention during build)
3. ✅ Provides clear visibility and status updates
4. ✅ Integrates seamlessly with UI design workflow (Penpot/Storybook/Expo)
5. ✅ Minimizes token usage and cost
6. ✅ Leverages best practices from both BMAD and Cole Medin's PIV loop

---

## Analyze: What Works, What Doesn't

### What Works Well in Current System ✅

**BMAD Planning Artifacts:**
- Epic structure breaks down features clearly
- ADRs capture architectural decisions
- PRDs maintain consistent patterns
- Planning repository preserves knowledge

**Autonomous Supervision:**
- Supervisor spawns subagents for long-running tasks
- Context handoff mechanism prevents token waste
- 30-minute status updates keep user informed

**UI Design Workflow:**
- Penpot for visual design
- Storybook/Expo for interactive prototypes
- Clear 4-phase process (Discuss → Design → Build → Export)

**Cole Medin's Contributions (from PIV loop):**
- Deep codebase analysis before implementation
- Pattern recognition and convention detection
- Validation commands for every task
- One-pass implementation philosophy
- Worktree isolation for parallel work

### What Doesn't Work / Needs Rethinking ❌

**GitHub Issues as Interface:**
- ❌ Adds complexity (webhook setup, rate limits, comment parsing)
- ❌ SCAR might not see issues if wrong repo
- ❌ GitHub UI not optimized for non-coders
- ❌ Requires manual verification of SCAR's work via GitHub comments

**Remote SCAR Instance:**
- ❌ Separate Claude instance = double token cost
- ❌ Communication only via GitHub comments (limited, async)
- ❌ Supervisor can't directly inspect SCAR's state
- ❌ SCAR summaries unreliable (Learning 006: "100% done" = actually 20%)

**Two-Repository System:**
- ❌ Confusing (planning in `gpt153/supervisor`, code in `gpt153/{project}`)
- ❌ Easy to create issues in wrong repo (needs `--repo` flag)
- ❌ User must understand Git concepts to follow along

**Monitoring Complexity:**
- ❌ Supervisor must poll GitHub comments every 2 minutes
- ❌ Spawns multiple monitoring subagents (verify-scar-start, scar-monitor, etc.)
- ❌ Complex state machine (SCAR acknowledged? SCAR working? SCAR blocked?)

---

## Brainstorm: Alternative Architectures

### Option 1: Pure Subagent System (No SCAR)

**Architecture:**
```
User → Supervisor (Sonnet) → Subagents (Haiku/Sonnet)
                   ↓
         Single Git Repository
```

**How it works:**
1. User requests feature in Claude Desktop/Browser
2. Supervisor creates epic (BMAD planning)
3. Supervisor spawns **local implementation subagent** with detailed plan
4. Subagent uses Haiku for execution, Sonnet for complex decisions
5. Subagent implements, tests, commits
6. Supervisor verifies build/tests, reports to user

**Pros:**
- ✅ Single Claude workspace (no remote instance needed)
- ✅ Supervisor has direct access to subagent output
- ✅ No GitHub webhook complexity
- ✅ Simpler monitoring (subagent returns result directly)
- ✅ Cheaper (one Claude subscription, strategic Haiku usage)
- ✅ Single repository (no planning/implementation split)

**Cons:**
- ⚠️ All work happens in one session (could hit token limits)
- ⚠️ No isolation between projects (worktrees help but not perfect)
- ⚠️ Long-running implementations might time out

---

### Option 2: Enhanced SCAR with Better Supervisor Planning

**Architecture:**
```
User → Supervisor (Sonnet) → GitHub Issue (detailed blueprint)
                                      ↓
                              SCAR (Haiku) → Implementation
                                      ↓
                              Supervisor monitors & validates
```

**How it works:**
1. Supervisor does HEAVY planning (codebase analysis, detailed implementation plan)
2. Creates GitHub issue with prescriptive instructions
3. SCAR uses Haiku to execute detailed plan (minimal thinking)
4. Supervisor monitors via GitHub, validates build/tests
5. Reports results to user in plain language

**Pros:**
- ✅ Leverages existing SCAR infrastructure
- ✅ Isolation between planning and implementation
- ✅ Can use Haiku for SCAR (cheaper)
- ✅ Supervisor does heavy thinking once, SCAR executes

**Cons:**
- ⚠️ Still requires GitHub webhook setup
- ⚠️ Still two Claude instances (supervision + implementation)
- ⚠️ Communication limited to GitHub comments
- ⚠️ Monitoring complexity remains

---

### Option 3: Hybrid - Local Subagents + GitHub PRs for Review

**Architecture:**
```
User → Supervisor (Sonnet) → Local Subagent (Haiku) → Implementation
                                      ↓
                              Creates GitHub PR automatically
                                      ↓
                              Supervisor reviews, auto-merges if tests pass
```

**How it works:**
1. Planning happens locally (BMAD artifacts in planning repo)
2. Implementation happens via local subagent (Haiku)
3. Subagent creates feature branch + PR automatically
4. Supervisor runs validation, auto-merges if pass
5. User sees final result: "Feature X deployed to production"

**Pros:**
- ✅ Best of both worlds (local control + GitHub history)
- ✅ PRs serve as audit trail (user can review later if curious)
- ✅ Supervisor controls entire flow
- ✅ Strategic Haiku usage for cost savings
- ✅ No remote SCAR needed

**Cons:**
- ⚠️ Slightly more complex than pure subagent
- ⚠️ Still requires GitHub setup (but no webhooks)

---

### Option 4: Cole Medin's PIV Loop (Adapted for Non-Coder)

**Architecture:**
```
User → Claude Desktop/Browser
           ↓
    PIV Loop Agent (Plan → Implement → Validate)
           ↓
    Single Repository
           ↓
    Report Results in Plain Language
```

**How it works:**
1. User describes feature in natural language
2. Claude creates detailed plan (`.agents/plans/feature.md`)
3. Claude implements following plan (worktree if needed)
4. Claude validates (tests, build, linting)
5. Claude commits and reports: "Feature complete, all tests pass"
6. No technical details shown to user

**Pros:**
- ✅ Simplest architecture (one agent, one repo)
- ✅ Proven methodology (Cole Medin's experience)
- ✅ No remote instances or webhooks
- ✅ User-friendly output
- ✅ Plans stored in repo for reproducibility

**Cons:**
- ⚠️ Less structured than BMAD epics
- ⚠️ All context in one session (could be large)
- ⚠️ No separation between planning artifacts and code

---

## Measure: Evaluation Criteria

Let's rate each option on what matters most for a **non-coder user**:

| Criteria | Option 1: Pure Subagent | Option 2: Enhanced SCAR | Option 3: Hybrid | Option 4: PIV Loop |
|----------|------------------------|------------------------|------------------|-------------------|
| **Simplicity (Setup)** | ⭐⭐⭐⭐⭐ No webhooks | ⭐⭐ Webhooks required | ⭐⭐⭐⭐ No webhooks | ⭐⭐⭐⭐⭐ No webhooks |
| **Cost (Token Usage)** | ⭐⭐⭐⭐ Single session | ⭐⭐⭐ Dual sessions | ⭐⭐⭐⭐ Single session | ⭐⭐⭐⭐ Single session |
| **Autonomy** | ⭐⭐⭐⭐ Supervisor controls all | ⭐⭐⭐ SCAR can get stuck | ⭐⭐⭐⭐ Supervisor controls all | ⭐⭐⭐⭐⭐ One agent does all |
| **Visibility** | ⭐⭐⭐⭐ Direct output | ⭐⭐⭐ Via GitHub | ⭐⭐⭐⭐⭐ PRs + summaries | ⭐⭐⭐ Plans in repo |
| **Planning Quality** | ⭐⭐⭐⭐⭐ BMAD epics | ⭐⭐⭐⭐⭐ BMAD epics | ⭐⭐⭐⭐⭐ BMAD epics | ⭐⭐⭐⭐ PIV plans |
| **User Experience** | ⭐⭐⭐⭐ Simple | ⭐⭐ Complex (GitHub) | ⭐⭐⭐⭐⭐ Simple + audit | ⭐⭐⭐⭐⭐ Simplest |
| **Scalability** | ⭐⭐⭐ Single session limits | ⭐⭐⭐⭐ Multiple SCARs | ⭐⭐⭐⭐ Parallel branches | ⭐⭐⭐ Single session limits |
| **Error Recovery** | ⭐⭐⭐⭐ Supervisor can retry | ⭐⭐ SCAR might loop | ⭐⭐⭐⭐ Supervisor can retry | ⭐⭐⭐ Agent must self-recover |

**Winner:** Option 3 (Hybrid) or Option 4 (PIV Loop Adapted)

---

## Decide: Recommended Architecture

### Recommended: **Option 3.5 - BMAD + PIV Hybrid**

**Combine the best of both:**
- **BMAD methodology** for planning (epics, ADRs, PRDs)
- **PIV loop execution** for implementation (Plan → Implement → Validate)
- **Local subagents** (no remote SCAR)
- **GitHub PRs for audit trail** (optional, auto-created)
- **Strategic model usage** (Haiku for execution, Sonnet for planning)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User (Non-Coder)                         │
│              Claude Desktop / Browser / App                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supervisor (Sonnet)                       │
│  - Creates BMAD artifacts (epics, ADRs, PRDs)               │
│  - Analyzes codebase deeply                                 │
│  - Designs detailed implementation plan                     │
│  - Spawns PIV execution subagent                            │
│  - Monitors build/tests                                     │
│  - Reports plain-language results to user                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PIV Execution Subagent (Haiku)                 │
│  - Reads detailed plan from Supervisor                      │
│  - Implements following prescriptive instructions           │
│  - Runs validation commands (tests, build, lint)            │
│  - Creates feature branch + PR (optional)                   │
│  - Returns results to Supervisor                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Single Git Repository per Project              │
│  Planning Artifacts:                                        │
│   - epics/epic-XXX.md                                       │
│   - adr/adr-XXX.md                                          │
│   - PRD.md                                                  │
│   - .agents/plans/feature.md (PIV plans)                    │
│  Code:                                                      │
│   - src/, tests/, etc.                                      │
│  Audit Trail:                                               │
│   - GitHub PRs (auto-created, auto-merged)                  │
└─────────────────────────────────────────────────────────────┘
```

### Workflow Example

**User says:** "Add dark mode to the dashboard"

**Supervisor does (Sonnet):**
1. Creates `epics/epic-005-dark-mode.md` (BMAD format)
2. Analyzes codebase:
   - Finds theme system in `src/theme/`
   - Identifies components that need updates
   - Checks existing color variables
3. Creates detailed PIV plan: `.agents/plans/implement-dark-mode.md`
   - File-by-file instructions
   - Specific function signatures
   - Test requirements
   - Validation commands
4. Spawns PIV subagent (Haiku): "Execute dark mode plan"

**PIV Subagent does (Haiku):**
1. **Plan phase:** Reads `.agents/plans/implement-dark-mode.md`
2. **Implement phase:**
   - Creates feature branch: `feature/dark-mode`
   - Modifies `src/theme/colors.ts`
   - Updates `src/components/Dashboard.tsx`
   - Adds `src/hooks/useDarkMode.ts`
   - Creates tests: `tests/theme/dark-mode.test.ts`
3. **Validate phase:**
   - Runs: `npm run test` ✅
   - Runs: `npm run lint` ✅
   - Runs: `npm run build` ✅
   - Takes screenshot of dark mode (Playwright)
4. Returns to Supervisor: "Implementation complete, all validations passed"

**Supervisor does:**
1. Reviews subagent output
2. Creates PR automatically (if configured)
3. Merges to main
4. Updates epic status: "✅ Complete"
5. **Reports to user:** "Dark mode added to dashboard! Toggle is in settings. All tests passing. Feature deployed."

**User sees:** Simple plain-language result, no code

---

## Implementation Plan

### Phase 1: Core Architecture Shift

**Epic 1:** Remove SCAR dependency, create PIV subagent system
- Retire supervise-issue.md and scar-monitor.md
- Create new `piv-execute.md` command (local subagent)
- Update create-epic.md to generate detailed PIV plans
- Test with one existing epic

**Epic 2:** Consolidate repositories (if desired)
- Move planning artifacts into each project's code repo
- Update all documentation references
- Migrate existing epics/ADRs
- Or keep separate (planning in supervisor/, code in project/)

**Epic 3:** Add automatic PR creation
- Subagent creates feature branch
- Subagent commits changes
- Subagent creates PR via `gh pr create`
- Supervisor auto-merges if tests pass

### Phase 2: Enhanced Planning

**Epic 4:** Integrate Cole Medin's codebase analysis
- Deep pattern recognition
- Convention detection
- Similar implementation search
- Integration point mapping

**Epic 5:** One-pass implementation methodology
- Prescriptive file-by-file instructions
- Validation commands for every task
- Edge case documentation
- Code snippet examples

### Phase 3: Model Optimization

**Epic 6:** Strategic Haiku usage
- Supervisor uses Sonnet for planning (heavy thinking)
- PIV subagent uses Haiku for execution (following detailed plan)
- Complex decisions escalate to Sonnet
- Monitor token usage and cost savings

### Phase 4: UI Workflow Integration

**Epic 7:** Seamless UI design to code pipeline
- Penpot designs → Export → PIV implementation
- Storybook components → Extract → Integrate to project
- Expo Snack prototypes → Export → Production code
- Automated asset optimization

---

## Questions for Discussion

1. **Single repo or dual repo?**
   - Option A: Planning artifacts in code repo (simpler)
   - Option B: Planning in supervisor/, code in project/ (current)

2. **GitHub PRs required or optional?**
   - Always create PRs (audit trail)
   - Only create PRs for major features
   - Skip PRs entirely (direct commits)

3. **Validation depth?**
   - Basic (unit tests + build)
   - Standard (+ integration tests + lint)
   - Comprehensive (+ E2E tests + Playwright + security scans)

4. **Error handling strategy?**
   - Retry failed validation (how many times?)
   - Escalate to Supervisor for fixes
   - Report to user and pause

5. **Context preservation?**
   - Keep PIV plans in repo (version controlled)
   - Store in database (like current system)
   - Both

---

## Next Steps

1. **User Decision:** Which architecture resonates most?
2. **Pilot Test:** Implement one feature using proposed architecture
3. **Measure Results:** Compare token usage, implementation time, quality
4. **Iterate:** Refine based on pilot results
5. **Full Rollout:** Migrate all projects to new architecture

---

## Success Metrics

After implementation, we should see:

- ✅ **Lower token cost** (Haiku for execution)
- ✅ **Faster feature delivery** (no GitHub comment polling)
- ✅ **Better user experience** (plain language results)
- ✅ **Higher code quality** (comprehensive validation)
- ✅ **Simpler setup** (no webhooks for new projects)
- ✅ **Preserved planning quality** (BMAD + PIV hybrid)

---

## Conclusion

**The optimal system for a non-coder user is likely:**

**Option 3.5: BMAD + PIV Hybrid with Local Subagents**

This architecture:
- Keeps the excellent BMAD planning methodology
- Adopts Cole Medin's proven PIV execution loop
- Eliminates remote SCAR complexity
- Reduces token costs via strategic Haiku usage
- Provides clear, plain-language results to user
- Maintains audit trail via GitHub PRs (optional)

**The key insight:** We don't need two separate Claude instances. One Supervisor can do both planning (Sonnet) and orchestrate execution (Haiku subagents), resulting in a simpler, cheaper, more reliable system.

---

**Ready to discuss and decide on next steps!**
