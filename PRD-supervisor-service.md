# Product Requirements Document: Supervisor-Service

**Version:** 1.0
**Date:** 2026-01-18
**Status:** Draft → Ready for Implementation
**Owner:** Meta-Supervisor
**Target User:** Non-coder managing 3-5 AI-developed projects simultaneously

---

## Executive Summary

**What:** A comprehensive multi-project orchestration system that enables a non-coder to manage AI-driven software development across multiple projects using natural language in Claude.ai browser.

**Why:** Current AI coding tools assume technical expertise. We need a system where a non-coder can plan, build, deploy, and manage production software by simply talking to supervisors in plain language.

**How:** Multi-tier AI agent system (Opus for planning → Sonnet for orchestration → Haiku for execution) with full infrastructure automation (secrets, ports, DNS, VMs, deployments).

**Success Metric:** User can go from "I want to build X" to deployed production app without touching code, terminals, or cloud consoles.

---

## Problem Statement

### Current State (Painful)

**For non-coders attempting AI-assisted development:**

1. **Fragmented Tools**
   - Multiple browser tabs
   - Context mixing between projects
   - Lost conversations
   - Repeated instructions

2. **Manual Infrastructure**
   - Manually create DNS records in Cloudflare
   - Manually track port allocations → conflicts
   - Manually manage API keys → lost/forgotten
   - Manually scale VMs → costly or slow

3. **Poor Estimates**
   - "This will take 5-6 hours" → Actually 20 minutes
   - "6-8 weeks" human estimates for AI work
   - No learning from past executions
   - Parallelism not accounted for

4. **No Project Memory**
   - Supervisors forget project conventions
   - Repeat same mistakes
   - Don't learn from failures
   - Instructions become stale

5. **Technical Barriers**
   - Must understand Git, Docker, PostgreSQL
   - Must know how to deploy services
   - Must manage secrets manually
   - Must understand networking/ports

### Desired State (Ideal)

**Natural language project management:**

```
User (in browser): "Build an authentication system for Consilio"

Opus: "Let me plan this based on your existing codebase...
       I see you use Next.js 14, tRPC, and Prisma.
       I'll create an epic with 5 issues.
       Estimated time: 22-28 minutes (based on 12 similar tasks).

       Starting implementation now..."

[22 minutes later]

Opus: "✅ Authentication complete and deployed
       • URL: https://auth.consilio.153.se
       • Port: 3102 (auto-allocated)
       • Database migrated
       • 8 tests passing
       • Actual time: 24 minutes (estimated 22-28)"

User: "Perfect!"
```

**Zero manual work:**
- ✅ No Cloudflare dashboard
- ✅ No GCloud console
- ✅ No port conflicts
- ✅ No secret management
- ✅ No deployment scripts

---

## Target Users

### Primary: Non-Coder Project Owner

**Profile:**
- Name: Samuel
- Background: Business/product, not software engineering
- Projects: 3-5 active projects simultaneously
- Goal: Build and deploy production software
- Constraint: Cannot write code or use terminals

**Needs:**
- Natural language interface (Claude.ai browser)
- Automatic everything (no manual infrastructure)
- Accurate estimates (not "5-6 hours" for 20 min work)
- Multi-project context isolation (no mixing)
- Plain language reporting (no code dumps)

### Secondary: Technical Collaborators (Future)

**Profile:**
- Developers joining existing AI-managed projects
- Need to understand what AI built
- Want to add features manually

**Needs:**
- Code that follows conventions
- Good test coverage
- Clear documentation
- Standard project structure

---

## Core Requirements

### 1. Multi-Project Workflow

**REQ-1.1: Separate Claude.ai Projects**
- User has one Claude.ai Project per repo
- Plus one for meta-supervisor
- Browser tab switching (not in-chat switching)
- Each tab isolated context

**REQ-1.2: Project-Scoped MCP Endpoints**
- `/mcp/meta` - Meta-supervisor
- `/mcp/consilio` - Consilio project
- `/mcp/openhorizon` - OpenHorizon project
- `/mcp/{project}` - Dynamic per project

**REQ-1.3: No Context Mixing**
- Consilio tools don't appear in OpenHorizon tab
- Each supervisor knows only its project
- Shared tools only in meta-supervisor

