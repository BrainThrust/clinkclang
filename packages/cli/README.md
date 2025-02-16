# clinkclang

A cli tool for adding clinkclang to your project.

## Usage

```bash
# Initialise a new project
pnpm dlx clinkclang@latest init

# Add clinkclang's packages
pnpm dlx clinkclang@latest add agent-core
pnpm dlx clinkclang@latest add agent-evals
pnpm dlx clinkclang@latest add agent-examples
pnpm dlx clinkclang@latest add agent-functions
pnpm dlx clinkclang@latest add agent-strategies
pnpm dlx clinkclang@latest add agent-tools
pnpm dlx clinkclang@latest add agent-workflows
pnpm dlx clinkclang@latest add tracker

# Show version
pnpm dlx clinkclang@latest version
```

## Testing locally
```bash
pnpm run dev -- version
pnpm run dev -- add agent-core
```

## Testing build locally
```bash
pnpm install
# Link the local package
pnpm run build
pnpm link --global
clinkclang version
```

## Publishing
```bash
pnpm publish --access public
```

## Dependencies:
- Commander.js: Parse CLI commands/flags
- Chalk: Terminal styling
- Degit: Scaffold projects from templates