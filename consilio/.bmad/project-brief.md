# Project Brief: Consilio

**Created:** 2026-01-07
**Last Updated:** 2026-01-15
**Status:** Active Development (70% Complete)
**Repository:** https://github.com/gpt153/consilio
**Implementation Workspace:** `/home/samuel/.archon/workspaces/consilio/`
**Planning Workspace:** `/home/samuel/supervisor/consilio/`

---

## Vision

Consilio is a modern case management platform designed for private Swedish consulting firms that provide consultant-supported foster care (konsulentföretag som bedriver konsulentstödd familjehemsvård). The platform empowers consultants to spend more time supporting foster families and placed children, and less time on administration, by providing an operationally trustworthy platform where communication never gets lost, documentation is a byproduct of work, and privacy is built-in from the foundation.

---

## Goals

### Primary Goals
1. **Reduce Administrative Burden:** Decrease documentation time by 60-70% through AI-assisted workflows and centralized communication
2. **Launch Beta-Ready MVP:** Deliver core case management, document handling, and email integration by Q1 2026
3. **GDPR Compliance:** Ensure privacy-by-design with PostgreSQL Row-Level Security and comprehensive audit logging

### Success Criteria
- [x] Backend foundation with authentication, case management, and email integration (100%)
- [x] Responsive web UI with core workflows (75%)
- [ ] Beta testing with 5-10 consultants from Swedish consulting firms (0%)
- [ ] GDPR compliance features (data export, deletion, retention) (20%)
- [ ] Production deployment documentation and infrastructure (30%)
- [ ] 60% time savings demonstrated in beta testing

---

## Stakeholders

### Primary Customers
- **Consulting Firms (Konsultentföretag):** Private companies providing consultant-supported foster care services. They subscribe to Consilio and are the paying customers.

### Primary Users
- **Consultants (Konsulenter):** Employees at consulting firms managing 15-30 cases simultaneously. They are the primary daily users of the platform.
- **Foster Homes (Familjehem):** Families contracted by consulting firms who need 24/7 support and clear communication channels with their assigned consultant.

### External Stakeholders
- **Municipal Social Workers (Socialsekreterare):** Government employees who order placements from consulting firms. They require timely reports and case visibility but are clients of the consulting firms, not primary system users.
- **Placed Children/Youth (Future):** Age-appropriate access for those in foster care placements.

### Decision Makers
- **Owner:** Samuel (Solo Developer)
- **Technical Lead:** Samuel + SCAR (AI Implementation Agent)
- **Supervisor:** Claude Code (Planning & Orchestration)

---

## Scope

### In Scope (MVP)
- User authentication (JWT + Google OAuth + email verification)
- Case management (CRUD, client info, social worker associations)
- Document management (uploads, Google Drive integration, AI text extraction)
- Email integration (SMTP, Gmail OAuth, IMAP ingestion)
- Calendar integration (Google Calendar bidirectional sync)
- Task management
- Workflow engine (basic automation)
- Audit logging
- Multi-tenant RLS (Row-Level Security)
- **AI Document Generation (MVP CORE):**
  - Månadsrapporter (monthly reports)
  - Handledarrapporter (supervisor reports)
  - Journalanteckningar (journal entries/case notes)
  - Email reply suggestions
  - Calendar event extraction from emails
  - Meeting notes generation

### Out of Scope (Post-MVP)
- Advanced AI features (anonymization engine, smart matching, 24/7 chatbot) - Phase 8
- Real-time communication (WebSocket chat, video, push notifications) - Phase 9
- Mobile native apps (React Native) - Phase 10
- Advanced integrations (BankID, SSIL, journal systems) - Phase 11

---

## Technical Context

### Technology Stack
- **Backend:** Node.js 20 LTS + TypeScript 5.5 + Fastify 4.26
- **Database:** PostgreSQL 16 Alpine + Prisma ORM 5.9
- **Frontend:** React 18 + Vite 7 + TypeScript 5.9
- **UI Components:** Tailwind CSS 3.4 + shadcn/ui (Radix)
- **State Management:** Zustand 4.4 + TanStack Query 5.17
- **AI:** @anthropic-ai/sdk 0.71 (Claude API)
- **Infrastructure:** Docker Compose (dev + prod profiles)
- **CI/CD:** GitHub Actions (configured, not yet active)

### Architecture Patterns
- Multi-tenant Row-Level Security (PostgreSQL RLS)
- Module-based architecture (feature modules with service/controller/routes)
- JWT with refresh token rotation (15min access, 7-day refresh)
- Repository pattern (Prisma as data layer)
- Service layer pattern (business logic separated from HTTP)
- Environment validation (Zod schemas, fail-fast on startup)

