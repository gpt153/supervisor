# ADR-004: OpenAI Realtime API for Voice Interface

**Status:** Accepted
**Date:** 2026-01-15
**Deciders:** Samuel, Supervisor
**Context:** Need natural voice interaction like ChatGPT Voice Mode

---

## Context and Problem Statement

Odin needs a voice interface that supports:
- **Natural conversation** (like talking to ChatGPT Voice)
- **Button press activation** (Bluetooth headset)
- **Context-aware responses** (knows current project, schedule, tasks)
- **Low latency** (feels responsive)
- **High quality** (natural-sounding voice)
- **Multi-turn conversations** (not one-off commands)

**Question:** What architecture should we use for voice I/O?

---

## Decision

**We will use OpenAI's Realtime API for voice input/output, routing through Odin's context management system.**

### Architecture

```
User speaks (Bluetooth headset)
    ↓
OpenAI Realtime API (Speech-to-Text)
    ↓
Text to Odin Intelligence Core
    ↓
- Load project context
- Search knowledge base
- Check calendar/tasks
- Generate response
    ↓
Response text back to Realtime API
    ↓
OpenAI Realtime API (Text-to-Speech)
    ↓
User hears response (Bluetooth headset)
```

**Hybrid Approach:** Use Realtime API for audio I/O but route through Odin's brain for intelligence.

---

## Rationale

### Why OpenAI Realtime API?

**1. Lowest Latency**
- Streaming audio in/out
- WebSocket connection (bidirectional)
- ~500ms end-to-end latency
- Feels like natural conversation

**2. Best Turn Detection**
- Automatically detects when user stops speaking
- Handles interruptions (user can interrupt Odin)
- Natural conversation flow
- No manual VAD (Voice Activity Detection) needed

**3. High-Quality Voice**
- Same voices as ChatGPT Voice Mode
- Natural prosody and intonation
- Multiple voice options
- Gender-neutral voices available

**4. Proven Technology**
- Already battle-tested in ChatGPT
- Stable API
- Good documentation
- Active support

**5. Simplicity**
- Single API handles STT + TTS
- No need to coordinate separate services
- Built-in audio format handling
- WebSocket or REST interface

### Why Not Separate STT + TTS?

**Alternative considered:**
```
Whisper (STT) → Odin → ElevenLabs (TTS)
```

**Problems:**
- Higher latency (3 network calls instead of streaming)
- Need to implement turn detection manually
- More complex error handling
- No built-in interruption support
- More services to manage

**When to use separate:** If cost becomes prohibitive or need specific voice (e.g., Swedish voice)

### Cost Analysis

**OpenAI Realtime API:**
- Audio input: $0.10 per minute
- Audio output: $0.20 per minute
- Total: $0.30 per minute of conversation

**Typical usage:**
- 5 conversations per day
- 2 minutes average per conversation
- 10 minutes/day = 300 minutes/month
- **Cost: ~$90/month**

**Alternative (Whisper + ElevenLabs):**
- Whisper: $0.006 per minute
- ElevenLabs: ~$0.18 per minute (Creator plan)
- Total: $0.186 per minute
- 300 minutes/month = **$56/month**

**Decision:** Realtime API's better UX justifies $34/month premium. Can optimize later if needed.

---

## Implementation Details

### Connection Flow

```python
# services/voice_service.py
class VoiceService:
    """Manage voice interaction via OpenAI Realtime API."""

    async def start_session(self, user_id: str):
        """Start voice session."""
        # 1. Connect to Realtime API via WebSocket
        ws = await self.connect_realtime_api()

        # 2. Configure session
        await ws.send_json({
            "type": "session.update",
            "session": {
                "voice": "sage",  # or user preference
                "temperature": 0.7,
                "max_response_output_tokens": 4096
            }
        })

        # 3. Start listening loop
        await self.listen_loop(ws, user_id)

    async def listen_loop(self, ws, user_id: str):
        """Main voice interaction loop."""
        current_project = await self.get_current_project(user_id)

        async for message in ws:
            if message["type"] == "conversation.item.created":
                # User spoke, API transcribed
                text = message["item"]["content"][0]["transcript"]

                # Route through Odin's intelligence
                response = await self.process_with_context(
                    user_id=user_id,
                    text=text,
                    project=current_project
                )

                # Send response back to API for TTS
                await ws.send_json({
                    "type": "response.create",
                    "response": {
                        "text": response.text,
                        "voice": "sage"
                    }
                })

    async def process_with_context(
        self,
        user_id: str,
        text: str,
        project: Optional[Project]
    ) -> Response:
        """Process user input with full Odin intelligence."""

        # 1. Detect context switch
        if "talk about" in text.lower():
            new_project = await self.detect_project_switch(text)
            if new_project:
                project = new_project
                # Load project context

        # 2. Load relevant context
        context = await self.load_context(
            project=project,
            user_id=user_id,
            query=text
        )

        # 3. Generate response using Claude
        # (Claude is better at reasoning than GPT-4 Turbo)
        response = await self.generate_response(
            text=text,
            context=context,
            project=project
        )

        # 4. Save conversation turn
        await self.save_conversation(
            project_id=project.id if project else None,
            user_text=text,
            odin_response=response.text
        )

        return response
```

### Bluetooth Headset Integration

```python
# hardware/bluetooth_headset.py
class BluetoothHeadset:
    """Handle Bluetooth headset button press."""

    def __init__(self):
        self.button_pressed = False

    async def listen_for_button(self):
        """Monitor headset button via Bluetooth HFP."""
        # Use PyBluez or similar library
        # Detect button press event
        # Set flag or emit event

    async def on_button_press(self):
        """Handle button press."""
        if not self.button_pressed:
            # Start listening
            self.button_pressed = True
            await voice_service.start_listening()
        else:
            # Stop listening (user released button)
            self.button_pressed = False
            await voice_service.stop_listening()
```

