---
title: "Voice AI Agents: Architecture, Latency, and Production Lessons"
description: "A practitioner's guide to building voice AI agents: architecture, latency budgets, turn-taking, barge-in, evaluation metrics, and when a good IVR beats one."
tldr: "Voice AI agents are the agent loop from text-based systems wrapped in a much tighter latency budget, plus a turn-taking layer that has to decide, in real time, who's allowed to talk. Most of the hard engineering isn't the LLM - it's ASR accuracy on names and numbers, barge-in handling, and shaving milliseconds out of a cascaded pipeline (or betting on a speech-to-speech model instead). Build one when voice is the interface your users actually want; don't build one just because it's possible."
publishDate: 2026-09-16
primaryKeyword: "voice ai agents"
category: "Voice AI"
relatedSlugs: ["rag", "mcp", "llm-evaluation", "ai-agents"]
faqs:
  - question: "What is considered acceptable latency for a voice AI agent?"
    answer: "Two different numbers get conflated here. ITU-T Recommendation G.114 sets 150 ms one-way as the upper bound for network transmission delay in a satisfying conversation - but that is a budget for carrying audio, not for a model thinking. The number that decides whether your agent feels human is perceived response time: the gap between the caller finishing and the first audio of the reply arriving. Natural human turn gaps cluster near 0-200 ms, and delays past roughly 700 ms start carrying social meaning. The working target I give clients is sub-800 ms perceived response time, with 1.2 s as the point where call quality visibly degrades. Anyone promising 200 ms end-to-end on a cloud-hosted tool-calling agent is quoting the network number, not the response number."
  - question: "How do I reduce latency in a voice AI agent?"
    answer: "In order of leverage: prefetch likely tool lookups while the caller is still speaking, because a single round of tool calling can roughly double perceived response time and is the real latency cliff. Start LLM reasoning on stable ASR partial transcripts instead of waiting for a finalised one. Stream LLM output into TTS at sentence boundaries so synthesis overlaps generation. Tune endpointing aggressively, since deciding the caller actually stopped is often the largest single chunk of dead air. And optimise time-to-first-audio rather than total response time - once audio starts playing, the caller is occupied, so a slower total response that starts sooner beats a faster one that starts late."
  - question: "How much do voice AI agents cost to run?"
    answer: "Voice is billed by conversation duration rather than question size, so a rambling caller costs proportionally more for an identical task. There are four line items and teams usually model only the first: the model itself (audio tokens both ways for speech-to-speech, or text rates plus separate ASR and TTS bills if cascaded), ASR and TTS, telephony carrier minutes and number rental, and your own infrastructure - which is sized by concurrent open media sessions rather than request count. Model it per call type rather than off one demo call. The metric that decides whether the economics work is containment rate, not cost per minute: an agent that handles 70% of a call and then escalates has cost you the agent plus the human."
  - question: "What's the difference between a voice AI agent and a chatbot with text-to-speech bolted on?"
    answer: "A chatbot with TTS bolted on takes a full user turn, runs it through the same request/response loop as a text agent, then reads the answer aloud - there's no sense of real-time conversation. A genuine voice AI agent has to handle streaming partial transcripts, decide when the caller has actually finished speaking (endpointing), allow the caller to interrupt it mid-sentence (barge-in), and start generating a response before it has the complete final transcript. The turn-taking and interruption layer is the part that's missing when someone just pipes a chat agent's output into a TTS API."
  - question: "What latency should I target for a voice AI agent?"
    answer: "Conversational speech science puts the natural human turn-taking gap at a mode of 0-200ms, with anything past roughly 700ms read as a meaningful pause rather than normal timing (Stivers et al., 2009, PNAS). In practice, most production cascaded pipelines (ASR -> LLM -> TTS) target well under a second from end-of-speech to first audio out, and speech-to-speech models exist specifically to get closer to that natural range. Anything that regularly clears 1.5-2 seconds will feel broken to callers, regardless of how good the answer is."
  - question: "Should I build a voice agent with a cascaded ASR-LLM-TTS pipeline or a speech-to-speech model?"
    answer: "Cascaded pipelines give you a text transcript at every step, which means you can log, guardrail, and swap components independently - useful if you need to bolt on retrieval or strict business logic. Speech-to-speech (realtime multimodal) models like OpenAI's gpt-realtime or Google's Gemini Live API skip the discrete ASR/TTS stages entirely, which cuts latency and preserves tone/prosody, but gives you less visibility into exactly what the model 'heard.' Most teams building anything with compliance or accuracy requirements start cascaded and only move to speech-to-speech once they've proven out the conversation design."
  - question: "How do voice agents handle interruptions (barge-in)?"
    answer: "A voice activity detection (VAD) layer sits between the caller's audio and the agent, watching for speech energy while the agent is talking. When it fires, the client (or the realtime API) truncates the agent's in-flight response, stops sending queued audio to the caller, and the agent has to decide whether to abandon its answer, shorten it, or acknowledge and re-route. OpenAI's Realtime API and Google's Gemini Live API both expose this as an explicit event your application code has to handle, not something that happens automatically for free."
  - question: "How much does it cost to run a production voice AI agent?"
    answer: "It depends heavily on architecture. Using OpenAI's Realtime API directly, audio input runs $32 per million tokens and audio output $64 per million tokens for the gpt-realtime-2.1 model (per OpenAI's published pricing) - roughly 600 input tokens and 1,200 output tokens per minute of audio, so a minute of back-and-forth conversation lands in the low tens of cents. A cascaded pipeline adds separate ASR and TTS vendor costs on top of LLM tokens, plus telephony minutes if you're on a phone network. Cost scales with call volume and average handle time, so it needs to be modeled per use case, not assumed from a demo."
  - question: "When should I not build a voice AI agent?"
    answer: "Skip it when the task is better served by structured input - a well-designed IVR with DTMF menus is faster and more reliable for narrow, high-volume tasks like 'pay my bill' or 'check my balance.' Skip it when your users are already happy typing, since a text chat agent has none of the latency, ASR-error, or interruption-handling problems voice introduces. And skip it when the cost of a misheard entity is high (say, a wrong account number triggering a wire transfer) and you don't yet have strong confirmation and fallback patterns in place - ship the text agent first, prove the logic, then add voice."
