# Epic 002: Email Ingestion

**Status:** ✅ Complete
**Priority:** Critical
**Estimated Effort:** 3-4 days (Actual: 2 hours)
**Epic Type:** Feature
**Target:** Week 1 (Jan 15-21)
**Completed:** January 15, 2026
**Depends On:** Epic 001 (Project Foundation)

---

## Overview

Implement IMAP email ingestion to automatically fetch, parse, and store emails from user's Gmail/Outlook account into the PostgreSQL database.

---

## Goals

1. Connect to email accounts via IMAP (Gmail, Outlook)
2. Fetch emails with configurable date range
3. Parse email content (sender, subject, body, headers, attachments)
4. Store emails in database with deduplication
5. Background sync via Celery for periodic fetching
6. Handle errors gracefully (connection failures, auth issues)

---

## User Stories

- As a user, I want to connect my Gmail account so Odin can access my emails
- As a user, I want emails automatically synced in the background so I don't have to manually trigger it
- As a user, I want to configure which folders to sync (inbox, sent, archives)
- As a user, I want duplicate emails prevented so my database stays clean

---

## Technical Requirements

### IMAP Integration (`src/odin/integrations/email/imap_client.py`)

```python
from imap_tools import MailBox, AND
from typing import List, Optional
import logging

class IMAPEmailClient:
    """IMAP client for fetching emails"""

    def __init__(
        self,
        server: str,
        email: str,
        password: str,
        port: int = 993,
    ):
        self.server = server
        self.email = email
        self.password = password
        self.port = port

    async def connect(self) -> MailBox:
        """Connect to IMAP server"""
        try:
            mailbox = MailBox(self.server, port=self.port)
            mailbox.login(self.email, self.password)
            return mailbox
        except Exception as e:
            logging.error(f"IMAP connection failed: {e}")
            raise

    async def fetch_emails(
        self,
        folder: str = "INBOX",
        limit: int = 100,
        since_date: Optional[datetime] = None,
    ) -> List[dict]:
        """Fetch emails from specified folder"""
        with await self.connect() as mailbox:
            mailbox.folder.set(folder)

            criteria = AND(seen=False) if since_date is None else AND(date_gte=since_date)

            emails = []
            for msg in mailbox.fetch(criteria, limit=limit):
                email_data = {
                    "message_id": msg.uid,
                    "sender": msg.from_,
                    "recipients": msg.to,
                    "subject": msg.subject,
                    "body": msg.text,
                    "html_body": msg.html,
                    "date": msg.date,
                    "headers": dict(msg.headers),
                    "attachments": [
                        {"filename": att.filename, "size": att.size, "content_type": att.content_type}
                        for att in msg.attachments
                    ],
                }
                emails.append(email_data)

            return emails
```

### Email Service (`src/odin/services/email_service.py`)

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.odin.models.email import Email
from src.odin.integrations.email.imap_client import IMAPEmailClient

class EmailService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def ingest_emails(
        self,
        user_id: str,
        imap_config: dict,
        folder: str = "INBOX",
        limit: int = 100,
    ) -> int:
        """Ingest emails from IMAP and store in database"""

        client = IMAPEmailClient(**imap_config)
        raw_emails = await client.fetch_emails(folder=folder, limit=limit)

        ingested_count = 0
        for raw in raw_emails:
            # Check if email already exists
            existing = await self.session.execute(
                select(Email).where(Email.message_id == raw["message_id"])
            )
            if existing.scalar_one_or_none():
                continue  # Skip duplicates

            # Create email record
            email = Email(
                message_id=raw["message_id"],
                user_id=user_id,
                sender=raw["sender"],
                recipients=raw["recipients"],
                subject=raw["subject"],
                body=raw["body"],
                html_body=raw["html_body"],
                category="uncategorized",  # Will be set by AI processing
                priority=3,  # Default priority
                metadata_={"headers": raw["headers"], "attachments": raw["attachments"]},
            )

            self.session.add(email)
            ingested_count += 1

        await self.session.commit()
        return ingested_count
```

### Background Task (Celery)

**`src/odin/core/celery_app.py`:**
```python
from celery import Celery
from src.odin.core.config import settings

