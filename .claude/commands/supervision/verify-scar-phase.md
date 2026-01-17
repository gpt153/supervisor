---
description: Comprehensive verification of SCAR's implementation - build, tests, quality checks
argument-hint: <project> <issue-number> <phase-number>
---

# Verify SCAR Phase: Comprehensive Implementation Verification

**Spawned by:** `supervise-issue.md` or `scar-monitor.md` when SCAR signals completion

## Arguments

- `$1`: Project name (e.g., "consilio", "health-agent", "odin")
- `$2`: Issue number (e.g., "42")
- `$3`: Phase number (e.g., "1" or "2") - optional, defaults to "1"

## Mission

Verify SCAR's implementation meets ALL quality standards before marking complete.

**Core Principle:** NEVER trust SCAR's summary. Always verify actual build output. (Learning 006)

## Prerequisites

- Issue must exist
- SCAR must have posted "implementation complete" or similar
- Worktree must exist at `/home/samuel/.archon/worktrees/{project}/issue-{N}/`

## Workflow

### 1. Locate Worktree

```bash
PROJECT=$1
ISSUE_NUM=$2
PHASE=${3:-1}

WORKTREE="/home/samuel/.archon/worktrees/$PROJECT/issue-$ISSUE_NUM"

if [ ! -d "$WORKTREE" ]; then
  echo "❌ ERROR: Worktree not found at $WORKTREE"
  exit 1
fi

echo "📂 Worktree: $WORKTREE"
cd "$WORKTREE"
```

### 2. Git Status Check

```bash
echo "=== Git Status ==="
git status --short > /tmp/verify-$ISSUE_NUM-git-status.txt

UNCOMMITTED=$(cat /tmp/verify-$ISSUE_NUM-git-status.txt | wc -l)

if [ $UNCOMMITTED -gt 0 ]; then
  echo "⚠️ WARNING: $UNCOMMITTED uncommitted changes"
  cat /tmp/verify-$ISSUE_NUM-git-status.txt
else
  echo "✅ All changes committed"
fi
```

### 3. Files Modified Check

```bash
echo "=== Files Modified ==="

# Get list of changed files
git diff --name-only origin/main...HEAD > /tmp/verify-$ISSUE_NUM-files.txt

FILE_COUNT=$(cat /tmp/verify-$ISSUE_NUM-files.txt | wc -l)
echo "📝 Files changed: $FILE_COUNT"

if [ $FILE_COUNT -eq 0 ]; then
  echo "❌ ERROR: No files changed - implementation appears empty"
  exit 1
fi

# Show changed files (first 20)
head -20 /tmp/verify-$ISSUE_NUM-files.txt
```

### 4. Build Validation

**Critical: Run ACTUAL build command (Learning 006)**

```bash
echo "=== Build Validation ==="

# Detect build command
if [ -f "package.json" ]; then
  BUILD_CMD="npm run build"
elif [ -f "Cargo.toml" ]; then
  BUILD_CMD="cargo build"
elif [ -f "go.mod" ]; then
  BUILD_CMD="go build ./..."
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  BUILD_CMD="python -m build"
else
  echo "⚠️ WARNING: Cannot detect build command"
  BUILD_CMD=""
fi

if [ -n "$BUILD_CMD" ]; then
  echo "🔨 Running: $BUILD_CMD"

  # Run build and capture output
  $BUILD_CMD > /tmp/verify-$ISSUE_NUM-build.log 2>&1
  BUILD_EXIT_CODE=$?

  # Get last 100 lines of build output
  tail -100 /tmp/verify-$ISSUE_NUM-build.log > /tmp/verify-$ISSUE_NUM-build-tail.txt

  if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Build: PASSED"
  else
    echo "❌ Build: FAILED (exit code: $BUILD_EXIT_CODE)"
    echo "--- Last 50 lines of build output ---"
    tail -50 /tmp/verify-$ISSUE_NUM-build.log
    exit 1
  fi
else
  echo "⚠️ Skipping build validation (no build command detected)"
fi
```

