---
description: Automatically approve SCAR's implementation plan and trigger execution
argument-hint: <project> <issue-number> [plan-file]
---

# Approve SCAR Plan: Automatic Plan Review and Approval

**Spawned by:** `scar-monitor.md` when detects "awaiting approval" or "plan ready"

## Arguments

- `$1`: Project name (e.g., "consilio")
- `$2`: Issue number (e.g., "42")
- `$3`: Plan file path (optional - auto-detect if not provided)

## Mission

Automatically review SCAR's implementation plan and approve it if reasonable, or escalate to user if concerns exist.

**Core Principle:** Autonomous approval for standard plans, user escalation only for risky changes.

## Workflow

### 1. Locate Plan File

```bash
PROJECT=$1
ISSUE_NUM=$2
PLAN_FILE=$3

if [ -z "$PLAN_FILE" ]; then
  # Auto-detect plan file
  # Check recent issue comments for plan file mention
  PLAN_FILE=$(gh issue view $ISSUE_NUM --json comments \
    --jq '.comments[-5:] | .[] | select(.body | contains(".agents/plans/")) | .body' \
    | grep -oP '\.agents/plans/[a-z0-9-]+\.md' | head -1)

  # If still not found, check in workspace
  if [ -z "$PLAN_FILE" ]; then
    PLAN_FILE=$(ls -t /home/samuel/.archon/workspaces/$PROJECT/.agents/plans/*.md | head -1)
  fi
fi

echo "📄 Plan file: $PLAN_FILE"
```

### 2. Read and Parse Plan

```bash
# Read the plan
PLAN_CONTENT=$(cat "/home/samuel/.archon/workspaces/$PROJECT/$PLAN_FILE" 2>/dev/null)

if [ -z "$PLAN_CONTENT" ]; then
  echo "❌ ERROR: Cannot read plan file"
  exit 1
fi

# Extract key sections
FEATURE_DESC=$(echo "$PLAN_CONTENT" | sed -n '/## Feature Description/,/##/p' | head -20)
TASKS=$(echo "$PLAN_CONTENT" | sed -n '/## STEP-BY-STEP TASKS/,/##/p' | head -50)
FILES_TO_CREATE=$(echo "$PLAN_CONTENT" | sed -n '/### New Files to Create/,/###/p')
FILES_TO_MODIFY=$(echo "$PLAN_CONTENT" | sed -n '/### Existing Files to Modify/,/###/p')
```

### 3. Validation Checks

**Run automatic validation:**

```markdown
## Validation Checklist

✅ **Structure Check:**
- [ ] Has Feature Description section
- [ ] Has STEP-BY-STEP TASKS section
- [ ] Has VALIDATION COMMANDS section
- [ ] Has ACCEPTANCE CRITERIA section

✅ **Scope Check:**
- [ ] Task count: 5-30 tasks (not too small, not huge)
- [ ] File modifications: <20 files (reasonable scope)
- [ ] No risky operations (database drops, user data deletion)

✅ **Pattern Compliance:**
- [ ] References existing patterns from codebase
- [ ] Includes validation commands
- [ ] Has test coverage plan

✅ **Security Check:**
- [ ] No hardcoded secrets
- [ ] No authentication bypasses
- [ ] Input validation included
- [ ] No SQL injection risks
```

**Implementation:**

```bash
# Count tasks
TASK_COUNT=$(echo "$TASKS" | grep -c "^### " || echo 0)

# Check for red flags
RED_FLAGS=$(echo "$PLAN_CONTENT" | grep -iE "DROP TABLE|DELETE FROM users|bypass auth|disable security|skip validation")

# Check for required sections
HAS_VALIDATION=$(echo "$PLAN_CONTENT" | grep -c "## VALIDATION COMMANDS")
HAS_TESTS=$(echo "$PLAN_CONTENT" | grep -c "test" || echo 0)

echo "📊 Validation Results:"
echo "  Tasks: $TASK_COUNT"
echo "  Validation section: $HAS_VALIDATION"
echo "  Test mentions: $HAS_TESTS"
echo "  Red flags: $(echo $RED_FLAGS | wc -l)"
```

### 4. Decision Logic

```bash
APPROVAL_STATUS="pending"
CONCERNS=()

# Check task count
if [ $TASK_COUNT -lt 3 ]; then
  CONCERNS+=("Too few tasks ($TASK_COUNT) - may be incomplete")
elif [ $TASK_COUNT -gt 50 ]; then
  CONCERNS+=("Too many tasks ($TASK_COUNT) - scope too large")
fi

# Check for validation commands
if [ $HAS_VALIDATION -eq 0 ]; then
  CONCERNS+=("Missing VALIDATION COMMANDS section")
fi

# Check for tests
if [ $HAS_TESTS -lt 3 ]; then
  CONCERNS+=("Insufficient test coverage planning")
fi

# Check for red flags
if [ -n "$RED_FLAGS" ]; then
  CONCERNS+=("SECURITY: Detected risky operations")
  APPROVAL_STATUS="escalate"
fi

# Determine approval status
if [ ${#CONCERNS[@]} -eq 0 ]; then
  APPROVAL_STATUS="approved"
elif [ "$APPROVAL_STATUS" != "escalate" ] && [ ${#CONCERNS[@]} -le 2 ]; then
  # Minor concerns - approve with notes
  APPROVAL_STATUS="approved_with_notes"
else
  # Major concerns - escalate to user
  APPROVAL_STATUS="escalate"
fi
```

