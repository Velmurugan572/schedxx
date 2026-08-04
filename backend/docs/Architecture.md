# Sched Architecture Documentation

This document describes the software architecture, design patterns, and folder organization for the **Sched** backend API.

---

## 1. Architectural Patterns (Clean Architecture)

Sched implements **Clean Architecture** principles to decouple business logic from external frameworks, database ORMs, caching services, and web servers.

```
┌──────────────────────────────────────────────────────────┐
│                      Infrastructure                      │
│     (Express App, Prisma ORM, Winston, BullMQ Workers)   │
│         ┌──────────────────────────────────────────┐     │
│         │            Interface Adapters            │     │
│         │   (Controllers, Repositories, Connectors)│     │
│         │       ┌──────────────────────────┐       │     │
│         │       │    Application Services  │       │     │
│         │       │       (Use Cases)        │       │     │
│         │       │       ┌──────────┐       │       │     │
│         │       │       │  Domain  │       │       │     │
│         │       │       │ (Entities│       │       │     │
│         │       │       │  Types)  │       │       │     │
│         │       │       └──────────┘       │       │     │
│         │       └──────────────────────────┘       │     │
│         └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

### Dependency Rules
*   **Domain Layer** (`src/types/`, `src/errors/`): Holds system-wide static constants, types, and core exception class models. It depends on no external packages.
*   **Application Services Layer** (`src/services/`): Orchestrates business workflows. It communicates with data models via Repository interfaces.
*   **Interface Adapters** (`src/controllers/`, `src/repositories/`, `src/connectors/`): Converts external input/output payloads (JSON, SQL records, social network API responses) to domain entities.
*   **Infrastructure Layer** (`src/app.js`, `src/logger/`, `src/jobs/`): Handles framework-specific boot code, routing configurations, logger transports, and cron worker systems.

---

## 2. Structural Layer Separation

*   **`src/config/`**: System configuration parser and env validator. Ensures fast failure on missing secrets.
*   **`src/routes/`**: Handles HTTP path mappings, separating them into `/v1` namespaces.
*   **`src/controllers/`**: Extracts HTTP parameters, queries repository layers, and returns standardized envelopes.
*   **`src/services/`**: Holds multi-entity orchestration rules (like token validations and default workspace configurations).
*   **`src/repositories/`**: Concrete Prisma ORM database interfaces. Hides SQL details from controllers and services.
*   **`src/middleware/`**: Cross-cutting filters (Auth guards, input validations, security policies, centralized error handlers).
*   **`src/jobs/`**: Segregated background task layers:
    *   `producers/`: Inserts jobs into BullMQ.
    *   `queues/`: Initializes BullMQ queues.
    *   `workers/`: Processes asynchronous background operations.

---

## 3. Generic Platform Connector Architecture

To scale Sched from our initial launch platforms (Meta, LinkedIn, X, YouTube) to future systems (like Discord, Slack, SendGrid, or AWS S3), we implement the **Strategy Design Pattern** coupled with a **Factory Registry**.

*   **`BaseConnector`** (`src/connectors/base/BaseConnector.js`): Abstract class specifying connection validations (`validate`) and arbitrary action executions (`execute(action, payload, credentials)`).
*   **`ConnectorFactory`** (`src/connectors/factory/ConnectorFactory.js`): Global registry object where connector sub-classes are registered during boot. Workers retrieve active adapters dynamically via:
    `ConnectorFactory.get(platformName)`
*   **Pluggable Folder Categories**:
    *   `social/`: Publishing updates to social walls.
    *   `messaging/`: Dispatching chat webhook alerts.
    *   `email/`: Outgoing transactional mail configurations.
    *   `storage/`: Cloud uploads (S3 attachments).
    *   `calendar/`: Managing bookings and timeslots.

---

## 4. AI Engine Orchestration

AI services are organized to support vendor decoupling:
*   `providers/`: Raw vendor clients (Gemini, OpenAI).
*   `prompts/`: Version-controlled AI instructions.
*   `services/`: High-level business models (e.g. caption optimization, automatic hashtag recommendation).
*   `translators/`: Translates post structures to target platforms.
*   `predictors/`: Analyzes analytics parameters to forecast optimal publishing windows.
