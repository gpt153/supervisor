# UX Redesign: Case Switcher Bar + Dual Dashboard System

**Date:** 2026-01-15
**Status:** Design Specification (Not Yet Implemented)
**Priority:** P1 - High Impact UX Improvement

---

## 🎯 Executive Summary

This redesign transforms Consilio from a single-case-focused interface to a **multi-case management powerhouse** designed for consultants managing 15-30 cases simultaneously.

### Key Features
1. **Case Switcher Bar** - Always-visible horizontal bar for instant case switching
2. **Dual Dashboard System** - Main Dashboard (aggregate) + Case Dashboard (per-case)
3. **Smart Badge Indicators** - Visual urgency signals (emails, urgent tasks, AI approvals)
4. **Bulk AI Approval** - Approve one, select multiple, or approve all AI-generated content

### User Impact
- **Time Saved:** 30-60 seconds per case switch (was: navigate → search → click)
- **Mental Load:** Visual badges eliminate "what needs attention?" guesswork
- **Context Switching:** Instant jump between cases without losing place
- **AI Workflow:** Centralized approval queue instead of scattered modals

---

## 📱 Layout Overview

### Global Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Logo] Sidebar Nav                                    [Profile] [Notif] │ ← Header
├─────────────────────────────────────────────────────────────────────────┤
│ [Emma Andersson 📧3⚠️1🤖2] [Liam Berg 📧0⚠️0🤖1] [Sofia...] [+]       │ ← Case Switcher
├─────────────────────────────────────────────────────────────────────────┤
│ Home > Emma Andersson Case > Emails                                     │ ← Breadcrumbs
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                       Main Content Area                                  │
│                   (Dashboard or Case View)                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Case Switcher Bar

### Visual Design

**Desktop:**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ [Case: Emma Andersson 📧3 ⚠️1 🤖2] [Case: Liam Berg 📧0 ⚠️0 🤖1] [+More] │
│  └─ Active (highlighted)                                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────────────────────────┐
│ [Emma Andersson 📧3⚠️1🤖2] ▼         │ ← Dropdown selector
│                                       │
│ When expanded:                        │
│ ┌─────────────────────────────────┐  │
│ │ ✓ Emma Andersson 📧3⚠️1🤖2     │  │
│ │   Liam Berg      📧0⚠️0🤖1     │  │
│ │   Sofia Nilsson  📧1⚠️2🤖0     │  │
│ │   [+] Browse All Cases          │  │
│ └─────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Component Specifications

**Case Button:**
- **Layout:** `[Case Name] [Badge1] [Badge2] [Badge3]`
- **Max Width:** 200px (ellipsis if longer: "Emma Anderss...")
- **Height:** 48px
- **Padding:** 12px horizontal, 8px vertical
- **Border Radius:** 8px
- **Active State:** Blue border (2px), light blue background
- **Inactive State:** Gray border (1px), white background
- **Hover State:** Light gray background

**Badge Specifications:**

| Badge | Icon | Color | Meaning | Max Value |
|-------|------|-------|---------|-----------|
| 📧 New Emails | Envelope | Blue #3B82F6 | Unread emails/messages | 99+ |
| ⚠️ Urgent | Alert Triangle | Orange #F59E0B | Deadlines <48h, overdue | 99+ |
| 🤖 AI Pending | Sparkles | Purple #8B5CF6 | AI content awaiting approval | 99+ |

