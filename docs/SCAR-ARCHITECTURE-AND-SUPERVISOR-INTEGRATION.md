# How SCAR Solved It - And How We Can Use It For Supervisor

**Date:** 2026-01-17
**Discovery:** SCAR already solves the persistent Claude Code + multi-platform problem

---

## 🔍 How SCAR Works

### The Magic: Claude Agent SDK

**SCAR uses:** `@anthropic-ai/claude-agent-sdk` (version 0.1.57)

This SDK provides:
- ✅ **Programmatic Claude Code control** - Spawn Claude instances via code
- ✅ **Session persistence** - Resume sessions with `resume: sessionId`
- ✅ **MCP server configuration** - Enable MCP tools for spawned instances
- ✅ **Streaming responses** - Real-time async generator pattern
- ✅ **Working directory control** - Each instance runs in specific directory

### SCAR's Architecture

```
User (Telegram/Slack/Discord)
  ↓ sends message
Platform Adapter (telegram.ts, slack.ts, discord.ts)
  ↓ parses message
Orchestrator (orchestrator.ts)
  ↓ gets/creates session from database
Claude Client (claude.ts)
  ↓ calls SDK
@anthropic-ai/claude-agent-sdk
  ↓ spawns process
Claude Code Instance (headless)
  ↓ executes with MCP tools
Returns streaming responses
  ↓ back through chain
User sees responses in real-time
```

### Key Files in SCAR

**1. Claude Client (`src/clients/claude.ts`):**
```typescript
import { query, type Options } from '@anthropic-ai/claude-agent-sdk';

async *sendQuery(prompt: string, cwd: string, resumeSessionId?: string) {
  const options: Options = {
    cwd,  // Working directory
    mcpServers: buildMcpServers(),  // Enable MCP tools
    permissionMode: 'bypassPermissions',  // Auto-approve
  };

  if (resumeSessionId) {
    options.resume = resumeSessionId;  // Resume existing session
  }

  // Spawn Claude Code and stream responses
  for await (const msg of query({ prompt, options })) {
    // Process and yield responses
  }
}
```

**2. Session Management (`src/db/sessions.ts`):**
```typescript
// Store sessions in PostgreSQL
async function getActiveSession(conversationId: string): Promise<Session | null>
async function createSession(data: {...}): Promise<Session>
async function updateSession(id: string, sessionId: string): Promise<void>
```

**3. Telegram Adapter (`src/adapters/telegram.ts`):**
```typescript
class TelegramAdapter {
  // Receives messages from Telegram
  // Calls orchestrator
  // Sends responses back
}
```

**4. Orchestrator (`src/orchestrator/orchestrator.ts`):**
```typescript
async function handleMessage(adapter, conversationId, message) {
  // Get or create session from database
  const session = await getActiveSession(conversationId);

  // Call Claude with session resume if exists
  for await (const chunk of claudeClient.sendQuery(message, cwd, session?.id)) {
    // Stream to user via adapter
    await adapter.sendMessage(conversationId, chunk);
  }
}
```

### How Sessions Persist

1. **First Message:**
   - User sends message via Telegram
   - No session exists → create new session in DB
   - SDK spawns Claude Code instance
   - SDK returns `sessionId`
   - Store `sessionId` in database

2. **Second Message (same conversation):**
   - User sends another message
   - Session exists in DB → get `sessionId`
   - SDK resumes Claude Code with `resume: sessionId`
   - **Full context preserved!**

3. **Container Restart:**
   - SCAR restarts
   - Sessions still in PostgreSQL
   - Next message resumes from `sessionId`
   - **Context survives restarts!**

---

## 🎯 Applying This to Supervisor

### Architecture: Supervisor Service Using Claude Agent SDK

```
┌─────────────────────────────────────────────┐
│  You (Web/Desktop/Mobile)                   │
│  • Claude.ai Projects                       │
│  • Or Telegram                              │
│  • Or custom web UI                         │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  Platform Adapters                          │
│  • MCP Server (Claude.ai Projects)          │
│  • Telegram Bot                             │
│  • Web UI API                               │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  Supervisor Service (Node.js)               │
│  (Uses @anthropic-ai/claude-agent-sdk)      │
│                                             │
│  Project Managers:                          │
│  ┌─────────────────────────────────────┐   │
│  │  Consilio Manager                   │   │
│  │  • cwd: /supervisor/consilio/       │   │
│  │  • sessionId: abc123                │   │
│  │  • Monitors GitHub webhooks         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  OpenHorizon Manager                │   │
│  │  • cwd: /supervisor/openhorizon/    │   │
│  │  • sessionId: def456                │   │
│  │  • Independent context              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [More project managers...]                │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  Claude Code Instances (via SDK)            │
│  • Spawned by SDK as needed                 │
│  • Resume with sessionId                    │
│  • Full CLAUDE.md context                   │
│  • MCP tools enabled                        │
└─────────────────────────────────────────────┘
```

