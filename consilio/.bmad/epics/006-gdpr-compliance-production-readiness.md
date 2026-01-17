# Epic: GDPR Compliance & Production Readiness

**Epic ID:** 006
**Created:** 2026-01-17
**Status:** Draft
**Complexity Level:** 2
**Priority:** High
**Estimated Effort:** 2 weeks

## Project Context

- **Project:** Consilio
- **Repository:** https://github.com/gpt153/consilio
- **Tech Stack:** Node.js 20 LTS, TypeScript 5.5, Fastify 4.26, PostgreSQL 16, Prisma 5.9, React 18, Vite 7
- **Related Epics:**
  - Depends on: Epic 005 (AI Document Generation - must complete first)
  - Blocks: Beta launch (Q1 2026)
- **Workspace:** `/home/samuel/.archon/workspaces/consilio/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/consilio/`

## Business Context

### Problem Statement

Consilio handles extremely sensitive personal data (child welfare cases) for Swedish consulting firms. To launch in the EU/Swedish market, the platform MUST comply with GDPR (General Data Protection Regulation) requirements. Currently, the system has database-level isolation (PostgreSQL RLS - ADR 001) and audit logging, but lacks critical user rights features:

- **No data export** - Users cannot download their personal data
- **No data deletion** - Users cannot exercise "right to be forgotten"
- **No retention policies** - Data stored indefinitely (GDPR violation)
- **No consent management** - No tracking of user consent for data processing
- **Incomplete audit logs** - Missing export/deletion events
- **No production deployment docs** - Cannot reliably deploy to production

**Risk:** Cannot launch beta or production in Sweden/EU without these features. Legal liability, potential fines (up to 4% of annual revenue or €20M), and reputational damage.

### User Value

**For Consultants:**
- Confidence that their data is handled legally and ethically
- Ability to export their data if they change employers
- Peace of mind that deleted data is truly gone
- Transparency into who accessed their information

**For Consulting Firms (Customers):**
- GDPR compliance checkbox for regulatory audits
- Reduced legal risk from data breaches or violations
- Competitive advantage (demonstrable privacy-first platform)
- Trust from social services partners

**For Placed Children/Families:**
- Highest level of data protection for sensitive case information
- Right to know how their data is used
- Ability to request data deletion after case closure

### Success Metrics

- [ ] **Legal Compliance:** All GDPR Articles 15-22 requirements met
- [ ] **Audit Ready:** Can demonstrate compliance within 24 hours of regulatory request
- [ ] **User Trust:** Beta testers rate data privacy as "Excellent" (4.5/5 or higher)
- [ ] **Deployment Success:** Production deployment completes without data loss or downtime
- [ ] **Performance:** Data export completes in <30 seconds for typical consultant (500 cases)

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE (GDPR Articles 15-22):**

- [ ] **Data Export (Article 15 - Right of Access)**
  - User can download all their personal data in machine-readable format (JSON)
  - Includes: profile, cases they created/accessed, documents, emails, calendar events, audit logs
  - Export includes metadata: created dates, last accessed, data sources
  - Download link sent via email (async processing for large datasets)

- [ ] **Data Deletion (Article 17 - Right to Erasure)**
  - User can request account deletion
  - Soft delete first (30-day grace period for recovery)
  - Hard delete after 30 days (irreversible, cascades to all user data)
  - Cases are anonymized (not deleted) if other users have access
  - Admin can force immediate hard delete (compliance with legal orders)

- [ ] **Data Retention Policies (Article 5 - Storage Limitation)**
  - Closed cases auto-delete after configurable period (default: 7 years per Swedish law)
  - Audit logs retained for 10 years (legal requirement)
  - Email/calendar data deleted after case closure (unless flagged for retention)
  - System automatically identifies and flags expired data for review

- [ ] **Consent Management (Article 7 - Conditions for Consent)**
  - Track user consent for data processing (onboarding flow)
  - Record consent timestamp, version, and IP address
  - Allow users to withdraw consent (triggers data deletion flow)
  - Consent log stored separately from user data (immutable)

