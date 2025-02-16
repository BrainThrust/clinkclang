<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { TerminalIcon, XIcon, MenuIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';

	let isMenuOpen = $state(false);
	let titleVisible = $state(false);
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	// Matrix rain configuration
	const fontSize = 14;
	const columns: number[] = [];
	const drops: number[] = [];

	// Function to initialize matrix rain
	function initMatrix() {
		ctx = canvas.getContext('2d')!;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const columnsCount = Math.floor(canvas.width / fontSize);

		// Initialize columns and drops
		for (let i = 0; i < columnsCount; i++) {
			columns[i] = Math.random() * canvas.height;
			drops[i] = 0;
		}
	}

	// Draw matrix rain
	function drawMatrix() {
		// Semi-transparent black to create trail effect
		ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Orange text color with gradient effect
		const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, '#FF9B5C');
		gradient.addColorStop(1, '#FF7F50');
		ctx.fillStyle = gradient;
		ctx.font = `${fontSize}px monospace`;

		// Draw each column
		for (let i = 0; i < columns.length; i++) {
			// Generate random character (0 or 1)
			const char = Math.random() < 0.5 ? '0' : '1';

			const x = i * fontSize;
			const y = columns[i] * fontSize;

			ctx.fillText(char, x, y);

			// Reset column after it reaches bottom
			if (y > canvas.height && Math.random() > 0.99) {
				columns[i] = 0;
			}

			columns[i]++;
		}

		requestAnimationFrame(drawMatrix);
	}

	// Handle window resize
	function handleResize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		initMatrix();
	}

	onMount(() => {
		initMatrix();
		drawMatrix();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	const links = [
		{ name: m.link_1(), href: '/blog' },
		{ name: m.link_2(), href: '/docs' }
	];

	setTimeout(() => {
		titleVisible = true;
	}, 500);
</script>

<nav class="fixed top-0 z-50 w-full border-b border-[#FF9B5C]/20 bg-black/80 backdrop-blur-sm">
	<div class="container mx-auto flex h-16 items-center justify-between px-4">
		<div class="flex items-center gap-2">
			<TerminalIcon class="size-8 text-[#FF9B5C] animate-pulse" />
			<span class="text-xl font-bold tracking-wider">ClinkClang</span>
		</div>

		<!-- Desktop Navigation -->
		<div class="hidden items-center gap-6 md:flex">
			{#each links as link}
				<a
					href={link.href}
					class="text-sm tracking-wider text-[#FF9B5C]/70 transition-colors hover:text-[#FF9B5C] hover:underline"
					>{link.name}</a
				>
			{/each}
			<Button
				variant="outline"
				href="/docs"
				class="border-[#FF9B5C] text-[#FF9B5C] hover:bg-[#FF9B5C]/10">{m.init_button()}</Button
			>
			<LanguageSwitcher />
		</div>

		<!-- Mobile Menu Button -->
		<button class="md:hidden" onclick={() => (isMenuOpen = !isMenuOpen)}>
			{#if isMenuOpen}
				<XIcon class="size-6" />
			{:else}
				<MenuIcon class="size-6" />
			{/if}
		</button>
	</div>

	<!-- Mobile Navigation -->
	{#if isMenuOpen}
		<div class="border-b border-[#FF9B5C]/20 bg-black md:hidden" transition:slide>
			<nav class="container flex flex-col space-y-4 px-4 py-4">
				{#each links as link}
					<a
						href={link.href}
						class="text-sm tracking-wider text-[#FF9B5C]/70 hover:text-[#FF9B5C] hover:underline"
						>{link.name}</a
					>
				{/each}
				<Button
					href="/docs"
					variant="outline"
					class="w-full border-[#FF9B5C] text-[#FF9B5C] hover:bg-[#FF9B5C]/10"
					>{m.init_button()}</Button
				>
				<LanguageSwitcher />
			</nav>
		</div>
	{/if}
</nav>
<!-- Matrix rain canvas background -->
<canvas id="matrixCanvas" class="fixed inset-0 opacity-20" bind:this={canvas}></canvas>

<section class="container relative mx-auto px-4 pt-32">
	<!-- Geometric pattern overlay -->
	<div
		class="absolute inset-0 -z-10 bg-[radial-gradient(#FF9B5C_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)]"
	></div>

	<div class="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-8">
		{#if titleVisible}
			<div class="text-center crt-content" transition:slide>
				<div
					class="mb-4 inline-flex rounded-lg border border-[#FF9B5C]/20 bg-black/50 px-4 py-2 text-sm"
				>
					<span class="animate-pulse">■</span>
					<span class="ml-2">{m.system_status()}</span>
				</div>
				<h1 class="retro-glow mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
					{m.hero_title()}
				</h1>
				<p class="mx-auto mb-8 max-w-2xl text-[#FF9B5C]/70">
					{m.hero_description()}
					<br />
					{m.hero_description_2()}
					<br />
					{m.hero_description_3()}
				</p>
				<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
					<Button
						variant="outline"
						size="lg"
						href="/docs"
						class="border-[#FF9B5C] text-[#FF9B5C] hover:bg-[#FF9B5C]/10"
						>{m.start_sequence()}</Button
					>
					<Button
						variant="outline"
						size="lg"
						href="/docs"
						class="border-[#FF9B5C]/50 text-[#FF9B5C]/50 hover:bg-[#FF9B5C]/10"
						>{m.view_docs()}</Button
					>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.retro-glow {
		text-shadow:
			0 0 5px #ff9b5c,
			0 0 10px #ff7f50,
			0 0 15px #ff7f50;
		animation: flicker 4s infinite;
	}

	.crt-content {
		animation: textShadow 4s infinite;
	}

	@keyframes flicker {
		0% {
			opacity: 1;
		}
		49% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
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

	@keyframes textShadow {
		0% {
			text-shadow:
				0.4389924193300864px 0 1px rgba(255, 155, 92, 0.1),
				-0.4389924193300864px 0 1px rgba(255, 127, 80, 0.1);
		}
		5% {
			text-shadow:
				2.7928974010788217px 0 1px rgba(255, 155, 92, 0.1),
				-2.7928974010788217px 0 1px rgba(255, 127, 80, 0.1);
		}
		/* Add more keyframes for text shadow effect */
		100% {
			text-shadow:
				0.4389924193300864px 0 1px rgba(255, 155, 92, 0.1),
				-0.4389924193300864px 0 1px rgba(255, 127, 80, 0.1);
		}
	}
</style>
