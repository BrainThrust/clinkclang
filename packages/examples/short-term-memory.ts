import { ReactAgent } from '../core/agents/react';
import { ShortTermMemory } from '../core/memory/short-term';

const OPENAI_API_KEY = 'openai_api_key';

async function runShortTermMemory() {
	const agent = new ReactAgent({
		provider: {
			type: 'openai',
			apiKey: OPENAI_API_KEY,
			modelName: 'gpt-3.5-turbo',
			temperature: 0.7
		},
		systemPrompt: `You're a helpful travel assistant. You remember previous parts of the conversation.`,
		structure: {
			debug: false,
			maxRetries: 3,
			strict: false,
		},
		memory: {
			type: 'short-term'
		},
    tokenLimit: 500, // set the token limit less, to see summaries
		tools: []
	});

	async function generateResponse(question: string): Promise<string> {
		try {
			console.log(`User: ${question}`);
			const response = await agent.generate(question);
			console.log(`Assistant: ${response}\n`);
			return response;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`Error generating response: ${errorMessage}`);
			return "I apologize, but I'm having trouble responding to that question right now.";
		}
	}

	// simple questions to test the short-term and summarization memory
	await generateResponse('Tell me about Paris.');
	await generateResponse("What's the best time to visit there?");
	await generateResponse("What's a good hotel in the city center?");
	await generateResponse('Are there any good restaurants near the Eiffel Tower?');
	await generateResponse('Which places are good for a date night?');
	await generateResponse('This city is the capital of which country?');
	await generateResponse("What's the best area for shopping in Paris?");

	// display memory statistics
	const memory = agent.memory;
	if (memory instanceof ShortTermMemory) {
		const messages = await memory.getMessages();
		const tokenUsage = memory.getTokenUsage();

		console.log('\n=== Memory Stats ===');
		console.log(`Total messages: ${messages.length}`);
		console.log(`Token usage: ${tokenUsage}`);

		// if there were any summaries made
		const summaries = await memory.getSummaries();
		if (summaries.length > 0) {
			console.log('\n=== Memory Summaries ===');
			summaries.forEach((summary, index) => {
				console.log(`Summary ${index + 1}: ${summary.content.substring(0, 200)}...`);
				console.log(
					`Original tokens: ${summary.originalTokens}, Summarized tokens: ${summary.summarizedTokens}`
				);
			});
		} else {
			console.log("\nNo summaries created yet - memory hasn't exceeded token limit");
		}
	}
}

runShortTermMemory()
	.then(() => console.log('\nFinished!'))
	.catch((error: unknown) => {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error(`\nError: ${errorMessage}`);
	});
