import Like from '../models/Like.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';


// @desc    Toggle Like for a post or comment
// @route   POST /api/likes/:targetId
// @access  Private
export const toggleLike = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const { targetType, reactionType = 'Like' } = req.body; 

        if (!['Post', 'Comment'].includes(targetType)) {
            res.status(400);
            throw new Error('Invalid targetType');
        }

        const TargetModel = targetType === 'Post' ? Post : Comment;
        const target = await TargetModel.findById(targetId);

        if (!target) {
            res.status(404);
            throw new Error(`${targetType} not found`);
        }

        const alreadyLiked = await Like.findOne({
            user: req.user._id,
            targetId,
            targetType
        });

        if (alreadyLiked) {
            if (alreadyLiked.reactionType === reactionType) {
                // Same reaction: Unlike
                await alreadyLiked.deleteOne();
                await TargetModel.findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });
                
                // Remove notification if exists
                await Notification.findOneAndDelete({ 
                    sender: req.user._id, 
                    targetId, 
                    type: 'like' 
                });

                res.status(200).json({ success: true, message: 'Unliked successfully' });
            } else {
                // Different reaction: Update type
                alreadyLiked.reactionType = reactionType;
                await alreadyLiked.save();
                res.status(200).json({ success: true, message: `Changed to ${reactionType}`, reactionType });
            }
        } else {
            // New reaction
            await Like.create({
                user: req.user._id,
                targetId,
                targetType,
                reactionType
            });
            await TargetModel.findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } });
            
            // Create notification if target owner is not the liker
            if (target.user.toString() !== req.user._id.toString()) {
                await Notification.create({
                    recipient: target.user,
                    sender: req.user._id,
                    type: 'like',
                    targetType,
                    targetId
                });
            }

            res.status(201).json({ success: true, message: `Reacted with ${reactionType}`, reactionType });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get Likers for a post or comment
// @route   GET /api/likes/:targetId
// @access  Public/Auth
export const getLikers = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const { targetType } = req.query;

        const query = { targetId };
        if (targetType) query.targetType = targetType;

        const likers = await Like.find(query)
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 })
            .lean();

        // Count categories
        const countsByReaction = likers.reduce((acc, curr) => {
            acc[curr.reactionType] = (acc[curr.reactionType] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({ success: true, count: likers.length, likers, countsByReaction });
    } catch (error) {
        next(error);
    }
};
