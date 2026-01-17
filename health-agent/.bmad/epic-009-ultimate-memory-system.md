# Epic 009: Ultimate Memory System - Visual Food Memory & Pattern Detection

**Date:** 2026-01-17 (Stockholm time)
**Status:** Draft
**Priority:** High
**Complexity:** 3 (Large - Multi-phase system)
**Estimated Time:** 80 hours (10 days full-time)

---

## Overview

Build the ULTIMATE memory system that makes users feel truly known by:
1. **Visual Food Memory**: Remember photos, recognize recurring meals, compare portions automatically
2. **Pattern Detection Engine**: Discover complex health patterns users don't consciously notice

**The Problem:**
- User has to tell agent protein shake proportions every time (photo or text)
- No visual memory of past meals for portion comparison
- No recognition of recurring meals or formulas
- Missing non-obvious health patterns (pasta → tiredness, stress → food choices, period cycle correlations)
- Can't find multi-factor patterns (sleep + food + stress interactions)

**The Solution:**
Four-layer hybrid memory system:
- **Layer 1**: Structured event memory (existing - food_logs, sleep_logs, etc.)
- **Layer 2**: Conversational memory (existing - Mem0 + pgvector)
- **Layer 3**: Visual food memory (NEW - image embeddings, formulas, portion comparison)
- **Layer 4**: Pattern detection (NEW - temporal correlations, multi-factor analysis)

---

## Business Value

**For Users:**
- Never repeat protein shake recipe again - automatic recognition
- "That looks like more rice than last time" - portion comparison
- Discover hidden health patterns: "You get tired after pasta when you sleep poorly"
- Proactive insights: "Your Monday low energy correlates with Sunday late eating"
- Feel truly known: Agent remembers tiny details and connects dots over time

**For Health Outcomes:**
- Identify food sensitivities and intolerances automatically
- Predict energy crashes before they happen
- Optimize nutrition based on sleep, stress, and activity patterns
- Period cycle-aware recommendations
- Behavioral pattern interruption (stress-eating prevention)

---

## Technical Architecture

### Layer 3: Visual Food Memory

**Core Tables:**
- `food_image_references`: Store photos + CLIP embeddings (vector 512)
- `recognized_plates`: Plate/container detection and size calibration
- `food_formulas`: Persistent recipes (protein shakes, recurring meals)
- `formula_usage_log`: Track formula variations over time

**Capabilities:**
- Image similarity search using pgvector HNSW indexing
- Plate recognition for portion estimation
- Formula auto-suggestion from keywords or visual cues
- Reference-based portion comparison (same plate, different amounts)

### Layer 4: Pattern Detection Engine

**Core Tables:**
- `health_events`: Unified timeline of all health events (food, sleep, mood, energy, symptoms, trackers)
- `discovered_patterns`: AI-discovered correlations with confidence scores

**Capabilities:**
- Temporal correlation detection (food → symptom within time window)
- Multi-factor pattern analysis (2-4 variables interacting)
- Temporal sequence detection (skip breakfast → overeat → guilt)
- Cycle-based patterns (menstrual, weekly, seasonal)
- Statistical significance testing (real patterns vs coincidence)
- Semantic similarity clustering (same symptom, different words)

**Analysis Types:**
- Simple correlations: "Tired after pasta"
- Multi-factor: "Tired when: pasta + poor sleep + stress"
- Sequences: "Skip breakfast → pasta lunch → energy crash"
- Cycles: "Chocolate cravings 5 days before period"
- Predictors: "Late caffeine = 72% correlation with poor sleep"

---

## Success Criteria

**Visual Food Memory:**
- ✅ Protein shake auto-recognized from photo (no caption needed)
- ✅ Portion comparison: "More rice, less chicken than last time"
- ✅ Plate recognition: "Your blue ceramic plate" with size calibration
- ✅ Formula suggestions: >80% accuracy for recurring meals
- ✅ <100ms image similarity search

