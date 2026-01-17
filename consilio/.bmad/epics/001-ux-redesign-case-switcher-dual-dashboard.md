# Epic 001: UX Redesign - Case Switcher + Dual Dashboard System

**Epic ID:** 001
**Created:** 2026-01-16
**Status:** Ready for Implementation
**Complexity Level:** 3 (Large - Multi-component system redesign)

## Project Context

- **Project:** Consilio (Swedish family home case management)
- **Repository:** https://github.com/gpt153/consilio
- **Tech Stack:** Next.js 14, TypeScript, React, PostgreSQL, Prisma, TailwindCSS, TipTap
- **Related Epics:** None (foundational UX improvement)
- **Workspace:** `/home/samuel/.archon/workspaces/consilio/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/consilio/`

## Business Context

### Problem Statement

Consultants managing 15-30 foster care cases simultaneously struggle with inefficient case switching (30-60 seconds per switch), lack of visibility into urgent items across cases, and scattered AI approval workflows. The current single-case-focused interface forces excessive navigation and context switching, reducing productivity and increasing cognitive load.

### User Value

This redesign transforms Consilio into a **multi-case management powerhouse** by:

1. **Instant Case Switching** - Always-visible horizontal bar with visual urgency badges (📧 emails, ⚠️ urgent tasks, 🤖 AI pending)
2. **Aggregate Dashboard** - Cross-case overview showing most urgent items, upcoming events, latest emails, and AI approval queue
3. **Dual Dashboard System** - Main Dashboard (all cases) + Case Dashboard (individual case details)
4. **Bulk AI Approval** - Centralized queue for reviewing/approving AI-generated content across all cases

**Time Saved:** 30-60 seconds per case switch → <2 seconds
**Mental Load:** Visual badges eliminate "what needs attention?" guesswork
**AI Workflow:** 50% faster with bulk approval actions

### Success Metrics

- Case switch time: <2 seconds (current: 30-60 seconds)
- Urgent item discovery: Instant (current: manual checking required)
- AI approval time: 50% reduction via bulk actions
- Mobile usage: 50%+ of consultants use mobile daily
- User satisfaction: "I can finally manage all my cases without losing track"

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**

- [ ] **Case Switcher Bar** - Horizontal scrollable bar showing all assigned cases with badges
  - [ ] Display case name (max 200px, truncate with ellipsis)
  - [ ] Show 3 badge types: 📧 New Emails (blue), ⚠️ Urgent (orange), 🤖 AI Pending (purple)
  - [ ] Badge counts: 0 (hide), 1-99 (show number), 100+ (show "99+")
  - [ ] Active case: Blue border + light blue background
  - [ ] Inactive case: Gray border + white background
  - [ ] Hover state: Light gray background
  - [ ] Mobile: Dropdown selector with current case + chevron
  - [ ] Desktop: Horizontal scroll with arrow indicators if overflowed

- [ ] **Main Dashboard (Aggregate View)** - Landing page showing cross-case data
  - [ ] ⚠️ MEST BRÅDSKANDE section: Top 5 most urgent items across all cases
    - Deadlines within 48 hours
    - Overdue tasks
    - High-priority emails (>3 unread from same person)
    - AI content >24h old pending approval
  - [ ] 📅 KOMMANDE HÄNDELSER section: Today + next 7 days events (max 5 shown)
  - [ ] 📧 SENASTE MEJL section: Latest emails from all cases (max 5 shown)
  - [ ] 🤖 AI-GENERERAT section: Pending AI approvals across all cases
    - Individual [Review] and [Approve] buttons
    - Checkbox selection for bulk actions
    - [Approve Selected (N)] button
    - [Approve All (N)] button with confirmation modal
  - [ ] 📊 MINA ÄRENDEN section: Quick stats (total cases, active, unread emails, overdue)

- [ ] **Case Dashboard (Per-Case View)** - Individual case details
  - [ ] Case header with child info, foster family, consultant, placement date
  - [ ] Quick actions: [Edit Case] [Generate Report] [Close Case]
  - [ ] ⚠️ BRÅDSKANDE I DETTA ÄRENDE: Urgent items for this case only (max 3-5)
  - [ ] 🤖 AI-GENERERAT: AI pending approvals for this case only (with bulk actions)
  - [ ] 📊 SNABBSTATISTIK: Email count, document count, days in care, last contact
  - [ ] Tab navigation: Översikt | Mejl | Dokument | Kalender | Tidslinje | Uppgifter

- [ ] **Breadcrumbs Navigation**
  - [ ] Structure: Home > [Case Name] > [Tab] > [Detail]
  - [ ] Home link → Main Dashboard
  - [ ] Case name → Case Dashboard (Översikt tab)
  - [ ] Mobile: Collapse to "Home > ... > Current Page"

- [ ] **Home Button (Consilio Logo)**
  - [ ] Top-left header, always visible
  - [ ] Click → Navigate to Main Dashboard
  - [ ] Tooltip: "Hem" (Home)

- [ ] **Badge Calculation System**
  - [ ] 📧 Email Badge: Count unread emails per case (`read: false`)
  - [ ] ⚠️ Urgent Badge: Count deadlines <48h + overdue tasks + high-priority items
  - [ ] 🤖 AI Pending Badge: Count documents with `status: 'PENDING_REVIEW'` and `ai_generated: true`
  - [ ] Real-time updates when new items added
  - [ ] Cache optimization via `case_badges` table (optional)

