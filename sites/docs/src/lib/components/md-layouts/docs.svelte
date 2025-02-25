<script lang="ts">
	import type { Docs } from '$lib/types';
	import './docs.css';
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Button } from '$lib/components/ui/button';

	// Define the props for this component
	let { children, docs } = $props<{
		docs: Docs;
	}>();

	$effect(() => {
		const codeBlocks = document.querySelectorAll('pre');

		codeBlocks.forEach(pre => {
			// Check if button already exists
			if (pre.querySelector('.copy-button')) return;

			const code = pre.querySelector('code')?.innerText ?? '';

			const container = document.createElement('div');
			container.classList.add("relative", "w-full"); // Keep Tailwind classes here
			pre.parentNode?.insertBefore(container, pre);
			container.appendChild(pre);

			const copyButton = document.createElement('button');
			copyButton.classList.add('copy-button'); // Apply the class
			copyButton.addEventListener('click', () => {
				navigator.clipboard.writeText(code).then(() => {
					// Use a data attribute or similar for dynamic styling if needed
                    copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>`; // Replace with checkmark
					setTimeout(() => {
						copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
					}, 2000);
				});
			});
            copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`; // Added initial copy icon
			container.appendChild(copyButton);
		});
	});
</script>

<main class="markdown-body">
	<article class="prose prose-slate dark:prose-invert max-w-none pt-2">
		<div class="font-semibold text-muted-foreground">clinkclang-docs</div>
		<div class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xld">{docs.title}</div>
		<div class="text-sm text-muted-foreground">
			Last updated: {new Date(docs.date).toLocaleDateString()}
		</div>
		<div class="pt-10">
				{@render children()}
		</div>
	</article>
</main>
