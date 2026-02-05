# Testing Guide - Health Bot Fixes
**Date:** 2026-01-30
**Purpose:** Verify all 3 critical bugs are fixed

---

## Quick Test Commands

### 1. Verify Database Changes

```bash
# Check user_habits table exists
cd /home/samuel/.archon/workspaces/health-agent
PGPASSWORD=postgres psql -h localhost -p 5333 -U postgres -d health_agent -c "\dt user_habits"

# Check both Whey100 formulas exist
PGPASSWORD=postgres psql -h localhost -p 5333 -U postgres -d health_agent -c \
  "SELECT name, total_calories, total_macros->>'protein' as protein FROM food_formulas WHERE user_id='7376426503' AND name ILIKE '%whey%' ORDER BY name;"
```

**Expected Output:**
```
Whey100 3Dl: 1.5Dl Powder | 378 | 55.5
Whey100 4Dl: 2Dl Powder   | 504 | 74
```

### 2. Verify Code Changes

```bash
# Check formula tools are imported
grep "from src.agent.formula_tools import" src/agent/__init__.py

# Check formula tools are registered
grep -B 2 "async def lookup_food_formula\|async def search_food_formulas" src/agent/__init__.py | grep "@agent.tool"

# Check Whey100 ratio is fixed
grep -A 5 "ratio.*1:2" src/memory/habit_extractor.py
```

---

## Manual Testing (Bot Must Be Running)

### Test 1: Formula Lookup for Whey100 3dl

**Test:**
1. Start the bot
2. Send message: "I had whey100 3dl"

**Expected Behavior:**
- Bot calls `lookup_food_formula(keyword="whey100")`
- Bot finds Whey100 3Dl formula
- Bot responds with: **378 kcal, 55.5g protein**
- Bot does NOT guess or estimate

**Check Logs For:**
```
[FORMULA] Looking up formula for keyword: whey100
[FORMULA] Found 2 matching formulas
[FORMULA] Using: Whey100 3Dl: 1.5Dl Powder
```

### Test 2: Formula Lookup for Whey100 4dl

**Test:**
1. Send message: "whey100 4dl"

**Expected Behavior:**
- Bot calls `lookup_food_formula(keyword="whey100")`
- Bot finds Whey100 4Dl formula
- Bot responds with: **504 kcal, 74g protein**

### Test 3: Date Awareness

**Test:**
1. Send message: "what day is it?"

**Expected Response:**
- "Today is [correct day of week], [correct date]"
- Example: "Today is Friday, 2026-01-30"

**Test:**
2. Send message: "I ate pasta carbonara kl16"

**Expected Behavior:**
- Bot logs to TODAY's date (2026-01-30)
- Bot does NOT log to yesterday

**Check Logs For:**
```
[TIMESTAMP_DEBUG] UTC now: 2026-01-30 ...
[TIMESTAMP_DEBUG] User timezone: Europe/Stockholm
[TIMESTAMP_DEBUG] User local time: 2026-01-30 ...
[TIMESTAMP_DEBUG] Timestamp string: [Current time: 2026-01-30 ...]
```

### Test 4: Habit Creation (After 3+ Uses)

**Test:**
1. Say "whey100 3dl" three times over different sessions

**Expected Behavior After 3rd Time:**
- System creates habit in `user_habits` table
- Habit has correct 1:2 ratio

**Verify in Database:**
```bash
PGPASSWORD=postgres psql -h localhost -p 5333 -U postgres -d health_agent -c \
  "SELECT habit_key, habit_data, confidence, occurrence_count FROM user_habits WHERE telegram_id='7376426503' AND habit_key LIKE '%whey%';"
```

**Expected:**
- `habit_key`: `whey100_3dl` or `whey100_preparation`
- `habit_data`: Contains `"ratio": "1:2"`
- `confidence`: Increases with each use
- `occurrence_count`: 3 or more

### Test 5: Persistence After /clear

**Test:**
1. Send: "whey100 3dl" (bot finds formula)
2. Send: `/clear` (clear conversation)
3. Send: "whey100 3dl" again

**Expected:**
- Bot STILL finds the formula (from database)
- Formula data persists (not in conversation memory)

### Test 6: Persistence After Bot Restart

**Test:**
1. Stop the bot
2. Start the bot
3. Send: "whey100 3dl"

