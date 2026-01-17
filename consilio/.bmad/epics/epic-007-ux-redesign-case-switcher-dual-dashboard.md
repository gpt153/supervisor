# Epic 007: UX Redesign - Case Switcher + Dual Dashboard System

**Epic ID:** 007
**Created:** 2026-01-16
**Status:** Active
**Complexity Level:** 3

## Project Context

- **Project:** Consilio
- **Repository:** https://github.com/gpt153/consilio
- **Tech Stack:** Node.js, TypeScript, React, PostgreSQL, Tailwind CSS
- **Related Epics:** None (can start after Epic 005 fixes complete)
- **Workspace:** `/home/samuel/.archon/workspaces/consilio/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/consilio/`

## Business Context

### Problem Statement

Consilio currently uses a single-case-focused interface that forces consultants to navigate through multiple screens to switch between cases. This creates significant friction for users managing 15-30 cases simultaneously:

- **Time Loss:** 30-60 seconds per case switch (navigate → search → click)
- **Mental Load:** No visual indicators of which cases need attention
- **Context Loss:** Difficult to maintain awareness across multiple cases
- **Scattered Workflows:** AI approvals hidden in individual case modals

### User Value

This redesign transforms Consilio into a **multi-case management powerhouse** that:

1. **Saves Time:** Instant case switching via always-visible switcher bar
2. **Reduces Mental Load:** Visual badges show exactly what needs attention
3. **Improves Awareness:** Dual dashboard provides both aggregate and case-specific views
4. **Streamlines AI Workflow:** Centralized bulk approval queue for AI-generated content

**Target Users:** Foster care consultants managing 15-30 active cases
**Expected Impact:** 40% reduction in time spent navigating between cases

### Success Metrics

- **Case switching time:** < 2 seconds (currently 30-60 seconds)
- **User clicks to access urgent items:** < 3 clicks (currently 5-8 clicks)
- **AI approval time:** < 30 seconds for bulk operations (currently 2-3 minutes)
- **User satisfaction score:** > 4.5/5 for navigation experience
- **Mobile usability score:** Lighthouse score > 90

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Case Switcher Bar component with badge indicators (📧 emails, ⚠️ urgent, 🤖 AI pending)
- [ ] Main Dashboard showing aggregate view of all cases
- [ ] Case Dashboard showing individual case details
- [ ] Badge system with accurate counts (emails, urgent tasks, AI approvals)
- [ ] Responsive design (desktop → mobile)
- [ ] Case switcher state persistence across page navigation

**SHOULD HAVE:**
- [ ] Bulk AI approval workflow with "select multiple" functionality
- [ ] Badge color coding by urgency (red = <24h, orange = <48h, yellow = <7 days)
- [ ] Case search/filter in switcher dropdown
- [ ] Keyboard shortcuts for case switching (Alt+1, Alt+2, etc.)
- [ ] Loading states and skeleton screens during data fetch

**COULD HAVE:**
- [ ] Case pinning/favorites functionality
- [ ] Badge customization (show/hide specific badge types)
- [ ] Case grouping by consultant or case type
- [ ] Dark mode support for new components

**WON'T HAVE (this iteration):**
- Advanced filtering (by case status, date range) - deferred to Epic 008
- Case timeline visualization - requires separate planning
- Multi-select case operations (bulk actions) - complex state management
- Real-time badge updates via WebSocket - requires infrastructure work

### Non-Functional Requirements

**Performance:**
- Case switcher load time: < 100ms
- Badge count calculation: < 200ms per case
- Dashboard initial render: < 1 second
- Smooth animations (60fps) for case switching

**Accessibility:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation for all case switcher functions
- Screen reader announcements for badge updates
- Focus management when switching cases

**UX Consistency:**
- Match existing Consilio design system (colors, typography, spacing)
- Maintain current authentication/authorization patterns
- Preserve existing URL structure and routing logic

