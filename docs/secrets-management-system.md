# Secrets Management System

**Date:** 2026-01-18
**Problem:** SCAR built secrets system but supervisors couldn't find them easily
**Solution:** Simple, predictable secrets storage with easy retrieval

---

## Simple Explanation (For Non-Coders)

**Think of it like a password manager (like 1Password or LastPass):**

1. **Store a secret:**
   ```
   You tell project supervisor: "Store my Stripe API key"
   Supervisor calls: mcp__meta__set_secret({
     keyPath: 'project/consilio/stripe_api_key',
     value: 'sk_live_abc123xyz...'
   })
   Secret encrypted and saved to database
   ```

2. **Retrieve a secret:**
   ```
   Later, when deploying payment service...
   Supervisor calls: mcp__meta__get_secret({
     keyPath: 'project/consilio/stripe_api_key'
   })
   Returns: 'sk_live_abc123xyz...'
   Uses it immediately
   ```

**That's it!** Like saving a password in your browser and retrieving it later.

**Yes, project supervisors can:**
- ✅ Store secrets themselves (via MCP tool)
- ✅ Retrieve secrets themselves (via MCP tool)
- ✅ List what secrets they have
- ✅ Update secrets (store with same key path)

**You never have to:**
- ❌ Search for secret files
- ❌ Remember where you put API keys
- ❌ Edit files manually

**Just tell supervisor:** "Store this API key" or "Use my Cloudflare token"
**Supervisor handles everything automatically.**

---

## The Problem with SCAR's Approach

**What SCAR did:**
- Complex file-based secrets storage
- Supervisors had to search for secrets
- Over-engineered for the use case
- Secrets scattered across multiple locations

**What we need:**
- Store API keys, tokens, service account credentials
- Supervisors can retrieve without searching
- Simple, predictable access pattern
- Secure but not over-complicated

---

## Proposed Solution: Simple PostgreSQL Secrets Store

**Why PostgreSQL:**
- ✅ Already running on VM
- ✅ Encrypted at rest (pgcrypto extension)
- ✅ Fast key-value lookups
- ✅ Hierarchical scoping (meta/project/service)
- ✅ Accessible via MCP tools
- ✅ No new services to manage

**Why NOT complex solutions:**
- ❌ HashiCorp Vault: Overkill for single-user system
- ❌ File-based: Hard to search, no encryption
- ❌ Environment variables: Lost on restart, not persistent
- ❌ Git-stored: Security risk even with .gitignore

---

## Database Schema

```sql
-- Enable encryption extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Secrets table
CREATE TABLE secrets (
  id SERIAL PRIMARY KEY,

  -- Hierarchical key path (e.g., "meta/cloudflare/api_token")
  key_path TEXT NOT NULL UNIQUE,

  -- Encrypted value
  encrypted_value BYTEA NOT NULL,

  -- Metadata
  description TEXT,
  scope TEXT NOT NULL,  -- 'meta', 'project', 'service'
  project_name TEXT,    -- NULL for meta-level secrets
  service_name TEXT,    -- NULL for project-level secrets

  -- Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT DEFAULT 'supervisor',
  last_accessed_at TIMESTAMP,
  access_count INTEGER DEFAULT 0,

  -- Optional rotation
  expires_at TIMESTAMP,
  rotation_required BOOLEAN DEFAULT FALSE
);

-- Indexes for fast lookup
CREATE INDEX idx_secrets_key_path ON secrets(key_path);
CREATE INDEX idx_secrets_scope ON secrets(scope);
CREATE INDEX idx_secrets_project ON secrets(project_name) WHERE project_name IS NOT NULL;
CREATE INDEX idx_secrets_service ON secrets(service_name) WHERE service_name IS NOT NULL;
CREATE INDEX idx_secrets_expires ON secrets(expires_at) WHERE expires_at IS NOT NULL;

-- Encryption key stored in environment variable
-- SECRETS_ENCRYPTION_KEY=<random-256-bit-key>
-- Generated once, stored in ~/.bashrc or systemd service file
```

---

## Hierarchical Key Structure

**Format:** `{scope}/{context}/{name}`

### Meta-Level Secrets (scope=meta)
```
meta/cloudflare/api_token
meta/cloudflare/account_id
meta/gcloud/vm_host_key          # Service account JSON for VM host
meta/gcloud/openhorizon_key      # Service account JSON for OpenHorizon
meta/openai/api_key              # For embeddings (local RAG)
meta/github/pat                  # Personal access token
meta/postgres/master_password
```