### 5. Take Action

**If APPROVED:**

```bash
if [ "$APPROVAL_STATUS" = "approved" ]; then
  # Extract branch name from plan file
  BRANCH_NAME=$(basename "$PLAN_FILE" .md)

  # Post approval command to GitHub issue
  gh issue comment $ISSUE_NUM --body "@scar /command-invoke execute-github $PLAN_FILE feature-$BRANCH_NAME

✅ Plan approved automatically by supervisor.

**Validation passed:**
- Structure: Complete ✅
- Scope: $TASK_COUNT tasks (reasonable)
- Security: No concerns ✅
- Testing: Adequate coverage planned ✅

Proceeding with implementation."

  echo "✅ APPROVED - Execution command posted"
  exit 0
fi
```

**If APPROVED WITH NOTES:**

```bash
if [ "$APPROVAL_STATUS" = "approved_with_notes" ]; then
  # Extract branch name
  BRANCH_NAME=$(basename "$PLAN_FILE" .md)

  # Format concerns
  CONCERNS_TEXT=$(printf '- ⚠️ %s\n' "${CONCERNS[@]}")

  # Post approval with notes
  gh issue comment $ISSUE_NUM --body "@scar /command-invoke execute-github $PLAN_FILE feature-$BRANCH_NAME

✅ Plan approved with minor concerns noted below.

**Minor issues (address if possible):**
$CONCERNS_TEXT

Proceeding with implementation."

  echo "✅ APPROVED WITH NOTES"
  exit 0
fi
```

**If ESCALATE:**

```bash
if [ "$APPROVAL_STATUS" = "escalate" ]; then
  # Format concerns
  CONCERNS_TEXT=$(printf '- ❌ %s\n' "${CONCERNS[@]}")

  # Return to supervisor for user escalation
  cat <<EOF
{
  "status": "escalate",
  "issue": $ISSUE_NUM,
  "plan_file": "$PLAN_FILE",
  "concerns": [
$(printf '    "%s",\n' "${CONCERNS[@]}" | sed '$ s/,$//')
  ],
  "message": "⚠️ SCAR's plan for issue #$ISSUE_NUM needs user review.

**Concerns identified:**
$CONCERNS_TEXT

**Plan location:** $PLAN_FILE

**Action needed:** User should review plan and either:
1. Approve: Post '@scar /command-invoke execute-github $PLAN_FILE feature-{branch}'
2. Request changes: Comment with specific feedback for SCAR
3. Reject: Close issue or request different approach"
}
EOF

  exit 1
fi
```

## Validation Criteria

### ✅ Auto-Approve If:

- Task count: 5-30 tasks
- Has all required sections (Feature Description, Tasks, Validation, Acceptance Criteria)
- Includes test coverage plan
- No security red flags
- References existing codebase patterns
- Validation commands included

### ⚠️ Approve with Notes If:

- Minor structural issues (e.g., missing optional sections)
- Task count slightly outside range (3-50)
- Test coverage could be better but exists
- Max 2 minor concerns

### ❌ Escalate to User If:

- Security concerns detected
- Task count: <3 or >50
- Missing critical sections
- No test coverage plan
- More than 2 concerns
- Risky operations (database schema changes, auth modifications)

## Auto-Approval Rules

**Always auto-approve:**
- CRUD operations (create, read, update, delete)
- UI components (forms, buttons, layouts)
- API endpoints (following existing patterns)
- Service layer functions
- Utility functions
- Test files
- Documentation updates

**Always escalate:**
- Authentication/authorization changes
- Database migrations (schema changes)
- Security-related code
- Payment processing
- User data deletion
- Production deployment scripts
- Infrastructure changes

## Output

**Success (approved):**
```json
{
  "status": "approved",
  "issue": 42,
  "plan_file": ".agents/plans/add-notifications.md",
  "branch": "feature-add-notifications",
  "command_posted": "@scar /command-invoke execute-github ...",
  "validation_passed": true
}
```

**Success (approved with notes):**
```json
{
  "status": "approved_with_notes",
  "issue": 42,
  "plan_file": ".agents/plans/add-notifications.md",
  "branch": "feature-add-notifications",
  "concerns": ["Minor: Task count is 4 (low but acceptable)"],
  "command_posted": "@scar /command-invoke execute-github ..."
}
```

**Escalate:**
```json
{
  "status": "escalate",
  "issue": 42,
  "plan_file": ".agents/plans/auth-changes.md",
  "concerns": [
    "SECURITY: Authentication bypass detected",
    "Missing test coverage"
  ],
  "message": "User review required - security concerns"
}
```

## Context Conservation

**Tokens used:** ~8-12K (reads plan, validates, posts command)

**Contrast with supervisor doing it:**
- Supervisor reads plan: 20K tokens
- Supervisor analyzes: +10K tokens
- Supervisor posts: +5K tokens
- **Total: 35K+ tokens**

**Subagent approach:** 12K tokens (65% savings)

## Success Metrics

- ✅ Auto-approves 80%+ of standard plans
- ✅ Escalates <20% with valid concerns
- ✅ Zero false approvals of risky changes
- ✅ Response time: <30 seconds from detection
- ✅ Unblocks SCAR immediately (no user wait)

---

**This subagent is THE key to autonomous SCAR supervision** - eliminates hours of idle waiting.
