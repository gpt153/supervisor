# PIV Loop Adaptation for Supervisor-Service

**Date:** 2026-01-18
**CRITICAL:** Do NOT copy Cole Medin's PIV loop verbatim - adapt for our architecture

---

## What We're Taking from Cole Medin

**Core concepts (keep):**
- ✅ Plan → Implement → Validate loop
- ✅ Deep codebase analysis before implementation
- ✅ Pattern recognition (naming conventions, error handling)
- ✅ Validation commands for every task
- ✅ One-pass implementation philosophy

**Architecture (DIFFERENT from Cole's):**
- ❌ Don't copy: Remote agent via webhooks
- ❌ Don't copy: GitHub issue communication
- ❌ Don't copy: Archon task management
- ✅ Our approach: Local PIV agents spawned by supervisor
- ✅ Our approach: MCP tools for communication
- ✅ Our approach: GitHub issues for audit only

---

## Cole's Architecture vs Ours

### Cole Medin's System (Remote Coding Agent)

```
User → GitHub Issue
         ↓
    GitHub Webhook
         ↓
Remote Agent (Telegram/Slack/GitHub adapter)
         ↓
Claude API (programmatic)
         ↓
PIV Loop Commands (.claude/commands/core_piv_loop/)
         ↓
Implementation in workspace
         ↓
Comment on GitHub issue
```

**Works for:**
- Developers who understand GitHub
- Multi-platform access (Telegram, Slack, GitHub)
- Remote work (agent on server, user anywhere)

### Our System (supervisor-service)

```
User → Claude.ai Project (browser tab)
         ↓
    MCP Tool Call
         ↓
Supervisor-Service (Node.js)
         ↓
Project Supervisor (Claude Agent SDK)
         ↓
PIV Agent (local subprocess, Haiku)
         ↓
Implementation in project directory
         ↓
Return result to supervisor → user
```

**Works for:**
- Non-coder who uses Claude.ai
- Multi-tab workflow (one tab per project)
- Local agents (no remote webhooks)
- Direct results (no GitHub comment parsing)

---

## Key Differences to Remember

### 1. Communication Method

**Cole's:** GitHub issues and comments
```
# User creates issue
@remote-agent implement authentication

# Agent responds via comment
SCAR is on the case... implementing now

# Progress updates via comments
Implementation complete. Tests passing.
```

**Ours:** MCP tools
```
# User calls MCP tool
create_epic("Implement authentication")

# Supervisor returns result directly
{
  epic_created: "epic-007-authentication.md",
  github_issue: 42,
  agents_spawned: 5,
  status: "in_progress"
}
```

**Adaptation needed:**
- Replace GitHub comment parsing with direct returns
- Replace @mentions with MCP tool calls
- Replace webhook triggers with local spawning

### 2. Codebase Detection

**Cole's:** Detect from GitHub repo
```typescript
// Auto-detect from webhook payload
const repo = payload.repository.full_name;
const workspace = `~/.archon/workspaces/${repo}`;
```

**Ours:** Explicit project context
```typescript
// Project known from MCP endpoint
// /mcp/consilio → project = "consilio"
const project = context.projectName;
const workspace = `/home/samuel/supervisor/${project}`;
```

**Adaptation needed:**
- Remove GitHub repo detection
- Use MCP project context instead
- Workspace path from project config

### 3. Command Invocation

**Cole's:** Slash commands via chat
```
User: /command-invoke prime
Bot: [Executes .claude/commands/core_piv_loop/prime.md]
```

**Ours:** MCP tools
```typescript
// Supervisor calls internally (user doesn't see)
await projectSupervisor.prime(project);

// Or exposed as MCP tool
await mcp__consilio__prime();
```

**Adaptation needed:**
- Commands become internal functions, not slash commands
- PIV loop orchestrated by supervisor, not user commands
- User sees results, not command execution

### 4. Task Management

**Cole's:** Archon MCP for tasks
```typescript
// Track in Archon
manage_task("create", {
  title: "Implement authentication",
  status: "todo"
});
```

**Ours:** GitHub issues (automatic) + local state
```typescript
// GitHub issue created automatically
const issue = await github.createIssue({
  title: epic.title,
  body: epic.content
});

// Local state in supervisor-service
projectState.activeTasks.push({
  issueNumber: issue.number,
  agents: [],
  status: "in_progress"
});
```

**Adaptation needed:**
- Replace Archon task management with GitHub + local state
- Automatic issue creation (not manual)
- Track agent state locally

### 5. Execution Environment

**Cole's:** Worktrees per issue
```bash
# Create worktree for issue #42
git worktree add ~/.archon/worktrees/repo/issue-42 -b feature/issue-42
```

**Ours:** Feature branches (simpler)
```bash
# Work directly in project directory
cd /home/samuel/supervisor/consilio
git checkout -b feature/dark-mode
# Agent works here
```

**Adaptation needed:**
- Skip worktrees (adds complexity)
- Use feature branches
- Simpler for non-coder to understand

---

## What to Adapt from Cole's PIV Loop

### Prime Command (Research Phase)

**Cole's structure:**
```markdown
# Prime - Codebase Analysis

1. Detect project structure
2. Find patterns and conventions
3. Identify dependencies
4. Search Archon knowledge base
5. Create context document
```

**Our adaptation:**
```markdown
# Prime - Project Research

INPUTS:
- Project name (from MCP context)
- Workspace path (from config)
- Epic file (just created by supervisor)

PROCESS:
1. Analyze /home/samuel/supervisor/{project}/ structure
2. Read package.json, tsconfig.json, etc.
3. Find naming conventions (CamelCase, kebab-case, etc.)
4. Search local RAG for patterns
5. Create .agents/plans/context-{epic-id}.md

OUTPUT:
- Context document with:
  - Tech stack
  - Conventions
  - Similar implementations
  - Dependencies
  - Integration points

RETURN to supervisor (not comment on GitHub)
```

### Plan Command (Design Phase)

**Cole's structure:**
```markdown
# Plan - Create Implementation Plan

1. Read context from Prime
2. Search documentation
3. Design solution approach
4. Create task breakdown
5. Define validation commands
```

**Our adaptation:**
```markdown
# Plan - Implementation Design

INPUTS:
- Epic content
- Context from Prime
- Search results from local RAG

PROCESS:
1. Design solution following project conventions
2. Break into file-by-file tasks
3. Create prescriptive instructions (for Haiku)
4. Define validation for each task
5. Create PIV plan document

OUTPUT:
- .agents/plans/{epic-id}-implementation.md with:
  - Phase breakdown
  - File-by-file instructions
  - Validation commands
  - Acceptance criteria

RETURN plan path to supervisor
```

### Execute Command (Implementation Phase)

**Cole's structure:**
```markdown
# Execute - Implement Plan

1. Read plan document
2. Execute tasks in order
3. Run validation after each
4. Fix issues immediately
5. Report completion
```

**Our adaptation:**
```markdown
# Execute - PIV Agent Implementation

INPUTS:
- Plan document path
- Working directory
- Model: Haiku (cheap execution)

PROCESS:
1. Read plan (.agents/plans/{epic-id}-implementation.md)
2. For each task:
   - Implement following prescriptive instructions
   - Run validation command
   - If fail: retry once, then escalate
   - If pass: continue
3. Create feature branch
4. Commit changes
5. Create PR (link to GitHub issue)

OUTPUT:
- PR number
- Validation results
- Files changed

RETURN to supervisor (not GitHub comment)
```

---

## File Structure Adaptation

### Cole's Command Structure

```
.claude/commands/
├── core_piv_loop/
│   ├── prime.md       # Codebase research
│   ├── plan.md        # Plan creation
│   └── execute.md     # Implementation
├── validation/
│   └── code-review.md
└── github_bug_fix/
    └── rca.md
```

### Our Command Structure

```
supervisor-service/src/
├── agents/
│   ├── PIVAgent.ts           # Main PIV agent class
│   ├── phases/
│   │   ├── PrimePhase.ts     # Research phase
│   │   ├── PlanPhase.ts      # Design phase
│   │   └── ExecutePhase.ts   # Implementation phase
│   └── validation/
│       └── Validator.ts      # Build/test validation
└── commands/
    └── piv/                  # PIV templates (optional)
        ├── prime-template.md
        ├── plan-template.md
        └── execute-template.md
```

**Key differences:**
- TypeScript classes, not markdown commands
- Internal methods, not user-invocable commands
- Templates for prompt construction (optional)

---

## Example Adaptation: Prime Phase

### Cole's Prime Command (Remote Agent)

```markdown
# Prime Command

You are analyzing the codebase to load full project context.

## Step 1: Check Archon Knowledge Base

Search Archon for existing knowledge:
- `rag_get_available_sources()`
- `rag_search_knowledge_base(query="${PROJECT_NAME}")`

## Step 2: Analyze Codebase Structure

Use specialized agents when beneficial:
- Detect languages, frameworks, versions
- Map directory structure
- Identify patterns

## Step 3: Document Findings

Create context document in `.agents/research/context.md`
```

### Our Prime Phase (Local Agent)

```typescript
// supervisor-service/src/agents/phases/PrimePhase.ts

export class PrimePhase {
  async execute(project: ProjectContext, epic: Epic): Promise<PrimeResult> {
    const workspace = project.path;

    // 1. Search local RAG (not Archon)
    const ragResults = await this.localRAG.search(project.name, {
      limit: 10
    });

    // 2. Analyze codebase
    const structure = await this.analyzeStructure(workspace);
    const conventions = await this.findConventions(workspace);
    const dependencies = await this.analyzeDependencies(workspace);

    // 3. Create context document
    const contextDoc = {
      project: project.name,
      techStack: structure.techStack,
      conventions: conventions,
      dependencies: dependencies,
      ragInsights: ragResults,
      integrationPoints: await this.findIntegrationPoints(workspace)
    };

    const contextPath = `${workspace}/.agents/plans/context-${epic.id}.md`;
    await fs.writeFile(contextPath, this.formatContext(contextDoc));

    // Return result directly to supervisor (not GitHub comment)
    return {
      contextPath,
      techStack: structure.techStack,
      conventions,
      readyForPlan: true
    };
  }
}
```

**Key adaptations:**
1. ✅ TypeScript class method (not markdown command)
2. ✅ Project context from parameter (not webhook)
3. ✅ Local RAG search (not Archon MCP)
4. ✅ Returns result object (not GitHub comment)
5. ✅ Writes to project workspace (not .archon/workspaces)

---

## Adaptation Checklist

When adapting Cole's PIV loop:

### ✅ Keep (Core concepts)
- [ ] Deep codebase analysis
- [ ] Pattern recognition
- [ ] Validation commands
- [ ] One-pass implementation
- [ ] Prescriptive task instructions

### ❌ Remove (Architecture differences)
- [ ] GitHub webhook handling
- [ ] Comment parsing
- [ ] @mention detection
- [ ] Archon task management
- [ ] Worktree creation
- [ ] Remote agent orchestration

### 🔄 Replace (Adapt for our system)
- [ ] Slash commands → TypeScript methods
- [ ] GitHub communication → Direct returns
- [ ] Archon MCP → Local RAG
- [ ] Worktrees → Feature branches
- [ ] Remote execution → Local subprocess
- [ ] Manual invocation → Automatic orchestration

---

## Testing Adaptations

### Test Each Phase Independently

```typescript
// Test Prime phase
const primePhase = new PrimePhase(localRAG, fileSystem);
const result = await primePhase.execute(
  { name: 'consilio', path: '/home/samuel/supervisor/consilio' },
  { id: 'epic-007', title: 'Authentication' }
);

assert(result.contextPath.includes('context-epic-007.md'));
assert(result.techStack.includes('TypeScript'));

// Test Plan phase
const planPhase = new PlanPhase(localRAG);
const plan = await planPhase.execute(
  result.contextPath,
  epic
);

assert(plan.tasks.length > 0);
assert(plan.validationCommands.length > 0);

// Test Execute phase
const executePhase = new ExecutePhase();
const implementation = await executePhase.execute(
  plan,
  workspace
);

assert(implementation.prNumber > 0);
assert(implementation.testsPass === true);
```

---

## Summary: Adaptation Guidelines

**Think of Cole's PIV loop as inspiration, not a blueprint.**

**What we're borrowing:**
- 📚 Methodology (Plan → Implement → Validate)
- 🔍 Deep analysis approach
- ✅ Validation rigor
- 📝 Prescriptive instructions

**What we're replacing:**
- 🏗️ Architecture (local agents, not remote webhooks)
- 💬 Communication (MCP tools, not GitHub comments)
- 📦 Storage (local RAG, not Archon)
- 🔧 Tools (TypeScript classes, not markdown commands)

**Result:**
- Same quality and rigor
- Better suited for non-coder
- Simpler architecture
- More maintainable

**NEVER copy-paste Cole's commands directly into our system!**

**ALWAYS ask:**
1. What is this command trying to accomplish?
2. How does it fit into our architecture?
3. What needs to change for our use case?
4. Can we simplify it?