**SHOULD HAVE:**

- [ ] **User Settings for Case Switcher**
  - [ ] Max visible cases: Dropdown (3, 5, 6, 8, 10) - default 6
  - [ ] Sort by: Urgency (default) | Name | Recent | Manual
  - [ ] Pinned cases: Array of case IDs (always shown first)
  - [ ] Show badges toggle: Default true
  - [ ] Badge click behavior: Filter (default) | Navigate | Disabled
  - [ ] Settings stored in `users.settings.caseSwitcher` JSONB field

- [ ] **Badge Click Behavior - Filter Mode (Default)**
  - [ ] Click 📧3 → Show filtered view: "3 unread emails in [Case Name]"
  - [ ] Click ⚠️1 → Show: "1 urgent item in [Case Name]"
  - [ ] Click 🤖2 → Show: "2 AI items pending approval in [Case Name]"

- [ ] **Badge Click Behavior - Navigate Mode**
  - [ ] Click 📧3 → Navigate to case + open emails tab
  - [ ] Click ⚠️1 → Navigate to case + scroll to urgent section
  - [ ] Click 🤖2 → Navigate to case + open AI approval panel

- [ ] **AI Review Modal**
  - [ ] Case info: Name, case number
  - [ ] Generation metadata: Time ago, AI model, confidence %, time saved
  - [ ] Editable TipTap editor with Swedish markdown content
  - [ ] Actions: [Reject] [Save as Draft] [Approve & Add to Case]

- [ ] **Sorting Options for Case Switcher**
  - [ ] Urgency: Total badge count (📧 + ⚠️ + 🤖), highest first
  - [ ] Name: Alphabetical by child's name
  - [ ] Recent: Last updated case first
  - [ ] Manual: User drag-and-drop order (stored in settings)

**COULD HAVE:**

- [ ] Badge animations: Pulse effect when new urgent item appears
- [ ] Keyboard shortcuts: Ctrl+1-9 to switch cases
- [ ] Drag-to-reorder cases in manual sort mode
- [ ] Case switcher scroll position persistence
- [ ] Dashboard section collapse/expand states (stored in settings)
- [ ] Badge count animations when values change
- [ ] Tooltips showing badge details on hover

**WON'T HAVE (this iteration):**

- Social sharing of case data (privacy concerns, deferred to v2)
- Multi-tenant support (single organization only for MVP)
- Advanced filtering UI (simple badge click filtering sufficient)
- Case grouping/folders (manual pinning covers use case)
- Email threading/conversations (use existing email detail view)

### Non-Functional Requirements

**Performance:**
- Badge calculation: <100ms per case
- Main Dashboard load: <500ms with 20 cases
- Case switch: <200ms transition
- Scroll smoothness: 60fps (300ms smooth scroll animation)
- Database queries: Use indexes on `case_id`, `read`, `status`, `due_date`

**Security:**
- Badge counts respect organization_id filtering
- Only show cases assigned to current user
- AI approval requires authenticated session
- No sensitive data in badge tooltips

**Accessibility:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation: Tab through cases, Enter to select
- Screen reader support: Announce badge counts ("Emma Andersson, 3 unread emails, 1 urgent, 2 AI pending")
- Touch-friendly: Minimum 44px tap targets on mobile
- Color contrast: All badges meet 4.5:1 ratio

**Responsive Design:**
- Mobile (<640px): Dropdown case switcher, single-column dashboard
- Tablet (640-1024px): Scrollable case bar, 2-column dashboard
- Desktop (>1024px): Full horizontal case bar, multi-column dashboard
- Mobile breadcrumbs: Collapse to "Home > ... > Current"

**Scalability:**
- Case Switcher: Handle 30+ cases with smooth scrolling
- Badge cache table for 1000+ users
- Lazy load dashboard sections (pagination for "Visa alla")
- Database indexes for fast badge queries

## Architecture

### Technical Approach

**Pattern:** Component-based React architecture with server components for data fetching
**State Management:** React Context for active case, server state via Next.js App Router
**API Style:** Next.js API routes for badge calculation, REST for CRUD
**Database:** Prisma ORM with PostgreSQL, JSONB for user settings

### Integration Points

**Database Tables:**
- `cases` - Existing, add indexes
- `users` - Add `settings` JSONB field for case switcher config
- `emails` - Query for badge counts (index on `read`, `case_id`)
- `tasks` - Query for urgent badge (index on `due_date`, `status`)
- `documents` - Query for AI pending badge (index on `ai_generated`, `status`)
- `case_badges` (NEW, optional) - Cache table for badge counts

**Database Migrations:**
```sql
-- Add user settings JSONB field
ALTER TABLE users ADD COLUMN settings JSONB DEFAULT '{}';

-- Optional: Badge cache table
CREATE TABLE case_badges (
  case_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  emails_unread INT NOT NULL DEFAULT 0,
  urgent_count INT NOT NULL DEFAULT 0,
  ai_pending_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (case_id, user_id),
  FOREIGN KEY (case_id) REFERENCES cases(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for fast badge queries
CREATE INDEX idx_emails_case_read ON emails(case_id, read);
CREATE INDEX idx_tasks_due_status ON tasks(case_id, due_date, status);
CREATE INDEX idx_documents_ai_status ON documents(case_id, ai_generated, status);
```

