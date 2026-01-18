# Epic: AI Personas - Learn from Thought Leaders

**Epic ID:** tool-006-ai-personas
**Created:** 2026-01-18
**Status:** Planned (Not in Active Build)
**Complexity Level:** 5 (Highest - Multi-persona RAG + Pydantic AI + Complex scraping)
**Category:** RAG / AI Agents / Knowledge Synthesis / Personality Modeling

---

**⚠️ IMPORTANT:** This is a **RAG + Pydantic AI tool epic** with advanced features. It will NOT be built until:
1. You move this file to `.bmad/epics/` and renumber it
2. You create a GitHub issue in gpt153/odin
3. You tell the supervisor to build it

---

## Project Context

- **Project:** Odin
- **Repository:** https://github.com/gpt153/odin (MCP server in separate container)
- **Tech Stack:** Python 3.11+, FastAPI, PostgreSQL + pgvector, Docker, MCP SDK, Pydantic AI, Whisper (transcription)
- **RAG Framework:** MCP Server + Pydantic AI Agents (hybrid architecture)
- **Related Projects:**
  - Integrates with: Health-Agent (expert health advice), Odin (conversational interface)
  - Could integrate with: Any future project needing expert consultation

---

## Business Context

### Problem Statement

**The knowledge of brilliant minds is scattered and inaccessible:**

**Current Pain Points:**
1. **Fragmented Content:** Andrew Huberman has 200+ podcast episodes, guest appearances, Substack posts - impossible to synthesize
2. **Time Constraint:** Can't watch 500 hours of content to learn someone's protocols/philosophy
3. **No Dialogue:** Can't ask follow-up questions to YouTube videos
4. **Context Loss:** Hard to remember what expert said about specific topic 6 months ago
5. **No Comparison:** Want to compare Huberman vs Attia's views on sleep, but they're on different platforms
6. **Static Knowledge:** New content published daily, can't keep up

**Example Use Case:**
- User has health question about sleep optimization
- Wants advice from Andrew Huberman (neuroscientist, 200+ episodes)
- Needs to know his current protocol (might have evolved from early episodes)
- Wants to compare with Peter Attia's perspective
- Needs citations (which episode, timestamp)

**Current Reality:**
- Spend hours searching YouTube transcripts
- Take manual notes
- Hope their views haven't changed
- No ability to ask clarifying questions

### User Value

**JARVIS-like Expert Consultation:**

```
User: "Create a persona of Andrew Huberman"

Odin → Persona MCP:
  - Searches for Andrew Huberman content
  - Finds: YouTube channel (Huberman Lab), guest appearances, Substack, Instagram
  - Scrapes last 100 episodes + all written content
  - Analyzes communication style (scientific, protocol-focused, cites timestamps)
  - Creates Pydantic AI agent with personality
  - Indexes 5,234 documents into vector DB
  - Schedules weekly updates for new content
  - Returns: "Andrew Huberman persona ready"

---

User: "Huberman, what's your latest sleep protocol?"

Huberman AI:
  "My current sleep protocol has 6 core elements:

  1. Morning sunlight (10-30 min within 1 hour of waking)
     → Triggers cortisol pulse, sets circadian rhythm
     📹 Source: Huberman Lab #2 - Master Your Sleep (00:15:23)

  2. Delay caffeine 90-120 min after waking
     → Prevents afternoon crash by clearing adenosine
     📹 Source: Huberman Lab #47 - Caffeine (00:42:10)

  3. Afternoon light exposure (10 min around sunset)
     → Protects against evening light disruption
     📹 Source: Light & Health Toolkit (Mar 2024)

  ... [4-6 continued with citations]

  ⚠️ Note: My recommendations evolved over time:
     - 2021: Recommended 2-5 min morning light
     - 2024: Now suggest 10-30 min (intensity-dependent)

  Confidence: 98% (mentioned across 15+ episodes, consistent protocol)"

---

User: "Have Huberman and Attia discuss fasting for longevity"

System creates multi-persona conversation:

Huberman AI:
  "From a neuroscience perspective, fasting triggers BDNF production
   and autophagy. The data shows 12-16 hour fasting windows optimize
   metabolic switching without compromising muscle..."
   📹 Source: Huberman Lab #41 - Fasting (00:28:15)

Attia AI:
  "I agree on the autophagy benefits, but I'd add that the timing
   matters more than people think. If you're training hard, fasted
   workouts might compromise performance. I prefer time-restricted
   eating with strategic protein timing..."
   📄 Source: The Drive #135 - Fasting Deep Dive

Huberman AI (response):
  "That's a great point about protein timing. I've shifted my view
   on this - I now recommend post-workout nutrition within 1 hour
   for muscle protein synthesis, even during fasting windows..."
   📹 Source: Huberman Lab #112 - Optimize Muscle (00:35:42)

[Continues for 3-4 rounds]

System Summary:
  "Agreement: Fasting has clear autophagy/longevity benefits
   Disagreement: Workout timing - Huberman says fasted OK, Attia says fed better
   Your Action: Try both approaches, track performance"
```

**Without AI Personas:**
- User watches 20+ hours of content
- Takes fragmented notes
- Misses updated protocols
- Can't synthesize different expert views
- No ability to ask follow-up questions

### Success Metrics

- **Persona Creation:** <30 min to fully index 100+ hours of content
- **Query Accuracy:** >90% of responses match expert's actual views
- **Citation Precision:** >95% of citations link to correct source + timestamp
- **User Satisfaction:** "Got actionable advice" >85%
- **Content Freshness:** New content indexed within 7 days of publication
- **Multi-Persona Coherence:** Debates reflect each expert's true positions >80%
- **Health-Agent Integration:** Personas accessible via API <500ms latency

---

## RAG Architecture Decision

**Selected Approach:** **Option C - Hybrid Architecture (Recommended)**

**Why Hybrid:**
- **Efficiency:** Single MCP container, shared infrastructure (not N containers for N personas)
- **On-Demand Loading:** Load Pydantic AI agents only when queried (not all in memory)
- **Scalability:** Can add 100s of personas without deploying new containers
- **Flexibility:** Easy integration with health-agent and future projects
- **Cost-Effective:** One database, one scraping service, selective persona activation

