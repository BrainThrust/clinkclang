<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<div class="flex items-center gap-6">
	<a href="https://github.com/BrainThrust/clinkclang" target="_blank">
		<Icon icon="mdi:github" class="size-8 text-[#FF9B5C] transition-colors hover:electric" />
	</a>
</div>

<style>
	:global(.electric) {
		--electric-color: #ff9b5c; /* Primary electric color */
		filter: drop-shadow(0 0 5px var(--electric-color)) drop-shadow(0 0 10px var(--electric-color));
		animation: electricPulse 1s infinite alternate;
	}

	:global(.hover\:electric:hover) {
		--electric-color: #ff9b5c;
		filter: drop-shadow(0 0 10px var(--electric-color)) drop-shadow(0 0 20px var(--electric-color));
		animation: electricPulse 1s infinite alternate;
	}

	@keyframes electricPulse {
		from {
			filter: drop-shadow(0 0 5px var(--electric-color)) drop-shadow(0 0 10px var(--electric-color));
		}
		to {
			filter: drop-shadow(0 0 10px var(--electric-color))
				drop-shadow(0 0 20px var(--electric-color));
		}
	}
</style>
