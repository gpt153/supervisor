# Odin Architecture: Claude Code + MCP Integration

**Status:** Planning Complete - Ready for Implementation
**Date:** 2026-01-16
**Last Updated:** 2026-01-17 (added Docker MCP Gateway + Factory architecture)
**Decision:** Pivot from API-based to Claude Code/MCP-based architecture
**Reason:** Cost savings ($80-210/month) + Better UX + User has Claude Pro subscription + Unlimited expansion via factory

**Key Architecture Decisions:**
- ✅ Docker MCP Gateway orchestration layer (context efficiency + security)
- ✅ Tiered MCP architecture (Core + Generated Integrations + Factory)
- ✅ Hybrid dual-instance deployment (VM main + laptop agent)
- ✅ Push-to-talk voice interface via Tasker (not custom app initially)
- ✅ Intelligent triage system (not simple thresholds)
- ✅ Chatterbox TTS (self-hosted, better than ElevenLabs)
- ✅ Multiple interfaces (Desktop, Code, voice, chat)
- ✅ Home Assistant via laptop SSH bridge
- ✅ MCP Factory for dynamic integration creation (eBay, Amazon, etc.)

---

## Executive Summary

**Current Architecture Problem:**
- Odin calls Anthropic API for every AI operation
- Estimated cost: $60-150/month for email processing + $90/month for voice
- User already pays $20/month for Claude Pro subscription
- **Paying twice for AI capabilities**

**New Architecture Solution:**
- Transform Odin from "AI-powered app" to "MCP tool server for Claude Code"
- Claude Code (included in Pro subscription) becomes the brain
- Odin provides tools via MCP (Model Context Protocol)
- **Zero additional API costs**

---

## Key Requirements from User

### 1. ✅ Cost Efficiency via Claude Code
- User has Claude Pro subscription ($20/month)
- Claude Code supports subagents (parallel processing)
- Use Pro subscription instead of paying for API calls
- **Savings: $150-240/month**

### 2. 📚 Learn from Claude Cowork
**Research findings:**
- Cowork = Claude Code for non-developers (Jan 2026 research preview)
- Available in Claude Desktop for Max subscribers
- Key features:
  - Autonomous execution with planning
  - Parallel workstreams
  - File system access
  - Progress updates
  - Delivers finished outputs

**Ideas to steal:**
- ✅ Planning before execution
- ✅ Parallel workstreams (subagents for emails/tasks)
- ✅ Progress updates during work
- ✅ Finished outputs (drafted emails, organized tasks)
- ✅ File system integration

