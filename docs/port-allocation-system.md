# Port Allocation System

**Date:** 2026-01-18
**Problem:** Port conflicts waste significant time, services deploy on default ports causing conflicts
**Solution:** Simple port allocation with guaranteed conflict prevention

---

## The Problem

**What happens now:**
1. New service tries default port (e.g., 3000, 8080)
2. Port already used by another service
3. Conflict - service fails to start
4. OR: Service checks port, finds it free (service temporarily down)
5. Service starts successfully
6. Later: Original service restarts → conflict
7. Both services broken, time wasted debugging

**What you said:**
> "this has been a big waste of time. i have tried several times before to implement a system but a new project is deploying a service and still does it on the default port that causes a conflict. or it does a check, but the service currently using that port, and already have it asigne in cloudflare tunnel happends to be down at the time of checking, so new service starts and works, bet a conflict occurs when the original service is restarted."

**Root cause:** No single source of truth for port allocation

---

## Proposed Solution: Port Range Allocation Per Project

**Why port ranges:**
- ✅ No central coordination needed
- ✅ Each project owns its range
- ✅ No checking if port is available
- ✅ Impossible to have conflicts
- ✅ Simple to remember
- ✅ Scales to many projects

**Why NOT centralized document:**
- ❌ Race conditions (two services claim same port simultaneously)
- ❌ Requires meta-supervisor coordination
- ❌ Document can be stale
- ❌ More complex

**Decision: Use port ranges per project**

---

## Port Range Allocation

### Range Design

**Total available ports:** 1024-65535 (64,511 ports)

