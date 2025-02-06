---
layout: githubMarkdownLight
title: Introduction
date: '2025-01-27'
description: 'Introduction to the Agent Docs'
---
# Introduction

ClinkClang is an open-source TypeScript framework for building AI agent workflows with a focus on the developer's experience and enterprise scalability.

### Vision

(TODO)

### Core Features

- **Flexible Provider System**: Easily switch between different LLM providers (OpenAI, Claude, DeepSeek)
- **Strategy Based**: Support for different reasoning strategies like ReAct and Reflexion
- **Tool Integration**: Easy to use interface for adding custom tools and capabilities
- **Memory Management**: (TODO)
- **Structured Output**: Schema validation and typed responses using the ZOD library
- **Built-in Evaluation** : AutoEvals library integration for quality, safety, and task-specific metrics

### How It Works

The system is built around a modular core that manages:

```
User Input → Agent → Framework → Provider → Model → Framework → Tool Execution → Final Output
```

Each component:

* **User** : Input queries and tasks
* **Agent** : Core orchestrator managing flow
* **Provider/Model** : LLM integration (OpenAI, Claude, etc)
* **Strategy** : ReAct/Reflexion reasoning
* **Tools** : Custom function execution
* **Output** : Structured, validated responses

### Future Roadmap

(TODO)

### Project Status (TODO)

ClinkClang is currently in active development.
