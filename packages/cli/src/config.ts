export type ComponentType = 'component' | 'logic';

export interface RemoteComponent {
	url: string;
	type: ComponentType;
}
export const remoteComponentMapping: Record<string, RemoteComponent> = {
	'agent-core': {
		url: 'github:BrainThrust/clinkclang/packages/agent-core#dev-0.01',
		type: 'logic'
	},
	'agent-evals': {
		url: 'github:BrainThrust/clinkclang/packages/agent-evals#dev-0.01',
		type: 'logic'
	},
	'agent-examples': {
		url: 'github:BrainThrust/clinkclang/packages/agent-examples#dev-0.01',
		type: 'logic'
	},
	'agent-functions': {
		url: 'github:BrainThrust/clinkclang/packages/agent-functions#dev-0.01',
		type: 'logic'
	},
	'agent-strategies': {
		url: 'github:BrainThrust/clinkclang/packages/agent-strategies#dev-0.01',
		type: 'logic'
	},
	'agent-tools': {
		url: 'github:BrainThrust/clinkclang/packages/agent-tools#dev-0.01',
		type: 'logic'
	},
	'agent-workflows': {
		url: 'github:BrainThrust/clinkclang/packages/agent-workflows#dev-0.01',
		type: 'logic'
	},
	workflow: {
		url: 'github:BrainThrust/clinkclang/packages/workflow#dev-0.01',
		type: 'logic'
	},
	'workflow-examples': {
		url: 'github:BrainThrust/clinkclang/packages/workflow-examples#dev-0.01',
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
