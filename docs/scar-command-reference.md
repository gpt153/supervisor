# SCAR Command Reference for Supervisors (CORRECTED)

**CRITICAL: This is required reading for all project supervisors.**

**Last Updated:** 2026-01-17 (Corrected based on actual SCAR implementation)

---

## 🚨 CRITICAL CORRECTION: How SCAR Actually Works

**SCAR uses `/command-invoke <command-name> [args]` syntax, NOT plain `@scar` mentions!**

### Correct Usage

```markdown
@scar /command-invoke plan-feature-github "Add user authentication"
@scar /command-invoke execute-github .agents/plans/user-auth.md feature-user-auth
@scar /command-invoke prime
```

### Wrong Usage (What Was Previously Documented)

```markdown
❌ @scar - Implement this feature...  (Too vague, no command structure)
❌ @scar Please work on this issue    (No command invocation)
```

---

## 📋 Understanding SCAR's Architecture

### What is SCAR?

**SCAR** = **S**am's **C**oding **A**gent **R**emote

- Remote AI coding assistant platform
- Works across Telegram, GitHub, Slack, Discord
- Uses **Claude Code SDK** or **Codex SDK**
- Built with Bun + TypeScript + PostgreSQL
- Command-based workflow system

### Core Concept: Command System

SCAR has **three types of commands**:

#### 1. Deterministic Commands (No AI)
Handled by command handler directly:
- `/clone <url>` - Clone repository
- `/repos` - List all repositories
- `/repo <#|name>` - Switch active repository
- `/commands` - List available commands
- `/command-invoke <name> [args]` - **Execute a command**
- `/worktree create <branch>` - Create isolated worktree
- `/status` - Show current conversation state
- `/help` - Show all commands

#### 2. Codebase Commands (From Git)
Stored in repository as markdown files:
- Location: `.claude/commands/`, `.agents/commands/`, or `.archon/commands/`
- Examples: `prime.md`, `plan-feature-github.md`, `execute-github.md`
- Invoked via: `/command-invoke <command-name> [args]`

#### 3. Global Template Commands
Stored in database, loaded from `.claude/commands/exp-piv-loop/`

---

## 🛠️ SCAR Commands for GitHub Workflow

### PIV Loop Methodology

**P**rime → **I**nvestigate/Plan → **E**xecute → **V**alidate

### Phase 1: Prime (Load Codebase Context)

**Command:**
```
@scar /command-invoke prime
```

**What it does:**
- Analyzes project structure (`git ls-files`, `tree`)
- Reads core documentation (PRD, CLAUDE.md, README)
- Identifies key files (entry points, configs, schemas)
- Checks recent git activity
- Generates comprehensive project overview

**When to use:**
- **ALWAYS** before planning a feature
- First step in any workflow
- When switching context to new project

**Args:** None

---

### Phase 2: Plan (Create Implementation Plan)

**Command:**
```
@scar /command-invoke plan-feature-github "<feature description>"
```

**Examples:**
```
@scar /command-invoke plan-feature-github "Add JWT authentication with refresh tokens"
@scar /command-invoke plan-feature-github "Fix memory leak in WebSocket handler"
@scar /command-invoke plan-feature-github "Implement dark mode toggle with persistence"
```

**What it does:**
1. Deep feature analysis with user stories
2. Codebase intelligence gathering
3. External research and documentation
4. Creates comprehensive implementation plan (500-700 lines)
5. **Creates feature branch** following pattern: `feature-<descriptive-name>`
6. **Commits plan** to `.agents/plans/{feature-name}.md`
7. **Pushes to GitHub** remote
8. Returns plan summary with command to execute

**Args:**
- `$ARGUMENTS` - Full feature description (required)

**Output:**
- Feature branch created: `feature-add-user-auth`
- Plan committed: `.agents/plans/add-user-auth.md`
- Ready for execution with command: `/command-invoke execute-github .agents/plans/add-user-auth.md feature-add-user-auth`

**Critical:** Plan is committed to feature branch in `.agents/plans/` directory

---

### Phase 3: Execute (Implement from Plan)

**Command:**
```
@scar /command-invoke execute-github <plan-path> <feature-branch>
```

**Examples:**
```
@scar /command-invoke execute-github .agents/plans/add-user-auth.md feature-add-user-auth
@scar /command-invoke execute-github .agents/plans/fix-websocket-leak.md feature-fix-websocket-leak
```

**What it does:**
1. Fetches latest from remote
2. Checks out the feature branch
3. Reads the implementation plan
4. Implements tasks sequentially
5. Runs validation after each task
6. Creates incremental commits
7. Runs all validation commands
8. **Pushes to remote**
9. **Creates Pull Request to staging branch**
10. Returns PR URL and implementation report

