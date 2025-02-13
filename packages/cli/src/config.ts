export const remoteComponentMapping: Record<string, string> = {
	'agent-core': 'github:BrainThrust/clinkclang/packages/agent-core',
	'agent-evals': 'github:BrainThrust/clinkclang/packages/agent-evals',
	examples: 'github:BrainThrust/clinkclang/packages/examples',
	express: 'github:BrainThrust/clinkclang-express'
};

export interface DegitOptions {
	cache: boolean;
	force: boolean;
	verbose: boolean;
	filter?: (file: string) => boolean;
	strip?: number;
}
