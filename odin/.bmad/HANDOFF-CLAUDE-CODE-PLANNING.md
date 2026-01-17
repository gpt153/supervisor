# Handoff Document: Odin Architecture Planning Session

**Date:** 2026-01-16
**Session Topic:** Transitioning Odin from API-based to Claude Code + MCP architecture
**Status:** ✅ Planning COMPLETE - All decisions made, ready for implementation
**Planning Lead:** Claude Sonnet 4.5 (Supervisor)
**Next Agent:** Ready for implementation phase

---

## What You Need to Know

### Project Context

**Odin** is an AI personal assistant (like JARVIS) that the user is building. It manages their entire digital life:
- Email intelligence (Gmail API integration with multi-account support)
- Task management with AI prioritization
- Semantic search across all information
- Email automation (drafts, sending)
- Google Drive integration
- Google Calendar integration
- **NEW:** Home Assistant integration (coming)
- **NEW:** Voice interface via Android + BT headset (coming)

**Current Status:**
- MVP is **100% complete** (6 epics implemented)
- Fully Dockerized and ready to deploy
- Google OAuth integration complete (multi-account support)
- Gmail, Drive, Calendar services all implemented
- **Currently uses Anthropic API** for AI processing (costs $60-150/month)

### The Big Pivot

**User wants to change the architecture fundamentally:**

Instead of:
```
Odin → Anthropic API → $$$ per operation
```

Do this:
```
User ← → Claude Code (free via Pro sub) ← MCP → Odin (tool server)
```

**Why?**
1. User has Claude Pro subscription (unlimited Claude usage)
2. Currently paying twice (Pro sub + API costs)
3. Save $150-240/month by using Pro subscription instead of API
4. Claude Code can use subagents for parallel processing
5. Better UX - Claude sees full context via MCP

---

## User's 5 Key Requirements

### 1. ✅ Cost Efficiency
- User has Claude Pro subscription (Max tier)
- Wants to use Claude Code instead of API calls
- Save $150-240/month
- Claude Code supports subagents (parallel processing)

### 2. 📚 Learn from Claude Cowork
- Cowork = agentic Claude for knowledge work (Jan 2026 research preview)
- User wants to steal ideas:
  - Planning before execution
  - Parallel workstreams
  - Progress updates
  - Finished outputs
  - File system integration

### 3. 🔔 Proactive Initiation (CRITICAL)
**User's exact words:** "I want the other way around. I want Odin to initiate."

**Example:** "You have 3 new important emails, do you want me to tell you about them?"

**The Challenge:**
- Claude Code/Desktop are reactive (user-initiated)
- User wants proactive (Odin-initiated)
- Need background daemon that monitors and notifies
- Then hands off to Claude Code when user engages

### 4. 🎤 Voice Interface (Android + BT Headset)
**User's exact words:** "A big portion of my communication with Odin will be voice. Via Android phone and BT-headset."

**Requirements:**
- Android app
- Bluetooth headset integration
- Voice input/output
- Must work with Claude Code architecture (not OpenAI Realtime API)

**Old plan:** ADR-004 (OpenAI Realtime API - $90/month)
**New plan:** Free Android TTS/STT + Claude Code via MCP

### 5. 🏠 Home Assistant Integration
**User's exact words:** "I also want Odin to connect to my Home Assistant. Both to trigger automations like 'turn off all lights in the house' but also to help me build new stuff. 'Make it so all doors lock automatically when I leave the property.'"

