# Supervisor Instruction Propagation System

**Date:** 2026-01-18
**Purpose:** Update all supervisors AND templates from meta-supervisor with one command

---

## Problem Statement

**You want to tell Meta-Supervisor:**
> "I want supervisors to be more proactive about error handling"

**And have it:**
1. ✅ Update ALL active project supervisors (Consilio, Odin, Health-Agent, etc.)
2. ✅ Update templates for NEW projects
3. ✅ Preserve project-specific instructions
4. ✅ Only touch general behavior, not project specifics

---

## Solution: Layered Instruction System

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Meta-Supervisor                                            │
│  Can update: Core instructions across all supervisors      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  Shared Core            │   │  Project Template       │
│  Instructions           │   │  (for new projects)     │
│                         │   │                         │
│  Files:                 │   │  Files:                 │
│  - core-behaviors.md    │   │  - project-template/    │
│  - autonomous-rules.md  │   │    └── CLAUDE.md        │
│  - bmad-workflow.md     │   │                         │
└───────────┬─────────────┘   └─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  Project Supervisors (Auto-assembled)                      │
│                                                              │
│  Each project's CLAUDE.md contains:                         │
│  1. Core instructions (shared, auto-updated)                │
│  2. Project-specific instructions (preserved)               │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
/home/samuel/supervisor/
├── .supervisor-core/
│   ├── core-behaviors.md         # Shared: Autonomous supervision
│   ├── tool-usage.md             # Shared: How to use MCP tools
│   ├── bmad-methodology.md       # Shared: BMAD workflow
│   ├── communication-style.md    # Shared: How to talk to user
│   ├── error-handling.md         # Shared: Error recovery
│   └── context-management.md     # Shared: Handoff, subagents
│
├── .supervisor-meta/
│   ├── meta-specific.md          # Meta only: VM health, resources
│   └── project-management.md     # Meta only: Cross-project ops
│
├── templates/
│   └── project-template/
│       ├── CLAUDE.md.template    # Template for new projects
│       └── project-specific.md   # Placeholder for custom instructions
│
└── consilio/
    ├── CLAUDE.md                 # Auto-assembled from core + specific
    ├── .claude-specific/
    │   └── consilio-custom.md    # Consilio-only instructions
    └── src/
```

---

## CLAUDE.md Assembly System

### Each project's CLAUDE.md is auto-assembled:

```markdown
<!-- AUTO-GENERATED: Do not edit directly -->
<!-- Last updated: 2026-01-18 14:30 UTC -->
<!-- Meta-supervisor command: update-supervisors -->

# Consilio Supervisor

<!-- BEGIN CORE INSTRUCTIONS -->
{{include: /home/samuel/supervisor/.supervisor-core/core-behaviors.md}}
{{include: /home/samuel/supervisor/.supervisor-core/tool-usage.md}}
{{include: /home/samuel/supervisor/.supervisor-core/bmad-methodology.md}}
{{include: /home/samuel/supervisor/.supervisor-core/communication-style.md}}
{{include: /home/samuel/supervisor/.supervisor-core/error-handling.md}}
{{include: /home/samuel/supervisor/.supervisor-core/context-management.md}}
<!-- END CORE INSTRUCTIONS -->

<!-- BEGIN PROJECT-SPECIFIC INSTRUCTIONS -->
# Project-Specific Configuration

**Project:** Consilio
**Repository:** https://github.com/gpt153/consilio
**Tech Stack:** TypeScript, React, Supabase
**Working Directory:** /home/samuel/supervisor/consilio

{{include: /home/samuel/supervisor/consilio/.claude-specific/consilio-custom.md}}
<!-- END PROJECT-SPECIFIC INSTRUCTIONS -->
```

### Meta-Supervisor's CLAUDE.md

```markdown
<!-- AUTO-GENERATED: Do not edit directly -->
<!-- Last updated: 2026-01-18 14:30 UTC -->

# Meta-Supervisor

