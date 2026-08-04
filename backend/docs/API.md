# Sched API Documentation

This document describes the REST API architecture, request/response conventions, and initial endpoint specifications for Sched.

---

## 1. REST API Conventions

### 1.1 Endpoint Structure
All API routes are grouped under the `/api` prefix and versioned using the `/v1` namespace:
`http://localhost:3000/api/v1/...`

### 1.2 Protocol & Formats
*   **Protocol**: HTTPS (enforced via Helmet header configurations in production).
*   **Payload Format**: JSON (`application/json`) is required for all request bodies.
*   **Uptime Monitoring**: Load balancers should target `/api/v1/health` for health checks.

---

## 2. Standardized JSON Responses

To ensure seamless parsing on client applications (such as our React Native mobile client), all API endpoints return a standardized envelope schema.

### 2.1 Success Envelope Schema
Every successful endpoint execution returns HTTP status code `200`, `201`, or `204`, with a JSON body in the following format:
```json
{
  "success": true,
  "message": "Action successfully completed",
  "data": {
    "id": "8b5e28a4-0c24-4f05-9502-d9e030282b8f",
    "email": "user@sched.com"
  },
  "error": null
}
```

### 2.2 Error Envelope Schema
Any thrown operational error or unhandled exception is caught by the global error handler middleware, resulting in a standard error envelope:
```json
{
  "success": false,
  "message": "Friendly error summary description suitable for user interface display",
  "data": null,
  "error": {
    "statusCode": 404,
    "status": "fail",
    "stack": "Error: AppError... (Only visible in development environment)"
  }
}
```

---

## 3. Diagnostic & System Endpoints

### 3.1 Health Check
Returns the current health status, server uptime, and active environment.

*   **URL**: `/api/v1/health`
*   **Method**: `GET`
*   **Auth Required**: No
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
          "success": true,
          "message": "System is healthy",
          "data": {
            "status": "UP",
            "uptime": 12.345,
            "timestamp": "2026-07-15T08:10:00.000Z",
            "version": "1.0.0",
            "environment": "development"
          },
          "error": null
        }
        ```

### 3.2 Version Check
Returns API and App counterpart version details.

*   **URL**: `/api/v1/version`
*   **Method**: `GET`
*   **Auth Required**: No
*   **Success Response**:
    *   **Code**: `200 OK`
    *   **Content**:
        ```json
        {
          "success": true,
          "message": "Version check completed",
          "data": {
            "apiVersion": "1.0.0",
            "appVersion": "1.0.0",
            "nodeVersion": "v20.11.0",
            "environment": "development"
          },
          "error": null
        }
        ```

---

## 4. Feature Module Endpoint Previews (Scaffolded)

These route groupings exist in `backend/src/routes/v1/` and are registered as boilerplate routers awaiting implementation in future modules:

| Route Group | Base Path | Purpose | Future Phase |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | Login, Register, Logout, Session token rotation | Phase 3 |
| **Users** | `/api/v1/users` | Profile retrieval and profile editing | Phase 3 |
| **Workspaces** | `/api/v1/workspaces` | Workspace creation, listing, team invites | Phase 3 |
| **Posts** | `/api/v1/posts` | Draft creation, media attachment uploads | Phase 7 |
| **Schedules** | `/api/v1/schedules` | Booking/dispatch timetable controls | Phase 5 |
| **Connectors** | `/api/v1/connectors` | Social platform channel OAuth links | Phase 4 |
| **AI Engine** | `/api/v1/ai` | Gemini copilot suggestions and translates | Phase 5 |
| **Analytics** | `/api/v1/analytics` | Reach/engagement metrics aggregation | Phase 8 |