**Badge Display Rules:**
- `0` → Hide badge (don't show "0")
- `1-9` → Show number
- `10-99` → Show number
- `100+` → Show "99+"

**Scrolling Behavior:**
- Desktop: Horizontal scroll (mouse wheel or click-drag)
- Scroll indicators: `←` and `→` arrows if overflowed
- Smooth scroll animation (300ms)

**[+] Button:**
- Label: "+" or "More" or "All Cases"
- Opens: Case list/browser modal
- Position: Always visible at right end

### User Settings (Configurable)

All these settings stored in `user.settings.caseSwitcher` JSONB field:

```typescript
{
  "caseSwitcher": {
    "maxVisible": 6,              // How many cases visible before scroll
    "sortBy": "urgency",          // "urgency" | "name" | "recent" | "manual"
    "pinnedCases": ["case-id-1"], // Array of pinned case IDs (always first)
    "showBadges": true,           // Toggle badge visibility
    "badgeClickBehavior": "filter" // "filter" | "navigate" | "disabled"
  }
}
```

**Settings UI (in User Profile):**
```
Case Switcher Settings
┌─────────────────────────────────────┐
│ Max visible cases: [6 ▼]           │ ← Dropdown: 3, 5, 6, 8, 10
│ Sort by: [Urgency ▼]               │ ← Dropdown
│ Badge click behavior: [Filter ▼]   │ ← What happens when clicking badge
│ Show badges: [✓]                   │ ← Toggle
│                                     │
│ Pinned Cases:                       │
│ • Emma Andersson      [Unpin]      │
│ • Liam Berg          [Unpin]      │
│ [+ Pin a Case]                     │
└─────────────────────────────────────┘
```

### Badge Click Behavior

**Option 1: Filter (Default)**
- Click 📧3 → Shows filtered view: "3 unread emails in Emma Andersson case"
- Click ⚠️1 → Shows: "1 urgent item in Emma Andersson case"
- Click 🤖2 → Shows: "2 AI items pending approval in Emma Andersson case"

**Option 2: Navigate**
- Click 📧3 → Navigates to case + opens emails tab
- Click ⚠️1 → Navigates to case + scrolls to urgent section
- Click 🤖2 → Navigates to case + opens AI approval panel

**Option 3: Disabled**
- Clicking badge does nothing (only case name clickable)

### Sorting Options

| Sort By | Logic |
|---------|-------|
| **Urgency** (Default) | Total badge count (📧 + ⚠️ + 🤖), highest first |
| **Name** | Alphabetical by child's name |
| **Recent** | Last updated case first |
| **Manual** | User-defined drag-and-drop order |

**Pinned cases always appear first, then sorted cases.**

---

## 2. Main Dashboard (Aggregate View)

### When to Show
- User logs in (default landing page)
- User clicks Consilio logo (Home button)
- User clicks "Home" in breadcrumbs

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🏠 Dashboard - Mitt Översikt                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ⚠️ MEST BRÅDSKANDE (Across All Cases)                                  │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ [!] Månadsrapport deadline - Emma Andersson         Imorgon     │   │
│ │ [!] Handledningsbesök - Liam Berg                   På fredag   │   │
│ │ [!] Föräldrasamtal - Sofia Nilsson                  Idag 14:00  │   │
│ │ [!] 5 unread emails from foster families           Just nu     │   │
│ │                                              [Visa alla (12)] →  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ 📅 KOMMANDE HÄNDELSER (Today + Next 7 Days)                             │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ • Idag 14:00 - Föräldrasamtal (Sofia Nilsson case)             │   │
│ │ • Imorgon 10:00 - Skolbesök (Emma Andersson case)              │   │
│ │ • Fredag 15:00 - Handledning (Liam Berg case)                  │   │
│ │                                              [Visa alla (8)] →   │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ 📧 SENASTE MEJL (From All Active Cases)                                 │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ [Emma A.]  Anna Svensson - Re: Skolbesök...        2h sedan    │   │
│ │ [Liam B.]  Maria Berg - Hur mår Liam?              5h sedan    │   │
│ │ [Sofia N.] Socialsekreterare - Månadsrapport       1 dag sedan │   │
│ │                                              [Visa alla (23)] →  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ 🤖 AI-GENERERAT (Väntar på godkännande - All Cases)                     │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ [☐] Månadsrapport - Emma Andersson          [Review] [Approve] │   │
│ │ [☐] Email reply - Liam Berg                 [Review] [Approve] │   │
│ │ [☐] Journalanteckning - Sofia Nilsson       [Review] [Approve] │   │
│ │                                                                  │   │
│ │ [Approve Selected (0)] [Approve All (3)]                        │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ 📊 MINA ÄRENDEN (Quick Stats)                                           │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Total cases: 18  |  Active: 15  |  Unread emails: 23  |  Overdue: 2│
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Section Specifications

#### 1. ⚠️ MEST BRÅDSKANDE (Most Urgent)

**Data Sources:**
- Deadlines within 48 hours (månadsrapporter, meetings, reports)
- Overdue tasks
- High-priority emails (>3 unread from same person/case)
- AI-generated content >24h old (needs approval)

**Logic:**
```typescript
urgentItems = [
  ...deadlinesWithin48Hours,
  ...overdueTasks,
  ...highPriorityEmails,
  ...oldPendingAIContent
].sortBy('urgency_score').slice(0, 5)
```

**Display:**
- Max 5 items shown
- "Visa alla (X)" link → Opens full urgent list modal
- Click item → Navigate to that case + item

#### 2. 📅 KOMMANDE HÄNDELSER (Upcoming Events)

**Data Sources:**
- Calendar events from all assigned cases
- Today + Next 7 days
- Sorted chronologically

**Display:**
- Max 5 events shown
- "Visa alla (X)" link → Navigate to Calendar page
- Click event → Navigate to that case + event detail

#### 3. 📧 SENASTE MEJL (Latest Emails)

**Data Sources:**
- All emails from assigned cases
- Sorted by received date (newest first)

**Display:**
- Max 5 emails shown
- Format: `[Case Abbreviation] Sender - Subject ... Time ago`
- "Visa alla (X)" link → Navigate to all emails view
- Click email → Navigate to that case + email detail

#### 4. 🤖 AI-GENERERAT (AI Pending Approval)

**Data Sources:**
- All AI-generated content with status = 'PENDING_REVIEW'
- Documents, email replies, calendar events
- Sorted by generation date (oldest first = most urgent)

**Display:**
- Checkbox for each item
- [Review] button → Opens preview modal
- [Approve] button → Immediately approves (no modal)
- [Approve Selected (N)] → Bulk approve checked items
- [Approve All (N)] → Approve everything in list

**Approval Workflow:**
```
User checks 2 items → [Approve Selected (2)] becomes active
User clicks [Approve Selected (2)] →
  Confirmation modal: "Approve 2 AI-generated items?"
  [Cancel] [Confirm]
User confirms →
  Items marked as APPROVED
  Success toast: "2 items approved ✓"
  Items removed from list
```

#### 5. 📊 MINA ÄRENDEN (My Cases - Quick Stats)

**Data Sources:**
- Count of all assigned cases (total, active, inactive)
- Total unread emails across all cases
- Total overdue tasks

**Display:**
- Single-line stats bar
- Click stat → Filters to show relevant items

---

## 3. Case Dashboard (Per-Case View)

### When to Show
- User clicks a case in Case Switcher Bar
- User navigates to case from search/list

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Case Switcher Bar [Emma Andersson highlighted]                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Home > Emma Andersson Case                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 👧 Emma Andersson (8 år) - Case #2024-123                               │
│ Familjehem: Svensson family  |  Konsulent: You  |  Start: 2024-03-15   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ⚠️ BRÅDSKANDE I DETTA ÄRENDE                                            │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ [!] Månadsrapport deadline              Imorgon                 │   │
│ │ [!] 3 olästa mejl från familjehemmet    Just nu                │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ 🤖 AI-GENERERAT (Väntar på ditt godkännande)                            │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ [☐] Månadsrapport (genererad 1h sedan)  [Review] [Approve]     │   │
│ │ [☐] Mejlsvar till Anna Svensson         [Review] [Approve]     │   │
│ │                                                                  │   │
│ │ [Approve Selected (0)] [Approve All (2)]                        │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ 📊 SNABBSTATISTIK                                                       │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Mejl: 47 (3 olästa)  |  Dokument: 12  |  Dagar i vård: 234      │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ [TABS: Översikt | Mejl | Dokument | Kalender | Tidslinje | Uppgifter]  │
│                                                                          │
│ ┌─── TAB CONTENT ────────────────────────────────────────────────────┐ │
│ │                                                                     │ │
│ │  (Content depends on selected tab)                                 │ │
│ │                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Sections

#### Header (Case Info)
- Child name, age, case number
- Foster family name
- Assigned consultant
- Placement start date
- Quick actions: [Edit Case] [Generate Report] [Close Case]

#### ⚠️ BRÅDSKANDE I DETTA ÄRENDE (Urgent for This Case)
- Same logic as Main Dashboard, but filtered to this case only
- Max 3-5 items

#### 🤖 AI-GENERERAT (AI Pending - This Case Only)
- Filtered to this case
- Same approval UI (checkboxes, bulk actions)

#### 📊 SNABBSTATISTIK (Quick Stats - This Case)
- Email count (total + unread)
- Document count
- Days in care
- Maybe: Last contact date, Next deadline

#### Tabs
- **Översikt** (Overview) - Default tab, shows sections above
- **Mejl** (Emails) - Email list + EmailDetail
- **Dokument** (Documents) - Document list + generation buttons
- **Kalender** (Calendar) - Events for this case
- **Tidslinje** (Timeline) - Chronological case activity
- **Uppgifter** (Tasks) - Task list for this case

---

## 4. Breadcrumbs

### Structure

```
Home > Emma Andersson Case > Mejl > Email from Anna Svensson
 │      │                     │       │
 ↓      ↓                     ↓       ↓
Main   Case                  Tab     Detail
Dash   Dash                  View    View
```

### Behavior
- **Home** (Consilio logo) → Main Dashboard
- **Case Name** → Case Dashboard (Översikt tab)
- **Tab Name** → That tab in case dashboard
- **Detail** → Current detail view (not clickable)

### Mobile
- Collapse to: `Home > ... > Email from Anna Svensson`
- Show only first and last 1-2 crumbs

---

## 5. Home Button (Consilio Logo)

### Placement
- Top-left corner of header (before sidebar nav)
- Always visible on all pages

### Behavior
- Click logo → Navigate to Main Dashboard
- Tooltip: "Hem" (Home)

### Visual
- Consilio logo/wordmark
- 48px height recommended
- White/transparent background

---

## 6. AI Approval Queue

### Approval Actions

#### Individual Approval
```
[☐] Månadsrapport - Emma Andersson    [Review] [Approve]
     └─ Click [Review] → Opens preview modal
     └─ Click [Approve] → Immediate approval (with confirm)
```

#### Bulk Selection
```
[☑] Månadsrapport - Emma Andersson    [Review] [Approve]
[☑] Email reply - Liam Berg           [Review] [Approve]
[☐] Journalanteckning - Sofia N.      [Review] [Approve]

[Approve Selected (2)]  ← Only selected items
[Approve All (3)]       ← All items in list
```

#### Approve All Confirmation
```
┌─────────────────────────────────────────┐
│ Godkänn alla AI-genererade objekt?     │
│                                         │
│ Du är på väg att godkänna:             │
│ • 2 månadsrapporter                     │
│ • 3 mejlsvar                            │
│ • 1 journalanteckning                   │
│                                         │
│ Total: 6 objekt                         │
│                                         │
│ [Avbryt]  [Ja, godkänn alla]           │
└─────────────────────────────────────────┘
```

### Review Modal

```
┌──────────────────────────────────────────────────────────────┐
│ Review AI-Generated Månadsrapport                        [×] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Case: Emma Andersson                                         │
│ Generated: 2 hours ago                                       │
│ Confidence: 85% (High)                                       │
│ Time saved: ~45 minutes                                      │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ [Editable TipTap Editor with Swedish markdown content] │  │
│ │                                                         │  │
│ │ Månadsrapport för Emma Andersson                       │  │
│ │ Period: December 2025                                  │  │
│ │                                                         │  │
│ │ Sammanfattning:                                        │  │
│ │ Emma har haft en stabil månad...                       │  │
│ │                                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                               │
│ [Reject]  [Save as Draft]  [Approve & Add to Case]          │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Mobile Responsive Design

### Case Switcher
- **Desktop:** Horizontal scrollable bar
- **Mobile:** Dropdown selector (current case + chevron)

### Main Dashboard
- **Desktop:** 2-column grid (Urgent + Events | Emails + AI)
- **Mobile:** Single column, stacked sections

### Case Dashboard
- **Desktop:** Tabs horizontal
- **Mobile:** Tabs as dropdown or hamburger menu

### Breadcrumbs
- **Desktop:** Full path
- **Mobile:** `Home > ... > Current Page`

---

## 8. Badge Calculation Logic

### 📧 New Emails Badge

```typescript
function calculateEmailBadge(caseId: string): number {
  const unreadEmails = await prisma.email.count({
    where: {
      case_id: caseId,
      read: false,
      organization_id: currentUser.organizationId
    }
  });

  return Math.min(unreadEmails, 99); // Max 99
}
```

### ⚠️ Urgent Badge

```typescript
function calculateUrgentBadge(caseId: string): number {
  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const urgentCount = await Promise.all([
    // Deadlines within 48 hours
    prisma.task.count({
      where: {
        case_id: caseId,
        due_date: { lte: in48Hours, gte: now },
        status: 'PENDING'
      }
    }),

    // Overdue tasks
    prisma.task.count({
      where: {
        case_id: caseId,
        due_date: { lt: now },
        status: 'PENDING'
      }
    }),

    // High-priority items
    // Add more urgent criteria as needed
  ]);

  const total = urgentCount.reduce((a, b) => a + b, 0);
  return Math.min(total, 99);
}
```

### 🤖 AI Pending Badge

```typescript
function calculateAIPendingBadge(caseId: string): number {
  const pendingAI = await prisma.document.count({
    where: {
      case_id: caseId,
      ai_generated: true,
      status: 'PENDING_REVIEW',
      organization_id: currentUser.organizationId
    }
  });

  // Could also include email replies, calendar events pending

  return Math.min(pendingAI, 99);
}
```

---

## 9. Database Changes Required

### User Settings

Add to existing `users.settings` JSONB field:

```json
{
  "caseSwitcher": {
    "maxVisible": 6,
    "sortBy": "urgency",
    "pinnedCases": ["case-id-1", "case-id-2"],
    "showBadges": true,
    "badgeClickBehavior": "filter"
  },
  "dashboard": {
    "defaultView": "main",
    "sectionsCollapsed": {
      "urgent": false,
      "calendar": false,
      "emails": false,
      "ai": false
    }
  }
}
```

### Badge Cache (Optional Optimization)

Create new table for badge counts (updated via triggers or scheduled jobs):

```sql
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
```

---

## 10. Implementation Phases

### Phase 1: Case Switcher Bar (Week 1)
- [ ] Create CaseSwitcherBar component
- [ ] Badge calculation API endpoints
- [ ] User settings for case switcher
- [ ] Desktop responsive design
- [ ] Mobile dropdown variant

### Phase 2: Main Dashboard (Week 1-2)
- [ ] Aggregate data queries (urgent, emails, AI pending)
- [ ] Main Dashboard component
- [ ] Section components (Urgent, Calendar, Emails, AI, Stats)
- [ ] "Approve All" / "Approve Selected" functionality

### Phase 3: Case Dashboard Redesign (Week 2)
- [ ] Refactor existing Case Detail page
- [ ] Add per-case urgent section
- [ ] Add per-case AI approval section
- [ ] Add quick stats bar
- [ ] Tab navigation

### Phase 4: Breadcrumbs & Navigation (Week 2-3)
- [ ] Breadcrumb component
- [ ] Home button (logo click)
- [ ] Navigation state management
- [ ] Back/forward browser support

### Phase 5: Mobile Responsive (Week 3)
- [ ] Mobile case switcher dropdown
- [ ] Mobile dashboard stacking
- [ ] Mobile breadcrumb collapse
- [ ] Touch-friendly buttons (48px minimum)

### Phase 6: User Settings UI (Week 3)
- [ ] Case switcher settings panel
- [ ] Dashboard settings panel
- [ ] Pinned cases management
- [ ] Settings persistence

---

## 11. Success Metrics

### Quantitative
- **Case switch time:** <2 seconds (was: 30-60 seconds)
- **Urgent item discovery:** Instant (was: manual checking)
- **AI approval time:** 50% faster (bulk actions)
- **Mobile usage:** 50%+ of consultants use mobile daily

### Qualitative
- **User Feedback:** "I can finally manage all my cases without losing track"
- **Cognitive Load:** Visual badges reduce "what do I need to do?" anxiety
- **Workflow:** "The AI approval queue is brilliant - I review everything in 5 minutes"

---

## 12. Open Questions

1. **Default sort for case switcher?** Urgency or alphabetical?
2. **Max badge count?** 99 or 9+ (to save space)?
3. **Badge animations?** Pulse effect when new urgent item appears?
4. **Keyboard shortcuts?** Ctrl+1-9 to switch cases?
5. **Drag-to-reorder cases?** In manual sort mode?

---

## 13. Next Steps

1. **Review this design doc** - Get user feedback and approval
2. **Create mockups/wireframes** - Visual representation (Figma?)
3. **Create Epic in GitHub** - Break into 20-30 implementation issues
4. **Assign to SCAR** - Phase 1 (Case Switcher Bar) first
5. **Iterate based on user testing** - Test with Anna and other consultants

---

**Status:** ✅ Design Complete - Awaiting Approval
**Next:** Create visual mockups or proceed to Epic creation?
