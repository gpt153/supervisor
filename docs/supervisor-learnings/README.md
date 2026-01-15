# Supervisor Learning System

**Purpose:** Capture and share problem-solution knowledge across all project supervisors.

Every supervisor in every project learns from the collective experience of all projects.

---

## 📚 How It Works

### When You Encounter a Problem

**Step 1: Search for existing solutions**
```bash
# Search by keyword
grep -ri "your problem keyword" /home/samuel/supervisor/docs/supervisor-learnings/learnings/

# Search by category (requires yq)
yq '.learnings[] | select(.category == "context-management")' \
  /home/samuel/supervisor/docs/supervisor-learnings/index.yaml

# Search by tag
yq '.learnings[] | select(.tags[] == "subagent")' \
  /home/samuel/supervisor/docs/supervisor-learnings/index.yaml
```

**Step 2: Apply the documented solution**
- Read the learning file
- Follow the solution pattern
- Note any adaptations needed

**Step 3: Update workflow-status.yaml** (optional)
```yaml
learnings_applied:
  - id: "001"
    applied_date: 2026-01-15
    context: "Epic-003 subagent spawn"
    outcome: "Saved 50k tokens"
```

### When You Solve a New Problem

**Immediately document it!**

**Step 1: Create new learning file**
```bash
# Get next ID
NEXT_ID=$(ls -1 learnings/ | wc -l | xargs printf "%03d")

# Create from template
cp _learning-template.md learnings/${NEXT_ID}-brief-problem-description.md
```

**Step 2: Fill out the template**
- Problem description
- Symptoms
- Root cause
- Solution
- Prevention measures

**Step 3: Update index.yaml**
```yaml
learnings:
  - id: "XXX"
    title: "Brief Problem Description"
    category: relevant-category
    tags: [tag1, tag2, tag3]
    severity: high|medium|low
    date: YYYY-MM-DD
    file: learnings/XXX-brief-problem-description.md
```

---

## 📋 Categories

- **context-management**: Token optimization, subagent handoffs, context preservation
- **github-automation**: GitHub API, gh-cli, repo operations
- **bmad-workflow**: BMAD methodology, epic structure, workflow patterns
- **scar-integration**: SCAR handoffs, implementation verification
- **template-issues**: Template bugs, formatting problems
- **git-operations**: Git commands, merge conflicts, branch management
- **tool-usage**: Claude Code tools, best practices
- **project-setup**: New project creation, initialization issues

---

## 🏷️ Common Tags

- `subagent`, `handoff`, `token-budget`
- `api`, `rate-limit`, `gh-cli`
- `epic`, `user-story`, `planning`
- `git`, `merge`, `conflict`
- `template`, `yaml`, `markdown`
- `context`, `optimization`

---

## 🎯 Severity Levels

- **high**: Major issue that blocks work or wastes significant tokens/time
- **medium**: Important issue that affects efficiency
- **low**: Minor issue or optimization tip

---

## 📊 Index Structure

The `index.yaml` file maintains a searchable catalog:

```yaml
learnings:
  - id: "001"
    title: "Subagent Context Handoff Failed"
    category: context-management
    tags: [subagent, handoff, token-budget]
    severity: high
    date: 2026-01-15
    file: learnings/001-subagent-context-handoff.md

categories:
  - context-management
  - github-automation
  - bmad-workflow
  - scar-integration
  - template-issues
  - git-operations
  - tool-usage
  - project-setup

tags:
  subagent: "Subagent spawning and management"
  handoff: "Context handoff between agents"
  token-budget: "Token optimization strategies"
  # ... more tag definitions
```

---

## 🔍 Quick Search Commands

```bash
# All learnings in a category
yq '.learnings[] | select(.category == "context-management") | .title, .file' index.yaml

# High severity issues only
yq '.learnings[] | select(.severity == "high") | .title, .file' index.yaml

# By tag
yq '.learnings[] | select(.tags[] == "subagent") | .title, .file' index.yaml

# Recent learnings (last 5)
yq '.learnings[-5:] | .[] | .title, .date' index.yaml

# Full text search in all learnings
grep -r "context handoff" learnings/
```

---

## 🚀 Integration with Projects

**Every project's CLAUDE.md should include:**

```markdown
## 🧠 Learning System

**Before starting complex operations, check learnings:**
```bash
grep -ri "relevant keyword" /home/samuel/supervisor/docs/supervisor-learnings/learnings/
```

**Reference:** `/home/samuel/supervisor/docs/supervisor-learnings/README.md`

**When you solve a problem:** Document it in the central learning system so all projects benefit.
```

---

## 📝 Learning File Template

See `_learning-template.md` for the standard format.

---

## 🔄 Maintenance

- Review learnings quarterly
- Archive outdated solutions
- Update index when patterns change
- Cross-reference related learnings

---

**All supervisors share knowledge. Document problems once, solve them everywhere.**