**Scalability:**
- Efficiently handle 30+ cases in switcher bar
- Paginate case list if exceeding viewport
- Optimize badge count queries with database indexing

## Architecture

### Technical Approach

**Pattern:** Component-based architecture with shared state management
**State Management:** React Context API for active case selection
**Styling:** Tailwind CSS with component-specific utility classes
**Data Fetching:** React Query for badge counts and dashboard data

### Integration Points

**Frontend Components:**
- New: `CaseSwitcherBar.tsx` (horizontal case tabs)
- New: `CaseButton.tsx` (individual case tab with badges)
- New: `BadgeIndicator.tsx` (reusable badge component)
- New: `MainDashboard.tsx` (aggregate view)
- New: `CaseDashboard.tsx` (per-case view)
- New: `BulkAIApprovalQueue.tsx` (centralized approval interface)
- Modified: `Layout.tsx` (add case switcher bar)
- Modified: `Header.tsx` (adjust for new layout)

**Backend API Endpoints:**
- New: `GET /api/cases/badge-counts` (fetch badge data for all cases)
- New: `GET /api/dashboard/main` (aggregate dashboard data)
- New: `GET /api/dashboard/case/:caseId` (case-specific dashboard data)
- New: `GET /api/ai-approvals/pending` (bulk AI approval queue)
- New: `POST /api/ai-approvals/bulk-approve` (approve multiple AI items)

**Database Schema:**
- Modified: Add indexes on `cases.unread_count`, `cases.urgent_count`, `cases.ai_pending_count`
- New: `case_badges` table for cached badge counts (optional optimization)

### Data Flow

```
User navigates to dashboard
  ↓
MainDashboard loads
  ↓
Fetch badge counts for all cases (GET /api/cases/badge-counts)
  ↓
CaseSwitcherBar renders with badge indicators
  ↓
User clicks case button
  ↓
Update active case in React Context
  ↓
CaseDashboard loads for selected case (GET /api/dashboard/case/:id)
  ↓
Display case-specific data
  ↓
Badge counts update on data changes (React Query invalidation)
```

### Key Technical Decisions

- **Decision 1:** Use React Context for active case state (see implementation notes below)
  - **Rationale:** Simple, lightweight, no external dependencies
  - **Alternative considered:** Zustand (overkill for single state value)

- **Decision 2:** Cache badge counts with React Query (5-minute stale time)
  - **Rationale:** Reduce database load, improve perceived performance
  - **Alternative considered:** Real-time WebSocket updates (too complex for MVP)

- **Decision 3:** Mobile uses dropdown selector instead of horizontal bar
  - **Rationale:** Limited screen width, better touch targets
  - **Alternative considered:** Swipeable carousel (confusing UX)

### Files to Create/Modify

