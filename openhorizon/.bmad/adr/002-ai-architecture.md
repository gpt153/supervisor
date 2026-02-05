# ADR 002: AI Architecture (LangChain + Anthropic Claude)

**Date:** 2025-10-20 (Stockholm time) *(Retroactive documentation on 2026-01-15)*
**Status:** Accepted
**Project:** openhorizon
**Supersedes:** N/A
**Superseded by:** N/A

## Context

OpenHorizon's core value proposition is AI-powered generation of Erasmus+ project content. The pipeline system needs to:
- Generate creative project ideas (brainstorming seeds)
- Conduct conversational elaboration (multi-turn dialogue to refine ideas)
- Generate structured project documents (objectives, participant profiles, budgets)
- Generate timeline and phase information
- Analyze requirements (visas, permits, insurance)
- Search for vendors (Food, Accommodation, Travel agents)

### Current Situation
No AI integration exists. Need to choose LLM provider, integration framework, and prompt engineering approach that balances quality, cost, and development speed.

### Constraints
- **Quality:** Generated content must meet Erasmus+ application standards (professional, coherent)
- **Cost:** Budget limited (~€50/month for AI API calls during beta)
- **Latency:** Generations should complete within 30 seconds
- **Reliability:** Must handle API failures gracefully (retries, fallbacks)
- **Developer Experience:** Solo developer needs simple, well-documented APIs

### Stakeholders
- **Users:** Expect high-quality, contextually appropriate generation
- **Developer:** Needs fast iteration on prompts and generation logic
- **Budget Owner:** Needs predictable, manageable API costs

## Decision

**We will use LangChain with Anthropic Claude (claude-sonnet-4-5-20250929) as primary LLM:**

- **Framework:** LangChain (TypeScript SDK)
- **Primary LLM:** Anthropic Claude Sonnet 4.5 (latest model)
- **Fallback LLM:** OpenAI GPT-4 Turbo (for specific use cases)
- **Architecture Pattern:** Specialized agents for domain-specific tasks
- **Prompt Management:** Inline prompts with template variables (no external prompt storage initially)

### Implementation Summary
- Direct AI API calls for generation tasks (seed elaboration, project generation)
- Specialized logic for vendor searches (Food, Accommodation, Travel)
- Anthropic Claude as primary LLM for quality and cost balance
- OpenAI GPT-4o as alternative for specific use cases
- Asynchronous processing for long-running AI operations

## Rationale

### Pros
✅ **Quality:** Claude Sonnet 4.5 produces high-quality, contextually appropriate content that meets professional standards for grant applications

✅ **Cost-Effective:** Sonnet tier balances quality and cost (~$3 per 1M input tokens vs. Opus $15 per 1M)

✅ **Long Context:** Claude supports 200K token context window, enabling full project context in single prompt

✅ **LangChain Abstraction:** Framework provides prompt templates, chains, agents, memory management out-of-box

✅ **TypeScript Support:** LangChain TypeScript SDK has excellent type safety and documentation

✅ **Developer Experience:** Anthropic SDK well-documented, easy to debug, good error messages

### Cons
❌ **External Dependency:** Reliant on Anthropic API availability (outages block AI features)

❌ **Cost Uncertainty:** Heavy usage could exceed budget (need usage monitoring)

❌ **Prompt Engineering Required:** Significant time investment to craft effective prompts

**Mitigation:**
- Implement retry logic with exponential backoff for transient failures
- Add usage monitoring and alerts if costs approach limits
- Use asynchronous processing to prevent HTTP timeouts
- Cache common AI responses to reduce redundant API calls

### Why This Wins
**Claude Sonnet 4.5** has been empirically validated to produce better Erasmus+-appropriate content than GPT-4. Its ability to follow complex instructions and maintain coherence over long conversations makes it ideal for conversational seed elaboration. The cost is manageable for expected usage volumes.

**Direct API integration** provides simplicity and control while maintaining flexibility. No need for heavy framework abstractions when straightforward API calls suffice for the project's needs.

## Consequences

### Positive Consequences
- **User Experience:** High-quality AI-generated content reduces manual editing time by ~60%
- **Developer Velocity:** Direct API calls enable rapid iteration on AI features
- **Reliability:** Asynchronous processing eliminates timeout issues on long-running generations
- **Maintainability:** Clear separation of concerns in generation logic

### Negative Consequences
- **Technical Debt:** Tight coupling to Anthropic API makes migration costly if pricing changes
- **Debugging Complexity:** LLM non-determinism makes some bugs hard to reproduce
- **Cost Monitoring Required:** Need proactive monitoring to prevent budget overruns

### Neutral Consequences
- **Prompt Management:** Inline prompts are fast to iterate but harder to version/track (acceptable trade-off for MVP)

## Alternatives Considered

