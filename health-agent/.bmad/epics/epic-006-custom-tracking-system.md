# Epic: Custom Tracking System - Dynamic Health Metrics

**Epic ID:** 006
**Created:** 2026-01-16
**Status:** Draft
**Complexity Level:** 2 (Medium)

## Project Context

- **Project:** health-agent
- **Repository:** https://github.com/gpt153/health-agent
- **Tech Stack:** Python, PydanticAI, PostgreSQL, python-telegram-bot
- **Related Epics:** None (standalone feature)
- **Workspace:** `/home/samuel/.archon/workspaces/health-agent/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/health-agent/`
- **Related ADR:** ADR-006: Dynamic Custom Tracking with JSONB Storage

## Business Context

### Problem Statement

Health Agent currently tracks only predefined categories (food, nutrition, sleep, gamification). Users want to track custom health metrics that matter to them personally, such as:

- Menstrual cycles (flow, cramps, mood, symptoms)
- Sexual health metrics (protection, partner information, satisfaction)
- Energy levels throughout the day
- Custom symptoms (headaches, digestive issues, fatigue)
- Medications and supplements
- Mood patterns and triggers
- Any other personal health data

**Current Limitation:** Adding new tracking categories requires schema migrations and code deployment. Users cannot define their own tracking categories.

**Real Impact:** Users who menstruate cannot track cycles, preventing the agent from providing contextual nutrition advice (e.g., "increase iron intake week before period"). Users tracking symptoms can't correlate them with sleep or nutrition patterns.

### User Value

**For Users:**
- Track EXACTLY what matters to them (not limited to predefined categories)
- Create custom trackers in seconds (no code deployment needed)
- Agent provides contextual advice based on custom patterns
- Correlate custom metrics with food, sleep, and activity
- Privacy-friendly (sensitive data like period/sex stored securely)

**Example Use Cases:**
1. **Sarah tracks her period cycle:**
   - Logs flow, cramps, mood daily
   - Agent notices pattern: "Your period starts in 3 days. Based on past cycles, increase iron-rich foods this week."
   - Agent adjusts nutrition recommendations based on cycle phase

2. **Michael tracks headaches:**
   - Logs headache severity, triggers, duration
   - Agent correlates: "You've had headaches 5 times this month, often after <6 hours sleep. Prioritize 8+ hours tonight."
   - Agent identifies pattern Michael didn't notice

3. **Emma tracks energy levels:**
   - Logs energy score 3x daily (morning, afternoon, evening)
   - Agent observes: "Energy drops at 3 PM. Recent tracking shows protein helps - try a protein snack at 2 PM."
   - Agent provides actionable advice based on Emma's data

### Success Metrics

- **User Adoption:** >50% of users create at least one custom tracker within 1 month
- **Agent Usage:** Agent references custom tracker data in >30% of conversations
- **Query Performance:** Custom tracker queries <50ms (same as rigid tables)
- **User Satisfaction:** 4.5+ stars for custom tracking feature
- **Pattern Detection:** Agent identifies correlations in >20% of custom trackers (e.g., sleep vs symptoms)

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Database schema: `tracker_definitions` table (metadata + JSON schema)
- [ ] Database schema: `tracker_entries` table (JSONB data column)
- [ ] GIN indexes on JSONB columns for query performance
- [ ] Pydantic validation: Validate entries against tracker-defined schemas
- [ ] Telegram command: `/create_tracker` (define new tracker)
- [ ] Telegram command: `/log [tracker_name]` (add entry)
- [ ] Telegram command: `/view_tracker [tracker_name]` (view history)
- [ ] PydanticAI tool: `query_custom_tracker()` (retrieve tracker data)
- [ ] Agent integration: Agent reads schema metadata to understand fields
- [ ] Agent advice: Contextual recommendations based on custom data

