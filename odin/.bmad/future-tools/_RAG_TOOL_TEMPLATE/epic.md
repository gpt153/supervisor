# Epic: [RAG Tool Name]

**Epic ID:** tool-XXX-[name]
**Created:** [Date]
**Status:** Planned (Not in Active Build)
**Complexity Level:** [3-5] (RAG tools are inherently complex)
**Category:** RAG / Semantic Search / Knowledge Management

---

**⚠️ IMPORTANT:** This is a **RAG tool epic** using proven best practices. It will NOT be built until:
1. You move this file to `.bmad/epics/` and renumber it
2. You create a GitHub issue in gpt153/odin
3. You tell the supervisor to build it

---

## Project Context

- **Project:** Odin
- **Repository:** https://github.com/gpt153/odin
- **Tech Stack:** Python 3.11+, FastAPI, PostgreSQL + pgvector, Docker
- **RAG Framework:** [Specify: MCP Server / Embedded Service / API]
- **Related Epics:**
  - Depends on: Epic 001 (Project Foundation), Epic 004 (Semantic Search base)
  - Integrates with: [Which existing RAG systems or knowledge sources?]

---

## RAG Architecture Decision

**⚠️ CRITICAL: Choose ONE RAG deployment pattern:**

### Option A: MCP Server (Recommended for External Knowledge)
✅ Use when: Accessing external data sources (web, files, APIs)
✅ Benefits: Isolation, reusability across AI clients, containerized
✅ Example: Crawl4AI RAG MCP, File system indexer MCP

### Option B: Embedded RAG Service (Recommended for Core Features)
✅ Use when: Core Odin functionality, tightly integrated with other services
✅ Benefits: Lower latency, direct database access, simpler deployment
✅ Example: Email semantic search, Task priority scoring

### Option C: Hybrid Approach
✅ Use when: Need both external access (MCP) and internal integration
✅ Pattern: MCP server + internal RAG service sharing same vector DB

**Selected Approach:** [Choose A, B, or C and explain why]

---

## Business Context

### Problem Statement

[What knowledge management problem does this solve?]

**Without this RAG system:**
- [Pain point 1 - e.g., "Cannot find relevant emails from 6 months ago"]
- [Pain point 2 - e.g., "No understanding of semantic relationships"]
- [Pain point 3 - e.g., "Manual search is slow and keyword-based"]

### User Value

**JARVIS-like Intelligence:**
```
User: "What did I decide about the database architecture last week?"

Odin (with RAG):
→ Searches vector embeddings of all emails, notes, conversations
→ Finds semantically similar content (not just keyword "database")
→ Returns: "Last Thursday you chose PostgreSQL + pgvector because..."
→ Cites sources: Email from architect, your notes, Slack conversation

Without RAG:
→ "I don't have access to your past conversations"
```

### Success Metrics

- **Retrieval Precision:** Top 5 results contain answer >90% of queries
- **Latency:** <500ms for search queries (including embedding generation)
- **Recall:** Finds relevant information >85% of the time
- **User Satisfaction:** "Found what I needed" >90% in user testing

---

## RAG Best Practices Implementation

### 1. Chunking Strategy (Cole Medin: Context 7-Inspired)

**⚠️ CRITICAL: DO NOT use naive fixed-size chunking**

**Recommended Approach:**
- **Semantic Chunking:** Split by headers, paragraphs, natural boundaries
- **Code-Aware Chunking:** Preserve code blocks intact (≥300 chars)
- **Context Preservation:** Include surrounding context for each chunk
- **Size Guidelines:**
  - Min: 100 tokens (too small = loses context)
  - Max: 512 tokens (too large = dilutes semantic meaning)
  - Optimal: 200-300 tokens

**Implementation:**
```python
def chunk_document(content: str, content_type: str) -> List[Chunk]:
    if content_type == "code":
        # Preserve code blocks with surrounding context
        return extract_code_blocks_with_context(content, min_size=300)
    elif content_type == "markdown":
        # Split by headers (h1, h2, h3)
        return split_by_semantic_boundaries(content, max_tokens=300)
    else:
        # Intelligent paragraph splitting
        return split_by_paragraphs(content, target_tokens=250)
```

### 2. Embedding Strategy

**Model Selection:**
- **Recommended:** OpenAI `text-embedding-3-small` (1536 dimensions, fast, cheap)
- **Alternative:** `nomic-embed-text` (local, privacy-first, 768 dimensions)
- **For Code:** Consider code-specific models like `codesage-small`

**Batch Processing:**
- Process embeddings in batches of 100-500 documents
- Implement retry logic with exponential backoff
- Cache embeddings to avoid re-computation

