# Project Brief: Odin

**Created:** 2026-01-15 (Stockholm time)
**Last Updated:** 2026-01-15
**Status:** Active - Planning Phase
**Planning Repository:** https://github.com/gpt153/odin-planning
**Implementation Repository:** https://github.com/gpt153/odin
**Implementation Workspace:** `/home/samuel/.archon/workspaces/odin/`

---

## Vision

Odin is an advanced AI personal assistant designed to be your JARVIS - an intelligent system that manages your entire digital life. It ingests and understands all incoming information (emails, messages, documents), tracks and prioritizes tasks, builds deep contextual knowledge about your life and work, and automates routine tasks. Odin aims to be the central nervous system of your digital existence, helping you focus on what truly matters by handling the cognitive load of information management and task orchestration.

---

## Goals

### Primary Goals
1. **Information Mastery:** Automatically gather, process, and make searchable all incoming information from emails, messages, documents, and other sources
2. **Intelligent Task Management:** Track, organize, and prioritize tasks based on context, urgency, and personal patterns
3. **Context Building:** Maintain a comprehensive understanding of the user's life, work, relationships, and commitments through semantic knowledge graphs
4. **Automation Excellence:** Automate routine tasks (email responses, scheduling, reminders) with high accuracy and minimal user intervention

### Success Criteria
- [ ] Successfully ingests and processes 100+ emails with accurate categorization and priority scoring
- [ ] Maintains semantic search capability across all stored information with <2s response time
- [ ] Achieves 80%+ accuracy on automated email response drafts (user approval rate)
- [ ] Reduces user's daily task management time by 50%+ (measured via time tracking)
- [ ] Demonstrates contextual awareness by correctly linking related information across different sources

---

## Stakeholders

### Primary Stakeholders
- **Personal User (Samuel):** Needs comprehensive life management system that handles information overload, task prioritization, and routine automation while respecting privacy

### Decision Makers
- **Owner:** Samuel
- **Technical Lead:** Samuel (with SCAR implementation agent)

---

## Scope

### In Scope (MVP - Month 1)
- **Email Integration:** IMAP connection to ingest emails, parse content, extract metadata
- **Information Storage:** PostgreSQL database with pgvector for semantic search
- **AI Processing:** Email analysis, categorization, priority scoring, summary generation
- **Task Management:** Create, update, prioritize tasks; link tasks to emails/documents
- **Semantic Search:** Natural language queries across all stored information
- **Basic Automation:** Email draft generation, simple task automation workflows

### Out of Scope (Future Phases)
- **Voice Interface:** Speech-to-text/text-to-speech via Bluetooth headset (Phase 2)
- **Phone Call Handling:** Automated phone call management (Phase 3)
- **Bill Payment:** Automated financial transactions (Phase 3)
- **Multi-user Support:** Single-user focus for MVP (may never expand)
- **Mobile App:** Web API only initially; mobile app TBD
- **Cloud Deployment:** Local-only for privacy; cloud deployment not planned

---

## Technical Context

### Technology Stack
- **Language:** Python 3.11+
- **Framework:** FastAPI (async web framework)
- **Database:** PostgreSQL 15+ with pgvector extension (local deployment)
- **Vector Search:** sentence-transformers (all-MiniLM-L6-v2 for embeddings)
- **Task Queue:** Celery with Redis for background job processing
- **AI Services:** OpenAI GPT-4 and Anthropic Claude via LangChain
- **ORM:** SQLAlchemy 2.0+ with async support
- **Migrations:** Alembic
- **Testing:** pytest with pytest-asyncio, pytest-cov
- **Code Quality:** black (formatting), ruff (linting), mypy (type checking)

### Architecture Patterns
- **Service Layer Pattern:** Business logic separated from API routes (services/ directory)
- **Repository Pattern:** Complex database queries encapsulated in repository classes
- **Async/Await:** All I/O operations (database, API calls) are asynchronous
- **Dependency Injection:** FastAPI dependency system for database sessions, auth
- **Structured Outputs:** Pydantic models for AI responses (type-safe LLM interactions)
- **Background Tasks:** Celery for long-running operations (email sync, batch processing)

### Integrations
- **Email:** Gmail/Outlook via IMAP (reading), SMTP/SendGrid (sending)
- **Calendar:** Google Calendar API for event management and scheduling
- **Task Services:** Todoist API for task synchronization
- **AI Services:** OpenAI API (GPT-4), Anthropic API (Claude Sonnet 4.5)
- **Future:** Slack, Discord, Notion, Linear (Phase 2+)

