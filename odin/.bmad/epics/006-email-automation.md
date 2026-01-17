# Epic 006: Email Automation

**Status:** Ready
**Priority:** Medium
**Estimated Effort:** 3-4 days
**Target:** Week 3 (Jan 29 - Feb 4)
**Depends On:** Epic 002, 003 (AI Processing)

---

## Overview

Implement AI-powered email draft generation with customizable tone and template support.

---

## Goals

1. Generate AI-drafted email responses
2. Support multiple tones (professional, casual, brief, detailed)
3. Template library for common responses
4. Draft review and editing workflow
5. Send emails via SMTP/SendGrid

---

## Technical Requirements

### Draft Generation Service

```python
class EmailAutomationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.ai_service = AIService()

    async def generate_draft(
        self,
        email_id: int,
        tone: str = "professional",
        instructions: str = None,
    ) -> EmailDraft:
        """Generate email response draft"""
        email = await self.session.get(Email, email_id)

        # Get context (email thread, user preferences)
        context = await self._build_context(email)

        # Generate draft with AI
        draft_content = await self.ai_service.generate_email_response(
            email=email,
            tone=tone,
            instructions=instructions,
            context=context,
        )

        # Store draft
        draft = EmailDraft(
            email_id=email_id,
            user_id=email.user_id,
            content=draft_content,
            tone=tone,
            status="draft",
        )

        self.session.add(draft)
        await self.session.commit()
        return draft
```

### API Endpoints

```python
@router.post("/emails/{email_id}/draft")
async def generate_draft(email_id: int, tone: str = "professional"):
    """Generate response draft"""

@router.get("/drafts")
async def list_drafts():
    """List all drafts"""

@router.post("/drafts/{draft_id}/send")
async def send_draft(draft_id: int):
    """Send email from draft"""
```

---

## Acceptance Criteria

- [ ] Draft generation produces usable responses (80%+ acceptance)
- [ ] Support multiple tones
- [ ] Template library with 5+ common responses
- [ ] Draft editing workflow
- [ ] Send emails via SMTP
- [ ] Tests with mocked AI

---

**Epic Owner:** SCAR
**Estimated Completion:** 2026-02-04
