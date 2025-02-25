---
layout: docs
title: Workflow Tracker
date: '2025-02-17'
description: 'Evaluating agent responses with AutoEvals'
---

The Workflow Tracker is a module designed to help build and track your workflows seamlessly through a state machine and type-safe step definitions.

## Installation
```bash
# Add the workflow package
pnpm run dev -- add workflow

# Add the workflow-examples package
pnpm run dev -- add workflow-examples
```

## Creating your workflow
### Creating a new Workflow instance
```typescript
const testWorkflow = new Workflow({
	workflowName: 'test-workflow',
	initSchema: z.object({ initValue: z.number() })
});
```
The `initSchema` field allows you to define an input schema that will help safely execute the workflow with a chosen input value. We'll talk more about this down below!

### Defining a Step
```typescript
const testOne = new Step({
	stepId: 'sayHello',
	execute: async () => {
		console.log("Hello!");
	}
});
```
The most basic parts of a step are its `stepId` and `execute` function. Optionally, the function defined within the `Step` may also return a value that can later be accessible by other steps!

### Building your Workflow
You can chain your steps together like so:
```typescript
const workflowInstance = testWorkflow
	.do(testOne)
	.then(testTwo)
	.then(testThree)
	.commit()
	.createInstance();
  ```
The above returns a function that allows you to start the Workflow runner. This function returns a `Promise` that contains the results of your Workflow. We can access it through the `.then()` method as follows:
```typescript
workflowInstance.run().then(() => {
	console.log(testWorkflow.workflowContext);
});
```
Example console output:
```ts
{
  workflowName: 'test-workflow',
  results: {
    addOneToNumber: { stepId: 'addOneToNumber', output: 6, status: 'success' },
    doubleNumber: { stepId: 'doubleNumber', output: 12, status: 'success' },
    subtractFiveFromNumber: { stepId: 'subtractFiveFromNumber', output: 7, status: 'success' }
  },
  initData: { initValue: 5 }
}
```
## Playing with values
### Accessing values from other steps
See the following step definition:
```typescript
const testOne = new Step({
	stepId: 'returnOne',
	execute: async () => { return 1	}
});
```

If we wanted to access this value from other steps, we can use the `WorkflowContext` instance that will be automatically passed into the function by the Workflow runner!
```typescript
const testTwo = new Step({
	stepId: 'printPrevResult',
	execute: async (ctx) => {
		if (ctx.results.returnOne?.status == ExecutionStatus.Success) {
			console.log(ctx.results.returnOne.output); // 1
		}
	}
});
```
### Init Data
We mentioned above that you're able to provide the context of your Workflow with some initialization data. Here's how you can do it:
```typescript
const testWorkflow = new Workflow({
	workflowName: 'test-workflow',
	initSchema: z.object({ initValue: z.number() })
});
```
The `initSchema` field of the `WorkflowConfig` you use to define the Workflow takes in an object that maps out the shape of your input values!
For example, if you wanted to use the following object as your initialization values:
```ts
{
  initValue: 5,
  helloString: "hello!",
}
```
You can use the following `initSchema` to instantiate your Workflow:
```ts
const schema = z.object({
  initValue: z.number,
  helloString: z.string,
})
```
Within any Step, you can now access this value by accessing the `initData` field of the `WorkflowContext`, while being compiler-safe!
```ts
const testOne = new Step({
	stepId: 'test',
	execute: async ({ initData }) => { 
    	console.log(initData.initValue) // 5
      console.log(initData.hellostring) // "hello!"
  }
});
```