**Success Criteria:**
- User can switch tabs and never see wrong project
- Each tab = one project, clean mental model

---

### 2. Secrets Management

**REQ-2.1: Automatic Secret Storage**
- Detect API keys in user messages
- Store automatically with appropriate key path
- Never ask user for same secret twice

**REQ-2.2: Encrypted Storage**
- AES-256-GCM encryption at rest
- PostgreSQL storage
- Audit trail (access tracking)

**REQ-2.3: Hierarchical Key Paths**
- `meta/cloudflare/api_token`
- `project/consilio/stripe_api_key`
- `service/penpot/admin_password`

**REQ-2.4: Automatic API Key Creation (Where Possible)**
- Google/Gemini: Create via API ✅
- Stripe: Create restricted keys ✅
- GitHub: Create installation tokens ✅
- Anthropic/OpenAI: Ask user (no API) ❌

**Success Criteria:**
- User says API key once, never again
- Supervisors retrieve secrets automatically
- 60%+ of keys created without user action

---

### 3. Port Allocation

**REQ-3.1: Guaranteed Conflict Prevention**
- 100 ports per project (not 1000)
- Ranges: Consilio=3100-3199, OpenHorizon=3200-3299
- Shared services: 9000-9999
- Database enforces ranges

**REQ-3.2: Automatic Allocation**
- Supervisor calls `get_port(project, service)`
- Returns next available in range
- Links to Cloudflare hostname
- Impossible to conflict (different ranges)

**REQ-3.3: Cloudflare Integration**
- Port allocation auto-syncs to tunnel config
- `/etc/cloudflared/config.yml` updated automatically
- Service deployed with allocated port

**Success Criteria:**
- **ZERO port conflicts ever**
- User never thinks about ports
- Services always work first try

---

### 4. Cloudflare Integration

**REQ-4.1: Automatic DNS Management**
- Create CNAME records via API
- Delete old records
- Update existing records
- No manual Cloudflare dashboard usage

**REQ-4.2: Tunnel Route Sync**
- Port allocations → tunnel ingress rules
- One command updates entire config
- Cloudflared auto-restarted
- All services always accessible

**REQ-4.3: Multi-Domain Support**
- 153.se, openhorizon.cc, future domains
- Automatic zone detection from hostname
- Per-zone management

**Success Criteria:**
- Deploy service → DNS + tunnel automatic
- User never opens Cloudflare dashboard
- All services HTTPS-accessible

---

### 5. GCloud Integration

**REQ-5.1: VM Management**
- Start/stop/resize VMs
- Create/delete VMs
- Get VM details
- Full access to 2+ accounts

**REQ-5.2: Health Monitoring**
- CPU, memory, disk usage
- Historical metrics (last 60 min, 24 hours)
- Threshold alerts

**REQ-5.3: Automatic Scaling**
- Monitor VM health hourly
- CPU > 80% for 2 hours → scale up
- Disk > 85% → alert user
- Memory > 90% → restart services or scale

**REQ-5.4: Multi-Account Support**
- VM host account
- OpenHorizon account
- Future accounts
- Service account keys in secrets

**Success Criteria:**
- User never opens GCloud console
- VMs scale automatically
- Costs optimized (right-sized)

---

### 6. Task Timing & Estimation

**REQ-6.1: Track All Executions**
- Every subagent timed (start/end)
- Task type, complexity, project
- Success/failure, retry count
- Tokens used, LOC changed

**REQ-6.2: Data-Driven Estimates**
- Find similar past tasks (RAG search)
- Use actual completion times
- Provide confidence intervals
- Improve over time

**REQ-6.3: Parallelism Accounting**
- Track parallel executions
- Report real time (not sequential sum)
- Calculate efficiency
- Show time saved

**REQ-6.4: NO MORE WRONG ESTIMATES**
- "Based on 15 similar tasks: 18-25 minutes"
- NOT "5-6 hours" when it takes 20 minutes
- NOT "6-8 weeks" for AI work

**Success Criteria:**
- 90%+ of estimates within 20% of actual
- Average estimation error < 10%
- User trusts estimates (not frustrated)

---

### 7. Instruction Management

**REQ-7.1: Layered Instructions**
- Core instructions (all supervisors)
- Meta-specific (meta-supervisor only)
- Project-specific (per project)
- Auto-assembled CLAUDE.md

