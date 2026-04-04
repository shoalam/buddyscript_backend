import Post from '../models/Post.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
    try {
        const { content, visibility } = req.body;
        const mediaUrl = req.file ? req.file.path : req.body.mediaUrl;

        if (!content && !mediaUrl) {
            res.status(400);
            throw new Error('Post must have content or media');
        }

        const post = await Post.create({
            user: req.user._id,
            content,
            mediaUrl: mediaUrl || '',
            visibility: visibility || 'public'
        });

        res.status(201).json({ success: true, post });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all posts (Timeline)
// @route   GET /api/posts
// @access  Public/Auth
export const getPosts = async (req, res, next) => {
    try {
        const query = {
            $or: [
                { visibility: 'public' },
                { user: req.user?._id }
            ]
        };

        const posts = await Post.find(query)
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ success: true, count: posts.length, posts });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public/Auth
export const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', 'username profilePic');

        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }

        // Check visibility
        if (post.visibility === 'private' && post.user._id.toString() !== req.user?._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this post');
        }

        res.status(200).json({ success: true, post });
    } catch (error) {
        next(error);
    }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (Owner only)
export const updatePost = async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }

        if (post.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this post');
        }

        post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, post });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Owner only)
export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }

        if (post.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this post');
        }

        await post.deleteOne();

        res.status(200).json({ success: true, message: 'Post removed' });
    } catch (error) {
        next(error);
    }
};
