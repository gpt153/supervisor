# Epic: Swedish Grant Discovery RAG

**Epic ID:** tool-005-swedish-grants-rag
**Created:** 2026-01-18
**Status:** Planned (Not in Active Build)
**Complexity Level:** 4 (Complex RAG with multi-source scraping)
**Category:** RAG / Semantic Search / Grant Discovery

---

**⚠️ IMPORTANT:** This is a **RAG tool epic** using proven best practices. It will NOT be built until:
1. You move this file to `.bmad/epics/` and renumber it
2. You create a GitHub issue in gpt153/odin
3. You tell the supervisor to build it

---

## Project Context

- **Project:** Odin
- **Repository:** https://github.com/gpt153/odin (MCP server in separate container)
- **Tech Stack:** Python 3.11+, FastAPI, PostgreSQL + pgvector, Docker, MCP SDK
- **RAG Framework:** MCP Server (containerized, isolated service)
- **Related Epics:**
  - Depends on: Epic 001 (Project Foundation)
  - Integrates with: Odin MCP client, conversational interface

---

## RAG Architecture Decision

**Selected Approach:** **A - MCP Server (Containerized RAG Service)**

**Reasoning:**
- **Infrequent but critical usage** - Users query once every few months, not daily
- **Heavy resources** - 15k+ grants, scraping jobs, embeddings shouldn't burden Odin core
- **Isolation benefits:**
  - Scraping can run independently (cron jobs don't affect Odin)
  - Large vector DB isolated from main Odin database
  - Can restart/update without affecting Odin
- **Reusability** - Other AI systems can use this MCP (not just Odin)
- **Scalability** - Spin up more resources for scraping periods independently
- **Latency acceptable** - Grants are research-intensive, 2-3 second response is fine

**Architecture:**
```
User Query → Odin (MCP Client) → Swedish Grants MCP Server → pgvector → Results
                                           ↓
                                    Dynamic Q&A Tool
                                           ↓
                                   Scraping Service (cron)
```

**MCP Server Container:**
- Standalone Docker container
- Own PostgreSQL + pgvector instance (isolated)
- Scraping cron jobs run within container
- Exposes MCP tools to Odin via stdio/SSE transport

---

## Business Context

### Problem Statement

**The Swedish grant landscape is fragmented and overwhelming:**

**Current Pain Points:**
1. **Scattered Sources:** Grants spread across Stora Fondboken, kommunala websites, statliga myndigheter, EU portals
2. **Manual Research:** Users spend hours searching multiple websites
3. **Missed Opportunities:** Eligible grants go undiscovered due to poor search/awareness
4. **Complex Eligibility:** Each grant has unique criteria (location, entity type, purpose, size)
5. **Language Barriers:** Many EU grants in English, need Swedish translation/context
6. **Time Sensitivity:** Grants have deadlines, users miss them without tracking

### User Value

**JARVIS-like Grant Intelligence:**

```
User: "I run a small non-profit for youth sports in Stockholm, need 100k SEK for equipment"

Odin (with Grant RAG):
→ "I found 7 matching grants. Let me ask a few questions to narrow it down:
   - How many active members do you have?
   - What's your annual turnover?
   - Is this equipment for training or competition?"

User: "30 members, 200k SEK turnover, training equipment"

Odin:
→ "Perfect! Here are your top matches:

   1. **RF-SISU Föreningsbidraget** (Deadline: March 15)
      - Up to 150k SEK for training equipment
      - Eligibility: ✅ Stockholm, ✅ Youth sports, ✅ <50 members
      - Application: Online via RF-SISU portal
      - Match Score: 95%

   2. **Stockholm Stad - Idrottsföreningsstöd** (Deadline: Feb 28)
      - Up to 75k SEK for sports associations
      - Eligibility: ✅ Stockholm-based, ✅ Youth focus
      - Application: Kommune portal
      - Match Score: 88%

   3. **Folkrörelsernas Idrottsrörelse** (Rolling basis)
      - Grants for grassroots sports
      - Eligibility: ✅ Non-profit, ✅ Training focus
      - Match Score: 82%

   Would you like help drafting applications?"
```

**Without Grant RAG:**
- User manually searches 10+ websites
- Misses kommun-specific grants
- Unsure about eligibility
- No prioritization or scoring

### Success Metrics

- **Recall:** Find >90% of eligible grants for a given query
- **Precision:** Top 5 results are relevant >85% of the time
- **Latency:** <2 seconds for query + dynamic Q&A
- **Coverage:** Index >10,000 grants across all sources
- **User Satisfaction:** "Found grants I didn't know about" >80%
- **Conversion:** Users apply to at least 1 grant >60%

---

## Data Sources (Swedish Grant Landscape)

### 1. Stora Fondboken (Primary National Source)
- **URL:** https://storafondboken.se/
- **Coverage:** 5000+ Swedish foundations and grant programs
- **Entity Types:** Privatpersoner, Företag, Föreningar
- **Scraping:** Annual full scrape, monthly delta updates
- **Challenges:** No API, requires web scraping
- **Key Fields:**
  - Grant name
  - Foundation name
  - Eligibility criteria (text-heavy, needs NLP)
  - Amount range
  - Application deadlines
  - Contact information
  - Purpose/focus areas

### 2. Kommunala Bidrag (290 Swedish Municipalities)
- **Example:** Stockholm Stad, Göteborg Stad, Malmö Stad
- **Coverage:** Highly variable, ~500-1000 total grants estimated
- **Scraping:** Quarterly (kommun websites change slowly)
- **Challenges:**
  - No centralized database
  - Each kommun has different website structure
  - Many PDFs (need OCR/parsing)
  - Some require login to see full info
- **Key Fields:**
  - Kommun name
  - Grant category (kultur, idrott, miljö, etc.)
  - Eligibility (often location-based)
  - Deadline
  - Application process

**Initial Target:** Top 20 largest kommuner (cover ~60% of Swedish population)

### 3. Statliga Bidrag (Government Grants)
- **Sources:**
  - Tillväxtverket (business grants)
  - Kulturrådet (culture/arts)
  - Folkhälsomyndigheten (health)
  - Energimyndigheten (sustainability)
  - Skolverket (education)
- **Coverage:** ~200-300 major programs
- **Scraping:** Quarterly (government programs are stable)
- **Challenges:**
  - Each agency has different portal
  - Some APIs available (prioritize these!)
  - Complex eligibility rules (often legal language)
- **Key Fields:**
  - Agency name
  - Program name
  - Funding amount
  - Eligibility (företag vs förening vs privatperson)
  - Application windows
  - Required documentation

### 4. EU-Bidrag (European Grants)
- **Sources:**
  - Horizon Europe (research/innovation)
  - Regional Development Funds
  - ESF+ (social fund)
  - LIFE (environment)
  - Creative Europe
- **Coverage:** ~100-150 programs relevant to Swedish entities
- **Scraping:** Bi-annual (EU programs update slowly)
- **Challenges:**
  - English language (translate to Swedish)
  - Complex multi-country rules
  - Large programs with sub-categories
- **Key Fields:**
  - Program name
  - Call deadline
  - Budget size
  - Geographic scope (EU-wide vs Nordic vs regional)
  - Eligibility (SMEs, research orgs, etc.)
  - Co-funding requirements

---

## RAG Best Practices Implementation

### 1. Chunking Strategy (Grant-Specific)

**⚠️ CRITICAL: Grants have structured + unstructured content**

**Chunking Approach:**
- **Structured Fields:** Store as metadata (not chunked)
  - Grant name, foundation, amount, deadline
  - Stored in JSONB metadata column
- **Unstructured Fields:** Chunk semantically
  - Eligibility criteria (long text)
  - Purpose/focus description
  - Application requirements

**Implementation:**
```python
def chunk_grant(grant_data: dict) -> List[Chunk]:
    chunks = []

    # Main grant description (1 chunk)
    main_chunk = {
        "content": f"{grant_data['name']} - {grant_data['description']}",
        "chunk_type": "main",
        "metadata": extract_metadata(grant_data)
    }
    chunks.append(main_chunk)

    # Eligibility criteria (semantic chunking if long)
    if len(grant_data['eligibility']) > 500:
        eligibility_chunks = split_by_semantic_boundaries(
            grant_data['eligibility'],
            max_tokens=300
        )
        for chunk in eligibility_chunks:
            chunks.append({
                "content": chunk,
                "chunk_type": "eligibility",
                "metadata": extract_metadata(grant_data)
            })
    else:
        # Store as single chunk if short
        chunks.append({
            "content": grant_data['eligibility'],
            "chunk_type": "eligibility",
            "metadata": extract_metadata(grant_data)
        })

    return chunks
```

**Chunk Size:**
- Target: 250 tokens per chunk
- Min: 100 tokens (preserve context)
- Max: 400 tokens (grant descriptions can be detailed)

### 2. Embedding Strategy

**Model Selection:**
- **Primary:** OpenAI `text-embedding-3-small` (1536 dimensions)
  - Supports Swedish language well
  - Fast and cost-effective
  - Proven for multilingual semantic search
- **Fallback:** Consider `paraphrase-multilingual-MiniLM-L12-v2` for local deployment

**Multilingual Considerations:**
- Most grants in Swedish (native embedding)
- EU grants in English → translate to Swedish before embedding
- Store original language + translation
- Embed Swedish version for consistent search

**Batch Processing:**
- Process 500 grants at a time
- Total corpus: ~15,000 grants → ~30 batches
- Estimated indexing time: ~45 minutes (initial load)

### 3. Retrieval Strategies (Composable)

**⚠️ CRITICAL: Grant discovery requires hybrid approach**

#### Strategy 1: Hybrid Search (ALWAYS ENABLED)
```python
async def search_grants(
    query: str,
    entity_type: Optional[str] = None,  # "privatperson" | "företag" | "förening"
    location: Optional[str] = None,      # Kommun or Län
    amount_min: Optional[int] = None,
    k: int = 10
) -> List[Grant]:

    # Parallel vector + keyword search
    vector_results = await vector_search(
        query=query,
        filters={
            "entity_type": entity_type,
            "location": location,
            "amount_min": amount_min
        },
        k=k*2
    )

    # Keyword search for exact grant names/foundations
    keyword_results = await full_text_search(
        query=query,
        filters={"entity_type": entity_type},
        k=k*2
    )

    # Reciprocal Rank Fusion
    combined = reciprocal_rank_fusion(
        vector_results,
        keyword_results,
        k=k
    )

    return combined[:k]
```

**Why Hybrid:**
- Users might search "RF-SISU" (exact foundation name) → keyword
- Users might search "youth sports training equipment" → semantic

#### Strategy 2: Dynamic Question Agent (CRITICAL FEATURE)
```python
async def grant_discovery_with_qa(
    initial_query: str,
    user_context: dict = {}
) -> ConversationFlow:

    # Step 1: Initial broad search
    initial_results = await search_grants(initial_query, k=50)

    # Step 2: Analyze results for common eligibility criteria
    missing_info = analyze_missing_eligibility_info(initial_results, user_context)

    # Step 3: Generate targeted questions
    if missing_info:
        questions = generate_followup_questions(missing_info)
        return {
            "action": "ask_questions",
            "questions": questions,
            "preliminary_count": len(initial_results)
        }

    # Step 4: If user_context is complete, filter and rank
    filtered_results = filter_by_eligibility(initial_results, user_context)
    ranked_results = rank_by_match_score(filtered_results, user_context)

    return {
        "action": "show_results",
        "grants": ranked_results[:10],
        "total_found": len(filtered_results)
    }

def generate_followup_questions(missing_info: List[str]) -> List[Question]:
    """
    Examples:
    - "What is your organization's annual turnover?"
    - "How many members/employees do you have?"
    - "What kommun/län are you located in?"
    - "Is this for a specific project or general operations?"
    """
    question_map = {
        "location": "What kommun or län are you based in?",
        "org_size": "How many members/employees do you have?",
        "turnover": "What is your annual turnover/budget (SEK)?",
        "purpose": "What will you use the grant for specifically?",
        "entity_type_confirm": "Are you a privatperson, företag, or förening?"
    }

    return [question_map[info] for info in missing_info if info in question_map]
```

**User Experience:**
```
User: "Need money for environmental project"

Odin: "I found 42 grants for environmental projects. To narrow it down:
       1. Are you a privatperson, företag, or förening?
       2. What kommun are you in?
       3. What type of environmental project? (e.g., energy, biodiversity, waste)"

User: "Förening, Stockholm, urban gardening"

Odin: "Perfect! Here are the top 5 matches..." [shows ranked results]
```

#### Strategy 3: Metadata Filtering (High Priority)
```python
# pgvector supports JSONB filtering
async def filter_by_metadata(
    results: List[Grant],
    filters: dict
) -> List[Grant]:

    query = """
        SELECT *
        FROM grants_vector
        WHERE
            ($1::varchar IS NULL OR metadata->>'entity_type' = $1)
            AND ($2::varchar IS NULL OR
                 metadata->>'location' LIKE '%' || $2 || '%')
            AND ($3::int IS NULL OR
                 (metadata->>'amount_max')::int >= $3)
            AND ($4::varchar IS NULL OR
                 metadata->>'source_category' = $4)
        ORDER BY embedding <=> $5::vector
        LIMIT 50
    """

    return await db.fetch(
        query,
        filters.get('entity_type'),
        filters.get('location'),
        filters.get('amount_min'),
        filters.get('source_category'),  # "kommunal" | "statlig" | "eu" | "foundation"
        query_embedding
    )
```

#### Strategy 4: Temporal Awareness (Grant Deadlines)
```python
async def filter_active_grants(results: List[Grant]) -> List[Grant]:
    """
    Only show grants that:
    - Have upcoming deadlines (not past)
    - Are currently accepting applications
    - Have rolling/open applications
    """
    today = datetime.now()

    active_grants = [
        g for g in results
        if g.metadata.get('deadline') is None  # Rolling basis
        or parse_date(g.metadata['deadline']) > today
    ]

    # Sort by deadline urgency
    return sorted(
        active_grants,
        key=lambda g: (
            parse_date(g.metadata.get('deadline'))
            if g.metadata.get('deadline')
            else datetime.max
        )
    )
```

### 4. Vector Database: pgvector Schema

**Schema Design:**
```sql
CREATE TABLE grants_vector (
    id SERIAL PRIMARY KEY,

    -- Source tracking
    source_id VARCHAR UNIQUE,              -- Original grant ID from source
    source_name VARCHAR,                   -- "Stora Fondboken" | "Stockholm Stad" | etc.
    source_category VARCHAR,               -- "kommunal" | "statlig" | "eu" | "foundation"
    source_url TEXT,                       -- Link to original grant page

    -- Content
    content TEXT,                          -- Chunked grant description/eligibility
    chunk_type VARCHAR,                    -- "main" | "eligibility" | "requirements"

    -- Embeddings
    embedding vector(1536),                -- OpenAI text-embedding-3-small

    -- Structured metadata (JSONB for flexibility)
    metadata JSONB,                        -- {
                                           --   "grant_name": "...",
                                           --   "foundation_name": "...",
                                           --   "entity_type": ["privatperson", "företag"],
                                           --   "location": ["Stockholm", "Nationwide"],
                                           --   "amount_min": 50000,
                                           --   "amount_max": 500000,
                                           --   "deadline": "2026-03-15",
                                           --   "focus_areas": ["youth", "sports", "education"],
                                           --   "language": "sv"
                                           -- }

    -- Temporal
    indexed_at TIMESTAMPTZ DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ,          -- Last time we confirmed grant is still active

    -- Full-text search
    content_tsv tsvector GENERATED ALWAYS AS (
        to_tsvector('swedish', content)
    ) STORED
);

-- Vector similarity index (HNSW)
CREATE INDEX grants_vector_embedding_idx
ON grants_vector
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Full-text search index
CREATE INDEX grants_vector_fts_idx
ON grants_vector
USING GIN (content_tsv);

-- Metadata indexes (frequently filtered fields)
CREATE INDEX grants_metadata_entity_idx
ON grants_vector USING GIN ((metadata->'entity_type'));

CREATE INDEX grants_metadata_location_idx
ON grants_vector USING GIN ((metadata->'location'));

CREATE INDEX grants_metadata_deadline_idx
ON grants_vector ((metadata->>'deadline'));

CREATE INDEX grants_source_category_idx
ON grants_vector (source_category);
```

**Separate Table for Grant Updates:**
```sql
CREATE TABLE grant_scrape_log (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR,
    scrape_started_at TIMESTAMPTZ,
    scrape_completed_at TIMESTAMPTZ,
    grants_found INT,
    grants_new INT,
    grants_updated INT,
    grants_removed INT,
    status VARCHAR,                        -- "success" | "failed" | "partial"
    error_message TEXT
);
```

### 5. Feature Flags & Configuration

**Environment Variables:**
```bash
# RAG Strategy Toggles
GRANT_RAG_USE_HYBRID_SEARCH=true          # ALWAYS enable
GRANT_RAG_USE_DYNAMIC_QA=true             # Enable conversational refinement
GRANT_RAG_USE_RERANKING=false             # Not needed for grants (metadata filtering is enough)
GRANT_RAG_FILTER_EXPIRED_GRANTS=true      # Hide past deadlines

# Data Sources (enable/disable specific sources)
GRANT_SOURCE_STORA_FONDBOKEN=true
GRANT_SOURCE_KOMMUNAL=true
GRANT_SOURCE_STATLIG=true
GRANT_SOURCE_EU=true

# Scraping Schedule (cron expressions)
GRANT_SCRAPE_STORA_FONDBOKEN_SCHEDULE="0 0 1 * *"     # Monthly (1st of month)
GRANT_SCRAPE_KOMMUNAL_SCHEDULE="0 0 1 */3 *"          # Quarterly
GRANT_SCRAPE_STATLIG_SCHEDULE="0 0 1 */3 *"           # Quarterly
GRANT_SCRAPE_EU_SCHEDULE="0 0 1 1,7 *"                # Bi-annual (Jan & Jul)

# Vector Database
GRANT_VECTOR_DB_DIMENSIONS=1536
GRANT_VECTOR_DB_METRIC=cosine

# Retrieval Parameters
GRANT_RAG_TOP_K=10
GRANT_RAG_SIMILARITY_THRESHOLD=0.65       # Lower than default (grants can be diverse)
GRANT_RAG_MAX_QUESTIONS=3                 # Max follow-up questions to ask

# Translation (for EU grants)
GRANT_TRANSLATE_EU_CONTENT=true
GRANT_TRANSLATION_SERVICE=openai          # "openai" | "google" | "deepl"
```

### 6. Observability & Monitoring

**Metrics to Track:**
```python
# Scraping Health
- scrape_success_rate (by source)
- grants_indexed_total
- grants_updated_last_24h
- scrape_duration_seconds

# Query Performance
- query_latency_ms (p50, p95, p99)
- embedding_generation_ms
- vector_search_ms
- total_end_to_end_latency_ms

# Quality Metrics
- results_returned_avg
- user_satisfaction_score (if feedback collected)
- click_through_rate (which grants users investigate)

# Coverage
- active_grants_count (non-expired)
- grants_by_source_category
- grants_by_entity_type
```

**Logging:**
```python
logger.info("Grant search query", extra={
    "query": query,
    "entity_type": entity_type,
    "location": location,
    "filters_applied": filters,
    "results_count": len(results),
    "latency_ms": latency,
    "top_similarity_score": results[0].score if results else None,
    "questions_asked": len(followup_questions)
})
```

---

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Scrape Stora Fondboken (5000+ grants)
- [ ] Scrape top 20 Swedish kommuner (~500 grants)
- [ ] Scrape major statliga agencies (Tillväxtverket, Kulturrådet, etc.)
- [ ] Index all grants in pgvector with metadata
- [ ] Hybrid search (vector + keyword)
- [ ] Dynamic question system (ask follow-up to narrow results)
- [ ] Filter by entity type (privatperson, företag, förening)
- [ ] Filter by location (kommun, län, nationwide)
- [ ] Filter by amount range
- [ ] Filter out expired grants (past deadlines)
- [ ] API endpoint: `/grants/search` (natural language query)
- [ ] API endpoint: `/grants/ask` (dynamic Q&A flow)
- [ ] Source citations (always link back to original grant page)

**SHOULD HAVE:**
- [ ] Scrape all 290 Swedish kommuner (comprehensive coverage)
- [ ] Scrape EU grant programs (Horizon, ESF+, LIFE)
- [ ] Automatic translation of EU grants (English → Swedish)
- [ ] Weekly scrape verification (check if grants still active)
- [ ] Grant deadline notifications (upcoming deadlines)
- [ ] Match scoring (% eligible based on user profile)
- [ ] Save user profiles (reuse context for future queries)
- [ ] Grant comparison feature (compare eligibility/amounts)

**COULD HAVE:**
- [ ] Application assistance (draft proposals using AI)
- [ ] Historical grant data (track past funding patterns)
- [ ] Grant success prediction (likelihood of approval)
- [ ] Multi-language support (English interface for internationals)
- [ ] Mobile app interface
- [ ] Email alerts for new matching grants

**WON'T HAVE (this iteration):**
- Actual application submission (just discovery + info)
- Financial modeling (ROI calculations)
- Community features (user reviews of grants)
- Integration with accounting systems

### Non-Functional Requirements

**Performance:**
- Initial indexing: <2 hours for full corpus (~15k grants)
- Incremental updates: <30 min per source
- Query latency: <2 seconds (including dynamic Q&A)
- Embedding generation: <100ms per grant
- Support 10+ concurrent users

**Scalability:**
- Handle 50,000+ grants (room for growth)
- 100+ queries per day
- Scrape 5000+ pages per source

**Quality:**
- Recall: >90% (find eligible grants)
- Precision: >85% (top results are relevant)
- Scraping accuracy: >95% (correctly extract grant data)
- Uptime: >99% for search API

**Data Freshness:**
- Stora Fondboken: Monthly updates
- Kommunal grants: Quarterly updates
- Statliga grants: Quarterly updates
- EU grants: Bi-annual updates

---

## Implementation Tasks

### Phase 1: MCP Server Infrastructure

**Issue 1: MCP server setup**
- Docker container with Python 3.11
- MCP SDK integration (stdio transport)
- Define 5 MCP tools (search_grants, answer_grant_question, get_grant_details, list_grant_sources, trigger_scrape)
- Health check endpoint
- docker-compose configuration with isolated database
- **Acceptance:** MCP server responds to tool calls from Odin

**Issue 2: Setup pgvector schema for grants**
- Create `grants_vector` table with JSONB metadata
- Add HNSW index for vector similarity
- Add GIN indexes for full-text + metadata filtering
- Create `grant_scrape_log` table
- Migration scripts (runs on container startup)
- **Acceptance:** Can store and query grant vectors with metadata filtering

**Issue 3: Web scraping framework**
- Choose library (Scrapy vs Beautiful Soup vs Playwright)
- Implement robust error handling (retries, timeouts)
- Rate limiting (respect robots.txt)
- HTML parsing utilities
- PDF extraction (for kommun grants)
- **Acceptance:** Can scrape 100 pages reliably without blocking

**Issue 4: Stora Fondboken scraper**
- Identify all grant listing pages
- Extract: name, foundation, eligibility, amount, deadline, contact
- Handle pagination
- Store raw HTML (for re-parsing if needed)
- **Acceptance:** Scrapes 5000+ grants from Stora Fondboken

### Phase 2: Expand Data Coverage

**Issue 5: Kommunal grant scrapers**
- **Tier 1 (Top 20 kommuner):**
  - Stockholm, Göteborg, Malmö, Uppsala, Linköping, etc.
- Per-kommun scraper configs (each site is different)
- PDF parsing for grant PDFs
- Handle login/protected pages (if needed)
- **Acceptance:** Scrapes 500+ grants from top 20 kommuner

**Issue 6: Statliga grant scrapers**
- Tillväxtverket API/web scraper
- Kulturrådet scraper
- Energimyndigheten scraper
- Folkhälsomyndigheten scraper
- Skolverket scraper
- **Acceptance:** Scrapes 200+ statliga grants

**Issue 7: EU grant scrapers**
- Horizon Europe call scraper
- ESF+ scraper
- LIFE program scraper
- Creative Europe scraper
- Translate to Swedish (OpenAI/DeepL)
- **Acceptance:** Scrapes 100+ EU grants with Swedish translations

### Phase 3: RAG Implementation

**Issue 8: Grant chunking and metadata extraction**
- Semantic chunking for long eligibility text
- Extract structured metadata (entity type, location, amount, deadline)
- Normalize location names (kommun → standard names)
- Normalize entity types
- **Acceptance:** All grants chunked semantically with clean metadata

**Issue 9: Embedding generation pipeline**
- OpenAI embedding integration
- Batch processing (500 grants at a time)
- Swedish language optimization
- Caching to avoid re-embedding
- **Acceptance:** Can embed 15k grants in <45 minutes

**Issue 10: Hybrid search implementation**
- Vector similarity search (pgvector)
- Full-text search (tsvector, Swedish language)
- Reciprocal Rank Fusion (RRF)
- Parallel execution
- **Acceptance:** Hybrid search outperforms pure vector by 15%+

**Issue 11: Metadata filtering**
- Filter by entity_type (privatperson, företag, förening)
- Filter by location (kommun, län, nationwide)
- Filter by amount_min / amount_max
- Filter by deadline (active grants only)
- Filter by source_category
- **Acceptance:** Can narrow 10k grants to 50 relevant in <200ms

### Phase 4: Dynamic Q&A System

**Issue 12: Eligibility analysis engine**
- Parse grant eligibility criteria
- Identify required user info (location, org size, turnover, etc.)
- Map eligibility to questions
- **Acceptance:** Correctly identifies missing user context

**Issue 13: Dynamic question generation**
- Generate contextual follow-up questions
- Rank questions by importance
- Limit to 3 questions max per round
- **Acceptance:** Questions are relevant and narrow down results >50%

**Issue 14: Conversational flow state management**
- Track user context across questions
- Update filters dynamically
- Re-rank results as context improves
- **Acceptance:** Multi-turn conversation refines results correctly

### Phase 5: API & Integration

**Issue 15: MCP tool implementation endpoints**
- `POST /grants/search` - Single-shot query
- `POST /grants/ask` - Dynamic Q&A flow
- `GET /grants/{id}` - Get grant details
- `GET /grants/sources` - List available sources
- **Acceptance:** API documented (OpenAPI), tested, deployed

**Issue 16: Match scoring algorithm**
- Calculate % match based on eligibility criteria met
- Rank grants by match score
- Show why grant matches (transparency)
- **Acceptance:** Match scores correlate with user satisfaction >80%

**Issue 17: Scraping scheduler**
- Cron jobs for each source (monthly, quarterly, bi-annual)
- Incremental updates (detect new/changed/removed grants)
- Notification on scraping failures
- **Acceptance:** Automated scraping runs on schedule without intervention

### Phase 6: Monitoring & Quality

**Issue 18: Observability dashboard**
- Prometheus metrics (query latency, scraping health)
- Grafana dashboard (grant coverage, search performance)
- Structured logging
- **Acceptance:** Can monitor RAG health in real-time

**Issue 19: Quality assurance tests**
- End-to-end test queries (known grants should be found)
- Scraping validation (spot-check grant data accuracy)
- Regression tests (prevent quality degradation)
- **Acceptance:** Quality metrics >90% precision, >85% recall

### Estimated Effort

- **Phase 1 (MCP Infrastructure):** 24 hours (includes MCP server setup + pgvector schema)
- **Phase 2 (Data Sources):** 40 hours (scraping is time-consuming)
- **Phase 3 (RAG Core):** 24 hours
- **Phase 4 (Dynamic Q&A):** 16 hours
- **Phase 5 (MCP Tools & Integration):** 16 hours (MCP-specific tool implementation + Odin integration)
- **Phase 6 (Monitoring):** 8 hours
- **Total:** ~128 hours (~3-4 weeks)

**Note:** MCP architecture adds ~8 hours vs embedded service, but provides better isolation and reusability.

---

## Acceptance Criteria

### Feature-Level:

- [ ] **MCP Server:** Runs as isolated Docker container
- [ ] **MCP Tools:** All 5 tools functional (search_grants, answer_grant_question, get_grant_details, list_grant_sources, trigger_scrape)
- [ ] **Odin Integration:** Can call MCP tools from Odin's Claude client
- [ ] Indexes >10,000 Swedish grants from 4+ sources
- [ ] Hybrid search (vector + keyword) functional
- [ ] Dynamic Q&A system asks relevant follow-up questions
- [ ] Filters by entity type, location, amount, deadline
- [ ] Match scoring shows % eligibility
- [ ] Query latency <2 seconds (end-to-end, including MCP communication)
- [ ] Recall >90%, Precision >85%
- [ ] Source citations always provided (link to original grant)
- [ ] Automated scraping runs on schedule (cron within container)
- [ ] Swedish language support (including translated EU grants)

### Code Quality:

- [ ] Type-safe Python (mypy strict mode)
- [ ] Comprehensive error handling (scraping failures, API errors)
- [ ] Unit tests for chunking, embedding, retrieval, filtering
- [ ] Integration tests for end-to-end RAG flow
- [ ] Scraping tests (mock responses, regression checks)

### Documentation:

- [ ] Architecture diagram (scraping → chunking → indexing → search)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Scraper configuration guide (add new sources)
- [ ] User guide (how to query grants effectively)
- [ ] Data source documentation (what's covered, update frequency)

---

## Testing Strategy

### Unit Tests
- Grant chunking (semantic boundaries, metadata extraction)
- Embedding generation (batch processing, caching)
- Hybrid search (RRF merging)
- Metadata filtering (JSONB queries)
- Dynamic Q&A (question generation, context tracking)

### Integration Tests
- End-to-end grant discovery flow (query → Q&A → results)
- Scraping pipeline (fetch → parse → store)
- Incremental updates (detect changes)

### E2E Test Scenarios

**Scenario 1: Non-profit sports association**
- Query: "We're a youth sports club in Stockholm, need 100k SEK for equipment"
- Expected: RF-SISU, Stockholm Stad grants in top 5
- Follow-up questions: Member count, turnover
- Verify: Match scores >80%

**Scenario 2: Small business (SME)**
- Query: "Tech startup in Göteborg, need funding for R&D"
- Expected: Tillväxtverket, Horizon Europe grants
- Follow-up questions: Company size, R&D focus area
- Verify: Filtered by företag entity type

**Scenario 3: Individual (privatperson)**
- Query: "Student needing scholarship for studies abroad"
- Expected: Foundation grants for education
- Follow-up questions: Field of study, country
- Verify: Only privatperson-eligible grants shown

**Scenario 4: Deadline urgency**
- Query: "Urgent grants with deadline in next 30 days"
- Expected: Grants sorted by deadline
- Verify: Expired grants filtered out

---

## Data Privacy & Legal Considerations

**⚠️ IMPORTANT: All grant data is publicly available**

**No Personal Data:**
- We scrape publicly available grant information
- No user PII stored (except optional saved profiles, with consent)
- Comply with GDPR for any user profiles

**Scraping Ethics:**
- Respect robots.txt
- Rate limiting (don't overload source servers)
- Cache aggressively (reduce redundant scraping)
- Attribute sources (always cite original grant pages)

**Copyright:**
- Grant descriptions are factual information (not copyrightable)
- Link to original sources (drive traffic to grant providers)
- Don't republish entire grant texts without permission

---

## MCP Server Implementation

### Docker Container Setup

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for scraping
RUN apt-get update && apt-get install -y \
    postgresql-client \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# MCP SDK
RUN pip install mcp anthropic-mcp-sdk

# Application code
COPY src/ ./src/
COPY scrapers/ ./scrapers/
COPY cron-jobs/ ./cron-jobs/

# Setup cron for scraping
COPY crontab /etc/cron.d/grant-scraper
RUN chmod 0644 /etc/cron.d/grant-scraper
RUN crontab /etc/cron.d/grant-scraper

ENV PYTHONUNBUFFERED=1

# Start both MCP server and cron
CMD cron && python -m src.mcp_server
```

**requirements.txt:**
```
fastapi==0.109.0
uvicorn==0.27.0
psycopg[binary]==3.1.17
pgvector==0.2.4
openai==1.12.0
httpx==0.26.0
beautifulsoup4==4.12.3
scrapy==2.11.0
pydantic==2.6.0
pydantic-settings==2.1.0
anthropic-mcp-sdk==0.1.0
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  swedish-grants-mcp:
    build: .
    container_name: swedish-grants-mcp
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@grants-db:5432/grants
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GRANT_RAG_USE_HYBRID_SEARCH=true
      - GRANT_RAG_USE_DYNAMIC_QA=true
      - GRANT_SOURCE_STORA_FONDBOKEN=true
      - GRANT_SOURCE_KOMMUNAL=true
      - GRANT_SOURCE_STATLIG=true
      - GRANT_SOURCE_EU=true
    volumes:
      - ./scraped-data:/app/data
      - ./logs:/app/logs
    depends_on:
      - grants-db
    ports:
      - "8080:8080"  # Optional: health check endpoint
    restart: unless-stopped

  grants-db:
    image: pgvector/pgvector:pg16
    container_name: grants-db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=grants
    volumes:
      - grants-pgdata:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5433:5432"  # Expose on different port to avoid conflicts
    restart: unless-stopped

volumes:
  grants-pgdata:
```

**crontab (scraping schedule):**
```cron
# Stora Fondboken - Monthly (1st of month at midnight)
0 0 1 * * /usr/local/bin/python /app/scrapers/stora_fondboken.py >> /app/logs/stora_fondboken.log 2>&1

# Kommunal grants - Quarterly (1st of Jan, Apr, Jul, Oct)
0 0 1 1,4,7,10 * /usr/local/bin/python /app/scrapers/kommunal.py >> /app/logs/kommunal.log 2>&1

# Statliga grants - Quarterly
0 0 1 1,4,7,10 * /usr/local/bin/python /app/scrapers/statliga.py >> /app/logs/statliga.log 2>&1

# EU grants - Bi-annual (1st of Jan and Jul)
0 0 1 1,7 * /usr/local/bin/python /app/scrapers/eu_grants.py >> /app/logs/eu_grants.log 2>&1

# Cleanup expired grants - Weekly (Sunday midnight)
0 0 * * 0 /usr/local/bin/python /app/scrapers/cleanup_expired.py >> /app/logs/cleanup.log 2>&1
```

### MCP Server Configuration

**MCP Server Manifest:**
```json
{
  "name": "swedish-grants-mcp",
  "version": "1.0.0",
  "description": "Discover Swedish grants (bidrag) for individuals, businesses, and associations",
  "transport": ["stdio", "sse"],
  "capabilities": {
    "tools": true,
    "prompts": false,
    "resources": false
  }
}
```

**MCP Tools Exposed:**

```python
# src/mcp_server.py
from mcp import Server, Tool
from mcp.server.stdio import stdio_server

app = Server("swedish-grants-mcp")

@app.tool()
async def search_grants(
    query: str,
    entity_type: Optional[str] = None,  # "privatperson" | "företag" | "förening"
    location: Optional[str] = None,      # Kommun or Län
    amount_min: Optional[int] = None,
    amount_max: Optional[int] = None,
    deadline_within_days: Optional[int] = None,
    top_k: int = 10
) -> dict:
    """
    Search for Swedish grants using natural language query.

    Args:
        query: Natural language description of grant needs
        entity_type: Filter by applicant type (privatperson, företag, förening)
        location: Filter by geographic location (kommun or län)
        amount_min: Minimum grant amount in SEK
        amount_max: Maximum grant amount in SEK
        deadline_within_days: Only show grants with deadline in next N days
        top_k: Number of results to return

    Returns:
        {
            "grants": [
                {
                    "id": "...",
                    "name": "RF-SISU Föreningsbidraget",
                    "foundation": "Riksidrottsförbundet",
                    "description": "...",
                    "amount_min": 50000,
                    "amount_max": 150000,
                    "deadline": "2026-03-15",
                    "eligibility": "...",
                    "entity_types": ["förening"],
                    "location": ["Stockholm", "Nationwide"],
                    "match_score": 0.95,
                    "source_url": "https://...",
                    "source_category": "statlig"
                }
            ],
            "total_found": 42,
            "followup_questions": [
                "How many members does your organization have?",
                "What is your annual turnover?"
            ]
        }
    """
    # Implementation: search_grants_logic()

@app.tool()
async def answer_grant_question(
    session_id: str,
    question: str,
    answer: str
) -> dict:
    """
    Continue dynamic Q&A conversation to refine grant results.

    Args:
        session_id: Unique conversation ID
        question: The question being answered
        answer: User's response

    Returns:
        {
            "grants": [...],  # Updated results based on new context
            "followup_questions": [...],  # More questions if needed
            "conversation_complete": false
        }
    """
    # Implementation: dynamic_qa_logic()

@app.tool()
async def get_grant_details(
    grant_id: str
) -> dict:
    """
    Get full details for a specific grant.

    Args:
        grant_id: Grant identifier from search results

    Returns:
        {
            "grant": {
                "name": "...",
                "full_description": "...",
                "eligibility_criteria": "...",
                "application_process": "...",
                "required_documents": [...],
                "contact_info": "...",
                "source_url": "..."
            }
        }
    """
    # Implementation: get_grant_details_logic()

@app.tool()
async def list_grant_sources() -> dict:
    """
    List all data sources and their last update times.

    Returns:
        {
            "sources": [
                {
                    "name": "Stora Fondboken",
                    "category": "foundation",
                    "grants_count": 5234,
                    "last_scraped": "2026-01-01T00:00:00Z",
                    "next_scrape": "2026-02-01T00:00:00Z",
                    "status": "healthy"
                }
            ]
        }
    """
    # Implementation: list_sources_logic()

@app.tool()
async def trigger_scrape(
    source_name: str,
    force: bool = False
) -> dict:
    """
    Manually trigger scraping for a specific source (admin tool).

    Args:
        source_name: "stora_fondboken" | "kommunal" | "statliga" | "eu"
        force: Force scrape even if recently updated

    Returns:
        {
            "status": "started",
            "job_id": "...",
            "estimated_completion": "2026-01-18T02:00:00Z"
        }
    """
    # Implementation: trigger_scrape_logic()

if __name__ == "__main__":
    stdio_server(app)
```

### Odin Integration (Client Side)

**Add to Odin's MCP config:**
```json
{
  "mcpServers": {
    "swedish-grants": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--network", "odin_network",
        "swedish-grants-mcp:latest"
      ],
      "env": {
        "DATABASE_URL": "postgresql://postgres:postgres@grants-db:5432/grants",
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

**Or use docker-compose exec for already-running container:**
```json
{
  "mcpServers": {
    "swedish-grants": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "swedish-grants-mcp",
        "python",
        "-m",
        "src.mcp_server"
      ]
    }
  }
}
```

### Example Usage from Odin

**Conversation Flow:**

```python
# User asks Odin
user: "I need grants for my youth sports club in Stockholm"

# Odin calls MCP tool
result = await mcp_client.call_tool(
    "swedish-grants",
    "search_grants",
    {
        "query": "youth sports club equipment funding",
        "entity_type": "förening",
        "location": "Stockholm"
    }
)

# MCP returns
{
    "grants": [...],  # Initial 10 results
    "total_found": 42,
    "followup_questions": [
        "How many members does your club have?",
        "What is your annual turnover in SEK?"
    ]
}

# Odin asks user the followup questions
odin: "Found 42 matching grants! To narrow it down:
       1. How many members does your club have?
       2. What is your annual turnover in SEK?"

user: "30 members, 200k turnover"

# Odin calls MCP again with answers
result = await mcp_client.call_tool(
    "swedish-grants",
    "answer_grant_question",
    {
        "session_id": "abc123",
        "question": "member_count",
        "answer": "30"
    }
)
# ... repeat for each answer

# Final results
odin: "Perfect! Here are your top 3 matches: [shows grants]"
```

### Deployment

**Initial Setup:**
```bash
# 1. Build container
docker-compose build

# 2. Start services
docker-compose up -d

# 3. Initialize database (auto-runs from init-db.sql)

# 4. Trigger initial scraping (populate database)
docker exec swedish-grants-mcp python -m scrapers.stora_fondboken
docker exec swedish-grants-mcp python -m scrapers.kommunal
docker exec swedish-grants-mcp python -m scrapers.statliga
docker exec swedish-grants-mcp python -m scrapers.eu_grants

# 5. Verify data
docker exec grants-db psql -U postgres -d grants -c "SELECT COUNT(*) FROM grants_vector;"

# 6. Add to Odin's MCP config
# Edit ~/.config/odin/mcp_servers.json
```

**Monitoring:**
```bash
# Check scraping logs
docker exec swedish-grants-mcp tail -f /app/logs/stora_fondboken.log

# Check MCP server health
curl http://localhost:8080/health

# Database stats
docker exec grants-db psql -U postgres -d grants -c \
  "SELECT source_category, COUNT(*) FROM grants_vector GROUP BY source_category;"
```

---

## Future Enhancements (Post-MVP)

### V2 Features
- [ ] Application drafting assistant (AI-generated proposals)
- [ ] Grant success prediction (ML model based on past approvals)
- [ ] Historical grant tracking (see past funding patterns)
- [ ] Email alerts (notify when new grants match user profile)
- [ ] Mobile app (iOS/Android)

### V3 Features
- [ ] Multi-country support (Nordic grants: Norway, Denmark, Finland)
- [ ] Community features (user reviews, success stories)
- [ ] Integration with accounting systems (budget planning)
- [ ] Bulk export (CSV/Excel for grant lists)

---

## References

- **Stora Fondboken:** https://storafondboken.se/
- **Tillväxtverket:** https://tillvaxtverket.se/
- **Kulturrådet:** https://www.kulturradet.se/
- **Stockholm Stad Bidrag:** https://start.stockholm/stod-och-bidrag/
- **Horizon Europe:** https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe_en
- **Cole Medin RAG Best Practices:** https://github.com/coleam00/mcp-crawl4ai-rag
- **pgvector:** https://github.com/pgvector/pgvector

---

**Epic Status:** Planned (Future Tool - Not in Active Build)
**Next Action:** Review epic, refine requirements, promote to active build when ready
