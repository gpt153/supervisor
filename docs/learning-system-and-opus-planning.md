# Learning System Improvements & Opus for Planning

**Date:** 2026-01-18

---

## Question A: Improve Learning System - RAG vs .md Files?

### Your Idea (Excellent!)

> "when supervisor is planning an issue/task for subagent to perform, it checks learning db - and if a similar task has been causing problems before it adapts to the solution in db, or at least takes it into account."

**This is exactly right!** Supervisor should check learnings before planning tasks.

### Recommendation: Hybrid Approach (Both!)

**Keep .md files AND add RAG indexing:**

```
Learning System:
├── .md files (human-readable, Git-versioned)
│   └── supervisor-learnings/learnings/*.md
└── RAG database (searchable, semantic)
    └── PostgreSQL + pgvector (same as local RAG)
```

**Why both:**

1. **.md files (keep):**
   - ✅ Human-readable (you can read and understand)
   - ✅ Git-versioned (track changes over time)
   - ✅ Easy to edit manually
   - ✅ Can review in GitHub
   - ✅ Serve as source of truth

2. **RAG database (add):**
   - ✅ Semantic search ("find issues similar to X")
   - ✅ Fast lookup (instant results)
   - ✅ Vector similarity (finds related learnings)
   - ✅ Automatic integration (supervisor checks before planning)

**Best of both worlds:**
- You can read/edit learnings as .md files
- Supervisors can semantically search for relevant learnings
- Changes to .md files auto-sync to RAG database

---

## How It Works

### Current System (Manual Check)

**Now (you have to remember to check):**
```
Supervisor plans task → Maybe checks learnings → Plans implementation
                         ↑
                    (often forgets)
```

**Problem:** Supervisors don't consistently check learnings

### Improved System (Automatic Check)

**After improvement (automatic):**
```
Supervisor receives task
    ↓
Automatically searches RAG for similar tasks
    ↓
Finds relevant learnings (if any)
    ↓
Includes learnings in planning context
    ↓
Plans implementation (avoiding past mistakes)
```

**No manual check needed - always uses past knowledge!**

---

## Implementation

### Step 1: Index Learnings to RAG

**When learning created:**
```typescript
// 1. Write .md file (as you do now)
await fs.writeFile(
  'supervisor-learnings/learnings/008-new-learning.md',
  content
);

// 2. NEW: Also index to RAG database
await localRAG.indexLearning({
  id: '008',
  title: 'Never trust SCAR summaries without verification',
  category: 'scar-integration',
  tags: ['scar', 'verification', 'monitoring'],
  content: content,  // Full .md content
  severity: 'critical'
});

// Now searchable via vector similarity
```

### Step 2: Search Before Planning

**Automatic workflow:**
```typescript
// Supervisor receives task to plan
async function planTask(task: Task): Promise<Plan> {
  // 1. Search learnings for similar tasks
  const relevantLearnings = await localRAG.searchLearnings({
    query: task.description,
    category: task.type,  // e.g., 'scar-integration'
    limit: 5
  });

  // Returns:
  // [
  //   {
  //     id: '006',
  //     title: 'Never trust SCAR summaries without verification',
  //     similarity: 0.89,
  //     content: '...'
  //   },
  //   {
  //     id: '007',
  //     title: 'Monitor SCAR state not just existence',
  //     similarity: 0.82,
  //     content: '...'
  //   }
  // ]

  // 2. Include learnings in planning context
  const planningPrompt = `
Plan implementation for: ${task.description}

RELEVANT PAST LEARNINGS:
${relevantLearnings.map(l => l.content).join('\n\n---\n\n')}

Based on these learnings, create a plan that avoids past mistakes.
  `;

  // 3. Create plan (with learnings in context)
  const plan = await createPlan(planningPrompt);

  return plan;
}
```

**Example:**

**Task:** "Deploy new SCAR agent to monitor issue #42"

**RAG search returns:**
- Learning 006: Never trust SCAR summaries without verification
- Learning 007: Monitor SCAR state not just existence

**Supervisor includes in plan:**
```markdown
## Implementation Plan

### Phase 1: Deploy SCAR Agent
- Spawn SCAR monitoring agent
- **[From learning 007]** Monitor SCAR's actual output, not just file timestamps
- **[From learning 006]** Verify SCAR's work by running tests, don't trust summaries

### Phase 2: Verification
- **[From learning 006]** Build and test the implementation
- Check that tests actually pass (not just that SCAR says they do)
...
```

**Result:** Supervisor automatically avoids mistakes from past learnings!

---

## Should Learnings Be Part of Future Archon (Local RAG)?

**Yes! Same system, different index.**

**Your future local RAG system:**
```
Local RAG (PostgreSQL + pgvector):
├── Documentation index
│   └── React docs, Next.js docs, tRPC docs, etc.
├── Codebase index (future)
│   └── Your project code (searchable)
└── Learnings index ← ADD THIS
    └── Supervisor learnings (searchable)
```

