---
id: 002
date: 2026-01-15
category: github-automation
tags: [api, rate-limit, gh-cli, github]
severity: medium
projects-affected: [all]
---

# Problem: GitHub API Rate Limit Exceeded During Bulk Operations

## Symptoms

- `gh` commands fail with "API rate limit exceeded"
- Unable to create multiple issues in quick succession
- Error: "You have exceeded a secondary rate limit"
- Operations that worked individually fail when batched

## Context

Creating multiple GitHub issues, pull requests, or other resources in rapid succession (e.g., creating 10+ user story issues for an epic).

## Root Cause

GitHub has two rate limits:

1. **Primary rate limit:** 5,000 requests/hour for authenticated users
2. **Secondary rate limit:** Prevents rapid-fire requests (usually ~60 requests/minute)

When creating many issues quickly (like all user stories for an epic), you hit the secondary rate limit even if well under the primary limit.

## Solution

**Pattern:** Batch with Delays

Add delays between bulk operations:

```bash
# Bad: Create all issues at once
for story in story1 story2 story3; do
  gh issue create --title "$story" --body "..."
done

# Good: Add delay between creates
for story in story1 story2 story3; do
  gh issue create --title "$story" --body "..."
  sleep 2  # Wait 2 seconds between operations
done
```

**Alternative:** Use GitHub's GraphQL API for bulk operations (requires more setup but more efficient):

```bash
# Create a mutation that creates multiple issues in one API call
# (More complex, but avoids rate limits for large batches)
```

**Key steps:**
1. Identify bulk operations (>5 creates in quick succession)
2. Add `sleep 1-2` between operations
3. If rate limited, wait 60 seconds and retry
4. Consider GraphQL API for very large batches (20+ items)

## Prevention

1. **Add delays to templates** - Any script creating multiple resources
2. **Document in CLAUDE.md** - Note rate limits when describing GitHub operations
3. **Check rate limit status** - Before bulk ops: `gh api rate_limit`

Example pattern for CLAUDE.md:
```markdown
### Creating Multiple GitHub Issues:

**Rate Limit Awareness:**
- Add 1-2 second delay between issue creates
- Check remaining rate limit: `gh api rate_limit`
- If limited, wait 60 seconds

```bash
for story in "${stories[@]}"; do
  gh issue create --title "$story" --body "..."
  sleep 2
done
```
```

## Code/Config Examples

### Before (problematic)
```bash
# Create all 15 user stories at once
stories=(
  "US-001: User login"
  "US-002: User registration"
  # ... 13 more
)

for story in "${stories[@]}"; do
  gh issue create --title "$story" --body "See epic-003.md"
done

# Fails after ~8-10 issues: "API rate limit exceeded"
```

### After (fixed)
```bash
# Create with delays
stories=(
  "US-001: User login"
  "US-002: User registration"
  # ... 13 more
)

echo "Creating ${#stories[@]} issues with rate limit protection..."

for i in "${!stories[@]}"; do
  story="${stories[$i]}"
  echo "[$((i+1))/${#stories[@]}] Creating: $story"

  gh issue create --title "$story" --body "See epic-003.md"

  # Wait 2 seconds between creates (except for last one)
  if [ $i -lt $((${#stories[@]} - 1)) ]; then
    sleep 2
  fi
done

echo "✅ All issues created successfully"
```

**Even better:** Check rate limit first
```bash
# Check remaining rate limit
remaining=$(gh api rate_limit --jq '.rate.remaining')
echo "Rate limit remaining: $remaining"

if [ "$remaining" -lt 20 ]; then
  echo "⚠️  Low rate limit. Waiting 60 seconds..."
  sleep 60
fi

# Then proceed with creates
```

## Related Learnings

- #012 (github-bulk-operations) - Other GitHub automation patterns
- #018 (api-retry-strategies) - General API retry logic

## Impact

- **Time saved:** Prevents failed operations and manual retries
- **Reliability:** More robust bulk operations
- **Projects benefiting:** All projects using GitHub automation

## Notes

- Primary rate limit resets hourly (5,000 req/hour)
- Secondary rate limit is 60-second rolling window
- Authenticated requests have higher limits than unauthenticated
- GraphQL API has different (more generous) rate limits
- `sleep 1-2` is usually sufficient for most operations
- For 20+ items, consider 3-second delays or GraphQL API

---

**Documented by:** Root Supervisor
**Verified by:** Multiple bulk issue creation operations