**Implementation Pattern:**
```python
async def generate_embeddings(texts: List[str]) -> List[Vector]:
    BATCH_SIZE = 500
    embeddings = []

    for batch in chunk_list(texts, BATCH_SIZE):
        try:
            response = await openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=batch
            )
            embeddings.extend([e.embedding for e in response.data])
        except RateLimitError:
            await asyncio.sleep(exponential_backoff())
            # Retry logic

    return embeddings
```

### 3. Retrieval Strategies (Composable)

**⚠️ IMPORTANT: Enable strategies based on use case, not all at once**

#### Strategy 1: Hybrid Search (RECOMMENDED - Always Enable)
```python
async def hybrid_search(query: str, k: int = 10) -> List[Result]:
    # Parallel execution
    vector_results = await vector_search(query, k=k*2)
    keyword_results = await full_text_search(query, k=k*2)

    # Reciprocal Rank Fusion (RRF)
    combined = reciprocal_rank_fusion(
        vector_results,
        keyword_results,
        k=k
    )

    return combined[:k]
```

**Why:** Addresses cases where exact terminology matters (e.g., "OAuth 2.0") alongside semantic similarity

#### Strategy 2: Contextual Embeddings (Enable for Complex Documents)
```python
async def generate_contextual_embedding(chunk: str, full_doc: str) -> Vector:
    # Enrich chunk with document context via LLM
    enriched_context = await llm.complete(
        f"Document: {full_doc}\n\nSection: {chunk}\n\n"
        f"Generate a summary that captures both the section content "
        f"and how it relates to the broader document:"
    )

    # Embed the enriched context
    embedding = await embed(enriched_context)

    # Store both original chunk + enriched context
    return embedding
```

**When to use:** Complex technical documents, long-form content
**Cost:** Adds LLM call per chunk during indexing (slow, expensive)
**Benefit:** Significantly improves retrieval precision for nuanced queries

#### Strategy 3: Agentic RAG (Enable for Code-Heavy Content)
```python
async def index_code_examples(repo_content: str):
    # Extract code blocks ≥300 characters
    code_blocks = extract_code_blocks(repo_content, min_length=300)

    for block in code_blocks:
        # Get surrounding context
        context = get_surrounding_text(block, before=200, after=200)

        # Generate LLM summary
        summary = await llm.complete(
            f"Summarize this code:\n\n{block.code}\n\n"
            f"Context: {context}\n\nSummary:"
        )

        # Store in separate vector table for code search
        await store_code_example({
            "code": block.code,
            "summary": summary,
            "embedding": await embed(summary),
            "context": context
        })
```

**When to use:** Documentation with lots of code examples
**Benefit:** Specialized code search with natural language queries
**Implementation:** Separate `code_examples` table in vector DB

#### Strategy 4: Reranking (Enable for High-Precision Needs)
```python
async def rerank_results(query: str, results: List[Result]) -> List[Result]:
    # Use cross-encoder to rescore results
    reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

    pairs = [(query, r.content) for r in results]
    scores = reranker.predict(pairs)

    # Resort by reranker scores
    reranked = sorted(
        zip(results, scores),
        key=lambda x: x[1],
        reverse=True
    )

    return [r for r, _ in reranked]
```

**When to use:** When precision > recall (e.g., customer support)
**Cost:** Adds ~50-100ms per query
**Benefit:** Improves top-5 precision by 10-20%

### 4. Vector Database: pgvector Best Practices

**Schema Design:**
```sql
CREATE TABLE knowledge_chunks (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR,           -- Links to original document
    source_type VARCHAR,          -- "email" | "note" | "doc" | "code"
    content TEXT,                 -- Original chunk text
    enriched_context TEXT,        -- Optional: contextual embedding text
    embedding vector(1536),       -- OpenAI text-embedding-3-small
    metadata JSONB,               -- Flexible metadata (date, author, tags)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: HNSW index for fast similarity search
CREATE INDEX ON knowledge_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Full-text search index for hybrid search
CREATE INDEX knowledge_chunks_content_idx
ON knowledge_chunks
USING GIN (to_tsvector('english', content));

-- Source filtering index
CREATE INDEX knowledge_chunks_source_idx
ON knowledge_chunks (source_type, source_id);
```

**Query Pattern:**
```python
async def vector_search(
    query_embedding: List[float],
    source_filter: Optional[str] = None,
    k: int = 10
) -> List[Result]:

    query = """
        SELECT
            id,
            content,
            metadata,
            1 - (embedding <=> $1::vector) AS similarity
        FROM knowledge_chunks
        WHERE ($2::varchar IS NULL OR source_type = $2)
        ORDER BY embedding <=> $1::vector
        LIMIT $3
    """

    results = await db.fetch(query, query_embedding, source_filter, k)
    return results
```