**Reserved ranges (don't use):**
- 1-1023: System ports (HTTP=80, HTTPS=443, SSH=22, etc.)
- 1024-2999: Dynamic/ephemeral (OS assigns these automatically)
- 65000-65535: High ephemeral range

**Our allocation range:** 3000-64999 (61,999 ports)

**Per-project allocation:** 100 ports per project
- 100 ports more than enough for any single project
- **619 projects possible** before running out
- Simple math (project 1 = 3000-3099, project 2 = 3100-3199, etc.)

**Shared services allocation:** 9000-9999 (1000 ports)
- For services used across all projects
- Penpot, Storybook, Archon, monitoring tools, etc.

### Allocation Table

```
Project ID | Project Name       | Port Range  | Example Services
-----------|-------------------|-------------|------------------
0          | Meta-Supervisor   | 3000-3099   | 3000=dashboard, 3001=api, 3002=metrics
1          | Consilio          | 3100-3199   | 3100=web, 3101=api, 3102=websocket
2          | OpenHorizon       | 3200-3299   | 3200=web, 3201=api, 3202=db-proxy
3          | Health-Agent      | 3300-3399   | 3300=web, 3301=api
4          | Odin              | 3400-3499   | 3400=web, 3401=api
5          | Quiculum Monitor  | 3500-3599   | 3500=web, 3501=api
6-9        | Future Projects   | 3600-3999   | Reserved
10-99      | Future Projects   | 4000-12999  | Reserved (90 projects)
100-619    | Far Future        | 13000-64999 | Reserved (519 projects)
```

**Shared services allocation:** 9000-9999 (1000 ports)

```
Service         | Port  | Description
----------------|-------|-------------
Penpot          | 9001  | UI design tool
Storybook       | 9002  | Web component playground
Expo Info       | 9003  | Mobile workflow info page
Archon (future) | 9004  | Local RAG system
Prometheus      | 9005  | Metrics monitoring
Grafana         | 9006  | Metrics visualization
PostgreSQL      | 5432  | Database (standard port, not in range)
Redis (future)  | 9007  | Caching
MCP Meta        | 8080  | Meta-supervisor MCP endpoint
MCP Projects    | 8081+ | Project-specific MCP endpoints
```

**Note:** Shared services can use any port in 9000-9999 range

---

## Database Schema

**Store allocation in PostgreSQL:**

```sql
-- Port allocation table
CREATE TABLE port_allocations (
  id SERIAL PRIMARY KEY,

  -- Allocation
  port INTEGER NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  description TEXT,

  -- Cloudflare tunnel integration
  cloudflare_tunnel_id TEXT,      -- UUID of tunnel (if exposed)
  cloudflare_hostname TEXT,       -- e.g., api.consilio.153.se

  -- Status
  status TEXT NOT NULL DEFAULT 'allocated',  -- allocated, in_use, released
  allocated_at TIMESTAMP DEFAULT NOW(),
  last_verified_at TIMESTAMP,

  -- Metadata
  allocated_by TEXT DEFAULT 'supervisor',
  notes TEXT,

  UNIQUE(project_name, service_name)  -- One port per service per project
);

-- Indexes
CREATE INDEX idx_ports_project ON port_allocations(project_name);
CREATE INDEX idx_ports_status ON port_allocations(status);
CREATE INDEX idx_ports_port ON port_allocations(port);

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
  CHECK (port_range_end - port_range_start = 99)  -- Each project gets 100 ports
);

-- Initialize project port ranges
INSERT INTO project_port_ranges (project_id, project_name, port_range_start, port_range_end, ports_available) VALUES
  (0, 'meta-supervisor', 3000, 3099, 100),
  (1, 'consilio', 3100, 3199, 100),
  (2, 'openhorizon', 3200, 3299, 100),
  (3, 'health-agent', 3300, 3399, 100),
  (4, 'odin', 3400, 3499, 100),
  (5, 'quiculum-monitor', 3500, 3599, 100);

-- Shared services (not project-specific)
CREATE TABLE shared_service_ports (
  id SERIAL PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  port INTEGER NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'allocated',
  allocated_at TIMESTAMP DEFAULT NOW(),

  CHECK (port >= 9000 AND port <= 9999)  -- Shared services range
);

-- Initialize shared services
INSERT INTO shared_service_ports (service_name, port, description) VALUES
  ('penpot', 9001, 'UI design tool'),
  ('storybook', 9002, 'Web component playground'),
  ('expo-info', 9003, 'Mobile workflow info page'),
  ('archon', 9004, 'Local RAG system (future)'),
  ('prometheus', 9005, 'Metrics monitoring'),
  ('grafana', 9006, 'Metrics visualization'),
  ('redis', 9007, 'Caching (future)'),
  ('mcp-meta', 8080, 'Meta-supervisor MCP endpoint');
```

---

## PortManager Implementation

```typescript
// supervisor-service/src/ports/PortManager.ts

import { Pool } from 'pg';

export class PortManager {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Allocate next available port for a service
   */
  async allocate(
    projectName: string,
    serviceName: string,
    options?: {
      description?: string;
      cloudflareHostname?: string;
    }
  ): Promise<number> {
    // Get project's port range
    const rangeResult = await this.db.query(`
      SELECT port_range_start, port_range_end, ports_used
      FROM project_port_ranges
      WHERE project_name = $1
    `, [projectName]);

    if (rangeResult.rows.length === 0) {
      throw new Error(`Project ${projectName} not found in port ranges`);
    }

    const { port_range_start, port_range_end, ports_used } = rangeResult.rows[0];

    if (ports_used >= 100) {
      throw new Error(`Project ${projectName} has exhausted all 100 ports`);
    }

    // Find next available port in range
    const allocatedPorts = await this.db.query(`
      SELECT port
      FROM port_allocations
      WHERE project_name = $1
      AND port >= $2
      AND port <= $3
      ORDER BY port
    `, [projectName, port_range_start, port_range_end]);

    const usedPorts = new Set(allocatedPorts.rows.map(row => row.port));

    // Find first gap
    let port = port_range_start;
    while (usedPorts.has(port) && port <= port_range_end) {
      port++;
    }

    if (port > port_range_end) {
      throw new Error(`No available ports in range ${port_range_start}-${port_range_end}`);
    }

    // Allocate port
    await this.db.query(`
      INSERT INTO port_allocations (
        port, project_name, service_name, description,
        cloudflare_hostname, status, allocated_by
      ) VALUES ($1, $2, $3, $4, $5, 'allocated', 'supervisor')
      ON CONFLICT (project_name, service_name)
      DO UPDATE SET
        port = $1,
        description = $4,
        cloudflare_hostname = $5,
        allocated_at = NOW()
    `, [
      port,
      projectName,
      serviceName,
      options?.description,
      options?.cloudflareHostname
    ]);

    // Update ports_used counter
    await this.db.query(`
      UPDATE project_port_ranges
      SET ports_used = ports_used + 1,
          ports_available = 100 - (ports_used + 1)
      WHERE project_name = $1
    `, [projectName]);

    return port;
  }

  /**
   * Get allocated port for a service (or allocate if not exists)
   */
  async getOrAllocate(
    projectName: string,
    serviceName: string,
    options?: {
      description?: string;
      cloudflareHostname?: string;
    }
  ): Promise<number> {
    // Check if already allocated
    const existing = await this.db.query(`
      SELECT port
      FROM port_allocations
      WHERE project_name = $1
      AND service_name = $2
    `, [projectName, serviceName]);

    if (existing.rows.length > 0) {
      return existing.rows[0].port;
    }

    // Allocate new
    return await this.allocate(projectName, serviceName, options);
  }

  /**
   * Release port (mark as available, don't delete)
   */
  async release(projectName: string, serviceName: string): Promise<void> {
    await this.db.query(`
      UPDATE port_allocations
      SET status = 'released'
      WHERE project_name = $1
      AND service_name = $2
    `, [projectName, serviceName]);

    await this.db.query(`
      UPDATE project_port_ranges
      SET ports_used = ports_used - 1,
          ports_available = ports_available + 1
      WHERE project_name = $1
    `, [projectName]);
  }

  /**
   * List all allocations for a project
   */
  async listByProject(projectName: string): Promise<Array<{
    port: number;
    serviceName: string;
    description: string;
    cloudflareHostname: string;
    status: string;
  }>> {
    const result = await this.db.query(`
      SELECT port, service_name, description, cloudflare_hostname, status
      FROM port_allocations
      WHERE project_name = $1
      AND status = 'allocated'
      ORDER BY port
    `, [projectName]);

    return result.rows.map(row => ({
      port: row.port,
      serviceName: row.service_name,
      description: row.description,
      cloudflareHostname: row.cloudflare_hostname,
      status: row.status
    }));
  }

  /**
   * List all allocations (all projects)
   */
  async listAll(): Promise<Array<{
    port: number;
    projectName: string;
    serviceName: string;
    description: string;
    cloudflareHostname: string;
    status: string;
  }>> {
    const result = await this.db.query(`
      SELECT port, project_name, service_name, description,
             cloudflare_hostname, status
      FROM port_allocations
      WHERE status = 'allocated'
      ORDER BY port
    `);

    return result.rows.map(row => ({
      port: row.port,
      projectName: row.project_name,
      serviceName: row.service_name,
      description: row.description,
      cloudflareHostname: row.cloudflare_hostname,
      status: row.status
    }));
  }

  /**
   * Check if port is in use (health check)
   */
  async verifyPort(port: number): Promise<boolean> {
    const net = require('net');

    return new Promise((resolve) => {
      const server = net.createServer();

      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);  // Port is in use
        } else {
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close();
        resolve(false);  // Port is free
      });

      server.listen(port);
    });
  }

  /**
   * Verify all allocated ports match reality
   */
  async auditPorts(): Promise<{
    allocated: number;
    inUse: number;
    conflicts: Array<{ port: number; expected: string; actual: string }>;
  }> {
    const allocations = await this.listAll();
    let inUse = 0;
    const conflicts: Array<{ port: number; expected: string; actual: string }> = [];

    for (const allocation of allocations) {
      const isUsed = await this.verifyPort(allocation.port);
      if (isUsed) {
        inUse++;

        // Update last_verified_at
        await this.db.query(`
          UPDATE port_allocations
          SET last_verified_at = NOW(),
              status = 'in_use'
          WHERE port = $1
        `, [allocation.port]);
      } else {
        // Port allocated but not in use (service down?)
        conflicts.push({
          port: allocation.port,
          expected: `${allocation.projectName}/${allocation.serviceName}`,
          actual: 'not running'
        });
      }
    }

    return {
      allocated: allocations.length,
      inUse,
      conflicts
    };
  }

  /**
   * Get project's port range summary
   */
  async getProjectSummary(projectName: string): Promise<{
    rangeStart: number;
    rangeEnd: number;
    used: number;
    available: number;
    utilization: number;
  }> {
    const result = await this.db.query(`
      SELECT port_range_start, port_range_end, ports_used, ports_available
      FROM project_port_ranges
      WHERE project_name = $1
    `, [projectName]);

    if (result.rows.length === 0) {
      throw new Error(`Project ${projectName} not found`);
    }

    const row = result.rows[0];

    return {
      rangeStart: row.port_range_start,
      rangeEnd: row.port_range_end,
      used: row.ports_used,
      available: row.ports_available,
      utilization: (row.ports_used / 100) * 100
    };
  }
}
```

---

## MCP Tools for Supervisors

```typescript
// MCP tool definitions

{
  name: 'mcp__meta__allocate_port',
  description: 'Allocate next available port for a service',
  parameters: {
    projectName: { type: 'string' },
    serviceName: { type: 'string' },
    description: { type: 'string', optional: true },
    cloudflareHostname: { type: 'string', optional: true }
  }
}

{
  name: 'mcp__meta__get_port',
  description: 'Get allocated port for a service (or allocate if not exists)',
  parameters: {
    projectName: { type: 'string' },
    serviceName: { type: 'string' }
  }
}

{
  name: 'mcp__meta__list_ports',
  description: 'List all port allocations (optionally filtered by project)',
  parameters: {
    projectName: { type: 'string', optional: true }
  }
}

{
  name: 'mcp__meta__audit_ports',
  description: 'Verify all allocated ports match running services',
  parameters: {}
}

{
  name: 'mcp__meta__port_summary',
  description: 'Get port usage summary for a project',
  parameters: {
    projectName: { type: 'string' }
  }
}
```

---

## Usage Patterns

### Pattern 1: Service Deployment (Supervisor)

```typescript
// Project supervisor deploying new service

// WRONG (old way - causes conflicts):
const port = 3000;  // Hardcoded, might conflict

// RIGHT (new way - guaranteed no conflicts):
const port = await mcp__meta__get_port({
  projectName: 'consilio',
  serviceName: 'api-server',
  description: 'Main API server',
  cloudflareHostname: 'api.consilio.153.se'
});

// Deploy service with allocated port
await deployService({
  name: 'consilio-api',
  port: port,  // Uses allocated port (e.g., 4001)
  env: {
    PORT: port
  }
});

// No conflicts possible - port came from consilio's range (4000-4999)
```

### Pattern 2: List All Ports (Meta-Supervisor)

```typescript
// User asks meta-supervisor: "What ports are in use?"

const allPorts = await mcp__meta__list_ports();

// Returns:
[
  {
    port: 3000,
    projectName: 'meta-supervisor',
    serviceName: 'dashboard',
    cloudflareHostname: 'meta.153.se',
    status: 'allocated'
  },
  {
    port: 4000,
    projectName: 'consilio',
    serviceName: 'web',
    cloudflareHostname: 'consilio.153.se',
    status: 'allocated'
  },
  {
    port: 4001,
    projectName: 'consilio',
    serviceName: 'api',
    cloudflareHostname: 'api.consilio.153.se',
    status: 'allocated'
  },
  {
    port: 5000,
    projectName: 'openhorizon',
    serviceName: 'web',
    cloudflareHostname: 'openhorizon.cc',
    status: 'allocated'
  }
]

// Meta-supervisor reports to user in plain language:
// "You have 8 services running across 4 projects:
// - Meta: 2 services (dashboard, api)
// - Consilio: 2 services (web, api)
// - OpenHorizon: 3 services (web, api, websocket)
// - Odin: 1 service (web)"
```

### Pattern 3: Audit Ports (Cron Job or Manual)

```typescript
// Meta-supervisor runs daily audit

const audit = await mcp__meta__audit_ports();

// Returns:
{
  allocated: 12,
  inUse: 10,
  conflicts: [
    {
      port: 4002,
      expected: 'consilio/websocket',
      actual: 'not running'
    },
    {
      port: 7000,
      expected: 'odin/web',
      actual: 'not running'
    }
  ]
}

// Meta-supervisor reports:
// "Port audit complete:
// - 12 ports allocated
// - 10 currently in use
// - 2 services down: consilio/websocket (4002), odin/web (7000)"

// Optional: Auto-restart down services
for (const conflict of audit.conflicts) {
  if (conflict.actual === 'not running') {
    await restartService(conflict.expected);
  }
}
```

### Pattern 4: Project Port Summary

```typescript
// Project supervisor checks its own port usage

const summary = await mcp__meta__port_summary({
  projectName: 'consilio'
});

// Returns:
{
  rangeStart: 4000,
  rangeEnd: 4999,
  used: 5,
  available: 995,
  utilization: 0.5  // 0.5% of range used
}

// Project supervisor reports:
// "Consilio port usage:
// - Range: 4000-4999
// - Used: 5 ports
// - Available: 995 ports
// - Utilization: 0.5%"
```

---

## Integration with Cloudflare Tunnel

**When allocating port, optionally assign Cloudflare hostname:**

```typescript
// Supervisor deploying service

const port = await mcp__meta__get_port({
  projectName: 'consilio',
  serviceName: 'api',
  cloudflareHostname: 'api.consilio.153.se'
});

// port = 4001

// Now configure Cloudflare tunnel to route api.consilio.153.se → localhost:4001

await cloudflareAPI.createTunnelRoute({
  hostname: 'api.consilio.153.se',
  service: `http://localhost:${port}`
});

