<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages.js';

	const examples = {
		typescript: `// Express

import { agent } from '$lib/agent';

agent.execute();`,
		svelte: `// Sveltekit
		
import { agentState } from '$lib/components/agent';

agentState.execute();`
	};
</script>

<section class="py-24" id="examples">
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-4xl">
			<div class="mb-8 text-center">
				<h2 class="mb-4 text-3xl font-bold tracking-tight retro-glow">{m.code_example_title()}</h2>
				<p class="text-[#FF9B5C]/70">{m.code_example_description()}</p>
			</div>

			<Card class="rounded-lg border border-[#FF9B5C]/20 bg-black/50 crt-screen">
				<div class="relative z-10">
					<Tabs class="w-full">
						<TabsList class="grid w-full grid-cols-2 lg:w-[400px] bg-background/10 relative z-20">
							<TabsTrigger
								value="typescript"
								class="data-[state=active]:bg-[#FF9B5C] data-[state=active]:text-black tracking-wider relative z-30"
								>TYPESCRIPT</TabsTrigger
							>
							<TabsTrigger
								value="svelte"
								class="data-[state=active]:bg-[#FF9B5C] data-[state=active]:text-black tracking-wider relative z-30"
								>SVELTE</TabsTrigger
							>
						</TabsList>
						{#each Object.entries(examples) as [lang, code]}
							<TabsContent value={lang} class="relative z-10">
								<CardContent>
									<pre
										class="rounded-lg bg-black/50 border border-[#FF9B5C]/20 p-4 overflow-x-auto font-mono terminal-text"><code
											class="text-[#FF9B5C]">{code}</code
										></pre>
								</CardContent>
							</TabsContent>
						{/each}
					</Tabs>
				</div>
			</Card>
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

	.terminal-text {
		animation: textFlicker 0.3s infinite;
	}

	@keyframes textFlicker {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.9;
		}
		51% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		91% {
			opacity: 0.9;
		}
		92% {
			opacity: 1;
		}
	}
</style>
