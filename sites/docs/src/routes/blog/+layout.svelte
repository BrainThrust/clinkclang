<script lang="ts">
	import SiteHeader from '$lib/components/docs/site-header.svelte';
	let { children, data } = $props();
</script>

<div class="bg-white">
	<SiteHeader data={data} />
	{@render children()}
</div>
