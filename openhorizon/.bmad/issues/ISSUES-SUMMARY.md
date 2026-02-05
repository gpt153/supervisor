# Pipeline Issues from Old Implementation Repo

**Source Repository:** gpt153/openhorizon.cc
**Total Pipeline Issues:** 36
**Extraction Date:** 2026-01-19

---

## Summary Statistics

- **Closed Issues:** 36
- **Open Issues:** 0
- **Issues with Milestones:** 0
- **Issues with PRs:** 11

---

## No Milestone

**Status:** 36 closed, 0 open (36 total)

### ✅ #3: Feature: Brainstorming Playground (Seed Factory & Garden)

**State:** CLOSED

**URL:** https://github.com/gpt153/openhorizon.cc/issues/3

---

### ✅ #5: seed generation error

**State:** CLOSED

**URL:** https://github.com/gpt153/openhorizon.cc/issues/5

---

### ✅ #8: working vs formal mode

**State:** CLOSED

**URL:** https://github.com/gpt153/openhorizon.cc/issues/8

---

### ✅ #24: from seed to project.

**State:** CLOSED

**URL:** https://github.com/gpt153/openhorizon.cc/issues/24

---

### ✅ #26: [Project Pipeline] Phase 1: Foundation (Weeks 1-3)

**State:** CLOSED `enhancement`

**URL:** https://github.com/gpt153/openhorizon.cc/issues/26

---

### ✅ #29: [Project Pipeline] Phase 4: Communication System (Weeks 9-10)

**State:** CLOSED `enhancement`

**URL:** https://github.com/gpt153/openhorizon.cc/issues/29

---

### ✅ #30: [Project Pipeline] Phase 5: Learning System (Weeks 11-12)

**State:** CLOSED `enhancement`

**URL:** https://github.com/gpt153/openhorizon.cc/issues/30

---

### ✅ #31: [Project Pipeline] Phase 6: Additional Agents (Weeks 13-14)

**State:** CLOSED `enhancement`

**URL:** https://github.com/gpt153/openhorizon.cc/issues/31

---

### ✅ #33: [Project Pipeline] Phase 8: Polish & Testing (Weeks 17-18)

**State:** CLOSED `enhancement`

**URL:** https://github.com/gpt153/openhorizon.cc/issues/33

---

### ✅ #53: Fix Pipeline Login Authentication (404 Error)

**State:** CLOSED → PR #2

**Acceptance Criteria:**
- [ ] Login endpoint responds (not 404)
- [ ] Valid credentials return JWT token
- [ ] Invalid credentials return 401
- [ ] Token can be used to access protected routes
- [ ] Test user can log in: `test@example.com` / `password123`
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/53

---

### ✅ #58: 🐛 P0: AI Chat crashes with Prisma error (findUnique with undefined id)

**State:** CLOSED `bug`

**Acceptance Criteria:**
- [ ] AI Chat responds successfully when project context selected
- [ ] AI Chat responds successfully when project + phase context selected
- [ ] No Prisma errors in backend logs
- [ ] Error handling graceful if project not found

...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/58

---

### ✅ #59: ❌ P0: Implement Seed-to-Project Conversion

**State:** CLOSED `enhancement`

**Acceptance Criteria:**
- [ ] "Convert to Project" button visible on seed detail page
- [ ] Clicking button creates new project from seed data
- [ ] Project inherits seed title, description, duration, participants
- [ ] Default phases generated (at minimum: Planning, Execution, Reporting)
- [ ] User redirected to created project detail page
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/59

---

### ✅ #60: 🟡 P1: Implement Phase Detail Pages

**State:** CLOSED `enhancement`

**Acceptance Criteria:**
- [ ] Phase cards in Gantt chart are clickable
- [ ] Clicking phase navigates to phase detail page
- [ ] Phase detail shows: name, budget, dates, status, description
- [ ] Can edit phase information
- [ ] Changes persist to database
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/60

---

### ✅ #61: 🟡 P1: Expose AI Agents in UI (Accommodation, Travel, Food)

**State:** CLOSED `enhancement` → PR #60

