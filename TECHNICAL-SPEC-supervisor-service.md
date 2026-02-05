# Technical Specification: Supervisor-Service

**Version:** 1.0
**Date:** 2026-01-18
**Related:** PRD-supervisor-service.md
**Status:** Ready for Implementation

---

## System Architecture

### Component Diagram

```
supervisor-service/
├── src/
│   ├── server.ts                    # Main entry point
│   ├── mcp/
│   │   ├── MCPServer.ts            # Multi-endpoint MCP server
│   │   ├── endpoints/
│   │   │   ├── MetaEndpoint.ts     # /mcp/meta
│   │   │   └── ProjectEndpoint.ts  # /mcp/{project}
│   │   └── tools/
│   │       ├── secrets.ts          # Secret management tools
│   │       ├── ports.ts            # Port allocation tools
│   │       ├── cloudflare.ts       # Cloudflare tools
│   │       ├── gcloud.ts           # GCloud tools
│   │       └── timing.ts           # Task timing tools
│   │
│   ├── secrets/
│   │   ├── SecretsManager.ts       # Core secret management
│   │   └── AutoSecretDetector.ts   # Pattern recognition
│   │
│   ├── ports/
│   │   └── PortManager.ts          # Port allocation
│   │
│   ├── cloudflare/
│   │   └── CloudflareManager.ts    # DNS + tunnel management
│   │
│   ├── gcloud/
│   │   ├── GCloudManager.ts        # VM management
│   │   └── APIKeyCreator.ts        # Google API key creation
│   │
│   ├── timing/
│   │   └── TaskTimer.ts            # Execution tracking
│   │
│   ├── instructions/
│   │   ├── InstructionAssembler.ts # CLAUDE.md generation
│   │   └── AdaptLocalClaude.ts     # Project analysis
│   │
│   ├── rag/
│   │   ├── LocalRAG.ts             # Core RAG system
│   │   └── LearningsIndex.ts       # Learning search
│   │
│   ├── agents/
│   │   ├── MetaSupervisor.ts       # Meta-supervisor agent
│   │   ├── ProjectSupervisor.ts    # Project supervisor agent
│   │   └── piv/
│   │       ├── PrimePhase.ts       # Research phase
│   │       ├── PlanPhase.ts        # Design phase
│   │       └── ExecutePhase.ts     # Implementation phase
│   │
│   └── api-keys/
│       └── APIKeyManager.ts        # Auto-create API keys
│
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_secrets_management.sql
│   ├── 003_port_allocation.sql
│   ├── 004_task_timing.sql
│   └── 005_learnings_index.sql
│
├── .supervisor-core/               # Core instructions (all supervisors)
│   ├── core-behaviors.md
│   ├── tool-usage.md
│   ├── bmad-methodology.md
│   ├── communication-style.md
│   ├── error-handling.md
│   └── context-management.md
│
├── .supervisor-meta/               # Meta-specific instructions
│   ├── meta-specific.md
│   └── project-management.md
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Database Schema

### Overview

**Database:** PostgreSQL 14+
**Extensions:** pgvector, pgcrypto
**Location:** Same PostgreSQL instance as existing projects

### Schema Design

#### 1. Secrets Management

```sql
-- Enable encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Secrets table
CREATE TABLE secrets (
  id SERIAL PRIMARY KEY,
  key_path TEXT NOT NULL UNIQUE,
  encrypted_value BYTEA NOT NULL,
  description TEXT,
  scope TEXT NOT NULL,           -- 'meta', 'project', 'service'
  project_name TEXT,
  service_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT DEFAULT 'supervisor',
  last_accessed_at TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  rotation_required BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

CREATE INDEX idx_secrets_key_path ON secrets(key_path);
CREATE INDEX idx_secrets_scope ON secrets(scope);
CREATE INDEX idx_secrets_project ON secrets(project_name) WHERE project_name IS NOT NULL;
```

#### 2. Port Allocation

```sql
-- Port allocations
CREATE TABLE port_allocations (
  id SERIAL PRIMARY KEY,
  port INTEGER NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  description TEXT,
  cloudflare_tunnel_id TEXT,
  cloudflare_hostname TEXT,
  status TEXT NOT NULL DEFAULT 'allocated',
  allocated_at TIMESTAMP DEFAULT NOW(),
  last_verified_at TIMESTAMP,
  allocated_by TEXT DEFAULT 'supervisor',
  notes TEXT,

  UNIQUE(project_name, service_name)
);

-- Project port ranges
CREATE TABLE project_port_ranges (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL UNIQUE,
  project_name TEXT NOT NULL UNIQUE,
  port_range_start INTEGER NOT NULL,
  port_range_end INTEGER NOT NULL,
  ports_used INTEGER DEFAULT 0,
  ports_available INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),

  CHECK (port_range_end > port_range_start),
  CHECK (port_range_end - port_range_start = 99)
);

