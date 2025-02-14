import { z } from 'zod';

export enum ExecutionStatus {
	Success = 'success',
	Failed = 'failed',
	Retry = 'retry'
}

type ExecutionSuccess<TExecutionOutput> = {
	stepId: string;
	status: ExecutionStatus.Success;
	output: TExecutionOutput;
};

type ExecutionFailure = {
	stepId: string;
	status: ExecutionStatus.Failed;
	error: string;
};

export type ExecutionOutput<TExecutionOutput> =
	| ExecutionSuccess<TExecutionOutput>
	| ExecutionFailure;

export interface InitContext<TInitSchema extends z.ZodType<any> = any> {
	initData: z.infer<TInitSchema>;
}

export interface WorkflowContext<TInitSchema extends z.ZodType<any> = any> {
	workflowName: string;
	results: Record<string, ExecutionOutput<any>>;
	initData: z.infer<TInitSchema>;
}

export interface WorkflowInstance<TInit extends z.ZodType<any>> {
	run: (options?: { initData?: z.infer<TInit> | undefined }) => Promise<void>;
}
