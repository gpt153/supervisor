# ADR 006: Dynamic Custom Tracking System with JSONB Storage

**Date:** 2026-01-16 (Stockholm time)
**Status:** Accepted
**Project:** health-agent
**Supersedes:** N/A
**Superseded by:** N/A

## Context

Health Agent currently tracks food, nutrition, sleep, and gamification metrics. Users want to track custom health metrics that don't fit into predefined categories, such as period cycles, sexual health metrics, symptoms, energy levels, mood patterns, and any other personal health data they find meaningful.

### Current Situation

**Rigid Schema Problem:**
- Current system uses fixed database tables for specific tracking types (food_logs, sleep_logs, etc.)
- Adding new tracking categories requires schema migrations and code changes
- Users cannot create their own tracking categories
- Cannot track period cycles, symptoms, medications, or custom metrics
- Agent has no visibility into user-defined tracking data

**Real User Needs:**
- Track menstrual cycles (flow, symptoms, mood, cramps severity)
- Log sexual health metrics (protection used, partner information, etc.)
- Monitor symptoms (headaches, fatigue, digestive issues)
- Record energy levels throughout the day
- Track medications and supplements
- Correlate custom metrics with nutrition and sleep patterns

**Agent Integration Gap:**
- Agent can't provide contextual advice based on cycle phase
- Can't recommend nutrition adjustments week before period
- Can't identify patterns in custom metrics
- No way to correlate user-defined metrics with existing data

### Constraints

- **Must be flexible:** Support any user-defined tracking category
- **Must be structured:** Agent needs to read and reason about data
- **Must validate input:** Prevent invalid data despite flexibility
- **Must scale:** Handle thousands of custom trackers per user
- **Must be queryable:** Agent tools must efficiently retrieve custom data
- **Must work with PostgreSQL:** Leverage existing database infrastructure
- **Single developer:** Solution must be maintainable

### Stakeholders

- **Who is affected:** Users (define trackers), Agent (reads data), SCAR (implements system)
- **Who decides:** Supervisor (architecture design), Users (which trackers they create)

## Decision

We will implement a dynamic custom tracking system using PostgreSQL JSONB columns for flexible schema-per-tracker, combined with Pydantic validation for type safety.

**Architecture:**

1. **Two-Table Design:**
   - `tracker_definitions` table: Stores tracker metadata and schema
   - `tracker_entries` table: Stores actual tracking data as JSONB

2. **Schema Definition:**
   - Each tracker has a JSON schema defining its fields
   - Pydantic models validate entries against tracker schema
   - Users define field names, types, and validation rules

3. **Agent Integration:**
   - PydanticAI tools query custom tracking data
   - Agent uses schema metadata to understand field meanings
   - Agent provides contextual advice based on tracked patterns

### Implementation Summary

**Database Schema:**

```sql
-- Tracker definitions (metadata + schema)
CREATE TABLE tracker_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(user_id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10),
  schema JSONB NOT NULL,  -- JSON Schema for validation
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, name)
);

-- Tracker entries (actual data)
CREATE TABLE tracker_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracker_id UUID NOT NULL REFERENCES tracker_definitions(id),
  user_id BIGINT NOT NULL REFERENCES users(user_id),
  data JSONB NOT NULL,  -- Flexible data matching tracker schema
  tracked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_tracker_entries_user_tracker ON tracker_entries(user_id, tracker_id);
CREATE INDEX idx_tracker_entries_tracked_at ON tracker_entries(tracked_at);
CREATE INDEX idx_tracker_definitions_user ON tracker_definitions(user_id);
```

**Example Tracker Schema (Period Cycle):**

```json
{
  "type": "object",
  "fields": {
    "flow": {
      "type": "select",
      "options": ["spotting", "light", "medium", "heavy"],
      "required": true
    },
    "cramps": {
      "type": "scale",
      "min": 0,
      "max": 10,
      "required": false
    },
    "mood": {
      "type": "multiselect",
      "options": ["irritable", "sad", "anxious", "normal", "happy"],
      "required": false
    },
    "symptoms": {
      "type": "multiselect",
      "options": ["bloating", "headache", "fatigue", "back_pain", "breast_tenderness"],
      "required": false
    }
  }
}
```

**Agent Integration:**

