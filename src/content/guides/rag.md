---
title: "Retrieval-Augmented Generation: A Practitioner's Guide to RAG Architecture"
description: "A practitioner's guide to retrieval augmented generation: architecture, chunking strategies, hybrid search, reranking, evaluation, and when to skip RAG."
tldr: "Retrieval-augmented generation grounds an LLM's answers in your own data by retrieving relevant chunks at query time instead of retraining the model on them. I've shipped RAG systems for support, legal, and internal-knowledge use cases, and the parts that actually determine quality are chunking, hybrid search, and reranking - not which vector database logo is on the invoice. Skip the whole architecture when your corpus is small enough to just put in the prompt."
publishDate: 2026-09-16
primaryKeyword: "retrieval augmented generation"
category: "RAG"
relatedSlugs: ["mcp", "llm-evaluation", "ai-agents", "voice-ai-agents"]
faqs:
  - question: "What is retrieval-augmented generation (RAG) in simple terms?"
    answer: "RAG is a pattern where you retrieve relevant pieces of your own data - documents, tickets, code, transcripts - at query time and hand them to an LLM as context before it generates an answer. Instead of relying on what the model memorized during training, the model reads your data fresh on every request, which makes answers more current and traceable back to a source."
  - question: "How is RAG different from fine-tuning?"
    answer: "Fine-tuning changes the model's weights to shift its behavior or style; RAG leaves the model untouched and changes what it sees at inference time. RAG is almost always the right first move for 'answer questions about our data' problems because it's cheaper to update (just re-index) and every answer can cite a source. Fine-tuning earns its cost when you need a specific output format, tone, or latency profile baked in, not when you just need the model to know more facts."
  - question: "What's the difference between vector search and hybrid search in a RAG pipeline?"
    answer: "Vector search finds chunks whose embeddings are semantically close to the query embedding, which is great at synonyms and paraphrasing but weak on exact strings like error codes, SKUs, or names. Hybrid search runs a sparse keyword search (BM25) alongside the vector search and fuses the two ranked lists, so you keep semantic recall without losing exact-match precision. Most production RAG systems I've built end up hybrid by default."
  - question: "Do I need a dedicated vector database, or can I use pgvector?"
    answer: "If you already run Postgres and your corpus is in the low millions of chunks, pgvector is a legitimate production choice - you get vector search, HNSW indexing, and transactional consistency with the rest of your data in one system. I reach for a dedicated vector database (Pinecone, Weaviate) when I need managed hybrid search, multi-tenant namespace isolation at scale, or query volume that would make me babysit a Postgres instance full-time."
  - question: "How much does a production RAG system cost to run?"
    answer: "The three cost centers are embedding generation (usually a rounding error, paid once per document unless you re-chunk), vector storage/query (scales with corpus size and QPS, varies a lot by vendor and index type), and the LLM generation call, which is almost always the dominant cost because you're paying for every retrieved chunk as input tokens on every single query. Reranking and trimming context aggressively is a cost lever as much as a quality lever."
  - question: "How do I evaluate whether my RAG system is actually working?"
    answer: "Separate retrieval evaluation from generation evaluation. For retrieval, measure recall@k and precision@k against a labeled set of query-to-relevant-chunk pairs - did the right chunk even make it into context? For generation, use an LLM-as-judge or human review to score faithfulness (is the answer supported by the retrieved context) and answer relevancy separately, because a model can be perfectly faithful to irrelevant context and still give a useless answer."
---

## What Retrieval-Augmented Generation Actually Is

Retrieval-augmented generation is a pattern, not a product: at query time, you retrieve a handful of relevant pieces of your own data and insert them into the prompt before the LLM generates its answer. The term comes from Lewis et al.'s 2020 paper, [*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*](https://arxiv.org/abs/2005.11401), which combined a pretrained sequence-to-sequence model with a neural retriever over a Wikipedia index and showed it beat purely parametric models on open-domain QA while producing more specific, factual answers. Six years later the core idea hasn't changed, even though the tooling around it - embeddings, vector databases, rerankers - has matured a lot.

