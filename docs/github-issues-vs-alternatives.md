# GitHub Issues vs Alternative Task Tracking

**Date:** 2026-01-18
**Question:** Should we still use GitHub issues with local PIV agents?

---

## The Original Reason for GitHub Issues

**With remote SCAR:**
- SCAR monitors GitHub via webhooks
- Issues are how you communicate with SCAR
- Comments are how SCAR reports progress
- PRs are created by SCAR automatically

**GitHub issues were the INTERFACE to SCAR.**

---

## With Local PIV Agents: Do We Still Need GitHub Issues?

**Short answer: NO - for task tracking**
**But YES - for audit trail and PR management**

### Option A: Skip GitHub Issues Entirely ❌

**Workflow:**
```
User: "Add dark mode to Consilio"
    ↓
Supervisor creates epic (local file)
    ↓
Supervisor spawns 5 PIV agents
    ↓
Agents implement, commit to feature branches
    ↓
Agents create PRs automatically
    ↓
Supervisor validates, auto-merges
    ↓
User sees: "Done!"
```

**Pros:**
- ✅ Simpler (no GitHub issue creation)
- ✅ Faster (no webhook delays)
- ✅ Fewer steps

**Cons:**
- ❌ No audit trail of what was requested
- ❌ Harder to see history ("What did I ask for last week?")
- ❌ Can't link multiple PRs to one feature
- ❌ No external tracking (if you share repo with others)

### Option B: Use GitHub Issues as Audit Trail Only ✅ RECOMMENDED

**Workflow:**
```
User: "Add dark mode to Consilio"
    ↓
Supervisor creates epic (local file)
Supervisor creates GitHub issue (for audit)
    ↓
Supervisor spawns 5 PIV agents
    ↓
Agents implement, commit to feature branches
Agents create PRs, link to issue
    ↓
Supervisor validates, auto-merges
Supervisor closes issue with summary
    ↓
User sees: "Done! Issue #42 closed"
```

**Pros:**
- ✅ Audit trail preserved
- ✅ Can see all features requested over time
- ✅ PRs linked to issues (GitHub shows relationships)
- ✅ External stakeholders can follow progress
- ✅ Issue becomes documentation ("Why did we add this?")

**Cons:**
- ⚠️ Slightly more steps (but automated)

### Option C: Use Simple Task Files Instead of GitHub Issues

**Alternative: Lightweight task tracking in repo**

```
/home/samuel/.archon/workspaces/consilio/
└── .tasks/
    ├── active/
    │   ├── 001-dark-mode.md
    │   └── 002-auth-system.md
    └── completed/
        └── 000-initial-setup.md
```

**Each task file:**
```markdown
# Task 001: Dark Mode

**Status:** In Progress (3/5 subtasks complete)
**Created:** 2026-01-18 14:30
**Epic:** epic-005-dark-mode.md

## Subtasks

- [x] Theme system setup (PR #123)
- [x] Color palette (PR #124)
- [x] Component updates (PR #125)
- [ ] User preference storage (in progress)
- [ ] Tests (not started)

## Progress

Agent 1 (theme-system): ✅ Complete
Agent 2 (color-palette): ✅ Complete
Agent 3 (components): ✅ Complete
Agent 4 (preferences): 🔄 60% (Phase 2/4)
Agent 5 (tests): ⏳ Waiting
```

**Pros:**
- ✅ Simple text files (no GitHub API calls)
- ✅ Version controlled (in Git)
- ✅ Faster than GitHub API
- ✅ Works offline

**Cons:**
- ❌ No web UI (must read files)
- ❌ Not visible to external stakeholders
- ❌ No PR linking automation

---

## Recommendation: Hybrid Approach ✅

**Use GitHub issues for features, skip them for small tasks**

### Create GitHub Issue When:
- ✅ Feature request from user
- ✅ Epic-level work (multiple PRs)
- ✅ Work spanning multiple agents
- ✅ External stakeholders need visibility

### Skip GitHub Issue When:
- ❌ Quick bug fixes (single PR)
- ❌ Documentation updates
- ❌ Internal refactoring
- ❌ Testing/validation only

### Example:

**User says:** "Add dark mode to Consilio"
```
Supervisor:
  1. Create epic file
  2. Create GitHub issue #42 (links to epic)
  3. Spawn 5 PIV agents
  4. Agents create PRs #123, #124, #125, #126, #127
     (all reference issue #42)
  5. Auto-merge PRs as they pass
  6. Close issue #42 with summary

User sees: "Dark mode complete! See issue #42 for details."
```

