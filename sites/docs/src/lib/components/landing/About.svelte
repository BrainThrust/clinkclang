<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
</script>

<section id="about" class="py-24 relative z-10">
	<div class="container mx-auto px-4">
		<div class="grid items-center gap-12 lg:grid-cols-2">
			<div class="order-2 lg:order-1">
				<h2 class="mb-6 text-3xl font-bold">{m.about_title()}</h2>
				<p class="mb-8 text-muted-foreground">
					{m.about_description()}
				</p>
				<Button href="/docs" size="lg">{m.about_button()}</Button>
			</div>
			<div class="order-1 lg:order-2">
				<img
					src="https://images.unsplash.com/photo-1474674556023-efef886fa147?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
					alt="AI Robot Interface"
					class="rounded-lg shadow-lg"
					width="600"
					height="400"
				/>
			</div>
		</div>
	</div>
</section>
