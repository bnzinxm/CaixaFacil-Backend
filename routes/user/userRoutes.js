import express from 'express';
import UserController from '../../controllers/user/userController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import adminMiddleware from '../../middlewares/adminMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, UserController.getAllUsers);
router.get('/:id', authMiddleware, UserController.getUserById);
router.put('/:id', authMiddleware, adminMiddleware, UserController.updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, UserController.deleteUser);

export default router;