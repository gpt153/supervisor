# ADR Update Summary - 2026-01-19

## Overview
Updated all ADR files to remove references to the old Next.js application that was removed. The pipeline system (Fastify + Vite) is now the only active system.

## Changes Made

### Archived ADRs (Old System)

1. **ARCHIVED-001-nextjs-tech-stack.md**
   - Original: ADR 001: Technology Stack Selection
   - Described the old Next.js monolith with tRPC and App Router
   - Status: Superseded by ADR-001-fastify-backend.md and ADR-003-vite-react-frontend.md
   - Archive reason: Described removed Next.js application

2. **ARCHIVED-003-old-app-multi-tenancy.md**
   - Original: ADR 003: Multi-Tenant Architecture
   - Described Prisma middleware-based multi-tenancy in Next.js app
   - Status: Superseded (old system removed)
   - Archive reason: Specific to old Next.js architecture

3. **ARCHIVED-004-old-app-dual-mode.md**
   - Original: ADR 004: Dual-Mode Content
   - Described working/formal language modes in Next.js app
   - Status: Superseded (old system removed)
   - Archive reason: Specific to old Next.js architecture

### Updated ADRs (Pipeline System)

1. **002-ai-architecture.md**
   - Removed references to "programme builder" (old terminology)
   - Removed references to Inngest background jobs
   - Removed references to LangChain abstractions
   - Updated to reflect direct API integration approach
   - Changed terminology to match pipeline system
   - Updated implementation details to reflect current architecture

2. **005-pipeline-architecture.md**
   - Updated title to "Pipeline Architecture Evolution"
   - Added UPDATE note explaining old app removal
   - Removed distinction between "Main App" and "Pipeline"
   - Updated to reflect pipeline as the ONLY active system
   - Removed references to "separate service" concept
   - Updated constraints, decision, rationale, and consequences
   - Changed alternatives to reflect technology choice decisions
   - Updated success metrics to reflect unified system

### Active ADRs (Unchanged)

These ADRs describe the current pipeline system and remain valid:

1. **001-fastify-backend.md**
   - Describes Fastify backend architecture
   - Status: Active and correct

2. **002-modular-generators.md**
   - Describes modular generator architecture for project generation
   - Status: Active and correct

3. **003-vite-react-frontend.md**
   - Describes Vite + React frontend architecture
   - Status: Active and correct

## Current ADR Structure

### Active System ADRs
- **ADR 001:** Fastify Backend Framework (001-fastify-backend.md)
- **ADR 002:** AI Architecture (002-ai-architecture.md) - Updated
- **ADR 002:** Modular Generator Architecture (002-modular-generators.md)
- **ADR 003:** Vite + React Frontend (003-vite-react-frontend.md)
- **ADR 005:** Pipeline Architecture Evolution (005-pipeline-architecture.md) - Updated

### Archived ADRs (Old Next.js App)
- **ARCHIVED ADR 001:** Next.js Tech Stack (ARCHIVED-001-nextjs-tech-stack.md)
- **ARCHIVED ADR 003:** Multi-Tenancy (ARCHIVED-003-old-app-multi-tenancy.md)
- **ARCHIVED ADR 004:** Dual-Mode Content (ARCHIVED-004-old-app-dual-mode.md)

## Verification Checklist

- [x] All ADRs reviewed for old system references
- [x] ADRs describing old Next.js app archived with clear notes
- [x] ADR 002 updated to remove Inngest and programme builder references
- [x] ADR 005 updated to remove "separate service" distinction
- [x] All active ADRs accurately describe pipeline system only
- [x] Archive notes clearly explain why ADRs were archived
- [x] Cross-references between ADRs updated where necessary

## Key Takeaways

1. **Single System:** The pipeline (Fastify + Vite) is the only active system
2. **No Confusion:** Archived ADRs clearly marked as describing removed system
3. **Clear History:** Archive notes explain when and why old app was removed
4. **Current Truth:** Active ADRs accurately reflect current architecture

## Next Steps

No further action required. ADR documentation now accurately reflects the current system architecture with no references to the removed Next.js application.