**Acceptance Criteria:**
- [ ] Phase detail page shows AI agent section
- [ ] Agent type matches phase type (accommodation → accommodation agent)
- [ ] Can send messages to agent
- [ ] Agent responds with contextual assistance
- [ ] Chat history persists
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/61

---

### ✅ #64: P0: Vite proxy misconfigured - pointing to port 3000 instead of 4000

**State:** CLOSED `bug`

**URL:** https://github.com/gpt153/openhorizon.cc/issues/64

---

### ✅ #65: AI Chat messages not sending - WebSocket/React state sync issue

**State:** CLOSED `bug` → PR #58, #58

**URL:** https://github.com/gpt153/openhorizon.cc/issues/65

---

### ✅ #71: Implement Application Form Generation

**State:** CLOSED `enhancement`

**Acceptance Criteria:**
- [ ] Generate Erasmus+ application forms
- [ ] Populate forms from project data
- [ ] Export as PDF/Word
- [ ] Review and edit before finalization
- [ ] Save multiple versions
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/71

---

### ✅ #74: Implement Project Report Export System

**State:** CLOSED

**URL:** https://github.com/gpt153/openhorizon.cc/issues/74

---

### ✅ #76: Step 11: Project Export System (PDF/Excel/ZIP)

**State:** CLOSED → PR #71, #71, #003399, #70, #71

**Acceptance Criteria:**
- ✅ PDF report generates with all sections (summary, budget, timeline, vendors)
- ✅ Gantt chart renders as image in PDF
- ✅ Excel spreadsheet has proper formatting and formulas
- ✅ ZIP package bundles all files correctly
- ✅ Export UI integrated into project detail page
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/76

---

### ✅ #77: Budget Auto-Calculator (Step 5 - Week 1 Priority)

**State:** CLOSED

**Acceptance Criteria:**
- ✅ Distance calculations within 1% of EU calculator
- ✅ Budget breakdown matches Erasmus+ 2024-2027 unit costs
- ✅ UI clearly shows travel, per diem, organizational breakdown
- ✅ Green travel bonus calculated correctly for eligible bands
- ✅ Saves to project and pre-fills phase budgets
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/77

---

### ✅ #78: Travel Research Agent (Step 6 - Week 3)

**State:** CLOSED

**Acceptance Criteria:**
- ✅ Scrapes flight data from at least one source
- ✅ Searches and extracts travel agency information
- ✅ AI generates relevant pros/cons for flights
- ✅ AI generates relevant pros/cons for agencies
- ✅ User can select options and request quotes
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/78

---

### ✅ #79: Food Research Agent (Step 6 - Week 3)

**State:** CLOSED

**Acceptance Criteria:**
- ✅ Searches caterers using Google Maps API
- ✅ Searches group-friendly restaurants
- ✅ AI generates relevant pros/cons for caterers
- ✅ AI generates relevant pros/cons for restaurants
- ✅ User can select options and request quotes
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/79

---

### ✅ #92: Port Backend AI Agents to project-pipeline

**State:** CLOSED

**Acceptance Criteria:**
- [ ] All 3 agents exist in `project-pipeline/backend/src/ai/agents/`
- [ ] Agents use Anthropic Claude model (not OpenAI)
- [ ] AccommodationAgent has both scraping + quote generation
- [ ] 4 API endpoints created and working
- [ ] Backend builds without errors: `cd project-pipeline/backend && npm run build`
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/92

---

### ✅ #96: Intelligent Seed Elaboration System - AI-Driven Project Planning

**State:** CLOSED `enhancement`

**URL:** https://github.com/gpt153/openhorizon.cc/issues/96

---

### ✅ #97: Backend: Conversational Seed Elaboration Agent (Issue #96 - Part 1/4)

**State:** CLOSED `enhancement` → PR #96

**URL:** https://github.com/gpt153/openhorizon.cc/issues/97

---

### ✅ #99: Backend: Project Generation Engine (Issue #96 - Part 3/4)

**State:** CLOSED `enhancement` → PR #96

**URL:** https://github.com/gpt153/openhorizon.cc/issues/99

---

### ✅ #100: Database: Schema Enhancements for Intelligent Elaboration (Issue #96 - Part 4/4)

**State:** CLOSED `enhancement` → PR #96