**SHOULD HAVE:**
- [ ] Telegram command: `/list_trackers` (show all user's trackers)
- [ ] Telegram command: `/edit_tracker [tracker_name]` (modify schema)
- [ ] Common tracker templates (period, symptoms, medications, energy, mood)
- [ ] Pattern detection: Agent identifies correlations across trackers
- [ ] Data visualization: Graph trends over time
- [ ] Reminder system: "Log your tracker" daily notifications

**COULD HAVE:**
- [ ] Share tracker templates with other users
- [ ] Export tracker data to CSV
- [ ] Advanced analytics (cycle predictions, symptom forecasting)
- [ ] Integration with wearables (import energy/sleep data)
- [ ] Multi-tracker correlation analysis

**WON'T HAVE (this iteration):**
- Social features (share trackers publicly) - Deferred to Phase 5
- Medical advice based on trackers - Requires medical compliance review
- Integration with health records (FHIR, EHR) - Enterprise feature
- Machine learning predictions - Phase 6 (after sufficient data collection)

### Non-Functional Requirements

**Performance:**
- Query time: <50ms for custom tracker queries (with GIN indexes)
- Validation overhead: <10ms per entry validation
- Database load: JSONB queries should not impact main app performance
- Cache tracker schemas in memory (avoid repeated validation overhead)

**Data Privacy:**
- Sensitive data (period, sexual health) stored in JSONB (opaque to logs)
- Users can delete trackers and all associated entries
- Agent accesses custom data only with explicit user permission
- Tracker data isolated per user (no cross-user leakage)

**Usability:**
- Tracker creation takes <2 minutes (guided flow)
- Logging entry takes <30 seconds
- Common tracker templates (1-click setup)
- Clear field descriptions (users understand what to track)

**Scalability:**
- Support 100+ custom trackers per user
- Support 10,000+ entries per tracker
- JSONB indexes ensure queries scale with data size
- Schema versioning allows tracker evolution over time

## Architecture

### Technical Approach

**Pattern:** JSONB-based flexible schema with Pydantic validation

**Key Design Decisions:**
- PostgreSQL JSONB for flexible data storage (see ADR-006)
- JSON Schema for defining tracker field types
- Pydantic models for runtime validation
- GIN indexes for fast JSONB queries
- Two-table design: definitions (metadata) + entries (data)

### Database Schema

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
CREATE INDEX idx_tracker_entries_data_gin ON tracker_entries USING GIN (data);
```

### Integration Points

**Database:**
- New tables: `tracker_definitions`, `tracker_entries`
- Migration: `020_custom_tracking.sql`
- Indexes: GIN indexes on JSONB columns

**PydanticAI Agent:**
- New tool: `query_custom_tracker(tracker_name, days_back)`
- New tool: `list_user_trackers()`
- Agent prompts updated to reference custom data

**Telegram Bot:**
- New handlers: `/create_tracker`, `/log`, `/view_tracker`, `/list_trackers`
- Conversation flow: Guided tracker creation (name, description, fields)

**Validation Layer:**
- Pydantic models: `TrackerDefinition`, `TrackerEntry`
- JSON Schema validation: Validate entries against tracker schemas
- Custom validators: Field type validators (select, multiselect, scale, date, text, number)

### Data Flow

```
User: /create_tracker "Period Cycle"
  → Telegram handler starts conversation flow
  → User defines fields: flow (select), cramps (scale), mood (multiselect)
  → System creates JSON schema
  → Store in tracker_definitions table
  → Confirm to user

User: /log period_cycle
  → Telegram handler retrieves tracker schema
  → Present fields to user (flow? cramps? mood?)
  → User provides values
  → Validate against schema (Pydantic)
  → Store in tracker_entries table (JSONB data)
  → Confirm to user

User: "How's my cycle looking?"
  → Agent calls query_custom_tracker("period_cycle", days_back=90)
  → Query retrieves entries from tracker_entries (JSONB queries)
  → Agent analyzes patterns (cycle length, symptom trends)
  → Agent provides contextual advice
```

### Key Technical Decisions

- **Decision 1:** JSONB over separate tables (see ADR-006)
- **Decision 2:** JSON Schema for validation (industry standard, Pydantic support)
- **Decision 3:** GIN indexes on JSONB (fast queries despite flexibility)
- **Decision 4:** Schema versioning (allow tracker evolution without breaking data)

### Files to Create/Modify

```
src/
├── db/
│   ├── migrations/
│   │   └── 020_custom_tracking.sql          # NEW - Database schema
│   └── queries/
│       └── custom_tracking.py               # NEW - Query functions
├── models/
│   └── custom_tracking.py                   # NEW - Pydantic models
├── agent/
│   └── tools/
│       └── custom_tracking_tools.py         # NEW - PydanticAI tools
├── telegram/
│   └── handlers/
│       └── custom_tracking_handlers.py      # NEW - Telegram commands
└── validation/
    └── tracker_schema_validator.py          # NEW - JSON Schema validation

tests/
├── test_custom_tracking_db.py               # NEW - Database tests
├── test_custom_tracking_validation.py       # NEW - Validation tests
├── test_custom_tracking_agent.py            # NEW - Agent tool tests
└── test_custom_tracking_telegram.py         # NEW - Telegram handler tests
```

## Implementation Tasks

### Phase 1: Database Schema (Issue #XX)

**Tasks:**
- Create `tracker_definitions` table with JSONB schema column
- Create `tracker_entries` table with JSONB data column
- Add GIN indexes on JSONB columns
- Write migration script `020_custom_tracking.sql`
- Test migration on development database

**Acceptance:**
- Tables created successfully
- Indexes improve query performance (verify with EXPLAIN)
- Can insert tracker definition and entries manually
- Foreign key constraints work correctly

**Estimated Effort:** 2 hours

---

### Phase 2: Validation Layer (Issue #XX)

**Tasks:**
- Create Pydantic models: `TrackerDefinition`, `TrackerEntry`
- Implement JSON Schema validation
- Build field type validators (select, multiselect, scale, date, text, number)
- Add validation tests (valid schemas, invalid data, edge cases)
- Document common field types

**Acceptance:**
- Pydantic models validate tracker schemas correctly
- Invalid entries are rejected with clear error messages
- All field types work (select, multiselect, scale, etc.)
- Test coverage >80% for validation logic

**Estimated Effort:** 4 hours

---

### Phase 3: Database Query Functions (Issue #XX)

**Tasks:**
- Create `src/db/queries/custom_tracking.py`
- Implement `create_tracker_definition(user_id, name, schema)`
- Implement `get_tracker_by_name(user_id, tracker_name)`
- Implement `create_tracker_entry(tracker_id, user_id, data)`
- Implement `get_tracker_entries(user_id, tracker_id, start_date, end_date)`
- Implement `list_user_trackers(user_id)`
- Add database tests

**Acceptance:**
- All query functions work correctly
- JSONB queries use GIN indexes (verify with EXPLAIN)
- Functions handle missing trackers gracefully
- Test coverage >80% for query functions

**Estimated Effort:** 3 hours

---

### Phase 4: PydanticAI Agent Tools (Issue #XX)

**Tasks:**
- Create `src/agent/tools/custom_tracking_tools.py`
- Implement `query_custom_tracker(tracker_name, days_back)`
- Implement `list_user_trackers()`
- Update agent prompts to reference custom data
- Add agent tool tests
- Test agent understanding of custom tracker data

**Acceptance:**
- Agent can query custom tracker data
- Agent uses schema metadata to understand fields
- Agent provides contextual advice based on custom data
- Agent tool tests pass

**Estimated Effort:** 3 hours

---

### Phase 5: Telegram Commands (Issue #XX)

**Tasks:**
- Create `src/telegram/handlers/custom_tracking_handlers.py`
- Implement `/create_tracker` command (conversation flow)
- Implement `/log [tracker_name]` command
- Implement `/view_tracker [tracker_name]` command (show recent entries)
- Implement `/list_trackers` command
- Add common tracker templates (period, symptoms, medications)
- Add Telegram handler tests

**Acceptance:**
- Users can create trackers via guided conversation
- Users can log entries quickly
- Users can view tracker history
- Common templates work (1-click setup)
- Test coverage >70% for handlers

**Estimated Effort:** 6 hours

---

### Phase 6: Agent Contextual Advice (Issue #XX)

**Tasks:**
- Update agent prompts to analyze custom tracker patterns
- Implement pattern detection (correlations, trends)
- Add example agent responses (period cycle advice, symptom correlations)
- Test agent provides relevant advice based on custom data
- Document agent capabilities

**Acceptance:**
- Agent references custom tracker data in conversations
- Agent identifies patterns (e.g., sleep vs symptoms)
- Agent provides actionable advice (e.g., nutrition adjustments)
- Users report agent advice is helpful

**Estimated Effort:** 4 hours

---

### Phase 7: Documentation & Testing (Issue #XX)

**Tasks:**
- Document common tracker templates
- Write user guide (how to create trackers)
- Add developer documentation (schema design, validation)
- Integration tests for full flow (create tracker → log entry → agent query)
- Manual testing with real users

**Acceptance:**
- User guide is clear and comprehensive
- Developer documentation explains architecture
- Integration tests cover full workflow
- Manual testing confirms usability

**Estimated Effort:** 3 hours

---

### Estimated Total Effort

- **Phase 1:** 2 hours (Database schema)
- **Phase 2:** 4 hours (Validation layer)
- **Phase 3:** 3 hours (Database queries)
- **Phase 4:** 3 hours (Agent tools)
- **Phase 5:** 6 hours (Telegram commands)
- **Phase 6:** 4 hours (Agent advice)
- **Phase 7:** 3 hours (Documentation)
- **Total:** 25 hours

## Acceptance Criteria

### Feature-Level Acceptance

- [ ] Users can create custom trackers with multiple fields
- [ ] Users can log entries for custom trackers
- [ ] Users can view tracker history
- [ ] Agent can query custom tracker data
- [ ] Agent provides contextual advice based on custom data
- [ ] Common tracker templates available (period, symptoms, medications)
- [ ] Query performance <50ms for custom trackers
- [ ] Validation prevents invalid data
- [ ] Sensitive data (period, sex) stored securely

### Code Quality

- [ ] Type hints on all functions
- [ ] Pydantic models for all data structures
- [ ] Test coverage >75% for new code
- [ ] No bare except clauses
- [ ] All functions <50 lines
- [ ] Documentation for all public functions
- [ ] Migration script tested on dev database

### Testing

- [ ] Unit tests for validation logic
- [ ] Unit tests for database queries
- [ ] Unit tests for agent tools
- [ ] Integration tests for full workflow
- [ ] Manual testing with real users
- [ ] Performance tests for JSONB queries

### Documentation

- [ ] User guide: How to create and use trackers
- [ ] Developer guide: Architecture and validation
- [ ] Common tracker templates documented
- [ ] ADR-006 referenced in code comments

## Dependencies

**Blocked By:**
- None (standalone feature, no dependencies)

**Blocks:**
- Phase 5 social features (custom trackers could be shared)
- Advanced analytics (machine learning on custom data)

**External Dependencies:**
- PostgreSQL JSONB support (already available)
- Pydantic JSON Schema support (already in use)

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| JSONB queries slower than expected | Low | Medium | GIN indexes + query optimization |
| Users struggle with schema definition | Medium | High | Common templates + guided creation flow |
| Agent can't reason about custom data | Low | High | Explicit schema metadata + example prompts |
| Validation overhead impacts performance | Low | Medium | Cache validators + async validation |
| Tracker schema changes break old data | Medium | Medium | Schema versioning + migration tools |

## Testing Strategy

### Unit Tests

- JSON Schema validation (valid/invalid schemas)
- Pydantic model validation (valid/invalid entries)
- Database query functions (create, read, list)
- Agent tool functions (query, list)
- Field type validators (select, multiselect, scale, etc.)

### Integration Tests

- Full workflow: Create tracker → Log entry → Agent query
- Telegram conversation flow: `/create_tracker` → `/log` → `/view_tracker`
- Agent contextual advice: Query custom data → Provide recommendation
- Schema versioning: Update tracker schema → Old entries still valid

### Performance Tests

- JSONB query performance (with/without GIN indexes)
- Validation overhead (100 entries, 1000 entries)
- Agent tool response time (query custom trackers)

### Manual Testing Checklist

- [ ] Create period tracker with flow, cramps, mood fields
- [ ] Log 10 entries for period tracker
- [ ] Ask agent: "How's my cycle looking?"
- [ ] Agent references tracker data and provides advice
- [ ] Create custom symptom tracker
- [ ] Log headache entries over 2 weeks
- [ ] Agent identifies correlation with sleep
- [ ] Test common tracker templates (1-click setup)
- [ ] Test `/list_trackers` shows all trackers
- [ ] Test validation rejects invalid entries

## Notes

### Design Decisions

**Why JSONB over separate tables?**
- JSONB provides flexibility without schema migrations
- GIN indexes make JSONB queries fast
- Agent reads schema metadata to understand fields
- Industry-proven approach (GitHub, Stripe, Shopify)

**Why JSON Schema for validation?**
- Industry standard for schema definition
- Pydantic has built-in JSON Schema support
- Explicit metadata helps agent reasoning
- Enables schema versioning

### Known Limitations

**What doesn't this feature do?**
- No machine learning predictions (Phase 6)
- No wearable integrations (future iteration)
- No medical advice (requires compliance review)
- No public tracker sharing (Phase 5 social features)

### Future Enhancements

**Phase 6 (Advanced Analytics):**
- Cycle length predictions (for period trackers)
- Symptom forecasting (based on patterns)
- Multi-tracker correlation analysis
- Personalized health insights

**Phase 7 (Integrations):**
- Import data from wearables (Fitbit, Apple Health)
- Export tracker data to CSV
- Integration with health records (FHIR)

**Phase 8 (Social Features):**
- Share tracker templates with friends
- Community tracker library
- Anonymous pattern insights (aggregated data)

### Common Tracker Templates

**Period Cycle:**
- Flow: select (spotting, light, medium, heavy)
- Cramps: scale (0-10)
- Mood: multiselect (irritable, sad, anxious, normal, happy)
- Symptoms: multiselect (bloating, headache, fatigue, back_pain, breast_tenderness)

**Sexual Health:**
- Protection: select (condom, birth_control, other, none)
- Partner: text (optional)
- Satisfaction: scale (1-10)
- Notes: text (optional)

**Symptoms:**
- Type: select (headache, nausea, fatigue, pain, other)
- Severity: scale (1-10)
- Duration: number (minutes)
- Triggers: multiselect (stress, food, lack_of_sleep, weather, other)

**Medications:**
- Name: text
- Dosage: text (e.g., "10mg")
- Time: time (when taken)
- Side_effects: multiselect (nausea, dizziness, fatigue, other)

**Energy Levels:**
- Time: select (morning, afternoon, evening, night)
- Energy: scale (1-10)
- Activities: multiselect (exercise, work, social, rest)

**Mood:**
- Emotion: select (happy, sad, anxious, angry, neutral)
- Intensity: scale (1-10)
- Triggers: text (optional)
- Coping: multiselect (exercise, meditation, talking, rest)

### References

- **ADR-006:** Dynamic Custom Tracking with JSONB Storage
- **PostgreSQL JSONB:** https://www.postgresql.org/docs/current/datatype-json.html
- **JSON Schema:** https://json-schema.org/
- **Pydantic JSON Schema:** https://docs.pydantic.dev/latest/usage/json_schema/
- **GitHub Issue:** (to be created)
