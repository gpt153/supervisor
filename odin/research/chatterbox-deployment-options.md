# Chatterbox TTS Deployment Options for Odin Voice Assistant

**Research Date:** 2026-01-16
**Purpose:** Evaluate deployment options for Chatterbox TTS as an alternative to OpenAI Realtime API
**Context:** Odin voice assistant (Phase 6+), phone call capabilities, MacBook Pro hosting

---

## Executive Summary

**Key Findings:**

1. **Phone Calls:** Chatterbox can be used for outbound phone calls via OpenSIPS AI Voice Connector or Twilio Media Streams, with additional STT service required
2. **MacBook Pro:** Chatterbox works on Apple Silicon (M1/M2/M3/M4) with MPS acceleration, but with limitations and stability issues
3. **Cloud GPU:** $30/month estimate is too low; realistic costs are $130-270/month for 24/7 hosting
4. **Recommended:** Hybrid approach with serverless GPU for cost optimization

---

## 1. Chatterbox for Phone Calls

### Architecture Overview

Chatterbox provides **TTS only**. For phone calls, you need:

```
Phone System (Twilio/OpenSIPS)
    ↓
Audio Stream (bidirectional)
    ↓
STT Service (Deepgram/Whisper) → Text
    ↓
LLM (Claude/GPT-4) → Response Text
    ↓
Chatterbox TTS → Audio
    ↓
Phone System → User Hears Response
```

### Integration Options

#### Option A: OpenSIPS AI Voice Connector

**What it is:** Open-source SIP gateway that bridges VoIP calls with AI services (STT, LLM, TTS)

**Supported Integrations:**
- **Deepgram Flavor:** Deepgram STT + ChatGPT + Deepgram TTS
- **OpenAI Flavor:** OpenAI Realtime API (direct speech-to-speech)
- **Azure Flavor:** Azure STT + TTS + other Azure services
- **Custom Flavor:** Can integrate Chatterbox TTS (requires custom development)

**How to add Chatterbox:**
1. Use OpenSIPS Voice Connector as SIP interface
2. Configure Deepgram/Whisper for STT
3. Replace TTS component with Chatterbox API endpoint
4. Deploy as Python application with SIP stack

**Pros:**
- Open source (GPL v3.0)
- VoIP-native (handles SIP calls)
- Modular architecture (swap components)
- Works with any SIP-compatible PBX

**Cons:**
- Requires custom integration work for Chatterbox
- Need to manage SIP infrastructure
- More complex than Twilio

**Best for:** Self-hosted VoIP systems, privacy-focused deployments

