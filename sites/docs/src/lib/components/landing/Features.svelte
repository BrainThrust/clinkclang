<script lang="ts">
	import { MonitorIcon, CommandIcon, ServerIcon } from "lucide-svelte";
	import { Card, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
	import * as m from '$lib/paraglide/messages.js';
	const features = [
		{
			icon: MonitorIcon,
			title: m.features_card_1_title(),
			description: m.features_card_1_description(),
		},
		{
			icon: CommandIcon,
			title: m.features_card_2_title(),
			description: m.features_card_2_description(),
		},
		{
			icon: ServerIcon,
			title: m.features_card_3_title(),
			description: m.features_card_3_description(),
		},
	];
</script>

<section id="features" class="py-24">
	<div class="container mx-auto px-4">
		<div class="mb-16 text-center">
			<div class="mb-6 inline-flex rounded-lg border border-[#FF9B5C]/20 bg-black/50 px-4 py-2">
				<span class="animate-pulse text-sm">■</span>
				<span class="ml-2 text-sm">SYSTEM CAPABILITIES</span>
			</div>
			<h2 class="mb-4 text-3xl font-bold tracking-tight retro-glow">{m.features_title()}</h2>
			<p class="mx-auto max-w-2xl text-[#FF9B5C]/70">{m.features_description()}</p>
		</div>

		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<Card class="group border border-[#FF9B5C]/20 bg-black/50 transition-all duration-300 hover:border-[#FF9B5C] crt-content">
					<CardHeader>
						<div class="flex items-center gap-2">
							<feature.icon class="size-8 text-[#FF9B5C]" />
							<div class="h-px flex-1 bg-[#FF9B5C]/20 group-hover:bg-[#FF9B5C]"></div>
						</div>
						<CardTitle class="mt-4 tracking-wider">{feature.title}</CardTitle>
						<CardDescription class="text-[#FF9B5C]/70">
							> {feature.description}
						</CardDescription>
					</CardHeader>
				</Card>
			{/each}
		</div>
	</div>
</section>

<style>
	.retro-glow {
		text-shadow:
			0 0 5px #ff9b5c,
			0 0 10px #ff7f50,
			0 0 15px #ff7f50;
	}

	.crt-content {
		position: relative;
		overflow: hidden;
	}

	.crt-content::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: repeating-linear-gradient(0deg, rgba(255, 155, 92, 0.03) 0px, rgba(255, 155, 92, 0.03) 1px, transparent 1px, transparent 2px);
		pointer-events: none;
	}
</style>
