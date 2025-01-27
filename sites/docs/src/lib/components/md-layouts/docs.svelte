<script lang="ts">
	import type { Docs } from '$lib/types';

	// Define the props for this component
	let { children, docs } = $props<{
		docs: Docs;
	}>();
</script>

<article class="prose prose-slate dark:prose-invert max-w-none">
	<h1>{docs.title}</h1>
	<div class="text-sm text-muted-foreground">
		{new Date(docs.date).toLocaleDateString()}
	</div>
	{@render children()}
</article>

<style>
	:global(.prose) {
		max-width: 65ch;
		margin: 0 auto;
	}
</style>