<!-- BEGIN CORE INSTRUCTIONS -->
{{include: /home/samuel/supervisor/.supervisor-core/core-behaviors.md}}
{{include: /home/samuel/supervisor/.supervisor-core/tool-usage.md}}
...
<!-- END CORE INSTRUCTIONS -->

<!-- BEGIN META-SPECIFIC INSTRUCTIONS -->
{{include: /home/samuel/supervisor/.supervisor-meta/meta-specific.md}}
{{include: /home/samuel/supervisor/.supervisor-meta/project-management.md}}
<!-- END META-SPECIFIC INSTRUCTIONS -->
```

---

## Propagation Commands

### User Interface (Meta-Supervisor)

**User says to Meta-Supervisor:**
```
"I want supervisors to be more proactive about reporting errors to me,
even minor ones. Currently they only report critical failures."
```

**Meta-Supervisor automatically:**

1. **Identifies which core file to update:**
   - Analyzes request
   - Determines this affects `error-handling.md`
   - Confirms with user if ambiguous

2. **Updates core file:**
   ```typescript
   await editCoreInstruction('error-handling.md', {
     add: `
## Error Reporting Policy (Updated 2026-01-18)

**Report to user:**
- ✅ Critical failures (after retry attempts)
- ✅ Minor errors that might indicate problems
- ✅ Warnings during build/test
- ✅ Deprecation notices
- ✅ Performance degradation

**Only escalate after:**
- Try automated fix first
- Retry failed operation
- Check if error is transient
- Then report with context
     `
   });
   ```

3. **Regenerates all CLAUDE.md files:**
   ```typescript
   await regenerateSupervisorInstructions({
     projects: ['consilio', 'odin', 'health-agent', 'openhorizon'],
     updateTemplate: true  // Also update template for new projects
   });
   ```

4. **Notifies active supervisors:**
   ```typescript
   // Tell each project's Claude.ai Project to reload
   await notifyProjectSupervisors([
     'consilio',
     'odin',
     'health-agent',
     'openhorizon'
   ], 'Instructions updated: Enhanced error reporting');
   ```

5. **Reports back:**
   ```
   ✅ Updated core instructions: error-handling.md

   Changes propagated to:
   - Consilio supervisor
   - Odin supervisor
   - Health-Agent supervisor
   - OpenHorizon supervisor
   - Project template (for future projects)

   All supervisors will now report minor errors proactively.

   Next time you open any project tab, the new instructions
   will be active.
   ```

### MCP Tool Interface

```typescript
// Meta-supervisor MCP tool
interface UpdateSupervisorsParams {
  instruction: string;           // Natural language update
  targetFile?: string;           // Optional: specific file to update
  affectsMetaOnly?: boolean;     // Only update meta-supervisor
  affectsProjectsOnly?: boolean; // Only update project supervisors
  preview?: boolean;             // Show diff before applying
}

// Example call
await mcp__meta__update_supervisors({
  instruction: "Be more proactive about error reporting",
  preview: true  // Show what will change first
});

// Returns preview
{
  affectedFiles: ["error-handling.md"],
  projectsAffected: ["consilio", "odin", "health-agent", "openhorizon"],
  diff: "... (shows changes) ...",
  confirm: "Approve these changes?"
}