**Pattern Detection:**
- ✅ Find 5+ actionable patterns per user within first month
- ✅ Statistical confidence >70% for all surfaced patterns
- ✅ Pattern discovery runs nightly in <5 minutes per user
- ✅ Agent integrates patterns into conversations naturally
- ✅ User feedback loop: Track pattern usefulness

---

## Implementation Phases

### Phase 1: Visual Reference Foundation (16 hours)

**Goal:** Store food photos with CLIP embeddings for visual similarity search

**Tasks:**
1. Create `food_image_references` table with pgvector (vector 512)
2. Integrate CLIP model (OpenAI CLIP or open-source alternative)
3. Implement image embedding generation pipeline
4. Build visual similarity search function
5. Store photos with embeddings on food log creation
6. Create pgvector HNSW index for fast retrieval
7. Test similarity search performance (<100ms requirement)

**Deliverables:**
- Migration: `021_food_image_references.sql`
- Service: `src/services/image_embedding.py`
- Database functions for visual search
- Performance benchmarks

**Dependencies:** None (independent work)

**MoSCoW:**
- Must: Store images + embeddings, similarity search
- Should: Automatic embedding on upload
- Could: Batch processing for historical images
- Won't: Advanced image preprocessing (future optimization)

---

### Phase 2: Plate Recognition & Calibration (12 hours)

**Goal:** Detect plates/containers and calibrate sizes for portion estimation

**Tasks:**
1. Create `recognized_plates` table
2. Implement plate detection from images (crop, extract features)
3. Build plate matching logic using CLIP embeddings
4. Create plate calibration system (size estimation from reference portions)
5. Store plate metadata (diameter, color, type)
6. Link food images to recognized plates
7. Test plate recognition accuracy

**Deliverables:**
- Migration: `022_recognized_plates.sql`
- Service: `src/services/plate_recognition.py`
- Calibration utilities
- Recognition accuracy report

**Dependencies:** Phase 1 (needs image embedding infrastructure)

**MoSCoW:**
- Must: Plate detection and matching
- Should: Size calibration from portions
- Could: Multi-plate support per user
- Won't: Utensil-based size estimation (too complex initially)

---

### Phase 3: Food Formulas & Auto-Suggestion (16 hours)

**Goal:** Learn and auto-suggest recurring meals and formulas

**Tasks:**
1. Create `food_formulas` and `formula_usage_log` tables
2. Implement pattern learning from food_logs (detect recurring meals)
3. Build formula detection from keywords and visual cues
4. Create auto-suggestion system
5. Implement formula matching (text + image combined)
6. Build formula management API endpoints
7. Add agent tools for formula retrieval
8. Test formula accuracy on real user data

**Deliverables:**
- Migration: `023_food_formulas.sql`
- Service: `src/services/formula_detection.py`
- Background job: Pattern learning
- Agent tools for formula access

**Dependencies:** Phase 1 (needs visual similarity for detection)

**MoSCoW:**
- Must: Formula storage, keyword matching, auto-suggest
- Should: Visual cue matching, pattern learning
- Could: Substitution suggestions
- Won't: Recipe generation (not in scope)

---

### Phase 4: Portion Comparison (12 hours)

**Goal:** Compare current photo portions to reference images

**Tasks:**
1. Implement bounding box detection for food items
2. Build area comparison algorithm (reference vs current)
3. Calculate portion estimation from visual differences
4. Integrate with Vision AI prompts (provide comparison context)
5. Create user feedback mechanism (confirm/adjust estimates)
6. Build accuracy tracking system
7. Test on real portion variations

**Deliverables:**
- Service: `src/services/portion_comparison.py`
- Vision AI prompt enhancements
- Accuracy metrics dashboard

**Dependencies:** Phase 1 & 2 (needs images + plate calibration)

**MoSCoW:**
- Must: Area-based comparison, rough estimates
- Should: Plate-calibrated measurements
- Could: ML-based portion prediction
- Won't: Exact gram precision (not realistic from photos)

---

