#!/usr/bin/env node
import { program } from 'commander';
import { initProject, addComponent } from '../src/cli.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

program
	.command('version')
	.description('Show the version number')
	.action(() => {
		// Construct the path to package.json relative to the current file.
		const packageJsonPath = path.resolve(__dirname, '../../package.json');
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