// Both stored together - easy to maintain
```

**List services with Cloudflare routing:**

```typescript
const ports = await mcp__meta__list_ports({ projectName: 'consilio' });

// Generate Cloudflare tunnel config
const tunnelConfig = {
  ingress: ports
    .filter(p => p.cloudflareHostname)
    .map(p => ({
      hostname: p.cloudflareHostname,
      service: `http://localhost:${p.port}`
    }))
};

// Write to /etc/cloudflared/config.yml
// Restart cloudflared
```

---

## Migration from Current Setup

### Step 1: Audit Current Port Usage

```bash
# Find all running services
sudo lsof -i -P -n | grep LISTEN

# Example output:
# node      1234  samuel   23u  IPv4  12345      0t0  TCP *:3000 (LISTEN)
# node      1235  samuel   24u  IPv4  12346      0t0  TCP *:9001 (LISTEN)
# postgres  1236  samuel   25u  IPv4  12347      0t0  TCP *:5432 (LISTEN)
```

### Step 2: Import to Database

```typescript
// One-time migration

const currentServices = [
  { project: 'meta-supervisor', service: 'dashboard', port: 3000 },
  { project: 'consilio', service: 'web', port: 4000 },
  { project: 'openhorizon', service: 'web', port: 5000 },
  { service: 'penpot', port: 9001 },  // Shared service
  // ... etc
];

