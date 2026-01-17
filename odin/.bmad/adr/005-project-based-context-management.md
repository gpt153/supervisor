# ADR-005: Project-Based Context Management System

**Status:** Accepted
**Date:** 2026-01-15
**Deciders:** Samuel, Supervisor
**Context:** Need long-term conversational memory with seamless context switching

---

## Context and Problem Statement

Users want to have extended conversations with Odin about different topics/projects, and seamlessly switch between them:

**Example scenario:**
```
User: "Help me draft email to marina about houseboat"
[Odin helps with email]

User: "But now I want to talk about the houseboat project"
[Odin should switch to houseboat project context]
[Load all previous conversations about houseboat]
[Load related files, emails, tasks]
[Remember key decisions]
```

**Key requirements:**
1. **Long-term memory:** Conversations span weeks/months
2. **Context switching:** Seamlessly switch between topics
3. **Contextual awareness:** Odin remembers what you discussed
4. **Entity linking:** Connect related files, emails, tasks to projects
5. **Natural interaction:** "Back to the email" or "Now let's talk about X"

**Question:** How should we organize and retrieve conversational context?

---

## Decision

**We will implement a project-based context management system where all information is organized by projects/topics, each with persistent conversational memory.**

### Core Concepts

**1. Project = Persistent Context Container**
- A project is any ongoing topic/initiative
- Examples: "Houseboat Renovation", "New App Development", "Emma's School Issues"
- Each project maintains:
  - Conversation history
  - Related entities (files, emails, tasks, people)
  - Key decisions
  - Current status and next steps

**2. Context Switching = Project Transition**
- User can switch between projects naturally
- "Let's talk about X" → load project X's context
- "Back to previous topic" → return to last project
- Automatic detection via NLP

**3. Everything Links to Projects**
- Files → tagged with project
- Emails → associated with project
- Tasks → belong to project
- Documents → filed under project

---

## Data Model

### Projects Table

```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY,  -- "houseboat-renovation-2026"
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,  -- "Houseboat Renovation"
    description TEXT,

    -- Vector embedding for semantic search
    embedding vector(384),

    -- Auto-generated summary
    summary TEXT,
    key_decisions JSONB,  -- Important decisions made
    next_steps TEXT[],

    -- Metadata
    status TEXT,  -- "active", "archived", "completed"
    priority INTEGER,
    tags TEXT[],

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP,

    -- Indexes
    CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'completed'))
);

CREATE INDEX idx_project_user ON projects(user_id);
CREATE INDEX idx_project_embedding ON projects USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_project_last_active ON projects(last_active DESC);
```

### Conversation History

```sql
CREATE TABLE conversation_history (
    id SERIAL PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    user_id TEXT NOT NULL,

    -- Conversation turn
    user_message TEXT NOT NULL,
    odin_response TEXT NOT NULL,

    -- Vector embedding for similarity search
    embedding vector(384),

    -- Context used to generate response
    context_used JSONB,  -- What files, emails, tasks were referenced

    -- Actions taken
    actions JSONB,  -- ["created_task", "sent_email", "saved_file"]

    -- Metadata
    timestamp TIMESTAMP DEFAULT NOW(),

    -- Indexes
    CONSTRAINT valid_project CHECK (project_id IS NOT NULL OR user_id IS NOT NULL)
);

CREATE INDEX idx_conversation_project ON conversation_history(project_id, timestamp DESC);
CREATE INDEX idx_conversation_embedding ON conversation_history USING ivfflat (embedding vector_cosine_ops);
```

### Project Entities (Links)

```sql
CREATE TABLE project_entities (
    id SERIAL PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),

    -- Entity reference
    entity_type TEXT NOT NULL,  -- "file", "email", "task", "person", "document"
    entity_id TEXT NOT NULL,

    -- Relevance
    relevance_score FLOAT,  -- 0.0 to 1.0

    -- Metadata
    added_at TIMESTAMP DEFAULT NOW(),
    added_by TEXT,  -- "user" or "automatic"

    CONSTRAINT valid_entity_type CHECK (entity_type IN ('file', 'email', 'task', 'person', 'document', 'calendar_event'))
);

CREATE INDEX idx_project_entities ON project_entities(project_id, entity_type);
CREATE INDEX idx_entity_reference ON project_entities(entity_type, entity_id);
```

