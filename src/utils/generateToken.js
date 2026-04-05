import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    // 1. Create Access Token (short-lived)
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    });

    // 2. Create Refresh Token (long-lived)
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    });

    // 3. Set Access Token Cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: parseInt(process.env.JWT_ACCESS_COOKIE_MAX_AGE, 10) || 15 * 60 * 1000 // default 15 mins
    });

    // 4. Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: parseInt(process.env.JWT_REFRESH_COOKIE_MAX_AGE, 10) || 30 * 24 * 60 * 60 * 1000 // default 30 days
    });

    return { token, refreshToken };
};


export default generateToken;
