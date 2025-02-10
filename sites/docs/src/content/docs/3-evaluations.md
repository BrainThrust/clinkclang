---
layout: githubMarkdownLight
title: Evaluations
date: '2025-01-27'
description: 'Evaluating agent responses with AutoEvals'
---
# Evaluations

Clinkclang includes an evaluation system powered by **AutoEvals**, which uses **LLMs as judges** to assess various aspects of AI outputs. This system helps ensure quality, safety, and task-specific performance across your agent workflows.

### Core Evaluators

* **Battle** - Compares outputs to determine which better fulfills the original instructions.
* **ClosedQA** - (TODO).
* **Factuality** - Verifies information accuracy against reference answers.
* **Humor** - Assesses comedic content quality for engagement.
* **Moderation** - Uses OpenAI's API to detect harmful and inappropriate content.
* **Possibility** - Validates if an output is a possible solution to the challenge.
* **Security** - Identifies whether an output is malicious.
* **SQL** - Compares query equivalence for database operations.
* **Summary** - Evaluates text condensation quality against reference summaries.
* **Translation** - Assesses translation accuracy in relation to an expert (`expected`) value.

Example usage

```typescript
const result = await Battle({
  output,
  expected,
  instructions: input,
  openAiApiKey: OPENAI_API_KEY
});
```

More examples for each evaluator can be found in the `packages/agent-evals` folder.

### Best Practices

1. **Multiple Evaluations** - Use multiple evaluators for comprehensive assessment.
2. **Context Awareness** - Provide clear context in your evaluation prompts.
3. **Threshold Setting** - Define appropriate thresholds for different use cases.
4. **Error Handling** - Implement robust error handling for API failures.
5. **Logging** - Maintain evaluation logs for performance tracking.

### Example Workflow

```typescript
async function evaluateAgentResponse(input: string, output: string) {
  const results = await Promise.all([
    Factuality({ input, output, expected: referenceAnswer }),
    Moderation({ output }),
    Possible({ input, output })
  ]);
  
  return {
    factualityScore: results[0].score,
    moderationScore: results[1].score,
    possibilityScore: results[2].score,
    metadata: results.map(r => r.metadata)
  };
}
```

### Integration Tips

##### Automated Testing

```typescript
describe('Agent Response Quality', () => {
  it('should meet factuality requirements', async () => {
    const result = await Factuality({/*...*/});
    expect(result.score).toBeGreaterThan(0.8);
  });
});
```

##### Quality Gates

```typescript
if (moderationResult.score === 0) {
  throw new Error('Content flagged as inappropriate');
}
```

##### Feedback Loops

```typescript
agent.onResponse(async (response) => {
  const evalResult = await evaluateAgentResponse(input, response);
  logEvaluation(evalResult);
});
```