### Phase 5: Event Timeline Foundation (8 hours)

**Goal:** Unified timeline of all health events for pattern detection

**Tasks:**
1. Create `health_events` table (unified event storage)
2. Build event ingestion pipeline from all tables (food_logs, sleep_logs, tracker_entries, etc.)
3. Implement semantic embedding generation for events
4. Create background job to populate historical events
5. Add real-time event creation hooks
6. Build event search and filtering functions
7. Create pgvector index for semantic event search

**Deliverables:**
- Migration: `024_health_events.sql`
- Service: `src/services/event_timeline.py`
- Background job: Historical data migration
- Event ingestion hooks

**Dependencies:** None (can run parallel to Phases 1-4)

**MoSCoW:**
- Must: Unified timeline, basic event storage
- Should: Semantic embeddings, historical migration
- Could: Real-time stream processing
- Won't: Event prediction (future epic)

---

### Phase 6: Pattern Detection Engine (20 hours)

**Goal:** Discover complex health patterns automatically

**Tasks:**
1. Create `discovered_patterns` table
2. Implement temporal correlation detection (food → symptom)
3. Build multi-factor pattern analyzer (2-4 variables)
4. Create temporal sequence detector (behavioral chains)
5. Implement cycle-based pattern finder (period, weekly patterns)
6. Add statistical significance testing (p-value calculations)
7. Build semantic similarity clustering (pgvector)
8. Create pattern impact scoring system
9. Implement nightly background job for pattern mining
10. Build pattern confidence update mechanism
11. Add pattern evidence tracking

**Deliverables:**
- Migration: `025_discovered_patterns.sql`
- Service: `src/services/pattern_detection.py`
- Background job: Nightly pattern mining
- Statistical analysis utilities

**Dependencies:** Phase 5 (needs event timeline)

**MoSCoW:**
- Must: Simple correlations, multi-factor analysis, statistical testing
- Should: Sequence detection, cycle patterns
- Could: Predictive modeling
- Won't: Real-time pattern detection (too expensive)

**Pattern Types to Detect:**
- Food-symptom correlations (temporal)
- Multi-factor energy patterns
- Sleep quality predictors
- Stress-eating behaviors
- Period cycle correlations
- Weekend vs weekday patterns
- Seasonal variations

---

### Phase 7: Integration & Agent Tools (8 hours)

**Goal:** Make visual memory and patterns available to agent and user

**Tasks:**
1. Create agent tool: `search_food_images()` - visual similarity search
2. Create agent tool: `get_food_formula()` - retrieve formulas
3. Create agent tool: `get_health_patterns()` - retrieve discovered patterns
4. Implement Reciprocal Rank Fusion (RRF) hybrid search
5. Build pattern surfacing logic (when to show insights)
6. Create user notification system for new patterns
7. Add pattern feedback endpoints (helpful/not helpful)
8. Update photo analysis pipeline with visual memory context
9. Test full integration workflow

**Deliverables:**
- Agent tools: `src/agent/tools/memory_tools.py`
- Hybrid search implementation
- User notification system
- Integration tests

**Dependencies:** Phases 1-6 (needs all components)

**MoSCoW:**
- Must: Agent tools, basic integration
- Should: RRF hybrid search, pattern surfacing
- Could: Pattern visualization API
- Won't: User-facing pattern editing (admin only initially)

---

## Hybrid Retrieval Strategy (RRF)

**Combine multiple search methods for best results:**

When user asks question or sends photo:
1. **Semantic text search** (Mem0 + pgvector) - conversation context
2. **Visual similarity** (CLIP embeddings) - similar food photos
3. **Structured query** (SQL) - exact food matches
4. **Formula matching** (keywords + visual cues) - recurring meals
5. **Pattern retrieval** (semantic + relevance) - discovered insights

**Reciprocal Rank Fusion scoring:**
- Merge results from all sources
- Score = Sum of (1 / (60 + rank)) for each result
- Rank by combined score
- Return top 20 results