**User says:** "Fix typo in README"
```
Supervisor:
  1. No epic needed
  2. No issue needed
  3. Spawn 1 PIV agent
  4. Agent creates PR #128 (no issue reference)
  5. Auto-merge PR
  6. Done

User sees: "Typo fixed!"
```

---

## Benefits of Keeping GitHub Issues

### 1. Searchable History
```bash
# Find all authentication-related work
gh issue list --search "auth" --state closed

# See what was done last month
gh issue list --search "closed:>2026-01-01"

# Find all epic implementations
gh issue list --label "epic"
```

### 2. PR Context
When reviewing a PR, you can see:
- What issue it solves
- Why the feature was requested
- Original requirements
- Discussion/decisions

### 3. External Collaboration
If you ever:
- Add a co-founder
- Hire a developer
- Open-source a project
- Share with stakeholders

GitHub issues provide context they can understand.

### 4. Integration Ecosystem
GitHub issues integrate with:
- Project boards (Kanban view)
- Milestones (group issues by release)
- Labels (categorize work)
- Assignees (track ownership)
- Mentions (notify people)

### 5. Timeline/Activity Feed
GitHub shows:
- When issue was created
- When PRs were linked
- When PRs were merged
- When issue was closed
- All in chronological order

---

## Simplified GitHub Issue Workflow

**With supervisor-service, issues become automatic:**

```typescript
// In supervisor-service
class ProjectSupervisor {
  async handleFeatureRequest(userMessage: string) {
    // 1. Create epic
    const epic = await this.createEpic(userMessage);

    // 2. Auto-create GitHub issue
    const issue = await this.github.createIssue({
      title: epic.title,
      body: `
Epic: ${epic.filePath}

${epic.description}

## Implementation Plan
${epic.phases.map(p => `- [ ] ${p.title}`).join('\n')}

## Acceptance Criteria
${epic.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}
      `,
      labels: ['epic', 'automated']
    });

    // 3. Spawn PIV agents
    const agents = await this.spawnPIVAgents(epic.tasks);

    // 4. Monitor progress, update issue
    for await (const update of this.monitorAgents(agents)) {
      await this.github.commentOnIssue(issue.number,
        `Progress: ${update.completed}/${update.total} tasks complete`
      );
    }

    // 5. Close issue when done
    await this.github.closeIssue(issue.number,
      `✅ All tasks complete. ${agents.length} PRs merged.`
    );
  }
}
```

**User never manually creates issues - supervisor does it automatically!**

---

## What About Issue Numbers?

**Problem:** With local agents, you don't need issue numbers for tracking.

**Solution:** Use issue numbers for AUDIT ONLY.

**Instead of:**
```
worktree: /home/samuel/.archon/worktrees/consilio/issue-42/
```

**Use:**
```
worktree: /home/samuel/.archon/worktrees/consilio/dark-mode/
```

**But still create issue #42 for:**
- Historical record
- PR linking
- User-facing reference

---

## Comparison Table

| Aspect | GitHub Issues | Local Task Files | No Tracking |
|--------|---------------|------------------|-------------|
| **Setup** | Automatic (via API) | Create .tasks/ dir | None |
| **Speed** | API calls (~1s) | Instant | Instant |
| **Offline** | ❌ Requires internet | ✅ Works offline | ✅ Works offline |
| **Audit Trail** | ✅ Permanent, searchable | ✅ In Git history | ❌ Lost |
| **PR Linking** | ✅ Automatic | ❌ Manual | ❌ No linking |
| **External Visibility** | ✅ Web UI | ❌ Must read files | ❌ Nothing |
| **Search** | ✅ GitHub search | ⚠️ grep/find | ❌ Nothing |
| **Collaboration** | ✅ Comments, mentions | ⚠️ Git commits | ❌ Nothing |
| **Cost** | ✅ Free (GitHub) | ✅ Free | ✅ Free |

---

## Final Recommendation

**✅ Keep GitHub Issues for Features**

**But make them AUTOMATIC:**
- Supervisor creates issues (user doesn't)
- Issues serve as audit trail
- PRs automatically link to issues
- Issues auto-close when complete
- User sees simple summary, can click issue link for details

**Configuration (supervisor-service):**
```yaml
# .config/supervisor.yaml
github:
  auto_create_issues: true
  issue_for_features: true  # Create issue for epic-level work
  issue_for_bugs: true      # Create issue for bug fixes
  issue_for_tasks: false    # Skip issue for small tasks

  auto_close_issues: true
  link_prs_to_issues: true
```

**This gives you:**
- ✅ Audit trail preserved
- ✅ No manual issue creation (supervisor does it)
- ✅ PR organization (all PRs linked to parent issue)
- ✅ Simple user experience (just see "Done!")
- ✅ Searchable history (GitHub search)

**Best of both worlds!**
