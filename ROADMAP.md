# Roadmap

## Module 7 - Post Management

- [x] Implement post creation, listing, retrieval, update, and deletion.
- [x] Enforce workspace membership checks for all post access.
- [x] Enforce author-only update and delete permissions.
- [x] Add unit and integration tests for the post lifecycle.

## Module 8 - Connector Platform & Scheduling Engine

- [x] BaseConnector lifecycle contract, registry, and factory with platform placeholders (Facebook, Instagram, LinkedIn, X).
- [x] Queued post publication scheduling with BullMQ & Redis.
- [x] Unit tests for Connector SDK and Scheduling Engine isolated without live Redis connection.

## Module 9 - AI Engine Integration

- [x] Modular AI provider architecture (BaseAIProvider, GeminiProvider, and AIProvider registry).
- [x] Structured prompt templates guidelines for platform formatting (LinkedIn, Instagram, X, Facebook) and tones (Professional, Casual, Humorous, Persuasive).
- [x] Content optimization/generation endpoint with automatic log history recording.
- [x] Workspace membership access control for AI features.
- [x] High-performance mocked unit/integration tests running completely in isolation without requiring live API keys.

## Module 10 - Publishing Engine

- [x] Design modular Publishing Engine flow (PublisherService, PublisherWorker, PublishRepository).
- [x] Retry management logic (RetryService) integrating BullMQ's native attempts loop.
- [x] Final error auditing and status logging (FailureHandler).
- [x] Platform constraint check before final connector call.
- [x] Comprehensive unit tests verifying successful and failed dispatches completely in isolation.

## Module 11 - Analytics Engine

- [x] Design persistent timeseries data model wrapping standard relational Analytics entity.
- [x] Implement robust AnalyticsRepository mapping workspace queries and historical metric queries.
- [x] Build AnalyticsService coordinating credential resolution, calling connector API metrics, and recording points.
- [x] Mount secured endpoints (POST /sync, GET /posts/:postId, GET /workspaces/:workspaceId, GET /workspaces/:workspaceId/history).
- [x] Authorize all query endpoints using workspace membership checks.
- [x] Write comprehensive unit tests verifying success, parameter validation, and authorization errors in isolation.

## Module 12 - Notification System

- [x] Design persistent schema mapping and NotificationRepository.
- [x] Build NotificationService orchestrating read marking, soft deletion, and dispatch.
- [x] Mount secured endpoints (GET /notifications, PATCH /notifications/read-all, PATCH /notifications/:notificationId/read, DELETE /notifications/:notificationId).
- [x] Authorize notifications query and mutation endpoints using user context ownership check.
- [x] Integrate FailureHandler with NotificationService to generate automated user notifications on publication failures.
- [x] Write isolated unit tests verifying endpoint lifecycles and FailureHandler integration without external database dependencies.

## Module 13 - Media Engine

- [x] Design persistent schema mapping and MediaRepository.
- [x] Build MediaService validating file constraints (MIME/size) and user tenancy access.
- [x] Integrate multer file upload middleware using local disk storage settings.
- [x] Mount secured endpoints (POST /upload, GET /workspaces/:workspaceId, DELETE /:id, POST /attach, POST /detach).
- [x] Update PostRepository and PostService to auto-include post-media junction lists.
- [x] Write isolated unit tests verifying upload constraints, workspace safety limits, and attach/detach workflows in complete isolation.

## Module 14 - Production Readiness