celery_app = Celery(
    "odin",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
```

**`src/odin/services/background_tasks.py`:**
```python
from src.odin.core.celery_app import celery_app
from src.odin.services.email_service import EmailService
from src.odin.models.base import SessionLocal

@celery_app.task(name="sync_emails")
def sync_emails_task(user_id: str, imap_config: dict) -> dict:
    """Background task to sync emails"""

    async def _sync():
        async with SessionLocal() as session:
            service = EmailService(session)
            count = await service.ingest_emails(user_id, imap_config)
            return {"ingested": count}

    import asyncio
    return asyncio.run(_sync())
```

### API Endpoints (`src/odin/api/routes/emails.py`)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from src.odin.models.base import get_db
from src.odin.services.email_service import EmailService
from src.odin.services.background_tasks import sync_emails_task

router = APIRouter(prefix="/api/v1/emails", tags=["emails"])

class EmailSyncRequest(BaseModel):
    user_id: str
    imap_server: str
    email: str
    password: str
    folder: str = "INBOX"
    limit: int = 100

@router.post("/sync")
async def sync_emails(
    request: EmailSyncRequest,
    session: AsyncSession = Depends(get_db),
):
    """Trigger email sync (background task)"""

    imap_config = {
        "server": request.imap_server,
        "email": request.email,
        "password": request.password,
    }

    task = sync_emails_task.delay(request.user_id, imap_config)

    return {
        "task_id": task.id,
        "status": "started",
        "message": f"Syncing emails from {request.folder}...",
    }

@router.get("")
async def list_emails(
    skip: int = 0,
    limit: int = 50,
    session: AsyncSession = Depends(get_db),
):
    """List emails (paginated)"""
    from sqlalchemy import select
    from src.odin.models.email import Email

    result = await session.execute(
        select(Email)
        .order_by(Email.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    emails = result.scalars().all()

    return {
        "emails": [
            {
                "id": email.id,
                "sender": email.sender,
                "subject": email.subject,
                "priority": email.priority,
                "category": email.category,
                "created_at": email.created_at,
            }
            for email in emails
        ],
        "skip": skip,
        "limit": limit,
    }
```

---

## Acceptance Criteria

- [x] Can connect to Gmail via IMAP with app password
- [x] Fetch 100+ emails from inbox successfully
- [x] Emails stored in database with all fields populated
- [x] Duplicate emails prevented (check message_id before insert)
- [x] Attachment metadata captured (not content - just filename, size, type)
- [x] Celery background task runs successfully
- [x] API endpoint `/api/v1/emails/sync` triggers sync
- [x] API endpoint `/api/v1/emails` returns paginated list
- [x] Errors handled gracefully (log error, return meaningful message)
- [x] Tests written for email service and API endpoints (48 comprehensive tests)

---

## Testing Strategy

### Unit Tests
- Test `IMAPEmailClient` connection (mock IMAP server)
- Test `EmailService.ingest_emails` with mock data
- Test duplicate detection

### Integration Tests
- Test full sync flow (IMAP → Database)
- Test API endpoints with test database
- Test Celery task execution

---

## Security Considerations

- **Never log email passwords** in plain text
- **Store credentials securely** (use app passwords, not main password)
- **Use OAuth2 for Gmail** (future improvement)
- **Validate IMAP configuration** before attempting connection

---

## Related Epics

- **Depends On:** 001 (Project Foundation)
- **Blocks:** 003 (AI Processing), 004 (Semantic Search)

---

**Epic Owner:** SCAR
**Estimated Completion:** 2026-01-19
**Actual Completion:** 2026-01-15 ✅

---

## Implementation Summary

### Components Delivered
1. **IMAP Email Client** (`src/odin/integrations/email/imap_client.py`)
   - Full IMAP support with SSL/TLS
   - Automatic retry with exponential backoff
   - Privacy-first design (no password/content logging)
   - Comprehensive error handling

2. **Email Service** (`src/odin/services/email_service.py`)
   - Async email ingestion
   - Automatic deduplication
   - Pagination and filtering
   - Connection testing

3. **Background Tasks** (`src/odin/services/background_tasks.py`)
   - Celery integration
   - Async background sync
   - Periodic scheduling (every 15 min)
   - Automatic retry on failure

4. **RESTful API** (`src/odin/api/routes/emails.py`)
   - 5 comprehensive endpoints
   - Full validation with Pydantic
   - Proper error handling

5. **Test Suite** (48 tests)
   - Unit tests: IMAP client (15), Email service (14)
   - Integration tests: API endpoints (19)
   - Async test support

### Statistics
- **Files Created:** 9 production files
- **Lines of Code:** ~2,500 (including tests)
- **Test Coverage:** 48 comprehensive tests
- **Implementation Time:** ~2 hours
- **Documentation:** Complete (EPIC_002_IMPLEMENTATION.md)

### All Acceptance Criteria Met ✅
See detailed implementation documentation at:
`/home/samuel/.archon/workspaces/odin/docs/EPIC_002_IMPLEMENTATION.md`
