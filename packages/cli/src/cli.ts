import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import prompts from 'prompts';
import degit from 'degit';

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

	// Copy a basic template into the project directory.
	// (Assume you have a template stored at ../templates/init)
	const templateDir = path.resolve(__dirname, '../templates/init');
	if (fs.existsSync(templateDir)) {
		fs.cpSync(templateDir, projectDir, { recursive: true });
	} else {
		console.error(chalk.red('Init template not found!'));
		process.exit(1);
	}

	// Optionally install dependencies with pnpm
	console.log(chalk.green('Installing dependencies...'));
	try {
		execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' });
	} catch (error) {
		console.error(chalk.red('Failed to install dependencies.'));
		process.exit(1);
	}

	console.log(chalk.blue(`Project ${projectName} initialized successfully!`));
	console.log(chalk.yellow('\nNext steps:'));
	console.log(chalk.cyan(`  cd ${projectName}`));
	console.log(chalk.cyan(`  pnpm dev`));
}

/**
 * Adds a component to the current project.
 *  - If the component is "core", it fetches only the packages/agent-core subdirectory.
 *  - Otherwise, it fetches the entire repository based on the remoteComponentMapping.
 */
export async function addComponent(component: string) {
	console.log(chalk.green(`Adding component "${component}" to your ClinkClang project...`));

	const remoteComponentMapping: Record<string, string> = {
		'agent-core': 'github:BrainThrust/clinkclang',
		'agent-evals': 'github:BrainThrust/clinkclang',
		examples: 'github:BrainThrust/clinkclang',
		express: 'github:BrainThrust/clinkclang-express'
	};

	const remoteRepo = remoteComponentMapping[component.toLowerCase()];
	if (!remoteRepo) {
		console.error(chalk.red(`Component "${component}" is not recognized.`));
		process.exit(1);
	}

	const targetDir = path.resolve(process.cwd(), component.toLowerCase());

	let degitPath = remoteRepo;
	const degitOptions: any = {
		cache: false,
		force: true,
		verbose: true
	};

	// Special handling for the "core" component:
	if (component.toLowerCase() === 'agent-core') {
		degitPath = `${remoteRepo}/packages/agent-core`;
		degitOptions.filter = (file: string) => file.startsWith('packages/agent-core');
		degitOptions.strip = 2; // Strip "packages/agent-core"
	}

	// Special handling for the "evals" component:
	if (component.toLowerCase() === 'agent-evals') {
		degitPath = `${remoteRepo}/packages/agent-evals`;
		degitOptions.filter = (file: string) => file.startsWith('packages/agent-evals');
		degitOptions.strip = 2; // Strip "packages/agent-evals"
	}

	// Special handling for the "examples" component:
	if (component.toLowerCase() === 'examples') {
		degitPath = `${remoteRepo}/packages/examples`;
		degitOptions.filter = (file: string) => file.startsWith('packages/examples');
		degitOptions.strip = 2; // Strip "packages/examples"
	}

	const emitter = degit(degitPath, degitOptions);

	try {
		await emitter.clone(targetDir);
		console.log(chalk.green(`Component "${component}" added successfully at ${targetDir}.`));
	} catch (error) {
		console.error(chalk.red(`Failed to add component "${component}" from remote repository.`));
		console.error(chalk.red(String(error)));
		process.exit(1);
	}
}