for (const svc of currentServices) {
  await mcp__meta__allocate_port({
    projectName: svc.project,
    serviceName: svc.service,
    description: 'Migrated from existing setup'
  });

  // If port doesn't match allocated port, update service config
  const allocatedPort = await mcp__meta__get_port({
    projectName: svc.project,
    serviceName: svc.service
  });

  if (allocatedPort !== svc.port) {
    console.log(`Service ${svc.service} needs port change: ${svc.port} → ${allocatedPort}`);
    // Update service config, restart
  }
}
```

### Step 3: Update Service Configs

```bash
# For each service, update config to use allocated port

# Example: Consilio web service
# Old: PORT=3000
# New: PORT=$(get_allocated_port consilio web)

# Or hardcode based on allocation:
# PORT=4000  # From consilio's range (4000-4999)
```

### Step 4: Update Cloudflare Tunnel

```yaml
# /etc/cloudflared/config.yml

tunnel: <tunnel-id>
credentials-file: /home/samuel/.cloudflared/<tunnel-id>.json

ingress:
  # Meta-supervisor services (3000-3999)
  - hostname: meta.153.se
    service: http://localhost:3000

  # Consilio services (4000-4999)
  - hostname: consilio.153.se
    service: http://localhost:4000
  - hostname: api.consilio.153.se
    service: http://localhost:4001

  # OpenHorizon services (5000-5999)
  - hostname: openhorizon.cc
    service: http://localhost:5000
  - hostname: api.openhorizon.cc
    service: http://localhost:5001

  # Shared services
  - hostname: penpot.153.se
    service: http://localhost:9001
  - hostname: storybook.153.se
    service: http://localhost:6006

  # Catch-all
  - service: http_status:404
