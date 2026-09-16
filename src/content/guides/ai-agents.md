---
title: "AI Agents: What They Actually Are and When to Build One"
description: "A practitioner's guide to AI agents: the plan-act-observe loop, tool calling, memory architecture, real TypeScript code, and when a simple LLM call beats one."
tldr: "An AI agent is an LLM that decides its own next step in a loop - plan, call a tool, observe the result, repeat - instead of following code you wrote in advance. That autonomy is powerful and also the exact thing that makes agents expensive, slow, and prone to confidently doing the wrong thing, so I only reach for one when a deterministic workflow genuinely can't do the job."
publishDate: 2026-09-16
primaryKeyword: "ai agents"
category: "Agents"
relatedSlugs: ["rag", "mcp", "llm-evaluation", "voice-ai-agents"]
faqs:
  - question: "What is the difference between an AI agent and a chatbot?"
    answer: "A chatbot (in the simple sense) takes a message and returns a response - one LLM call, no independent decision-making about what to do next. An AI agent can decide to call a tool, look at what came back, and decide again, for as many steps as the task needs, before it answers. Many products marketed as chatbots are actually agents under the hood once they start calling tools in a loop."
  - question: "Do I need LangChain or a framework to build an AI agent?"
    answer: "No. The core of an agent is a loop around a single API call with tool definitions - maybe 60 lines of code, shown in this guide. Frameworks earn their keep when you need shared infrastructure across many agents (standardized tracing, retry policies, memory backends), not to make the first agent possible. I've shipped production agents with zero framework dependencies more often than not."
  - question: "What are the 5 types of AI agents?"
    answer: "The standard academic taxonomy from Russell and Norvig is simple reflex, model-based reflex, goal-based, utility-based, and learning agents. It is worth knowing because it is reprinted everywhere, but it predates LLMs and its boundaries blur when the reasoning component is a language model. Practically, almost every LLM agent shipping today is a goal-based agent, and it is not a learning agent in the classical sense unless you have built an explicit feedback and retraining loop. The distinction that actually drives engineering decisions is whether you or the model writes the control flow."
  - question: "What is the difference between an AI agent and an AI assistant?"
    answer: "An assistant acts once per human instruction - the human decides each next step. An agent decides its own next step and can run many of them before returning. The practical consequence is supervision: an assistant is useless without a human in the loop turn by turn, whereas an agent is supposed to run unattended, which is exactly why it needs step caps, tool permission scoping, and an evaluation suite that an assistant does not."
  - question: "What are the four main types of agent memory?"
    answer: "Working memory (the current run's message list and tool results), episodic memory (specific past events, such as what was tried and what happened), semantic memory (durable facts like user preferences and domain rules), and procedural memory (how to perform tasks, usually encoded in the system prompt and tool definitions). The split that matters most in practice is episodic versus semantic: current facts should be overwritten when they change, while past events should only ever accumulate. Storing both in one undifferentiated table produces an agent that either forgets current facts or relitigates old failures."
  - question: "When should I use a workflow instead of an AI agent?"
    answer: "Whenever the sequence of steps is predictable enough to write down. A workflow is testable, has bounded cost, and can be explained step by step after the fact - three things an agent gives up in exchange for handling open-ended tasks. I default clients to a workflow and make the case for an agent only when the task genuinely has an unpredictable shape, because the agent's flexibility is also the thing that makes it expensive, slow, and hard to debug."
  - question: "How much does running an AI agent cost compared to a single LLM call?"
    answer: "It depends entirely on step count, and that's the point - a single call has a fixed, predictable cost, while an agent's cost is a distribution with a tail you don't control unless you bound it. Every tool call round-trips the growing conversation history back through the model, so a 10-step agent isn't 10x one call, it's closer to 10x with each step paying for all the tokens before it. Cap max steps and watch your token usage in production; don't estimate from a demo run."
  - question: "Can an AI agent use multiple tools at once?"
    answer: "Yes - most current models support parallel tool calls, returning several tool_use requests in a single turn that you execute concurrently and return together as tool results. This matters for latency (independent lookups run in parallel instead of serially) but doesn't change the fundamental loop structure - plan, act, observe still happens one round at a time."
  - question: "What's the difference between an agent and an MCP server?"
    answer: "They're different layers. An agent is the reasoning loop that decides what to do next. MCP (Model Context Protocol) is a standard for exposing tools and data sources to that agent, so you don't have to hand-write a custom integration for every API. An agent can use zero, one, or many MCP servers as part of its tool surface - MCP doesn't replace the agent loop, it standardizes what feeds into it."
  - question: "Should I build a multi-agent system instead of one agent?"
    answer: "Usually not as a first step. Multi-agent setups (an orchestrator delegating to specialist sub-agents) add coordination overhead, extra failure surface, and cost on top of the single-agent problems you haven't solved yet. I only split into multiple agents when one agent's context gets overloaded with unrelated tool surfaces and responsibilities, not because it sounds more sophisticated."
