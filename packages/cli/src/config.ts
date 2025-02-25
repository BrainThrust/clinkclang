// src/config.ts
export type ComponentType = 'component' | 'logic';

export interface RemoteComponent {
	url: string;
	type: ComponentType;
	branch?: string; // Make branch optional
	path: string; // Required path for installation
}

// Default configuration options
export const defaultConfig = {
	branch: 'dev-0.01' // Default branch to use when not specified
};

export const remoteComponentMapping: Record<string, RemoteComponent> = {
	'agent-core': {
		url: 'github:BrainThrust/clinkclang/packages/core',
		type: 'logic',
		path: 'core'
	},
	'agent-evals-llm-as-judge': {
		url: 'github:BrainThrust/clinkclang/packages/evaluations/llm-as-judge',
		type: 'logic',
		path: 'evaluations/llm-as-judge'
	},
	'agent-examples': {
		url: 'github:BrainThrust/clinkclang/packages/examples',
		type: 'logic',
		path: 'examples'
	},
	'agent-functions': {
		url: 'github:BrainThrust/clinkclang/packages/functions',
		type: 'logic',
		path: 'functions'
	},
	workflows: {
		url: 'github:BrainThrust/clinkclang/packages/workflows',
		type: 'logic',
		path: 'workflows'
	},
	'workflows-examples': {
		url: 'github:BrainThrust/clinkclang/packages/workflows-examples',
		type: 'logic',
		path: 'workflows-examples'
	},
	tracker: {
		url: 'github:BrainThrust/clinkclang/sites/docs/src/lib/components/ai/tracker',
		type: 'component',
		path: 'tracker'
	}
};

export interface DegitOptions {
	cache: boolean;
	force: boolean;
	verbose: boolean;
	filter?: (file: string) => boolean;
	strip?: number;
}

export function getComponentBranch(component: RemoteComponent): string {
	return component.branch || defaultConfig.branch;
}