### Implementation

**1. Install Claude Agent SDK:**
```bash
cd ~/supervisor-service
npm install @anthropic-ai/claude-agent-sdk
```

**2. Create Project Manager:**
```typescript
// supervisor-service/src/managers/project-manager.ts

import { query, type Options } from '@anthropic-ai/claude-agent-sdk';
import { db } from './database';

class ProjectManager {
  private projectName: string;
  private planningDir: string;

  constructor(projectName: string) {
    this.projectName = projectName;
    this.planningDir = `/home/samuel/supervisor/${projectName}`;
  }

  async sendCommand(prompt: string): Promise<AsyncGenerator<string>> {
    // Get existing session from database
    const session = await db.getProjectSession(this.projectName);

    const options: Options = {
      cwd: this.planningDir,
      mcpServers: {
        // Enable GitHub MCP
        github: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-github'],
          env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN }
        },
        // Enable Archon MCP (optional)
        archon: {
          type: 'http',
          url: 'http://localhost:8051/mcp'
        }
      },
      permissionMode: 'bypassPermissions', // Auto-approve tools
    };

    if (session?.claude_session_id) {
      options.resume = session.claude_session_id;
    }

    // Spawn/resume Claude Code instance
    for await (const msg of query({ prompt, options })) {
      if (msg.type === 'assistant') {
        const content = msg.message.content;
        for (const block of content) {
          if (block.type === 'text') {
            yield block.text;
          }
        }
      }

      // Store session ID on first response
      if (msg.sessionId && !session?.claude_session_id) {
        await db.updateProjectSession(this.projectName, msg.sessionId);
      }
    }
  }

  async monitorGitHubWebhook(event: GitHubWebhookEvent) {
    if (event.type === 'issue_comment' &&
        event.comment.includes('Implementation complete')) {

      const prompt = `SCAR claims issue #${event.issue_number} is complete. Verify it now using your verification protocol from CLAUDE.md`;

      for await (const response of this.sendCommand(prompt)) {
        console.log(`[${this.projectName}] ${response}`);
        // Responses automatically posted to GitHub via MCP tools
      }
    }
  }
}
```

**3. Create Supervisor Service:**
```typescript
// supervisor-service/src/index.ts

import express from 'express';
import { ProjectManager } from './managers/project-manager';

const app = express();
const managers = {
  consilio: new ProjectManager('consilio'),
  openhorizon: new ProjectManager('openhorizon'),
  'health-agent': new ProjectManager('health-agent'),
  odin: new ProjectManager('odin'),
};

// MCP Server endpoint (for Claude.ai Projects)
app.post('/mcp/execute', async (req, res) => {
  const { project, command } = req.body;
  const manager = managers[project];

  if (!manager) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const responses: string[] = [];
  for await (const chunk of manager.sendCommand(command)) {
    responses.push(chunk);
  }

  res.json({ response: responses.join('') });
});

// GitHub Webhook endpoint
app.post('/webhooks/github', async (req, res) => {
  const event = req.body;
  const project = identifyProject(event.repository.name);
  const manager = managers[project];

  if (manager) {
    // Fire and forget - don't block webhook response
    manager.monitorGitHubWebhook(event).catch(console.error);
  }

  res.status(200).send('OK');
});

app.listen(8080, () => {
  console.log('[Supervisor Service] Running on port 8080');
});
```

**4. Run as Systemd Service:**
```ini
# /etc/systemd/system/supervisor-service.service

[Unit]
Description=Supervisor Service - Persistent Claude Code managers
After=network.target

[Service]
Type=simple
User=samuel
WorkingDirectory=/home/samuel/supervisor-service
ExecStart=/usr/bin/node /home/samuel/supervisor-service/dist/index.js
Restart=always
Environment="CLAUDE_API_KEY=..."
Environment="GITHUB_TOKEN=..."