```
frontend/src/
├── components/
│   ├── case-switcher/
│   │   ├── CaseSwitcherBar.tsx         # NEW - Main switcher component
│   │   ├── CaseButton.tsx              # NEW - Individual case tab
│   │   ├── BadgeIndicator.tsx          # NEW - Reusable badge UI
│   │   └── CaseSwitcherDropdown.tsx    # NEW - Mobile dropdown
│   ├── dashboard/
│   │   ├── MainDashboard.tsx           # NEW - Aggregate dashboard
│   │   ├── CaseDashboard.tsx           # NEW - Case-specific dashboard
│   │   ├── UrgentTasksWidget.tsx       # NEW - Main dashboard widget
│   │   ├── UpcomingEventsWidget.tsx    # NEW - Main dashboard widget
│   │   └── RecentEmailsWidget.tsx      # NEW - Main dashboard widget
│   └── ai-approvals/
│       ├── BulkAIApprovalQueue.tsx     # NEW - Bulk approval interface
│       ├── AIApprovalCard.tsx          # NEW - Individual approval item
│       └── ApprovalActions.tsx         # NEW - Approve/reject buttons
├── context/
│   └── ActiveCaseContext.tsx           # NEW - Active case state
├── hooks/
│   ├── useBadgeCounts.ts               # NEW - Fetch badge data
│   ├── useMainDashboard.ts             # NEW - Main dashboard data
│   └── useCaseDashboard.ts             # NEW - Case dashboard data
└── pages/
    ├── DashboardPage.tsx               # MODIFIED - Add case switcher
    └── CasePage.tsx                    # MODIFIED - Add case dashboard

backend/src/
├── api/
│   ├── cases/
│   │   └── badge-counts.ts             # NEW - Badge count endpoint
│   ├── dashboard/
│   │   ├── main.ts                     # NEW - Main dashboard endpoint
│   │   └── case.ts                     # NEW - Case dashboard endpoint
│   └── ai-approvals/
│       ├── pending.ts                  # NEW - Pending approvals endpoint
│       └── bulk-approve.ts             # NEW - Bulk approve endpoint
├── db/
│   ├── queries/
│   │   ├── badge-counts.ts             # NEW - Badge count queries
│   │   └── dashboard.ts                # NEW - Dashboard queries
│   └── migrations/
│       └── 009_badge_indexes.sql       # NEW - Add indexes
└── types/
    ├── badges.ts                       # NEW - Badge types
    └── dashboard.ts                    # NEW - Dashboard types

tests/
├── components/
│   └── case-switcher.test.tsx          # NEW - Component tests
└── e2e/
    └── case-switching.spec.ts          # NEW - E2E tests
```

## Implementation Tasks

### Breakdown into GitHub Issues (6 Phases)

---

#### **Issue 1: Phase 1 - Case Switcher Bar Component**

**Title:** Implement Case Switcher Bar with Badge Indicators

**Description:**
Create the always-visible horizontal case switcher bar that displays all active cases with badge indicators (📧 emails, ⚠️ urgent, 🤖 AI pending).

**Tasks:**
- Create `CaseSwitcherBar.tsx` component with horizontal layout
- Create `CaseButton.tsx` with active/inactive states
- Create `BadgeIndicator.tsx` with color-coded badges
- Create `CaseSwitcherDropdown.tsx` for mobile view
- Implement `ActiveCaseContext.tsx` for state management
- Add `useBadgeCounts.ts` hook for fetching badge data
- Create backend endpoint `GET /api/cases/badge-counts`
- Add database queries for badge counts
- Add database indexes on badge count fields
- Write unit tests for components
- Write integration tests for badge count API
- Verify accessibility (keyboard navigation, screen readers)

**Acceptance Criteria:**
- [ ] Case switcher bar visible on all pages below header
- [ ] Badge counts accurate for all 3 badge types
- [ ] Active case highlighted with blue border
- [ ] Click switches to selected case
- [ ] Mobile shows dropdown selector
- [ ] Keyboard shortcuts work (Alt+1, Alt+2, etc.)
- [ ] Screen reader announces case switches
- [ ] All tests pass

**Estimated Effort:** 2-3 days

---

#### **Issue 2: Phase 2 - Badge System Implementation**

**Title:** Implement Smart Badge System with Real-Time Counts

**Description:**
Build the backend logic and frontend display for badge indicators (📧 new emails, ⚠️ urgent tasks, 🤖 AI pending approvals) with accurate counts and color coding.

**Tasks:**
- Create `badge-counts.ts` query to calculate counts per case
- Implement caching strategy with React Query (5-minute stale time)
- Add color coding logic (red <24h, orange <48h, yellow <7 days)
- Implement badge display rules (hide 0, show 1-99, show "99+" for 100+)
- Add badge count invalidation on data changes
- Create `badges.ts` type definitions
- Write unit tests for badge calculation logic
- Write E2E tests for badge updates
- Optimize database queries with indexes

