# Epic: SCAR Integration Improvements

**Epic ID:** 003
**Created:** 2026-01-17
**Status:** Draft
**Complexity Level:** 3

## Overview

Improve how supervisors interact with SCAR (autonomous implementation agent), focusing on verification, progress monitoring, and error recovery.

## Problem Statement

**Key learnings from experience:**
- Learning #006: SCAR summaries can't be trusted without verification
- Learning #007: Must monitor SCAR's STATE (progress), not just existence (files)

**Current pain points:**
1. **Verification gaps:** Supervisors don't always verify SCAR's work thoroughly
2. **Progress opacity:** Hard to know if SCAR is actually making progress
3. **Error recovery:** When SCAR gets stuck, recovery is manual and ad-hoc
4. **Quality assurance:** No automated checks for SCAR output quality

## Goals

1. **Automated verification:** Scripts to verify SCAR's claims
2. **Progress monitoring:** Real-time visibility into SCAR's work
3. **Error detection:** Catch SCAR issues early
4. **Quality gates:** Automated quality checks before accepting work

## Key Features

### Must Have
- SCAR verification checklist (automated where possible)
- Progress monitoring dashboard (file changes, test status, build status)
- Error detection patterns (stuck detection, infinite loop detection)
- Quality gates (tests pass, build succeeds, no regressions)

### Should Have
- SCAR state inspection tools (what's SCAR actually doing?)
- Automated diff review (highlight suspicious changes)
- SCAR performance metrics (velocity, error rate)
- Recovery playbooks (common failure modes and fixes)

### Could Have
- Predictive stuck detection (warn before SCAR gets stuck)
- Automated SCAR coaching (suggest corrections in real-time)
- SCAR work replay (understand what SCAR did and why)
- A/B testing for SCAR instructions (optimize prompts)

## Initial Tasks

1. Create SCAR verification script
   - Check files SCAR claims to have created
   - Run tests SCAR claims pass
   - Verify build succeeds
   - Check git diff matches description

2. Create progress monitoring tool
   - Watch file changes in real-time
   - Track test pass/fail over time
   - Monitor build status
   - Detect stuck state (no progress for X minutes)

3. Document verification workflow
   - Update scar-integration.md with verification steps
   - Create verification checklist template
   - Add to supervisor CLAUDE.md instructions

4. Create error recovery playbooks
   - Common failure: SCAR claims 100% but nothing works
   - Common failure: SCAR gets stuck in loop
   - Common failure: SCAR creates wrong files
   - Common failure: SCAR breaks existing functionality

5. Add quality gates to SCAR workflow
   - Pre-merge: All tests must pass
   - Pre-merge: Build must succeed
   - Pre-merge: No TypeScript errors
   - Pre-merge: No new security vulnerabilities

## Success Metrics

- SCAR verification time: <2 minutes (automated checks)
- Early error detection: Catch issues within 5 minutes of occurrence
- Recovery time: <10 minutes from error detection to fix
- False acceptance rate: <5% (accepting broken SCAR work)
- Regression prevention: 100% (quality gates catch all regressions)

## Dependencies

**Blocked By:**
- None (can start immediately)

**Blocks:**
- Epic #004 (automated updates may incorporate SCAR patterns)

## Critical References

- **Learning 006:** `/home/samuel/supervisor/docs/supervisor-learnings/learnings/006-never-trust-scar-verify-always.md`
- **Learning 007:** `/home/samuel/supervisor/docs/supervisor-learnings/learnings/007-monitor-scar-state-not-just-existence.md`
- **SCAR commands:** `/home/samuel/supervisor/docs/scar-command-reference.md`
- **SCAR integration:** `/home/samuel/supervisor/docs/scar-integration.md`

## Known Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Over-automation reduces supervisor judgment | Medium | High | Keep human in loop for critical decisions |
| False positives in error detection | Medium | Medium | Tune detection thresholds, allow overrides |
| Verification overhead too high | Low | Medium | Focus on high-value checks, parallelize where possible |

## Notes

### Why This Matters

SCAR is powerful but requires careful supervision. The gap between what SCAR claims and what SCAR delivers can be significant. This epic aims to close that gap through:
- Automated verification (don't trust, verify)
- Real-time monitoring (catch issues early)
- Quality gates (prevent bad work from merging)
- Recovery patterns (fix issues quickly)

### Design Principles

1. **Trust but verify:** SCAR is helpful, but verification is mandatory
2. **Early detection:** Catch issues when they're small and fixable
3. **Automation first:** Automate verification where possible
4. **Human judgment:** Keep supervisor in loop for critical decisions
