# Epic 001: Project Foundation

**Status:** Ready
**Priority:** Critical
**Estimated Effort:** 3-4 days
**Epic Type:** Foundation
**Target:** Week 1 (Jan 15-21)

---

## Overview

Establish core project infrastructure including database setup, base models, configuration management, and testing framework. This epic provides the foundation all other features will build upon.

---

## Goals

1. Database infrastructure operational (PostgreSQL + pgvector + Redis)
2. Core SQLAlchemy models defined with proper relationships
3. Database migrations working (Alembic)
4. Testing framework configured with fixtures
5. Configuration management via environment variables
6. Code quality tools configured (black, ruff, mypy)

---

## User Stories

**As a developer:**
- I want database migrations so I can version schema changes
- I want test fixtures so I can write reliable tests
- I want type checking so I catch errors early
- I want consistent code formatting so the codebase stays clean

---

## Technical Requirements

### Database Setup

**PostgreSQL with pgvector:**
- Install PostgreSQL 15+ locally
- Install pgvector extension
- Create `odin` database and user
- Configure connection pooling
- Test connection from application

**Redis:**
- Install Redis locally
- Configure as Celery broker
- Test connection

### SQLAlchemy Models

Create base models in `src/odin/models/`:

**1. Base Model (`base.py`):**
- [x] Already created with `BaseModel` class
- [x] Timestamp mixin (created_at, updated_at)
- [x] Database session management
- [x] get_db() dependency for FastAPI

**2. Email Model (`email.py`):**
```python
class Email(BaseModel):
    __tablename__ = "emails"

    message_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)
    sender: Mapped[str] = mapped_column(String(255), index=True)
    recipients: Mapped[list[str]] = mapped_column(ARRAY(String))
    subject: Mapped[str] = mapped_column(Text)
    body: Mapped[str] = mapped_column(Text)
    html_body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # AI-generated fields
    category: Mapped[str] = mapped_column(String(50), index=True)
    priority: Mapped[int] = mapped_column(Integer, index=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Vector embedding for semantic search
    embedding: Mapped[Optional[Vector]] = mapped_column(Vector(384), nullable=True)

    # Metadata
    metadata_: Mapped[dict] = mapped_column(JSONB, name="metadata")

    # Relationships
    tasks: Mapped[list["Task"]] = relationship(back_populates="email")
    drafts: Mapped[list["EmailDraft"]] = relationship(back_populates="email")

    # Indexes
    __table_args__ = (
        Index("idx_user_created", "user_id", "created_at"),
        Index("idx_category_priority", "category", "priority"),
    )
```

**3. Task Model (`task.py`):**
```python
class Task(BaseModel):
    __tablename__ = "tasks"

    user_id: Mapped[str] = mapped_column(String(255), index=True)
    email_id: Mapped[Optional[int]] = mapped_column(ForeignKey("emails.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[int] = mapped_column(Integer, index=True, default=3)
    status: Mapped[str] = mapped_column(String(50), index=True, default="pending")
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)

    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    source: Mapped[str] = mapped_column(String(50), default="manual")
    metadata_: Mapped[dict] = mapped_column(JSONB, name="metadata", default=dict)

    # Relationships
    email: Mapped[Optional["Email"]] = relationship(back_populates="tasks")

    # Indexes
    __table_args__ = (
        Index("idx_user_status_priority", "user_id", "status", "priority"),
        Index("idx_due_date", "due_date"),
    )
```

**4. EmailDraft Model (`email_draft.py`):**
```python
class EmailDraft(BaseModel):
    __tablename__ = "email_drafts"

    email_id: Mapped[int] = mapped_column(ForeignKey("emails.id"))
    user_id: Mapped[str] = mapped_column(String(255), index=True)

    content: Mapped[str] = mapped_column(Text)
    tone: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="draft")

    # Relationships
    email: Mapped["Email"] = relationship(back_populates="drafts")
```

**5. User Model (`user.py`):**
```python
class User(BaseModel):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)

    # Preferences
    preferences: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Email credentials (encrypted in future)
    email_credentials: Mapped[dict] = mapped_column(JSONB, default=dict)
```

### Alembic Migrations

**Setup:**
- Configure `alembic/env.py` to use async engine
- Update `alembic.ini` with DATABASE_URL from env
- Create initial migration with all models
- Test migration up/down

**Commands:**
```bash
# Create initial migration
alembic revision --autogenerate -m "Initial schema with Email, Task, User models"

# Apply migration
alembic upgrade head

# Rollback (for testing)
alembic downgrade -1
```

### Configuration Management