**Acceptance Criteria:**
- [ ] Badge counts accurate for all cases
- [ ] Color coding matches urgency levels
- [ ] "0" badges hidden, "99+" shown for 100+
- [ ] Badge counts update within 5 minutes of data changes
- [ ] No performance degradation with 30+ cases
- [ ] Database queries optimized (<200ms)
- [ ] All tests pass

**Estimated Effort:** 2 days

---

#### **Issue 3: Phase 3 - Main Dashboard Redesign**

**Title:** Create Main Dashboard with Aggregate View

**Description:**
Build the main dashboard (landing page) that shows aggregate data across all cases with widgets for urgent tasks, upcoming events, and recent emails.

**Tasks:**
- Create `MainDashboard.tsx` component with widget layout
- Create `UrgentTasksWidget.tsx` (sorted by urgency)
- Create `UpcomingEventsWidget.tsx` (next 7 days)
- Create `RecentEmailsWidget.tsx` (last 24 hours)
- Create backend endpoint `GET /api/dashboard/main`
- Implement `dashboard.ts` queries for aggregate data
- Add `useMainDashboard.ts` hook for data fetching
- Implement responsive grid layout (desktop 2-column, mobile 1-column)
- Add loading states and skeleton screens
- Write unit tests for dashboard components
- Write E2E tests for dashboard functionality

**Acceptance Criteria:**
- [ ] Main dashboard loads within 1 second
- [ ] Urgent tasks widget shows top 5 items
- [ ] Upcoming events widget shows next 7 days
- [ ] Recent emails widget shows last 24 hours
- [ ] Responsive layout works on mobile
- [ ] Loading states display during data fetch
- [ ] All widgets clickable to navigate to details
- [ ] All tests pass

**Estimated Effort:** 3 days

---

#### **Issue 4: Phase 4 - Case Dashboard Redesign**

**Title:** Create Case Dashboard with Per-Case Details

**Description:**
Build the case-specific dashboard that shows detailed information for the selected case (case switcher determines which case).

**Tasks:**
- Create `CaseDashboard.tsx` component with case-specific layout
- Create widgets: CaseOverview, CaseTimeline, CaseDocuments, CaseEmails
- Create backend endpoint `GET /api/dashboard/case/:caseId`
- Implement `dashboard.ts` queries for case-specific data
- Add `useCaseDashboard.ts` hook for data fetching
- Integrate with `ActiveCaseContext` to display selected case
- Add breadcrumb navigation (Home > Emma Andersson Case > Dashboard)
- Implement responsive layout
- Write unit tests for case dashboard components
- Write E2E tests for case navigation

**Acceptance Criteria:**
- [ ] Case dashboard loads within 1 second
- [ ] Dashboard displays data for active case from context
- [ ] All case-specific widgets render correctly
- [ ] Breadcrumb shows current case name
- [ ] Responsive layout works on mobile
- [ ] Navigation between cases preserves scroll position
- [ ] All tests pass

**Estimated Effort:** 3 days

---

#### **Issue 5: Phase 5 - Bulk AI Approval Workflow**

**Title:** Implement Centralized Bulk AI Approval Queue

**Description:**
Create a centralized interface for approving AI-generated content in bulk (approve one, select multiple, or approve all).

**Tasks:**
- Create `BulkAIApprovalQueue.tsx` component with list view
- Create `AIApprovalCard.tsx` for individual approval items
- Create `ApprovalActions.tsx` with approve/reject/select buttons
- Create backend endpoint `GET /api/ai-approvals/pending`
- Create backend endpoint `POST /api/ai-approvals/bulk-approve`
- Implement multi-select state management
- Add "Approve All" functionality with confirmation modal
- Add filtering by case (if on case dashboard)
- Update badge counts after approvals
- Write unit tests for approval components
- Write E2E tests for bulk approval workflow

