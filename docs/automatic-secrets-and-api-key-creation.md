# Automatic Secrets Storage & API Key Creation

**Date:** 2026-01-18
**Goal:** Never manually manage secrets or API keys
**User requirement:** "if it asks me for a api key and i give it it should automatically save it as a secret"

---

## Part 1: Automatic Secret Storage

### The Problem

**Current flow (manual):**
```
Supervisor: "I need Stripe API key to deploy payment service"
User: "It's sk_live_abc123xyz..."
Supervisor: Uses it, then... forgets it
Next time: Asks again 😠
```

**Desired flow (automatic):**
```
Supervisor: "I need Stripe API key for Consilio"
User: "It's sk_live_abc123xyz..."
Supervisor:
  1. Detects it's an API key
  2. Automatically stores as secret
  3. Never asks again ✅
```

---

## Implementation: Automatic Secret Detection

### Pattern Recognition

**Supervisor detects API keys/secrets automatically:**

```typescript
// supervisor-service/src/secrets/AutoSecretDetector.ts

export class AutoSecretDetector {
  private patterns = {
    // Anthropic
    anthropic: /^sk-ant-[a-zA-Z0-9-_]{95,}$/,

    // OpenAI
    openai: /^sk-[a-zA-Z0-9]{48}$/,
    openai_org: /^org-[a-zA-Z0-9]{24}$/,

    // Google/Gemini
    google_api: /^AIza[0-9A-Za-z-_]{35}$/,

    // Stripe
    stripe_live: /^sk_live_[a-zA-Z0-9]{24,}$/,
    stripe_test: /^sk_test_[a-zA-Z0-9]{24,}$/,

    // GitHub
    github_pat: /^ghp_[a-zA-Z0-9]{36}$/,

    // Cloudflare
    cloudflare: /^[a-zA-Z0-9]{40}$/,

    // Database URLs
    postgres: /^postgres(ql)?:\/\/.+$/,
    mongodb: /^mongodb(\+srv)?:\/\/.+$/,

    // Generic patterns
    jwt_secret: /^[a-zA-Z0-9-_]{32,}$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  };

  /**
   * Detect if string is likely a secret
   */
  detectSecret(value: string, context?: {
    question?: string;
    projectName?: string;
  }): SecretDetection | null {
    // Test against patterns
    for (const [type, pattern] of Object.entries(this.patterns)) {
      if (pattern.test(value)) {
        return {
          type,
          value,
          keyPath: this.generateKeyPath(type, context),
          description: this.generateDescription(type, context)
        };
      }
    }

    // Context-based detection (if pattern doesn't match)
    if (context?.question) {
      const question = context.question.toLowerCase();

      // Keywords in question
      if (question.includes('api key') || question.includes('token')) {
        return {
          type: 'api_key',
          value,
          keyPath: this.generateKeyPath('api_key', context),
          description: this.generateDescription('api_key', context)
        };
      }

      if (question.includes('password') || question.includes('secret')) {
        return {
          type: 'password',
          value,
          keyPath: this.generateKeyPath('password', context),
          description: this.generateDescription('password', context)
        };
      }

      if (question.includes('database') || question.includes('connection string')) {
        return {
          type: 'database_url',
          value,
          keyPath: this.generateKeyPath('database_url', context),
          description: this.generateDescription('database_url', context)
        };
      }
    }

    return null;
  }

  /**
   * Generate appropriate key path
   */
  private generateKeyPath(type: string, context?: {
    question?: string;
    projectName?: string;
  }): string {
    const project = context?.projectName;

    // Meta-level secrets
    if (type === 'anthropic' || type === 'openai') {
      return `meta/${type}/api_key`;
    }

    if (type === 'cloudflare') {
      return 'meta/cloudflare/api_token';
    }

    if (type === 'github_pat') {
      return 'meta/github/pat';
    }

    // Project-level secrets
    if (project) {
      if (type === 'stripe_live' || type === 'stripe_test') {
        return `project/${project}/stripe_api_key`;
      }

      if (type === 'database_url' || type === 'postgres' || type === 'mongodb') {
        return `project/${project}/database_url`;
      }

      // Generic project secret
      return `project/${project}/${type}`;
    }

    // Fallback
    return `meta/${type}`;
  }

  /**
   * Generate description
   */
  private generateDescription(type: string, context?: {
    question?: string;
    projectName?: string;
  }): string {
    const project = context?.projectName ? ` for ${context.projectName}` : '';

    const descriptions: Record<string, string> = {
      anthropic: 'Anthropic API key for Claude',
      openai: 'OpenAI API key',
      google_api: 'Google/Gemini API key',
      stripe_live: `Stripe live API key${project}`,
      stripe_test: `Stripe test API key${project}`,
      github_pat: 'GitHub personal access token',
      cloudflare: 'Cloudflare API token',
      postgres: `PostgreSQL connection string${project}`,
      mongodb: `MongoDB connection string${project}`,
      database_url: `Database URL${project}`
    };

    return descriptions[type] || `API key/secret${project}`;
  }
}
```

