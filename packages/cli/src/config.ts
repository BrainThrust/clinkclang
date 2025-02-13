export const remoteComponentMapping: Record<string, string> = {
	'agent-core': 'github:BrainThrust/clinkclang/packages/agent-core#dev-0.01',
	'agent-evals': 'github:BrainThrust/clinkclang/packages/agent-evals#dev-0.01',
	'agent-examples': 'github:BrainThrust/clinkclang/packages/agent-examples#dev-0.01',
	'agent-functions': 'github:BrainThrust/clinkclang/packages/agent-functions#dev-0.01',
	'agent-strategies': 'github:BrainThrust/clinkclang/packages/agent-strategies#dev-0.01',
	'agent-tools': 'github:BrainThrust/clinkclang/packages/agent-tools#dev-0.01',
	'agent-workflows': 'github:BrainThrust/clinkclang/packages/agent-workflows#dev-0.01'
	// express: 'github:BrainThrust/clinkclang-express#dev-0.01'
};

export interface DegitOptions {
	cache: boolean;
	force: boolean;
	verbose: boolean;
	filter?: (file: string) => boolean;
	strip?: number;
}
