export type AgentStatus = 'online' | 'offline' | 'busy';

export interface Agent {
	id: number;
	name: string;
	role: string;
	status: AgentStatus;
	avatar: string;
	lastActive: Date;
}

import Tracker from './tracker.svelte';
import TrackerStatusCard from './tracker-status-card.svelte';

export { Tracker, TrackerStatusCard };
