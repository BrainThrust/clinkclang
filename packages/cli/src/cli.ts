// src/cli.ts
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';
import degit from 'degit';
import {
	DegitOptions,
	RemoteComponent,
	remoteComponentMapping,
	getComponentBranch
} from '../src/config.js';

/**
 * Initializes a new project.
 *
 * If a project name is not passed as an argument,
 * the user will be prompted for one.
 */
export async function initProject(name?: string) {
	// Prompt for a project name if not provided
	const response = name
		? { name }
		: await prompts({
				type: 'text',
				name: 'name',
				message: 'Project name:',
				initial: 'clinkclang-project'
			});

	const projectName = name || response.name;
	const projectDir = path.resolve(process.cwd(), projectName);

	console.log(chalk.green(`Initializing ClinkClang project in ${projectDir}...`));

	// Create the project directory (or fail gracefully if it exists)
	try {
		fs.mkdirSync(projectDir, { recursive: true });
	} catch (error) {
		console.error(chalk.red(`Failed to create directory: ${projectDir}`));
		process.exit(1);
	}

	// Ask where you want library files to be stored
	const libraryDir = await prompts({
		type: 'text',
		name: 'libraryDir',
		message: 'Where do you want to store your library files?',
		initial: 'lib'
	});

	// Create an ai folder in the library directory
	fs.mkdirSync(path.resolve(projectDir, libraryDir.libraryDir, 'ai'), { recursive: true });

	// Create clinkclang.json file in the project directory.
	fs.writeFileSync(
		path.resolve(projectDir, 'clinkclang.json'),
		JSON.stringify(
			{
				libraryDir: libraryDir.libraryDir
			},
			null,
			2
		)
	);

	console.log(chalk.blue(`Project ${projectName} initialized successfully!`));
	console.log(chalk.yellow('\nNext steps:'));
	console.log(chalk.cyan(`  cd ${projectName}`));
	console.log(chalk.cyan(`  pnpm dev`));
}

/**
 * Adds a component to the current project.
 */
export async function addComponent(component: string) {
	console.log(chalk.green(`Adding component "${component}" to your ClinkClang project...`));

	// Validate the project and get configuration
	const config = validateClinkClangProject();

	// Get the component information
	const lowerCaseComponent = component.toLowerCase();
	const remoteComponent = getRemoteComponent(lowerCaseComponent);

	if (!remoteComponent || !remoteComponent.url) {
		console.error(chalk.red('Component URL is missing'));
		process.exit(1);
	}

	// Set up target directory based on config
	const libraryDir = config.libraryDir || 'lib';
	const targetDir = path.resolve(process.cwd(), libraryDir, 'ai');
	fs.mkdirSync(targetDir, { recursive: true });

	try {
		if (remoteComponent.type === 'component') {
			await addUIComponent(remoteComponent, targetDir);
		} else {
			await addLogicComponent(remoteComponent, targetDir, component);
		}
	} catch (error) {
		console.error(chalk.red(`Failed to add component "${component}" from remote repository.`));
		console.error(chalk.red(String(error)));
		process.exit(1);
	}
}

/**
 * Validates that we're in a ClinkClang project and returns the configuration
 */
function validateClinkClangProject() {
	const clinkclangConfigPath = path.resolve(process.cwd(), 'clinkclang.json');
	if (!fs.existsSync(clinkclangConfigPath)) {
		console.error(
			chalk.red(
				'Not a ClinkClang project (or any of the parent directories): clinkclang.json not found.'
			)
		);
		throw new Error('clinkclang.json not found');
	}

	return JSON.parse(fs.readFileSync(clinkclangConfigPath, 'utf8'));
}

/**
 * Gets the remote component details
 */
function getRemoteComponent(componentName: string): RemoteComponent {
	const remoteComponent = remoteComponentMapping[componentName];

	if (!remoteComponent) {
		console.error(chalk.red(`Component "${componentName}" is not recognized.`));
		process.exit(1);
	}

	return remoteComponent;
}

/**
 * Adds a UI component to the project
 */
async function addUIComponent(remoteComponent: RemoteComponent, targetDir: string) {
	const degitOptions: DegitOptions = {
		cache: false,
		force: true,
		verbose: true
	};

	const branch = getComponentBranch(remoteComponent);
	const fullUrl = `${remoteComponent.url}#${branch}`;
	const componentDir = path.resolve(targetDir, remoteComponent.path);

	// Create the directory structure
	fs.mkdirSync(path.dirname(componentDir), { recursive: true });

	// Clone directly to the target directory
	const emitter = degit(fullUrl, degitOptions);
	await emitter.clone(componentDir);

	console.log(chalk.green(`UI Component added successfully at ${componentDir}`));
}

/**
 * Adds a logic component to the project
 */
async function addLogicComponent(
	remoteComponent: RemoteComponent,
	targetDir: string,
	componentName: string
) {
	const degitOptions: DegitOptions = {
		cache: false,
		force: true,
		verbose: true
	};

	const branch = getComponentBranch(remoteComponent);
	const fullUrl = `${remoteComponent.url}#${branch}`;
	const packageDir = path.resolve(targetDir, remoteComponent.path);

	// Create the directory structure
	fs.mkdirSync(path.dirname(packageDir), { recursive: true });

	// Clone directly to the target directory
	const emitter = degit(fullUrl, degitOptions);
	await emitter.clone(packageDir);

	console.log(chalk.green(`Logic Component added successfully at ${packageDir}`));
}
