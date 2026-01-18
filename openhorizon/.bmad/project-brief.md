# Project Brief: OpenHorizon Project Pipeline

**Created:** 2025-10-01
**Last Updated:** 2026-01-18
**Status:** Active - Seed Elaboration Feature Development
**Repository:** https://github.com/gpt153/openhorizon.cc
**Implementation Workspace:** `/home/samuel/.archon/workspaces/openhorizon.cc/project-pipeline/`
**Planning Workspace:** `/home/samuel/supervisor/openhorizon/`

**⚠️ IMPORTANT:** This project brief describes the **project-pipeline** system ONLY.
The old `/app` Next.js platform is ARCHIVED and no longer active.

---

## Vision

OpenHorizon Project Pipeline is an AI-powered **Erasmus+ project management system** that transforms the project planning process from a manual, blank-canvas experience into an intelligent, guided workflow with automated project skeleton generation.

**Core Value Proposition:**
Instead of creating empty projects that users must manually populate, the system uses conversational AI to gather requirements during seed elaboration and automatically generates complete project structures with pre-populated phases, timelines, budgets, and checklists.

---

## Architecture

**Tech Stack:**
- **Backend:** Fastify (Node.js) - Port 3001
- **Frontend:** Vite + React SPA - Port 5173
- **Database:** PostgreSQL (shared with archived Next.js app)
- **AI:** OpenAI GPT-4 via LangChain
- **Deployment:** Google Cloud Run

**System Components:**
1. **Backend API** (`/project-pipeline/backend/`)
   - RESTful API with Fastify
   - WebSocket support for real-time updates
   - Authentication middleware
   - 6 AI agent integrations

2. **Frontend SPA** (`/project-pipeline/frontend/`)
   - React + TypeScript + Vite
   - TailwindCSS for styling
   - Real-time AI chat interface
   - Project management dashboard

3. **6 AI Agents:**
   - **Seed Agent:** Intelligent brainstorming and idea generation
   - **Programme Builder:** Multi-day activity planning
   - **Phase Generator:** Automated phase creation (Travel, Food, Accommodation, Activities)
   - **Document Generator:** Export application forms and reports
   - **Food Agent:** Research caterers and meal options
   - **Accommodation Agent:** Search hotels and venues

---

## Current Status

**Pipeline Completion:** ~95%

### Completed Features
✅ Seed management (create, browse, organize)
✅ Basic seed elaboration (conversational AI refinement)
✅ Manual project creation from seeds
✅ 6 AI agents (Seed, Programme, Phase, Document, Food, Accommodation)
✅ Backend API with authentication
✅ Frontend React SPA
✅ WebSocket real-time communication
✅ Database integration

### Current Task (Remaining 5%)

**Feature:** Intelligent Seed Elaboration with Auto-Generated Project Skeletons

**Problem:**
Currently, when users convert a seed to a project, they get an **empty project structure** with no phases, timeline, or budget. Users must manually create everything from scratch—high friction, low value.

**Solution:**
Transform seed elaboration into an intelligent requirements-gathering conversation that automatically generates complete project structures:

1. **Conversational AI Requirements Gathering:**
   - AI asks targeted questions (participants, budget, duration, destination, activities)
   - AI makes intelligent suggestions when user doesn't know
   - AI validates against Erasmus+ guidelines
   - AI calculates dependencies (e.g., "You need travel insurance for 30 people")

2. **Automatic Project Skeleton Generation:**
   - Pre-populated phases (Travel, Accommodation, Food, Activities, Insurance, Permits)
   - Calculated timeline (Pre-travel, Exchange, Post-reporting phases)
   - Budget allocated across phases (30% travel, 25% accommodation, etc.)
   - Pre-filled checklists (visas, permits, required documents)
   - Ready-to-refine structure (not starting from blank slate)

**PRD:** `/project-pipeline/PRD-INTELLIGENT-SEED-ELABORATION.md`

**User Flow:**
```
User: "I want to do a youth exchange about digital skills in Barcelona"
  ↓
AI asks questions: participants, budget, duration, countries
  ↓
User answers (or AI suggests defaults)
  ↓
User clicks "Convert to Project" (one button)
  ↓
System generates COMPLETE project:
  ✓ 7 phases created (Travel, Accommodation, Food, Activities, etc.)
  ✓ Timeline calculated (5 days exchange = 7 days total with travel)
  ✓ Budget allocated intelligently
  ✓ Checklists populated (visa requirements for Barcelona from user's countries)
  ↓
User refines details (not building from scratch)
```

