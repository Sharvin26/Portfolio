---
title: "LLM Evaluation: A Practitioner's Guide to Evals That Actually Catch Regressions"
description: "A practitioner's guide to LLM evaluation: golden datasets, scorers, LLM-as-judge, online vs. offline evals, and the failure modes that quietly break eval suites."
tldr: "LLM evaluation is the discipline of measuring whether your AI system's outputs are actually good, before and after you ship changes to prompts, models, or retrieval. Most teams either skip it entirely and find out about regressions from angry users, or build an eval framework so heavy nobody runs it. This guide covers the architecture that works in production, real TypeScript code for the harness, the failure modes I keep seeing, and when you genuinely don't need any of this yet."
publishDate: 2026-09-16
primaryKeyword: "llm evaluation"
category: "Evaluation"
relatedSlugs: ["rag", "mcp", "ai-agents", "voice-ai-agents"]
faqs:
  - question: "What is the difference between LLM evals and benchmarks?"
    answer: "A benchmark is a public, fixed dataset used to compare models against each other - it answers 'which model is generally more capable'. An eval is a private test suite built from your own data that answers 'did my change make my product better'. Benchmarks suffer from contamination, since models may have trained on the test set, and they say nothing about your prompts, retrieval or tools. In practice benchmarks inform which model you try first, and evals decide whether you ship it. I have had projects where a lower-ranked model won the eval decisively because it followed formatting instructions more reliably."
  - question: "What are the main LLM evaluation metrics?"
    answer: "They fall into three groups. Deterministic metrics are computed in code - exact match, JSON schema validity, citation presence, latency, cost - and you should push as much of your suite into this group as possible. Reference-based metrics compare against a known-correct answer. Reference-free metrics score a property with no gold answer, which is where LLM-as-a-judge lives, along with the four RAG metrics: context precision and context recall for retrieval, faithfulness and answer relevancy for generation. Agents add trajectory metrics such as tool-selection accuracy and recovery rate after a failed call."
  - question: "What is an LLM evaluation rubric and how do I write one?"
    answer: "A rubric is the scoring criteria a judge - human or model - applies to an output, and when you use LLM-as-a-judge the rubric is your measurement instrument. Use binary or three-point scales rather than 1-10, because both humans and models cluster in the middle of wide scales. Ask about one dimension per judge call instead of requesting an overall score. Anchor each point with a concrete example from your own data, and phrase criteria as observable properties ('contains a claim not present in the provided context') rather than judgements ('is inaccurate'). Then validate the judge against roughly 50 hand-labelled examples before trusting it at scale."
  - question: "What should I capture for LLM observability?"
    answer: "Five things on every production request: the full trace of model calls, retrieval and tool executions with their nesting; the complete assembled prompt and response including retrieved context as it actually arrived; cost and token accounting per step attributed to a user or tenant; latency broken down per stage rather than just end-to-end; and quality signals from online scorers, explicit feedback and implicit signals like regeneration or escalation. The last one is what closes the loop - a badly scored production request should land in your golden dataset in one click, or your dataset will stop growing exactly when it starts to matter."
  - question: "What is LLM evaluation and why does it matter?"
    answer: "LLM evaluation is the process of systematically scoring an AI system's outputs against a dataset of representative cases, so you can tell whether a change to a prompt, model, or retrieval pipeline made things better or worse. It matters because LLMs are non-deterministic and prompt changes have non-local effects - a tweak that fixes one case can silently break five others. Without evals, teams find out about regressions from user complaints instead of a test run."
  - question: "What's the difference between offline and online LLM evaluation?"
    answer: "Offline evals run against a fixed, curated dataset before you deploy - think of it as a test suite for your AI system, run in CI or before a release. Online evals score live production traffic after deployment, usually a sample of real requests, to catch drift, distribution shifts, and failure modes your offline dataset never anticipated. Mature teams run both: offline evals gate releases, online evals feed the next round of golden examples."
  - question: "Should I use LLM-as-judge or rule-based scoring?"
    answer: "Use rule-based scoring (exact match, regex, JSON schema validation, unit-test-style assertions) for anything that has a checkable right answer or a hard structural requirement - it's fast, cheap, deterministic, and immune to judge drift. Reserve LLM-as-judge for genuinely subjective qualities like tone, helpfulness, or faithfulness to a source document, where a rubric and a capable judge model outperform trying to hand-write regex for 'sounds professional.' Most production eval suites use both side by side, and add human review as a third layer for anything high-stakes or ambiguous."
  - question: "How do I evaluate a RAG system differently from a plain chatbot?"
    answer: "A plain chatbot eval mostly scores the final response. A RAG system needs at least two additional layers: retrieval quality (did the right chunks get pulled - precision/recall against a labeled set of query-to-document mappings) and faithfulness (is the generated answer actually grounded in the retrieved context, or is the model hallucinating on top of good retrieval). Scoring only the final answer hides which half of the pipeline is broken. See the RAG guide for the retrieval-specific metrics."
  - question: "What's a realistic eval dataset size to start with?"
    answer: "I've seen useful signal from as few as 30-50 well-chosen cases, as long as they're real production examples (or close proxies) covering your known edge cases and failure modes - not made-up happy-path examples. Volume matters less than relevance early on. What matters is growing the set every time production surfaces a new failure mode, so the dataset compounds in value instead of staying static."
  - question: "Do I need a dedicated eval framework like promptfoo or Braintrust, or can I just write scripts?"
    answer: "For a side project, an internal tool with a human always in the loop, or a prototype you're not sure will survive contact with real users, a plain script that loops over a JSON file and logs pass/fail is genuinely fine - don't add infrastructure you don't need yet. Reach for a dedicated framework (promptfoo, Braintrust, OpenAI Evals) once you have more than one person touching prompts, you need to compare runs over time, or a regression in production would be expensive enough that you want a gate in CI, not just a script someone might remember to run."
