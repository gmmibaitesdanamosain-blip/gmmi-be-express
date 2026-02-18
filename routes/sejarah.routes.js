import express from 'express';
import SejarahController from '../controllers/sejarah.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAdmin } from '../middlewares/role.middleware.js';

import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Get (Public)
router.get('/', SejarahController.getAll);

// Create, Update, Delete (Admin/Super Admin Only)
router.post('/', authenticateToken, isAdmin, upload.single('image'), SejarahController.create);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), SejarahController.update);
router.delete('/:id', authenticateToken, isAdmin, SejarahController.delete);

export default router;
