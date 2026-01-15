---
id: 005
date: 2026-01-15
category: scar-integration
tags: [scar, monitoring, timing, efficiency, idle-time]
severity: high
projects-affected: [all]
---

# Problem: SCAR Sits Idle for Hours After Completing Work

## Symptoms

- SCAR posts "Implementation complete" comment on GitHub issue
- Supervisor doesn't check issue for hours
- SCAR sits idle waiting for verification
- Massive time waste (hours per task)
- User has to manually ask "is SCAR done yet?"

## Context

Supervisor has proactive checking behavior: "Every X while SCAR is working, check issue for new comments." The frequency was mistakenly changed from **2 minutes** to **2 hours**, causing SCAR to sit idle for extended periods after completing work.

## Root Cause

Checking frequency set to "Every 2 hours" instead of "Every 2 minutes" in CLAUDE.md proactive behaviors section.

When SCAR finishes work and posts completion comment, supervisor only checks every 2 hours, so:
- Best case: Noticed immediately (lucky timing)
- Average case: ~1 hour delay
- Worst case: ~2 hours of SCAR sitting idle

This compounds across multiple tasks, wasting many hours per day.

## Solution

**Pattern:** Check Every 2 Minutes

Set proactive checking to **2 minutes** in all project CLAUDE.md files:

```markdown
3. **Every 2 minutes while SCAR is working:**
   - Check issue for new comments (especially "Implementation complete")
   - Check worktree for file changes
   - Report progress to user proactively
   - CRITICAL: Don't let SCAR sit idle for hours after completing work
```

**Why 2 minutes:**
- Fast enough to catch completion quickly (max 2-minute delay)
- Not so frequent that it spams or wastes tokens
- Balances responsiveness with efficiency

**Alternative: Event-driven (future improvement)**
If GitHub webhook support exists, react immediately to SCAR's "Implementation complete" comment instead of polling.

## Prevention

1. **Add to CLAUDE.md template:** Always use 2-minute checking frequency
2. **Highlight in bold:** "CRITICAL: Don't let SCAR sit idle"
3. **Include in learning system:** This exact problem documented here
4. **Review during setup:** Verify timing when creating new projects

## Code/Config Examples

### Before (problematic)
```markdown
3. **Every 2 hours while SCAR is working:**
   - Check issue for new comments
   - Check worktree for file changes
   - Report progress to user proactively
```

Result: SCAR posts "done" at 10:00 AM, supervisor checks at 12:00 PM (2 hours wasted)

### After (fixed)
```markdown
3. **Every 2 minutes while SCAR is working:**
   - Check issue for new comments (especially "Implementation complete")
   - Check worktree for file changes
   - Report progress to user proactively
   - CRITICAL: Don't let SCAR sit idle for hours after completing work
```

Result: SCAR posts "done" at 10:00 AM, supervisor checks by 10:02 AM (max 2-minute delay)

## Related Learnings

- #002 (github-api-rate-limits) - Ensure 2-minute checks don't hit rate limits
- #001 (subagent-context-handoff) - Efficient verification after catching completion

## Impact

- **Time saved:** 1-2 hours per task (multiple tasks per day = many hours saved)
- **Efficiency:** SCAR stays productive, not idle
- **User experience:** No need to manually check "is SCAR done yet?"
- **Projects benefiting:** All projects using SCAR

## Notes

- 2-minute polling is safe from GitHub rate limits (30 checks/hour vs 5000 limit)
- If supervisor session ends, next supervisor should resume checking
- Consider notification system (webhooks) as future enhancement
- This timing was correct originally, got changed somehow, now restored

---

**Documented by:** Root Supervisor (2026-01-15)
**Verified by:** User reported hours lost to this issue
**Priority:** HIGH - Direct impact on productivity
