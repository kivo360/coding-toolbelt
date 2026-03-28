---
name: ai-subscription-tracker
description: Track AI provider pricing, model capabilities, monthly costs, and usage. Includes cost optimization recommendations for oh-my-openagent configuration.
---

# AI Subscription Tracker & Cost Optimizer

> **Last Updated:** March 28, 2026  
> **User:** kevinhill  
> **Budget Target:** $100-150/month (AFTER Claude Sonnet 5 releases)  
> **Current:** ~$278/month (Claude Max 20x $200 + Fireworks $28 + others)  
> **Claude Status:** Max 20x ($200/mo) - Waiting for Sonnet 5 "Fennec" before dropping  
> **Expected Post-Sonnet-5:** ~$130-150/month  
> **Annual Savings Potential:** ~$1,500-1,800 (after Sonnet 5)

---

## 📊 Current Subscriptions

| Provider | Plan | Monthly Cost | Status | Value Rating | Notes |
|----------|------|--------------|--------|--------------|-------|
| **Claude (Anthropic)** | **Max 20x** | **$200** | ⏳ **KEEP UNTIL Sonnet 5** | ⭐⭐⭐⭐⭐ | Waiting for "Fennec" release with Agent Swarm |
| **Fireworks AI** | Fire Pass | $28 | ✅ **ADDED** | ⭐⭐⭐⭐⭐ | Backup primary orchestrator (Kimi 200t/s) |
| **GitHub Copilot** | Pro | $10 | ✅ KEEP | ⭐⭐⭐⭐⭐ | IDE integration |
| **OpenAI** | ChatGPT Plus | $20 | ✅ KEEP | ⭐⭐⭐⭐⭐ | GPT-5.4 deep reasoning |
| **Google** | Gemini Advanced | ~$20 | ✅ KEEP | ⭐⭐⭐⭐ | Google ecosystem user |
| **Z.ai (GLM)** | - | $0 | ❌ **CANCEL NOW** | ⭐ | Infrastructure trash, quality degraded |
| **MiniMax** | - | $0 | ❌ **CANCEL** | N/A | Use OpenCode Go or pay-as-you-go |

### 💰 Cost Summary (REAL CURRENT vs FUTURE)

| Scenario | Monthly Cost | Annual Cost | Notes |
|----------|--------------|-------------|-------|
| **CURRENT** | **~$278** | **~$3,336** | Claude Max 20x ($200) + Fireworks + others |
| **After Sonnet 5** | **~$130-150** | **~$1,560-1,800** | Drop to Sonnet tier, simplify stack |
| **Savings** | **~$130-150/mo** | **~$1,500-1,800/yr** | **When Sonnet 5 drops** |

### 🎯 Why Keep Claude Max 20x For Now

**You're paying $200/month for:**
- **220K tokens/5hr window** (vs 44K on Pro)
- **Agent Teams** (parallel multi-agent workflows)
- **Priority access** during peak times
- **No rate limit anxiety** for 8+ hour days

**The bet:** Claude Sonnet 5 "Fennec" will have:
- **Agent Swarm built-in** (replaces OMO orchestration?)
- **1M token context** (replaces need for multiple models?)
- **50% cheaper than Opus 4.5** (could be ~$50-75/month tier?)
- **Outperforms current Opus** at Sonnet price point

**When Sonnet 5 drops:** Re-evaluate entire stack. Could drop to Sonnet tier + simplify.

---

## 🔥 Fireworks AI Fire Pass

### Pricing
- **Weekly:** $7 (first week free)
- **Monthly:** ~$28
- **Annual:** ~$336

### What's Included
- **Kimi K2.5 Turbo** with **zero per-token costs**
- **Unlimited usage** (no token limits)
- **200+ tokens/second** speed
- **256K context window**
- Compatible with OpenCode, Cline, Roo Code, Kilo Code, OpenClaw

### Model ID for Configuration
```
accounts/fireworks/routers/kimi-k2p5-turbo
```

### When to Use
- ✅ Primary orchestration agent (Sisyphus)
- ✅ Prometheus planning
- ✅ Fast codebase exploration
- ✅ Daily coding tasks (unlimited, fast)

