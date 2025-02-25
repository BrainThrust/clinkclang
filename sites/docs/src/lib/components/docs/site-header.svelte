<script lang="ts">
	import Menu from 'lucide-svelte/icons/menu';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';
	import { getStores } from '$app/stores';
	const { page } = getStores();

	let { data } = $props();

	let links = [
		{ name: m.link_to_docs(), href: '/docs' },
		{ name: m.link_to_blogs(), href: '/blog' }
	];

	let currentPath = $page.url.pathname;
</script>

<header class="w-full flex items-center p-4 border-b">
	<div class="container mx-auto flex items-center space-x-4">
		<Drawer.Root>
			<Drawer.Trigger>
				<Menu class="lg:hidden" />
			</Drawer.Trigger>
			<Drawer.Content>
				<Drawer.Header class="flex items-center justify-start gap-2">
					<Drawer.Title>Links</Drawer.Title>
				</Drawer.Header>
				{#each links as link}
					<Drawer.Close>
						<a href={link.href} class="px-4 py-2 hover:bg-muted rounded-md flex items-center">
							{link.name}
						</a>
					</Drawer.Close>
				{/each}

				{#if currentPath.startsWith('/docs')}
					<Drawer.Header class="flex items-center justify-start">
						<Drawer.Title>Documentation</Drawer.Title>
					</Drawer.Header>
					{#each data.docs as doc}
						<Drawer.Close>
							<a href="/docs/{doc.slug}" class="block">
								<div class="px-4 py-2 hover:bg-muted rounded-md flex items-center">
									{doc.title}
								</div>
							</a>
						</Drawer.Close>
					{/each}
					<Drawer.Header class="flex items-center justify-start">
						<Drawer.Title>Components</Drawer.Title>
					</Drawer.Header>
					{#each data.components as component}
						<Drawer.Close>
							<a href="/docs/{component.slug}" class="block">
								<div class="px-4 py-2 hover:bg-muted rounded-md flex items-center">
									{component.title}
								</div>
							</a>
						</Drawer.Close>
					{/each}
				{/if}
			</Drawer.Content>
		</Drawer.Root>

		<a href="/" class="text-xl font-bold">ClinkClang</a>
		<nav class="space-x-4 hidden lg:flex">
			{#each links as link}
				<a
					href={link.href}
					class={$page.url.pathname.startsWith(link.href)
						? 'text-foreground hover:text-foreground/80 transition-colors'
						: 'text-foreground/60 hover:text-foreground/80 transition-colors'}
				>
					{link.name}
				</a>
			{/each}
		</nav>
		<LanguageSwitcher />
	</div>
</header>
