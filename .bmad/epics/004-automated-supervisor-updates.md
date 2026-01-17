# Epic: Automated Supervisor Updates

**Epic ID:** 004
**Created:** 2026-01-17
**Status:** Draft
**Complexity Level:** 2

## Overview

Create system for automatically updating all project supervisors when central documentation changes, with version tracking and rollback capability.

## Problem Statement

**Current state:**
- Central documentation in `/home/samuel/supervisor/docs/`
- Each project supervisor reads from central docs
- Changes to central docs require manual notification to active supervisors
- No version tracking for supervisor instructions
- No rollback mechanism if update breaks something

**Issues:**
1. Manual notification is error-prone
2. Active supervisors may work with outdated instructions
3. No way to know which version of instructions supervisor used
4. Can't easily rollback if update causes problems

## Goals

1. **Automated propagation:** Changes to central docs automatically notify projects
2. **Version tracking:** Know which version of instructions each supervisor uses
3. **Rollback capability:** Revert to previous version if needed
4. **Testing:** Validate supervisor changes before applying

## Key Features

### Must Have
- Version tracking for central documentation
- Automated notification when docs change
- Supervisor version reporting (which docs version in use)
- Manual rollback mechanism

### Should Have
- Automated testing for supervisor instruction changes
- Gradual rollout (test on one project before all)
- Change validation (ensure YAML/Markdown valid)
- Update history log

### Could Have
- Automatic rollback on error detection
- A/B testing for supervisor instructions
- Impact analysis (which projects affected by change)
- Dry-run mode (preview update without applying)

## Initial Tasks

1. Add version tracking to central docs
   - Add version field to each doc
   - Track change history
   - Semantic versioning (major.minor.patch)

2. Create supervisor version reporter
   - Each supervisor reports which doc versions loaded
   - Logged to workflow-status.yaml
   - Visible in status reports

3. Create update notification system
   - Detect changes to central docs
   - Notify active supervisors
   - Log notification delivery

4. Create rollback mechanism
   - Git-based rollback (revert doc commits)
   - Version pinning (project can pin to specific version)
   - Emergency rollback command

5. Create testing framework
   - Validate YAML/Markdown syntax
   - Check for broken links
   - Test on sandbox project before production

## Technical Approach

### Version Tracking
```yaml
# In each central doc
---
doc_version: "1.2.3"
last_updated: "2026-01-17"
changelog:
  - version: "1.2.3"
    date: "2026-01-17"
    changes: "Added SCAR verification patterns"
  - version: "1.2.2"
    date: "2026-01-15"
    changes: "Updated learning system docs"
---
```

### Supervisor Version Reporting
```yaml
# In workflow-status.yaml
supervisor_config:
  doc_versions:
    role-and-responsibilities: "1.2.0"
    scar-command-reference: "1.3.1"
    bmad-workflow: "1.1.0"
  last_update_check: "2026-01-17T09:30:00+01:00"
  update_available: false
```

### Update Notification
```bash
# Watch central docs for changes
# On change detected:
# 1. Increment version
# 2. Log change in changelog
# 3. Create notification file
# 4. Active supervisors read notification on next operation
```

## Success Metrics

- Update propagation time: <5 minutes (from commit to notification)
- Version reporting accuracy: 100% (always know which version in use)
- Rollback time: <2 minutes (emergency rollback)
- Update failure rate: <1% (validated before rollout)

## Dependencies

**Blocked By:**
- Epic #003: SCAR integration improvements (may inform update mechanisms)

**Blocks:**
- None

**External Dependencies:**
- Git for version tracking and rollback

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking change in docs breaks all supervisors | Medium | Critical | Testing framework + gradual rollout |
| Version tracking adds complexity | Low | Low | Keep simple, use semantic versioning |
| Notification system unreliable | Low | Medium | Multiple notification channels, manual fallback |

## Testing Strategy

### Validation Tests
- YAML syntax validation
- Markdown rendering validation
- Link checking (no broken links)
- Version number format validation

### Integration Tests
- Update notification delivery
- Version reporting accuracy
- Rollback mechanism works
- Gradual rollout works

### Manual Testing
- [ ] Make change to central doc
- [ ] Verify version incremented
- [ ] Verify notification sent
- [ ] Verify supervisor reports new version
- [ ] Test rollback
- [ ] Verify rollback successful

## Notes

### Design Principles

1. **Safety first:** Test before rollout, easy rollback
2. **Transparency:** Always know which version in use
3. **Graceful degradation:** Manual fallback if automation fails
4. **Minimal overhead:** Version tracking shouldn't slow down work

### Future Enhancements

- Automatic rollback on error detection
- Canary deployments (test on subset of projects)
- Impact prediction (AI predicts effect of changes)
- Change recommendations (suggest improvements based on usage)

### References

- Centralized system: `CENTRALIZED-SUPERVISOR-SYSTEM.md`
- Current update process: Manual notification ("Reload your instructions")