**Expected:**
- Bot STILL finds the formula (from database)
- All data persists across restarts

---

## Automated Verification Script

```bash
#!/bin/bash
# Run this to verify all fixes

cd /home/samuel/.archon/workspaces/health-agent

echo "=== Checking Database ==="
PGPASSWORD=postgres psql -h localhost -p 5333 -U postgres -d health_agent << EOF
\dt user_habits
SELECT COUNT(*) as whey_formulas FROM food_formulas WHERE user_id='7376426503' AND name ILIKE '%whey%';
EOF

echo ""
echo "=== Checking Code Changes ==="
echo "Formula tools imported:"
grep -q "from src.agent.formula_tools import" src/agent/__init__.py && echo "✅ YES" || echo "❌ NO"

echo "Formula tools registered:"
count=$(grep -B 2 "async def lookup_food_formula\|async def search_food_formulas" src/agent/__init__.py | grep -c "@agent.tool")
if [ "$count" -eq "2" ]; then
    echo "✅ YES (2 tools)"
else
    echo "❌ NO (found $count)"
fi

echo "Whey100 ratio fixed:"
grep -q '"ratio": "1:2"' src/memory/habit_extractor.py && echo "✅ YES" || echo "❌ NO"

echo "Date awareness enhanced:"
grep -q "TODAY'S DATE IS" src/memory/system_prompt.py && echo "✅ YES" || echo "❌ NO"

echo ""
echo "=== Syntax Checks ==="
python3 -m py_compile src/agent/__init__.py && echo "✅ agent/__init__.py syntax OK" || echo "❌ agent/__init__.py syntax ERROR"
python3 -m py_compile src/memory/habit_extractor.py && echo "✅ habit_extractor.py syntax OK" || echo "❌ habit_extractor.py syntax ERROR"
python3 -m py_compile src/memory/system_prompt.py && echo "✅ system_prompt.py syntax OK" || echo "❌ system_prompt.py syntax ERROR"

echo ""
echo "=== Summary ==="
echo "If all checks show ✅, the fixes are ready for bot testing!"
```

---

## What to Look For in Logs

### Formula Lookups:
```
[FORMULA] Looking up formula for keyword: whey100
[FORMULA] Found 2 matching formulas
[FORMULA] Using: Whey100 3Dl: 1.5Dl Powder (378 kcal)
```

### Timestamp Injection:
```
[TIMESTAMP_DEBUG] Injecting timestamp into user message
[TIMESTAMP_DEBUG] UTC now: 2026-01-30 14:30:00 UTC
[TIMESTAMP_DEBUG] User timezone: Europe/Stockholm
[TIMESTAMP_DEBUG] User local time: 2026-01-30 15:30:00 Friday
[TIMESTAMP_DEBUG] Timestamp string: [Current time: 2026-01-30 15:30 Europe/Stockholm, Friday]
```

### Habit Creation:
```
[HABIT] Detected food prep pattern: whey100 3dl
[HABIT] Created new habit whey100_3dl with portions=1.5
[HABIT] Updated whey100_3dl: 3 occurrences, 0.30 confidence
```

---

## Common Issues & Solutions

### Issue: Bot still guessing instead of using formula

**Check:**
1. Are formula tools registered? `grep "@agent.tool" src/agent/__init__.py`
2. Did you restart the bot after changes?
3. Check bot logs for formula lookup attempts

**Solution:**
- Restart bot
- Verify imports in src/agent/__init__.py

### Issue: Bot logging to wrong date

**Check:**
1. Check logs for `[TIMESTAMP_DEBUG]` messages
2. Verify user's timezone in profile
3. Check system time: `date`

**Solution:**
- Verify timezone in user profile
- Check if timestamp is being injected (logs)

### Issue: Habits not being created

**Check:**
1. Does `user_habits` table exist?
2. Check logs for `[HABIT]` messages
3. Have you said the phrase 3+ times?

**Solution:**
- Run migration 017 if table doesn't exist
- Check logs for errors

---

## Success Criteria

✅ **All fixes working if:**
1. Bot finds Whey100 formulas (3dl and 4dl)
2. Bot knows correct date
3. Bot logs food to today (not yesterday)
4. Habits are created after 3+ uses
5. Data persists after /clear and restart

---

**Next Step:** Start the bot and run through manual tests above!
