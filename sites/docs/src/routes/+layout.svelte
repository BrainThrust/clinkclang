<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { page } from '$app/stores';
	import '../app.css';
	import SiteHeader from '$lib/components/docs/site-header.svelte';
	let { children } = $props();
</script>

<ParaglideJS {i18n}>
	{#if $page.url.pathname !== '/' && $page.url.pathname !== '/zh-cn'}
		<SiteHeader />
	{/if}

	{@render children()}
</ParaglideJS>
