<script lang="ts">
	import * as AgentProgress from '$lib/components/ai/agent-progress';

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

	async function handleResume(currentAction: string) {
		return {
			status: 'Running',
			currentAction,
			totalSteps: 5
		};
	}

	async function handleProgress(step: number) {
		return {
			status: 'Running',
			currentAction: `Step ${step}`,
			progress: step + 1,
			totalSteps: 5
		};
	}
</script>

<AgentProgress.AgentProgressAug
	agentName="Agent 1"
	description="This is a description of the agent"
	imgLink="/brainthrust.png"
	onStart={handleStart}
	onStop={handleStop}
	onResume={handleResume}
	updateProgress={handleProgress}
	pollRateMs={500}
/>

