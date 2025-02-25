import { Step } from '../workflow/step';
import { ExecutionStatus } from '../workflow/types';
import { Workflow } from '../workflow/workflow';
import { z } from 'zod';

const testWorkflow = new Workflow({
	workflowName: 'test-workflow',
	initSchema: z.object({ initValue: z.number() })
});

const testOne = new Step({
	stepId: 'addOneToNumber',
	execute: async ({ initData }) => {
		const inp = initData.initValue;
		return { output: inp + 1 };
	}
});

const testTwo = new Step({
	stepId: 'doubleNumber',
	execute: async (ctx) => {
		if (ctx.results.addOneToNumber?.status == ExecutionStatus.Success) {
			const inp = ctx.results.addOneToNumber.output;
			return { output: inp * 2 };
		}
	}
});

const testThree = new Step({
	stepId: 'subtractFiveFromNumber',
	execute: async (ctx) => {
		if (ctx.results.doubleNumber?.status == ExecutionStatus.Success) {
			const inp = ctx.results.doubleNumber.output;
			return { output: inp - 5 };
		}
	},
	retries: 10
});

const workflowInstance = testWorkflow
	.do(testOne)
	.then(testTwo)
	.then(testThree)
	.commit()
	.createInstance();

workflowInstance.run({ initData: { initValue: 5 } }).then(() => {
	console.log(testWorkflow.workflowContext);
});
