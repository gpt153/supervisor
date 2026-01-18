# Epic: Facebook Marketplace MCP Server

**Epic ID:** tool-004-facebook-marketplace-mcp
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
- **Tech Stack:** Python 3.11+, FastAPI, MCP SDK, Docker, Playwright, OAuth 2.0
- **Related Epics:**
  - Depends on: Epic 016 (Multi-Platform Orchestration), Epic 012 (Browser Automation)
  - Blocks: Universal marketplace search orchestrator
- **Integration Points:** Docker MCP Gateway, PostgreSQL price tracker, unified product schema, Playwright, OAuth

## Business Context

### Problem Statement

Facebook Marketplace is one of the largest peer-to-peer marketplaces globally, with millions of local listings. Users need to:
- Search for local items within their community
- Filter by location radius (5km, 10km, 20km, etc.)
- Track listings from trusted sellers
- Discover deals on items their friends are selling

Facebook Marketplace requires authentication, making integration complex. However, its massive user base and local focus make it valuable for users.

### User Value

Users can now:
- "Find used bikes in my area on Facebook Marketplace" → local results within 10km
- "Compare Amazon vs local Facebook sellers" → side-by-side pricing
- "Track this Facebook listing" → automatic alerts when price drops
- Get social context (mutual friends, seller reputation)

**Real-World Scenario:**
```
User: "I need a dining table, under 2000 SEK, within 15km of me"

Odin (via Facebook Marketplace MCP):
1. Authenticates via OAuth (user logs in once)
2. Searches Facebook Marketplace → 8 local listings
3. Filters by distance < 15km, price < 2000 SEK
4. Returns top 5 results with:
   - Current price (1200 SEK)
   - Location (Kungsholmen, 4km away)
   - Seller (Maria S., 3 mutual friends)
   - Posted: 1 week ago
   - Condition: Like new
5. User: "Show me the oak one"
   → Displays full details with images + seller profile
6. User: "Track this listing"
   → MCP monitors for price drop or status change
7. Next day: "Listing updated! Price dropped to 900 SEK"
```

### Success Metrics

- Can search Facebook Marketplace with 90%+ accuracy
- Location filtering works correctly (radius-based)
- OAuth authentication succeeds 99%+ of the time
- Price tracking updates every 12 hours
- Product details retrieved in < 3 seconds
- Unified schema compatibility with 95%+ of Facebook listings

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] OAuth 2.0 authentication with Facebook
- [ ] Search listings by keyword, category, location radius
- [ ] Get listing details (title, price, location, images, seller info)
- [ ] Track price/status changes for specific listings
- [ ] Support location radius filtering (5km, 10km, 20km, etc.)
- [ ] Return data in unified product schema
- [ ] Handle pagination for large result sets
- [ ] Scrape via Playwright (logged-in session)

**SHOULD HAVE:**
- [ ] Seller reputation/profile information
- [ ] Mutual friends display
- [ ] Category-specific search (vehicles, furniture, electronics, etc.)
- [ ] Listing age/freshness indicator
- [ ] Image gallery parsing
- [ ] Seller contact information

