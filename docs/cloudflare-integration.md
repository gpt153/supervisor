# Cloudflare Integration for Meta-Supervisor

**Date:** 2026-01-18
**Requirement:** Meta-supervisor manages Cloudflare DNS and tunnel routes
**Purpose:** Automated CNAME creation, tunnel route updates, zero manual Cloudflare portal usage

---

## Overview

**What meta-supervisor can do:**
- Create/update/delete DNS records (CNAME, A, TXT, etc.)
- Manage Cloudflare Tunnel routes (ingress rules)
- Update tunnel configuration automatically
- Sync port allocations with tunnel routes
- No manual Cloudflare dashboard access needed

**User workflow:**
```
User: "Deploy new API service for Consilio"

Meta-supervisor:
1. Allocates port (e.g., 4001)
2. Deploys service on port 4001
3. Creates CNAME: api.consilio.153.se
4. Adds tunnel route: api.consilio.153.se → localhost:4001
5. Restarts cloudflared

User: "Done! api.consilio.153.se is live"
```

**All automatic, zero manual steps.**

---

## Cloudflare API Overview

**What we're using:**
- Cloudflare API v4 (REST API)
- DNS records API (zones/{zone_id}/dns_records)
- Tunnel configuration API (accounts/{account_id}/cfd_tunnel)

**Authentication:**
- API Token (stored in secrets system)
- Scoped permissions: Zone:DNS:Edit, Account:Cloudflare Tunnel:Edit

**Base URL:** `https://api.cloudflare.com/client/v4`

---

## Required Cloudflare Secrets

**⚠️ CRITICAL: ALL Cloudflare secrets MUST be stored in the secrets management system**

**See:** `/home/samuel/supervisor/docs/secrets-management-system.md`

**Store in secrets system (via mcp__meta__set_secret):**

```typescript
// Meta-supervisor needs these secrets

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/api_token',
  value: '<cloudflare-api-token>',
  description: 'Cloudflare API token with DNS and Tunnel permissions'
});

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/account_id',
  value: '<cloudflare-account-id>',
  description: 'Cloudflare account ID (32-character hex)'
});

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/zone_id_153se',
  value: '<zone-id-for-153.se>',
  description: 'Zone ID for 153.se domain'
});

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/tunnel_id',
  value: '<tunnel-id>',
  description: 'Cloudflare Tunnel ID (UUID)'
});

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/tunnel_token',
  value: '<tunnel-token>',
  description: 'Cloudflare Tunnel credentials token'
});
```

**Getting these values:**

```bash
# API Token: Create at https://dash.cloudflare.com/profile/api-tokens
# Permissions needed:
#   - Zone:DNS:Edit
#   - Account:Cloudflare Tunnel:Edit
# Zone ID: Found on domain overview page
# Account ID: Found in URL when logged into Cloudflare
# Tunnel ID: Run `cloudflared tunnel list`
# Tunnel Token: In /home/samuel/.cloudflared/<tunnel-id>.json
```

---

## CloudflareManager Implementation

