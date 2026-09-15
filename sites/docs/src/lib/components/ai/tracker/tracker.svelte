<script lang="ts">
	import TrackerStatusCard from "./tracker-status-card.svelte";
	// import types
	import type { Agent } from "./index.ts";

	// Mock agents data
	const agents: Agent[] = $state([
		{
			id: 1,
			name: "Sarah Wilson",
			role: 'Customer Support',
			status: 'online',
			avatar: '/brainthrust.png',
			lastActive: new Date(),
		},
		{
			id: 2,
			name: "John Smith",
			role: "Sales Representative",
			status: "busy",
			avatar: '/brainthrust.png',
			lastActive: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
		},
		{
			id: 3,
			name: "Emily Davis",
			role: "Technical Support",
			status: "offline",
			avatar: '/brainthrust.png',
			lastActive: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
		},
	]);
</script>

<div class="container mx-auto p-4">
	<TrackerStatusCard {agents} />
</div>
