import { z, ZodFunction, ZodTypeAny } from 'zod';

type StepContextFunction = (...args: any[]) => unknown;

export enum ExecutionStatus {
	Success,
	Failed,
	Retry
}

export type ExecutionOutput = {
	stepId: string;
	status: ExecutionStatus;
	output: unknown;
};

type StepConfig = {
	stepId: string;
	execute: StepContextFunction;
	argsSchema?: ZodTypeAny[];
	returnSchema?: ZodTypeAny;
};

export class Step {
	stepId: string;
	stepFunction: StepContextFunction;
	stepFunctionSchema: ZodFunction<any, any>;
	argsSchema: ZodTypeAny[];
	returnSchema: ZodTypeAny;

	constructor(config: StepConfig) {
		this.argsSchema = config.argsSchema ?? [];
		this.returnSchema = config.returnSchema ?? z.void();
		this.stepId = config.stepId;

		if (this.argsSchema.length == 0) {
			this.stepFunctionSchema = z.function().returns(this.returnSchema);
		} else {
			this.stepFunctionSchema = z
				.function()
				.args(this.argsSchema[0] ?? z.undefined(), ...this.argsSchema.slice(1))
				.returns(z.promise(this.returnSchema));
		}

		this.stepFunction = this.stepFunctionSchema.implement(config.execute);
	}

	async execute(...inputs: any): Promise<ExecutionOutput> {
		try {
			const output = await this.stepFunction(...inputs);
			return {
				stepId: this.stepId,
				status: ExecutionStatus.Success,
				output: output
			};
		} catch (e) {
			console.error(e);
			return {
				stepId: this.stepId,
				status: ExecutionStatus.Failed,
				output: null,
			};
		}
	}
}