### Direct API Pricing (without Fire Pass)
| Type | Price |
|------|-------|
| Input | $0.99/1M tokens |
| Cached Input | $0.16/1M tokens |
| Output | $4.94/1M tokens |

**Break-even:** ~6M tokens/month vs Fire Pass

---

## 🤖 Model Capabilities Matrix

| Model | Provider | Speed | Coding | Reasoning | Vision | Cost Level | Best For |
|-------|----------|-------|--------|-----------|--------|------------|----------|
| **Kimi K2.5 Turbo** | Fireworks | ⚡⚡⚡⚡⚡ (200t/s) | 76.8% SWE-Bench | High | ✅ | Very Low | Orchestration, daily coding |
| **Kimi K2.5** | OpenCode Go/Moonshot | ⚡⚡⚡ (60t/s) | 76.8% SWE-Bench | High | ✅ | Very Low | Claude alternative |
| **GPT-5.4** | OpenAI | ⚡⚡⚡ (40t/s) | 80%+ SWE-Bench | Very High | ✅ | Medium | Deep reasoning, architecture |
| **GPT-5.4 Mini** | OpenAI | ⚡⚡⚡⚡ (100t/s) | 75% SWE-Bench | High | ❌ | Very Low | Quick tasks |
| **Claude Opus 4.6** | Anthropic | ⚡⚡ (25t/s) | 80.8% SWE-Bench | Very High | ✅ | High | Complex debugging |
| **Claude Sonnet 4.6** | Anthropic | ⚡⚡⚡ (50t/s) | 75% SWE-Bench | High | ✅ | Medium | General tasks |
| **Gemini 3.1 Pro** | Google | ⚡⚡⚡ (60t/s) | 75% SWE-Bench | High | ✅ | Low | Frontend, visual tasks |
| **Gemini 3 Flash** | Google | ⚡⚡⚡⚡ (150t/s) | 70% SWE-Bench | Medium | ✅ | Very Low | Documentation, fast tasks |
| **MiniMax M2.7** | MiniMax/OpenCode | ⚡⚡⚡⚡ (120t/s) | 80.2% SWE-Bench | High | ❌ | Very Low | Utility, code search |
| **MiniMax M2.7 Highspeed** | MiniMax | ⚡⚡⚡⚡⚡ (200t/s) | 80.2% SWE-Bench | High | ❌ | Low | Fast utility |
| **GLM 5** | Z.ai/OpenCode | ⚡⚡⚡ (50t/s) | 77.8% SWE-Bench | High | ❌ | Low | Claude-like orchestration |
| **Grok Code Fast 1** | xAI/GitHub | ⚡⚡⚡⚡⚡ (250t/s) | 70% SWE-Bench | Medium | ❌ | Very Low | Code grep, search |

### Cost per 1M Tokens (API)

| Model | Input | Output | Cache Read |
|-------|-------|--------|------------|
| Kimi K2.5 (regular) | $0.60 | $2.00 | - |
| Kimi K2.5 Turbo | $0.99 | $4.94 | $0.16 |
| GPT-5.4 | $2.50 | $15.00 | - |
| GPT-5.4 Mini | $0.25 | $2.00 | - |
| GPT-5-Nano | $0.05 | $0.40 | - |
| Claude Opus 4.6 | $5.00 | $25.00 | $0.50 |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 |
| Gemini 3.1 Pro | $2.00 | $12.00 | - |
| Gemini 3 Flash | $0.10 | $0.40 | - |
| MiniMax M2.7 | $0.30 | $1.20 | $0.06 |
| MiniMax M2.7 Highspeed | $0.60 | $2.40 | $0.06 |
| GLM 5 | $1.00 | $3.20 | $0.11 |

---

## 💵 Subscription Details

### 1. Fireworks AI Fire Pass ⭐⭐⭐⭐⭐
- **Cost:** $7/week ($28/month)
- **Billing:** Weekly, auto-renew optional
- **Models:** Kimi K2.5 Turbo only
- **Limits:** Unlimited (no token cap)
- **Speed:** 200+ tokens/second
- **Value:** Excellent for power users