### Session State (Current Context)

```sql
CREATE TABLE user_sessions (
    user_id TEXT PRIMARY KEY,
    current_project_id TEXT REFERENCES projects(id),
    previous_project_id TEXT REFERENCES projects(id),

    -- Project stack for "go back" functionality
    project_stack TEXT[],

    -- Last interaction
    last_activity TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation

### Context Manager Service

```python
# services/context_manager.py
class ContextManager:
    """Manage project-based conversational context."""

    async def process_message(
        self,
        user_id: str,
        message: str
    ) -> Response:
        """Process user message with context awareness."""

        # 1. Get current session
        session = await self.get_session(user_id)
        current_project = session.current_project_id

        # 2. Detect context switch
        switch_detected, new_project = await self.detect_context_switch(message)

        if switch_detected:
            # Switch to new project
            current_project = await self.switch_project(
                user_id=user_id,
                new_project_name=new_project,
                previous_project=current_project
            )

            # Load project context
            context = await self.load_project_context(current_project)

            # Generate context switch response
            response = await self.generate_switch_response(
                project=current_project,
                context=context
            )

        else:
            # Continue in current project
            context = await self.load_relevant_context(
                project_id=current_project,
                query=message
            )

            response = await self.generate_response(
                message=message,
                context=context,
                project_id=current_project
            )

        # 3. Save conversation turn
        await self.save_conversation_turn(
            project_id=current_project,
            user_message=message,
            odin_response=response.text,
            context_used=context
        )

        return response

    async def detect_context_switch(
        self,
        message: str
    ) -> Tuple[bool, Optional[str]]:
        """Detect if user is switching project context."""

        # Patterns that indicate context switch
        switch_patterns = [
            "let's talk about",
            "switch to",
            "now i want to discuss",
            "tell me about",
            "show me",
            "back to",
            "return to"
        ]

        message_lower = message.lower()

        for pattern in switch_patterns:
            if pattern in message_lower:
                # Extract project name using NLP
                project_name = await self.extract_project_name(message)
                return True, project_name

        return False, None

    async def switch_project(
        self,
        user_id: str,
        new_project_name: str,
        previous_project: Optional[str]
    ) -> Project:
        """Switch to new project context."""

        # 1. Find or create project
        project = await self.find_project(new_project_name, user_id)

        if not project:
            # Auto-create project
            project = await self.create_project(
                name=new_project_name,
                user_id=user_id
            )

        # 2. Update session
        await self.update_session(
            user_id=user_id,
            current_project_id=project.id,
            previous_project_id=previous_project
        )

        # 3. Update project last_active
        await self.touch_project(project.id)

        return project

    async def load_project_context(
        self,
        project_id: str
    ) -> Dict:
        """Load full context for a project."""

        project = await self.get_project(project_id)

        context = {
            "project": project,

            # Recent conversations (last 10 turns)
            "recent_conversations": await self.get_recent_conversations(
                project_id=project_id,
                limit=10
            ),

            # Related entities
            "files": await self.get_project_files(project_id),
            "emails": await self.get_project_emails(project_id),
            "tasks": await self.get_project_tasks(project_id),
            "people": await self.get_project_people(project_id),

            # Summary
            "summary": project.summary,
            "key_decisions": project.key_decisions,
            "next_steps": project.next_steps
        }

        return context

    async def load_relevant_context(
        self,
        project_id: Optional[str],
        query: str
    ) -> Dict:
        """Load relevant context for query within project."""

        context = {}

        if project_id:
            project = await self.get_project(project_id)
            context["project"] = project

            # Recent conversations (last 5)
            context["recent_conversations"] = await self.get_recent_conversations(
                project_id=project_id,
                limit=5
            )

        # Semantic search within project (if project exists)
        # Or global search (if no project)
        context["search_results"] = await self.semantic_search_within_project(
            query=query,
            project_id=project_id,
            limit=5
        )

        # Also load user's general context (schedule, tasks, etc.)
        context["user_context"] = await self.get_user_context()

        return context

    async def save_conversation_turn(
        self,
        project_id: Optional[str],
        user_message: str,
        odin_response: str,
        context_used: Dict
    ):
        """Save conversation turn to history."""

        # Generate embedding
        embedding = await self.generate_embedding(
            f"{user_message} {odin_response}"
        )

        await self.db.conversation_history.insert({
            "project_id": project_id,
            "user_message": user_message,
            "odin_response": odin_response,
            "embedding": embedding,
            "context_used": context_used,
            "timestamp": datetime.now()
        })

        # Update project summary periodically
        if project_id:
            turn_count = await self.get_conversation_turn_count(project_id)
            if turn_count % 10 == 0:
                # Every 10 turns, regenerate summary
                await self.regenerate_project_summary(project_id)
