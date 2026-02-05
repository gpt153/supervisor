# Multiple Claude.ai Projects - Multi-Tab Workflow

**Date:** 2026-01-18
**Question:** Can I have separate Claude.ai Projects for each repo + meta-supervisor?

**Answer:** YES! This is EXACTLY how supervisor-service should work! 🎉

---

## The Vision

**You want:**
```
Browser Tab 1: Claude.ai Project "Meta-Supervisor"
Browser Tab 2: Claude.ai Project "Consilio"
Browser Tab 3: Claude.ai Project "Odin"
Browser Tab 4: Claude.ai Project "Health-Agent"
Browser Tab 5: Claude.ai Project "OpenHorizon"
```

**Each tab:**
- Maps to one Git repo
- Has its own supervisor
- Independent conversations
- No context mixing
- Quick switching (just change tabs)

**THIS IS PERFECT!**

---

## How Claude.ai Projects Work

### What is a Claude.ai Project?

**A Project is:**
- A workspace with its own context
- Connected to specific tools/data via MCP
- Persistent conversation history
- Available on desktop, browser, mobile

**When you create a Project:**
1. Give it a name ("Consilio")
2. Add "Knowledge" (files, folders)
3. Connect MCP servers (tools)
4. Add custom instructions (CLAUDE.md)

**Then:**
- Every conversation in that Project has access to those tools
- Context persists across devices
- Switch between Projects easily

---

## Mapping Projects to Repos

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Supervisor-Service (Node.js)                   │
│              Running on VM: http://localhost:8080           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MCP Server (Exposes 5 separate "project contexts")   │ │
│  │                                                          │ │
│  │  Projects:                                               │ │
│  │  - meta-supervisor → Tools for VM management            │ │
│  │  - consilio        → Tools for Consilio repo            │ │
│  │  - odin            → Tools for Odin repo                │ │
│  │  - health-agent    → Tools for Health-Agent repo        │ │
│  │  - openhorizon     → Tools for OpenHorizon repo         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │    MCP Protocol       │
                └───────────┬───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Claude.ai    │   │ Claude.ai    │   │ Claude.ai    │
│ Project:     │   │ Project:     │   │ Project:     │
│ Consilio     │   │ Odin         │   │ Health-Agent │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Each Project Gets Different Tools

**Meta-Supervisor Project:**
- `meta_get_vm_health()` - Check CPU, RAM, disk
- `meta_allocate_slots(project, count)` - Give slots to project
- `meta_list_projects()` - See all projects
- `meta_project_status(project)` - Check project progress
- `meta_release_slots(project)` - Take back slots

**Consilio Project:**
- `read_epic(epic_id)` - Read Consilio epics
- `create_epic(title, description)` - Create epic for Consilio
- `spawn_piv_agent(task_spec)` - Run PIV agent in Consilio repo
- `run_tests()` - Test Consilio code
- `create_pr(branch, description)` - PR in Consilio repo
- `get_progress()` - Check Consilio agents

**Odin Project:**
- (Same tools but scoped to Odin repo)

**Each project is ISOLATED!**

---

## How to Set This Up

### Step 1: Configure supervisor-service MCP

**Add project contexts to MCP server:**

```typescript
// supervisor-service/src/mcp/server.ts

class SupervisorMCPServer {
  // Tools namespace by project
  private tools = {
    'meta-supervisor': [
      'meta_get_vm_health',
      'meta_allocate_slots',
      'meta_list_projects',
      'meta_project_status',
      'meta_kill_agents'
    ],
    'consilio': [
      'read_planning_file',
      'create_epic',
      'spawn_piv_agent',
      'run_tests',
      'create_pr',
      'get_progress'
    ],
    'odin': [
      'read_planning_file',
      'create_epic',
      'spawn_piv_agent',
      'run_tests',
      'create_pr',
      'get_progress'
    ],
    // ... etc for other projects
  };

  async handleToolCall(toolName: string, args: any, context: MCPContext) {
    // Context includes which Project is calling
    const project = context.projectName; // "consilio", "odin", etc.

    // Route to appropriate handler
    switch (toolName) {
      case 'read_planning_file':
        return this.readPlanningFile(project, args.filePath);

      case 'spawn_piv_agent':
        return this.spawnAgent(project, args.taskSpec);

      case 'meta_allocate_slots':
        return this.metaSupervisor.allocateSlots(args.project, args.count);

      // ... etc
    }
  }

  private async readPlanningFile(project: string, filePath: string) {
    // Read from project-specific directory
    const fullPath = `/home/samuel/.archon/workspaces/${project}/${filePath}`;
    return fs.readFileSync(fullPath, 'utf-8');
  }

  private async spawnAgent(project: string, taskSpec: any) {
    // Spawn agent in project-specific workspace
    const workingDir = `/home/samuel/.archon/workspaces/${project}`;
    return this.projectManagers[project].spawnPIVAgent(taskSpec, workingDir);
  }
}
```

