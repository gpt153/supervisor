# Repository Structure: Dual vs Single

**Date:** 2026-01-18
**Decision:** Should we keep planning + implementation in separate repos?

---

## Current Setup (Dual Repo)

```
Planning Repo: gpt153/supervisor
└── consilio/
    ├── epics/
    ├── adr/
    ├── PRD.md
    └── .bmad/

Implementation Repo: gpt153/consilio
└── src/
    ├── components/
    ├── services/
    └── ...
```

## Option A: Keep Dual Repo ✅

### Pros

✅ **Separation of concerns**
   - Planning artifacts don't clutter code repo
   - Implementation repo stays clean and focused
   - Different audiences (planning vs code review)

✅ **Centralized planning methodology**
   - All projects share same planning repo
   - Consistent epic/ADR format across projects
   - Easy to see all projects at once

✅ **Different access control**
   - Planning repo can be private (business strategy)
   - Implementation repo can be public (open source)

✅ **Simpler implementation repo**
   - Standard code structure
   - No confusion about planning vs code folders
   - Cleaner for external contributors

✅ **Portfolio view**
   - `/home/samuel/supervisor/` shows all projects
   - Easy cross-project status checks
   - Unified planning system

### Cons

❌ **Confusion about GitHub issues**
   - Must use `--repo gpt153/consilio` flag
   - Easy to create issues in wrong repo
   - Requires understanding of two-repo system

❌ **Two places to commit/push**
   - Planning changes → commit to supervisor repo
   - Code changes → commit to implementation repo
   - Two sets of git operations

❌ **Context switching**
   - User must understand which repo is active
   - "Where is this file?" confusion

---

## Option B: Single Repo per Project ✅

### Pros

✅ **Simplicity for non-coder**
   - Everything in one place
   - No confusion about where things are
   - Single git repo to understand

✅ **Standard practice**
   - Most projects have `docs/` folder
   - Planning artifacts in `/docs/planning/`
   - Industry norm (easier for collaborators)

✅ **No GitHub issue confusion**
   - Issues automatically go to correct repo
   - No `--repo` flag needed
   - One source of truth

✅ **Easier collaboration**
   - Planning and code in same repo
   - Pull requests can include both
   - Single clone for contributors

✅ **Better linking**
   - Epics can link directly to code files
   - Code can reference planning docs
   - Relative paths work

### Cons

❌ **Planning artifacts in code repo**
   - Might feel cluttered
   - External contributors see business planning
   - Mixes concerns

❌ **No centralized planning view**
   - Must visit each repo to see epics
   - Can't see all projects at once
   - Harder to enforce consistent methodology

❌ **Duplicated planning structure**
   - Each repo has own epics/, adr/, .bmad/
   - Harder to share improvements across projects
   - More setup for new projects

---

## Hybrid Option: Dual Repo with Symlinks ✨

**Best of both worlds:**

```
Planning Repo: gpt153/supervisor
└── consilio/
    ├── epics/          → symlink to gpt153/consilio/docs/epics/
    ├── adr/            → symlink to gpt153/consilio/docs/adr/
    └── PRD.md          → symlink to gpt153/consilio/docs/PRD.md

Implementation Repo: gpt153/consilio
└── docs/
    └── planning/
        ├── epics/      (actual files here)
        ├── adr/        (actual files here)
        └── PRD.md      (actual file here)
```

**How it works:**
- Planning artifacts stored in implementation repo (`/docs/planning/`)
- Symlinks in planning repo point to implementation repo
- Supervisor workspace: `/home/samuel/supervisor/consilio/` → symlinks
- Implementation workspace: `/home/samuel/.archon/workspaces/consilio/`

**Advantages:**
✅ Single source of truth (implementation repo)
✅ Portfolio view (planning repo shows all projects via symlinks)
✅ No GitHub issue confusion (issues go to implementation repo)
✅ Centralized view for cross-project status

**Disadvantages:**
⚠️ Requires symlink setup (slightly complex)
⚠️ Two repos still exist (but planning is just symlinks)

---

## Recommendation for Non-Coder User

### **Option B: Single Repo per Project**

**Why:**

1. **Simplicity wins**
   - Non-coder shouldn't need to understand dual-repo system
   - "Everything in one place" is easier mental model
   - No confusion about where to create issues

2. **Industry standard**
   - Most repos have `docs/` folder
   - Contributors expect this structure
   - Easier to open source later

3. **Fewer git operations**
   - One repo to clone, commit, push
   - Simpler for automation
   - Less room for error

**Proposed structure:**

```
gpt153/consilio/
├── src/                    # Code
├── tests/                  # Tests
├── docs/
│   ├── planning/
│   │   ├── epics/
│   │   │   ├── epic-001-authentication.md
│   │   │   ├── epic-002-dashboard.md
│   │   │   └── ...
│   │   ├── adr/
│   │   │   ├── adr-001-tech-stack.md
│   │   │   ├── adr-002-auth-strategy.md
│   │   │   └── ...
│   │   ├── PRD.md
│   │   └── .bmad/
│   │       ├── workflow-status.yaml
│   │       └── context-handoff.md
│   ├── api/                # API documentation
│   └── user-guide/         # User documentation
├── .claude/
│   └── commands/           # PIV commands
├── CLAUDE.md               # Project supervisor instructions
├── README.md
└── package.json
```

**For portfolio view:**

Keep lightweight `/home/samuel/supervisor/` for:
- Shared documentation (methodology, learnings)
- Cross-project status dashboard
- Templates for new projects
- Meta-supervisor resource management

But each project is self-contained.

---

## Migration Path (if switching to single repo)

### Phase 1: Test with One Project

1. Choose pilot project (e.g., Odin - newest)
2. Move planning artifacts to `docs/planning/`
3. Update CLAUDE.md to reference new paths
4. Test full workflow (epic creation → implementation)
5. Validate nothing breaks

### Phase 2: Migrate Remaining Projects

1. For each project:
   - Copy `supervisor/{project}/*` → `{project}/docs/planning/`
   - Commit to implementation repo
   - Update GitHub issue references
2. Archive planning artifacts in supervisor repo
3. Update root supervisor CLAUDE.md

### Phase 3: Cleanup

1. Keep `/home/samuel/supervisor/` for:
   - Shared docs
   - Templates
   - Meta-supervisor
2. Remove old project folders from supervisor repo
3. Update all documentation

---

## Decision Matrix

| Criteria | Dual Repo | Single Repo | Hybrid (Symlinks) |
|----------|-----------|-------------|-------------------|
| **Simplicity** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Non-coder friendly** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **GitHub issue clarity** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Portfolio view** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Access control** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Industry standard** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Collaboration** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Setup complexity** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**Winner for non-coder: Single Repo** ⭐⭐⭐⭐⭐

---

## Recommendation

**Start new projects with Single Repo structure**
- Easier for non-coder
- Industry standard
- Simpler to maintain

**Migrate existing projects gradually**
- One project at a time
- Validate workflow before migrating next
- Keep supervisor repo for shared resources

**Preserve what works**
- BMAD methodology (epics, ADRs, PRDs)
- Planning quality and structure
- Just change where files live
