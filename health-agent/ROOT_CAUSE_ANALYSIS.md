# Root Cause Analysis - Health Bot Memory Issues
**Date:** 2026-01-30
**Analyzed by:** Claude Sonnet 4.5

## User-Reported Issues

1. Bot doesn't know what day it is - keeps logging from yesterday
2. Bot can't use the new lookup system - resorts to guessing
3. Bot STILL can't remember Whey100 recipe despite being told many times

---

## Investigation Findings

### Issue #1: Date/Time Awareness

**CODE ANALYSIS:**
- ✅ Timestamp injection exists: `src/agent/__init__.py` lines 2860-2884
- ✅ Every user message gets prefixed with: `[Current time: YYYY-MM-DD HH:MM timezone, Weekday]`
- ✅ System prompt includes current date/time (lines 347-355 in `system_prompt.py`)

**STATUS:** Code appears correct. **Needs runtime verification** - may be a production deployment issue or timestamp formatting problem.

**POTENTIAL CAUSES:**
- Bot using cached/stale responses
- Wrong timezone in user profile
- System time on server incorrect
- Agent ignoring the timestamp in the message

---

### Issue #2: Can't Use Lookup System (Guessing Instead)

**ROOT CAUSE FOUND: ✅**

Formula lookup tools are **defined but NOT registered** with the agent.

**Evidence:**
1. Tools exist in `src/agent/formula_tools.py`:
   - `get_food_formula(keyword)` - retrieve formula by keyword
   - `search_formulas(text)` - search for matching formulas

2. Tools are **NOT imported or registered** in `src/agent/__init__.py`:
   ```bash
   $ grep "formula_tools" src/agent/__init__.py
   # No results - NOT IMPORTED!
   ```

3. Database confirms formula exists:
   ```sql
   SELECT name, total_calories, times_used
   FROM food_formulas
   WHERE user_id='7376426503' AND name ILIKE '%whey%';

   -- Result: "Whey100 3Dl: 1.5Dl Powder" | 378 | 4
   ```

**IMPACT:** Agent has NO WAY to access formula/recipe lookup system, so it guesses instead of looking up saved formulas.

**FIX:** Register formula tools with the agent.

---

### Issue #3: Can't Remember Whey100 Recipe

**ROOT CAUSES FOUND: ✅ (Multiple issues)**

#### Problem 3A: Formula Tools Not Registered (Same as Issue #2)
Even though Whey100 3dl formula exists in database, agent can't access it.

#### Problem 3B: Missing Database Table
Habit extraction system tries to use `user_habits` table that **DOESN'T EXIST**:

```bash
$ psql ... -c "\dt" | grep habit
# No results - table doesn't exist!
```

Code reference: `src/memory/habit_extractor.py` lines 55, 63, 82 attempt to query non-existent table.

**IMPACT:** All habit learning FAILS silently. User corrections never get saved as habits.

#### Problem 3C: Hardcoded Wrong Recipe
Habit extractor has hardcoded Whey100 defaults that are **INCORRECT**:

```python
# src/memory/habit_extractor.py lines 75-80
habit_data = {
    "food": "whey100",
    "ratio": "1:1",  # ❌ WRONG - should be 1:2
    "liquid": "milk_3_percent",
    "portions_per_dl": 0.5  # ❌ WRONG
}
```

**User's ACTUAL recipe:**
- 1 portion = 37g = 1dl Whey100 powder
- Per portion: 132 kcal, 0.44g fat, 0.85g carbs, 31g protein
- Whey100 3dl = 1.5dl powder (1.5 portions) + 3dl milk (ratio 1:2)
- Whey100 4dl = 2dl powder (2 portions) + 4dl milk (ratio 1:2)

**Database formula (CORRECT for 3dl):**
```json
{
  "name": "Whey100 3Dl: 1.5Dl Powder",
  "foods": [
    {
      "name": "Whey100 powder",
      "quantity": "1.5 dl (55.5g)",
      "calories": 198,
      "macros": {"protein": 46.5, "carbs": 1.28, "fat": 0.66}
    },
    {
      "name": "Milk 3%",
      "quantity": "3 dl",
      "calories": 180,
      "macros": {"protein": 9.0, "carbs": 15.0, "fat": 9.0}
    }
  ],
  "total_calories": 378,
  "times_used": 4
}
```

#### Problem 3D: Missing 4dl Formula
Only 3dl formula exists. User also uses 4dl but no formula saved for it.

**Expected 4dl formula:**
- 2dl Whey100 powder (2 portions = 74g): 264 kcal, 62g protein, 1.7g carbs, 0.88g fat
- 4dl Milk 3%: 240 kcal, 12g protein, 20g carbs, 12g fat
- **Total: 504 kcal, 74g protein, 21.7g carbs, 12.88g fat**

---

## Summary of Fixes Needed

### Priority 1: CRITICAL (Blocking all formula/recipe functionality)
1. ✅ Register formula lookup tools in agent
2. ✅ Create `user_habits` table migration
3. ✅ Fix hardcoded Whey100 ratio from 1:1 to 1:2

### Priority 2: HIGH (User experience)
4. ✅ Create Whey100 4dl formula
5. ✅ Verify timestamp injection is working in production
6. ✅ Add validation tests for formula lookup
7. ✅ Add validation tests for habit extraction

### Priority 3: MEDIUM (Data quality)
8. Fix Whey100 3dl portions_per_dl calculation
9. Add error handling for missing habits table
10. Add logging for formula lookup attempts

---

## Verification Plan

After fixes are implemented, verify:

1. **Formula Lookup:**
   - User says "I'm having whey100 3dl"
   - Bot uses `get_food_formula` tool
   - Bot finds saved formula
   - Bot applies correct macros (378 kcal)

2. **Habit Learning:**
   - User says "whey100 4dl" 3+ times
   - System creates habit with correct 1:2 ratio
   - Habit persists after bot restart
   - Habit persists after /clear command

3. **Date Awareness:**
   - User asks "what day is it?"
   - Bot responds with correct date (2026-01-30)
   - User logs food "today at 16:00"
   - Bot saves to correct date (not yesterday)

4. **Persistence:**
   - Restart bot
   - User says "whey100 3dl"
   - Bot still finds formula (from database)
   - User runs /clear
   - Bot still finds formula (database not affected)

---

## Files That Need Changes

1. `src/agent/__init__.py` - Register formula tools
2. `migrations/` - Create user_habits table
3. `src/memory/habit_extractor.py` - Fix hardcoded ratio
4. `src/db/queries.py` - Add habits table queries (if needed)
5. Testing files for verification

---

**Next Step:** Create implementation plan with specific code changes.
