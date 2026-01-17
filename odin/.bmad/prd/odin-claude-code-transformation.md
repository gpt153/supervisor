# Product Requirements Document: Odin Claude Code Transformation

**PRD ID:** ODIN-CC-001
**Created:** 2026-01-16
**Last Updated:** 2026-01-16
**Status:** Approved
**Owner:** Samuel
**Project:** Odin AI Personal Assistant

---

## Executive Summary

Odin is transforming from an API-powered application to a Claude Code MCP-based architecture. This transformation will eliminate $150-240/month in API costs by leveraging the user's existing Claude Pro subscription, while adding proactive notifications, voice interface, and home automation capabilities.

**Core Value Proposition:** Save $960-2,520 annually while gaining superior AI capabilities and proactive assistance through intelligent architecture redesign.

---

## Problem Statement

### Current Situation
- Odin MVP is complete and functional (6 epics implemented)
- Uses Anthropic API for all AI operations ($60-150/month)
- Voice interface planned with OpenAI Realtime API ($90/month)
- User has Claude Pro subscription ($20/month) with unlimited Claude usage
- **User is paying twice for AI capabilities**

### User Pain Points
1. **High Operating Cost:** $150-240/month for AI operations despite already having Claude Pro
2. **Reactive Only:** Odin waits for queries instead of proactively notifying about important items
3. **No Voice Interface:** All interaction is text-based, not suitable for mobile/hands-free use
4. **No Home Control:** Cannot integrate with Home Assistant for smart home automation
5. **Limited Parallelism:** API calls are sequential, Claude Code supports parallel subagents

### Business Impact
- $1,800-2,880 per year wasted on redundant AI costs
- User cannot justify continued use at current cost
- Missing critical proactive notification capability that makes assistant truly useful
- No voice interface limits usability to desktop only

---

## Goals & Objectives

### Primary Goal
Transform Odin into an MCP tool server that works with Claude Code, eliminating API costs while enabling proactive notifications, voice interface, and home automation.

### Success Metrics
| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Monthly AI costs | $150-240 | $30-70 | Week 12 |
| Proactive notifications | 0/day | 3-10/day | Week 5 |
| Voice interaction availability | 0% | 80% | Week 7 |
| Home Assistant integrations | 0 | 5+ | Week 9 |
| User satisfaction | N/A | 9/10 | Week 12 |

### Non-Goals
- Building a custom Android app initially (using Tasker MVP instead)
- Phone calling capability (deferred to future phase)
- Continuous voice listening (intentionally excluded - using push-to-talk)
- Migration to other AI providers (committed to Claude ecosystem)
- Multi-user support (single-user focus)

---

## Target Users

### Primary User
**User Persona: Busy Professional (Samuel)**
- **Background:** Technical PM/strategist, not a coder, manages heavy email load and multiple projects
- **Needs:**
  - Proactive notifications about important emails/tasks
  - Hands-free voice interaction while driving/walking
  - Home automation control and creation
  - Cost-effective AI assistant
- **Pain Points:**
  - Information overload (100+ emails/day)
  - Paying twice for AI (Pro subscription + API costs)
  - Can't use assistant hands-free
  - Home Assistant setup too complex
- **Success Criteria:**
  - Odin proactively surfaces important items
  - Can interact via voice 80% of the time
  - Monthly costs under $70
  - Home automations created with AI help

---

## User Stories

### Core User Stories

**Story 1: Proactive Notification**
- **As a** busy professional
- **I want** Odin to proactively notify me when I have important emails
- **So that** I don't miss critical communications while staying focused
- **Acceptance Criteria:**
  - [ ] Background daemon monitors Gmail every 5 minutes
  - [ ] Intelligent triage categorizes emails as urgent/today/scheduled
  - [ ] Notification sent via preferred channel when 3+ urgent emails arrive
  - [ ] User can ask "anything new?" to see queued items
  - [ ] Notification rules configurable via YAML

