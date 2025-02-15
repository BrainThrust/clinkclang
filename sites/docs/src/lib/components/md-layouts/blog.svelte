<script lang="ts">
	import type { Post } from '$lib/types';

	import './docs.css';
	// Define the props for this component
	let { children, post } = $props<{
		post: Post;
	}>();
</script>

<main class="markdown-body">
<article class="prose prose-slate dark:prose-invert max-w-none">
	<h1 class="text-2xl font-bold">{post.title}</h1>
	<div class="text-sm text-muted-foreground">
		{new Date(post.date).toLocaleDateString()}
	</div>
	{@render children()}
	</article>
</main>
