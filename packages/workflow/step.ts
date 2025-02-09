import { z, ZodFunction, ZodTypeAny } from 'zod';

type StepContextFunction = (...args: any[]) => any;

type StepContext = {
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

	constructor(stepContext: StepContext) {
		this.argsSchema = stepContext.argsSchema ?? [];
		this.returnSchema = stepContext.returnSchema ?? z.void();
		this.stepId = stepContext.stepId;

		if (this.argsSchema.length == 0) {
			this.stepFunctionSchema = z.function().returns(this.returnSchema);
		} else {
			this.stepFunctionSchema = z
				.function()
				.args(this.argsSchema[0] ?? z.undefined(), ...this.argsSchema.slice(1))
				.returns(this.returnSchema);
		}

		this.stepFunction = this.stepFunctionSchema.implement(stepContext.execute);
	}

	async execute(...inputs: any) {
		await this.stepFunction(...inputs);
	}
}