The reason RAG stuck as the default pattern for "make an LLM answer questions about our stuff" is that it separates two concerns that used to be tangled together: what the model knows how to do (reason, write, summarize) versus what it knows about (your product docs, your codebase, your support history). Fine-tuning bakes facts into weights, which means every time your knowledge base changes, you're looking at a retraining cycle. RAG keeps facts in an index you can update in seconds. That's the whole pitch, and it holds up in production more often than not.

## Why Retrieval-Augmented Generation Matters in Production

I've shipped RAG systems for legal document review, internal engineering knowledge bases, and customer support deflection, and in every one of those, the client's actual problem was never "we need an LLM." It was "we need answers grounded in a specific, changing body of truth, with a way to check where the answer came from." That's a narrower and more useful framing than "add AI chat to the product."

A few concrete reasons RAG earns its complexity over just prompting a bigger model from memory:

- **Currency.** Your data changes daily; retraining a model doesn't happen daily. Re-indexing a new document takes seconds.
- **Traceability.** You can show the user which chunks the answer came from, which matters enormously for anything regulated or customer-facing - "here's the paragraph in the contract" beats "trust me."
- **Cost control.** You pay to encode and index documents once, then pay per query for a handful of retrieved chunks - not for stuffing an entire corpus into every prompt.
- **Reduced (not eliminated) hallucination.** Grounding the model in retrieved text measurably cuts down on fabrication versus asking it to answer from parametric memory alone, though it does not make hallucination impossible - the model can still misread or overgeneralize from what it retrieved.

None of that means RAG is free. It adds a retrieval subsystem with its own failure modes, its own latency budget, and its own evaluation surface, which I'll get into below.

## RAG Architecture: From Query to Grounded Answer

The flow shown in the diagram above - user query, embed and retrieve, rerank, LLM plus context, grounded answer - is the shape almost every production RAG system takes, whether it's backed by Pinecone, Weaviate, or plain Postgres. The interesting engineering decisions all live inside those boxes: how you chunk documents before embedding them, how you search the vector store, and whether you rerank before handing chunks to the model. I'll walk through each.

### Chunking Strategies That Actually Affect Retrieval Quality

Chunking is the least glamorous part of RAG architecture and the part that determines your ceiling on retrieval quality more than model choice or vector database choice ever will. The mistake I see most often is picking a fixed token count (say, 512 tokens) and splitting blindly, which routinely severs a sentence - or an entire idea - across two chunks, so neither chunk retrieves well on its own.

What I do in practice:

- **Chunk by structure first, size second.** Split on headings, paragraphs, or code function boundaries, then only fall back to a hard token limit for oversized sections. A markdown document should split on `##` boundaries before it splits on token count.
- **Keep chunks in the low hundreds of tokens, with overlap.** Small enough that a single chunk is topically coherent, with roughly 10-20% overlap between adjacent chunks so an idea that straddles a boundary still shows up whole in at least one chunk.
- **Attach context the chunk would otherwise lose.** A chunk pulled from page 40 of a contract doesn't know it's a contract, or which section it's in. Anthropic's [Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) writeup addresses exactly this: prepending a short (50-100 token) LLM-generated summary of the chunk's place in the document before embedding it. In their internal benchmark, contextual embeddings alone cut the top-20-chunk retrieval failure rate from 5.7% to 3.7% (a 35% relative reduction); adding BM25 on top brought it to 2.9% (49% reduction); adding a reranking pass on top of that brought it to 1.9% - a 67% relative reduction over the naive baseline. That's the single most convincing chunking-quality data point I've seen published, and it matches what I've observed qualitatively on client corpora: the reranking pass usually buys you more than any embedding model swap.

### Vector Database Embeddings: Picking a Store

