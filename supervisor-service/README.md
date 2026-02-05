# Supervisor-Service: MCP + Claude SDK Bridge

**Purpose:** MCP server that connects Claude.ai browser to local supervisors via Claude Agent SDK

**This directory contains ONLY:**
- ✅ MCP server implementation (stdio transport)
- ✅ Claude Agent SDK integration
- ✅ Multi-project endpoint routing

**This directory does NOT contain:**
- ❌ Supervisor planning (that's in `/home/samuel/sv/.bmad/`)
- ❌ Supervisor instructions (that's in each project's directory)
- ❌ PIV loop implementation (that's in each project's directory)
- ❌ Infrastructure automation (secrets, ports, DNS, VMs - separate services)

---

## What This Service Does

### Architecture

```
Claude.ai Browser (user)
         ↓
    MCP Tool Call
         ↓
  supervisor-service (this)
         ↓
   Claude Agent SDK
         ↓
  Project Supervisor Agent
  (spawned per project)
```

### Multiple Project Endpoints

```
/mcp/meta → Meta-supervisor agent
/mcp/consilio → Consilio project agent
/mcp/odin → Odin project agent
/mcp/openhorizon → OpenHorizon project agent
/mcp/health-agent → Health-Agent project agent
```

---

## What Gets Built Here

### Phase 1: Basic MCP Server

**Files:**
```
src/
├── mcp/
│   ├── server.ts              # MCP stdio server
│   ├── router.ts              # Route to project endpoints
│   └── types.ts               # MCP types
└── index.ts                   # Entry point
```

**What it does:**
- Starts MCP server on stdio
- Accepts tool calls from Claude.ai browser
- Routes to correct project endpoint
- Returns results

### Phase 2: Claude Agent SDK Integration

**Files:**
```
src/
├── agents/
│   ├── AgentManager.ts        # Spawn/manage Claude agents
│   ├── ProjectAgent.ts        # Agent per project
│   └── types.ts
└── config/
    └── projects.ts            # Project configurations
```

**What it does:**
- Creates persistent Claude agent per project
- Maintains conversation context
- Stores sessions in local file/DB
- Reconnects on restart

### Phase 3: Multi-Project Routing

**Files:**
```
src/
├── endpoints/
│   ├── MetaEndpoint.ts        # Meta-supervisor endpoint
│   ├── ProjectEndpoint.ts     # Generic project endpoint
│   └── registry.ts            # Endpoint registry
└── middleware/
    └── context-isolation.ts   # Prevent context mixing
```

**What it does:**
- Isolates context per project
- Routes tools to correct agent
- Prevents cross-project leakage

---

## What Does NOT Go Here

### ❌ Supervisor Instructions
**Location:** Each project directory has its own `CLAUDE.md`

Example:
```
/home/samuel/sv/consilio/CLAUDE.md  # Consilio supervisor instructions
/home/samuel/sv/odin/CLAUDE.md      # Odin supervisor instructions
```

This service just **routes to** the agents that use those instructions.

### ❌ PIV Loop Implementation
**Location:** Each project implements its own PIV loop

Example:
```
/home/samuel/sv/consilio/
├── .agents/
│   └── piv/
│       ├── prime.ts
│       ├── plan.ts
│       └── execute.ts
```

This service just **spawns** the agents that run PIV loops.

### ❌ Infrastructure Services
**Location:** Separate services (future implementation)

- Secrets management → Separate service
- Port allocation → Separate service
- Cloudflare DNS → Separate service
- GCloud VMs → Separate service

This service just **connects browser to agents**.

### ❌ Planning Documentation
**Location:** `/home/samuel/sv/.bmad/` (symlinked for reference)

This service has a symlink `.bmad → /home/samuel/sv/.bmad/` for reference only.

---

## Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@anthropic-ai/sdk": "^0.30.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev

# Run in production
npm start
```

---

## Configuration

### Environment Variables

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...

# Project paths
META_PROJECT_PATH=/home/samuel/sv/.bmad
CONSILIO_PROJECT_PATH=/home/samuel/sv/consilio
ODIN_PROJECT_PATH=/home/samuel/sv/odin
OPENHORIZON_PROJECT_PATH=/home/samuel/sv/openhorizon
HEALTH_AGENT_PROJECT_PATH=/home/samuel/sv/health-agent
```

### Project Configuration

```typescript
// src/config/projects.ts
export const PROJECTS = {
  meta: {
    name: 'meta',
    path: process.env.META_PROJECT_PATH,
    endpoint: '/mcp/meta'
  },
  consilio: {
    name: 'consilio',
    path: process.env.CONSILIO_PROJECT_PATH,
    endpoint: '/mcp/consilio'
  },
  // ... other projects
};
```

---

## Testing

### Test with Claude.ai Browser

1. Configure MCP in Claude Desktop:
```json
{
  "mcpServers": {
    "supervisor-meta": {
      "command": "node",
      "args": ["/home/samuel/sv/supervisor-service/dist/index.js", "meta"]
    },
    "supervisor-consilio": {
      "command": "node",
      "args": ["/home/samuel/sv/supervisor-service/dist/index.js", "consilio"]
    }
  }
}
```

2. Open Claude.ai Projects
3. Create 5 Projects (Meta, Consilio, Odin, OpenHorizon, Health-Agent)
4. Each connects to its MCP endpoint
5. Test tool calls work

---

## Architecture Decisions

### Why separate service?

**This service is the "bridge":**
- Claude.ai browser ↔ MCP ↔ This service ↔ Claude SDK ↔ Project agents

**Benefits:**
- Single entry point for all projects
- Context isolation guaranteed
- Can restart projects without losing browser connection
- Can upgrade individual project agents independently

### Why NOT include PIV loop here?

**PIV loop is project-specific:**
- Different projects have different tech stacks
- Different projects have different patterns
- Each project's PIV agents need their own context

**This service just routes to them.**

---

## Status

**Current:** Clean slate - only MCP + SDK bridge code belongs here

**Next:** Build MCP server with multi-project routing

**Reference:** See `/home/samuel/sv/.bmad/` (symlinked) for planning docs
