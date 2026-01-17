# Odin Migration Plan: API-based → MCP Architecture

**Date:** 2026-01-17
**Status:** In Progress
**Estimated Duration:** 6-8 weeks
**Current Phase:** Phase 1 - MCP Foundation

---

## Executive Summary

This plan transforms Odin from an API-based application to an MCP-orchestrated system while **preserving 80% of existing code**. The migration is additive, not destructive - existing functionality continues working throughout.

**Key Principle:** Wrap, don't rebuild.

---

## What We're Keeping (80% of code - ZERO changes needed)

### ✅ Core Services Layer (~3,000 lines)
**Location:** `/src/odin/services/`

All 13 services remain unchanged:
- `email_service.py` - Email operations
- `gmail_service.py` - Gmail API integration
- `task_service.py` - Task management with AI prioritization
- `search_service.py` - Semantic search (pgvector)
- `calendar_service.py` - Google Calendar integration
- `drive_service.py` - Google Drive operations
- `google_oauth_service.py` - Multi-account OAuth
- `automation_service.py` - Email automation
- `ai_service.py` - AI processing pipeline
- `embedding_service.py` - Vector embeddings
- `background_tasks.py` - Celery background tasks

**Why keep:** These are battle-tested, fully functional, and contain all core business logic.

### ✅ Database Layer (~800 lines)
**Location:** `/src/odin/models/`

All models remain unchanged:
- PostgreSQL database with pgvector extension
- Models: Email, Task, User, GoogleCredential, EmailDraft, EmailTemplate
- Alembic migrations
- All existing data

**Why keep:** Database schema is solid and supports all current + future needs.

### ✅ Infrastructure Layer (~500 lines)
**Location:** Root directory

Docker infrastructure remains:
- `Dockerfile` (multi-stage builds)
- `docker-compose.yml` (PostgreSQL, Redis, Celery)
- All deployment scripts
- Health checks and monitoring

**Why keep:** Already containerized and production-ready. Just need to add MCP Gateway alongside.

### ✅ Testing Suite (~1,500 lines)
**Location:** `/tests/`

All existing tests remain valid:
- 25+ integration tests
- Service tests
- API tests (will run alongside MCP tests)

**Why keep:** Ensures existing functionality doesn't break during migration.

---

## What We're Adding (20% new code - ~4,500 lines)

### 🆕 Component 1: Core Odin MCP Wrapper
**Location:** `/src/odin/mcp/server.py` (NEW)
**Size:** ~700 lines
**Effort:** 2-3 days

**Purpose:** Expose existing services as MCP tools

**Architecture:**
```python
# Core Odin MCP wraps existing services
from mcp import MCPServer, MCPTool
from odin.services.email_service import EmailService  # EXISTING
from odin.services.task_service import TaskService    # EXISTING

class OdinMCPServer(MCPServer):
    def __init__(self):
        # Initialize existing services
        self.email_service = EmailService()
        self.task_service = TaskService()
        # ... other services

    @MCPTool
    async def read_emails(self, filters):
        """Read emails with filtering"""
        # Just wraps existing service - no duplication
        return await self.email_service.get_emails(filters)

    @MCPTool
    async def create_task(self, task_data):
        """Create new task"""
        # Wraps existing service
        return await self.task_service.create_task(task_data)

    # ... 13 more tools wrapping existing services
```

**Tools to implement (15 total):**
1. `read_emails()` → wraps EmailService.get_emails()
2. `draft_email()` → wraps AutomationService.draft_email()
3. `send_email()` → wraps GmailService.send_email()
4. `get_tasks()` → wraps TaskService.get_tasks()
5. `create_task()` → wraps TaskService.create_task()
6. `complete_task()` → wraps TaskService.complete_task()
7. `semantic_search()` → wraps SearchService.search()
8. `get_calendar_events()` → wraps CalendarService.get_events()
9. `create_calendar_event()` → wraps CalendarService.create_event()
10. `search_drive()` → wraps DriveService.search()
11. `get_drive_file()` → wraps DriveService.get_file()
12. `homeassistant_call_service()` → NEW (HomeAssistantService)
13. `homeassistant_get_state()` → NEW (HomeAssistantService)
14. `homeassistant_list_entities()` → NEW (HomeAssistantService)
15. `create_integration_mcp()` → NEW (Factory)