**One RAG system, three indexes:**

1. **Documentation:** "How do I use React hooks?"
2. **Codebase:** "Where is authentication handled in Consilio?"
3. **Learnings:** "What issues happened when deploying SCAR before?"

**All use same technology:**
- PostgreSQL + pgvector
- OpenAI embeddings
- Vector similarity search

**Supervisor can search all three:**
```typescript
// Search documentation
const docs = await localRAG.search('React hooks', { index: 'docs' });

// Search codebase
const code = await localRAG.search('authentication', { index: 'codebase' });

// Search learnings
const learnings = await localRAG.search('SCAR deployment', { index: 'learnings' });
```

---

## Implementation Plan

### Phase 1: Keep .md Files (Already Done)

**Current system:**
- ✅ Learnings stored as .md files
- ✅ Human-readable
- ✅ Git-versioned
- ✅ Categorized and tagged

**Don't change this!**

### Phase 2: Add RAG Indexing (New)

**Add to local RAG system:**

```typescript
// supervisor-service/src/rag/LearningsIndex.ts

export class LearningsIndex {
  private rag: LocalRAG;

  async indexLearning(learning: {
    id: string;
    title: string;
    category: string;
    tags: string[];
    content: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    // Chunk learning content
    const chunks = this.chunkText(learning.content, 512);  // 512 token chunks

    for (const chunk of chunks) {
      // Generate embedding
      const embedding = await this.rag.generateEmbedding(chunk.text);

      // Store in database
      await this.rag.db.query(`
        INSERT INTO knowledge_chunks (
          url, title, text, embedding, tags, source_name, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        `learning://${learning.id}`,
        learning.title,
        chunk.text,
        JSON.stringify(embedding),
        learning.tags,
        'supervisor-learnings',
        JSON.stringify({
          id: learning.id,
          category: learning.category,
          severity: learning.severity,
          chunk: chunk.index
        })
      ]);
    }
  }

  async searchLearnings(query: string, options?: {
    category?: string;
    severity?: string;
    limit?: number;
  }): Promise<Array<LearningResult>> {
    // Generate query embedding
    const queryEmbedding = await this.rag.generateEmbedding(query);

    // Vector similarity search
    const results = await this.rag.db.query(`
      SELECT
        url,
        title,
        text,
        metadata,
        1 - (embedding <=> $1::vector) AS similarity
      FROM knowledge_chunks
      WHERE source_name = 'supervisor-learnings'
        ${options?.category ? `AND metadata->>'category' = $2` : ''}
        ${options?.severity ? `AND metadata->>'severity' = $3` : ''}
      ORDER BY similarity DESC
      LIMIT $4
    `, [
      JSON.stringify(queryEmbedding),
      options?.category,
      options?.severity,
      options?.limit || 5
    ]);

    // Group chunks by learning ID
    const learnings = this.groupChunksByLearning(results.rows);

    return learnings;
  }
}
```

### Phase 3: Auto-Index on Create (New)

**When learning created:**

```typescript
// Current: Write .md file
await writeLearningFile('008-new-issue.md', content);

// NEW: Also index to RAG
await learningsIndex.indexLearning({
  id: '008',
  title: extractTitle(content),
  category: extractCategory(content),
  tags: extractTags(content),
  content: content,
  severity: extractSeverity(content)
});

// Git commit
await gitCommit('Add learning 008');
```

### Phase 4: Auto-Search Before Planning (New)

**Integrate into supervisor workflow:**

```typescript
// In supervisor's plan creation workflow

async function createEpicPlan(epic: Epic): Promise<Plan> {
  // 1. Analyze epic
  const analysis = await analyzeEpic(epic);

  // 2. NEW: Search for relevant learnings
  const relevantLearnings = await learningsIndex.searchLearnings(
    epic.description,
    {
      category: analysis.category,
      limit: 5
    }
  );

  // 3. Include learnings in planning prompt
  const planningContext = `
Epic: ${epic.title}

Description: ${epic.description}

RELEVANT PAST LEARNINGS:
${relevantLearnings.map(l => `
### ${l.title} (Severity: ${l.severity})
${l.content}
`).join('\n---\n')}

Create a detailed implementation plan that:
1. Achieves the epic goals
2. AVOIDS the mistakes documented in past learnings above
3. Applies the solutions from past learnings where relevant
  `;

  const plan = await generatePlan(planningContext);

  return plan;
}
```

---

## Benefits of Hybrid Approach

**For you (human):**
- ✅ Read learnings as .md files (easy to understand)
- ✅ Edit learnings manually (just edit the .md file)
- ✅ Review changes in Git (see history)
- ✅ Browse learnings in GitHub

**For supervisors (AI):**
- ✅ Automatic semantic search before planning
- ✅ Find similar past issues instantly
- ✅ Include relevant learnings in planning context
- ✅ Avoid repeating past mistakes

**For the system:**
- ✅ Single source of truth (.md files)
- ✅ Fast searchability (vector similarity)
- ✅ Consistent format (both humans and AI can use)
- ✅ No manual checking needed (automatic)

---

## Question B: Can You Use Opus for Planning in Claude.ai Browser?

**YES! And you should!**

### How It Works

**Claude.ai browser session:**
- You have Max subscription → Access to Opus 4.5
- Connected to supervisor-service via Claude Agent SDK
- When you call MCP tools, **your browser's Claude (Opus) makes the call**

**supervisor-service spawning agents:**
- Uses Anthropic API directly
- Can specify model per agent (Sonnet, Haiku, Opus)
- You control cost vs quality

### Optimal Setup

**Three-tier model selection:**

```
Planning (you in browser):    Opus 4.5     ← Best reasoning
    ↓
