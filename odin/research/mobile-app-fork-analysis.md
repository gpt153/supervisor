# Mobile App Fork Analysis for Odin Voice Interface

**Date:** 2026-01-16
**Purpose:** Research open-source mobile apps that can be forked/modified for Odin's voice interface
**Context:** Building an AI assistant that needs voice calling, text chat, Android support, and Bluetooth headset integration

---

## Executive Summary

After extensive research, **forking an existing open-source chat app is feasible but presents significant challenges**. The best approach depends on your priorities:

**Quick Recommendation:**
- **For fastest time-to-market:** Use Linphone SDK with custom wrapper app
- **For most polished UX:** Fork Signal Android (highest quality, but GPL license restrictions)
- **For easiest modification:** Build lightweight custom app using Pipecat/LLMRTC frameworks
- **For enterprise features:** Fork Mattermost Mobile (React Native, but complex architecture)

**Key Insight:** Most existing apps are designed for peer-to-peer or server-based calling. Repurposing them to call an AI API endpoint is doable but requires understanding their signaling architecture.

---

## 1. Mattermost Mobile - Detailed Analysis

### Overview
- **License:** Apache 2.0 / MIT (dual license for server/mobile)
- **Architecture:** React Native
- **Voice Implementation:** WebRTC via Calls plugin
- **GitHub:** https://github.com/mattermost/mattermost-mobile
- **Status:** Actively maintained (100,000+ lines of code)

### Voice Calling Architecture

**Current Implementation:**
- Calls functionality via `mattermost-plugin-calls`
- WebRTC-based peer-to-peer or server-routed calls
- Three deployment modes:
  1. **Standalone:** WebRTC integrated in plugin
  2. **Dedicated rtcd service:** External WebRTC routing (Enterprise)
  3. **High Availability:** Distributed across cluster nodes

**Technical Stack:**
- React Native for mobile app
- WatermelonDB for state management (replaced Redux)
- TypeScript for type safety
- WebRTC via `react-native-webrtc` library (M124 revision)

### Feasibility for Odin Integration

**Pros:**
- ✅ Apache 2.0 license allows commercial modification
- ✅ React Native = single codebase for iOS + Android
- ✅ Mature WebRTC implementation
- ✅ Already has text chat + voice calling
- ✅ Active development and community

**Cons:**
- ❌ Very complex architecture (100k+ lines of code)
- ❌ Requires Mattermost server backend (or significant refactoring)
- ❌ Calls plugin expects SIP/WebRTC signaling, not HTTP API
- ❌ Overbuilt for simple AI assistant use case
- ❌ Steep learning curve for modification

### Modification Strategy

To repurpose for Odin:

1. **Replace rtcd service** with Odin API endpoint
2. **Modify call signaling** to initiate calls to Odin instead of peers
3. **Strip out** multi-server, channels, teams features
4. **Simplify state management** (remove unnecessary sync logic)
5. **Add audio streaming** to/from Odin's real-time API

**Estimated Effort:** 6-8 weeks for experienced React Native developer

**Risk Level:** Medium-High (complex architecture, potential hidden dependencies)

---

## 2. Signal Android - Detailed Analysis

### Overview
- **License:** GPLv3
- **Architecture:** Native Android (Kotlin/Java)
- **Voice Implementation:** RingRTC (custom WebRTC middleware)
- **GitHub:** https://github.com/signalapp/Signal-Android
- **Status:** Actively maintained, high quality

### Voice Calling Architecture

**RingRTC Middleware:**
- Custom middleware built on WebRTC
- End-to-end encrypted using Signal Protocol
- Handles call setup via Signal messaging channel
- Excellent call quality and reliability

**Audio Routing:**
- Mature Bluetooth headset support (after fixing historical issues)
- CallKit integration on iOS (native Android equivalents)
- Background operation and push notifications

### Feasibility for Odin Integration

**Pros:**
- ✅ Best-in-class voice quality
- ✅ Excellent Bluetooth support
- ✅ Proven reliability at scale (millions of users)
- ✅ Native Android = optimal performance
- ✅ Clean, well-documented codebase

