# clinkclang - the clinkclang CLI

Dependencies:
- Commander.js: Parse CLI commands/flags
- Chalk: Terminal styling
- Degit: Scaffold projects from templates

## Testing locally
```bash
pnpm install

# Link the local package
pnpm run build
pnpm link --global
clinkclang version
```

```bash
# Initialise a new project
pnpm dlx clinkclang@latest init my-new-project

# Add a component
pnpm dlx clinkclang@latest add core

# Show version
pnpm dlx clinkclang@latest version
```
