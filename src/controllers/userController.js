import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            if (req.file) {
                // Correct forward slashes for URL compatibility
                user.profilePic = req.file.path.replace(/\\/g, '/');
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                profilePic: updatedUser.profilePic,
                roles: updatedUser.roles
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (excluding current)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('username profilePic')
            .limit(10);

        res.status(200).json({ success: true, users });
    } catch (error) {
        next(error);
    }
};