```

---

## New Project Setup

**When creating new project:**

```typescript
// Meta-supervisor creates new project

const newProjectId = 6;  // Next available
const newProjectName = 'hitster-game';

// 1. Create port range
await db.query(`
  INSERT INTO project_port_ranges (
    project_id, project_name, port_range_start, port_range_end, ports_available
  ) VALUES ($1, $2, $3, $4, 1000)
`, [
  newProjectId,
  newProjectName,
  3000 + (newProjectId * 1000),  // 9000
  3000 + (newProjectId * 1000) + 999  // 9999
]);

// 2. Inform project supervisor
console.log(`Project ${newProjectName} allocated port range: 9000-9999`);

// 3. Project supervisor can now allocate ports
const webPort = await mcp__meta__get_port({
  projectName: 'hitster-game',
  serviceName: 'web'
});
// Returns: 9000 (first port in range)

const apiPort = await mcp__meta__get_port({
  projectName: 'hitster-game',
  serviceName: 'api'
});
// Returns: 9001 (second port in range)
```

---

## Error Prevention

### Prevents This Scenario (Your Exact Problem)

**Before (causes conflicts):**
```typescript
// New service checks if port 3000 is available
const portInUse = await checkPort(3000);
if (!portInUse) {
  // Port free, start service
  startService(3000);
  // Works!
}