**Deliverables:**
- `/src/odin/mcp/server.py` - Core MCP server
- `/src/odin/mcp/__init__.py` - Package init
- `/src/odin/mcp/tools/` - Individual tool implementations
- Dockerfile for Core Odin MCP container
- Tests for MCP wrapper

---

### 🆕 Component 2: Docker MCP Gateway Integration
**Location:** `/infrastructure/mcp-gateway/` (NEW)
**Size:** ~250 lines (mostly config)
**Effort:** 1-2 days

**Purpose:** Orchestrate MCP containers and route requests

**Files:**
- `gateway-config.json` - Gateway configuration
- `docker-compose.gateway.yml` - Gateway service definition
- `gateway-setup.sh` - Installation script

**Configuration:**
```json
{
  "gateway": {
    "name": "odin-gateway",
    "port": 3000,
    "mcp_servers": [
      {
        "name": "core-odin",
        "container": "odin-mcp-core",
        "always_running": true,
        "tools": ["read_emails", "create_task", "semantic_search", ...]
      }
    ],
    "routing": {
      "default": "core-odin",
      "patterns": {
        "email_*": "core-odin",
        "task_*": "core-odin",
        "homeassistant_*": "core-odin",
        "search_*": "core-odin"
      }
    }
  }
}
```

**Deliverables:**
- Docker MCP Gateway installed on VM and laptop
- Configuration files
- Gateway running and routing to Core Odin MCP

---

### 🆕 Component 3: MCP Factory System
**Location:** `/src/odin/mcp_factory/` (NEW)
**Size:** ~1,300 lines
**Effort:** 1-2 weeks

**Purpose:** Generate new MCP integrations from templates

**Structure:**
```
/src/odin/mcp_factory/
├── generator.py           # Template engine (300 lines)
├── registry.py            # Track generated MCPs (150 lines)
├── docker_builder.py      # Build containers (200 lines)
├── gateway_registrar.py   # Register with Gateway (150 lines)
└── templates/
    ├── e-commerce-rest-api/
    │   ├── template.py           # MCP server template
    │   ├── Dockerfile.template   # Container template
    │   ├── config.yaml          # Template metadata
    │   └── README.md            # Documentation
    ├── communication-webhook/
    ├── productivity-api/
    ├── data-source-polling/
    ├── smart-home-device/
    └── custom-rest-api/
```

**Factory Tool Implementation:**
```python
# Part of Core Odin MCP
@MCPTool
async def create_integration_mcp(
    self,
    service_name: str,
    service_type: str,
    api_endpoint: str,
    auth_method: str,
    capabilities: List[str],
    api_docs_url: Optional[str] = None
) -> dict:
    """Factory tool - generates new MCP integrations"""
    from odin.mcp_factory import Generator

    generator = Generator()
    result = await generator.create_mcp(
        service_name=service_name,
        service_type=service_type,
        api_endpoint=api_endpoint,
        auth_method=auth_method,
        capabilities=capabilities
    )

    return {
        "mcp_name": result.name,
        "container_id": result.container_id,
        "status": "running",
        "tools_created": result.tools,
        "gateway_registered": True
    }
```

**Deliverables:**
- Factory generator engine
- 6 template categories
- Template rendering system
- Docker container builder
- Gateway registration automation
- Factory tool in Core Odin MCP

---

### 🆕 Component 4: Intelligent Triage Daemon
**Location:** `/src/odin/services/triage_service.py` (NEW)
**Size:** ~1,000 lines
**Effort:** 1-2 weeks

**Purpose:** Proactive notification system

**Uses existing:**
- EmailService (get new emails)
- TaskService (get tasks)
- AI categorization (already done in background)

**Adds new:**
- Queue management (immediate, today, scheduled)
- Notification triggers
- Scheduling logic
- Configuration via YAML