---

## What Makes Something an "Agent" (and What Doesn't)

"Agent" has become one of those words that means whatever the person saying it needs it to mean this quarter. So let me be precise about the definition I actually use when scoping client work: an AI agent is a system where the model itself decides what to do next, in a loop, based on what it observes - as opposed to a workflow where a human wrote the sequence of steps in advance and the LLM just fills in one blank.

If you send a prompt and get back one response, that's a single LLM call, not an agent - no matter how good the prompt is. If your code calls the model, checks the output against a fixed `if/else`, and calls a different prompt next, that's a workflow - deterministic, testable, and often exactly what you should ship. An agent only enters the picture when the *model* is the one deciding whether to call a tool, which tool, with what arguments, and whether it has enough information to stop.

That decision-making loop - plan the next step, call a tool, observe the result, and decide whether to loop again or answer - is shown in the diagram above. Everything in this guide assumes you've seen it: user request comes in, the model plans a step, calls a tool, observes what came back, and either loops again or breaks out to a final response once it judges it has enough to answer.

Three properties define genuine agentic behavior:

- **Autonomy** - the model chooses its own path through the problem, not just its own words.
- **Tool use** - it can act on the world (call an API, run code, query a database), not just generate text.
- **Iteration** - it can look at the result of one action and change its plan based on what it learned, for more than one round.

Drop any of the three and you're back to a workflow or a single call - which, I'll say up front, is where most production systems should stay. More on that at the end.

## Why This Matters Now

Tool calling itself isn't new - function calling APIs have been generally available since 2023. What changed is that models got reliable enough at multi-step reasoning and tool selection that letting them run for 5, 10, or 20 steps unsupervised stopped being a novelty and started being viable for real workloads: coding agents that read a codebase and open a pull request, research agents that decompose a question and chase down sources, support agents that check three internal systems before answering a ticket.

Anthropic's own framing of this shift is the clearest published articulation of the underlying tradeoff: workflows orchestrate LLMs and tools through code paths you define, while agents let the model direct its own process and tool use dynamically - trading predictability for flexibility on open-ended problems ([Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents), Anthropic). That's an engineering distinction, not a marketing one, and it's the one I use with clients before we've established whether their task actually has an unpredictable shape.

## AI Agents vs. Agentic AI: What's the Difference

Clients ask me this constantly, usually because they've read both terms in the same vendor deck and assumed they're interchangeable marketing words for the same product. They're related but not the same thing, and the distinction is worth holding onto:

**An AI agent** is a specific system - a bounded piece of software with a defined tool surface, a loop, and (ideally) an evaluation suite, built to accomplish a scoped class of tasks. "The support agent that checks order status and issues refunds" is an AI agent. It's concrete, deployable, and gradable.

**Agentic AI** is the broader paradigm or category - the idea of building AI systems that exhibit agent-like properties (autonomy, planning, tool use) as opposed to systems that only respond to single prompts. It describes an architectural approach, not a shippable thing. When someone says "we're going agentic AI," they mean a strategic direction, not a specific artifact.

In practice, I treat "agentic AI" as the category you're operating in and "an AI agent" (or several) as the actual unit of work you scope, build, and evaluate. If a client says "let's do agentic AI" as the goal, my first follow-up is always: which specific agent, with which specific tools, doing which specific job - because "agentic AI" isn't something you deploy, it's something individual agents implement.

## Agent vs. Assistant vs. Chatbot vs. Workflow

Before the architecture, it's worth pinning down four terms that get used interchangeably in vendor material and mean genuinely different things in an engineering discussion:

<div class="table-scroll">