Orchestration (supervisor):   Sonnet 4.5   ← Good balance
    ↓
Execution (PIV agents):       Haiku 4      ← Cheap, fast
```

**Example workflow:**

1. **You plan in browser (Opus):**
   ```
   User (in Claude.ai with Opus): "Plan a new authentication system"

   Opus: "Let me analyze the requirements..."
   [Deep reasoning, considers edge cases, asks clarifying questions]

   Opus calls: mcp__consilio__create_epic({
     title: "Authentication System",
     features: [...]
   })
   ```

2. **Supervisor orchestrates (Sonnet via API):**
   ```
   supervisor-service (Sonnet agent):
   - Receives epic creation request
   - Analyzes codebase
   - Creates GitHub issues
   - Spawns PIV agents for implementation
   ```

3. **PIV agents execute (Haiku via API):**
   ```
   PIV agent (Haiku):
   - Reads prescriptive implementation plan
   - Implements exactly as specified
   - Runs validation
   - Returns results
   ```

### Cost Comparison

**All Sonnet (current):**
- Planning: Sonnet ($3/1M input, $15/1M output)
- Orchestration: Sonnet
- Execution: Sonnet
- **Total: All expensive**

**Optimized (proposed):**
- Planning: Opus ($15/1M input, $75/1M output) - but only for user planning
- Orchestration: Sonnet ($3/1M input, $15/1M output)
- Execution: Haiku ($0.25/1M input, $1.25/1M output) - massive savings
- **Total: Better quality planning, cheaper execution**

### Does Claude Code Support Opus?

**No, Claude Code CLI only has Sonnet and Haiku:**
```
claude --model sonnet   ✅
claude --model haiku    ✅
claude --model opus     ❌ (not available)
```

**But Claude.ai browser does:**
```
Claude.ai Max subscription → Opus 4.5 available ✅
```

### Your Workflow

**Best practice:**

1. **Planning phase (browser with Opus):**
   ```
   Open Claude.ai in browser
   Select Opus 4.5 model
   Connected to supervisor-service (Claude SDK)

   You: "Let's plan the new dashboard feature"
   Opus: [Superior reasoning and planning]
   Opus calls MCP tools to create epics, ADRs
   ```

2. **Implementation phase (automatic):**
   ```
   supervisor-service (Sonnet):
   - Orchestrates implementation
   - Spawns PIV agents (Haiku)
   - Monitors progress

   All automatic after planning phase
   ```

3. **Verification phase (browser with Opus):**
   ```
   You (in browser): "Review the implementation"
   Opus: [Deep code review, catches edge cases]
   ```

**Result:**
- ✅ Best model (Opus) for planning
- ✅ Efficient model (Haiku) for execution
- ✅ Cost-effective
- ✅ High quality

---

## Summary

### Question A: Learning System

**Recommendation:** Hybrid approach (both!)

**Keep:**
- .md files (human-readable, Git-versioned)

**Add:**
- RAG indexing (semantic search, automatic lookup)

**Result:**
- Supervisors automatically check learnings before planning
- Past mistakes avoided automatically
- You can still read/edit learnings as .md files

**Part of future local RAG:** Yes! Same system, learnings index

### Question B: Opus for Planning

**Answer:** Yes! Use Opus in Claude.ai browser

**Optimal setup:**
```
You (browser):        Opus 4.5    ← Best planning
Supervisor:           Sonnet 4.5  ← Orchestration
PIV Agents:           Haiku 4     ← Cheap execution
```

**Claude Code limitation:** No Opus support (CLI only has Sonnet/Haiku)

**Claude.ai browser:** Full Opus 4.5 access ✅

**Your workflow:**
1. Plan in browser with Opus (best reasoning)
2. supervisor-service orchestrates with Sonnet
3. PIV agents execute with Haiku (cheap)

**Best of all worlds!**
