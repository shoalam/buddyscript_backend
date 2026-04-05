import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // 1. Check for token in the 'token' cookie
    token = req.cookies.token;

    // 2. Check for token in the 'Authorization' header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }


    if (token) {

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the database, excluding the password
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
};

// Admin middleware
export const admin = (req, res, next) => {
    if (req.user && req.user.roles.includes('admin')) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};
