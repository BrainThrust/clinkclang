<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	const features = [
		m.feature_full_stack(),
		m.feature_type_safety(),
		m.feature_schema_first(),
		m.feature_no_lock_in(),
		m.feature_enterprise_stack(),
		m.feature_future_proof()
	];
</script>

<div class="min-h-screen bg-gradient-to-b from-white to-gray-500">
	<!-- Hero Section -->
	<section class="container mx-auto px-4 py-24 text-left">
		<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{m.hero_title()}</h1>
		<h2
			class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
		>
			{m.hero_subtitle()}
		</h2>
		<p class="leading-7 [&:not(:first-child)]:mt-6">
			{m.hero_description()}
			<br class="hidden md:block" />
			<span class="font-semibold">{m.hero_highlight()}</span> with:
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
				{m.install_command()}
			</code>
			<Button href="/docs" class="px-8 py-4">{m.start_building()}</Button>
			<Button variant="outline" href="https://github.com/BrainThrust/clinkclang" class="px-8 py-4">
				{m.community_invite()}
			</Button>
		</div>
	</section>
</div>