**Cons:**
- ❌ **GPLv3 license = must keep modifications open source**
- ❌ Native code = separate iOS implementation needed
- ❌ RingRTC tightly coupled to Signal Protocol
- ❌ Requires understanding encryption stack even if not using it
- ❌ May be overkill for non-secure AI assistant

### Modification Strategy

1. **Replace RingRTC signaling** with HTTP/WebSocket to Odin
2. **Keep WebRTC audio streaming** (high quality)
3. **Remove encryption** (unless Odin requires it)
4. **Simplify call setup** (no peer discovery needed)
5. **Maintain Bluetooth integration** (already excellent)

**Estimated Effort:** 8-10 weeks (native code complexity, dual platform)

**Risk Level:** Medium (license restrictions, encryption coupling)

**License Consideration:** GPLv3 means any distribution requires publishing source code

---

## 3. Element (Matrix) - Detailed Analysis

### Overview
- **License:** Apache 2.0
- **Architecture:** Element X uses native frameworks (Swift/Kotlin), NOT React Native
- **Voice Implementation:** Element Call (WebRTC + LiveKit)
- **GitHub:** https://github.com/element-hq/element-call
- **Status:** Actively maintained, Matrix 2.0

### Voice Calling Architecture

**Element Call:**
- Native Matrix VoIP using MSC3401 spec
- Full mesh (8 participants max) or LiveKit for scale (100+)
- End-to-end encrypted group calls
- WebRTC-based with CallKit support

**Mobile Integration:**
- Element X uses Rust core (matrix-rust-sdk)
- Swift for iOS, Kotlin for Android
- Widget embedding for calls

### Feasibility for Odin Integration

**Pros:**
- ✅ Apache 2.0 license (permissive)
- ✅ Modern architecture (Rust + native UI)
- ✅ Excellent call quality
- ✅ CallKit integration (iOS) and equivalents
- ✅ Built for extensibility

**Cons:**
- ❌ Rust core = steeper learning curve
- ❌ Matrix protocol tightly integrated
- ❌ Requires understanding decentralized signaling
- ❌ Separate iOS/Android codebases
- ❌ Widget architecture may be overkill

### Modification Strategy

1. **Replace Matrix signaling** with Odin API
2. **Keep WebRTC streaming** layer
3. **Remove federation** and room/server concepts
4. **Simplify to 1:1 calls** (user ↔ Odin)
5. **Maintain native integrations**

**Estimated Effort:** 10-12 weeks (Rust + native platforms)

**Risk Level:** High (complex protocol stack, Rust expertise needed)

---

## 4. Jami - Detailed Analysis

### Overview
- **License:** GPLv3
- **Architecture:** C++ core with platform wrappers
- **Voice Implementation:** Peer-to-peer via OpenDHT
- **GitHub:** Multiple repositories under jami.net
- **Status:** Actively maintained

### Voice Calling Architecture

**Distributed P2P:**
- OpenDHT for peer discovery (no central server)
- PJSIP for SIP protocol
- WebRTC for media streaming
- X.509 certificates for identity

**Technical Stack:**
- C++ core (LibRing)
- Platform-specific wrappers (Android/iOS/Desktop)
- ZRTP/SRTP for encryption

### Feasibility for Odin Integration

**Pros:**
- ✅ Designed for serverless operation
- ✅ Excellent call quality
- ✅ Cross-platform C++ core
- ✅ Mature Bluetooth support

**Cons:**
- ❌ **GPLv3 license = must open source modifications**
- ❌ DHT architecture incompatible with API endpoint
- ❌ C++ complexity for mobile developers
- ❌ Designed for P2P, not client-server
- ❌ Heavy engineering lift to strip out DHT

### Modification Strategy

Major architectural changes needed:

