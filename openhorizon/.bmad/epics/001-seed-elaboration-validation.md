# Epic: Seed Elaboration Validation & Documentation

**Epic ID:** 001
**Created:** 2026-01-18
**Status:** Active
**Complexity Level:** 2

## Project Context

- **Project:** openhorizon (Project Pipeline Management System)
- **Repository:** https://github.com/gpt153/openhorizon.cc
- **Tech Stack:** Fastify + TypeScript (backend), React + Vite (frontend), PostgreSQL, Redis, Weaviate, MinIO
- **Related Epics:** None (first epic for pipeline validation phase)
- **Workspace:** `/home/samuel/.archon/workspaces/openhorizon.cc/`
- **Worktree Base:** `/home/samuel/.archon/worktrees/openhorizon.cc/`

## Business Context

### Problem Statement
The intelligent seed elaboration system is fully implemented on the backend but has not been comprehensively tested or documented. Users need confidence that the conversational AI flow, automatic project generation, and all generators work correctly across various Erasmus+ project scenarios.

### User Value
Validation and documentation ensure:
- Project coordinators can reliably convert seed ideas to complete projects in under 2 minutes
- Budget allocation is accurate based on Erasmus+ best practices
- Timeline calculations account for all required preparation periods
- Generated checklists cover all mandatory requirements (visas, permits, insurance)
- The system prevents costly mistakes (missed deadlines, budget overruns)

### Success Metrics
- Seed elaboration completion rate: >80% of started sessions complete all 7 questions
- Project generation success rate: 100% of complete seeds convert without errors
- User time to first project: <15 minutes from brainstorm to generated timeline
- Generator accuracy: Budget allocations sum to 100%, timeline phases are sequential, no overlapping dates
- Documentation completeness: All endpoints documented, user walkthrough available

## Requirements

### Functional Requirements (MoSCoW)

**MUST HAVE:**
- [ ] Integration tests for complete seed elaboration flow (7 questions)
- [ ] Validation tests for all generators (timeline, budget, phase, requirements, checklist)
- [ ] End-to-end test: brainstorm → elaborate → convert → view project
- [ ] API documentation for new endpoints (`/elaborate/start`, `/elaborate/answer`, `/elaborate/status`)
- [ ] User walkthrough guide with screenshots
- [ ] Verification that frontend UI exists for conversational elaboration

**SHOULD HAVE:**
- [ ] Test scenarios for edge cases (small/large projects, long-distance travel, workshop-heavy)
- [ ] Performance benchmarks (elaboration response time, project generation time)
- [ ] Error handling validation (incomplete data, invalid dates, budget mismatches)
- [ ] Developer documentation for generator modules

**COULD HAVE:**
- [ ] Video tutorial showing conversational flow
- [ ] Analytics tracking for completeness rates
- [ ] A/B testing framework for question phrasing optimization

**WON'T HAVE (this iteration):**
- Question flow enhancements (skip option, edit previous answers) - deferred to v2
- Quick start templates (small/medium/large preset projects) - deferred to v2
- Country-specific visa requirements API integration - use hardcoded logic for now

### Non-Functional Requirements

**Performance:**
- Response time: <5 seconds per elaboration question (GPT-4o API call)
- Project generation: <2 seconds for all generators in parallel
- Total time: <40 seconds from first question to complete project

**Security:**
- Seed metadata is user-scoped (can only elaborate own seeds)
- API endpoints require JWT authentication
- No sensitive data in elaboration logs

**Accessibility:**
- Question flow is keyboard navigable
- Screen reader compatible
- Clear error messages for validation failures

**Scalability:**
- Generators are stateless (parallelizable)
- Database transactions prevent partial project creation
- OpenAI API rate limits handled gracefully

## Architecture

### Technical Approach
**Pattern:** Test-driven validation of existing implementation
**Testing Framework:** Jest for unit/integration tests, Playwright for E2E
**Documentation:** OpenAPI spec for API, Markdown for user guides

### Integration Points
- **Backend:** Seed elaboration agent, generator modules, API endpoints
- **Database:** Seed table (metadata JSONB field), SeedElaboration table (session history)
- **External APIs:** OpenAI GPT-4o (elaboration), Claude 3 (domain agents)
- **Frontend:** Conversational UI components (needs verification)