### 5. Feature Flags & Configuration

**Environment Variables:**
```bash
# RAG Strategy Toggles
RAG_USE_HYBRID_SEARCH=true          # ALWAYS enable
RAG_USE_CONTEXTUAL_EMBEDDINGS=false # Enable for complex docs
RAG_USE_AGENTIC_RAG=false          # Enable for code-heavy content
RAG_USE_RERANKING=true             # Enable for high-precision needs

# Vector Database
VECTOR_DB_DIMENSIONS=1536           # Match embedding model
VECTOR_DB_METRIC=cosine            # cosine | l2 | ip

# Retrieval Parameters
RAG_TOP_K=10                       # Number of results to return
RAG_SIMILARITY_THRESHOLD=0.7       # Minimum similarity score

# Chunking
RAG_CHUNK_SIZE=300                 # Target tokens per chunk
RAG_CHUNK_OVERLAP=50               # Overlap between chunks
```

### 6. Observability & Monitoring

**Metrics to Track:**
```python
# Latency
- embedding_generation_ms
- vector_search_ms
- reranking_ms (if enabled)
- total_query_latency_ms

# Quality
- retrieval_precision_at_5
- retrieval_recall
- user_satisfaction_score

# Usage
- queries_per_second
- documents_indexed_per_day
- vector_db_size_mb
```

**Logging:**
```python
logger.info("RAG query", extra={
    "query": query,
    "top_k": k,
    "strategies_enabled": {
        "hybrid_search": True,
        "contextual_embeddings": False,
        "reranking": True
    },
    "results_count": len(results),
    "latency_ms": latency,
    "top_similarity_score": results[0].score
})
```

---

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Document ingestion and chunking (semantic boundaries)
- [ ] Embedding generation (OpenAI or local model)
- [ ] Vector storage in pgvector
- [ ] Hybrid search (vector + keyword fusion)
- [ ] Query interface (natural language → results)
- [ ] Source citations (always show where info came from)
- [ ] Metadata filtering (by date, source type, etc.)

**SHOULD HAVE:**
- [ ] Reranking for improved precision
- [ ] Incremental indexing (update embeddings on content change)
- [ ] Query caching (frequently asked questions)
- [ ] Monitoring dashboard (latency, precision metrics)

**COULD HAVE:**
- [ ] Contextual embeddings (for complex documents)
- [ ] Agentic RAG (for code-heavy content)
- [ ] Multi-modal support (images, PDFs with OCR)
- [ ] Query expansion (generate related queries)

**WON'T HAVE (this iteration):**
- Knowledge graphs (complex, future enhancement)
- Multi-language support (English only for now)
- Real-time collaborative indexing

### Non-Functional Requirements

**Performance:**
- Embedding generation: <100ms per document (batch processing)
- Vector search: <200ms for top-10 results
- Reranking (if enabled): <100ms overhead
- Total query latency: <500ms end-to-end

**Scalability:**
- Support 100k+ documents in vector DB
- Handle 10+ concurrent search queries
- Index 1000+ documents per hour

**Quality:**
- Retrieval precision@5: >90%
- Retrieval recall: >85%
- User satisfaction: >90% "found what I needed"

---

## Implementation Tasks

### Phase 1: Foundation

**Issue 1: Setup pgvector schema and indexes**
- Create `knowledge_chunks` table with vector column
- Add HNSW index for vector similarity
- Add GIN index for full-text search
- Migration script
- **Acceptance:** Can store and query vectors efficiently

**Issue 2: Implement chunking strategy**
- Semantic chunking for markdown/text
- Code-aware chunking (preserve code blocks)
- Context preservation
- Unit tests for chunking logic
- **Acceptance:** Chunks are semantically meaningful, 200-300 tokens

**Issue 3: Embedding generation service**
- OpenAI embedding API integration
- Batch processing (500 docs at a time)
- Retry logic with exponential backoff
- Caching to avoid re-embedding
- **Acceptance:** Can generate embeddings for 1000 docs in <60s

### Phase 2: Retrieval

**Issue 4: Vector similarity search**
- pgvector cosine similarity queries
- Top-K retrieval
- Similarity threshold filtering
- **Acceptance:** Returns relevant results in <200ms

**Issue 5: Hybrid search implementation**
- Full-text search (PostgreSQL tsvector)
- Reciprocal Rank Fusion (RRF)
- Parallel execution of vector + keyword search
- **Acceptance:** Hybrid search outperforms pure vector search by 10%+

