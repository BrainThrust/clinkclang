import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

// Define the structure of a blog post module
interface Docs {
	default: unknown;
	metadata: Record<string, unknown>;
}

// Define structure for Component modules (same as Docs, can be combined into one interface if they are identical)
interface clinkClangComponent {
	default: unknown;
	metadata: Record<string, unknown>;
}

export const load: PageLoad = async ({ params }) => {
	try {
		// Import all markdown and svx files from the blog content directory
		// This creates a record of dynamic imports for each matching file
		const docsModules = import.meta.glob('../../../content/docs/*.{md,svx}');
		const componentsModules = import.meta.glob('../../../content/components/*.{md,svx}');

		// Debug: Log all available paths
		// console.log('Available paths:', Object.keys(modules));
		// console.log('Looking for slug:', params.slug);

		// --- Find Doc ---
		// Find the file path that matches the requested slug
		// Checks for both .md and .svx file extensions
		const matchingDocsPath = Object.keys(docsModules).find(
			(path) => path.endsWith(`/${params.slug}.md`) || path.endsWith(`/${params.slug}.svx`)
		);

		// Debug: Log the matching path
		// console.log('Matching path:', matchingPath);

		// --- Find Component ---
		const matchingComponentPath = Object.keys(componentsModules).find(
			(path) => path.endsWith(`/${params.slug}.md`) || path.endsWith(`/${params.slug}.svx`)
		);

		// If no matching post is found, throw a 404 error
		if (!matchingDocsPath && !matchingComponentPath) {
			throw error(404, `Blog post or component not found`);
		}

		// Dynamically import the matching blog post
		// The imported module contains both the compiled content and metadata
		const docs = matchingDocsPath ? ((await docsModules[matchingDocsPath]()) as Docs) : null;
		const clinkClangComponent = matchingComponentPath
			? ((await componentsModules[matchingComponentPath]()) as clinkClangComponent)
			: null;

		// Return the post data in the format expected by the page
		return {
			component: docs ? docs.default : clinkClangComponent?.default,
			docs: docs
				? {
						...docs.metadata,
						slug: params.slug
					}
				: clinkClangComponent
					? {
							...clinkClangComponent.metadata,
							slug: params.slug
						}
					: null
		};
	} catch (e) {
		console.error('Error loading docs:', e);
		throw error(404, `Docs not found`);
	}
};