**Architecture:**
```
User Query → Odin (or Health-Agent) → Persona Manager MCP
                                          ↓
                                   Persona Registry (DB table)
                                          ↓
                        Is persona loaded in memory? No → Load Pydantic AI agent
                                          ↓
                           Pydantic AI Agent (personality + RAG tools)
                                          ↓
                            Vector DB (persona_id partitioning)
                                          ↓
                                 Hybrid Search Results
                                          ↓
                     Response (with citations, confidence score)
```

**MCP Container Structure:**
```
ai-personas-mcp:
  ├── PostgreSQL + pgvector (shared DB, persona_id partitioning)
  ├── Scraping Service (per-persona schedules)
  ├── Pydantic AI Agents (loaded on-demand)
  ├── Persona Manager (create, query, list, update)
  └── MCP Tools (5 core tools exposed)
```

**Key Design Decisions:**

1. **Single DB with Partitioning:**
   - All persona content in one `persona_content_vector` table
   - `persona_id` field for strict partitioning
   - No cross-persona queries (except deliberate multi-persona mode)

2. **On-Demand Agent Loading:**
   ```python
   # Don't load all personas at startup (memory bloat)
   # Load only when queried
   class PersonaManager:
       loaded_personas: Dict[str, PydanticAgent] = {}  # In-memory cache

       async def get_persona(self, persona_id: str) -> PydanticAgent:
           if persona_id not in self.loaded_personas:
               # Load from DB: personality profile, system prompt
               persona_data = await db.fetch_persona(persona_id)
               agent = create_pydantic_agent(persona_data)
               self.loaded_personas[persona_id] = agent
           return self.loaded_personas[persona_id]
   ```

3. **Pydantic AI for Personality:**
   - Each persona = Pydantic AI agent with:
     - Custom system prompt (mimics communication style)
     - RAG tools (search their content)
     - Personality traits (extracted during persona creation)
     - Citation formatting rules

4. **Per-Persona Scraping Schedules:**
   - Andrew Huberman: Weekly (active weekly podcast)
   - Bret Weinstein: Bi-weekly (less frequent)
   - Historical figures: Never (static content)

---

## Core Features (User-Selected Priorities)

### Feature 1: Auto-Persona Creation ⭐ CRITICAL

**User Experience:**
```
User → Odin: "Create a persona of Bret Weinstein"

Odin → Persona MCP: create_persona("Bret Weinstein")

MCP Process:
  1️⃣ Content Discovery (2-5 min):
     - Search YouTube: "Bret Weinstein" → Find official channels
     - Search podcast platforms: "Bret Weinstein guest"
     - Search Substack: "Bret Weinstein author"
     - Search academic: Google Scholar for papers
     - Result: 3 YouTube channels, 150 podcast appearances, 1 Substack

  2️⃣ Initial Scraping (10-20 min):
     - YouTube: Last 100 videos from DarkHorse Podcast
     - YouTube: Top 50 guest appearances (by views)
     - Substack: All posts
     - Twitter: Last 500 tweets/threads
     - Books: Summaries from public reviews
     - Total: ~5,000 documents

  3️⃣ Personality Analysis (2-5 min):
     - Extract communication patterns:
       * Uses evolutionary biology analogies
       * Frequently says "Here's the thing..."
       * Explains complex ideas through narrative
       * Cautious about strong claims ("I suspect...", "It seems...")
     - Generate system prompt for Pydantic agent
     - Identify key topics: evolutionary biology, censorship, COVID, academia

  4️⃣ Embedding & Indexing (5-10 min):
     - Chunk content (semantic boundaries)
     - Generate embeddings (OpenAI text-embedding-3-small)
     - Store in vector DB with persona_id='bret-weinstein'
     - Create timeline index (track statement dates)

  5️⃣ Pydantic Agent Creation (1 min):
     - Define agent with custom system prompt
     - Attach RAG tools (search, cite, timeline)
     - Set personality traits
     - Configure citation format

  6️⃣ Schedule Updates (instant):
     - Set scraping schedule: Weekly (active content creator)
     - Auto-check for new DarkHorse episodes, Substack posts
     - Incremental indexing (only new content)

✅ Return to User:
  "Bret Weinstein persona ready!
   - 5,234 documents indexed
   - 142 hours of content
   - Sources: YouTube (3 channels), Substack, Twitter
   - Updates: Weekly (checks for new content)
   - Personality: Evolutionary biologist, narrative explainer
   - Ready to answer questions"
```

**Implementation:**
```python
@app.tool()
async def create_persona(
    name: str,
    sources: Optional[List[str]] = None,  # Optional: manual source URLs
    scrape_depth: str = "standard"  # "quick" | "standard" | "comprehensive"
) -> dict:
    """
    Auto-create AI persona from public content.

    Args:
        name: Person's full name (e.g., "Andrew Huberman")
        sources: Optional list of URLs to scrape (if omitted, auto-discover)
        scrape_depth:
          - "quick": Last 20 videos/posts (~2 hours content)
          - "standard": Last 100 videos/posts (~20 hours)
          - "comprehensive": All available content (may take hours)

    Returns:
        {
            "persona_id": "andrew-huberman",
            "status": "ready",
            "content_stats": {
                "documents": 5234,
                "hours_of_content": 142,
                "sources": ["YouTube", "Substack", "Twitter"],
                "date_range": "2020-01-01 to 2026-01-18"
            },
            "personality": {
                "communication_style": "Scientific, protocol-focused, uses timestamps",
                "key_topics": ["neuroscience", "sleep", "performance"],
                "signature_phrases": ["So here's the deal", "The science says"]
            },
            "update_schedule": "weekly"
        }
    """
```

### Feature 2: Citation Mode (Transparency) ⭐ CRITICAL

**Every response includes exact sources:**

