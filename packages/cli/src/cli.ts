import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import prompts from 'prompts';
import degit from 'degit';
import { remoteComponentMapping, DegitOptions } from './config';

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
 */
export async function addComponent(component: string) {
	console.log(chalk.green(`Adding component "${component}" to your ClinkClang project...`));

	const lowerCaseComponent = component.toLowerCase();
	const remoteRepo = remoteComponentMapping[lowerCaseComponent];

	if (!remoteRepo) {
		console.error(chalk.red(`Component "${component}" is not recognized.`));
		process.exit(1);
	}

	// Construct the degit path, handling subdirectory components.
	const degitPath = remoteRepo;

	const targetDir = path.resolve(process.cwd(), lowerCaseComponent);

	const degitOptions: DegitOptions = {
		cache: false,
		force: true,
		verbose: true,
		// Only filter and strip if it's a known component from the mapping.
		...(remoteComponentMapping[lowerCaseComponent] && {
			strip: 2
		})
	};

	const emitter = degit(degitPath, degitOptions);

	try {
		await emitter.clone(targetDir);
		console.log(chalk.green(`Component "${component}" added successfully at ${targetDir}.`));
	} catch (error) {
		console.error(chalk.red(`Failed to add component "${component}" from remote repository.`));
		console.error(chalk.red(String(error))); // More specific error
		process.exit(1);
	}
}