---

## What a Voice AI Agent Actually Is

A voice AI agent is not a text agent with a text-to-speech step glued onto the end. That's the shortcut a lot of teams take first, and it's obvious to callers within one turn: the pauses are too long, the agent talks over you or can't be interrupted, and the whole thing feels like leaving a voicemail and waiting for a reply.

The distinction that matters: a text-based [AI agent](/guides/ai-agents) operates on a turn-based loop - get the full user message, plan, call tools, respond. A voice AI agent runs that same loop, but wrapped inside a real-time audio stream where "the user's turn" isn't a discrete, cleanly delimited event. Speech arrives continuously, in small chunks, and the system has to make live decisions about whether the caller is still talking, has paused to think, or is done and waiting for a reply - all while a partial transcript is still being revised underneath it. Get that layer wrong and it doesn't matter how good your underlying model or your tool-calling logic is; the conversation will feel broken.

In practice, most of what people call "conversational ai voice agents" today fall into two architectures: a cascaded pipeline of automatic speech recognition (ASR), an LLM-based agent with tool calling, and text-to-speech (TTS); or a newer class of speech-to-speech "realtime" models that skip the discrete transcription and synthesis steps. Both are covered below. Either way, the agent's reasoning loop - plan, call a tool, observe, respond - is the same loop you'd build for any [AI agent](/guides/ai-agents); voice just adds a much less forgiving delivery mechanism on top of it.