**Args:**
- `$1` - Path to plan file (e.g., `.agents/plans/add-user-auth.md`)
- `$2` - Feature branch name (e.g., `feature-add-user-auth`)

**Critical Notes:**
- **Creates NEW SESSION** (plan→execute transition clears context)
- **PRs target staging branch**, NOT main
- All validation must pass before PR creation
- Comprehensive implementation report posted as GitHub comment

---

### Phase 4: Validate (Code Review & Quality Check)

**Commands:**
```
@scar /command-invoke code-review
@scar /command-invoke system-review
@scar /command-invoke execution-report
```

**What they do:**
- `code-review` - Technical review (bugs, security, performance)
- `system-review` - Architecture validation, meta-analysis
- `execution-report` - Implementation alignment with plan

**When to use:**
- After execute completes
- Before merging PR
- For quality assurance

---

## 🔄 Complete GitHub Workflow Example

### Scenario: Add User Authentication

**Step 1: Prime**
```markdown
User comments on GitHub issue #123:
@scar /command-invoke prime
```

**SCAR response:**
```
🔧 BASH: git ls-files | head -50
🔧 READ: README.md
🔧 READ: package.json

Project Overview:
• Tech Stack: Node.js + TypeScript + Express
• Architecture: REST API with PostgreSQL
• Key Files:
  - src/index.ts (entry point)
  - src/api/routes.ts (API routes)
  - src/db/schema.sql (database schema)
• Testing: Jest with 85% coverage
```

**Step 2: Plan**
```markdown
User comments:
@scar /command-invoke plan-feature-github "Add JWT authentication with login/logout endpoints and refresh token support"
```

**SCAR response:**
```
📋 Creating implementation plan...

# Implementation Plan: JWT Authentication

## Feature Understanding
As a user, I want to authenticate with username/password
So that I can access protected resources securely

Complexity: Medium

## Implementation Tasks
### Task 1: Create User model and schema
...

### Task 2: Implement password hashing
...

### Task 3: Create auth endpoints
...

[500-700 line detailed plan]

✅ Plan created
📂 Feature branch: feature-jwt-auth
📄 Plan location: .agents/plans/jwt-auth.md
🔗 Pushed to GitHub

**Next step:**
@scar /command-invoke execute-github .agents/plans/jwt-auth.md feature-jwt-auth
```

**Step 3: Execute**
```markdown
User comments:
@scar /command-invoke execute-github .agents/plans/jwt-auth.md feature-jwt-auth
```

**SCAR response:**
```
[NEW SESSION CREATED]

Starting implementation of JWT authentication...

🔧 BASH: git fetch origin
🔧 BASH: git checkout feature-jwt-auth
🔧 BASH: git pull origin feature-jwt-auth

Reading plan: .agents/plans/jwt-auth.md

Task 1: Create User model and schema
🔧 WRITE: src/models/User.ts
🔧 EDIT: src/db/schema.sql
✅ Task 1 complete

Task 2: Implement password hashing
🔧 WRITE: src/utils/password.ts
🔧 WRITE: tests/utils/password.test.ts
🔧 BASH: npm test tests/utils/password.test.ts
✅ All tests passing
✅ Task 2 complete

[Continues through all tasks]

Running final validation...
🔧 BASH: npm run type-check
🔧 BASH: npm run lint
🔧 BASH: npm test
✅ All validation passed

Creating pull request...
🔧 BASH: git push origin feature-jwt-auth
🔧 BASH: gh pr create --base staging --head feature-jwt-auth

✅ Implementation complete!

**Pull Request:** https://github.com/user/repo/pull/124
**Branch:** feature-jwt-auth
**Status:** Open and ready for review

[Comprehensive implementation report posted as comment]
```

**Step 4: Validate (Optional)**
```markdown
User comments on PR:
@scar /command-invoke code-review
```

**SCAR response:**
```
# Code Review: JWT Authentication

## Code Quality
✅ TypeScript types complete
✅ Error handling comprehensive
✅ No debugging code
✅ Proper async/await usage

## Security
✅ Passwords hashed with bcrypt
✅ JWT secrets from environment
✅ Refresh tokens properly validated
✅ No SQL injection vulnerabilities

## Testing
✅ Unit tests for password utilities
✅ Integration tests for auth endpoints
✅ Edge cases covered
✅ 95% code coverage

## Recommendations
1. Add rate limiting to login endpoint
2. Consider adding 2FA support in future
3. Document token expiration policy

Overall: ✅ APPROVED
```

