# Agent Evaluations

This folder contains scripts for testing the performance of  agent responses using the AutoEvals framework. The focus is on the LLM-as-a-Judge category, which uses language models to evaluate agent outputs.

## Contents

* `llm-as-judge/`: Evaluation scripts for different methods
* `evaluations.md`: Documentation for evaluation methods

## Evaluators Overview

#### LLM-as-a-Judge Methods

These evaluators use language models to assess agent outputs

| Evaluator             | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| **Battle**      | Compares agent output against expected value to see if it performs better |
| **ClosedQA**    | Checks if output answers the input question using model knowledge         |
| **Humor**       | Determines if output is funny                                             |
| **Factuality**  | Checks if output is factual compared to expected value                    |
| **Moderation**  | Uses OpenAI moderation API to check for flagged content                   |
| **Possible**    | Checks if output is a possible solution to the input challenge            |
| **Security**    | Tests if output contains malicious content                                |
| **SQL**         | Compares generated SQL query with reference query                         |
| **Summary**     | Evaluates if output is a better summary than expected                     |
| **Translation** | Checks if output is a good translation of input text                      |

---

## Setup

#### 1. Install Dependencies

```bash
npm install autoevals
```

#### 2. Set Up API key

```env
OPENAI_API_KEY=your-api-key
```

---

## Usage

#### Running Evaluations

Each evaluator has a corresponding script in `llm-as-judge/`. Run them using:

**bash**Copy

```bash
npx tsx llm-as-judge/battle.ts
npx tsx llm-as-judge/humor.ts
# etc.
```

---

## Key Features

* **Metric normalization** : Handles differences in scoring scales
* **Output parsing** : Manages LLM responses consistently
* **Error handling** : Provides clear failure reasons

---

## Folder Structure

```
agent-evals/
├── llm-as-judge/
│   ├── battle.ts
│   ├── closedqa.ts
│   ├── humor.ts
│   ├── moderation.ts
│   ├── possible.ts
│   ├── security.ts
│   ├── sql.ts
│   ├── summary.ts
│   └── translation.ts
├── evaluations.md
└── package.json
```