1. **Remove OpenDHT** entirely (used for peer discovery)
2. **Replace P2P signaling** with HTTP/WS to Odin
3. **Keep PJSIP stack** for audio handling
4. **Simplify identity** (no X.509 needed)
5. **Maintain C++ core** but modify wrappers

**Estimated Effort:** 12-16 weeks (deep C++ work)

**Risk Level:** Very High (fundamental architecture change)

---

## 5. Linphone - Detailed Analysis

### Overview
- **License:** GPLv3 (or proprietary dual license)
- **Architecture:** C++ SDK (liblinphone) with platform wrappers
- **Voice Implementation:** SIP-based VoIP
- **GitHub:** https://github.com/BelledonneCommunications/linphone-android
- **Status:** Actively maintained, commercial backing

### Voice Calling Architecture

**SIP Stack:**
- Full SIP protocol implementation
- Compatible with standard SIP servers (Asterisk, Kamailio, etc.)
- SRTP/ZRTP encryption
- H.264/VP8 video codecs

**Customization Features:**
- Remote configuration for server settings
- Branding and UI customization
- Plugin architecture
- Push notification support

### Feasibility for Odin Integration

**Pros:**
- ✅ **Dual license available** (can keep modifications private)
- ✅ SDK designed for integration
- ✅ Excellent SIP compatibility
- ✅ Commercial support available
- ✅ Well-documented customization

**Cons:**
- ❌ SIP protocol overhead (designed for phone calls)
- ❌ Requires understanding SIP signaling
- ❌ May need to mock SIP server responses
- ❌ Proprietary license costs money
- ❌ UI requires significant rework for chat

### Modification Strategy

**Two Approaches:**

**Option A: Use Linphone SDK Only**
1. Build custom Android app
2. Use liblinphone for audio streaming
3. Configure "SIP server" to be Odin API
4. Handle call routing via custom bridge

**Option B: Fork Linphone App**
1. Keep Linphone UI framework
2. Replace SIP backend with Odin connector
3. Add chat interface
4. Customize branding

**Estimated Effort:**
- Option A: 4-6 weeks
- Option B: 8-10 weeks

**Risk Level:** Low-Medium (well-documented, commercial support)

**License Consideration:** Proprietary license needed to keep modifications closed

---

## 6. Alternative: Custom App with Open Source Frameworks

### Modern Voice AI Frameworks (2026)

Instead of forking a complete app, use specialized frameworks:

### **Pipecat Framework**
- **License:** Open source (Apache 2.0)
- **GitHub:** https://github.com/pipecat-ai/pipecat
- **Features:**
  - Built for voice AI agents
  - React Native SDK available
  - WebRTC and WebSocket support
  - Ultra-low latency
  - Provider agnostic (OpenAI, Anthropic, etc.)

**Pros:**
- ✅ **Purpose-built for voice AI assistants**
- ✅ React Native = single codebase
- ✅ Active development (backed by Daily)
- ✅ Minimal overhead
- ✅ Easy Odin integration

**Cons:**
- ❌ Need to build UI from scratch
- ❌ Less mature than chat apps
- ❌ Community still growing

### **LLMRTC Framework**
- **Architecture:** WebRTC with server-side VAD
- **Features:**
  - Provider agnostic
  - Real-time voice streaming
  - Swappable AI backends

### **OpenSIPS AI Voice Connector**
- **License:** GPLv3
- **GitHub:** https://github.com/OpenSIPS/opensips-ai-voice-connector-ce
- **Features:**
  - Direct OpenAI Realtime API integration
  - SIP interface to AI engines
  - Can call AI via any SIP-compatible system

**Use Case:**
- Users call Odin via SIP (like phone call)
- OpenSIPS routes audio to OpenAI/Anthropic
- Perfect for "call your AI assistant" model

**Pros:**
- ✅ **Designed exactly for AI voice agents**
- ✅ Production-ready bridge between VoIP and AI
- ✅ No modification needed, just configuration

**Cons:**
- ❌ Requires SIP client app (Linphone, etc.)
- ❌ GPLv3 license
- ❌ Python backend complexity

---