**Update `src/odin/core/config.py`:**
- [x] Already created with Settings class
- Add validation for required fields
- Add computed properties (e.g., async DATABASE_URL)

### Testing Framework

**Setup pytest with async support:**

**`tests/conftest.py`:**
```python
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient

from src.odin.api.main import app
from src.odin.models.base import Base
from src.odin.core.config import settings

# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://odin:test@localhost/odin_test"

@pytest.fixture
async def db_engine():
    """Create test database engine"""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()

@pytest.fixture
async def db_session(db_engine):
    """Create test database session"""
    async_session = sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session

@pytest.fixture
async def client(db_session):
    """Create test HTTP client"""
    app.dependency_overrides[get_db] = lambda: db_session

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()

@pytest.fixture
def sample_email_data():
    """Sample email data for testing"""
    return {
        "message_id": "test-message-123",
        "user_id": "test-user",
        "sender": "sender@example.com",
        "recipients": ["recipient@example.com"],
        "subject": "Test Email",
        "body": "This is a test email body.",
        "category": "work",
        "priority": 3,
    }
```

### Code Quality Tools

**Pre-commit hooks (`.pre-commit-config.yaml`):**
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 24.8.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.0
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.11.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
```

---

## Acceptance Criteria

### Database
- [ ] PostgreSQL 15+ installed and running
- [ ] pgvector extension installed and working
- [ ] Redis installed and running
- [ ] Database `odin` created with proper user permissions
- [ ] Connection from FastAPI application successful

### Models
- [ ] All 4 models defined (Email, Task, EmailDraft, User)
- [ ] Relationships properly configured
- [ ] Indexes created for frequently queried columns
- [ ] Vector column works (can insert/query embeddings)

### Migrations
- [ ] Alembic configured with async support
- [ ] Initial migration created
- [ ] Migration applies successfully (`alembic upgrade head`)
- [ ] Migration rolls back successfully (`alembic downgrade -1`)
- [ ] All tables created with correct schema

### Testing
- [ ] pytest configured with async support
- [ ] Test database fixtures working
- [ ] Sample test written and passing
- [ ] Test coverage reporting configured
- [ ] Can run `pytest` and all tests pass

### Code Quality
- [ ] Black, ruff, mypy configured
- [ ] Pre-commit hooks installed
- [ ] All code passes type checking (`mypy src/`)
- [ ] All code passes linting (`ruff check src/`)
- [ ] Code formatted (`black src/`)

---

## Testing Strategy

### Unit Tests
- Test each model's `__repr__` and basic operations
- Test configuration loading from .env
- Test database connection and session management

### Integration Tests
- Test model relationships (create Email → create Task linked to Email)
- Test pgvector operations (insert embedding, query by similarity)
- Test migration up/down

---

## Technical Decisions

### Why pgvector?
- Native PostgreSQL extension (no external service)
- Excellent performance with HNSW indexing
- Mature and well-supported
- Perfect for semantic search use case

### Why Alembic?
- Industry standard for SQLAlchemy migrations
- Auto-generation of migrations from model changes
- Version control for database schema
- Easy rollback capabilities

### Why async SQLAlchemy?
- FastAPI is async-first
- Better performance for I/O-bound operations (database, APIs)
- Scales better under load
- Future-proof (async is the future of Python)

---

## Related Epics

- **Depends On:** None (foundation epic)
- **Blocks:** 002 (Email Ingestion), 003 (AI Processing), 004 (Semantic Search), 005 (Task Management)

---

## Implementation Notes for SCAR

1. **Start with database setup:**
   - Create setup script: `scripts/setup_db.sh`
   - Document PostgreSQL + pgvector installation
   - Create database and user

2. **Create models incrementally:**
   - Start with `Email` model
   - Add `Task` model with foreign key
   - Add `EmailDraft` and `User` models
   - Test relationships between models

3. **Configure Alembic:**
   - Update `env.py` for async
   - Update `alembic.ini` to read from .env
   - Generate initial migration
   - Test migration

4. **Set up testing:**
   - Create `conftest.py` with fixtures
   - Write one test for each model
   - Ensure tests pass

5. **Commit frequently:**
   - Commit after each model
   - Commit after migrations working
   - Commit after tests passing

---

## Documentation

**Files to create/update:**
- `docs/database-setup.md` - PostgreSQL + pgvector installation guide
- `docs/development.md` - How to run tests, migrations, code quality tools
- `README.md` - Update with database setup instructions

---

**Epic Owner:** SCAR (Implementation Agent)
**Reviewer:** Supervisor (Samuel)
**Estimated Completion:** 2026-01-18