**Sub-100ms target** using concurrent execution and HNSW indexing.

---

## Database Schema Overview

### Visual Memory Tables

**food_image_references**
- Stores: Photo paths, CLIP embeddings, food items detected, verified portions
- Links to: food_logs, recognized_plates
- Indexes: pgvector HNSW (image_embedding), user_id + created_at

**recognized_plates**
- Stores: Plate embeddings, dimensions, capacity, usage count
- Indexes: pgvector HNSW (plate_embedding), user_id

**food_formulas**
- Stores: Ingredients, portions, trigger keywords, nutritional totals
- Links to: formula_usage_log
- Indexes: GIN (trigger_keywords), user_id + formula_type

**formula_usage_log**
- Stores: Actual ingredients used each time, variations
- Links to: food_formulas, food_logs, food_image_references
- Indexes: formula_id + logged_at, user_id + logged_at

### Pattern Detection Tables

**health_events**
- Stores: All health events unified (food, sleep, mood, energy, symptoms, trackers)
- Event data in JSONB, semantic embeddings
- Indexes: pgvector HNSW (event_embedding), user_id + event_timestamp, GIN (event_data, tags)

**discovered_patterns**
- Stores: Pattern definitions, confidence scores, occurrences, evidence
- Actionable insights, impact scores
- Indexes: user_id + confidence DESC, user_id + impact_score DESC, GIN (pattern_rule)

---

## Example Workflows

### Workflow 1: Protein Shake Recognition

**User sends photo of shaker (no caption)**

**System flow:**
1. Generate CLIP embedding of image
2. Visual similarity search in food_image_references (finds previous shake photos)
3. Retrieve linked formula_id
4. Formula found: "Morning protein shake" (oat milk 400ml, protein 30g, banana 1)
5. Check recognized_plates for "blue shaker" (visual match confirms)
6. Auto-fill nutrition entry with formula portions
7. Ask user: "Is this your usual morning shake? ✅ Yes / ❌ Edit"

**User confirms**
8. Log to food_logs with full nutrition
9. Update formula_usage_log
10. Store new image_reference linked to formula
11. Update formula last_made timestamp

**Next time:** Instant recognition from visual similarity alone

---

### Workflow 2: Portion Comparison

**User sends photo: Rice and chicken on blue plate (no caption)**

**System flow:**
1. Generate image embedding
2. Detect plate → Match to "Blue ceramic dinner plate" (similarity 0.95)
3. Visual search finds reference photo from 2 days ago
4. Retrieve reference verified_portions: {rice: 150g, chicken: 200g}
5. Compare food item areas:
   - Rice area: 22,000 px² (reference: 20,000 px²) → +10% ≈ 165g
   - Chicken area: 18,000 px² (reference: 21,600 px²) → -17% ≈ 166g
6. Send to Vision AI with comparison context
7. Agent responds: "Looks like MORE rice and LESS chicken than last time. I estimate:"
   - Rice: ~165g (vs 150g last time)
   - Chicken: ~166g (vs 200g last time)
   - "Should I log these amounts?"

**User confirms or adjusts**
8. Store new image_reference with verified portions
9. Update plate calibration data

---

### Workflow 3: Pattern Discovery (Background Job)

**Nightly pattern mining runs**

**System analyzes:**
1. Load health_events for last 90 days
2. Run temporal correlation queries (all food-symptom pairs)
3. Find: Pasta lunch → Low energy (2-4 hours later) = 5 occurrences
4. Calculate statistical significance (p-value < 0.05)
5. Check for confounding factors:
   - Sleep <7hrs on those days?
   - High stress reported?
   - Multi-factor analysis
6. Pattern found: "Low energy after pasta, especially with poor sleep"
   - Confidence: 85%
   - Occurrences: 5
   - Impact score: 0.7 (high)
7. Store in discovered_patterns with evidence links
8. Surface to user next conversation

**User asks: "Why am I tired?"**

