# Sched Authentication & Authorization Module Documentation

This document describes the design and usage of the **Authentication & Authorization** module (Module 6) for **Sched**. The module is built using Express, Prisma, JWT, and bcrypt, following **Clean Architecture** principles.

---

## 1. Architectural Architecture Layers

The module is structured into isolated, testable layers:

1.  **Request Validators (`backend/src/validators/`)**: Uses `express-validator` to ensure input payloads (e.g. email checks, password length) are clean before entering the business layer.
2.  **Controllers (`backend/src/controllers/`)**: Handles Express routing mappings, extracts payload structures, and delegates actions to service layers.
3.  **Services (`backend/src/services/`)**: Contains the core business logic.
    *   `AuthService`: Manages user credentials verification, access/refresh token issuing, and default workspace provisioning upon user registration.
    *   `WorkspaceService`: Orchestrates workspace creation, listing, updating, soft-deleting, and issuing/accepting invitations.
4.  **Repositories (`backend/src/repositories/`)**: Performs transactional CRUD commands using the Prisma connection instance. Isolates SQL/DB calls from the service logic.

---

## 2. API Endpoints Directory

### 2.1 Public Authentication Endpoints

#### Register User
*   **Method & Path**: `POST /api/v1/auth/register`
*   **Request Body**:
    ```json
    {
      "email": "test_user@sched.com",
      "password": "password123",
      "firstName": "Test",
      "lastName": "User"
    }
    ```
*   **Action**: Hashes the password, saves the user, creates a default workspace (`"Test's Workspace"`), links the user as `OWNER`, and returns JWT access token + refresh token.

#### Login User
*   **Method & Path**: `POST /api/v1/auth/login`
*   **Request Body**:
    ```json
    {
      "email": "test_user@sched.com",
      "password": "password123"
    }
    ```
*   **Response Payload**: Returns user info, short-lived `accessToken`, and rotated `refreshToken`.

#### Refresh Tokens (Rotation)
*   **Method & Path**: `POST /api/v1/auth/refresh`
*   **Request Body**:
    ```json
    {
      "refreshToken": "<long-lived-cryptographic-token-string>"
    }
    ```
*   **Action**: Verifies token state, invalidates/revokes the old token, and returns a new access/refresh token pair.

#### Logout User
*   **Method & Path**: `POST /api/v1/auth/logout`
*   **Request Body**:
    ```json
    {
      "refreshToken": "<active-refresh-token>"
    }
    ```
*   **Action**: Revokes the refresh token.

---

### 2.2 Protected User Profile Endpoints

#### Get My Profile
*   **Method & Path**: `GET /api/v1/users/me`
*   **Headers**: `Authorization: Bearer <access_token>`
*   **Response**: Returns user profile fields (excludes passwordHash).

---

### 2.3 Protected Workspace & Invitation Endpoints

All endpoints below require a valid `Bearer <access_token>` header.

#### Create Workspace
*   **Method & Path**: `POST /api/v1/workspaces`
*   **Request Body**: `{ "name": "New Team Workspace" }`
*   **Response**: Returns the created workspace. Creator automatically becomes `OWNER`.

#### List Workspaces
*   **Method & Path**: `GET /api/v1/workspaces`
*   **Response**: Returns a list of active workspaces the user belongs to.

#### Read Workspace
*   **Method & Path**: `GET /api/v1/workspaces/:id`
*   **Permissions Check**: Accessible to `OWNER`, `ADMIN`, `MEMBER`, or `EDITOR`.

#### Update Workspace Name
*   **Method & Path**: `PATCH /api/v1/workspaces/:id`
*   **Request Body**: `{ "name": "Modified Name" }`
*   **Permissions Check**: Accessible only to `OWNER` or `ADMIN`.

#### Delete Workspace (Soft-Delete)
*   **Method & Path**: `DELETE /api/v1/workspaces/:id`
*   **Permissions Check**: Restricted to `OWNER`.
*   **Action**: Marks `deletedAt` timestamp; excludes it from search lookups.

#### Invite User to Workspace
*   **Method & Path**: `POST /api/v1/workspaces/:id/invitations`
*   **Request Body**:
    ```json
    {
      "email": "invitee@sched.com",
      "role": "ADMIN" // can be ADMIN, MEMBER, EDITOR
    }
    ```
*   **Permissions Check**: Restricted to `OWNER` or `ADMIN`.
*   **Action**: Generates a secure invitation token (expires in 7 days).

#### Accept Invitation
*   **Method & Path**: `POST /api/v1/workspaces/invitations/:token/accept`
*   **Action**: Binds user membership, changes status to accepted. Requires matching email.

#### Decline Invitation
*   **Method & Path**: `POST /api/v1/workspaces/invitations/:token/decline`
*   **Action**: Revokes and deletes the invitation.

---

## 3. Verification & Testing

To run the authentication and workspace integration tests:
```bash
npm run test
```
This runs the Jest suite in band using PostgreSQL cascade truncates, guaranteeing test isolation and clean executions.