// Later: Original service on 3000 restarts
// CONFLICT - both services try to use 3000
```

**After (impossible to conflict):**
```typescript
// New service gets port from allocated range
const port = await mcp__meta__get_port({
  projectName: 'consilio',
  serviceName: 'new-api'
});
// Returns: 4005 (from consilio's range 4000-4999)

startService(port);

// No other service can use 4005 - it's in consilio's range
// Even if a service on 4005 is down, no conflict possible
// When it restarts, it uses 4005 again (from allocation table)
```

---

## Monitoring and Maintenance

### Daily Audit (Cron Job)

```bash
#!/bin/bash
# /home/samuel/supervisor/.scripts/audit-ports.sh

# Run daily at 2am
# Crontab: 0 2 * * * /home/samuel/supervisor/.scripts/audit-ports.sh

# Call meta-supervisor via MCP
curl -X POST http://localhost:8080/mcp/meta/audit_ports | jq

# If conflicts found, alert user or auto-fix
```

### Port Usage Dashboard

```typescript
// Meta-supervisor provides summary

async function portsDashboard() {
  const projects = ['consilio', 'openhorizon', 'health-agent', 'odin'];

  for (const project of projects) {
    const summary = await mcp__meta__port_summary({ projectName: project });
    const allocations = await mcp__meta__list_ports({ projectName: project });

    console.log(`\n${project}:`);
    console.log(`  Range: ${summary.rangeStart}-${summary.rangeEnd}`);
    console.log(`  Used: ${summary.used}/1000 (${summary.utilization.toFixed(1)}%)`);
    console.log(`  Services:`);

    for (const alloc of allocations) {
      console.log(`    - ${alloc.serviceName}: ${alloc.port} (${alloc.cloudflareHostname || 'no hostname'})`);
    }
  }
}