```typescript
// supervisor-service/src/cloudflare/CloudflareManager.ts

import axios, { AxiosInstance } from 'axios';

export class CloudflareManager {
  private api: AxiosInstance;
  private apiToken: string;
  private accountId: string;
  private zoneIds: Map<string, string>;  // domain → zone_id
  private tunnelId: string;

  constructor(secrets: {
    apiToken: string;
    accountId: string;
    zoneIds: Record<string, string>;  // { '153.se': 'zone-id-123', 'openhorizon.cc': 'zone-id-456' }
    tunnelId: string;
  }) {
    this.apiToken = secrets.apiToken;
    this.accountId = secrets.accountId;
    this.zoneIds = new Map(Object.entries(secrets.zoneIds));
    this.tunnelId = secrets.tunnelId;

    this.api = axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create CNAME record
   */
  async createCNAME(
    hostname: string,  // e.g., 'api.consilio.153.se'
    target: string,    // e.g., 'tunnel.153.se' or '@'
    options?: {
      proxied?: boolean;  // true = through Cloudflare, false = DNS only
      ttl?: number;       // TTL in seconds (1 = auto)
    }
  ): Promise<{ id: string; name: string; content: string }> {
    const domain = this.extractDomain(hostname);
    const zoneId = this.zoneIds.get(domain);

    if (!zoneId) {
      throw new Error(`Zone ID not found for domain: ${domain}`);
    }

    // Check if record already exists
    const existing = await this.findDNSRecord(hostname);
    if (existing) {
      // Update existing record
      return await this.updateDNSRecord(existing.id, {
        type: 'CNAME',
        name: hostname,
        content: target,
        proxied: options?.proxied ?? true,
        ttl: options?.ttl ?? 1
      });
    }

    // Create new record
    const response = await this.api.post(`/zones/${zoneId}/dns_records`, {
      type: 'CNAME',
      name: hostname,
      content: target,
      proxied: options?.proxied ?? true,
      ttl: options?.ttl ?? 1
    });

    if (!response.data.success) {
      throw new Error(`Failed to create CNAME: ${JSON.stringify(response.data.errors)}`);
    }

    const record = response.data.result;
    return {
      id: record.id,
      name: record.name,
      content: record.content
    };
  }

  /**
   * Create A record
   */
  async createARecord(
    hostname: string,  // e.g., '153.se' or 'server.153.se'
    ipAddress: string, // e.g., '34.91.182.123'
    options?: {
      proxied?: boolean;
      ttl?: number;
    }
  ): Promise<{ id: string; name: string; content: string }> {
    const domain = this.extractDomain(hostname);
    const zoneId = this.zoneIds.get(domain);

    if (!zoneId) {
      throw new Error(`Zone ID not found for domain: ${domain}`);
    }

    const existing = await this.findDNSRecord(hostname);
    if (existing) {
      return await this.updateDNSRecord(existing.id, {
        type: 'A',
        name: hostname,
        content: ipAddress,
        proxied: options?.proxied ?? true,
        ttl: options?.ttl ?? 1
      });
    }

    const response = await this.api.post(`/zones/${zoneId}/dns_records`, {
      type: 'A',
      name: hostname,
      content: ipAddress,
      proxied: options?.proxied ?? true,
      ttl: options?.ttl ?? 1
    });

    if (!response.data.success) {
      throw new Error(`Failed to create A record: ${JSON.stringify(response.data.errors)}`);
    }

    const record = response.data.result;
    return {
      id: record.id,
      name: record.name,
      content: record.content
    };
  }

  /**
   * Delete DNS record
   */
  async deleteDNSRecord(hostname: string): Promise<void> {
    const record = await this.findDNSRecord(hostname);
    if (!record) {
      return;  // Already deleted
    }

    const domain = this.extractDomain(hostname);
    const zoneId = this.zoneIds.get(domain);

    await this.api.delete(`/zones/${zoneId}/dns_records/${record.id}`);
  }

  /**
   * List all DNS records for a domain
   */
  async listDNSRecords(domain: string): Promise<Array<{
    id: string;
    type: string;
    name: string;
    content: string;
    proxied: boolean;
  }>> {
    const zoneId = this.zoneIds.get(domain);
    if (!zoneId) {
      throw new Error(`Zone ID not found for domain: ${domain}`);
    }

    const response = await this.api.get(`/zones/${zoneId}/dns_records`);

    if (!response.data.success) {
      throw new Error(`Failed to list DNS records: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.result.map((record: any) => ({
      id: record.id,
      type: record.type,
      name: record.name,
      content: record.content,
      proxied: record.proxied
    }));
  }

  /**
   * Update Cloudflare Tunnel ingress rules
   */
  async updateTunnelIngress(
    rules: Array<{
      hostname: string;   // e.g., 'api.consilio.153.se'
      service: string;    // e.g., 'http://localhost:4001'
      originRequest?: {   // Optional origin request config
        connectTimeout?: number;
        noTLSVerify?: boolean;
      };
    }>
  ): Promise<void> {
    // Read current tunnel config
    const configPath = `/home/samuel/.cloudflared/${this.tunnelId}.json`;
    const currentConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'));

    // Build ingress array
    const ingress = rules.map(rule => ({
      hostname: rule.hostname,
      service: rule.service,
      originRequest: rule.originRequest
    }));

    // Add catch-all rule (required)
    ingress.push({
      service: 'http_status:404'
    });

    // Update config
    const newConfig = {
      ...currentConfig,
      ingress
    };

    // Write to file
    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));

    // Also write to /etc/cloudflared/config.yml for systemd service
    const yamlConfig = this.generateYAMLConfig(this.tunnelId, ingress);
    await fs.writeFile('/etc/cloudflared/config.yml', yamlConfig);

    // Restart cloudflared service
    await exec('sudo systemctl restart cloudflared');
  }

  /**
   * Sync port allocations with tunnel ingress
   */
  async syncPortAllocationsToTunnel(portManager: PortManager): Promise<void> {
    // Get all port allocations with Cloudflare hostnames
    const allocations = await portManager.listAll();

    const rules = allocations
      .filter(alloc => alloc.cloudflareHostname)
      .map(alloc => ({
        hostname: alloc.cloudflareHostname,
        service: `http://localhost:${alloc.port}`
      }));

    // Update tunnel
    await this.updateTunnelIngress(rules);

    console.log(`Updated tunnel with ${rules.length} ingress rules`);
  }

  /**
   * Generate YAML config for cloudflared
   */
  private generateYAMLConfig(tunnelId: string, ingress: any[]): string {
    const lines = [
      `tunnel: ${tunnelId}`,
      `credentials-file: /home/samuel/.cloudflared/${tunnelId}.json`,
      '',
      'ingress:'
    ];

    for (const rule of ingress) {
      if (rule.hostname) {
        lines.push(`  - hostname: ${rule.hostname}`);
        lines.push(`    service: ${rule.service}`);
      } else {
        lines.push(`  - service: ${rule.service}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Find DNS record by hostname
   */
  private async findDNSRecord(hostname: string): Promise<{ id: string; type: string } | null> {
    const domain = this.extractDomain(hostname);
    const zoneId = this.zoneIds.get(domain);

    if (!zoneId) {
      return null;
    }

    const response = await this.api.get(`/zones/${zoneId}/dns_records`, {
      params: { name: hostname }
    });

    if (!response.data.success || response.data.result.length === 0) {
      return null;
    }

    return {
      id: response.data.result[0].id,
      type: response.data.result[0].type
    };
  }

  /**
   * Update existing DNS record
   */
  private async updateDNSRecord(recordId: string, data: any): Promise<any> {
    const domain = this.extractDomain(data.name);
    const zoneId = this.zoneIds.get(domain);

    const response = await this.api.put(`/zones/${zoneId}/dns_records/${recordId}`, data);

    if (!response.data.success) {
      throw new Error(`Failed to update DNS record: ${JSON.stringify(response.data.errors)}`);
    }

    const record = response.data.result;
    return {
      id: record.id,
      name: record.name,
      content: record.content
    };
  }

  /**
   * Extract domain from hostname (e.g., 'api.consilio.153.se' → '153.se')
   */
  private extractDomain(hostname: string): string {
    const parts = hostname.split('.');
    if (parts.length < 2) {
      throw new Error(`Invalid hostname: ${hostname}`);
    }

    // Return last two parts (e.g., '153.se' or 'openhorizon.cc')
    return parts.slice(-2).join('.');
  }
}
```

---

## MCP Tools for Meta-Supervisor

```typescript
// MCP tool definitions

{
  name: 'mcp__meta__create_cname',
  description: 'Create CNAME DNS record in Cloudflare',
  parameters: {
    hostname: { type: 'string' },       // e.g., 'api.consilio.153.se'
    target: { type: 'string' },         // e.g., 'tunnel.153.se' or '@'
    proxied: { type: 'boolean', optional: true }  // default: true
  }
}

{
  name: 'mcp__meta__create_a_record',
  description: 'Create A record DNS record in Cloudflare',
  parameters: {
    hostname: { type: 'string' },       // e.g., '153.se'
    ipAddress: { type: 'string' },      // e.g., '34.91.182.123'
    proxied: { type: 'boolean', optional: true }
  }
}

{
  name: 'mcp__meta__delete_dns_record',
  description: 'Delete DNS record from Cloudflare',
  parameters: {
    hostname: { type: 'string' }
  }
}

{
  name: 'mcp__meta__list_dns_records',
  description: 'List all DNS records for a domain',
  parameters: {
    domain: { type: 'string' }  // e.g., '153.se'
  }
}

{
  name: 'mcp__meta__sync_tunnel',
  description: 'Sync port allocations to Cloudflare Tunnel ingress rules',
  parameters: {}
}

{
  name: 'mcp__meta__add_tunnel_route',
  description: 'Add single route to Cloudflare Tunnel',
  parameters: {
    hostname: { type: 'string' },
    port: { type: 'number' }
  }
}
```

---

## Usage Patterns

### Pattern 1: Deploy New Service (Full Workflow)

```typescript
// User: "Deploy API service for Consilio at api.consilio.153.se"

// 1. Allocate port
const port = await mcp__meta__get_port({
  projectName: 'consilio',
  serviceName: 'api',
  cloudflareHostname: 'api.consilio.153.se'
});
// port = 4001

// 2. Create CNAME in Cloudflare
await mcp__meta__create_cname({
  hostname: 'api.consilio.153.se',
  target: 'tunnel.153.se',  // Your tunnel CNAME target
  proxied: true
});

// 3. Sync tunnel routes (reads all port allocations, updates tunnel config)
await mcp__meta__sync_tunnel();

// 4. Deploy service
await deployService({
  name: 'consilio-api',
  port: 4001,
  env: {
    PORT: '4001',
    NODE_ENV: 'production'
  }
});

// Done! api.consilio.153.se → Cloudflare → Tunnel → localhost:4001 → Service

// Meta-supervisor reports:
// "Deployed consilio-api:
// - Port: 4001
// - URL: https://api.consilio.153.se
// - Status: Running"
```

### Pattern 2: Sync All Tunnel Routes

```typescript
// User: "Update Cloudflare tunnel with all services"

// Meta-supervisor syncs port allocations → tunnel ingress
await mcp__meta__sync_tunnel();

// This reads port_allocations table, generates tunnel config:
// ingress:
//   - hostname: consilio.153.se
//     service: http://localhost:4000
//   - hostname: api.consilio.153.se
//     service: http://localhost:4001
//   - hostname: openhorizon.cc
//     service: http://localhost:5000
//   - hostname: api.openhorizon.cc
//     service: http://localhost:5001
//   - service: http_status:404

// Writes to /etc/cloudflared/config.yml
// Restarts cloudflared
```

### Pattern 3: Create Subdomain

```typescript
// User: "Create metrics.consilio.153.se for Prometheus"

// 1. Allocate port
const port = await mcp__meta__get_port({
  projectName: 'consilio',
  serviceName: 'metrics',
  cloudflareHostname: 'metrics.consilio.153.se'
});
// port = 4004

// 2. Create CNAME
await mcp__meta__create_cname({
  hostname: 'metrics.consilio.153.se',
  target: 'tunnel.153.se',
  proxied: false  // Don't proxy (Prometheus has its own auth)
});

// 3. Add tunnel route
await mcp__meta__add_tunnel_route({
  hostname: 'metrics.consilio.153.se',
  port: 4004
});

// 4. Deploy Prometheus
await deployPrometheus({
  port: 4004,
  targets: ['localhost:4000', 'localhost:4001']
});

// Done! metrics.consilio.153.se → Prometheus on port 4004
```

### Pattern 4: List All DNS Records

```typescript
// User: "What DNS records do I have for 153.se?"

const records = await mcp__meta__list_dns_records({
  domain: '153.se'
});

// Returns:
[
  {
    id: 'rec-1',
    type: 'A',
    name: '153.se',
    content: '34.91.182.123',
    proxied: true
  },
  {
    id: 'rec-2',
    type: 'CNAME',
    name: 'www.153.se',
    content: '153.se',
    proxied: true
  },
  {
    id: 'rec-3',
    type: 'CNAME',
    name: 'tunnel.153.se',
    content: '<tunnel-id>.cfargotunnel.com',
    proxied: false
  },
  {
    id: 'rec-4',
    type: 'CNAME',
    name: 'consilio.153.se',
    content: 'tunnel.153.se',
    proxied: true
  },
  {
    id: 'rec-5',
    type: 'CNAME',
    name: 'api.consilio.153.se',
    content: 'tunnel.153.se',
    proxied: true
  }
]

// Meta-supervisor reports in plain language:
// "You have 5 DNS records for 153.se:
// - 153.se → Your VM (34.91.182.123)
// - www.153.se → 153.se
// - tunnel.153.se → Cloudflare Tunnel
// - consilio.153.se → Tunnel
// - api.consilio.153.se → Tunnel"
```

### Pattern 5: Delete Old Service

```typescript
// User: "Remove old-api.consilio.153.se, no longer needed"

// 1. Delete DNS record
await mcp__meta__delete_dns_record({
  hostname: 'old-api.consilio.153.se'
});

// 2. Release port allocation
await mcp__meta__release_port({
  projectName: 'consilio',
  serviceName: 'old-api'
});

// 3. Sync tunnel (removes route)
await mcp__meta__sync_tunnel();

// 4. Stop service
await stopService('consilio-old-api');

// Done! old-api.consilio.153.se no longer resolves
```

---

## Integration with Port Allocation

**Automatic workflow when service deployed:**

```typescript
// supervisor-service/src/deployment/ServiceDeployer.ts

export class ServiceDeployer {
  async deployService(options: {
    projectName: string;
    serviceName: string;
    hostname: string;
    dockerImage?: string;
    command?: string;
  }) {
    // 1. Allocate port
    const port = await portManager.getOrAllocate(
      options.projectName,
      options.serviceName,
      {
        description: `${options.serviceName} service`,
        cloudflareHostname: options.hostname
      }
    );

    // 2. Create CNAME in Cloudflare
    await cloudflareManager.createCNAME(
      options.hostname,
      'tunnel.153.se',
      { proxied: true }
    );

    // 3. Deploy service (Docker, systemd, PM2, etc.)
    await this.startService({
      name: `${options.projectName}-${options.serviceName}`,
      port,
      image: options.dockerImage,
      command: options.command
    });

    // 4. Sync tunnel routes
    await cloudflareManager.syncPortAllocationsToTunnel(portManager);

    return {
      port,
      hostname: options.hostname,
      url: `https://${options.hostname}`
    };
  }
}

// Usage:
const result = await serviceDeployer.deployService({
  projectName: 'consilio',
  serviceName: 'api',
  hostname: 'api.consilio.153.se',
  dockerImage: 'consilio-api:latest'
});

// Returns:
// {
//   port: 4001,
//   hostname: 'api.consilio.153.se',
//   url: 'https://api.consilio.153.se'
// }
```

---

## Cloudflare Tunnel Config Management

**Two config files:**

1. **Tunnel credentials:** `/home/samuel/.cloudflared/<tunnel-id>.json`
   - Contains tunnel token, account ID, secret
   - Never modify manually
   - Created by `cloudflared tunnel create`

2. **Ingress rules:** `/etc/cloudflared/config.yml`
   - Managed by meta-supervisor
   - Auto-generated from port allocations
   - Restarted after each change

**Example /etc/cloudflared/config.yml:**

```yaml
tunnel: abc123-def456-ghi789
credentials-file: /home/samuel/.cloudflared/abc123-def456-ghi789.json

ingress:
  # Meta-supervisor services
  - hostname: meta.153.se
    service: http://localhost:3000

  # Consilio services
  - hostname: consilio.153.se
    service: http://localhost:4000
  - hostname: api.consilio.153.se
    service: http://localhost:4001
  - hostname: ws.consilio.153.se
    service: http://localhost:4002

  # OpenHorizon services
  - hostname: openhorizon.cc
    service: http://localhost:5000
  - hostname: api.openhorizon.cc
    service: http://localhost:5001

  # Shared services
  - hostname: penpot.153.se
    service: http://localhost:9001
  - hostname: storybook.153.se
    service: http://localhost:6006

  # Catch-all (required)
  - service: http_status:404
```

**Restarting cloudflared:**

```bash
# After updating config
sudo systemctl restart cloudflared

# Check status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f
```

---

## Multi-Domain Support

**If you have multiple domains:**

```typescript
// Store zone IDs for each domain
await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/zone_id_153se',
  value: '<zone-id-for-153.se>',
  description: 'Zone ID for 153.se'
});

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/zone_id_openhorizon',
  value: '<zone-id-for-openhorizon.cc>',
  description: 'Zone ID for openhorizon.cc'
});

