# Project Context

## Current implementation status

- Module 6: Authentication, authorization, workspace creation, invitations, and workspace membership management are implemented.
- Module 7: Post Management is implemented as the first post-composition workflow for the backend.
- Module 8: Connector Platform SDK and Scheduling Engine are implemented and verified.
- Module 9: AI Engine Integration (Gemini 1.5 Flash content generation/optimization) is implemented and verified.
- Module 10: Publishing Engine (dispatching posts, error retries, and failure auditing) is implemented and verified.
- Module 11: Analytics Engine (fetching metrics from connectors, tracking workspace/post performance, and historical data retrieval) is implemented and verified.
- Module 12: Notification System (in-app notifications, user preferences, read tracking, soft deletion, and automatic failure alerts integrated with FailureHandler) is implemented and verified.
- Module 13: Media Engine (workspace media library, local filesystem storage, upload/soft-delete workflows, and draft post media attachments) is implemented and verified.
- Module 14: Production Readiness (CORS headers limits, Helmet headers, express-rate-limiting, DB/Redis connection diagnostics, database audit logging, graceful signal shutdowns, multi-stage Docker builds, and GitHub Actions CI pipelines) is implemented and verified.
- Phase 1 (Mobile Foundation): Mobile project structure, React Navigation skeleton, Axios dynamic client with rotation interceptors, Zustand storage stores, custom Theme providers, reusable UI components, and mock screens are implemented.
- Phase 2 (Authentication & Workspace Lifecycle): Implemented secure JWT session persistence, auto refresh token rotation on 401s, user signup/signin endpoints connection, session restoring on start, and real workspaces listing/creation.
- Phase 3 (Post Composition, Scheduling & AI Copilot): Implemented CRUD operations for posts synced with active workspaces, character counter indicators, automatic local autosave/restore buffers, post scheduling queues, and Gemini AI caption optimization integrations.
- Phase 4 (Media Library & Attachments): Integrated file uploading/listing/deleting linked to workspaces, support for grid visual media previews, and attachment linking/unlinking inside post composition routes.
- Phase 5 (Analytics Dashboard): Implemented workspace metrics overview counters, chronological performance log history listing, post-level analytics tracking hooks, and pull-to-refresh data synchronizations.
- Phase 6 (Notification Center): Connected User notifications listing endpoints, unread notifications counts tracking, marking single/all logs read, soft-deletions syncing, and pull-to-refresh list updates.
- Phase 7 (Settings & User Profile): Integrated user profile retrieval endpoint, support for theme switching (light/dark/system) saved locally, AI tone preference configurations, system health check queries, and session logout controls.








## Architecture notes

- The backend follows a layered architecture with routes, controllers, services, repositories, validators, and Prisma persistence.
- Post Management is implemented through the same structure used by Auth and Workspace modules.
