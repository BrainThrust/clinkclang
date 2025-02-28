# Node.js Package Installation

Install the required npm/pnpm packages:

```bash
# Install main dependencies
pnpm -w add drizzle-orm pg

# Install TypeScript type definitions
pnpm -w add -D @types/pg
```

### Package Explanations

- **drizzle-orm**: TypeScript ORM for SQL databases with a focus on type safety
- **pg**: Node.js client for PostgreSQL
- **@types/pg**: TypeScript type definitions for the pg package

## PostgreSQL Vector Support

### System Requirements

You need PostgreSQL with the pgvector extension installed:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib postgresql-server-dev-all
sudo apt install git build-essential

# macOS (with Homebrew)
brew install postgresql
```

### Install pgvector Extension

```bash
# Clone pgvector repository
git clone https://github.com/pgvector/pgvector.git
cd pgvector

# Build and install
make
sudo make install
```

### Enable Vector Support in Your Database

Connect to your PostgreSQL database and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Vector Integration in Drizzle ORM

The vector type is natively supported in Drizzle ORM's PostgreSQL integration via:

```typescript
import { vector } from 'drizzle-orm/pg-core';

// Example table with vector column
const messagesTable = pgTable('messages', {
  // ... other columns
  embedding: vector('embedding', { dimensions: 1536 }).notNull()
});
```

## Setting Up Database Connection

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Initialize database connection
const pool = new Pool({
  connectionString: "postgresql://username:password@localhost:5432/your_db_name",
});
const db = drizzle(pool);
```

## Vector Similarity Search

Drizzle ORM supports vector similarity searches:

```typescript
import { l2Distance } from 'drizzle-orm';

// Example vector similarity search query
const similarMessages = await db.select()
  .from(messagesTable)
  .where(eq(messagesTable.conversationId, conversationId))
  .orderBy(l2Distance(messagesTable.embedding, queryEmbedding))
  .limit(5);
```

## Supported Distance Functions

pgvector supports multiple distance metrics:

- **l2Distance**: Euclidean distance (L2 norm)
- **cosineDistance**: Cosine distance (1 - cosine similarity)
- **maxInnerProduct**: Dot product (for inner product searches)

## Performance Optimization

For production use, create appropriate indexes:

```sql
-- Create a HNSW index for faster vector searches
CREATE INDEX idx_messages_embedding 
ON messages 
USING hnsw (embedding vector_l2_ops)
WITH (m = 16, ef_construction = 64);
```

## Database Migration

Use a migration file to set up your schema:

```typescript
import { sql } from 'drizzle-orm';

// Add vector extension
export const pgVectorExtensionSQL = `
  CREATE EXTENSION IF NOT EXISTS vector;
`;

// Create vector index
export const createVectorIndexSQL = `
  CREATE INDEX IF NOT EXISTS idx_messages_embedding 
  ON messages 
  USING hnsw (embedding vector_l2_ops)
  WITH (m = 16, ef_construction = 64);
`;

// Migration function example
expo
```
