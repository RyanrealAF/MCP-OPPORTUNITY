# BWB-MCP-SERVER | Suggested Modifications & Roadmap

## Overview
The **BWB-MCP-SERVER** is the target backend. Based on current AI simulations, the following modifications are suggested to increase ecosystem efficiency.

## 1. Structural Modifications
- **BaseProvider Enhancement**: Add `healthCheck()` and `latencyMetric()` methods to the `BaseMcpProvider` abstract class.
- **Inter-Provider Bus**: Implement a message bus for providers to communicate directly without assistant intervention.

## 2. Capability Expansion
- **Auth Provider**: Implement OIDC support in the core `AuthMcp`.
- **Vector Storage**: Add a dedicated `VectorStoreMcp` for RAG-based search across industrial datasets.

## 3. Deployment Optimization
- **Edge Deployment**: Transition providers to run on edge functions to reduce latency in global simulations.
- **Telemetry**: Add OpenTelemetry hooks to the initialization boilerplate.

## 4. Current Gaps (Identified by Intent Agent)
- [ ] Real-time data stream handler (Missing for 'autonomous trading' goal).
- [ ] Multi-tenant isolation layer for experimental providers.