**Sources:**
- [Introducing Cowork (Claude Blog)](https://claude.com/blog/cowork-research-preview)
- [Getting Started with Cowork](https://support.claude.com/en/articles/13345190-getting-started-with-cowork)
- [First impressions - Simon Willison](https://simonwillison.net/2026/Jan/12/claude-cowork/)
- [VentureBeat coverage](https://venturebeat.com/technology/anthropic-launches-cowork-a-claude-desktop-agent-that-works-in-your-files-no)

### 3. 🔔 Proactive Initiation (Critical Requirement)
**User requirement:** "I want Odin to initiate conversations, not me"

**Example:** "You have 3 new important emails, do you want me to tell you about them?"

**Challenge:** Claude Code/Desktop are reactive (user-initiated), but we need proactive (Odin-initiated)

**Solution:** Intelligent triage system with flexible notification scheduling

**Key Decision:** Not simple threshold-based notifications. Odin evaluates EVERYTHING incoming and uses intelligent triage:
- Non-urgent → scheduled review times (daily, few times per week)
- Needs attention today → separate queue, notify when suitable
- Urgent → immediate notification
- On-demand → "anything new?" shows queued items
- Easy to configure and experiment with different strategies

### 4. 🎤 Voice Interface (Push-to-Talk + Android + BT Headset)
**Requirements:**
- Big portion of communication will be voice
- Via Samsung Galaxy S23
- Via Aftershokz Bluetooth headset (bone conduction)
- Must work with Claude Code architecture

**Critical Design Decision: Push-to-Talk (PTT)**
- NOT continuous listening (avoids interruption frustration)
- Press button → talk → release button → Odin responds
- Streaming audio while speaking (lower latency)
- Button options: Headset play button, phone button, or ESP32 pendant (or all three)

**TTS Solution: Chatterbox (Self-Hosted)**
- Quality: Better than ElevenLabs (63.8% preference in blind tests)
- Cost: $0/month (MIT license, run on Mac for dev, cloud GPU for production if needed)
- Latency: <200ms (excellent for voice assistant)
- Voice cloning: 5-10 seconds of audio

**MVP Approach: Tasker (Not Custom App)**
- Use Tasker for Android automation
- Handles button detection, audio recording, API calls, TTS playback
- Can iterate in minutes, not days
- No app development bottleneck
- Custom app only if Tasker proves insufficient later

**Chat Interface: Telegram Bot or Web UI**
- Separate from voice (for now)
- Multiple interfaces: Claude Desktop, Claude Code, voice (Tasker), chat (Telegram/web)

### 5. 🏠 Home Assistant Integration
**Requirements:**
- Control home automation: "Turn off all lights in the house"
- Create automations: "Make it so all doors lock automatically when I leave the property"
- Both simple commands AND helping build complex automations

**Integration:** Via SSH from laptop to Home Assistant (local network)
**Architecture:** Laptop Odin instance acts as bridge to reach Home Assistant

---

## Tiered MCP Architecture with Docker Gateway

### 6. 🏗️ MCP Factory + Dynamic Integration System (NEW)

**The Context Window Problem:**
- Each MCP server loads tool definitions into Claude's context
- ~100-500 tokens per tool
- 10 MCPs × 10 tools = 100 tools = 10,000-50,000 tokens
- More tools = harder for Claude to pick the right one

**The Solution: Docker MCP Gateway + Tiered Architecture**

Docker's MCP Gateway (launched end of 2025) solves this by acting as a smart orchestration layer between Claude Code and your MCP servers.

**Architecture Tiers:**

**Tier 1: Core Odin MCP (Always Loaded, Containerized)**
- 15 essential tools (email, tasks, search, calendar, drive, Home Assistant)
- Intelligent triage system
- **MCP Factory tool:** `create_integration_mcp(service, capabilities, api_details)`
- Runs in Docker container
- Always connected via Gateway

**Tier 2: Generated Integration MCPs (On-Demand, Containerized)**
- Created by factory when you need new capabilities
- Examples: eBay search, Amazon shopping, weather services, stock data
- Each runs in isolated Docker container
- Gateway starts/stops containers as needed
- Generated from templates in minutes

**Tier 3: Workflow Skills (Not MCPs, No Context Cost)**
- Common patterns and workflows
- Email categorization rules
- Task prioritization templates
- Loaded only when referenced

**How MCP Gateway Works:**
```
Claude Code (single connection)
     ↓
MCP Gateway (orchestrator)
     ├── Routes to: Core Odin MCP (Docker container, always running)
     ├── Routes to: eBay MCP (Docker container, started when mentioned)
     ├── Routes to: Amazon MCP (Docker container, started when mentioned)
     └── Routes to: Weather MCP (Docker container, started when mentioned)
```

**Context Efficiency:**
- **Without Gateway:** 100 tools × 500 tokens = 50,000 tokens
- **With Gateway:** ~5,000 tokens (Gateway routes intelligently)
- **Result:** 90% reduction in context usage

**Security Benefits:**
- Each MCP in isolated Docker container
- Cryptographic signatures on all containers
- Software Bills of Materials (SBOMs) for audit
- Access control via Gateway
- Credentials managed centrally

**MCP Factory Flow Example:**
```
You: "Add eBay search capability"
     ↓
Claude Code → Core Odin MCP → create_integration_mcp()
     ↓
Factory:
  1. Selects template (e-commerce API integration)
  2. Generates eBay MCP code (API auth, search endpoint, result formatting)
  3. Builds Docker container (multi-platform: amd64 + arm64)
  4. Registers with MCP Gateway
  5. Gateway adds routing rules
     ↓
You: "Search eBay for vintage cameras under $200"
     ↓
Gateway routes to eBay MCP container → results returned
```

**Factory Templates Available:**
- **E-commerce:** eBay, Amazon, Etsy, Shopify
- **Communication:** Slack, Discord, Telegram bots
- **Productivity:** Notion, Todoist, Trello, Linear
- **Data sources:** Weather APIs, news feeds, stock data
- **Smart home:** Device-specific integrations beyond Home Assistant
- **Custom:** Template generator for any REST API

**Benefits of This Approach:**
✅ **Unlimited expansion** - Add new capabilities in minutes, not weeks
✅ **Context efficient** - Gateway handles routing, minimal token usage
✅ **Secure** - Container isolation, signatures, SBOMs
✅ **Manageable** - Docker Desktop GUI for monitoring all MCPs
✅ **Consistent** - All generated MCPs follow same patterns
✅ **No development bottleneck** - Factory automates integration creation

**Implementation:**
- MCP Gateway deployed on both VM and laptop instances
- Core Odin MCP registered at startup
- Factory templates stored in `/odin/mcp-factory/templates/`
- Generated MCPs stored in `/odin/mcp-integrations/`
- Docker Compose manages all containers
- Gateway configuration in `~/.config/mcp-gateway/config.json`

**Docker Resources:**
- [Docker MCP Catalog](https://www.docker.com/products/mcp-catalog-and-toolkit/)
- [MCP Gateway Documentation](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/)
- [Docker MCP Registry (GitHub)](https://github.com/docker/mcp-registry)

---

## Proposed Architecture

### High-Level System Diagram (Hybrid Dual-Instance + MCP Gateway Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                            │
│                                                                 │
│  Android Phone (S23) + Aftershokz    MacBook Pro               │
│  • Push-to-talk (Tasker)             • Claude Code CLI         │
│  • Push notifications                • Claude Desktop          │
│  • Telegram chat                     • Web browser             │
│  • Chatterbox TTS playback           • Local development       │
└───────────┬─────────────────────────────────┬─────────────────┘
            │                                 │
            │ HTTPS                           │ MCP Protocol
            ↓                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│         ODIN MAIN INSTANCE (VM - Always Running)                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  DOCKER MCP GATEWAY (Orchestration Layer)                 │ │
│  │  • Single connection point for Claude Code                │ │
│  │  • Routes requests to appropriate MCP containers          │ │
│  │  • Manages container lifecycle (start/stop on demand)     │ │
│  │  • Credentials & access control                           │ │
│  └────────────────────┬──────────────────────────────────────┘ │
│                       │ Routes to:                              │
│  ┌────────────────────┴──────────────────────────────────────┐ │
│  │  CORE ODIN MCP (Docker Container - Always Running)        │ │
│  │  • read_emails()      • create_task()                     │ │
│  │  • draft_email()      • semantic_search()                 │ │
│  │  • get_calendar()     • drive_search()                    │ │
│  │  • homeassistant_*()  • create_integration_mcp() ← Factory│ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  GENERATED MCPs (Docker Containers - On Demand)           │ │
│  │  • eBay Search MCP (started when needed)                  │ │
│  │  • Amazon MCP (started when needed)                       │ │
│  │  • Weather API MCP (started when needed)                  │ │
│  │  • [Custom integrations created by factory]               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Intelligent Triage Daemon (Always Running)               │ │
│  │  • Evaluates ALL incoming (emails, tasks, events)         │ │
│  │  • Queues by urgency (immediate, today, scheduled)        │ │
│  │  • Sends notifications when appropriate                   │ │
│  │  • Configurable scheduling & thresholds                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Data Layer: PostgreSQL + pgvector + Redis               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Voice Services                                           │ │
│  │  • Chatterbox TTS (self-hosted, better than ElevenLabs)  │ │
│  │  • Streaming audio API for low-latency responses         │ │
│  │  • Voice cloning capability                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────┬──────────────────────┬─────────────────────────────┘
             │                      │
             │ Connects to          │ Coordinates with
             ↓                      ↓
┌────────────────────────┐   ┌──────────────────────────────────┐
│   EXTERNAL SERVICES    │   │  ODIN LAPTOP INSTANCE (MacBook)  │
│                        │   │                                  │
│  Google (OAuth)        │   │  • Local file access             │
│  • Gmail               │   │  • Can control laptop            │
│  • Calendar            │   │  • SSH bridge to Home Assistant  │
│  • Drive               │   │  • Receives tasks from main      │
│                        │   │  • Reports back to main          │
│  Other Integrations    │   │  • Chatterbox TTS (dev/testing)  │
│  • Todoist             │   │                                  │
│  • Notion              │   │  Via SSH:                        │
│  • Slack               │   │  ┌────────────────────────────┐  │
└────────────────────────┘   │  │  Home Assistant (Local)    │  │
                             │  │  • Lights/locks/sensors    │  │
                             │  │  • Automations             │  │
                             │  └────────────────────────────┘  │
                             └──────────────────────────────────┘
```

**Deployment Architecture Notes:**
- **Main Instance (VM):** Always running, handles all core operations, accessible anywhere
- **Laptop Instance:** Local control, file access, Home Assistant bridge, dev environment
- **Coordination:** Laptop instance can take instructions from main, work independently, send results back
- **Best of both worlds:** Always-on monitoring + local capabilities when needed

---

## Component Details

### 1. Intelligent Triage Daemon (Background Service)

**Purpose:** Evaluate all incoming information and intelligently queue/notify based on urgency

**Architecture:**
```python
# odin_daemon.py - Always running with intelligent triage
class IntelligentTriageDaemon:
    def __init__(self):
        self.queues = {
            "immediate": [],      # Notify ASAP
            "today": [],          # Review later today
            "scheduled": [],      # Review during scheduled times
            "completed": []       # Already handled
        }
        self.config = TriageConfig.load()  # User-configurable thresholds

    async def monitor_loop(self):
        """Main monitoring loop - runs continuously"""
        while True:
            await asyncio.sleep(300)  # Check every 5 minutes

            # Process all new incoming items
            await self.triage_new_items()

            # Check if it's time to notify
            await self.check_notification_schedule()

    async def triage_new_items(self):
        """Evaluate ALL new items and queue appropriately"""

        # Get all new emails (already AI-categorized in background)
        new_emails = await db.query(
            "SELECT * FROM emails WHERE triaged = false"
        )

        for email in new_emails:
            urgency = await self.evaluate_urgency(email)

            if urgency == "immediate":
                self.queues["immediate"].append({
                    "type": "email",
                    "item": email,
                    "reason": "High priority and time-sensitive"
                })
            elif urgency == "today":
                self.queues["today"].append({
                    "type": "email",
                    "item": email,
                    "reason": "Needs attention today but not urgent"
                })
            else:
                self.queues["scheduled"].append({
                    "type": "email",
                    "item": email,
                    "scheduled_for": self.next_review_time()
                })

            # Mark as triaged
            await db.query("UPDATE emails SET triaged = true WHERE id = ?", email.id)

        # Similar logic for tasks, calendar events, etc.

    async def evaluate_urgency(self, item):
        """Intelligent urgency evaluation"""

        # Use existing AI-assigned priority + additional context
        priority = item.priority  # 1-5 from AI processing

        # Check for time-sensitive keywords
        time_sensitive = any(word in item.subject.lower()
            for word in ["urgent", "asap", "today", "deadline", "emergency"])

        # Check sender importance
        important_sender = item.sender_email in self.config.important_senders

        # Check due dates/deadlines
        has_deadline_today = self.extract_deadline(item) == datetime.today()

        # Evaluation logic
        if priority >= 4 and (time_sensitive or has_deadline_today):
            return "immediate"
        elif priority >= 3 or important_sender:
            return "today"
        else:
            return "scheduled"

    async def check_notification_schedule(self):
        """Check if it's time to notify user"""

        # Immediate queue: notify right away
        if self.queues["immediate"]:
            await self.notify_immediate()

        # Today queue: notify during suitable times
        if self.queues["today"] and self.is_suitable_time():
            await self.notify_today_queue()

        # Scheduled queue: notify during review times
        if self.is_review_time():
            await self.notify_scheduled_queue()

    def is_suitable_time(self):
        """Check if now is a suitable time to notify"""
        now = datetime.now()

        # Configurable quiet hours
        if self.config.quiet_hours_start <= now.hour < self.config.quiet_hours_end:
            return False

        # Check if user is in meeting (via calendar)
        if self.user_in_meeting():
            return False

        return True

    def is_review_time(self):
        """Check if now is a scheduled review time"""
        now = datetime.now()

        # User configures review times (e.g., "9am, 1pm, 5pm daily")
        return now.hour in self.config.review_hours

    async def notify_user(self, queue_name, items):
        """Send notification with queued items"""

        count = len(items)
        message = self.format_notification(queue_name, count)

        # 1. Android push notification
        await self.send_push_notification(
            title="Odin Assistant",
            message=message,
            action=f"open_queue_{queue_name}"
        )

        # 2. If suitable, voice notification
        if self.config.voice_notifications and await self.is_headset_connected():
            await self.voice_notify(message)
```

**Key Features:**
- **Intelligent evaluation:** Not just simple thresholds, considers multiple factors
- **Multiple queues:** immediate, today, scheduled (user decides timing)
- **Configurable:** Easy to tweak notification rules and review times
- **Context-aware:** Checks calendar, quiet hours, current activity
- **On-demand:** User can ask "anything new?" to see queued items
- **Learning:** Can adjust based on user behavior (future enhancement)

**Example Configuration:**
```yaml
# triage_config.yaml
review_times:
  - 09:00  # Morning review
  - 13:00  # Lunch review
  - 17:00  # End-of-day review

quiet_hours:
  start: 22:00
  end: 07:00

important_senders:
  - boss@company.com
  - ceo@company.com
  - family@gmail.com

notification_preferences:
  voice_notifications: true
  immediate_threshold: 1  # How many immediate items before notifying
  today_batch_size: 3     # Group "today" items in batches
```

---

### 2. Odin MCP Server

**Purpose:** Expose Odin's capabilities as MCP tools for Claude Code

**MCP Tools to Implement:**

#### Email Tools
```python
@mcp_tool
async def read_emails(
    account_id: Optional[int] = None,
    category: Optional[str] = None,
    priority_min: int = 1,
    unread_only: bool = False,
    limit: int = 50
) -> List[Email]:
    """Read emails with filtering

    Args:
        account_id: Specific Gmail account (for multi-account)
        category: Filter by category (work, personal, etc.)
        priority_min: Minimum priority (1-5)
        unread_only: Only unread emails
        limit: Max number of emails

    Returns:
        List of email objects with full metadata
    """
    # Implementation using existing EmailService
    pass

@mcp_tool
async def draft_email(
    email_id: int,
    tone: str = "professional",
    account_id: Optional[int] = None
) -> EmailDraft:
    """Generate email response draft

    Args:
        email_id: Email to respond to
        tone: Response tone (professional, casual, brief, detailed)
        account_id: Gmail account to use

    Returns:
        Draft object with generated content
    """
    pass

@mcp_tool
async def send_email(
    draft_id: int,
    account_id: Optional[int] = None
) -> bool:
    """Send email draft

    Args:
        draft_id: Draft to send
        account_id: Gmail account to use

    Returns:
        Success status
    """
    pass
```

#### Task Tools
```python
@mcp_tool
async def get_tasks(
    status: str = "pending",
    priority_min: int = 1,
    due_before: Optional[datetime] = None
) -> List[Task]:
    """Get tasks with filtering"""
    pass

@mcp_tool
async def create_task(
    title: str,
    description: Optional[str] = None,
    priority: int = 3,
    due_date: Optional[datetime] = None,
    linked_email_id: Optional[int] = None
) -> Task:
    """Create new task"""
    pass

@mcp_tool
async def complete_task(task_id: int) -> bool:
    """Mark task as completed"""
    pass
```

#### Search Tools
```python
@mcp_tool
async def semantic_search(
    query: str,
    limit: int = 10,
    search_emails: bool = True,
    search_tasks: bool = True,
    search_drive: bool = True
) -> List[SearchResult]:
    """Semantic search across all data sources

    Args:
        query: Natural language search query
        limit: Max results
        search_emails: Include emails in search
        search_tasks: Include tasks in search
        search_drive: Include Drive files in search

    Returns:
        Ranked search results with relevance scores
    """
    pass
```

#### Calendar Tools
```python
@mcp_tool
async def get_events(
    account_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[CalendarEvent]:
    """Get calendar events"""
    pass

@mcp_tool
async def create_event(
    title: str,
    start_time: datetime,
    end_time: datetime,
    description: Optional[str] = None,
    attendees: Optional[List[str]] = None,
    account_id: Optional[int] = None
) -> CalendarEvent:
    """Create calendar event"""
    pass
```

#### Drive Tools
```python
@mcp_tool
async def search_drive(
    query: str,
    account_id: Optional[int] = None,
    file_type: Optional[str] = None
) -> List[DriveFile]:
    """Search Google Drive files"""
    pass

@mcp_tool
async def get_drive_file(
    file_id: str,
    account_id: Optional[int] = None
) -> DriveFile:
    """Get Drive file metadata and content"""
    pass
```

#### Home Assistant Tools
```python
@mcp_tool
async def homeassistant_call_service(
    domain: str,
    service: str,
    entity_id: Optional[str] = None,
    data: Optional[dict] = None
) -> dict:
    """Call Home Assistant service

    Examples:
        domain="light", service="turn_off", entity_id="light.living_room"
        domain="lock", service="lock", entity_id="lock.front_door"
        domain="light", service="turn_off", entity_id="all"
    """
    pass

@mcp_tool
async def homeassistant_get_state(entity_id: str) -> dict:
    """Get state of Home Assistant entity"""
    pass

@mcp_tool
async def homeassistant_create_automation(
    name: str,
    trigger: dict,
    condition: Optional[dict] = None,
    action: dict
) -> dict:
    """Create Home Assistant automation

    Example:
        name="Lock doors when leaving"
        trigger={"platform": "state", "entity_id": "person.samuel", "to": "not_home"}
        action={"service": "lock.lock", "entity_id": "all"}
    """
    pass

@mcp_tool
async def homeassistant_list_entities(domain: Optional[str] = None) -> List[dict]:
    """List available Home Assistant entities

    Args:
        domain: Filter by domain (light, lock, sensor, etc.)
    """
    pass
```

#### MCP Factory Tool
```python
@mcp_tool
async def create_integration_mcp(
    service_name: str,
    service_type: str,
    api_endpoint: str,
    auth_method: str,
    capabilities: List[str],
    api_docs_url: Optional[str] = None
) -> dict:
    """Create a new MCP integration from templates

    This is the MCP Factory - it generates new MCP servers on demand for
    services you want to integrate with.

    Args:
        service_name: Name of service (e.g., "eBay", "Amazon", "OpenWeather")
        service_type: Template category (e-commerce, communication, productivity,
                      data-source, smart-home, custom-api)
        api_endpoint: Base API URL
        auth_method: Authentication method (api-key, oauth2, basic-auth, none)
        capabilities: What you want to do (["search", "purchase", "track-orders"])
        api_docs_url: Optional URL to API documentation for reference

    Returns:
        {
            "mcp_name": "ebay-integration",
            "container_id": "docker-hash-123",
            "status": "running",
            "tools_created": ["search_ebay", "get_item_details", "get_seller_info"],
            "gateway_registered": true,
            "template_used": "e-commerce-rest-api"
        }

    Example Usage:
        You: "Add eBay search capability"

        Claude calls:
        create_integration_mcp(
            service_name="eBay",
            service_type="e-commerce",
            api_endpoint="https://api.ebay.com/buy/browse/v1",
            auth_method="oauth2",
            capabilities=["search", "get_item_details"],
            api_docs_url="https://developer.ebay.com/api-docs/buy/browse/overview.html"
        )

        Factory:
        1. Selects "e-commerce-rest-api" template
        2. Generates Python MCP server code:
           - OAuth2 authentication handler
           - search_ebay(query, max_price, category) tool
           - get_item_details(item_id) tool
           - Result formatters
        3. Creates Dockerfile (multi-platform: amd64 + arm64)
        4. Builds Docker container
        5. Starts container
        6. Registers with MCP Gateway
        7. Returns confirmation

        Result:
        New eBay MCP running, ready to use immediately
    """
    pass

@mcp_tool
async def list_integration_mcps() -> List[dict]:
    """List all generated MCP integrations

    Returns:
        [
            {
                "name": "ebay-integration",
                "status": "running",
                "created": "2026-01-17T10:30:00Z",
                "tools": ["search_ebay", "get_item_details"],
                "container_id": "docker-hash-123"
            },
            ...
        ]
    """
    pass

@mcp_tool
async def remove_integration_mcp(mcp_name: str) -> bool:
    """Remove a generated MCP integration

    Stops and removes the Docker container, unregisters from Gateway
    """
    pass
```

---

### 3. MCP Factory Implementation

**Purpose:** Automatically generate new MCP integrations from templates

**Factory Templates Structure:**
```
/odin/mcp-factory/
├── templates/
│   ├── e-commerce-rest-api/
│   │   ├── template.py           # Python MCP server template
│   │   ├── Dockerfile.template   # Multi-platform container
│   │   ├── config.yaml           # Template configuration
│   │   └── README.md            # Generated documentation
│   ├── communication-webhook/
│   ├── productivity-api/
│   ├── data-source-polling/
│   ├── smart-home-device/
│   └── custom-rest-api/         # Generic fallback
├── generator.py                  # Template engine
└── registry.yaml                # Tracks all generated MCPs
```

**Factory Generation Process:**
```python
# When create_integration_mcp() is called:

1. SELECT TEMPLATE
   - service_type → template directory
   - Load template.py and config.yaml

2. GENERATE MCP CODE
   - Replace {{service_name}} placeholders
   - Generate auth handler based on auth_method
   - Create tool functions for each capability
   - Add error handling and validation
   - Generate result formatters

3. CREATE DOCKERFILE
   - FROM python:3.11-slim
   - Install MCP SDK
   - Copy generated code
   - Multi-platform build (amd64, arm64)
   - Security: non-root user, minimal layers

4. BUILD CONTAINER
   - docker buildx build --platform linux/amd64,linux/arm64
   - Tag: odin-mcp-{service_name}:latest
   - Push to registry (optional)

5. START CONTAINER
   - docker run with environment variables
   - Mount credentials volume
   - Connect to MCP Gateway network

6. REGISTER WITH GATEWAY
   - Add routing rules to Gateway config
   - Gateway hot-reloads configuration
   - New MCP immediately available

7. RETURN CONFIRMATION
   - Container ID, status, tools created
   - User can start using immediately
```

**Example Generated MCP (eBay):**
```python
# Generated: /odin/mcp-integrations/ebay-integration/server.py
# Auto-generated by Odin MCP Factory on 2026-01-17
# Template: e-commerce-rest-api v1.0

from mcp import MCPServer, MCPTool
import aiohttp
from typing import List, Optional

class EbayMCPServer(MCPServer):
    def __init__(self):
        super().__init__(name="ebay-integration")
        self.api_base = "https://api.ebay.com/buy/browse/v1"
        self.oauth_token = os.getenv("EBAY_OAUTH_TOKEN")

    @MCPTool
    async def search_ebay(
        self,
        query: str,
        max_price: Optional[float] = None,
        category: Optional[str] = None,
        limit: int = 20
    ) -> List[dict]:
        """Search eBay listings

        Args:
            query: Search terms
            max_price: Maximum price filter
            category: Category ID or name
            limit: Max results (default 20)
        """
        # OAuth2 authentication (auto-generated)
        headers = {"Authorization": f"Bearer {self.oauth_token}"}

        # Build query parameters
        params = {"q": query, "limit": limit}
        if max_price:
            params["filter"] = f"price:[..{max_price}]"
        if category:
            params["category_ids"] = category

        # API call with error handling
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.api_base}/item_summary/search",
                headers=headers,
                params=params
            ) as resp:
                if resp.status != 200:
                    raise Exception(f"eBay API error: {resp.status}")
                data = await resp.json()

        # Format results (auto-generated from template)
        return [
            {
                "title": item["title"],
                "price": item["price"]["value"],
                "currency": item["price"]["currency"],
                "url": item["itemWebUrl"],
                "image": item.get("image", {}).get("imageUrl"),
                "condition": item.get("condition"),
                "seller": item.get("seller", {}).get("username")
            }
            for item in data.get("itemSummaries", [])
        ]

    @MCPTool
    async def get_item_details(self, item_id: str) -> dict:
        """Get detailed information about a specific eBay item"""
        # Similar auto-generated implementation
        pass

# Start server
if __name__ == "__main__":
    server = EbayMCPServer()
    server.run()
```

**Benefits:**
- **Speed:** New integration in 2-3 minutes instead of 2-3 weeks
- **Consistency:** All generated MCPs follow same patterns
- **Security:** Templates include auth, error handling, validation
- **Maintenance:** Update template → regenerate all MCPs using it
- **Learning:** Factory improves templates based on usage

**Factory Templates Available:**

| Template | Use Cases | Example Services |
|----------|-----------|------------------|
| e-commerce-rest-api | Shopping, price comparison | eBay, Amazon, Shopify, Etsy |
| communication-webhook | Messaging, notifications | Slack, Discord, Telegram, Signal |
| productivity-api | Task management, notes | Notion, Todoist, Trello, Linear |
| data-source-polling | Real-time data feeds | Weather, stocks, news, RSS |
| smart-home-device | IoT device control | Philips Hue, Sonos, Nest |
| custom-rest-api | Generic API wrapper | Any REST API with OpenAPI/Swagger |

---

### 4. Voice Interface (Push-to-Talk via Tasker)

**Design Philosophy: Push-to-Talk (PTT)**
- **Problem with continuous listening:** AI interrupts during natural pauses
- **Solution:** User controls when to talk and when to listen
- **Benefits:** No false triggers, more reliable, less frustrating, better privacy

**Architecture:**
```
┌──────────────────────────────────────────────────────────────┐
│    ANDROID PHONE (S23) + AFTERSHOKZ HEADSET                 │
│                                                              │
│  TASKER AUTOMATION:                                          │
│  1. Detect button press (headset/phone/ESP32)               │
│  2. Start streaming audio recording                         │
│  3. Stream audio chunks to Odin API (WebSocket)             │
│  4. Button released → finalize recording                    │
│  5. Receive response audio stream from Chatterbox TTS       │
│  6. Play through headset                                    │
│                                                              │
│  BUTTON OPTIONS:                                             │
│  • Headset play button (Aftershokz media control)           │
│  • Phone volume/power button (long press)                   │
│  • ESP32 pendant with custom button (optional)              │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    │ WebSocket (streaming audio)
                    ↓
┌──────────────────────────────────────────────────────────────┐
│           ODIN MAIN INSTANCE (VM)                            │
│                                                              │
│  STREAMING VOICE API:                                        │
│  1. Receive audio stream (while user talking)                │
│  2. Real-time STT transcription (Whisper or similar)         │
│  3. Start processing before user finishes speaking           │
│  4. Route transcribed text to Claude Code via MCP            │
│  5. Generate response text                                   │
│  6. Stream to Chatterbox TTS (start speaking ASAP)           │
│  7. Stream audio back to phone                               │
│                                                              │
│  CHATTERBOX TTS SERVER:                                      │
│  • Self-hosted, better quality than ElevenLabs               │
│  • <200ms latency for streaming playback                     │
│  • Custom voice clone (5-10s training)                       │
│  • Runs on Mac (dev) or cloud GPU (production $0-138/mo)    │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    │ MCP Protocol
                    ↓
┌──────────────────────────────────────────────────────────────┐
│           CLAUDE CODE (Pro Subscription)                     │
│                                                              │
│  • Processes query with full context                         │
│  • Uses MCP tools (emails, tasks, calendar, HA, etc.)        │
│  • Returns intelligent response text                         │
└──────────────────────────────────────────────────────────────┘
```

**Tasker Profile Example:**
```
Profile: Odin Voice Command (Headset Button)
  Event: Button Press → Aftershokz Play Button (Media Button)

Task: Handle Voice Command
  A1: Variable Set %RECORDING to true
  A2: HTTP Request (WebSocket connect) to wss://odin.example.com/voice/stream
  A3: Record Audio → Stream chunks via WebSocket (while button held)
  A4: Wait for Button Release
  A5: Variable Set %RECORDING to false
  A6: Finalize audio stream
  A7: Receive response audio stream
  A8: Play Audio through headset (Media → Bluetooth)
  A9: WebSocket disconnect

Alternate Profiles:
- Phone Volume Up (Long Press) → Same task
- ESP32 Button Event (via Bluetooth notification) → Same task
```

**Streaming Audio Flow (Low Latency):**
```
Timeline:

0.0s  → User presses button
0.1s  → Start recording & streaming
0.5s  → User: "Check my..."
0.7s  → Odin STT processes "Check my" (starts early transcription)
1.5s  → User: "...urgent emails"
1.6s  → Button released
1.7s  → STT finishes: "Check my urgent emails"
1.8s  → Claude Code called via MCP (read_emails tool)
2.3s  → Claude returns response text
2.4s  → Chatterbox TTS starts generating (streaming)
2.6s  → First words playing: "You have 2 urgent..."
3.5s  → Full response playing: "...emails from CEO and finance team"

Total latency: ~1 second from button release to first audio
```

**Key Features:**
- **Push-to-talk:** No interruption frustration
- **Streaming:** Both recording and playback stream (low latency)
- **Flexible buttons:** Headset, phone, or custom ESP32 pendant
- **No app development:** Tasker configuration, iterate in minutes
- **Chatterbox TTS:** Free, better quality than ElevenLabs
- **Fail-fast:** If Tasker limitations hit, THEN build custom app

**ESP32 Pendant Option (Optional Future Enhancement):**
```
Hardware:
- ESP32 + button + LED + battery
- Bluetooth connection to phone
- Sends button press/release events
- LED feedback (recording indicator)
- ~$10-15 parts, 1-2 days to build

Benefits:
- Most accessible (pendant around neck)
- Custom UX (LED, vibration motor, etc.)
- Fun to build
- Doubles as geek cred

Tasker Integration:
- ESP32 sends Bluetooth notification on button events
- Tasker receives BT notification → triggers same voice task
```

**Cost Comparison:**
- **Old plan (ADR-004):** OpenAI Realtime API = $90/month
- **New plan:** Android STT + Tasker + Chatterbox TTS = **$0-30/month**
  - $0/month if running Chatterbox on Mac (development)
  - $30/month if running on cloud GPU (production, 24/7)

---

### 4. Home Assistant Integration

**Service Implementation:**
```python
# src/odin/integrations/homeassistant/ha_service.py
import aiohttp
from typing import Optional, Dict, List

class HomeAssistantService:
    """Home Assistant integration via REST API"""

    def __init__(self, url: str, token: str):
        self.url = url  # e.g., http://homeassistant.local:8123
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    async def call_service(
        self,
        domain: str,
        service: str,
        entity_id: Optional[str] = None,
        data: Optional[dict] = None
    ) -> dict:
        """Call a Home Assistant service

        Examples:
            domain="light", service="turn_off", entity_id="light.living_room"
            domain="lock", service="lock", entity_id="lock.front_door"
            domain="light", service="turn_off", entity_id="all"
        """
        payload = {}
        if entity_id:
            payload["entity_id"] = entity_id
        if data:
            payload.update(data)

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.url}/api/services/{domain}/{service}",
                headers=self.headers,
                json=payload
            ) as resp:
                return await resp.json()

    async def get_state(self, entity_id: str) -> dict:
        """Get state of an entity"""
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.url}/api/states/{entity_id}",
                headers=self.headers
            ) as resp:
                return await resp.json()

    async def list_entities(self, domain: Optional[str] = None) -> List[dict]:
        """List all entities or filter by domain"""
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.url}/api/states",
                headers=self.headers
            ) as resp:
                states = await resp.json()

                if domain:
                    return [s for s in states if s["entity_id"].startswith(f"{domain}.")]
                return states

    async def create_automation(
        self,
        automation_id: str,
        config: dict
    ) -> dict:
        """Create a new automation

        Example config:
        {
            "alias": "Lock doors when leaving",
            "trigger": {
                "platform": "state",
                "entity_id": "person.samuel",
                "to": "not_home"
            },
            "action": {
                "service": "lock.lock",
                "entity_id": "all"
            }
        }
        """
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.url}/api/config/automation/config/{automation_id}",
                headers=self.headers,
                json=config
            ) as resp:
                return await resp.json()
