# Fixes Implemented - Health Bot Memory Issues
**Date:** 2026-01-30
**Status:** ✅ ALL CRITICAL FIXES COMPLETE

## Summary

Fixed three critical recurring bugs that were causing the health bot to:
1. Not know what day it is
2. Unable to access formula lookup system (forced to guess)
3. Forget Whey100 recipe despite being told many times

---

## Fixes Implemented

### ✅ Fix #1: Created user_habits Table
**Issue:** Habit extraction system was trying to use a table that didn't exist
**Root Cause:** `user_habits` table was never created in database
**Fix:** Created migration `017_user_habits_table.sql`

**File:** `/home/samuel/.archon/workspaces/health-agent/migrations/017_user_habits_table.sql`

**Status:** ✅ Applied to database (port 5333)

**Verification:**
```bash
$ psql ... -c "\d user_habits"
# Table exists with all columns and indexes
```

---

### ✅ Fix #2: Fixed Hardcoded Whey100 Recipe
**Issue:** Hardcoded Whey100 ratio was WRONG (1:1 instead of 1:2)
**Root Cause:** Default habit data had incorrect recipe
**Fix:** Updated `src/memory/habit_extractor.py` with correct values

**Changes:**
- Ratio: `1:1` → `1:2` (1dl powder : 2dl milk)
- Portions per dl: `0.5` → `1.0` (1 portion = 1dl = 37g)
- Added per-portion nutrition data
- Enhanced detection for 3dl and 4dl variants

**File:** `/home/samuel/.archon/workspaces/health-agent/src/memory/habit_extractor.py`

**Status:** ✅ Complete, syntax verified

**Verification:**
```python
# Correct data now used:
habit_data = {
    "food": "whey100",
    "ratio": "1:2",
    "portions_per_dl": 1.0,
    "calories_per_portion": 132,
    "macros_per_portion": {
        "protein": 31,
        "carbs": 0.85,
        "fat": 0.44
    }
}
```

---

### ✅ Fix #3: Registered Formula Lookup Tools
**Issue:** Formula lookup tools existed but were NOT registered with agent
**Root Cause:** Tools defined in `formula_tools.py` but never imported/registered
**Fix:** Added imports and registered tools with `@agent.tool` decorator

**Files Modified:**
- `/home/samuel/.archon/workspaces/health-agent/src/agent/__init__.py`

**Tools Added:**
1. `lookup_food_formula(keyword)` - Look up saved formulas by keyword
2. `search_food_formulas(text)` - Broader search across all formulas

**Status:** ✅ Complete, syntax verified

**Impact:** Bot can now ACCESS the formula lookup system instead of guessing!

**Verification:**
```python
# Tools now available:
- lookup_food_formula(keyword="whey100") → finds saved formula
- search_food_formulas(text="shake") → searches all formulas
```

---

### ✅ Fix #4: Created Whey100 4dl Formula
**Issue:** Only 3dl formula existed, user also uses 4dl
**Root Cause:** 4dl variant was never created as a formula
**Fix:** Created migration to add Whey100 4dl formula

**File:** `/home/samuel/.archon/workspaces/health-agent/migrations/018_add_whey100_4dl_formula.sql`

**Formula Details:**
- Name: "Whey100 4Dl: 2Dl Powder"
- Ingredients: 2dl Whey100 powder (74g) + 4dl milk 3%
- Nutrition: 504 kcal, 74g protein, 21.7g carbs, 12.88g fat

**Status:** ✅ Applied to database (port 5333)

**Verification:**
```bash
$ psql ... -c "SELECT name, total_calories FROM food_formulas WHERE name ILIKE '%whey%'"
Whey100 3Dl: 1.5Dl Powder | 378
Whey100 4Dl: 2Dl Powder   | 504
```

---

### ✅ Fix #5: Enhanced Date/Time Awareness
**Issue:** Need to verify timestamp injection is working correctly
**Root Cause:** Unclear if date logging issue was code or deployment
**Fix:** Added comprehensive debug logging + enhanced system prompt

**Files Modified:**
1. `/home/samuel/.archon/workspaces/health-agent/src/agent/__init__.py` (lines 2952-2958)
2. `/home/samuel/.archon/workspaces/health-agent/src/memory/system_prompt.py` (lines 347-356)

**Debug Logging Added:**
```python
logger.info(f"[TIMESTAMP_DEBUG] UTC now: ...")
logger.info(f"[TIMESTAMP_DEBUG] User timezone: ...")
logger.info(f"[TIMESTAMP_DEBUG] User local time: ...")
logger.info(f"[TIMESTAMP_DEBUG] Timestamp string: ...")
```

**System Prompt Enhanced:**
```
🚨 TODAY'S DATE IS: {current_date} ({weekday}) 🚨
🚨 WHEN USER SAYS "I ATE X" WITHOUT A DATE → USE TODAY: {current_date} 🚨
NEVER NEVER NEVER log food to yesterday's date unless user explicitly says "yesterday"
```