## Recommended Approaches (Ranked)

### 🥇 Option 1: Linphone SDK + Custom Wrapper (RECOMMENDED)

**Approach:**
- Use Linphone SDK (liblinphone) for audio/video
- Build lightweight React Native or native Android app
- Custom UI for chat + voice interface
- Configure SIP to route to Odin API bridge

**Pros:**
- Fastest time to market (4-6 weeks)
- Professional-grade audio quality
- Bluetooth headset support included
- Can choose license (GPL or proprietary)
- SDK handles complexity

**Cons:**
- Need to understand SIP basics
- May require small bridge server to translate SIP ↔ Odin API
- UI built from scratch

**Best For:** Getting to market quickly with professional quality

---

### 🥈 Option 2: Pipecat Framework + Custom App

**Approach:**
- Use Pipecat React Native SDK
- Build chat + voice interface
- Direct integration with Odin API
- WebRTC for audio streaming

**Pros:**
- Purpose-built for voice AI
- Modern, clean architecture
- Active development
- Provider agnostic
- No legacy cruft

**Cons:**
- Framework relatively new (less battle-tested)
- Full UI development needed
- Smaller community

**Best For:** Modern tech stack, flexibility, long-term maintainability

---

### 🥉 Option 3: Fork Mattermost Mobile (Simplified)

**Approach:**
- Fork Mattermost Mobile
- Strip out server-dependent features
- Replace Calls plugin with Odin connector
- Simplify state management

**Pros:**
- Complete app (chat + calls)
- React Native (cross-platform)
- Apache 2.0 license
- Proven architecture

**Cons:**
- Significant refactoring needed (6-8 weeks)
- Complex codebase
- May carry unnecessary weight

**Best For:** Teams with React Native expertise, need full-featured chat

---

### 🎯 Option 4: OpenSIPS + Linphone (Hybrid)

**Approach:**
- Use OpenSIPS AI Voice Connector as backend bridge
- Use Linphone Android as client app
- Add custom chat UI on top of Linphone
- OpenSIPS handles VoIP ↔ AI translation

**Pros:**
- Leverage existing AI voice infrastructure
- No custom audio code needed
- Linphone handles all VoIP
- Can use OpenAI Realtime API directly

**Cons:**
- Requires running OpenSIPS server
- GPLv3 license on OpenSIPS
- Two components to maintain

**Best For:** Leveraging existing AI infrastructure, phone-like experience

---

## Technical Deep Dive: Audio Streaming Architecture

### How Current Apps Work (Peer-to-Peer)

```
[User A App] --WebRTC signaling--> [Signaling Server]
                                          |
                                          v
[User B App] <--WebRTC signaling-- [Signaling Server]

[User A] <======== Direct RTP/SRTP Audio ========> [User B]
```

### How Odin Integration Would Work

```
[Odin App] --WebSocket/HTTP--> [Odin API Gateway]
                                      |
                                      v
                                [Odin AI Backend]
                                (STT → LLM → TTS)

[User] <====== Audio Stream ======> [Odin Backend]
        (User speech → Odin)
        (Odin TTS → User)
```

### Key Differences

1. **Signaling:** Instead of SIP/WebRTC peer negotiation, simple HTTP/WS handshake
2. **Media:** Instead of peer-to-peer RTP, stream to Odin server endpoint
3. **Direction:** Bidirectional (user speaks, Odin responds in real-time)
4. **Protocol:** Could use WebRTC, WebSockets, or custom UDP

### Audio Format Considerations

**WebRTC (Recommended):**
- Opus codec (low latency, high quality)
- Built-in jitter buffer
- Network adaptation
- Echo cancellation

**WebSocket:**
- PCM/Opus streaming
- Lower overhead
- Simpler implementation
- Requires manual jitter handling

**Odin API Requirements:**
- Input: 16kHz/48kHz PCM or Opus
- Output: TTS stream (likely PCM or Opus)
- Latency target: <500ms round-trip

---

## Bluetooth Headset Integration

