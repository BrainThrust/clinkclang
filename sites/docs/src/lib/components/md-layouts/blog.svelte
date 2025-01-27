<script lang="ts">
	import type { Post } from '$lib/types';

	// Define the props for this component
	let { children, post } = $props<{
		post: Post;
	}>();
</script>

<article class="prose prose-slate dark:prose-invert max-w-none">
	<h1>{post.title}</h1>
	<div class="text-sm text-muted-foreground">
		{new Date(post.date).toLocaleDateString()}
	</div>
	{@render children()}
</article>

<style>
	:global(.prose) {
		max-width: 65ch;
		margin: 0 auto;
	}
</style>
