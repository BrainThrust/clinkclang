<script lang="ts">
	import { TerminalIcon } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<footer id="contact" class="relative z-[60] border-t border-[#FF9B5C]/20">
	<div class="container mx-auto px-4 py-12">
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
			<div class="flex flex-col gap-4">
				<div class="flex items-center gap-2">
					<TerminalIcon class="size-8 text-[#FF9B5C]" />
					<span class="text-xl font-bold tracking-wider">ClinkClang</span>
				</div>
				<p class="text-sm text-[#FF9B5C]/70">{m.footer_subtitle()}</p>
			</div>

			<div>
				<h3 class="mb-4 font-semibold tracking-wider">{m.footer_system()}</h3>
				<ul class="space-y-2 text-sm text-[#FF9B5C]/70">
					<li>
						<a href="#features" class="hover:text-[#FF9B5C] hover:underline"
							>{m.footer_system_1()}</a
						>
					</li>
					<li>
						<a href="/docs" class="hover:text-[#FF9B5C] hover:underline">{m.footer_system_2()}</a>
					</li>
				</ul>
			</div>

			<div>
				<h3 class="mb-4 font-semibold tracking-wider">{m.footer_network()}</h3>
				<ul class="space-y-2 text-sm text-[#FF9B5C]/70">
					<li>
						<a href="/blog" class="hover:text-[#FF9B5C] hover:underline">{m.footer_network_1()}</a>
					</li>
				</ul>
			</div>

			<div>
				<h3 class="mb-4 font-semibold tracking-wider">{m.footer_contact()}</h3>
				<ul class="space-y-2 text-sm text-[#FF9B5C]/70">
					<li>
						<a href="mailto:brian@dwarfsky.com" class="hover:text-[#FF9B5C] hover:underline"
							>{m.footer_contact_1()}</a
						>
					</li>
					<li>
						<a href="https://dwarfsky.com" class="hover:text-[#FF9B5C] hover:underline"
							>{m.footer_contact_2()}</a
						>
					</li>
				</ul>
			</div>
		</div>

		<div class="mt-12 border-t border-[#FF9B5C]/20 pt-8 text-center text-sm text-[#FF9B5C]/70">
			<span class="animate-pulse">■</span>
			{m.footer_text_1()} - {new Date().getFullYear()}
			{m.footer_text_2()}
		</div>
	</div>
</footer>