```python
# Pydantic AI agent with citation tool
class PersonaAgent:
    @agent.tool()
    async def search_knowledge(
        self,
        query: str,
        top_k: int = 5
    ) -> List[ContentChunk]:
        """Search persona's content with citations"""
        results = await hybrid_search(
            query=query,
            persona_id=self.persona_id,
            k=top_k
        )

        # Each result includes citation metadata
        return [
            {
                "content": r.text,
                "source": {
                    "type": "youtube",  # or "substack", "podcast", "book"
                    "title": "Huberman Lab #2 - Master Your Sleep",
                    "url": "https://youtube.com/watch?v=...",
                    "timestamp": "00:15:23",
                    "date": "2021-01-10"
                },
                "similarity_score": 0.92
            }
            for r in results
        ]
```

**Citation Format Options:**
- **Inline:** "Morning sunlight (10-30 min) [Source: HL#2, 00:15:23]"
- **Footnote:** "Morning sunlight (10-30 min)¹" → ¹Huberman Lab #2 (00:15:23)
- **Rich:** Clickable links with thumbnails (if web UI)

### Feature 3: Multi-Persona Conversations (Debates) ⭐ UNIQUE

**Have two personas discuss a topic:**

```python
@app.tool()
async def multi_persona_conversation(
    persona_ids: List[str],  # ["huberman", "attia"]
    topic: str,               # "fasting for longevity"
    rounds: int = 3           # Number of back-and-forth exchanges
) -> dict:
    """
    Create a conversation between multiple personas.

    Process:
      1. Each persona generates initial response based on their content
      2. Personas respond to each other's points (iterative)
      3. System summarizes agreement/disagreement
      4. Returns full transcript + synthesis
    """

    conversation = []

    # Round 1: Initial responses
    for persona_id in persona_ids:
        agent = await get_persona(persona_id)
        response = await agent.run(
            f"What are your thoughts on {topic}? "
            f"Cite your sources and explain your reasoning."
        )
        conversation.append({
            "persona": persona_id,
            "round": 1,
            "message": response.content,
            "citations": response.citations
        })

    # Rounds 2-N: Responses to each other
    for round_num in range(2, rounds + 1):
        previous_messages = [c for c in conversation if c["round"] == round_num - 1]

        for persona_id in persona_ids:
            other_messages = [m for m in previous_messages if m["persona"] != persona_id]

            agent = await get_persona(persona_id)
            response = await agent.run(
                f"Here's what others said about {topic}:\n"
                f"{format_messages(other_messages)}\n\n"
                f"Respond to their points. Do you agree or disagree? "
                f"Cite your own work to support your position."
            )

            conversation.append({
                "persona": persona_id,
                "round": round_num,
                "message": response.content,
                "citations": response.citations
            })

    # Synthesize
    synthesis = await synthesize_conversation(conversation, topic)

    return {
        "topic": topic,
        "personas": persona_ids,
        "conversation": conversation,
        "synthesis": {
            "agreements": synthesis.agreements,
            "disagreements": synthesis.disagreements,
            "action_items": synthesis.recommendations
        }
    }
```

**Example Output:**
```
Topic: "Fasting for Longevity"
Personas: Andrew Huberman, Peter Attia

CONVERSATION:

[Round 1]
Huberman: "Fasting triggers autophagy and BDNF production. 12-16 hour
           windows optimize metabolic switching. Key is consistency..."
           📹 HL#41 - Fasting (00:28:15)

Attia: "Autophagy benefits are real, but protein timing matters. Fasted
        training can compromise muscle. Time-restricted eating is better..."
        📄 The Drive #135

[Round 2]
Huberman: "You make a good point about muscle. I've updated my view -
           post-workout nutrition within 1 hour, even during fasting..."
           📹 HL#112 (00:35:42)

Attia: "Agreed. Also important: fasting plus resistance training
        requires strategic refueling..."
        📄 The Drive #178

[Round 3]
[...continues...]

SYNTHESIS:
✅ Agreement:
  - Fasting has clear autophagy/longevity benefits
  - Consistency matters more than exact window length
  - Post-workout nutrition important

⚠️ Disagreement:
  - Huberman: Fasted morning workouts OK for most
  - Attia: Fed workouts better for muscle retention

💡 Your Action Items:
  1. Try 14-16 hour fasting window (both agree)
  2. Experiment with fasted vs fed workouts (track performance)
  3. Post-workout protein within 1 hour (both agree)
```

### Feature 4: Timeline/Evolution Tracking ⭐ NUANCE

**Track how views changed over time:**

```sql
-- Store content with dates
CREATE TABLE persona_content_vector (
    ...
    published_date DATE,
    content_version INT,  -- Track if persona updated their view
    superseded_by INT,    -- Link to newer version of same topic
    ...
);
```

**Implementation:**
```python
async def get_timeline_view(
    persona_id: str,
    topic: str
) -> dict:
    """
    Show how persona's views evolved on a topic.
    """

    # Search for all mentions of topic, sorted by date
    mentions = await search_by_date(
        persona_id=persona_id,
        topic=topic,
        order_by="published_date ASC"
    )

    # Detect changes in stance
    timeline = []
    previous_stance = None

    for mention in mentions:
        current_stance = classify_stance(mention.content)

        if current_stance != previous_stance:
            timeline.append({
                "date": mention.published_date,
                "stance": current_stance,
                "content": mention.content,
                "source": mention.citation,
                "change": previous_stance is not None
            })
            previous_stance = current_stance

    return {
        "topic": topic,
        "timeline": timeline,
        "current_stance": timeline[-1] if timeline else None,
        "has_evolved": len(timeline) > 1
    }
```

**User Experience:**
```
User: "What does Huberman say about cold exposure?"

Huberman AI:
  "My recommendations have evolved:

  📅 2021 (Early episodes):
     - Suggested 2-5 min daily cold showers
     - Focus on consistency over temperature
     📹 Source: HL#20 - Cold Exposure (Jan 2021)

  📅 2023 (Updated protocol):
     - Now recommend 11 min total per week (can be split)
     - Colder is better than longer
     - Post-workout timing reduces inflammation too much
     📹 Source: HL#91 - Cold Exposure 2.0 (Mar 2023)

  📅 2024 (Current stance):
     - Refined: 11 min weekly, minimum 2°F above shivering threshold
     - Don't do cold immediately after resistance training (blunts hypertrophy)
     - Best for: metabolism, resilience, dopamine
     📹 Source: Cold & Heat Toolkit (Jan 2024)

  ✅ Most Recent Protocol: 3-4 sessions per week, 2-4 min each,
     >2°F above shivering, NOT post-resistance training.

  Confidence: 95% (consistent across last 5 mentions)"
```