All analyzed apps support Bluetooth headsets, but with varying quality:

### Best Bluetooth Support
1. **Signal:** Mature, well-tested (after fixing historical issues)
2. **Linphone:** Professional-grade, tested with business headsets
3. **Element X:** CallKit integration (iOS standard)

### Key Features Needed
- ✅ Auto-routing to Bluetooth when connected
- ✅ Headset button controls (answer/hang up)
- ✅ A2DP profile support (Aftershokz compatibility)
- ✅ Background operation
- ✅ Voice assistant integration

### Android Bluetooth Stack

Most apps use Android's built-in AudioManager:
```java
AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
am.setMode(AudioManager.MODE_IN_COMMUNICATION);
am.setSpeakerphoneOn(false); // Use Bluetooth
am.setBluetoothScoOn(true);
```

Linphone SDK handles this automatically, which is a significant advantage.

---

## Push Notifications & Background Operation

### Requirements for Odin

1. **Incoming Call Notification:** When Odin wants to contact user
2. **Message Notification:** For text-based interactions
3. **Background Voice:** Keep call active when screen off

### Implementation Approaches

**Firebase Cloud Messaging (FCM):**
- Standard for Android push notifications
- All analyzed apps use FCM
- Odin backend would send FCM push
- App wakes up and initiates call

**Background Services:**
- Android foreground service for active calls
- Wake locks to prevent sleep
- Battery optimization exemption

**Example (from Mattermost):**
```javascript
// React Native implementation
PushNotification.configure({
  onNotification: function(notification) {
    if (notification.type === 'call') {
      initiateCall(notification.data.callId);
    }
  }
});
```

All four main options (Mattermost, Signal, Element, Linphone) have proven push notification systems.

---

## Estimated Effort & Cost Summary

| Approach | Time | Complexity | Cost (Licensing) | Risk |
|----------|------|------------|------------------|------|
| **Linphone SDK + Custom** | 4-6 weeks | Low | $0-5k (proprietary) | Low |
| **Pipecat Framework** | 6-8 weeks | Medium | $0 | Medium |
| **Fork Mattermost** | 6-8 weeks | High | $0 | Medium |
| **Fork Signal** | 8-10 weeks | High | $0 (but GPLv3) | Medium |
| **Fork Element** | 10-12 weeks | Very High | $0 | High |
| **Fork Jami** | 12-16 weeks | Very High | $0 (but GPLv3) | Very High |
| **OpenSIPS + Linphone** | 6-8 weeks | Medium | $0-5k | Medium |

*Time estimates assume one experienced mobile developer*

---

## Architecture Diagram: Recommended Approach (Linphone SDK)

```
┌─────────────────────────────────────────────────────────────┐
│                      Odin Mobile App                         │
│                   (React Native/Native)                      │
│                                                              │
│  ┌────────────────┐              ┌──────────────────────┐  │
│  │   Chat UI      │              │   Voice Call UI       │  │
│  │  (Custom)      │              │   (Custom)            │  │
│  └────────────────┘              └──────────────────────┘  │
│         │                                  │                 │
│         │                                  │                 │
│  ┌──────▼────────────────────────────────▼─────────────┐  │
│  │         Odin API Client (Custom)                     │  │
│  │  - HTTP/WebSocket for chat                           │  │
│  │  - Call initiation                                   │  │
│  │  - Authentication                                    │  │
│  └──────┬────────────────────────────────┬─────────────┘  │
│         │                                 │                 │
│         │                                 │                 │
│  ┌──────▼─────────────────┐       ┌──────▼─────────────┐  │
│  │  React Native Bridge   │       │   Linphone SDK     │  │
│  │                        │       │  (liblinphone)     │  │
│  └────────────────────────┘       └──────┬─────────────┘  │
│                                            │                │
│                                    ┌───────▼────────┐      │
│                                    │ Audio Subsystem│      │
│                                    │ - Bluetooth     │      │
│                                    │ - Speaker       │      │
│                                    │ - Microphone    │      │
│                                    └────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Internet
                           │
            ┌──────────────▼──────────────┐
            │     SIP Bridge Server       │
            │  (Translates SIP ↔ HTTP)    │
            └──────────────┬──────────────┘
                           │
                           │ HTTP/WebSocket
                           │
            ┌──────────────▼──────────────┐
            │      Odin API Gateway        │
            └──────────────┬──────────────┘
                           │
            ┌──────────────▼──────────────┐
            │      Odin AI Backend         │
            │   (STT → LLM → TTS)         │
            └──────────────────────────────┘
```

