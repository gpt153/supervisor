# How to Plan Future Tools (Without Triggering Builds)

## Quick Start

### 1. Capture a Quick Idea

Just add to `ideas.md`:

```markdown
### Tool: Email Classifier
- **One-liner:** Auto-categorize emails using AI
- **Why:** Need smart email organization
- **Complexity:** 3
- **Status:** Idea
```

### 2. Plan a Tool Properly (BMAD Method)

When ready to fully plan:

```bash
# Create tool folder
mkdir -p .bmad/future-tools/tool-001-email-classifier

# Copy template
cp .bmad/future-tools/_TOOL_TEMPLATE/epic.md \
   .bmad/future-tools/tool-001-email-classifier/epic.md

# Edit the epic
# Fill in all sections: problem, requirements, architecture, tasks
```

### 3. Keep Planning (Safe - Won't Build)

You can now:
- Refine the epic
- Add ADRs if needed
- Create PRD for complex requirements
- Discuss with Claude
- Iterate on the plan

**The supervisor will NEVER build these** - they're in `future-tools/`, not `epics/`.

### 4. When Ready to Build

**Only when you explicitly say "build tool-001-email-classifier":**

```bash
# 1. Move to active epics
mv .bmad/future-tools/tool-001-email-classifier/epic.md \
   .bmad/epics/017-email-classifier.md

# 2. Renumber as next epic in sequence (Epic 017, 018, etc.)

# 3. Tell supervisor: "Create GitHub issue for Epic 017"

# 4. Supervisor creates issue in gpt153/odin

# 5. SCAR starts building automatically
```

## Safe Planning Commands

**These are SAFE** (won't trigger builds):

- "Let's plan a tool for email classification"
- "Add an idea for calendar sync to future-tools"
- "Create an epic for task prioritization in future-tools"
- "Refine the email classifier epic"

**These WILL trigger builds:**

- "Continue building" (builds active epics with GitHub issues)
- "Build Epic 017" (if Epic 017 exists in `.bmad/epics/`)
- "Create GitHub issue for Epic 017" (promotes epic to active build)

## Directory Structure

```
.bmad/
├── epics/                      # ⚠️ ACTIVE BUILD - Supervisor works here
│   ├── 001-project-foundation.md
│   └── 016-multi-platform-orchestration.md
│
└── future-tools/               # ✅ SAFE PLANNING - Supervisor ignores
    ├── README.md
    ├── ideas.md                # Quick idea capture
    ├── _TOOL_TEMPLATE/         # Copy this for new tools
    │   └── epic.md
    └── tool-001-email-classifier/  # Your planned tools
        ├── epic.md
        ├── prd.md (optional)
        └── adr/ (optional)
```

## Workflow Summary

```
Idea → Planning → Refinement → Promote → Build

1. Idea:       Add to ideas.md (30 seconds)
2. Planning:   Create tool-XXX folder, fill epic.md (1-2 hours)
3. Refinement: Discuss, iterate, add ADRs (as needed)
4. Promote:    Move to .bmad/epics/ and renumber (1 minute)
5. Build:      Create GitHub issue, supervisor builds (automatic)
```

## Example Session

```
You: "I want to plan a tool for email classification, but don't build yet"

Claude: "Perfect! I'll create a planning epic in future-tools."
[Creates tool-001-email-classifier/epic.md]

You: "Can we refine the requirements?"

Claude: "Absolutely, let's iterate on the epic..."
[Updates epic.md with refined requirements]

You: "Looks good. I want to plan two more tools before building any"

Claude: "Great! What are the next tools?"
[You plan tool-002 and tool-003, all in future-tools/]

You: "Okay, now build tool-001-email-classifier"

Claude: "Moving Epic 017 to active build pipeline..."
[Moves to .bmad/epics/017-email-classifier.md]
[Creates GitHub issue #XX]
[Supervisor picks it up automatically]
```

## Tips

1. **Plan in batches**: Plan 3-5 tools, then prioritize which to build first
2. **Use ideas.md liberally**: Capture ideas fast, expand later
3. **ADRs for big decisions**: If tool has architectural complexity, add ADRs
4. **Review before promoting**: Once in active build, changes are harder
5. **Dependencies matter**: Don't promote tools that depend on unfinished epics

## Current State

- **Active Build**: Epic 016 (Multi-Platform Orchestration) - Issues #8-27
- **Future Planning**: Empty (ready for your tool ideas!)

When you say "continue building", supervisor works on Epic 016 only.