### 5. Type Checking (if applicable)

```bash
echo "=== Type Checking ==="

if [ -f "tsconfig.json" ]; then
  echo "🔍 Running TypeScript type check"
  npm run type-check > /tmp/verify-$ISSUE_NUM-typecheck.log 2>&1
  TYPE_EXIT_CODE=$?

  if [ $TYPE_EXIT_CODE -eq 0 ]; then
    echo "✅ Type check: PASSED"
  else
    echo "❌ Type check: FAILED"
    tail -50 /tmp/verify-$ISSUE_NUM-typecheck.log
    # Non-fatal - continue to other checks
  fi
elif command -v mypy &> /dev/null; then
  echo "🔍 Running mypy type check"
  mypy . > /tmp/verify-$ISSUE_NUM-typecheck.log 2>&1
  TYPE_EXIT_CODE=$?

  if [ $TYPE_EXIT_CODE -eq 0 ]; then
    echo "✅ Type check: PASSED"
  else
    echo "⚠️ Type check: Issues found (non-fatal)"
  fi
else
  echo "⚠️ No type checker found - skipping"
fi
```

### 6. Test Validation

```bash
echo "=== Test Validation ==="

# Detect test command
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
  TEST_CMD="npm test"
elif [ -f "Cargo.toml" ]; then
  TEST_CMD="cargo test"
elif [ -f "go.mod" ]; then
  TEST_CMD="go test ./..."
elif [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then
  TEST_CMD="pytest"
else
  TEST_CMD=""
fi

if [ -n "$TEST_CMD" ]; then
  echo "🧪 Running: $TEST_CMD"

  # Run tests with timeout (5 minutes max)
  timeout 300 $TEST_CMD > /tmp/verify-$ISSUE_NUM-test.log 2>&1
  TEST_EXIT_CODE=$?

  if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Tests: PASSED"
    # Extract test summary
    grep -E "passed|PASS|OK|All tests" /tmp/verify-$ISSUE_NUM-test.log | tail -5
  elif [ $TEST_EXIT_CODE -eq 124 ]; then
    echo "⚠️ Tests: TIMEOUT (exceeded 5 minutes)"
  else
    echo "❌ Tests: FAILED (exit code: $TEST_EXIT_CODE)"
    echo "--- Test failures ---"
    grep -A 5 "FAIL\|Error\|failed" /tmp/verify-$ISSUE_NUM-test.log | head -50
    # Tests failing is critical - but continue to see other issues
  fi
else
  echo "⚠️ No test command detected - skipping test validation"
fi
```

### 7. Mock/Placeholder Detection

**Critical: Check for incomplete implementations (Learning 006)**

```bash
echo "=== Mock/Placeholder Detection ==="

# Search for common mock patterns in changed files
MOCK_PATTERNS=(
  "TODO:"
  "FIXME:"
  "PLACEHOLDER"
  "return \[\]  // mock"
  "console\.log.*mock"
  "setTimeout.*mock"
  "// temporary"
  "// stub"
)

MOCK_COUNT=0

for pattern in "${MOCK_PATTERNS[@]}"; do
  FOUND=$(cat /tmp/verify-$ISSUE_NUM-files.txt | xargs grep -n "$pattern" 2>/dev/null || true)
  if [ -n "$FOUND" ]; then
    echo "⚠️ Found pattern: $pattern"
    echo "$FOUND" | head -3
    ((MOCK_COUNT++))
  fi
done

if [ $MOCK_COUNT -eq 0 ]; then
  echo "✅ No mock/placeholder patterns detected"
else
  echo "❌ Found $MOCK_COUNT mock/placeholder patterns"
  echo "⚠️ Code may not be production-ready"
fi
```

### 8. Code Quality Check