**Architecture:**
```python
class TriageService:
    def __init__(self):
        self.email_service = EmailService()  # EXISTING
        self.task_service = TaskService()    # EXISTING
        self.queues = {
            "immediate": [],
            "today": [],
            "scheduled": []
        }

    async def process_new_items(self):
        """Evaluate new emails/tasks and queue"""
        # Get from existing services
        new_emails = await self.email_service.get_unprocessed()

        for email in new_emails:
            urgency = self.evaluate_urgency(email)
            self.queues[urgency].append(email)

    async def check_notification_triggers(self):
        """Send notifications when appropriate"""
        if len(self.queues["immediate"]) >= 3:
            await self.notify_user("immediate", self.queues["immediate"])
```

**Deliverables:**
- TriageService implementation
- Configuration YAML
- Notification delivery (Android push, voice)
- Systemd service for daemon
- Tests

---

### 🆕 Component 5: Home Assistant Integration
**Location:** `/src/odin/integrations/homeassistant/` (NEW)
**Size:** ~500 lines
**Effort:** 3-5 days

**Purpose:** Control Home Assistant via REST API

**Implementation:**
```python
class HomeAssistantService:
    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token

    async def call_service(self, domain: str, service: str, ...):
        """Call HA service"""
        # REST API implementation

    async def get_state(self, entity_id: str):
        """Get entity state"""

    async def list_entities(self, domain: Optional[str] = None):
        """List available entities"""

    async def create_automation(self, name: str, config: dict):
        """Create automation"""
```

**Deliverables:**
- HomeAssistantService implementation
- MCP tools in Core Odin MCP
- SSH tunnel setup (laptop → HA)
- Tests
- Documentation

---

### 🆕 Component 6: Voice Interface (Deferred to Phase 3)
**Location:** `/src/odin/voice/` (NEW)
**Size:** ~800 lines
**Effort:** 1-2 weeks

**Components:**
- WebSocket streaming API
- STT integration
- Chatterbox TTS integration
- Tasker configuration

**Note:** Not part of initial deployment, will add in Phase 3.

---

## Migration Phases

### Phase 1: MCP Foundation (Weeks 1-4)
**Goal:** Core Odin MCP + Gateway operational

**Week 1: Setup**
- [x] Create migration plan
- [ ] Install MCP SDK
- [ ] Install Docker MCP Gateway on VM
- [ ] Install Docker MCP Gateway on laptop
- [ ] Create MCP server structure

**Week 2-3: Core MCP Implementation**
- [ ] Implement 15 MCP tools (wrapping existing services)
- [ ] Create Dockerfile for Core Odin MCP
- [ ] Build and test container locally
- [ ] Register with Gateway
- [ ] Test: Claude Code → Gateway → Core Odin MCP

**Week 4: Factory Foundation**
- [ ] Create factory structure
- [ ] Implement template engine
- [ ] Create first template (custom-rest-api)
- [ ] Implement create_integration_mcp() tool
- [ ] Test: Generate sample MCP

**Deliverables:**
- Core Odin MCP running in container
- Gateway orchestrating requests
- Factory capable of generating basic integrations
- All existing functionality still working via FastAPI

**Success Criteria:**
- Claude Code can call all 15 core tools via Gateway
- Factory can generate and deploy a test integration
- Existing FastAPI endpoints still work
- All existing tests pass

---

### Phase 2: Extended Features (Weeks 5-7)
**Goal:** Triage daemon + Home Assistant + More factory templates

**Week 5: Triage Daemon**
- [ ] Implement TriageService
- [ ] Create configuration YAML
- [ ] Build notification delivery
- [ ] Test with real email flow

**Week 6: Home Assistant**
- [ ] Implement HomeAssistantService
- [ ] Add HA tools to Core Odin MCP
- [ ] Set up laptop SSH bridge
- [ ] Test: Control HA via Claude Code

**Week 7: Factory Templates**
- [ ] Create remaining 5 templates
- [ ] Test each template
- [ ] Generate real integrations (eBay, weather, etc.)
- [ ] Documentation

**Deliverables:**
- Intelligent triage sending proactive notifications
- Home Assistant controllable via voice/Claude
- Factory with all 6 templates operational
- Multiple generated integrations deployed