Agent retrieves pattern:
"I've noticed you tend to feel low energy 2-3 hours after eating pasta for lunch, especially on days when you've had less than 7 hours of sleep. This happened 5 times in the last 3 months.

Looking at today:
- You had pasta for lunch 2.5 hours ago ✓
- You logged 6.5 hours of sleep last night ✓

This matches your pattern with 85% confidence. Want to try a different lunch strategy on days when you sleep poorly?"

---

## Performance Requirements

**Visual Search:**
- Image embedding generation: <2 seconds per image
- Similarity search: <100ms (HNSW indexing)
- Plate recognition: <500ms

**Pattern Detection:**
- Nightly mining job: <5 minutes per user
- Pattern retrieval: <50ms
- Real-time event ingestion: <10ms

**Storage:**
- Image embeddings: 512 dimensions × 4 bytes = 2KB per image
- Estimated 1000 images/user/year = 2MB
- Event timeline: ~100 events/day × 365 days = 36,500 events/year
- Patterns: ~10-20 per user

**Database size estimate (per user, 1 year):**
- Images: 2MB (embeddings) + 500MB (actual photos)
- Events: 5MB
- Patterns: 100KB
- Total: ~507MB per user per year

---

## Testing Strategy

**Visual Memory:**
- Unit tests: Embedding generation, similarity search, plate matching
- Integration tests: Full photo upload workflow
- Performance tests: Search latency under load
- Accuracy tests: Formula detection rate, portion estimation variance

**Pattern Detection:**
- Unit tests: Correlation detection, statistical tests
- Integration tests: End-to-end pattern discovery
- Validation tests: Known patterns in synthetic data
- Performance tests: Mining job duration scaling

**User Acceptance:**
- Beta testing with real users
- Pattern usefulness tracking
- Feedback collection
- A/B test with/without visual memory

---

## Risks & Mitigations

**Risk 1: CLIP model performance**
- **Mitigation:** Test OpenAI CLIP vs open-source alternatives, benchmark on food images
- **Fallback:** Use simpler CNN embeddings if CLIP too slow

**Risk 2: Pattern false positives**
- **Mitigation:** Statistical significance testing (p-value < 0.05), minimum occurrence threshold
- **Fallback:** Conservative confidence scores, user feedback to tune

**Risk 3: Storage costs (images)**
- **Mitigation:** Compress images, thumbnail generation, cleanup old images
- **Fallback:** Store embeddings only, delete original photos after 90 days

**Risk 4: Pattern mining performance**
- **Mitigation:** Optimize queries, incremental updates, user-level parallelization
- **Fallback:** Reduce historical analysis window, sample-based mining

**Risk 5: User privacy concerns (photo storage)**
- **Mitigation:** Clear data policy, user control over deletion, encrypted storage
- **Fallback:** Opt-in visual memory, local processing only

---

## Migration Strategy

**Phase 1-4 (Visual Memory):**
- No disruption to existing system
- New tables and services added
- Gradual rollout to users
- Historical photo processing optional

**Phase 5-6 (Pattern Detection):**
- Historical data migration runs once (background job)
- Ongoing event ingestion happens automatically
- Pattern mining runs nightly (low priority queue)
- No user-facing changes until Phase 7

**Phase 7 (Integration):**
- Agent tools enabled gradually
- A/B test pattern surfacing
- User feedback collection
- Rollback plan: Disable agent tools, keep mining

**Rollback capability:** All new features can be disabled via feature flags without data loss.

---

## Future Enhancements (Not in Epic 009)

**Visual Memory:**
- Video analysis (cooking process, meal preparation)
- Brand recognition (specific protein powder, milk brand)
- Recipe generation from photo sequences
- Barcode scanning integration

**Pattern Detection:**
- Predictive modeling (forecast energy levels)
- Recommendation engine (optimal meal timing)
- Causal inference (true causation vs correlation)
- Social comparison (anonymized population patterns)

**Advanced Analytics:**
- Blood sugar pattern correlations
- Exercise-nutrition optimization
- Medication adherence patterns
- Genetic data integration

