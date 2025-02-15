<script lang="ts">
	import type { Docs } from '$lib/types';
	import './docs.css';
	import { Separator } from "$lib/components/ui/separator/index.js";
	// Define the props for this component
	let { children, docs } = $props<{
		docs: Docs;
	}>();
</script>

<main class="markdown-body">
	<article class="prose prose-slate dark:prose-invert max-w-none pt-2">
		<div class="font-semibold text-muted-foreground">clinkclang-docs</div>
		<div class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xld">{docs.title}</div>
		<div class="text-sm text-muted-foreground">
			Last updated: {new Date(docs.date).toLocaleDateString()}
		</div>
		<div class="pt-10">
				{@render children()}
		</div>
	</article>
</main>

  