**Status:** ✅ Complete, syntax verified

---

## Files Changed Summary

### Created Files (4):
1. `migrations/017_user_habits_table.sql` - Create habits table
2. `migrations/018_add_whey100_4dl_formula.sql` - Add 4dl formula
3. `/home/samuel/supervisor/health-agent/ROOT_CAUSE_ANALYSIS.md` - Analysis
4. `/home/samuel/supervisor/health-agent/IMPLEMENTATION_PLAN.md` - Plan
5. `/home/samuel/supervisor/health-agent/FIXES_IMPLEMENTED.md` - This file

### Modified Files (3):
1. `src/agent/__init__.py` - Added formula tool imports and registrations + debug logging
2. `src/memory/habit_extractor.py` - Fixed Whey100 recipe + enhanced detection
3. `src/memory/system_prompt.py` - Enhanced date/time awareness instructions

---

## Database Changes Applied

### Database: health_agent (port 5333)
- ✅ Created `user_habits` table with indexes and triggers
- ✅ Inserted Whey100 4dl formula

**Verification Commands:**
```bash
# Check habits table
PGPASSWORD=postgres psql -h localhost -p 5333 -U postgres -d health_agent -c "\d user_habits"

# Check formulas
PGPASSWORD=postgres psql -h localhost -p 5333 -U postgres -d health_agent \
  -c "SELECT name, total_calories FROM food_formulas WHERE user_id='7376426503' AND name ILIKE '%whey%'"
```

---

## Testing Required (Next Step)

### Critical Tests:
1. **Formula Lookup Test:**
   - User says: "I had whey100 3dl"
   - Bot calls: `lookup_food_formula(keyword="whey100")`
   - Bot finds: Whey100 3Dl formula (378 kcal)
   - Bot uses: Exact macros instead of guessing

2. **Formula Lookup Test (4dl):**
   - User says: "whey100 4dl"
   - Bot calls: `lookup_food_formula(keyword="whey100")`
   - Bot finds: Whey100 4Dl formula (504 kcal)
   - Bot uses: Exact macros

3. **Habit Learning Test:**
   - User says "whey100 3dl" 3+ times
   - System creates habit in `user_habits` table
   - Habit has correct 1:2 ratio
   - Habit persists after bot restart

4. **Date Awareness Test:**
   - User asks: "what day is it?"
   - Bot responds: "Today is Friday, 2026-01-30" (or current date)
   - User says: "I ate pasta at 16:00"
   - Bot logs to: TODAY (2026-01-30), NOT yesterday

5. **Persistence Test:**
   - Restart bot
   - User says: "whey100"
   - Bot still finds formulas (from database)
   - User runs: `/clear`
   - Bot still finds formulas (database not affected)

---

## Rollback Instructions (If Needed)

### If issues occur:

1. **Formula tools causing problems:**
   ```python
   # In src/agent/__init__.py, comment out:
   from src.agent.formula_tools import (...)
   # And comment out the @agent.tool decorators for lookup_food_formula and search_food_formulas
   ```

2. **Habits table causing issues:**
   ```sql
   DROP TABLE IF EXISTS user_habits CASCADE;
   ```

3. **Whey100 4dl formula incorrect:**
   ```sql
   DELETE FROM food_formulas WHERE name = 'Whey100 4Dl: 2Dl Powder';
   ```

4. **Habit extractor changes causing issues:**
   ```bash
   # Revert changes to src/memory/habit_extractor.py using git
   git checkout src/memory/habit_extractor.py
   ```

---

## Expected User Experience After Fixes

### Before (BROKEN):
- User: "I had whey100 3dl"
- Bot: *guesses* "That's about 200-250 calories" ❌ WRONG
- User corrects it: "No it's 378 calories with 55g protein"
- Bot: "OK I'll remember" but... doesn't actually remember
- Next day, user: "whey100 3dl"
- Bot: *guesses again* "About 200-250 calories" ❌ SAME MISTAKE

### After (FIXED):
- User: "I had whey100 3dl"
- Bot: *calls lookup_food_formula("whey100")* ✅
- Bot: *finds Whey100 3Dl formula in database* ✅
- Bot: "Logged Whey100 3dl: 378 calories, 55.5g protein" ✅ CORRECT
- Next day, user: "whey100 3dl"
- Bot: *still finds formula* ✅ REMEMBERS PERMANENTLY

---

## Next Steps

1. **Test the bot** with the verification tests above
2. **Monitor logs** for `[TIMESTAMP_DEBUG]` messages
3. **Verify formulas** are being looked up (check logs for formula tool calls)
4. **Check habits** are being created (query `user_habits` table)
5. **Report results** to user

---

**Implementation Time:** ~2 hours
**Status:** ✅ ALL FIXES COMPLETE, READY FOR TESTING
