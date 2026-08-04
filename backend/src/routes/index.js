// =====================================================================
// Master API Router Registry (index.js)
// =====================================================================

import express from 'express';

// Import v1 Route submodules
import healthRouter from './v1/health.routes.js';
import versionRouter from './v1/version.routes.js';
import authRouter from './v1/auth.routes.js';
import userRouter from './v1/user.routes.js';
import workspaceRouter from './v1/workspace.routes.js';
import postRouter from './v1/post.routes.js';
import scheduleRouter from './v1/schedule.routes.js';
import analyticsRouter from './v1/analytics.routes.js';
import connectorRouter from './v1/connector.routes.js';
import aiRouter from './v1/ai.routes.js';
import notificationRouter from './v1/notification.routes.js';
import mediaRouter from './v1/media.routes.js';

const rootRouter = express.Router();
const v1Router = express.Router();

// 1. Mount route entities onto the v1 namespace router
v1Router.use('/health', healthRouter);
v1Router.use('/version', versionRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/workspaces', workspaceRouter);
v1Router.use('/posts', postRouter);
v1Router.use('/schedules', scheduleRouter);
v1Router.use('/analytics', analyticsRouter);
v1Router.use('/connectors', connectorRouter);
v1Router.use('/ai', aiRouter);
v1Router.use('/notifications', notificationRouter);
v1Router.use('/media', mediaRouter);

// 2. Mount v1 Namespace Router to Root API Router
rootRouter.use('/api/v1', v1Router);

export default rootRouter;