**Story 2: Voice Command (Home Control)**
- **As a** homeowner
- **I want to** control my home with voice commands via Bluetooth headset
- **So that** I can turn off lights, lock doors, etc. hands-free
- **Acceptance Criteria:**
  - [ ] Press headset button to activate voice input
  - [ ] Say "turn off all lights in the house"
  - [ ] Odin executes Home Assistant automation
  - [ ] Voice confirmation within 2 seconds
  - [ ] Works while driving/walking

**Story 3: Voice-Assisted Automation Creation**
- **As a** homeowner
- **I want to** create complex home automations with AI help
- **So that** I don't need to learn Home Assistant YAML syntax
- **Acceptance Criteria:**
  - [ ] Say "Make all doors lock when I leave the property"
  - [ ] Claude Code (via MCP) analyzes available entities
  - [ ] Proposes automation with explanation
  - [ ] User approves and automation is created
  - [ ] Automation appears in Home Assistant

**Story 4: Cost-Effective Operation**
- **As a** Claude Pro subscriber
- **I want** Odin to use my Pro subscription instead of API calls
- **So that** I don't pay twice for the same AI capabilities
- **Acceptance Criteria:**
  - [ ] All AI processing uses Claude Code (free with Pro)
  - [ ] Zero Anthropic API calls for normal operations
  - [ ] Monthly costs reduced to $30-70 (VM + TTS only)
  - [ ] Savings of $80-210/month verified

**Story 5: Multi-Interface Access**
- **As a** user in different contexts
- **I want to** interact with Odin via voice, desktop, or CLI
- **So that** I can use the most appropriate interface for my current situation
- **Acceptance Criteria:**
  - [ ] Claude Desktop for quick GUI interactions
  - [ ] Claude Code for power workflows
  - [ ] Voice via Tasker for hands-free
  - [ ] All interfaces access same Odin backend via MCP
  - [ ] Context shared across interfaces

---

## Requirements

### Functional Requirements (MoSCoW)

#### MUST HAVE (Critical - Release Blockers)

1. **REQ-F01: MCP Server Implementation**
   - **Rationale:** Core architecture - Odin must expose capabilities as MCP tools
   - **Acceptance:**
     - MCP server running on both VM (main) and laptop (local agent)
     - 15+ tools exposed (email query, task management, search, etc.)
     - Claude Code can discover and call all tools
     - Tools respond within 2 seconds for typical operations

2. **REQ-F02: Intelligent Triage Daemon**
   - **Rationale:** Enables proactive notifications (critical user requirement)
   - **Acceptance:**
     - Background process monitors Gmail every 5 minutes
     - Categorizes emails using AI: urgent, today, scheduled, spam
     - Three notification queues maintained
     - Configurable rules via YAML
     - Respects quiet hours (no notifications after 10pm)

3. **REQ-F03: Dual-Instance Deployment**
   - **Rationale:** Always-on capability + local control
   - **Acceptance:**
     - VM instance running 24/7 ($10-20/month)
     - Laptop instance for local control
     - Coordination protocol between instances
     - Laptop can take instructions from VM
     - Laptop can work offline and report back

4. **REQ-F04: Basic Voice Interface (Tasker MVP)**
   - **Rationale:** Critical for hands-free use (80% of interactions)
   - **Acceptance:**
     - Tasker script on Android (Samsung Galaxy S23)
     - Push-to-talk activation (headset button or phone button)
     - Audio streaming to MCP server
     - TTS response via Chatterbox
     - End-to-end latency < 2 seconds

5. **REQ-F05: Cost Reduction**
   - **Rationale:** Primary motivation for transformation
   - **Acceptance:**
     - Zero Anthropic API calls for normal operations
     - All AI processing via Claude Code (free)
     - Total monthly costs $30-70 (VM + optional GPU)
     - Verified savings of $80-210/month

#### SHOULD HAVE (Important - High Priority)

1. **REQ-F06: Home Assistant Integration**
   - **Rationale:** Major new capability, high user value
   - **Fallback:** Can be added in Phase 5 instead of Phase 4
   - **Acceptance:**
     - Laptop instance connects to Home Assistant via REST API
     - Can query entities (lights, locks, sensors)
     - Can trigger automations
     - Can create new automations with Claude's help

