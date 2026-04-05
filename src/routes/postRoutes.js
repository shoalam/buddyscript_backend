import express from 'express';
import { 
    createPost, 
    getPosts, 
    getPostById, 
    updatePost, 
    deletePost 
} from '../controllers/postController.js';
import { 
    addComment, 
    getComments, 
    deleteComment 
} from '../controllers/commentController.js';
import { 
    toggleLike, 
    getLikers 
} from '../controllers/likeController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Post Routes
router.route('/')
    .get(optionalProtect, getPosts)
    .post(protect, upload.single('image'), createPost);

router.route('/:id')
    .get(optionalProtect, getPostById)
    .put(protect, updatePost)
    .delete(protect, deletePost);

// Comment Routes
router.route('/:postId/comments')
    .post(protect, addComment)
    .get(getComments);

router.delete('/comments/:id', protect, deleteComment);

// Like Routes
router.route('/:targetId/likes')
    .post(protect, toggleLike)
    .get(getLikers);

export default router;
