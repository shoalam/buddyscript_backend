import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';


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

        let notificationRecipient = null;
        let targetTypeForNotification = 'Post';
        let targetIdForNotification = postId;

        if (parentCommentId) {
            const parent = await Comment.findById(parentCommentId);
            if (!parent) {
                res.status(404);
                throw new Error('Parent comment not found');
            }
            commentData.parentComment = parentCommentId;
            notificationRecipient = parent.user;
            targetTypeForNotification = 'Comment';
            targetIdForNotification = parentCommentId;
        } else {
            notificationRecipient = post.user;
        }

        let comment = await Comment.create(commentData);
        
        // Populate user for the front-end to show details immediately
        comment = await comment.populate('user', 'username firstName lastName profilePic');

        // Update post comment count
        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

        // Dispatch Notification
        if (notificationRecipient.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: notificationRecipient,
                sender: req.user._id,
                type: 'comment',
                targetType: targetTypeForNotification,
                targetId: targetIdForNotification
            });
        }

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
            .populate('user', 'username firstName lastName profilePic')
            .sort({ createdAt: 1 }) // Oldest first for comments
            .lean();

        res.status(200).json({ success: true, count: comments.length, comments });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a comment
// @route   PUT /api/posts/comments/:id
// @access  Private (Owner only)
export const updateComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this comment');
        }

        comment.content = req.body.content || comment.content;
        await comment.save();

        res.status(200).json({ success: true, comment });
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

        // Recursive deletion helper
        const deleteRecursive = async (commentId) => {
            const replies = await Comment.find({ parentComment: commentId });
            let count = 1; // Count the current comment
            for (const reply of replies) {
                count += await deleteRecursive(reply._id);
            }
            await Comment.findByIdAndDelete(commentId);
            return count;
        };

        const totalDeleted = await deleteRecursive(comment._id);

        // Update post comment count (decrement by total deleted items)
        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -totalDeleted } });

        res.status(200).json({ success: true, message: 'Comment and its replies removed' });
    } catch (error) {
        next(error);
    }
};
