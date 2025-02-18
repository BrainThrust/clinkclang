# Agent Workflows

Agent Workflows is an orchestration layer that sequences operations—referred to as "steps"—which can combine function calls and agent interactions. It leverages a directed graph to define the order of execution, ensuring type safety and runtime validation through Zod schemas, while also supporting configurable retry logic.

## Key Concepts

- **Step Abstraction:**  
  Each step is defined by:
  - A unique identifier (`stepId`)
  - An execution function that receives a `WorkflowContext`
  - Optional input (`argsSchema`) and output (`returnSchema`) validation using Zod
  - Configurable retry behavior, where failed steps can be retried until the limit is reached

- **Workflow Context:**  
  The workflow context holds:
  - The workflow name
  - The results of each executed step (capturing both successful outputs and errors)
  - Validated initialization data provided at run-time

- **Graph-Based Execution:**  
  A workflow is represented as a graph:
  - **StepNode:** Wraps an individual step and manages its neighbors (i.e., subsequent steps).
  - **StepGraph:** Manages all step nodes and ensures that steps are only added or linked until the workflow is committed.
  
  Currently, the implementation supports a linear sequence of steps (no branching). Each step is executed in sequence, and if a step fails and has retries available, it will automatically attempt re-execution.

- **Type Safety & Validation:**  
  By using TypeScript and Zod:
  - The workflow's initialization data is validated against a defined schema.
  - Each step's inputs/outputs can be enforced, reducing runtime errors.

- **Workflow Execution:**  
  - **Defining a Workflow:** Use `.do()` to specify the starting step and `.then()` for subsequent steps.
  - **Committing the Workflow:** The workflow must be committed (finalized) before it can be executed.
  - **Running the Workflow:** Creating a workflow instance and running it with initial data triggers the sequential execution of steps, updating the global `WorkflowContext` with each result.

## Usage Example

Below is a concise example of how to define and execute a workflow:

```typescript:packages/workflow/readme.md
import { z } from 'zod';
import { Workflow } from './workflow';
import { Step } from './step';

// Define the initial data schema for the workflow
const initSchema = z.object({
  userId: z.string(),
});

// Create a step that fetches user data
const fetchUserDataStep = new Step({
  stepId: 'fetchUserData',
  execute: async (ctx) => {
    // Simulate fetching user data
    const userData = { name: 'Alice', id: ctx.initData.userId };
    return { output: userData };
  },
  retries: 2, // Optional: number of retry attempts if this step fails
});

// Define and chain workflow steps
const userWorkflow = new Workflow({
  workflowName: 'userDataWorkflow',
  initSchema,
})
  .do(fetchUserDataStep)
  // Additional steps can be chained using `.then()`
  .commit();

// Create an instance and execute the workflow with validated init data
const workflowInstance = userWorkflow.createInstance();
workflowInstance.run({ initData: { userId: '12345' } });
```

## Summary

Agent Workflows provides a modular and extensible framework to orchestrate multi-step processes. With built-in type safety, validation, and retry logic, it simplifies the management of complex, agent-driven tasks into a well-defined sequence of operations.