### Project-Level Secrets (scope=project)
```
project/consilio/database_url
project/consilio/jwt_secret
project/consilio/stripe_api_key
project/odin/google_sheets_api_key
project/openhorizon/sendgrid_api_key
```

### Service-Level Secrets (scope=service)
```
service/storybook/auth_token
service/penpot/admin_password
service/archon/supabase_key
```

**Easy to remember, impossible to lose.**

---

## Simple CRUD Operations

### TypeScript Implementation

```typescript
// supervisor-service/src/secrets/SecretsManager.ts

import { Pool } from 'pg';
import crypto from 'crypto';

export class SecretsManager {
  private db: Pool;
  private encryptionKey: Buffer;

  constructor(db: Pool) {
    this.db = db;

    // Get encryption key from environment
    const key = process.env.SECRETS_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('SECRETS_ENCRYPTION_KEY not set');
    }
    this.encryptionKey = Buffer.from(key, 'hex');
  }

  /**
   * Store a secret (create or update)
   */
  async set(
    keyPath: string,
    value: string,
    options?: {
      description?: string;
      expiresAt?: Date;
    }
  ): Promise<void> {
    const { scope, projectName, serviceName } = this.parseKeyPath(keyPath);

    // Encrypt value
    const encrypted = await this.encrypt(value);

    await this.db.query(`
      INSERT INTO secrets (
        key_path, encrypted_value, description,
        scope, project_name, service_name, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (key_path)
      DO UPDATE SET
        encrypted_value = $2,
        description = $3,
        updated_at = NOW(),
        expires_at = $7
    `, [
      keyPath,
      encrypted,
      options?.description,
      scope,
      projectName,
      serviceName,
      options?.expiresAt
    ]);
  }

  /**
   * Get a secret (simple, no searching)
   */
  async get(keyPath: string): Promise<string | null> {
    const result = await this.db.query(`
      UPDATE secrets
      SET
        last_accessed_at = NOW(),
        access_count = access_count + 1
      WHERE key_path = $1
      RETURNING encrypted_value, expires_at
    `, [keyPath]);

    if (result.rows.length === 0) {
      return null;
    }

    const { encrypted_value, expires_at } = result.rows[0];

    // Check expiration
    if (expires_at && new Date(expires_at) < new Date()) {
      throw new Error(`Secret ${keyPath} has expired`);
    }

    // Decrypt and return
    return await this.decrypt(encrypted_value);
  }

  /**
   * List secrets (without values, for discovery)
   */
  async list(filter?: {
    scope?: string;
    project?: string;
    service?: string;
  }): Promise<Array<{
    keyPath: string;
    description: string;
    scope: string;
    lastAccessed: Date;
  }>> {
    let query = 'SELECT key_path, description, scope, last_accessed_at FROM secrets WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filter?.scope) {
      query += ` AND scope = $${paramIndex++}`;
      params.push(filter.scope);
    }
    if (filter?.project) {
      query += ` AND project_name = $${paramIndex++}`;
      params.push(filter.project);
    }
    if (filter?.service) {
      query += ` AND service_name = $${paramIndex++}`;
      params.push(filter.service);
    }

    query += ' ORDER BY key_path';

    const result = await this.db.query(query, params);
    return result.rows.map(row => ({
      keyPath: row.key_path,
      description: row.description,
      scope: row.scope,
      lastAccessed: row.last_accessed_at
    }));
  }

  /**
   * Delete a secret
   */
  async delete(keyPath: string): Promise<void> {
    await this.db.query('DELETE FROM secrets WHERE key_path = $1', [keyPath]);
  }

  /**
   * Parse key path into components
   */
  private parseKeyPath(keyPath: string): {
    scope: string;
    projectName: string | null;
    serviceName: string | null;
  } {
    const parts = keyPath.split('/');

    if (parts.length < 2) {
      throw new Error(`Invalid key path: ${keyPath}. Format: scope/context/name`);
    }

    const scope = parts[0];

    if (scope === 'meta') {
      return { scope: 'meta', projectName: null, serviceName: null };
    } else if (scope === 'project') {
      return { scope: 'project', projectName: parts[1], serviceName: null };
    } else if (scope === 'service') {
      return { scope: 'service', projectName: null, serviceName: parts[1] };
    } else {
      throw new Error(`Invalid scope: ${scope}. Must be meta, project, or service`);
    }
  }

  /**
   * Encrypt value using AES-256-GCM
   */
  private async encrypt(value: string): Promise<Buffer> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(value, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag();

    // Store: IV (16 bytes) + Auth Tag (16 bytes) + Encrypted Data
    return Buffer.concat([iv, authTag, encrypted]);
  }

  /**
   * Decrypt value
   */
  private async decrypt(encrypted: Buffer): Promise<string> {
    const iv = encrypted.subarray(0, 16);
    const authTag = encrypted.subarray(16, 32);
    const data = encrypted.subarray(32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(data);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }
}
```

---

## MCP Tools for Supervisors

**Expose via supervisor-service:**

```typescript
// MCP tool definitions

{
  name: 'mcp__meta__get_secret',
  description: 'Get a secret by key path (e.g., meta/cloudflare/api_token)',
  parameters: {
    keyPath: {
      type: 'string',
      description: 'Full key path to secret'
    }
  }
}

{
  name: 'mcp__meta__set_secret',
  description: 'Store a secret (create or update)',
  parameters: {
    keyPath: { type: 'string' },
    value: { type: 'string' },
    description: { type: 'string', optional: true },
    expiresAt: { type: 'string', optional: true }  // ISO date
  }
}

{
  name: 'mcp__meta__list_secrets',
  description: 'List available secrets (without values)',
  parameters: {
    scope: { type: 'string', optional: true },  // meta, project, service
    project: { type: 'string', optional: true },
    service: { type: 'string', optional: true }
  }
}

{
  name: 'mcp__meta__delete_secret',
  description: 'Delete a secret',
  parameters: {
    keyPath: { type: 'string' }
  }
}
```

**Usage from supervisor:**

```typescript
// Supervisor needs Cloudflare API token
const token = await mcp__meta__get_secret({
  keyPath: 'meta/cloudflare/api_token'
});

// Use token
await cloudflareAPI.createCNAME(token, { /* ... */ });

// No searching, no complexity, just works
```

---

## Initial Setup

### 1. Generate Encryption Key

```bash
# Generate 256-bit key (one time only)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# a3f8c9d2e1b4a6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1

# Store in environment (choose one location)
```

### 2. Store Key Securely

**Option A: User's bashrc (simple)**
```bash
echo "export SECRETS_ENCRYPTION_KEY='<key-from-step-1>'" >> ~/.bashrc
source ~/.bashrc
```

**Option B: systemd service file (better)**
```ini
# /etc/systemd/system/supervisor-service.service

[Service]
Environment="SECRETS_ENCRYPTION_KEY=<key-from-step-1>"
```

**Option C: .env file (development)**
```bash
# /home/samuel/supervisor/supervisor-service/.env
SECRETS_ENCRYPTION_KEY=<key-from-step-1>
```

**⚠️ NEVER commit encryption key to Git**

### 3. Run Database Migration

```sql
-- migrations/006_secrets_management.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE secrets (
  id SERIAL PRIMARY KEY,
  key_path TEXT NOT NULL UNIQUE,
  encrypted_value BYTEA NOT NULL,
  description TEXT,
  scope TEXT NOT NULL,
  project_name TEXT,
  service_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT DEFAULT 'supervisor',
  last_accessed_at TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  rotation_required BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_secrets_key_path ON secrets(key_path);
CREATE INDEX idx_secrets_scope ON secrets(scope);
CREATE INDEX idx_secrets_project ON secrets(project_name) WHERE project_name IS NOT NULL;
CREATE INDEX idx_secrets_service ON secrets(service_name) WHERE service_name IS NOT NULL;
CREATE INDEX idx_secrets_expires ON secrets(expires_at) WHERE expires_at IS NOT NULL;
```

```bash
# Run migration
psql $DATABASE_URL < migrations/006_secrets_management.sql
```

### 4. Populate Initial Secrets

```bash
# Via CLI or supervisor conversation

# Meta-level secrets
mcp__meta__set_secret({
  keyPath: 'meta/cloudflare/api_token',
  value: '<actual-token>',
  description: 'Cloudflare API token for DNS management'
})

mcp__meta__set_secret({
  keyPath: 'meta/gcloud/vm_host_key',
  value: '<service-account-json>',
  description: 'GCloud service account for VM host project'
})

mcp__meta__set_secret({
  keyPath: 'meta/github/pat',
  value: '<github-token>',
  description: 'GitHub personal access token'
})

# Project-level secrets
mcp__meta__set_secret({
  keyPath: 'project/consilio/database_url',
  value: 'postgresql://...',
  description: 'Consilio production database'
})

# Service-level secrets
mcp__meta__set_secret({
  keyPath: 'service/penpot/admin_password',
  value: '<password>',
  description: 'Penpot admin user password'
})
```

---

## Usage Patterns

### Pattern 1: Supervisor Retrieves Secret

```typescript
// In project supervisor or meta-supervisor

// Need to deploy service, need database URL
const dbUrl = await mcp__meta__get_secret({
  keyPath: 'project/consilio/database_url'
});

// Use immediately
await deployService({
  env: {
    DATABASE_URL: dbUrl
  }
});

// No searching, no complexity
```

### Pattern 2: Supervisor Creates New Secret

```typescript
// User tells supervisor: "Create API key for new service"

// Supervisor generates key
const apiKey = crypto.randomBytes(32).toString('hex');

// Stores it
await mcp__meta__set_secret({
  keyPath: 'service/new-api/api_key',
  value: apiKey,
  description: 'API key for new service authentication'
});

// Returns to user (one time display)
// User saves it externally if needed
```

### Pattern 3: List Available Secrets (Discovery)

```typescript
// Supervisor doesn't know what secrets exist for a project

const secrets = await mcp__meta__list_secrets({
  scope: 'project',
  project: 'consilio'
});

// Returns:
[
  {
    keyPath: 'project/consilio/database_url',
    description: 'Consilio production database',
    scope: 'project',
    lastAccessed: '2026-01-18T10:30:00Z'
  },
  {
    keyPath: 'project/consilio/jwt_secret',
    description: 'JWT signing key',
    scope: 'project',
    lastAccessed: '2026-01-17T14:22:00Z'
  }
]

// Now supervisor knows what's available
```

### Pattern 4: Rotate Expiring Secret

```typescript
// Weekly cron job (or supervisor checks periodically)

const expiringSecrets = await db.query(`
  SELECT key_path, expires_at
  FROM secrets
  WHERE expires_at < NOW() + INTERVAL '7 days'
  AND rotation_required = TRUE
`);

// Notify user or auto-rotate if possible
for (const secret of expiringSecrets.rows) {
  console.log(`Secret ${secret.key_path} expires soon: ${secret.expires_at}`);
  // Supervisor can auto-generate new key and update
}
```

---

## Integration with GCloud Service Accounts

**GCloud service accounts are JSON files:**

```typescript
// Store entire service account JSON as secret

const serviceAccountJson = JSON.stringify({
  "type": "service_account",
  "project_id": "openhorizon-prod",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "supervisor@openhorizon.iam.gserviceaccount.com",
  // ... rest of JSON
});

await mcp__meta__set_secret({
  keyPath: 'meta/gcloud/openhorizon_key',
  value: serviceAccountJson,
  description: 'GCloud service account for OpenHorizon project (Owner role)'
});

// Later, when supervisor needs to use GCloud API
const serviceAccountJson = await mcp__meta__get_secret({
  keyPath: 'meta/gcloud/openhorizon_key'
});

const serviceAccount = JSON.parse(serviceAccountJson);

// Authenticate with GCloud SDK
const auth = new GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const computeEngine = google.compute({ version: 'v1', auth });

// Now supervisor can manage VMs, networking, etc.
```

---

## Security Considerations

**What's secure:**
- ✅ AES-256-GCM encryption (industry standard)
- ✅ Unique IV per secret (prevents pattern analysis)
- ✅ Authentication tag (prevents tampering)
- ✅ Encryption key stored outside database
- ✅ Encrypted at rest in PostgreSQL
- ✅ Access tracking (audit trail)

**What's NOT protected against:**
- ⚠️ Root access to VM (can read encryption key from env)
- ⚠️ Root access to PostgreSQL (can dump encrypted data)
- ⚠️ Compromise of supervisor-service process (has decryption capability)

**This is acceptable because:**
- Single-user system (you control the VM)
- No external attackers have access
- Better than plaintext or Git storage
- Secrets not committed to public repos
- Encryption key not in codebase

**Additional hardening (optional):**
- Store encryption key in separate secrets manager (AWS Secrets Manager, GCP Secret Manager)
- Use PostgreSQL row-level security
- Implement IP whitelisting for database access
- Regular key rotation

**For this use case, the proposed solution is sufficient.**

---

## Comparison: Old (SCAR) vs New (Simple)

### SCAR's Approach (Over-Engineered)

```
Multiple locations:
- .archon/secrets/
- .env files
- Git-ignored files
- Scattered across projects

Supervisors had to:
1. Search for secret files
2. Parse different formats
3. Hope they're in the right location
4. Often couldn't find them

Result: User had to manually point to secrets
```

### New Approach (Simple)

```
Single location:
- PostgreSQL secrets table

Supervisors:
1. Know exact key path (e.g., meta/cloudflare/api_token)
2. Call mcp__meta__get_secret({ keyPath: '...' })
3. Get decrypted value immediately

Result: Always works, no searching
```

---

## Migration from Existing Secrets

**If SCAR stored secrets in files:**

```bash
# One-time migration script

# Find all SCAR secrets
find /home/samuel/.archon -name "*.secret" -o -name "*.key" -o -name ".env"

# For each secret file, import to new system
# Example:
cat /home/samuel/.archon/secrets/cloudflare_token.secret | \
  # Call MCP tool to store
  mcp__meta__set_secret({
    keyPath: 'meta/cloudflare/api_token',
    value: '<paste-value>',
    description: 'Migrated from SCAR'
  })

# Delete old secret files after verification
```

**If secrets in environment variables:**

```bash
# Read from current environment
echo $CLOUDFLARE_API_TOKEN | \
  # Store in new system
  mcp__meta__set_secret({
    keyPath: 'meta/cloudflare/api_token',
    value: '<value>',
    description: 'Migrated from environment'
  })
```

**If secrets in .env files:**

```bash
# Parse .env file
while IFS='=' read -r key value; do
  # Determine key path based on context
  # Store in new system
  mcp__meta__set_secret({
    keyPath: "project/consilio/${key,,}",  # lowercase key
    value: "$value",
    description: 'Migrated from .env'
  })
done < .env
```

---

## Error Handling

**Common scenarios:**

### Secret Not Found
```typescript
const secret = await mcp__meta__get_secret({
  keyPath: 'meta/nonexistent/key'
});
// Returns: null

// Supervisor handles:
if (!secret) {
  // Ask user to provide secret
  // Or use default/generate new
}
```

### Secret Expired
```typescript
try {
  const secret = await mcp__meta__get_secret({
    keyPath: 'meta/api/token'
  });
} catch (error) {
  if (error.message.includes('expired')) {
    // Notify user
    // Request new token
    // Update secret
  }
}
```

### Encryption Key Missing
```typescript
// On supervisor-service startup
if (!process.env.SECRETS_ENCRYPTION_KEY) {
  console.error('FATAL: SECRETS_ENCRYPTION_KEY not set');
  console.error('Generate key: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  console.error('Set in ~/.bashrc or systemd service file');
  process.exit(1);
}
```

---

## Implementation Checklist

**Phase 1: Database Setup**
- [ ] Create migration file (006_secrets_management.sql)
- [ ] Run migration on PostgreSQL
- [ ] Verify pgcrypto extension loaded

**Phase 2: Encryption Key**
- [ ] Generate 256-bit encryption key
- [ ] Store in ~/.bashrc or systemd service file
- [ ] Verify accessible to supervisor-service process

**Phase 3: SecretsManager Class**
- [ ] Implement SecretsManager.ts
- [ ] Add encrypt/decrypt methods (AES-256-GCM)
- [ ] Add CRUD operations (set, get, list, delete)
- [ ] Add key path parsing logic
- [ ] Write unit tests

**Phase 4: MCP Tools**
- [ ] Expose mcp__meta__get_secret
- [ ] Expose mcp__meta__set_secret
- [ ] Expose mcp__meta__list_secrets
- [ ] Expose mcp__meta__delete_secret
- [ ] Add permission checks (meta-supervisor only for meta/ scope)

**Phase 5: Migration**
- [ ] Identify all existing secrets (SCAR, .env, environment)
- [ ] Import to new system via MCP tools
- [ ] Verify all secrets accessible
- [ ] Delete old secret files (after backup)

**Phase 6: Documentation**
- [ ] Update meta-supervisor CLAUDE.md with secret usage
- [ ] Update project supervisors with secret retrieval patterns
- [ ] Document key rotation procedures
- [ ] Add to troubleshooting guide

---

## Summary

**What we built:**
- Simple PostgreSQL-based secrets storage
- AES-256-GCM encryption
- Hierarchical key paths (meta/project/service)
- Easy MCP tools for supervisors
- No searching required

**What we avoided:**
- Over-engineering (no Vault, no complex systems)
- File-based storage (hard to manage)
- Git storage (security risk)
- Environment variables (not persistent)

**Result:**
- Supervisors know exact key paths
- Single function call to get secret
- Encrypted at rest
- Audit trail (access tracking)
- Simple to use, simple to maintain

**Estimated implementation time:** 4-6 hours

**This solves requirement #3 from your message.**

Next: Port allocation system (requirement #4)
