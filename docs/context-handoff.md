# Automatic Context Handoff (80% Threshold)

## Why Handoff?

**Problem:** Context window fills up during long planning sessions.

**Solution:** Automatic handoff at 80% (160K/200K tokens) with zero context loss.

## When to Trigger Handoff

**Monitor context usage continuously:**
- Check token count after each major operation
- Trigger at 80% of 200K limit (160K tokens)
- Don't wait for full context - proactive handoff

**Set mental checkpoints:**
- After completing major phase: Check tokens
- After spawning multiple subagents: Check tokens
- After long supervision run: Check tokens
- Before starting complex task: Check tokens

## Handoff Procedure

### 1. Detect Threshold Reached

```
Current tokens: 160,000 / 200,000 (80%)
→ TRIGGER HANDOFF
```

### 2. Create Handoff Document

```markdown
## Supervisor Handoff - [Project] - [Date]

**Context:** Mid-planning / Mid-supervision
**Project:** [project-name]
**Working Directory:** /home/samuel/supervisor/[project]/

### Current State
- Phase: [analysis/planning/architecture/implementation]
- Active Epic: [NNN-epic-name]
- GitHub Issues: [list with status]
- Complexity Level: [0-4]

### What's Been Done
- [List completed phases]
- [Files created with paths]
- [Decisions made (ADR links)]

### What's Next
- [Immediate next step]
- [Pending tasks]
- [Blockers or decisions needed]

### Context for Next Instance
- Read: .bmad/workflow-status.yaml (current state)
- Read: .bmad/epics/[active-epic].md (if applicable)
- Read: Latest GitHub issue comments (if supervising)
- Resume: [specific command or task]

### Critical Information
- [Any temporary state not in files]
- [User preferences expressed this session]
- [Important context that would be lost]
```

### 3. Save Handoff Document

```bash
# Save to project directory
/home/samuel/supervisor/[project]/.bmad/handoff-YYYY-MM-DD-HH-MM.md
```

### 4. Inform User

```
⚠️ Context window at 80% (160K tokens)

I've created a handoff document for continuity:
.bmad/handoff-2026-01-15-14-30.md

**To resume in fresh instance:**
1. Start new Claude Code session
2. cd /home/samuel/supervisor/[project]
3. Tell me: "Resume from handoff document"
4. I'll read the handoff and continue seamlessly

**Current status:**
- Phase: [phase]
- Next step: [what's next]
- All progress saved in .bmad/ files

Ready to continue or should I wait for fresh instance?
```

## Resuming from Handoff

**When user says "Resume from handoff":**

### 1. Find Most Recent Handoff

```bash
ls -t .bmad/handoff-*.md | head -1
```

### 2. Read Handoff Document

- Understand current state
- Load context from referenced files
- Identify next steps

### 3. Verify State

- Read workflow-status.yaml
- Check active epic (if exists)
- Review GitHub issues (if supervising)

### 4. Resume Work

- Continue exactly where previous instance left off
- No context loss
- Seamless continuation

## Handoff Best Practices

### Before Handoff, Ensure:

- [ ] All work committed to files (.bmad/ structure)
- [ ] workflow-status.yaml updated
- [ ] No critical state in conversation only
- [ ] GitHub issues have latest status comments
- [ ] User knows how to resume

### Handoff Preserves:

- ✅ All planning documents (epics, ADRs, PRDs)
- ✅ Workflow status (YAML)
- ✅ GitHub issue state
- ✅ Decisions made (in ADRs)
- ✅ Progress tracking

### Handoff Does NOT Preserve:

- ❌ In-flight subagent results (complete before handoff)
- ❌ Temporary conversation context (document if critical)
- ❌ User preferences not documented (note in handoff)

## Proactive vs Reactive Handoff

### Proactive (Recommended):

- Monitor tokens continuously
- Handoff at 80% (160K)
- Always have 40K buffer
- Clean handoff with user awareness

### Reactive (Avoid):

- Wait until context nearly full
- Rushed handoff at 95%
- Risk losing context
- Poor user experience

## Example Handoff Document

```markdown
## Supervisor Handoff - Consilio - 2026-01-15-14:30

**Context:** Mid-planning for user authentication feature
**Project:** consilio
**Working Directory:** /home/samuel/supervisor/consilio/

### Current State
- Phase: architecture
- Active Epic: 001-user-authentication
- GitHub Issues: Not yet created
- Complexity Level: 2

### What's Been Done
- ✅ Analysis complete (complexity: Level 2)
- ✅ Epic created: .bmad/epics/001-user-authentication.md
- ✅ ADR created: .bmad/adr/002-jwt-authentication.md
- ✅ workflow-status.yaml updated (current phase: architecture)

### What's Next
1. Create GitHub issues from epic task breakdown
2. Post issues with epic content attached
3. Tag @scar on each issue
4. Start supervision: /supervise-issue <numbers>

### Context for Next Instance
- Read: .bmad/workflow-status.yaml
- Read: .bmad/epics/001-user-authentication.md
- Read: .bmad/adr/002-jwt-authentication.md
- Task breakdown is in epic (section: Implementation Tasks)

### Critical Information
- User prefers JWT over sessions (security + scalability)
- Password reset feature deferred to v2 (noted in epic WON'T HAVE)
- SCAR should implement all MUST HAVE requirements first
- Testing strategy: Unit tests → Integration tests → E2E tests
```
