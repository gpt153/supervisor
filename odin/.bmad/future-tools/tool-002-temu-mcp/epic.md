# Epic: Temu MCP Server

**Epic ID:** tool-002-temu-mcp
**Created:** 2026-01-18
**Status:** Planned (Not in Active Build)
**Complexity Level:** 3/5

---

**⚠️ IMPORTANT:** This is a **future planning artifact**. It will NOT be built until:
1. You move this file to `.bmad/epics/` and renumber it
2. You create a GitHub issue in gpt153/odin
3. You tell the supervisor to build it

---

## Project Context

- **Project:** Odin
- **Repository:** https://github.com/gpt153/odin
- **Tech Stack:** Python 3.11+, FastAPI, MCP SDK, Docker, Playwright (for scraping)
- **Related Epics:**
  - Depends on: Epic 016 (Multi-Platform Orchestration), Epic 012 (Browser Automation)
  - Blocks: Universal marketplace search orchestrator
- **Integration Points:** Docker MCP Gateway, PostgreSQL price tracker, unified product schema, Playwright

## Business Context

### Problem Statement

Temu is a rapidly growing budget e-commerce platform with extremely competitive pricing. Users need to:
- Find budget-friendly alternatives to expensive products
- Compare Temu prices with Amazon/other marketplaces
- Track flash sales and limited-time deals
- Discover trending products at ultra-low prices

Temu's appeal is its affordability, but users currently have no way to integrate it into their AI assistant workflow.

### User Value

Users can now:
- "Find the cheapest wireless earbuds" → search across Temu + other marketplaces
- "Is this product cheaper on Temu?" → instant price comparison
- "Track this Temu product for sales" → automatic flash sale alerts
- Get budget-conscious product recommendations

**Real-World Scenario:**
```
User: "I need a phone case for iPhone 15, under 100 SEK"

Odin (via Temu MCP + Amazon MCP):
1. Searches Temu → 50 results (avg 35 SEK)
2. Searches Amazon → 10 results (avg 150 SEK)
3. Returns: "Found 50 options on Temu, starting at 25 SEK"
4. User: "Show me the top 5 on Temu"
   → Displays cases with images, ratings, shipping time
5. User: "Track the pink glitter one"
   → Adds to price tracker
6. Next week: "Flash sale! Price dropped to 18 SEK (30% off)"
```

### Success Metrics

- Can search Temu catalog with 90%+ accuracy
- Price tracking updates every 12 hours
- Product details retrieved in < 3 seconds
- Unified schema compatibility with 95%+ of Temu products
- Handle dynamic content loading (React-based site)

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Search products by keyword, category, price range
- [ ] Get product details (title, price, rating, images, shipping)
- [ ] Track price history for specific products
- [ ] Support Temu.se (Swedish marketplace)
- [ ] Return data in unified product schema
- [ ] Handle pagination for large result sets
- [ ] Scrape via Playwright (no official API)

**SHOULD HAVE:**
- [ ] Flash sale detection and alerts
- [ ] Shipping time estimation
- [ ] Product review extraction
- [ ] Trending products discovery
- [ ] Multi-region support (US, EU, etc.)

**COULD HAVE:**
- [ ] Coupon code finder
- [ ] Bundle deal detection
- [ ] Seller reputation scoring
- [ ] Image similarity search

**WON'T HAVE (this iteration):**
- Order placement (security risk)
- Account management
- Payment integration
- Wishlist sync

### Non-Functional Requirements

**Performance:**
- Search response time: < 3 seconds (slower due to scraping)
- Price tracker updates: Every 12 hours
- Playwright headless mode for speed
- Cache product details for 2 hours

**Security:**
- No PII collection or storage
- HTTPS-only communication
- User-agent rotation to avoid detection
- CAPTCHA handling (manual fallback)

**Reliability:**
- Graceful degradation if Temu is down or blocks scraping
- Retry logic with exponential backoff
- Error messages returned in MCP-compliant format
- 95% uptime target (lower than API-based MCPs due to scraping)

## Architecture

### Technical Approach

**MCP Server Implementation:**
- Python-based MCP server using `mcp-python-sdk`
- Docker container following Docker MCP Gateway architecture
- Stdio transport for Claude Desktop integration

**Temu Integration:**
- Playwright for web scraping (no official API)
- Headless Chromium browser
- Dynamic content handling (React SPA)
- Response parsing with BeautifulSoup + CSS selectors
- Rate limiting to avoid detection (2-3 second delays)

**Data Storage:**
- PostgreSQL for price history tracking
- Unified product schema alignment
- Cache scraped data to reduce load

### Integration Points

