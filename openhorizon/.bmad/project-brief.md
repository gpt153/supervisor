# Project Brief: OpenHorizon

**Created:** 2026-01-15 (Stockholm time)
**Last Updated:** 2026-01-15
**Status:** Active
**Repository:** https://github.com/gpt153/openhorizon.cc
**Implementation Workspace:** `/home/samuel/.archon/workspaces/openhorizon.cc/`
**Planning Workspace:** `/home/samuel/supervisor/openhorizon/`

---

## Vision

OpenHorizon is an AI-powered platform for sustainable Erasmus+ youth exchange project management. It provides **financial transparency** and **solution-finding tools** to help project coordinators make informed decisions about which projects to pursue and at what financial margin. By combining intelligent brainstorming, budget calculation with official Erasmus+ unit costs, and AI-powered vendor research, OpenHorizon enables coordinators to see the true economics of each project and choose whether to optimize for community impact (break-even), sustainable income (moderate profit), or maximum financial return.

---

## Goals

### Primary Goals
1. **Financial Transparency for Project Decisions:** Provide clear visibility into project economics (Erasmus+ grant vs. estimated costs) so coordinators can make informed choices about which projects to pursue and at what margin target (break-even for community impact vs. profitable for sustainable income).

2. **AI-Powered Solution Finding:** Deliver working vendor research agents (accommodation, food, travel) that find and analyze options, enabling coordinators to optimize costs based on their chosen margin target for each project.

