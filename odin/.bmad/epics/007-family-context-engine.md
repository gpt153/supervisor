# Epic 007: Family Context Engine

**Status:** Planned
**Priority:** HIGH
**Phase:** 2 (Month 2 - March 2026)
**Estimated Effort:** 3-4 weeks
**Dependencies:** Epic 001 (Foundation), Epic 002 (Email Ingestion), Epic 003 (AI Processing)

---

## Overview

Build intelligent family context awareness that automatically recognizes, tags, and organizes all information related to the 5 children (2 biological + 3 foster), integrates with school portal, and creates a comprehensive family management system.

This is a core differentiator for Odin - most AI assistants don't have deep family context awareness.

---

## Goals

1. **Child Profiles:** Complete digital profiles for all 5 children
2. **Entity Recognition:** Automatically detect and tag anything related to a child
3. **School Integration:** Real-time data from Quiculum portal (3 kids)
4. **Calendar Automation:** Auto-create events from emails (appointments, activities)
5. **Privacy Controls:** Elevated protection for foster children data
6. **Family-Aware Search:** "Show me everything about Emma's dental issues"

---

## User Stories

### Epic-Level Stories

**As a parent, I want Odin to automatically organize all information about each child so I never lose track of important details.**

**As a foster parent, I want sensitive case information protected with elevated privacy controls so I meet compliance requirements.**

**As a busy parent, I want appointments automatically added to my calendar so I never miss important events.**

---

## Features & Requirements

### Feature 1: Child Profiles

**Child Data Model:**
```python
class Child(BaseModel):
    id: str
    user_id: str  # Parent
    name: str
    nicknames: List[str]
    birth_date: date
    age: int  # Calculated
    pronouns: str

    # Status
    child_type: Literal["biological", "foster"]
    privacy_level: int  # 1=normal, 2=elevated (foster)

    # Relationships
    school_id: Optional[str]
    teachers: List[Person]
    doctors: List[Person]
    friends: List[Person]
    activities: List[Activity]

    # Health
    allergies: List[str]
    medications: List[Medication]
    medical_notes: str

    # Preferences
    interests: List[str]
    favorite_foods: List[str]
    behavioral_notes: str

    # Metadata
    created_at: datetime
    updated_at: datetime
```

**Requirements:**
- [x] Create child profile CRUD API
- [x] Store in PostgreSQL
- [x] Generate embeddings for name/nicknames
- [x] Support privacy levels
- [x] Link to entities (schools, people, activities)

### Feature 2: Entity Recognition

**What to recognize:**
- Child names in emails: "Emma has a dentist appointment"
- Child nicknames: "Emmy needs gym clothes"
- Indirect references: "her appointment", "his homework"
- Context clues: "take the kids to", "pick up from school"

**Implementation:**
```python
class EntityRecognizer:
    """Recognize child entities in text."""

    async def extract_child_entities(
        self,
        text: str,
        user_id: str
    ) -> List[ChildEntity]:
        """
        Extract child mentions from text.

        Returns list of:
        - child_id
        - confidence score
        - matched text span
        """

        children = await self.get_user_children(user_id)

        # 1. Direct name matching
        matches = []
        for child in children:
            # Check name
            if child.name.lower() in text.lower():
                matches.append({
                    "child_id": child.id,
                    "confidence": 0.95,
                    "matched_text": child.name
                })

            # Check nicknames
            for nickname in child.nicknames:
                if nickname.lower() in text.lower():
                    matches.append({
                        "child_id": child.id,
                        "confidence": 0.90,
                        "matched_text": nickname
                    })

        # 2. Use LLM for context clues
        if not matches:
            matches = await self.llm_entity_extraction(text, children)

        return matches

    async def llm_entity_extraction(
        self,
        text: str,
        children: List[Child]
    ) -> List[ChildEntity]:
        """Use LLM to extract child entities with context."""

        prompt = f"""
        Text: "{text}"

        Children in family:
        {[{"name": c.name, "age": c.age} for c in children]}

        Which children (if any) are mentioned or implied in this text?
        Consider:
        - Direct mentions
        - Pronouns with context
        - Age-appropriate activities
        - Schedule patterns

        Return JSON list of child IDs with confidence scores.
        """

        response = await self.llm.generate(prompt, structured_output=True)
        return response.children
```

**Requirements:**
- [x] Name and nickname matching
- [x] LLM-based context extraction
- [x] Pronoun resolution
- [x] Confidence scoring
- [x] Auto-tagging in database

### Feature 3: Quiculum MCP Integration

**Convert existing quiculum-monitor to MCP server:**

