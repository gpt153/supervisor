# Implementation Plan - Fix Health Bot Memory Issues
**Date:** 2026-01-30
**Priority:** CRITICAL - User extremely frustrated by recurring issues

## Overview

Fix three critical bugs causing the bot to:
1. Not know current date
2. Unable to access formula lookup system
3. Forget Whey100 recipe despite being told many times

---

## Phase 1: Register Formula Lookup Tools (CRITICAL - Blocks formula functionality)

### File: `src/agent/__init__.py`

**Location:** After other tool imports (around line 32)

**Add imports:**
```python
from src.agent.formula_tools import (
    get_food_formula,
    search_formulas,
    FormulaResult
)
```

**Register tools:**

Find the section with `@agent.tool` decorators (around line 274+).

Add these tools (can be placed after nutrition tools, around line 1316):

```python
@agent.tool
async def lookup_food_formula(
    ctx: RunContext[AgentDeps], keyword: str
) -> FormulaResult:
    """
    **LOOKUP SAVED FOOD FORMULA** - ALWAYS use this when user mentions recurring meals/recipes

    Retrieves saved formulas (recipes) from database based on keywords.
    Use this BEFORE making nutrition estimates to check if user has a saved formula.

    When to use:
    - User mentions "whey100", "my shake", "usual breakfast", "the pasta"
    - User says "I had X" where X might be a recurring meal
    - Before logging ANY food that could be a saved recipe

    Args:
        keyword: Search term from user's message (e.g., "whey100", "shake", "pasta")

    Returns:
        FormulaResult with matching formulas if found

    Example:
        User: "I had whey100 3dl"
        → Call lookup_food_formula(keyword="whey100")
        → Find saved formula with exact macros
        → Use those macros instead of guessing
    """
    return await get_food_formula(ctx, keyword)


@agent.tool
async def search_food_formulas(
    ctx: RunContext[AgentDeps], text: str
) -> FormulaResult:
    """
    **SEARCH ALL FORMULAS** - Find formulas matching description

    Broader search across all saved formulas.
    Use when exact keyword lookup fails but food might still have a formula.

    Args:
        text: Search text or description

    Returns:
        FormulaResult with matching formulas
    """
    return await search_formulas(ctx, text=text, include_visual=False)
```

**Testing:**
```python
# Verify tools are registered
assert lookup_food_formula in agent._function_tools
assert search_food_formulas in agent._function_tools
```

---

## Phase 2: Create user_habits Table (CRITICAL - Habit extraction failing)

### File: `migrations/017_user_habits_table.sql`

**Create new migration:**

```sql
-- Migration 017: Create user_habits table for automatic pattern learning
-- Created: 2026-01-30
-- Purpose: Fix habit extraction system that was trying to use non-existent table

CREATE TABLE IF NOT EXISTS user_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id VARCHAR(255) NOT NULL,
    habit_type VARCHAR(50) NOT NULL,  -- 'food_prep', 'timing', 'routine', 'preference'
    habit_key VARCHAR(200) NOT NULL,  -- Unique identifier for this habit
    habit_data JSONB NOT NULL,         -- Habit-specific data
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.3,  -- 0.0-1.0 confidence score
    occurrence_count INTEGER NOT NULL DEFAULT 1,    -- How many times observed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT user_habits_confidence_check CHECK (confidence >= 0.0 AND confidence <= 1.0),
    CONSTRAINT user_habits_occurrence_check CHECK (occurrence_count >= 0),
    CONSTRAINT user_habits_unique_habit UNIQUE (telegram_id, habit_type, habit_key),

    -- Foreign key
    FOREIGN KEY (telegram_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_user_habits_user ON user_habits(telegram_id, habit_type);
CREATE INDEX idx_user_habits_confidence ON user_habits(telegram_id, confidence DESC);

-- Trigger for updated_at
CREATE TRIGGER update_user_habits_updated_at
    BEFORE UPDATE ON user_habits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comment
COMMENT ON TABLE user_habits IS 'Stores automatically learned user habits and patterns for auto-application';
COMMENT ON COLUMN user_habits.habit_data IS 'JSON structure varies by habit_type. For food_prep: {food, ratio, liquid, portions_per_dl}';
COMMENT ON COLUMN user_habits.confidence IS 'Confidence score increases with repetitions, max 1.0 after 10+ occurrences';
```

**Apply migration:**
```bash
cd /home/samuel/.archon/workspaces/health-agent
PGPASSWORD=postgres psql -h localhost -p 5333 -U postgres -d health_agent -f migrations/017_user_habits_table.sql
```