### Data Flow

**Text Chat:**
1. User types message → Odin API (HTTP)
2. Odin responds → Push to app (FCM)
3. App displays response

**Voice Call:**
1. User taps "Call Odin"
2. App initiates SIP call via Linphone SDK
3. SIP Bridge translates to HTTP/WS → Odin API
4. Odin streams TTS audio back
5. Linphone SDK plays audio via Bluetooth/speaker
6. User speaks → Linphone captures → SIP → Bridge → Odin STT
7. Bidirectional conversation continues

---

## Alternative Architecture: Direct WebRTC (Pipecat)

```
┌─────────────────────────────────────────────────────────────┐
│                      Odin Mobile App                         │
│                   (React Native + Pipecat SDK)               │
│                                                              │
│  ┌────────────────┐              ┌──────────────────────┐  │
│  │   Chat UI      │              │   Voice Call UI       │  │
│  └────────────────┘              └──────────────────────┘  │
│         │                                  │                 │
│  ┌──────▼──────────────────────────────────▼─────────────┐  │
│  │         Pipecat SDK                                   │  │
│  │  - WebRTC audio streaming                             │  │
│  │  - Voice activity detection                           │  │
│  │  - Direct AI provider integration                     │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│                  ┌──────▼─────────┐                          │
│                  │ Audio Subsystem│                          │
│                  │ - Bluetooth     │                          │
│                  └────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ WebRTC/WebSocket
                         │
          ┌──────────────▼──────────────┐
          │      Odin API Gateway        │
          │  (Supports WebRTC signaling) │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │      Odin AI Backend         │
          │   (Real-time voice model)    │
          └──────────────────────────────┘
```

**Advantages:**
- Simpler architecture (no SIP bridge needed)
- Lower latency (direct WebRTC)
- Modern tech stack

**Disadvantages:**
- Odin backend must support WebRTC signaling
- More custom code (less leveraging existing libraries)

---

## Key Questions for Decision Making

### About Odin Backend

1. **Does Odin API support real-time audio streaming?**
   - If yes → Direct WebRTC (Pipecat approach)
   - If no → Need bridge (Linphone approach)

2. **What audio formats does Odin accept?**
   - PCM? Opus? MP3?
   - Sample rate? (16kHz recommended for voice)

3. **Latency requirements?**
   - <500ms → WebRTC or WebSocket
   - <1s → HTTP with streaming
   - >1s → Simple HTTP requests

4. **Authentication method?**
   - API keys? OAuth? JWT?
   - Per-user or per-device?

### About User Experience

5. **Primary use case:**
   - Push-to-talk? (like walkie-talkie)
   - Always-on conversation? (like phone call)
   - Wake word? ("Hey Odin")

6. **Notification strategy:**
   - Can Odin initiate calls to user?
   - Proactive notifications?
   - User-initiated only?

### About Development

7. **Team expertise:**
   - React Native? (→ Mattermost/Pipecat)
   - Native Android? (→ Signal/Element)
   - Limited mobile experience? (→ Linphone SDK)

8. **Timeline:**
   - MVP in 1 month? (→ Linphone SDK)
   - MVP in 2-3 months? (→ Pipecat/Mattermost)
   - Full product in 6 months? (→ Any option)

9. **Licensing concerns:**
   - Must keep code private? (→ Avoid GPL, use Linphone proprietary)
   - Open source OK? (→ Any option)

---

## Final Recommendation

