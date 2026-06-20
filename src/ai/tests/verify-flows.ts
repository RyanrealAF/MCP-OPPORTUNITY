/**
 * @fileOverview Verification script for Genkit AI flows.
 * This script runs the flows with test data to ensure the backend agents are operational.
 */

import { config } from 'dotenv';
config();

import { identifyImplicitCapabilities } from '../flows/identify-implicit-capabilities-flow';
import { generateNovelSystems } from '../flows/generate-novel-systems';
import { identifyMissingToolsForGoals } from '../flows/identify-missing-tools-for-goals';
import { generateMcpBoilerplate } from '../flows/generate-mcp-boilerplate';

async function runTests() {
  console.log('🚀 INITIALIZING_BACKEND_VERIFICATION_SEQUENCE...');

  try {
    // 1. Test Capability Agent
    console.log('\n--- [TEST_01: CAPABILITY_AGENT] ---');
    const capResult = await identifyImplicitCapabilities({
      mcpDescriptions: "Stripe Payment Gateway: Handles financial transactions and subscriptions."
    });
    console.log('SUCCESS: Identified', capResult.implicitCapabilities.length, 'implicit capabilities.');

    // 2. Test Collision Agent
    console.log('\n--- [TEST_02: COLLISION_AGENT] ---');
    const collResult = await generateNovelSystems({
      mcpDescriptions: ["Auth0", "OpenAI"],
      capabilityDescriptions: ["User Authentication", "Natural Language Processing"],
      contextOrConstraints: "Cybersecurity"
    });
    console.log('SUCCESS: Generated', collResult.novelSystems.length, 'novel system ideas.');

    // 3. Test Intent Agent
    console.log('\n--- [TEST_03: INTENT_AGENT] ---');
    const intentResult = await identifyMissingToolsForGoals({
      goals: ["Build an autonomous trading bot"],
      existingCapabilities: ["Rest API access", "Database storage"]
    });
    console.log('SUCCESS: Identified missing tools. Reasoning length:', intentResult.reasoning.length);

    // 4. Test Boilerplate Agent
    console.log('\n--- [TEST_04: BOILERPLATE_AGENT] ---');
    const codeResult = await generateMcpBoilerplate({
      name: "TestProvider",
      description: "A provider for testing purposes.",
      capabilities: ["ping", "pong"]
    });
    console.log('SUCCESS: Generated code. Code length:', codeResult.code.length);

    console.log('\n✅ ALL_BACKEND_AGENTS_OPERATIONAL');
  } catch (error: any) {
    console.error('\n❌ VERIFICATION_FAILED:', error.message);
    process.exit(1);
  }
}

runTests();