3. **Support Real-World Projects:** Successfully plan and execute 3-5 Erasmus+ projects by February 2026 (Samuel's förening), with the flexibility to choose break-even community projects or income-generating projects based on priorities.

4. **Complete Application Workflow:** Provide end-to-end support from brainstorming through budget calculation, vendor research, and application document generation.

### Success Criteria
- [x] Criterion 1: Core feature set complete (Seed generation, elaboration, project conversion, programme builder, budget calculator, profit dashboard, document export)
- [ ] Criterion 2: Vendor search agents (accommodation, food, travel) working without timeouts, providing actionable options within 30 seconds
- [ ] Criterion 3: Successfully plan 3-5 real Erasmus+ projects by February 2026 with clear financial visibility for each
- [ ] Criterion 4: Profit dashboard accurately tracks grant income vs. costs, enabling informed margin decisions per project
- [ ] Criterion 5: Platform reduces project planning time from 40-60 hours to 4-6 hours (90% time savings)
- [ ] Criterion 6: Production deployment stable with <1% downtime

---

## Stakeholders

### Primary User
- **Samuel (Project Coordinator):** Manages 3-5 Erasmus+ projects for Swedish förening, needs:
  - **Financial transparency:** Clear view of grant amount vs. estimated costs for each project
  - **Vendor research tools:** AI agents to find accommodation, food, and travel options
  - **Informed decision-making:** Ability to choose margin targets per project (break-even for community impact vs. profitable for income)
  - **Time efficiency:** Reduce planning from 40-60 hours to 4-6 hours per project
  - **Application generation:** Export-ready documents for EU submission

### Future Stakeholders (Potential Expansion)
- Other project coordinators managing Erasmus+ projects
- Youth organizations seeking sustainable project management with financial clarity

### Decision Makers
- **Owner & Primary User:** Samuel (gpt153)
- **Technical Lead:** SCAR (AI implementation agent)
- **Supervisor:** Claude Supervisor (planning & orchestration)

---

## Scope

### In Scope (Completed ~91%)
- **Seed Management:** AI-powered brainstorming, seed garden organization, seed versioning
- **Conversational Elaboration:** Interactive chat-based refinement of project ideas with AI guidance, metadata extraction, progress tracking
- **Project Generation:** Automated creation of project DNA, objectives, participant profiles from elaborated seeds
- **Programme Builder:** Multi-day activity planning with session-level detail, morning/afternoon/evening focus areas, learning objectives integration
- **Budget Calculator:** Erasmus+ 2024-2027 official unit cost calculator (per diem rates, travel distance bands, organizational support) - calculates exact grant amount per project
- **Profit Dashboard:** Track grant income vs. estimated costs across all projects, showing total profit and margin percentages (>30% excellent, 15-30% good, <15% low)
- **Project Pipeline Management:**
  - Timeline/Gantt visualization
  - Communication template generation
  - Vendor quote tracking (UI ready, agents blocked by timeout)
- **Document Export:** PDF and DOCX generation for application forms and project reports
- **Multi-tenant Architecture:** Organization-based tenancy with role-based access control (built for future expansion, currently single-user)
- **Authentication:** Clerk-based user management
- **Dual-mode Content:** Working language (internal collaboration) and formal language (application documents)

### In Scope (Remaining ~9% - CRITICAL FOR FINANCIAL DECISION-MAKING)
- **Vendor Search Agents (BLOCKED - Highest Priority):**
  - **Accommodation Agent:** Search Booking.com/Hotels.com, analyze options with pros/cons, provide pricing data for informed decisions
  - **Food Agent:** Research caterers, compare pricing, provide meal options for budget optimization
  - **Travel Agent:** Find flight/bus/train options, compare costs, enable travel cost optimization
  - **Root Cause:** All agents hitting 30-second Cloud Run timeout on synchronous API calls
- **Bug Fixes:**
  - Authentication endpoint 500 errors on registration (blocks onboarding if expanding user base)
  - Database migration application in production (schema drift risk)
- **Production Readiness:**
  - Performance optimization for AI agent timeouts (convert to background jobs)
  - Comprehensive E2E test coverage
  - Monitoring and error tracking

### Out of Scope (Explicitly)
- **Non-Erasmus+ Programs:** Initial release focused exclusively on Erasmus+ Youth Exchanges (KA1). Other program types (EVS, adult education, KA2) excluded to maintain focus.
- **Automatic Application Submission:** System generates documents but does not directly submit to EU portals due to liability and compliance complexity.
- **Real-time Collaboration:** Multi-user live editing deferred to Phase 2 (currently single-user focused on Samuel's needs).
- **Mobile Native Apps:** Web-first approach; native iOS/Android apps excluded to focus on core functionality.
- **Multi-language UI:** English-only interface initially (though projects support multiple working/formal languages).
- **Booking Integration:** System provides vendor research and recommendations but does not directly book accommodation/flights (user completes bookings manually based on recommendations).

---

## Technical Context

### Technology Stack
- **Language:** TypeScript 5.9.3
- **Frontend Framework:** Next.js 16.0.10 with React 19.2.1
- **Backend Framework:** Next.js API Routes (tRPC) + Fastify 5.1.0 (separate project-pipeline service)
- **Database:** PostgreSQL via Supabase (pooler mode) + Prisma ORM 6.0.0
- **Styling:** Tailwind CSS 4 with Radix UI component library (20+ primitives)
- **State Management:** Zustand (local) + React Query v5 (server state)
- **Authentication:** Clerk
- **AI/LLM:** LangChain with Anthropic Claude (claude-sonnet-4-5-20250929) and OpenAI (fallback)
- **Background Jobs:** Inngest (event-driven job queue)
- **Infrastructure:** Docker + Google Cloud Run
- **CI/CD:** Git-based deployment
- **Testing:** Playwright (E2E), Vitest (unit tests)
- **Email:** SendGrid

### Architecture Patterns
- **Monorepo Structure:** Single repository with workspaces (landing + app + project-pipeline)
- **tRPC for Type-Safe APIs:** End-to-end TypeScript type safety between frontend and backend
- **Orchestrator Component Pattern:** Complex UIs (ConversationalElaboration) coordinate multiple pure sub-components
- **AI Agent Pattern:** Specialized LangChain agents for domain-specific searches (Travel, Food, Accommodation)
- **Multi-tenant with Row-Level Security:** Organization-based data isolation via Prisma middleware
- **Event-Driven Background Processing:** Long-running AI generation tasks handled via Inngest
- **Dual-mode Content Storage:** Separate columns for working vs. formal language in database

### Integrations
- **Anthropic Claude API:** Primary LLM for project generation and conversational elaboration
- **OpenAI API:** Fallback LLM and embeddings
- **Clerk Authentication:** User management and SSO
- **Supabase PostgreSQL:** Managed database hosting
- **SendGrid:** Transactional email delivery
- **Inngest:** Background job orchestration
- **Google Cloud Run:** Container deployment platform

---

## Constraints

### Technical Constraints
- **AI API Rate Limits:** Anthropic and OpenAI rate limits require careful queue management for batch operations
- **30-Second Cloud Run Timeout:** HTTP requests limited to 30 seconds; long-running AI operations must use background jobs (current issue with Food/Accommodation agents)
- **Database Connection Pooling:** Supabase connection limits require pooler mode and careful connection management
- **Cold Start Latency:** Cloud Run cold starts can add 2-5 seconds to initial requests

### Business Constraints
- **February 2026 Launch Deadline:** Hard deadline to support real Erasmus+ applications for spring 2026 submission round
- **Bootstrap Budget:** Minimal external funding; infrastructure costs kept under €100/month
- **Erasmus+ Compliance:** Generated documents must meet official Erasmus+ Youth Exchange application requirements

### Resource Constraints
- **Team Size:** Solo developer (Samuel) + AI assistants (SCAR for implementation, Supervisor for planning)
- **Time:** Part-time development alongside other commitments
- **Support Capacity:** Limited ability to provide hands-on support to users; platform must be self-service

---

## Current Status

### Phase
**Implementation (91% complete) → Testing & Deployment**

### Recent Progress
- **2026-01-15:** Comprehensive codebase research completed, planning artifacts backfill initiated
- **2026-01:** Conversational seed elaboration UI (#104) implemented
- **2026-01:** Backend project generation engine (#103) completed
- **2026-01:** Database schema for intelligent seed elaboration (#102) deployed
- **2025-12:** Conversational seed elaboration agent (#101) implemented
- **2025-Q4:** Core feature set completed (seed management, project generation, programme builder, pipeline)

### Next Milestones
- [ ] **Milestone 1:** Fix API timeout issues on Food/Accommodation/Travel agents (CRITICAL - blocks vendor research) - Target: 2026-01-22
- [ ] **Milestone 2:** Resolve authentication endpoint 500 errors (blocks future expansion) - Target: 2026-01-22
- [ ] **Milestone 3:** Complete E2E test coverage (>80% critical paths) - Target: 2026-01-29
- [ ] **Milestone 4:** Production deployment validation - Target: 2026-02-05
- [ ] **Milestone 5:** Plan first 3-5 real Erasmus+ projects with full workflow (seed → vendors → application) - Target: 2026-02-15

---

## Risks

### High-Priority Risks
1. **Vendor Search Agent Timeouts (CRITICAL BLOCKER)**
   - **Impact:** Food, Accommodation, and Travel agents hitting 30-second Cloud Run timeout prevent completion of vendor research workflow. Without working vendor search, cannot find cost-effective options, making informed financial decisions impossible. This blocks the core value proposition.
   - **Mitigation:** Convert synchronous API calls to Inngest background jobs with polling UI; implement caching for common destinations; add partial result handling; optimize AI agent prompts to reduce processing time

2. **February 2026 Deadline for Real Projects**
   - **Impact:** Insufficient time to plan 3-5 real Erasmus+ projects could mean missing EU application deadlines, resulting in zero income for Q1-Q2 2026
   - **Mitigation:** Prioritize ruthlessly - vendor agents are #1 priority, everything else secondary; accept manual vendor research if agents still blocked by Jan 25; have backup plan for manual application if platform not ready

3. **Project Economics Misalignment**
   - **Impact:** Inaccurate budget calculations or missing vendor options could lead to accepting projects that appear profitable but actually lose money, or rejecting viable projects
   - **Mitigation:** Budget calculator already uses official Erasmus+ 2024-2027 unit costs (validated); profit dashboard provides real-time visibility; always verify final numbers manually before committing to project

4. **Database Migration Drift**
   - **Impact:** Production database schema may be out of sync with codebase, causing runtime errors or data loss during critical project planning
   - **Mitigation:** Audit current production schema vs. Prisma migrations; create migration reconciliation plan before processing real projects

5. **AI Cost Overruns**
   - **Impact:** High-volume AI generation (vendor searches, elaborations) could exceed €50/month budget target
   - **Mitigation:** Monitor usage closely; implement caching for common searches (major European cities); optimize prompts to reduce token usage

---

## Related Documents

- **PRDs:** `.bmad/prd/` (To be created)
- **Epics:** `.bmad/epics/` (See: 001-fix-api-timeouts.md, 002-auth-stability.md)
- **ADRs:** `.bmad/adr/` (See: 001-tech-stack.md, 002-ai-architecture.md, 003-multi-tenancy.md)
- **Architecture:** `.bmad/architecture/` (To be documented)
- **Workflow Status:** `.bmad/workflow-status.yaml`

---

## Notes

### Business Model Context
OpenHorizon was created to support sustainable Erasmus+ project management for Samuel's Swedish förening. The platform addresses the **financial invisibility problem**: without clear tools, it's impossible to know whether a project will be financially viable (break-even), moderately profitable (sustainable income), or highly profitable until it's too late to adjust.

**Core Innovation:** Combine official Erasmus+ budget calculator (calculates exact grant amount) with AI-powered vendor research (finds accommodation, food, travel options) to provide **upfront financial clarity**. This enables informed decisions about:
- Which projects to pursue (community impact vs. income generation)
- What margin target to set per project (break-even, 15%, 30%+)
- How to optimize costs without sacrificing quality

**Target Use Case:** Samuel manages 3-5 projects annually, some for community impact (break-even), others for sustainable income (moderate profit). The platform makes this economically visible and manageable.

### Implementation Approach
The project has followed a pragmatic "build then document" approach, with SCAR implementing features rapidly based on immediate needs. This planning artifacts backfill (2026-01-15) represents a strategic pause to:
1. Document the real business model honestly
2. Create epics for remaining 9% (primarily vendor agent timeout fixes)
3. Establish systematic oversight before February 2026 deadline

### Deployment History
- **Domain:** oh.153.se (app.openhorizon.cc)
- **Hosting:** Google Cloud Run (frontend + backend services)
- **Database:** Supabase PostgreSQL (pooler mode for connection management)
- **Current Version:** Pre-1.0 (beta phase, ~91% feature complete)
- **Primary User:** Samuel (sole coordinator), architecture supports multi-tenant for potential future expansion

### Validation to Date
Early testing with real project planning has validated core assumptions:
- **Budget calculator accurate:** Matches official Erasmus+ unit costs within €50 (0.5% variance)
- **Profit dashboard useful:** Clear visibility into grant vs. costs enables informed margin decisions
- **Conversational elaboration saves time:** Reduces idea refinement from hours to minutes
- **CRITICAL BLOCKER:** Vendor search agents timeout before completing searches, preventing cost optimization workflow

---

**Template Version:** 1.0
**Template Source:** BMAD-inspired project brief for SCAR supervisor
**Document Status:** Complete and validated against implementation