---

## What "Evals" Actually Means, and Why Skipping Them Means Shipping Blind

LLM evaluation is just testing, applied to a system whose outputs aren't deterministic. You give a system a set of inputs, capture what it produces, score those outputs against some definition of "good," and track that score over time. That's it. The word "evals" makes it sound like a research artifact borrowed from academic benchmarking, and historically it was - but for a team shipping a product feature built on an LLM, evaluation is closer to a test suite than to a leaderboard entry.

The eval mistake I see most often, across RAG chatbots, support agents, and internal copilots alike, is treating prompt and model changes like they're free to make. A team ships a feature, it works well enough in the demo, and from then on every change to the system prompt, every model upgrade, every tweak to the retrieval pipeline gets judged by "I tried it a few times and it looked fine." That works until it doesn't - usually right after a model provider ships a new version, or a well-intentioned prompt edit fixes one complaint and quietly breaks a dozen other cases nobody re-checked. Nobody notices for days, because there's no test suite to notice for them. In traditional software this would be unthinkable - nobody ships a refactor without running the tests - but because LLM output is fuzzy, teams convince themselves fuzzy testing isn't real testing. It is. It just needs different tools than `assert equals`.

The architecture diagram above shows the loop this guide is built around: a golden dataset runs through your system under test, produces outputs, those outputs get scored by scorers or judges, and the results roll up into a report that feeds the next iteration - including growing the dataset itself. Everything below is detail on each stage of that loop.

## LLM Evals vs. Benchmarks: Not the Same Thing

This distinction causes more confused conversations than any other in evaluation, because both activities produce a number that looks like a score.

<div class="table-scroll">

| | **Benchmarks** | **Evals** |
|---|---|---|
| Data | Public, fixed, shared across the industry | Private, drawn from your own traffic |
| Question answered | "Which model is generally more capable?" | "Did my change make *my product* better?" |
| Used for | Model selection, research comparison | Release gating, regression detection |
| Lifespan | Static, until the benchmark saturates | Grows continuously as you find new failures |
| Main weakness | Contamination - models may have trained on the test set | Only as good as the dataset you bothered to build |

</div>

A benchmark tells you something about a *model*. An eval tells you something about a *system* - your prompts, your retrieval, your tools, your model, wired together. A model that tops a public leaderboard can still be worse for your use case, and that's not a paradox; it's the expected outcome when a general capability measure meets a specific application.

