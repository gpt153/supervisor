# Future Tools - Planning Repository

**Purpose:** This directory contains BMAD planning artifacts for tools and features that are **planned but NOT yet in the active build pipeline**.

## ⚠️ CRITICAL: Not for Active Development

**Supervisor Behavior:**
- When you say "continue building", the supervisor will **IGNORE** everything in this directory
- Supervisor only works on epics in `.bmad/epics/` that have GitHub issues created
- These are **planning artifacts only** - no GitHub issues should be created until you explicitly approve

## Directory Structure

```
future-tools/
├── README.md (this file)
├── ideas.md (quick capture of tool ideas)
├── tool-001-name/
│   ├── epic.md (full BMAD epic)
│   ├── prd.md (product requirements)
│   └── adr/ (architectural decisions)
├── tool-002-name/
│   └── epic.md
└── ...
```

## Workflow

### 1. Capture Ideas (Quick)
Add to `ideas.md` - just title and 1-2 sentence description

### 2. Plan Tool (BMAD Method)
Create folder: `tool-XXX-name/`
- Write `epic.md` using BMAD epic template
- Add `prd.md` if needed for complex requirements
- Create `adr/` folder for architectural decisions

### 3. Promote to Active Build
When ready to build:
- Move epic from `future-tools/tool-XXX/epic.md` to `.bmad/epics/`
- Renumber as next epic in sequence
- Create GitHub issue in gpt153/odin
- Supervisor will then pick it up on "continue building"

## Naming Convention

**Tools:** `tool-001-name`, `tool-002-name`, etc.
- Three-digit number for sorting
- Descriptive kebab-case name

**Example:**
- `tool-001-email-classifier/`
- `tool-002-calendar-sync/`
- `tool-003-task-prioritizer/`

## Current Active Pipeline

**Active Epics** (in `.bmad/epics/`):
- Epic 016: Multi-Platform Orchestration (currently building)

**Supervisor Focus:**
- Supervisor only processes epics that have GitHub issues
- "Continue building" = work on open GitHub issues only
- This directory is **completely invisible** to the supervisor during builds

## Planning New Tools

Use the analyze-plan-document workflow:

1. **Analyze** (optional for complex tools):
   - Spawn analysis agent to research requirements
   - Output: `tool-XXX-name/analysis.md`

2. **Plan**:
   - Create epic using BMAD template
   - Break into implementation tasks
   - Define acceptance criteria
   - Output: `tool-XXX-name/epic.md`

3. **Document ADRs**:
   - Key architectural decisions
   - Technology choices
   - Integration approaches
   - Output: `tool-XXX-name/adr/XXX-decision.md`

4. **Wait**:
   - Keep in `future-tools/` until ready
   - Review and refine as needed
   - No GitHub issues, no building

## Templates

Use existing BMAD templates from `/home/samuel/supervisor/templates/`:
- `epic-template.md`
- `adr-template.md`
- `prd-template.md`

## Example Tool Entry

```markdown
# Tool: Email Classifier

**ID:** tool-001-email-classifier
**Status:** Planned
**Priority:** Medium
**Complexity:** 3/5

## Purpose
Automatically classify incoming emails into categories (work, personal, bills, family, etc.)

## Key Features
- ML-based classification
- Custom rules engine
- Auto-tagging and labeling
- Integration with email ingestion (Epic 002)

## Dependencies
- Epic 002: Email Ingestion (must be complete)
- Epic 003: AI Processing Pipeline (must be complete)

## Estimated Effort
2-3 weeks

## Status
Planning complete, waiting for Epic 002 and 003 to finish before promoting to active build.
```

---

**Remember:** Nothing in this directory will be built until you explicitly move it to `.bmad/epics/` and create a GitHub issue.
