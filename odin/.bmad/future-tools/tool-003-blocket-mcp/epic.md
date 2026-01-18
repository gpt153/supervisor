# Epic: Blocket MCP Server

**Epic ID:** tool-003-blocket-mcp
**Created:** 2026-01-18
**Status:** Planned (Not in Active Build)
**Complexity Level:** 2/5

---

**⚠️ IMPORTANT:** This is a **future planning artifact**. It will NOT be built until:
1. You move this file to `.bmad/epics/` and renumber it
2. You create a GitHub issue in gpt153/odin
3. You tell the supervisor to build it

---

## Project Context

- **Project:** Odin
- **Repository:** https://github.com/gpt153/odin
- **Tech Stack:** Python 3.11+, FastAPI, MCP SDK, Docker, BeautifulSoup/requests
- **Related Epics:**
  - Depends on: Epic 016 (Multi-Platform Orchestration)
  - Blocks: Universal marketplace search orchestrator
- **Integration Points:** Docker MCP Gateway, PostgreSQL price tracker, unified product schema

## Business Context

### Problem Statement

Blocket is Sweden's largest marketplace for buying and selling used goods (like Craigslist/eBay Classifieds). Users need to:
- Search for local used items (cars, furniture, electronics)
- Filter by location (Stockholm, Gothenburg, etc.)
- Track price changes on used items
- Discover second-hand alternatives to new products

Currently, users must manually visit Blocket, filter by location, and monitor listings. This creates friction for finding great deals on used items.

### User Value

Users can now:
- "Find used gaming laptops in Stockholm under 5000 SEK" → instant Blocket results
- "Compare new vs used prices for iPhone 15" → side-by-side Blocket + Amazon
- "Track this Blocket listing" → get alert when price drops or listing changes
- Get location-aware results (prioritize nearby items)

**Real-World Scenario:**
```
User: "I need a desk for my home office, under 1500 SEK, in Stockholm"

Odin (via Blocket MCP):
1. Searches Blocket Stockholm → 12 used desks
2. Filters by price < 1500 SEK
3. Returns top 5 results with:
   - Current price (900 SEK)
   - Location (Södermalm, 2km away)
   - Condition (Good, minor scratches)
   - Seller rating (4.8★)
   - Posted: 2 days ago
4. User: "Show me the IKEA one"
   → Displays full details with images
5. User: "Track this listing"
   → MCP monitors for price drop or status change
6. Next day: "Listing updated! Price dropped to 700 SEK"
```

### Success Metrics

- Can search Blocket catalog with 95%+ accuracy
- Location filtering works correctly for all Swedish cities
- Price tracking updates every 24 hours
- Product details retrieved in < 2 seconds
- Unified schema compatibility with 90%+ of Blocket listings

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Search listings by keyword, category, location
- [ ] Get listing details (title, price, location, images, description)
- [ ] Track price/status changes for specific listings
- [ ] Support location filtering (city, region, nationwide)
- [ ] Return data in unified product schema
- [ ] Handle pagination for large result sets
- [ ] Scrape via requests + BeautifulSoup (simple HTML)

**SHOULD HAVE:**
- [ ] Category-specific search (cars, electronics, furniture, etc.)
- [ ] Distance calculation from user location
- [ ] Seller contact information extraction
- [ ] Image gallery parsing
- [ ] Listing age/freshness indicator

**COULD HAVE:**
- [ ] Listing alert when new items match criteria
- [ ] Price trend analysis for category
- [ ] Seller reputation scoring
- [ ] Auto-translate listings (Swedish → English)

**WON'T HAVE (this iteration):**
- Direct messaging to sellers
- Listing creation
- Account management
- Payment integration

### Non-Functional Requirements

**Performance:**
- Search response time: < 2 seconds
- Price tracker updates: Every 24 hours
- Simple HTTP requests (no browser automation needed)
- Cache listing details for 6 hours

**Security:**
- No PII collection or storage
- HTTPS-only communication
- Respect robots.txt
- User-agent identification

**Reliability:**
- Graceful degradation if Blocket is down
- Retry logic with exponential backoff
- Error messages returned in MCP-compliant format
- 99% uptime target (simple scraping is very reliable)

## Architecture

### Technical Approach

**MCP Server Implementation:**
- Python-based MCP server using `mcp-python-sdk`
- Docker container following Docker MCP Gateway architecture
- Stdio transport for Claude Desktop integration

**Blocket Integration:**
- requests library for HTTP GET (simple HTML site)
- BeautifulSoup for HTML parsing (no JavaScript rendering needed)
- CSS selectors for stable element targeting
- Rate limiting to be respectful (1 req every 2 seconds)

