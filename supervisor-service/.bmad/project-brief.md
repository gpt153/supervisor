# Project Brief: Supervisor Service

**Created:** 2026-01-17 (Stockholm time)
**Last Updated:** 2026-01-17
**Status:** Active
**Repository (Implementation):** https://github.com/gpt153/supervisor-service
**Repository (Planning):** https://github.com/gpt153/supervisor-service-planning
**Workspace:** `/home/samuel/.archon/workspaces/supervisor-service/`

---

## Vision

A persistent, multi-platform Claude Code supervisor service that provides continuous project oversight and orchestration. Users can interact via Claude.ai, Telegram, web interface, or any platform, while the supervisor maintains persistent state, orchestrates SCAR and other agents, and ensures consistent project management across all touchpoints.

---

## Goals

### Primary Goals
1. **Persistent Supervision:** Maintain continuous project state and context across all user sessions and platforms
2. **Multi-Platform Access:** Enable supervision via Claude.ai, Telegram, web dashboard, and future platforms
3. **Agent Orchestration:** Coordinate SCAR and other specialized agents for complex workflows

### Success Criteria
- [ ] Service runs persistently with <99% uptime
- [ ] Users can access via 3+ platforms (Claude.ai, Telegram, Web)
- [ ] Session state persists across platform switches
- [ ] SCAR orchestration works seamlessly via service

---

## Stakeholders

### Primary Stakeholders
- **Solo Developer:** Needs persistent supervision without manual session management
- **Multi-Device Users:** Need consistent state across desktop, mobile, web

### Decision Makers
- **Owner:** Samuel (gpt153)
- **Technical Lead:** SCAR (implementation)

---

## Scope

### In Scope
- Persistent supervisor service (Node.js backend)
- Multi-platform client integrations (Claude.ai, Telegram, Web)
- Session management and state persistence (PostgreSQL)
- SCAR orchestration via service
- RESTful API for external integrations
- Basic web dashboard for monitoring

### Out of Scope (Explicitly)
- Mobile native apps: Use web interface or Telegram initially
- Voice interface: Future consideration after stable release
- Multi-user/team features: Focus on single-developer use case first

---

## Technical Context

### Technology Stack
- **Language:** TypeScript
- **Runtime:** Node.js 20+
- **Framework:** Express (RESTful API)
- **Database:** PostgreSQL 18
- **Agent SDK:** Claude Agent SDK (proven by SCAR research)
- **Frontend:** React + Next.js (web dashboard)
- **Infrastructure:** GCP Cloud Run (containerized deployment)
- **CI/CD:** GitHub Actions

### Architecture Patterns
- Repository pattern for database access
- RESTful API design
- Event-driven architecture for agent communication
- Session-based state management
- Claude Agent SDK for persistent agent instances

### Integrations
- Claude Agent SDK: Core supervisor agent implementation
- Telegram Bot API: Mobile/chat interface
- GitHub API: Repository and issue management
- SCAR: Code implementation orchestration

---

## Constraints

### Technical Constraints
- Must use Claude Agent SDK (proven solution)
- Must maintain session state across platform switches
- Single developer maintenance

### Business Constraints
- Launch MVP by Q2 2026
- Minimal infrastructure costs (use free tiers where possible)

### Resource Constraints
- **Team Size:** Solo developer + SCAR
- **Time:** Part-time development

---

## Current Status

### Phase
Implementation (Epic 001 in progress)

### Recent Progress
- [2026-01-17] Epic 001 created with 20 GitHub issues
- [2026-01-17] 4-phase implementation plan defined
- [2026-01-17] Claude Agent SDK selected as proven technology

### Next Milestones
- [ ] Phase 1: Core service infrastructure - Target: Week 1-2
- [ ] Phase 2: Session management - Target: Week 3-4
- [ ] Phase 3: Platform integrations - Target: Week 5-7
- [ ] Phase 4: Production deployment - Target: Week 8

---

## Risks

### High-Priority Risks
1. **Claude Agent SDK Learning Curve:** First time using this SDK
   - **Impact:** Potential delays in core implementation
   - **Mitigation:** Start with Phase 1 to learn SDK early, use SDK documentation

2. **State Persistence Complexity:** Managing sessions across platforms
   - **Impact:** Bugs in session synchronization could break user experience
   - **Mitigation:** Thorough testing in Phase 2, clear session lifecycle design

---

## Related Documents

- **PRDs:** `.bmad/prd/`
- **Epics:** `.bmad/epics/`
- **ADRs:** `.bmad/adr/`
- **Architecture:** `.bmad/architecture/`
- **Workflow Status:** `.bmad/workflow-status.yaml`

---

## Notes

[Any additional context, history, or information]

---

**Template Version:** 1.0
**Template Source:** BMAD-inspired project brief for SCAR supervisor
