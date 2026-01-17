# Sleep Quiz Save Issue - User 8191393299

**Issue Date:** 2026-01-16
**User:** 8191393299
**Severity:** Medium (user can save, but doesn't see gamification feedback)

---

## Problem Statement

User 8191393299 reported being "unable to save sleep quiz results" after manually starting the quiz with `/sleep_quiz` command and completing all questions.

---

## Investigation Summary

### Initial Hypothesis
- Database constraint violation (missing user record, foreign key issues)
- Permission errors in memory system
- Database connection failures
- Conversation handler timeout

### Tests Performed

1. **User Existence Check**
   - ✅ User 8191393299 exists in database
   - ✅ User has sleep_quiz_settings configured
   - ✅ User is active with premium tier

2. **Database Save Test**
   - ✅ Created test sleep entry for user 8191393299
   - ✅ `save_sleep_entry()` works correctly
   - ✅ Entry saved to database successfully

3. **Full Flow Test (Entry + Gamification)**
   - ✅ Sleep entry saves successfully
   - ❌ Gamification system throws SQL error
   - ⚠️ Gamification error is caught and returns empty result
   - ✅ User sees summary message (but without gamification details)

### Root Cause Found

The issue is **NOT** that the sleep entry can't be saved. The sleep entry **DOES save successfully**.

The real problem is in the **gamification system**:

**File:** `/home/samuel/.archon/workspaces/health-agent/src/db/queries.py`
**Line:** 3024
**Function:** `get_user_streak()`

```python
await cur.execute(
    """
    SELECT id, user_id, streak_type, source_id, current_streak, best_streak,
           last_activity_date, freeze_days_remaining, created_at, updated_at
    FROM user_streaks
    WHERE user_id = %s AND streak_type = %s AND (source_id = %s OR (source_id IS NULL AND %s IS NULL))
    """,
    (user_id, streak_type, source_id, source_id)
)
```

**SQL Error:**
```
psycopg.errors.IndeterminateDatatype: could not determine data type of parameter $4
```

**Why This Happens:**
- When `source_id` is `None` in Python, psycopg sends `NULL` to PostgreSQL
- The SQL query has `AND %s IS NULL` (parameter $4)
- PostgreSQL cannot determine what data type `NULL` should be in this context
- The query fails with "could not determine data type" error

**Error Flow:**
1. User completes sleep quiz
2. Sleep entry is saved successfully to database ✅
3. Gamification system is called
4. XP is awarded successfully ✅
5. Streak system is called
6. `get_user_streak()` throws SQL error ❌
7. Error is caught in `handle_sleep_quiz_gamification()` try/except
8. Gamification returns empty result: `{'xp_awarded': 0, 'streak_updated': False, ...}`
9. User sees summary message **without** gamification details
10. User thinks save failed because they don't see XP/streak/level up

---

## Impact Assessment

**Severity:** Medium

**Why Not Critical:**
- Sleep entry **IS** saved correctly
- User data is not lost
- Only gamification feedback is missing

**User Experience Impact:**
- User sees sleep summary (bedtime, wake time, quality, etc.)
- User does NOT see XP awarded, streak updates, or achievements
- User may think the save failed (confusion, not data loss)
- User receives incomplete feedback about their progress

**Affected Users:**
- All users who complete sleep quiz
- Issue affects 100% of sleep quiz completions
- However, many users may not notice missing gamification if they're focused on sleep data

---

## Fix Required

### Solution

Fix the SQL query to handle `NULL` parameters properly. Two options:

**Option 1: Use COALESCE**
```sql
WHERE user_id = %s
  AND streak_type = %s
  AND (source_id = %s OR (source_id IS NULL AND %s::text IS NULL))
```

**Option 2: Split into separate conditions**
```sql
WHERE user_id = %s
  AND streak_type = %s
  AND (
    (%s IS NOT NULL AND source_id = %s)
    OR (%s IS NULL AND source_id IS NULL)
  )
```

**Option 3: Use CASE statement (most robust)**
```sql
WHERE user_id = %s
  AND streak_type = %s
  AND CASE
    WHEN %s::uuid IS NULL THEN source_id IS NULL
    ELSE source_id = %s
  END
```

**Recommended:** Option 1 (simplest, works with psycopg's type inference)

### Implementation

Change line 3024 in `/home/samuel/.archon/workspaces/health-agent/src/db/queries.py`:

```python
await cur.execute(
    """
    SELECT id, user_id, streak_type, source_id, current_streak, best_streak,
           last_activity_date, freeze_days_remaining, created_at, updated_at
    FROM user_streaks
    WHERE user_id = %s AND streak_type = %s AND (source_id = %s OR (source_id IS NULL AND %s::text IS NULL))
    """,
    (user_id, streak_type, source_id, source_id)
)
```

### Testing

1. Complete sleep quiz as user 8191393299
2. Verify sleep entry saves ✅
3. Verify gamification processes without error ✅
4. Verify streak is created/updated ✅
5. Verify user sees XP and streak message ✅

---

## Prevention Measures

### Code Review Checklist
- [ ] All SQL queries with `NULL` parameters use explicit type casts
- [ ] All gamification functions have try/except error handling
- [ ] All gamification errors return safe empty results
- [ ] User-facing messages handle missing gamification gracefully

### Monitoring
- Add logging for gamification errors
- Track gamification success rate per feature
- Alert if gamification failure rate > 5%

### Testing
- Add integration test for sleep quiz with gamification
- Test with `source_id=None` and `source_id=<uuid>` cases
- Verify error handling returns safe results

---

## Files Affected

**Primary Fix:**
- `/home/samuel/.archon/workspaces/health-agent/src/db/queries.py` (line 3024)

**Related Files (context only, no changes):**
- `/home/samuel/.archon/workspaces/health-agent/src/handlers/sleep_quiz.py` (works correctly)
- `/home/samuel/.archon/workspaces/health-agent/src/gamification/integrations.py` (error handling works)
- `/home/samuel/.archon/workspaces/health-agent/src/gamification/streak_system.py` (calls broken function)

---

## Test Results

### Before Fix
```
INFO: Saved sleep entry for user 8191393299 ✅
INFO: Awarded 20 XP to user 8191393299 ✅
ERROR: Error in sleep quiz gamification: could not determine data type of parameter $4 ❌
INFO: Gamification processed: {'xp_awarded': 0, 'streak_updated': False, ...} ⚠️
```

### Expected After Fix
```
INFO: Saved sleep entry for user 8191393299 ✅
INFO: Awarded 20 XP to user 8191393299 ✅
INFO: Created new streak for user 8191393299: sleep ✅
INFO: Gamification processed: {'xp_awarded': 20, 'streak_updated': True, 'current_streak': 1, ...} ✅
```

---

## Timeline

- **2026-01-16 06:08:** Migration 018 created to enable sleep quiz for user 8191393299
- **2026-01-16 (time unknown):** User 8191393299 attempts to save sleep quiz, experiences issue
- **2026-01-16 (investigation):** Root cause identified - SQL parameter type error in streak query
- **2026-01-16 (pending):** Fix to be implemented and deployed

---

## Conclusion

**User CAN save sleep quiz results** - the data is saved successfully.

**The issue is missing gamification feedback** due to SQL parameter type error in the streak system.

**Fix is simple:** Add explicit type cast to SQL query parameter.

**User impact is moderate:** Data is not lost, but user experience is degraded (no XP/streak feedback).

**Priority:** Medium - fix should be deployed soon to restore full gamification functionality.