**Configuration:**
```json
{
  "model": "fireworks/accounts/fireworks/routers/kimi-k2p5-turbo",
  "baseURL": "https://api.fireworks.ai/inference/v1"
}
```

---

### 2. GitHub Copilot Pro ⭐⭐⭐⭐⭐
- **Cost:** $10/month ($100/year)
- **Requests:** 300 premium/month + unlimited completions
- **Models:** Claude Opus 4.6, GPT-4, others
- **Features:** Coding agent, code review, PR assistance
- **Value:** Essential for GitHub integration

---

### 3. OpenAI ChatGPT Plus ⭐⭐⭐⭐⭐
- **Cost:** $20/month
- **Models:** GPT-5.4, GPT-5, GPT-5 Mini, GPT-5 Nano
- **Features:** Chat, code interpreter, browsing
- **API Access:** Separate billing
- **Value:** Keep for GPT-5.4 deep reasoning

**API Pricing:**
- GPT-5.4: $2.50/1M input, $15/1M output
- GPT-5.4 Mini: $0.25/1M input, $2/1M output
- GPT-5-Nano: $0.05/1M input, $0.40/1M output

---

### 4. Google Gemini Advanced ⭐⭐⭐⭐ (KEPT)
- **Cost:** ~$20/month (bundled with Google One AI Premium)
- **Models:** Gemini 3.1 Pro, 3.0 Pro, 3.0 Flash, 3.0 Flash-Lite
- **Features:** 2M token context, multimodal, Antigravity
- **Why Kept:** User actively uses Google ecosystem for many things; Antigravity is a nice addition but not the primary reason
- **Value:** Justified by broader Google usage

---

### 5. Claude Code Pro ⭐⭐⭐ (REDUCED FROM MAX)
- **New Cost:** $20/month (or $200/year = $17/month)
- **Previous:** Max 5x at $100/month
- **Savings:** $80/month
- **Limits:** 44K tokens/5hr window (vs 88K on Max 5x)
- **Usage:** Reserve for complex debugging only; use Fireworks Kimi for daily work

---

### 6. Z.ai GLM Coding Plan ⭐ (CANCEL IMMEDIATELY - Infrastructure Trash)
- **Status:** Already paid yearly, **do not renew**
- **Reason:** Infrastructure completely unreliable

#### Why Z.ai Infrastructure is Trash:

1. **Capacity Constraints** — Undersized infrastructure. Can't scale fast enough when demand spikes → "Model unavailable" errors

2. **Degraded Model Quality** — Reddit r/ZaiGLM reports confirm GLM-5 quality has **declined** since launch:
   - Worse instruction following than previous GLM versions
   - Artificially shortened "thinking time" 
   - Outputs resembling "quantized or degraded model"
   - Quality drops beyond 80-100k context window

