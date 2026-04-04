import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String,
        maxLength: 2000,
        trim: true,
        required: true
    },
    mediaUrl: {
        type: String,
        default: ''
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
        index: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound indexes for efficient timeline queries
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