**API Endpoints (NEW):**
- `GET /api/cases/badges?userId={id}` - Get badge counts for all assigned cases
- `GET /api/cases/badges/:caseId` - Get badge counts for specific case
- `GET /api/dashboard/urgent` - Aggregate urgent items across cases
- `GET /api/dashboard/events?days=7` - Upcoming events (today + N days)
- `GET /api/dashboard/emails?limit=5` - Latest emails across cases
- `GET /api/dashboard/ai-pending` - All AI pending approvals
- `POST /api/ai/approve-bulk` - Bulk approve AI content (body: `{ ids: string[] }`)
- `PATCH /api/users/settings` - Update user settings (case switcher config)

### Data Flow

```
CASE SWITCHER BAR:
User loads page → Next.js Server Component fetches assigned cases →
API calculates badges (emails_unread, urgent_count, ai_pending_count) →
Badge data returned → Case buttons rendered with badges →
User clicks case → Navigate to Case Dashboard

MAIN DASHBOARD:
User lands on dashboard → Parallel API calls:
  1. /api/dashboard/urgent (top 5 urgent items)
  2. /api/dashboard/events?days=7 (upcoming events)
  3. /api/dashboard/emails?limit=5 (latest emails)
  4. /api/dashboard/ai-pending (AI approval queue)
→ Sections render independently → User interacts

AI BULK APPROVAL:
User selects 3 items → Clicks [Approve Selected (3)] →
Confirmation modal shown → User confirms →
POST /api/ai/approve-bulk with { ids: [...] } →
Database updates: status = 'APPROVED' →
Real-time badge counts refresh → Success toast

BADGE CLICK (Filter Mode):
User clicks 📧3 badge on "Emma Andersson" →
Navigate to case + filter emails (read: false) →
Show filtered modal with 3 unread emails
```

### Key Technical Decisions

- **Decision 1:** Use JSONB for user settings instead of separate tables
  - **Rationale:** Flexible schema for evolving settings, reduces joins, Postgres JSONB is fast
- **Decision 2:** Optional badge cache table vs. real-time calculation
  - **Rationale:** Start with real-time queries + indexes, add cache if >1000 users show slow performance
- **Decision 3:** Server Components for dashboard data fetching (Next.js App Router)
  - **Rationale:** Faster initial page load, SEO-friendly, reduce client-side data fetching complexity

### Files to Create/Modify

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                    # MODIFY - Main Dashboard page
│   │   ├── components/
│   │   │   ├── UrgentSection.tsx       # NEW - ⚠️ MEST BRÅDSKANDE
│   │   │   ├── EventsSection.tsx       # NEW - 📅 KOMMANDE HÄNDELSER
│   │   │   ├── EmailsSection.tsx       # NEW - 📧 SENASTE MEJL
│   │   │   ├── AIApprovalSection.tsx   # NEW - 🤖 AI-GENERERAT
│   │   │   └── QuickStatsSection.tsx   # NEW - 📊 MINA ÄRENDEN
│   │   └── layout.tsx                  # MODIFY - Add Case Switcher Bar
│   ├── cases/
│   │   └── [caseId]/
│   │       ├── page.tsx                # MODIFY - Case Dashboard
│   │       ├── components/
│   │       │   ├── CaseHeader.tsx      # NEW - Case info header
│   │       │   ├── CaseUrgent.tsx      # NEW - Urgent for this case
│   │       │   ├── CaseAIApproval.tsx  # NEW - AI pending for this case
│   │       │   ├── CaseQuickStats.tsx  # NEW - Quick stats for case
│   │       │   └── CaseTabs.tsx        # MODIFY - Tab navigation
│   │       └── [tab]/page.tsx          # MODIFY - Tab content pages
│   └── api/
│       ├── cases/
│       │   └── badges/
│       │       ├── route.ts            # NEW - GET all badges
│       │       └── [caseId]/route.ts   # NEW - GET single case badges
│       ├── dashboard/
│       │   ├── urgent/route.ts         # NEW - Urgent items endpoint
│       │   ├── events/route.ts         # NEW - Upcoming events endpoint
│       │   ├── emails/route.ts         # NEW - Latest emails endpoint
│       │   └── ai-pending/route.ts     # NEW - AI approval queue endpoint
│       ├── ai/
│       │   └── approve-bulk/route.ts   # NEW - Bulk approve endpoint
│       └── users/
│           └── settings/route.ts       # NEW - Update user settings
├── components/
│   ├── CaseSwitcherBar/
│   │   ├── CaseSwitcherBar.tsx         # NEW - Main component
│   │   ├── CaseButton.tsx              # NEW - Individual case button
│   │   ├── Badge.tsx                   # NEW - Badge component (📧⚠️🤖)
│   │   ├── CaseDropdown.tsx            # NEW - Mobile dropdown variant
│   │   └── CaseSwitcherSettings.tsx    # NEW - Settings modal
│   ├── Breadcrumbs/
│   │   └── Breadcrumbs.tsx             # NEW - Navigation breadcrumbs
│   ├── AIApproval/
│   │   ├── AIApprovalItem.tsx          # NEW - Single approval item
│   │   ├── AIReviewModal.tsx           # NEW - Review modal with TipTap
│   │   └── BulkApprovalModal.tsx       # NEW - Confirmation modal
│   └── shared/
│       └── HomeButton.tsx              # NEW - Consilio logo/home link
├── lib/
│   ├── badges.ts                       # NEW - Badge calculation logic
│   ├── dashboard.ts                    # NEW - Dashboard data aggregation
│   └── settings.ts                     # NEW - User settings helpers
├── types/
│   ├── badges.ts                       # NEW - Badge types
│   ├── dashboard.ts                    # NEW - Dashboard section types
│   └── settings.ts                     # NEW - User settings types
└── styles/
    └── case-switcher.css               # NEW - Case switcher specific styles