// CloudflareManager automatically detects domain from hostname
// api.consilio.153.se → uses zone_id_153se
// api.openhorizon.cc → uses zone_id_openhorizon
```

---

## Error Handling

**Common scenarios:**

### DNS Record Already Exists
```typescript
// CloudflareManager handles automatically
await mcp__meta__create_cname({
  hostname: 'api.consilio.153.se',
  target: 'tunnel.153.se'
});
// If record exists, updates instead of creating
```

### Cloudflare API Rate Limit
```typescript
try {
  await cloudflareManager.createCNAME(hostname, target);
} catch (error) {
  if (error.response?.status === 429) {
    // Rate limited, wait and retry
    await sleep(5000);
    await cloudflareManager.createCNAME(hostname, target);
  }
}
```

### Tunnel Restart Fails
```typescript
try {
  await exec('sudo systemctl restart cloudflared');
} catch (error) {
  // Check logs
  const logs = await exec('sudo journalctl -u cloudflared -n 50 --no-pager');
  console.error('Cloudflared restart failed:', logs);
  // Notify user
}
```

### Invalid Hostname
```typescript
// Validation before creating DNS record
function validateHostname(hostname: string): boolean {
  const regex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
  return regex.test(hostname);
}

if (!validateHostname(hostname)) {
  throw new Error(`Invalid hostname: ${hostname}`);
}
```

---

## Initial Setup

### 1. Create Cloudflare API Token

**Go to:** https://dash.cloudflare.com/profile/api-tokens

**Click:** Create Token → Create Custom Token

**Permissions:**
- Zone - DNS - Edit (for all zones)
- Account - Cloudflare Tunnel - Edit

**Zone Resources:**
- Include - All zones

**Copy token and store:**

```typescript
await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/api_token',
  value: '<token-from-cloudflare>',
  description: 'Cloudflare API token'
});
```

### 2. Get Account and Zone IDs

```bash
# Account ID: In Cloudflare dashboard URL
# https://dash.cloudflare.com/<ACCOUNT_ID>/...

