<!-- src/lib/components/AgentProgress.svelte -->
<script>
	import { Button } from '$lib/components/ui/button';
	import { CirclePlay, CircleStop, StepForward } from 'lucide-svelte';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Progress } from '$lib/components/ui/progress';
	import { cn } from '$lib/utils';

	export let className = '';
	export let agentName = '';
	export let description = '';
	export let imgLink = '';

	const BUTTON_VARIANT = 'outline';
</script>

<Card.Root class={cn('w-[400px]', className)}>
	<Card.Header>
		<div class="flex items-center space-x-4">
			<div>
				<Avatar class="size-24">
					<AvatarImage src={imgLink || null} alt={agentName} />
					<AvatarFallback>{agentName}</AvatarFallback>
				</Avatar>
			</div>
			<div>
				<div id="titleSection">
					<Card.Title>
						<p class="text-base">{agentName || 'Unnamed Agent'}</p>
					</Card.Title>
					<p class="text-xs">{description || 'Describe your agent...'}</p>
				</div>
				<Separator class="my-1" />
				<div class="text-xs text-muted-foreground">
					<span>Status goes here...</span>
					<br />
					<span>Current action goes here...</span>
				</div>
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-col space-y-3">
			<div>
				<Progress class="h-6" />
			</div>
			<div class="space-x-2 flex justify-start">
				<Button class="cursor-pointer h-8" variant={BUTTON_VARIANT}>
					<CirclePlay /> Start
				</Button>
				<Button class="cursor-pointer h-8" variant={BUTTON_VARIANT}>
					<CircleStop /> Stop
				</Button>
				<Button class="cursor-pointer h-8" variant={BUTTON_VARIANT}>
					<StepForward /> Resume
				</Button>
			</div>
		</div>
	</Card.Content>
</Card.Root>