```

### Automatic Project Creation

```python
async def auto_create_project_from_context(
    self,
    user_message: str,
    user_id: str
) -> Optional[Project]:
    """Automatically create project if user starts discussing new topic."""

    # Use LLM to determine if this is a new project
    prompt = f"""
    User said: "{user_message}"

    Is the user starting to discuss a new project/topic that would benefit
    from having persistent context?

    Examples of projects: "Houseboat renovation", "New app development",
    "Emma's school issues", "Planning vacation to Spain"

    If yes, suggest a project name. If no, return null.
    """

    response = await self.llm.generate(prompt)

    if response.is_project:
        project = await self.create_project(
            name=response.project_name,
            user_id=user_id,
            description=response.description
        )
        return project

    return None
```

---

## Example Usage

### Scenario 1: Context Switching

```
User: "Help me write an email to the marina"
Odin: [In general context, no active project]
      "I'll help you draft an email to the marina..."

User: "Actually, let's talk about the houseboat project"
Odin: [Detects context switch]
      [Searches for "houseboat" project]
      [Loads project context]

      "Switching to Houseboat Renovation project.

      Last conversation: 3 days ago, we discussed the electrical system.
      You decided to use marine-grade wiring (€3,500 quote).

      Current status:
      - Plumbing: 80% complete
      - Electrical: Materials ordered, waiting for delivery
      - Interior: Planning phase

      You need to:
      1. Order marine cable (50m from Biltema, 749 SEK)
      2. Schedule electrician visit
      3. Finalize interior layout

      What would you like to work on?"

User: "Let's order the cable"
Odin: [Still in houseboat project context]
      [Searches for "marine cable" in conversation history]

      "Found it! You were looking at marine cable from Biltema,
      50 meters for 749 SEK. Should I open their website and
      add it to cart?"
```

### Scenario 2: Long-Term Memory

```
Week 1:
User: "I'm thinking of starting a coffee shop"
Odin: [Creates project "Coffee Shop Business"]
      "That's exciting! Let's plan your coffee shop..."
[10-minute conversation about location, concept, budget]

Week 2:
User: "Let's work on the coffee shop"
Odin: [Loads Coffee Shop Business project]
      "Welcome back to your coffee shop project!

      Last time (7 days ago), we discussed:
      - Location: Södermalm neighborhood
      - Concept: Specialty coffee + coworking space
      - Budget: 500,000 SEK initial investment

      You wanted to research:
      1. Commercial space rental costs (not done yet)
      2. Coffee supplier options (not done yet)
      3. Business license requirements (not done yet)

      Where should we start today?"

Week 4:
User: "What did we decide about the coffee shop location?"
Odin: [Semantic search in project history]
      "In our conversation on Jan 8th, you chose Södermalm
      neighborhood because:
      1. High foot traffic
      2. Young professional demographic
      3. Rent more affordable than Östermalm
      4. Close to subway station

      You were considering two specific streets:
      - Götgatan (higher rent but more traffic)
      - Bondegatan (lower rent, quieter)"
