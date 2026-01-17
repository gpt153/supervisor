# ADR 001: Local-First Architecture

**Date:** 2026-01-15
**Status:** Accepted
**Deciders:** Samuel

---

## Context

Odin will handle extremely sensitive personal data including emails, messages, task lists, and potentially financial information. We need to decide where this data should be stored and processed.

### Options Considered

1. **Cloud-First:** Store data in managed cloud database (AWS RDS, Supabase)
2. **Hybrid:** Store some data locally, sync to cloud for backup
3. **Local-First:** All data stored on user's local machine

---

## Decision

**We will use Local-First architecture: all personal data stored locally on user's machine.**

### Implementation

- PostgreSQL database running locally
- Redis running locally for task queue
- No cloud storage of personal data
- API keys for external services (OpenAI, Anthropic) used but data not persisted there
- Optional encrypted backups to user's chosen location (future)

---

## Rationale

### Privacy & Security
- **User owns their data:** No third party has access
- **GDPR compliance:** Easier to comply when data never leaves user control
- **No data breach risk:** If our service is compromised, no user data exposed
- **Trust:** Users trust system more when data stays local

### Control
- **User can inspect database:** Full transparency
- **No vendor lock-in:** User controls their data format and location
- **Offline capable:** Works without internet (except AI API calls)

### Cost
- **Zero storage costs:** No cloud database fees
- **Predictable costs:** Only AI API usage costs
- **Scalable:** User's machine capacity is the only limit

---

## Consequences

### Positive
- ✅ Maximum privacy and security
- ✅ User controls their data completely
- ✅ No ongoing cloud costs
- ✅ Fast data access (no network latency)
- ✅ Works offline (except AI features)

### Negative
- ❌ User must maintain local database (PostgreSQL, Redis)
- ❌ No automatic backups (user responsibility)
- ❌ Single device initially (no multi-device sync)
- ❌ Requires technical setup (not click-and-run)

### Mitigations
- Provide detailed setup scripts and documentation
- Docker Compose for easy local database setup
- Backup scripts for user to run
- Future: Optional encrypted cloud backup with user's key

---

## Alternatives Rejected

### Cloud-First
- **Rejected:** Privacy concerns too high for personal email/task data
- User would need to trust us with their entire digital life
- GDPR compliance complex
- Ongoing infrastructure costs

### Hybrid
- **Rejected:** Adds complexity without major benefits
- Still requires cloud infrastructure and costs
- Privacy concerns remain (data in cloud even if encrypted)
- Sync conflicts would be complex to handle

---

## References

- Project Brief: Privacy-first requirement
- Inspiration: Obsidian (local-first note-taking)
- GDPR guidelines on personal data storage

---

**Status:** Accepted and implemented in MVP
