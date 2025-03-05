<!-- src/lib/components/AgentProgressAug.svelte -->
<script>
	import { onDestroy } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import { CirclePlay, CircleStop, StepForward } from 'lucide-svelte';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Progress } from '$lib/components/ui/progress';
	import { cn } from '$lib/utils';

	// Props
	export let className = '';
	export let agentName = '';
	export let description = '';
	export let imgLink = '';
	export let onStart = async () => ({
		status: 'Running',
		currentAction: 'Starting',
		totalSteps: 0
	});
	export let onStop = async () => {};
	export let onResume = async (currentAction) => ({
		status: 'Running',
		currentAction,
		totalSteps: 0
	});
	export let updateProgress = async (currentStep) => ({
		status: 'Running',
		currentAction: '',
		progress: 0,
		totalSteps: 0
	});
	export let pollRateMs = 2500;

	// Agent state store
	const agentStore = writable({
		progress: 0,
		status: 'Offline',
		currentAction: 'None',
		running: false,
		paused: false,
		pending: false,
		totalSteps: 0,
		done: false
	});

	// Timer store
	const timerStore = writable(null);

	// Derived values for easier access
	const agentState = derived(agentStore, ($store) => ({
		status: $store.status,
		currentAction: $store.currentAction,
		running: $store.running,
		paused: $store.paused,
		pending: $store.pending,
		totalSteps: $store.totalSteps,
		done: $store.done,
		progress: $store.progress
	}));

	const BUTTON_VARIANT = 'outline';
	let timer;

	// State update functions
	function toggleStart() {
		$agentStore.pending = true;
		$agentStore.status = 'Checking...';
		$agentStore.currentAction = 'Starting workflow...';
	}

	function toggleStop() {
		$agentStore.pending = true;
		$agentStore.currentAction = 'Pausing workflow...';
	}

	function toggleResume() {
		$agentStore.pending = true;
		$agentStore.currentAction = 'Resuming workflow...';
	}

	function startSuccess(totalSteps, status, currentAction) {
		$agentStore = {
			...$agentStore,
			currentAction,
			status,
			running: true,
			paused: false,
			pending: false,
			totalSteps,
			progress: 1,
			done: false
		};
	}

	function stopSuccess(prevState) {
		$agentStore = {
			...$agentStore,
			status: 'Paused',
			currentAction: prevState + ' (paused)',
			running: false,
			paused: true,
			pending: false
		};
	}

	function resumeSuccess(totalSteps, status, currentAction) {
		$agentStore = {
			...$agentStore,
			currentAction,
			status,
			running: true,
			paused: false,
			pending: false,
			totalSteps
		};
	}

	function updateSuccess(state) {
		$agentStore = {
			...$agentStore,
			status: state.status,
			currentAction: state.currentAction,
			totalSteps: state.totalSteps,
			progress: state.progress
		};
	}

	function triggerDone() {
		$agentStore = {
			...$agentStore,
			status: 'Done',
			running: false,
			paused: false,
			pending: false,
			currentAction: 'None',
			done: true
		};
	}

	// Effect handling
	$: if (
		$agentState.progress < $agentState.totalSteps &&
		$agentState.running &&
		!$agentState.pending
	) {
		timer = setTimeout(async () => {
			const res = await updateProgress($agentState.progress);
			if (res) {
				updateSuccess(res);
				console.log('Triggered update:', res);
			}
		}, pollRateMs);
		$timerStore = timer;
	} else if ($agentState.progress === $agentState.totalSteps && !$agentState.done) {
		triggerDone();
	}

	$: if ($agentState.pending || !$agentState.running) {
		clearTimeout($timerStore);
		console.log('Cleared timeout', $timerStore);
	}

	onDestroy(() => {
		clearTimeout($timerStore);
	});
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
					<p>{$agentState.status}</p>
					<p>{$agentState.currentAction}</p>
				</div>
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-col space-y-3">
			<div>
				<Progress
					class="h-6"
					max={$agentState.totalSteps > 0 ? $agentState.totalSteps : 100}
					value={$agentState.running || $agentState.done ? $agentState.progress : 0}
				/>
			</div>
			<div class="space-x-2 flex justify-start">
				<Button
					class="cursor-pointer h-8"
					variant={BUTTON_VARIANT}
					disabled={$agentState.running || $agentState.paused || $agentState.pending}
					onclick={async () => {
						toggleStart();
						const res = await onStart();
						if (res) {
							setTimeout(() => {
								startSuccess(res.totalSteps, res.status, res.currentAction);
							}, 1500);
						}
					}}
				>
					<CirclePlay /> Start
				</Button>
				<Button
					class="cursor-pointer h-8"
					variant={BUTTON_VARIANT}
					disabled={!$agentState.running || $agentState.paused || $agentState.pending}
					onclick={async () => {
						const ca = $agentState.currentAction;
						toggleStop();
						await onStop();
						setTimeout(() => {
							stopSuccess(ca);
						}, 1500);
					}}
				>
					<CircleStop /> Stop
				</Button>
				<Button
					class="cursor-pointer h-8"
					variant={BUTTON_VARIANT}
					disabled={!$agentState.paused || $agentState.pending}
					onclick={async () => {
						const ca = $agentState.currentAction.split(' ').slice(0, -1).join(' ');
						toggleResume();
						const res = await onResume(ca);
						setTimeout(() => {
							resumeSuccess(res.totalSteps, res.status, res.currentAction);
						}, 2500);
					}}
				>
					<StepForward /> Resume
				</Button>
			</div>
		</div>
	</Card.Content>
</Card.Root>
