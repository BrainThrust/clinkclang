<script lang="ts">
	import SiteHeader from '$lib/components/docs/site-header.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	let { children, data } = $props();
</script>

<div class="flex h-screen">
	<div class="flex-1 flex flex-col overflow-auto">
		<SiteHeader {data} />
		<div class="container mx-auto py-8">
			<div class="grid grid-cols-12 gap-6">
				<!-- Sidebar -->
				<aside class="col-span-3 hidden lg:block">
					<nav class="flex flex-col">
						<!-- ClinkClang Docs -->
						<h2 class="font-semibold p-2">ClinkClang Docs</h2>
						{#each data.docs as doc}
							<a
								href="/docs/{doc.slug}"
								class="block p-1.5 px-4 bg-card hover:bg-muted rounded-lg transition-colors relative text-sm text-muted-foreground hover:text-foreground"
							>
								{doc.title}
							</a>
						{/each}
						<!-- Components (Coming Soon) -->
						<h2 class="font-semibold p-2">Components (Coming Soon)</h2>
					</nav>
				</aside>
				<main class="col-span-12 lg:col-span-9">
					{@render children()}
				</main>
			</div>
		</div>
	</div>
</div>
