# Clinkclang

The Point of this project is to create simple components in a shadcn style to copy and paste into other projects.

## Getting Started

Dependencies:

- pnpm
- node
- npm
- zod
- shadcn/ui (Optional)

For now the idea is simple. Do copypastes to identify repeatable components you want to use.

`pnpm dlx clinkclang@latest init`:
asks to configure components.json, either creates or edits: 
base:
```json
{
	"clinkclang": {
		"framework": "sveltekit",
		"language": "typescript",
		"aliases": {
			"components": "$lib/components",
			"utils": "$lib/utils",
			"ui": "$lib/components/ui"
		}
	}
}
```

sveltekit example:
```json
{
	"$schema": "https://next.shadcn-svelte.com/schema.json",
	"style": "default",
	"tailwind": {
		"config": "tailwind.config.ts",
		"css": "src/app.css",
		"baseColor": "slate"
	},
	"aliases": {
		"components": "$lib/components",
		"utils": "$lib/utils",
		"ui": "$lib/components/ui",
		"hooks": "$lib/hooks"
	},
	"typescript": true,
	"registry": "https://next.shadcn-svelte.com/registry",
	"clinkclang": {
		"framework":"sveltekit",
		"language":"typescript",
		"aliases": {
			"agents": "$lib/agents",
			"functions": "$lib/functions",
			"components": "$lib/components",
			"ui": "$lib/components/ui"
		}
	}
}
```

nuxt example:
```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "default",
  "typescript": true,
  "tsConfigPath": ".nuxt/tsconfig.json",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "assets/css/tailwind.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "framework": "nuxt",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  },
  "clinkclang": {
    "framework": "nuxt",
    "language": "typescript",
    "aliases": {
      "components": "@/components",
      "utils": "@/lib/utils"
    }
  }
}
```

decides:
1. where to install the components
  - asks if it is framework if detected else asks for the framework
  - sveltekit: ./src/lib/components
  - nuxt: ./components
  - next: ./lib/components
2. where to install the agent-core
  - sveltekit: ./src/lib/agents
  - nuxt: ./lib/agents
  - next: ./lib/agents

installs:
1. agent-cli (if not already installed)
2. agent-core (depends on the framework)
3. components.json (if not already created)

# Agents
`pnpm dlx clinkclang@latest add-agent`:
asks for the name of the agent.
1. `pnpm dlx clinkclang@latest add-agent HelloWorldAgent`
2. `pnpm dlx clinkclang@latest add-agent HelloWorldAgent --overwrite`

# Functions
`pnpm dlx clinkclang@latest add-function`:
asks for the name of the function and the type of function.
1. `pnpm dlx clinkclang@latest add-function HelloWorldFunction`
2. `pnpm dlx clinkclang@latest add-function HelloWorldFunction --overwrite`

# Workflows
`pnpm dlx clinkclang@latest add-workflow`:
asks for the name of the workflow and the type of workflow.
1. `pnpm dlx clinkclang@latest add-workflow HelloWorldWorkflow`
2. `pnpm dlx clinkclang@latest add-workflow HelloWorldWorkflow --overwrite`

# Components
`pnpm dlx clinkclang@latest add-component`:
asks for the name of the component and the type of component.
1. `pnpm dlx clinkclang@latest add-component HelloWorldComponent`
2. `pnpm dlx clinkclang@latest add-component HelloWorldComponent --overwrite`

# UI
`pnpm dlx clinkclang@latest add-ui`:
asks for the name of the ui and the type of ui.
1. `pnpm dlx clinkclang@latest add-ui HelloWorldUi`
2. `pnpm dlx clinkclang@latest add-ui HelloWorldUi --overwrite`