**MCP Tools:**
```python
# quiculum-mcp server
Tools provided:
- get_school_news(child_name: str) → List[NewsItem]
- get_school_messages(child_name: str) → List[Message]
- get_student_notes(child_name: str) → List[Elevanteckning]
- get_school_schedule(child_name: str) → Schedule
- search_school_content(query: str) → List[Result]
```

**Odin Integration:**
```python
# services/school_service.py
class SchoolService:
    """Manage school integrations."""

    async def sync_school_data(self, user_id: str):
        """Sync school data for all children."""

        children = await self.get_children_with_quiculum(user_id)

        for child in children:
            # Get news
            news = await self.mcp.call_tool(
                server="quiculum",
                tool="get_school_news",
                params={"child_name": child.name}
            )

            # Store in database
            for item in news:
                await self.store_school_news(
                    child_id=child.id,
                    content=item
                )

                # Auto-tag with child entity
                await self.entity_tagger.tag(
                    entity_type="school_news",
                    entity_id=item.id,
                    child_id=child.id
                )

            # Similar for messages and notes...
```

**Requirements:**
- [x] Convert quiculum-monitor to MCP server
- [x] Define MCP tool interface
- [x] Integrate with Odin
- [x] Auto-sync on schedule (daily)
- [x] Store school data in database
- [x] Auto-tag with child entities

### Feature 4: Calendar Automation

**Auto-create calendar events from emails:**

**Example:**
```
Email: "Emma's dentist appointment is confirmed for Jan 22 at 3pm at
Södermalm Dental Clinic, Götgatan 45."

Odin extracts:
- Child: Emma
- Type: Dentist appointment
- Date: Jan 22, 2026
- Time: 3pm
- Location: Södermalm Dental Clinic, Götgatan 45
- Duration: 1 hour (default for dentist)

Auto-creates:
- Calendar event
- Adds to Emma's timeline
- Checks for conflicts
- Sets reminders (1 day before, 1 hour before)
- Files email under Emma → Healthcare → Dental
```

**Implementation:**
```python
class CalendarAutomation:
    """Auto-create calendar events from emails."""

    async def process_email_for_events(
        self,
        email: Email
    ) -> List[CalendarEvent]:
        """Extract and create calendar events from email."""

        # 1. Extract event information using LLM
        events = await self.extract_events(email.body)

        created_events = []

        for event_data in events:
            # 2. Identify which child (if any)
            child = await self.entity_recognizer.extract_child_entities(
                text=email.body,
                user_id=email.user_id
            )

            # 3. Check for conflicts
            conflicts = await self.check_calendar_conflicts(
                date=event_data.date,
                time=event_data.time,
                user_id=email.user_id
            )

            if conflicts:
                # Alert user
                await self.alert_conflict(event_data, conflicts)

            # 4. Create calendar event
            event = await self.create_calendar_event(
                title=event_data.title,
                date=event_data.date,
                time=event_data.time,
                location=event_data.location,
                child_id=child.id if child else None,
                source_email_id=email.id
            )

            # 5. Set reminders
            await self.set_reminders(
                event_id=event.id,
                reminders=[
                    {"type": "notification", "time": "1 day before"},
                    {"type": "notification", "time": "1 hour before"}
                ]
            )

            # 6. Tag email
            await self.entity_tagger.tag(
                entity_type="email",
                entity_id=email.id,
                child_id=child.id,
                category="appointment"
            )

            created_events.append(event)

        return created_events
```

**Requirements:**
- [x] LLM-based event extraction
- [x] Date/time parsing
- [x] Location extraction
- [x] Child entity linking
- [x] Conflict detection
- [x] Auto-create calendar events
- [x] Set reminders
- [x] Link back to source email

### Feature 5: Privacy Controls

**Foster children need elevated privacy:**

**Privacy Levels:**
- **Level 1 (Normal):** Biological children
  - Standard encryption
  - Normal access logs
  - Shared with partner

- **Level 2 (Elevated):** Foster children
  - Enhanced encryption at rest
  - Detailed audit logs
  - Access restrictions
  - Case worker communications isolated
  - Transition documentation separate

