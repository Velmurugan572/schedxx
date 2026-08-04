// =====================================================================
// Scheduling Rules Route Group (schedule.routes.js)
// =====================================================================

import express from 'express';
import ScheduleController from '../../controllers/ScheduleController.js';
import protect from '../../middleware/auth.middleware.js';
import { validateCreateSchedule } from '../../validators/schedule.validator.js';

const router = express.Router();

router.use(protect);

router.post('/', validateCreateSchedule, ScheduleController.createSchedule);
router.get('/workspace/:workspaceId', ScheduleController.getWorkspaceSchedules);
router.get('/:id', ScheduleController.getSchedule);
router.delete('/:id', ScheduleController.deleteSchedule);

export default router;
