# Content Gap Analysis — SERP, People Also Ask & AI Overview

Source: Treg → `cloro.google.serp.organic` (live Google SERP with People Also Ask, related searches and AI Overview, US/English). Pulled 2026-09-16. Spend for this round: **~$0.073** (26 calls). Running total across both rounds: **~$0.56**.

This is the layer the first research round (`keywords.md`) was missing. That round answered *"what do people search for, and how hard is it?"* using Google Ads volume/difficulty. It never asked *"who currently ranks, what do those pages actually cover, and what questions does Google itself surface?"* — which is what determines whether depth converts into rankings.

---

## The headline finding: depth is not the binding constraint on head terms

Every pillar head term is owned by an encyclopedic brand entity:

| Keyword | Who owns page 1 |
|---|---|
| retrieval augmented generation | AWS, IBM, Google Cloud, NVIDIA, Wikipedia, Databricks |
| ai agents | IBM, Google Cloud, BCG, AWS, Wikipedia, GitHub |
| model context protocol | modelcontextprotocol.io, Anthropic, Wikipedia, Google Cloud, Databricks |
| ai hallucination | IBM, Wikipedia, Google Cloud, OpenAI, Nature, PMC |
| ai orchestration | IBM, Domo, Zapier, UiPath, Databricks |
| prompt injection | IBM, Wikipedia, OWASP, OpenAI, Palo Alto, CrowdStrike |

No amount of added word count moves a personal site past `aws.amazon.com/what-is/...` for "retrieval augmented generation" (KD 74). Those pages rank on domain authority and entity association, not on being better written. **Writing 8,000 words instead of 4,000 on the head term is wasted effort.**

So the rewrite brief is not "make it longer." It is **"make it answer the questions the head-term pages don't, in the places where a practitioner site can actually win."**

## Where a practitioner site genuinely can win

These SERPs have no mega-brand lock-in — they're won by tool vendors, Medium/Substack posts, Reddit threads and personal blogs:

| Keyword | Page 1 composition | Verdict |
|---|---|---|
| **mcp vs function calling** | prefect.io, Reddit, LinkedIn, portkey.ai, Medium, obot.ai, a Substack | **Wide open.** No brand moat at all. |
| **voice ai agent latency** | Reddit, Twilio, Cresta, SignalWire, Retell, **a personal blog**, hamming.ai | **Wide open.** A personal blog already ranks. |
| **context engineering vs prompt engineering** | Elastic, Neo4j, Medium, Reddit, abstracta.us, Glean, firecrawl.dev | Winnable. |
| **ai agents vs agentic ai** | Moveworks, Reddit, Medium, keyfactor, GeeksforGeeks, dust.tt | Winnable. |
| **llm as a judge** | arXiv, Langfuse, confident-ai, Evidently, MLflow, HuggingFace | Winnable with real depth. |
| **mcp server security** | modelcontextprotocol.io, Reddit, Datadog, Red Hat, **NSA**, pillar.security | Moderate — but high-value intent. |
| **ai agent memory** | IBM, arXiv, Reddit, mem0, Oracle, Cloudflare, Redis | Moderate. |

**Reddit appears on page 1 of 15 of the 25 SERPs pulled.** Google is actively rewarding first-person practitioner experience over encyclopedic explainers. That is the single most actionable signal in this dataset, and it happens to be the one thing this site has that IBM structurally cannot fake: *"I shipped this, here is what broke, here is what it cost."*

## Structural gap vs. the pages that do rank

Competitor outlines (scraped H2/H3 from AWS, IBM, Google Cloud, Arize, Evidently) share a shape the current guides skip entirely:

