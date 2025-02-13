---
layout: githubMarkdownLight
title: Quickstart
date: '2025-02-13'
description: 'Quickstart guide to the Agent Docs'
---
# Quickstart

How to setup clinkclang in your project.

## Installation

```bash
pnpm dlx clinkclang@latest init
```

When prompted, enter your project name:
```bash
What is the name of your project?
> clinkclang-project    # default
> .                     # use current directory
> my-custom-name        # or type a custom name
```

## Configure clinkclang.json

You will be asked a question about where you want to store your library files.

```bash
1. Where do you want to store your library files? > lib
```

## Adding Components

```bash
pnpm dlx clinkclang@latest add agent-core
pnpm dlx clinkclang@latest add agent-evals
pnpm dlx clinkclang@latest add agent-examples
pnpm dlx clinkclang@latest add agent-functions
pnpm dlx clinkclang@latest add agent-strategies
pnpm dlx clinkclang@latest add agent-tools
pnpm dlx clinkclang@latest add agent-workflows
```