**REQ-7.2: One-Command Update**
- Meta updates core instruction
- All supervisors regenerated
- Project-specific preserved
- No manual copying

**REQ-7.3: Automatic Project Optimization**
- Analyze codebase after major changes
- Update project-specific instructions
- Never touch core instructions
- Triggered by: epic completion, PR merge, monthly

**Success Criteria:**
- Update all supervisors: 1 command
- Instructions always current
- Zero manual maintenance

---

### 8. Learning System

**REQ-8.1: Hybrid Storage**
- .md files (human-readable, Git-versioned)
- RAG index (semantic search)
- Best of both worlds

**REQ-8.2: Automatic Learning Check**
- Before planning task, search learnings
- Include relevant learnings in context
- Avoid past mistakes automatically
- No manual checking

**REQ-8.3: Learning Impact Tracking**
- Time saved by applying learning
- Before/after metrics
- Continuous improvement

**Success Criteria:**
- Past mistakes never repeated
- Supervisors get smarter over time
- Learning integration invisible to user

---

### 9. PIV Loop Implementation

**REQ-9.1: Three-Phase Execution**
- **Plan:** Sonnet analyzes codebase, creates detailed plan
- **Implement:** Haiku follows prescriptive instructions
- **Validate:** Tests run, build succeeds, PR created

**REQ-9.2: Adapted from Cole Medin**
- Take methodology, replace architecture
- Local agents (not remote webhooks)
- Direct returns (not GitHub comments)
- Feature branches (not worktrees)

**REQ-9.3: Cost Optimization**
- Sonnet for planning (quality)
- Haiku for execution (cheap)
- 60% cost reduction vs all-Sonnet

**Success Criteria:**
- High-quality implementation
- Low cost
- Fast execution

---

### 10. Model Selection

**REQ-10.1: Three-Tier Architecture**
- **User (browser):** Opus 4.5 (best planning)
- **Supervisor:** Sonnet 4.5 (orchestration)
- **PIV Agents:** Haiku 4 (cheap execution)

**REQ-10.2: Strategic Usage**
- Opus: Complex planning, strategic decisions
- Sonnet: Task orchestration, monitoring, validation
- Haiku: Simple execution, monitoring loops

**Success Criteria:**
- Best quality where it matters
- Minimum cost for commodity work
- Total cost 60-70% less than all-Sonnet

---

## Non-Functional Requirements

### Performance

**NFR-1: Estimation Accuracy**
- 90% of tasks within 20% of estimate
- Average error < 10%
- 95% confidence intervals provided

**NFR-2: Parallel Efficiency**
- 70%+ parallelism efficiency
- N agents ≈ N× speedup (not sequential)

**NFR-3: Response Time**
- MCP tool calls: < 500ms
- Secret retrieval: < 100ms
- Port allocation: < 200ms

### Reliability

**NFR-4: Zero Conflicts**
- Port conflicts: 0 (guaranteed by ranges)
- DNS conflicts: 0 (managed)
- Secret conflicts: 0 (unique key paths)

**NFR-5: Auto-Recovery**
- Failed tasks: Auto-retry once
- VM down: Auto-restart
- Service down: Alert + restart

**NFR-6: Data Persistence**
- All timing data stored
- All secrets encrypted
- All learnings version-controlled

### Security

**NFR-7: Secret Encryption**
- AES-256-GCM at rest
- Never in Git
- Never in logs
- Audit trail

**NFR-8: API Key Permissions**
- Least privilege (restricted keys)
- Scoped to projects
- Automatic expiration (where supported)

**NFR-9: Service Account Isolation**
- GCloud: Owner role (full access needed)
- Cloudflare: DNS + Tunnel only
- GitHub: Repo-scoped tokens

### Usability

**NFR-10: Plain Language**
- User sees plain language reports
- No code dumps in chat
- No technical jargon
- Outcome-focused communication

**NFR-11: Transparent Automation**
- User informed of automatic actions
- "Created DNS record" not silent
- "Allocated port 3102" visible
- "Stored secret" confirmed

**NFR-12: Error Messages**
- Plain language errors
- Suggested fixes
- No stack traces to user

---

## Out of Scope (V1)

