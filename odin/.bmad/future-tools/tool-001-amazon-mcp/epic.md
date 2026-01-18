# Epic: Amazon MCP Server

**Epic ID:** tool-001-amazon-mcp
**Created:** 2026-01-18
**Status:** Planned (Not in Active Build)
**Complexity Level:** 4/5

---

**⚠️ IMPORTANT:** This is a **future planning artifact**. It will NOT be built until:
1. You move this file to `.bmad/epics/` and renumber it
2. You create a GitHub issue in gpt153/odin
3. You tell the supervisor to build it

---

## Project Context

- **Project:** Odin
- **Repository:** https://github.com/gpt153/odin
- **Tech Stack:** Python 3.11+, FastAPI, MCP SDK, Docker
- **Related Epics:**
  - Depends on: Epic 016 (Multi-Platform Orchestration)
  - Blocks: Universal marketplace search orchestrator
- **Integration Points:** Docker MCP Gateway, PostgreSQL price tracker, unified product schema

## Business Context

### Problem Statement

Amazon is the world's largest e-commerce platform with millions of products. Users need to:
- Search for products quickly without leaving their AI assistant
- Track price changes over time to get best deals
- Compare products based on reviews, ratings, and specifications
- Get real-time availability and shipping information

Currently, users must manually visit Amazon, search, compare, and track prices separately. This creates friction and missed opportunities for savings.

### User Value

Users can now:
- "Find wireless keyboards under 500 SEK" → instant Amazon results with prices
- "Track price for ASIN B08XYZ123" → automatic notifications when price drops
- "Compare these two Amazon products" → side-by-side specs, reviews, pricing
- Get comprehensive product data enriched with AI analysis

**Real-World Scenario:**
```
User: "I need a new mechanical keyboard, ergonomic, under 1000 SEK"

Odin (via Amazon MCP):
1. Searches Amazon.se for mechanical keyboards
2. Filters by price < 1000 SEK, ergonomic features
3. Returns top 10 results with:
   - Current price + price history graph
   - Rating (4.5★ avg)
   - Review summary (AI-generated)
   - Shipping time (2-3 days Prime)
   - Availability (5 left in stock!)
4. User: "Track the Logitech one"
   → MCP adds to price tracker database
5. Next day: "Price dropped 15% to 799 SEK!"
```

### Success Metrics

- Can search Amazon catalog with 95%+ accuracy
- Price tracking updates every 6 hours
- Product details retrieved in < 2 seconds
- Unified schema compatibility with 100% of Amazon products
- Zero API rate limit violations

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Search products by keyword, category, price range
- [ ] Get detailed product information (title, price, rating, reviews, images)
- [ ] Track price history for specific products (ASIN)
- [ ] Support Amazon.se (Swedish marketplace)
- [ ] Return data in unified product schema
- [ ] Handle pagination for large result sets
- [ ] Authenticate via Amazon Product Advertising API credentials

**SHOULD HAVE:**
- [ ] Support multiple Amazon regions (US, UK, DE, etc.)
- [ ] Advanced filters (Prime-only, rating threshold, brand)
- [ ] Product comparison tool (side-by-side)
- [ ] Review sentiment analysis integration
- [ ] Price drop alerts via notifications

**COULD HAVE:**
- [ ] Best deal finder (lowest price across sellers)
- [ ] Amazon Warehouse deals integration
- [ ] Product availability predictions
- [ ] Sponsored product filtering

**WON'T HAVE (this iteration):**
- Amazon Affiliate link generation (legal complexity)
- Order placement (security risk)
- Account management features

### Non-Functional Requirements

**Performance:**
- Search response time: < 2 seconds
- Price tracker updates: Every 6 hours
- API rate limiting: 1 request/second (Amazon PA-API limit)
- Cache product details for 1 hour

**Security:**
- Amazon API credentials stored in Docker secrets
- No PII collection or storage
- HTTPS-only communication
- API key rotation support

**Reliability:**
- Graceful degradation if Amazon API is down
- Retry logic with exponential backoff
- Error messages returned in MCP-compliant format
- 99% uptime target

## Architecture

### Technical Approach

**MCP Server Implementation:**
- Python-based MCP server using `mcp-python-sdk`
- Docker container following Docker MCP Gateway architecture
- FastAPI for HTTP/SSE transport (optional)
- Stdio transport for Claude Desktop integration

**Amazon API Integration:**
- Use Amazon Product Advertising API 5.0 (official)
- Boto3 for AWS authentication
- Response caching with Redis (optional)
- Rate limiting with `ratelimit` library

**Data Storage:**
- PostgreSQL for price history tracking
- Unified product schema alignment
- Time-series data for price trends

### Integration Points

