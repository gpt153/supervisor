# PRD: Odin MVP - AI Personal Assistant

**Document Status:** Active
**Created:** 2026-01-15
**Last Updated:** 2026-01-15
**Target Release:** 2026-02-15 (1 month)
**Owner:** Samuel

---

## Executive Summary

Odin MVP is an AI-powered personal assistant that automates information management and task prioritization. The MVP focuses on **email intelligence** and **task management** with semantic search capabilities, enabling users to quickly find information and automate routine workflows.

**Core Value Proposition:** Reduce cognitive load from information overload by 50%+ through intelligent automation and semantic search.

---

## Problem Statement

### The Problem
Modern professionals face overwhelming information overload:
- **100+ emails per day** requiring manual triage
- **Multiple task systems** (email, Todoist, calendar, notes) with no central view
- **Lost context** - can't remember where specific information lives
- **Manual busywork** - writing routine emails, scheduling meetings, organizing tasks

### Impact
- 2-3 hours/day spent on email and task management
- Constant context switching reduces focus
- Important items buried in noise
- Mental fatigue from decision-making overload

### User Needs
> "I need a system that understands my entire information landscape and helps me focus on what matters."

**Must Have:**
1. Automatically process incoming emails (categorize, prioritize, summarize)
2. Semantic search across all information (not just keyword matching)
3. Task management with intelligent prioritization
4. Automation for routine responses

**Nice to Have (Post-MVP):**
- Voice interface
- Multi-platform integration
- Predictive suggestions

---

## Goals & Success Metrics

### Goals
1. **Information Mastery:** User can find any piece of information in <5 seconds
2. **Task Clarity:** User always knows what to work on next
3. **Time Savings:** Reduce email/task management time by 50%+
4. **Automation Trust:** 80%+ of drafted responses accepted without edits

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Email processing speed | <2s per email | Time from ingestion to analysis complete |
| Search response time | <2s | Time from query to results |
| Email categorization accuracy | 90%+ | User validation of categories |
| Priority score accuracy | 85%+ | User agreement with priority |
| Draft acceptance rate | 80%+ | Drafts accepted without major edits |
| Daily time savings | 60+ minutes | Time tracking comparison (before/after) |
| User satisfaction | 8+/10 | Weekly satisfaction survey |

---

## User Personas

### Primary Persona: Samuel (The Information Worker)
- **Role:** Software engineer, entrepreneur, multiple projects
- **Pain Points:**
  - 150+ emails/day across multiple accounts
  - Tasks scattered across Todoist, email, Notion, GitHub
  - Loses track of commitments and context
  - Spends 3+ hours/day on email and task management
- **Goals:**
  - Stay on top of all commitments
  - Never miss important information
  - Automate routine communication
  - Focus time on high-value work
- **Tech Savvy:** High - comfortable with APIs, local setup, command line

---

## Features & Requirements

### Feature 1: Email Intelligence

**Overview:** Automatically ingest, analyze, and organize emails using AI.

**User Stories:**
- As a user, I want emails automatically categorized so I can quickly filter by type
- As a user, I want priority scores so I know what needs immediate attention
- As a user, I want AI-generated summaries so I can quickly understand long emails
- As a user, I want action items extracted so I don't forget follow-ups

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| E1.1 | IMAP email ingestion | Must Have | Connect to Gmail/Outlook IMAP, fetch emails, store in PostgreSQL |
| E1.2 | Email parsing | Must Have | Extract sender, subject, body, attachments metadata, timestamp |
| E1.3 | AI categorization | Must Have | Categorize as: work, personal, spam, newsletter, action_required, fyi |
| E1.4 | Priority scoring | Must Have | Score 1-5 based on urgency, sender importance, action requirements |
| E1.5 | AI summarization | Must Have | Generate 1-2 sentence summary for emails >200 words |
| E1.6 | Action item extraction | Nice to Have | Identify tasks/commitments in email body |
| E1.7 | Sender analysis | Nice to Have | Track sender patterns, relationship importance |

