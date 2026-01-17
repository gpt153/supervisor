# Project Brief: Health Agent (Odin-Health)

**Created:** 2026-01-15 (Stockholm time)
**Last Updated:** 2026-01-15
**Status:** Active - Production Deployed
**Planning Repository:** https://github.com/gpt153/health-agent-planning
**Implementation Repository:** https://github.com/gpt153/health-agent
**Implementation Workspace:** `/home/samuel/.archon/workspaces/health-agent/`

---

## Vision

Health Agent (Odin-Health) is an adaptive AI fitness and nutrition coach delivered via Telegram. It combines PydanticAI's intelligent conversation capabilities with computer vision, multi-agent nutrition verification, and comprehensive gamification to provide personalized health guidance. The bot learns user patterns, tracks multiple health domains (nutrition, sleep, exercise, stress, medication), and provides data-driven insights to help users achieve their wellness goals.

---

## Goals

### Primary Goals
1. **Accurate Nutrition Tracking:** Achieve 90%+ accuracy in food photo analysis through multi-agent verification (Vision AI + USDA database + validation rules)
2. **User Engagement:** Maintain 80%+ daily active usage through gamification (XP, streaks, achievements, challenges)
3. **Comprehensive Health Tracking:** Support 5+ health domains with adaptive tracking categories based on user goals
4. **Production Reliability:** Maintain 99%+ uptime for Telegram bot with <2s response latency

### Success Criteria
- [x] Criterion 1: Multi-agent nutrition system reduces estimate variance to <30%
- [x] Criterion 2: Gamification system with 4 tiers (Bronze/Silver/Gold/Platinum) and 14 pre-built challenges
- [x] Criterion 3: PostgreSQL database with 26 tables supporting all tracking domains
- [ ] Criterion 4: Production database synchronized with all 16 migrations
- [ ] Criterion 5: Phase 5 social features implemented

---

## Stakeholders

### Primary Stakeholders
- **Individual Users:** Health-conscious individuals seeking personalized fitness and nutrition coaching via convenient Telegram interface
- **Power Users:** Users who want detailed tracking, analytics, and gamified progression across multiple health domains

### Decision Makers
- **Owner:** Samuel (gpt153)
- **Technical Lead:** SCAR (AI implementation agent)
- **Supervisor:** Claude (planning and orchestration)

---

## Scope

### In Scope
- Telegram bot with conversational AI (PydanticAI)
- Multi-agent nutrition verification system (Vision AI, USDA, validation)
- PostgreSQL database with 26 tables
- Memory system (markdown files + Mem0 semantic search)
- Gamification (XP, streaks, achievements, challenges)
- Sleep tracking with quality quizzes
- Scheduled reminders with timezone awareness
- REST API for external integrations
- Onboarding and user preferences
- Internationalization (English, Swedish)

### Out of Scope (Explicitly)
- Phase 5 social/community features: Postponed to future iteration
- Mobile native apps: Telegram is primary interface
- Web dashboard: REST API exists but UI not planned
- Real-time video coaching: Text/photo-based only
- Payment/subscription system: Free tier focus

---

## Technical Context

### Technology Stack
- **Language:** Python 3.13
- **AI Framework:** PydanticAI 0.0.14+ (Anthropic Claude 3.5 Sonnet)
- **Database:** PostgreSQL with psycopg 3.1.0+ (connection pooling)
- **Bot Framework:** python-telegram-bot 22.5+ (with job queue)
- **REST API:** FastAPI 0.115+ with uvicorn
- **Vision AI:** OpenAI GPT-4o-mini (fallback: Anthropic Claude)
- **Memory:** Mem0 0.1.0+ with OpenAI embeddings + pgvector
- **Infrastructure:** Docker (PostgreSQL), native Python (development)
- **CI/CD:** Git-based workflow with manual deployment

### Architecture Patterns
- **Agent-Centric Design:** Large agent module with 50+ tools for conversation handling
- **Multi-Agent Coordination:** Nutrition debate system with moderator/consensus pattern
- **Memory Layering:** PostgreSQL (structured) + Markdown (user-readable) + Mem0 (semantic)
- **Dependency Injection:** AgentDeps dataclass for clean testing and modularity
- **Graceful Fallbacks:** Vision AI (OpenAI → Anthropic), Nutrition (Vision → USDA → validation)

### Integrations
- **Telegram Bot API:** Primary user interface
- **OpenAI API:** GPT-4o-mini for vision, embeddings for Mem0
- **Anthropic API:** Claude 3.5 Sonnet for PydanticAI agents, fallback vision
- **USDA FoodData Central API:** Verified nutrition database
- **Mem0 Cloud:** Semantic memory and pattern extraction