---

## 📊 SCAR Command Reference Table

| Command | Syntax | Args | Purpose |
|---------|--------|------|---------|
| `prime` | `/command-invoke prime` | None | Load codebase context |
| `plan-feature-github` | `/command-invoke plan-feature-github "<description>"` | Feature description (required) | Create implementation plan + feature branch |
| `execute-github` | `/command-invoke execute-github <plan-path> <branch>` | Plan path, branch name (both required) | Implement plan, create PR |
| `code-review` | `/command-invoke code-review` | None | Review code quality |
| `system-review` | `/command-invoke system-review` | None | Architecture validation |
| `execution-report` | `/command-invoke execution-report` | None | Implementation report |

---

## 🚨 Critical Protocol: SCAR Instruction Checklist

### When Creating SCAR Instruction

**Before posting:**
- [ ] Include `/command-invoke` prefix
- [ ] Use correct command name
- [ ] Provide all required args
- [ ] Use double quotes for args with spaces

**After posting (within 30 seconds):**
- [ ] SCAR acknowledges with response
- [ ] If command starts work, SCAR shows tool usage (🔧 BASH, 🔧 READ, etc.)
- [ ] If no response, check bot username is correct

**During execution:**
- [ ] SCAR streams progress in real-time
- [ ] Tool usage visible (🔧 indicators)
- [ ] Task completion marked with ✅

**On completion:**
- [ ] SCAR provides comprehensive summary
- [ ] For execute-github: PR URL included
- [ ] For plan-feature-github: Next command provided

---

## ⚠️ Common Mistakes

### ❌ MISTAKE 1: Missing /command-invoke

**Wrong:**
```markdown
@scar prime the codebase
```

**Right:**
```markdown
@scar /command-invoke prime
```

---

### ❌ MISTAKE 2: Missing Args

**Wrong:**
```markdown
@scar /command-invoke plan-feature-github
```

**Right:**
```markdown
@scar /command-invoke plan-feature-github "Add user authentication"
```

---

### ❌ MISTAKE 3: Wrong Command Name

**Wrong:**
```markdown
@scar /command-invoke plan "Add feature"
```

**Right:**
```markdown
@scar /command-invoke plan-feature-github "Add feature"
```

**Note:** Command name is `plan-feature-github`, not `plan`

---

### ❌ MISTAKE 4: Incorrect Args for execute-github

**Wrong:**
```markdown
@scar /command-invoke execute-github feature-user-auth
```

**Right:**
```markdown
@scar /command-invoke execute-github .agents/plans/user-auth.md feature-user-auth
```

**Note:** Needs BOTH plan path AND branch name

---

### ❌ MISTAKE 5: Not Using Feature from Plan Output

**Wrong:**
```markdown
[SCAR outputs plan with next command]
Next: @scar /command-invoke execute-github .agents/plans/auth.md feature-auth

User posts:
@scar /command-invoke execute-github .agents/plans/different-file.md feature-different
```

**Right:**
```markdown
User copies exact command from plan output:
@scar /command-invoke execute-github .agents/plans/auth.md feature-auth
```

---

## 🎯 Best Practices

### 1. Always Prime First

```markdown
✅ Good workflow:
1. @scar /command-invoke prime
2. [Review output]
3. @scar /command-invoke plan-feature-github "Add feature"

❌ Bad workflow:
1. @scar /command-invoke plan-feature-github "Add feature"
   (No context loaded)
```

### 2. Use Detailed Feature Descriptions

```markdown
❌ Bad:
@scar /command-invoke plan-feature-github "authentication"

✅ Good:
@scar /command-invoke plan-feature-github "Add JWT-based authentication with username/password login, logout endpoint, refresh token rotation, and protected route middleware"
```

### 3. Follow Plan Output Exactly

```markdown
✅ Always copy the exact command SCAR provides:
"Next step:"
@scar /command-invoke execute-github .agents/plans/specific-file.md feature-specific-branch
```

### 4. Monitor Progress

```markdown
✅ SCAR streams real-time progress:
- Tool usage indicators: 🔧 BASH, 🔧 READ, 🔧 WRITE, 🔧 EDIT
- Task completions: ✅ Task 1 complete
- Validation results: ✅ All tests passing

Watch for issues and intervene if needed
```

---

## 🔧 SCAR Configuration in Your Projects

### For Supervisors Creating GitHub Issues