// After user confirms
await mcp__meta__update_supervisors({
  instruction: "Be more proactive about error reporting",
  confirmed: true
});
```

---

## Core Instruction Files (Detailed)

### 1. core-behaviors.md

**What it contains:**
- Autonomous supervision protocol
- Never ask permission during execution
- 30-minute status updates
- Completion criteria
- When to escalate to user

**Project-specific? NO**
- All supervisors behave autonomously
- Same protocol across all projects

**Meta-specific? NO**
- Meta also follows autonomous protocol
- Just manages different resources

### 2. tool-usage.md

**What it contains:**
- How to use MCP tools
- When to spawn subagents
- Read vs Edit vs Write patterns
- Bash vs specialized tools

**Project-specific? NO**
- Tool usage patterns are universal

**Meta-specific? PARTIAL**
- Meta has additional tools (VM health, resource allocation)
- But basic tool patterns are shared

### 3. bmad-methodology.md

**What it contains:**
- Epic structure
- ADR creation
- MoSCoW prioritization
- Scale-adaptive intelligence

**Project-specific? NO**
- BMAD methodology is universal

**Meta-specific? NO**
- Meta doesn't create epics
- But knows the methodology for coordination

### 4. communication-style.md

**What it contains:**
- Plain language (no code blocks to user)
- Professional tone (no excessive validation)
- Concise status updates
- No time estimates

**Project-specific? NO**
- All supervisors communicate the same way

**Meta-specific? NO**
- Meta also uses plain language

### 5. error-handling.md

**What it contains:**
- Self-healing approach
- When to retry
- When to report to user
- Error classification (critical vs minor)

**Project-specific? PARTIAL**
- General error handling: shared
- Project-specific errors (e.g., Supabase-specific): in project custom file

**Meta-specific? PARTIAL**
- VM errors: meta-specific file
- General error protocol: shared

### 6. context-management.md

**What it contains:**
- Handoff at 80% tokens
- Subagent patterns
- Context conservation
- When to spawn vs execute directly

**Project-specific? NO**
- Context management is universal

**Meta-specific? NO**
- Meta also manages context

---

## Project-Specific Instructions

### Where they go: `.claude-specific/{project}-custom.md`

**Example: Consilio-specific instructions**

```markdown
# Consilio-Specific Instructions

## Tech Stack Details

**Frontend:** React 18 + TypeScript
**Backend:** Supabase (PostgreSQL + Auth + Storage)
**Styling:** Tailwind CSS
**Testing:** Vitest + Playwright

## Database Schema

Always check schema in `supabase/migrations/` before modifications.

Key tables:
- users (Supabase Auth)
- health_metrics (user data)
- goals (user-defined goals)

## Supabase-Specific Error Handling

**Common Errors:**
- "Invalid JWT" → Refresh token flow (see src/auth/refresh.ts)
- "Row Level Security" → Check policies in supabase/policies/
- "Storage bucket not found" → Verify bucket exists in Supabase dashboard

## Deployment

**Staging:** Netlify (auto-deploy on push to main)
**Production:** Netlify (manual deploy after testing)
**Database:** Supabase project (shared staging/prod)

## Custom Validation

After tests pass, also run:
```bash
npm run validate:supabase  # Check Supabase config
npm run check:rls          # Verify RLS policies
```

## Dependencies

**Critical:** Do NOT update Supabase client beyond v2.x without testing
(v3 has breaking changes in auth flow)
```

**This file is NEVER auto-updated by Meta-supervisor.**

Only project supervisor or user can edit it.

---

## Meta-Specific Instructions

### Where they go: `.supervisor-meta/{file}.md`

**Example: meta-specific.md**

```markdown
# Meta-Supervisor Specific Instructions

You are the Meta-Supervisor managing multiple projects.

## Your Responsibilities

1. **VM Health Monitoring**
   - Check CPU, RAM, disk every 5 minutes
   - Alert user if >85% CPU, >90% RAM
   - Auto-kill runaway agents if VM degraded

2. **Resource Allocation**
   - Manage 20 agent slots across all projects
   - Allocate fairly or by priority
   - Release slots when agents complete

3. **Port Management**
   - Track all ports in use
   - Allocate ports to projects
   - Prevent conflicts

4. **Cloudflare Management**
   - Create/update DNS records
   - Manage tunnel routes
   - SSL certificate renewals

5. **GCloud Management**
   - VM operations (start/stop/resize)
   - Service account management
   - Cross-project coordination

## Your MCP Tools

{{list_of_meta_specific_tools}}

## You Do NOT

- ❌ Create epics (project supervisors do this)
- ❌ Write code (project supervisors spawn agents)
- ❌ Manage individual features (delegate to projects)

