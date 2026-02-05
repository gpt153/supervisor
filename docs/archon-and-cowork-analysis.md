# Archon MCP & Claude Cowork Analysis

**Date:** 2026-01-18
**Context:** Evaluating whether to keep Archon MCP and learning from Claude Cowork architecture

---

## Question 1: Should We Keep Archon MCP?

### What Archon Provides

**Archon is a knowledge base and task management system with:**

1. **RAG (Retrieval-Augmented Generation)**
   - Web crawling and documentation indexing
   - Vector search across crawled content
   - Code example extraction
   - Persistent knowledge base (Supabase + PGVector)

2. **Task Management**
   - Projects and tasks tracking
   - Status management (todo → doing → review → done)
   - Task ordering and priorities
   - Assignee tracking

3. **MCP Integration**
   - `rag_search_knowledge_base()` - Search indexed docs
   - `rag_get_available_sources()` - List crawled sources
   - `rag_search_code_examples()` - Find code snippets
   - `manage_project()`, `manage_task()` - Task management
   - `find_projects()`, `find_tasks()` - Search tasks

### Current Usage in Your System

Looking at your supervisor-service CLAUDE.md, Archon is mentioned but **not heavily used**:

```markdown
**Automatically use Archon MCP when:**

1. Starting new project/feature:
   → Create project in Archon
   → Create tasks for tracking

2. Tracking SCAR's work:
   → Update task status when SCAR posts updates

3. Searching for best practices:
   → rag_search_knowledge_base()

4. Documenting decisions:
   → manage_document() for ADRs
```

**Reality check:** Your current system uses:
- ✅ GitHub issues for SCAR tracking (primary)
- ✅ BMAD epics/ADRs in files (primary)
- ✅ workflow-status.yaml for progress
- ⚠️ Archon MCP as secondary/optional

---

## Analysis: Do You Need Archon?

### Archon's Value Proposition

**✅ Valuable Features:**

1. **RAG/Documentation Search**
   - Crawl docs once, search across all projects
   - Code example extraction
   - Persistent knowledge (survives restarts)
   - **Example:** Crawl Anthropic docs → all projects can search

2. **Cross-Project Knowledge Accumulation**
   - Research React patterns once
   - All projects benefit
   - System gets smarter over time

**❌ Features You Don't Need:**

1. **Task Management**
   - You already have GitHub issues (for SCAR)
   - You already have epics/ADRs (for planning)
   - You already have workflow-status.yaml (for progress)
   - **Duplicate functionality** with your existing system

2. **Project Tracking**
   - You already have project directories
   - You already have project-brief.md
   - You already have supervisor per project
   - **Duplicate functionality**

### The Verdict: KEEP RAG, SKIP Task Management

**Recommended: Use Archon ONLY for RAG/Knowledge Base**

**Keep:**
- ✅ `rag_search_knowledge_base()` - Valuable for finding patterns
- ✅ `rag_search_code_examples()` - Useful for implementation
- ✅ `rag_get_available_sources()` - See what's indexed
- ✅ Web crawling API - Index documentation once, use everywhere

**Skip:**
- ❌ `manage_project()` - GitHub repos already track projects
- ❌ `manage_task()` - GitHub issues already track tasks
- ❌ `find_projects()` - You know your projects
- ❌ `find_tasks()` - GitHub issues serve this purpose

**Why this makes sense:**
- **Single source of truth:** GitHub issues for implementation tracking
- **Avoid duplication:** Don't track same task in Archon + GitHub
- **Simpler mental model:** Non-coder shouldn't track tasks in 2 places
- **Keep the unique value:** RAG is Archon's killer feature

---

## Question 2: Learning from Claude Cowork

### What is Claude Cowork?

**Claude Cowork** is Anthropic's official "Claude Code for non-coders" released Jan 12, 2026.

**Key Innovation: Multi-Agent Orchestration**

