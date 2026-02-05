# Adapt Local Claude - Project-Specific Instruction Optimizer

**Date:** 2026-01-18
**Purpose:** Analyze project codebase and optimize project-specific instructions
**Critical:** NEVER touches core instructions propagated from meta

---

## What This Does

**Problem:**
- Each project has unique patterns, conventions, tech stack
- Generic instructions don't capture project-specific knowledge
- Manual updates to .claude-specific/ are tedious

**Solution:**
- Agent reads project codebase thoroughly
- Identifies patterns, conventions, naming, structure
- Updates .claude-specific/{project}-custom.md with insights
- **NEVER modifies core instructions** (those come from meta)

**Example:**

**Before (generic):**
```markdown
# consilio/.claude-specific/consilio-custom.md

## Project-Specific Instructions

This is the Consilio project.
```

**After (optimized):**
```markdown
# consilio/.claude-specific/consilio-custom.md

## Project-Specific Instructions

### Tech Stack
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui components
- tRPC for API layer
- Prisma ORM + PostgreSQL
- NextAuth.js for authentication

### Naming Conventions
- Components: PascalCase (e.g., DashboardCard.tsx)
- API routes: app/api/[feature]/route.ts
- Database models: PascalCase (e.g., User, DashboardWidget)
- tRPC procedures: camelCase (e.g., getDashboardWidgets)
- CSS classes: Tailwind utilities (no custom CSS files)

### Code Patterns
- Server Components by default, "use client" only when needed
- API calls via tRPC client, never fetch() directly
- Form validation with Zod schemas
- Error handling: try/catch with toast notifications
- Database queries: Always use Prisma, never raw SQL

### File Organization
- app/ - Next.js app router pages
- components/ - Reusable React components
  - ui/ - shadcn/ui primitives
  - dashboard/ - Dashboard-specific components
- server/ - tRPC routers and procedures
- lib/ - Utility functions
- prisma/ - Database schema and migrations

### Testing Strategy
- Unit tests: Vitest for utils and hooks
- Integration tests: Playwright for API routes
- E2E tests: Playwright for critical user flows
- Test files: Co-located with source (e.g., DashboardCard.test.tsx)

### Common Issues and Solutions
- **Issue:** Hydration errors
  - **Solution:** Use suppressHydrationWarning or move to client component
- **Issue:** tRPC type errors
  - **Solution:** Regenerate types with `npm run db:generate`
- **Issue:** Slow database queries
  - **Solution:** Check Prisma query console, add indexes if needed

### Integration Points
- Authentication: NextAuth.js session in server components
- Real-time updates: Polling every 30s (no WebSockets yet)
- External APIs: None (fully self-contained)
- Background jobs: None (consider adding Bull queue)

### Deployment
- Platform: Vercel
- Database: Neon PostgreSQL (serverless)
- Environment: .env.local (development), Vercel secrets (production)
- Build command: `npm run build`
- Deploy: git push to main (automatic)
```

---

## How It Works

### Step 1: Analyze Codebase

**Agent reads:**
```typescript
// 1. Package.json - detect tech stack
{
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "@trpc/server": "10.45.0",
    "prisma": "5.7.0"
  }
}

// Tech stack identified: Next.js 14, tRPC, Prisma

// 2. tsconfig.json - TypeScript settings
{
  "compilerOptions": {
    "strict": true
  }
}

// TypeScript strict mode enabled

// 3. Directory structure
app/
components/
  ui/
  dashboard/
server/
  routers/
lib/
prisma/

// Next.js App Router structure

// 4. Sample files - detect patterns
// components/DashboardCard.tsx → PascalCase components
// server/routers/dashboard.ts → camelCase routers
// app/api/webhooks/route.ts → App Router API routes
```

### Step 2: Identify Conventions

**Agent searches for:**

**Naming patterns:**
```typescript
// Find all component files
components/DashboardCard.tsx
components/UserProfile.tsx
components/SettingsPanel.tsx

// Pattern: PascalCase for components ✓

// Find all API routes
app/api/webhooks/route.ts
app/api/auth/[...nextauth]/route.ts

// Pattern: App Router API structure ✓

// Find all database models
prisma/schema.prisma:
  model User { ... }
  model DashboardWidget { ... }

// Pattern: PascalCase for models ✓
```

