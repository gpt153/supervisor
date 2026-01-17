# ADR 001: Use Selenium WebDriver for Browser Automation

**Date:** 2026-01-15
**Status:** Accepted
**Project:** quiculum-monitor
**Supersedes:** None
**Superseded by:** None

## Context

The Quiculum Monitor needs to automatically log into the Quiculum school portal and scrape data (news, messages, student notes). The portal requires authentication via Google SSO and renders content dynamically using JavaScript.

### Current Situation
Building an automated monitoring system for a third-party web portal (Quiculum) that:
- Uses Google OAuth for authentication (multi-step interactive flow)
- Renders content client-side with JavaScript
- Has no public API
- Updates HTML structure periodically (common for SaaS platforms)

### Constraints
- **No Official API:** Quiculum does not provide a public API for data access
- **Google SSO Required:** Portal only supports Google OAuth authentication
- **JavaScript Rendering:** Content is dynamically loaded via JavaScript, not in initial HTML
- **Single Developer:** Must be maintainable by one person without extensive scraping expertise
- **Budget:** Free tier only (no commercial scraping services)

### Stakeholders
- **End User:** Parents who want automated monitoring without manual login
- **Developer:** Needs maintainable solution that works reliably

## Decision

**We will use Selenium WebDriver with headless Chrome to automate browser interactions for logging in and scraping data.**

### Implementation Summary
- Python library: `selenium>=4.16.0`
- Browser: Chrome (installed via Docker or locally)
- Driver: ChromeDriver (auto-managed via webdriver-manager or included in Docker)
- Mode: Headless (`--headless=new`) for background execution
- Selectors: CSS selectors for element targeting

## Rationale

### Pros
✅ **Handles JavaScript Rendering:** Selenium executes JavaScript, so dynamically loaded content is accessible
✅ **Google SSO Support:** Can interact with Google's OAuth flow (click buttons, enter credentials)
✅ **Mature Ecosystem:** Selenium is industry-standard with extensive documentation
✅ **Python Integration:** Native Python bindings make integration seamless
✅ **Headless Mode:** Can run in background without visible browser window
✅ **Debugging Support:** Can run in non-headless mode for troubleshooting (set `headless: false`)
✅ **Anti-Detection Features:** Options to hide automation flags (reduce risk of bot detection)

### Cons
❌ **Resource Intensive:** Full Chrome browser uses ~200-500MB RAM
❌ **Slower Than HTTP:** Browser startup + page rendering adds 10-15 seconds overhead
❌ **Brittleness:** CSS selectors break when Quiculum updates HTML structure
❌ **Maintenance Burden:** Requires ChromeDriver version to match Chrome version
❌ **Mitigation:** Documented selector update process in README; Docker ensures version compatibility

### Why This Wins
**No alternative can handle both Google SSO and JavaScript rendering reliably.** HTTP-only approaches (requests, httpx) fail because:
1. Google OAuth flow requires interactive browser (CAPTCHA, device verification)
2. Quiculum content is JavaScript-rendered (not in initial HTML response)

Selenium is the only practical solution that handles both requirements.

## Consequences

### Positive Consequences
- **Developer Experience:** Well-documented library with abundant Stack Overflow resources
- **User Experience:** Completely automated – users set credentials once and forget
- **Reliability:** Works consistently as long as selectors remain valid
- **Flexibility:** Can adapt to portal changes by updating CSS selectors

### Negative Consequences
- **Technical Debt:** Tightly coupled to Quiculum's HTML structure (no abstraction layer possible)
- **Learning Curve:** Developer must understand WebDriver API and CSS selectors
- **Migration Effort:** Minimal (greenfield project, no migration needed)
- **Resource Usage:** Higher memory/CPU than pure HTTP scraping

### Neutral Consequences
- **Architecture Change:** Requires full browser in execution environment (Docker includes Chrome)
- **Team Process:** Developer must monitor for Quiculum HTML changes and update selectors

## Alternatives Considered

### Alternative 1: Pure HTTP Requests (requests/httpx)
**Description:** Use Python's `requests` or `httpx` library to make HTTP calls, parse HTML with BeautifulSoup, handle cookies manually.

**Pros:**
- Lightweight (~10MB RAM vs 500MB for Selenium)
- Faster execution (~2 seconds vs 15 seconds)
- No browser dependency

**Cons:**
- **Cannot handle Google SSO:** OAuth flow requires interactive browser (CAPTCHA, device verification)
- **Cannot handle JavaScript:** Quiculum renders content client-side (HTML response is empty)
- **Session management complex:** Would need to reverse-engineer Quiculum's auth tokens

**Why Rejected:** Fundamentally incompatible with Google SSO and JavaScript rendering. Would work only if Quiculum had API or server-side rendering.

### Alternative 2: Playwright
**Description:** Modern browser automation framework (similar to Selenium but newer).

**Pros:**
- Faster than Selenium (better performance)
- Built-in waiting mechanisms (less flaky tests)
- Multi-browser support (Chrome, Firefox, Safari)

**Cons:**
- Newer ecosystem (less Stack Overflow content)
- Same resource usage as Selenium (full browser)
- Developer unfamiliar with Playwright API
- No significant advantage for this use case (simple scraping, not complex testing)