**Data Storage:**
- PostgreSQL for price/status tracking
- Unified product schema alignment
- Cache scraped data to reduce load

### Integration Points

**Docker MCP Gateway:**
```yaml
# mcp-config.yaml
mcpServers:
  blocket:
    image: odin/blocket-mcp:latest
    environment:
      - BLOCKET_BASE_URL=https://blocket.se
      - DATABASE_URL=${DATABASE_URL}
      - DEFAULT_LOCATION=Stockholm
    transport: stdio
```

**Odin Integration:**
- Odin discovers Blocket MCP via gateway
- Calls `search_listings`, `get_listing_details`, `track_listing` tools
- Receives responses in unified schema
- Cross-marketplace orchestrator aggregates with Amazon, Temu, etc.

### Data Flow

```
User Query
    ↓
Odin Core
    ↓
MCP Gateway
    ↓
Blocket MCP Server
    ↓
[Cache Check (PostgreSQL)]
    ↓
requests → Blocket.se
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
│   └── blocket-mcp/
│       ├── src/
│       │   ├── server.py              # MCP server entry point
│       │   ├── scraper.py             # requests + BeautifulSoup scraper
│       │   ├── tools/
│       │   │   ├── __init__.py
│       │   │   ├── search.py          # search_listings tool
│       │   │   ├── details.py         # get_listing_details tool
│       │   │   ├── tracker.py         # track_listing tool
│       │   │   └── location.py        # location_filter tool
│       │   ├── schemas/
│       │   │   ├── product.py         # Unified product schema
│       │   │   └── blocket_response.py # Blocket HTML parsing models
│       │   ├── database/
│       │   │   ├── models.py          # SQLAlchemy models
│       │   │   └── crud.py            # Price tracking queries
│       │   └── utils/
│       │       ├── parser.py          # HTML parsing utilities
│       │       ├── location.py        # Swedish city/region mapping
│       │       └── cache.py
│       ├── Dockerfile                 # Simple Python image
│       ├── docker-compose.yml         # Local testing
│       ├── config.yaml                # MCP server config
│       ├── requirements.txt
│       ├── .env.example
│       └── tests/
│           ├── test_search.py
│           ├── test_details.py
│           ├── test_scraper.py
│           └── fixtures/
│               └── blocket_sample_html/
└── docs/
    └── blocket-mcp-setup.md
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue 1: Blocket MCP Server Foundation**
- Set up MCP server using `mcp-python-sdk`
- Configure stdio transport
- Implement health check endpoint
- Create Dockerfile (simple Python image)
- Add Docker Compose for local development
- **Acceptance:** MCP server runs and responds to `tools/list` request

**Issue 2: Blocket Scraper Foundation**
- Install requests + BeautifulSoup
- Implement HTTP GET with user-agent
- Parse Blocket HTML structure (search results)
- Add rate limiting (1 req / 2 seconds)
- Handle Swedish characters (UTF-8)
- **Acceptance:** Can load Blocket.se and extract basic HTML content

**Issue 3: Search Listings Tool**
- Implement `search_listings` MCP tool
- Scrape search results page
- Parse listing cards (title, price, location, image)
- Handle pagination (20 results per page)
- Map to unified schema
- **Acceptance:** User can search "laptop" and get 20 results in unified format

**Issue 4: Location Filtering**
- Implement location filtering logic
- Map Swedish cities/regions to Blocket search params
- Support: Stockholm, Gothenburg, Malmö, nationwide
- Calculate distance from user location (optional)
- **Acceptance:** User can search "furniture in Stockholm" and get only Stockholm results

**Issue 5: Listing Details Tool**
- Implement `get_listing_details` MCP tool
- Scrape listing page by URL or ID
- Extract images, description, seller info, contact details
- Handle missing/incomplete data gracefully
- Add unit tests with saved HTML fixtures
- **Acceptance:** Can retrieve full listing details for any valid Blocket listing

**Issue 6: Price/Status Tracking System**
- Create PostgreSQL schema for listing history
- Implement `track_listing` MCP tool
- Background job to check listings every 24 hours
- Detect price changes, sold status, listing removal
- Store time-series data
- **Acceptance:** User can track listing and see price/status history over time

**Issue 7: Category-Specific Search**
- Add category filtering (cars, electronics, furniture, jobs, etc.)
- Map categories to Blocket category IDs
- Enhance search results with category context
- **Acceptance:** User can search "cars in Gothenburg" and get only car listings

**Issue 8: Docker MCP Gateway Integration**
- Add MCP config to Docker Gateway
- Configure environment variables
- Test stdio transport compatibility
- Verify discovery by Odin core
- **Acceptance:** Odin discovers Blocket MCP and can call tools successfully

**Issue 9: Error Handling & Observability**
- Comprehensive error messages
- Structured logging (JSON format)
- Metrics for scraping calls, latency, errors
- Graceful degradation if Blocket is down
- **Acceptance:** All error scenarios handled gracefully with informative messages

**Issue 10: Documentation & Testing**
- User guide for Blocket MCP setup
- Swedish marketplace context documentation
- Integration testing with real Blocket site
- HTML fixture tests for parsing
- Location filtering guide
- **Acceptance:** New developer can set up and run Blocket MCP in < 20 minutes

### Estimated Effort

- **Phase 1 (Foundation):** 4 hours (Issues 1-2)
- **Phase 2 (Core Tools):** 8 hours (Issues 3-6)
- **Phase 3 (Advanced Features):** 4 hours (Issues 7-8)
- **Phase 4 (Polish):** 4 hours (Issues 9-10)
- **Total:** 20 hours (~2.5 days full-time)

## Acceptance Criteria

### Feature-Level Acceptance:

- [ ] Can search Blocket listings by keyword
- [ ] Can filter by location (Stockholm, Gothenburg, Malmö, etc.)
- [ ] Can get detailed listing information by URL/ID
- [ ] Can track price/status changes for specific listings
- [ ] Supports all major categories (cars, electronics, furniture, etc.)
- [ ] Price/status history stored and retrievable
- [ ] Performance meets < 2 second response time
- [ ] All tests pass (unit + integration)

### Code Quality:

- [ ] Type-safe (mypy strict mode)
- [ ] No security vulnerabilities (Bandit scan)
- [ ] Comprehensive error handling
- [ ] Unit tests for all tools (80%+ coverage)
- [ ] Integration tests with real site (optional, manual)
- [ ] Documented with docstrings

### Documentation:

- [ ] User guide created (setup, usage, troubleshooting)
- [ ] Swedish marketplace context explained
- [ ] Architecture diagram included
- [ ] Example queries documented
- [ ] Location filtering guide

## Dependencies

### Blocked By:
- Epic 016: Multi-Platform Orchestration (must be complete)
- Docker MCP Gateway configured and operational
- PostgreSQL database available

### Blocks:
- Universal marketplace search orchestrator
- Cross-marketplace price comparison

### External Dependencies:
- requests library
- BeautifulSoup4
- PostgreSQL 14+
- Internet access to Blocket.se

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Blocket HTML structure changes | Medium | Medium | Store HTML fixtures; automated tests detect changes; flexible selectors |
| Listings removed before user acts | Medium | Low | Real-time status tracking; display "sold" badges |
| Performance degradation | Low | Low | Aggressive caching; simple HTTP is very fast |
| Character encoding issues (Swedish) | Low | Low | UTF-8 everywhere; test with Swedish characters |

## Testing Strategy

### Unit Tests
- Mock requests responses with saved HTML
- Test HTML parsing with fixtures
- Test each tool independently
- Test unified schema mapping
- Test location filtering logic

### Integration Tests
- Real Blocket scraping (manual, not in CI)
- End-to-end search → details → track workflow
- Location filtering with real Swedish cities
- Performance benchmarks (response time < 2s)

### E2E Tests
- Odin → MCP Gateway → Blocket MCP → Blocket.se
- Search listing, track price, detect status change (full user scenario)
- Test with Claude Desktop (stdio transport)

## Notes

### Design Decisions

**Why requests instead of Playwright?**
- Blocket is a simple HTML site (no complex JavaScript)
- requests is faster and more lightweight
- Lower resource usage in Docker
- Easier to maintain and debug

**Why 24-hour tracking instead of more frequent?**
- Used items change price less frequently than retail
- Reduces scraping load on Blocket servers
- Still sufficient for monitoring deals
- Many listings stay active for weeks

**Why Swedish marketplace?**
- Large user base in Sweden (Odin users likely Swedish)
- No good alternatives for local used goods
- Complements global marketplaces (Amazon, Temu)
- Simple site structure = easy to build and maintain

### Known Limitations

- Swedish-only marketplace (not international)
- Used goods only (no brand new items)
- Seller quality varies (not verified like Amazon)
- Some listings may be scams (user must verify)
- No built-in buyer protection

### Future Enhancements

- Auto-translate listings (Swedish → English)
- Seller reputation scoring (scraped from profile)
- Listing alerts when new items match criteria
- Price trend analysis by category
- Distance calculation from user location
- Image similarity search (find similar listings)
- Direct messaging to sellers (via Blocket forms)
- Fraud detection (flag suspicious listings)

---

**Epic Status:** Planned (Not Active)
**Next Action:** Review and refine planning, promote to active build after Amazon/Temu MCPs are complete
