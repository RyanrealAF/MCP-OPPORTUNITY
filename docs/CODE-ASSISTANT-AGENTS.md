# BWB-CODE-ASSISTANT | Agent Logic & State

## Agent Definitions

### Capability Agent
- **Source**: `src/ai/flows/identify-implicit-capabilities-flow.ts`
- **Logic**: Uses LLM semantic analysis to find "implicit" capabilities.
- **State**: Results are ephemeral in UI but can be persisted to the MCP node.

### Collision Agent
- **Source**: `src/ai/flows/generate-novel-systems.ts`
- **Logic**: Simulates interactions between $N$ providers.
- **Persistence**: Results are stored in `/users/{userId}/simulations`.

### Intent Agent
- **Source**: `src/ai/flows/identify-missing-tools-for-goals.ts`
- **Logic**: Gap analysis between `entities.Goal` and `entities.MCP.explicitCapabilities`.

### Boilerplate Agent
- **Source**: `src/ai/flows/generate-mcp-boilerplate.ts`
- **Output**: TypeScript classes extending `BaseMcpProvider`.