**Code patterns:**
```typescript
// Search for common patterns

// Pattern 1: tRPC usage
grep -r "trpc\." components/
// Found: All API calls use trpc.dashboardRouter.getWidgets.useQuery()
// Never: fetch() or axios

// Pattern 2: Error handling
grep -r "try {" server/
// Found: try/catch with toast.error()
// Never: Unhandled errors

// Pattern 3: Form validation
grep -r "zod" lib/
// Found: Zod schemas in lib/validations/
// Pattern: Shared validation schemas
```

**Testing strategy:**
```typescript
// Find test files
find . -name "*.test.tsx"
find . -name "*.spec.ts"

// Found:
components/DashboardCard.test.tsx
lib/utils.test.ts
e2e/dashboard.spec.ts

// Pattern: Co-located unit tests, separate e2e/ directory
```

### Step 3: Document Insights

**Agent writes to .claude-specific/{project}-custom.md:**

```markdown
## Auto-Generated Project Analysis
Last updated: 2026-01-18

[All the patterns, conventions, tech stack identified above]

## Manual Notes (DO NOT AUTO-UPDATE)
[User or project supervisor can add notes here]
[Agent never touches this section]
```

---

## Usage Patterns

### Pattern 1: Initial Project Onboarding

**When new project added:**

```typescript
// Meta-supervisor creates project

// 1. Clone repo, create directories
await createProject('consilio');

// 2. Run adapt-local-claude agent
await mcp__meta__adapt_local_claude({
  projectName: 'consilio'
});

// Agent:
// - Reads entire codebase
// - Identifies patterns
// - Writes .claude-specific/consilio-custom.md
// - Returns summary

// 3. Regenerate CLAUDE.md (includes new custom instructions)
await mcp__meta__regenerate_supervisor({
  projectName: 'consilio'
});

// Project supervisor now has optimized instructions
```

### Pattern 2: Automatic Optimization (Triggered by Events)

**⚠️ CRITICAL: Run automatically after major updates**

**Trigger events:**
- ✅ New epic completed
- ✅ New feature merged to main
- ✅ Major refactoring (10+ files changed)
- ✅ New tech stack added (package.json changed)
- ✅ Monthly (first day of month, 2am)

**Automatic workflow:**

```typescript
// supervisor-service watches for triggers

// Event: Epic completed
eventEmitter.on('epic:completed', async (epic) => {
  if (epic.linesChanged > 100 || epic.filesChanged > 5) {
    // Significant changes, update instructions
    await mcp__meta__adapt_local_claude({
      projectName: epic.projectName,
      force: true,
      reason: `Epic ${epic.id} completed with ${epic.filesChanged} files changed`
    });

    await mcp__meta__regenerate_supervisor({
      projectName: epic.projectName
    });

    console.log(`✅ ${epic.projectName} instructions auto-updated`);
  }
});

// Event: PR merged to main
eventEmitter.on('pr:merged', async (pr) => {
  if (pr.targetBranch === 'main' && pr.linesChanged > 200) {
    await mcp__meta__adapt_local_claude({
      projectName: pr.projectName,
      force: true,
      reason: `Major PR merged: ${pr.title}`
    });
  }
});

// Event: package.json changed
fileWatcher.on('change', async (file) => {
  if (file.endsWith('package.json')) {
    const project = getProjectFromPath(file);
    await mcp__meta__adapt_local_claude({
      projectName: project,
      focus: 'tech-stack',
      reason: 'Tech stack updated'
    });
  }
});

// Cron: Monthly refresh
cron.schedule('0 2 1 * *', async () => {
  const projects = await getAllProjects();
  for (const project of projects) {
    await mcp__meta__adapt_local_claude({
      projectName: project,
      force: true,
      reason: 'Monthly refresh'
    });
  }
});
```

**Manual override (if needed):**

```typescript
// User: "Update Consilio's custom instructions"

await mcp__meta__adapt_local_claude({
  projectName: 'consilio',
  force: true
});
```

**Result:**
- Project instructions always up-to-date
- No manual intervention needed
- Supervisors always have latest patterns/conventions

### Pattern 3: Specific Analysis

**Focus on specific aspect:**

```typescript
// User: "Analyze Consilio's testing strategy"

await mcp__meta__adapt_local_claude({
  projectName: 'consilio',
  focus: 'testing'  // Only update testing section
});

// Agent:
// - Finds all test files
// - Identifies testing patterns
// - Updates only testing section
// - Leaves other sections unchanged
```

