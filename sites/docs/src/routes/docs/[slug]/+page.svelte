<script lang="ts">
	import type { PageData } from './$types';
	import type { SvelteComponent } from 'svelte';

	export let data: PageData & { component: typeof SvelteComponent };
</script>

<svelte:component this={data.component} docs={data.docs} />