### Step 2: Create Claude.ai Projects

**For each repo, create a Project:**

#### Project 1: Meta-Supervisor

**Name:** "Meta-Supervisor"

**Custom Instructions:**
```markdown
You are the Meta-Supervisor managing multiple software projects.

Your role:
- Monitor VM health (CPU, RAM, disk)
- Allocate implementation slots across projects
- View cross-project status
- Handle resource conflicts

You have access to these projects:
- Consilio (health tracking app)
- Odin (parser system)
- Health-Agent (medical AI)
- OpenHorizon (landing page builder)
- Quiculum Monitor (data pipeline)

Tools available via MCP server: http://localhost:8080/mcp/meta
```

**Knowledge:** (none needed, just tools)

**MCP Server:** `http://localhost:8080/mcp/meta`

#### Project 2: Consilio

**Name:** "Consilio"

**Custom Instructions:**
```markdown
You are the Supervisor for Consilio project.

Project: Health tracking and wellness application
Repo: https://github.com/gpt153/consilio
Working Directory: /home/samuel/.archon/workspaces/consilio/

Your role:
- Plan features using BMAD methodology
- Create epics and ADRs
- Spawn PIV agents for implementation
- Verify builds and tests
- Create PRs and merge

Available resources:
- Request implementation slots from Meta-Supervisor
- Spawn up to 10 PIV agents in parallel
- Access Archon RAG for knowledge search

Tools available via MCP server: http://localhost:8080/mcp/consilio
```

**Knowledge:**
- Upload: `/home/samuel/.archon/workspaces/consilio/docs/`
- Upload: `/home/samuel/.archon/workspaces/consilio/CLAUDE.md`

**MCP Server:** `http://localhost:8080/mcp/consilio`

#### Project 3: Odin

**Name:** "Odin"

**Custom Instructions:**
```markdown
You are the Supervisor for Odin project.

Project: Parser and data processing system
Repo: https://github.com/gpt153/odin
Working Directory: /home/samuel/.archon/workspaces/odin/

[Same structure as Consilio but for Odin]
```

**MCP Server:** `http://localhost:8080/mcp/odin`

#### Repeat for other projects...

---

## User Experience

### Opening Multiple Tabs

**Morning workflow:**

1. **Open browser, go to claude.ai**
2. **Open multiple tabs:**
   - Tab 1: Meta-Supervisor Project
   - Tab 2: Consilio Project
   - Tab 3: Odin Project
   - Tab 4: Health-Agent Project
3. **Each tab loads its own Project**
4. **Pin the tabs** (so they persist)

**Now you can:**
- Switch tabs to switch projects
- Each conversation is independent
- No context mixing
- All persistent (sync across devices)

### Example Workflow

**Tab 1 (Meta-Supervisor):**
```
You: "What's the status of all projects?"

Meta: "📊 Current Status:

VM Health: Healthy (45% CPU, 62% RAM)
Active Slots: 12/20

Projects:
- Consilio: 5 agents active (3 features in progress)
- Odin: 3 agents active (1 feature in progress)
- Health-Agent: 4 agents active (2 features in progress)
- OpenHorizon: 0 agents (idle)

Estimated completion: 18 minutes"
```

**Tab 2 (Consilio):**
```
You: "Plan feature: Add dark mode"

Consilio Supervisor: "Planning dark mode feature...

[Searches Archon for dark mode patterns]
[Creates epic]
[Requests 5 slots from Meta]

Epic created: epic-007-dark-mode.md
Slots allocated: 5/20
Spawning 5 PIV agents...

Agent 1: Theme system ✅ Started
Agent 2: Color palette ✅ Started
Agent 3: Components ✅ Started
Agent 4: Preferences ✅ Started
Agent 5: Tests ✅ Started

Monitoring progress..."
```

**Tab 3 (Odin):**
```
You: "Check progress on parser refactoring"

Odin Supervisor: "Parser Refactoring (Issue #42):

Status: 60% complete (Phase 2/4)

Completed:
✅ Phase 1: AST definition
✅ Phase 2: Lexer implementation

In Progress:
🔄 Phase 3: Parser core (Agent working, ETA 5 min)

Pending:
⏳ Phase 4: Tests and validation

All agents healthy, no errors."
```

