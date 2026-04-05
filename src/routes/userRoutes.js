import express from 'express';
import { updateUserProfile, getUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.put('/profile', protect, upload.single('profilePic'), updateUserProfile);
router.get('/', protect, getUsers);

export default router;
