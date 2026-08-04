// =====================================================================
// Version Information Route (version.routes.js)
// =====================================================================

import express from 'express';
import { sendSuccess } from '../../utils/response.js';
import { env } from '../../config/env.js';

const router = express.Router();

router.get('/', (req, res) => {
  const versionData = {
    apiVersion: '1.0.0',
    appVersion: '1.0.0', // Mobile app counterpart version mapping
    nodeVersion: process.version,
    environment: env.nodeEnv
  };

  sendSuccess(res, versionData, 200, 'Version check completed');
});

export default router;