**Issue template:**
```markdown
Title: [Epic-001] User Authentication

Body:
Implement user authentication as specified in epic.

**Epic Reference:** .bmad/epics/001-user-authentication.md

## Epic Context

[Paste full epic content]

## Instructions for SCAR

@scar /command-invoke prime

After prime completes, use:
@scar /command-invoke plan-feature-github "Implement user authentication per epic-001 spec"
```

**Workflow:**
1. Create issue with epic content
2. Comment: `@scar /command-invoke prime`
3. Wait for prime to complete
4. Comment: `@scar /command-invoke plan-feature-github "Feature description from epic"`
5. Wait for plan (creates branch + plan file)
6. Comment with exact execute command from plan output
7. SCAR implements, validates, creates PR
8. Review PR, merge when ready

---

## 📚 Session Management

### How SCAR Maintains Context

**Sessions:**
- Each GitHub issue = one conversation
- Each conversation has one active session
- Sessions persist across container restarts
- Plan→Execute transition creates NEW session (clears context)

**Why New Session on Execute?**
- Prevents token bloat
- Plan not needed in context during implementation
- Plan stored in session metadata, not sent to AI

**Session Resumption:**
```
Issue #123:
Comment 1: @scar /command-invoke prime
  → Creates session-abc

Comment 2: @scar /command-invoke plan-feature-github "Feature X"
  → Resumes session-abc
  → Updates metadata: {lastCommand: "plan-feature-github"}

Comment 3: @scar /command-invoke execute-github .agents/plans/x.md feature-x
  → Detects plan→execute transition
  → Deactivates session-abc
  → Creates session-xyz (fresh context)
  → Executes with new session
```

---

## 🚀 Integration with Supervisor Workflows

### Supervisor Creates Epic → SCAR Implements

**Step 1: Supervisor creates epic**
```bash
# In planning workspace
vim .bmad/epics/001-user-authentication.md
git add .bmad/epics/001-user-authentication.md
git commit -m "feat: Add epic-001 user authentication"
git push
```

**Step 2: Supervisor creates GitHub issue**
```bash
gh issue create \
  --title "[Epic-001] User Authentication" \
  --body "$(cat <<EOF
Implement user authentication per epic-001.

**Epic Location:** .bmad/epics/001-user-authentication.md

[Paste epic content here]

## SCAR Instructions

Start with:
@scar /command-invoke prime
EOF
)"
```

**Step 3: SCAR works**
```markdown
Issue #145 created

Supervisor comments:
@scar /command-invoke prime

[SCAR primes codebase]

Supervisor comments:
@scar /command-invoke plan-feature-github "Implement user authentication with JWT tokens, login/logout endpoints, password hashing with bcrypt, refresh token rotation, and protected route middleware per epic-001"

[SCAR creates plan + branch]

Supervisor comments (using exact command from plan):
@scar /command-invoke execute-github .agents/plans/epic-001-user-auth.md feature-epic-001-user-auth

[SCAR implements, validates, creates PR]

PR #146 created → Review and merge
```

---

## 📝 Summary

**Key Takeaways:**

1. ✅ **SCAR uses `/command-invoke <command> [args]` syntax**
2. ✅ **Always start with `/command-invoke prime`**
3. ✅ **Use detailed feature descriptions**
4. ✅ **Copy exact execute command from plan output**
5. ✅ **Monitor real-time progress with tool indicators**
6. ✅ **SCAR creates feature branches and PRs automatically**
7. ✅ **PRs target staging branch, not main**
8. ✅ **Plan→Execute creates new session for token efficiency**

**Command Flow:**
```
prime → plan-feature-github → execute-github → code-review (optional)
```

**Each command has specific args:**
- `prime`: No args
- `plan-feature-github`: Feature description (required)
- `execute-github`: Plan path + branch name (both required)
- `code-review`: No args

---

## 🔗 Related Documentation

**SCAR Documentation:**
- `/home/samuel/course/remote-coding-agent/CLAUDE.md` - Complete SCAR docs
- `/home/samuel/course/docs/02-workflows-and-commands.md` - Workflow details
- `/home/samuel/course/docs/03-multi-platform-integration.md` - GitHub integration

**Supervisor Documentation:**
- `/home/samuel/supervisor/docs/scar-integration.md` - Integration guide
- `/home/samuel/supervisor/docs/supervisor-learnings/learnings/006-never-trust-scar-verify-always.md`
- `/home/samuel/supervisor/docs/supervisor-learnings/learnings/007-monitor-scar-state-not-just-existence.md`

---

**Location:** `/home/samuel/supervisor/docs/scar-command-reference-CORRECTED.md`
**Last Updated:** 2026-01-17
**Applies to:** All supervisor instances using SCAR via GitHub issues
