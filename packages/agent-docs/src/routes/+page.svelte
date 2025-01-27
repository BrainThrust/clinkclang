<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	const features = [
		'Full Stack AI Sovereignty',
		'Bulletproof Type Safety',
		'Schema-First Development',
		'Zero Vendor Lock-In',
		'Enterprise-Grade Stack',
		'Future-Proof Architecture'
	];
</script>

<div class="min-h-screen bg-gradient-to-b from-white to-gray-500">
	<!-- Hero Section -->
	<section class="container mx-auto px-4 py-24 text-left">
		<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Our Mission:</h1>
		<h2
			class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
		>
			Rapidly build and own your A.I agent stack
		</h2>
		<p class="leading-7 [&:not(:first-child)]:mt-6">
			The open-source toolkit for developers who refuse to outsource their AI future
			<br class="hidden md:block" />
			<span class="font-semibold">Ship mission-critical AI features 3x faster</span> with:
		</p>

		<!-- Feature Grid -->
		<div class="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
			{#each features as feature}
				<div class="flex items-center gap-2">
					<svg class="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"
						><path
							d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						/></svg
					>
					<span>{feature}</span>
				</div>
			{/each}
		</div>

		<div class="mt-12 flex gap-4">
			<code
				class="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold flex items-center justify-center"
			>
				> pnpm i clinkclang
			</code>
			<Button href="/docs" class="px-8 py-4">Start Building →</Button>
			<Button variant="outline" href="https://github.com/BrainThrust/clinkclang" class="px-8 py-4">
				⭐ Be part of the community
			</Button>
		</div>
	</section>
</div>
