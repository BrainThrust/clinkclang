import { ReactAgent } from '../core/agents/react';
import { z } from 'zod';
import type { Tool } from '../core/tools/tool';

const OPENAI_API_KEY = 'openai_api_key';

const CalculatorSchema = z.object({
	operands: z.tuple([z.number(), z.number()]),
	operation: z.enum(['add', 'subtract', 'multiply', 'divide'])
});

class CalculatorTool implements Tool {
	name = 'calculator';
	description = 'Performs basic arithmetic calculations';
	parameters = CalculatorSchema;

	async execute(params: z.infer<typeof CalculatorSchema>) {
		const { operands, operation } = params;
		const [a, b] = operands;

		switch (operation) {
			case 'add':
				return `${a} + ${b} = ${a + b}`;
			case 'subtract':
				return `${a} - ${b} = ${a - b}`;
			case 'multiply':
				return `${a} × ${b} = ${a * b}`;
			case 'divide':
				if (b === 0) return 'Error: Division by zero';
				return `${a} ÷ ${b} = ${a / b}`;
			default:
				return 'Invalid operation';
		}
	}
}

const agent = new ReactAgent({
	provider: {
		type: 'openai',
		apiKey: OPENAI_API_KEY,
		modelName: 'gpt-4o',
		temperature: 0
	},
	tools: [new CalculatorTool()],
	structure: {
		debug: true,
		maxRetries: 3,
	}
});

async function testCalculation() {
	try {
		const response = await agent.generate(
			'What is 2228 multiplied by 278? First calculate then answer.'
		);
		console.log('\nCalculation Result:');
		console.log(response);
	} catch (error) {
		console.error('Calculation failed:', error instanceof Error ? error.message : error);
	}
}

testCalculation();
