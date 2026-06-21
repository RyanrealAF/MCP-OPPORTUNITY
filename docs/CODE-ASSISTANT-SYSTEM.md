# BWB-CODE-ASSISTANT | System Specification

## Overview
The **BWB-CODE-ASSISTANT** is the primary orchestration layer for the BWB ecosystem. It acts as a high-density intelligence interface designed to analyze, simulate, and generate components for the **BWB-MCP-SERVER**.

## Core Components
1. **Capability Agent**: Analyzes existing MCP metadata to discover latent functionality.
2. **Collision Agent**: Runs combinatorial simulations to predict system emergence.
3. **Intent Agent**: Maps strategic goals to technological requirements.
4. **Boilerplate Agent**: Generates production-ready TypeScript code for the target server.

## Data Flow
- **Input**: User-defined MCP nodes and strategic goals stored in Firestore.
- **Process**: Genkit-powered AI flows executed as Server Actions.
- **Output**: Visualization in the Knowledge Graph and downloadable boilerplate code.

## Hierarchy Position
- **Level 1**: `BWB-ROOT` (Project Repository)
- **Level 2**: `BWB-CODE-ASSISTANT` (This Application)
- **Level 3**: `BWB-MCP-SERVER` (Target Execution Environment)