---

## Integration with Health-Agent & Other Services

**Both Approaches Supported:**

### Approach 1: Direct MCP Calls (Fast)
```python
# health-agent directly calls persona MCP
from mcp import Client

persona_client = Client("ai-personas-mcp")

async def get_expert_advice(question: str) -> str:
    result = await persona_client.call_tool(
        "query_persona",
        {
            "persona_id": "andrew-huberman",
            "question": question,
            "include_citations": True
        }
    )
    return result.response
```

### Approach 2: Via Odin (Conversational)
```python
# health-agent asks Odin, Odin queries persona
async def get_expert_advice_via_odin(question: str) -> str:
    # User-facing health-agent interface
    response = await odin_api.chat(
        message=f"Ask Huberman: {question}",
        context={"source": "health-agent"}
    )
    return response
```

**Use Cases:**
- **Health-Agent:** Direct MCP calls for programmatic queries
- **User Chat:** Via Odin for conversational interface
- **Future Services:** Both options available

---

## Data Sources & Scraping Strategy

### Content Sources (Per Persona)

**Example: Andrew Huberman**
1. **YouTube** (Primary - 95% of content value)
   - Huberman Lab official channel (~200 episodes)
   - Guest appearances (Lex Fridman, Joe Rogan, Tim Ferriss, etc.)
   - Tool: `youtube-transcript-api` for captions
   - Fallback: Whisper if no captions

2. **Podcasts** (Audio-only platforms)
   - Apple Podcasts, Spotify (audio-only episodes)
   - Transcribe with OpenAI Whisper

3. **Written Content**
   - Substack newsletter (Huberman Lab Newsletter)
   - Instagram posts (protocols, infographics)
   - Twitter/X threads
   - Stanford faculty page (bio, research interests)

4. **Academic Papers**
   - Published neuroscience research
   - Papers frequently cited in episodes
   - Google Scholar scraping

5. **Books** (If applicable)
   - Wait for public excerpts
   - Book summaries from reviews
   - Don't scrape full copyrighted text without permission

### Scraping Implementation

**YouTube Scraping:**
```python
from youtube_transcript_api import YouTubeTranscriptApi
import whisper

async def scrape_youtube_channel(channel_id: str, max_videos: int = 100):
    """
    Scrape YouTube channel content.
    """
    # 1. Get video list
    videos = await get_channel_videos(channel_id, limit=max_videos)

    for video in videos:
        try:
            # 2. Get transcript (prefer official captions)
            transcript = YouTubeTranscriptApi.get_transcript(video.id)
            content = format_transcript_with_timestamps(transcript)
        except:
            # 3. Fallback: Download audio and transcribe with Whisper
            audio = await download_audio(video.url)
            transcript = whisper_model.transcribe(audio)
            content = format_whisper_output(transcript)

        # 4. Store with metadata
        await store_content({
            "persona_id": persona_id,
            "source_type": "youtube",
            "source_url": video.url,
            "title": video.title,
            "published_date": video.published_date,
            "content": content,
            "duration": video.duration
        })
```

**Podcast Guest Appearances:**
```python
async def find_guest_appearances(person_name: str):
    """
    Find podcast episodes where person was a guest.
    """
    # Search major podcast platforms
    sources = [
        search_youtube(f"{person_name} podcast"),
        search_spotify(f"{person_name} guest"),
        search_apple_podcasts(f"{person_name} interview")
    ]

    # Filter by duration (>30 min = substantial interview)
    episodes = [e for e in sources if e.duration > 1800]

    # Rank by views/listens
    return sorted(episodes, key=lambda e: e.view_count, reverse=True)[:50]
```

**Scraping Schedule (Per-Persona):**
```python
# Stored in persona registry
persona_configs = {
    "andrew-huberman": {
        "scrape_schedule": "weekly",  # Active weekly podcast
        "sources": ["youtube", "substack", "instagram"],
        "priority": "high"
    },
    "bret-weinstein": {
        "scrape_schedule": "weekly",  # DarkHorse weekly
        "sources": ["youtube", "substack", "twitter"],
        "priority": "high"
    },
    "alan-watts": {
        "scrape_schedule": "never",  # Historical figure (deceased)
        "sources": ["youtube", "books"],
        "priority": "low"
    }
}
```

**Incremental Updates:**
```python
async def update_persona_content(persona_id: str):
    """
    Check for new content and index it.
    """
    config = await get_persona_config(persona_id)
    last_update = await get_last_scrape_time(persona_id)

    new_content = []

    # Check each source for new content
    for source in config.sources:
        if source == "youtube":
            new_videos = await get_new_videos_since(
                channel_id=config.youtube_channel,
                since=last_update
            )
            new_content.extend(new_videos)

        elif source == "substack":
            new_posts = await get_new_substack_posts(
                author=config.substack_author,
                since=last_update
            )
            new_content.extend(new_posts)

    # Index new content
    if new_content:
        await index_new_content(persona_id, new_content)
        logger.info(f"Updated {persona_id}: {len(new_content)} new items")

    return {"new_items": len(new_content)}
```

---

## Pydantic AI Integration (Personality Modeling)

### Why Pydantic AI?

**Traditional RAG:** Query → Search → Return chunks
**Problem:** Generic responses, no personality

**Pydantic AI RAG:** Query → Agent (with personality) → RAG tools → Styled response
**Benefit:** Responses mimic expert's communication style

### Personality Extraction

**During persona creation, analyze content for:**
1. **Communication Patterns:**
   - Sentence structure (short vs long, complex vs simple)
   - Vocabulary (technical jargon, analogies, metaphors)
   - Signature phrases ("So here's the deal", "The data shows")