**Docker MCP Gateway:**
```yaml
# mcp-config.yaml
mcpServers:
  temu:
    image: odin/temu-mcp:latest
    environment:
      - TEMU_BASE_URL=https://temu.com
      - DATABASE_URL=${DATABASE_URL}
      - PLAYWRIGHT_HEADLESS=true
    transport: stdio
    volumes:
      - playwright-cache:/root/.cache/ms-playwright
```

**Odin Integration:**
- Odin discovers Temu MCP via gateway
- Calls `search_products`, `get_product_details`, `track_price` tools
- Receives responses in unified schema
- Cross-marketplace orchestrator aggregates with Amazon, Blocket, etc.

### Data Flow

```
User Query
    ↓
Odin Core
    ↓
MCP Gateway
    ↓
Temu MCP Server
    ↓
[Cache Check (PostgreSQL)]
    ↓
Playwright → Temu.com
    ↓
HTML Parsing (BeautifulSoup)
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
│   └── temu-mcp/
│       ├── src/
│       │   ├── server.py              # MCP server entry point
│       │   ├── scraper.py             # Playwright-based scraper
│       │   ├── tools/
│       │   │   ├── __init__.py
│       │   │   ├── search.py          # search_products tool
│       │   │   ├── details.py         # get_product_details tool
│       │   │   ├── price_tracker.py   # track_price tool
│       │   │   └── flash_sales.py     # detect_flash_sales tool
│       │   ├── schemas/
│       │   │   ├── product.py         # Unified product schema
│       │   │   └── temu_response.py   # Temu HTML parsing models
│       │   ├── database/
│       │   │   ├── models.py          # SQLAlchemy models
│       │   │   └── crud.py            # Price tracking queries
│       │   └── utils/
│       │       ├── parser.py          # HTML parsing utilities
│       │       └── cache.py
│       ├── Dockerfile                 # Multi-stage build with Playwright
│       ├── docker-compose.yml         # Local testing
│       ├── config.yaml                # MCP server config
│       ├── requirements.txt
│       ├── .env.example
│       └── tests/
│           ├── test_search.py
│           ├── test_details.py
│           ├── test_scraper.py
│           └── fixtures/
│               └── temu_sample_html/
└── docs/
    └── temu-mcp-setup.md
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue 1: Temu MCP Server Foundation**
- Set up MCP server using `mcp-python-sdk`
- Configure stdio transport
- Implement health check endpoint
- Create Dockerfile with Playwright installation
- Add Docker Compose for local development
- **Acceptance:** MCP server runs and responds to `tools/list` request

**Issue 2: Playwright Scraper Foundation**
- Install Playwright with Chromium
- Implement headless browser automation
- Handle dynamic content loading (wait for React hydration)
- Add user-agent rotation
- Implement rate limiting (2-3 sec delays)
- **Acceptance:** Can load Temu.com and extract basic HTML content

**Issue 3: Search Products Tool**
- Implement `search_products` MCP tool
- Scrape search results page
- Parse product cards (title, price, image, rating)
- Handle pagination (20 results per page)
- Map to unified schema
- **Acceptance:** User can search "wireless mouse" and get 20 results in unified format

**Issue 4: Product Details Tool**
- Implement `get_product_details` MCP tool
- Scrape product page by URL or ID
- Extract images, specs, reviews, shipping info
- Handle missing/incomplete data gracefully
- Add unit tests with saved HTML fixtures
- **Acceptance:** Can retrieve full product details for any valid Temu product

**Issue 5: Price Tracking System**
- Create PostgreSQL schema for price history
- Implement `track_price` MCP tool
- Background job to scrape prices every 12 hours
- Store time-series price data
- Add price trend analysis
- **Acceptance:** User can track product and see price history over time

**Issue 6: Flash Sale Detection**
- Implement `detect_flash_sales` MCP tool
- Identify countdown timers and sale badges
- Extract sale percentage and end time
- Alert user to limited-time deals
- **Acceptance:** User can find active flash sales for tracked products

**Issue 7: Error Handling & Anti-Detection**
- Handle CAPTCHA challenges (manual fallback)
- Detect IP bans and rotate proxies (optional)
- Retry logic with exponential backoff
- Graceful degradation if scraping fails
- **Acceptance:** All error scenarios handled gracefully with informative messages

**Issue 8: Docker MCP Gateway Integration**
- Add MCP config to Docker Gateway
- Configure environment variables
- Test stdio transport compatibility
- Verify discovery by Odin core
- **Acceptance:** Odin discovers Temu MCP and can call tools successfully

**Issue 9: Caching & Performance Optimization**
- Cache scraped product data (2-hour TTL)
- Store in PostgreSQL to reduce scraping
- Batch requests where possible
- Optimize Playwright launch time
- **Acceptance:** Response time < 3 seconds for cached products

**Issue 10: Documentation & Testing**
- User guide for Temu MCP setup
- Scraping best practices documentation
- Integration testing with real Temu site
- HTML fixture tests for parsing
- Troubleshooting guide (CAPTCHA, rate limits)
- **Acceptance:** New developer can set up and run Temu MCP in < 30 minutes

### Estimated Effort

- **Phase 1 (Foundation):** 6 hours (Issues 1-2)
- **Phase 2 (Core Tools):** 12 hours (Issues 3-5)
- **Phase 3 (Advanced Features):** 8 hours (Issues 6-7)
- **Phase 4 (Optimization & Deployment):** 6 hours (Issues 8-10)
- **Total:** 32 hours (~4 days full-time)

## Acceptance Criteria

### Feature-Level Acceptance:

- [ ] Can search Temu catalog by keyword
- [ ] Can get detailed product information by URL/ID
- [ ] Can track prices for specific products
- [ ] Can detect flash sales and limited-time deals
- [ ] Supports Temu.se (Swedish marketplace)
- [ ] Price history stored and retrievable
- [ ] Performance meets < 3 second response time
- [ ] All tests pass (unit + integration)

### Code Quality:

- [ ] Type-safe (mypy strict mode)
- [ ] No security vulnerabilities (Bandit scan)
- [ ] Comprehensive error handling
- [ ] Unit tests for all tools (75%+ coverage)
- [ ] Integration tests with real site (optional, manual)
- [ ] Documented with docstrings

### Documentation:

- [ ] User guide created (setup, usage, troubleshooting)
- [ ] Scraping strategy documented
- [ ] Architecture diagram included
- [ ] Example queries documented
- [ ] CAPTCHA/anti-detection guide

## Dependencies

### Blocked By:
- Epic 016: Multi-Platform Orchestration (must be complete)
- Epic 012: Browser Automation (Playwright integration)
- Docker MCP Gateway configured and operational
- PostgreSQL database available

### Blocks:
- Universal marketplace search orchestrator
- Cross-marketplace price comparison

### External Dependencies:
- Playwright (with Chromium browser)
- PostgreSQL 14+
- Internet access to Temu.com

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Temu blocks scraping (CAPTCHA/IP ban) | High | High | User-agent rotation; CAPTCHA fallback; respect rate limits |
| HTML structure changes | Medium | Medium | Store HTML fixtures; automated tests detect changes; flexible selectors |
| Performance degradation | Medium | Low | Aggressive caching; optimize Playwright launch time |
| Legal concerns (scraping ToS) | Low | Medium | Review Temu ToS; only scrape public data; no account login |
| Flash sales end before user acts | Low | Low | Real-time alerts; display countdown timers |

## Testing Strategy

### Unit Tests
- Mock Playwright responses with saved HTML
- Test HTML parsing with fixtures
- Test each tool independently
- Test unified schema mapping
- Test rate limiter behavior

### Integration Tests
- Real Temu scraping (manual, not in CI)
- End-to-end search → details → track workflow
- Flash sale detection on live site
- Performance benchmarks (response time < 3s)

### E2E Tests
- Odin → MCP Gateway → Temu MCP → Temu.com
- Search product, track price, detect flash sale (full user scenario)
- Test with Claude Desktop (stdio transport)

## Notes

### Design Decisions

**Why Playwright instead of requests/BeautifulSoup?**
- Temu is a React SPA with dynamic content
- Playwright handles JavaScript rendering
- Can simulate real user behavior to avoid detection
- Supports browser automation features (screenshots, etc.)

**Why scraping instead of waiting for official API?**
- Temu has no public API (as of 2026)
- Users want this functionality now
- Scraping is legal for public data (consult ToS)
- Can switch to API later if released

**Why 12-hour price tracking instead of 6 hours?**
- Reduce scraping load on Temu servers
- Lower risk of detection/bans
- Temu prices change less frequently than Amazon
- Still sufficient for deal alerts

### Known Limitations

- Scraping is inherently fragile (HTML changes break parsers)
- CAPTCHA challenges require manual intervention
- Slower than API-based MCPs (3s vs 2s)
- Risk of IP bans if scraping too aggressively
- Some product data may be incomplete

### Future Enhancements

- Proxy rotation for high-volume scraping
- OCR for CAPTCHA solving (automated)
- Coupon code finder
- Bundle deal detection
- Product recommendation engine
- Image similarity search
- Multi-region support (Temu US, EU, etc.)
- Seller reputation scoring
- Review sentiment analysis

---

**Epic Status:** Planned (Not Active)
**Next Action:** Review and refine planning, promote to active build after Amazon MCP is complete