**Success Criteria:**
- Triage daemon running 24/7, sending notifications
- Can control home via Claude Code
- Factory can generate any of 6 template types
- At least 2 real integrations generated and tested

---

### Phase 3: Voice + Polish (Weeks 8-10)
**Goal:** Voice interface + testing + deployment

**Week 8: Voice Interface**
- [ ] Implement WebSocket streaming API
- [ ] Integrate STT
- [ ] Integrate Chatterbox TTS
- [ ] Configure Tasker

**Week 9: Testing & Optimization**
- [ ] Comprehensive integration tests
- [ ] Performance optimization
- [ ] Context window verification
- [ ] Security audit

**Week 10: Deployment & Documentation**
- [ ] VM deployment finalized
- [ ] Laptop deployment guide
- [ ] User documentation
- [ ] Handoff complete

**Deliverables:**
- Push-to-talk voice interface working
- Complete test coverage
- Production deployment on VM
- Laptop deployment guide
- User documentation

**Success Criteria:**
- Voice latency < 2 seconds
- All tests passing
- VM deployed and stable
- User can deploy laptop instance
- Documentation complete

---

## Deployment Architecture

### VM Deployment (Main Instance - Always Running)
**Location:** Your VM (to be provisioned)

**Components:**
```
VM (Ubuntu/Debian)
├── Docker MCP Gateway (port 3000)
├── Core Odin MCP Container (port 8001)
├── PostgreSQL Container (existing)
├── Redis Container (existing)
├── Celery Worker (existing)
├── Celery Beat (existing)
├── Triage Daemon Container (new)
├── Chatterbox TTS Container (optional, port 5000)
└── Generated MCP Containers (dynamic)
```

**Docker Compose Structure:**
```yaml
# docker-compose.mcp.yml
version: '3.8'

services:
  mcp-gateway:
    image: docker/mcp-gateway:latest
    ports:
      - "3000:3000"
    volumes:
      - ./gateway-config.json:/config/gateway.json
    networks:
      - odin-network

  odin-mcp-core:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
      - mcp-gateway
    networks:
      - odin-network

  triage-daemon:
    build:
      context: .
      dockerfile: Dockerfile.triage
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
      - odin-mcp-core
    networks:
      - odin-network

  # Existing services continue (postgres, redis, etc.)
  postgres:
    # ... existing config

  redis:
    # ... existing config

networks:
  odin-network:
    driver: bridge
```

**Ports:**
- 3000: MCP Gateway
- 8000: FastAPI (existing, keep during migration)
- 8001: Core Odin MCP
- 5432: PostgreSQL
- 6379: Redis
- 5000: Chatterbox TTS (optional)

---

### Laptop Deployment (Local Agent)
**Location:** User's MacBook Pro

**Components:**
```
MacBook
├── Docker MCP Gateway (port 3000)
├── Core Odin MCP Container (port 8001)
│   └── Includes Home Assistant bridge
├── Chatterbox TTS Container (port 5000, for dev/testing)
└── SSH Tunnel to Home Assistant (local network)
```

**Purpose:**
- Local file access
- Home Assistant bridge (SSH to local HA instance)
- Development/testing environment
- Can receive tasks from main VM instance
- Chatterbox TTS for voice development

**Docker Compose (Laptop):**
```yaml
# docker-compose.laptop.yml
version: '3.8'

services:
  mcp-gateway:
    image: docker/mcp-gateway:latest
    ports:
      - "3000:3000"
    volumes:
      - ./gateway-config.laptop.json:/config/gateway.json
    networks:
      - odin-network

  odin-mcp-core:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=${VM_DATABASE_URL}  # Connect to VM database
      - HOMEASSISTANT_URL=${HA_LOCAL_URL}
      - HOMEASSISTANT_TOKEN=${HA_TOKEN}
    extra_hosts:
      - "homeassistant.local:${HA_IP}"
    networks:
      - odin-network

  chatterbox-tts:
    image: chatterbox/tts:latest
    ports:
      - "5000:5000"
    volumes:
      - ./voice-models:/models
    networks:
      - odin-network

networks:
  odin-network:
    driver: bridge
```

