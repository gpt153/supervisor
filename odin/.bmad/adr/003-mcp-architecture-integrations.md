# ADR-003: MCP Architecture for External Integrations

**Status:** Accepted
**Date:** 2026-01-15
**Deciders:** Samuel, Supervisor
**Context:** Need architecture for multiple external service integrations (marketplaces, school portal, browser automation)

---

## Context and Problem Statement

Odin needs to integrate with many external services:
- Quiculum (school portal) - already built as Python script
- Marketplaces (Amazon, Temu, Blocket, Facebook Marketplace)
- Browser automation (Playwright)
- Price comparison services
- Future integrations (calendar, task services, etc.)

**Problem:** How should we architect these integrations?

**Options:**
1. Direct integration (import libraries into Odin codebase)
2. Microservices (separate services with REST APIs)
3. MCP (Model Context Protocol) servers

---

## Decision

**We will use the Model Context Protocol (MCP) for all external service integrations.**

Each integration becomes a standalone MCP server that Odin connects to:
- **quiculum-mcp:** School data (convert existing quiculum-monitor)
- **amazon-mcp:** Amazon marketplace search and purchasing
- **temu-mcp:** Temu marketplace
- **blocket-mcp:** Swedish classifieds
- **facebook-marketplace-mcp:** Facebook Marketplace integration
- **price-comparison-mcp:** Aggregates prices across multiple sources
- **playwright-mcp:** Browser automation (already exists)

---

## Rationale

### Why MCP?

**1. Isolation and Security**
- Each MCP server has its own credentials and secrets
- Amazon credentials separate from Blocket credentials
- Security breach in one doesn't affect others
- Easier to audit and control access

**2. Independent Development and Updates**
- Update Amazon MCP without touching Odin core
- Different developers can work on different MCPs
- Version control separate per integration
- Can test integrations independently

**3. Reusability**
- Other applications can use same MCP servers
- Partner's system could connect to same Quiculum MCP
- Share MCPs with community (generic marketplace tools)

**4. Technology Flexibility**
- MCP can be written in any language
- quiculum-mcp stays in Python (already written)
- Could write facebook-mcp in Node.js if Graph API SDK is better
- Not locked into Python for everything

**5. Failure Isolation**
- If Amazon API is down, only amazon-mcp fails
- Odin continues working with other services
- Graceful degradation easier

**6. Resource Management**
- Each MCP server can have its own rate limiting
- Marketplace MCPs can cache independently
- Browser automation runs in separate process

**7. Existing Ecosystem**
- Playwright MCP already available and proven
- Can leverage existing community MCPs
- Standard protocol, not custom APIs

### Why Not Direct Integration?

**Problems with direct integration:**
- All dependencies in one codebase (dependency hell)
- Security: all credentials in one place
- Tight coupling: changes break things
- Hard to test: need all services running
- Monolithic: gets unwieldy fast

### Why Not Microservices?

