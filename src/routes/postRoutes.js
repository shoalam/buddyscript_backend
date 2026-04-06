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
    updateComment,
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
    .get(protect, getPosts)
    .post(protect, upload.single('image'), createPost);

router.route('/:id')
    .get(protect, getPostById)
    .put(protect, upload.single('image'), updatePost)
    .delete(protect, deletePost);

// Comment Routes
router.route('/:postId/comments')
    .post(protect, addComment)
    .get(protect, getComments);

router.route('/comments/:id')
    .put(protect, updateComment)
    .delete(protect, deleteComment);

// Like Routes
router.route('/:targetId/likes')
    .post(protect, toggleLike)
    .get(protect, getLikers);

export default router;
