# Infrastructure Systems Summary

**Date:** 2026-01-18
**Status:** All 6 infrastructure requirements documented and ready for implementation

---

## Overview

This document summarizes the 6 infrastructure systems designed for meta-supervisor to manage all aspects of the supervisor-service environment.

---

## The 6 Systems

### 1. PIV Loop Adaptation Guide

**File:** `/home/samuel/supervisor/docs/piv-loop-adaptation-guide.md`

**What it does:**
- Ensures we adapt (not copy) Cole Medin's PIV loop for our architecture
- Shows exact differences between remote agent and local agent approaches
- Provides transformation patterns from webhook-based to local subprocess-based

**Key principle:**
> "Take the methodology, replace the architecture"

**Critical adaptations:**
- GitHub comments → Direct returns
- Slash commands → TypeScript methods
- Archon MCP → Local RAG
- Worktrees → Feature branches
- Remote execution → Local subprocess

---

### 2. Instruction Propagation System

**File:** `/home/samuel/supervisor/docs/supervisor-instruction-propagation-system.md`

**What it does:**
- Layered instruction system (core + meta + project-specific)
- Update all supervisors with one command
- Preserve project-specific customizations
- Auto-generate CLAUDE.md files

**File structure:**
```
.supervisor-core/          # Shared across all
  ├── core-behaviors.md
  ├── tool-usage.md
  └── bmad-methodology.md

.supervisor-meta/          # Meta only
  └── meta-specific.md

{project}/.claude-specific/  # Project only
  └── {project}-custom.md
```

**Workflow:**
```
User → Meta: "Make supervisors more proactive"
Meta: Updates core-behaviors.md
Meta: Regenerates all CLAUDE.md files
All supervisors: Get new instructions immediately
```

---

### 3. Secrets Management System

**File:** `/home/samuel/supervisor/docs/secrets-management-system.md`

**What it does:**
- Simple PostgreSQL-based secrets storage
- AES-256-GCM encryption at rest
- Hierarchical key paths (meta/project/service)
- Easy retrieval (no searching)
- MCP tools for supervisors

**Key paths:**
```
meta/cloudflare/api_token
meta/gcloud/vm_host_key
meta/gcloud/openhorizon_key
project/consilio/database_url
service/penpot/admin_password
```

**Usage:**
```typescript
// Simple, predictable access
const token = await mcp__meta__get_secret({
  keyPath: 'meta/cloudflare/api_token'
});

// No searching, always works
```

**vs SCAR's approach:**
- ❌ SCAR: Files scattered, supervisors had to search
- ✅ Ours: Single PostgreSQL table, exact key paths, instant retrieval

---

### 4. Port Allocation System

**File:** `/home/samuel/supervisor/docs/port-allocation-system.md`

