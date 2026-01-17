---
description: Verify SCAR acknowledged instruction and started working (20s check, 3 retries)
argument-hint: <issue-number>
---

# Verify SCAR Start: Acknowledgment and Startup Verification

**Spawned by:** `supervise-issue.md` immediately after posting SCAR instruction

## Arguments

- `$1`: Issue number (e.g., "42")

## Mission

Verify SCAR received the instruction and started working within 2 minutes (20s check + 2 retries).

**Core Principle:** If SCAR doesn't acknowledge, FIX THE ISSUE (don't message user).

## Workflow

### 1. Wait and Check (Attempt 1)

```bash
ISSUE_NUM=$1

echo "⏳ Waiting 20 seconds for SCAR acknowledgment..."
sleep 20

# Check for SCAR's acknowledgment comment
RESPONSE=$(gh issue view $ISSUE_NUM --json comments \
  --jq '.comments[-5:] | .[] | select(.body | contains("SCAR is on the case")) | .createdAt' \
  | head -1)

if [ -n "$RESPONSE" ]; then
  echo "✅ SCAR acknowledged at: $RESPONSE"
  exit 0
else
  echo "⏳ No acknowledgment yet - retrying..."
fi
```

### 2. Retry 1 (40s total)

```bash
echo "⏳ Waiting additional 40 seconds (retry 1)..."
sleep 40

RESPONSE=$(gh issue view $ISSUE_NUM --json comments \
  --jq '.comments[-5:] | .[] | select(.body | contains("SCAR is on the case")) | .createdAt' \
  | head -1)

if [ -n "$RESPONSE" ]; then
  echo "✅ SCAR acknowledged at: $RESPONSE (after retry 1)"
  exit 0
else
  echo "⏳ Still no acknowledgment - final retry..."
fi
```

### 3. Retry 2 (60s total = 120s)

```bash
echo "⏳ Waiting additional 60 seconds (retry 2)..."
sleep 60

RESPONSE=$(gh issue view $ISSUE_NUM --json comments \
  --jq '.comments[-5:] | .[] | select(.body | contains("SCAR is on the case")) | .createdAt' \
  | head -1)

if [ -n "$RESPONSE" ]; then
  echo "✅ SCAR acknowledged at: $RESPONSE (after retry 2)"
  exit 0
else
  echo "❌ No acknowledgment after 2 minutes - diagnosing..."
fi
```

### 4. Diagnosis (After 3 Failures)

**Automatically diagnose the issue:**

```bash
echo "🔍 Running diagnostics..."

# Check 1: Verify webhook configuration
echo "=== Webhook Check ==="
WEBHOOKS=$(gh api repos/:owner/:repo/hooks --jq '.[].config.url' 2>/dev/null || echo "")

if echo "$WEBHOOKS" | grep -q "code.153.se"; then
  echo "✅ SCAR webhook configured"
else
  echo "❌ SCAR webhook NOT found"
  WEBHOOK_ISSUE="missing"
fi

# Check 2: Verify SCAR server health
echo "=== SCAR Server Health ==="
SCAR_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://code.153.se/health 2>/dev/null || echo "000")

if [ "$SCAR_HEALTH" = "200" ]; then
  echo "✅ SCAR server: HEALTHY"
else
  echo "❌ SCAR server: DOWN or UNREACHABLE (HTTP $SCAR_HEALTH)"
  SCAR_SERVER_ISSUE="down"
fi

# Check 3: Check recent webhook deliveries
echo "=== Recent Webhook Deliveries ==="
RECENT_DELIVERIES=$(gh api repos/:owner/:repo/hooks/:hook_id/deliveries --jq '.[0:3]' 2>/dev/null || echo "[]")

if [ "$RECENT_DELIVERIES" != "[]" ]; then
  echo "Recent webhook attempts found"
  # Check for failures
  FAILED_DELIVERIES=$(echo "$RECENT_DELIVERIES" | jq '.[] | select(.status != 200)' || echo "")

  if [ -n "$FAILED_DELIVERIES" ]; then
    echo "⚠️ Found failed webhook deliveries"
  fi
else
  echo "⚠️ No recent webhook deliveries found"
fi

# Check 4: Read last posted command
echo "=== Last Command Posted ==="
LAST_COMMAND=$(gh issue view $ISSUE_NUM --json comments \
  --jq '.comments[-3:] | .[] | select(.body | contains("@scar")) | .body' \
  | tail -1)

echo "Command posted:"
echo "$LAST_COMMAND"

# Check for common command errors
if ! echo "$LAST_COMMAND" | grep -q "@scar"; then
  echo "❌ ERROR: @scar mention missing from command"
  COMMAND_ISSUE="no_mention"
fi

if ! echo "$LAST_COMMAND" | grep -q "/command-invoke"; then
  echo "⚠️ WARNING: Command may not be in /command-invoke format"
fi
```