You COORDINATE, not IMPLEMENT.
```

---

## Optimization Command

### Auto-Optimize Project Instructions

**User says to project supervisor:**
```
"Optimize your instructions based on the project"
```

**Or via MCP:**
```typescript
await mcp__consilio__optimize_instructions();
```

**Supervisor automatically:**

1. **Analyzes project:**
   ```typescript
   const analysis = {
     techStack: await analyzeTechStack(),      // React, Supabase, etc.
     commonErrors: await findCommonErrors(),   // Git history, error logs
     patterns: await detectPatterns(),         // Naming, structure
     dependencies: await checkDependencies()   // package.json
   };
   ```

2. **Generates optimizations:**
   ```markdown
   # Suggested Optimizations for Consilio

   ## Tech Stack Additions
   Based on package.json, add:
   - Supabase-specific error handling
   - React 18 concurrent rendering notes
   - Tailwind class organization

   ## Common Error Patterns
   Analysis of git history shows frequent:
   - Supabase RLS policy errors → Add debugging guide
   - TypeScript type errors in API responses → Add type examples

   ## Deployment Notes
   Detected Netlify deployment → Add validation steps
   ```

3. **Updates `.claude-specific/consilio-custom.md`:**
   ```typescript
   await updateProjectSpecific('consilio', {
     append: optimizations,
     preserveExisting: true
   });
   ```

4. **Regenerates CLAUDE.md:**
   ```typescript
   await regenerateSupervisorInstructions({
     projects: ['consilio']
   });
   ```

5. **Reports:**
   ```
   ✅ Optimized Consilio instructions

   Added:
   - Supabase error handling guide
   - React 18 patterns
   - Netlify deployment validation

   Your instructions now include project-specific
   knowledge for better performance.
   ```

---

## Implementation

### 1. Assembly Script

```typescript
// supervisor-service/src/utils/assemble-instructions.ts

interface InstructionAssembly {
  coreFiles: string[];
  specificFile?: string;
  metaFiles?: string[];
}

class InstructionAssembler {
  async assembleForProject(projectName: string): Promise<string> {
    const corePath = '/home/samuel/supervisor/.supervisor-core';
    const projectPath = `/home/samuel/supervisor/${projectName}`;

    // Read all core files
    const coreInstructions = await Promise.all([
      'core-behaviors.md',
      'tool-usage.md',
      'bmad-methodology.md',
      'communication-style.md',
      'error-handling.md',
      'context-management.md'
    ].map(file => fs.readFile(`${corePath}/${file}`, 'utf-8')));

    // Read project-specific
    const projectSpecific = await fs.readFile(
      `${projectPath}/.claude-specific/${projectName}-custom.md`,
      'utf-8'
    ).catch(() => '');  // OK if doesn't exist

    // Assemble
    return `
<!-- AUTO-GENERATED: Do not edit directly -->
<!-- Last updated: ${new Date().toISOString()} -->

# ${projectName.charAt(0).toUpperCase() + projectName.slice(1)} Supervisor

<!-- BEGIN CORE INSTRUCTIONS -->
${coreInstructions.join('\n\n')}
<!-- END CORE INSTRUCTIONS -->

<!-- BEGIN PROJECT-SPECIFIC INSTRUCTIONS -->
${projectSpecific}
<!-- END PROJECT-SPECIFIC INSTRUCTIONS -->
    `.trim();
  }

  async assembleForMeta(): Promise<string> {
    // Similar but include meta-specific files
    const metaPath = '/home/samuel/supervisor/.supervisor-meta';

    const coreInstructions = await this.getCoreInstructions();
    const metaSpecific = await fs.readFile(
      `${metaPath}/meta-specific.md`,
      'utf-8'
    );

    return `
<!-- AUTO-GENERATED: Do not edit directly -->

# Meta-Supervisor

<!-- BEGIN CORE INSTRUCTIONS -->
${coreInstructions}
<!-- END CORE INSTRUCTIONS -->

<!-- BEGIN META-SPECIFIC INSTRUCTIONS -->
${metaSpecific}
<!-- END META-SPECIFIC INSTRUCTIONS -->
    `.trim();
  }

