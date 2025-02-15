<script lang="ts">
	import SiteHeader from '$lib/components/docs/site-header.svelte';
	let { children, data } = $props();
</script>

<div class="flex h-screen">
	<div class="flex-1 flex flex-col overflow-auto">
		<SiteHeader {data} />
		<div class="container mx-auto py-8">
			<div class="grid grid-cols-12 gap-6">
				<!-- Sidebar -->
				<aside class="col-span-3 hidden lg:block">
					<nav class="flex flex-col gap-2">
						{#each data.docs as doc}
							<a
								href="/docs/{doc.slug}"
								class="block p-2 bg-card hover:bg-muted rounded-lg transition-colors"
							>
								<h2 class="font-semibold hover:text-primary">
									{doc.title}
								</h2>
								<time class="text-sm text-muted-foreground">
									{new Date(doc.date).toLocaleDateString()}
								</time>
								{#if doc.description}
									<p class="mt-1 text-muted-foreground text-sm">{doc.description}</p>
								{/if}
							</a>
						{/each}
					</nav>
				</aside>
				<main class="col-span-12 lg:col-span-9">
					{@render children()}
				</main>
			</div>
		</div>
	</div>
</div>