**For Odin specifically, I recommend:**

### Phase 1: Proof of Concept (Week 1-2)
Use **OpenSIPS AI Voice Connector + Linphone** to validate the concept:
- Deploy OpenSIPS with Odin API integration
- Use off-the-shelf Linphone app
- Test voice quality, latency, Bluetooth headsets
- Validate user experience

**Cost:** $0 (all open source)
**Risk:** Very low (no custom code)

### Phase 2: Custom App (Week 3-8)
Build **Linphone SDK + Custom React Native App**:
- Custom UI for Odin branding
- Chat interface
- Simplified voice calling (SIP bridge from Phase 1)
- Push notifications
- Bluetooth integration (handled by SDK)

**Cost:** $0-5k (Linphone SDK license if keeping closed source)
**Risk:** Low (proven SDK, manageable complexity)

### Phase 3: Optimization (Week 9-12)
If Odin backend supports WebRTC:
- Migrate to **Pipecat framework** for direct streaming
- Remove SIP bridge
- Optimize latency
- Enhanced features (background mode, widgets)

**Cost:** $0
**Risk:** Medium (more custom code)

---

## Appendix A: License Comparison

| App/Framework | License | Commercial Use | Modification | Must Publish Changes |
|---------------|---------|----------------|--------------|---------------------|
| Mattermost | Apache 2.0 | ✅ Yes | ✅ Yes | ❌ No |
| Signal | GPLv3 | ✅ Yes | ✅ Yes | ⚠️ Yes (if distributed) |
| Element | Apache 2.0 | ✅ Yes | ✅ Yes | ❌ No |
| Jami | GPLv3 | ✅ Yes | ✅ Yes | ⚠️ Yes (if distributed) |
| Linphone | GPLv3 / Proprietary | ⚠️ Dual | ✅ Yes | ⚠️ Depends on license |
| Pipecat | Apache 2.0 | ✅ Yes | ✅ Yes | ❌ No |
| OpenSIPS | GPLv3 | ✅ Yes | ✅ Yes | ⚠️ Yes (if distributed) |

**Key Takeaway:** Apache 2.0 licenses (Mattermost, Element, Pipecat) offer maximum flexibility for commercial products.

---

## Appendix B: Resources & Links

### Primary Candidates

**Mattermost:**
- Mobile: https://github.com/mattermost/mattermost-mobile
- Calls Plugin: https://github.com/mattermost/mattermost-plugin-calls
- Docs: https://docs.mattermost.com/collaborate/make-calls.html

**Signal:**
- Android: https://github.com/signalapp/Signal-Android
- RingRTC: https://github.com/signalapp/ringrtc

**Element:**
- Element Call: https://github.com/element-hq/element-call
- Blog: https://element.io/blog/introducing-native-matrix-voip-with-element-call/

**Linphone:**
- Android: https://github.com/BelledonneCommunications/linphone-android
- Website: https://www.linphone.org/
- SDK Docs: https://www.linphone.org/en/liblinphone-voip-sdk/

**Jami:**
- Website: https://jami.net/
- F-Droid: https://f-droid.org/packages/cx.ring/

### Frameworks

**Pipecat:**
- GitHub: https://github.com/pipecat-ai/pipecat
- Docs: (via Daily.co)

**OpenSIPS AI Voice Connector:**
- GitHub: https://github.com/OpenSIPS/opensips-ai-voice-connector-ce
- Docs: https://ce.opensips.org/opensips-ai/

### Related Projects

**Mesibo:** https://github.com/mesibo/messenger-app-android
**Conversations (XMPP):** https://codeberg.org/inputmice/Conversations
**Mumble:** https://www.mumble.info/

---

## Appendix C: WebRTC vs SIP vs WebSocket

| Protocol | Latency | Quality | Complexity | Mobile Support | AI Integration |
|----------|---------|---------|------------|----------------|----------------|
| **WebRTC** | Ultra-low (<100ms) | Excellent | High | Excellent | Good |
| **SIP** | Low (<200ms) | Excellent | Very High | Good | Requires bridge |
| **WebSocket** | Low (<200ms) | Good | Low | Excellent | Excellent |
| **HTTP Streaming** | Medium (<500ms) | Good | Low | Excellent | Excellent |

