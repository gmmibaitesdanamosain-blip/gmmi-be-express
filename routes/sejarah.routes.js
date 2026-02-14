import express from 'express';
import SejarahController from '../controllers/sejarah.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';

import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Get (Public)
router.get('/', SejarahController.getAll);

// Create, Update, Delete (Super Admin Only)
router.post('/', authenticateToken, isSuperAdmin, upload.single('image'), SejarahController.create);
router.put('/:id', authenticateToken, isSuperAdmin, upload.single('image'), SejarahController.update);
router.delete('/:id', authenticateToken, isSuperAdmin, SejarahController.delete);

export default router;
