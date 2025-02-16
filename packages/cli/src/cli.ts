import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';
import degit from 'degit';
import { DegitOptions, remoteComponentMapping } from '../src/config.js';

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

	// Check for clinkclang.json
	const clinkclangConfigPath = path.resolve(process.cwd(), 'clinkclang.json');
	if (!fs.existsSync(clinkclangConfigPath)) {
		console.error(
			chalk.red(
				'Not a ClinkClang project (or any of the parent directories): clinkclang.json not found.'
			)
		);
		process.exit(1);
	}

	const lowerCaseComponent = component.toLowerCase();
	const remoteComponent = remoteComponentMapping[lowerCaseComponent];

	if (!remoteComponent) {
		console.error(chalk.red(`Component "${component}" is not recognized.`));
		process.exit(1);
	}

	// Construct the degit path, handling subdirectory components.
	const degitPath = remoteComponent.url;

	// Read clinkclang.json to get the library directory
	const clinkclangConfig = JSON.parse(fs.readFileSync(clinkclangConfigPath, 'utf8'));
	const libraryDir = clinkclangConfig.libraryDir;

	// Construct the target directory based on component type.
	const targetDir = path.resolve(process.cwd(), libraryDir, 'ai', lowerCaseComponent);

	const degitOptions: DegitOptions = {
		cache: false,
		force: true,
		verbose: true,
		// strip 2 levels for logic and strip 7 levels for components
		...(remoteComponent.type === 'logic' && {
			strip: 2
		}),
		...(remoteComponent.type === 'component' && {
			strip: 7
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
