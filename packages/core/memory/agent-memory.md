# Agent Memory

### Memory Manager

The Memory Manager coordinates all memory operations. It:

- Manages both short-term and long-term memory
- Handles adding messages to appropriate storage
- Retrieves relevant information when needed
- Loads previous conversations

### Short-Term Memory

- Stores messages in memory (RAM)
- Tracks token usage
- Automatically summarizes older messages when token limit is maxed out
- Keeps recent conversations immediately available

### Long-Term Memory

- Stores messages in a PostgreSQL database (pgvector)
- Creates vector embeddings for semantic search
- Retrieves relevant past messages based on similarity
- Persists across conversations
- Manages conversations by ID

## How It Works (with the memory manager)

```
┌─────────────────────────────────────────────────────────────┐
│                        Agent                                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Memory Manager                           │
│                                                             │
│  ┌───────────────────────┐      ┌────────────────────────┐  │
│  │   Short-Term Memory   │      │    Long-Term Memory    │  │
│  │                       │      │                        │  │
│  │ - In-memory storage   │      │ - Database storage     │  │
│  │ - Token management    │      │ - Vector embeddings    │  │
│  │ - Auto-summarization  │      │ - Semantic search      │  │
│  └───────────────────────┘      └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Message Flow

When an agent receives a message

- The message is added to short-term memory
- If long-term memory is enabled, it's also stored there with vector embeddings

When token limit is reached

- Older messages are summarized into a system message
- The summary replaces the original messages to save tokens

When the agent needs context

- Recent messages come from short-term memory
- Relevant historical information is retrieved from long-term memory

### Examples (I made two example usages)

#### Short-Term Memory Example

- Creating an agent with short-term memory
- Asking a series of related questions to test whether it remembers
- Automatic summarization when token limit is maxed
- Tracking the memory statistics

```typescript
//setup
const agent = new ReactAgent({
  memory: {
    type: 'short-term'
  },
  tokenLimit: 500 // token limit can be set
});

// track the memory usage
await generateResponse('Tell me about Paris.');
await generateResponse("What's the best time to visit?");
// More questions...

// display memory stats
const memory = agent.memory;
const messages = await memory.getMessages();
const summaries = await memory.getSummaries();
```

#### Long-Term Memory Example

- Setting up database connection
- Creating an agent with long-term memory
- Adding historical conversation as a test
- Retrieving relevant information
- Using conversationId to identify a particular conversation

```typescript
// connect to database
const agent = new ReactAgent({
  memory: {
    type: "long-term",
    conversationId: conversationId,
    embeddingProvider: { type: "openai" },
    dbConnectionString: "postgresql://..."
  }
});

// historical data or prior context
await agent.memory.addMessage({
  role: "user",
  content: "Previous conversation data...",
  metadata: { type: "historical_case" }
});

// use in new conversation
const response = await agent.generate("What was the resolution for my previous case?");
```
