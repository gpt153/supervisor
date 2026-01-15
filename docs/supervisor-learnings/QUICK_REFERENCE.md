# Quick Reference - Supervisor Learning System

## Fast Commands

### Search for Solutions

```bash
# Full text search
grep -ri "keyword" /home/samuel/supervisor/docs/supervisor-learnings/learnings/

# Using search script
cd /home/samuel/supervisor/docs/supervisor-learnings
./search-learnings.sh search "keyword"
```

### Browse by Category

```bash
# With yq
yq '.learnings[] | select(.category == "context-management")' \
  /home/samuel/supervisor/docs/supervisor-learnings/index.yaml

# Using search script
./search-learnings.sh category context-management
```

### Browse by Tag

```bash
# With yq
yq '.learnings[] | select(.tags[] == "subagent")' \
  /home/samuel/supervisor/docs/supervisor-learnings/index.yaml

# Using search script
./search-learnings.sh tag subagent
```

### Recent Learnings

```bash
# Show last 5
./search-learnings.sh recent

# Show last 10
./search-learnings.sh recent 10
```

### High Priority Issues

```bash
./search-learnings.sh high
```

### Statistics

```bash
./search-learnings.sh stats
```

## Document New Learning

```bash
# Get next ID
cd /home/samuel/supervisor/docs/supervisor-learnings/learnings
NEXT_ID=$(printf "%03d" $(($(ls -1 *.md 2>/dev/null | wc -l) + 1)))

# Create from template
cp ../_learning-template.md ${NEXT_ID}-problem-name.md

# Edit the file
# Then update ../index.yaml
```

## Categories Quick Ref

- `context-management` - Token optimization, subagent handoffs
- `github-automation` - GitHub API, gh-cli, rate limits
- `bmad-workflow` - BMAD methodology, epic structure
- `scar-integration` - SCAR handoffs, implementation
- `template-issues` - Template bugs, formatting
- `git-operations` - Git commands, merge conflicts
- `tool-usage` - Claude Code tools, best practices
- `project-setup` - Project creation, initialization

## Common Tags

- `subagent`, `handoff`, `token-budget`
- `api`, `rate-limit`, `gh-cli`
- `epic`, `user-story`, `planning`
- `git`, `merge`, `conflict`
- `template`, `yaml`, `markdown`
- `context`, `optimization`

## Workflow

1. **Before complex operation** → Search for existing solutions
2. **If found** → Apply documented pattern
3. **If not found** → Solve problem, then document it
4. **Document immediately** → So all projects benefit

## Integration Points

**Root CLAUDE.md:**
- References learning system in "Shared Documentation" section

**Project CLAUDE.md:**
- Item #7 in "Core Documentation (Read These)" section
- Links to learning system README

**All supervisors:**
- Check learnings before complex operations
- Document new solutions immediately
- Share knowledge across all projects
