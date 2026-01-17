# ADR 002: Python + FastAPI Tech Stack

**Date:** 2026-01-15
**Status:** Accepted
**Deciders:** Samuel

---

## Context

Need to choose primary tech stack for Odin's backend. Requirements:
- AI/ML integration (LLMs, embeddings, NLP)
- Async I/O for performance
- Strong type safety
- Fast development velocity
- Good library ecosystem for email, calendar, task integrations

### Options Considered

1. **Python + FastAPI**
2. **Node.js + TypeScript + Express**
3. **Python + Flask**
4. **Go + Gin**

---

## Decision

**We will use Python 3.11+ with FastAPI as our backend stack.**

### Full Stack
- **Language:** Python 3.11+
- **Web Framework:** FastAPI
- **Database:** PostgreSQL with pgvector
- **ORM:** SQLAlchemy 2.0 (async)
- **Task Queue:** Celery + Redis
- **AI Libraries:** LangChain, OpenAI SDK, Anthropic SDK, sentence-transformers
- **Testing:** pytest with pytest-asyncio
- **Code Quality:** black, ruff, mypy (strict mode)

---

## Rationale

### AI/ML Ecosystem (Critical Factor)
- **Best AI library support:** LangChain, Hugging Face, OpenAI SDK all Python-first
- **sentence-transformers:** Python-only, needed for embeddings
- **Rich AI ecosystem:** Pandas, NumPy for data processing
- **Future ML:** If we want custom models, Python is essential

### FastAPI Benefits
- **Modern async framework:** Built on Starlette + Pydantic
- **Automatic API docs:** OpenAPI/Swagger out of the box
- **Type safety:** Pydantic models catch errors at runtime
- **Performance:** Comparable to Node.js (uvicorn ASGI server)
- **Developer experience:** Auto-completion, clear errors, fast iteration

### Type Safety
- **mypy strict mode:** Catch type errors before runtime
- **Pydantic:** Runtime validation with clear error messages
- **Better than Flask:** Flask lacks native async + type safety

### Async Support
- **Native async/await:** FastAPI designed for async
- **SQLAlchemy async:** First-class async ORM support
- **Celery integration:** Mature async task queue

### Library Ecosystem
- **imap-tools:** Easy email fetching
- **google-api-python-client:** Calendar integration
- **todoist-api-python:** Task sync
- **Mature libraries:** Python has libraries for everything

---

## Consequences

### Positive
- ✅ Excellent AI/ML library support
- ✅ Fast development with FastAPI
- ✅ Strong type safety (mypy + Pydantic)
- ✅ Good performance (async I/O)
- ✅ Large community and ecosystem
- ✅ Easy integration with AI services
- ✅ Future-proof for ML work

### Negative
- ❌ Python global interpreter lock (GIL) for CPU-bound tasks
- ❌ Slower than Go for pure performance
- ❌ Larger memory footprint than Node.js
- ❌ Package management can be complex (pip/poetry/conda)

### Mitigations
- Use async for I/O-bound operations (99% of our workload)
- Celery for background CPU-bound tasks (sidesteps GIL)
- Use uvicorn workers for multi-core support
- Docker for consistent environments

---

## Alternatives Rejected

### Node.js + TypeScript
- **Good:** Great async support, fast, TypeScript type safety
- **Rejected:** AI/ML ecosystem weaker, sentence-transformers not available
- Would need to call Python services for ML work (added complexity)

### Flask
- **Good:** Simple, mature, large ecosystem
- **Rejected:** No native async support, slower than FastAPI, less modern
- Lacks automatic API docs and Pydantic integration

### Go
- **Good:** Excellent performance, compiled, strong concurrency
- **Rejected:** AI/ML ecosystem minimal, slower development
- Would struggle with NLP/ML tasks

---

## References

- FastAPI documentation: https://fastapi.tiangolo.com
- SQLAlchemy 2.0 async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- Python AI ecosystem comparison

---

**Status:** Accepted and implemented in MVP