| | Who decides the next step | Can act on the world | Runs multiple steps | Typical failure |
|---|---|---|---|---|
| **Chatbot** | Nobody - one prompt, one reply | No | No | Says something wrong, confidently |
| **AI assistant** | The human, each turn | Sometimes, one action per instruction | Only as the human drives it | Needs constant supervision to be useful |
| **Workflow** | You, in code, in advance | Yes, via steps you wrote | Yes, on a fixed path | Hits a case the author didn't anticipate |
| **AI agent** | The model, at runtime | Yes, tools of its choosing | Yes, until it decides to stop | Loops, burns budget, or confidently does the wrong thing |

</div>

The row that matters commercially is the last two. A workflow and an agent can look identical from the outside - both call tools, both take several steps, both produce an answer. The difference is who wrote the control flow. That single distinction determines whether you can unit-test the path, predict the cost of a run, and explain to a regulator why the system did what it did. I default clients to workflows and make them justify the upgrade to an agent, not the other way round.

## What Are the 5 Types of AI Agents?

Search for agent taxonomies and you'll find the five-type classification from Russell and Norvig's *Artificial Intelligence: A Modern Approach* everywhere, usually reprinted without comment. It predates LLMs by decades and it's still the standard academic framing, so it's worth knowing - but it's worth knowing what it does and doesn't tell you about the thing you're about to build:

1. **Simple reflex agents** act only on the current percept, with condition-action rules. No memory, no model of the world. A thermostat.
2. **Model-based reflex agents** keep internal state to track parts of the world they can't currently see.
3. **Goal-based agents** choose actions by reasoning about which ones move them toward an explicit goal.
4. **Utility-based agents** go further and choose between competing goals by maximising a utility measure - useful when outcomes are graded rather than pass/fail.
5. **Learning agents** improve their own behaviour over time from feedback.

Here's the part the reprints leave out: **almost every LLM agent shipping today is a goal-based agent**, and the taxonomy's boundaries blur badly when the "reasoning" is a language model. An LLM agent has implicit world knowledge in its weights (model-based), pursues a stated objective (goal-based), and can weigh tradeoffs when you ask it to (utility-ish) - but it does not learn from its own production runs unless you build an explicit feedback and fine-tuning loop, so it is *not* a learning agent in the classical sense, no matter how adaptive it feels in conversation.

I've never once scoped a client project by picking a number from this list. The taxonomy that actually drives engineering decisions is the one in the table above - who writes the control flow - plus how many tools the agent can reach and how much damage the worst one can do.

## Architecture: The Control Loop, Tool Calling, and Planning

### The control loop

The diagram above is the whole architecture at the coarsest level: request in, plan, act, observe, loop or exit. What that hides is where the actual engineering effort goes, which is almost entirely in three places - the tool definitions, the memory the loop carries between steps, and the stopping condition.

### Tool calling

Tools are how an agent touches anything outside its own context window. Concretely, in the Anthropic and OpenAI APIs, you declare a tool with a name, a natural-language description, and a JSON Schema for its input. The model doesn't execute anything - it emits a structured request (a `tool_use` block, in Anthropic's API) naming the tool and the arguments it wants to call it with; your code is responsible for actually running that function and returning the result as a `tool_result` block on the next turn ([Claude tool use docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)). This is the same fundamental contract in OpenAI's function calling - the model proposes a call, your infrastructure executes it.

The quality of your tool *descriptions* matters more than most people expect. The model chooses which tool to call and how to fill its arguments based entirely on the name, description, and schema you write - vague descriptions produce vague tool selection. I spend real time iterating on tool descriptions the same way I'd iterate on a prompt, because functionally that's what they are.

If your agent needs to reach a growing set of external systems, standardizing that tool surface with [MCP](/guides/mcp) instead of hand-rolling each integration saves real time once you're past two or three tools - it's worth reading before you build a bespoke tool-registration layer you'll end up replacing anyway.

### AI Agent Memory: Short-Term Scratchpad vs. Long-Term Storage

Memory is the part of agent architecture that gets the least precise treatment in most explainers, so let me split it the way I actually build it:

**Short-term memory (the scratchpad)** is just the growing message list within one run - the conversation history plus every tool call and tool result accumulated so far. This *is* the mechanism by which the agent "remembers" what it already tried three steps ago; there's no separate memory system for this, it's the literal request payload you resend on every turn. The practical implication: this scratchpad grows unbounded as steps accumulate, and every additional step re-sends the entire history, which is where a lot of the cost problems discussed below actually come from.