- **Taxonomy sections** — "the 5 types of AI agents", "components of a RAG system", "the 4 types of agent memory". These win featured snippets and get quoted verbatim in AI Overviews.
- **Explicit `X vs Y` sections** with comparison tables. Related-search data is saturated with them: *rag vs fine-tuning vs prompt engineering*, *rag vs fine-tuning vs mcp*, *ai agents vs agentic ai vs mcp*, *mcp vs tool calling*, *function calling vs tool calling*.
- **Cost sections.** "How much do AI voice agents cost?" and agent cost-per-task are live PAA questions with no good practitioner answer ranking.
- **"Is this still relevant?" / state-of-the-art sections.** *Is RAG still relevant?* is PAA on three separate RAG SERPs.

The current guides go heading → architecture → code → failure modes. They're strong on the last two and absent on the first two.

## Unanswered People Also Ask questions, by guide

Questions Google surfaces that the current guides do not answer anywhere:

### `/guides/rag`
- Is RAG still relevant? (agentic RAG, long-context models)
- What is RAG vs LLM? / What is RAG vs MCP?
- What are the four levels of RAG? (naive → advanced → modular/agentic maturity model)
- Is ChatGPT a RAG model?
- When not to use fine-tuning? / RAG vs fine-tuning *cost*
- RAG poisoning (Wikipedia gives this its own section; the guide has no retrieval-layer security content)

### `/guides/ai-agents`
- What are the 5 types of AI agents? (the classic Russell & Norvig taxonomy)
- What exactly does an AI agent do?
- Agent vs assistant vs bot vs chatbot — a real comparison table
- What are the four main types of agent memory? (working / episodic / semantic / procedural — the guide only covers short-term vs long-term)
- Agent cost per task vs a single LLM call

### `/guides/mcp`
- What is MCP vs API? (the N×M integration-tax framing)
- What is MCP vs RAG?
- Is MCP the same as tool calling? (terminology is genuinely confused in the wild)
- Are MCP servers a security risk? / How are MCP servers secured? / What are the downsides?
- What is better than MCP? (CLI tools, direct SDKs — the honest "when not to" answer)

### `/guides/llm-evaluation`
- What is the difference between LLM evals and benchmarks?
- What is an LLM evaluation rubric and how is it used?
- What are the five pillars of LLM observability?
- LLM evaluation *metrics* as a named taxonomy (the guide describes scorers but never names the metric set)
- RAG-specific metrics (faithfulness, answer relevancy, context precision/recall)
- Agent evaluation / agent-as-a-judge

### `/guides/voice-ai-agents`
- What is considered acceptable latency for voice calls? (**ITU-T G.114** sets 150 ms one-way / 300 ms round-trip — a citable primary standard the guide should own)
- How much do AI voice agents cost?
- How to reduce AI agent latency? (a concrete per-stage latency budget table)
- What are the top AI voice agent platforms?

## AI Overview behaviour

An AI Overview fired on nearly every keyword pulled. The pages it cites share three traits:

1. A **direct definitional sentence** in the first ~40 words under a heading that matches the question.
2. **Structured lists and comparison tables** — AIO lifts these near-verbatim.
3. Headings phrased as the **question itself**, not as a topic label.

Current guide headings are topic labels ("Architecture: The Control Loop, Tool Calling, and Planning"). Question-shaped subheadings should be added alongside them.

## Rewrite brief

1. Keep all five pillars and their existing production-experience prose — that material is the site's actual moat and matches what Google is rewarding.
2. Add the missing **taxonomy**, **comparison-table** and **cost** sections listed above.
3. Add **question-shaped H2/H3s** that mirror live PAA phrasing.
4. Expand FAQ blocks from 6 to cover the real PAA set (FAQPage schema is already wired up).
5. Sharpen the first-person production detail everywhere — it is the differentiator the SERP data says is being rewarded.

## Recommended next round (not built in this pass)

The four *wide-open* comparison terms above deserve their own pages rather than sections buried inside a pillar — `mcp-vs-function-calling` and `voice-ai-agent-latency` in particular have no brand moat and a personal blog already ranking. Flagged rather than silently built, consistent with how `keywords.md` handled the 6th-guide question.
