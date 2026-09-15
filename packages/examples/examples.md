# Examples

This document provides instructions on how to run the various examples in this project. Each example might have its own specific dependencies that need to be installed before running.

## Running the Examples

### `extract-invoice.ts`

This example demonstrates how to extract information from an invoice document using `tesseract.js` and `pdf-parse`.

**Dependencies**

* `tesseract.js`
* `@types/tesseract.js`
* `pdf-parse`
* `@types/pdf-parse`

**How to Run**

```bash
npm install tesseract.js @types/tesseract.js pdf-parse @types/pdf-parse
npx tsx extract-invoice.ts
```

### `generate-response.ts`

This example demonstrates how to generate a response using the agent.

**Dependencies:**

* None (This example relies on core project dependencies and does not have additional external dependencies.)

**How to Run**

```bash
npx tsx generate-response.ts
```

### `structured-output.ts`

This example demonstrates how to use structured output.

**How to Run**

```bash
npx tsx structured-output.ts
```
