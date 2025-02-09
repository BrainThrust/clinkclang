import { Step, ExecutionStatus, ExecutionOutput } from './step';

type WorkflowInput = {
	workflowName: string;
};

interface WorkflowContext {
	workflowName: string;
	results: { [key: string]: ExecutionOutput };
}

class StepQueue {
	queue: Step[] = [];
	ptr: number = 0;
	committed: boolean = false;

	push(step: Step) {
		if (!this.committed) {
			this.queue.push(step);
		} else {
			throw Error(
				'The queue has already been committed. Flushing the queue will clear it and undo this.'
			);
		}
	}

	peek(): Step | never {
		if (this.queue.length > 0) {
			return this.queue[this.ptr]!;
		} else {
			throw Error('The queue is currently empty.');
		}
	}

	next(): Step | never {
		if (this.committed && this.queue.length > 0 && this.ptr < this.queue.length) {
			const currentStep = this.queue[this.ptr]!;
			this.ptr++;
			return currentStep;
		} else if (this.ptr >= this.queue.length) {
			return this.queue[this.queue.length - 1]!;
		} else {
			throw Error('The queue is either currently empty or uncommitted.');
		}
	}

	commit() {
		this.committed = true;
	}

	flush() {
		this.queue = [];
		this.committed = false;
	}

	get length() {
		return this.queue.length;
	}
}

export class Workflow {
	name: string;
	stepQueue: StepQueue = new StepQueue();
	workflowContext: WorkflowContext;

	constructor(workflowInput: WorkflowInput) {
		this.name = workflowInput.workflowName;
		this.workflowContext = {
			workflowName: this.name,
			results: {}
		};
	}

	do(step: Step): Workflow {
		this.stepQueue.push(step);
		return this;
	}

	then(step: Step): Workflow {
		this.stepQueue.push(step);
		return this;
	}

	commit() {
		this.stepQueue.commit();
	}

	async execute() {
		while (this.stepQueue.ptr < this.stepQueue.length) {
			const nextStep = this.stepQueue.next();
			const out = await nextStep.execute();
			this.workflowContext.results[out.stepId] = out;

			if (out.status == ExecutionStatus.Retry) {
				// try again here, to be implemented
			} else if (out.status != ExecutionStatus.Success) {
				// handle failure
			}
		}
	}
}