```bash
echo "=== Code Quality Check ==="

# Linting (if available)
if [ -f "package.json" ] && grep -q "\"lint\"" package.json; then
  echo "🔍 Running linter"
  npm run lint > /tmp/verify-$ISSUE_NUM-lint.log 2>&1
  LINT_EXIT_CODE=$?

  if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ Lint: PASSED"
  else
    echo "⚠️ Lint: Issues found"
    tail -20 /tmp/verify-$ISSUE_NUM-lint.log
  fi
fi

# Check for large files (>500 lines - might indicate need for refactoring)
LARGE_FILES=$(cat /tmp/verify-$ISSUE_NUM-files.txt | xargs wc -l 2>/dev/null | awk '$1 > 500 {print $2, $1}' || true)

if [ -n "$LARGE_FILES" ]; then
  echo "⚠️ Large files (>500 lines):"
  echo "$LARGE_FILES"
fi
```

### 9. Acceptance Criteria Check

```bash
echo "=== Acceptance Criteria Check ==="

# Read acceptance criteria from issue
ACCEPTANCE_CRITERIA=$(gh issue view $ISSUE_NUM --json body --jq '.body' \
  | sed -n '/Acceptance Criteria/,/##/p' \
  | grep -E '^\- \[ \]|^\* \[ \]' || echo "")

if [ -z "$ACCEPTANCE_CRITERIA" ]; then
  echo "⚠️ No acceptance criteria found in issue"
else
  echo "📋 Acceptance Criteria:"
  echo "$ACCEPTANCE_CRITERIA"
  echo ""
  echo "⚠️ Manual review needed to confirm all criteria met"
fi
```

### 10. Generate Verification Report

```bash
echo "=== Verification Summary ==="

# Collect all results
cat > /tmp/verify-$ISSUE_NUM-report.md <<EOF
# Verification Report: Issue #$ISSUE_NUM

**Project:** $PROJECT
**Issue:** #$ISSUE_NUM
**Phase:** $PHASE
**Worktree:** $WORKTREE
**Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Results

### Files Changed
- Count: $FILE_COUNT files
- Status: $([ $FILE_COUNT -gt 0 ] && echo "✅ PASS" || echo "❌ FAIL")

### Build
- Command: $BUILD_CMD
- Exit code: $BUILD_EXIT_CODE
- Status: $([ $BUILD_EXIT_CODE -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")

### Tests
- Command: $TEST_CMD
- Exit code: $TEST_EXIT_CODE
- Status: $([ $TEST_EXIT_CODE -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")

### Mock Detection
- Patterns found: $MOCK_COUNT
- Status: $([ $MOCK_COUNT -eq 0 ] && echo "✅ PASS" || echo "⚠️ WARNING")

## Detailed Logs

- Git status: /tmp/verify-$ISSUE_NUM-git-status.txt
- Build output: /tmp/verify-$ISSUE_NUM-build.log
- Test output: /tmp/verify-$ISSUE_NUM-test.log
- Type check: /tmp/verify-$ISSUE_NUM-typecheck.log

EOF

cat /tmp/verify-$ISSUE_NUM-report.md
```

### 11. Determine Verdict

```bash
# Calculate final verdict
VERDICT="UNKNOWN"
CRITICAL_FAILURES=0
WARNINGS=0

# Critical failures
[ $FILE_COUNT -eq 0 ] && ((CRITICAL_FAILURES++))
[ $BUILD_EXIT_CODE -ne 0 ] && ((CRITICAL_FAILURES++))
[ $TEST_EXIT_CODE -ne 0 ] && ((CRITICAL_FAILURES++))

# Warnings
[ $MOCK_COUNT -gt 0 ] && ((WARNINGS++))

# Determine verdict
if [ $CRITICAL_FAILURES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  VERDICT="APPROVED"
elif [ $CRITICAL_FAILURES -eq 0 ] && [ $WARNINGS -gt 0 ]; then
  VERDICT="APPROVED_WITH_WARNINGS"
else
  VERDICT="REJECTED"
fi

echo ""
echo "============================================"
echo "VERDICT: $VERDICT"
echo "Critical failures: $CRITICAL_FAILURES"
echo "Warnings: $WARNINGS"
echo "============================================"
```

