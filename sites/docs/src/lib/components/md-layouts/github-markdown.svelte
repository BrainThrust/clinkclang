<script lang="ts">
	import './github-markdown-light.css';

	let title = '';

	let { children } = $props<{
		children: any;
		title: string;
	}>();
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<main class="markdown-body" style="max-width: 60ch; margin: auto; padding-top: 2.5rem;">
	<h1>{title}</h1>
	{@render children()}
</main>