The practical consequence: **benchmarks inform which model you try first, and evals decide whether you ship it.** I've had client projects where a lower-ranked model won the eval decisively because it followed formatting instructions more reliably, which mattered far more for that product than the reasoning gap the leaderboard was measuring. Choosing a model on benchmark position alone is how teams end up with an expensive upgrade that made their product worse.

## LLM Evaluation Metrics: What to Actually Measure

"LLM evaluation metrics" gets treated as one list, but the metrics fall into three groups that behave very differently, and mixing them into a single average is how teams end up with a number that moves for reasons nobody can explain.

**Deterministic metrics** — computed in code, no model involved. Exact match, JSON schema validity, regex conformance, "did it cite a source," "is it under the length limit," latency, token count, cost per request. These are cheap, instant, and perfectly reproducible. Push as much of your suite into this category as you possibly can; teams consistently reach for a judge model when a three-line assertion would have done the job.

**Reference-based metrics** — compare an output against a known-correct answer. Semantic similarity against a gold response, or classic n-gram overlap measures like BLEU and ROUGE, which are largely obsolete for open-ended generation but still fine when the output space is genuinely narrow. These require you to have written the right answer down, which is the expensive part.

**Reference-free / judged metrics** — score a property of the output with no gold answer available. This is where LLM-as-a-judge lives, and where the RAG-specific metrics sit:

<div class="table-scroll">

| Metric | Question it answers | Which half it tests |
|---|---|---|
| **Context precision** | Of the chunks retrieved, how many were actually relevant? | Retrieval |
| **Context recall** | Of the chunks that mattered, how many were retrieved? | Retrieval |
| **Faithfulness / groundedness** | Is every claim in the answer supported by the retrieved context? | Generation |
| **Answer relevancy** | Does the answer address the question that was asked? | Generation |

</div>