**What runs on laptop:**
- MCP Gateway (connects to VM Gateway for coordination)
- Core Odin MCP (same container, different config)
- Home Assistant bridge (SSH tunnel)
- Chatterbox TTS (for development)

**What doesn't run on laptop:**
- PostgreSQL (uses VM database)
- Redis (uses VM Redis)
- Celery workers (use VM)
- Triage daemon (runs on VM only)

---

## File Structure (After Migration)

```
/home/samuel/.archon/workspaces/odin/
├── src/
│   └── odin/
│       ├── api/                    # ✅ KEEP - Existing FastAPI (optional)
│       ├── models/                 # ✅ KEEP - Database models
│       ├── services/               # ✅ KEEP - Core business logic
│       │   ├── email_service.py
│       │   ├── task_service.py
│       │   ├── search_service.py
│       │   ├── triage_service.py   # 🆕 NEW
│       │   └── ...
│       ├── integrations/
│       │   ├── email/              # ✅ KEEP
│       │   └── homeassistant/      # 🆕 NEW
│       │       ├── __init__.py
│       │       └── ha_service.py
│       ├── mcp/                    # 🆕 NEW - MCP Server
│       │   ├── __init__.py
│       │   ├── server.py           # Core MCP server
│       │   └── tools/              # Individual tool implementations
│       │       ├── email_tools.py
│       │       ├── task_tools.py
│       │       ├── search_tools.py
│       │       ├── calendar_tools.py
│       │       ├── drive_tools.py
│       │       ├── homeassistant_tools.py
│       │       └── factory_tools.py
│       └── mcp_factory/            # 🆕 NEW - Factory System
│           ├── __init__.py
│           ├── generator.py
│           ├── registry.py
│           ├── docker_builder.py
│           ├── gateway_registrar.py
│           └── templates/
│               ├── e-commerce-rest-api/
│               ├── communication-webhook/
│               ├── productivity-api/
│               ├── data-source-polling/
│               ├── smart-home-device/
│               └── custom-rest-api/
├── infrastructure/                 # 🆕 NEW - MCP Infrastructure
│   └── mcp-gateway/
│       ├── gateway-config.json
│       ├── gateway-config.laptop.json
│       └── gateway-setup.sh
├── docker-compose.yml              # ✅ KEEP - Existing services
├── docker-compose.mcp.yml          # 🆕 NEW - MCP services (VM)
├── docker-compose.laptop.yml       # 🆕 NEW - Laptop deployment
├── Dockerfile                      # ✅ KEEP - Existing API container
├── Dockerfile.mcp                  # 🆕 NEW - Core Odin MCP container
├── Dockerfile.triage               # 🆕 NEW - Triage daemon container
├── requirements.txt                # 🔄 UPDATE - Add MCP SDK
├── tests/                          # ✅ KEEP + ADD
│   ├── test_services.py            # ✅ KEEP - Existing tests
│   └── test_mcp/                   # 🆕 NEW - MCP tests
│       ├── test_server.py
│       ├── test_tools.py
│       └── test_factory.py
└── docs/                           # 🔄 UPDATE
    ├── DEPLOYMENT_VM.md            # 🆕 NEW
    ├── DEPLOYMENT_LAPTOP.md        # 🆕 NEW
    └── MCP_USAGE.md                # 🆕 NEW
```

---

## Testing Strategy

### Phase 1: MCP Foundation Tests

**Unit Tests:**
```python
# tests/test_mcp/test_tools.py
async def test_read_emails_tool():
    """Test MCP read_emails wraps EmailService correctly"""
    server = OdinMCPServer()
    result = await server.read_emails({"priority_min": 3})
    assert len(result) > 0
    assert result[0]["subject"] is not None

async def test_create_task_tool():
    """Test MCP create_task wraps TaskService correctly"""
    server = OdinMCPServer()
    task = await server.create_task({
        "title": "Test task",
        "priority": 3
    })
    assert task["id"] is not None
```

