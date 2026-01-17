# Epic 004: Semantic Search

**Status:** Ready
**Priority:** High
**Estimated Effort:** 3-4 days
**Target:** Week 2 (Jan 22-28)
**Depends On:** Epic 002 (Email Ingestion)

---

## Overview

Implement semantic search using pgvector to enable natural language queries across all stored emails and documents.

---

## Goals

1. Generate vector embeddings for all email content
2. Store embeddings in pgvector column
3. Implement semantic search API
4. Optimize search performance (<2s response time)
5. Support filters (date, sender, category)

---

## Technical Requirements

### Embedding Service (`src/odin/services/embedding_service.py`)

```python
from sentence_transformers import SentenceTransformer
import numpy as np

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

    def embed_text(self, text: str) -> list[float]:
        """Generate embedding for text"""
        embedding = self.model.encode(text)
        return embedding.tolist()

    def embed_email(self, email: Email) -> list[float]:
        """Generate embedding for email (subject + body)"""
        text = f"{email.subject} {email.body}"
        return self.embed_text(text)
```

### Search Service (`src/odin/services/search_service.py`)

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

class SearchService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.embedding_service = EmbeddingService()

    async def semantic_search(
        self,
        query: str,
        limit: int = 20,
        filters: dict = None,
    ) -> list[Email]:
        """Search emails using semantic similarity"""

        # Generate query embedding
        query_embedding = self.embedding_service.embed_text(query)

        # Build query with vector similarity
        stmt = (
            select(Email)
            .order_by(Email.embedding.cosine_distance(query_embedding))
            .limit(limit)
        )

        # Apply filters
        if filters:
            if "category" in filters:
                stmt = stmt.where(Email.category == filters["category"])
            if "sender" in filters:
                stmt = stmt.where(Email.sender.ilike(f"%{filters['sender']}%"))

        result = await self.session.execute(stmt)
        return result.scalars().all()
```

### API Endpoint (`src/odin/api/routes/search.py`)

```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/search", tags=["search"])

class SearchRequest(BaseModel):
    query: str
    limit: int = 20
    filters: dict = {}

@router.post("")
async def search(
    request: SearchRequest,
    session: AsyncSession = Depends(get_db),
):
    """Semantic search across emails"""
    service = SearchService(session)
    results = await service.semantic_search(
        query=request.query,
        limit=request.limit,
        filters=request.filters,
    )

    return {
        "query": request.query,
        "count": len(results),
        "results": [
            {
                "id": email.id,
                "sender": email.sender,
                "subject": email.subject,
                "summary": email.summary,
                "priority": email.priority,
                "relevance_score": float(email.embedding.cosine_distance(query_embedding)),
            }
            for email in results
        ],
    }
```

### Background Task: Generate Embeddings

```python
@celery_app.task(name="generate_embeddings")
def generate_embeddings_task(email_ids: list[int]) -> dict:
    """Generate embeddings for emails"""
    async def _generate():
        async with SessionLocal() as session:
            service = EmbeddingService()
            generated = 0

            for email_id in email_ids:
                email = await session.get(Email, email_id)
                if email and not email.embedding:
                    embedding = service.embed_email(email)
                    email.embedding = embedding
                    generated += 1

            await session.commit()
            return {"generated": generated}

    return asyncio.run(_generate())
```

---

## Acceptance Criteria

- [ ] Embeddings generated for all emails
- [ ] Search returns relevant results (<2s response time)
- [ ] HNSW index created for performance
- [ ] Natural language queries work ("emails about project deadline")
- [ ] Filters work (category, sender, date range)
- [ ] Relevance scores accurate
- [ ] Tests with sample queries

---

**Epic Owner:** SCAR
**Estimated Completion:** 2026-01-26