---

## What Agent Analyzes

### 1. Tech Stack Detection

**Files to read:**
- `package.json` - dependencies, scripts
- `tsconfig.json` or `jsconfig.json` - TypeScript/JavaScript config
- `next.config.js` or `vite.config.ts` - Framework config
- `tailwind.config.js` - CSS framework
- `prisma/schema.prisma` - Database ORM
- `.env.example` - Environment variables

**Output:**
```markdown
### Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui
- Database: Prisma ORM + PostgreSQL
- Auth: NextAuth.js
- API: tRPC
```

### 2. Naming Conventions

**Patterns to find:**
- Component naming (PascalCase, camelCase, kebab-case?)
- File naming (index.ts vs named files?)
- Directory naming (plural vs singular?)
- Variable naming (camelCase, snake_case?)
- CSS class naming (BEM, Tailwind, CSS modules?)

**Output:**
```markdown
### Naming Conventions
- Components: PascalCase (DashboardCard.tsx)
- Hooks: camelCase starting with "use" (useAuth.ts)
- Utils: camelCase (formatDate.ts)
- Types: PascalCase ending with "Type" (UserType)
- Constants: SCREAMING_SNAKE_CASE (API_BASE_URL)
```

### 3. Code Patterns

**Search for:**
- How errors are handled (try/catch, error boundaries?)
- How API calls are made (fetch, axios, tRPC?)
- How forms are validated (Zod, Yup, React Hook Form?)
- How state is managed (useState, Zustand, Redux?)
- How styling is applied (Tailwind, CSS-in-JS, modules?)

**Output:**
```markdown
### Code Patterns
- API calls: Always use tRPC client (never fetch directly)
- Error handling: try/catch with toast notifications
- Form validation: Zod schemas in lib/validations/
- State management: useState for local, tRPC for server state
- Styling: Tailwind utilities only (no custom CSS)
```

### 4. File Organization

**Map directory structure:**
```
app/          → Next.js pages
components/   → React components
  ui/         → shadcn/ui primitives
  dashboard/  → Feature-specific components
server/       → Backend code
  routers/    → tRPC routers
lib/          → Shared utilities
prisma/       → Database schema
```

**Output:**
```markdown
### File Organization
- app/ - Next.js app router (pages and layouts)
- components/ - Reusable components
  - ui/ - Base UI primitives (shadcn/ui)
  - [feature]/ - Feature-specific components
- server/ - Backend logic (tRPC routers)
- lib/ - Shared utilities and helpers
- prisma/ - Database schema and migrations
```

### 5. Testing Strategy

**Find:**
- Test frameworks (Jest, Vitest, Playwright?)
- Test file locations (co-located, separate test/ dir?)
- Test patterns (unit, integration, e2e?)
- Coverage requirements

**Output:**
```markdown
### Testing Strategy
- Unit tests: Vitest (*.test.tsx co-located)
- Integration: Playwright (API route testing)
- E2E: Playwright (e2e/ directory)
- Coverage: 80% target (not enforced)
- Run: npm test (unit), npm run test:e2e (e2e)
```

### 6. Common Issues

**Search Git history and code comments:**
```bash
# Find TODOs and FIXMEs
grep -r "TODO:" .
grep -r "FIXME:" .

# Search for known issues in commits
git log --grep="fix:" --oneline | head -20
```

**Output:**
```markdown
### Common Issues and Solutions

**Hydration errors:**
- Cause: Server/client HTML mismatch
- Solution: Use suppressHydrationWarning or client component

**tRPC type errors:**
- Cause: Stale generated types
- Solution: Run `npm run db:generate`

**Slow queries:**
- Cause: Missing database indexes
- Solution: Check Prisma console, add indexes
```

### 7. Integration Points

**Detect:**
- External APIs (search for API keys, fetch to external domains)
- Authentication system (NextAuth, Auth0, custom?)
- Real-time features (WebSockets, polling, SSE?)
- Background jobs (cron, Bull queue, none?)

**Output:**
```markdown
### Integration Points
- Auth: NextAuth.js (session in server components)
- Real-time: Polling every 30s (consider WebSockets)
- External APIs: None currently
- Background jobs: None (consider Bull queue for async tasks)
- Email: Not implemented yet
```

### 8. Deployment

