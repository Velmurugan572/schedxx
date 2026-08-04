# Module 8 – Connector Platform SDK

## Overview

Module 8 introduces the architectural foundation for Sched’s connector platform. The SDK is intentionally scaffolded around placeholder implementations so future integrations can be added without changing the surrounding service layer.

## Architecture Responsibilities

- BaseConnector defines the abstract lifecycle contract for every connector. It requires implementations for connection, publishing, updating, deleting, analytics, token refresh, health checks, validation, and execution hooks.
- OAuthConnector builds on BaseConnector with a mock-ready OAuth-style implementation. It provides default placeholder behavior for connect/disconnect/publish/update/delete/analytics/refreshToken/healthCheck without performing real API calls.
- ConnectorRegistry is a centralized registry that stores connector instances by platform name and exposes lookup, registration, and inspection helpers.
- ConnectorFactory is the stable entry point that resolves connectors through the registry and keeps platform resolution logic isolated from the application services.
- InstagramConnector, FacebookConnector, LinkedInConnector, and XConnector are platform-specific placeholder classes that inherit the shared OAuth contract and are registered with the factory.
- OAuthService, TokenRefreshService, and HealthCheckService remain orchestration layers that delegate work to the connector implementations.

## Implemented Connectors

- Instagram
- Facebook
- LinkedIn
- X (Twitter)

These implementations use placeholder/mock logic only and do not perform real OAuth flows or publishing actions yet.

## Folder Structure

```text
src/connectors/
  base/
    BaseConnector.js
    OAuthConnector.js
  factory/
    ConnectorFactory.js
  registry/
    ConnectorRegistry.js
  social/
    FacebookConnector.js
    InstagramConnector.js
    LinkedInConnector.js
    XConnector.js
src/services/
  OAuthService.js
  TokenRefreshService.js
  HealthCheckService.js
```

## Validation

Run the tests with:

```bash
npm test -- --runInBand --runTestsByPath src/tests/connector-platform.test.js
```
