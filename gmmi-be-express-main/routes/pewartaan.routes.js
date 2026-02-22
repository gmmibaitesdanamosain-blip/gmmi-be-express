import express from 'express';
import multer from 'multer';
import PewartaanController from '../controllers/pewartaan.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// Multer config - memory storage untuk Appwrite
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file PDF dan Word (.doc, .docx) yang diizinkan'));
        }
    }
});

const uploadFields = upload.fields([
    { name: 'file_word', maxCount: 1 },
    { name: 'file_pdf', maxCount: 1 }
]);

// Public
router.get('/', authenticateToken, PewartaanController.getAll);
router.get('/:id', authenticateToken, PewartaanController.getById);

// Admin & Super Admin
router.post('/', authenticateToken, isAdmin, uploadFields, PewartaanController.create);
router.put('/:id', authenticateToken, isAdmin, uploadFields, PewartaanController.update);
router.patch('/:id/status', authenticateToken, isAdmin, PewartaanController.updateStatus);
router.delete('/:id', authenticateToken, isAdmin, PewartaanController.delete);

export default router;