---

## Automatic Workflow

### When User Provides Secret

```typescript
// Supervisor conversation flow

export class SupervisorConversation {
  async processUserMessage(message: string, context: ConversationContext): Promise<void> {
    // Check if message contains a secret
    const detection = this.secretDetector.detectSecret(message, {
      question: context.lastQuestion,
      projectName: context.projectName
    });

    if (detection) {
      // AUTOMATIC: Store secret
      await this.secretsManager.set(
        detection.keyPath,
        detection.value,
        {
          description: detection.description
        }
      );

      // Confirm to user (but don't show secret again)
      this.respond(`✅ Stored ${detection.description} securely`);
      this.respond(`I'll use this automatically when needed`);

      // Don't process message further (don't show secret in logs)
      return;
    }

    // Normal message processing
    await this.processNormalMessage(message, context);
  }
}
```

### Example Flow

**User conversation:**

```
Supervisor: "I need a Stripe API key to deploy the payment service.
             What's your Stripe live API key?"

User: "sk_live_51Hx3K2L..."

Supervisor: "✅ Stored Stripe live API key for consilio securely
             ✅ I'll use this automatically when needed

             Deploying payment service now..."

[Service deploys, uses stored key automatically]

---

[Later, different feature...]

Supervisor: "Deploying subscription service..."
[Automatically retrieves stored Stripe key]
[No need to ask user again!]
```

---

## Part 2: API Key Creation

### Goal

**Instead of user creating keys manually:**
- ❌ User goes to Anthropic dashboard
- ❌ Creates API key
- ❌ Copies it
- ❌ Pastes to supervisor
- ❌ Forgets to restrict permissions

**Automatic:**
- ✅ Project supervisor: "I need Anthropic API key"
- ✅ Meta-supervisor: Creates key via API
- ✅ Stores in secrets
- ✅ Returns to project supervisor
- ✅ Sets proper permissions automatically

---

## API Key Creation by Provider

### 1. Anthropic API

**Research:** Anthropic API **does NOT** support creating API keys programmatically

**Current API:** No key management endpoints
**Source:** https://docs.anthropic.com/en/api/

**Status:** ❌ Not possible (as of Jan 2026)

**Workaround:**
- User creates key once in Anthropic Console
- Stores in meta-supervisor secrets
- All projects share same key (different projects in metadata)

---

### 2. OpenAI API

**Research:** OpenAI API **does NOT** support creating API keys programmatically

**Current API:** No key management endpoints
**Source:** https://platform.openai.com/docs/api-reference

**Status:** ❌ Not possible (as of Jan 2026)

**Workaround:**
- User creates Organization API key in OpenAI dashboard
- Stores in meta-supervisor secrets
- Projects use same key (track usage via headers)

---

### 3. Google Cloud / Gemini API

**Research:** Google Cloud **DOES** support creating API keys programmatically! ✅

**API:** Service Account Keys API
**Endpoint:** `serviceaccounts.keys.create`
**Docs:** https://cloud.google.com/iam/docs/creating-managing-service-account-keys

**Implementation:**

```typescript
// supervisor-service/src/gcloud/APIKeyCreator.ts

import { google } from 'googleapis';

export class GoogleAPIKeyCreator {
  private iam: any;

  async createAPIKey(options: {
    projectId: string;
    serviceName: string;
    scopes: string[];
  }): Promise<{
    apiKey: string;
    keyId: string;
    serviceAccountEmail: string;
  }> {
    // 1. Create service account
    const serviceAccount = await this.iam.projects.serviceAccounts.create({
      name: `projects/${options.projectId}`,
      requestBody: {
        accountId: `${options.serviceName}-api`,
        serviceAccount: {
          displayName: `${options.serviceName} API Service Account`
        }
      }
    });

    const serviceAccountEmail = serviceAccount.data.email;

    // 2. Grant IAM roles based on scopes
    for (const scope of options.scopes) {
      await this.iam.projects.setIamPolicy({
        resource: `projects/${options.projectId}`,
        requestBody: {
          policy: {
            bindings: [{
              role: this.scopeToRole(scope),
              members: [`serviceAccount:${serviceAccountEmail}`]
            }]
          }
        }
      });
    }

    // 3. Create API key
    const key = await this.iam.projects.serviceAccounts.keys.create({
      name: `projects/${options.projectId}/serviceAccounts/${serviceAccountEmail}`,
      requestBody: {
        privateKeyType: 'TYPE_GOOGLE_CREDENTIALS_FILE'
      }
    });

    const keyData = JSON.parse(
      Buffer.from(key.data.privateKeyData, 'base64').toString()
    );

    return {
      apiKey: keyData.private_key,
      keyId: key.data.name,
      serviceAccountEmail
    };
  }