### 5. Automatic Fix Attempt

```bash
echo "=== Attempting Automatic Fix ==="

# If webhook missing, cannot auto-fix (needs repo admin)
if [ "$WEBHOOK_ISSUE" = "missing" ]; then
  echo "❌ Cannot auto-fix: Webhook not configured"
  FIXABLE=false
fi

# If SCAR server down, cannot fix
if [ "$SCAR_SERVER_ISSUE" = "down" ]; then
  echo "❌ Cannot auto-fix: SCAR server unreachable"
  FIXABLE=false
fi

# If command format wrong, can retry with corrected format
if [ "$COMMAND_ISSUE" = "no_mention" ]; then
  echo "🔧 Attempting to fix: Re-posting command with @scar mention"

  # Extract original command (remove @scar if it exists, then re-add)
  CLEAN_CMD=$(echo "$LAST_COMMAND" | sed 's/@scar //g')

  # Re-post with explicit @scar mention
  gh issue comment $ISSUE_NUM --body "@scar $CLEAN_CMD"

  echo "✅ Re-posted command with proper @scar mention"
  echo "⏳ Waiting 20 seconds for acknowledgment..."
  sleep 20

  RESPONSE=$(gh issue view $ISSUE_NUM --json comments \
    --jq '.comments[-5:] | .[] | select(.body | contains("SCAR is on the case")) | .createdAt' \
    | head -1)

  if [ -n "$RESPONSE" ]; then
    echo "✅ SCAR acknowledged after fix!"
    exit 0
  else
    echo "❌ Still no acknowledgment after fix"
  fi
fi

# If still no acknowledgment, try simple ping
if [ -z "$RESPONSE" ]; then
  echo "🔧 Attempting simple ping to SCAR..."

  gh issue comment $ISSUE_NUM --body "@scar /command-invoke status"

  sleep 15

  PING_RESPONSE=$(gh issue view $ISSUE_NUM --json comments \
    --jq '.comments[-2:] | .[] | select(.body | contains("SCAR")) | .createdAt' \
    | head -1)

  if [ -n "$PING_RESPONSE" ]; then
    echo "✅ SCAR responded to ping - original command may have issues"
    echo "⚠️ Original command needs review"
  else
    echo "❌ SCAR not responding to ping either"
  fi
fi
```

### 6. Generate Diagnostic Report

```bash
cat > /tmp/verify-start-$ISSUE_NUM-report.md <<EOF
# SCAR Start Verification Failed: Issue #$ISSUE_NUM

**Status:** SCAR did not acknowledge instruction after 2 minutes

## Diagnostic Results

### Webhook Status
- Configured: $([ "$WEBHOOK_ISSUE" != "missing" ] && echo "✅ Yes" || echo "❌ No")
- Issue: $WEBHOOK_ISSUE

### SCAR Server Status
- Health check: HTTP $SCAR_HEALTH
- Status: $([ "$SCAR_SERVER_ISSUE" != "down" ] && echo "✅ Healthy" || echo "❌ Down/Unreachable")

### Command Format
- @scar mention: $(echo "$LAST_COMMAND" | grep -q "@scar" && echo "✅ Present" || echo "❌ Missing")
- /command-invoke: $(echo "$LAST_COMMAND" | grep -q "/command-invoke" && echo "✅ Present" || echo "⚠️ Not found")

### Last Command Posted
\`\`\`
$LAST_COMMAND
\`\`\`

## Possible Causes

1. **Webhook not configured** - Requires repo admin to add webhook
2. **SCAR server down** - Check https://code.153.se/health
3. **Command format error** - @scar mention missing or wrong format
4. **GitHub webhook delivery failure** - Check repo settings > Webhooks
5. **SCAR overwhelmed** - Too many concurrent requests

## Recommended Actions

$(if [ "$WEBHOOK_ISSUE" = "missing" ]; then
  echo "- ❗ ADD SCAR WEBHOOK: Repo Settings > Webhooks > Add webhook"
  echo "  - URL: https://code.153.se/webhook/github"
  echo "  - Content type: application/json"
  echo "  - Events: Issue comments"
fi)

$(if [ "$SCAR_SERVER_ISSUE" = "down" ]; then
  echo "- ❗ SCAR SERVER DOWN: Contact SCAR admin or wait for recovery"
fi)

$(if [ "$COMMAND_ISSUE" = "no_mention" ]; then
  echo "- ✅ ATTEMPTED FIX: Re-posted command with @scar mention"
fi)

- Manual verification: Check recent webhook deliveries in repo settings
- Alternative: Try simpler command (e.g., @scar /command-invoke status)
- Escalation: If persistent, notify SCAR admin

EOF

cat /tmp/verify-start-$ISSUE_NUM-report.md
```