---

## Phase 3: Fix Hardcoded Whey100 Recipe (CRITICAL - Wrong macros)

### File: `src/memory/habit_extractor.py`

**Current code (lines 75-80):**
```python
habit_data = {
    "food": "whey100",
    "ratio": "1:1",  # ❌ WRONG
    "liquid": "milk_3_percent",
    "portions_per_dl": 0.5  # ❌ WRONG
}
```

**Fixed code:**
```python
habit_data = {
    "food": "whey100",
    "ratio": "1:2",  # ✅ CORRECT: 1dl powder : 2dl milk
    "liquid": "milk_3_percent",
    "portions_per_dl": 1.0,  # ✅ CORRECT: 1 portion = 1dl = 37g
    "calories_per_portion": 132,
    "macros_per_portion": {
        "protein": 31,
        "carbs": 0.85,
        "fat": 0.44
    },
    "portion_weight_grams": 37
}
```

**Also add better detection logic:**

Find the `detect_food_prep_habit` method and enhance it to detect 3dl and 4dl variants:

```python
async def detect_food_prep_habit(
    self,
    user_id: str,
    food_description: str,
    parsed_components: Dict
) -> Optional[Dict]:
    """
    Detect if user has a food preparation habit
    Enhanced to detect whey100 3dl and 4dl variants
    """
    food_lower = food_description.lower()

    # Check for whey protein patterns
    if "whey" in food_lower or "whey100" in food_lower:
        # Detect variant (3dl or 4dl)
        if "3dl" in food_lower or "3 dl" in food_lower:
            habit_key = "whey100_3dl"
            portions = 1.5
        elif "4dl" in food_lower or "4 dl" in food_lower:
            habit_key = "whey100_4dl"
            portions = 2.0
        else:
            # Generic whey habit
            habit_key = "whey100_preparation"
            portions = None

        # Query existing habit
        existing = await self.get_habit(user_id, "food_prep", habit_key)

        if existing:
            # Update occurrence count
            new_count = existing['occurrence_count'] + 1
            # Confidence increases with repetitions, maxes at 1.0 after 10 occurrences
            confidence = min(1.0, new_count / 10.0)

            await self.update_habit(
                user_id,
                "food_prep",
                habit_key,
                occurrence_count=new_count,
                confidence=confidence
            )

            logger.info(f"[HABIT] Updated {habit_key}: {new_count} occurrences, {confidence:.2f} confidence")
            return existing['habit_data']
        else:
            # Create new habit with correct data
            if portions:
                # Specific variant (3dl or 4dl)
                powder_dl = portions
                milk_dl = portions * 2  # 1:2 ratio

                habit_data = {
                    "food": "whey100",
                    "variant": habit_key,
                    "powder_dl": powder_dl,
                    "milk_dl": milk_dl,
                    "ratio": "1:2",
                    "liquid": "milk_3_percent",
                    "portions": portions,
                    "calories_per_portion": 132,
                    "macros_per_portion": {
                        "protein": 31,
                        "carbs": 0.85,
                        "fat": 0.44
                    }
                }
            else:
                # Generic whey habit
                habit_data = {
                    "food": "whey100",
                    "ratio": "1:2",
                    "liquid": "milk_3_percent",
                    "portions_per_dl": 1.0,
                    "calories_per_portion": 132,
                    "macros_per_portion": {
                        "protein": 31,
                        "carbs": 0.85,
                        "fat": 0.44
                    }
                }

            await self.create_habit(
                user_id,
                "food_prep",
                habit_key,
                habit_data,
                confidence=0.3  # Low confidence initially
            )

            logger.info(f"[HABIT] Created new habit {habit_key}")
            return habit_data

    return None
```

---

## Phase 4: Create Whey100 4dl Formula (HIGH PRIORITY - User uses this)

### Method: Direct database insertion OR use bot to create it