2. **Explanation Style:**
   - Huberman: Scientific studies → Protocols → Actionable steps
   - Weinstein: Evolutionary lens → Historical context → Predictions
   - Watts: Philosophy → Paradox → Insight

3. **Citation Habits:**
   - Huberman: Always cites studies, uses timestamps
   - Attia: References papers with PMID numbers
   - Rogan: Anecdotal stories first, studies second

**Implementation:**
```python
async def extract_personality(persona_id: str, content_samples: List[str]):
    """
    Use LLM to analyze communication style.
    """

    # Sample 20-30 diverse content pieces
    samples = random.sample(content_samples, min(30, len(content_samples)))

    # Analyze with GPT-4
    analysis = await llm.complete(
        f"""Analyze the communication style of the following content samples.

        Identify:
        1. Sentence structure patterns (average length, complexity)
        2. Common vocabulary and signature phrases
        3. How they explain complex concepts (analogies, examples, structure)
        4. Citation style (how they reference sources)
        5. Tone (formal, casual, enthusiastic, cautious)

        Content samples:
        {format_samples(samples)}

        Return structured JSON with personality traits."""
    )

    personality = parse_personality_json(analysis)

    # Store personality profile
    await db.update_persona(persona_id, personality=personality)

    return personality
```

### Pydantic Agent Definition

```python
from pydantic_ai import Agent, RunContext

class PersonaAgent:
    def __init__(self, persona_id: str, personality: dict):
        self.persona_id = persona_id
        self.personality = personality

        # Create Pydantic AI agent with custom system prompt
        self.agent = Agent(
            "openai:gpt-4-turbo",
            system_prompt=self._build_system_prompt(),
            tools=[
                self.search_knowledge,
                self.get_timeline,
                self.cite_source
            ]
        )

    def _build_system_prompt(self) -> str:
        """
        Generate system prompt from personality profile.
        """
        return f"""You are an AI persona of {self.personality['name']}.

Your communication style:
- {self.personality['explanation_style']}
- Use signature phrases: {', '.join(self.personality['signature_phrases'])}
- Citation style: {self.personality['citation_style']}
- Tone: {self.personality['tone']}

CRITICAL RULES:
1. ALWAYS cite sources with timestamps/links
2. If views evolved over time, mention it
3. Flag low-confidence answers
4. Never invent information not in your content
5. Clarify you're an AI persona, not the real person

When answering:
- Search your knowledge base first
- Provide actionable protocols when relevant
- Show how your views evolved if applicable
- Include confidence score
"""

    @agent.tool()
    async def search_knowledge(
        self,
        ctx: RunContext,
        query: str,
        top_k: int = 5
    ) -> List[dict]:
        """Search persona's content for relevant information."""
        results = await hybrid_search(
            persona_id=self.persona_id,
            query=query,
            k=top_k
        )
        return [
            {
                "content": r.text,
                "source": r.citation,
                "date": r.published_date,
                "score": r.similarity_score
            }
            for r in results
        ]

    @agent.tool()
    async def get_timeline(
        self,
        ctx: RunContext,
        topic: str
    ) -> dict:
        """Get how views on a topic evolved over time."""
        return await get_timeline_view(self.persona_id, topic)

    @agent.tool()
    async def cite_source(
        self,
        ctx: RunContext,
        content_id: str
    ) -> dict:
        """Get detailed citation for a piece of content."""
        return await get_full_citation(content_id)

    async def query(self, question: str) -> dict:
        """
        Answer a question in this persona's style.
        """
        result = await self.agent.run(question)

        return {
            "response": result.content,
            "citations": result.citations,
            "confidence": calculate_confidence(result),
            "persona": self.personality['name']
        }
```

**Example Personality Profiles:**

```python
# Andrew Huberman
{
    "name": "Andrew Huberman",
    "role": "Neuroscientist, Stanford Professor",
    "explanation_style": "Scientific evidence → Mechanism → Protocol → Implementation",
    "signature_phrases": [
        "So here's the deal",
        "The science says",
        "Around the X-minute mark",
        "The data shows"
    ],
    "citation_style": "Always cite studies, use video timestamps (HH:MM:SS)",
    "tone": "Enthusiastic but rigorous, actionable, protocol-focused",
    "key_topics": ["neuroscience", "sleep", "performance", "focus", "dopamine"],
    "analogies": "Uses mechanical analogies for biological systems"
}

# Bret Weinstein
{
    "name": "Bret Weinstein",
    "role": "Evolutionary Biologist",
    "explanation_style": "Evolutionary lens → Historical context → Current situation → Prediction",
    "signature_phrases": [
        "Here's the thing",
        "From an evolutionary perspective",
        "I suspect",
        "It seems to me"
    ],
    "citation_style": "Narrative-driven, cites concepts more than specific papers",
    "tone": "Cautious, nuanced, skeptical of authority",
    "key_topics": ["evolution", "academia", "censorship", "COVID", "game theory"],
    "analogies": "Uses evolutionary biology to explain social phenomena"
}
```

---

## Vector Database Schema