### 7. Decision: Escalate or Auto-Fix

```bash
# If fixable issue, report success of fix
if [ -n "$RESPONSE" ]; then
  echo "✅ SCAR STARTED (after auto-fix)"
  cat <<EOF
{
  "status": "started",
  "issue": $ISSUE_NUM,
  "acknowledgment_time": "$RESPONSE",
  "retries": $([ -n "$WEBHOOK_ISSUE" ] && echo 4 || echo 3),
  "auto_fixed": true,
  "fix_type": "$([ -n "$COMMAND_ISSUE" ] && echo "command_format" || echo "retry")"
}
EOF
  exit 0
fi

# If not fixable, return diagnostic report for supervisor
cat <<EOF
{
  "status": "failed",
  "issue": $ISSUE_NUM,
  "webhook_issue": "$WEBHOOK_ISSUE",
  "server_issue": "$SCAR_SERVER_ISSUE",
  "command_issue": "$COMMAND_ISSUE",
  "report_file": "/tmp/verify-start-$ISSUE_NUM-report.md",
  "fixable": false,
  "message": "⚠️ SCAR did not start on issue #$ISSUE_NUM

**Diagnostics run:**
- Webhook: $([ "$WEBHOOK_ISSUE" = "missing" ] && echo "❌ NOT CONFIGURED" || echo "✅ OK")
- Server: $([ "$SCAR_SERVER_ISSUE" = "down" ] && echo "❌ DOWN" || echo "✅ OK")
- Command: $([ "$COMMAND_ISSUE" = "no_mention" ] && echo "❌ FORMAT ERROR (attempted fix)" || echo "✅ OK")

**Recommended action:**
$(if [ "$WEBHOOK_ISSUE" = "missing" ]; then echo "Configure SCAR webhook in repo settings"; elif [ "$SCAR_SERVER_ISSUE" = "down" ]; then echo "Wait for SCAR server recovery or contact admin"; else echo "Manually verify command format and retry"; fi)

**Full report:** /tmp/verify-start-$ISSUE_NUM-report.md"
}
EOF

exit 1
```

## Auto-Fix Strategies

### ✅ Can Auto-Fix:

1. **Missing @scar mention** - Re-post with mention
2. **Network glitch** - Retry with delays
3. **Race condition** - Wait longer, check again

### ❌ Cannot Auto-Fix (Escalate):

1. **Webhook not configured** - Needs repo admin
2. **SCAR server down** - Needs SCAR admin
3. **Wrong repo permissions** - Needs access management
4. **GitHub outage** - Wait for recovery

## Success Metrics

- ✅ Detects SCAR start within 20 seconds (80% of cases)
- ✅ Auto-fixes command format errors
- ✅ Provides actionable diagnostics when fails
- ✅ Never escalates fixable issues to user
- ✅ Retry success rate: 90%+ (after retries)

## Context Usage

**Tokens:** ~3-5K (minimal, fast checks)

---

**This subagent implements the 20s/3-retry protocol and automatically fixes common startup issues.**