**Option A: Direct SQL insertion**
```sql
INSERT INTO food_formulas (
    user_id,
    name,
    keywords,
    description,
    foods,
    total_calories,
    total_macros,
    is_auto_detected,
    confidence_score,
    times_used
) VALUES (
    '7376426503',
    'Whey100 4Dl: 2Dl Powder',
    ARRAY['whey100', 'whey', '4dl', 'shake', 'protein'],
    'Whey100 4dl: 2dl powder (2 portions) + 4dl milk 3%',
    '[
        {
            "name": "Whey100 powder",
            "quantity": "2 dl (74g)",
            "calories": 264,
            "macros": {"protein": 62, "carbs": 1.7, "fat": 0.88},
            "confidence": "high",
            "food_category": "protein_supplement",
            "confidence_score": 1.0,
            "verification_source": "user_defined"
        },
        {
            "name": "Milk 3%",
            "quantity": "4 dl",
            "calories": 240,
            "macros": {"protein": 12, "carbs": 20, "fat": 12},
            "confidence": "high",
            "food_category": "dairy",
            "confidence_score": 1.0,
            "verification_source": "user_defined"
        }
    ]'::jsonb,
    504,
    '{"protein": 74, "carbs": 21.7, "fat": 12.88, "micronutrients": null}'::jsonb,
    false,
    1.0,
    1
) ON CONFLICT (user_id, name) DO UPDATE SET
    foods = EXCLUDED.foods,
    total_calories = EXCLUDED.total_calories,
    total_macros = EXCLUDED.total_macros,
    updated_at = CURRENT_TIMESTAMP;
```

**Option B: Use bot's formula creation tool** (if available)

---

## Phase 5: Add Date/Time Debugging (Verify timestamp working)

### File: `src/agent/__init__.py`

**Add debug logging around line 2878:**

```python
# Get current time in user's timezone
user_now = datetime.now(user_tz)
timestamp_info = f"[Current time: {user_now.strftime('%Y-%m-%d %H:%M')} {user_timezone_str}, {user_now.strftime('%A')}]"

# DEBUG: Log the timestamp being injected
logger.info(f"[TIMESTAMP_DEBUG] Injecting timestamp: {timestamp_info}")
logger.info(f"[TIMESTAMP_DEBUG] User timezone: {user_timezone_str}")
logger.info(f"[TIMESTAMP_DEBUG] UTC now: {datetime.now(pytz.UTC)}")
logger.info(f"[TIMESTAMP_DEBUG] User local now: {user_now}")
```

**Also add to system prompt generation:**

### File: `src/memory/system_prompt.py`

**Around line 349, enhance the date instruction:**

```python
📅 **DATE AND TIME AWARENESS (CRITICAL - ALWAYS CHECK THIS):**
1. Current UTC time: {utc_time} UTC
2. User's local time: {current_datetime_str} ({user_timezone_str})
3. **TODAY'S DATE IS: {current_date}** ← CRITICAL: Use this for "today"
4. Today is {weekday}, {current_date} ← CRITICAL: This is the current day
5. Always use user's local time ({user_timezone_str}) when answering time-based questions
6. Always specify dates when discussing food/progress: "Today ({current_date})", "Yesterday", "This week"
7. Don't assume old conversation messages are from today
8. For questions about "next reminder" or "when is X", calculate based on user's local time {current_time}
9. If unsure about dates, ask: "Are you asking about today ({current_date}) or a previous date?"

**WHEN LOGGING FOOD:**
- If user says "I ate X" without a time → assume they mean TODAY ({current_date})
- If user says "I ate X yesterday" → use date {(datetime.now(user_tz) - timedelta(days=1)).strftime('%Y-%m-%d')}
- If user says "I ate X at 16:00" → use TODAY ({current_date}) at 16:00 unless they specify otherwise
- NEVER log to yesterday's date unless explicitly stated by user
```

---

## Phase 6: Add Comprehensive Tests

### File: `tests/test_formula_lookup.py` (NEW)

```python
"""
Test formula lookup functionality
"""
import pytest
from src.agent import agent
from src.agent.formula_tools import get_food_formula


@pytest.mark.asyncio
async def test_formula_tools_registered():
    """Verify formula tools are registered with agent"""
    tool_names = [tool.__name__ for tool in agent._function_tools.values()]

    assert 'lookup_food_formula' in tool_names, "lookup_food_formula not registered"
    assert 'search_food_formulas' in tool_names, "search_food_formulas not registered"


@pytest.mark.asyncio
async def test_whey100_3dl_formula_exists(db_connection):
    """Verify Whey100 3dl formula exists in database"""
    result = await db_connection.fetch(
        "SELECT * FROM food_formulas WHERE user_id = $1 AND name ILIKE '%whey%3%'",
        '7376426503'
    )

    assert len(result) > 0, "Whey100 3dl formula not found in database"
    formula = result[0]
    assert formula['total_calories'] == 378
    assert formula['total_macros']['protein'] == 55.5


@pytest.mark.asyncio
async def test_whey100_4dl_formula_exists(db_connection):
    """Verify Whey100 4dl formula exists in database"""
    result = await db_connection.fetch(
        "SELECT * FROM food_formulas WHERE user_id = $1 AND name ILIKE '%whey%4%'",
        '7376426503'
    )

    assert len(result) > 0, "Whey100 4dl formula not found in database"
    formula = result[0]
    assert formula['total_calories'] == 504
    assert formula['total_macros']['protein'] == 74


@pytest.mark.asyncio
async def test_formula_lookup_by_keyword(test_agent_context):
    """Test formula lookup with keyword"""
    result = await get_food_formula(test_agent_context, keyword="whey100")

    assert result.success == True
    assert len(result.formulas) > 0
    assert 'whey' in result.formulas[0]['name'].lower()
```