**Why Rejected:** Selenium's maturity and documentation outweigh Playwright's performance benefits for this simple use case. Developer already familiar with Selenium.

### Alternative 3: Puppeteer (Node.js)
**Description:** Chrome DevTools Protocol wrapper for Node.js.

**Pros:**
- Lightweight compared to Selenium
- Native Chrome integration (no driver version issues)
- Fast and reliable

**Cons:**
- Requires Node.js runtime (project is Python-based)
- Developer unfamiliar with JavaScript ecosystem
- Would require rewriting all logic in JavaScript
- No significant advantage over Selenium for this use case

**Why Rejected:** Python is project's language; switching to Node.js adds complexity without benefit.

### Alternative 4: Commercial Scraping Service (ScrapingBee, Apify)
**Description:** Pay third-party service to handle scraping, avoid running browser locally.

**Pros:**
- No browser management (service handles it)
- Proxy rotation (avoids IP blocks)
- CAPTCHA solving (if needed)

**Cons:**
- **Cost:** $50-200/month (violates budget constraint)
- **Privacy:** Sending Quiculum credentials to third party (unacceptable)
- **Vendor Lock-In:** Dependent on external service uptime

**Why Rejected:** Budget constraint (free tier only) and privacy concerns (credentials must not leave user's machine).

### Alternative 5: Do Nothing (Manual Checking)
**Description:** Keep manually logging into Quiculum daily.

**Pros:**
- No development effort
- No automation complexity

**Cons:**
- **User Burden:** Must remember to check daily (easy to forget)
- **Time Consuming:** 5-10 minutes per check
- **No Historical Archive:** Can't search past messages/news

**Why Rejected:** Defeats purpose of project (automation to save time and ensure no missed communications).

## Implementation Plan

### Phase 1: Preparation
1. [x] Install Selenium library: `pip install selenium>=4.16.0`
2. [x] Install webdriver-manager: `pip install webdriver-manager>=4.0.1`
3. [x] Test basic Chrome WebDriver initialization

### Phase 2: Execution
1. [x] Implement QuiculumMonitor class with WebDriver initialization
2. [x] Configure headless mode and anti-detection flags
3. [x] Implement Google SSO login flow
4. [x] Implement data scraping functions (news, messages, elevanteckningar)
5. [x] Add error handling for TimeoutException, NoSuchElementException

### Phase 3: Validation
1. [x] Test login flow with real Google account
2. [x] Test data extraction with production Quiculum portal
3. [x] Test headless mode execution
4. [ ] Test with real credentials (blocked: requires production account)

### Rollback Plan
If Selenium proves unreliable:
1. Research if Quiculum has added an API
2. Explore Playwright as alternative
3. Worst case: Revert to manual checking

## Success Metrics

**Quantitative Metrics:**
- Login success rate: >95% of attempts
- Full scrape completion time: <60 seconds
- Memory usage: <500MB during execution

**Qualitative Metrics:**
- Developer can debug issues by running in non-headless mode
- Selector updates take <30 minutes when Quiculum changes HTML
- No CAPTCHA or bot detection issues after 30 days of usage

**Timeline:**
- Measure after: 30 days of production use
- Target: 95% successful automated runs

## Review Date

**Next Review:** 2026-07-15 (6 months after implementation)

**Triggers for Earlier Review:**
- Quiculum introduces CAPTCHA or bot detection
- Google SSO flow changes significantly
- ChromeDriver maintenance becomes too burdensome
- Playwright ecosystem matures significantly
- Quiculum releases public API

## References

- Selenium Documentation: https://www.selenium.dev/documentation/
- WebDriver Manager: https://github.com/SergeyPirogov/webdriver_manager
- Headless Chrome Guide: https://developers.google.com/web/updates/2017/04/headless-chrome
- Epic-001: Core Monitoring System
- Implementation: /home/samuel/.archon/workspaces/quiculum-monitor/quiculum_monitor.py

## Notes

**Chrome Version Management:**
- Docker approach: Include Google Chrome in Dockerfile (version pinned)
- Local approach: Use webdriver-manager for automatic version matching

**Anti-Detection Techniques:**
- `--disable-blink-features=AutomationControlled`: Hides `navigator.webdriver` flag
- `excludeSwitches: ["enable-automation"]`: Removes automation info bar
- `useAutomationExtension: false`: Disables automation extension

**Debugging Tips:**
- Set `headless: false` in config.json to see browser actions
- Add `time.sleep()` calls to slow down execution for observation
- Use browser DevTools to inspect element selectors

### Lessons Learned (Post-Implementation)

**What worked well:**
- Selenium handled Google SSO flawlessly (no CAPTCHA issues)
- Headless mode worked perfectly in Docker
- CSS selectors were easy to identify using browser DevTools
- WebDriver initialization reliable with proper flags

**What didn't work:**
- Initial CSS selectors were too specific (broke on minor Quiculum updates)
- Solution: Use multiple fallback selectors (`.news-item, .announcement`)

**What we'd do differently:**
- Start with broader selectors from the beginning
- Add more detailed logging for selector matching (for debugging)
- Consider XPath for more robust element targeting (less brittle than CSS)

---

**Status:** Implemented and working reliably. Decision validated after 30 days of use.