### 12. Post Results to GitHub

```bash
# Format results for GitHub
if [ "$VERDICT" = "APPROVED" ]; then
  gh issue comment $ISSUE_NUM --body "## ✅ Verification PASSED

**All checks passed successfully!**

- ✅ Build: PASSED
- ✅ Tests: PASSED ($FILE_COUNT files changed)
- ✅ No mocks/placeholders detected

**Next step:** Create PR when ready.

<details>
<summary>Verification Details</summary>

$(cat /tmp/verify-$ISSUE_NUM-report.md)

</details>"

elif [ "$VERDICT" = "APPROVED_WITH_WARNINGS" ]; then
  gh issue comment $ISSUE_NUM --body "## ✅ Verification PASSED (with warnings)

**Build and tests passed, but minor issues detected:**

- ✅ Build: PASSED
- ✅ Tests: PASSED
- ⚠️ Warnings: $WARNINGS issue(s)

**Warnings:**
- Mock/placeholder patterns: $MOCK_COUNT found

Consider addressing warnings before creating PR.

<details>
<summary>Verification Details</summary>

$(cat /tmp/verify-$ISSUE_NUM-report.md)

</details>"

else
  # Extract key errors
  BUILD_ERRORS=$(grep -A 10 "error\|Error\|ERROR" /tmp/verify-$ISSUE_NUM-build.log 2>/dev/null | head -20 || echo "See build log")
  TEST_ERRORS=$(grep -A 5 "FAIL\|failed\|Error" /tmp/verify-$ISSUE_NUM-test.log 2>/dev/null | head -20 || echo "See test log")

  gh issue comment $ISSUE_NUM --body "## ❌ Verification FAILED

**Implementation has critical issues that must be fixed:**

- $([ $BUILD_EXIT_CODE -ne 0 ] && echo "❌ Build: FAILED" || echo "✅ Build: PASSED")
- $([ $TEST_EXIT_CODE -ne 0 ] && echo "❌ Tests: FAILED" || echo "✅ Tests: PASSED")
- $([ $FILE_COUNT -eq 0 ] && echo "❌ No files changed" || echo "✅ Files: $FILE_COUNT changed")

**Build errors:**
\`\`\`
$BUILD_ERRORS
\`\`\`

**Test errors:**
\`\`\`
$TEST_ERRORS
\`\`\`

@scar Please fix the errors above and re-run validation.

<details>
<summary>Full Verification Report</summary>

$(cat /tmp/verify-$ISSUE_NUM-report.md)

</details>"
fi
```

### 13. Return Result

```bash
# Return JSON result to supervisor
cat <<EOF
{
  "verdict": "$VERDICT",
  "issue": $ISSUE_NUM,
  "project": "$PROJECT",
  "phase": $PHASE,
  "files_changed": $FILE_COUNT,
  "build_passed": $([ $BUILD_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),
  "tests_passed": $([ $TEST_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),
  "mock_count": $MOCK_COUNT,
  "critical_failures": $CRITICAL_FAILURES,
  "warnings": $WARNINGS,
  "report_file": "/tmp/verify-$ISSUE_NUM-report.md"
}
EOF

# Exit code based on verdict
[ "$VERDICT" = "APPROVED" ] && exit 0
[ "$VERDICT" = "APPROVED_WITH_WARNINGS" ] && exit 0
exit 1
```

## Success Metrics

- ✅ Catches 100% of build failures (Learning 006)
- ✅ Detects mock implementations SCAR claims are "complete"
- ✅ Runs in <5 minutes for typical project
- ✅ Posts clear, actionable feedback to GitHub
- ✅ Prevents false "complete" claims from passing

## Context Usage

**Tokens:** ~10-15K (reads worktree, runs commands, posts results)

**Contrast with supervisor:** Would use 40K+ tokens for same verification

---

**This subagent implements Learning 006: NEVER trust SCAR's summary, always verify.**