```sql
-- Personas registry
CREATE TABLE personas (
    id SERIAL PRIMARY KEY,
    persona_id VARCHAR UNIQUE NOT NULL,  -- "andrew-huberman"
    name VARCHAR NOT NULL,                -- "Andrew Huberman"
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Personality profile (from analysis)
    personality JSONB,  -- {
                        --   "communication_style": "...",
                        --   "signature_phrases": [...],
                        --   "key_topics": [...]
                        -- }

    -- Scraping config
    scrape_schedule VARCHAR,  -- "weekly" | "bi-weekly" | "monthly" | "never"
    sources JSONB,            -- ["youtube", "substack", "twitter"]
    last_scraped_at TIMESTAMPTZ,

    -- Stats
    total_documents INT DEFAULT 0,
    total_hours_content FLOAT DEFAULT 0,
    date_range_start DATE,
    date_range_end DATE,

    -- Status
    status VARCHAR DEFAULT 'active'  -- "creating" | "active" | "updating" | "paused"
);

-- Persona content (chunked, embedded)
CREATE TABLE persona_content_vector (
    id SERIAL PRIMARY KEY,
    persona_id VARCHAR NOT NULL REFERENCES personas(persona_id),

    -- Source metadata
    source_type VARCHAR,        -- "youtube" | "podcast" | "substack" | "book" | "twitter"
    source_url TEXT,
    source_title TEXT,
    published_date DATE,

    -- Content
    content TEXT,               -- Chunked text
    chunk_index INT,            -- Which chunk of the source (for reconstruction)

    -- Embeddings
    embedding vector(1536),     -- OpenAI text-embedding-3-small

    -- Timeline tracking
    content_version INT DEFAULT 1,  -- If persona updated their view
    superseded_by INT,              -- Link to newer version
    is_current BOOLEAN DEFAULT true,

    -- Full-text search
    content_tsv tsvector GENERATED ALWAYS AS (
        to_tsvector('english', content)
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity index
CREATE INDEX persona_content_embedding_idx
ON persona_content_vector
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Full-text search index
CREATE INDEX persona_content_fts_idx
ON persona_content_vector
USING GIN (content_tsv);

-- Persona partitioning index (critical for isolation)
CREATE INDEX persona_content_persona_idx
ON persona_content_vector (persona_id);

-- Timeline queries
CREATE INDEX persona_content_date_idx
ON persona_content_vector (persona_id, published_date DESC);

-- Scraping log
CREATE TABLE persona_scrape_log (
    id SERIAL PRIMARY KEY,
    persona_id VARCHAR NOT NULL,
    source_type VARCHAR,
    scrape_started_at TIMESTAMPTZ,
    scrape_completed_at TIMESTAMPTZ,
    new_items_found INT,
    status VARCHAR,  -- "success" | "failed" | "partial"
    error_message TEXT
);
```

---

## MCP Tools Exposed

```python
from mcp import Server
from pydantic_ai import Agent

app = Server("ai-personas-mcp")

@app.tool()
async def create_persona(
    name: str,
    sources: Optional[List[str]] = None,
    scrape_depth: str = "standard"
) -> dict:
    """
    Auto-create AI persona from public content.

    See Feature 1 for full implementation.
    """
    # Implementation in Feature 1 section above

@app.tool()
async def query_persona(
    persona_id: str,
    question: str,
    include_citations: bool = True,
    include_timeline: bool = False
) -> dict:
    """
    Ask a question to a specific persona.

    Args:
        persona_id: Persona identifier (e.g., "andrew-huberman")
        question: User's question
        include_citations: Include source citations in response
        include_timeline: Show how views evolved over time

    Returns:
        {
            "response": "...",
            "citations": [...],
            "timeline": [...] if include_timeline,
            "confidence": 0.95
        }
    """
    # Load persona agent
    agent = await persona_manager.get_persona(persona_id)

    # Query
    result = await agent.query(question)

    # Optional: Add timeline view
    if include_timeline:
        topic = extract_topic(question)
        result["timeline"] = await get_timeline_view(persona_id, topic)

    return result

@app.tool()
async def multi_persona_conversation(
    persona_ids: List[str],
    topic: str,
    rounds: int = 3
) -> dict:
    """
    Create conversation between multiple personas.

    See Feature 3 for full implementation.
    """
    # Implementation in Feature 3 section above

@app.tool()
async def list_personas() -> dict:
    """
    List all available personas.

    Returns:
        {
            "personas": [
                {
                    "persona_id": "andrew-huberman",
                    "name": "Andrew Huberman",
                    "role": "Neuroscientist",
                    "total_documents": 5234,
                    "total_hours": 142,
                    "last_updated": "2026-01-15",
                    "status": "active"
                }
            ]
        }
    """
    personas = await db.fetch("SELECT * FROM personas WHERE status = 'active'")

    return {
        "personas": [
            {
                "persona_id": p.persona_id,
                "name": p.name,
                "role": p.personality.get("role"),
                "total_documents": p.total_documents,
                "total_hours": p.total_hours_content,
                "last_updated": p.last_scraped_at,
                "status": p.status
            }
            for p in personas
        ]
    }

@app.tool()
async def update_persona(
    persona_id: str,
    force: bool = False
) -> dict:
    """
    Check for new content and update persona.

    Args:
        persona_id: Persona to update
        force: Force update even if recently updated

    Returns:
        {
            "new_items": 3,
            "sources_checked": ["youtube", "substack"],
            "status": "success"
        }
    """
    return await update_persona_content(persona_id, force=force)

@app.tool()
async def get_persona_stats(persona_id: str) -> dict:
    """
    Get detailed stats for a persona.

    Returns:
        {
            "persona_id": "andrew-huberman",
            "total_documents": 5234,
            "total_hours": 142,
            "sources": {
                "youtube": {"count": 200, "hours": 120},
                "substack": {"count": 45, "hours": 10},
                "twitter": {"count": 500, "hours": 5}
            },
            "date_range": "2020-01-01 to 2026-01-18",
            "top_topics": ["sleep", "neuroscience", "performance"],
            "last_updated": "2026-01-15"
        }
    """
    # Implementation: aggregate stats from persona_content_vector
```

---

## Implementation Tasks

### Phase 1: MCP Infrastructure & Basic RAG

**Issue 1: MCP server setup**
- Docker container with Python 3.11 + MCP SDK
- Define 6 MCP tools (create, query, multi-convo, list, update, stats)
- Health check endpoint
- docker-compose with PostgreSQL + pgvector
- **Acceptance:** MCP server responds to tool calls

**Issue 2: Database schema**
- Create `personas` table (registry + personality profiles)
- Create `persona_content_vector` table (partitioned by persona_id)
- HNSW index for vector similarity
- GIN index for full-text search
- Timeline indexes (persona_id + published_date)
- **Acceptance:** Can store multi-persona content with isolation

**Issue 3: Basic RAG implementation**
- Hybrid search (vector + keyword) with persona_id filter
- Embedding generation (OpenAI text-embedding-3-small)
- Chunking strategy (semantic boundaries, preserve context)
- Citation metadata extraction
- **Acceptance:** Can search one persona's content accurately