**Not included in initial version:**

1. **Multi-user collaboration** - Single user only
2. **Custom model hosting** - Use Anthropic API only
3. **Non-Claude LLMs** - Claude models only
4. **Visual design tools** - Frame0/Figma integration (separate feature)
5. **Cost tracking UI** - Basic logging only
6. **Billing automation** - Manual budget monitoring
7. **Backup/restore** - Git is backup
8. **Multi-cloud** - GCloud only (no AWS/Azure)
9. **Mobile app** - Claude.ai browser only
10. **Voice interface** - Text only

---

## Success Metrics

### Primary KPIs

1. **Estimation Accuracy**
   - Target: 90% within 20% of actual
   - Measure: `abs(actual - estimated) / estimated < 0.20`

2. **Port Conflicts**
   - Target: 0
   - Measure: Count conflicts in logs

3. **Manual Infrastructure Work**
   - Target: 0 Cloudflare/GCloud console opens
   - Measure: User self-report

4. **Time to Deploy Feature**
   - Target: < 30 minutes for medium complexity
   - Measure: Epic start → deployed + verified

5. **Cost per Feature**
   - Target: < $2 (vs $30 all-Sonnet)
   - Measure: API costs per epic

### Secondary KPIs

6. **Context Switching Time**
   - Target: < 5 seconds
   - Measure: Browser tab switch → ready

7. **Learning Application Rate**
   - Target: 80%+ of tasks check learnings
   - Measure: Learning searches / tasks

8. **Secret Reuse**
   - Target: Never ask twice for same secret
   - Measure: Secret requests / unique secrets

9. **Parallelism Efficiency**
   - Target: 70%+
   - Measure: Actual parallel / ideal parallel

10. **User Satisfaction**
    - Target: "Feels like magic"
    - Measure: User feedback

---

## User Stories

### Epic: Deploy New Service

```
As a non-coder
I want to deploy a new API service
So that my app has new functionality

Acceptance Criteria:
- I describe the feature in plain language
- Supervisor creates plan and estimates time
- Implementation happens automatically
- Service deployed with HTTPS URL
- DNS record created automatically
- Port allocated without conflict
- I'm notified when complete
- Total time < 30 minutes
```

### Epic: Add New Project

```
As a non-coder
I want to add a new project to supervisor-service
So that I can manage another application

Acceptance Criteria:
- I say "Add project X"
- Meta-supervisor creates GitHub repos
- Allocates port range (100 ports)
- Creates project-specific MCP endpoint
- I open new browser tab
- Project supervisor ready to use
- Takes < 5 minutes
```

### Epic: Check Progress Across Projects

```
As a non-coder
I want to see status of all my projects
So that I know what's happening

Acceptance Criteria:
- I ask meta-supervisor "Show project status"
- Get plain language summary of each project
- See active tasks, completion %
- See recent deployments
- See resource usage (VM, costs)
- Takes < 10 seconds
```

---

## Technical Architecture

### High-Level Components

```
┌─────────────────────────────────────┐
│   User (Claude.ai Browser - Opus)  │
│   Multiple tabs (one per project)  │
└──────────────┬──────────────────────┘
               │
               │ Claude Agent SDK
               │
┌──────────────▼──────────────────────┐
│      supervisor-service (Node.js)   │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   MCP Server (Multiple Endpoints)│ │
│  │   /mcp/meta                    │ │
│  │   /mcp/consilio                │ │
│  │   /mcp/openhorizon             │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   Core Managers                │ │
│  │   • SecretsManager             │ │
│  │   • PortManager                │ │
│  │   • CloudflareManager          │ │
│  │   • GCloudManager              │ │
│  │   • TaskTimer                  │ │
│  │   • InstructionAssembler       │ │
│  │   • LearningsIndex             │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   Project Supervisors (Agents) │ │
│  │   • Consilio Supervisor        │ │
│  │   • OpenHorizon Supervisor     │ │
│  │   • Meta-Supervisor            │ │
│  └────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
               │ Spawn PIV Agents (Haiku)
               │
┌──────────────▼──────────────────────┐
│        PIV Agents (Subprocesses)    │
│        • PrimePhase (analyze)       │
│        • PlanPhase (design)         │
│        • ExecutePhase (implement)   │
└─────────────────────────────────────┘

External Services:
• PostgreSQL (secrets, ports, timing, learnings)
• Cloudflare API (DNS, tunnels)
• GCloud API (VMs, monitoring)
• GitHub API (issues, PRs)
• Anthropic API (Claude models)
```