**Implementation:**
```python
class PrivacyManager:
    """Manage privacy controls for sensitive data."""

    async def store_child_data(
        self,
        child_id: str,
        data: Dict,
        data_type: str
    ):
        """Store data with appropriate privacy controls."""

        child = await self.get_child(child_id)

        if child.privacy_level == 2:
            # Elevated privacy for foster children
            # 1. Encrypt sensitive fields
            encrypted_data = await self.encrypt(data, child.encryption_key)

            # 2. Log access
            await self.audit_log.write({
                "action": "store_data",
                "child_id": child_id,
                "data_type": data_type,
                "timestamp": datetime.now(),
                "user_id": self.current_user_id
            })

            # 3. Store with privacy flag
            await self.db.child_data.insert({
                "child_id": child_id,
                "data": encrypted_data,
                "privacy_level": 2,
                "requires_audit": True
            })
        else:
            # Normal privacy
            await self.db.child_data.insert({
                "child_id": child_id,
                "data": data,
                "privacy_level": 1
            })

    async def access_child_data(
        self,
        child_id: str,
        requester_id: str
    ) -> Dict:
        """Access child data with privacy checks."""

        child = await self.get_child(child_id)

        # Check access permissions
        if child.privacy_level == 2:
            # Verify requester has permission
            has_access = await self.check_permission(
                requester_id=requester_id,
                child_id=child_id
            )

            if not has_access:
                raise PermissionError(f"No access to child {child_id}")

            # Log access
            await self.audit_log.write({
                "action": "access_data",
                "child_id": child_id,
                "requester_id": requester_id,
                "timestamp": datetime.now()
            })

        # Retrieve and decrypt if needed
        data = await self.db.child_data.get(child_id)

        if child.privacy_level == 2:
            data = await self.decrypt(data, child.encryption_key)

        return data
```

**Requirements:**
- [x] Privacy level per child
- [x] Encryption at rest for Level 2
- [x] Audit logging for Level 2 access
- [x] Access control checks
- [x] Separate storage for case documents
- [x] GDPR compliance

### Feature 6: Family-Aware Search

**Search across all child-related information:**

```
Query: "Show me everything about Emma's dental issues"

Odin searches:
- Emails mentioning Emma + dental/teeth/dentist
- Calendar events (past and future dental appointments)
- School messages (if she missed school for dental)
- Documents (dental records, X-rays, insurance claims)
- Conversation history (previous discussions about Emma's teeth)
- Tasks (schedule next checkup, order new toothbrush)

Returns unified view:
"Found 15 items about Emma's dental issues:

**Timeline:**
- Dec 2025: Cavity discovered (Dr. Andersson)
- Jan 2026: Filling appointment scheduled
- Jan 22 2026: Upcoming appointment at 3pm

**Emails (5):**
- Appointment confirmation
- Insurance pre-approval
- School notification of absence
- Reminder from clinic
- Follow-up instructions

**Documents (3):**
- Dental X-rays
- Treatment plan
- Insurance claim form

**Upcoming:**
- Jan 22: Appointment
- Jul 2026: Next checkup (6 months)
```

**Implementation:**
```python
class FamilySearch:
    """Search across all family-related information."""

    async def search_child_topic(
        self,
        child_name: str,
        topic: str,
        user_id: str
    ) -> SearchResults:
        """Search for all information about a child and topic."""

        # 1. Get child
        child = await self.get_child_by_name(child_name, user_id)

        # 2. Generate search embedding
        query = f"{child.name} {topic}"
        embedding = await self.generate_embedding(query)

        # 3. Search across all sources in parallel
        results = await asyncio.gather(
            self.search_emails(child.id, embedding),
            self.search_calendar(child.id, topic),
            self.search_documents(child.id, embedding),
            self.search_school_data(child.id, topic),
            self.search_conversations(child.id, embedding),
            self.search_tasks(child.id, topic)
        )

        # 4. Aggregate and rank
        aggregated = self.aggregate_results(results)

        # 5. Create timeline
        timeline = self.create_timeline(aggregated)

        return SearchResults(
            child=child,
            topic=topic,
            timeline=timeline,
            results=aggregated
        )
```

**Requirements:**
- [x] Multi-source search (emails, calendar, docs, school, conversations)
- [x] Child entity filtering
- [x] Topic extraction and matching
- [x] Timeline generation
- [x] Result aggregation
- [x] Unified display

---

## Technical Implementation

### Database Schema

