import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    targetType: {
        type: String,
        required: true,
        enum: ['Post', 'Comment'],
        index: true
    },
    reactionType: {
        type: String,
        required: true,
        enum: ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry'],
        default: 'Like',
        index: true
    }
}, {
    timestamps: true
});

// A user can like a specific post or comment only once
likeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;
