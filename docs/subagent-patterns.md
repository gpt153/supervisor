# Subagent Patterns (Context Conservation)

## Why Subagents?

**Problem:** Loading full command prompts inline wastes context.

**Solution:** Spawn subagents that work independently and return only summaries.

**Savings:**
- Loading commands inline: ~21,000 tokens
- Spawning subagents: ~1,900 tokens
- **90% context savings!**

## How to Spawn Subagents

**Always use Task tool:**

```bash
# ❌ BAD: Loading command inline (wastes 5000+ tokens)
Read /home/samuel/supervisor/.claude/commands/analyze.md
# Then run analysis inline

# ✅ GOOD: Spawn subagent (uses <500 tokens)
Task tool with prompt: "Analyze feature: user authentication
Working directory: /home/samuel/supervisor/consilio/
Use Analyst agent role from /home/samuel/supervisor/.claude/commands/analyze.md
Return: Feature request document created and complexity level detected"
```

## Available Subagents

### 1. Analyst Subagent

**Spawn when:** User requests feature analysis

**Task prompt:**
```
Analyze feature request: [user description]

Working directory: /home/samuel/supervisor/[project]/
Role: Analyst agent
Instructions: /home/samuel/supervisor/.claude/commands/analyze.md

Tasks:
1. Ask systematic questions (business, user, technical, constraints)
2. Detect complexity level (0-4)
3. Create feature-request.md
4. Update workflow-status.yaml

Return:
- Feature request file path
- Complexity level detected
- Planning track recommended (quick-flow/standard/enterprise)
- Next step (create epic / create PRD / skip to GitHub issue)
```

**You receive back:** Concise summary (~200 tokens)

### 2. PM Subagent (Epic Creation)

**Spawn when:** Need to create epic file

**Task prompt:**
```
Create epic for feature: [feature-name]

Working directory: /home/samuel/supervisor/[project]/
Role: PM agent
Instructions: /home/samuel/supervisor/.claude/commands/create-epic.md

Input: .bmad/feature-requests/[feature-name].md (if exists)
Template: /home/samuel/supervisor/templates/epic-template.md

Tasks:
1. Create self-contained epic file
2. Use MoSCoW prioritization
3. Break down into GitHub issues
4. Define acceptance criteria
5. Update workflow-status.yaml

Return:
- Epic file path (.bmad/epics/NNN-feature.md)
- Issue breakdown (titles, descriptions)
- Dependencies identified
- Next step (create ADR if needed / create GitHub issues)
```

**You receive back:** Epic summary + issue list (~300 tokens)

### 3. Architect Subagent (ADR Creation)

**Spawn when:** Technical decision needs documentation

**Task prompt:**
```
Create ADR for decision: [decision-title]

Working directory: /home/samuel/supervisor/[project]/
Role: Architect agent
Instructions: /home/samuel/supervisor/.claude/commands/create-adr.md

Context: [Brief description of decision needed]
Template: /home/samuel/supervisor/templates/adr-template.md

Tasks:
1. Analyze options (at least 3 alternatives)
2. Document rationale (pros/cons)
3. Capture consequences
4. Create ADR file
5. Link to related epic if applicable
6. Update workflow-status.yaml

Return:
- ADR file path (.bmad/adr/NNN-decision.md)
- Decision summary
- Alternatives considered
- Epic updated (if applicable)
```

**You receive back:** ADR summary (~250 tokens)

### 4. Meta-Orchestrator Subagent

**Spawn when:** User wants full planning workflow

**Task prompt:**
```
Plan feature end-to-end: [feature-description]

Working directory: /home/samuel/supervisor/[project]/
Role: Meta-orchestrator
Instructions: /home/samuel/supervisor/.claude/commands/plan-feature.md

Tasks:
1. Run analysis (spawn analyst subagent)
2. Detect complexity and select workflow
3. Create epic/PRD (spawn PM subagent)
4. Create ADRs if needed (spawn architect subagent)
5. Generate GitHub issue content
6. Update workflow-status.yaml

Return:
- All files created (paths)
- GitHub issue templates (ready to post)
- Complexity level
- Next step (create issues and tag SCAR)
```

**You receive back:** Complete planning summary (~400 tokens)

## Subagent Best Practices

**When to spawn:**
- User requests feature planning
- Need to create epic/ADR/PRD
- Need full planning workflow
- Any complex analysis/documentation task

**When NOT to spawn:**
- Simple file reads (use Read tool)
- Quick status checks (check workflow-status.yaml directly)
- User asking questions (answer directly)
- Verification tasks (use /verify-scar-phase directly)

**Benefits:**
- ✅ Keep supervisor context lean
- ✅ Subagents have full command instructions
- ✅ Work independently without polluting context
- ✅ Return only what supervisor needs
- ✅ Enable 10x more work before handoff
