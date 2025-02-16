<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
	import { Badge } from "$lib/components/ui/badge";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import { UsersIcon } from "lucide-svelte";
	import type { Agent } from "./index.ts";

	// Props type
	type Props = {
		agents: Agent[];
	};

	// Accept props using $props() rune
	const { agents }: Props = $props();

	// Format time ago function
	const getTimeAgo = (date: Date): string => {
		const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

		if (seconds < 60) return "just now";
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return "more than a day ago";
	};

	// Computed values using $derived rune
	const onlineAgentsCount = $derived(agents.filter((agent) => agent.status === "online").length);

	// Get status indicator class based on agent status
	const getStatusClass = (status: Agent["status"]): string => {
		switch (status) {
			case "online":
				return "bg-green-500";
			case "busy":
				return "bg-red-500";
			case "offline":
				return "bg-gray-500";
			default:
				return "bg-gray-500";
		}
	};
</script>

<Card class="w-full max-w-md">
	<CardHeader>
		<div class="flex items-center justify-between">
			<div class="space-y-1">
				<CardTitle>Agent Status</CardTitle>
				<CardDescription>
					{onlineAgentsCount} agents online
				</CardDescription>
			</div>
			<UsersIcon class="h-4 w-4 text-muted-foreground" />
		</div>
	</CardHeader>
	<CardContent>
		<ScrollArea class="h-[300px] pr-4">
			<div class="space-y-4">
				{#each agents as agent (agent.id)}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="relative">
								<Avatar>
									<AvatarImage src={agent.avatar} alt={agent.name} />
									<AvatarFallback>
										{agent.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white {getStatusClass(agent.status)}">
									{#if agent.status !== "offline"}
										<span class="absolute inset-0 rounded-full animate-pulse-ring {getStatusClass(agent.status)}" />
									{/if}
								</span>
							</div>
							<div>
								<p class="text-sm font-medium leading-none">{agent.name}</p>
								<p class="text-sm text-muted-foreground">{agent.role}</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Badge variant={agent.status === "online" ? "success" : agent.status === "busy" ? "destructive" : "secondary"} class="capitalize">
								{agent.status}
							</Badge>
							<span class="text-xs text-muted-foreground">
								{getTimeAgo(agent.lastActive)}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</ScrollArea>
	</CardContent>
</Card>

<style>
	@keyframes pulse-ring {
		0% {
			transform: scale(0.8);
			opacity: 1;
		}
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	.animate-pulse-ring {
		animation: pulse-ring 1.25s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