```python
# PydanticAI tool for querying custom tracking data
@tracker_agent.tool
def query_custom_tracker(
    ctx: RunContext[TrackerDeps],
    tracker_name: str,
    days_back: int = 30
) -> list[dict]:
    """Query custom tracking data for pattern analysis."""
    # Get tracker definition
    tracker = get_tracker_by_name(ctx.deps.user_id, tracker_name)

    # Query entries
    entries = get_tracker_entries(
        user_id=ctx.deps.user_id,
        tracker_id=tracker.id,
        start_date=date.today() - timedelta(days=days_back)
    )

    # Return structured data with schema metadata
    return {
        "tracker": tracker.name,
        "schema": tracker.schema,
        "entries": [{"date": e.tracked_at, "data": e.data} for e in entries]
    }
```

## Rationale

### Pros

✅ **Infinite Flexibility:** Users create ANY tracking category without code changes
✅ **Type Safety:** Pydantic validates entries against tracker-defined schemas
✅ **Agent Reasoning:** Agent reads schema metadata to understand field meanings
✅ **Performance:** PostgreSQL JSONB indexes enable fast queries
✅ **Maintainability:** No schema migrations for new tracker types
✅ **Scalability:** Single table design scales to thousands of trackers
✅ **User Privacy:** Sensitive data (period, sexual health) in JSONB (opaque to logs)

### Cons

❌ **Query Complexity:** JSONB queries more complex than column queries
❌ **Validation Overhead:** Must validate every entry against schema
❌ **Migration Challenge:** Changing tracker schema requires data migration
❌ **Mitigation:**
   - Use GIN indexes on JSONB columns for performance
   - Cache Pydantic validators to reduce overhead
   - Version tracker schemas to handle migrations gracefully

### Why This Wins

**JSONB is PostgreSQL's strength** - mature, fast, indexed, queryable. Combines flexibility of NoSQL with relational database benefits. Industry-proven approach (GitHub, Stripe, Shopify use JSONB for flexible schemas). Agent can reason about data because schema metadata is explicit.

## Consequences

### Positive Consequences

- **Developer Experience:** Add new trackers via UI, no code changes needed
- **User Experience:** Users track EXACTLY what matters to them
- **Performance:** GIN indexes make JSONB queries fast (<50ms)
- **Cost:** Zero (PostgreSQL already deployed, JSONB is built-in)
- **Agent Intelligence:** Agent provides contextual advice based on custom patterns
- **Privacy:** Sensitive data (period, sex) doesn't require special tables

### Negative Consequences

- **Technical Debt:** JSONB queries less familiar to new developers
- **Learning Curve:** Team must learn JSON Schema validation patterns
- **Migration Effort:** ~12 hours to implement (database + validation + agent tools)
- **Debugging:** JSONB data harder to inspect than columns

### Neutral Consequences

- **Architecture Change:** Move from rigid schemas to flexible JSONB approach
- **Team Process:** New trackers require schema design, not code
- **Documentation:** Must document common tracker patterns (period, symptoms, etc.)

## Alternatives Considered

### Alternative 1: One Table Per Tracker Type

**Description:** Create `period_logs`, `symptom_logs`, `medication_logs` tables

**Pros:**
- Strongly typed (columns are explicit)
- Easy to query (standard SQL)
- Familiar to developers

**Cons:**
- Requires schema migration for every new tracker type
- Users can't create custom trackers
- Agent needs code updates for each tracker
- Doesn't scale (hundreds of potential tracker types)

**Why Rejected:** Completely defeats purpose of "custom" tracking. Users want to define their own categories, not wait for code deployment.

### Alternative 2: Full NoSQL (MongoDB/DynamoDB)

**Description:** Move custom tracking to separate NoSQL database

**Pros:**
- Maximum flexibility (no schema at all)
- Fast writes
- Easy to add new data shapes