### Data Flow
```
User starts elaboration → POST /seeds/:id/elaborate/start →
SeedElaborationAgent.startSession() → First question returned →
User answers → POST /seeds/:id/elaborate/answer →
GPT-4o extracts structured data → Metadata updated →
Next question returned → Repeat 7 times →
User clicks "Convert" → POST /seeds/:id/convert →
Generators run in parallel (timeline, budget, requirements) →
PhaseGenerator creates 7+ phases → Database transaction →
Complete project returned with timeline, budget, phases
```

### Key Technical Decisions
- **Decision 1:** Use existing backend implementation (see ADR-001: Fastify Backend)
- **Decision 2:** Test generators in isolation and integration (see ADR-002: Modular Generators)
- **Decision 3:** Validate frontend UI exists before E2E testing (see ADR-003: Vite + React Frontend)

### Files to Validate/Test
```
backend/src/
├── seeds/
│   ├── seeds.routes.ts          # VALIDATE - API endpoints work
│   ├── seeds.service.ts         # TEST - Service layer logic
│   └── generators/
│       ├── timeline-generator.ts    # TEST - Timeline calculations
│       ├── budget-allocator.ts      # TEST - Budget percentages
│       ├── phase-generator.ts       # TEST - Phase creation
│       ├── requirements-analyzer.ts # TEST - Visa/permit detection
│       └── checklist-generator.ts   # TEST - Checklist completeness
├── ai/agents/
│   └── seed-elaboration-agent.ts    # TEST - Question flow

frontend/src/
├── services/
│   └── seeds.api.ts             # VALIDATE - API client integration
├── components/                  # VERIFY - UI components exist
│   └── [seed-elaboration-ui?]   # Unknown - needs investigation

tests/
├── integration/
│   └── seed-elaboration.test.ts # CREATE - Full flow tests
└── e2e/
    └── seed-to-project.spec.ts  # CREATE - E2E tests
```

## Implementation Tasks

### Breakdown into GitHub Issues

**Issue #1: Integration Testing - Seed Elaboration Flow**
- Write integration tests for 7-question flow
- Test metadata extraction accuracy (various phrasings)
- Test validation logic (participant count, dates, budget ranges)
- Test completeness calculation (0-100%)
- Test session state management
- Acceptance: All 7 questions process correctly, metadata is accurate

**Issue #2: Integration Testing - Generator Modules**
- Test timeline-generator (preparation, exchange, follow-up periods)
- Test budget-allocator (percentage allocations, adjustments)
- Test phase-generator (7+ phases created with correct dates)
- Test requirements-analyzer (visa detection, insurance, permits)
- Test checklist-generator (phase-specific tasks, deadline-aware)
- Acceptance: All generators produce valid output for various scenarios

**Issue #3: Frontend UI Verification & Completion**
- Check if UI components exist for `/elaborate/start` and `/elaborate/answer`
- If missing: Create conversational UI components
- If exists: Test and refine UX
- Add completeness progress indicator
- Add validation error display
- Acceptance: User can complete full Q&A flow in browser

**Issue #4: End-to-End Testing - Various Scenarios**
- Scenario 1: Small project (20 participants, 5 days, €10k)
- Scenario 2: Large project (60 participants, 14 days, €50k)
- Scenario 3: Long-distance travel (non-EU countries, visas needed)
- Scenario 4: Workshop-heavy program (5+ workshops, activities budget +5%)
- Scenario 5: Short duration (3 days, optimized food/travel)
- Acceptance: All scenarios generate valid projects

**Issue #5: User Documentation**
- Create walkthrough guide with screenshots
- Document conversational flow (question types, validation)
- Explain completeness indicator
- Explain budget allocation logic
- Explain timeline calculation
- Acceptance: Non-technical user can follow guide and create project

**Issue #6: API Documentation**
- Create OpenAPI spec for seed elaboration endpoints
- Document request/response schemas
- Document error codes
- Add example requests/responses
- Acceptance: Developers can integrate endpoints without guessing

**Issue #7: Deployment Validation**
- Test seed elaboration in staging environment
- Verify OpenAI API key configuration
- Check performance metrics (response time, generation time)
- Monitor error rates
- Acceptance: System works in production-like environment