### Phase 2: Content Scraping

**Issue 4: YouTube scraper**
- youtube-transcript-api integration for captions
- Whisper fallback for videos without captions
- Channel video listing (last N videos)
- Guest appearance detection (search by name)
- Metadata extraction (title, date, duration, URL)
- **Acceptance:** Can scrape 100 YouTube videos with transcripts

**Issue 5: Multi-source scraping framework**
- Substack scraper (RSS + web scraping)
- Twitter/X scraper (tweets, threads)
- Podcast platforms (Spotify, Apple Podcasts)
- Academic papers (Google Scholar API)
- Generic web scraper (blogs, articles)
- **Acceptance:** Can scrape 5+ source types

**Issue 6: Scraping scheduler**
- Per-persona cron schedules (weekly, bi-weekly, monthly)
- Incremental updates (detect new content since last scrape)
- Error handling and retry logic
- Scraping logs (success/failure tracking)
- **Acceptance:** Auto-updates run on schedule without intervention

### Phase 3: Auto-Persona Creation

**Issue 7: Content discovery engine**
- YouTube channel search by name
- Podcast guest appearance search
- Substack author search
- Twitter account detection
- Academic profile search (Google Scholar)
- **Acceptance:** Given name, finds 5+ content sources automatically

**Issue 8: Personality extraction**
- LLM-based communication style analysis
- Signature phrase detection
- Explanation pattern recognition
- Citation style extraction
- System prompt generation
- **Acceptance:** Generates accurate personality profile from 30 content samples

**Issue 9: Auto-persona pipeline**
- Orchestrate: discover → scrape → analyze → index → create agent
- Progress tracking (show user % complete)
- Error handling (partial failures OK)
- Default configurations (scrape depth, update schedule)
- **Acceptance:** `create_persona("Andrew Huberman")` completes in <30 min

### Phase 4: Pydantic AI Integration

**Issue 10: Pydantic AI agent framework**
- PersonaAgent class with custom system prompts
- RAG tools (search_knowledge, get_timeline, cite_source)
- Personality-based response styling
- Confidence scoring
- **Acceptance:** Responses mimic persona's communication style

**Issue 11: On-demand agent loading**
- PersonaManager with in-memory cache
- Load agents only when queried (not all at startup)
- LRU eviction (max 10 agents in memory)
- Lazy loading from DB personality profiles
- **Acceptance:** Can load 100+ personas without memory issues

**Issue 12: Citation formatting**
- Inline citations (with timestamps)
- Footnote citations
- Rich citations (clickable links)
- Source type handling (YouTube, podcast, article, book)
- **Acceptance:** All responses include accurate citations

### Phase 5: Advanced Features

**Issue 13: Multi-persona conversations**
- Conversational flow engine (rounds, turn-taking)
- Context passing between personas
- Synthesis generation (agreement/disagreement)
- Transcript formatting
- **Acceptance:** 2-persona debate on topic produces coherent discussion

**Issue 14: Timeline/evolution tracking**
- Detect stance changes over time
- Version management (superseded_by links)
- Timeline view generation
- Change flagging in responses
- **Acceptance:** Shows how views evolved across 3+ years

**Issue 15: Quality & confidence scoring**
- Citation count → confidence
- Content recency → freshness score
- Consistency check (contradictory statements)
- Confidence thresholds (flag low-confidence answers)
- **Acceptance:** Confidence scores correlate with accuracy >85%

### Phase 6: Integration & Polish

**Issue 16: Health-Agent integration**
- Direct MCP call interface
- Via-Odin conversational interface
- API documentation
- Example queries for health topics
- **Acceptance:** Health-agent can query Huberman persona <500ms

**Issue 17: Odin integration**
- Add personas MCP to Odin config
- Conversational commands ("Ask Huberman about X")
- Multi-persona UI ("Have Huberman and Attia discuss Y")
- **Acceptance:** Can query personas from Odin CLI

**Issue 18: Monitoring & observability**
- Prometheus metrics (query latency, scraping health)
- Persona quality dashboard (confidence scores, citation rates)
- Scraping logs analysis
- User satisfaction tracking
- **Acceptance:** Can monitor persona performance in real-time

### Estimated Effort

- **Phase 1 (Infrastructure):** 24 hours
- **Phase 2 (Scraping):** 40 hours (complex multi-source scraping)
- **Phase 3 (Auto-creation):** 32 hours (content discovery + personality extraction)
- **Phase 4 (Pydantic AI):** 28 hours (agent framework + on-demand loading)
- **Phase 5 (Advanced Features):** 32 hours (multi-persona + timeline)
- **Phase 6 (Integration):** 16 hours
- **Total:** ~172 hours (~4-5 weeks)

**Note:** This is the most complex tool due to:
- Multi-source scraping
- Pydantic AI personality modeling
- Multi-persona conversations
- Timeline tracking

---

## Acceptance Criteria

### Feature-Level:

- [ ] **Auto-Persona Creation:** Given name, creates persona in <30 min (100+ hours content)
- [ ] **MCP Server:** Runs as isolated Docker container
- [ ] **MCP Tools:** All 6 tools functional
- [ ] **Pydantic AI:** Responses mimic persona's communication style >80% similarity
- [ ] **Citations:** Every response includes source + timestamp/link (>95% accuracy)
- [ ] **Multi-Persona:** 2-persona conversations produce coherent debates (3 rounds)
- [ ] **Timeline:** Shows view evolution across 3+ years for personas with long history
- [ ] **Query Accuracy:** >90% of responses match expert's actual views
- [ ] **Content Freshness:** New content indexed within 7 days of publication
- [ ] **Health-Agent Integration:** API latency <500ms
- [ ] **Odin Integration:** Can query personas via conversational commands

### Code Quality:

- [ ] Type-safe Python (mypy strict mode)
- [ ] Comprehensive error handling (scraping failures, API errors)
- [ ] Unit tests (chunking, embedding, personality extraction)
- [ ] Integration tests (end-to-end persona creation + query)
- [ ] Scraping tests (mock responses, rate limiting)

