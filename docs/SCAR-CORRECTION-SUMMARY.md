# SCAR Command System - Correction Summary

**Date:** 2026-01-17
**Status:** CRITICAL CORRECTION APPLIED

---

## ⚠️ What Was Wrong

The initial SCAR command documentation (created earlier today) was **INCORRECT**.

**What we documented (WRONG):**
```markdown
@scar - Implement this feature following the epic...
@scar Please work on issue #123
```

**What actually works (CORRECT):**
```markdown
@scar /command-invoke prime
@scar /command-invoke plan-feature-github "Add user authentication"
@scar /command-invoke execute-github .agents/plans/user-auth.md feature-user-auth
```

---

## ✅ What Was Corrected

### 1. Complete SCAR Command Reference Rewritten

**File:** `/home/samuel/supervisor/docs/scar-command-reference.md`

**Now includes:**
- ✅ Correct command syntax: `/command-invoke <command> [args]`
- ✅ Three types of commands (Deterministic, Codebase, Global Template)
- ✅ PIV Loop methodology (Prime → Plan → Execute → Validate)
- ✅ GitHub workflow integration
- ✅ Complete examples with actual SCAR syntax
- ✅ Session management explanation
- ✅ Common mistakes section
- ✅ Best practices
- ✅ Integration with supervisor workflows

**Key Commands:**
- `@scar /command-invoke prime` - Load codebase context
- `@scar /command-invoke plan-feature-github "<description>"` - Create implementation plan
- `@scar /command-invoke execute-github <plan-path> <branch>` - Implement feature
- `@scar /command-invoke code-review` - Review code quality

### 2. Summary Document Updated

**File:** `/home/samuel/supervisor/docs/SCAR-COMMANDS-SUMMARY.md`

**Changes:**
- ✅ Added correction notice at top
- ✅ Updated quick start with correct syntax
- ✅ Clarified distinction between SCAR commands and supervisor meta-commands
- ✅ Updated workflow examples

### 3. Old Documentation Preserved

**File:** `/home/samuel/supervisor/docs/scar-command-reference-OLD-INCORRECT.md`

Kept for reference to show what was wrong.

---

## 📋 Correct SCAR Workflow

### Complete Example: Adding User Authentication

**Step 1: Create GitHub Issue**
```bash
gh issue create \
  --title "[Epic-001] User Authentication" \
  --body "Implement user authentication per epic-001.

**Epic Reference:** .bmad/epics/001-user-authentication.md

[Paste epic content here]"
```

**Step 2: Prime Codebase**
```markdown
Comment on issue #123:
@scar /command-invoke prime
```

**SCAR Response:**
```
🔧 BASH: git ls-files | head -50
🔧 READ: README.md
🔧 READ: package.json

Project Overview:
• Tech Stack: Node.js + TypeScript + Express
• Architecture: REST API
...
```

**Step 3: Plan Feature**
```markdown
Comment on issue #123:
@scar /command-invoke plan-feature-github "Add JWT authentication with login/logout endpoints, password hashing with bcrypt, and refresh token rotation"
```

**SCAR Response:**
```
📋 Creating implementation plan...

[Creates 500-700 line detailed plan]

✅ Plan created
📂 Feature branch: feature-jwt-auth
📄 Plan location: .agents/plans/jwt-auth.md
🔗 Pushed to GitHub

**Next step:**
@scar /command-invoke execute-github .agents/plans/jwt-auth.md feature-jwt-auth
```

**Step 4: Execute Implementation**
```markdown
Comment on issue #123 (copy exact command from plan output):
@scar /command-invoke execute-github .agents/plans/jwt-auth.md feature-jwt-auth
```

**SCAR Response:**
```
[NEW SESSION CREATED]

Starting implementation...

🔧 BASH: git checkout feature-jwt-auth
🔧 WRITE: src/models/User.ts
🔧 EDIT: src/db/schema.sql
✅ Task 1 complete

[Continues through all tasks]

✅ Implementation complete!
**Pull Request:** https://github.com/user/repo/pull/124
```

**Step 5: Review & Merge**
- Review PR #124
- Merge to staging when ready
- Eventually merge staging to main for production

---

## 🔑 Key Differences from Initial Documentation

| Aspect | Initial (WRONG) | Corrected (RIGHT) |
|--------|-----------------|-------------------|
| **Command Format** | @scar natural language | @scar /command-invoke <command> [args] |
| **Prime Command** | @scar prime | @scar /command-invoke prime |
| **Plan Command** | @scar plan feature | @scar /command-invoke plan-feature-github "description" |
| **Execute Command** | @scar execute | @scar /command-invoke execute-github <plan> <branch> |
| **Verification** | /verify-scar-phase | SCAR does this automatically in execute-github |
| **Supervision** | /supervise-issue | Not applicable to GitHub workflow |
| **Branch Creation** | Manual | SCAR creates automatically |
| **PR Creation** | Manual | SCAR creates automatically |

---

## 🚨 Critical Corrections