**Technical Notes:**
- Use `imap-tools` library for IMAP connection
- Store raw email + parsed data in `emails` table
- Use Claude/GPT-4 with structured outputs (Pydantic) for analysis
- Generate embeddings using sentence-transformers for semantic search
- Background task (Celery) for batch processing

---

### Feature 2: Semantic Search

**Overview:** Natural language search across all stored information.

**User Stories:**
- As a user, I want to search using natural language so I don't need exact keywords
- As a user, I want search to understand context and intent
- As a user, I want results ranked by relevance

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| S2.1 | Vector embeddings | Must Have | Generate embeddings for all email content using sentence-transformers |
| S2.2 | Semantic search API | Must Have | POST /api/v1/search with natural language query, return ranked results |
| S2.3 | Cosine similarity search | Must Have | Use pgvector cosine distance for similarity matching |
| S2.4 | Result ranking | Must Have | Rank by relevance score + recency weight |
| S2.5 | Search filters | Nice to Have | Filter by date range, sender, category |
| S2.6 | Highlight context | Nice to Have | Show matching snippets with highlights |

**Technical Notes:**
- Use pgvector extension for PostgreSQL
- `sentence-transformers/all-MiniLM-L6-v2` model (384 dimensions)
- HNSW index for fast approximate nearest neighbor search
- Query: `ORDER BY embedding <=> query_embedding LIMIT 20`

---

### Feature 3: Task Management

**Overview:** Unified task management with intelligent prioritization.

**User Stories:**
- As a user, I want tasks automatically created from emails with action items
- As a user, I want to see all tasks in one view, regardless of source
- As a user, I want intelligent prioritization based on context
- As a user, I want tasks linked to related emails/documents

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| T3.1 | Task CRUD API | Must Have | Create, read, update, delete tasks via REST API |
| T3.2 | Task model | Must Have | Title, description, priority, due_date, status, tags, source (email/manual) |
| T3.3 | Email-task linking | Must Have | Foreign key relationship: task.email_id |
| T3.4 | Priority scoring | Must Have | AI-based priority (1-5) considering urgency, importance, dependencies |
| T3.5 | Task list views | Must Have | GET /api/v1/tasks with filters: status, priority, due_date |
| T3.6 | Todoist sync | Nice to Have | Bidirectional sync with Todoist API |
| T3.7 | Task dependencies | Nice to Have | Model parent-child task relationships |

**Technical Notes:**
- SQLAlchemy model: `Task`
- Service layer: `TaskService` with prioritization logic
- Use Claude for priority scoring based on task context
- Background sync to Todoist (if configured)

---

### Feature 4: Email Automation

**Overview:** Draft email responses and automate routine workflows.

**User Stories:**
- As a user, I want AI-drafted responses for common emails
- As a user, I want to review and edit drafts before sending
- As a user, I want templates for frequent response types

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| A4.1 | Draft generation API | Must Have | POST /api/v1/emails/{id}/draft returns suggested response |
| A4.2 | Context-aware drafts | Must Have | Use email thread context + user's writing style |
| A4.3 | Tone control | Must Have | Support tones: professional, casual, brief, detailed |
| A4.4 | Draft storage | Must Have | Save drafts to database for user review |
| A4.5 | Send email API | Nice to Have | POST /api/v1/emails/{id}/send via SMTP/SendGrid |
| A4.6 | Template library | Nice to Have | Pre-defined templates for: meeting request, decline, thanks, etc. |

**Technical Notes:**
- Use Claude Sonnet 4.5 for draft generation (better at writing)
- Provide email thread context + user profile/preferences
- Store drafts with `draft` status, only send on explicit approval
- SMTP/SendGrid for sending

---

### Feature 5: Database & Infrastructure

**Overview:** Robust data storage with privacy-first architecture.

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| D5.1 | PostgreSQL setup | Must Have | Local PostgreSQL 15+ with pgvector extension |
| D5.2 | Database models | Must Have | Email, Task, User, Draft models with relationships |
| D5.3 | Migrations | Must Have | Alembic migrations for schema versioning |
| D5.4 | Redis setup | Must Have | Local Redis for Celery task queue |
| D5.5 | Background tasks | Must Have | Celery workers for: email sync, batch processing, embeddings |
| D5.6 | API authentication | Nice to Have | JWT tokens for API access |
| D5.7 | Database backups | Nice to Have | Automated daily backups |

