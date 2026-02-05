# Frame0 Troubleshooting & Local RAG System

**Date:** 2026-01-18

---

## Part 1: Frame0 - Why It Didn't Work & How to Fix

### What Happened

**Frame0 MCP tools are available but not working properly.**

Looking at your available tools, you have:
- `mcp__frame0__create_frame`
- `mcp__frame0__create_rectangle`
- `mcp__frame0__create_text`
- `mcp__frame0__export_page_as_image`
- etc.

**Possible reasons it didn't work:**

1. **MCP server not running**
   - Frame0 needs its own MCP server process
   - Tools show up but fail when called

2. **Wrong parameter format**
   - Frame0 tools have specific parameter requirements
   - Error messages might not be clear

3. **Page/frame not initialized**
   - Must create page before creating frame
   - Must create frame before adding shapes

4. **Export issues**
   - Image export might fail silently
   - No clear error feedback

### How to Make Frame0 Work

#### Step 1: Verify Frame0 MCP Server

```bash
# Check if Frame0 MCP server is running
# (Should be in Claude Desktop MCP config or systemd service)

# Look for Frame0 in Claude Desktop config
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
# OR on Linux:
cat ~/.config/Claude/claude_desktop_config.json

# Should see something like:
{
  "mcpServers": {
    "frame0": {
      "command": "npx",
      "args": ["-y", "@frame0/mcp-server"]
    }
  }
}
```

**If Frame0 not configured:** Add it to MCP config

#### Step 2: Test Frame0 Step-by-Step

**Correct sequence:**

```typescript
// 1. Add page first (before anything else)
await mcp__frame0__add_page({ name: "LoginScreen" });

// 2. Create frame
await mcp__frame0__create_frame({
  frameType: "desktop",
  name: "LoginFrame"
});

// 3. Add shapes (must have frame ID)
const frameId = "frame-id-from-previous-step";

await mcp__frame0__create_text({
  parentId: frameId,
  name: "Title",
  text: "Login",
  left: 100,
  top: 50,
  fontSize: 32
});

await mcp__frame0__create_rectangle({
  parentId: frameId,
  name: "EmailInput",
  left: 100,
  top: 120,
  width: 300,
  height: 50,
  fillColor: "#ffffff",
  strokeColor: "#cccccc"
});

// 4. Export to image
await mcp__frame0__export_page_as_image({
  format: "image/png"
});
```

**Key issues to avoid:**
- ❌ Creating shapes without parent frame
- ❌ Missing page creation
- ❌ Wrong parameter names
- ❌ Not waiting for async operations

#### Step 3: Alternative - Try Manual Frame0 First

**Test Frame0 separately:**

```bash
# Install Frame0 CLI
npm install -g @frame0/cli

# Create test design
frame0 create login-screen

# Export
frame0 export login-screen --format png
```

**If CLI works but MCP doesn't:**
- Frame0 is installed correctly
- Issue is with MCP integration
- Need to debug MCP server specifically

### My Recommendation for Frame0

**Option A: Debug Frame0 MCP (Worth trying harder)**

**Why:**
- AI-generated designs are ideal for non-coder
- Frame0 is specifically built for this
- When working, it's the easiest workflow

**How to debug:**
1. Check MCP server logs
2. Test with minimal example
3. Verify parameter formats
4. Check Frame0 version compatibility

**Estimated effort:** 2-4 hours debugging

**Option B: Skip Frame0, Use Figma MCP (Easier)**

**Why:**
- Figma MCP is working (you have the tools)
- Design manually in Figma (browser-based)
- Supervisor extracts components via MCP
- More reliable (official Figma API)

**Workflow:**
```
1. Design in Figma (browser)
2. Share Figma URL with supervisor
3. Supervisor uses mcp__figma__get_design_context()
4. Generates React code automatically
```

**No debugging needed, works today.**

**Option C: Custom Design-to-Code (Long-term best)**

**Build your own:**
- Simple design format (JSON or YAML)
- Supervisor parses and generates code
- Full control, no external dependencies

**Example:**
```yaml
# designs/login-screen.yaml
screen: LoginScreen
type: form
components:
  - type: text
    content: "Login"
    style: heading

  - type: input
    label: "Email"
    placeholder: "you@example.com"
    id: email

  - type: input
    label: "Password"
    inputType: password
    id: password

  - type: button
    label: "Sign In"
    style: primary
    action: submit
```