2. **REQ-F07: Chatterbox TTS**
   - **Rationale:** Superior quality to ElevenLabs, free
   - **Fallback:** Use ElevenLabs API ($11/month) temporarily
   - **Acceptance:**
     - Chatterbox deployed (Mac for dev, cloud GPU for production)
     - Voice cloning from 5-10s audio sample
     - <200ms latency for TTS generation
     - Streaming audio output

3. **REQ-F08: Chat Interface**
   - **Rationale:** Text communication useful for certain contexts
   - **Fallback:** Use Claude Desktop directly (already available)
   - **Acceptance:**
     - Telegram bot or web interface
     - Text-to-MCP bridge
     - Async responses
     - Supports follow-up questions

4. **REQ-F09: On-Demand Query ("Anything New?")**
   - **Rationale:** User controls when to check queues
   - **Fallback:** Rely on scheduled notifications only
   - **Acceptance:**
     - Voice or text command "anything new?"
     - Returns summary of queued items
     - Can drill into specific categories
     - Marks items as reviewed

#### COULD HAVE (Nice to Have - Low Priority)

1. **REQ-F10: ESP32 Pendant**
   - **Value:** Dedicated push-to-talk button, fun project
   - **Acceptance:**
     - ESP32 device with button
     - BLE connection to phone
     - Triggers Tasker script
     - Battery lasts 1+ weeks

2. **REQ-F11: Multiple Notification Channels**
   - **Value:** Flexibility in how notifications arrive
   - **Acceptance:**
     - Desktop notification (if at computer)
     - Voice announcement (if headset connected)
     - Telegram message (if mobile)
     - Auto-select based on context

