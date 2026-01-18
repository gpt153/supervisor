# Marketplace MCPs - Overview

**Original Epic:** 013 - Marketplace MCP Agents (Phase 8)
**Moved to:** Future Tools (for detailed planning)
**Priority:** Medium
**Timeline:** Month 8 (Sep 2026)

---

## Purpose

This directory contains individual MCP server plans for marketplace integrations. Each marketplace gets its own MCP server following the Docker MCP Gateway architecture.

**Why separate MCPs?**
- Each marketplace has unique API structure and authentication
- Independent deployment and updates
- Easier to enable/disable specific marketplaces
- Better error isolation (one marketplace down ≠ all down)

---

## Planned Marketplace MCPs

### Tool 001: Amazon MCP
- **Status:** Planning
- **Priority:** High (most used)
- **Complexity:** 4/5
- **Epic:** `tool-001-amazon-mcp/epic.md`

### Tool 002: Temu MCP
- **Status:** Planning
- **Priority:** Medium
- **Complexity:** 3/5
- **Epic:** `tool-002-temu-mcp/epic.md`

### Tool 003: Blocket MCP (Swedish Marketplace)
- **Status:** Planning
- **Priority:** Medium
- **Complexity:** 2/5
- **Epic:** `tool-003-blocket-mcp/epic.md`

### Tool 004: Facebook Marketplace MCP
- **Status:** Planning
- **Priority:** Medium-Low
- **Complexity:** 4/5
- **Epic:** `tool-004-facebook-marketplace-mcp/epic.md`

---

## Common Architecture

All marketplace MCPs follow the same pattern:

```
marketplace-mcp/
├── src/
│   ├── server.py              # MCP server entry point
│   ├── client.py              # Marketplace API client
│   ├── tools/
│   │   ├── search.py          # Product search tool
│   │   ├── details.py         # Get product details
│   │   ├── price_tracker.py  # Price tracking
│   │   └── compare.py         # Cross-marketplace comparison
│   └── schemas/
│       └── product.py         # Unified product schema
├── Dockerfile                 # Docker MCP Gateway compatible
├── config.yaml               # MCP server configuration
└── tests/
```

---

## Shared Components

### Unified Product Schema
All MCPs return products in the same format:
```python
{
    "id": "unique-id",
    "marketplace": "amazon|temu|blocket|facebook",
    "title": "Product name",
    "price": {"amount": 299.99, "currency": "SEK"},
    "url": "product-url",
    "image_url": "...",
    "availability": "in_stock|out_of_stock|limited",
    "shipping": {...},
    "rating": 4.5,
    "reviews_count": 123
}
```

### Price Tracker Database
Shared PostgreSQL table tracking price history across all marketplaces:
```sql
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR,
    marketplace VARCHAR,
    price DECIMAL,
    currency VARCHAR,
    timestamp TIMESTAMPTZ
);
```

### Universal Search Orchestrator
Odin can search ALL marketplaces simultaneously:
```
User: "Find wireless headphones under 500 SEK"

Odin:
- Queries Amazon MCP → 15 results
- Queries Temu MCP → 8 results
- Queries Blocket MCP → 3 results
- Queries Facebook MCP → 5 results
- Combines, deduplicates, ranks by price/quality
- Returns: "Found 31 headphones across 4 marketplaces..."
```

---

## Dependencies

**Required:**
- Epic 016: Multi-Platform Orchestration (for MCP gateway integration)
- Docker MCP Gateway configured
- PostgreSQL database (for price tracking)

**Optional:**
- Epic 012: Browser Automation (for scraping if APIs unavailable)

---

## Implementation Order

1. **Amazon MCP** (most used, best API)
2. **Blocket MCP** (local Swedish marketplace, simple)
3. **Temu MCP** (growing popularity)
4. **Facebook Marketplace MCP** (complex auth, lowest priority)

---

## When to Build

**Ready to promote when:**
- Epic 016 (Multi-Platform Orchestration) is complete
- Docker MCP Gateway is operational
- User wants marketplace integration features

**Promotion process:**
1. Choose which marketplace to build first
2. Move that tool's epic to `.bmad/epics/`
3. Renumber as next epic in sequence
4. Create GitHub issue
5. Supervisor builds it automatically

---

**Status:** Planned, not in active build pipeline