```sql
-- Children table
CREATE TABLE children (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    nicknames TEXT[],
    birth_date DATE,
    child_type TEXT CHECK (child_type IN ('biological', 'foster')),
    privacy_level INTEGER DEFAULT 1,
    embedding vector(384),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Child entities (relationships)
CREATE TABLE child_entities (
    id SERIAL PRIMARY KEY,
    child_id TEXT REFERENCES children(id),
    entity_type TEXT NOT NULL,  -- 'email', 'task', 'calendar_event', 'document', 'school_data'
    entity_id TEXT NOT NULL,
    confidence FLOAT,  -- Entity recognition confidence
    tagged_at TIMESTAMP DEFAULT NOW(),
    tagged_by TEXT  -- 'automatic' or user_id
);

-- School data
CREATE TABLE school_data (
    id SERIAL PRIMARY KEY,
    child_id TEXT REFERENCES children(id),
    type TEXT NOT NULL,  -- 'news', 'message', 'note', 'schedule'
    title TEXT,
    content TEXT,
    embedding vector(384),
    source_url TEXT,
    published_at TIMESTAMP,
    synced_at TIMESTAMP DEFAULT NOW()
);

-- Audit log (for privacy level 2)
CREATE TABLE privacy_audit_log (
    id SERIAL PRIMARY KEY,
    child_id TEXT REFERENCES children(id),
    action TEXT NOT NULL,
    requester_id TEXT,
    data_type TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Indexes
CREATE INDEX idx_children_user ON children(user_id);
CREATE INDEX idx_children_embedding ON children USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_child_entities_child ON child_entities(child_id, entity_type);
CREATE INDEX idx_child_entities_entity ON child_entities(entity_type, entity_id);
CREATE INDEX idx_school_data_child ON school_data(child_id, published_at DESC);
CREATE INDEX idx_school_data_embedding ON school_data USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_privacy_audit_child ON privacy_audit_log(child_id, timestamp DESC);
```

### Services

```python
# services/family_service.py
class FamilyService:
    """Main service for family context management."""

    def __init__(self):
        self.entity_recognizer = EntityRecognizer()
        self.calendar_automation = CalendarAutomation()
        self.privacy_manager = PrivacyManager()
        self.school_service = SchoolService()
        self.family_search = FamilySearch()

    async def process_new_email(self, email: Email):
        """Process email for family context."""
        # 1. Recognize child entities
        children = await self.entity_recognizer.extract_child_entities(
            text=email.body,
            user_id=email.user_id
        )

        # 2. Tag email with children
        for child in children:
            await self.tag_entity(
                entity_type="email",
                entity_id=email.id,
                child_id=child.child_id,
                confidence=child.confidence
            )

        # 3. Check for calendar events
        events = await self.calendar_automation.process_email_for_events(email)

        # 4. Update child profiles if new information
        await self.update_child_profiles_from_email(email, children)
```

---

## Testing Strategy

### Unit Tests
- Child profile CRUD operations
- Entity recognition accuracy
- Calendar event extraction
- Privacy level enforcement

### Integration Tests
- Quiculum MCP connection
- End-to-end email → entity tagging → search
- Calendar automation flow
- Multi-child family scenarios

### Privacy Tests
- Verify Level 2 encryption
- Audit log completeness
- Access control enforcement
- GDPR compliance

### User Acceptance Tests
- Create child profiles
- Process 50+ family emails
- Verify auto-tagging accuracy (target: 95%+)
- Test calendar automation
- Search for child-specific topics

---

## Success Criteria

- [x] All 5 children profiled with complete data
- [x] Entity recognition accuracy: 95%+
- [x] Quiculum data syncing automatically (daily)
- [x] Calendar events auto-created from emails: 90%+ success
- [x] Privacy audit logs working for Level 2 children
- [x] Family-aware search returns relevant results in <2s
- [x] User reports: "Odin keeps me organized with kids"

---

## Dependencies

**Requires:**
- Epic 001: Database and models set up
- Epic 002: Email ingestion working
- Epic 003: AI processing pipeline (LLM access)

**Enables:**
- Epic 009: Time Management (needs family schedules)
- Epic 010: Voice Interface (voice queries about kids)

---

## Timeline

**Week 1:**
- Child profiles and CRUD API
- Database schema
- Basic entity recognition

**Week 2:**
- Quiculum MCP conversion
- School data sync
- Entity tagging automation

**Week 3:**
- Calendar automation
- Privacy controls
- Family search

**Week 4:**
- Testing and refinement
- Privacy audit
- Documentation

---

## Future Enhancements (Post-MVP)

- **Growth Tracking:** Height, weight, milestones
- **Health Records:** Vaccinations, medications, allergies
- **Education Tracking:** Grades, homework, projects
- **Social Relationships:** Friends, playdates, birthday tracking
- **Activity Management:** Sports, music lessons, schedules
- **Multi-Language:** Swedish + English for kids
- **Kid Dashboards:** Age-appropriate views for older kids

---

**Epic Owner:** Samuel
**Reviewers:** Supervisor
**Status:** Ready for Implementation
**Start Date:** March 1, 2026 (after Phase 1 complete)