3. **REQ-F12: Advanced Triage Rules**
   - **Value:** More sophisticated notification logic
   - **Acceptance:**
     - ML-based sender importance scoring
     - Calendar-aware timing (don't notify during meetings)
     - Location-aware (different rules at home vs work)
     - Learning from user feedback

#### WON'T HAVE (Out of Scope - Deferred)

1. **REQ-F13: Custom Android App**
   - **Why Deferred:** Tasker MVP sufficient, avoid development bottleneck
   - **Future:** Only if Tasker proves insufficient (Phase 7+)

2. **REQ-F14: Phone Calling Capability**
   - **Why Deferred:** Complex, uncertain need
   - **Future:** Revisit after 3 months of voice usage

3. **REQ-F15: Continuous Voice Listening**
   - **Why Deferred:** User explicitly doesn't want (interruption frustration)
   - **Future:** Never (by design choice)

4. **REQ-F16: Multi-User Support**
   - **Why Deferred:** Single-user focus sufficient
   - **Future:** Only if family members want access

### Non-Functional Requirements

#### Performance
- **REQ-NFR01:** MCP tool calls respond in < 2 seconds for typical operations
- **REQ-NFR02:** Voice interface end-to-end latency < 2 seconds (PTT press to TTS start)
- **REQ-NFR03:** Email triage processing < 30 seconds per batch
- **REQ-NFR04:** Semantic search returns results in < 1 second (already achieved in MVP)

#### Security
- **REQ-NFR05:** All credentials stored in encrypted vault (already implemented)
- **REQ-NFR06:** MCP server requires authentication token
- **REQ-NFR07:** Home Assistant access token stored securely
- **REQ-NFR08:** Voice audio encrypted in transit
- **REQ-NFR09:** No sensitive data logged

#### Reliability
- **REQ-NFR10:** VM instance 99%+ uptime
- **REQ-NFR11:** Graceful degradation if VM unreachable (laptop continues independently)
- **REQ-NFR12:** Daemon auto-restarts on failure
- **REQ-NFR13:** Email monitoring resumes from last checkpoint after restart

#### Scalability
- **REQ-NFR14:** Handle 1000+ emails/day without performance degradation
- **REQ-NFR15:** Support 100+ Home Assistant entities
- **REQ-NFR16:** Maintain 1M+ email archive with sub-second search

#### Privacy
- **REQ-NFR17:** All data stays within user-controlled infrastructure
- **REQ-NFR18:** No third-party analytics or tracking
- **REQ-NFR19:** Voice audio not stored (processed and discarded)
- **REQ-NFR20:** Home Assistant data not shared with cloud services

---

## User Experience

### User Flows

#### Flow 1: Proactive Notification (Urgent Emails)
```
1. Background daemon checks Gmail (every 5 minutes)
2. Finds 3 new emails from important senders
3. AI categorizes as "urgent" based on content/sender
4. Triage system adds to urgent queue
5. Notification threshold met (3+ urgent)
6. Daemon sends notification via preferred channel
7. User receives: "You have 3 urgent emails. Want to hear about them?"
8. User says "yes" or asks "what are they?"
9. Odin summarizes via voice or shows in Claude Desktop
10. User can respond, delegate, or defer
```

#### Flow 2: Voice Command (Home Control)
```
1. User presses Aftershokz headset play button
2. Phone vibrates (Tasker confirms activation)
3. User says: "Turn off all lights in the house"
4. Audio streams to MCP server (laptop instance)
5. Speech-to-text converts to command
6. Claude Code interprets intent via MCP
7. Laptop MCP calls Home Assistant API
8. Lights turn off
9. Chatterbox generates voice response: "All lights are off"
10. Response streams back to headset (< 2 seconds total)
```

#### Flow 3: Voice-Assisted Automation Creation
```
1. User says: "Make all doors lock when I leave the property"
2. Claude Code (via MCP) queries available entities
3. Finds: door locks, phone presence sensor, geofence
4. Claude proposes automation logic
5. Odin responds: "I can create an automation that locks Front Door,
   Back Door, and Garage Door when your phone leaves the home zone.
   Should I proceed?"
6. User confirms: "Yes, do it"
7. MCP creates Home Assistant automation via API
8. Response: "Done. Your doors will now lock automatically when you leave."
9. User tests by stepping outside
```

#### Flow 4: On-Demand Query
```
1. User asks (voice or text): "Anything new?"
2. MCP queries triage queues
3. Finds: 2 urgent, 5 today, 12 scheduled
4. Odin responds: "You have 2 urgent emails and 5 items for today.
   Want me to go through them?"
5. User can drill into categories or defer
6. Items marked as reviewed in database
```

### UI/UX Considerations
- **Voice-First Design:** Default assumption is voice interaction (hands-free)
- **Conversational:** Natural language, not command syntax
- **Contextual:** Odin remembers conversation state
- **Multi-Modal:** Seamlessly switch between voice, GUI, CLI
- **Non-Intrusive:** Notifications respect quiet hours and context
- **Transparent:** Always explain what Odin is doing and why
- **Recoverable:** Easy to undo or modify actions

---

## Technical Considerations

### Architecture Overview
Hybrid dual-instance architecture:
- **VM Instance (Main):** Always-on, handles background monitoring, coordinates work
- **Laptop Instance (Local Agent):** Local control, Home Assistant bridge, offline capability
- **MCP Protocol:** Both instances expose tools to Claude Code
- **Coordination:** Laptop can receive instructions from VM, work independently, report results

See: `/home/samuel/supervisor/odin/.bmad/architecture/CLAUDE-CODE-MCP-ARCHITECTURE.md`

### Technology Stack
- **Backend:** Python + FastAPI (existing Odin stack)
- **MCP Server:** Python MCP SDK
- **Voice Processing:**
  - STT: Android built-in or Whisper
  - TTS: Chatterbox (self-hosted)
- **Database:** PostgreSQL + pgvector (existing)
- **Messaging:** WebSocket for real-time coordination
- **Infrastructure:**
  - VM: DigitalOcean/Hetzner ($10-20/month)
  - Dev: MacBook Pro (Apple Silicon)
  - Production TTS: Optional cloud GPU ($30-138/month)

### Integration Points
- **Internal:**
  - Existing Odin services (email, tasks, search)
  - Triage daemon ↔ MCP server
  - VM instance ↔ Laptop instance
- **External:**
  - Claude Code (MCP client)
  - Gmail API (existing)
  - Google Drive API (existing)
  - Google Calendar API (existing)
  - Home Assistant REST API (new)
  - Chatterbox TTS (new)

### Data Model (High-Level)
Existing models continue:
- Email, Task, SearchIndex (unchanged)

New models:
- **TriageQueue:** urgent_queue, today_queue, scheduled_queue
- **TriageRule:** configurable notification rules
- **NotificationLog:** track what was sent when
- **VoiceSession:** track voice interactions
- **HomeAssistantEntity:** cache of HA devices/automations

### Technical Constraints
- Must maintain existing Odin MVP functionality (no regressions)
- MCP server must work with both Claude Desktop and Claude Code
- Voice latency must be < 2 seconds end-to-end
- All processing local or user-controlled cloud (privacy)
- Budget: Total monthly costs $30-70

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MCP protocol changes | Low | High | Pin SDK version, monitor announcements |
| Claude Code rate limits | Medium | Medium | Implement exponential backoff, queue requests |
| Chatterbox deployment complexity | Medium | Low | Use ElevenLabs as fallback ($11/month) |
| Home Assistant API changes | Low | Medium | Version pin, comprehensive error handling |
| Tasker limitations on Android | Medium | Medium | Document workarounds, custom app as backup plan |
| VM downtime | Low | Medium | Laptop instance continues independently |

---

## Dependencies

### Prerequisites
- [x] Odin MVP complete (6 epics implemented)
- [x] Docker deployment working
- [x] PostgreSQL + pgvector operational
- [x] Gmail/Drive/Calendar integrations functional
- [ ] Claude Pro subscription active (user has this)
- [ ] VM provisioned and accessible
- [ ] Home Assistant access token obtained
- [ ] Chatterbox installed locally for testing

### Parallel Work
- Phase 1 (MCP Server) and Phase 2 (Triage Daemon) can be developed in parallel
- Voice interface testing can happen alongside Home Assistant integration
- Chat interface can be built anytime after Phase 1

### Downstream Impact
- Existing Odin API endpoints can be deprecated gradually
- Anthropic API integration can be removed after verification
- OpenAI Realtime API plan (ADR-004) superseded by this architecture

---

## Epic Breakdown

This PRD maps to the following implementation phases:

1. **Phase 1: MCP Server Foundation** (Priority: Critical)
   - Estimated effort: 2-3 weeks
   - Deliverables:
     - MCP server running on VM and laptop
     - 15+ tools exposed (email, tasks, search, calendar, drive)
     - Authentication and authorization
     - Coordination protocol between instances
   - GitHub issues: TBD

2. **Phase 2: Intelligent Triage Daemon** (Priority: Critical)
   - Estimated effort: 2-3 weeks
   - Deliverables:
     - Background daemon monitoring Gmail
     - AI-powered email categorization
     - Three-queue system (urgent, today, scheduled)
     - YAML-based rule configuration
     - Notification delivery mechanism
   - GitHub issues: TBD

3. **Phase 3: Voice Interface MVP** (Priority: High)
   - Estimated effort: 1-2 weeks
   - Deliverables:
     - Tasker script for push-to-talk
     - Audio streaming to MCP server
     - STT integration (Android or Whisper)
     - Chatterbox TTS integration
     - End-to-end voice flow working
   - GitHub issues: TBD

4. **Phase 4: Home Assistant Integration** (Priority: High)
   - Estimated effort: 1-2 weeks
   - Deliverables:
     - REST API client for Home Assistant
     - Entity query and control via MCP tools
     - Automation creation with AI assistance
     - SSH bridge from laptop to local HA instance
   - GitHub issues: TBD

5. **Phase 5: Chat Interface** (Priority: Medium)
   - Estimated effort: 1 week
   - Deliverables:
     - Telegram bot or web interface
     - Text-to-MCP bridge
     - Async messaging support
   - GitHub issues: TBD

6. **Phase 6: Testing & Polish** (Priority: Critical)
   - Estimated effort: 2 weeks
   - Deliverables:
     - Comprehensive integration testing
     - Performance optimization
     - Documentation (user guide, deployment guide)
     - Cost verification
     - User acceptance testing
   - GitHub issues: TBD

**Total Estimated Effort:** 9-12 weeks

---

## Timeline & Milestones

### Development Phases

**Phase 1: MCP Foundation (Weeks 1-3)**
- Milestone: MCP server operational with core tools
- Deliverable: Claude Code can query emails, tasks, search via MCP

**Phase 2: Proactive Triage (Weeks 2-5)**
- Milestone: Intelligent notifications working
- Deliverable: User receives proactive notifications about urgent items

**Phase 3: Voice MVP (Weeks 4-7)**
- Milestone: Push-to-talk voice interface operational
- Deliverable: User can control Odin via voice on headset

**Phase 4: Home Control (Weeks 6-9)**
- Milestone: Home Assistant integration complete
- Deliverable: User can control home and create automations via voice

**Phase 5: Chat Interface (Weeks 8-9)**
- Milestone: Text-based interface available
- Deliverable: User can interact via Telegram or web

**Phase 6: Polish & Deploy (Weeks 10-12)**
- Milestone: Production-ready system
- Deliverable: Full deployment with verified cost savings

### Release Plan
- **Alpha:** Week 3 - MCP server testing
- **Beta:** Week 7 - Voice interface testing
- **GA:** Week 12 - Full production deployment with all features

---

## Testing Strategy

### Test Coverage
- **Unit Tests:**
  - MCP tool handlers
  - Triage categorization logic
  - Home Assistant API client
  - Voice processing pipeline
- **Integration Tests:**
  - MCP server ↔ Claude Code
  - VM ↔ Laptop coordination
  - Voice flow (STT → Claude → TTS)
  - Home Assistant control
- **E2E Tests:**
  - Full proactive notification flow
  - Voice command to home control
  - Automation creation workflow
  - On-demand query flow
- **Performance Tests:**
  - MCP tool latency under load
  - Voice interface latency
  - Email triage processing speed
- **Cost Verification:**
  - Monitor API usage (should be zero)
  - Track VM costs
  - Verify savings target met

### Testing Timeline
- **Development:** Unit tests written alongside code
- **Integration:** Continuous throughout phases
- **E2E:** Week 10
- **User Acceptance:** Week 11-12

### Acceptance Criteria (Feature-Level)
- [ ] All MUST HAVE requirements implemented
- [ ] All SHOULD HAVE requirements implemented (or acceptable fallback)
- [ ] All unit tests pass (>80% coverage)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] MCP server responds in < 2 seconds for typical operations
- [ ] Voice interface latency < 2 seconds
- [ ] Proactive notifications working reliably
- [ ] Home Assistant control working
- [ ] Monthly costs verified at $30-70
- [ ] Zero Anthropic API calls for 1 week of normal use
- [ ] User satisfaction 9/10 or higher
- [ ] Documentation complete (user guide + deployment guide)