**Recommendation for Odin:**
- **MVP:** WebSocket (easiest integration)
- **Production:** WebRTC (best quality, lowest latency)
- **With SIP Bridge:** SIP (leverage existing infrastructure)

---

## Document Metadata

**Author:** Claude (Supervisor AI)
**Date:** January 16, 2026
**Version:** 1.0
**Status:** Complete
**Next Steps:** Review with user, validate Odin API capabilities, select approach

**Related Documents:**
- `/home/samuel/supervisor/odin/.bmad/epics/002-email-ingestion.md`
- Odin project planning documents (TBD)

---

## Sources

### Mattermost
- [GitHub - mattermost/mattermost](https://github.com/mattermost/mattermost)
- [GitHub - mattermost/mattermost-mobile](https://github.com/mattermost/mattermost-mobile)
- [GitHub - mattermost/mattermost-plugin-calls](https://github.com/mattermost/mattermost-plugin-calls)
- [Make calls - Mattermost documentation](https://docs.mattermost.com/collaborate/make-calls.html)
- [Introducing Voice Calling and Screen Sharing in Channels](https://mattermost.com/blog/introducing-voice-calling-and-screensharing/)
- [Calls self-hosted deployment](https://docs.mattermost.com/administration-guide/configure/calls-deployment.html)
- [How Do We Use React Native at Mattermost](https://gitnation.com/contents/how-do-we-use-react-native-at-mattermost-architecture-and-design)

### Signal
- [GitHub - signalapp/Signal-Android](https://github.com/signalapp/Signal-Android)
- [Signal Messenger: Speak Freely](https://signal.org/)
- [GitHub - signalapp/ringrtc](https://github.com/signalapp/ringrtc)
- [Signal Android WebRTC Bluetooth headset issues](https://github.com/signalapp/Signal-Android/issues/6184)

### Element/Matrix
- [Introducing Native Matrix VoIP with Element Call](https://element.io/blog/introducing-native-matrix-voip-with-element-call/)
- [GitHub - element-hq/element-call](https://github.com/element-hq/element-call)
- [Element X; now with embedded VoIP](https://element.io/blog/element-x-now-with-embedded-voip/)

### Jami
- [Jami - Free and Universal Communication](https://jami.net/)
- [Jami | F-Droid](https://f-droid.org/packages/cx.ring/)
- [Jitsi vs Jami](https://jitsi.guide/blog/jitsi-vs-jami/)

### Linphone
- [Linphone - Open Source VoIP SIP Softphone](https://www.linphone.org/)
- [GitHub - BelledonneCommunications/linphone-android](https://github.com/BelledonneCommunications/linphone-android)
- [Linphone Customization](https://krify.co/linphone-sip-voip-customization-2/)

### Modern Frameworks
- [GitHub - pipecat-ai/pipecat](https://github.com/pipecat-ai/pipecat)
- [OpenSIPS AI Voice Connector](https://ce.opensips.org/opensips-ai/)
- [GitHub - OpenSIPS/opensips-ai-voice-connector-ce](https://github.com/OpenSIPS/opensips-ai-voice-connector-ce)
- [Top 5 Real-Time Speech-to-Speech APIs](https://getstream.io/blog/speech-apis/)
- [The 8 Best Platforms To Build Voice AI Agents](https://getstream.io/blog/best-voice-ai-platforms/)

### Other Resources
- [GitHub - mesibo/messenger-app-android](https://github.com/mesibo/messenger-app-android)
- [Conversations XMPP Client](https://codeberg.org/inputmice/Conversations)
- [Mumble - Open Source Voice Chat](https://www.mumble.info/)
- [React Native WebRTC Complete Guide](https://viewlytics.ai/blog/react-native-webrtc-complete-guide)