**Long-term memory** is state that needs to survive across separate runs or sessions - user preferences, facts learned in a previous conversation, a running project state. This has to be handled explicitly, because the API is stateless between requests. Options in rough order of complexity: append summarized facts to a system prompt on each new run; store structured facts in a database and retrieve relevant ones per-run (functionally a [RAG](/guides/rag) pipeline over the agent's own memory); or use a dedicated memory tool that lets the model read and write files it manages itself, which is the pattern Anthropic's memory tool implements directly in the API.

The mistake I see most often is conflating the two: "the agent forgot something from ten steps ago" is a scratchpad/context-management problem (clear stale tool results, summarize, or compact), while "the agent forgot something from last week" is a persistence problem (you need actual storage). They need different fixes, and building a database-backed memory system to solve a within-run context problem is wasted effort.

### The Four Types of Agent Memory

The short-term/long-term split above is the one that governs engineering decisions, but the cognitive-science-derived four-way taxonomy shows up throughout the agent-memory literature and tooling, so here's how it maps onto things you actually build:

<div class="table-scroll">

| Type | What it holds | Where it lives in practice |
|---|---|---|
| **Working** | The current run's reasoning and tool results | The message list you resend each turn - the scratchpad above |
| **Episodic** | Specific past events: what was tried, what happened | A log or database of prior runs, retrieved by similarity or recency |
| **Semantic** | Durable facts: user preferences, domain rules, entity data | A vector store or plain relational table - effectively [RAG](/guides/rag) over the agent's own knowledge |
| **Procedural** | How to do things: skills, workflows, learned conventions | Usually the system prompt and tool definitions; occasionally files the agent maintains itself |

</div>

The distinction that earns its keep here is **episodic vs. semantic**. "The customer's plan is Enterprise" is semantic - one current fact, overwrite it when it changes. "We tried the refund flow on Tuesday and it failed with a 409" is episodic - an event with a timestamp that stays true forever and should never be overwritten, only accumulated. Teams that store both in one undifferentiated "memory" table end up with an agent that either forgets current facts or relitigates old failures, and it is genuinely hard to debug after the fact.

Procedural memory is the one I'd caution against over-engineering. In nearly every production system I've built, "procedural memory" is a well-maintained system prompt, and framing it as a memory subsystem invites complexity that buys nothing.

### Planning strategies: ReAct and beyond

The dominant pattern for the plan step is ReAct - interleaving explicit reasoning traces with actions, where the reasoning helps the model track its plan and handle unexpected tool outputs rather than acting open-loop ([Yao et al., 2022](https://arxiv.org/abs/2210.03629)). In modern Claude and GPT-class models, you mostly get this for free through extended/adaptive thinking plus tool use - the model reasons, calls a tool, reasons about the result, and decides its next move, without you hand-constructing a "Thought: ... Action: ... Observation: ..." prompt template the way the original 2022 implementations did. The underlying idea - interleave reasoning with action instead of committing to a full plan upfront - is still exactly what's happening under the hood, and it's worth reading the paper once to see why this beats pure chain-of-thought or pure action-only baselines on multi-step tasks.

Where I still write explicit planning logic by hand is in agents where the search space is large enough that letting the model freewheel step-by-step wastes calls - for those, an upfront decomposition step ("break this into a list of subtasks first, then execute each one") before entering the reactive loop tends to converge faster and more predictably than pure ReAct.

## AI Orchestration: Coordinating Multiple Agents and Tools

"Orchestration" gets used loosely, so here's how I scope it: orchestration is the layer that decides which agent, tool, or workflow handles a given piece of work, and how results flow between them - as distinct from the agent loop itself, which decides what to do *within* one agent's turn.

Three orchestration shapes come up repeatedly in production work:

- **Single agent, many tools.** The most common shape by far. One control loop, a wide tool surface (search, a database query tool, a code execution tool, maybe an MCP connector). The "orchestration" here is really just tool selection inside the loop - no separate coordination layer needed.
- **Orchestrator-workers.** A top-level agent decomposes a task and delegates pieces to specialized sub-agents or sub-calls, then synthesizes their outputs. This is genuine multi-agent orchestration - useful when one agent's context would otherwise get overloaded with unrelated tool surfaces (e.g., one sub-agent that only does document retrieval, another that only writes code, coordinated by a planner that never touches either tool surface directly).
- **Deterministic workflow, agent as a step.** Often the right answer: a fixed pipeline (validate input → route → format output) where exactly one step is an open-ended agent call, because that step is the only part of the task that can't be fully specified in advance. This gets you most of the reliability of a workflow while still letting the genuinely unpredictable part behave like an agent.

The failure pattern I see most is reaching for orchestrator-workers by default because it looks more sophisticated in an architecture diagram, when a single agent with a well-scoped tool list would do the job with a fraction of the coordination overhead and failure surface. Add a second agent when the first one's job is measurably too broad - not preemptively.

## AI Agents Examples: Three Patterns I Actually Ship

Abstractions are easier to evaluate against concrete cases, so here are three agent shapes I've built for clients, each illustrating a different point on the complexity spectrum.

**1. A support-ticket triage agent.** Given an incoming ticket, the agent has tools to look up the customer's account, check recent order status, and search a knowledge base. It plans which lookups it needs (not always all three), calls them, and either drafts a response or escalates to a human with a structured summary of what it already checked. This is a narrow, well-scoped agent - maybe 3 tools, a hard step cap of 6, and it never takes an irreversible action (refunds, cancellations) without a human approving the specific action first. This is the shape that actually ships reliably in production, because the tool surface is small and every tool is read-only or requires approval.

**2. A codebase research agent.** Given a bug report, the agent searches the repository, reads relevant files, runs the test suite, and forms a hypothesis about the root cause before proposing a fix - genuinely unpredictable step count and path, because which files matter depends entirely on what it finds. This is the case where an agent earns its complexity: a deterministic workflow can't know in advance which files are relevant, so the model has to explore. It's also the case where I invest the most in a hard step limit and cost monitoring, because "explore until you understand the bug" has no natural stopping point without one.

**3. A retrieval-augmented research agent.** This combines [RAG](/guides/rag) with agentic control: instead of a single retrieve-then-generate pass, the agent decides whether its first retrieval was sufficient, reformulates the query if not, and can call a second, differently-scoped retrieval before answering. The agentic layer here is thin - usually 1-3 loop iterations - but it measurably improves answer quality on queries where a single retrieval pass returns weak results, which is common enough in real corpora that it's worth the added complexity over plain RAG.

Notice what these have in common: a small, purpose-built tool list, a hard cap on steps, and a clear handoff point. None of them are "general-purpose assistants that can do anything" - that framing is where scope creep and unreliability both start.

## Building a Minimal Agent Loop in TypeScript

Here's the actual shape of a minimal agent - a manual loop against the Anthropic Messages API, with one typed tool. I'm using a hand-written loop rather than a framework here because seeing the mechanics once makes every abstraction built on top of it easier to reason about; production code can lean on the SDK's tool-runner helper once the shape is familiar.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// One tool: look up order status from an internal system.
// The description and schema are what the model uses to decide when
// and how to call this - treat them like a prompt, not an afterthought.
const tools: Anthropic.Tool[] = [
  {
    name: "get_order_status",
    description:
      "Look up the current status of a customer order by order ID. " +
      "Returns shipping status, estimated delivery, and any exceptions.",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "e.g. ORD-48213" },
      },
      required: ["order_id"],
    },
  },
];