# Zone ID: On domain overview page
# Or via API:
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer <api-token>" \
  | jq '.result[] | {name: .name, id: .id}'
```

### 3. Get Tunnel ID

```bash
# List tunnels
cloudflared tunnel list

# Output:
# ID                                   NAME           CREATED
# abc123-def456-ghi789                 my-tunnel      2024-01-15T10:30:00Z

# Use ID: abc123-def456-ghi789
```

### 4. Store All Secrets

```typescript
// Run once via meta-supervisor

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/api_token',
  value: '<from-step-1>'
});

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/account_id',
  value: '<from-step-2>'
});

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/zone_id_153se',
  value: '<from-step-2>'
});

await mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/tunnel_id',
  value: '<from-step-3>'
});
```

---

## Testing

### Test DNS Record Creation

```typescript
// Create test CNAME
const result = await mcp__meta__create_cname({
  hostname: 'test.153.se',
  target: 'tunnel.153.se',
  proxied: true
});

console.log(result);
// { id: 'rec-abc123', name: 'test.153.se', content: 'tunnel.153.se' }

// Verify via DNS
await exec('dig test.153.se CNAME +short');
// Output: tunnel.153.se

// Delete test record
await mcp__meta__delete_dns_record({ hostname: 'test.153.se' });
```

### Test Tunnel Sync

```typescript
// Manually add port allocation
await mcp__meta__allocate_port({
  projectName: 'consilio',
  serviceName: 'test-api',
  cloudflareHostname: 'test-api.consilio.153.se'
});