  async regenerateAll() {
    const projects = await this.getProjects();

    // Regenerate each project
    for (const project of projects) {
      const instructions = await this.assembleForProject(project);
      await fs.writeFile(
        `/home/samuel/supervisor/${project}/CLAUDE.md`,
        instructions
      );
    }

    // Regenerate meta
    const metaInstructions = await this.assembleForMeta();
    await fs.writeFile(
      '/home/samuel/supervisor/CLAUDE.md',
      metaInstructions
    );

    // Update template
    const templateInstructions = await this.assembleTemplate();
    await fs.writeFile(
      '/home/samuel/supervisor/templates/project-template/CLAUDE.md.template',
      templateInstructions
    );
  }
}
```

### 2. Update Command

```typescript
// supervisor-service/src/commands/update-supervisors.ts

interface UpdateRequest {
  instruction: string;
  targetFile?: string;
  preview?: boolean;
}

class SupervisorUpdater {
  async update(request: UpdateRequest): Promise<UpdateResult> {
    // 1. Determine which file to update
    const targetFile = request.targetFile ||
      await this.analyzeInstruction(request.instruction);

    // 2. Generate changes (use Claude to edit the core file)
    const changes = await this.generateChanges(
      targetFile,
      request.instruction
    );

    // 3. Preview if requested
    if (request.preview) {
      return {
        preview: changes.diff,
        affectedProjects: await this.getProjects(),
        confirm: 'Apply these changes?'
      };
    }

    // 4. Apply changes to core file
    await this.applyCoreChanges(targetFile, changes);

    // 5. Regenerate all CLAUDE.md files
    await this.assembler.regenerateAll();

    // 6. Notify supervisors (via file watch or manual reload)
    await this.notifyReload();

    return {
      success: true,
      updated: targetFile,
      projectsAffected: await this.getProjects(),
      message: 'All supervisors updated'
    };
  }
}
```

---

## User Workflow Examples

### Example 1: Update Error Handling

**User to Meta-Supervisor:**
```
"I want supervisors to report minor warnings, not just critical errors"
```

**Meta-Supervisor:**
```
✅ Analyzing request...

This will update: error-handling.md

Preview of changes:
[Shows diff]

Affects all 4 project supervisors + template.

Approve?
```

**User:** "Yes"

**Meta-Supervisor:**
```
✅ Updated error-handling.md
✅ Regenerated CLAUDE.md for all supervisors
✅ Updated project template

Changes active next time you open project tabs.
```

### Example 2: Project-Specific Optimization

**User to Consilio Supervisor:**
```
"Optimize your instructions for this project"
```

**Consilio Supervisor:**
```
🔍 Analyzing Consilio project...

Found:
- Tech stack: React 18, Supabase, Tailwind
- Common errors: Supabase RLS, TypeScript types
- Deployment: Netlify

Generating optimizations...

✅ Added to consilio-custom.md:
  - Supabase error handling guide
  - React 18 patterns
  - Netlify validation steps

✅ Regenerated CLAUDE.md

Reload this tab to activate optimizations.
```

---

## Summary

**Layered system:**
1. **Core instructions** - Shared across all supervisors (in `.supervisor-core/`)
2. **Meta-specific** - Only for Meta-supervisor (in `.supervisor-meta/`)
3. **Project-specific** - Custom per project (in `{project}/.claude-specific/`)

**Update flow:**
1. User tells Meta: "I want supervisors to..."
2. Meta updates appropriate core file
3. Meta regenerates all CLAUDE.md files
4. All supervisors get new instructions

**Optimization:**
- Project supervisors can auto-optimize their custom instructions
- Analyzes tech stack, errors, patterns
- Updates project-specific file only

**Result:**
- One command updates everyone
- Project specifics preserved
- Templates stay current
- Simple maintenance

**This is how you keep 5+ supervisors in sync!** 🔄