### Integrations
- Google OAuth 2.0 (authentication)
- Google Calendar API (bidirectional sync)
- Google Drive API (document storage and ingestion)
- SMTP/IMAP (email integration via Nodemailer)
- Anthropic Claude API (document text extraction)

---

## Constraints

### Technical Constraints
- **Single Developer:** Solo developer with AI assistants (SCAR + Supervisor)
- **Type Safety Required:** TypeScript strict mode, no `any` types
- **Security First:** Database-level isolation (RLS), JWT best practices, comprehensive audit logging
- **Swedish Market:** GDPR compliance mandatory, Swedish language support required

### Business Constraints
- **MVP Launch:** Q1 2026 (beta-ready)
- **Bootstrap:** No external funding, self-funded development
- **Beta Testing:** 5-10 consultants before wider launch

### Resource Constraints
- **Team Size:** Solo developer + AI assistants
- **Time:** Part-time development (evenings/weekends)
- **Budget:** Minimal infrastructure costs (free tiers where possible)

---

## Current Status

### Phase
**Implementation** (70% Complete)

### Recent Progress
- **2026-01-15:** Fixed planning workspace structure, activated BMAD methodology
- **2026-01-15:** Test failures identified (claude-client.test.ts), SCAR assigned to fix (Issue #135)
- **2026-01-14:** AI document processing UX improvements (Issue #133 - CLOSED)
- **2026-01-13:** File upload system completed (Issue #127 - CLOSED)
- **2026-01-12:** Social worker associations added (Issue #126 - CLOSED)
- **2026-01-11:** Google OAuth login implemented (Issue #120 - CLOSED)

### Next Milestones
- [ ] **Fix Test Suite:** Resolve TypeScript errors in test files - Target: 2026-01-16
- [ ] **GDPR Compliance:** User data export/deletion endpoints - Target: 2026-01-20
- [ ] **Production Deployment:** Documentation and infrastructure setup - Target: 2026-01-25
- [ ] **Beta Recruitment:** Identify and onboard 5-10 consultants from Swedish consulting firms - Target: 2026-02-01
- [ ] **Beta Testing:** 2-week testing period with feedback - Target: 2026-02-15

---

## Risks

### High-Priority Risks
1. **GDPR Non-Compliance**
   - **Impact:** Cannot launch in EU/Sweden without proper data export, deletion, and retention policies
   - **Mitigation:** Prioritize GDPR endpoints (Issue to be created), legal review before launch

2. **Test Coverage Unknown**
   - **Impact:** Cannot ship with failing tests; unknown code coverage creates deployment risk
   - **Mitigation:** Fix test failures (Issue #135 in progress), run full coverage analysis

3. **Production Deployment Undocumented**
   - **Impact:** Cannot reliably deploy to production; risk of downtime or data loss
   - **Mitigation:** Create comprehensive deployment guide, test on staging environment

4. **Beta Tester Acquisition**
   - **Impact:** Without real users, cannot validate product-market fit or identify critical bugs
   - **Mitigation:** Leverage personal network, reach out to Swedish consulting firms (konsultentföretag), industry forums for consultant-supported foster care

5. **Solo Developer Dependency**
   - **Impact:** Single point of failure; illness or unavailability halts development
   - **Mitigation:** Comprehensive documentation, BMAD planning artifacts, clear handoff procedures

---

## Related Documents

- **PRDs:** `.bmad/prd/consilio-prd-v1.0.md` (comprehensive product requirements)
- **Epics:** `.bmad/epics/` (feature epics for SCAR implementation)
- **ADRs:** `.bmad/adr/` (architectural decision records)
- **Architecture:** `.bmad/architecture/` (system design documents)
- **Workflow Status:** `.bmad/workflow-status.yaml` (progress tracking)
- **Implementation Plans:** `/home/samuel/.archon/workspaces/consilio/*_PLAN.md`

---

## Notes

**Development Model:**
- **Supervisor (Claude Code):** Planning, orchestration, validation, GitHub issue management
- **SCAR (AI Agent):** Implementation, code writing, test fixes
- **BMAD Methodology:** Scale-adaptive intelligence, epic-based instructions, ADR documentation

**Key Architectural Decisions:**
- PostgreSQL RLS for multi-tenant isolation (database-level security)
- JWT with refresh token rotation (security best practice)
- Module-based architecture (scalability and testability)
- Zod environment validation (fail-fast on misconfiguration)
- Service layer pattern (business logic reusability)

**Planning Workspace Recently Activated (2026-01-15):**
Previously, all planning occurred in the implementation workspace. BMAD structure now properly activated with planning artifacts in `/home/samuel/supervisor/consilio/.bmad/`.

---

**Template Version:** 1.1 (Filled from Consilio PRD v1.0)
**Template Source:** BMAD-inspired project brief for SCAR supervisor