---

## Dependencies

**External:**
- CLIP model (OpenAI or open-source)
- pgvector extension (already installed)
- Image processing library (Pillow or OpenCV)
- Statistical libraries (SciPy for significance tests)

**Internal:**
- Existing food_logs, sleep_logs, tracker_entries tables
- Mem0 memory system
- Agent framework (PydanticAI)
- Background job infrastructure

**Infrastructure:**
- Disk space for images (~500MB per user per year)
- Compute for CLIP embeddings
- Database capacity for vectors and events

---

## Acceptance Criteria

**Visual Food Memory:**
- [ ] Protein shake recognized from photo alone (no caption)
- [ ] Portion comparison works: "More rice than last time"
- [ ] Plate recognition accuracy >80%
- [ ] Formula auto-suggestion accuracy >80%
- [ ] Image similarity search <100ms
- [ ] User can see and manage formulas

**Pattern Detection:**
- [ ] Discovers ≥5 actionable patterns per user (first month)
- [ ] Statistical confidence >70% for all surfaced patterns
- [ ] Nightly mining completes in <5 minutes per user
- [ ] Agent naturally integrates patterns in conversations
- [ ] User feedback mechanism working (helpful/not helpful)
- [ ] Pattern accuracy validated on test data

**Integration:**
- [ ] Agent tools functional and tested
- [ ] RRF hybrid search implemented
- [ ] Pattern surfacing logic works correctly
- [ ] No performance degradation in existing features
- [ ] User notifications for new patterns

---

## Success Metrics

**Usage Metrics:**
- % of food logs with images (target: >60%)
- Formula usage rate (target: >40% of recurring meals)
- Pattern acknowledgment rate (target: >70%)

**Quality Metrics:**
- Formula detection accuracy (target: >80%)
- Portion estimation variance (target: ±15%)
- Pattern statistical confidence (target: >70% average)

**User Satisfaction:**
- "Agent remembers me" score (target: >4.5/5)
- Pattern usefulness rating (target: >4/5)
- Feature NPS (target: >50)

**Performance Metrics:**
- Visual search latency (target: <100ms p95)
- Pattern retrieval latency (target: <50ms p95)
- Mining job duration (target: <5min per user)

---

## Timeline & Resource Allocation

**Total estimated time:** 80 hours (10 days full-time work)

**Phase breakdown:**
- Phase 1: Visual Reference Foundation - 16h (2 days)
- Phase 2: Plate Recognition - 12h (1.5 days)
- Phase 3: Food Formulas - 16h (2 days)
- Phase 4: Portion Comparison - 12h (1.5 days)
- Phase 5: Event Timeline - 8h (1 day)
- Phase 6: Pattern Detection - 20h (2.5 days)
- Phase 7: Integration - 8h (1 day)

**Parallel execution possible:**
- Phases 1-4 (Visual Memory) can run parallel to Phase 5
- Phase 6 depends on Phase 5
- Phase 7 depends on all others

**Aggressive timeline:** 2 weeks (if phases 1-5 parallelized)
**Conservative timeline:** 3 weeks (sequential development + buffer)

---

## Notes

**Key insight:** This epic combines two major systems (visual memory + pattern detection) because they're highly complementary:
- Visual memory captures WHAT user eats
- Pattern detection discovers WHY user feels certain ways
- Together: Complete understanding of user's health

**Why now:**
- Foundation already exists (Mem0, pgvector, structured data)
- User pain point clearly identified (protein shake repetition)
- High-value, high-impact feature
- Builds competitive moat (nobody else has this integration)

**Strategic importance:**
- Transforms app from "tracking tool" to "intelligent health coach"
- Creates network effects (more data → better patterns → more engagement)
- User lock-in (personalized patterns not transferable)
- Foundation for predictive features (Phase 5 in roadmap)

---

**Created by:** Supervisor (Health Agent Planning)
**Last updated:** 2026-01-17
**Next review:** After Phase 3 completion