**Microservices would work but:**
- More infrastructure overhead (API design, authentication)
- MCP is standardized (don't reinvent protocol)
- MCP has built-in tool discovery
- Community ecosystem around MCP

---

## Implementation Details

### MCP Server Structure

Each MCP server provides tools:

```python
# Example: quiculum-mcp
Tools:
- get_school_news(child_name: str) → List[News]
- get_school_messages(child_name: str) → List[Message]
- get_student_notes(child_name: str) → List[Note]
- get_school_schedule(child_name: str) → Schedule
- search_school_content(query: str) → List[Result]

# Example: amazon-mcp
Tools:
- search_products(query: str, filters: Dict) → List[Product]
- get_product_details(product_id: str) → ProductDetails
- get_price_history(product_id: str) → PriceHistory
- add_to_cart(product_id: str) → CartItem
- get_cart() → Cart

# Example: blocket-mcp
Tools:
- search_listings(query: str, location: str) → List[Listing]
- get_listing_details(listing_id: str) → ListingDetails
- contact_seller(listing_id: str, message: str) → bool
- save_search(query: str) → SearchAlert
```

### Connection Configuration

Odin connects to MCPs via stdio or HTTP:

```python
# config/mcp_servers.yaml
servers:
  quiculum:
    command: "python"
    args: ["/path/to/quiculum-mcp/server.py"]
    env:
      QUICULUM_EMAIL: "${QUICULUM_EMAIL}"
      QUICULUM_PASSWORD: "${QUICULUM_PASSWORD}"

  amazon:
    command: "python"
    args: ["/path/to/amazon-mcp/server.py"]
    env:
      AMAZON_API_KEY: "${AMAZON_API_KEY}"

  playwright:
    url: "http://localhost:3000/mcp"
    # Already running as service
```

### Odin Integration Layer

```python
# services/mcp_manager.py
class MCPManager:
    """Manage connections to all MCP servers."""

    async def call_tool(
        self,
        server: str,
        tool: str,
        params: Dict
    ) -> Any:
        """Call tool on specific MCP server."""
        pass

    async def search_all_marketplaces(
        self,
        query: str
    ) -> List[Product]:
        """Search all marketplace MCPs in parallel."""
        results = await asyncio.gather(
            self.call_tool("amazon", "search_products", {"query": query}),
            self.call_tool("temu", "search_products", {"query": query}),
            self.call_tool("blocket", "search_listings", {"query": query}),
            self.call_tool("facebook_marketplace", "search", {"query": query}),
        )
        return self.aggregate_results(results)
```

---

## Consequences

### Positive

✅ **Clean separation of concerns**
- Odin core stays focused on intelligence and orchestration
- Integrations isolated and independent

✅ **Easier testing**
- Can mock MCP responses
- Test each MCP independently
- Integration tests only need specific MCPs

✅ **Better security**
- Credentials isolated per service
- Audit trail per MCP
- Easier to review security

✅ **Scalability**
- MCPs can run on different machines
- Can have multiple instances of heavy MCPs
- Load balancing easier

✅ **Community benefits**
- Can open-source individual MCPs
- Others can contribute improvements
- Learn from community MCPs

### Negative

⚠️ **Additional complexity**
- Need to manage multiple processes
- Inter-process communication overhead
- More moving parts to debug

⚠️ **Startup overhead**
- Need to start multiple MCP servers
- Connection management required
- Health checks needed

⚠️ **Development overhead initially**
- Need to build MCP wrapper for each service
- More boilerplate than direct integration
- Steeper learning curve for MCP protocol

### Mitigation

**Complexity:**
- Use supervisord or systemd to manage MCPs
- Docker Compose for local development
- Good logging and monitoring

**Startup:**
- Keep MCPs running as services
- Connection pooling
- Graceful fallbacks if MCP unavailable

**Development:**
- Create MCP template/boilerplate
- Start with simpler MCPs (Quiculum)
- Document patterns for future MCPs

---

## Migration Plan

### Phase 1: Convert quiculum-monitor (Immediate)
- Already have Python script
- Add MCP protocol wrapper
- Define tool interface
- Test with Odin

### Phase 2: Playwright MCP (Already exists)
- Use existing Playwright MCP
- Configure in Odin
- Test browser automation

### Phase 3: Price Comparison MCP (Month 8)
- Aggregates multiple sources
- Doesn't need individual marketplace credentials
- Good learning project

### Phase 4: Marketplace MCPs (Month 8-9)
- Amazon MCP
- Blocket MCP
- Facebook Marketplace MCP
- Temu MCP

---

## Alternatives Considered

### Alternative 1: Direct Integration
**Pros:** Simpler initially, no inter-process communication
**Cons:** Tight coupling, security issues, hard to maintain
**Rejected:** Doesn't scale for 10+ integrations

### Alternative 2: Custom Microservices
**Pros:** Full control, can design APIs
**Cons:** Reinventing MCP, more work, no community
**Rejected:** MCP already solves this problem

### Alternative 3: Plugins/Extensions
**Pros:** In-process, simpler than MCP
**Cons:** Security isolation poor, resource management hard
**Rejected:** MCP provides better isolation

---

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Playwright MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/playwright)
- [MCP Community Servers](https://github.com/modelcontextprotocol/servers)
- `/home/samuel/.archon/workspaces/quiculum-monitor` (existing implementation)

---

## Status

**Accepted** - Will be implemented starting Phase 2

**Next Steps:**
1. Convert quiculum-monitor to quiculum-mcp
2. Test MCP connection from Odin
3. Document MCP development pattern
4. Create MCP template for future integrations

---

**Author:** Supervisor + Samuel
**Reviewers:** Samuel
**Last Updated:** 2026-01-15