**Integration Tests:**
```python
# tests/test_mcp/test_gateway.py
async def test_gateway_routing():
    """Test Gateway routes to Core Odin MCP"""
    # Make request via Gateway
    result = await gateway_client.call_tool("read_emails", {...})
    assert result["status"] == "success"

async def test_factory_generation():
    """Test Factory generates working MCP"""
    result = await server.create_integration_mcp(
        service_name="TestAPI",
        service_type="custom-rest-api",
        ...
    )
    assert result["status"] == "running"
    # Test generated MCP works
    test_result = await gateway_client.call_tool(
        f"{result['mcp_name']}.test_tool",
        {...}
    )
    assert test_result["status"] == "success"
```

**E2E Tests:**
```python
# tests/test_mcp/test_e2e.py
async def test_claude_code_integration():
    """Test full flow: Claude Code → Gateway → Odin MCP"""
    # Simulate Claude Code making request
    # Verify correct routing
    # Verify result correctness
```

### Phase 2: Triage + HA Tests

**Triage Tests:**
```python
async def test_triage_categorization():
    """Test triage correctly categorizes emails"""

async def test_notification_triggers():
    """Test notifications sent at correct thresholds"""
```

**Home Assistant Tests:**
```python
async def test_ha_service_call():
    """Test calling HA service"""

async def test_ha_automation_creation():
    """Test creating HA automation"""
```

---

## Rollback Strategy

**If MCP migration has issues, easy rollback:**

1. **Keep existing FastAPI running** during entire migration
2. **Separate containers** - MCP doesn't touch existing setup
3. **Rollback:** Stop MCP containers, continue using FastAPI
4. **No data loss** - Same PostgreSQL database throughout

**Rollback commands:**
```bash
# Stop MCP services
docker-compose -f docker-compose.mcp.yml down

# Continue with existing services
docker-compose up -d  # Original services still running
```

---

## Success Metrics

### Phase 1 Complete When:
- [ ] Core Odin MCP exposes 15 tools
- [ ] Docker MCP Gateway orchestrating requests
- [ ] Claude Code can successfully call all tools
- [ ] Context window usage < 5,000 tokens (measured)
- [ ] Factory can generate basic integration
- [ ] All existing tests still pass
- [ ] Existing FastAPI still functional (parallel operation)

### Phase 2 Complete When:
- [ ] Triage daemon running 24/7
- [ ] Proactive notifications working
- [ ] Home Assistant controllable via MCP
- [ ] Factory has all 6 templates
- [ ] At least 2 real integrations generated

### Phase 3 Complete When:
- [ ] Voice interface operational (< 2 second latency)
- [ ] VM deployment stable
- [ ] Laptop deployment documented
- [ ] All tests passing
- [ ] User documentation complete
- [ ] Cost verified at $30-70/month

---

## Risk Mitigation

### Risk 1: MCP SDK Changes
**Mitigation:** Pin MCP SDK version, test thoroughly before upgrading

### Risk 2: Gateway Issues
**Mitigation:** Keep FastAPI running as backup during migration

### Risk 3: Context Window Still Too Large
**Mitigation:** Implement additional tool grouping or lazy loading

### Risk 4: Factory Template Complexity
**Mitigation:** Start with simplest template (custom-rest-api), iterate

### Risk 5: Laptop ↔ VM Coordination
**Mitigation:** Simple coordination via shared database, not complex messaging

---

## Next Steps (Immediate)

**Today (Week 1, Day 1):**
1. ✅ Create this migration plan
2. [ ] Install MCP SDK in Odin workspace
3. [ ] Create MCP server structure
4. [ ] Implement first 3 MCP tools (email tools)
5. [ ] Test locally

**Tomorrow (Week 1, Day 2):**
1. [ ] Implement remaining 12 MCP tools
2. [ ] Create Dockerfile for Core Odin MCP
3. [ ] Build container and test

**Week 1, Day 3-5:**
1. [ ] Install Docker MCP Gateway
2. [ ] Configure Gateway
3. [ ] Register Core Odin MCP with Gateway
4. [ ] Test: Claude Code → Gateway → Core Odin MCP

**Week 2:**
1. [ ] Start factory implementation
2. [ ] Create first template
3. [ ] Test generation

---

**Status:** Migration plan complete. Ready to begin implementation.
**Current Phase:** Phase 1, Week 1, Day 1
**Next Action:** Install MCP SDK and create server structure