### Documentation:

- [ ] Architecture diagram (scraping → indexing → Pydantic AI → responses)
- [ ] API documentation (all 6 MCP tools)
- [ ] Persona creation guide (how to add new personas)
- [ ] Integration guide (health-agent + Odin)
- [ ] Ethical guidelines (disclaimers, citations, consent)

---

## Testing Strategy

### Unit Tests
- Content scraping (YouTube, Substack, Twitter)
- Personality extraction (from content samples)
- Chunking (semantic boundaries)
- Hybrid search (persona_id isolation)
- Citation formatting (all source types)

### Integration Tests
- End-to-end persona creation (name → fully indexed persona)
- Multi-persona conversations (2+ personas, 3 rounds)
- Timeline view generation (detect view changes)
- Incremental updates (new content detection)

### E2E Test Scenarios

**Scenario 1: Create Huberman Persona**
- Input: `create_persona("Andrew Huberman")`
- Expected:
  - Finds Huberman Lab YouTube (200+ videos)
  - Scrapes last 100 videos + Substack
  - Generates personality (scientific, protocol-focused)
  - Indexes 5000+ documents
  - Completion time: <30 min
- Verify: Query "sleep protocol" returns accurate response with citations

**Scenario 2: Multi-Persona Debate**
- Input: `multi_persona_conversation(["huberman", "attia"], "fasting", rounds=3)`
- Expected:
  - Both personas generate initial responses based on their content
  - Responses reference each other's points
  - Synthesis shows agreement/disagreement
  - All responses include citations
- Verify: Conversation is coherent, positions match actual expert views

**Scenario 3: Timeline Evolution**
- Input: Query Huberman on "cold exposure" with timeline=true
- Expected:
  - Shows 2021 stance (2-5 min daily)
  - Shows 2023 update (11 min weekly)
  - Shows 2024 refinement (post-workout timing)
  - Flags evolution clearly
- Verify: Timeline matches actual evolution of his recommendations

**Scenario 4: Health-Agent Integration**
- Input: Health-agent asks for sleep advice via MCP
- Expected:
  - Direct MCP call to query_persona
  - Returns formatted response <500ms
  - Includes actionable protocols
  - Citations intact
- Verify: Health-agent receives usable advice

---

## Ethical & Legal Considerations

**⚠️ CRITICAL: This creates AI impersonations of real people**

### Legal Safeguards:

1. **Disclaimers (Non-Negotiable):**
   - Every response must include: "AI persona based on [Name]'s public content, not the actual person"
   - Persona listing shows "AI Persona" label
   - No claim of endorsement from the real person

2. **Citations (Transparency):**
   - Always link to original sources
   - Drive traffic to their content (ethical and good for creators)
   - Never invent quotes or positions

3. **Public Content Only:**
   - Only scrape publicly available content (YouTube, podcasts, articles)
   - No paywalled content without permission
   - No private communications or leaked materials

4. **Personal Use (Current Scope):**
   - This is for your personal learning/advice
   - If health-agent becomes commercial → revisit consent/licensing
   - Consider limiting to deceased figures or public domain for commercial use

5. **Copyright Compliance:**
   - Transcripts = factual information (fair use)
   - Books = only public excerpts or summaries
   - Cite all sources (avoid plagiarism)

6. **Respect for Subjects:**
   - Don't use personas to spread misinformation
   - Don't create personas of private individuals
   - Don't use for defamation or impersonation fraud

### Recommended Practices:

- **Transparency:** Clearly label all interactions as "AI Persona"
- **Attribution:** Prominent links to original content
- **Accuracy:** High confidence threshold (>80%) before responding
- **Limitations:** Flag when persona has insufficient info on topic
- **Updates:** Regular content updates to reflect current views

### Example Disclaimer Format:

```
🤖 AI Persona Disclaimer:
This is an AI persona based on Andrew Huberman's publicly available content
(YouTube, podcasts, articles). This is NOT the real Andrew Huberman.

Responses are synthesized from his content using RAG + AI.
All sources are cited. Always verify important health advice with professionals.

Learn more from the real Andrew Huberman:
- YouTube: Huberman Lab
- Podcast: Huberman Lab Podcast
- Website: hubermanlab.com
```

---

## Future Enhancements (Post-MVP)

### V2 Features
- [ ] **Community Personas:** Users create personas of local experts, family members (with consent)
- [ ] **Multi-modal:** Include video/image analysis (not just transcripts)
- [ ] **Podcast-specific:** Better podcast discovery (all platforms)
- [ ] **Book integration:** OCR for physical books (with permission)
- [ ] **Controversy Detection:** Flag when persona changed opinion or has contradictory statements
- [ ] **Voice Cloning:** Generate audio responses in persona's voice (ethical concerns!)
- [ ] **Live Updates:** Real-time indexing when new content published

### V3 Features
- [ ] **Cross-Persona Knowledge Graph:** Map relationships between experts' ideas
- [ ] **Historical Personas:** Einstein, Tesla, etc. (public domain content)
- [ ] **Fictional Personas:** Characters from literature (Sherlock Holmes, etc.)
- [ ] **Persona Marketplace:** Share personas with others (with consent)
- [ ] **Collaboration Mode:** Multiple personas work together to solve problem

---

## References

- **Pydantic AI:** https://ai.pydantic.dev/
- **youtube-transcript-api:** https://github.com/jdepoix/youtube-transcript-api
- **OpenAI Whisper:** https://github.com/openai/whisper
- **pgvector:** https://github.com/pgvector/pgvector
- **MCP Specification:** https://spec.modelcontextprotocol.io/
- **Ethical AI Impersonation:** (Research needed - this is a novel use case)

---

**Epic Status:** Planned (Future Tool - Not in Active Build)
**Next Action:** Review epic, discuss ethical implications, promote to active build when ready

**⚠️ Important:** This is the most complex tool planned. Consider building after:
- Swedish Grants RAG (tool-005) is complete
- You have experience with MCP servers
- Ethical/legal review is complete
