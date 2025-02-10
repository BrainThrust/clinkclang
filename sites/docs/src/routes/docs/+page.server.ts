import type { PageServerLoad } from './$types';

// Define the structure of MDSvex files (Markdown/MDX files processed by MDSvex)
interface MdsvexFile {
	default: unknown; // The actual content of the file
	metadata: {
		title: string;
		date: string;
		description?: string;
	};
}

// SvelteKit server load function to fetch and process blog posts
export const load: PageServerLoad = async () => {
	// Fetch all Markdown/MDSvex files from the blog content directory
	// and process them in parallel using Promise.all
	const docs = await Promise.all(
		Object.entries(import.meta.glob<MdsvexFile>('/src/content/docs/*.{md,svx}')).map(
			async ([path, resolver]) => {
				// Extract metadata from each blog post
				const { metadata } = await resolver();
				// Create slug from filename by removing the file extension
				const slug = path
					.split('/')
					.pop()
					?.replace(/\.(md|svx)$/, '');
				// Return combined metadata and slug
				return { ...metadata, slug };
			}
		)
	);

	// Return sorted posts with most recent first
	return {
		docs: docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	};
};