```

**Example Interactions:**

**Simple command:**
```
You: "Turn off all lights in the house"

Claude Code (via MCP):
→ homeassistant_call_service(
    domain="light",
    service="turn_off",
    entity_id="all"
  )

Response: "Done. All lights turned off."
```

**Complex automation:**
```
You: "Make it so all doors lock automatically when I leave the property"

Claude Code (via MCP):
1. Lists entities to understand available locks and presence sensors
   → homeassistant_list_entities(domain="lock")
   → homeassistant_list_entities(domain="person")

2. Designs automation config:
   {
     "alias": "Auto-lock doors when leaving",
     "trigger": {
       "platform": "state",
       "entity_id": "person.samuel",
       "to": "not_home"
     },
     "action": {
       "service": "lock.lock",
       "target": {"entity_id": ["lock.front_door", "lock.back_door"]}
     }
   }

3. Creates automation:
   → homeassistant_create_automation("auto_lock_leaving", config)

Response: "I've created an automation that locks all doors when you leave.
          It will lock: front door, back door. Want me to test it?"
```

**References:**
- [Home Assistant REST API Docs](https://developers.home-assistant.io/docs/api/rest/)
- [Home Assistant API Integration](https://www.home-assistant.io/integrations/api/)
- [HomeAssistant-API Python Package](https://pypi.org/project/HomeAssistant-API/)

---

## Interaction Flows

### Flow 1: Proactive Email Notification

```
1. Background daemon detects 3 urgent emails
   ↓