---

## Constraints

### Technical Constraints
- **Free Tier Focus:** Minimize API costs (use GPT-4o-mini for vision, not GPT-4o)
- **Single Database:** PostgreSQL handles all persistence (26 tables)
- **Telegram Limitations:** Max message length, photo compression, no rich media
- **Python 3.13:** Latest Python for async/await and type hint improvements

### Business Constraints
- **Zero Budget:** All infrastructure must run on free/personal tiers
- **No Timeline Pressure:** Feature-complete over speed
- **Solo Development:** One developer + AI assistants (SCAR + Supervisor)

### Resource Constraints
- **Team Size:** Solo developer + AI assistants (Claude for planning, SCAR for implementation)
- **Time:** Part-time development with 4/5 phases already complete
- **API Quotas:** Must stay within free tier limits for OpenAI/Anthropic

---

## Current Status

### Phase
**Implementation (80% complete)** - Production deployed with 4/5 phases done

### Recent Progress
- [2025-12-31] **Phase 4 Complete:** Gamification system (XP, streaks, achievements, challenges)
- [2025-12-15] **Phase 2 Complete:** Multi-agent nutrition verification with debate mechanism
- [2025-12-01] **Production Deployed:** Bot live on Telegram with PostgreSQL backend
- [2025-11-20] **Phase 1 Complete:** Core bot, PydanticAI integration, vision AI, memory system

### Next Milestones
- [ ] **Production Database Sync:** Apply 10 missing migrations to production (sleep quiz, user habits)
- [ ] **Phase 5 Planning:** Social/community features (friend challenges, leaderboards, group support)
- [ ] **Documentation Audit:** Update DEVELOPMENT.md with latest architecture changes
- [ ] **Test Coverage:** Ensure all 38 tests pass with latest migrations

---

## Risks

### High-Priority Risks
1. **Production Database Schema Mismatch**
   - **Impact:** Sleep quiz features and user habits tracking unavailable on production
   - **Mitigation:** Schedule maintenance window to apply 10 missing migrations safely

2. **API Cost Overruns**
   - **Impact:** OpenAI/Anthropic free tiers exhausted from heavy usage
   - **Mitigation:** Monitor usage, implement rate limiting, cache vision results

3. **Agent Module Complexity**
   - **Impact:** `src/agent/__init__.py` at 2000+ lines becomes hard to maintain
   - **Mitigation:** Refactor tools into separate modules (nutrition/, gamification/, tracking/)

4. **SCAR Context Loss**
   - **Impact:** Large codebase may exceed SCAR's working context for complex changes
   - **Mitigation:** Use epic-based instruction pattern, self-contained task files

---

## Related Documents

- **PRDs:** `.bmad/prd/` (to be created as new features planned)
- **Epics:** `.bmad/epics/` (to be created for Phase 5 and refactoring tasks)
- **ADRs:** `.bmad/adr/` (to document: PydanticAI choice, multi-agent pattern, memory architecture)
- **Architecture:** `.bmad/architecture/` (to document: system overview, database schema, API spec)
- **Workflow Status:** `.bmad/workflow-status.yaml`

---

## Implementation Summary

**Codebase Location:** `/home/samuel/.archon/workspaces/health-agent/`

**Key Metrics:**
- **Lines of Code:** 10,000+ across 50+ Python files
- **Database Tables:** 26 (16 migrations applied)
- **Test Files:** 38 (unit, integration, API tests)
- **PydanticAI Tools:** 50+ registered tools
- **Gamification Challenges:** 14 pre-built (Easy/Medium/Hard/Expert tiers)
- **Supported Languages:** 2 (English, Swedish)

**Production Status:**
- ✅ Telegram bot running on production token
- ✅ PostgreSQL database on port 5436
- ⚠️ 10 migrations pending on production database
- ✅ REST API available on port 8080
- ✅ 38 tests passing in development

---

## Notes

**Project Genesis:** Health Agent was designed to solve the "nutrition tracking friction" problem. Traditional apps require manual entry; Health Agent uses computer vision + multi-agent verification to make logging effortless.

**Multi-Agent Innovation:** Phase 2 introduced debate-based consensus where 3 agents (Vision, USDA, Validation) negotiate estimates. This reduced calorie variance by 57-65% for common foods.

**Gamification Philosophy:** Phase 4 added XP/streaks/achievements to combat tracking fatigue. Users earn rewards for consistency, not perfection.

**BMAD Adoption:** This planning workspace was initialized on 2026-01-15 to support future feature development using the BMAD methodology (scale-adaptive planning, epic-based SCAR instructions).

---

**Template Version:** 1.0
**Template Source:** BMAD-inspired project brief for SCAR supervisor