- [ ] **Privacy Policy Compliance (Article 13 - Information to be Provided)**
  - Display privacy policy during signup
  - Require explicit acceptance before account activation
  - Version privacy policy (track which version user accepted)
  - Notify users of policy changes (email + in-app banner)

- [ ] **Enhanced Audit Logging**
  - Log all data export requests (who, when, what data)
  - Log all deletion requests (who, when, status)
  - Log all consent changes (granted, withdrawn)
  - Log all privacy policy acceptances
  - Immutable audit log (append-only, cannot be modified)

**SHOULD HAVE:**

- [ ] **Data Portability (Article 20)**
  - Export data in JSON format (machine-readable)
  - Export includes relationships (cases → documents → emails)
  - Future: Support CSV export for non-technical users

- [ ] **Data Minimization Automation**
  - Auto-detect PII in documents (using Claude API)
  - Suggest anonymization for old cases
  - Weekly reports to admins: "X cases ready for deletion"

- [ ] **Privacy Dashboard**
  - User can view: what data exists, when accessed, by whom
  - User can see audit log of their data access
  - User can initiate export/deletion from dashboard

- [ ] **Data Breach Notification**
  - Detect potential data breaches (unusual access patterns)
  - Alert admins immediately
  - Template for notifying affected users (72-hour GDPR requirement)

**COULD HAVE:**

- [ ] **Granular Consent**
  - Separate consent for: emails, calendar, AI processing, analytics
  - Users can opt out of specific features while keeping account

- [ ] **Data Anonymization Engine**
  - Auto-anonymize PII in closed cases (instead of deletion)
  - Preserve statistical value while removing identities
  - Use Claude API for intelligent anonymization

**WON'T HAVE (this iteration):**

- **Blockchain-based audit logs** - Overkill for MVP, PostgreSQL append-only is sufficient
- **AI-powered PII detection** - Defer to post-MVP (Phase 8)
- **Real-time consent tracking** - Defer to post-MVP (complex UX)
- **Cross-border data transfer mechanisms** - All data stays in EU (Swedish hosting)

### Non-Functional Requirements

**Security:**
- Data export encrypted in transit (HTTPS) and at rest (encrypted ZIP file)
- Deletion operations require re-authentication (password confirmation)
- Audit logs signed with cryptographic hash (tamper detection)
- Rate limiting on export/deletion APIs (prevent abuse)

**Performance:**
- Data export completes in <30 seconds for 500 cases (typical consultant)
- Deletion operations complete in <5 seconds (soft delete)
- Hard delete background job completes in <24 hours
- Retention policy checks run daily (off-peak hours)

**Accessibility:**
- Privacy settings accessible via keyboard navigation
- Screen reader support for consent flow
- Clear language (avoid legal jargon where possible)
- Swedish language support for all privacy-related UI

**Scalability:**
- Data export handles datasets up to 10GB (large consulting firms)
- Retention policy processor handles 10,000+ cases per run
- Audit log ingestion handles 1,000 events/second

**Production Readiness:**
- Deployment documentation (step-by-step guide)
- Environment configuration (production .env template)
- Database backup/restore procedures
- Monitoring and alerting setup (Sentry error tracking)
- Health check endpoints for load balancer
- Docker production profile optimized

## Architecture

### Technical Approach

**Pattern:** Event-driven architecture for data lifecycle management

**Key Components:**
1. **GDPR Service** - Core business logic for export, deletion, retention
2. **Privacy Controller** - HTTP endpoints for user-facing features
3. **Retention Processor** - Background job (cron) for auto-deletion
4. **Audit Service** - Enhanced logging with immutability guarantees
5. **Consent Manager** - Track and validate user consent