**Acceptance Criteria:**
- [ ] Approval queue shows all pending AI items across cases
- [ ] User can select multiple items and approve in one click
- [ ] "Approve All" button shows confirmation modal
- [ ] Badge counts update immediately after approval
- [ ] Filtering works on case dashboard (show case-specific items)
- [ ] All tests pass

**Estimated Effort:** 2-3 days

---

#### **Issue 6: Phase 6 - Mobile Responsive Design**

**Title:** Implement Mobile Responsive Design for All Components

**Description:**
Ensure all new components (case switcher, dashboards, AI queue) work seamlessly on mobile devices with touch-friendly interactions.

**Tasks:**
- Convert case switcher bar to dropdown on mobile (<768px)
- Adjust dashboard layouts for single-column mobile view
- Optimize touch targets (min 48x48px)
- Add swipe gestures for case switching (optional enhancement)
- Test on real devices (iOS Safari, Android Chrome)
- Fix any layout issues or overflows
- Optimize images and assets for mobile
- Run Lighthouse mobile audit (target score >90)
- Write E2E tests on mobile viewport sizes

**Acceptance Criteria:**
- [ ] Case switcher dropdown works on mobile
- [ ] Dashboard layouts stack correctly on mobile
- [ ] All touch targets meet 48x48px minimum
- [ ] No horizontal scrolling on mobile
- [ ] Lighthouse mobile score >90
- [ ] Tested on iOS Safari and Android Chrome
- [ ] All mobile E2E tests pass

**Estimated Effort:** 2 days

---

### Total Estimated Effort

- Phase 1: 2-3 days
- Phase 2: 2 days
- Phase 3: 3 days
- Phase 4: 3 days
- Phase 5: 2-3 days
- Phase 6: 2 days

**Total: 14-16 days (~3 weeks)**

## Acceptance Criteria

### Feature-Level Acceptance

**Case Switcher Bar:**
- [ ] Visible on all pages below header
- [ ] Shows all active cases with accurate badge counts
- [ ] Active case highlighted with visual indicator
- [ ] Click switches to selected case instantly (<2s)
- [ ] Mobile shows dropdown selector with touch-friendly targets

**Badge System:**
- [ ] 📧 Email badge shows unread email count
- [ ] ⚠️ Urgent badge shows tasks due within 48 hours
- [ ] 🤖 AI Pending badge shows items awaiting approval
- [ ] Badge counts accurate and update within 5 minutes
- [ ] Color coding matches urgency (red/orange/yellow)

**Main Dashboard:**
- [ ] Shows aggregate view of all cases
- [ ] Urgent tasks widget displays top 5 items sorted by deadline
- [ ] Upcoming events widget shows next 7 days
- [ ] Recent emails widget shows last 24 hours
- [ ] Loads within 1 second

**Case Dashboard:**
- [ ] Shows case-specific details for active case
- [ ] Updates when switching cases via case switcher
- [ ] Breadcrumb shows current case name
- [ ] All widgets display correct case data

**Bulk AI Approval:**
- [ ] Shows all pending AI items across cases
- [ ] User can select multiple items and approve in one action
- [ ] "Approve All" button with confirmation modal
- [ ] Badge counts update after approvals

**Mobile Responsiveness:**
- [ ] All components work on mobile (<768px width)
- [ ] Touch targets meet accessibility standards (48x48px)
- [ ] No horizontal scrolling
- [ ] Lighthouse mobile score >90

### Code Quality

- [ ] Type-safe (no `any` types in new code)
- [ ] No console errors or warnings
- [ ] All components use TypeScript strict mode
- [ ] Unit tests cover >80% of new code
- [ ] E2E tests cover all critical user flows
- [ ] Code follows existing Consilio patterns
- [ ] All ESLint rules pass

### Documentation

- [ ] Component props documented with JSDoc comments
- [ ] API endpoints documented in OpenAPI spec
- [ ] README updated with new features
- [ ] Architecture decisions captured (if needed)

## Dependencies

