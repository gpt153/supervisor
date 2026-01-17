# Chatterbox TTS Quick Reference

**Date:** 2026-01-16
**Full Report:** `/home/samuel/supervisor/odin/research/chatterbox-deployment-options.md`

---

## Quick Answers

### 1. Can Chatterbox be used for phone calls?

**YES**, but you need additional components:

- **TTS:** Chatterbox (what you deploy)
- **STT:** Deepgram or Whisper (need to add)
- **LLM:** Claude or GPT-4 (need to add)
- **Phone Interface:** Twilio or OpenSIPS (need to add)

**Total Cost:** $36-76/month (100 calls/month)

**Simpler Alternative:** OpenAI Realtime API at $95/month (includes everything)

### 2. Does Chatterbox work on MacBook Pro?

**YES**, but with caveats:

**Requirements:**
- M3 or M4 (recommended)
- 32GB+ memory
- macOS 12.3+

**Performance:**
- M3/M4 Max: 200-300ms latency (good)
- M1/M2 Base: 500-700ms latency (marginal)

**Limitations:**
- Community ports (not official)
- Potential stability issues
- Drains battery

**Best Use:** Development/testing, not production

### 3. Is $30/month accurate for cloud GPU?

**NO**, too low for 24/7 hosting.

**Realistic Costs:**
- **Budget:** $36.50/month (RTX 3060, part-time)
- **Recommended:** $138/month (RTX 4060, 24/7)
- **High-end:** $248/month (RTX 4090, 24/7)

**For Light Use:**
- Modal serverless: $0-50/month (pay per use)
- Mac local: $0/month (testing only)

---

## Cost Comparison

| Option | Monthly Cost | Best For |
|--------|--------------|----------|
| **Mac M3/M4 (Local)** | $0 | Development only |
| **Modal Serverless** | $0-50 | Light production (<1000 req/month) |
| **Vast.ai RTX 4060** | $138 | Always-on production |
| **OpenAI Realtime API** | $90 | Phone calls (simplest, includes STT+TTS+LLM) |

---

## Recommendations

### For Phone Calls
**Use OpenAI Realtime API** ($90/month)
- Simplest to implement
- Includes STT + TTS + LLM
- Proven technology
- Lower latency than Chatterbox stack

**Consider Chatterbox** if:
- Privacy is critical
- Usage >500 min/month (cost savings)
- Already have GPU infrastructure

### For Voice Assistant (Always-On)
**Start with OpenAI Realtime API** ($90-150/month)
- Faster to implement
- Proven for voice interaction

**Migrate to Chatterbox later** if:
- Cost becomes issue ($138/month for 24/7 GPU)
- Privacy becomes priority
- Need specific voice characteristics

### For Development
**Use Mac M3/M4 locally** ($0/month)
- Free
- Fast iteration
- Good enough for testing

---

## Implementation Priorities

### Phase 6: Voice Interface (Jul 2026)
**Decision:** Stick with OpenAI Realtime API
- Cost: $90-150/month
- Simplest path
- Already documented in ADR-004

### Phase 7: Phone Calls (Aug 2026)
**Decision:** Evaluate Chatterbox vs OpenAI
- Test Chatterbox on Mac
- Deploy to Modal serverless
- Compare costs based on actual usage

### Phase 8: Always-On (Sep 2026+)
**Decision:** Hybrid approach
- Mac local (when available)
- Cloud GPU 24/7 (Vast.ai RTX 4060)
- Modal serverless (overflow)
- Cost: $138-188/month

---

## Key Findings

1. **Chatterbox for phone calls:** Possible but complex (need STT+LLM+phone interface)
2. **MacBook Pro:** Works for dev/testing, not reliable for production
3. **$30/month GPU:** Not realistic for 24/7; budget is $138/month minimum
4. **OpenAI Realtime API:** Simpler and comparable cost for moderate use
5. **Hybrid strategy:** Best long-term approach (Mac + cloud + serverless)

---

## Next Steps

1. Test Chatterbox on Mac M3/M4 (this week)
2. Measure actual voice usage needs (this month)
3. Prototype Twilio + Chatterbox if needed (next month)
4. Stick with OpenAI Realtime API for Phase 6 (as planned)
5. Re-evaluate for Phase 7 based on actual costs

---

**See full report for detailed analysis, architecture diagrams, and code examples.**