### File: `tests/test_habit_extraction.py` (NEW)

```python
"""
Test habit extraction system
"""
import pytest
from src.memory.habit_extractor import HabitExtractor


@pytest.mark.asyncio
async def test_user_habits_table_exists(db_connection):
    """Verify user_habits table exists"""
    result = await db_connection.fetch(
        """
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_habits'
        """
    )

    assert len(result) > 0, "user_habits table does not exist"


@pytest.mark.asyncio
async def test_whey100_habit_has_correct_ratio(db_connection):
    """Verify Whey100 habit has 1:2 ratio, not 1:1"""
    extractor = HabitExtractor(db_connection)

    # Simulate user saying "whey100 3dl"
    habit_data = await extractor.detect_food_prep_habit(
        user_id='test_user',
        food_description='whey100 3dl',
        parsed_components={}
    )

    if habit_data:
        assert habit_data['ratio'] == '1:2', f"Wrong ratio: {habit_data['ratio']}"
        assert habit_data['portions_per_dl'] == 1.0, f"Wrong portions_per_dl: {habit_data['portions_per_dl']}"


@pytest.mark.asyncio
async def test_habit_persists_across_sessions(db_connection):
    """Verify habits persist in database"""
    extractor = HabitExtractor(db_connection)
    user_id = 'test_persist_user'

    # Create habit
    await extractor.create_habit(
        user_id=user_id,
        habit_type='food_prep',
        habit_key='test_habit',
        habit_data={'test': 'data'},
        confidence=0.8
    )

    # Retrieve habit
    habit = await extractor.get_habit(user_id, 'food_prep', 'test_habit')

    assert habit is not None
    assert habit['habit_data']['test'] == 'data'
    assert habit['confidence'] == 0.8

    # Cleanup
    await db_connection.execute(
        "DELETE FROM user_habits WHERE telegram_id = $1",
        user_id
    )
```

---

## Implementation Order

1. **Phase 2** - Create user_habits table (unblocks habit system)
2. **Phase 3** - Fix hardcoded Whey100 recipe (correct data)
3. **Phase 1** - Register formula tools (unblocks lookup)
4. **Phase 4** - Create Whey100 4dl formula (add missing data)
5. **Phase 5** - Add date/time debugging (verify working)
6. **Phase 6** - Add tests (verify fixes)

---

## Verification Checklist

After implementation, verify each fix:

### ✅ Formula Lookup Working
- [ ] Tools registered in agent
- [ ] User says "whey100 3dl" → bot finds formula
- [ ] User says "whey100 4dl" → bot finds formula
- [ ] User says "my shake" → bot searches formulas
- [ ] Bot uses formula data instead of guessing

### ✅ Habits Working
- [ ] user_habits table exists
- [ ] Whey100 habit has 1:2 ratio
- [ ] Habit persists after bot restart
- [ ] Habit persists after /clear command
- [ ] Multiple repetitions increase confidence

### ✅ Date Awareness Working
- [ ] User asks "what day is it" → correct answer
- [ ] User says "I ate pasta" → logs to TODAY
- [ ] User says "I ate pasta at 16:00" → logs to TODAY at 16:00
- [ ] Bot never logs to yesterday unless user says "yesterday"
- [ ] Timestamp visible in logs

---

## Rollback Plan

If issues occur:
1. Formula tools registration → comment out imports, bot still works without them
2. user_habits table → drop table if causing issues
3. Hardcoded recipe fix → revert to old values temporarily
4. Whey100 4dl formula → delete from database if incorrect

---

**Total Implementation Time:** ~2-3 hours
**Testing Time:** ~1-2 hours
**TOTAL:** ~4-5 hours for complete fix + verification
