// =====================================================================
// Platform Connectors Route Boilerplate (connector.routes.js)
// =====================================================================

import express from 'express';
import { sendSuccess } from '../../utils/response.js';

const router = express.Router();

// Scaffolding mount verification route
router.get('/test', (req, res) => {
  sendSuccess(res, { module: 'Platform Connectors' }, 200, 'Platform Connector routes mounted');
});

export default router;
