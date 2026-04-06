import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import jwt from 'jsonwebtoken';


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { username, firstName, lastName, email, password } = registerSchema.parse(req.body);

        const userExists = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (userExists) {
            res.status(400);
            throw new Error('User with this email or username already exists');
        }

        const user = await User.create({
            username,
            firstName,
            lastName,
            email,
            password
        });

        if (user) {
            const { token, refreshToken } = generateToken(res, user._id);
            res.status(201).json({
                success: true,
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                roles: user.roles,
                token,
                refreshToken
            });

        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            const { token, refreshToken } = generateToken(res, user._id);
            res.json({
                success: true,
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                roles: user.roles,
                token,
                refreshToken
            });

        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401);
            throw new Error('Not authorized, no refresh token');
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401);
            throw new Error('Not authorized, user not found');
        }

        const { token } = generateToken(res, user._id);

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        res.status(401);
        next(new Error('Not authorized, refresh token failed'));
    }
};


// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    const user = {
        _id: req.user._id,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        roles: req.user.roles,
        bio: req.user.bio,
        profilePic: req.user.profilePic
    };
    res.status(200).json({ success: true, user });
};