```

### Scenario 3: Cross-Project Reference

```
User: "Use the design style from my app project for the coffee shop logo"
Odin: [Currently in Coffee Shop project]
      [Searches for "app project"]
      [Finds "Task Management App" project]
      [Loads design files from that project]

      "Loading design references from Task Management App project...

      Found:
      - Color scheme: Teal (#2dd4bf) + Navy (#1e3a8a)
      - Typography: Inter font family
      - Style: Minimalist, modern, clean
      - Logo: Simple geometric shapes

      I'll use these guidelines for your coffee shop logo.
      Should I generate options with this style?"
```

---

## Consequences

### Positive

✅ **Natural Conversation**
- Users can switch topics naturally
- "Let's talk about X" just works
- No need to manage chat threads manually

✅ **Long-Term Memory**
- Conversations span weeks/months
- Odin remembers what you discussed
- Can reference decisions made earlier

✅ **Better Context**
- Odin knows what project you're in
- Loads relevant files, emails, tasks automatically
- Smarter responses because of context

✅ **Organization**
- Everything auto-organized by project
- Easy to find related information
- Clear project structure

✅ **Scalability**
- Can have unlimited projects
- Each project is independent
- No context length limitations

### Negative

⚠️ **Complexity**
- More complex than simple chat history
- Need to manage project lifecycles
- Potential for confusion if projects not clear

⚠️ **Storage**
- More database storage needed
- Need to archive old projects
- Embeddings for all conversations

⚠️ **Ambiguity**
- User says "it" - which project?
- Need good context detection
- Sometimes unclear what project user is in

### Mitigation

**Complexity:**
- Start simple: auto-create projects
- User can manually manage if they want
- Good defaults (most recent active project)

**Storage:**
- Archive inactive projects (>3 months)
- Compress old conversation history
- Keep embeddings only for recent conversations

**Ambiguity:**
- Show current project in UI
- "You're in: Houseboat Renovation"
- Ask for clarification if unclear
- Fall back to semantic search across all projects

---

## Alternatives Considered

### Alternative 1: Chronological Chat History (No Projects)
**How it works:** Single conversation thread, chronological order

**Pros:** Simple, familiar (like ChatGPT)
**Cons:**
- No persistent memory beyond context window
- Can't switch topics without losing context
- Hard to find old conversations

**Rejected:** Doesn't meet requirement for long-term, multi-topic memory

### Alternative 2: Thread-Based (Like Slack)
**How it works:** User manually creates threads for topics

**Pros:** Familiar model, user controls
**Cons:**
- Manual thread management burden
- Still loses context when thread is cold
- Doesn't auto-link related entities

**Rejected:** Too manual, doesn't provide enough intelligence

### Alternative 3: Tag-Based Organization
**How it works:** Tag conversations, no project concept

**Pros:** Flexible, user-defined
**Cons:**
- Still chronological within tags
- No persistent project state
- Doesn't support context switching

**Rejected:** Not structured enough for complex projects

---

## Future Enhancements

### Phase 1: Basic Projects (Phase 4)
- Manual project creation
- Context switching
- Conversation history per project

### Phase 2: Auto-Organization (Phase 5)
- Automatic project creation
- Auto-linking of entities
- Smart project suggestions

### Phase 3: Project Intelligence (Phase 6+)
- Project health monitoring
- Suggest next steps
- Cross-project insights
- Project templates

---

## References

- [Context-Dependent Memory in AI Systems](https://arxiv.org/abs/2304.13010)
- [Long-Term Conversation Management](https://aclanthology.org/2022.findings-emnlp.123/)
- RAG (Retrieval-Augmented Generation) patterns

---

## Status

**Accepted** - Will be implemented in Phase 4

**Dependencies:**
- Phase 1 (MVP) complete
- Vector search working
- Conversation history stored

**Next Steps:**
1. Design database schema
2. Implement Context Manager service
3. Build project detection NLP
4. Test with real conversations
5. Optimize context loading

---

**Author:** Supervisor + Samuel
**Reviewers:** Samuel
**Last Updated:** 2026-01-15
