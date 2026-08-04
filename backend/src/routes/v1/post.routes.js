// =====================================================================
// Post Composition Route Group (post.routes.js)
// =====================================================================

import express from 'express';
import PostController from '../../controllers/PostController.js';
import protect from '../../middleware/auth.middleware.js';
import { validateCreatePost, validateUpdatePost } from '../../validators/post.validator.js';

const router = express.Router();

router.use(protect);

router.post('/', validateCreatePost, PostController.createPost);
router.get('/workspaces/:workspaceId', PostController.getWorkspacePosts);
router.get('/:id', PostController.getPost);
router.patch('/:id', validateUpdatePost, PostController.updatePost);
router.delete('/:id', PostController.deletePost);

export default router;
