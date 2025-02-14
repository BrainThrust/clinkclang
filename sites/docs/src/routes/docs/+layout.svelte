<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SiteHeader from '$lib/components/docs/site-header.svelte';
	let { children, data } = $props();

	// initialize sidebar
	let sidebarOpen = $state(false);
</script>

<Sidebar.Provider bind:open={sidebarOpen}>
	<Sidebar.Inset>
		<div class="flex h-screen">
			<!-- Sidebar Mobile-->
			<Sidebar.Root>
				<Sidebar.Header>ClinkClang</Sidebar.Header>

				<Sidebar.Content>
					<!-- Create side group for each -->
					<Sidebar.Group>
						<Sidebar.GroupLabel>documentation</Sidebar.GroupLabel>
						{#each data.docs as doc}
							<Sidebar.GroupContent>
								<Sidebar.Menu>
									<Sidebar.MenuItem>
										<Sidebar.MenuButton>
											<a href="/docs/{doc.slug}">{doc.title}</a>
										</Sidebar.MenuButton>
									</Sidebar.MenuItem>
								</Sidebar.Menu>
							</Sidebar.GroupContent>
						{/each}
					</Sidebar.Group>
				</Sidebar.Content>
				<Sidebar.Footer />
			</Sidebar.Root>
			<div class="flex-1 flex flex-col overflow-auto">
				<SiteHeader />
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
						<main class="col-span-9">
							{@render children()}
						</main>
					</div>
				</div>
			</div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