### Estimated Effort
- Backend testing: 16 hours (Issues #1, #2)
- Frontend verification: 8 hours (Issue #3)
- E2E testing: 12 hours (Issue #4)
- User documentation: 8 hours (Issue #5)
- API documentation: 4 hours (Issue #6)
- Deployment validation: 4 hours (Issue #7)
- Total: 52 hours (~2 weeks)

## Acceptance Criteria

**Feature-Level Acceptance:**
- [ ] User can complete 7-question elaboration flow without errors
- [ ] All questions extract metadata correctly from natural language
- [ ] Completeness indicator shows 0-100% progress accurately
- [ ] Generated projects have sequential phases with correct dates
- [ ] Budget allocations sum to 100%
- [ ] Checklists include all mandatory requirements (visas, permits, insurance)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] API documentation is complete
- [ ] User walkthrough guide exists with screenshots

**Code Quality:**
- [ ] Test coverage >80% for generator modules
- [ ] No TypeScript errors in test files
- [ ] No flaky tests (all tests pass consistently)
- [ ] No mock implementations in production code (verified)

**Documentation:**
- [ ] All API endpoints documented (OpenAPI spec)
- [ ] User guide includes visual walkthrough
- [ ] Generator logic explained (timeline, budget calculations)
- [ ] Error handling documented

## Dependencies

**Blocked By:**
- None (backend implementation is complete)

**Blocks:**
- Future enhancements (quick start templates, answer editing, question skip)

**External Dependencies:**
- OpenAI GPT-4o API (required for elaboration)
- Frontend UI components (needs verification if they exist)

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Frontend UI doesn't exist for new endpoints | Medium | High | Issue #3 creates UI if missing |
| OpenAI API rate limits during testing | Low | Medium | Use mocked responses for unit tests, real API for integration |
| Edge cases break generators | Medium | Medium | Comprehensive test scenarios (Issue #4) |
| User guide takes longer than expected | Low | Low | Use screenshots from E2E tests |

## Testing Strategy

### Unit Tests
- JWT token generation/validation
- Metadata extraction (GPT-4o structured outputs)
- Timeline calculations (preparation, exchange, follow-up periods)
- Budget allocation percentages
- Visa requirement detection (EU vs non-EU logic)
- Checklist generation for each phase type

### Integration Tests
- Complete 7-question elaboration flow
- Seed → project conversion (all generators)
- Database transaction handling
- API endpoint responses (status codes, schemas)

### E2E Tests
- Brainstorm → elaborate → convert → view project
- Various project scenarios (small/large, domestic/international)
- Error handling (invalid data, incomplete elaboration)
- UI interactions (question flow, progress indicator)

### Manual Testing Checklist
- [ ] Start elaboration with seed ID
- [ ] Answer all 7 questions with natural language
- [ ] See completeness progress increase (0% → 100%)
- [ ] Convert seed to project (button click)
- [ ] View generated project in Gantt timeline
- [ ] Verify budget breakdown sums to 100%
- [ ] Verify all phases have dates, budgets, checklists
- [ ] Check visa requirements appear for non-EU countries

## Notes

### Design Decisions
The implementation is already complete. This epic focuses on validation and documentation to ensure production readiness. We chose to test thoroughly rather than enhance prematurely.

### Known Limitations
- Hardcoded EU country lists (not externalized to config)
- No caching for repeated calculations (acceptable for current scale)
- No question flow enhancements (skip, edit previous answers) in v1

### Future Enhancements
- Quick start templates (small/medium/large preset projects)
- Question skip option for optional fields
- Edit previous answers during elaboration
- Preview generated project before saving
- Analytics dashboard for completion rates
- Country-specific visa API integration
- Activity-based timeline adjustments

### References
- Analysis: `/home/samuel/supervisor/openhorizon/.bmad/analysis/pipeline-analysis.md`
- PRD: `/home/samuel/.archon/workspaces/openhorizon.cc/project-pipeline/PRD.md` (in issue-134 branch)
- ADR-001: Fastify Backend
- ADR-002: Modular Generators
- ADR-003: Vite + React Frontend