**Switch between tabs as needed!**

---

## Advanced: Project Groups

**You can also create Project GROUPS for related work:**

### Project Group: "Consilio Suite"

**Projects in group:**
- Consilio-Backend (API)
- Consilio-Frontend (Web UI)
- Consilio-Mobile (React Native)
- Consilio-DevOps (Infrastructure)

**Each has own supervisor, own repo, own tools.**

**But you can:**
- Open all 4 tabs at once
- Work on full-stack feature across all
- Switch context as needed

---

## Implementation in supervisor-service

### MCP Server with Project Contexts

```typescript
// supervisor-service/src/mcp/project-contexts.ts

interface ProjectContext {
  name: string;
  repoPath: string;
  workingDirectory: string;
  tools: string[];
  supervisor: ProjectSupervisor;
}

class ProjectContextManager {
  private contexts: Map<string, ProjectContext> = new Map();

  constructor() {
    // Register all projects
    this.registerProject({
      name: 'meta-supervisor',
      repoPath: '/home/samuel/supervisor',
      workingDirectory: '/home/samuel/supervisor',
      tools: ['meta_get_vm_health', 'meta_allocate_slots', 'meta_list_projects'],
      supervisor: new MetaSupervisor()
    });

    this.registerProject({
      name: 'consilio',
      repoPath: '/home/samuel/.archon/workspaces/consilio',
      workingDirectory: '/home/samuel/.archon/workspaces/consilio',
      tools: ['read_planning_file', 'create_epic', 'spawn_piv_agent', 'run_tests'],
      supervisor: new ProjectSupervisor('consilio')
    });

    // ... register other projects
  }

  registerProject(context: ProjectContext) {
    this.contexts.set(context.name, context);
  }

  getContext(projectName: string): ProjectContext {
    return this.contexts.get(projectName);
  }

  async handleToolCall(projectName: string, toolName: string, args: any) {
    const context = this.getContext(projectName);
    if (!context) {
      throw new Error(`Unknown project: ${projectName}`);
    }

    if (!context.tools.includes(toolName)) {
      throw new Error(`Tool ${toolName} not available for project ${projectName}`);
    }

    // Delegate to project supervisor
    return context.supervisor.handleToolCall(toolName, args);
  }
}
```

### MCP Server Routes

```typescript
// supervisor-service/src/mcp/server.ts

app.post('/mcp/:project/tools/:toolName', async (req, res) => {
  const { project, toolName } = req.params;
  const args = req.body;

  try {
    const result = await projectContextManager.handleToolCall(
      project,
      toolName,
      args
    );

    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// List available tools for a project
app.get('/mcp/:project/tools', async (req, res) => {
  const { project } = req.params;
  const context = projectContextManager.getContext(project);

  if (!context) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({
    project: context.name,
    tools: context.tools.map(toolName => ({
      name: toolName,
      description: getToolDescription(toolName),
      parameters: getToolParameters(toolName)
    }))
  });
});
```

---

## Benefits of Multi-Project Setup

### 1. Clean Context Separation ✅

**No more:**
```
You: "Create epic for authentication"

Supervisor: "Which project? Consilio, Odin, Health-Agent?"

You: "Consilio"

Supervisor: "Ok, creating for Consilio..."
```

**Instead:**
```
[In Consilio tab]
You: "Create epic for authentication"

Consilio Supervisor: "Creating epic..."
(Knows it's Consilio, no clarification needed)
```

### 2. Parallel Workflows ✅

**Work on 3 projects simultaneously:**

**9:00 AM** - Start Consilio dark mode feature (Tab 2)
**9:05 AM** - Start Odin parser refactoring (Tab 3)
**9:10 AM** - Start Health-Agent ML model update (Tab 4)

**All 3 running in parallel!**

**Check any time:**
- Switch to Tab 2: See Consilio progress
- Switch to Tab 3: See Odin progress
- Switch to Tab 4: See Health-Agent progress
- Switch to Tab 1: See overall VM status

### 3. Mobile Access ✅

**Claude.ai Projects sync to mobile:**

**On phone:**
- Open Claude app
- Switch to "Consilio" Project
- "Check progress on dark mode"
- See status update
- Switch to "Odin" Project
- "Verify parser tests passed"

**Same Projects, different device!**

### 4. No Context Confusion ✅

**Each Project has:**
- Its own CLAUDE.md instructions
- Its own conversation history
- Its own knowledge base
- Its own tools

**No accidental:**
- Creating Consilio epic in Odin repo
- Spawning Odin agents in Consilio workspace
- Mixing project contexts

