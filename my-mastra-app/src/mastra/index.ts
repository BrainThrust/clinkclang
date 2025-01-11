
import { Mastra, createLogger } from '@mastra/core';
import { weatherWorkflow } from './workflows';
import { weatherAgent } from './agents';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent },
  logger: createLogger({
    type: 'CONSOLE',
    level: 'INFO',
  }),
});
