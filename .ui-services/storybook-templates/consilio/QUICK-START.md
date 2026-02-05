# Quick Start - Complete Consilio Layout

## Immediate Access

**Storybook is RUNNING**: http://localhost:6006/

### View the Complete Layout
1. Open http://localhost:6006/ in your browser
2. In the left sidebar, navigate to: **Complete > ConsilioLayout**
3. Select any story to view different states

## What You'll See

A **perfect**, **gap-free**, **border-free** Consilio layout with:
- ✅ Case filing tabs in top bar (no gap below)
- ✅ Vertical sidebar tabs (no gap to right, connects to main)
- ✅ Horizontal navigation tabs (no gaps, no borders)
- ✅ Main content area (seamless connection)
- ✅ Everything stays fixed when scrolling
- ✅ Perfect colors: Active (#f9fafb), Inactive (#e5e7eb), Inputs (#ffffff)

## File Locations

### Component Files
```
/home/samuel/supervisor/.ui-services/storybook-templates/consilio/src/
├── components/
│   ├── CompleteConsilioLayout.tsx  (Main component - 300+ lines)
│   └── CompleteConsilioLayout.css  (All styles - 400+ lines)
└── stories/
    └── CompleteConsilioLayout.stories.tsx  (11 stories - 300+ lines)
```

### Documentation
```
/home/samuel/supervisor/.ui-services/storybook-templates/consilio/
├── COMPLETE-LAYOUT-README.md    (Full documentation)
├── DESIGN-FIXES-SUMMARY.md      (Before/After comparison)
└── QUICK-START.md               (This file)
```

## Available Stories (11 Total)

1. **Default** - Basic layout with 5 cases
2. **WithDashboard** - Dashboard tab active
3. **WithEmergencyCase** - Case with high badge counts
4. **WithEmailTab** - Email view
5. **WithDocumentsTab** - Documents view
6. **WithTimelineTab** - Timeline view
7. **WithManyCases** - 10 cases for scrolling test
8. **ScrollableContent** - Long content to test fixed positioning
9. **WithCleanCase** - Case with no badges
10. **WithCustomContent** - Custom children example
11. **AllTabsShowcase** - All navigation tabs demo

## Try These Actions

### In Storybook
- ✅ Click different case tabs → See active case change
- ✅ Click navigation tabs → See content view change
- ✅ Scroll down → See all elements stay fixed
- ✅ Switch stories → See different states instantly
- ✅ Resize browser → See responsive behavior

### Test Specific Fixes
- ✅ **Gap test**: Look at connection between case tabs and nav tabs (no gap)
- ✅ **Border test**: Look at connection between sidebar and main content (no border)
- ✅ **Alignment test**: Case tabs align to bottom, sidebar tabs align to right
- ✅ **Color test**: Active tabs are off-white (#f9fafb), inactive are gray (#e5e7eb)
- ✅ **Fixed test**: Scroll page, all bars stay in place

## Making Changes

### To Adjust Component Logic
```bash
# Edit the component
nano /home/samuel/supervisor/.ui-services/storybook-templates/consilio/src/components/CompleteConsilioLayout.tsx

# Storybook will hot-reload automatically
# View changes immediately at http://localhost:6006/
```

### To Adjust Styles
```bash
# Edit the CSS
nano /home/samuel/supervisor/.ui-services/storybook-templates/consilio/src/components/CompleteConsilioLayout.css

# Changes appear immediately (hot reload)
```

### To Add/Modify Stories
```bash
# Edit stories
nano /home/samuel/supervisor/.ui-services/storybook-templates/consilio/src/stories/CompleteConsilioLayout.stories.tsx

# Changes appear immediately
```

## Key CSS Variables (Easy to Adjust)

Located at top of `CompleteConsilioLayout.css`:

```css
:root {
  /* COLORS - Change these to adjust entire theme */
  --consilio-active: #f9fafb;       /* Active tabs */
  --consilio-inactive: #e5e7eb;     /* Inactive tabs */
  --consilio-main-bg: #f9fafb;      /* Content background */
  --consilio-input-bg: #ffffff;     /* Input fields */
  --consilio-border: #d1d5db;       /* Borders */
  --consilio-text-active: #111827;  /* Active text */
  --consilio-text-inactive: #374151; /* Inactive text */

  /* DIMENSIONS - Change these to adjust layout */
  --topbar-height: 64px;
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 64px;
  --nav-tabs-height: 48px;
}
```

## Integration Checklist

When ready to move this to Consilio main app:

### 1. Copy Component Structure
- [ ] Copy layout logic from `CompleteConsilioLayout.tsx`
- [ ] Adapt to use React Router for navigation
- [ ] Connect to real case data from API
- [ ] Connect to authentication context

### 2. Copy Styles
- [ ] Copy CSS from `CompleteConsilioLayout.css`
- [ ] Merge CSS variables with existing theme
- [ ] Update component classnames if needed

### 3. Update Existing Components
- [ ] Update `TopBar.tsx` with new case tab styling
- [ ] Update `SideMenu.tsx` with new sidebar tab styling
- [ ] Update `CaseDetailPage.tsx` with new layout
- [ ] Update `AppLayout.tsx` if needed

### 4. Test Integration
- [ ] Verify all routes work
- [ ] Test case switching
- [ ] Test tab navigation
- [ ] Test responsiveness
- [ ] Test scroll behavior
- [ ] Test data loading

## Troubleshooting

### Storybook Not Running?
```bash
# Start Storybook
cd /home/samuel/supervisor/.ui-services/storybook-templates/consilio
npm run storybook
```

### Need to Restart Storybook?
```bash
# Kill Storybook
pkill -f "storybook dev -p 6006"

# Start fresh
cd /home/samuel/supervisor/.ui-services/storybook-templates/consilio
npm run storybook
```

### Component Not Showing?
1. Check browser console for errors
2. Verify files exist (see File Locations above)
3. Restart Storybook
4. Clear browser cache

## What Makes This Different

### Previous Iterations
- Had gaps between elements
- Had visible borders at connection points
- Approximate alignment
- Mixed testing with main app

### This Implementation
- ✅ ZERO gaps (pixel-perfect alignment)
- ✅ ZERO borders at connection points
- ✅ Exact alignment (flex + position strategies)
- ✅ Isolated testing (Storybook only)
- ✅ Easy iteration (hot reload)
- ✅ Comprehensive examples (11 stories)

## Next Steps

### Immediate
1. **Open Storybook**: http://localhost:6006/
2. **Navigate to**: Complete > ConsilioLayout
3. **Review all stories**: Test each of the 11 stories
4. **Verify fixes**: Check gaps, borders, alignment, colors

### Short Term
1. **Iterate if needed**: Make any adjustments
2. **Test thoroughly**: All stories, all interactions
3. **Document changes**: Update stories if modified

### Long Term
1. **Plan integration**: Decide when to move to main app
2. **Prepare Consilio**: Update existing components
3. **Integrate**: Copy code, test, deploy
4. **Archive Storybook**: Keep for future reference

## Support

### Documentation
- **COMPLETE-LAYOUT-README.md** - Full component documentation
- **DESIGN-FIXES-SUMMARY.md** - Before/After comparison with technical details

### Component Structure
```typescript
<CompleteConsilioLayout
  cases={mockCases}                    // Array of case objects
  badgeData={mockBadgeData}            // Badge counts per case
  initialActiveCaseId="1"              // Which case starts active
  initialActiveTab="oversikt"          // Which tab starts active
>
  {children}                           // Optional custom content
</CompleteConsilioLayout>
```

### Key Props
- `cases`: Case[] - List of cases to show in top bar
- `badgeData`: BadgeData[] - Badge counts for each case
- `initialActiveCaseId`: string - ID of initially active case
- `initialActiveTab`: string - ID of initially active navigation tab
- `children`: ReactNode - Optional custom content (replaces default)

## Success Criteria

✅ **No gaps** - Elements connect seamlessly
✅ **No borders** - Connection points have no visible borders
✅ **Perfect alignment** - Tabs align to their edges
✅ **Consistent colors** - Variables ensure consistency
✅ **Fixed positioning** - All bars stay in place on scroll
✅ **Working interactions** - Clicking tabs works
✅ **11 stories** - Comprehensive examples
✅ **Easy iteration** - Hot reload for instant feedback

---

**Status**: ✅ Complete and ready for review
**Access**: http://localhost:6006/
**Location**: Complete > ConsilioLayout in Storybook sidebar
**Created**: 2026-02-05