Splitting those four is the whole reason RAG evaluation works. An answer can be perfectly faithful to context that was completely irrelevant, and it will score well on faithfulness while being useless. The open-source [RAGAS](https://github.com/explodinggradients/ragas) framework formalises this split if you'd rather adopt an existing metric implementation than write your own.

For agents, add **trajectory metrics** on top: tool-selection accuracy, step count versus an optimal path, recovery rate after a failed tool call, and how often the run terminates without an answer. A final-answer-only score rewards an agent that stumbled to the right result through six wrong turns.

The metric that overrides all of the above is whichever one correlates with a real user outcome. If your faithfulness score climbs while support escalations stay flat, you improved a number, not a product.

### Designing an Evaluation Rubric That Judges Can Actually Apply

If you're using LLM-as-a-judge, the rubric *is* the measurement instrument, and a vague rubric produces noise dressed as data. "Rate the helpfulness of this answer from 1 to 10" is close to worthless - you'll get 7s and 8s forever, and two runs on the same input will disagree.

What works, consistently:

- **Binary or three-point scales, not 1-10.** Humans and models both cluster in the middle of wide scales. "Pass / fail" or "correct / partially correct / incorrect" produces far more stable signal.
- **One dimension per judge call.** Ask separately about faithfulness, tone, and format. A single prompt asking for an overall score silently averages dimensions you needed to see move independently.
- **Anchor every point on the scale with a concrete example.** Show the judge what a failing answer looks like and what a passing one looks like, drawn from your own data.
- **State the criteria as observable properties**, not as feelings. "Contains a claim not present in the provided context" is checkable; "is inaccurate" is an invitation to guess.
- **Validate the judge against humans before trusting it.** Score 50 examples by hand, run the judge on the same 50, and measure agreement. If the judge doesn't track your own labels, fix the rubric before you scale it to thousands of cases - otherwise you're automating a measurement you never verified.

Zheng et al.'s [*Judging LLM-as-a-Judge*](https://arxiv.org/abs/2306.05685) is the reference worth reading here: it documents both that strong judge models can reach agreement with human preferences comparable to the agreement between two humans, and the specific biases - position, verbosity, self-preference - that make an unvalidated judge untrustworthy.

## The Architecture of an LLM Evaluation Framework

An LLM evaluation framework has four moving parts, and getting the first one right matters more than any tooling decision you'll make afterward.

### Golden datasets: the part everyone underinvests in

Your eval dataset is a set of `{input, expected or reference, metadata}` triples that represent the inputs your system actually needs to handle well. The single biggest predictor of whether an eval suite is useful, in my experience, is whether the dataset is built from real production traffic and real failure reports, versus invented by an engineer imagining what users might ask.

Concretely, I build golden datasets from three sources, roughly in this priority order:

1. **Production failures.** Every time a user reports a bad answer, or a support agent flags a wrong response, that exact input goes into the dataset with a note on what "good" would have looked like. This is the highest-value case in the entire set, because it's a regression you've already paid for once - you don't want to pay for it twice.
2. **Known edge cases.** Ambiguous questions, adversarial inputs, out-of-scope requests, multi-turn context that requires memory, non-English input if you support it. Write these deliberately; they won't show up in a small production sample early on.
3. **Representative happy paths.** The boring, common cases - necessary as a baseline, but they're the least informative part of the set because they're also the least likely to regress.

A dataset of 30-50 well-chosen cases beats 500 generic ones. Size matters far less than relevance, and a dataset that never grows is a dataset that stops being useful the moment your system moves past the failure modes it was built to catch.

### Scorers: exact-match, rule-based, LLM-as-judge, and human review

Once you have outputs, you need to turn them into a number or a pass/fail. There are four broad categories, and a mature eval suite uses more than one:

- **Exact-match / string comparison.** Cheapest, fastest, zero ambiguity. Useful when there's a genuinely correct string - classification labels, extracted structured fields, yes/no answers.
- **Rule-based / programmatic assertions.** JSON schema validation, regex checks, "does the response contain a citation," "is the response under N tokens," "did the function call use a valid tool name." Still deterministic, but handles structural correctness rather than exact text.
- **LLM-as-judge.** A second LLM call scores the output against a rubric - factual accuracy, tone, helpfulness, faithfulness to a source. This is where most of the recent tooling investment has gone, because it's the only practical way to score open-ended, subjective output at scale. Braintrust's writeup on this is a clear, honest treatment of when it earns its keep: judges are strongest when "the evaluation criteria are subjective but describable in natural language," and weakest as a substitute for anything you could check deterministically instead ([Braintrust, "What is an LLM-as-a-judge?"](https://www.braintrust.dev/articles/what-is-llm-as-a-judge)).
- **Human review.** Still the ground truth for anything ambiguous, high-stakes, or where you're calibrating a judge model in the first place. Doesn't scale to every deploy, but it's how you validate that your automated scorers agree with actual human judgment - and how you catch the failure modes automated scorers systematically miss.

The pattern that works in practice is layered, not either/or: deterministic checks catch structural and factual failures cheaply, LLM judges catch subjective quality issues at a scale humans can't match, and a human samples a slice of both to keep the automated layers honest.

### Online vs. offline evals

Offline evals run against your fixed golden dataset, typically in CI or before a release - this is what gates a deploy. Online evals score a sample of live production traffic after it ships, which is the only way to catch distribution shift: new kinds of questions users actually ask that your golden dataset never anticipated, model provider updates that change behavior underneath you, or slow quality drift that no single release caused. Anthropic's own guidance on building evaluations makes a similar point about prioritizing realistic task distribution over hand-picked examples, and treating eval-building as an iterative, ongoing practice rather than a one-time setup step ([Anthropic, "Define your success criteria and build evaluations"](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)). In practice, the two feed each other: production failures caught by online monitoring become new offline golden cases, which is exactly the "feeds the next iteration" loop in the diagram above.

## Building an Eval Harness in TypeScript

You don't need a framework to start. A useful eval harness is genuinely just: load a dataset, run each case through your system, score the output, aggregate. Here's a minimal one, in the shape I'd actually write for a Node/TypeScript backend:

```typescript
// eval-harness.ts
import { readFileSync } from "node:fs";

type EvalCase = {
  id: string;
  input: string;
  expected?: string;
  metadata?: Record<string, unknown>;
};

type ScoredResult = {
  id: string;
  input: string;
  output: string;
  score: number;
  reason?: string;
};

// The system under test - swap this for your actual RAG pipeline, agent, or chat endpoint.
async function runSystemUnderTest(input: string): Promise<string> {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: input }),
  });
  const { reply } = await res.json();
  return reply;
}

// A rule-based scorer: cheap, deterministic, no LLM call.
function exactMatchScorer(output: string, expected?: string): number {
  if (!expected) return NaN; // not applicable to this case
  return output.trim().toLowerCase() === expected.trim().toLowerCase() ? 1 : 0;
}

// An LLM-as-judge scorer for subjective quality - kept intentionally small and rubric-bound.
async function judgeScorer(input: string, output: string): Promise<{ score: number; reason: string }> {
  const rubric = `Rate the response from 0 to 1 on whether it directly and accurately
answers the user's question, without adding unsupported claims.
Return strict JSON: {"score": number, "reason": string}.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 200,
      messages: [
        { role: "user", content: `${rubric}\n\nQuestion: ${input}\n\nResponse: ${output}` },
      ],
    }),
  });
  const data = await res.json();
  return JSON.parse(data.content[0].text);
}

