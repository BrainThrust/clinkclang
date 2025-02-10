<script lang="ts">
	import Hero from './Hero.svelte';
	import Features from './Features.svelte';
	import CodeExample from './CodeExample.svelte';
	import Footer from './Footer.svelte';
	import About from './About.svelte';
</script>

<main class="min-h-screen w-full bg-black font-mono text-[#FF9B5C] dark">
	<div class="relative">
		<Hero />
		<About />
		<Features />
		<CodeExample />
		<Footer />
	</div>

	<!-- Move overlays after the content -->
	<!-- CRT Scan lines overlay -->
	<div
		class="fixed inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMiIgaGVpZ2h0PSIyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBoMnYxSDB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]"
	></div>
	<!-- CRT Vignette effect -->
	<div
		class="fixed inset-0 pointer-events-none bg-gradient-radial from-transparent via-black/10 to-black/80"
	></div>
</main>

<style>
	/* CRT animation effect */
	main::before {
		content: '';
		position: fixed;
		inset: 0;
		background: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.1) 50%);
		background-size: 100% 4px;
		animation: scanlines 0.5s linear infinite;
		pointer-events: none;
		z-index: 50;
	}

	@keyframes scanlines {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(4px);
		}
	}
</style>
