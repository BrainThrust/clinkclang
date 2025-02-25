import { Step } from './step';
import {
	ExecutionStatus,
	ExecutionOutput,
	WorkflowContext,
	InitContext,
	WorkflowInstance,
	WorkflowConfig
} from './types';
import { z } from 'zod';

interface StepNeighbors {
	[key: string]: StepNode;
}

class StepNode {
	step: Step;
	neighbors: StepNeighbors;

	constructor(s: Step) {
		this.step = s;
		this.neighbors = {};
	}

	addPath(sn: StepNode) {
		this.neighbors[sn.step.stepId] = sn;
	}

	getNeighbor(stepId: string) {
		return this.neighbors[stepId];
	}

	getAllNeighbors() {
		return this.neighbors;
	}
}

class StepGraph {
	steps: StepNode[];
	committed: boolean = false;

	constructor() {
		this.steps = [];
	}

	addSteps(steps: StepNode[]) {
		if (!this.committed) steps.forEach((s) => this.steps.push(s));
	}

	addStep(step: StepNode) {
		if (!this.committed) this.steps.push(step);
	}

	addEdge(src: StepNode, dest: StepNode) {
		if (!this.committed) {
			src.addPath(dest);
		}
	}

	commit() {
		this.committed = true;
	}

	uncommit() {
		this.committed = false;
	}
}

export class Workflow<TInitSchema extends z.ZodType<any> = any> {
	name: string;
	stepGraph: StepGraph = new StepGraph();
	workflowContext: WorkflowContext;
	initSchema: TInitSchema;
	startStep: StepNode | null = null;
	referStep: StepNode | null = null;

	constructor({ workflowName, initSchema }: WorkflowConfig<TInitSchema>) {
		this.name = workflowName;
		this.workflowContext = {
			workflowName: this.name,
			results: {},
			initData: {}
		};

		this.initSchema = initSchema;
	}

	do(step: Step) {
		const sn = new StepNode(step);
		this.stepGraph.addStep(sn);
		this.referStep = sn;
		this.startStep = sn;
		return this;
	}

	then(step: Step) {
		const sn = new StepNode(step);
		this.stepGraph.addStep(sn);
		if (this.referStep != null) this.stepGraph.addEdge(this.referStep, sn);
		this.referStep = sn;
		return this;
	}

	commit() {
		this.stepGraph.commit();
		return this;
	}

	createInstance(): WorkflowInstance<TInitSchema> {
		return { run: async ({ initData } = {}) => this.execute({ initData }) };
	}

	async execute(initCtx: InitContext) {
		if (!this.stepGraph.committed) throw Error('Commit the workflow before executing!');
		try {
			const initData = this.initSchema.parse(initCtx.initData);
			this.workflowContext.initData = initData;
		} catch (e) {
			throw Error('initData does not match initSchema.');
		}

		let node = this.startStep;
		while (node != null) {
			let out;
			try {
				const executionOutput = await node.step.stepFunction(this.workflowContext);
				out = {
					stepId: node.step.stepId,
					output: executionOutput.output,
					status: ExecutionStatus.Success,
					...(node.step.retriesExecuted > 0 && { retries: node.step.retriesExecuted })
				} as ExecutionOutput<typeof executionOutput>;
			} catch (_e) {
				const e: Error = _e as Error;
				out = {
					stepId: node.step.stepId,
					error: e.message,
					status: ExecutionStatus.Failed,
					...(node.step.retriesExecuted > 0 && { retries: node.step.retriesExecuted })
				} as ExecutionOutput<null>;
			}

			if (out.status == ExecutionStatus.Failed && node.step.retries > 0) {
				node.step.updateRetries();
				continue;
			}

			this.workflowContext.results[out.stepId] = out;

			// for now, assume no branches
			const nb = node.getAllNeighbors();
			const nbValues = Object.values(nb);
			if (nbValues.length != 0) {
				const nextNode = nbValues[0]!;
				node = nextNode;
			} else {
				return;
			}
		}
	}
}
