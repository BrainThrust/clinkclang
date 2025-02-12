# clinkclang

A cli tool for adding clinkclang to your project.

## Usage

```bash
# Initialise a new project
pnpm dlx clinkclang@latest init my-new-project

# Add clinkclang's core package
pnpm dlx clinkclang@latest add core

# Show version
pnpm dlx clinkclang@latest version
```

## Testing locally
```bash
pnpm install

# Link the local package
pnpm run build
pnpm link --global
clinkclang version
```

## Dependencies:
- Commander.js: Parse CLI commands/flags
- Chalk: Terminal styling
- Degit: Scaffold projects from templates