// Sync tunnel
await mcp__meta__sync_tunnel();

// Check config
await exec('cat /etc/cloudflared/config.yml');
// Should include:
//   - hostname: test-api.consilio.153.se
//     service: http://localhost:4XXX

// Cleanup
await mcp__meta__release_port({
  projectName: 'consilio',
  serviceName: 'test-api'
});
await mcp__meta__delete_dns_record({ hostname: 'test-api.consilio.153.se' });
await mcp__meta__sync_tunnel();
```

---

## Implementation Checklist

**Phase 1: Secrets Setup**
- [ ] Create Cloudflare API token
- [ ] Get account ID and zone IDs
- [ ] Get tunnel ID
- [ ] Store all secrets in database

**Phase 2: CloudflareManager Class**
- [ ] Implement CloudflareManager.ts
- [ ] Add createCNAME() method
- [ ] Add createARecord() method
- [ ] Add deleteDNSRecord() method
- [ ] Add listDNSRecords() method
- [ ] Add updateTunnelIngress() method
- [ ] Add syncPortAllocationsToTunnel() method
- [ ] Write unit tests

**Phase 3: MCP Tools**
- [ ] Expose mcp__meta__create_cname
- [ ] Expose mcp__meta__create_a_record
- [ ] Expose mcp__meta__delete_dns_record
- [ ] Expose mcp__meta__list_dns_records
- [ ] Expose mcp__meta__sync_tunnel
- [ ] Expose mcp__meta__add_tunnel_route

**Phase 4: Integration**
- [ ] Integrate with PortManager (auto-sync tunnel on port allocation)
- [ ] Integrate with ServiceDeployer (auto-create DNS records)
- [ ] Add to new-project workflow (auto-create subdomains)

**Phase 5: Testing**
- [ ] Test creating CNAME records
- [ ] Test creating A records
- [ ] Test deleting records
- [ ] Test tunnel sync
- [ ] Test full deployment workflow

**Phase 6: Documentation**
- [ ] Update meta-supervisor CLAUDE.md with Cloudflare usage
- [ ] Document DNS naming conventions
- [ ] Add to troubleshooting guide

---

## Summary

**What we built:**
- CloudflareManager for DNS and tunnel management
- Automatic CNAME creation on service deployment
- Tunnel ingress sync with port allocations
- MCP tools for meta-supervisor
- Zero manual Cloudflare portal usage

**What we automated:**
- DNS record creation/deletion
- Tunnel route updates
- Cloudflared config generation
- Service restart coordination

**Result:**
- User says: "Deploy service at api.consilio.153.se"
- Meta-supervisor:
  1. Allocates port (4001)
  2. Creates CNAME (api.consilio.153.se)
  3. Updates tunnel route
  4. Deploys service
  5. Reports: "Live at https://api.consilio.153.se"
- All automatic, no manual steps

**Estimated implementation time:** 6-8 hours

**This solves requirement #5 from your message.**

Next: GCloud integration (requirement #6) - the final piece!