---

## Dependencies

### External Services

1. **Claude API** (Anthropic)
   - Opus 4.5 (user planning)
   - Sonnet 4.5 (orchestration)
   - Haiku 4 (execution)

2. **PostgreSQL**
   - Secrets storage
   - Port allocations
   - Task timing data
   - RAG knowledge base

3. **Cloudflare**
   - DNS management
   - Tunnel routing
   - HTTPS access

4. **Google Cloud**
   - VM hosting
   - Compute management
   - Monitoring

5. **GitHub**
   - Code repositories
   - Issue tracking
   - PR management

### Internal Dependencies

1. **Claude Agent SDK**
   - Persistent agent sessions
   - Tool calling
   - Context management

2. **Node.js + TypeScript**
   - Runtime environment
   - Type safety

3. **MCP Protocol**
   - Tool definitions
   - Multi-endpoint support

---

## Risks & Mitigation

### Risk 1: API Rate Limits

**Risk:** Cloudflare/GCloud/GitHub rate limits
**Impact:** High - Could block deployments
**Mitigation:**
- Implement rate limit tracking
- Queue requests if approaching limit
- Exponential backoff on errors
- Cache API responses where possible

### Risk 2: Secret Encryption Key Loss

**Risk:** Lose encryption key → all secrets inaccessible
**Impact:** Critical - System unusable
**Mitigation:**
- Store key in multiple locations (systemd + .bashrc + documented)
- Backup key to 1Password/physical location
- Test recovery process monthly

### Risk 3: Port Range Exhaustion

**Risk:** Project uses > 100 ports
**Impact:** Medium - Can't deploy more services
**Mitigation:**
- 100 ports is generous (most projects use < 10)
- Monitor usage, alert at 80%
- Can expand range if needed (change to 200)

### Risk 4: Estimation Never Improves

**Risk:** Not enough historical data
**Impact:** Low - Estimates stay inaccurate longer
**Mitigation:**
- Start with conservative estimates
- Seed with sample data
- Improves naturally over time

### Risk 5: Context Window Limits

**Risk:** Too much data in supervisor context
**Impact:** Medium - Slower responses, higher cost
**Mitigation:**
- Automatic summarization
- Subagent delegation
- Instruction sharding
- Context handoff system (already designed)

---

## Rollout Plan

### Phase 0: Foundation (Week 1-2)
- Database setup
- Core managers implementation
- MCP server infrastructure

### Phase 1: Secrets + Ports (Week 3)
- SecretsManager + PortManager
- MCP tools
- Migration of existing

### Phase 2: Cloudflare + GCloud (Week 4)
- CloudflareManager + GCloudManager
- Automatic DNS/tunnel
- VM monitoring

### Phase 3: Timing + Learning (Week 5)
- TaskTimer + LearningsIndex
- RAG integration
- Dashboard

### Phase 4: Instruction System (Week 6)
- InstructionAssembler
- Adapt-local-claude
- Auto-update triggers

### Phase 5: Testing + Refinement (Week 7)
- End-to-end testing
- Edge cases
- Performance tuning

### Phase 6: Production (Week 8)
- Deploy to production
- Monitor metrics
- Gather feedback

---

## Appendix

### Glossary

- **Epic:** Large feature requiring multiple issues
- **Issue:** Single implementable task (GitHub issue)
- **PIV Loop:** Plan → Implement → Validate methodology
- **Supervisor:** AI agent managing a project
- **Meta-Supervisor:** AI agent managing all supervisors
- **MCP:** Model Context Protocol (tool calling)
- **Subagent:** Specialized agent spawned for specific task

### References

- Cole Medin PIV Loop: `/home/samuel/course/`
- Current supervisor system: `/home/samuel/supervisor/`
- BMAD workflow: `/home/samuel/supervisor/docs/bmad-workflow.md`
- All infrastructure docs: `/home/samuel/supervisor/docs/`

---

**END OF PRD**

**Approval:** Pending user review
**Next Step:** Create technical specification and epic breakdown