**COULD HAVE:**
- [ ] Direct messaging to sellers (via Facebook Messenger API)
- [ ] Saved searches (alert when new listings match)
- [ ] Listing comparison tool
- [ ] Social graph integration (prioritize friends' listings)

**WON'T HAVE (this iteration):**
- Listing creation (post items for sale)
- Payment processing
- Shipping integration
- Marketplace reviews/ratings

### Non-Functional Requirements

**Performance:**
- Search response time: < 3 seconds
- Price tracker updates: Every 12 hours
- OAuth token refresh: Automatic before expiry
- Cache listing details for 4 hours

**Security:**
- OAuth credentials stored in Docker secrets
- Access tokens encrypted at rest
- HTTPS-only communication
- No storage of user passwords
- Respect Facebook ToS and rate limits

**Reliability:**
- Graceful degradation if Facebook is down or blocks access
- Retry logic with exponential backoff
- Error messages returned in MCP-compliant format
- 95% uptime target (dependent on Facebook API stability)

## Architecture

### Technical Approach

**MCP Server Implementation:**
- Python-based MCP server using `mcp-python-sdk`
- Docker container following Docker MCP Gateway architecture
- Stdio transport for Claude Desktop integration

**Facebook Integration:**
- OAuth 2.0 for user authentication
- Playwright for web scraping (logged-in session)
- Headless Chromium browser with persistent session
- Response parsing with BeautifulSoup + CSS selectors
- Rate limiting to avoid detection (3-5 second delays)

**Data Storage:**
- PostgreSQL for price history tracking and OAuth tokens
- Unified product schema alignment
- Cache scraped data to reduce load

### Integration Points

**Docker MCP Gateway:**
```yaml
# mcp-config.yaml
mcpServers:
  facebook-marketplace:
    image: odin/facebook-marketplace-mcp:latest
    environment:
      - FACEBOOK_APP_ID=${FACEBOOK_APP_ID}
      - FACEBOOK_APP_SECRET=${FACEBOOK_APP_SECRET}
      - DATABASE_URL=${DATABASE_URL}
      - PLAYWRIGHT_HEADLESS=true
      - DEFAULT_LOCATION_LAT=59.3293
      - DEFAULT_LOCATION_LON=18.0686  # Stockholm
    transport: stdio
    volumes:
      - playwright-cache:/root/.cache/ms-playwright
      - facebook-sessions:/app/sessions
```

**Odin Integration:**
- Odin discovers Facebook Marketplace MCP via gateway
- Calls `authenticate`, `search_listings`, `get_listing_details`, `track_listing` tools
- Receives responses in unified schema
- Cross-marketplace orchestrator aggregates with Amazon, Temu, Blocket

### Data Flow

```
User Query
    ↓
Odin Core
    ↓
MCP Gateway
    ↓
Facebook Marketplace MCP Server
    ↓
[OAuth Token Check]
    ↓
Playwright → Facebook.com/marketplace
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
│   └── facebook-marketplace-mcp/
│       ├── src/
│       │   ├── server.py              # MCP server entry point
│       │   ├── auth.py                # OAuth 2.0 authentication
│       │   ├── scraper.py             # Playwright-based scraper
│       │   ├── tools/
│       │   │   ├── __init__.py
│       │   │   ├── authenticate.py    # oauth_authenticate tool
│       │   │   ├── search.py          # search_listings tool
│       │   │   ├── details.py         # get_listing_details tool
│       │   │   ├── tracker.py         # track_listing tool
│       │   │   └── seller.py          # get_seller_info tool
│       │   ├── schemas/
│       │   │   ├── product.py         # Unified product schema
│       │   │   └── facebook_response.py # Facebook HTML parsing models
│       │   ├── database/
│       │   │   ├── models.py          # SQLAlchemy models
│       │   │   └── crud.py            # Price tracking + OAuth token storage
│       │   └── utils/
│       │       ├── parser.py          # HTML parsing utilities
│       │       ├── location.py        # Geolocation utilities
│       │       └── session.py         # Persistent Playwright session
│       ├── Dockerfile                 # Multi-stage build with Playwright
│       ├── docker-compose.yml         # Local testing
│       ├── config.yaml                # MCP server config
│       ├── requirements.txt
│       ├── .env.example
│       └── tests/
│           ├── test_auth.py
│           ├── test_search.py
│           ├── test_details.py
│           ├── test_scraper.py
│           └── fixtures/
│               └── facebook_sample_html/
└── docs/
    └── facebook-marketplace-mcp-setup.md
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue 1: Facebook Marketplace MCP Server Foundation**
- Set up MCP server using `mcp-python-sdk`
- Configure stdio transport
- Implement health check endpoint
- Create Dockerfile with Playwright installation
- Add Docker Compose for local development
- **Acceptance:** MCP server runs and responds to `tools/list` request

**Issue 2: OAuth 2.0 Authentication**
- Register Facebook App (get App ID + Secret)
- Implement OAuth 2.0 flow (authorization code grant)
- Handle token exchange and refresh
- Store access tokens in PostgreSQL (encrypted)
- Implement `oauth_authenticate` MCP tool
- **Acceptance:** User can authenticate via OAuth and receive valid access token

**Issue 3: Playwright Session Management**
- Install Playwright with Chromium
- Implement persistent browser session (cookies + local storage)
- Load OAuth token into browser session
- Handle session expiry and re-authentication
- Add user-agent rotation
- **Acceptance:** Can load Facebook Marketplace while authenticated

**Issue 4: Search Listings Tool**
- Implement `search_listings` MCP tool
- Scrape search results page (requires authentication)
- Parse listing cards (title, price, location, seller, image)
- Handle pagination (20 results per page)
- Map to unified schema
- **Acceptance:** User can search "furniture" and get 20 results in unified format

**Issue 5: Location Filtering**
- Implement location radius filtering (5km, 10km, 20km, etc.)
- Extract user's current location from Facebook profile
- Calculate distance to listings
- Filter results by radius
- **Acceptance:** User can search "bikes within 10km" and get only nearby results

**Issue 6: Listing Details Tool**
- Implement `get_listing_details` MCP tool
- Scrape listing page by URL or ID
- Extract images, description, seller profile, mutual friends
- Handle missing/incomplete data gracefully
- Add unit tests with saved HTML fixtures
- **Acceptance:** Can retrieve full listing details for any valid Facebook listing

**Issue 7: Seller Information Tool**
- Implement `get_seller_info` MCP tool
- Scrape seller profile (name, rating, join date, mutual friends)
- Extract seller reputation signals
- Add to unified schema under "seller" field
- **Acceptance:** User can see seller reputation before contacting

**Issue 8: Price/Status Tracking System**
- Create PostgreSQL schema for listing history
- Implement `track_listing` MCP tool
- Background job to scrape listings every 12 hours
- Detect price changes, sold status, listing removal
- Store time-series data
- **Acceptance:** User can track listing and see price/status history over time

**Issue 9: Docker MCP Gateway Integration**
- Add MCP config to Docker Gateway
- Configure environment variables for OAuth secrets
- Test stdio transport compatibility
- Verify discovery by Odin core
- **Acceptance:** Odin discovers Facebook Marketplace MCP and can call tools successfully

**Issue 10: Error Handling & Anti-Detection**
- Handle OAuth errors (expired token, revoked access)
- Detect Facebook blocking/CAPTCHA
- Retry logic with exponential backoff
- Graceful degradation if scraping fails
- Comprehensive error messages
- **Acceptance:** All error scenarios handled gracefully with informative messages

**Issue 11: Documentation & Testing**
- User guide for Facebook Marketplace MCP setup
- OAuth app registration instructions
- Integration testing with real Facebook account
- HTML fixture tests for parsing
- Troubleshooting guide (OAuth, CAPTCHA, rate limits)
- **Acceptance:** New developer can set up and run Facebook Marketplace MCP in < 45 minutes

### Estimated Effort

- **Phase 1 (Foundation + OAuth):** 10 hours (Issues 1-3)
- **Phase 2 (Core Tools):** 14 hours (Issues 4-7)
- **Phase 3 (Tracking & Integration):** 8 hours (Issues 8-9)
- **Phase 4 (Error Handling & Docs):** 6 hours (Issues 10-11)
- **Total:** 38 hours (~5 days full-time)

## Acceptance Criteria

### Feature-Level Acceptance:

- [ ] OAuth authentication succeeds and refreshes automatically
- [ ] Can search Facebook Marketplace by keyword
- [ ] Can filter by location radius (5km, 10km, 20km, etc.)
- [ ] Can get detailed listing information by URL/ID
- [ ] Can retrieve seller reputation and mutual friends
- [ ] Can track price/status changes for specific listings
- [ ] Price history stored and retrievable
- [ ] Performance meets < 3 second response time
- [ ] All tests pass (unit + integration)

### Code Quality:

- [ ] Type-safe (mypy strict mode)
- [ ] No security vulnerabilities (Bandit scan)
- [ ] OAuth credentials encrypted at rest
- [ ] Comprehensive error handling
- [ ] Unit tests for all tools (75%+ coverage)
- [ ] Integration tests with real Facebook account (manual)
- [ ] Documented with docstrings

### Documentation:

- [ ] User guide created (setup, usage, troubleshooting)
- [ ] OAuth app registration guide
- [ ] Architecture diagram included
- [ ] Example queries documented
- [ ] Security best practices documented

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
- Facebook App ID + Secret (requires developer account)
- Playwright (with Chromium browser)
- PostgreSQL 14+
- Internet access to Facebook.com

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Facebook blocks scraping (even with OAuth) | High | High | Use official Graph API if available; respect rate limits; rotate user-agents |
| OAuth token revoked by user | Medium | Medium | Graceful error handling; prompt user to re-authenticate |
| Facebook HTML structure changes | Medium | Medium | Store HTML fixtures; automated tests detect changes; flexible selectors |
| CAPTCHA challenges | Medium | High | Manual fallback; use authenticated sessions to reduce likelihood |
| Facebook ToS violation | Low | High | Review ToS carefully; only scrape public data; consult legal if needed |
| Performance degradation | Medium | Low | Aggressive caching; optimize Playwright launch time |

## Testing Strategy

### Unit Tests
- Mock Playwright responses with saved HTML
- Test OAuth flow with mock tokens
- Test HTML parsing with fixtures
- Test each tool independently
- Test unified schema mapping

### Integration Tests
- Real Facebook scraping with test account (manual, not in CI)
- End-to-end OAuth → search → details → track workflow
- Location filtering with real coordinates
- Performance benchmarks (response time < 3s)

### E2E Tests
- Odin → MCP Gateway → Facebook Marketplace MCP → Facebook.com
- Full user scenario: authenticate, search, track listing, get seller info
- Test with Claude Desktop (stdio transport)

## Notes

### Design Decisions

**Why OAuth instead of username/password?**
- More secure (no password storage)
- Facebook requires OAuth for third-party apps
- Tokens can be revoked by user
- Follows Facebook best practices

**Why Playwright instead of Graph API?**
- Facebook Marketplace has limited Graph API support
- Playwright allows full Marketplace feature access
- Can simulate real user behavior to avoid detection
- More flexible for future features

**Why 12-hour tracking instead of more frequent?**
- Reduce scraping load on Facebook servers
- Lower risk of detection/bans
- Facebook listings change less frequently than retail
- Still sufficient for deal alerts

**Why persistent browser session?**
- Reduces re-authentication overhead
- Faster scraping (no login on every request)
- More realistic user behavior (less suspicious)
- Cookies + local storage preserved

### Known Limitations

- Requires user to authenticate via OAuth (one-time setup)
- Scraping is inherently fragile (HTML changes break parsers)
- CAPTCHA challenges may occur despite OAuth
- Slower than API-based MCPs (3s vs 2s)
- Risk of account suspension if scraping too aggressively
- Dependent on Facebook platform stability

### Future Enhancements

- Direct messaging to sellers (via Messenger API)
- Saved searches (alert when new listings match)
- Listing comparison tool
- Social graph integration (prioritize friends' listings)
- Fraud detection (flag suspicious listings)
- Auto-translate listings (multilingual support)
- Listing alerts via push notifications
- Seller reputation scoring (ML-based)
- Price trend analysis by category

---

**Epic Status:** Planned (Not Active)
**Next Action:** Review and refine planning, promote to active build after Amazon/Temu/Blocket MCPs are complete (lowest priority due to complexity)