**State Management:**
- User deletion states: `active` → `deletion_requested` → `soft_deleted` → `hard_deleted`
- Export states: `requested` → `processing` → `ready` → `downloaded` → `expired`
- Consent states: `pending` → `granted` → `withdrawn`

**API Style:**
- RESTful endpoints for CRUD operations
- Async processing for large exports (job queue)
- Webhooks for completion notifications (future)

### Integration Points

**Database:**
- New tables: `gdpr_exports`, `gdpr_deletions`, `consent_log`, `privacy_policy_versions`
- Enhanced: `audit_logs` table with cryptographic signatures
- Migration: Add retention metadata to `cases` table

**External APIs:**
- Email service (Nodemailer) - Send export download links
- Background job queue (future: Bull/BullMQ) - Process large exports
- Optional: S3-compatible storage for export files (future)

**Internal Services:**
- Audit service - Log all GDPR operations
- Case service - Anonymize cases on user deletion
- Document service - Delete user's documents
- Email service - Delete user's emails
- Calendar service - Delete user's calendar events

### Data Flow

```
DATA EXPORT FLOW:
User clicks "Export My Data" → Privacy Dashboard → POST /api/gdpr/export
  ↓
Backend validates auth → Creates export job in database (status: requested)
  ↓
Background worker picks up job → Gathers data from all tables
  ↓
JSON file generated → ZIP encrypted → Upload to secure storage
  ↓
Email sent to user with download link (expires in 7 days)
  ↓
User downloads → Export status updated (downloaded)
  ↓
After 7 days → Export file deleted → Audit log entry

DATA DELETION FLOW:
User clicks "Delete Account" → Confirmation modal → Re-auth required
  ↓
POST /api/gdpr/delete → User status: deletion_requested (30-day grace)
  ↓
User receives email: "Account will be deleted in 30 days (undo link)"
  ↓
After 30 days → Background job → Hard delete:
  - User profile deleted
  - Cases owned by user → Anonymized (if shared) or deleted (if sole owner)
  - Documents → Deleted from storage + database
  - Emails/Calendar → Deleted
  - Audit logs → Kept (legal requirement)
  ↓
Final email: "Account deleted" → User cannot log in

RETENTION POLICY FLOW (Daily Cron):
Retention processor runs at 3 AM daily
  ↓
Query: SELECT * FROM cases WHERE status = 'closed' AND closed_at < NOW() - INTERVAL '7 years'
  ↓
For each expired case:
  - Check if flagged for extended retention (legal hold)
  - If not flagged → Mark for deletion
  - Notify admin: "X cases ready for deletion"
  ↓
Admin reviews → Approves bulk deletion
  ↓
Background job deletes all approved cases
  ↓
Audit log entry for each deletion
```

### Key Technical Decisions

- **Decision 1:** PostgreSQL for audit log storage (see ADR-008: Immutable Audit Logs)
  - Rationale: Append-only table with check constraints, cryptographic hashing
  - Alternative considered: External audit service (too complex for MVP)

- **Decision 2:** Soft delete with grace period (30 days)
  - Rationale: Prevents accidental deletions, allows recovery
  - Alternative considered: Immediate hard delete (too risky)

- **Decision 3:** Async export processing (background jobs)
  - Rationale: Large datasets (10GB+) block HTTP requests
  - Alternative considered: Streaming response (complex, timeout issues)

- **Decision 4:** JSON export format (machine-readable)
  - Rationale: GDPR Article 20 requires "structured, commonly used format"
  - Alternative considered: CSV (loses relationships, not as structured)

### Files to Create/Modify

