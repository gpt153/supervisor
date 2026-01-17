# Project Brief: quiculum-monitor

**Created:** 2026-01-08
**Last Updated:** 2026-01-17
**Status:** Active (Implementation Complete, Testing Phase)
**Repository (Planning):** https://github.com/gpt153/quiculum-monitor-planning
**Repository (Implementation):** https://github.com/gpt153/quiculum-monitor
**Workspace:** `/home/samuel/.archon/workspaces/quiculum-monitor/`

---

## Vision

Quiculum Monitor is an automated web scraping system that eliminates the daily burden of manually checking the Quiculum school portal. It logs in via Google SSO, extracts news/messages/student notes, detects changes, and stores all data locally in JSON format. Parents gain peace of mind knowing they'll never miss important school communications, while maintaining a searchable historical archive of all information.

---

## Goals

### Primary Goals
1. **Automated Monitoring:** Eliminate manual daily portal checks (save 30-60 hours/year per parent)
2. **Zero Missed Communications:** Detect all new messages/news within 8 hours of posting (95%+ accuracy)
3. **Historical Archive:** Maintain complete searchable record of all school communications

### Success Criteria
- [x] User can set up and run with <10 minutes of configuration
- [x] System runs automatically 1-2 times per day without intervention
- [x] All new content detected since last check (change detection working)
- [x] Data stored in human-readable format (JSON with timestamps)
- [ ] 30 days of successful automated runs (95%+ success rate) - Pending real credentials
- [x] Docker deployment works on macOS, Linux, and cloud platforms

---

## Stakeholders

### Primary Stakeholders
- **Parents with Children in Quiculum Schools:** Need automated monitoring to avoid missed communications; want set-and-forget solution
- **Tech-Savvy Parents:** Want self-hosted solution with full control; willing to use Docker/cron/command line

### Decision Makers
- **Owner:** Samuel (product owner, developer, user)
- **Technical Lead:** Samuel (solo developer)

---

## Scope

### In Scope
- Google SSO authentication with session cookie persistence
- Data extraction: News, messages, elevanteckningar
- Change detection (compare with previous run)
- JSON file storage with timestamped snapshots
- Headless browser operation
- Docker containerization (standard + cron-enabled)
- Multiple scheduling options (Docker cron, host cron, launchd)
- Comprehensive documentation (README, QUICKSTART, DOCKER)

### Out of Scope (Explicitly)
- **Real-time monitoring:** 1-2 checks per day is sufficient (not continuous polling)
- **Multi-family support:** Single-family use only (not multi-tenant)
- **Two-factor authentication:** Google accounts without 2FA only (for now)
- **Quiculum API integration:** No public API exists; web scraping is only option
- **Desktop notifications:** (Future enhancement - not v1)
- **RAG integration:** (Future enhancement - not v1)
- **Web dashboard:** (Future enhancement - not v1)

---

## Technical Context

### Technology Stack
- **Language:** Python 3.12
- **Browser Automation:** Selenium 4.16+ with headless Chrome
- **Storage:** JSON files (local filesystem)
- **Containerization:** Docker + docker-compose
- **Scheduling:** cron, launchd, or Docker cron (user's choice)
- **Infrastructure:** Local machine, server, or cloud (AWS ECS, GCP Cloud Run, Fly.io)

### Architecture Patterns
- **Object-Oriented:** Single `QuiculumMonitor` class encapsulates all functionality
- **Stateless Execution:** Each run is independent (no long-running process)
- **Session Persistence:** Cookie-based session reuse (minimize logins)
- **Timestamped Snapshots:** Immutable historical records with "latest" view

### Integrations
- **Google OAuth:** Google's standard SSO login flow (interactive browser automation)
- **Quiculum Web Portal:** Screen scraping via CSS selectors (no API)
- **Local Filesystem:** Data storage in ./data/ directory (JSON files)
- **Docker:** Containerized execution environment (Chrome + Python)

---

## Constraints

### Technical Constraints
- **No Public API:** Must use web scraping (Quiculum provides no API)
- **Session Expiry:** Cookies expire after ~60 minutes of inactivity (must re-login)
- **HTML Brittleness:** CSS selectors may break when Quiculum updates HTML
- **Browser Dependency:** Requires Chrome + ChromeDriver (handled by Docker)

### Business Constraints
- **Zero Budget:** Free tier only (no commercial services, no managed databases)
- **Personal Use:** Single-family monitoring (not commercial product)
- **Privacy:** Credentials must stay local (no third-party services)

### Resource Constraints
- **Team Size:** Solo developer + AI assistants (SCAR, Claude)
- **Time:** Part-time development (nights/weekends)
- **Maintenance:** Must be maintainable by one person (no DevOps team)

---

## Current Status

### Phase
**Testing** (Implementation 90% complete, pending real credentials for validation)

### Recent Progress
- [2026-01-08] Initial research and planning completed
- [2026-01-15] Core scraping system implemented (371 lines Python)
- [2026-01-15] Docker containerization complete (standard + cron-enabled)
- [2026-01-15] Documentation complete (README, QUICKSTART, DOCKER)
- [2026-01-17] BMAD planning artifacts created retroactively (epic, ADRs, PRD)

### Next Milestones
- [ ] Real-world testing: 30 days of automated runs with production credentials - Target: TBD
- [ ] Notification system: Desktop/email alerts when new items detected - Target: Q2 2026
- [ ] RAG integration: Semantic search of historical data - Target: Q3 2026
- [ ] Web dashboard: Browse scraped data in browser - Target: Q4 2026

---

## Risks

### High-Priority Risks
1. **Quiculum HTML Structure Changes**
   - **Impact:** CSS selectors break, scraping fails completely
   - **Mitigation:** Use multiple fallback selectors; document selector update process in README; test with headless:false to inspect elements
   - **Probability:** High (SaaS platforms update frequently)

2. **Rate Limiting or Bot Detection**
   - **Impact:** Account blocked temporarily or permanently
   - **Mitigation:** Use session cookies to minimize logins; limit to 2 checks/day; anti-detection browser flags
   - **Probability:** Medium (automated access may trigger alerts)

3. **Google SSO Flow Changes**
   - **Impact:** Authentication breaks, cannot log in
   - **Mitigation:** Monitor for auth errors; use stable selectors (IDs like "identifierId"); implement username/password fallback if needed
   - **Probability:** Low (Google OAuth is stable)

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
