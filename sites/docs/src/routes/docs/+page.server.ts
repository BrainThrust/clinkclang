import type { PageServerLoad } from './$types';

// SvelteKit server load function.  Empty, because the layout handles loading now.
export const load: PageServerLoad = async () => {
	return {};
};
