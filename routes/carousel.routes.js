import express from 'express';
import CarouselController from '../controllers/carousel.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAdmin } from '../middlewares/role.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Public route to get active slides
router.get('/', CarouselController.getAll);

// Admin routes
router.get('/admin', authenticateToken, isAdmin, CarouselController.getAllAdmin);
router.post('/', authenticateToken, isAdmin, upload.single('image'), CarouselController.create);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), CarouselController.update);
router.delete('/:id', authenticateToken, isAdmin, CarouselController.delete);

export default router;
