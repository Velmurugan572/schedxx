# Sched - Mobile-First Social Media Scheduler SaaS

Sched is a commercial, production-grade SaaS platform designed to schedule, manage, and publish content across multiple social platforms (Meta, LinkedIn, X, YouTube, and more) from a native mobile application.

---

## 1. Project Structure

The project is structured as a modular repository containing both API services and client interfaces:

*   `backend/`: Node.js + Express REST API server, utilizing Prisma ORM, BullMQ task workers, and Redis.
*   `mobile/`: React Native mobile client using Zustand for state and MMKV for encrypted storage.
*   `docs/`: Product specification and API design documentation.

---

## 2. Developer Setup

### Prerequisites
*   Node.js (v20 or higher)
*   Docker & Docker Compose
*   Android SDK & Xcode (for React Native development)

### Backend Local Launch
To start the backend infrastructure (PostgreSQL & Redis database containers):
```bash
# Run local containers
docker compose up -d

# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run database setup
npx prisma generate

# Start Express server in development mode
npm run dev
```

### Mobile Client Launch
To configure and launch the React Native client:
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Launch packager
npm start
```

### Running Backend Tests
```bash
npm run test
```

---

## 3. Mobile Client Architecture Summary

The Sched mobile application is designed to consume Sched's production-ready REST API endpoints. It features:
*   **Foundation & State**: Global multi-tenant workspace context and user authentication sessions managed by **Zustand**.
*   **Secure Persistent Cache**: Session JWT tokens are written dynamically to client security scopes using a robust `storage.js` wrapper.
*   **Dynamic Network Interceptors**: Preconfigured **Axios** middleware injecting Bearer authentication headers dynamically, intercepting `401` errors, and executing silent token rotation queries to `/auth/refresh` before retrying failed requests.
*   **Themes**: Complete light/dark/system-wide style settings provider (`theme/index.js`).
*   **UX Features**: Character counters, automatic local draft autosaves/restores, pull-to-refresh sync gestures, and loading/retry/offline fallback card indicators.

---

## 4. License
This project is proprietary and confidential. Refer to the [LICENSE](LICENSE) file for usage boundaries.