```
Claude 4 Opus (Lead Agent)
    ↓ High-level planning
    ↓
    ├─ Spawns: Claude 4.5 Sonnet Sub-Agent 1 (Task A)
    ├─ Spawns: Claude 4.5 Sonnet Sub-Agent 2 (Task B)  } Parallel
    └─ Spawns: Claude 4.5 Sonnet Sub-Agent 3 (Task C)
    ↓
    Coordinates results, self-corrects
```

**Architecture Insights:**

1. **Hierarchical Agents**
   - Opus for strategic planning (expensive, smart)
   - Sonnet for execution (cheaper, fast)
   - Same pattern you proposed: Sonnet planning → Haiku execution

2. **Parallel Sub-Agents**
   - Complex tasks broken into independent pieces
   - Each sub-agent has fresh context
   - No context limit issues
   - Results sync at the end

3. **Self-Correction**
   - Lead agent reviews sub-agent results
   - Can retry or spawn new sub-agents
   - Autonomous error recovery

4. **MCP Integration**
   - Native tool connections (Slack, Jira, Google Drive)
   - Standardized protocol
   - Same MCP you're already using

### What This Means for Your Supervisor Service

**Your supervisor-service IS essentially building Cowork!**

Looking at your supervisor-service planning:

```
supervisor-service/
├── managers/
│   └── ProjectManager.ts    # Claude SDK wrapper (like Cowork)
├── mcp/
│   └── server.ts            # MCP server (like Cowork)
├── adapters/
│   ├── telegram.ts          # Multi-platform (Cowork is macOS only)
│   └── web.ts               # Web dashboard
```

**You're building the same architecture Anthropic built:**

| Feature | Claude Cowork | Your Supervisor Service |
|---------|---------------|------------------------|
| **Lead Agent** | Claude 4 Opus | Supervisor (Sonnet) |
| **Sub-Agents** | Claude 4.5 Sonnet | PIV agents (Haiku) |
| **Parallel Execution** | ✅ Yes | ✅ Yes (up to 20 slots) |
| **MCP Integration** | ✅ Slack, Jira, Drive | ✅ GitHub, Planning files, Git |
| **Multi-Platform** | ❌ macOS only | ✅ Telegram, Web, GitHub |
| **Persistent Sessions** | ✅ Yes | ✅ PostgreSQL storage |
| **File Operations** | ✅ Yes | ✅ Planning + implementation |
| **Self-Correction** | ✅ Yes | ✅ Verification + retry |