---

## Risks & Mitigation

### High-Priority Risks

**Risk 1: MCP Protocol Instability**
- **Probability:** Medium
- **Impact:** High
- **Description:** MCP is relatively new, protocol could change breaking our implementation
- **Mitigation:**
  - Pin MCP SDK version
  - Monitor Anthropic announcements
  - Comprehensive error handling
  - Fallback to direct API if MCP unavailable
- **Contingency:** Maintain API-based code path for 3 months as backup

**Risk 2: Voice Latency Unacceptable**
- **Probability:** Medium
- **Impact:** High
- **Description:** End-to-end voice latency > 2 seconds makes assistant unusable
- **Mitigation:**
  - Streaming audio (don't wait for complete utterance)
  - Local STT if Android too slow
  - Chatterbox on low-latency GPU
  - Optimize MCP call paths
- **Contingency:** Fall back to OpenAI Realtime API ($90/month) if latency insurmountable

**Risk 3: Tasker Limitations**
- **Probability:** Medium
- **Impact:** Medium
- **Description:** Tasker may not handle audio streaming or Bluetooth well
- **Mitigation:**
  - Prototype early (Week 4)
  - Document workarounds
  - Engage Tasker community for solutions
- **Contingency:** Build custom Android app (3-4 weeks additional) if Tasker insufficient

**Risk 4: Claude Code Rate Limits**
- **Probability:** Medium
- **Impact:** Medium
- **Description:** Heavy usage may hit Claude Pro rate limits
- **Mitigation:**
  - Implement request queuing
  - Exponential backoff on limits
  - Cache frequently used results
  - Batch operations where possible
- **Contingency:** Upgrade to Max tier if needed, still cheaper than API

### Medium-Priority Risks

**Risk 5: VM Reliability**
- **Probability:** Low
- **Impact:** Medium
- **Description:** VM downtime breaks proactive notifications
- **Mitigation:** Laptop instance continues independently, queues sync on reconnect
- **Contingency:** Move to more reliable provider if needed

**Risk 6: Home Assistant Breaking Changes**
- **Probability:** Low
- **Impact:** Low
- **Description:** HA updates could break REST API integration
- **Mitigation:** Pin HA version, comprehensive error handling, version checks
- **Contingency:** Update integration code, usually minor changes

---

## Open Questions

### Unresolved Decisions

1. **Question: Exact notification thresholds**
   - **Options:**
     - A: 3+ urgent emails triggers notification
     - B: 5+ urgent emails triggers notification
     - C: User-configurable threshold
   - **Decision needed by:** End of Phase 2
   - **Decision maker:** User (via testing)

2. **Question: Chatterbox deployment location**
   - **Options:**
     - A: Mac for dev + cloud GPU for production ($30-138/month)
     - B: Mac only (intermittent availability)
     - C: ElevenLabs API ($11/month) initially, Chatterbox later
   - **Decision needed by:** Week 5
   - **Decision maker:** User (cost vs quality tradeoff)

3. **Question: Chat interface platform**
   - **Options:**
     - A: Telegram bot (easy, user already uses Telegram)
     - B: Web interface (more control, requires hosting)
     - C: Both
   - **Decision needed by:** Week 8
   - **Decision maker:** User (preference)

### Research Needed
- [ ] Confirm Android STT quality sufficient (vs local Whisper)
- [ ] Test Aftershokz headset button capabilities with Tasker
- [ ] Verify Home Assistant REST API has all needed capabilities
- [ ] Confirm Claude Pro rate limits sufficient for expected usage

---

## Stakeholder Sign-Off

| Stakeholder | Role | Status | Date |
|-------------|------|--------|------|
| Samuel | Product Owner | ☑ Approved | 2026-01-16 |
| Claude Supervisor | Planning Lead | ☑ Approved | 2026-01-16 |

---

## Appendix

### Related Documents
- [Architecture Plan](/home/samuel/supervisor/odin/.bmad/architecture/CLAUDE-CODE-MCP-ARCHITECTURE.md)
- [Handoff Document](/home/samuel/supervisor/odin/.bmad/HANDOFF-CLAUDE-CODE-PLANNING.md)
- [Chatterbox TTS Research](/home/samuel/supervisor/odin/research/chatterbox-deployment-options.md)
- [Mobile App Analysis](/home/samuel/supervisor/odin/research/mobile-app-fork-analysis.md)
- [Existing ADR-003: MCP Architecture](/home/samuel/supervisor/odin/.bmad/adr/003-mcp-architecture-integrations.md)
- [Existing ADR-004: Voice Interface](/home/samuel/supervisor/odin/.bmad/adr/004-voice-interface-realtime-api.md) (superseded)

### References
- [Claude Cowork Announcement](https://claude.com/blog/cowork-research-preview)
- [Model Context Protocol (MCP) Documentation](https://modelcontextprotocol.io/)
- [Chatterbox TTS Project](https://github.com/chatterbox-ai/chatterbox)
- [Home Assistant REST API](https://developers.home-assistant.io/docs/api/rest/)

### Cost Breakdown
**Current (API-based):**
- Anthropic API: $60-150/month
- OpenAI Realtime API (planned): $90/month
- **Total: $150-240/month**

**New (Claude Code + MCP):**
- Claude Pro subscription: $20/month (already paying)
- VM hosting: $10-20/month
- Chatterbox GPU (optional): $0-30/month
- **Total: $30-70/month**
- **Net new cost: $10-50/month**
- **Savings: $80-210/month = $960-2,520/year**

### Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-16 | Claude Supervisor | Initial draft based on architecture planning |

---

**PRD Status:** Approved - Ready for Implementation
**Next Step:** Create GitHub issues for Phase 1 (MCP Server Foundation)