**Blocked By:**
- None (can start immediately after Epic 005 fixes)

**Blocks:**
- Future epics requiring case context awareness
- Advanced filtering features (Epic 008 planning)

**External Dependencies:**
- None

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance with 30+ cases | Medium | High | Implement pagination, caching, database indexes |
| Mobile UX complexity | Medium | Medium | Start with simple dropdown, iterate based on feedback |
| Backend badge count queries slow | Low | High | Add database indexes early, optimize queries |
| React Context API state issues | Low | Medium | Thorough testing, consider Zustand if problems arise |

## Testing Strategy

### Unit Tests

**Frontend:**
- CaseSwitcherBar component rendering
- CaseButton active/inactive states
- BadgeIndicator color logic
- Badge count display rules (0, 1-99, 99+)

**Backend:**
- Badge count calculation logic
- Dashboard data aggregation
- Bulk approval logic

### Integration Tests

**API Tests:**
- `GET /api/cases/badge-counts` returns accurate data
- `GET /api/dashboard/main` aggregates correctly
- `GET /api/dashboard/case/:id` returns case-specific data
- `POST /api/ai-approvals/bulk-approve` updates badge counts

### E2E Tests (Playwright)

**Critical User Flows:**
1. User lands on main dashboard → sees case switcher with badges
2. User clicks case button → case dashboard loads with correct data
3. User clicks badge indicator → navigates to relevant section
4. User approves AI items in bulk → badge counts update
5. User switches cases → dashboard updates instantly
6. Mobile user opens dropdown → selects case → dashboard updates

### Manual Testing Checklist

- [ ] Case switcher visible on all pages
- [ ] Badge counts accurate for all cases
- [ ] Case switching works instantly
- [ ] Main dashboard shows aggregate data
- [ ] Case dashboard shows case-specific data
- [ ] Bulk AI approval workflow functional
- [ ] Mobile dropdown works on iOS Safari
- [ ] Mobile dropdown works on Android Chrome
- [ ] Keyboard shortcuts work (Alt+1, Alt+2)
- [ ] Screen reader announces case switches

## Notes

### Design Decisions

**Why React Context instead of Zustand?**
- Active case is a single global state value
- React Context is lightweight and built-in
- No need for external dependency for simple use case
- Can migrate to Zustand later if state complexity grows

**Why dropdown on mobile instead of swipeable carousel?**
- Dropdowns are familiar UX pattern
- Swipeable carousels can be confusing (conflict with page scrolling)
- Dropdowns allow case search/filter in future
- Better accessibility for screen readers

**Why cache badge counts with React Query?**
- Real-time WebSocket updates too complex for MVP
- 5-minute stale time balances freshness with performance
- User can manually refresh if needed
- Reduces database load significantly

### Known Limitations

**This epic does NOT include:**
- Real-time badge updates (requires WebSocket infrastructure)
- Advanced case filtering (by status, date range, consultant)
- Case timeline visualization (requires separate planning)
- Multi-select case operations (bulk actions across cases)
- Case pinning/favorites (could be added in future)

**Mobile limitations:**
- Dropdown selector instead of horizontal bar (space constraints)
- No swipe gestures (deferred to future iteration)

### Future Enhancements

**Post-MVP improvements:**
- Real-time badge updates via WebSocket
- Case pinning/favorites functionality
- Advanced filtering (by status, date, consultant)
- Case grouping (by consultant, case type, priority)
- Dark mode support
- Keyboard shortcuts customization
- Badge customization (show/hide specific types)
- Case timeline visualization

### References

- Design Specification: `.bmad/UX_REDESIGN_CASE_SWITCHER_DUAL_DASHBOARD.md`
- Visual Mockups: `.bmad/UX_MOCKUPS_CASE_SWITCHER_DUAL_DASHBOARD.md`
- Existing Consilio design system: `frontend/src/styles/`
- React Query documentation: https://tanstack.com/query/latest