**Issue 6: Reranking module**
- Cross-encoder integration (`ms-marco-MiniLM-L-6-v2`)
- Rescore top-K results
- Latency optimization
- **Acceptance:** Improves precision@5 by 10-15%

### Phase 3: Advanced Features (Optional)

**Issue 7: Contextual embeddings** (if enabled)
- LLM-based context enrichment
- Store both original + enriched embeddings
- **Acceptance:** Improves recall for nuanced queries

**Issue 8: Agentic RAG** (if code-heavy)
- Code block extraction
- Separate code examples table
- Specialized code search
- **Acceptance:** Natural language code search works

### Phase 4: Integration & Monitoring

**Issue 9: API endpoints**
- `/search` - Natural language query
- `/index` - Add new documents
- `/reindex` - Update existing embeddings
- **Acceptance:** API documented, tested, deployed

**Issue 10: Monitoring & observability**
- Prometheus metrics (latency, precision)
- Structured logging
- Query analytics dashboard
- **Acceptance:** Can track RAG performance over time

### Estimated Effort

- **Phase 1 (Foundation):** 20 hours
- **Phase 2 (Retrieval):** 24 hours
- **Phase 3 (Advanced):** 16 hours (optional)
- **Phase 4 (Integration):** 12 hours
- **Total:** 56-72 hours (~1.5-2 weeks)

---

## Acceptance Criteria

### Feature-Level:

- [ ] Can ingest and chunk documents semantically
- [ ] Generates embeddings in batches (<100ms per doc)
- [ ] Stores vectors in pgvector with HNSW index
- [ ] Hybrid search (vector + keyword) works
- [ ] Reranking improves top-5 precision
- [ ] Query latency <500ms end-to-end
- [ ] Retrieval precision >90%, recall >85%
- [ ] Source citations always provided

### Code Quality:

- [ ] Type-safe Python (mypy strict mode)
- [ ] Comprehensive error handling
- [ ] Unit tests for chunking, embedding, retrieval
- [ ] Integration tests for end-to-end RAG flow
- [ ] Performance tests (latency, throughput)

### Documentation:

- [ ] Architecture diagram (chunking → embedding → storage → retrieval)
- [ ] API documentation (endpoints, parameters)
- [ ] Configuration guide (feature flags explained)
- [ ] Monitoring dashboard setup guide

---

## Testing Strategy

### Unit Tests
- Chunking logic (semantic boundaries, size constraints)
- Embedding generation (batch processing, caching)
- Vector search queries
- Reranking algorithm

### Integration Tests
- End-to-end RAG flow (document → chunk → embed → store → search)
- Hybrid search (verify RRF merging)
- Incremental indexing (update existing embeddings)

### E2E Tests

**Scenario 1: Knowledge Retrieval**
- Index 100 test documents
- Query: "How do I configure authentication?"
- Verify: Relevant docs in top-5 results
- Check: Latency <500ms

**Scenario 2: Code Search** (if agentic RAG enabled)
- Index code repository
- Query: "How to implement retry logic?"
- Verify: Code examples returned with context
- Check: Natural language query works

---

## Docker MCP Server Pattern (If MCP Approach)

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

ENV PYTHONUNBUFFERED=1

CMD ["python", "-m", "src.server"]
```

**MCP Server Manifest:**
```json
{
  "name": "[tool-name]-mcp",
  "version": "1.0.0",
  "transport": ["stdio", "sse"],
  "tools": [
    {
      "name": "search_knowledge",
      "description": "Semantic search across indexed knowledge",
      "parameters": {
        "query": "Natural language query",
        "source_filter": "Optional: email|note|doc|code",
        "top_k": "Number of results (default 10)"
      }
    },
    {
      "name": "index_document",
      "description": "Add new document to knowledge base",
      "parameters": {
        "content": "Document content",
        "source_type": "Document type (email|note|doc|code)",
        "metadata": "Optional metadata (author, date, tags)"
      }
    }
  ]
}
```

---

## References

- **Cole Medin RAG MCP:** [mcp-crawl4ai-rag](https://github.com/coleam00/mcp-crawl4ai-rag)
- **Docker MCP Gateway:** [docker/mcp-gateway](https://github.com/docker/mcp-gateway)
- **pgvector Documentation:** https://github.com/pgvector/pgvector
- **MCP Specification:** https://spec.modelcontextprotocol.io/

---

**Epic Status:** Planned (RAG Template - Not for Direct Use)
**Next Action:** Copy this template, fill in specifics for your RAG tool, promote to epics when ready
