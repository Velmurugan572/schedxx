# Sched Deployment Documentation

This document describes the production deployment pipeline, containerization guidelines, database migration management, and system configurations for **Sched**.

---

## 1. Containerization (Docker)

Sched utilizes a multi-stage compilation flow to keep production containers small, secure, and fast.

### 1.1 Local Dev Cluster
To build and launch all services (PostgreSQL, Redis, and Express Dev Server) in a local container network:
```bash
docker compose up --build
```
*   **Host Port Bindings**:
    *   API Backend: `3000`
    *   PostgreSQL: `5432`
    *   Redis Cache: `6379`

### 1.2 Production Builds (`Dockerfile`)
Our `backend/Dockerfile` runs a clean npm setup using Alpine Linux, copying only production code and generating Prisma client binaries:
1.  **Dependencies Stage**: Installs development and production packages via `npm ci`.
2.  **Prisma Generator**: Compiles schema client engines inside the container workspace.
3.  **Runner Stage**: Copies generated directories to a clean Alpine Node image, keeping final size under ~150MB.

---

## 2. Production Environment Variables Checklist

The following variables must be configured on your target deployment platform (e.g. AWS ECS, Render, or DigitalOcean App Platform):

| Variable Name | Required Format | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables file logs, secures stack traces, and minimizes debugging console messages. |
| `PORT` | `3000` | Port Express binds to. |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Production PostgreSQL connection string. |
| `REDIS_URL` | `redis://user:pass@host:6379` | Production Redis URL for task queues. |
| `JWT_SECRET` | Cryptographic string | Private key for signing access tokens. |
| `ENCRYPTION_KEY` | 32-character string | Master symmetric key for encrypting integration credentials. |

---

## 3. Database Migration Deployment

During deployment updates, database migrations must be applied **before** starting new application containers.

### Deployment Script Order
Configure your CI/CD runner (e.g. GitHub Actions) or deploy platform hook to execute the following scripts in order:

1.  **Prisma Migration Deploy**:
    ```bash
    npx prisma migrate deploy
    ```
    *(Note: `migrate deploy` is safer in production than `migrate dev` as it runs pending migrations without asking for user confirmation).*
2.  **Generate Client**:
    ```bash
    npx prisma generate
    ```
3.  **Start Container**:
    ```bash
    npm run start
    ```

---

## 4. Production Security Guidelines

*   **SSL/TLS Termination**: All API routes must run behind HTTPS. Configure your proxy (like Nginx, Cloudflare, or AWS ALB) to terminate SSL and reject non-HTTPS requests.
*   **Helmet Security**: Express uses Helmet to set security headers:
    *   Blocks Clickjacking (`X-Frame-Options`)
    *   Blocks Cross-Site Scripting (`X-XSS-Protection`)
    *   Blocks MIME Sniffing (`X-Content-Type-Options`)
*   **CORS Configuration**: Restrict the `origin` property in `src/app.js` to your mobile application's API scheme or specific Web domain, rather than keeping the wildcard default `*`.
*   **Structured Logging**: In production, Winston writes structured JSON log entries to `/logs/error.log` and `/logs/combined.log`. Connect these file outputs to log collectors (like Datadog, Logstash, or CloudWatch) for monitoring.