### 5. Easy Onboarding ✅

**If you add a team member:**

**For Consilio project:**
1. Share Consilio Project with them
2. They get Consilio tools + context only
3. Can't access other projects
4. Clean permission model

---

## Migration Path

### Phase 1: Single MCP Server (Current)

**What you have today:**
- supervisor-service with one MCP endpoint
- All projects accessible from one Claude conversation

### Phase 2: Project-Scoped Tools (Easy)

**Add project context to tools:**
```typescript
// Tools get project parameter
read_planning_file(project: "consilio", filePath: "epic-001.md")
spawn_piv_agent(project: "odin", taskSpec: {...})
```

**Still one Claude conversation, but tools are scoped.**

### Phase 3: Multiple MCP Endpoints (Better)

**Create separate MCP endpoints:**
- `/mcp/meta` - Meta-supervisor tools
- `/mcp/consilio` - Consilio tools
- `/mcp/odin` - Odin tools
- etc.

**Create separate Claude.ai Projects, each connected to one endpoint.**

### Phase 4: Full Isolation (Best)

**Each Project has:**
- Own MCP endpoint
- Own knowledge base
- Own conversation history
- Own CLAUDE.md

**You work in multiple tabs, fully isolated.**

---

## Recommendation

**Start with Phase 2, plan for Phase 3**

**Why:**
- Phase 2 works with current supervisor-service architecture
- Phase 3 is clean separation (ideal for your multi-tab workflow)
- Can migrate incrementally

**Implementation:**
1. ✅ Build supervisor-service with project contexts (Phase 2)
2. ✅ Test with single Claude.ai Project (current)
3. ✅ Add multiple MCP endpoints (Phase 3)
4. ✅ Create separate Claude.ai Projects
5. ✅ Use multi-tab workflow

**Timeline:**
- Phase 2: Included in supervisor-service Phase 1-3 (already planned)
- Phase 3: Add in supervisor-service Phase 5 (new)
- Phase 4: After everything else working

---

## Configuration

**Add to supervisor-service config:**

```yaml
# .config/projects.yaml

projects:
  meta-supervisor:
    path: /home/samuel/supervisor
    mcp_endpoint: /mcp/meta
    tools:
      - meta_get_vm_health
      - meta_allocate_slots
      - meta_list_projects
      - meta_project_status

  consilio:
    path: /home/samuel/.archon/workspaces/consilio
    repo: https://github.com/gpt153/consilio
    mcp_endpoint: /mcp/consilio
    tools:
      - read_planning_file
      - create_epic
      - spawn_piv_agent
      - run_tests
      - create_pr

  odin:
    path: /home/samuel/.archon/workspaces/odin
    repo: https://github.com/gpt153/odin
    mcp_endpoint: /mcp/odin
    tools:
      - read_planning_file
      - create_epic
      - spawn_piv_agent
      - run_tests
      - create_pr

  # ... other projects
```

---

## Answer Your Questions

### Can I have different Claude.ai Projects for each repo?

**YES!** ✅

Each Claude.ai Project connects to a different MCP endpoint:
- Meta-Supervisor Project → http://localhost:8080/mcp/meta
- Consilio Project → http://localhost:8080/mcp/consilio
- Odin Project → http://localhost:8080/mcp/odin

### Can I have one Project for meta-supervisor?

**YES!** ✅

Meta-Supervisor gets its own Project with VM management tools.

### Can I work on 3-5 projects at once?

**YES!** ✅

Open 3-5 browser tabs, each with different Project:
- Tab 1: Meta (overview)
- Tab 2: Consilio (web app)
- Tab 3: Odin (parser)
- Tab 4: Health-Agent (ML)
- Tab 5: OpenHorizon (landing page)

### Can I switch between tabs instead of conversations?

**YES!** ✅

Switching browser tabs = switching projects
- Faster than scrolling conversations
- Visual separation (different tabs)
- Can see all at once (tab bar)
- Pin tabs for persistence

---

## This is EXACTLY How It Should Work! 🎉

**Your multi-tab workflow is the PERFECT use case for Claude.ai Projects!**

**Benefits:**
- ✅ Work on 5 projects simultaneously
- ✅ Each project isolated (no context mixing)
- ✅ Quick switching (browser tabs)
- ✅ Persistent across devices
- ✅ Clean mental model (1 tab = 1 project)

**This is better than:**
- ❌ One conversation with all projects (context mixing)
- ❌ Separate windows (harder to switch)
- ❌ Terminal-based (not accessible from mobile)

**You've identified the ideal architecture!** 👏