**Supervisor generates React from this.**

**Pros:**
- ✅ Simple format (non-coder friendly)
- ✅ No external dependencies
- ✅ Full control
- ✅ Version controlled

**Cons:**
- ⚠️ Need to implement parser
- ⚠️ Less visual than Figma

**Estimated effort:** 1-2 days to build

---

## Part 2: Local RAG System vs Archon

### Question: Is It Better Long-Term to Build Our Own RAG?

**Short answer: YES - but use Archon as reference implementation.**

### Archon Architecture Analysis

**What Archon provides:**

```
Archon Stack:
┌─────────────────────────┐
│   Frontend (React)      │
│   Port 3737             │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   API Server (Hono)     │
│   Port 8181             │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   MCP Server            │
│   Port 8051             │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   Supabase PostgreSQL   │
│   + pgvector            │
└─────────────────────────┘
```

**Complexity:**
- Frontend UI (unnecessary for CLI use)
- API server (adds network layer)
- Separate MCP server
- External Supabase dependency
- Task management (we don't need)

**What you actually use:**
- ✅ RAG search via MCP
- ✅ Web crawling
- ✅ Vector embeddings
- ❌ Task management (use GitHub issues)
- ❌ Frontend UI (CLI-based workflow)
- ❌ Project tracking (have own system)

### Proposed: Lightweight Local RAG

**Minimal stack for your needs:**

```
supervisor-service
    ↓
Built-in RAG module
    ↓
Local PostgreSQL + pgvector
    ↓
Crawled documentation
```

**What you need:**

1. **Web crawler** (simple)
2. **Text chunker** (split docs into chunks)
3. **Embeddings generator** (OpenAI or local)
4. **PostgreSQL + pgvector** (already have PostgreSQL)
5. **Search function** (vector similarity)

**That's it!**

### Implementation: Simple RAG in supervisor-service

```typescript
// supervisor-service/src/rag/index.ts

import { OpenAI } from 'openai';
import { Pool } from 'pg';

class LocalRAG {
  private openai: OpenAI;
  private db: Pool;

  async crawlAndIndex(url: string, tags: string[]) {
    // 1. Crawl website (use existing crawler lib)
    const pages = await this.crawl(url);

    // 2. Chunk text
    const chunks = pages.flatMap(page =>
      this.chunkText(page.content)
    );

    // 3. Generate embeddings
    for (const chunk of chunks) {
      const embedding = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk.text
      });

      // 4. Store in PostgreSQL
      await this.db.query(`
        INSERT INTO knowledge_chunks (url, text, embedding, tags)
        VALUES ($1, $2, $3, $4)
      `, [
        chunk.url,
        chunk.text,
        JSON.stringify(embedding.data[0].embedding),
        tags
      ]);
    }
  }

  async search(query: string, limit: number = 5) {
    // 1. Generate query embedding
    const queryEmbedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });

    // 2. Vector similarity search
    const results = await this.db.query(`
      SELECT url, text, tags,
             1 - (embedding <=> $1::vector) AS similarity
      FROM knowledge_chunks
      WHERE 1 - (embedding <=> $1::vector) > 0.7
      ORDER BY similarity DESC
      LIMIT $2
    `, [
      JSON.stringify(queryEmbedding.data[0].embedding),
      limit
    ]);

    return results.rows;
  }
}
```

**Database schema:**

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge chunks table
CREATE TABLE knowledge_chunks (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  text TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI ada-002 dimension
  tags TEXT[],
  source_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast vector search
CREATE INDEX ON knowledge_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for tag search
CREATE INDEX ON knowledge_chunks USING gin(tags);
```

### Comparison: Archon vs Local RAG

| Feature | Archon | Local RAG (Proposed) |
|---------|--------|---------------------|
| **Complexity** | High (4 services) | Low (1 module) |
| **Dependencies** | Supabase (external) | PostgreSQL (already have) |
| **Task Management** | ✅ Included (don't need) | ❌ None (use GitHub) |
| **Frontend UI** | ✅ React app (don't need) | ❌ CLI only |
| **RAG Search** | ✅ Yes | ✅ Yes |
| **Web Crawling** | ✅ Yes | ✅ Yes (same libs) |
| **MCP Integration** | ✅ Separate server | ✅ Built-in |
| **Setup Time** | ~2 hours | ~30 minutes |
| **Maintenance** | High (multiple services) | Low (one module) |
| **Cost** | Supabase hosting | Free (local DB) |
| **Portability** | Requires Supabase | Works anywhere |

### Recommendation: Build Simple Local RAG

**Why:**

1. **Simpler Architecture**
   - One module, not 4 services
   - No external dependencies
   - Part of supervisor-service

2. **Already Have Infrastructure**
   - PostgreSQL already running
   - Just add pgvector extension
   - No new services to manage

3. **Customizable**
   - Control chunking strategy
   - Choose embedding model
   - Optimize for your use case

4. **Cost Effective**
   - No Supabase subscription
   - Local PostgreSQL
   - Only cost: OpenAI embeddings (~$0.10/1M tokens)

5. **Easier to Maintain**
   - One codebase
   - No service coordination
   - Simpler debugging

**When to use Archon:**
- ✅ Need frontend UI
- ✅ Need task management
- ✅ Multiple users/teams
- ✅ Want turnkey solution

**When to use Local RAG:**
- ✅ CLI-only workflow (your case)
- ✅ Already have PostgreSQL
- ✅ Want simple architecture
- ✅ Single user
- ✅ Full control

### Implementation Plan

**Phase 1: Database Setup (30 min)**
```bash
# Install pgvector
sudo apt-get install postgresql-16-pgvector

# Enable in database
psql $DATABASE_URL -c "CREATE EXTENSION vector;"

# Run migration
psql $DATABASE_URL < migrations/005_knowledge_base.sql
```

**Phase 2: Basic RAG Module (4-6 hours)**
```typescript
// Implement:
- Web crawler wrapper (use existing lib)
- Text chunking
- Embedding generation (OpenAI API)
- PostgreSQL storage
- Vector search
```

**Phase 3: MCP Tools (2-3 hours)**
```typescript
// Expose via MCP:
- search_knowledge(query, limit)
- crawl_docs(url, tags)
- list_sources()
```

**Phase 4: Test with Real Docs (1-2 hours)**
```bash
# Crawl React docs
curl -X POST http://localhost:8080/mcp/meta/crawl \
  -d '{"url": "https://react.dev", "tags": ["react"]}'

# Search
curl http://localhost:8080/mcp/meta/search?q="useState hook"
```

**Total: ~1-2 days to implement**

### Migration from Archon

**Keep Archon running during migration:**
1. Build local RAG
2. Crawl same docs in both
3. Compare search results
4. When local RAG works well, deprecate Archon

**No rush - can run both in parallel.**

---

## Final Recommendations

### Frame0
**Option 1 (Recommended):** Try harder to debug Frame0 MCP
- Check MCP server logs
- Test with minimal example
- Estimated: 2-4 hours debugging
- If works: Best UX for non-coder

**Option 2 (Fallback):** Use Figma MCP
- Already working
- Design manually in Figma
- Supervisor extracts via MCP
- Reliable but requires manual design

**Option 3 (Long-term):** Build custom YAML-to-Code
- Simple format
- Full control
- Estimated: 1-2 days
- Best for long-term maintenance

### RAG System
**Recommendation:** Build local RAG in supervisor-service

**Why:**
- ✅ Simpler (one module vs 4 services)
- ✅ Cheaper (no Supabase)
- ✅ Already have PostgreSQL
- ✅ Full control
- ✅ Easier to maintain

**When:**
- After supervisor-service Phase 3 complete
- Before adding all projects
- Can run parallel with Archon during migration

**Estimated effort:** 1-2 days

**This gives you:**
- Self-contained supervisor-service
- No external dependencies
- Simple, maintainable architecture
- Perfect for your use case

---

## Summary

**Frame0:** Worth trying harder (2-4 hours), fallback to Figma MCP if needed

**Repo Structure:** Yes, clone implementation repos into supervisor/ dirs ✅

**Keep .archon/workspaces:** Yes, during migration period ✅

**Local RAG:** Yes, build simple RAG module in supervisor-service ✅
- Simpler than Archon
- Already have infrastructure
- 1-2 days to implement
- Long-term better for your use case

**You're asking all the right questions!** 👍
