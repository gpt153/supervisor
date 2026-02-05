# Final Architecture Decisions

**Date:** 2026-01-18
**Status:** Approved Architecture
**Next Steps:** Implement supervisor-service with these decisions

---

## Summary of Decisions

### 1. GitHub Issues: YES - Automatic Audit Trail ✅

**Decision:** Keep GitHub issues, but make them AUTOMATIC

**Why:**
- ✅ Audit trail for feature requests
- ✅ PR linking (all PRs link to parent issue)
- ✅ Searchable history
- ✅ External collaboration ready

**How:**
- Supervisor creates issues automatically (user doesn't)
- Issues serve as documentation, not task tracking
- User sees simple: "Feature complete! See issue #42"
- Can click issue for details if curious

**Implementation:**
```yaml
github:
  auto_create_issues: true     # Supervisor creates automatically
  issue_for_features: true     # Epic-level work gets issue
  issue_for_bugs: true         # Bugs get issues
  issue_for_tasks: false       # Small tasks skip issues
  auto_close_issues: true      # Close when complete
  link_prs_to_issues: true     # All PRs reference parent issue
```

**See:** `/home/samuel/supervisor/docs/github-issues-vs-alternatives.md`

---

### 2. UI Planning: AI-First with Frame0 🎨

**Decision:** Use Frame0 MCP for AI-generated designs, Figma MCP for complex UIs

**Why:**
- ✅ Easiest for non-designer (AI generates from description)
- ✅ You already have Frame0 and Figma MCP tools
- ✅ Fast iterations ("make button bigger")
- ✅ Works entirely in chat (no external tools required)

**Workflow:**
```
You: "Create login screen with email, password, submit button"

Supervisor: [Uses Frame0 MCP to generate design]
            [Shows preview image]
            "Like this?"

You: "Make button bigger and purple"

Supervisor: [Updates Frame0 design]
            [Shows new preview]
            "Better?"

You: "Perfect!"

Supervisor: [Generates React code from Frame0]
            [Deploys to Storybook]
            "Live at https://storybook.153.se/LoginScreen"
```

**Fallback for complex UIs:**
- Design manually in Figma
- Share Figma URL with supervisor
- Supervisor uses Figma MCP to extract components
- Generates code automatically

**Priority:**
1. **Phase 1:** Frame0 AI-First (implement NOW - tools already available)
2. **Phase 2:** Figma integration (already have MCP, just add workflow)
3. **Phase 3:** Streamlined Expo for mobile (auto QR codes)
4. **Phase 4:** Penpot export (optional, for self-hosted preference)

**See:** `/home/samuel/supervisor/docs/ui-workflow-improvements.md`

---

### 3. Claude.ai Projects: Multi-Tab Workflow ⭐

**Decision:** Each project gets its own Claude.ai Project, accessible via browser tabs

**Architecture:**
```
supervisor-service (Node.js on VM)
    ↓
MCP Server with project contexts:
    /mcp/meta          → Meta-Supervisor tools
    /mcp/consilio      → Consilio tools
    /mcp/odin          → Odin tools
    /mcp/health-agent  → Health-Agent tools
    /mcp/openhorizon   → OpenHorizon tools
    ↓
Claude.ai Projects (one per repo):
    Browser Tab 1: "Meta-Supervisor" Project
    Browser Tab 2: "Consilio" Project
    Browser Tab 3: "Odin" Project
    Browser Tab 4: "Health-Agent" Project
    Browser Tab 5: "OpenHorizon" Project
```

**User Experience:**
- Open 5 browser tabs (one per project + meta)
- Pin tabs for persistence
- Switch tabs to switch projects
- Each tab = independent conversation
- No context mixing
- Works on desktop, browser, mobile

**Benefits:**
- ✅ Clean context separation (no "which project?" questions)
- ✅ Parallel workflows (work on 3-5 projects at once)
- ✅ Quick switching (browser tabs, not conversations)
- ✅ Persistent across devices (Projects sync)
- ✅ Mobile access (same Projects on phone)

**See:** `/home/samuel/supervisor/docs/multiple-claude-projects-setup.md`

---

## The Complete System

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User (Non-Coder)                         │
│                                                              │
│  Browser Tabs:                                              │
│  [Meta] [Consilio] [Odin] [Health] [OpenHorizon]            │
│     ↓       ↓        ↓       ↓          ↓                   │
│  Claude.ai Projects (connected via MCP)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│          Supervisor-Service (Node.js + Claude SDK)          │
│          Running on VM: http://localhost:8080               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MCP Server (5 project contexts)                       │ │
│  │  - /mcp/meta (VM management, resource allocation)      │ │
│  │  - /mcp/consilio (Consilio tools)                      │ │
│  │  - /mcp/odin (Odin tools)                              │ │
│  │  - /mcp/health-agent (Health-Agent tools)              │ │
│  │  - /mcp/openhorizon (OpenHorizon tools)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Meta-Supervisor (Sonnet)                             │ │
│  │  - Resource pool: 20 agent slots                       │ │
│  │  - VM health monitoring                                │ │
│  │  - Dynamic allocation across projects                  │ │
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
│  5 PIV         3 PIV          2 PIV                         │
│  agents        agents         agents                        │
│  (Haiku)       (Haiku)        (Haiku)                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Shared Services                                       │ │
│  │  - Archon RAG (knowledge search only)                  │ │
│  │  - Frame0 MCP (AI-generated UI designs)                │ │
│  │  - Figma MCP (import Figma designs)                    │ │
│  │  - GitHub API (auto-create issues, PRs)                │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Git Repositories (Single repo per project)        │
│  Each repo contains:                                        │
│  - Code (src/, tests/)                                      │
│  - Planning (docs/planning/epics/, adr/, PRD.md)            │
│  - PIV plans (.agents/plans/)                               │
│  - CLAUDE.md (project supervisor instructions)              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Example

**User says in Consilio tab:** "Add dark mode"

**1. Claude.ai Project "Consilio":**
- Calls MCP tool: `create_epic("Add dark mode")`
- Calls MCP tool: `request_slots(5)`

**2. Supervisor-Service:**
- Routes to Consilio supervisor
- Consilio supervisor creates epic
- Requests 5 slots from Meta-Supervisor
- Meta allocates 5 slots (15/20 total used)

**3. Consilio Supervisor (Sonnet):**
- Searches Archon RAG for dark mode patterns
- Creates epic file
- Auto-creates GitHub issue #42
- Generates 5 detailed PIV plans

**4. Spawns 5 PIV Agents (Haiku):**
- Agent 1: Theme system
- Agent 2: Color palette
- Agent 3: Component updates
- Agent 4: User preferences
- Agent 5: Tests

**5. Each Haiku Agent:**
- Reads detailed plan
- Implements following instructions
- Commits to feature branch
- Creates PR (linked to issue #42)
- Runs validation

**6. Consilio Supervisor:**
- Monitors all 5 PRs
- Runs comprehensive verification
- Auto-merges passing PRs
- Closes issue #42
- Releases 5 slots to pool

**7. User sees in Consilio tab:**
```
✅ Dark mode complete!

Features added:
  • Theme provider system
  • Dark color palette (WCAG AA)
  • All components support dark mode
  • User preference in localStorage
  • Full test coverage (98%)

GitHub issue: #42 (closed)
PRs merged: #123, #124, #125, #126, #127

Deployed to production: https://consilio.example.com
```

**Meanwhile in Odin tab:**
- Odin supervisor working on parser (3 agents)
- No awareness of Consilio work
- Independent progress

**Meanwhile in Meta tab:**
```
You: "Status?"

Meta: "📊 VM Status:

Health: Healthy (52% CPU, 68% RAM)
Slots: 15/20 used

Active Projects:
  • Consilio: 5 agents (dark mode - 80% complete)
  • Odin: 3 agents (parser refactoring - 45% complete)
  • Health-Agent: 0 agents (idle)

Queued: None
ETA: 12 minutes"
```

---

## Implementation Roadmap

### Phase 1: Supervisor-Service Core (Weeks 1-2)
**From existing supervisor-service plan:**
- ✅ ProjectManager using Claude Agent SDK
- ✅ PostgreSQL session storage
- ✅ HTTP server with health checks
- ✅ Multi-project orchestration
- 🆕 Add project contexts to MCP

**Deliverable:** Basic supervisor-service running, can send commands to projects

### Phase 2: GitHub Webhooks (Week 2)
**From existing plan + auto-issue creation:**
- ✅ Webhook endpoint
- ✅ Auto-verify SCAR completion (if migrating from SCAR)
- 🆕 Auto-create GitHub issues for features
- 🆕 Auto-link PRs to issues
- 🆕 Auto-close issues when complete

**Deliverable:** Automated GitHub issue workflow

### Phase 3: MCP Server with Project Contexts (Week 3)
**From existing plan + multi-project support:**
- ✅ Planning file operations
- ✅ Git operations
- ✅ GitHub API
- ✅ PIV agent spawning
- ✅ Verification tools
- 🆕 Project-scoped tools
- 🆕 Multiple MCP endpoints (/mcp/meta, /mcp/consilio, etc.)
- 🆕 Archon RAG integration (knowledge search only)

**Deliverable:** MCP server with 5 project contexts, ready for Claude.ai Projects

### Phase 4: UI Workflow Integration (Week 4)
**From UI improvements:**
- 🆕 Frame0 AI-generated designs
- 🆕 Figma MCP integration
- 🆕 Auto-export to Storybook
- 🆕 Streamlined Expo workflow
- ✅ Telegram bot (from existing plan)
- ✅ Web dashboard (from existing plan)

**Deliverable:** Complete UI workflow (AI-first with Figma fallback)

### Phase 5: Meta-Supervisor & Resource Management (Week 5)
**New phase:**
- 🆕 Resource pool management (20 slots)
- 🆕 VM health monitoring
- 🆕 Dynamic slot allocation
- 🆕 Priority-based scheduling
- 🆕 Auto-scaling (increase slots when VM healthy)
- 🆕 Cross-project status dashboard

**Deliverable:** Meta-supervisor managing resources across all projects

### Phase 6: Claude.ai Projects Setup (Week 6)
**New phase:**
- 🆕 Create 5 Claude.ai Projects (Meta + 4 repos)
- 🆕 Configure each Project with MCP endpoints
- 🆕 Upload project-specific knowledge
- 🆕 Add custom instructions (CLAUDE.md)
- 🆕 Test multi-tab workflow
- 🆕 Document user workflow

**Deliverable:** Multi-tab Claude.ai Projects workflow ready for daily use

---

## Technology Stack

**Runtime:**
- Node.js 20+ (supervisor-service)
- TypeScript (strict mode)
- PostgreSQL 14+ (session storage)

**Core Dependencies:**
- `@anthropic-ai/claude-agent-sdk` - Claude Code control
- `@modelcontextprotocol/sdk` - MCP server
- `express` - HTTP server
- `pg` - PostgreSQL client
- `octokit` - GitHub API

**MCP Servers (Already Connected):**
- Archon MCP (RAG/knowledge search)
- Frame0 MCP (AI-generated designs)
- Figma MCP (Figma import)
- Playwright MCP (browser testing - if needed)

**Services:**
- Penpot (optional, self-hosted design tool)
- Storybook (web component playground)
- Expo Snack (mobile component testing)

---

## Cost Analysis

### Token Usage Optimization

**Before (all-Sonnet):**
```
Planning: 50K Sonnet tokens
Execution (5 agents): 250K Sonnet tokens
Total: 300K Sonnet tokens
```

**After (Sonnet + Haiku):**
```
Planning: 50K Sonnet tokens
Execution (5 agents): 100K Haiku tokens
Total: 50K Sonnet + 100K Haiku = ~60% cost reduction
```

**Monthly Estimate (5 projects, 100 features/month):**
- Current (all-Sonnet): ~$800/month
- Optimized (Sonnet + Haiku): ~$320/month
- **Savings: $480/month (60%)**

### Claude Subscription

**Recommended Plan:**
- Claude Max ($200/month)
- Includes Claude 4 Opus and 4.5 Sonnet
- Sufficient for Meta-Supervisor + heavy planning

**With Haiku for execution:**
- Haiku costs ~$0.25/1M input tokens
- Execution workload mostly Haiku
- Max subscription sufficient for planning + monitoring

---

## Migration from Current System

**If you have existing SCAR setup:**

### Week 1: Run Both Systems in Parallel
- Keep SCAR for existing in-progress work
- Start new features on supervisor-service
- Test supervisor-service thoroughly

### Week 2: Migrate One Project
- Choose pilot project (e.g., Odin - newest)
- Create Claude.ai Project for Odin
- Connect to supervisor-service MCP
- Complete one feature end-to-end
- Validate workflow

### Week 3: Migrate Remaining Projects
- Create Claude.ai Projects for each repo
- Migrate active work to supervisor-service
- Deprecate SCAR webhooks

### Week 4: Retire SCAR
- Archive SCAR codebase
- Document learnings
- Celebrate simpler system! 🎉

---

## Success Metrics

**After full implementation, you should have:**

### User Experience
- ✅ Multi-tab workflow (5 browser tabs, one per project)
- ✅ AI-generated UI designs (Frame0 + Figma)
- ✅ Plain-language results (no code shown)
- ✅ Mobile access (Claude.ai app syncs Projects)
- ✅ Automatic GitHub issues (audit trail preserved)

### Technical Performance
- ✅ 60% token cost reduction (Haiku execution)
- ✅ Parallel execution (up to 20 agents across projects)
- ✅ Fast feature delivery (<30 min for simple features)
- ✅ Resource management (VM never crashes)
- ✅ Comprehensive testing (auto-verified builds)

### System Reliability
- ✅ Persistent sessions (survive VM restarts)
- ✅ Self-healing (auto-retry failures)
- ✅ Clear error messages (non-technical language)
- ✅ Audit trail (GitHub issues + PRs)
- ✅ Searchable history (GitHub search)

---

## Next Steps

1. **Review this document** ✅ (you're here!)
2. **Start supervisor-service Phase 1** (core service)
3. **Test with one project** (Odin recommended)
4. **Create first Claude.ai Project** (test multi-tab)
5. **Add Frame0 UI workflow** (AI-generated designs)
6. **Roll out to all projects** (when validated)

---

## Related Documentation

**Core Decisions:**
- `/home/samuel/supervisor/docs/github-issues-vs-alternatives.md`
- `/home/samuel/supervisor/docs/ui-workflow-improvements.md`
- `/home/samuel/supervisor/docs/multiple-claude-projects-setup.md`

**Architecture:**
- `/home/samuel/supervisor/docs/bmad-analysis-optimal-system-architecture.md`
- `/home/samuel/supervisor/docs/archon-and-cowork-analysis.md`
- `/home/samuel/supervisor/docs/meta-supervisor-resource-allocation.md`

**Existing Plans:**
- `/home/samuel/supervisor/supervisor-service/IMPLEMENTATION-KICKOFF.md`
- `/home/samuel/supervisor/supervisor-service/.bmad/epics/001-supervisor-service-implementation.md`

---

## Conclusion

**You have a complete, validated architecture:**

✅ **Validated by Anthropic** (Cowork uses same hierarchical agents)
✅ **Optimized for non-coder** (multi-tab, AI-first UI, plain language)
✅ **Cost-effective** (60% reduction via Haiku)
✅ **Scalable** (20 agent slots, dynamic allocation)
✅ **Future-proof** (MCP standard, Claude.ai Projects)

**This is better than:**
- ❌ Remote SCAR (webhook delays, GitHub polling, dual instances)
- ❌ CLI-only (not mobile-friendly)
- ❌ Single conversation (context mixing)
- ❌ Manual task tracking (GitHub issues automatic)
- ❌ Manual UI design (AI generates from description)

**You're building an enterprise-grade, multi-project, AI-powered development system that's accessible from any device!** 🚀

**Time to build it!** 💪
