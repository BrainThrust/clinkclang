import { ZodTypeAny, z } from 'zod';
import { ExecutionOutput, WorkflowContext, ExecutionStatus } from './types';

type StepConfig = {
	stepId: string;
	execute: (ctx: WorkflowContext) => Promise<any>;
	argsSchema?: ZodTypeAny[];
	returnSchema?: ZodTypeAny;
};

export class Step {
	stepId: string;
	stepFunction: <TFuncOut = any>(
		ctx: WorkflowContext
	) => Promise<TFuncOut extends z.ZodSchema ? z.infer<TFuncOut> : unknown>;

	constructor(config: StepConfig) {
		this.stepId = config.stepId;
		this.stepFunction = config.execute;
	}
}
