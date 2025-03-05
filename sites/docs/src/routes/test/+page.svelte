<script lang="ts">
	import AgentProgressAug from '$lib/components/ai/agent-progress/agent-progress-aug.svelte';

	async function handleStart() {
		return {
			status: 'Running',
			currentAction: 'Initializing',
			totalSteps: 5
		};
	}

	async function handleStop() {
		console.log('Stopped');
	}

	async function handleResume(currentAction) {
		return {
			status: 'Running',
			currentAction,
			totalSteps: 5
		};
	}

	async function handleProgress(step) {
		return {
			status: 'Running',
			currentAction: `Step ${step}`,
			progress: step + 1,
			totalSteps: 5
		};
	}
</script>

<AgentProgressAug
	agentName="Agent 1"
	description="This is a description of the agent"
	imgLink="brainthrust.png"
	onStart={handleStart}
	onStop={handleStop}
	onResume={handleResume}
	updateProgress={handleProgress}
	pollRateMs={2000}
/>