**Technical Notes:**
- Docker Compose for PostgreSQL + Redis (optional, can run native)
- Alembic for migrations
- Celery with Redis broker

---

## Technical Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface (Future)                 │
│                   (Web UI / CLI / Voice)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/REST API
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    FastAPI Application                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API Routes (api/)                      │    │
│  │  /emails  /tasks  /search  /automation              │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐    │
│  │           Service Layer (services/)                 │    │
│  │  EmailService, TaskService, AIService, etc.         │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐    │
│  │         Database Layer (models/)                    │    │
│  │       SQLAlchemy ORM + pgvector                     │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
         │                   │                     │
         │                   │                     │
         ▼                   ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   PostgreSQL    │  │  Redis + Celery │  │   AI Services    │
│   + pgvector    │  │  (Task Queue)   │  │ OpenAI/Anthropic │
│  (Local DB)     │  │  (Background)   │  │   LangChain      │
└─────────────────┘  └─────────────────┘  └──────────────────┘
         │
         │ IMAP/SMTP
         ▼
┌─────────────────────────────┐
│   Email Services            │
│   (Gmail, Outlook, etc.)    │
└─────────────────────────────┘
```

### Data Models

**Email:**
```python
- id: int (PK)
- message_id: str (unique, indexed)
- user_id: str (indexed)
- sender: str (indexed)
- recipients: str[]
- subject: str
- body: str (text)
- html_body: str (text)
- category: str (enum: work, personal, spam, newsletter, action_required, fyi)
- priority: int (1-5)
- summary: str
- embedding: vector(384)
- metadata: jsonb (attachments, headers, etc.)
- created_at: timestamp
- updated_at: timestamp
```

**Task:**
```python
- id: int (PK)
- user_id: str (indexed)
- email_id: int (FK to Email, nullable)
- title: str
- description: str (text)
- priority: int (1-5)
- status: str (enum: pending, in_progress, completed, cancelled)
- due_date: timestamp (nullable)
- tags: str[] (indexed)
- source: str (enum: email, manual, todoist)
- metadata: jsonb (extra context)
- created_at: timestamp
- updated_at: timestamp
```

---

## API Specification

### Email Endpoints

```
GET    /api/v1/emails              List emails (paginated, filtered)
GET    /api/v1/emails/{id}         Get single email
POST   /api/v1/emails/sync         Trigger email sync (background job)
POST   /api/v1/emails/{id}/analyze Re-analyze email with AI
POST   /api/v1/emails/{id}/draft   Generate response draft
POST   /api/v1/emails/{id}/send    Send email (with draft)
```

### Task Endpoints

```
GET    /api/v1/tasks               List tasks (filtered by status, priority, tags)
GET    /api/v1/tasks/{id}          Get single task
POST   /api/v1/tasks               Create new task
PUT    /api/v1/tasks/{id}          Update task
DELETE /api/v1/tasks/{id}          Delete task
POST   /api/v1/tasks/{id}/complete Mark task complete
```

### Search Endpoints

```
POST   /api/v1/search              Semantic search across all content
  Body: { "query": str, "limit": int, "filters": {...} }
  Response: [{ "type": "email|task", "id": int, "relevance": float, "snippet": str, "data": {...} }]