**Find:**
- Deployment platform (Vercel, Netlify, custom?)
- Build commands (from package.json)
- Environment variables (from .env.example)
- CI/CD (GitHub Actions, GitLab CI?)

**Output:**
```markdown
### Deployment
- Platform: Vercel (automatic deploys from main)
- Database: Neon PostgreSQL (serverless)
- Build: `npm run build`
- Environment: Vercel dashboard (production), .env.local (dev)
- CI/CD: GitHub Actions (lint + test on PR)
```

---

## Implementation

### AdaptLocalClaude Agent

```typescript
// supervisor-service/src/agents/AdaptLocalClaude.ts

export class AdaptLocalClaude {
  async analyze(projectPath: string): Promise<ProjectAnalysis> {
    const analysis: ProjectAnalysis = {};

    // 1. Tech stack
    analysis.techStack = await this.detectTechStack(projectPath);

    // 2. Naming conventions
    analysis.namingConventions = await this.findNamingPatterns(projectPath);

    // 3. Code patterns
    analysis.codePatterns = await this.identifyCodePatterns(projectPath);

    // 4. File organization
    analysis.fileOrganization = await this.mapDirectoryStructure(projectPath);

    // 5. Testing strategy
    analysis.testingStrategy = await this.analyzeTestingApproach(projectPath);

    // 6. Common issues
    analysis.commonIssues = await this.extractCommonIssues(projectPath);

    // 7. Integration points
    analysis.integrationPoints = await this.detectIntegrations(projectPath);

    // 8. Deployment
    analysis.deployment = await this.analyzeDeployment(projectPath);

    return analysis;
  }

  async writeCustomInstructions(
    projectName: string,
    analysis: ProjectAnalysis
  ): Promise<void> {
    const customPath = `${projectPath}/.claude-specific/${projectName}-custom.md`;

    // Read existing (to preserve manual notes)
    const existing = await fs.readFile(customPath, 'utf-8').catch(() => null);
    const manualNotes = this.extractManualNotes(existing);

    // Generate new instructions
    const content = `
# ${projectName} - Project-Specific Instructions

**Auto-generated:** ${new Date().toISOString()}
**Do not edit auto-generated sections - they will be overwritten**

---

${this.formatTechStack(analysis.techStack)}

${this.formatNamingConventions(analysis.namingConventions)}

${this.formatCodePatterns(analysis.codePatterns)}

${this.formatFileOrganization(analysis.fileOrganization)}

${this.formatTestingStrategy(analysis.testingStrategy)}

${this.formatCommonIssues(analysis.commonIssues)}

${this.formatIntegrationPoints(analysis.integrationPoints)}

${this.formatDeployment(analysis.deployment)}

---

## Manual Notes (NEVER AUTO-UPDATED)

${manualNotes || 'Add project-specific notes here that should not be auto-generated.'}
    `.trim();

    await fs.writeFile(customPath, content);
  }
}
```

---

## MCP Tool

```typescript
{
  name: 'mcp__meta__adapt_local_claude',
  description: 'Analyze project and optimize project-specific instructions',
  parameters: {
    projectName: { type: 'string' },
    force: { type: 'boolean', optional: true },  // Overwrite existing
    focus: { type: 'string', optional: true }     // 'testing', 'patterns', etc.
  }
}
```

---

## Safeguards

### NEVER Touches Core Instructions

**Core instructions location:**
```
.supervisor-core/
  ├── core-behaviors.md
  ├── tool-usage.md
  └── bmad-methodology.md
```

**AdaptLocalClaude writes ONLY to:**
```
{project}/.claude-specific/{project}-custom.md
```

**When CLAUDE.md regenerated:**
```
CLAUDE.md = [
  .supervisor-core/* (from meta),
  .claude-specific/* (project-specific)
]
```

**Core instructions can ONLY be updated by meta-supervisor via instruction propagation system.**

---

## Summary

**What it does:**
- Reads project codebase thoroughly
- Identifies tech stack, patterns, conventions
- Writes optimized project-specific instructions
- Preserves manual notes

**What it NEVER does:**
- Touch core instructions (those propagated from meta)
- Overwrite manual notes section
- Modify code (read-only analysis)

**When to run:**
- Initial project setup (automatic)
- After major refactoring (on-demand)
- Monthly maintenance (optional)

**Result:**
- Project supervisors have deep project knowledge
- Instructions auto-update as codebase evolves
- Core behaviors stay consistent across projects
