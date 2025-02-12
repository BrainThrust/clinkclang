#!/usr/bin/env node
import { program } from 'commander';
import { initProject, addComponent } from '../src/cli.js';

program
	.command('version')
	.description('Show the version number')
	.action(() => {
		console.log('clinkclang version 0.1.0');
	});

program
	.command('init')
	.description('Initialize a new ClinkClang project')
	.argument('[name]', 'Project name')
	.action(async (name) => {
		await initProject(name);
	});

program
	.command('add')
	.description('Add a component (e.g., core, evals, etc.) to your ClinkClang project')
	.argument('<component>', 'Component to add')
	.action(async (component) => {
		await addComponent(component);
	});

program.parse(process.argv);