2. Sends push notification to Android: "You have 3 urgent emails"
   ↓
3. If BT headset connected, speaks: "You have 3 urgent emails.
   Do you want me to tell you about them?"
   ↓
4. User presses headset button (or taps notification)
   ↓
5. User speaks: "Yes, tell me"
   ↓
6. Android app → STT → "Yes, tell me" (text)
   ↓
7. Send to Odin MCP server
   ↓
8. Odin routes to Claude Code via MCP
   ↓
9. Claude Code:
   - Calls read_emails(priority_min=4, unread_only=true)
   - Gets 3 emails with full context
   - Analyzes each one
   - Generates intelligent summary
   ↓
10. Claude returns summary text
    ↓
11. Odin sends to Android app
    ↓
12. Android TTS speaks:
    "You have 3 urgent emails:

    1. CEO needs Q4 budget by end of day today
    2. Team meeting rescheduled from 2pm to 3pm
    3. Sarah needs code review for authentication feature

    Would you like me to draft responses?"
    ↓
13. User: "Yes, draft response to CEO"
    ↓
14. Claude Code:
    - Calls draft_email(email_id=123, tone="professional")
    - Generates draft considering email context
    - Returns draft
    ↓
15. Speaks: "I've drafted a response confirming you'll have
    the budget ready by 5pm. Should I send it or would you
    like to review it first?"
