// =====================================================================
// Media Engine Routes (media.routes.js)
// =====================================================================

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import protect from '../../middleware/auth.middleware.js';
import MediaController from '../../controllers/MediaController.js';
import {
  validateUpload,
  validateListMedia,
  validateDeleteMedia,
  validateAttachment
} from '../../validators/media.validator.js';

// Ensure uploads folder exists in the root directory
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = express.Router();

router.use(protect);

// POST /api/v1/media/upload - Upload file and register asset
router.post('/upload', upload.single('file'), validateUpload, MediaController.uploadAsset);

// GET /api/v1/media/workspaces/:workspaceId - Retrieve all workspace media
router.get('/workspaces/:workspaceId', validateListMedia, MediaController.listWorkspaceMedia);

// DELETE /api/v1/media/:id - Soft delete media asset
router.delete('/:id', validateDeleteMedia, MediaController.deleteAsset);

// POST /api/v1/media/attach - Attach media asset to a post
router.post('/attach', validateAttachment, MediaController.attachToPost);

// POST /api/v1/media/detach - Detach media asset from a post
router.post('/detach', validateAttachment, MediaController.detachFromPost);

export default router;