[Install]
WantedBy=multi-user.target
```

---

## Benefits of This Approach

### ✅ Persistent Supervision (Finally!)
- Claude instances run continuously via SDK
- Sessions survive service restarts
- Each project has independent context
- No manual spawning needed

### ✅ Multi-Platform Access
- **Claude.ai Projects:** Via MCP server endpoint
- **Telegram:** Like SCAR does (reuse their adapter code)
- **Web UI:** Via REST API
- **Mobile:** All of the above work on mobile

### ✅ Intelligent Automation
- Claude makes smart decisions (not dumb scripts)
- Uses learnings (#006, #007)
- Follows CLAUDE.md instructions
- Adapts to situations

### ✅ GitHub Webhook Integration
- SCAR posts "complete" → webhook fires → supervisor verifies automatically
- No polling needed
- Instant response
- You see results when you check back

### ✅ Works While You're Offline
- Service runs 24/7
- Monitors and verifies automatically
- Results waiting when you return
- Full context of what happened

---

## Comparison: Old vs New Approach

### Old Approach (What I First Suggested)
```
❌ Python daemon with scripted logic
❌ Not intelligent - can't adapt
❌ Would need complex automation
❌ Doesn't preserve context well
```

### SCAR's Approach (What Actually Works!)
```
✅ Claude Agent SDK - programmatic Claude Code
✅ Fully intelligent - makes decisions
✅ Built-in session management
✅ Proven in production (SCAR uses it)
✅ Simple code - SDK handles complexity
```

---

## Next Steps: Implementation Plan

### Phase 1: Supervisor Service Core (Week 1)

**Build basic service:**
1. Install `@anthropic-ai/claude-agent-sdk`
2. Create `ProjectManager` class (like above)
3. Create database for session storage
4. Test with one project (Consilio)

**Deliverable:** Can send commands to Consilio supervisor programmatically

---

### Phase 2: GitHub Webhook Integration (Week 2)

**Add automation:**
1. GitHub webhook endpoint
2. Event processing (SCAR "complete" detection)
3. Auto-trigger verification
4. Post results back to GitHub

**Deliverable:** SCAR completes → auto-verification → results posted

---

### Phase 3: MCP Server for Claude.ai (Week 3)

**Enable Claude.ai Projects:**
1. MCP server endpoint
2. Connect Claude.ai Projects to supervisor service
3. Test from mobile/web/desktop

**Deliverable:** Can control supervisor from Claude.ai Projects

---

### Phase 4: Optional Adapters (Week 4)

**Add more interfaces:**
1. Telegram bot (copy SCAR's adapter)
2. Simple web dashboard
3. Mobile notifications

**Deliverable:** Multiple ways to interact

---

## Technical Details

### Session Storage Schema

```sql
CREATE TABLE supervisor_sessions (
  id UUID PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  claude_session_id VARCHAR(255),  -- From SDK
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

### MCP Server API

```typescript
// Tools exposed to Claude.ai Projects

supervisor.send_command({
  project: "consilio",
  command: "Check status of issue #234"
})

supervisor.get_project_status({
  project: "consilio"
})

supervisor.verify_issue({
  project: "consilio",
  issue_number: 234
})
```

### Environment Variables

```env
# Claude credentials
CLAUDE_API_KEY=sk-ant-...
# Or OAuth token
CLAUDE_CODE_OAUTH_TOKEN=...

# GitHub (for MCP)
GITHUB_TOKEN=ghp_...

# Database
DATABASE_URL=postgresql://...

# Optional: Archon MCP
ARCHON_MCP_URL=http://localhost:8051/mcp
ARCHON_TOKEN=...
```

---

## Cost Considerations

### Claude API Usage
- Each project manager has one Claude Code session
- Sessions persist (don't reset unless you restart)
- Pay per API call, not per session
- **When inactive:** No cost (session paused)
- **When active:** Normal Claude Code pricing

### Optimization
- Sessions auto-pause when idle (SDK handles this)
- Only active when processing requests
- Much cheaper than running 24/7
- Similar cost to SCAR (proven model)

---

## Summary: Why This Works

### The Key Technology
`@anthropic-ai/claude-agent-sdk` solves all the hard problems:
- ✅ Spawning Claude Code programmatically
- ✅ Session persistence (context survives restarts)
- ✅ MCP server configuration
- ✅ Streaming responses
- ✅ Working directory control

### SCAR Proved It Works
- Multi-platform (Telegram, Slack, Discord, GitHub)
- Persistent sessions across restarts
- Production-ready (in use today)
- We just adapt their pattern for supervisor

### What You Get
- **Persistent supervision:** Runs 24/7, verifies automatically
- **Multi-platform:** Claude.ai, Telegram, web, mobile
- **Intelligent:** Claude makes decisions, not scripts
- **Independent projects:** No context mixing
- **Works offline:** Supervision continues while you're away

---

## Recommendation

**Use SCAR's proven architecture:**
1. Build supervisor-service with Claude Agent SDK
2. Copy SCAR's adapter patterns
3. Add GitHub webhook integration
4. Connect to Claude.ai Projects via MCP
5. Optional: Telegram bot for mobile notifications

**Result:** Everything you wanted, using proven technology!

---

**Next question:** Should we start building this? Phase 1 (basic service) could be done this week.