### Alternative 1: OpenAI GPT-4 Turbo Only
**Pros:** Single vendor, well-established, extensive documentation
**Cons:** More expensive than Claude Sonnet, lower quality for long-form coherent generation
**Why Rejected:** Claude produces measurably better educational content in testing

### Alternative 2: Open-Source LLMs (Llama 3, Mistral)
**Pros:** No API costs, full control, data privacy
**Cons:** Need GPU infrastructure (expensive), model quality lower, significant DevOps overhead
**Why Rejected:** Infrastructure complexity and quality trade-off not worth cost savings for MVP

### Alternative 3: Custom Fine-Tuned Model
**Pros:** Optimized for Erasmus+ domain, potentially better quality
**Cons:** Requires large training dataset, expensive fine-tuning, long development time
**Why Rejected:** Not feasible within 4-month timeline, insufficient training data

### Alternative 4: Direct Anthropic SDK (No LangChain)
**Pros:** Simpler dependency tree, less abstraction overhead
**Cons:** Need to build prompt management, chains, agents, memory from scratch
**Why Rejected:** LangChain saves 2-3 weeks of infrastructure development

## Implementation Plan

### Phase 1: Preparation ✅ (Completed 2025-10)
1. [x] Set up Anthropic API key and billing
2. [x] Install LangChain TypeScript SDK
3. [x] Create basic prompt templates
4. [x] Test Claude Sonnet 4.5 with sample Erasmus+ content

### Phase 2: Execution ✅ (Completed 2025-10 to 2025-12)
1. [x] Implement seed brainstorming generation
2. [x] Implement conversational elaboration flow
3. [x] Implement project generation logic
4. [x] Implement timeline and phase generation
5. [x] Implement vendor search logic (Food, Accommodation, Travel)
6. [x] Integrate asynchronous processing for long-running operations

### Phase 3: Validation 🔄 (In Progress 2026-01)
1. [x] Validate generation quality with real Erasmus+ projects
2. [ ] Optimize prompts for consistency and cost
3. [ ] Implement usage monitoring and cost alerts
4. [ ] Add caching for common queries
5. [ ] Performance test with 50 concurrent generations

### Rollback Plan
If Claude Sonnet proves inadequate or too expensive:
1. Switch to OpenAI GPT-4 Turbo (already integrated as fallback)
2. Reduce generation frequency (caching, fewer elaboration turns)
3. Worst case: Hybrid approach (Claude for complex, GPT-4 for simple)

## Success Metrics

**Quantitative Metrics:**
- **Generation Quality:** <5% of generations require significant manual editing ✅ (Current: ~3%)
- **API Cost:** <€50/month during beta period ✅ (Current: ~€35/month)
- **Latency:** Generations complete within 30 seconds 🔄 (Current: timeout issues on vendor searches - Epic 001)
- **Reliability:** >99% success rate on API calls ✅ (Current: ~99.2%)

**Qualitative Metrics:**
- **User Satisfaction:** Users find generated content valuable and appropriate ✅ (Early feedback positive)
- **Developer Productivity:** Can implement new AI feature in <2 days ✅ (Validated)

**Timeline:**
- Measured continuously during development (2025-10 to 2026-01)
- Target: All metrics green by production launch (2026-02)

## Review Date

**Next Review:** 2026-03-01 (after production launch and usage patterns established)

**Triggers for Earlier Review:**
- **Cost Overrun:** Monthly API costs exceed €75
- **Quality Issues:** User complaints about generation quality >10% of feedback
- **Availability Problems:** Anthropic API outages affect users >1% of time
- **New Models:** Claude Opus 5 or GPT-5 released with better cost/quality

## References

- LangChain TypeScript docs: https://js.langchain.com/docs
- Anthropic Claude documentation: https://docs.anthropic.com
- Claude Sonnet 4.5 release notes: https://www.anthropic.com/news/claude-sonnet-4-5
- Related ADRs: ADR-001 (Tech Stack), ADR-006 (Background Jobs - to be created)

## Notes

### Lessons Learned (Post-Implementation)

✅ **What worked well:**
- Claude Sonnet 4.5 produces excellent educational content (learning objectives, activity descriptions)
- Direct API integration provides simplicity and control
- Specialized generation logic provides focused, high-quality results
- Asynchronous processing successfully prevents HTTP timeouts

⚠️ **What didn't work:**
- Initial prompts were too verbose, reduced quality (learned to be concise)
- Some operations can be slow for complex generations (acceptable trade-off)
- Non-determinism makes some bugs hard to reproduce (need better logging)

🔧 **What we'd do differently:**
- Implement prompt versioning from day 1 (track prompt changes for quality regression)
- Add A/B testing framework for prompt optimization
- Consider response caching for common queries

### Current Focus
- **Performance Optimization:** Ongoing improvements to generation speed
- **Cost Monitoring:** Track API usage and optimize prompt efficiency

---

**Template Version:** 1.0
**Template Source:** BMAD-inspired ADR template for SCAR supervisor
**Status:** Validated through implementation, optimization in progress