3. **30-Second Idle Timeouts** — GitHub issues (vercel/ai #12949) show Z.ai drops connections after 30s idle, killing long agentic workflows

4. **"Improvements" That Break Things** — Z.ai pushed updates they called "performance improvements" that actually degraded quality for Max plan users

5. **Beijing-Based Lab** — Zhipu AI is China-based. Scaling global infrastructure with international demand + Chinese regulatory constraints = unreliable service outside China

**Bottom line:** Cheap frontier AI is only good if quality holds. Z.ai isn't holding. Reddit thread: "Don't buy GLM coding plans. Quality is atrocious. It's becoming worse everyday."

---

### 7. Claude (Anthropic) Max 20x ⭐⭐⭐⭐⭐ (KEEP UNTIL Sonnet 5)
- **Current Cost:** $200/month
- **Limits:** 220K tokens/5hr window, Agent Teams, priority access
- **Why Paying $200:** You're a power user (8+ hrs/day) hitting Pro limits
- **The Bet:** Waiting for **Claude Sonnet 5 "Fennec"**

#### Claude Sonnet 5 "Fennec" Leaks (March 2026)

**Model ID spotted:** `claude-sonnet-5@20260203` in Google Vertex AI infrastructure

| Feature | Details |
|---------|---------|
| **Codename** | "Fennec" |
| **Performance** | Outperforms Claude Opus 4.5 internally |
| **Price** | ~50% cheaper than Opus 4.5 |
| **Context Window** | **1 million tokens** (vs 200K now) |
| **Killer Feature** | **"Dev Team" / "Agent Swarm" mode** — spawns multiple specialized agents (architect, backend, frontend, QA) that work in parallel |
| **SWE-Bench** | 80.9% (far surpassing existing models) |
| **Release** | Imminent (likely Q2 2026) |

**Why Wait:** Sonnet 5 could be the Claude that makes dropping everything else actually viable:
- Agent Swarm = OMO built-in?
- 1M context = no need for other models?
- 50% cheaper = ~$50-75/month instead of $200?

**When Sonnet 5 drops:** Re-evaluate entire stack. Could drop from Max 20x to Sonnet tier.

---

## 📈 Usage Tracking Template

### Monthly Usage Log

```markdown
## Month: [Month Year]

### Daily Average Usage
- Hours/day: ___
- Requests/day: ___
- Primary model: ___

### Costs This Month
| Provider | Planned | Actual | Notes |
|----------|---------|--------|-------|
| Claude Max 20x | $200 | $___ | Waiting for Sonnet 5 |
| Fireworks Fire Pass | $28 | $___ | Backup orchestrator |
| GitHub Copilot | $10 | $___ | |
| OpenAI | $20 | $___ | API usage: $___ |
| Google Gemini | $20 | $___ | |
| MiniMax (OpenCode Go) | $10 | $___ | If needed |
| **TOTAL** | **~$288** | **$___** | **Current spend** |

### Sonnet 5 Watch
- [ ] Release announced
- [ ] Benchmarks verified
- [ ] Pricing confirmed
- [ ] Agent Swarm tested
- [ ] Decision: Drop Max 20x?

### If Sonnet 5 is Good - New Stack:
| Provider | Expected Cost |
|----------|---------------|
| Claude Sonnet 5 | ~$50-75? |
| Fireworks | $28 |
| Copilot | $10 |
| OpenAI | $20 |
| Gemini | $20 |
| **TOTAL** | **~$128-153** |

### Model Usage Breakdown
| Model | % Usage | Tokens Used | Cost |
|-------|---------|-------------|------|
| Claude Opus 4.6 (Max 20x) | ___% | ___M | $200 |
| Kimi K2.5 Turbo | ___% | Unlimited | $28 |
| GPT-5.4 | ___% | ___M | $___ |
| Gemini Pro | ___% | ___M | $___ |
| MiniMax M2.7 | ___% | ___M | $___ |

### Optimizations Made / Planned
- [x] **CANCELLED Z.ai GLM** — Infrastructure trash, quality degraded
- [x] **CANCELLED MiniMax subscription** — Use OpenCode Go or pay-as-you-go
- [x] **ADDED Fireworks Fire Pass** — $28/mo unlimited Kimi 200t/s
- [ ] **PENDING: Drop Claude Max 20x** — Waiting for Sonnet 5 "Fennec"
  - If Sonnet 5 has Agent Swarm → Could replace OMO orchestration
  - If 1M context works → Could simplify entire stack
  - If ~$50-75/mo → Save $125-150/month
- [ ] **Evaluate Gemini need** — Do you actually use it beyond Google ecosystem?

### Notes
___
```

---

## 🎯 Current vs Future Configuration

### CURRENT STACK (Pre-Sonnet 5)

| Agent | Primary Model | Fallback | Monthly Cost |
|-------|---------------|----------|--------------|
| **Sisyphus** (Orchestrator) | 🔥 **Claude Opus 4.6** (Max 20x) | Fireworks Kimi Turbo | $200 |
| **Prometheus** (Planner) | Claude Opus 4.6 | Fireworks Kimi | Included |
| **Hephaestus** (Deep work) | OpenAI GPT-5.4 | Gemini Pro | $20 + API |
| **Oracle** (Consultant) | OpenAI GPT-5.4 | Gemini Pro | API usage |
| **Explore/Librarian** | Fireworks Kimi / MiniMax | Copilot Grok | $28 |
| **Frontend** | Gemini 3.1 Pro | Fireworks Kimi | $20 |

**Current Total:** ~$278/month

---

### FUTURE STACK (If Sonnet 5 Delivers)

| Agent | Primary Model | Why |
|-------|---------------|-----|
| **Everything** | 🚀 **Claude Sonnet 5 "Fennec"** | Agent Swarm built-in? 1M context? 50% cheaper? |
| **Backup** | Fireworks Kimi Turbo | $28/mo unlimited |
| **IDE** | GitHub Copilot Pro | $10 |
| **Reasoning** | GPT-5.4 (if needed) | $20 |
| **Google** | Gemini Advanced | $20 (if still needed) |

**Potential Total:** ~$130-150/month  
**Savings:** $130-150/month when Sonnet 5 drops

---

### The Sonnet 5 Bet

**You're paying $200/month for Max 20x because:**
1. 220K tokens/5hr window (you hit Pro limits daily)
2. Agent Teams (parallel workflows)
3. No rate limit anxiety for 8+ hour power usage
4. **Waiting for Sonnet 5 to potentially replace this entire setup**

**If Sonnet 5 has:**
- ✅ Agent Swarm → No need for OMO orchestration
- ✅ 1M context → No need for multiple models
- ✅ ~$50-75/mo pricing → Save $125-150/month
- ✅ Outperforms Opus → Better quality for less money

**Risk:** Sonnet 5 could be delayed or not live up to leaks. But at $200/month, the potential payoff is worth the wait.

---

## 🔗 Provider Links

| Provider | Billing | Support | Docs |
|----------|---------|---------|------|
| **Fireworks** | [Billing](https://app.fireworks.ai/account/billing) | support@fireworks.ai | [Docs](https://docs.fireworks.ai) |
| **GitHub Copilot** | [Settings](https://github.com/settings/copilot) | GitHub Support | [Docs](https://docs.github.com/copilot) |
| **OpenAI** | [Billing](https://platform.openai.com/account/billing) | OpenAI Help | [API Docs](https://platform.openai.com/docs) |
| **Google Gemini** | [Google One](https://one.google.com) | Google Support | [Gemini Docs](https://ai.google.dev/docs) |
| **Anthropic Claude** | [Account](https://console.anthropic.com/settings/billing) | Anthropic Support | [Claude Docs](https://docs.anthropic.com) |
| **Z.ai** | [Z.ai Billing](https://z.ai/subscribe) | Z.ai Support | [GLM Docs](https://z.ai) |
| **MiniMax** | [MiniMax Platform](https://platform.minimaxi.com) | MiniMax Support | [API Docs](https://platform.minimaxi.com/document) |
| **OpenCode** | [OpenCode](https://opencode.ai) | Discord/Discord | [Docs](https://opencode.ai/docs) |

---

## 📋 Action Items Checklist (UPDATED - March 28, 2026)

### Immediate Actions (This Week)
- [x] **ADD Fireworks Fire Pass** — $28/week (unlimited Kimi 200t/s) — Backup orchestrator
- [x] **CANCEL MiniMax subscription** — Use remaining 4,500 calls, then OpenCode Go or pay-as-you-go
- [x] **CANCEL Z.ai** — Don't renew (infrastructure trash, quality degraded)
- [ ] **DECISION: Keep or Reduce Claude?** — You're paying $200 for Max 20x
  - **Option A:** Keep Max 20x until Sonnet 5 drops (current plan)
  - **Option B:** Reduce to Max 5x ($100) or Pro ($20) now, use Fireworks as primary

### Short-term (This Month)
- [ ] **Monitor Claude usage** — Are you hitting 220K tokens/5hr limit? If not, could downgrade
- [ ] **Set up OpenCode Go** — $10/month backup for MiniMax M2.7 (14K requests/5hrs)
- [ ] **Test Fireworks Kimi as primary** — Can it handle your orchestration needs?
- [ ] **Update oh-my-openagent config** — Use the cost-optimized configuration

### The Sonnet 5 Watch (Q2 2026)
- [ ] **Release announced** — Check Anthropic blog, Google Vertex AI
- [ ] **Benchmarks verified** — Does it outperform Opus 4.5?
- [ ] **Pricing confirmed** — ~50% cheaper than Opus?
- [ ] **Agent Swarm tested** — Does it replace OMO orchestration?
- [ ] **Context window validated** — Is 1M tokens real or marketing?
- [ ] **DECISION POINT:** 
  - If Sonnet 5 is good → Drop Max 20x, save $125-150/month
  - If Sonnet 5 is delayed/bad → Keep current stack or reduce Claude now

### Long-term (Post-Sonnet 5)
- [ ] **Simplify stack if Sonnet 5 delivers** — Could drop from 6 providers to 2-3
- [ ] **Re-evaluate Gemini need** — Does 1M context eliminate need for separate frontend model?
- [ ] **Check for new provider options** — DeepSeek, etc.
- [ ] **Update model capabilities matrix**
- [ ] **Update oh-my-openagent config** — Use the cost-optimized configuration
- [ ] **Mark Z.ai as do-not-renew** — Already paid yearly, cancel before next renewal

### Long-term (Quarterly)
- [ ] Review total spend vs. $98/month target
- [ ] Re-evaluate Claude Pro need (can you rely entirely on Fireworks?)
- [ ] Check for new provider options (DeepSeek, etc.)
- [ ] Update model capabilities matrix with new releases

---

## 🎯 Current vs Future Primary Models

### CURRENT REALITY (You're Paying $278/month)

| Use Case | Primary Model | Provider | Monthly Cost | Why |
|----------|---------------|----------|--------------|-----|
| **Orchestration** | 🔥 **Claude Opus 4.6** (Max 20x) | Anthropic | $200 | You hit Pro limits, need 220K tokens/5hr |
| **Deep Reasoning** | GPT-5.4 | OpenAI | $20 + API | Architecture, Oracle, Hephaestus |
| **Frontend/UI** | Gemini 3.1 Pro | Google | $20 | Google ecosystem user |
| **Backup/Fast** | Kimi K2.5 Turbo | Fireworks | $28 | Unlimited, 200 tok/s, testing as backup |
| **IDE** | Copilot | GitHub | $10 | Completions |
| **Utility** | MiniMax M2.7 | OpenCode Go | $10 | If needed |

**Total:** ~$288/month

---

### IF SONNET 5 DELIVERS (Potential $130-150/month)

| Use Case | Primary Model | Expected Cost |
|----------|---------------|---------------|
| **Everything** | 🚀 **Claude Sonnet 5 "Fennec"** | ~$50-75? |
| **Backup** | Fireworks Kimi Turbo | $28 |
| **IDE** | Copilot Pro | $10 |
| **Specialized** | GPT-5.4 (if needed) | $20 |
| **Google** | Gemini Advanced (if still needed) | $20 |

**Potential Total:** ~$130-150/month  
**Savings:** $130-150/month ($1,500-1,800/year)

---

## 💡 Cost-Saving Tips (Your ACTUAL Strategy)

1. **Keep Claude Max 20x ($200/mo) for now** — You actually use the 220K tokens/5hr limit
2. **Test Fireworks Kimi as backup** — $28/mo unlimited, 200 tok/s — could replace Claude for orchestration?
3. **Cancel Z.ai immediately** — Infrastructure trash, quality degraded, don't renew yearly
4. **Cancel MiniMax subscription** — Use remaining 4,500 calls, then OpenCode Go or pay-as-you-go
5. **Wait for Sonnet 5 "Fennec"** — The bet: Agent Swarm + 1M context + ~$50-75/mo pricing
6. **Reserve GPT-5.4 for deep reasoning only** — Sonnet 5 might handle this too
7. **Keep Gemini** — Justified by Google ecosystem usage (not just Antigravity)
8. **Re-evaluate everything when Sonnet 5 drops** — Could simplify from 6 providers to 2-3

---

*Generated by Claude for kevinhill*  
*Tracker Version: 1.0*  
*Update Frequency: Monthly or when pricing changes*
