import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// @desc    Add a comment or reply
// @route   POST /api/posts/:postId/comments
// @access  Private
export const addComment = async (req, res, next) => {
    try {
        const { content, parentCommentId } = req.body;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }

        const commentData = {
            user: req.user._id,
            post: postId,
            content
        };

        if (parentCommentId) {
            const parent = await Comment.findById(parentCommentId);
            if (!parent) {
                res.status(404);
                throw new Error('Parent comment not found');
            }
            commentData.parentComment = parentCommentId;
        }

        const comment = await Comment.create(commentData);

        // Update post comment count
        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

        res.status(201).json({ success: true, comment });
    } catch (error) {
        next(error);
    }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public/Auth
export const getComments = async (req, res, next) => {
    try {
        const { postId } = req.params;

        // Fetch top-level comments first, then replies separately or using populate
        // For simplicity and performance, we'll fetch all and the client can nest them
        const comments = await Comment.find({ post: postId })
            .populate('user', 'username profilePic')
            .sort({ createdAt: 1 }) // Oldest first for comments
            .lean();

        res.status(200).json({ success: true, count: comments.length, comments });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Owner only)
export const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this comment');
        }

        const postId = comment.post;
        await comment.deleteOne();

        // Update post comment count
        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });

        res.status(200).json({ success: true, message: 'Comment removed' });
    } catch (error) {
        next(error);
    }
};