If you're evaluating whether to build one, keep the buyer's question in mind: an **ai voice agent platform** (Retell, Vapi, Bland, ElevenLabs Agents, and similar) buys you a lot of this plumbing out of the box. Building it yourself buys you control over latency, cost, and data handling. Neither is automatically the right answer - it depends on what you're actually optimizing for, which is the point of this guide.

## Why Voice Is a Genuinely Harder Engineering Problem

I've shipped both text and voice agents for clients, and the honest answer to "why is voice harder" is: almost nothing about the LLM changes, but almost everything around it does.

### The latency budget is brutal

Human conversation has a well-studied rhythm. A cross-linguistic study of ten languages found that the most common (modal) gap between one person finishing a turn and the other starting is between 0 and 200ms, with an overall mode of 0ms across languages - and gaps beyond roughly 700ms start getting interpreted as meaningful (a hesitation, a "no," a dispreferred answer) rather than just normal timing ([Stivers et al., 2009, PNAS](https://pmc.ncbi.nlm.nih.gov/articles/PMC2705608/)). That's the bar callers are unconsciously holding your agent to. You will not hit 200ms with a cloud-hosted, tool-calling LLM agent today, and you don't need to - but every additional hundred milliseconds past roughly a second of end-to-end response time is spent instead of banked, and callers start talking over the agent, repeating themselves, or hanging up.

A text chat agent can take two or three seconds to "think" and the user barely notices, because reading is asynchronous and there's a visible loading state. A phone call has no loading spinner. Silence on a phone line reads as "did the call drop," "is anyone there," or "this isn't working" almost immediately.

### What Counts as Acceptable Latency for a Voice Agent?

Two different numbers get quoted in this conversation and conflating them causes a lot of confused engineering.

**Network latency** is governed by ITU-T Recommendation [G.114](https://www.itu.int/rec/T-REC-G.114), which sets **150 ms one-way** as the upper bound for transmission delay in a conversation where users are satisfied, with quality degrading progressively beyond that. That's a budget for *the network carrying the audio* — it says nothing about a model thinking.

**Response latency** is the number that decides whether your agent feels human: the gap between the caller finishing their sentence and the first audio of the reply reaching their ear. The conversational research cited above puts natural human turn gaps at a mode near 0-200 ms, with delays past roughly 700 ms starting to carry social meaning.

Here's the uncomfortable arithmetic: G.114's entire 150 ms network budget is already a meaningful fraction of a natural turn gap, and that's *before* ASR finalises, before the LLM produces a first token, and before TTS synthesises a first phoneme. Which is why the working target I give clients is **sub-800 ms perceived response time, with 1.2 s as the point where call quality visibly degrades** — not 200 ms. Anyone promising human-parity turn timing on a cloud-hosted tool-calling agent is quoting the wrong number.

### A Realistic Latency Budget

Where the time actually goes on a cascaded pipeline, and what you can do about each stage:

<div class="table-scroll">

| Stage | What's happening | Typical lever |
|---|---|---|
| **Endpointing / VAD** | Deciding the caller actually stopped | Often the biggest single win — aggressive endpointing cuts dead air, at the cost of interrupting people who pause mid-thought |
| **ASR finalisation** | Converting audio to committed text | Start reasoning on stable partials instead of waiting for the final transcript |
| **Network to model** | Getting the request to the LLM | Co-locate your relay with the model region; remove every hop you control |
| **LLM time-to-first-token** | The model beginning its reply | Smaller/faster model, shorter system prompt, prompt caching; tool calls add a *whole extra round trip* |
| **TTS time-to-first-audio** | Synthesising the opening of the reply | Stream at sentence or clause boundaries so synthesis overlaps generation |
| **Return network + jitter buffer** | Audio reaching the caller | Mostly carrier-determined; the jitter buffer is a real, often-overlooked cost |

</div>

Three things I've learned the hard way about this table:

1. **Tool calls are the latency cliff, not the model.** A single round of tool calling can roughly double perceived response time, because the model has to generate the call, wait for your tool, then generate the answer. Prefetching the likely lookup while the caller is still speaking is the highest-leverage optimisation available in a voice agent, and almost nobody does it.
2. **Optimise the first token, not the total.** Once audio starts playing the caller is occupied, so time-to-first-audio dominates perceived speed almost entirely. A slower total response that starts sooner beats a faster one that starts late.
3. **Filler audio buys real time, but it's a budget you can overdraw.** A short acknowledgement ("let me check that") while a tool runs genuinely covers 1-2 seconds. Used on every turn it stops reading as natural and starts reading as stalling.

### Turn-taking and barge-in aren't optional

In text, "who's turn is it" is trivial - there's a send button. In voice, you need a voice activity detection (VAD) layer continuously deciding: is the caller still talking, are they pausing to think, did they just interrupt the agent mid-sentence, is that noise on the line actually speech? Every major realtime voice API treats this as a first-class, explicit concern rather than something that "just works" - Google's Gemini Live API calls it out directly as barge-in, describing how the model cancels and discards in-flight generation the moment it detects the user has started talking again ([Gemini Live API docs](https://ai.google.dev/gemini-api/docs/live-api)), and OpenAI's Realtime API requires your application to explicitly truncate the agent's queued audio and conversation state once it detects a `input_audio_buffer.speech_started` event mid-response ([OpenAI Realtime API guide](https://developers.openai.com/api/docs/guides/realtime-conversations)). If you don't wire this up correctly, the agent keeps talking over the caller, or worse, "hears" its own leftover audio as new input.

### ASR errors compound into the LLM's context

This is the failure mode that surprises engineers coming from text-agent work the most. In a text agent, the input is exact - whatever the user typed is what the model sees. In a voice agent, the LLM never sees what the caller said; it sees what the ASR *thinks* the caller said. If the ASR mishears "fifteen" as "fifty," or a caller's surname as a homophone, that error doesn't get flagged - it becomes ground truth for everything downstream: the agent's reasoning, its tool calls, its confirmation back to the caller. A text agent can't get this specific kind of error at all; a voice agent gets it constantly, especially on phone-quality audio (8kHz, background noise, accents the ASR wasn't tuned on) and especially on exactly the entities that matter most operationally - numbers, names, dates, addresses.

## Architecture: Cascaded Pipelines vs. Speech-to-Speech

The diagram above shows the shape every voice agent takes at some level: caller audio in, a turn-taking/barge-in layer deciding when to act, an agent with tool-calling ability doing the reasoning, and synthesized speech back out. What differs between implementations is how many discrete steps sit inside that pipeline.

### The cascaded pipeline (ASR -> Agent -> TTS)

This is still the most common production architecture, and for good reason: every stage produces an inspectable artifact. You get a text transcript from ASR, a text response (plus tool calls) from the LLM, and audio from TTS - which means you can log, evaluate, and guardrail at each boundary independently.

- **ASR**: streaming speech-to-text, ideally with partial ("interim") results so the agent can start reasoning before the caller has finished the sentence. Word error rate (WER) varies noticeably by vendor and domain; independent benchmarking from Artificial Analysis puts Deepgram's Nova-3 model around 5.2% WER on their mixed real-world benchmark, which is representative of where the leading streaming ASR models currently sit on clean-ish audio ([Artificial Analysis, Deepgram Nova-3](https://artificialanalysis.ai/speech-to-text/models/deepgram)) - phone-quality audio, cross-talk, and heavy accents will push that meaningfully higher in practice.
- **Agent/LLM**: the same reasoning loop as a text [AI agent](/guides/ai-agents) - plan, call tools, decide when to respond vs. ask a clarifying question. A voice agent that looks up a caller's account balance or order status is doing [retrieval](/guides/rag) exactly the way a text RAG system does; the only difference is the input arrived as a transcript instead of typed text, and tool access is frequently wired up through [MCP](/guides/mcp) - OpenAI's Realtime API, for example, added support for calling remote MCP servers directly from a voice session ([OpenAI Realtime API launch notes](https://developers.openai.com/blog/realtime-api)).
- **TTS**: streaming, sentence-chunked synthesis so audio starts playing before the full response has been generated - waiting for a complete LLM response before starting TTS is one of the easiest ways to blow your latency budget.

### Speech-to-speech (realtime multimodal) models

The newer alternative skips the discrete ASR and TTS stages: audio goes in, audio comes out, and the model reasons about speech directly rather than through an intermediate transcript. OpenAI's `gpt-realtime` and Google's Gemini Live API both work this way, streaming audio bidirectionally over a WebSocket (or WebRTC) connection, with built-in VAD, barge-in handling, and tool/function calling as part of the same session ([OpenAI Realtime API guide](https://developers.openai.com/api/docs/guides/realtime-conversations), [Gemini Live API overview](https://ai.google.dev/gemini-api/docs/live-api)). Voice-agent platforms built on top of these primitives - ElevenLabs' agent product is a good example, layering its own turn-taking model, telephony/SIP integration, and tool configuration on top of a low-latency TTS core ([ElevenLabs Agents docs](https://elevenlabs.io/docs/eleven-agents/overview)) - are effectively productizing this stack so you don't have to assemble it yourself.

The trade-off is real, not just theoretical: speech-to-speech models cut a full serialization/deserialization round trip out of the pipeline, which helps latency and preserves things like tone, emphasis, and interruptions-mid-word that get lost when speech gets flattened to text. What you give up is the clean text checkpoint - debugging "why did the agent say that" is harder when there's no transcript to point at, and bolting on strict business-logic guardrails or a retrieval step becomes a matter of function-calling design rather than simple text-pipeline interception. My rule of thumb with clients: if the use case is high-stakes (account changes, anything regulated, anything where a wrong entity has real cost), start cascaded, where every step is inspectable, and only move to speech-to-speech once the conversation design is proven and you're optimizing purely for latency and naturalness.

## Implementation Patterns

Here's a minimal but realistic shape for a cascaded voice session server in Node/TypeScript - the pattern I actually reach for when a client's on Twilio for telephony and wants an LLM-based agent behind it. This bridges a Twilio Media Stream (inbound call audio) to OpenAI's Realtime API, letting the realtime model handle ASR, reasoning, and TTS in one session while your server just relays audio frames and handles the interruption event.

Twilio streams call audio to your server over a WebSocket as base64-encoded `audio/x-mulaw` at 8000Hz, framed in JSON messages (`start`, `media`, `stop`) ([Twilio Media Streams overview](https://www.twilio.com/docs/voice/media-streams), [WebSocket Messages reference](https://www.twilio.com/docs/voice/media-streams/websocket-messages)):

```typescript
import { WebSocketServer, WebSocket } from "ws";

const PORT = 8080;
const OPENAI_WS_URL =
  "wss://api.openai.com/v1/realtime?model=gpt-realtime-2.1";

const twilioServer = new WebSocketServer({ port: PORT });

twilioServer.on("connection", (twilioSocket) => {
  let streamSid: string | null = null;

  // One realtime session per phone call.
  const openaiSocket = new WebSocket(OPENAI_WS_URL, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  openaiSocket.on("open", () => {
    // Configure the session: voice, tools, and audio format up front.
    openaiSocket.send(
      JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["audio", "text"],
          voice: "cedar",
          input_audio_format: "g711_ulaw",
          output_audio_format: "g711_ulaw",
          turn_detection: { type: "server_vad" },
          tools: [
            {
              type: "function",
              name: "lookup_order_status",
              description: "Look up an order's status by order number.",
              parameters: {
                type: "object",
                properties: { orderNumber: { type: "string" } },
                required: ["orderNumber"],
              },
            },
          ],
        },
      })
    );
  });

  // Caller audio -> OpenAI
  twilioSocket.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.event === "start") {
      streamSid = msg.start.streamSid;
    } else if (msg.event === "media" && openaiSocket.readyState === WebSocket.OPEN) {
      openaiSocket.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: msg.media.payload, // already base64 mulaw/8000
        })
      );
    }
  });

  // OpenAI events -> caller audio + interruption handling
  openaiSocket.on("message", (raw) => {
    const event = JSON.parse(raw.toString());

    if (event.type === "response.audio.delta" && streamSid) {
      twilioSocket.send(
        JSON.stringify({
          event: "media",
          streamSid,
          media: { payload: event.delta },
        })
      );
    }

    // Barge-in: caller started talking while the agent was mid-response.
    if (event.type === "input_audio_buffer.speech_started" && streamSid) {
      twilioSocket.send(JSON.stringify({ event: "clear", streamSid }));
      openaiSocket.send(JSON.stringify({ type: "response.cancel" }));
    }

    // Tool call: run it and hand the result back to the model.
    if (event.type === "response.function_call_arguments.done") {
      const args = JSON.parse(event.arguments);
      lookupOrderStatus(args.orderNumber).then((result) => {
        openaiSocket.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: event.call_id,
              output: JSON.stringify(result),
            },
          })
        );
        openaiSocket.send(JSON.stringify({ type: "response.create" }));
      });
    }
  });

  twilioSocket.on("close", () => openaiSocket.close());
});
```

A few things worth calling out about this pattern specifically:

- **The `clear` event to Twilio matters as much as `response.cancel` to OpenAI.** Cancelling the model's response stops it generating more audio, but any audio already sent to Twilio is still queued for playback unless you explicitly tell Twilio to drop it. Miss this and the agent keeps talking for a beat after you thought you'd interrupted it.
- **`lookupOrderStatus` is exactly a [RAG](/guides/rag) lookup**, just triggered by a voice-agent tool call instead of a chat message. The retrieval quality bar doesn't get lower because the request arrived as speech.
- **This example uses OpenAI's server-side VAD** (`turn_detection: { type: "server_vad" }`) rather than rolling your own endpointing logic - for most teams that's the right starting point; only build custom turn-taking logic once you've hit a specific limitation of the built-in one (e.g., domain-specific pause patterns, like callers reading off long account numbers with natural mid-number pauses).

If you're not on a realtime speech-to-speech model, the same shape applies with more stages: stream audio to a dedicated ASR provider, feed accumulating transcripts to your agent loop once an end-of-turn is detected, and stream the agent's text response into a TTS provider sentence-by-sentence rather than waiting for the full response.

## Failure Modes and Mitigations

**Latency spikes break the conversational illusion, not just the metrics.** A voice agent that's usually fast but occasionally takes three seconds is worse, from the caller's perspective, than one that's consistently a bit slower - the inconsistency reads as "something's wrong" and triggers people to repeat themselves or talk over the agent, which then triggers barge-in handling, which compounds the confusion. Mitigation: put a filler/backchannel strategy in place for slow tool calls (a brief "let me check that" while a lookup runs), and treat p95/p99 latency as the metric to optimize, not the average.

**ASR mishears critical entities.** Numbers, names, and spelled-out identifiers are exactly the tokens most likely to get misheard and least forgiving when they are. The mitigation isn't better ASR (though that helps) - it's conversation design: have the agent read back anything that triggers a consequential action ("that's account ending in 4-4-7-2, is that right?") before it acts on it, and bias the ASR/LLM prompt toward the domain's vocabulary (product names, common surnames in your customer base) where the platform supports it.

**Interruption handling done wrong is worse than no interruption handling.** An agent that ignores barge-in talks over callers and feels unresponsive. An agent that's too sensitive gets interrupted by background noise, coughs, or its own audio bleeding into the mic, and abandons perfectly good responses mid-sentence. This needs to be tuned per deployment environment (call center headset audio behaves very differently from a caller on speakerphone in a car), not left on a default threshold.

**Hallucinated tool calls are more expensive on the phone.** In a text support widget, a wrong tool call is a wrong answer someone can dispute. In phone support, a hallucinated "I've processed your refund" or "your appointment is confirmed for Tuesday" gets treated by the caller as true and acted on. The mitigation is the same discipline you'd apply to any agent with side effects: gate anything irreversible (refunds, cancellations, transfers) behind an explicit confirmation turn, log every tool call with its arguments and the transcript that triggered it, and - critically - [evaluate](/guides/llm-evaluation) tool-call accuracy specifically, not just whether the conversation sounded coherent.

## How Much Do Voice AI Agents Cost to Run?

Voice economics differ from text in one structural way: **you're billed by the duration of the conversation, not the size of the question.** A caller who rambles for four minutes costs roughly four times a caller who takes one, even if the task was identical. That single fact reshapes how you budget.

There are four line items, and teams routinely model only the first:

1. **The model.** For speech-to-speech, audio tokens both ways. Using OpenAI's Realtime API directly, `gpt-realtime-2.1` prices audio input at $32 per million tokens and audio output at $64 per million tokens, at roughly 600 input and 1,200 output tokens per minute of audio ([OpenAI Realtime API pricing](https://developers.openai.com/api/docs/pricing)). For a cascaded pipeline, you're instead paying text-token rates plus separate ASR and TTS bills.
2. **ASR and TTS**, if cascaded — typically billed per audio minute or per character, and easy to forget because they don't appear on your LLM invoice.
3. **Telephony.** Per-minute carrier or CPaaS charges, plus phone number rental. Real money at volume and entirely outside your AI budget line.
4. **Your own infrastructure.** Voice needs persistent connections for the duration of every call rather than stateless request handling, so concurrency — not request count — sizes your servers. A hundred simultaneous calls is a hundred open media sessions.

Model this **per call type**, never off a single demo call. "Check my order status" and "walk me through a return dispute" have completely different average handle times, and the blended average across your real call mix is the only number that predicts your invoice. The lever that moves cost most is average handle time itself: every latency improvement above is also a cost improvement, because a faster agent produces a shorter call.

One economic note worth stating plainly to anyone building a business case: a voice agent's cost per call is usually well below a human agent's, and that gap is the entire commercial argument. But the comparison only holds if the agent resolves the call. An agent that handles 70% of a call and then escalates has cost you the agent *plus* the human, so containment rate — not cost per minute — is the metric that determines whether the economics work.

## Production Considerations

**Cost adds up faster than it looks in a demo.** Using OpenAI's Realtime API directly, `gpt-realtime-2.1` prices audio input at $32 per million tokens and audio output at $64 per million tokens, with roughly 600 input tokens and 1,200 output tokens per minute of audio ([OpenAI Realtime API pricing](https://developers.openai.com/api/docs/pricing)) - that's real money at call-center volume, and it's before you add telephony minutes (if you're bridging through a carrier or Twilio) or a separate ASR/TTS vendor bill if you go cascaded instead of speech-to-speech. Model this per call type (average handle time varies enormously between "check my order status" and "walk me through a return"), not off a single demo call.

**Latency engineering for voice is its own discipline.** The highest-leverage moves I've seen work in practice: start the agent's reasoning on stable ASR partial transcripts rather than waiting for a finalized one, stream LLM output into TTS at sentence boundaries so synthesis overlaps generation instead of waiting for the full response, and keep your own server code (audio relaying, tool execution) out of the hot path wherever possible - every extra network hop between caller and model is milliseconds you don't get back.

**Recorded audio and transcripts are a different privacy surface than text chat logs.** A voice agent transcript often contains more incidentally-captured PII than a typed chat - people say account numbers, addresses, and other identifying details out loud more casually than they'd type them, and the raw audio itself is biometric data in some jurisdictions. Decide retention windows deliberately, encrypt recordings at rest, and if you're on a telephony network, be explicit about call-recording disclosure requirements and where consent needs to be captured - this varies by jurisdiction and is a legal question worth routing to counsel per deployment region, not something to assume is handled by your vendor's default settings.

If any of this - the architecture trade-offs, the cost modeling, the compliance questions - is the kind of thing you'd rather have someone who's shipped it walk through with you, that's [the kind of work](/#expertise) I do with clients directly.

## Evaluating a Voice Agent

Transcript quality is table stakes, not the evaluation. A voice agent can produce a perfectly coherent-looking transcript and still be a bad product because the *timing* was wrong or it misheard the one number that mattered. The [evaluation](/guides/llm-evaluation) approach that actually predicts whether a voice agent will hold up in production looks at:

- **Latency percentiles**, not averages - p50/p90/p99 time from end-of-caller-speech to first audio byte out. A good p50 with a bad p99 still produces a stream of frustrated callers.
- **ASR word error rate**, measured specifically on your domain's audio conditions (phone-quality, your customers' typical accents and background noise) rather than a vendor's headline benchmark number - a model reporting ~5% WER on a general benchmark ([Artificial Analysis](https://artificialanalysis.ai/speech-to-text/models/deepgram)) can perform very differently on your actual call audio.
- **Entity accuracy specifically**, separate from overall WER - track error rates on the narrow set of things that matter (order numbers, names, dates) since these are disproportionately consequential and disproportionately likely to get misheard.
- **Task completion rate** - did the call actually resolve what the caller needed, end to end, including any tool calls along the way - as distinct from "did the agent respond appropriately to each individual turn."
- **Interruption/barge-in behavior** - rate of the agent talking over callers, rate of the agent getting cut off by false-positive VAD triggers.
- **Escalation and containment rate** - for support use cases, how often the agent hands off to a human, and whether that handoff happens gracefully or as a dead end.

None of these show up if you're only spot-checking transcripts for coherence, which is the mistake I see most often from teams evaluating a voice agent for the first time - they're applying text-agent evaluation habits to a system where the failure modes are structurally different.

## When Not to Build a Voice Agent

I'll talk a client out of a voice agent more often than most vendors will, because it's frequently not the right answer.

**A well-designed IVR still wins for narrow, high-volume, low-ambiguity tasks.** "Press 1 to pay your bill, press 2 to check your balance" has none of the latency, ASR-error, or interruption-handling problems this entire guide is about, because there's no speech recognition involved in the decision path. If the task is a short, closed set of intents your callers already understand, a DTMF menu (or a hybrid IVR with limited speech recognition for routing) is faster to build, cheaper to run, and more reliable than a full conversational agent - and callers who just want to pay a bill don't care that it's less impressive.

**A text chat agent is the better default when users are already typing.** Everything in this guide - the sub-second latency budget, turn-taking, barge-in, ASR error propagation - goes away when the interface is text. If your users are on a website or an app and comfortable typing, building a voice layer on top adds real engineering cost (and real new failure modes) for a UX improvement that may not exist for that audience. Voice earns its keep when hands/eyes are busy (driving, cooking, using a phone menu system) or when the population you're serving has genuinely lower typing comfort - not as a default upgrade path from a working text agent.

**Skip it, for now, when the cost of a misheard entity is high and your confirmation patterns aren't solid yet.** If a wrong number or a misheard name can trigger a financial transaction, a shipment, or an irreversible account change, the ROI on a voice interface is negative until you've proven out strict confirmation flows and tool-call guardrails - usually easier to prove first in a text agent, where you can inspect every input exactly as the user provided it, before adding the ASR layer that turns "did the user say this" into "did the system correctly hear the user say this."

The honest litmus test I use with clients: if you can't articulate a specific reason voice is better than text for *this* task and *this* user population - not "it feels more advanced," an actual UX or accessibility reason - you're probably building it because it's possible, not because it's needed.