An embedding is just a vector - a list of floats - produced by a model trained so that semantically similar text ends up close together in that vector space. [OpenAI's embeddings documentation](https://developers.openai.com/api/docs/guides/embeddings) describes the standard retrieval recipe plainly: embed the query and the documents, rank documents by cosine similarity to the query, and use a vector database once you're searching over more than a handful of documents rather than computing similarity by hand.

The store you pick matters less than people assume, but it's not a non-decision:

- **Postgres + [pgvector](https://github.com/pgvector/pgvector)** is my default when the client already runs Postgres and the corpus is in the low millions of chunks. You get vector similarity search (with HNSW or IVFFlat indexing, exact or approximate), inside the same transactional system as the rest of your application data - no separate service to operate, and you can join a vector search against relational filters (tenant ID, permissions, date ranges) in a single query.
- **Pinecone or Weaviate** earn their keep when you need managed hybrid search out of the box, multi-tenant namespace isolation at real scale, or query throughput that would mean babysitting a database cluster. Both ship hybrid search as a first-class feature, which brings me to the next section.

### Hybrid Search & Reranking: Why Vector Search Alone Isn't Enough

Pure vector search is excellent at paraphrase and synonym matching and surprisingly bad at exact strings - error codes, part numbers, proper nouns, anything where the literal characters matter more than the meaning. Hybrid search fixes this by running a sparse keyword search (typically BM25) alongside the dense vector search and fusing the two ranked lists into one.

[Pinecone's hybrid search docs](https://docs.pinecone.io/guides/search/hybrid-search) frame it as combining "a keyword signal with a semantic signal in a single query," either by storing dense and sparse vectors in one index and weighting them client-side, or by querying two indexes and merging results. [Weaviate's hybrid search](https://docs.weaviate.io/weaviate/search/hybrid) exposes this as a single `alpha` parameter: `alpha = 1.0` is pure vector search, `alpha = 0.0` is pure BM25F keyword search, and anything in between blends the two - Weaviate's default fusion method (Relative Score Fusion since v1.24) combines the two using their actual similarity scores rather than just rank position.

Reranking is the second lever, and it's the one I underused early in my career because it looks like an optional nice-to-have. It isn't. The pattern, as [Pinecone's reranking docs](https://docs.pinecone.io/guides/search/rerank-results) describe it, is: retrieve a wider candidate set from your vector/hybrid search (say, top 20-50), then pass the query and every candidate through a dedicated cross-encoder reranking model that scores each pair for actual semantic relevance, and keep only the top handful after that. A cross-encoder sees the query and the candidate together, which lets it catch relevance signals that a dense bi-encoder embedding - which encodes the query and the document completely independently - structurally cannot. Given how much of the Contextual Retrieval failure-rate improvement I cited above came specifically from adding the reranking step, I now treat rerank-before-generate as close to non-negotiable for anything beyond a demo.

## RAG Examples: A Minimal Pipeline in TypeScript

Here's the shape of a production-lean RAG pipeline in Node/TypeScript - chunking, embedding and indexing, then hybrid retrieval with reranking before the generation call. I'm using pgvector here because it's the setup I reach for most often with clients who don't need a dedicated vector database yet.

Indexing a document:

```typescript
import { Pool } from "pg";
import OpenAI from "openai";

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI();

interface Chunk {
  text: string;
  sectionTitle: string;
  documentTitle: string;
}

async function embedAndStore(chunk: Chunk, documentId: string) {
  // Prepend lightweight context so the chunk is coherent on its own -
  // the "contextual retrieval" pattern, cheap when the summary is short.
  const contextualized = `${chunk.documentTitle} - ${chunk.sectionTitle}\n\n${chunk.text}`;

  const { data } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: contextualized,
  });

  await db.query(
    `INSERT INTO chunks (document_id, text, section_title, embedding)
     VALUES ($1, $2, $3, $4)`,
    [documentId, chunk.text, chunk.sectionTitle, JSON.stringify(data[0].embedding)]
  );
}
```

Hybrid retrieval (vector similarity + full-text search) with a reranking pass before the chunks ever reach the LLM:

```typescript
interface RetrievedChunk {
  id: string;
  text: string;
  score: number;
}

async function retrieve(query: string, topK = 6): Promise<RetrievedChunk[]> {
  const { data } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryEmbedding = JSON.stringify(data[0].embedding);

  // Pull a wider candidate set from both vector similarity and keyword search,
  // then let the reranker - not raw cosine distance - make the final call.
  const { rows: candidates } = await db.query(
    `SELECT id, text,
            1 - (embedding <=> $1) AS vector_score,
            ts_rank_cd(to_tsvector('english', text), plainto_tsquery($2)) AS keyword_score
     FROM chunks
     WHERE embedding <=> $1 < 0.5
        OR to_tsvector('english', text) @@ plainto_tsquery($2)
     ORDER BY vector_score DESC
     LIMIT 30`,
    [queryEmbedding, query]
  );

  return rerank(query, candidates, topK);
}

async function rerank(
  query: string,
  candidates: { id: string; text: string }[],
  topK: number
): Promise<RetrievedChunk[]> {
  // Call out to a cross-encoder reranking model (Cohere Rerank, Pinecone's
  // hosted reranker, or a self-hosted cross-encoder all work here).
  const scored = await rerankApi.score({ query, documents: candidates.map((c) => c.text) });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => ({ id: candidates[s.index].id, text: candidates[s.index].text, score: s.score }));
}
```

And the generation step, which is where the whole pipeline pays off or falls apart depending on how disciplined you are about what goes in the prompt:

```typescript
async function answer(query: string): Promise<string> {
  const chunks = await retrieve(query);

  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.text}`)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system:
      "Answer using only the numbered context below. Cite sources inline as [1], [2], etc. " +
      "If the context doesn't contain the answer, say so explicitly - do not guess.",
    messages: [{ role: "user", content: `Context:\n${context}\n\nQuestion: ${query}` }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
```

That last system prompt line - "if the context doesn't contain the answer, say so explicitly" - is doing more work than any architectural choice above it. A retrieval system that returns nothing relevant is a known, debuggable failure. A model that confidently fabricates an answer from irrelevant retrieved context is a silent one, and it's the failure mode that erodes user trust fastest.

If your RAG pipeline is one tool among several that an autonomous agent calls - rather than the entire application - the retrieval and reranking logic above slots in as a single tool definition; I cover the surrounding orchestration, planning, and tool-calling loop in the [agents guide](/guides/ai-agents). It's also common to expose a retrieval tool like this over MCP so multiple clients (an IDE, a chat app, an internal agent) can share one retrieval backend without reimplementing it - see the [MCP guide](/guides/mcp) for that pattern.

## Failure Modes I See in Production RAG Systems

**Retrieval returns the wrong chunks and nobody notices until a customer complains.** This is the most common failure by far, and it's almost always a chunking or query-mismatch problem, not a model problem. Teams debug this by staring at the LLM's output when they should be staring at what got retrieved. Log every retrieved chunk alongside every answer from day one.

**The "lost in the middle" problem.** Even with generous context windows, LLMs don't weight every token in the prompt equally - content buried in the middle of a long context gets less attention than content near the start or end. Retrieving 20 chunks and dumping all of them into the prompt unranked is worse than retrieving and reranking down to the 4-6 that actually matter. This is also why "just use a bigger context window and skip retrieval" doesn't scale the way it sounds like it should - more tokens in context isn't free, and accuracy degrades as token count grows, a pattern Anthropic's own [context window documentation](https://platform.claude.com/docs/en/build-with-claude/context-windows) calls "context rot."

**Stale indexes.** A document gets updated in the source system and nobody re-embeds it, so the RAG system confidently serves an outdated chunk. Treat re-indexing as a first-class pipeline step with monitoring, not a manual afterthought triggered by someone remembering to run a script.

**Chunk boundaries that sever the answer.** I covered this above, but it's worth repeating as a failure mode: a numeric table split mid-row, or a procedure split mid-step, retrieves as two nonsensical fragments instead of one useful chunk.

**Over-trusting the reranker or the embedding model on domain-specific jargon.** General-purpose embedding models are trained on broad web text and can genuinely underperform on dense internal jargon - legal defined terms, internal product codenames, medical abbreviations. When I've seen this, hybrid search (which falls back to exact keyword matching) closed most of the gap without needing a fine-tuned embedding model.

**No fallback for "I don't know."** Covered in the code above, but worth calling out on its own: if you don't explicitly instruct the model to admit when retrieved context doesn't answer the question, it will usually try anyway.

## Production Considerations: Cost, Latency, Security

**Cost.** Embedding generation is a one-time cost per document (or per re-index) and is rarely the line item that matters. Vector storage and query cost scale with corpus size and query volume and vary meaningfully between a self-hosted pgvector instance and a managed vector database's per-query or per-pod pricing - check the vendor's current pricing page before committing, since this changes often. The dominant cost in almost every RAG system I've built is the LLM generation call, because you're paying input-token pricing on every retrieved chunk on every single query - this is the direct, ongoing cost of not reranking and trimming context aggressively.

**Latency.** A naive RAG pipeline chains embed query → vector search → rerank → LLM generation sequentially, and each hop adds real wall-clock time - a reranking call over 20-30 candidates is not free. For a chat UI, users tolerate a second or two before the first token streams. For a voice AI agent, that same latency chain is often the difference between a usable product and one that feels broken, because there's no scrollback to hide behind while the user waits in silence - I go into the specific latency budgeting for that case in the [voice AI agents guide](/guides/voice-ai-agents). Caching embeddings for repeated queries and running retrieval and any non-dependent setup work in parallel are the first two latency levers I reach for.

**Security.** The retrieval layer is a new place your access-control model has to be enforced correctly, and it's easy to get wrong because it doesn't look like a typical authorization boundary. If a vector store is queried without row-level filtering by tenant or user permissions, RAG will happily retrieve - and the LLM will happily surface - content the requesting user was never supposed to see. This isn't a hypothetical: it's the single most common security defect I review for in client RAG systems, and it's caught by testing retrieval directly with adversarial queries scoped to a low-permission user, not by testing the chat UI.

## Evaluating a RAG System (Not Just the LLM)

The mistake I see teams make is evaluating a RAG system the same way they'd evaluate a plain chatbot - by eyeballing whether the final answer sounds right. That conflates two independent failure surfaces. A RAG system can fail because retrieval didn't find the right chunks, or because generation didn't use the chunks it was given correctly, and you need separate measurements to tell which one broke.

For the retrieval half, build a labeled evaluation set - real queries mapped to the chunk IDs that should be retrieved for each - and measure:

- **Recall@k**: of the chunks that should have been retrieved, what fraction actually showed up in the top k?
- **Precision@k**: of the chunks retrieved, what fraction were actually relevant?

For the generation half, once you know the right context was retrieved, score the answer independently on:

- **Faithfulness / groundedness**: is every claim in the answer actually supported by the retrieved context, or did the model add something not in there?
- **Answer relevancy**: does the answer actually address the user's question, even if it's faithful to the context it was given?

I go deeper on building this kind of eval harness - labeled datasets, LLM-as-judge scoring, regression testing across model or prompt changes - in the [LLM evaluation guide](/guides/llm-evaluation), since the discipline is the same whether you're evaluating a RAG pipeline or any other LLM-backed feature. The RAG-specific addition is that you must evaluate retrieval and generation as two separate systems with two separate metrics, because a perfect retriever feeding a sloppy generator, and a sloppy retriever feeding a careful generator, produce equally bad end-to-end answers for completely different reasons - and only separate metrics tell you which one to fix.

## When Not to Use RAG

RAG is not free architectural complexity, and I turn it down more often than people expect for someone whose day job is largely AI engineering.

**Your corpus is small enough to just put in the prompt.** With context windows now running into the hundreds of thousands to a million tokens on frontier models, if your entire knowledge base is a few hundred pages, just put it in the system prompt (with caching to control cost) and skip building a retrieval pipeline entirely. You avoid an entire class of retrieval failure modes for free. I've talked more than one client out of a RAG project for exactly this reason - the "sophisticated" answer wasn't the better engineering decision.

**You need a specific output format, tone, or behavior baked in, not more facts.** That's a fine-tuning problem, or in many cases just a better system prompt with a few examples, not a retrieval problem. RAG changes what the model can see; it doesn't reliably change how the model behaves.

**Your data changes so fast that indexing latency itself is the bottleneck.** If the answer depends on data that's seconds old - live pricing, live inventory - you likely want a direct API/tool call for that specific fact rather than routing it through an embedding-and-search pipeline built for relatively stable documents. This is a case for giving an agent a live-lookup tool instead of, or alongside, retrieval; see the [agents guide](/guides/ai-agents) for how that tool-selection decision typically gets made.

**You don't have anyone who will own retrieval quality over time.** RAG systems degrade silently as source documents change, chunking assumptions stop matching new content types, and query patterns drift. If there's no one who's going to look at retrieval logs periodically, you're signing up for a system that gets quietly worse for months before anyone notices. That operational reality is as much a part of the "should we build this" decision as anything in the [expertise](/#expertise) I typically get called in for - the architecture is the easy 20%.