```

### Automation Endpoints

```
GET    /api/v1/automation/templates      List response templates
POST   /api/v1/automation/templates      Create template
GET    /api/v1/automation/workflows      List active workflows
POST   /api/v1/automation/workflows      Create workflow
```

---

## Security & Privacy

### Privacy Requirements
1. **Local-First:** All personal data stored locally (no cloud storage)
2. **No Logging:** Email content never logged (only metadata)
3. **Encrypted Storage:** Sensitive fields encrypted at rest (future)
4. **Secure Credentials:** API keys in `.env`, never hardcoded
5. **HTTPS Only:** All external API calls use HTTPS/TLS

### Security Measures
- **Input Validation:** All inputs validated with Pydantic
- **SQL Injection Prevention:** Parameterized queries only (SQLAlchemy ORM)
- **Rate Limiting:** Prevent API abuse (future)
- **Authentication:** JWT tokens for API access (phase 2)
- **Audit Logging:** Log user actions (not content) for debugging

---

## Testing Strategy

### Test Coverage Requirements
- **Minimum:** 70% code coverage
- **Critical Paths:** 90%+ coverage (email processing, AI analysis, search)

### Test Types
1. **Unit Tests:** Services, utilities, models
2. **Integration Tests:** API endpoints, database operations
3. **E2E Tests:** Full workflows (email sync → analysis → search)
4. **Performance Tests:** Search latency, throughput under load

### Test Data
- Use synthetic test emails (not real data)
- Mock AI API responses for consistent testing
- Test database separate from development database

---

## Deployment & Operations

### MVP Deployment (Local)
- Run on user's local machine (macOS/Linux)
- PostgreSQL + Redis running locally
- FastAPI server: `uvicorn` on port 8000
- Celery worker for background tasks
- Manual start/stop (systemd service future)

### Monitoring (Future)
- Application logs (rotating file handler)
- Error tracking (Sentry integration)
- Performance monitoring (query times, API latency)
- Usage metrics (emails processed, searches performed)

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI API rate limits | Medium | High | Implement caching, use smaller models, request limit increases |
| Database performance at scale | Low | High | HNSW indexing, query optimization, archival strategy |
| Email provider blocks IMAP | Low | Critical | OAuth2 for Gmail, app passwords, retry logic |
| Privacy breach (data leak) | Low | Critical | Code review, no logging of content, comprehensive .gitignore |
| Context window limits | Medium | Medium | Chunking strategy, summarization for long content |

---

## Out of Scope (Explicitly)

**Not in MVP:**
- Voice interface (Phase 2)
- Mobile app (future)
- Multi-user support (single-user focus)
- Cloud deployment (local-only for privacy)
- Calendar integration (future)
- Advanced automation (bill payment, phone calls - Phase 3)
- Real-time email push notifications (polling only for MVP)

---

## Success Criteria (MVP Complete)

MVP is complete when:
- [x] User can connect Gmail account via IMAP
- [x] 100+ emails processed and categorized correctly (90%+ accuracy)
- [x] Semantic search returns relevant results in <2 seconds
- [x] Task management API functional with prioritization
- [x] Email draft generation produces usable responses (80%+ acceptance)
- [x] 70%+ test coverage achieved
- [x] Documentation complete (setup guide, API docs)
- [x] User reports 50%+ time savings in daily testing

---

## Timeline & Milestones

**Total Duration:** 4 weeks (2026-01-15 to 2026-02-15)

### Week 1: Foundation (Jan 15-21)
- [ ] Epic 001: Project foundation (database setup, models, migrations)
- [ ] Epic 002: Email ingestion (IMAP connection, email parsing, storage)

### Week 2: Intelligence (Jan 22-28)
- [ ] Epic 003: AI processing pipeline (categorization, priority, summaries)
- [ ] Epic 004: Semantic search (embeddings, pgvector, search API)

### Week 3: Task Management (Jan 29 - Feb 4)
- [ ] Epic 005: Task management (CRUD API, prioritization, email linking)
- [ ] Epic 006: Email automation (draft generation, templates)

### Week 4: Polish & Testing (Feb 5-15)
- [ ] Comprehensive testing, bug fixes
- [ ] Documentation
- [ ] Performance optimization
- [ ] User acceptance testing

---

## Appendix

### Related Documents
- Project Brief: `.bmad/project-brief.md`
- Architecture Decisions: `.bmad/adr/`
- Epic Breakdown: `.bmad/epics/`

### Glossary
- **Semantic Search:** Search based on meaning/context, not just keywords
- **Embedding:** Vector representation of text for similarity comparison
- **pgvector:** PostgreSQL extension for vector similarity search
- **HNSW:** Hierarchical Navigable Small World (fast approximate nearest neighbor algorithm)
- **Celery:** Distributed task queue for background job processing

---

**Document Version:** 1.0
**Next Review:** 2026-01-22 (after Week 1 implementation)