**Two use cases:**
- Simple commands (turn off lights)
- Help create complex automations (with Claude's intelligence)

---

## What We've Documented

**Created comprehensive architecture document:**
`/home/samuel/supervisor/odin/.bmad/architecture/CLAUDE-CODE-MCP-ARCHITECTURE.md`

**This document contains:**
- Complete architecture diagrams
- All 5 user requirements addressed
- Proactive daemon design
- MCP tool specifications (15+ tools)
- Voice interface architecture (Android app)
- Home Assistant integration details
- Cost analysis (savings calculation)
- Implementation phases (5 phases, 9-13 weeks)
- Open questions that need answers
- Migration strategy

**Key architectural decisions:**
- Hybrid architecture: Proactive daemon + Reactive Claude Code
- MCP server exposes Odin capabilities as tools
- Android app handles voice I/O (free)
- Home Assistant via REST API
- Background monitoring with threshold-based notifications

---

## Open Questions (Need User Input)

### 1. MCP Server Deployment
**Where should Odin MCP server run?**

Options:
- **Local** (user's desktop): Privacy, no cost, but only when computer on
- **Cloud** (VPS): Always available, but hosting cost + privacy concerns
- **Hybrid:** Local primary + cloud fallback

**Ask user:** Their preference and use case (mostly at home? Often traveling?)

---

### 2. Home Assistant Details
**User's Home Assistant setup:**

Need to know:
- Where is it deployed? (local URL like `http://homeassistant.local:8123` or cloud)
- How is authentication set up? (need long-lived access token)
- What entities do they have? (lights, locks, sensors, etc.)
- Any specific automations they want to create first?

**Ask user:** For their Home Assistant URL and access token

---

### 3. Notification Preferences
**When should Odin proactively notify?**

Current defaults (need confirmation):
- 3+ urgent emails → notify
- Meeting in 30 minutes → notify
- Overdue tasks → notify
- Home security alerts → notify
- Time restrictions: no notifications after 10pm?

**Ask user:** Their preferences for notification thresholds and timing

---

### 4. Android App Details
**User's phone and headset:**

Need to know:
- Android version?
- Bluetooth headset model? (for button integration testing)
- Preferred notification method (push, voice, both)?

**Ask user:** Phone details and headset model

---

### 5. Claude Interface Preference
**Which Claude interface to use primarily?**

Options:
- **Claude Desktop:** GUI, easier for quick interactions, Cowork available
- **Claude Code:** CLI, better for development, subagent support
- **Both:** Desktop for daily use, Code for advanced workflows

**Ask user:** Their preference

---

## Current Implementation Status

### ✅ Completed (Ready to Use)
- Epic 001: Project Foundation (database, models, testing)
- Epic 002: Email Ingestion (Gmail API, multi-account)
- Epic 003: AI Processing Pipeline (categorization, priority, summaries)
- Epic 004: Semantic Search (pgvector, sub-second search)
- Epic 005: Task Management (AI priority scoring, auto-creation)
- Epic 006: Email Automation (drafts, sending)
- Google OAuth (multi-account support)
- Gmail Service (replace IMAP)
- Drive Service (file operations)
- Calendar Service (event management)
- Full Docker deployment

### 🔄 In Planning
- Issue #6: MCP Server implementation
- Proactive daemon (background monitoring)
- Android voice app (voice interface)
- Home Assistant integration

### ⏸️ Blocked on Decisions
- MCP server deployment location
- Home Assistant connection details
- Notification thresholds
- Android/headset specifications

---

## How to Continue This Conversation

### Your Role
You are continuing a planning session with the user about transforming Odin's architecture. The user wants to:
1. **Save money** by using their Claude Pro subscription instead of API calls
2. **Get proactive notifications** from Odin (not just reactive queries)
3. **Use voice** via Android + Bluetooth headset
4. **Control home** via Home Assistant integration
5. **Learn from Cowork's** agentic capabilities

### What to Do Next

**Step 1: Acknowledge context**
Tell the user you've reviewed the architectural planning document and understand the vision.

**Step 2: Get answers to open questions**
Ask the user about:
- MCP server deployment preference (local vs cloud vs hybrid)
- Home Assistant details (URL, token, entities)
- Notification preferences (thresholds, timing)
- Android phone details and BT headset model
- Claude interface preference (Desktop vs Code)

**Step 3: Refine architecture based on answers**
Once you have answers, update the architecture document with:
- Specific deployment decisions
- Home Assistant integration details
- Notification rules
- Android app specifications

**Step 4: Create detailed implementation plan**
Break down Phase 1 (MCP Server) into specific tasks:
- GitHub issues for each component
- Technical specifications
- Testing strategy
- Timeline estimates

**Step 5: Prepare for implementation**
Once planning is complete and user approves, prepare:
- Detailed ADRs for new components
- GitHub issues with full specifications
- Development environment setup guide
- Testing plan

### Key Points to Remember

**User is NOT a coder:**
- Don't show code in chat
- Focus on outcomes and results
- Use plain language explanations
- Analogies and high-level concepts

**User values:**
- Cost savings (very important)
- Proactive assistance (critical requirement)
- Voice interface (big portion of interaction)
- Home automation (new capability)
- Privacy (local-first architecture)

**User has:**
- Claude Pro (Max tier) subscription
- Home Assistant setup (details needed)
- Android phone (model TBD)
- Bluetooth headset (model TBD)
- Existing Odin MVP (fully functional)

---

## Important Files

**Architecture Documents:**
- `/home/samuel/supervisor/odin/.bmad/architecture/CLAUDE-CODE-MCP-ARCHITECTURE.md` - Complete architecture plan
- `/home/samuel/supervisor/odin/.bmad/adr/003-mcp-architecture-integrations.md` - Existing MCP ADR
- `/home/samuel/supervisor/odin/.bmad/adr/004-voice-interface-realtime-api.md` - Voice interface (to be superseded)

**Project Documents:**
- `/home/samuel/supervisor/odin/.bmad/project-brief.md` - Project overview
- `/home/samuel/supervisor/odin/.bmad/prd/odin-mvp.md` - MVP requirements

**Implementation:**
- `/home/samuel/.archon/workspaces/odin/` - Implementation workspace
- GitHub: `https://github.com/gpt153/odin`

**GitHub Issues:**
- Issue #1-5: Google integrations (completed)
- Issue #6: MCP Server implementation (created, not implemented)

---

## Expected Next Conversation

**User will likely:**
- Want to continue planning
- Provide answers to open questions
- Ask for clarification on architecture
- Want to discuss implementation approach
- May want to start implementation

**You should:**
- Ask for missing information (open questions)
- Validate user's preferences
- Refine architecture based on answers
- Create detailed implementation plan
- Be ready to spawn SCAR for implementation if user wants to proceed

---

## Sample Opening Message

Here's how you might start the conversation:

```
I've reviewed the complete architecture planning for transforming Odin to use
Claude Code via MCP. This is an excellent approach that will save you
$150-240/month while giving you much better capabilities.

I understand the core vision:
✅ Use your Claude Pro subscription instead of API calls (save money)
✅ Proactive notifications from Odin ("you have 3 urgent emails")
✅ Voice interface via Android + Bluetooth headset
✅ Home Assistant control and automation creation
✅ Agentic capabilities inspired by Claude Cowork

Before we finalize the detailed implementation plan, I need answers to a few
questions:

1. **MCP Server Deployment:** Should Odin run on your local machine (best
   privacy, only works when computer is on), in the cloud (always available,
   hosting cost), or hybrid?

2. **Home Assistant:** What's your Home Assistant URL and how can I get an
   access token? What devices do you have (lights, locks, sensors)?

3. **Notifications:** When should Odin proactively notify you? Current
   defaults are 3+ urgent emails, meetings 30 min before, overdue tasks.
   Any time restrictions (like no notifications after 10pm)?

4. **Android/Headset:** What Android version and Bluetooth headset model
   do you have?

Which would you like to tackle first?
```

---

## Good Luck!

You're continuing an excellent planning session. The user is technical-minded but not a coder, values cost efficiency, and has a clear vision for proactive, voice-first interaction with their AI assistant.

The architecture is sound. Focus on getting the remaining details, refining the plan, and preparing for implementation.

**Remember:** User wants Odin to initiate, not just respond. This is the key differentiator.

---

## Session 2 Summary (2026-01-16 Evening)

**All architectural decisions have been finalized. Planning is COMPLETE.**

### Key Decisions Made

**1. Deployment Architecture**
- ✅ Hybrid dual-instance: Main on VM (always-on) + Laptop agent (local control)
- ✅ Coordination: Laptop can take instructions from main, work independently, report back
- ✅ Cost: $10-20/month for VM

**2. Voice Interface**
- ✅ Push-to-talk (NOT continuous listening - avoids interruption frustration)
- ✅ Tasker MVP (NOT custom app initially - validate fast, avoid development bottleneck)
- ✅ Button options: Aftershokz headset, phone button, or ESP32 pendant
- ✅ Streaming audio both directions (low latency <1 second)
- ✅ Chatterbox TTS (self-hosted, better quality than ElevenLabs, $0-30/month)

**3. Notification System**
- ✅ Intelligent triage (NOT simple thresholds)
- ✅ Multiple queues: immediate, today, scheduled
- ✅ Configurable rules (YAML config, easy to experiment)
- ✅ Context-aware (checks calendar, quiet hours, etc.)
- ✅ On-demand queries ("anything new?")

**4. Home Assistant**
- ✅ Via SSH bridge from laptop instance
- ✅ Laptop acts as bridge to local HA network
- ⏳ Still need: HA URL, access token, entity list (user to provide)

**5. Hardware**
- ✅ Phone: Samsung Galaxy S23
- ✅ Headset: Aftershokz (bone conduction)
- ✅ Dev machine: MacBook Pro (Apple Silicon)
- ✅ Optional: ESP32 pendant (fun project for later)

**6. Multiple Interfaces**
- ✅ Claude Desktop (quick interactions)
- ✅ Claude Code (power workflows)
- ✅ Voice via Tasker (hands-free, mobile)
- ✅ Chat via Telegram or web (text when appropriate)

### Research Completed

**Voice Interface Options:**
- Investigated Mattermost, Signal, Element, Linphone, Jami
- Recommended: Linphone SDK + OpenSIPS bridge, BUT...
- User insight: Don't want continuous listening (interruption frustration)
- Pivoted to simpler push-to-talk with Tasker

**TTS Research:**
- Chatterbox beats ElevenLabs in quality (63.8% preference)
- $0/month (MIT license, self-hosted)
- <200ms latency
- Voice cloning with 5-10s audio
- Can run on Mac (dev) or cloud GPU ($30-138/month for 24/7)

**Phone Calling Research:**
- Feasible but complex (needs STT + LLM + TTS + phone bridge)
- OpenAI Realtime API simpler ($90/month includes everything)
- Decision: DEFER phone calling for now
- Documents created for future reference

### Documents Updated

1. **CLAUDE-CODE-MCP-ARCHITECTURE.md** - Complete rewrite with all decisions
   - Hybrid dual-instance architecture
   - Push-to-talk voice interface
   - Intelligent triage system
   - Chatterbox TTS integration
   - Updated cost analysis
   - Updated implementation phases (9-12 weeks)

2. **Research Documents Created:**
   - `/research/mobile-app-fork-analysis.md` - Open-source app options
   - `/research/chatterbox-deployment-options.md` - TTS deployment details
   - `/research/chatterbox-quick-reference.md` - Quick answers

3. **This Handoff Document** - Updated with session 2 summary

### Implementation Timeline

**Total: 9-12 weeks for core functionality**

- Phase 1: MCP Server Foundation (2-3 weeks) - Dual-instance deployment
- Phase 2: Intelligent Triage Daemon (2-3 weeks) - Smart notifications
- Phase 3: Voice Interface MVP (1-2 weeks) - Tasker push-to-talk
- Phase 4: Home Assistant (1-2 weeks) - Laptop SSH bridge
- Phase 5: Chat Interface (1 week) - Telegram/web
- Phase 6: Testing & Polish (2 weeks)
- Optional: ESP32 pendant (1-2 days)
- Optional: Custom app only if Tasker insufficient (3-4 weeks)

### Cost Summary

**Current:** $150-240/month (Anthropic API + OpenAI Realtime)
**New:** $30-70/month (VM + Chatterbox)
**Savings:** $80-210/month = $960-2,520/year

### Next Steps

**Week 1:**
1. Create GitHub issues for all 6 phases
2. Set up VM for main instance
3. Set up laptop instance
4. Install Chatterbox on Mac for testing
5. Get Home Assistant access details

**Week 2+:**
Begin Phase 1 implementation (MCP Server Foundation)

---

**Handoff complete. Planning finalized. Architecture approved. Ready for implementation.**

**Documents to reference:**
- Main architecture: `/home/samuel/supervisor/odin/.bmad/architecture/CLAUDE-CODE-MCP-ARCHITECTURE.md`
- Research: `/home/samuel/supervisor/odin/research/` directory
- This handoff: `/home/samuel/supervisor/odin/.bmad/HANDOFF-CLAUDE-CODE-PLANNING.md`