**URL:** https://github.com/gpt153/openhorizon.cc/issues/100

---

### ✅ #129: Test Infrastructure - Database Seeding & Fixtures

**State:** CLOSED

**Acceptance Criteria:**
- [ ] Test data seed functions created for all entities (users, orgs, projects, seeds, phases)
- [ ] Playwright global setup seeds database before tests
- [ ] Playwright global teardown cleans up test data after tests
- [ ] Reusable fixtures available for common test scenarios
- [ ] Authentication helpers work in E2E test context
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/129

---

### ✅ #137: Security Audit - Vulnerability Scanning

**State:** CLOSED

**Acceptance Criteria:**
- [ ] npm audit shows zero high/critical vulnerabilities
- [ ] All high/critical vulnerabilities fixed or documented
- [ ] Authentication verified working (signup, login, logout, password reset)
- [ ] Multi-tenant isolation verified (no data leaks between orgs)
- [ ] No secrets in Git repository (API keys, database URLs)
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/137

---

### ✅ #154: Test Infrastructure - Database Seeding & Fixtures

**State:** CLOSED → PR #003

**Acceptance Criteria:**
- Tests can create realistic data
- Authentication works in E2E context
- All test infrastructure is documented

@scar - Implement the test infrastructure as specified in epic 003.
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/154

---

### ✅ #155: Fix E2E Tests - All Existing Tests Pass

**State:** CLOSED → PR #003, #154, #154

**Acceptance Criteria:**
- All 11 existing E2E tests pass
- Auth tests pass (100% green)

@scar - Fix the E2E tests using infrastructure from #154.
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/155

---

### ✅ #172: Integration Testing - Seed Elaboration Flow

**State:** CLOSED → PR #1

**Objective:**
Write integration tests for the 7-question conversational seed elaboration flow....

**Acceptance Criteria:**
- [ ] All 7 questions process correctly
- [ ] Metadata extracted accurately from natural language
- [ ] Validation catches invalid inputs
- [ ] Completeness indicator accurate
- [ ] Session state persists between API calls
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/172

---

### ✅ #173: Integration Testing - Generator Modules

**State:** CLOSED → PR #2

**Objective:**
Write integration tests for all generator modules that create project structures....

**Acceptance Criteria:**
- [ ] All generators produce valid output for various scenarios
- [ ] Budget allocations sum to 100%
- [ ] Timeline phases are sequential with no date overlaps
- [ ] Checklists include all mandatory items
- [ ] Visa requirements detected correctly
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/173

---

### ✅ #177: End-to-End Testing - Various Project Scenarios

**State:** CLOSED

**Objective:**
Test the complete seed elaboration flow with 5 different Erasmus+ project scenarios to ensure all generators work correctly across various project types....

**Acceptance Criteria:**
- [ ] All 5 scenarios complete elaboration flow without errors
- [ ] Generated projects have valid timelines (sequential phases, no overlaps)
- [ ] Budget allocations sum to 100% for all scenarios
- [ ] Visa requirements correctly identified for non-EU destinations
- [ ] Checklists include all mandatory items
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/177

---

### ✅ #178: User Documentation - Seed Elaboration Walkthrough

**State:** CLOSED

**Objective:**
Create comprehensive user documentation for the seed elaboration feature, enabling non-technical users to successfully convert seed ideas into complete Erasmus+ projects....

**Acceptance Criteria:**
- [ ] Non-technical user can complete elaboration without help
- [ ] All 7 questions explained with examples
- [ ] Screenshots show actual UI (not mockups)
- [ ] Budget/timeline logic clearly explained
- [ ] Document located in `project-pipeline/docs/`
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/178

---

### ✅ #179: API Documentation - Seed Elaboration Endpoints

**State:** CLOSED

**Objective:**
Create comprehensive API documentation for seed elaboration endpoints using OpenAPI 3.0 specification....

**Acceptance Criteria:**
- [ ] OpenAPI spec validates with Swagger tools
- [ ] All endpoints documented with examples
- [ ] Error responses documented
- [ ] Developers can integrate without guessing
- [ ] Located in `project-pipeline/docs/api/`
...

**URL:** https://github.com/gpt153/openhorizon.cc/issues/179