```

### Flow 2: Home Automation Command

```
1. User presses BT headset button
   ↓
2. User speaks: "Turn off all lights in the house"
   ↓
3. Android STT → Text → Odin MCP server
   ↓
4. Odin routes to Claude Code via MCP
   ↓
5. Claude Code:
   - Understands intent: turn off lights
   - Calls homeassistant_call_service(
       domain="light",
       service="turn_off",
       entity_id="all"
     )
   ↓
6. Home Assistant executes command
   ↓
7. Returns success
   ↓
8. Claude generates response: "Done. All lights turned off."
   ↓
9. Android TTS speaks response
```

### Flow 3: Complex Automation Creation

```
1. User: "Make it so all doors lock automatically when I leave the property"
   ↓
2. Claude Code (intelligent reasoning):
   - This is an automation request, not a one-time command
   - Need to understand available entities first
   ↓
3. Claude calls:
   - homeassistant_list_entities(domain="lock")
     → Returns: lock.front_door, lock.back_door, lock.garage
   - homeassistant_list_entities(domain="person")
     → Returns: person.samuel
   ↓
4. Claude designs automation:
   - Trigger: when person.samuel changes to "not_home"
   - Action: lock all door locks
   ↓
5. Claude calls:
   - homeassistant_create_automation("auto_lock_leaving", config)
   ↓
