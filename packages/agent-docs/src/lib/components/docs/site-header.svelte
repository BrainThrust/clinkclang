<script lang="ts">
	import { page } from '$app/stores';
	let links = [
		{ name: 'Docs', href: '/docs' },
		{ name: 'Examples', href: '/examples' }
	];
</script>

<header class="w-full flex items-center p-4 border-b">
	<div class="container mx-auto flex items-center space-x-4">
		<a href="/" class="text-xl font-bold">ClinkClang</a>
		<nav class="flex space-x-4">
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
	</div>
</header>