**What it does:**
- Port range allocation per project (1000 ports each)
- **Guaranteed conflict prevention** (ranges don't overlap)
- Integration with Cloudflare tunnel routes
- PostgreSQL storage for allocations

**Port ranges:**
```
Meta-Supervisor:  3000-3999
Consilio:         4000-4999
OpenHorizon:      5000-5999
Health-Agent:     6000-6999
Odin:             7000-7999
Quiculum Monitor: 8000-8999
```

**Your exact problem (solved):**
> "a new project is deploying a service and still does it on the default port that causes a conflict. or it does a check, but the service currently using that port, and already have it asigne in cloudflare tunnel happends to be down at the time of checking, so new service starts and works, bet a conflict occurs when the original service is restarted."

**Solution:**
- Each project owns its range → impossible to conflict
- No checking needed (ranges enforced)
- Service down? Doesn't matter, range still protected

**Usage:**
```typescript
// WRONG (old way - causes conflicts)
const port = 3000;

// RIGHT (new way - guaranteed no conflicts)
const port = await mcp__meta__get_port({
  projectName: 'consilio',
  serviceName: 'api'
});
// Returns: 4001 (from consilio's range)
```

---

### 5. Cloudflare Integration

**File:** `/home/samuel/supervisor/docs/cloudflare-integration.md`

**What it does:**
- Automatic CNAME creation
- Tunnel ingress route management
- DNS record updates
- Zero manual Cloudflare portal usage

**Full deployment workflow:**
```typescript
// 1. Allocate port
const port = await mcp__meta__get_port({
  projectName: 'consilio',
  serviceName: 'api',
  cloudflareHostname: 'api.consilio.153.se'
});

// 2. Create CNAME
await mcp__meta__create_cname({
  hostname: 'api.consilio.153.se',
  target: 'tunnel.153.se'
});

// 3. Sync tunnel routes
await mcp__meta__sync_tunnel();

// 4. Deploy service
await deployService({ port });

// Done! https://api.consilio.153.se is live
```

**Integration with port allocation:**
- Port allocations automatically sync to tunnel config
- One command updates entire /etc/cloudflared/config.yml
- Cloudflared automatically restarted

---

### 6. GCloud Integration

**File:** `/home/samuel/supervisor/docs/gcloud-integration.md`

**What it does:**
- Full access to 2+ GCloud accounts (Owner role)
- VM management (start, stop, resize, create, delete)
- Health monitoring (CPU, memory, disk)
- Automatic scaling based on load
- Cost tracking

**Service accounts:**
- VM Host Account: `supervisor-meta@{project}.iam.gserviceaccount.com`
- OpenHorizon Account: `supervisor-meta@openhorizon-prod.iam.gserviceaccount.com`
- Future projects: Add as needed

**Auto-scaling example:**
```typescript
// Meta-supervisor monitors every hour
const health = await mcp__meta__gcloud_vm_health({
  project: 'vm-host',
  zone: 'us-central1-a',
  instanceName: 'supervisor-vm',
  minutes: 120
});

if (health.cpu.average > 70 && health.cpu.max > 85) {
  // High CPU for 2 hours → scale up
  await mcp__meta__gcloud_resize_vm({
    project: 'vm-host',
    zone: 'us-central1-a',
    instanceName: 'supervisor-vm',
    newMachineType: 'n1-standard-4'  // 2 vCPUs → 4 vCPUs
  });

  // Reports: "VM upgraded, services restarted"
}
```

---

## How They Work Together

### Example: Deploy New Service

**User:** "Deploy API service for Consilio at api.consilio.153.se"

**Meta-supervisor (fully automatic):**

```typescript
// 1. PORTS: Allocate from consilio's range
const port = await portManager.getOrAllocate(
  'consilio',
  'api',
  {
    cloudflareHostname: 'api.consilio.153.se'
  }
);
// port = 4001

// 2. CLOUDFLARE: Create DNS record
await cloudflareManager.createCNAME(
  'api.consilio.153.se',
  'tunnel.153.se'
);

// 3. SECRETS: Get database credentials
const dbUrl = await secretsManager.get('project/consilio/database_url');

// 4. GCLOUD: Check VM capacity
const health = await gcloudManager.getVMHealth('vm-host', 'supervisor-vm');
if (health.cpu.average > 80) {
  // VM loaded, scale up first
  await gcloudManager.resizeVM('vm-host', 'supervisor-vm', 'n1-standard-4');
}

// 5. Deploy service
await deployService({
  name: 'consilio-api',
  port: 4001,
  env: {
    PORT: '4001',
    DATABASE_URL: dbUrl
  }
});

// 6. CLOUDFLARE: Sync tunnel routes
await cloudflareManager.syncPortAllocationsToTunnel(portManager);

// Done!
```

**User sees:**
```
✅ Deployed consilio-api:
   - URL: https://api.consilio.153.se
   - Port: 4001
   - Status: Running
   - VM: Scaled to 4 vCPUs (was running hot)
```

**All automatic. Zero manual steps.**

---

## Implementation Roadmap

### Phase 1: Database Setup (2-4 hours)

**Migrations:**
```sql
-- 006_secrets_management.sql
CREATE TABLE secrets (...);

-- 007_port_allocation.sql
CREATE TABLE port_allocations (...);
CREATE TABLE project_port_ranges (...);
```

**Setup:**
- Generate encryption key for secrets
- Store in environment (systemd or .bashrc)
- Initialize project port ranges
- Run migrations

---

### Phase 2: Core Managers (16-20 hours)

**Implement:**
- `SecretsManager.ts` (4-6 hours)
- `PortManager.ts` (4-6 hours)
- `CloudflareManager.ts` (6-8 hours)
- `GCloudManager.ts` (8-10 hours)

**Each includes:**
- TypeScript class implementation
- CRUD operations
- Error handling
- Unit tests

---

### Phase 3: MCP Tools (8-10 hours)

**Expose via supervisor-service:**

**Secrets:**
- `mcp__meta__get_secret`
- `mcp__meta__set_secret`
- `mcp__meta__list_secrets`
- `mcp__meta__delete_secret`

**Ports:**
- `mcp__meta__allocate_port`
- `mcp__meta__get_port`
- `mcp__meta__list_ports`
- `mcp__meta__audit_ports`

**Cloudflare:**
- `mcp__meta__create_cname`
- `mcp__meta__create_a_record`
- `mcp__meta__delete_dns_record`
- `mcp__meta__sync_tunnel`

**GCloud:**
- `mcp__meta__gcloud_get_vm`
- `mcp__meta__gcloud_start_vm`
- `mcp__meta__gcloud_resize_vm`
- `mcp__meta__gcloud_vm_health`

---

### Phase 4: Instruction System (4-6 hours)

**Create:**
- `.supervisor-core/` directory with core instructions
- `.supervisor-meta/` directory with meta-specific instructions
- `InstructionAssembler.ts` to generate CLAUDE.md files
- `/command` to regenerate all supervisors

**Test:**
- Update one core instruction
- Verify all supervisors get update
- Verify project-specific instructions preserved

---

### Phase 5: Integration (8-12 hours)

**Integrate systems:**
- Port allocation → Cloudflare tunnel sync (automatic)
- Secrets → Service deployment (auto-inject)
- GCloud monitoring → Auto-scaling (hourly cron)
- All systems → Meta-supervisor CLAUDE.md

**Create workflows:**
- `ServiceDeployer.ts` (uses all 4 systems)
- `VMMonitor.ts` (auto-scaling)
- `InfrastructureHealthCheck.ts` (daily audit)

---

### Phase 6: Migration (8-12 hours)

**Migrate existing infrastructure:**

1. **Secrets:** Import all existing API keys, tokens, service accounts
2. **Ports:** Audit current port usage (lsof), import to database
3. **Cloudflare:** Sync existing DNS records and tunnel routes
4. **GCloud:** Create service accounts, store keys, test access

**Verify:**
- All services still work
- No port conflicts
- Tunnel routes correct
- GCloud access working

---

### Phase 7: Testing (4-6 hours)

**Test each system:**
- Deploy new service (full workflow)
- Scale VM automatically
- Create DNS records
- Allocate ports
- Retrieve secrets
- Update all supervisors

**Stress test:**
- Deploy 10 services simultaneously
- Trigger auto-scaling
- Sync 50+ tunnel routes
- Access all GCloud projects

---

## Total Implementation Time

**Estimated: 50-70 hours (1.5-2 weeks full-time)**

**Breakdown:**
- Phase 1: Database Setup (2-4 hours)
- Phase 2: Core Managers (16-20 hours)
- Phase 3: MCP Tools (8-10 hours)
- Phase 4: Instruction System (4-6 hours)
- Phase 5: Integration (8-12 hours)
- Phase 6: Migration (8-12 hours)
- Phase 7: Testing (4-6 hours)

**Can be done incrementally:**
- Week 1: Secrets + Ports (Phases 1-3 for these two)
- Week 2: Cloudflare + GCloud (Phases 1-3 for these two)
- Week 3: Instruction system + Integration + Migration + Testing

---

## Success Metrics

**When fully implemented:**

1. **Zero manual infrastructure work**
   - No Cloudflare portal usage
   - No GCloud console usage
   - No manual port assignments
   - No secret file searching

2. **Full automation**
   - Service deployment: 1 command
   - DNS record creation: automatic
   - VM scaling: automatic
   - Secret retrieval: instant

3. **Conflict prevention**
   - **Zero port conflicts** (guaranteed by ranges)
   - Zero DNS conflicts (managed)
   - Zero credential issues (encrypted, accessible)

4. **Observability**
   - VM health monitored hourly
   - Port allocations audited daily
   - Secrets access tracked
   - All operations logged

5. **Maintainability**
   - Update all supervisors: 1 command
   - Add new project: automatic port range assigned
   - Rotate secrets: simple MCP call
   - Scale infrastructure: automatic

---

## Dependencies

**External:**
- PostgreSQL (already have)
- Cloudflare account + API token
- GCloud service accounts (Owner role)
- Cloudflare Tunnel (already set up)

**Internal:**
- supervisor-service (Node.js + TypeScript)
- MCP integration (already working)
- Claude Agent SDK (for agents)

**Libraries:**
```json
{
  "dependencies": {
    "pg": "^8.11.3",                    // PostgreSQL
    "@googleapis/compute": "^8.0.0",     // GCloud Compute
    "@googleapis/monitoring": "^4.0.0",  // GCloud Monitoring
    "googleapis": "^128.0.0",            // GCloud APIs
    "google-auth-library": "^9.4.1",     // GCloud Auth
    "axios": "^1.6.2"                    // Cloudflare API
  }
}
```

---

## Final Notes

**What makes this special:**

1. **Designed for non-coder**
   - Everything automatic
   - Plain language reporting
   - No manual configuration needed

2. **Conflict prevention by design**
   - Port ranges (impossible to conflict)
   - DNS managed (no stale records)
   - Secrets centralized (no searching)

3. **Future-proof**
   - Scales to 61 projects (port ranges)
   - Supports unlimited GCloud accounts
   - Easy to add new domains (Cloudflare)
   - Instruction updates propagate automatically

4. **Simple, not complex**
   - PostgreSQL (not external services)
   - Port ranges (not coordination)
   - Direct API calls (not abstraction layers)
   - Each system <500 lines of code

5. **Fully integrated**
   - All systems work together
   - One deployment command uses all 4 systems
   - Automatic syncing (ports → tunnel routes)
   - Supervisor instructions auto-update

---

## Next Steps

1. **Review all 6 documents**
   - PIV loop adaptation guide
   - Instruction propagation system
   - Secrets management system
   - Port allocation system
   - Cloudflare integration
   - GCloud integration

2. **Start implementation**
   - Begin with Phase 1 (database setup)
   - Implement managers one at a time
   - Test each system independently
   - Integrate systems together

3. **Migrate existing infrastructure**
   - Import current secrets
   - Allocate existing ports
   - Sync Cloudflare routes
   - Set up GCloud access

4. **Test end-to-end**
   - Deploy new service (full workflow)
   - Verify all systems working
   - Check automation triggers
   - Validate conflict prevention

5. **Deploy to production**
   - Update meta-supervisor CLAUDE.md
   - Enable automatic monitoring
   - Document for future reference
   - Iterate based on usage

---

## Summary

**You asked for 6 infrastructure systems. You got 6 comprehensive solutions:**

1. ✅ **PIV Loop Adaptation** - Methodology adapted, not copied verbatim
2. ✅ **Instruction Propagation** - Update all supervisors with one command
3. ✅ **Secrets Management** - Simple, encrypted, instant retrieval
4. ✅ **Port Allocation** - Guaranteed conflict prevention via ranges
5. ✅ **Cloudflare Integration** - Automatic DNS and tunnel management
6. ✅ **GCloud Integration** - Full VM access across all accounts

**Each system:**
- Solves a specific pain point you experienced
- Is simple and maintainable
- Integrates with other systems
- Is ready for implementation

**Total: ~50-70 hours implementation**
**Result: Fully automated infrastructure management**

**All documentation complete. Ready to build!** 🎉
