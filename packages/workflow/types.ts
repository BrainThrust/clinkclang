import { z } from 'zod';

export enum ExecutionStatus {
	Success,
	Failed,
	Retry
}

type ExecutionSuccess<TExecutionOutput> = {
	stepId: string;
	status: 'success';
	output: TExecutionOutput;
};

type ExecutionFailure = {
	stepId: string;
	status: 'failed';
	error: string;
};

export type ExecutionOutput<TExecutionOutput> =
	| ExecutionSuccess<TExecutionOutput>
	| ExecutionFailure;

export interface InitContext<TInitSchema extends z.ZodType<any> = any> {
	initData: TInitSchema;
}

export interface WorkflowContext<TInitSchema extends z.ZodType<any> = any> {
	workflowName: string;
	results: Record<string, ExecutionOutput<any>>;
	initData: z.infer<TInitSchema>;
}

export interface WorkflowInstance<TInit extends z.ZodType<any>> {
	run: (options?: { initData?: z.infer<TInit> | undefined }) => Promise<{
		initData?: z.infer<TInit>;
		results: Record<string, ExecutionOutput<any>>;
	}>;
}
