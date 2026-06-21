# BWB-MCP-SERVER | Suggested Modifications & Roadmap

## Overview
The **BWB-MCP-SERVER** is the target backend. Based on current AI simulations, the following modifications are suggested and partially integrated into the **BWB-CODE-ASSISTANT** generation engine.

## 1. Structural Modifications
- **[DONE] BaseProvider Enhancement**: Added mandatory `healthCheck()` and `latencyMetric()` methods to the `BaseMcpProvider` logic in the Boilerplate Agent.
- **[DONE] Inter-Provider Bus**: Integrated message bus hooks (`publish`/`subscribe`) into the standard provider generation template.

## 2. Capability Expansion
- **[IN PROGRESS] Auth Provider**: OIDC support hooks are now scaffolded by default in auth-related MCPs.
- **[PLANNED] Vector Storage**: Implementing a dedicated `VectorStoreMcp` template for RAG-based search.

## 3. Deployment Optimization
- **[PLANNED] Edge Deployment**: Transitioning templates to favor edge-compatible logic.
- **[DONE] Telemetry**: Added mandatory OpenTelemetry hooks to all generated provider initialization blocks.

## 4. Current Gaps (Identified by Intent Agent)
- [ ] Real-time data stream handler (Missing for 'autonomous trading' goal).
- [ ] Multi-tenant isolation layer for experimental providers.

---
*Note: "DONE" indicates the Assistant is now capable of generating code that adheres to these requirements.*