**Docker MCP Gateway:**
```yaml
# mcp-config.yaml
mcpServers:
  amazon:
    image: odin/amazon-mcp:latest
    environment:
      - AMAZON_ACCESS_KEY=${AMAZON_ACCESS_KEY}
      - AMAZON_SECRET_KEY=${AMAZON_SECRET_KEY}
      - AMAZON_PARTNER_TAG=${AMAZON_PARTNER_TAG}
      - DATABASE_URL=${DATABASE_URL}
    transport: stdio
```

**Odin Integration:**
- Odin discovers Amazon MCP via gateway
- Calls `search_products`, `get_product_details`, `track_price` tools
- Receives responses in unified schema
- Cross-marketplace orchestrator aggregates with other MCPs

### Data Flow

```
User Query
    ↓
Odin Core
    ↓
MCP Gateway
    ↓
Amazon MCP Server
    ↓
[Cache Check (Redis)]
    ↓
Amazon Product Advertising API
    ↓
Response → Unified Schema
    ↓
Store in PostgreSQL (price tracking)
    ↓
Return to Odin
    ↓
User receives enriched results
```

### Files to Create/Modify

```
odin/
├── mcp-servers/
│   └── amazon-mcp/
│       ├── src/
│       │   ├── server.py              # MCP server entry point
│       │   ├── client.py              # Amazon PA-API client
│       │   ├── tools/
│       │   │   ├── __init__.py
│       │   │   ├── search.py          # search_products tool
│       │   │   ├── details.py         # get_product_details tool
│       │   │   ├── price_tracker.py   # track_price tool
│       │   │   └── compare.py         # compare_products tool
│       │   ├── schemas/
│       │   │   ├── product.py         # Unified product schema
│       │   │   └── amazon_response.py # Amazon API response models
│       │   ├── database/
│       │   │   ├── models.py          # SQLAlchemy models
│       │   │   └── crud.py            # Price tracking queries
│       │   └── utils/
│       │       ├── rate_limiter.py
│       │       └── cache.py
│       ├── Dockerfile                 # Multi-stage build
│       ├── docker-compose.yml         # Local testing
│       ├── config.yaml                # MCP server config
│       ├── requirements.txt
│       ├── .env.example
│       └── tests/
│           ├── test_search.py
│           ├── test_details.py
│           ├── test_price_tracker.py
│           └── test_integration.py
└── docs/
    └── amazon-mcp-setup.md
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue 1: Amazon MCP Server Foundation**
- Set up MCP server using `mcp-python-sdk`
- Configure stdio transport
- Implement health check endpoint
- Create Dockerfile with multi-stage build
- Add Docker Compose for local development
- **Acceptance:** MCP server runs and responds to `tools/list` request

**Issue 2: Amazon Product Advertising API Client**
- Implement Boto3 client for PA-API 5.0
- Handle authentication with access key + secret
- Implement rate limiting (1 req/sec)
- Add retry logic with exponential backoff
- Cache responses (1-hour TTL)
- **Acceptance:** Can query Amazon API successfully with proper auth and rate limiting

**Issue 3: Search Products Tool**
- Implement `search_products` MCP tool
- Support keyword, category, price range filters
- Handle pagination (10 results per page)
- Map Amazon response to unified schema
- Add unit tests with mocked API responses
- **Acceptance:** User can search "wireless mouse" and get 10 results in unified format

**Issue 4: Product Details Tool**
- Implement `get_product_details` MCP tool
- Fetch by ASIN (Amazon Standard Identification Number)
- Include images, specs, reviews, rating
- Handle missing/incomplete data gracefully
- Add integration tests
- **Acceptance:** Can retrieve full product details for any valid ASIN

**Issue 5: Price Tracking System**
- Create PostgreSQL schema for price history
- Implement `track_price` MCP tool
- Background job to check prices every 6 hours
- Store time-series price data
- Add price trend analysis
- **Acceptance:** User can track product and see price history over time

**Issue 6: Product Comparison Tool**
- Implement `compare_products` MCP tool
- Side-by-side comparison of 2-5 products
- Highlight differences (price, rating, features)
- Generate AI-friendly comparison summary
- Add tests
- **Acceptance:** User can compare two ASINs and see clear differences

**Issue 7: Multi-Region Support**
- Add region configuration (SE, US, UK, DE, FR, etc.)
- Handle currency conversion
- Region-specific API endpoints
- Default to Amazon.se for Swedish users
- **Acceptance:** Can search Amazon US and Amazon SE with correct results

**Issue 8: Docker MCP Gateway Integration**
- Add MCP config to Docker Gateway
- Configure environment variables for secrets
- Test stdio transport compatibility
- Verify discovery by Odin core
- **Acceptance:** Odin discovers Amazon MCP and can call tools successfully

**Issue 9: Error Handling & Observability**
- Comprehensive error messages
- Structured logging (JSON format)
- Metrics for API calls, latency, errors
- Graceful degradation if API is down
- **Acceptance:** All error scenarios handled gracefully with informative messages

**Issue 10: Documentation & Testing**
- User guide for Amazon MCP setup
- API key generation instructions
- Integration testing suite
- Performance benchmarks
- Docker deployment guide
- **Acceptance:** New developer can set up and run Amazon MCP in < 30 minutes

### Estimated Effort

- **Phase 1 (Foundation):** 8 hours (Issues 1-2)
- **Phase 2 (Core Tools):** 16 hours (Issues 3-6)
- **Phase 3 (Advanced Features):** 12 hours (Issues 7-9)
- **Phase 4 (Polish):** 6 hours (Issue 10)
- **Total:** 42 hours (~1 week full-time)

## Acceptance Criteria

### Feature-Level Acceptance:

- [ ] Can search Amazon catalog by keyword
- [ ] Can get detailed product information by ASIN
- [ ] Can track prices for specific products
- [ ] Can compare multiple products side-by-side
- [ ] Supports Amazon.se and at least 2 other regions
- [ ] Price history stored and retrievable
- [ ] Performance meets < 2 second response time
- [ ] All tests pass (unit + integration)

### Code Quality:

- [ ] Type-safe (mypy strict mode)
- [ ] No security vulnerabilities (Bandit scan)
- [ ] Comprehensive error handling
- [ ] Unit tests for all tools (80%+ coverage)
- [ ] Integration tests with real API (gated by API key)
- [ ] Documented with docstrings

### Documentation:

- [ ] User guide created (setup, usage, troubleshooting)
- [ ] API documentation generated
- [ ] Architecture diagram included
- [ ] Example queries documented

## Dependencies

### Blocked By:
- Epic 016: Multi-Platform Orchestration (must be complete)
- Docker MCP Gateway configured and operational
- PostgreSQL database available

### Blocks:
- Universal marketplace search orchestrator
- Cross-marketplace price comparison

### External Dependencies:
- Amazon Product Advertising API access (requires approval)
- Amazon Associate account (for partner tag)
- Redis for caching (optional, can start without)
- PostgreSQL 14+

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Amazon API access denied | Low | High | Apply for API access early; have scraping fallback ready |
| Rate limits too restrictive | Medium | Medium | Implement aggressive caching; queue requests |
| API schema changes | Low | Medium | Version API responses; automated tests detect changes |
| Price tracking drift | Low | Low | Validate timestamps; monitor data quality |
| Multi-region complexity | Medium | Medium | Start with 1 region (SE), add others incrementally |
| Docker Gateway incompatibility | Low | High | Test early with simple MCP server prototype |

## Testing Strategy

### Unit Tests
- Mock Amazon API responses
- Test each tool independently
- Test unified schema mapping
- Test rate limiter behavior
- Test error handling

### Integration Tests
- Real Amazon API calls (gated by API key env var)
- End-to-end search → details → track workflow
- Multi-region queries
- Price tracker background job

### E2E Tests
- Odin → MCP Gateway → Amazon MCP → Amazon API
- Search product, track price, compare products (full user scenario)
- Test with Claude Desktop (stdio transport)
- Performance benchmarks (response time < 2s)

## Notes

### Design Decisions

**Why Amazon Product Advertising API instead of scraping?**
- Official API is more reliable and legal
- Structured data easier to parse
- No risk of IP bans or CAPTCHA
- Supports affiliate program (future monetization)

**Why separate MCP server instead of Odin plugin?**
- Marketplace logic is complex and independent
- Easier to test and deploy in isolation
- Can be reused by other AI assistants
- Follows Docker MCP Gateway best practices

**Why PostgreSQL for price tracking?**
- Time-series data storage
- Already used in Odin stack
- Easy to query for trends and alerts
- Supports JSON for flexible product metadata

### Known Limitations

- Amazon PA-API has strict rate limits (1 req/sec)
- Requires Amazon Associate account (business approval)
- Some product data may be incomplete (marketplace sellers)
- Price tracking updates every 6 hours (not real-time)

### Future Enhancements

- Real-time price alerts via push notifications
- Amazon Warehouse deals integration
- Best deal finder (lowest price across sellers)
- Product recommendation engine
- Sponsored product filtering
- Affiliate link generation (monetization)
- Lightning deals tracker
- Review sentiment analysis with AI

---

**Epic Status:** Planned (Not Active)
**Next Action:** Review and refine planning, promote to active build when Epic 016 is complete