```
backend/
├── src/
│   ├── modules/
│   │   └── gdpr/
│   │       ├── gdpr.service.ts          # NEW - Core GDPR logic
│   │       ├── gdpr.controller.ts       # NEW - HTTP endpoints
│   │       ├── gdpr.routes.ts           # NEW - Route registration
│   │       ├── privacy.controller.ts    # NEW - Privacy dashboard
│   │       ├── consent.service.ts       # NEW - Consent management
│   │       ├── retention.processor.ts   # NEW - Retention cron job
│   │       └── types/
│   │           ├── export.types.ts      # NEW - Export data types
│   │           ├── deletion.types.ts    # NEW - Deletion types
│   │           └── consent.types.ts     # NEW - Consent types
│   ├── utils/
│   │   ├── crypto.ts                    # NEW - Cryptographic utils
│   │   └── zip.ts                       # NEW - ZIP file creation
│   └── middleware/
│       └── rate-limit.ts                # NEW - Rate limiting (export abuse)
├── prisma/
│   ├── migrations/
│   │   └── 0XX_gdpr_tables.sql          # NEW - GDPR schema migration
│   └── schema.prisma                    # MODIFY - Add GDPR tables
└── tests/
    └── gdpr/
        ├── export.test.ts               # NEW - Export tests
        ├── deletion.test.ts             # NEW - Deletion tests
        └── retention.test.ts            # NEW - Retention tests

frontend/
├── src/
│   ├── pages/
│   │   └── privacy/
│   │       ├── PrivacyDashboard.tsx     # NEW - Privacy center
│   │       ├── ExportData.tsx           # NEW - Export UI
│   │       ├── DeleteAccount.tsx        # NEW - Deletion UI
│   │       └── ConsentManager.tsx       # NEW - Consent preferences
│   ├── components/
│   │   └── privacy/
│   │       ├── PrivacyPolicyModal.tsx   # NEW - Policy acceptance
│   │       ├── ConsentForm.tsx          # NEW - Consent checkboxes
│   │       └── DataAccessLog.tsx        # NEW - Audit log viewer
│   └── services/
│       └── gdpr.service.ts              # NEW - API client

docs/
├── deployment/
│   ├── PRODUCTION_DEPLOY.md            # NEW - Deployment guide
│   ├── ENVIRONMENT_SETUP.md            # NEW - Env variables
│   ├── BACKUP_RESTORE.md               # NEW - Backup procedures
│   └── MONITORING.md                   # NEW - Sentry + health checks
└── legal/
    ├── PRIVACY_POLICY_v1.md            # NEW - Privacy policy
    └── GDPR_COMPLIANCE.md              # NEW - Compliance checklist
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue #XX: Backend - GDPR Database Schema**
- Create `gdpr_exports` table (id, user_id, status, file_path, expires_at)
- Create `gdpr_deletions` table (id, user_id, requested_at, scheduled_for, status)
- Create `consent_log` table (id, user_id, consent_type, granted, timestamp, ip_address)
- Create `privacy_policy_versions` table (id, version, content, published_at)
- Add retention metadata to `cases` table (retention_until, deletion_flagged)
- Add cryptographic hash column to `audit_logs` table
- Acceptance: Migration runs successfully, indexes created

**Issue #XX: Backend - Data Export Service**
- Implement `exportUserData()` - Gather all user data from database
- JSON serialization with proper relationships
- ZIP file creation with encryption (AES-256)
- Upload to local storage (or S3 future)
- Email notification with download link
- Background job processing (async)
- Acceptance: User can download complete data export in <30 seconds

**Issue #XX: Backend - Data Deletion Service**
- Implement `requestDeletion()` - Soft delete user account
- Implement `hardDeleteUser()` - Irreversible deletion
- Cascade deletion: documents, emails, calendar events
- Anonymize shared cases (replace user_id with "DELETED_USER")
- 30-day grace period with undo functionality
- Email notifications at each step
- Acceptance: User account fully deleted, cases anonymized

**Issue #XX: Backend - Retention Policy Processor**
- Daily cron job to identify expired cases
- Query cases older than 7 years (configurable)
- Flag cases for admin review
- Bulk deletion approval workflow
- Background processing for large datasets
- Admin notification email
- Acceptance: Expired cases auto-flagged daily

**Issue #XX: Backend - Consent Management**
- Store user consent during signup
- Track consent version and timestamp
- Allow consent withdrawal (triggers deletion flow)
- Consent validation middleware (block actions without consent)
- Immutable consent log (append-only)
- Acceptance: All data processing requires valid consent

**Issue #XX: Backend - Enhanced Audit Logging**
- Log all GDPR operations (export, deletion, consent)
- Cryptographic hashing for tamper detection
- Append-only table with check constraints
- Query endpoint for user's own audit log
- Admin endpoint for compliance reports
- Acceptance: All GDPR actions logged immutably

**Issue #XX: Backend - Rate Limiting & Security**
- Rate limit export API (max 1 request per hour per user)
- Rate limit deletion API (max 1 request per day per user)
- Require re-authentication for deletion
- Encrypted export files (AES-256)
- Secure download links (signed URLs, 7-day expiry)
- Acceptance: Export/deletion abuse prevented

**Issue #XX: Frontend - Privacy Dashboard**
- Privacy center page (React component)
- Display user's data summary (number of cases, documents, emails)
- Display last access timestamps
- Links to export, delete, consent pages
- Visual audit log (timeline of data access)
- Acceptance: User can navigate entire privacy workflow

**Issue #XX: Frontend - Data Export UI**
- "Export My Data" button
- Progress indicator (processing, ready, downloaded)
- Download link (expires in 7 days)
- Email notification when ready
- Error handling (export too large, timeout)
- Acceptance: User can initiate and download export

**Issue #XX: Frontend - Account Deletion UI**
- "Delete Account" button (confirmation required)
- Re-authentication modal (password confirmation)
- 30-day grace period explanation
- Undo link in confirmation email
- Final confirmation: "Are you absolutely sure?"
- Acceptance: User can delete account with safety nets

**Issue #XX: Frontend - Consent Manager**
- Consent preferences page
- Toggle switches for different data processing types
- Privacy policy display (versioned)
- Consent history (when granted, when withdrawn)
- Withdraw consent button (triggers deletion flow)
- Acceptance: User can manage consent granularly

**Issue #XX: Frontend - Privacy Policy Flow**
- Display policy during signup
- Require checkbox acceptance before account creation
- Version tracking (show which version user accepted)
- Notification banner for policy updates
- Acceptance: Cannot create account without accepting policy

**Issue #XX: Tests - GDPR Compliance Tests**
- Unit tests for export service (data completeness)
- Unit tests for deletion service (cascade logic)
- Integration test: Full export/download flow
- Integration test: Full deletion flow (soft + hard)
- Integration test: Retention policy processor
- E2E test: User privacy dashboard workflow
- Acceptance: >90% code coverage, all tests pass

**Issue #XX: Production Deployment Documentation**
- Deployment guide (step-by-step)
- Environment variables template (.env.production)
- Database backup/restore procedures (pg_dump, PITR)
- Docker production profile optimization
- Health check endpoints (/health, /health/db)
- Monitoring setup (Sentry integration)
- Acceptance: Production deployment completes successfully

### Estimated Effort

- Backend (GDPR services): 24 hours
- Backend (security + audit): 8 hours
- Frontend (privacy UI): 16 hours
- Tests (comprehensive coverage): 12 hours
- Deployment documentation: 8 hours
- **Total: 68 hours (~2 weeks for solo developer with AI assistant)**

## Acceptance Criteria

### Feature-Level Acceptance

**GDPR Compliance:**
- [ ] User can export all personal data in JSON format
- [ ] User can delete account with 30-day grace period
- [ ] Retention policy auto-flags cases older than 7 years
- [ ] User consent tracked for all data processing
- [ ] Privacy policy acceptance required for signup
- [ ] All GDPR operations logged immutably

**User Experience:**
- [ ] Export completes in <30 seconds for typical dataset
- [ ] Deletion requires re-authentication (password)
- [ ] Privacy dashboard shows data summary clearly
- [ ] Email notifications sent at each workflow step
- [ ] Swedish language support for all privacy UI

**Technical Quality:**
- [ ] All unit tests pass (>90% coverage)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Build succeeds with zero TypeScript errors
- [ ] No security vulnerabilities (npm audit clean)
- [ ] Rate limiting prevents export/deletion abuse

**Production Readiness:**
- [ ] Deployment guide complete and validated
- [ ] Environment variables documented
- [ ] Database backup procedure tested
- [ ] Health check endpoints operational
- [ ] Sentry error tracking configured
- [ ] Docker production profile optimized

**Code Quality:**
- [ ] Type-safe (no `any` types)
- [ ] No mocks in production code
- [ ] Proper error handling (try/catch, user-friendly messages)
- [ ] Tests cover critical paths (export, deletion, retention)
- [ ] Code reviewed and approved by supervisor

**Documentation:**
- [ ] Privacy policy published (legal review recommended)
- [ ] GDPR compliance checklist complete
- [ ] API endpoints documented (export, deletion, consent)
- [ ] Deployment guide tested on fresh server

## Dependencies

**Blocked By:**
- Epic 005: AI Document Generation (must complete first - GDPR applies to AI-generated data)

**Blocks:**
- Beta launch (Q1 2026) - Cannot launch without GDPR compliance
- Production deployment - Cannot go live without data protection features

**External Dependencies:**
- Legal review of privacy policy (recommended, not blocking)
- Swedish hosting provider (data residency requirement)

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Privacy policy legal issues | Medium | Critical | Use GDPR-compliant template, consider legal review before launch |
| Export performance for large datasets | Medium | High | Implement pagination, async processing, test with 10GB dataset |
| Deletion cascades break data integrity | Low | Critical | Comprehensive integration tests, transaction rollback on errors |
| Retention policy deletes wrong data | Low | Critical | Admin approval required, 7-day review period before deletion |
| Audit log tampering | Low | Critical | Cryptographic hashing, append-only constraints, regular integrity checks |

## Testing Strategy

### Unit Tests

**Export Service:**
- Data gathering from all tables (cases, documents, emails, calendar)
- JSON serialization preserves relationships
- ZIP encryption with correct algorithm (AES-256)
- Email notification triggered on completion

**Deletion Service:**
- Soft delete sets correct status and timestamp
- Hard delete cascades to all related tables
- Anonymization preserves case data structure
- Grace period undo restores account correctly

**Retention Processor:**
- Correctly identifies expired cases (7-year threshold)
- Skips cases flagged for extended retention
- Admin notification email sent with correct count

**Consent Service:**
- Consent log is immutable (append-only)
- Withdrawal triggers deletion flow
- Validation middleware blocks actions without consent

### Integration Tests

**Full Export Flow:**
1. User requests export → POST /api/gdpr/export
2. Background job processes request
3. ZIP file created with all user data
4. Email sent with download link
5. User downloads file (signed URL)
6. Export marked as downloaded
7. After 7 days, file deleted

**Full Deletion Flow:**
1. User requests deletion → POST /api/gdpr/delete
2. Account soft deleted (status: deletion_requested)
3. Email sent with undo link
4. After 30 days, hard delete triggered
5. All user data deleted/anonymized
6. Final confirmation email sent
7. User cannot log in

**Retention Policy:**
1. Cron job runs at 3 AM
2. Identifies cases older than 7 years
3. Flags cases for admin review
4. Admin approves bulk deletion
5. Background job deletes approved cases
6. Audit log entries created

### E2E Tests (Playwright)

**Privacy Dashboard Journey:**
1. User logs in → Navigate to "Privacy & Data"
2. View data summary (X cases, Y documents)
3. Click "Export My Data" → See progress indicator
4. Receive email with download link
5. Click link → Download ZIP file
6. Extract and verify data completeness

**Account Deletion Journey:**
1. User logs in → Navigate to "Privacy & Data"
2. Click "Delete Account" → Confirmation modal
3. Re-authenticate with password
4. Confirm deletion → See 30-day grace message
5. Receive email with undo link
6. (Optional) Click undo → Account restored
7. After 30 days → Account permanently deleted

### Manual Testing Checklist

**GDPR Workflows:**
- [ ] Export data as user with 500 cases (verify completeness)
- [ ] Export data as user with 10GB dataset (verify performance)
- [ ] Delete account → Verify 30-day grace period
- [ ] Delete account → Click undo link → Verify restoration
- [ ] Withdraw consent → Verify deletion flow triggered
- [ ] Privacy policy updated → Verify notification banner

**Production Deployment:**
- [ ] Deploy to staging environment
- [ ] Run database migrations (verify no data loss)
- [ ] Test health check endpoints
- [ ] Verify Sentry error tracking
- [ ] Test backup/restore procedure
- [ ] Load test export with 1000 concurrent requests

**Security:**
- [ ] Verify export files are encrypted (AES-256)
- [ ] Verify download links expire after 7 days
- [ ] Verify rate limiting blocks abuse (10 exports in 10 minutes)
- [ ] Verify deletion requires re-authentication
- [ ] Verify audit logs cannot be modified (append-only)

## Notes

### Design Decisions

**Why 30-day grace period for deletion?**
- Industry standard (Google, Microsoft, Apple use 30 days)
- Prevents accidental deletions (users often regret immediately)
- Allows recovery if account compromised
- Balance between user rights and safety

**Why JSON export format?**
- GDPR Article 20 requires "structured, commonly used, machine-readable format"
- JSON preserves relationships (cases → documents → emails)
- Widely supported by data analysis tools
- Future: Can add CSV export for non-technical users

**Why 7-year retention for cases?**
- Swedish social services law requires 7-10 year retention
- Configurable per organization (some may need 10 years)
- Admin can flag cases for extended retention (legal holds)

**Why cryptographic hashing for audit logs?**
- Detect tampering (hash mismatch = log modified)
- GDPR requires demonstrable data integrity
- Low performance overhead (<1ms per log entry)

### Known Limitations

**What this feature does NOT do:**
- Does not support real-time export (always async)
- Does not export data from external integrations (Google Drive, Calendar - only metadata)
- Does not provide automated legal compliance certification (requires audit)
- Does not handle cross-border data transfers (all data stays in EU)

### Future Enhancements

**Post-MVP (Phase 8+):**
- AI-powered PII detection and anonymization
- Granular consent management (per-feature opt-in/out)
- Data portability to other platforms (API integration)
- Blockchain-based audit logs (immutability guarantee)
- Real-time export (streaming response for small datasets)
- Self-service compliance reports (auto-generated GDPR documentation)

### References

**Legal:**
- GDPR Full Text: https://gdpr-info.eu/
- Article 15 (Right of Access): https://gdpr-info.eu/art-15-gdpr/
- Article 17 (Right to Erasure): https://gdpr-info.eu/art-17-gdpr/
- Article 20 (Right to Data Portability): https://gdpr-info.eu/art-20-gdpr/
- Swedish Data Protection Authority: https://www.imy.se/

**Technical:**
- ADR-001: PostgreSQL RLS Multi-Tenancy
- ADR-002: JWT Refresh Token Rotation
- PRD: consilio-prd-v1.0.md (Section 13: Security & Compliance)
- PostgreSQL Audit Logging Best Practices

**Implementation:**
- Backend: `/home/samuel/.archon/workspaces/consilio/backend/src/modules/gdpr/`
- Frontend: `/home/samuel/.archon/workspaces/consilio/frontend/src/pages/privacy/`
- Tests: `/home/samuel/.archon/workspaces/consilio/backend/tests/gdpr/`

---

**Epic Status:** Ready for implementation after Epic 005 completes
**Next Steps:** Create GitHub issues for each implementation task, assign to SCAR
**Estimated Completion:** 2026-01-31 (2 weeks from Epic 005 completion)
