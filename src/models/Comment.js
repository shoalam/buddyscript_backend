import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
        index: true
    },
    content: {
        type: String,
        maxLength: 500,
        trim: true,
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for post comments (newest first) and replies (oldest first)
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