- [x] Harden environment configuration validator (`env.js`) with key strength and length requirements.
- [x] Restrict CORS origins in production and configure Helmet settings.
- [x] Mount IP rate-limiting middleware (`express-rate-limit`) for DDoS prevention.
- [x] Refactor health check endpoint to verify Postgres and Redis responsiveness and return diagnostic 503 failures if either goes offline.
- [x] Attach signal listeners to handle SIGINT/SIGTERM graceful shutdowns of HTTP servers, background task queues, and DB connections.
- [x] Design persistent schema mapping and repositories for operational audit logging (`AuditLog` schema model).
- [x] Add audit logging hooks for auth logins/registrations, workspaces creation/invitations, post creations/updates/deletes, and media uploads/deletes.
- [x] Optimize Docker builds with multi-stage layers separating dev dependencies from runner images.
- [x] Establish a comprehensive GitHub Actions CI configuration to automate database migration runs, lint checks, and ESM sequential unit tests.
- [x] Write isolated Jest unit tests verifying rate limits, CORS filters, DB/Redis health diagnostics, and audit trail outputs.

## Phase 1 - Mobile Foundation

- [x] Create React Native project structure under `/mobile`.
- [x] Configure React Navigation stack/tab skeleton.
- [x] Configure Axios API client with token refresh interceptors.
- [x] Configure Zustand global stores for Auth, Workspaces, and Notifications.
- [x] Build secure JWT token storage persistence layer wrapper.
- [x] Implement theme settings support (Dark/Light provider).
- [x] Construct atomic reusable UI components (Screen, Button, Input, Loading, Empty, Header).
- [x] Write prototype placeholder screens (Splash, Login, Register, Home, Workspace, Posts, Media, Analytics, Notifications, Settings).

## Phase 2 - Authentication & Workspace Lifecycle

- [x] Connect Zustand store login/register actions to backend routes `/auth/login` and `/auth/register`.
- [x] Securely save JWT access and refresh tokens.
- [x] Restructure splash screen with token decoding & `/auth/refresh` validation loops.
- [x] Inject authorization header Bearer token and rotate expired tokens silently.
- [x] Connect workspace list and create actions to `/workspaces` endpoints.
- [x] Construct offline status handling, loader fallbacks, and retry flows.

## Phase 3 - Post Composition, Scheduling & AI Copilot

- [x] Connect CreatePost CRUD endpoints to active workspace context.
- [x] Add character count counters and input boundaries.
- [x] Configure auto-save/restore local draft state logic.
- [x] Integrate scheduling publication endpoint `/schedules` triggers.
- [x] Integrate Gemini caption optimizations, tone tuning, and content expansion/shortening triggers via `/ai/generate`.

## Phase 4 - Media Library & Attachments

- [x] Configure media grid fetching via `/media/workspaces/:workspaceId`.
- [x] Connect multi-part mock file uploading via `/media/upload` API.
- [x] Implement media asset soft deleting via `DELETE /media/:id`.
- [x] Integrate post attachments linking via `POST /media/attach` and detaching via `POST /media/detach`.
- [x] Embed horizontal visual previews inside post editor screen.

## Phase 5 - Analytics Dashboard

- [x] Connect workspace stats overview metrics to `GET /analytics/workspaces/:workspaceId`.
- [x] Connect historical chronological logs to `GET /analytics/workspaces/:workspaceId/history`.
- [x] Implement pull-to-refresh sync handlers pointing to `/analytics/sync`.
- [x] Build summary dashboard grid layout rendering total, scheduled, published, and failed counters.
- [x] Build time-series filters (daily, weekly, monthly logs display).

## Phase 6 - Notification Center

- [x] Connect User notifications listing to `GET /notifications`.
- [x] Implement unread notifications count badge tracking.
- [x] Link patch read-all to `PATCH /notifications/read-all`.
- [x] Link single read patch to `PATCH /notifications/:id/read`.
- [x] Link delete soft-removal triggers to `DELETE /notifications/:id`.
- [x] Configure loader templates and refresh controls.

## Phase 7 - Settings & User Profile

- [x] Connect User details profile fetching to `/users/me`.
- [x] Configure theme switching controls (Light, Dark, System preference selectors).
- [x] Configure theme and default AI tone preference state storage helpers.
- [x] Connect API health status checks to `/health` REST endpoint.
- [x] Configure logout handlers calling `/auth/logout` and clearing local cache.