  /**
   * Delete API key
   */
  async deleteAPIKey(keyId: string): Promise<void> {
    await this.iam.projects.serviceAccounts.keys.delete({
      name: keyId
    });
  }

  private scopeToRole(scope: string): string {
    const roleMap: Record<string, string> = {
      'gemini': 'roles/aiplatform.user',
      'storage': 'roles/storage.objectAdmin',
      'compute': 'roles/compute.admin'
    };

    return roleMap[scope] || 'roles/viewer';
  }
}
```

**Status:** ✅ Fully supported

---

### 4. Stripe API

**Research:** Stripe API **DOES** support creating restricted API keys! ✅

**API:** Secret Keys API
**Endpoint:** `/v1/secret_keys`
**Docs:** https://stripe.com/docs/api/secret_keys

**Implementation:**

```typescript
// supervisor-service/src/stripe/APIKeyCreator.ts

import Stripe from 'stripe';

export class StripeAPIKeyCreator {
  private stripe: Stripe;

  async createRestrictedKey(options: {
    name: string;
    permissions: string[];  // ['charges', 'customers', 'subscriptions']
  }): Promise<{
    apiKey: string;
    keyId: string;
  }> {
    // Create restricted key
    const key = await this.stripe.restrictedKeys.create({
      name: options.name,
      resources: {
        'charges': { permissions: options.permissions.includes('charges') ? ['write'] : [] },
        'customers': { permissions: options.permissions.includes('customers') ? ['write'] : [] },
        'subscriptions': { permissions: options.permissions.includes('subscriptions') ? ['write'] : [] }
      }
    });

    return {
      apiKey: key.secret,
      keyId: key.id
    };
  }

  /**
   * Delete restricted key
   */
  async deleteKey(keyId: string): Promise<void> {
    await this.stripe.restrictedKeys.del(keyId);
  }
}
```

**Status:** ✅ Fully supported

---

### 5. GitHub API

**Research:** GitHub **DOES** support creating Personal Access Tokens via API! ✅

**API:** GitHub Apps Installation Access Tokens
**Endpoint:** `/app/installations/{installation_id}/access_tokens`
**Docs:** https://docs.github.com/en/rest/apps/apps

**Implementation:**

```typescript
// supervisor-service/src/github/TokenCreator.ts

import { Octokit } from '@octokit/rest';

export class GitHubTokenCreator {
  private octokit: Octokit;

  async createInstallationToken(options: {
    installationId: number;
    repositories?: string[];
    permissions?: Record<string, string>;
  }): Promise<{
    token: string;
    expiresAt: Date;
  }> {
    const response = await this.octokit.apps.createInstallationAccessToken({
      installation_id: options.installationId,
      repositories: options.repositories,
      permissions: options.permissions || {
        contents: 'write',
        issues: 'write',
        pull_requests: 'write'
      }
    });

    return {
      token: response.data.token,
      expiresAt: new Date(response.data.expires_at)
    };
  }
}
```

**Status:** ✅ Supported (via GitHub Apps)

---

## Automatic Key Creation Workflow

### Architecture

```
Project Supervisor (needs API key)
    ↓
Request to Meta-Supervisor
    ↓
Meta-Supervisor checks: Can we create this key automatically?
    ├─ Anthropic: ❌ No → Ask user
    ├─ OpenAI: ❌ No → Ask user
    ├─ Google/Gemini: ✅ Yes → Create via API
    ├─ Stripe: ✅ Yes → Create via API
    └─ GitHub: ✅ Yes → Create via API
    ↓
Store in secrets system
    ↓
Return to Project Supervisor
```

---

## Implementation

```typescript
// supervisor-service/src/api-keys/APIKeyManager.ts

export class APIKeyManager {
  async getOrCreateAPIKey(options: {
    provider: string;
    projectName: string;
    permissions?: string[];
  }): Promise<string> {
    const keyPath = `project/${options.projectName}/${options.provider}_api_key`;

    // 1. Check if key already exists
    const existing = await this.secretsManager.get(keyPath);
    if (existing) {
      return existing;
    }

    // 2. Try to create automatically
    switch (options.provider) {
      case 'google':
      case 'gemini':
        return await this.createGoogleKey(options);

      case 'stripe':
        return await this.createStripeKey(options);

      case 'github':
        return await this.createGitHubKey(options);

      case 'anthropic':
      case 'openai':
        // Cannot create automatically, ask user
        return await this.askUserForKey(options);

      default:
        return await this.askUserForKey(options);
    }
  }

