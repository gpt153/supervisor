# Epic 003: AI Processing Pipeline

**Status:** Ready
**Priority:** Critical
**Estimated Effort:** 4-5 days
**Target:** Week 2 (Jan 22-28)
**Depends On:** Epic 002 (Email Ingestion)

---

## Overview

Implement AI-powered email analysis using Claude/GPT-4 to categorize emails, assign priority scores, generate summaries, and extract action items.

---

## Goals

1. Analyze emails with AI (categorization, priority, summary)
2. Use structured outputs (Pydantic models) for type safety
3. Batch processing for efficiency
4. Caching to reduce API costs
5. Error handling and retry logic

---

## Technical Requirements

### AI Service (`src/odin/services/ai_service.py`)

```python
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

class EmailAnalysis(BaseModel):
    """Structured email analysis output"""
    category: str = Field(description="Email category: work, personal, spam, newsletter, action_required, fyi")
    priority: int = Field(description="Priority 1-5 (5=urgent, 1=low)", ge=1, le=5)
    summary: str = Field(description="1-2 sentence summary of email")
    action_items: list[str] = Field(description="List of action items/tasks from email")
    sentiment: str = Field(description="Overall sentiment: positive, neutral, negative, urgent")

class AIService:
    def __init__(self):
        self.llm = ChatAnthropic(
            model="claude-sonnet-4-5-20250929",
            api_key=settings.ANTHROPIC_API_KEY,
            temperature=0.3,
        )
        self.structured_llm = self.llm.with_structured_output(EmailAnalysis)

    async def analyze_email(self, email: Email) -> EmailAnalysis:
        """Analyze email with AI"""
        prompt = f"""Analyze this email:

From: {email.sender}
Subject: {email.subject}
Body: {email.body}

Provide structured analysis."""

        result = await self.structured_llm.ainvoke(prompt)
        return result
```

### Email Processing Service

Update `EmailService` to include AI analysis:

```python
async def process_email_with_ai(self, email_id: int) -> Email:
    """Process email with AI analysis"""
    email = await self.session.get(Email, email_id)

    ai_service = AIService()
    analysis = await ai_service.analyze_email(email)

    # Update email with AI analysis
    email.category = analysis.category
    email.priority = analysis.priority
    email.summary = analysis.summary
    email.metadata_["action_items"] = analysis.action_items
    email.metadata_["sentiment"] = analysis.sentiment

    await self.session.commit()
    return email
```

### Celery Task for Batch Processing

```python
@celery_app.task(name="process_emails_batch")
def process_emails_batch_task(email_ids: list[int]) -> dict:
    """Process multiple emails with AI in batch"""
    async def _process():
        async with SessionLocal() as session:
            service = EmailService(session)
            processed = 0
            for email_id in email_ids:
                try:
                    await service.process_email_with_ai(email_id)
                    processed += 1
                except Exception as e:
                    logging.error(f"Failed to process email {email_id}: {e}")

            return {"processed": processed, "total": len(email_ids)}

    return asyncio.run(_process())
```

---

## Acceptance Criteria

- [ ] Email categorization 90%+ accurate
- [ ] Priority scoring 85%+ accurate (user validation)
- [ ] Summaries generated for emails >200 words
- [ ] Action items extracted correctly
- [ ] Batch processing handles 100+ emails
- [ ] Retry logic for API failures (3 retries with exponential backoff)
- [ ] Caching implemented (don't re-analyze same email)
- [ ] API endpoint to trigger re-analysis
- [ ] Tests with mocked AI responses

---

**Epic Owner:** SCAR
**Estimated Completion:** 2026-01-26
