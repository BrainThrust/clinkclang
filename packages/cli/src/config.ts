export type ComponentType = 'component' | 'logic';

export interface RemoteComponent {
	url: string;
	type: ComponentType;
}
export const remoteComponentMapping: Record<string, RemoteComponent> = {
	'agent-core': {
		url: 'github:BrainThrust/clinkclang/packages/core#dev-0.01',
		type: 'logic'
	},
	'agent-evals-llm-as-judge': {
		url: 'github:BrainThrust/clinkclang/packages/evaluations/llm-as-judge#dev-0.01',
		type: 'logic'
	},
	'agent-examples': {
		url: 'github:BrainThrust/clinkclang/packages/examples#dev-0.01',
		type: 'logic'
	},
	'agent-functions': {
		url: 'github:BrainThrust/clinkclang/packages/functions#dev-0.01',
		type: 'logic'
	},
	'workflows': {
		url: 'github:BrainThrust/clinkclang/packages/workflows#dev-0.01',
		type: 'logic'
	},
	'workflows-examples': {
		url: 'github:BrainThrust/clinkclang/packages/workflows-examples#dev-0.01',
		type: 'logic'
	},
	tracker: {
		url: 'github:BrainThrust/clinkclang/sites/docs/src/lib/components/ai/tracker#dev-0.01',
		type: 'component'
	}
};

export interface DegitOptions {
	cache: boolean;
	force: boolean;
	verbose: boolean;
	filter?: (file: string) => boolean;
	strip?: number;
}