---

## Constraints

### Technical Constraints
- **Local-First Architecture:** All personal data must remain on user's machine (privacy requirement)
- **Single User:** No multi-tenancy; designed for individual use
- **Type Safety:** Strict type checking required (mypy strict mode)
- **Test Coverage:** Minimum 70% code coverage for all production code
- **Performance:** Semantic search must return results in <2 seconds
- **Security:** All external connections HTTPS/TLS; no plaintext secrets

### Business Constraints
- **Timeline:** MVP within 1 month (February 15, 2026 target)
- **Budget:** Zero budget; using free tiers and open-source tools
- **Privacy:** Cannot use cloud services that store personal data
- **Compliance:** Must handle email/personal data securely (GDPR considerations)

### Resource Constraints
- **Team Size:** Solo developer (Samuel) + AI assistants (Supervisor, SCAR)
- **Time:** Part-time development (evenings/weekends)
- **Infrastructure:** Single development machine (local PostgreSQL, Redis)

---

## Current Status

### Phase
**Planning** → Implementation starting soon

### Recent Progress
- [2026-01-15] Project structure initialized
- [2026-01-15] Planning workspace created
- [2026-01-15] Implementation workspace created with FastAPI boilerplate
- [2026-01-15] GitHub repositories created (planning + implementation)
- [2026-01-15] Comprehensive CLAUDE.md implementation guide written

### Next Milestones
- [ ] **MVP Phase 1 Complete:** All core features functional - Target: 2026-02-15
  - Email ingestion working
  - Semantic search operational
  - Task management functional
  - Basic automation (email drafts) working
- [ ] **Phase 2 - Voice Interface:** Bluetooth headset integration - Target: 2026-03-15
- [ ] **Phase 3 - Advanced Automation:** Bill payment, phone calls - Target: TBD

---

## Risks

### High-Priority Risks
1. **AI API Costs:**
   - **Impact:** OpenAI/Anthropic API usage could become expensive with high email volume
   - **Mitigation:** Implement caching for similar queries; use smaller models for simple tasks; set monthly budget alerts

2. **Privacy Breach:**
   - **Impact:** Accidental logging or exposure of sensitive personal data could be catastrophic
   - **Mitigation:** Code review focused on privacy; never log email content; comprehensive .gitignore; security audit before email integration

3. **Context Window Limitations:**
   - **Impact:** LLMs have token limits; processing long email threads or documents may fail
   - **Mitigation:** Implement chunking strategy; use summarization for long content; prioritize important sections

4. **Database Performance:**
   - **Impact:** Vector search may slow down with large datasets (>100k emails)
   - **Mitigation:** Implement HNSW indexing for pgvector; archival strategy for old data; query optimization

5. **Integration Reliability:**
   - **Impact:** External services (Gmail, Todoist) may have API changes or downtime
   - **Mitigation:** Robust error handling; retry logic with exponential backoff; graceful degradation

---

## Related Documents

- **PRDs:** `.bmad/prd/` (Product Requirements Documents)
- **Epics:** `.bmad/epics/` (Feature epics for SCAR implementation)
- **ADRs:** `.bmad/adr/` (Architecture Decision Records)
- **Architecture:** `.bmad/architecture/` (System architecture diagrams)
- **Workflow Status:** `.bmad/workflow-status.yaml` (Current progress tracking)

---

## Notes

### Why "Odin"?
Named after the Norse god of wisdom and knowledge - fitting for an AI that manages information and provides guidance.

### Design Philosophy
- **Privacy First:** User data never leaves their machine
- **Intelligence Over Automation:** Don't just automate; understand context and make smart decisions
- **Progressive Enhancement:** Start with core capabilities, add advanced features incrementally
- **Trust Through Transparency:** User can always see what Odin is doing and why

### Inspiration
- JARVIS from Iron Man (conversational AI assistant)
- Notion AI (knowledge management)
- Superhuman (intelligent email management)
- Personal knowledge management systems (Obsidian, Roam)

### Future Vision (Post-MVP)
- Voice-first interaction via Bluetooth headset
- Proactive assistance (suggests actions before you ask)
- Multi-device synchronization (phone, computer, smart home)
- Learning user preferences over time (personalized AI)
- Integration with physical devices (IoT, smart home)

---

**Template Version:** 1.0
**Template Source:** BMAD-inspired project brief for SCAR supervisor