// Output:
// consilio:
//   Range: 3100-3199
//   Used: 5/100 (5%)
//   Services:
//     - web: 3100 (consilio.153.se)
//     - api: 3101 (api.consilio.153.se)
//     - websocket: 3102 (ws.consilio.153.se)
//     - worker: 3103 (no hostname)
//     - metrics: 3104 (metrics.consilio.153.se)
```

---

## Implementation Checklist

**Phase 1: Database Setup**
- [ ] Create migration file (007_port_allocation.sql)
- [ ] Initialize project_port_ranges table with existing projects
- [ ] Create port_allocations table
- [ ] Run migration

**Phase 2: PortManager Class**
- [ ] Implement PortManager.ts
- [ ] Add allocate() method
- [ ] Add getOrAllocate() method
- [ ] Add release() method
- [ ] Add listByProject() method
- [ ] Add listAll() method
- [ ] Add verifyPort() method
- [ ] Add auditPorts() method
- [ ] Write unit tests

**Phase 3: MCP Tools**
- [ ] Expose mcp__meta__allocate_port
- [ ] Expose mcp__meta__get_port
- [ ] Expose mcp__meta__list_ports
- [ ] Expose mcp__meta__audit_ports
- [ ] Expose mcp__meta__port_summary

**Phase 4: Migration**
- [ ] Audit current port usage (lsof command)
- [ ] Import all existing services to database
- [ ] Verify no conflicts in allocation
- [ ] Update service configs to use allocated ports
- [ ] Update Cloudflare tunnel config
- [ ] Test all services restart successfully

**Phase 5: Documentation**
- [ ] Update meta-supervisor CLAUDE.md with port allocation patterns
- [ ] Update project supervisor templates
- [ ] Document port ranges per project
- [ ] Add to new-project workflow (auto-allocate range)

**Phase 6: Monitoring**
- [ ] Set up daily audit cron job
- [ ] Create port usage dashboard
- [ ] Integrate with meta-supervisor health checks

---

## Summary

**What we built:**
- Port range allocation per project (1000 ports each)
- PostgreSQL storage for allocations
- Guaranteed conflict prevention (ranges don't overlap)
- Cloudflare tunnel integration
- Simple MCP tools for supervisors
- Audit system for health monitoring

**What we avoided:**
- Centralized document (race conditions, staleness)
- Port availability checking (unreliable)
- Default ports (always cause conflicts)
- Manual coordination (error-prone)

**Result:**
- **IMPOSSIBLE to have port conflicts** (ranges enforced)
- Simple: Each project owns 1000 ports
- No coordination needed between projects
- Meta-supervisor can audit health
- Integrates with Cloudflare tunnel
- Scales to 61 projects

**Estimated implementation time:** 4-6 hours

**This solves requirement #4 from your message.**

Next: Cloudflare integration (requirement #5)