-- Shared services
CREATE TABLE shared_service_ports (
  id SERIAL PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  port INTEGER NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'allocated',
  allocated_at TIMESTAMP DEFAULT NOW(),

  CHECK (port >= 9000 AND port <= 9999)
);
```

#### 3. Task Timing

```sql
-- Task executions
CREATE TABLE task_executions (
  id SERIAL PRIMARY KEY,
  task_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  task_description TEXT NOT NULL,
  project_name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  agent_model TEXT NOT NULL,
  parent_task_id TEXT,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  estimated_seconds INTEGER,
  estimation_error NUMERIC,
  status TEXT NOT NULL,
  parallel_count INTEGER DEFAULT 1,
  retry_count INTEGER DEFAULT 0,
  tokens_used INTEGER,
  complexity TEXT,
  lines_of_code_changed INTEGER,
  files_changed INTEGER,
  tests_written INTEGER,
  success BOOLEAN,
  error_message TEXT,
  output_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_task_executions_type ON task_executions(task_type);
CREATE INDEX idx_task_executions_project ON task_executions(project_name);
CREATE INDEX idx_task_executions_started ON task_executions(started_at);
CREATE INDEX idx_task_executions_description ON task_executions
  USING GIN (to_tsvector('english', task_description));

-- Aggregate stats
CREATE TABLE task_type_stats (
  id SERIAL PRIMARY KEY,
  task_type TEXT NOT NULL,
  project_name TEXT,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  avg_duration_seconds NUMERIC,
  median_duration_seconds NUMERIC,
  p95_duration_seconds NUMERIC,
  min_duration_seconds INTEGER,
  max_duration_seconds INTEGER,
  last_updated TIMESTAMP DEFAULT NOW(),

  UNIQUE(task_type, project_name)
);

-- Parallel tracking
CREATE TABLE parallel_executions (
  id SERIAL PRIMARY KEY,
  parent_task_id TEXT NOT NULL,
  child_task_ids TEXT[] NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  sequential_estimate INTEGER,
  parallel_actual INTEGER,
  time_saved_seconds INTEGER,
  parallelism_efficiency NUMERIC,
  agent_count INTEGER,
  completion_order TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. RAG Knowledge Base

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge chunks (for docs, codebase, learnings)
CREATE TABLE knowledge_chunks (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  text TEXT NOT NULL,
  embedding vector(1536),        -- OpenAI ada-002/text-embedding-3-small
  tags TEXT[],
  source_name TEXT,              -- 'docs', 'codebase', 'supervisor-learnings'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX ON knowledge_chunks USING gin(tags);
CREATE INDEX idx_knowledge_source ON knowledge_chunks(source_name);
```

---

## API Specification

### MCP Tool Definitions

#### Secrets Management

```typescript
// Get secret
{
  name: 'mcp__meta__get_secret',
  parameters: {
    keyPath: string  // 'meta/cloudflare/api_token'
  },
  returns: string | null
}

// Set secret
{
  name: 'mcp__meta__set_secret',
  parameters: {
    keyPath: string,
    value: string,
    description?: string,
    expiresAt?: string
  },
  returns: void
}

// List secrets
{
  name: 'mcp__meta__list_secrets',
  parameters: {
    scope?: 'meta' | 'project' | 'service',
    project?: string
  },
  returns: Array<{
    keyPath: string,
    description: string,
    lastAccessed: string
  }>
}
```

#### Port Allocation

```typescript
// Get or allocate port
{
  name: 'mcp__meta__get_port',
  parameters: {
    projectName: string,
    serviceName: string,
    description?: string,
    cloudflareHostname?: string
  },
  returns: number  // Port number
}

// List ports
{
  name: 'mcp__meta__list_ports',
  parameters: {
    projectName?: string
  },
  returns: Array<{
    port: number,
    projectName: string,
    serviceName: string,
    cloudflareHostname: string
  }>
}

// Audit ports
{
  name: 'mcp__meta__audit_ports',
  parameters: {},
  returns: {
    allocated: number,
    inUse: number,
    conflicts: Array<{port: number, expected: string, actual: string}>
  }
}
```

#### Cloudflare Management

```typescript
// Create CNAME
{
  name: 'mcp__meta__create_cname',
  parameters: {
    hostname: string,     // 'api.consilio.153.se'
    target: string,       // 'tunnel.153.se'
    proxied?: boolean
  },
  returns: {
    id: string,
    name: string,
    content: string
  }
}

// Sync tunnel routes
{
  name: 'mcp__meta__sync_tunnel',
  parameters: {},
  returns: {
    routesUpdated: number,
    tunnelRestarted: boolean
  }
}
```

#### GCloud Management

```typescript
// Get VM details
{
  name: 'mcp__meta__gcloud_get_vm',
  parameters: {
    project: string,      // 'vm-host'
    zone: string,         // 'us-central1-a'
    instanceName: string
  },
  returns: {
    name: string,
    status: string,
    machineType: string,
    cpus: number,
    memoryMB: number,
    internalIP: string,
    externalIP: string
  }
}

// Get VM health
{
  name: 'mcp__meta__gcloud_vm_health',
  parameters: {
    project: string,
    zone: string,
    instanceName: string,
    minutes?: number  // Default 60
  },
  returns: {
    cpu: {average: number, max: number, current: number},
    memory: {average: number, max: number, current: number},
    disk: {totalGB: number, usedGB: number, usedPercent: number}
  }
}

// Resize VM
{
  name: 'mcp__meta__gcloud_resize_vm',
  parameters: {
    project: string,
    zone: string,
    instanceName: string,
    newMachineType: string  // 'n1-standard-4'
  },
  returns: void
}
```

#### Task Timing

```typescript
// Estimate task
{
  name: 'mcp__meta__estimate_task',
  parameters: {
    taskDescription: string,
    taskType: string,
    projectName: string,
    complexity?: 'simple' | 'medium' | 'complex'
  },
  returns: {
    estimatedSeconds: number,
    confidenceIntervalLow: number,
    confidenceIntervalHigh: number,
    sampleSize: number,
    similarTasks: Array<{description: string, duration: number}>
  }
}

// Start task timer
{
  name: 'mcp__meta__start_task_timer',
  parameters: {
    taskId: string,
    taskType: string,
    taskDescription: string,
    projectName: string,
    agentType: string,
    estimatedSeconds?: number
  },
  returns: void
}

// Complete task timer
{
  name: 'mcp__meta__complete_task_timer',
  parameters: {
    taskId: string,
    success: boolean,
    linesOfCodeChanged?: number,
    filesChanged?: number
  },
  returns: {
    durationSeconds: number,
    estimationError: number
  }
}
```

---

## Implementation Details

### 1. Secrets Manager

**Encryption:**
```typescript
// AES-256-GCM encryption
private encrypt(value: string): Buffer {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
  let encrypted = cipher.update(value, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Return: IV (16) + Auth Tag (16) + Encrypted Data
  return Buffer.concat([iv, authTag, encrypted]);
}
```

**Automatic Detection:**
```typescript
// Regex patterns for common API keys
const patterns = {
  anthropic: /^sk-ant-[a-zA-Z0-9-_]{95,}$/,
  openai: /^sk-[a-zA-Z0-9]{48}$/,
  stripe: /^sk_(live|test)_[a-zA-Z0-9]{24,}$/,
  // ... more patterns
};
```

### 2. Port Manager

**Allocation Algorithm:**
```typescript
// Find next available port in range
async allocate(project: string, service: string): Promise<number> {
  const range = await this.getRange(project);
  const used = await this.getUsedPorts(project);

  // Find first gap
  let port = range.start;
  while (used.has(port) && port <= range.end) {
    port++;
  }

  if (port > range.end) {
    throw new Error('No available ports');
  }

  await this.markUsed(port, project, service);
  return port;
}
```

### 3. Cloudflare Manager

**Tunnel Sync:**
```typescript
async syncTunnel(portManager: PortManager): Promise<void> {
  // Get all allocations with hostnames
  const allocations = await portManager.listAll();

  const rules = allocations
    .filter(a => a.cloudflareHostname)
    .map(a => ({
      hostname: a.cloudflareHostname,
      service: `http://localhost:${a.port}`
    }));

  // Update /etc/cloudflared/config.yml
  await this.writeConfig(rules);

  // Restart cloudflared
  await exec('sudo systemctl restart cloudflared');
}
```

### 4. Task Timer

**Estimation Algorithm:**
```typescript
async estimate(task: TaskDescription): Promise<Estimate> {
  // 1. Text search for similar tasks
  const similar = await this.db.query(`
    SELECT duration_seconds,
           ts_rank(to_tsvector(task_description),
                   plainto_tsquery($1)) AS relevance
    FROM task_executions
    WHERE task_type = $2 AND project_name = $3
          AND status = 'completed'
    ORDER BY relevance DESC
    LIMIT 20
  `, [task.description, task.type, task.project]);

  // 2. Calculate statistics
  const durations = similar.rows.map(r => r.duration_seconds);
  const avg = mean(durations);
  const stdDev = standardDeviation(durations);

  // 3. 95% confidence interval
  return {
    estimated: avg,
    confidenceLow: avg - 1.96 * stdDev,
    confidenceHigh: avg + 1.96 * stdDev,
    sampleSize: durations.length
  };
}
```

---

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/supervisor

# Encryption
SECRETS_ENCRYPTION_KEY=<256-bit-hex-key>

# APIs (stored in secrets, but bootstrap needs these)
ANTHROPIC_API_KEY=<bootstrap-key>
CLOUDFLARE_API_TOKEN=<bootstrap-token>

# Server
PORT=8080
NODE_ENV=production

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/supervisor-service.log
```

### systemd Service

```ini
# /etc/systemd/system/supervisor-service.service

[Unit]
Description=Supervisor Service - Multi-Project AI Orchestration
After=network.target postgresql.service

[Service]
Type=simple
User=samuel
WorkingDirectory=/home/samuel/supervisor/supervisor-service
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10

# Environment
Environment="NODE_ENV=production"
Environment="PORT=8080"
Environment="DATABASE_URL=postgresql://localhost/supervisor"
EnvironmentFile=/home/samuel/supervisor/supervisor-service/.env

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

---

## Testing Strategy

### Unit Tests

**Coverage target:** 80%

```typescript
// secrets/SecretsManager.test.ts
describe('SecretsManager', () => {
  it('encrypts and decrypts secrets', async () => {
    const secret = 'sk-ant-abc123...';
    await manager.set('meta/test', secret);
    const retrieved = await manager.get('meta/test');
    expect(retrieved).toBe(secret);
  });

  it('returns null for non-existent secret', async () => {
    const retrieved = await manager.get('nonexistent');
    expect(retrieved).toBeNull();
  });
});
```

### Integration Tests

**Key scenarios:**

1. **Full deployment workflow**
   - Allocate port
   - Create DNS record
   - Deploy service
   - Verify accessible

2. **Parallel execution**
   - Spawn 4 agents
   - Track timing
   - Verify efficiency

3. **Secret rotation**
   - Update secret
   - Verify old value no longer works
   - Verify new value works

### End-to-End Tests

**User scenarios:**

1. Deploy new service (30 min)
2. Add new project (5 min)
3. Check all project status (10 sec)
4. Scale VM based on load (5 min)

---

## Performance Requirements

### Response Times

```
MCP tool call:         < 500ms   (p95)
Secret retrieval:      < 100ms   (p95)
Port allocation:       < 200ms   (p95)
DNS record creation:   < 2s      (p95)
VM resize:             < 180s    (p95)
Estimation query:      < 1s      (p95)
```

### Throughput

```
Concurrent MCP requests:    100/sec
Secret retrievals:          500/sec
Port allocations:           10/sec
Task completions logged:    50/sec
```

### Storage

```
Secrets:              ~1 KB each, ~100 total = 100 KB
Port allocations:     ~500 bytes each, ~50 total = 25 KB
Task executions:      ~2 KB each, 10K/month = 20 MB/month
Knowledge chunks:     ~1 KB each, 100K total = 100 MB
Total estimated:      ~150 MB (negligible)
```

---

## Deployment

### Initial Setup

```bash
# 1. Clone repo
git clone https://github.com/gpt153/supervisor-service
cd supervisor-service

# 2. Install dependencies
npm install

# 3. Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Configure environment
cp .env.example .env
# Edit .env with DATABASE_URL, SECRETS_ENCRYPTION_KEY, etc.

# 5. Run migrations
npm run migrate

# 6. Build
npm run build

# 7. Start
sudo systemctl enable supervisor-service
sudo systemctl start supervisor-service

# 8. Verify
curl http://localhost:8080/health
```

### Monitoring

**Health check endpoint:**
```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    database: await checkDatabase(),
    memoryUsage: process.memoryUsage(),
    activeAgents: getActiveAgentCount()
  };
  res.json(health);
});
```

**Logs:**
```bash
# Application logs
tail -f /var/log/supervisor-service.log

# systemd logs
journalctl -u supervisor-service -f

# Database logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## Security Considerations

### Secret Storage

1. **Encryption at rest:** AES-256-GCM
2. **Key management:** Environment variable (systemd)
3. **Audit trail:** All accesses logged
4. **Never in Git:** Secrets never committed
5. **Never in logs:** Secrets redacted in logs

### API Access

1. **Least privilege:** Scoped API keys where possible
2. **Rotation:** Quarterly for long-lived keys
3. **Monitoring:** Alert on unusual API usage
4. **Rate limiting:** Prevent abuse

### Service Accounts

1. **GCloud:** Owner role (needed for full access)
2. **Cloudflare:** DNS + Tunnel only
3. **GitHub:** Repo-scoped tokens
4. **Keys in secrets:** Never in environment or files

---

## Appendix

### Key Algorithms

**1. Similar Task Matching (RAG-based)**
- Text embedding (OpenAI text-embedding-3-small)
- Vector similarity search (cosine distance)
- Threshold: 0.7 similarity minimum

**2. Estimation Confidence Interval**
- Normal distribution assumption
- 95% confidence: mean ± 1.96 × stddev
- Fallback to type average if < 5 samples

**3. Port Allocation**
- Sequential search from range start
- First-fit algorithm
- O(n) where n = ports used

**4. Parallel Efficiency**
- Efficiency = (sequential / agent_count) / parallel_actual
- Ideal = 1.0 (perfect parallelism)
- Target = 0.7+ (70% efficient)

---

**END OF TECHNICAL SPECIFICATION**

**Next:** Epic breakdown and implementation roadmap