**References:**
- [OpenSIPS AI Voice Connector GitHub](https://github.com/OpenSIPS/opensips-ai-voice-connector-ce)
- [OpenSIPS Documentation](https://ce.opensips.org/opensips-ai/)

#### Option B: Twilio Media Streams

**What it is:** Twilio service that streams live audio from phone calls to your server via WebSocket

**Architecture:**
```python
# Your server receives audio via WebSocket
@app.websocket("/twilio-stream")
async def handle_call(websocket):
    # 1. Receive audio chunks from Twilio
    async for message in websocket:
        audio_chunk = message['media']['payload']

        # 2. Send to STT (Deepgram streaming or Whisper)
        text = await stt_service.transcribe(audio_chunk)

        # 3. Generate response (Claude/GPT-4)
        response_text = await llm.generate(text, context)

        # 4. Generate audio with Chatterbox
        audio = await chatterbox.synthesize(response_text)

        # 5. Send audio back to Twilio
        await websocket.send({
            'event': 'media',
            'media': {'payload': audio}
        })
```

**Pros:**
- Proven, stable service
- Good documentation
- Easy to get started
- Handles phone network complexity

**Cons:**
- Vendor lock-in (Twilio)
- Per-minute costs for phone calls
- Network latency (audio → server → audio)

**Best for:** Production phone call systems, minimal infrastructure management

**References:**
- [Twilio Voice Documentation](https://www.twilio.com/docs/voice)
- [Building AI Phone Agents with Twilio](https://medium.com/@alozie_igbokwe/building-an-ai-phone-agent-with-twilio-and-openais-realtime-api-python-bc2f9a8df065)

### Latency Considerations

**Chatterbox Latency:**
- **Time to First Byte:** 150ms (Chatterbox-Turbo)
- **Streaming:** Sub-200ms for first audio chunk
- **Realtime Factor:** 0.499 on RTX 4090 (generates audio faster than playback)

**Phone Call Requirements:**
- **Target Latency:** <500ms total (feels natural)
- **Acceptable:** 500-1000ms (slight delay, still usable)
- **Poor:** >1000ms (feels broken)

**Total Latency Estimate (Twilio + Chatterbox):**
```
Audio to Server: 50-100ms (network)
STT (Deepgram streaming): 100-200ms
LLM (Claude): 500-1000ms (depends on response length)
Chatterbox TTS: 150-200ms (first chunk)
Audio back to Twilio: 50-100ms (network)
-------------------------------------------
Total: 850-1600ms
```

**Verdict:** Acceptable but not ideal. OpenAI Realtime API (~500ms total) is faster due to integrated STT+TTS.

### Phone Call Costs

**Twilio Outbound Calling (US numbers):**
- **Per-minute cost:** $0.013/minute
- **Connection fee:** Varies by carrier (typically $0.005-0.01)

**Example: 100 outbound calls/month, 3 min average:**
- 300 minutes × $0.013 = **$3.90/month**
- Plus connection fees: ~$1.00
- **Total: ~$5/month for phone service**

**STT Costs (Deepgram):**
- **Nova-2 (best quality):** $0.0043/minute
- 300 minutes: **$1.29/month**

**TTS Costs (Chatterbox):**
- Self-hosted: GPU costs (see section 3)
- Serverless: API call costs (see section 4)

**Total Cost Estimate (100 calls/month):**
- Phone: $5/month
- STT: $1.29/month
- LLM: $10-20/month (depends on conversation length)
- TTS: $30-90/month (depends on deployment)
- **Total: $46-116/month**

**Compare to OpenAI Realtime API:**
- 300 minutes × $0.30/minute = **$90/month** (STT+TTS+LLM included)
- Plus Twilio: $5/month
- **Total: $95/month**

**Verdict:** Chatterbox is cheaper only if using serverless/on-demand GPU. 24/7 GPU hosting is more expensive.

### User Scenario: Autonomous Appointment Calls

**What user wants:**
> "Odin, schedule a haircut for next Tuesday at 3pm"

**What needs to happen:**
1. Odin finds salon phone number (from contacts/search)
2. Calls salon
3. **Conversation:**
   - **Receptionist:** "Salon Maya, how can I help?"
   - **Odin:** "Hi, I'd like to book a haircut for Samuel"
   - **Receptionist:** "When were you thinking?"
   - **Odin:** "Next Tuesday at 3pm if available"
   - **Receptionist:** "Let me check... yes, we have an opening at 3pm with Lisa"
   - **Odin:** "Perfect, please book that"
   - **Receptionist:** "Can I get a phone number for the appointment?"
   - **Odin:** "Yes, it's [Samuel's number]"
4. Odin confirms booking in user's calendar
5. Sends confirmation to user

**Technical Requirements:**
- **Multi-turn conversation:** Yes (requires conversation state management)
- **Context awareness:** Moderate (needs user preferences, calendar access)
- **Real-time responsiveness:** High (natural phone conversation)
- **Turn detection:** Critical (know when to speak vs listen)

**What's Needed Beyond TTS:**
1. **STT:** Deepgram streaming (low latency, good accuracy)
2. **LLM:** Claude Sonnet 4.5 (reasoning, conversation management)
3. **TTS:** Chatterbox (natural voice)
4. **Phone interface:** Twilio or OpenSIPS
5. **Conversation state:** Track dialogue history, current goal
6. **Calendar integration:** Check availability, create events
7. **Contact management:** Find phone numbers
8. **Turn detection:** VAD or silence detection

**Complexity:** High. This is a full voice agent system, not just TTS.

---

## 2. MacBook Pro Compatibility

### Hardware Requirements

**Original Chatterbox Requirements:**
- **GPU:** NVIDIA RTX 4060 (8GB VRAM) or better
- **CUDA:** Required for original implementation
- **RAM:** 16GB+ system RAM
- **Storage:** 5GB for model weights

**MacBook Pro Specs:**
- **GPU:** Apple Silicon (M1/M2/M3/M4) with unified memory
- **Memory:** 8GB-192GB unified memory (shared between CPU/GPU)
- **Metal/MPS:** Apple's GPU acceleration framework

### Apple Silicon Support Status

**Official Support:** Mixed

**Community Implementations:**

1. **Jimmi42/chatterbox-tts-apple-silicon-code**
   - Hugging Face Space with Apple Silicon adaptation
   - Claims 2-3x faster inference with MPS
   - Fixed MPS tensor allocation errors
   - Requires macOS 12.3+ for MPS support
   - Status: Working but not official

2. **devnen/Chatterbox-TTS-Server**
   - Supports NVIDIA (CUDA), AMD (ROCm), and Apple Silicon (MPS)
   - Automatic device detection with fallback
   - Web UI + API endpoints
   - Status: Production-ready

3. **lorenjphillips/chatterbox-mac-silicon**
   - Optimized for M4 MacBook Pro specifically
   - Gradio web interface
   - ARM64 builds
   - Status: Demo/experimental

**Known Issues:**
- "Placeholder storage has not been allocated on MPS device" errors
- Some implementations auto-fallback to CPU for stability
- Performance varies by model size and Mac specs

### Performance Expectations

**Unified Memory Requirements:**
- **Minimum:** 16GB (8GB for model, 8GB for system)
- **Recommended:** 32GB+ (better multitasking)
- **Ideal:** 64GB+ (can run larger models)

**Inference Speed (estimated):**

| Mac Model | Memory | Tokens/Second | Latency (First Chunk) |
|-----------|--------|---------------|----------------------|
| M1 Base | 16GB | 15-20 tok/s | 500-700ms |
| M2 Pro | 32GB | 25-35 tok/s | 300-500ms |
| M3 Max | 64GB | 40-50 tok/s | 200-300ms |
| M4 Max | 128GB | 50-60 tok/s | 150-250ms |

**Memory Bandwidth Impact:**
- M4: 100 GB/s
- M4 Pro: 200 GB/s
- M4 Max: 400 GB/s
- M5: 153 GB/s (28% faster than M4)

**TTS-specific:** Chatterbox-Turbo (350M parameters) should run well on M3+ with 32GB+ memory.

### Installation on Mac

**Requirements:**
```bash
# Python 3.11+
brew install python@3.11

# PyTorch with MPS support (2.0+)
pip install torch>=2.0.0

# Chatterbox dependencies
pip install transformers accelerate soundfile
```

**Verify MPS:**
```python
import torch
print(f"MPS available: {torch.backends.mps.is_available()}")
print(f"MPS built: {torch.backends.mps.is_built()}")
```

**Run Chatterbox:**
```bash
# Clone Apple Silicon fork
git clone https://github.com/devnen/Chatterbox-TTS-Server
cd Chatterbox-TTS-Server

# Install
pip install -r requirements.txt

# Run (will auto-detect MPS)
python app.py
```

### Pros and Cons

**Pros:**
- No cloud costs (runs locally)
- Full privacy (no data sent to cloud)
- Works offline
- Lower latency (no network round-trip)

**Cons:**
- Not officially supported (community ports)
- Potential stability issues (MPS errors)
- Uses significant battery (not ideal for laptop)
- May slow down other tasks (shared memory)
- Requires 32GB+ memory for good performance

**Verdict:** Possible but not ideal for production. Fine for testing/development.

---

## 3. Cloud GPU Cost Comparison (2026)

### Overview

**$30/month claim:** Too low for 24/7 dedicated GPU hosting.

**Realistic costs:**
- **Entry-level:** $36-50/month (RTX 3060, part-time)
- **Mid-tier:** $130-270/month (RTX 4090, 24/7)
- **High-end:** $1,270-2,183/month (A100/H100, 24/7)

### Provider Comparison

| Provider | GPU | Hourly | Monthly (24/7) | Notes |
|----------|-----|--------|----------------|-------|
| **Budget Tier (Good Enough)** |
| Vast.ai | RTX 3060 12GB | $0.05 | $36.50 | Community cloud, variable availability |
| Vast.ai | RTX 4060 8GB | $0.19 | $138.70 | Sufficient for Chatterbox |
| RunPod | RTX 4090 24GB | $0.34 | $248.20 | Community cloud, overkill for Chatterbox |
| **Mid Tier (Recommended)** |
| RunPod | RTX 4090 | $0.34 | $248.20 | Secure cloud, reliable |
| Lambda Labs | RTX 4090 | N/A | ~$300/month | Enterprise focus, higher prices |
| Fluence | RTX 4090 | $0.44 | $321.20 | Budget-focused |
| **High Tier (Overkill)** |
| RunPod | A100 80GB | $1.74 | $1,270/month | Datacenter GPU, unnecessary |
| Lambda Labs | H100 | $2.99 | $2,183/month | Latest GPU, extreme overkill |
| RunPod | H100 | $1.99 | $1,453/month | Community cloud H100 |

**Storage Costs (RunPod):**
- **Running:** $0.10/GB/month
- **Stopped:** $0.20/GB/month
- **Chatterbox:** ~5GB model = $0.50-1.00/month

### Usage Scenarios

#### Scenario 1: Light Use (1,000 interactions/month)
**Assumptions:**
- 1,000 TTS generations/month
- Average 30 seconds audio per generation
- Total: ~8 hours compute time

**Serverless (Modal):**
- 8 hours × $2.50/hr (A100) = **$20/month**

**24/7 GPU:**
- RTX 3060 at Vast.ai: **$36.50/month** (wastes 99% of capacity)

**Verdict:** Serverless wins

#### Scenario 2: Medium Use (10,000 interactions/month)
**Assumptions:**
- 10,000 TTS generations/month
- Average 30 seconds audio per generation
- Total: ~80 hours compute time

**Serverless (Modal):**
- 80 hours × $2.50/hr = **$200/month**

**Part-time GPU (8hrs/day):**
- RTX 4060 at Vast.ai: $0.19 × 240hrs = **$45.60/month**

**24/7 GPU:**
- RTX 4060: **$138.70/month** (still wastes capacity)

**Verdict:** Part-time GPU with auto-shutdown

#### Scenario 3: Heavy Use (Phone calls + voice assistant)
**Assumptions:**
- Always-on for voice commands
- 50 phone calls/day × 3 min = 150 min/day
- Plus voice commands: ~30 min/day
- Total: ~180 min/day = 90 hours/month actual usage
- But needs to be ready 24/7 for instant response

**Serverless:**
- Cold start: 2-4 seconds (not acceptable for phone calls)
- Warm instances: Extra cost to keep warm
- Not ideal for latency-sensitive use

**24/7 GPU:**
- RTX 4090 at RunPod: **$248/month**
- RTX 4060 at Vast.ai: **$138/month**

**Verdict:** 24/7 GPU required for always-on voice assistant

### Cheapest Options by Use Case

**Development/Testing:**
- **Mac M3/M4 (local):** $0/month
- **Vast.ai RTX 3060 (hourly):** ~$5-10/month

**Low-volume Production:**
- **Modal serverless:** $20-50/month
- **RunPod spot instances:** $30-60/month

**High-volume/Always-on:**
- **Vast.ai RTX 4060 (24/7):** $138/month
- **RunPod RTX 4090 (community):** $248/month

### Cost Optimization Strategies

1. **Auto-shutdown:** Only run GPU when needed (saves 60-80%)
2. **Spot instances:** Use interruptible instances (save 50-70%)
3. **Serverless:** Pay per inference (best for bursty traffic)
4. **Hybrid:** Mac for dev, cloud for production

---

## 4. Serverless TTS Options

### Modal

**Pricing:**
- **A100:** $2.50/hour
- **RTX 4090:** Not listed (focuses on datacenter GPUs)
- **Free tier:** $30/month compute credits

**Deployment:**
```python
import modal

stub = modal.Stub("chatterbox-tts")

@stub.function(
    gpu="A100",
    image=modal.Image.debian_slim()
        .pip_install("torch", "transformers", "chatterbox")
)
def synthesize(text: str) -> bytes:
    # Load model (cached after first run)
    from chatterbox import ChatterboxTTS
    model = ChatterboxTTS.from_pretrained("resemble-ai/chatterbox-turbo")

    # Generate audio
    audio = model.generate(text)
    return audio

# Call from anywhere
audio = synthesize.remote("Hello, this is Odin")
```

**Cold Start:** 2-4 seconds (first request)
**Warm Start:** <100ms (subsequent requests)

**Pros:**
- Pay only for compute time
- Automatic scaling
- Good for bursty traffic
- $30/month free tier

**Cons:**
- Cold start latency
- Higher cost for continuous use
- A100 overkill for Chatterbox

**Best for:** Development, low-volume production

### Replicate

**Pricing:**
- **Per-second billing** (varies by GPU)
- Premium GPUs: higher cost per second
- No free tier

**Deployment:**
```python
import replicate

# Deploy custom model
replicate.models.create(
    owner="username",
    name="chatterbox-tts",
    visibility="private"
)

# Run inference
output = replicate.run(
    "username/chatterbox-tts",
    input={"text": "Hello from Odin"}
)
```

**Cold Start:** 60+ seconds (slow)
**Warm Start:** Variable

**Pros:**
- Easy deployment
- Pre-trained model marketplace
- API-first design

**Cons:**
- Expensive at scale
- Slow cold starts
- Vendor lock-in
- Higher pricing than Modal

**Best for:** Quick prototyping, pre-built models

### RunPod Serverless

**Pricing:**
- **A100 80GB:** $2.17/hr (Flex worker)
- **H100 80GB:** $4.47/hr (Flex worker)
- Pay per second of actual use

**Deployment:**
```bash
# Create serverless endpoint
runpod serverless create \
  --name chatterbox-tts \
  --gpu-type "NVIDIA A100" \
  --image your-docker-image

# Call API
curl -X POST https://api.runpod.ai/v2/your-endpoint/runsync \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"input": {"text": "Hello"}}'
```

**Cold Start:** ~5 seconds
**Warm Start:** <200ms

**Pros:**
- Cheaper than Modal for high volume
- Good cold start times
- Flexible GPU options

**Cons:**
- More setup required
- Need to build Docker images
- Less polished than Modal

**Best for:** Production serverless, cost-sensitive deployments

### Together.ai

**TTS Models Available:**
- Fish Speech TTS (300+ voices)
- MiniMax Speech 2.6 Turbo (<250ms latency)
- Orpheus and Kokoro (WebSocket streaming)
- Rime models (40+ voices)

**Pricing:** Not publicly disclosed for TTS
- Likely $4-20 per million characters (industry standard)
- Need to contact sales for exact pricing

**Deployment:**
```python
from together import Together

client = Together(api_key="YOUR_API_KEY")

audio = client.speech.create(
    model="fish-speech",
    voice="en-male-1",
    input="Hello from Odin"
)
```

**Pros:**
- Managed service (no infrastructure)
- Multiple TTS models
- WebSocket streaming support
- Fast inference

**Cons:**
- No Chatterbox support (different models)
- Pricing not transparent
- Vendor lock-in

**Best for:** If switching away from Chatterbox to other TTS models

---

## 5. Recommended Deployment Strategy

### For Development (Now)

**Option:** Run locally on MacBook Pro M3/M4

**Setup:**
```bash
git clone https://github.com/devnen/Chatterbox-TTS-Server
cd Chatterbox-TTS-Server
pip install -r requirements.txt
python app.py
```

**Pros:**
- Free
- Fast iteration
- Privacy
- Offline capable

**Cons:**
- Not production-ready
- Drains battery
- Potential MPS issues

**Cost:** $0/month

### For Light Production (<1000 requests/month)

**Option:** Modal serverless

**Setup:**
```bash
modal setup
modal deploy chatterbox_modal.py
```

**Usage:**
```python
from modal import Function

tts = Function.lookup("chatterbox-tts", "synthesize")
audio = tts.remote("Hello from Odin")
```

**Pros:**
- Pay per use
- $30/month free tier
- Auto-scaling
- No infrastructure

**Cons:**
- Cold start latency
- Not ideal for real-time phone calls

**Cost:** $0-50/month (within free tier for light use)

### For Voice Assistant (Always-On)

**Option:** 24/7 GPU on Vast.ai or RunPod

**GPU Choice:** RTX 4060 8GB or RTX 4090 24GB

**Setup:**
1. Create instance on Vast.ai/RunPod
2. Deploy Chatterbox-TTS-Server with Docker
3. Expose API endpoint
4. Add monitoring/auto-restart

**Pros:**
- Low latency (<200ms)
- Always ready
- Predictable costs

**Cons:**
- $138-248/month
- Overprovisioned for light use

**Cost:** $138-248/month

### For Phone Calls (High Volume)

**Option:** Hybrid approach

**Architecture:**
1. **Mac for development:** Local testing, no cost
2. **Modal for overflow:** Handle spikes, pay per use
3. **RunPod 24/7 for always-on:** Base capacity, predictable cost

**Setup:**
```python
# Route requests intelligently
async def synthesize(text: str) -> bytes:
    if local_server_available():
        return await local_tts.generate(text)
    elif current_load < threshold:
        return await runpod_tts.generate(text)
    else:
        return await modal_tts.generate(text)
```

**Pros:**
- Cost-efficient
- Redundancy
- Handles load spikes

**Cons:**
- Complex to manage
- Multiple failure points

**Cost:** $138/month (RunPod) + $20-50/month (Modal overflow) = **$158-188/month**

### Hybrid Strategy (Recommended)

**Phase 1: Development (Now)**
- Mac M3/M4 local deployment
- Cost: $0/month

**Phase 2: Testing (1-2 months)**
- Modal serverless for external testing
- Cost: $0-30/month (free tier)

**Phase 3: Production (3+ months)**
- RunPod RTX 4060 24/7: $138/month
- Modal overflow: $20-50/month
- **Total: $158-188/month**

**Failover Logic:**
```python
class HybridTTSService:
    def __init__(self):
        self.local = LocalChatterbox()  # Mac
        self.cloud = RunPodChatterbox()  # 24/7 GPU
        self.overflow = ModalChatterbox()  # Serverless

    async def synthesize(self, text: str) -> bytes:
        # Try local first (if Mac available)
        if self.local.available():
            try:
                return await self.local.generate(text)
            except Exception:
                pass  # Fall through

        # Try 24/7 cloud instance
        try:
            return await self.cloud.generate(text)
        except Exception:
            pass  # Fall through

        # Fall back to serverless
        return await self.overflow.generate(text)
```

---

## 6. Cost Summary Table

| Deployment Option | Setup Cost | Monthly Cost | Latency | Best For |
|-------------------|------------|--------------|---------|----------|
| **Mac M3/M4 (Local)** | $0 | $0 | 200-500ms | Development, testing |
| **Modal Serverless** | $0 | $0-50 | 150ms (warm) | Light production, spikes |
| **Vast.ai RTX 3060** | $0 | $36.50 (24/7) | 200-300ms | Budget always-on |
| **Vast.ai RTX 4060** | $0 | $138.70 (24/7) | 150-250ms | Production always-on |
| **RunPod RTX 4090** | $0 | $248.20 (24/7) | 100-200ms | High performance |
| **Hybrid (Mac + Cloud)** | $0 | $158-188 | 150-300ms | Production with redundancy |
| **OpenAI Realtime API** | $0 | $90 (300 min) | 500ms total | Phone calls (STT+TTS+LLM) |

**Cheapest Option for Phone Calls:**
- OpenAI Realtime API: **$90/month** (includes STT+TTS, no GPU needed)

**Cheapest Option for Always-On Voice:**
- Chatterbox on Vast.ai RTX 4060: **$138/month** (TTS only, need separate STT)

**Most Cost-Effective:**
- Hybrid (Mac local + Modal overflow): **$0-50/month** for light use
- OpenAI Realtime API: **$90/month** for moderate phone use (simplest)

---

## 7. Comparison: Chatterbox vs OpenAI Realtime API

### Feature Comparison

| Feature | Chatterbox (Self-Hosted) | OpenAI Realtime API |
|---------|--------------------------|---------------------|
| **Cost** | $138-248/month (24/7 GPU) | $90/month (300 min) |
| **Latency** | 150-200ms (TTS only) | 500ms (STT+TTS+LLM) |
| **Voice Quality** | High (350M params) | High (proprietary) |
| **Privacy** | Full (self-hosted) | Data sent to OpenAI |
| **Offline** | Yes (if local) | No (cloud only) |
| **Setup Complexity** | High (GPU, STT, LLM) | Low (single API) |
| **Turn Detection** | Manual (VAD required) | Automatic (built-in) |
| **Interruption** | Manual implementation | Built-in |
| **Voices** | Limited (open-source) | Multiple (ChatGPT voices) |
| **Streaming** | Yes (WebSocket) | Yes (WebSocket) |
| **Best For** | Privacy, cost optimization | Simplicity, phone calls |

### When to Use Chatterbox

**Choose Chatterbox if:**
- Privacy is critical (can't send audio to cloud)
- High volume (>1000 min/month, self-hosting cheaper)
- Already have GPU infrastructure
- Need specific voice characteristics
- Want full control over TTS pipeline

**Cost breakeven:** ~400 minutes/month ($120 for OpenAI vs $138 for Chatterbox 24/7)

### When to Use OpenAI Realtime API

**Choose OpenAI Realtime API if:**
- Need phone call capability (includes STT+TTS+LLM)
- Want lowest implementation complexity
- Need automatic turn detection/interruption
- Medium usage (<500 min/month)
- Prefer managed service over infrastructure

**Current Odin Decision (ADR-004):**
- OpenAI Realtime API for Phase 6 (voice interface)
- Reason: Simplicity, proven technology, acceptable cost

### Recommendation for Odin

**Short-term (Phase 6 - Voice Interface):**
- Use OpenAI Realtime API as planned in ADR-004
- Cost: $90-150/month
- Rationale: Fastest to implement, lowest complexity

**Long-term (Phase 7 - Phone Calls):**
- Evaluate Chatterbox for cost optimization if usage >500 min/month
- Hybrid approach: OpenAI for general voice, Chatterbox for phone calls
- Cost: $90 (OpenAI) + $50 (Modal serverless Chatterbox) = $140/month

**Future (Phase 8+):**
- If privacy becomes priority, migrate to fully local (Mac + Whisper + Chatterbox)
- Cost: $0/month (local only)
- Tradeoff: Higher complexity, requires Mac always on

---

## 8. Implementation Roadmap

### Phase 6: Voice Interface (Jul 2026) - OpenAI Realtime API

**Stick with current plan (ADR-004):**
- OpenAI Realtime API for voice I/O
- Bluetooth headset button activation
- Route through Odin intelligence core

**Rationale:** Proven, simple, fast to implement

**Cost:** $90-150/month

### Phase 7: Phone Calls (Aug 2026) - Evaluate Chatterbox

**Setup:**
1. Test Chatterbox on Mac M3/M4 (local dev)
2. Deploy Chatterbox to Modal serverless
3. Integrate with Twilio Media Streams
4. Add Deepgram STT

**Architecture:**
```
Twilio → Deepgram STT → Claude LLM → Chatterbox TTS → Twilio
```

**Cost:**
- Twilio: $5/month (100 calls)
- Deepgram: $1.29/month (300 min)
- Claude: $10-20/month (LLM)
- Chatterbox: $20-50/month (Modal serverless)
- **Total: $36-76/month** (vs $95 with OpenAI Realtime API)

**Decision Point:** If phone usage >100 calls/month, Chatterbox saves money

### Phase 8: Always-On Voice Assistant (Sep 2026) - Hybrid

**Setup:**
1. Deploy Chatterbox to RunPod RTX 4060 (24/7)
2. Add Mac local fallback (when available)
3. Add Modal serverless overflow

**Cost:**
- RunPod 24/7: $138/month
- Modal overflow: $20-50/month
- **Total: $158-188/month**

**Benefit:** Full privacy option (can disconnect cloud, use Mac only)

---

## 9. Final Recommendations

### For Phone Calls (User's Question 1)

**Yes, Chatterbox can be used for phone calls.**

**Architecture:**
- OpenSIPS AI Voice Connector (self-hosted SIP)
- OR Twilio Media Streams (managed service)
- Requires: STT (Deepgram/Whisper) + LLM (Claude) + Chatterbox TTS

**Cost:** $36-76/month (100 calls/month)

**Complexity:** High (need to manage multiple services)

**Alternative:** OpenAI Realtime API at $95/month (simpler, includes STT+TTS+LLM)

**Recommendation:**
- **Start:** OpenAI Realtime API (simpler)
- **Later:** Migrate to Chatterbox if cost/privacy matters

### For MacBook Pro (User's Question 2)

**Yes, Chatterbox works on Apple Silicon (M1/M2/M3/M4).**

**Requirements:**
- 32GB+ unified memory (recommended)
- macOS 12.3+ (for MPS support)
- PyTorch 2.0+ with MPS

**Performance:**
- M3 Max / M4 Max: 200-300ms latency (acceptable)
- M1 / M2 Base: 500-700ms latency (marginal)

**Limitations:**
- Community ports (not official support)
- Potential stability issues (MPS errors)
- Uses significant resources (not great for laptop)

**Recommendation:**
- **Development:** Yes, use Mac for testing
- **Production:** No, use cloud GPU for reliability

### For Cloud GPU Costs (User's Question 3)

**No, $30/month is not accurate for 24/7 hosting.**

**Realistic Costs:**
- **Budget:** $36.50/month (RTX 3060, sufficient)
- **Recommended:** $138/month (RTX 4060, reliable)
- **High-end:** $248/month (RTX 4090, overkill)

**Cost Optimization:**
- **Light use:** Modal serverless ($0-50/month)
- **Medium use:** Part-time GPU with auto-shutdown ($45-60/month)
- **Heavy use:** 24/7 GPU ($138-248/month)

**Comparison:**
- OpenAI Realtime API: $90/month (300 min, simpler)
- Chatterbox 24/7: $138/month (TTS only, need separate STT/LLM)

**Recommendation:**
- **For phone calls <300 min/month:** OpenAI Realtime API ($90/month)
- **For heavy phone use >500 min/month:** Chatterbox on Vast.ai ($138/month)
- **For development only:** Mac local ($0/month)

---

## 10. Action Items

### Immediate (This Week)

1. Test Chatterbox on Mac M3/M4
   - Install from devnen/Chatterbox-TTS-Server
   - Measure latency and quality
   - Verify MPS stability

2. Estimate actual voice usage
   - How many phone calls/month?
   - How many voice commands/day?
   - Calculate cost for OpenAI vs Chatterbox

### Short-term (This Month)

3. Prototype Twilio + Chatterbox integration
   - Set up Twilio Media Streams
   - Connect Deepgram STT
   - Test end-to-end latency

4. Deploy to Modal serverless
   - Test cold start times
   - Measure cost per request
   - Compare to OpenAI Realtime API

### Long-term (Next Quarter)

5. Implement hybrid strategy if needed
   - Mac local for dev
   - Modal serverless for production (light use)
   - RunPod 24/7 if usage >500 min/month

6. Update ADR-004 if switching from OpenAI
   - Document cost analysis
   - Architecture changes
   - Privacy benefits

---

## References

**Chatterbox TTS:**
- [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox)
- [Chatterbox-TTS-Server](https://github.com/devnen/Chatterbox-TTS-Server)
- [Chatterbox Apple Silicon](https://huggingface.co/spaces/Jimmi42/chatterbox-tts-apple-silicon)

**Phone Call Integration:**
- [OpenSIPS AI Voice Connector](https://github.com/OpenSIPS/opensips-ai-voice-connector-ce)
- [Twilio Media Streams Documentation](https://www.twilio.com/docs/voice/twiml/stream)
- [Building AI Phone Agents with Twilio](https://medium.com/@alozie_igbokwe/building-an-ai-phone-agent-with-twilio-and-openais-realtime-api-python-bc2f9a8df065)

**Cloud GPU Providers:**
- [RunPod Pricing](https://www.runpod.io/pricing)
- [Vast.ai Pricing](https://vast.ai/pricing)
- [Modal Pricing](https://modal.com/pricing)
- [GPU Price Comparison 2026](https://getdeploying.com/gpus)

**Apple Silicon:**
- [Apple Silicon vs NVIDIA for AI](https://scalastic.io/en/apple-silicon-vs-nvidia-cuda-ai-2025/)
- [MLX Performance on M5](https://machinelearning.apple.com/research/exploring-llms-mlx-m5)

**Cost Comparisons:**
- [Cheapest Cloud GPU Providers 2026](https://northflank.com/blog/cheapest-cloud-gpu-providers)
- [Serverless GPU Platforms](https://www.koyeb.com/blog/best-serverless-gpu-platforms-for-ai-apps-and-inference-in-2026)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-16
**Next Review:** 2026-02-16 (after Phase 6 voice interface implementation)