async function getOrderStatus(orderId: string): Promise<string> {
  // Replace with a real internal API call.
  return JSON.stringify({
    order_id: orderId,
    status: "shipped",
    estimated_delivery: "2026-09-19",
  });
}

const MAX_STEPS = 6; // hard cap - see "Failure Modes" below

async function runAgent(userMessage: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      tools,
      messages,
    });

    // Model decided it has enough to answer - this is the "Final Response"
    // branch from the control-loop diagram above.
    if (response.stop_reason !== "tool_use") {
      const text = response.content.find((b) => b.type === "text");
      return text?.type === "text" ? text.text : "";
    }

    messages.push({ role: "assistant", content: response.content });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      if (block.name === "get_order_status") {
        // Never trust tool input shape blindly - validate before use.
        const input = block.input as { order_id?: string };
        if (typeof input.order_id !== "string") {
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            is_error: true,
            content: "order_id was missing or not a string",
          });
          continue;
        }
        const result = await getOrderStatus(input.order_id);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    // All tool_result blocks for this turn go back in a single user
    // message - splitting them across messages breaks parallel tool use.
    messages.push({ role: "user", content: toolResults });
  }

  return "Reached max steps without a final answer - escalating to a human.";
}
```

The parts worth calling out because they're easy to skip in a rushed prototype: the `MAX_STEPS` cap, validating tool input before you act on it rather than trusting the model's JSON blindly, and returning `is_error: true` on a bad call instead of silently swallowing it. All three show up in the failure modes below because leaving any of them out is exactly how demos turn into incidents. For a bigger tool surface, the SDK's tool-runner helper (`client.beta.messages.toolRunner`) automates this exact loop - I still write the manual version first on any new project so I understand precisely what it's automating.

## Failure Modes and How I Mitigate Them

**Infinite or runaway tool-call loops.** Without an explicit step cap, an agent that keeps deciding "I need one more piece of information" has no natural brake. Mitigation is boring and non-negotiable: a hard `MAX_STEPS`, enforced in your loop, not left to the model's judgment. I set it based on the task's realistic step count plus a margin, not a round number picked out of the air.

**Cost blowouts from unbounded steps.** This compounds with the above - every additional step resends the entire growing message history, so cost grows roughly quadratically with step count, not linearly. I log token usage per step in development against realistic inputs before I ever estimate a per-run cost for a client, because the number from a clean demo run and the number from a messy real input are routinely off by 3-5x.

**Prompt injection via tool outputs.** Tool results go straight back into the model's context as if they were trusted input - if a tool fetches a web page, a document, or user-generated content, anything embedded in that content can attempt to redirect the agent ("ignore previous instructions and instead..."). I treat every tool output as untrusted exactly the way I'd treat user input to a web app: never let a tool result alone authorize a higher-privilege action, and for anything consequential, require confirmation that doesn't originate from tool content.

**The agent confidently doing the wrong thing.** This is the failure I see most often in client post-mortems, and it's hardest to catch by eyeballing outputs, because a wrong answer from a broken agent often *reads* just as fluent as a correct one. There's no shortcut around this other than a real evaluation suite before you trust an agent's output - see the evaluation section below and my [LLM evaluation guide](/guides/llm-evaluation). Guardrails (output validation, a second-pass check, human review on high-stakes actions) catch what evals miss in production, but evals are what tell you the failure rate in the first place.

## What Does an AI Agent Actually Cost to Run?

This is the question that decides whether a project ships, and it's chronically under-answered because the arithmetic is unintuitive. The key mechanic: **an agent re-sends its entire accumulated context on every step.** Your message list on step 8 contains the original request plus seven rounds of tool calls and results.

So a single LLM call bills roughly one prompt. An eight-step agent bills something closer to the *sum* of a growing prompt eight times over - the tokens compound, they don't add linearly. An agent run is routinely one to two orders of magnitude more expensive than the single call it replaced, and the variance between a clean run and a confused one is enormous, because a confused agent takes more steps with a longer history on each one.

The levers I actually pull, in the order I reach for them:

- **Cap the step count.** A hard maximum is a cost control and a safety control at once. Most tasks that can't finish in ten steps aren't going to finish in thirty; they're looping.
- **Prune the scratchpad.** Old tool results are usually the largest thing in context and the least useful. Dropping or summarising results older than a few steps cuts cost without measurably hurting quality on most tasks.
- **Cache the stable prefix.** System prompt and tool definitions are identical on every step of every run. Prompt caching turns the most repetitive part of the bill into a fraction of its uncached cost - this is the single highest-leverage change on a chatty agent.
- **Route by difficulty.** Not every step needs your most capable model. Tool-argument formatting and simple extraction steps run fine on a smaller, cheaper model; reserve the frontier model for the planning steps.
- **Ask whether it should be a workflow.** The cheapest agent is the one you didn't build. If the path is actually predictable, hard-coding it removes the token cost of having the model rediscover it on every run.

Budget for the tail, not the median. Alert on cost per run, not just cost per month - a runaway loop shows up as one run costing fifty times the median long before it shows up on the monthly invoice.

## Production Considerations

**Cost of multi-step runs.** Treat an agent's cost as a distribution, not a number - measure p50 and p95 step counts on real traffic, not your dev-time test cases, before you commit to a per-request price in a client proposal.

**Latency and UX for long-running agents.** A 15-second wait with no feedback reads as broken to a user, even when it's working correctly. Stream intermediate steps back to the UI - "Checking order status...", "Looking up shipping carrier..." - so the user sees progress instead of a spinner. This is a UX requirement, not a nice-to-have, for anything that takes more than a couple of seconds.

**Autonomy vs. human approval.** Decide, per tool, whether it's safe to auto-execute or needs a human in the loop before it runs - this is a security and product decision, not just an engineering one. Read-only lookups (check order status, search documentation) are usually fine to auto-execute. Anything irreversible or costly (refunds, sending external emails, deleting data, spending money) should require explicit approval, at least until the agent has a long enough track record on that specific action for you to trust it unsupervised - and even then, I keep a spend or blast-radius ceiling on autonomous actions as a backstop.

## How to Evaluate an Agent

Final-answer accuracy is necessary but nowhere near sufficient for agents, because two runs can reach the same correct answer through very different paths - one efficient and one that got there by accident after calling the wrong tool three times. I evaluate agents on:

- **Final-answer correctness** - the baseline check, same as any LLM output.
- **Trajectory correctness** - did it call the *right* tools, in a sensible order, with valid arguments? This catches cases where the agent got lucky (a wrong tool call happened not to matter for this particular input) that final-answer checks alone will never surface, and it's usually a stronger predictor of reliability on inputs you haven't tested yet.
- **Step efficiency** - how many steps did it actually need versus how many it took? A correct answer reached in 12 steps instead of 4 is a cost and latency problem hiding behind a passing eval.
- **Tool-call validity** - did every tool call have well-formed, schema-valid arguments, and did the agent handle tool errors sensibly instead of retrying blindly or hallucinating a result?

This is genuinely harder to build than a simple input/output eval set, because you need labeled or graded trajectories, not just labeled final answers. I cover how I build and score these evals in more depth in my [guide to LLM evaluation](/guides/llm-evaluation) - it's the single highest-leverage thing to build before an agent goes anywhere near production traffic, and it's the piece teams skip most often under deadline pressure.

## When Not to Build an Agent

I'll say the unpopular part directly, because it's the honest answer more often than the hype cycle wants it to be: most tasks I get asked to "build an agent" for don't need one.

If you can write down the steps in advance - even if there are several of them, even if there's some branching - you want a deterministic workflow, not an agent. A workflow is cheaper to run, faster, easier to test, and fails in ways you can predict and catch, because you wrote every path it can take. An agent's flexibility is a cost you pay for genuinely open-ended problems; spending that cost on a problem with a known shape just buys you unpredictability you didn't need.

Concretely, I push back toward a simpler architecture when:

- The task has a fixed, enumerable set of steps, even if there are 5-6 of them with some conditional branching - that's a workflow with an `if` statement, not an agent.
- A single well-scoped LLM call with good context (possibly [retrieval-augmented](/guides/rag)) already gets the answer right, and the "agent" version's only addition is a tool call that could just as easily be a function call your code makes before the prompt, not something the model needs to decide to invoke.
- The cost of an occasional wrong output is low and easily caught downstream - in that case, the reliability tax of a multi-step autonomous loop usually isn't worth paying versus a simpler, cheaper call with a human spot-checking output.
- You need hard latency or cost guarantees per request - an agent's variable step count makes both hard to bound tightly, and a workflow's fixed cost is a feature there, not a limitation.

The specialized real-time case worth calling out separately is voice - a voice agent has to make tool-calling decisions inside a latency budget measured in a few hundred milliseconds, which changes the engineering tradeoffs enough that I treat it as its own discipline; see my [guide to voice AI agents](/guides/voice-ai-agents) if that's the shape of problem you're solving. For everything else, my default scoping question with a new client is still: what's the smallest, most boring architecture that gets this job done reliably, and does the task actually force us past it? Usually the honest answer is a single call or a workflow. When it isn't - when the steps genuinely can't be known in advance - that's when an agent, scoped tightly and evaluated properly, earns its keep. I go deeper on scoping this kind of work in the [Expertise section](/#expertise) of my site.