---

## Goals

### Primary Goals
1. **Reduce Project Setup Time:** From 2-3 hours manual setup → 10 minutes guided conversation
2. **Intelligent Automation:** Auto-generate 80% of project structure, users refine 20%
3. **Expert Guidance:** AI acts as Erasmus+ consultant during planning
4. **Validation:** Ensure compliance with Erasmus+ guidelines throughout

### Success Criteria
- [ ] Conversational seed elaboration with <10 questions average
- [ ] Auto-generated projects have all required phases
- [ ] Timeline calculation accurate for exchange duration
- [ ] Budget allocation realistic and balanced
- [ ] Checklists include all regulatory requirements (visas, permits)
- [ ] 90% of users complete project setup without abandoning

---

## Stakeholders

### Primary User
- **Samuel (Project Coordinator):** Swedish förening managing 3-5 Erasmus+ projects
  - Needs fast project setup (not manual phase creation)
  - Needs accurate timelines and budget allocation
  - Needs regulatory compliance (visa requirements, permits)

### Technical Team
- **Owner:** Samuel (gpt153)
- **Implementation:** SCAR (AI implementation agent)
- **Planning:** Claude Supervisor

---

## Scope

### In Scope (Current Task)
✅ Conversational requirements gathering during seed elaboration
✅ Intelligent question flow with AI suggestions
✅ Automatic project skeleton generation
✅ Pre-populated phases (Travel, Accommodation, Food, Activities, Insurance, Permits)
✅ Timeline calculation from duration and dates
✅ Budget allocation across phases
✅ Checklist pre-filling (visas, permits, documents)

### Out of Scope
❌ Booking integration (system suggests, user books manually)
❌ Automatic application submission to EU portals
❌ Multi-user collaboration (single-user focus)
❌ Non-Erasmus+ programs (Youth Exchanges only for now)
❌ Mobile native apps (web-first)

---

## Technical Context

### Repository Structure
```
/home/samuel/.archon/workspaces/openhorizon.cc/
├── project-pipeline/           # ✅ ACTIVE - Work ONLY on this
│   ├── backend/               # Fastify API
│   ├── frontend/              # Vite React SPA
│   └── PRD-INTELLIGENT-SEED-ELABORATION.md
├── .archive/                  # ❌ NEVER TOUCH
│   ├── old-app-NEVER-USE/     # Archived Next.js platform
│   └── landing/               # Archived marketing site
└── scripts/                   # Root-level utilities
```

### Deployment
- **Backend:** Google Cloud Run (port 3001)
- **Frontend:** Google Cloud Run (port 5173)
- **Database:** Supabase PostgreSQL (shared, managed externally)

---

## Recent History

**2026-01-18 - Critical Incident:**
Previous supervisor mistakenly worked on Epic 003 (Production Readiness & Testing) for the **archived `/app` directory** instead of the active project-pipeline. This resulted in:
- 2 days of wasted work (11 issues completed on wrong codebase)
- Significant API costs
- Zero progress on actual task (seed elaboration)

**Corrective Actions:**
- Archived `/app` to `.archive/old-app-NEVER-USE/`
- Archived `/landing` to `.archive/landing/`
- Created `WARNING-DO-NOT-USE.md` in archive
- Updated all documentation to reference ONLY project-pipeline
- This project brief completely rewritten to remove old app references

**Prevention:**
- All supervisors must verify working directory is `/project-pipeline/` before starting work
- Any mention of `/app` or `/landing` should trigger immediate stop and redirect
- workflow-status.yaml now explicitly states "ONLY project-pipeline is active"

---

## Next Steps

1. ✅ Archive old app (COMPLETED 2026-01-18)
2. ✅ Update all documentation (COMPLETED 2026-01-18)
3. ⏳ Create GitHub issue for seed elaboration feature
4. ⏳ Implement conversational requirements gathering
5. ⏳ Implement automatic project skeleton generation
6. ⏳ Test end-to-end user flow
7. ⏳ Deploy to production

---

**Last Updated:** 2026-01-18 05:00 CET
**Status:** Ready to begin seed elaboration feature development