**Note:** Push-to-talk is simpler than wake word detection. No need for continuous microphone monitoring.

### Context Loading Strategy

```python
async def load_context(
    self,
    project: Optional[Project],
    user_id: str,
    query: str
) -> Dict:
    """Load relevant context for voice query."""

    context = {}

    # 1. Current project context
    if project:
        context["project"] = {
            "name": project.name,
            "summary": project.summary,
            "recent_conversations": await self.get_recent_conversations(project.id, limit=5),
            "related_files": await self.get_related_files(project.id),
            "related_tasks": await self.get_related_tasks(project.id)
        }

    # 2. User's schedule today
    context["schedule"] = await self.get_today_schedule(user_id)

    # 3. Pending tasks
    context["tasks"] = await self.get_pending_tasks(user_id, limit=10)

    # 4. Recent messages
    context["messages"] = await self.get_unread_messages(user_id)

    # 5. Semantic search if query is question
    if "?" in query or query.startswith(("what", "where", "when", "who", "how")):
        context["search_results"] = await self.semantic_search(query, limit=5)

    # 6. Family context (if query mentions a child)
    for child in await self.get_children(user_id):
        if child.name.lower() in query.lower():
            context["child"] = await self.get_child_context(child.id)

    return context
```

---

## Consequences

### Positive

✅ **Natural Conversation**
- Feels like talking to a human
- Low latency (responsive)
- Can interrupt mid-response
- Multi-turn conversations work well

✅ **Simplicity**
- Single API for voice I/O
- No VAD implementation needed
- Proven, stable technology
- Good documentation

✅ **Quality**
- High-quality voices
- Natural prosody
- Multiple voice options

✅ **Context Intelligence**
- Routes through Odin's brain
- Full access to projects, memory, knowledge base
- Can do complex reasoning (via Claude)

### Negative

⚠️ **Cost**
- $90/month for moderate use
- Could reach $200-300/month with heavy use
- More expensive than separate STT+TTS

⚠️ **Vendor Lock-in**
- Dependent on OpenAI
- If API changes or shuts down, need to rewrite
- Limited voice customization

⚠️ **Network Dependency**
- Requires internet connection
- Latency depends on network quality
- Won't work offline

⚠️ **Privacy Consideration**
- Audio sent to OpenAI servers
- Not fully local/private
- Need to trust OpenAI with voice data

### Mitigation

**Cost:**
- Monitor usage carefully
- Set monthly budget alerts
- Consider separate STT+TTS if cost becomes issue
- Optimize: shorter responses, batch commands

**Vendor Lock-in:**
- Abstract voice service behind interface
- Could swap to Whisper+ElevenLabs later
- Keep architecture modular

**Network:**
- Graceful degradation if offline
- Fall back to text interface
- Cache common responses

**Privacy:**
- Document in privacy policy
- User opts in to voice features
- Consider local Whisper for sensitive conversations
- Never send sensitive data (passwords, financial) via voice

---

## Alternative Approaches

### Alternative 1: Whisper + ElevenLabs
**Architecture:**
```
Whisper (STT) → Odin → ElevenLabs (TTS)
```

**Pros:**
- Cheaper ($56/month vs $90/month)
- More control over each component
- Can use local Whisper for privacy

**Cons:**
- Higher latency (3 sequential API calls)
- Manual turn detection needed
- No built-in interruption handling
- More complex implementation

**When to use:** If cost becomes major issue or need specific voice characteristics.

### Alternative 2: Fully Local (Whisper Local + Coqui TTS)
**Architecture:**
```
Whisper (local) → Odin → Coqui TTS (local)
```

**Pros:**
- No API costs
- Fully private (no cloud)
- Works offline

**Cons:**
- Requires GPU for good performance
- Voice quality lower than cloud services
- Higher latency on CPU
- More complex setup

**When to use:** Privacy is absolute requirement, or for specific secure conversations.

### Alternative 3: Claude Voice API (Future)
**If Anthropic releases voice API:**
- Would integrate better (same vendor for reasoning + voice)
- Potentially better context handling
- Similar quality expected

**Decision:** Start with OpenAI Realtime, migrate to Claude Voice if/when available.

---

## Voice Features Roadmap

### Phase 6: Initial Voice (Jul 2026)
- Basic voice commands
- Button press activation
- Context-aware responses
- Single voice (sage)

### Phase 6.5: Enhanced Voice (Aug 2026)
- Multiple voices (user preference)
- Proactive voice notifications
- Voice-initiated context switching
- Voice search

### Phase 7+: Advanced Voice (Sep 2026+)
- Custom wake word (optional)
- Conversation summaries
- Voice journaling
- Multi-language support (Swedish + English)

---

## References

- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [ChatGPT Voice Mode Technical Breakdown](https://openai.com/blog/chatgpt-can-now-see-hear-and-speak)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

---

## Status

**Accepted** - Will be implemented in Phase 6

**Dependencies:**
- Phase 4 (Project Memory) must be complete first
- Need Bluetooth headset
- OpenAI API key with Realtime access

**Next Steps:**
1. Test Realtime API with simple example
2. Identify Bluetooth headset model and button protocol
3. Build basic voice service
4. Integrate with project context system
5. Test latency and quality

---

**Author:** Supervisor + Samuel
**Reviewers:** Samuel
**Last Updated:** 2026-01-15
