---
id: 003
date: 2026-01-15
category: tool-usage
tags: [tools, bash, optimization, best-practice]
severity: medium
projects-affected: [all]
---

# Problem: Using Bash Commands Instead of Specialized Tools

## Symptoms

- Using `cat`, `head`, `tail` to read files
- Using `grep`, `find` for file searches
- Using `sed`, `awk` for file edits
- Using `echo >` or heredocs to write files
- Slower operations and verbose command construction

## Context

Claude Code provides specialized tools (Read, Grep, Glob, Edit, Write) that are optimized and provide better user experience than bash equivalents.

## Root Cause

Habit of using traditional Unix commands instead of leveraging Claude Code's purpose-built tools.

## Solution

**Pattern:** Use Specialized Tools First

**File Operations:**

```markdown
❌ Bad: bash cat
cat /path/to/file.txt

✅ Good: Read tool
Read tool with file_path: /path/to/file.txt

---

❌ Bad: bash grep
grep -r "searchterm" .

✅ Good: Grep tool
Grep tool with pattern: "searchterm"

---

❌ Bad: bash find/ls
find . -name "*.js"

✅ Good: Glob tool
Glob tool with pattern: "**/*.js"

---

❌ Bad: bash sed
sed -i 's/old/new/g' file.txt

✅ Good: Edit tool
Edit tool with old_string: "old", new_string: "new"

---

❌ Bad: bash echo/heredoc
echo "content" > file.txt
cat <<EOF > file.txt
content
EOF

✅ Good: Write tool
Write tool with content: "content"
```

**When to use Bash:**

✅ Git operations: `git status`, `git commit`, `git push`
✅ Package managers: `npm install`, `pip install`
✅ Build tools: `npm run build`, `make`
✅ System commands: `mkdir`, `chmod`, `ln`
✅ Process management: `ps`, `kill`

## Prevention

1. **Review tool calls** - Before using bash for file operations, check if specialized tool exists
2. **Update CLAUDE.md** - Add tool usage guidelines
3. **Template updates** - Use specialized tools in all templates

Example CLAUDE.md addition:
```markdown
## Tool Usage Priority

**Always prefer specialized tools:**
- **Read** for viewing files (not cat/head/tail)
- **Grep** for searching content (not grep/rg)
- **Glob** for finding files (not find/ls)
- **Edit** for modifying files (not sed/awk)
- **Write** for creating files (not echo >/heredoc)

**Use Bash for:**
- Git operations
- Package management
- Build commands
- System operations
```

## Code/Config Examples

### Before (problematic)
```bash
# Reading a file
cat /home/samuel/supervisor/CLAUDE.md

# Searching for text
grep -r "subagent" /home/samuel/supervisor/

# Finding files
find . -name "*.yaml"

# Editing a file
sed -i 's/old_function/new_function/g' app.js

# Creating a file
cat <<EOF > config.yaml
setting: value
EOF
```

### After (fixed)
```markdown
# Reading a file
Read tool: /home/samuel/supervisor/CLAUDE.md

# Searching for text
Grep tool: pattern="subagent", path="/home/samuel/supervisor/"

# Finding files
Glob tool: pattern="**/*.yaml"

# Editing a file
Edit tool:
  file_path: "app.js"
  old_string: "old_function"
  new_string: "new_function"

# Creating a file
Write tool:
  file_path: "config.yaml"
  content: "setting: value"
```

## Benefits

- **Faster:** Specialized tools are optimized for their purpose
- **Better UX:** Cleaner output, progress indicators
- **More reliable:** Built-in error handling
- **Token efficient:** Less verbose than bash command construction
- **Consistent:** Same interface across all operations

## Related Learnings

- #015 (token-optimization) - General efficiency patterns
- #022 (tool-combinations) - Combining tools effectively

## Impact

- **Time saved:** 10-20% faster operations
- **UX improvement:** Cleaner, more readable operations
- **Reliability:** Fewer command syntax errors
- **Projects benefiting:** All projects

## Notes

- Exception: Complex bash pipelines that combine multiple operations may still be appropriate
- Read tool handles images, PDFs, Jupyter notebooks automatically
- Grep tool supports regex, context lines (-A, -B, -C)
- Edit tool ensures unique string matching to prevent wrong edits
- Glob tool supports standard glob patterns like `**/*.{js,ts}`

---

**Documented by:** Root Supervisor
**Verified by:** Claude Code tool documentation