---

## Appendix: Issue List by Number

| # | Title | State | Milestone | Labels |
|---|-------|-------|-----------|--------|
| ✅ #3 | Feature: Brainstorming Playground (Seed Factory & Garden) | CLOSED | - | - |
| ✅ #5 | seed generation error | CLOSED | - | - |
| ✅ #8 | working vs formal mode | CLOSED | - | - |
| ✅ #24 | from seed to project. | CLOSED | - | - |
| ✅ #26 | [Project Pipeline] Phase 1: Foundation (Weeks 1-3) | CLOSED | - | enhancement |
| ✅ #29 | [Project Pipeline] Phase 4: Communication System (Weeks 9-10) | CLOSED | - | enhancement |
| ✅ #30 | [Project Pipeline] Phase 5: Learning System (Weeks 11-12) | CLOSED | - | enhancement |
| ✅ #31 | [Project Pipeline] Phase 6: Additional Agents (Weeks 13-14) | CLOSED | - | enhancement |
| ✅ #33 | [Project Pipeline] Phase 8: Polish & Testing (Weeks 17-18) | CLOSED | - | enhancement |
| ✅ #53 | Fix Pipeline Login Authentication (404 Error) | CLOSED | - | - |
| ✅ #58 | 🐛 P0: AI Chat crashes with Prisma error (findUnique with undefined id) | CLOSED | - | bug |
| ✅ #59 | ❌ P0: Implement Seed-to-Project Conversion | CLOSED | - | enhancement |
| ✅ #60 | 🟡 P1: Implement Phase Detail Pages | CLOSED | - | enhancement |
| ✅ #61 | 🟡 P1: Expose AI Agents in UI (Accommodation, Travel, Food) | CLOSED | - | enhancement |
| ✅ #64 | P0: Vite proxy misconfigured - pointing to port 3000 instead of 4000 | CLOSED | - | bug |
| ✅ #65 | AI Chat messages not sending - WebSocket/React state sync issue | CLOSED | - | bug |
| ✅ #71 | Implement Application Form Generation | CLOSED | - | enhancement |
| ✅ #74 | Implement Project Report Export System | CLOSED | - | - |
| ✅ #76 | Step 11: Project Export System (PDF/Excel/ZIP) | CLOSED | - | - |
| ✅ #77 | Budget Auto-Calculator (Step 5 - Week 1 Priority) | CLOSED | - | - |
| ✅ #78 | Travel Research Agent (Step 6 - Week 3) | CLOSED | - | - |
| ✅ #79 | Food Research Agent (Step 6 - Week 3) | CLOSED | - | - |
| ✅ #92 | Port Backend AI Agents to project-pipeline | CLOSED | - | - |
| ✅ #96 | Intelligent Seed Elaboration System - AI-Driven Project Planning | CLOSED | - | enhancement |
| ✅ #97 | Backend: Conversational Seed Elaboration Agent (Issue #96 - Part 1/4) | CLOSED | - | enhancement |
| ✅ #99 | Backend: Project Generation Engine (Issue #96 - Part 3/4) | CLOSED | - | enhancement |
| ✅ #100 | Database: Schema Enhancements for Intelligent Elaboration (Issue #96 - Part 4/4) | CLOSED | - | enhancement |
| ✅ #129 | Test Infrastructure - Database Seeding & Fixtures | CLOSED | - | - |
| ✅ #137 | Security Audit - Vulnerability Scanning | CLOSED | - | - |
| ✅ #154 | Test Infrastructure - Database Seeding & Fixtures | CLOSED | - | - |
| ✅ #155 | Fix E2E Tests - All Existing Tests Pass | CLOSED | - | - |
| ✅ #172 | Integration Testing - Seed Elaboration Flow | CLOSED | - | - |
| ✅ #173 | Integration Testing - Generator Modules | CLOSED | - | - |
| ✅ #177 | End-to-End Testing - Various Project Scenarios | CLOSED | - | - |
| ✅ #178 | User Documentation - Seed Elaboration Walkthrough | CLOSED | - | - |
| ✅ #179 | API Documentation - Seed Elaboration Endpoints | CLOSED | - | - |
