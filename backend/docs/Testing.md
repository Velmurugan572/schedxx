# Sched Testing Documentation

This document describes the testing architecture, testing suites layout, database isolation protocols, and linter checks for **Sched**.

---

## 1. Testing Framework (Jest + Supertest)

Sched uses **Jest** as its test runner and **Supertest** to execute integration tests against Express routers.

### 1.1 Test Configuration
All configurations reside in `backend/jest.config.js`:
*   **Environment**: Node.js (`testEnvironment: 'node'`).
*   **Module Engine**: Run natively under ES Modules (`transform: {}`).
*   **Target Glob**: Matches files inside `backend/src/tests/**/*.test.js`.

### 1.2 Execution Commands
To run the full test suite in band:
```bash
cd backend
npm run test
```

---

## 2. Database Isolation (Cascade Truncate Strategy)

To guarantee test isolation, tests run against a dedicated testing database and clean all tables before or after each test block.

### Clean DB Utility
Instead of rebuilding tables (`migrate reset`), we run SQL truncates. We truncate all tables using database transaction loops:
```javascript
const truncateDatabase = async () => {
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename === '_prisma_migrations') continue;
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
    );
  }
};
```
*This is executed in the `beforeEach` hook of database integration tests (like Auth and Workspace tests) to ensure clean test states.*

---

## 3. Mocking & Dependencies

### 3.1 Redis Caching & Queues
In unit tests, we mock Redis connections using libraries like `ioredis-mock` or mock the queue services directly (`jest.mock(...)`) to avoid port collisions and keep test runs fast.

### 3.2 External Network Integrations (Social APIs)
Tests for social connectors (Meta, LinkedIn, X, YouTube) mock the network layer (e.g. using `nock` or Jest mock functions) to test payload mapping and error handling without making real HTTP requests.

---

## 4. Code Quality & Formatting Gates

We use ESLint and Prettier to verify syntax and enforce code styling rules before code is committed.

### 4.1 Linter Auditing
To check for syntax errors or code smell violations:
```bash
npm run lint
```
*Rule configurations reside in `backend/.eslintrc.json`.*

### 4.2 Formatter Alignment
To automatically align code spacing, quotes, and brackets:
```bash
npm run format
```
*Conventions reside in `backend/.prettierrc`.*