### 1. SCAR is NOT a @mention-only bot

**WRONG:**
```markdown
@scar - Please implement this feature following the epic specifications.

[Epic content]

@scar - Start working on this now.
```

**RIGHT:**
```markdown
@scar /command-invoke prime

[After prime completes]

@scar /command-invoke plan-feature-github "Implement feature X per epic-001"

[After plan completes]

@scar /command-invoke execute-github .agents/plans/epic-001-x.md feature-epic-001-x
```

### 2. Commands are Structured, Not Natural Language

**WRONG:**
```markdown
@scar Can you verify this implementation?
```

**RIGHT:**
```markdown
@scar /command-invoke code-review
```

### 3. Args are Required, Not Optional

**WRONG:**
```markdown
@scar /command-invoke plan-feature-github
```

**RIGHT:**
```markdown
@scar /command-invoke plan-feature-github "Add user authentication with JWT tokens"
```

### 4. SCAR Handles Workflow Automation

**What SCAR does automatically:**
- ✅ Creates feature branches
- ✅ Commits plans to `.agents/plans/`
- ✅ Pushes to GitHub remote
- ✅ Creates PRs to staging branch
- ✅ Runs validation (tests, linting, type-check)
- ✅ Posts implementation reports

**What you need to do:**
- ✅ Create GitHub issue with epic content
- ✅ Comment with correct `/command-invoke` commands
- ✅ Review and merge PRs

---

## 📚 Where Information Came From

**Original (incorrect) documentation based on:**
- Assumptions about how SCAR should work
- Partial understanding from supervisor learnings
- Missing actual SCAR implementation details

**Corrected documentation based on:**
- `/home/samuel/course/remote-coding-agent/` - Actual SCAR codebase
- `/home/samuel/course/docs/` - Official SCAR documentation
- `.agents/commands/plan-feature-github.md` - Real command files
- `.agents/commands/execute-github.md` - Real command files
- `02-workflows-and-commands.md` - PIV loop documentation
- `03-multi-platform-integration.md` - GitHub integration docs

---

## 🎯 What Supervisors Need to Do Now

### 1. Read Corrected Documentation

**REQUIRED READING:**
- `/home/samuel/supervisor/docs/scar-command-reference.md` - Complete guide
- `/home/samuel/supervisor/docs/SCAR-COMMANDS-SUMMARY.md` - Quick summary

### 2. Update GitHub Issue Templates

**Old template (WRONG):**
```markdown
@scar - Implement this feature...

[Epic content]

CRITICAL: No mock implementations...
```

**New template (CORRECT):**
```markdown
Implement feature per epic-001.

**Epic Reference:** .bmad/epics/001-feature.md

[Epic content]

## SCAR Instructions

Start with:
@scar /command-invoke prime

After prime:
@scar /command-invoke plan-feature-github "Feature description"
```

### 3. Use Correct Command Syntax

**Always:**
- ✅ Include `/command-invoke` prefix
- ✅ Use correct command name
- ✅ Provide all required args
- ✅ Copy exact execute command from plan output

**Never:**
- ❌ Use natural language without /command-invoke
- ❌ Skip args for commands that require them
- ❌ Make up command names
- ❌ Use old verification commands (/verify-scar-phase)

---

## 🔄 Centralized System Still Works

The centralized supervisor system is still valid:

**To update all supervisors:**
1. Edit `/home/samuel/supervisor/docs/scar-command-reference.md`
2. Commit and push
3. Tell active supervisors: "Reload your instructions"

**Result:** All supervisors get corrected SCAR command syntax

---

## 📝 Summary

**What changed:**
- ✅ SCAR command syntax corrected
- ✅ Complete workflow documentation rewritten
- ✅ Examples updated with real commands
- ✅ Common mistakes section added
- ✅ Integration with supervisor workflows clarified

**What stayed the same:**
- ✅ Centralized documentation system
- ✅ Supervisor learning system
- ✅ BMAD methodology
- ✅ Epic-based planning workflow

**Impact:**
- All GitHub issues for SCAR must use `/command-invoke` syntax
- SCAR will now respond correctly to commands
- Workflow automation (branches, PRs) works as intended

---

## 🔗 Files Changed

**Commits:**
1. `97e834b` - Initial (incorrect) documentation
2. `6df2664` - Critical fix with corrected syntax

**Files:**
- `docs/scar-command-reference.md` - Completely rewritten (CORRECT)
- `docs/scar-command-reference-OLD-INCORRECT.md` - Old version preserved
- `docs/SCAR-COMMANDS-SUMMARY.md` - Updated with correction notice
- `docs/SCAR-CORRECTION-SUMMARY.md` - This file

---

**Thank you for catching this early!**

The correction was made on the same day as the initial documentation, minimizing any incorrect usage in production.

---

**Location:** `/home/samuel/supervisor/docs/SCAR-CORRECTION-SUMMARY.md`
**Created:** 2026-01-17
**Status:** CORRECTION COMPLETE
