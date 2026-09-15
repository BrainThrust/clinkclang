#!/usr/bin/env node
import { program } from 'commander';
import { initProject, addComponent } from '../src/cli.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path and directory.
const currentFile = fileURLToPath(import.meta.url);
const __dirname = path.dirname(currentFile);

// Check if we're running in development (TypeScript) or production (JavaScript)
const isDev = currentFile.endsWith('.ts');
const packageJsonPath = isDev
	? path.resolve(__dirname, '../package.json')
	: path.resolve(__dirname, '../../package.json');

program
	.command('version')
	.description('Show the version number')
	.action(() => {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
		console.log(`clinkclang version ${packageJson.version}`);
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
