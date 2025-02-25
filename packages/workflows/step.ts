import { ZodTypeAny, z } from 'zod';
import { WorkflowContext } from './types';

type StepConfig = {
	stepId: string;
	execute: (ctx: WorkflowContext) => Promise<any>;
	argsSchema?: ZodTypeAny[];
	returnSchema?: ZodTypeAny;
	retries?: number;
};

export class Step {
	stepId: string;
	stepFunction: <TFuncOut = any>(
		ctx: WorkflowContext
	) => Promise<TFuncOut extends z.ZodSchema ? z.infer<TFuncOut> : unknown>;
	retries: number;
	retriesExecuted: number = 0;

	constructor(config: StepConfig) {
		this.stepId = config.stepId;
		this.stepFunction = config.execute;
		this.retries = config.retries ?? 0;
	}

	updateRetries() {
		if (this.retries > 0) {
			this.retries -= 1;
			this.retriesExecuted += 1;
		}
	}
}