**Cons:**
- Adds infrastructure complexity (second database)
- No transactions with main PostgreSQL data
- Harder for agent to validate data
- No schema metadata (agent can't understand fields)
- Additional operational cost

**Why Rejected:** PostgreSQL JSONB provides 95% of NoSQL flexibility with relational benefits. Adding second database is overkill for this use case.

### Alternative 3: Entity-Attribute-Value (EAV) Pattern

**Description:** Store custom fields as rows (tracker_id, field_name, field_value)

**Pros:**
- Pure relational approach
- Easy to add fields
- Queryable with standard SQL

**Cons:**
- Query complexity explodes (JOIN per field)
- Poor performance (many rows per entry)
- Type safety nightmare (all values stored as TEXT)
- Agent can't efficiently reason about data

**Why Rejected:** EAV is anti-pattern in modern databases. JSONB is evolution past EAV.

## Implementation Plan

### Phase 1: Database Schema

1. [x] Create `tracker_definitions` table with JSONB schema column
2. [x] Create `tracker_entries` table with JSONB data column
3. [x] Add GIN indexes on JSONB columns for performance
4. [x] Write migration script
5. [x] Test migration on development database

### Phase 2: Validation Layer

1. [ ] Create Pydantic models for tracker schemas
2. [ ] Implement JSON Schema validation
3. [ ] Build tracker schema builder (user-facing)
4. [ ] Add validation tests
5. [ ] Document common field types (text, number, select, multiselect, date, scale)

### Phase 3: Agent Integration

1. [ ] Create PydanticAI tools for custom tracker queries
2. [ ] Add agent prompts for pattern analysis
3. [ ] Implement contextual advice based on custom data
4. [ ] Test agent understanding of custom tracker data
5. [ ] Add agent examples (period cycle advice, symptom correlations)

### Phase 4: Telegram UI

1. [ ] `/create_tracker` command (define new tracker)
2. [ ] `/log [tracker_name]` command (add entry)
3. [ ] `/view_tracker [tracker_name]` command (view history)
4. [ ] `/list_trackers` command (show all trackers)
5. [ ] `/edit_tracker [tracker_name]` command (modify schema)

### Rollback Plan

If JSONB approach proves problematic:
1. Keep existing rigid tables functional (no data loss)
2. Migrate custom tracking data to separate service
3. Use API calls instead of database queries

**Risk:** Low (JSONB is mature PostgreSQL feature, widely used in production)

## Success Metrics

**Quantitative Metrics:**
- **Query Performance:** Custom tracker queries <50ms (same as rigid tables)
- **Validation Overhead:** <10ms per entry validation
- **User Adoption:** >50% of users create at least one custom tracker within 1 month
- **Agent Usage:** Agent references custom tracker data in >30% of conversations

**Qualitative Metrics:**
- **User Satisfaction:** Users report tracking exactly what they want
- **Agent Intelligence:** Agent provides contextual advice (e.g., "Your period starts in 3 days, increase iron intake")
- **Developer Experience:** Adding new common tracker templates takes <30 minutes
- **Maintainability:** No schema migrations needed for new tracker types

**Timeline:**
- Measure after: 1 month post-launch (Phase 4 completion)
- Target: 50%+ user adoption, <50ms query performance, agent uses data actively

## Review Date

**Next Review:** 2026-03-16 (2 months after implementation)

**Triggers for Earlier Review:**
- JSONB queries prove slower than expected (>100ms)
- Users struggle with tracker schema definition
- Agent can't effectively reason about custom data
- PostgreSQL JSONB limitations discovered (e.g., complex aggregations)
- Alternative approaches mature (e.g., PostgreSQL improves JSONB)

## References

- **PostgreSQL JSONB Documentation:** https://www.postgresql.org/docs/current/datatype-json.html
- **JSON Schema Specification:** https://json-schema.org/
- **Pydantic JSON Schema:** https://docs.pydantic.dev/latest/usage/json_schema/
- **GitHub Issue:** (to be created after ADR approval)
- **Related Epic:** Epic 006 - Custom Tracking System
- **Industry Examples:** GitHub metadata, Stripe flexible objects, Shopify product variants

## Notes

**Why JSONB Over JSON:**
- JSONB is binary format (faster processing)
- JSONB supports indexing (JSON does not)
- JSONB queries are optimized by PostgreSQL

**Common Tracker Templates:**
- Period Cycle: flow, cramps, mood, symptoms
- Sexual Health: protection, partner, satisfaction, notes
- Symptoms: type, severity, duration, triggers
- Medications: name, dosage, time, side effects
- Energy Levels: time of day, energy score, activities
- Mood: emotion, intensity, triggers, coping strategies

**Agent Contextual Advice Examples:**
- "Your period starts in 3 days. Based on past cycles, increase iron-rich foods this week."
- "You've logged headaches 5 times this month, often after low sleep. Prioritize 8+ hours tonight."
- "Energy levels drop around 3 PM. Your recent tracking shows protein helps - try a protein snack at 2 PM."

**Privacy Considerations:**
- Period and sexual health data is sensitive
- JSONB makes data opaque to logs (not parsed)
- User can delete trackers and all associated data
- Agent only accesses data with explicit user permission

### Lessons Learned (Post-Implementation)

**To be filled in after Phase 4 completion:**

- What worked well:
- What didn't work:
- What we'd do differently:

---

**Template Version:** 1.0
**Template Source:** BMAD-inspired ADR template for SCAR supervisor