async function main() {
  const dataset: EvalCase[] = JSON.parse(readFileSync("./eval-dataset.json", "utf-8"));
  const results: ScoredResult[] = [];

  for (const testCase of dataset) {
    const output = await runSystemUnderTest(testCase.input);
    const ruleScore = exactMatchScorer(output, testCase.expected);
    const judged = await judgeScorer(testCase.input, output);

    results.push({
      id: testCase.id,
      input: testCase.input,
      output,
      score: Number.isNaN(ruleScore) ? judged.score : (ruleScore + judged.score) / 2,
      reason: judged.reason,
    });
  }

  const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  console.log(`Average score: ${avg.toFixed(3)} across ${results.length} cases`);
  console.table(results.map((r) => ({ id: r.id, score: r.score.toFixed(2) })));

  // Exit non-zero to fail a CI gate if quality drops below a threshold.
  if (avg < 0.8) process.exit(1);
}

main();
```

That's the entire loop from the diagram, in code: dataset in, system under test, outputs, scorers, a report you can gate a deploy on. It's roughly forty lines, and for a single-prompt system it's often all you need.

Once you outgrow a hand-rolled script - multiple people editing prompts, needing to diff runs over time, or comparing providers side by side - reaching for a dedicated tool saves real time. A few worth knowing, each verified against its current docs:

- **[promptfoo](https://www.promptfoo.dev/docs/intro/)** is an open-source CLI and library built around a declarative config: you define prompts, providers, and test cases with assertions (`contains`, `equals`, `javascript`, `llm-rubric`, `factuality`, and more), and it runs the matrix and gives you a diffable web UI. It's the fastest path to an LLM evaluation tool that a non-engineer on the team can also read.
- **[OpenAI Evals](https://github.com/openai/evals)** is OpenAI's open-source framework and public registry of benchmarks - useful both for running community evals against a model and as a template for writing your own YAML-defined "model-graded" evals.
- **[Braintrust](https://www.braintrust.dev/docs/evaluate)** leans into the TypeScript/Python `Eval()` function pattern shown in the pseudocode above - you pass it a `data` source, a `task` function, and a list of `scores` (including its open-source `autoevals` scorer library), and it produces a comparable experiment you can track release over release.

None of these replace the golden dataset work above - they're the plumbing around it, and the plumbing matters far less than the data.

## Failure Modes I See Constantly

An eval suite that exists is not the same thing as an eval suite that's telling you the truth. Three failure modes account for most of the eval work I end up redoing for clients.

### Overfitting to your own eval set

If the same 50 examples sit in your dataset for a year, and every prompt tweak gets judged only against them, you will eventually produce a prompt that's very good at those 50 examples and mediocre everywhere else - the eval equivalent of teaching to the test. The fix isn't complicated, it's just discipline: treat the golden dataset as a living artifact that grows from production, not a fixed benchmark you tune against indefinitely. Hold out a slice you don't look at during iteration, and rotate in new production failures continuously.

### LLM-as-judge bias and inconsistency

Judge models have documented, specific biases: they tend to prefer longer responses, they favor outputs stylistically similar to their own, and their scores can shift meaningfully between model versions even when your system's output hasn't changed at all. Braintrust's guidance here is blunt and matches what I've seen directly: the judge model should be at least as capable as the model it's judging, because a weaker judge can't reliably discriminate quality above its own ceiling ([Braintrust, "What is an LLM-as-a-judge?"](https://www.braintrust.dev/articles/what-is-llm-as-a-judge)). Practical mitigations that actually help: keep rubrics narrow and specific rather than "rate this response 1-10 for quality"; run the same judge call multiple times and check agreement; and periodically spot-check judge scores against human review to catch drift before it silently changes your pass/fail threshold.

### Evals that don't correlate with real user satisfaction

This is the quiet one. It's entirely possible to have a green eval suite and a product that users are unhappy with, because the dataset measures something adjacent to what users actually care about - technically correct but unhelpfully verbose answers, or answers that pass a factuality check but miss the actual intent behind an ambiguous question. The only real fix is closing the loop back to production: track real user signals (thumbs down, session abandonment, support escalations, regeneration requests) and periodically check whether your eval scores actually move in the same direction as those signals. If they diverge, the eval criteria are wrong, not the product.

## Production Considerations: Cost, Latency, and Data

Running evals costs real money and real time once you're doing it continuously rather than as a one-off exercise, and it's worth budgeting for deliberately rather than discovering the bill later.

**Cost at scale.** LLM-as-judge scorers are extra model calls, and if you're running a few hundred golden cases through both a system call and a judge call on every PR, that adds up fast, especially with a capable judge model. In practice I keep the offline gate dataset small and high-signal (the 50-200 cases that actually catch regressions) and reserve larger-scale evaluation for a nightly or weekly job rather than every commit. Cheap deterministic scorers run on everything; expensive judge calls run on a curated subset.

**Latency of eval-gated deploys.** If your CI pipeline blocks a merge on an eval run that includes dozens of sequential LLM calls, you'll train your own team to route around the gate. Parallelize aggressively (the concurrency pattern shown in Braintrust's `Eval()` API, or a simple `Promise.all` with a concurrency limiter in a hand-rolled harness) and keep the blocking gate to the smallest dataset that still catches your known failure modes - push the comprehensive run to a slower, non-blocking pipeline.

**Data security in eval datasets.** This one gets skipped constantly and shouldn't be. Golden datasets built from real production traffic often contain real user data - names, account details, sometimes PII or content your users reasonably expect to stay private. Treat your eval dataset with the same access controls, retention policy, and redaction discipline as production data itself, not as an internal engineering artifact that's exempt from your data handling policy because it "lives in a JSON file." If you're running judge calls through a third-party model API, that's also user data leaving your infrastructure - know what your data processing agreement with that provider actually covers before you build a dataset full of real customer conversations.

## LLM Observability and Evaluation: Two Halves of the Same Loop

Evaluation and observability answer two different questions that people often conflate. Evaluation asks "is this good, according to a rubric I defined in advance?" Observability asks "what actually happened in this specific production request?" - the full trace of prompts, retrieved context, tool calls, token counts, and latency for a real interaction. You need both, and increasingly the tooling treats them as one pipeline rather than two: a traced production request becomes a new eval case the moment it's flagged as a failure, and eval scorers are frequently the same code running online against sampled production traces.

This is exactly what the OpenTelemetry project has been formalizing with its GenAI semantic conventions - a standard schema for spans, metrics, and events across model calls, tool executions, and agent runs, so that llm observability and evaluation tooling from different vendors can actually interoperate on the same trace data instead of each requiring its own instrumentation ([OpenTelemetry, "OpenTelemetry for Generative AI"](https://opentelemetry.io/blog/2024/otel-generative-ai/)). Practically, if you're already instrumenting your system for tracing, wire your eval harness to consume the same trace format - it means a production failure can be replayed straight into your eval dataset without hand-transcribing it.

### What to Instrument: The Pillars of LLM Observability

Traditional observability has metrics, logs and traces. An LLM system needs those plus a few things that don't exist in ordinary services. What I make sure is captured on every production request:

1. **The full trace** — the span tree for one request: model calls, retrieval, tool executions, and the nesting between them. Without this, debugging a multi-step failure is guesswork.
2. **The complete prompt and response** — including the retrieved context and tool results as they were actually assembled, not a template. Most "the model is broken" reports turn out to be "the prompt didn't contain what you assumed it contained."
3. **Cost and token accounting** — input, output and cached tokens per step, attributed to a user or tenant. This is what makes a runaway agent loop visible as an anomaly rather than a surprise invoice.
4. **Latency per stage** — not just end-to-end. A 4-second response tells you nothing; "3.2s of it was reranking" tells you what to fix.
5. **Quality signals** — online scorer output, explicit user feedback, and implicit signals like regeneration, abandonment or escalation to a human.

The fifth is what closes the loop back to evaluation: a traced request that scores badly or gets thumbs-downed should land in your golden dataset with one click. If adding a production failure to your eval set requires hand-transcribing a prompt, it will not happen, and your dataset will stop growing exactly when it starts mattering.

## How Evaluation Differs Across System Types

The four-stage architecture holds everywhere, but what you're scoring changes a lot depending on what you built.

**Plain chat** is the simplest case: you're mostly scoring the final response against intent - did it answer the question, was the tone right, did it avoid making things up. Exact-match and LLM-as-judge rubrics cover most of it.

**RAG systems** need evaluation at two additional layers the final-answer score hides completely: retrieval quality (precision/recall of the chunks actually pulled, against a labeled set of query-to-document mappings) and faithfulness (is the answer grounded in what was retrieved, or is the model confidently hallucinating on top of correct context). A RAG pipeline can score well on "was the final answer accurate" purely because the model already knew the fact, while retrieval was quietly returning irrelevant chunks the whole time - you won't catch that without scoring the retrieval step separately. I go into the retrieval-specific metrics and chunking tradeoffs in the [RAG guide](/guides/rag).

**Agents** require evaluating the trajectory, not just the final output - which tools got called, in what order, whether the agent recovered from a failed tool call or looped, whether it asked for clarification when it should have rather than guessing. A final-answer-only eval can reward an agent that stumbled into the right answer through an inefficient or unsafe path. This is a big enough topic on its own that I cover trajectory evaluation and the specific failure patterns in multi-step agent systems in the [AI agents guide](/guides/ai-agents), including how it connects to tool-calling reliability if your agent is using [MCP](/guides/mcp) servers for tool access.

**Voice AI agents** add a real-time constraint on top of everything above: you're evaluating not just correctness but latency-under-realistic-load and how gracefully the system handles interruptions, ASR errors, and turn-taking - quality dimensions a text-based eval harness doesn't naturally capture. I cover the specifics of testing a voice pipeline end-to-end in the [voice AI agents guide](/guides/voice-ai-agents).

If you're weighing which of these applies to your own system and want a second opinion on where the evaluation gaps actually are, that's the kind of diagnostic work I do as part of [AI engineering engagements](/#expertise).

## When You Genuinely Don't Need a Heavy Eval Framework

I'll say the thing most eval content won't: not every project needs this. If you're building a low-stakes internal tool where a human reviews every output before it goes anywhere - an internal drafting assistant, an early prototype nobody outside your team has touched yet, a script that summarizes documents for your own reading - the cost of building golden datasets and scorer infrastructure can genuinely exceed the cost of the mistakes it would catch. A human in the loop, reviewing every output before it matters, is itself a form of evaluation, and for low-volume, low-stakes, reversible use cases, it's often sufficient on its own.

The signal to invest in real infrastructure isn't project size, it's exposure: once a change can reach real users without a human checking it first, once more than one person is editing prompts without full context on what the others changed, or once a regression would be expensive enough - in trust, in revenue, in support load - that you'd genuinely want to know about it before your users do, that's when the golden dataset and the scoring loop stop being optional. Build it then, build it from real failures rather than imagined ones, and let it grow with the system instead of freezing it the day you set it up.