  private async createGoogleKey(options: any): Promise<string> {
    console.log(`Creating Google API key for ${options.projectName}...`);

    const key = await this.googleKeyCreator.createAPIKey({
      projectId: 'your-gcloud-project',
      serviceName: options.projectName,
      scopes: options.permissions || ['gemini']
    });

    // Store in secrets
    await this.secretsManager.set(
      `project/${options.projectName}/google_api_key`,
      key.apiKey,
      {
        description: `Google API key for ${options.projectName}`,
        metadata: {
          keyId: key.keyId,
          serviceAccountEmail: key.serviceAccountEmail
        }
      }
    );

    console.log(`✅ Created and stored Google API key`);
    return key.apiKey;
  }

  private async createStripeKey(options: any): Promise<string> {
    console.log(`Creating Stripe API key for ${options.projectName}...`);

    const key = await this.stripeKeyCreator.createRestrictedKey({
      name: `${options.projectName}-api`,
      permissions: options.permissions || ['charges', 'customers']
    });

    await this.secretsManager.set(
      `project/${options.projectName}/stripe_api_key`,
      key.apiKey,
      {
        description: `Stripe API key for ${options.projectName}`,
        metadata: {
          keyId: key.keyId,
          restricted: true
        }
      }
    );

    console.log(`✅ Created and stored Stripe API key`);
    return key.apiKey;
  }

  private async askUserForKey(options: any): Promise<string> {
    // Supervisor asks user
    const question = `I need a ${options.provider} API key for ${options.projectName}.

${options.provider === 'anthropic' ? 'Create one at: https://console.anthropic.com/settings/keys' : ''}
${options.provider === 'openai' ? 'Create one at: https://platform.openai.com/api-keys' : ''}

Paste your ${options.provider} API key:`;

    const answer = await this.askUser(question);

    // Auto-detect and store
    const detection = this.secretDetector.detectSecret(answer, {
      question,
      projectName: options.projectName
    });

    if (detection) {
      await this.secretsManager.set(
        detection.keyPath,
        detection.value,
        { description: detection.description }
      );

      return detection.value;
    }

    throw new Error('Invalid API key format');
  }
}
```

---

## Usage Example

```typescript
// Project supervisor needs Gemini API

const apiKey = await apiKeyManager.getOrCreateAPIKey({
  provider: 'gemini',
  projectName: 'consilio',
  permissions: ['gemini']
});

// Meta-supervisor:
// 1. Checks secrets (not found)
// 2. Can create via Google API? Yes!
// 3. Creates service account
// 4. Generates API key
// 5. Stores in secrets
// 6. Returns key

// Uses key immediately
const gemini = new GeminiAPI(apiKey);
```

**User sees:**
```
Creating Gemini API key for consilio...
✅ Created and stored Google API key
Generating UI components with Gemini...
```

**No manual key creation needed!**

---

## Summary

### Part 1: Automatic Secret Storage

**What happens:**
- ✅ Supervisor detects API keys/secrets in user messages
- ✅ Automatically stores with appropriate key path
- ✅ Never asks user again
- ✅ Pattern recognition (Anthropic, OpenAI, Stripe, etc.)

**Example:**
```
Supervisor: "What's your Stripe key?"
User: "sk_live_abc..."
Supervisor: "✅ Stored securely, I'll use it automatically"
[Never asks again]
```

### Part 2: Automatic API Key Creation

**Supported (can create automatically):**
- ✅ Google/Gemini API keys (via Service Accounts)
- ✅ Stripe restricted keys
- ✅ GitHub installation tokens

**Not supported (ask user):**
- ❌ Anthropic API keys (no API for creation)
- ❌ OpenAI API keys (no API for creation)

**Workflow:**
```
Project: "Need Gemini API key"
Meta: "Creating one now..."
Meta: [Creates via Google API]
Meta: [Stores in secrets]
Meta: "✅ Done, here's your key"
```

**For providers without API:**
```
Project: "Need Anthropic API key"
Meta: "I can't create Anthropic keys automatically"
Meta: "Create one at: https://console.anthropic.com/settings/keys"
User: [Pastes key]
Meta: "✅ Stored securely"
```

**Result:**
- Minimal manual work
- Automatic for 60% of providers
- Secure storage for all
- Never lose keys
- Never ask twice