6. Returns success
   ↓
7. Claude responds:
   "I've created an automation called 'Auto-lock when leaving'.

   It will automatically lock these doors when you leave:
   - Front door
   - Back door
   - Garage

   The automation is now active. Want me to add any conditions,
   like time-of-day restrictions?"
```

---

## Cost Analysis

### Current Architecture (API-based)
| Service | Monthly Cost |
|---------|-------------|
| Anthropic API (email processing, tasks, search) | $60-150 |
| OpenAI Realtime API (voice interface) | $90 |
| **Total** | **$150-240** |

### New Architecture (Claude Code + MCP + Hybrid Deployment)
| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| Claude Pro subscription | $20 (already paying) | Max tier, unlimited usage |
| Odin VM Instance | $10-20 | Always-on main instance |
| Odin Laptop Instance | $0 | Runs when laptop on, dev environment |
| Chatterbox TTS | $0-30 | $0 on Mac, $30 cloud GPU if needed 24/7 |
| Android STT/Tasker | $0 | Free Android speech recognition |
| Home Assistant | $0 | Already have, local/cloud |
| **Total** | **$30-70** |

**Cost Scenarios:**
- **Development phase:** $30/month (VM only, Chatterbox on Mac)
- **Production (light use):** $40/month (VM + Chatterbox part-time)
- **Production (24/7 voice):** $60-70/month (VM + Chatterbox 24/7)

**Savings:**
- **vs Current:** $80-210/month = $960-2,520/year
- **vs Original plan:** Even keeping some infrastructure, massive savings
- **Key win:** Using Claude Pro subscription that's already paid for

---

## Implementation Phases

### Phase 1: MCP Server Foundation + Factory (3-4 weeks)
**Goal:** Transform Odin to containerized MCP architecture with Gateway orchestration and factory capability

**Tasks:**
- **Docker MCP Gateway Setup:**
  - Install and configure MCP Gateway on VM and laptop
  - Set up Gateway network and container management
  - Configure routing rules and access control

- **Core Odin MCP (Containerized):**
  - Implement Core Odin MCP server using MCP SDK
  - Define 15 core tools (read_emails, create_task, search, calendar, drive, homeassistant_*)
  - Create Dockerfile (multi-platform: amd64 + arm64)
  - Build and deploy as Docker container
  - Register with MCP Gateway

- **MCP Factory Implementation:**
  - Create factory template system (6 template categories)
  - Implement `create_integration_mcp()` tool
  - Implement `list_integration_mcps()` and `remove_integration_mcp()` tools
  - Build template generator engine
  - Create initial templates: e-commerce, communication, productivity, data-source, smart-home, custom-api
  - Test factory by generating sample MCP (e.g., weather API)

- **Dual-Instance Deployment:**
  - Deploy main instance on VM (always-on)
  - Deploy laptop instance (local control, HA bridge)
  - Set up Gateway coordination between instances
  - Both instances connect via Gateway

- **Testing & Migration:**
  - Test with Claude Desktop/Code via Gateway
  - Verify context efficiency (compare token usage)
  - Remove Anthropic API calls from background processing
  - Test factory: generate new integration, use it, remove it

**Deliverables:**
- Docker MCP Gateway running on VM and laptop
- Core Odin MCP containerized and registered
- MCP Factory with 6 template categories
- 15 core MCP tools
- Factory tools for dynamic integration creation
- VM and laptop deployment scripts (Docker Compose)
- Gateway configuration files
- Factory template library
- Documentation: connecting Claude via Gateway
- Migration guide from API-based to MCP-based

**Duration:** 3-4 weeks (extended to include factory)

---

### Phase 2: Intelligent Triage Daemon (2-3 weeks)
**Goal:** Enable proactive notifications with intelligent queuing

**Tasks:**
- Build intelligent triage system (not simple thresholds)
- Implement multiple urgency queues (immediate, today, scheduled)
- Create configurable notification rules (YAML config)
- Build notification system (push to Android)
- Implement scheduled review times
- Add "anything new?" on-demand query
- Test and refine triage logic

**Deliverables:**
- odin-daemon systemd service with intelligent triage
- Configurable triage rules (easy to experiment)
- Multiple notification queues
- Push notification integration
- Review time scheduling
- On-demand queue queries

**Duration:** 2-3 weeks

---

### Phase 3: Voice Interface MVP (Tasker) (1-2 weeks)
**Goal:** Push-to-talk voice interface without app development

**Tasks:**
- Set up Chatterbox TTS on Mac (development)
- Build streaming voice API (WebSocket STT + TTS)
- Configure Tasker profiles for push-to-talk
- Test headset button detection (Aftershokz)
- Test phone button alternatives
- Implement streaming audio (both directions)
- Test latency and quality

**Deliverables:**
- Chatterbox TTS running (Mac or cloud)
- Streaming voice API (WebSocket)
- Tasker profiles (headset, phone buttons)
- Push-to-talk workflow tested
- Latency <2 seconds from button release

**Duration:** 1-2 weeks
**Note:** Skip custom app development initially - validate with Tasker first

---

### Phase 4: Home Assistant Integration (1-2 weeks)
**Goal:** Control home automation via laptop bridge

**Tasks:**
- Implement Home Assistant service (via SSH from laptop)
- Create MCP tools for HA (call_service, get_state, list_entities, create_automation)
- Configure laptop instance as bridge
- Test simple commands ("turn off lights")
- Test automation creation ("lock doors when leaving")
- Test entity discovery
- Documentation

**Deliverables:**
- Home Assistant integration via laptop bridge
- MCP tools for home control
- Automation creation support
- SSH tunnel setup
- Usage examples and recipes

**Duration:** 1-2 weeks

---

### Phase 5: Chat Interface (1 week)
**Goal:** Add text-based chat alongside voice

**Tasks:**
- Implement Telegram bot integration (fastest)
- OR build simple web interface
- Connect to Odin MCP server
- Test with Claude Code backend
- Add rich formatting support

**Deliverables:**
- Telegram bot or web chat interface
- Multi-interface support (Desktop, Code, voice, chat)
- User can choose preferred interface

**Duration:** 1 week

---

### Phase 6: Testing & Polish (2 weeks)
**Goal:** End-to-end testing and UX refinement

**Tasks:**
- Test all interaction flows
- Optimize streaming audio latency
- Refine triage notification rules based on usage
- Test dual-instance coordination
- Test all button options (headset, phone, ESP32 if built)
- Improve error handling
- User testing with real workflows
- Documentation and guides

**Deliverables:**
- Comprehensive testing results
- Optimized latency (<1s voice response)
- Refined notification rules
- Complete documentation
- User guide for all interfaces

**Duration:** 2 weeks

---

### Phase 7 (Optional): ESP32 Button Pendant (1-2 days)
**Goal:** Build custom wearable button for PTT

**Tasks:**
- Assemble ESP32 + button + LED + battery
- Program Bluetooth HID or notification sender
- Configure Tasker to receive ESP32 events
- Test button feedback (LED, haptic)
- 3D print enclosure (optional)

**Deliverables:**
- Working ESP32 pendant
- Bluetooth integration with Tasker
- Visual/haptic feedback
- Wearable design

**Duration:** 1-2 days (hardware fun project)

---

### Phase 8 (Future): Custom App (If Needed)
**Goal:** Only if Tasker proves insufficient

**Tasks:**
- Build React Native app (or native Android)
- Integrate voice + chat in one interface
- Port Tasker logic to app
- Better UX and polish

**Deliverables:**
- Custom Odin mobile app
- Voice + chat unified interface
- App store distribution

**Duration:** 3-4 weeks
**Note:** ONLY do this if Tasker limitations become painful

---

**Total Timeline:** 10-14 weeks (2.5-3.5 months) for core functionality
**Updated:** Phase 1 extended by 1 week to include MCP Factory implementation
**Optional:** +1-2 days for ESP32, +3-4 weeks for custom app if needed

**Priority Order:**
1. MCP Server + Gateway + Factory (foundation with unlimited expansion)
2. Intelligent Triage (proactive notifications)
3. Voice MVP (Tasker push-to-talk)
4. Home Assistant (laptop bridge)
5. Chat Interface (Telegram/web)
6. Testing & Polish
7. ESP32 pendant (fun, optional)
8. Custom app (only if needed)

---

## Decisions Made (2026-01-16)

### ✅ 1. MCP Server Deployment
**Decision: Hybrid dual-instance architecture**

- **Main instance (VM):** Always running, handles core operations, accessible anywhere
- **Laptop instance (MacBook):** Local control, file access, Home Assistant bridge, dev environment
- **Coordination:** Laptop can take instructions from main, work independently, report back
- **Cost:** $10-20/month for VM
- **Benefits:** Always-on monitoring + local capabilities when needed

---

### ✅ 2. Claude Interface Preference
**Decision: Use both interfaces**

- **Claude Desktop:** Quick interactions, Cowork features
- **Claude Code:** Power workflows, subagent support
- **Voice (Tasker):** Hands-free, mobile use
- **Chat (Telegram/web):** Text-based when appropriate
- **User chooses:** Best interface for context

---

### ✅ 3. Voice Interface Approach
**Decision: Push-to-talk via Tasker (MVP), NOT custom app initially**

- **Design:** Press button → talk → release → Odin responds
- **Buttons:** Aftershokz headset play button, phone button, or ESP32 pendant
- **Technology:** Tasker automation (not custom app)
- **TTS:** Chatterbox (self-hosted, better than ElevenLabs, free)
- **Streaming:** Both audio recording and playback stream (low latency)
- **Custom app:** Only if Tasker proves insufficient (defer for now)

---

### ✅ 4. Notification System
**Decision: Intelligent triage with configurable scheduling**

- **NOT simple thresholds:** Odin evaluates ALL incoming items
- **Multiple queues:** immediate, today, scheduled
- **Configurable:** Easy to experiment with different rules (YAML config)
- **Context-aware:** Considers calendar, quiet hours, current activity
- **On-demand:** User can ask "anything new?" anytime
- **Review times:** User configures (e.g., 9am, 1pm, 5pm)
- **Quiet hours:** To be configured (e.g., 10pm-7am)

---

### ✅ 5. Home Assistant Integration
**Decision: Via SSH from laptop instance**

- **Connection:** Laptop bridges to local Home Assistant
- **Access:** SSH tunnel from VM → laptop → Home Assistant
- **URL:** Local network access from laptop
- **Authentication:** Long-lived access token (to be provided)
- **Entities:** To be discovered via API

---

### ✅ 6. Hardware Specifications
**Decision: Confirmed**

- **Phone:** Samsung Galaxy S23
- **Headset:** Aftershokz (bone conduction)
- **Development machine:** MacBook Pro (Apple Silicon)
- **Optional:** ESP32 pendant button (fun future project)

---

### ✅ 7. MCP Architecture: Docker Gateway + Tiered System (NEW - 2026-01-17)
**Decision: Use Docker MCP Gateway for orchestration + tiered MCP architecture**

**Rationale:**
- Solves context window problem (90% token reduction)
- Container isolation improves security
- Gateway enables dynamic loading/unloading of integrations
- Official Docker support for MCP infrastructure

**Architecture Tiers:**
- **Tier 1:** Core Odin MCP (Docker container, always running, 15 tools)
- **Tier 2:** Generated Integration MCPs (Docker containers, on-demand)
- **Tier 3:** Workflow Skills (not MCPs, loaded when needed)

**Benefits:**
- Context usage: ~5,000 tokens instead of 50,000 tokens
- Security: Cryptographic signatures, SBOMs, container isolation
- Management: Docker Desktop GUI for monitoring
- Scalability: Unlimited integrations without context bloat

---

### ✅ 8. MCP Factory for Dynamic Integration Creation (NEW - 2026-01-17)
**Decision: Build MCP factory for automatic integration generation**

**Capability:**
- Core Odin includes `create_integration_mcp(service, type, api_endpoint, auth)` tool
- Factory generates new MCP servers from templates in 2-3 minutes
- Generated MCPs packaged as Docker containers
- Automatically registered with MCP Gateway

**Templates Available:**
- E-commerce (eBay, Amazon, Shopify, Etsy)
- Communication (Slack, Discord, Telegram)
- Productivity (Notion, Todoist, Trello, Linear)
- Data sources (Weather, stocks, news, RSS)
- Smart home (Device-specific integrations)
- Custom REST API (generic wrapper)

**Benefits:**
- Add new capabilities in minutes instead of weeks
- No development bottleneck for new integrations
- Consistent patterns across all generated MCPs
- User can expand Odin's capabilities themselves

**Example:**
```
You: "Add eBay search capability"
Claude: Creates new eBay MCP using factory
2-3 minutes later: eBay search available
```

---

### ⏳ Still Needed from User

**1. Home Assistant Access Details:**
- Local URL (e.g., http://homeassistant.local:8123)
- Long-lived access token
- List of key entities you want to control

**2. Notification Preferences (to configure later):**
- Preferred review times
- Quiet hours
- Important senders list
- Initial notification rules (we'll iterate)

---

## Migration Strategy

### From Current Odin to MCP-based Odin

**Phase 1: Add MCP alongside existing API**
- Keep existing Anthropic API calls working
- Add MCP server in parallel
- Test MCP tools with Claude Code
- Gradually shift workflows to MCP

**Phase 2: Disable API-based background processing**
- Stop background AI categorization (save API costs)
- Use proactive daemon for detection only
- Claude Code handles AI via MCP when needed

**Phase 3: Remove API dependencies**
- Remove Anthropic API calls
- Remove OpenAI Realtime API (when voice works via Android)
- Clean up old code
- Update documentation

**No data migration needed** - PostgreSQL database stays the same

---

## Success Metrics

### Cost Savings
- [ ] API costs reduced from $150-240/month to $0
- [ ] Total cost = Claude Pro subscription only ($20/month)

### User Experience
- [ ] Proactive notifications working (Odin initiates conversations)
- [ ] Voice interface working via Android + BT headset
- [ ] Response time < 5 seconds for voice queries
- [ ] Home Assistant commands execute successfully

### Technical
- [ ] Docker MCP Gateway running and orchestrating containers
- [ ] 15+ core MCP tools implemented and tested
- [ ] MCP Factory operational with 6 template categories
- [ ] Context window usage <5,000 tokens (vs 50,000+ without Gateway)
- [ ] Claude Code can access all Odin capabilities via Gateway
- [ ] Android app (Tasker) stable and responsive
- [ ] Background daemon runs reliably 24/7

### Factory & Extensibility
- [ ] Factory can generate new MCP in <3 minutes
- [ ] Generated MCPs auto-register with Gateway
- [ ] At least 2 integrations created via factory (test cases)
- [ ] User can add new capabilities independently

### Intelligence
- [ ] Claude provides better context-aware responses than API-based approach
- [ ] Multi-step workflows executed successfully via subagents
- [ ] Automation creation works (Home Assistant)
- [ ] Factory-generated integrations work as well as hand-coded ones

---

## Related Documents

- **ADR-003:** MCP Architecture Integrations (existing decision)
- **ADR-004:** Voice Interface Realtime API (superseded by Android approach)
- **Issue #6:** Implement MCP Server for Claude Integration (GitHub)
- **Epic 007:** Family Context Engine (future integration point)

---

## References

**Claude Cowork:**
- [Introducing Cowork (Claude Blog)](https://claude.com/blog/cowork-research-preview)
- [Getting Started with Cowork (Help Center)](https://support.claude.com/en/articles/13345190-getting-started-with-cowork)
- [First impressions - Simon Willison](https://simonwillison.net/2026/Jan/12/claude-cowork/)
- [VentureBeat: Anthropic launches Cowork](https://venturebeat.com/technology/anthropic-launches-cowork-a-claude-desktop-agent-that-works-in-your-files-no)

**Home Assistant:**
- [Home Assistant REST API Docs](https://developers.home-assistant.io/docs/api/rest/)
- [Home Assistant API Integration](https://www.home-assistant.io/integrations/api/)
- [HomeAssistant-API Python Package](https://pypi.org/project/HomeAssistant-API/)

**MCP Protocol:**
- [Model Context Protocol Documentation](https://github.com/modelcontextprotocol)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)

**Docker MCP Infrastructure:**
- [Docker MCP Catalog](https://www.docker.com/products/mcp-catalog-and-toolkit/)
- [MCP Gateway Documentation](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/)
- [Docker MCP Registry (GitHub)](https://github.com/docker/mcp-registry)
- [Simplifying AI Development with MCP and Docker](https://www.docker.com/blog/simplify-ai-development-with-the-model-context-protocol-and-docker/)

---

## Next Steps

**Planning Status: ✅ COMPLETE**

All major architecture decisions have been made. Ready to begin implementation.

**Immediate Next Steps:**

1. **Create GitHub Issues** (Week 1)
   - Issue for Phase 1: MCP Server Foundation + Gateway + Factory
   - Issue for Phase 2: Intelligent Triage Daemon
   - Issue for Phase 3: Voice Interface MVP (Tasker)
   - Issue for Phase 4: Home Assistant Integration
   - Issue for Phase 5: Chat Interface
   - Issue for Phase 6: Testing & Polish

2. **Set Up Docker MCP Infrastructure** (Week 1)
   - Install Docker MCP Gateway on VM and laptop
   - Configure Gateway networking
   - Test Gateway with sample MCP
   - Verify container orchestration works

3. **Set Up Development Environment** (Week 1)
   - VM for main Odin instance
   - Laptop instance setup
   - MCP SDK installation
   - Docker and Docker Compose setup
   - Claude Desktop/Code configuration with Gateway

4. **Create MCP Factory Template System** (Week 1-2)
   - Design template directory structure
   - Create first template: custom-rest-api (generic)
   - Build template generator engine
   - Test: generate sample integration (e.g., weather API)

5. **Test Chatterbox TTS** (Week 1)
   - Install on MacBook for development
   - Test voice quality and latency
   - Create voice clone (5-10 seconds of audio)
   - Verify streaming capability

6. **Gather Home Assistant Details** (Week 1)
   - User provides HA URL and access token
   - Document available entities
   - Test SSH tunnel from laptop

7. **Begin Phase 1 Implementation** (Week 2+)
   - Containerize Core Odin MCP
   - Implement first 5 core MCP tools
   - Register with Gateway
   - Test via Claude Code through Gateway
   - Verify context efficiency gains

**Deferred Items:**
- Phone calling functionality (research complete, defer implementation)
- Custom mobile app (only if Tasker insufficient)
- ESP32 pendant (optional fun project for later)

---

**Status:** ✅ Planning Complete - Ready for Implementation

**Architecture Approved:** Yes (all decisions made, including Docker MCP Gateway + Factory)
**Timeline:** 10-14 weeks for core functionality (extended for factory implementation)
**Cost:** $30-70/month (vs $150-240/month currently)
**Savings:** $80-210/month = $960-2,520/year

**Key Innovations:**
- Docker MCP Gateway for 90% context reduction
- MCP Factory for unlimited integration expansion (2-3 minutes per new integration)
- Tiered architecture: Core (always-on) + Generated (on-demand) + Skills (zero-context)
- Containerized MCPs with security signatures and SBOMs

**Last Updated:** 2026-01-17 (added Docker MCP Gateway + Factory architecture)
**Planning Lead:** Supervisor (Claude Sonnet 4.5)
**Stakeholder:** Samuel
