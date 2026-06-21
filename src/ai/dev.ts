
import { config } from 'dotenv';
config();

import '@/ai/flows/identify-implicit-capabilities-flow.ts';
import '@/ai/flows/identify-missing-tools-for-goals.ts';
import '@/ai/flows/generate-novel-systems.ts';
import '@/ai/flows/generate-mcp-boilerplate.ts';
import '@/ai/flows/evolution-agent-flow.ts';
import '@/ai/flows/generate-mcp-icon-flow.ts';