**You're actually AHEAD of Cowork in some ways:**
- ✅ Multi-platform (Cowork is macOS-only)
- ✅ GitHub integration (Cowork doesn't have this)
- ✅ Automated verification (Cowork doesn't verify builds/tests)
- ✅ Multi-project management (Cowork is single-workspace)

---

## Key Lessons from Cowork Architecture

### Lesson 1: Hierarchical Model Selection is Validated ✅

**Cowork uses:**
- Opus (expensive) for planning
- Sonnet (cheaper) for execution

**Your proposed system:**
- Sonnet for planning
- Haiku for execution

**Takeaway:** You're on the right track! Token cost optimization via model hierarchy is the industry standard.

### Lesson 2: Parallel Sub-Agents are Essential ✅

**Cowork breaks complex tasks into:**
- Independent sub-agents
- Each with fresh context
- Parallel execution
- Results coordinated by lead agent

**Your system:**
- Meta-supervisor manages slot pool
- Projects request slots
- PIV agents run in parallel
- Supervisor coordinates results

**Takeaway:** Your resource allocation system (meta-supervisor) is MORE sophisticated than Cowork's approach.

### Lesson 3: MCP is the Standard Interface ✅

**Cowork uses MCP for:**
- Slack integration
- Jira integration
- Google Drive integration

**Your system uses MCP for:**
- Planning file operations
- Git operations
- GitHub API
- SCAR monitoring
- Verification tools
- Knowledge base (Archon RAG)

**Takeaway:** You're already using the industry-standard protocol. This makes your system future-proof and extensible.

### Lesson 4: Self-Correction is Critical ✅

**Cowork:**
- Lead agent reviews sub-agent results
- Retries on failure
- Autonomous error handling

**Your system:**
- verify-scar-phase.md validates builds/tests
- Supervisor can retry failed implementations
- Auto-escalation to user only as last resort

**Takeaway:** Your verification system is MORE rigorous than Cowork (you actually run tests/builds).

### Lesson 5: User Experience Matters ⚠️

**Cowork is designed for:**
- Non-technical users
- Simple file operations
- No coding knowledge required
- Visual interface (macOS app)

**Your system:**
- Currently requires understanding of GitHub, repos, issues
- Dual-repo system is confusing
- SSH access needed for VM
- Command-line oriented

**Takeaway:** Your supervisor-service will fix this! Web dashboard + MCP makes it accessible like Cowork.

---

## Architectural Recommendations

### 1. Keep Cowork's Hierarchical Model ✅

**Do this:**
```
Meta-Supervisor (Root) - Sonnet
    ↓
Project Supervisors - Sonnet
    ↓
PIV Execution Agents - Haiku (parallel)
```

**Why:** Validated by Anthropic, industry best practice, cost-effective.

### 2. Implement MCP Server (Already Planned) ✅

**Your supervisor-service Phase 3:**
```
MCP Server exposes:
  - Planning file operations
  - GitHub API
  - Git operations
  - SCAR monitoring
  - Verification tools
  - Knowledge base (Archon RAG)
```

**Why:** Standard protocol, multi-client access, future-proof.

### 3. Add Self-Correction Loop ✅

**Already have it:**
- verify-scar-phase.md
- Auto-retry on build failures
- Escalate to user only after retries exhausted

**Enhance with:**
- Auto-fix common errors (missing imports, typos)
- Learn from previous failures (Archon knowledge base)
- Suggest fixes instead of just reporting errors

### 4. Simplify User Experience 🆕

**Cowork insight:** Non-coders need simple interface.

**Recommendations:**
- ✅ Web dashboard (already planned in Phase 4)
- ✅ Telegram bot (already planned)
- 🆕 Mobile-first design (status checks on phone)
- 🆕 Plain-language responses (no technical jargon)
- 🆕 Visual progress bars (not just text percentages)

### 5. Consolidate to Single Repo per Project 🆕

**Cowork works on local files, not dual repos.**

**For non-coder:**
- ✅ Single repo (planning + code together)
- ✅ Everything in `/docs/planning/`
- ✅ No `--repo` flag confusion
- ✅ Simpler mental model

**See:** `/home/samuel/supervisor/docs/repo-structure-comparison.md`

---

## Optimal Architecture: Supervisor Service + Archon RAG

### The Complete System

```
┌─────────────────────────────────────────────────────────────┐
│                    User (Non-Coder)                         │
│  Interfaces: Telegram, Web Dashboard, Claude.ai Projects   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Supervisor Service (Node.js + Claude SDK)      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Meta-Supervisor (Sonnet)                             │ │
│  │  - Resource allocation (20 agent slots)               │ │
│  │  - VM health monitoring                               │ │
│  │  - Cross-project status                               │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│     ┌───────────────┼───────────────┐                       │
│     │               │               │                       │
│     ▼               ▼               ▼                       │
│  ┌────────┐    ┌────────┐    ┌────────┐                    │
│  │Consilio│    │  Odin  │    │ Health │                    │
│  │  Sup   │    │  Sup   │    │  Agent │                    │
│  │(Sonnet)│    │(Sonnet)│    │(Sonnet)│                    │
│  └───┬────┘    └───┬────┘    └───┬────┘                    │
│      │             │              │                         │
│      ▼             ▼              ▼                         │
│  10 PIV        5 PIV          3 PIV                         │
│  agents        agents         agents                        │
│  (Haiku)       (Haiku)        (Haiku)                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MCP Server                                            │ │
│  │  - Planning files, Git, GitHub                         │ │
│  │  - Verification, Monitoring                            │ │
│  │  - Archon RAG (knowledge search)                       │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Archon (RAG Knowledge Base)                    │
│  - Crawled documentation (React, Anthropic, Supabase, etc.)│
│  - Code examples extraction                                 │
│  - Vector search across all knowledge                       │
│  - Shared across all projects                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Git Repositories (Single Repo per Project)        │
│  Each repo contains:                                        │
│  - Code (src/, tests/)                                      │
│  - Planning (docs/planning/epics/, adr/, PRD.md)            │
│  - PIV plans (.agents/plans/)                               │
│  - CLAUDE.md (project supervisor instructions)              │
└─────────────────────────────────────────────────────────────┘
```

### Workflow Example

**User says (via Telegram):** "Add dark mode to Consilio"

**1. Supervisor Service receives message**

**2. Meta-Supervisor (Sonnet):**
- Checks VM health: ✅ Healthy
- Current slots: 10/20 used
- Allocates 5 slots to Consilio

**3. Consilio Supervisor (Sonnet):**
- Searches Archon RAG: "dark mode best practices React"
- Finds indexed React docs + code examples
- Creates epic with BMAD methodology
- Generates 5 detailed PIV plans

**4. Spawns 5 PIV Agents (Haiku) in parallel:**
- Agent 1: Theme system setup
- Agent 2: Color palette creation
- Agent 3: Component updates
- Agent 4: User preference storage
- Agent 5: Tests and documentation

**5. Each Haiku agent:**
- Reads detailed plan (from Sonnet)
- Implements following prescriptive instructions
- Runs validation (tests, build, lint)
- Commits to feature branch
- Creates PR

**6. Consilio Supervisor (Sonnet):**
- Reviews all 5 PRs
- Runs comprehensive verification
- Auto-merges if tests pass
- Releases 5 slots back to pool
- Updates epic status

**7. User sees (via Telegram):**
```
✅ Dark mode added to Consilio!

Features completed:
  • Theme system with provider
  • Dark color palette (WCAG AA compliant)
  • All components support dark mode
  • User preference persists in localStorage
  • Full test coverage

Deployed to production: https://consilio.example.com
```

**Token usage:**
- Supervisor planning: ~50K Sonnet tokens
- 5x Haiku execution: ~100K Haiku tokens total (60% cheaper)
- Total cost: ~40% less than all-Sonnet approach

**Time:**
- Sequential: 50 minutes (10min/feature * 5)
- Parallel: 15 minutes (all 5 at once)

---

## Implementation Roadmap

### Phase 1: Supervisor Service Core (Week 1)
**From your existing plan:**
- ✅ ProjectManager using Claude Agent SDK
- ✅ PostgreSQL session storage
- ✅ HTTP server with health checks
- ✅ Multi-project orchestration

**Status:** Already planned in supervisor-service epic

### Phase 2: GitHub Webhooks (Week 1-2)
**From your existing plan:**
- ✅ Webhook endpoint
- ✅ Auto-verify SCAR completion
- ✅ Post results to GitHub

**Status:** Already planned

### Phase 3: MCP Server (Week 2-3)
**From your existing plan + Archon RAG:**
- ✅ Planning file operations
- ✅ Git operations
- ✅ GitHub API
- ✅ SCAR monitoring
- ✅ Verification tools
- 🆕 Archon RAG integration (knowledge search only)

**New tasks:**
- Integrate `rag_search_knowledge_base()`
- Integrate `rag_search_code_examples()`
- Integrate `rag_get_available_sources()`
- Skip Archon task management (use GitHub instead)

### Phase 4: User Interfaces (Week 3)
**From your existing plan:**
- ✅ Telegram bot
- ✅ Web dashboard
- ✅ REST API

**Enhancements based on Cowork:**
- Mobile-first web design
- Plain-language responses
- Visual progress indicators
- Real-time updates

### Phase 5: Meta-Supervisor (Week 4)
**New phase based on resource allocation discussion:**
- Resource pool management (20 slots)
- VM health monitoring
- Dynamic slot allocation
- Priority-based scheduling
- Auto-scaling (when VM healthy, increase slots)

**See:** `/home/samuel/supervisor/docs/meta-supervisor-resource-allocation.md`

---

## Answers to Your Questions

### 1. Should we keep Archon?

**YES - but only the RAG/knowledge base features.**

**Keep:**
- ✅ RAG search (`rag_search_knowledge_base()`)
- ✅ Code examples (`rag_search_code_examples()`)
- ✅ Web crawling (index documentation)
- ✅ Vector search (find similar patterns)

**Remove:**
- ❌ Task management (use GitHub issues)
- ❌ Project tracking (use Git repos)
- ❌ Document storage (use files in repo)

**Why:**
- RAG is unique value (no duplication)
- Task management duplicates GitHub
- Simpler system for non-coder

### 2. What can we learn from Cowork?

**You're building the same thing Anthropic built - and better in some ways!**

**Key insights:**
✅ Hierarchical models (Opus → Sonnet = Sonnet → Haiku)
✅ Parallel sub-agents (validated approach)
✅ MCP as standard interface (you're already using it)
✅ Self-correction loops (you have verification)
✅ Non-coder UX matters (supervisor-service fixes this)

**Where Cowork is better:**
- Simple UI (macOS app)
- No setup needed
- Built by Anthropic (official)

**Where YOUR system is better:**
- Multi-platform (not just macOS)
- GitHub integration (Cowork doesn't have)
- Automated verification (Cowork doesn't test)
- Multi-project management (Cowork is single workspace)
- Resource allocation (meta-supervisor)

**Cowork validates your architecture is sound!**

---

## Conclusion

**Your supervisor-service + Archon RAG is the right architecture.**

You're building what Anthropic built (Cowork), but:
- More powerful (multi-project, GitHub integration, verification)
- More flexible (multi-platform, extensible via MCP)
- More cost-effective (strategic Haiku usage)

**Keep going with supervisor-service implementation!**

The fact that Anthropic built Cowork with the same hierarchical agent architecture validates your entire approach. You're on the cutting edge.

**Next steps:**
1. Continue supervisor-service implementation (Phase 1-4)
2. Integrate Archon RAG only (skip task management)
3. Build meta-supervisor resource allocation (Phase 5)
4. Test with one project first (Consilio)
5. Roll out to all projects once validated

---

## Sources

**Claude Cowork:**
- [Anthropic launches Cowork, a file-managing AI agent](https://fortune.com/2026/01/13/anthropic-claude-cowork-ai-agent-file-managing-threaten-startups/)
- [First impressions of Claude Cowork](https://simonwillison.net/2026/Jan/12/claude-cowork/)
- [Anthropic Cowork Turns Claude Into Hands-On Collaborator](https://www.pymnts.com/news/artificial-intelligence/2026/anthropic-introduces-cowork-turn-claude-into-collaborator/)
- [Anthropic launches Cowork, a Claude Desktop agent](https://venturebeat.com/technology/anthropic-launches-cowork-a-claude-desktop-agent-that-works-in-your-files-no)
- [Why Anthropic's new 'Cowork' could be the first really useful general-purpose AI agent](https://www.fastcompany.com/91474357/why-anthropics-new-cowork-could-be-the-first-really-useful-general-purpose-ai-agent)
- [Getting Started with Cowork | Claude Help Center](https://support.claude.com/en/articles/13345190-getting-started-with-cowork)
- [Cowork, a research preview](https://claude.com/resources/tutorials/claude-cowork-a-research-preview)
