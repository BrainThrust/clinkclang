<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container mx-auto py-8">
	<h1 class="text-4xl font-bold mb-8">Docs</h1>

	<div class="grid gap-6">
		{#each data.docs as doc}
			<article class="group">
				<a
					href="/docs/{doc.slug}"
					class="block p-6 bg-card hover:bg-muted rounded-lg transition-colors"
				>
					<h2 class="text-2xl font-semibold group-hover:text-primary">
						{doc.title}
					</h2>
					<time class="text-sm text-muted-foreground">
						{new Date(doc.date).toLocaleDateString()}
					</time>
					{#if doc.description}
						<p class="mt-2 text-muted-foreground">{doc.description}</p>
					{/if}
				</a>
			</article>
		{/each}
	</div>
</div>