prisma/
└── migrations/
    ├── XXX_add_user_settings.sql       # NEW - Add settings JSONB field
    ├── XXX_add_case_badges_table.sql   # NEW - Optional badge cache table
    └── XXX_add_badge_indexes.sql       # NEW - Performance indexes

tests/
├── unit/
│   ├── badges.test.ts                  # NEW - Badge calculation tests
│   └── settings.test.ts                # NEW - Settings helpers tests
├── integration/
│   ├── dashboard-api.test.ts           # NEW - Dashboard API tests
│   └── bulk-approval.test.ts           # NEW - Bulk approval tests
└── e2e/
    ├── case-switching.spec.ts          # NEW - Case switcher E2E tests
    ├── main-dashboard.spec.ts          # NEW - Main dashboard E2E tests
    └── ai-approval.spec.ts             # NEW - AI approval workflow tests
```

## Implementation Tasks

### Phase 1: Case Switcher Bar (Week 1)

**Issue #1: Database - User settings schema**
- Add `settings` JSONB column to `users` table
- Add indexes for badge queries (`emails`, `tasks`, `documents`)
- Create migration: `XXX_add_user_settings.sql`
- **Acceptance:** Migration runs successfully, `settings` field exists with default `{}`

**Issue #2: API - Badge calculation endpoints**
- Create `/api/cases/badges` route (GET all badges)
- Create `/api/cases/badges/[caseId]` route (GET single case badges)
- Implement badge calculation logic in `lib/badges.ts`:
  - `calculateEmailBadge(caseId)` - Count unread emails
  - `calculateUrgentBadge(caseId)` - Count deadlines <48h + overdue
  - `calculateAIPendingBadge(caseId)` - Count AI pending approvals
- **Acceptance:** API returns correct badge counts, response time <100ms per case

**Issue #3: Component - Badge component**
- Create `Badge.tsx` component with 3 variants (📧⚠️🤖)
- Props: `type`, `count`, `onClick`
- Color scheme: Blue (#3B82F6), Orange (#F59E0B), Purple (#8B5CF6)
- Hide badge when `count === 0`
- Show "99+" when `count >= 100`
- **Acceptance:** Badge renders with correct colors, handles all count ranges

**Issue #4: Component - CaseButton**
- Create `CaseButton.tsx` with case name + badges
- Max width 200px, ellipsis for long names
- Active state: Blue border + light blue background
- Inactive state: Gray border + white background
- Hover state: Light gray background
- **Acceptance:** Case button renders correctly, state transitions work

**Issue #5: Component - CaseSwitcherBar (Desktop)**
- Create `CaseSwitcherBar.tsx` horizontal scrollable container
- Fetch badge data from `/api/cases/badges`
- Render CaseButton components for all assigned cases
- Horizontal scroll with mouse wheel + click-drag
- Scroll indicators (`←` `→`) when overflowed
- **Acceptance:** Case switcher shows all cases, scrolling works smoothly

**Issue #6: Component - CaseDropdown (Mobile)**
- Create `CaseDropdown.tsx` dropdown variant for mobile (<640px)
- Show current case + chevron, expand on tap
- List all cases with badges, checkmark on active case
- [+] Browse All Cases link at bottom
- **Acceptance:** Dropdown works on mobile, shows all cases, switches correctly

**Issue #7: User Settings - Case switcher settings panel**
- Create `CaseSwitcherSettings.tsx` modal component
- Settings fields: maxVisible, sortBy, pinnedCases, showBadges, badgeClickBehavior
- Save to `PATCH /api/users/settings` endpoint
- **Acceptance:** Settings persist, case switcher respects all settings

### Phase 2: Main Dashboard (Week 1-2)

**Issue #8: API - Dashboard urgent items endpoint**
- Create `/api/dashboard/urgent` route
- Query deadlines <48h, overdue tasks, high-priority emails, old AI pending
- Sort by urgency score, return top 5
- **Acceptance:** Returns correct urgent items, sorted by priority

**Issue #9: API - Dashboard events endpoint**
- Create `/api/dashboard/events?days=7` route
- Query calendar events from all assigned cases
- Filter to today + next N days, sort chronologically
- **Acceptance:** Returns upcoming events from all cases, max 5 shown

**Issue #10: API - Dashboard emails endpoint**
- Create `/api/dashboard/emails?limit=5` route
- Query latest emails across all assigned cases
- Sort by received date (newest first)
- **Acceptance:** Returns latest emails with case info, correct format

**Issue #11: API - Dashboard AI pending endpoint**
- Create `/api/dashboard/ai-pending` route
- Query all AI-generated content with `status: 'PENDING_REVIEW'`
- Sort by generation date (oldest first = most urgent)
- **Acceptance:** Returns all pending AI items across cases

**Issue #12: Component - UrgentSection**
- Create `UrgentSection.tsx` for ⚠️ MEST BRÅDSKANDE
- Fetch data from `/api/dashboard/urgent`
- Display top 5 items with urgency icons (🔴🟠🔵🟣)
- "Visa alla (X)" link → Opens full urgent modal
- **Acceptance:** Section renders urgent items, link works

**Issue #13: Component - EventsSection**
- Create `EventsSection.tsx` for 📅 KOMMANDE HÄNDELSER
- Fetch data from `/api/dashboard/events`
- Display today + next 7 days events, max 5 shown
- "Visa alla (X)" link → Navigate to Calendar page
- **Acceptance:** Section renders events, link navigates correctly

**Issue #14: Component - EmailsSection**
- Create `EmailsSection.tsx` for 📧 SENASTE MEJL
- Fetch data from `/api/dashboard/emails`
- Format: `[Case Abbr.] Sender - Subject ... Time ago`
- "Visa alla (X)" link → Navigate to all emails view
- **Acceptance:** Section renders emails with case context

**Issue #15: Component - AIApprovalSection (Dashboard)**
- Create `AIApprovalSection.tsx` for 🤖 AI-GENERERAT
- Fetch data from `/api/dashboard/ai-pending`
- Checkbox for each item, [Review] [Approve] buttons
- [Approve Selected (N)] and [Approve All (N)] buttons
- **Acceptance:** Section renders AI items, checkboxes work

**Issue #16: Component - QuickStatsSection**
- Create `QuickStatsSection.tsx` for 📊 MINA ÄRENDEN
- Display: Total cases, Active, Unread emails, Overdue tasks
- Single-line stats bar
- **Acceptance:** Section renders quick stats correctly

**Issue #17: Page - Main Dashboard layout**
- Modify `app/dashboard/page.tsx` to use new sections
- Desktop: 2-column grid layout
- Mobile: Single column, stacked sections
- Add breadcrumbs: "🏠 Home"
- **Acceptance:** Dashboard page renders all sections, responsive design works

### Phase 3: Case Dashboard Redesign (Week 2)

**Issue #18: Component - CaseHeader**
- Create `CaseHeader.tsx` with child info, foster family, consultant, placement date
- Quick actions: [Edit Case] [Generate Report] [Close Case]
- **Acceptance:** Header displays all case info, action buttons work

**Issue #19: Component - CaseUrgent**
- Create `CaseUrgent.tsx` for ⚠️ BRÅDSKANDE I DETTA ÄRENDE
- Filter urgent items to current case only, max 3-5 shown
- **Acceptance:** Section shows case-specific urgent items

**Issue #20: Component - CaseAIApproval**
- Create `CaseAIApproval.tsx` for case-specific AI pending
- Same bulk approval UI as Main Dashboard
- Filter to current case only
- **Acceptance:** Section shows case AI items, bulk actions work

**Issue #21: Component - CaseQuickStats**
- Create `CaseQuickStats.tsx` for 📊 SNABBSTATISTIK
- Display: Email count (total + unread), Document count, Days in care
- **Acceptance:** Stats display correctly for case

**Issue #22: Component - CaseTabs**
- Modify `CaseTabs.tsx` for tab navigation
- Tabs: Översikt | Mejl | Dokument | Kalender | Tidslinje | Uppgifter
- Desktop: Horizontal tabs, Mobile: Dropdown/hamburger
- **Acceptance:** Tab navigation works, active tab highlighted

**Issue #23: Page - Case Dashboard layout**
- Modify `app/cases/[caseId]/page.tsx` to use new components
- Add CaseHeader, CaseUrgent, CaseAIApproval, CaseQuickStats
- Add CaseTabs below stats
- **Acceptance:** Case Dashboard renders with all new sections

### Phase 4: Breadcrumbs & Navigation (Week 2-3)

**Issue #24: Component - Breadcrumbs**
- Create `Breadcrumbs.tsx` component
- Structure: `Home > [Case Name] > [Tab] > [Detail]`
- Desktop: Full path, Mobile: Collapse to "Home > ... > Current"
- Home link → Main Dashboard
- **Acceptance:** Breadcrumbs render correctly, navigation works

**Issue #25: Component - HomeButton**
- Create `HomeButton.tsx` (Consilio logo)
- Top-left header, always visible
- Click → Navigate to Main Dashboard
- Tooltip: "Hem" (Home)
- **Acceptance:** Logo renders, click navigates to dashboard

**Issue #26: Layout - Global navigation state**
- Add breadcrumbs to all pages
- Add HomeButton to header
- Ensure back/forward browser buttons work
- **Acceptance:** Navigation state persists, browser buttons work

### Phase 5: AI Approval Workflow (Week 2-3)

**Issue #27: API - Bulk approve endpoint**
- Create `/api/ai/approve-bulk` POST route
- Body: `{ ids: string[] }`
- Update status to 'APPROVED' for all IDs
- Return success count
- **Acceptance:** Bulk approval works, database updates correctly

**Issue #28: Component - AIApprovalItem**
- Create `AIApprovalItem.tsx` single approval item
- Checkbox, title, metadata (time ago, confidence, time saved)
- [Review] [Approve] buttons
- **Acceptance:** Item renders correctly, buttons trigger actions

**Issue #29: Component - AIReviewModal**
- Create `AIReviewModal.tsx` preview modal
- Display case info, generation metadata
- Editable TipTap editor with content
- Actions: [Reject] [Save as Draft] [Approve & Add to Case]
- **Acceptance:** Modal shows content, editing works, actions save correctly

**Issue #30: Component - BulkApprovalModal**
- Create `BulkApprovalModal.tsx` confirmation modal
- Show: "Godkänn X AI-genererade objekt?"
- List items to approve (type, case, time saved)
- Total time saved calculation
- [Avbryt] [Ja, godkänn alla]
- **Acceptance:** Modal confirms action, calls bulk API on confirm

**Issue #31: Integration - Real-time badge updates**
- Update badge counts after approval actions
- Optimistic UI updates (remove from list immediately)
- Show success toast: "X items approved ✓"
- **Acceptance:** Badges refresh after approval, UI updates optimistically

### Phase 6: Mobile Responsive & Polish (Week 3)

**Issue #32: Responsive - Mobile case switcher dropdown**
- Ensure CaseDropdown works on all mobile devices
- Touch-friendly: 44px minimum tap targets
- Smooth animations (300ms transitions)
- **Acceptance:** Dropdown works on iOS/Android, no layout issues

**Issue #33: Responsive - Mobile dashboard stacking**
- Main Dashboard: Single column layout on mobile
- Section spacing: 16px between, 24px padding
- Buttons: Full width on mobile
- **Acceptance:** Dashboard readable on mobile, no horizontal scroll

**Issue #34: Responsive - Mobile breadcrumb collapse**
- Breadcrumbs: Show "Home > ... > Current" on mobile
- First and last 1-2 crumbs only
- **Acceptance:** Breadcrumbs don't wrap on small screens

**Issue #35: Responsive - Touch-friendly interactions**
- All buttons: Minimum 44px height
- Badge tap targets: 32px minimum
- Hover states converted to active states on mobile
- **Acceptance:** All interactions work on touch devices

**Issue #36: Performance - Badge cache table (optional)**
- Create `case_badges` table migration (if needed)
- Implement cache update triggers/jobs
- Fallback to real-time calculation if cache stale
- **Acceptance:** Badge queries <50ms with cache enabled

**Issue #37: Accessibility - Keyboard navigation**
- Case switcher: Tab through cases, Enter to select
- Dashboard sections: Tab order logical
- Modals: Focus trap, Esc to close
- **Acceptance:** All interactions work keyboard-only

**Issue #38: Accessibility - Screen reader support**
- Badge announcements: "Emma Andersson, 3 unread emails, 1 urgent, 2 AI pending"
- ARIA labels on all interactive elements
- Landmark regions for dashboard sections
- **Acceptance:** Screen reader announces content correctly

**Issue #39: Polish - Animations & transitions**
- Case switch: 300ms smooth transition
- Badge updates: Fade in/out animations
- Scroll indicators: Slide in/out
- Modal open/close: Fade + slide animations
- **Acceptance:** Animations smooth (60fps), no janky scrolling

**Issue #40: Documentation - User guide & API docs**
- User guide: How to use Case Switcher, Dashboard, AI Approval
- API documentation: All new endpoints with examples
- Environment variables: None needed (uses existing auth)
- **Acceptance:** Docs cover all new features, API examples work

### Estimated Effort

- **Phase 1 (Case Switcher Bar):** 16-20 hours
- **Phase 2 (Main Dashboard):** 20-24 hours
- **Phase 3 (Case Dashboard Redesign):** 12-16 hours
- **Phase 4 (Breadcrumbs & Navigation):** 8-10 hours
- **Phase 5 (AI Approval Workflow):** 16-20 hours
- **Phase 6 (Mobile & Polish):** 12-16 hours
- **Testing (All Phases):** 16-20 hours
- **Total:** 100-126 hours (~2.5-3 weeks with full focus)

## Acceptance Criteria

**Feature-Level Acceptance:**

- [ ] **Case Switcher Bar works on desktop and mobile**
  - [ ] Shows all assigned cases with correct badge counts
  - [ ] Active case highlighted with blue border
  - [ ] Horizontal scroll works smoothly with indicators
  - [ ] Mobile dropdown expands/collapses correctly
  - [ ] Case click navigates to Case Dashboard

- [ ] **Badge System calculates correctly**
  - [ ] 📧 Email badge shows unread count (hides when 0)
  - [ ] ⚠️ Urgent badge shows deadlines <48h + overdue (hides when 0)
  - [ ] 🤖 AI Pending badge shows pending approvals (hides when 0)
  - [ ] Badge counts update in real-time after actions
  - [ ] "99+" shown for counts >= 100

- [ ] **Main Dashboard displays aggregate data**
  - [ ] ⚠️ MEST BRÅDSKANDE shows top 5 urgent items across cases
  - [ ] 📅 KOMMANDE HÄNDELSER shows today + next 7 days events
  - [ ] 📧 SENASTE MEJL shows latest 5 emails with case context
  - [ ] 🤖 AI-GENERERAT shows all pending approvals with bulk actions
  - [ ] 📊 MINA ÄRENDEN shows quick stats (total cases, active, unread, overdue)

- [ ] **Case Dashboard shows per-case details**
  - [ ] Case header displays child info, foster family, consultant, placement date
  - [ ] ⚠️ BRÅDSKANDE shows urgent items for this case only
  - [ ] 🤖 AI-GENERERAT shows AI pending for this case with bulk actions
  - [ ] 📊 SNABBSTATISTIK shows email/document counts, days in care
  - [ ] Tab navigation works (Översikt, Mejl, Dokument, etc.)

- [ ] **AI Approval Workflow works**
  - [ ] Individual [Review] button opens modal with editable content
  - [ ] Individual [Approve] button approves item (with confirm)
  - [ ] Checkbox selection enables [Approve Selected (N)] button
  - [ ] [Approve All (N)] button opens confirmation modal
  - [ ] Bulk approval updates database and refreshes badges
  - [ ] Success toast shows after approval: "X items approved ✓"

- [ ] **Navigation & Breadcrumbs work**
  - [ ] Home button (logo) navigates to Main Dashboard
  - [ ] Breadcrumbs show correct path: Home > Case > Tab > Detail
  - [ ] Breadcrumb links navigate correctly
  - [ ] Mobile breadcrumbs collapse to "Home > ... > Current"
  - [ ] Browser back/forward buttons work

- [ ] **User Settings persist**
  - [ ] Case switcher settings save to database
  - [ ] Max visible cases respected (3, 5, 6, 8, 10)
  - [ ] Sort order works (Urgency, Name, Recent, Manual)
  - [ ] Pinned cases always shown first
  - [ ] Badge click behavior (Filter/Navigate/Disabled) works

**Code Quality:**

- [ ] Type-safe: No `any` types in new code
- [ ] Tests pass: Unit tests for badge calculation, integration tests for APIs
- [ ] E2E tests pass: Case switching, dashboard, AI approval workflows
- [ ] Build succeeds: Zero TypeScript errors
- [ ] No console errors in browser
- [ ] Performance: Badge queries <100ms, dashboard load <500ms
- [ ] Accessibility: Lighthouse score >90, keyboard navigation works
- [ ] No security vulnerabilities: `npm audit` clean
- [ ] No mocks in production code

**Documentation:**

- [ ] API endpoints documented with examples
- [ ] User guide covers new features (Case Switcher, Dashboard, AI Approval)
- [ ] Component README explains usage
- [ ] Architecture decisions recorded (ADRs for settings storage, badge calculation)

## Dependencies

**Blocked By:**
- None (foundational UX redesign, no dependencies)

**Blocks:**
- Future: Advanced filtering system (needs Case Switcher as base)
- Future: Case grouping/folders (needs Case Switcher as base)
- Future: Multi-tenant support (needs user settings system)

**External Dependencies:**
- None (uses existing tech stack: Next.js, Prisma, PostgreSQL, TipTap)

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Badge calculation slow with 30+ cases | Medium | High | Start with real-time + indexes, add cache table if needed (Issue #36) |
| Mobile layout breaks on small screens | Low | Medium | Test on real devices early, use minimum 320px width |
| AI bulk approval fails for large selections | Low | High | Add client-side validation (max 50 items), chunked API calls if needed |
| User settings JSONB schema evolves | Medium | Low | Use versioned schema, add migration logic for old settings |
| Breadcrumb navigation confusing | Low | Medium | User testing in week 2, iterate based on feedback |
| Accessibility issues with badges | Medium | High | Test with screen reader early (Issue #38), fix before Phase 6 |

## Testing Strategy

### Unit Tests

- Badge calculation logic (`lib/badges.ts`):
  - `calculateEmailBadge()` returns correct count
  - `calculateUrgentBadge()` includes deadlines + overdue
  - `calculateAIPendingBadge()` filters by status
  - Badge counts respect organization_id
- User settings helpers (`lib/settings.ts`):
  - Settings persist to database
  - Settings merge with defaults correctly
  - Pinned cases array handles empty/invalid IDs

### Integration Tests

- Dashboard API endpoints:
  - `/api/dashboard/urgent` returns top 5 items
  - `/api/dashboard/events?days=7` filters correctly
  - `/api/dashboard/emails?limit=5` returns latest
  - `/api/dashboard/ai-pending` filters by status
- Badge API endpoints:
  - `/api/cases/badges` returns all assigned cases
  - `/api/cases/badges/[caseId]` returns single case
  - Badge counts match database queries
- Bulk approval API:
  - `/api/ai/approve-bulk` updates all IDs
  - Returns correct success count
  - Rejects invalid IDs

### E2E Tests (Playwright)

- **Case Switching Flow:**
  - [ ] User clicks case in Case Switcher → Navigates to Case Dashboard
  - [ ] Mobile dropdown expands → User selects case → Navigates correctly
  - [ ] Badge click (Filter mode) → Shows filtered modal with items
  - [ ] Badge click (Navigate mode) → Navigates to case + opens tab
  - [ ] Pinned cases always appear first

- **Main Dashboard Flow:**
  - [ ] User lands on dashboard → All sections load (Urgent, Events, Emails, AI)
  - [ ] "Visa alla" links navigate to correct pages
  - [ ] Quick stats display correct counts
  - [ ] Home button click returns to dashboard

- **AI Approval Flow:**
  - [ ] User clicks [Review] → Modal opens with editable content
  - [ ] User clicks [Approve] → Item approved, removed from list
  - [ ] User selects 3 items → [Approve Selected (3)] enabled
  - [ ] User clicks [Approve All (5)] → Confirmation modal shown
  - [ ] User confirms → All items approved, badges update, toast shown

### Manual Testing Checklist

- [ ] **Desktop (1920x1080):**
  - [ ] Case Switcher shows 6 cases, scrolls smoothly
  - [ ] All dashboard sections load within 500ms
  - [ ] AI approval workflow (individual + bulk) works
  - [ ] Breadcrumbs show full path

- [ ] **Tablet (768x1024):**
  - [ ] Case Switcher scrolls horizontally
  - [ ] Dashboard sections in 2-column layout
  - [ ] Touch interactions work (44px tap targets)

- [ ] **Mobile (375x667):**
  - [ ] Case dropdown works, shows all cases
  - [ ] Dashboard sections stack in single column
  - [ ] Breadcrumbs collapse to "Home > ... > Current"
  - [ ] All buttons full width, easy to tap

- [ ] **Keyboard Navigation:**
  - [ ] Tab through Case Switcher cases
  - [ ] Enter selects case
  - [ ] Tab through dashboard sections
  - [ ] Esc closes modals

- [ ] **Screen Reader (NVDA/VoiceOver):**
  - [ ] Badge counts announced correctly
  - [ ] Dashboard sections have landmarks
  - [ ] Buttons have descriptive labels
  - [ ] Modals focus trap works

- [ ] **Performance:**
  - [ ] Badge calculation <100ms per case
  - [ ] Main Dashboard load <500ms with 20 cases
  - [ ] Case switch transition <200ms
  - [ ] Scroll at 60fps (no jank)

## Notes

### Design Decisions

**Why JSONB for user settings instead of separate tables?**
- Flexible schema for evolving settings (add new fields without migrations)
- Reduces joins (settings colocated with user record)
- PostgreSQL JSONB is fast with indexes
- Avoids over-engineering for ~20 settings fields

**Why optional badge cache table?**
- Start simple: Real-time queries with indexes
- Add cache only if >1000 users show slow performance
- Avoids premature optimization
- Cache can be added in Phase 6 (Issue #36) if needed

**Why Server Components for dashboard data?**
- Faster initial page load (data fetched on server)
- SEO-friendly (though not critical for authenticated app)
- Reduces client-side data fetching complexity
- Leverages Next.js 14 App Router best practices

**Why breadcrumbs instead of just back button?**
- Shows user their location in navigation hierarchy
- Allows jumping to any level (not just previous page)
- Industry standard for multi-level navigation
- Improves discoverability of Main Dashboard (Home link)

### Known Limitations

- **Badge counts not real-time** - Refresh on page load, not WebSocket updates (acceptable for MVP)
- **Max 30 cases in Case Switcher** - Performance degrades beyond ~50 cases (pagination not implemented)
- **No case grouping/folders** - User must rely on pinning and sorting (deferred to v2)
- **Bulk approval max 50 items** - Client-side validation prevents selecting >50 (UI performance)
- **Mobile breadcrumbs collapsed** - Full path not shown on small screens (acceptable trade-off)

### Future Enhancements

- **Real-time badge updates:** WebSocket connection for instant badge count changes
- **Case grouping/folders:** Organize cases into custom folders (e.g., "High Priority", "New Cases")
- **Advanced filtering:** Multi-filter UI (by status, foster family, consultant, date range)
- **Keyboard shortcuts:** Ctrl+1-9 to switch cases, Ctrl+H for Home
- **Badge animations:** Pulse effect when new urgent item appears
- **Dashboard widgets:** Customizable dashboard with drag-and-drop sections
- **Multi-tenant support:** Isolate data for multiple organizations in same database
- **Email threading:** Show conversation threads in email list
- **Calendar integration:** Sync with Outlook/Google Calendar
- **Mobile app:** Native iOS/Android app using same API

### References

- **Specifications:** `.bmad/UX_REDESIGN_CASE_SWITCHER_DUAL_DASHBOARD.md`
- **Mockups:** `.bmad/UX_MOCKUPS_CASE_SWITCHER_DUAL_DASHBOARD.md`
- **Architecture:** Existing Consilio architecture (Next.js + Prisma + PostgreSQL)

---

**Status:** ✅ Ready for Implementation
**Estimated Completion:** 2.5-3 weeks (100-126 hours)
**Complexity Level:** 3 (Large)
