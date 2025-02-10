import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

// Define the structure of a blog post module
interface Docs {
	default: unknown;
	metadata: Record<string, unknown>;
}

export const load: PageLoad = async ({ params }) => {
	try {
		// Import all markdown and svx files from the blog content directory
		// This creates a record of dynamic imports for each matching file
		const modules = import.meta.glob('../../../content/docs/*.{md,svx}');

		// Debug: Log all available paths
		// console.log('Available paths:', Object.keys(modules));
		// console.log('Looking for slug:', params.slug);

		// Find the file path that matches the requested slug
		// Checks for both .md and .svx file extensions
		const matchingPath = Object.keys(modules).find(
			(path) => path.endsWith(`/${params.slug}.md`) || path.endsWith(`/${params.slug}.svx`)
		);

		// Debug: Log the matching path
		// console.log('Matching path:', matchingPath);

		// If no matching post is found, throw a 404 error
		if (!matchingPath) {
			throw error(404, `Blog post not found`);
		}

		// Dynamically import the matching blog post
		// The imported module contains both the compiled content and metadata
		const docs = (await modules[matchingPath]()) as Docs;

		// Return the post data in the format expected by the page
		return {
			component: docs.default,
			docs: {
				...docs.metadata,
				slug: params.slug
			}
		};
	} catch (e) {
		console.error('Error loading docs:', e);
		throw error(404, `Docs not found`);
	}
};
